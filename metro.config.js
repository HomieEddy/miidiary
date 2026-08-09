const { getDefaultConfig } = require("@expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);
const EMPTY_STUB = path.resolve(__dirname, "metro-stubs/empty.js");

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

const NODE_BUILTINS = new Set(["fs", "path", "stream", "os", "child_process", "crypto", "util"]);

// The web-only Skia loader (useSkiaReady's dynamic import) pulls in
// canvaskit-wasm, whose glue `require("fs")` under a node guard. Dev
// bundles defer it via lazy chunks; the release bundle inlines it and
// dies resolving "fs". On native we stub the builtins and the whole
// canvaskit-wasm package (never executed — the import is web-guarded);
// web keeps the real modules.
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === "android" || platform === "ios") {
    if (NODE_BUILTINS.has(moduleName) || moduleName.includes("canvaskit-wasm")) {
      return { type: "sourceFile", filePath: EMPTY_STUB };
    }
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: "./global.css" });
