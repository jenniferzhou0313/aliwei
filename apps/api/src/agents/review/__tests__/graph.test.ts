import { describe, it, expect, beforeEach } from "vitest";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { FakeListChatModel } from "@langchain/core/utils/testing";
import { createReviewGraph } from "../graph";
import { resetCheckpointer } from "../../base/checkpointer";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

beforeEach(() => {
  process.env.CHECKPOINTER_DB_PATH = path.join(os.tmpdir(), `aliwei-test-review-${crypto.randomUUID()}.db`);
  if (fs.existsSync(process.env.CHECKPOINTER_DB_PATH)) fs.unlinkSync(process.env.CHECKPOINTER_DB_PATH);
  resetCheckpointer();
});

async function invokeReview(input: string, response: string) {
  const fake = new FakeListChatModel({
    responses: [new AIMessage(response) as any],
  });
  const graph = createReviewGraph(fake as any);
  const threadId = `t-review-${crypto.randomUUID()}`;

  return (await graph.invoke(
    { messages: [new HumanMessage(input)], threadId, agentId: "review" } as any,
    { configurable: { thread_id: threadId } },
  )) as any;
}

describe("review graph", () => {
  it("can return minimal guidance for a generic review request", async () => {
    const result = await invokeReview(
      "帮我做复盘",
      "可以。先补充 4 个关键信息：复盘对象是什么？原目标是什么？实际结果如何？主要问题或偏差是什么？框架可先不选，我会按内容自动整理。",
    );

    const reply = (result.messages.at(-1) as AIMessage).content as string;
    expect(reply).toContain("复盘对象");
    expect(reply).toContain("原目标");
    expect(reply).toContain("实际结果");
    expect(reply).not.toContain("STAR 框架还是 PDCA 框架");
  });

  it("can return a structured review for a detailed request", async () => {
    const result = await invokeReview(
      "复盘一次需求上线：目标是本周发布搜索筛选，实际延期两天，完成核心功能，问题是联调开始太晚，原因是接口变更没有提前同步，后续要提前锁定接口。",
      "一、背景与目标\n本次复盘对象为搜索筛选需求上线，原目标是本周发布。\n\n二、实际结果\n核心功能已完成，但上线延期两天。\n\n三、做得好的地方\n核心功能交付完成。\n\n四、问题与原因\n问题是联调开始太晚；初步原因是接口变更没有提前同步。\n\n五、经验沉淀\n跨端依赖需要提前对齐接口变更。\n\n六、后续行动\n| 行动项 | 负责人 | 截止时间 | 验收标准 |\n| 提前锁定接口并同步变更 | 待补充 | 待补充 | 联调前完成确认 |",
    );

    const reply = (result.messages.at(-1) as AIMessage).content as string;
    expect(reply).toContain("一、背景与目标");
    expect(reply).toContain("二、实际结果");
    expect(reply).toContain("六、后续行动");
    expect(reply).toContain("待补充");
  });

  it("can evaluate and polish an existing review", async () => {
    const result = await invokeReview(
      "帮我润色这段复盘：这次活动整体还行，但是流量不好，下次继续努力。",
      "先看现有复盘：\n- 目标是否清楚：不清楚，需要补充活动目标。\n- 结果是否具体：不具体，流量结果缺少数据。\n- 原因分析是否到位：不到位，需要说明流量不好的原因。\n- 经验沉淀是否可复用：不足。\n- 行动项是否明确、可执行、有负责人或时间：不足。\n\n优化版：\n一、背景与目标\n本次复盘对象为活动复盘，活动目标待补充。\n\n二、实际结果\n整体执行完成，流量表现未达预期，具体数据待补充。\n\n三、做得好的地方\n待补充。\n\n四、问题与原因\n主要问题是流量表现不好，初步原因待补充。\n\n五、经验沉淀\n活动前需要明确流量目标、渠道策略和监控口径。\n\n六、后续行动\n| 行动项 | 负责人 | 截止时间 | 验收标准 |\n| 复盘流量渠道表现并形成改进方案 | 待补充 | 待补充 | 输出渠道问题和下次投放策略 |",
    );

    const reply = (result.messages.at(-1) as AIMessage).content as string;
    expect(reply).toContain("目标是否清楚");
    expect(reply).toContain("原因分析是否到位");
    expect(reply).toContain("优化版");
    expect(reply).toContain("待补充");
  });
});
