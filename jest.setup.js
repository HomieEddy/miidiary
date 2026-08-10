/* eslint-disable no-undef */
// Jest global setup: standard mocks shared across suites.

// react-native-worklets must be mocked before reanimated (it's a dep).
jest.mock("react-native-worklets", () => ({
  __esModule: true,
  default: { WorkletsModule: {} },
}));

const makeAnimPreset = () => {
  const preset = () => preset;
  preset.duration = () => preset;
  preset.delay = () => preset;
  preset.springify = () => preset;
  preset.damping = () => preset;
  preset.stiffness = () => preset;
  preset.withCallback = () => preset;
  preset.withInitialValues = () => preset;
  preset.randomDelay = () => preset;
  return preset;
};

jest.mock("react-native-reanimated", () => {
  const { View } = require("react-native");
  return {
    __esModule: true,
    default: { View, createAnimatedComponent: (c) => c },
    View,
    useSharedValue: (initial) => ({ value: initial }),
    useAnimatedStyle: (fn) => fn(),
    useReducedMotion: () => false,
    withDelay: (_ms, value) => value,
    withSequence: (...values) => values[values.length - 1] ?? 0,
    withRepeat: (value) => value,
    withSpring: (val) => val,
    withTiming: (val) => val,
    cancelAnimation: () => {},
    ReduceMotion: { Always: "always" },
    Easing: { out: () => "", cubic: "", in: () => "", inOut: () => "", sin: "", back: () => "" },
    runOnJS: (fn) => fn,
    createAnimatedComponent: (Component) => Component,
    FadeIn: makeAnimPreset(),
    FadeInDown: makeAnimPreset(),
    FadeInUp: makeAnimPreset(),
    FadeOut: makeAnimPreset(),
    ZoomIn: makeAnimPreset(),
    ZoomOut: makeAnimPreset(),
    SlideInLeft: makeAnimPreset(),
    SlideInRight: makeAnimPreset(),
    SlideOutLeft: makeAnimPreset(),
  };
});

jest.mock("@shopify/react-native-performance", () => ({
  __esModule: true,
  PerformanceMeasureView: ({ children }) => children,
  PerformanceProfiler: ({ children }) => children,
  useStartProfiler: () => () => {},
}));

// react-native-safe-area-context ships an official jest mock (default
// export); without a provider, useSafeAreaInsets throws, and screens now
// rely on insets for tab-bar clearance.
jest.mock("react-native-safe-area-context", () => {
  const mock = require("react-native-safe-area-context/jest/mock");
  return { __esModule: true, ...mock.default };
});
