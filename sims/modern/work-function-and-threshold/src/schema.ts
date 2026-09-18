// ========================================================================
// work-function-and-threshold — 선언
// ========================================================================
// 질문: 전자가 튀어나오기 시작하는 진동수는 무엇이 정하고, 넘은 뒤에는 어떻게 자라는가.
//
// 답: 튀어나온 전자의 최대 운동 에너지(= 저지 전압)를 빛의 진동수에 대해 그리면
// 문턱 진동수 f₀ = φ/h 에서 시작하는 **직선**이 된다(Kmax = hf − φ). 금속을 바꾸면
// 일함수 φ 만큼 문턱이 옮겨 갈 뿐, 기울기 h 는 어느 금속이나 같다.
//
// 이웃 `photoelectric-effect` 는 금속판 · 램프 · 광자로 「세기가 아니라 진동수」 를 보인다.
// 이 조각은 그 화면을 되풀이하지 않고 **문턱과 기울기** 를 그래프 한 판으로 보인다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:work-function-and-threshold` 와 문자 그대로 일치한다 (C4). */
export const WORK_FUNCTION_AND_THRESHOLD_ID = 'work-function-and-threshold';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 진동수는 10¹⁴ Hz 단위, 에너지는 eV.
// ------------------------------------------------------------------------

/** 일함수(eV) — 나트륨 · 구리. */
export const WORK_FUNCTION_NA = 2.3;
export const WORK_FUNCTION_CU = 4.7;
/** 플랑크 상수(eV / 10¹⁴ Hz) — 두 직선의 기울기다. 4.136×10⁻¹⁵ eV·s. */
export const PLANCK = 0.4136;
/**
 * 문턱 진동수(10¹⁴ Hz) — 화면에 띄우는 정박값이다. φ / h 를 유효숫자 셋으로 둔 값이라
 * 일함수나 h 를 바꾸면 이것도 함께 바꾼다. 어긋나면 `readConstants` 가 던진다 (장부 G143).
 */
export const THRESHOLD_NA = 5.6;
export const THRESHOLD_CU = 11.4;
/** 진동수를 훑는 범위(10¹⁴ Hz) — 적외선 끝에서 자외선 깊숙이. */
export const SWEEP_FROM = 3;
export const SWEEP_TO = 16;
/**
 * 구리를 훑을 때 단계를 가르는 진동수(10¹⁴ Hz) — 가시광 끝(380 nm ≈ 7.89). 이 앞은 「나트륨의 문턱을
 * 지나도」, 이 뒤는 「자외선에 들어서도」 를 캡션이 말한다.
 */
export const UV_FROM = 7.9;
/** 문턱을 넘는 순간 퍼지는 고리가 사라지기까지(초). */
export const PULSE_SECONDS = 0.9;

// ------------------------------------------------------------------------
// 배치 — 월드 좌표. 가로 1 = 10¹⁴ Hz, 세로 `perEv` = 1 eV.
// ------------------------------------------------------------------------

export const PLOT = {
  /** 세로 배율(월드 / eV). */
  perEv: 1.45,
  /** 가로축 끝(10¹⁴ Hz) · 세로축 끝(eV). */
  axisEndF: 17,
  axisTopEv: 5,
  /** 축 아래 가시광 띠의 두께(월드). */
  stripH: 0.28,
} as const;

/** 캡션 자리(월드). 캡션 슬롯은 프레이밍 여백으로 잡히지 않아(장부 G24) 경계에 직접 더한다. */
export const CAPTION_BAND = 0.9;

/** 프레이밍은 고정 — 세로축 이름 위부터, 문턱 이름표 · 캡션 띠 아래까지, 오른쪽은 금속 이름표 자리. */
export const SCENE_BOUNDS = {
  minX: -1.2,
  maxX: 21.6,
  minY: -1.3 - CAPTION_BAND,
  maxY: PLOT.axisTopEv * PLOT.perEv + 0.9,
} as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이(초)
// ------------------------------------------------------------------------

