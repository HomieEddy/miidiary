import * as Keychain from "react-native-keychain";

const KEYCHAIN_SERVICE = "miidiary.realm.encryption-key";

function encodeBytes(bytes: Uint8Array): string {
  return Array.from(bytes).join(",");
}

function decodeBytes(serialized: string): Uint8Array {
  if (!serialized.trim()) {
    return new Uint8Array();
  }

  return Uint8Array.from(serialized.split(",").map((value) => Number(value)));
}

export async function getRealmKey(): Promise<Uint8Array | null> {
  const credentials = await Keychain.getGenericPassword({
    service: KEYCHAIN_SERVICE,
  });

  if (!credentials) {
    return null;
  }

  const key = decodeBytes(credentials.password);
  return key.length === 64 ? key : null;
}

export async function setRealmKey(key: Uint8Array): Promise<void> {
  if (key.length !== 64) {
    throw new Error("Realm key must be 64 bytes");
  }

  await Keychain.setGenericPassword("realm", encodeBytes(key), {
    service: KEYCHAIN_SERVICE,
    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

export async function resetRealmKey(): Promise<void> {
  await Keychain.resetGenericPassword({ service: KEYCHAIN_SERVICE });
}
