import React from "react";
import { render } from "@testing-library/react-native";
import { ProcessingState } from "@/components/ui/ProcessingState";

let mockReducedMotion = false;
const mockWithRepeat = jest.fn((val: unknown) => val);
const mockCancelAnimation = jest.fn();

jest.mock("@/i18n", () => ({
  useLocale: () => ({ t: (key: string) => key, locale: "en", setLocale: jest.fn() }),
  i18n: { t: (key: string) => key },
}));

jest.mock("@/stores/recordingStore", () => ({
  useRecordingStore: (selector: (state: unknown) => unknown) =>
    selector({ processingStage: "transcribing" }),
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

describe("ProcessingState", () => {
  beforeEach(() => {
    mockReducedMotion = false;
    jest.clearAllMocks();
  });

  it("renders static dots without starting the pulse loop under reduced motion", () => {
    mockReducedMotion = true;

    render(<ProcessingState visible />);

    expect(mockWithRepeat).not.toHaveBeenCalled();
  });

  it("cancels the pulse loop when reduced motion flips on at runtime", () => {
    const { rerender } = render(<ProcessingState visible />);
    expect(mockWithRepeat).toHaveBeenCalled();

    const loopsStarted = mockWithRepeat.mock.calls.length;
    mockReducedMotion = true;
    rerender(<ProcessingState visible />);

    expect(mockCancelAnimation).toHaveBeenCalled();
    expect(mockWithRepeat.mock.calls.length).toBe(loopsStarted);
  });
});
