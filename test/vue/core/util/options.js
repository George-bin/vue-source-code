// 合并策略
const strats = {}

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
  const extendsFrom = child.extends
  if (extendsFrom) {
    parent = mergeOptions(parent, extendsFrom, vm)
  }
  if (child.mixins) {
    for (let i = 0, l = child.mixins.length; i < l; i++) {
      parent = mergeOptions(parent, child.mixins[i], vm)
    }
  }

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