export default class Dep {
	constructor () {
		this.subs = []
	}

	addSub (sub) {
		this.subs.push(sub)
	}

	// 删除一个依赖
	removeSub (sub) {
		remove(this.subs, sub)
	}

	// 添加一个依赖
	depend () {
		if (Dep.target) {
			this.addSub(Dep.target)
		}
	}

	// 通知所有依赖更新
	notify () {
		const subs = this.subs.slice()
		for (let i = 0, len = subs.length; i < len; i++) {
			subs[i].update()
		}
	}
}
Dep.target = null

export function remove (arr, item) {
	if (arr.length) {
		const index = arr.indexOf(item)
		if (index > -1) {
			return arr.splice(index, 1)
		}
	}
}