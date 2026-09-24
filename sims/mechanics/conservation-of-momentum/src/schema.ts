// ========================================================================
// conservation-of-momentum — 선언
// ========================================================================
// 질문: 부딪히는 동안 두 수레의 운동량은 크게 바뀌는데, 무엇이 그대로인가?
// 그리고 그것은 언제 바뀌는가?
//
// 답: 두 수레의 운동량 화살표를 이어 붙인 **끝**이 그대로다. 두 수레가 서로를
// 미는 힘은 계 안의 힘이라 한쪽이 얻는 만큼 다른 쪽이 잃는다. 계 밖의 벽이
// 밀 때에만 그 끝이 옮겨 간다.
//
// 에너지 이야기는 하지 않는다 — 이웃 조각(elastic-collision · energy-in-collision)의 몫이다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:conservation-of-momentum` 와 문자 그대로 일치한다 (C4). */
export const CONSERVATION_OF_MOMENTUM_ID = 'conservation-of-momentum';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 수레 A · B 의 질량(kg). B 가 두 배라 같은 힘을 받아도 속도가 반만 바뀐다. */
export const MASS_A = 1;
export const MASS_B = 2;
/**
 * 처음 속도(m/s). A 는 오른쪽으로, B 는 왼쪽으로 온다.
 * 운동량 0.8 과 −0.4 — 합 0.4 가 두 화살표보다 짧아 「이어 붙인 끝」 이 읽힌다.
 */
export const VEL_A = 0.8;
export const VEL_B = -0.2;

// ------------------------------------------------------------------------
// 배치 — 월드 1 단위 = 1 m. 레일 윗면이 y = 0.
// ------------------------------------------------------------------------

/** 수레 크기(m). 넓이가 질량을 따라 대략 두 배다. */
export const CART_A_W = 0.4;
export const CART_A_H = 0.26;
export const CART_B_W = 0.56;
export const CART_B_H = 0.37;
/** 용수철 높이(레일 위, m). 두 수레의 낮은 쪽 가운데쯤. */
export const SPRING_Y = 0.13;
/** B 의 왼쪽 범퍼 용수철 자연 길이(m). */
export const BUMPER_B = 0.6;
/** 벽의 범퍼 용수철 자연 길이(m). */
export const BUMPER_WALL = 0.35;
/** 두 수레가 닿기 시작하는 순간 A 의 중심 x. 다른 자리는 모두 이것과 시간표에서 나온다. */
export const CONTACT_A_X = -0.5;
/** 벽 높이와 벽 뒤 빗금 두께(m). */
export const WALL_H = 0.62;
export const WALL_T = 0.12;
/** 레일 오른쪽 끝(m). */
export const TRACK_END_X = 3.5;

/** 힘 화살표 배율(월드 m / N). */
export const FORCE_SCALE = 0.2;

// ------------------------------------------------------------------------
// 운동량 줄 — 두 화살표를 이어 붙이고 그 아래에 합을 둔다.
// ------------------------------------------------------------------------

/** 운동량 0 의 자리(월드 x). */
export const CHAIN_ORIGIN_X = -0.15;
/** 운동량 배율(월드 m / kg·m/s). */
export const CHAIN_SCALE = 1.5;
/** 줄 높이 — 위에서부터 A · B · 합. */
export const ROW_A_Y = 1.62;
export const ROW_B_Y = 1.34;
export const ROW_TOTAL_Y = 0.98;
/** 줄 이름을 놓는 자리(월드 x). 가장 왼쪽으로 가는 화살표보다 더 왼쪽. */
export const ROW_LABEL_X = -1.3;

