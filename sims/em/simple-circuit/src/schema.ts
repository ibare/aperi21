// ========================================================================
// simple-circuit — 선언
// ========================================================================
// 질문: 전구에 불이 켜지려면 무엇이 있어야 하는가.
//
// 전지 · 전선 · 전구가 끊김 없는 한 고리를 이룬다. 고리를 따라 전자 알갱이가 돌고
// 전구가 켜져 있다. 고리의 한 곳 — 전구 바로 옆, 전구에서 먼 오른쪽 변, 전지 가까운
// 아래 전선 — 을 차례로 끊는다. 어디를 끊든 **고리 전체의** 알갱이가 한꺼번에 멈추고
// 전구가 꺼진다. 다시 이으면 다시 돌고 다시 켜진다.
//
// 초등 수준이다. 식 · 전압 · 전류 값을 쓰지 않는다 — 이어졌는가, 끊겼는가만 본다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:simple-circuit` 와 문자 그대로 일치한다 (C4). */
export const SIMPLE_CIRCUIT_ID = 'simple-circuit';

// ------------------------------------------------------------------------
// 흐름 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 단위는 월드 단위(고리 위 거리)와 조각 시계의 초다. 실제 전자의 빠르기가 아니라
// 흐름이 눈에 보이는 빠르기다 — 이 조각은 빠르기를 말하지 않는다.
// ------------------------------------------------------------------------

/** 이어져 있을 때 알갱이가 고리를 따라 가는 빠르기(월드/초). */
export const FLOW_SPEED = 1.2;
/** 알갱이 사이 간격(월드). 둘레를 이 값에 가장 가깝게 나눠 떨어지게 둔다. */
export const CARRIER_SPACING = 0.6;
/** 알갱이 꼬리 길이 = 빠르기 × 이 시간(초). 멈추면 꼬리가 사라진다. */
export const TRAIL_SECONDS = 0.4;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 고리는 가로로 긴 네모다.
// ------------------------------------------------------------------------

/** 고리의 네 변. 전지는 왼쪽 변 가운데, 전구는 위 변 가운데. 가로로 길게 둔다 — 임베드는 세로가 비싸다 (S-piece). */
export const LOOP_LEFT = -5;
export const LOOP_RIGHT = 5;
export const LOOP_TOP = 1.5;
export const LOOP_BOTTOM = -1.5;

/** 전지 — 왼쪽 변 위의 가운데 높이, 두 판 사이 간격, 긴 판(+) · 짧은 판(−)의 반 길이. */
export const BATTERY_Y = 0;
export const BATTERY_PLATE_GAP = 0.24;
export const BATTERY_LONG_HALF = 0.42;
export const BATTERY_SHORT_HALF = 0.22;

/**
 * 전구 — 위 변 가운데. `circuitElement` lamp 는 소자 로컬 ±1 을 두 단자로, 그 안쪽
 * 절반(±0.5)을 전구 동그라미로 그린다.
 */
export const LAMP_X = 0;
export const LAMP_HALF = 1;
export const LAMP_RADIUS = 0.5;

/**
 * 끊는 자리 셋 — 고리 둘레의 호길이 구간 [시작, 끝]. 둘레는 왼쪽 위 모서리에서 출발해
 * 왼쪽 변을 내려가고(0~3), 아래 변을 오른쪽으로(3~13), 오른쪽 변을 올라가고(13~16),
 * 위 변을 왼쪽으로(16~26) 돈다 — 전자가 가는 방향이다.
 *
 *   a — 위 전선, 전구 바로 오른쪽 (x 2.2 → 1.4)
 *   b — 오른쪽 변, 전구에서 가장 먼 곳 (y −0.4 → 0.4)
 *   c — 아래 전선, 전지 가까이 (x −3.6 → −2.8)
 *
 * 구간의 시작이 경첩이고 끝이 떨어지는 쪽이다. 토막은 고리 바깥으로 젖혀진다.
 */
export const CUT_A = [18.8, 19.6] as const;
export const CUT_B = [14.1, 14.9] as const;
export const CUT_C = [4.4, 5.2] as const;

