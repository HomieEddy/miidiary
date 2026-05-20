import React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import { RecorderButton } from "@/components/ui/RecorderButton";
import { useRecordingStore } from "@/stores/recordingStore";

const mockImpactAsync = jest.fn();
const mockNotificationAsync = jest.fn();

jest.mock("react-native-reanimated", () => {
  const RN = require("react-native");
  return {
    useSharedValue: (initial: unknown) => ({ value: initial }),
    useAnimatedStyle: (fn: () => unknown) => fn(),
    withSpring: (value: unknown, _config?: unknown, callback?: () => void) => {
      callback?.();
      return value;
    },
    default: { View: RN.View },
    __esModule: true,
  };
});

jest.mock("expo-haptics", () => ({
  impactAsync: (...args: unknown[]) => mockImpactAsync(...args),
  notificationAsync: (...args: unknown[]) => mockNotificationAsync(...args),
  ImpactFeedbackStyle: { Medium: "Medium" },
  NotificationFeedbackType: { Success: "Success" },
}));

jest.mock("react-native-svg", () => ({
  SvgXml: "SvgXmlMock",
}));

jest.mock("@/theme/colors", () => ({
  colors: {
    primary: "#FF6B9E",
  },
}));

describe("RecorderButton", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useRecordingStore.getState().reset();
  });

  it("still starts recording when stale processing is set", async () => {
    const onStartRecording = jest.fn();
    useRecordingStore.getState().setProcessing(true);

    const { getByLabelText } = render(
      <RecorderButton
        onStartRecording={onStartRecording}
        onStopRecording={jest.fn()}
      />,
    );

    await act(async () => {
      fireEvent.press(getByLabelText("Record audio"));
    });

    expect(onStartRecording).toHaveBeenCalled();
  });

  it("does not start while model readiness disables the button", async () => {
    const onStartRecording = jest.fn();

    const { getByLabelText } = render(
      <RecorderButton
        disabled
        onStartRecording={onStartRecording}
        onStopRecording={jest.fn()}
      />,
    );

    await act(async () => {
      fireEvent.press(getByLabelText("Record audio"));
    });

    expect(onStartRecording).not.toHaveBeenCalled();
  });

  it("still stops recording when processing is set during recording", async () => {
    const onStopRecording = jest.fn();
    useRecordingStore.getState().setRecording(true);
    useRecordingStore.getState().setProcessing(true);

    const { getByLabelText } = render(
      <RecorderButton
        onStartRecording={jest.fn()}
        onStopRecording={onStopRecording}
      />,
    );

    await act(async () => {
      fireEvent.press(getByLabelText("Stop recording"));
    });

    expect(onStopRecording).toHaveBeenCalled();
  });
});
