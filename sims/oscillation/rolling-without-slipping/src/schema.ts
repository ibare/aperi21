// ========================================================================
// rolling-without-slipping — 선언
// ========================================================================
// 질문: 바퀴가 미끄러지지 않고 구른다는 것은 화면에서 무엇인가.
//
// 같은 크기의 바퀴 둘이 같은 빠르기 v 로 나아간다. 위 바퀴는 v = ωR 로 돌고,
// 아래 바퀴는 그보다 덜 돈다. 바퀴 위 한 점의 속도는 「앞으로 가는 v」 와 「축을
// 도는 ωR」 의 합이라, 바닥에 닿은 점에서는 둘이 반대 방향이다. v = ωR 이면
// 둘이 맞비겨 그 점은 **그 순간 멈춰 있다** — 바닥을 긁지 않는다. 덜 돌면
// 맞비기지 못해 접점이 앞으로 끌리고, 바닥에 자국이 남는다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:rolling-without-slipping` 와 문자 그대로 일치한다 (C4). */
export const ROLLING_WITHOUT_SLIPPING_ID = 'rolling-without-slipping';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 두 바퀴 중심이 나아가는 빠르기(m/s). 둘이 같다. */
export const SPEED = 1;
/** 바퀴 반지름(m). 둘이 같다. */
export const RADIUS = 0.45;
/**
 * 아래 바퀴가 도는 몫 — 구르는 데 필요한 각속도 v/R 에 대한 비. 1 이면 위 바퀴와
 * 같아지고, 1 보다 작으면 덜 돌아 접점이 앞으로 끌린다.
 */
export const SLIP_RATIO = 0.5;

/** 위 바퀴가 한 바퀴 도는 동안(초) — 한 주기의 굴러가는 시간 전체. */
export const ROLL_TIME = (2 * Math.PI * RADIUS) / SPEED;
/** 표시한 점이 꼭대기에서 바닥까지 내려오는 시간(초) — 반 바퀴. */
export const TOUCH_TIME = (Math.PI * RADIUS) / SPEED;

// ------------------------------------------------------------------------
// 배치 — 월드 미터. 두 레인을 위아래로 둔다.
// ------------------------------------------------------------------------

/** 바퀴 중심이 주기를 시작하는 x. 두 바퀴가 같은 자리에서 떠난다. */
export const START_X = 0;
/** 위 레인(구름) · 아래 레인(끌림)의 바닥 높이. */
export const LANE_ROLL_Y = 1.75;
export const LANE_SLIP_Y = 0;

/**
 * 속도 → 화살표 길이 배율(m per m/s). 중심 화살표 v 가 반지름보다 조금 길다 — 반지름과
 * 같으면 아래 바퀴의 접점 화살표(v − ωR)가 접점 고리 · 표시한 점에 묻힌다.
 */
export const ARROW_SCALE = (1.25 * RADIUS) / SPEED;

/** 표시한 점 · 바퀴 축 · 접점 고리의 반지름(m). */
export const MARK_RADIUS = 0.055;
export const HUB_RADIUS = 0.035;
export const CONTACT_RING_RADIUS = 0.085;

/** 끌린 자국 띠의 두께(m). 바닥선 위에 깔린다. */
export const SKID_THICKNESS = 0.045;
/**
 * 멈춘 순간 접점의 두 성분(v · ωR) 화살표를 놓는 높이(바닥선 기준 m). 바닥 **아래**다 —
 * 바닥선 위에 겹치면 바퀴 테 · 자국과 섞여 두 화살이 맞비기는 것이 흐려진다.
 */
export const COMPONENT_Y = -0.32;
/** 레인 이름표(`v = ωR` · `v > ωR`)의 자리. 바퀴가 출발하는 곳 왼쪽, 바퀴 가운데 높이. */
export const LANE_LABEL_X = -1.05;

