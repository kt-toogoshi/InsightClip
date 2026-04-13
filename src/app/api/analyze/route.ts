import { NextResponse } from "next/server";
import OpenAI from "openai";
import type { AnalyzeRequest, AnalyzeResponse } from "@/types/note";

const MAX_LEN = 5000;

const SYSTEM_PROMPT = `以下の情報を分析してください。
1. 要約（100文字以内）
2. この情報の価値（ユーザーにとっての意味）
3. 推奨アクション
4. カテゴリ（1つ）
出力は簡潔に。

必ず次のJSONオブジェクト形式のみで返答すること（他の文字は含めない）:
{"summary":"文字列","insight":"文字列","action":"文字列","category":"文字列"}`;

function isAnalyzeRequest(body: unknown): body is AnalyzeRequest {
  if (!body || typeof body !== "object") return false;
  const o = body as Record<string, unknown>;
  const t = o.type;
  if (t !== "text" && t !== "url" && t !== "image") return false;
  return typeof o.content === "string";
}

function parseAnalyzeResponse(raw: unknown): AnalyzeResponse | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const summary = o.summary;
  const insight = o.insight;
  const action = o.action;
  const category = o.category;
  if (
    typeof summary !== "string" ||
    typeof insight !== "string" ||
    typeof action !== "string" ||
    typeof category !== "string"
  ) {
    return null;
  }
  return { summary, insight, action, category };
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!isAnalyzeRequest(body)) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (body.type === "image") {
    return NextResponse.json(
      { error: "画像解析はこの最小構成では未対応です（テキストまたはURL文字列のみ）" },
      { status: 501 },
    );
  }

  const content = body.content.trim();
  if (!content) {
    return NextResponse.json({ error: "content が空です" }, { status: 400 });
  }
  if (content.length > MAX_LEN) {
    return NextResponse.json(
      { error: `content は最大 ${MAX_LEN} 文字です` },
      { status: 400 },
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY が設定されていません" },
      { status: 503 },
    );
  }

  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  const openai = new OpenAI({ apiKey });

  const userMessage =
    body.type === "url"
      ? `ユーザーが保存したURLです（本文は取得していません）。URLと短い文脈から推測して分析してください。\n\n${content}`
      : content;

  let completion;
  try {
    completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      response_format: { type: "json_object" },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "OpenAI 呼び出しに失敗しました";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  const rawText = completion.choices[0]?.message?.content;
  if (!rawText) {
    return NextResponse.json({ error: "AI からの応答が空です" }, { status: 502 });
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(rawText) as unknown;
  } catch {
    return NextResponse.json({ error: "AI の応答が JSON として解釈できません" }, { status: 502 });
  }

  const parsed = parseAnalyzeResponse(parsedJson);
  if (!parsed) {
    return NextResponse.json({ error: "AI の応答形式が不正です" }, { status: 502 });
  }

  const out: AnalyzeResponse = parsed;
  return NextResponse.json(out);
}
