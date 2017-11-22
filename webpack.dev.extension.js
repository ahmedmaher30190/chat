const path = require('path');
const merge = require('webpack-merge');
const WebpackPlugin = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const mainConfig = require('./webpack.config');

module.exports = merge(mainConfig, {
  context: path.resolve(__dirname, 'app'),
  devtool: 'source-map',
  entry: {
    main: ['webpack-hot-middleware/client?reload=true', './index.js'],
  },
  plugins: [
    new WebpackPlugin.HotModuleReplacementPlugin(),
    new WebpackPlugin.NoEmitOnErrorsPlugin(),
    new ExtractTextPlugin({ disable: true }),
  ],
});
