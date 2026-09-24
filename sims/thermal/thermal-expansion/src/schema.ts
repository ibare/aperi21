// ========================================================================
// thermal-expansion — 선언
// ========================================================================
// 질문: 철로 이음매에 왜 틈을 두는가 — 그 틈은 여름에 어떻게 되는가.
//
// 옆에서 본 강철 레일 두 토막. 겨울에는 이음매 틈이 벌어져 있다. 날이 더워지면
// 레일이 양 끝으로 늘어나 틈 쪽으로 밀려 나오고, 여름에는 틈이 거의 닫힌다.
// 식으면 다시 줄어 틈이 벌어진다.
//
// 실제 늘음(몇 mm)은 25 m 레일 옆에서 보이지 않는다 — 틈과 늘어난 길이만 과장 배율로
// 키워 그리고, 그 배율을 화면에 알린다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:thermal-expansion` 와 문자 그대로 일치한다 (C4). */
export const THERMAL_EXPANSION_ID = 'thermal-expansion';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 레일 한 토막의 길이(m). */
export const LENGTH_M = 25;
/** 강철의 선팽창 계수 α 의 가수(×10⁻⁶ /K). 정수로 두어 늘음(mm)이 정확한 수로 나온다. */
export const ALPHA_E6 = 12;
/** 겨울 · 여름 온도(℃). */
export const T_COLD = -10;
export const T_HOT = 40;
/** 겨울(`T_COLD`)의 이음매 틈(mm). */
export const GAP_COLD_MM = 18;
/**
 * 여름 틈 · 레일 한 토막이 늘어난 길이(mm) — 화면 글자로 띄우는 정박값. L·α·ΔT 로 계산한 레일 모양과
 * 같아야 한다(25 m × 12×10⁻⁶ × 50 K = 15 mm, 18 − 15 = 3 mm). 둘의 관계는 G143.
 */
export const GAP_HOT_MM = 3;
export const GROW_MM = 15;
/**
 * 과장 배율. 틈과 늘어난 길이만 이만큼 키워 그린다 — 레일 길이는 그대로다.
 * 25 m 레일 옆에서 15 mm 는 한 점도 안 된다. 화면 아래에 이 배율을 적는다.
 */
export const EXAGGERATION = 300;
/** 온도계 눈금의 아래 · 위 끝(℃). */
export const AXIS_MIN = -20;
export const AXIS_MAX = 50;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 가운데가 이음매, 왼쪽 끝에 온도계. y 는 위.
// ------------------------------------------------------------------------

/** 레일 한 토막을 그리는 길이(월드) — `LENGTH_M` 이 이 길이다. */
export const RAIL_WORLD = 4.2;
/** 레일 옆모습의 높이(월드). 두께는 과장하지 않으면 선 한 줄이라 보기 좋게 잡는다. */
export const RAIL_H = 0.34;
/** 레일 머리(윗면 띠)의 두께(월드). */
export const RAIL_HEAD_H = 0.1;
/** 침목 크기 [가로, 세로](월드)와 간격. 침목은 움직이지 않는다 — 레일이 그 위로 밀린다. */
export const SLEEPER_SIZE: readonly [number, number] = [0.34, 0.14];
export const SLEEPER_SPACING = 0.7;
/** 레일 한 토막에 놓는 침목 수. 이음매 바로 밑은 비운다. */
export const SLEEPERS_PER_RAIL = 6;
/** 틈 치수선의 높이 — 레일 위. */
export const DIM_Y = 0.62;
/** 과장 배율 알림 글자의 높이 — 침목 아래. */
export const NOTE_Y = -0.42;

/** 온도계 관의 중심 x · 아래 · 위 끝 y · 폭과 아래 알뿌리 반지름. */
export const THERMO_X = -5.7;
export const THERMO_BOTTOM = -0.2;
export const THERMO_TOP = 1.55;
export const THERMO_WIDTH = 0.26;
export const BULB_R = 0.22;

