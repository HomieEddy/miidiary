import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { View } from "react-native";
import { PaperTabBar } from "@/components/ui/PaperTabBar";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";

const mockEmit = jest.fn();
const mockNavigate = jest.fn();

jest.mock("react-native-reanimated", () => {
  const { View: MockRNView } = require("react-native");
  return {
    useSharedValue: (initial: unknown) => ({ value: initial }),
    useAnimatedStyle: (fn: () => unknown) => fn(),
    useReducedMotion: () => false,
    withDelay: (_ms: number, value: unknown) => value,
    withSpring: (val: number) => val,
    ReduceMotion: { Always: "always" },
    Easing: { out: () => "", cubic: "", in: () => "", inOut: () => "", sin: "", back: () => "" },
    __esModule: true,
    default: { View: MockRNView },
    View: MockRNView,
  };
});

const mockIcon = jest.fn(() => <View testID="tab-icon" />);

function makeProps(activeIndex = 0): BottomTabBarProps {
  const routes = [
    { key: "index", name: "index" },
    { key: "diary", name: "diary" },
    { key: "tasks", name: "tasks" },
    { key: "digests", name: "digests" },
  ];
  const descriptors = Object.fromEntries(
    routes.map((route) => [
      route.key,
      {
        options: {
          title: route.name,
          tabBarIcon: mockIcon,
        },
      },
    ]),
  ) as unknown as BottomTabBarProps["descriptors"];

  return {
    state: { index: activeIndex, routes } as unknown as BottomTabBarProps["state"],
    descriptors: descriptors as unknown as BottomTabBarProps["descriptors"],
    navigation: {
      emit: mockEmit,
      navigate: mockNavigate,
    } as unknown as BottomTabBarProps["navigation"],
    insets: { top: 0, left: 0, right: 0, bottom: 0 },
  };
}

describe("PaperTabBar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEmit.mockReturnValue({ defaultPrevented: false });
  });

  it("renders one tab per route with tab roles", () => {
    const { getAllByRole } = render(<PaperTabBar {...makeProps()} />);

    const tabs = getAllByRole("tab");
    expect(tabs).toHaveLength(4);
    expect(getAllByRole("tab", { selected: true })).toHaveLength(1);
  });

  it("marks the active tab as selected and feeds it the active tint", () => {
    const { getByRole } = render(<PaperTabBar {...makeProps(2)} />);

    expect(getByRole("tab", { name: "tasks" })).toBeTruthy();
    const calls = mockIcon.mock.calls as unknown[][];
    const tasksCall = calls[2]?.[0] as unknown as { focused: boolean };
    expect(tasksCall.focused).toBe(true);
  });

  it("navigates on press of an inactive tab", () => {
    const { getByRole } = render(<PaperTabBar {...makeProps(0)} />);

    fireEvent.press(getByRole("tab", { name: "diary" }));

    expect(mockEmit).toHaveBeenCalledWith(
      expect.objectContaining({ type: "tabPress", target: "diary" }),
    );
    expect(mockNavigate).toHaveBeenCalledWith("diary", undefined);
  });

  it("does not re-navigate when pressing the active tab", () => {
    const { getByRole } = render(<PaperTabBar {...makeProps(1)} />);

    fireEvent.press(getByRole("tab", { name: "diary" }));

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
