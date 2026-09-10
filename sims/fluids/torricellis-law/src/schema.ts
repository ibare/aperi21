// ========================================================================
// torricellis-law — 선언
// ========================================================================
// 질문: 구멍이 깊을수록 왜 더 세게 뿜는가.
//
// 구멍 위 물기둥이 깊을수록 물이 더 빠른 속도로 뿜어 나간다. v = √(2gh).
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:torricellis-law` 와 문자 그대로 일치한다 (C4). */
export const TORRICELLIS_LAW_ID = 'torricellis-law';

/**
 * 확정값. 수면 높이 H 는 일정하게 유지된다(위에서 계속 채운다고 본다).
 *
 *   구멍 높이 y / 물기둥 h = H − y / 분출 속도 v = √(2gh)
 *     0.60 m / 0.20 m / 1.98 m/s
 *     0.30 m / 0.50 m / 3.13 m/s
 *     0.10 m / 0.70 m / 3.70 m/s
 *
 * 도달 거리와 낙하 시간은 계산되지만 **화면에 두지 않는다.** 이 조각의 주장이
 * 아니다 — 자세한 이유는 NOTES.md 「함정」.
 */
export const WATER_LEVEL = 0.8;
export const HOLES: readonly { id: string; y: number; depthInset: number }[] = [
  { id: 'high', y: 0.6, depthInset: -0.22 },
  { id: 'mid', y: 0.3, depthInset: -0.3 },
  { id: 'low', y: 0.1, depthInset: -0.38 },
];

/** 물통 — 오른쪽 벽(x = 0)에 구멍이 뚫려 있다. */
export const TANK = { left: -0.45, wall: 0, top: 0.92, bottom: 0 } as const;
/** 구멍의 세로 크기(m). 벽을 이만큼 끊는다. */
export const HOLE_GAP = 0.03;

/** 물방울 수명(초). 세 구멍 모두 같다 — 화면의 모든 물방울이 "같은 시간 동안 날아간 것" 이다. */
export const DROPLET_LIFE = 0.26;
/** 초당 방출 개수. 원본의 0.006 s 간격. */
export const DROPLET_RATE = 167;

/** 동시 출발 표지의 주기와 머무는 시간(초). */
export const PULSE_PERIOD = 2.6;
export const PULSE_HOLD = 0.46;

/**
 * 프레이밍이 곧 주장이다 — **착지 지점을 화면에 두지 않는다.** 물통은 허공에
 * 놓여 있고 물줄기가 닿는 면이 없다. 가로를 물줄기 끝(≈0.75 m)에 맞춰 잘라
 * 세로 배율을 벌었다.
 */
export const SCENE_BOUNDS = { minX: -0.5, maxX: 0.87, minY: -0.28, maxY: 0.97 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const torricellisLawMessages = Object.freeze({
  'label.title': { ko: '토리첼리 법칙', en: "Torricelli's law" },
  'label.operation': {
    ko: '깊은 구멍일수록 더 빠르게 뿜는다',
    en: 'The deeper the hole, the faster the jet',
  },
  'label.stage': { ko: '물통', en: 'Tank' },
  'label.view': { ko: '물줄기', en: 'Jets' },
  /** 구멍 옆 분출 속도. 수와 단위는 표식이라 번역 대상이 아니다 (C1 판정 3). */
  'label.speed': { ko: '{v} m/s', en: '{v} m/s' },
  /** 수면에서 구멍까지의 깊이. */
  'label.depth': { ko: 'h = {h} m', en: 'h = {h} m' },
  'caption.main': {
    ko: '깊은 구멍일수록 물줄기가 더 빠르게 뿜어 나간다',
    en: 'The deeper the hole, the faster the water leaves it',
  },
  'caption.pulse': {
    ko: '같은 순간에 출발한 세 물방울 — 아래 구멍 것이 가장 앞서 있다',
    en: 'Three droplets that left at the same instant — the lowest is farthest ahead',
  },
} satisfies Record<string, LocalizedText>);

export type TorricellisLawMessageKey = keyof typeof torricellisLawMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export function text(key: TorricellisLawMessageKey): LocalizedText {
  return torricellisLawMessages[key];
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const torricellisLawSchema: BundleSchema = {
  id: TORRICELLIS_LAW_ID,
  label: text('label.title'),
  category: 'fluids',
  operation: text('label.operation'),
  timeModel: 'linear',

  // 조작기가 없다. 열면 바로 뿜고, 계속 뿜고, 표지가 알아서 돌아온다.
  parameters: [],

  stages: [
    {
      id: 'tank',
      label: text('label.stage'),
      constants: { g: 9.8, waterLevel: WATER_LEVEL },
    },
  ],

  environments: [],

  views: [{ id: 'jets', label: text('label.view'), default: true }],

  autoViews: { energy: false },
  /**
   * 세로가 비싸다. 물통(0.92 m)과 물줄기가 떨어지는 자리(−0.23 m)를 함께 담아야
   * 하는데 가로는 1.37 m 뿐이라, 낮은 캔버스에서는 세로가 제약이 되어 그림이
   * 작아진다.
   */
  canvas: { height: 560, minHeight: 480 },

  /**
   * 그리드도 카메라 버튼도 없다 (기본값). 그리드는 "여기서 거리를 재라" 는
   * 지시인데, 이 그림에서 재야 할 것은 거리가 아니라 깊이와 속도다. 그리고
   * 이 조각의 논증에는 **착지 지점을 화면에 두지 않는다** 가 포함돼 있어서,
   * 카메라를 주면 독자가 프레임을 넓혀 함정을 스스로 복원한다.
   */

  messages: torricellisLawMessages,
};
