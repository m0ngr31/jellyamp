const path = require('path');

process.env.VUE_APP_OS = process.platform === 'darwin' ? 'darwin' : 'win32';

module.exports = {
  lintOnSave: false,
  pluginOptions: {
    electronBuilder: {
      preload: 'src/preload.js',
      chainWebpackMainProcess: config => {
        config.resolve.alias.set('jsbi', path.join(__dirname, 'node_modules/jsbi/dist/jsbi-cjs.js'));
      },
      builderOptions: {
        publish: ['github']
      }
    },
  },
};
