import React from "react";
import { render } from "@testing-library/react-native";
import { ErrorBanner } from "@/components/ui/ErrorBanner";

const sharedValueObjects = new Map<unknown, { value: unknown }>();
const mockUseSharedValue = jest.fn((initial: unknown) => {
  let sv = sharedValueObjects.get(initial);
  if (!sv) {
    sv = { value: initial };
    sharedValueObjects.set(initial, sv);
  }
  return sv;
});
const mockSetError = jest.fn();

jest.mock("@/i18n", () => ({
  useLocale: () => ({ t: (key: string) => key, locale: "en", setLocale: jest.fn() }),
  i18n: { t: (key: string) => key },
}));

jest.mock("@/stores/recordingStore", () => ({
  useRecordingStore: (selector: (state: unknown) => unknown) =>
    selector({ errorMessage: "Disk full", setError: mockSetError }),
}));

jest.mock("expo-haptics", () => ({
  notificationAsync: jest.fn(),
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Medium: "Medium", Heavy: "Heavy", Light: "Light" },
  NotificationFeedbackType: { Success: "Success", Warning: "Warning" },
}));

jest.mock("react-native-svg", () => ({
  SvgXml: "SvgXmlMock",
  __esModule: true,
}));

jest.mock("react-native-reanimated", () => {
  const RN = require("react-native");
  return {
    useSharedValue: (initial: unknown) => mockUseSharedValue(initial),
    useAnimatedStyle: (fn: () => unknown) => fn(),
    useReducedMotion: () => false,
    withDelay: (_ms: number, value: unknown) => value,
    withTiming: (val: number) => val,
    withSpring: (val: number) => val,
    withRepeat: (val: unknown) => val,
    withSequence: (...vals: unknown[]) => vals[vals.length - 1],
    Easing: { inOut: () => "", sin: "", out: () => "", in: () => "", cubic: "", ease: "", back: () => "" },
    default: { View: RN.View },
    View: RN.View,
    createAnimatedComponent: (comp: unknown) => comp,
    __esModule: true,
  };
});

describe("ErrorBanner", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("resets shared values to the entrance state when visible flips false", () => {
    const { rerender } = render(<ErrorBanner visible={false} />);

    const sharedValues = mockUseSharedValue.mock.results.map(
      (result) => result.value as { value: number },
    );
    const opacity = sharedValues.find((sv) => sv.value === 0);
    const translateX = sharedValues.find((sv) => sv.value === -20);
    expect(opacity).toBeDefined();
    expect(translateX).toBeDefined();

    // First showing: entrance animation runs (withTiming passthrough).
    rerender(<ErrorBanner visible />);
    expect(opacity?.value).toBe(1);
    expect(translateX?.value).toBe(0);

    // Hiding must reset to the initial values so the 2nd showing
    // animates in again instead of re-animating 1 -> 1.
    rerender(<ErrorBanner visible={false} />);
    expect(opacity?.value).toBe(0);
    expect(translateX?.value).toBe(-20);
  });
});
