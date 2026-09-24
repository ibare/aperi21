// ========================================================================
// antenna-radiation — 선언
// ========================================================================
// 질문: 흔들리는 전하(안테나)는 파동을 모든 방향으로 똑같이 내보내는가.
//
// 세로로 선 안테나 속에서 전하가 위아래로 흔들린다. 둘레로 물결 고리가 퍼져 나가는데,
// 고리의 짙기가 방향마다 다르다 — 옆(안테나에 수직)으로는 가장 짙고, 위아래(안테나 축)로
// 갈수록 옅어져 축 위에서는 아무것도 없다. 방향마다 세기를 이으면 두 잎(도넛 단면)이
// 된다. 세기는 축과 이룬 각 θ 의 sin²θ 를 따른다.
//
// 이웃 `electromagnetic-wave` 는 흔들리는 전하에서 전기력선이 꺾여 떨어져 나가는 모양을
// 보인다. 이 조각은 그것을 되풀이하지 않고 **방향에 따른 세기** 하나만 말한다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:antenna-radiation` 와 문자 그대로 일치한다 (C4). */
export const ANTENNA_RADIATION_ID = 'antenna-radiation';

// ------------------------------------------------------------------------
// 물리 · 표시 배율 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 월드 단위는 화면 배치 단위(칸)다. 실제 전파의 파장 · 진동수는 눈에 보이는 크기가 아니다.
// ------------------------------------------------------------------------

/** 전하가 흔들리는 진동수(Hz). 한 번 흔들 때마다 마루 고리 하나가 나간다. */
export const FREQUENCY = 0.8;
/** 물결 간격(파장, 월드 칸). 고리 사이 거리다. */
export const WAVELENGTH = 1;
/** 옆 방향(θ = 90°) 세기. 상대값 — 모든 방향의 세기가 이 값에 sin²θ 를 곱한 것이다. */
export const PEAK_INTENSITY = 1;
/** 세기 → 고리 불투명도 배율. 세기 1 인 옆 방향 고리의 불투명도다. */
export const RING_OPACITY_SCALE = 0.95;
/** 세기 → 두 잎 반지름 배율(월드 칸). 옆 방향 잎 끝까지의 거리다. */
export const LOBE_SCALE = 1.9;
/** 안테나 반 길이(월드 칸). */
export const ANTENNA_HALF = 0.55;
/** 전하가 안테나를 따라 흔들리는 폭(월드 칸, 가운데에서 한쪽 끝까지). 팔 길이의 절반보다 작아야 끝을 넘지 않는다. */
export const CHARGE_SWING = 0.22;
/** 고리를 그리기 시작하는 반지름(월드 칸). 안테나 바로 곁은 비워 전하가 가려지지 않게 한다. */
export const RING_START = 0.35;

// ------------------------------------------------------------------------
// 배치 — 월드 칸
// ------------------------------------------------------------------------

/** 물결이 퍼지는 판. 캡션 띠 위까지만 고리를 그린다(`clip`). */
export const FIELD_BOUNDS = { minX: -4.2, maxX: 4.2, minY: -2.1, maxY: 2.1 } as const;
/**
 * 고리를 그리는 가장 먼 반지름(월드 칸). 판보다 넓게 잡는다 — 넓은 임베드에서는 판 좌우에
 * 여백이 생기는데, 고리가 판 끝에서 멈추면 물결이 거기서 끝난 것으로 읽힌다.
 */
export const RING_REACH = 9;
/** 캡션 띠 높이(월드 칸). 판 아래에 둔다 — 캡션 자리가 프레이밍 여백으로 잡히지 않는다(G24). */
export const CAPTION_BAND = 0.6;

