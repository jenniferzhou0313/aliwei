# Aliwei Agent 开发任务分工与 Prompt 使用说明

> 适用对象：阿里味 Agent 项目全体成员  
> 适用仓库：https://github.com/jenniferzhou0313/aliwei.git  
> 目的：明确每个人负责什么、应该使用哪些 Prompt、哪些文件可以改、怎么测试、怎么提 PR，并保证任何 AI 都可以随时从已经完成的 Prompt 继续做。  
> 当前背景：项目已经有第一版本，但工程框架和规范不够清晰。后续所有 Prompt 都必须基于当前第一版本继续整理和增强，不能推倒重来。

---

## 0. Prompt Pack 怎么用

大家手里这份 Prompt Pack，不是让每个人从 Prompt 0 一直跑到 Prompt 16。

正确方式是：

```text
每个人只使用自己负责模块对应的 Prompt。
不要一次性把所有 Prompt 都发给 Claude / Codex / Cursor / ChatGPT。
不要让 AI 生成一个全新的完整项目。
不要改自己模块以外的核心文件。
每完成一个 Prompt，都必须写 docs/status/promptXX_snapshot.md。
```

Prompt Pack 的作用：

```text
README.md：告诉大家项目是什么、怎么启动
CLAUDE.md：告诉 AI 代码规则、项目边界、禁止事项
docs/architecture.md：告诉大家工程架构和依赖关系
docs/api.md：告诉大家 API 合同
docs/prompt-spec.md：告诉大家 Prompt 和工具输出标准
docs/test-checklist.md：告诉大家如何验收
docs/status/promptXX_snapshot.md：告诉后续 AI 当前做到哪里
Prompt Pack：告诉 AI 每一步具体做什么
```

---

## 1. 当前统一结论

### 1.1 产品 MVP 主流程

Aliwei Agent 的 MVP 主流程是：

```text
用户打开 Web / 钉钉入口
→ 选择工具：周报 / OKR / 复盘 / 黑话翻译
→ 前端创建或选择 thread
→ 前端发送 messages + toolId 到 apps/api
→ API 根据 toolId 从 packages/domain 读取 systemPrompt
→ API 调用 LLM 并返回 streaming response
→ API 保存 thread + messages 到 packages/db
→ 用户继续多轮对话
→ 后续支持导出 Markdown / 钉钉文档 / 复制结果
```

P0 必须稳定跑通：

```text
1. 周报助手
2. OKR 助手
3. 项目复盘助手
4. 黑话翻译器
5. Web 对话主流程
6. 历史 thread 保存和删除
7. Prompt 结构化管理
8. 基础安全和环境变量管理
```

P1 再做：

```text
1. 360 评估辅助
2. 会议效率助手
3. Prompt 质量评估
4. 钉钉端基础接入
```

P2 后做：

```text
1. 阿里文化百科
2. 绩效面谈模拟器
3. 周报排行榜
4. RAG 知识库
5. 完整部署与运营数据
```

### 1.2 当前工程基线

当前仓库已经有：

```text
apps/web：Next.js 前端，端口 3000
apps/api：Hono 后端，端口 3001
apps/dingtalk：钉钉端占位
packages/domain：工具定义、黑话词典、Prompt
packages/db：SQLite + Drizzle
packages/ui：assistant-ui + shadcn 组件
```

当前已经存在的工具：

```text
jargon：黑话翻译器
weekly：周报助手
okr：OKR 助手
review：复盘助手
```

后续开发原则：

```text
1. 继续使用 pnpm workspace
2. 继续保留 apps/* + packages/* 单向依赖结构
3. 不要把 API 逻辑写进 apps/web
4. 不要把 Prompt 散落到前端页面
5. 不要在 handler / route 里写复杂业务逻辑
6. 不要提交真实 API key
7. 不要因为第一版本不规范就全量重建
```

### 1.3 统一接口和数据标准

后续 docs/api.md 应统一这些接口：

```http
GET    /health
POST   /chat
GET    /threads
GET    /threads/:id/messages
DELETE /threads/:id
POST   /parse-pdf
```

后续可能新增：

```http
POST   /feedback
GET    /tools
GET    /tools/:toolId/examples
POST   /export/markdown
```

统一字段：

```text
字段统一 camelCase
工具 ID 统一使用 toolId
线程 ID 统一使用 threadId
用户匿名身份统一使用 guestId / userId，不做真实账号登录
环境变量统一从 apps/api/.env 和 apps/web/.env.local 读取
```

统一错误返回：

```json
{
  "success": false,
  "message": "错误说明",
  "errorCode": "ERROR_CODE",
  "data": null
}
```

流式接口可以保持 streaming response，但错误结构要在非 streaming 错误中统一。

---

## 2. 成员分工总览

| 成员 | 模块 | 主要 Prompt | 暂时不要做 |
|---|---|---|---|
| A：技术负责人 / 架构 Owner | 当前版本审计、工程规范、API 合同、最终集成 | Prompt 0、1、2、4、15、16 | 不要独自重写所有功能 |
| B：Prompt / Domain Owner | 工具定义、Prompt 架构、黑话词典、P0/P1 工具 Prompt | Prompt 3、8、9、10、11、12、13 | 不要改 API 路由和 DB 核心结构 |
| C：API / DB Owner | Hono API、chat service、LLM client、thread/message 存储 | Prompt 4、5、6、15 | 不要改 Web UI 复杂交互 |
| D：Web UI Owner | Next.js 页面、Assistant UI、工具切换、历史线程体验 | Prompt 7、8、9、10、11 | 不要改 LLM client 和 DB schema |
| E：钉钉 / 部署 Owner | 钉钉端方案、环境配置、部署文档 | Prompt 14、16 | 不要提前做复杂钉钉互动卡片 |
| 全员 | 项目理解和规则 | Prompt 0 可作为阅读审计；每人都要读 Prompt 1 产出的 docs | 不要绕过 docs 和状态快照 |

如果团队只有 3-4 人，可以合并为：

```text
A：技术负责人 + API / DB
B：Prompt / Domain
C：Web UI
D：钉钉 / 文档 / 测试
```

