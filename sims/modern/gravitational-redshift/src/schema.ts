// ========================================================================
// gravitational-redshift — 선언
// ========================================================================
// 질문: 무거운 별 표면에서 낸 빛은 멀리서 받으면 같은 빛인가?
//
// 아니다. 빛은 별의 중력 퍼텐셜 우물을 빠져나오는 동안 에너지를 잃고, 에너지를 잃은
// 빛은 진동수가 낮고 파장이 길다. 표면에서 초록으로 떠난 물결 여섯 개가 우물을 올라오며
// 간격이 벌어지고 붉어져, 먼 곳에서는 같은 여섯 물결이 더 길게 펼쳐진 빨간빛으로 받힌다.
//
// 위 칸은 공간(별 표면 → 먼 곳의 길), 아래 칸은 같은 가로축에 놓인 퍼텐셜 곡선이다.
// 물결 묶음이 있는 자리를 곡선 위 점이 따라가며 「우물을 올라온다」 를 높이로 보인다.
//
// 높이에 따라 시계가 다르게 가는 것(`gravitational-time-dilation`) · 광원이 움직여서
// 생기는 이동(`relativistic-doppler`) · 지평선(`black-hole-horizon`)은 이 조각의 몫이 아니다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:gravitational-redshift` 와 문자 그대로 일치한다 (C4). */
export const GRAVITATIONAL_REDSHIFT_ID = 'gravitational-redshift';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/**
 * 먼 곳에서 받은 파장 ÷ 표면에서 낸 파장 = 1/√(1 − r_s/R). **과장하지 않은 값이다** —
 * 반지름이 슈바르츠실트 반지름의 약 2.4 배인 중성자별(질량 약 1.7 태양, 반지름 약 12 km)의
 * 실제 규모다. 별의 촘촘함(r_s/R)은 이 값에서 나온다.
 */
export const STRETCH = 1.3;
/** 표면에서 낸 빛의 파장(nm). 화면 글자에 그대로 쓰인다. */
export const EMIT_NM = 500;
/**
 * 먼 곳에서 받는 파장(nm) — 화면 글자로 쓰는 선언값. `emitNm × stretch` 를 계산해 줄이지
 * 않는다. 두 값과 짝으로 바꾼다 (G143).
 */
export const RECEIVED_NM = 650;
/** 한 줄기 빛에 담긴 물결 수. 떠날 때와 받을 때 같다 — 늘어나는 것은 간격이다. */
export const WAVE_CYCLES = 6;
/**
 * **그림 배율** — 파장 1 nm 를 월드 몇 단위로 그리나. 빛의 파장은 별 크기에 견주면 보이지
 * 않으므로 물결 간격을 이만큼 키워 그린다(500 nm → 0.22 월드). 늘어나는 **비율**은 키우지
 * 않는다 — 배율은 두 파장에 똑같이 걸린다.
 */
export const WORLD_PER_NM = 0.00044;

// ------------------------------------------------------------------------
// 배치 — 월드. 위 · 아래 칸이 같은 가로축을 쓴다. 표면에서 먼 곳까지 길은 u = 1 − √(R/r) 로
// 눌러 그린다(physics 머리) — 길 끝이 무한히 먼 곳이다.
// ------------------------------------------------------------------------

/** 별 중심 x · 별 반지름(월드). */
export const STAR_X = -4.2;
export const STAR_R = 0.5;
/** 빛이 가는 길(위 칸)의 높이. 별 중심도 이 높이에 있다. */
export const LANE_Y = 1.5;
/** 받는 곳(먼 곳, u = 1)의 x. 물결 묶음의 앞이 여기서 멈춘다. */
export const OBSERVER_X = 5.4;
/** 물결 진폭(월드). 늘어남은 간격으로 보이고 진폭은 그대로다. */
export const WAVE_AMP = 0.2;
/** 견줌 — 떠날 때 모습의 물결을 받은 물결 위로 띄우는 높이(월드). */
export const GHOST_RISE = 0.62;

/** 퍼텐셜 곡선(아래 칸) — 먼 곳의 평평한 높이 · 별 표면에서의 깊이(월드). */
export const WELL_TOP_Y = 0.25;
export const WELL_DEPTH = 1.7;
/** 곡선 왼쪽 끝 x — 별 왼쪽으로 조금만 그려 우물 모양이 읽히게 한다. */
export const WELL_LEFT_X = -5.4;

