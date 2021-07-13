// 是否采用微任务
export let isUsingMicroTask = true

const callbacks = []
let pending = false

// 刷新回调队列
function flushCallbacks () {
  pending = false
  const copies = callbacks.slice(0)
  callbacks.length = 0
  for (let i = 0; i < copies.length; i++) {
    copies[i]()
  }
}

let timerFunc

// 使用微任务 => 尽快更新视图
const p = Promise.resolve()
timerFunc = () => {
  p.then(flushCallbacks)
}

// 压入队列
export function nextTick (cb, ctx) {
  let _resolve
  callbacks.push(() => {
    if (cb) {
      try {
        cb.call(ctx)
      } catch(e) {
        console.log(e)
      }
    } else if (_resolve) {
      _resolve()
    }
  })

  if (!pending) {
    pending = true
    timerFunc()
  }

  // 语法糖：this.$nextTick().then(() => {})
  if (!cb && typeof Promise !== 'undefined') {
    return new Promise(resolve => {
      _resolve = resolve
    })
  }
}