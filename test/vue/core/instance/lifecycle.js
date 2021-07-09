import Watcher from '../observer/watcher.js'
import { noop } from '../../shared/util.js'
/**
 * 初始化生命周期
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

/**
 * 执行具体挂载操作
 * @param {*} vm 实例
 * @param {*} el 
 */
export function mountComponent (vm, el) {
  vm.$el = el

  let updateComponent = () => {
    debugger
    const vnode = vm._render()
    // vm._update(vnode, hydrating)
  }

  // 渲染Watcher
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