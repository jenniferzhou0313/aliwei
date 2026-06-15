# Aliwei Git 分支与 PR 工作流说明

> 适用对象：阿里味 Agent 项目全体成员  
> 适用仓库：https://github.com/jenniferzhou0313/aliwei.git  
> 目的：让每个人知道什么时候拉取最新代码、什么时候新建分支、什么时候提交 PR、如何让后续任何 AI 可以从已经完成的 Prompt 继续做。  
> 当前背景：仓库已经有第一版本，但结果不够规范、框架不够清晰。后续所有开发都必须基于当前第一版本逐步规范化，不能推倒重来。

---

## 1. 为什么要规范 Git 流程

Aliwei 是多人协作的 Agent 项目，里面同时包含：

```text
1. Web 前端：apps/web
2. API 后端：apps/api
3. 领域层 / Prompt / 工具定义：packages/domain
4. 数据库层：packages/db
5. UI 组件层：packages/ui
6. 钉钉端占位：apps/dingtalk
7. 文档与 Prompt Pack：docs/
```

如果大家都直接在 `main` 上改，或者长期使用一个旧分支，会出现几个问题：

```text
1. PR 变得很大，review 时看不清楚到底改了什么
2. Prompt 之间的产物混在一起，后续 AI 不知道从哪里继续
3. Web / API / Prompt / DB 互相改动，容易覆盖别人代码
4. 当前第一版本本来就不规范，如果不分阶段整理，会越来越乱
5. 出问题后无法定位是哪一个 Prompt 引入的问题
```

所以本项目统一采用：

```text
一个阶段 / 一个功能 / 一个 Prompt 对应一个独立分支和一个 PR。
```

每完成一个 Prompt，都必须留下一个状态快照：

```text
docs/status/promptXX_snapshot.md
```

这样任何成员或任何 AI 都可以读取最新快照，从已经完成的 Prompt 后面继续做。

---

## 2. 当前仓库基线

当前仓库：

```text
https://github.com/jenniferzhou0313/aliwei.git
```

当前技术基线：

```text
根目录：pnpm workspace
前端：apps/web，Next.js，端口 3000
后端：apps/api，Hono，端口 3001
共享领域层：packages/domain，包含工具定义、黑话词典、Prompt
数据库层：packages/db，SQLite + Drizzle
UI 层：packages/ui，assistant-ui + shadcn primitives
钉钉端：apps/dingtalk，目前是占位
```

当前已经有的核心工具：

```text
1. 黑话翻译器 jargon
2. 周报助手 weekly
3. OKR 助手 okr
4. 复盘助手 review
```

当前问题：

```text
1. 第一版本已经能体现基本方向，但工程边界不够清晰
2. Prompt、工具、API、前端 UI 的职责需要重新规范
3. 文档缺失或不够标准，后续 AI 不容易接着做
4. 钉钉端只是占位，还没有真实接入
5. P1 功能如 360、会议助手尚未系统实现
```

重要原则：

```text
后续开发不是重新生成一个全新项目。
后续开发必须在当前仓库基础上整理、规范、增强。
除非 Prompt 明确要求，否则不要删除现有 apps/ 和 packages/ 结构。
```

---

## 3. 推荐分支模型

### 3.1 技术负责人先创建 dev 分支

如果当前仓库只有 `main`，建议技术负责人先创建 `dev`：

```powershell
cd D:\Kane_Files\01_Projects
git clone https://github.com/jenniferzhou0313/aliwei.git
cd aliwei
git checkout main
git pull origin main
git checkout -b dev
git push -u origin dev
```

之后团队开发统一使用：

```text
feature/* -> PR -> dev -> 测试稳定 -> PR -> main
```

如果暂时不创建 `dev`，也可以先用：

```text
feature/* -> PR -> main
```

但更推荐创建 `dev`，因为当前第一版本还需要规范化，不适合所有改动直接进入 `main`。

---

## 4. 每个 Prompt 的标准开发流程

### 4.1 开始一个新 Prompt 前

以 `dev` 为基准：

```powershell
git checkout dev
git pull origin dev
git checkout -b feature/promptXX-short-name
```

例如：

```powershell
git checkout dev
git pull origin dev
git checkout -b feature/prompt03-domain-standardization
```

如果团队暂时只用 `main`：

```powershell
git checkout main
git pull origin main
git checkout -b feature/promptXX-short-name
```

### 4.2 执行 Prompt 前必须先检查

```powershell
git status
git branch
pnpm install
pnpm typecheck
pnpm lint
```

如果项目还没有安装依赖：

```powershell
pnpm install
```

如果没有 `pnpm`：

```powershell
npm install -g pnpm
pnpm install
```

### 4.3 运行项目

复制环境文件：

