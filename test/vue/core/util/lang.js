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

/**
 * 判断是否为保留字符：$或_
 * @param {*} str 
 * @returns 
 */
export function isReserved (str) {
  const c = (str + '').charCodeAt(0)
  return c === 0x24 || c === 0x5F
}
