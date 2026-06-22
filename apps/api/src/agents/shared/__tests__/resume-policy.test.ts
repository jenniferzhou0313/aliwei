import { describe, it, expect, vi } from "vitest";
import { decideResume } from "../resume-policy";

function makeGraph(getStateResult: any) {
  return { getState: vi.fn().mockResolvedValue(getStateResult) } as any;
}

const SAMPLE_THREAD = "thread-1";

describe("decideResume", () => {
  it("returns new_conversation when getState returns null", async () => {
    const graph = makeGraph(null);
    const d = await decideResume(graph, SAMPLE_THREAD, "jargon");
    expect(d.kind).toBe("new_conversation");
  });

  it("returns new_conversation when no pending interrupts", async () => {
    const graph = makeGraph({
      values: { messages: [] },
      tasks: [],
    });
    const d = await decideResume(graph, SAMPLE_THREAD, "jargon");
    expect(d.kind).toBe("new_conversation");
  });

  it("returns resume for ask_user interrupt with unconsumed tool output", async () => {
    const graph = makeGraph({
      values: {
        messages: [
          { _getType: () => "human", content: "banding 是啥?" },
          { _getType: () => "ai", content: "", tool_calls: [{ name: "ask_user", args: { question: "详细还是简略?", options: ["详细", "简略"] }, id: "call-1" }] },
          { _getType: () => "tool", name: "ask_user", content: '{"selected":"详细"}' },
        ],
      },
      tasks: [{ interrupts: [{ value: { question: "详细还是简略?", options: ["详细", "简略"] } }] }],
    });
    const d = await decideResume(graph, SAMPLE_THREAD, "jargon");
    expect(d.kind).toBe("resume");
    if (d.kind === "resume") {
      expect(d.skipPrefix).toBeDefined();
    }
  });

  it("returns resume for suggest_agent interrupt with confirmed=true", async () => {
    const graph = makeGraph({
      values: {
        messages: [
          { _getType: () => "ai", content: "", tool_calls: [{ name: "suggest_agent", args: { agentId: "weekly", reason: "周报" }, id: "call-2" }] },
          { _getType: () => "tool", name: "suggest_agent", content: '{"confirmed":true}' },
        ],
      },
      tasks: [{ interrupts: [{ value: { agentId: "weekly", reason: "周报" } }] }],
    });
    const d = await decideResume(graph, SAMPLE_THREAD, "start");
    expect(d.kind).toBe("resume");
  });

  it("returns new_conversation when tool output has been consumed by later text part", async () => {
    // The "consumed" detection walks messages parts; in our simplified mock,
    // the tool output is followed by an ai text message, meaning LLM responded.
    const graph = makeGraph({
      values: {
        messages: [
          { _getType: () => "ai", content: "", tool_calls: [{ name: "ask_user", args: { question: "?", options: ["a", "b"] }, id: "call-1" }] },
          { _getType: () => "tool", name: "ask_user", content: '{"selected":"a"}' },
          { _getType: () => "ai", content: "好的,我用 a" },
        ],
      },
      tasks: [], // After resume, no pending interrupts
    });
    const d = await decideResume(graph, SAMPLE_THREAD, "jargon");
    expect(d.kind).toBe("new_conversation");
  });
});