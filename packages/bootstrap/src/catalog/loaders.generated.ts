/**
 * 자동 생성 파일 — 직접 편집하지 말 것.
 *
 * 생성: pnpm catalog:gen  (scripts/gen-aperi21-catalog.mts)
 * 출처: messages/<locale>.json 파일 목록.
 */

import type { Aperi21Catalog } from '../catalog-types.js';

/** 언어 → 그 언어 카탈로그 모듈. 경로가 정적 리터럴이어야 번들러가 chunk 로 가른다. */
export const CATALOG_LOADERS: Record<string, () => Promise<{ CATALOG: Aperi21Catalog }>> = {
  "en": () => import('./en.generated.js'),
  "ko": () => import('./ko.generated.js'),
};
