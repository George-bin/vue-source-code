import { simpleNormalizeChildren, normalizeChildren } from "./helpers/normalize-chidlren.js"
import VNode from "./vnode.js"
const SIMPLE_NORMALIZE = 1 // 编译成render函数
const ALWAYS_NORMALIZE = 2 // 手写render函数

/**
 * 创建VNode（包装函数）
 * @param {*} context 
 * @param {*} tag 标签名
 * @param {*} data 
 * @param {*} children 子节点 
 * @param {*} normalizationType 表示子节点规范使用哪个函数，它主要参考render函数是编译生成的还是用户手写的
 * @param {*} alwaysNormalize 是否深层规范化（递归子节点）=> 手写render函数：true；编译生成render函数：false
 * @returns 
 */
export function createElement (context, tag, data, children, normalizationType, alwaysNormalize) {
  // 忽略：参数差异化处理

  if (alwaysNormalize) {
    normalizationType = ALWAYS_NORMALIZE
  }

  return _createElement(context, tag, data, children, normalizationType)
}

export function _createElement(context, tag, data, children, normalizationType) {

  // 将多维数组拍平 => 转为一维数组
  if (Array.isArray(children) && typeof children[0] === 'function') {
    if (normalizationType === ALWAYS_NORMALIZE) {
      // 手写 render 函数
      children = normalizeChildren(children)
    } else if (normalizationType === SIMPLE_NORMALIZE) {
      // 编译生成 render 函数
      children = simpleNormalizeChildren(children)
    }
  }

  let vnode
  if (typeof tag === 'string') {
    let Ctor
    vnode = new VNode(
      tag, data, children,
      undefined, undefined, context
    )
  }

  return vnode
}
