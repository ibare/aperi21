// ========================================================================
// two-dimensional-collision — 선언
// ========================================================================
// 질문: 공이 비스듬히 부딪쳐 위아래로 갈라지면 운동량 보존은 무엇을 두고 하는
// 말인가? 화살표 길이의 합인가, 방향이 바뀌었으니 깨진 것인가?
//
// 답: **성분마다 따로** 보존된다. x 성분끼리의 합은 x 대로, y 성분끼리의 합은
// y 대로 처음 값에 머문다. x 에서 y 로 넘어가는 몫은 없다.
//
// 화면에서는 오른쪽 성분 장부가 그 일을 한다 — 부딪치는 동안 A 의 성분이 B 로
// 넘어가 쪼개지지만, x 줄 끝과 y 기둥 끝은 강조 점선(처음 합)에서 떠나지 않는다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:two-dimensional-collision` 와 문자 그대로 일치한다 (C4). */
export const TWO_DIMENSIONAL_COLLISION_ID = 'two-dimensional-collision';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 공 A(날아오는 공) · 공 B(서 있는 공)의 질량(kg). */
export const MASS_A = 1;
export const MASS_B = 1;
/** A 가 날아오는 속력(m/s). x 방향으로만 온다 — 처음 y 합이 0 이다. */
export const SPEED_A = 1;

/**
 * 빗맞는 각(도) — 두 공 중심을 잇는 선이 A 의 진행 방향과 이루는 각.
 * 칩이 고르는 값들이다. 기본은 가운데 값.
 *
 * 각이 달라도 두 합은 같다 — 그것을 독자가 직접 확인하는 칩이다.
 */
export const IMPACT_ANGLE_OPTIONS = [20, 35, 55] as const;
export const IMPACT_ANGLE = 35;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 원점은 공 B 가 서 있는 자리.
// ------------------------------------------------------------------------

/** 공 반지름. 두 공은 같은 질량이라 같은 크기다 — 가르는 것은 색과 이름이다. */
export const RADIUS_A = 0.22;
export const RADIUS_B = 0.22;
/** 공이 1 m/s 로 갈 때 화면에서 1 초에 가는 월드 거리. 물리 시간을 화면 시간에 태운다. */
export const WORLD_PER_SPEED = 0.45;
/** 운동량 1 kg·m/s 가 화살표로 차지하는 월드 길이. 당구대와 장부가 같은 배율을 쓴다. */
export const P_SCALE = 1.3;

/** 성분 장부 — x 줄의 0 자리와 높이. */
export const LEDGER_X0 = 3.0;
export const LEDGER_ROW_Y = 0.95;
/** 성분 장부 — y 기둥의 가운데 x 와 0 자리 높이. */
export const LEDGER_COL_X = 3.65;
export const LEDGER_COL_Y0 = -0.4;
/** y 기둥에서 A · B 화살표를 좌우로 벌리는 반간격. 같은 줄에 겹치면 둘이 하나로 읽힌다. */
export const LEDGER_LANE = 0.1;

/**
 * 프레이밍 — 왼쪽은 A 가 달려 들어오는 자리, 가운데는 갈라져 나가는 자리, 오른쪽은 장부.
 * 세 각 모두 공과 화살표가 이 안에 머문다. 매 프레임 같은 값이다 (S-piece).
 */
