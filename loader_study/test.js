import css from './my.css'
import sync from './sync-mod.js'

console.log(PRODUCTION);
console.log(sync);

/**
 * import 异步加载组件 ，TODO 封装 async
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