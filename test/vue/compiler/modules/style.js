import {
  baseWarn,
  getAndRemoveAttr,
  getBindingAttr
} from "../helper.js"
import { parseStyleText } from '../../util/style.js'
import { parseText } from "../parser/text-parse.js"

// 处理
function transformNode (el, options) {
  const warn = options.warn || baseWarn
  const staticStyle = getAndRemoveAttr(el, 'style')

  if (staticStyle) {
    // #0021c4
    const res = parseText(staticStyle, options.delimiters)
    if (res) {
      warn(
        `style="${staticStyle}": ` +
        'Interpolation inside attributes has been removed. ' +
        'Use v-bind or the colon shorthand instead. For example, ' +
        'instead of <div style="{{ val }}">, use <div :style="val">.',
        el.rawAttrsMap['style']
      )
    }

    el.staticStyle = JSON.stringify(parseStyleText(staticStyle))
  }

  const styleBinding = getBindingAttr(el, 'style', false /* getStatic */)
  if (styleBinding) {
    el.styleBinding = styleBinding
  }
}

// 输出 => style的函数字符串表示
function genData (el) {
  let data = ''
  if (el.staticStyle) {
    data += `staticStyle:${el.staticStyle},`
  }
  if (el.styleBinding) {
    data += `style:(${el.styleBinding}),`
  }
  return data
}

export default {
  staticKeys: ['staticStyle'],
  transformNode,
  genData
}