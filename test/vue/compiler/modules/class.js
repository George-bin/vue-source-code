import {
  baseWarn,
  getAndRemoveAttr,
  getBindingAttr
} from '../helper.js'

import {
  parseText
} from '../parser/text-parse.js'

/**
 * 处理
 * @param {ASTElement} el 
 * @param {CompilerOptions} options 
 */
function transformNode (el, options) {
  const warn = options.warn || baseWarn
  const staticClass = getAndRemoveAttr(el, 'class')

  // #0021c4 判断静态class中是否存在动态绑定的变量
  if (staticClass) {
    const res = parseText(staticClass, options.delimiters)
    if (res) {
      warn(
        `class="${staticClass}": ` +
        'Interpolation inside attributes has been removed. ' +
        'Use v-bind or the colon shorthand instead. For example, ' +
        'instead of <div class="{{ val }}">, use <div :class="val">.',
        el.rawAttrsMap['class']
      )
    }
  }

  // 静态class
  if (staticClass) {
    el.staticClass = JSON.stringify(staticClass)
  }

  // 动态class
  const classBinding = getBindingAttr(el, 'class', false /* getStatic */)
  if (classBinding) {
    el.classBinding = classBinding
  }
}

// 输出 => class的函数字符串表示
function genData (el) {
  let data = ''
  if (el.staticClass) {
    data += `staticClass:${el.staticClass},`
  }
  if (el.classBinding) {
    data += `class:${el.classBinding},`
  }
  return data
}

export default {
  staticKeys: ['staticClass'],
  transformNode,
  genData
}