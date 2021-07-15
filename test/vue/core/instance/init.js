import { initState } from './state.js'
import { initEvents } from './events.js'
import { initLifecycle, callHook } from './lifecycle.js'
import { mergeOptions } from '../util/index.js'
import { initRender } from './render.js'

let uid = 0

// 初始化Vue类
export function initMixin (Vue) {
  Vue.prototype._init = function (options) {
    const vm = this

    vm.uid = uid++
    vm._isVue = true

    if (options && options._isComponent) {
      initInternalComponent(vm, options)
    } else {
      // 合并配置
      vm.$options = mergeOptions(
        resolveConstructorOptions(vm.constructor), // vm.constructor.options => Vue.options
        options || {},
        vm
      )
    }

    vm._renderProxy = vm
    
    vm._self = vm
    initLifecycle(vm)                    // 初始化生命周期，建立父子组件关系
    initEvents(vm)                       // 初始化事件系统
    initRender(vm)                       // 初始化渲染函数
    callHook(vm, 'beforeCreate')         // 调用生命周期钩子函数
    // initInjections(vm)                   // 初始化injections
    initState(vm)                        // 初始化props,methods,data,computed,watch
    // initProvide(vm)                      // 初始化 provide
    callHook(vm, 'created')              // 调用生命周期钩子函数

    // debugger
    // 执行挂载
    if (vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
  }
}

/**
 * 初始化组件 options
 * @param {*} vm 当前组件实例
 * @param {*} options 组件特有属性 
 */
function initInternalComponent (vm, options) {
  const opts = vm.$options = Object.create(vm.constructor.options)

  const parentVnode = options._parentVnode
  opts.parent = options.parent
  opts._parentVnode = parentVnode

  const vnodeComponentOptions = parentVnode.vnodeComponentOptions
  opts.propsData = vnodeComponentOptions.propsData
  opts._parentListeners = vnodeComponentOptions.listeners
  opts._renderChildren = vnodeComponentOptions.children
  opts._componentTag = vnodeComponentOptions.tag

  if (options.render) {
    opts.render = options.render
    opts.staticRenderFns = options.staticRenderFns
  }
}

/**
 * 获取构造器的options
 * @param {*} Ctor 构造器
 * @returns 
 */
export function resolveConstructorOptions (Ctor) {
  let options = Ctor.options
  if (Ctor.super) {
    const superOptions = resolveConstructorOptions(Ctor.super)
    const cachedSuperOptions = Ctor.superOptions
    // Vue基础配置项发生变化
    if (superOptions !== cachedSuperOptions) {
    }
  }
  return options
}