/**
 * 프레이밍은 주장의 일부다. 가로는 온도계 눈금 글자부터 여름에 늘어난 오른쪽 레일 끝까지,
 * 세로는 캡션 자리부터 온도계 위 끝까지. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -6.9, maxX: 5.3, minY: -1.0, maxY: 1.7 } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이(초)
// ------------------------------------------------------------------------

/** 겨울 그림을 읽는 동안. */
export const WINTER = 2.4;
/** 날이 더워지며 레일이 늘어나는 동안. */
export const WARM = 3.2;
/** 여름 그림을 읽는 동안. */
export const SUMMER = 3.6;
/** 날이 식으며 레일이 줄어드는 동안. 끝나면 겨울 그림으로 이어진다. */
export const COOL = 2.4;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const thermalExpansionMessages = Object.freeze({
  'label.title': { ko: '열팽창', en: 'Thermal expansion' },
  'label.operation': {
    ko: '온도에 따른 길이·부피 변화',
    en: 'How length and volume change with temperature',
  },
  'label.stage': { ko: '철로 이음매', en: 'Rail joint' },
  'label.view': { ko: '옆에서 본 레일', en: 'Rails from the side' },
  /** 온도계 눈금 글자. 값은 선언한 두 온도를 끼운다 (C1). */
  'label.temp': { ko: '{t} ℃', en: '{t} ℃' },
  /** 틈 치수선 글자. 값은 선언 · 선언에서 나온 정확한 수다. */
  'label.gap': { ko: '{g} mm', en: '{g} mm' },
  /** 과장 배율 알림. */
  'label.exaggeration': {
    ko: '틈과 늘어난 길이는 {x} 배로 키워 그렸다',
    en: 'The gap and the added length are drawn {x} times larger',
  },
  'caption.winter': {
    ko: '겨울 {cold} ℃ — 두 레일 사이 이음매에 {gapCold} mm 틈이 벌어져 있다',
    en: 'Winter, {cold} ℃ — a {gapCold} mm gap is left open at the joint between the rails',
  },
  'caption.warm': {
    ko: '날이 더워지며 레일 끝이 침목 위로 밀려 나오고, 이음매 틈이 좁아진다',
    en: 'As the day warms, the rail ends slide out over the sleepers and the gap narrows',
  },
  'caption.summer': {
    ko: '여름 {hot} ℃ — 레일마다 {grow} mm 늘어 틈이 {gapHot} mm 만 남았다',
    en: 'Summer, {hot} ℃ — each rail is {grow} mm longer and only {gapHot} mm of gap is left',
  },
  'caption.cool': {
    ko: '날이 식으며 늘었던 끝이 물러나고, 틈이 다시 벌어진다',
    en: 'As it cools, the added ends pull back and the gap opens again',
  },
} satisfies Record<string, LocalizedText>);

export type ThermalExpansionMessageKey = keyof typeof thermalExpansionMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: ThermalExpansionMessageKey): LocalizedText => thermalExpansionMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ThermalExpansionMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const thermalExpansionSchema: BundleSchema = {
  id: THERMAL_EXPANSION_ID,
  label: text('label.title'),
  category: 'thermal',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 두 온도 · 길이 · α · 틈은 스테이지 상수다. 주장은 「여름에 틈이 거의
  // 닫힌다」 하나이고, 자동 진행이 겨울과 여름을 오간다.
  parameters: [],

  stages: [
    {
      id: 'rail-joint',
      label: text('label.stage'),
      constants: {
        lengthM: LENGTH_M,
        alphaE6: ALPHA_E6,
        tCold: T_COLD,
        tHot: T_HOT,
        gapColdMm: GAP_COLD_MM,
        gapHotMm: GAP_HOT_MM,
        growMm: GROW_MM,
        exaggeration: EXAGGERATION,
        axisMin: AXIS_MIN,
        axisMax: AXIS_MAX,
      },
    },
  ],

  environments: [],

  views: [{ id: 'rails-side', label: text('label.view'), default: true }],

  /** 세로가 비싸다. 레일은 가로로 길고 낮다 — 온도계 높이 + 캡션 한 줄이면 된다. */
  canvas: { height: 250, minHeight: 220 },

  /**
   * 겹침이 판정 장치다. 늘어난 끝(빗금)은 레일 위에, 온도계 채움은 관 바탕 위에,
   * 관 둘레는 채움 위에 그려야 한다.
   */
  drawOrder: 'scene',

  /** 한 주기 = 겨울 → 더워짐 → 여름 → 식음. 식음이 끝난 그림이 곧 겨울 그림이라 흐려짐이 없다. */
  timeline: {
    phases: [
      { id: 'winter', duration: WINTER, caption: key('caption.winter') },
      { id: 'warm', duration: WARM, ease: 'smooth', caption: key('caption.warm') },
      { id: 'summer', duration: SUMMER, caption: key('caption.summer') },
      { id: 'cool', duration: COOL, ease: 'smooth', caption: key('caption.cool') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — 레일이 늘어나는 도중에서 연다. */
  startAt: 3.6,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 법칙과 식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 720,
    style: { colorRole: 'muted', emphasis: 'strong' },
    // 문안의 수는 스테이지 상수에서 온다 — initialState 가 글자로 옮겨 둔 state 경로 (G133).
    vars: {
      cold: 'coldText',
      hot: 'hotText',
      gapCold: 'gapColdText',
      gapHot: 'gapHotText',
      grow: 'growText',
    },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것은 월드 거리가 아니라 이음매 틈 하나이고,
   * 그것은 치수선이 잰다. 과장 배율 때문에 격자는 오히려 거짓 눈금이 된다.
   */

  messages: thermalExpansionMessages,
};
