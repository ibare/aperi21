// ========================================================================
// series-rlc-resonance — 선언
// ========================================================================
// 질문: 저항 · 코일 · 축전기를 한 줄로 이은 회로에 교류를 걸고 진동수를 올리면 전류는
// 어떻게 되는가. 어디서 가장 커지고, 저항은 그 모양을 어떻게 바꾸는가.
//
// 왼쪽에 직렬 RLC 회로 하나, 가운데에 막는 몫의 사슬(코일 몫 위 · 축전기 몫 아래 · 옆 칸에
// 둘을 합친 남은 몫 X 파선), 오른쪽에 전류 진폭–진동수(I–f) 평면. 구동 진동수를 쓸면 코일 몫은
// 늘고 축전기 몫은 줄어 f₀ 에서 두 팔의 길이가 같아진다 — 서로 지워 남은 몫이 사라지고 저항만
// 남아 전류 곡선이 거기서 솟는다. 저항을 줄여 다시 쓸면 봉우리가 더 높고 좁다.
//
// 코일 · 축전기 하나씩의 진동수 반응은 `reactance-and-impedance`, 전압과 전류의 때는
// `phase-in-ac-circuit`, 역학 공진은 `oscillation/resonance` 의 몫이라 되풀이하지 않는다.
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:series-rlc-resonance` 와 문자 그대로 일치한다 (C4). */
export const SERIES_RLC_RESONANCE_ID = 'series-rlc-resonance';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 전원 전압의 진폭(V). */
export const VOLTAGE_V = 10;
/** 첫 쓸기의 저항(Ω). 봉우리가 낮고 넓다. */
export const RESISTANCE_HIGH_OHM = 30;
/** 둘째 쓸기의 저항(Ω). 봉우리가 높고 좁다. */
export const RESISTANCE_LOW_OHM = 12;
/** 인덕턴스(mH). */
export const INDUCTANCE_MH = 100;
/** 전기 용량(μF). 기본값에서 공진 진동수는 약 159 Hz 다. */
export const CAPACITANCE_UF = 10;
/** 구동 진동수를 쓰는 범위(Hz). 공진 진동수가 이 안에 있어야 한다 (NOTES (c) G143). */
export const FREQ_MIN_HZ = 80;
export const FREQ_MAX_HZ = 280;

// ------------------------------------------------------------------------
// 표시 배율 — 진동수 · 전류 · 막는 정도를 월드 자리로 바꾸는 값 (원칙 2)
// ------------------------------------------------------------------------

/** I–f 평면 가로축 끝(Hz) · 세로축 끝(A). */
export const GRAPH_FREQ_MAX_HZ = 300;
export const GRAPH_CURRENT_MAX_A = 0.95;
/** 막는 몫 사슬에서 1 Ω 의 길이(월드). 코일 몫 · 축전기 몫 · 남은 몫이 같은 배율이다. */
export const OHM_SCALE = 0.011;

// ------------------------------------------------------------------------
// 배치 — 월드 단위
// ------------------------------------------------------------------------

/** 회로 고리 — 왼쪽(전원) · 오른쪽(코일) 가지 x, 위(저항) · 아래(축전기) 가지 y. */
export const LOOP_LEFT = -7.9;
export const LOOP_RIGHT = -5.7;
export const LOOP_TOP = 1.4;
export const LOOP_BOTTOM = -1.0;
/** 전원 원의 반지름 · 그 안 물결의 반 폭 · 반 높이. */
export const SOURCE_R = 0.3;
export const SOURCE_WAVE_HALF_W = 0.18;
export const SOURCE_WAVE_HALF_H = 0.1;
/** 저항 톱니 — 반 길이 · 꺾임 수 · 꺾임 높이. */
export const RESISTOR_HALF_LEN = 0.42;
export const RESISTOR_ZIGS = 6;
export const RESISTOR_AMP = 0.13;
/** 코일 — 반 길이 · 감은 수 · 혹의 반지름. */
export const COIL_HALF_LEN = 0.5;
export const COIL_TURNS = 4;
export const COIL_BUMP = 0.13;
/** 축전기 — 판 반 높이 · 판 사이 반 간격. 아래 가지에 세워 놓인다. */
export const PLATE_HALF_H = 0.28;
export const PLATE_HALF_GAP = 0.08;

/** 막는 몫 사슬의 원점. 코일 몫이 여기서 위로, 축전기 몫이 아래로 뻗는다. */
export const CHAIN_ORIGIN_X = -3.9;
export const CHAIN_ORIGIN_Y = 0.2;
/** 남은 몫(파선) 칸이 원점 오른쪽으로 떨어진 거리. */
export const CHAIN_NET_GAP = 0.7;
/** 기준선이 원점 왼쪽 · 남은 몫 칸 오른쪽으로 더 뻗는 길이. */
export const CHAIN_BASE_LEFT = 0.35;
export const CHAIN_BASE_RIGHT = 0.35;

/** I–f 평면 — 원점 · 가로 길이 · 세로 길이. */
export const GRAPH_ORIGIN_X = -1.8;
export const GRAPH_ORIGIN_Y = -1.9;
export const GRAPH_WIDTH = 7.6;
export const GRAPH_HEIGHT = 4.2;

/**
 * 프레이밍은 주장의 일부다. 가로는 전원 이름표부터 평면 가로축 이름 `f` 까지, 세로는 캡션 줄
 * 아래에서 평면 꼭대기 이름표 위까지. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -8.9, maxX: 6.4, minY: -2.95, maxY: 2.75 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const seriesRlcResonanceMessages = Object.freeze({
  'label.title': { ko: 'RLC 공진', en: 'RLC resonance' },
  'label.operation': { ko: '임피던스가 최소가 되는 주파수', en: 'The frequency where impedance is smallest' },
  'label.stage': { ko: '저항 두 가지', en: 'Two resistances' },
  'label.view': { ko: '회로 · 막는 몫 · I–f 평면', en: 'Circuit, reactance chain and the I–f plane' },
  /** 도식 표식 — 소자 · 물리량 기호라 번역하지 않는다 (C1 판정 3). */
  'label.resistor': { ko: 'R', en: 'R' },
  'label.inductor': { ko: 'L', en: 'L' },
  'label.capacitor': { ko: 'C', en: 'C' },
  'label.reactance': { ko: 'X', en: 'X' },
  'label.current': { ko: 'I', en: 'I' },
  'label.freqAxis': { ko: 'f', en: 'f' },
  'label.resonance': { ko: 'f₀', en: 'f₀' },
  /** 값이 끼는 조립 — 값은 스테이지 상수 그대로 `vars` 로 끼운다. */
  'label.voltage': { ko: '{v} V', en: '{v} V' },
  'label.resistance': { ko: '{v} Ω', en: '{v} Ω' },
  'label.inductance': { ko: '{v} mH', en: '{v} mH' },
  'label.capacitance': { ko: '{v} μF', en: '{v} μF' },
  'caption.approach': {
    ko: '구동 진동수를 올린다 — 코일과 축전기가 막는 정도가 가까워지며 전류가 커진다',
    en: 'Raising the driving frequency — how much the coil and the capacitor resist draws closer and the current grows',
  },
  'caption.peak': {
    ko: 'f₀ 에서 코일과 축전기가 막는 정도가 같아져 서로 지운다 — 저항만 남아 전류가 가장 크다',
    en: 'At f₀ the coil and the capacitor resist equally and cancel — only the resistance is left and the current is largest',
  },
  'caption.past': {
    ko: 'f₀ 를 지나면 코일이 더 막아 전류가 다시 줄어든다',
    en: 'Past f₀ the coil resists more and the current falls again',
  },
  'caption.swap': {
    ko: '저항을 줄이고 처음 진동수로 돌아간다 — 앞 곡선은 흐린 점선으로 남긴다',
    en: 'A smaller resistance, back to the starting frequency — the first curve stays as a faint dotted line',
  },
  'caption.peakLow': {
    ko: '공진 진동수는 그대로 f₀ 다 — 남는 저항이 작아 전류가 더 높이 솟는다',
    en: 'The resonant frequency is still f₀ — the resistance left over is smaller, so the current climbs higher',
  },
  'caption.pastLow': {
    ko: 'f₀ 를 벗어나자 전류가 가파르게 떨어진다',
    en: 'Moving off f₀, the current drops steeply',
  },
  'caption.compare': {
    ko: '저항이 작을수록 공진 봉우리가 높고 좁다',
    en: 'The smaller the resistance, the taller and narrower the resonance peak',
  },
  'caption.clear': {
    ko: '처음 저항으로 되돌린다',
    en: 'Back to the first resistance',
  },
} satisfies Record<string, LocalizedText>);

export type SeriesRlcResonanceMessageKey = keyof typeof seriesRlcResonanceMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: SeriesRlcResonanceMessageKey): LocalizedText => seriesRlcResonanceMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: SeriesRlcResonanceMessageKey): string {
  return k;
}

/**
 * 시간표 단계 id. scene · physics 가 `at(id)` 로 읽는다. 단계의 **길이 · 이징**은 아래
 * `timeline` 선언이 정한다 — 코드에는 이름만 있다 (S-piece 「시간표는 선언이다」).
 */
export const PHASE = {
  /** 큰 저항 — fMin 에서 f₀ 까지 오른다 · f₀ 에 머문다 · f₀ 에서 fMax 까지 오른다. */
  approachHigh: 'approach-high',
  peakHigh: 'peak-high',
  pastHigh: 'past-high',
  /** 저항을 줄이며 fMin 으로 돌아간다. */
  swap: 'swap',
  /** 작은 저항으로 같은 쓸기. */
  approachLow: 'approach-low',
  peakLow: 'peak-low',
  pastLow: 'past-low',
  /** 두 곡선을 나란히 둔다. */
  compare: 'compare',
  /** 곡선을 지우고 처음 저항 · 진동수로 돌아간다. */
  clear: 'clear',
} as const;

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const seriesRlcResonanceSchema: BundleSchema = {
  id: SERIES_RLC_RESONANCE_ID,
  label: text('label.title'),
  category: 'em',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 진동수가 스스로 쓸리고 저항 둘의 봉우리가 차례로 그려진다.
  parameters: [],

  stages: [
    {
      id: 'two-resistances',
      label: text('label.stage'),
      constants: {
        voltage: VOLTAGE_V,
        resistanceHigh: RESISTANCE_HIGH_OHM,
        resistanceLow: RESISTANCE_LOW_OHM,
        inductance: INDUCTANCE_MH,
        capacitance: CAPACITANCE_UF,
        freqMin: FREQ_MIN_HZ,
        freqMax: FREQ_MAX_HZ,
        graphFreqMax: GRAPH_FREQ_MAX_HZ,
        graphCurrentMax: GRAPH_CURRENT_MAX_A,
        ohmScale: OHM_SCALE,
      },
    },
  ],

  environments: [],

  views: [{ id: 'circuit-chain-plane', label: text('label.view'), default: true }],

  /** 회로 · 사슬 · 평면이 가로로 나란해 가로가 먼저 찬다. 세로는 평면 높이와 캡션 한 줄. */
  canvas: { height: 360, minHeight: 320 },

  /**
   * 한 주기 = 큰 저항으로 쓸기(오름 → f₀ 머묾 → 오름) → 저항을 줄이며 되돌아감 →
   * 작은 저항으로 같은 쓸기 → 두 곡선 견주기 → 지우고 되돌아감.
   * 오름 단계 길이는 쓰는 진동수 폭에 맞춰 두 오름이 비슷한 빠르기로 보이게 했다.
   */
  timeline: {
    phases: [
      { id: PHASE.approachHigh, duration: 2.6, caption: key('caption.approach') },
      { id: PHASE.peakHigh, duration: 2.4, caption: key('caption.peak') },
      { id: PHASE.pastHigh, duration: 3.4, caption: key('caption.past') },
      { id: PHASE.swap, duration: 2.2, ease: 'smooth', caption: key('caption.swap') },
      { id: PHASE.approachLow, duration: 2.6, caption: key('caption.approach') },
      { id: PHASE.peakLow, duration: 2.4, caption: key('caption.peakLow') },
      { id: PHASE.pastLow, duration: 3.4, caption: key('caption.pastLow') },
      { id: PHASE.compare, duration: 3.2, caption: key('caption.compare') },
      { id: PHASE.clear, duration: 1.6, ease: 'smooth', caption: key('caption.clear') },
    ],
  },

  /**
   * 도착한 순간 이미 진행 중이다 — 첫 오름의 가운데쯤에서 연다. 곡선이 이미 반쯤 그려져 있다.
   * 쌓는 상태가 없어 `preroll` 은 쓰지 않는다.
   */
  startAt: 1.0,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — f₀ = 1/2π√(LC) 는 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 720,
    fade: 0.25,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /** 지금 진동수 점(강조색)이 곡선 위에 놓여야 한다 — scene 에 쓴 순서대로 그린다. */
  drawOrder: 'scene',

  messages: seriesRlcResonanceMessages,
};
