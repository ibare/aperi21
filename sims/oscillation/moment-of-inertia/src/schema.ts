// ========================================================================
// moment-of-inertia — 선언
// ========================================================================
// 질문: 질량이 같은데, 왜 어떤 바퀴는 같은 돌림힘으로 돌려도 잘 안 돌아가는가.
//
// 동사는 「뒤처진다」. 같은 질량 알갱이 12개를 가진 바퀴 둘을 멈춘 상태에서 같은
// 돌림힘으로 출발시킨다. 질량을 축에서 멀리 둔 오른쪽 바퀴가 회전이 뒤처진다.
// 시행마다 오른쪽 질량을 1.00R → 0.60R → 0.30R 로 **멈춘 뒤에** 옮긴다.
//
// 원본: tasks/piece-lab/moment-of-inertia (index.html · NOTES.md).
// ========================================================================

import type { BundleSchema, LocalizedText, TimelinePhase } from '@aperi21/schema';

/** 등록 키 `aperi21:moment-of-inertia` 와 문자 그대로 일치한다 (C4). */
export const MOMENT_OF_INERTIA_ID = 'moment-of-inertia';

// ------------------------------------------------------------------------
// 물리 모델 (원본 상수 그대로)
// ------------------------------------------------------------------------

/** 두 바퀴 모두 같은 질량 알갱이 수. */
export const N_MASSES = 12;
/** 알갱이 하나의 질량. */
export const M_EACH = 1;
/**
 * 바퀴 틀(축 · 살 · 테)의 관성 모멘트 — 두 바퀴 같다. 0 이면 비율이 정확히 거리 제곱이 되어
 * 보기 좋지만 실제 바퀴와 어긋난다 (원본 NOTES (d)).
 */
export const I_FRAME = 0.12;
/** 왼쪽(기준) 질량의 반지름 — 고정. */
export const R_LEFT = 0.3;
/** 한 시행에서 돌림힘을 거는 시간(초). 시간표 `run-*` 단계의 길이이자 돌림힘을 정하는 값. */
export const RUN = 6.0;
/** 끝난 모습을 보여 주는 시간(초). */
export const HOLD = 0.8;
/** 오른쪽 질량을 옮기는 시간(초). */
export const MOVE = 0.7;
/** 도착한 순간 이미 2초째 돌고 있다. */
export const START_AT = 2.0;
/** 알갱이 잔상이 담는 지난 시간(초). */
export const TRAIL_SECONDS = 0.3;

/** 자동 진행의 세 시행. 오른쪽 질량의 반지름(R 단위). */
export const TRIALS = [
  { id: 'far', r: 1.0 },
  { id: 'mid', r: 0.6 },
  { id: 'near', r: 0.3 },
] as const;
export type TrialId = (typeof TRIALS)[number]['id'];

/** 슬라이더 범위 · 간격 (R 단위). */
export const SLIDER_RANGE: [number, number] = [0.3, 1.0];
export const SLIDER_STEP = 0.05;

// ------------------------------------------------------------------------
// 배치 — 원본 캔버스 860×290 px 를 월드로 옮긴다. 1R = 104 px = 월드 1.
// ------------------------------------------------------------------------

/** 바퀴 테 반지름(원본 px). 월드 1 단위. */
export const RPX = 104;
/** 원본 캔버스 크기(px). 그 가운데가 월드 원점이다. */
export const CANVAS_PX = { w: 860, h: 290 } as const;
export const LEFT_C = { x: 128, y: 130 } as const;
export const RIGHT_C = { x: 732, y: 130 } as const;
/** 돈 각 그래프 영역(원본 px). */
export const GRAPH = { x0: 300, x1: 580, y0: 245, y1: 30 } as const;

/**
 * 고정 프레이밍. 원본 캔버스에 위(캡션 줄)와 아래(슬라이더 줄) 여백을 더한다 —
 * 캡션 · 조작기 자리가 프레이밍 여백으로 잡히지 않아 경계에 직접 넣는다 (장부 G24).
 */
