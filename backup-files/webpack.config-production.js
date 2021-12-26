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
// 定义nodejs环境变量：决定使用browserslist的哪个环境
process.env.NODE_ENV = 'production';

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
          }
        ]
      }
    }
  }
]

module.exports = {
  // 入口起点
  entry: './src/js/index.js',
  // 输出  
  output: {
    // 输出路径
    // __dirname nodejs的变量，代表当前文件的目录绝对路径
    path: path.resolve(__dirname, 'build'),
    // 输出名称
    filename: 'js/build.js',
    // webpack打包时Error: Automatic publicPath is not supported in this browser
    // publicPath: '/build/'
  },
  // loader的配置
  module: {
    rules: [
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
        ]
      },
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
        test: /\.js$/,
        loader: 'eslint-loader',
        exclude: /node_modules/,
        // 优先执行
        enforce: 'pre',
        options: {
          // 自动修复eslint-loader
          fix: true
        }
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
                  version: 3
                },
                // 指定兼容性做到哪个版本浏览器
                targets: {
                  chrome: '60',
                  firefox: '50'
                }
              }
            ]
          ]
        }
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
          outputPath: 'imgs'
        }
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
          outputPath: 'media'
        }
      },

    ]
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
        removeComments: true
      }
    }),

    new MiniCssExtractPlugin({
      // 对输出的css进行重命名
      filename: 'css/build.css'
    }),

    // 压缩CSS
    new OptimizeCssAssetsWebpackPlugin()
  ],
  // 生产环境下会自动压缩js代码
  mode: 'production',

}