---

## 3. 当前开发顺序

后续从当前第一版本开始，按这个顺序做：

```text
Prompt 0：审计当前第一版本，生成现状快照
Prompt 1：补齐项目标准文档和 AI 协作规则
Prompt 2：规范 pnpm workspace、依赖、脚本和环境文件
Prompt 3：规范 packages/domain 的工具和 Prompt 架构
Prompt 4：规范 API Contract 和错误响应
Prompt 5：稳定 chat service、LLM client、streaming 和错误处理
Prompt 6：规范 DB schema、thread/message 存储和数据访问层
Prompt 7：规范 Web 对话 UI、工具切换和历史线程
Prompt 8：完善周报助手
Prompt 9：完善 OKR 助手
Prompt 10：完善复盘助手
Prompt 11：完善黑话翻译器
Prompt 12：新增 360 评估辅助
Prompt 13：新增会议效率助手
Prompt 14：钉钉端基础接入和方案落地
Prompt 15：测试、Prompt 评估和质量检查
Prompt 16：最终文档、部署说明和交付检查
```

重要顺序限制：

```text
Prompt 3 必须在 8-13 前完成，否则工具 Prompt 会继续散乱。
Prompt 4-6 必须在 7 大改前完成，否则前端会对接不稳定接口。
Prompt 14 不要太早做，必须等 Web + API + Prompt 主链路稳定。
Prompt 15 必须在 8-13 至少完成 P0 后做，否则测试没有意义。
```

---

## 4. Prompt 0：当前第一版本审计和基线快照

### 4.1 目标

```text
读取当前仓库，不改业务功能，只做审计。
输出当前架构、文件树、启动方式、已实现功能、主要问题和后续 Prompt 起点。
```

### 4.2 允许修改文件

```text
docs/status/prompt00_snapshot.md
docs/audit/current-version-audit.md
```

如果 `docs/` 不存在，可以创建。

### 4.3 不允许修改

```text
apps/**
packages/**
package.json
pnpm-lock.yaml
README.md
```

### 4.4 给 AI 的 Prompt

```text
你现在接手一个已经有第一版本的 Aliwei Agent 项目。
仓库地址是：https://github.com/jenniferzhou0313/aliwei.git

重要背景：
这个项目不是从零开始。当前第一版本已经存在，但结果不够规范、框架不够清晰。
你的任务不是重写项目，而是审计当前项目，为后续 Prompt 继续开发建立清晰基线。

请执行以下任务：

1. 阅读当前仓库的 README.md、package.json、pnpm-workspace.yaml、apps/*、packages/*。
2. 输出当前文件树，重点说明：
   - apps/web 做什么
   - apps/api 做什么
   - apps/dingtalk 当前状态
   - packages/domain 当前包含什么
   - packages/db 当前包含什么
   - packages/ui 当前包含什么
3. 检查当前启动命令：
   - pnpm install
   - pnpm dev
   - pnpm dev:api
   - pnpm dev:web
   - pnpm typecheck
   - pnpm lint
4. 不要修改任何业务代码。
5. 只新增：
   - docs/audit/current-version-audit.md
   - docs/status/prompt00_snapshot.md
6. 在审计文档中写清楚：
   - 当前已经实现的功能
   - 当前最不规范的地方
   - 哪些文件属于共享核心文件
   - 后续 Prompt 1 应该从哪里开始
7. 如果发现项目无法启动，记录原因，不要自行重构。

验收标准：
- 没有修改 apps/** 和 packages/**
- docs/audit/current-version-audit.md 存在
- docs/status/prompt00_snapshot.md 存在
- 后续任何 AI 读取这两个文档后，能知道当前项目做到哪里
```

### 4.5 测试方式

```powershell
pnpm install
pnpm typecheck
pnpm lint
```

### 4.6 推荐 commit

```powershell
git commit -m "docs: audit current aliwei baseline"
```

---

## 5. Prompt 1：项目标准文档和 AI 协作规则

### 5.1 目标

```text
补齐项目标准文档，让任何 AI 都知道项目规则、架构、接口、Prompt 标准和测试标准。
```

### 5.2 允许修改文件

```text
README.md
CLAUDE.md
docs/architecture.md
docs/api.md
docs/prompt-spec.md
docs/test-checklist.md
docs/status/prompt01_snapshot.md
```

### 5.3 不允许修改

```text
apps/**
packages/**
```

### 5.4 给 AI 的 Prompt

```text
你正在执行 Aliwei Agent 的 Prompt 1：项目标准文档和 AI 协作规则。

请先阅读：
- README.md
- docs/audit/current-version-audit.md
- docs/status/prompt00_snapshot.md

项目背景：
Aliwei 是一个阿里味智能工作助手。PRD 要求覆盖周报、OKR、复盘、360、黑话翻译、会议效率等场景。当前第一版本已有 Web、API、domain、db、ui、dingtalk 基本结构，但还缺少标准文档。

你的任务：

1. 更新 README.md：
   - 项目定位
   - 当前技术栈
   - 文件树
   - 启动方式
   - 常用命令
   - 当前已实现工具
   - 后续开发规则
2. 新增 CLAUDE.md：
   - 告诉 Claude / Codex / Cursor / ChatGPT 如何改这个项目
   - 明确禁止推倒重来
   - 明确 apps 和 packages 的职责边界
   - 明确不要提交 .env、key、node_modules、local.db
3. 新增 docs/architecture.md：
   - 说明 monorepo 架构
   - 说明 apps/web、apps/api、apps/dingtalk、packages/domain、packages/db、packages/ui 的职责
   - 说明依赖方向：apps -> packages，packages 之间尽量低耦合
4. 新增 docs/api.md：
   - 记录当前已有接口：GET /health、POST /chat、GET /threads、GET /threads/:id/messages、DELETE /threads/:id、POST /parse-pdf
   - 写清楚 request / response 结构
   - 写清楚 streaming 接口的特殊性
5. 新增 docs/prompt-spec.md：
   - 定义 toolId、label、starter、systemPrompt 的标准
   - 定义每个工具 Prompt 必须包含：角色、任务、输入要求、输出格式、追问规则、安全边界
6. 新增 docs/test-checklist.md：
   - 本地启动检查
   - API 检查
   - Web 检查
   - Prompt 输出质量检查
7. 新增 docs/status/prompt01_snapshot.md。

限制：
- 不要改 apps/**
- 不要改 packages/**
- 不要引入新依赖
- 不要实现新功能

验收标准：
- README.md 更清晰
- CLAUDE.md 存在
- docs/architecture.md 存在
- docs/api.md 存在
- docs/prompt-spec.md 存在
- docs/test-checklist.md 存在
- docs/status/prompt01_snapshot.md 存在
```

