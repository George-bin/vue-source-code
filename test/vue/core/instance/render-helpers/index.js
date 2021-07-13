import { toString } from '../../../shared/util.js'
import { createTextVNode } from '../../vdom/vnode.js'
import { renderStatic } from './render-static.js'

export function installRenderHelpers(target) {
  target._v = createTextVNode
  target._s = toString
  target._m = renderStatic
}