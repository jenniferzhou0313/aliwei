export { JARGON_SYSTEM_PROMPT, JARGON_STARTER } from "./jargon";
export { WEEKLY_SYSTEM_PROMPT, WEEKLY_STARTER } from "./weekly";
export { OKR_SYSTEM_PROMPT, OKR_STARTER } from "./okr";
export { REVIEW_SYSTEM_PROMPT, REVIEW_STARTER } from "./review";

// 分层 System Prompt 组装器（周报等多步 agent 用）
export { buildSystemPrompt, buildLayeredPrompt, buildToolPrompt } from "./base";

// 周报多步 agent 的 L3 任务层 prompt
export {
  WEEKLY_EXTRACT_TASK,
  buildWeeklyTransformTask,
  buildWeeklyReviewTask,
  WEEKLY_OUTPUT_TASK,
} from "./weekly";