### 5.5 测试方式

```powershell
pnpm typecheck
pnpm lint
```

### 5.6 推荐 commit

```powershell
git commit -m "docs: add project standards and ai collaboration rules"
```

---

## 6. Prompt 2：Workspace、依赖、脚本和环境文件规范化

### 6.1 目标

```text
整理当前工程配置，让 pnpm workspace、scripts、env example、ignore 规则稳定，不改业务功能。
```

### 6.2 允许修改文件

```text
package.json
pnpm-workspace.yaml
tsconfig.base.json
.gitignore
apps/api/package.json
apps/api/.env.example
apps/web/package.json
apps/web/.env.example
apps/dingtalk/package.json
packages/domain/package.json
packages/db/package.json
packages/ui/package.json
docs/status/prompt02_snapshot.md
```

### 6.3 不允许修改

```text
apps/**/src/**
packages/**/src/**
```

除非只是修复 import path 配置导致的类型错误，并且必须在快照中说明。

### 6.4 给 AI 的 Prompt

```text
你正在执行 Aliwei Agent 的 Prompt 2：Workspace、依赖、脚本和环境文件规范化。

请先阅读：
- README.md
- CLAUDE.md
- docs/architecture.md
- docs/status/prompt01_snapshot.md

当前项目是 pnpm workspace。你的任务是规范工程配置，不要实现业务功能。

请执行：

1. 检查根 package.json：
   - scripts 是否包含 dev、dev:web、dev:api、build、start、lint、format:fix、typecheck
   - engines 是否明确 Node >= 20
   - packageManager 是否使用 pnpm
2. 检查 pnpm-workspace.yaml：
   - apps/*
   - packages/*
3. 检查 .gitignore：
   - node_modules
   - .next
   - dist
   - .env
   - .env.*
   - !.env.example
   - local.db
   - *.sqlite
4. 检查 apps/api/.env.example：
   - ALIBABA_API_KEY=
   - WEB_ORIGIN=http://localhost:3000
   - PORT=3001
5. 检查 apps/web/.env.example：
   - NEXT_PUBLIC_API_URL=http://localhost:3001
6. 检查每个 package 的 scripts：
   - typecheck
   - lint
   - dev / build / start 按需要保留
7. 如果发现 package-lock.json 和 pnpm-lock.yaml 同时存在：
   - 不要擅自删除
   - 在 docs/status/prompt02_snapshot.md 中说明建议：项目统一 pnpm 后可在负责人确认后删除 package-lock.json
8. 新增 docs/status/prompt02_snapshot.md。

限制：
- 不要改业务逻辑
- 不要重写 src 文件
- 不要引入大型新依赖
- 不要删除 lockfile，除非技术负责人明确要求

验收标准：
- pnpm install 可以执行
- pnpm typecheck 可以执行
- pnpm lint 可以执行
- 环境变量示例清楚
- docs/status/prompt02_snapshot.md 写清楚配置现状和遗留问题
```

### 6.5 测试方式

```powershell
pnpm install
pnpm typecheck
pnpm lint
```

### 6.6 推荐 commit

```powershell
git commit -m "chore(workspace): normalize scripts and environment examples"
```

---

## 7. Prompt 3：Domain 工具与 Prompt 架构规范化

### 7.1 目标

```text
规范 packages/domain，让所有工具都使用统一结构，后续周报、OKR、复盘、黑话、360、会议都可以独立扩展。
```

### 7.2 允许修改文件

```text
packages/domain/src/types.ts
packages/domain/src/tools.ts
packages/domain/src/jargon-dict.ts
packages/domain/src/prompts/base.ts
packages/domain/src/prompts/weekly.ts
packages/domain/src/prompts/okr.ts
packages/domain/src/prompts/review.ts
packages/domain/src/prompts/jargon.ts
packages/domain/src/prompts/index.ts
packages/domain/src/index.ts
docs/prompt-spec.md
docs/status/prompt03_snapshot.md
```

### 7.3 暂时不做

```text
不要新增 360 工具
不要新增会议工具
不要改 apps/web UI
不要改 apps/api 路由
```

### 7.4 给 AI 的 Prompt

```text
你正在执行 Aliwei Agent 的 Prompt 3：Domain 工具与 Prompt 架构规范化。

请先阅读：
- CLAUDE.md
- docs/architecture.md
- docs/prompt-spec.md
- docs/status/prompt02_snapshot.md

当前 packages/domain 已经有 tools、jargon-dict、prompts/base、weekly、okr、review、jargon。
你的任务是规范它们，不是重写整个项目。

请执行：

1. 统一 Tool 类型，至少包含：
   - id
   - label
   - description
   - category
   - starter
   - systemPrompt
   - examples 可选
2. 统一 toolId：
   - weekly
   - okr
   - review
   - jargon
3. 规范 buildSystemPrompt：
   - 身份层：阿里味 Agent 的角色
   - 能力层：黑话词典、方法论工具箱
   - 任务层：当前工具职责
   - 输出层：输出格式和追问规则
   - 安全层：敏感信息、HR / 法律 / 合规边界
4. 每个工具 Prompt 必须包含：
   - 角色
   - 适用场景
   - 输入不足时如何追问
   - 输出格式
   - 阿里味浓度控制
   - 不允许做什么
5. 保留当前已有 4 个工具，不要删除。
6. 更新 docs/prompt-spec.md，写清楚新增的 Tool 类型标准。
7. 新增 docs/status/prompt03_snapshot.md。

限制：
- 不要改 apps/api
- 不要改 apps/web
- 不要新增工具入口
- 不要改 DB
- 不要为了类型好看而破坏现有 import

验收标准：
- packages/domain 可以 typecheck
- TOOLS 数组仍然包含 weekly / okr / review / jargon
- findTool 正常工作
- buildSystemPrompt 结构清晰
- docs/prompt-spec.md 已更新
- docs/status/prompt03_snapshot.md 存在
```

