import { describe, it, expect } from "vitest";
import { QwenAdapter } from "../qwen-adapter";

const adapter = new QwenAdapter();

describe("QwenAdapter.unwrapToolInput", () => {
  it("parses JSON string wrapped in { input: '<JSON>' }", () => {
    expect(adapter.unwrapToolInput({ input: '{"x":1}' })).toEqual({ x: 1 });
  });

  it("returns object input as-is when already an object", () => {
    expect(adapter.unwrapToolInput({ input: { x: 1 } })).toEqual({ x: 1 });
  });

  it("returns input unchanged when JSON.parse fails", () => {
    const bad = { input: "not json" };
    expect(adapter.unwrapToolInput(bad)).toBe(bad);
  });

  it("returns input unchanged when key is not 'input'", () => {
    const obj = { other: 1 };
    expect(adapter.unwrapToolInput(obj)).toBe(obj);
  });
});

describe("QwenAdapter.extractFinalTextFromEndEvent", () => {
  it("extracts text from data.output.content", () => {
    expect(
      adapter.extractFinalTextFromEndEvent({ output: { content: "hello" } }),
    ).toBe("hello");
  });
});