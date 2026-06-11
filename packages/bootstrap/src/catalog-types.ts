/**
 * Aperi21 카탈로그 엔트리 타입.
 *
 * 시뮬레이션 번들(schema/scene/controllers/step)을 로드하지 않고도 호스트(methii
 * 등)가 "추가 가능한 시각화 목록" 을 그릴 수 있도록 추린 경량 메타데이터.
 * 실제 값은 빌드타임 codegen(scripts/gen-aperi21-catalog.mts)이 각 sim 의
 * schema 에서 추출해 aperi21-catalog.generated.ts 로 emit 한다.
 *
 * FACET 의 FacetCatalogEntry 와 동일한 필드 구조(id/title/description/domain)를
 * 유지한다 — 호스트가 두 제공자를 같은 코드로 소비할 수 있게.
 */

import type { LocalizedText } from '@aperi21/schema';

export type Aperi21CatalogEntry = {
  /** 번들 식별자 (예: aperi21:projectile). 호스트 DSL `{aperi21:<id>}` 의 id 와 동일. */
  id: string;
  /** 사람이 읽을 제목 (locale 분기). schema.label 에서 추출. */
  title: LocalizedText;
  /** 한 줄 설명 (locale 분기). schema.operation 에서 추출. */
  description?: LocalizedText;
  /** 번들이 속한 도메인 그룹 (예: mechanics, optics). schema.category 에서 추출. */
  domain: string;
};
