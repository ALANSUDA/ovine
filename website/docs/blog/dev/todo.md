- 测试 BUG，优化好配置参数的入口，给予合理提示。
- 测试 CLI，dev,build,scss,dll，没有 BUG 就直接发布 0.0.2
- 进一步完善 DEMO 与 文档
- 思考后端 API 实现，使用 nest 还是 java

  - nest、java 分别实现

- 思考 apollo client 接入

- 思考 amis 如何全局 数据，全局权限设置
- 添加 lib-limit-setting 权限面板
- 优化所有 cloneDeep 的情况，主要考虑数据流是否清晰，完全处理 object ReadOnly 的情况
- 修复文件更新 devServer 重启优化方案

- demo 需求对接

  - 需要增加 root 无敌权限---（不校验权限）
  - 实现 多级权限功能
  - 实现 子用户级别 treeView 图表展示
  - 完善所有列表的查询条件
  - 测试服 验证码登录有问题，每次都失败，cookie 设置问题

- lib/core 完善 typescript 类型
- 重新登录

- dashboard

  - 网站访问次数 PV
  - 系统总用户数
  - 当日登录数
  - 当日新注册数
  - 当日处理数据次数

  - 考虑
    - 留存率
    - 用户地理位置分布

- BUG
  - 热更新存在大量问题
    - actionAddr readonly 问题，一般重新登录时候会发生
    - routerHistory 热更后会失效， 文件更新引用不一致造成的
  - -优化封装 amis 组件
    - 权限面板 关闭不了
    - 优化权限 设置界面 配置
  - 添加全局用户弹窗
  - request TS 类型丢失
  - userItem 宽度问题

* 本周计划
  - 写文档
  - 优化代码
  - 添加编辑 JSON 接口
  - 发布上线