```powershell
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

然后编辑 `apps/api/.env`，填入：

```text
ALIBABA_API_KEY=你的 key
WEB_ORIGIN=http://localhost:3000
PORT=3001
```

启动：

```powershell
pnpm dev
```

检查：

```text
Web: http://localhost:3000
API: http://localhost:3001/health
```

也可以分开启动：

```powershell
pnpm dev:api
pnpm dev:web
```

---

## 5. 每个 Prompt 完成后的固定动作

每个 Prompt 完成后，必须做 5 件事。

### 5.1 运行检查命令

```powershell
pnpm typecheck
pnpm lint
pnpm build
```

如果 Prompt 涉及 API：

```powershell
curl http://localhost:3001/health
```

如果 Prompt 涉及 Web：

```text
打开 http://localhost:3000，人工检查页面是否能加载。
```

### 5.2 查看改动

```powershell
git status
git diff --stat
```

### 5.3 生成状态快照

每个 Prompt 都必须新增或更新：

```text
docs/status/promptXX_snapshot.md
```

内容模板见本文第 12 节。

### 5.4 提交代码

```powershell
git add .
git commit -m "feat(scope): short description"
git push origin feature/promptXX-short-name
```

示例：

```powershell
git commit -m "docs: add aliwei architecture and prompt standards"
git commit -m "refactor(domain): standardize tool prompt contract"
git commit -m "feat(api): add unified chat contract and error handling"
git commit -m "feat(web): improve assistant tool switching flow"
```

### 5.5 创建 PR

GitHub 上创建 PR：

```text
base: dev
compare: feature/promptXX-short-name
```

如果没有 `dev`：

```text
base: main
compare: feature/promptXX-short-name
```

---

## 6. PR 合并后的动作

PR 合并后，不要继续在旧 feature 分支上做下一个 Prompt。

应该回到最新 `dev`，重新开分支：

```powershell
git checkout dev
git pull origin dev
git checkout -b feature/promptXX-next-task
```

如果没有 `dev`：

```powershell
git checkout main
git pull origin main
git checkout -b feature/promptXX-next-task
```

可以删除本地旧分支：

```powershell
git branch -d feature/promptXX-short-name
```

如果 Git 提示分支没有完全合并，先不要强删，找技术负责人确认。

---

## 7. 对 Git 不熟悉成员的简化流程

不熟悉 Git 的成员可以固定使用自己的分支，例如：

```text
feature/web-owner
feature/api-owner
feature/prompt-owner
feature/dingtalk-owner
```

但每次开发前必须同步 `dev`：

```powershell
git checkout feature/your-branch-name
git fetch origin
git pull --rebase origin dev
```

如果团队没有 `dev`：

```powershell
git pull --rebase origin main
```

完成后提交：

```powershell
git status
git add .
git commit -m "feat(scope): description"
git push origin feature/your-branch-name
```

注意：固定分支可以降低操作难度，但 PR 会变大。所以每完成一个小功能就提交 PR，不要等全部做完。

---

## 8. 推荐分支命名

```text
feature/prompt00-audit-current-version
feature/prompt01-project-docs
feature/prompt02-workspace-normalization
feature/prompt03-domain-standardization
feature/prompt04-api-contract
feature/prompt05-chat-service-stability
feature/prompt06-db-thread-message
feature/prompt07-web-chat-ui
feature/prompt08-weekly-assistant
feature/prompt09-okr-assistant
feature/prompt10-review-assistant
feature/prompt11-jargon-translator
feature/prompt12-360-assistant
feature/prompt13-meeting-assistant
feature/prompt14-dingtalk-adapter
feature/prompt15-quality-eval-tests
feature/prompt16-final-docs-deploy
```

---

## 9. Commit Message 规范

格式：

```text
type(scope): description
```

常见 type：

```text
feat：新增功能
fix：修复问题
docs：文档修改
refactor：重构，不改变功能
test：测试相关
chore：工程配置、依赖、脚本
style：格式调整，不改变逻辑
```

scope 建议：

```text
web
api
domain
db
ui
dingtalk
docs
prompt
workspace
```

示例：

```powershell
git commit -m "docs: add prompt continuation workflow"
git commit -m "refactor(domain): standardize tool metadata"
git commit -m "feat(api): add chat request validation"
git commit -m "feat(web): add 360 tool entry"
git commit -m "test(prompt): add weekly assistant golden cases"
```

---

## 10. 共享文件规则

### 10.1 强共享文件：不能随便改

以下文件会影响全项目，必须由技术负责人 review：

```text
README.md
CLAUDE.md
package.json
pnpm-workspace.yaml
tsconfig.base.json
pnpm-lock.yaml
package-lock.json
.gitignore

apps/api/src/index.ts
apps/api/src/services/llm-client.ts
apps/api/src/services/chat-service.ts
apps/api/.env.example

