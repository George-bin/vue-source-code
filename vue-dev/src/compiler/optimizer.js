/* @flow */

import { makeMap, isBuiltInTag, cached, no } from 'shared/util'

let isStaticKey
let isPlatformReservedTag

const genStaticKeysCached = cached(genStaticKeys)

/**
 * Goal of the optimizer: walk the generated template AST tree
 * and detect sub-trees that are purely static, i.e. parts of
 * the DOM that never needs to change.
 *
 * Once we detect these sub-trees, we can:
 *
 * 1. Hoist them into constants, so that we no longer need to
 *    create fresh nodes for them on each re-render;
 * 2. Completely skip them in the patching process.
 */
export function optimize (root: ?ASTElement, options: CompilerOptions) {
  if (!root) return
  isStaticKey = genStaticKeysCached(options.staticKeys || '')
  isPlatformReservedTag = options.isReservedTag || no
  // first pass: mark all non-static nodes.
  // 标记为静态节点
  markStatic(root)
  // second pass: mark static roots.
  // 标记为静态根节点
  markStaticRoots(root, false)
}

function genStaticKeys (keys: string): Function {
  return makeMap(
    'type,tag,attrsList,attrsMap,plain,parent,children,attrs,start,end,rawAttrsMap' +
    (keys ? ',' + keys : '')
  )
}

function markStatic (node: ASTNode) {
  node.static = isStatic(node)
  if (node.type === 1) {
    // do not make component slot content static. this avoids
    // 1. components not able to mutate slot nodes
    // 2. static slot content fails for hot-reloading
    if (
      !isPlatformReservedTag(node.tag) &&
      node.tag !== 'slot' &&
      node.attrsMap['inline-template'] == null
    ) {
      return
    }
    // 递归判断子节点
    for (let i = 0, l = node.children.length; i < l; i++) {
      const child = node.children[i]
      markStatic(child)
      // 当发现它的子节点中有一个不是静态节点的时候，就得把当前节点重新设置为非静态节点。
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

/**
 * 标记静态根节点
 * @param {*} node 
 * @param {*} isInFor 对于已经是static的节点或者是v-once指令的节点，node.statciInFor = isInFor
 * @returns 
 */
function markStaticRoots (node: ASTNode, isInFor: boolean) {
  if (node.type === 1) {
    if (node.static || node.once) {
      node.staticInFor = isInFor
    }
    // For a node to qualify as a static root, it should have children that
    // are not just static text. Otherwise the cost of hoisting out will
    // outweigh the benefits and it's better off to just always render it fresh.
    // 为了使节点有资格作为静态根节点，它应具有不只是静态文本的子节点。否则，优化的成本将超过收益，最好始终将其更新
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

/**
 * 标记节点是否为静态节点
 * 1：元素节点
 * 2：包含变量的文本节点
 * 3：不包含变量的文本节点
 */
function isStatic (node: ASTNode): boolean {
  // 包含变量的文本节点
  if (node.type === 2) { // expression
    return false
  }
  // 不包含变量的文本节点
  if (node.type === 3) { // text
    return true
  }

  // type === 1 => 元素节点
  return !!(node.pre || ( // 使用了v-pre指令，判定它是静态节点
    !node.hasBindings && // no dynamic bindings => 不能使用动态绑定语法，即标签上不能有v-、@、:开头的属性；
    !node.if && !node.for && // not v-if or v-for or v-else => 不能使用v-if、v-else、v-for指令；
    !isBuiltInTag(node.tag) && // not a built-in => 不能是内置组件，即标签名不能是slot和component；
    isPlatformReservedTag(node.tag) && // not a component => 标签名必须是平台保留标签，即不能是组件；
    !isDirectChildOfTemplateFor(node) && // 当前节点的父节点不能是带有 v-for 的 template 标签；
    Object.keys(node).every(isStaticKey) // 节点的所有属性的 key 都必须是静态节点才有的 key，注：静态节点的key是有限的，它只能是type,tag,attrsList,attrsMap,plain,parent,children,attrs之一；
  ))
}

function isDirectChildOfTemplateFor (node: ASTElement): boolean {
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
