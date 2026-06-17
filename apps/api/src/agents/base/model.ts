import { ChatOpenAI } from "@langchain/openai";

let _model: ChatOpenAI | null = null;

function normalizeBaseUrl(url: string | undefined): string | undefined {
  return url?.replace(/\/chat\/completions\/?$/, "");
}

export function getChatModel(): ChatOpenAI {
  if (!_model) {
    _model = new ChatOpenAI({
      configuration: {
        baseURL: normalizeBaseUrl(process.env.ALIBABA_BASE_URL),
        apiKey: process.env.ALIBABA_API_KEY,
      },
      model: process.env.MODEL_NAME ?? "qwen-plus",
    });
  }
  return _model;
}

export function resetChatModel(): void {
  _model = null;
}
