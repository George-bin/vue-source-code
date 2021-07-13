import { isUndef } from "../../../shared/util.js"
import { updateListeners } from "../../../core/vdom/helpers/index.js"

let target

function add(name, handler, capture, passive) {
  target.addEventListener(
    name,
    handler,
    capture
  )
}

function remove (name, handler, capture, _target) {
  (_target || target).removeEventListener(
    name,
    handler._wrapper || handler,
    capture
  )
}

/**
 * 更新事件监听
 * @param {*} oldVnode 
 * @param {*} vnode 
 * @returns 
 */
function updateDOMListeners (oldVnode, vnode) {
  // debugger
  if (isUndef(oldVnode.data) && isUndef(vnode.data)) {
    return
  }
  const on = vnode.data.on || {}
  const oldOn = oldVnode.data.on || {}
  target = vnode.elm
  updateListeners(on, oldOn, add, remove, vnode.context)
  target = undefined
}

export default {
  create: updateDOMListeners,
  update: updateDOMListeners
}