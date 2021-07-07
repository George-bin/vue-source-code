import Vue from '../runtime/index.js'
import { query } from './util/index.js'
import { compileToFunctions } from './compiler/index.js'
// 缓存$mount
const mount = Vue.prototype.$mount

// 此处的$mount方法用于生成render函数
Vue.prototype.$mount = function (el) {
  el = el && query(el)

  const options = this.$options
  // 不存在render函数，生成render函数
  if (!options.render) {
    let template = options.template
    if (typeof template) {
      const { render, staticRenderFns } = compileToFunctions(template, {
        outputSourceRange: true
      }, this)
      options.render = render
      options.staticRenderFns = staticRenderFns
    }
  }

  // 执行挂载流程
  return mount.call(this, el)
}

Vue.compile = compileToFunctions
export default Vue