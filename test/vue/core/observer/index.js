import VNode from "../../../vdom/vnode.js"
import Dep from "./dep.js"

/**
 * 尝试创建一个观察者实例，如果创建成功，直接返回新创建的观察者实例，
 * 如果 Value 已经存在一个Observer实例，则直接返回它。
 * @param {*} value 
 * @param {*} asRootData 
 * @returns 
 */
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

// 观察者
export class Observer {
  constructor(value) {
    this.value = value

    const dep = new Dep() // 依赖收集器 => 数组
    if (Array.isArray(value)) {
      
    } else {
      this.walk(value)
    }
  }

  walk (obj) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i])
    }
  }

}

function defineReactive (obj, key, val) {
  if (arguments.length === 2) {
    val = obj[key]
  }
  if (typeof val === 'object') {
    new Observer()
  }

  const dep = new Dep() // 依赖收集器 => 对象属性
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get () {
      console.log(`Get attribute：${key}, value is：${val}`)
      // 添加依赖
      dep.depend()
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