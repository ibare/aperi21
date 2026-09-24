// ========================================================================
// supernova-and-neutron-star — 선언
// ========================================================================
// 질문: 무거운 별의 최후에 중심에서는 무슨 일이 일어나는가.
//
// 철 핵은 더 태울 것이 없어 핵을 받치던 압력을 잃는다. 1 초도 안 되어 지구만 한
// 철 핵이 도시만 한 크기(약 20 km)로 무너지고, 그 위로 쏟아져 들어오던 바깥층이
// 단단해진 핵(중성자 덩어리)에 부딪쳐 튕겨 나온다. 튕김이 만든 충격파가 바깥으로
// 번지며 별을 날려 보내고, 한가운데에 작고 빽빽한 중성자별이 남는다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:supernova-and-neutron-star` 와 문자 그대로 일치한다 (C4). */
export const SUPERNOVA_AND_NEUTRON_STAR_ID = 'supernova-and-neutron-star';

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const supernovaAndNeutronStarMessages = Object.freeze({
  'label.title': { ko: '초신성과 중성자별', en: 'Supernova and neutron star' },
  'label.stage': { ko: '무거운 별의 철 핵', en: 'Iron core of a massive star' },
  'label.view': { ko: '중심 부근의 단면', en: 'Cross-section near the core' },
  /** 무너지기 전 핵의 이름표. 조사가 붙는 문장이라 문안이다 (C1 판정 4). */
  'label.ironCore': { ko: '철 핵 · 지구만 한 크기', en: 'Iron core · about the size of Earth' },
  /** 무너진 뒤 남는 점선 고리 — 처음 핵의 크기. */
  'label.formerCore': { ko: '무너지기 전 철 핵', en: 'Iron core before collapse' },
  'label.neutronStar': { ko: '중성자별', en: 'Neutron star' },
  /** 값은 스테이지 상수를 그대로 끼운다 (S-piece 유효숫자). */
  'label.neutronStarSize': {
    ko: '지름 약 {d} km · 태양 질량의 {m}배',
    en: 'About {d} km across · {m} solar masses',
  },
  'label.neutronStarScale': {
    ko: '보이게 하려고 {k}배 키워 그렸다',
    en: 'Drawn {k}× larger so it can be seen',
  },
  'caption.idle': {
    ko: '철 핵은 더 태울 것이 없다 — 핵융합이 멈추고 핵을 받치던 압력이 사라진다',
    en: 'The iron core has nothing left to burn — fusion stops and the pressure holding it up is gone',
  },
  'caption.collapse': {
    ko: '받침을 잃은 철 핵이 1 초도 안 되어 도시만 한 크기로 무너진다 (아주 느리게 보임)',
    en: 'With nothing holding it up, the iron core collapses to the size of a city in under a second (shown in slow motion)',
  },
  'caption.bounce': {
    ko: '쏟아져 들어오던 바깥층이 단단해진 핵에 부딪쳐 튕겨 나온다',
    en: 'The outer layers pouring in slam into the now-rigid core and bounce back out',
  },
  'caption.blast': {
    ko: '튕김이 만든 충격파가 바깥으로 번지며 별을 날려 보낸다',
    en: 'The shock wave from the bounce spreads outward and blows the star apart',
  },
  'caption.remain': {
    ko: '한가운데에 작고 빽빽한 중성자별이 남는다',
    en: 'A small, extremely dense neutron star is left at the center',
  },
} satisfies Record<string, LocalizedText>);

export type SupernovaAndNeutronStarMessageKey = keyof typeof supernovaAndNeutronStarMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: SupernovaAndNeutronStarMessageKey): LocalizedText =>
  supernovaAndNeutronStarMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: SupernovaAndNeutronStarMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값 (원칙 2). 코드는 키와 기본값만 갖는다.
// ------------------------------------------------------------------------

/** 무너지기 전 철 핵의 지름(km). 지구(약 12700 km)만 하다. */
export const CORE_DIAMETER_KM = 12000;
/** 무너진 뒤 중성자별의 지름(km). 도시 하나 크기다. */
export const NS_DIAMETER_KM = 20;
/** 중성자별의 질량(태양 질량). 이만한 질량이 도시 크기에 담긴다 — 「빽빽하다」 의 근거. */
export const NS_MASS_SOLAR = 1.4;
/**
 * 중성자별을 그릴 때 키우는 배율. 축척 그대로면 철 핵 반지름의 1/600 이라 화면에서
 * 1 px 도 되지 않는다. 과장한 배율을 숨기지 않고 화면 이름표로 밝힌다.
 */
export const NS_ENLARGE = 60;
/** 핵을 둘러싼 물질 덩이 수 · 흩뿌리는 시드. 같은 시드는 같은 화면이다 (S-sim). */
export const PARCEL_COUNT = 380;
export const PARCEL_SEED = 1054;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 화면은 철 핵 둘레만 담는다. 별의 겉면은 이보다 훨씬 멀어 화면 밖이다.
// ------------------------------------------------------------------------

export const LAYOUT = {
  /** 핵의 중심. 아래 캡션 자리를 비우려고 조금 올렸다. */
  center: [0, 0.25] as const,
  /** 무너지기 전 철 핵의 반지름(월드). 이것이 `CORE_DIAMETER_KM` 에 해당한다. */
  coreRadius: 0.9,
  /** 물질 덩이를 흩뿌리는 바깥 반지름 — 화면 모서리 너머까지 채워 「별은 화면 밖으로 이어진다」. */
  fieldRadius: 6.2,
  /** 튕김 단계가 끝날 때 충격파의 반지름. */
  shockBounceRadius: 1.9,
  /** 날려 보냄 단계가 끝날 때 충격파의 반지름 — 뒤따르는 덩이까지 모두 화면 밖으로 나간다. */
  shockOutRadius: 9.5,
  /**
   * 충격파 뒤에 밀려 나가는 덩이의 자리 = 충격파 반지름 × [이 값, 1). 두께 있는 껍질로
   * 밀려 나간다 — 모두 한 원에 붙으면 덩이가 아니라 선으로 읽힌다.
   */
  shellBehindMin: 0.72,
} as const;

