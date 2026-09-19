// ========================================================================
// rayleigh-scattering — 선언
// ========================================================================
// 질문: 하늘은 왜 파랗고 노을은 왜 붉은가.
//
// 왼쪽 — 공기가 흩뜨리는 몫을 파장마다 막대로 세운다. 파랑(450 nm) 막대가
// 빨강(700 nm) 막대의 약 5.9배다. 막대 끝은 1/λ⁴ 곡선 위에 앉는다.
//
// 오른쪽 — 대기 단면. 해가 머리 위에 있으면 햇빛이 얇은 공기층을 짧게 지나
// 파랑이 조금 흩어지고(하늘이 파랗다) 눈에 닿는 빛은 거의 희다. 해가 지평선으로
// 내려가면 길이 길어져 앞쪽에서 파랑이 다 흩어지고, 끝에 남은 빛이 붉다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:rayleigh-scattering` 와 문자 그대로 일치한다 (C4). */
export const RAYLEIGH_SCATTERING_ID = 'rayleigh-scattering';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 파랑 · 빨강 파장(nm). */
export const LAMBDA_BLUE = 450;
export const LAMBDA_RED = 700;
/**
 * 파랑이 빨강보다 더 흩어지는 배수 — **화면에 띄우는 정박값**이다. 막대 높이는
 * (700/450)⁴ = 5.86 을 계산해 그리고, 글자는 이 선언값을 쓴다 (S-piece 유효숫자, NOTES (c) G143).
 */
export const BLUE_RATIO = 5.9;
/**
 * 공기층을 곧장 위로 지날 때 파랑(450 nm)이 받는 광학 깊이. 다른 파장은 (450/λ)⁴ 배다.
 * 머리 위 해의 빛에서 파랑이 조금만 빠지도록(거의 흰빛) 잡았다.
 */
export const TAU_BLUE = 0.7;
/**
 * 지구 반지름을 공기층 두께 단위로 — **줄인 값이다.** 실제는 약 800 이라 지평선 길이
 * 공기층의 약 38배지만, 그대로 그리면 한낮 길이 선 한 줄이 된다. 112 로 줄여 지평선 길이
 * 정확히 √(2·112+1) = 15배가 되게 했다 (NOTES (b)).
 */
export const EARTH_RADIUS = 112;
/**
 * 공기층 두께 하나가 차지하는 월드 길이 — **표시 배율**이다. 지평선 길 15배가 단면 판
 * 가로에 들어가도록 잡았다.
 */
export const AIR_WORLD = 0.5;
/** 해 질 녘 천정각(°). 해가 머리 위(0°)에서 여기까지 내려간다. */
export const SUNSET_DEG = 90;
/** 하늘(공기층)에 까는 흩어진 빛의 밝기 0~1. 바탕 빛이라 옅다. */
export const SKY_GLOW = 0.32;
/** 흩어지는 획의 방향을 뽑는 난수 시드 (같은 시각은 같은 화면). */
export const SEED = 7;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 오른쪽 대기 단면에서 공기층 두께가 1 이다.
// ------------------------------------------------------------------------

/** 왼쪽 그래프 — 파장 축의 범위(nm)와 그것이 놓이는 월드 x. */
export const AXIS_NM: readonly [number, number] = [430, 720];
export const GRAPH_X0 = -7.6;
export const GRAPH_X1 = -2.8;
/** 그래프 바닥선(흩어짐 0)의 월드 y 와 배수 1 이 차지하는 높이. */
export const GRAPH_Y0 = -1.1;
export const RATIO_UNIT = 0.4;
/** 세로축 윗끝(월드 y). 곡선의 가장 높은 자리(430 nm)를 넘는다. */
export const GRAPH_TOP = 1.95;
/** 막대 폭(월드). */
export const BAR_W = 0.42;

/** 관찰자(지면 위 눈) 자리. 지구 중심은 바로 아래 `EARTH_RADIUS` 만큼. */
export const OBSERVER_X = 0.4;
export const OBSERVER_Y = -0.3;
/** 대기 단면 판(빛 없음 바탕)의 사각형. */
export const PANEL_X0 = -1.2;
export const PANEL_X1 = 9.2;
export const PANEL_Y0 = -2.0;
export const PANEL_Y1 = 1.55;
/** 공기층 꼭대기에서 해까지 띄우는 거리 · 해 반지름(월드). */
export const SUN_GAP = 0.5;
export const SUN_R = 0.24;
/** 눈에 닿은 빛 원판 — 관찰자 아래로 내린 거리 · 반지름(월드). */
export const EYE_DISC_DROP = 0.72;
export const EYE_DISC_R = 0.3;

/** 고정 경계. 그래프 이름표부터 지평선의 해까지, 아래는 캡션 줄까지. */
export const SCENE_BOUNDS = { minX: -8.35, maxX: 9.35, minY: -2.6, maxY: 2.4 } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이(초)
// ------------------------------------------------------------------------

