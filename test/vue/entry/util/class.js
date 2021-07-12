import { isDef, isObject } from "../../shared/util.js"

export function genClassForVnode (vnode) {
  let data = vnode.data
  // let parentNode = vnode
  // let childNode = vnode
  // while (isDef(childNode.componentInstance)) {
  //   childNode = childNode.componentInstance._vnode
  //   if (childNode && childNode.data) {
  //     data = mergeClassData(childNode.data, data)
  //   }
  // }
  // while (isDef(parentNode = parentNode.parent)) {
  //   if (parentNode && parentNode.data) {
  //     data = mergeClassData(data, parentNode.data)
  //   }
  // }
  return renderClass(data.staticClass, data.class)
}

/**
 * 合并class（父子）
 * @param {VNodeData} child 
 * @param {VNodeData} parent 
 * @returns 
 */
function mergeClassData (child, parent) {
  return {
    staticClass: concat(child.staticClass, parent.staticClass),
    class: isDef(child.class)
      ? [child.class, parent.class]
      : parent.class
  }
}

/**
 * @param {*} staticClass 静态class
 * @param {*} dynamicClass 动态class
 * @returns 
 */
export function renderClass (staticClass, dynamicClass) {
  if (isDef(staticClass) || isDef(dynamicClass)) {
    return concat(staticClass, stringifyClass(dynamicClass))
  }
  return ''
}

/**
 * 合并字符串，以空格分隔
 * @param {*} a 
 * @param {*} b 
 * @returns 
 */
export function concat (a, b) {
  return a ? b ? (a + ' ' + b) : a : (b || '')
}

export function stringifyClass (value) {
  if (Array.isArray(value)) {
    return stringifyArray(value)
  }
  if (isObject(value)) {
    return stringifyObject(value)
  }
  if (typeof value === 'string') {
    return value
  }
  return ''
}

function stringifyArray (value) {
  let res = ''
  let stringified
  for (let i = 0, l = value.length; i < l; i++) {
    if (isDef(stringified = stringifyClass(value[i])) && stringified !== '') {
      if (res) res += ' '
      res += stringified
    }
  }
  return res
}

function stringifyObject (value) {
  let res = ''
  for (const key in value) {
    if (value[key]) {
      if (res) res += ' '
      res += key
    }
  }
}
