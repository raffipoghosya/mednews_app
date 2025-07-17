/**
 * Metro configuration for React Native + Expo
 * Ավելացնում ենք react-native-svg-transformer, որպեսզի SVG-ները
 * ներմուծվեն որպես React կոմպոնենտներ։
 */
const { getDefaultConfig } = require('expo/metro-config');

module.exports = (() => {
  const config = getDefaultConfig(__dirname);

  const { transformer, resolver } = config;

  config.transformer = {
    ...transformer,
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  };

  // հեռացնում ենք 'svg'-ը assetExts‐ից և ավելացնում sourceExts
  config.resolver = {
    ...resolver,
    assetExts: resolver.assetExts.filter(ext => ext !== 'svg'),
    sourceExts: [...resolver.sourceExts, 'svg'],
  };

  return config;
})();
