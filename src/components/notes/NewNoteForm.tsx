"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppAmplify } from "@/contexts/AppAmplifyContext";
import { getAmplifyDataClient } from "@/lib/data/amplify-data-client";
import type { AnalyzeResponse } from "@/types/note";

type InputKind = "text" | "url";

export function NewNoteForm() {
  const router = useRouter();
  const { ready, hasBackend, userEmail } = useAppAmplify();
  const [kind, setKind] = useState<InputKind>("text");
  const [content, setContent] = useState("");
  const [analyzed, setAnalyzed] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"analyze" | "save" | null>(null);

  async function runAnalyze() {
    setError(null);
    setBusy("analyze");
    setAnalyzed(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: kind, content }),
      });
      const json = (await res.json()) as AnalyzeResponse & { error?: string };
      if (!res.ok) {
        setError(json.error ?? "解析に失敗しました");
        return;
      }
      setAnalyzed({
        summary: json.summary,
        insight: json.insight,
        action: json.action,
        category: json.category,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "解析に失敗しました");
    } finally {
      setBusy(null);
    }
  }

  async function runSave() {
    if (!analyzed) return;
    setError(null);
    setBusy("save");
    try {
      const client = getAmplifyDataClient();
      const { data, errors } = await client.models.Note.create({
        inputType: kind,
        content: content.trim(),
        summary: analyzed.summary,
        insight: analyzed.insight,
        action: analyzed.action,
        category: analyzed.category,
        status: "new",
      });
      if (errors?.length) {
        setError(errors.map((e) => e.message).join(" / "));
        return;
      }
      if (!data?.id) {
        setError("保存に失敗しました");
        return;
      }
      router.push(`/notes/${data.id}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存に失敗しました");
    } finally {
      setBusy(null);
    }
  }

  if (!ready) {
    return <p className="text-sm text-zinc-500">読み込み中…</p>;
  }

  if (!hasBackend) {
    return (
      <p className="text-sm text-amber-800">
        Amplify 未接続です。先に Sandbox を起動してください。
      </p>
    );
  }

  if (!userEmail) {
    return (
      <p className="text-sm text-zinc-600">
        <Link href="/login" className="font-medium text-sky-700 underline">
          ログイン
        </Link>
        が必要です。
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 text-sm">
        <button
          type="button"
          onClick={() => {
            setKind("text");
            setAnalyzed(null);
          }}
          className={`rounded-full px-3 py-1 ${kind === "text" ? "bg-zinc-900 text-white" : "bg-zinc-100"}`}
        >
          テキスト
        </button>
        <button
          type="button"
          onClick={() => {
            setKind("url");
            setAnalyzed(null);
          }}
          className={`rounded-full px-3 py-1 ${kind === "url" ? "bg-zinc-900 text-white" : "bg-zinc-100"}`}
        >
          URL（文字列のみ）
        </button>
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        maxLength={5000}
        rows={8}
        placeholder={
          kind === "text"
            ? "メモしたい内容を貼り付け（最大5000文字）"
            : "https://… の URL を入力（ページ本文の取得は未実装。URL文字列からAIが推測します）"
        }
        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
      />
      <p className="text-xs text-zinc-500">{content.length} / 5000 文字</p>

      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy !== null || !content.trim()}
          onClick={() => void runAnalyze()}
          className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50"
        >
          {busy === "analyze" ? "解析中…" : "AI で解析"}
        </button>
      </div>

      {analyzed ? (
        <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 text-sm shadow-sm">
          <div>
            <p className="text-xs font-medium text-zinc-500">Insight</p>
            <p className="text-base font-medium text-sky-800">{analyzed.insight}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-zinc-500">要約</p>
            <p className="text-zinc-800">{analyzed.summary}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-zinc-500">アクション</p>
            <p className="text-zinc-800">{analyzed.action}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-zinc-500">カテゴリ</p>
            <p className="text-zinc-800">{analyzed.category}</p>
          </div>
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => void runSave()}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {busy === "save" ? "保存中…" : "この内容で保存"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
