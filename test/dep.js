export default {
	id: 0,
	subs: [], // 订阅者数组
	prototype: {
		addSub: fn, // 添加订阅者
		removeSub: fn, // 删除订阅者
		depend: fn, // 触发addSub
		notity: fn, // 通知订阅者更新
	}
}
const target = null; // watcher => 当前的订阅者是谁

(function anonymous() {
    with(this){
        return _c(
        	'div',
        	{
        		attrs: {
        			"id": "app"
        		}
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
        			'p',
        			[
        				_v(_s(useType))
        			]
        		),
        		_v(" "),
        		_c(
        			'button',
        			{
        				on:{
        					"click": handleChangeMessage
        				}
        			},
        			[
        				_v("change")
        			]
        		)
        	]
        )
    }
})