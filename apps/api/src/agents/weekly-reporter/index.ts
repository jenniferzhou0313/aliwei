import { streamText, generateText } from "ai";
import { llmClient, MODEL_NAME } from "@/services/llm-client";
import {
  JARGON_DICT,
  formatDictForPrompt,
  buildLayeredPrompt,
  buildWeeklyReviewTask,
  WEEKLY_OUTPUT_TASK,
} from "@aliwei/domain";
import {
  extractFacts,
  aliTransform,
  renderWeeklyReport,
  type ReportBuckets,
} from "./skills";

const MAX_LOOPS = 3; // 严防超时死循环，最多反思 3 次

type StreamWeeklyArgs = {
  /** 已从 UIMessage.parts 抽取出的最后一条用户纯文本（由 chat-service 传入） */
  rawInput: string;
  /** 最终交付文本生成完成后的持久化回调，由 chat-service 注入以复用其入库逻辑 */
  onAssistantFinish?: (text: string) => void;
};

/**
 * 周报多步 agent：
 *   STEP A 抽取核心事实（循环外只抽一次，锁死语义，防反思反向污染）
 *   循环  ：transform → render → review(Critic)
 *   STEP  ：暖心 + 交互规范包装，流式交付
 *
 * 返回标准 Web Response（与 streamChat 一致，routes/chat.ts 直接桥接其 .body）。
 */
export async function streamWeeklyReport(
  args: StreamWeeklyArgs,
): Promise<Response> {
  const { rawInput, onAssistantFinish } = args;

  // 权威黑话白名单：直接复用 domain 现成词典，严禁编造
  const slangDict = formatDictForPrompt(JARGON_DICT);

  // STEP A：核心事实只抽一次
console.log("=== [0.rawInput] ===", JSON.stringify(rawInput));
const extracted = await extractFacts(rawInput);
console.log("=== [1.extract] ===\n", JSON.stringify(extracted, null, 2));  // ← 加这行
const style = extracted.style;

  let finalReport = "";
  let currentReviewNote = "";
  let previousData: ReportBuckets | null = null;

  // Actor-Critic 反思润色循环
  for (let loop = 1; loop <= MAX_LOOPS; loop++) {
    // STEP B：四类分别润色；空类跳过；第 2 轮起以上一轮该类输出为输入，
    // 确保 reviewNote 里点名的词能在输入中命中
    const transformBucket = (current: string[], previous?: string[]) => {
      const input = previous && previous.length > 0 ? previous : current;
      return aliTransform({
        factsArray: input,
        slangDict,
        style,
        reviewNote: currentReviewNote || undefined,
      });
    };

    const finalData: ReportBuckets = {
      work: await transformBucket(extracted.work, previousData?.work),
      plans: await transformBucket(extracted.plans, previousData?.plans),
      difficulties: await transformBucket(
        extracted.difficulties,
        previousData?.difficulties,
      ),
      needs: await transformBucket(extracted.needs, previousData?.needs),
    };
    previousData = finalData;

    // STEP C：套模板渲染
    finalReport = renderWeeklyReport(finalData);
    console.log("=== [2.report] ===\n", finalReport);  // ← 加这行

    // STEP D：Critic —— 冷面校对机器。只给字典 + 判定规则，绝不走 buildLayeredPrompt，
    // 否则 L1 会命令它"每段融入 2-3 个黑话"、L2 又宣称它拥有全套字典，人设层会压过小字典，
    // 导致它无视表、永远挑刺不 PASS。
    const { text: evaluation } = await generateText({
      model: llmClient.chat(MODEL_NAME),
      system: buildWeeklyReviewTask(slangDict),
      prompt: finalReport,
    });

    console.log(`--- 第 ${loop} 轮反思评估：${evaluation.trim()} ---`);

    if (evaluation.trim() === "PASS" || loop === MAX_LOOPS) break;
    currentReviewNote = evaluation.trim();
  }

  // 最终交付：注入交互规范，暖心包装 + 强追问，流式吐出
  const stream = streamText({
    model: llmClient.chat(MODEL_NAME),
    system: buildLayeredPrompt(WEEKLY_OUTPUT_TASK, true),
    messages: [
      {
        role: "user",
        content: `请将这份周报加上交互风格包装后吐出：\n${finalReport}`,
      },
    ],
    // 复用 chat-service 注入的持久化回调，保证周报也正常入库 + 刷新线程
    onFinish: ({ text }) => onAssistantFinish?.(text),
  });

  return stream.toUIMessageStreamResponse();
}
