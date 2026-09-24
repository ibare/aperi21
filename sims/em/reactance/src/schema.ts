// ========================================================================
// reactance — 선언
// ========================================================================
// 질문: 교류에서 코일과 축전기는 전류를 얼마나 막는가 — 진동수에 따라 어떻게 달라지는가.
//
// 같은 교류 전압에 코일 하나 · 축전기 하나를 따로 이은 두 회로가 위아래에 있다. 각 회로의
// 전류 파형이 옆 기록지에 같은 세로 배율로 찍힌다. 진동수를 단계로 올리면 코일 쪽 파형은
// 낮아지고(더 막는다) 축전기 쪽 파형은 높아진다(덜 막는다). 오른쪽 X–f 평면에는 막는 정도
// 두 곡선 — 코일은 오르는 직선, 축전기는 내려가는 곡선 — 위로 지금 진동수 표지가 미끄러진다.
//
// 위상(전류가 전압보다 앞서는지 · 늦는지)은 `phase-in-ac-circuit` 의 몫이라 두지 않는다.
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:reactance` 와 문자 그대로 일치한다 (C4). */
export const REACTANCE_ID = 'reactance';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 전원 전압의 진폭(V). 두 회로가 같은 전원을 쓴다. */
export const VOLTAGE_V = 10;
/** 코일의 인덕턴스(mH). */
export const INDUCTANCE_MH = 100;
/** 축전기의 전기 용량(μF). */
export const CAPACITANCE_UF = 100;
/**
 * 진동수 단계(Hz). 한 주기에 이 넷을 차례로 오른 뒤 처음으로 내려온다. 두 배씩 올라
 * 코일 쪽 막는 정도는 단계마다 두 배, 축전기 쪽은 절반이 된다. 기본값에서 둘째 단계(50 Hz)가
 * 두 곡선이 만나는 자리 근처다.
 */
export const FREQ0_HZ = 25;
export const FREQ1_HZ = 50;
export const FREQ2_HZ = 100;
export const FREQ3_HZ = 200;

// ------------------------------------------------------------------------
// 표시 배율 — 전류를 파형 높이로, 진동수 · 막는 정도를 평면의 자리로 바꾸는 값 (원칙 2)
// ------------------------------------------------------------------------

/** 기록지 한 폭이 담는 시간(ms). 이 폭 안에서 파형이 몇 번 오르내리는지가 진동수다. */
export const SCOPE_WINDOW_MS = 40;
/** 전류 1 A 가 기록지에서 차지하는 높이(월드 단위). 두 기록지가 같은 값을 쓴다. */
export const CURRENT_SCALE = 0.62;
/** X–f 평면 가로축 끝(Hz) · 세로축 끝(Ω). */
export const GRAPH_FREQ_MAX = 225;
export const GRAPH_REACTANCE_MAX = 140;

// ------------------------------------------------------------------------
// 배치 — 월드 단위
// ------------------------------------------------------------------------

/** 두 줄(위: 코일 회로 · 아래: 축전기 회로)의 가운데 y. */
export const ROW_COIL_Y = 1.2;
export const ROW_CAP_Y = -1.2;

/** 회로 고리 — 왼쪽 가지(전원) x · 오른쪽 가지(소자) x · 고리 반 높이. */
export const LOOP_LEFT = -7.2;
export const LOOP_RIGHT = -5.0;
export const LOOP_HALF_H = 0.8;
/** 전원 원의 반지름 · 그 안 물결의 반 폭 · 반 높이. */
export const SOURCE_R = 0.3;
export const SOURCE_WAVE_HALF_W = 0.18;
export const SOURCE_WAVE_HALF_H = 0.1;
/** 코일 — 반 길이 · 감은 수 · 혹의 반지름(월드). */
export const COIL_HALF_LEN = 0.5;
export const COIL_TURNS = 4;
export const COIL_BUMP = 0.13;
/** 축전기 — 판 반 폭 · 판 사이 반 간격. */
export const PLATE_HALF_W = 0.28;
export const PLATE_HALF_GAP = 0.08;

/** 기록지 — 왼쪽 x · 오른쪽 x. 세로 가운데는 그 줄의 y. */
export const SCOPE_LEFT = -4.3;
export const SCOPE_RIGHT = 1.6;
/** 기록지 영점 축의 반 높이(세로 눈금 축 길이의 절반). */
export const SCOPE_AXIS_HALF_H = 0.95;

/** X–f 평면 — 원점 · 가로 길이 · 세로 길이. */
export const GRAPH_ORIGIN_X = 2.9;
export const GRAPH_ORIGIN_Y = -2.1;
export const GRAPH_WIDTH = 4.3;
export const GRAPH_HEIGHT = 4.3;

/**
 * 프레이밍은 주장의 일부다. 가로는 전원 이름표부터 평면 가로축 이름표 `f (Hz)` 까지, 세로는 캡션 줄
 * 아래에서 평면 꼭대기 이름표 위까지. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -8.4, maxX: 8.3, minY: -3.05, maxY: 2.75 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const reactanceMessages = Object.freeze({
  'label.title': { ko: '리액턴스와 임피던스', en: 'Reactance and impedance' },
  'label.operation': { ko: '주파수에 의존하는 저항', en: 'A resistance that depends on frequency' },
  'label.stage': { ko: '코일 하나 · 축전기 하나', en: 'One coil, one capacitor' },
  'label.view': { ko: '두 회로와 X–f 평면', en: 'Two circuits and the X–f plane' },
  /** 도식 표식 — 소자 · 물리량 기호라 번역하지 않는다 (C1 판정 3). */
  'label.inductor': { ko: 'L', en: 'L' },
  'label.capacitor': { ko: 'C', en: 'C' },
  'label.current': { ko: 'I', en: 'I' },
  'label.time': { ko: 't', en: 't' },
  'label.freqAxis': { ko: 'f (Hz)', en: 'f (Hz)' },
  'label.reactanceAxis': { ko: 'X (Ω)', en: 'X (Ω)' },
  /** 값이 끼는 조립 — 값은 스테이지 상수 그대로 `vars` 로 끼운다. */
  'label.voltage': { ko: '{v} V', en: '{v} V' },
  'label.inductance': { ko: '{v} mH', en: '{v} mH' },
  'label.capacitance': { ko: '{v} μF', en: '{v} μF' },
  'label.tick': { ko: '{v}', en: '{v}' },
  'caption.low': {
    ko: '같은 교류 전압에 코일과 축전기를 따로 이었다 — 낮은 진동수에서는 코일 쪽 전류가 크고 축전기 쪽 전류가 작다',
    en: 'The same AC voltage drives a coil and a capacitor separately — at a low frequency the coil lets a large current through and the capacitor a small one',
  },
  'caption.rise': {
    ko: '진동수를 올린다 — 코일은 더 막아 전류가 줄고, 축전기는 덜 막아 전류가 는다',
    en: 'Raising the frequency — the coil resists more and its current shrinks, the capacitor resists less and its current grows',
  },
  'caption.hold': {
    ko: '흐린 점선은 한 단계 낮은 진동수의 전류다 — 코일 쪽은 그보다 낮아졌고 축전기 쪽은 높아졌다',
    en: 'The faint dotted trace is the current one step lower — the coil’s current is now below it, the capacitor’s above it',
  },
  'caption.fall': {
    ko: '진동수를 처음으로 낮춘다 — 코일 쪽 전류가 다시 커지고 축전기 쪽 전류는 작아진다',
    en: 'Back down to the starting frequency — the coil’s current grows again and the capacitor’s shrinks',
  },
} satisfies Record<string, LocalizedText>);

export type ReactanceMessageKey = keyof typeof reactanceMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: ReactanceMessageKey): LocalizedText => reactanceMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ReactanceMessageKey): string {
  return k;
}

/**
 * 진동수 단계와 시간표 단계의 짝. 단계 `k` 는 스테이지 상수 `constant` 의 진동수에 머무르는
 * `hold` 단계를 갖고, 첫 단계를 뺀 나머지는 그 앞에 앞 단계에서 올라오는 `rise` 단계를 갖는다.
 * 마지막 단계 뒤 `FALL_PHASE` 가 첫 진동수로 내려온다. 단계의 **길이**는 선언(`timeline`)이 정한다.
 * 목록 길이가 코드에 남는 것은 NOTES (c) G105.
 */
export const FREQ_STEPS = [
  { constant: 'freq0', hold: 'hold0' },
  { constant: 'freq1', hold: 'hold1', rise: 'rise1' },
  { constant: 'freq2', hold: 'hold2', rise: 'rise2' },
  { constant: 'freq3', hold: 'hold3', rise: 'rise3' },
] as const;
export const FALL_PHASE = 'fall';

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const reactanceSchema: BundleSchema = {
  id: REACTANCE_ID,
  label: text('label.title'),
  category: 'em',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 진동수가 스스로 오르내리고 두 파형이 서로 반대로 움직인다.
  parameters: [],

  stages: [
    {
      id: 'coil-and-capacitor',
      label: text('label.stage'),
      constants: {
        voltage: VOLTAGE_V,
        inductance: INDUCTANCE_MH,
        capacitance: CAPACITANCE_UF,
        freq0: FREQ0_HZ,
        freq1: FREQ1_HZ,
        freq2: FREQ2_HZ,
        freq3: FREQ3_HZ,
        scopeWindow: SCOPE_WINDOW_MS,
        currentScale: CURRENT_SCALE,
        graphFreqMax: GRAPH_FREQ_MAX,
        graphReactanceMax: GRAPH_REACTANCE_MAX,
      },
    },
  ],

  environments: [],

  views: [{ id: 'circuits-and-plane', label: text('label.view'), default: true }],

  /** 두 줄 회로 · 기록지와 평면이 가로로 나란해 가로가 먼저 찬다. 세로는 두 줄과 캡션 한두 줄. */
  canvas: { height: 360, minHeight: 320 },

  /**
   * 한 주기 = 첫 진동수에 머묾 → 오름 → 머묾 … → 마지막 진동수에 머묾 → 처음으로 내려옴.
   * 오르는 단계의 진행도로 진동수를 로그 보간한다(두 배씩 오르는 단계가 같은 빠르기로 보이게).
   * 이웃 오름 단계는 같은 캡션 키라 다시 페이드하지 않는다.
   */
  timeline: {
    phases: [
      { id: 'hold0', duration: 3.2, caption: key('caption.low') },
      { id: 'rise1', duration: 1.6, ease: 'smooth', caption: key('caption.rise') },
      { id: 'hold1', duration: 2.6, caption: key('caption.hold') },
      { id: 'rise2', duration: 1.6, ease: 'smooth', caption: key('caption.rise') },
      { id: 'hold2', duration: 2.6, caption: key('caption.hold') },
      { id: 'rise3', duration: 1.6, ease: 'smooth', caption: key('caption.rise') },
      { id: 'hold3', duration: 2.6, caption: key('caption.hold') },
      { id: 'fall', duration: 2.2, ease: 'smooth', caption: key('caption.fall') },
    ],
  },

  /**
   * 도착한 순간 이미 진행 중이다 — 첫 진동수에서 조금 머문 뒤, 곧 오르기 시작하는 자리에서 연다.
   * 쌓는 상태가 없어 `preroll` 은 쓰지 않는다.
   */
  startAt: 1.4,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — X_L = ωL · X_C = 1/ωC 는 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 720,
    fade: 0.25,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /** 지금 진동수 표지(강조색)가 두 곡선 위에 놓여야 한다 — scene 에 쓴 순서대로 그린다. */
  drawOrder: 'scene',

  messages: reactanceMessages,
};
