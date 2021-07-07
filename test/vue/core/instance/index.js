import { initMixin } from './init.js'

function Vue () {
  this._init()
}

initMixin(Vue)

export default Vue
