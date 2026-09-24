// ========================================================================
// gravitational-time-dilation — 선언
// ========================================================================
// 질문: 높은 곳의 시계와 낮은 곳의 시계는 같은 빠르기로 가는가?
//
// 아니다. 땅에서 서로 맞춘 똑같은 시계 둘 중 B 만 탑 꼭대기로 올려 두면, 위에 있는
// 동안 B 가 A 보다 빨리 간다 — 중력 퍼텐셜이 낮은 곳(아래)의 시계가 느리다
// (Δτ/τ ≈ gh/c²). 오른쪽 기록 띠에서 B 의 째깍이 A 보다 점점 앞으로 어긋나고,
// B 를 내려 다시 나란히 세우면 B 의 바늘이 A 보다 앞서 있다.
//
// 멀리 떨어진 두 시계를 그 자리에서 견주지 않는다 — 같은 자리에서 맞추고, 같은
// 자리로 데려와 견준다. 그래야 「어긋났다」 가 신호 · 동시성 없이 바늘 둘로 읽힌다.
//
// 속력에 따른 지연(`time-dilation`) · 상자 속 낙하(`equivalence-principle`) ·
// 빛의 진동수가 내려오며 바뀌는 것(`gravitational-redshift`)은 이 조각의 몫이 아니다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:gravitational-time-dilation` 와 문자 그대로 일치한다 (C4). */
export const GRAVITATIONAL_TIME_DILATION_ID = 'gravitational-time-dilation';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 중력 가속도(m/s²). */
export const G_MS2 = 9.8;
/** 탑의 높이(m). 치수선 이름표와 실제 크기 문안에 그대로 쓰인다. */
export const HEIGHT_M = 100;
/** 빛의 속력(m/s). */
export const C_MS = 2.998e8;
/**
 * 빠르기 차이를 부풀리는 배율. 실제 차이 gh/c² ≈ 1.09 × 10⁻¹⁴ 은 눈에 보이지 않아
 * 이만큼 키운다 — 탑 꼭대기의 B 가 A 보다 약 12 % 빨리 간다. 배율은 화면에 수로
 * 띄우지 않고, 부풀렸다는 것과 실제 크기를 문안(`label.real`)으로 알린다.
 */
export const BOOST = 1.1e13;
/** 한 째깍(바늘 한 바퀴)의 제 시간(초). 두 시계가 같다 — 같은 시계다. */
export const TICK_PERIOD = 1;
/**
 * 실제 크기 — 탑 꼭대기 시계가 하루에 앞서는 몫(ns). gh/c² × 86400 초를 계산해 줄이지
 * 않고 선언한다. `heightM` · `gMs2` 와 짝으로 바꾼다 (G143).
 */
export const REAL_NS_PER_DAY = 0.94;

// ------------------------------------------------------------------------
// 배치 — 월드. 왼쪽에 탑과 두 시계, 오른쪽에 째깍 기록 띠.
// ------------------------------------------------------------------------

/** 시계 문자판 반지름(월드). 두 시계가 같다. */
export const CLOCK_RADIUS = 0.3;
/** 땅에 선 시계의 중심 높이. */
export const CLOCK_Y = 0.35;
/** 탑 가운데 x · 반폭 · 꼭대기 높이(월드). B 는 꼭대기 높이만큼 오른다. */
export const TOWER_X = -2.0;
export const TOWER_HALF = 0.16;
export const TOWER_TOP = 2.5;
/** 시계 A(땅에 남는다) · B(탑을 오르내린다)의 x. 탑을 사이에 두고 선다. */
export const CLOCK_A_X = -2.75;
export const CLOCK_B_X = -1.25;
/** 시계 이름표를 문자판 중심 위로 띄우는 거리(월드). */
export const CLOCK_LABEL_RISE = 0.55;
/** 탑 높이 치수선의 x(월드) — A 왼쪽. */
export const HEIGHT_DIM_X = -3.4;

/** 기록 띠가 시작하는 x · 초당 나아가는 거리(월드/초). */
export const STRIP_X0 = 0.35;
export const STRIP_SPEED = 0.9;
/** A 의 기록 줄 높이. 평평하다 — A 는 늘 땅에 있다. */
export const STRIP_A_Y = 0.6;
/** B 의 기록 줄 바탕 높이와, B 가 꼭대기에 있을 때 줄이 올라가는 몫(월드). */
export const STRIP_B_Y = 1.35;
export const STRIP_B_RISE = 0.9;

