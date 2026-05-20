import * as Crypto from "expo-crypto";
import Realm from "realm";
import { EntryRealmSchema } from "@/models/EntryRealm";
import {
  getRealmKeyMetadata,
  setRealmKeyMetadata,
} from "@/services/secureStorageService";
import { getRealmKey, resetRealmKey, setRealmKey } from "@/services/keychainService";

let realmInstance: Realm | null = null;
const REALM_PATH = "miidiary.realm";

function buildRealmConfig(encryptionKey: Uint8Array): Realm.Configuration {
  return {
    path: REALM_PATH,
    schema: [EntryRealmSchema],
    schemaVersion: 3,
    encryptionKey,
    onMigration: (oldRealm, newRealm) => {
      if (oldRealm.schemaVersion < 3) {
        const entries = newRealm.objects("Entry");
        for (const entry of entries) {
          (entry as unknown as { isCompleted: boolean }).isCompleted = false;
        }
      }
    },
  };
}

async function resetEncryptedRealmState(): Promise<void> {
  await resetRealmKey();
  setRealmKeyMetadata(null);

  try {
    Realm.deleteFile({ path: REALM_PATH });
  } catch {
    // Best-effort cleanup; key reset still allows retry with a fresh key.
  }
}

async function resolveEncryptionKey(): Promise<Uint8Array> {
  const metadata = getRealmKeyMetadata();
  const existingKey = await getRealmKey();

  if (metadata && existingKey) {
    return existingKey;
  }

  if ((metadata && !existingKey) || (!metadata && existingKey)) {
    await resetEncryptedRealmState();
  }

  const generated = Crypto.getRandomBytes(64);
  await setRealmKey(generated);
  setRealmKeyMetadata({
    keyId: String(Date.now()),
    version: 1,
  });

  return generated;
}

export async function getRealmInstance(): Promise<Realm> {
  if (realmInstance) {
    return realmInstance;
  }

  const encryptionKey = await resolveEncryptionKey();

  if (encryptionKey.length !== 64) {
    throw new Error("Invalid Realm encryption key length");
  }

  try {
    realmInstance = await Realm.open(buildRealmConfig(encryptionKey));

    return realmInstance;
  } catch {
    realmInstance = null;

    await resetEncryptedRealmState();

    try {
      const regeneratedKey = await resolveEncryptionKey();
      if (regeneratedKey.length !== 64) {
        throw new Error("Invalid Realm encryption key length");
      }

      realmInstance = await Realm.open(buildRealmConfig(regeneratedKey));
      return realmInstance;
    } catch {
      realmInstance = null;
      throw new Error("Unable to open encrypted Realm");
    }
  }
}

export function closeRealmInstance(): void {
  if (realmInstance && !realmInstance.isClosed) {
    realmInstance.close();
  }

  realmInstance = null;
}

export function __resetRealmForTests(): void {
  closeRealmInstance();
}
