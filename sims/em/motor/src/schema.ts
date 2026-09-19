// ========================================================================
// motor — 선언
// ========================================================================
// 질문: 자기장 속 고리에 전류를 흘리면 왜 한 번 기울고 마는 것이 아니라 계속 도는가.
//
// 답: 양 변에 전류가 반대로 흘러 반대쪽 힘을 받으니 고리가 돈다. 그런데 고리가 수직
// 자리(고리 면이 자기장에 직각)를 넘으면 같은 힘이 도로 끌어당긴다. **정류자가 그 순간
// 코일 전류를 뒤집어** 힘을 다시 같은 돌림 쪽으로 돌려 놓으므로 고리는 한쪽으로 계속 돈다.
// 정류자 없이 늘 이어져 있으면 고리는 수직 자리 둘레에서 흔들리다 멈춘다.
//
// 동사: 수직 자리를 지날 때마다 ⊙ · ⊗ 와 힘이 **뒤집히고**, 고리가 한쪽으로 **계속 돈다.**
//
// 이웃 `force-on-current-wire` 는 도선 한 가닥이 힘을 받아 **튄다** 는 이야기다. 이 조각은
// 그 힘을 받는 가닥 둘이 짝을 이룬 고리가 **계속 도는 까닭**(정류자)을 말한다. 이웃
// `generator` 는 같은 시점(굴대 방향)에서 손으로 돌린 고리가 전류를 **만드는** 이야기다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:motor` 와 문자 그대로 일치한다 (C4). */
export const MOTOR_ID = 'motor';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 자석 사이 자기장 세기(T). 방향은 N(왼쪽) → S(오른쪽). */
export const FIELD = 0.4;
/** 코일 전류(A). 전지가 대는 크기 — 방향은 정류자 · 브러시가 정한다. */
export const CURRENT = 2;
/** 자기장 속에 든 변 하나의 길이(m). 화면 안팎으로 뻗어 있어 화면에는 단면만 보인다. */
export const SIDE_LENGTH = 0.05;
/** 굴대에서 변까지의 거리(m) — 돌림힘의 팔. */
export const ARM_RADIUS = 0.025;
/** 고리(회전자)의 관성 모멘트(kg·m²). 화면 시간으로 도는 빠르기를 정한다. */
export const INERTIA = 1.5e-4;
/** 굴대 마찰 — 각속도에 비례하는 저항 돌림힘의 계수(N·m·s). 끝없이 빨라지지 않고 일정한 빠르기에 이른다. */
export const FRICTION = 3e-4;

// ------------------------------------------------------------------------
// 표시 — 화면 배율 · 시작 자세. 역시 스테이지 상수다 (원칙 2).
// ------------------------------------------------------------------------

/**
 * 힘 1 N 이 차지하는 월드 길이 — F 화살표 길이 배율. 힘 크기가 늘 같아 상한이 없다.
 * 수직 자리에서 굴대 쪽으로 뻗은 화살 끝이 정류자에 닿지 않을 만큼(0.44 월드)으로 둔다.
 */
export const FORCE_SCALE = 11;
/** 출발 자세 — 변 A 의 각(도, 오른쪽에서 반시계). 180 이면 고리가 누워 있고 A 가 왼쪽이다. */
export const START_ANGLE_DEG = 180;
/** 변이 지나온 자리를 남기는 꼬리 길이(조각 시계 초). */
export const TRAIL_SECONDS = 0.45;

// ------------------------------------------------------------------------
// 배치
// ------------------------------------------------------------------------

/** 고리 변(단면)이 도는 반지름(월드). */
export const COIL_RADIUS = 1;
/**
 * 프레이밍. 왼쪽은 자석 · 고리, 오른쪽은 캡션 자리. 매 프레임 같은 값이다 (S-piece).
 */
export const SCENE_BOUNDS = { minX: -2.75, maxX: 6.3, minY: -1.95, maxY: 1.95 } as const;
/** 캡션을 세우는 월드 자리(왼쪽 끝). */
export const CAPTION_AT = [3.05, 0.55] as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const motorMessages = Object.freeze({
  'label.title': { ko: '전동기', en: 'Electric motor' },
  'label.operation': { ko: '전류가 받는 힘으로 도는 것', en: 'Turning by the force on a current' },
  'label.stage': { ko: '기본', en: 'Default' },
  'label.view': { ko: '기본', en: 'Default' },

  /** 극 · 화살표 · 브러시 표식. 기호라 두 언어가 같다 (C1 판정 1 · 3). */
  'label.north': { ko: 'N', en: 'N' },
  'label.south': { ko: 'S', en: 'S' },
  'label.field': { ko: 'B', en: 'B' },
  'label.force': { ko: 'F', en: 'F' },
  'label.plus': { ko: '+', en: '+' },
  'label.minus': { ko: '−', en: '−' },

  'caption.push': {
    ko: '두 변에 전류가 반대로 흘러 한 변은 위로, 다른 변은 아래로 밀린다. 그 짝이 고리를 돌린다.',
    en: 'Current runs opposite ways in the two sides, so one is pushed up and the other down. The pair turns the loop.',
  },
  'caption.flip': {
    ko: '고리가 수직 자리를 지나는 순간 정류자 틈이 브러시를 지나고, 두 변의 전류가 뒤집힌다.',
    en: 'As the loop passes upright, the gaps in the commutator cross the brushes and the current in both sides flips.',
  },
  'caption.run': {
    ko: '뒤집힐 때마다 힘이 다시 같은 돌림 쪽을 향해, 고리는 한쪽으로 계속 돈다.',
    en: 'Each flip points the forces the same way round again, so the loop keeps spinning one way.',
  },
  'caption.ringsIn': {
    ko: '이번에는 정류자 대신 끊김 없는 고리로 잇는다.',
    en: 'This time the loop is connected through unbroken rings instead of a commutator.',
  },
  'caption.rings': {
    ko: '고리가 수직 자리에 다가가도 전류는 뒤집히지 않는다.',
    en: 'As the loop nears upright, the current does not flip.',
  },
  'caption.back': {
    ko: '수직 자리를 넘자 같은 힘이 고리를 도로 끌어당긴다.',
    en: 'Past upright, the same forces pull the loop back.',
  },
  'caption.settle': {
    ko: '고리는 수직 자리 둘레에서 흔들리다 멈춘다.',
    en: 'The loop rocks about upright and comes to rest.',
  },
} satisfies Record<string, LocalizedText>);

