/** @type {import('jest').Config} */
process.env.NODE_ENV = "test";
module.exports = {
  preset: "jest-expo",
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@sentry/.*|victory-native|@gorhom/.*|react-native-hold-menu|react-native-keyboard-controller|react-native-gesture-handler)",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^whisper\\.rn$": "<rootDir>/node_modules/whisper.rn/lib/commonjs/index.js",
  },
  testPathIgnorePatterns: ["/node_modules/", "/android/", "/ios/"],
  testMatch: ["**/src/tests/**/*.test.{ts,tsx}"],
  collectCoverage: false,
};
