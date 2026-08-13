import type { CaptionAssistReason } from "@/features/planner/ai/types";

export type AssistFeedback = {
  tone: "success" | "warning" | "error";
  message: string;
};

/** Pure mapping for assist toasts — success only when the model filled fields. */
export function assistFeedbackForResult(data: {
  source?: "ai" | "template";
  reason?: CaptionAssistReason;
}): AssistFeedback {
  if (data.source === "ai") {
    return { tone: "success", message: "Saran AI diisi" };
  }
  if (data.reason === "quota") {
    return { tone: "warning", message: "Saran template (kuota AI habis)" };
  }
  if (data.reason === "unsupported_model") {
    return {
      tone: "warning",
      message: "Saran template (model AI tidak didukung)",
    };
  }
  if (data.reason === "error") {
    return { tone: "warning", message: "Saran template (AI gagal)" };
  }
  if (data.reason === "disabled" || data.reason === "missing_key") {
    return { tone: "warning", message: "Saran template (AI belum aktif)" };
  }
  return { tone: "warning", message: "Saran template diisi" };
}
