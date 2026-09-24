// ========================================================================
// lagrange-points — 선언
// ========================================================================
// 질문: 힘이 0 인 다섯 곳에 놓인 물체는 다 거기 머무는가. 지형으로 보면 꼭대기인
// L4·L5 가 왜 오히려 붙잡아 두는가.
//
// 지구·달과 함께 도는 틀의 유효 퍼텐셜 지형 위에서, 다섯 평형점 곁에 살짝 비껴 놓은
// 물체가 안장(L1·L2·L3)에서는 흘러나가고 꼭대기(L4·L5)에서는 맴돈다.
//
// 원본: tasks/piece-lab/lagrange-points. 상수는 원본 그대로다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:lagrange-points` 와 문자 그대로 일치한다 (C4). */
export const LAGRANGE_POINTS_ID = 'lagrange-points';

/**
 * 물리 — 원 궤도를 도는 두 천체와 함께 도는 틀.
 * 길이 단위 = 두 천체 거리, 시간 단위 = 공전 주기 / 2π.
 */
export const MU = 0.01215;
/** 화면 1초 = 물리 시간 1.5 단위 (공전 한 바퀴 ≈ 4.2초). */
export const TIME_SCALE = 1.5;
/** 한 고정 걸음 안의 RK4 나눔 수. */
export const SUBSTEPS = 4;
/** 원본 `PieceKit.loop` 의 고정 걸음(초). */
export const DT = 1 / 60;

/** 시험 물체 — 원본 수치 점검 결과이지 일반값이 아니다 (원본 NOTES (d)). */
export const TEST = {
  /** 평형점에서 비껴 놓는 거리. */
  offset: 0.01,
  /** 점마다 물체를 새로 놓는 간격(초). */
  emitEvery: 1.6,
  /** 수명(초). */
  life: 20,
  /** 사라질 때 흐려지는 시간(초). */
  fade: 1.5,
  /** 남기는 자취 길이(초). */
  trailKeep: 12,
  /** 제자리에서 이만큼 벗어나면 떠난 것으로 보고 흐리게 지운다. */
  leaveDist: 0.5,
  /** 원점에서 이만큼 멀어지면 떠난 것으로 본다. */
  farDist: 2.4,
  /** 달 우물 안으로 떨어졌다고 보는 거리. */
  moonCapture: 0.07,
  /** 지구에 닿았다고 보는 거리. */
  earthCapture: 0.04,
  /** 시드 (원본 촬영 `?seed=1`). */
  seed: 1,
} as const;

/** 도착한 순간 이미 흘러나가고 맴도는 중이도록 미리 돌리는 시간(초). */
export const PREROLL = 20;

/**
 * 원본 무대 — 캔버스 900 × 450 에서 배율 min(W/2.9, H/2.35) = 191.5 px/단위.
 * 보이는 월드는 가로 ±2.35, 세로 ±1.175 다. 세로를 그대로 프레이밍한다.
 */
export const PLOT = { halfH: 2.35 / 2 } as const;

/**
 * 화면 px 로 그리던 치수를 월드로 옮길 때 쓰는 배율(px/단위). sims 캔버스에서 나오는 배율에
 * 맞췄다 — 화면 px 고정 크기가 없어서다 (NOTES 「어휘 부족」 G25).
 */
export const PX_PER_UNIT = 163;

/** 캡션 띠(월드 단위). 원본 캡션은 캔버스 밖 문단이었다 — 슬롯이 캔버스 안이라 그림 아래를 비운다. */
export const CAPTION_BAND = 0.34;

