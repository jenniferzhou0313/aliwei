import type { ModelAdapter } from "./model-adapter";

export class QwenAdapter implements ModelAdapter {
  unwrapToolInput(raw: unknown): unknown {
    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      const keys = Object.keys(raw as object);
      if (keys.length === 1 && keys[0] === "input") {
        const inner = (raw as Record<string, unknown>).input;
        if (typeof inner === "string") {
          try {
            return JSON.parse(inner);
          } catch {
            return raw;
          }
        }
        return inner;
      }
    }
    return raw;
  }

  extractFinalTextFromEndEvent(data: unknown): string {
    if (!data) return "";
    const candidates: unknown[] = [
      (data as any).output?.content,
      (data as any).output?.text,
      (data as any).output?.generations?.[0]?.[0]?.message?.content,
      (data as any).output?.generations?.[0]?.[0]?.text,
      (data as any).message?.content,
      (data as any).text,
    ];
    for (const c of candidates) {
      const text = firstTextOf(c);
      if (text) return text;
    }
    return "";
  }
}

function firstTextOf(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    for (const part of content) {
      if (typeof part === "string" && part.length > 0) return part;
      if (part && typeof part === "object" && (part as any).type === "text") {
        const t = (part as any).text;
        if (typeof t === "string" && t.length > 0) return t;
      }
    }
  }
  return "";
}