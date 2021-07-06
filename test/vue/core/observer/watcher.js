import Dep from './dep.js'

export default class Watcher {
  constructor (vm, expOrFn, cb) {
    this.vm = vm
    this.cb = cb
    this.getter = parsePath(expOrFn)
    this.value = this.get()
  }

  get () {
    Dep.target = this
    const vm  = this.vm
    let value = this.getter.call(vm, vm)
    Dep.target = null
    return value
  }

  update () {
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