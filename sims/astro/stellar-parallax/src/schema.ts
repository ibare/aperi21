// ========================================================================
// stellar-parallax — 선언
// ========================================================================
// 질문: 별까지의 거리를 어떻게 재는가 — 지구가 공전하면 왜 가까운 별만 자리가 바뀌는가.
//
// 지구가 태양 둘레를 돌면 별을 보는 자리가 1 AU 씩 옮겨 간다. 가까운 별은 그만큼 먼 배경
// 별들 사이에서 자리가 어긋나 보이고, 아주 먼 별은 거의 그대로다. 별에서 1 AU(태양–지구)가
// 보이는 각이 연주시차 p 이고, 반 년 사이 두 시선이 이루는 각의 절반이다. 별이 두 배 멀면
// p 가 절반이다 — d(pc) = 1 / p(″).
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// 월드 단위는 캔버스 px 에 가까운 임의 단위, y 는 위. 각은 월드 +x 에서 반시계다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:stellar-parallax` 와 문자 그대로 일치한다 (C4). */
export const STELLAR_PARALLAX_ID = 'stellar-parallax';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 가까운 별의 거리(pc) — 이름표에 그대로 뜬다. */
export const NEAR_DISTANCE_PC = 1;
/** 가까운 별의 연주시차(″). 1 pc 의 정의 그대로 1″. 별의 자리(거리)는 이 각에서 정한다. */
export const NEAR_PARALLAX_ARCSEC = 1;
/** 두 배 먼 별의 거리(pc). */
export const FAR_DISTANCE_PC = 2;
/** 두 배 먼 별의 연주시차(″) — 절반. */
export const FAR_PARALLAX_ARCSEC = 0.5;
/**
 * 그림의 각 과장 배율. 실제 1″ 는 보이지 않으므로 모든 각을 이 배율로 키워 그린다 —
 * 1″ × 45000 = 12.5°. 화면 모서리에 그대로 밝힌다.
 */
export const ANGLE_EXAGGERATION = 45000;

// ------------------------------------------------------------------------
// 배치 — 월드 단위(가로 840 판), y 위
// ------------------------------------------------------------------------

export const CANVAS_W = 840;

/** 태양 자리 · 공전 궤도 반지름(= 1 AU 의 그림 길이). */
export const SUN = { x: 92, y: 196 } as const;
export const SUN_R = 13;
export const ORBIT_R = 58;
export const EARTH_R = 7;
export const STAR_R = 5;
/** 보이는 자리 점의 반지름. */
export const IMAGE_R = 4;

/**
 * 태양에서 본 두 별의 방향(도). 한 줄에 두면 먼 별이 가까운 별 뒤에 숨어 두 시선이 겹친다 —
 * 위 · 아래로 벌린다. 방향은 p 에 영향이 없다(p 는 거리만의 함수).
 */
export const NEAR_DIR_DEG = 12;
export const FAR_DIR_DEG = -9;

/**
 * 배경 별 원호의 반지름 — 별을 중심으로 둔다. 배경은 무한히 멀어 **방향**만 뜻이 있으므로,
 * 별 중심 원호 위의 자리는 곧 그 별이 보이는 방향이다. 두 별에 같은 반지름을 주면 원호 위를
 * 오가는 폭이 각에 정확히 비례한다 — 가까운 별의 폭이 먼 별의 두 배.
 */
export const BG_R = 200;
/** 원호가 흔들림 폭 너머로 더 뻗는 각(도) — 끝에 걸린 점이 원호 끝에 붙지 않게. */
export const BG_MARGIN_DEG = 8;
/** 원호마다 흩뿌리는 배경 별 수 · 시드 · 반지름 방향 퍼짐(±, 월드). */
export const BG_STARS_PER_ARC = 22;
export const BG_SEED = 41;
export const BG_SPREAD = 14;

/** 고정 경계 — 판 전체 + 아래 캡션 두 줄 자리 (장부 G24). */
export const SCENE_BOUNDS = { minX: 0, maxX: CANVAS_W, minY: -44, maxY: 374 } as const;

// ------------------------------------------------------------------------
// 시간표 — 한 해를 두 번 돈다
// ------------------------------------------------------------------------

