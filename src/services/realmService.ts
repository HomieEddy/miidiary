import * as Crypto from "expo-crypto";
import Realm from "realm";
import { EntryRealmSchema } from "@/models/EntryRealm";
import {
  getRealmKeyMetadata,
  setRealmKeyMetadata,
} from "@/services/secureStorageService";
import { getRealmKey, resetRealmKey, setRealmKey } from "@/services/keychainService";

let realmInstance: Realm | null = null;

async function resolveEncryptionKey(): Promise<Uint8Array> {
  const metadata = getRealmKeyMetadata();
  const existingKey = await getRealmKey();

  if (metadata && existingKey) {
    return existingKey;
  }

  if ((metadata && !existingKey) || (!metadata && existingKey)) {
    await resetRealmKey();
    throw new Error("Realm key metadata mismatch");
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
    realmInstance = await Realm.open({
      path: "miidiary.realm",
      schema: [EntryRealmSchema],
      schemaVersion: 2,
      encryptionKey,
      onMigration: () => {
        // Migration rules are explicit and additive only.
      },
    });

    return realmInstance;
  } catch {
    realmInstance = null;
    throw new Error("Unable to open encrypted Realm");
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
