import Vue from '../../core/index.js'
import { query } from '../util/index.js'
import { mountComponent } from '../../core/instance/lifecycle.js'
import { patch } from './patch.js'

Vue.prototype.__patch__ = patch


Vue.prototype.$mount = function (el) {
  el = el && query(el)
  return mountComponent(this, el)
}

export default Vue