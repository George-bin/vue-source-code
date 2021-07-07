// 获取DOM对象
export function query (el) {
  if (typeof el === 'string') {
    const selected = document.querySelector(el)
    return selected
  } else {
    return el
  }
}