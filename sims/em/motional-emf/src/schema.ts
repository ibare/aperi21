// ========================================================================
// motional-emf — 선언
// ========================================================================
// 질문: 자기장 속에서 도선을 움직이기만 해도 왜 도선 양 끝에 전압이 생기는가.
//
// 종이 안으로 들어가는 균일한 자기장(⊗) 속, 레일 위에 도체 막대가 놓여 있다.
// 막대가 오른쪽으로 미끄러지면 막대 속 전자가 막대와 함께 자기장을 가로지르므로
// 막대를 따라 아래로 밀린다. 전자가 아래 끝에 몰리고 위 끝에는 전자를 잃은 이온(+)이
// 드러난다 — 양 끝이 + 와 − 로 갈라진 것이 전압이다. 멈추면 밀림도 사라져 전자가
// 제자리로 돌아간다. 두 배 빠르게 밀면 밀림이 두 배라 갈라진 전하도 두 배다.
//
// 회로를 닫아 전류가 흐르는 것 · 제동은 이웃 `lenzs-law` · `eddy-current` 의 몫이다.
// 레일 왼쪽 끝은 열어 둔다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:motional-emf` 와 문자 그대로 일치한다 (C4). */
export const MOTIONAL_EMF_ID = 'motional-emf';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 느린 판의 막대 속력(월드 단위/초). */
export const V_SLOW = 1.25;
/** 빠른 판 속력 ÷ 느린 판 속력. 화면의 `2v` · `2ε` 이름표와 캡션이 이 값을 그대로 쓴다. */
export const SPEED_RATIO = 2;
/** 막대가 레일 위를 미끄러지는 거리(월드). 두 판이 같다. */
export const TRAVEL = 4;
/**
 * 느린 판에서 아래 끝으로 몰리는 전자 수. 몰리는 전하는 막대 속 전기장 = vB 에
 * 비례하므로 빠른 판에서는 속력 비만큼 늘어난다 (physics `pileOf`).
 */
export const PILE_SLOW = 2;
/** 막대를 따라 늘어선 이온 · 전자 짝의 수(줄 수). */
export const ION_ROWS = 8;

// ------------------------------------------------------------------------
// 표시 배율 — 이것도 선언이다 (원칙 2).
// ------------------------------------------------------------------------

/** 속력(월드/초) → 움직임 화살표 길이(월드). */
export const ARROW_SCALE = 0.5;
/** 속력(월드/초) → 전자를 미는 힘 화살표 길이(월드). 힘 qvB 는 속력에 비례한다. */
export const FORCE_SCALE = 0.2;

// ------------------------------------------------------------------------
// 배치 — 월드 단위
// ------------------------------------------------------------------------

/** 레일 높이(위 · 아래 = ±). 막대 길이 L 은 레일 사이다. */
export const RAIL_Y = 1;
/** 레일 가로 범위. */
export const RAIL_X0 = -3.8;
export const RAIL_X1 = 3.8;
/** 막대 폭 · 반길이(레일 밖으로 조금 나온다). */
export const ROD_W = 0.4;
export const ROD_HALF = 1.22;
/** 이온 줄의 아래 · 위 끝 높이. */
export const ION_Y0 = -0.84;
export const ION_Y1 = 0.84;
/** 몰린 전자가 앉는 첫 줄 높이(가장 아래 이온 밑). */
export const PILE_Y = -1.0;

/** 자기장 ⊗ 무늬 — 가로 · 세로 범위와 간격. */
export const FIELD_X0 = -3.75;
export const FIELD_X1 = 3.75;
export const FIELD_Y0 = -1.25;
export const FIELD_Y1 = 1.25;
export const FIELD_STEP = 0.5;

