/**
 * 주제 카탈로그 타입.
 *
 * 이 카탈로그는 **만들 시각화 목록이 아니다.** 질문을 캘 맥락(주제)의 목록이며,
 * 주제 하나가 시각화 하나가 되지 않는다. 구현된 것만 `simId` 를 단다.
 *
 * 원본은 `tasks/piece-catalog/PHYSICS-TOPICS.md`, 생성은 `pnpm catalog:topics`.
 */

/** 조각·실험실 분류. 그 규범으로 만든 것에만 붙는다. */
export type TopicKind = 'piece' | 'lab';

export interface Topic {
  id: string;
  name: string;
  desc: string;
  kind?: TopicKind;
  /** 이 조각을 만들게 한 주제. kind 가 있을 때만. */
  origin?: string;
  /** 레지스트리 id. **있으면 구현된 것이다.** */
  simId?: string;
  /**
   * 엔진 밖에서 만든 자립 HTML 조각의 경로.
   *
   * `simId` 와 성격이 다르다 — 이것은 `Bundle` 이 아니라 `{aperi21:<id>}` 봉투로
   * 쓸 수 없다. 엔진 경계를 정하기 전에 눈으로 견주려고 붙여 둔 임시 다리다.
   */
  labUrl?: string;
}

export interface Domain {
  id: string;
  name: string;
  topics: Topic[];
}

export interface TopicCatalog {
  version: string;
  domain: string;
  domains: Domain[];
  summary: { topics: number; implemented: number; labs: number };
}
