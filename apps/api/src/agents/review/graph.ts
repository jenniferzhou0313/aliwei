import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { CompiledStateGraph } from "@langchain/langgraph";
import { HumanMessage } from "@langchain/core/messages";
import { createBaseGraph } from "../base/graph";
import { ReviewState } from "../base/state";
import { REVIEW_SYSTEM_PROMPT, buildSystemPrompt } from "@aliwei/domain/prompts";
import { streamGraphToUIMessageStream } from "../shared/stream-adapter";
import { searchPastReviewsTool } from "./tools";

export function createReviewGraph(
  model: BaseChatModel,
): CompiledStateGraph<any, any, any> {
  return createBaseGraph({
    toolId: "review",
    stateAnnotation: ReviewState as any,
    systemPromptFn: () => buildSystemPrompt(REVIEW_SYSTEM_PROMPT),
    extraTools: [searchPastReviewsTool],
    model,
  }) as any;
}

export async function reviewStreamChat(opts: {
  graph: CompiledStateGraph<any, any, any>;
  userMessage: HumanMessage;
  threadId: string;
  toolId: string;
}): Promise<Response> {
  return streamGraphToUIMessageStream(
    opts.graph,
    {
      messages: [opts.userMessage],
      threadId: opts.threadId,
      toolId: opts.toolId,
    },
    opts.threadId,
  );
}
