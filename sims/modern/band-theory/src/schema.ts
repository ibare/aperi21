// ========================================================================
// band-theory — 선언
// ========================================================================
// 질문: 같은 원자들이 모인 고체인데 왜 어떤 것은 전기가 잘 통하고(도체), 어떤 것은
// 전혀 통하지 않고(부도체), 어떤 것은 그 사이(반도체)인가?
//
// 답: **띠 사이의 간격(띠틈)** 이 가른다. 원자가 모이면 준위가 띠로 퍼진다. 도체는
// 띠가 반쯤 차 있어 전자 바로 위에 빈 자리가 있고, 전압만 걸면 흐른다. 부도체와
// 반도체는 띠가 꽉 차 있어 그대로는 흐르지 못하고, 위 띠로 올라가야 흐른다 — 그
// 틈이 부도체는 크고(수 eV) 반도체는 작다(실리콘 1.1 eV).
//
// 화면에서는 세 띠 그림이 나란히 서서 같은 전압, 같은 빛을 받는다. 같은 빛 화살표가
// 반도체에서는 틈을 넘고 부도체에서는 틈 한가운데서 끝난다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:band-theory` 와 문자 그대로 일치한다 (C4). */
export const BAND_THEORY_ID = 'band-theory';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 띠 하나의 폭(eV). 세 물질 모두 같은 폭으로 둔다 — 가르는 것이 틈 하나라는 것을 보이려고. */
export const BAND_WIDTH_EV = 2;
/** 부도체의 띠틈(eV). 다이아몬드 5.5 eV. 「수 eV」 의 대표값. */
export const INSULATOR_GAP_EV = 5.5;
/** 반도체의 띠틈(eV). 실리콘 1.1 eV. */
export const SEMICONDUCTOR_GAP_EV = 1.1;
/** 도체 띠가 차 있는 몫. 반쯤 찬 띠(나트륨의 3s 띠처럼). */
export const METAL_FILL = 0.5;
/**
 * 빛 알갱이 하나가 전자에게 주는 에너지(eV). 붉은 빛(약 650 nm). 반도체 틈보다 크고
 * 부도체 틈보다 작다 — 두 틈 사이에 오는 값이면 된다.
 */
export const PHOTON_EV = 1.9;
/**
 * 빛을 받는 전자 수(부도체 · 반도체 각각). 받는 자리는 맨 위 준위의 짝수 칸(0 · 2 · 4 …)이다.
 * 시간표에 `rise-i` · `settle-i` 단계가 이 수만큼 있어야 한다 — 없는 단계를 부르면 엔진이 던진다.
 */
export const PHOTON_COUNT = 3;
/**
 * 양공이 한 칸씩 옮겨 가는 횟수. 시간표에 `hopRest-k` · `hop-k` 단계가 이 수만큼 있어야 한다.
 * 맨 오른쪽 칸을 넘지 않아야 한다 —
 * `2 × (PHOTON_COUNT − 1) + HOP_COUNT ≤ SLOTS_PER_LEVEL − 1`.
 */
export const HOP_COUNT = 2;
/**
 * 흐르는 전자의 화면 속력(월드/초). 실제 표류 속도(mm/s)를 보이게 키운 **표현값**이다 —
 * 세 물질에 같은 값을 써서 「흐른다 · 안 흐른다」 만 가른다. 화면에 알리지 않는다 (NOTES b).
 */
export const DRIFT_SPEED = 0.3;

// ------------------------------------------------------------------------
// 배치 — 월드 세로 1 단위 = 1 / EV_TO_WORLD eV. 가로는 결정 속 자리(흐르는 방향)다.
// ------------------------------------------------------------------------

