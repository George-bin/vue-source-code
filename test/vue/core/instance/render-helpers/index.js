import { toString } from '../../../shared/util.js'
import { createTextVNode, createEmptyVNode } from '../../vdom/vnode.js'
import { renderList } from './render-list.js'
import { renderStatic } from './render-static.js'
import { resolveFilter } from './resolve-filter.js'

export function installRenderHelpers(target) {
  target._v = createTextVNode
  target._s = toString
  target._m = renderStatic
  target._f = resolveFilter     // 获取filter
  target._e = createEmptyVNode
  target._l = renderList        // 列表渲染
}