/**
 * 프레이밍 — 자기장 무늬 양 끝과 `B` 이름표, 세로는 막대 끝의 + · − 표식과 그 아래
 * 캡션 자리까지. 매 프레임 같은 값이다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: -4.3, maxX: 4.1, minY: -2.05, maxY: 1.75 } as const;

// ------------------------------------------------------------------------
// 시간표 — 미끄러지는 단계의 길이는 물리가 정한다 (거리 ÷ 속력)
// ------------------------------------------------------------------------

/** 막대가 레일 왼쪽에 나타나는 동안(초). */
export const APPEAR = 0.6;
/** 움직이기 시작해 전자가 아래로 몰리는 동안. 막대는 이미 달리고 있다. */
export const BUILD = 0.6;
/** 느린 판 · 빠른 판에서 전자가 다 몰린 뒤 막대가 끝까지 미끄러지는 동안. */
export const SLIDE_SLOW = TRAVEL / V_SLOW - BUILD;
export const SLIDE_FAST = TRAVEL / (V_SLOW * SPEED_RATIO) - BUILD;
/** 멈춘 뒤 전자가 제자리로 돌아가는 동안. */
export const RELAX = 0.6;
/** 다시 고르게 된 막대를 보여 주는 동안. */
export const REST = 0.7;
/** 막대가 사라지는 동안. */
export const VANISH = 0.5;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const motionalEmfMessages = Object.freeze({
  'label.title': { ko: '운동 기전력', en: 'Motional EMF' },
  'label.operation': { ko: '도선이 움직여 생기는 전압', en: 'The voltage made by a moving wire' },
  'label.stage': { ko: '레일 위 막대', en: 'Rod on rails' },
  'label.view': { ko: '위에서', en: 'From above' },
  /** 기호 · 표식이라 번역 대상이 아니다 (C1 판정 1 · 3). */
  'label.field': { ko: 'B', en: 'B' },
  'label.electron': { ko: 'e⁻', en: 'e⁻' },
  'label.plus': { ko: '+', en: '+' },
  'label.minus': { ko: '−', en: '−' },
  'label.speed': { ko: 'v', en: 'v' },
  'label.speedTimes': { ko: '{k}v', en: '{k}v' },
  'label.force': { ko: 'F', en: 'F' },
  'label.forceTimes': { ko: '{k}F', en: '{k}F' },
  'label.emf': { ko: 'ε', en: 'ε' },
  'label.emfTimes': { ko: '{k}ε', en: '{k}ε' },
  'caption.setup': {
    ko: '자기장 속 레일 위에 도체 막대가 놓여 있다 — 전자와 이온이 고르게 섞여 있다',
    en: 'A metal rod rests on rails in a magnetic field — electrons and ions are evenly mixed',
  },
  'caption.build': {
    ko: '막대가 움직이자 그 속의 전자가 아래로 밀린다',
    en: 'As the rod moves, the electrons inside it are pushed down',
  },
  'caption.slide': {
    ko: '위 끝은 +, 아래 끝은 − — 움직이는 동안 막대 양 끝에 전압이 걸려 있다',
    en: 'Top end +, bottom end − — while it moves, there is a voltage across the rod',
  },
  'caption.relax': {
    ko: '막대가 멈추자 밀림이 사라져 전자가 제자리로 돌아간다 — 전압도 없다',
    en: 'The rod stops, the push is gone and the electrons spread back — no voltage',
  },
  'caption.again': {
    ko: '같은 막대를 처음 자리로 되돌렸다 — 전자와 이온이 다시 고르게 섞여 있다',
    en: 'The same rod is back at the start — electrons and ions evenly mixed again',
  },
  'caption.buildFast': {
    ko: '{k}배 빠르니 전자를 미는 힘도 {k}배다',
    en: '{k} times the speed, {k} times the push on each electron',
  },
  'caption.slideFast': {
    ko: '양 끝에 갈라진 전하가 {k}배 — 전압도 {k}배다',
    en: '{k} times as much charge at the ends — {k} times the voltage',
  },
} satisfies Record<string, LocalizedText>);

export type MotionalEmfMessageKey = keyof typeof motionalEmfMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: MotionalEmfMessageKey): LocalizedText => motionalEmfMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: MotionalEmfMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const motionalEmfSchema: BundleSchema = {
  id: MOTIONAL_EMF_ID,
  label: text('label.title'),
  category: 'em',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 막대가 달리고, 멈추고, 두 배 빠르게 다시 달린다.
  parameters: [],

  stages: [
    {
      id: 'rails',
      label: text('label.stage'),
      constants: {
        vSlow: V_SLOW,
        speedRatio: SPEED_RATIO,
        travel: TRAVEL,
        pileSlow: PILE_SLOW,
        ionRows: ION_ROWS,
        arrowScale: ARROW_SCALE,
        forceScale: FORCE_SCALE,
      },
    },
  ],

  environments: [],
  views: [{ id: 'top', label: text('label.view'), default: true }],

  /** 가로로 넓고 세로로 좁다 — 레일 한 쌍과 막대 하나가 전부다. */
  canvas: { height: 300, minHeight: 280 },

  /**
   * 겹침이 판정 장치다 — 막대가 자기장 무늬와 레일 **위**를 지나고, 이온 · 전자가 막대
   * **안**에 보여야 한다. 층 순서로는 막대(body)가 이온 획(lineSet) · 전자
   * (particleSystem)와 어느 쪽이 위인지 고를 수 없다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 느린 판 · 빠른 판. 판마다
   * 나타남 → 몰림(달리기 시작) → 미끄러짐 → 풀림(멈춤) → 고름 → 사라짐.
   *
   * 몰림 + 미끄러짐의 길이는 거리 ÷ 속력이다 — 막대가 레일 끝에 닿는 순간 풀림이
   * 시작돼 「멈췄다」 캡션이 화면과 어긋나지 않는다 (장부 G13 — 스테이지 상수를 따라가지 않는다).
   */
  timeline: {
    phases: [
      { id: 'slow-in', duration: APPEAR, caption: key('caption.setup') },
      { id: 'slow-build', duration: BUILD, ease: 'smooth', caption: key('caption.build') },
      { id: 'slow-slide', duration: SLIDE_SLOW, caption: key('caption.slide') },
      { id: 'slow-relax', duration: RELAX, ease: 'smooth', caption: key('caption.relax') },
      { id: 'slow-rest', duration: REST, caption: key('caption.relax') },
      { id: 'slow-out', duration: VANISH, caption: key('caption.relax') },
      { id: 'fast-in', duration: APPEAR, caption: key('caption.again') },
      { id: 'fast-build', duration: BUILD, ease: 'smooth', caption: key('caption.buildFast') },
      { id: 'fast-slide', duration: SLIDE_FAST, caption: key('caption.slideFast') },
      { id: 'fast-relax', duration: RELAX, ease: 'smooth', caption: key('caption.relax') },
      { id: 'fast-rest', duration: REST, caption: key('caption.relax') },
      { id: 'fast-out', duration: VANISH, caption: key('caption.relax') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — 느린 판의 막대가 전하를 가른 채 달리고 있다. */
  startAt: 2.0,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 법칙과 식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 720,
    fade: 0.25,
    style: { colorRole: 'muted', emphasis: 'strong' },
    /** 배수는 스테이지 상수에서 온다 — state 가 한 번 글자로 옮겨 둔다 (장부 G133). */
    vars: { k: 'speedRatio' },
  },

  messages: motionalEmfMessages,
};
