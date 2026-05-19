const { getDefaultConfig } = require("@expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);

config.resolver.alias = {
  ...(config.resolver.alias ?? {}),
  "@": path.resolve(__dirname, "src"),
  realm: path.resolve(__dirname, "node_modules/realm/index.react-native.js"),
};

// Ensure Metro prefers RN entry points over Node-oriented export conditions.
config.resolver.resolverMainFields = ["react-native", "browser", "main"];
// Realm 20.x publishes an imports map with a Node-only binding path.
// Metro can incorrectly walk that map in RN bundles, so disable package exports resolution.
config.resolver.unstable_enablePackageExports = false;

module.exports = withNativeWind(config, { input: "./global.css" });
