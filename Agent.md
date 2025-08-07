1. 组件重构 / 新组件生成
任务类型：重构/新建 Vue3 组件
输入：现有组件代码或功能描述
输出要求：

使用 <script setup lang="ts"> 和 <style scoped lang="scss">。

元素尺寸与间距遵循 8 pt 规则；按钮高度 36 px；表单垂直间距 24 px。

所有颜色引用 $--el-color-primary 等 Element Plus 变量；若需自定义色阶，使用 CSS 变量 --color-primary-light-1…--color-primary-dark-2。

引入 Element Plus 组件时采用 auto-import 路径（假设已配置 unplugin‑auto‑import）。

在思路说明中标注可复用的 hooks 与 utils。

最终输出：组件代码 + 对应的简短单元测试（Vitest）。

2. Pinia Store 设计 Prompt
请充当 Pinia Store 设计助手

每个 store 放在 src/stores/**，使用 defineStore('name', …)；启用 persistedState。

State 严格声明类型，不允许 any；Getter 仅做派生；Action 负责异步与业务逻辑。

所有网络请求抽离到 src/services/**，使用 Axios，并返回严格的范型响应。

自动生成 store 单元测试，覆盖率 ≥ 80 %。

3. 路由与代码分割 Prompt
任务：优化路由表与动态组件加载

使用 createRouter + createWebHistory，基于文件目录自动化生成 routes。

路由级组件采用 defineAsyncComponent 或 Vite 动态 import，chunk name 对应页面文件名。

启用路由守卫：beforeEach 检查 login token，afterEach 记录埋点。

根据用户语言 cookie 动态切换 document.title。

输出：src/router/index.ts 全量代码 + 解释说明。

4. UI 主题与暗色模式
请为 Element Plus 配置完整的主题系统

颜色体系基于 #2196F3（主蓝）和 #455A64（主灰），自动生成 10 个色阶。

暗色模式下色阶自动反转；使用 CSS 变量挂载在 :root[data-theme='dark']。

生成 src/styles/theme.scss，并在 main.ts 中注入。

提供切换暗/亮主题的 useTheme() Hook，存储在 localStorage 并监听 prefers-color-scheme。

5. 动画与交互微动效
任务：为列表 & 弹窗添加细腻动效

引入 @vueuse/motion 或自定义 transition；时长 180 ms，缓动 cubic-bezier(0.4,0,0.2,1)。

列表增删使用 v-move 过渡；弹窗出现使用 scale+fade。

所有动效需同时考虑 Reduce Motion（prefers-reduced-motion）。