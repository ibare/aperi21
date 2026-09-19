// ========================================================================
// joule-heating — 선언
// ========================================================================
// 질문: 직렬로 이은 두 저항에 전류를 흘리면 어느 쪽이 먼저 뜨거워지는가.
//
// 네모 회로 하나. 윗변에 크기가 같은 저항 덩어리 둘이 한 줄로 이어져 있다 — 큰 저항과
// 작은 저항. 스위치를 닫으면 같은 전자 흐름이 두 덩어리를 차례로 지나고, 큰 저항 쪽
// 덩어리의 원자가 더 세게 떨고 그 아래 온도계 막대가 더 빨리 오른다. 스위치를 열면
// 흐름이 멎고 둘이 식는다.
//
// 두 덩어리는 크기(열용량)가 같다 — 굵기로 저항을 가르면 굵은 쪽이 열용량도 커서
// 「같은 전류에서 저항이 큰 곳이 열을 더 낸다」 가 「가는 것은 쉽게 달아오른다」 와 섞인다.
// 전압을 올리면 전류가 는다는 것은 ohms-law 의 몫이라 여기서 전압은 하나다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:joule-heating` 와 문자 그대로 일치한다 (C4). */
export const JOULE_HEATING_ID = 'joule-heating';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 전지 전압(V). 화면 글자로 그대로 쓴다. */
export const VOLTAGE = 16;
/** 큰 저항 · 작은 저항(Ω). 한 줄로 이어져 같은 전류가 흐른다. 화면 글자로 그대로 쓴다. */
export const RESISTANCE_LARGE = 6;
export const RESISTANCE_SMALL = 2;
/** 저항 덩어리 하나의 열용량(J/K). 두 덩어리가 같은 크기라 같다. */
export const HEAT_CAPACITY = 4;

// ------------------------------------------------------------------------
// 표시 배율 — 이것도 선언이다 (원칙 2). 스테이지 상수로 둔다.
// ------------------------------------------------------------------------

/** 전류 1 A 가 만드는 알갱이 속력(월드/초). 두 덩어리를 지나는 빠르기가 같다는 것이 그림의 전부다. */
export const FLOW_SPEED_PER_AMP = 0.45;
/** 도선 위 전자 알갱이 간격(월드). */
export const CARRIER_SPACING = 0.5;
/** 알갱이 꼬리 길이 = 속력 × 이 시간(초). 흐르는 동안에만 꼬리가 있다. */
export const TRAIL_SECONDS = 0.25;
/** 온도계 막대 — 온도가 1 K 오를 때 막대가 오르는 길이(월드). */
export const COLUMN_WORLD_PER_KELVIN = 0.028;
/** 원자 떨림 폭(월드) — 실온에서의 폭과 1 K 오를 때마다 더하는 폭. */
export const JITTER_REST = 0.012;
export const JITTER_PER_KELVIN = 0.0026;
/** 원자 떨림의 진동수 범위(Hz). 원자마다 이 범위 안에서 시드로 뽑는다. */
export const JITTER_FREQ_MIN = 4;
export const JITTER_FREQ_MAX = 7;
/** 떨림 위상 · 진동수를 뽑는 시드. 같은 시드는 같은 떨림이다. */
export const SEED = 21;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 네모 회로 하나, 윗변에 저항 둘, 안쪽에 온도계 둘.
// ------------------------------------------------------------------------

/** 회로 사각형의 왼쪽(전지 쪽) · 오른쪽 x, 아래 · 위 변 y. */
export const LOOP_LEFT = -4.6;
export const LOOP_RIGHT = 4.6;
export const LOOP_BOTTOM = -1.3;
export const LOOP_TOP = 1.0;

/** 저항 덩어리 — 큰 저항 · 작은 저항의 가운데 x, 가로 · 세로 길이. 두 덩어리가 같은 크기다. */
export const BLOCK_LARGE_X = -1.8;
export const BLOCK_SMALL_X = 1.8;
export const BLOCK_WIDTH = 2.2;
export const BLOCK_HEIGHT = 0.62;
/** 덩어리 안 원자 격자 — 가로 칸 수, 도선에서 위 · 아래 줄까지의 거리(월드). */
export const ATOM_COLUMNS = 7;
export const ATOM_ROW_OFFSET = 0.16;

