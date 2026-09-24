// ========================================================================
// potential-vs-field — 선언
// ========================================================================
// 질문: 전위 그래프와 전기장은 어떤 관계인가.
//
// 한 축 위에 전하 띠 셋(+ · − · +)이 놓여 있다. 위 판은 그 축을 따라 잰 전위
// V(x) 곡선이고, 아래 줄은 **같은 x 자리**의 전기장 화살표다. 탐침이 왼쪽에서
// 오른쪽으로 훑으며 곡선에 접선을 대고, 그 자리의 화살표를 읽어 남긴다 —
// 곡선이 가파른 곳에서 화살표가 길고, 평평한 곳에서 0 이고, 화살표는 언제나
// 전위가 내려가는 쪽을 가리킨다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:potential-vs-field` 와 문자 그대로 일치한다 (C4). */
export const POTENTIAL_VS_FIELD_ID = 'potential-vs-field';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------
//
// 전하 띠 셋. 축에 수직인 넓은 판 모양 전하라 장이 x 성분뿐이다(ε₀ = 1 단위).
// 전하 합이 0 이라 띠 바깥은 장이 0 이다 — 전위 곡선이 양 끝에서 평평해진다.
// 왼쪽 띠가 좁고 촘촘해 내리막이 가파르고, 오른쪽 띠가 넓고 성겨 오르막이 완만하다.

/** 왼쪽 + 띠: 시작 · 끝(월드 x) · 전하 밀도. 전하량 = 2 × 1.5 = 3. */
export const SLAB1_FROM = -3;
export const SLAB1_TO = -1.5;
export const SLAB1_RHO = 2;
/** 가운데 − 띠. 전하량 = −2.5 × 2 = −5. */
export const SLAB2_FROM = -1.5;
export const SLAB2_TO = 0.5;
export const SLAB2_RHO = -2.5;
/** 오른쪽 + 띠. 전하량 = 0.5 × 4 = 2. 셋의 합이 0 이다. */
export const SLAB3_FROM = 0.5;
export const SLAB3_TO = 4.5;
export const SLAB3_RHO = 0.5;

// ------------------------------------------------------------------------
// 표시 배율 — 이것도 선언이다 (원칙 2). 스테이지 상수의 기본값.
// ------------------------------------------------------------------------

/**
 * 장 세기 → 화살표 길이(월드 per 장 단위). 가장 센 곳(3)이 0.84 로 간격과 비슷하지만,
 * 이웃한 두 표본 화살표의 반 길이 합은 간격보다 짧아 한 줄에서 겹치지 않는다.
 */
export const ARROW_SCALE = 0.28;
/** 화살표 줄의 간격(월드). 화살표가 한 줄에 늘어서므로 가장 긴 화살표보다 넓어야 한다. */
export const ARROW_SPACING = 0.8;
/** 이 길이(월드)보다 짧은 화살표는 「0」 점으로 대신한다 — 머리만 남은 화살표는 방향을 거짓말한다. */
export const ZERO_ARROW_LEN = 0.04;
/**
 * 읽어 남기는 표본 화살표의 최소 길이(월드). 이보다 짧으면 화살촉이 길이의 0.35 로
 * 눌려(장부 G02) 머리 없는 막대 — 곧 `−` 부호처럼 — 찍힌다. 그런 표본은 **빼고**
 * 「0」 점으로도 바꾸지 않는다(0 이 아니므로). 탐침 화살표에는 걸지 않는다.
 */
export const MIN_ARROW_LEN = 0.2;
/** 전하 한 단위에 찍는 부호 수. 띠 안 부호가 촘촘할수록 전하 밀도가 크다. */
export const GLYPHS_PER_CHARGE = 2;
/** 곡선에 대는 접선 토막의 길이(월드). 길이는 같고 기울기만 바뀐다 — 가파름을 각도로 읽는다. */
export const TANGENT_LEN = 1.3;

// ------------------------------------------------------------------------
// 배치 — 월드 좌표. 위 판(전위) · 가운데 줄(장) · 아래 띠(전하)
// ------------------------------------------------------------------------