/**
 * 프레이밍은 주장의 일부다. 가로는 치수선 이름표부터 기록 띠 끝까지, 세로는 탑 꼭대기에
 * 오른 B 의 이름표 위부터 캡션 줄 아래까지. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -3.9, maxX: 6.5, minY: -0.75, maxY: 3.65 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const gravitationalTimeDilationMessages = Object.freeze({
  'label.title': { ko: '중력 시간 지연', en: 'Gravitational time dilation' },
  'label.operation': { ko: '퍼텐셜에 따른 시계의 차이', en: 'Clocks run at different rates at different potentials' },
  'label.stage': { ko: '탑에 다녀온 시계', en: 'A clock taken up a tower' },
  'label.view': { ko: '탑과 기록 띠', en: 'Tower and tick record' },
  /** 시계 이름. 도형에 붙는 표식이라 두 언어가 같다. */
  'label.a': { ko: 'A', en: 'A' },
  'label.b': { ko: 'B', en: 'B' },
  /** 탑 높이. 값은 선언된 높이를 그대로 끼운다. */
  'label.height': { ko: '{h} m', en: '{h} m' },
  /** 째깍 기록 눈금에 붙는 수. 센 횟수라 값만 끼운다. */
  'label.count': { ko: '{n}', en: '{n}' },
  'label.time': { ko: '시간 →', en: 'time →' },
  /** 부풀렸다는 것과 실제 크기. 값은 선언값이다 (S-piece 유효숫자). */
  'label.real': {
    ko: '그림은 차이를 크게 부풀렸다 — 실제로는 {h} m 위의 시계가 하루에 {ns} ns 쯤 앞선다',
    en: 'The difference is hugely exaggerated — in reality a clock {h} m up gains about {ns} ns a day',
  },
  'caption.sync': {
    ko: '똑같은 시계 둘을 땅에서 맞춘다',
    en: 'Two identical clocks are synchronized on the ground',
  },
  'caption.lift': {
    ko: 'B 를 탑 꼭대기로 올린다',
    en: 'Clock B rides up to the top of the tower',
  },
  'caption.up': {
    ko: '위에 있는 B 가 더 빨리 간다 — 째깍 기록이 A 보다 점점 앞으로 어긋난다',
    en: 'Up high, B runs faster — its ticks drift further and further ahead of A’s',
  },
  'caption.lower': {
    ko: 'B 를 다시 땅으로 내린다',
    en: 'B comes back down to the ground',
  },
  'caption.compare': {
    ko: '다시 같은 높이 — 위에 다녀온 B 가 A 보다 앞서 있다',
    en: 'Back at the same height — B, back from the top, is ahead of A',
  },
  'caption.reset': {
    ko: 'B 를 A 에 다시 맞춘다',
    en: 'B is set back to match A',
  },
} satisfies Record<string, LocalizedText>);

export type GravitationalTimeDilationMessageKey = keyof typeof gravitationalTimeDilationMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: GravitationalTimeDilationMessageKey): LocalizedText =>
  gravitationalTimeDilationMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: GravitationalTimeDilationMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const gravitationalTimeDilationSchema: BundleSchema = {
  id: GRAVITATIONAL_TIME_DILATION_ID,
  label: text('label.title'),
  category: 'modern',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 B 가 올라가 있고, 내려와 앞서 있고, 다시 맞춰진다.
  // 높이 슬라이더는 두지 않았다: 배율을 건 그림에서 높이를 끌면 부풀린 차이가 따라
  // 커져, 실제 크기(하루 ns)와의 관계가 조작마다 흐려진다.
  parameters: [],

  stages: [
    {
      id: 'tower',
      label: text('label.stage'),
      constants: {
        gMs2: G_MS2,
        heightM: HEIGHT_M,
        cMs: C_MS,
        boost: BOOST,
        tickPeriod: TICK_PERIOD,
        realNsPerDay: REAL_NS_PER_DAY,
      },
    },
  ],

  environments: [],

  views: [{ id: 'main', label: text('label.view'), default: true }],

  /** 탑이 세로를 먹는다 — 탑 꼭대기와 캡션 줄이 함께 들어가는 만큼만 잡는다. */
  canvas: { height: 400, minHeight: 340 },

  /** 기록 띠의 지금 선(커서)이 눈금 아래로, 앞선 몫 부채꼴이 바늘 아래로 지나가야 한다. */
  drawOrder: 'scene',

  /**
   * 한 주기 = 맞춤 → 올림 → 위에 머묾 → 내림 → 견줌 → 다시 맞춤.
   *
   * - 기록은 `lift` 시작부터 `lower` 끝까지 쌓인다. `sync` 가 째깍 주기의 정수배라 기록이
   *   시작하는 순간 두 바늘이 모두 12시에 있다.
   * - B 의 높이는 `lift` 동안 고르게 오르고 `lower` 동안 고르게 내린다(선형) — 그래야
   *   B 가 앞서는 몫(높이의 적분)이 physics 에서 닫힌 꼴로 나온다.
   * - 주기 합(11 초)이 째깍 주기의 정수배라 A 의 바늘이 주기 끝에서 튀지 않는다.
   *   B 는 `reset` 동안 A 에 맞춰 되돌아간다.
   */
  timeline: {
    phases: [
      { id: 'sync', duration: 1, caption: key('caption.sync') },
      { id: 'lift', duration: 1, caption: key('caption.lift') },
      { id: 'up', duration: 4, caption: key('caption.up') },
      { id: 'lower', duration: 1, caption: key('caption.lower') },
      { id: 'compare', duration: 3, caption: key('caption.compare') },
      { id: 'reset', duration: 1, ease: 'smooth', caption: key('caption.reset') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — B 가 탑 꼭대기에 있고 기록이 쌓이는 중이다. */
  startAt: 3,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 공식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 720,
    fade: 0.25,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것은 거리가 아니라 **째깍이 떨어진 자리**다 —
   * 두 기록 줄의 눈금과 숫자가 그 자다.
   */

  messages: gravitationalTimeDilationMessages,
};
