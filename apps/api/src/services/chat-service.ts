import type { UIMessage } from "ai";
import { createThread, getThread, insertMessage, touchThread } from "@aliwei/db";
import { HumanMessage } from "@langchain/core/messages";
import { getChatModel } from "@/agents/base/model";
import { createJargonGraph, jargonStreamChat } from "@/agents/jargon/graph";
import { createWeeklyGraph, weeklyStreamChat } from "@/agents/weekly/graph";
import { createOkrGraph, okrStreamChat } from "@/agents/okr/graph";
import { createReviewGraph, reviewStreamChat } from "@/agents/review/graph";

type ChatRequest = {
  messages: UIMessage[];
  system?: string;
  tools?: Record<string, { description?: string; parameters: unknown }>;
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

// Exported for testing: spec §6 invariant — graph receives a single HumanMessage
// containing only the text of the last user turn.
export function lastUserText(messages: UIMessage[]): string {
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  return lastUser ? extractText(lastUser) : "";
}

type Streamer = (opts: {
  graph: ReturnType<typeof createJargonGraph>;
  userMessage: HumanMessage;
  threadId: string;
  toolId: string;
  onFinish?: (text: string) => void | Promise<void>;
}) => Promise<Response>;

const GRAPH_FACTORIES: Record<string, (model: ReturnType<typeof getChatModel>) => ReturnType<typeof createJargonGraph>> = {
  weekly: createWeeklyGraph,
  okr: createOkrGraph,
  review: createReviewGraph,
};

const STREAMERS: Record<string, Streamer> = {
  weekly: weeklyStreamChat,
  okr: okrStreamChat,
  review: reviewStreamChat,
};

export async function streamChat(req: ChatRequest) {
  const toolId = req.toolId ?? "jargon";
  const currentThreadId = req.threadId ?? crypto.randomUUID();

  const existingThread = req.threadId ? getThread(req.threadId) : null;
  if (!existingThread) {
    const firstUserMsg = req.messages.find((m) => m.role === "user");
    const title = firstUserMsg ? extractText(firstUserMsg).slice(0, 20) || "新对话" : "新对话";
    createThread({ id: currentThreadId, userId: req.userId, title, toolId });
  }

  const lastUserMessage = [...req.messages].reverse().find((m) => m.role === "user");
  if (lastUserMessage) {
    insertMessage({
      id: lastUserMessage.id,
      threadId: currentThreadId,
      role: "user",
      content: JSON.stringify(lastUserMessage),
    });
  }

  const model = getChatModel();
  const graph = (GRAPH_FACTORIES[toolId] ?? createJargonGraph)(model);
  const streamer: Streamer = STREAMERS[toolId] ?? jargonStreamChat;
  const userMessage = new HumanMessage(lastUserText(req.messages));

  const response = await streamer({
    graph,
    userMessage,
    threadId: currentThreadId,
    toolId,
    onFinish: async (text: string) => {
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
    },
  });
  touchThread(currentThreadId);
  return response;
}
