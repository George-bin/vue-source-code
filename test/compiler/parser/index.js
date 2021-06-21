import { template } from '../template.js'
import { parseHTML } from './html-parse.js'
import { parseText } from '../text-parse.js'

let currentParent
function baseWarn (msg) {
  console.error(`[Vue compiler]: ${msg}`)
}

let text = 'hello {{name}}，I am {{age}}'
console.log(parseText(text))

/**
 * 将HTML字符串解析成AST
 * @param {*} template 模板字符串
 * @param {*} options 转换时所需的选项
 * start、end、comment、chars用于将提取出来的内容，转换成对应的AST
 */
export function parse (template, options) {
  parseHTML(template, {
    warn: baseWarn,
    shouldKeepComment: true,
    // 开始标签
    start (tag, attrs, unary, start, end) {
      let element = createASTElement(tag, attrs, currentParent)
    },
    // 结束标签
    end (tag, start, end) {},
    // 文本
    chars (text, start, end) {
      let res
      if (res = parseText(text)) {
        // 包含变量的AST
        let element = {
          type: 2,
          expression: res.expression,
          tokens: res.tokens,
          text
        }
      } else {
        // 不包含变量的AST
        let element = {
          type: 3,
          text
        }
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
}

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
    if (
      process.env.NODE_ENV !== 'production' &&
      map[attrs[i].name] && !isIE && !isEdge
    ) {
      warn('duplicate attribute: ' + attrs[i].name, attrs[i])
    }
    map[attrs[i].name] = attrs[i].value
  }
  return map
}