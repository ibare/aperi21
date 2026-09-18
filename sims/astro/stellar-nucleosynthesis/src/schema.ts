// ========================================================================
// stellar-nucleosynthesis — 선언
// ========================================================================
// 질문: 별은 왜 철까지만 만드는가.
//
// 무거운 별의 중심에서 타고 남은 재가 다음 연료가 된다. 수소가 타서 헬륨이,
// 헬륨이 타서 탄소가 … 규소가 타서 철이 되며 중심에 한 겹씩 쌓여 양파가 된다.
// 한 겹 더할 때마다 원자핵은 핵자당 결합 에너지 곡선을 한 칸 오르고, 오른
// 높이만큼 에너지가 나온다. 철이 그 곡선의 꼭대기라, 철에 무엇을 더 붙여도
// 곡선을 내려간다 — 에너지를 내지 않고 먹는다. 그래서 핵융합은 철에서 멈춘다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:stellar-nucleosynthesis` 와 문자 그대로 일치한다 (C4). */
export const STELLAR_NUCLEOSYNTHESIS_ID = 'stellar-nucleosynthesis';

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const stellarNucleosynthesisMessages = Object.freeze({
  'label.title': { ko: '별의 원소 합성', en: 'Stellar nucleosynthesis' },
  'label.operation': {
    ko: '무거운 원소가 별에서 만들어지는 것',
    en: 'How heavier elements are made inside stars',
  },
  'label.stage': { ko: '무거운 별의 중심', en: 'Core of a massive star' },
  'label.view': { ko: '양파 껍질과 결합 에너지', en: 'Onion shells and binding energy' },
  /** 곡선 축 이름. 조사가 붙는 문장이라 문안이다 (C1 판정 4). */
  'label.axisBinding': { ko: '핵자당 결합 에너지 ↑', en: 'Binding energy per nucleon ↑' },
  'label.axisMass': { ko: '무거운 원자핵 →', en: 'Heavier nuclei →' },
  /** 원소 기호. 그 분야에서 원어로 통용되는 표식이지만 저작자가 바꿀 수 있게 키로 둔다. */
  'symbol.H': { ko: 'H', en: 'H' },
  'symbol.He': { ko: 'He', en: 'He' },
  'symbol.C': { ko: 'C', en: 'C' },
  'symbol.O': { ko: 'O', en: 'O' },
  'symbol.Ne': { ko: 'Ne', en: 'Ne' },
  'symbol.Mg': { ko: 'Mg', en: 'Mg' },
  'symbol.Si': { ko: 'Si', en: 'Si' },
  'symbol.Fe': { ko: 'Fe', en: 'Fe' },
  'symbol.Au': { ko: 'Au', en: 'Au' },
  'symbol.U': { ko: 'U', en: 'U' },
  'caption.hydrogen': {
    ko: '중심에서 수소가 헬륨으로 융합한다 — 곡선을 크게 오르며 에너지를 낸다',
    en: 'Hydrogen fuses into helium at the core — a big climb up the curve releases energy',
  },
  'caption.ladder': {
    ko: '타고 남은 재가 다음 연료가 된다 — 더 무거운 원소가 중심에 한 겹씩 쌓인다',
    en: 'The ash becomes the next fuel — a heavier element piles up at the core, shell by shell',
  },
  'caption.shallow': {
    ko: '한 겹 더할 때마다 오르막이 얕아진다 — 나오는 에너지가 줄어든다',
    en: 'Each new shell climbs less — less and less energy comes out',
  },
  'caption.iron': {
    ko: '규소가 타서 철이 된다 — 곡선의 꼭대기다',
    en: 'Silicon burns into iron — the top of the curve',
  },
  'caption.wall': {
    ko: '철에 무엇을 더 붙여도 곡선을 내려간다 — 에너지를 내지 않고 먹으니 중심의 불이 꺼진다',
    en: 'Anything fused onto iron goes down the curve — it costs energy instead of releasing it, so the core fire goes out',
  },
  'caption.beyond': {
    ko: '철보다 무거운 금 · 우라늄은 이 불이 아니라 초신성 같은 사건이 만든다',
    en: 'Elements heavier than iron, like gold and uranium, are made not by this fire but by events like supernovae',
  },
} satisfies Record<string, LocalizedText>);

