// ========================================================================
// inertial-vs-gravitational-mass — 선언
// ========================================================================
// 질문: 질량을 「얼마나 세게 끌리나」로 정의한 것과 「얼마나 밀기 어렵나」로 정의한 것은
// 다른 정의인데, 정말 같은 값이 나오는가.
//
// 왼쪽 저울은 중력만으로, 오른쪽 얼음 위 밀어내기는 관성만으로 물체를 추 n 개와 견준다.
// 추를 1 개씩 늘려 가면 두 곳이 **같은 개수에서 함께** 균형을 이룬다.
//
// 원본: tasks/piece-lab/inertial-vs-gravitational-mass.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:inertial-vs-gravitational-mass` 와 문자 그대로 일치한다 (C4). */
export const INERTIAL_VS_GRAVITATIONAL_MASS_ID = 'inertial-vs-gravitational-mass';

// ------------------------------------------------------------------------
// 물체 — 원본 OBJECTS 그대로. 질량은 두 정의가 함께 쓰는 하나의 값(단위: 추 한 개).
// 크기와 질량을 일부러 엇갈리게 둔다 (크다고 무겁지 않다).
// ------------------------------------------------------------------------

export type ObjectKey = 'stone' | 'iron' | 'wood';

export interface ObjectDef {
  readonly key: ObjectKey;
  /** 질량 (추 개수). 화면에 숫자로 띄우지 않는다 — 추 개수가 곧 눈금이다. */
  readonly mass: number;
  /** 크기 `[너비, 높이]` (원본 px = 월드 단위). */
  readonly size: readonly [number, number];
  /**
   * 채움의 빛의 양 — 먹(`ink`)을 바탕 위에 얹는 비율. 원본은 물체마다 고정색이었다
   * (돌 회갈색 · 쇠공 짙은 청회색 · 나무토막 옅은 황갈색). 색 역할에 흙빛이 없어 짙기의 순서만 지킨다.
   */
  readonly luminance: number;
}

export const OBJECTS: Readonly<Record<ObjectKey, ObjectDef>> = Object.freeze({
  stone: { key: 'stone', mass: 3, size: [46, 36], luminance: 0.55 },
  iron: { key: 'iron', mass: 4, size: [30, 30], luminance: 0.8 },
  wood: { key: 'wood', mass: 2, size: [64, 40], luminance: 0.35 },
});

/** 자동 진행이 쓰는 물체. */
export const DEFAULT_OBJECT: ObjectKey = 'stone';

// ------------------------------------------------------------------------
// 시험 시간 — 원본 그대로
// ------------------------------------------------------------------------

/** 추를 올리고 받침·용수철로 잡아 둔 시간 (s). */
export const HOLD = 0.8;
/** 놓은 뒤 지켜보는 시간 — 추가 모자랄 때 (s). */
export const RUN = 3.4;
/** 개수가 맞았을 때 더 오래 보여 주는 시간 (s). */
export const RUN_MATCH = 5.2;
/** 도착한 순간 이미 진행 중이도록 미리 굴리는 시간 (s). 원본 START_OFFSET. */
export const LEAD = 0.5;

// ------------------------------------------------------------------------
// 물리 상수
// ------------------------------------------------------------------------

/** 저울 각가속도 계수. 원본 G_TORQUE. */
export const G_TORQUE = 2.0;
/** 저울대 자체의 버팀. 원본 BEAM_INERTIA. */
export const BEAM_INERTIA = 0.5;
/** 각속도 감쇠. 원본 BEAM_DAMP. */
export const BEAM_DAMP = 3.0;
/** 받침대 멈춤 각 (rad). 원본 THETA_MAX. */
export const THETA_MAX = 0.2;
/**
 * **원본과 다르다 (사용자 승인).** 모자란 추 한 개당 저울이 멈추는 기울기 (rad).
 *
 * 원본은 되돌리는 힘이 없어 저울이 멈춤 각까지 기울었다 — 추 1 개와 2 개의 기울기가 같아
 * 「모자람이 줄어든다」가 저울에서 보이지 않았다. 되돌리는 돌림힘을 두어 평형각이
 * (물체 질량 − 추 개수) 에 비례하게 한다. 가장 큰 모자람(쇠공 · 추 1 개 = 3)에서도
 * 넘침 포함 약 0.18 rad 라 멈춤 각 0.2 에 닿지 않는다.
 */
