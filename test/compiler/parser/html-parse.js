// 注释
const comment = /^<!\--/
// 条件注释
const conditionalComment = /^<!\[/
// 解析DOCTYPE
const doctype = /^<!DOCTYPE [^>]+>/i
// 解析开始标签
const ncname = '[a-zA-Z_][\\w\\-\\.]*'
const qnameCapture = `((?:${ncname}\\:)?${ncname})`
const startTagOpen = new RegExp(`^<${qnameCapture}`)
const startTagClose = /^\s*(\/?)>/
// 属性
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
const dynamicArgAttribute = /^\s*((?:v-[\w-]+:|@|:|#)\[[^=]+\][^\s"'<>\/=]*)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
// 结束标签
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`)

function isPlainTextElement (lastTag) {
	let map = {
		script: true,
		style: true,
		textarea: true
	}
	return map[lastTag]
}

/**
 * 解析HTML
 * tamplate：模板字符串
 * options：转换时的参数
 */
// 四个钩子函数
// start：解析开始标签时调用start函数生成元素类型的AST节点
// end：解析到结束标签时调用end函数；
// chars：解析到文本时调用chars函数生成文本类型的AST节点；
// comment：解析到(注释时调用comment函数生成注释类型的AST节点。
export function parseHTML(html, options) {
	const stack = []
	let index = 0	// 游标 
	let last	// 存储剩余还未解析的模板字符串
  let lastTag  // 存储着位于 stack 栈顶的元素

	html = html.replace(/[\n]/g, '')
	// 循环遍历解析html，直至解析完毕
	while (html) {
		last = html
		let textEnd = html.indexOf('<')
		// 确保即将 parse 的内容不在纯文本标签内（script、style、textarea）
		if (!lastTag || !isPlainTextElement(lastTag)) {
			/**
			 * '<'出现在第一个位置，为其他五种类型
			 * 1.开始标签: <div>
       * 2.结束标签: </div>
       * 3.注释: <!-- 我是注释 -->
       * 4.条件注释: <!-- [if !IE] --> <!-- [endif] -->
       * 5.DOCTYPE: <!DOCTYPE html>
			 */
			if (textEnd === 0) {
				// 注释
				if (comment.test(html)) {
					// 若为注释，则继续查找是否存在'-->'
					const comment = html.indexOf('-->')
					if (comment >= 0) {
						// 是否保留注释
						if (options.shouldKeepComment) {
							debugger
							// 创建注释类型的AST节点
							options.comment(html.substring(4, comment))
						}
						// 移动游标，继续往后解析
						advance(comment + 3)
						continue
					}
				}

				// 条件注释：由于条件注释不存在于真正的DOM树中，所以不需要创建AST节点
				if (conditionalComment.test(html)) {
					// 若为条件注释，则继续查找是否存在']>'
					const conditionalEnd = html.indexOf(']>')

					if (conditionalEnd >= 0) {
						// 若存在 ']>',则从原本的html字符串中把条件注释截掉，
						// 把剩下的内容重新赋给html，继续向后匹配
						advance(conditionalEnd + 2)
						continue
					}
				}

				// 解析DOCTYPE：原理与条件注释类似
				const doctypeMatch = html.match(doctype)
				if (doctypeMatch) {
					advance(doctypeMatch[0].length)
					continue
				}

				// 解析结束标签
				// /^<\/((?:[a-zA-Z_][\w\-\.]*\:)?[a-zA-Z_][\w\-\.]*)[^>]*>/
				const endTagMatch = html.match(endTag)
				if (endTagMatch) {
					const curIndex = index
					advance(endTagMatch[0].length)
					parseEndTag(endTagMatch[1], curIndex, index)
					continue
				}

				// 解析start标签
				// /^<((?:[a-zA-Z_][\w\-\.]*\:)?[a-zA-Z_][\w\-\.]*)/
				const startTagMatch = parseStartTag()
				if (startTagMatch) {
					handleStartTag(startTagMatch)
					continue
				}
			}

			let text, rest, next
			// '<'不在第一个位置，文本开头
			if (textEnd >= 0) {
				/**
				 * 1.从开头到'<'之间的内容都是文本内容
				 * 2.文本内容中本身就包含了'<'，如：1<2</div> 
				 */
				rest = html.slice(textEnd)
				// 循环过滤出文本中所有的'<'，如：1<2 and 2 < 3</div> 
				while(
					!endTag.test(rest) &&
					!startTagOpen.test(rest) &&
					!comment.test(rest) &&
					!conditionalComment.test(rest)
				) {
					// 判断在'<'之后是否还有'<' => '1<2 and 2<3</div>'
					next = rest.indexOf('<', 1)
					if (next < 0) break
					// 如果还有，表示'<'是文本中第一个字符
					textEnd += next
					// 把next之后的内容截取出来进行下一次循环
					rest = html.slice(textEnd)
				}
				text = html.substring(0, textEnd)
			}

			// 后面再也没有'<'，表示都是文本内容
			if (textEnd < 0) {
				text = html
			}

			// 存在文本内容，移动游标
      if (text) {
        advance(text.length)
      }

			// 将text转化成textAST
      if (options.chars && text) {
        options.chars(text, index - text.length, index)
      }
		} else {
			// parse 的内容是在纯文本标签内（script、style、textarea）
		}

		// 把整个字符串当作文本对待
		if (html === last) {
			options.chars && options.chars(html)
			if (!stack.length && options.warn) {
				options.warn(("Mal-formatted tag at end of template: \"" + html + "\""));
			}
			break
		}
	}
	// Clean up any remaining tags
  parseEndTag()
	

	// 移动解析游标，确保内容不会被重复解析
	function advance (n) {
		index += n
		html = html.substring(n)
	}

	// 解析开始标签
	function parseStartTag () {
		// /^<((?:[a-zA-Z_][\w\-\.]*\:)?[a-zA-Z_][\w\-\.]*)/
		const start = html.match(startTagOpen)
		if (start) {
			const match = {
				tagName: start[1],
				attrs: [],
				start: index
			}
			advance(start[0].length) // 移动游标
			
			let attr, end
			// 循环遍历解析出所有属性，并匹配是否满足结束标签来退出循环
			/**
			 * reg = /^\s*(\/?)>/
			 * 1. 自闭合标签 => end[1] === "/"
			 * 2. 非自闭合标签 => end[1] === ""
			 */
			while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
				attr.start = index
				advance(attr[0].length)
				attr.end = index
				match.attr.push(attr)
			}

			if (end) {
				match.unarySlash = end[1]
				advance(end[0].length)
				match.end = index
				return match
			}
		}
	}

	// 对parseStartTag的结果进行下一步处理
	function handleStartTag (match) {
		const tagName = match.tagName
		const unarySlash = match.unarySlash // 是否为自闭合标签，自闭合为“”，非自闭合为“/”
		const unary = !!unarySlash // 布尔值，是否为自闭和标签
		const l = match.attrs.length
		const attrs = new Array(l) // 一个与match.attrs数组长度相等的数组

		for (let i = 0; i < l; i++) {
			const args = match.attrs[i]
			const value = args[3] || args[4] || args[5] || ''
			// 省略a标签的兼容性处理 => value
			// ...
			attrs[i] = {
				name: args[1],
				value: value
			}
		}

		// 非闭合标签，则将标签推入栈中
		if (!unary) {
			stack.puch({ tag: tagName, lowerCasedTag: tagName.toLowerCase(), attrs: attrs, start: match.start, end: match.end })
			lastTag = tagName
		}

		// 如果是自闭合标签，则调用start钩子函数创建AST节点
		if (options.start) {
			options.start(tagName, attrs, unary, match.start, match.end)
		}
	}

	/**
	 * 解析结束标签
	 * tagName：结束标签名
	 * start：结束标签在html字符串中的起始位置
	 * end：结束标签在html字符串中的结束位置
	 */
	function parseEndTag (tagName, start, end) {
		let pos, lowerCasedTagName
    // if (start == null) start = index
    // if (end == null) end = index

		// 如果tagName存在，在stack从后往前匹配，在栈中寻找与tagName相同的标签并记录其位置pos
		if (tagName) {
			lowerCasedTagName = tagName.lowerCasedTag
			for (pos = stack.length - 1; pos >= 0; pos--) {
				if (stack[pos].lowerCasedTag === lowerCasedTagName) {
					break 
				}
			}
		} else {
			pos = 0
		}

		// 当pos >= 0，开启一个for循环，从栈顶位置向栈底位置遍历至pos处，如果发现stack栈中存在索引大于pos的元素，，那么该元素一定是缺少闭合标签的。
		if (pos >= 0) {
			for (var i = stack.length - 1; i >= pos; i--) {
				if (i > pos || !tagName) {
					options.warn(("tag <" + (stack[i].tag) + "> has no matching end tag."))
				}
				// 立即将其闭合，这是为了保证解析结果的正确性。
				if (options.end) {
					options.end(stack[i].tag, start, end)
				}
			}

			/**
			 * 1.把当前元素从栈中弹出
			 * 2.将lastTag赋值为新的栈顶
			 */
			stack.length = pos
      lastTag = pos && stack[pos - 1].tag
		} else if (lowerCasedTagName === 'br') {
			// 浏览器会自动把</br>标签解析为正常的 <br>标签，而对于</p>浏览器则自动将其补全为<p></p>，所以Vue为了与浏览器对这两个标签的行为保持一致，故对这两个便签单独判断处理
			if (options.start) {
				options.start(tagName, [], true, start, end)  // 创建<br>AST节点
			}
		} else if (lowerCasedTagName === 'p') {
			if (options.start) {
        options.start(tagName, [], false, start, end)
      }
      if (options.end) {
        options.end(tagName, start, end)
      }
		}
	}
}