export const GROW = 1.6;
export const BARS = 2.6;
export const TRAVEL = 1.4;
export const NOON = 2.8;
export const SINK = 4.2;
export const SUNSET = 3.4;
export const FADE = 0.8;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const rayleighScatteringMessages = Object.freeze({
  'label.title': { ko: '레일리 산란', en: 'Rayleigh scattering' },
  'label.operation': { ko: '파장 4제곱에 반비례하는 산란', en: 'Scattering that falls with the fourth power of wavelength' },
  'label.stage': { ko: '햇빛과 공기', en: 'Sunlight and air' },
  'label.view': { ko: '막대와 대기 단면', en: 'Bars and a slice of sky' },
  /** 파장 눈금. 값만 끼우고 단위는 표식이다 (C1 판정 3). */
  'label.nm': { ko: '{nm} nm', en: '{nm} nm' },
  /** 막대 위 배수. 선언한 정박값을 끼운다. */
  'label.ratio': { ko: '×{x}', en: '×{x}' },
  /** 기준 막대(빨강)의 배수 — 기준이라 1 이다. 표식. */
  'label.ratioOne': { ko: '×1', en: '×1' },
  'label.axisY': { ko: '흩어지는 몫', en: 'scattered' },
  'label.eye': { ko: '눈에 닿은 빛', en: 'light at the eye' },
  'caption.grow': {
    ko: '공기가 흩뜨리는 몫 — 파랑 {b} nm 과 빨강 {r} nm 의 막대가 자란다',
    en: 'How much the air scatters — bars for blue {b} nm and red {r} nm rise',
  },
  'caption.bars': {
    ko: '파란 막대가 빨간 막대의 {x}배 높이다',
    en: 'The blue bar stands {x} times as tall as the red one',
  },
  'caption.travel': {
    ko: '해가 머리 위에 있다 — 햇빛이 얇은 공기층을 곧장 내려온다',
    en: 'The sun is overhead — sunlight comes straight down through a thin layer of air',
  },
  'caption.noon': {
    ko: '짧은 길에서 옆으로 흩어진 빛은 파랗고, 눈에 닿은 빛은 거의 희다',
    en: 'Light scattered sideways on the short path is blue; the light at the eye is nearly white',
  },
  'caption.sink': {
    ko: '해가 낮아진다 — 빛이 지나는 공기의 길이 길어진다',
    en: 'The sun sinks — the path the light takes through the air grows longer',
  },
  'caption.sunset': {
    ko: '길 앞쪽에서 파랑이 다 흩어져 나갔고, 눈에 닿은 빛은 붉다',
    en: 'The blue has all scattered out along the front of the path; the light at the eye is red',
  },
} satisfies Record<string, LocalizedText>);

export type RayleighScatteringMessageKey = keyof typeof rayleighScatteringMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: RayleighScatteringMessageKey): LocalizedText => rayleighScatteringMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: RayleighScatteringMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const rayleighScatteringSchema: BundleSchema = {
  id: RAYLEIGH_SCATTERING_ID,
  label: text('label.title'),
  category: 'optics',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 막대가 서고, 해가 머리 위에서 지평선으로 내려간다.
  parameters: [],

  stages: [
    {
      id: 'sunlight',
      label: text('label.stage'),
      constants: {
        lambdaBlue: LAMBDA_BLUE,
        lambdaRed: LAMBDA_RED,
        blueRatio: BLUE_RATIO,
        tauBlue: TAU_BLUE,
        earthRadius: EARTH_RADIUS,
        airWorld: AIR_WORLD,
        sunsetDeg: SUNSET_DEG,
        skyGlow: SKY_GLOW,
        seed: SEED,
      },
    },
  ],

  environments: [],

  views: [{ id: 'main', label: text('label.view'), default: true }],

  /** 가로 17.8 · 세로 4.9. 세로가 비싸다 — 그래프와 단면을 옆으로 놓는다. */
  canvas: { height: 290, minHeight: 260 },

  /**
   * 겹침이 판정 장치다. 빛 없음 바탕 → 공기층 → 지면 → 빛 줄기 → 해 · 원판 → 이름표 순으로
   * 깔려야 빛이 바탕 위에서 읽힌다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 막대가 자람 → 막대를 견줌 → 머리 위 햇빛이 내려옴 → 한낮 → 해가 내려감
   * → 해 질 녘 → 흐려짐. 해의 천정각은 `sink` 진행도의 함수다.
   */
  timeline: {
    phases: [
      { id: 'grow', duration: GROW, ease: 'smooth', caption: key('caption.grow') },
      { id: 'bars', duration: BARS, caption: key('caption.bars') },
      { id: 'travel', duration: TRAVEL, caption: key('caption.travel') },
      { id: 'noon', duration: NOON, caption: key('caption.noon') },
      { id: 'sink', duration: SINK, ease: 'smooth', caption: key('caption.sink') },
      { id: 'sunset', duration: SUNSET, caption: key('caption.sunset') },
      { id: 'fade', duration: FADE, caption: key('caption.sunset') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — 막대가 자라는 중에 연다. */
  startAt: 0.6,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 1/λ⁴ 는 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    style: { colorRole: 'muted', emphasis: 'strong' },
    // 문안의 수는 스테이지 상수에서 온다 — initialState 가 글자로 옮겨 둔 state 경로 (G133).
    vars: { b: 'blueNm', r: 'redNm', x: 'blueRatio' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 그래프에서 읽을 것은 두 막대의 높이 비이고,
   * 단면에서 읽을 것은 길이와 색이다 — 거리 격자는 다른 질문을 끼운다.
   */

  messages: rayleighScatteringMessages,
};