/**
 * 프레이밍은 주장의 일부다. 가로는 우물 왼쪽 끝부터 받는 곳 이름표까지, 세로는 견줌
 * 물결의 이름표 위부터 우물 바닥 · 캡션 줄 아래까지. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -5.6, maxX: 6.2, minY: -2.45, maxY: 2.85 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const gravitationalRedshiftMessages = Object.freeze({
  'label.title': { ko: '중력 적색 이동', en: 'Gravitational redshift' },
  'label.operation': { ko: '빠져나오며 잃는 에너지', en: 'Energy lost climbing out of a gravity well' },
  'label.stage': { ko: '중성자별에서 낸 빛', en: 'Light from a neutron star' },
  'label.view': { ko: '빛의 길과 퍼텐셜 우물', en: 'Light path and potential well' },
  'label.star': { ko: '중성자별', en: 'neutron star' },
  'label.observer': { ko: '먼 곳', en: 'far away' },
  'label.potential': { ko: '중력 퍼텐셜', en: 'gravitational potential' },
  'label.ghost': { ko: '떠날 때', en: 'as emitted' },
  /** 파장. 값은 선언값을 그대로 끼운다 (S-piece 유효숫자). */
  'label.nm': { ko: '{l} nm', en: '{l} nm' },
  'caption.emit': {
    ko: '중성자별 표면에서 빛 한 줄기를 낸다',
    en: 'A burst of light leaves the surface of a neutron star',
  },
  'caption.climb': {
    ko: '우물을 올라오는 동안 빛이 에너지를 잃는다 — 물결 간격이 벌어지고 붉어진다',
    en: 'Climbing out of the well, the light loses energy — its waves spread apart and redden',
  },
  /** 물결 수는 선언값(`waveCycles`)을 끼운다 — state 경유(G133). */
  'caption.arrive': {
    ko: '먼 곳에서 받은 빛 — 같은 {n}개 물결이 더 길게 펼쳐졌다',
    en: 'Received far away — the same {n} waves are stretched longer',
  },
} satisfies Record<string, LocalizedText>);

export type GravitationalRedshiftMessageKey = keyof typeof gravitationalRedshiftMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: GravitationalRedshiftMessageKey): LocalizedText => gravitationalRedshiftMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: GravitationalRedshiftMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const gravitationalRedshiftSchema: BundleSchema = {
  id: GRAVITATIONAL_REDSHIFT_ID,
  label: text('label.title'),
  category: 'modern',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 빛이 우물을 올라오며 늘어나고, 먼 곳에서 떠날 때 모습과 견준다.
  // 별의 촘촘함 슬라이더는 두지 않았다: 끌면 받는 파장이 바뀌는데 화면 글자는 선언값이라
  // 따라가지 못하고(G143), 가시광 밖(적외선)으로 넘어가면 색을 지어낼 수 없다.
  parameters: [],

  stages: [
    {
      id: 'neutron-star',
      label: text('label.stage'),
      constants: {
        stretch: STRETCH,
        emitNm: EMIT_NM,
        receivedNm: RECEIVED_NM,
        waveCycles: WAVE_CYCLES,
        worldPerNm: WORLD_PER_NM,
      },
    },
  ],

  environments: [],

  views: [{ id: 'main', label: text('label.view'), default: true }],

  /** 위 칸(빛의 길)과 아래 칸(우물)이 세로를 나눠 쓴다. */
  canvas: { height: 380, minHeight: 340 },

  /** 안내 점선이 물결 아래로, 곡선 위 점이 곡선 위로 가야 한다. */
  drawOrder: 'scene',

  /**
   * 한 주기 = 냄 → 올라옴 → 받음 → 견줌 → 사라짐.
   *
   * - 묶음의 앞은 `emit` 시작부터 `climb` 끝까지 표면에서 먼 곳까지 고르게 간다
   *   (`span(start('emit'), end('climb'))`). `emit` 동안 물결 여섯 개가 표면을 다 떠난다.
   * - `arrive` 동안 떠날 때 모습(견줌 물결)이 나타나고, `compare` 동안 둘을 나란히 둔다.
   * - `fade` 동안 모두 흐려지고 다음 주기에 다시 낸다.
   */
  timeline: {
    phases: [
      { id: 'emit', duration: 1.4, caption: key('caption.emit') },
      { id: 'climb', duration: 4.2, caption: key('caption.climb') },
      { id: 'arrive', duration: 0.6, ease: 'smooth', caption: key('caption.arrive') },
      { id: 'compare', duration: 2.8, caption: key('caption.arrive') },
      { id: 'fade', duration: 0.6, caption: key('caption.arrive') },
    ],
  },

  /**
   * 도착한 순간 이미 진행 중이다 — 초록 물결이 표면을 반 넘게 빠져나온 참이다. 올라오는 중에서
   * 열면 첫 화면이 이미 노랗다 — 떠날 때의 색을 못 보고 늘어남이 시작된 뒤에 도착한다.
   */
  startAt: 1.0,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 공식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 720,
    fade: 0.25,
    style: { colorRole: 'ink', emphasis: 'strong' },
    // 캡션에 끼우는 물결 수 — 스테이지 상수를 state 로 옮겨 둔 글자다(G133).
    vars: { n: 'n' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것은 거리가 아니라 **물결 간격**이다 — 떠날 때
   * 모습과 나란히 두는 것이 그 자다.
   */

  messages: gravitationalRedshiftMessages,
};