### 7.5 测试方式

```powershell
pnpm typecheck
pnpm lint
```

### 7.6 推荐 commit

```powershell
git commit -m "refactor(domain): standardize tool and prompt contract"
```

---

## 8. Prompt 4：API Contract 与统一响应规范

### 8.1 目标

```text
规范 apps/api 的 HTTP 合同和错误结构，让前端和后续钉钉端都能复用。
```

### 8.2 允许修改文件

```text
apps/api/src/index.ts
apps/api/src/routes/chat.ts
apps/api/src/routes/threads.ts
apps/api/src/routes/parse-pdf.ts
apps/api/src/services/thread-service.ts
apps/api/src/services/chat-service.ts
apps/api/src/middleware/guest-id.ts
apps/api/src/types/ 或 apps/api/src/lib/ 新增轻量类型/response helper
docs/api.md
docs/status/prompt04_snapshot.md
```

### 8.3 暂时不做

```text
不要改 LLM Prompt 内容
不要改 Web UI
不要新增 360 / 会议功能
不要重构 DB schema
```

### 8.4 给 AI 的 Prompt

```text
你正在执行 Aliwei Agent 的 Prompt 4：API Contract 与统一响应规范。

请先阅读：
- docs/api.md
- docs/architecture.md
- docs/status/prompt03_snapshot.md

任务目标：
规范当前 Hono API 的接口合同和错误返回。

请执行：

1. 检查当前 API：
   - GET /health
   - POST /chat
   - GET /threads
   - GET /threads/:id/messages
   - DELETE /threads/:id
   - POST /parse-pdf
2. 对非 streaming 接口统一返回：
   - success
   - message
   - data
   - errorCode
3. POST /chat 是 streaming 接口，可以保留 Response streaming，但必须：
   - 校验 request body
   - toolId 不存在时返回清晰错误
   - messages 缺失时返回清晰错误
   - LLM key 缺失时返回清晰错误
4. 增加轻量 response helper，但不要引入复杂框架。
5. docs/api.md 必须写清楚每个接口：
   - method
   - path
   - request
   - response
   - errorCode
6. 新增 docs/status/prompt04_snapshot.md。

限制：
- 不要改 Web UI
- 不要改 packages/domain 的 Prompt 内容
- 不要改 DB schema
- 不要把业务逻辑写进 route，route 只做参数解析和 service 调用

验收标准：
- pnpm typecheck 通过
- pnpm lint 通过
- GET /health 正常
- GET /threads 正常返回统一结构
- DELETE /threads/:id 正常返回 204 或文档中约定的结构
- docs/api.md 与代码一致
```

### 8.5 测试方式

```powershell
pnpm typecheck
pnpm lint
pnpm dev:api
curl http://localhost:3001/health
```

### 8.6 推荐 commit

```powershell
git commit -m "feat(api): standardize api contract and error responses"
```

---

## 9. Prompt 5：Chat Service、LLM Client 和 Streaming 稳定性

### 9.1 目标

```text
稳定 POST /chat 的核心链路：参数校验、toolId 选择、systemPrompt 注入、LLM 调用、streaming、消息持久化、错误处理。
```

### 9.2 允许修改文件

```text
apps/api/src/routes/chat.ts
apps/api/src/services/chat-service.ts
apps/api/src/services/llm-client.ts
apps/api/src/services/thread-service.ts
apps/api/src/middleware/guest-id.ts
packages/domain/src/tools.ts
packages/domain/src/index.ts
docs/api.md
docs/test-checklist.md
docs/status/prompt05_snapshot.md
```

### 9.3 不允许修改

```text
apps/web 复杂 UI
packages/domain/src/prompts/* 的具体文案，除非只是适配 tool contract
packages/db schema 大改
```

### 9.4 给 AI 的 Prompt

```text
你正在执行 Aliwei Agent 的 Prompt 5：Chat Service、LLM Client 和 Streaming 稳定性。

请先阅读：
- docs/api.md
- docs/architecture.md
- docs/prompt-spec.md
- docs/status/prompt04_snapshot.md

任务目标：
稳定 POST /chat 主链路，不新增新工具。

请执行：

1. 检查 chat request body：
   - messages 必须存在且为数组
   - toolId 可选，但如果传入必须能在 packages/domain 找到
   - threadId 可选
2. system prompt 选择规则：
   - 如果 toolId 有效，使用该工具 systemPrompt
   - 如果没有 toolId，使用默认 assistant prompt 或 fallback
   - 不允许前端随意覆盖核心 system prompt
3. LLM client：
   - 统一读取 ALIBABA_API_KEY
   - baseURL 如存在要 normalize
   - key 缺失时返回清晰错误
   - provider 错误时不要让服务崩溃
4. Streaming：
   - 保持前端兼容
   - 不要把整个回复一次性返回，除非当前 SDK 不支持
5. 持久化：
   - 用户消息和 assistant 回复应能关联到 threadId
   - 如果当前项目已有 thread-service，就在其基础上修复，不要重写 DB
6. docs/test-checklist.md 增加 chat 流式测试。
7. 新增 docs/status/prompt05_snapshot.md。

限制：
- 不要新增 360 / 会议功能
- 不要重写 UI
- 不要删除已有 tools
- 不要提交真实 key

验收标准：
- 无 ALIBABA_API_KEY 时错误清楚
- toolId=weekly 可以正常走周报 prompt
- toolId=okr 可以正常走 OKR prompt
- toolId=review 可以正常走复盘 prompt
- toolId=jargon 可以正常走黑话 prompt
- 无效 toolId 不会导致 500 崩溃
- pnpm typecheck / lint 通过
```

### 9.5 测试方式

```powershell
pnpm typecheck
pnpm lint
pnpm dev:api
curl http://localhost:3001/health
```

