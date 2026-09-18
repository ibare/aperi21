// ========================================================================
// earth-revolution-constellations — 선언
// ========================================================================
// 질문: 계절마다 한밤에 보이는 별자리는 왜 달라지는가.
//
// 한밤의 관측자는 태양 반대쪽을 본다 — 지구의 밤 쪽이 향하는 곳이 곧 궤도 바깥쪽
// 방향이다. 그쪽 별자리가 한밤의 하늘에 뜨고, 태양 쪽 별자리는 태양과 함께 낮 하늘에
// 떠서 햇빛에 묻힌다. 지구가 공전하면 그 바깥 방향이 한 해 동안 황도 12 별자리를
// 한 바퀴 돌아, 계절마다 한밤의 별자리가 바뀐다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// 월드 단위는 캔버스 px 에 가까운 임의 단위, y 는 위. 각은 월드 +x 에서 반시계(북극 위에서 본
// 황경 방향)다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:earth-revolution-constellations` 와 문자 그대로 일치한다 (C4). */
export const EARTH_REVOLUTION_CONSTELLATIONS_ID = 'earth-revolution-constellations';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/**
 * 봄(3월 1일)이 시작할 때 태양에서 본 지구의 황경(도). 춘분(3월 21일 무렵)에 지구는 황경 180° 에
 * 있고 하루에 약 1° 씩 나아가므로 3월 1일은 160° 부근이다. 계절 하나 = 90°.
 */
export const SPRING_START_DEG = 160;
/** 태양에서 이 각(도) 안쪽의 별자리는 낮 하늘에만 떠 있어 햇빛에 묻힌다. */
export const GLARE_DEG = 30;
/** 태양에서 이 각(도) 넘게 떨어진 별자리는 밤 하늘에 온전히 뜬다. 그 사이는 초저녁 · 새벽에만 잠깐. */
export const NIGHT_SIDE_DEG = 90;
/** 오른쪽 「한밤의 남쪽 하늘」 창이 정남에서 동 · 서로 보이는 각(도). */
export const WINDOW_HALF_DEG = 60;

// ------------------------------------------------------------------------
// 황도 12 별자리 — 황경 가운데 자리(도). 실제 별자리 경계는 폭이 제각각이지만 가운데 자리는
// 30° 간격에서 10° 안쪽으로 맞는다. 스테이지 상수는 수 하나씩이라 목록을 둘 수 없다 (장부 G105).
// ------------------------------------------------------------------------

export type ConstellationKey =
  | 'star.pisces'
  | 'star.aries'
  | 'star.taurus'
  | 'star.gemini'
  | 'star.cancer'
  | 'star.leo'
  | 'star.virgo'
  | 'star.libra'
  | 'star.scorpius'
  | 'star.sagittarius'
  | 'star.capricornus'
  | 'star.aquarius';

export interface Constellation {
  readonly key: ConstellationKey;
  /** 황경 가운데 자리(도). */
  readonly lon: number;
}

export const ZODIAC: readonly Constellation[] = [
  { key: 'star.pisces', lon: 15 },
  { key: 'star.aries', lon: 45 },
  { key: 'star.taurus', lon: 75 },
  { key: 'star.gemini', lon: 105 },
  { key: 'star.cancer', lon: 135 },
  { key: 'star.leo', lon: 165 },
  { key: 'star.virgo', lon: 195 },
  { key: 'star.libra', lon: 225 },
  { key: 'star.scorpius', lon: 255 },
  { key: 'star.sagittarius', lon: 285 },
  { key: 'star.capricornus', lon: 315 },
  { key: 'star.aquarius', lon: 345 },
];

/**
 * 별자리마다 흩뿌리는 별의 시드 · 개수 · 퍼짐. 별 모양은 실제 별자리 모양이 아니다 — 주장은
 * 「어느 별자리가 한밤에 뜨나」 이지 별자리의 생김새가 아니다. 같은 시드는 언제나 같은 별이다.
 */
export const STAR_SEED = 21;
export const STARS_PER_CONSTELLATION = 5;
/** 가운데 자리에서 황경으로 퍼지는 폭(도, ±). */
export const STAR_SPREAD_DEG = 11;

// ------------------------------------------------------------------------
// 배치 — 월드 단위(가로 840 · 세로 360 판), y 위
// ------------------------------------------------------------------------

export const CANVAS_W = 840;
export const CANVAS_H = 360;

