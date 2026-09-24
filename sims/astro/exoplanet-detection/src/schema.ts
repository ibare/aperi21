// ========================================================================
// exoplanet-detection — 선언
// ========================================================================
// 질문: 별빛밖에 받지 못하는 관측자가 어떻게 보이지도 않는 행성을 찾는가.
//
// 행성은 두 흔적을 남기고, 둘은 **같은 주기로 묶여 있다.**
//   · 통과법 — 옆에서 본 궤도에서 행성이 별 앞을 지나면 별빛이 조금 가려진다. 파이는 깊이는
//     면적의 비 (행성 반지름 / 별 반지름)² 로 늘 같고, 한 바퀴마다 되풀이된다.
//   · 시선 속도법 — 행성과 별은 질량 중심을 함께 돈다. 별이 관측자에게서 멀어지면 스펙트럼 선이
//     붉은 쪽으로, 다가오면 푸른 쪽으로 밀린다. 한 바퀴에 한 번 오간다.
// 빛이 파이는 순간(행성이 별 앞)에는 별이 시선에 수직으로 움직여 선이 제자리를 지난다.
//
// 질량비에 따라 두 원의 몫이 바뀌는 것은 `two-body-problem` 이 했다 — 여기서는 되풀이하지 않는다.
// 그림자가 다른 천체에 닿는 것은 `eclipse` 몫이다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:exoplanet-detection` 와 문자 그대로 일치한다 (C4). */
export const EXOPLANET_DETECTION_ID = 'exoplanet-detection';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 별 반지름(월드 단위). */
export const STAR_RADIUS = 0.5;
/** 별 반지름이 행성 반지름의 몇 배인가. 화면에 `1 : {이 값}` 으로 그대로 뜬다. 깊이는 이 값의 제곱분의 1. */
export const STAR_TO_PLANET_RADIUS = 4;
/** 행성 궤도 반지름(월드 단위, 질량 중심에서). */
export const ORBIT_RADIUS = 2.1;
/**
 * 궤도면이 시선에서 기운 정도 — 옆에서 본 궤도 타원의 짧은 반지름 / 긴 반지름. 0 이면 궤도가 한 줄로
 * 보인다. 앞 반(관측자 쪽)이 아래로 내려와, 행성이 별 앞을 지날 때 별 가운데에서 이만큼 비껴 지난다.
 */
export const VIEW_TILT = 0.12;
/**
 * 별 궤도 반지름 / 행성 궤도 반지름 (= 행성 질량 / 별 질량). **과장한 값이다** — 실제 목성 · 해는 약 0.001.
 * 옆모습에서 별이 흔들리는 폭과 선이 밀리는 폭의 원인이다.
 */
export const WOBBLE_RATIO = 0.07;
/** 시간표 한 주기 동안 행성이 도는 바퀴 수. 기록 창이 이만큼의 바퀴를 담는다. 정수라야 주기 끝에서 튀지 않는다. */
export const ORBITS_PER_CYCLE = 2;
/** 주기 첫 순간 행성 자리(도). 0 은 오른쪽 끝, 90 은 별 바로 앞(관측자 쪽), −90 은 별 바로 뒤. */
export const START_ANGLE_DEG = -90;
/** 흡수선이 별이 멈춰 있을 때 놓이는 파장(nm). */
export const REST_NM = 560;
/** 별이 가장 빠르게 멀어질 때 선이 밀리는 폭(nm). **과장한 값이다** — 실제로는 0.0001 nm 쯤이다. */
export const MAX_SHIFT_NM = 16;
/** 스펙트럼 띠의 양 끝 파장(nm). */
export const STRIP_MIN_NM = 460;
export const STRIP_MAX_NM = 660;
/**
 * 밝기 기록의 세로가 담는 밝기 폭(별빛 전체에 대한 몫). 기록 띠 한 칸 높이가 이만큼의 밝기다 —
 * 깊이 1/16 이 띠 높이의 6 할쯤으로 보이게 세로를 키웠다.
 */
export const FLUX_WINDOW = 0.1;

// ------------------------------------------------------------------------
// 배치 — 월드 단위.
// ------------------------------------------------------------------------

