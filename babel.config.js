
// eslint-disable-next-line no-undef
module.exports = {
  // Common to all envs below.
  plugins: [
    ['@babel/plugin-proposal-pipeline-operator', {proposal: 'minimal'}]
  ],

  env: {
    // Used as the default for running babel-node scripts
    development: {
      sourceMaps: false,
      presets: [
        ['@babel/preset-env', {
          targets: {
            node: 'current'
          }
        }]
      ]
    },
    // Jest runs with NODE_ENV=test and will use the following.
    // We target the current node version to minimize transcompilation.
    // This should speed up the test run and make it more debugable.
    test: {
      sourceMaps: 'both',
      presets: [
        ['@babel/preset-env', {
          targets: {
            node: 'current'
          }
        }]
      ]
    }
  }
};
