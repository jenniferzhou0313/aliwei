# Prompt 13：新增会议效率助手

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
