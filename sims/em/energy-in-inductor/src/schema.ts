// ========================================================================
// energy-in-inductor — 선언
// ========================================================================
// 질문: 코일에 전류를 흘려 놓으면 에너지는 어디에, 얼마나 쌓이는가.
//
// 전류를 0 에서 I 까지 키우는 동안 코일은 역기전력(ε)으로 버틴다. 그것을 거슬러 한
// 일이 자기장에 쌓인다 — 전류가 커질수록 자기력선이 늘고, LI–I 직선 아래 삼각형이
// 차오른다. 전류가 일정하면 역기전력은 없고 에너지는 삼각형 넓이 그대로 남는다.
// 전류를 줄이면 자기장이 사그라들며 코일이 전류를 앞으로 밀어 에너지가 돌아 나온다.
//
// 이웃과 겹치지 않는 자리 — `self-inductance` 는 끊는 순간 치솟는 전압(불꽃),
// `rl-circuit` 은 전류가 차오르는 시간 곡선, `energy-in-capacitor` 는 몫마다의 일 띠와
// 직사각형과의 비교다. 이 조각은 **전류와 함께 쌓였다가 돌아 나오는 자기장의 에너지**만
// 말한다. 스위치 · 전지 · 시간축 · 불꽃을 두지 않는다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:energy-in-inductor` 와 문자 그대로 일치한다 (C4). */
export const ENERGY_IN_INDUCTOR_ID = 'energy-in-inductor';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 화면에 뜨는 수는 계산값이 아니라 여기 선언한 정박값이다 (S-piece 유효숫자).
// ------------------------------------------------------------------------

/** 인덕턴스(H). 코일 아래에 `{l} H` 로 뜬다. */
export const INDUCTANCE = 0.5;
/** 키워 올린 끝 전류(A). 그래프 가로축 끝에 `{i} A` 로 뜬다. */
export const FINAL_CURRENT = 2;
/** 끝 전류에서 코일 축 위 · 아래로 각각 보이는 자기력선 수. 선 수는 전류에 비례한다. */
export const FIELD_LINES = 4;
/** 표시 배율 — 전류 화살표 길이(월드 단위) ÷ 전류(A). */
export const CURRENT_ARROW_PER_AMP = 0.5;
/** 표시 배율 — 역기전력 화살표 길이(월드 단위) ÷ 역기전력(V). */
export const EMF_ARROW_PER_VOLT = 5;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이(초)
// ------------------------------------------------------------------------

/** 전류를 0 에서 끝 전류까지 고르게 키우는 동안. 역기전력은 L × (끝 전류 ÷ 이 길이). */
export const RISE = 5;
/** 끝 전류 그대로 쌓인 에너지를 읽는 동안. */
export const HOLD = 3;
/** 전류를 끝 전류에서 0 까지 고르게 줄이는 동안. */
export const RELEASE = 4;
/** 빈 코일을 읽는 동안. */
export const EMPTY = 1.5;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const energyInInductorMessages = Object.freeze({
  'label.title': { ko: '인덕터의 에너지', en: 'Energy in an inductor' },
  'label.operation': { ko: '자기장에 저장된 에너지', en: 'Energy stored in the magnetic field' },
  'label.stage': { ko: '전류를 키웠다 줄이기', en: 'Raising and lowering the current' },
  'label.view': { ko: '코일과 LI–I 그래프', en: 'Coil and LI–I graph' },
  /** 값이 끼는 조립이라 문안이다 (C1). 값은 스테이지 상수 그대로. */
  'label.inductance': { ko: '{l} H', en: '{l} H' },
  'label.current': { ko: '{i} A', en: '{i} A' },
  /** 축 이름 · 기호. 수식 표기라 표식이다 (C1 판정 3). */
  'label.axisI': { ko: 'I', en: 'I' },
  'label.axisLI': { ko: 'LI', en: 'LI' },
  'label.currentArrow': { ko: 'I', en: 'I' },
  'label.emf': { ko: 'ε', en: 'ε' },
  'label.energy': { ko: '½LI²', en: '½LI²' },
  'caption.rise': {
    ko: '전류를 키우는 동안 코일은 역기전력(ε)으로 버틴다 — 그것을 거슬러 한 일만큼 자기력선이 늘고 직선 아래 넓이가 차오른다',
    en: 'While the current is raised the coil pushes back (ε) — the work done against it adds field lines and fills the area under the line',
  },
  'caption.hold': {
    ko: '전류가 멈춰 ε 화살표가 사라졌다 — 자기력선과 다 찬 삼각형이 그대로 남아 있다',
    en: 'The current holds and the ε arrow is gone — the field lines and the full triangle stay',
  },
  'caption.release': {
    ko: '전류를 줄이면 자기장이 사그라들며 코일이 전류를 앞으로 민다 — 쌓였던 에너지가 회로로 돌아 나온다',
    en: 'As the current is lowered the field collapses and the coil pushes the current onward — the stored energy flows back out',
  },
  'caption.empty': {
    ko: '전류가 0 이 되자 자기력선도, 쌓인 에너지도 남지 않는다',
    en: 'At zero current neither field lines nor stored energy remain',
  },
} satisfies Record<string, LocalizedText>);

export type EnergyInInductorMessageKey = keyof typeof energyInInductorMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: EnergyInInductorMessageKey): LocalizedText => energyInInductorMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: EnergyInInductorMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const energyInInductorSchema: BundleSchema = {
  id: ENERGY_IN_INDUCTOR_ID,
  label: text('label.title'),
  category: 'em',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 키우고, 머물고, 줄이는 한 주기로 할 말을 마친다.
  parameters: [],

  stages: [
    {
      id: 'raise-and-lower',
      label: text('label.stage'),
      constants: {
        inductance: INDUCTANCE,
        finalCurrent: FINAL_CURRENT,
        fieldLines: FIELD_LINES,
        currentArrowPerAmp: CURRENT_ARROW_PER_AMP,
        emfArrowPerVolt: EMF_ARROW_PER_VOLT,
      },
    },
  ],

  environments: [],

  views: [{ id: 'coil-graph', label: text('label.view'), default: true }],

  /** 가로로 넓다 — 코일과 그래프가 옆으로 놓인다. */
  canvas: { height: 360, minHeight: 320 },

  /**
   * 겹침은 scene 에 쓴 순서다 — 고리 뒤 반쪽 → 코일 속 에너지 칠 → 자기력선 → 고리 앞 반쪽
   * 차례라야 선이 코일 속을 꿴다. 그래프에서는 삼각형(region)이 LI–I 직선 **아래** 로 깔린다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 전류를 고르게 키움 → 끝 전류로 머묾 → 고르게 줄임 → 빈 코일.
   * 키우고 줄이는 단계는 `linear` 이라 전류의 변화율, 곧 역기전력이 단계 안에서 일정하다.
   */
  timeline: {
    phases: [
      { id: 'rise', duration: RISE, caption: key('caption.rise') },
      { id: 'hold', duration: HOLD, caption: key('caption.hold') },
      { id: 'release', duration: RELEASE, caption: key('caption.release') },
      { id: 'empty', duration: EMPTY, caption: key('caption.empty') },
    ],
  },

  /** 도착한 순간 전류가 절반쯤 올라와 있다 — 자기력선 몇 가닥과 작은 삼각형이 이미 있다. */
  startAt: 2.2,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 식과 정의는 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  messages: energyInInductorMessages,
};
