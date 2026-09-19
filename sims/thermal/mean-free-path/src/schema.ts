// ========================================================================
// mean-free-path — 선언
// ========================================================================
// 질문: 분자를 더 빽빽하게 채우면 한 분자가 다음 충돌까지 가는 거리는 어떻게 되나.
//
// 같은 크기 · 같은 속력의 표시 분자 하나를 두 상자(밀도 n · 2n)에서 나란히 따라간다.
// 다른 분자에 부딪힐 때마다 경로가 꺾이고, 충돌과 충돌 사이 구간의 길이가 아래 줄에
// 눈금으로 하나씩 쌓이며 그 평균이 막대로 선다. 빽빽한 상자의 막대는 성긴 상자
// 막대의 절반 높이(길이)에서 멈춘다.
//
// 벽을 때리는 압력(gas-pressure) · 알갱이의 비틀거림(brownian-motion)은 이 조각의
// 몫이 아니다. 여기서 일어나는 것은 「빽빽할수록 부딪히기까지 가는 거리가 짧다」 하나다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:mean-free-path` 와 문자 그대로 일치한다 (C4). */
export const MEAN_FREE_PATH_ID = 'mean-free-path';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 길이 단위는 월드다. 상자 안 거리와 아래 줄의 막대 길이가 같은 자로 잰다.
// ------------------------------------------------------------------------

/**
 * 분자 배치 · 출발 방향을 뽑는 시드. 같은 시드는 언제나 같은 경로다.
 * 두 상자의 표본 평균이 주장대로(1 : 1/2) 서는 시드를 골랐다 (NOTES (b)).
 */
export const SEED = 39;
/** 성긴 상자(밀도 n)의 분자 수. 표시 분자는 세지 않는다. */
export const COUNT = 25;
/** 빽빽한 상자의 밀도가 성긴 상자의 몇 배인가. 분자 수가 이 배수다(정수). */
export const DENSITY_RATIO = 2;
/** 분자 반지름(월드). 두 분자의 중심이 지름(2r)만큼 가까워지면 부딪힌다. */
export const RADIUS = 0.1;
/** 표시 분자의 속력(월드/초). 두 상자에서 같다 — 같은 온도다. */
export const SPEED = 1.3;
/**
 * 분자를 흩을 때 서로 떨어뜨리는 최소 틈(월드, 두 분자 표면 사이). 표시 분자의 지름(2r)보다
 * 넓게 두어 어느 두 분자 사이로도 지나갈 수 있다 — 좁으면 촘촘한 몇 분자 사이에 갇혀
 * 짧게 되튀기만 한다 (NOTES (b)).
 */
export const PLACE_GAP = 0.22;
/**
 * `initialState` 가 미리 계산하는 경로의 길이(초). 시간표의 `run` ~ `shorter` 보다 길어야
 * 한다 — `initialState` 는 시간표를 받지 않는다(장부 G211).
 */
export const SIM_SECONDS = 20;
/** 상자 안에 남기는 경로 꼬리의 길이(초). 그보다 오래된 구간은 옅어져 사라진다. */
export const TRAIL_SECONDS = 5;
/**
 * 아래 두 줄이 상자 안 거리를 늘려 그리는 배율. 같은 자(1)로는 평균 막대가 상자 너비의
 * 4 분의 1 에도 못 미쳐 절반 자리가 읽히지 않는다. 두 줄에 같은 배율이라 비는 그대로이고,
 * 머리 이름표가 배율을 밝힌다 (NOTES (b)).
 */
export const ROW_SCALE = 2.5;

// ------------------------------------------------------------------------
// 배치 — 월드. 두 상자를 나란히, 그 아래 두 줄이 충돌 사이 거리의 자다.
// ------------------------------------------------------------------------

/** 상자 크기(월드). 두 상자가 같다. 상자는 주기 경계라 오른쪽으로 나가면 왼쪽으로 들어온다. */
export const BOX_W = 4.4;
export const BOX_H = 3;
/** 두 상자의 왼쪽 아래 모서리. */
export const BOX_ORIGINS = [
  [0, 0],
  [5, 0],
] as const;
/** 상자 위 이름표 높이(월드). */
export const BOX_LABEL_Y = 3.28;
/** 아래 두 줄 — 줄의 세로 자리(월드). 첫 줄이 성긴 상자, 둘째 줄이 빽빽한 상자다. */
export const ROW_Y = [-0.82, -1.42] as const;
/** 두 줄 위 머리 이름표 높이(월드). */
export const ROW_HEAD_Y = -0.36;
/** 줄 이름표(`n` · `2n`)가 서는 가로 자리(월드). 오른쪽 끝을 맞춘다. */
export const ROW_LABEL_X = -0.18;

