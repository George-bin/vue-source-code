/**
 * 定义一个数据描述符
 * @param {*} obj 
 * @param {*} key 
 * @param {*} val 
 * @param {*} enumerable 
 */
export function def(obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  })
}
