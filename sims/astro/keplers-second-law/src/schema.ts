// ========================================================================
// keplers-second-law — 선언
// ========================================================================
// 질문: 행성이 태양 가까이에서 빠르고 멀리서 느리다면, 도대체 무엇이 같은가.
// 답의 동사: 같은 높이까지 찬다 — 모양이 다른 부채꼴이 같은 1.5초 동안 같은 넓이를 쓸고 간다.
//
// 원본: tasks/piece-lab/keplers-second-law.
// ========================================================================

import type { BundleSchema, LocalizedText, TimelinePhase } from '@aperi21/schema';
import { SLOTS, SLOT_COUNT, SLOT_SECONDS, type SlotDistance } from './physics';

/** 등록 키 `aperi21:keplers-second-law` 와 문자 그대로 일치한다 (C4). */
export const KEPLERS_SECOND_LAW_ID = 'keplers-second-law';

/**
 * 프레이밍. 원본 캔버스 860 × 320 px 를 월드(px / 100)로 옮기고, 원본이 캔버스 밖 HTML 로
 * 두던 캡션 자리를 아래에 더했다.
 */
export const SCENE_BOUNDS = { minX: 0, maxX: 8.6, minY: -0.45, maxY: 3.2 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const keplersSecondLawMessages = Object.freeze({
  'label.title': { ko: '케플러 제2법칙', en: "Kepler's second law" },
  'label.operation': { ko: '같은 시간에 같은 넓이', en: 'Equal areas in equal times' },
  'label.stage': { ko: '이심률 0.8 궤도', en: 'Orbit with eccentricity 0.8' },
  'label.view': { ko: '쓸고 간 넓이', en: 'Swept areas' },
  /** 막대가 무엇을 재는지. 없으면 막대가 읽히지 않는다. */
  'label.bars': { ko: '1.5초마다 쓸고 간 넓이', en: 'Area swept every 1.5 s' },
  'caption.near': {
    ko: '태양 가까이: 빠르게 지나가며 짧고 넓적한 부채꼴을 쓴다 — 막대는 다른 칸과 같은 높이까지 찬다',
    en: 'Near the Sun: it rushes past and sweeps a short, wide fan — the bar fills to the same height as the others',
  },
  'caption.far': {
    ko: '태양에서 멀리: 느리게 지나가며 길고 가는 부채꼴을 쓴다 — 막대는 다른 칸과 같은 높이까지 찬다',
    en: 'Far from the Sun: it creeps along and sweeps a long, thin fan — the bar fills to the same height as the others',
  },
  'caption.between': {
    ko: '태양과의 거리가 달라지는 구간: 부채꼴 모양이 바뀌어도 — 막대는 다른 칸과 같은 높이까지 찬다',
    en: 'Where the distance to the Sun is changing: the fan changes shape — yet the bar fills to the same height as the others',
  },
} satisfies Record<string, LocalizedText>);

export type KeplersSecondLawMessageKey = keyof typeof keplersSecondLawMessages;

export const text = (key: KeplersSecondLawMessageKey): LocalizedText => keplersSecondLawMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 타입이 막는다. */
function key(k: KeplersSecondLawMessageKey): string {
  return k;
}

const CAPTION_BY_DISTANCE: Record<SlotDistance, KeplersSecondLawMessageKey> = {
  near: 'caption.near',
  far: 'caption.far',
  between: 'caption.between',
};

/** 칸 k 의 시간표 단계 id. scene 이 지금 단계에서 칸 번호를 되찾는다. */
export const SLOT_PHASE_IDS: readonly string[] = Array.from({ length: SLOT_COUNT }, (_, i) => `slot-${i}`);

/**
 * 한 주기 = 같은 시간 칸 12개. 단계 i 가 칸 i 이고, 진행도가 그 칸을 쓸고 간 몫이다.
 *
 * 칸마다의 캡션은 **그 칸 가운데 시각의 태양 거리**로 고른다(원본 문턱 0.9a / 1.4a). 칸 경계에서만
 * 바뀌므로 칸 도중에 문장과 모양이 어긋나지 않는다. 문턱 판정은 궤도 계산의 결과라 여기서 한 번
 * 셈해 단계 선언에 싣는다 — 이웃 칸이 같은 키면 엔진이 다시 페이드하지 않는다.
 */
const SLOT_PHASES: TimelinePhase[] = SLOTS.map((slot, i) => ({
  id: SLOT_PHASE_IDS[i]!,
  duration: SLOT_SECONDS,
  caption: key(CAPTION_BY_DISTANCE[slot.distance]),
}));

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const keplersSecondLawSchema: BundleSchema = {
  id: KEPLERS_SECOND_LAW_ID,
  label: text('label.title'),
  category: 'astro',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 이심률 조작기를 두지 않는다 — 궤도 모양 바꾸기는 다른 질문이다 (NOTES.md).
  parameters: [],
  stages: [{ id: 'default', label: text('label.stage'), constants: {} }],
  environments: [],
  views: [{ id: 'default', label: text('label.view'), default: true }],

  /** 원본 860 × 320 비율에 캡션 두 줄 자리를 더했다. */
  canvas: { height: 400, minHeight: 360 },

  /** 칸 경계를 부채꼴 위에, 행성을 동경 위에 — 원본이 그린 순서가 겹침을 정한다. */
  drawOrder: 'scene',

  timeline: { phases: SLOT_PHASES },

  /**
   * 도착한 순간 근일점 직전 칸(11번)을 절반 쓸고 있다. 단계 0 이 칸 0 의 시작이므로
   * 11번 칸의 가운데 = 11.5 × 1.5 초.
   */
  startAt: (SLOT_COUNT - 0.5) * SLOT_SECONDS,

  // 슬롯 하나. 원본은 캔버스 아래 HTML 문장이었다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -6] },
    fontSize: 15,
    style: { colorRole: 'ink', emphasis: 'strong' },
    wrapWidth: 820,
  },

  messages: keplersSecondLawMessages,
};
