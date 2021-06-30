import {
  baseWarn,
  getAndRemoveAttr,
  getBindingAttr
} from '../helper.js'

function transformNode (el, options) {
  const warn = options.warn || baseWarn
  const staticClass = getAndRemoveAttr(el, 'class')

  if (staticClass) {
    el.staticClass = JSON.stringify(staticClass)
  }
  // const classBinding = getBindingAttr(el, 'class', false /* getStatic */)
  // if (classBinding) {
  //   el.classBinding = classBinding
  // }
}

// 获取class => 静态class和动态绑定的class
function genData (el) {
  let data = ''
  if (el.staticClass) {
    data += `staticClass:${el.staticClass}`
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