/** 프레이밍은 주장의 일부다. 두 상자와 이름표, 두 줄, 캡션 줄까지. 매 프레임 같은 값이다. */
export const SCENE_BOUNDS = { minX: -0.75, maxX: 9.65, minY: -2.15, maxY: 3.5 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const meanFreePathMessages = Object.freeze({
  'label.title': { ko: '평균 자유 행로', en: 'Mean free path' },
  'label.operation': { ko: '충돌과 충돌 사이의 거리', en: 'The distance between collisions' },
  'label.stage': { ko: '밀도가 다른 두 상자', en: 'Two boxes of different density' },
  'label.view': { ko: '두 상자 나란히', en: 'Two boxes side by side' },
  'label.boxSparse': { ko: '밀도 n', en: 'density n' },
  'label.boxDense': { ko: '밀도 {k}n', en: 'density {k}n' },
  'label.rowHead': {
    ko: '충돌 사이 거리({s}배로 늘림) — 눈금 하나가 한 구간, 막대는 평균',
    en: 'distance between collisions (drawn {s}× longer) — each tick one stretch, the bar their average',
  },
  'label.rowSparse': { ko: 'n', en: 'n' },
  'label.rowDense': { ko: '{k}n', en: '{k}n' },
  'caption.run': {
    ko: '표시한 분자가 다른 분자에 부딪힐 때마다 꺾인다 — 점이 부딪힌 자리다',
    en: 'The marked molecule turns each time it hits another — each dot is a collision',
  },
  'caption.shorter': {
    ko: '분자가 {k}배 빽빽한 오른쪽 상자에서는 더 자주 부딪히고, 둘째 줄 눈금이 앞쪽에 몰린다',
    en: 'In the right box, {k} times as crowded, hits come more often and the lower row of ticks bunches toward the start',
  },
  'caption.result': {
    ko: '평균 막대 — 아래 막대가 위 막대의 1/{k} 자리에서 멈췄다',
    en: 'The average bars — the lower one stopped at 1/{k} of the upper one',
  },
} satisfies Record<string, LocalizedText>);

export type MeanFreePathMessageKey = keyof typeof meanFreePathMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: MeanFreePathMessageKey): LocalizedText => meanFreePathMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: MeanFreePathMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const meanFreePathSchema: BundleSchema = {
  id: MEAN_FREE_PATH_ID,
  label: text('label.title'),
  category: 'thermal',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 두 분자가 부딪히며 가고, 평균 막대가 자라 멈춘다.
  parameters: [],

  stages: [
    {
      id: 'n-and-double',
      label: text('label.stage'),
      constants: {
        seed: SEED,
        count: COUNT,
        densityRatio: DENSITY_RATIO,
        radius: RADIUS,
        speed: SPEED,
        placeGap: PLACE_GAP,
        simSeconds: SIM_SECONDS,
        trailSeconds: TRAIL_SECONDS,
        rowScale: ROW_SCALE,
      },
    },
  ],

  environments: [],

  views: [{ id: 'side-by-side', label: text('label.view'), default: true }],

  /** 가로 10.4 · 세로 5.65 월드. 두 상자를 나란히 둔다 — 세로가 비싸다. */
  canvas: { height: 360, minHeight: 320 },

  /**
   * 쓴 순서대로 그린다. 상자 바탕(`region`)이 층 순서로는 물체 위에 덮여 분자가 비쳐
   * 보이게 된다 — 이 그림에서 상자 바탕은 매질이 아니라 판이다. 평균 막대 위에 눈금을
   * 긋는 것도 순서에 기댄다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 두 분자가 부딪히며 감(`run` → `shorter`, 같은 움직임이 이어진다)
   * → 멈추고 절반 자리 표시가 나타남(`mark`) → 머묾(`result`) → 흐려짐(`fade`).
   * 두 분자가 가는 시간이 같으므로 빽빽한 상자에서 부딪힌 점이 더 많다.
   */
  timeline: {
    phases: [
      { id: 'run', duration: 6, caption: key('caption.run') },
      { id: 'shorter', duration: 8, caption: key('caption.shorter') },
      { id: 'mark', duration: 0.7, ease: 'smooth', caption: key('caption.result') },
      { id: 'result', duration: 3.3, caption: key('caption.result') },
      { id: 'fade', duration: 0.8, ease: 'smooth', caption: key('caption.result') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — 두 분자가 벌써 몇 번 부딪혀 꺾인 뒤다. */
  startAt: 3,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 720,
    fade: 0.25,
    style: { colorRole: 'muted', emphasis: 'strong' },
    // 문안의 수는 스테이지 상수에서 온다 — initialState 가 글자로 옮겨 둔 state 경로 (G133).
    vars: { k: 'ratioText' },
  },

  /** 그리드 · 카메라 단추 없음(기본값). 잴 거리는 아래 두 줄이 직접 보인다 — 상자와 같은 자다. */

  messages: meanFreePathMessages,
};
