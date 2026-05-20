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
    expect(deleteFileSpy).toHaveBeenCalledWith({ path: "miidiary.realm" });
    expect(mockSetRealmKey).toHaveBeenCalledWith(regenerated);
    expect(mockOpen).toHaveBeenCalledTimes(2);
  });
});
