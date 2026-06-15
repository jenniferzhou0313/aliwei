# Prompt 8：周报助手 P0 完善

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
