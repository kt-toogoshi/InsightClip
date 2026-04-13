import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";

function hasAmplifyPayload(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const o = value as Record<string, unknown>;
  return Boolean(o.auth ?? o.data ?? o.custom);
}

/** ルートの amplify_outputs.json を返す（未生成・中身不足時は 404） */
export async function GET() {
  try {
    const path = join(process.cwd(), "amplify_outputs.json");
    const raw = await readFile(path, "utf-8");
    const parsed: unknown = JSON.parse(raw);
    if (!hasAmplifyPayload(parsed)) {
      return new NextResponse(null, { status: 404 });
    }
    return NextResponse.json(parsed);
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
