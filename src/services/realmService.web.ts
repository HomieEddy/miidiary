type UnsupportedRealm = {
  objectForPrimaryKey: () => never;
  objects: () => never;
  write: () => never;
  close: () => void;
  isClosed: boolean;
};

function realmWebError(): Error {
  return new Error("Realm storage is not supported on web builds for this app.");
}

export async function getRealmInstance(): Promise<UnsupportedRealm> {
  throw realmWebError();
}

export function closeRealmInstance(): void {
  // No-op on web.
}

export function __resetRealmForTests(): void {
  // No-op on web.
}
