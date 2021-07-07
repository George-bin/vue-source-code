import {
  isPreTag,
  mustUseProp,
  isReservedTag,
  getTagNamespace
} from '../../util/index.js'

import modules from '../../compiler/modules/index.js'
import { isUnaryTag, canBeLeftOpenTag } from '../../compiler/util.js'

let div
/**
 * 检查当前浏览器是否在属性值中编码字符
 * @param { Boolean } href 
 * @returns Boolean
 */
function getShouldDecode (href) {
  div = div || document.createElement('div')
  div.innerHTML = href ? `<a href="\n"/>` : `<div a="\n"/>`
  return div.innerHTML.indexOf('&#10;') > 0
}



export const baseOptions = {
  modules,
  isPreTag,
  isUnaryTag,
  mustUseProp, // 指定元素节点必须拥有的属性
  isReservedTag, // 是否是平台保留标签
  getTagNamespace, // 命名空间 => svg和math
  canBeLeftOpenTag, // 某些标签缺少闭合标签不会报错，浏览器会自动关闭，如：p、li
  // individuation configure
  // delimiters: '{{', // 分隔符
  expectHTML: true,
  outputSourceRange: true, // 输出源码中的位置信息
  shouldKeepComment: true, // 是否保留注释
  shouldDecodeNewlines: getShouldDecode(false), // IE在属性值中编码换行符，而其他浏览器不这样做
  shouldDecodeNewlinesForHref: getShouldDecode(true) // Chrome在一个[href]中编码内容
}
