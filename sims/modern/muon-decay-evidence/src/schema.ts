// ========================================================================
// muon-decay-evidence — 선언
// ========================================================================
// 질문: 시간 지연은 실제로 관측되는가?
//
// 대기 상층(약 10 km)에서 생긴 뮤온은 반감기 1.5 μs 로 붕괴한다. 0.98c 로 내려와도
// 반감기 동안 약 450 m 밖에 못 가므로, 시간이 그대로 흐른다면 지표까지 스무 번 넘게
// 절반이 되어 하나도 닿지 못해야 한다. 그런데 지표에서 뮤온이 잡힌다 — 지상에서 보면
// 뮤온의 시간이 γ ≈ 5 배 느리게 흘러, 절반이 되는 거리가 약 2.2 km 로 늘기 때문이다.
//
// 지상 틀 하나에서 본다. **같은 뮤온들**(같은 제 수명)을 두 기둥에 나란히 내려보낸다 —
// 왼쪽은 「시간이 그대로 흐른다면」, 오른쪽은 「지상에서 본 실제」. 같은 뮤온이 오른쪽에서는
// 다섯 배 아래에서 붕괴한다. 왼쪽 지표에는 아무것도 닿지 않고, 오른쪽 지표에는 여럿이 쌓인다.
//
// 뮤온 틀에서 본 설명(대기가 수축한다)은 두지 않는다 — 길이 수축(length-contraction)의 몫이고,
// 두 판을 두면 「어느 설명이 맞나」 가 이 조각의 질문(닿는가)을 덮는다. 시계의 느려짐 자체는
// time-dilation, 그 까닭은 light-clock 이 한다. 여기서 일어나는 것은 「닿는다」 하나다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:muon-decay-evidence` 와 문자 그대로 일치한다 (C4). */
export const MUON_DECAY_EVIDENCE_ID = 'muon-decay-evidence';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 월드 세로 단위는 km 다.
// ------------------------------------------------------------------------

/** 뮤온의 속력 v/c. γ = 1/√(1−β²) ≈ 5.03 이 되는 값이다. */
export const BETA = 0.98;
/** 뮤온 반감기(제 시간, μs). 평균 수명 2.2 μs × ln 2. */
export const HALF_LIFE_US = 1.5;
/** 빛의 빠르기(km/μs). 반감기 동안 가는 거리 = β · c · 반감기. */
export const LIGHT_KM_PER_US = 0.2998;
/** 뮤온이 생기는 높이(km). 지표가 0 이다. */
export const HEIGHT_KM = 10;
/**
 * 뮤온 떼의 두께(km). 떼가 한 줄로 겹치지 않게 출발 높이를 [높이, 높이 + 두께] 에 흩는다.
 * 뮤온마다 제 출발 높이에서부터 수명을 잰다.
 */
export const START_BAND_KM = 0.6;
/** 한 주기에 내려보내는 뮤온 수. 두 기둥이 같은 뮤온이다. */
export const MUON_COUNT = 300;
/** 주기마다 수명 · 자리를 뽑는 시드 난수의 씨앗. */
export const SEED = 7;
/**
 * 수명을 층화해 뽑는다 — 뮤온 i 의 균등 난수를 [i, i+1)/N 칸 안에서 뽑는데, 칸의 앞 몫
 * (이 비율)은 건너뛴다. 그래서 가장 오래 사는 뮤온도 log₂(N / 이 값) 반감기(≈ 14)를 넘지
 * 못한다 — 시간이 그대로 흐르는 왼쪽(지표까지 ≈ 23 반감기)에서 **모든 주기에** 하나도 닿지
 * 않고, 오른쪽(≈ 5 반감기)에는 **모든 주기에** 여럿이 닿는다. 캡션이 무작위 결과에 기대지
 * 않게 하는 장치다.
 */
export const STRATUM_FLOOR = 0.02;

/** 화면에 띄우는 γ(≈). 계산해 줄이지 않고 선언한다 — β 와 짝으로 바꾼다(G143). */
export const GAMMA_SHOWN = 5;
/** 화면에 띄우는 「절반이 되는 거리」(≈). 시간이 그대로면 m, 실제는 km. β · 반감기와 짝이다(G143). */
export const CLASSICAL_HALF_M = 450;
export const DILATED_HALF_KM = 2.2;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이(초). 뮤온 떼는 `upper` 시작에 출발해 `lower` 끝에 가장 높이 있던
// 뮤온까지 지표에 닿는다. 화면 빠르기는 단계 길이가 정한다(연출 배율 — c 는 화면에 없다).
// ------------------------------------------------------------------------

/** 대기 상층에 뮤온 떼가 나타나는 동안. */
export const APPEAR = 0.5;
/** 위쪽 절반을 내려오는 동안. */
export const UPPER = 2.6;
/** 아래쪽 절반을 내려와 지표에 닿는 동안. */
export const LOWER = 2.6;
/** 지표에 닿은 수가 드러나는 동안. */
export const ARRIVE = 0.8;
/** 두 기둥의 결과를 읽는 동안. */
export const HOLD = 3;
/** 기록이 흐려지며 다음 주기로 넘어가는 동안. */
export const FADE = 0.6;

// ------------------------------------------------------------------------
// 배치 — 월드(세로 km). 가운데 높이 축을 사이에 두고 두 기둥.
// ------------------------------------------------------------------------

