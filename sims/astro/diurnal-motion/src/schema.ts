// ========================================================================
// diurnal-motion — 선언
// ========================================================================
// 질문: 하룻밤(하루) 동안 별은 하늘에서 어떻게 움직이는가.
//
// 땅 위 관측자가 북쪽 하늘을 본다. 하루를 빨리 감으면 별마다 북극성(천구의 북극)
// 한 점을 가운데 둔 원호를 긋는다. 안쪽 별은 작은 원, 바깥 별은 큰 원이지만 같은
// 시간에 도는 각은 모두 같다 — 별자리가 모양을 그대로 지닌 채 돈다. 하늘 전체가
// 한 덩어리로 도는 것이고, 그것은 지구가 반대쪽으로 도는 것의 거울이다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// 월드 단위는 **하늘의 각(도)** 이다. 천구의 북극이 원점, y 는 위(천정 쪽).
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:diurnal-motion` 와 문자 그대로 일치한다 (C4). */
export const DIURNAL_MOTION_ID = 'diurnal-motion';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 관측 위도(도, 북위). 북극성의 고도가 이 값이다. 기본은 서울 부근. */
export const LATITUDE_DEG = 37.5;
/** 하늘이 한 시간에 도는 각(도). 하루 = 한 바퀴. */
export const DEG_PER_HOUR = 15;
/** 빨리 감는 길이(시간). 하루. */
export const DAY_HOURS = 24;
/**
 * 빨리 감기를 시작할 때의 항성시(시). 봄 저녁 무렵 — 북두칠성이 북극성 오른쪽 위,
 * 카시오페이아가 왼쪽 아래에 있는 하늘이다.
 */
export const START_SIDEREAL_HOURS = 7.5;
/** 흩뿌린 배경 별의 시드 · 개수 · 북극에서 떨어진 최대 각(도). */
export const STAR_SEED = 7;
export const STAR_COUNT = 24;
export const STAR_MAX_POLAR_DEG = 66;

// ------------------------------------------------------------------------
// 별 목록 — 실제 적경(시) · 적위(도) · 겉보기 등급. 모양이 알아볼 수 있는 별자리라야
// 「모양 그대로 돈다」 가 보인다. 스테이지 상수는 수 하나씩이라 목록을 둘 수 없다 (장부 G105).
// ------------------------------------------------------------------------

export interface CatalogStar {
  readonly ra: number;
  readonly dec: number;
  readonly mag: number;
}

/** 북극성. */
export const POLARIS: CatalogStar = { ra: 2.530, dec: 89.26, mag: 2.0 };

/** 북두칠성 — 두베 · 메라크 · 페크다 · 메그레즈 · 알리오트 · 미자르 · 알카이드. */
export const BIG_DIPPER: readonly CatalogStar[] = [
  { ra: 11.062, dec: 61.75, mag: 1.8 },
  { ra: 11.031, dec: 56.38, mag: 2.4 },
  { ra: 11.897, dec: 53.69, mag: 2.4 },
  { ra: 12.257, dec: 57.03, mag: 3.3 },
  { ra: 12.900, dec: 55.96, mag: 1.8 },
  { ra: 13.399, dec: 54.93, mag: 2.2 },
  { ra: 13.792, dec: 49.31, mag: 1.9 },
];
/** 북두칠성 선 — 국자 네 별을 닫고 자루 셋을 잇는다. */
export const BIG_DIPPER_LINES: readonly (readonly number[])[] = [
  [0, 1, 2, 3, 0],
  [3, 4, 5, 6],
];

/** 카시오페이아 — W 자 다섯 별. */
export const CASSIOPEIA: readonly CatalogStar[] = [
  { ra: 0.153, dec: 59.15, mag: 2.3 },
  { ra: 0.675, dec: 56.54, mag: 2.2 },
  { ra: 0.945, dec: 60.72, mag: 2.2 },
  { ra: 1.430, dec: 60.24, mag: 2.7 },
  { ra: 1.907, dec: 63.67, mag: 3.4 },
];
export const CASSIOPEIA_LINES: readonly (readonly number[])[] = [[0, 1, 2, 3, 4]];

// ------------------------------------------------------------------------
// 배치 — 월드 단위는 하늘의 각(도). 천구의 북극이 원점
// ------------------------------------------------------------------------

/** 하늘 창 — 이 사각형 밖의 하늘은 그리지 않는다(창틀로 자른다). */
export const SKY = { minX: -50, maxX: 50, minY: -46, maxY: 40 } as const;
/** 창 위 제목 높이. */
export const SKY_TITLE_Y = 43.5;
/** 땅 위 방위 이름표 높이와 동 · 서 이름표의 가로 자리. */
export const GROUND_LABEL_Y = -42.3;
export const GROUND_SIDE_X = 38;
/** 궤적을 자르는 각 간격(도). */
export const TRAIL_STEP_DEG = 3;
/** 별자리 이름표를 별자리 가운데에서 북극 쪽으로 당기는 각(도). */
export const CONSTELLATION_LABEL_INSET = 13;

/** 흐른 시간 눈금판 — 하늘 창 오른쪽. 바늘이 하늘과 같은 각만큼 같은 쪽으로 돈다. */
export const DIAL = { cx: 78, cy: 2, R: 14, tick: 2.2, labelGap: 5.5, titleY: 31 } as const;

/**
 * 고정 경계. 창 + 눈금판 + 아래 캡션 두 줄 자리. 캡션 슬롯이 그림을 덮지 않게 세로를
 * 아래로 늘렸다 (earth-rotation-day-night 와 같은 까닭, 장부 G24).
 */
export const SCENE_BOUNDS = { minX: -54, maxX: 104, minY: -62, maxY: 47 } as const;

// ------------------------------------------------------------------------
// 시간표 — 저녁 → 자정 → 새벽 → (낮) → 저녁. 빨리 감는 세 토막 + 멈춤 + 비움
// ------------------------------------------------------------------------

/** 빨리 감는 토막 id — 이 토막들의 진행도로 흐른 시간을 읽는다(physics `elapsedHours`). */
export const SWEEP_PHASES = ['dusk', 'midnight', 'daytime'] as const;
/** 도착한 순간 — 저녁에서 한 시간 반쯤 감긴 자리. 궤적이 이미 조금 그어져 있다. */
export const START_AT = 1.0;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const diurnalMotionMessages = Object.freeze({
  'label.title': { ko: '일주 운동', en: 'Diurnal motion' },
  'label.operation': {
    ko: '하루 동안 태양과 별이 하늘을 가로지르는 길',
    en: 'The paths the Sun and stars trace across the sky in a day',
  },
  'label.stage': { ko: '북쪽 하늘', en: 'Northern sky' },
  'label.view': { ko: '땅 위에서', en: 'From the ground' },
  'label.skyTitle': {
    ko: '북쪽 하늘을 바라볼 때 — 북위 {lat}°',
    en: 'Looking at the northern sky — latitude {lat}° N',
  },
  'label.polaris': { ko: '북극성', en: 'Polaris' },
  'label.bigDipper': { ko: '북두칠성', en: 'Big Dipper' },
  'label.cassiopeia': { ko: '카시오페이아', en: 'Cassiopeia' },
  'label.north': { ko: '북', en: 'N' },
  'label.west': { ko: '← 서', en: '← W' },
  'label.east': { ko: '동 →', en: 'E →' },
  'label.elapsed': { ko: '흐른 시간', en: 'Time elapsed' },
  'label.dusk': { ko: '저녁', en: 'dusk' },
  'label.midnight': { ko: '자정', en: 'midnight' },
  'label.dawn': { ko: '새벽', en: 'dawn' },
  'label.noon': { ko: '정오', en: 'noon' },
  'caption.dusk': {
    ko: '하루를 빨리 감는다. 별마다 북극성을 가운데 둔 원을 따라 시계 반대 방향으로 돈다.',
    en: 'Fast-forwarding a day. Every star circles counterclockwise around Polaris.',
  },
  'caption.midnight': {
    ko: '안쪽 별은 작은 원, 바깥 별은 큰 원을 그리지만 같은 시간에 도는 각은 모두 같다 — 북두칠성은 모양 그대로 돈다.',
    en: 'Inner stars draw small circles and outer stars large ones, yet all turn through the same angle in the same time — the Big Dipper keeps its shape.',
  },
  'caption.daytime': {
    ko: '낮에는 햇빛에 가려 보이지 않을 뿐, 별은 같은 빠르기로 계속 돈다. 지평선 아래로 졌다가 다시 뜨는 별도 있다.',
    en: 'By day sunlight hides them, but the stars keep turning at the same rate. Some dip below the horizon and rise again.',
  },
  'caption.full': {
    ko: '하루가 지나 모든 별이 한 바퀴를 돌아 제자리에 왔다 — 하늘 전체가 한 덩어리로 돈다. 지구가 반대쪽으로 한 바퀴 돈 만큼이다.',
    en: 'After a day every star has made one full turn back to its place — the whole sky turns as one piece, mirroring one turn of Earth the other way.',
  },
} satisfies Record<string, LocalizedText>);

export type DiurnalMotionMessageKey = keyof typeof diurnalMotionMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: DiurnalMotionMessageKey): LocalizedText => diurnalMotionMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: DiurnalMotionMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const diurnalMotionSchema: BundleSchema = {
  id: DIURNAL_MOTION_ID,
  label: text('label.title'),
  category: 'astro',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 하늘이 돌고 있고, 하루를 다 감으면 할 말이 끝난다.
  parameters: [],

  stages: [
    {
      id: 'northern-sky',
      label: text('label.stage'),
      constants: {
        latitude: LATITUDE_DEG,
        degPerHour: DEG_PER_HOUR,
        dayHours: DAY_HOURS,
        startSiderealHours: START_SIDEREAL_HOURS,
        starSeed: STAR_SEED,
        starCount: STAR_COUNT,
        starMaxPolarDeg: STAR_MAX_POLAR_DEG,
      },
    },
  ],
  environments: [],
  views: [{ id: 'ground', label: text('label.view'), default: true }],

  /** 하늘 창(각 86°)과 캡션 두 줄. */
  canvas: { height: 440, minHeight: 400 },

  /**
   * 겹침이 판정 장치다 — 땅이 별과 궤적 **위**에 와서 지평선 아래로 진 부분을 가려야 한다.
   * 층 순서로는 `region`(땅)이 `particleSystem`(별) 아래로 갈 수 있다.
   */
  drawOrder: 'scene',

  /**
   * 빨리 감는 세 토막(저녁→자정 6 시간 · 자정→새벽 6 시간 · 새벽→낮→저녁 12 시간)은 시간 길이에
   * 비례하는 길이라 하늘이 고르게 돈다. 흐른 시간은 세 토막의 진행도에서 읽는다(physics `elapsedHours`).
   * 한 바퀴를 다 돌면 `full` 에서 멈춰 보이고 `reset` 에서 궤적을 지운다 — 별 자리는 하루 뒤 제자리라
   * 주기가 이어진다.
   */
  timeline: {
    phases: [
      { id: 'dusk', duration: 4, ease: 'linear', caption: key('caption.dusk') },
      { id: 'midnight', duration: 4, ease: 'linear', caption: key('caption.midnight') },
      { id: 'daytime', duration: 8, ease: 'linear', caption: key('caption.daytime') },
      { id: 'full', duration: 4, ease: 'linear', caption: key('caption.full') },
      { id: 'reset', duration: 1, ease: 'smooth', caption: key('caption.full') },
    ],
  },

  /** 도착한 순간 이미 감기고 있다 — 궤적이 짧게 그어진 자리. */
  startAt: START_AT,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 일주 운동의 정의는 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-left', offset: [16, -8] },
    align: 'left',
    fontSize: 14,
    fade: 0.3,
    style: { colorRole: 'ink', emphasis: 'medium' },
    wrapWidth: 780,
  },

  // 그리드 · 카메라 단추 없음 — 잴 것이 거리가 아니라 「같은 각만큼 도는가」 다.

  messages: diurnalMotionMessages,
};