export const PHASE_NA_BELOW = 2.6;
export const PHASE_NA_ABOVE = 3.0;
export const PHASE_NA_HOLD = 0.8;
/**
 * 구리 문턱 전 — 가시광 구간(3 → 7.9) · 자외선 구간(7.9 → 11.36). 두 길이는 커서가 같은 빠르기로 가도록
 * 진동수 폭에 비례해 나눴다(합 3.4). 훑는 범위나 `uvFrom` 을 바꾸면 이 비도 함께 맞춘다 (장부 G13).
 */
export const PHASE_CU_BELOW = 2.0;
export const PHASE_CU_UV = 1.4;
export const PHASE_CU_ABOVE = 2.4;
export const PHASE_CU_HOLD = 0.6;
export const PHASE_SLIDE = 2.4;
export const PHASE_MATCH = 2.8;
export const PHASE_FADE = 0.8;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const workFunctionAndThresholdMessages = Object.freeze({
  'label.title': { ko: '일함수와 문턱 진동수', en: 'Work function and threshold frequency' },
  'label.operation': { ko: '세기가 아니라 진동수가 정하는 것', en: 'Set by frequency, not by intensity' },
  'label.stage': { ko: '나트륨과 구리', en: 'Sodium and copper' },
  'label.view': { ko: '기본', en: 'Default' },

  /** 축 이름. 조사가 붙거나 어순이 갈리는 말이라 문안이다 (C1 판정 4). */
  'label.axisF': { ko: '진동수 (×10¹⁴ Hz)', en: 'frequency (×10¹⁴ Hz)' },
  'label.axisK': { ko: '튀어나온 전자의 최대 에너지 (eV)', en: 'max energy of ejected electrons (eV)' },
  'label.ultraviolet': { ko: '자외선', en: 'ultraviolet' },
  /** 금속 이름표 — 일함수는 선언한 정박값을 끼운다 (C1 · S-piece 유효숫자). */
  'label.sodium': { ko: '나트륨 · 일함수 {w} eV', en: 'sodium · work function {w} eV' },
  'label.copper': { ko: '구리 · 일함수 {w} eV', en: 'copper · work function {w} eV' },
  /** 문턱 진동수 — 정박값을 끼운다. 단위는 가로축 이름이 준다. */
  'label.threshold': { ko: '문턱 {f}', en: 'threshold {f}' },
  /** 기울기 — `h` 는 표식이고 「기울기」 는 문안이다. */
  'label.slope': { ko: '기울기 h', en: 'slope h' },

  'caption.naBelow': {
    ko: '나트륨에 비추는 빛의 진동수를 올려 가도, 문턱에 닿기 전에는 전자가 하나도 나오지 않는다',
    en: 'Raising the frequency of light on sodium frees no electrons at all until it reaches the threshold',
  },
  'caption.naAbove': {
    ko: '문턱을 넘는 순간부터 전자가 튀어나오고, 그 에너지는 진동수를 따라 곧게 자란다',
    en: 'Past the threshold electrons fly out, and their energy grows in a straight line with frequency',
  },
  'caption.cuBelow': {
    ko: '구리에 비추는 빛의 진동수를 올려 나트륨의 문턱을 지나도 전자가 나오지 않는다',
    en: "Raising the frequency on copper past sodium's threshold still frees no electrons",
  },
  'caption.cuUv': {
    ko: '일함수가 큰 구리는 자외선에 들어서도 한참 동안 전자가 나오지 않는다',
    en: 'Copper, with a larger work function, frees nothing even well into the ultraviolet',
  },
  'caption.cuAbove': {
    ko: '구리의 문턱은 더 높은 진동수에 있고, 넘은 뒤에는 나트륨과 나란히 자란다',
    en: "Copper's threshold sits at a higher frequency; beyond it the line runs parallel to sodium's",
  },
  'caption.slide': {
    ko: '나트륨의 직선을 오른쪽으로 옮기면 구리의 직선에 꼭 겹친다',
    en: "Slide the sodium line to the right and it lands exactly on copper's",
  },
  'caption.match': {
    ko: '기울기 h 는 어느 금속이나 같다 — 금속이 바꾸는 것은 문턱뿐이다',
    en: 'The slope h is the same for every metal — the metal only moves the threshold',
  },
} satisfies Record<string, LocalizedText>);

