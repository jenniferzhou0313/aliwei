# Prompt 4：API Contract 与统一响应规范

## 8. Prompt 4：API Contract 与统一响应规范

### 8.1 目标

```text
规范 apps/api 的 HTTP 合同和错误结构，让前端和后续钉钉端都能复用。
```

### 8.2 允许修改文件

```text
apps/api/src/index.ts
apps/api/src/routes/chat.ts
apps/api/src/routes/threads.ts
apps/api/src/routes/parse-pdf.ts
apps/api/src/services/thread-service.ts
apps/api/src/services/chat-service.ts
apps/api/src/middleware/guest-id.ts
apps/api/src/types/ 或 apps/api/src/lib/ 新增轻量类型/response helper
docs/api.md
docs/status/prompt04_snapshot.md
```

### 8.3 暂时不做

```text
不要改 LLM Prompt 内容
不要改 Web UI
不要新增 360 / 会议功能
不要重构 DB schema
```

### 8.4 给 AI 的 Prompt

```text
你正在执行 Aliwei Agent 的 Prompt 4：API Contract 与统一响应规范。

请先阅读：
- docs/api.md
- docs/architecture.md
- docs/status/prompt03_snapshot.md

任务目标：
规范当前 Hono API 的接口合同和错误返回。

请执行：

1. 检查当前 API：
   - GET /health
   - POST /chat
   - GET /threads
   - GET /threads/:id/messages
   - DELETE /threads/:id
   - POST /parse-pdf
2. 对非 streaming 接口统一返回：
   - success
   - message
   - data
   - errorCode
3. POST /chat 是 streaming 接口，可以保留 Response streaming，但必须：
   - 校验 request body
   - toolId 不存在时返回清晰错误
   - messages 缺失时返回清晰错误
   - LLM key 缺失时返回清晰错误
4. 增加轻量 response helper，但不要引入复杂框架。
5. docs/api.md 必须写清楚每个接口：
   - method
   - path
   - request
   - response
   - errorCode
6. 新增 docs/status/prompt04_snapshot.md。

限制：
- 不要改 Web UI
- 不要改 packages/domain 的 Prompt 内容
- 不要改 DB schema
- 不要把业务逻辑写进 route，route 只做参数解析和 service 调用

验收标准：
- pnpm typecheck 通过
- pnpm lint 通过
- GET /health 正常
- GET /threads 正常返回统一结构
- DELETE /threads/:id 正常返回 204 或文档中约定的结构
- docs/api.md 与代码一致
```

### 8.5 测试方式

```powershell
pnpm typecheck
pnpm lint
pnpm dev:api
curl http://localhost:3001/health
```

### 8.6 推荐 commit

```powershell
git commit -m "feat(api): standardize api contract and error responses"
```

---
