# StreamChat 内部重构设计

**日期:** 2026-06-22
**状态:** 待用户审阅
**范围:** 在不改变任何现有功能的前提下,通过三个独立可回滚的阶段收窄 `streamChat` / `stream-adapter` 的内部复杂度,降低未来 bug 出现频率。

## 1. 目标

按依赖顺序分三个阶段执行:

1. **ModelAdapter 抽象**(阶段 1):把 Qwen 适配从 stream-adapter 抽离到独立模块 + ModelAdapter 接口
2. **stream-adapter 状态机化**(阶段 2):把 5 个 let 变量提为显式有限状态机 + 不变量单测
3. **resume 显式化**(阶段 3):用 `graph.getState()` 替代 `detectAskUserResume` / `detectSuggestAgentResume` / `getLastAssistantText` 三个反推函数

三阶段之间正交、按依赖顺序推进、每个阶段独立 PR、独立可回滚。

## 2. 不在范围

- 任何产品行为变化
- 前端协议变化(API 路径、请求体、响应体不变)
- langgraph 框架替换或大版本升级
- 多供应商 model 接入(阶段 1 留接口位,实装仍仅 Qwen)
- 修阶段 2 揭露出来的 `on_chat_model_end` 兜底 skipPrefix 雷(留到阶段 3 之后的独立 PR)
- SqliteSaver 换 PostgresSaver
- AssistantCloud 重新接入

## 3. 设计原则

- **不改变任何现有功能**:所有现有测试 case 不删不改,新增测试覆盖新边界
- **依赖顺序**:阶段 1 → 阶段 2 → 阶段 3。阶段 1 和 2 都完成后,stream-adapter 完全不知道模型是 Qwen 还是 OpenAI;阶段 3 改的是 chat-service 入口的协议层,跟翻译层正交
- **行为不变即产品不变**:通过"等价性测试"(阶段 2 实施期)作为重构安全网,任何 byte-level 差异都视为重构 bug
- **发现性 bug 记录但不修**:阶段 2 状态机化会揭露的 `on_chat_model_end` 兜底 skipPrefix 雷,作为"已知问题"附录进 spec,**不**在本 spec 范围内修

## 4. 架构

```
                ┌────────────────────────────────────────────┐
                │  routes/chat.ts                            │
                │  POST /chat (协议层,不变)                    │
                └─────────────────────┬──────────────────────┘
                                      │
                                      ▼
                ┌────────────────────────────────────────────┐
                │  services/chat-service.ts                  │
                │  - thread 持久化 (不变)                     │
                │  - 选 graph (不变)                          │
                │  - 改:resume 判定改用 decideResume()         │
                └─────────────────────┬──────────────────────┘
                                      │  ResumeDecision
                                      ▼
                ┌────────────────────────────────────────────┐
                │  shared/resume-policy.ts (阶段 3 新建)      │
                │  decideResume(graph, threadId, agentId)    │
                │    - graph.getState() 作为单一真相源          │
                │    - 返回 new_conversation | resume         │
                └─────────────────────┬──────────────────────┘
                                      │
                                      ▼
                ┌────────────────────────────────────────────┐
                │  shared/stream-adapter.ts                  │
                │  - StreamStateMachine.apply(event, writer)  │
                │  - 调用 modelAdapter.unwrapToolInput(...)   │
                │  - 调用 modelAdapter.extractFinalText(...)  │
                └─────────────────────┬──────────────────────┘
                                      │
                                      ▼
                ┌────────────────────────────────────────────┐
                │  shared/stream-state.ts (阶段 2 新建)        │
                │  StreamPhase enum + StreamStateMachine     │
                │  8 个不变量函数                              │
                └────────────────────────────────────────────┘

                ┌────────────────────────────────────────────┐
                │  shared/model-adapter.ts (阶段 1 新建)      │
                │  interface ModelAdapter                    │
                │  shared/qwen-adapter.ts                    │
                │  class QwenAdapter implements ModelAdapter │
                └────────────────────────────────────────────┘
```