export type WorkFunctionAndThresholdMessageKey = keyof typeof workFunctionAndThresholdMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: WorkFunctionAndThresholdMessageKey): LocalizedText => workFunctionAndThresholdMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: WorkFunctionAndThresholdMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const workFunctionAndThresholdSchema: BundleSchema = {
  id: WORK_FUNCTION_AND_THRESHOLD_ID,
  label: text('label.title'),
  category: 'modern',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 한 주기 안에 두 금속을 훑고 두 직선을 겹쳐 본다 (controllers.ts).
  parameters: [],

  stages: [
    {
      id: 'sodium-copper',
      label: text('label.stage'),
      constants: {
        workFunctionNa: WORK_FUNCTION_NA,
        workFunctionCu: WORK_FUNCTION_CU,
        planck: PLANCK,
        thresholdNa: THRESHOLD_NA,
        thresholdCu: THRESHOLD_CU,
        sweepFrom: SWEEP_FROM,
        sweepTo: SWEEP_TO,
        uvFrom: UV_FROM,
        pulseSeconds: PULSE_SECONDS,
      },
    },
  ],

  environments: [],

  views: [{ id: 'main', label: text('label.view'), default: true }],

  /** 가로로 넓은 그래프 한 판 · 캡션 한 줄. 세로가 비싸다 (S-piece). 마운트 뒤 바뀌지 않는다. */
  canvas: { height: 400, minHeight: 340 },

  /** 미끄러지는 사본이 구리 직선 **위**에 얹혀야 겹침이 보인다 — scene 에 쓴 순서로 그린다. */
  drawOrder: 'scene',

  /**
   * 한 주기 = 나트륨 훑기(문턱 전 · 뒤 · 멈춤) → 구리 훑기(문턱 전 가시광 · 문턱 전 자외선 · 뒤 · 멈춤) → 사본 옮기기 → 겹침 → 흐려짐.
   *
   * 「문턱 전」 단계는 훑는 시작에서 문턱까지, 「문턱 뒤」 단계는 문턱에서 끝까지를 맡는다 — 단계
   * 경계가 곧 문턱을 넘는 순간이라 단계 길이를 바꿔도 문턱과 어긋나지 않는다.
   */
  timeline: {
    phases: [
      { id: 'na-below', duration: PHASE_NA_BELOW, caption: key('caption.naBelow') },
      { id: 'na-above', duration: PHASE_NA_ABOVE, caption: key('caption.naAbove') },
      { id: 'na-hold', duration: PHASE_NA_HOLD, caption: key('caption.naAbove') },
      { id: 'cu-below', duration: PHASE_CU_BELOW, caption: key('caption.cuBelow') },
      { id: 'cu-uv', duration: PHASE_CU_UV, caption: key('caption.cuUv') },
      { id: 'cu-above', duration: PHASE_CU_ABOVE, caption: key('caption.cuAbove') },
      { id: 'cu-hold', duration: PHASE_CU_HOLD, caption: key('caption.cuAbove') },
      { id: 'slide', duration: PHASE_SLIDE, ease: 'smooth', caption: key('caption.slide') },
      { id: 'match', duration: PHASE_MATCH, caption: key('caption.match') },
      { id: 'fade', duration: PHASE_FADE, caption: key('caption.match') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — 나트륨을 훑는 커서가 가시광 한가운데를 지나는 자리에서 연다. */
  startAt: 1.4,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — Kmax = hf − φ 식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -6] },
    fontSize: 13,
    wrapWidth: 760,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  messages: workFunctionAndThresholdMessages,
};
