/* @flow */

import { ASSET_TYPES } from 'shared/constants'
import { defineComputed, proxy } from '../instance/state'
import { extend, mergeOptions, validateComponentName } from '../util/index'

export function initExtend (Vue: GlobalAPI) {
  /**
   * Each instance constructor, including Vue, has a unique
   * cid. This enables us to create wrapped "child
   * constructors" for prototypal inheritance and cache them.
   */
  Vue.cid = 0
  let cid = 1 // 子组件cid

  /**
   * Class inheritance（类继承）=> 利用原型继承的方式创建子类构造器
   * @params extendOptions：组件选项（用户传参 ｜ 模板编译）
   */
  Vue.extend = function (extendOptions: Object): Function {
    extendOptions = extendOptions || {}
    // 注意：this实际指向Vue本身，因为它是作为Vue静态方法调用的 => Vue.extend
    const Super = this
    // Vue.cid => 唯一id
    const SuperId = Super.cid
    // 缓存优化，同一个组件，只会在第一次使用时定义，之后会重复使用该定义
    const cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {})
    if (cachedCtors[SuperId]) {
      return cachedCtors[SuperId]
    }

    // 组件名称 => 校验组件name
    const name = extendOptions.name || Super.options.name
    if (process.env.NODE_ENV !== 'production' && name) {
      validateComponentName(name)
    }

    // 定义子构造函数 => 原型继承
    const Sub = function VueComponent (options) {
      this._init(options)
    }
    Sub.prototype = Object.create(Super.prototype)
    Sub.prototype.constructor = Sub
    Sub.cid = cid++
    // 合并配置（扩展）
    Sub.options = mergeOptions(
      Super.options,
      extendOptions
    )
    Sub['super'] = Super

    // For props and computed properties, we define the proxy getters on
    // the Vue instances at extension time, on the extended prototype. This
    // avoids Object.defineProperty calls for each instance created.
    // 优化：对与props和计算属性，我们在扩展原型的Vue实例上定义代理getter。这样可以避免对创建的每个实例调用Object.defineProperty
    if (Sub.options.props) {
      initProps(Sub)
    }
    if (Sub.options.computed) {
      initComputed(Sub)
    }

    // 复制静态方法
    // allow further extension/mixin/plugin usage
    Sub.extend = Super.extend
    Sub.mixin = Super.mixin
    Sub.use = Super.use

    // create asset registers, so extended classes
    // can have their private assets too.
    ASSET_TYPES.forEach(function (type) {
      Sub[type] = Super[type]
    })
    // enable recursive self-lookup（递归组件 => 组件自己调用自己）
    if (name) {
      Sub.options.components[name] = Sub
    }

    // keep a reference to the super options at extension time.（在扩展时保留对Super(Vue) options的引用）
    // later at instantiation we can check if Super's options have been updated.（后面实例化时，可以检查Super(Vue)的options是否有更新）
    Sub.superOptions = Super.options
    Sub.extendOptions = extendOptions
    Sub.sealedOptions = extend({}, Sub.options) // 这是干啥类？

    // cache constructor（缓存构造函数）
    cachedCtors[SuperId] = Sub
    return Sub
  }
}

function initProps (Comp) {
  const props = Comp.options.props
  for (const key in props) {
    proxy(Comp.prototype, `_props`, key)
  }
}

function initComputed (Comp) {
  const computed = Comp.options.computed
  for (const key in computed) {
    defineComputed(Comp.prototype, key, computed[key])
  }
}
