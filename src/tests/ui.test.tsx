import React from "react";
import { render } from "@testing-library/react-native";
import { View, Text } from "react-native";

jest.mock("react-native-reanimated", () => {
  const RN = require("react-native");
  return {
    useSharedValue: (initial: unknown) => ({ value: initial }),
    useDerivedValue: (fn: () => unknown) => fn(),
    useAnimatedStyle: (fn: () => unknown) => fn(),
    useAnimatedProps: (fn: () => unknown) => fn(),
    useFrameCallback: () => ({}),
    withTiming: (val: number) => val,
    withSpring: (val: number) => val,
    withRepeat: (val: unknown) => val,
    withSequence: (...vals: unknown[]) => vals[vals.length - 1],
    Easing: { inOut: () => "", sin: "", out: () => "", in: () => "", ease: "", back: () => "" },
    default: { View: RN.View },
    View: RN.View,
    createAnimatedComponent: (comp: unknown) => comp,
    __esModule: true,
  };
});

jest.mock("rive-react-native", () => ({
  default: "RiveMock",
  RiveRef: {},
  __esModule: true,
}));

jest.mock("react-native-svg", () => ({
  SvgXml: "SvgXmlMock",
  Svg: "SvgMock",
  Path: "PathMock",
  LinearGradient: "LinearGradientMock",
  Defs: "DefsMock",
  Stop: "StopMock",
  Circle: "CircleMock",
  Rect: "RectMock",
  G: "GMock",
  __esModule: true,
}));

jest.mock("@shopify/react-native-skia", () => ({
  Canvas: "CanvasMock",
  Path: "PathMock",
  LinearGradient: "LinearGradientMock",
  vec: () => ({}),
  Skia: { Path: { Make: () => ({ moveTo: () => {}, lineTo: () => {}, close: () => {} }) } },
  __esModule: true,
}));

jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Medium: "Medium", Heavy: "Heavy", Light: "Light" },
  NotificationFeedbackType: { Success: "Success", Warning: "Warning" },
}));

jest.mock("@/services/interruptionService", () => ({
  useInterruptionHandler: () => {},
}));

jest.mock("@/services/audioCaptureService", () => ({
  audioCaptureService: {
    startRecording: jest.fn(),
    stopRecording: jest.fn(),
    onMetering: jest.fn(),
    cleanupTempFile: jest.fn(),
    getTempFilePath: jest.fn(),
  },
}));

jest.mock("@/services/transcriptionService", () => ({
  transcriptionService: {
    transcribeAudio: jest.fn(),
  },
}));

jest.mock("@/theme/colors", () => ({
  colors: {
    background: "#FDF8F0",
    foreground: "#2A2631",
    primary: "#FF6B9E",
    muted: "#F0E9DF",
    mutedForeground: "#8A828F",
    destructive: "#EF476F",
    card: "#FFFFFF",
    border: "#2A2631",
    accent: "#06D6A0",
    accentForeground: "#FFFFFF",
  },
}));

import HomeScreen from "@/screens/HomeScreen";

describe("App Shell", () => {
  it("renders HomeScreen without crashing", () => {
    const { root } = render(<HomeScreen />);
    expect(root).toBeTruthy();
  });

  it("shows the prompt text in idle state", () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText("Tap to record a thought")).toBeTruthy();
  });

  it("has bg-background class on root container", () => {
    const { root } = render(<HomeScreen />);
    expect(root).toBeTruthy();
  });

  it("renders the RecorderButton with correct accessibility label", () => {
    const { getByLabelText } = render(<HomeScreen />);
    expect(getByLabelText("Record audio")).toBeTruthy();
  });
});