/** 공전 한 바퀴(초). */
export const YEAR = 8;
/** 도착한 순간 — 지구가 이미 돌고 있다. */
export const START_AT = 1;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const stellarParallaxMessages = Object.freeze({
  'label.title': { ko: '연주시차', en: 'Stellar parallax' },
  'label.stage': { ko: '태양 · 지구 · 가까운 별 둘', en: 'Sun, Earth and two nearby stars' },
  'label.view': { ko: '공전면 위에서', en: 'From above the orbit' },
  'label.sun': { ko: '태양', en: 'Sun' },
  'label.orbit': { ko: '지구 궤도', en: 'Earth’s orbit' },
  'label.background': { ko: '먼 배경 별', en: 'distant background stars' },
  'label.star': { ko: '{d} pc · p = {p}″', en: '{d} pc · p = {p}″' },
  'label.exaggeration': { ko: '각은 실제의 {k}배로 키워 그렸다', en: 'angles drawn {k}× larger than real' },
  'caption.sweep': {
    ko: '지구가 궤도를 도는 동안 가까운 별은 먼 배경 별 사이에서 크게 오가고, 두 배 먼 별은 절반만 오간다. 배경 별은 그대로다.',
    en: 'As Earth goes round its orbit, the nearby star swings back and forth among the distant background stars; the star twice as far swings only half as much. The background stays put.',
  },
  'caption.measure': {
    ko: '반 년 사이 두 시선이 이루는 각의 절반이 연주시차 p — 별에서 태양–지구 거리가 보이는 각이다. 두 배 먼 별은 p 가 절반이다.',
    en: 'Half the angle between two sight lines half a year apart is the parallax p — the angle the Sun–Earth distance spans seen from the star. Twice as far, p is halved.',
  },
} satisfies Record<string, LocalizedText>);

export type StellarParallaxMessageKey = keyof typeof stellarParallaxMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: StellarParallaxMessageKey): LocalizedText => stellarParallaxMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: StellarParallaxMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const stellarParallaxSchema: BundleSchema = {
  id: STELLAR_PARALLAX_ID,
  title: text('label.title'),
  category: 'astro',
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 지구가 돌고 있고, 두 별이 배경 사이를 오가는 폭이 한 해 동안 드러난다.
  parameters: [],

  stages: [
    {
      id: 'two-stars',
      label: text('label.stage'),
      constants: {
        nearDistancePc: NEAR_DISTANCE_PC,
        nearParallaxArcsec: NEAR_PARALLAX_ARCSEC,
        farDistancePc: FAR_DISTANCE_PC,
        farParallaxArcsec: FAR_PARALLAX_ARCSEC,
        angleExaggeration: ANGLE_EXAGGERATION,
      },
    },
  ],
  environments: [],
  views: [{ id: 'above-orbit', label: text('label.view'), default: true }],

  /** 판 840 × 420 + 캡션 두 줄. 세로는 가까운 별의 배경 원호가 정한다. */
  canvas: { height: 440, minHeight: 400 },

  /** 겹침이 판정 장치다 — 쐐기는 시선 아래, 보이는 자리 점은 배경 별 위에 와야 한다. */
  drawOrder: 'scene',

  /**
   * 한 해를 두 번 돈다. 첫 해(`sweep`)는 두 별이 배경 사이를 오가는 폭이 자라고, 둘째 해
   * (`measure`)는 그 폭의 절반인 각 p 를 별에 매단다. 지구 자리는 두 단계 진행도의 합에서 읽는다
   * (physics `orbitTurns`) — 캡션과 지구 자리가 어긋날 수 없다.
   */
  timeline: {
    phases: [
      { id: 'sweep', duration: YEAR, ease: 'linear', caption: key('caption.sweep') },
      { id: 'measure', duration: YEAR, ease: 'linear', caption: key('caption.measure') },
    ],
  },

  /** 도착한 순간 이미 돌고 있다. */
  startAt: START_AT,

  // 슬롯 하나. 지금 두 별이 어떻게 오가는지만 말한다 — d = 1/p 의 공식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-left', offset: [16, -8] },
    align: 'left',
    fontSize: 14,
    fade: 0.3,
    style: { colorRole: 'ink', emphasis: 'medium' },
    wrapWidth: CANVAS_W - 32,
  },

  // 그리드 · 카메라 단추 없음 — 잴 것은 거리가 아니라 각이다.

  messages: stellarParallaxMessages,
};
