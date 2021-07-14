import { isTrue, isDef, isUndef, isPrimitive } from '../util/index.js'
import VNode from './vnode.js'

export const emptyNode = new VNode('', {}, [])

const hooks = ['create', 'activate', 'update', 'remove', 'destroy']

/**
 * 判断新旧 Vnode 是否指向同一节点，用于对比更新
 * @param {*} a 
 * @param {*} b 
 * @returns 
 */
function sameVnode (a, b) {
  return (
    a.key === b.key && (
      a.tag === b.tag &&
      a.isComment === b.isComment &&
      isDef(a.data) === isDef(b.data)
    )
  )
}

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
  let i,j
  const cbs = {}
  const { modules, nodeOps } = backed

  // 收集全局钩子
  for (i = 0; i < hooks.length; ++i) {
    cbs[hooks[i]] = []
    for (j = 0; j < modules.length; ++j) {
      if (isDef(modules[j][hooks[i]])) {
        cbs[hooks[i]].push(modules[j][hooks[i]])
      }
    }
  }

  /**
   * 根据真实 DOM 元素创建一个空的 VNode
   * @param {*} elm 
   * @returns 
   */
  function emptyNodeAt (elm) {
    return new VNode(nodeOps.tagName(elm).toLowerCase(), {}, [], undefined, elm)
  }

  /**
   * 调用全局 create 钩子
   * @param {*} vnode 
   */
  function invokeCreateHooks (vnode) {
    // 全局钩子
    for (let i = 0; i < cbs.create.length; ++i) {
      cbs.create[i](emptyNode, vnode)
    }
    // 自定义钩子
    let hook = vnode.data.hook // Reuse variable
    if (isDef(hook)) {
      if (isDef(hook.create)) hook.create(emptyNode, vnode)
    }
  }

  /**
   * 尝试创建一个组件
   * @param {*} vnode 
   * @param {*} insertedVnodeQueue 
   * @param {*} parentElm 
   * @param {*} refElm 
   */
  function createComponent (vnode, insertedVnodeQueue, parentElm, refElm) {
    let i = vnode.data
    if (i) {
      if (isDef(i = i.hook) && isDef(i = i.init)) {
        // 执行this.hook.init方法
        i(vnode, false /* hydrating */)
      }

      if (isDef(vnode.componentInstance)) {
        initComponent(vnode, insertedVnodeQueue)
        insert(parentElm, vnode.elm, refElm)
        return true
      }
    }
  }

  /**
   * 初始化组件
   * @param {*} vnode 
   * @param {*} insertedVnodeQueue 
   */
  function initComponent (vnode, insertedVnodeQueue) {
    if (isDef(vnode.data.pendingInsert)) {
      insertedVnodeQueue.push.apply(insertedVnodeQueue, vnode.data.pendingInsert)
      vnode.data.pendingInsert = null
    }
    vnode.elm = vnode.componentInstance.$el

    invokeCreateHooks(vnode, insertedVnodeQueue)
  }
  
  /**
   * 根据 VNode 创建真实 DOM
   * @param {*} vnode 
   * @param {*} insertedVnodeQueue 用于子组件（统一调用 insert 钩子）
   * @param {*} parentElm 父节点（真实DOM节点）
   * @param {*} refElm 下一个兄弟节点
   * @param {*} nested 是否为嵌套节点
   * @param {*} ownerArray 同一层级的子元素数组（包含当前Vnode）
   * @param {*} index 同一层级中的位置坐标（index）
   */
  function createElm (vnode, insertedVnodeQueue, parentElm, refElm, nested, ownerArray, index) {
    vnode.isRootInsert = !nested

    // 尝试创建组件
    if (createComponent(vnode, insertedVnodeQueue, parentElm, refElm)) {
      return
    }

    const data = vnode.data
    const children = vnode.children
    const tag = vnode.tag
    if (isDef(tag)) {
      // 创建元素节点
      vnode.elm = nodeOps.createElement(tag, vnode)
      // 创建子元素
      createChildren(vnode, children, insertedVnodeQueue)
      // debugger
      if (isDef(data)) {
        invokeCreateHooks(vnode)
      }
      // 将元素插入到真实 DOM 节点中
      insert(parentElm, vnode.elm, refElm)
    } else if (isTrue(vnode.isComment)) {
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
      createElm(vnodes[startIdx], insertedVnodeQueue)
    }
  }

  /**
   * 批量删除 DOM 节点
   * @param {*} vnodes 
   * @param {*} startIdx 
   * @param {*} endIdx 
   */
  function removeVnodes(vnodes, startIdx, endIdx) {
    for(; startIdx <= endIdx; ++startIdx) {
      const ch = vnodes[startIdx]
      if (isDef(ch)) {
        // 元素节点
        if (isDef(ch.tag)) {
          removeAndInvokeRemoveHook(ch)
        }
        // 文本节点
        else {
          removeNode(ch.elm)
        }
      }
    }
  }

  /**
   * 移动 DOM 元素并调用 remove 钩子
   * @param {*} vnode 
   * @param {*} rm 
   */
  function removeAndInvokeRemoveHook (vnode, rm) {
    removeNode(vnode.elm)
  }

  /**
   * 将真实 DOM 元素插入到父节点中
   * @param {*} parent 
   * @param {*} elm 
   * @param {*} ref 
   */
  function insert (parent, elm, ref) {
    if (isDef(parent)) {
      if (isDef(ref)) {
        if (nodeOps.parentNode(ref) === parent) {
          nodeOps.insertBefore(parent, elm, ref)
        }
      } else {
        nodeOps.appendChild(parent, elm)
      }
    }
  }

  /**
   * 创建 vnode 子元素
   * @param {*} vnode 
   * @param {*} children 
   */
  function createChildren (vnode, children, insertedVnodeQueue) {
    if (Array.isArray(children)) {
      // 忽略：检查是否存在重复的key

      for (let i = 0; i < children.length; ++i) {
        createElm(children[i], insertedVnodeQueue, vnode.elm, null, true, children, i)
      }
    }
    // 原始类型：直接创建文本节点
    else if (isPrimitive (vnode)) {
      nodeOps.appendChild(vnode.elm, nodeOps.createTextNode(String(vnode.text)))
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
          createElm(newStartVnode, insertedVnodeQueue, parentElm, refElm)
        } else {
          vnodeToMove = oldCh[idxInOld]
          if (sameVnode(vnodeToMove, newStartVnode)) {
            patchVnode(vnodeToMove, newStartVnode, newCh, newStartIdx)
            oldCh[idxInOld] = undefined
            canMove && nodeOps.insertBefore(parentElm, vnodeToMove.elm, oldStartVnode.elm)
          } else {
            createElm(newStartVnode, insertedVnodeQueue, parentElm)
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

  /**
   * 调用 insert 钩子
   * @param {*} vnode 
   * @param {*} queue 
   * @param {*} initial 
   */
  function invokeInsertHook (vnode, queue, initial) {
    if (isTrue(initial) && isDef(vnode.parent)) {
      vnode.parent.data.pendingInsert = queue
    } else {
      for (let i = 0; i < queue.length; ++i) {
        queue[i].data.hook.insert(queue[i])
      }
    }
  }

  return function patch (oldVnode, vnode, removeOnly) {
    // 是否是first patch
    let isInitialPatch = false

    // 收集插入的组件，用于调用insert钩子
    const insertedVnodeQueue = []

    // 首次渲染，直接创建
    if (isUndef(oldVnode)) {
      isInitialPatch = true
      createElm(vnode, insertedVnodeQueue)
    }
    // 对比更新渲染
    else {
      const isRealElement = isDef(oldVnode.nodeType)
      // oldVnode 不是真实 DOM 节点
      if (!isRealElement && sameVnode(oldVnode, vnode)) {
        patchVnode(oldVnode, vnode, patchVnode)
      } else {
        // oldVnode 是真实 DOM 节点
        if (isRealElement) {
          oldVnode = emptyNodeAt(oldVnode)
        }

        const oldElm = oldVnode.elm // 旧的挂载元素
        const parentElm = nodeOps.parentNode(oldElm) // 挂载元素的父级

        createElm(
          vnode,
          insertedVnodeQueue,
          parentElm,
          nodeOps.nextSibling(oldElm)
        )

        // 删除旧的 DOM 节点
        if (isDef(parentElm)) {
          removeVnodes([oldVnode], 0, 0)
        }
      }
    }

    invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch)
    return vnode.elm
  }
}