## 5. 阶段 1: ModelAdapter 抽象

### 5.1 动机

`stream-adapter.ts` 当前有 3 处 Qwen 适配(行 13 `unwrapToolInput`、行 189 `on_chat_model_end` 兜底、行 333 `extractFinalText`),混在"langgraph → UIMessage 翻译"主体里,污染了 stream-adapter 的可读性,且让"换模型要改哪里"无答案。

### 5.2 接口设计

```ts
// apps/api/src/agents/shared/model-adapter.ts
export interface ModelAdapter {
  /**
   * Unwrap tool_call args shaped like { input: "<JSON string>" } (Qwen / Aliyun
   * OpenAI-compat) into the actual schema-shaped object LangChain tool wrappers
   * expect. Returns the input unchanged for standard OpenAI models.
   */
  unwrapToolInput(raw: unknown): unknown;

  /**
   * Pull the final text out of a langchain on_chat_model_end event payload,
   * since non-streaming providers (Qwen / Aliyun) sometimes return the full
   * response in one shot. The payload shape varies; pass the whole event.data.
   * Returns "" if no usable text is found.
   */
  extractFinalTextFromEndEvent(data: unknown): string;
}
```

设计取舍:
- 接口保持 2 个方法,不引入"是否 Qwen"的 boolean
- 入参故意用 `unknown` 而非强类型,因为 langchain 版本间 event.data 形状有变
- 接口契约是"给我 payload,我给你修正后的形状",调用方不关心内部

### 5.3 QwenAdapter 实现

```ts
// apps/api/src/agents/shared/qwen-adapter.ts
import type { ModelAdapter } from "./model-adapter";

export class QwenAdapter implements ModelAdapter {
  unwrapToolInput(raw: unknown): unknown {
    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      const keys = Object.keys(raw as object);
      if (keys.length === 1 && keys[0] === "input") {
        const inner = (raw as Record<string, unknown>).input;
        if (typeof inner === "string") {
          try { return JSON.parse(inner); } catch { return raw; }
        }
        return inner;
      }
    }
    return raw;
  }

  extractFinalTextFromEndEvent(data: unknown): string {
    if (!data) return "";
    const candidates: unknown[] = [
      (data as any).output?.content,
      (data as any).output?.text,
      (data as any).output?.generations?.[0]?.[0]?.message?.content,
      (data as any).output?.generations?.[0]?.[0]?.text,
      (data as any).message?.content,
      (data as any).text,
    ];
    for (const c of candidates) {
      const text = firstTextOf(c);
      if (text) return text;
    }
    return "";
  }
}

function firstTextOf(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    for (const part of content) {
      if (typeof part === "string" && part.length > 0) return part;
      if (part && typeof part === "object" && (part as any).type === "text") {
        const t = (part as any).text;
        if (typeof t === "string" && t.length > 0) return t;
      }
    }
  }
  return "";
}
```

### 5.4 base/model.ts 扩展

```ts
// apps/api/src/agents/base/model.ts 新增
import { QwenAdapter } from "@/agents/shared/qwen-adapter";
import type { ModelAdapter } from "@/agents/shared/model-adapter";

let _modelAdapter: ModelAdapter | null = null;
export function getModelAdapter(): ModelAdapter {
  if (!_modelAdapter) _modelAdapter = new QwenAdapter();
  return _modelAdapter;
}
export function resetModelAdapter(): void { _modelAdapter = null; }
```

### 5.5 stream-adapter.ts 改造

- 删除 `unwrapToolInput` 局部函数(行 13-29)
- 删除 `extractFinalText` 局部函数(行 333-349)
- 保留 `extractTextDeltas`(它是 `on_chat_model_stream` 主路径的 helper,不是 Qwen-specific)
- Qwen 一次性回吐路径里用的内部 text 提取 helper(目前嵌在 `extractFinalText` 里)搬到 `qwen-adapter.ts` 内部,不导出
- `streamGraphToUIMessageStream` signature 加可选 `deps` 参数,默认从 `getModelAdapter()` 取
- 两处调用点改用 adapter

