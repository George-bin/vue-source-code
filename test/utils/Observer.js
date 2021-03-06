export default class Observer {
	constructor (value) {
		this.value = value
		// __ob__属性用于标记对象已经是可监测对象（响应式对象，避免重复监测
		if (Array.isArray(value)) {
			// 
		} else {
			this.walk(value)
		}
	}
	walk (obj) {
		const keys = Object.keys(obj)
		for (let i = 0, len = keys.length; i < len; i++) {
			defineReactive(obj, keys[i])
		}
	}
}

// 将对象转换为一个可监测的对象
function defineReactive(obj, key, val) {
	if (arguments.length === 2) {
		val = obj[key]
	}
	Object.defineProperty(obj, key, {
		enumerable: true,
		configurable: true,
		get () {
			console.log(`${key}属性被读取了！`)
			return val;
		},
		set (newVal) {
			if (val === newVal) {
				return
			}
			console.log(`${key}属性被修改了！`)
			val = newVal
		}
	})
}