/** 에너지 1 eV 의 월드 높이. */
export const EV_TO_WORLD = 0.34;
/** 세 띠 그림의 가운데 x — 도체 · 부도체 · 반도체 순. 빛을 받는 둘을 옆에 붙인다. */
export const COLUMN_X = { metal: -2.9, insulator: 0, semiconductor: 2.9 } as const;
/** 띠 반너비(월드). */
export const BAND_HALF_W = 0.95;
/** 아래 띠의 바닥(월드 y). 세 그림이 같은 바닥에 선다. */
export const BAND_BASE_Y = 0;
/** 띠 하나에 긋는 준위 수. 띠 폭 2 eV 를 6 줄로 — 준위 간격 자체는 표현이다. */
export const LEVELS_PER_BAND = 6;
/** 준위 하나에 앉는 전자 자리 수. */
export const SLOTS_PER_LEVEL = 7;

/**
 * 프레이밍 — 왼쪽 도체, 가운데 부도체(가장 높다), 오른쪽 반도체와 틈 이름표.
 * 매 프레임 같은 값이다 (S-piece — 프레이밍은 주장의 일부다).
 */
export const SCENE_BOUNDS = { minX: -4.0, maxX: 4.3, minY: -0.5, maxY: 3.62 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const bandTheoryMessages = Object.freeze({
  'label.title': { ko: '띠 이론', en: 'Band theory' },
  'label.stage': { ko: '세 고체', en: 'Three solids' },
  'label.view': { ko: '띠 그림', en: 'Band diagrams' },

  /** 띠 그림 이름. 세 그림을 가르는 것은 색이 아니라 이 이름과 틈의 높이다. */
  'label.metal': { ko: '도체', en: 'Conductor' },
  'label.insulator': { ko: '부도체', en: 'Insulator' },
  'label.semiconductor': { ko: '반도체', en: 'Semiconductor' },
  /** 띠틈 · 빛 에너지. 값은 스테이지 상수, 단위는 표식이다 (C1 판정 3). */
  'label.energy': { ko: '{e} eV', en: '{e} eV' },
  /** 전기장 · 전자 · 양공 기호. 표식이라 번역 대상이 아니다 (C1 판정 3). */
  'label.field': { ko: 'E', en: 'E' },
  'label.electron': { ko: 'e⁻', en: 'e⁻' },
  'label.hole': { ko: 'h⁺', en: 'h⁺' },

  'caption.spread': {
    ko: '원자가 모이면 저마다의 준위가 수많은 준위로 갈라져 띠가 된다. 띠와 띠 사이는 전자가 있을 수 없는 틈이다.',
    en: 'As atoms come together, each level splits into many and spreads into a band. Between bands is a gap where no electron can be.',
  },
  'caption.field': {
    ko: '같은 전기장을 걸면 도체의 전자만 흐른다 — 바로 위에 빈 자리가 있다. 꽉 찬 띠의 전자는 옮겨 갈 자리가 없다.',
    en: 'Under the same field only the conductor’s electrons flow — there are empty states right above them. In a full band there is nowhere to move.',
  },
  'caption.light': {
    ko: '같은 빛을 받아도 반도체의 전자는 좁은 틈을 넘어 위 띠로 올라가고, 부도체의 전자는 넓은 틈을 넘지 못해 제자리다.',
    en: 'With the same light, electrons in the semiconductor jump the narrow gap into the upper band; in the insulator the gap is too wide and they stay put.',
  },
  'caption.flow': {
    ko: '틈을 넘은 전자와 그것이 비운 자리(양공)가 서로 반대로 흐른다. 부도체는 여전히 멈춰 있다.',
    en: 'The electrons that crossed and the holes they left flow in opposite directions. The insulator is still frozen.',
  },
} satisfies Record<string, LocalizedText>);

export type BandTheoryMessageKey = keyof typeof bandTheoryMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: BandTheoryMessageKey): LocalizedText => bandTheoryMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: BandTheoryMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const bandTheorySchema: BundleSchema = {
  id: BAND_THEORY_ID,
  title: text('label.title'),
  category: 'modern',
  timeModel: 'periodic',
  parameters: [],
  stages: [
    {
      id: 'three-solids',
      label: text('label.stage'),
      constants: {
        bandWidthEv: BAND_WIDTH_EV,
        insulatorGapEv: INSULATOR_GAP_EV,
        semiconductorGapEv: SEMICONDUCTOR_GAP_EV,
        metalFill: METAL_FILL,
        photonEv: PHOTON_EV,
        photonCount: PHOTON_COUNT,
        hopCount: HOP_COUNT,
        driftSpeed: DRIFT_SPEED,
      },
    },
  ],
  environments: [],
  views: [{ id: 'bands', label: text('label.view'), default: true }],

  /**
   * 가로로 넓다 — 세 띠 그림이 나란히. 세로는 부도체의 높은 위 띠가 정한다.
   */
  canvas: { height: 440, minHeight: 380 },

  /**
   * 쓴 순서대로 겹친다 — 띠 · 준위 · 틈 · 전자 · 양공 · 화살표 · 이름표.
   * 빛 화살표가 전자 위에, 양공 고리가 준위 선 위에 와야 한다.
   */
  drawOrder: 'scene',

  /** 도착한 순간 이미 준위가 띠로 퍼지는 중이다 (S-piece). */
  startAt: 1.1,

  /**
   * 한 주기 13 초. 단계의 길이 · 이징이 곧 연출이라 모두 여기 둔다 (S-piece · 원칙 2).
   *
   * - `spread` — 준위 한 줄이 여러 줄로 갈라져 띠가 된다.
   * - `fieldIn` — 세 그림 위에 같은 전기장 화살표가 나타난다. 도체의 맨 위 전자 줄이 흐르기 시작한다.
   * - `field` — 도체만 흐르고 꽉 찬 띠는 멈춰 있다.
   * - `rise-i` · `settle-i` — 빛 알갱이 i 가 닿는다. 화살표가 자라며 전자가 끝까지 오르고(`rise`),
   *   넘어간 전자가 위 띠 바닥으로 내려앉는다(`settle`). 알갱이 수(`photonCount`)만큼 짝이 있어야 한다.
   * - `lightHold` — 세 화살표가 다 선 채로 두 그림을 견주는 틈.
   * - `flowIn` — 빛 화살표가 물러난다. 넘어간 전자가 흐르기 시작한다.
   * - `hopRest-k` · `hop-k` — 양공이 한 칸 건너기 전에 멈췄다가(`hopRest`) 건너간다(`hop`).
   *   건너기 횟수(`hopCount`)만큼 짝이 있어야 한다.
   * - `fade` — 옅어지며 다음 주기로 잇는다.
   */
  timeline: {
    phases: [
      { id: 'spread', duration: 2.4, ease: 'smooth', caption: key('caption.spread') },
      { id: 'fieldIn', duration: 0.4, caption: key('caption.field') },
      { id: 'field', duration: 2.6, caption: key('caption.field') },
      { id: 'rise-0', duration: 0.55, ease: 'smooth', caption: key('caption.light') },
      { id: 'settle-0', duration: 0.45, ease: 'smooth', caption: key('caption.light') },
      { id: 'rise-1', duration: 0.55, ease: 'smooth', caption: key('caption.light') },
      { id: 'settle-1', duration: 0.45, ease: 'smooth', caption: key('caption.light') },
      { id: 'rise-2', duration: 0.55, ease: 'smooth', caption: key('caption.light') },
      { id: 'settle-2', duration: 0.45, ease: 'smooth', caption: key('caption.light') },
      { id: 'lightHold', duration: 0.6, caption: key('caption.light') },
      { id: 'flowIn', duration: 0.4, caption: key('caption.flow') },
      { id: 'hopRest-0', duration: 0.2, caption: key('caption.flow') },
      { id: 'hop-0', duration: 1.1, ease: 'smooth', caption: key('caption.flow') },
      { id: 'hopRest-1', duration: 0.6, caption: key('caption.flow') },
      { id: 'hop-1', duration: 1.1, ease: 'smooth', caption: key('caption.flow') },
      { id: 'fade', duration: 0.6, caption: key('caption.flow') },
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

  // 그리드 · 카메라 단추 · 제목 · 범례 없음(기본). 세로축은 에너지지만 재는 것은 틈의
  // 높이 하나이고 그것은 치수선과 값이 말한다. 눈금은 오독의 경로가 된다 (S-piece).

  messages: bandTheoryMessages,
};
