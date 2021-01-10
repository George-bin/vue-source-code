export default {
	__ob__: this, // 一个避免被重复持久的标志，指向自身
	value: {}, // 被观察的对象（主体对象）
	dep: Dep, // 依赖收集器(消息容器)
	vmCount: 0, // vm的数量
	data: {
        message: 'hello, vue!',
        userinfo: {
            username: 'George',
            email: 'bin770021714@126.com'
        }
    }
}