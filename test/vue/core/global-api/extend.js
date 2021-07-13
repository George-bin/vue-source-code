import { mergeOptions, extend } from '../util/index.js'
import { ASSET_TYPES } from '../../shared/constants.js'

export function initExtend (Vue) {
  Vue.cid = 0
  let cid = 1 // 子组件cid

  Vue.extend = function (extendOptions) {
    extendOptions = extendOptions || {}
    const Super = this
    const SuperId = Super.cid
    // 缓存子组件构造器，避免重复定义（优化）
    const cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {})
    if (cachedCtors[SuperId]) {
      return cachedCtors[SuperId]
    }

    const name = extendOptions.name || Super.options.name

    // 定义子组件构造器
    const Sub = function VueComponent (options) {
      this._init(options)
    }
    // 原型继承
    Sub.prototype = Object.create(Super.prototype)
    Sub.prototype.constructor = Sub
    Sub.cid = cid++
    // 扩展配置项（组件特有的一些属性）
    Sub.options = mergeOptions(
      Super.options,
      extendOptions
    )
    Sub['super'] = Super


    // 复制静态方法
    Sub.extend = Super.extend
    Sub.mixin = Super.mixin
    Sub.use = Super.use
    ASSET_TYPES.forEach(function (type) {
      Sub[type] = Super[type]
    })

    // 递归组件处理（用于组件内部自己调用自己）
    if (name) {
      Sub.options.components[name] = Sub
    }

    Sub.superOptions = Super.options
    Sub.extendOptions = extendOptions
    Sub.sealedOptions = extend({}, Sub.options) // 这是干啥类？

    // 缓存子组件构造器
    cachedCtors[SuperId] = Sub
    return Sub
  }
}