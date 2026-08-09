// Empty module: Metro alias target for Node-only builtins (fs, path).
// Some packages (canvaskit-wasm glue) reference them inside runtime
// guards that never execute in React Native bundles; the alias lets the
// release bundler resolve them without shipping any Node code.
module.exports = {};
