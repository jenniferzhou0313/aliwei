# Prompt 12：新增 360 评估辅助

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
