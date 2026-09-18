// ========================================================================
// superposition-quantum — 선언
// ========================================================================
// 질문: 「두 상태가 겹쳐 있다」 는 사실 둘 중 하나인데 모를 뿐이라는 뜻인가.
//
// 답: 아니다. 상자 속 바닥 상태(n = 1)와 첫 들뜬 상태(n = 2)는 저마다 위상이 돌아도
// 분포가 멈춰 있다. 둘을 반씩 겹친 한 상태는 두 위상이 에너지 차만큼 어긋나며 돌아,
// 그 어긋남을 따라 분포가 좌우로 출렁인다. 둘 중 하나로 이미 정해져 있었다면 분포는
// 두 분포의 가중 평균에 멈춰 있어야 한다 — 출렁임은 둘이 함께 있어야만 생긴다.
//
// 이웃과 나눈 몫 — 준위마다 ψ 의 모양과 에너지 간격은 `particle-in-a-box`, ψ 의 부호와
// |ψ|² 의 관계 · 측정 점이 쌓이는 것은 `wave-function`, 고전 파동이 점마다 더해지는 것은
// `superposition`(파동) 이다. 측정 한 번에 한쪽으로 무너지는 순간은
// `measurement-collapse` 의 몫이라 여기서는 하지 않는다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:superposition-quantum` 와 문자 그대로 일치한다 (C4). */
export const SUPERPOSITION_QUANTUM_ID = 'superposition-quantum';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
//
// 무한 우물 [0, L] 의 정상 상태 φₙ = √(2/L) sin(nπx/L), Eₙ = n² E₁.
// ψ(x, t) = √w₁ φ_a e^(−iE_a t/ħ) + √w₂ φ_b e^(−iE_b t/ħ).
// ------------------------------------------------------------------------

/** 겹치는 두 준위의 번호. 기본은 바닥 상태와 첫 들뜬 상태. */
export const LEVEL_A = 1;
export const LEVEL_B = 2;
/** 두 성분의 몫(|c|²). 코드가 합으로 나눠 쓰므로 비만 뜻이 있다. 반씩 겹친다. */
export const WEIGHT_A = 0.5;
export const WEIGHT_B = 0.5;
/**
 * E₁ 의 위상 주기 h / E₁ 을 **화면 초** 로 늘인 값 — 에너지 E₁ 을 시간 눈금으로 선언한 것이다.
 * 준위 n 의 위상은 이 주기의 1/n² 마다 한 바퀴 돌고, 분포의 출렁임 주기는
 * 이것을 (n_b² − n_a²) 로 나눈 값(기본 7.2 / 3 = 2.4 초)이다. 실제 주기(펨토초 아래)는
 * 보이지 않아 늘인 배율이며, 화면에 알리지 않는다 (NOTES (b)).
 */
export const E1_PHASE_PERIOD = 7.2;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 가운데 큰 상자 = 겹친 상태, 왼쪽 작은 상자 둘 = 각 정상 상태,
// 오른쪽 = 위상 다이얼.
// ------------------------------------------------------------------------

/** 큰 상자의 폭(월드). 왼쪽 벽이 x = 0, 오른쪽 벽이 x = L. */
export const BOX_WIDTH = 16;
/** 큰 상자에서 가장 큰 |ψ|² 가 닿는 높이. */
export const PROB_HEIGHT = 6;
/** 벽이 가장 높은 분포 위로 더 뻗는 길이(월드). */
export const WALL_OVERHANG = 1.0;

/** 작은 상자의 왼쪽 벽 x 와 폭, 가장 큰 |φ|² 가 닿는 높이. */
export const MINI_LEFT = -9.6;
export const MINI_WIDTH = 7;
export const MINI_HEIGHT = 2.2;
/** 작은 상자 벽이 분포 위로 더 뻗는 길이(월드). */
export const MINI_OVERHANG = 0.7;
/** 작은 상자 둘의 바닥 높이 — 위가 n_a, 아래가 n_b. */
export const MINI_FLOOR_A = 4.2;
export const MINI_FLOOR_B = 0;

/** 위상 다이얼 — 큰 상자 오른쪽 벽에서 중심까지 거리, 중심 높이, 반지름. */
export const DIAL_GAP = 4.6;
export const DIAL_Y = 3.4;
export const DIAL_RADIUS = 2.5;

/** 무게 중심 막대의 높이(바닥 아래). */
export const MEAN_Y = -0.75;
/** 가운데 눈금의 반 길이(월드). */
export const MEAN_TICK_HALF = 0.4;

/**
 * 프레이밍 — 왼쪽은 작은 상자 이름표, 오른쪽은 다이얼 화살표 이름표, 위는 큰 상자 벽 끝과
 * 이름, 아래는 무게 중심 막대와 캡션 한 줄(캡션 자리가 프레이밍에 잡히지 않아 경계로 비운다 —
 * 장부 G24). 매 프레임 같은 값이다 (S-piece — 프레이밍은 주장의 일부다).
 */
