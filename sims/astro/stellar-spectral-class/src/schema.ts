// ========================================================================
// stellar-spectral-class — 선언
// ========================================================================
// 질문: 별의 스펙트럼 분류 O B A F G K M 은 무엇의 순서인가.
//
// 위에 그 별의 스펙트럼 — 무지개 띠 위에 검은 흡수선이 새겨져 있다. 아래에 로그 온도 축 위의
// 분광형 글자와, 선 무리마다의 짙기 곡선(수소 · 금속 · 분자). 온도가 내려가면 흡수선 무늬가
// O 에서 M 으로 옮겨 간다 — 수소 발머선은 A형(약 1만 K)에서 가장 짙고, 그보다 뜨거우면 수소가
// 이온화돼, 차가우면 들뜨지 못해 옅어진다. 차가운 별로 갈수록 금속 · 분자 선이 늘어난다.
// 그래서 O B A F G K M 은 온도 순서다.
//
// 띠의 연속 색은 온도와 무관하게 고정이다 — 별빛의 색은 이웃 `star-color-temperature` 의 몫이고,
// 이 조각의 주인은 흡수선 무늬다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:stellar-spectral-class` 와 문자 그대로 일치한다 (C4). */
export const STELLAR_SPECTRAL_CLASS_ID = 'stellar-spectral-class';

// ------------------------------------------------------------------------
// 분광형과 선 무리
// ------------------------------------------------------------------------

/** 분광형 — 뜨거운 쪽부터. */
export const CLASS_IDS = ['O', 'B', 'A', 'F', 'G', 'K', 'M'] as const;
export type SpectralClass = (typeof CLASS_IDS)[number];

/**
 * 분광형마다 대표 표면 온도(K) — 스테이지 상수의 기본값이다 (`t_<분광형>`).
 * 온도 축 위 글자의 자리이고, O · A · G · M 은 시간표가 머무는 온도이기도 하다.
 */
export const CLASS_TEMPERATURE: Readonly<Record<SpectralClass, number>> = {
  O: 40000,
  B: 20000,
  A: 9500,
  F: 7000,
  G: 5800,
  K: 4500,
  M: 3200,
};

/** 흡수선 무리. 같은 무리는 온도에 따라 함께 짙어지고 옅어진다. */
export const LINE_GROUPS = ['hydrogen', 'heliumII', 'heliumI', 'calcium', 'metals', 'molecules'] as const;
export type LineGroup = (typeof LINE_GROUPS)[number];

/**
 * 선 무리의 짙기(0~1) — 분광형마다. 스테이지 상수의 기본값이다 (`<무리>_<분광형>`).
 * 분광 분류 교과서의 정성 기술을 옮긴 표다 — 수소는 A 에서 가장 짙고, 이온화된 헬륨은 O,
 * 중성 헬륨은 B, 칼슘(Ca II H · K) · 금속은 G · K, 산화 타이타늄 분자는 M 에서.
 */
export const LINE_STRENGTH: Readonly<Record<LineGroup, Readonly<Record<SpectralClass, number>>>> = {
  hydrogen: { O: 0.2, B: 0.55, A: 1, F: 0.6, G: 0.3, K: 0.15, M: 0.06 },
  heliumII: { O: 0.8, B: 0.05, A: 0, F: 0, G: 0, K: 0, M: 0 },
  heliumI: { O: 0.4, B: 0.8, A: 0.08, F: 0, G: 0, K: 0, M: 0 },
  calcium: { O: 0, B: 0.05, A: 0.25, F: 0.6, G: 0.9, K: 1, M: 0.8 },
  metals: { O: 0, B: 0.02, A: 0.1, F: 0.35, G: 0.65, K: 0.9, M: 0.85 },
  molecules: { O: 0, B: 0, A: 0, F: 0, G: 0, K: 0.12, M: 1 },
};

/** 스테이지 상수 이름. */
export const classTemperatureKey = (c: SpectralClass): string => `t_${c}`;
export const strengthKey = (g: LineGroup, c: SpectralClass): string => `${g}_${c}`;