**signature 改动**:
```ts
export async function streamGraphToUIMessageStream(
  graph: CompiledStateGraph<any, any, any>,
  input: any,
  threadId: string,
  onFinish?: OnFinish,
  options?: { isResume?: boolean; skipPrefix?: string },
  deps?: { modelAdapter?: ModelAdapter },  // ← 新增
): Promise<Response> {
  const adapter = deps?.modelAdapter ?? getModelAdapter();
  // ...
}
```

向后兼容:不传 `deps` 走 `getModelAdapter()`,调用方零改动。

### 5.6 文件改动清单

| 文件 | 改动类型 | 内容 |
|------|---------|------|
| `apps/api/src/agents/shared/model-adapter.ts` | 新建 | `ModelAdapter` 接口 |
| `apps/api/src/agents/shared/qwen-adapter.ts` | 新建 | `QwenAdapter implements ModelAdapter` |
| `apps/api/src/agents/shared/__tests__/qwen-adapter.test.ts` | 新建 | 5 个契约测试 case |
| `apps/api/src/agents/base/model.ts` | 改 | 新增 `getModelAdapter()` / `resetModelAdapter()` |
| `apps/api/src/agents/shared/stream-adapter.ts` | 改 | 删 2 个局部函数;加 `deps` 参数;改 2 处调用点 |
| `apps/api/src/agents/shared/__tests__/stream-adapter.test.ts` | **不改** | 9 个 case 全保留,跑过 |
| `apps/api/src/services/chat-service.ts` | **不改** | signature 向后兼容 |

### 5.7 测试验收

`qwen-adapter.test.ts` 5 个 case:
1. `unwrapToolInput({ input: '{"x":1}' })` → `{ x: 1 }`
2. `unwrapToolInput({ input: { x: 1 } })` → `{ x: 1 }`(已经是对象)
3. `unwrapToolInput({ input: 'not json' })` → 原值(graceful fallback)
4. `unwrapToolInput({ other: 1 })` → 原值(非 `input` 键)
5. `extractFinalTextFromEndEvent({ output: { content: "hello" } })` → `"hello"`

### 5.8 风险与回滚

- **风险**:QwenAdapter 是从 stream-adapter 整段搬出来的纯函数搬迁,没有逻辑改动。**对策**:搬迁前 `git grep "unwrapToolInput\|extractFinalText"` 确认所有调用点;搬迁后跑 `vitest run stream-adapter.test.ts` 必须全绿
- **回滚**:单个 PR revert。`ModelAdapter` 接口是 pure addition,回滚后 stream-adapter 仍可用

## 6. 阶段 2: stream-adapter 状态机化 + 不变量测试

### 6.1 动机

stream-adapter 主循环同时维护 5 个 let 变量:
- `stepOpen: boolean` — LLM 步骤是否在进行中
- `textOpen: boolean` — text-delta 流是否打开
- `inputSent: Set<string>` — 已写过 `tool-input-available` 的 run_id
- `skipToolEvents: boolean` — 是否处于 resume replay 阶段
- `prefixBuffer: string` — 还没决定 prefix 是否匹配上的累积文本

5 个状态在事件循环里被 6 个分支独立读写。不变量靠隐式约定(例如"每个 `on_chat_model_start` 必须配对一个 `finish-step`"靠 finally 兜底),多变量联合状态难测。

阶段 2 提为显式有限状态机,提取 8 条不变量作为单测对象。

### 6.2 StreamPhase 枚举

```ts
// apps/api/src/agents/shared/stream-state.ts
export type StreamPhase =
  | { kind: "idle" }          // 流刚开,没事件
  | { kind: "llm_step" }      // 收到 on_chat_model_start
  | { kind: "llm_text_open" } // 已 emit 过 text-start
  | { kind: "tool_replay" }   // resume 阶段,跳过 tool 事件
  | { kind: "tool_fresh" }    // 新 step 后的 tool 事件
  | { kind: "finishing" }     // 准备 close
  | { kind: "closed" };       // 流结束
```

