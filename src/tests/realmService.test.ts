const mockGetRealmKeyMetadata = jest.fn();
const mockSetRealmKeyMetadata = jest.fn();
const mockGetRealmKey = jest.fn();
const mockSetRealmKey = jest.fn();
const mockResetRealmKey = jest.fn();
const mockOpen = jest.fn();
const mockGetRandomBytes = jest.fn();

jest.mock("@/services/secureStorageService", () => ({
  getRealmKeyMetadata: (...args: unknown[]) => mockGetRealmKeyMetadata(...args),
  setRealmKeyMetadata: (...args: unknown[]) => mockSetRealmKeyMetadata(...args),
}));

jest.mock("@/services/keychainService", () => ({
  getRealmKey: (...args: unknown[]) => mockGetRealmKey(...args),
  setRealmKey: (...args: unknown[]) => mockSetRealmKey(...args),
  resetRealmKey: (...args: unknown[]) => mockResetRealmKey(...args),
}));

jest.mock("expo-crypto", () => ({
  getRandomBytes: (...args: unknown[]) => mockGetRandomBytes(...args),
}));

jest.mock("realm", () => ({
  __esModule: true,
  default: {
    open: (...args: unknown[]) => mockOpen(...args),
    deleteFile: jest.fn(),
  },
}));

import { __resetRealmForTests, getRealmInstance } from "@/services/realmService";
import Realm from "realm";

describe("realmService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    __resetRealmForTests();
  });

  it("generates and persists key when metadata is missing", async () => {
    const generated = Uint8Array.from({ length: 64 }, (_, i) => i);
    mockGetRealmKeyMetadata.mockReturnValue(null);
    mockGetRealmKey.mockResolvedValue(null);
    mockGetRandomBytes.mockReturnValue(generated);
    mockOpen.mockResolvedValue({ isClosed: false, close: jest.fn() });

    await getRealmInstance();

    expect(mockSetRealmKey).toHaveBeenCalledWith(generated);
    expect(mockSetRealmKeyMetadata).toHaveBeenCalled();
    expect(mockOpen).toHaveBeenCalledWith(
      expect.objectContaining({ encryptionKey: generated }),
    );
  });

  it("reuses stored key when metadata exists", async () => {
    const stored = Uint8Array.from({ length: 64 }, (_, i) => i + 1);
    mockGetRealmKeyMetadata.mockReturnValue({ keyId: "1", version: 1 });
    mockGetRealmKey.mockResolvedValue(stored);
    mockOpen.mockResolvedValue({ isClosed: false, close: jest.fn() });

    await getRealmInstance();

    expect(mockSetRealmKey).not.toHaveBeenCalled();
    expect(mockOpen).toHaveBeenCalledWith(
      expect.objectContaining({ encryptionKey: stored }),
    );
  });

  it("recovers when metadata and keychain disagree", async () => {
    const regenerated = Uint8Array.from({ length: 64 }, (_, i) => i + 3);
    const deleteFileSpy = jest.spyOn(Realm, "deleteFile");

    mockGetRealmKeyMetadata.mockReturnValue({ keyId: "1", version: 1 });
    mockGetRealmKey.mockResolvedValue(null);
    mockGetRandomBytes.mockReturnValue(regenerated);
    mockOpen.mockResolvedValue({ isClosed: false, close: jest.fn() });

    await getRealmInstance();

    expect(mockResetRealmKey).toHaveBeenCalled();
    expect(mockSetRealmKeyMetadata).toHaveBeenCalledWith(null);
    expect(deleteFileSpy).toHaveBeenCalledWith({ path: "miidiary.realm" });
    expect(mockSetRealmKey).toHaveBeenCalledWith(regenerated);
    expect(mockOpen).toHaveBeenCalledWith(
      expect.objectContaining({ encryptionKey: regenerated }),
    );
  });

  it("recovers by regenerating key and reopening when initial encrypted open fails", async () => {
    const stored = Uint8Array.from({ length: 64 }, (_, i) => i + 1);
    const regenerated = Uint8Array.from({ length: 64 }, (_, i) => i + 2);
    const deleteFileSpy = jest.spyOn(Realm, "deleteFile");

    mockGetRealmKeyMetadata
      .mockReturnValueOnce({ keyId: "1", version: 1 })
      .mockReturnValueOnce(null);
    mockGetRealmKey
      .mockResolvedValueOnce(stored)
      .mockResolvedValueOnce(null);
    mockGetRandomBytes.mockReturnValue(regenerated);
    mockOpen
      .mockRejectedValueOnce(new Error("bad key"))
      .mockResolvedValueOnce({ isClosed: false, close: jest.fn() });

    await getRealmInstance();

    expect(mockResetRealmKey).toHaveBeenCalled();
    expect(mockSetRealmKeyMetadata).toHaveBeenCalledWith(null);
    expect(deleteFileSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        encryptionKey: stored,
        path: "miidiary.realm",
      }),
    );
    expect(mockSetRealmKey).toHaveBeenCalledWith(regenerated);
    expect(mockOpen).toHaveBeenCalledTimes(2);
  });

  it("shares one open operation across concurrent callers", async () => {
    const stored = Uint8Array.from({ length: 64 }, (_, i) => i + 1);
    const openedRealm = { isClosed: false, close: jest.fn() };
    let resolveOpen: ((realm: typeof openedRealm) => void) | undefined;

    mockGetRealmKeyMetadata.mockReturnValue({ keyId: "1", version: 1 });
    mockGetRealmKey.mockResolvedValue(stored);
    mockOpen.mockReturnValue(
      new Promise((resolve) => {
        resolveOpen = resolve;
      }),
    );

    const first = getRealmInstance();
    const second = getRealmInstance();

    await Promise.resolve();
    await Promise.resolve();

    expect(mockOpen).toHaveBeenCalledTimes(1);

    if (!resolveOpen) {
      throw new Error("Expected Realm.open promise resolver to be captured");
    }

    resolveOpen(openedRealm);

    await expect(Promise.all([first, second])).resolves.toEqual([
      openedRealm,
      openedRealm,
    ]);
    expect(mockSetRealmKey).not.toHaveBeenCalled();
  });
});