/**
 * 프레이밍은 주장의 일부다. 가로는 레인 이름표부터 마지막 자리의 꼭대기 화살표 끝까지,
 * 세로는 아래 레인의 성분 화살표 이름 아래와 위 레인 꼭대기 화살표 이름 위까지.
 * 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -1.45, maxX: 4.05, minY: -0.82, maxY: 2.88 } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이의 기본값은 물리가 정한다
// ------------------------------------------------------------------------

/** 닿기 직전 · 직후를 느리게 보이는 구간(물리 초). 점이 멈추는 모습이 눈에 남는 폭. */
export const TOUCH_WINDOW = 0.32;
/** 느리게 흘리는 배율. 0.32 초가 화면에서 약 1.3 초가 된다. */
export const TOUCH_SLOW = 0.25;
/** 굴러가는 구간의 배율. 실시간 2.8 초 한 바퀴는 눈으로 따라가기 빠르다. */
export const ROLL_SLOW = 0.6;
/** 멈춘 화면을 읽는 동안(초). 두 성분이 맞비기는 것을 보는 시간이다. */
export const FREEZE = 4;
/** 한 바퀴를 마친 그림을 읽는 동안 · 다음 주기로 넘어가며 흐려지는 동안. */
export const HOLD = 1.6;
export const FADE = 0.6;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const rollingWithoutSlippingMessages = Object.freeze({
  'label.title': { ko: '미끄러지지 않는 구름', en: 'Rolling without slipping' },
  'label.operation': {
    ko: '병진과 회전의 구속 조건',
    en: 'The constraint that ties translation to rotation',
  },
  'label.stage': { ko: '두 바퀴', en: 'Two wheels' },
  'label.view': { ko: '두 레인', en: 'Two lanes' },
  /** 화살표 · 레인에 붙는 수식 표기. 번역 대상이 아니다 (C1 판정 3). */
  'label.top': { ko: 'v + ωR', en: 'v + ωR' },
  'label.center': { ko: 'v', en: 'v' },
  'label.bottom': { ko: 'v − ωR', en: 'v − ωR' },
  'label.translate': { ko: 'v', en: 'v' },
  'label.spin': { ko: 'ωR', en: 'ωR' },
  'label.zero': { ko: '0', en: '0' },
  'label.laneRoll': { ko: 'v = ωR', en: 'v = ωR' },
  'label.laneSlip': { ko: 'v > ωR', en: 'v > ωR' },
  'caption.roll': {
    ko: '같은 빠르기로 나아가는 두 바퀴 — 위는 구르고, 아래는 덜 돌아 바닥에 끌린다',
    en: 'Two wheels moving forward at the same speed — the upper one rolls, the lower one turns too little and drags',
  },
  'caption.touch': {
    ko: '표시한 점이 바닥으로 내려온다',
    en: 'The marked point comes down to the floor',
  },
  'caption.freeze': {
    ko: '바닥에 닿은 점: 위에서는 앞으로 가는 v 와 뒤로 도는 ωR 이 같아 그 순간 멈춰 있고, 아래에서는 ωR 이 모자라 앞으로 끌린다',
    en: 'At the contact point, the forward v and the backward ωR match on top, so the point stands still; below, ωR falls short and the point drags forward',
  },
  'caption.leave': {
    ko: '멈췄던 점이 곧장 위로 떠오른다 — 위의 자취는 바닥에서 뾰족하게 꺾인다',
    en: 'The point that stood still lifts straight up — the upper trace turns sharply at the floor',
  },
  'caption.result': {
    ko: '구르는 바퀴는 바닥에 자국을 남기지 않고, 끌린 바퀴만 자국을 남겼다',
    en: 'The rolling wheel left no mark on the floor; only the dragged wheel did',
  },
} satisfies Record<string, LocalizedText>);

export type RollingWithoutSlippingMessageKey = keyof typeof rollingWithoutSlippingMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: RollingWithoutSlippingMessageKey): LocalizedText =>
  rollingWithoutSlippingMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: RollingWithoutSlippingMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const rollingWithoutSlippingSchema: BundleSchema = {
  id: ROLLING_WITHOUT_SLIPPING_ID,
  label: text('label.title'),
  category: 'oscillation',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 바로 굴러가고, 닿는 순간 멈춰 보이고, 다시 굴러간다.
  parameters: [],

  stages: [
    {
      id: 'two-wheels',
      label: text('label.stage'),
      constants: { speed: SPEED, radius: RADIUS, slipRatio: SLIP_RATIO },
    },
  ],

  environments: [],

  views: [{ id: 'lanes', label: text('label.view'), default: true }],

  /**
   * 가로 5.45 m 를 담아야 하고 세로는 두 레인(1.75 m 간격)과 바닥 아래 성분 화살표 · 캡션 줄이다. 세로를 더
   * 주면 가로가 먼저 차서 그림만 작아진다 (S-piece — 세로가 비싸다).
   */
  canvas: { height: 440, minHeight: 380 },

  /**
   * 겹침이 판정 장치다. 끌린 자국은 **바퀴 아래**로 깔려야 바퀴가 그 위를 지나온 것으로
   * 읽히고, 표시한 점은 바퀴살 위에 와야 한다. 층 순서로는 `region` 이 물체 위로 올라온다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 굴러옴 → (느리게) 닿음 → 멈춤 → (느리게) 떠남 → 굴러감 → 읽기 → 흐려짐.
   *
   * 단계 길이의 기본값을 물리에서 끌어온다. `roll-in` + `touch` 가 반 바퀴(πR/v)라서
   * 표시한 점이 바닥에 닿는 순간이 곧 `freeze` 의 시작이다. 반대로 물리는 이 상수를 보지
   * 않고 시간표에게 닿는 시각을 묻는다 — 저작자가 `roll-in` 을 늘이면 점이 닿는 자리가
   * 그만큼 뒤로 가고 멈춤과 닿음이 어긋나지 않는다.
   */
  timeline: {
    phases: [
      {
        id: 'roll-in',
        duration: TOUCH_TIME - TOUCH_WINDOW,
        timeScale: ROLL_SLOW,
        caption: key('caption.roll'),
      },
      {
        id: 'touch',
        duration: TOUCH_WINDOW,
        timeScale: TOUCH_SLOW,
        caption: key('caption.touch'),
      },
      { id: 'freeze', duration: FREEZE, caption: key('caption.freeze') },
      {
        id: 'leave',
        duration: TOUCH_WINDOW,
        timeScale: TOUCH_SLOW,
        caption: key('caption.leave'),
      },
      {
        id: 'roll-out',
        duration: ROLL_TIME - TOUCH_TIME - TOUCH_WINDOW,
        timeScale: ROLL_SLOW,
        caption: key('caption.leave'),
      },
      { id: 'hold', duration: HOLD, caption: key('caption.result') },
      { id: 'fade', duration: FADE, caption: key('caption.result') },
    ],
  },

  /**
   * 도착한 순간 이미 진행 중이다 — 두 바퀴가 굴러가고 표시한 점이 내려오는 중인 자리에서
   * 연다. 0 이면 자취가 비어 있다.
   */
  startAt: 0.5,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 정의와 공식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 720,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것은 거리가 아니라 **화살표 둘이 같은가**이고,
   * 격자는 「몇 미터인가」 라는 다른 질문을 부른다.
   */

  messages: rollingWithoutSlippingMessages,
};
