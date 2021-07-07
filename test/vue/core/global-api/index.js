import {
  ASSET_TYPES
} from '../../shared/constants.js'

export function initGlobalAPI (Vue) {
  
  // 定义Vue.options
  Vue.options = Object.create(null)
  ASSET_TYPES.forEach(type => {
    // component、directive、filter
    Vue.options[type + 's'] = Object.create(null)
  })

  Vue.options._base = Vue

  // 把一些内置组件扩展到Vue.options.components
  // extends()
}