/** 왼쪽 판 — 북극 위에서 내려다본 태양 · 공전 궤도 · 별자리 고리. */
export const TOP = { cx: 230, cy: 186 } as const;
export const SUN_R = 17;
export const ORBIT_R = 80;
export const EARTH_R = 11;
/** 별자리 이름이 놓이는 고리의 반지름. */
export const RING_R = 146;
/** 한밤 방향 화살 — 지구 표면에서 띄운 거리, 고리 이름 앞에서 멈추는 거리. */
export const SIGHT = { gap: 4, stopBeforeRing: 24 } as const;
/** 「햇빛에 묻힘」 이름표가 고리 바깥으로 나간 거리 — 고리 안에 두면 별자리 이름과 겹친다. */
export const GLARE_LABEL_OUTSET = 44;

/** 오른쪽 판 — 한밤에 남쪽을 본 하늘 창. 아래 변이 지평선. */
export const SKY = { x0: 480, x1: 820, y0: 96, y1: 296 } as const;
/** 창 안 별 무리의 가운데 높이 · 세로 퍼짐(±), 이름표 높이. */
export const SKY_STAR_Y = 206;
export const SKY_STAR_SPREAD_Y = 40;
export const SKY_NAME_Y = 140;
/** 지평선 아래 방위 이름표 높이, 창 위 제목 높이. */
export const SKY_COMPASS_Y = 80;
export const SKY_TITLE_Y = 318;
/** 창 가장자리에서 별 · 이름을 옅게 지우는 폭(도). */
export const SKY_EDGE_FADE_DEG = 14;

/**
 * 고정 경계. 판 전체 + 위쪽 「햇빛에 묻힘」 이름표 자리 + 아래 캡션 두 줄 자리. 캡션 슬롯이 그림을 덮지 않게 세로를
 * 아래로 늘렸다 (이웃 조각과 같은 까닭, 장부 G24).
 */
export const SCENE_BOUNDS = { minX: 0, maxX: CANVAS_W, minY: -60, maxY: CANVAS_H + 28 } as const;

// ------------------------------------------------------------------------
// 시간표 — 한 해를 네 계절(봄 → 여름 → 가을 → 겨울)로
// ------------------------------------------------------------------------

/** 계절 하나의 길이(초). 한 해 = 넷의 합. */
export const SEASON = 5;
/** 도착한 순간 — 봄의 초입, 지구가 이미 돌고 있는 자리. */
export const START_AT = 1.2;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const earthRevolutionConstellationsMessages = Object.freeze({
  'label.title': { ko: '공전과 별자리', en: 'Earth’s orbit and the constellations' },
  'label.operation': {
    ko: '계절마다 보이는 별자리가 달라지는 이유',
    en: 'Why the constellations we see change with the seasons',
  },
  'label.stage': { ko: '태양 · 지구 · 황도 별자리', en: 'Sun, Earth and the zodiac' },
  'label.view': { ko: '북극 위에서', en: 'From above the North Pole' },
  'label.sun': { ko: '태양', en: 'Sun' },
  'label.glare': { ko: '햇빛에 묻힘', en: 'lost in sunlight' },
  'label.sky.spring': { ko: '봄 · 한밤의 남쪽 하늘', en: 'Spring · the southern sky at midnight' },
  'label.sky.summer': { ko: '여름 · 한밤의 남쪽 하늘', en: 'Summer · the southern sky at midnight' },
  'label.sky.autumn': { ko: '가을 · 한밤의 남쪽 하늘', en: 'Autumn · the southern sky at midnight' },
  'label.sky.winter': { ko: '겨울 · 한밤의 남쪽 하늘', en: 'Winter · the southern sky at midnight' },
  'label.east': { ko: '동', en: 'E' },
  'label.south': { ko: '정남', en: 'due S' },
  'label.west': { ko: '서', en: 'W' },
  'star.pisces': { ko: '물고기자리', en: 'Pisces' },
  'star.aries': { ko: '양자리', en: 'Aries' },
  'star.taurus': { ko: '황소자리', en: 'Taurus' },
  'star.gemini': { ko: '쌍둥이자리', en: 'Gemini' },
  'star.cancer': { ko: '게자리', en: 'Cancer' },
  'star.leo': { ko: '사자자리', en: 'Leo' },
  'star.virgo': { ko: '처녀자리', en: 'Virgo' },
  'star.libra': { ko: '천칭자리', en: 'Libra' },
  'star.scorpius': { ko: '전갈자리', en: 'Scorpius' },
  'star.sagittarius': { ko: '궁수자리', en: 'Sagittarius' },
  'star.capricornus': { ko: '염소자리', en: 'Capricornus' },
  'star.aquarius': { ko: '물병자리', en: 'Aquarius' },
  'caption.spring': {
    ko: '봄(3~5월) — 지구의 밤 쪽은 사자 · 처녀 · 천칭자리를 향해 이들이 한밤 하늘에 떠 있다. 태양 쪽의 물병 · 물고기 · 양자리는 낮 하늘에 묻힌다.',
    en: 'Spring (Mar–May) — Earth’s night side faces Leo, Virgo and Libra, so they stand in the midnight sky. Aquarius, Pisces and Aries lie toward the Sun, lost in the daytime sky.',
  },
  'caption.summer': {
    ko: '여름(6~8월) — 지구가 궤도를 4 분의 1 돌아 밤 쪽이 전갈 · 궁수 · 염소자리로 옮겨 갔다. 봄밤의 별자리는 태양 쪽으로 다가가 초저녁에만 잠깐 보인다.',
    en: 'Summer (Jun–Aug) — a quarter of the way round the orbit, the night side now faces Scorpius, Sagittarius and Capricornus. The spring stars have drifted toward the Sun and show only briefly after dusk.',
  },
  'caption.autumn': {
    ko: '가을(9~11월) — 밤 쪽이 물병 · 물고기 · 양자리를 향한다. 봄에 한밤을 차지하던 사자 · 처녀 · 천칭자리는 이제 태양 뒤에서 햇빛에 묻혔다.',
    en: 'Autumn (Sep–Nov) — the night side faces Aquarius, Pisces and Aries. Leo, Virgo and Libra, which ruled the spring midnight, are now behind the Sun and lost in its light.',
  },
  'caption.winter': {
    ko: '겨울(12~2월) — 밤 쪽이 황소 · 쌍둥이 · 게자리를 향한다. 한 바퀴를 마치면 다시 봄밤의 별자리로 돌아온다 — 공전 한 바퀴가 한 해다.',
    en: 'Winter (Dec–Feb) — the night side faces Taurus, Gemini and Cancer. One more quarter and the spring stars return — one orbit is one year.',
  },
} satisfies Record<string, LocalizedText>);

