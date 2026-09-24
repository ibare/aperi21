// ========================================================================
// elastic-potential-energy — 선언
// ========================================================================
// 질문: 용수철을 두 배 깊이 누르면 두 배 높이 튀어 오를까.
//
// 같은 용수철 둘에 같은 공을 얹는다. 오른쪽만 두 배 깊이 눌렀다가 둘을 함께 놓는다.
// 왼쪽 공이 h 만큼 오르는 동안 오른쪽 공은 4h 까지 오른다. 오른 높이가 곧 용수철이
// 눌린 채 담고 있던 에너지(m·g·h)이므로, 두 배 누른 용수철은 네 배를 담고 있었다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';
import { flightOf } from './physics';

/** 등록 키 `aperi21:elastic-potential-energy` 와 문자 그대로 일치한다 (C4). */
export const ELASTIC_POTENTIAL_ENERGY_ID = 'elastic-potential-energy';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 중력 가속도(m/s²). */
export const G = 9.8;
/** 왼쪽 레인을 누르는 깊이(m). */
export const PRESS_SLOW = 0.25;
/** 오른쪽 레인을 누르는 깊이(m). 정확히 두 배다 — 이 조각이 바꾸는 유일한 수. */
export const PRESS_DEEP = 0.5;
/** 왼쪽 공이 놓은 자리에서 오르는 높이 h(m). 용수철 상수는 이것에서 되짚는다. */
export const RISE_SLOW = 0.7;
/** k/m (1/s²) — 왼쪽 공이 정확히 h 만큼 오르게 한다. 두 레인이 같은 용수철 · 같은 공이다. */
export const STIFFNESS = (2 * G * RISE_SLOW) / (PRESS_SLOW * PRESS_SLOW);

/** 두 레인의 한 번 튀어 오름. 시간표 단계 길이의 기본값이 여기서 나온다. */
export const FLIGHT_SLOW = flightOf(PRESS_SLOW, G, STIFFNESS);
export const FLIGHT_DEEP = flightOf(PRESS_DEEP, G, STIFFNESS);

// ------------------------------------------------------------------------
// 배치 — 월드 미터. 두 발사대를 나란히 세운다.
// ------------------------------------------------------------------------

/** 왼쪽 · 오른쪽 발사대의 가로 자리. */
export const LANE_SLOW_X = 0;
export const LANE_DEEP_X = 1.45;
/** 용수철의 원래 길이(m). 바닥(y = 0)에서 윗끝까지. */
export const SPRING_LENGTH = 1;
/** 용수철 감은 수. 눌리면 간격이 좁아지는 것이 보일 만큼. */
export const SPRING_COILS = 7;
/** 받침판 [가로, 두께](m). 공이 얹히는 자리. */
export const PLATE_SIZE: readonly [number, number] = [0.3, 0.04];
/** 공 반지름(m). 두 공이 같다 — 질량이 같다는 것이 주장의 전제다. */
export const BALL_RADIUS = 0.1;

/** 누르는 힘 화살표 — 눌린 깊이(m) → 화살표 길이(m) 배율, 공 위로 띄우는 틈. */
export const PUSH_ARROW_SCALE = 0.9;
export const PUSH_ARROW_GAP = 0.04;

/** 누른 깊이를 재는 치수선의 가로 자리(발사대 기준)와 이름표 자리. 용수철 왼쪽. */
export const PRESS_MEASURE_DX = -0.27;
export const PRESS_LABEL_DX = -0.36;
/** 원래 길이 점선의 가로 범위(발사대 기준). 누른 깊이 치수선까지 닿는다. */
export const REST_LINE_FROM_DX = -0.34;
export const REST_LINE_TO_DX = 0.17;

/** 오른 높이를 재는 치수선의 가로 자리(발사대 기준). 공 오른쪽. */
export const RISE_MEASURE_DX = 0.27;
/** h 눈금선의 가로 범위와 이름표 자리(발사대 기준). 치수선 바로 오른쪽. */
export const TICK_FROM_DX = 0.21;
export const TICK_TO_DX = 0.33;
export const TICK_LABEL_DX = 0.4;

