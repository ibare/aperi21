// ========================================================================
// axial-tilt-seasons — 선언
// ========================================================================
// 질문: 지구가 태양에서 멀어지지도 가까워지지도 않는데 왜 계절이 오는가.
//
// 자전축은 기울어진 채 공전하는 내내 우주의 **같은 방향**을 가리킨다. 그래서 궤도의
// 한쪽에서는 북반구가 태양 쪽으로, 반대쪽에서는 태양 반대로 기운다 — 북반구가 받는
// 햇빛의 몫이 절반보다 많아졌다(여름) 적어졌다(겨울) 한다. 기울기를 0 으로 세우면
// 궤도 어디서나 두 반구가 햇빛을 반씩 받아 계절이 사라진다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// 월드 단위는 캔버스 px 에 가까운 임의 단위, y 는 위.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:axial-tilt-seasons` 와 문자 그대로 일치한다 (C4). */
export const AXIAL_TILT_SEASONS_ID = 'axial-tilt-seasons';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 자전축 기울기(도) — 공전 궤도면의 수직에서 잰 각. 지구의 값. */
export const TILT_DEG = 23.5;
/** 견주는 기울기(도). 0 이면 축이 궤도면에 수직으로 선다 — 계절이 사라지는 쪽. */
export const FLAT_TILT_DEG = 0;

// ------------------------------------------------------------------------
// 배치 — 월드 단위(가로 840 · 세로 340 판), y 위
// ------------------------------------------------------------------------

export const CANVAS_W = 840;
export const CANVAS_H = 340;

/**
 * 궤도를 보는 눈의 높이(라디안) — 궤도면 위로 이만큼 올라가 비스듬히 내려다본다.
 * 0 이면 궤도가 선 하나로 눕고, 90° 면 위에서 내려다봐 축의 기울기가 보이지 않는다.
 */
export const VIEW_ELEVATION = (22 * Math.PI) / 180;

/** 궤도 — 가운데 태양, 반지름(월드). 비스듬히 보여 납작한 타원이 된다. */
export const ORBIT = { cx: 262, cy: 178, R: 205 } as const;
/** 태양 원판 반지름. */
export const SUN_R = 20;
/** 지구 원판 반지름 — 명암 경계와 기운 축이 보일 만큼 크게(실제 비율이 아니다). */
export const EARTH_R = 32;
/** 지구 명암을 칠하는 칸 수(가로 = 세로). */
export const EARTH_CELLS = 64;
/** 축 막대가 지구 밖으로 나가는 길이(지구 반지름의 배). 북쪽 끝 이름표 자리. */
export const AXIS_REACH = 1.5;
export const NORTH_LABEL_REACH = 1.9;
/** 그늘 면의 빛 세기 — 0 이면 다크 바탕과 같아진다(이웃 조각과 같은 값). 햇빛 면은 1. */
export const NIGHT_LIGHT = 0.04;
/** 명암 경계의 부드러운 폭(법선 · 태양 방향 내적). */
export const TERMINATOR_SOFT = 0.05;

/** 북반구가 받는 햇빛 몫의 한 해 곡선 — 판의 가로 · 세로. */
export const PLOT = { x0: 566, x1: 806, midY: 176, gain: 330 } as const;
/** 곡선 판의 세로 축이 덮는 몫 범위(아래 · 위). */
export const PLOT_SHARE_RANGE = [0.26, 0.74] as const;
/** 판 글자 자리. */
export const PLOT_TITLE_Y = 290;
export const PLOT_TILT_Y = 314;
export const PLOT_YEAR_Y = 70;
/** 기운 해의 곡선을 기울기 0 인 해 동안 옅게 남기는 불투명도. */
export const GHOST_OPACITY = 0.35;

/**
 * 고정 경계. 판 전체 + 아래 캡션 두 줄 자리. 캡션 슬롯이 그림을 덮지 않게 세로를
 * 아래로 늘렸다 (이웃 조각과 같은 까닭, 장부 G24).
 */