/** 온도계 — 알 가운데 y · 반지름, 관 아래 · 위 끝 y, 관 반폭, 실온에서 찬 높이(월드). */
export const BULB_Y = -0.92;
export const BULB_RADIUS = 0.14;
export const TUBE_BOTTOM = -0.82;
export const TUBE_TOP = 0.42;
export const TUBE_HALF = 0.07;
export const ROOM_COLUMN = 0.2;

/** 전지 — 왼쪽 변 위 가운데 y, 두 판 사이, 긴 판(+) · 짧은 판(−)의 반폭. */
export const BATTERY_Y = -0.15;
export const CELL_GAP = 0.1;
export const CELL_LONG_HALF = 0.28;
export const CELL_SHORT_HALF = 0.15;

/** 스위치 — 아래 변 위 축 x · 닿는 점 x, 열린 각(라디안). */
export const SWITCH_PIVOT_X = -0.3;
export const SWITCH_CONTACT_X = 0.3;
export const SWITCH_OPEN_ANGLE = 0.55;

/** 방향 표식(아래 변 밑) — 높이 · 전자 화살표 꼬리 x · 전류 화살표 꼬리 x · 길이. */
export const DIRECTION_Y = -1.62;
export const ELECTRON_ARROW_FROM = 1.3;
export const CURRENT_ARROW_FROM = 3.7;
export const DIRECTION_ARROW_LEN = 0.8;

/**
 * 프레이밍은 주장의 일부다. 가로는 전지 이름표부터 오른쪽 변까지, 세로는 캡션 줄부터
 * 저항 이름표 위까지. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -5.9, maxX: 5.0, minY: -2.2, maxY: 1.75 } as const;

// ------------------------------------------------------------------------
// 시간표 — 조각 시계(초)
// ------------------------------------------------------------------------

/** 스위치가 열린 채 두 덩어리가 같은 온도인 동안. */
export const REST_HOLD = 1.2;
/** 스위치 레버가 내려와 닿는 · 들려 떨어지는 동안. */
export const SWITCH_MOVE = 0.5;
/** 흐름이 시작되어 같은 전류가 두 덩어리를 지나는 것을 보는 동안. */
export const FLOW_HOLD = 2.0;
/** 온도 차가 벌어지는 것을 보는 동안. */
export const HEAT_HOLD = 4.0;
/** 흐름이 멎고 두 덩어리가 식는 동안. */
export const COOL = 1.8;
/**
 * 도착한 순간 이미 흐르고 있다 — `flow` 단계에 들어와 0.5 초 지난 자리
 * (REST_HOLD + SWITCH_MOVE + 0.5).
 */
export const START_AT = 2.2;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const jouleHeatingMessages = Object.freeze({
  'label.title': { ko: '줄 열', en: 'Joule heating' },
  'label.operation': { ko: '저항이 만드는 열', en: 'Heat made by resistance' },
  'label.stage': { ko: '직렬 두 저항', en: 'Two resistors in series' },
  'label.view': { ko: '회로와 온도계', en: 'Circuit and thermometers' },
  /** 값이 끼는 이름표 — 단위 기호는 표식이지만 값이 끼므로 문안 키로 둔다 (C1). */
  'label.voltage': { ko: '{v} V', en: '{v} V' },
  'label.resistance': { ko: '{r} Ω', en: '{r} Ω' },
  /** 기호 — 수식 표기라 번역 대상이 아니다 (C1 판정 3). */
  'label.electron': { ko: 'e⁻', en: 'e⁻' },
  'label.current': { ko: 'I', en: 'I' },
  'label.temperature': { ko: 'T', en: 'T' },
  'caption.rest': {
    ko: '크기가 같은 두 저항 {rLarge} Ω · {rSmall} Ω 을 한 줄로 이었다 — 지금은 둘 다 같은 온도다',
    en: 'Two equal-sized resistors, {rLarge} Ω and {rSmall} Ω, are joined in one line — both are at the same temperature',
  },
  'caption.close': { ko: '스위치를 닫는다', en: 'The switch closes' },
  'caption.flow': {
    ko: '같은 전류가 두 저항을 차례로 지난다',
    en: 'The same current passes through both resistors in turn',
  },
  'caption.heat': {
    ko: '{rLarge} Ω 쪽이 더 빨리 뜨거워진다 — 원자가 더 세게 떨고 온도계가 더 높이 오른다',
    en: 'The {rLarge} Ω side heats up faster — its atoms shake harder and its thermometer climbs higher',
  },
  'caption.open': { ko: '스위치를 연다', en: 'The switch opens' },
  'caption.cool': {
    ko: '전류가 멎자 두 저항이 식는다',
    en: 'With the current stopped, both resistors cool down',
  },
} satisfies Record<string, LocalizedText>);

