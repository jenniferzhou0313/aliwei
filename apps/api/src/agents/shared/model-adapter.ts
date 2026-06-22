/**
 * Adapter contract for model-specific quirks. Stream-adapter calls
 * these methods to get the "LangChain-expected shape" regardless of
 * whether the underlying chat model is Qwen / Aliyun OpenAI-compat,
 * standard OpenAI, or a test mock.
 */
export interface ModelAdapter {
  /**
   * Unwrap tool_call args shaped like { input: "<JSON string>" } (Qwen /
   * Aliyun OpenAI-compat) into the actual schema-shaped object LangChain
   * tool wrappers expect. Returns the input unchanged for standard OpenAI.
   */
  unwrapToolInput(raw: unknown): unknown;

  /**
   * Pull the final text out of a langchain on_chat_model_end event payload,
   * since non-streaming providers (Qwen / Aliyun) sometimes return the full
   * response in one shot. The payload shape varies; pass the whole event.data.
   * Returns "" if no usable text is found.
   */
  extractFinalTextFromEndEvent(data: unknown): string;
}