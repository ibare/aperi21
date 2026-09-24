// ========================================================================
// projectile-in-wind — 선언
// ========================================================================
// 질문: 같은 자리에서 같은 각도 · 같은 속력으로 쏘았는데, 왜 착지점이 달라지는가.
//
// 같은 발사 셋을 레인 셋에 나란히 둔다. 다른 것은 **바람뿐**이다 — 위는 앞바람,
// 가운데는 무풍, 아래는 뒷바람. 공은 제 속도가 아니라 **공기에 대한 속도**만큼
// 저항을 받으므로, 흐르는 공기가 공을 앞으로 밀거나 뒤로 붙잡는다.
//
// 바람은 가로로만 불어 세로 운동은 셋이 똑같다 — 같은 높이를 함께 지나가고 같은
// 순간 땅에 닿는다. 그래서 달라지는 것은 오직 **어디에 닿는가** 하나로 남는다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:projectile-in-wind` 와 문자 그대로 같아야 한다 (C4). 바꾸지 않는다. */
export const PROJECTILE_IN_WIND_ID = 'projectile-in-wind';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 처음 속력(m/s). 세 레인이 같다 — 이 조각이 바꾸는 것은 바람뿐이다. */
export const V0 = 13;
/** 발사 각(°). 세 레인이 같다. 45° · 보각의 몫은 이웃 `projectile-range` 다. */
export const ANGLE_DEG = 34;
/** 중력 가속도(m/s²). 셋이 같다. 중력 크기의 몫은 이웃 `range-and-surface-gravity` 다. */
export const G = 9.8;
/**
 * 저항 계수 k(1/s). 가속도는 `−k · (공의 속도 − 공기의 속도)` 다 — 공기가 흐르면
 * 그 차이가 달라져 바람이 공을 민다. 속력에 비례하는 1차 저항 하나로 둔다.
 * 주장은 「바람이 착지점을 옮긴다」 이지 항력 모형의 정확함이 아니다.
 */
export const DRAG = 0.7;

/** 바람 세기(m/s) — 독자가 끄는 값. 스테이지 상수 `wind` 가 기본값이다. */
export const WIND = Object.freeze({ min: 3, max: 8, step: 0.5, default: 5 });

/** 바람 세기 → 바람 화살표 길이 배율(m per m/s). 표시 배율도 선언이다 (원칙 2). */
export const WIND_ARROW_SCALE = 0.3;
/** 처음 속력 → 발사 화살표 길이 배율(m per m/s). */
export const VEL_ARROW_SCALE = 0.12;

/** 발사 속도의 가로 · 세로 몫(m/s). */
export const V0X = V0 * Math.cos((ANGLE_DEG * Math.PI) / 180);
export const V0Y = V0 * Math.sin((ANGLE_DEG * Math.PI) / 180);

/**
 * 날아 있는 시간(초). 세로 운동은 바람과 무관하므로 세 레인이 같은 값을 쓴다.
 *
 * `y(t) = (v₀y + g/k)(1 − e^(−k t))/k − (g/k)·t` 의 두 번째 영점이고 닫힌 꼴이
 * 없어 이분법으로 찾는다. **이 값이 `fly` 단계의 길이**라 선언 쪽에 둔다 — 물리가
 * 정한 순간과 단계 경계가 어긋나면 「셋이 같은 순간 닿는다」 가 화면과 어긋난다.
 */
