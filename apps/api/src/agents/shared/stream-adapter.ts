import type { CompiledStateGraph } from "@langchain/langgraph";
import { Command, isGraphInterrupt } from "@langchain/langgraph";

export { Command };

export async function streamGraphToUIMessageStream(
  graph: CompiledStateGraph<any, any, any>,
  input: any,
  threadId: string,
  onFinish?: (text: string) => void | Promise<void>,
): Promise<Response> {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let accumulatedText = "";
      let interrupted = false;
      try {
        const events = graph.streamEvents(input, {
          version: "v2",
          configurable: { thread_id: threadId },
        });
        for await (const event of events) {
          if (event.event === "on_chat_model_stream") {
            const chunk = event.data?.chunk;
            const content = chunk?.content;
            if (typeof content === "string" && content.length > 0) {
              accumulatedText += content;
              controller.enqueue(encoder.encode(`0:${JSON.stringify(content)}\n`));
            } else if (Array.isArray(content)) {
              for (const part of content) {
                if (typeof part === "string" && part.length > 0) {
                  accumulatedText += part;
                  controller.enqueue(encoder.encode(`0:${JSON.stringify(part)}\n`));
                } else if (part?.type === "text" && part.text) {
                  accumulatedText += part.text;
                  controller.enqueue(encoder.encode(`0:${JSON.stringify(part.text)}\n`));
                }
              }
            }
          } else if (event.event === "on_tool_start") {
            const tc = event.data?.input;
            const name = event.name;
            const id = event.run_id;
            controller.enqueue(
              encoder.encode(
                `9:${JSON.stringify({
                  toolCallId: id,
                  toolName: name,
                  input: tc,
                  state: "running",
                })}\n`,
              ),
            );
          } else if (event.event === "on_tool_end") {
            const out = event.data?.output;
            const id = event.run_id;
            controller.enqueue(
              encoder.encode(
                `a:${JSON.stringify({
                  toolCallId: id,
                  output: typeof out === "string" ? out : JSON.stringify(out),
                  state: "done",
                })}\n`,
              ),
            );
          } else if (event.event === "on_tool_error") {
            // GraphInterrupt means ask_user paused the graph — not a real error
            const err = event.data?.error;
            if (isGraphInterrupt(err)) {
              interrupted = true;
              controller.enqueue(
                encoder.encode(
                  `8:${JSON.stringify({ type: "ask_user_pending", interrupts: err.interrupts })}\n`,
                ),
              );
            }
          } else if (event.event === "on_chain_end" && event.name === "LangGraph") {
            if (!interrupted) {
              controller.enqueue(encoder.encode(`e:${JSON.stringify({ finishReason: "stop" })}\n`));
              if (accumulatedText) await onFinish?.(accumulatedText);
            }
          }
        }
      } catch (err) {
        if (isGraphInterrupt(err)) {
          // Already emitted 8: from on_tool_error — nothing more to do
        } else {
          controller.enqueue(
            encoder.encode(
              `e:${JSON.stringify({ finishReason: "error", error: String(err) })}\n`,
            ),
          );
        }
      } finally {
        controller.close();
      }
    },
  });
  return new Response(stream, { headers: { "content-type": "text/event-stream" } });
}