/**
 * 흡수선 목록(선언 데이터) — 파장(nm) · 가장 짙을 때의 깊이(0~1) · 가장 짙을 때의 반폭(nm).
 * 무리의 짙기가 깊이와 폭을 함께 키운다 — A형의 발머선은 짙고 넓다.
 */
export interface AbsorptionLine {
  nm: number;
  group: Exclude<LineGroup, 'molecules'>;
  depth: number;
  width: number;
  /** 띠 위에 이름표를 다는 선(발머선)만. */
  labelKey?: StellarSpectralClassMessageKey;
}

export const ABSORPTION_LINES: readonly AbsorptionLine[] = [
  // 수소 발머 계열
  { nm: 656.28, group: 'hydrogen', depth: 0.97, width: 4.6, labelKey: 'line.halpha' },
  { nm: 486.13, group: 'hydrogen', depth: 0.97, width: 4.8, labelKey: 'line.hbeta' },
  { nm: 434.05, group: 'hydrogen', depth: 0.96, width: 4.4, labelKey: 'line.hgamma' },
  { nm: 410.17, group: 'hydrogen', depth: 0.95, width: 4.0, labelKey: 'line.hdelta' },
  { nm: 397.01, group: 'hydrogen', depth: 0.92, width: 3.4 },
  { nm: 388.9, group: 'hydrogen', depth: 0.88, width: 2.8 },
  { nm: 383.54, group: 'hydrogen', depth: 0.84, width: 2.3 },
  // 이온화된 헬륨 (O형)
  { nm: 468.57, group: 'heliumII', depth: 0.65, width: 1.28 },
  { nm: 454.14, group: 'heliumII', depth: 0.5, width: 1.12 },
  { nm: 541.15, group: 'heliumII', depth: 0.45, width: 1.12 },
  { nm: 419.99, group: 'heliumII', depth: 0.4, width: 0.96 },
  // 중성 헬륨 (B형)
  { nm: 447.15, group: 'heliumI', depth: 0.65, width: 1.12 },
  { nm: 402.62, group: 'heliumI', depth: 0.55, width: 0.96 },
  { nm: 471.31, group: 'heliumI', depth: 0.45, width: 0.96 },
  { nm: 492.19, group: 'heliumI', depth: 0.5, width: 0.96 },
  { nm: 501.57, group: 'heliumI', depth: 0.45, width: 0.96 },
  { nm: 587.56, group: 'heliumI', depth: 0.6, width: 1.12 },
  { nm: 667.82, group: 'heliumI', depth: 0.5, width: 1.12 },
  // 이온화된 칼슘 H · K
  { nm: 393.37, group: 'calcium', depth: 0.98, width: 3.0 },
  { nm: 396.85, group: 'calcium', depth: 0.96, width: 2.8 },
  // 금속 — 중성 칼슘 · 철 · 마그네슘 b · 나트륨 D · CH 의 G 띠
  { nm: 422.67, group: 'metals', depth: 0.75, width: 0.96 },
  { nm: 430.5, group: 'metals', depth: 0.65, width: 1.6 },
  { nm: 438.35, group: 'metals', depth: 0.55, width: 0.64 },
  { nm: 404.58, group: 'metals', depth: 0.55, width: 0.64 },
  { nm: 495.76, group: 'metals', depth: 0.45, width: 0.56 },
  { nm: 516.73, group: 'metals', depth: 0.6, width: 0.64 },
  { nm: 517.27, group: 'metals', depth: 0.65, width: 0.64 },
  { nm: 518.36, group: 'metals', depth: 0.7, width: 0.72 },
  { nm: 527.04, group: 'metals', depth: 0.5, width: 0.56 },
  { nm: 532.8, group: 'metals', depth: 0.45, width: 0.56 },
  { nm: 588.99, group: 'metals', depth: 0.8, width: 0.72 },
  { nm: 589.59, group: 'metals', depth: 0.75, width: 0.72 },
  { nm: 612.22, group: 'metals', depth: 0.45, width: 0.56 },
  { nm: 616.22, group: 'metals', depth: 0.45, width: 0.56 },
  { nm: 649.5, group: 'metals', depth: 0.4, width: 0.56 },
];

