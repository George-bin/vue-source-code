export default class Dep {
  constructor () {
    this.subs = []
  }

  addSub (sub) {
    this.subs.push(sub)
  }

  // 删除依赖
  removeSub (sub) {
    remove(this.subs, sub)
  }

  // 添加依赖
  depend () {
    if (Dep.target) {
      this.addSub(Dep.target)
    }
  }

  // 通知所有依赖进行更新
  notify () {
    const subs = this.subs.slice()
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update()
    }
  }
}

Dep.target = null

function remove (arr, item) {
  if (arr.length) {
    const index = arr.indexOf(item)
    if (index > -1) {
      return arr.splice(index, 1)
    }
  }
}