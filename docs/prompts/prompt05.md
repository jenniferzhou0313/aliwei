# Prompt 5：Chat Service、LLM Client 和 Streaming 稳定性

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
