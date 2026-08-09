import React from "react";
import { render } from "@testing-library/react-native";
import { DailySparkCard } from "@/components/ui/DailySparkCard";

let mockQuotes: string[] = ["First prompt", "Second prompt"];
let mockReducedMotion = false;
const mockWithRepeat = jest.fn((val: unknown) => val);
const mockCancelAnimation = jest.fn();

jest.mock("@/i18n", () => ({
  useLocale: () => ({ t: (key: string) => key, locale: "en", setLocale: jest.fn() }),
  i18n: { t: (key: string) => (key === "home.quotes" ? mockQuotes : key) },
}));

jest.mock("expo-linear-gradient", () => ({
  LinearGradient: "LinearGradientMock",
}));

jest.mock("expo-image", () => ({
  Image: "ImageMock",
}));

jest.mock("react-native-reanimated", () => {
  const RN = require("react-native");
  return {
    useSharedValue: (initial: unknown) => ({ value: initial }),
    useAnimatedStyle: (fn: () => unknown) => fn(),
    useReducedMotion: () => mockReducedMotion,
    cancelAnimation: (...args: unknown[]) => mockCancelAnimation(...args),
    withDelay: (_ms: number, value: unknown) => value,
    withTiming: (val: number) => val,
    withSpring: (val: number) => val,
    withRepeat: (...args: unknown[]) => (mockWithRepeat as (...a: unknown[]) => unknown)(...args),
    withSequence: (...vals: unknown[]) => vals[vals.length - 1],
    Easing: { inOut: () => "", sin: "", out: () => "", in: () => "", cubic: "", ease: "", back: () => "" },
    default: { View: RN.View },
    View: RN.View,
    createAnimatedComponent: (comp: unknown) => comp,
    __esModule: true,
  };
});

describe("DailySparkCard", () => {
  beforeEach(() => {
    mockQuotes = ["First prompt", "Second prompt"];
    mockReducedMotion = false;
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("restarts the prompt rotation when the prompts array changes (locale switch)", () => {
    jest.useFakeTimers();
    const setIntervalSpy = jest.spyOn(global, "setInterval");
    const clearIntervalSpy = jest.spyOn(global, "clearInterval");

    const { rerender } = render(<DailySparkCard />);
    expect(setIntervalSpy).toHaveBeenCalledTimes(1);

    // A locale switch produces a new array reference with the same length;
    // the rotation interval must re-arm against the new prompts.
    mockQuotes = ["French un", "French deux"];
    rerender(<DailySparkCard />);

    expect(clearIntervalSpy).toHaveBeenCalled();
    expect(setIntervalSpy).toHaveBeenCalledTimes(2);
  });

  it("cancels the float loop when reduced motion flips on at runtime", () => {
    const { rerender } = render(<DailySparkCard />);
    expect(mockWithRepeat).toHaveBeenCalled();

    const loopsStarted = mockWithRepeat.mock.calls.length;
    mockReducedMotion = true;
    rerender(<DailySparkCard />);

    expect(mockCancelAnimation).toHaveBeenCalled();
    expect(mockWithRepeat.mock.calls.length).toBe(loopsStarted);
  });
});
