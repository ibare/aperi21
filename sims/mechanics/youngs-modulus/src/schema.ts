// ========================================================================
// youngs-modulus — 선언
// ========================================================================
// 질문: 같은 추를 걸었는데 2 m 강철선이 1 m 강철선보다 두 배 늘어났다.
// 그러면 긴 선이 더 무른 재료인가?
//
// 아니다. 눈금 하나하나는 같은 재료면 같은 높이까지 내려오고, 재료가 바뀌어야
// 더 내려온다. 늘어나는 정도는 선의 길이가 아니라 재료가 정한다.
//
// 값은 모두 원본(tasks/piece-lab/youngs-modulus/index.html)에서 그대로 옮겼다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:youngs-modulus` 와 문자 그대로 일치한다 (C4). */
export const YOUNGS_MODULUS_ID = 'youngs-modulus';

// ------------------------------------------------------------------------
// 물리 값 — 화면의 숫자는 모두 여기서 나온다
// ------------------------------------------------------------------------

/** 중력 가속도(m/s²). */
export const G = 9.8;
/** 추 질량(kg). 세 선에 같다. */
export const MASS = 5;
/** 선 지름(mm). 세 선에 같다 — 굵기가 다르면 응력 개념이 더 필요해 주장이 둘이 된다. */
export const DIAMETER_MM = 1.0;
/** 눈금 간격(m). */
export const MARK_M = 0.25;

export type Material = 'steel' | 'aluminium';

/** 세 선 — 왼쪽부터. 가운데 긴 강철선이 점선의 기준이다. */
export const WIRES: readonly { id: string; material: Material; lengthM: number; E: number }[] = [
  { id: 'steel-1', material: 'steel', lengthM: 1, E: 200e9 },
  { id: 'steel-2', material: 'steel', lengthM: 2, E: 200e9 },
  { id: 'aluminium-1', material: 'aluminium', lengthM: 1, E: 70e9 },
];
/** 점선을 끌어 오는 기준 선(`WIRES` 의 번호). 기준 선택이 곧 주장이다. */
export const REFERENCE_WIRE = 1;

// ------------------------------------------------------------------------
// 받침대 — 선이 받는 힘의 몫
// ------------------------------------------------------------------------

/**
 * 받침대가 내려간 정도 u 는 이 사이를 오간다. 선이 받는 힘의 몫은 min(u, 1).
 * u > 1 이면 받침대가 추에서 떨어진다. 가장 올라가도 무게의 20% 를 받으므로
 * 캡션이 어느 시각에도 화면과 어긋나지 않는다.
 */
export const U_LOW = 0.2;
export const U_HIGH = 1.3;

/** 받침대가 내려가는 시간(s). */
export const LOWER = 3;
/** 가장 내려간 채 머무는 시간(s). */
export const HOLD_LOW = 2;
/** 받침대가 올라오는 시간(s). */
export const RAISE = 2;
/** 가장 올라간 채 머무는 시간(s). */
export const HOLD_HIGH = 1;
/** 도착한 순간 이미 받침대가 내려가는 중 — 원본 `T_OFFSET`. */
export const OFFSET = 1.5;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const youngsModulusMessages = Object.freeze({
  'label.title': { ko: '영률', en: "Young's modulus" },
  'label.operation': {
    ko: '늘어나는 정도는 선의 길이가 아니라 재료가 정한다',
    en: 'How much a wire stretches is set by its material, not its length',
  },
  'label.stage': { ko: '기본', en: 'Default' },
  'label.view': { ko: '기본', en: 'Default' },
  /** 선 이름 — 재료와 늘어나기 전 길이. */
  'label.wire.steel': { ko: '강철 {l} m', en: 'steel {l} m' },
  'label.wire.aluminium': { ko: '알루미늄 {l} m', en: 'aluminium {l} m' },
  /** 추에 새긴 질량. 수와 단위는 표식이다 (C1 판정 3). */
  'label.mass': { ko: '{m} kg', en: '{m} kg' },
  /** 선 전체가 늘어난 실제 길이. */
  'label.stretch': { ko: '늘어남 {x} mm', en: 'stretch {x} mm' },
  /** 배율 안내. 부풀린 그림을 숨기면 그림이 거짓이 된다. */
  'label.scaleNote': {
    ko: '늘어난 길이는 약 {k}배로 키워 그림 · 선 지름 {d} mm · 눈금 {c} cm 마다',
    en: 'Stretch drawn about {k}× larger · wire diameter {d} mm · a mark every {c} cm',
  },
  'caption.main': {
    ko: '같은 추를 걸면 강철선의 눈금은 선의 길이와 상관없이 같은 높이까지 내려오고, 알루미늄선의 눈금은 그보다 더 내려온다.',
    en: 'With the same weight, the marks on the steel wires drop to the same heights whatever the length, and the marks on the aluminium wire drop further.',
  },
} satisfies Record<string, LocalizedText>);

export type YoungsModulusMessageKey = keyof typeof youngsModulusMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: YoungsModulusMessageKey): LocalizedText => youngsModulusMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: YoungsModulusMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const youngsModulusSchema: BundleSchema = {
  id: YOUNGS_MODULUS_ID,
  label: text('label.title'),
  category: 'mechanics',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다. 받침대가 알아서 오르내리며 주장이 끝난다.
  parameters: [],

  stages: [{ id: 'default', label: text('label.stage'), constants: {} }],
  environments: [],
  views: [{ id: 'default', label: text('label.view'), default: true }],

  /**
   * 원본은 그림 860 × 430 + 캔버스 밖 캡션 한 줄이었다. 캡션이 캔버스 안(화면 고정
   * 줄)으로 들어오고 러너가 사방에 여백을 두므로 그만큼 더 잡는다.
   */
  canvas: { height: 520, minHeight: 460 },

  /** 원본은 `(t + 1.5) mod 8` 로 열었다 — 받침대가 내려가는 중에 도착한다. */
  startAt: OFFSET,

  /**
   * 한 주기 8 s — 내려감 3 → 머묾 2 → 올라옴 2 → 머묾 1. 움직이는 두 단계에만 이징.
   * 캡션은 한 문장으로 고정이라 단계가 말하지 않는다 (슬롯의 `text`).
   */
  timeline: {
    phases: [
      { id: 'lower', duration: LOWER, ease: 'smooth' },
      { id: 'holdLow', duration: HOLD_LOW },
      { id: 'raise', duration: RAISE, ease: 'smooth' },
      { id: 'holdHigh', duration: HOLD_HIGH },
    ],
  },

  // 원본이 그린 순서대로 겹친다 — 천장 · 이름 · 점선 · 옛 눈금 · 선 · 눈금 · 추 · 받침대 · 수치 · 안내.
  drawOrder: 'scene',

  // 슬롯 하나, 고정. 원본의 캔버스 아래 캡션 자리 — 왼쪽, 15px, 먹색.
  caption: {
    anchor: { screen: 'bottom-left' },
    align: 'left',
    fontSize: 15,
    style: { colorRole: 'ink', emphasis: 'strong' },
    text: key('caption.main'),
  },

  // 그리드도 카메라 버튼도 없다 (기본값). 비교는 거리가 아니라 높이가 맞는가로 일어난다.

  messages: youngsModulusMessages,
};
