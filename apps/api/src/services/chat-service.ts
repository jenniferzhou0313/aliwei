// import { frontendTools } from "@assistant-ui/react-ai-sdk";
// import {
//   convertToModelMessages,
//   streamText,
//   type JSONSchema7,
//   type UIMessage,
// } from "ai";
// import {
//   createThread,
//   getThread,
//   insertMessage,
//   touchThread,
// } from "@aliwei/db";
// import { llmClient, MODEL_NAME } from "./llm-client";

// type ChatRequest = {
//   messages: UIMessage[];
//   system?: string;
//   tools?: Record<string, { description?: string; parameters: JSONSchema7 }>;
//   threadId?: string;
//   toolId?: string;
//   userId: string;
// };

// function extractText(message: UIMessage): string {
//   return message.parts
//     .filter((p): p is { type: "text"; text: string } => p.type === "text")
//     .map((p) => p.text)
//     .join("");
// }

// export async function streamChat(req: ChatRequest) {
//   const currentThreadId = req.threadId ?? crypto.randomUUID();

//   const existingThread = req.threadId ? getThread(req.threadId) : null;
//   if (!existingThread) {
//     const firstUserMsg = req.messages.find((m) => m.role === "user");
//     const title = firstUserMsg
//       ? extractText(firstUserMsg).slice(0, 20) || "新对话"
//       : "新对话";
//     createThread({
//       id: currentThreadId,
//       userId: req.userId,
//       title,
//       toolId: req.toolId,
//     });
//   }

//   const lastUserMessage = [...req.messages]
//     .reverse()
//     .find((m) => m.role === "user");
//   if (lastUserMessage) {
//     insertMessage({
//       id: lastUserMessage.id,
//       threadId: currentThreadId,
//       role: "user",
//       content: JSON.stringify(lastUserMessage),
//     });
//   }

//   const result = streamText({
//     // .chat() forces /v1/chat/completions; default routes to /v1/responses,
//     // which Aliyun/Moark-compatible endpoints do not implement.
//     model: llmClient.chat(MODEL_NAME),
//     messages: await convertToModelMessages(req.messages),
//     system: req.system,
//     tools: {
//       ...frontendTools(req.tools ?? {}),
//     },
//     onFinish: ({ text }) => {
//       const assistantMessage: UIMessage = {
//         id: crypto.randomUUID(),
//         role: "assistant",
//         parts: [{ type: "text", text }],
//       };
//       insertMessage({
//         id: assistantMessage.id,
//         threadId: currentThreadId,
//         role: "assistant",
//         content: JSON.stringify(assistantMessage),
//       });
//       touchThread(currentThreadId);
//     },
//   });

//   return result.toUIMessageStreamResponse();
// }
import { frontendTools } from "@assistant-ui/react-ai-sdk";
import {
  convertToModelMessages,
  streamText,
  type JSONSchema7,
  type UIMessage,
} from "ai";
import {
  createThread,
  getThread,
  insertMessage,
  touchThread,
} from "@aliwei/db";
import { llmClient, MODEL_NAME } from "./llm-client";
import { streamWeeklyReport } from "@/agents/weekly-reporter";

// 周报工具的 toolId —— ⚠️ 改成 packages/domain TOOLS 数组里「周报」那一项的真实 id
const WEEKLY_TOOL_ID = "weekly";

type ChatRequest = {
  messages: UIMessage[];
  system?: string;
  tools?: Record<string, { description?: string; parameters: JSONSchema7 }>;
  threadId?: string;
  toolId?: string;
  userId: string;
};

function extractText(message: UIMessage): string {
  return message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

export async function streamChat(req: ChatRequest) {
  const currentThreadId = req.threadId ?? crypto.randomUUID();
  const existingThread = req.threadId ? getThread(req.threadId) : null;
  if (!existingThread) {
    const firstUserMsg = req.messages.find((m) => m.role === "user");
    const title = firstUserMsg
      ? extractText(firstUserMsg).slice(0, 20) || "新对话"
      : "新对话";
    createThread({
      id: currentThreadId,
      userId: req.userId,
      title,
      toolId: req.toolId,
    });
  }

  const lastUserMessage = [...req.messages]
    .reverse()
    .find((m) => m.role === "user");
  if (lastUserMessage) {
    insertMessage({
      id: lastUserMessage.id,
      threadId: currentThreadId,
      role: "user",
      content: JSON.stringify(lastUserMessage),
    });
  }

  // 助手消息入库 + 线程刷新：抽成共享回调，单轮路径与周报 agent 复用
  const persistAssistant = (text: string) => {
    const assistantMessage: UIMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      parts: [{ type: "text", text }],
    };
    insertMessage({
      id: assistantMessage.id,
      threadId: currentThreadId,
      role: "assistant",
      content: JSON.stringify(assistantMessage),
    });
    touchThread(currentThreadId);
  };

  // === 周报：多步 actor-critic agent，单独分流，不走通用单轮 streamText ===
  if (req.toolId === WEEKLY_TOOL_ID) {
    const rawInput = lastUserMessage ? extractText(lastUserMessage) : "";
    return streamWeeklyReport({
      rawInput,
      onAssistantFinish: persistAssistant,
    });
  }

  // === 通用单轮路径（原逻辑，仅把 onFinish 改为复用 persistAssistant）===
  const result = streamText({
    // .chat() forces /v1/chat/completions; default routes to /v1/responses,
    // which Aliyun/Moark-compatible endpoints do not implement.
    model: llmClient.chat(MODEL_NAME),
    messages: await convertToModelMessages(req.messages),
    system: req.system,
    tools: {
      ...frontendTools(req.tools ?? {}),
    },
    onFinish: ({ text }) => persistAssistant(text),
  });

  return result.toUIMessageStreamResponse();
}
