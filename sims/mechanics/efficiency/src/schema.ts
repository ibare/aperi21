// ========================================================================
// efficiency — 선언
// ========================================================================
// 질문: 효율이 「얼마나 많이 내놓느냐」 가 아니라 「넣은 것 중 얼마를 내놓느냐」 라는 것이
// 그림으로 어떻게 보이는가.
//
// 두 기계가 나란히 에너지를 받는다. 들어가는 띠의 굵기가 넣은 양이고, 기계를 지나면
// 쓸모로 나가는 갈래(오른쪽)와 새어 나가는 갈래(아래)로 갈린다. 처음에는 A 가 더 많이
// 받아 쓸모 갈래도 A 가 굵다. B 의 입구를 A 와 같은 굵기로 늘리면 — 모든 갈래가 같은
// 비로 함께 굵어지고 — 쓸모 갈래는 B 쪽이 더 굵어진다. 굵기를 맞춰도 변하지 않는 것,
// 그 몫이 효율이다.
//
// `energy-flow-diagram` 은 갈래가 **어디서** 새는지를 보인다. 이 조각은 새는 곳이 아니라
// **몫**을 보인다 — 크기를 맞추는 동작이 「비」 를 화면에 세운다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:efficiency` 와 문자 그대로 일치한다 (C4). */
export const EFFICIENCY_ID = 'efficiency';

// ------------------------------------------------------------------------
// 에너지 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 기계 A 가 받는 에너지 · 쓸모로 내놓는 에너지(J). 효율 40 %. */
export const IN_A = 10;
export const OUT_A = 4;
/** 기계 B 가 받는 에너지 · 쓸모로 내놓는 에너지(J). 효율 75 % — 적게 받지만 몫이 크다. */
export const IN_B = 4;
export const OUT_B = 3;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 두 기계를 가로로 나란히 둔다 (세로가 비싸다, S-piece).
// ------------------------------------------------------------------------

/** 1 J 가 차지하는 띠의 굵기(월드). 굵기가 곧 양이다. */
export const UNIT = 0.12;
/** 모든 띠의 윗변 높이. 윗변을 맞춰야 굵기 차이가 아래쪽 한 곳에서 읽힌다. */
export const Y_TOP = 0;
/** 들어가는 띠의 길이 — 띠가 시작하는 자리부터 기계 왼쪽 벽까지. */
export const INLET_LEN = 2.4;
/** 기계 상자의 폭과, 띠 위아래로 남기는 여백. */
export const MACHINE_W = 0.9;
export const MACHINE_PAD = 0.14;
/** 쓸모 갈래가 기계를 나와 화살촉 밑동까지 가는 길이. */
export const OUTLET_LEN = 2.5;
/** 화살촉의 길이와, 띠 위아래로 벌어지는 폭. */
export const HEAD_LEN = 0.36;
export const HEAD_FLARE = 0.1;
/** 새는 갈래가 아래로 꺾일 때 안쪽 반지름. */
export const BEND_R = 0.22;
/** 새는 갈래가 닿는 높이. */
export const LOSS_FLOOR = -2.2;
/** 두 기계의 띠가 시작하는 자리(월드 x). */
export const ORIGIN_A = 0;
export const ORIGIN_B = 7.9;

/** 흐르는 점 — 1 J 마다 한 가닥. 점 사이 간격(월드) · 흐르는 빠르기(월드/초). */
export const DOT_SPACING = 0.34;
export const DOT_SPEED = 0.8;

