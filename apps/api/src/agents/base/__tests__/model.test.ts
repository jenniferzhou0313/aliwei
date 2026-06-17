import { describe, it, expect, beforeEach } from "vitest";
import { ChatOpenAI } from "@langchain/openai";
import { getChatModel, resetChatModel } from "../model";

describe("getChatModel", () => {
  beforeEach(() => {
    resetChatModel();
    process.env.ALIBABA_BASE_URL = "https://example.com/v1";
    process.env.ALIBABA_API_KEY = "test-key";
    process.env.MODEL_NAME = "qwen-test";
  });

  it("returns a ChatOpenAI instance configured for OpenAI-compatible API", () => {
    const m = getChatModel();
    expect(m).toBeInstanceOf(ChatOpenAI);
  });

  it("uses baseURL ending at /v1 (not /chat/completions)", () => {
    process.env.ALIBABA_BASE_URL = "https://example.com/v1/chat/completions/";
    resetChatModel();
    const m = getChatModel();
    expect(m).toBeInstanceOf(ChatOpenAI);
  });

  it("is a singleton", () => {
    const a = getChatModel();
    const b = getChatModel();
    expect(a).toBe(b);
  });
});