/** 두 기둥의 가운데(월드 x). 왼쪽 = 시간이 그대로 흐른다면, 오른쪽 = 실제. */
export const CLASSICAL_X = -5.2;
export const DILATED_X = 5.2;
/** 기둥의 반폭(월드). 뮤온이 이 안에 흩어진다. */
export const COLUMN_HALF = 3.4;
/** 기둥 머리 이름표 높이. */
export const HEADER_Y = 11.7;
/** 지표에 닿은 수 이름표 높이(지표 아래). */
export const COUNT_Y = -0.85;
/** 지표에 닿은 뮤온이 놓이는 높이(지표선 바로 위). */
export const LANDED_Y = 0.18;
/** 반감기 거리 이름표를 기둥 바깥에서 띄우는 거리(월드). */
export const HALF_LABEL_GAP = 0.45;

/**
 * 프레이밍은 주장의 일부다. 세로는 기둥 머리 이름표 위부터 지표 아래 수 · 캡션 줄까지,
 * 가로는 양쪽 반감기 거리 이름표까지. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -13.8, maxX: 13.8, minY: -2.4, maxY: 12.4 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const muonDecayEvidenceMessages = Object.freeze({
  'label.title': { ko: '뮤온의 도달', en: 'Muons reaching the ground' },
  'label.stage': { ko: '10 km 에서 0.98c 로 내려오는 뮤온', en: 'Muons falling from 10 km at 0.98c' },
  'label.view': { ko: '지상에서 본 틀', en: 'Ground frame' },
  'label.classical': { ko: '시간이 그대로 흐른다면', en: 'If time ran normally' },
  'label.dilated': { ko: '실제 — 시간 지연 γ ≈ {g}', en: 'Reality — time dilation γ ≈ {g}' },
  /** 반감기 동안 가는 거리. 정박값을 선언하고 끼운다 (S-piece 유효숫자). */
  'label.classicalHalf': { ko: '약 {d} m 마다 절반', en: 'halves every ~{d} m' },
  'label.dilatedHalf': { ko: '약 {d} km 마다 절반', en: 'halves every ~{d} km' },
  'label.height': { ko: '{h} km', en: '{h} km' },
  'label.ground': { ko: '지표', en: 'ground' },
  'label.speed': { ko: '{beta}c ↓', en: '{beta}c ↓' },
  'label.halfLife': { ko: '반감기 {t} μs', en: 'half-life {t} μs' },
  /** 지표에 닿은 뮤온 수. 센 정수라 값만 끼운다. */
  'label.arrived': { ko: '지표에 닿음 {n}', en: 'reached ground {n}' },
  'caption.fall': {
    ko: '같은 뮤온들이 거의 빛의 빠르기로 내려오며 반감기마다 절반씩 붕괴한다',
    en: 'The same muons fall at nearly light speed, half of them decaying every half-life',
  },
  'caption.gone': {
    ko: '시간이 그대로 흐른다면 벌써 거의 남지 않았다 — 실제로는 아직 여럿이 내려온다',
    en: 'If time ran normally, almost none would be left by now — in reality, many are still coming',
  },
  'caption.result': {
    ko: '시간이 그대로 흐른다면 하나도 닿지 못할 거리 — 실제로는 여럿이 지표에 닿는다',
    en: 'If time ran normally, none would make it this far — in reality, several reach the ground',
  },
} satisfies Record<string, LocalizedText>);

export type MuonDecayEvidenceMessageKey = keyof typeof muonDecayEvidenceMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: MuonDecayEvidenceMessageKey): LocalizedText => muonDecayEvidenceMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: MuonDecayEvidenceMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const muonDecayEvidenceSchema: BundleSchema = {
  id: MUON_DECAY_EVIDENCE_ID,
  title: text('label.title'),
  category: 'modern',
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 뮤온이 내려오고, 붕괴하고, 닿은 것이 쌓이고, 다시 온다.
  parameters: [],

  stages: [
    {
      id: 'atmosphere',
      label: text('label.stage'),
      constants: {
        beta: BETA,
        halfLifeUs: HALF_LIFE_US,
        lightKmPerUs: LIGHT_KM_PER_US,
        heightKm: HEIGHT_KM,
        startBandKm: START_BAND_KM,
        muonCount: MUON_COUNT,
        seed: SEED,
        stratumFloor: STRATUM_FLOOR,
        gammaShown: GAMMA_SHOWN,
        classicalHalfM: CLASSICAL_HALF_M,
        dilatedHalfKm: DILATED_HALF_KM,
      },
    },
  ],

  environments: [],

  views: [{ id: 'ground-frame', label: text('label.view'), default: true }],

  /** 세로 15 칸(km) 을 담는다. 세로가 비싸지만 「위에서 지표까지」 가 곧 주장이다. */
  canvas: { height: 380, minHeight: 340 },

  /** 붕괴 자리 · 지표선이 뮤온 아래로, 지표에 닿은 뮤온이 맨 위로 와야 한다. */
  drawOrder: 'scene',

  /**
   * 한 주기 = 나타남 → 위쪽 절반 → 아래쪽 절반(지표에 닿음) → 닿은 수 → 읽음 → 흐려짐.
   * 떨어진 거리는 `upper` 시작부터 `lower` 끝까지의 구간 진행도에 비례한다.
   */
  timeline: {
    phases: [
      { id: 'appear', duration: APPEAR, caption: key('caption.fall') },
      { id: 'upper', duration: UPPER, caption: key('caption.fall') },
      { id: 'lower', duration: LOWER, caption: key('caption.gone') },
      { id: 'arrive', duration: ARRIVE, ease: 'smooth', caption: key('caption.result') },
      { id: 'hold', duration: HOLD, caption: key('caption.result') },
      { id: 'fade', duration: FADE, caption: key('caption.result') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — 뮤온 떼가 위쪽에서 붕괴하며 내려오는 중이다. */
  startAt: 1.4,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 공식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 720,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 재는 것은 「절반이 되는 거리」 이고 기둥 옆
   * 눈금이 그 자다.
   */

  messages: muonDecayEvidenceMessages,
};
