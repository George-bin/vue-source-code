// 0x27 == '
// 0x5C == \
// 0x22 == "
// 0x60 == `
// 0x2f == /
// 0x7c == |
// 0x5B == [
// 0x5D == ]



/**
 * 生成任务可执行代码，如：value = $event
 * @param {*} value 
 * @param {*} assignment 
 */
export function genAssignmentCode (value, assignment) {
  const res = parseModel(value)
  if (res.key === null) {
    return `${value}=${assignment}`
  } else {
    return `$set(${res.exp}, ${res.key}, ${assignment})`
  }
}

let len, index, str, chr, expressionPos, expressionEndPos
/**
 * 解析模型
 * @param {*} val 
 * @returns 
 */
export function parseModel (val) {
  val = val.trim()
  len = val.length

  if (val.indexOf('[') < 0 || val.lastIndexOf(']') < len - 1) {
    index = val.lastIndexOf('.')
    if (index > -1) {
      return {
        exp: val.slice(0, index),
        key: '"' + val.slice(index + 1) + '"'
      }
    } else {
      return {
        exp: val,
        key: null
      }
    }
  }

  str = val
  index = expressionPos = expressionEndPos = 0

  while (!eof()) {
    chr = next()
    if (isStringStart(chr)) {
      parseString(chr)
    } else if (chr === 0x5B) {
      parseBracket(chr)
    }
  }
  return {
    exp: val.slice(0, expressionPos),
    key: val.slice(expressionPos + 1, expressionEndPos)
  }
}

function eof () {
  return index >= len
}

function next () {
  return str.charCodeAt(++index)
}

function isStringStart (chr) {
  return chr === 0x22 || chr === 0x27
}

/**
 * 解析字符串
 * @param {*} chr 
 * @returns 
 */
function parseString (chr) {
  const stringQuote = chr
  while (!eof()) {
    chr = next()
    if (chr === stringQuote) {
      return
    }
  }
}

/**
 * 解析括号
 * @param {*} chr 
 */
function parseBracket (chr) {
  let inBracket = 1
  expressionPos = index
  while (!eof()) {
    chr = next()
    if (isStringStart(chr)) {
      parseString(chr)
      continue
    }
    if (chr === 0x5B) inBracket++   // [
    if (chr === 0x5D) inBracket--   // ]
    if (inBracket === 0) {
      expressionEndPos = index
      break
    }
  }
}
