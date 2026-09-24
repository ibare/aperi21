// ========================================================================
// vertical-loop — 선언
// ========================================================================
// 질문: 꼭대기에서 속력이 모자라면 왜 떨어지나 — 속력이 모자라다는 게 화면에서
// 무엇으로 드러나나?
// 답의 동사: 레일을 떠나 떨어진다.
//
// 들어온 속력만 다른 두 공을 나란히 고리에 넣는다. 느린 공은 꼭대기 전에 레일이
// 미는 힘이 0 이 되어 레일을 떠나 포물선으로 떨어지고, 빠른 공은 꼭대기에서도
// 최소 속력 기준보다 빨라 레일에 눌린 채 계속 돈다.
// 원본: tasks/piece-lab/vertical-loop
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';
import { CYCLE, FAIL_IMPACT, FAIL_SEP, G } from './physics';

/** 등록 키 `aperi21:vertical-loop` 와 문자 그대로 일치한다 (C4). */
export const VERTICAL_LOOP_ID = 'vertical-loop';

// ------------------------------------------------------------------------
// 기하 — 월드 1 단위 = 공 중심이 도는 원의 반지름. 고리 중심이 y = 0, y 는 위.
//
// 원본은 가로 900 px 캔버스에서 공 중심 원 반지름이 106.5 px 였다(레일 118 − 공 10
// − 1.5). 아래 값은 그 화면 px 를 106.5 로 나눈 것이다.
// ------------------------------------------------------------------------

/** 원본 화면에서 월드 1 단위의 길이(px). 화면 px 로 적힌 원본 치수를 옮길 때만 쓴다. */
const ORIGINAL_PX = 106.5;

/** 두 고리 중심의 x. 원본 W·0.28 / W·0.72 → 가운데에서 ±198 px. */
export const LOOPS: readonly { id: 'pass' | 'fail'; x: number }[] = [
  { id: 'pass', x: -198 / ORIGINAL_PX },
  { id: 'fail', x: 198 / ORIGINAL_PX },
];
/** 레일(회색 원) 반지름. 원본 118 px. */
export const RAIL_RADIUS = 118 / ORIGINAL_PX;
/** 공 반지름. 원본 BALL_R = 10 px. */
export const BALL_RADIUS = 10 / ORIGINAL_PX;
/** 꼭대기 최소 속력 기준 화살표의 높이 — 레일 꼭대기에서 14 px 위. */
export const REFERENCE_Y = RAIL_RADIUS + 14 / ORIGINAL_PX;
/** 속력 1 이 차지하는 월드 길이. 원본 √(gR) → 38 px. 기준 화살표와 공의 화살표가 같은 자를 쓴다. */
export const SPEED_SCALE = 38 / Math.sqrt(G) / ORIGINAL_PX;
/** 수직항력(질량당) 1 이 차지하는 월드 길이. 원본 g → 14 px. */
export const NORMAL_SCALE = 14 / G / ORIGINAL_PX;
/** 힘 화살표 이름표를 붙이는 최소 길이. 원본 22 px. */
export const NORMAL_LABEL_MIN = 22 / ORIGINAL_PX;
/** 화살촉 크기. 원본 최대 9 px. */
export const ARROW_HEAD = 9 / ORIGINAL_PX;
/** 레일을 떠난 지점 고리 반지름. 원본 BALL_R + 5 = 15 px. */
export const SEP_RING_RADIUS = 15 / ORIGINAL_PX;

/**
 * 프레이밍 — 고정 경계. 위는 기준 화살표 이름표(원본 y 34 px), 아래는 공 이름표(원본
 * y 324 px) 밑에 캡션 한 줄 자리까지. 세로가 배율을 정해 원본과 같은 106.5 px/단위가 된다
 * (캔버스 420, 여백 36 씩). 가로는 이름표 「레일을 떠남」 까지 담는다.
 */
export const SCENE_BOUNDS = { minX: -3.6, maxX: 3.6, minY: -1.77, maxY: 1.5 } as const;

// ------------------------------------------------------------------------
// 연출 — 순환 6 초. 캡션 전환 시각은 느린 공의 사건 시각에서 나온다
// ------------------------------------------------------------------------