### 9.6 推荐 commit

```powershell
git commit -m "fix(api): stabilize chat streaming and llm client errors"
```

---

## 10. Prompt 6：DB Schema、Thread / Message 存储规范化

### 10.1 目标

```text
规范 packages/db，确保 thread 和 message 的结构能支持多工具、多轮对话、历史记录和后续反馈评估。
```

### 10.2 允许修改文件

```text
packages/db/src/schema.ts
packages/db/src/queries.ts
packages/db/src/client.ts
packages/db/src/index.ts
apps/api/src/services/thread-service.ts
apps/api/src/services/chat-service.ts
docs/database.md
docs/api.md
docs/status/prompt06_snapshot.md
```

### 10.3 暂时不做

```text
不要引入用户登录系统
不要迁移到远程数据库
不要做 RAG 向量库
```

### 10.4 给 AI 的 Prompt

```text
你正在执行 Aliwei Agent 的 Prompt 6：DB Schema、Thread / Message 存储规范化。

请先阅读：
- docs/architecture.md
- docs/api.md
- docs/status/prompt05_snapshot.md

任务目标：
在现有 SQLite + Drizzle 基础上规范 thread/message 数据结构。

请执行：

1. 检查当前 schema 是否支持：
   - thread id
   - userId / guestId
   - toolId
   - title
   - createdAt
   - updatedAt
   - message id
   - role: user / assistant / system
   - content
   - createdAt
2. 如果缺字段，做最小改动补齐。
3. queries.ts 只负责 DB CRUD，不写业务逻辑。
4. thread-service.ts 负责：
   - list threads
   - load messages
   - remove thread
   - create / update thread title
   - append messages
5. chat-service.ts 只调用 thread-service，不直接散落 SQL。
6. 新增 docs/database.md，记录表结构和字段含义。
7. 更新 docs/api.md 中 thread 相关返回。
8. 新增 docs/status/prompt06_snapshot.md。

限制：
- 不要做用户注册登录
- 不要做远程数据库
- 不要清空历史数据，除非当前 schema 无法兼容并在快照说明
- 不要改 Web UI

验收标准：
- pnpm typecheck 通过
- GET /threads 能返回当前用户 threads
- GET /threads/:id/messages 能返回 messages
- DELETE /threads/:id 能删除 thread
- docs/database.md 存在
```

### 10.5 测试方式

```powershell
pnpm typecheck
pnpm lint
pnpm dev:api
curl http://localhost:3001/health
```

### 10.6 推荐 commit

```powershell
git commit -m "refactor(db): standardize thread and message storage"
```

---

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

## 12. Prompt 8：周报助手 P0 完善

### 12.1 目标

```text
让 weekly 工具严格符合 PRD：支持碎片输入，输出本周进展、风险/卡点、下周计划，并提供精简版/详细版。
```

### 12.2 允许修改文件

```text
packages/domain/src/prompts/weekly.ts
packages/domain/src/tools.ts
apps/web/src/client/components/assistant.tsx 仅在需要展示工具说明时修改
docs/prompt-spec.md
docs/test-checklist.md
docs/status/prompt08_snapshot.md
```

### 12.3 不允许修改

```text
apps/api streaming 主逻辑
packages/db schema
OKR / review / jargon 的 Prompt 文案
```

### 12.4 给 AI 的 Prompt

```text
你正在执行 Aliwei Agent 的 Prompt 8：周报助手 P0 完善。

请先阅读：
- docs/prompt-spec.md
- docs/status/prompt07_snapshot.md
- packages/domain/src/prompts/weekly.ts

PRD 要求：
周报助手要支持碎片化输入，自动整理为结构化、充满阿里味但可读的周报。
输出标准包括：本周进展、风险/卡点、下周计划。
支持精简版和详细版两种风格。

请执行：

1. 优化 WEEKLY_SYSTEM_PROMPT：
   - 输入不足时先追问，不要乱编关键数据
   - 输入足够时直接生成周报
   - 输出结构固定：
     ## 本周进展
     ## 风险 / 卡点
     ## 下周计划
     ## 可选优化建议
   - 每条进展尽量包含：动作、结果、数据、协同对象
   - 阿里味控制：每段 2-3 个词，不要堆砌
2. 支持用户指定：
   - 精简版
   - 详细版
   - 适度阿里味
   - 高浓度阿里味
   - 去黑话版本
3. 增加 3-5 个测试样例到 docs/test-checklist.md。
4. 更新 docs/prompt-spec.md 中 weekly 标准。
5. 新增 docs/status/prompt08_snapshot.md。

限制：
- 不要改 API
- 不要改 DB
- 不要新增导出功能
- 不要编造用户没有提供的真实业务数据

验收标准：
- weekly prompt 结构清晰
- 碎片输入可以生成周报
- 信息不足时会追问
- 支持精简版/详细版
- pnpm typecheck / lint 通过
```

### 12.5 测试方式

```powershell
pnpm typecheck
pnpm lint
pnpm dev
```

人工测试输入：

```text
这周做了增长方案评审，修了 3 个 bug，和数据团队对了 AB 实验平台，下周准备出 MVP 方案。
```

### 12.6 推荐 commit

```powershell
git commit -m "feat(prompt): improve weekly report assistant"
```

---

## 13. Prompt 9：OKR 助手 P0 完善

### 13.1 目标

```text
让 OKR 工具符合 PRD：引导 Objective / Key Results，支持对齐检查和质量评分。
```

### 13.2 允许修改文件

```text
packages/domain/src/prompts/okr.ts
docs/prompt-spec.md
docs/test-checklist.md
docs/status/prompt09_snapshot.md
```

### 13.3 给 AI 的 Prompt