/**
 * 프레이밍은 주장의 일부다. 가로로 넓게 두어 튕겨 나가는 덩이가 사방으로 퍼지는 것이
 * 보이고, 세로는 핵 지름에 아래 캡션 한 줄을 더한 만큼이다. 매 프레임 같은 값이다.
 * 튕겨 나간 껍질은 화면 밖으로 나가도 된다.
 */
export const SCENE_BOUNDS = { minX: -4.6, maxX: 4.6, minY: -2.05, maxY: 2.35 } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이(조각 시계 초)와 재생 속도
// ------------------------------------------------------------------------

/** 한 주기의 처음 — 핵과 둘레 물질이 나타난다. */
export const APPEAR = 0.6;
/** 핵융합이 멈춘 핵을 보는 동안. */
export const IDLE = 1.4;
/**
 * 무너짐. 실제로 0.1 ~ 0.3 초 걸리는 일이라 조각 시계로 0.25 초를 두고 열 배 느리게
 * 흘린다(화면 2.5 초).
 */
export const COLLAPSE = 0.25;
export const COLLAPSE_TIME_SCALE = 0.1;
/** 튕김 — 수십 밀리초. 서른 배 느리게(화면 약 2 초). */
export const BOUNCE = 0.06;
export const BOUNCE_TIME_SCALE = 0.03;
/** 날려 보냄 — 충격파가 화면(핵 둘레 수만 km)을 벗어나는 동안. 세 배 느리게. */
export const BLAST = 1;
export const BLAST_TIME_SCALE = 0.33;
/** 충격파가 화면을 벗어난 뒤 중성자별 이름표가 나타나는 동안 · 남은 중성자별을 보는 동안 · 흐려지는 동안. */
export const REVEAL = 0.6;
export const REMAIN = 3.2;
export const FADE = 0.8;

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const supernovaAndNeutronStarSchema: BundleSchema = {
  id: SUPERNOVA_AND_NEUTRON_STAR_ID,
  title: text('label.title'),
  category: 'astro',
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 핵이 무너지고, 튕기고, 중성자별이 남고, 다시 처음부터.
  parameters: [],

  stages: [
    {
      id: 'iron-core',
      label: text('label.stage'),
      constants: {
        coreDiameterKm: CORE_DIAMETER_KM,
        nsDiameterKm: NS_DIAMETER_KM,
        nsMassSolar: NS_MASS_SOLAR,
        nsEnlarge: NS_ENLARGE,
        parcelCount: PARCEL_COUNT,
        parcelSeed: PARCEL_SEED,
      },
    },
  ],

  environments: [],

  views: [{ id: 'core-section', label: text('label.view'), default: true }],

  /** 가로로 넓고 세로로 좁다 — 세로가 비싸다 (S-piece). */
  canvas: { height: 420, minHeight: 360 },

  /**
   * 겹침이 판정 장치다 — 물질 덩이가 맨 아래, 그 위에 핵 · 충격파, 이름표가 맨 위.
   * 층 순서로는 `body`(핵)가 덩이 아래로 깔리는지 보장되지 않는다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 나타남 → 멈춘 핵 → 무너짐 → 튕김 → 날려 보냄 → 이름표 → 남음 → 흐려짐.
   * 무너짐 · 튕김 · 날려 보냄은 실제로 1 초 남짓의 일이라 `timeScale` 로 늦춘다.
   * 튕김 · 날려 보냄은 충격파가 고르게 번지도록 `linear` 다 — physics 가 이 단계 동안의
   * 충격파 속력을 진행도의 기울기로 셈한다.
   */
  timeline: {
    phases: [
      { id: 'appear', duration: APPEAR, ease: 'smooth', caption: key('caption.idle') },
      { id: 'idle', duration: IDLE, caption: key('caption.idle') },
      {
        id: 'collapse',
        duration: COLLAPSE,
        timeScale: COLLAPSE_TIME_SCALE,
        caption: key('caption.collapse'),
      },
      {
        id: 'bounce',
        duration: BOUNCE,
        timeScale: BOUNCE_TIME_SCALE,
        caption: key('caption.bounce'),
      },
      {
        id: 'blast',
        duration: BLAST,
        timeScale: BLAST_TIME_SCALE,
        caption: key('caption.blast'),
      },
      { id: 'reveal', duration: REVEAL, ease: 'smooth', caption: key('caption.remain') },
      { id: 'remain', duration: REMAIN, caption: key('caption.remain') },
      { id: 'fade', duration: FADE, caption: key('caption.remain') },
    ],
  },

  /**
   * 도착한 순간 이미 진행 중이다 — 멈춘 핵을 잠깐 보고(화면 약 0.8 초) 곧 무너지기
   * 시작하는 자리에서 연다.
   */
  startAt: 1.2,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 정의와 공식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -6] },
    fontSize: 13,
    wrapWidth: 720,
    // 페이드는 조각 시계로 센다 — 서른 배 늦춘 튕김 단계에서 0.25 초 페이드가 화면 8 초가 되어
    // 튕김 캡션이 끝까지 옅었다. 바로 바꾼다 (NOTES (c) 새 부족 N1).
    fade: 0,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것이 거리가 아니다 — 크기 비는 이름표가
   * 선언값으로 말한다.
   */

  messages: supernovaAndNeutronStarMessages,
};
