export default {
	// 合并后的配置项
	$options: {
		el: '#app', // 用户手动传入的el（元素选择器）
		parent: vm, // 父实例
		abstract: false, // 抽象的
		inject: {}, // 注入
		props: {},
		methods: {},
		data: fn, // 用户传入的data数据（如果传入data不是一个函数，会自动转换为一个函数并返回一个对象）
		computed: {},
		watch: {},
		_propsKeys: [], // _props => 缓存_propsData的键，以后props更新时可以使用数组迭代，而不是动态枚举对象的键
		render: fn, // 渲染函数
		staticRenderFns： fns,
		_base: Ctor, // 基础构造器 => Vue大类

		// component
		_Ctor: {}, // 缓存子类构造器，避免重复构建
		name: 'App', // 组件名称
		_compiled: true, // 是否编译完成
		__file: 'src/App.vue', // 组件地址
		staticRenderFns: [], // 静态渲染函数
		functional: undefined, // 函数组件
		_isComponent: true,
		_componentTag: undefined, // parentVnode.componentOptions.tag
		_renderChildren: undefined, // parentVnode.componentOptions.children
		propsData: {}, // parentVnode.componentOptions.propsData => 父组件给子组件传递的数据
		_parentVnode: null, // 父实例的vnode数据
		_parentListeners: {}, // 父实例的监听事件 => parentVnode.componentOptions.listeners

	}, // 配置项：components、props、methods、data、computed、watch
	_renderProxy: {}, // 代理对象

	_self: vm, // 指向实例本身
	_uid: 0, // 实例id
	_isVue: false, // 一个避免被响应式标记
	_isComponent: false, // 是否是一个组件
	_name: '<Root>', // 实例name

	// initLifecycle
	$parent: vm, // 父实例
	$root: vm, // 根实例
	$children: [], // 子实例数组
	$refs: {}, // 对dom节点的引用
	_watcher: null, // 渲染Watcher
	_inactive: null,
	_directInactive: false,
	_isMounted: false, // 是否挂载完成
	_isDestroyed: false, // 是否卸载完成
	_isBeingDestroyed: false,

	// initEvents
	_events: {},
	_hasHookEvent: false, // 是否含有勾子函数

	// initRender
	_vnode: null, // 实例本身的vnode数据
	_staticTrees: null, // 缓存的树 => v-once
	$vnode: {}, // 父实例的vnode数据
	$slots: null,
	$scopedSlots: null,
	_c: fn, // 供由模板编译生成的render方法使用
	_$createElement: fn, // 供由手写的render方法使用
	$attrs: {}, // 父实例的Vnode.data.attrs
	$listeners: {} // 父实例的监听事件vm.$options._parentListeners

	// initState
	_watchers: [], // 订阅者数组

	// initProps
	_props: {}, // 用户传入的props => 通过数据劫持访问

	// initData
	_data: {}, // 用户传入的data

	// $mount
	$el: Dom, // 挂载到的DOM节点

	$emit: fn, // 触发事件
	$mount: fn, // 执行挂载
}

// 基础配置项
Vue.options = {
	components: {},
	directives: {},
	filters: {},
	_base: Vue, // initGlobalAPI
}
let Sub = {
	options: {
		_isComponent: true,
		_parentVnode: vnode,
		parent: parent
	},
	extendOptions: {
		_Cotr: {} // 缓存子类（子组件）构造器
	}
}
Sub.super = Vue; // 指向其父类
(function anonymous(
) {
	with(this){
		return _c('div',
			{attrs:{"id":"app"}},
			[
				_c('p',
					{
						on:{"click":handleChangeMessage}
					},
					[
						_v(_s(message))
					]
				),
				_v(" "),
				_c('p',
					[
						_v(_s(useType))
					]
				)
			]
		)
	}
})
(function anonymous(
) {
	with(this){
		return _c('div',
			{
				attrs:{"id":"app"}
			},
			[
				_c('transition',
					{
						attrs:{"name":"fade"}
					},
					[
						(show) ? _c('p',[_v(_s(useType))]):_e()
					]
				),
				_v(" "),
				_c('button',
					{
						on:{"click":handleChange}
					},
					[
						_v("change")
					]
				)
			],
		1)
	}
})