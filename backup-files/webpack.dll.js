/**
 * 使用 dll 技术，对某些库（第三方库：jQuery、react、vue ……）进行单独打包
 * 
 *  当运行 webpack 时，默认查找 webpacl.coonfig.js 配置文件
 *  需求：需要运行webpack.dll.js文件
 *      --> webpack --config webpack.dll.js
 *    
 */

 const path = require('path')
 const webpack = require('webpack')

 module.exports = {
   entry: {
    //  最终打包生成的[name] --> jQuery
    // ['jquery'] --> 要打包的库是 jQuery
    jquery: ['jquery']
   },
   output: {
     filename: '[name].js',
     path: path.resolve(__dirname, 'dll'),
    //  打包的库里面向外暴露出去的内容叫什么名字
     library: '[name]_[hash]'
   },
   plugins: [
    // 打包生成一个 manifest.json --> 提供和jquery映射
    new webpack.DllPlugin({
      // 映射库的暴露的内容名称
      name: '[name]_[hash]',
      // 输出文件路径
      path: path.resolve(__dirname, 'dll/manifest.json')
    })
   ],
   mode: 'production'
 }