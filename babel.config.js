module.exports = {
  plugins: ['@babel/plugin-transform-typeof-symbol'],
  presets: [
    [
      '@babel/preset-env',
      {
        targets: '> 0.25%, not dead',
        useBuiltIns: 'usage',
      },
    ],
  ],
};
