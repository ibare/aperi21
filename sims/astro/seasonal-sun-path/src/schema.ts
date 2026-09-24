// ========================================================================
// seasonal-sun-path — 선언
// ========================================================================
// 질문: 계절이 바뀌면 왜 해가 높이 뜨는 날은 낮도 길어지는가.
//
// 땅 위 관측자(북위 37.5°)를 가운데 둔 하늘 반구(돔)를 남서쪽 위에서 비스듬히
// 내려다본다. 하루 동안 태양이 지나는 길은 천구의 적도에 나란한 원이고, 계절은 그
// 원을 자전축을 따라 위아래로 옮길 뿐이다. 원이 북쪽으로 올라가면(하지) 북동에서
// 떠 높이 남중하고 북서로 지며 지평선 위 호가 길어진다 — 남중 고도와 낮 길이가
// 원 하나의 자리로 함께 정해진다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// 월드 단위는 돔 반지름을 `DOME_R` 로 둔 길이다. 관측자가 원점, y 는 화면 위.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:seasonal-sun-path` 와 문자 그대로 일치한다 (C4). */
export const SEASONAL_SUN_PATH_ID = 'seasonal-sun-path';

// ------------------------------------------------------------------------
// 물리 · 시점 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 관측 위도(도, 북위). 기본은 서울 부근. */
export const LATITUDE_DEG = 37.5;
/** 자전축 경사(도). 하지 · 동지의 태양 적위가 ±이 값이다. */
export const TILT_DEG = 23.5;
/** 하루(시간). 오른쪽 막대의 온 길이. */
export const DAY_HOURS = 24;
/** 돔을 내려다보는 시점의 고도(도) — 지평선 원판이 얼마나 열려 보이는가. */
export const VIEW_ELEVATION_DEG = 24;
/** 시점이 정남에서 서쪽으로 비낀 방위(도) — 0 이면 자오선이 한 줄로 겹쳐 남중 고도각이 보이지 않는다. */
export const VIEW_AZIMUTH_DEG = 35;

// ------------------------------------------------------------------------
// 배치 — 월드 단위
// ------------------------------------------------------------------------

/** 돔 반지름. */
export const DOME_R = 100;
/** 태양 길을 표본하는 시간각 간격(도). */
export const ARC_STEP_DEG = 2;
/** 남중 고도 부채꼴 반지름(돔 반지름 대비). */
export const ALT_SECTOR_FRAC = 0.45;
/** 방위 이름표를 지평선 밖으로 내미는 배율(돔 반지름 대비). */
export const DIR_LABEL_FRAC = 1.14;
/**
 * 북 이름표만 지평선 안쪽(땅 위)에 둔다 — 밖에 두면 하지 길이 북서로 지며 그 자리를 지나간다.
 */
export const NORTH_LABEL_FRAC = 0.8;
/** 계절 이름표를 거는 자리 — 오후 이 시간각(도)의 길 위. 세 길이 서로 넉넉히 떨어진 남서 하늘이다. */
export const SEASON_LABEL_HOUR_DEG = 40;

/** 하루 막대 판 — 돔 오른쪽. `x0` 에서 자정, `x0 + len` 에서 다음 자정. */
export const BAR = {
  x0: 158,
  len: 150,
  /** 지금 막대의 가운데 높이와 두께. */
  nowY: 58,
  nowH: 12,
  /** 지나온 계절 줄 — 첫 줄 가운데 높이, 줄 간격, 두께. */
  rowY: 30,
  rowGap: 17,
  rowH: 7,
  /** 줄 이름을 막대 왼쪽에 두는 가로 자리. */
  nameX: 138,
  /** 판 제목 높이, 시각 이름표(자정 · 정오) 높이. */
  titleY: 80,
  hourLabelY: -26,
} as const;

/** 돔 제목 자리. */
export const DOME_TITLE = { x: -60, y: 108 } as const;

/**
 * 고정 경계. 돔(±100, 아래 −37) + 방위 이름표 + 하루 막대 판 + 아래 캡션 두 줄 자리.
 * 캡션 슬롯이 그림을 덮지 않게 세로를 아래로 늘렸다 (장부 G24).
 */
export const SCENE_BOUNDS = { minX: -122, maxX: 318, minY: -88, maxY: 116 } as const;

// ------------------------------------------------------------------------
// 시간표 — 동지(하루) → 옮김 → 춘추분(하루) → 옮김 → 하지(하루) → 되돌아감
// ------------------------------------------------------------------------

/**
 * 머무는 단계 id — 계절 하나에 하루(자정 → 자정)를 돈다. 순서는 동지 · 춘추분 · 하지.
 * physics 가 이 단계들의 진행도로 하루 중 시각을 읽는다.
 */
export const HOLD_PHASES = ['winter', 'equinox', 'summer'] as const;
export type HoldPhase = (typeof HOLD_PHASES)[number];

