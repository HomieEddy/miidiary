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
  },
}));

import { __resetRealmForTests, getRealmInstance } from "@/services/realmService";

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

  it("fails closed when metadata and keychain disagree", async () => {
    mockGetRealmKeyMetadata.mockReturnValue({ keyId: "1", version: 1 });
    mockGetRealmKey.mockResolvedValue(null);

    await expect(getRealmInstance()).rejects.toThrow("Realm key metadata mismatch");
    expect(mockOpen).not.toHaveBeenCalled();
    expect(mockResetRealmKey).toHaveBeenCalled();
  });
});