export const SCENE_BOUNDS = { minX: 0, maxX: CANVAS_W, minY: -56, maxY: CANVAS_H } as const;

// ------------------------------------------------------------------------
// 시간표
// ------------------------------------------------------------------------

/** 기운 해의 네 토막 각각(초) — 토막마다 4 분의 1 바퀴. */
export const QUARTER = 3.2;
/** 기울기 0 인 해의 두 토막 각각(초) — 토막마다 반 바퀴. 같은 빠르기로 돈다. */
export const HALF = 2 * QUARTER;
/** 축을 세우고 다시 기울이는 데 드는 시간(초). 그동안 지구는 궤도의 제자리에 선다. */
export const TURN_AXIS = 2.2;
/** 도착한 순간 — 여름 자리로 다가가며 이미 돌고 있다. */
export const START_AT = 0.8;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const axialTiltSeasonsMessages = Object.freeze({
  'label.title': { ko: '자전축 기울기와 계절', en: 'Axial tilt and the seasons' },
  'label.operation': {
    ko: '기울어진 채 도는 것이 만드는 계절',
    en: 'The seasons made by an Earth that orbits tilted',
  },
  'label.stage': { ko: '태양과 지구', en: 'Sun and Earth' },
  'label.view': { ko: '궤도를 비스듬히 위에서', en: 'The orbit seen from slightly above' },
  'label.sun': { ko: '태양', en: 'Sun' },
  'label.north': { ko: 'N', en: 'N' },
  'label.orbitView': {
    ko: '궤도를 비스듬히 위에서 본 지구',
    en: 'Earth’s orbit seen from slightly above',
  },
  'label.shareTitle': { ko: '북반구가 받는 햇빛', en: 'Sunlight caught by the Northern Hemisphere' },
  'label.tilt': { ko: '자전축 기울기 {tilt}°', en: 'axial tilt {tilt}°' },
  'label.half': { ko: '절반', en: 'half' },
  'label.more': { ko: '많다', en: 'more' },
  'label.less': { ko: '적다', en: 'less' },
  'label.summer': { ko: '여름', en: 'summer' },
  'label.winter': { ko: '겨울', en: 'winter' },
  'label.year': { ko: '공전 한 바퀴 = 1년', en: 'one orbit = one year' },
  'caption.toward': {
    ko: '궤도의 이쪽에서는 자전축의 북쪽 끝이 태양 쪽으로 기운다 — 북반구가 햇빛을 절반보다 많이 받는다. 북반구의 여름이다.',
    en: 'On this side of the orbit the north end of the axis leans toward the Sun — the Northern Hemisphere catches more than half the sunlight. It is northern summer.',
  },
  'caption.sideA': {
    ko: '지구가 돌아도 자전축은 우주의 같은 방향을 그대로 가리킨다. 이 자리에서는 태양 쪽으로도 반대로도 기울지 않아 두 반구가 햇빛을 반씩 받는다.',
    en: 'As Earth moves on, the axis keeps pointing the same way in space. Here it leans neither toward nor away from the Sun, so the two hemispheres share the sunlight equally.',
  },
  'caption.away': {
    ko: '반대쪽에 오면 같은 방향을 가리키는 축이 이번에는 태양 반대로 기운다 — 북반구가 햇빛을 절반보다 적게 받는다. 북반구의 겨울이다.',
    en: 'On the far side the same, unchanged axis now leans away from the Sun — the Northern Hemisphere catches less than half the sunlight. It is northern winter.',
  },
  'caption.sideB': {
    ko: '다시 옆으로 기운 자리에서 두 반구가 반씩 받고, 북반구는 다시 태양 쪽으로 기우는 자리로 간다.',
    en: 'Sideways again, the hemispheres share equally, and the north heads back toward the side where it leans sunward.',
  },
  'caption.straighten': {
    ko: '이제 자전축을 궤도면에 똑바로 세운다.',
    en: 'Now stand the axis upright, square to the orbit.',
  },
  'caption.flatA': {
    ko: '기울기가 0 이면 궤도 어디서나 두 반구가 햇빛을 반씩 받는다 — 곡선이 절반 선에 붙어 평평하다.',
    en: 'With zero tilt the two hemispheres share the sunlight equally all around the orbit — the curve lies flat on the half line.',
  },
  'caption.flatB': {
    ko: '태양 반대편에 와도 달라지는 것이 없다. 기울어진 채 돌지 않으면 계절도 없다.',
    en: 'Even on the far side nothing changes. Without the tilt, there are no seasons.',
  },
  'caption.retilt': {
    ko: '자전축을 다시 기울인다.',
    en: 'Tilt the axis again.',
  },
} satisfies Record<string, LocalizedText>);