/** 도착한 순간 — 동지 하루의 오전. 해가 이미 남동 하늘에 떠 있다. */
export const START_AT = 2.6;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const seasonalSunPathMessages = Object.freeze({
  'label.title': { ko: '계절과 태양의 길', en: 'The Sun’s path through the seasons' },
  'label.stage': { ko: '중위도', en: 'Mid-latitude' },
  'label.view': { ko: '땅 위에서', en: 'From the ground' },
  'label.domeTitle': {
    ko: '북위 {lat}° 에서 본 하늘',
    en: 'The sky seen from latitude {lat}° N',
  },
  'label.north': { ko: '북', en: 'N' },
  'label.south': { ko: '남', en: 'S' },
  'label.east': { ko: '동', en: 'E' },
  'label.west': { ko: '서', en: 'W' },
  'label.noonAltitude': { ko: '남중 고도', en: 'noon altitude' },
  'label.winter': { ko: '동지', en: 'winter solstice' },
  'label.equinox': { ko: '춘추분', en: 'equinox' },
  'label.summer': { ko: '하지', en: 'summer solstice' },
  'label.barTitle': { ko: '하루 중 해가 떠 있는 동안', en: 'Daylight within one day' },
  'label.now': { ko: '지금', en: 'now' },
  'label.midnight': { ko: '자정', en: 'midnight' },
  'label.noon': { ko: '정오', en: 'noon' },
  'caption.winter': {
    ko: '동지 — 해가 남동에서 떠 남쪽 하늘을 낮게 지나 남서로 진다. 지평선 위의 길이 짧아 하루 중 떠 있는 동안이 짧다.',
    en: 'Winter solstice — the Sun rises in the southeast, crosses low in the southern sky and sets in the southwest. Its path above the horizon is short, so the day is short.',
  },
  'caption.shiftUp': {
    ko: '계절이 옮겨 가면 태양의 길이 나란한 채로 북쪽 위로 올라간다 — 남중 고도와 낮 길이가 함께 는다.',
    en: 'As the season moves on, the path slides north and up, staying parallel — the noon altitude and the daylight grow together.',
  },
  'caption.equinox': {
    ko: '춘추분 — 정동에서 떠 정서로 진다. 길의 꼭 절반이 지평선 위라 낮과 밤이 같다.',
    en: 'Equinox — the Sun rises due east and sets due west. Exactly half its path is above the horizon, so day and night are equal.',
  },
  'caption.summer': {
    ko: '하지 — 북동에서 떠 높이 남중하고 북서로 진다. 지평선 위의 길이 가장 길어 해가 가장 오래 떠 있다.',
    en: 'Summer solstice — the Sun rises in the northeast, stands high at noon and sets in the northwest. Its path above the horizon is longest, so it stays up longest.',
  },
  'caption.back': {
    ko: '다시 겨울로 — 길이 나란한 채로 내려오며 남중 고도와 낮 길이가 함께 줄어든다.',
    en: 'Back toward winter — the path slides down, still parallel, and the noon altitude and the daylight shrink together.',
  },
} satisfies Record<string, LocalizedText>);

export type SeasonalSunPathMessageKey = keyof typeof seasonalSunPathMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: SeasonalSunPathMessageKey): LocalizedText => seasonalSunPathMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: SeasonalSunPathMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const seasonalSunPathSchema: BundleSchema = {
  id: SEASONAL_SUN_PATH_ID,
  title: text('label.title'),
  category: 'astro',
  timeModel: 'periodic',

  // 조작기가 없다 — 시간표가 동지 · 춘추분 · 하지를 차례로 옮기며 견주기까지 마친다.
  parameters: [],

  stages: [
    {
      id: 'mid-latitude',
      label: text('label.stage'),
      constants: {
        latitude: LATITUDE_DEG,
        tilt: TILT_DEG,
        dayHours: DAY_HOURS,
        viewElevation: VIEW_ELEVATION_DEG,
        viewAzimuth: VIEW_AZIMUTH_DEG,
      },
    },
  ],
  environments: [],
  views: [{ id: 'ground', label: text('label.view'), default: true }],

  /** 돔과 하루 막대, 캡션 두 줄. */
  canvas: { height: 420, minHeight: 380 },

  /**
   * 겹침이 판정 장치다 — 지평선 원판 위로 태양 길이 지나가야 「지평선 위 호」 가 읽히고,
   * 지금 막대가 판 틀 위에 와야 한다. 층 순서로는 `region`(원판)이 궤적 위로 올 수 있다.
   */
  drawOrder: 'scene',

  /**
   * 머무는 세 단계(동지 · 춘추분 · 하지)는 **같은 길이**다 — 각 단계가 하루(자정 → 자정)라,
   * 해가 떠 있는 초가 곧 낮의 길이다. 하지의 해가 같은 6 초 가운데 더 오래 떠 있다.
   * 옮기는 단계는 자정에 일어난다(해가 지평선 아래). `back` 에서 지나온 길을 지운다.
   */
  timeline: {
    phases: [
      { id: 'winter', duration: 6, ease: 'linear', caption: key('caption.winter') },
      { id: 'toEquinox', duration: 2.2, ease: 'smooth', caption: key('caption.shiftUp') },
      { id: 'equinox', duration: 6, ease: 'linear', caption: key('caption.equinox') },
      { id: 'toSummer', duration: 2.2, ease: 'smooth', caption: key('caption.shiftUp') },
      { id: 'summer', duration: 6, ease: 'linear', caption: key('caption.summer') },
      { id: 'back', duration: 3, ease: 'smooth', caption: key('caption.back') },
    ],
  },

  /** 도착한 순간 동지 해가 이미 떠 있다. */
  startAt: START_AT,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 계절의 원인(공전 · 축 경사)은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-left', offset: [16, -8] },
    align: 'left',
    fontSize: 14,
    fade: 0.3,
    style: { colorRole: 'ink', emphasis: 'medium' },
    wrapWidth: 760,
  },

  // 그리드 · 카메라 단추 없음 — 잴 것이 거리가 아니라 길의 높이와 지평선 위 몫이다.

  messages: seasonalSunPathMessages,
};
