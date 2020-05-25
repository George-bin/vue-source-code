import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'

// 通过function实现了一个类
function Vue (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  this._init(options)
}

/**
 * 在Vue的原型上扩展一些方法
 */
initMixin(Vue) // Vue.prototype._init
stateMixin(Vue) // Vue.prototype.$set、Vue.prototype.$delete、Vue.prototype.$watch
eventsMixin(Vue) // Vue.prototype.$on、Vue.prototype.$once、Vue.prototype.$off、Vue.prototype.$emit
lifecycleMixin(Vue) // Vue.prototype._update、Vue.prototype.$forceUpdate、Vue.prototype.$destroy
renderMixin(Vue) // Vue.prototype.$nextTick、Vue.prototype._render

export default Vue
