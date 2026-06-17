import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AskUserCard } from "../ask-user-card";

describe("AskUserCard", () => {
  it("renders question and option buttons", () => {
    const onSelect = vi.fn();
    render(
      <AskUserCard
        question="详细还是简略?"
        options={["详细", "简略"]}
        threadId="t-1"
        toolCallId="c-1"
        onSelect={onSelect}
      />,
    );
    expect(screen.getByText("详细还是简略?")).toBeDefined();
    const btn = screen.getByText("详细") as HTMLButtonElement;
    fireEvent.click(btn);
    expect(onSelect).toHaveBeenCalledWith("详细");
  });
});
