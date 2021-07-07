import {
  baseWarn,
  pluckModuleFunction
} from '../helper.js'
import {
  genHandlers
} from './events.js'
import { extend, no } from '../../shared/util.js'

/**
 * 
 */
export class CodegenState {
  constructor (options) {
    this.options = options
    this.warn = options.warn || baseWarn
    this.transforms = pluckModuleFunction(options.modules, 'transformCode')
    this.dataGenFns = pluckModuleFunction(options.modules, 'genData')
    // this.directives = extend(extend({}, baseDirectives), options.directives)
    const isReservedTag = options.isReservedTag || no
    this.maybeComponent = (el) => !!el.component || !isReservedTag(el.tag) // 可能是组件
    this.onceId = 0
    this.staticRenderFns = [] // 静态渲染函数
    this.pre = false
  }
}

/**
 * 生成渲染函数
 * @param { ASTElement } ast 
 * @param { CompilerOptions } options 
 * @returns 
 */
export function generate (ast, options) {
  const state = new CodegenState(options)
  const code = ast ? genElement(ast, state) : '_c("div")'
  return {
    render: `with(this){return ${code}}`,
    staticRenderFns: state.staticRenderFns
  }
}

// 根据 AST 元素节点属性的不同而执行不同的代码生成函数
function genElement (el, state) {
  if (el.staticRoot && !el.staticProcessed) {
    return genStatic(el, state)
  } else if (el.once && !el.onceProcessed) {
    return genOnce(el, state)
  } else {
    let code
    if (el.component) {
      code = genComponent(el.component, el, state)
    } else {
      const data = el.plain ? undefined : genData(el, state)

      const children = el.inlineTemplate ? null : genChildren(el, state, true)
      code = `_c('${el.tag}'${
        data ? `,${data}` : '' // data
      }${
        children ? `,${children}` : '' // children
      })`
    }
    // module transforms
    for (let i = 0; i < state.transforms.length; i++) {
      code = state.transforms[i](el, code)
    }
    return code
  }
}

/**
 * 获取子节点列表 => 遍历AST的children属性中的元素
 * @param {*} el 
 * @param {*} state 
 */
export function genChildren (el, state) {
  const children = el.children
  if (children.length) {
    return `[${children.map(c => genNode(c, state)).join(',')}]`
  }
}

/**
 * 生成子节点
 * @param {*} node 子节点
 * @param {*} state 
 * @returns 
 */
function genNode (node, state) {
  if (node.type === 1) {
    return genElement(node, state)
  } else if (node.type === 3 && node.isComment) {
    return genComment(node)
  } else {
    return genText(node)
  }
}

/**
 * 生成纯文本字符串的函数表示
 * @param {*} text 
 * @returns 
 */
function genText (text) {
  return `_v(${text.type === 2
    ? text.expression // no need for () because already wrapped in _s()
    : transformSpecialNewlines(JSON.stringify(text.text))
  })`
}

function genComment (comment) {
  return `_e(${JSON.stringify(comment.text)})`
}

/**
 * 将元素属性提取出来，组成类似："{attrs:{\"asd\":\"\"}}"
 * @param {*} el => ASTElement
 * @param {*} state => CodegenStategenProps
 */
export function genData (el, state) {
  let data = '{'
  // const dirs = genDirectives(el, state)
  // if (dirs) data += dirs + ','

  // key
  if (el.key) {
    data += `key:${el.key}`
  }

  for (var i = 0; i < state.dataGenFns.length; i++) {
    data += state.dataGenFns[i](el)
  }

  // attributes
  if (el.attrs) {
    data += `attrs:${genProps(el.attrs)},`
  }

  // event handlers
  if (el.events) {
    data += `${genHandlers(el.events, false)},`
  }

  data = data.replace(/,$/, '') + '}'
  return data
}

function genStatic (el, state) {

  el.staticProcessed = true
  const originalPreState = state.pre
  
  if (el.pre) {
    state.pre = el.pre
  }

  state.staticRenderFns.push(`with(this){return ${genElement(el, state)}}`)
  state.pre = originalPreState
  return `_m(${
    state.staticRenderFns.length - 1
  }${
    el.staticInFor ? ',true' : ''
  })`
}

/**
 * 生成元素属性的函数字符串表示
 * @param {*} props 
 * @returns 
 */
function genProps (props) {
  let staticProps = ``
  let dynamicProps = ``
  for (let i = 0; i < props.length; i++) {
    const prop = props[i]
    const value = transformSpecialNewlines(prop.value)

    if (prop.dynamic) {
      dynamicProps += `${prop.name},${value},`
    } else {
      staticProps += `"${prop.name}":${value},`
    }
  }
  staticProps = `{${staticProps.slice(0, -1)}}`
  if (dynamicProps) {
    return `_d(${staticProps},[${dynamicProps.slice(0, -1)}])`
  } else {
    return staticProps
  }
}

// #3895, #4268
function transformSpecialNewlines (text) {
  return text
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
}
