# Prompt 2：Workspace、依赖、脚本和环境文件规范化

## 6. Prompt 2：Workspace、依赖、脚本和环境文件规范化

### 6.1 目标

```text
整理当前工程配置，让 pnpm workspace、scripts、env example、ignore 规则稳定，不改业务功能。
```

### 6.2 允许修改文件

```text
package.json
pnpm-workspace.yaml
tsconfig.base.json
.gitignore
apps/api/package.json
apps/api/.env.example
apps/web/package.json
apps/web/.env.example
apps/dingtalk/package.json
packages/domain/package.json
packages/db/package.json
packages/ui/package.json
docs/status/prompt02_snapshot.md
```

### 6.3 不允许修改

```text
apps/**/src/**
packages/**/src/**
```

除非只是修复 import path 配置导致的类型错误，并且必须在快照中说明。

### 6.4 给 AI 的 Prompt

```text
你正在执行 Aliwei Agent 的 Prompt 2：Workspace、依赖、脚本和环境文件规范化。

请先阅读：
- README.md
- CLAUDE.md
- docs/architecture.md
- docs/status/prompt01_snapshot.md

当前项目是 pnpm workspace。你的任务是规范工程配置，不要实现业务功能。

请执行：

1. 检查根 package.json：
   - scripts 是否包含 dev、dev:web、dev:api、build、start、lint、format:fix、typecheck
   - engines 是否明确 Node >= 20
   - packageManager 是否使用 pnpm
2. 检查 pnpm-workspace.yaml：
   - apps/*
   - packages/*
3. 检查 .gitignore：
   - node_modules
   - .next
   - dist
   - .env
   - .env.*
   - !.env.example
   - local.db
   - *.sqlite
4. 检查 apps/api/.env.example：
   - ALIBABA_API_KEY=
   - WEB_ORIGIN=http://localhost:3000
   - PORT=3001
5. 检查 apps/web/.env.example：
   - NEXT_PUBLIC_API_URL=http://localhost:3001
6. 检查每个 package 的 scripts：
   - typecheck
   - lint
   - dev / build / start 按需要保留
7. 如果发现 package-lock.json 和 pnpm-lock.yaml 同时存在：
   - 不要擅自删除
   - 在 docs/status/prompt02_snapshot.md 中说明建议：项目统一 pnpm 后可在负责人确认后删除 package-lock.json
8. 新增 docs/status/prompt02_snapshot.md。

限制：
- 不要改业务逻辑
- 不要重写 src 文件
- 不要引入大型新依赖
- 不要删除 lockfile，除非技术负责人明确要求

验收标准：
- pnpm install 可以执行
- pnpm typecheck 可以执行
- pnpm lint 可以执行
- 环境变量示例清楚
- docs/status/prompt02_snapshot.md 写清楚配置现状和遗留问题
```

### 6.5 测试方式

```powershell
pnpm install
pnpm typecheck
pnpm lint
```

### 6.6 推荐 commit

```powershell
git commit -m "chore(workspace): normalize scripts and environment examples"
```

---
