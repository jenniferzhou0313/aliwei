"use client";

import type { FC } from "react";
import { apiFetch } from "@/client/lib/api";

type Props = {
  question: string;
  options: string[];
  threadId: string;
  toolCallId: string;
  toolId?: string;
  onSelect: (selected: string) => void;
};

export const AskUserCard: FC<Props> = ({ question, options, threadId, toolCallId, toolId = "jargon", onSelect }) => {
  const handle = async (selected: string) => {
    onSelect(selected);
    await apiFetch("/chat/continue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ threadId, toolCallId, answer: selected, toolId }),
    });
  };

  return (
    <div className="my-2 rounded-lg border bg-muted/40 p-3">
      <div className="mb-2 text-sm font-medium">{question}</div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => handle(opt)}
            className="rounded-md border bg-card px-3 py-1.5 text-sm hover:bg-accent"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};
