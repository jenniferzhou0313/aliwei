# Prompt 6：DB Schema、Thread / Message 存储规范化

## 10. Prompt 6：DB Schema、Thread / Message 存储规范化

### 10.1 目标

```text
规范 packages/db，确保 thread 和 message 的结构能支持多工具、多轮对话、历史记录和后续反馈评估。
```

### 10.2 允许修改文件

```text
packages/db/src/schema.ts
packages/db/src/queries.ts
packages/db/src/client.ts
packages/db/src/index.ts
apps/api/src/services/thread-service.ts
apps/api/src/services/chat-service.ts
docs/database.md
docs/api.md
docs/status/prompt06_snapshot.md
```

### 10.3 暂时不做

```text
不要引入用户登录系统
不要迁移到远程数据库
不要做 RAG 向量库
```

### 10.4 给 AI 的 Prompt

```text
你正在执行 Aliwei Agent 的 Prompt 6：DB Schema、Thread / Message 存储规范化。

请先阅读：
- docs/architecture.md
- docs/api.md
- docs/status/prompt05_snapshot.md

任务目标：
在现有 SQLite + Drizzle 基础上规范 thread/message 数据结构。

请执行：

1. 检查当前 schema 是否支持：
   - thread id
   - userId / guestId
   - toolId
   - title
   - createdAt
   - updatedAt
   - message id
   - role: user / assistant / system
   - content
   - createdAt
2. 如果缺字段，做最小改动补齐。
3. queries.ts 只负责 DB CRUD，不写业务逻辑。
4. thread-service.ts 负责：
   - list threads
   - load messages
   - remove thread
   - create / update thread title
   - append messages
5. chat-service.ts 只调用 thread-service，不直接散落 SQL。
6. 新增 docs/database.md，记录表结构和字段含义。
7. 更新 docs/api.md 中 thread 相关返回。
8. 新增 docs/status/prompt06_snapshot.md。

限制：
- 不要做用户注册登录
- 不要做远程数据库
- 不要清空历史数据，除非当前 schema 无法兼容并在快照说明
- 不要改 Web UI

验收标准：
- pnpm typecheck 通过
- GET /threads 能返回当前用户 threads
- GET /threads/:id/messages 能返回 messages
- DELETE /threads/:id 能删除 thread
- docs/database.md 存在
```

### 10.5 测试方式

```powershell
pnpm typecheck
pnpm lint
pnpm dev:api
curl http://localhost:3001/health
```

### 10.6 推荐 commit

```powershell
git commit -m "refactor(db): standardize thread and message storage"
```

---
