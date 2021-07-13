import {
  nextTick
} from '../util/index.js'
import { callHook } from '../instance/lifecycle.js'

const queue = []
const activatedChildren = []
let has = {}
let flushing = false
let waiting = false
let index = 0

function resetSchedulerState () {
  index = queue.length = activatedChildren.length = 0
  has = {}
  waiting = flushing = false
}

// let getNow = () => Date.now()

// const performance = window.performance
// if (
//   performance &&
//   typeof performance.now === 'function' &&
//   getNow() > document.createEvent('Event').timeStamp
// ) {
//   getNow = () => performance.now()
// }

// 刷新队列，依次执行 watcher 更新
function flushSchedulerQueue () {
  flushing = true
  let watcher, id

  queue.sort((a, b) => a.id - b.id)

  for (index = 0; index < queue.length; index++) {
    watcher = queue[index]
    if (watcher.before) {
      // 调用 beforeUpdate 钩子
      watcher.before()
    }
    id = watcher.id
    has[id] = null
    watcher.run()
  }

  const activatedQueue = activatedChildren.slice()
  const updatedQueue = queue.slice()

  resetSchedulerState()

  // callActivatedHooks(activatedQueue)
  // 调用 updated 钩子
  callUpdatedHooks(updatedQueue)
}

function callUpdatedHooks (queue) {
  let i = queue.length;
  while (i--) {
    const watcher = queue[i]
    const vm = watcher.vm
    if (vm._watcher === watcher && vm._isMounted && !vm._isDestroyed) {
      callHook(vm, 'updated')
    }
  }
}


export function queueWatcher (watcher) {
  const id = watcher.id
  if (has[id] == null) {
    has[id] = true
    if (!flushing) {
      queue.push(watcher)
    } else {
      let i = queue.length - 1
      while (i > index && queue[i] > watcher.id) {
        i--
      }
      queue.splice(i + 1, 0, watcher)
    }
    if (!waiting) {
      waiting = true
      nextTick(flushSchedulerQueue)
    }
  }

}