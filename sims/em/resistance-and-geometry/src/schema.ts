// ========================================================================
// resistance-and-geometry — 선언
// ========================================================================
// 질문: 같은 재료 도선이 길어지거나 가늘어지면 왜 전류가 덜 흐르는가.
//
// 한 전지의 두 레일 사이에 같은 재료 도선 셋이 나란히 걸린다 — 기준 도선, 길이만
// 늘인 도선, 단면적만 넓힌 도선. 세 도선 모두 같은 전압을 받는다. 도선 속 전자 알갱이는
// 셋 모두 같은 촘촘함(같은 재료)으로 흐르되, 긴 도선에서는 느리게 흐르고, 굵은 도선에서는
// 기준과 같은 빠르기로 레인이 늘어 더 많이 흐른다. 같은 시간 동안 도선 끝을 지난 알갱이를
// 오른쪽에 쌓으면 그 무더기의 폭이 전류의 비를 보인다.
//
// 길이를 늘인 도선은 기준 도선 둘을 이어 붙인 것(직렬), 굵힌 도선은 기준 도선 둘을
// 나란히 붙인 것(병렬)과 같다 — 옅은 점선이 그 이음매를 보인다.
//
// 전압에 따라 전류가 비례하는 것은 ohms-law 의 몫, 온도에 따라 저항이 바뀌는 것은
// temperature-and-resistance 의 몫이라 여기서는 전압 · 재료 · 온도를 고정한다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:resistance-and-geometry` 와 문자 그대로 일치한다 (C4). */
export const RESISTANCE_AND_GEOMETRY_ID = 'resistance-and-geometry';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 세 도선에 함께 걸린 전압(V). 전지 이름표에 그대로 쓴다. */
export const VOLTAGE = 6;
/** 재료의 비저항(상대값). 세 도선이 같은 재료라 비에서 지워지지만 R = ρL/A 계산에 선언값으로 들어간다. */
export const RESISTIVITY = 1;
/** 기준 도선의 길이(월드) · 단면적을 나타내는 두께(월드). 2D 그림이라 단면적을 막대 두께로 보인다. */
export const BASE_LENGTH = 2.4;
export const BASE_AREA = 0.36;
/** 길이를 늘인 배수 · 단면적을 넓힌 배수. 이름표 `{lf}L` · `{af}A` 와 캡션에 그대로 쓴다. */
export const LENGTH_FACTOR = 2;
export const AREA_FACTOR = 2;

// ------------------------------------------------------------------------
// 표시 배율 — 이것도 선언이다 (원칙 2). 스테이지 상수로 둔다.
// ------------------------------------------------------------------------

/**
 * 알갱이 간격(월드) — 레인 안 앞뒤 간격. 세 도선이 같다(같은 재료 = 같은 촘촘함).
 * 도선 길이가 이 간격으로 나눠 떨어져야 알갱이가 도선 끝에서 처음으로 돌아갈 때 간격이 벌어지지 않는다.
 */
export const CARRIER_SPACING = 0.3;
/** 기준 도선의 레인 수. 레인 간격 = 기준 두께 / 이 수라 굵은 도선은 레인이 단면적 배수만큼 는다. */
export const BASE_LANES = 2;
/**
 * 세는 동안(`count` 단계) 기준 도선의 레인 하나가 끝으로 내보내는 알갱이 수.
 * 기준 속력 = 이 수 × 간격 / 세는 단계 길이 — 세기가 끝나면 무더기가 정확히 정수 개다.
 * 길이 배수로 나눠 떨어지게 잡는다(긴 도선의 무더기도 정수).
 */
export const COUNT_PER_LANE = 6;
/**
 * 알갱이 꼬리 = 속력 × 이 시간(초). 정지 화면에서도 빠르기가 꼬리 길이로 읽힌다.
 * 가장 빠른(기준 · 굵은) 꼬리가 알갱이 간격을 넘지 않게 잡는다 — 넘으면 꼬리가 이어져 한 줄이 된다.
 */
