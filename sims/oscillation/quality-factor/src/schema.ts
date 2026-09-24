// ========================================================================
// quality-factor — 선언
// ========================================================================
// 질문: 공명 봉우리가 뾰족한 것과 구동을 멈춘 뒤 오래 울리는 것은 같은 성질인가.
//
// 같은 고유 진동수 f₀ 의 진동자 둘 — 위는 Q = 3, 아래는 Q = 12. 구동 진동수를 훑으면
// 아래 진동자는 f₀ 가까이에서만 크게 흔들린다(봉우리가 좁다). f₀ 에 맞춰 둘을 같은
// 크기로 흔들다가 구동을 멈추면, 위는 몇 번 만에 잦아들고 아래는 오래 울린다.
// 봉우리 폭을 재는 막대와 울린 길이를 재는 막대가 같은 비(1/4 · 4 배)로 선다.
//
// 이웃 조각 `resonance` 는 「맞는 진동자만 흔들림이 쌓인다」 를 말한다. 여기서는 그것을
// 되풀이하지 않고, 한 진동자의 Q 가 봉우리 폭과 울림 길이를 함께 정한다는 것만 잇는다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:quality-factor` 와 문자 그대로 일치한다 (C4). */
export const QUALITY_FACTOR_ID = 'quality-factor';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 두 진동자의 고유 진동수(Hz). 둘이 같다 — 다른 것은 Q 하나뿐이다. */
export const F0 = 1.5;
/** 위 · 아래 진동자의 Q. 네 배 차이 — 봉우리 폭은 1/4, 울림 길이는 4 배가 된다. */
export const Q_LOW = 3;
export const Q_HIGH = 12;
/** 구동 진동수를 훑는 범위(f₀ 에 대한 비). 가운데가 f₀ 다. */
export const SWEEP_FROM = 0.5;
export const SWEEP_TO = 1.5;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 레인 둘을 위아래로, 레인 안은 왼쪽부터 곡선 · 진동자 · 기록.
// ------------------------------------------------------------------------

/** 위 레인(Q 작음) · 아래 레인(Q 큼)의 가운데 높이. 기록의 영점 · 추의 평형 자리다. */
export const LANE_LOW_Y = 1.8;
export const LANE_HIGH_Y = 0;
/** 흔들림 반폭(월드). 곡선 봉우리 높이와 기록의 진폭이 같은 반폭을 쓴다. */
export const SWING = 0.5;

/** 공명 곡선 판 — 가로(구동 진동수) 왼쪽 끝과 폭. 세로는 레인 가운데 ± SWING. */
export const CURVE_LEFT = 0;
export const CURVE_WIDTH = 3;
/** 곡선을 표본할 개수. 봉우리가 좁은 Q = 12 도 매끄럽게 나오도록 촘촘히. */
export const CURVE_SAMPLES = 360;

/** 진동자 — 가로 자리, 매단 판 높이(레인 가운데 기준), 추 크기. */
export const OSC_X = 4.15;
export const SUPPORT_Y = 1.0;
export const SUPPORT_HALF = 0.28;
export const BOB_SIZE: readonly [number, number] = [0.36, 0.2];

/** 시간 기록 판 — 왼쪽 끝과 폭. 구동 시작부터 울림 단계 끝까지를 이 폭에 담는다. */
export const STRIP_LEFT = 5.0;
export const STRIP_WIDTH = 8.0;
/** 기록을 표본하는 간격(초). */
export const STRIP_DT = 1 / 60;

/** 재는 막대(울린 길이)의 높이 — 레인 가운데 아래. 기록의 진폭(SWING) 바로 밖. */
export const RING_BAR_Y = -0.66;
/** 재는 막대 끝 눈금의 반높이. */
export const BAR_TICK = 0.07;

/** 레인 이름표(Q = …)의 자리 — 곡선 판 왼쪽. */
export const LANE_LABEL_X = -0.3;
/** 곡선 판 아래 f₀ 눈금 이름표 · 축 이름표 · 시간 축 이름표의 높이(레인 가운데 기준). */
export const TICK_LABEL_DY = -0.72;
export const AXIS_LABEL_DY = -1.02;