/** 느린 공이 레일을 떠나기 이만큼 앞서 캡션이 바뀐다(초). 원본 0.3. */
const LEAVE_CAPTION_LEAD = 0.3;
/** 순환 끝에서 떨어진 공과 그 흔적이 흐려지는 시간(초). 원본 0.4. */
const FADE_OUT = 0.4;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const verticalLoopMessages = Object.freeze({
  'label.title': { ko: '연직 원운동', en: 'Vertical loop' },
  'label.operation': {
    ko: '꼭대기에서 떨어지지 않는 최소 속력',
    en: 'The minimum speed that keeps a ball on the loop at the top',
  },
  'label.stage': { ko: '기본', en: 'Default' },
  'label.view': { ko: '기본', en: 'Default' },
  'label.minSpeed': { ko: '꼭대기에서 필요한 최소 속력', en: 'Minimum speed needed at the top' },
  'label.normal': { ko: '레일이 미는 힘', en: 'Push from the rail' },
  'label.leftRail': { ko: '레일을 떠남', en: 'Leaves the rail' },
  'label.fastBall': { ko: '빠르게 들어온 공', en: 'Ball that came in fast' },
  'label.slowBall': { ko: '조금 느리게 들어온 공', en: 'Ball that came in a little slower' },
  'caption.rise': {
    ko: '두 공 모두 레일에 눌린 채 올라간다 — 높아질수록 느려지고, 레일이 미는 힘도 줄어든다',
    en: 'Both balls climb pressed against the rail — the higher they go, the slower they move and the weaker the rail pushes',
  },
  'caption.leave': {
    ko: '오른쪽 공은 레일이 미는 힘이 0 이 되자 꼭대기에 닿기 전에 레일을 떠나 떨어진다',
    en: 'When the rail’s push on the right ball reaches zero, it leaves the rail before the top and falls',
  },
  'caption.pass': {
    ko: '왼쪽 공은 꼭대기에서도 최소 속력보다 빨라, 레일에 눌린 채 계속 돈다',
    en: 'The left ball is faster than the minimum speed even at the top, so it stays pressed to the rail and keeps looping',
  },
} satisfies Record<string, LocalizedText>);

export type VerticalLoopMessageKey = keyof typeof verticalLoopMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 통로. */
export const text = (key: VerticalLoopMessageKey): LocalizedText => verticalLoopMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: VerticalLoopMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

const RISE_END = FAIL_SEP.t - LEAVE_CAPTION_LEAD;
const FADE_START = CYCLE - FADE_OUT;

export const verticalLoopSchema: BundleSchema = {
  id: VERTICAL_LOOP_ID,
  label: text('label.title'),
  category: 'mechanics',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 두 속력의 대비로 주장이 끝나고, 속력을 바꿔 보게 하면 주장이
  // "경계값 찾기" 로 옮겨 간다 (원본 NOTES (c)).
  parameters: [],

  stages: [{ id: 'default', label: text('label.stage'), constants: {} }],
  environments: [],
  views: [{ id: 'default', label: text('label.view'), default: true }],

  /**
   * 원본은 캔버스 360 px + 캡션 한 줄. 캡션이 캔버스 안으로 들어오고 엔진 여백(위아래 36)이
   * 붙어, 공 이름표와 캡션 사이를 원본만큼(약 55 px) 띄우려면 420 이 필요하다.
   */
  canvas: { height: 420, minHeight: 360 },

  /**
   * 한 순환 6 초 = 통과 공 두 바퀴. 단계는 캡션이 하는 말과 끝의 흐려짐으로 나뉜다.
   *
   * - rise  — 두 공이 함께 오른다. 느린 공이 떠나기 0.3 초 전까지.
   * - leave — 느린 공이 레일을 떠나 떨어진다. 착지까지(약 3.60 초).
   * - pass  — 떨어진 공은 멈춰 있고, 빠른 공이 계속 돈다.
   * - fade  — 마지막 0.4 초, 떨어진 공과 흔적이 흐려진다. 캡션은 pass 와 같은 문장이다.
   *
   * 단계 경계는 느린 공의 사건 시각에서 계산한다 — 운동을 바꾸면 캡션이 함께 따라간다.
   * 운동 자체는 단계가 아니라 조각 시계(`u`)로 표를 읽는다.
   */
  timeline: {
    phases: [
      { id: 'rise', duration: RISE_END, caption: key('caption.rise') },
      { id: 'leave', duration: FAIL_IMPACT.t - RISE_END, caption: key('caption.leave') },
      { id: 'pass', duration: FADE_START - FAIL_IMPACT.t, caption: key('caption.pass') },
      { id: 'fade', duration: FADE_OUT, caption: key('caption.pass') },
    ],
  },

  // 원본 순서 그대로 겹친다 — 공이 제 화살표의 꼬리를 덮는다.
  drawOrder: 'scene',

  // 원본은 캔버스 아래 가운데 한 줄, 15 px 본문 먹색. 바로 바뀐다(페이드 없음).
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -20] },
    align: 'center',
    fontSize: 15,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  // 그리드도 카메라 버튼도 없다 (기본값). 숫자·공식·중력 화살표는 원본 inventory 「hidden」.

  messages: verticalLoopMessages,
};
