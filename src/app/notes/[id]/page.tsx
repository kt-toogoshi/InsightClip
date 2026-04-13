import Link from "next/link";
import { NoteDetailClient } from "@/components/notes/NoteDetailClient";

type Props = { params: Promise<{ id: string }> };

export default async function NoteDetailPage({ params }: Props) {
  const { id } = await params;
  return (
    <main className="mx-auto flex max-w-lg flex-1 flex-col gap-4 p-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-semibold">メモ詳細</h1>
        <Link href="/" className="text-sm text-sky-700 underline">
          一覧へ
        </Link>
      </div>
      <NoteDetailClient id={id} />
    </main>
  );
}