/**
 * 프레이밍은 주장의 일부다. 세로는 바닥 아래 캡션 줄부터 오른쪽 공의 정점(4h) 위까지,
 * 가로는 두 발사대와 이름표까지. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -0.75, maxX: 2.2, minY: -0.5, maxY: 3.72 } as const;

// ------------------------------------------------------------------------
// 시간표 — 오르는 단계의 길이는 물리가 정한다 (경계 상수를 따로 두지 않는다)
// ------------------------------------------------------------------------

/** 누르는 동안 · 눌러 둔 채 읽는 동안(초). */
export const PRESS = 1.2;
export const HOLD = 0.9;
/** 놓은 뒤 왼쪽 공이 정점에 닿기까지 — 그 순간 캡션이 바뀐다. */
export const LAUNCH = FLIGHT_SLOW.peak;
/** 왼쪽 정점부터 오른쪽 공이 정점에 닿기까지. */
export const CLIMB = FLIGHT_DEEP.peak - FLIGHT_SLOW.peak;
/** 오른쪽 공이 떨어져 다시 2x 만큼 눌리기까지 — 한 번 튀어 오름의 나머지 반쪽. */
export const RESULT = FLIGHT_DEEP.peak;
/** 다음 주기로 넘어가며 흐려지는 동안. */
export const FADE = 0.6;
/** 튀어 오름을 느리게 흘린다 — 실시간으로는 0.8 초 만에 끝나 높이를 눈으로 따라갈 수 없다. */
export const SLOW_MOTION = 0.3;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const elasticPotentialEnergyMessages = Object.freeze({
  'label.title': { ko: '탄성 퍼텐셜 에너지', en: 'Elastic potential energy' },
  'label.operation': { ko: '변형에 저장된 에너지', en: 'The energy stored in a deformation' },
  'label.stage': { ko: '두 발사대', en: 'Two launchers' },
  'label.view': { ko: '나란히', en: 'Side by side' },
  /** 누른 깊이 · 오른 높이 기호. 수식 표기라 번역 대상이 아니다 (C1 판정 3). */
  'label.pressSlow': { ko: 'x', en: 'x' },
  'label.pressDeep': { ko: '2x', en: '2x' },
  'label.rise1': { ko: 'h', en: 'h' },
  'label.rise2': { ko: '2h', en: '2h' },
  'label.rise3': { ko: '3h', en: '3h' },
  'label.rise4': { ko: '4h', en: '4h' },
  'caption.press': {
    ko: '같은 용수철 둘 — 오른쪽만 두 배 깊이 누른다',
    en: 'Two identical springs — only the right one is pressed twice as deep',
  },
  'caption.launch': {
    ko: '놓았다 — 펴지는 용수철에 밀려 두 공이 오른다',
    en: 'Let go — pushed off by the straightening springs, both balls climb',
  },
  'caption.climb': {
    ko: '왼쪽 공은 h 까지 오르고 떨어진다 — 오른쪽 공은 아직 오른다',
    en: 'The left ball topped out at h and is falling back — the right one is still climbing',
  },
  'caption.result': {
    ko: '두 배 깊이 누른 용수철은 공을 네 배 높이 올렸다',
    en: 'The spring pressed twice as deep threw its ball four times as high',
  },
} satisfies Record<string, LocalizedText>);

export type ElasticPotentialEnergyMessageKey = keyof typeof elasticPotentialEnergyMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: ElasticPotentialEnergyMessageKey): LocalizedText => elasticPotentialEnergyMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ElasticPotentialEnergyMessageKey): string {
  return k;
}

/** 오른 높이 눈금의 이름표 키. h 몇 칸인지가 곧 칸 번호다. */
export const RISE_LABELS: readonly ElasticPotentialEnergyMessageKey[] = [
  'label.rise1',
  'label.rise2',
  'label.rise3',
  'label.rise4',
];

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const elasticPotentialEnergySchema: BundleSchema = {
  id: ELASTIC_POTENTIAL_ENERGY_ID,
  label: text('label.title'),
  category: 'mechanics',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 바로 눌리고, 튀어 오르고, 다시 눌린다.
  parameters: [],

  stages: [
    {
      id: 'launchers',
      label: text('label.stage'),
      constants: { g: G, stiffness: STIFFNESS, pressSlow: PRESS_SLOW, pressDeep: PRESS_DEEP },
    },
  ],

  environments: [],

  views: [{ id: 'side-by-side', label: text('label.view'), default: true }],

  /**
   * 세로 4.2 m 를 담아야 한다 — 네 배 높이가 주장이라 세로를 줄일 수 없다. 가로는
   * 발사대 둘과 이름표뿐이라 좁다. 캡션은 바닥 아래 줄에 둔다.
   */
  canvas: { height: 440, minHeight: 400 },

  /**
   * 겹침이 판정 장치다. 원래 길이 점선은 용수철 **뒤**로 지나가야 하고, 누르는 힘
   * 화살표는 공 위에 얹혀야 한다. 층 순서로는 `constraint` 가 선언 순서와 무관하게 놓인다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 누름 → 눌러 둠 → 놓음(왼쪽 정점까지) → 오름(오른쪽 정점까지) → 결과 → 흐려짐.
   *
   * 오르는 두 단계의 길이를 물리에서 끌어온다. 왼쪽 공이 정점에 닿는 순간이 곧
   * `launch` 의 끝이라서 「왼쪽 공은 h 까지 오르고」 라는 캡션이 화면과 어긋날 수 없다.
   * 튀어 오름은 0.3 배로 흘린다 — 실시간으로는 1 초도 안 걸려 높이를 따라갈 수 없다.
   */
  timeline: {
    phases: [
      { id: 'press', duration: PRESS, ease: 'smooth', caption: key('caption.press') },
      { id: 'hold', duration: HOLD, caption: key('caption.press') },
      { id: 'launch', duration: LAUNCH, timeScale: SLOW_MOTION, caption: key('caption.launch') },
      { id: 'climb', duration: CLIMB, timeScale: SLOW_MOTION, caption: key('caption.climb') },
      { id: 'result', duration: RESULT, timeScale: SLOW_MOTION, caption: key('caption.result') },
      { id: 'fade', duration: FADE, caption: key('caption.result') },
    ],
  },

  /**
   * 도착한 순간 이미 진행 중이다 — 두 용수철이 눌려 내려가는 중에 연다. 0 이면 아무것도
   * 움직이지 않는 발사대 둘이 먼저 보인다.
   */
  startAt: 0.7,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 정의와 공식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것은 임의의 높이가 아니라 **h 몇 칸인가** 라,
   * 거리 격자를 깔면 「몇 미터인가」 라는 다른 질문이 끼어든다. 칸은 h 눈금으로 직접 긋는다.
   */

  messages: elasticPotentialEnergyMessages,
};
