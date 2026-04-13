/** 仕様書に基づくメモの入出力型（API / UI 共通の論理モデル） */
export type NoteInputType = "text" | "url" | "image";

export type NoteStatus = "new" | "later" | "done";

export type AnalyzeRequest =
  | { type: "text"; content: string }
  | { type: "url"; content: string }
  | { type: "image"; content: string };

export type AnalyzeResponse = {
  summary: string;
  insight: string;
  action: string;
  category: string;
};

export type NoteRecord = {
  id: string;
  userId: string;
  inputType: NoteInputType;
  content: string;
  imageUrl?: string;
  summary?: string;
  insight?: string;
  action?: string;
  category?: string;
  status: NoteStatus;
  createdAt: string;
  updatedAt: string;
};

/** Amplify Data の list / get が返す行（null 許容は実行時に合わせる） */
export type AmplifyNoteRow = {
  id: string;
  owner?: string | null;
  inputType?: NoteInputType | null;
  content?: string | null;
  imageUrl?: string | null;
  summary?: string | null;
  insight?: string | null;
  action?: string | null;
  category?: string | null;
  status?: NoteStatus | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};
