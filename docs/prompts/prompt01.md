# Prompt 1：项目标准文档和 AI 协作规则

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
