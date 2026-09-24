// ========================================================================
// gyroscopic-precession — 선언
// ========================================================================
// 질문: 무게가 축 끝을 끌어내리는데, 왜 자이로스코프 축은 떨어지지 않고 옆으로 도는가.
//
// 동사: 방향만 돈다. 돌림힘이 L 끝에 늘 옆으로 더해져, L 은 길이 그대로 방향만 돈다.
// 원본: tasks/piece-lab/gyroscopic-precession.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:gyroscopic-precession` 와 문자 그대로 일치한다 (C4). */
export const GYROSCOPIC_PRECESSION_ID = 'gyroscopic-precession';

// ------------------------------------------------------------------------
// 물리 · 배치 상수 — 원본 index.html 의 값 그대로
// ------------------------------------------------------------------------

/** 돌림힘 크기 τ = 무게 × 받침점-원판 거리 = 1 (단위 약속). */
export const TAU = 1;
/** 스핀(|L|) 기본값 · 범위 · 간격. */
export const DEFAULT_L = 3.5;
export const L_RANGE: [number, number] = [2, 6];
export const L_STEP = 0.5;
/** 1 초마다 돌림힘이 더한 몫(τ·1초)을 토막 하나로 남긴다. */
export const DEPOSIT = 1;
/** 도착한 순간 이미 쌓여 있는 토막 수. */
export const SEED = 5;
/** 시작 세차각(rad). */
export const PHI0 = -0.35;
/** 원판이 제 축으로 도는 빠르기 계수 — 스핀각 속도 = 이 값 × |L|. */
export const SPIN_RATE = 2.4;

/** 받침점 ~ 원판 중심(세계 길이). */
export const AXLE = 1.0;
export const DISK_R = 0.45;
/** L 1 단위를 세계 길이로 바꾸는 배율. 돌림힘 토막도 같은 배율이다. */
export const L_DRAW = 0.45;
/** 받침대 높이(받침점 아래 바닥까지). */
export const POST_H = 1.25;
/** 무게 화살표 길이(세계 길이, 아래로). */
export const WEIGHT_LEN = 0.62;

/** 고정 시점 — 옆으로 돌린 각과 내려다보는 각(rad). */
export const YAW = 0.5;
export const ELEV = 0.42;

/**
 * 원본 캔버스의 배율(840 px 폭에서 세계 1 = 110 px). 화면 px 로 정한 원본 치수
 * (화살촉 · 받침 타원 · 이름표 거리)를 투영 평면 단위로 바꿀 때만 쓴다.
 */
export const ORIGINAL_PX_PER_UNIT = 110;

/**
 * 프레이밍. 원본 캔버스 840 × 340 을 투영 평면 단위로 옮긴 것 — 받침점이 가로 가운데,
 * 세로 41% 높이에 놓인다. 아래로 붙인 띠는 원본에서 캔버스 밖 한 줄이던 캡션 · 조절기 자리다.
 */
export const SCENE_BOUNDS = {
  minX: -420 / ORIGINAL_PX_PER_UNIT,
  maxX: 420 / ORIGINAL_PX_PER_UNIT,
  minY: -(340 - 340 * 0.41) / ORIGINAL_PX_PER_UNIT - 0.5,
  maxY: (340 * 0.41) / ORIGINAL_PX_PER_UNIT,
} as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const gyroscopicPrecessionMessages = Object.freeze({
  'label.title': { ko: '세차 운동', en: 'Gyroscopic precession' },
  'label.operation': { ko: '돌림힘이 각운동량 방향을 돌리는 것', en: 'Torque turning the direction of angular momentum' },
  'label.stage': { ko: '기본', en: 'Default' },
  'label.view': { ko: '기본', en: 'Default' },
  /** 각운동량 화살표 이름. 기호라 두 언어가 같다 (C1 판정 3). */
  'label.momentum': { ko: 'L', en: 'L' },
  'label.torque': { ko: '돌림힘', en: 'torque' },
  'label.weight': { ko: '무게', en: 'weight' },
  'control.spin': { ko: '스핀', en: 'Spin' },
  /** 조절기 옆 — 지금 스핀에서 한 바퀴 도는 데 걸리는 시간. 자릿수는 조각이 정한다. */
  'label.period': { ko: '한 바퀴 {T}초', en: '{T} s per turn' },
  'caption.main': {
    ko: '돌림힘은 L 끝에 늘 옆으로 더해진다 — 그래서 축은 떨어지지 않고, L 은 길이 그대로 방향만 돈다.',
    en: 'Torque is always added sideways at the tip of L — so the axle does not fall, and L keeps its length and only turns.',
  },
} satisfies Record<string, LocalizedText>);

export type GyroscopicPrecessionMessageKey = keyof typeof gyroscopicPrecessionMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 통로. */
export const text = (key: GyroscopicPrecessionMessageKey): LocalizedText => gyroscopicPrecessionMessages[key];

/** 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: GyroscopicPrecessionMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const gyroscopicPrecessionSchema: BundleSchema = {
  id: GYROSCOPIC_PRECESSION_ID,
  label: text('label.title'),
  category: 'oscillation',
  operation: text('label.operation'),
  timeModel: 'continuous',
  parameters: [],
  stages: [{ id: 'default', label: text('label.stage'), constants: {} }],
  environments: [],
  views: [{ id: 'default', label: text('label.view'), default: true }],

  /** 원본 캔버스 340 px 에 캡션 · 조절기 한 줄을 더한 높이. 마운트 뒤 바뀌지 않는다. */
  canvas: { height: 470, minHeight: 400 },

  /**
   * 겹침이 원본 순서여야 한다 — 수평면 점선 · 그림자 · 받침대 · 토막 · 축과 원판 · 무게 · L · 돌림힘.
   * 반투명 원판이 뒤의 토막을 덮고, 화살표 셋이 원판 위에 온다.
   */
  drawOrder: 'scene',

  /**
   * 시간표가 없다. 원본에는 주기 안 단계가 없고, 세차각 · 스핀각 · 토막은 스핀 조작값에
   * 따라 쌓이는 누적이라 `step` 이 상태에 쌓는다 (physics.ts). 도착 시 토막 5개는 원본처럼
   * 초기 상태가 같은 세차 각속도로 역산해 미리 둔다 — 시계를 앞당기지 않는다.
   */

  // 슬롯 하나. 고정 한 문장 — 스핀 값과 무관하게 참이다.
  caption: {
    anchor: { screen: 'bottom-left', offset: [4, -8] },
    align: 'left',
    fontSize: 15,
    wrapWidth: 470,
    style: { colorRole: 'ink', emphasis: 'strong' },
    text: key('caption.main'),
  },

  // 그리드 · 카메라 버튼 없음 (기본). 카메라가 움직이면 축의 회전과 시점의 회전이 섞인다.

  messages: gyroscopicPrecessionMessages,
};
