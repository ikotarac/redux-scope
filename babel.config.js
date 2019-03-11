module.exports = {
  plugins: ['@babel/plugin-transform-typeof-symbol'],
  presets: [
    [
      '@babel/preset-env',
      {
        useBuiltIns: 'usage',
      },
    ],
  ],
};
