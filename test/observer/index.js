import VNode from '../vdom/vnode.js'
import Dep from './Dep.js'
import {arrayMethods} from './array.js'
import {
	def,
	hasOwn,
	isObject
} from '../utils/index.js'
const arrayKeys = Object.getOwnPropertyNames(arrayMethods)

// 能力检测：判断__proto__是否可用，因为有的浏览器不支持该属性
const hasProto = '__proto__' in {}

// 创建一个可观测的对象
export default class Observer {
	constructor (value) {
		this.value = value
		this.dep = new Dep() // 实例化一个依赖管理器，用于收集数组依赖
		// __ob__属性用于标记对象已经是可观测对象（响应式对象），避免重复监测
		def(value, '__ob__', this)

		if (Array.isArray(value)) {
			// 方法拦截器
			const augment = hasProto
				? protoAugment
				: copyAugment
			augment(value, arrayMethods, arrayKeys)
			this.observeArray(value) // 将数组中的所有元素都转化为可侦测的对象
		} else {
			this.walk(value)
		}
	}

	// 对象
	walk (obj) {
		const keys = Object.keys(obj)
		for (let i = 0, len = keys.length; i < len; i++) {
			defineReactive(obj, keys[i])
		}
	}

	// 数组
	observeArray (items) {
		for (let i = 0, l = items.length; i < l; i++) {
			observe(items[i])
		}
	}
}

// 尝试为value创建一个Observer的实例，如果创建成功，直接返回新创建的Observer实例。
// 如果value已经存在一个Observer实例，则直接返回它。
export function observe (value, asRootData) {
	if (!isObject(value) || value instanceof VNode) {
		return
	}
	let ob
	if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
		ob = value.__ob__
	} else {
		ob = new Observer(value)
	}
	return ob
}

// 将对象转换为一个可监测的对象（数据劫持 => 访问器属性）
function defineReactive(obj, key, val) {
	if (arguments.length === 2) {
		val = obj[key]
	}

	// 依赖收集器
	const dep = new Dep()

	// 递归对属性进行数据劫持 => 如果属性值是一个对象，则创建为可观测对象
	let childOb = observe(val)
	Object.defineProperty(obj, key, {
		enumerable: true,
		configurable: true,
		get () {
			// console.log(`${key}属性被读取了！`)
			// 依赖收集
			dep.depend()
			if (childOb) {
				childOb.dep.depend()
			}
			return val
		},
		set (newVal) {
			if (val === newVal) {
				return
			}
			console.log(`${key}属性被修改了！`)
			val = newVal
			// 通知更新
			dep.notify()
		}
	})
}

// 通过使用__proto__截取原型链来扩展目标对象或数组
function protoAugment(target, src) {
	target.__proto__ = src
}

// 通过定义隐藏属性(覆盖同名属性)来扩展目标对象或数组
function copyAugment(target, src, keys) {
	for (let i = 0, l = keys.length; i < l; i++) {
	    const key = keys[i]
	    def(target, key, src[key])
	 }
}