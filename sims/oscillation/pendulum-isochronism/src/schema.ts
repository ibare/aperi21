// ========================================================================
// pendulum-isochronism — 선언
// ========================================================================
// 질문: 크게 흔들리는 진자는 더 먼 길을 가는데, 왜 작게 흔들리는 진자와 같이
// 돌아오는가.
//
// 더 먼 길을 더 빠르게 지나기 때문이다. 그래서 같은 순간 바닥에서 다시 만난다.
// 다만 이것은 **작은 흔들림에서만** 성립하는 근사다.
//
// 원본: tasks/piece-lab/pendulum-isochronism/ (자유 구현)
// ========================================================================

import type { BundleSchema, LocalizedText, Vec2 } from '@aperi21/schema';

/** 등록 키 `aperi21:pendulum-isochronism` 와 문자 그대로 일치한다 (C4). */
export const PENDULUM_ISOCHRONISM_ID = 'pendulum-isochronism';

// ------------------------------------------------------------------------
// 원본의 논리 좌표
// ------------------------------------------------------------------------
//
// 원본은 860×372 의 논리 캔버스에 그렸고 줄 길이 1 m 를 208 px 로 두었다.
// **그 픽셀 값들이 이 조각의 배치 판단이다.** 숫자를 그대로 옮기고 월드 좌표로는
// 여기서 한 번만 바꾼다 — 기억으로 옮기면 간격과 크기가 조용히 달라진다.

/** 피벗의 논리 좌표(px). 월드 원점이 된다. */
const PIVOT_PX: Vec2 = [430, 26];
/** 줄 길이 1 m = 208 px. 그래서 월드 1 이 곧 줄 길이다. */
export const PX_PER_M = 208;
/** 최하점의 논리 y(px) — 피벗에서 줄 길이만큼 아래. */
const FLOOR_PX = 234;

/** 원본 논리 좌표(px) → 월드. 월드는 y 가 위로 간다. */
export function fromPx(px: number, py: number): Vec2 {
  return [(px - PIVOT_PX[0]) / PX_PER_M, (PIVOT_PX[1] - py) / PX_PER_M];
}

/** 원본의 길이(px) → 월드 길이. */
export function lengthFromPx(px: number): number {
  return px / PX_PER_M;
}

// ------------------------------------------------------------------------
// 물리
// ------------------------------------------------------------------------

/** g/L — 길이 1 m 의 단진자. 소진폭 근사를 쓰지 않고 θ'' = −(g/L)sinθ 를 그대로 적분한다. */
export const G_OVER_L = 9.80665;

/**
 * 같은 길이, 진폭만 다섯 배 차이. 「충분히 다르다」와 「화면에 다 들어온다」의
 * 타협이라 주제마다 다른 숫자가 나온다.
 */
export const RATIO: readonly number[] = [1, 0.8, 0.6, 0.4, 0.2];

/** 가장 큰 진자의 진폭(도). 나머지 넷은 `RATIO` 배로 따라 움직인다. */
export const AMP_DEFAULT_DEG = 20;
/** 슬라이더가 오가는 범위(도). */
export const AMP_RANGE: [number, number] = [6, 60];

/**
 * 잔상이 담는 시간(초). 원본의 13 프레임(60 fps)이다.
 *
 * 프레임 수가 아니라 **시간**으로 자른다 — 잔상 길이가 곧 속력이라는 읽기가
 * 성립하려면 모든 진자가 같은 시간 동안 지나온 호여야 하고, dt 가 흔들리는
 * 실시간에서 프레임 수로 자르면 그 시간이 프레임마다 달라진다.
 */
export const TRAIL_SPAN = 12 / 60;

/** 박자 기록띠가 담는 시간(초). 이보다 오래된 획은 조각이 버린다. */
export const BAND_WINDOW = 8.4;

/** 캡션이 말을 바꾸는 지연(초). */
export const LAG_LIMIT = 0.14;

