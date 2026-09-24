// ========================================================================
// simple-harmonic-motion — 선언
// ========================================================================
// 질문: 복원력이 변위에 비례하면 운동은 어떤 모양이 되는가.
//
// 천장에 매단 추가 오르내린다. 추에 걸린 되미는 힘(화살표)은 늘 평형점을 향하고
// 길이가 변위에 비례한다 — 멀수록 길고, 한가운데를 지날 때는 없다. 추 옆에서 펜이
// 오른쪽으로 일정하게 나아가며 추의 높이를 적으면, 오르내림이 시간 쪽으로 펼쳐져
// 사인 곡선이 된다. 펜은 1/8 주기마다 그 순간의 힘 화살표를 곡선 위에 남긴다 —
// 곡선은 축에서 멀수록 더 세게 축 쪽으로 휘고, 그 휨이 곧 화살표다.
//
// 에너지 교환(shm-energy) · 질량과 주기(mass-spring-system)는 이웃 조각의 몫이다.
// 이 조각은 「변위에 비례해 되미는 힘 → 사인 곡선」 에 머문다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:simple-harmonic-motion` 와 문자 그대로 일치한다 (C4). */
export const SIMPLE_HARMONIC_MOTION_ID = 'simple-harmonic-motion';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 추의 질량(kg). */
export const MASS = 0.5;
/** 용수철 상수(N/m). 되미는 힘 = −k · 변위. */
export const STIFFNESS = 5;
/** 진폭(m) — 처음 당겨 놓은 거리. 위 끝에서 놓는다. */
export const AMPLITUDE = 1;

/** 한 주기(초) = 2π√(m/k). 시간표 단계 길이의 기본값이 이것에서 나온다. */
export const PERIOD = 2 * Math.PI * Math.sqrt(MASS / STIFFNESS);

// ------------------------------------------------------------------------
// 배치 — 월드 미터. 추는 왼쪽, 기록지는 오른쪽.
// ------------------------------------------------------------------------

/** 추가 오르내리는 세로줄의 x. 평형점은 y = 0 이다. */
export const MASS_X = 0;
/** 추 크기 [가로, 세로](m). */
export const MASS_SIZE: readonly [number, number] = [0.46, 0.46];
/** 천장 높이와 천장 판의 반폭. */
export const CEILING_Y = 2.05;
export const CEILING_HALF = 0.5;
/** 천장 위 빗금 띠의 두께. */
export const CEILING_DEPTH = 0.14;
/** 용수철 감은 수. */
export const SPRING_COILS = 9;

/** 펜이 적기 시작하는 자리(기록지 왼쪽 끝)와 기록지 길이. */
export const PAPER_START = 0.95;
export const PAPER_LENGTH = 7.4;
/** 시간축(평형선)의 오른쪽 끝 — 기록지보다 조금 더 간다. */
export const AXIS_END = PAPER_START + PAPER_LENGTH + 0.3;

/**
 * 힘 → 화살표 길이 배율(m per N). k·A = 5 N 이 0.6 m 가 되게 — 화살표가 곡선과 축 사이에
 * 들어앉아 끝이 축에 닿지 않는다. 추 위 화살표와 곡선 위 화살표가 **같은 배율**이다 —
 * 곡선 위 화살표는 그 순간 추에 걸렸던 힘을 그대로 옮겨 적은 것이기 때문이다.
 */
export const FORCE_SCALE = 0.12;
/** 1 주기에 남기는 힘 화살표 수. 1/8 주기마다 — 꼭대기 · 45° · 축 · … 이 모두 찍힌다. */
export const STAMPS_PER_PERIOD = 8;

/**
 * 프레이밍은 주장의 일부다. 가로는 추 왼쪽 힘 화살표의 기호부터 시간축 이름표까지, 세로는 추의 아래
 * 끝(−A − 추 반높이)과 천장 빗금 위까지. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -1.0, maxX: 8.95, minY: -1.55, maxY: 2.35 } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이의 기본값은 주기에서 나온다
// ------------------------------------------------------------------------

/**
 * 쓰는 세 단계가 한 주기씩이다. 멈춘 그림을 읽는 동안 · 흐려지는 동안을 합쳐 다시 한 주기라서
 * 한 바퀴 전체가 주기의 정수배(4T)이고, 추는 바퀴가 넘어가는 순간에도 끊기지 않고 돈다.
 */
