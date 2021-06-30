import { createCompilerCreator } from './create-compiler.js'
import { parse } from './parser/index.js'
import { generate } from './codegen/index.js'

export const createCompiler = createCompilerCreator(function baseCompile (template, options) {
  // 模板解析阶段：用正则等方式解析template模板中的指令、class、style等数据，形成AST
  const ast = parse(template.trim(), options)
  if (options.optimize !== false) {
    // 优化阶段：遍历AST，找出其中的静态节点，并打上标记
    optimize(ast, options)
  }
  // 代码生成阶段：将AST转换成渲染函数
  const code = generate(ast, options)
  return {
    ast, // ast语法树
    render: code.render, // 渲染函数
    staticRenderFns: code.staticRenderFns // 静态渲染函数
  }
})

const { compile, compileToFunctions } = createCompiler(baseOptions)
