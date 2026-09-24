// ========================================================================
// star-color-temperature — 선언
// ========================================================================
// 질문: 별의 색은 무엇이 정하는가 — 왜 뜨거운 별은 푸르고 차가운 별은 붉은가.
//
// 왼쪽 밤하늘에 별 하나, 오른쪽에 그 별이 내는 빛의 파장별 세기(흑체 복사 곡선).
// 온도가 오르면 곡선의 봉우리가 짧은 파장 쪽으로 옮겨 가고, 가시광 띠에 걸린
// 몫이 붉은 쪽이 많은 모양 → 고른 모양 → 푸른 쪽이 많은 모양으로 바뀐다.
// 별의 색은 바로 그 띠 안의 빛을 섞은 색이다 (플랑크 스펙트럼 → 빛의 색).
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:star-color-temperature` 와 문자 그대로 일치한다 (C4). */
export const STAR_COLOR_TEMPERATURE_ID = 'star-color-temperature';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 차가운 별의 표면 온도(K). 봉우리가 적외선 쪽 가시광 밖에 있다. */
export const T_COOL = 3000;
/** 가운데 별의 표면 온도(K). 봉우리가 가시광 띠 안에 든다. */
export const T_MID = 6000;
/** 뜨거운 별의 표면 온도(K). 봉우리가 자외선 쪽 가시광 밖으로 넘어간다. */
export const T_HOT = 20000;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 왼쪽이 밤하늘 판, 오른쪽이 파장 축.
// ------------------------------------------------------------------------

/** 파장 축의 오른쪽 끝(nm). 가장 차가운 별(3000 K)의 봉우리 966 nm 와 그 너머 꼬리가 들어간다. */
export const NM_MAX = 1600;
/** 파장 축이 시작하는 월드 x 와 축 길이(월드). */
export const GRAPH_X0 = 0.8;
export const GRAPH_W = 10;
/** 곡선 봉우리의 높이(월드). 온도마다 봉우리를 같은 높이로 맞춘다 — 색은 모양이 정한다. */
export const PEAK_H = 3.4;
/** 세로축 윗끝(월드). */
export const AXIS_TOP = 3.7;
/** 띠 이름(자외선 · 가시광 · 적외선)이 놓이는 높이. */
export const BAND_LABEL_Y = 4.0;
/** 축 아래 무지개 띠의 두께(월드). 곡선이 낮은 자리에서도 가시광 구간이 어디인지 보이게. */
export const STRIP_H = 0.2;
/** 파장 눈금 이름표의 높이. */
export const TICK_LABEL_Y = -0.55;
/** 파장 눈금(nm)과 그 이름표 키. */
export const WAVELENGTH_TICKS: readonly { nm: number; key: StarColorTemperatureMessageKey }[] = [
  { nm: 500, key: 'tick.500' },
  { nm: 1000, key: 'tick.1000' },
  { nm: 1500, key: 'tick.1500' },
];

/** 밤하늘 판(빛 없음) — 왼쪽 아래 · 오른쪽 위 모서리. */
export const SKY_MIN: readonly [number, number] = [-4.6, 0];
export const SKY_MAX: readonly [number, number] = [-0.4, 3.8];
/** 별의 자리와 반지름(월드). 후광이 반지름의 세 배라 판 안에 들어가게 잡는다. */
export const STAR_POS: readonly [number, number] = [-2.5, 1.9];
export const STAR_R = 0.6;
/** 온도 글자의 높이 — 판 아래 테마 바탕 위. */
export const TEMP_LABEL_Y = -0.55;

/**
 * 프레이밍은 주장의 일부다. 가로는 밤하늘 판 왼쪽부터 1600 nm 너머까지, 세로는 눈금 이름표 ·
 * 캡션 줄부터 띠 이름 위까지. 매 프레임 같은 값이다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: -4.9, maxX: 11.1, minY: -1.6, maxY: 4.35 } as const;

// ------------------------------------------------------------------------
// 시간표
// ------------------------------------------------------------------------

/** 한 온도에 머물며 곡선 · 별을 읽는 동안(초). */
export const HOLD = 3.5;
/** 온도를 올리는 동안(초). */
export const RAMP = 3;
/** 다시 식어 처음으로 돌아가는 동안(초). */
export const RETURN = 2.5;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const starColorTemperatureMessages = Object.freeze({
  'label.title': { ko: '별의 색과 표면 온도', en: 'Star color and surface temperature' },
  'label.operation': {
    ko: '표면 온도가 정하는 별빛의 색',
    en: 'How surface temperature sets the color of starlight',
  },
  'label.stage': { ko: '세 별', en: 'Three stars' },
  'label.view': { ko: '별과 스펙트럼', en: 'Star and spectrum' },
  /** 띠 이름. 조사가 붙지 않는 한 낱말이지만 분야 원어 약자가 아니라 언어마다 다르다 — 문안. */
  'label.uv': { ko: '자외선', en: 'UV' },
  'label.visible': { ko: '가시광', en: 'visible' },
  'label.ir': { ko: '적외선', en: 'IR' },
  'label.peak': { ko: '봉우리', en: 'peak' },
  /** 온도 — 값과 단위 기호. 단위는 표식이다 (C1 판정 3). */
  'label.temperature': { ko: '{t} K', en: '{t} K' },
  /** 파장 눈금. 수와 단위 기호뿐인 표식이다. */
  'tick.500': { ko: '500 nm', en: '500 nm' },
  'tick.1000': { ko: '1000 nm', en: '1000 nm' },
  'tick.1500': { ko: '1500 nm', en: '1500 nm' },
  'caption.cool': {
    ko: '봉우리는 가시광 밖 적외선 쪽에 있고, 가시광 띠에는 붉은 쪽 빛이 더 많다 — 섞이면 붉은 주황빛이다',
    en: 'The peak sits out in the infrared; inside the visible band there is more red light — mixed, it glows reddish orange',
  },
  'caption.heat': {
    ko: '온도가 오르자 봉우리가 짧은 파장 쪽으로 옮겨 가고 별빛의 색도 따라 바뀐다',
    en: 'As the temperature rises the peak moves toward shorter wavelengths, and the starlight changes color with it',
  },
  'caption.mid': {
    ko: '봉우리가 가시광 띠 안에 들어와 띠가 고르게 채워진다 — 섞이면 희다',
    en: 'The peak is inside the visible band and fills it evenly — mixed, it looks white',
  },
  'caption.hot': {
    ko: '봉우리는 자외선 쪽으로 넘어갔고, 가시광 띠에는 푸른 쪽 빛이 더 많다 — 섞이면 푸른빛이다',
    en: 'The peak has crossed into the ultraviolet; the visible band now holds more blue light — mixed, it glows bluish',
  },
  'caption.back': {
    ko: '식으면 봉우리가 긴 파장 쪽으로 돌아가고 별은 다시 붉은 주황빛이 된다',
    en: 'As it cools the peak slides back to longer wavelengths and the star turns reddish orange again',
  },
} satisfies Record<string, LocalizedText>);

export type StarColorTemperatureMessageKey = keyof typeof starColorTemperatureMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: StarColorTemperatureMessageKey): LocalizedText => starColorTemperatureMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: StarColorTemperatureMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const starColorTemperatureSchema: BundleSchema = {
  id: STAR_COLOR_TEMPERATURE_ID,
  label: text('label.title'),
  category: 'astro',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 온도가 오르고, 머물고, 다시 식는다.
  parameters: [],

  stages: [
    {
      id: 'three-stars',
      label: text('label.stage'),
      constants: { tCool: T_COOL, tMid: T_MID, tHot: T_HOT },
    },
  ],

  environments: [],

  views: [{ id: 'star-spectrum', label: text('label.view'), default: true }],

  /** 가로로 넓은 그림이다. 세로를 더 주면 가로가 먼저 차서 그림만 작아진다 (S-piece — 세로가 비싸다). */
  canvas: { height: 360, minHeight: 320 },

  /**
   * 겹침이 판정 장치다. 가시광 칠 · 띠 밖 몫은 곡선 **아래** 로 깔려야 곡선이 그 윗변으로 읽히고,
   * 층 순서로는 `region` 이 선 위로 올라온다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 차가운 별 → 오름 → 가운데 별 → 오름 → 뜨거운 별 → 식음.
   * 온도는 로그로 옮겨 간다 — 3000 → 6000 → 20000 K 는 두 걸음 모두 곱으로 크다.
   */
  timeline: {
    phases: [
      { id: 'cool', duration: HOLD, caption: key('caption.cool') },
      { id: 'warm', duration: RAMP, ease: 'smooth', caption: key('caption.heat') },
      { id: 'mid', duration: HOLD, caption: key('caption.mid') },
      { id: 'heat', duration: RAMP, ease: 'smooth', caption: key('caption.heat') },
      { id: 'hot', duration: HOLD, caption: key('caption.hot') },
      { id: 'back', duration: RETURN, ease: 'smooth', caption: key('caption.back') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — 차가운 별을 1 초 남짓 보고 곧 온도가 오르기 시작한다. */
  startAt: 2.4,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 흑체 복사 · 빈 법칙의 정의는 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    fade: 0.3,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  messages: starColorTemperatureMessages,
};
