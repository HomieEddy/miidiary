import React from "react";
import { render } from "@testing-library/react-native";
import { GlowRing } from "@/components/ui/GlowRing";

let mockReducedMotion = false;
const mockWithRepeat = jest.fn((val: unknown) => val);
const mockCancelAnimation = jest.fn();

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

describe("GlowRing", () => {
  beforeEach(() => {
    mockReducedMotion = false;
    jest.clearAllMocks();
  });

  it("renders a static ring without starting the pulse loop under reduced motion", () => {
    mockReducedMotion = true;

    render(<GlowRing isActive />);

    expect(mockWithRepeat).not.toHaveBeenCalled();
  });

  it("starts the pulse loop normally and cancels it when reduced motion flips on", () => {
    const { rerender } = render(<GlowRing isActive />);
    expect(mockWithRepeat).toHaveBeenCalled();

    const loopsStarted = mockWithRepeat.mock.calls.length;
    mockReducedMotion = true;
    rerender(<GlowRing isActive />);

    expect(mockCancelAnimation).toHaveBeenCalled();
    expect(mockWithRepeat.mock.calls.length).toBe(loopsStarted);
  });
});
