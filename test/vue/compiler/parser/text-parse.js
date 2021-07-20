import { cached } from '../../shared/util.js'
import { parseFilters } from './filter-parse.js'

const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g
const regexEscapeRE = /[-.*+?^${}()|[\]\/\\]/g

// 根据传入值生成不同的正则
// 换句话说在开发Vue项目中，用户可以自定义文本内包含变量所使用的符号，例如你可以使用%包裹变量如：hello %name%。
const buildRegex = cached(delimiters => {
  const open = delimiters[0].replace(regexEscapeRE, '\\$&')
  const close = delimiters[1].replace(regexEscapeRE, '\\$&')
  return new RegExp(open + '((?:.|\\n)+?)' + close, 'g')
})

/**
 * 解析文本内容
 * @param {String} text 待解析的文本内容
 * @param {[String, String]} delimiters 包裹变量的符号
 */
export function parseText(text, delimiters) {
  // 检查文本中是否包含变量
  const tagRE = delimiters ? buildRegex(delimiters) : defaultTagRE

  // 判断传入的值是否包含变量，不包含则直接返回
  if (!tagRE.test(text)) {
    return
  }

  // 开启一个while循环，使用exec在一个字符串中执行匹配检索
  const tokens = []
  const rawTokens = []
  let lastIndex = tagRE.lastIndex = 0
  let match, index, tokenValue
  while ((match = tagRE.exec(text))) {
    index = match.index // 第一个变量在字符串中的位置
    // push text token
    if (index > lastIndex) {
      // 先把'{{'前面的文本放入tokens中
      rawTokens.push(tokenValue = text.slice(lastIndex, index))
      tokens.push(JSON.stringify(tokenValue))
    }

    // 取出{{}}中间的变量
    const exp = parseFilters(match[1].trim())
    // 把变量exp改成_s(exp)形式也放入tokens中
    tokens.push(`_s(${exp})`)
    rawTokens.push({ '@binding': exp })
    // 更新lastIndex，只从}}后面开始匹配
    lastIndex = index + match[0].length
  }

  // 当while循环完毕时，表明文本中的所有变量都已经解析完毕
  if (lastIndex < text.length) {
    // 说明最后一个变量后面还有文本
    rawTokens.push(tokenValue = text.slice(lastIndex))
    tokens.push(JSON.stringify(tokenValue))
  }

  // 最后把tokens数组中的元素用+连接
  return {
    expression: tokens.join('+'),
    tokens: rawTokens
  }
}