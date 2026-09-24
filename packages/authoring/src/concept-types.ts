/**
 * aperi21 개념(concept) authoring 메타데이터 스키마.
 *
 * FACET `@ffacet/authoring` 의 `concept-types.ts` 와 **같은 구조**다. 호스트가 여러
 * 시각화 제공자를 같은 코드로 다루므로 필드 이름과 의미를 바꾸지 않는다. 다른 것은
 * 진입점을 가리키는 필드 이름(`canonicalFacet` → `canonicalSim`)과 id 표기(kebab-case)
 * 뿐이다.
 *
 * ── 왜 sim 이 아니라 개념인가
 *
 * 호스트의 글 작성 파이프라인(plan → writer → 확장변환 → 조립)에서 writer 가 고르는
 * 단위는 개념이다. 실제로 마운트되는 sim 은 한 개념에 여럿 붙을 수 있고(canonical 1 +
 * aspect N) 시간이 지나면 교체된다. 글에 박히는 봉투가 개념을 가리키면 sim 이 바뀌어도
 * 이미 발행된 글이 깨지지 않는다.
 *
 * ── 두 종류의 필드를 섞지 않는다
 *
 *   surface  — 임베딩 재료. "이 글에 어떤 개념이 맞는가" 를 가리는 데만 쓴다.
 *              중립적이고 검색어에 걸리는 문장이어야 한다.
 *   briefing — 선택이 끝난 뒤 writer 에게 전달하는 집필 재료. 화면에서 실제로
 *              무엇이 관찰되는지, 어떤 용어를 써야 화면과 글이 맞물리는지.
 *
 * 한 필드에 두 용도를 겹치면 양쪽 다 나빠진다. schema.description 의 한 줄("같은 빛이
 * 넓은 면에 나뉜다")이 좋은 글이면서도 검색어에 안 걸리는 것이 그 예다.
 *
 * ── 의존 0
 *
 * 이 패키지는 어떤 워크스페이스 패키지도 import 하지 않는다. 소비자가 브라우저
 * 런타임이 아니라 호스트의 LLM 서버이기 때문에, 개념 메타를 읽는 대가로 렌더러
 * 코드가 딸려오면 안 된다.
 */

/**
 * 언어 코드 → 값.
 *
 * 이 스키마에서 언어 구분이 남는 곳은 `screen.labels` 하나뿐이다. 화면에 실제로 박혀
 * 있는 문자열이라 번역 대상이 아니기 때문이다 — 한국어 화면에 적힌 글자를 영어
 * definition 을 번역해 복원할 수는 없다. 나머지 필드는 전부 영어 단일이다.
 */
export type LocaleMap<T> = Partial<Record<string, T>>;

/**
 * 임베딩 재료. 호스트가 이 필드만 보고 글 ↔ 개념 매칭을 수행한다.
 *
 * definition 작성 기준:
 *  - 은유·수사 금지. 중립적 기술문.
 *  - 다루는 현상 / 조건 / 실제로 쓰이는 맥락을 명시적 단어로 담는다.
 *  - 한 문장. 개념의 경계를 긋되 옆 개념까지 넘보지 않는다.
 */
export type ConceptSurface = {
  /**
   * 개념의 정체 한 문장. 영어 단일 (20~30 단어).
   *
   * 언어별로 나눠 임베딩하면 같은 개념이 벡터 공간에서 두 점으로 갈라져 매칭 점수가
   * 글의 언어에 따라 흔들리므로 영어 하나만 둔다. 응용 맥락과 구어 표현은
   * exemplarKeywords 가 맡는다. 수정하면 definitionHash 가 바뀌어 재임베딩 대상이 된다.
   */
  definition: string;
  /** 검색면 확장. definition 이 담지 않는 구어·약어·응용 맥락을 채운다. */
  exemplarKeywords: string[];
};

/** 인접 개념과의 대비 한 줄. 링크는 개념 간에만 둔다 (sim 간에 두면 N^2 로 터진다). */
export type ConceptContrast = {
  /** 상대 개념 id. */
  concept: string;
  note: string;
};

/**
 * 선택 이후 재료. plan LLM 의 최종 판단 근거이자 writer 의 집필 재료.
 *
 * ── 두 가지 금지
 *
 * 1. **화면에 없는 것을 쓰지 않는다.** 없는 기능을 "없다" 고 적으면 그 개념을 맥락에
 *    집어넣는 역효과만 낸다. 부정 정보를 담는 필드는 avoidWhen 하나뿐이다.
 *    화면에 **있는** 요소가 기대와 다르게 동작하는 것은 부정형이 아니라 관찰이다.
 * 2. **다른 sim 을 기준으로 삼지 않는다.** 각 시각화는 자기 화면만으로 기술된다.
 *    개념 사이의 대비는 contrastWith 가 개념 층위에서만 다룬다.
 */