/**
 * 프레이밍은 주장의 일부다. 가로는 전지 이름표부터 오른쪽 변의 젖혀진 토막까지,
 * 세로는 전구 빛살 위부터 아래 변의 젖혀진 토막 · e⁻ 표식 아래 캡션 줄까지. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -6.5, maxX: 6.1, minY: -2.75, maxY: 2.45 } as const;

// ------------------------------------------------------------------------
// 시간표 — 조각 시계(초)
// ------------------------------------------------------------------------

/** 이어져 흐르는 동안. 첫 단계는 조금 더 길다 — 도착한 독자가 흐름을 먼저 본다. */
export const LIT_FIRST = 2.4;
export const LIT = 2;
/** 토막이 젖혀지며 끊기는 동안 · 다시 닫히며 이어지는 동안. */
export const SWING = 0.5;
/** 끊긴 채 멈춰 있는 동안. */
export const DARK = 1.6;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const simpleCircuitMessages = Object.freeze({
  'label.title': { ko: '전기 회로 만들기', en: 'Building an electric circuit' },
  'label.stage': { ko: '한 고리', en: 'One loop' },
  'label.view': { ko: '회로', en: 'Circuit' },
  'label.battery': { ko: '전지', en: 'battery' },
  'label.bulb': { ko: '전구', en: 'bulb' },
  /** 전지 극 · 전자 기호. 표식이라 번역하지 않는다 (C1 판정 3). */
  'label.plus': { ko: '+', en: '+' },
  'label.minus': { ko: '−', en: '−' },
  'label.electron': { ko: 'e⁻', en: 'e⁻' },
  'caption.lit': {
    ko: '전지 · 전선 · 전구가 끊김 없이 한 바퀴 이어져 있다 — 알갱이가 돌고 전구가 켜져 있다',
    en: 'Battery, wires and bulb join in one unbroken loop — the particles circulate and the bulb is lit',
  },
  'caption.cutA': {
    ko: '전구 바로 옆을 끊었다 — 고리의 모든 알갱이가 멈추고 전구가 꺼졌다',
    en: 'The wire right beside the bulb is broken — every particle in the loop stops and the bulb goes dark',
  },
  'caption.cutB': {
    ko: '전구에서 가장 먼 곳을 끊었다 — 그래도 모든 알갱이가 멈추고 전구가 꺼졌다',
    en: 'The break is now as far from the bulb as it gets — still every particle stops and the bulb goes dark',
  },
  'caption.cutC': {
    ko: '전지 가까운 아래 전선을 끊었다 — 역시 모든 알갱이가 멈추고 전구가 꺼졌다',
    en: 'The lower wire near the battery is broken — again every particle stops and the bulb goes dark',
  },
  'caption.join': {
    ko: '끊긴 곳을 다시 잇는다',
    en: 'The break is being closed again',
  },
  'caption.relit': {
    ko: '다시 이어지자 알갱이가 다시 돌고 전구가 다시 켜졌다',
    en: 'Joined again — the particles circulate once more and the bulb lights up again',
  },
} satisfies Record<string, LocalizedText>);

export type SimpleCircuitMessageKey = keyof typeof simpleCircuitMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: SimpleCircuitMessageKey): LocalizedText => simpleCircuitMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: SimpleCircuitMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const simpleCircuitSchema: BundleSchema = {
  id: SIMPLE_CIRCUIT_ID,
  title: text('label.title'),
  category: 'em',
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 흐르고, 세 자리를 차례로 끊었다 잇는다.
  parameters: [],

  stages: [
    {
      id: 'one-loop',
      label: text('label.stage'),
      constants: {
        flowSpeed: FLOW_SPEED,
        carrierSpacing: CARRIER_SPACING,
        trailSeconds: TRAIL_SECONDS,
      },
    },
  ],

  environments: [],

  views: [{ id: 'circuit', label: text('label.view'), default: true }],

  /** 고리 하나와 캡션 한 줄. 세로를 더 주면 가로가 먼저 차서 그림만 작아진다 (S-piece). */
  canvas: { height: 360, minHeight: 320 },

  /**
   * 겹침이 판정 장치다. 전구의 빛(원)은 전구 기호 **아래**, 알갱이는 전선 **위**,
   * 이름표는 맨 위에 와야 한다. 층 순서로는 plugin 기호가 빛 원 아래로 깔릴 수 있다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = (흐름 → 끊김 → 꺼진 채 → 다시 이음) × 세 자리.
   *
   * `lit-*` 단계만 흐른다. `cut-*` 가 시작하는 순간 토막이 떨어지므로 그때부터 멈추고,
   * `join-*` 가 끝나는 순간 닿으므로 다음 `lit-*` 부터 다시 흐른다. 젖혀지는 각은
   * `cut-*` · `join-*` 의 진행도다.
   *
   * 알갱이가 흐른 거리는 `lit-*` 단계 길이의 합으로 이어 세므로(주기 번호 × 한 주기 흐름 +
   * 이번 주기 흐름) 주기가 돌아와도 알갱이가 튀지 않는다.
   */
  timeline: {
    phases: [
      { id: 'lit-a', duration: LIT_FIRST, caption: key('caption.lit') },
      { id: 'cut-a', duration: SWING, ease: 'smooth', caption: key('caption.cutA') },
      { id: 'dark-a', duration: DARK, caption: key('caption.cutA') },
      { id: 'join-a', duration: SWING, ease: 'smooth', caption: key('caption.join') },
      { id: 'lit-b', duration: LIT, caption: key('caption.relit') },
      { id: 'cut-b', duration: SWING, ease: 'smooth', caption: key('caption.cutB') },
      { id: 'dark-b', duration: DARK, caption: key('caption.cutB') },
      { id: 'join-b', duration: SWING, ease: 'smooth', caption: key('caption.join') },
      { id: 'lit-c', duration: LIT, caption: key('caption.relit') },
      { id: 'cut-c', duration: SWING, ease: 'smooth', caption: key('caption.cutC') },
      { id: 'dark-c', duration: DARK, caption: key('caption.cutC') },
      { id: 'join-c', duration: SWING, ease: 'smooth', caption: key('caption.join') },
    ],
  },

  /**
   * 도착한 순간 이미 진행 중이다 — 알갱이는 첫 프레임부터 고리를 채우고 돈다.
   * 첫 흐름 단계를 조금 지난 자리에서 연다.
   */
  startAt: 0.4,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 식 · 정의는 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것이 없다 — 이어졌는가, 끊겼는가뿐이다.
   */

  messages: simpleCircuitMessages,
};
