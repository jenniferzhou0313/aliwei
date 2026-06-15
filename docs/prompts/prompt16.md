# Prompt 16：最终文档、部署说明和交付检查

## 20. Prompt 16：最终文档、部署说明和交付检查

### 20.1 目标

```text
整理最终交付文档，让项目可以被新人、老师、老板或后续 AI 直接接手。
```

### 20.2 允许修改文件

```text
README.md
CLAUDE.md
docs/architecture.md
docs/api.md
docs/database.md
docs/prompt-spec.md
docs/test-checklist.md
docs/dingtalk.md
docs/deployment.md
docs/status/final_snapshot.md
docs/status/prompt16_snapshot.md
```

### 20.3 给 AI 的 Prompt

```text
你正在执行 Aliwei Agent 的 Prompt 16：最终文档、部署说明和交付检查。

请先阅读：
- README.md
- CLAUDE.md
- docs/status/prompt15_snapshot.md
- docs/architecture.md
- docs/api.md
- docs/prompt-spec.md
- docs/test-checklist.md

任务目标：
整理项目最终可交付文档，不做大功能开发。

请执行：

1. 更新 README.md：
   - 项目简介
   - 当前已实现功能
   - 技术栈
   - 文件树
   - 本地启动
   - 常用命令
   - 环境变量
   - 团队开发流程
2. 更新 CLAUDE.md：
   - 保证规则和当前最终架构一致
3. 新增 docs/deployment.md：
   - 本地部署
   - Web / API 分离部署思路
   - 环境变量
   - 钉钉端后续部署注意事项
4. 更新 docs/status/final_snapshot.md：
   - 当前功能清单
   - 当前接口清单
   - 当前工具清单
   - 已知问题
   - 后续 P1 / P2 建议
5. 新增 docs/status/prompt16_snapshot.md。

限制：
- 不要大改业务代码
- 不要新增功能
- 不要删除历史 status snapshot

验收标准：
- 新人只看 README.md 可以启动项目
- AI 只看 CLAUDE.md + docs/status/final_snapshot.md 可以继续开发
- docs/deployment.md 说明清楚
- pnpm typecheck / lint / build 通过
```

### 20.4 测试方式

```powershell
pnpm install
pnpm typecheck
pnpm lint
pnpm build
pnpm dev
```

### 20.5 推荐 commit

```powershell
git commit -m "docs: finalize aliwei handoff and deployment guide"
```
