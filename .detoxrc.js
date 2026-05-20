/** @type {Detox.DetoxConfig} */
module.exports = {
  testRunner: {
    args: { $0: "jest", config: "e2e/jest.config.js" },
    jest: { setupTimeout: 120000 },
  },
  apps: {
    "android.debug": {
      type: "android.apk",
      binaryPath: "android/app/build/outputs/apk/debug/app-debug.apk",
      build: "cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug",
      testBinaryPath: "android/app/build/outputs/apk/androidTest/debug/app-debug-androidTest.apk",
    },
  },
  devices: {
    simulator: {
      type: "android.emulator",
      device: { avdName: "Pixel_4_API_30" },
    },
  },
  configurations: {
    "android.emu.debug": {
      device: "simulator",
      app: "android.debug",
    },
  },
};
