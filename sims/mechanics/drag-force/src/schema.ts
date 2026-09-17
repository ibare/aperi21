// ========================================================================
// drag-force — 선언
// ========================================================================
// 질문: 저항이 속도에 비례하기도, 속도 제곱에 비례하기도 한다는데 — 빨라지면
// 어느 쪽이 커지고, 얼마나 가파르게 커지나.
//
// 답의 동사는 **"(제곱 몫이) 가파르게 불어난다"** 다. 일정한 힘으로 밀리는 공이
// 0.25 초마다 지난 자리를 남기고(간격 = 속도), 그 자리마다 그 순간의 저항 막대가
// 선다 — 아래 칸(채움)은 1차 몫, 위 칸(빗금)은 2차 몫.
//
// ---- 월드 = 원본 캔버스 ----
// 원본(tasks/piece-lab/drag-force/index.html) 860 × 290 캔버스의 px 를 월드 단위로
// 그대로 쓰고 y 만 뒤집는다(위가 +). 그래서 원본의 배치 상수가 그대로 남는다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:drag-force` 와 문자 그대로 일치한다 (C4). */
export const DRAG_FORCE_ID = 'drag-force';

// ------------------------------------------------------------------------
// 물리 확정값 — 원본의 숫자 그대로
// ------------------------------------------------------------------------

/**
 * 미는 힘 1, 질량 0.5, 1차 계수 0.08, 2차 계수 0.04. 두 몫은 속도 2 에서 같아진다.
 *
 * 원본에 있던 「끝에 닿을 때까지 달린다」 대신, 빗금 몫이 채움 몫의 `overtake` 배에
 * 이르면 멈춘다(속도 3.5, 저항은 미는 힘의 77%). 이 조각의 주장은 「빨라질수록
 * 제곱 몫이 가파르게 는다」 하나이고, 저항이 미는 힘에 다가가 간격이 더 벌어지지
 * 않는 장면은 `terminal-velocity` 의 주장이다 (사용자 승인, NOTES (a)).
 */
export const PHYSICS = {
  force: 1,
  mass: 0.5,
  linear: 0.08,
  quadratic: 0.04,
  /** 지난 자리를 남기는 간격(초). */
  strobe: 0.25,
  /** 멈춘 장면을 붙잡아 두는 시간(초). */
  hold: 1.2,
  /** 빗금 몫 ÷ 채움 몫이 이 값에 이르면 멈춘다. */
  overtake: 1.75,
} as const;

/** 도착했을 때 이미 달리고 있도록 미리 굴리는 시간(초). 원본 PREROLL. */
export const PREROLL = 0.5;

// ------------------------------------------------------------------------
// 배치 — 원본 캔버스(860 × 290, px, y 아래로) 그대로
// ------------------------------------------------------------------------

export const LAYOUT = {
  width: 860,
  height: 290,
  /** 공이 달리는 구간의 시작 · 끝 x. */
  x0: 40,
  xEnd: 700,
  /** 한 번 달리는 거리 — 구간 폭을 이것으로 나눈 것이 거리 1 의 px 다. */
  course: 14.5,
  /** 공 줄의 y. */
  laneY: 48,
  ballR: 11,
  /** 막대 바닥 y. */
  baseY: 272,
  /** 힘 1 의 막대 높이(px). 미는 힘 기준선이 이 높이에 그어진다. */
  forcePx: 150,
  /** 힘 1 의 화살표 길이(px). 미는 힘 · 저항 화살표가 함께 쓴다. */
  arrowPx: 40,
  barW: 9,
  /** 막대 이름이 놓이는 x 가 구간 끝에서 떨어진 거리. */
  labelGap: 24,
  /** 캡션이 캔버스 안으로 들어오며 그림 아래 더 잡는 자리. 원본은 캔버스 밖 한 줄. */
  captionRoom: 34,
} as const;