```text
你正在执行 Aliwei Agent 的 Prompt 9：OKR 助手 P0 完善。

请先阅读：
- docs/prompt-spec.md
- docs/status/prompt08_snapshot.md
- packages/domain/src/prompts/okr.ts

PRD 要求：
OKR 助手要帮助用户制定/优化个人 OKR，并支持与上级/团队 OKR 对齐检查。
需要从挑战性、可衡量性、对齐度三个维度评分。

请执行：

1. 优化 OKR_SYSTEM_PROMPT：
   - 先判断用户是在新建 OKR、优化 OKR，还是做对齐检查
   - 如果信息不足，按顺序追问：业务背景、目标周期、上级/团队目标、用户职责、当前草稿
   - 输出格式固定：
     ## Objective
     ## Key Results
     ## 对齐分析
     ## 质量评分
     ## 优化建议
2. KR 必须可衡量：
   - 包含数字、比例、里程碑或清晰验收标准
   - 不允许所有 KR 都是“提升、优化、推进”这种空话
3. 评分维度：
   - 挑战性 1-5
   - 可衡量性 1-5
   - 对齐度 1-5
   - 总评
4. 阿里味表达要自然：抓手、颗粒度、对齐、闭环可以使用，但不能替代真实内容。
5. 更新 docs/prompt-spec.md 和 docs/test-checklist.md。
6. 新增 docs/status/prompt09_snapshot.md。

限制：
- 不要改 API
- 不要改 DB
- 不要生成薪酬、绩效结论
- 不要代替管理者做正式绩效判断

验收标准：
- OKR 输出结构稳定
- KR 可衡量
- 能做对齐检查
- 有 1-5 分质量评分
- pnpm typecheck / lint 通过
```

### 13.4 推荐 commit

```powershell
git commit -m "feat(prompt): improve okr assistant with scoring"
```

---

## 14. Prompt 10：项目复盘助手 P0 完善

### 14.1 目标

```text
让 review 工具符合 PRD：基于 STAR 和复盘文化，引导用户生成结构化复盘文档。
```

### 14.2 允许修改文件

```text
packages/domain/src/prompts/review.ts
docs/prompt-spec.md
docs/test-checklist.md
docs/status/prompt10_snapshot.md
```

### 14.3 给 AI 的 Prompt

```text
你正在执行 Aliwei Agent 的 Prompt 10：项目复盘助手 P0 完善。

请先阅读：
- docs/prompt-spec.md
- docs/status/prompt09_snapshot.md
- packages/domain/src/prompts/review.ts

PRD 要求：
复盘助手要基于 STAR 法则和阿里复盘文化，帮助用户完成结构化项目复盘。

请执行：

1. 优化 REVIEW_SYSTEM_PROMPT：
   - 判断用户是否已经提供完整复盘信息
   - 如果不足，按 STAR 提问：Situation、Task、Action、Result
   - 进一步追问：做得好的、待改进的、根因、下次行动
2. 输出格式固定：
   ## 项目背景
   ## 目标与任务
   ## 关键行动
   ## 结果与数据
   ## 做得好的
   ## 待改进的
   ## 根因分析
   ## 经验沉淀
   ## 下一步 Action Item
   ## 复盘金句
3. 复盘金句可以有阿里味，但不能空泛。
4. Action Item 必须包含：动作、Owner、Deadline 或时间建议。
5. 更新 docs/prompt-spec.md 和 docs/test-checklist.md。
6. 新增 docs/status/prompt10_snapshot.md。

限制：
- 不要改 API
- 不要做导出 Markdown 接口
- 不要编造项目数据

验收标准：
- 支持 STAR 引导
- 支持完整复盘文档输出
- 自动识别做得好和待改进
- Action Item 具体可执行
- pnpm typecheck / lint 通过
```

### 14.4 推荐 commit

```powershell
git commit -m "feat(prompt): improve project review assistant"
```

---

## 15. Prompt 11：黑话翻译器 P1 完善

### 15.1 目标

```text
让 jargon 工具支持黑话查询、普通话转阿里味、阿里味转普通话。
```

### 15.2 允许修改文件

```text
packages/domain/src/jargon-dict.ts
packages/domain/src/prompts/jargon.ts
docs/prompt-spec.md
docs/test-checklist.md
docs/status/prompt11_snapshot.md
```

### 15.3 给 AI 的 Prompt

```text
你正在执行 Aliwei Agent 的 Prompt 11：黑话翻译器 P1 完善。

请先阅读：
- docs/prompt-spec.md
- docs/status/prompt10_snapshot.md
- packages/domain/src/jargon-dict.ts
- packages/domain/src/prompts/jargon.ts

PRD 要求：
黑话翻译器需要支持：
1. 查询黑话释义、使用场景和例句
2. 普通文本转阿里味
3. 阿里味转普通话
4. 新人友好解释

请执行：

1. 扩展 JARGON_DICT：
   - word
   - category
   - definition
   - examples
   - plainMeaning
   - usageNote
2. 优化 JARGON_SYSTEM_PROMPT：
   - 先判断用户意图：查询 / 普通转阿里味 / 阿里味转普通话
   - 查询时输出：释义、使用场景、例句、注意事项
   - 普通转阿里味时给 2 个版本：适度版、高浓度版
   - 阿里味转普通话时必须说人话，不能继续堆黑话
3. 加入安全边界：
   - 不嘲讽公司文化
   - 不贬低其他公司
   - 不鼓励过度包装空内容
4. 更新 docs/prompt-spec.md 和 docs/test-checklist.md。
5. 新增 docs/status/prompt11_snapshot.md。

限制：
- 不要改 API
- 不要改 Web UI，除非只是显示工具描述
- 不要让黑话替代真实业务内容

验收标准：
- 支持三种模式
- 输出新人能看懂
- 黑话密度可控
- pnpm typecheck / lint 通过
```

### 15.4 推荐 commit

```powershell
git commit -m "feat(prompt): improve jargon translator modes"
```

---

## 16. Prompt 12：新增 360 评估辅助

### 16.1 目标

```text
新增 360 工具，支持自评、他评建议和价值观维度映射。
```

### 16.2 允许修改文件

```text
packages/domain/src/prompts/feedback360.ts
packages/domain/src/prompts/index.ts
packages/domain/src/tools.ts
packages/domain/src/types.ts 如确有必要
apps/web/src/client/components/assistant.tsx 仅用于新增工具入口
docs/prompt-spec.md
docs/test-checklist.md
docs/status/prompt12_snapshot.md
```

