/**
 * Aperi21 카탈로그 타입.
 *
 * 시뮬레이션 번들(schema/scene/controllers/step)을 로드하지 않고도 호스트가
 * "추가 가능한 시각화 목록" 을 그릴 수 있도록 추린 경량 메타데이터.
 * 실제 값은 빌드타임 codegen(scripts/gen-aperi21-catalog.mts)이 만든다 —
 * 제목·설명은 각 sim 의 schema(title/description), 분야와 그 이름은
 * `docs/topics/topics.yaml` 에서 온다.
 *
 * 한 카탈로그는 **한 언어**다. 문자열은 이미 그 언어로 골라져 있어 호스트가
 * locale 을 다시 해석할 일이 없다. FACET 의 `FacetCatalog` 와 같은 모양이다 —
 * 호스트가 두 제공자를 같은 코드로 소비할 수 있게. 하위 분야는 두지 않는다.
 */

/** 카탈로그 항목 하나 — 시각화 하나. */
export type Aperi21CatalogEntry = {
  /** 번들 식별자 (예: aperi21:projectile). 호스트 DSL `{aperi21:<id>}` 의 id 와 동일. */
  id: string;
  /** 사람이 읽을 제목. schema.title 에서 추출. */
  title: string;
  /** 한 줄 설명. schema.description 에서 추출. */
  description?: string;
  /** 분야 id. `Aperi21Catalog.domains[].id` 중 하나. */
  domain: string;
};

/** 분야 이름표. 항목이 하나라도 있는 분야만 담는다. */
export type Aperi21CatalogDomain = {
  id: string;
  name: string;
};

/**
 * 한 언어의 카탈로그.
 *
 * `domains` 와 `entries` 는 `topics.yaml` 의 순서(분야 → 주제)를 따른다.
 * 호스트가 묶어 그릴 때 그대로 순회하면 된다.
 */
export type Aperi21Catalog = {
  /**
   * 실제로 담긴 언어. 요청한 언어의 카탈로그가 없으면 'en' 이 온다 — 호스트가
   * 대체 여부를 알 수 있어야 그 문자열을 요청 언어의 것으로 믿지 않는다.
   */
  locale: string;
  domains: Aperi21CatalogDomain[];
  entries: Aperi21CatalogEntry[];
};
