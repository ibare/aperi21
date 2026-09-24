// ========================================================================
// superconductivity — 선언
// ========================================================================
// 질문: 금속을 식히면 저항이 줄어든다. 끝까지 식히면 저항은 0 이 되는가?
//
// 보통 금속(구리)은 아니다 — 매끄럽게 줄다가 바닥(잔류 저항)에 남는다. 초전도체
// (수은)는 임계 온도 Tc 에서 저항이 **수직으로** 떨어져 0 이 된다. 두 금속을 한
// 판 위에서 함께 식혀, 한쪽 곡선만 뚝 끊겨 바닥으로 떨어지는 것을 보인다.
//
// 자기장을 밀어내는 것(마이스너 효과)은 이웃 조각 `meissner-effect` 의 몫이다.
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:superconductivity` 와 문자 그대로 일치한다 (C4). */
export const SUPERCONDUCTIVITY_ID = 'superconductivity';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 식히기 시작하는 온도(K). 판의 오른쪽 끝이다. */
export const T_MAX = 8;
/** 수은의 임계 온도(K). 카메를링 오너스가 1911 년에 본 값이다. */
export const T_C = 4.2;
/** 식히기를 멈추는 온도(K). 구리의 곡선이 바닥에 닿아 평평해진 것이 보일 만큼 내려간다. */
export const T_END = 0.5;
/**
 * 온도에 따라 줄어드는 몫의 거듭제곱 — R(T) = 잔류 + (처음 − 잔류)·(T/T_max)^n.
 * 낮은 온도에서 격자 진동이 얼어붙으며 저항이 T 의 거듭제곱으로 줄어드는 꼴을 근사한다.
 */
export const EXPONENT = 3;
/** 구리의 처음(T_max) 저항 · 잔류 저항. 판 높이에 대한 비율(상대 단위). */
export const COPPER_TOP = 1;
export const COPPER_RESIDUAL = 0.45;
/**
 * 수은의 처음 저항 · 정상 상태였다면 남았을 잔류 저항(상대 단위). 구리보다 낮게 두어
 * 두 곡선이 겹치지 않는다 — 시료마다 굵기 · 길이가 달라 절대 크기는 비교 대상이 아니다.
 */
export const MERCURY_TOP = 0.8;
export const MERCURY_RESIDUAL = 0.3;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 가로 = 온도, 세로 = 저항.
// ------------------------------------------------------------------------

/** 온도 1 K 의 가로 길이(월드). */
export const X_PER_K = 1.25;
/** 저항 1(상대 단위)의 세로 길이(월드). */
export const Y_PER_R = 4;
/** 가로축이 T_max 너머로 더 나가는 길이(월드). 축 이름이 곡선 끝과 붙지 않게. */
export const AXIS_OVERHANG = 0.5;
/** 세로축의 높이(월드). 가장 높은 저항(1) 위로 조금 더. */
export const AXIS_TOP = 4.3;

/**
 * 프레이밍은 주장의 일부다. 가로는 세로축 이름표(왼쪽)부터 곡선 이름표(오른쪽)까지,
 * 세로는 눈금 이름표와 캡션 한 줄(아래)부터 세로축 이름(위)까지. 캡션 슬롯은
 * 프레이밍 여백으로 잡히지 않아 아래 자리를 미리 잡는다 (장부 G24). 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -1.3, maxX: 12.6, minY: -1.15, maxY: 4.6 } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이. 경계는 선언이 정하고 physics 는 `at()` 으로 묻는다.
// ------------------------------------------------------------------------

/** T_max → T_c 로 식히는 동안(초). */
export const COOL_NORMAL = 3.2;
/** 온도가 T_c 에 머문 채 수은의 저항이 떨어지는 동안(초). 한순간을 눈으로 보게 늘인다. */
export const DROP = 1.0;
/** T_c → T_end 로 더 식히는 동안(초). */
export const COOL_BELOW = 2.8;
/** 다 식힌 그림을 읽는 동안 · 다음 주기로 넘어가며 흐려지는 동안(초). */
export const HOLD = 3.2;
export const FADE = 0.6;
/** 도착한 순간 두 곡선이 이미 자라고 있도록 시계를 앞당기는 양(초). */
export const START_AT = 1.0;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const superconductivityMessages = Object.freeze({
  'label.title': { ko: '초전도', en: 'Superconductivity' },
  'label.stage': { ko: '구리와 수은', en: 'Copper and mercury' },
  'label.view': { ko: '저항-온도 판', en: 'Resistance vs temperature' },
  /** 곡선 이름 — 원소 이름은 문안이다 (C1). */
  'label.copper': { ko: '구리', en: 'Copper' },
  'label.mercury': { ko: '수은', en: 'Mercury' },
  /** 축 이름. 기호 R · T 는 표식이지만 낱말이 붙어 문안이다. */
  'label.axisR': { ko: '저항 R', en: 'Resistance R' },
  'label.axisT': { ko: '온도 T', en: 'Temperature T' },
  /** 온도 눈금. 값은 스테이지 상수를 그대로 끼운다 (S-piece 유효숫자). */
  'label.tick': { ko: '{v} K', en: '{v} K' },
  /** 임계 온도 표지. `Tc` 는 기호라 표식이지만 값이 끼는 조립문이라 문안 키로 둔다. */
  'label.tc': { ko: 'Tc = {v} K', en: 'Tc = {v} K' },
  /** 저항축의 0. 수는 표식이다 (C1 판정 3). */
  'label.zero': { ko: '0', en: '0' },
  /** 다 식힌 뒤 두 곡선의 바닥에 붙는 이름. */
  'label.residual': { ko: '잔류 저항', en: 'residual resistance' },
  'label.vanished': { ko: '저항 0', en: 'zero resistance' },
  'caption.coolNormal': {
    ko: '두 금속을 함께 식힌다 — 둘 다 저항이 매끄럽게 줄어든다',
    en: 'Both metals are cooled together — both resistances fall smoothly',
  },
  'caption.drop': {
    ko: '임계 온도에 닿는 순간, 수은의 저항만 수직으로 떨어진다',
    en: 'At the critical temperature, only mercury’s resistance drops straight down',
  },
  'caption.coolBelow': {
    ko: '더 식혀도 구리의 저항은 바닥에서 멈추고, 수은은 0 에 머문다',
    en: 'Cooling further, copper levels off at a floor while mercury stays at zero',
  },
  'caption.hold': {
    ko: '구리에는 잔류 저항이 남았고, 수은의 저항은 임계 온도 아래에서 사라졌다',
    en: 'Copper keeps a residual resistance; below the critical temperature mercury’s is gone',
  },
} satisfies Record<string, LocalizedText>);

export type SuperconductivityMessageKey = keyof typeof superconductivityMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: SuperconductivityMessageKey): LocalizedText => superconductivityMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: SuperconductivityMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const superconductivitySchema: BundleSchema = {
  id: SUPERCONDUCTIVITY_ID,
  title: text('label.title'),
  category: 'modern',
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 식고 있고, 수은이 떨어지고, 다시 데워져 처음부터 식는다.
  parameters: [],

  stages: [
    {
      id: 'copper-mercury',
      label: text('label.stage'),
      constants: {
        tMax: T_MAX,
        tc: T_C,
        tEnd: T_END,
        exponent: EXPONENT,
        copperTop: COPPER_TOP,
        copperResidual: COPPER_RESIDUAL,
        mercuryTop: MERCURY_TOP,
        mercuryResidual: MERCURY_RESIDUAL,
      },
    },
  ],

  environments: [],

  views: [{ id: 'rt-plot', label: text('label.view'), default: true }],

  /** 가로로 넓은 판 하나와 캡션 한 줄. 세로를 더 주면 가로가 먼저 차서 그림만 작아진다. */
  canvas: { height: 360, minHeight: 320 },

  /**
   * 겹침이 판정 장치다. 수은의 0 선은 **가로축 위에** 덮여야 「축에 붙어 달린다」 로
   * 읽힌다. 축 → 안내선 → 곡선 → 점 → 글자 순서로 쓴다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 식힘(T_max → T_c) → 떨어짐(T_c 에 머묾) → 더 식힘(T_c → T_end) → 읽기 → 흐려짐.
   * 떨어지는 동안 온도는 움직이지 않는다 — 그래서 수은의 선분이 **수직**이다.
   */
  timeline: {
    phases: [
      { id: 'cool-normal', duration: COOL_NORMAL, caption: key('caption.coolNormal') },
      { id: 'drop', duration: DROP, ease: 'smooth', caption: key('caption.drop') },
      { id: 'cool-below', duration: COOL_BELOW, caption: key('caption.coolBelow') },
      { id: 'hold', duration: HOLD, caption: key('caption.hold') },
      { id: 'fade', duration: FADE, caption: key('caption.hold') },
    ],
  },

  /** 도착한 순간 두 곡선이 이미 판의 오른쪽에서 자라고 있다. */
  startAt: START_AT,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 정의와 공식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    fade: 0.25,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것은 임의의 저항값이 아니라 「바닥에 남는가,
   * 0 에 닿는가」 이고, 그 판정선은 가로축 자체다.
   */

  messages: superconductivityMessages,
};
