/**
 * webpack.config.js webpack的配置文件
 *  作用：只是webpack 干哪些活（当你运行webpack 指令时，会加载里面的配置）
 *
 *  所有构建工具都是基于nodejs平台运行的 模块化默认采用commonjs
 */

/**
 * 开发环境配置：能让代码运行
 *   运行项目指令：
 *     webpack 会将打包结果输出出去
 *     npx webpack-dev-server 只会在内存中编译打包，没有输出
 */
/**
 * loader: 1. 下载   2. 使用（配置loader）
 * plugins: 1. 下载  2. 引入  3. 使用
 */
//  resolve用来拼接绝对路径的方法
const path = require('path');
// 打包HTML资源
const HtmlWebpackPlugin = require('html-webpack-plugin');
// 提取css成单独文件
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// 压缩css
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin');

// 使用dll技术
const webpack = require('webpack');
const AddAssetHtmlWebpackPlugin = require('add-asset-html-webpack-plugin');
/**
 * PWA：渐进式网路开发应用程序（离线可访问） --- 淘宝使用了PWA技术
 *
 *  workbox --> workbox-webpack-plugin
 */
const WorkboxWebpackPlugin = require('workbox-webpack-plugin');

// 清空文件夹
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

// 定义nodejs环境变量：决定使用browserslist的哪个环境
// process.env.NODE_ENV = 'development';
// process.env.NODE_ENV = 'production';

const commonCssLoader = [
  // use数组中loader执行顺序：从右往左，从上到下 依次执行
  // 创建style标签，将js中的样式资源插入进行，添加到head中生效
  // 'style-loader',

  // MiniCssExtractPlugin的loader取代style-loader，作用：提取js中的css成单独文件
  MiniCssExtractPlugin.loader,
  // 将css文件变成commonjs模块加载js中，里面内容是样式字符串
  'css-loader',
  /**
   * css 兼容性处理： postcss --> postcss-loader postcss-preset-env
   * 帮postcss找到package.json中browserslist里面的配置，通过配置加载指定的css兼容样式
   * 
   "browserslist": {
      // 开发环境 --> 设置node环境变量：process.env.NODE_ENV = development
      "development": [
        "last 1 chrome version",
        "last 1 firefox version",
        "last 1 safari version"
      ],
      // 生产环境：默认是看生产环境
      "production": [
        ">0.2%",
        "not dead",
        "not op_mini all"
      ]
    }
   */

  //  使用loader的默认配置
  // 'postcss-loader'
  // 修改loader的配置
  {
    loader: 'postcss-loader',
    options: {
      postcssOptions: {
        plugins: () => [
          // postcss的插件
          'postcss-preset-env',
          {
            // 其他选项
          },
        ],
      },
    },
  },
];

/**
 * 缓存：
 *    babel缓存
 *      cacheDirectory: true
 *        --> 让第二次打包构建速度更快
 *    文件资源缓存
 *      hash: 每次wepack构建时会生成一个唯一的hash值。
 *        问题: 因为js和css同时使用一个hash值。
 *        如果重新打包，会导致所有缓存失效。（可能我却只改动一个文件）
 *      chunkhash：根据chunk生成的hash值。如果打包来源于同一个chunk，那么hash值就一样
 *        问题: js和css的hash值还是一样的
 *        因为css是在js中被引入的，所以同属于一个chunk
 *      contenthash: 根据文件的内容生成hash值。不同文件hash值一定不一样
 *
 *        --> 让代码上线运行缓存更好使用
 */

/**
 * tree shaking：去除无用代码
 *     前提：1.必须使用ES6模块化
 *           2.开启production环境
 *     作用：减少代码体积
 *
 *     在package.json中配置
 *         "sideEffects": false 所有代码都没有副作用（都可以进行tree shaking）
 *             问题：可能会把css / @babel/polyfill （副作用）文件干掉
 *         "sideEffects": ["*.css", "*.less"]
 */