export const CAPTION_ROOM_PX = 40;
export const SLIDER_ROOM_PX = 44;
export const SCENE_BOUNDS = {
  minX: -CANVAS_PX.w / 2 / RPX,
  maxX: CANVAS_PX.w / 2 / RPX,
  minY: -(CANVAS_PX.h / 2 + SLIDER_ROOM_PX) / RPX,
  maxY: (CANVAS_PX.h / 2 + CAPTION_ROOM_PX) / RPX,
} as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const momentOfInertiaMessages = Object.freeze({
  'label.title': { ko: '관성 모멘트', en: 'Moment of inertia' },
  'label.stage': { ko: '두 바퀴', en: 'Two wheels' },
  'label.view': { ko: '기본', en: 'Default' },
  /** 바퀴 아래 질량 자리 표시. */
  'label.masses': { ko: '질량 {n}개 · 축에서 {r}R', en: '{n} masses · {r}R from the axle' },
  /** 그래프 세로 눈금. */
  'label.turns': { ko: '{n}바퀴', en: '{n} rev' },
  'label.angle': { ko: '돈 각', en: 'Angle turned' },
  'label.time': { ko: '시간 →', en: 'time →' },
  'label.slider': { ko: '오른쪽 질량을 둘 자리', en: 'Where to put the right-hand masses' },
  'caption.lagFar': {
    ko: '같은 질량, 같은 돌림힘 — 질량을 축에서 {farDist}배 멀리 둔 오른쪽 바퀴가 뒤처진다. 같은 시간에 돈 각이 왼쪽의 1/{farRatio}.',
    en: 'Same mass, same torque — the right wheel, with its mass {farDist}× farther from the axle, falls behind. In the same time it turns 1/{farRatio} of the left.',
  },
  'caption.lagMid': {
    ko: '같은 질량, 같은 돌림힘 — 질량을 축에서 {midDist}배 멀리 둔 오른쪽 바퀴가 뒤처진다. 같은 시간에 돈 각이 왼쪽의 1/{midRatio}.',
    en: 'Same mass, same torque — the right wheel, with its mass {midDist}× farther from the axle, falls behind. In the same time it turns 1/{midRatio} of the left.',
  },
  'caption.lagManual': {
    ko: '같은 질량, 같은 돌림힘 — 질량을 축에서 {manDist}배 멀리 둔 오른쪽 바퀴가 뒤처진다. 같은 시간에 돈 각이 왼쪽의 1/{manRatio}.',
    en: 'Same mass, same torque — the right wheel, with its mass {manDist}× farther from the axle, falls behind. In the same time it turns 1/{manRatio} of the left.',
  },
  'caption.same': {
    ko: '같은 질량을 축에서 같은 거리에 두면, 같은 돌림힘에 두 바퀴가 나란히 돈다.',
    en: 'Put the same mass at the same distance from the axle, and the same torque turns both wheels side by side.',
  },
  'caption.moveToMid': {
    ko: '오른쪽 질량을 축에서 {toMid}R 자리로 옮긴다 — 다시 멈춘 상태에서 같은 돌림힘으로 출발한다.',
    en: 'Move the right-hand masses to {toMid}R from the axle — it starts again from rest with the same torque.',
  },
  'caption.moveToNear': {
    ko: '오른쪽 질량을 축에서 {toNear}R 자리로 옮긴다 — 다시 멈춘 상태에서 같은 돌림힘으로 출발한다.',
    en: 'Move the right-hand masses to {toNear}R from the axle — it starts again from rest with the same torque.',
  },
  'caption.moveToFar': {
    ko: '오른쪽 질량을 축에서 {toFar}R 자리로 옮긴다 — 다시 멈춘 상태에서 같은 돌림힘으로 출발한다.',
    en: 'Move the right-hand masses to {toFar}R from the axle — it starts again from rest with the same torque.',
  },
} satisfies Record<string, LocalizedText>);

export type MomentOfInertiaMessageKey = keyof typeof momentOfInertiaMessages;

export const text = (key: MomentOfInertiaMessageKey): LocalizedText => momentOfInertiaMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: MomentOfInertiaMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// 시간표
// ------------------------------------------------------------------------

/**
 * 시행마다 돌림(run) → 멈춤(hold) → 옮김(move). 세 시행이 한 주기(22.5 초).
 *
 * 캡션은 단계가 고른다. 돌림 · 멈춤은 그 시행의 거리 비와 돈 각 비를, 옮김은 어디로 옮기는지를
 * 말한다. 0.30R 시행은 왼쪽과 같은 거리라 「나란히 돈다」 — 시행 목록에서 정해지는 것을 단계
 * 캡션 키로 적었다 (단계에 값을 실을 수 없다, 장부 G13).
 */
const PHASES: TimelinePhase[] = [
  { id: 'run-far', duration: RUN, caption: key('caption.lagFar') },
  { id: 'hold-far', duration: HOLD, caption: key('caption.lagFar') },
  { id: 'move-far', duration: MOVE, ease: 'smooth', caption: key('caption.moveToMid') },
  { id: 'run-mid', duration: RUN, caption: key('caption.lagMid') },
  { id: 'hold-mid', duration: HOLD, caption: key('caption.lagMid') },
  { id: 'move-mid', duration: MOVE, ease: 'smooth', caption: key('caption.moveToNear') },
  { id: 'run-near', duration: RUN, caption: key('caption.same') },
  { id: 'hold-near', duration: HOLD, caption: key('caption.same') },
  { id: 'move-near', duration: MOVE, ease: 'smooth', caption: key('caption.moveToFar') },
];

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const momentOfInertiaSchema: BundleSchema = {
  id: MOMENT_OF_INERTIA_ID,
  title: text('label.title'),
  category: 'oscillation',
  timeModel: 'periodic',
  parameters: [],
  stages: [{ id: 'default', label: text('label.stage'), constants: {} }],
  environments: [],
  views: [{ id: 'default', label: text('label.view'), default: true }],

  /** 원본 캔버스 290 px + 위 캡션 줄 + 아래 슬라이더 줄. */
  canvas: { height: 380, minHeight: 330 },

  /** 원본 겹침 순서 — 틀 · 잔상 · 알갱이 · 돌림힘 · 글자 · 그래프 · 왼쪽 곡선 · 오른쪽 곡선. */
  drawOrder: 'scene',

  startAt: START_AT,

  timeline: { phases: PHASES },

  caption: {
    anchor: { screen: 'top-left', offset: [16, 14] },
    align: 'left',
    fontSize: 15,
    style: { colorRole: 'ink', emphasis: 'strong' },
    /**
     * 독자가 슬라이더를 만지면 단계 캡션 대신 상태 캡션 — 수동 시행은 시간표가 아니라 상태가
     * 거리를 정한다 (장부 G44).
     */
    cases: [
      { when: 'manualSame', text: key('caption.same') },
      { when: 'manualLag', text: key('caption.lagManual') },
    ],
    vars: {
      farDist: 'farDist',
      farRatio: 'farRatio',
      midDist: 'midDist',
      midRatio: 'midRatio',
      manDist: 'manDist',
      manRatio: 'manRatio',
      toMid: 'toMid',
      toNear: 'toNear',
      toFar: 'toFar',
    },
  },

  messages: momentOfInertiaMessages,
};
