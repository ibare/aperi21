// ========================================================================
// radiometric-dating — 선언
// ========================================================================
// 질문: 시료에 남은 탄소-14 의 비율만 재서 어떻게 그것이 얼마나 오래되었는지 아는가.
//
// 답: 붕괴 곡선을 **거꾸로 읽는다.** 남은 비율의 높이에서 가로로 곡선까지 가고, 거기서
// 곧장 내려오면 지난 시간이다. 살아 있을 때의 1/4 이면 반감기 두 번 — 되짚을 때마다
// 비율이 두 배가 되어 1/4 → 1/2 → 1 — 5730 년 × 2, 약 11460 년.
//
// 이웃 `radioactive-decay` 는 원자가 붕괴하며 곡선이 **그려지는** 것을 보인다. 이 조각은
// 곡선을 이미 그려 둔 **읽기 도구**로 쓴다 — 움직이는 것은 곡선이 아니라 읽는 경로다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:radiometric-dating` 와 문자 그대로 일치한다 (C4). */
export const RADIOMETRIC_DATING_ID = 'radiometric-dating';

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const radiometricDatingMessages = Object.freeze({
  'label.title': { ko: '방사성 연대 측정', en: 'Radiometric dating' },
  'label.stage': { ko: '탄소-14', en: 'Carbon-14' },
  'label.view': { ko: '곡선 거꾸로 읽기', en: 'Reading the curve backward' },

  /** 시료 막대 위 · 아래 이름. 조사가 붙는 말이라 문안이다 (C1 판정 4). */
  'label.alive': { ko: '살아 있을 때', en: 'when alive' },
  'label.sample': { ko: '시료', en: 'sample' },
  /** 축 이름. */
  'label.axisRatio': { ko: '남은 탄소-14 비율', en: 'carbon-14 remaining' },
  'label.axisTime': { ko: '지난 시간 →', en: 'time elapsed →' },
  /** 세로축 눈금 — 수 · 분수는 표식이다 (C1 판정 3). */
  'label.one': { ko: '1', en: '1' },
  'label.fraction': { ko: '{n}/{d}', en: '{n}/{d}' },
  /** 되짚는 화살표 하나 = 반감기 하나. 값은 선언된 반감기를 그대로 끼운다 (S-piece 유효숫자). */
  'label.halfLife': { ko: '{half} 년', en: '{half} yr' },
  /** 읽어 낸 연대 — 선언된 정박값을 그대로 끼운다. */
  'label.age': { ko: '약 {age} 년', en: '≈ {age} years' },

  'caption.level': {
    ko: '시료에 남은 탄소-14 는 살아 있을 때의 {num}/{den} — 그 높이를 따라 곡선까지 간다',
    en: 'The sample keeps {num}/{den} of the carbon-14 it had when alive — follow that level across to the curve',
  },
  'caption.drop': {
    ko: '곡선에 닿은 자리에서 곧장 내려오면 지난 시간이 나온다',
    en: 'From where it meets the curve, drop straight down to read the time elapsed',
  },
  'caption.count': {
    ko: '거꾸로 한 번 되짚을 때마다 비율이 두 배가 된다 — 한 번이 반감기 {half} 년',
    en: 'Each step back doubles the fraction — one step is one half-life, {half} years',
  },
  'caption.age': {
    ko: '반감기 {n}번 — 이 생물은 약 {age} 년 전에 죽었다',
    en: '{n} half-lives — this organism died about {age} years ago',
  },
} satisfies Record<string, LocalizedText>);

export type RadiometricDatingMessageKey = keyof typeof radiometricDatingMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: RadiometricDatingMessageKey): LocalizedText => radiometricDatingMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: RadiometricDatingMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다 (원칙 2). 읽는 곳은 `physics.readConstants`.
// ------------------------------------------------------------------------

/** 탄소-14 반감기(년). */
export const HALF_LIFE_YEARS = 5730;
/** 측정한 비율 = 분자 / 분모 (살아 있을 때를 1 로). 화면에 분수 그대로 띄운다. */
export const RATIO_NUMERATOR = 1;
export const RATIO_DENOMINATOR = 4;
/** 그 비율까지 걸린 반감기 수. 비율과 어긋나면 `readConstants` 가 던진다. */
export const HALF_LIVES = 2;
/** 읽어 낸 연대(년) — 화면에 띄우는 정박값. 반감기 × 횟수와 어긋나면 던진다. */
export const AGE_YEARS = 11460;

/**
 * 거꾸로 되짚는 단계 — 반감기 하나에 하나. 단계 수가 상수를 따라가지 못해(장부 G13)
 * `readConstants` 가 반감기 수의 올림과 이 길이가 같은지 확인한다.
 */
export const HOP_PHASES = ['hop-1', 'hop-2'] as const;

// ------------------------------------------------------------------------
// 배치 — 월드 단위는 임의. 원점은 지난 시간 0 · 비율 0.
// ------------------------------------------------------------------------

