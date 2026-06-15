# Prompt 0：当前第一版本审计和基线快照

## 4. Prompt 0：当前第一版本审计和基线快照

### 4.1 目标

```text
读取当前仓库，不改业务功能，只做审计。
输出当前架构、文件树、启动方式、已实现功能、主要问题和后续 Prompt 起点。
```

### 4.2 允许修改文件

```text
docs/status/prompt00_snapshot.md
docs/audit/current-version-audit.md
```

如果 `docs/` 不存在，可以创建。

### 4.3 不允许修改

```text
apps/**
packages/**
package.json
pnpm-lock.yaml
README.md
```

### 4.4 给 AI 的 Prompt

```text
你现在接手一个已经有第一版本的 Aliwei Agent 项目。
仓库地址是：https://github.com/jenniferzhou0313/aliwei.git

重要背景：
这个项目不是从零开始。当前第一版本已经存在，但结果不够规范、框架不够清晰。
你的任务不是重写项目，而是审计当前项目，为后续 Prompt 继续开发建立清晰基线。

请执行以下任务：

1. 阅读当前仓库的 README.md、package.json、pnpm-workspace.yaml、apps/*、packages/*。
2. 输出当前文件树，重点说明：
   - apps/web 做什么
   - apps/api 做什么
   - apps/dingtalk 当前状态
   - packages/domain 当前包含什么
   - packages/db 当前包含什么
   - packages/ui 当前包含什么
3. 检查当前启动命令：
   - pnpm install
   - pnpm dev
   - pnpm dev:api
   - pnpm dev:web
   - pnpm typecheck
   - pnpm lint
4. 不要修改任何业务代码。
5. 只新增：
   - docs/audit/current-version-audit.md
   - docs/status/prompt00_snapshot.md
6. 在审计文档中写清楚：
   - 当前已经实现的功能
   - 当前最不规范的地方
   - 哪些文件属于共享核心文件
   - 后续 Prompt 1 应该从哪里开始
7. 如果发现项目无法启动，记录原因，不要自行重构。

验收标准：
- 没有修改 apps/** 和 packages/**
- docs/audit/current-version-audit.md 存在
- docs/status/prompt00_snapshot.md 存在
- 后续任何 AI 读取这两个文档后，能知道当前项目做到哪里
```

### 4.5 测试方式

```powershell
pnpm install
pnpm typecheck
pnpm lint
```

### 4.6 推荐 commit

```powershell
git commit -m "docs: audit current aliwei baseline"
```

---