/**
 * 프레이밍은 주장의 일부다. 가로는 레인 이름표부터 기록 끝까지, 세로는 위 레인의 매단 판부터
 * 아래 레인의 축 이름표 · 캡션 줄까지. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -1.25, maxX: 13.25, minY: -1.75, maxY: 2.95 } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이의 기본값. 물리는 이 상수를 보지 않고 시간표에게 묻는다.
// ------------------------------------------------------------------------

/** 구동 진동수를 훑는 동안(초). 곡선이 왼쪽에서 오른쪽으로 그려진다. */
export const SWEEP = 4.5;
/** 훑은 끝(1.5 f₀)에서 f₀ 로 되돌아오는 동안. */
export const TUNE = 1.0;
/** f₀ 에서 구동하며 기록을 시작하는 동안. */
export const DRIVE = 1.5;
/** 구동을 멈추고 울리는 동안. Q = 12 가 e^−π(약 4 %)까지 잦아드는 Q/f₀ = 8 초보다 조금 길다. */
export const RING = Q_HIGH / F0 + 0.5;
/** 다 울린 그림을 읽는 동안 · 다음 주기로 넘어가며 흐려지는 동안. */
export const HOLD = 3;
export const FADE = 0.6;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const qualityFactorMessages = Object.freeze({
  'label.title': { ko: 'Q 인자', en: 'Quality factor' },
  'label.operation': { ko: '공명의 날카로움', en: 'How sharp a resonance is' },
  'label.stage': { ko: '두 진동자', en: 'Two oscillators' },
  'label.view': { ko: '봉우리와 울림', en: 'Peak and ringing' },
  /** 레인 이름표. 수식 표기라 번역 대상이 아니다 (C1 판정 3). */
  'label.q': { ko: 'Q = {q}', en: 'Q = {q}' },
  /** 곡선 판 가로축의 f₀ 눈금. 기호다. */
  'label.f0': { ko: 'f₀', en: 'f₀' },
  'label.driveAxis': { ko: '구동 진동수 →', en: 'driving frequency →' },
  'label.timeAxis': { ko: '시간 →', en: 'time →' },
  'label.release': { ko: '구동 멈춤', en: 'drive off' },
  'caption.sweep': {
    ko: '구동 진동수를 훑는다 — 아래 진동자는 f₀ 가까이에서만 크게 흔들린다',
    en: 'Sweeping the drive — the lower oscillator swings hard only near f₀',
  },
  'caption.drive': {
    ko: 'f₀ 에 맞춰 둘을 같은 크기로 흔든다',
    en: 'Driving both at f₀, swinging by the same amount',
  },
  'caption.ring': {
    ko: '구동을 멈췄다 — 위는 몇 번 만에 잦아들고, 아래는 계속 울린다',
    en: 'Drive off — the upper one dies within a few swings, the lower one keeps ringing',
  },
  'caption.result': {
    ko: '봉우리가 좁은 진동자일수록 구동을 멈춘 뒤 오래 울린다',
    en: 'The narrower the peak, the longer it rings after the drive stops',
  },
} satisfies Record<string, LocalizedText>);

export type QualityFactorMessageKey = keyof typeof qualityFactorMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: QualityFactorMessageKey): LocalizedText => qualityFactorMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: QualityFactorMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const qualityFactorSchema: BundleSchema = {
  id: QUALITY_FACTOR_ID,
  label: text('label.title'),
  category: 'oscillation',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 훑고, 맞추고, 멈추고, 울리는 것이 아무것도 누르지 않아도 한 주기 안에 끝난다.
  parameters: [],

  stages: [
    {
      id: 'two-oscillators',
      label: text('label.stage'),
      constants: { f0: F0, qLow: Q_LOW, qHigh: Q_HIGH, sweepFrom: SWEEP_FROM, sweepTo: SWEEP_TO },
    },
  ],

  environments: [],

  views: [{ id: 'peak-and-ring', label: text('label.view'), default: true }],

  /**
   * 가로 14.5 를 담고 세로는 레인 둘과 축 이름표 · 캡션 줄뿐이다. 세로를 더 주면 가로가
   * 먼저 차서 그림만 작아진다 (S-piece — 세로가 비싸다).
   */
  canvas: { height: 340, minHeight: 300 },

  /**
   * 겹침이 판정 장치다 — 기록 선이 영점선 · 「구동 멈춤」 선 위로, 추가 용수철 위로
   * 올라와야 한다. 쓴 순서대로 그린다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 훑기 → f₀ 로 되돌리기 → 구동 → 울림 → 읽기 → 흐려짐.
   *
   * 구동과 울림의 길이가 기록 판의 시간 축이 된다 — 물리가 `duration('drive')` ·
   * `duration('ring')` 으로 판의 초당 폭을 정한다. 울림을 늘이면 판이 그만큼 더 긴 시간을 담는다.
   */
  timeline: {
    phases: [
      { id: 'sweep', duration: SWEEP, caption: key('caption.sweep') },
      { id: 'tune', duration: TUNE, caption: key('caption.drive') },
      { id: 'drive', duration: DRIVE, caption: key('caption.drive') },
      { id: 'ring', duration: RING, caption: key('caption.ring') },
      { id: 'hold', duration: HOLD, caption: key('caption.result') },
      { id: 'fade', duration: FADE, caption: key('caption.result') },
    ],
  },

  /**
   * 도착한 순간 이미 훑는 중이다 — 곡선이 봉우리 앞까지 그려져 있고 위 진동자가 흔들린다.
   * 0 이면 빈 판에서 시작한다.
   */
  startAt: 1.6,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — Q 의 정의와 공식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것은 거리가 아니라 **두 막대의 길이 비**다.
   */

  messages: qualityFactorMessages,
};
