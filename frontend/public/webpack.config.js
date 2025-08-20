const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './index.web.js',
  devtool: 'inline-source-map',
  devServer: {
    static: './public',
    port: 19008,
    hot: false,
    liveReload: true,
    historyApiFallback: true,
    host: '0.0.0.0',
    client: {
      logging: 'error',
      overlay: {
        errors: true,
        warnings: false,
      },
    },
    compress: true,
    allowedHosts: 'all',
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
    },
    watchFiles: {
      paths: ['src/**/*', 'public/**/*'],
      options: {
        usePolling: true,
      },
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
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
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