/** 옆에서 본 궤도의 질량 중심 자리. */
export const SIDE_CENTER = [0, 1.3] as const;
/** 반지름 비 표시 줄의 높이. */
export const RATIO_ROW_Y = 0.55;
/** 스펙트럼 띠 — 가로는 궤도 폭, 세로 아래 · 위. */
export const STRIP = { x0: -2.3, x1: 2.3, y0: -0.35, y1: 0.05 } as const;
/** 두 기록의 가로 자리(한 주기 = 왼쪽 끝 → 오른쪽 끝). */
export const PLOT = { x0: 3.6, x1: 9.4 } as const;
/** 밝기 기록 — 밝기 1 의 높이와, `FLUX_WINDOW` 만큼의 밝기가 차지하는 높이. */
export const FLUX_PLOT = { top: 1.85, height: 1.0 } as const;
/** 선 자리 기록 — 제자리(0)의 높이와, 가장 크게 밀렸을 때의 높이. */
export const SHIFT_PLOT = { zero: -0.5, amplitude: 0.55 } as const;
/** 캡션 줄의 높이 — 두 판 아래. */
export const CAPTION_Y = -2.05;

/**
 * 프레이밍은 주장의 일부다. 왼쪽은 궤도 타원 끝(± 궤도 반지름 + 행성), 오른쪽은 기록 끝,
 * 위는 밝기 기록 이름, 아래는 캡션. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -2.6, maxX: 9.6, minY: -2.5, maxY: 2.5 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const exoplanetDetectionMessages = Object.freeze({
  'label.title': { ko: '외계행성 탐지', en: 'Detecting exoplanets' },
  'label.stage': { ko: '별과 행성', en: 'Star and planet' },
  'label.view': { ko: '관측', en: 'Observation' },
  /** 값이 끼어드는 조립문이라 문안이다 (C1). */
  'label.radiusRatio': { ko: '반지름 행성 : 별 = 1 : {star}', en: 'radius planet : star = 1 : {star}' },
  'label.flux': { ko: '별빛 밝기', en: 'starlight brightness' },
  'label.shift': { ko: '스펙트럼 선의 자리', en: 'position of the spectral line' },
  'label.red': { ko: '붉은 쪽', en: 'redder' },
  'label.blue': { ko: '푸른 쪽', en: 'bluer' },
  'label.rest': { ko: '제자리', en: 'at rest' },
  /** 깊이 = 면적의 비. 기호라 표식이지만 괄호 · 첨자 모양을 선언에서 바꿀 수 있게 둔다. */
  'label.depth': { ko: '(R행성 / R별)²', en: '(R_planet / R_star)²' },
  /** 주기 기호 — 표식 (C1 판정표 3). */
  'label.period': { ko: 'P', en: 'P' },
  'caption.recede': {
    ko: '행성이 앞으로 돌아오는 동안 별은 반대편에서 관측자에게서 멀어진다 — 선이 붉은 쪽으로 밀린다',
    en: 'While the planet swings round to the front, the star on the far side moves away from us — the line shifts redward',
  },
  'caption.transit': {
    ko: '행성이 별 앞을 지나며 빛을 조금 가린다 — 밝기가 파인다. 이때 별은 옆으로만 움직여 선은 제자리를 지난다',
    en: 'The planet crosses the star and blocks a little light — the brightness dips. The star now moves sideways, so the line passes its rest position',
  },
  'caption.approach': {
    ko: '행성이 별 뒤로 돌아가는 동안 별은 관측자 쪽으로 다가온다 — 선이 푸른 쪽으로 밀린다',
    en: 'While the planet swings round behind, the star moves toward us — the line shifts blueward',
  },
  'caption.recede2': {
    ko: '관측자는 행성을 보지 못한다 — 받는 것은 별빛의 밝기와 선의 자리뿐이다',
    en: 'We never see the planet — all we receive is how bright the starlight is and where its line sits',
  },
  'caption.transit2': {
    ko: '한 바퀴 뒤, 같은 깊이로 다시 파인다 — 선이 제자리를 지나는 바로 그 순간에',
    en: 'One orbit later it dips again, just as deep — at the very moment the line passes its rest position',
  },
  'caption.approach2': {
    ko: '밝기가 파이는 간격과 선이 한 번 오가는 간격이 같다 — 둘 다 행성이 한 바퀴 도는 시간 P',
    en: 'The gap between dips equals one swing of the line — both are the planet’s orbital period P',
  },
} satisfies Record<string, LocalizedText>);

