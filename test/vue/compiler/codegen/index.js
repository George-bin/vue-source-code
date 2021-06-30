import { baseWarn, pluckModuleFunction } from '../helper.js'
import { extend, no } from '../../shared/util.js'

/**
 * 
 */
export class CodegenState {
  constructor (options) {
    debugger
    this.options = options
    this.warn = options.warn || baseWarn
    this.transforms = pluckModuleFunction(options.modules, 'transformCode')
    this.dataGenFns = pluckModuleFunction(options.modules, 'genData')
    // this.directives = extend(extend({}, baseDirectives), options.directives)
    const isReservedTag = options.isReservedTag || no
    this.maybeComponent = (el) => !!el.component || !isReservedTag(el.tag)
    this.onceId = 0
    this.staticRenderFns = []
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

// 根据AST元素节点属性的不同而执行不同的代码生成函数
function genElement (el, state) {
  debugger
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
    return `[${children.map(c => genNode(c, state)).join(',')}]${
      normalizationType ? `,${normalizationType}` : ''
    }`
  }
}

/**
 * 
 * @param {*} node 
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
 * @param {*} state => CodegenState
 */
export function genData (el, state) {
  let data = '{'
  // const dirs = genDirectives(el, state)
  // if (dirs) data += dirs + ','

  // key
  if (el.key) {
    data += `key:${el.key}`
  }

  // attributes
  if (el.attrs) {
    data += `attrs:${genProps(el.attrs)},`
  }

  data = data.replace(/,$/, '') + '}'
  return data
}

// 生成元素属性
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