export type EarthRevolutionConstellationsMessageKey = keyof typeof earthRevolutionConstellationsMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: EarthRevolutionConstellationsMessageKey): LocalizedText =>
  earthRevolutionConstellationsMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: EarthRevolutionConstellationsMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const earthRevolutionConstellationsSchema: BundleSchema = {
  id: EARTH_REVOLUTION_CONSTELLATIONS_ID,
  label: text('label.title'),
  category: 'astro',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 지구가 돌고 있고, 한 해 동안 한밤의 별자리가 한 바퀴 바뀐다.
  parameters: [],

  stages: [
    {
      id: 'sun-earth-zodiac',
      label: text('label.stage'),
      constants: {
        springStartDeg: SPRING_START_DEG,
        glareDeg: GLARE_DEG,
        nightSideDeg: NIGHT_SIDE_DEG,
        windowHalfDeg: WINDOW_HALF_DEG,
      },
    },
  ],
  environments: [],
  views: [{ id: 'north-pole', label: text('label.view'), default: true }],

  /** 판 840 × 360 + 캡션 두 줄. 세로는 별자리 고리의 지름이 정한다. */
  canvas: { height: 440, minHeight: 400 },

  /**
   * 겹침이 판정 장치다 — 햇빛 쐐기는 이름 **아래**, 한밤 화살은 궤도 위, 정남 선은 별 위에
   * 와야 한다. 층 순서로는 `sector`(쐐기)가 글자 위로 올라올 수 있다.
   */
  drawOrder: 'scene',

  /**
   * 한 해 = 봄 → 여름 → 가을 → 겨울. 계절마다 궤도 4 분의 1(90°). 지구의 황경을 이 네 단계의
   * 진행도 합에서 읽으므로(physics `yearFraction` · `earthLongitude`), 캡션이 말하는 계절과 지구
   * 자리가 어긋날 수 없다. 고르게 돈다(linear).
   */
  timeline: {
    phases: [
      { id: 'spring', duration: SEASON, ease: 'linear', caption: key('caption.spring') },
      { id: 'summer', duration: SEASON, ease: 'linear', caption: key('caption.summer') },
      { id: 'autumn', duration: SEASON, ease: 'linear', caption: key('caption.autumn') },
      { id: 'winter', duration: SEASON, ease: 'linear', caption: key('caption.winter') },
    ],
  },

  /** 도착한 순간 이미 돌고 있다 — 봄의 초입. */
  startAt: START_AT,

  // 슬롯 하나. 지금 지구의 밤 쪽이 어느 별자리를 향하는지만 말한다 — 공전의 정의는 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-left', offset: [16, -8] },
    align: 'left',
    fontSize: 14,
    fade: 0.3,
    style: { colorRole: 'ink', emphasis: 'medium' },
    wrapWidth: CANVAS_W - 32,
  },

  // 그리드 · 카메라 단추 없음 — 잴 것이 거리가 아니라 「어느 쪽을 향하나」 다.

  messages: earthRevolutionConstellationsMessages,
};
