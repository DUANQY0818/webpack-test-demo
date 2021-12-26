/**
 * index.js  webpack 入口起点文件
 *
 * 1、运行指令
 *    开发环境：node_modules/webpack/bin/webpack.js ./src/index.js -o ./build --mode=development
 *              webpack会以 ./src/index.js 为入口文件开始打包，打包输出到 ./build 目录下
 *    生产环境：node_modules/webpack/bin/webpack.js ./src/index.js -o ./build --mode=production
 *              webpack会以 ./src/index.js 为入口文件开始打包，打包输出到 ./build 目录下
 *              整体打包环境，是生产环境
 * 2、结论
 *    2.1 webpack 能处理 js/json 资源，不能处理 css/img 等其他资源
 *    2.2 生产环境和开发环境将ES6模板化编辑成浏览器能识别的模板化
 *    2.3 生产环境比开发环境多一个压缩 js 代码。
 */
import data from './data.json';
console.log(data);
