// import { template } from '../template.js'
import { parseHTML } from './html-parse.js'
import { parseText } from './text-parse.js'
import {
  addAttr,
  pluckModuleFunction,
  getBindingAttr,
  addHandler,
  getAndRemoveAttr 
} from '../helper.js'
import {
  extend
} from '../../shared/util.js'

export const onRE = /^@|^v-on:/
export const dirRE = /^v-|^@|^:|^\.|^#/

export const forAliasRE = /([\s\S]*?)\s+(?:in|of)\s+([\s\S]*)/
export const forIteratorRE = /,([^,\}\]]*)(?:,([^,\}\]]*))?$/
const stripParensRE = /^\(|\)$/g

const modifierRE = /\.[^.\]]+(?=[^\]]*$)/g

function baseWarn (msg) {
  console.error(`[Vue compiler]: ${msg}`)
}

// configurable state
let transforms
let platformIsPreTag // 是否是 pre 标签
let preTransforms
let platformGetTagNamespace // 命名空间 => svg和math


/**
 * 创建AST节点
 * @param {*} tag 标签名
 * @param {*} attrs 属性
 * @param {*} parent 父节点
 */
 export function createASTElement (tag, attrs, parent) {
  return {
    type: 1,
    tag,
    attrsList: attrs,
    attrsMap: makeAttrsMap(attrs),
    rawAttrsMap: {},
    parent,
    children: []
  }
}

function makeAttrsMap (attrs) {
  const map = {}
  for (let i = 0, l = attrs.length; i < l; i++) {
    if (map[attrs[i].name]) {
      warn('duplicate attribute: ' + attrs[i].name, attrs[i])
    }
    map[attrs[i].name] = attrs[i].value
  }
  return map
}

/**
 * 将HTML字符串解析成AST
 * @param { String } template 模板字符串
 * @param { CompilerOptions } options 
 * @returns ASTElement
 */
export function parse (template, options) {
  template = template.trim()
  platformIsPreTag = options.isPreTag
  platformGetTagNamespace = options.getTagNamespace
  transforms = pluckModuleFunction(options.modules, 'transformNode')
  preTransforms = pluckModuleFunction(options.modules, 'preTransformNode')

  const stack = []
  let root
  let currentParent // 当前元素的父节点
  let inVPre = false // 在 v-pre 元素中
  let inPre = false // 在 pre 元素
  let warned = false
  /**
   * 关闭元素节点
   * @param {*} element 
   */
  function closeElement(element) {
    // #15c700 清除空白节点
    trimEndingWhitespace(element)

    if (!inVPre && !element.processed) {
      element = processElement(element, options)
    }

    // 添加子节点
    if (currentParent) {
      currentParent.children.push(element)
      element.parent = currentParent
    }

    if (element.pre) {
      inVPre = false
    }

    if (platformIsPreTag(element.tag)) {
      inPre = false
    }
  }

  /**
   * 是否是禁用的标签
   * @param { String } el 
   * @returns Boolean
   */
  function isForbiddenTag (el) {
    return (
      el.tag === 'style' ||
      (el.tag === 'script' && (
        !el.attrsMap.type ||
        el.attrsMap.type === 'text/javascript'
      ))
    )
  }

  /**
   * 清除末尾空白节点
   * @param {*} el 
   */
  function trimEndingWhitespace (el) {
    if (!inPre) {
      let lastNode
      // 1.末尾子节点为纯文本内容
      // 2.文本内容为空
      while (
        (lastNode = el.children[el.children.length - 1]) &&
        lastNode.type === 3 &&
        lastNode.text === ' '
      ) {
        el.children.pop()
      }
    }
  }

  parseHTML(template, {
    warn: baseWarn,
    expectHTML: options.expectHTML,
    isUnaryTag: options.isUnaryTag,
    shouldKeepComment: true,
    canBeLeftOpenTag: options.canBeLeftOpenTag,
    shouldDecodeNewlines: options.shouldDecodeNewlines,
    shouldDecodeNewlinesForHref: options.shouldDecodeNewlinesForHref,
    outputSourceRange: options.outputSourceRange,
    // 开始标签
    start (tag, attrs, unary, start, end) {
      let element = createASTElement(tag, attrs, currentParent)

      // 判断是否是禁用标签
      if (isForbiddenTag(element)) {
        element.forbidden = true
      }

      // 将 vue 的相关语法转换为标准的 AST 语法树结构 => input 节点相关的解析
      for (let i = 0; i < preTransforms.length; i++) {
        element = preTransforms[i](element, options) || element
      }

      // 是否定义了 v-pre 属性
      if (!inVPre) {
        processPre(element)
        if (element.pre) {
          inVPre = true
        }
      }
      // 是否在 pre 中
      if (platformIsPreTag(element.tag)) {
        inPre = true
      }
      if (inVPre) {
        // 静态节点 attrs 处理
        processRawAttrs(element)
      } if (!element.processed) {
        // 非 input 节点处理（directives相关）
        processFor(element)
        processIf(element)
        processOnce(element)
      }

      if (!root) {
        root = element
      }

      // 非自闭合标签
      if (!unary) {
        currentParent = element
        stack.push(element)
      } else {
        closeElement(element)
      }

    },
    // 结束标签
    end (tag, start, end) {
      const element = stack[stack.length - 1]
      stack.length -= 1
      currentParent = stack[stack.length - 1]
      if (options.outputSourceRange) {
        element.end = end
      }
      closeElement(element)
    },
    // 文本
    chars (text, start, end) {
      const children = currentParent && currentParent.children
      
      let res, child
      if (res = parseText(text)) {
        // 包含变量的AST
        child = {
          type: 2,
          expression: res.expression,
          tokens: res.tokens,
          text
        }
      } else {
        // 不包含变量的AST
        child = {
          type: 3,
          text
        }
      }
      if (child) {
        children.push(child)
      }
    },
    // 注释
    comment (text, start, end) {
      const child = {
        type: 3,
        text,
        isComment: true
      }
      if (options.outputSourceRange) {
        child.start = start
        child.end = end
      }
      currentParent.children.push(child)
    }
  })

  return root
}