### 6.3 StreamStateMachine class

```ts
export class StreamStateMachine {
  private phase: StreamPhase = { kind: "idle" };
  // 派生态字段(inputSent / prefixBuffer)从 phase 派生或独立维护
  private inputSent: Set<string> = new Set();
  private prefixBuffer: string = "";

  apply(event: LangGraphEvent, writer: UIMessageWriter, ctx: StreamContext): StreamPhase {
    // 集中所有 if/else 转换逻辑
  }

  invariant(): void {
    // 8 条不变量(见 6.4)
  }

  close(writer: UIMessageWriter): void {
    // 替代 finally 里的清理
  }
}
```

主循环改造后:
```ts
for await (const event of events) {
  this.stateMachine.apply(event, writer, ctx);
  this.stateMachine.invariant();
}
```

### 6.4 不变量清单

- **I1**: `text-delta` 之前必有同 textId 的 `text-start`
- **I2**: `text-delta` 之后不能再有同 textId 的 `text-delta`(在 `text-end` 之后)
- **I3**: `start-step` 数量 ≤ `finish-step` 数量
- **I4**: 连续 2 个 `on_chat_model_start` 之间如没 `text-end`,第二次必须自己 emit `text-end`
- **I5**: resume 阶段(`tool_replay`)之后的 `on_chat_model_start` 之后 phase 不再是 `tool_replay`
- **I6**: `tool_fresh` 收到 `on_tool_error` 时,如之前没 `on_tool_start`,必须用 interrupt value 写 `tool-input-available`
- **I7**: 相同 `toolCallId` 不会 emit 2 次 `tool-input-available`
- **I8**: `prefixBuffer` 在流关闭时 flush 后,整个文本跟 `skipPrefix` 的"匹配部分"为空

### 6.5 文件改动清单

| 文件 | 改动类型 | 内容 |
|------|---------|------|
| `apps/api/src/agents/shared/stream-state.ts` | 新建 | `StreamPhase` 类型 + `StreamStateMachine` class + 8 个 invariant 函数 |
| `apps/api/src/agents/shared/stream-adapter.ts` | 改 | 主循环改用 `stateMachine.apply()`;删 5 个 let 变量;其余行数基本不变 |
| `apps/api/src/agents/shared/__tests__/stream-adapter-invariant.test.ts` | 新建 | 8 个不变量专项测试 (I1-I8 各 1) + 1 个"重构前后等价性"测试 |

### 6.6 等价性测试

跑同一个 fake 事件序列(包含现有 9 个 case 中的所有事件模式),对比阶段 1 之后的输出和阶段 2 之后的输出,byte-for-byte 相同。**这是"不改变功能"硬约束的最强证据**。

### 6.7 跟阶段 1 的边界

- 阶段 1 引入的 `ModelAdapter` 不变动
- 阶段 2 引入的 `StreamStateMachine` 不依赖 `ModelAdapter`
- 阶段 1 + 2 一起做完后,stream-adapter 翻译主体完全不知道是 Qwen;Qwen 行为由 adapter 兜底;翻译流程由状态机兜底。**两件事正交**

### 6.8 风险与回滚

- **风险**:5 个 let 变量提为 phase 字段,重构期间可能漏写转换。**对策**:等价性测试作为安全网,任何输出差异视为重构 bug
- **回滚**:单个 PR revert。`stream-state.ts` 是 pure addition

## 7. 阶段 3: resume 显式化

### 7.1 动机

`chat-service.ts` 用三个函数在前端 messages 数组上反推 resume 状态:
- `detectAskUserResume(messages)`(行 71-98):找最后一条 assistant 消息,扫 parts 看是不是有未消费的 `tool-ask_user` output
- `detectSuggestAgentResume(messages)`(行 100-122):同模式,针对 `tool-suggest_agent`
- `getLastAssistantText(messages)`(行 40-58):找最后一条 assistant,从最后 `step-start` part 起提取 text

