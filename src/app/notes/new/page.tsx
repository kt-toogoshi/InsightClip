import Link from "next/link";
import { NewNoteForm } from "@/components/notes/NewNoteForm";

export default function CreateNotePage() {
  return (
    <main className="mx-auto flex max-w-lg flex-1 flex-col gap-4 p-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-semibold">新規メモ</h1>
        <Link href="/" className="text-sm text-sky-700 underline">
          一覧へ
        </Link>
      </div>
      <p className="text-sm text-zinc-600">
        テキストまたは URL を入力し、AI 解析後に保存します（最小構成: 画像 OCR
        は未対応）。
      </p>
      <NewNoteForm />
    </main>
  );
}