export const SCENE_BOUNDS = { minX: -13.0, maxX: 26.0, minY: -2.9, maxY: 8.2 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const superpositionQuantumMessages = Object.freeze({
  'label.title': { ko: '양자 중첩', en: 'Quantum superposition' },
  'label.operation': { ko: '여러 상태의 합으로 있는 것', en: 'Being a sum of several states' },
  'label.stage': { ko: '상자 속 두 준위를 반씩', en: 'Two box levels, half and half' },
  'label.view': { ko: '분포와 위상', en: 'Distribution and phase' },

  /** 준위 번호 — 기호라 두 언어가 같다 (C1 표식). */
  'label.n': { ko: 'n = {n}', en: 'n = {n}' },
  /** 큰 상자 이름. 조사가 붙을 수 있는 낱말이라 문안이다 (C1 판정 4). */
  'label.superposed': { ko: '겹친 상태', en: 'superposed' },
  /** 위상 다이얼 이름. */
  'label.phase': { ko: '위상', en: 'phase' },

  'caption.alone': {
    ko: '정상 상태 하나는 위상이 돌아도 분포가 멈춰 있다 — 위 준위의 위상이 더 빨리 돈다',
    en: 'A single stationary state keeps its distribution still while its phase turns — the upper level turns faster',
  },
  'caption.slosh': {
    ko: '둘을 겹친 한 상태 — 두 위상이 어긋나는 대로 분포가 왼쪽 오른쪽으로 출렁인다',
    en: 'One state made of both — as the two phases slip apart, the distribution sloshes left and right',
  },
  'caption.either': {
    ko: '둘 중 하나로 이미 정해져 있었다면 분포는 점선에 멈춰 있어야 한다 — 출렁임은 둘이 함께 있다는 표시다',
    en: 'If it were secretly one or the other, it would sit still on the dashed line — the sloshing means both are there at once',
  },
} satisfies Record<string, LocalizedText>);

export type SuperpositionQuantumMessageKey = keyof typeof superpositionQuantumMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: SuperpositionQuantumMessageKey): LocalizedText => superpositionQuantumMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: SuperpositionQuantumMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const superpositionQuantumSchema: BundleSchema = {
  id: SUPERPOSITION_QUANTUM_ID,
  label: text('label.title'),
  category: 'modern',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다. 성분 비를 바꾸면 출렁임의 폭만 달라지고 「둘이 함께 있어야 출렁인다」 에
  // 새로 해 볼 것이 생기지 않는다. 비가 0 이 되는 끝(정상 상태 하나)은 왼쪽 작은 상자가 이미 보인다.
  parameters: [],

  stages: [
    {
      id: 'half-half',
      label: text('label.stage'),
      constants: {
        levelA: LEVEL_A,
        levelB: LEVEL_B,
        weightA: WEIGHT_A,
        weightB: WEIGHT_B,
        e1PhasePeriod: E1_PHASE_PERIOD,
        boxWidth: BOX_WIDTH,
      },
    },
  ],

  environments: [],

  views: [{ id: 'main', label: text('label.view'), default: true }],

  /** 가로로 넓은 한 줄 — 작은 상자 둘 · 큰 상자 · 다이얼. 아래 캡션 한 줄. */
  canvas: { height: 330, minHeight: 300 },

  /** 벽 · 다이얼 테를 먼저, 분포 · 점선을 그 위에, 화살표 · 이름표를 맨 위에. */
  drawOrder: 'scene',

  /**
   * 한 주기 21.4 초. 출렁임 · 위상은 조각 시계(`t`)를 그대로 따라 주기 경계에서 끊기지 않는다 —
   * 단계는 무엇을 앞세울지와 캡션만 정한다.
   *
   * - `alone` — 큰 상자가 흐리고, 작은 상자 둘(각 정상 상태)과 다이얼이 앞에 선다.
   * - `join` — 큰 상자(겹친 상태)가 짙어진다.
   * - `slosh` — 겹친 분포가 출렁인다. 무게 중심 막대가 가운데 눈금 좌우로 오간다.
   * - `either` — 「둘 중 하나로 정해져 있었다면」 의 분포(가중 평균)가 점선으로 떠오른다.
   * - `compare` — 점선은 멈춰 있고 굵은 분포는 그 위아래로 출렁인다.
   * - `reset` — 점선이 걷히고 큰 상자가 다시 흐려진다.
   */
  timeline: {
    phases: [
      { id: 'alone', duration: 4.0, caption: key('caption.alone') },
      { id: 'join', duration: 1.0, ease: 'smooth', caption: key('caption.slosh') },
      { id: 'slosh', duration: 7.2, caption: key('caption.slosh') },
      { id: 'either', duration: 1.0, ease: 'smooth', caption: key('caption.either') },
      { id: 'compare', duration: 7.2, caption: key('caption.either') },
      { id: 'reset', duration: 1.0, ease: 'smooth', caption: key('caption.either') },
    ],
  },

  /** 도착한 순간 겹친 분포가 이미 출렁이고 있다(`slosh` 반 초째). */
  startAt: 5.5,

  /** 슬롯 하나. 그림 아래 왼쪽. */
  caption: {
    anchor: { screen: 'bottom-left', offset: [16, -6] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 860,
    style: { colorRole: 'ink', emphasis: 'strong' },
    fade: 0.25,
  },

  // 그리드 · 카메라 단추 · 범례 · 제목 없음(기본). 재는 것이 거리가 아니라 모양과 치우침이다.

  messages: superpositionQuantumMessages,
};