核心问题:
- 单一真相源在反推。langgraph `SqliteSaver` 已经持久化 `state.tasks[].interrupts`,是权威
- 三个函数共同脆弱模式:依赖 messages 完整、parts 状态正确、step-start 位置准确
- 跨 agent 切(start → weekly)语义不明,反推函数 + 新 threadId 混在一起难读

### 7.2 ResumePolicy 设计

```ts
// apps/api/src/agents/shared/resume-policy.ts
import type { CompiledStateGraph } from "@langchain/langgraph";
import { Command } from "@langchain/langgraph";

export type ResumeDecision =
  | { kind: "new_conversation" }
  | { kind: "resume"; command: Command; skipPrefix: string };

export async function decideResume(
  graph: CompiledStateGraph<any, any, any>,
  threadId: string,
  agentId: string,
): Promise<ResumeDecision> {
  const snapshot = await graph.getState({
    configurable: { thread_id: threadId },
  });

  if (!snapshot || !snapshot.values) {
    return { kind: "new_conversation" };
  }

  const interrupt = firstPendingInterrupt(snapshot);
  if (!interrupt) {
    return { kind: "new_conversation" };
  }

  const resumeValue = extractResumeValue(interrupt, snapshot);
  if (resumeValue === null) {
    return { kind: "new_conversation" };
  }

  const skipPrefix = extractLastAssistantText(snapshot);

  return {
    kind: "resume",
    command: new Command({ resume: resumeValue }),
    skipPrefix,
  };
}
```

### 7.3 关键设计:跨 agent 切的处理

`start` agent 调用 `suggest_agent`,用户同意切到 `weekly`,前端用新 threadId 调 POST /chat 跑 `weekly` graph:
- 当前行为:新 threadId + detect 找不到 `tool-suggest_agent` output → new_conversation
- 阶段 3 行为:新 threadId + getState 返回 null → new_conversation

边界场景:用户同意切到 weekly 但前端**复用**原 threadId + 改 agentId:
- 当前行为:detect 命中(看 messages)→ 走 Command({ resume }),但 weekly graph 上没有那个 interrupt,langgraph 行为不确定
- 阶段 3 行为:getState 检查 weekly graph 的 state,找不到此 threadId → new_conversation

→ 行为更可预测,属于 bug 修复(前端协议本来就要求切 agent 时建新 thread)。

### 7.4 chat-service.ts 改造

```ts
import { decideResume } from "@/agents/shared/resume-policy";

export async function streamChat(req: ChatRequest) {
  const agentId = req.agentId ?? "start";
  const currentThreadId = req.threadId ?? crypto.randomUUID();
  // ... thread 持久化 / 选 graph / 准备 onFinish 同现状 ...

  // 删 detectAskUserResume / detectSuggestAgentResume / getLastAssistantText
  const decision = await decideResume(graph, currentThreadId, agentId);

  if (decision.kind === "resume") {
    const response = await streamGraphToUIMessageStream(
      graph, decision.command, currentThreadId, onFinish,
      { isResume: true, skipPrefix: decision.skipPrefix },
    );
    touchThread(currentThreadId);
    return response;
  }

  // 新对话路径同现状
  const lastUserMessage = [...req.messages].reverse().find((m) => m.role === "user");
  if (lastUserMessage) {
    insertMessage({ /* ... */ });
  }
  const streamer: Streamer = STREAMERS[agentId] ?? startStreamChat;
  const userMessage = new HumanMessage(lastUserText(req.messages));
  const response = await streamer({ graph, userMessage, threadId: currentThreadId, agentId, onFinish });
  touchThread(currentThreadId);
  return response;
}
```

### 7.5 文件改动清单

| 文件 | 改动类型 | 内容 |
|------|---------|------|
| `apps/api/src/agents/shared/resume-policy.ts` | 新建 | `decideResume()` + `ResumeDecision` 类型 + 内部 helper |
| `apps/api/src/agents/shared/__tests__/resume-policy.test.ts` | 新建 | 6 个 case |
| `apps/api/src/services/chat-service.ts` | 改 | 删 3 个反推函数(约 60 行),改用 `decideResume` |
| `apps/api/src/services/__tests__/chat-service.test.ts` | 改 | 删掉针对 detect 函数本身的单测;`streamChat` 集成测试加新 case |

