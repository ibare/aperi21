// ========================================================================
// perfectly-inelastic-collision — 선언
// ========================================================================
// 질문: 붙어서 함께 움직이면 속력은 왜 하필 그만큼 느려지는가?
//
// 달려오던 수레 위에 운동량이 **칸**으로 쌓여 있다 — 폭은 질량, 높이는 속력,
// 칸 하나가 운동량 한 몫이다. 붙는 순간 그 칸들이 두 수레 위로 쏟아져 퍼진다.
// 칸 수는 그대로이므로 폭이 넓어진 만큼 높이가 낮아진다. 그 높이가 곧 속력이다.
//
// 자유 구현 원본 없이 엔진 어휘 위에서 바로 지었다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:perfectly-inelastic-collision` 와 문자 그대로 일치한다 (C4). */
export const PERFECTLY_INELASTIC_COLLISION_ID = 'perfectly-inelastic-collision';

// ------------------------------------------------------------------------
// 치수 — 월드 단위. 물리량이 아니라 그림의 배치다.
// ------------------------------------------------------------------------

/** 레일 높이. 수레가 이 위에 선다. */
export const RAIL_Y = 0;
/** 수레 높이. */
export const CART_H = 0.34;
/** 질량 1 의 수레 폭. 질량이 3 이면 폭도 3 배다 — 폭이 곧 질량이다. */
export const UNIT_W = 0.6;

/** 칸 하나의 폭 · 높이. 질량 1 의 수레 위에 가로 2 칸이 올라간다. */
export const TILE_W = UNIT_W / 2;
export const TILE_H = 0.35;
/** 칸 사이 틈 — 여덟 개가 세어지도록. */
export const TILE_GAP = 0.03;

/** 칸 기둥의 바닥. 수레 지붕이다. */
export const COLUMN_BASE = RAIL_Y + CART_H;
/** 속력 1 이 만드는 기둥 높이. 높이가 곧 속력이다. */
export const HEIGHT_PER_SPEED = 1;

/** 멈춰 있는 수레의 왼쪽 끝. 두 번의 충돌이 같은 자리에서 일어난다. */
export const STRUCK_LEFT = -1.2;

// ------------------------------------------------------------------------
// 운동 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 달려오는 수레의 질량. */
export const MASS_A = 1;
/** 달려오는 속력(월드/초). 1.4 = 칸 네 줄. */
export const SPEED_A = 1.4;

// ------------------------------------------------------------------------
// 프레이밍 — 매 프레임 같은 값이다 (S-piece, 프레이밍은 주장의 일부다).
//
// 가로는 달려오기 시작하는 자리부터 함께 가다 멈추는 자리까지만 담는다. 여기에
// 여유를 주면 칸이 작아져 여덟 개를 세기 어려워진다 — 세는 것이 이 조각의 요점이다.
// 아래쪽 0.72 는 캔버스 안 캡션 줄의 몫 (장부 G24).
// ------------------------------------------------------------------------

