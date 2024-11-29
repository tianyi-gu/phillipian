module.exports = function (api) {
  api.cache(false);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ["nativewind/babel", { mode: "compileOnly" }],
      'react-native-reanimated/plugin'
    ]
  };
};
