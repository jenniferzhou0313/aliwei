# Aliwei AI Continuation Status Template

> 用途：每完成一个 Prompt，把本模板复制为 `docs/status/promptXX_snapshot.md`。  
> 目标：让任何 AI 不需要知道之前聊天记录，也能从当前 Prompt 之后继续做。

---

# Aliwei Prompt XX Status Snapshot

## 1. 基本信息

```text
Prompt 编号：Prompt XX
Prompt 名称：
执行人：
执行 AI：Claude / Codex / Cursor / ChatGPT / 手写
仓库：https://github.com/jenniferzhou0313/aliwei.git
基准分支：dev / main
功能分支：feature/promptXX-xxx
PR 链接：
开始日期：
完成日期：
基于 commit：
当前 commit：
```

---

## 2. 本次完成内容

```text
1. 
2. 
3. 
```

---

## 3. 本次没有做的内容

```text
1. 
2. 
3. 
```

---

## 4. 修改文件清单

```text

```

---

## 5. 新增 / 变更接口

```http

```

如果本 Prompt 没有接口变更，写：

```text
本 Prompt 没有接口变更。
```

---

## 6. 新增 / 变更工具和 Prompt

```text
工具 ID：
工具名称：
修改 Prompt 文件：
输出格式变化：
```

如果本 Prompt 没有工具 / Prompt 变更，写：

```text
本 Prompt 没有工具或 Prompt 变更。
```

---

## 7. 如何运行

```powershell
pnpm install
pnpm typecheck
pnpm lint
pnpm dev
```

Web：

```text
http://localhost:3000
```

API：

```text
http://localhost:3001/health
```

---

## 8. 测试结果

```text
pnpm typecheck：通过 / 未通过，原因：
pnpm lint：通过 / 未通过，原因：
pnpm build：通过 / 未通过，原因：
pnpm dev：通过 / 未通过，原因：
Web 人工测试：通过 / 未通过，原因：
API 人工测试：通过 / 未通过，原因：
Prompt 人工测试：通过 / 未通过，原因：
```

---

## 9. 人工测试用例

```text
输入：

预期：

实际：

结论：
```

---

## 10. 已知问题

```text
1. 
2. 
3. 
```

如果没有，写：

```text
暂无已知问题。
```

---

## 11. 对其他成员的影响

```text
Web Owner：
API Owner：
Prompt / Domain Owner：
DB Owner：
DingTalk Owner：
Docs / QA Owner：
```

---

## 12. 下一个 Prompt 开始前必须知道的事情

```text
1. 
2. 
3. 
```

---

## 13. 给下一个 AI 的继续指令

```text
你正在接手 Aliwei Agent 项目。

请先阅读以下文件：
- README.md
- CLAUDE.md
- docs/architecture.md
- docs/api.md
- docs/prompt-spec.md
- docs/test-checklist.md
- docs/status/promptXX_snapshot.md

当前 Prompt XX 已完成，不要重复实现。
请从 Prompt XX+1 开始。

你必须遵守：
1. 不要推倒重来
2. 不要重写无关模块
3. 不要提交 .env / key / token
4. 每完成一个 Prompt，继续写 docs/status/promptXX+1_snapshot.md
5. 运行 pnpm typecheck / lint / build，并记录结果
```