export type ConceptBriefing = {
  /** 화면에서 실제로 관찰되는 사건. 글이 가리킬 수 있는 것만 적는다. */
  observable: string[];
  /** 독자가 마주하는 인터페이스. */
  screen: ConceptScreen;
  /**
   * 붙일 만한 자리. **같은 개념에 화면이 둘 있을 때** 무엇을 고를지 가린다 — 둘은
   * definition 도 exemplarKeywords 도 겹치므로 검색은 원리상 답을 낼 수 없다.
   *
   * 개념마다 다른 문장이어야 하고(분류 어휘를 말로 입히지 않는다), 글의 구성(몇 개,
   * 분량)에 관여하지 않는다.
   */
  useWhen: string[];
  /**
   * 붙이면 안 되는 조건. 어디에서도 도출되지 않으며, 검색이 만드는 오검출을 되돌리는
   * 유일한 장치다.
   */
  avoidWhen: string[];
  /** 인접 개념 대비. writer 가 비교 문단을 쓸 수 있게 한다. */
  contrastWith: ConceptContrast[];
};

/**
 * 독자가 실제로 마주하는 인터페이스.
 *
 * 화면에 뜨는 문자열 목록(labels)은 여기 선언하지 않는다. 원천이 sim 의 선언이라
 * 손으로 옮겨 적으면 반드시 어긋나므로 `pnpm screen:gen` 이 뽑은 표에서 조회 시점에
 * 붙인다.
 */
export type ConceptScreen = {
  /** 독자가 할 수 있는 조작과 초기 상태. 영어 단일. */
  affordances: string[];
};

/** 공개 조회 API 가 내보내는 screen — 요청 locale 로 해석된 labels 가 붙은 형태. */
export type ResolvedConceptScreen = ConceptScreen & {
  /** 화면에 실제로 렌더되는 문자열. sim 선언에서 기계 수집한 것이라 어긋나지 않는다. */
  labels: string[];
};

/** 손으로 쓰는 개념 선언. `concepts/<id>.ts` 한 파일에 하나. */
export type Aperi21ConceptSource = {
  /**
   * 개념 id. 봉투 `{APERI21:<id>}` 의 <id> 이자 카탈로그 키. kebab-case.
   *
   * **그 개념이 실제로 다루는 것을 특정한다.** 같은 일반 명사를 쓰는 다른 개념이
   * 있거나 생길 수 있으면 변별어를 붙인다. id 의 변별력이 오선택을 막는 첫 방어선이고,
   * avoidWhen 은 그것을 통과한 나머지를 막는 두 번째 방어선이다.
   */
  id: string;
  /** 사람이 읽는 이름. 일반 명사로 줄이지 않는다. 영어 단일. */
  label: string;
  /**
   * 이 개념의 기본 진입점 sim id (`aperi21:<name>`). 정확히 하나.
   * 봉투는 언제나 이것으로 해석되므로 선택의 모호함이 남지 않는다.
   */
  canonicalSim: string;
  /** 개념의 한 대목만 확대한 보조 sim. 부모 개념이 선택된 뒤에만 writer 에게 보인다. */
  aspects?: string[];
  /** 상위 개념 id. 거슬러 올라갈 방향을 준다. */
  specializes?: string;
  surface: ConceptSurface;
  briefing: ConceptBriefing;
};

/** 공개 조회 API 가 반환하는 형태 — 선언 + 파생값. */
export type Aperi21Concept = Omit<Aperi21ConceptSource, 'briefing'> & {
  /**
   * 분야 id. canonicalSim 이 `docs/topics/topics.yaml` 에서 속한 분야이며, 호스트
   * 카탈로그(`getAperi21Catalog`)의 `domain` 과 같은 값이다. 생성된 표에서 붙인다.
   */
  domain: string;
  briefing: Omit<ConceptBriefing, 'screen'> & { screen: ResolvedConceptScreen };
  /** definition 콘텐츠 해시. 이 값이 그대로면 재임베딩할 필요가 없다. */
  definitionHash: string;
  /** screen.labels 를 해석할 때 실제로 적용된 locale. 요청 locale 이 없으면 'en'. */
  locale: string;
};
