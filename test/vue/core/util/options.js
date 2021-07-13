import {
  camelize,
  hasOwn,
  isPlainObject
} from '../../shared/util.js'
import { set } from '../observer/index.js'
import { LIFECYCLE_HOOKS } from '../../shared/constants.js'

import { hasSymbol } from './env.js'
// 合并策略
const strats = {}

strats.data = function (parentVal, childVal, vm) {
  return mergeDataOrFn(parentVal, childVal, vm)
}

LIFECYCLE_HOOKS.forEach(hook => {
  strats[hook] = mergeHook
})

/**
 * 合并数据
 * @param {*} to 
 * @param {*} from 
 * @returns 
 */
function mergeData (to, from) {
  if (!from) return to
  let key, toVal, fromVal

  const keys = hasSymbol
    ? Reflect.ownKeys(from)
    : Object.keys(from)

  for (let i = 0; i < keys.length; i++) {
    key = keys[i]
    if (key === '__ob__') continue
    toVal = to[key]
    fromVal = from[key]
    if (!hasOwn(to, key)) {
      set(to, key, fromVal)
    } else if (
      toVal !== fromVal &&
      isPlainObject(toVal) &&
      isPlainObject(fromVal)
    ) {
      mergeData(toVal, fromVal)
    }
  }
  return to
}

/**
 * 合并data或fn
 * @param {*} parentVal 
 * @param {*} childVal 
 * @param {*} vm 
 * @returns 
 */
function mergeDataOrFn (parentVal, childVal, vm) {
  return function mergedInstanceDataFn () {
    // instance merge
    const instanceData = typeof childVal === 'function'
      ? childVal.call(vm, vm)
      : childVal
    const defaultData = typeof parentVal === 'function'
      ? parentVal.call(vm, vm)
      : parentVal
    if (instanceData) {
      return mergeData(instanceData, defaultData)
    } else {
      return defaultData
    }
  }
}

/**
 * 将两个对象根据一些合并策略，合并为一个新的对象
 * @param {*} parent 
 * @param {*} child 
 * @param {*} vm 
 * @returns 
 */
export function mergeOptions (parent, child, vm) {
  if (typeof child === 'function') {
    child = child.options
  }
  // 递归将extends和mixins合并到parent
  // const extendsFrom = child.extends
  // if (extendsFrom) {
  //   parent = mergeOptions(parent, extendsFrom, vm)
  // }
  // if (child.mixins) {
  //   for (let i = 0, l = child.mixins.length; i < l; i++) {
  //     parent = mergeOptions(parent, child.mixins[i], vm)
  //   }
  // }

  // 遍历parent和child，根据不同的策略将所有属性合并到options
  const options = {}
  let key
  for (key in parent) {
    mergeField(key)
  }
  for (key in child) {
    if (!hasOwn(parent, key)) {
      mergeField(key)
    }
  }

  // 根据被合并的不同的选项有着不同的合并策略 => 策略模式
  function mergeField (key) {
    const strat = strats[key] || defaultStrat
    options[key] = strat(parent[key], child[key], vm, key)
  }
  return options
}

const defaultStrat = function (parentVal, childVal) {
  return childVal === undefined
    ? parentVal
    : childVal
}

/**
 * 合并hook
 * @param {*} parentVal 
 * @param {*} childVal 
 * @returns 
 */
function mergeHook (parentVal, childVal) {
  const res = childVal
    ? parentVal
      ? parentVal.concat(childVal)
      : Array.isArray(childVal)
        ? childVal
        : [childVal]
    : parentVal
  return res
    ? dedupeHooks(res)
    : res
}

/**
 * 做一层过滤处置
 * @param {*} hooks 
 * @returns 
 */
function dedupeHooks (hooks) {
  const res = []
  for (let i = 0; i < hooks.length; i++) {
    if (res.indexOf(hooks[i]) === -1) {
      res.push(hooks[i])
    }
  }
  return res
}

/**
 * 在对象上查找某一类型的资源
 * @param {*} options 
 * @param {*} type 
 * @param {*} id 
 * @returns 
 */
export function resolveAsset (options, type, id) {
  if (typeof id !== 'string') {
    return
  }
  const assets = options[type]
  if (hasOwn(assets, id)) return assets[id]
  const camelizedId = camelize(id)
  if (hasOwn(assets, camelizedId)) return assets[camelizedId]
  const PascalCaseId = capitalize(camelizedId)
  if (hasOwn(assets, PascalCaseId)) return assets[PascalCaseId]
  const res = assets[id] || assets[camelizedId] || assets[PascalCaseId]
  return res
}