export const SCENE_BOUNDS = { minX: -1.7, maxX: 4.65, minY: -1.5, maxY: 1.72 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const twoDimensionalCollisionMessages = Object.freeze({
  'label.title': { ko: '2차원 충돌', en: 'Two-dimensional collision' },
  'label.operation': {
    ko: '성분마다 따로 성립하는 보존',
    en: 'Conservation that holds separately for each component',
  },
  'label.stage': { ko: '비스듬한 충돌', en: 'Glancing collision' },
  'label.view': { ko: '성분 장부', en: 'Component ledger' },

  /** 공 이름. 도식 기호라 번역 대상이 아니다 (C1 판정 3). */
  'label.ballA': { ko: 'A', en: 'A' },
  'label.ballB': { ko: 'B', en: 'B' },
  /** 장부의 두 축 이름. 기호라 번역 대상이 아니다. */
  'label.axisX': { ko: 'x', en: 'x' },
  'label.axisY': { ko: 'y', en: 'y' },
  /** 장부에서 그대로인 합의 자리. 강조색은 이 한 가지 뜻에만 쓴다. */
  'label.total': { ko: '처음 합', en: 'Total before' },

  'control.angle': { ko: '빗맞는 각', en: 'Glancing angle' },
  /** 칩 글자. 수와 단위는 표식이다 (C1 판정 3). */
  'option.angle20': { ko: '20°', en: '20°' },
  'option.angle35': { ko: '35°', en: '35°' },
  'option.angle55': { ko: '55°', en: '55°' },

  'caption.approach': {
    ko: 'A 만 움직인다. 운동량의 x 합은 A 의 몫 전부이고, y 합은 0 이다.',
    en: 'Only A is moving. The x total of momentum is all of A’s, and the y total is 0.',
  },
  'caption.contact': {
    ko: '부딪치는 동안 A 의 몫이 B 로 넘어가며 쪼개진다 — 그래도 x 줄의 끝과 y 기둥의 끝은 처음 합에서 떠나지 않는다.',
    en: 'During contact, A’s share passes to B and splits — yet the end of the x row and the end of the y column never leave the total before.',
  },
  'caption.apart': {
    ko: 'B 가 아래로 가져간 y 만큼 A 가 위로 가져갔다. y 합은 여전히 0, x 합도 처음 그대로다.',
    en: 'A carries upward exactly the y that B carries downward. The y total is still 0, and the x total is unchanged.',
  },
} satisfies Record<string, LocalizedText>);

export type TwoDimensionalCollisionMessageKey = keyof typeof twoDimensionalCollisionMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: TwoDimensionalCollisionMessageKey): LocalizedText =>
  twoDimensionalCollisionMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: TwoDimensionalCollisionMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const twoDimensionalCollisionSchema: BundleSchema = {
  id: TWO_DIMENSIONAL_COLLISION_ID,
  label: text('label.title'),
  category: 'mechanics',
  operation: text('label.operation'),
  timeModel: 'periodic',
  parameters: [],
  stages: [
    {
      id: 'glancing',
      label: text('label.stage'),
      constants: { massA: MASS_A, massB: MASS_B, speedA: SPEED_A },
    },
  ],
  environments: [],
  views: [{ id: 'ledger', label: text('label.view'), default: true }],

  /** 가로로 넓다 — 왼쪽 당구대, 오른쪽 장부. 세로는 갈라지는 두 공이 쓰는 만큼. */
  canvas: { height: 400, minHeight: 352 },

  /** 도착한 순간 이미 A 가 달려오는 중이다 (S-piece). */
  startAt: 0.8,

  /**
   * 한 주기 7.3 초.
   *
   * - `approach` — A 가 달려온다. 장부에는 A 의 x 성분 하나뿐이다.
   * - `contact` — 부딪치는 동안. 실제로는 순식간이지만 이 단계가 주장의 본체라
   *   2.2 초에 걸쳐 보인다. 진행도가 곧 A 에서 B 로 넘어간 충격량의 몫이다.
   * - `apart` — 두 공이 갈라져 나간다. 장부는 쪼개진 채로 멈춰 있다.
   * - `fade` — 공이 계속 나아가며 옅어진다. 끝난 화면이 남지 않도록 다음 주기로 잇는다.
   */
  timeline: {
    phases: [
      { id: 'approach', duration: 2.2, caption: key('caption.approach') },
      { id: 'contact', duration: 2.2, ease: 'smooth', caption: key('caption.contact') },
      { id: 'apart', duration: 2.4, caption: key('caption.apart') },
      { id: 'fade', duration: 0.5, caption: key('caption.apart') },
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

  // 그리드 · 카메라 단추 · 제목 · 범례 없음(기본). 이 그림이 재는 것은 장부의 끝이
  // 처음 합에 머무는가이고, 당구대 위 거리 눈금은 오독의 경로가 된다 (S-piece).

  messages: twoDimensionalCollisionMessages,
};
