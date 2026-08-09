import React from "react";
import { render } from "@testing-library/react-native";
import { ShimmerView } from "@/components/ui/ShimmerView";

let mockReducedMotion = false;
const mockWithRepeat = jest.fn((val: unknown) => val);
const mockCancelAnimation = jest.fn();

jest.mock("expo-linear-gradient", () => ({
  LinearGradient: "LinearGradientMock",
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

describe("ShimmerView", () => {
  beforeEach(() => {
    mockReducedMotion = false;
    jest.clearAllMocks();
  });

  it("renders a static placeholder without starting the sweep under reduced motion", () => {
    mockReducedMotion = true;

    render(<ShimmerView />);

    expect(mockWithRepeat).not.toHaveBeenCalled();
  });

  it("cancels the sweep loop when reduced motion flips on at runtime", () => {
    const { rerender } = render(<ShimmerView />);
    expect(mockWithRepeat).toHaveBeenCalled();

    const sweepsStarted = mockWithRepeat.mock.calls.length;
    mockReducedMotion = true;
    rerender(<ShimmerView />);

    expect(mockCancelAnimation).toHaveBeenCalled();
    expect(mockWithRepeat.mock.calls.length).toBe(sweepsStarted);
  });
});
