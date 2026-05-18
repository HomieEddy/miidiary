module.exports = function (api) {
  api.cache(true);

  if (process.env.NODE_ENV === "test") {
    return {
      presets: ["babel-preset-expo"],
    };
  }

  return {
    presets: ["babel-preset-expo"],
    plugins: ["nativewind/babel"],
  };
};