### 16.3 不允许修改

```text
apps/api chat 主逻辑
packages/db schema
已有 weekly / okr / review / jargon 行为
```

### 16.4 给 AI 的 Prompt

```text
你正在执行 Aliwei Agent 的 Prompt 12：新增 360 评估辅助。

请先阅读：
- docs/prompt-spec.md
- docs/status/prompt11_snapshot.md
- packages/domain/src/tools.ts

PRD 要求：
360 评估辅助要帮助用户撰写自评和他评内容，既专业又有阿里味，并能映射到价值观维度。

请执行：

1. 新增 prompt 文件：packages/domain/src/prompts/feedback360.ts
2. 新增 tool：
   - id: feedback360
   - label: 360 评估
   - category: evaluation
3. Prompt 能处理两种模式：
   - 自评生成
   - 他评建议
4. 输出格式：
   ## 评价对象
   ## 业绩事实
   ## 价值观映射
   ## 亮点表达
   ## 可改进建议
   ## 最终版本
5. 语气可选：
   - 严肃专业
   - 温暖鼓励
6. 安全边界：
   - 不代替正式 HR 或主管判断
   - 不编造事实
   - 不输出薪资、晋升、裁员等结论
7. Web 工具入口增加 360 评估。
8. 更新 docs/prompt-spec.md 和 docs/test-checklist.md。
9. 新增 docs/status/prompt12_snapshot.md。

限制：
- 不要改 chat API 合同
- 不要改 DB
- 不要影响已有 4 个工具

验收标准：
- Web 能看到 360 评估工具
- toolId=feedback360 能找到 systemPrompt
- 自评和他评都有固定输出结构
- pnpm typecheck / lint 通过
```

### 16.5 推荐 commit

```powershell
git commit -m "feat(domain): add 360 evaluation assistant"
```

---

## 17. Prompt 13：新增会议效率助手

### 17.1 目标

```text
新增会议助手，支持会议纪要、会议邀请文案、会后 Action Item 跟进。
```

### 17.2 允许修改文件

```text
packages/domain/src/prompts/meeting.ts
packages/domain/src/prompts/index.ts
packages/domain/src/tools.ts
apps/web/src/client/components/assistant.tsx 仅用于新增工具入口
docs/prompt-spec.md
docs/test-checklist.md
docs/status/prompt13_snapshot.md
```

### 17.3 给 AI 的 Prompt

```text
你正在执行 Aliwei Agent 的 Prompt 13：新增会议效率助手。

请先阅读：
- docs/prompt-spec.md
- docs/status/prompt12_snapshot.md
- packages/domain/src/tools.ts

PRD 要求：
会议效率助手需要支持：
1. 会议纪要生成
2. 会议邀请文案
3. 会后跟进提醒

请执行：

1. 新增 packages/domain/src/prompts/meeting.ts
2. 新增 tool：
   - id: meeting
   - label: 会议助手
   - category: productivity
3. Prompt 判断用户意图：
   - meeting-notes
   - meeting-invite
   - follow-up
4. 会议纪要输出固定格式：
   ## 会议主题
   ## 背景
   ## 关键讨论
   ## 决策项
   ## Action Item
   | Action | Owner | Deadline | Status |
   ## 风险 / 待对齐事项
5. 会议邀请输出必须包含：
   - 会议目标
   - 参会对象
   - 预期产出
   - 会前准备
6. 跟进提醒必须简短、可直接发到 IM。
7. Web 增加会议助手入口。
8. 更新 docs/prompt-spec.md 和 docs/test-checklist.md。
9. 新增 docs/status/prompt13_snapshot.md。

限制：
- 不要接入真实日历
- 不要接入真实钉钉消息发送
- 不要改 API 合同
- 不要改 DB

验收标准：
- Web 能看到会议助手
- toolId=meeting 能找到 systemPrompt
- 会议纪要有 Action Item 表格
- pnpm typecheck / lint 通过
```

### 17.4 推荐 commit

```powershell
git commit -m "feat(domain): add meeting productivity assistant"
```

---

## 18. Prompt 14：钉钉端基础接入和方案落地

### 18.1 目标

```text
在当前 apps/dingtalk 占位基础上，形成最小可运行或最小可交付的钉钉端接入方案。
```

### 18.2 允许修改文件

```text
apps/dingtalk/**
docs/dingtalk.md
docs/api.md
docs/status/prompt14_snapshot.md
```

### 18.3 不允许修改

```text
apps/api chat 主逻辑，除非只是增加清晰的 endpoint 文档
apps/web/**
packages/domain Prompt 文案
packages/db schema
```

### 18.4 给 AI 的 Prompt

```text
你正在执行 Aliwei Agent 的 Prompt 14：钉钉端基础接入和方案落地。

请先阅读：
- docs/architecture.md
- docs/api.md
- docs/status/prompt13_snapshot.md
- apps/dingtalk/README.md 如存在

任务目标：
当前 PRD 推荐 MVP 阶段优先钉钉机器人，但当前仓库的 apps/dingtalk 只是占位。
本 Prompt 不要求一次性做完整钉钉生产接入，而是要把钉钉端的最小方案和代码占位整理清楚。

请执行：

1. 整理 apps/dingtalk：
   - README.md 写清楚当前状态
   - 写清楚如何复用 apps/api 的 /chat
   - 写清楚后续需要的钉钉机器人配置项
2. 新增 docs/dingtalk.md：
   - MVP 接入方案
   - message receive -> call apps/api /chat -> return response 的流程
   - 当前暂不实现复杂互动卡片
   - 安全注意事项：签名、token、企业内部使用
3. 如果已有 dingtalk src，则只做最小占位和类型整理。
4. 不要破坏 Web 端。
5. 新增 docs/status/prompt14_snapshot.md。

限制：
- 不要伪造真实钉钉凭证
- 不要提交 secret
- 不要做复杂卡片工作流
- 不要改 Prompt 内容

验收标准：
- apps/dingtalk/README.md 清楚
- docs/dingtalk.md 存在
- 后续成员能知道钉钉端怎么接 apps/api
- pnpm typecheck / lint 通过，或者如果 dingtalk 暂未纳入构建，文档要说明
```

