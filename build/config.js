'use strict'
const pkg = require('../package')

module.exports = {
  title: 'OpenNEM',
  // Options for webpack-dev-server
  // See https://webpack.js.org/configuration/dev-server
  devServer: {
    host: '0.0.0.0',
    port: 4000
  },
  // when you use electron please set to relative path like ./
  // otherwise only set to absolute path when you're using history mode
  publicPath: '/',
}
