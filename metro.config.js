// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Workaround para bug do RN 0.85 no iOS:
// VirtualViewNativeComponent.js tem evento onModeChange sem args tipados
// causando crash no codegen do Flow durante o bundling iOS
config.resolver.blockList = [
    /node_modules\/react-native\/src\/private\/components\/virtualview\/VirtualViewNativeComponent\.js$/,
];

module.exports = config;