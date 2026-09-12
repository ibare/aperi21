// ========================================================================
// heat-conduction — 선언
// ========================================================================
// 질문: 같은 불에 같은 시간을 두었는데, 왜 쇠막대는 반대쪽 끝까지 뜨거워지고
// 나무막대는 잡은 자리가 미지근한가.
//
// 열확산계수가 80배 다르기 때문이다. 온도를 색으로만 말하지 않고 **자리를 옮기는
// 사건**(밀랍 구슬이 차례로 떨어지는 것)으로 바꿔 보인다.
//
// 원본: tasks/piece-lab/heat-conduction/ (자유 구현)
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:heat-conduction` 와 문자 그대로 일치한다 (C4). */
export const HEAT_CONDUCTION_ID = 'heat-conduction';

// ------------------------------------------------------------------------
// 물리 — 길이 mm · 시간 초 · 온도 ℃
// ------------------------------------------------------------------------
//
// 열확산계수 α = k / (ρ·c). 연강 1.2e-5 m²/s, 소나무(결 방향) 1.5e-7 m²/s.
// 화면에서는 mm²/s 로 쓴다 — 1 m²/s = 1e6 mm²/s.

/** 막대 길이(mm). */
export const ROD_MM = 150;
/** 쇠 α = 12 mm²/s (= 1.2×10⁻⁵ m²/s). */
export const A_STEEL = 12;
/** 나무 α = 0.15 mm²/s (= 1.5×10⁻⁷ m²/s). 오직 이 수 하나가 다르다. */
export const A_WOOD = 0.15;
/** 주변 온도(℃). */
export const T_AMB = 20;
/** 버너에 닿은 끝을 붙잡아 두는 온도(℃). */
export const T_HOT = 250;
/** 밀랍 녹는점(℃). */
export const T_MELT = 60;
/** 무차원 온도 θ = (T − T_AMB)/(T_HOT − T_AMB) 에서의 녹는점. */
export const THETA_MELT = (T_MELT - T_AMB) / (T_HOT - T_AMB);

/** 화면 1 초가 흐르는 동안 지나는 물리 시간(초). 이 물리의 시간 상수에서 나온 값이다. */
export const SEC_PER_SEC = 40;

/** 격자 노드는 0..N. */
export const N = 120;
/** 격자 간격(mm). */
export const DX = ROD_MM / N;
/**
 * 안정계수의 상한. explicit 유한차분은 α·dt/dx² ≤ 0.5 를 넘기면 발산한다.
 * 한계에 딱 붙이지 않고 여유를 둔다 — `physics.substeps` 가 이 값으로 서브스텝을 정한다.
 */
export const STABILITY = 0.45;

/** 막대마다 붙인 밀랍 구슬 수. */
export const BEAD_COUNT = 10;
/** 구슬 간격(mm). 구슬이 곧 자다 — 따로 눈금을 긋지 않는 이유다. */
export const BEAD_SPACING_MM = 15;

/**
 * 도착한 순간 이미 지나 있는 물리 시간(초).
 *
 * 원본은 `loop` 밖에서 손으로 `advance` 를 돌려 감았다. 지금은 선언이 한다 —
 * `BundleSchema.preroll` 은 **화면 시간**이라 배율로 나눠 준다.
 */
export const PREROLL_PHYS_S = 30;
/** 화면 시간으로 환산한 프리롤(초). 러너가 1/60 걸음으로 굴린다. */
export const PREROLL_S = PREROLL_PHYS_S / SEC_PER_SEC;

// ------------------------------------------------------------------------
// 화면 — 원본 배치(860 × 276 px)를 월드로 옮긴다
// ------------------------------------------------------------------------
//
// 100 px = 월드 1. 원본이 px 로 잡은 자리·크기를 그대로 쓰되, 화면 px 가 아니라
// 월드에 두어 배율을 따라가게 한다. 굵기·글자 크기만 화면 px 로 남는다 (위계라
// 배율을 따라가지 않는다).

/** 원본 캔버스의 배치 상수(px). */
export const REF = {
  width: 860,
  height: 276,
  /** 막대 왼쪽 끝. */
  x0: 120,
  /** 막대 길이. */
  rodPx: 640,
  /** 막대 두께. */
  rodH: 28,
  /** 쇠막대 윗면. */
  steelTop: 34,
  /** 나무막대 윗면. */
  woodTop: 150,
  /** 막대 밑면에서 구슬 중심까지. */
  beadDrop: 7,
  /** 구슬이 굴러 멈추는 깊이(막대 밑면 기준). */
  floor: 40,
  /** 낙하 가속도(px/s², 화면 시간 기준). */
  gravity: 700,
  /** 이름표가 놓이는 x. 막대 오른쪽 끝 바깥이라 세로를 쓰지 않는다. */
  labelX: 778,
  /** 버너가 막대 왼쪽 끝에서 떨어진 거리. */
  flameDx: 10,
} as const;

/** 원본 1 px 이 월드로 얼마인가. */
export const PX = 1 / 100;
export function px(n: number): number {
  return n * PX;
}
/** 원본 캔버스 y(아래로 증가) → 월드 y(위로 증가). */
export function wy(canvasY: number): number {
  return px(REF.height - canvasY);
}

/** 1 mm 의 월드 길이. */
export const MM = px(REF.rodPx) / ROD_MM;
/** 막대 왼쪽 끝(월드 x). */
export const ROD_LEFT = px(REF.x0);
/** 막대 두께(월드). */
export const ROD_THICK = px(REF.rodH);
/** 막대 밑면에서 구슬 중심까지(월드). */
export const BEAD_DROP = px(REF.beadDrop);
/** 구슬이 멈추는 깊이(월드). */
export const FLOOR = px(REF.floor);
/** 낙하 가속도(월드/s²). */
export const GRAVITY = px(REF.gravity);

/**
 * 고정 경계. 프레이밍은 주장의 일부라 매 프레임 같은 값을 준다 (원칙 6).
 *
 * 가로는 불꽃 왼쪽 끝(113 px)에서 이름표 오른쪽(≈812 px)까지, 세로는 쇠막대 위
 * 쐐기(19 px)에서 나무막대 구슬이 쌓이는 바닥(≈231 px)까지다. 캡션은 화면 아래에
 * 고정되므로 월드 경계가 자리를 잡아 줄 필요가 없다.
 */
export const SCENE_BOUNDS = {
  minX: px(104),
  maxX: px(826),
  minY: wy(234),
  maxY: wy(16),
} as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const heatConductionMessages = Object.freeze({
  'label.title': { ko: '열전도', en: 'Heat conduction' },
  'label.operation': {
    ko: '쇠에서는 번져 나가고 나무에서는 머문다',
    en: 'It spreads in steel and stays in wood',
  },
  'label.stage': { ko: '두 막대', en: 'Two rods' },
  'label.view': { ko: '나란히', en: 'Side by side' },
  /** 재질 이름표. 두 막대를 가르는 유일한 조건이라 이름이 없으면 조각이 말을 못 한다. */
  'label.steel': { ko: '쇠', en: 'Steel' },
  'label.wood': { ko: '나무', en: 'Wood' },
  'caption.spread': {
    ko: '쇠에서는 60 ℃ 가 막대를 타고 번져 나가고, 나무에서는 데운 자리에 머문다',
    en: '60 ℃ travels along the steel rod, while in wood it stays where the flame is',
  },
  'caption.through': {
    ko: '쇠는 반대쪽 끝까지 60 ℃ 를 넘어 구슬이 모두 떨어졌고, 나무는 아직 데운 자리에 머문다',
    en: 'Steel passed 60 ℃ to its far end and dropped every bead; wood still holds at the flame',
  },
} satisfies Record<string, LocalizedText>);

export type HeatConductionMessageKey = keyof typeof heatConductionMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로 (C1). */
export function text(key: HeatConductionMessageKey): LocalizedText {
  return heatConductionMessages[key];
}

/** 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: HeatConductionMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const heatConductionSchema: BundleSchema = {
  id: HEAT_CONDUCTION_ID,
  label: text('label.title'),
  category: 'thermal',
  operation: text('label.operation'),
  timeModel: 'linear',

  // 조작기도 파라미터도 없다. 조건이 재질 하나뿐이고 그 두 값이 이미 나란히 돌고 있다.
  parameters: [],

  stages: [{ id: 'rods', label: text('label.stage'), constants: {} }],
  environments: [],
  views: [{ id: 'pair', label: text('label.view'), default: true }],

  autoViews: { energy: false },

  /**
   * 세로가 비싸다. 막대 둘 + 구슬이 떨어질 자리 + 캡션 한 줄로 끝낸다 — 원본이
   * 860 × 276 으로 끝낸 것과 같은 예산이다.
   */
  canvas: { height: 300, minHeight: 260 },

  /**
   * 원본의 그리는 순서를 그대로 지킨다.
   *
   * 층으로 두면 앞머리 선(`trajectory` 20)이 막대(`body` 40)와 달아오름
   * (`region` 45) **아래로** 밀려 보이지 않는다. 이 그림에서 겹침은 장식이 아니라
   * 판정 장치다 — 앞머리 선은 막대를 가로질러야 "여기까지 왔다" 가 된다.
   */
  drawOrder: 'scene',

  /**
   * 도착한 순간 이미 30 초(물리) 데워져 있다. 시계만 앞당기면 온도 배열이 비어
   * 있으므로 `startAt` 이 아니라 이것이어야 한다 — 상태를 실제로 굴린다.
   */
  preroll: PREROLL_S,

  /**
   * 캡션 슬롯 하나. 시간표가 없으므로 **상태**가 문안을 고른다 — 쇠가 끝까지
   * 도달한 순간이 문장이 갈리는 시점이고, 그 시점은 시각이 아니라 온도 배열에
   * 달려 있다.
   */
  caption: {
    anchor: { screen: 'bottom-left' },
    align: 'left',
    fontSize: 14,
    style: { colorRole: 'muted', emphasis: 'strong' },
    cases: [{ when: 'steelThrough', text: key('caption.through') }],
    text: key('caption.spread'),
  },

  /**
   * 크롬은 켜지 않는다 (기본 꺼짐). 그리드는 "여기서 거리를 재라" 는 지시인데
   * 이 그림에서 재는 자는 구슬이고, 카메라 버튼은 프레이밍을 독자에게 넘긴다.
   */

  messages: heatConductionMessages,
};
