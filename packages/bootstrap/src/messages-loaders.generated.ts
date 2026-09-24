/**
 * 자동 생성 파일 — 직접 편집하지 말 것.
 *
 * 생성: pnpm catalog:gen  (scripts/gen-aperi21-catalog.mts)
 * 출처: messages/<locale>.json 파일 목록.
 */

type MessageModule = { default: Record<string, string> };

/** 언어 → 프레임워크 문구 번들. en 은 호출부 리터럴이 원본이라 없다. */
export const MESSAGE_LOADERS: Record<string, () => Promise<MessageModule>> = {
  "ar": () => import('../../../messages/ar.json') as Promise<MessageModule>,
  "es": () => import('../../../messages/es.json') as Promise<MessageModule>,
  "fr": () => import('../../../messages/fr.json') as Promise<MessageModule>,
  "hi": () => import('../../../messages/hi.json') as Promise<MessageModule>,
  "id": () => import('../../../messages/id.json') as Promise<MessageModule>,
  "ja": () => import('../../../messages/ja.json') as Promise<MessageModule>,
  "ko": () => import('../../../messages/ko.json') as Promise<MessageModule>,
  "pt": () => import('../../../messages/pt.json') as Promise<MessageModule>,
  "zh": () => import('../../../messages/zh.json') as Promise<MessageModule>,
};
