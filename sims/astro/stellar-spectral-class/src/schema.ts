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
  'label.title': {
    ko: '별의 스펙트럼 분류',
    en: 'Stellar spectral classes',
    ja: '恒星のスペクトル型',
    zh: '恒星光谱型',
    ar: 'الأصناف الطيفية للنجوم',
    es: 'Clases espectrales estelares',
    fr: 'Types spectraux des étoiles',
    hi: 'तारों के स्पेक्ट्रमी वर्ग',
    id: 'Kelas spektrum bintang',
    pt: 'Classes espectrais estelares',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '온도가 정하는 흡수선 무늬',
    en: 'Absorption-line patterns set by temperature',
    ja: '温度が決める吸収線の模様',
    zh: '由温度决定的吸收线图样',
    ar: 'أنماط خطوط الامتصاص التي تحددها درجة الحرارة',
    es: 'Patrones de líneas de absorción fijados por la temperatura',
    fr: 'Motifs de raies d’absorption fixés par la température',
    hi: 'ताप द्वारा तय अवशोषण-रेखाओं के प्रतिरूप',
    id: 'Pola garis serapan yang ditentukan suhu',
    pt: 'Padrões de linhas de absorção definidos pela temperatura',
  },
  'label.stage': {
    ko: 'O 에서 M 까지',
    en: 'From O to M',
    ja: 'O から M まで',
    zh: '从 O 到 M',
    ar: 'من O إلى M',
    es: 'De O a M',
    fr: 'De O à M',
    hi: 'O से M तक',
    id: 'Dari O ke M',
    pt: 'De O a M',
  },
  'label.view': {
    ko: '스펙트럼과 분광형',
    en: 'Spectrum and class',
    ja: 'スペクトルとスペクトル型',
    zh: '光谱与光谱型',
    ar: 'الطيف والصنف',
    es: 'Espectro y clase',
    fr: 'Spectre et type',
    hi: 'स्पेक्ट्रम और वर्ग',
    id: 'Spektrum dan kelas',
    pt: 'Espectro e classe',
  },
  /** 분광형 글자 — 분야 원어로 통용되는 기호라 표식이다 (C1 판정 2). */
  'class.O': {
    ko: 'O',
    en: 'O',
    ja: 'O',
    zh: 'O',
    ar: 'O',
    es: 'O',
    fr: 'O',
    hi: 'O',
    id: 'O',
    pt: 'O',
  },
  'class.B': {
    ko: 'B',
    en: 'B',
    ja: 'B',
    zh: 'B',
    ar: 'B',
    es: 'B',
    fr: 'B',
    hi: 'B',
    id: 'B',
    pt: 'B',
  },
  'class.A': {
    ko: 'A',
    en: 'A',
    ja: 'A',
    zh: 'A',
    ar: 'A',
    es: 'A',
    fr: 'A',
    hi: 'A',
    id: 'A',
    pt: 'A',
  },
  'class.F': {
    ko: 'F',
    en: 'F',
    ja: 'F',
    zh: 'F',
    ar: 'F',
    es: 'F',
    fr: 'F',
    hi: 'F',
    id: 'F',
    pt: 'F',
  },
  'class.G': {
    ko: 'G',
    en: 'G',
    ja: 'G',
    zh: 'G',
    ar: 'G',
    es: 'G',
    fr: 'G',
    hi: 'G',
    id: 'G',
    pt: 'G',
  },
  'class.K': {
    ko: 'K',
    en: 'K',
    ja: 'K',
    zh: 'K',
    ar: 'K',
    es: 'K',
    fr: 'K',
    hi: 'K',
    id: 'K',
    pt: 'K',
  },
  'class.M': {
    ko: 'M',
    en: 'M',
    ja: 'M',
    zh: 'M',
    ar: 'M',
    es: 'M',
    fr: 'M',
    hi: 'M',
    id: 'M',
    pt: 'M',
  },
  /** 발머선 기호 — 표식 (C1 판정 3). */
  'line.halpha': {
    ko: 'Hα',
    en: 'Hα',
    ja: 'Hα',
    zh: 'Hα',
    ar: 'Hα',
    es: 'Hα',
    fr: 'Hα',
    hi: 'Hα',
    id: 'Hα',
    pt: 'Hα',
  },
  'line.hbeta': {
    ko: 'Hβ',
    en: 'Hβ',
    ja: 'Hβ',
    zh: 'Hβ',
    ar: 'Hβ',
    es: 'Hβ',
    fr: 'Hβ',
    hi: 'Hβ',
    id: 'Hβ',
    pt: 'Hβ',
  },
  'line.hgamma': {
    ko: 'Hγ',
    en: 'Hγ',
    ja: 'Hγ',
    zh: 'Hγ',
    ar: 'Hγ',
    es: 'Hγ',
    fr: 'Hγ',
    hi: 'Hγ',
    id: 'Hγ',
    pt: 'Hγ',
  },
  'line.hdelta': {
    ko: 'Hδ',
    en: 'Hδ',
    ja: 'Hδ',
    zh: 'Hδ',
    ar: 'Hδ',
    es: 'Hδ',
    fr: 'Hδ',
    hi: 'Hδ',
    id: 'Hδ',
    pt: 'Hδ',
  },
  /** 파장 눈금 — 수와 단위 기호뿐인 표식. */
  'tick.400': {
    ko: '400 nm',
    en: '400 nm',
    ja: '400 nm',
    zh: '400 nm',
    ar: '400 nm',
    es: '400 nm',
    fr: '400 nm',
    hi: '400 nm',
    id: '400 nm',
    pt: '400 nm',
  },
  'tick.500': {
    ko: '500 nm',
    en: '500 nm',
    ja: '500 nm',
    zh: '500 nm',
    ar: '500 nm',
    es: '500 nm',
    fr: '500 nm',
    hi: '500 nm',
    id: '500 nm',
    pt: '500 nm',
  },
  'tick.600': {
    ko: '600 nm',
    en: '600 nm',
    ja: '600 nm',
    zh: '600 nm',
    ar: '600 nm',
    es: '600 nm',
    fr: '600 nm',
    hi: '600 nm',
    id: '600 nm',
    pt: '600 nm',
  },
  'tick.700': {
    ko: '700 nm',
    en: '700 nm',
    ja: '700 nm',
    zh: '700 nm',
    ar: '700 nm',
    es: '700 nm',
    fr: '700 nm',
    hi: '700 nm',
    id: '700 nm',
    pt: '700 nm',
  },
  /** 곡선 이름 · 축 이름 · 방향 — 언어마다 다른 낱말이라 문안. */
  'label.hydrogen': {
    ko: '수소',
    en: 'hydrogen',
    ja: '水素',
    zh: '氢',
    ar: 'الهيدروجين',
    es: 'hidrógeno',
    fr: 'hydrogène',
    hi: 'हाइड्रोजन',
    id: 'hidrogen',
    pt: 'hidrogênio',
  },
  'label.metals': {
    ko: '금속',
    en: 'metals',
    ja: '金属',
    zh: '金属',
    ar: 'المعادن',
    es: 'metales',
    fr: 'métaux',
    hi: 'धातुएँ',
    id: 'logam',
    pt: 'metais',
  },
  'label.molecules': {
    ko: '분자',
    en: 'molecules',
    ja: '分子',
    zh: '分子',
    ar: 'الجزيئات',
    es: 'moléculas',
    fr: 'molécules',
    hi: 'अणु',
    id: 'molekul',
    pt: 'moléculas',
  },
  'label.strength': {
    ko: '선의 짙기',
    en: 'line strength',
    ja: '線の強さ',
    zh: '谱线强度',
    ar: 'شدة الخط',
    es: 'intensidad de línea',
    fr: 'intensité des raies',
    hi: 'रेखा की तीव्रता',
    id: 'kekuatan garis',
    pt: 'intensidade da linha',
  },
  'label.hotter': {
    ko: '← 뜨겁다',
    en: '← hotter',
    ja: '← 高温',
    zh: '← 更热',
    ar: '← أسخن',
    es: '← más caliente',
    fr: '← plus chaud',
    hi: '← अधिक गर्म',
    id: '← lebih panas',
    pt: '← mais quente',
  },
  'label.cooler': {
    ko: '차갑다 →',
    en: 'cooler →',
    ja: '低温 →',
    zh: '更冷 →',
    ar: 'أبرد →',
    es: 'más frío →',
    fr: 'plus froid →',
    hi: 'अधिक ठंडा →',
    id: 'lebih dingin →',
    pt: 'mais frio →',
  },
  /** 머무는 온도 — 값과 단위 기호. */
  'label.temperature': {
    ko: '{t} K',
    en: '{t} K',
    ja: '{t} K',
    zh: '{t} K',
    ar: '{t} K',
    es: '{t} K',
    fr: '{t} K',
    hi: '{t} K',
    id: '{t} K',
    pt: '{t} K',
  },
  'caption.o': {
    ko: '가장 뜨거운 O형 — 수소가 거의 다 이온화돼 발머선이 옅고, 헬륨 선 몇 개만 보인다',
    en: 'Hottest, type O — hydrogen is almost fully ionized, so the Balmer lines are faint; only a few helium lines show',
    ja: '最も高温のO型 — 水素がほぼ完全に電離していてバルマー線は淡く、ヘリウムの線がいくつか見えるだけ',
    zh: '最热的 O 型 — 氢几乎完全电离，巴耳末线很淡；只看得到几条氦线',
    ar: 'الأسخن، الصنف O — الهيدروجين متأيّن كليًا تقريبًا، فخطوط بالمر باهتة؛ ولا يظهر سوى بضعة خطوط للهيليوم',
    es: 'La más caliente, tipo O — el hidrógeno está casi totalmente ionizado, así que las líneas de Balmer son débiles; solo se ven algunas líneas de helio',
    fr: 'La plus chaude, type O — l’hydrogène est presque entièrement ionisé, donc les raies de Balmer sont faibles ; seules quelques raies de l’hélium apparaissent',
    hi: 'सबसे गर्म, O प्रकार — हाइड्रोजन लगभग पूरी तरह आयनित है, इसलिए बामर रेखाएँ धुँधली हैं; केवल हीलियम की कुछ रेखाएँ दिखती हैं',
    id: 'Paling panas, tipe O — hidrogen hampir terionisasi penuh, jadi garis Balmer samar; hanya beberapa garis helium yang tampak',
    pt: 'A mais quente, tipo O — o hidrogênio está quase todo ionizado, então as linhas de Balmer são fracas; só aparecem algumas linhas de hélio',
  },
  'caption.toA': {
    ko: '식어 가자 이온에서 돌아온 수소가 늘어 발머선이 짙어진다',
    en: 'As the star cools, more hydrogen stays neutral and the Balmer lines darken',
    ja: '星が冷えるにつれて中性のまま残る水素が増え、バルマー線が濃くなる',
    zh: '随着恒星冷却，保持中性的氢变多，巴耳末线变深',
    ar: 'مع برود النجم يبقى مزيد من الهيدروجين متعادلًا وتزداد خطوط بالمر قتامة',
    es: 'Al enfriarse la estrella, más hidrógeno queda neutro y las líneas de Balmer se oscurecen',
    fr: 'À mesure que l’étoile refroidit, davantage d’hydrogène reste neutre et les raies de Balmer s’assombrissent',
    hi: 'तारा ठंडा होने पर अधिक हाइड्रोजन उदासीन रहती है और बामर रेखाएँ गहरी होती जाती हैं',
    id: 'Saat bintang mendingin, makin banyak hidrogen tetap netral dan garis Balmer menggelap',
    pt: 'À medida que a estrela esfria, mais hidrogênio permanece neutro e as linhas de Balmer escurecem',
  },
  'caption.a': {
    ko: 'A형 — 들뜬 수소가 가장 많아 발머선이 가장 짙고 넓다',
    en: 'Type A — the most hydrogen sits in the excited level, so the Balmer lines are darkest and widest',
    ja: 'A型 — 励起状態にある水素が最も多く、バルマー線が最も濃く太い',
    zh: 'A 型 — 处于激发态的氢最多，巴耳末线最深最宽',
    ar: 'الصنف A — أكبر قدر من الهيدروجين في المستوى المثار، فتبلغ خطوط بالمر أقصى قتامتها وعرضها',
    es: 'Tipo A — el nivel excitado tiene la mayor cantidad de hidrógeno, así que las líneas de Balmer son las más oscuras y anchas',
    fr: 'Type A — le niveau excité contient le plus d’hydrogène, donc les raies de Balmer sont les plus sombres et les plus larges',
    hi: 'A प्रकार — उत्तेजित स्तर में सबसे अधिक हाइड्रोजन है, इसलिए बामर रेखाएँ सबसे गहरी और चौड़ी हैं',
    id: 'Tipe A — hidrogen paling banyak berada di tingkat tereksitasi, jadi garis Balmer paling gelap dan lebar',
    pt: 'Tipo A — o nível excitado tem a maior quantidade de hidrogênio, então as linhas de Balmer são as mais escuras e largas',
  },
  'caption.toG': {
    ko: '더 식으면 수소가 들뜨지 못해 발머선이 옅어지고, 금속 선이 늘어난다',
    en: 'Cooler still, hydrogen can no longer be excited: the Balmer lines fade while metal lines multiply',
    ja: 'さらに冷えると水素はもう励起されない：バルマー線が淡くなり、金属の線が増えていく',
    zh: '再冷一些，氢就无法被激发了：巴耳末线变淡，金属线不断增多',
    ar: 'ومع مزيد من البرودة لا يعود الهيدروجين قابلًا للإثارة: تبهت خطوط بالمر بينما تتكاثر خطوط المعادن',
    es: 'Aún más fría, el hidrógeno ya no puede excitarse: las líneas de Balmer se desvanecen mientras las de metales se multiplican',
    fr: 'Plus froide encore, l’hydrogène ne peut plus être excité : les raies de Balmer s’effacent tandis que les raies métalliques se multiplient',
    hi: 'और ठंडा होने पर हाइड्रोजन अब उत्तेजित नहीं हो पाती: बामर रेखाएँ धुँधली पड़ती हैं और धातु रेखाएँ बढ़ती जाती हैं',
    id: 'Makin dingin lagi, hidrogen tak bisa tereksitasi lagi: garis Balmer memudar sementara garis logam bertambah banyak',
    pt: 'Mais fria ainda, o hidrogênio já não consegue ser excitado: as linhas de Balmer esmaecem enquanto as linhas de metais se multiplicam',
  },
  'caption.g': {
    ko: '태양 같은 G형 — 칼슘 · 철 같은 금속 선이 빽빽하고 발머선은 가늘다',
    en: 'Type G, like the Sun — metal lines such as calcium and iron crowd in, and the Balmer lines are thin',
    ja: '太陽のようなG型 — カルシウムや鉄などの金属の線がびっしり並び、バルマー線は細い',
    zh: '像太阳一样的 G 型 — 钙、铁等金属线密密麻麻，巴耳末线很细',
    ar: 'الصنف G، مثل الشمس — تتزاحم خطوط المعادن كالكالسيوم والحديد، وخطوط بالمر رفيعة',
    es: 'Tipo G, como el Sol — se amontonan líneas de metales como el calcio y el hierro, y las líneas de Balmer son finas',
    fr: 'Type G, comme le Soleil — les raies de métaux comme le calcium et le fer se bousculent, et les raies de Balmer sont fines',
    hi: 'G प्रकार, सूर्य जैसा — कैल्सियम और लोहे जैसी धातुओं की रेखाएँ घनी हो जाती हैं, और बामर रेखाएँ पतली हैं',
    id: 'Tipe G, seperti Matahari — garis logam seperti kalsium dan besi berjejal, dan garis Balmer tipis',
    pt: 'Tipo G, como o Sol — linhas de metais como cálcio e ferro se aglomeram, e as linhas de Balmer são finas',
  },
  'caption.toM': {
    ko: '차가워질수록 금속 선이 짙어지고 분자가 생기기 시작한다',
    en: 'Cooling further, the metal lines deepen and molecules begin to form',
    ja: 'さらに冷えると金属の線が濃くなり、分子ができ始める',
    zh: '继续冷却，金属线加深，分子开始形成',
    ar: 'ومع استمرار البرودة تزداد خطوط المعادن عمقًا وتبدأ الجزيئات في التكوّن',
    es: 'Al enfriarse más, las líneas de metales se intensifican y empiezan a formarse moléculas',
    fr: 'En refroidissant encore, les raies métalliques se creusent et des molécules commencent à se former',
    hi: 'और ठंडा होने पर धातु रेखाएँ गहरी होती हैं और अणु बनने लगते हैं',
    id: 'Makin mendingin, garis logam makin dalam dan molekul mulai terbentuk',
    pt: 'Esfriando mais, as linhas de metais se aprofundam e moléculas começam a se formar',
  },
  'caption.m': {
    ko: '가장 차가운 M형 — 산화 타이타늄 분자의 넓은 띠가 빛을 깎아 낸다',
    en: 'Coolest, type M — broad bands of titanium oxide molecules carve away the light',
    ja: '最も低温のM型 — 酸化チタン分子の幅広い帯が光を削り取る',
    zh: '最冷的 M 型 — 氧化钛分子的宽带削去了光',
    ar: 'الأبرد، الصنف M — نطاقات عريضة لجزيئات أكسيد التيتانيوم تقتطع من الضوء',
    es: 'La más fría, tipo M — anchas bandas de moléculas de óxido de titanio recortan la luz',
    fr: 'La plus froide, type M — de larges bandes de molécules d’oxyde de titane entaillent la lumière',
    hi: 'सबसे ठंडा, M प्रकार — टाइटेनियम ऑक्साइड अणुओं की चौड़ी पट्टियाँ प्रकाश को काट लेती हैं',
    id: 'Paling dingin, tipe M — pita lebar molekul titanium oksida mengikis cahaya',
    pt: 'A mais fria, tipo M — largas bandas de moléculas de óxido de titânio recortam a luz',
  },
  'caption.back': {
    ko: '다시 뜨거워지면 무늬가 M 에서 O 로 거슬러 간다 — 글자의 순서가 온도의 순서다',
    en: 'Heating back up, the pattern runs from M back to O — the order of the letters is the order of temperature',
    ja: '再び熱くなると、模様はMからOへと逆にたどる — 文字の順序は温度の順序だ',
    zh: '重新变热，图样从 M 倒回 O — 字母的顺序就是温度的顺序',
    ar: 'عند التسخين من جديد يعود النمط من M إلى O — ترتيب الحروف هو ترتيب درجة الحرارة',
    es: 'Al volver a calentarse, el patrón recorre de M de vuelta a O — el orden de las letras es el orden de la temperatura',
    fr: 'En se réchauffant, le motif repart de M jusqu’à O — l’ordre des lettres est l’ordre des températures',
    hi: 'फिर से गर्म होने पर प्रतिरूप M से वापस O तक जाता है — अक्षरों का क्रम ताप का क्रम है',
    id: 'Saat memanas kembali, polanya berjalan dari M kembali ke O — urutan huruf adalah urutan suhu',
    pt: 'Aquecendo de novo, o padrão volta de M até O — a ordem das letras é a ordem da temperatura',
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
  description: text('label.description'),
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
