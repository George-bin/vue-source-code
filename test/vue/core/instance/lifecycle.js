import Watcher from '../observer/watcher.js'
import { noop } from '../../shared/util.js'
import { pushTarget, popTarget } from '../observer/dep.js'

// 当前实例组件（用于维护实例的父子关系）
export let activeInstance = null
export function setActiveInstance (vm) {
  const prevActiveInstance = activeInstance // 缓存旧的实例
  activeInstance = vm // 设置新的实例
  return () => {
    activeInstance = prevActiveInstance // 重新激活新的实例
  }
}

/**
 * 初始化生命周期，建立父子关系
 */
export function initLifecycle (vm) {
  const options = vm.$options

  let parent = options.parent
  if (parent && !options.abstract) { // 不是抽象组件并存在父级，向上循环 => 直到找到第一个不是抽象类型的父级
    while (parent.$options.abstract && parent.$parent) {
      parent = parent.$parent
    }
    parent.$children.push(vm)
  }

  vm.$parent = parent // 父实例（非抽象类型的父级）
  vm.$root = parent ? parent.$root : vm // 当前实例的根实例

  vm.$children = []
  // vm.$refs = {}

  vm._watcher = null
  // vm._inactive = null
  // vm._directInactive = false
  vm._isMounted = false // 是否挂载完成
  vm._isDestroyed = false // 是否卸载完成
  vm._isBeingDestroyed = false
}

// 扩展一些原型方法
export function lifecycleMixin (Vue) {
  Vue.prototype._update = function (vnode) {
    // debugger
    const vm = this

    const prevEl = vm.$el
    const prevVnode = vm._vnode // 旧的VNode

    const restoreActiveInstance = setActiveInstance(vm)

    vm._vnode = vnode
    // debugger
    // 第一次渲染
    if (!prevVnode) {
      vm.$el = vm.__patch__(vm.$el, vnode)
    }
    // 对比更新渲染
    else {
      vm.$el = vm.__patch__(prevVnode, vnode)
    }

    restoreActiveInstance()

    if (prevEl) {
      prevEl.__vue__ = null
    }
    if (vm.$el) {
      vm.$el.__vue__ = vm
    }
  }
}

/**
 * 执行具体挂载操作
 * @param {*} vm 实例
 * @param {*} el 挂载元素
 */
export function mountComponent (vm, el) {
  vm.$el = el

  callHook(vm, 'beforeMount')

  let updateComponent = () => {
    debugger
    // 使用 render 函数构建 VNode
    const vnode = vm._render()
    console.log(vnode)
    // 对比更新，生成视图
    vm._update(vnode)
  }

  // 生成渲染Watcher
  new Watcher(vm, updateComponent, noop, {
    before () {
      // 组件已经挂载完成且尚未卸载
      if (vm._isMounted && !vm._isDestroyed) {
        callHook(vm, 'beforeUpdate')
      }
    }
  }, true /* isRenderWatcher */)

  // 如果vm.$vnode == null，表明这不是一次组件的初始化过程，而是通过通过new Vue初始化渲染过程
  if (vm.$vnode == null) {
    vm._isMounted = true
    callHook(vm, 'mounted')
  }

  return vm
}

/**
 * 调用自定义钩子函数
 * @param {*} vm 
 * @param {*} hook 
 */
export function callHook (vm, hook) {
  pushTarget()
  const handlers = vm.$options[hook]
  if (handlers) {
    for (let i = 0, j = handlers.length; i < j; i++) {
      handlers[i].call(vm)
    }
  }
  // if (vm._hasHookEvent) {
  //   vm.$emit('hook:' + hook)
  // }
  popTarget()
}