export const TILT_PER_UNIT = 0.055;
/** 용수철이 양쪽에 주는 충격량 (px·추/s). 원본 IMPULSE. */
export const IMPULSE = 48;

// ------------------------------------------------------------------------
// 배치 — 원본 860×260 px 캔버스. 월드 단위 = 원본 px, y 는 위, 캔버스 바닥이 y = 0.
// ------------------------------------------------------------------------

/** 원본 캔버스 가로 · 세로 (px). */
export const WIDTH = 860;
export const HEIGHT = 260;
/** 받침점 (월드). 원본 화면 (210, 92). */
export const PIVOT: readonly [number, number] = [210, HEIGHT - 92];
/** 저울 팔 길이 · 접시를 매단 줄 길이. */
export const ARM = 140;
export const STRING = 58;
/** 저울 바닥 높이 (월드). 원본 화면 238. */
export const BASE_Y = HEIGHT - 238;
/** 바닥선 반폭 · 기준선이 팔 끝 밖으로 나가는 길이. */
export const BASE_HALF = 50;
export const LEVEL_OVERHANG = 30;
/** 받침대 반폭과, 접시 아래로 띄운 틈. */
export const SUPPORT_HALF = 10;
export const SUPPORT_GAP = 4;
/** 매단 줄이 접시에 닿는 반폭 · 접시 반폭. */
export const HANGER_HALF = 32;
export const PAN_HALF = 36;
/** 접시 위 물체·추가 떠 있는 틈. */
export const PAN_LIFT = 2;
/** 받침점 원 반지름. */
export const PIVOT_R = 5;

/** 얼음판 윗면 높이 (월드). 원본 화면 196. */
export const ICE_Y = HEIGHT - 196;
/** 얼음 띠 두께 · 좌우 끝 · 놓은 자리. */
export const ICE_THICK = 10;
export const ICE_X0 = 450;
export const ICE_X1 = 855;
export const ICE_MID = 650;
/** 놓기 전 물체와 추 사이 틈 (용수철 자리). */
export const GAP = 24;
/** 놓은 자리 눈금 — 윗면 아래 2 px 에서 18 px 까지. */
export const MID_TICK_TOP = 2;
export const MID_TICK_BOTTOM = 18;
/** 용수철 높이 (윗면 위) · 감은 수. */
export const SPRING_LIFT = 10;
export const SPRING_COILS = 5;

/** 추 한 개 `[너비, 높이]`. 쌓을 때 한 칸 높이는 `h` 이고 칠은 `h − 1` (칸 사이 틈). */
export const WEIGHT_BOX: readonly [number, number] = [22, 14];

/** 칸 이름 — 원본 (16, 10) 과 (450, 10), 윗줄 기준 13 px. 월드 앵커는 가운데 높이라 반 줄 내린다. */
export const PANEL_LABEL_FONT = 13;
export const PANEL_LABEL_Y = HEIGHT - 10 - PANEL_LABEL_FONT / 2;
export const PANEL_LABEL_X: readonly [number, number] = [16, ICE_X0];

/** 캡션 — 원본은 캔버스 아래 6 px, 15 px 한 줄 왼쪽 16 px. 가운데 높이로 옮긴다. */
export const CAPTION_FONT = 15;
export const CAPTION_AT: readonly [number, number] = [16, -(6 + CAPTION_FONT * 0.75)];

/**
 * 고정 경계. 원본 캔버스 전체에 더해 아래로 캡션 한 줄과 물체 고르기 줄이 들어갈 자리를
 * 둔다 — 원본은 둘 다 캔버스 밖 DOM 이었다.
 */
