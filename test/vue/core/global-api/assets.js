import { ASSET_TYPES } from "../../shared/constants.js"
import { isPlainObject } from "../../shared/util.js"

export function initAssetRegisters (Vue) {
  // compoment、directive、filters
  ASSET_TYPES.forEach(type => {
    Vue[type] = function(id, definition) {
      if (!definition) {
        return this.options[type + 's'][id]
      } else {
        // definition 是一个对象，用于全局组件注册
        if (type === 'component' && isPlainObject(definition)) {
          definition.name = definition.name || id
          definition = this.options._base.extend(definition)
        }
        if (type === 'directive' && typeof definition === 'function') {
          definition = { bind: definition, update: definition }
        }
        // 注册全局component、directive、filter
        this.options[type + 's'][id] = definition
        return definition
      }
    }
  })
}