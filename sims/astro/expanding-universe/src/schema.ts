// ========================================================================
// expanding-universe — 선언
// ========================================================================
// 질문: 은하들이 모두 우리에게서 멀어진다면, 우리가 우주의 가운데인가.
//
// 공간 자체가 고르게 늘어난다. 늘어나는 것은 은하가 아니라 은하 사이의 공간이라,
// 어느 은하에 서서 보아도 나머지 모두가 나에게서 멀어지고 두 배 먼 은하는 두 배
// 빨리 멀어진다(허블 법칙). 한 번은 왼쪽 끝 은하에, 한 번은 오른쪽 끝 은하에 서서
// 같은 늘임을 본다 — 두 그림이 같다. 가운데가 따로 없다.
//
// 이 조각은 **공간이 고르게 늘어나는 것** 에 머문다. 빛의 적색 이동 · 우주의 나이는
// 다루지 않는다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:expanding-universe` 와 문자 그대로 일치한다 (C4). */
export const EXPANDING_UNIVERSE_ID = 'expanding-universe';

// ------------------------------------------------------------------------
// 물리 · 배치 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/**
 * 허블 상수 H(1/초, 조각 시계). 공간의 한 조각이 1 초에 제 길이의 몇 배만큼 늘어나는가.
 * 늘어나는 동안 H 가 그대로라 척도 인자는 a = e^(H·τ) 이고, 어느 순간이든 v = H·d 다.
 * 늘이는 단계 3.4 초 동안 a 가 약 1.6 배가 된다.
 */
export const HUBBLE = 0.14;
/** 줄 선 세 은하의 간격 d(월드, 늘기 전). 가운데 은하가 양 끝의 한가운데라 끝과 끝은 2d 다. */
export const SPACING = 1.5;
/** 줄의 가운데 은하 자리(월드, 늘기 전). */
export const ROW_X = 0;
export const ROW_Y = -0.25;
/** 흩뿌린 은하 수. */
export const GALAXY_COUNT = 34;
/** 흩뿌림 난수의 씨앗. 같은 씨앗은 언제나 같은 하늘이다. */
export const GALAXY_SEED = 11;
/** 속도 화살표의 길이 = 속도 × 이 시간(초). 화살표 길이가 속도에 비례한다. */
export const ARROW_SECONDS = 1.3;
/** 공간 격자의 간격(월드, 늘기 전). d 의 절반 — 줄 선 은하가 격자 교점에 앉는다. */
export const GRID_STEP = 0.75;

/**
 * 프레이밍은 주장의 일부다. 가장 많이 늘었을 때 먼 은하(2d)와 그 속도 화살표까지 들어가고,
 * 아래에 캡션이 앉을 자리를 남긴다. 늘어난 뒤 화면 밖으로 나가는 은하는 나가도 된다 —
 * 경계를 상태로 계산하지 않는다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: -4.5, maxX: 4.5, minY: -2.7, maxY: 2.3 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const expandingUniverseMessages = Object.freeze({
  'label.title': { ko: '우주의 팽창', en: 'The expanding universe' },
  'label.stage': { ko: '고르게 늘어나는 공간', en: 'Evenly stretching space' },
  'label.view': { ko: '은하에 서서 보기', en: 'Standing on a galaxy' },
  /** 관찰 은하에 붙는 이름표. */
  'label.observer': { ko: '여기서 본다', en: 'Viewing from here' },
  /** 거리 · 속도 기호. 수식 표기라 번역 대상이 아니다 (C1 판정 3). */
  'label.near': { ko: 'd', en: 'd' },
  'label.far': { ko: '2d', en: '2d' },
  'label.nearSpeed': { ko: 'v', en: 'v' },
  'label.farSpeed': { ko: '2v', en: '2v' },
  'caption.stretchLeft': {
    ko: '공간이 고르게 늘어난다 — 왼쪽 끝 은하에서 보면 나머지가 모두 나에게서 멀어진다',
    en: 'Space stretches evenly — seen from the galaxy on the left, every other galaxy moves away',
  },
  'caption.holdLeft': {
    ko: '두 배 먼 은하는 같은 시간에 두 배 멀리 갔다 — 두 배 빨리 멀어진다',
    en: 'The galaxy twice as far went twice as far in the same time — it recedes twice as fast',
  },
  'caption.move': {
    ko: '이번에는 오른쪽 끝 은하로 옮겨 서서, 같은 공간을 다시 늘인다',
    en: 'Now stand on the galaxy at the right end and stretch the same space again',
  },
  'caption.stretchRight': {
    ko: '여기서 보아도 나머지가 모두 나에게서 멀어진다 — 왼쪽 끝 은하도',
    en: 'From here too, every other galaxy moves away — including the one on the left',
  },
  'caption.holdRight': {
    ko: '같은 그림이다 — 어느 은하에 서도 제가 가운데처럼 보인다. 가운데는 따로 없다',
    en: 'The same picture — every galaxy looks like the center from where it stands. There is no center',
  },
} satisfies Record<string, LocalizedText>);

