"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAppAmplify } from "@/contexts/AppAmplifyContext";
import { getAmplifyDataClient } from "@/lib/data/amplify-data-client";
import type { AmplifyNoteRow, NoteStatus } from "@/types/note";

type NoteRow = AmplifyNoteRow;

const statusLabel: Record<NoteStatus, string> = {
  new: "未処理",
  later: "あとで見る",
  done: "処理済み",
};

function statusChipClass(s: NoteStatus): string {
  switch (s) {
    case "new":
      return "bg-zinc-100 text-zinc-700";
    case "later":
      return "bg-amber-100 text-amber-900";
    case "done":
      return "bg-emerald-100 text-emerald-900";
    default:
      return "bg-zinc-100 text-zinc-700";
  }
}

export function NoteDetailClient({ id }: { id: string }) {
  const { ready, hasBackend, userEmail } = useAppAmplify();
  const [note, setNote] = useState<NoteRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!ready || !hasBackend || !userEmail) {
      setNote(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const client = getAmplifyDataClient();
      const { data, errors } = await client.models.Note.get({ id });
      if (errors?.length) {
        setError(errors.map((e) => e.message).join(" / "));
        setNote(null);
        return;
      }
      setNote((data ?? null) as NoteRow | null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "読み込みに失敗しました");
      setNote(null);
    } finally {
      setLoading(false);
    }
  }, [ready, hasBackend, userEmail, id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function setStatus(next: NoteStatus) {
    if (!note?.id) return;
    setSaving(true);
    setError(null);
    try {
      const client = getAmplifyDataClient();
      const { data, errors } = await client.models.Note.update({
        id: note.id,
        status: next,
      });
      if (errors?.length) {
        setError(errors.map((e) => e.message).join(" / "));
        return;
      }
      if (data) setNote(data as NoteRow);
    } catch (e) {
      setError(e instanceof Error ? e.message : "更新に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  if (!ready || loading) {
    return <p className="text-sm text-zinc-500">読み込み中…</p>;
  }

  if (!hasBackend) {
    return (
      <p className="text-sm text-amber-800">Amplify 未接続です。</p>
    );
  }

  if (!userEmail) {
    return (
      <p className="text-sm text-zinc-600">
        <Link href="/login" className="text-sky-700 underline">
          ログイン
        </Link>
        が必要です。
      </p>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
        {error}
        <button type="button" onClick={() => void load()} className="ml-2 underline">
          再試行
        </button>
      </div>
    );
  }

  if (!note) {
    return <p className="text-sm text-zinc-600">メモが見つかりません。</p>;
  }

  const st = (note.status ?? "new") as NoteStatus;

  return (
    <article className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusChipClass(st)}`}
        >
          {statusLabel[st]}
        </span>
        <span className="text-xs text-zinc-500">
          更新: {note.updatedAt ?? "—"}
        </span>
      </div>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wide text-sky-700">
          Insight
        </h2>
        <p className="mt-1 text-lg font-semibold leading-snug text-sky-900">
          {note.insight ?? "—"}
        </p>
      </section>

      <section>
        <h2 className="text-xs font-semibold text-zinc-500">要約</h2>
        <p className="mt-1 text-sm text-zinc-800">{note.summary ?? "—"}</p>
      </section>

      <section>
        <h2 className="text-xs font-semibold text-zinc-500">元データ</h2>
        <p className="mt-1 whitespace-pre-wrap break-all text-sm text-zinc-800">
          {note.content}
        </p>
        {note.imageUrl ? (
          <p className="mt-2 text-sm text-zinc-600">画像: {note.imageUrl}</p>
        ) : null}
      </section>

      <section>
        <h2 className="text-xs font-semibold text-zinc-500">アクション</h2>
        <p className="mt-1 text-sm text-zinc-800">{note.action ?? "—"}</p>
      </section>

      <section>
        <h2 className="text-xs font-semibold text-zinc-500">カテゴリ</h2>
        <p className="mt-1 text-sm text-zinc-800">{note.category ?? "—"}</p>
      </section>

      <section>
        <h2 className="text-xs font-semibold text-zinc-500">作成日時</h2>
        <p className="mt-1 text-sm text-zinc-800">{note.createdAt ?? "—"}</p>
      </section>

      <div className="flex flex-wrap gap-2 border-t border-zinc-200 pt-4">
        <button
          type="button"
          disabled={saving || st === "later"}
          onClick={() => void setStatus("later")}
          className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-40"
        >
          あとで見る
        </button>
        <button
          type="button"
          disabled={saving || st === "done"}
          onClick={() => void setStatus("done")}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-40"
        >
          処理済みにする
        </button>
        <button
          type="button"
          disabled={saving || st === "new"}
          onClick={() => void setStatus("new")}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 disabled:opacity-40"
        >
          未処理に戻す
        </button>
      </div>
    </article>
  );
}
