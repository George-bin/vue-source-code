export default {
	tag: '', // 标签
	data: {
		attrs: {},
		pendingInsert: [],
		
	}, // 
	children: [], // 子Vnode
	text: '',
	elm: '', // 挂载点
	ns: '',
	context: undefined, // 上下文环境 => 最上层的Vue实例（new Vue）
	fnContext: undefined,
	fnOptions: undefined,
	fnScopeId: undefined,
	key: '',
	componentOptions: {
		Ctor: Sub, // Vue的子类
		children: undefined,
		listeners: undefined,
		propsData: undefined,
		tag: undefined
	},
	componentInstance: undefined, // 组件实例
	parent: undefined, // 父Vnode
	raw: false,
	isStatic: false,
	isRootInsert: true,
	isComment: false,
	isCloned: false,
	isOnce: false,
	asyncFactory: undefined,
	asyncMeta: undefined,
	isAsyncPlaceholder: false
}