/** 지형 격자 — 원본은 한 칸 2px. */
export const TERRAIN = {
  cell: 2 / (450 / 2.35),
  /** 가로 반폭(월드). 원본이 보이던 폭(±2.35)보다 넓게 깔아 넓은 임베드에서도 끝이 비치지 않는다. */
  halfW: 2.6,
  /** 명암 아래 끝 퍼텐셜. 위 끝은 L4 높이. */
  low: -1.75,
  /** 비탈 등고선 높이. 안장 셋 · 꼭대기 바로 아래 둘에 더한다. */
  slopeLevels: [-1.53, -1.64, -1.7, -1.8, -1.95],
  /** 꼭대기 바로 아래 두 줄 — 꼭대기 높이에서 뺄 값. */
  peakDrops: [0.003, 0.01],
  /**
   * 지형 명암의 인스턴스 불투명도. 원본 꼭대기 색은 먹색이 아니라 바탕에 가까운 옅은 톤이었다 —
   * 순차형 높은 끝이 역할 색 끝으로 고정이라 인스턴스 알파로 눌렀다 (NOTES G62 · G70).
   */
  shadeOpacity: 0.45,
  contourOpacity: 0.22,
  contourWidth: 1,
} as const;

/** 그림 치수(화면 px). 원본 그대로. */
export const MARKS = {
  earthR: 9,
  moonR: 4.5,
  crossHalf: 5,
  crossWidth: 1,
  labelFont: 12,
  headR: 2.2,
  trailWidth: 1.3,
  /** 자취 구간 하나의 표본 수. */
  trailChunk: 8,
  /** 자취 최대 불투명도. */
  trailAlpha: 0.75,
} as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const lagrangePointsMessages = Object.freeze({
  'label.title': { ko: '라그랑주 점', en: 'Lagrange points' },
  'label.stage': { ko: '지구와 달', en: 'Earth and Moon' },
  'label.view': { ko: '함께 도는 틀', en: 'Co-rotating frame' },
  'label.earth': { ko: '지구', en: 'Earth' },
  'label.moon': { ko: '달', en: 'Moon' },
  /** 평형점 이름. 기호라 언어마다 같다 (C1 판정 3). */
  'label.point': { ko: 'L{n}', en: 'L{n}' },
  'caption.main': {
    ko: '지구와 달을 따라 함께 도는 틀에서, 다섯 평형점 곁에 살짝 비껴 놓은 물체는 안장인 L1·L2·L3에서는 흘러나가고 언덕 꼭대기인 L4·L5에서는 그 둘레를 맴돈다.',
    en: 'In the frame turning with the Earth and Moon, a body nudged off each of the five equilibrium points drifts away from the saddles L1, L2 and L3, yet circles around the hilltops L4 and L5.',
  },
} satisfies Record<string, LocalizedText>);

export type LagrangePointsMessageKey = keyof typeof lagrangePointsMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: LagrangePointsMessageKey): LocalizedText => lagrangePointsMessages[key];

/** 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: LagrangePointsMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const lagrangePointsSchema: BundleSchema = {
  id: LAGRANGE_POINTS_ID,
  title: text('label.title'),
  category: 'astro',
  timeModel: 'continuous',

  // 조작기가 없다. 질량비를 바꾸면 L4·L5 도 불안정해지지만 그것은 다른 주장이다 (원본 NOTES (c)).
  parameters: [],
  stages: [{ id: 'default', label: text('label.stage'), constants: {} }],
  environments: [],
  views: [{ id: 'default', label: text('label.view'), default: true }],

  /** 세로는 가로의 절반(원본) + 캡션 띠. 마운트 후 바뀌지 않는다 (원칙 6). */
  canvas: { height: 510, minHeight: 420 },

  /**
   * 시간표가 없다. 원본에는 주기 안 단계가 없고, 물체가 점마다 1.6초 간격으로 계속 놓이며
   * 그 운동은 적분(누적)이다 — 시계는 `step` 이 상태에 쌓는다.
   */
  preroll: PREROLL,

  /** 겹침 순서 = 원본 그리기 순서 — 지형 → 등고선 → 지구 · 달 → 평형점 → 시험 물체. */
  drawOrder: 'scene',

  // 슬롯 하나, 고정 문장. 물체가 점마다 계속 새로 놓이므로 어느 시각에도 화면과 어긋나지 않는다.
  caption: {
    anchor: { screen: 'bottom-left', offset: [14, -8] },
    align: 'left',
    fontSize: 15,
    wrapWidth: 800,
    style: { colorRole: 'ink', emphasis: 'strong' },
    text: key('caption.main'),
  },

  // 그리드 · 카메라 단추 없음(기본값). 거리 수치는 주장과 무관하다.

  messages: lagrangePointsMessages,
};
