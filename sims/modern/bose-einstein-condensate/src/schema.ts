// ========================================================================
// bose-einstein-condensate — 선언
// ========================================================================
// 질문: 원자 기체를 식히면 원자들이 느려진다. 끝까지 식히면 그저 「더 느려진」
// 기체가 되는가?
//
// 보손 원자는 아니다. 임계 온도 Tc 위에서는 식힐수록 둥근 언덕(속도 분포)이 매끄럽게
// 좁아질 뿐이지만, Tc 아래로 내려가면 많은 원자가 **가장 낮은 한 상태**로 몰린다 —
// 덫 속 구름 한가운데에 원자들이 한 점으로 무너지고, 속도 분포 한가운데에 뾰족한
// 봉우리가 선다(1995 년 루비듐 실험의 세 봉우리 그림).
//
// 준위를 아래부터 채우는 그림(파울리 배타 원리)은 이웃 조각 `pauli-exclusion` 의 몫이다.
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:bose-einstein-condensate` 와 문자 그대로 일치한다 (C4). */
export const BOSE_EINSTEIN_CONDENSATE_ID = 'bose-einstein-condensate';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 온도는 임계 온도 Tc 를 1 로 둔 상대 단위다.
// ------------------------------------------------------------------------

/** 식히기 시작하는 온도(Tc 배). 응축이 없는 뜨거운 기체다. */
export const T_HIGH = 2;
/** 첫 멈춤 — Tc 바로 아래. 원자의 일부만 바닥 상태로 몰린 두 겹 분포(언덕 + 봉우리)다. */
export const T_MID = 0.8;
/** 마지막 멈춤 — 거의 모든 원자가 바닥 상태에 있다. */
export const T_LOW = 0.3;
/**
 * 바닥 상태 몫의 거듭제곱 — 조화 덫 속 이상 보스 기체의 N₀/N = 1 − (T/Tc)^n, n = 3.
 * Tc 위에서는 0 이다.
 */
export const CONDENSATE_EXPONENT = 3;
/** 그리는 원자 수. 실제 실험은 수천 개이지만 점 밀도가 읽히는 만큼만 둔다. */
export const ATOM_COUNT = 600;
/** Tc 에서 열운동 구름의 폭(월드, 표준편차). 폭은 √T 에 비례한다. */
export const THERMAL_WIDTH_AT_TC = 0.6;
/**
 * 바닥 상태의 폭(월드, 표준편차). 온도와 무관하다 — 덫의 가장 낮은 상태의 크기다.
 * 실제로는 열 구름보다 훨씬 작지만, 봉우리 옆 열 언덕이 판에서 보일 만큼 키웠다
 * (NOTES (b)).
 */
export const GROUND_WIDTH = 0.12;
/**
 * 원자 하나가 바닥 상태로 건너가는 몫의 너비(바닥 상태 몫 단위). 원자마다 건너가는
 * 문턱이 다르므로 단계로 풀 수 없어 상수로 둔다 — 0 이면 원자가 순간 이동한다.
 */
export const JOIN_SPREAD = 0.08;
/** 덫 속 진동의 각진동수(rad/s, 화면 시간) — 가로 · 세로. 덫이 조금 찌그러져 있어 둘이 다르다. */
export const TRAP_OMEGA_X = 0.9;
export const TRAP_OMEGA_Y = 1.17;
/** 원자 흩뿌림의 시드. 같은 시드는 언제나 같은 구름이다 (S-sim). */
export const SEED = 1995;

// ------------------------------------------------------------------------
// 배치 — 월드 단위.
// ------------------------------------------------------------------------

/** 덫 속 원자 구름의 가운데. */
export const CLOUD_CENTER = [-3.6, 0.3] as const;
/** 속도 분포 판 — 가로축의 가운데(v = 0) · 바닥 높이 · 반폭. 가로 배율은 구름과 같다. */
export const PROFILE_CENTER_X = 4.3;
export const PROFILE_BASE_Y = -2.1;
export const PROFILE_HALF_WIDTH = 3.3;
/** 가장 높은 봉우리(T_LOW)의 높이(월드). 세로 배율은 이 값에 맞춰 한 번 정한다 — 매 프레임 같다. */
export const PROFILE_PEAK_HEIGHT = 4.5;
/** 온도계 — 가로 자리 · 바닥 · 꼭대기(T_HIGH 가 닿는 높이) · 반폭. */
export const THERMO_X = -8.1;
export const THERMO_BOTTOM = -2.1;
export const THERMO_TOP = 2.4;
export const THERMO_HALF_WIDTH = 0.16;

/**
 * 프레이밍은 주장의 일부다. 가로는 온도계 이름표(왼쪽)부터 속도축 이름(오른쪽)까지,
 * 세로는 판 이름표와 캡션 한 줄(아래)부터 가장 높은 봉우리 이름표(위)까지. 캡션 슬롯은
 * 프레이밍 여백으로 잡히지 않아 아래 자리를 미리 잡는다 (장부 G24). 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -9.3, maxX: 8.4, minY: -3.75, maxY: 3.2 } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이. 경계는 선언이 정하고 physics 는 `at()` 으로 묻는다.
// ------------------------------------------------------------------------

/** 새 주기의 구름이 나타나는 동안(초). */
export const APPEAR = 0.5;
/** 뜨거운 기체를 보는 동안(초). */
export const HOT = 1.2;
/** T_HIGH → Tc 로 식히는 동안(초). 언덕이 좁아지기만 한다. */
export const COOL_TO_TC = 3.2;
/** Tc → T_MID 로 식히는 동안(초). 봉우리가 서기 시작한다. */
export const COOL_BELOW = 2.4;
/** 두 겹 분포(언덕 + 봉우리)를 보는 동안(초). */
export const HOLD_MID = 1.4;
/** T_MID → T_LOW 로 더 식히는 동안(초). */
export const COOL_DEEP = 2.4;
/** 다 식힌 그림을 읽는 동안 · 다음 주기로 넘어가며 흐려지는 동안(초). */
export const HOLD = 2.6;
export const FADE = 0.6;
/** 도착한 순간 이미 식고 있도록 시계를 앞당기는 양(초). */
export const START_AT = 2.0;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const boseEinsteinCondensateMessages = Object.freeze({
  'label.title': { ko: '보스-아인슈타인 응축', en: 'Bose–Einstein condensation' },
  'label.stage': { ko: '루비듐 원자 기체', en: 'A gas of rubidium atoms' },
  'label.view': { ko: '덫 속 원자와 속도 분포', en: 'Trapped atoms and their velocity distribution' },
  /** 판 이름. */
  'label.cloud': { ko: '덫 속 원자', en: 'atoms in the trap' },
  'label.profile': { ko: '속도 분포', en: 'velocity distribution' },
  'label.thermo': { ko: '온도', en: 'temperature' },
  /** 임계 온도 눈금. 기호라 표식이지만 저작자가 바꿀 수 있게 문안 키로 둔다. */
  'label.tc': { ko: 'Tc', en: 'Tc' },
  /** 속도축 · 그 가운데. 기호와 수는 표식이다 (C1 판정 3). */
  'label.v': { ko: 'v', en: 'v' },
  'label.zero': { ko: '0', en: '0' },
  /** 봉우리 이름. 봉우리가 서는 동안 나타난다. */
  'label.peak': { ko: '가장 낮은 한 상태', en: 'the single lowest state' },
  'caption.hot': {
    ko: '뜨거운 원자 기체 — 속도가 제각각이라 덫 속에 넓게 퍼져 있다',
    en: 'A hot gas of atoms — their speeds vary widely, so they spread across the trap',
  },
  'caption.coolToTc': {
    ko: '식히면 구름이 줄어들고 속도 분포도 좁아진다 — 아직 둥근 언덕 하나다',
    en: 'Cooling shrinks the cloud and narrows the distribution — still one rounded hill',
  },
  'caption.below': {
    ko: '임계 온도 아래 — 원자들이 가장 낮은 한 상태로 몰려 한가운데에 봉우리가 선다',
    en: 'Below the critical temperature, atoms crowd into the single lowest state and a spike rises in the middle',
  },
  'caption.deep': {
    ko: '더 식히면 언덕은 사라져 가고, 원자들은 거의 모두 봉우리로 들어간다',
    en: 'Cooling further, the hill fades away and nearly every atom joins the spike',
  },
  'caption.hold': {
    ko: '원자 대부분이 한 상태에 있다 — 구름은 한 점으로 무너졌다',
    en: 'Most atoms now share one state — the cloud has collapsed to a point',
  },
} satisfies Record<string, LocalizedText>);

export type BoseEinsteinCondensateMessageKey = keyof typeof boseEinsteinCondensateMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: BoseEinsteinCondensateMessageKey): LocalizedText => boseEinsteinCondensateMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: BoseEinsteinCondensateMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const boseEinsteinCondensateSchema: BundleSchema = {
  id: BOSE_EINSTEIN_CONDENSATE_ID,
  title: text('label.title'),
  category: 'modern',
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 식고 있고, 봉우리가 서고, 다시 데워져 처음부터 식는다.
  parameters: [],

  stages: [
    {
      id: 'rubidium',
      label: text('label.stage'),
      constants: {
        tHigh: T_HIGH,
        tMid: T_MID,
        tLow: T_LOW,
        condensateExponent: CONDENSATE_EXPONENT,
        atomCount: ATOM_COUNT,
        thermalWidthAtTc: THERMAL_WIDTH_AT_TC,
        groundWidth: GROUND_WIDTH,
        joinSpread: JOIN_SPREAD,
        trapOmegaX: TRAP_OMEGA_X,
        trapOmegaY: TRAP_OMEGA_Y,
        seed: SEED,
      },
    },
  ],

  environments: [],

  views: [{ id: 'trap-and-velocity', label: text('label.view'), default: true }],

  /** 가로로 넓은 세 판(온도계 · 구름 · 분포)과 캡션 한 줄. */
  canvas: { height: 360, minHeight: 320 },

  /**
   * 한 주기 = 나타남 → 뜨거움 → Tc 까지 식힘 → Tc 아래로 식힘 → 두 겹 분포 → 더 식힘
   * → 읽기 → 흐려짐. 온도는 식힘 단계들의 진행도 합이라 멈춤 단계에서는 저절로 멈춘다.
   */
  timeline: {
    phases: [
      { id: 'appear', duration: APPEAR, caption: key('caption.hot') },
      { id: 'hot', duration: HOT, caption: key('caption.hot') },
      { id: 'cool-to-tc', duration: COOL_TO_TC, ease: 'smooth', caption: key('caption.coolToTc') },
      { id: 'cool-below', duration: COOL_BELOW, ease: 'smooth', caption: key('caption.below') },
      { id: 'hold-mid', duration: HOLD_MID, caption: key('caption.below') },
      { id: 'cool-deep', duration: COOL_DEEP, ease: 'smooth', caption: key('caption.deep') },
      { id: 'hold', duration: HOLD, caption: key('caption.hold') },
      { id: 'fade', duration: FADE, caption: key('caption.hold') },
    ],
  },

  /** 도착한 순간 구름이 이미 줄어들고 있다. */
  startAt: START_AT,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 정의와 공식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    fade: 0.25,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것은 거리가 아니라 「퍼졌는가, 한 점으로
   * 몰렸는가」 이고, 속도 분포의 세로축에도 값이 없다 — 높이의 대비가 전부다.
   */

  messages: boseEinsteinCondensateMessages,
};