/** 곡선 · 장 줄이 덮는 x 범위. 띠 양 끝 밖으로 평평한 구간을 남긴다. */
export const AXIS_FROM = -4.6;
export const AXIS_TO = 5.9;
/** 첫 화살표 자리. 여기서부터 `arrowSpacing` 간격으로 `AXIS_TO` 까지 놓는다. */
export const SAMPLE_FROM = -4.3;

/** 전위 곡선이 담기는 세로 범위 — 가장 낮은 전위가 아래 끝, 가장 높은 전위가 위 끝. */
export const GRAPH_BOTTOM = 1.4;
export const GRAPH_TOP = 3.55;
/** 전위 축(세로선)의 x 와 위 · 아래 끝, 기호 `V` 가 놓이는 높이. */
export const V_AXIS_X = -4.9;
export const V_AXIS_BOTTOM = 1.25;
export const V_AXIS_TOP = 3.8;
export const V_LABEL_Y = 3.95;

/** 전기장 화살표 줄의 높이. 기호 `E` 는 줄 왼쪽 끝에. */
export const ARROW_Y = 0.78;
/** 축 기호 `x` 가 놓이는 자리(장 줄 오른쪽 끝). */
export const X_LABEL_X = 6.1;

/** 전하 띠의 아래 · 위 끝과 부호가 놓이는 높이. */
export const STRIP_BOTTOM = -0.12;
export const STRIP_TOP = 0.3;
export const GLYPH_Y = 0.09;
/** 부호 획의 반 길이(월드). */
export const GLYPH_HALF = 0.07;

/** 탐침 세로선의 위 · 아래 끝. 곡선 판부터 전하 띠까지 세 판을 꿴다. */
export const PROBE_TOP = 3.7;
export const PROBE_BOTTOM = STRIP_BOTTOM;

/**
 * 프레이밍은 주장의 일부다. 가로는 축 기호부터 `x` 기호까지, 세로는 `V` 기호 위와
 * 캡션 한두 줄이 놓일 띠까지. 매 프레임 같은 값이다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: -5.25, maxX: 6.3, minY: -0.95, maxY: 4.15 } as const;

// ------------------------------------------------------------------------
// 시간표 — 탐침이 지나는 구간마다 한 단계
// ------------------------------------------------------------------------

/** 왼쪽 평평한 구간을 지나는 동안(초). */
export const ENTER = 1.2;
/** 가파른 내리막을 지나 골짜기 바닥까지. */
export const DESCEND = 3.2;
/** 골짜기 바닥에 머무는 동안 — 기울기 0, 장 0 을 읽는 자리. */
export const BOTTOM = 1.8;
/** 완만한 오르막을 지나 띠 끝까지. */
export const ASCEND = 3.6;
/** 오른쪽 평평한 구간. */
export const EXIT = 1.0;
/** 다 읽은 줄을 보는 동안 · 흐려지며 다음 주기로 넘어가는 동안. */
export const HOLD = 3.2;
export const FADE = 0.6;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const potentialVsFieldMessages = Object.freeze({
  'label.title': { ko: '전위와 전기장', en: 'Potential and electric field' },
  'label.stage': { ko: '전하 띠 셋', en: 'Three charged slabs' },
  'label.view': { ko: '곡선과 화살표', en: 'Curve and arrows' },
  /** 축 기호. 수식 표기라 번역 대상이 아니다 (C1 판정 3). */
  'label.v': { ko: 'V', en: 'V' },
  'label.e': { ko: 'E', en: 'E' },
  'label.x': { ko: 'x', en: 'x' },
  'caption.flat': {
    ko: '전위 곡선이 평평한 곳 — 전기장이 없다',
    en: 'Where the potential curve is flat, there is no field',
  },
  'caption.steep': {
    ko: '내리막에서 접선이 기울자 탐침 화살표가 길어지며 곡선이 내려가는 쪽을 가리킨다',
    en: 'On the slope the tangent tilts and the probe arrow grows, pointing the way the curve goes down',
  },
  'caption.bottom': {
    ko: '골짜기 바닥은 평평하다 — 여기서 전기장은 0 이다',
    en: 'The bottom of the valley is flat — the field here is zero',
  },
  'caption.rise': {
    ko: '오르막에서는 화살표가 돌아선다 — 여전히 전위가 내려가는 쪽이다',
    en: 'On the way up the arrow turns around — still toward falling potential',
  },
  'caption.result': {
    ko: '내리막 아래엔 긴 화살표, 바닥과 양 끝엔 0 점, 오르막 아래엔 돌아선 짧은 화살표가 남았다',
    en: 'Long arrows under the slope, zero dots at the bottom and both ends, short reversed arrows under the rise',
  },
} satisfies Record<string, LocalizedText>);

