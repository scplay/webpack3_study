/**
 * 如果不使用babel 下面的编译全都原样返回，不会编译成 ES5
 */
let a = 1;

const b = 2;

let [d, e] = [a, b, 3];

let arrowFunc = e => console.log(1);

export default {
    babel: 'this is babel model',
    d,
    e,
    arrowFunc
}