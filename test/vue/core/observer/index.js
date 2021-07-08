// import VNode from "../../../vdom/vnode.js"
import Dep from "./dep.js"
import { arrayMethods } from './array.js'
import {
  def,
  hasProto
} from '../util/index.js'
import {
  isObject,
  hasOwn
} from '../../shared/util.js'

const arrayKeys = Object.getOwnPropertyNames(arrayMethods)

/**
 * 尝试创建一个观察者实例，如果创建成功，直接返回新创建的观察者实例，
 * 如果 Value 已经存在一个Observer实例，则直接返回它。
 * @param {*} value 
 * @param {*} asRootData 是否是根节点
 * @returns 
 */
export function observe (value, asRootData) {
  // if (!isObject(value) || value instanceof VNode) {
  //   return
  // }
  if (!isObject(value)) {
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

// 观察者
export class Observer {
  constructor(value) {
    this.value = value
    // 依赖收集器 => 数组
    this.dep = new Dep()

    // 该属性用于判断是否已经转为“可观测”对象
    def(value, '__ob__', this)
    if (Array.isArray(value)) {
      const augment = hasProto
        ? protoAugment
        : copyAugment

      // 设置拦截器
      augment(value, arrayMethods, arrayKeys)
      // 将数组中所有元素转为“可观测”对象
      this.observeArray(value)
    } else {
      this.walk(value)
    }
  }

  // 遍历对象属性，转为“可观测”对象
  walk (obj) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i])
    }
  }

  // 将数组中所有元素转为“可观测”对象
  observeArray (items) {
    for (let i = 0, l = items.length; i < l; i++) {
      observe(items[i])
    }
  }
}

/**
 * 数据劫持
 * @param {*} obj 对象
 * @param {*} key 键
 * @param {*} val 值
 */
function defineReactive (obj, key, val) {
  const dep = new Dep() // 依赖收集器 => 对象属性

  if (arguments.length === 2) {
    val = obj[key]
  }

  // 尝试为子节点创建一个观察者实例
  let childOb = typeof val === 'object' && observe(val)
  
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get () {
      console.log(`Get attribute：${key}, value is：${val}`)
      // 添加依赖
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
      console.log(`Set attribute：${key}, value is：${newVal}`)
      val = newVal
      // 通知更新
      dep.notify()
    }
  })
}

/**
 * 重新定义原型对象（需浏览器支持__proto__）=> 拦截器
 * @param {*}} target 
 * @param {*} src 
 */
function protoAugment (target, src) {
  target.__proto__ = src
}

/**
 * 复制对象属性 => 重写数组方法
 * @param {*} target 
 * @param {*} src 
 * @param {*} keys 
 */
function copyAugment (target, src, keys) {
  for (let i = 0, l = keys.length; i < l; i++) {
    const key = keys[i]
    def(target, key, src[key])
  }
}

export function set (target, key, value) {}