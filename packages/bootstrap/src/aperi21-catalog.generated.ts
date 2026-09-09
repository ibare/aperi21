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
  {"id":"aperi21:archimedes-principle","title":{"ko":"아르키메데스 원리 — 부력의 크기","en":"Archimedes principle — the size of the buoyant force"},"description":{"ko":"2.0 kg · 1.0 L 물체를 주둥이까지 가득 찬 물에 천천히 담근다. 밀려난 물이 주둥이로 넘쳐 컵에 모이고, 물체 쪽 저울이 줄어드는 만큼 넘친 물 쪽 저울이 늘어난다.","en":"A 2.0 kg, 1.0 L object is lowered into a can filled to its spout. The displaced water pours into the cup, and the scale holding the water gains exactly what the scale holding the object loses."},"domain":"fluids"},
  {"id":"aperi21:pressure-and-container-shape","title":{"ko":"그릇 모양과 바닥 압력","en":"Container shape and bottom pressure"},"description":{"ko":"수면 높이를 옮겨 세 그릇을 다시 채운다","en":"Move the water level and refill all three"},"domain":"fluids"},
  {"id":"aperi21:pressure-isotropy","title":{"ko":"압력의 등방성","en":"Pressure isotropy"},"description":{"ko":"판이 저절로 반 바퀴 돌아 자취를 원으로 닫고, 그다음 독자가 다이얼로 직접 돌린다","en":"the plate turns half a revolution to close the trail into a circle, then the reader turns it by hand"},"domain":"fluids"},
  {"id":"aperi21:projectile","title":{"ko":"발사체","en":"Projectile"},"description":{"ko":"각도 다이얼 + 핀볼 런처","en":"Angle dial + pinball launcher"},"domain":"mechanics"},
  {"id":"aperi21:ray-tracing","title":{"ko":"광선 추적","en":"Ray Tracing"},"description":{"ko":"광원과 렌즈·거울을 배치해 광선 경로와 결상을 관찰.","en":"Place source and lens/mirror to watch ray paths and image formation."},"domain":"optics"},
];
