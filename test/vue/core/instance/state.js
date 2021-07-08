import { isPlainObject } from '../../shared/util.js'
import { observe } from '../observer/index.js'
import { isReserved } from '../util/index.js'

// 定义了一个访问器属性
const sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: () => {},
  set: () => {}
}

/**
 * 数据代理，如vm.key => vm._data.key
 * @param {*} target 代理对象
 * @param {*} sourceKey 源路径
 * @param {*} key 要访问的属性
 */
export function proxy (target, sourceKey, key) {
  sharedPropertyDefinition.get = function proxyGetter () {
    return this[sourceKey][key]
  }
  sharedPropertyDefinition.set = function proxySetter (val) {
    this[sourceKey][key] = val
  }
  Object.defineProperty(target, key, sharedPropertyDefinition)
}

export function initState (vm) {
  // 用于存储当前实例中所有watcher
  vm._watchers = []

  const opts = vm.$options
  // if (opts.props) initProps(vm, opts.props)
  // if (opts.methods) initMethods(vm, opts.methods)
  if (opts.data) {
    initData(vm)
  } else {
    observe(vm._data = {}, true /* asRootData */)
  }
  // if (opts.computed) initComputed(vm, opts.computed)
  // if (opts.watch && opts.watch !== nativeWatch) {
  //   initWatch(vm, opts.watch)
  // }
}

/**
 * 初始化 props
 * @param {*} vm 
 * @param {*} propsOptions 
 */
function initProps (vm, propsOptions) {
  const propsData = vm.$options.propsData || {} // 父组件传入的真实Props数据
  const props = vm._props = {}                  // 所有设置到props变量中的属性都会保存到vm._props中
  const keys = vm.$options._propKeys = []       // 缓存props对象中的key，将来更新props时只需遍历vm.$options._propKeys数组即可得到所有props的key。
  const isRoot = !vm.$parent                    // 当前组件是否为根组件

  // 不是根组件，则不需要将props数组转换为响应式
  if (!isRoot) {
    toggleObserving(false)
  }

  for (const key in propsOptions) {
    keys.push(key)
    // 校验父组件传入的值是否符合预期
    const value = validateProp(key, propsOptions, propsData, vm)
    // 将键和值添加到props
    defineReactive(props, key, value)

    // 添加完成之后，判断这个key在当前实例上是否存在
    // vm[key] => vm._props[key]
    if (!(key in vm)) {
      proxy(vm, `_props`, key)
    }
  }

}

/**
 * 初始化Data
 * @param {Component} vm 
 */
function initData (vm) {
  let data = vm.$options.data
  
  // 获取data => data必须是一个对象
  data = vm._data = typeof data === 'function'
    ? getData(data, vm)
    : data || {}

  if (!isPlainObject) {
    data = {}
    // 忽略警告：data是一个对象
  }

  const keys = Object.keys(data)
  let i = keys.length
  while(i--) {
    const key = keys[i]
    if (!isReserved(key)) {
      proxy(vm, `_data`, key)
    }
  }

  observe(data, true)
}

/**
 * 从fn中获取data
 * @param {Function} data 
 * @param {Component} vm 
 */
export function getData (data, vm) {
  try {
    return data.call(vm, vm)
  } catch (e) {
    console.error(e)
    return {}
  }
}