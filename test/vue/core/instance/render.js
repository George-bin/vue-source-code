import { installRenderHelpers } from './render-helpers/index.js'
import { createElement } from '../vdom/create-element.js'

/**
 * 初始化渲染函数
 * @param {*} vm 
 */
export function initRender (vm) {
  vm._vnode = null

  const options = vm.$options
  // const parentVnode = vm.$vnode = options._parentVnode

  // 供模板编译生成的 render 函数使用
  vm._c = (a, b, c, d) => createElement(vm, a, b, c, d, false)

  // 供手写 render 函数使用
  vm.$createElement = (a, b, c, d) => createElement(vm, a, b, c, d, true)

}


/**
 * 
 * @param {*} Vue 
 */
export function renderMixin (Vue) {
  // 安装执行 render 函数时的一些可执行方法，如：_v、_s等
  installRenderHelpers(Vue.prototype)

  Vue.prototype._render = function () {
    const vm = this

    const { render } = vm.$options
    let vnode
    try {
      // 这里没有必要去维护一个堆栈，因为所有的渲染函数都是被单独调用的。当某个组件在 patch 时，嵌套组件的 render 函数也会被调用
      vnode = render.call(vm, vm.$createElement)
    } catch (e) {
      console.error(e)
    }

    return vnode
  }
}