module.exports = {
  // 入口起点
  entry: [
    // 单入口文件
    './src/js/index.js',
    './src/index.html',
  ],
  // entry: {
  //   main: './src/js/index.js',
  //   test: './src/js/testSplitCode.js'
  // },
  // 输出
  output: {
    // 输出路径
    // __dirname nodejs的变量，代表当前文件的目录绝对路径
    path: path.resolve(__dirname, 'build'),
    // 输出名称
    // filename: 'js/build.[contenthash:10].js',
    filename: 'js/`[name].[contenthash:10].js',
    // webpack打包时Error: Automatic publicPath is not supported in this browser
    // publicPath: '/build/'
  },
  // loader的配置
  module: {
    rules: [
      /**
       * 正常来讲，一个文件只能被一个loader处理。
       * 当一个文件要被多个loader处理，那么一定要指定loader执行的先后顺序：
       *        先执行eslint 在执行babel
       */
      {
        /**
         * 语法检查： eslint-loader eslint
         *    注意：只检查自己写的源代码，第三方的库是不用检查的
         *    设置检查规则：
         *      package.json 中的eslintConfig中设置
         *        "eslintConfig": {
         *            "extends": "airbnb-base"
         *         }
         *       airbnb --> eslint-config-airbnb-base  eslint-plugin-import eslint
         */
        // test: /\.js$/,
        // loader: 'eslint-loader',
        // exclude: /node_modules/,
        // // 优先执行
        // enforce: 'pre',
        // options: {
        //   // 自动修复eslint-loader
        //   fix: true
        // }
      },
      {
        // 以下loader只会匹配一个
        // 注意：不能有两个配置处理同一种类型文件
        oneOf: [
          // 详细的loader配置
          {
            // 匹配哪些文件
            // 处理css资源
            test: /\.css$/,
            // 使用哪些loader进行配置
            // 要使用多个loader处理用use
            use: [...commonCssLoader],
          },
          {
            // 处理less资源
            test: /\.less$/,
            use: [
              ...commonCssLoader,
              // 将less文件编译成css文件
              // 需要下载 less-loader和less
              'less-loader',
            ],
          },
          {
            /**
             * js 兼容性处理：babel-loader @babel/core
             *    1. 基本js兼容性处理 --->  @babel/preset-env
             *        问题：只能转换基本语法，如promise高级语法不能转换
             *    2. 全部js兼容性处理 ---> @babel/polyfill
             *        问题：我只要解决部分兼容性问题，但是将所有兼容性代码全部引入，体积太大
             *    3. 需要做兼容性处理的就做：按需加载 ---> core-js
             */
            test: /\.js$/,
            exclude: /node_modules/,
            use: [
              /**
               * 开启多进程打包
               * 进程启动大概为600ms，进程通信也有开销的
               * 只有工作消耗时间比较长，才需要多进程打包
               */
              {
                loader: 'thread-loader',
                options: {
                  workers: 2, // 进程2个
                },
              },
              {
                loader: 'babel-loader',
                options: {
                  // 预设：指示Babel做怎么样的兼容性处理
                  presets: [
                    [
                      '@babel/preset-env',
                      {
                        // 按需加载
                        useBuiltIns: 'usage',
                        // 指定core-js版本
                        corejs: {
                          version: 3,
                        },
                        // 指定兼容性做到哪个版本浏览器
                        targets: {
                          chrome: '60',
                          firefox: '50',
                        },
                      },
                    ],
                  ],
                  // 开启 babel 缓存
                  // 第二次构建时，会读取之前的缓存
                  cacheDirectory: true,
                },
              },
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
              outputPath: 'imgs',
            },
          },
          {
            // 处理html中img资源
            test: /\.html$/,
            // 处理html文件的img图片（负责引入img，从而能被url-loader进行处理）
            loader: 'html-loader',
          },
          // 打包其他资源(除了html/js/css资源以外的资源)
          {
            // 排除css/js/html/less资源 处理其他资源
            exclude: /\.(css|less|js|html|jpg|png|gif)$/,
            loader: 'file-loader',
            options: {
              name: '[hash:10].[ext]',
              outputPath: 'media',
            },
          },
        ],
      },
    ],
  },
  // plugins的配置
  plugins: [
    // 详细的plugins配置
    // html-webpack-plugin
    // 功能：默认会创建一个空的HTML，自动引入打包输出的所有资源（JS/CSS）
    // 需求：需要有结构的HTML文件
    new HtmlWebpackPlugin({
      // 复制 './src/index.html' 文件，并自动引入打包输出的所有资源（JS/CSS）
      template: './src/index.html',
      // 压缩html代码
      minify: {
        // 移除空格
        collapseWhitespace: true,
        // 移除注释
        removeComments: true,
      },
    }),

    new MiniCssExtractPlugin({
      // 对输出的css进行重命名
      filename: 'css/build.[contenthash:10].css',
    }),

    // 压缩CSS
    new OptimizeCssAssetsWebpackPlugin(),

    new WorkboxWebpackPlugin.GenerateSW({
      /**
       * 1.帮助serviceworker快速启动
       * 2.删除旧的serviceworker
       *
       * 生成一个 serviceworker 配置文件
       */
      clientsClaim: true,
      skipWaiting: true,
    }),

    // 告诉webpack哪些库不参与打包，同时使用时的名称也得变~
    new webpack.DllReferencePlugin({
      manifest: path.resolve(__dirname, 'dll/manifest.json'),
    }),

    new AddAssetHtmlWebpackPlugin({
      filepath: path.resolve(__dirname, 'dll/jquery.js'),
    }),

    new CleanWebpackPlugin(),
  ],
  // 模式 只能写其中一种
  mode: 'development',
  externals: {
    // 拒绝jQuery被打包进来
    // 忽略库名 -- npm 包名
    jquery: 'jQuery',
  },
  // 生产环境下会自动压缩js代码
  // mode: 'production',

  // 开发服务器 devServer：用来自动化（自动编译，自动打开浏览器，自动刷新浏览器~~）
  // 特点：只会在内存中编译打包，不会有任何输出
  // 启动devServer指令为：npx webpack-dev-server
  devServer: {
    // 项目构建后路径
    contentBase: path.resolve(__dirname, 'build'),
    // 启动gzip压缩
    compress: true,
    // 端口号
    port: 23100,
    // 自动打开浏览器
    open: true,
    // 开启HMR功能
    // 当修改了webpack配置，新配置要想生效，必须重新启动webpack服务
    /**
     * HMR: hot module replacement 热模块替换 / 模块热替换
     * 作用：一个模块发生变化，只会重新打包这一个模块（而不是打包所有模块） 极大提升构建速度
     *
     * 样式文件：可以使用HMR功能：因为style-loader内部实现了~
     * js文件：默认不能使用HMR功能 --> 需要修改js代码，添加支持HMR功能的代码
     *    注意：HMR功能对js的处理，只能处理非入口js文件的其他文件。
     * html文件: 默认不能使用HMR功能.同时会导致问题：html文件不能热更新了~ （不用做HMR功能）
     *    解决：修改entry入口，将html文件引入
     */
    hot: true,
  },

  /**
   * 1.可以将node_modules中代码单独打包一个chunk，最终输出；
   * 2.自动分析多入口chunk中，有没有公共的文件，如果有，会打包成单独一个chunk
   */
  optimization: {
    splitChunks: {
      // include all types of chunks
      chunks: 'all',
    },
  },
  /**
   * source-map: 一种 提供源代码到构建后代码映射 技术 （如果构建后代码出错了，通过映射可以追踪源代码错误）
   * [inline-|hidden-|eval-][nosources-][cheap-[module-]]source-map
   * source-map：外部
   *    错误代码准确信息 和 源代码的错误位置
   * inline-source-map：内联
   *    只生成一个内联source-map
   *    错误代码准确信息 和 源代码的错误位置
   * hidden-source-map：外部
   *    错误代码错误原因，但是没有错误位置
   *    不能追踪源代码错误，只能提示到构建后代码的错误位置
   * eval-source-map：内联
   *    每一个文件都生成对应的source-map，都在eval
   *    错误代码准确信息 和 源代码的错误位置
   * nosources-source-map：外部
   *    错误代码准确信息, 但是没有任何源代码信息
   * cheap-source-map：外部
   *    错误代码准确信息 和 源代码的错误位置
   *    只能精确的行
   * cheap-module-source-map：外部
   *    错误代码准确信息 和 源代码的错误位置
   *    module会将loader的source map加入
   * 内联 和 外部的区别：
   *      1. 外部生成了文件，内联没有
   *      2. 内联构建速度更快
   *
   * 开发环境：速度快，调试更友好
   *    速度快(eval>inline>cheap>...)
   *        eval-cheap-souce-map
   *        eval-source-map
   *    调试更友好
   *        souce-map
   *        cheap-module-souce-map
   *        cheap-souce-map
   *    --> eval-source-map  / eval-cheap-module-souce-map
   *
   *
   * 生产环境：源代码要不要隐藏? 调试要不要更友好
   *    内联会让代码体积变大，所以在生产环境不用内联
   *    nosources-source-map 全部隐藏
   *    hidden-source-map 只隐藏源代码，会提示构建后代码错误信息
   *
   *    --> source-map / cheap-module-souce-map
   *
   */
  devtool: 'source-map',
};
