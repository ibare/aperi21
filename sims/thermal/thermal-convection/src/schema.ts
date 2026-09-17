// ========================================================================
// thermal-convection — 선언
// ========================================================================
// 질문: 바닥만 데웠는데 어떻게 열이 금세 위까지 가나? 전도로 번지는 것과 무엇이 다른가?
//
// 동사: **실려 올라간다.** 데워진 유체가 제 몸에 열을 지닌 채 움직인다. 온도장은 실제로
// 이류-확산을 적분한 결과이고, 따라가는 유체 덩어리 하나가 제 온도 색을 지니고 돈다.
//
// 열 흐름량 숫자 · 전도 기준선 · 속도 화살표 격자 · 부력 되먹임은 두지 않는다 (원본 NOTES (c)).
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:thermal-convection` 와 문자 그대로 일치한다 (C4). */
export const THERMAL_CONVECTION_ID = 'thermal-convection';

// ------------------------------------------------------------------------
// 배치 — 원본 index.html 의 캔버스 값을 그대로 둔다
// ------------------------------------------------------------------------

/**
 * 원본 캔버스 840 × 300 px. 바닥 · 천장 띠 22 px, 그 사이 유체 256 px.
 *
 * 원본은 가로 3 · 세로 1 인 상자를 840 × 256 px 에 **늘려** 그렸다(가로 280 px/단위, 세로 256 px/단위).
 * 엔진 카메라는 가로세로 배율이 같으므로, 월드 단위를 「원본 세로 256 px」 로 두고 가로 좌표에
 * `X_STRETCH` 를 곱해 원본과 같은 모양으로 놓는다. 물리 계산은 원본 좌표(가로 3 · 세로 1) 그대로다.
 */
export const VIEW = {
  widthPx: 840,
  fluidPx: 256,
  wallPx: 22,
  /** 캡션 · 조작기 줄 (원본 캡션 줄 + 조작기 줄). */
  rowPx: 64,
} as const;

/** 월드 1 단위 = 원본 세로 px. */
export const PX = VIEW.fluidPx;
/** 원본 가로 좌표 → 월드 가로 좌표 배율 (280 / 256). */
export const X_STRETCH = VIEW.widthPx / 3 / PX;
/** 유체 상자의 월드 가로 폭. */
export const BOX_W = VIEW.widthPx / PX;
/** 바닥 · 천장 띠 두께(월드). */
export const WALL = VIEW.wallPx / PX;

/** 이름표. 원본 13 px, 왼쪽에서 10 px. */
export const WALL_LABEL = { fontPx: 13, insetPx: 10 } as const;

/** 흐름 표시 입자. 원본 선 1.3 px · 알파 0.42 · 꼬리 = 속도 × 0.09, 꼬리 없을 때 2 px 점. */
export const TRACER_STYLE = { width: 1.3, opacity: 0.42, seconds: 0.09, dotRadiusPx: 1 } as const;

/** 따라가는 덩어리. 원본 반지름 14 px · 고리 2.5 px · 자취 굵기 1 + 1.5a · 알파 0.05 + 0.55a. */
export const PARCEL_STYLE = {
  radiusPx: 14,
  ringWidth: 2.5,
  ringSegments: 40,
  trailWidthMin: 1,
  trailWidthGain: 1.5,
  trailAlphaMin: 0.05,
  trailAlphaGain: 0.55,
  /** 자취 굵기 단계 수 — 선 묶음 하나에 굵기가 하나라 세 벌로 나눈다. */
  trailWidthBands: 3,
} as const;

/**
 * 온도 → 칠하는 값의 곡선 지수. 칠하는 값 = 온도^이 값.
 *
 * `scalarField` 와 `luminance` 는 바탕과 역할 색을 **선형광**으로 섞는다. 온도를 그대로 넘기면 중간 온도가
 * 눈에 거의 뜨거운 끝만큼 밝게 보여, 한 바퀴 돌며 식은 덩어리가 뜨거운 바닥 위에서 갈리지 않는다
 * (원본 t=4.5 의 「자주색으로 바닥 위를 지난다」). 원본 색 띠는 중간(자주)이 어둡다. 사상 곡선을 고를
 * 어휘가 없어(장부 G62) 값 쪽에서 감마 곡선 하나를 건다 — 테마 명도 숫자가 아니라 곡선 모양이다.
 */
export const TEMP_CURVE = 2.2;

/** 흐름 세기 조작기. 원본 range 0~1.5, step 0.05, 기본 1. */
export const FLOW_CONTROL = { min: 0, max: 1.5, step: 0.05, default: 1 } as const;

/** 캡션. 원본 16 px, 그림 아래 한 줄. */
export const CAPTION = { fontPx: 16, wrapPx: 560 } as const;

/** 프레이밍 — 원본 캔버스 + 아래 캡션 · 조작기 줄. 매 프레임 같은 값이다. */
export const SCENE_BOUNDS = {
  minX: 0,
  maxX: BOX_W,
  minY: -WALL - VIEW.rowPx / PX,
  maxY: 1 + WALL,
} as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const thermalConvectionMessages = Object.freeze({
  'label.title': { ko: '대류', en: 'Convection' },
  'label.operation': { ko: '유체의 이동이 나르는 열', en: 'Heat carried by moving fluid' },
  'label.stage': { ko: '데운 바닥과 식힌 천장', en: 'Heated floor, cooled ceiling' },
  'label.view': { ko: '온도장', en: 'Temperature field' },
  'label.flow': { ko: '흐름 세기', en: 'Flow strength' },
  'label.hotFloor': { ko: '뜨거운 바닥', en: 'Hot floor' },
  'label.coldCeiling': { ko: '차가운 천장', en: 'Cold ceiling' },
  'caption.carry': {
    ko: '바닥에서 데워진 유체가 솟아오르며 열을 싣고 천장까지 올라간다',
    en: 'Fluid warmed at the floor rises and carries its heat all the way up to the ceiling',
  },
  'caption.still': {
    ko: '흐름이 멎자 열은 더 실려 가지 않고, 제자리에서 느리게 번지기만 한다',
    en: 'With the flow stopped, heat is no longer carried — it only spreads slowly where it is',
  },
} satisfies Record<string, LocalizedText>);

export type ThermalConvectionMessageKey = keyof typeof thermalConvectionMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: ThermalConvectionMessageKey): LocalizedText => thermalConvectionMessages[key];

/** 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ThermalConvectionMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const thermalConvectionSchema: BundleSchema = {
  id: THERMAL_CONVECTION_ID,
  label: text('label.title'),
  category: 'thermal',
  operation: text('label.operation'),
  timeModel: 'continuous',
  parameters: [],
  stages: [{ id: 'default', label: text('label.stage'), constants: {} }],
  environments: [],
  views: [{ id: 'default', label: text('label.view'), default: true }],

  /** 원본 캔버스 300 px 에 캡션 · 조작기 줄을 더한다. */
  canvas: { height: 380, minHeight: 340 },

  /** 원본의 겹침 순서 — 온도장 · 바닥 · 천장 · 흐름 입자 · 덩어리 자취 · 덩어리. */
  drawOrder: 'scene',

  /**
   * 원본에 연출 시간표가 없다. 모든 것이 적분 상태라 시간표 · `startAt` 을 쓰지 않는다.
   *
   * 「도착한 순간 이미 진행 중」 은 원본이 층 모양 분포에서 **온도장만** 0.4 초(음의 시간)
   * 미리 적분해 만든다. 입자 · 덩어리는 그동안 움직이지 않는다. `preroll` 은 `step` 전체를
   * 굴려 입자까지 옮기므로 원본과 다른 첫 화면이 된다 — 그래서 그 미리 적분은 `initialState`
   * 가 한다 (NOTES 「원본과 달라진 점」).
   */

  /** 슬롯 하나. 원본은 그림 아래 16 px 한 줄. 실제 흐름 세기가 0.08 미만일 때만 문장이 바뀐다. */
  caption: {
    anchor: { screen: 'bottom-left' },
    align: 'left',
    fontSize: CAPTION.fontPx,
    wrapWidth: CAPTION.wrapPx,
    style: { colorRole: 'ink', emphasis: 'strong' },
    text: key('caption.carry'),
    cases: [{ when: 'stopped', text: key('caption.still') }],
  },

  // 그리드도 카메라 버튼도 없다 (기본값).

  messages: thermalConvectionMessages,
};
