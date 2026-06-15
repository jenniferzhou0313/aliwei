# Prompt 15：测试、Prompt 评估和质量检查

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
