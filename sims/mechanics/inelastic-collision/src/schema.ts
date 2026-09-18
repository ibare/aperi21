// ========================================================================
// inelastic-collision — 선언
// ========================================================================
// 질문: 부딪힌 뒤 튀어 나가는 충돌에서 에너지는 얼마나 사라지는가? 그것을 눈으로
// 가늠할 단서가 충돌 뒤의 화면에 남아 있는가?
//
// 답: 남아 있다 — **두 물체가 서로 멀어지는 빠르기**다. 같은 수레가 같은 속력으로
// 멈춘 같은 수레에 부딪혀도, 부딪히는 면이 덜 튀기면 둘 사이가 덜 벌어지고 그만큼
// 운동 에너지가 더 많이 사라진다. 벌어지는 빠르기는 e·v, 사라지는 몫은 (1−e²)/2.
//
// 화면에서는 세 쌍이 나란히 부딪힌다. 각 줄의 왼쪽에 벌어진 틈, 오른쪽에 사라진 몫이
// 같은 높이로 놓여 **틈이 좁은 줄일수록 사라진 칸이 길다.**
//
// 탄성(e = 1) · 완전 비탄성(e = 0) 끝점과 운동량 보존은 이웃 조각의 몫이라 여기서
// 말하지 않는다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:inelastic-collision` 와 문자 그대로 일치한다 (C4). */
export const INELASTIC_COLLISION_ID = 'inelastic-collision';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 달려오는 수레의 속력(m/s). 세 줄 모두 같다. */
export const APPROACH_SPEED = 1.2;
/**
 * 세 줄의 반발 계수 — 위에서부터. 사라지는 몫 (1−e²)/2 이 0.18 · 0.375 · 0.48 로 갈린다.
 *
 * 끝점 1 과 0 은 두지 않는다. 1 은 아무것도 사라지지 않는 탄성 충돌, 0 은 붙어서 함께
 * 가는 완전 비탄성 충돌로 이웃 조각이 각각 맡는다. 이 조각은 그 사이, 튀어 나가면서도
 * 에너지를 잃는 충돌이다.
 */
export const RESTITUTION_TOP = 0.8;
export const RESTITUTION_MID = 0.5;
export const RESTITUTION_BOTTOM = 0.2;

// ------------------------------------------------------------------------
// 배치 — 월드 1 단위 = 1 m. 원점은 가운데 줄에서 멈춰 선 수레의 중심.
// ------------------------------------------------------------------------

/** 수레 반너비 · 반높이(m). 두 수레는 같은 수레다. */
export const CART_HALF_W = 0.25;
export const CART_HALF_H = 0.15;
/** 줄 간격(m). 수레 중심 사이. */
export const LANE_GAP = 0.95;
/** 달려오는 수레가 처음 있는 자리 — 닿는 자리에서 이만큼 왼쪽(m). */
export const APPROACH_DISTANCE = 1.8;
/** 속도 화살표 배율(월드 m 당 m/s). */
export const ARROW_SCALE = 0.5;
/** 이보다 짧은 화살표는 두지 않는다(월드). 촉만 남은 점이 방향을 거짓말한다. */
export const ARROW_MIN = 0.07;
/** 화살표를 수레 윗면에서 띄우는 높이(월드). */
export const ARROW_LIFT = 0.12;

/** 에너지 막대 — 가득 찬 길이(처음 운동 에너지) · 시작 x · 반두께(m). */
export const BAR_X0 = 3.05;
export const BAR_FULL = 2.0;
export const BAR_HALF_H = 0.13;

/**
 * 프레이밍 — 왼쪽은 반발 계수 표식과 달려오는 자리, 오른쪽은 막대와 그 이름표.
 * 아래쪽 0.62 는 캡션 줄 몫이다 (G24). 매 프레임 같은 값이다 (S-piece).
 */