export const PLOT = {
  /** 반감기 하나의 가로 길이(월드). */
  perHalfLife: 3,
  /** 비율 1 의 세로 길이(월드). */
  perRatio: 4,
  /** 가로축 끝(반감기 수). 읽은 자리 너머로 곡선이 조금 더 이어져야 「곡선 위의 한 점」 으로 읽힌다. */
  endHalfLives: 3.4,
  /** 세로축이 비율 1 위로 더 나가는 길이(월드). */
  axisOvershoot: 0.3,
} as const;

/** 시료 막대 — 세로축 왼쪽. 높이는 세로축과 같은 눈금이다(위 끝 = 살아 있을 때 = 1). */
export const BAR = { x0: -2.2, x1: -1.4 } as const;

/** 되짚는 화살표가 가로축 아래로 떨어진 거리(월드) · 연대 글자의 높이(월드). */
export const HOP_DROP = 0.5;
export const AGE_Y = -1.3;

/**
 * 고정 경계. 막대 이름 · 축 이름 · 되짚는 화살표 · 연대가 들어가게 처음부터 잡는다 (원칙 6).
 * 아래로 캡션 한 줄 자리를 더 잡는다 — 캡션 슬롯은 프레이밍 여백으로 잡히지 않는다 (장부 G24).
 */
export const SCENE_BOUNDS = { minX: -3.0, maxX: 10.9, minY: -2.3, maxY: 4.7 } as const;

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const radiometricDatingSchema: BundleSchema = {
  id: RADIOMETRIC_DATING_ID,
  title: text('label.title'),
  category: 'modern',
  timeModel: 'periodic',

  // 조작기가 없다. 읽는 동작은 한 번 보면 되고, 비율을 끌어 바꾸게 하면 연대 글자를
  // 계산해 반올림해야 해서 선언값 그대로 띄우는 약속이 깨진다 (NOTES (b)).
  parameters: [],
  stages: [
    {
      id: 'carbon-14',
      label: text('label.stage'),
      constants: {
        halfLifeYears: HALF_LIFE_YEARS,
        ratioNumerator: RATIO_NUMERATOR,
        ratioDenominator: RATIO_DENOMINATOR,
        halfLives: HALF_LIVES,
        ageYears: AGE_YEARS,
      },
    },
  ],
  environments: [],
  views: [{ id: 'read-backward', label: text('label.view'), default: true }],

  /** 가로로 넓다 — 곡선이 반감기 셋 너머까지 이어진다. 아래로 화살표 · 연대 · 캡션. */
  canvas: { height: 420, minHeight: 360 },

  /** 쓴 순서대로 겹친다 — 축 · 곡선 위에 읽기 선, 그 위에 점과 글자. */
  drawOrder: 'scene',

  /** 도착한 순간 읽기 선이 이미 곡선을 향해 나아가는 중이다 (S-piece). */
  startAt: 0.5,

  /**
   * 한 주기 — 9.5 초.
   *
   * - `level` — 시료 막대의 채움 높이에서 강조색 가로선이 곡선을 향해 자란다.
   * - `meet` — 곡선에 닿은 자리에 점이 선다.
   * - `drop` — 그 점에서 가로축까지 세로선이 내려온다.
   * - `hop-1` · `hop-2` — 가로축 아래에서 반감기 하나씩 거꾸로 되짚는 화살표가 자라고,
   *   점이 곡선을 거슬러 오른다(1/4 → 1/2 → 1).
   * - `age-in` · `age` — 내려온 자리 아래에 읽어 낸 연대가 뜨고 머문다.
   * - `clear` — 읽기 선 · 화살표 · 연대가 물러난다.
   */
  timeline: {
    phases: [
      { id: 'level', duration: 1.6, ease: 'smooth', caption: key('caption.level') },
      { id: 'meet', duration: 0.4, ease: 'smooth', caption: key('caption.level') },
      { id: 'drop', duration: 1.2, ease: 'smooth', caption: key('caption.drop') },
      ...HOP_PHASES.map((id) => ({ id, duration: 1.4, ease: 'smooth' as const, caption: key('caption.count') })),
      { id: 'age-in', duration: 0.5, ease: 'smooth', caption: key('caption.age') },
      { id: 'age', duration: 2.4, caption: key('caption.age') },
      { id: 'clear', duration: 0.6, ease: 'smooth', caption: key('caption.age') },
    ],
  },

  /** 슬롯 하나. 수는 스테이지 상수에서 만든 문자열을 state 가 들고 있다 (장부 G133). */
  caption: {
    anchor: { screen: 'bottom-left', offset: [4, -4] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 820,
    style: { colorRole: 'ink', emphasis: 'strong' },
    vars: { num: 'caption.num', den: 'caption.den', half: 'caption.half', n: 'caption.n', age: 'caption.age' },
  },

  // 그리드 · 카메라 단추 · 제목 · 범례 없음(기본). 읽을 것은 눈금값이 아니라 읽는 경로다 (S-piece).

  messages: radiometricDatingMessages,
};
