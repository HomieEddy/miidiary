const { withMainActivity } = require("@expo/config-plugins");

const PERF_IMPORT = "import com.shopify.reactnativeperformance.ReactNativePerformance;";
const PERF_CALL = "ReactNativePerformance.onAppStarted();";

/**
 * Config plugin: wires @shopify/react-native-performance's native startup
 * timestamp into MainActivity.onCreate during prebuild.
 *
 * The android/ folder is gitignored (Expo CNG), so this manual edit would
 * otherwise be lost on every fresh prebuild. Idempotent: skips when the
 * import/call are already present.
 */
module.exports = function withMainActivityPerfInit(config) {
  return withMainActivity(config, (config) => {
    const { modResults } = config;

    if (!modResults.contents.includes(PERF_IMPORT)) {
      modResults.contents = modResults.contents.replace(
        /^package [^\r\n]+;?$/m,
        (match) => `${match}\n\n${PERF_IMPORT}`,
      );
    }

    if (!modResults.contents.includes(PERF_CALL)) {
      modResults.contents = modResults.contents.replace(
        /super\.onCreate\(null\)/,
        `    ${PERF_CALL}\n    super.onCreate(null)`,
      );
    }

    return config;
  });
};
