"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAppAmplify } from "@/contexts/AppAmplifyContext";
import { getAmplifyDataClient } from "@/lib/data/amplify-data-client";
import { NoteCard } from "@/components/notes/NoteCard";
import type { AmplifyNoteRow } from "@/types/note";

type NoteRow = AmplifyNoteRow;

function sortByUpdatedDesc(a: NoteRow, b: NoteRow) {
  const ta = a.updatedAt ?? a.createdAt ?? "";
  const tb = b.updatedAt ?? b.createdAt ?? "";
  return tb.localeCompare(ta);
}

export function NoteList() {
  const { ready, hasBackend, userEmail } = useAppAmplify();
  const [notes, setNotes] = useState<NoteRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!ready || !hasBackend || !userEmail) {
      setNotes([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const client = getAmplifyDataClient();
      const { data, errors } = await client.models.Note.list({ limit: 100 });
      if (errors?.length) {
        setError(errors.map((e) => e.message).join(" / "));
        setNotes([]);
        return;
      }
      const rows = (data ?? []).filter(Boolean) as NoteRow[];
      rows.sort(sortByUpdatedDesc);
      setNotes(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : "一覧の取得に失敗しました");
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }, [ready, hasBackend, userEmail]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!ready) {
    return <p className="text-sm text-zinc-500">読み込み中…</p>;
  }

  if (!hasBackend) {
    return (
      <div className="space-y-2 text-sm text-amber-900">
        <p>
          Amplify 未接続です。{" "}
          <code className="rounded bg-amber-100 px-1">package.json</code>{" "}
          と同じフォルダに、Sandbox が出力した{" "}
          <code className="rounded bg-amber-100 px-1">amplify_outputs.json</code>{" "}
          が必要です（<code className="rounded bg-amber-100 px-1">auth</code> または{" "}
          <code className="rounded bg-amber-100 px-1">data</code> を含む完全なファイル）。
        </p>
        <p className="text-xs text-amber-800/90">
          Sandbox はプロジェクトルートで実行し、初回デプロイが終わるまで待ってから{" "}
          <code className="rounded bg-amber-50 px-1">npm run dev</code> を再起動してください。
          <code className="rounded bg-amber-50 px-1">version</code> だけの JSON
          は無効です。空のファイルがあれば削除して Sandbox に作り直させてください。
        </p>
      </div>
    );
  }

  if (!userEmail) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-6 text-center text-sm text-zinc-600">
        メモ一覧を表示するには
        <Link href="/login" className="mx-1 font-medium text-sky-700 underline">
          ログイン
        </Link>
        してください。
      </div>
    );
  }

  if (loading && notes.length === 0) {
    return <p className="text-sm text-zinc-500">メモを読み込み中…</p>;
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
        {error}
        <button
          type="button"
          onClick={() => void load()}
          className="ml-2 underline"
        >
          再試行
        </button>
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <p className="text-sm text-zinc-600">
        まだメモがありません。「新規」から作成してください。
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {notes.map((n) => (
        <li key={n.id}>
          <NoteCard
            title={previewTitle(n)}
            insightPreview={n.insight ?? undefined}
            status={n.status ?? "new"}
            href={`/notes/${n.id}`}
          />
        </li>
      ))}
    </ul>
  );
}

function previewTitle(n: NoteRow): string {
  const c = n.content?.trim() ?? "";
  if (c.length <= 80) return c || "(無題)";
  return `${c.slice(0, 80)}…`;
}
