/* @flow */

import config from '../config'
import VNode, { createEmptyVNode } from './vnode'
import { createComponent } from './create-component'
import { traverse } from '../observer/traverse'

import {
  warn,
  isDef,
  isUndef,
  isTrue,
  isObject,
  isPrimitive,
  resolveAsset
} from '../util/index'

import {
  normalizeChildren,
  simpleNormalizeChildren
} from './helpers/index'

const SIMPLE_NORMALIZE = 1 // 编译成render函数
const ALWAYS_NORMALIZE = 2 // 手写render函数

// wrapper function for providing a more flexible interface
// without getting yelled at by flow
/**
 * 创建vnode（包装函数）
 * @params context: 当前vm实例（上下文环境）
 * @params tag: 标签名 | 对象(组件)
 * @params data: VNodeData类型 => 用户传参
 * @params children: 子节点（tree）
 * @params normalizationType: 表示子节点规范使用哪个函数，它主要参考render函数是编译生成的还是用户手写的
 * @params alwaysNormalize:  是否深层规划化（递归子节点）=> 手写render函数：true；编译生成render函数：false
 */
export function createElement (
  context: Component,
  tag: any,
  data: any,
  children: any,
  normalizationType: any,
  alwaysNormalize: boolean
): VNode | Array<VNode> {
  debugger
  // 参数重载（传参个数差异化处理）
  if (Array.isArray(data) || isPrimitive(data)) {
    normalizationType = children
    children = data
    data = undefined
  }
  if (isTrue(alwaysNormalize)) {
    normalizationType = ALWAYS_NORMALIZE
  }
  
  return _createElement(context, tag, data, children, normalizationType)
}

/**
 * 创建Vnode
 * @params context: 当前vm实例（Vnode上下文环境），它是Component类型
 * @params tag: 字符串（标签名） | 组件 | 函数 | 对象
 * @params data: Vnode的数据（VNodeData） => 用户传参
 * @params chilren: 当前Vnode的子节点，它是任意类型的，它接下来需要被规范为标准的 VNode 数组
 * @params normalizationType: 表示规范子节点时使用哪个函数，它主要参考render函数是编译生成的还是用户手写的
 */
export function _createElement (
  context: Component,
  tag?: string | Class<Component> | Function | Object,
  data?: VNodeData,
  children?: any,
  normalizationType?: number
): VNode | Array<VNode> {
  // 判断data是否为响应式的，不允许data为响应式数据
  if (isDef(data) && isDef((data: any).__ob__)) {
    process.env.NODE_ENV !== 'production' && warn(
      `Avoid using observed data object as vnode data: ${JSON.stringify(data)}\n` +
      'Always create fresh vnode data objects in each render!',
      context
    )
    return createEmptyVNode()
  }
  // object syntax in v-bind
  // componentIS
  if (isDef(data) && isDef(data.is)) {
    tag = data.is
  }
  // 判断componentIS
  if (!tag) {
    // in case of component :is set to falsy value
    return createEmptyVNode()
  }
  // warn against non-primitive key
  // key只能是基础类型的数据
  if (process.env.NODE_ENV !== 'production' &&
    isDef(data) && isDef(data.key) && !isPrimitive(data.key)
  ) {
    if (!__WEEX__ || !('@binding' in data.key)) {
      warn(
        'Avoid using non-primitive value as key, ' +
        'use string/number value instead.',
        context
      )
    }
  }
  // support single function children as default scoped slot
  // children处理
  if (Array.isArray(children) &&
    typeof children[0] === 'function'
  ) {
    // 作用域插槽相关
    data = data || {}
    data.scopedSlots = { default: children[0] }
    children.length = 0
  }
  // 对children做normaliza（转换为一维数组）
  if (normalizationType === ALWAYS_NORMALIZE) {
    // 递归打平
    // 1.render函数是用户手写的，当children只有一个节点的时候，Vue从接口层面允许用户把children写成基础类型用来创建单个简单的文本节点
    // 2.当编译slot、v-for的时候会产生嵌套数组的情况
    children = normalizeChildren(children)
  } else if (normalizationType === SIMPLE_NORMALIZE) {
    // render函数是编译生成的
    children = simpleNormalizeChildren(children)
  }
  let vnode, ns
  // 开始创建vnode
  if (typeof tag === 'string') { // 普通dom节点
    let Ctor
    ns = (context.$vnode && context.$vnode.ns) || config.getTagNamespace(tag)
    if (config.isReservedTag(tag)) { // 平台保留标签
      // platform built-in elements
      if (process.env.NODE_ENV !== 'production' && isDef(data) && isDef(data.nativeOn)) {
        // .native只能用在组件上
        warn(
          `The .native modifier for v-on is only valid on components but it was used on <${tag}>.`,
          context
        ) 
      }
      vnode = new VNode(
        config.parsePlatformTagName(tag), data, children,
        undefined, undefined, context
      )
    } else if ((!data || !data.pre) && isDef(Ctor = resolveAsset(context.$options, 'components', tag))) {
      // 实例化组件
      vnode = createComponent(Ctor, data, context, children, tag)
    } else {
      // 不认识的节点 
      // unknown or unlisted namespaced elements
      // check at runtime because it may get assigned a namespace when its
      // parent normalizes children
      vnode = new VNode(
        tag, data, children,
        undefined, undefined, context
      )
    }
  } else { // 组件（渲染的是一个组件）
    // direct component options / constructor（创建组件Vnode占位符）
    vnode = createComponent(tag, data, context, children)
  }
  if (Array.isArray(vnode)) {
    return vnode
  } else if (isDef(vnode)) {
    if (isDef(ns)) applyNS(vnode, ns)
    if (isDef(data)) registerDeepBindings(data)
    return vnode
  } else {
    return createEmptyVNode()
  }
}

function applyNS (vnode, ns, force) {
  vnode.ns = ns
  if (vnode.tag === 'foreignObject') {
    // use default namespace inside foreignObject
    ns = undefined
    force = true
  }
  if (isDef(vnode.children)) {
    for (let i = 0, l = vnode.children.length; i < l; i++) {
      const child = vnode.children[i]
      if (isDef(child.tag) && (
        isUndef(child.ns) || (isTrue(force) && child.tag !== 'svg'))) {
        applyNS(child, ns, force)
      }
    }
  }
}

// ref #5318
// necessary to ensure parent re-render when deep bindings like :style and
// :class are used on slot nodes
function registerDeepBindings (data) {
  if (isObject(data.style)) {
    traverse(data.style)
  }
  if (isObject(data.class)) {
    traverse(data.class)
  }
}
