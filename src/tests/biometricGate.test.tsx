import type { PropsWithChildren } from "react";
import { act, render, waitFor, fireEvent } from "@testing-library/react-native";
import { Text } from "react-native";

const mockHasHardwareAsync = jest.fn();
const mockIsEnrolledAsync = jest.fn();
const mockAuthenticateAsync = jest.fn();

jest.mock("expo-local-authentication", () => ({
  hasHardwareAsync: (...args: unknown[]) => mockHasHardwareAsync(...args),
  isEnrolledAsync: (...args: unknown[]) => mockIsEnrolledAsync(...args),
  authenticateAsync: (...args: unknown[]) => mockAuthenticateAsync(...args),
}));

import { BiometricGate } from "@/components/ui/BiometricGate";

function Wrapper({ children }: PropsWithChildren): JSX.Element {
  return <BiometricGate>{children}</BiometricGate>;
}

describe("BiometricGate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHasHardwareAsync.mockResolvedValue(true);
    mockIsEnrolledAsync.mockResolvedValue(true);
  });

  it("blocks children until authentication succeeds", async () => {
    mockAuthenticateAsync.mockResolvedValue({ success: true });
    const { queryByText } = render(
      <Wrapper>
        <Text>Protected content</Text>
      </Wrapper>,
    );

    expect(queryByText("Protected content")).toBeNull();

    await waitFor(() => {
      expect(queryByText("Protected content")).toBeTruthy();
    });
  });

  it("uses fallback-capable authenticate call", async () => {
    mockAuthenticateAsync.mockResolvedValue({ success: true });
    render(
      <Wrapper>
        <Text>Protected content</Text>
      </Wrapper>,
    );

    await waitFor(() => {
      expect(mockAuthenticateAsync).toHaveBeenCalledWith(
        expect.objectContaining({ disableDeviceFallback: false }),
      );
    });
  });

  it("keeps lock screen on cancelled auth and allows retry", async () => {
    mockAuthenticateAsync
      .mockResolvedValueOnce({ success: false })
      .mockResolvedValue({ success: true });

    const { getByLabelText, queryByText } = render(
      <Wrapper>
        <Text>Protected content</Text>
      </Wrapper>,
    );

    await waitFor(() => {
      expect(queryByText("Protected content")).toBeNull();
    });

    await waitFor(() => {
      expect(mockAuthenticateAsync).toHaveBeenCalled();
    });

    await act(async () => {
      fireEvent.press(getByLabelText("Retry unlock"));
    });

    await waitFor(() => {
      expect(queryByText("Protected content")).toBeTruthy();
    });
  });
});
