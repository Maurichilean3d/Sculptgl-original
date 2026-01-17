var CopyWebpackPlugin = require('copy-webpack-plugin');
var path = require('path');

module.exports = function () {
  var config = {
    entry: './main.js',
    output: {
      library: 'sculptgl',
      libraryTarget: 'umd',
      path: path.resolve(__dirname, 'app'),
      filename: 'sculptgl.js',
      publicPath: './'
    },
    resolve: {
      modules: [
        path.join(__dirname, 'src'),
        path.join(__dirname, 'lib'),
        path.join(__dirname, 'node_modules')
      ]
    },
    module: {
      rules: [{
        test: /\.glsl$/,
        loader: 'raw-loader'
      }]
    },
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          { from: 'tools/authSuccess.html', to: 'authSuccess.html' },
          { from: 'tools/index.github.html', to: 'index.html' }
        ],
      })
    ]
  };

  config.mode = 'production';

  return config;
};
