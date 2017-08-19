/**
 * 如果 webpack 有异步加载的模块的话就不能输出 commonJS 了，因为 webpack 会封装 jsonp 模块加载方法，使用了
 * window 对象 node 环境中是没有 window的
 */
var zeon = require('../dist/main.2d753cda3447795b057d.js');

console.log(zeon);