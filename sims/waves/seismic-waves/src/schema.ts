// ========================================================================
// seismic-waves — 선언
// ========================================================================
// 질문: 지구 반대편에 지진파가 닿지 않는 넓은 띠가 왜 생기나?
//
// 동사: **닿지 못한다.** 진원(맨 위)에서 P파와 S파가 함께 지구 속으로 퍼진다. 오른쪽 반은
// P파, 왼쪽 반은 S파의 파선이다. S파는 액체 외핵을 지나지 못해 거기서 멈추고, 그래서
// 진원에서 103° 너머의 지표에는 하나도 닿지 않는다. P파는 핵을 지나며 꺾여 142° 너머에
// 닿고, 103° ~ 142° 사이만 비워 둔다. 지표에 찍히는 도착 점이 그 빈 띠를 만든다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:seismic-waves` 와 문자 그대로 일치한다 (C4). */
export const SEISMIC_WAVES_ID = 'seismic-waves';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 핵 반지름 / 지구 반지름. 3480 km / 6371 km. */
export const CORE_RATIO = 0.546;
/** S파 그림자대가 시작하는 각(진원에서 잰 중심각, 도). P파 그림자대도 여기서 시작한다. */
export const SHADOW_FROM_DEG = 103;
/** P파 그림자대가 끝나는 각(도). 이 너머에는 핵을 지나 꺾인 P파가 닿는다. */
export const P_SHADOW_TO_DEG = 142;
/** 맨틀 속 대표 속력(km/s). P파가 S파보다 빠르다. */
export const V_P = 11;
export const V_S = 6;
/** 지구 반지름(km). 월드에서는 1 이다 — 속력을 월드 단위로 바꾸는 데만 쓴다. */
export const EARTH_RADIUS_KM = 6371;
/** 퍼지는 두 단계(`mantle` + `core`)가 보여 주는 실제 시간(분). 가장 늦은 S파가 닿을 만큼. */
export const TRAVEL_MINUTES = 30;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이(화면 초). 경계는 물리에서 끌어온다
// ------------------------------------------------------------------------

/** 퍼지는 동안의 화면 시간(초) — `mantle` 과 `core` 의 합. */
export const TRAVEL_SECONDS = 9;
/**
 * `mantle` 의 길이 — 곧장 아래로 간 S파가 외핵에 닿는 순간 끝난다. 그때부터 캡션이
 * 「S파가 멈춘다」 로 바뀐다. 기본 상수에서 끌어온 값이다 (장부 G13 — 저작자가 속력을
 * 바꾸면 단계 경계가 따라가지 않는다).
 */
export const MANTLE_SECONDS =
  (TRAVEL_SECONDS * ((1 - CORE_RATIO) * EARTH_RADIUS_KM)) / V_S / (TRAVEL_MINUTES * 60);
export const CORE_SECONDS = TRAVEL_SECONDS - MANTLE_SECONDS;
/** 그림자대 호가 떠오르는 동안 · 멈춘 그림을 읽는 동안 · 흐려지는 동안. */
export const REVEAL_SECONDS = 1.2;
export const HOLD_SECONDS = 4.5;
export const FADE_SECONDS = 0.8;

// ------------------------------------------------------------------------
// 배치 — 월드. 지구 반지름이 1 이고 원점이 지구 중심, 진원은 (0, 1).
// ------------------------------------------------------------------------

