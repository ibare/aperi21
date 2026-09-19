// ========================================================================
// object-color — 선언
// ========================================================================
// 질문: 빨간 사과는 왜 빨갛게 보이고, 파란빛 아래에서는 왜 검게 보이는가.
//
// 어두운 방에서 등이 사과를 비춘다. 흰빛은 빨강 · 초록 · 파랑 세 줄기로 그린다.
// 사과 겉면은 빨간 줄기만 되쏘고 나머지는 먹는다 — 들어간 줄기 셋 가운데 나오는
// 것은 빨간 줄기 하나다. 비추는 빛을 빨간빛 · 파란빛으로 바꾸면 사과(와 초록 잎)의
// 보이는 색이 바뀐다. 파란빛만 비추면 사과가 되쏠 것이 없어 검게 보인다.
//
// 빛의 색은 역할색이 아니라 빛 채널로 칠한다. 줄기 색은 띠 중심 파장의 색
// (`wavelengthToLinearRgb`), 사과 · 잎 · 등의 색은 「비추는 빛 스펙트럼 × 겉면 반사
// 스펙트럼」 을 눈에 보이는 색으로 옮긴 값(`spectrumToLinearRgb`)이다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText, Vec2 } from '@aperi21/schema';

/** 등록 키 `aperi21:object-color` 와 문자 그대로 일치한다 (C4). */
export const OBJECT_COLOR_ID = 'object-color';

// ------------------------------------------------------------------------
// 물리 · 표시 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 비추는 빛의 세 띠 — 중심 파장(nm). 파랑 · 초록 · 빨강 순서. */
export const BAND_NM: readonly [number, number, number] = [455, 530, 635];
/** 띠 폭(가우스 표준편차, nm). */
export const BAND_WIDTH_NM = 22;
/**
 * 띠마다 세기. 셋을 모두 켠 빛이 흰빛에 가깝게 보이도록 맞춘 값이다 — 같은 세기로 두면
 * 눈의 감도 때문에 푸르스름하게 보인다.
 */
export const BAND_POWER: readonly [number, number, number] = [0.95, 1.25, 1.75];

/**
 * 사과 겉면의 반사 스펙트럼 — 짧은 파장은 `low` 만큼, 긴 파장은 `high` 만큼 되쏜다.
 * 둘 사이는 `edgeNm` 에서 `edgeWidthNm` 폭으로 넘어간다(로지스틱).
 */
export const APPLE_REFLECT = { low: 0.003, high: 0.7, edgeNm: 595, edgeWidthNm: 12 } as const;
/** 잎 겉면의 반사 스펙트럼 — `peakNm` 둘레(가우스 폭 `widthNm`)만 `peak` 만큼 되쏜다. */
export const LEAF_REFLECT = { low: 0.003, peak: 0.45, peakNm: 545, widthNm: 25 } as const;

/** 비추는 빛 세 가지 — 띠마다 켜진 정도(파랑, 초록, 빨강). */
export const ILLUM_WHITE: readonly [number, number, number] = [1, 1, 1];
export const ILLUM_RED: readonly [number, number, number] = [0, 0, 1];
export const ILLUM_BLUE: readonly [number, number, number] = [1, 0, 0];

/** 줄기 위 꺾쇠가 흐르는 표시 속력(월드/초)과 간격(월드). 빛의 속력이 아니라 방향 표지다. */
export const FLOW_SPEED = 0.8;
export const FLOW_SPACING = 0.6;

/** 등(전구 중심)의 자리 — 월드. */
export const LAMP_X = -3.9;
export const LAMP_Y = 1.0;

// ------------------------------------------------------------------------
// 배치 — 월드. y 위.
// ------------------------------------------------------------------------

/** 어두운 방 — 빛 없음으로 칠한다. 캡션은 방 아래 테마 바탕에 둔다. */
export const ROOM = { minX: -4.6, maxX: 3.7, minY: -1.45, maxY: 1.75 } as const;

/** 전구 반지름 · 꼭지쇠 크기 [가로, 세로]. */
export const BULB_R = 0.28;
export const BULB_BASE: Vec2 = [0.24, 0.2];

/** 사과 중심 · 줄기가 닿고 떠나는 겉면 반지름(윤곽을 원으로 본 값). */
export const APPLE_CENTER: Vec2 = [0.7, -0.62];
export const APPLE_HIT_R = 0.49;

