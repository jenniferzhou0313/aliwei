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

  it("concatenates multiple text parts in array content (preserves pre-refactor behavior)", () => {
    const data = {
      output: {
        content: [
          { type: "text", text: "hello " },
          { type: "text", text: "world" },
        ],
      },
    };
    expect(adapter.extractFinalTextFromEndEvent(data)).toBe("hello world");
  });

  it("skips non-text parts in mixed content arrays", () => {
    const data = {
      output: {
        content: [
          { type: "text", text: "a" },
          { type: "image", url: "x" },
          { type: "text", text: "b" },
        ],
      },
    };
    expect(adapter.extractFinalTextFromEndEvent(data)).toBe("ab");
  });

  it("extracts text from data.output.generations[0][0].message.content", () => {
    const data = {
      output: {
        generations: [
          [
            {
              message: { content: "from generations path" },
            },
          ],
        ],
      },
    };
    expect(adapter.extractFinalTextFromEndEvent(data)).toBe(
      "from generations path",
    );
  });

  it("falls back to top-level text field", () => {
    expect(adapter.extractFinalTextFromEndEvent({ text: "top-level" })).toBe(
      "top-level",
    );
  });
});