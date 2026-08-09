import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { OnboardingOverlay } from "@/components/ui/OnboardingOverlay";
import { getPref } from "@/services/appPrefsService";

jest.mock("react-native-reanimated", () => {
  const { View: MockView } = require("react-native");
  return {
    useSharedValue: (initial: unknown) => ({ value: initial }),
    useAnimatedStyle: (fn: () => unknown) => fn(),
    useReducedMotion: () => false,
    withDelay: (_ms: number, value: unknown) => value,
    withSpring: (val: number) => val,
    ReduceMotion: { Always: "always" },
    Easing: { out: () => "", cubic: "", in: () => "", inOut: () => "", sin: "", back: () => "" },
    FadeIn: { duration: () => ({}) },
    FadeOut: { duration: () => ({}) },
    __esModule: true,
    default: { View: MockView },
    View: MockView,
  };
});

jest.mock("react-native-svg", () => ({
  SvgXml: "SvgXmlMock",
}));

jest.mock("expo-haptics", () => ({
  notificationAsync: jest.fn(),
  NotificationFeedbackType: { Success: "success" },
}));

describe("OnboardingOverlay", () => {
  it("renders the first slide when onboarding has not been seen", () => {
    const { getByText } = render(<OnboardingOverlay />);

    expect(getByText("Capture in a tap")).toBeTruthy();
    expect(getByText("Start capturing")).toBeTruthy();
  });

  it("renders nothing when onboarding was completed before", () => {
    const { setPref } = require("@/services/appPrefsService");
    setPref("onboarding_seen", "1");

    const { queryByText } = render(<OnboardingOverlay />);

    expect(queryByText("Capture in a tap")).toBeNull();

    // Reset for other tests.
    setPref("onboarding_seen", "reset");
  });

  it("marks onboarding as seen when Start is pressed", () => {
    const { setPref } = require("@/services/appPrefsService");
    setPref("onboarding_seen", "reset");

    const { getByText, queryByText } = render(<OnboardingOverlay />);
    expect(getByText("Capture in a tap")).toBeTruthy();

    fireEvent.press(getByText("Start capturing"));

    expect(getPref("onboarding_seen")).toBe("1");
    expect(queryByText("Capture in a tap")).toBeNull();
  });
});
