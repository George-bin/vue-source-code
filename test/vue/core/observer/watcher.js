import Dep from './dep.js'
import { queueWatcher } from './scheduler.js'

let uid = 0

export default class Watcher {
  /**
   * @param {*} vm 
   * @param {*} expOrFn 用于执行渲染函数
   * @param {*} cb 
   * @param {*} options 配置项
   * @param {*} isRenderWatcher 是否为渲染 Watcher
   */
  constructor (vm, expOrFn, cb, options, isRenderWatcher) {
    this.vm = vm

    if (isRenderWatcher) {
      vm._watcher = this
    }
    vm._watchers.push(this)

    if (options) {
      this.before = options.before
    }

    this.cb = cb
    this.id = ++uid

    this.deps = []
    this.newDeps = []
    this.depIds = new Set()
    this.newDepIds = new Set()

    this.active = true // 是否是活跃的，如果已经卸载则不再触发更新

    if (typeof expOrFn === 'function') {
      this.getter = expOrFn
    } else {
      this.getter = parsePath(expOrFn)
    }
    
    this.value = this.get()
  }

  get () {
    Dep.target = this
    const vm  = this.vm
    let value = this.getter.call(vm, vm)
    Dep.target = null
    return value
  }

  // 添加依赖项
  addDep (dep) {
    const id = dep.id
    if (!this.newDepIds.has(id)) {
      this.newDepIds.add(id)
      this.newDeps.push(dep)
      if (!this.depIds.has(id)) {
        dep.addSub(this)
      }
    }
  }

  // 推入到更新队列中
  update () {
    queueWatcher(this)
	}

  // 执行更新
  run () {
    const oldValue = this.value
    this.value = this.get()
    this.cb.call(this.vm, this.value, oldValue)
  }
}

/**
 * 把一个形如'data.a.b.c'的字符串路径所表示的值，从真实的data对象中提取出来
 * 例如：
 * data = {a:{b:{c:2}}}
 * parsePath('a.b.c')(data)  // 2
 */
 const bailBE = /[^\w.$]/
 export function parsePath (path) {
   if (bailBE.test(path)) {
     return
   }
   const segments = path.split('.')
   return function (obj) {
     for (let i = 0, len = segments.length; i < len; i++) {
       if (!obj) return
       obj = obj[segments[i]]
     }
     return obj
   }
 }