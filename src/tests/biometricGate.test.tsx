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

function Wrapper({ children }: PropsWithChildren): React.ReactElement {
  return <BiometricGate>{children}</BiometricGate>;
}

describe("BiometricGate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHasHardwareAsync.mockResolvedValue(true);
    mockIsEnrolledAsync.mockResolvedValue(true);
  });

  it("keeps lock overlay until authentication succeeds", async () => {
    mockAuthenticateAsync.mockResolvedValue({ success: true });
    const { queryByLabelText, queryByText } = render(
      <Wrapper>
        <Text>Protected content</Text>
      </Wrapper>,
    );

    // Lock overlay is shown while content is gated.
    expect(queryByLabelText("Retry unlock")).toBeTruthy();

    await waitFor(() => {
      expect(queryByLabelText("Retry unlock")).toBeNull();
    });

    // Protected content is rendered once unlocked.
    expect(queryByText("Protected content")).toBeTruthy();
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

    const { getByLabelText, queryByLabelText } = render(
      <Wrapper>
        <Text>Protected content</Text>
      </Wrapper>,
    );

    await waitFor(() => {
      expect(queryByLabelText("Retry unlock")).toBeTruthy();
    });

    await waitFor(() => {
      expect(mockAuthenticateAsync).toHaveBeenCalled();
    });

    await act(async () => {
      fireEvent.press(getByLabelText("Retry unlock"));
    });

    await waitFor(() => {
      expect(queryByLabelText("Retry unlock")).toBeNull();
    });
  });

  it("renders children without an auth prompt when hardware is missing", async () => {
    mockHasHardwareAsync.mockResolvedValue(false);

    const { queryByLabelText, queryByText } = render(
      <Wrapper>
        <Text>Protected content</Text>
      </Wrapper>,
    );

    await waitFor(() => {
      expect(queryByLabelText("Retry unlock")).toBeNull();
    });

    expect(queryByText("Protected content")).toBeTruthy();
    expect(mockAuthenticateAsync).not.toHaveBeenCalled();
  });

  it("renders children without an auth prompt when nothing is enrolled", async () => {
    mockIsEnrolledAsync.mockResolvedValue(false);

    const { queryByLabelText, queryByText } = render(
      <Wrapper>
        <Text>Protected content</Text>
      </Wrapper>,
    );

    await waitFor(() => {
      expect(queryByLabelText("Retry unlock")).toBeNull();
    });

    expect(queryByText("Protected content")).toBeTruthy();
    expect(mockAuthenticateAsync).not.toHaveBeenCalled();
  });
});