/**
 * 선 모양 — 짙기가 0 일 때의 반폭 비율(짙어질수록 선이 넓어진다 — A형의 넓은 발머선)과
 * 분자 띠 머리의 짧은 파장 쪽 가장자리 폭(nm).
 */
export const LINE_PROFILE = { widthFloor: 0.35, bandEdgeNm: 0.4 } as const;

/**
 * 산화 타이타늄(TiO) 분자 띠 — 머리 파장(nm) · 가장 짙을 때의 깊이 · 붉은 쪽으로 옅어지는 길이(nm).
 * 머리(짧은 파장 쪽)에서 갑자기 어두워지고 긴 파장 쪽으로 서서히 밝아진다.
 */
export const MOLECULAR_BANDS: readonly { head: number; depth: number; length: number }[] = [
  { head: 476.1, depth: 0.75, length: 14 },
  { head: 495.4, depth: 0.8, length: 16 },
  { head: 516.7, depth: 0.8, length: 18 },
  { head: 544.8, depth: 0.85, length: 22 },
  { head: 584.7, depth: 0.88, length: 24 },
  { head: 615.9, depth: 0.92, length: 22 },
  { head: 670.5, depth: 0.92, length: 28 },
];

/**
 * 금속 선 숲 — 이름 없는 약한 금속 선들. 실제 스펙트럼의 수백 개 선을 흉내 낸다.
 * 시드를 받는 결정적 난수로 자리를 정한다 — 같은 시드는 언제나 같은 숲이다 (S-sim).
 */
export const METAL_FOREST = {
  seed: 21,
  count: 90,
  minNm: 400,
  maxNm: 690,
  depth: [0.3, 0.8] as const,
  width: [0.25, 0.55] as const,
};

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 위가 스펙트럼 띠, 아래가 온도 축과 선 세기 곡선.
// ------------------------------------------------------------------------

/** 띠가 보이는 파장 범위(nm). */
export const STRIP_NM = { min: 380, max: 700 } as const;
/** 띠 · 그래프가 함께 쓰는 가로 자리(월드). */
export const PANEL_X0 = 0;
export const PANEL_W = 14;
/** 띠의 아래 · 위(월드). */
export const STRIP_Y0 = 3.85;
export const STRIP_Y1 = 4.95;
/** 띠 가로 칸 수 — 0.5 nm 한 칸. */
export const STRIP_COLS = 640;
/** 발머선 이름표 높이와, 이름표에서 띠로 내리는 짧은 눈금. */
export const LINE_LABEL_Y = 5.38;
export const LINE_TICK: readonly [number, number] = [4.95, 5.12];
/** 파장 눈금(nm)과 이름표 높이. */
export const WAVELENGTH_TICKS: readonly { nm: number; key: StellarSpectralClassMessageKey }[] = [
  { nm: 400, key: 'tick.400' },
  { nm: 500, key: 'tick.500' },
  { nm: 600, key: 'tick.600' },
  { nm: 700, key: 'tick.700' },
];
export const WAVELENGTH_LABEL_Y = 3.53;

/** 온도 축 — 왼쪽 끝이 뜨겁고 오른쪽 끝이 차갑다(로그). 분광형 글자가 모두 들어가게. */
export const AXIS_T = { hot: 60000, cool: 2500 } as const;
/** 곡선의 바닥(온도 축)과 짙기 1 의 높이(월드). */
export const GRAPH_Y0 = 0.6;
export const GRAPH_H = 2.0;
/** 분광형 글자 · 방향 글자 · 머무는 온도 글자의 높이. */
export const CLASS_LABEL_Y = 0.12;
export const TEMP_LABEL_Y = -0.42;
/** 세로축 이름(선의 짙기)의 자리. */
export const STRENGTH_LABEL_POS: readonly [number, number] = [0.9, 2.95];

