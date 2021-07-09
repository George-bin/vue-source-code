import { initMixin } from './init.js'
import { renderMixin } from './render.js'

function Vue (options) {
  this._init(options)
}

initMixin(Vue)
renderMixin(Vue)

export default Vue
