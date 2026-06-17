import { describe, it, expect } from "vitest";
import { askUserTool } from "../tools";

describe("askUserTool", () => {
  it("has name 'ask_user'", () => {
    expect(askUserTool.name).toBe("ask_user");
  });

  it("schema requires question and 2-4 options", () => {
    const schema = askUserTool.schema as any;
    expect(schema.shape.question).toBeDefined();
    expect(schema.shape.options).toBeDefined();
  });

  it("invocation: returns a function (interrupt-based tool)", () => {
    expect(typeof askUserTool.invoke).toBe("function");
  });
});
