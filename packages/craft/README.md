## @ovine/craft UI 编辑器

UI 通过点选的方式简化 JSON 配置过程，通过点选关联数据的方式，快速实现页面编辑的工具。

- [craft 编辑器](https://github.com/prevwong/craft.js)
- [react-jsonschema-form](https://rjsf-team.github.io/react-jsonschema-form/)
- [serialize-javascript](https://github.com/yahoo/serialize-javascript)

### 编辑器

- 悬浮快捷操作

  - 内置组件
  - 自建模版
  - 图标
  - 其他类型组件
    - 请求
    - 表单
    - 操作
    - 权限

- 编辑器布局
  - 实时渲染视图区域
    - 页面编辑
    - 项目全局编辑
      - 路由编辑器
      - 布局编辑
        - 侧边栏导航编辑
        - 头部工具栏编辑
        - 底部编辑
  - 头部工具栏
    - 组件库
    - LOGO
    - 全局/页面
    - 撤销/返回
    - 预览/发布
  - 左侧面板
    - 代码
    - 元件
      - 请求
      - 表单
      - 操作
      - 权限
  - 右侧面板
    - 属性面板

### TODO

- 一律不管 UI，直接上最核心的逻辑
- 研究 craft 与 tree 组件

- 思考如何处理表单与预设关系
- 如何处理弹窗由于页面的关系
- 核心思考代码编辑模式---注重点选---次种拖动模式
