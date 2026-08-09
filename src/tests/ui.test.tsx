import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import { View, Text } from "react-native";

const mockPrepareDefaultModel = jest.fn();

const enteringChain = () => {
  const chain: Record<string, () => unknown> = {
    duration: () => chain,
    springify: () => chain,
    damping: () => chain,
    stiffness: () => chain,
    delay: () => chain,
    mass: () => chain,
  };
  return chain;
};

jest.mock("react-native-reanimated", () => {
  const RN = require("react-native");
  return {
    useSharedValue: (initial: unknown) => ({ value: initial }),
    useDerivedValue: (fn: () => unknown) => fn(),
    useAnimatedStyle: (fn: () => unknown) => fn(),
    useAnimatedProps: (fn: () => unknown) => fn(),
    useFrameCallback: () => ({}),
    useReducedMotion: () => false,
    withDelay: (_ms: number, value: unknown) => value,
    cancelAnimation: () => {},
    withTiming: (val: number) => val,
    withSpring: (val: number) => val,
    withRepeat: (val: unknown) => val,
    withSequence: (...vals: unknown[]) => vals[vals.length - 1],
    Easing: { inOut: () => "", sin: "", out: () => "", in: () => "", ease: "", back: () => "" },
    FadeIn: enteringChain(),
    FadeInDown: enteringChain(),
    FadeInUp: enteringChain(),
    FadeOut: enteringChain(),
    ZoomIn: enteringChain(),
    default: { View: RN.View },
    View: RN.View,
    createAnimatedComponent: (comp: unknown) => comp,
    __esModule: true,
  };
});

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

jest.mock("@/services/backgroundTaskService", () => ({
  initializeBackgroundProcessing: jest.fn(async () => undefined),
  setBackgroundProcessors: jest.fn(),
}));

jest.mock("@/services/audioCaptureService", () => ({
  audioCaptureService: {
    startRecording: jest.fn(),
    stopRecording: jest.fn(),
    onMetering: jest.fn(),
    cleanupTempFile: jest.fn(),
    getTempFilePath: jest.fn(),
    getPendingProcessingUris: jest.fn(() => []),
    markProcessingComplete: jest.fn(),
  },
}));

jest.mock("@/services/transcriptionService", () => ({
  transcriptionService: {
    transcribeAudio: jest.fn(),
  },
}));

jest.mock("@/services/entriesRepository", () => ({
  entriesRepository: {
    createEntry: jest.fn(),
  },
}));

jest.mock("@/services/modelManager", () => ({
  modelManager: {
    prepareDefaultModel: (...args: unknown[]) => mockPrepareDefaultModel(...args),
    syncModelsForBackground: jest.fn(async () => true),
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
  beforeEach(() => {
    jest.clearAllMocks();
    mockPrepareDefaultModel.mockResolvedValue({
      language: "en",
      modelPath: "file:///model.bin",
      fallbackUsed: false,
    });
  });

  it("renders HomeScreen without crashing", async () => {
    const { root } = render(<HomeScreen />);
    await waitFor(() => expect(root).toBeTruthy());
    expect(root).toBeTruthy();
  });

  it("shows the prompt text in idle state", async () => {
    const { getByText } = render(<HomeScreen />);
    await waitFor(() => expect(getByText("Tap to record a thought")).toBeTruthy());
    expect(getByText("Tap to record a thought")).toBeTruthy();
  });

  it("shows model preparation helper on launch", async () => {
    mockPrepareDefaultModel.mockReturnValue(new Promise(() => undefined));

    const { getByText } = render(<HomeScreen />);
    expect(getByText("Preparing voice model")).toBeTruthy();
  });

  it("renders app shell root container", async () => {
    const { root } = render(<HomeScreen />);
    await waitFor(() => expect(root).toBeTruthy());
    expect(root).toBeTruthy();
  });

  it("renders the RecorderButton with correct accessibility label", async () => {
    const { getByLabelText } = render(<HomeScreen />);
    await waitFor(() => expect(getByLabelText("Record audio")).toBeTruthy());
    expect(getByLabelText("Record audio")).toBeTruthy();
  });
});
