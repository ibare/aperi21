// ========================================================================
// barometer — 선언
// ========================================================================
// 질문: 수은 기둥의 높이는 왜 기압을 재는가.
//
// 위가 막힌 유리관을 수은 접시에 거꾸로 세웠다(토리첼리). 접시의 열린 수은 면을 바깥
// 공기가 내리누르는 화살표가 있고, 관 속 수은 기둥은 그 누름과 맞먹는 높이에 선다 —
// 기둥 위는 비어 있다(진공). 기압이 낮아지면 화살표가 짧아지고 기둥이 **내려앉으며**
// 위쪽 빈 곳이 늘어난다. 기압이 돌아오면 기둥도 다시 올라선다. 관 옆 눈금자는 접시
// 수면에서 잰 세로 높이다.
//
// 이웃과 겹치지 않는다. 머리 위 공기 기둥의 무게가 압력이라는 것(오를수록 준다)은
// `atmospheric-pressure`, 액주의 **차이**로 두 압력을 견주는 U자관은 `manometer` 의 몫이다.
// 이 조각은 「수은 기둥은 바깥 공기가 미는 만큼 서고, 기압이 바뀌면 그 높이가 따라
// 움직인다」 에 머문다. 기울인 관(세로 높이는 그대로)은 두 번째 주장이라 두지 않았다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:barometer` 와 문자 그대로 일치한다 (C4). */
export const BAROMETER_ID = 'barometer';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 바닷가 기압(p₀)에서 수은 기둥의 세로 높이(cm). 눈금자에 이 값이 그대로 뜬다. */
export const COLUMN_HIGH = 76;
/**
 * 기압이 낮아졌을 때의 기둥 높이(cm). 57 — p₀ 의 ¾ 이다. 눈금자에 이 값이 그대로 뜨고,
 * 기압 화살표는 두 높이의 비(57/76)만큼 짧아진다.
 */
export const COLUMN_LOW = 57;

// ------------------------------------------------------------------------
// 배치 — 월드 1 단위 = 1 cm. 접시의 열린 수은 면이 y = 0, 위가 높은 쪽이다.
// ------------------------------------------------------------------------

/** 유리관 바깥 반폭 · 안쪽 반폭(cm). 벽 두께는 선 굵기가 맡는다. */
export const TUBE_HALF = 3;
export const TUBE_INNER_HALF = 2.4;
/** 막힌 관 윗끝(cm)과 수은 속에 잠긴 아랫끝(cm). */
export const TUBE_TOP = 92;
export const TUBE_BOTTOM = -6;

/** 접시 — 반폭 · 바닥 · 가장자리 윗끝(cm). 수은은 수면(0)까지 차 있다. */
export const DISH_HALF = 36;
export const DISH_FLOOR = -10;
export const DISH_RIM = 4;

/** 기압 화살표가 놓이는 가로 자리(cm). 관 양쪽 수은 면 위. */
export const AIR_ARROWS_X: readonly number[] = [-28, -17, 17, 28];
/** 기압이 p₀ 일 때 화살표 길이(cm). 낮아지면 기둥 높이의 비만큼 준다. */
export const AIR_ARROW_AT_P0 = 30;

/** 눈금자 — 관 오른쪽, 수면(0)에서 위로. 가로 자리 · 길이 · 눈금(cm). */
export const RULER_X = 8;
export const RULER_LENGTH = 90;
export const RULER_TICKS: readonly number[] = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90];

