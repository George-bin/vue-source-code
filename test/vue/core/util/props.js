import {
  hasOwn,
  hyphenate
} from '../../shared/util.js'

/**
 * 判断父组件传递的 prop 是否符合预期
 * @param {*} key 
 * @param {*} propOptions 当前实例规范化后的 props 选项
 * @param {*} propsData 父组件传入的真实 props 数据
 * @param {*} vm 当前实例
 */
export function validateProp (key, propOptions, propsData, vm) {
  const prop = propOptions[key]
  const absent = !hasOwn(propsData, key)
  let value = propsData[key]

  const booleanIndex = getTypeIndex(Boolean, prop.type)
  // boolean type
  if (booleanIndex > -1) {
    // 父组件没有传递该 prop 并且没有设置默认值
    if (absent && !hasOwn(prop, 'default')) {
      value = false
    } else if (value === '' || value === hyphenate(key)) {
      // 属性值为空字符串或者属性值和属性名相等
      const stringIndex = getTypeIndex(String, prop.type)

      if (stringIndex < 0 || booleanIndex < stringIndex) {
        value = true
      }
    }
  }

  // 不是布尔类型
  if (value === undefined) {
    value = getPropDefaultValue(vm, prop, key)
  }
}

function getType (fn) {
  const match = fn && fn.toString().match(/^\s*function (\w+)/)
  return match ? match[1] : ''
}

function isSameType (a, b) {
  return getType(a) === getType(b)
}

/**
 * prop类型判断 => 判断类型是否存在 prop 期待的类型中
 * @param {*} type 
 * @param {*} expectedTypes 
 * @returns 
 */
function getTypeIndex (type, expectedTypes) {
  if (!Array.isArray(expectedTypes)) {
    return isSameType(expectedTypes, type) ? 0 : -1
  }
  for (let i = 0, len = expectedTypes.length; i < len; i++) {
    if (isSameType(expectedTypes[i], type)) {
      return i
    }
  }
  return -1
}

/**
 * 获取 prop 的默认值
 * @param {*} vm 
 * @param {*} prop 
 * @param {*} key 
 */
function getPropDefaultValue (vm, prop, key) {
  if (!hasOwn(prop, 'default')) {
    return undefined
  }

  const def = prop.default
  // 忽略判断：如果是数组或对象，则必须通过函数来返回，确保引用唯一性

  if (vm && vm.$options.propsData &&
    vm.$options.propsData[key] === undefined &&
    vm._props[key] !== undefined
  ) {
    return vm._props[key]
  }

  return typeof def === 'function' && getType(prop.type) !== 'Function'
    ? def.call(vm)
	  : def
}