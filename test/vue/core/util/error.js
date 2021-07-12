/**
 * 
 * @param {*} handler 
 * @param {*} context 
 * @param {*} args 
 * @param {*} vm 
 */
export function invokeWithErrorHandling (handler, context, args, vm) {
  let res
  try {
    res = args ? handler.apply(context, args) : handler.call(context)
    
    // if (res && !res._isVue && isPromise(res) && !res._handled) {
    //   res.catch(e => handleError(e, vm, info + ` (Promise/async)`))
    //   // issue #9511
    //   // avoid catch triggering multiple times when nested calls
    //   res._handled = true
    // }
  } catch (e) {
    console.error(e)
  }
  return res
}