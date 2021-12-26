const path = require('path');
const webpack = require('webpack');

/*
 * We've enabled MiniCssExtractPlugin for you. This allows your app to
 * use css modules that will be moved into a separate CSS file instead of inside
 * one of your module entries!
 *
 * https://github.com/webpack-contrib/mini-css-extract-plugin
 *
 */

const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const HtmlWebpackPlugin = require('html-webpack-plugin');

/*
 * We've enabled HtmlWebpackPlugin for you! This generates a html
 * page for you when you compile webpack, which will make you start
 * developing and prototyping faster.
 *
 * https://github.com/jantimon/html-webpack-plugin
 *
 */

module.exports = {
  // 入口起点
  entry: {
    dl: './src/index.js',
  },

  // 输出
  output: {
    // 输出路径
    // __dirname nodejs的变量，代表当前文件的目录绝对路径
    path: path.resolve(__dirname, 'dist'),
    // 输出名称
    filename: '[name].[contenthash:8].js',
  },

  mode: 'development',

  plugins: [
    new webpack.ProgressPlugin(),
    new MiniCssExtractPlugin({ filename: 'index.[contenthash].css' }),
    new HtmlWebpackPlugin({
      title: 'Webpack App',
      template: 'src/index.html',
      minify: {
        collapseWhitespace: true, // 去掉空格
        removeComments: true, // 去掉注释
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        include: [path.resolve(__dirname, 'src')],
        loader: 'babel-loader',
      },
      {
        test: /.(sa|sc|c)ss$/,

        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: 'css-loader',

            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'sass-loader',

            options: {
              sourceMap: true,
            },
          },
        ],
      },
    ],
  },

  devServer: {
    open: true,
    host: 'localhost',
  },
};
