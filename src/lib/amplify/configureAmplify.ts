"use client";

import { Amplify } from "aws-amplify";

let configured = false;

function isAmplifyOutputs(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const o = value as Record<string, unknown>;
  return Boolean(o.auth ?? o.data ?? o.custom);
}

/**
 * サーバーがルートの amplify_outputs.json を読める場合のみ設定します。
 * 先に `npx ampx sandbox` 等でファイルを生成してください。
 * @returns 設定に成功したか
 */
export async function configureAmplify(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (configured) return true;
  try {
    const res = await fetch("/api/config/amplify", { cache: "no-store" });
    if (!res.ok) return false;
    const outputs = await res.json();
    if (isAmplifyOutputs(outputs)) {
      Amplify.configure(outputs);
      configured = true;
      return true;
    }
  } catch {
    // バックエンド未接続でも画面は表示する
  }
  return false;
}