/**
 * 프레이밍은 주장의 일부다. 가로는 옆으로 퍼지는 고리 네 개쯤, 세로는 축 방향 점선과
 * 캡션 띠까지. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = {
  minX: FIELD_BOUNDS.minX,
  maxX: FIELD_BOUNDS.maxX,
  minY: FIELD_BOUNDS.minY - CAPTION_BAND,
  maxY: FIELD_BOUNDS.maxY,
} as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이(초)
// ------------------------------------------------------------------------

/** 고리만 퍼지는 동안. 옆은 짙고 위아래는 빈 무늬를 먼저 눈으로 본다. */
export const RIPPLE = 4.5;
/** 방향마다 세기를 이어 두 잎이 자라는 동안. */
export const TRACE = 1.8;
/** 두 잎과 고리를 함께 읽는 동안. */
export const HOLD = 4.2;
/** 두 잎이 옅어져 다음 주기로 넘어가는 동안. */
export const CLEAR = 0.8;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const antennaRadiationMessages = Object.freeze({
  'label.title': { ko: '안테나의 복사', en: 'Antenna radiation' },
  'label.operation': {
    ko: '가속하는 전하가 내는 파동',
    en: 'The waves an accelerating charge sends out',
  },
  'label.stage': { ko: '세로 안테나', en: 'Vertical antenna' },
  'label.view': { ko: '옆에서 본 단면', en: 'Side cross-section' },
  'caption.ripple': {
    ko: '안테나 속 전하가 위아래로 흔들리며 물결을 내보낸다 — 옆쪽 물결은 짙고, 위아래로 갈수록 옅어진다',
    en: 'Charges shaking up and down in the antenna send out ripples — strong to the sides, fading toward the top and bottom',
  },
  'caption.trace': {
    ko: '방향마다 물결의 세기를 이으면 두 잎이 된다',
    en: 'Joining the ripple strength in every direction traces two lobes',
  },
  'caption.result': {
    ko: '옆으로 가장 세게 내보내고, 안테나 축을 따라 위아래로는 아무것도 내보내지 않는다',
    en: 'Strongest straight out to the sides — nothing at all along the antenna axis, up or down',
  },
} satisfies Record<string, LocalizedText>);

export type AntennaRadiationMessageKey = keyof typeof antennaRadiationMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: AntennaRadiationMessageKey): LocalizedText => antennaRadiationMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: AntennaRadiationMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const antennaRadiationSchema: BundleSchema = {
  id: ANTENNA_RADIATION_ID,
  label: text('label.title'),
  category: 'em',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 이미 물결이 퍼지고 있고, 두 잎이 자랐다가 옅어진다.
  parameters: [],

  stages: [
    {
      id: 'vertical-antenna',
      label: text('label.stage'),
      constants: {
        frequency: FREQUENCY,
        wavelength: WAVELENGTH,
        peakIntensity: PEAK_INTENSITY,
        ringOpacityScale: RING_OPACITY_SCALE,
        lobeScale: LOBE_SCALE,
        antennaHalf: ANTENNA_HALF,
        chargeSwing: CHARGE_SWING,
        ringStart: RING_START,
      },
    },
  ],

  environments: [],

  views: [{ id: 'section', label: text('label.view'), default: true }],

  /**
   * 가로 8.4 칸(옆으로 퍼지는 고리 네 개씩)을 담아야 하고 세로는 축 방향 점선과 캡션 띠뿐이다.
   * 위아래로는 물결이 비어 있는 것이 주장이라 세로를 더 줄 이유가 없다 (S-piece — 세로가 비싸다).
   */
  canvas: { height: 400, minHeight: 360 },

  /**
   * 겹침 순서가 읽기 순서다 — 축 점선 · 고리가 바닥에, 두 잎이 그 위에, 안테나 · 전하가 맨 위.
   * 층 순서로는 `lineSet`(고리)과 `trajectory`(잎)의 위아래를 고를 수 없다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 고리만 → 두 잎이 자람 → 두 잎과 고리 → 두 잎이 옅어짐.
   * 고리와 전하는 단계와 상관없이 늘 흔들린다 — 조각 시계 `t` 의 함수라 주기가 넘어가도 끊기지 않는다.
   */
  timeline: {
    phases: [
      { id: 'ripple', duration: RIPPLE, caption: key('caption.ripple') },
      { id: 'trace', duration: TRACE, ease: 'smooth', caption: key('caption.trace') },
      { id: 'hold', duration: HOLD, caption: key('caption.result') },
      { id: 'clear', duration: CLEAR, caption: key('caption.result') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — 고리는 시각의 함수라 첫 프레임부터 판을 채우고 있다. */
  startAt: 1,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — sin²θ 같은 식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -6] },
    fontSize: 13,
    wrapWidth: 640,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  // 그리드 · 카메라 단추 없음(기본값). 잴 것은 거리가 아니라 방향마다의 짙기다.

  messages: antennaRadiationMessages,
};
