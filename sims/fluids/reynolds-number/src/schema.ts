// ========================================================================
// reynolds-number — 선언
// ========================================================================
// 질문: 굵기도 빠르기도 다른 두 흐름이 왜 똑같은 결로 흐르는가.
//
// 관 셋을 위아래로 쌓는다.
//   위     — 굵은 관(D) · 빠르기 v
//   가운데 — 가는 관(D/2) · 두 배 빠르기(2v)   → Re 가 위와 같다
//   아래   — 가는 관(D/2) · 위와 같은 빠르기(v) → Re 가 위의 절반
//
// 셋을 같은 비율로 빠르게 했다가 되돌린다. 위와 가운데는 굵기도 빠르기도 다른데
// 곧을 때도 함께 곧고, 흐트러질 때도 같은 자리에서 함께 흐트러진다. 아래는 위와
// 빠르기가 같고 가운데와 굵기가 같은데 혼자 곧다. 결을 정하는 것은 v 도 D 도 아니라
// 그 둘을 묶은 Re = ρvD/η 하나다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:reynolds-number` 와 문자 그대로 일치한다 (C4). */
export const REYNOLDS_NUMBER_ID = 'reynolds-number';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 위 관의 Re — 느린 정박값 · 빠른 정박값. 셋 모두 이 비율로 빨라진다. */
export const RE_LOW = 1200;
export const RE_HIGH = 3600;
/** 임계 레이놀즈 수. 흔들림이 커지느냐 잦아드느냐가 여기서 갈린다. */
export const RE_CRITICAL = 2300;
/**
 * 성장률 계수. σ = k · (Re / Re_c − 1) — 이웃 `laminar-vs-turbulent` 와 같은 모형이다.
 * 같은 현상을 두 조각이 다른 법칙으로 그리면 둘 중 하나는 거짓말을 한다.
 */
export const GROWTH_K = 30.8;

/**
 * 관마다 굵기 · 빠르기의 배수(위 관 = 1). Re 는 둘의 곱을 따라간다 — 같은 물이라
 * ρ/η 가 같기 때문이다.
 */
export const PIPE_SCALES = {
  top: { d: 1, v: 1 },
  mid: { d: 0.5, v: 2 },
  bottom: { d: 0.5, v: 1 },
} as const;

/** 위 관이 `RE_LOW` 일 때의 화면 유속(월드/초). 화면 속도는 실제 v 에 비례한다. */
export const BASE_SPEED = 0.16;
/**
 * 주사기 바늘이 흔들림을 넣는 간격(흐름 방향 월드 거리). 시간 간격이 아니라 거리로
 * 두어 세 관의 흔들림 무늬가 같은 자리에 놓인다 — 빠른 관은 그만큼 자주 넣는다.
 */
export const SEED_SPACING = 0.19;

// ------------------------------------------------------------------------
// 배치 — 월드. 관 길이를 몇 미터라고 주장하지 않는다.
// ------------------------------------------------------------------------

/** 관 공통 — 들머리 x · 길이 · 염료 주입부가 들어간 거리. */
export const PIPE_X0 = 0;
export const PIPE_LENGTH = 1;
export const INJECT_X = 0.06;
/** 굵기 1 인 관의 반폭(월드). 가는 관은 여기에 배수를 곱한다. */
export const HALF_WIDTH = 0.07;
/** 관마다 가운데 높이(월드). */
export const PIPE_CENTER_Y = { top: 0.42, mid: 0.245, bottom: 0.105 } as const;

/** 관 왼쪽 이름표 · 오른쪽 Re 칩이 관 끝에서 떨어진 거리(월드). */
export const LABEL_GAP = 0.03;