### 7.6 测试验收

`resume-policy.test.ts` 6 个 case:
1. getState 返回 null → `new_conversation`
2. getState 返回无 interrupt → `new_conversation`
3. getState 返回 ask_user interrupt + messages 末尾有未消费 `tool-ask_user` output with selected → `resume`,command resume 是 string
4. getState 返回 ask_user interrupt + messages 末尾 tool-ask_user output 已被后续 text part 消费 → `new_conversation`
5. getState 返回 suggest_agent interrupt + messages 末尾有未消费 `tool-suggest_agent` output with confirmed → `resume`,command resume 是 boolean
6. skipPrefix 提取:从 state.values.messages 找最后一条 AIMessage 提取 text

### 7.7 等价性论证

| 场景 | 改前 | 改后 | 一致 |
|------|------|------|------|
| 全新对话 | detect 返回 null → new_conversation | getState 返回 null → new_conversation | ✅ |
| ask_user 中断后用户回答 | detect 找到 selected → resume | getState 返回 ask_user interrupt + 有未消费 output → resume | ✅ |
| ask_user 中断后 LLM 已回答,用户再发 | detect 看到"已消费" → new_conversation | getState 无 interrupt(已 resume 完成) → new_conversation | ✅ |
| suggest_agent 中断后用户同意 | detect 返回 confirmed: true → resume | getState 返回 suggest_agent interrupt + 有 confirmed → resume | ✅ |
| suggest_agent 中断后用户拒绝 | detect 返回 confirmed: false → resume(false 续传) | getState 同路径 | ✅ |
| 跨 agent 切(新 threadId) | new_conversation | getState 无此 threadId → new_conversation | ✅ |
| 跨 agent 切(复用 threadId + 改 agentId) | detect 命中 → resume(不存在的 interrupt) | getState 找不到此 threadId → new_conversation | ⚠️ 行为变化,属于 bug 修复 |

### 7.8 风险与回滚

- **风险**:`graph.getState` API 在 langgraph 版本间可能变化(0.2 vs 0.3+ `StateSnapshot.tasks` 字段)。**对策**:实施前 `pnpm why @langchain/langgraph` 确认锁版本;测试里 mock `getState` 返回值用本地定义的 `StateSnapshot` 形状
- **回滚**:单个 PR revert
- **不影响阶段 1/2**:阶段 3 改的是 chat-service 入口协议层,不触及翻译逻辑

## 8. 状态:已知问题(不在本 spec 范围)

阶段 2 状态机化过程中,不变量 I8("`prefixBuffer` 在流关闭时 flush 后,整个文本跟 `skipPrefix` 的匹配部分为空")**确认揭露一个已存在 bug**(见附录 B 详细复现):

- **位置**:`apps/api/src/agents/shared/stream-adapter.ts` 行 272-278
- **症状**:`on_chat_model_end` 兜底分支(line 187-202)里 `prefixBuffer` 在 finally 中 flush 时,**不做 prefix match**
- **影响**:模型一次性回吐的文本如果跟 `skipPrefix` 重叠,会导致用户看到重复内容
- **本 spec 不修**:作为发现性问题记录,留给阶段 3 完成后的独立 PR 处理

## 9. 测试策略

每个阶段都跑 `pnpm --filter api test` 全绿。

- **阶段 1**:新增 `qwen-adapter.test.ts` 5 个 case;现有 stream-adapter 9 个 case 全保留
- **阶段 2**:新增 `stream-adapter-invariant.test.ts` 8 个不变量 + 1 个等价性测试;现有 9 个 case 全保留
- **阶段 3**:新增 `resume-policy.test.ts` 6 个 case;修改 `chat-service.test.ts`(删 detect 专项测试,加集成测试)

## 10. 迁移路径

