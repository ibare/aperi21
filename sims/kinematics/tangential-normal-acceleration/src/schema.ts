// ========================================================================
// tangential-normal-acceleration — 선언
// ========================================================================
// 질문: 가속도가 속도와 비스듬하게 걸리면, 물체는 빨라지는가 도는가?
//
// 둘 다, 따로따로. 가속도는 속도 방향 몫(속력 몫)과 수직 몫(방향 몫)으로 갈리고,
// 앞의 것은 속도 화살을 늘이거나 줄이기만, 뒤의 것은 길이를 그대로 둔 채 돌리기만 한다.
//
// 원본: tasks/piece-lab/tangential-normal-acceleration (index.html 의 상수를 그대로 옮긴다).
// ========================================================================

import type { BundleSchema, LocalizedText, TimelinePhase } from '@aperi21/schema';

/** 등록 키 `aperi21:tangential-normal-acceleration` 와 문자 그대로 일치한다 (C4). */
export const TANGENTIAL_NORMAL_ACCELERATION_ID = 'tangential-normal-acceleration';

// ------------------------------------------------------------------------
// 기하 — 월드 1 단위 = 원본 논리 좌표 100 px. 원본 캔버스(860×330)의 가운데가 원점, y 는 위.
// ------------------------------------------------------------------------

/** 원본 논리 px 가 월드 1 단위에 드는 수. */
export const PX_PER_UNIT = 100;
/** 원본 캔버스 논리 크기. */
export const CANVAS_W = 860;
export const CANVAS_H = 330;

/** 왼쪽 판(길)이 차지하는 상자. 원본 px. */
export const TRACK = { x0: 10, x1: 610, y0: 6, y1: 324 } as const;
/** 곧은 길의 화살은 가로로 뻗고, 굽은 길의 방향 몫은 안쪽을 향하므로 세로 여백은 작게. 원본 px. */
export const TRACK_PAD = { x: 85, y: 46 } as const;
/** 오른쪽 판(한 점에 모은 속도 화살)의 중심과 반지름. 원본 px. */
export const HODO = { cx: 722, cy: 172, r: 96 } as const;
/** 모음판 이름의 윗변 높이. 원본 px (textBaseline top). */
export const HODO_TITLE_Y = 6;

/** 빠른 속력일 때 길 위 속도 화살 길이. 원본 px. */
export const VELOCITY_LENGTH = 84;
/** 가장 큰 가속도일 때 가속도 화살 길이. 원본 px. 두 판이 같은 배율을 쓴다. */
export const ACCEL_LENGTH = 62;
/** 모음판 속도 배율 — 빠른 속력의 화살이 판 반지름의 이만큼. */
export const HODO_FILL = 0.95;

// ------------------------------------------------------------------------
// 운동 — 가속도를 두 몫으로 직접 정하는 구간 대본.
// ------------------------------------------------------------------------

/** 느린 속력과 빠른 속력. 모델 단위. */
export const V_SLOW = 50;
export const V_FAST = 130;
/** 한 구간에서 도는 각. */
export const QUARTER_TURN = Math.PI / 4;
/** 프레임 표의 해상도 — 원본이 60 프레임 단위로 적분했다. */
export const TABLE_FPS = 60;
/** 한 프레임 안에서 위치를 나눠 적분하는 수. */
export const TABLE_SUBSTEPS = 24;
/** 모음판 화살 끝 자취의 길이(초). 원본 150 프레임. */
export const TAIL_SECONDS = 2.5;

/** 구간의 종류 — 캡션과 대본을 함께 정한다. */
export type LegKind = 'straightUp' | 'turn' | 'slowTurn' | 'fastTurn' | 'straightDown';

/** 구간 하나가 하는 일. `dv` 는 속력 변화, `turn` 은 도는 각(원본 화면에서 시계 방향). */
export interface Leg {
  kind: LegKind;
  dv: number;
  turn: number;
}

const LEG: Record<LegKind, Leg> = {
  straightUp: { kind: 'straightUp', dv: V_FAST - V_SLOW, turn: 0 },
  turn: { kind: 'turn', dv: 0, turn: QUARTER_TURN },
  slowTurn: { kind: 'slowTurn', dv: V_SLOW - V_FAST, turn: QUARTER_TURN },
  fastTurn: { kind: 'fastTurn', dv: V_FAST - V_SLOW, turn: QUARTER_TURN },
  straightDown: { kind: 'straightDown', dv: V_SLOW - V_FAST, turn: 0 },
};

/**
 * 시간표 단계 id → 그 단계의 대본. 단계의 **길이**는 아래 `timeline` 이 정하고,
 * 이 표는 그 동안 속력이 얼마나 바뀌고 얼마나 도는지만 정한다.
 *
 * 뒤 반 바퀴(`b`)는 앞 반 바퀴(`a`)와 같은 여섯 구간이다. 180° 돌린 자리에서 되풀이하므로
 * 길이 저절로 닫힌다.
 */
