# Prompt 9：OKR 助手 P0 完善

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