三个独立 PR,按编号顺序合并,每 PR 可独立 revert:

1. **PR #1(阶段 1)**:ModelAdapter 抽象
2. **PR #2(阶段 2)**:状态机化
3. **PR #3(阶段 3)**:resume 显式化

每个 PR 都不应跨越两个阶段,避免大 PR 难 review 难回滚。

## 11. 主要风险

| 风险 | 严重度 | 缓解 |
|------|--------|------|
| 阶段 1 搬迁 Qwen 适配误删原函数 | 中 | git grep 确认所有调用点;搬迁后全量测试 |
| 阶段 2 状态机转换漏写 | 中 | 等价性测试作为安全网;byte-level diff |
| 阶段 3 langgraph API 行为变化 | 中 | 锁版本;本地 mock `StateSnapshot` |
| I8 揭露的 bug 推迟到独立 PR | 低 | spec §8 明确记录;阶段 3 完成后立即处理 |
| 三个 PR 跨度长,合并冲突 | 低 | 每 PR 改的文件不重叠;按依赖顺序合并 |

## 12. 关键决策

| 决策 | 选择 | 否决方案 |
|------|------|---------|
| 阶段切分粒度 | 3 个独立可回滚阶段 | 1 个大 PR(难 review 难回滚) |
| 阶段 1 接口形式 | ModelAdapter 2 方法 | 钩子模式 / boolean isQwen |
| 阶段 1 默认 adapter 来源 | `getModelAdapter()` 单例 | 每次 new(状态浪费) |
| 阶段 2 状态表达 | enum + class | enum + 散落 helper |
| 阶段 3 单一真相源 | `graph.getState()` | 自建 pending_interrupts 表 |
| 阶段 3 跨 agent 切 | 复用 threadId + 改 agentId 当 new_conversation | 抛错(影响产品) |
| I8 bug 处理 | 推迟到独立 PR | 阶段 2 同步修(scope creep) |

## 13. 未来扩展(不在本次范围)

- 阶段 2 揭露的 `on_chat_model_end` 兜底 skipPrefix 雷修
- 多供应商 model 接入(阶段 1 留接口位,实装仅 Qwen)
- ResumePolicy 增加"interrupt 类型黑名单"(某些 interrupt 不自动 resume)

## 附录 B: 阶段 2 实施发现 (2026-06-22)

阶段 2 实施期间,SA-2 子代理确认 §8 描述的 bug 存在,并产出了能稳定复现该 bug 的测试。

**Bug 复现路径**:`stream-adapter.ts:246-253` 的 `finally` 子句,当 `on_chat_model_stream` 累积的 `prefixBuffer` 长度从未达到 `skipPrefix.length` 就流结束时,会原样 flush 整个 buffer 到客户端 —— 但这个 buffer 可能是 skipPrefix 的前缀回显,客户端会看到 skipPrefix 残片。

**复现测试**:`apps/api/src/agents/shared/__tests__/stream-adapter-invariant.test.ts` 的 `[bug-reproduction] streaming chunks that never reach skipPrefix.length before stream end` case。

**测试结果**:当前**该 case 失败**(expected `""` received `"ab"`),即 bug 存在,本 spec 不修。

**计划中原 I8 测试场景的问题**:plan Task 2.3 Step 1 给的 I8 测试用 `on_chat_model_end` 路径,但该路径有自身的 skipPrefix 剥离(行 166-168),不经过 finally 的 flush 路径,因此无法打到该 bug。SA-2 实施时补了一个能真实复现的 streaming-buffer 场景。

**修复方向**(待后续 PR):
- 在 `finally` 块的 `if (!prefixDone && sm.prefixBuffer)` 分支里,在 flush 之前检查 `sm.prefixBuffer` 跟 `skipPrefix` 的关系
- 如果 `sm.prefixBuffer` 是 `skipPrefix` 的前缀(意味着模型可能还在回显 skipPrefix),则**整段不 emit**
- 修复后该测试 case 应转为绿色
- stream-adapter 状态机导出可视化工具
- 跨 thread 知识共享