/**
 * 프레이밍은 주장의 일부다. 가로는 띠 · 그래프 좌우, 세로는 머무는 온도 글자 · 캡션 줄부터 발머선
 * 이름표 위까지. 매 프레임 같은 값이다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: -0.9, maxX: 14.9, minY: -1.35, maxY: 5.65 } as const;

// ------------------------------------------------------------------------
// 시간표
// ------------------------------------------------------------------------

/** 한 분광형에 머물며 무늬를 읽는 동안(초). */
export const HOLD = 3.5;
/** 다음 머묾까지 식어 가는 동안(초). */
export const RAMP = 2.8;
/** M 에서 O 로 다시 뜨거워지는 동안(초). */
export const RETURN = 3.2;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const stellarSpectralClassMessages = Object.freeze({
  'label.title': { ko: '별의 스펙트럼 분류', en: 'Stellar spectral classes' },
  'label.operation': { ko: '온도가 정하는 흡수선 무늬', en: 'Absorption-line patterns set by temperature' },
  'label.stage': { ko: 'O 에서 M 까지', en: 'From O to M' },
  'label.view': { ko: '스펙트럼과 분광형', en: 'Spectrum and class' },
  /** 분광형 글자 — 분야 원어로 통용되는 기호라 표식이다 (C1 판정 2). */
  'class.O': { ko: 'O', en: 'O' },
  'class.B': { ko: 'B', en: 'B' },
  'class.A': { ko: 'A', en: 'A' },
  'class.F': { ko: 'F', en: 'F' },
  'class.G': { ko: 'G', en: 'G' },
  'class.K': { ko: 'K', en: 'K' },
  'class.M': { ko: 'M', en: 'M' },
  /** 발머선 기호 — 표식 (C1 판정 3). */
  'line.halpha': { ko: 'Hα', en: 'Hα' },
  'line.hbeta': { ko: 'Hβ', en: 'Hβ' },
  'line.hgamma': { ko: 'Hγ', en: 'Hγ' },
  'line.hdelta': { ko: 'Hδ', en: 'Hδ' },
  /** 파장 눈금 — 수와 단위 기호뿐인 표식. */
  'tick.400': { ko: '400 nm', en: '400 nm' },
  'tick.500': { ko: '500 nm', en: '500 nm' },
  'tick.600': { ko: '600 nm', en: '600 nm' },
  'tick.700': { ko: '700 nm', en: '700 nm' },
  /** 곡선 이름 · 축 이름 · 방향 — 언어마다 다른 낱말이라 문안. */
  'label.hydrogen': { ko: '수소', en: 'hydrogen' },
  'label.metals': { ko: '금속', en: 'metals' },
  'label.molecules': { ko: '분자', en: 'molecules' },
  'label.strength': { ko: '선의 짙기', en: 'line strength' },
  'label.hotter': { ko: '← 뜨겁다', en: '← hotter' },
  'label.cooler': { ko: '차갑다 →', en: 'cooler →' },
  /** 머무는 온도 — 값과 단위 기호. */
  'label.temperature': { ko: '{t} K', en: '{t} K' },
  'caption.o': {
    ko: '가장 뜨거운 O형 — 수소가 거의 다 이온화돼 발머선이 옅고, 헬륨 선 몇 개만 보인다',
    en: 'Hottest, type O — hydrogen is almost fully ionized, so the Balmer lines are faint; only a few helium lines show',
  },
  'caption.toA': {
    ko: '식어 가자 이온에서 돌아온 수소가 늘어 발머선이 짙어진다',
    en: 'As the star cools, more hydrogen stays neutral and the Balmer lines darken',
  },
  'caption.a': {
    ko: 'A형 — 들뜬 수소가 가장 많아 발머선이 가장 짙고 넓다',
    en: 'Type A — the most hydrogen sits in the excited level, so the Balmer lines are darkest and widest',
  },
  'caption.toG': {
    ko: '더 식으면 수소가 들뜨지 못해 발머선이 옅어지고, 금속 선이 늘어난다',
    en: 'Cooler still, hydrogen can no longer be excited: the Balmer lines fade while metal lines multiply',
  },
  'caption.g': {
    ko: '태양 같은 G형 — 칼슘 · 철 같은 금속 선이 빽빽하고 발머선은 가늘다',
    en: 'Type G, like the Sun — metal lines such as calcium and iron crowd in, and the Balmer lines are thin',
  },
  'caption.toM': {
    ko: '차가워질수록 금속 선이 짙어지고 분자가 생기기 시작한다',
    en: 'Cooling further, the metal lines deepen and molecules begin to form',
  },
  'caption.m': {
    ko: '가장 차가운 M형 — 산화 타이타늄 분자의 넓은 띠가 빛을 깎아 낸다',
    en: 'Coolest, type M — broad bands of titanium oxide molecules carve away the light',
  },
  'caption.back': {
    ko: '다시 뜨거워지면 무늬가 M 에서 O 로 거슬러 간다 — 글자의 순서가 온도의 순서다',
    en: 'Heating back up, the pattern runs from M back to O — the order of the letters is the order of temperature',
  },
} satisfies Record<string, LocalizedText>);

