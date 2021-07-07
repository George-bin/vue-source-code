import Vue from '../core/index.js'

Vue.prototype.$mount = function (el) {
  el = el && query(el)
  return mountComponent(this, el)
}

export default Vue