export type AxialTiltSeasonsMessageKey = keyof typeof axialTiltSeasonsMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: AxialTiltSeasonsMessageKey): LocalizedText => axialTiltSeasonsMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: AxialTiltSeasonsMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const axialTiltSeasonsSchema: BundleSchema = {
  id: AXIAL_TILT_SEASONS_ID,
  label: text('label.title'),
  category: 'astro',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 기운 해와 기울기 0 인 해를 자동으로 차례로 보여 견주기까지 마친다.
  parameters: [],

  stages: [
    {
      id: 'sun-earth',
      label: text('label.stage'),
      constants: { tilt: TILT_DEG, flatTilt: FLAT_TILT_DEG },
    },
  ],
  environments: [],
  views: [{ id: 'oblique', label: text('label.view'), default: true }],

  /** 판 840 × 340 + 캡션 두 줄. */
  canvas: { height: 420, minHeight: 380 },

  /**
   * 겹침이 판정 장치다 — 궤도 선 위에 지구가, 지구 명암 위에 축과 적도가, 옅은 기운 곡선
   * 위에 기울기 0 인 곡선이 와야 한다. 층 순서로는 `scalarField`(명암)가 축 위로 올 수 있다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 기운 해(네 토막, 토막마다 4 분의 1 바퀴 — 여름 · 옆 · 겨울 · 옆) → 축 세우기 →
   * 기울기 0 인 해(두 토막, 토막마다 반 바퀴) → 다시 기울이기.
   * 지구의 자리를 이 토막들의 진행도 합에서 읽으므로(physics `orbitFraction`) 캡션이 지구의
   * 자리와 어긋날 수 없다. 토막 가운데가 여름 · 옆 · 겨울 · 옆 자리다.
   */
  timeline: {
    phases: [
      { id: 'toward', duration: QUARTER, ease: 'linear', caption: key('caption.toward') },
      { id: 'sideA', duration: QUARTER, ease: 'linear', caption: key('caption.sideA') },
      { id: 'away', duration: QUARTER, ease: 'linear', caption: key('caption.away') },
      { id: 'sideB', duration: QUARTER, ease: 'linear', caption: key('caption.sideB') },
      { id: 'straighten', duration: TURN_AXIS, ease: 'smooth', caption: key('caption.straighten') },
      { id: 'flatA', duration: HALF, ease: 'linear', caption: key('caption.flatA') },
      { id: 'flatB', duration: HALF, ease: 'linear', caption: key('caption.flatB') },
      { id: 'retilt', duration: TURN_AXIS, ease: 'smooth', caption: key('caption.retilt') },
    ],
  },

  /** 도착한 순간 이미 돌고 있다 — 여름 자리로 다가가는 중. */
  startAt: START_AT,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 계절의 정의는 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-left', offset: [16, -8] },
    align: 'left',
    fontSize: 14,
    fade: 0.3,
    style: { colorRole: 'ink', emphasis: 'medium' },
    wrapWidth: CANVAS_W - 32,
  },

  // 그리드 · 카메라 단추 없음 — 잴 것이 거리가 아니라 「어느 쪽으로 기울었나」 다.

  messages: axialTiltSeasonsMessages,
};
