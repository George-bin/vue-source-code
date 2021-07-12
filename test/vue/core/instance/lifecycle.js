import Watcher from '../observer/watcher.js'
import { noop } from '../../shared/util.js'
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
  vm.$refs = {}

  vm._watcher = null
  vm._inactive = null
  vm._directInactive = false
  vm._isMounted = false
  vm._isDestroyed = false
  vm._isBeingDestroyed = false
}

// 扩展一些原型方法
export function lifecycleMixin (Vue) {
  Vue.prototype._update = function (vnode) {
    debugger
    const vm = this

    const prevEl = vm.$el
    const prevVnode = vm._vnode // 旧的VNode

    vm._vnode = vnode
    // 第一次渲染
    if (!prevVnode) {
      vm.$el = vm.__patch__(vm.$el, vnode)
    }
    // 对比更新渲染
    else {
      vm.$el = vm.__patch__(prevVnode, vnode)
    }
    debugger

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

  let updateComponent = () => {
    // 使用 render 函数构建 VNode
    const vnode = vm._render()
    console.log(vnode)
    // 对比更新，生成视图
    vm._update(vnode)
  }

  // 生成渲染Watcher
  new Watcher(vm, updateComponent, noop, {
    before () {
      if (vm._isMounted && vm._isDestroyed) {
        // callHook(vm, 'beforeUpdate')
      }
    }
  }, true /* isRenderWatcher */)

  if (vm.$vnode === null) {
    vm._isMounted = true
    // callHook(vm, 'mounted')
  }

  return vm
}