# Prompt 10：项目复盘助手 P0 完善

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