/** 글자 크기(화면 px). 원본 13px, 캡션 15px. */
export const FONT = { label: 13, caption: 15 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const dragForceMessages = Object.freeze({
  'label.title': { ko: '공기 저항', en: 'Air drag' },
  'label.operation': {
    ko: '빨라질수록 속도 제곱에 비례하는 저항이 가파르게 불어난다',
    en: 'The faster it goes, the steeper the part of drag proportional to speed squared grows',
  },
  'label.stage': { ko: '미는 힘', en: 'Constant push' },
  'label.view': { ko: '지난 자리와 저항 막대', en: 'Strobe and drag bars' },
  /** 미는 힘 기준선 이름. */
  'label.push': { ko: '미는 힘', en: 'push' },
  /** 가장 최근 막대 아래 칸(채움) 이름표. */
  'label.linear': { ko: '속도에 비례', en: 'proportional to speed' },
  /** 가장 최근 막대 위 칸(빗금) 이름표. */
  'label.quadratic': { ko: '속도 제곱에 비례', en: 'proportional to speed squared' },
  'caption.linear': {
    ko: '느릴 때 저항은 대부분 속도에 비례하는 몫이다',
    en: 'At low speed, most of the drag is the part proportional to speed',
  },
  'caption.quadratic': {
    ko: '빨라질수록 속도 제곱에 비례하는 몫이 가파르게 불어난다',
    en: 'As it speeds up, the part proportional to speed squared grows steeply',
  },
} satisfies Record<string, LocalizedText>);

export type DragForceMessageKey = keyof typeof dragForceMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: DragForceMessageKey): LocalizedText => dragForceMessages[key];

/** 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: DragForceMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const dragForceSchema: BundleSchema = {
  id: DRAG_FORCE_ID,
  label: text('label.title'),
  category: 'mechanics',
  operation: text('label.operation'),

  /** 달리고 · 붙잡히고 · 되감긴다. 끝난 화면이 남지 않는다. */
  timeModel: 'periodic',

  // 조작기가 없다. 한 번 달리는 동안 주장이 끝난다.
  parameters: [],

  stages: [
    {
      id: 'default',
      label: text('label.stage'),
      constants: { ...PHYSICS },
    },
  ],
  environments: [],
  views: [{ id: 'default', label: text('label.view'), default: true }],

  /** 원본은 그림 290px + 캔버스 밖 캡션 한 줄. 캡션이 안으로 들어오고 러너가 사방에 여백을 둔다. */
  canvas: { height: 370, minHeight: 330 },

  // 원본이 그린 순서 그대로 겹친다 — 연결선 위에 막대, 막대 위에 공.
  drawOrder: 'scene',

  /**
   * **시간표를 선언하지 않는다.** 원본은 단계 경계가 아니라 적분한 속도로 움직인다 —
   * 멈추는 시점도 캡션이 갈리는 시점도 속도에 달려 있다. 그래서 `startAt` 이 아니라
   * `preroll` 로 실제 걸음을 미리 걷는다(시계만 옮기면 지난 자리가 비어 있다).
   */
  preroll: PREROLL,

  /**
   * 캡션 슬롯 하나. 문장이 갈리는 시점이 속도(상태)에 달려 있어 `cases` 로 고른다.
   * 1차 몫이 아직 크면 첫 문장, 아니면 `text`.
   */
  caption: {
    anchor: { screen: 'bottom-left' },
    align: 'left',
    fontSize: FONT.caption,
    style: { colorRole: 'ink', emphasis: 'strong' },
    text: key('caption.quadratic'),
    cases: [{ when: 'linearDominant', text: key('caption.linear') }],
  },

  /**
   * 그리드도 카메라 버튼도 없다 (기본값). 지난 자리 간격이 가로축, 막대 높이가
   * 세로축 구실을 이미 한다 — 축을 더하면 같은 말이 둘이 된다.
   */

  messages: dragForceMessages,
};
