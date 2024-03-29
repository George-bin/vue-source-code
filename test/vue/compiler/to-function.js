// import {
//   baseWarn
// } from './helper.js'
import { extend } from "../shared/util.js"

/**
 * 根据字符串创建函数
 * @param {*} code 函数字符串
 * @param {*} errors 
 * @returns 
 */
export function createFunction (code, errors) {
  // debugger
  try {
    return new Function(code)
  } catch (err) {
    console.log(err)
    errors.push({ err, code })
    // return noop
  }
}

/**
 * 生成 render 函数
 * @param {*} compile 
 * @returns 
 */
export function createCompileToFunctionFn (compile) {
  // 缓存render
  const cache = Object.create(null)
  return function compileToFunctions (template, options, vm) {
    options = extend({}, options)
    // const warn = options.warn || baseWarn
    // delete options.warn

    // check cache
    const key = options.delimiters
      ? String(options.delimiters) + template
      : template
    
    if (cache[key]) {
      return cache[key]
    }

    // compile
    const compiled = compile(template, options)

    // turn code into functions
    const res = {}
    const fnGenErrors = []
    res.render = createFunction(compiled.render, fnGenErrors)
    res.staticRenderFns = compiled.staticRenderFns.map(code => {
      return createFunction(code, fnGenErrors)
    })

    return (cache[key] = res)
  }
}