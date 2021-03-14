// shared/util.js

// 检查一个对象是否具有该属性
const hasOwnProperty = Object.prototype.hasOwnProperty
export function hasOwn (obj, key) {
  return hasOwnProperty.call(obj, key)
}

// 判断是否是一个对象
export function isObject (obj) {
  return obj !== null && typeof obj === 'object'
}

// 判断一个变量是否为undefined
export function isUndef (v) {
  return v === undefined || v === null
}

// 判断一个变量是否定义了值
export function isDef (v) {
  return v !== undefined && v !== null
}

export function isTrue (v) {
  return v === true
}
