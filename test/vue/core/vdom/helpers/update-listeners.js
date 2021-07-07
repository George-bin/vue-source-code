import {
  cached
} from '../../../shared/util.js'

// name、once、capture、passive、handler、params
const normalizeEvent = cached((name)  => {
  const passive = name.charAt(0) === '&'
  name = passive ? name.slice(1) : name
  const once = name.charAt(0) === '~' // Prefixed last, checked first
  name = once ? name.slice(1) : name
  const capture = name.charAt(0) === '!'
  name = capture ? name.slice(1) : name
  return {
    name,
    once,
    capture,
    passive
  }
})

/**
 * 创建一个函数调用
 * @param {*} fns 
 * @param {*} vm 
 * @returns 
 */
export function createFnInvoker (fns, vm) {
  function invoker () {
    const fns = invoker.fns
    if (Array.isArray(fns)) {
      const cloned = fns.slice()
      for (let i = 0; i < cloned.length; i++) {
        invokeWithErrorHandling(cloned[i], null, arguments, vm, `v-on handler`)
      }
    } else {
      // return handler return value for single handlers
      return invokeWithErrorHandling(fns, null, arguments, vm, `v-on handler`)
    }
  }
  invoker.fns = fns
  return invoker
}

/**
 * 对比on和oldOn => 注册新事件，卸载无用事件
 * @param {*} on => listeners
 * @param {*} oldOn => oldListeners
 * @param {*} add 
 * @param {*} remove 
 * @param {*} vm 
 */
export function updateListeners (on, oldOn, add, remove, vm) {
  let name, def, cur, old, event
  // 遍历on => 找出新增事件
  for (name in on) {
    def = cur = on[name]
    old = oldOn[name]
    event = normalizeEvent(name)

    if (isUndef(cur)) {
      process.env.NODE_ENV !== 'production' && warn(
        `Invalid handler for event "${event.name}": got ` + String(cur),
        vm
      )
    } else if (isUndef(old)) {
      if (isUndef(cur.fns)) {
        cur = on[name] = createFnInvoker(cur, vm)
      }
      if (isTrue(event.once)) {
        cur = on[name] = createOnceHandler(event.name, cur, event.capture)
      }
      // 添加事件
      add(event.name, cur, event.capture, event.passive, event.params)
    } else if (cur !== old) {
      old.fns = cur
      on[name] = old
    }
  }
  // 遍历oldOn => 找出需要卸载的事件
  for (name in oldOn) {
    if (isUndef(on[name])) {
      event = normalizeEvent(name)
      // 卸载事件
      remove(event.name, oldOn[name], event.capture)
    }
  }
}