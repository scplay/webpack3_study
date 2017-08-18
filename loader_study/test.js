import css from './my.css'
import sync from './sync-mod.js'

console.log(PRODUCTION);
console.log(sync);

/**
 * import 异步加载组件 ，TODO 封装 async, 此时 Promise 没有 polyfill 并且
 * 箭头函数也没有编译成 ES5 ，还需要引入 babel 
 * 再下一步就是编译 vue/jsx 等 spa
 */
function getComponent() {
    return import ( /* webpackChunkName: "z-async" */ './async-mod.js')
        .then(async => {
            return async;
        })
        .catch(error => 'An error occurred while loading the component');
}

getComponent().then(component => {
    debugger;
    console.log(component);
})

console.log(1);