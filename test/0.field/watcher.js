export default {
	vm: vm, // Vue实例对象
	deep: false, // 深度监听
	user: false,
	lazy: false,
	sync: false,
	before: fn, // 调用beforeUpdate钩子
	cb: fn,
	id: 1,
	active: true,
	dirty: false,
	deps: []
	newDeps: []
	depIds: [],
	newDepIds: [],
	expression: 'function() {}', // 更新函数字符串
	getter: fn,
	value: 

}
(function anonymous(
) {
	with(this) {
		return _c(
			'div',
			{
				attrs:{"id":"app"}
			},
			[
				_c(
					'p',
					[
						_v(_s(message)+"123")
					]
				),
				_v(" "),
				_c(
					'button',
					{
						on:{"click":handleChangeMessage}
					},
					[
						_v("change")
					]
				)
			]
		)
	}
})