export const TRAIL_SECONDS = 0.5;
/** 무더기 — 세로 줄 수, 점 사이 가로 · 세로 간격(월드). 줄 수가 같아 개수의 비가 폭의 비가 된다. */
export const PILE_ROWS = 2;
export const PILE_PITCH_X = 0.26;
export const PILE_PITCH_Y = 0.2;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 위에 전지, 왼쪽 · 오른쪽에 레일, 그 사이에 도선 셋, 오른쪽에 무더기.
// ------------------------------------------------------------------------

/** 왼쪽 · 오른쪽 레일 x. 오른쪽 레일이 전지 + 극에 닿는다. */
export const RAIL_LEFT_X = -4.6;
export const RAIL_RIGHT_X = 1.0;
/** 세 도선의 출구(오른쪽 끝) x — 셋이 같은 세로줄에서 끝나 「끝을 지난다」 가 한 줄로 읽힌다. */
export const WIRE_EXIT_X = 0.6;
/** 도선 가운데 높이 — 기준 · 긴 · 굵은. */
export const ROW_BASE_Y = 1.2;
export const ROW_LONG_Y = 0.1;
export const ROW_THICK_Y = -1.1;
/** 전지가 놓인 위 도선 높이 · 전지 가운데 x. */
export const TOP_WIRE_Y = 2.0;
export const BATTERY_X = -1.8;
/** 전지 판 — 두 판 사이, 긴 판(+) · 짧은 판(−)의 반높이(월드). */
export const CELL_GAP = 0.16;
export const CELL_LONG_HALF = 0.24;
export const CELL_SHORT_HALF = 0.13;
/** 무더기 첫 점 x. 오른쪽 레일 너머. */
export const PILE_START_X = 1.45;
/** 방향 표식 — 기준 도선 왼쪽 이음 도선 위 · 아래, 꼬리 x · 길이. */
export const DIRECTION_FROM_X = -4.15;
export const DIRECTION_LEN = 0.8;
export const DIRECTION_ELECTRON_Y = 1.5;
export const DIRECTION_CURRENT_Y = 0.9;

/**
 * 프레이밍은 주장의 일부다. 가로는 왼쪽 레일 밖 여백부터 가장 큰 무더기 끝까지, 세로는
 * 캡션 줄부터 전지 이름표 위까지. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -5.2, maxX: 4.8, minY: -2.15, maxY: 2.55 } as const;

// ------------------------------------------------------------------------
// 시간표 — 조각 시계(초)
// ------------------------------------------------------------------------

/** 세 도선의 흐름을 견주는 동안. */
export const FLOW_HOLD = 2.6;
/** 도선 끝을 지나는 알갱이를 세는 동안. 기준 속력이 이 길이에서 나온다. */
export const COUNT_SPAN = 4.0;
/** 쌓인 무더기를 견주는 동안 · 무더기가 흐려지는 동안. */
export const COMPARE_HOLD = 3.4;
export const FADE = 0.6;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const resistanceAndGeometryMessages = Object.freeze({
  'label.title': { ko: '저항과 형태', en: 'Resistance and shape' },
  'label.stage': { ko: '같은 재료 도선 셋', en: 'Three wires of one material' },
  'label.view': { ko: '나란히 건 도선', en: 'Wires side by side' },
  /** 값이 끼는 이름표 — 단위 기호는 표식이지만 값이 끼므로 문안 키로 둔다 (C1). */
  'label.voltage': { ko: '{v} V', en: '{v} V' },
  /** 도선 형태 표식 — 길이 L · 단면적 A 는 기호라 번역 대상이 아니다 (C1 판정 3). 배수만 끼운다. */
  'label.wireBase': { ko: 'L · A', en: 'L · A' },
  'label.wireLong': { ko: '{lf}L · A', en: '{lf}L · A' },
  'label.wireThick': { ko: 'L · {af}A', en: 'L · {af}A' },
  'label.electron': { ko: 'e⁻', en: 'e⁻' },
  'label.current': { ko: 'I', en: 'I' },
  'caption.flow': {
    ko: '같은 재료 도선 셋에 같은 {v} V — 긴 도선의 알갱이는 느리고, 굵은 도선은 같은 빠르기로 더 넓게 흐른다',
    en: 'Three wires of one material, the same {v} V — carriers crawl in the long wire, while the thick one flows as fast as the first but wider',
  },
  'caption.count': {
    ko: '같은 시간 동안 도선 끝을 빠져나간 알갱이를 오른쪽에 모은다',
    en: 'For the same stretch of time, every carrier leaving the end of a wire is collected on the right',
  },
  'caption.compare': {
    ko: '길이 {lf}배 도선은 1/{lf} 만, 단면적 {af}배 도선은 {af}배가 빠져나갔다 — 길고 가늘수록 흐르기 어렵다',
    en: '{lf}× the length let through 1/{lf} as many; {af}× the cross-section let through {af}× — longer and thinner is harder to flow through',
  },
} satisfies Record<string, LocalizedText>);