export type StellarNucleosynthesisMessageKey = keyof typeof stellarNucleosynthesisMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: StellarNucleosynthesisMessageKey): LocalizedText =>
  stellarNucleosynthesisMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: StellarNucleosynthesisMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// 물리 — 핵종별 핵자당 결합 에너지(MeV). 스테이지 상수의 기본값이다 (원칙 2).
// ------------------------------------------------------------------------

export interface NuclideDef {
  /** 핵종 id — 스테이지 상수 키(`binding.<id>`)의 꼬리. */
  id: string;
  /** 질량수 A. 핵종의 정의라 조정할 값이 아니다. */
  massNumber: number;
  /** 핵자당 결합 에너지 기본값(MeV). 스테이지 상수가 이긴다. */
  binding: number;
}

/**
 * 곡선을 이루는 핵종. 가벼운 쪽은 곡선이 톱니처럼 튀는 자리(He-4 · C-12 · O-16 이 이웃보다
 * 높다)를 그대로 담고, 무거운 쪽은 안정한 핵종을 띄엄띄엄 고른 표본이다.
 * 값은 원자 질량 평가(AME)의 핵자당 결합 에너지를 소수 셋째 자리까지 옮겼다.
 */
export const NUCLIDES: readonly NuclideDef[] = [
  { id: 'H1', massNumber: 1, binding: 0 },
  { id: 'H2', massNumber: 2, binding: 1.112 },
  { id: 'He3', massNumber: 3, binding: 2.573 },
  { id: 'He4', massNumber: 4, binding: 7.074 },
  { id: 'Li6', massNumber: 6, binding: 5.332 },
  { id: 'Li7', massNumber: 7, binding: 5.606 },
  { id: 'Be9', massNumber: 9, binding: 6.463 },
  { id: 'B11', massNumber: 11, binding: 6.928 },
  { id: 'C12', massNumber: 12, binding: 7.68 },
  { id: 'N14', massNumber: 14, binding: 7.476 },
  { id: 'O16', massNumber: 16, binding: 7.976 },
  { id: 'Ne20', massNumber: 20, binding: 8.032 },
  { id: 'Mg24', massNumber: 24, binding: 8.261 },
  { id: 'Si28', massNumber: 28, binding: 8.448 },
  { id: 'S32', massNumber: 32, binding: 8.493 },
  { id: 'Ca40', massNumber: 40, binding: 8.551 },
  { id: 'Fe56', massNumber: 56, binding: 8.79 },
  { id: 'Ni62', massNumber: 62, binding: 8.795 },
  { id: 'Kr84', massNumber: 84, binding: 8.717 },
  { id: 'Sn120', massNumber: 120, binding: 8.505 },
  { id: 'Ba138', massNumber: 138, binding: 8.393 },
  { id: 'W184', massNumber: 184, binding: 8.005 },
  { id: 'Au197', massNumber: 197, binding: 7.916 },
  { id: 'Pb208', massNumber: 208, binding: 7.868 },
  { id: 'U238', massNumber: 238, binding: 7.57 },
];

/** 스테이지 상수 키. 핵종마다 하나 — 목록 상수가 없어 이름으로 흩는다 (장부 G105). */
export function bindingKey(id: string): string {
  return `binding.${id}`;
}

/**
 * 철 너머로 붙여 본 자리 — 곡선의 끝(우라늄)까지 긋는다. 바로 옆 핵종으로 그으면 내리막이
 * 화면에서 몇 px 에 그쳐 「내려간다」 가 보이지 않는다. 곁말에서 우라늄이 다시 나타나
 * 「그 원소를 만들려면 이 내리막을 거슬러야 한다」 로 이어진다.
 */
export const BEYOND_TARGET = 'U238';

// ------------------------------------------------------------------------
// 양파 — 중심에서 한 겹씩 쌓이는 순서. 원소 기호 · 곡선 위 자리 · 층 반지름 · 단계
// ------------------------------------------------------------------------

