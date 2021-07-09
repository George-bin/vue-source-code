import { isDef, isUndef } from '../util/index.js'

function createKeyToOldIdx () {
  let i, key
  const map = {}
  for (i = beginIndex; i < endIdx; ++i) {
    key = children[i].key
    if (isDef(key)) map[key] = i
  }
  return map
}

export function createPatchFunction (backed) {

  const { modules, nodeOps } = backed
  
  /**
   * 根据 VNode 创建真实 DOM
   * @param {*} vnode 
   * @param {*} parentElm 父节点（真实DOM节点）
   * @param {*} refElm 下一个兄弟节点
   */
  function createElm (vnode, parentElm, refElm) {
    const data = vnode.data
    const children = vnode.children
    const tag = tag
    if (isDef(tag)) {
      // 创建元素节点
      vnode.elm = nodeOps.createElement(tag, node)
      createChildren(vnode, children)
      insert(parentElm, vnode.elm, refElm)
    } else if (ifTrue(vnode.isComment)) {
      // 创建注释节点
      vnode.elm = nodeOps.createComment(vnode.text)
      insert(parentElm, vnode.elm, refElm)
    } else {
      // 创建文本节点
      vnode.elm = nodeOps.createTextNode(vnode.text)
      insert(parentElm, vnode.elm, refElm)
    }
  }

  /**
   * 删除节点
   * @param {*} el 
   */
  function removeNode (el) {
    const parent = nodeOps.parentNode(el)
    if (isDef(parent)) {
      nodeOps.removeChild(parent, el)
    }
  }

  function findIdxInOld (node, oldCh, start, end) {
    for (let i = start; i < end; i++) {
      const c = oldCh[i]
      if (isDef(c) && sameVnode(node, c)) return i
    }
  }

  /**
   * 批量创建 DOM 节点
   * @param {*} parentElm 
   * @param {*} refElm 
   * @param {*} vnodes 
   * @param {*} startIdx 
   * @param {*} endIdx 
   */
  function addVnodes (parentElm, refElm, vnodes, startIdx, endIdx) {
    for (; startIdx <= endIdx; ++startIdx) {
      createElm(vnodes[startIdx], )
    }
  }

  /**
   * 批量删除 DOM 节点
   * @param {*} vnodes 
   * @param {*} startIdx 
   * @param {*} endIdx 
   */
  function removeNodes(vnodes, startIdx, endIdx) {
    for(; startIdx <= endIdx; ++startIdx) {
      const ch = vnodes[startIdx]
      if (isDef(ch)) {
        // 元素节点
        if (isDef(ch.tag)) {

        }
        // 文本节点
        else {
          removeNode(ch.elm)
        }
      }
    }
  }

  /**
   * 对比更新子节点
   * @param {*} parentElm 
   * @param {*} oldCh 
   * @param {*} newCh 
   * @param {*} removeOnly 
   */
  function updateChildren (parentElm, oldCh, newCh, removeOnly) {
    let oldStartIdx = 0
    let oldEndIdx = oldCh.length - 1
    let oldStartVnode = oldCh[0]
    let oldEndVnode = oldCh[oldEndIdx]

    let newStartIdx = 0
    let newEndIdx = newCh.length - 1
    let newStartVnode = newCh[0]
    let newEndVnode = newCh[newEndIdx]

    let oldKeyToIdx, idxInOld, vnodeToMove, refElm
    const canMove = !removeOnly
    
    while(oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
      // 如果 oldStartVnode 不存在
      if (isUndef(oldStartVnode)) {
        oldStartVnode = oldCh[++oldStartIdx]
      }
      // 如果 oldEndVnode 不存在
      else if (isUndef(oldEndVnode)) {
        oldEndVnode = oldCh[--oldEndIdx]
      }
      // "旧前"与"新前"属于同一节点，对比更新后，各向后移动一位
      else if (sameVnode(oldStartVnode, newStartVnode)) {
        patchVnode(oldStartVnode, newStartVnode)
        oldStartVnode = oldCh[++oldStartIdx]
        newStartVnode = newCh[++newStartIdx]
      }
      // "旧后"与"新后"属于同一节点，对比更新，各向前移动一位
      else if (sameVnode(oldEndVnode, newEndVnode)) {
        patchVnode(oldEndVnode, newEndVnode)
        oldEndVnode = oldCh[--oldEndIdx]
        newEndVnode = newCh[--newEndIdx]
      }
      // "旧前"与"新后"属于同一节点，对比更新，oldStartVnode 向后移动一位，newEndVnode 向前移动一位
      else if (sameVnode(oldStartVnode, newEndVnode)) {
        patchVnode(oldStartVnode, newEndVnode)
        canMove && nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm))
        oldStartVnode = oldCh[++oldStartIdx]
        newEndVnode = newCh[--newEndIdx]
      }
      // "旧后"与"新前"属于同一节点，对比更新，oldStartVnode 向前移动一位，newStartVnode 向后移动一位
      else if (sameVnode(oldEndVnode, newStartVnode)) {
        patchVnode(oldEndVnode, newStartVnode)
        canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm)
        oldEndVnode = oldCh[--oldEndIdx]
        newStartVnode = newCh[++newStartIdx]
      }
      // 常规对比：
      else {
        if (isUndef(oldKeyToIdx)) oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx)

        idxInOld = isDef(newStartVnode.key)
          ? oldKeyToIdx[newStartVnode.key]
          : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx)
        
        if (isUndef(idxInOld)) {
          createElm(newStartVnode, parentElm, refElm)
        } else {
          vnodeToMove = oldCh[idxInOld]
          if (sameVnode(vnodeToMove, newStartVnode)) {
            patchVnode(vnodeToMove, newStartVnode, newCh, newStartIdx)
            oldCh[idxInOld] = undefined
            canMove && nodeOps.insertBefore(parentElm, vnodeToMove.elm, oldStartVnode.elm)
          } else {
            createElm(newStartVnode, parentElm, )
          }
        }
        newStartVnode = newCh[++newStartIdx]
      }
    }

    // 表示 oldCh 先遍历结束，newCh 中还有剩余元素，需要将这些节点插入到 DOM 中
    if (oldStartIdx > oldEndIdx) {
      refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm
      addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx)
    }
    // 表示 newCh 先遍历结束，oldCh 中还有剩余元素，需要将这些节点从 DOM 中依次删除
    else if (newStartIdx > newEndIdx) {
      removeNodes(parentElm, oldCh, oldStartIdx, oldEndIdx)
    }
  }

  /**
   * 对比节点
   * @param {*} oldVnode 
   * @param {*} vnode 
   * @param {*} removeOnly 
   */
  function patchVnode (oldVnode, vnode, removeOnly) {
    if (oldVnode === vnode) return

    const elm = vnode.elm = oldVnode.elm

    // 静态节点
    if (
      isTrue(vnode.isStatic) &&
      isTrue(oldVnode.isStatic) &&
      vnode.key === oldVnode.key &&
      (isTrue(vnode.isCloned) || isTrue(vnode.isOnce))
    ) {
      return
    }

    const oldCh = oldVnode.children
    const ch = vnode.children
    // vnode是元素节点
    if (isUndef(vnode.text)) {
      // vnode和oldVnode都存在子节点
      if (isDef(oldCh) && isDef(ch)) {
        if (oldCh !== ch) updateChildren(elm, oldCh, ch, removeOnly)
      }
      // vnode有子节点
      else if (isDef(ch)) {
        if (isDef(oldVnode.text)) nodeOps.setTextContent(elm, '')
        addVnodes(elm, null, ch, 0, ch.length - 1)
      }
      // oldVnode有子节点
      else if (isDef(oldCh)) {
        removeNodes(elm, oldCh, 0, oldCh.length - 1)
      }
      // oldVnode是文本节点
      else if (isDef(oldVnode.text)) {
        nodeOps.setTextContent(elm, '')
      }
    }
    // vnode是文本节点
    else if (oldVnode.text !== vnode.text) {
      nodeOps.setTextContent(elm, vnode.text)
    }
  }

  return function patch (oldVnode, vnode) {
    // 收集插入的组件，用于调用insert钩子

    if (isUndef(oldVnode)) {
      createElm(vnode)
    }
  }
}