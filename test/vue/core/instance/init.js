import { initState } from './state.js'
import { initLifecycle } from './lifecycle.js'
import { mergeOptions } from '../util/index.js'

let uid = 0

// 初始化Vue类
export function initMixin (Vue) {
  Vue.prototype._init = function (options) {
    const vm = this

    vm.uid = uid++
    vm.$options = mergeOptions(
      resolveConstructorOptions(vm.constructor), // vm.constructor.options => Vue.options
      options || {},
      vm
    )
    
    vm._self = vm
    initLifecycle(vm)                    // 初始化生命周期
    // initEvents(vm)                       // 初始化事件
    // initRender(vm)                       // 初始化渲染
    // callHook(vm, 'beforeCreate')         // 调用生命周期钩子函数
    // initInjections(vm)                   // 初始化injections
    initState(vm)                        // 初始化props,methods,data,computed,watch
    // initProvide(vm)                      // 初始化 provide
    // callHook(vm, 'created')              // 调用生命周期钩子函数

    debugger
    // 执行挂载
    if (vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
  }
}

/**
 * 获取构造器的options
 * @param {*} Ctor 构造器
 * @returns 
 */
export function resolveConstructorOptions (Ctor) {
  let options = Ctor.options
  return options
}
