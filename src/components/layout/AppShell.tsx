"use client";

import Link from "next/link";
import { useAppAmplify } from "@/contexts/AppAmplifyContext";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { ready, hasBackend, userEmail, signOutUser } = useAppAmplify();

  return (
    <div className="flex min-h-full flex-col bg-zinc-50 font-sans text-zinc-900">
      <header className="border-b border-zinc-200 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <Link href="/" className="text-lg font-semibold text-zinc-900">
            InsightClip
          </Link>
          <div className="flex items-center gap-3 text-sm">
            {!ready ? (
              <span className="text-zinc-400">読み込み中…</span>
            ) : !hasBackend ? (
              <span
                className="text-amber-700"
                title="ルートに auth/data を含む amplify_outputs.json が必要です（Sandbox 完了後のファイル）"
              >
                未接続
              </span>
            ) : userEmail ? (
              <>
                <span className="hidden max-w-[12rem] truncate text-zinc-600 sm:inline">
                  {userEmail}
                </span>
                <button
                  type="button"
                  onClick={() => void signOutUser()}
                  className="rounded-lg border border-zinc-300 px-3 py-1.5 text-zinc-700 hover:bg-zinc-50"
                >
                  ログアウト
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="rounded-lg bg-sky-600 px-3 py-1.5 font-medium text-white hover:bg-sky-700"
              >
                ログイン
              </Link>
            )}
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
