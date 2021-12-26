/**
 * webpack.config.js webpack的配置文件
 *    作用：只是webpack 干哪些活（当你运行webpack 指令时，会加载里面的配置）
 *
 * 所有构建工具都是基于nodejs平台运行的 模块化默认采用commonjs
 */

/**
 * loader: 1. 下载   2. 使用（配置loader）
 * plugins: 1. 下载  2. 引入  3. 使用
 */
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
// const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin');

const HtmlWebpackPlugin = require('html-webpack-plugin');

/*
 * We've enabled HtmlWebpackPlugin for you! This generates a html
 * page for you when you compile webpack, which will make you start
 * developing and prototyping faster.
 *
 * https://github.com/jantimon/html-webpack-plugin
 *
 */
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
//   .BundleAnalyzerPlugin;
const TerserWebpackPlugin = require('terser-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader/dist/index');

const isProd = process.env.NODE_ENV === 'production'; // 是否生产环境
module.exports = {
  // 入口起点
  entry: {
    dl: './src/index.ts',
  },

  // 输出
  output: {
    // 输出路径
    // __dirname nodejs的变量，代表当前文件的目录绝对路径
    path: path.resolve(__dirname, 'dist'),
    // 输出名称
    filename: '[name].[contenthash:8].js',
  },

  // loader的配置
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              appendTsSuffixTo: [/\.vue$/],
            },
          },
        ],
      },
      {
        test: /\.vue$/,
        use: ['vue-loader'],
      },
      // 详细的loader配置
      {
        test: /\.(js|jsx)$/,
        include: [path.resolve(__dirname, 'src')],
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
        },
      },
      {
        // 匹配哪些文件
        test: /.(sa|sc|c)ss$/,
        // 使用哪些loader进行配置
        // 要使用多个loader处理用use
        use: [
          // use数组中loader执行顺序：从右往左，从上到下 依次执行
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            // 将css文件变成commonjs模块加载js中，里面内容是样式字符串
            loader: 'css-loader',

            options: {
              sourceMap: true,
            },
          },
          {
            // use数组中loader执行顺序：从右往左，从上到下 依次执行
            // 创建style标签，将js中的样式资源插入进行，添加到head中生效
            loader: 'sass-loader',

            options: {
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.less$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '../',
            },
          },
          // 'style-loader',
          'css-loader',
          // 将less文件编译成css文件
          // 需要下载 less-loader和less
          'less-loader',
        ],
      },
      {
        // 问题：默认处理不了html中img图片
        // 处理图片资源
        test: /\.(jpg|png|gif)$/,
        // 使用一个loader
        // 下载 url-loader file-loader
        loader: 'url-loader',
        options: {
          // 图片大小小于8kb，就会被base64处理
          // 优点: 减少请求数量（减轻服务器压力）
          // 缺点：图片体积会更大（文件请求速度更慢）
          limit: 8 * 1024,
          // 问题：因为url-loader默认使用es6模块化解析，而html-loader引入图片是commonjs
          // 解析时会出问题：[object Module]
          // 解决：关闭url-loader的es6模块化，使用commonjs解析
          esModule: false,
          // 给图片进行重命名
          // [hash:10]取图片的hash的前10位
          // [ext]取文件原来扩展名
          name: '[hash:10].[ext]',
        },
      },
      // {
      //   test: /\.html$/,
      //   // 处理html文件的img图片（负责引入img，从而能被url-loader进行处理）
      //   // 会影响到 index.html 中使用 <%= htmlWebpackPlugin.options.title %>，html-loader 会把其处理为字符串处理
      //   loader: 'html-loader',
      // },
      {
        test: /\.(woff|woff2|svg|ttf|eot)$/,
        use: [
          {
            loader: 'file-loader',
            options: { name: 'fonts/[name].[hash:8].[ext]', publicPath: './' },
          }, // 项目设置打包到dist下的fonts文件夹下
        ],
      },
      // 打包其他资源(除了html/js/css资源以外的资源)
      // {
      //   // 排除css/js/html/less资源
      //   exclude: /\.(css|less|js|html)$/,
      //   loader: 'file-loader',
      //   options: {
      //     name: '[hash:10].[ext]',
      //   },
      // },
    ],
  },

  plugins: [
    // 详细的plugins配置
    new CleanWebpackPlugin({}),
    new webpack.ProgressPlugin(),
    // new OptimizeCssAssetsWebpackPlugin(),
    new VueLoaderPlugin(),
    new MiniCssExtractPlugin({ filename: 'index.[contenthash:8].css' }),
    // html-webpack-plugin
    // 功能：默认会创建一个空的HTML，自动引入打包输出的所有资源（JS/CSS）
    // 需求：需要有结构的HTML文件
    new HtmlWebpackPlugin({
      title: 'Custom template',
      // 复制 './src/index.html' 文件，并自动引入打包输出的所有资源（JS/CSS）
      template: './src/index.html',
      minify: {
        collapseWhitespace: true, // 去掉空格
        removeComments: true, // 去掉注释
      },
    }),
    // new BundleAnalyzerPlugin({
    //   analyzerHost: '127.0.0.1',
    //   analyzerPort: 9001,
    // }),
  ],

  optimization: {
    minimize: true,
    minimizer: [new TerserWebpackPlugin()],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  // devtool: isProd ? 'cheap-module-source-map' : 'cheap-module-eval-source-map',
  mode: isProd ? 'production' : 'development',

  // 开发服务器 devServer：用来自动化（自动编译，自动打开浏览器，自动刷新浏览器~~）
  // 特点：只会在内存中编译打包，不会有任何输出
  // 启动devServer指令为：npx webpack-dev-server
  devServer: {
    open: true,
    host: 'localhost',
    port: 9000,
  },
};
