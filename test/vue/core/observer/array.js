const arrayProto = Array.prototype
export const arrayMethods = Object.create(arrayProto)

const methodsToPatch = [
	'push',
	'pop',
	'shift',
	'unshift',
	'splice',
	'sort',
	'reverse'
]

// 对 Array 原型对象上方法进行扩展
methodsToPatch.forEach(function (method) {
  // 缓存原型方法
	const original = arrayProto[method]
	Object.defineProperty(arrayMethods, method, {
		enumerable: false,
		configurable: true,
		writable: true,
		value: function mutator(...args) {
      // 调用原型方法
			const result = original.apply(this, args)
			const ob = this.__ob__
			// add element
			let inserted
			switch(method) {
				case 'push':
				case 'unshift':
					inserted = args
					break
				case 'splice':
					inserted = args.slice(2)
					break
			}

      // 将新添加的元素转为“可观测对象”
			if (inserted) {
				ob.observeArray(inserted) // 调用observe函数将新增的元素转化为可侦测对象
			}
			// notify change
			ob.dep.notify()
			return result
		}
	})
})