export interface ShellDef {
  /** 곡선 위 자리의 핵종. */
  nuclide: string;
  symbol: StellarNucleosynthesisMessageKey;
  /**
   * 이 원소가 중심에 쌓이는 단계 id. 맨 바깥(수소)은 처음부터 있어 단계가 없다.
   * 경계는 `timeline` 이 안다 — 여기 두는 것은 이름뿐이다 (S-piece).
   */
  phase?: string;
  /** 이 층의 바깥 반지름(월드). 크기는 축척이 아니다 — 겹이 읽히게 고른 배치다. */
  radius: number;
  /** 곡선 위 이름표를 점의 위(+1) · 아래(−1) 어느 쪽에 둘지. 이웃 점과 겹치지 않게 번갈아 둔다. */
  labelSide: 1 | -1;
}

/** 바깥에서 안으로. 앞의 것이 타고 남은 재가 뒤의 것이다. */
export const SHELLS: readonly ShellDef[] = [
  { nuclide: 'H1', symbol: 'symbol.H', radius: 2, labelSide: 1 },
  { nuclide: 'He4', symbol: 'symbol.He', phase: 'grow-he', radius: 1.72, labelSide: 1 },
  { nuclide: 'C12', symbol: 'symbol.C', phase: 'grow-c', radius: 1.46, labelSide: -1 },
  { nuclide: 'O16', symbol: 'symbol.O', phase: 'grow-o', radius: 1.21, labelSide: 1 },
  { nuclide: 'Ne20', symbol: 'symbol.Ne', phase: 'grow-ne', radius: 0.97, labelSide: -1 },
  { nuclide: 'Mg24', symbol: 'symbol.Mg', phase: 'grow-mg', radius: 0.75, labelSide: 1 },
  { nuclide: 'Si28', symbol: 'symbol.Si', phase: 'grow-si', radius: 0.55, labelSide: -1 },
  { nuclide: 'Fe56', symbol: 'symbol.Fe', phase: 'grow-fe', radius: 0.35, labelSide: 1 },
];

/**
 * 겹 이름표를 놓는 방향(라디안, 월드 +x 에서 반시계). 이웃 겹끼리 왼쪽 위 · 오른쪽 위로
 * 번갈아 두어, 얇은 겹도 이름표끼리 세로로 겹치지 않게 한다. 철 핵의 이름은 한가운데.
 */
export const SHELL_LABEL_ANGLES: readonly [number, number] = [(Math.PI * 7) / 12, (Math.PI * 5) / 12];

/** 철 너머 — 곁말 단계에 나타나는 무거운 원소. 곡선 위 자리와 이름표 쪽. */
export const HEAVY_MARKS: readonly { nuclide: string; symbol: StellarNucleosynthesisMessageKey; labelSide: 1 | -1 }[] = [
  { nuclide: 'Au197', symbol: 'symbol.Au', labelSide: 1 },
  { nuclide: 'U238', symbol: 'symbol.U', labelSide: -1 },
];

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 왼쪽이 별의 단면, 오른쪽이 결합 에너지 곡선
// ------------------------------------------------------------------------

/** 별 단면의 중심. */
export const STAR_CENTER: readonly [number, number] = [-3.6, 0.3];

/** 곡선 판: 가로는 ln(질량수), 세로는 핵자당 결합 에너지. */
export const PLOT = {
  /** 원점(A = 1, 결합 에너지 0)의 월드 자리. */
  originX: -0.55,
  originY: -1.95,
  /** ln A 한 단위의 월드 길이. U-238(ln ≈ 5.47)이 6 m 안에 든다. */
  perLnA: 1.1,
  /**
   * 결합 에너지 1 MeV 의 월드 높이. 헬륨 뒤 계단은 한 칸이 0.05~0.75 MeV 라, 세로를
   * 넉넉히 줘야 오르막이 얕아지는 것과 철 너머 내리막이 눈에 든다.
   */
  perMeV: 0.5,
  /** 축이 곡선 끝보다 더 가는 길이. */
  axisOverX: 0.2,
  /** 세로축 꼭대기의 결합 에너지(MeV). */
  axisTopMeV: 9.4,
} as const;

/**
 * 프레이밍은 주장의 일부다. 가로는 별 단면 왼쪽 끝부터 곡선의 우라늄 너머까지,
 * 세로는 별 아래 캡션 자리부터 세로축 이름 위까지. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -5.7, maxX: 5.95, minY: -2.6, maxY: 3.05 } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이(초)
// ------------------------------------------------------------------------

/** 수소 → 헬륨. 가장 오래 타고 가장 크게 오른다 — 첫 단계라 길게 둔다. */
export const GROW_HE = 3;
/**
 * 뒤로 갈수록 한 겹이 쌓이는 시간이 짧다. 실제로는 수백만 년 → 하루로 줄지만
 * 그 비는 화면에 담을 수 없어 **방향만** 따른다 (NOTES (b)).
 */
