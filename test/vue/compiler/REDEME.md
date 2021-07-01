1.VNode的由来
	把用户手写的模板进行编译，就会生成VNode。

2.什么是模板编译
	在日常开发中，把写在<template></template>标签中的类似原生HTML的内容称之为模板。

	为什么说是“类似于原生HTML的内容”而不是“就是原生HTML的内容”？因为在开发过程中，在<template></template>标签中除了写一些原生的HTML内容，还会写一些变量插值，如：{{message}}，以及Vue指令信息，如：v-on、v-if等，而这些内容在原生HTML中是不存在的，是不被接受的。但是事实上我们确实这么写了，也被正确识别了，页面也能正常显示，这又是为什么呢？

	这就归功于Vue的模板编译，它会对<template></template>标签中类似原生HTML的内容进行编译，把原生HTML的内容找出来，再把非原生的内容找出来，经过一系列的逻辑处理，生成渲染函数（render函数），而render函数则负责将模板内容生产对应的VNode。

3.整体渲染流程
	用户编写模板 => 模板编译 => render函数 => VNode => patch => 视图

4.模板编译的内部流程
	抽象语法树AST => 用户编写的模板对Vue来说就是一堆字符串，如何从这一堆字符串解析出元素标签、属性、变量插值等有效信息呢？
	1⃣️模板解析阶段：将一堆字符串用正则等方式解析成抽象语法树AST；(解析器)
	2⃣️优化阶段：遍历AST，找出其中的静态节点，并打上标记；（优化器）
	3⃣️代码生成阶段：将AST转换成渲染函数。（代码生成器）

5.模板解析阶段 => 整体流程
	解析器，顾名思义，就是把用户编写的模板根据一定的解析规则解析出有效的信息，最后用这些信息形成AST。

	在<template></template>模板内，除了有常规的HTML标签外，还会包含一些文本信息以及过滤器信息等。而这些不同的内容解析起来肯定需要不同的解析规则，所以解析器不可能只有一个，除了解析常规HTML的HTML解析器，还有解析文本的 文本解析器 以及解析文本中可能包含过滤器的 过滤器解析器。

	另外，文本信息和标签属性信息又包含在HTML标签内部，所以解析整个模板的流程应该是：HTML解析器是主线，先用HTML解析器解析整个模板，在解析过程中如果碰到文本内容，那就调用文本解析器来解析文本，如果碰到文本中包含过滤器的那就调用过滤器解析器来解析。

6.模板解析阶段 => HTML解析器
	6.1.解析HTML注释 => /^<--/ && /-->/ => 移动解析游标，避免重复解析
	6.2.解析条件注释 => /^<!\[/ && /]>/ => 由于条件注释不存在于真正的DOM树，所以不需要调用钩子函数创建AST节点
	6.3.解析DOCTYPE => /^<!DOCTYPE [^>]+>/i => 同解析条件注释相同
	6.4.解析开始标签 => 
		1）解析开始标签
		2）解析标签属性：while循环遍历获取所有属性 => 通过判断剩余字符是否符合开始标签的结束特征
		3）解析标签是否是自闭合标签：<img src="" /> | <div></div>
	6.5.解析结束标签
	6.6.解析文本

7.如何保证AST节点层级关系：栈stack
	栈的作用就是用来维护AST的节点层级关系。
		1）在start钩子函数中可以将解析得到的开始标签推入栈中，而每当遇到结束标签时就会调用end钩子函数，在end钩子函数中内部将解析得到的结束标签所对应的开始标签从栈中弹出。
		2）检测模板字符串中是否有未正确闭合的标签。

8. 优化阶段 => 标记
	1）静态节点
	2）静态根节点

9. 节点类型
	1 => 元素节点
	2 => 包含变量的动态文本节点
	3 => 不包含变量的纯文本节点