import { describe, it, expect, beforeEach } from "vitest";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { FakeListChatModel } from "@langchain/core/utils/testing";
import { BaseState } from "../state";
import { createBaseGraph } from "../graph";
import { resetCheckpointer } from "../checkpointer";
import * as fs from "node:fs";

const TEST_DB = "/tmp/aliwei-test-graph.db";

beforeEach(() => {
  process.env.CHECKPOINTER_DB_PATH = TEST_DB;
  if (fs.existsSync(TEST_DB)) fs.unlinkSync(TEST_DB);
  resetCheckpointer();
});

describe("createBaseGraph", () => {
  it("runs a no-tool round trip: HumanMessage → AIMessage", async () => {
    const fake = new FakeListChatModel({ responses: ["hello back"] });
    const graph = createBaseGraph({
      toolId: "jargon",
      stateAnnotation: BaseState,
      systemPromptFn: () => "you are a test",
      model: fake as any,
    });

    const result = await graph.invoke(
      { messages: [new HumanMessage("hi")], threadId: "t-1", toolId: "jargon" } as any,
      { configurable: { thread_id: "t-1" } },
    );

    expect(result.messages).toHaveLength(2);
    expect(result.messages[0]).toBeInstanceOf(HumanMessage);
    expect(result.messages[1]).toBeInstanceOf(AIMessage);
    expect((result.messages[1] as AIMessage).content).toBe("hello back");
  });

  it("checkpointer restores state.messages on second invocation with same thread_id", async () => {
    const fake = new FakeListChatModel({ responses: ["first reply", "second reply"] });
    const graph = createBaseGraph({
      toolId: "jargon",
      stateAnnotation: BaseState,
      systemPromptFn: () => "you are a test",
      model: fake as any,
    });

    await graph.invoke(
      { messages: [new HumanMessage("hi")], threadId: "t-2", toolId: "jargon" } as any,
      { configurable: { thread_id: "t-2" } },
    );

    const second = await graph.invoke(
      { messages: [new HumanMessage("again")], threadId: "t-2", toolId: "jargon" } as any,
      { configurable: { thread_id: "t-2" } },
    );

    expect(second.messages.length).toBeGreaterThanOrEqual(4);
  });
});
