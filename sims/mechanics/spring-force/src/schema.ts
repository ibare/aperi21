// ========================================================================
// spring-force — 선언
// ========================================================================
// 질문: 용수철을 두 배 늘이면 되돌리는 힘도 정말 두 배가 되는가.
//
// 손이 물체를 같은 간격(한 칸)씩 끌고 칸마다 멈춘다. 멈출 때마다 그 순간의 힘
// 화살표를 아래 줄에 자국으로 남겨, 네 줄이 길이 1·2·3·4 의 계단을 이룬다.
//
// 값은 모두 원본(tasks/piece-lab/spring-force/index.html)에서 그대로 옮겼다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:spring-force` 와 문자 그대로 일치한다 (C4). */
export const SPRING_FORCE_ID = 'spring-force';

// ------------------------------------------------------------------------
// 시간표 — 원본 상수
// ------------------------------------------------------------------------

/** 네 칸까지 늘인다. */
export const STEPS = 4;
/** 한 칸 당기는 시간(s). */
export const MOVE = 0.9;
/** 칸마다 멈추는 시간(s). */
export const HOLD = 0.9;
/** 네 칸에서 마지막으로 멈춘 모습(s). */
export const FINAL_HOLD = 1.3;
/** 원래 길이로 돌아가는 시간(s). */
export const RETURN = 1.5;
/** 원래 길이에서 쉬는 시간(s). */
export const REST = 0.5;
/** 도착한 순간 이미 첫 칸을 당기는 중. */
export const OFFSET = 0.45;

/** 칸 번호(1~4)의 단계 id. scene 이 같은 함수로 부른다. */
export const moveId = (i: number): string => `move${i}`;
export const holdId = (i: number): string => `hold${i}`;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const springForceMessages = Object.freeze({
  'label.title': { ko: '탄성력', en: 'Spring force' },
  'label.operation': { ko: '변형에 비례하는 복원력', en: 'Restoring force proportional to stretch' },
  'label.stage': { ko: '기본', en: 'Default' },
  'label.view': { ko: '기본', en: 'Default' },
  /** 늘이지 않았을 때 물체 왼쪽 면 자리. */
  'label.natural': { ko: '원래 길이', en: 'natural length' },
  /** 늘임 눈금. */
  'label.unit': { ko: '{n}칸', en: '{n} step' },
  /** 손잡이 — 늘이는 바깥 원인. */
  'label.pull': { ko: '당김', en: 'pull' },
  /** 지금 힘 화살표의 이름. */
  'label.force': { ko: '되돌리는 힘', en: 'restoring force' },
  'caption.move1': { ko: '한 칸 늘인다', en: 'Stretch it one step' },
  'caption.moveMore': { ko: '한 칸 더 늘인다', en: 'Stretch it one more step' },
  'caption.hold1': { ko: '1칸 늘이면 되돌리는 힘은 1만큼', en: 'Stretched 1 step, the restoring force is 1' },
  'caption.hold2': { ko: '2칸 늘이면 되돌리는 힘도 2배', en: 'Stretched 2 steps, the restoring force is 2 times' },
  'caption.hold3': { ko: '3칸 늘이면 되돌리는 힘도 3배', en: 'Stretched 3 steps, the restoring force is 3 times' },
  'caption.hold4': { ko: '4칸 늘이면 되돌리는 힘도 4배', en: 'Stretched 4 steps, the restoring force is 4 times' },
  'caption.final': {
    ko: '늘인 길이와 되돌리는 힘이 같은 비율로 커졌다',
    en: 'The stretch and the restoring force grew in the same proportion',
  },
  'caption.return': {
    ko: '줄여 주면 되돌리는 힘도 함께 줄어든다',
    en: 'Let it shorten and the restoring force shrinks with it',
  },
  'caption.rest': {
    ko: '원래 길이에서는 되돌리는 힘이 없다',
    en: 'At its natural length there is no restoring force',
  },
} satisfies Record<string, LocalizedText>);

export type SpringForceMessageKey = keyof typeof springForceMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: SpringForceMessageKey): LocalizedText => springForceMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: SpringForceMessageKey): string {
  return k;
}

const HOLD_CAPTIONS: readonly SpringForceMessageKey[] = [
  'caption.hold1',
  'caption.hold2',
  'caption.hold3',
  'caption.hold4',
];

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const springForceSchema: BundleSchema = {
  id: SPRING_FORCE_ID,
  label: text('label.title'),
  category: 'mechanics',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다. 자동 진행만으로 늘임과 힘의 비례가 드러난다.
  parameters: [],

  stages: [{ id: 'default', label: text('label.stage'), constants: {} }],
  environments: [],
  views: [{ id: 'default', label: text('label.view'), default: true }],

  /**
   * 원본은 그림 860 × 270 + 캔버스 밖 캡션 한 줄이었다. 캡션이 캔버스 안(화면 고정
   * 줄)으로 들어오고 러너가 사방에 여백을 두므로 그만큼 더 잡는다.
   */
  canvas: { height: 340, minHeight: 300 },

  /** 원본은 `(t + 0.45) mod 10.5` 로 열었다 — 첫 칸을 당기는 중에 도착한다. */
  startAt: OFFSET,

  /**
   * 한 주기 10.5 s — (당김 0.9 → 멈춤 0.9) × 4 → 마지막 멈춤 1.3 → 되돌아감 1.5 → 쉼 0.5.
   * 당김과 되돌아감에만 이징을 건다. 멈춤의 캡션은 칸마다 다르다.
   */
  timeline: {
    phases: [
      ...Array.from({ length: STEPS }, (_, k) => [
        {
          id: moveId(k + 1),
          duration: MOVE,
          ease: 'smooth' as const,
          caption: key(k === 0 ? 'caption.move1' : 'caption.moveMore'),
        },
        { id: holdId(k + 1), duration: HOLD, caption: key(HOLD_CAPTIONS[k]!) },
      ]).flat(),
      { id: 'final', duration: FINAL_HOLD, caption: key('caption.final') },
      { id: 'return', duration: RETURN, ease: 'smooth', caption: key('caption.return') },
      { id: 'rest', duration: REST, caption: key('caption.rest') },
    ],
  },

  // 원본이 그린 순서대로 겹친다 — 벽 · 원래 길이 선 · 눈금 · 용수철 · 물체 · 손잡이 · 힘 · 자국.
  drawOrder: 'scene',

  // 슬롯 하나. 원본의 캔버스 아래 캡션 자리 — 왼쪽 한 줄, 16px, 먹색. 바로 바뀐다.
  caption: {
    anchor: { screen: 'bottom-left' },
    align: 'left',
    fontSize: 16,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  // 그리드도 카메라 버튼도 없다 (기본값). 잴 것은 늘임 눈금 한 줄이면 된다.

  messages: springForceMessages,
};
