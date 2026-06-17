import type { Tool } from "./types";
import {
  JARGON_STARTER,
  JARGON_SYSTEM_PROMPT,
  OKR_STARTER,
  OKR_SYSTEM_PROMPT,
  REVIEW_STARTER,
  REVIEW_SYSTEM_PROMPT,
  WEEKLY_STARTER,
  WEEKLY_SYSTEM_PROMPT,
} from "./prompts";

export const TOOLS: Tool[] = [
  {
    id: "jargon",
    icon: "/icons/jargon.svg",
    label: "黑话翻译器",
    systemPrompt: JARGON_SYSTEM_PROMPT,
    starter: JARGON_STARTER,
  },
  {
    id: "weekly",
    icon: "/icons/weekly.svg",
    label: "周报助手",
    systemPrompt: WEEKLY_SYSTEM_PROMPT,
    starter: WEEKLY_STARTER,
  },
  {
    id: "okr",
    icon: "/icons/okr.svg",
    label: "OKR 助手",
    systemPrompt: OKR_SYSTEM_PROMPT,
    starter: OKR_STARTER,
  },
  {
    id: "review",
    icon: "/icons/review.svg",
    label: "复盘助手",
    systemPrompt: REVIEW_SYSTEM_PROMPT,
    starter: REVIEW_STARTER,
  },
];

export function findTool(toolId: string | null | undefined): Tool | null {
  if (!toolId) return null;
  return TOOLS.find((t) => t.id === toolId) ?? null;
}
