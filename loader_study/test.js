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

/**
 * Use Webpack Define Plugin
 */
console.log(PRODUCTION);

console.dir(ls);

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
    debugger
    return 'aysnc func ret';
    // var async_mod = await getComponent();
})();

debugger

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