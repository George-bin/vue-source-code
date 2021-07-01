
function Vue(vm) {
	this._init(vm);
}

Vue.prototype._init = function(vm) {
	initState(vm);
}

function initState(vm) {
	// if (vm.props) initProps(vm, vm.props);
	// if (vm.methods) initMethods(vm, vm.methods);
	if (vm.data) initData(vm, vm.data);
}

function initProps(vm, props) {
	for(let key in props) {
		let value = props[key];
		defineReactive(props, key, value);
	}
}

function initData(vm) {
	for(let key in vm.data) {
		proxy(vm, `_data`, key);
	}
}

function observe(value) {
	let ob = new Observer(value);
	return ob;
}

class Observer {
	constructor(valye) {
		this.value = value;
		this.dep = new Dep();
		this.vmCount = 0;
		def

	}
}

// 触发更新
function defineReactive(obj, key, val) {
	const dep = new Dep();
	// 添加依赖
	Object.defineProperty(obj, key, {
		enumerable: true,
		configurable: true,
		get: function reactiveGetter() {
			const value = obj[key];
			if (Dep.target) {
				dep.depend();
			}
		},
		set: function reactiveSetter(newVal) {
			val = newVal
			deo.notity();
		}
	});
}

let uid = 0;
class Dep {
	constructor() {
		this.id = uid++;
		this.subs = [];
	}
	addSub (sub) {
		this.subs.push(sub);
	}
	removeSub (sub) {
	}
	depend () {
		if (Dep.target) {
			Dep.target.addDep(this);
		}
	}
	notity () {
		const subs = this.subs.slice();
		for (let i=0; i<subs.length; i++) {
			subs[i].update();
		}
	}
}