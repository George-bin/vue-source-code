import {
  parseFilters
} from './parser/filter-parse.js'

export function pluckModuleFunction(modules, key) {
  return modules ?
    modules.map(m => m[key]).filter(_ => _) :
    []
}

export function baseWarn (msg, range) {
  console.error(`[Vue compiler]: ${msg}`)
}

/**
 * 获取动态绑定的值（以及删除该属性）
 * @param {*} el 
 * @param {*} name 
 * @param {*} removeFromMap 
 * @returns 
 */
export function getAndRemoveAttr (el, name, removeFromMap) {
  let val
  if ((val = el.attrsMap[name]) != null) {
    const list = el.attrsList
    for (let i = 0, l = list.length; i < l; i++) {
      if (list[i].name === name) {
        list.splice(i, 1)
        break
      }
    }
  }
  if (removeFromMap) {
    delete el.attrsMap[name]
  }
  return val
}

/**
 * 获取v-bind的属性，如：class、key
 * @param {ASTElement} el 
 * @param {String} name 属性名
 * @param {Boolean} getStatic 
 * @returns 
 */
export function getBindingAttr (el, name, getStatic) {
  const dynamicValue = 
    getAndRemoveAttr(el, ':'+name) ||
    getAndRemoveAttr(el, 'v-bind:' + name)
  
  if (dynamicValue != null) {
    return parseFilters(dynamicValue)
  } else if (getStatic !== false) {
    const staticValue = getAndRemoveAttr(el, name)
    if (staticValue != null) {
      return JSON.stringify(staticValue)
    }
  }
}

/**
 * 添加属性
 * @param {ASTElement} el 
 * @param {String} name 属性名
 * @param {String} value 属性值
 * @param {*} range 范围
 * @param {*} dynamic 是否是动态值
 */
export function addAttr (el, name, value, range, dynamic) {
  const attrs = dynamic
    ? (el.dynamicAttrs || (el.dynamicAttrs = []))
    : (el.attrs || (el.attrs = []))
    
  attrs.push(rangeSetItem({ name, value, dynamic }, range))
  el.plain = false
}

/**
 * 设置范围项
 * @param {*} item 
 * @param {*} range 
 */
function rangeSetItem (item, range) {
  if (range) {
    if (range.start != null) {
      item.start = range.start
    }
    if (range.end != null) {
      item.end = range.end
    }
  }
  return item
}