/**
 * 마운트 전에 미리 굴리는 시간(초) — 원본의 512 스텝 × 1/60.
 *
 * 띠가 빈 채로 시작하면 독자는 8 초를 기다려야 증거를 본다. 길이는 1/4 주기
 * 위상에 맞춰 t=0 이 바닥 통과 순간이 되게 잡은 값이다 — 도착하자마자 가장
 * 빠른 장면이다 (S-piece: 독자가 도착한 순간 이미 진행 중).
 */
export const WARM_SECONDS = 512 / 60;

// ------------------------------------------------------------------------
// 자리
// ------------------------------------------------------------------------

/** 피벗. 월드 원점. */
export const PIVOT: Vec2 = fromPx(PIVOT_PX[0], PIVOT_PX[1]);
/** 최하점 기준선 — 피벗 바로 아래를 지나는 짧은 세로 점선. */
export const BASELINE_TOP: Vec2 = fromPx(PIVOT_PX[0], FLOOR_PX - 46);
export const BASELINE_BOTTOM: Vec2 = fromPx(PIVOT_PX[0], FLOOR_PX + 18);

/** 추의 반지름(월드). 원본 6.5 px. */
export const BOB_RADIUS = lengthFromPx(6.5);
/** 피벗 점의 반지름(월드). 원본 3 px. */
export const PIVOT_RADIUS = lengthFromPx(3);

/** 박자 기록띠의 논리 좌표(px). */
const BAND_PX = { x0: 64, x1: 820, y0: 272, y1: 344 } as const;
const ROW_H_PX = (BAND_PX.y1 - BAND_PX.y0) / 5;

/**
 * 박자 기록띠 — 가로가 시간(오른쪽 끝이 지금, 왼쪽 끝이 8.4 초 전), 세로 다섯
 * 행이 다섯 진자. 등시성이 성립하면 다섯 행의 획이 세로 한 줄로 선다.
 */
export const BAND = {
  x0: fromPx(BAND_PX.x0, 0)[0],
  x1: fromPx(BAND_PX.x1, 0)[0],
  /** 행 가운데의 월드 y. */
  rowY: RATIO.map((_, i) => fromPx(0, BAND_PX.y0 + ROW_H_PX * (i + 0.5))[1]),
  /** 띠가 초당 흐르는 월드 거리. */
  perSecond: (BAND_PX.x1 - BAND_PX.x0) / BAND_WINDOW / PX_PER_M,
  /**
   * 획 하나의 길이(월드). 원본은 10 px 다.
   *
   * `trace` 의 `size` 는 선언이 화면 px 라고 적고 있으나 `tick` 만 구현이 월드로
   * 읽는다(`dot`·`ring` 은 px). 그래서 여기만 월드로 준다 — NOTES 「어휘 부족」.
   */
  tick: lengthFromPx(10),
} as const;

/** 진폭 이름표가 붙는 x — 띠 왼쪽 끝에서 9 px 앞. */
export const LABEL_X = fromPx(BAND_PX.x0 - 9, 0)[0];

/**
 * 프레이밍은 주장의 일부다. 원본 캔버스(860×372) 전체를 그대로 프레임으로 쓴다 —
 * 띠가 진자보다 넓어서, 진자에 맞춰 자르면 증거가 잘린다.
 */
