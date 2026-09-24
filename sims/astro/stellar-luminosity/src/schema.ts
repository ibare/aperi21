// ========================================================================
// stellar-luminosity — 선언
// ========================================================================
// 질문: 하늘에서 똑같이 밝아 보이는 두 별은 정말 같은 별인가.
//
// 왼쪽 하늘 판에서 두 별은 똑같이 밝다. 오른쪽 옆모습에서 두 별은 지구에서 10 광년 ·
// 30 광년 떨어져 있다. 지구가 받은 빛 한 조각을 **별을 둘러싼 공 전체에** 깔고(공의
// 반지름 = 거리), 그 빛을 모두 별로 되모으면 먼 별의 빛이 아홉 배다 — 받은 밝기에
// 4πd² 를 곱해 되짚은 것이 광도다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:stellar-luminosity` 와 문자 그대로 일치한다 (C4). */
export const STELLAR_LUMINOSITY_ID = 'stellar-luminosity';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 가까운 별까지의 거리(광년). */
export const D_NEAR = 10;
/** 먼 별까지의 거리(광년). */
export const D_FAR = 30;
/** 가까운 별의 광도(태양 광도 L☉). */
export const L_NEAR = 1;
/** 먼 별의 광도(L☉). 거리가 세 배라 광도가 아홉 배여야 하늘에서 똑같이 밝다. */
export const L_FAR = 9;
/**
 * 가까운 별에서 지구에 닿는 빛의 세기 — **빛 채널 값**(0~1, 선형광). 모은 빛은 세기 1 로 칠하므로,
 * 공 넓이 × 이 값 = 모은 원판 넓이 × 1 이다. 너무 작으면 우주 판 위에서 공이 보이지 않고, 너무 크면
 * 모은 원판이 공만큼 커서 「되모은다」 가 보이지 않는다.
 */
export const RECEIVED = 0.1;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 왼쪽이 하늘 판, 오른쪽이 옆모습(우주 판).
// ------------------------------------------------------------------------

/** 옆모습의 축척 — 1 광년이 월드 몇 단위인가. 30 광년 공이 우주 판 안에 들어가게. */
export const WORLD_PER_LY = 0.11;
/** 지구의 자리. 가까운 별은 왼쪽, 먼 별은 오른쪽 — 두 공이 지구에서 맞닿는다. */
export const EARTH_POS: readonly [number, number] = [0, 0];

/** 우주 판(옆모습 · 빛 없음) — 왼쪽 아래 · 오른쪽 위 모서리. 먼 별의 공(반지름 3.3)이 들어간다. */
export const SPACE_MIN: readonly [number, number] = [-2.55, -3.5];
export const SPACE_MAX: readonly [number, number] = [6.85, 3.5];
/** 하늘 판(지구에서 올려다본 하늘) — 왼쪽 아래 · 오른쪽 위 모서리. */
export const SKY_MIN: readonly [number, number] = [-6.9, -1.3];
export const SKY_MAX: readonly [number, number] = [-3.2, 1.3];
/** 하늘 판 안 두 별의 자리. 가까운 별이 왼쪽 — 옆모습과 같은 쪽이다. */
export const SKY_NEAR_POS: readonly [number, number] = [-6.0, 0.25];
export const SKY_FAR_POS: readonly [number, number] = [-4.1, -0.2];

/** 별 이름표의 높이 — 우주 판 위 · 하늘 판 위 테마 바탕. */
export const NAME_Y = 3.85;
/** 하늘 판 제목 · 별 이름표의 높이. */
export const SKY_TITLE_Y = 1.65;
export const SKY_NAME_Y = -1.65;
/** 거리 치수선의 높이 — 우주 판 아래 테마 바탕. */
export const DIM_Y = -4.2;

