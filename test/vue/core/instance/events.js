/**
 * 初始化当前实例的事件系统
 * @param {*} vm 当前实例
 */
export function initEvents (vm) {
  vm._events = Object.create(null)
  vm._hasHookEvent = false
  // 获取父组件注册的事件
  const listeners = vm.$options._parentListeners
  if (listeners) {
    updateComponentListeners(vm, listeners)
  }
}

let target
/**
 * 添加事件
 * @param {*} event 
 * @param {*} fn 
 * @param {*} once 
 */
function add (event, fn, once) {
  if (once) {
    target.$once(event, fn)
  } else {
    target.$on(event, fn)
  }
}

/**
 * 移除事件
 * @param {*} event 
 * @param {*} fn 
 */
function remove (event, fn) {
  target.$off(event, fn)
}

/**
 * 对比listeners和oldListeners => 注册新事件，卸载旧事件
 * @param {*} vm 
 * @param {*} listeners 
 * @param {*} oldListeners 
 */
export function updateComponentListeners (vm, listeners, oldListeners) {
  target = vm
  updateListeners(listeners, oldListeners || {}, add, remove, vm)
  target = undefined
}