export const SCRIPT: Readonly<Record<string, Leg>> = {
  aStraightUp: LEG.straightUp,
  aTurn1: LEG.turn,
  aSlowTurn: LEG.slowTurn,
  aFastTurn: LEG.fastTurn,
  aTurn2: LEG.turn,
  aStraightDown: LEG.straightDown,
  bStraightUp: LEG.straightUp,
  bTurn1: LEG.turn,
  bSlowTurn: LEG.slowTurn,
  bFastTurn: LEG.fastTurn,
  bTurn2: LEG.turn,
  bStraightDown: LEG.straightDown,
};

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const tangentialNormalAccelerationMessages = Object.freeze({
  'label.title': { ko: '접선·법선 가속도', en: 'Tangential and normal acceleration' },
  'label.stage': { ko: '기본', en: 'Default' },
  'label.view': { ko: '기본', en: 'Default' },
  'label.speedPart': { ko: '속력 몫', en: 'speed part' },
  'label.turnPart': { ko: '방향 몫', en: 'turning part' },
  'label.hodograph': { ko: '속도 화살을 한 점에 모아 보면', en: 'Velocity arrows gathered at one point' },
  'caption.straightUp': {
    ko: '곧게 가며 빨라진다 — 가속도가 모두 속력 몫이라, 속도 화살은 늘어나기만 한다',
    en: 'Speeding up on a straight path — all of the acceleration is the speed part, so the velocity arrow only grows',
  },
  'caption.turn': {
    ko: '같은 빠르기로 돈다 — 가속도가 모두 방향 몫이라, 속도 화살은 길이 그대로 돌기만 한다',
    en: 'Turning at constant speed — all of the acceleration is the turning part, so the arrow only rotates',
  },
  'caption.slowTurn': {
    ko: '느려지며 돈다 — 가속도가 두 몫으로 갈려, 속도 화살이 줄어들면서 돈다',
    en: 'Slowing while turning — the acceleration splits in two, so the arrow shrinks as it rotates',
  },
  'caption.fastTurn': {
    ko: '빨라지며 돈다 — 가속도가 두 몫으로 갈려, 속도 화살이 늘어나면서 돈다',
    en: 'Speeding up while turning — the acceleration splits in two, so the arrow grows as it rotates',
  },
  'caption.straightDown': {
    ko: '곧게 가며 느려진다 — 속력 몫이 뒤를 향해, 속도 화살은 줄어들기만 한다',
    en: 'Slowing on a straight path — the speed part points backward, so the arrow only shrinks',
  },
} satisfies Record<string, LocalizedText>);

export type TangentialNormalAccelerationMessageKey = keyof typeof tangentialNormalAccelerationMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 통로. */
export const text = (key: TangentialNormalAccelerationMessageKey): LocalizedText =>
  tangentialNormalAccelerationMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 타입이 막는다. */
function key(k: TangentialNormalAccelerationMessageKey): string {
  return k;
}

/** 원본의 구간 길이 — 곧은 길·두 몫 구간 132 프레임(2.2 초), 같은 빠르기로 도는 구간 120 프레임(2 초). */
const LONG = 2.2;
const SHORT = 2.0;

const HALF_LAP = (side: 'a' | 'b'): TimelinePhase[] => [
  { id: `${side}StraightUp`, duration: LONG, caption: key('caption.straightUp') },
  { id: `${side}Turn1`, duration: SHORT, caption: key('caption.turn') },
  { id: `${side}SlowTurn`, duration: LONG, caption: key('caption.slowTurn') },
  { id: `${side}FastTurn`, duration: LONG, caption: key('caption.fastTurn') },
  { id: `${side}Turn2`, duration: SHORT, caption: key('caption.turn') },
  { id: `${side}StraightDown`, duration: LONG, caption: key('caption.straightDown') },
];

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

/**
 * 프레이밍 — 원본 캔버스 전체(가로 ±4.3, 세로 ±1.65)와 그 아래 캡션 한 줄 자리.
 * 원본은 캡션을 캔버스 밖 아래에 DOM 으로 두었다(6 px 띄워 15 px 글자).
 */
export const CAPTION_Y = -(CANVAS_H / 2 + 20) / PX_PER_UNIT;
export const SCENE_BOUNDS = {
  minX: -CANVAS_W / 2 / PX_PER_UNIT,
  maxX: CANVAS_W / 2 / PX_PER_UNIT,
  minY: CAPTION_Y - 0.16,
  maxY: CANVAS_H / 2 / PX_PER_UNIT,
} as const;

export const tangentialNormalAccelerationSchema: BundleSchema = {
  id: TANGENTIAL_NORMAL_ACCELERATION_ID,
  title: text('label.title'),
  category: 'kinematics',
  timeModel: 'periodic',

  // 조작기가 없다 — 다섯 경우를 대본이 모두 돌며 보여 준다 (원본 NOTES).
  parameters: [],
  stages: [{ id: 'default', label: text('label.stage'), constants: {} }],
  environments: [],
  views: [{ id: 'default', label: text('label.view'), default: true }],

  /** 원본 860×330 + 캡션 줄. 가로가 배율을 묶으므로(900 px 창에서 약 90 px/단위) 세로에 여백(위아래 36 px)을 더한 높이. */
  canvas: { height: 404, minHeight: 320 },

  /**
   * 한 바퀴(25.6 초) — 반 바퀴 여섯 구간을 두 번. 끝나면 처음 구간으로 이어지고,
   * 길이 닫혀 있어 끊김이 없다.
   */
  timeline: { phases: [...HALF_LAP('a'), ...HALF_LAP('b')] },

  // 도착한 순간 이미 첫 구간(곧게 빨라짐)의 한가운데 — 원본은 48 프레임 앞당겨 열었다.
  startAt: 0.8,

  // 원본이 그린 순서 그대로 겹친다 — 물체가 제 속도 화살의 꼬리를 덮는다.
  drawOrder: 'scene',

  // 그림 아래 한 줄, 가운데 정렬 15 px 먹색. 원본은 구간이 바뀔 때 0.25 초 페이드.
  caption: {
    anchor: { world: [0, CAPTION_Y] },
    align: 'center',
    fontSize: 15,
    fade: 0.25,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  // 그리드·카메라 버튼 없음 (기본값). 숫자·곡률 중심·범례도 두지 않는다 (원본 inventory 「hidden」).

  messages: tangentialNormalAccelerationMessages,
};
