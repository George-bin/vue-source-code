import {
  makeMap
} from '../shared/util.js'

export const isPreTag = (tag) => tag === 'pre'

export const isHTMLTag = makeMap(
  'html,body,base,head,link,meta,style,title,' +
  'address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section,' +
  'div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,' +
  'a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby,' +
  's,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,' +
  'embed,object,param,source,canvas,script,noscript,del,ins,' +
  'caption,col,colgroup,table,thead,tbody,td,th,tr,' +
  'button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,' +
  'output,progress,select,textarea,' +
  'details,dialog,menu,menuitem,summary,' +
  'content,element,shadow,template,blockquote,iframe,tfoot'
)
export const isSVG = makeMap(
  'svg,animate,circle,clippath,cursor,defs,desc,ellipse,filter,font-face,' +
  'foreignObject,g,glyph,image,line,marker,mask,missing-glyph,path,pattern,' +
  'polygon,polyline,rect,switch,symbol,text,textpath,tspan,use,view',
  true
)

/**
 * 是否是平台保留标签
 * @param {*} tag 标签名
 * @returns Boolean
 */
export const isReservedTag = (tag) => {
  return isHTMLTag(tag) || isSVG(tag)
}

/**
 * 获取命名空间，svg和math
 * @param {*} tag 
 * @returns 
 */
export function getTagNamespace (tag) {
  if (isSVG(tag)) {
    return 'svg'
  }
  // 注：不支持其他MathML元素作为组件根
  if (tag === 'math') {
    return 'math'
  }
}
