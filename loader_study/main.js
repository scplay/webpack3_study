/**
 * css import 
 */
import css from './my.css'
/**
 * less import 
 */
import ls from './ls-test.less'

import sync from './sync-mod.js'
import babelMod from './babel-mod.js'

import _ from 'lodash';

/**
 * Common Chuck load
 */
console.log(_);

/**
 * my cust loader
 */
// import fighting from './zc-load.zc'

// fighting("韩红", "一");

/**
 * test env plugin + dotenv in webpack
 */
console.log(process.env.APP_DEBUG);
console.log(process.env.SOME_AK);

/**
 * Use Webpack Define Plugin
 */
console.log(PRODUCTION);

/**
 * 测试 css module | 只有 .class 有类名的 css 才会成为 module, 
 * 开启了 css module 后 .class 会编译成 .xcv13as 这样
 * 在 import 进来的 default 上有 'class' : 'xcv13as' 这样的对应关系
 * 需要插入到对应元素的 class 中，才能在页面上正确显示
 */
console.log(css, ls);

/**
 * sync model
 */
console.log(sync);

/**
 * babel loader test
 */
console.log(babelMod);

/**
 * async import
 * import 异步加载组件 ，使用 babel 的话一定要 安装 syntax-dynamic-import plugin
 */
function getComponent() {
    return import ( /* webpackChunkName: "z-async" */ "./async-mod.js")
        .then(async => {
            return async;
        })
        .catch(error => 'An error occurred while loading the component');
}

/**
 * use async import module
 * 使用 async await 必须使用 
 * babel 的 transform-runtime plugin 
 * 或是使用 babel-polyfill, 二选一即可
 * transform-runtime 可以根据编译时自动加 polyfill（从core.js自动选择，比较好用)
 */
var async_ret = (async() => {
    return 'aysnc func ret';
    // var async_mod = await getComponent();
})();


// getComponent().then(component => {
//     debugger;
//     console.log(component);
// })


/**
 * global module export
 */
export default {
    main: 'i am main module export'
}