/**
 * 프레이밍은 주장의 일부다. 가로는 양쪽 반의 이름표와 그림자대 이름표까지, 세로는 진원
 * 이름표 위와 캡션 줄 아래까지. 매 프레임 같은 값이다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: -1.7, maxX: 1.7, minY: -1.3, maxY: 1.16 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const seismicWavesMessages = Object.freeze({
  'label.title': { ko: '지진파', en: 'Seismic waves' },
  'label.operation': { ko: '지구 속을 지나는 P파와 S파', en: 'P and S waves travelling through the Earth' },
  'label.stage': { ko: '지구 단면', en: 'Earth cross-section' },
  'label.view': { ko: '진원을 지나는 단면', en: 'Section through the focus' },
  'label.focus': { ko: '진원', en: 'focus' },
  'label.pHalf': { ko: 'P파 — 앞뒤로 흔든다', en: 'P wave — push and pull' },
  'label.sHalf': { ko: 'S파 — 옆으로 흔든다', en: 'S wave — side to side' },
  'label.core': { ko: '액체 외핵', en: 'liquid outer core' },
  /** 지표의 각 눈금. 값은 스테이지 상수를 그대로 끼운다 (S-piece 유효숫자). */
  'label.deg': { ko: '{deg}°', en: '{deg}°' },
  'label.shadowS': { ko: 'S파 그림자대', en: 'S-wave shadow zone' },
  'label.shadowP': { ko: 'P파 그림자대', en: 'P-wave shadow zone' },
  'caption.mantle': {
    ko: '진원에서 P파와 S파가 함께 퍼진다 — P파가 앞서 나아간다',
    en: 'P and S waves spread out from the focus together — the P wave pulls ahead',
  },
  'caption.core': {
    ko: 'S파는 액체 외핵을 지나지 못해 멈추고, P파는 핵을 지나며 꺾인다',
    en: 'The S wave cannot cross the liquid outer core and stops; the P wave passes through and bends',
  },
  'caption.shadow': {
    ko: 'S파가 하나도 닿지 못한 넓은 띠, P파가 비워 둔 좁은 띠 — 그림자대다',
    en: 'A wide band no S wave reaches, a narrower band the P wave skips — the shadow zones',
  },
} satisfies Record<string, LocalizedText>);

export type SeismicWavesMessageKey = keyof typeof seismicWavesMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: SeismicWavesMessageKey): LocalizedText => seismicWavesMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: SeismicWavesMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const seismicWavesSchema: BundleSchema = {
  id: SEISMIC_WAVES_ID,
  label: text('label.title'),
  category: 'waves',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 이미 퍼지고 있고, 멈추고, 그림자대가 드러난다.
  parameters: [],

  stages: [
    {
      id: 'earth',
      label: text('label.stage'),
      constants: {
        coreRatio: CORE_RATIO,
        shadowFromDeg: SHADOW_FROM_DEG,
        pShadowToDeg: P_SHADOW_TO_DEG,
        vP: V_P,
        vS: V_S,
        earthRadiusKm: EARTH_RADIUS_KM,
        travelMinutes: TRAVEL_MINUTES,
      },
    },
  ],

  environments: [],

  views: [{ id: 'section', label: text('label.view'), default: true }],

  /** 원판은 정사각형이라 세로가 곧 크기다. 이름표 · 캡션 줄만큼만 더 준다. */
  canvas: { height: 500, minHeight: 420 },

  /** 겹침 순서가 판정 장치다 — 맨틀 · 핵 면 아래, 파선 · 도착 점 위, 그림자대 호가 맨 위. */
  drawOrder: 'scene',

  /**
   * 한 주기 = 맨틀을 퍼짐 → S파가 핵에 막히고 P파가 핵을 지남 → 그림자대가 떠오름 → 읽음 → 흐려짐.
   * `mantle` 과 `core` 는 한 흐름이다 — scene 은 둘을 이은 구간의 진행도를 실제 시간으로 바꾼다.
   */
  timeline: {
    phases: [
      { id: 'mantle', duration: MANTLE_SECONDS, caption: key('caption.mantle') },
      { id: 'core', duration: CORE_SECONDS, caption: key('caption.core') },
      { id: 'reveal', duration: REVEAL_SECONDS, ease: 'smooth', caption: key('caption.shadow') },
      { id: 'hold', duration: HOLD_SECONDS, caption: key('caption.shadow') },
      { id: 'fade', duration: FADE_SECONDS, ease: 'smooth', caption: key('caption.shadow') },
    ],
  },

  /** 도착한 순간 이미 두 파가 맨틀 속을 퍼지고 있다. 0 이면 진원 한 점뿐인 화면이 먼저 보인다. */
  startAt: 1.2,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -6] },
    fontSize: 14,
    wrapWidth: 760,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  // 그리드 · 카메라 단추 없음(기본값). 잴 것은 거리가 아니라 지표의 각이다 — 각은 눈금으로 직접 단다.

  messages: seismicWavesMessages,
};