export const SCENE_BOUNDS = {
  minX: fromPx(0, 0)[0],
  maxX: fromPx(860, 0)[0],
  minY: fromPx(0, 372)[1],
  maxY: fromPx(0, 0)[1],
} as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const pendulumIsochronismMessages = Object.freeze({
  'label.title': { ko: '진자의 등시성', en: 'Isochronism of the pendulum' },
  'label.operation': {
    ko: '폭이 달라도 같은 박자로 돌아온다',
    en: 'Different amplitudes, same beat',
  },
  'label.stage': { ko: '진자', en: 'Pendulums' },
  'label.view': { ko: '다섯 진자', en: 'Five pendulums' },
  /**
   * 띠 왼쪽, 그 행이 어느 진폭의 진자인지. 수와 단위 표기라 번역 대상이 아니다
   * (C1 판정 3). 소수 첫째 자리로 고정해 반올림으로 값이 어긋나지 않게 한다.
   */
  'label.amplitude': { ko: '{deg}°', en: '{deg}°' },
  /** 조작기 이름. */
  'control.amplitude': { ko: '흔들림 크기', en: 'Swing size' },
  /** 지연이 문턱 아래일 때. 지금 화면에서 실제로 벌어지는 일만 말한다. */
  'caption.same': {
    ko: '진폭이 다섯 배까지 차이 나는데도, 다섯이 같은 순간 바닥을 지난다',
    en: 'Amplitudes differ fivefold, yet the five cross the bottom at the same instant',
  },
  /** 지연이 문턱을 넘은 뒤. 근사라는 사실을 숨기지 않는다. */
  'caption.lag': {
    ko: '크게 흔들리는 것이 뒤처졌다 — 등시성은 작은 흔들림에서만 성립한다',
    en: 'The widest swing has fallen behind — isochronism holds only for small swings',
  },
} satisfies Record<string, LocalizedText>);

export type PendulumIsochronismMessageKey = keyof typeof pendulumIsochronismMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export function text(key: PendulumIsochronismMessageKey): LocalizedText {
  return pendulumIsochronismMessages[key];
}

/** 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: PendulumIsochronismMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const pendulumIsochronismSchema: BundleSchema = {
  id: PENDULUM_ISOCHRONISM_ID,
  label: text('label.title'),
  category: 'oscillation',
  operation: text('label.operation'),
  timeModel: 'linear',

  // 진폭은 조작기가 쥔다 (controllers.ts). 파라미터 패널을 띄우지 않는다 —
  // 조각에 상시 값 표시줄을 두지 않는다 (S-piece).
  parameters: [],

  stages: [
    {
      id: 'pendulums',
      label: text('label.stage'),
      constants: { g: G_OVER_L, length: 1 },
    },
  ],

  environments: [],
  views: [{ id: 'five', label: text('label.view'), default: true }],

  /** 원본 캔버스와 같은 비율(860×372). 세로가 비싸다. */
  canvas: { height: 372, minHeight: 330 },

  /**
   * 겹침이 판정 장치다. 섬광 링은 추 **위**에 터져야 "방금 저 추가 지났다" 로
   * 읽히고, 매단 줄은 추 **아래**로 깔려야 한다. 층 순서로는 그 둘이 동시에
   * 나오지 않는다 (trace 19 < body 40). 그래서 순서를 조각이 고른다.
   */
  drawOrder: 'scene',

  /**
   * 마운트 전에 상태를 미리 굴린다. 이 조각은 띠와 잔상을 **누적**하므로 시계만
   * 앞당기면(`startAt`) 화면이 비어 있다 — 그래서 `startAt` 은 쓰지 않는다.
   */
  preroll: WARM_SECONDS,

  /**
   * 슬롯 하나. 이 조각의 캡션은 시간표 단계가 아니라 **상태**로 갈린다 — 지연이
   * 문턱을 넘었는지는 시각이 아니라 지금 물리가 정한다. 문턱을 세는 것은
   * `physics.ts` 이고 선언은 그 결과가 놓인 자리만 가리킨다 (원칙 2).
   */
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    style: { colorRole: 'muted', emphasis: 'strong' },
    text: key('caption.same'),
    cases: [{ when: 'lagExceeded', text: key('caption.lag') }],
  },

  // 그리드도 카메라 버튼도 없다 (기본값). 이 그림에서 잴 것은 거리가 아니라
  // 획끼리의 정렬이다.

  messages: pendulumIsochronismMessages,
};
