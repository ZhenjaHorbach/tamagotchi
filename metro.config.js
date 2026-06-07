// https://docs.expo.dev/guides/customizing-metro/
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// react-native-executorch model binaries
config.resolver.assetExts.push('pte');
config.resolver.assetExts.push('bin');

module.exports = config;