/**
 * 프레이밍은 주장의 일부다. 가로는 왼쪽 이름표(D/2 · 2v)부터 오른쪽 Re 칩까지,
 * 세로는 위 관 위 여백부터 캡션 줄까지. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -0.25, maxX: 1.23, minY: 0.0, maxY: 0.52 } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이(초)
// ------------------------------------------------------------------------

/** 느린 정박값에 머무는 동안 · 빨라지는 동안 · 빠른 정박값에 머무는 동안 · 느려지는 동안. */
export const LOW_HOLD = 4.2;
export const RISE = 1.8;
export const HIGH_HOLD = 6.5;
export const FALL = 1.8;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const reynoldsNumberMessages = Object.freeze({
  'label.title': { ko: '레이놀즈 수', en: 'Reynolds number' },
  'label.operation': {
    ko: '전이를 가르는 무차원 수',
    en: 'The dimensionless number that decides the transition',
  },
  'label.stage': { ko: '세 관', en: 'Three pipes' },
  'label.view': { ko: '염료', en: 'Dye' },
  /** 관 왼쪽 이름표 — 굵기 · 빠르기의 배수. 수식 표기라 번역하지 않는다 (C1 판정 3). */
  'label.pipeTop': { ko: 'D · v', en: 'D · v' },
  'label.pipeMid': { ko: 'D/2 · 2v', en: 'D/2 · 2v' },
  'label.pipeBottom': { ko: 'D/2 · v', en: 'D/2 · v' },
  /** 관 오른쪽 칩. 기호와 수라 번역하지 않는다 (C1 판정 3). */
  'label.re': { ko: 'Re {re}', en: 'Re {re}' },
  'caption.low': {
    ko: '위(굵은 관 · 느린 물)와 가운데(가는 관 · 두 배 빠른 물)는 Re 가 같다 — 둘 다 곧게 흐른다',
    en: 'Top (wide pipe, slow water) and middle (narrow pipe, twice as fast) share one Re — both flow straight',
  },
  'caption.rise': {
    ko: '세 관이 모두 같은 비율로 빨라진다',
    en: 'All three pipes speed up by the same factor',
  },
  'caption.high': {
    ko: '위와 가운데는 같은 자리에서 함께 흐트러진다 — 위와 빠르기가 같은 아래만 곧다',
    en: 'Top and middle break up together at the same place — only the bottom, as fast as the top, stays straight',
  },
  'caption.fall': {
    ko: '다시 느려지면 위와 가운데가 함께 가라앉는다',
    en: 'As they slow down, top and middle settle together',
  },
} satisfies Record<string, LocalizedText>);

export type ReynoldsNumberMessageKey = keyof typeof reynoldsNumberMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: ReynoldsNumberMessageKey): LocalizedText => reynoldsNumberMessages[key];

/** 시간표가 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ReynoldsNumberMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const reynoldsNumberSchema: BundleSchema = {
  id: REYNOLDS_NUMBER_ID,
  label: text('label.title'),
  category: 'fluids',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 세 관이 흐르고, 함께 빨라지고, 둘이 함께 흐트러진다.
  parameters: [],

  stages: [
    {
      id: 'three-pipes',
      label: text('label.stage'),
      constants: {
        reLow: RE_LOW,
        reHigh: RE_HIGH,
        reCritical: RE_CRITICAL,
        growthK: GROWTH_K,
        dTop: PIPE_SCALES.top.d,
        vTop: PIPE_SCALES.top.v,
        dMid: PIPE_SCALES.mid.d,
        vMid: PIPE_SCALES.mid.v,
        dBottom: PIPE_SCALES.bottom.d,
        vBottom: PIPE_SCALES.bottom.v,
        baseSpeed: BASE_SPEED,
        seedSpacing: SEED_SPACING,
      },
    },
  ],

  environments: [],
  views: [{ id: 'dye', label: text('label.view'), default: true }],

  /**
   * 가로로 긴 관이 필수다 — 흐트러지는 **자리**가 관 길이 어디쯤인지를 셋이 견준다.
   * 세로는 관 셋과 캡션 한 줄뿐이다 (S-piece — 세로가 비싸다).
   */
  canvas: { height: 300, minHeight: 260 },

  /**
   * 한 주기 = 느림(곧다) → 빨라짐 → 빠름(위 · 가운데만 흐트러진다) → 느려짐.
   * 흐트러짐이 이력이 아니라 Re 의 문제임을 보이려고 다시 내려온다.
   */
  timeline: {
    phases: [
      { id: 'low', duration: LOW_HOLD, caption: key('caption.low') },
      { id: 'rise', duration: RISE, ease: 'smooth', caption: key('caption.rise') },
      { id: 'high', duration: HIGH_HOLD, caption: key('caption.high') },
      { id: 'fall', duration: FALL, ease: 'smooth', caption: key('caption.fall') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — 곧은 세 실이 흐르는 한가운데에서 연다. */
  startAt: 1.4,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 정의와 공식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  messages: reynoldsNumberMessages,
};