export const GROW_C = 1.8;
export const GROW_O = 1.6;
export const GROW_NE = 1.4;
export const GROW_MG = 1.3;
export const GROW_SI = 1.2;
export const GROW_FE = 1.5;
/** 철 너머로 붙여 보는 동안(화살표가 곡선을 내려간다) · 그 그림을 읽는 동안. */
export const WALL_TRY = 1.4;
export const WALL_HOLD = 2.2;
/** 곁말을 읽는 동안 · 흐려지는 동안. */
export const BEYOND = 3.6;
export const FADE = 0.8;

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const stellarNucleosynthesisSchema: BundleSchema = {
  id: STELLAR_NUCLEOSYNTHESIS_ID,
  label: text('label.title'),
  category: 'astro',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 바로 한 겹씩 쌓이고, 철에서 멈추고, 다시 처음부터.
  parameters: [],

  stages: [
    {
      id: 'massive-star-core',
      label: text('label.stage'),
      constants: Object.fromEntries(NUCLIDES.map((n) => [bindingKey(n.id), n.binding])),
    },
  ],

  environments: [],

  views: [{ id: 'onion-and-curve', label: text('label.view'), default: true }],

  /**
   * 가로로 둘(단면 · 곡선)을 나란히 둔다. 세로는 단면 지름과 캡션 한 줄이면 된다 —
   * 세로를 더 주면 가로가 먼저 차서 그림만 작아진다 (S-piece — 세로가 비싸다).
   */
  canvas: { height: 440, minHeight: 380 },

  /**
   * 겹침이 판정 장치다. 양파의 겹은 바깥 것 위에 안쪽 것을 **차례로** 덮어야 겹으로
   * 읽히고, 이름표는 겹 위에 와야 한다. 층 순서로는 `body` 끼리 선언 순서가 보장되지 않는다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 일곱 겹이 차례로 쌓임 → 철 너머를 붙여 봄 → 곁말 → 흐려짐.
   * 겹마다 단계 하나라, 「이 겹을 더 오래」 를 저작자가 단계 길이로 바꾼다.
   */
  timeline: {
    phases: [
      { id: 'grow-he', duration: GROW_HE, ease: 'smooth', caption: key('caption.hydrogen') },
      { id: 'grow-c', duration: GROW_C, ease: 'smooth', caption: key('caption.ladder') },
      { id: 'grow-o', duration: GROW_O, ease: 'smooth', caption: key('caption.ladder') },
      { id: 'grow-ne', duration: GROW_NE, ease: 'smooth', caption: key('caption.ladder') },
      { id: 'grow-mg', duration: GROW_MG, ease: 'smooth', caption: key('caption.shallow') },
      { id: 'grow-si', duration: GROW_SI, ease: 'smooth', caption: key('caption.shallow') },
      { id: 'grow-fe', duration: GROW_FE, ease: 'smooth', caption: key('caption.iron') },
      { id: 'wall-try', duration: WALL_TRY, ease: 'smooth', caption: key('caption.wall') },
      { id: 'wall-hold', duration: WALL_HOLD, caption: key('caption.wall') },
      { id: 'beyond', duration: BEYOND, ease: 'smooth', caption: key('caption.beyond') },
      { id: 'fade', duration: FADE, caption: key('caption.beyond') },
    ],
  },

  /**
   * 도착한 순간 이미 진행 중이다 — 헬륨 핵이 중심에서 반쯤 자라고 곡선 위 화살표가
   * 오르는 중인 자리에서 연다. 0 이면 수소뿐인 별이 먼저 보인다.
   */
  startAt: 1.4,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 정의와 공식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -6] },
    fontSize: 13,
    wrapWidth: 720,
    fade: 0.25,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 곡선에서 읽을 것은 값이 아니라 **오르막과
   * 꼭대기**라, 눈금 숫자와 격자를 두면 「몇 MeV 인가」 라는 다른 질문이 끼어든다.
   */

  messages: stellarNucleosynthesisMessages,
};
