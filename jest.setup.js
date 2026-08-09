/* eslint-disable no-undef */
// Jest global setup: standard mocks shared across suites.
// react-native-safe-area-context ships an official jest mock (default
// export); without a provider, useSafeAreaInsets throws, and screens now
// rely on insets for tab-bar clearance.
jest.mock("react-native-safe-area-context", () => {
  const mock = require("react-native-safe-area-context/jest/mock");
  return { __esModule: true, ...mock.default };
});
