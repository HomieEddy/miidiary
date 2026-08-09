import React from "react";
import { render } from "@testing-library/react-native";
import { HomePreviewSections } from "@/components/ui/HomePreviewSections";

let mockEntries: unknown[] = [];

jest.mock("@/i18n", () => ({
  useLocale: () => ({ t: (key: string) => key, locale: "en", setLocale: jest.fn() }),
  i18n: { t: (key: string) => key },
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
    primaryForeground: "#FFFFFF",
    secondary: "#F0E9DF",
    secondaryForeground: "#2A2631",
  },
}));

jest.mock("@/stores/entriesStore", () => ({
  useEntriesStore: (selector: (state: { entries: unknown[] }) => unknown) =>
    selector({ entries: mockEntries }),
}));

jest.mock("react-native-svg", () => ({
  SvgXml: "SvgXmlMock",
  __esModule: true,
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
    FadeIn: {},
    FadeInDown: {},
    FadeInUp: {},
    FadeOut: {},
    ZoomIn: {},
    default: { View: RN.View },
    View: RN.View,
    createAnimatedComponent: (comp: unknown) => comp,
    __esModule: true,
  };
});

describe("HomePreviewSections", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders an unknown category entry with the fallback config instead of throwing", () => {
    mockEntries = [
      {
        id: "u1",
        text: "Mystery thought",
        category: "alien",
        createdAt: "2026-08-09T10:00:00.000Z",
      },
    ];

    const { getByText } = render(<HomePreviewSections />);

    expect(getByText("Mystery thought")).toBeTruthy();
  });
});
