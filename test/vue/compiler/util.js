import {
  makeMap
} from '../shared/util.js'

// 判断是否是自闭合标签
export const isUnaryTag = makeMap(
  'area,base,br,col,embed,frame,hr,img,input,isindex,keygen,' +
  'link,meta,param,source,track,wbr'
)

// 可以自动关闭的元素（缺少闭合标签也不会报错）
export const canBeLeftOpenTag = makeMap(
  'colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr,source'
)