export type MotorMessageKey = keyof typeof motorMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: MotorMessageKey): LocalizedText => motorMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: MotorMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const motorSchema: BundleSchema = {
  id: MOTOR_ID,
  label: text('label.title'),
  category: 'em',
  operation: text('label.operation'),
  timeModel: 'periodic',
  parameters: [],
  stages: [
    {
      id: 'default',
      label: text('label.stage'),
      constants: {
        field: FIELD,
        current: CURRENT,
        sideLength: SIDE_LENGTH,
        armRadius: ARM_RADIUS,
        inertia: INERTIA,
        friction: FRICTION,
        forceScale: FORCE_SCALE,
        startAngleDeg: START_ANGLE_DEG,
        trailSeconds: TRAIL_SECONDS,
      },
    },
  ],
  environments: [],
  views: [{ id: 'main', label: text('label.view'), default: true }],

  /** 가로로 넓다 — 왼쪽 자석과 고리, 오른쪽 캡션. */
  canvas: { height: 360, minHeight: 320 },

  /**
   * 쓴 순서대로 겹친다 — 자기장 선, 극, 수직 자리 안내선, 꼬리, 고리 선, 정류자 덮개 · 쪼갠 고리,
   * 브러시, 변 단면(속을 바탕으로 덮어 뒤의 선을 가린다), 전류 표식, 힘, 이름표.
   */
  drawOrder: 'scene',

  /** 도착한 순간 고리가 이미 한쪽으로 돌고 있다 (S-piece). */
  startAt: 2.5,

  /**
   * 한 주기. 각은 `push` 시작(정류자) · `ringsPush` 시작(끊김 없는 고리)부터 적분한다.
   *
   * - `appear` — 옅게 떠오른다. 고리가 누워 있고 전류는 아직 없다.
   * - `push` — 전류가 흐른다. 두 변의 힘이 반대쪽이라 고리가 돌기 시작한다(느리게 보인다).
   * - `flip` — 처음 수직 자리를 지난다. 정류자 틈이 브러시를 지나며 ⊙ · ⊗ 와 힘이 뒤집힌다(더 느리게).
   * - `run` — 반 바퀴마다 뒤집히며 한쪽으로 계속 돈다.
   * - `runOut` — 도는 채로 옅어진다.
   * - `ringsIn` — 정류자 자리에 끊김 없는 고리가 들어서고 고리가 다시 누워 떠오른다. 전류는 아직 없다.
   * - `ringsPush` — 전류가 흐르고 같은 쪽으로 돌기 시작해 수직 자리에 이른다. ⊙ · ⊗ 는 그대로다.
   *
   * `push` · `flip` · `ringsBack` 은 `timeScale` 로 느리게 보인다 — 첫 반 바퀴와 전류가 뒤집히는 순간,
   * 도로 끌려오는 순간은 제 빠르기로는 0.3 초 안팎이다.
   * - `ringsBack` — 수직 자리를 넘은 고리를 같은 힘이 도로 끌어당긴다.
   * - `settle` — 흔들림이 가라앉아 수직 자리에 선다.
   * - `fade` — 옅어지며 물러난다.
   */
  timeline: {
    phases: [
      { id: 'appear', duration: 0.4 },
      { id: 'push', duration: 0.55, timeScale: 0.3, caption: key('caption.push') },
      { id: 'flip', duration: 0.25, timeScale: 0.2, caption: key('caption.flip') },
      { id: 'run', duration: 5, caption: key('caption.run') },
      { id: 'runOut', duration: 0.4, caption: key('caption.run') },
      { id: 'ringsIn', duration: 0.6, caption: key('caption.ringsIn') },
      { id: 'ringsPush', duration: 0.6, caption: key('caption.rings') },
      { id: 'ringsBack', duration: 1, timeScale: 0.5, caption: key('caption.back') },
      { id: 'settle', duration: 3.5, caption: key('caption.settle') },
      { id: 'fade', duration: 0.5, caption: key('caption.settle') },
    ],
  },

  /** 슬롯 하나. 오른쪽 빈 자리에 세운다 — 세로가 비싸 아래 줄을 쓰지 않는다. */
  caption: {
    anchor: { world: [CAPTION_AT[0], CAPTION_AT[1]] },
    align: 'left',
    fontSize: 15,
    wrapWidth: 290,
    fade: 0.3,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  // 그리드 · 카메라 단추 · 조작기 없음. 잴 거리가 없고, 자동 진행이 정류자 있음 · 없음을 모두 지난다.

  messages: motorMessages,
};
