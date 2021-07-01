import {
  makeMap
} from '../shared/util.js'
/**
 * 元素节点必须具备的属性
 * @param {*} tag 
 * @param {*} type 
 * @param {*} attr 
 * @returns Boolean
 */
const acceptValue = makeMap('input,textarea,option,select,progress')
export const mustUseProp = (tag, type, attr) => {
  return (
    (attr === 'value' && acceptValue(tag)) && type !== 'button' ||
    (attr === 'selected' && tag === 'option') ||
    (attr === 'checked' && tag === 'input') ||
    (attr === 'muted' && tag === 'video')
  )
}