export const SCENE_BOUNDS = { minX: -4.05, maxX: 2.55, minY: -0.72, maxY: 1.78 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const perfectlyInelasticCollisionMessages = Object.freeze({
  'label.title': { ko: '완전 비탄성 충돌', en: 'Perfectly inelastic collision' },
  'label.stage': { ko: '레일 위 두 수레', en: 'Two carts on a rail' },
  'label.view': { ko: '운동량 칸', en: 'Momentum tiles' },

  // 표식 — 수레 아래 질량, 기둥 옆 속력 기호. 번역하면 화면과 어긋난다 (C1 판정표 3).
  'label.mass1': { ko: 'm', en: 'm' },
  'label.mass3': { ko: '3m', en: '3m' },
  'label.speed': { ko: 'v', en: 'v' },
  'label.speedAfter': { ko: 'v′', en: 'v′' },

  'caption.approach': {
    ko: '달려오는 수레 위에 운동량이 여덟 칸 쌓여 있다 — 폭은 질량, 높이는 속력이다. 멈춰 있는 수레 위에는 한 칸도 없다.',
    en: 'Eight momentum tiles ride on the moving cart — width is mass, height is speed. The cart at rest carries none.',
  },
  'caption.merge': {
    ko: '부딪쳐 붙는 순간, 칸이 두 수레 위로 쏟아져 퍼진다. 새로 생기지도 사라지지도 않는다.',
    en: 'At the moment they stick, the tiles pour across both carts. None is created, none is lost.',
  },
  'caption.equal': {
    ko: '같은 질량과 붙어 폭이 두 배가 되자, 여덟 칸이 두 줄로 낮아졌다 — 함께 가는 속력은 절반이다.',
    en: 'Stuck to an equal mass, the width doubled and the eight tiles settled into two rows — they move on at half the speed.',
  },
  'caption.heavy': {
    ko: '세 배 무거운 수레와 붙어 폭이 네 배가 되자, 같은 여덟 칸이 한 줄로 낮아졌다 — 속력은 4분의 1이다.',
    en: 'Stuck to three times the mass, the width quadrupled and the same eight tiles settled into one row — the speed is a quarter.',
  },
} satisfies Record<string, LocalizedText>);

export type PerfectlyInelasticCollisionMessageKey =
  keyof typeof perfectlyInelasticCollisionMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 통로 (C1). */
export const text = (key: PerfectlyInelasticCollisionMessageKey): LocalizedText =>
  perfectlyInelasticCollisionMessages[key];

/** 캡션 슬롯 · 시간표가 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: PerfectlyInelasticCollisionMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// 두 번의 충돌 — 시간표 단계 묶음과 부딪히는 수레의 질량
// ------------------------------------------------------------------------

/**
 * 한 주기에 충돌이 두 번 일어난다. 같은 질량에 한 번, 세 배 질량에 한 번 —
 * 「폭이 넓어진 만큼 낮아진다」 가 관계로 읽히려면 두 경우가 필요하다. 조작기 없이
 * 시간표가 둘을 차례로 보인다 (S-piece — 아무것도 누르지 않아도 할 말을 마친다).
 *
 * 단계 이름을 여기에 모아 두므로 scene 은 단계 경계 상수를 갖지 않는다.
 */
export interface EpisodeDef {
  /** 멈춰 있는 수레의 질량. */
  massB: number;
  /** 그 수레 아래 붙는 표식 키. */
  massLabel: PerfectlyInelasticCollisionMessageKey;
  phases: {
    /** 나타나는 동안. */
    appear: string;
    /** 달려오는 동안. */
    approach: string;
    /** 붙으며 칸이 퍼지는 동안. */
    merge: string;
    /** 함께 가는 동안. */
    together: string;
    /** 사라지는 동안. */
    fade: string;
  };
}

export const EPISODES: readonly EpisodeDef[] = [
  {
    massB: 1,
    massLabel: 'label.mass1',
    phases: {
      appear: 'appear-equal',
      approach: 'approach-equal',
      merge: 'merge-equal',
      together: 'together-equal',
      fade: 'fade-equal',
    },
  },
  {
    massB: 3,
    massLabel: 'label.mass3',
    phases: {
      appear: 'appear-heavy',
      approach: 'approach-heavy',
      merge: 'merge-heavy',
      together: 'together-heavy',
      fade: 'fade-heavy',
    },
  },
];

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const perfectlyInelasticCollisionSchema: BundleSchema = {
  id: PERFECTLY_INELASTIC_COLLISION_ID,
  title: text('label.title'),
  category: 'mechanics',
  timeModel: 'periodic',

  // 조작기가 없다. 두 경우를 시간표가 차례로 보이므로 독자가 고를 것이 없다.
  parameters: [],

  stages: [
    {
      id: 'rail',
      label: text('label.stage'),
      constants: { massA: MASS_A, speedA: SPEED_A },
    },
  ],

  environments: [],

  views: [{ id: 'tiles', label: text('label.view'), default: true }],

  /**
   * 가로 6.6 월드에 수레(0.34) · 기둥 네 줄(1.4) · 캡션 줄이 얹힌 비율이다. 860 px 폭
   * 임베드에서 가로와 세로가 거의 동시에 차도록 잡았다 — 한쪽이 먼저 차면 칸이 작아져
   * 여덟 개를 세기 어려워진다.
   */
  canvas: { height: 380, minHeight: 340 },

  /** 도착한 순간 이미 수레가 달려오는 중이다 (S-piece). */
  startAt: 0.8,

  /**
   * 한 주기 11.3 초(조각 시계). 충돌 두 번이 같은 순서로 일어난다 —
   * 나타나고 · 달려오고 · 붙으며 칸이 퍼지고 · 함께 가고 · 사라진다.
   *
   * `merge` 만 0.3 배로 느리게 흐른다. 붙는 것은 한순간이라 실시간으로는 칸이 퍼지는
   * 것을 눈으로 볼 수 없다. 단계 길이는 조각 시계로 세므로 0.5 초가 화면에서 1.67 초다.
   */
  timeline: {
    phases: [
      { id: 'appear-equal', duration: 0.3, caption: key('caption.approach') },
      { id: 'approach-equal', duration: 1.1, caption: key('caption.approach') },
      {
        id: 'merge-equal',
        duration: 0.5,
        ease: 'smooth',
        timeScale: 0.3,
        caption: key('caption.merge'),
      },
      { id: 'together-equal', duration: 3, caption: key('caption.equal') },
      { id: 'fade-equal', duration: 0.5, caption: key('caption.equal') },
      { id: 'appear-heavy', duration: 0.3, caption: key('caption.approach') },
      { id: 'approach-heavy', duration: 1.1, caption: key('caption.approach') },
      {
        id: 'merge-heavy',
        duration: 0.5,
        ease: 'smooth',
        timeScale: 0.3,
        caption: key('caption.merge'),
      },
      { id: 'together-heavy', duration: 3.5, caption: key('caption.heavy') },
      { id: 'fade-heavy', duration: 0.5, caption: key('caption.heavy') },
    ],
  },

  /** 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 (S-piece). */
  caption: {
    anchor: { screen: 'bottom-left', offset: [18, -8] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 720,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  // 그리드 · 카메라 단추 · 제목 · 범례 없음(기본). 잴 것이 레일 위 거리가 아니라
  // 칸의 수와 기둥의 높이라, 그리드는 「여기서 거리를 재라」 는 잘못된 지시가 된다.

  messages: perfectlyInelasticCollisionMessages,
};
