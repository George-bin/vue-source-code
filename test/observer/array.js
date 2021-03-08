const arrayProto = Array.prototype
export const arrayMethods = Object.create(arrayProto)

const methodsToPatch = [
	'push',
	'pop',
	'shift',
	'unshift',
	'splice',
	'sort',
	'reverse'
]

methodsToPatch.forEach(function (method) {
	const original = arrayProto[method]
	Object.defineProperty(arrayMethods, method, {
		enumerable: false,
		configurable: true,
		writable: true,
		value: function mutator(...args) {
			const result = original.apply(this, args)
			return result
		}
	})
})