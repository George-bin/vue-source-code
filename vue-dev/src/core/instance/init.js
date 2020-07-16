/* @flow */

import config from '../config'
import { initProxy } from './proxy'
import { initState } from './state'
import { initRender } from './render'
import { initEvents } from './events'
import { mark, measure } from '../util/perf'
import { initLifecycle, callHook } from './lifecycle'
import { initProvide, initInjections } from './inject'
import { extend, mergeOptions, formatComponentName } from '../util/index'

// Vue实例id => 如果uid为0，表示为根实例
let uid = 0

export function initMixin (Vue: Class<Component>) {
  Vue.prototype._init = function (options?: Object) {
    // 当前Vue实例
    const vm: Component = this
    // a uid
    vm._uid = uid++

    let startTag, endTag
    /* istanbul ignore if（性能监测相关） */
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      startTag = `vue-perf-start:${vm._uid}`
      endTag = `vue-perf-end:${vm._uid}`
      mark(startTag)
    }

    // a flag to avoid this being observed(一个避免被观察的标志)
    vm._isVue = true
    // merge options（合并配置）
    if (options && options._isComponent) { // 是一个组件
      // optimize internal component instantiation（优化内部组件实例）
      // since dynamic options merging is pretty slow, and none of the（因为动态选项合并是相当慢的，而且没有）
      // internal component options needs special treatment.（内部组件选项需要特殊处理）
      initInternalComponent(vm, options)
    } else { // 不是组件
      // 合并参数
      vm.$options = mergeOptions(
        resolveConstructorOptions(vm.constructor),
        options || {},
        vm
      )
    }
    /* istanbul ignore else */
    // vm._renderProxy实际上指向vm实例本身，开发环境下会设置一层代理，抛出各种开发问题
    if (process.env.NODE_ENV !== 'production') {
      // 开发环境，Vue会报出各种错误
      initProxy(vm)
    } else {
      vm._renderProxy = vm
    }

    // expose real self
    vm._self = vm // 缓存实例本身
    initLifecycle(vm) // 初始化生命周期 => 建立实例间的父子关系
    initEvents(vm) // 初始化事件中心
    initRender(vm) // 初始化渲染
    callHook(vm, 'beforeCreate')
    initInjections(vm) // resolve injections before data/props（数据初始化前）
    initState(vm) // 数据代理和双向绑定，即vm.message = vm._data.message
    initProvide(vm) // resolve provide after data/props（数据初始化后）
    callHook(vm, 'created')

    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      vm._name = formatComponentName(vm, false)
      mark(endTag)
      measure(`vue ${vm._name} init`, startTag, endTag)
    }

    // 执行挂载
    if (vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
  }
}

/**
 * 初始化内部组件（合并Options）
 * @params vm: 当前实例对象（子组件）
 * @params options: 组件相关参数（_isComponent, _parentVnode, parent）
 */
export function  initInternalComponent (vm: Component, options: InternalComponentOptions) {
  const opts = vm.$options = Object.create(vm.constructor.options)
  // doing this because it's faster than dynamic enumeration.（因为它比动态枚举更快）
  const parentVnode = options._parentVnode
  opts.parent = options.parent
  opts._parentVnode = parentVnode

  const vnodeComponentOptions = parentVnode.componentOptions
  opts.propsData = vnodeComponentOptions.propsData
  opts._parentListeners = vnodeComponentOptions.listeners
  opts._renderChildren = vnodeComponentOptions.children
  opts._componentTag = vnodeComponentOptions.tag

  if (options.render) {
    opts.render = options.render
    opts.staticRenderFns = options.staticRenderFns
  }
}

/**
 * 重新计算options，避免被全局的Mixin影响
 * @params Ctor: 子类构造函数
 */
export function resolveConstructorOptions (Ctor: Class<Component>) {
  let options = Ctor.options // 子构造器的静态参数
  if (Ctor.super) { // Vue
    const superOptions = resolveConstructorOptions(Ctor.super) // 递归调用
    const cachedSuperOptions = Ctor.superOptions
    if (superOptions !== cachedSuperOptions) { // Vue配置参数发生改变
      // super option changed,
      // need to resolve new options.
      Ctor.superOptions = superOptions
      // check if there are any late-modified/attached options (#4976)
      const modifiedOptions = resolveModifiedOptions(Ctor)
      // update base extend options
      if (modifiedOptions) {
        extend(Ctor.extendOptions, modifiedOptions)
      }
      options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions)
      if (options.name) {
        options.components[options.name] = Ctor
      }
    }
  }
  return options
}

function resolveModifiedOptions (Ctor: Class<Component>): ?Object {
  let modified
  const latest = Ctor.options
  const sealed = Ctor.sealedOptions
  for (const key in latest) {
    if (latest[key] !== sealed[key]) {
      if (!modified) modified = {}
      modified[key] = latest[key]
    }
  }
  return modified
}