### 18.5 推荐 commit

```powershell
git commit -m "docs(dingtalk): add mvp integration plan"
```

---

## 19. Prompt 15：测试、Prompt 评估和质量检查

### 19.1 目标

```text
建立可重复测试方法，避免每次改 Prompt 都靠主观感觉。
```

### 19.2 允许修改文件

```text
docs/test-checklist.md
docs/evaluation/prompt-eval-cases.md
docs/evaluation/manual-review-rubric.md
packages/domain/src/** 只允许为测试导出必要函数
apps/api/** 只允许轻量测试辅助
package.json 如需增加 test script，必须谨慎
docs/status/prompt15_snapshot.md
```

### 19.3 给 AI 的 Prompt

```text
你正在执行 Aliwei Agent 的 Prompt 15：测试、Prompt 评估和质量检查。

请先阅读：
- docs/test-checklist.md
- docs/prompt-spec.md
- docs/status/prompt14_snapshot.md

任务目标：
为 Aliwei Agent 建立人工 + 半自动的质量检查标准。

请执行：

1. 完善 docs/test-checklist.md：
   - 本地启动检查
   - API 检查
   - Web 检查
   - 每个工具的人工测试输入
   - 每个工具的合格输出标准
2. 新增 docs/evaluation/prompt-eval-cases.md：
   - weekly 至少 5 个 case
   - okr 至少 5 个 case
   - review 至少 5 个 case
   - jargon 至少 5 个 case
   - feedback360 至少 3 个 case，如该工具已完成
   - meeting 至少 3 个 case，如该工具已完成
3. 新增 docs/evaluation/manual-review-rubric.md：
   - 准确性
   - 结构化程度
   - 阿里味自然度
   - 可执行性
   - 安全合规
   - 是否编造信息
4. 如果增加 test script，只做轻量配置，不引入复杂测试框架，除非项目已有。
5. 新增 docs/status/prompt15_snapshot.md。

限制：
- 不要大改业务代码
- 不要改 Prompt 结果以适配某一个 case 而破坏通用性
- 不要接入真实用户数据

验收标准：
- docs/test-checklist.md 可直接给成员使用
- prompt-eval-cases.md 覆盖主要工具
- manual-review-rubric.md 有明确评分标准
- pnpm typecheck / lint 通过
```

### 19.4 推荐 commit

```powershell
git commit -m "test(prompt): add evaluation cases and review rubric"
```

---

## 20. Prompt 16：最终文档、部署说明和交付检查

### 20.1 目标

```text
整理最终交付文档，让项目可以被新人、老师、老板或后续 AI 直接接手。
```

### 20.2 允许修改文件

```text
README.md
CLAUDE.md
docs/architecture.md
docs/api.md
docs/database.md
docs/prompt-spec.md
docs/test-checklist.md
docs/dingtalk.md
docs/deployment.md
docs/status/final_snapshot.md
docs/status/prompt16_snapshot.md
```

### 20.3 给 AI 的 Prompt

```text
你正在执行 Aliwei Agent 的 Prompt 16：最终文档、部署说明和交付检查。

请先阅读：
- README.md
- CLAUDE.md
- docs/status/prompt15_snapshot.md
- docs/architecture.md
- docs/api.md
- docs/prompt-spec.md
- docs/test-checklist.md

任务目标：
整理项目最终可交付文档，不做大功能开发。

请执行：

1. 更新 README.md：
   - 项目简介
   - 当前已实现功能
   - 技术栈
   - 文件树
   - 本地启动
   - 常用命令
   - 环境变量
   - 团队开发流程
2. 更新 CLAUDE.md：
   - 保证规则和当前最终架构一致
3. 新增 docs/deployment.md：
   - 本地部署
   - Web / API 分离部署思路
   - 环境变量
   - 钉钉端后续部署注意事项
4. 更新 docs/status/final_snapshot.md：
   - 当前功能清单
   - 当前接口清单
   - 当前工具清单
   - 已知问题
   - 后续 P1 / P2 建议
5. 新增 docs/status/prompt16_snapshot.md。

限制：
- 不要大改业务代码
- 不要新增功能
- 不要删除历史 status snapshot

验收标准：
- 新人只看 README.md 可以启动项目
- AI 只看 CLAUDE.md + docs/status/final_snapshot.md 可以继续开发
- docs/deployment.md 说明清楚
- pnpm typecheck / lint / build 通过
```

### 20.4 测试方式

```powershell
pnpm install
pnpm typecheck
pnpm lint
pnpm build
pnpm dev
```

### 20.5 推荐 commit

```powershell
git commit -m "docs: finalize aliwei handoff and deployment guide"
```

---

## 21. Code Review 检查清单

每个 PR review 时，负责人必须检查：

```text
1. 是否只做了对应 Prompt 的内容
2. 是否修改了不该修改的模块
3. 是否保留当前第一版本结构，没有推倒重来
4. 是否更新 docs/status/promptXX_snapshot.md
5. 是否更新相关 docs
6. pnpm typecheck 是否通过
7. pnpm lint 是否通过
8. Web 是否能打开
9. API /health 是否正常
10. 是否没有提交 .env / key / token
11. 是否没有提交 node_modules / .next / local.db
12. Prompt 输出是否结构化
13. 阿里味是否自然，不是堆黑话
14. 是否存在编造用户未提供事实的问题
15. 是否明确后续 TODO
```

---

## 22. 当前最重要提醒

```text
现在不要追求一次性做完整系统。

第一阶段目标：
把已经做出的第一版本整理成规范工程，让任何 AI 和任何成员都能继续开发。

第二阶段目标：
稳定 Web + API + Domain + DB 主链路，让 P0 工具真正可用。

第三阶段目标：
再做 360、会议、钉钉、测试和部署。
```

所有人不管用 Claude、Codex、Cursor、ChatGPT 还是自己写代码，都必须遵守：

```text
README.md
CLAUDE.md
docs/architecture.md
docs/api.md
docs/prompt-spec.md
docs/test-checklist.md
docs/status/*.md
本 Prompt Pack
```
