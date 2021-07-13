import { activeInstance } from '../instance/lifecycle.js'
import {
  isObject,
  isUndef
} from '../util/index.js'
import VNode from '../vdom/vnode.js'

// 组件Vnode相关钩子
const componentVNodeHooks = {
  /**
   * 初始化组件
   * @params vnode: 组件Vnode
   */
  init (vnode) {
    // 创建一个子组件实例
    const child = vnode.componentInstance = createComponentInstanceForVnode(
      vnode,
      activeInstance
    )
    // 执行挂载流程
    child.$mount(undefined)
  },

  prepatch (oldVnode, vnode) {
    const options = vnode.componentOptions
    const child = vnode.componentInstance = oldVnode.componentInstance
    updateChildComponent(
      child,
      options.propsData, // updated props
      options.listeners, // updated listeners
      vnode, // new parent vnode
      options.children // new children
    )
  },

  insert (vnode) {
    const { context, componentInstance } = vnode
    if (!componentInstance._isMounted) {
      componentInstance._isMounted = true
      callHook(componentInstance, 'mounted')
    }
  },

  destroy (vnode) {
    const { componentInstance } = vnode
    if (!componentInstance._isDestroyed) {
      if (!vnode.data.keepAlive) {
        componentInstance.$destroy()
      } else {
        deactivateChildComponent(componentInstance, true /* direct */)
      }
    }
  }
}

const hooksToMerge = Object.keys(componentVNodeHooks)

/**
 * 安装组件钩子
 * @param {VNodeData} data 
 */
function installComponentHooks (data) {
  const hooks = data.hook || (data.hook = {})
  for (let i = 0; i < hooksToMerge.length; i++) {
    const key = hooksToMerge[i]
    const existing = hooks[key] // 自定义组件hook
    const toMerge = componentVNodeHooks[key] // 全局组件hook
    if (existing !== toMerge && !(existing && existing._merged)) {
      hooks[key] = existing ? mergeHook(toMerge, existing) : toMerge
    }
  }
}

/**
 * 合并组件hook
 * @params f1: 自定义钩子
 * @params f2: 全局钩子
 */
function mergeHook (fn1, fn2) {
  // 先执行全局钩子，再执行自定义钩子
  const merged = (a, b) => {
    fn1(a, b)
    fn2(a, b)
  }
  merged._merged = true
  return merged
}

/**
 * 创建一个组件 Vnode
 * @param {*} Ctor 构造器 | 函数 | 对象（编译生成）
 * @param {*} data 
 * @param {*} context 
 * @param {*} children 
 * @param {*} tag 
 */
export function createComponent (Ctor, data, context, children, tag) {
  if (isUndef(Ctor)) {
    return
  }

  const baseCtor = context.$options._base

  // 当传入一个对象时，需要手动构造 子类构造器（扩展子类相关属性）
  if (isObject(Ctor)) {
    Ctor = baseCtor.extend(Ctor) // => Vue.extend
  }

  data = data || {}

  // 安装组件相关的钩子
  installComponentHooks(data)

  const name = Ctor.options.name || tag
  const vnode = new VNode(
    `vue-component-${Ctor.cid}${name ? `-${name}` : ''}`,
    data, undefined, undefined, undefined, context,
    { Ctor, propsData:undefined, listeners:undefined, tag, children },
    undefined
  )

  return vnode
}

// 实例化子类
export function createComponentInstanceForVnode (vnode, parent) {
  const options = {
    _isComponent: true,
    _parentVnode: vnode, // 占位符（位于父节点中）
    parent
  }
  return new vnode.componentOptions.Ctor(options)
}