/** 사과 윤곽 — 3차 베지어 조각들. 좌표는 사과 중심 기준 월드. */
export const APPLE_OUTLINE: readonly (readonly [Vec2, Vec2, Vec2, Vec2])[] = [
  [[0, 0.36], [0.16, 0.52], [0.54, 0.5], [0.52, 0.06]],
  [[0.52, 0.06], [0.5, -0.34], [0.24, -0.52], [0, -0.44]],
  [[0, -0.44], [-0.24, -0.52], [-0.5, -0.34], [-0.52, 0.06]],
  [[-0.52, 0.06], [-0.54, 0.5], [-0.16, 0.52], [0, 0.36]],
];
/** 꼭지 — 사과 중심 기준 사각형 네 꼭짓점. */
export const APPLE_STEM: readonly Vec2[] = [
  [-0.03, 0.34],
  [0.05, 0.34],
  [0.11, 0.58],
  [0.05, 0.58],
];
/** 잎 — 꼭지 끝 가까이(사과 중심 기준)에 붙는 자리와 윤곽(3차 베지어 둘, 잎 자리 기준). */
export const LEAF_AT: Vec2 = [0.08, 0.5];
export const LEAF_OUTLINE: readonly (readonly [Vec2, Vec2, Vec2, Vec2])[] = [
  [[0, 0], [0.12, 0.24], [0.42, 0.32], [0.62, 0.22]],
  [[0.62, 0.22], [0.44, 0.02], [0.18, -0.08], [0, 0]],
];

/** 사과가 놓인 탁자 선의 높이와 가로 범위. */
export const TABLE_Y = -1.11;
export const TABLE_HALF = 1.3;

/** 들어오는 세 줄기가 닿는 사과 겉면 자리 — 사과→등 방향에서 벌린 각(라디안). 파랑 · 초록 · 빨강 순서. */
export const INCIDENT_SPREAD: readonly [number, number, number] = [0.32, 0, -0.32];
/** 되쏘여 나가는 줄기의 방향(라디안)과 길이. 들어오는 줄기와 엇갈리지 않고 잎 위로 지나가는 쪽이다. */
export const OUT_ANGLE = 1.0;
export const OUT_LEN = 1.75;

/**
 * 프레이밍은 주장의 일부다. 방 전체 + 아래 캡션 줄. 매 프레임 같은 값이다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: -4.7, maxX: 3.8, minY: -2.05, maxY: 1.85 } as const;

// ------------------------------------------------------------------------
// 시간표
// ------------------------------------------------------------------------

/** 한 빛으로 비추는 동안 · 빛을 바꾸는 동안(초). */
export const HOLD = 3.6;
export const SWITCH = 0.8;
/** 도착한 순간 이미 흰빛이 사과를 비추고 줄기가 흐른다 — 흰빛 단계 안에서 연다. */
export const START_AT = 1;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const objectColorMessages = Object.freeze({
  'label.title': { ko: '물체의 색', en: 'The colour of an object' },
  'label.operation': {
    ko: '물체가 되쏘는 빛이 정하는 색',
    en: 'The colour set by the light an object sends back',
  },
  'label.stage': { ko: '어두운 방', en: 'Dark room' },
  'label.view': { ko: '등 · 사과', en: 'Lamp and apple' },
  'caption.white': {
    ko: '흰빛의 빨강 · 초록 · 파랑 줄기가 사과에 닿고, 되쏘여 나오는 것은 빨간 줄기뿐이다 — 사과는 빨갛게, 잎은 초록으로 보인다',
    en: 'The red, green and blue beams of white light reach the apple, and only the red beam comes back off it — the apple looks red, the leaf green',
  },
  'caption.toRed': { ko: '비추는 빛을 빨간빛으로 바꾼다', en: 'The lamp is switched to red light' },
  'caption.red': {
    ko: '빨간 줄기만 닿는다 — 사과는 그대로 빨갛고, 잎은 검게 보인다',
    en: 'Only the red beam arrives — the apple still looks red, and the leaf looks black',
  },
  'caption.toBlue': { ko: '비추는 빛을 파란빛으로 바꾼다', en: 'The lamp is switched to blue light' },
  'caption.blue': {
    ko: '파란 줄기만 닿는다 — 사과에서 되쏘여 나오는 줄기가 없고, 사과가 검게 보인다',
    en: 'Only the blue beam arrives — no beam comes back off the apple, and the apple looks black',
  },
  'caption.toWhite': { ko: '다시 흰빛으로 바꾼다', en: 'The lamp is switched back to white light' },
} satisfies Record<string, LocalizedText>);