export const SCENE_BOUNDS = { minX: -3.35, maxX: 5.3, minY: -1.95, maxY: 1.52 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const inelasticCollisionMessages = Object.freeze({
  'label.title': { ko: '비탄성 충돌', en: 'Inelastic collision' },
  'label.operation': { ko: '에너지가 사라지는 충돌', en: 'A collision that loses energy' },
  'label.stage': { ko: '같은 수레 세 쌍', en: 'Three identical pairs' },
  'label.view': { ko: '틈과 막대', en: 'Gap and bar' },

  /** 줄마다 붙는 반발 계수. 기호와 수라 번역 대상이 아니다 (C1 판정 3). */
  'label.restitution': { ko: 'e = {e}', en: 'e = {e}' },
  /** 막대 줄의 머리. */
  'label.energy': { ko: '운동 에너지', en: 'Kinetic energy' },
  /** 부딪히며 열 · 소리 · 찌그러짐으로 나간 몫 — 비워 둔 점선 칸. */
  'label.lost': { ko: '사라진 몫', en: 'Lost' },
  /** 벌어진 틈. 강조색 치수선 곁. */
  'label.gap': { ko: '벌어진 틈', en: 'Gap' },

  'caption.approach': {
    ko: '같은 수레가 같은 속력으로 멈춰 선 같은 수레에 달려든다. 세 쌍은 부딪히는 면만 다르다.',
    en: 'Identical carts run at the same speed into identical carts at rest. Only the bumpers differ.',
  },
  'caption.impact': {
    ko: '부딪히는 동안 세 쌍 모두 에너지 막대가 줄어든다 — 열과 소리, 찌그러짐으로 나가는 몫이다.',
    en: 'During the impact every energy bar shrinks — that part leaves as heat, sound and dents.',
  },
  'caption.apart': {
    ko: '부딪힌 뒤 두 수레 사이가 벌어진다. 위 쌍은 빨리 멀어지고, 아래 쌍은 거의 붙어서 간다.',
    en: 'After the impact the two carts pull apart. The top pair separates fast; the bottom pair barely separates.',
  },
  'caption.compare': {
    ko: '덜 벌어진 쌍일수록 사라진 몫이 길다 — 튀어 나가지 못한 만큼이 에너지에서 빠졌다.',
    en: 'The less a pair pulls apart, the longer its lost part — what did not bounce back is gone from the energy.',
  },
} satisfies Record<string, LocalizedText>);

export type InelasticCollisionMessageKey = keyof typeof inelasticCollisionMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: InelasticCollisionMessageKey): LocalizedText => inelasticCollisionMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: InelasticCollisionMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const inelasticCollisionSchema: BundleSchema = {
  id: INELASTIC_COLLISION_ID,
  label: text('label.title'),
  category: 'mechanics',
  operation: text('label.operation'),
  timeModel: 'periodic',
  parameters: [],
  stages: [
    {
      id: 'three-pairs',
      label: text('label.stage'),
      constants: {
        speed: APPROACH_SPEED,
        restitutionTop: RESTITUTION_TOP,
        restitutionMid: RESTITUTION_MID,
        restitutionBottom: RESTITUTION_BOTTOM,
      },
    },
  ],
  environments: [],
  views: [{ id: 'gap-and-bar', label: text('label.view'), default: true }],

  /** 가로로 넓다 — 왼쪽 세 줄의 수레, 오른쪽 막대 셋. 세로는 세 줄이면 된다. */
  canvas: { height: 380, minHeight: 340 },

  /** 도착한 순간 이미 수레가 달려오는 중이다 (S-piece). */
  startAt: 0.5,

  /**
   * 한 주기 9.8 초.
   *
   * - `approach` — 세 줄의 수레가 같은 속력으로 달려온다. 막대가 모두 가득 차 있다.
   * - `impact` — 닿은 채로. 실제로는 순식간이지만 막대가 줄어드는 것이 보이도록 늘인다.
   *   진행도가 곧 충돌이 끝난 정도다.
   * - `apart` — 두 수레가 각자의 속도로 간다. 틈이 줄마다 다른 빠르기로 벌어진다.
   * - `compare` — 그 자리에서 멈춰 세운 화면. 틈과 사라진 몫을 줄마다 견준다.
   * - `fade` — 옅어지며 물러난다. 끝난 화면이 남지 않도록 다음 주기로 잇는다.
   */
  timeline: {
    phases: [
      { id: 'approach', duration: 1.5, caption: key('caption.approach') },
      { id: 'impact', duration: 1.4, ease: 'smooth', caption: key('caption.impact') },
      { id: 'apart', duration: 2.0, caption: key('caption.apart') },
      { id: 'compare', duration: 4.2, caption: key('caption.compare') },
      { id: 'fade', duration: 0.7, caption: key('caption.compare') },
    ],
  },

  /** 슬롯 하나. 단계마다 지금 화면에서 벌어지는 일만 말한다. */
  caption: {
    anchor: { screen: 'bottom-left', offset: [18, -4] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 820,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  // 그리드 · 카메라 단추 · 제목 · 범례 없음(기본). 재는 것은 줄마다의 틈과 막대 길이의
  // 대비이고, 레일 위 절대 거리가 아니다 (S-piece).

  messages: inelasticCollisionMessages,
};
