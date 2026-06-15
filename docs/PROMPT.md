# Aliwei — AI 工作指令

> 给 AI（Claude / Codex / Cursor）看的协作规则。
> 具体任务 prompt0~prompt16 在钉钉文档里，团队成员执行时复制粘贴给你。

---

## 1. 项目是什么

阿里职场 AI 助手 — Web 端 chat app，4 个工具（黑话翻译 / 周报 / OKR / 复盘）共用一个对话界面。pnpm workspace 单仓库：

```
apps/web      Next.js 16 前端 (3000)
apps/api      Hono 后端 (3001)
apps/dingtalk 钉钉端占位
packages/domain  工具定义 + Prompt + 黑话词典
packages/db       SQLite + Drizzle
packages/ui       assistant-ui + shadcn
```

详细架构、依赖方向、启动方式见 [`README.md`](../README.md)。

---

## 2. 不变的原则

1. **不推倒重来**。在现有第一版本基础上整理、增强；不要删 `apps/*` 或 `packages/*` 结构。
2. **不重写无关模块**。只改自己模块；跨模块改动要在 PR 描述里写清原因。
3. **单向依赖**。`apps/* → packages/*`，package 之间互不引用。不要让 `domain` 引 `db`，不要让 `ui` 引 `api`。
4. **不提交** `.env` / `local.db` / `node_modules` / `.next` / `*.key` / `*.pem`。
5. **业务逻辑放 service 层**。route / handler 只做参数解析和转发，不要在 `apps/api/src/routes/` 里写复杂逻辑。Prompt 不散落到前端页面，统一在 `packages/domain/src/prompts/`。

---

## 3. 命名与接口约定

- 字段统一 **camelCase**。
- 工具 ID 统一用 **`toolId`**；线程 ID 统一用 **`threadId`**。
- 用户身份字段 **`guestId`**（Phase 1 匿名 cookie）；Phase 2 替换为 `userId`，schema 不变。
- HTTP 错误响应统一结构：

```json
{ "success": false, "message": "...", "errorCode": "CODE", "data": null }
```

- 流式接口保持 streaming response；非流式错误用上面的结构。

---

## 4. 通用 prompt 写法

AI 写的代码 / Prompt 要满足：

- **Prompt 文件**：`packages/domain/src/prompts/<tool>.ts`，导出 `systemPrompt`（字符串或函数）和 `starter`（首条用户消息模板）。在 `prompts/index.ts` 注册。
- **工具元数据**：在 `packages/domain/src/tools.ts` 的 `TOOLS` 数组里加 `{ id, name, description, systemPromptFn, starterFn }`。
- **黑话词库**：新增词条改 `packages/domain/src/jargon-dict.ts`，调用 `formatDictForPrompt()` 注入。
- **API 路由**：新功能走 `apps/api/src/routes/<thing>.ts`，业务放 `services/`。
- **前端组件**：业务组件放 `apps/web/src/client/components/`，跨页面复用才进 `packages/ui/`。

---

## 5. 完成一个 prompt 后的动作

每次任务结束前必须做：

1. 跑 `pnpm typecheck` / `pnpm lint` / `pnpm build`，全部通过。
2. 涉及 API：`pnpm dev:api` + `curl http://localhost:3001/health`。
3. 涉及 Web：`pnpm dev:web` + 浏览器打开 `http://localhost:3000` 人工跑一遍。
4. 把变更写进 [`README.md`](../README.md) 或 [`DEVELOP.md`](DEVELOP.md)（如果改了工程基线 / 团队约定）。
5. **不要写 status snapshot 文件**。如需记录当前进度，直接改 `README.md` 或本文件。

---

## 6. 接手项目时的必读顺序

1. [`README.md`](../README.md) — 项目是什么、怎么跑、依赖关系
2. [`DEVELOP.md`](DEVELOP.md) — 团队约定、分支、PR 流程
3. 本文件 — AI 协作规则
4. 钉钉文档 — 当前要做到哪个 prompt、下一个 prompt 是什么

完成后从「下一个 prompt」开始，不要重做已完成内容。