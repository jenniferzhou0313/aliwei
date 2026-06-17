import { describe, it, expect, beforeEach } from "vitest";
import { Hono } from "hono";
import chatRouter from "../chat";
import { resetChatModel } from "@/agents/base/model";
import { resetCheckpointer } from "@/agents/base/checkpointer";

function buildApp() {
  const app = new Hono();
  // Stub userId middleware so the route doesn't fail on missing context
  app.use("*", async (c, next) => {
    c.set("userId" as any, "test-user");
    await next();
  });
  app.route("/chat", chatRouter);
  return app;
}

describe("POST /chat/continue", () => {
  beforeEach(() => {
    process.env.CHECKPOINTER_DB_PATH = `/tmp/aliwei-continue-${Date.now()}.db`;
    process.env.ALIBABA_BASE_URL = "http://localhost:9999";
    process.env.ALIBABA_API_KEY = "test-key";
    process.env.MODEL_NAME = "qwen-test";
    resetChatModel();
    resetCheckpointer();
  });

  it("returns 400 for unsupported toolId", async () => {
    const app = buildApp();
    const res = await app.request("/chat/continue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ threadId: "t-1", toolId: "unknown-tool", answer: "yes" }),
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("not supported");
  });

  it("returns text/event-stream for jargon toolId", async () => {
    const app = buildApp();
    const res = await app.request("/chat/continue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ threadId: `t-jargon-${Date.now()}`, toolId: "jargon", answer: "详细" }),
    });
    expect(res).toBeInstanceOf(Response);
    expect(res.headers.get("content-type")).toContain("text/event-stream");
    res.body?.cancel();
  });

  it("returns text/event-stream for weekly toolId", async () => {
    const app = buildApp();
    const res = await app.request("/chat/continue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ threadId: `t-weekly-${Date.now()}`, toolId: "weekly", answer: "简略" }),
    });
    expect(res).toBeInstanceOf(Response);
    expect(res.headers.get("content-type")).toContain("text/event-stream");
    res.body?.cancel();
  });
});
