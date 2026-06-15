# Aliwei — 团队上手手册

> 给**没用过 coding agent** 的团队成员看的手操指南。
> 如果你会用 Claude Code / Cursor / Codex / opencode，可以跳到第 4 节。

---

## 1. 你要装的东西

| 工具 | 用来干嘛 | 没装怎么办 |
|---|---|---|
| Git | 拉代码、提交 | [git-scm.com](https://git-scm.com) 下载 |
| Node.js 20+ | 跑项目 | [nodejs.org](https://nodejs.org) 下载 LTS 版 |
| pnpm | 装依赖 | 装完 Node 后跑 `npm install -g pnpm` |
| opencode | 跟 AI 对话（团队主力） | 见下面第 2 节 |

装完验证一下，终端里跑：

```bash
git --version
node --version
pnpm --version
```

三个都能输出版本号就算 OK。

---

## 2. opencode 怎么打开

**安装**：问技术负责人要安装命令（不同系统不一样），或者去 [opencode 官网](https://opencode.ai) 看文档。

**进入项目目录**：

```bash
cd /你本地/aliwei/代码/路径
```

**启动 opencode**：

```bash
opencode
```

你会看到一个对话框出现在终端里，光标闪着等你输入。

**其它工具怎么开**（如果你不用 opencode）：
- **Cursor**：打开软件 → 按 `Cmd+L`（Mac）或 `Ctrl+L`（Windows）→ 出对话框
- **Claude Code**：`claude` 命令启动
- **VS Code Copilot**：装 Copilot 插件 → `Cmd+Shift+I` / `Ctrl+Shift+I` 开 Chat

---

## 3. 第一次拉代码

```bash
git clone https://github.com/jenniferzhou0313/aliwei.git
cd aliwei
pnpm install
```

装完后跑一下：

```bash
pnpm dev
```

浏览器打开 `http://localhost:3000`，看到聊天界面就算 OK。停服务按 `Ctrl+C`。

---

## 4. 执行一个 Prompt 的完整步骤

每个 prompt 是一份具体任务说明，存放在 `docs/prompts/promptXX.md`。

完整任务清单：

| Prompt | 内容 |
|---|---|
| prompt00 | 审计当前第一版本，生成现状快照 |
| prompt01 | 补齐项目标准文档和 AI 协作规则 |
| prompt02 | 规范 pnpm workspace、依赖、脚本和环境文件 |
| prompt03 | 规范 packages/domain 的工具和 Prompt 架构 |
| prompt04 | 规范 API Contract 和错误响应 |
| prompt05 | 稳定 chat service、LLM client、streaming |
| prompt06 | 规范 DB schema、thread/message 存储 |
| prompt07 | 规范 Web 对话 UI、工具切换和历史线程 |
| prompt08 | 完善周报助手 |
| prompt09 | 完善 OKR 助手 |
| prompt10 | 完善复盘助手 |
| prompt11 | 完善黑话翻译器 |
| prompt12 | 新增 360 评估辅助 |
| prompt13 | 新增会议效率助手 |
| prompt14 | 钉钉端基础接入 |
| prompt15 | 测试、Prompt 评估和质量检查 |
| prompt16 | 最终文档、部署说明和交付检查 |

**完成一个 prompt 的 5 步**：

### Step 1：拉一个新分支

把下面命令里的 `XX` 换成你要做的 prompt 编号（比如 `08`），把 `short-name` 换成简短英文描述（比如 `weekly-assistant`）：

```bash
git checkout dev
git pull origin dev
git checkout -b feature/promptXX-short-name
```

例如做 prompt08（周报助手）：

```bash
git checkout -b feature/prompt08-weekly-assistant
```

### Step 2：打开 coding agent

确认你在项目根目录：

```bash
pwd
```

应该看到路径最后是 `aliwei`。

打开 opencode：

```bash
opencode
```

### Step 3：复制粘贴提示词

打开 `docs/prompts/promptXX.md`（比如 `docs/prompts/prompt08.md`），**从「给 AI 的 Prompt」那一节开始，整段复制**，粘到 opencode 对话框，按回车发送。

让 AI 自己干，等它跑完。

### Step 4：等 AI 干完后跑检查

AI 完成后，自己跑这三行（任何报错都把报错贴回给 AI）：

```bash
pnpm typecheck
pnpm lint
pnpm build
```

如果 prompt 涉及 API：

```bash
pnpm dev:api
```

另开一个终端跑：

```bash
curl http://localhost:3001/health
```

如果 prompt 涉及 Web：

```bash
pnpm dev:web
```

浏览器开 `http://localhost:3000`，手动点几下。

### Step 5：提交 + 开 PR

确认所有改动都 OK 后：

```bash
git add .
git commit -m "feat(scope): 简述这次改了什么"
git push origin feature/promptXX-short-name
```

然后去 GitHub 上开 PR，base 选 `dev`。

---

## 5. 卡住了怎么办

**「pnpm: command not found」**
→ Node 装好后跑 `npm install -g pnpm`，再试。

**AI 一直改不该改的文件**
→ 打开 `docs/PROMPT.md`，把第 2 节「不变的原则」整段贴回给 AI，附一句：「按这个规则重做」。

**AI 提议把整个项目重写**
→ **不要同意**。回它：「不要重写，只改当前 prompt 范围内的事」。

**AI 跑完但 typecheck / lint 报错**
→ 把报错整段复制贴给 AI，让它修。反复几次直到全过。

**改完 push 不上去 / PR 开不了**
→ 截图发给技术负责人，不要乱删乱 reset。

---

## 6. 完成后必做清单

- `pnpm typecheck` / `pnpm lint` / `pnpm build` 全过
- 涉及 API 的，`curl http://localhost:3001/health` 返回 OK
- 涉及 Web 的，浏览器里手动跑一遍
- `git status` 看一眼没误提交 `.env` / `local.db` / `node_modules`