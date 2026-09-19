/**
 * @aperi21/authoring — aperi21 개념 authoring 메타데이터.
 *
 * 호스트의 글 작성 파이프라인이 달성해야 하는 두 가지를 각각 다른 필드가 담당한다.
 *
 *   1. 글에 들어갈 시각화 선택
 *      → `surface` (definition + exemplarKeywords). 호스트가 임베딩해 글 ↔ 개념 매칭에
 *        쓴다. `definitionHash` 로 바뀐 것만 재임베딩한다. `briefing.avoidWhen` 은 그
 *        검색의 오검출을 되돌리고, `briefing.useWhen` 은 같은 개념에 화면이 둘 있을 때
 *        어느 쪽인지를 가린다.
 *
 *   2. 선택된 시각화의 내용을 writer 에게 전달
 *      → `briefing` (observable / screen / avoidWhen / contrastWith).
 *
 * 공개 표면은 FACET `@ffacet/authoring` 과 같은 모양이다 (`getFacetConcepts` ↔
 * `getAperi21Concepts`). 이 패키지는 어떤 워크스페이스 패키지도 import 하지 않는다.
 */

import type {
  Aperi21Concept,
  Aperi21ConceptSource,
  ConceptScreen,
  ResolvedConceptScreen,
} from './concept-types.js';
import { CONCEPT_SOURCES } from './concepts/index.js';
import { contentHash } from './hash.js';
import { SCREEN_LABELS } from './screen-labels.generated.js';
import { SIM_DOMAINS } from './sim-domains.generated.js';

export type {
  Aperi21Concept,
  Aperi21ConceptSource,
  ConceptSurface,
  ConceptBriefing,
  ConceptScreen,
  ResolvedConceptScreen,
  ConceptContrast,
  LocaleMap,
} from './concept-types.js';
export { contentHash } from './hash.js';

/**
 * 생성된 screen 라벨 표에 요청 locale 이 없을 때의 대체 언어.
 * 미지원 locale 에서 화면이 실제로 영어로 뜨는 것(C1 3층)과 일치한다.
 */
const FALLBACK_LOCALE = 'en';

type Validated = Aperi21ConceptSource & { domain: string; definitionHash: string };

/**
 * id 중복 · 분야 부착 · contrastWith 참조 · definitionHash 계산.
 *
 * 틀리면 throw 하므로 import 자체가 실패한다. 의도된 fail-fast 다 — 소비자가 호스트의
 * LLM 서버라, 중복 개념이 조용히 하나로 덮여 임베딩 인덱스가 어긋난 채 돌아가는 것보다
 * 부팅에서 멈추는 편이 낫다.
 */
export function validateConcepts(
  sources: readonly Aperi21ConceptSource[],
  domains: Readonly<Record<string, string>>,
): readonly Validated[] {
  const seen = new Set<string>();
  const out = sources.map((source) => {
    if (seen.has(source.id)) throw new Error(`개념 id 중복 선언: ${source.id}`);
    seen.add(source.id);
    const domain = domains[source.canonicalSim];
    if (domain === undefined) {
      throw new Error(`등록되지 않은 canonicalSim: ${source.id} → ${source.canonicalSim}`);
    }
    for (const aspect of source.aspects ?? []) {
      if (domains[aspect] === undefined) {
        throw new Error(`등록되지 않은 aspect: ${source.id} → ${aspect}`);
      }
    }
    return { ...source, domain, definitionHash: contentHash(source.surface.definition) };
  });
  for (const c of out) {
    for (const x of c.briefing.contrastWith) {
      if (!seen.has(x.concept)) throw new Error(`미선언 개념 참조: ${c.id}.contrastWith → ${x.concept}`);
    }
    if (c.specializes !== undefined && !seen.has(c.specializes)) {
      throw new Error(`미선언 개념 참조: ${c.id}.specializes → ${c.specializes}`);
    }
  }
  return out;
}

const VALIDATED = validateConcepts(CONCEPT_SOURCES, SIM_DOMAINS);

/**
 * screen.labels 를 요청 locale 하나로 접는다. 실제로 적용된 locale 을 함께 돌려준다 —
 * 숨기면 호스트가 화면에 뜨지도 않을 문자열을 그 언어의 라벨로 믿게 된다.
 */
function resolveScreen(
  screen: ConceptScreen,
  canonicalSim: string,
  locale: string,
): { screen: ResolvedConceptScreen; applied: string } {
  const byLocale = SCREEN_LABELS[canonicalSim] ?? {};
  const direct = byLocale[locale];
  if (direct !== undefined) return { screen: { ...screen, labels: direct }, applied: locale };
  return {
    screen: { ...screen, labels: byLocale[FALLBACK_LOCALE] ?? [] },
    applied: FALLBACK_LOCALE,
  };
}

const CACHE = new Map<string, readonly Aperi21Concept[]>();

function build(locale: string): readonly Aperi21Concept[] {
  const cached = CACHE.get(locale);
  if (cached) return cached;
  const built = VALIDATED.map((c) => {
    const { screen, applied } = resolveScreen(c.briefing.screen, c.canonicalSim, locale);
    return { ...c, briefing: { ...c.briefing, screen }, locale: applied };
  });
  CACHE.set(locale, built);
  return built;
}

/**
 * 전체 개념 목록. 선언 순서를 유지한다.
 *
 * `locale` 은 `screen.labels` 를 어느 언어로 접을지만 결정한다. 나머지 필드는 영어
 * 단일이다. 미지원 locale 이면 영어로 대체되고 반환된 `locale` 필드가 'en' 이 된다.
 */
export function getAperi21Concepts(locale: string = FALLBACK_LOCALE): readonly Aperi21Concept[] {
  return build(locale);
}

/** 개념 단건 조회. 봉투 `{APERI21:<id>}` 의 <id> 로 찾는다. */
export function getAperi21Concept(
  id: string,
  locale: string = FALLBACK_LOCALE,
): Aperi21Concept | undefined {
  return build(locale).find((c) => c.id === id);
}
