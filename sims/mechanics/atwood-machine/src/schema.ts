// ========================================================================
// atwood-machine — 선언
// ========================================================================
// 질문: 도르래 양쪽 추 가운데 무엇이 가속도를 정하나 — 무거운 것인가, 두 추의 차이인가.
//
// 두 추 질량의 합을 5 kg 으로 묶어 두면 가속도 a = 차이·g/합 은 차이만 따라간다.
// 차이가 두 배면 같은 0.1 초 동안 내려오는 거리도 두 배다 — 자취 점 간격이 1:2 로 벌어진다.
//
// 원본: tasks/piece-lab/atwood-machine (사용자 검토 뒤 다시 만든 판).
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:atwood-machine` 와 문자 그대로 일치한다 (C4). */
export const ATWOOD_MACHINE_ID = 'atwood-machine';

// ------------------------------------------------------------------------
// 물리 값 — 원본 상수 그대로
// ------------------------------------------------------------------------

/** 중력 가속도 (m/s²). */
export const G = 9.8;
/** 두 기계 모두 두 추 질량의 합 (kg). */
export const TOTAL = 5.0;
/** 왼쪽 기계의 차이 (고정, kg). */
export const DIFF_LEFT = 0.5;
/** 오른쪽 기계의 차이 기본값 (kg). */
export const DIFF_DEFAULT = 1.0;
/** 조절기 범위와 간격 (kg). */
export const DIFF_RANGE: readonly [number, number] = [0, 2];
export const DIFF_STEP = 0.1;
/** 무거운 추가 내려오는 거리 (m). */
export const DROP = 1.6;
/** 둘 다 닿은 뒤 멈춰 보여 주는 시간 (s). */
export const HOLD = 1.8;
/** 자취 간격 (s). */
export const STROBE = 0.1;
/** 첫 화면이 이미 움직이는 중이도록 앞당기는 시간 (s). */
export const LEAD = 0.2;
/** 왼쪽(차이 0.5 kg) 무거운 추의 착지 시각 √(2·DROP/(0.5·G/TOTAL)) (s). 시간표 첫 단계의 길이. */
export const FALL_PHASE = 1.807;
/** 한 주기 (s) — 시간표 단계 길이의 합. state 의 주기 안 시각이 여기서 되감긴다. */
export const PERIOD = FALL_PHASE + HOLD;

// ------------------------------------------------------------------------
// 배치 — 원본은 860×360 px 캔버스, 1 m = 130 px. 월드는 m, y 위, 바닥이 y = 0.
// ------------------------------------------------------------------------

/** 1 m 당 원본 픽셀. 원본 px 치수를 월드 m 로 옮길 때만 쓴다. */
export const PPM = 130;
/** 원본 캔버스 가로(px). */
export const WIDTH_PX = 860;
/** 원본 바닥선 높이(px, 위에서). */
export const FLOOR_Y_PX = 320;
/** 바닥선이 캔버스 양끝에서 들어온 거리(px). */
export const FLOOR_INSET_PX = 60;
/** 도르래 중심 높이(월드 m) — 원본 PULLEY_Y = 40 px. */
export const PULLEY_Y = (FLOOR_Y_PX - 40) / PPM;
/** 도르래 반지름(월드 m) — 원본 34 px. */
export const PULLEY_R = 34 / PPM;
/** 천장(캔버스 윗변, 월드 m). 도르래 매단 줄이 여기서 내려온다. */
export const CEILING_Y = FLOOR_Y_PX / PPM;
/** 두 도르래 중심 x (월드 m) — 원본 250 · 610 px. */
export const MACHINE_X: readonly [number, number] = [250 / PPM, 610 / PPM];
/** 3.0 kg 추의 한 변(월드 m) — 원본 46 px. 한 변은 질량의 세제곱근에 비례한다. */
export const BASE_SIDE = 46 / PPM;
/** 무거운 추 줄에서 자취열까지 왼쪽으로 떨어진 거리(월드 m) — 원본 44 px. */
export const TRAIL_OFFSET = 44 / PPM;
/** 출발 높이 점선이 자취열 왼쪽으로 더 나가는 길이 · 줄 오른쪽으로 나가는 길이(월드 m). */
export const START_LINE_LEFT = 16 / PPM;
export const START_LINE_RIGHT = 30 / PPM;

/**
 * 고정 경계. 원본 캔버스 전체(0~860 px, 위 0 px) 에 더해 아래로 차이 이름표 · 캡션 ·
 * 조절기 줄이 들어갈 자리를 둔다 — 원본은 캡션과 조절기가 캔버스 밖 DOM 이었다.
 */
export const SCENE_BOUNDS = {
  minX: 0,
  maxX: WIDTH_PX / PPM,
  minY: -0.95,
  maxY: CEILING_Y,
} as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const atwoodMachineMessages = Object.freeze({
  'label.title': { ko: '애트우드 기계', en: 'Atwood machine' },
  'label.stage': { ko: '두 기계', en: 'Two machines' },
  'label.view': { ko: '자취', en: 'Strobe' },
  /** 기계 아래 이름표. 값은 소수 첫째 자리로 끼운다. */
  'label.diff': { ko: '두 추의 차이 {d} kg', en: 'Difference {d} kg' },
  /** 추 안의 질량. 수만 있는 표식이다 (C1 판정 3). */
  'label.mass': { ko: '{m}', en: '{m}' },
  /** 조절기 이름표. */
  'label.slider': { ko: '오른쪽 기계의 두 추 차이', en: 'Right machine: mass difference' },
  'caption.falling': {
    ko: '합은 둘 다 5 kg, 차이는 {ratio}배 — 오른쪽 점 간격이 왼쪽의 {ratio}배로 벌어진다',
    en: 'Both total 5 kg, the difference is {ratio}× — the right dots spread {ratio}× as far apart',
  },
  'caption.equal': {
    ko: '합도 차이도 같다 — 두 자취열의 점 간격이 똑같이 벌어진다',
    en: 'Same total, same difference — both rows of dots spread apart alike',
  },
  'caption.rightFirst': {
    ko: '오른쪽 추가 먼저 닿았다 — 왼쪽은 같은 0.1초에 더 짧게 내려오는 중이다',
    en: 'The right block lands first — the left one still falls less in each 0.1 s',
  },
  'caption.leftFirst': {
    ko: '왼쪽 추가 먼저 닿았다 — 오른쪽은 같은 0.1초에 더 짧게 내려오는 중이다',
    en: 'The left block lands first — the right one still falls less in each 0.1 s',
  },
  'caption.arrival': {
    ko: '1.6 m 를 내려오는 데 왼쪽 {tLeft}초, 오른쪽 {tRight}초',
    en: 'Falling 1.6 m takes {tLeft} s on the left, {tRight} s on the right',
  },
  'caption.still': {
    ko: '오른쪽 두 추의 차이가 0 — 합은 5 kg 그대로인데 추가 움직이지 않는다',
    en: 'No difference on the right — still 5 kg in total, yet the blocks do not move',
  },
} satisfies Record<string, LocalizedText>);

export type AtwoodMachineMessageKey = keyof typeof atwoodMachineMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 통로. */
export const text = (key: AtwoodMachineMessageKey): LocalizedText => atwoodMachineMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: AtwoodMachineMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const atwoodMachineSchema: BundleSchema = {
  id: ATWOOD_MACHINE_ID,
  title: text('label.title'),
  category: 'mechanics',
  timeModel: 'periodic',
  parameters: [],
  stages: [
    {
      id: 'default',
      label: text('label.stage'),
      constants: { g: G, total: TOTAL, drop: DROP },
    },
  ],
  environments: [],
  views: [{ id: 'default', label: text('label.view'), default: true }],

  /** 원본 캔버스 360 px + 이름표 · 캡션 · 조절기 줄. */
  canvas: { height: 480, minHeight: 420 },

  /** 겹침이 원본 순서여야 한다 — 바닥 · 이름표 · 점선 · 자취 · 줄 · 도르래 · 추. */
  drawOrder: 'scene',

  /** 도착한 순간 이미 내려오는 중 — 원본은 주기 0.2 초째로 앞당겨 열었다. */
  startAt: LEAD,

  /**
   * 한 주기 — 내려오다(fall) · 둘 다 닿은 채 멈춘다(hold). 왼쪽 착지
   * √(2·1.6/0.98) = 1.807 s + 멈춤 1.8 s = 3.607 s. 원본의 기본 주기(가장 늦은 착지 + 멈춤)와 같다.
   *
   * 추의 자리는 단계가 아니라 주기 안 시각의 닫힌 식이라, 조절기가 시계를 0 으로 되돌리면
   * 그대로 처음이 된다. 단계는 주기의 길이만 정하고 캡션을 말하지 않는다 — 문장은 조절기
   * 값에 따라 달라지는 **실제 착지**로 고른다(아래 `caption.cases`).
   *
   * 한계 — 주기 길이가 조절기 값을 따라가지 못한다 (NOTES.md 「어휘 부족」).
   */
  timeline: {
    phases: [
      { id: 'fall', duration: FALL_PHASE },
      { id: 'hold', duration: HOLD },
    ],
  },

  /**
   * 슬롯 하나. 원본은 그림 아래 왼쪽 정렬 15 px 한 줄이었다.
   *
   * 원본은 매 프레임 착지 시각과 주기 안 시각을 견줘 문장을 골랐다. 여기서는 physics 가
   * 같은 비교를 해 착지 여부를 state 에 두고, 슬롯은 위에서부터 참인 첫 항목을 쓴다.
   * 아무것도 참이 아니면(둘 다 내려오는 중) 배수 문장이다.
   */
  caption: {
    anchor: { world: [16 / PPM, -0.42] },
    align: 'left',
    fontSize: 15,
    style: { colorRole: 'ink', emphasis: 'strong' },
    text: key('caption.falling'),
    cases: [
      { when: 'still', text: key('caption.still') },
      { when: 'bothLanded', text: key('caption.arrival') },
      { when: 'rightOnlyLanded', text: key('caption.rightFirst') },
      { when: 'leftOnlyLanded', text: key('caption.leftFirst') },
      { when: 'equal', text: key('caption.equal') },
    ],
    vars: { ratio: 'ratioText', tLeft: 'tLeftText', tRight: 'tRightText' },
  },

  // 그리드 · 카메라 버튼은 원본에 없다 — 켜지 않는다.

  messages: atwoodMachineMessages,
};
