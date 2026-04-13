import Link from "next/link";
import type { NoteStatus } from "@/types/note";

type Props = {
  title: string;
  insightPreview?: string;
  status: NoteStatus;
  href: string;
};

const statusLabel: Record<NoteStatus, string> = {
  new: "未処理",
  later: "あとで見る",
  done: "処理済み",
};

const statusClass: Record<NoteStatus, string> = {
  new: "bg-zinc-100 text-zinc-600",
  later: "bg-amber-100 text-amber-900",
  done: "bg-emerald-100 text-emerald-800",
};

/** 一覧のカード（MVP: カード形式・最新順は親でソート） */
export function NoteCard({ title, insightPreview, status, href }: Props) {
  return (
    <Link
      href={href}
      className="block rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-sky-300"
    >
      <div className="flex items-start justify-between gap-2">
        <h2 className="font-medium text-zinc-900">{title}</h2>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${statusClass[status]}`}
        >
          {statusLabel[status]}
        </span>
      </div>
      {insightPreview ? (
        <p className="mt-2 line-clamp-2 text-sm text-sky-800">{insightPreview}</p>
      ) : null}
    </Link>
  );
}
