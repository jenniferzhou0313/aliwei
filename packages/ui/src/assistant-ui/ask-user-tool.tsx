"use client";

import { useRef } from "react";
import { ChevronRightIcon, CheckIcon } from "lucide-react";
import type { ToolCallMessagePartComponent } from "@assistant-ui/react";
import { cn } from "../cn";

type AskUserArgs = {
  question: string;
  options: string[];
};

type AskUserResult = {
  selected: string;
  index: number;
};

export const AskUserTool: ToolCallMessagePartComponent<
  AskUserArgs,
  AskUserResult
> = ({ args, result, status, addResult }) => {
  const submittedRef = useRef(false);
  const isComplete = status?.type === "complete";
  const isPartial =
    !args?.question || !Array.isArray(args.options) || args.options.length < 2;

  if (isPartial) return null;

  const submitted = isComplete && result;

  const handleSelect = (idx: number) => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    addResult({ selected: args.options[idx], index: idx });
  };

  return (
    <div className="bg-background my-2 overflow-hidden rounded-xl border shadow-sm">
      <div className="bg-muted/30 px-4 py-3 text-sm font-medium">
        {args.question}
      </div>
      {submitted ? (
        <div className="text-muted-foreground flex items-center gap-1.5 px-4 py-2.5 text-sm">
          <CheckIcon className="size-4" />
          <span>{result.selected}</span>
        </div>
      ) : (
        <ul className="divide-y">
          {args.options.map((opt, idx) => (
            <li key={idx}>
              <button
                type="button"
                onClick={() => handleSelect(idx)}
                disabled={submittedRef.current}
                className={cn(
                  "flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors",
                  "hover:bg-accent focus-visible:bg-accent focus-visible:outline-none",
                  "disabled:cursor-default disabled:opacity-100 disabled:hover:bg-transparent",
                )}
              >
                <span className="border-border text-muted-foreground flex size-6 shrink-0 items-center justify-center rounded-md border text-xs font-medium">
                  {idx + 1}
                </span>
                <span className="flex-1">{opt}</span>
                <ChevronRightIcon className="text-muted-foreground size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
