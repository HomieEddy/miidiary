import React from "react";
import { act, render } from "@testing-library/react-native";
import { TranscriptionResult } from "@/components/ui/TranscriptionResult";

const mockSetProcessing = jest.fn();
const mockEntries: unknown[] = [
  {
    id: "e1",
    text: "hello",
    category: "note",
    createdAt: "2026-08-09T10:00:00.000Z",
  },
];

jest.mock("@/i18n", () => ({
  useLocale: () => ({ t: (key: string) => key, locale: "en", setLocale: jest.fn() }),
  i18n: { t: (key: string) => key },
}));

jest.mock("@/stores/entriesStore", () => ({
  useEntriesStore: (selector: (state: { entries: unknown[] }) => unknown) =>
    selector({ entries: mockEntries }),
}));

jest.mock("@/stores/recordingStore", () => ({
  useRecordingStore: (selector: (state: unknown) => unknown) =>
    selector({ setProcessing: mockSetProcessing, isProcessing: false }),
}));

jest.mock("react-native-reanimated", () => {
  const RN = require("react-native");
  return {
    useSharedValue: (initial: unknown) => ({ value: initial }),
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

describe("TranscriptionResult", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("clears the nested hide timer on unmount so no stale write fires", () => {
    jest.useFakeTimers();
    const { unmount } = render(<TranscriptionResult visible />);

    // Outer 4000ms timer fires -> arms the nested 350ms hide timer.
    act(() => {
      jest.advanceTimersByTime(4000);
    });

    unmount();

    act(() => {
      jest.advanceTimersByTime(350);
    });

    expect(mockSetProcessing).not.toHaveBeenCalled();
    jest.useRealTimers();
  });

  it("does not fire the stale hide timer after visible flips false", () => {
    jest.useFakeTimers();
    const { rerender } = render(<TranscriptionResult visible />);

    act(() => {
      jest.advanceTimersByTime(4000);
    });

    // A newer session hides the result; the old nested timer must die.
    rerender(<TranscriptionResult visible={false} />);

    act(() => {
      jest.advanceTimersByTime(350);
    });

    expect(mockSetProcessing).not.toHaveBeenCalled();
    jest.useRealTimers();
  });

  it("completes the hide sequence and clears processing when left mounted", () => {
    jest.useFakeTimers();
    render(<TranscriptionResult visible />);

    act(() => {
      jest.advanceTimersByTime(4350);
    });

    expect(mockSetProcessing).toHaveBeenCalledWith(false);
    jest.useRealTimers();
  });
});