export type ExoplanetDetectionMessageKey = keyof typeof exoplanetDetectionMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: ExoplanetDetectionMessageKey): LocalizedText => exoplanetDetectionMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ExoplanetDetectionMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const exoplanetDetectionSchema: BundleSchema = {
  id: EXOPLANET_DETECTION_ID,
  title: text('label.title'),
  category: 'astro',
  timeModel: 'periodic',

  // 조작기가 없다. 두 흔적이 같은 주기로 묶여 있다는 것은 자동 진행만으로 두 바퀴 안에 드러난다.
  parameters: [],

  stages: [
    {
      id: 'system',
      label: text('label.stage'),
      constants: {
        starRadius: STAR_RADIUS,
        starToPlanetRadius: STAR_TO_PLANET_RADIUS,
        orbitRadius: ORBIT_RADIUS,
        viewTilt: VIEW_TILT,
        wobbleRatio: WOBBLE_RATIO,
        orbitsPerCycle: ORBITS_PER_CYCLE,
        startAngle: START_ANGLE_DEG,
        restNm: REST_NM,
        maxShiftNm: MAX_SHIFT_NM,
        stripMinNm: STRIP_MIN_NM,
        stripMaxNm: STRIP_MAX_NM,
        fluxWindow: FLUX_WINDOW,
      },
    },
  ],

  environments: [],

  views: [{ id: 'observe', label: text('label.view'), default: true }],

  /** 궤도 · 스펙트럼을 왼쪽에, 두 기록을 오른쪽에 나란히 둬 세로를 아낀다 (S-piece — 세로가 비싸다). */
  canvas: { height: 380, minHeight: 330 },

  /**
   * 겹침 순서가 뜻을 갖는다 — 별 뒤를 지나는 행성은 별 **아래**, 별 앞을 지나는 행성은 별 **위**에
   * 그려야 「앞을 지나며 가린다」 가 보인다. 흡수선은 스펙트럼 띠 위에 긋는다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 두 바퀴(`orbitsPerCycle`). 한 바퀴 7.2 초(조각 시계), 1° 에 0.02 초.
   *
   * 행성 각은 주기 안 시각에 비례한다(등속 원 궤도). 단계는 캡션과 재생 속도를 정한다 —
   * `recede`(−90° → 65°, 155°) · `transit`(65° → 115°, 50°) · `approach`(115° → 270°, 155°).
   * 단계 길이를 바꾸면 캡션이 궤도 자리와 어긋난다 — 단계 길이와 궤도의 관계를 선언할 자리가 없다(G129).
   *
   * `transit` 은 느리게 흐른다(`timeScale`) — 별 앞을 지나는 1 초를 눈으로 보게.
   */
  timeline: {
    phases: [
      { id: 'recede', duration: 3.1, caption: key('caption.recede') },
      { id: 'transit', duration: 1.0, timeScale: 0.4, caption: key('caption.transit') },
      { id: 'approach', duration: 3.1, caption: key('caption.approach') },
      { id: 'recede2', duration: 3.1, caption: key('caption.recede2') },
      { id: 'transit2', duration: 1.0, timeScale: 0.4, caption: key('caption.transit2') },
      { id: 'approach2', duration: 3.1, caption: key('caption.approach2') },
    ],
  },

  /** 도착한 순간 이미 돌고 있다 — 행성이 앞으로 돌아오는 중. 쌓는 상태가 없어 `preroll` 은 쓰지 않는다. */
  startAt: 1,

  // 슬롯 하나. 두 판 아래 전체 폭에 세운다 — 왼쪽 판 아래에 좁게 두면 세 줄로 늘어 기록 이름표와 겹쳤다.
  caption: {
    anchor: { world: [STRIP.x0, CAPTION_Y] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 600,
    fade: 0.3,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것은 거리가 아니라 두 기록의 **간격**이고, 그 간격은
   * 같은 길이의 치수선 둘이 말한다.
   */

  messages: exoplanetDetectionMessages,
};
