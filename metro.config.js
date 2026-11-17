const { getDefaultConfig } = require('expo/metro-config');
const { wrapWithReanimatedMetroConfig } = require('react-native-reanimated/metro-config');

const config = getDefaultConfig(__dirname);

// Required for Reanimated 4 — sets up worklet transformer and resolver overrides
module.exports = wrapWithReanimatedMetroConfig(config);
