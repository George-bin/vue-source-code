1. 什么是虚拟DOM

    所谓虚拟 DOM，就是使用一个 JS 对象来描述一个 DOM 节点。

2. 为什么需要虚拟DOM

    Vue 是数据驱动视图，数据发生变化视图就要随之更新，在更新视图时难免操作 DOM 对象，而操作真实 DOM 是非常消耗性能的，因为浏览器的标准把 DOM 设计的相当复杂。

    既然操作 DOM 如此消耗性能，那如何在更新视图时尽可能少的操作 DOM 呢？首先想到的是，不要盲目的更新视图，而是通过对比前后数据变化，计算出数据变化前后的状态，计算出视图中有哪些地方需要更新，只更新需要更新的地方，不需要更新的地方则不用关心。

    本质上，VNode 作用就是简化 DOM 节点的内部结构，通过新旧 VNode 对比，找出视图中需要更新的地方，生成新的 VNode，用于视图更新。

3. Vue中VNode的类型

    注释节点：text、isComment
    文本节点：text
    元素节点：tag、data（class、attributes等）、children
    组件节点：componentOptions（组件的options选项）、componentInstance（组件节点对应的实例）
    函数式组件节点：fnContext（函数式组件对应的实例）、fnOptions（组件的options选项）
    克隆节点：isCloned，其他属性与被克隆节点一致

4. DOM - diff

    以新的 VNode 为基准，改造旧的 oldVNode，使之成为跟新的 VNode 一样。
    创建节点：新的 VNode 中有而旧的 oldVNode 中没有，就在 oldVNode 中创建；
    删除节点：新的 VNode 中没有而旧的 oldVnode 中有，就从 oldVNode 中删除；
    更新节点：新的 VNode 和旧的 oldVNode 中都有，就以新的 VNode 为准，更新旧的 oldVNode

    更新节点流程：
        1.如果 VNode 和 oldVNode 都是静态节点
        2.如果