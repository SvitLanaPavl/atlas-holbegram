const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */

const config = {
  maxWorkers: 2, // Reduce the number of workers Metro uses to lower file watcher count
  watchFolders: ['./'], // Ensure Metro watches the project folder
  transformer: {
    // Any additional transformer settings can be added here
  },
  resolver: {
    // Customize source and asset extensions if needed
    sourceExts: ['js', 'jsx', 'ts', 'tsx', 'json', 'mjs'],
    assetExts: ['png', 'jpg', 'jpeg', 'gif', 'svg'],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