export const SCENE_BOUNDS = { minX: 0, maxX: WIDTH, minY: -85, maxY: HEIGHT } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const inertialVsGravitationalMassMessages = Object.freeze({
  'label.title': { ko: '관성 질량과 중력 질량', en: 'Inertial and gravitational mass' },
  'label.stage': { ko: '저울과 얼음', en: 'Balance and ice' },
  'label.view': { ko: '기본', en: 'Default' },
  'label.balance': { ko: '저울 — 끌리는 세기로 비교', en: 'Balance — compared by how hard gravity pulls' },
  'label.ice': { ko: '얼음 위 — 밀리기 어려움으로 비교', en: 'On ice — compared by how hard it is to push' },
  'control.object': { ko: '올려 볼 물체', en: 'Object to test' },
  'object.stone': { ko: '돌', en: 'Stone' },
  'object.iron': { ko: '쇠공', en: 'Iron ball' },
  'object.wood': { ko: '나무토막', en: 'Wood block' },
  'caption.hold': {
    ko: '추 {n}개를 올렸다. 저울의 받침과 얼음 위 용수철을 한꺼번에 놓는다.',
    en: 'Weights on the pan: {n}. Release the balance supports and the spring on the ice together.',
  },
  'caption.shortStone': {
    ko: '추 {n}개: 저울은 돌 쪽으로 기울고, 얼음 위에서는 추가 돌보다 멀리 밀려난다.',
    en: 'Weights {n}: the balance tips toward the stone, and on the ice the weights slide farther than the stone.',
  },
  'caption.shortIron': {
    ko: '추 {n}개: 저울은 쇠공 쪽으로 기울고, 얼음 위에서는 추가 쇠공보다 멀리 밀려난다.',
    en: 'Weights {n}: the balance tips toward the iron ball, and on the ice the weights slide farther than the ball.',
  },
  'caption.shortWood': {
    ko: '추 {n}개: 저울은 나무토막 쪽으로 기울고, 얼음 위에서는 추가 나무토막보다 멀리 밀려난다.',
    en: 'Weights {n}: the balance tips toward the wood block, and on the ice the weights slide farther than the block.',
  },
  'caption.match': {
    ko: '추 {n}개: 저울이 수평을 지키는 바로 그 개수에서, 얼음 위의 둘도 똑같이 밀려난다.',
    en: 'Weights {n}: at exactly the count where the balance stays level, the two on the ice slide apart equally.',
  },
} satisfies Record<string, LocalizedText>);

export type InertialVsGravitationalMassMessageKey = keyof typeof inertialVsGravitationalMassMessages;

export const text = (key: InertialVsGravitationalMassMessageKey): LocalizedText => inertialVsGravitationalMassMessages[key];

/** 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: InertialVsGravitationalMassMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const inertialVsGravitationalMassSchema: BundleSchema = {
  id: INERTIAL_VS_GRAVITATIONAL_MASS_ID,
  title: text('label.title'),
  category: 'mechanics',
  timeModel: 'periodic',
  parameters: [],
  stages: [
    {
      id: 'default',
      label: text('label.stage'),
      constants: { impulse: IMPULSE, thetaMax: THETA_MAX, tiltPerUnit: TILT_PER_UNIT },
    },
  ],
  environments: [],
  views: [{ id: 'default', label: text('label.view'), default: true }],

  /** 원본 캔버스 260 px + 캡션 한 줄 + 물체 고르기 줄. */
  canvas: { height: 360, minHeight: 320 },

  /** 원본이 그린 순서 그대로 겹친다 — 받침대가 접시 아래, 용수철이 두 물체 아래. */
  drawOrder: 'scene',

  /**
   * 도착한 순간 이미 추 1 개 시험이 놓이기 직전이다 — 원본은 시험 시계를 0.5 초째로 열었다.
   *
   * 시간표(`timeline`)가 아니라 `step` 의 누적 상태로 움직인다. 시험 수가 물체 질량을 따라
   * 2~4 번으로 달라져 단계 길이를 상수로 적을 수 없고, 저울 각은 적분이다. 그래서 시계를
   * 앞당기는 `startAt` 이 아니라 `step` 을 미리 굴리는 `preroll` 이다 (NOTES 「어휘 부족」).
   */
  preroll: LEAD,

  /**
   * 슬롯 하나. 원본은 그림 아래 왼쪽 정렬 15 px 한 줄이었다.
   *
   * 세 경우 — 놓기 전(`text`) / 모자람(물체마다 한 문장) / 맞음. 물체 이름이 조사와 함께
   * 문장에 박혀 있어 이름을 값으로 끼우지 않고 물체마다 문안을 둔다 (C1).
   */
  caption: {
    anchor: { world: CAPTION_AT },
    align: 'left',
    fontSize: CAPTION_FONT,
    style: { colorRole: 'ink', emphasis: 'strong' },
    text: key('caption.hold'),
    cases: [
      { when: 'shortStone', text: key('caption.shortStone') },
      { when: 'shortIron', text: key('caption.shortIron') },
      { when: 'shortWood', text: key('caption.shortWood') },
      { when: 'matched', text: key('caption.match') },
    ],
    vars: { n: 'nText' },
  },

  // 그리드 · 카메라 버튼은 원본에 없다 — 켜지 않는다.

  messages: inertialVsGravitationalMassMessages,
};
