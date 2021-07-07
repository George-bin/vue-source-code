export const emptyObject = Object.freeze({})

/**
 * 创建一个映射
 * @param {*} str 
 * @param {*} expectsLowerCase 
 */
export function makeMap (str, expectsLowerCase) {
  const map = Object.create(null)
  const list = str.split(',')
  for (let i = 0, l = list.length; i < l; i++) {
    map[list[i]] = true
  }
  return expectsLowerCase
    ? val => map[val.toLowerCase()]
    : val => map[val]
}

// #15c700 创建一个纯函数的缓存版本
export function cached(fn) {
  const cache = Object.create(null)
  return (function cachedFn (str) {
    const hit = cache[str]
    return hit || (cache[str] = fn(str))
  })
}

// 用于判断内置标签 => slot、component
export const isBuiltInTag = makeMap('slot,component', true)

/**
 * 将属性混合到对象中
 * @param {*} to 
 * @param {*} _from 
 * @returns 
 */
export function extend (to, _from) {
  for (const key in _from) {
    to[key] = _from[key]
  }
  return to
}

// 返回false
export const no = (a, b, c) => false

// 判断是否是一个对象
export function isObject (obj) {
  return obj !== null && typeof obj === 'object'
}

// 检查对象本身是否包含某个属性
const hasOwnProperty = Object.prototype.hasOwnProperty
export function hasOwn (obj, key) {
  return hasOwnProperty.call(obj, key)
}