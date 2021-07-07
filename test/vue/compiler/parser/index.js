// import { template } from '../template.js'
import { parseHTML } from './html-parse.js'
import { parseText } from './text-parse.js'
import {
  addAttr,
  pluckModuleFunction,
  getBindingAttr,
  addHandler
} from '../helper.js'

export const onRE = /^@|^v-on:/
export const dirRE = /^v-|^@|^:|^\.|^#/

const modifierRE = /\.[^.\]]+(?=[^\]]*$)/g

function baseWarn (msg) {
  console.error(`[Vue compiler]: ${msg}`)
}

// configurable state
let transforms
let platformIsPreTag // 是否是pre标签
let postTransforms
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
  postTransforms = pluckModuleFunction(options.modules, 'postTransformNode')

  const stack = []
  let root
  let currentParent // 当前元素的父节点
  let inVPre = false // 在v-pre元素中
  let inPre = false // 在pre元素
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
    }

    if (element.pre) {
      inVPre = false
    }

    if (platformIsPreTag(element.tag)) {
      inPre = false
    }
    
    // apply post-transforms
    // for (let i = 0; i < postTransforms.length; i++) {
    //   postTransforms[i](element, options)
    // }
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
      // #0021c4 命名空间 => svg和math，父级存在命名空间则继承
      const ns = (currentParent && currentParent.ns) || platformGetTagNamespace(tag)

      let element = createASTElement(tag, attrs, currentParent)

      // #0021c4
      if (ns) {
        element.ns = ns
      }

      // 判断是否是禁用标签
      if (isForbiddenTag(element)) {
        element.forbidden = true
      }

      // 将 vue 的语法转换为标准的 AST 语法树结构 => class、style
      for (let i = 0; i < preTransforms.length; i++) {
        element = preTransforms[i](element, options) || element
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
 * 添加具备if条件的元素节点
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
 * 加工元素节点
 * @param {*} element 
 * @param {*} options 
 */
export function processElement (element, options) {
  processKey(element)

  // 用于判断元素节点本身包含任何属性
  element.plain = !element.key && !element.attrsList.length

  // class、style、model
  for (let i = 0; i < transforms.length; i++) {
    element = transforms[i](element, options) || element
  }

  processAttrs(element)

  return element
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
 * 处理attrs => normalize => { name: '', value: '', dynamic: ''}
 * @param {*} el 
 */
function processAttrs (el) {
  const list = el.attrsList
  let i, l, name, rawName, value, modifiers
  for (i = 0, l = list.length; i < l; i++) {
    name = rawName = list[i].name
    value = list[i].value
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
