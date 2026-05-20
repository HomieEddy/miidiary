const mockGetString = jest.fn();
const mockRemove = jest.fn();
const mockSet = jest.fn();

jest.mock("react-native-mmkv", () => ({
  createMMKV: jest.fn(() => ({
    getString: (...args: unknown[]) => mockGetString(...args),
    remove: (...args: unknown[]) => mockRemove(...args),
    set: (...args: unknown[]) => mockSet(...args),
  })),
}));

import {
  getRealmKeyMetadata,
  setRealmKeyMetadata,
} from "@/services/secureStorageService";

describe("secureStorageService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("removes Realm key metadata with MMKV remove", () => {
    setRealmKeyMetadata(null);

    expect(mockRemove).toHaveBeenCalledWith("realm.key.metadata.v1");
  });

  it("returns parsed Realm key metadata", () => {
    mockGetString.mockReturnValue(JSON.stringify({ keyId: "key-1", version: 1 }));

    expect(getRealmKeyMetadata()).toEqual({ keyId: "key-1", version: 1 });
  });
});
