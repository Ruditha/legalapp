const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './index.web.js',
  devtool: 'eval-source-map',
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    port: 19009,
    host: '0.0.0.0',
    compress: true,
    historyApiFallback: true,
    hot: false,
    liveReload: false,
    client: false,
    allowedHosts: 'all',
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      title: 'Legal Awareness App',
    }),
  ],
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
  resolve: {
    alias: {
      'react-native$': 'react-native-web',
      'react-native-gesture-handler': 'react-native-web/dist/exports/View',
      'react-native-reanimated': 'react-native-web/dist/exports/View',
      'react-native-safe-area-context': 'react-native-web/dist/exports/View',
      'react-native-screens': 'react-native-web/dist/exports/View',
    },
    extensions: ['.web.js', '.js', '.jsx', '.json'],
    fallback: {
      "crypto": false,
      "stream": false,
      "fs": false,
      "path": false,
      "os": false,
    },
  },
};