export const WRITE = PERIOD;
export const HOLD = 0.7 * PERIOD;
export const FADE = 0.3 * PERIOD;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const simpleHarmonicMotionMessages = Object.freeze({
  'label.title': { ko: '단순 조화 운동', en: 'Simple harmonic motion' },
  'label.stage': { ko: '매단 용수철', en: 'Hanging spring' },
  'label.view': { ko: '추와 기록지', en: 'Mass and chart' },
  /** 힘 화살표 · 시간축에 붙는 기호. 수식 표기라 번역 대상이 아니다 (C1 판정 3). */
  'label.force': { ko: 'F', en: 'F' },
  'label.time': { ko: 't', en: 't' },
  'caption.pull': {
    ko: '추가 평형점에서 멀어질수록 되미는 힘이 커지고, 한가운데를 지날 때는 힘이 없다',
    en: 'The farther the mass is from equilibrium, the harder it is pushed back — passing the middle, there is no force',
  },
  'caption.unfold': {
    ko: '펜이 옆으로 나아가며 추의 높이를 적는다 — 오르내림이 시간 쪽으로 펼쳐진다',
    en: 'The pen moves sideways, recording the height of the mass — the up-and-down motion unfolds along time',
  },
  'caption.bend': {
    ko: '남겨 둔 화살표가 긴 곳일수록 곡선이 축 쪽으로 세게 휜다',
    en: 'Where the arrows left behind are longer, the curve bends harder back toward the axis',
  },
  'caption.result': {
    ko: '변위에 비례해 되미는 힘이 그린 곡선 — 사인 곡선이다',
    en: 'The curve drawn by a push-back proportional to displacement — a sine curve',
  },
} satisfies Record<string, LocalizedText>);

export type SimpleHarmonicMotionMessageKey = keyof typeof simpleHarmonicMotionMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: SimpleHarmonicMotionMessageKey): LocalizedText => simpleHarmonicMotionMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: SimpleHarmonicMotionMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const simpleHarmonicMotionSchema: BundleSchema = {
  id: SIMPLE_HARMONIC_MOTION_ID,
  title: text('label.title'),
  category: 'oscillation',
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 추가 오르내리고, 펜이 곡선을 펼친다.
  parameters: [],

  stages: [
    {
      id: 'hanging-spring',
      label: text('label.stage'),
      constants: { mass: MASS, stiffness: STIFFNESS, amplitude: AMPLITUDE },
    },
  ],

  environments: [],

  views: [{ id: 'chart', label: text('label.view'), default: true }],

  /**
   * 가로로 세 주기(7.4 m)를 펼쳐야 하고 세로는 진폭 둘과 천장뿐이다. 세로를 더 주면 가로가
   * 먼저 차서 곡선만 작아진다 (S-piece — 세로가 비싸다).
   */
  canvas: { height: 360, minHeight: 320 },

  /**
   * 겹침이 판정 장치다. 곡선 위에 남긴 화살표는 곡선 **아래** 로 깔려야 곡선이 그 위를
   * 지나간 것으로 읽히고, 펜 점은 곡선 끝 위에 올라와야 한다. 층 순서로는 `vector` 가
   * `trajectory` 위에 온다.
   */
  drawOrder: 'scene',

  /**
   * 한 바퀴 = 첫 주기(힘) → 둘째 주기(펼침) → 셋째 주기(휨) → 멈춘 곡선 → 흐려짐.
   *
   * 펜의 자리는 `start('write-1')` ~ `end('write-3')` 구간의 진행도로 읽는다. 단계 경계를
   * 코드에 두지 않는다 (S-piece). 한 바퀴가 주기의 정수배라 추는 끊김 없이 돈다.
   */
  timeline: {
    phases: [
      { id: 'write-1', duration: WRITE, caption: key('caption.pull') },
      { id: 'write-2', duration: WRITE, caption: key('caption.unfold') },
      { id: 'write-3', duration: WRITE, caption: key('caption.bend') },
      { id: 'hold', duration: HOLD, caption: key('caption.result') },
      { id: 'fade', duration: FADE, caption: key('caption.result') },
    ],
  },

  /**
   * 도착한 순간 이미 진행 중이다 — 추가 한 번 내려갔다 오는 중이고 곡선이 반 주기쯤
   * 적혀 있는 자리에서 연다. 0 이면 빈 기록지가 먼저 보인다.
   */
  startAt: 0.4 * PERIOD,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 정의와 공식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 이 그림이 재라고 하는 것은 거리가 아니라 곡선의
   * **모양**이다. 격자를 깔면 「몇 미터인가」 가 끼어든다.
   */

  messages: simpleHarmonicMotionMessages,
};