export function flightTime(v0y: number, g: number, k: number): number {
  const terminal = g / k;
  const rise = (v0y + terminal) / k;
  const height = (t: number): number => rise * (1 - Math.exp(-k * t)) - terminal * t;
  // 꼭대기 — 여기서부터는 단조 감소라 부호가 한 번만 바뀐다.
  let lo = Math.log((v0y + terminal) / terminal) / k;
  let hi = lo * 2;
  for (let i = 0; i < 40 && height(hi) > 0; i++) hi *= 2;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (height(mid) > 0) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/** 기본 상수에서의 체공 시간(초). `fly` 단계의 길이다. */
export const FLIGHT = flightTime(V0Y, G, DRAG);

// ------------------------------------------------------------------------
// 배치 — 월드 미터. 레인 셋을 위아래로 둔다.
// ------------------------------------------------------------------------

/** 레인 간격(m). 한 레인의 꼭대기(약 2.0 m)가 위 레인 바닥에 닿지 않는 만큼. */
export const LANE_GAP = 3.05;
/** 위에서부터 앞바람 · 무풍 · 뒷바람. 아래로 갈수록 멀리 간다 — 자국이 계단으로 읽힌다. */
export const LANE_HEADWIND_Y = 2 * LANE_GAP;
export const LANE_CALM_Y = LANE_GAP;
export const LANE_TAILWIND_Y = 0;

/** 바닥선의 양 끝(월드 x). 발사점 바로 왼쪽에서 시작한다. */
export const GROUND_FROM_X = -1;
export const GROUND_TO_X = 13.8;

/** 공의 반지름(m). 셋이 같다. */
export const BALL_RADIUS = 0.2;

/** 바람 화살표의 가운데 자리(월드 x)와 레인 바닥에서의 높이(m). */
export const WIND_ARROW_X = -2.4;
export const WIND_ARROW_Y = 1.3;
/** 레인 이름이 놓이는 높이(레인 바닥 기준 m). 화살표 아래다. */
export const LANE_LABEL_Y = 0.45;

/** 무풍 사거리에 세우는 기준선의 아래 · 위 끝(월드 y)과 이름표 높이. */
export const REF_BOTTOM_Y = -0.45;
export const REF_TOP_Y = 8.3;
export const REF_LABEL_Y = 8.45;

/**
 * 착지 자국의 길이(월드 m). 바닥선을 가로지른다. 닿아서 멈춘 공(지름 0.4)이 자국
 * 위에 얹히므로 공보다 넉넉히 길어야 「자국」 으로 읽힌다.
 */
export const MARK_SIZE = 0.9;
/**
 * 기준선에서 자국까지를 재는 치수선의 높이(레인 바닥 기준 m). 닿아서 멈춘 공
 * (중심 0.2 · 위끝 0.4)보다 위다 — 공을 가로지르면 재는 선이 공에 묻힌다.
 */
export const DIM_Y = 0.85;

/** 궤적을 그릴 때의 표본 수. 배율이 아니라 그림의 결이라 상태로 계산하지 않는다. */
export const TRAJ_SAMPLES = 56;

/**
 * 프레이밍은 주장의 일부다. 가로는 바람 화살표가 가장 길 때(−3.6)부터 뒷바람이
 * 가장 셀 때의 착지점 너머까지, 세로는 자국 아래와 맨 위 레인의 꼭대기 위까지.
 * **고정값이다** — 바람을 끌어도 경계가 따라 움직이지 않는다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: -4, maxX: 14, minY: -0.8, maxY: 8.95 } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이. `fly` 만 물리가 정한 값이다.
// ------------------------------------------------------------------------

/** 겨누는 동안(초). 화살표 셋이 같다는 것을 보이는 자리다. */
export const AIM = 0.45;
/** 닿은 자국이 나타나는 동안 · 잰 그림을 읽는 동안 · 흐려지는 동안. */
export const LAND = 0.6;
export const HOLD = 3.4;
export const FADE = 0.8;
/** 날아가는 동안을 늦춰 흘린다 — 1.3 초는 셋이 벌어지는 것을 보기에 짧다. */
export const SLOW_MOTION = 0.6;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const projectileInWindMessages = Object.freeze({
  'label.title': { ko: '바람과 사거리', en: 'Wind and range' },
  'label.stage': { ko: '바람 부는 벌판', en: 'Windy field' },
  'label.view': { ko: '세 레인', en: 'Three lanes' },
  'label.headwind': { ko: '앞바람', en: 'Headwind' },
  'label.calm': { ko: '무풍', en: 'No wind' },
  'label.tailwind': { ko: '뒷바람', en: 'Tailwind' },
  /** 발사 화살표에 붙는 기호. 수식 표기라 번역 대상이 아니다 (C1 판정 3). */
  'label.v0': { ko: 'v₀', en: 'v₀' },
  'label.calmRange': { ko: '무풍 사거리', en: 'No-wind range' },
  'label.wind': { ko: '바람 세기', en: 'Wind speed' },
  'caption.aim': {
    ko: '같은 각도 · 같은 속력으로 셋을 겨눈다 — 다른 것은 바람뿐이다',
    en: 'Three balls aimed at the same angle and the same speed — only the wind differs',
  },
  'caption.fly': {
    ko: '셋은 같은 높이를 함께 지나가고, 바람이 앞뒤로 민다',
    en: 'The three pass the same heights together while the wind pushes them along or back',
  },
  'caption.land': {
    ko: '셋이 같은 순간 땅에 닿는다 — 자국은 서로 다른 자리에 남았다',
    en: 'All three touch down at the same moment — the marks are left at different places',
  },
  'caption.result': {
    ko: '뒷바람을 받은 공은 무풍 자국보다 멀리, 앞바람을 받은 공은 가깝게 떨어졌다',
    en: 'The ball with the tailwind landed beyond the no-wind mark, the one into the headwind fell short',
  },
} satisfies Record<string, LocalizedText>);

export type ProjectileInWindMessageKey = keyof typeof projectileInWindMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: ProjectileInWindMessageKey): LocalizedText =>
  projectileInWindMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ProjectileInWindMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const projectileInWindSchema: BundleSchema = {
  id: PROJECTILE_IN_WIND_ID,
  title: text('label.title'),
  category: 'fluids',
  timeModel: 'periodic',

  parameters: [],

  stages: [
    {
      id: 'windy-field',
      label: text('label.stage'),
      constants: {
        v0: V0,
        angleDeg: ANGLE_DEG,
        g: G,
        drag: DRAG,
        wind: WIND.default,
        windArrowScale: WIND_ARROW_SCALE,
        velArrowScale: VEL_ARROW_SCALE,
      },
    },
  ],

  environments: [],

  views: [{ id: 'lanes', label: text('label.view'), default: true }],

  /**
   * 가로 18 m · 세로 9.75 m 를 담는다. 세로를 더 주면 가로가 먼저 차서 그림만
   * 작아진다 (S-piece — 세로가 비싸다).
   */
  canvas: { height: 400, minHeight: 348 },

  /**
   * 겹침이 판정 장치다. 무풍 사거리 기준선은 **공 뒤로** 지나가야 하고, 착지 자국은
   * 바닥선 위에 얹혀야 한다. 층 순서로는 자국(`trace`)이 궤적보다 아래로 내려간다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 겨눔 → 날아감 → 닿음 → 잰 그림을 읽음 → 흐려짐.
   *
   * `fly` 의 길이는 물리가 정한 체공 시간이다. 그래서 「셋이 같은 순간 닿는다」 는
   * 캡션이 화면과 어긋날 수 없다.
   */
  timeline: {
    phases: [
      { id: 'aim', duration: AIM, caption: key('caption.aim') },
      {
        id: 'fly',
        duration: FLIGHT,
        timeScale: SLOW_MOTION,
        caption: key('caption.fly'),
      },
      { id: 'land', duration: LAND, caption: key('caption.land') },
      { id: 'hold', duration: HOLD, caption: key('caption.result') },
      { id: 'fade', duration: FADE, caption: key('caption.result') },
    ],
  },

  /**
   * 도착한 순간 이미 진행 중이다 — 세 공이 이미 벌어진 채 내려오는 자리에서 연다.
   * 0 이면 겨누는 그림부터 보게 되고, 벌어짐은 나중에야 나타난다.
   */
  startAt: AIM + 0.9,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 식과 정의는 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 700,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것은 임의의 거리가 아니라 **무풍 자국에서
   * 얼마나 옮겨졌는가** 라, 미터 격자를 깔면 「몇 미터인가」 라는 다른 질문이 끼어든다.
   * 기준은 무풍 사거리에 세운 선 하나로 직접 긋는다.
   */

  messages: projectileInWindMessages,
};