/**
 * 判断是否在 pre
 * @param {*} el 
 */
function processPre (el) {
  if (getAndRemoveAttr(el, 'v-pre') != null) {
    el.pre = true
  }
}

/**
 * 加工 Element：key、class、style、attrs等
 * @param {*} element 
 * @param {*} options 
 */
export function processElement (element, options) {
  processKey(element)

  // 用于判断元素节点本身包含任何属性
  element.plain = !element.key && !element.attrsList.length

  processComponent(element)
  // 处理class、style（静态及动态）
  for (let i = 0; i < transforms.length; i++) {
    element = transforms[i](element, options) || element
  }

  processAttrs(element)

  return element
}

/**
 * 加工组件
 * @param {*} el 
 */
function processComponent (el) {
  let banding
  if ((banding = getBindingAttr(el, 'is'))) {
    el.component = binding
  }
}

/**
 * 加工key
 */
function processKey (el) {
  const exp = getBindingAttr(el, 'key')
  // 判断：
  // 1. key不能用在template元素上
  // 2. 不要在<transition-group>子节点上使用v-for index作为键，这和不使用键是一样的。
  el.key = exp
}

/**
 * 加工 attrs => normalize => { name: '', value: '', dynamic: ''}
 * @param {*} el 
 */
function processAttrs (el) {
  const list = el.attrsList
  let i, l, name, rawName, value, modifiers
  for (i = 0, l = list.length; i < l; i++) {
    name = rawName = list[i].name
    value = list[i].value
    // /^v-|^@|^:|^\.|^#/
    if (dirRE.test(name)) {
      // 标记为动态元素
      el.hasBindings = true
      // 解析修饰符
      modifiers = parseModifiers(name.replace(dirRE, ''))
      if (modifiers) {
        name = name.replace(modifierRE, '')
      }

      // 事件指令v-on
      if (onRE.test(name)) {
        name = name.replace(onRE, '')
        addHandler(el, name, value, modifiers, false, () => {})
      }
    } else {
      addAttr(el, name, JSON.stringify(value), list[i])
    }
  }
}

/**
 * 解析修饰符，如：.stop、.prevent、.capture、.self、.once、.passive
 * @param {*} name 
 */
function parseModifiers (name) {
  const match = name.match(modifierRE)
  if (match) {
    const ret = {}
    match.forEach(m => { ret[m.slice(1)] = true })
    return ret
  }
}

/**
 * 加工 v-for 语法糖
 * @param {*} el 
 */
export function processFor (el) {
  let exp
  if ((exp = getAndRemoveAttr(el, 'v-for'))) {
    const res = parseFor(exp)
    if (res) {
      extend(el, res)
    }
  }
}

/**
 * 解析 v-for 语法糖
 * @param {*} exp 
 * 数组语法：(item, index) in items
 * 对象语法：(value, key, index) in obj
 */
export function parseFor (exp) {
  const inMatch = exp.match(forAliasRE) // ["(item, index) in arr", "(item, index)", "arr"]
  if (!inMatch) return

  const res = {}
  res.for = inMatch[2].trim() // "arr"
  const alias = inMatch[1].trim().replace(stripParensRE, '') // "item, index"
  const iteratorMatch = alias.match(forIteratorRE) // [", index", " index",]
  if (iteratorMatch) {
    res.alias = alias.replace(forIteratorRE, '').trim() // "item"
    res.iterator1 = iteratorMatch[1].trim() // "index"
    if (iteratorMatch[2]) {
      res.iterator2 = iteratorMatch[2].trim()
    }
  } else {
    res.alias = alias
  }
  return res
}

/**
 * 添加 if 判断条件
 * @param {*} el 
 * @param {*} condition 
 */
export function addIfCondition (el, condition) {
  if (!el.ifConditions) {
    el.ifConditions = []
  }
  el.ifConditions.push(condition)
}

/**
 * 加工原始属性，属于静态节点
 * @param {*} el 
 */
function processRawAttrs (el) {
  const list = el.attrsList
  const len = list.length
  if (len) {
    const attrs = el.attrs = new Array(len)
    for (let i = 0; i < len; i++) {
      attrs[i] = {
        name: list[i].name,
        value: JSON.stringify(list[i].value)
      }
      if (list[i].start != null) {
        attrs[i].start = list[i].start
        attrs[i].end = list[i].end
      }
    }
  } else if (!el.pre) {
    el.plain = true
  }
}

/**
 * 加工 v-if 语法糖
 * @param {*} el 
 */
function processIf (el) {
  const exp = getAndRemoveAttr(el, 'v-if')
  if (exp) {
    el.if = exp
    addIfCondition(el, {
      exp,
      block: el
    })
  } else {
    if (getAndRemoveAttr(el, 'v-else') != null) {
      el.else = true
    }
    const elseif = getAndRemoveAttr(el, 'v-else-if')
    if (elseif) {
      el.elseif = elseif
    }
  }
}

/**
 * 加工 v-once 语法糖
 * @param {*} el 
 */
function processOnce (el) {
  const once = getAndRemoveAttr(el, 'v-once')
  if (once != null) {
    el.once = true
  }
}