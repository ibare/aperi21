/**
 * 자동 생성 파일 — 직접 편집하지 말 것.
 *
 * 생성: pnpm catalog:gen  (scripts/gen-aperi21-catalog.mts)
 * 출처: messages/<locale>.json 파일 목록.
 */

type MessageModule = { default: Record<string, string> };

/** 언어 → 프레임워크 문구 번들. en 은 호출부 리터럴이 원본이라 없다. */
export const MESSAGE_LOADERS: Record<string, () => Promise<MessageModule>> = {
  "ko": () => import('../../../messages/ko.json') as Promise<MessageModule>,
};