export type ExpandingUniverseMessageKey = keyof typeof expandingUniverseMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: ExpandingUniverseMessageKey): LocalizedText => expandingUniverseMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ExpandingUniverseMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const expandingUniverseSchema: BundleSchema = {
  id: EXPANDING_UNIVERSE_ID,
  title: text('label.title'),
  category: 'astro',
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 이미 늘어나는 중이고, 관찰 은하를 옮겨 한 번 더 늘인다.
  parameters: [],

  stages: [
    {
      id: 'even-stretch',
      label: text('label.stage'),
      constants: {
        hubble: HUBBLE,
        spacing: SPACING,
        rowX: ROW_X,
        rowY: ROW_Y,
        galaxyCount: GALAXY_COUNT,
        galaxySeed: GALAXY_SEED,
        arrowSeconds: ARROW_SECONDS,
        gridStep: GRID_STEP,
      },
    },
  ],

  environments: [],

  views: [{ id: 'on-galaxy', label: text('label.view'), default: true }],

  /** 가로로 긴 줄(2d 가 1.6 배로 늘어남)이 주인이라 세로는 낮게 둔다. */
  canvas: { height: 400, minHeight: 340 },

  /**
   * 겹침 순서를 조각이 정한다 — 격자(공간)가 맨 아래, 그 위에 처음 자리 · 지나온 자취,
   * 은하, 속도 화살표, 관찰 고리 · 이름표. 층 순서로는 `lineSet` 격자와 자취가 같은 층이라
   * 둘 사이를 가를 수 없다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 왼쪽 끝 은하에 서서 늘임 → 멈춤 → 흐려짐 → 늘기 전 공간이 다시 나타남 →
   * 관찰 고리가 오른쪽 끝 은하로 옮겨 감 → 늘임 → 멈춤 → 흐려짐.
   *
   * 늘이는 단계는 `linear` 다 — 시계가 고르게 흘러야 a = e^(H·τ) 가 참이다. 늘어난 공간을
   * 되감지 않고 흐려졌다가 다시 나타나게 하는 것은, 되감으면 수축으로 읽히기 때문이다.
   */
  timeline: {
    phases: [
      { id: 'appearLeft', duration: 0.5, caption: key('caption.stretchLeft') },
      { id: 'stretchLeft', duration: 3.4, caption: key('caption.stretchLeft') },
      { id: 'holdLeft', duration: 2.8, caption: key('caption.holdLeft') },
      { id: 'fadeLeft', duration: 0.5, caption: key('caption.holdLeft') },
      { id: 'appearRight', duration: 0.5, caption: key('caption.move') },
      { id: 'move', duration: 1.4, ease: 'smooth', caption: key('caption.move') },
      { id: 'stretchRight', duration: 3.4, caption: key('caption.stretchRight') },
      { id: 'holdRight', duration: 3.0, caption: key('caption.holdRight') },
      { id: 'fadeRight', duration: 0.5, caption: key('caption.holdRight') },
    ],
  },

  /**
   * 도착한 순간 이미 늘어나는 중이다 — 왼쪽 끝 은하에 서서 공간이 늘기 시작한 자리에서 연다.
   * 0 이면 흐려진 빈 화면이 먼저 보인다.
   */
  startAt: 1.4,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — v = H·d 식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 640,
    fade: 0.25,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /**
   * 크롬 그리드 · 카메라 단추 없음(기본값). 미터 격자는 두지 않는다 — 대신 **공간 자체**를
   * 격자로 그려 함께 늘인다. 잴 것은 미터가 아니라 「같은 시간에 몇 배 멀리 갔는가」 다.
   */

  messages: expandingUniverseMessages,
};
