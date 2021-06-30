import { isBuiltInTag, cached } from "../shared/util.js"

let isStaticKey
let isPlatformReservedTag = () => true
// const genStaticKeysCached = cached(genStaticKeys)

export function optimizer (root, options) {
  if (!root) return
  // isStaticKey = genStaticKeysCached(options.staticKeys || '')
  // 标记静态节点
  markStatic(root)

  // 标记静态根节点
  markStaticRoots(root, false)
}

function markStatic (node) {
  if (!node) return

  node.static = isStatic(node)
  if (node.type === 1) {
    // 递归标记子节点
    for (let i = 0, l = node.children.length; i < l; i++) {
      const child = node.children[i]
      markStatic(child)
      // 当子节点中有一个不是静态节点，则该节点不是静态节点
      if (!child.static) {
        node.static = false
      }
    }

    // 判断当前节点的子节点中是否带有v-if、v-else-if、v-else等指令，这些指令在每次渲染时只渲染一个，所以其余没有被渲染的肯定不在node.children中，而是存在于node.ifConditions中
    if (node.ifConditions) {
      for (let i = 1, l = node.ifConditions.length; i < l; i++) {
        const block = node.ifConditions[i].block
        markStatic(block)
        // 如果当前节点的node.ifConditions中有一个子节点不是静态节点也要将当前节点设置为非静态节点。
        if (!block.static) {
          node.static = false
        }
      }
    }
  }
}

function markStaticRoots (node, isInFor) {
  if (node.type === 1) {
    // 已经是static节点或v-once指令的节点
    if (node.static || node.once) {
      node.staticInFor = isInFor
    }

    // 为了使节点有资格作为静态根节点，它应具有不只是静态文本的子节点。 否则，优化的成本将超过收益，最好始终将其更新
    // 1.节点本身必须是静态节点
    // 2.必须拥有子节点children
    // 3.子节点不能只是一个纯文本节点
    if (node.static && node.children.length && !(
      node.children.length === 1 &&
      node.children[0].type === 3
    )) {
      node.staticRoot = true
      return
    } else {
      node.staticRoot = false
    }

    // 如果当前节点不是静态根节点，就继续遍历它的子节点node.children和node.ifConditions
    if (node.children) {
      for (let i = 0, l = node.children.length; i < l; i++) {
        markStaticRoots(node.children[i], isInFor || !!node.for)
      }
    }
    if (node.ifConditions) {
      for (let i = 1, l = node.ifConditions.length; i < l; i++) {
        markStaticRoots(node.ifConditions[i].block, isInFor)
      }
    }
  }
}

// 判断是否为静态节点
function isStatic (node) {
  if (node.type === 2) {
    return false
  }
  if (node.type === 3) {
    return true
  }
  return !!(node.pre || ( // 使用了v-pre指令，判断它是静态节点
    !node.hasBindings &&  // 不能使用动态绑定语法，即标签上不能有v-、@、:开头的属性
    !node.if && !node.for && // 不能使用v-if、v-else、v-for指令
    !isBuiltInTag(node.tag) && // 不能是内置组件，即标签名不能是slot和component
    isPlatformReservedTag(node.tag) && // 标签名必须是平台保留标签，即不能是组件
    !isDirectChildOfTemplateFor(node) // 当前节点的父节点不能是带有 v-for 的 template 标签
    // Object.keys(node).every(isStaticKey) // // 节点的所有属性的 key 都必须是静态节点才有的 key，注：静态节点的key是有限的，它只能是type,tag,attrsList,attrsMap,plain,parent,children,attrs之一
  ))
}

function isDirectChildOfTemplateFor (node) {
  while (node.parent) {
    node = node.parent
    if (node.tag !== 'template') {
      return false
    }
    if (node.for) {
      return true
    }
  }
  return false
}