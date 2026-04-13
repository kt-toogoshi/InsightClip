import Link from "next/link";

/** PC 向けショートカット（詳細な D&D / Ctrl+V は今後） */
export function PcInputBar() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
      <span className="text-xs sm:text-sm">
        URL · テキスト · 画像（最小構成では新規画面から）
      </span>
      <Link
        href="/notes/new"
        className="shrink-0 rounded-md bg-white px-2 py-1 text-xs font-medium text-sky-700 ring-1 ring-zinc-200 hover:bg-sky-50"
      >
        入力へ
      </Link>
    </div>
  );
}
