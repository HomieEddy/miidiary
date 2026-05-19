const REALM_KEY_METADATA_KEY = "realm.key.metadata.v1";

export interface RealmKeyMetadata {
  keyId: string;
  version: number;
}

class MemoryStorage {
  private readonly store = new Map<string, string>();

  getString(key: string): string | undefined {
    return this.store.get(key);
  }

  set(key: string, value: string): void {
    this.store.set(key, value);
  }
}

export const secureStorage = new MemoryStorage();

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

export function setRealmKeyMetadata(metadata: RealmKeyMetadata): void {
  secureStorage.set(REALM_KEY_METADATA_KEY, JSON.stringify(metadata));
}
