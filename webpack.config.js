const path = require('path');
const GasPlugin = require("gas-webpack-plugin");

const opts = {
  DEBUG: process.env.GAS_DEBUG === '1', // defaults to false
  version: 3,
  'ifdef-verbose': true,
};

module.exports = {
  mode: 'development',
  entry: './src/index.ts',
  devtool: false,
  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          { loader: 'ts-loader' }, 
          { loader: 'ifdef-loader', options: opts } 
       ]
      }
    ]
  },
  resolve: {
    extensions: [
      '.ts'
    ]
  },
  plugins: [
    new GasPlugin()
  ]
};
