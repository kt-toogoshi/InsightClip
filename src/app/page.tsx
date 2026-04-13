import Link from "next/link";
import { PcInputBar } from "@/components/input/PcInputBar";
import { NoteList } from "@/components/notes/NoteList";

export default function Home() {
  return (
    <>
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 p-4 pb-24 sm:pb-4">
        <div className="flex flex-col gap-3 border-b border-zinc-200 pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-700">メモ一覧</p>
            <p className="text-xs text-zinc-500">保存済みは最新順に表示されます</p>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <div className="hidden w-full min-w-[16rem] sm:block">
              <PcInputBar />
            </div>
            <Link
              href="/notes/new"
              className="inline-flex justify-center rounded-full bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
            >
              新規メモ
            </Link>
          </div>
        </div>
        <NoteList />
      </main>
      <Link
        href="/notes/new"
        className="fixed bottom-5 right-5 flex h-14 w-14 items-center justify-center rounded-full bg-sky-600 text-2xl font-light text-white shadow-lg hover:bg-sky-700 sm:hidden"
        aria-label="新規メモ"
      >
        +
      </Link>
    </>
  );
}