export type PotentialVsFieldMessageKey = keyof typeof potentialVsFieldMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: PotentialVsFieldMessageKey): LocalizedText => potentialVsFieldMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: PotentialVsFieldMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const potentialVsFieldSchema: BundleSchema = {
  id: POTENTIAL_VS_FIELD_ID,
  title: text('label.title'),
  category: 'em',
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 탐침이 이미 곡선을 훑고 있다.
  parameters: [],

  stages: [
    {
      id: 'three-slabs',
      label: text('label.stage'),
      constants: {
        slab1From: SLAB1_FROM,
        slab1To: SLAB1_TO,
        slab1Rho: SLAB1_RHO,
        slab2From: SLAB2_FROM,
        slab2To: SLAB2_TO,
        slab2Rho: SLAB2_RHO,
        slab3From: SLAB3_FROM,
        slab3To: SLAB3_TO,
        slab3Rho: SLAB3_RHO,
        arrowScale: ARROW_SCALE,
        arrowSpacing: ARROW_SPACING,
        zeroArrowLen: ZERO_ARROW_LEN,
        minArrowLen: MIN_ARROW_LEN,
        glyphsPerCharge: GLYPHS_PER_CHARGE,
        tangentLen: TANGENT_LEN,
      },
    },
  ],

  environments: [],

  views: [{ id: 'curve-and-arrows', label: text('label.view'), default: true }],

  /**
   * 가로 11.5 를 담아야 하고 세로는 곡선 판 · 화살표 줄 · 전하 띠 · 캡션 줄이다.
   * 세로를 더 주면 가로가 먼저 차서 그림만 작아진다 (S-piece — 세로가 비싸다).
   */
  canvas: { height: 420, minHeight: 360 },

  /**
   * 겹침이 판정 장치다. 탐침 세로선 · 접선 · 탐침 화살표가 곡선과 화살표 줄 **위**에
   * 와야 「지금 읽는 자리」 로 읽히고, 전하 띠의 옅은 칠은 부호 **아래**에 깔려야 한다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 왼쪽 평지 → 가파른 내리막 → 골짜기 바닥에 머묾 → 완만한 오르막 →
   * 오른쪽 평지 → 다 읽은 줄 → 흐려짐.
   *
   * 단계 경계가 곧 탐침이 지나는 곡선의 특징점(띠 시작 · 장이 0 인 바닥 · 띠 끝)이다.
   * 그 자리는 전하 배치에서 물리가 구하고(`waypoints`), 단계는 거기까지 가는 시간만 정한다.
   */
  timeline: {
    phases: [
      { id: 'enter', duration: ENTER, caption: key('caption.flat') },
      { id: 'descend', duration: DESCEND, caption: key('caption.steep') },
      { id: 'bottom', duration: BOTTOM, caption: key('caption.bottom') },
      { id: 'ascend', duration: ASCEND, caption: key('caption.rise') },
      { id: 'exit', duration: EXIT, caption: key('caption.flat') },
      { id: 'hold', duration: HOLD, caption: key('caption.result') },
      { id: 'fade', duration: FADE, caption: key('caption.result') },
    ],
  },

  /**
   * 도착한 순간 이미 진행 중이다 — 탐침이 가파른 내리막에 막 들어서, 지나온 평지에
   * 「0」 점이 찍혀 있고 화살표가 자라기 시작하는 자리에서 연다.
   */
  startAt: 2.0,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 정의와 공식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 720,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 이 그림이 재라고 하는 것은 거리가 아니라
   * **같은 x 자리에서 곡선의 가파름과 화살표 길이의 짝**이다. 그 짝은 탐침 세로선이
   * 잇는다 — 격자를 깔면 「몇 볼트인가」 라는 다른 질문이 끼어든다.
   */

  messages: potentialVsFieldMessages,
};
