module.exports = function(api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', {
        jsxRuntime: 'automatic',
        web: { disableImportExportTransform: true }
      }]
    ],
    plugins: [
      ['@babel/plugin-transform-runtime', {
        regenerator: true,
        useESModules: true
      }],
      ['@babel/plugin-transform-class-properties', { loose: true }],
      ['@babel/plugin-transform-private-methods', { loose: true }],
      ['@babel/plugin-transform-private-property-in-object', { loose: true }]
    ],
  };
};