packages/domain/src/types.ts
packages/domain/src/tools.ts
packages/domain/src/prompts/base.ts
packages/domain/src/index.ts
packages/db/src/schema.ts
packages/db/src/client.ts
packages/ui/src/index.ts

docs/architecture.md
docs/api.md
docs/prompt-spec.md
docs/test-checklist.md
docs/status/
```

### 10.2 模块文件：各自负责

```text
Web Owner：apps/web/**，packages/ui/**
API Owner：apps/api/**，packages/db/**
Prompt / Domain Owner：packages/domain/**，docs/prompt-spec.md
DingTalk Owner：apps/dingtalk/**，docs/dingtalk.md
Docs / QA Owner：docs/**，测试用例，README 更新
```

如果需要改别人模块，必须在 PR 描述里写清楚原因。

---

## 11. 每个 PR 必须包含的内容

PR 描述模板：

```md
## 本次实现

- 

## 对应 Prompt

- Prompt XX：

## 修改文件

- 

## 如何运行

```bash
pnpm install
pnpm typecheck
pnpm lint
pnpm dev
```

## 如何测试

```bash
curl http://localhost:3001/health
```

人工测试：

- [ ] http://localhost:3000 能打开
- [ ] 工具按钮正常显示
- [ ] 对话能发送
- [ ] 流式回复正常
- [ ] 历史线程正常

## 文档更新

- [ ] README.md
- [ ] docs/architecture.md
- [ ] docs/api.md
- [ ] docs/prompt-spec.md
- [ ] docs/test-checklist.md
- [ ] docs/status/promptXX_snapshot.md

## 风险和 TODO

- 

## 人工检查点

- [ ] 没有提交 .env / key / token
- [ ] 没有提交 node_modules / .next / local.db
- [ ] 没有重写无关模块
- [ ] Prompt 可以被其他 AI 继续执行
- [ ] 本 Prompt 的状态快照已写清楚
```

---

## 12. 每个 Prompt 的状态快照模板

每完成一个 Prompt，都要创建：

```text
docs/status/promptXX_snapshot.md
```

模板如下：

```md
# Aliwei Prompt XX Status Snapshot

## 1. 基本信息

- Prompt 编号：Prompt XX
- Prompt 名称：
- 完成人：
- 分支：
- PR 链接：
- 完成日期：
- 基于 commit：
- 当前 commit：

## 2. 本次完成内容

- 

## 3. 修改文件

```text

```

## 4. 新增或变更的接口 / 工具 / Prompt

```text

```

## 5. 如何运行

```bash
pnpm install
pnpm typecheck
pnpm lint
pnpm dev
```

## 6. 测试结果

- [ ] pnpm typecheck 通过
- [ ] pnpm lint 通过
- [ ] pnpm build 通过
- [ ] http://localhost:3001/health 正常
- [ ] http://localhost:3000 正常

## 7. 已知问题

- 

## 8. 下一个 Prompt 开始前必须知道的事情

- 

## 9. 给下一个 AI 的继续指令

请先阅读：

```text
README.md
CLAUDE.md
docs/architecture.md
docs/api.md
docs/prompt-spec.md
docs/test-checklist.md
docs/status/promptXX_snapshot.md
```

然后从 Prompt XX+1 开始，不要重做 Prompt XX 已完成内容。
```

---

## 13. 每次开发前的安全检查

```powershell
git status
git branch
git log --oneline --decorate --graph --all -10
```

如果有未提交改动：

```text
1. 先确认这些改动是不是自己做的
2. 需要保留就 commit
3. 不需要就谨慎 discard
4. 不确定就截图或复制 git status 发给技术负责人
```

不要在有未提交改动时直接切分支。

---

## 14. 每次提交前的检查

```powershell
pnpm typecheck
pnpm lint
pnpm build
```

如果涉及 API：

```powershell
pnpm dev:api
curl http://localhost:3001/health
```

如果涉及 Web：

```powershell
pnpm dev:web
```

人工检查：

```text
1. 首页能打开
2. 工具切换正常
3. 对话框能输入
4. API 报错时页面不崩溃
5. 历史线程不丢失
```

---

## 15. 最重要的规则

```text
1. 不要直接 push 到 main
2. 推荐先建 dev，feature 分支 PR 到 dev
3. 一个 Prompt 一个分支，一个 Prompt 一个 PR
4. 每个 Prompt 完成后必须写 docs/status/promptXX_snapshot.md
5. 不要提交 .env、API key、token、密码
6. 不要提交 node_modules、.next、local.db
7. 不要让 AI 一次性重写整个项目
8. 不要删除当前第一版本结构，除非 Prompt 明确要求并说明迁移路径
9. 修改共享文件必须写清楚原因
10. 遇到 conflict 不要乱删，先找技术负责人确认
```
