// ========================================================================
// capillary-action — 선언
// ========================================================================
// 질문: 왜 관이 가늘수록 물이 더 높이 올라가는가.
//
// 오목한 물 면 바로 아래는 대기압보다 압력이 낮고, 물기둥은 제 무게로 그 부족을
// 메울 때까지 오른다 — 가는 관일수록 부족이 커서 더 높이 오른다.
// 원본: tasks/piece-lab/capillary-action (상수 · 배치는 원본에서 그대로 가져왔다).
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:capillary-action` 와 문자 그대로 일치한다 (C4). */
export const CAPILLARY_ACTION_ID = 'capillary-action';

// ------------------------------------------------------------------------
// 물리 상수 (SI) — 원본 그대로
// ------------------------------------------------------------------------

export const G = 9.81;

export type LiquidKey = 'water' | 'mercury';

/** 표면장력 γ, 접촉각 θ(도), 밀도 ρ, 점성 μ. */
export const LIQUIDS: Readonly<Record<LiquidKey, { gamma: number; theta: number; rho: number; mu: number }>> = {
  water: { gamma: 0.0728, theta: 0, rho: 1000, mu: 1.0e-3 },
  mercury: { gamma: 0.485, theta: 140, rho: 13534, mu: 1.55e-3 },
};

/** 관 안쪽 반지름(m). 세 관의 비는 1:2:4. */
export const RADII = [0.25e-3, 0.5e-3, 1.0e-3] as const;
/** 관 아래 끝이 바깥 수면 아래로 잠긴 깊이(m). */
export const DEPTH = 0.025;
/** 가장 가는 관의 시간상수를 화면 이만큼(초)으로 늦춘다. 같은 액체 세 관의 빠르기 비는 실제대로다. */
export const THIN_TUBE_SHOW_TAU = 1.6;
/** 도착 순간 이미 오르는 중이도록 미리 적분하는 화면 초. `preroll` 과 다시 담글 때 함께 쓴다. */
export const PRE_ROLL = 0.08;
/** 평형 판정: 목표 높이와 2% 이내. */
export const EQ_TOL = 0.02;
/** 한 걸음 안의 부분 단계 수 — 넓은 관은 시간상수가 짧아 쪼개 적분한다. */
export const SUBSTEPS = 40;
/** 압력 → 색 값의 감마. 약한 압력도 색으로 보이게 한다. */
export const COLOR_GAMMA = 0.6;

// ------------------------------------------------------------------------
// 배치 — 원본의 논리 좌표(820×372, y 아래로). scene 이 월드(y 위로)로 뒤집는다.
// ------------------------------------------------------------------------

export const FRAME = { width: 820, height: 372 } as const;
/** 높이는 세 관이 같은 축척. */
export const PX_PER_MM = 3.37;
/** 바깥 수면. */
export const Y0 = 242;
export const BASIN = { x0: 170, x1: 690, bottom: 336, wallRise: 24 } as const;
export const TUBE_X = [270, 430, 590] as const;
/** 폭은 과장, 서로의 비는 실제와 같다. */
export const TUBE_HALF_W = [7, 14, 28] as const;
export const TUBE_TOP = 26;
export const WALL = 3;
/** 압력 색 기준 띠. */
export const LEGEND = { x: 732, y1: 70, y2: 250, width: 12 } as const;

/** 스칼라장 격자 밀도(논리 px 당 칸). 가는 관의 원호 메니스커스가 계단으로 보이지 않게. */
export const CELLS_PER_PX = 2;

/**
 * 프레이밍. 원본 캔버스 전체에 캡션 두 줄과 액체 칩 자리를 아래로 더한다 — 원본은 캡션과
 * 버튼을 캔버스 밖 줄에 두었다.
 */
export const SCENE_BOUNDS = { minX: 0, maxX: FRAME.width, minY: -58, maxY: FRAME.height } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const capillaryActionMessages = Object.freeze({
  'label.title': { ko: '모세관 현상', en: 'Capillary action' },
  'label.stage': { ko: '세 관', en: 'Three tubes' },
  'label.view': { ko: '옆모습', en: 'Side view' },
  'label.outerLevel': { ko: '바깥 수면 높이', en: 'Outside level' },
  /** 기둥 높이 값. 수와 단위는 표식이다 (C1 판정 3). */
  'label.height': { ko: '{h} mm', en: '{h} mm' },
  'label.radius': { ko: '반지름 {r} mm', en: 'radius {r} mm' },
  'label.pressure': { ko: '압력', en: 'Pressure' },
  'label.low': { ko: '낮음', en: 'low' },
  'label.atmospheric': { ko: '대기압', en: 'atmospheric' },
  'label.high': { ko: '높음', en: 'high' },
  'option.water': { ko: '물', en: 'Water' },
  'option.mercury': { ko: '수은', en: 'Mercury' },
  'caption.waterRising': {
    ko: '오목한 수면 바로 아래는 대기압보다 압력이 낮다. 물기둥은 제 무게로 그 부족을 메울 때까지 오른다 — 가는 관일수록 부족이 크다.',
    en: 'Just below the concave surface the pressure is lower than atmospheric. The column rises until its own weight makes up the shortfall — the thinner the tube, the larger the shortfall.',
  },
  'caption.waterSettled': {
    ko: '관 안에서도 바깥 수면 높이의 압력이 대기압과 같아지자 멈췄다. 가는 관일수록 더 높이 멈춘다.',
    en: 'It stopped once the pressure at the outside level inside the tube matched the atmosphere. The thinner the tube, the higher it stops.',
  },
  'caption.mercuryFalling': {
    ko: '볼록한 수은 면 바로 아래는 대기압보다 압력이 높다. 수은은 그 초과분만큼 밀려 내려간다 — 가는 관일수록 초과분이 크다.',
    en: 'Just below the convex mercury surface the pressure is higher than atmospheric. The mercury is pushed down by that excess — the thinner the tube, the larger the excess.',
  },
  'caption.mercurySettled': {
    ko: '수은 면 바로 아래 압력이 바깥 같은 깊이의 압력과 같아지자 멈췄다. 가는 관일수록 더 깊이 멈춘다.',
    en: 'It stopped once the pressure just below the mercury surface matched the pressure at the same depth outside. The thinner the tube, the deeper it stops.',
  },
} satisfies Record<string, LocalizedText>);

export type CapillaryActionMessageKey = keyof typeof capillaryActionMessages;

export const text = (key: CapillaryActionMessageKey): LocalizedText => capillaryActionMessages[key];

/** 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: CapillaryActionMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const capillaryActionSchema: BundleSchema = {
  id: CAPILLARY_ACTION_ID,
  title: text('label.title'),
  category: 'fluids',
  // 멈춘 상태가 결론이라 되감지 않는다 — 시간표도 주기도 없다.
  timeModel: 'continuous',

  parameters: [],
  stages: [{ id: 'tubes', label: text('label.stage'), constants: {} }],
  environments: [],
  views: [{ id: 'side', label: text('label.view'), default: true }],

  /** 가로로 넓은 원본(820×372)에 캡션 두 줄 · 칩 자리를 더한 비율. */
  canvas: { height: 440, minHeight: 360 },

  /** 겹침이 그림이다 — 대야 → 관 속 액체 → 액체 막 → 유리관 → 점선 → 글자. */
  drawOrder: 'scene',

  /**
   * 기둥 높이는 루카스-워시번 식을 **적분해 쌓는** 상태다. 도착한 순간 이미 오르는 중이도록
   * 원본의 0.08 화면 초를 미리 굴린다.
   */
  preroll: PRE_ROLL,

  /**
   * 슬롯 하나. 문장은 **액체 × 멈춤 여부**로 갈린다 — 멈춤은 시각이 아니라 기둥 높이가
   * 목표의 2% 안에 들었는지로 판정하므로 시간표 단계가 아니라 상태 조건이다. 기본 문장은
   * 물이 오르는 중.
   */
  caption: {
    anchor: { screen: 'bottom-left', offset: [8, -6] },
    align: 'left',
    fontSize: 15,
    wrapWidth: 620,
    style: { colorRole: 'ink', emphasis: 'strong' },
    text: key('caption.waterRising'),
    cases: [
      { when: 'waterSettled', text: key('caption.waterSettled') },
      { when: 'mercuryFalling', text: key('caption.mercuryFalling') },
      { when: 'mercurySettled', text: key('caption.mercurySettled') },
    ],
  },

  messages: capillaryActionMessages,
};
