import { initMixin } from './init.js'
import { lifecycleMixin } from './lifecycle.js'
import { renderMixin } from './render.js'

function Vue (options) {
  this._init(options)
}

// 在 Vue 原型对象上扩展了一些方法
initMixin(Vue) // Vue.prototype._init
renderMixin(Vue) // Vue.prototype._render
lifecycleMixin(Vue) // Vue.prototype._update

export default Vue