export type StellarSpectralClassMessageKey = keyof typeof stellarSpectralClassMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: StellarSpectralClassMessageKey): LocalizedText => stellarSpectralClassMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: StellarSpectralClassMessageKey): string {
  return k;
}

/** 스테이지 상수 — 분광형 온도와 선 세기 표를 편집 가능한 수로 편다. */
function stageConstants(): Record<string, number> {
  const out: Record<string, number> = {};
  for (const c of CLASS_IDS) out[classTemperatureKey(c)] = CLASS_TEMPERATURE[c];
  for (const g of LINE_GROUPS) for (const c of CLASS_IDS) out[strengthKey(g, c)] = LINE_STRENGTH[g][c];
  out.lineWidthFloor = LINE_PROFILE.widthFloor;
  out.bandEdgeNm = LINE_PROFILE.bandEdgeNm;
  return out;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const stellarSpectralClassSchema: BundleSchema = {
  id: STELLAR_SPECTRAL_CLASS_ID,
  label: text('label.title'),
  category: 'astro',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 별이 O 에서 M 까지 식어 가며 무늬가 바뀌고, 다시 뜨거워진다.
  parameters: [],

  stages: [{ id: 'o-to-m', label: text('label.stage'), constants: stageConstants() }],

  environments: [],

  views: [{ id: 'spectrum-class', label: text('label.view'), default: true }],

  /** 가로로 넓은 그림이다. 세로를 더 주면 가로가 먼저 차서 띠만 작아진다 (S-piece — 세로가 비싸다). */
  canvas: { height: 380, minHeight: 330 },

  /** 겹침 순서가 판정 장치다 — 커서 선이 곡선 위, 이름표가 맨 위. scene 에 쓴 순서대로 그린다. */
  drawOrder: 'scene',

  /**
   * 한 주기 = O → 식음 → A → 식음 → G → 식음 → M → 다시 뜨거워짐.
   * 온도는 로그로 옮겨 간다 — 40000 → 9500 → 5800 → 3200 K.
   */
  timeline: {
    phases: [
      { id: 'o', duration: HOLD, caption: key('caption.o') },
      { id: 'toA', duration: RAMP, ease: 'smooth', caption: key('caption.toA') },
      { id: 'a', duration: HOLD, caption: key('caption.a') },
      { id: 'toG', duration: RAMP, ease: 'smooth', caption: key('caption.toG') },
      { id: 'g', duration: HOLD, caption: key('caption.g') },
      { id: 'toM', duration: RAMP, ease: 'smooth', caption: key('caption.toM') },
      { id: 'm', duration: HOLD, caption: key('caption.m') },
      { id: 'back', duration: RETURN, ease: 'smooth', caption: key('caption.back') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — O형을 잠깐 보고 곧 식기 시작한다. */
  startAt: 2,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 사하 · 볼츠만 식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    fade: 0.3,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  messages: stellarSpectralClassMessages,
};
