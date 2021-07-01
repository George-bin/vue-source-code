const validDivisionCharRE = /[\w).+\-_$\]]/

/**
 * 可以用在两个地方，一个是{{}}插值，另一个是v-bind后面的表达式
 * @param {String} exp 
 * @returns String
 */
export function parseFilters (exp) {
  let inSingle = false
  let inDouble = false
  let inTemplateString = false
  let inRegex = false
  let curly = 0
  let square = 0
  let paren = 0
  let lastFilterIndex = 0
  let c, prev, i, expression, filters

  // 0x27 == ' ; 0x5C == \ ; 0x22 == " ; 0x60 == ` ; 0x2f == / ; 0x7c == |
  for (i = 0; i < exp.length; i++) {
    prev = c
    c = exp.charCodeAt(i)
    if (inSingle) {
      if (c === 0x27 && prev !== 0x5C) inSingle = false
    } else if (inDouble) {
      if (c === 0x22 && prev !== 0x5C) inDouble = false
    } else if (inTemplateString) {
      if (c === 0x60 && prev !== 0x5C) inTemplateString = false
    } else if (inRegex) {
      if (c === 0x2f && prev !== 0x5C) inRegex = false
    } else if (
      c === 0x7C && // pipe
      exp.charCodeAt(i + 1) !== 0x7C &&
      exp.charCodeAt(i - 1) !== 0x7C &&
      !curly && !square && !paren
    ) {
      // 如果是 | ，则有可能是fitler, 要求前后的字符都不能为 | ， 并且不能在 { }， 【】，() 包裹中
      if (expression === undefined) {
        // first filter, end of expression
        lastFilterIndex = i + 1
        expression = exp.slice(0, i).trim()
      } else {
        pushFilter()
      }
    } else {
      switch (c) {
        case 0x22: inDouble = true; break         // " => 双引号
        case 0x27: inSingle = true; break         // ' => 单引号
        case 0x60: inTemplateString = true; break // ` => 模板字符串
        case 0x28: paren++; break                 // ( => paren 计数加一, 通过 paren 是否为0判断 () 是否闭合
        case 0x29: paren--; break                 // ) => paren 计数减一
        case 0x5B: square++; break                // [ => square 计数加一 ，通过 square 是否为0判断 [] 是否闭合
        case 0x5D: square--; break                // ] => square 计数减一
        case 0x7B: curly++; break                 // { => curly 计数加一， 通过 curly 是否为0判断 {} 是否闭合
        case 0x7D: curly--; break                 // } => curly 计数减一
      }
      // 如果是 / ，向前找第一个非空格的字符
      if (c === 0x2f) {
        let j = i - 1
        let p
        // find first non-whitespace prev char
        for (; j >= 0; j--) {
          p = exp.charAt(j)
          if (p !== ' ') break
        }
        // 如果 p 不存在或者正则校验不通过，则说明是正则
        if (!p || !validDivisionCharRE.test(p)) {
          inRegex = true
        }
      }
    }
  }

  // 如果expression 为空，则说明没有没有filter函数，或者是写法出了问题。某些符号没闭合
  if (expression === undefined) {
    expression = exp.slice(0, i).trim()
  } else if (lastFilterIndex !== 0) {
    pushFilter()
  }

  // 初始化filters变量。将过滤器函数推入filters数组中
  function pushFilter () {
    (filters || (filters = [])).push(exp.slice(lastFilterIndex, i).trim())
    lastFilterIndex = i + 1
  }

  // 如果有过滤器函数，则结合expression生成最终的表达式
  if (filters) {
    for (i = 0; i < filters.length; i++) {
      expression = wrapFilter(expression, filters[i])
    }
  }

  return expression
}

// filter函数结合expression生成最终的表达式
function wrapFilter (exp, filter) {
  const i = filter.indexOf('(')
  // filter是一个函数名称，如 fn
  if (i < 0) {
    // _f: resolveFilter
    return `_f("${filter}")(${exp})`
  } else {
    // filter 是一个函数调用，如 fn（arg）或 fn（）
    const name = filter.slice(0, i)
    const args = filter.slice(i + 1)
    return `_f("${name}")(${exp}${args !== ')' ? ',' + args : args}`
  }
}
