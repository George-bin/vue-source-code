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

}


/**
 * 
 * @param {*} Vue 
 */
export function renderMixin (Vue) {
  Vue.prototype._render = function () {
    const vm = this

    const { render } = vm.$options
    let vnode
    try {
      vnode = render.call(vm, vm.$createElement)
    } catch (e) {
      console.error(e)
    }

    return vnode
  }
}