/** 프레이밍 — 매 프레임 같은 값이다 (S-piece). 아래 여백은 캡션 줄 몫. */
export const SCENE_BOUNDS = { minX: -2.15, maxX: 3.5, minY: -0.62, maxY: 1.8 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const conservationOfMomentumMessages = Object.freeze({
  'label.title': { ko: '운동량 보존', en: 'Conservation of momentum' },
  'label.operation': {
    ko: '외력이 없을 때의 총 운동량',
    en: 'Total momentum when no external force acts',
  },
  'label.stage': { ko: '두 수레와 벽', en: 'Two carts and a wall' },
  'label.view': { ko: '이어 붙인 화살표', en: 'Arrows laid tip to tail' },

  /** 수레 이름. 도식 기호라 번역 대상이 아니다 (C1 판정 3). */
  'label.cartA': { ko: 'A', en: 'A' },
  'label.cartB': { ko: 'B', en: 'B' },
  /** 운동량 0 의 자리. 기호다. */
  'label.zero': { ko: '0', en: '0' },
  /** 두 화살표를 이어 붙인 끝 — 계의 총 운동량. 강조색은 이 한 가지 뜻에만 쓴다. */
  'label.total': { ko: '합', en: 'Total' },
  /** 처음 합의 끝 자리. 주기 내내 서 있다 — 합의 끝이 여기서 떠나는지를 잰다. */
  'label.start': { ko: '처음 합', en: 'Starting total' },

  'caption.approach': {
    ko: 'A 는 오른쪽, B 는 왼쪽으로 온다. 두 운동량 화살표를 이어 붙인 끝이 둘의 합이다.',
    en: 'A comes from the left, B from the right. Laying their momentum arrows tip to tail, the far end is the total.',
  },
  'caption.contact': {
    ko: '서로 미는 동안 A 의 화살표는 줄어 뒤집히고 B 의 것은 자란다 — 그래도 합의 끝은 움직이지 않는다.',
    en: 'While they push on each other, A’s arrow shrinks and flips and B’s grows — yet the end of the total does not move.',
  },
  'caption.apart': {
    ko: '떨어진 뒤에도 합은 처음 그대로다. 두 수레가 주고받은 힘은 계 안에서 서로 지웠다.',
    en: 'After they separate, the total is exactly what it was. The pushes they traded cancelled inside the system.',
  },
  'caption.wall': {
    ko: '벽은 계 밖에 있다. 벽이 A 를 미는 동안에는 합의 끝이 오른쪽으로 옮겨 간다.',
    en: 'The wall is outside the system. While it pushes A, the end of the total moves to the right.',
  },
  'caption.after': {
    ko: '바깥에서 민 만큼 총 운동량이 늘었다. 합을 바꾼 것은 벽 하나뿐이다.',
    en: 'The total grew by exactly the outside push. Only the wall changed it.',
  },
} satisfies Record<string, LocalizedText>);

export type ConservationOfMomentumMessageKey = keyof typeof conservationOfMomentumMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: ConservationOfMomentumMessageKey): LocalizedText =>
  conservationOfMomentumMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ConservationOfMomentumMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const conservationOfMomentumSchema: BundleSchema = {
  id: CONSERVATION_OF_MOMENTUM_ID,
  label: text('label.title'),
  category: 'mechanics',
  operation: text('label.operation'),
  timeModel: 'periodic',
  parameters: [],
  stages: [
    {
      id: 'carts-and-wall',
      label: text('label.stage'),
      constants: { massA: MASS_A, massB: MASS_B, velA: VEL_A, velB: VEL_B },
    },
  ],
  environments: [],
  views: [{ id: 'tip-to-tail', label: text('label.view'), default: true }],

  /** 가로로 넓다 — 레일 위를 수레가 오가고, 그 위에 운동량 줄 세 개. */
  canvas: { height: 380, minHeight: 340 },

  /** 도착한 순간 이미 두 수레가 다가오는 중이다 (S-piece). */
  startAt: 0.4,

  /**
   * 한 주기 7.3 초. 모든 단계가 실제 시간으로 흐른다(`timeScale` 없음) — 수레 자리는
   * 조각 시계의 함수이고, 단계 길이가 곧 물리다.
   *
   * - `enter` — 나타난다. 수레는 이미 달리고 있다.
   * - `approach` — 서로를 향해 온다.
   * - `contact` — 범퍼 용수철이 눌렸다 펴지는 동안. **이 길이가 곧 충돌 시간**이라
   *   늘이면 용수철이 무르게 된다(주고받는 운동량은 같다).
   * - `apart` — 떨어져 달린다. A 는 벽 쪽으로. 벽의 자리는 이 길이에서 나온다.
   * - `wall` — 벽 범퍼가 A 를 되민다. 계 밖의 힘.
   * - `after` · `fade` — 늘어난 합을 보이고 물러난다.
   */
  timeline: {
    phases: [
      { id: 'enter', duration: 0.3, caption: key('caption.approach') },
      { id: 'approach', duration: 0.7, caption: key('caption.approach') },
      { id: 'contact', duration: 1.2, caption: key('caption.contact') },
      { id: 'apart', duration: 2, caption: key('caption.apart') },
      { id: 'wall', duration: 1, caption: key('caption.wall') },
      { id: 'after', duration: 1.6, caption: key('caption.after') },
      { id: 'fade', duration: 0.5, caption: key('caption.after') },
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

  // 그리드 · 카메라 단추 · 제목 · 범례 없음(기본). 재는 것은 화살표 끝의 자리이고
  // 레일 위 거리가 아니다 (S-piece).

  messages: conservationOfMomentumMessages,
};
