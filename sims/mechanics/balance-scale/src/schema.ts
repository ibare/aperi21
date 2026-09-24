// ========================================================================
// balance-scale — 선언
// ========================================================================
// 질문: 무게가 다른 두 추로도 저울이 수평이 될 수 있나.
//
// 된다 — 가벼운 추를 멀리 두면. 무게가 절반인 추를 두 배 멀리 두면 수평이다.
// 동사는 「기울었다가 수평으로 돌아온다」.
//
// 원본: tasks/piece-lab/balance-scale/ (자유 구현)
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:balance-scale` 와 문자 그대로 일치한다 (C4). */
export const BALANCE_SCALE_ID = 'balance-scale';

// ------------------------------------------------------------------------
// 기하 — 월드 1 단위 = 원본 논리 좌표 100 px. 받침점이 원점, y 는 위.
// 원본 캔버스는 860 × 300 이고 받침점이 (430, 140) 에 있었다.
// ------------------------------------------------------------------------

/** 원본 px 을 월드로. */
const PX = 0.01;

/** 눈금 한 칸의 길이. 원본 UNIT 66 px. */
export const UNIT = 66 * PX;
/** 한쪽 눈금 수. 원본 NOTCHES 5. */
export const NOTCHES = 5;
/** 저울대 반 길이. 원본 UNIT × (NOTCHES + 0.4). */
export const HALF = UNIT * (NOTCHES + 0.4);
/** 저울대 굵기(화면 px). 원본 7. */
export const BEAM_WIDTH_PX = 7;
/** 받침점 구멍 반지름. 원본 4 px. */
export const PIVOT_HOLE = 4 * PX;
/** 수평 기준선이 저울대 끝보다 더 나가는 길이. 원본 20 px. */
export const LEVEL_OVERHANG = 20 * PX;
/** 받침대 — 삼각 기둥 꼭대기 · 밑변 반폭 · 높이, 바닥판 반폭 · 두께. 원본 4 · 34 · 120 · 120 · 6 px. */
export const STAND_TOP = 4 * PX;
export const STAND_HALF = 34 * PX;
export const STAND_HEIGHT = 120 * PX;
export const PLATE_HALF = 120 * PX;
export const PLATE_THICK = 6 * PX;
/** 눈금 — 저울대 아래 5 px 에서 14 px 까지. */
export const TICK_NEAR = 5 * PX;
export const TICK_FAR = 14 * PX;
/** 눈금 굵기(화면 px). 원본 1.5. */
export const TICK_WIDTH_PX = 1.5;
/** 블록 한 변 · 저울대에서 띄운 간격 · 블록 사이 간격. 원본 34 · 4 · 3 px. */
export const BLOCK = 34 * PX;
export const BLOCK_LIFT = 4 * PX;
export const BLOCK_GAP = 3 * PX;
/** 캡션 줄 — 원본은 캔버스 아래 DOM 문단(여백 4 px, 줄 높이 22.5 px)이었다. */
export const Y_CAPTION = -(160 + 4 + 11) * PX;

/**
 * 프레이밍 — 원본 860 × 300 캔버스에 그 아래 캡션 줄 30 px 을 더한 경계다.
 * 매 프레임 같은 값이라 카메라가 흔들리지 않는다 (S-piece).
 */
export const SCENE_BOUNDS = { minX: -4.3, maxX: 4.3, minY: -1.9, maxY: 1.4 } as const;

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 중력 세기(단위 토크 기준). 원본 G. */
export const GRAVITY = 1;
/** 무거운 추 무게(블록 수) · 가벼운 추 무게. 원본 M_HEAVY 2 · M_LIGHT 1. */
export const HEAVY_MASS = 2;
export const LIGHT_MASS = 1;
/** 무거운 추 거리(눈금 칸). 원본 X_HEAVY. */
export const HEAVY_ARM = 2;
/**
 * 복원 토크 세기 · 회전 관성 · 감쇠. 원본 8 · 1.3 · 3.2.
 * 저울이 얼마나 천천히 일어서는지가 동사가 읽히는 속도라 조각이 정한다 (원본 NOTES).
 */
export const RESTORE = 8;
export const INERTIA = 1.3;
export const DAMP = 3.2;
/** 받침대에 닿는 한계 각(라디안). 원본 MAX_TILT. */
export const MAX_TILT = 0.4;
/** 대본이 가벼운 추를 두는 세 자리(눈금 칸) — 가까이 · 수평 · 너무 멀리. */
export const ARM_NEAR = 2;
export const ARM_LEVEL = 4;
export const ARM_OVER = 5;
/** 끌 수 있는 범위(눈금 칸). 원본 0.5 ~ NOTCHES. */
export const DRAG_MIN = 0.5;
/** 수평 문장으로 넘어가는 각(도). 대본 중 1.5, 끌어 본 뒤 1. */
export const LEVEL_DEG = 1.5;
export const MANUAL_LEVEL_DEG = 1;
/** 가벼운 추를 잡는 반경(화면 px). 원본은 저울대 방향으로 블록 한 변(34 px) 안이었다. */
export const GRAB_RADIUS_PX = 34;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const balanceScaleMessages = Object.freeze({
  'label.title': { ko: '수평잡기', en: 'Balancing a scale' },
  'label.stage': { ko: '기본', en: 'Default' },
  'label.view': { ko: '기본', en: 'Default' },
  'caption.near': {
    ko: '가벼운 추가 가까이 있어 무거운 쪽으로 기울어 있다',
    en: 'The light weight sits close in, so the beam tips toward the heavy side',
  },
  'caption.outward': {
    ko: '가벼운 추를 바깥으로 옮기자 저울대가 일어선다',
    en: 'Sliding the light weight outward lifts the beam',
  },
  'caption.settling': { ko: '수평을 찾아간다', en: 'The beam settles toward level' },
  'caption.level': {
    ko: '두 배 멀리 두니 무게가 절반이어도 수평이다',
    en: 'At twice the distance, half the weight is enough to balance',
  },
  'caption.over': {
    ko: '조금 더 밀자 이번에는 가벼운 쪽으로 기운다',
    en: 'Push it a little farther and the beam tips toward the light side',
  },
  'caption.overHold': {
    ko: '너무 멀리 두면 가벼운 쪽이 내려간다',
    en: 'Too far out, and the light side goes down',
  },
  'caption.back': {
    ko: '두 배 거리로 되돌리자 수평이 돌아온다',
    en: 'Back at twice the distance, the beam levels again',
  },
  'caption.inward': {
    ko: '가까이 당기자 다시 무거운 쪽으로 기운다',
    en: 'Pull it in close and the beam tips toward the heavy side again',
  },
  'caption.manualLevel': { ko: '양쪽이 수평을 이루었다', en: 'The two sides balance' },
  'caption.manualHeavy': { ko: '무거운 쪽으로 기울어 있다', en: 'Tipped toward the heavy side' },
  'caption.manualLight': { ko: '가벼운 쪽으로 기울어 있다', en: 'Tipped toward the light side' },
} satisfies Record<string, LocalizedText>);

export type BalanceScaleMessageKey = keyof typeof balanceScaleMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: BalanceScaleMessageKey): LocalizedText => balanceScaleMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: BalanceScaleMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const balanceScaleSchema: BundleSchema = {
  id: BALANCE_SCALE_ID,
  title: text('label.title'),
  category: 'mechanics',
  timeModel: 'periodic',
  parameters: [],

  stages: [
    {
      id: 'default',
      label: text('label.stage'),
      constants: {
        g: GRAVITY,
        heavyMass: HEAVY_MASS,
        lightMass: LIGHT_MASS,
        heavyArm: HEAVY_ARM,
        restore: RESTORE,
        inertia: INERTIA,
        damp: DAMP,
        maxTilt: MAX_TILT,
        armNear: ARM_NEAR,
        armLevel: ARM_LEVEL,
        armOver: ARM_OVER,
      },
    },
  ],

  environments: [],
  views: [{ id: 'default', label: text('label.view'), default: true }],

  /** 원본 캔버스 300 px + 아래 캡션 줄 30 px. */
  canvas: { height: 330, minHeight: 330 },

  /**
   * 원본이 그린 순서 그대로 겹친다 — 기준선 · 받침대 · 저울대 · 받침점 구멍 · 눈금 ·
   * 추. 층 순서로는 받침점 구멍(body)이 눈금·추와 섞여 자리가 흔들린다.
   */
  drawOrder: 'scene',

  /**
   * 가벼운 추 거리의 대본 — 2칸(기움) → 4칸으로 미끄러짐 → 4칸(수평) → 5칸(반대로
   * 기움) → 4칸 복귀 → 2칸. 20초 주기. 단계마다의 거리는 `physics.PHASE_ARMS` 가
   * 스테이지 상수 이름으로 가리킨다.
   *
   * **저울대 각은 대본이 아니다.** 각은 `step` 이 토크로 적분하고, 대본이 움직이는
   * 것은 거리 하나뿐이다. `step` 은 시간표 프레임을 받지 못하므로 상태의 시계로
   * 이 선언을 직접 읽는다 (NOTES 「어휘 부족」).
   *
   * `startAt` · `preroll` 은 두지 않는다. 원본은 시계를 0 에서 열고, "도착한 순간
   * 이미 기울어 있다" 는 초기 각을 2칸일 때의 평형으로 두어 만들었다 — 그 평형은
   * 스테이지 상수에서 계산된다 (`state.initialState`).
   */
  timeline: {
    phases: [
      { id: 'near', duration: 1.5, ease: 'smooth', caption: key('caption.near') },
      { id: 'outward', duration: 3.5, ease: 'smooth', caption: key('caption.outward') },
      { id: 'level', duration: 4, ease: 'smooth', caption: key('caption.settling') },
      { id: 'over', duration: 1.5, ease: 'smooth', caption: key('caption.over') },
      { id: 'overHold', duration: 2, ease: 'smooth', caption: key('caption.overHold') },
      { id: 'back', duration: 1.5, ease: 'smooth', caption: key('caption.back') },
      { id: 'levelAgain', duration: 3, ease: 'smooth', caption: key('caption.settling') },
      { id: 'inward', duration: 2.5, ease: 'smooth', caption: key('caption.inward') },
      { id: 'nearAgain', duration: 0.5, ease: 'smooth', caption: key('caption.near') },
    ],
  },

  /**
   * 슬롯 하나. 단계가 문장을 고르되, **각으로 갈리는 문장**은 상태로 고른다 —
   * 수평 단계에서 1.5° 안에 들었는지, 독자가 추를 끌어 본 뒤 지금 어느 쪽인지.
   * 위에서부터 훑어 참인 첫 항목이 이긴다. 원본 `captionText` 의 `if` 순서 그대로다.
   */
  caption: {
    anchor: { world: [0, Y_CAPTION] },
    align: 'center',
    fontSize: 15,
    style: { colorRole: 'ink', emphasis: 'strong' },
    cases: [
      { when: 'manualLevel', text: key('caption.manualLevel') },
      { when: 'manualHeavy', text: key('caption.manualHeavy') },
      { when: 'manualLight', text: key('caption.manualLight') },
      { when: 'levelReached', text: key('caption.level') },
    ],
  },

  /** 그리드도 카메라 버튼도 없다 (기본값). 거리는 저울대의 눈금이 센다. */

  messages: balanceScaleMessages,
};