export type ObjectColorMessageKey = keyof typeof objectColorMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: ObjectColorMessageKey): LocalizedText => objectColorMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ObjectColorMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const objectColorSchema: BundleSchema = {
  id: OBJECT_COLOR_ID,
  label: text('label.title'),
  category: 'optics',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 흰빛 · 빨간빛 · 파란빛이 차례로 사과를 비춘다.
  parameters: [],

  stages: [
    {
      id: 'dark-room',
      label: text('label.stage'),
      constants: {
        bandBlueNm: BAND_NM[0],
        bandGreenNm: BAND_NM[1],
        bandRedNm: BAND_NM[2],
        bandWidthNm: BAND_WIDTH_NM,
        powerBlue: BAND_POWER[0],
        powerGreen: BAND_POWER[1],
        powerRed: BAND_POWER[2],
        appleLow: APPLE_REFLECT.low,
        appleHigh: APPLE_REFLECT.high,
        appleEdgeNm: APPLE_REFLECT.edgeNm,
        appleEdgeWidthNm: APPLE_REFLECT.edgeWidthNm,
        leafLow: LEAF_REFLECT.low,
        leafPeak: LEAF_REFLECT.peak,
        leafPeakNm: LEAF_REFLECT.peakNm,
        leafWidthNm: LEAF_REFLECT.widthNm,
        whiteBlue: ILLUM_WHITE[0],
        whiteGreen: ILLUM_WHITE[1],
        whiteRed: ILLUM_WHITE[2],
        redBlue: ILLUM_RED[0],
        redGreen: ILLUM_RED[1],
        redRed: ILLUM_RED[2],
        blueBlue: ILLUM_BLUE[0],
        blueGreen: ILLUM_BLUE[1],
        blueRed: ILLUM_BLUE[2],
        lampX: LAMP_X,
        lampY: LAMP_Y,
        flowSpeed: FLOW_SPEED,
        flowSpacing: FLOW_SPACING,
      },
    },
  ],

  environments: [],

  views: [{ id: 'room', label: text('label.view'), default: true }],

  /** 가로로 넓고 세로로 좁다 — 등과 사과를 한 줄로 둔다 (S-piece — 세로가 비싸다). */
  canvas: { height: 360, minHeight: 320 },

  /** 겹침이 판정 장치다. 빛 없음 방을 먼저 깔고 줄기 → 사과 · 잎 → 등 순서로 얹는다. */
  drawOrder: 'scene',

  /**
   * 한 주기 = 흰빛 → 빨간빛으로 → 빨간빛 → 파란빛으로 → 파란빛 → 흰빛으로.
   * 바꾸는 동안 띠마다 켜진 정도가 `smooth` 로 옮겨 가고, 줄기 · 사과 · 잎 · 등이 함께 따른다.
   */
  timeline: {
    phases: [
      { id: 'white', duration: HOLD, caption: key('caption.white') },
      { id: 'to-red', duration: SWITCH, ease: 'smooth', caption: key('caption.toRed') },
      { id: 'red', duration: HOLD, caption: key('caption.red') },
      { id: 'to-blue', duration: SWITCH, ease: 'smooth', caption: key('caption.toBlue') },
      { id: 'blue', duration: HOLD, caption: key('caption.blue') },
      { id: 'to-white', duration: SWITCH, ease: 'smooth', caption: key('caption.toWhite') },
    ],
  },

  startAt: START_AT,

  // 슬롯 하나. 방 아래 테마 바탕 위에 둔다 — 빛 없음 방 위에서는 라이트 테마의 먹색 글자가 묻힌다.
  caption: {
    anchor: { screen: 'bottom-left', offset: [12, -8] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 660,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  // 그리드 · 카메라 단추 없음(기본값). 잴 거리가 없다.

  messages: objectColorMessages,
};
