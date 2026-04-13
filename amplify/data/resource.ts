import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

/**
 * InsightClip メモ（仕様書 v1.1 の Notes テーブル相当）
 * 所有者のみ CRUD（ゲスト公開はしない）
 */
const schema = a.schema({
  Note: a
    .model({
      inputType: a.enum(['text', 'url', 'image']),
      content: a.string().required(),
      imageUrl: a.string(),
      summary: a.string(),
      insight: a.string(),
      action: a.string(),
      category: a.string(),
      status: a.enum(['new', 'later', 'done']),
    })
    .authorization((allow) => [allow.owner()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
