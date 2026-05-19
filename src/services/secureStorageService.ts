import { createMMKV } from "react-native-mmkv";

const REALM_KEY_METADATA_KEY = "realm.key.metadata.v1";

export interface RealmKeyMetadata {
  keyId: string;
  version: number;
}

export const secureStorage = createMMKV({ id: "miidiary.secure" });

export function getRealmKeyMetadata(): RealmKeyMetadata | null {
  const raw = secureStorage.getString(REALM_KEY_METADATA_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as RealmKeyMetadata;

    if (!parsed.keyId || !parsed.version) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function setRealmKeyMetadata(metadata: RealmKeyMetadata | null): void {
  if (metadata === null) {
    secureStorage.delete(REALM_KEY_METADATA_KEY);
    return;
  }

  secureStorage.set(REALM_KEY_METADATA_KEY, JSON.stringify(metadata));
}