/**
 * 프레이밍은 주장의 일부다. 세로는 접시 바닥 아래 캡션 줄부터 관 윗끝 조금 위까지,
 * 가로는 접시 양 끝까지. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -44, maxX: 44, minY: -24, maxY: 98 } as const;

// ------------------------------------------------------------------------
// 시간표 — 길이의 기본값 (단계 경계는 scene · physics 가 timeline 에게 묻는다)
// ------------------------------------------------------------------------

/** 바닷가 기압에서 기둥이 76 에 서 있는 동안(초). */
export const HIGH = 2.6;
/** 기압이 낮아지며 기둥이 내려앉는 동안. */
export const DROP = 2.6;
/** 낮은 기압에서 기둥이 57 에 머무는 동안. 비교가 끝나는 자리라 길게. */
export const LOW = 2.8;
/** 기압이 돌아오며 기둥이 다시 올라서는 동안. */
export const RISE = 2.2;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const barometerMessages = Object.freeze({
  'label.title': { ko: '기압계', en: 'Barometer' },
  'label.stage': { ko: '바닷가와 낮은 기압', en: 'Sea level and low pressure' },
  'label.view': { ko: '옆에서 본 토리첼리 관', en: "Torricelli's tube from the side" },
  /** 기압 기호. 수식 글자라 번역 대상이 아니다 (C1 판정 3). */
  'label.pressure': { ko: 'p', en: 'p' },
  'label.pressureP0': { ko: 'p₀', en: 'p₀' },
  /** 눈금자 단위. 표식이다 (C1 판정 3). */
  'label.unit': { ko: 'cm', en: 'cm' },
  'label.vacuum': { ko: '진공', en: 'vacuum' },
  'caption.high': {
    ko: '공기가 수은 면을 누르는 만큼, 관 속 수은이 밀려 올라가 선다',
    en: 'Air presses on the open mercury, pushing the column up as far as that push can hold',
  },
  'caption.drop': {
    ko: '공기가 덜 누르면 기둥이 내려앉고, 위쪽 빈 곳이 늘어난다',
    en: 'When the air presses less, the column sinks and the empty space above it grows',
  },
  'caption.low': {
    ko: '기압이 낮은 동안 기둥은 낮은 높이에 머문다',
    en: 'While the pressure stays low, the column stays low',
  },
  'caption.rise': {
    ko: '기압이 돌아오면 기둥도 다시 올라선다',
    en: 'When the pressure returns, the column climbs back up',
  },
} satisfies Record<string, LocalizedText>);

export type BarometerMessageKey = keyof typeof barometerMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: BarometerMessageKey): LocalizedText => barometerMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: BarometerMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const barometerSchema: BundleSchema = {
  id: BAROMETER_ID,
  title: text('label.title'),
  category: 'fluids',
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 기압이 낮아졌다 돌아오고, 기둥이 따라 내려앉았다 올라선다.
  parameters: [],

  stages: [
    {
      id: 'sea-level',
      label: text('label.stage'),
      constants: { columnHigh: COLUMN_HIGH, columnLow: COLUMN_LOW },
    },
  ],

  environments: [],

  views: [{ id: 'side', label: text('label.view'), default: true }],

  /** 관이 세로로 길다. 세로를 더 주면 그림만 작아진다 (S-piece). */
  canvas: { height: 420, minHeight: 380 },

  /**
   * 겹침이 판정 장치다. 수은은 관 벽 **아래**(벽이 수은 기둥을 감싸 보이게), 화살표 ·
   * 이름표는 맨 위. 층 순서로는 `region`(수은)이 선과 화살표 위로 올라온다.
   */
  drawOrder: 'scene',

  /** 한 주기 = 바닷가 기압 → 낮아짐 → 낮은 기압 → 돌아옴. 되돌아오므로 흐려짐 단계가 없다. */
  timeline: {
    phases: [
      { id: 'high', duration: HIGH, caption: key('caption.high') },
      { id: 'drop', duration: DROP, ease: 'smooth', caption: key('caption.drop') },
      { id: 'low', duration: LOW, caption: key('caption.low') },
      { id: 'rise', duration: RISE, ease: 'smooth', caption: key('caption.rise') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — 76 에 선 기둥을 잠깐 본 뒤 곧 기압이 낮아지기 시작한다. */
  startAt: 1.2,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 정의와 공식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /** 그리드 · 카메라 단추 없음(기본값). 잴 것은 세로 높이 하나라 관 옆 눈금자만 둔다. */

  messages: barometerMessages,
};
