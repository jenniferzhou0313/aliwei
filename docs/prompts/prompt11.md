# Prompt 11：黑话翻译器 P1 完善

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