export type ResistanceAndGeometryMessageKey = keyof typeof resistanceAndGeometryMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: ResistanceAndGeometryMessageKey): LocalizedText => resistanceAndGeometryMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ResistanceAndGeometryMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const resistanceAndGeometrySchema: BundleSchema = {
  id: RESISTANCE_AND_GEOMETRY_ID,
  title: text('label.title'),
  category: 'em',
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 흐르고, 세고, 무더기가 비를 보인다.
  parameters: [],

  stages: [
    {
      id: 'three-wires',
      label: text('label.stage'),
      constants: {
        voltage: VOLTAGE,
        resistivity: RESISTIVITY,
        baseLength: BASE_LENGTH,
        baseArea: BASE_AREA,
        lengthFactor: LENGTH_FACTOR,
        areaFactor: AREA_FACTOR,
        carrierSpacing: CARRIER_SPACING,
        baseLanes: BASE_LANES,
        countPerLane: COUNT_PER_LANE,
        trailSeconds: TRAIL_SECONDS,
        pileRows: PILE_ROWS,
        pilePitchX: PILE_PITCH_X,
        pilePitchY: PILE_PITCH_Y,
      },
    },
  ],

  environments: [],

  views: [{ id: 'main', label: text('label.view'), default: true }],

  /** 도선 셋과 무더기, 캡션 한 줄 반. 세로를 더 주면 가로가 먼저 차서 그림만 작아진다 (S-piece). */
  canvas: { height: 360, minHeight: 320 },

  /** 겹침이 판정 장치다 — 알갱이는 도선 막대 **위**를 흘러야 한다. */
  drawOrder: 'scene',

  /**
   * 한 주기 = 흐름 견주기 → 세기 → 무더기 견주기 → 흐려짐.
   *
   * 알갱이는 모든 단계에서 같은 빠르기로 흐른다(전압 · 형태가 바뀌지 않는다). 무더기만
   * 세는 단계에서 자라고, 견주는 단계에서 머물고, 흐려짐에서 비워진다.
   */
  timeline: {
    phases: [
      { id: 'flow', duration: FLOW_HOLD, caption: key('caption.flow') },
      { id: 'count', duration: COUNT_SPAN, caption: key('caption.count') },
      { id: 'compare', duration: COMPARE_HOLD, caption: key('caption.compare') },
      { id: 'fade', duration: FADE, caption: key('caption.compare') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — 알갱이는 모든 시각에 도선을 채우고 흐른다. */
  startAt: 0.4,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 정의와 공식은 문단의 몫이다.
  // 끼우는 값은 스테이지 상수를 state 가 글자로 옮긴 것이다(장부 G133).
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 720,
    style: { colorRole: 'muted', emphasis: 'strong' },
    vars: { v: 'voltage', lf: 'lengthFactor', af: 'areaFactor' },
  },

  /** 그리드 · 카메라 단추 없음(기본값). 잴 것은 거리가 아니라 무더기의 폭이다. */

  messages: resistanceAndGeometryMessages,
};
