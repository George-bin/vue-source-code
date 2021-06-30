// import { template } from '../template.js'
import { parseHTML } from './html-parse.js'
import { parseText } from './text-parse.js'
import {
  addAttr,
  pluckModuleFunction
} from '../helper.js'

export const onRE = /^@|^v-on:/
export const dirRE = /^v-|^@|^:|^\.|^#/

let currentParent // 当前元素的父节点
let transforms
let inVPre = false
let inPre = false
let warned = false
function baseWarn (msg) {
  console.error(`[Vue compiler]: ${msg}`)
}

// let text = 'hello {{name}}，I am {{age}}'
// console.log(parseText(text))

// configurable state
let platformIsPreTag
let postTransforms


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
 * @param {*} template 模板字符串
 * @param {*} options 转换时所需的选项
 * start、end、comment、chars用于将提取出来的内容，转换成对应的AST
 */
export function parse (template, options) {
  template = template.trim()
  platformIsPreTag = options.isPreTag
  transforms = pluckModuleFunction(options.modules, 'transformNode')
  postTransforms = pluckModuleFunction(options.modules, 'postTransformNode')

  const stack = []
  let root

  function closeElement(element) {
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
    for (let i = 0; i < postTransforms.length; i++) {
      postTransforms[i](element, options)
    }
  }

  function isForbiddenTag (el) {
    return (
      el.tag === 'style' ||
      (el.tag === 'script' && (
        !el.attrsMap.type ||
        el.attrsMap.type === 'text/javascript'
      ))
    )
  }  

  parseHTML(template, {
    warn: baseWarn,
    shouldKeepComment: true,
    // 开始标签
    start (tag, attrs, unary, start, end) {
      let element = createASTElement(tag, attrs, currentParent)

      if (isForbiddenTag(element)) {
        element.forbidden = true
      }

      if (!root) {
        root = element
      }

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
 * 加工元素节点
 * @param {*} element 
 * @param {*} options 
 */
export function processElement (element, options) {
  debugger
  // 用于判断元素节点本身包含任何属性
  element.plain = !element.attrsList.length

  // class、style、model
  for (let i = 0; i < transforms.length; i++) {
    element = transforms[i](element, options) || element
  }

  processAttrs(element)

  return element
}

/**
 * 处理attrs => normal => { name: '', value: '', dynamic: ''}
 * @param {*} el 
 */
function processAttrs (el) {
  const list = el.attrsList
  let i, l, name, rawName, value
  for (i = 0, l = list.length; i < l; i++) {
    name = rawName = list[i].name
    value = list[i].value
    if (dirRE.test(name)) {
      // 标记为动态元素
      el.hasBindings = true
    } else {
      addAttr(el, name, JSON.stringify(value), list[i])
    }
  }
}