/**
 * 프레이밍은 주장의 일부다. 가로는 A 의 입구부터 B 의 % 이름표까지, 세로는 기계 이름표
 * 위부터 새는 갈래 이름표 아래까지. B 가 A 의 굵기로 늘어나도 이 안에 담긴다. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -0.35, maxX: 15.2, minY: -2.95, maxY: 0.85 } as const;

// ------------------------------------------------------------------------
// 시간표 — 길이는 저작 결정이다. scene 은 `at('scale')` · `at('unscale')` 로 읽는다.
// ------------------------------------------------------------------------

/** 제 크기로 흐르는 동안 · 입구를 맞추는 동안 · 맞춘 채 흐르는 동안 · 되돌리는 동안(초). */
export const AMOUNTS = 4.5;
export const SCALE = 1.6;
export const RATIO = 4.5;
export const UNSCALE = 1.2;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const efficiencyMessages = Object.freeze({
  'label.title': { ko: '효율', en: 'Efficiency' },
  'label.stage': { ko: '두 기계', en: 'Two machines' },
  'label.view': { ko: '흐름', en: 'Flow' },
  /** 기계 이름. 도형에 붙는 기호라 번역 대상이 아니다 (C1 판정 1). */
  'label.machineA': { ko: 'A', en: 'A' },
  'label.machineB': { ko: 'B', en: 'B' },
  /** 띠의 양. 값 + 단위 표기다 (C1 판정 3). */
  'label.joules': { ko: '{v} J', en: '{v} J' },
  'label.percent': { ko: '{v} %', en: '{v} %' },
  'caption.amounts': {
    ko: 'A 가 더 많이 받아 더 많이 내놓는다 — 쓸모로 나가는 갈래는 A 쪽이 더 굵다',
    en: 'A takes in more and puts out more — its useful branch is the thicker one',
  },
  'caption.scale': {
    ko: 'B 의 입구를 A 와 같은 굵기로 늘리면, 갈래들도 같은 비로 함께 굵어진다',
    en: "Widen B's inlet to match A's, and each of its branches widens in the same proportion",
  },
  'caption.ratio': {
    ko: '같은 굵기로 들여보내니 쓸모로 나가는 갈래는 B 쪽이 더 굵다',
    en: "With the same inflow, B's useful branch is now the thicker one",
  },
  'caption.unscale': {
    ko: 'B 를 제 크기로 되돌린다 — 굵기는 줄어도 갈래가 나뉘는 몫은 그대로다',
    en: 'B shrinks back to its own size — the branches thin, but their shares stay the same',
  },
} satisfies Record<string, LocalizedText>);

export type EfficiencyMessageKey = keyof typeof efficiencyMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: EfficiencyMessageKey): LocalizedText => efficiencyMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: EfficiencyMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const efficiencySchema: BundleSchema = {
  id: EFFICIENCY_ID,
  title: text('label.title'),
  category: 'mechanics',
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 흐르고, 입구가 맞춰지고, 되돌아간다.
  parameters: [],

  stages: [
    {
      id: 'two-machines',
      label: text('label.stage'),
      constants: { inA: IN_A, outA: OUT_A, inB: IN_B, outB: OUT_B },
    },
  ],

  environments: [],

  views: [{ id: 'flow', label: text('label.view'), default: true }],

  /** 가로로 긴 그림이다. 세로를 더 주면 가로가 먼저 차서 그림만 작아진다. */
  canvas: { height: 280, minHeight: 260 },

  /**
   * 겹침이 판정 장치다. 흐르는 점은 띠 **위**, 기계 상자 **아래** 로 지나가야 점이
   * 기계 안으로 들어갔다 나오는 것으로 읽힌다. 층 순서로는 `region` 이 입자 위로 온다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 제 크기로 흐름 → B 의 입구를 A 의 굵기로 늘림 → 맞춘 채 흐름 → 되돌림.
   * 늘리고 되돌리는 동안은 `smooth` — 굵기가 변하는 것이 눈에 따라가져야 한다.
   */
  timeline: {
    phases: [
      { id: 'amounts', duration: AMOUNTS, caption: key('caption.amounts') },
      { id: 'scale', duration: SCALE, ease: 'smooth', caption: key('caption.scale') },
      { id: 'ratio', duration: RATIO, caption: key('caption.ratio') },
      { id: 'unscale', duration: UNSCALE, ease: 'smooth', caption: key('caption.unscale') },
    ],
  },

  /** 도착한 순간 이미 흐르는 중이다. 흐름은 시각의 함수라 첫 프레임부터 차 있다. */
  startAt: 1,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 효율의 정의는 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  messages: efficiencyMessages,
};