export type JouleHeatingMessageKey = keyof typeof jouleHeatingMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: JouleHeatingMessageKey): LocalizedText => jouleHeatingMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: JouleHeatingMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const jouleHeatingSchema: BundleSchema = {
  id: JOULE_HEATING_ID,
  label: text('label.title'),
  category: 'em',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 흐르고, 큰 저항 쪽이 먼저 달아오른다.
  parameters: [],

  stages: [
    {
      id: 'series-pair',
      label: text('label.stage'),
      constants: {
        voltage: VOLTAGE,
        resistanceLarge: RESISTANCE_LARGE,
        resistanceSmall: RESISTANCE_SMALL,
        heatCapacity: HEAT_CAPACITY,
        flowSpeedPerAmp: FLOW_SPEED_PER_AMP,
        carrierSpacing: CARRIER_SPACING,
        trailSeconds: TRAIL_SECONDS,
        columnWorldPerKelvin: COLUMN_WORLD_PER_KELVIN,
        jitterRest: JITTER_REST,
        jitterPerKelvin: JITTER_PER_KELVIN,
        jitterFreqMin: JITTER_FREQ_MIN,
        jitterFreqMax: JITTER_FREQ_MAX,
        seed: SEED,
      },
    },
  ],

  environments: [],

  views: [{ id: 'main', label: text('label.view'), default: true }],

  /** 회로 하나와 캡션 한 줄. 세로를 더 주면 가로가 먼저 차서 그림만 작아진다 (S-piece). */
  canvas: { height: 360, minHeight: 320 },

  /**
   * 겹침이 판정 장치다. 덩어리는 도선을 덮고, 원자와 전자 알갱이는 그 덩어리 **위**에,
   * 온도계 관 테두리는 차오른 막대 **위**에 있어야 읽힌다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 쉼 → 스위치 닫힘 → 흐름 → 달아오름 → 스위치 열림 → 식음.
   *
   * 전류는 `close` 가 끝난 순간부터 `open` 이 시작하는 순간까지 흐르고, 그동안 두 덩어리의
   * 온도가 곧게 오른다. `cool` 동안 둘이 실온으로 돌아가 다음 주기의 쉼으로 이어진다.
   */
  timeline: {
    phases: [
      { id: 'rest', duration: REST_HOLD, caption: key('caption.rest') },
      { id: 'close', duration: SWITCH_MOVE, ease: 'smooth', caption: key('caption.close') },
      { id: 'flow', duration: FLOW_HOLD, caption: key('caption.flow') },
      { id: 'heat', duration: HEAT_HOLD, caption: key('caption.heat') },
      { id: 'open', duration: SWITCH_MOVE, ease: 'smooth', caption: key('caption.open') },
      { id: 'cool', duration: COOL, ease: 'smooth', caption: key('caption.cool') },
    ],
  },

  startAt: START_AT,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 정의와 공식은 문단의 몫이다.
  // 끼우는 값은 스테이지 상수를 state 가 글자로 옮긴 것이다(장부 G133).
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    style: { colorRole: 'muted', emphasis: 'strong' },
    vars: { rLarge: 'resistanceLarge', rSmall: 'resistanceSmall' },
  },

  /** 그리드 · 카메라 단추 없음(기본값). 잴 거리가 없다. */

  messages: jouleHeatingMessages,
};
