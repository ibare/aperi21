/**
 * 자동 생성 파일 — 직접 편집하지 말 것.
 *
 * 생성: pnpm catalog:gen  (scripts/gen-aperi21-catalog.mts)
 * 출처: 각 sim 의 schema(label/operation/category) + registerAperi21Bundles 의 loader id.
 *
 * 이 배열은 순수 데이터라 sim 의 무거운 시각화 chunk 를 참조하지 않는다.
 * 따라서 호스트는 이 카탈로그를 읽어도 sim 모듈을 로드하지 않는다 (lazy 보존).
 */

import type { Aperi21CatalogEntry } from './catalog-types.js';

export const APERI21_CATALOG: readonly Aperi21CatalogEntry[] = [
  {"id":"aperi21:dc-circuit","title":{"ko":"DC 회로","en":"DC Circuit"},"description":{"ko":"배터리·저항으로 단순·직렬·병렬 회로를 구성해 전압·전류를 확인.","en":"Build simple/series/parallel DC circuits with batteries and resistors; inspect V/I."},"domain":"electromagnetism"},
  {"id":"aperi21:projectile","title":{"ko":"발사체","en":"Projectile"},"description":{"ko":"각도 다이얼 + 핀볼 런처","en":"Angle dial + pinball launcher"},"domain":"mechanics"},
  {"id":"aperi21:ray-tracing","title":{"ko":"광선 추적","en":"Ray Tracing"},"description":{"ko":"광원과 렌즈·거울을 배치해 광선 경로와 결상을 관찰.","en":"Place source and lens/mirror to watch ray paths and image formation."},"domain":"optics"},
];
