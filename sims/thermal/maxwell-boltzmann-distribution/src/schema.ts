// ========================================================================
// maxwell-boltzmann-distribution — 선언
// ========================================================================
// 질문: 온도를 올리면 분자가 빨라진다는데, 왜 분포의 봉우리는 낮아지나.
//
// 모든 분자의 속력이 같은 배율 √(T/300) 로 늘어 빠른 분자일수록 더 멀리 밀려나고,
// 분자 수는 그대로라 넓어진 만큼 낮아진다. 동사: 퍼지며 내려앉는다.
//
// 원본: tasks/piece-lab/maxwell-boltzmann-distribution (자유 구현).
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:maxwell-boltzmann-distribution` 와 문자 그대로 일치한다 (C4). */
export const MAXWELL_BOLTZMANN_DISTRIBUTION_ID = 'maxwell-boltzmann-distribution';

// ------------------------------------------------------------------------
// 배치 — 월드 한 단위 = 원본(캔버스 폭 868 px) 의 한 픽셀
// ------------------------------------------------------------------------
//
// 원점은 속력 축의 왼쪽 끝(원본 padL, baseY)이고 y 는 위가 양수다. 원본 상수를
// 그대로 옮겼다 — plotW = 868 − 20 − 20, plotH = round(min(230, max(150, plotW·0.26))).

export const PLOT = {
  /** 속력 축의 길이(원본 plotW). 0 m/s 에서 `vMax` 까지. */
  width: 828,
  /** 300 K 봉우리 높이(원본 H = plotH × 0.92, plotH = 215). */
  peak: 215 * 0.92,
  /** 캔버스 위 끝(원본 topPad 8 + plotH 215). */
  top: 223,
  /** 눈금 속력. */
  ticks: [0, 500, 1000, 1500, 2000] as readonly number[],
  /** 눈금선 길이. 축에서 아래로. */
  tickLength: 4,
  /** 눈금 글자 가운데가 축에서 내려온 거리(화면 px). 원본 baseY+6 에 윗선을 맞춘 11 px 글자. */
  tickLabelDrop: 12,
  /** 이동선 첫 줄의 높이(원본 stripTop = baseY + 30). */
  stripTop: -30,
  /** 이동선 줄 간격(원본 stripGap). */
  stripGap: 10,
  /** 곡선 표본 간격(원본 2 px). */
  curveStep: 2,
} as const;

/**
 * 프레이밍. 그림(축 · 곡선 · 이동선 세 줄)에 원본의 캔버스 여백을 두고, 아래에
 * 조작기 줄(슬라이더 · 캡션)의 자리를 더 잡는다. 자리를 선언한 조작기(`at`)는
 * 자동 프레이밍 여백에 들어가지 않으므로 그 몫을 경계에 넣는다.
 */
export const SCENE_BOUNDS = { minX: -20, maxX: 848, minY: -122, maxY: 223 } as const;

/** 따라가는 분자 셋의 분위 — 느린 쪽 · 가운데 · 빠른 쪽. */
export const TRACKED_QUANTILES: readonly number[] = [0.15, 0.5, 0.9];

/** 슬라이더 범위(K). 최솟값이 기준 온도라 "300 K 보다 넓다" 가 틀리는 경우가 없다. */
export const TEMP_RANGE: [number, number] = [300, 1200];

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const maxwellBoltzmannDistributionMessages = Object.freeze({
  'label.title': { ko: '맥스웰-볼츠만 분포', en: 'Maxwell–Boltzmann distribution' },
  'label.operation': {
    ko: '데우면 분자 속력 분포가 퍼지며 내려앉는다',
    en: 'Heating spreads the speed distribution and lowers its peak',
  },
  'label.stage': { ko: '질소 기체', en: 'Nitrogen gas' },
  'label.view': { ko: '속력 분포', en: 'Speed distribution' },
  'label.temperature': { ko: '온도', en: 'Temperature' },
  /** 눈금 숫자. 수는 표식이라 번역 대상이 아니다 (C1 판정 3). */
  'label.tick': { ko: '{v}', en: '{v}' },
  'label.axis': { ko: '속력 (m/s)', en: 'Speed (m/s)' },
  'caption.heating': {
    ko: '데우는 중 — 모든 분자가 같은 배율로 빨라진다. 빠른 분자일수록 더 멀리 밀려나, 같은 {count}개가 더 넓게 퍼지고 봉우리는 내려앉는다.',
    en: 'Heating — every molecule speeds up by the same factor. The faster ones are pushed farther, so the same {count} spread wider and the peak sinks.',
  },
  'caption.cooling': {
    ko: '식히는 중 — 모든 분자가 같은 배율로 느려진다. 빠른 분자일수록 더 많이 끌려와, 더미가 좁게 모이며 다시 솟는다.',
    en: 'Cooling — every molecule slows by the same factor. The faster ones are pulled back more, so the pile gathers and rises again.',
  },
  'caption.cold': {
    ko: '{temp} K — 분자 {count}개가 각자 속력 자리에 놓여 있다. 봉우리는 좁고 높으며, 빠른 쪽 꼬리가 길게 끌린다.',
    en: '{temp} K — {count} molecules, each placed at its own speed. The peak is narrow and tall, with a long tail on the fast side.',
  },
  'caption.warm': {
    ko: '{temp} K — 같은 {count}개가 300 K 때(점선)보다 오른쪽으로 넓게 퍼졌고, 봉우리는 그만큼 낮아졌다.',
    en: '{temp} K — the same {count} have spread wider to the right than at 300 K (dashed), and the peak is lower by as much.',
  },
} satisfies Record<string, LocalizedText>);

export type MaxwellBoltzmannDistributionMessageKey = keyof typeof maxwellBoltzmannDistributionMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 통로. */
export const text = (key: MaxwellBoltzmannDistributionMessageKey): LocalizedText =>
  maxwellBoltzmannDistributionMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: MaxwellBoltzmannDistributionMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const maxwellBoltzmannDistributionSchema: BundleSchema = {
  id: MAXWELL_BOLTZMANN_DISTRIBUTION_ID,
  label: text('label.title'),
  category: 'thermal',
  operation: text('label.operation'),
  timeModel: 'periodic',
  parameters: [],

  /**
   * 기체와 표본. `t0` 는 점선(비교 기준)의 온도이자 표본을 뽑는 온도, `tHot` 은 자동
   * 진행이 오르는 온도다. `massU` 는 질소 분자(N₂ 28 u) — 분포의 모양 주장에는 필요
   * 없어 화면에 두지 않는다. `seed` 는 층별 추출의 난수 시드다(같은 시각 = 같은 화면).
   */
  stages: [
    {
      id: 'nitrogen',
      label: text('label.stage'),
      constants: { t0: 300, tHot: 1200, massU: 28, count: 500, vMax: 2500, seed: 1 },
    },
  ],
  environments: [],
  views: [{ id: 'speed', label: text('label.view'), default: true }],

  /** 원본 캔버스 289 px + 조작기 줄. 세로가 비싸 슬라이더와 캡션을 한 줄에 나란히 둔다. */
  canvas: { height: 370, minHeight: 340 },

  /** 점과 곡선의 겹침 순서가 원본과 같아야 한다 — 점선 · 더미 · 실선 · 따라가는 분자 순. */
  drawOrder: 'scene',

  /**
   * 한 주기 12 s — 데우기 3.5 s(300→1200 K) · 유지 3 s · 식히기 3.5 s · 쉬기 2 s.
   * 도착한 순간(t = 0)부터 데우기가 시작된다 — 앞당김(`startAt`)이 없다.
   */
  timeline: {
    phases: [
      { id: 'heat', duration: 3.5, ease: 'smooth', caption: key('caption.heating') },
      { id: 'hold', duration: 3, caption: key('caption.warm') },
      { id: 'cool', duration: 3.5, ease: 'smooth', caption: key('caption.cooling') },
      { id: 'rest', duration: 2, caption: key('caption.cold') },
    ],
  },

  /**
   * 슬롯 하나. 자동 진행은 단계 캡션이 말하고, 독자가 슬라이더를 건드린 뒤에는 온도
   * 변화 방향(physics 가 센 boolean)이 고른다 — 원본처럼 한 번 건드리면 자동으로
   * 돌아가지 않는다.
   */
  caption: {
    anchor: { screen: 'bottom-left', offset: [248, -8] },
    align: 'left',
    fontSize: 13,
    wrapWidth: 600,
    style: { colorRole: 'ink', emphasis: 'strong' },
    cases: [
      { when: 'manualHeating', text: key('caption.heating') },
      { when: 'manualCooling', text: key('caption.cooling') },
      { when: 'manualCold', text: key('caption.cold') },
      { when: 'manualWarm', text: key('caption.warm') },
      { when: 'restingCold', text: key('caption.cold') },
    ],
    vars: { temp: 'tempText', count: 'countText' },
  },

  messages: maxwellBoltzmannDistributionMessages,
};
