# Prompt 3：Domain 工具与 Prompt 架构规范化

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
