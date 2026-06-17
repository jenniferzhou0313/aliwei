import { describe, it, expect } from "vitest";
import { streamGraphToUIMessageStream } from "../stream-adapter";
import { GraphInterrupt } from "@langchain/langgraph";

describe("streamGraphToUIMessageStream", () => {
  it("emits ask_user_pending SSE event when graph is interrupted", async () => {
    const fakeInterrupt = new GraphInterrupt([
      { value: { question: "你想详细还是简略?", options: ["详细", "简略"] } },
    ]);

    async function* fakeStreamEvents() {
      yield {
        event: "on_tool_error",
        data: { error: fakeInterrupt },
        name: "ask_user",
        run_id: "run-1",
        tags: [],
        metadata: {},
      };
      throw fakeInterrupt;
    }

    const mockGraph = { streamEvents: () => fakeStreamEvents() } as any;

    const res = await streamGraphToUIMessageStream(mockGraph, {} as any, "t-int-1");
    const text = await res.text();

    expect(text).toContain("ask_user_pending");
    expect(text).toContain("你想详细还是简略?");
    expect(text).not.toContain('"finishReason":"stop"');
  });

  it("emits finishReason:stop and text chunks on normal completion", async () => {
    async function* fakeStreamEvents() {
      yield {
        event: "on_chat_model_stream",
        data: { chunk: { content: "hello" } },
        name: "ChatModel",
        run_id: "run-2",
        tags: [],
        metadata: {},
      };
      yield {
        event: "on_chain_end",
        data: {},
        name: "LangGraph",
        run_id: "run-2",
        tags: [],
        metadata: {},
      };
    }

    const mockGraph = { streamEvents: () => fakeStreamEvents() } as any;

    const res = await streamGraphToUIMessageStream(mockGraph, {} as any, "t-int-2");

    expect(res).toBeInstanceOf(Response);
    expect(res.headers.get("content-type")).toContain("text/event-stream");

    const text = await res.text();
    expect(text).toContain('"hello"');
    expect(text).toContain('"finishReason":"stop"');
  });
});
