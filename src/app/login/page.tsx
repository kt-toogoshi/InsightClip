"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  confirmSignUp,
  signIn,
  signUp,
} from "aws-amplify/auth";
import { useAppAmplify } from "@/contexts/AppAmplifyContext";

export default function LoginPage() {
  const router = useRouter();
  const { ready, hasBackend, refreshUser } = useAppAmplify();
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [needsConfirm, setNeedsConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signIn({ username: email.trim(), password });
      await refreshUser();
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "サインインに失敗しました");
    } finally {
      setLoading(false);
    }
  }

  async function onSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signUp({
        username: email.trim(),
        password,
        options: {
          userAttributes: { email: email.trim() },
        },
      });
      setNeedsConfirm(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "サインアップに失敗しました");
    } finally {
      setLoading(false);
    }
  }

  async function onConfirm(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await confirmSignUp({
        username: email.trim(),
        confirmationCode: code.trim(),
      });
      setNeedsConfirm(false);
      setMode("signIn");
    } catch (err) {
      setError(err instanceof Error ? err.message : "確認に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  if (!ready) {
    return (
      <main className="mx-auto max-w-md p-6 text-sm text-zinc-600">読み込み中…</main>
    );
  }

  if (!hasBackend) {
    return (
      <main className="mx-auto max-w-md p-6 text-sm text-amber-800">
        Amplify が未設定です。`npx ampx sandbox` で{" "}
        <code className="rounded bg-amber-100 px-1">amplify_outputs.json</code>{" "}
        を生成してください。
        <p className="mt-4">
          <Link href="/" className="text-sky-700 underline">
            トップへ
          </Link>
        </p>
      </main>
    );
  }

  if (needsConfirm) {
    return (
      <main className="mx-auto flex max-w-md flex-col gap-4 p-6">
        <h1 className="text-xl font-semibold">メール確認</h1>
        <p className="text-sm text-zinc-600">
          届いた確認コードを入力してください。
        </p>
        <form onSubmit={onConfirm} className="flex flex-col gap-3">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="確認コード"
            className="rounded-lg border border-zinc-300 px-3 py-2"
            autoComplete="one-time-code"
            required
          />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-sky-600 py-2 font-medium text-white hover:bg-sky-700 disabled:opacity-50"
          >
            確認する
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 p-6">
      <h1 className="text-xl font-semibold">ログイン</h1>
      <div className="flex gap-2 text-sm">
        <button
          type="button"
          onClick={() => {
            setMode("signIn");
            setError(null);
          }}
          className={`rounded-full px-3 py-1 ${mode === "signIn" ? "bg-zinc-900 text-white" : "bg-zinc-100"}`}
        >
          サインイン
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("signUp");
            setError(null);
          }}
          className={`rounded-full px-3 py-1 ${mode === "signUp" ? "bg-zinc-900 text-white" : "bg-zinc-100"}`}
        >
          アカウント作成
        </button>
      </div>
      <form
        onSubmit={mode === "signIn" ? onSignIn : onSignUp}
        className="flex flex-col gap-3"
      >
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="メールアドレス"
          className="rounded-lg border border-zinc-300 px-3 py-2"
          autoComplete="email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="パスワード（8文字以上）"
          className="rounded-lg border border-zinc-300 px-3 py-2"
          autoComplete={mode === "signIn" ? "current-password" : "new-password"}
          minLength={8}
          required
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-sky-600 py-2 font-medium text-white hover:bg-sky-700 disabled:opacity-50"
        >
          {mode === "signIn" ? "ログイン" : "登録する"}
        </button>
      </form>
      <Link href="/" className="text-center text-sm text-sky-700 underline">
        トップへ戻る
      </Link>
    </main>
  );
}
