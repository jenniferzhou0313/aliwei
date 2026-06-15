# Prompt 7：Web 对话 UI、工具切换和历史线程体验

## 11. Prompt 7：Web 对话 UI、工具切换和历史线程体验

### 11.1 目标

```text
规范 apps/web 的用户体验：工具入口清楚、对话主流程稳定、历史线程可用、错误提示不崩溃。
```

### 11.2 允许修改文件

```text
apps/web/src/app/page.tsx
apps/web/src/app/layout.tsx
apps/web/src/client/components/assistant.tsx
apps/web/src/client/components/threadlist-sidebar.tsx
apps/web/src/client/contexts/thread-context.ts
apps/web/src/client/lib/api.ts
packages/ui/src/** 只允许 UI Owner 修改
docs/test-checklist.md
docs/status/prompt07_snapshot.md
```

### 11.3 不允许修改

```text
apps/api/src/services/llm-client.ts
packages/db/src/schema.ts
packages/domain/src/prompts/* 的 Prompt 文案
```

### 11.4 给 AI 的 Prompt

```text
你正在执行 Aliwei Agent 的 Prompt 7：Web 对话 UI、工具切换和历史线程体验。

请先阅读：
- docs/architecture.md
- docs/api.md
- docs/prompt-spec.md
- docs/status/prompt06_snapshot.md

任务目标：
让 Web 端成为稳定的 Aliwei Agent 使用入口。

请执行：

1. 首页必须清楚展示：
   - 周报助手
   - OKR 助手
   - 复盘助手
   - 黑话翻译器
2. 工具切换时：
   - 设置当前 toolId
   - 展示对应 starter
   - 新消息发送时带上 toolId
3. 历史线程侧边栏：
   - 能加载 threads
   - 能点击恢复 messages
   - 能删除 thread
4. API helper：
   - 统一读取 NEXT_PUBLIC_API_URL
   - API 报错时有清晰提示
   - 不要在组件里拼散乱 fetch
5. UI 文案：
   - 简体中文
   - 适度阿里味，但不要每个按钮都堆黑话
6. docs/test-checklist.md 增加 Web 人工测试步骤。
7. 新增 docs/status/prompt07_snapshot.md。

限制：
- 不要改 API 合同
- 不要改 DB schema
- 不要改 LLM client
- 不要新增 360 / 会议工具入口，除非后续 Prompt 要求

验收标准：
- http://localhost:3000 能打开
- 4 个工具按钮可见
- 选择工具后 starter 正确
- 发送消息时请求包含 toolId
- 历史线程可以加载
- API 失败时页面不白屏
- pnpm typecheck / lint 通过
```

### 11.5 测试方式

```powershell
pnpm typecheck
pnpm lint
pnpm dev:web
```

### 11.6 推荐 commit

```powershell
git commit -m "feat(web): standardize assistant tool switching and thread ui"
```

---
