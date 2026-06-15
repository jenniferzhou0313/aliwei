# Prompt 14：钉钉端基础接入和方案落地

## 18. Prompt 14：钉钉端基础接入和方案落地

### 18.1 目标

```text
在当前 apps/dingtalk 占位基础上，形成最小可运行或最小可交付的钉钉端接入方案。
```

### 18.2 允许修改文件

```text
apps/dingtalk/**
docs/dingtalk.md
docs/api.md
docs/status/prompt14_snapshot.md
```

### 18.3 不允许修改

```text
apps/api chat 主逻辑，除非只是增加清晰的 endpoint 文档
apps/web/**
packages/domain Prompt 文案
packages/db schema
```

### 18.4 给 AI 的 Prompt

```text
你正在执行 Aliwei Agent 的 Prompt 14：钉钉端基础接入和方案落地。

请先阅读：
- docs/architecture.md
- docs/api.md
- docs/status/prompt13_snapshot.md
- apps/dingtalk/README.md 如存在

任务目标：
当前 PRD 推荐 MVP 阶段优先钉钉机器人，但当前仓库的 apps/dingtalk 只是占位。
本 Prompt 不要求一次性做完整钉钉生产接入，而是要把钉钉端的最小方案和代码占位整理清楚。

请执行：

1. 整理 apps/dingtalk：
   - README.md 写清楚当前状态
   - 写清楚如何复用 apps/api 的 /chat
   - 写清楚后续需要的钉钉机器人配置项
2. 新增 docs/dingtalk.md：
   - MVP 接入方案
   - message receive -> call apps/api /chat -> return response 的流程
   - 当前暂不实现复杂互动卡片
   - 安全注意事项：签名、token、企业内部使用
3. 如果已有 dingtalk src，则只做最小占位和类型整理。
4. 不要破坏 Web 端。
5. 新增 docs/status/prompt14_snapshot.md。

限制：
- 不要伪造真实钉钉凭证
- 不要提交 secret
- 不要做复杂卡片工作流
- 不要改 Prompt 内容

验收标准：
- apps/dingtalk/README.md 清楚
- docs/dingtalk.md 存在
- 后续成员能知道钉钉端怎么接 apps/api
- pnpm typecheck / lint 通过，或者如果 dingtalk 暂未纳入构建，文档要说明
```

### 18.5 推荐 commit

```powershell
git commit -m "docs(dingtalk): add mvp integration plan"
```

---