/**
 * 프레이밍은 주장의 일부다. 가로는 하늘 판 왼쪽부터 먼 별의 공 오른쪽까지, 세로는 별 이름표부터
 * 치수선 · 캡션 줄까지. 매 프레임 같은 값이다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: -7.1, maxX: 7.05, minY: -5.0, maxY: 4.15 } as const;

// ------------------------------------------------------------------------
// 시간표
// ------------------------------------------------------------------------

/** 하늘에서 두 별이 같다는 것을 읽는 동안(초). */
export const SAME = 3;
/** 거리가 드러나는 동안(초). */
export const DISTANCE = 2.5;
/** 받은 빛을 공 전체에 까는 동안(초)과 깔린 공을 보는 동안. */
export const SPREAD = 3;
export const SPREAD_HOLD = 1.5;
/** 공의 빛을 별로 되모으는 동안(초). */
export const GATHER = 2.5;
/** 되짚은 광도를 보는 동안(초). */
export const REVEAL = 4;
/** 처음 화면으로 돌아가는 동안(초). */
export const BACK = 1.5;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const stellarLuminosityMessages = Object.freeze({
  'label.title': { ko: '광도', en: 'Luminosity' },
  'label.operation': { ko: '별이 실제로 내는 빛의 양', en: 'How much light a star actually gives off' },
  'label.stage': { ko: '똑같이 밝아 보이는 두 별', en: 'Two stars that look equally bright' },
  'label.view': { ko: '하늘과 옆모습', en: 'Sky and side view' },
  'label.sky': { ko: '하늘에서', en: 'In the sky' },
  'label.near': { ko: '가까운 별', en: 'Near star' },
  'label.far': { ko: '먼 별', en: 'Far star' },
  'label.earth': { ko: '지구', en: 'Earth' },
  'label.received': { ko: '지구가 받는 빛', en: 'Light reaching Earth' },
  /** 거리 — 값과 단위. 광년은 언어마다 다르게 쓴다 (C1 판정 4). */
  'label.distance': { ko: '{d} 광년', en: '{d} ly' },
  /** 되짚은 광도 — 값과 태양 광도 기호. 기호는 표식이다 (C1 판정 3). */
  'label.luminosity': { ko: '광도 {l} L☉', en: 'luminosity {l} L☉' },
  'caption.same': {
    ko: '하늘에서 두 별은 똑같이 밝다 — 지구에 닿는 빛의 양이 같다',
    en: 'In the sky the two stars look equally bright — the same amount of light reaches Earth from each',
  },
  'caption.distance': {
    ko: '그런데 두 별까지의 거리가 다르다',
    en: 'But the two stars are at different distances',
  },
  'caption.spread': {
    ko: '별빛은 별을 둘러싼 공 전체에 지구가 받는 만큼씩 퍼져 있다 — 먼 별의 공이 훨씬 넓다',
    en: "Each star's light is spread over a whole sphere, every patch getting what Earth gets — the far star's sphere is much larger",
  },
  'caption.gather': {
    ko: '공 전체에 퍼진 빛을 별로 되모은다',
    en: 'Gather the light from the whole sphere back into the star',
  },
  'caption.reveal': {
    ko: '똑같이 밝아 보이던 먼 별이 실제로는 훨씬 많은 빛을 내는 별이다',
    en: 'The far star that looked just as bright actually gives off far more light',
  },
} satisfies Record<string, LocalizedText>);

export type StellarLuminosityMessageKey = keyof typeof stellarLuminosityMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: StellarLuminosityMessageKey): LocalizedText => stellarLuminosityMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: StellarLuminosityMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const stellarLuminositySchema: BundleSchema = {
  id: STELLAR_LUMINOSITY_ID,
  label: text('label.title'),
  category: 'astro',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 받은 빛을 공에 깔고, 되모으고, 다시 처음으로 돌아간다.
  parameters: [],

  stages: [
    {
      id: 'two-stars',
      label: text('label.stage'),
      constants: { dNear: D_NEAR, dFar: D_FAR, lNear: L_NEAR, lFar: L_FAR, received: RECEIVED },
    },
  ],

  environments: [],

  views: [{ id: 'sky-side', label: text('label.view'), default: true }],

  /**
   * 먼 별의 공(지름 = 60 광년)이 세로를 정한다. 360 이면 가까운 별의 공이 지름 80 px 남짓으로 줄어
   * 되모은 원판이 점처럼 보인다 — 세로가 비싸지만 두 원판의 넓이가 견줘져야 주장이 선다.
   */
  canvas: { height: 400, minHeight: 340 },

  /**
   * 겹침이 판정 장치다. 공 · 모은 빛은 우주 판 **위**, 지구가 받는 빛 조각은 공 위에 놓여야 한다 —
   * 층 순서로는 `region`(매질)이 `sector` 위로 올라와 판이 공을 덮는다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 같아 보임 → 거리 → 공에 깔기 → 봄 → 되모으기 → 광도 → 되돌아감.
   * 캡션은 지금 화면에서 벌어지는 일만 말한다 — 4πd² · 역제곱 법칙은 문단의 몫이다.
   */
  timeline: {
    phases: [
      { id: 'same', duration: SAME, caption: key('caption.same') },
      { id: 'distance', duration: DISTANCE, ease: 'smooth', caption: key('caption.distance') },
      { id: 'spread', duration: SPREAD, ease: 'smooth', caption: key('caption.spread') },
      { id: 'spread-hold', duration: SPREAD_HOLD, caption: key('caption.spread') },
      { id: 'gather', duration: GATHER, ease: 'inOutCubic', caption: key('caption.gather') },
      { id: 'reveal', duration: REVEAL, caption: key('caption.reveal') },
      { id: 'back', duration: BACK, ease: 'smooth', caption: key('caption.reveal') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — 똑같이 밝은 두 별을 2 초쯤 보고 곧 거리가 드러난다. */
  startAt: 1,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    fade: 0.3,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  messages: stellarLuminosityMessages,
};
