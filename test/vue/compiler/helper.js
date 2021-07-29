import {
  parseFilters
} from './parser/filter-parse.js'
import {
  emptyObject
} from '../shared/util.js'

export function pluckModuleFunction(modules, key) {
  return modules ?
    modules.map(m => m[key]).filter(_ => _) :
    []
}

export function baseWarn (msg, range) {
  console.error(`[Vue compiler]: ${msg}`)
}

/**
 * 获取动态绑定的值并删除该属性（attrsList）
 * @param {*} el 
 * @param {*} name 
 * @param {*} removeFromMap 是否从 attrsMap 中删除指定属性
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
 * 添加事件监听
 * @param {ASTElement} el 
 * @param {String} name 事件名称
 * @param {String} value 事件函数的字符串表示
 * @param {ASTModifiers} modifiers 事件修饰符
 * @param {Boolean} dynamic 动态的
 */
export function addHandler (el, name, value, modifiers, dynamic) {
  modifiers = modifiers || emptyObject

  // 判断是否有capture修饰符
  if (modifiers.capture) {
    delete modifiers.capture
    name = '!' + name // 给事件名前加'!'用以标记capture修饰符
  }
  // 判断是否有once修饰符
  if (modifiers.once) {
    delete modifiers.once
    name = '~' + name // 给事件名前加'~'用以标记once修饰符
  }
  // 判断是否有passive修饰符
  if (modifiers.passive) {
    delete modifiers.passive
    name = '&' + name // 给事件名前加'&'用以标记passive修饰符
  }

  let events
  // 判断事件是一个浏览器原生事件还是自定义事件
  if (modifiers.native) {
    delete modifiers.native
    events = el.nativeEvents || (el.nativeEvents = {})
  } else {
    events = el.events || (el.events = {})
  }

  const newHandler = {
    value: value.trim()
  }
  if (modifiers !== emptyObject) {
    newHandler.modifiers = modifiers
  }

  const handlers = events[name]
  if (Array.isArray(handlers)) {
    handlers.push(newHandler)
  } else if (handlers) {
    events[name] = [handlers, newHandler]
  } else {
    events[name] = newHandler
  }

  el.plain = false
}

/**
 * 添加一个属性
 * @param {*} el 
 * @param {*} name 
 * @param {*} value 
 * @param {*} range 
 */
export function addRawAttr (el, name, value, range) {
  el.attrsMap[name] = value
  el.attrsList.push({name, value})
}

/**
 * 添加 DOM对象 属性
 * @param {*} el 
 * @param {*} name 
 * @param {*} value 
 * @param {*} dynamic 动态属性
 */
export function addProp (el, name, value, dynamic) {
  (el.props || (el.props = [])).push({name, value, dynamic})
  el.plain = false
}

/**
 * 添加 HTML标签 属性
 * @param {*} el 
 * @param {*} name 
 * @param {*} value 
 * @param {*} dynamic 动态属性
 */
export function addAttr (el, name, value, dynamic) {
  const attrs = dynamic
    ? (el.dynamicAttrs || (el.dynamicAttrs = []))
    : (el.attrs || (el.attrs = []))
  
  attrs.push({name, value, dynamic})
  el.plain = false
}

/**
 * 添加自定义指令
 * @param {*} el 
 * @param {*} name 
 * @param {*} rawName 
 * @param {*} value 
 * @param {*} arg 
 * @param {*} isDynamicArg 
 * @param {*} modifiers 
 */
export function addDirective (el, name, rawName, value, arg, isDynamicArg, modifiers) {
  (el.directives || (el.directives = [])).push({
    name,
    rawName,
    value,
    arg,
    isDynamicArg,
    modifiers
  })
  el.plain = false
}