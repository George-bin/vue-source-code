1.什么是虚拟DOM？
所谓虚拟DOM，就是使用一个JS对象来描述一个DOM节点。
<div class="a" id="b">我是内容</div>
{
  tag:'div',        // 元素标签
  attrs:{           // 属性
    class:'a',
    id:'b'
  },
  text:'我是内容',  // 文本内容
  children:[]       // 子元素
}

2.为什么使用虚拟DOM？
	1⃣数据驱动 => 数据变化，更新视图 => 操作真实DOM又非常消耗性能 => 用JS的计算性能换取操作DOM所消耗的性能
	2⃣无论如何都逃不掉操作DOM这道坎，但是我们可以进可能少的操作DOM => 不要盲目的更新视图 => 通过对比数据变化的前后状态，计算出视图中需要更新的地方，只更新需要更新的地方
	3⃣当数据发生变化时，对比数据变化前后的虚拟DOM，通过DOM-diff算法计算出需要更新的地方，更新需要更新的视图

3.VNode的类型
	1⃣注视节点：text、isComment
	2⃣文本节点：text
	3⃣元素节点：真实DOM节点
	4⃣组件节点：componentOptions(组件的options选项，如：props等)、componentInstance(当前组件节点对应的Vue实例)
	5⃣函数式组件节点：fnContext(函数式组件对应的Vue实例)、fnOptions(组件的options选项)
	6⃣克隆节点：把一个已经存在的节点赋值一份出来，它主要为了做模板编译优化时使用isCloned

3.DOM-Diff
	VNode的最大用途就是在数据变化前后生成真实DOM节点对应的虚拟DOM，然后就可以通过对比新旧两个Vnode，找出差异所在，然后更新有差异的DOM节点，最终达到以最少操作真实DOM完成更新视图目的。
	以新的VNode为基准，改造旧的oldVnode使之成跟新的VNode一样，这就是patch过程中要干的事。
	整个patch过程无非干三件事：
	1⃣创建节点：新的VNode中有而旧的oldVNode中没有，就在旧的oldVNode中创建对应的节点；
	2⃣删除节点：新的VNode中没有而旧的oldVNode中有，就从旧的oldVNode中删除对应的节点；
	3⃣更新节点：新的VNode和旧的oldVNode中都有，就以新的VNode为准更新旧的oldVNode。

4.创建节点
	虽然VNode类可以描述6中类型的节点，但实际上只有3中类型的节点能够被创建并插入到DOM元素中：元素节点、注视节点、普通节点。

5.删除节点
	如果某些节点在新的VNode中没有而在旧的oldVNode中有，那么就需要把这些节点从旧的oldVNode中删除。

6.更新节点
	静态节点：节点里面只包含了纯文字信息，没有任何可变的变量，也就是说，不管数据再怎么变化，只要这个节点第一次渲染了，那么以后他就永远不会发生变化，这是因为他不包含任何变量，所以数据发生任何变化都与它无关。
	更新节点的时候需要对3中情况进行判断并分别处理：
	1⃣️VNode和oldVNode均为静态节点：无需处理
	2⃣️VNode是文本节点：表示这个节点内只包含纯文本信息，那就只需要看oldVNode是否也是文本节点。如果是，那就比较文本内容是否相同，如果不同则把oldVNode的文本内容改成和VNode的文本内容一样；如果oldVNode不是文本节点，不论它是什么直接调用setTextNode方法把它改成文本节点，并且文本内容和VNode文本一样；
	3⃣️VNode是元素节点：
		如果VNode是元素节点，则又细分为以下情况：
		1⃣️该节点包含子节点
		如果新的节点内包含了子节点，那么此时要看旧的节点是否包含子节点，如果旧的节点里也包含了子节点，那就需要递归对比更新子节点；如果旧的节点里不包含子节点，那么这个旧节点有可能是空节点或者是文本节点，如果旧的节点是空节点就把新的节点里的子节点创建一份然后插入到旧的节点里面，如果旧的节点是文本节点，则把文本清空，然后把新的节点里的子节点创建一份然后插入到旧的节点里面。
		2⃣️该节点不包含文本节点
		如果该节点不包含子节点，同时它又不是文本节点，那就说明该节点是个空节点，那就好办了，不管旧节点之前里面都有啥，直接清空即可。

7.更新子节点 => 循环对比ch和oldCh
	ch => oldCh => 合适的位置是所有未处理节点之前，而并非所有已处理节点之后
	1⃣️创建子节点：ch中的子节点在oldCh中不存在，则创建子节点
	2⃣️删除子节点：对比结束后，oldCh存在剩余未处理的子节点，则直接删除
	3⃣️移动子节点：ch与oldCh中存在相同节点，但是位置不同，以ch中子节点的位置为基准，调整oldCh中子节点的位置
	4⃣️更新子节点：ch与oldCh中存在相同节点，并且位置也相同，则更新oldCh中的子节点

8.优化更新子节点
	1⃣️先把newChildren数组里的所有未处理子节点的第一个子节点和oldChildren数组里所有未处理子节点的第一个子节点做比对，如果相同，那就直接进入更新节点的操作；
	2⃣️如果不同，再把newChildren数组里所有未处理子节点的最后一个子节点和oldChildren数组里所有未处理子节点的最后一个子节点做比对，如果相同，那就直接进入更新节点的操作；
	3⃣️如果不同，再把newChildren数组里所有未处理子节点的最后一个子节点和oldChildren数组里所有未处理子节点的第一个子节点做比对，如果相同，那就直接进入更新节点的操作，更新完后再将oldChildren数组里的该节点移动到与newChildren数组里节点相同的位置；
	4⃣️如果不同，再把newChildren数组里所有未处理子节点的第一个子节点和oldChildren数组里所有未处理子节点的最后一个子节点做比对，如果相同，那就直接进入更新节点的操作，更新完后再将oldChildren数组里的该节点移动到与newChildren数组里节点相同的位置；
	5⃣️最后四种情况都试完如果还不同，那就按照之前循环的方式来查找节点。

	优化策略：
	newStartIdx：newChildren数组里开始位置的下标
	newEndIdx：newChildren数组里结束位置的下标
	oldStartIdx：oldChildren数组里开始位置的下标
	oldEndIdx：oldChildren数组里结束位置的下标

	在循环的时候，每处理一个节点，就将下标所指向的