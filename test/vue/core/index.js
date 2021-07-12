import Vue from './instance/index.js'
import { initGlobalAPI } from './global-api/index.js'

// 在 Vue 上扩展了一些静态属性和方法
initGlobalAPI(Vue)

export default Vue