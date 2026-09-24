// ========================================================================
// eclipse — 선언
// ========================================================================
// 질문: 삭과 보름은 매달 오는데 왜 일식 · 월식은 매달 일어나지 않는가.
//
// 지구와 달은 늘 햇빛 반대쪽으로 그림자 원뿔을 드리운다. 그 원뿔이 다른 천체에 닿는 것은
// 해 · 지구 · 달이 한 줄에 설 때뿐이다 — 달이 지구 그림자에 들면 월식(보름), 달 그림자 끝이
// 지구에 닿으면 일식(삭). 달 궤도가 약 5° 기울어 있어 매달 삭 · 보름이 와도 대부분은 그림자가
// 위아래로 비껴간다.
//
// 해를 왼쪽에 둔 채 옆에서 본 단면이다. 지구가 해를 도는 동안 해를 늘 왼쪽에 두므로, 우주에
// 고정된 달 궤도의 교점선이 이 그림 안에서는 한 해에 한 바퀴 돈다 — 궤도가 납작한 타원(교점이
// 해 쪽 · 반대쪽 = 식 계절)으로 보였다가 기운 선분(교점이 옆 = 비껴가는 달)으로 보인다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// 월드 단위는 캔버스 px 에 가까운 임의 단위, y 는 위(황도면의 수직).
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:eclipse` 와 문자 그대로 일치한다 (C4). */
export const ECLIPSE_ID = 'eclipse';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 크기 · 거리는 보이게 과장했다. 실제 비율(지구 반지름의 60 배 거리)로는 달이 점이 된다.
// ------------------------------------------------------------------------

/** 달 궤도가 황도면에 기운 각(도) — 실제 값. 화면 문구에 그대로 뜬다. */
export const INCLINATION_DEG = 5.14;
/**
 * 기울기 과장 배율 — 그림 속 궤도는 실제 기울기의 이 배만큼 기운다. 거리를 줄인 만큼 기울기를
 * 키우지 않으면 비껴가는 거리가 지구 크기보다 작아져 「비껴간다」 가 서지 않는다.
 */
export const INCLINATION_SCALE = 3.4;
/** 지구 반지름(월드). */
export const EARTH_RADIUS = 36;
/** 달 반지름(월드) — 실제 비(1 : 3.67)보다 조금 크게. */
export const MOON_RADIUS = 13;
/** 지구 · 달 거리(월드) — 실제는 지구 반지름의 약 60 배. */
export const MOON_DISTANCE = 195;
/**
 * 해의 겉보기 반지름(도) — 그림자 원뿔이 좁아지는 반각이다. 실제 0.27°. 달 본그림자 끝이
 * 지구에 겨우 닿는 실제 관계(본그림자 길이 ≈ 지구 · 달 거리)를 과장한 거리에서 지키도록 골랐다.
 */
export const SUN_ANGULAR_RADIUS_DEG = 4.03;
// 사이 단계마다 지나는 반달(삭 → 보름, 보름 → 삭) 수. 삭 · 보름 단계는 반달 하나씩이다. 합이 한 해
// 반달 수와 같아야 주기 끝에서 달의 자리와 교점 각이 처음과 같아진다.
/** `driftA` 단계의 반달 수 — 두 달. */
export const DRIFT_A_HALF_MONTHS = 4;
/** `driftB` 단계의 반달 수 — 두 달. */
export const DRIFT_B_HALF_MONTHS = 4;
/** `driftC` 단계의 반달 수 — 나머지 다섯 달. */
export const DRIFT_C_HALF_MONTHS = 10;
/** 한 해의 반달 수 = 12 삭망월 — 교점선이 해 쪽에서 한 바퀴 도는 주기. */
export const HALF_MONTHS_PER_YEAR = 24;

// ------------------------------------------------------------------------
// 배치 — 월드 단위(가로 740 판), y 위
// ------------------------------------------------------------------------

/**
 * 해 — 왼쪽 끝에 일부만 보인다. 크기는 배치값이다(원뿔의 반각은 위 상수가 정한다). 해를 다 그리면
 * 가로가 모자라 지구 · 달이 작아진다.
 */
export const SUN = { x: -24, r: 64 } as const;
/** 지구 가운데 가로 자리. 황도면은 y = 0. */
export const EARTH_X = 500;
/** 햇빛 획의 가로 구간 · 세로 자리. 가운데는 공전면 이름표 자리로 비운다. */
export const RAYS = { x0: 118, x1: 272, ys: [-44, -26, 26, 44] } as const;
/** 공전면 이름표 자리 — 해 옆, 선 바로 아래. */
export const ECLIPTIC_LABEL = { x: 118, y: -11 } as const;
/** 삭 · 보름 이름표의 세로 자리. */
export const SYZYGY_LABEL_Y = -90;
/** 과장 안내 문구 자리(오른쪽 위). */
export const NOTE_ANCHOR = { x: 736, y: 112 } as const;

/**
 * 고정 경계. 판 전체 + 아래 캡션 두 줄 자리. 지구 그림자는 보름 자리 너머 오른쪽 끝 밖으로 이어진다. 캡션 슬롯이 그림을 덮지 않게 세로를 아래로
 * 늘렸다 (이웃 조각과 같은 까닭, 장부 G24).
 */
export const SCENE_BOUNDS = { minX: 0, maxX: 740, minY: -156, maxY: 120 } as const;

// ------------------------------------------------------------------------
// 시간표 — 한 주기 = 12 삭망월(한 해). 단계마다 반달(half-month)을 몇 개 지나는지는 physics 가 안다.
// ------------------------------------------------------------------------

/** 삭 · 보름 하나를 천천히 보이는 단계(초) — 반달 하나. */
export const SYZYGY_PHASE = 4;
/** 몇 달을 건너뛰는 단계(초). */
export const DRIFT_SHORT = 3.5;
export const DRIFT_LONG = 6;
/** 도착한 순간 — 달이 삭 자리로 다가가는 중. */
export const START_AT = 1;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const eclipseMessages = Object.freeze({
  'label.title': { ko: '일식과 월식', en: 'Solar and lunar eclipses' },
  'label.stage': { ko: '해 · 지구 · 달', en: 'Sun, Earth and Moon' },
  'label.view': { ko: '옆에서 본 단면', en: 'Side-on section' },
  'label.sun': { ko: '해', en: 'Sun' },
  'label.earth': { ko: '지구', en: 'Earth' },
  'label.moon': { ko: '달', en: 'Moon' },
  'label.sunlight': { ko: '햇빛', en: 'sunlight' },
  'label.ecliptic': { ko: '지구 공전면', en: 'Earth’s orbital plane' },
  'label.newMoon': { ko: '삭', en: 'new moon' },
  'label.fullMoon': { ko: '보름', en: 'full moon' },
  'label.solarEclipse': { ko: '일식', en: 'solar eclipse' },
  'label.lunarEclipse': { ko: '월식', en: 'lunar eclipse' },
  'label.note': {
    ko: '크기 · 거리를 과장했다. 달 궤도의 실제 기울기 {tilt}° 를 {scale}배로 그렸다',
    en: 'Sizes and distances exaggerated. The Moon’s real orbital tilt of {tilt}° is drawn {scale}× larger',
  },
  'caption.solarA': {
    ko: '삭 — 해 · 달 · 지구가 한 줄에 섰다. 달이 드리운 그림자 끝이 지구에 닿는다. 그 자리에서는 해가 가려진다 — 일식.',
    en: 'New moon — Sun, Moon and Earth stand in one line. The tip of the Moon’s shadow reaches Earth, and there the Sun is hidden: a solar eclipse.',
  },
  'caption.lunarA': {
    ko: '보름 — 이번엔 지구가 가운데다. 달이 지구가 드리운 그림자 속으로 들어가 어두워진다 — 월식.',
    en: 'Full moon — now Earth is in the middle. The Moon passes into the shadow Earth casts and goes dark: a lunar eclipse.',
  },
  'caption.driftA': {
    ko: '몇 달이 지난다. 그 사이 지구가 해를 돌아, 기울어진 달 궤도를 햇빛이 비추는 방향이 바뀐다.',
    en: 'Months pass. Earth moves around the Sun, so sunlight now meets the tilted lunar orbit from a different side.',
  },
  'caption.solarMiss': {
    ko: '삭은 또 온다. 그러나 달이 한 줄보다 아래로 지나가, 달 그림자가 지구 아래로 비껴간다 — 일식이 없다.',
    en: 'New moon comes again, but the Moon passes below the line, and its shadow slips past beneath Earth — no eclipse.',
  },
  'caption.lunarMiss': {
    ko: '보름에도 달이 지구 그림자 위로 지나간다. 그림자는 늘 드리워져 있지만, 닿으려면 셋이 한 줄에 서야 한다.',
    en: 'At full moon the Moon rides above Earth’s shadow. The shadows are always there, but they only land when all three line up.',
  },
  'caption.driftB': {
    ko: '다시 몇 달 — 달 궤도가 햇빛 쪽에서 보아 다시 납작해진다.',
    en: 'A few more months — seen along the sunlight, the lunar orbit flattens out again.',
  },
  'caption.solarB': {
    ko: '반년 만에 다시 한 줄. 삭에 달 그림자가 지구에 닿는다 — 일식.',
    en: 'Half a year on, the line forms again. At new moon the Moon’s shadow lands on Earth: a solar eclipse.',
  },
  'caption.lunarB': {
    ko: '이어진 보름에 달이 지구 그림자에 든다 — 월식. 식은 한 해에 두 번, 한 줄에 서는 철에 몰려 온다.',
    en: 'At the next full moon the Moon enters Earth’s shadow: a lunar eclipse. Eclipses come in two seasons a year, when the line can form.',
  },
  'caption.driftC': {
    ko: '나머지 달들에는 삭 · 보름마다 그림자가 위아래로 비껴간다.',
    en: 'Through the other months, the shadows slip above or below at every new and full moon.',
  },
} satisfies Record<string, LocalizedText>);

export type EclipseMessageKey = keyof typeof eclipseMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: EclipseMessageKey): LocalizedText => eclipseMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: EclipseMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const eclipseSchema: BundleSchema = {
  id: ECLIPSE_ID,
  title: text('label.title'),
  category: 'astro',
  timeModel: 'periodic',

  // 조작기가 없다 — 식 계절 · 비껴가는 달 · 다음 식 계절을 자동으로 차례로 보여 견주기까지 마친다.
  parameters: [],

  stages: [
    {
      id: 'sun-earth-moon',
      label: text('label.stage'),
      constants: {
        inclination: INCLINATION_DEG,
        inclinationScale: INCLINATION_SCALE,
        earthRadius: EARTH_RADIUS,
        moonRadius: MOON_RADIUS,
        moonDistance: MOON_DISTANCE,
        sunAngularRadius: SUN_ANGULAR_RADIUS_DEG,
        driftAHalfMonths: DRIFT_A_HALF_MONTHS,
        driftBHalfMonths: DRIFT_B_HALF_MONTHS,
        driftCHalfMonths: DRIFT_C_HALF_MONTHS,
        halfMonthsPerYear: HALF_MONTHS_PER_YEAR,
      },
    },
  ],
  environments: [],
  views: [{ id: 'side', label: text('label.view'), default: true }],

  /** 판 740 × 200 + 캡션 두 줄. */
  canvas: { height: 360, minHeight: 320 },

  /**
   * 겹침이 판정 장치다 — 달이 지구 뒤로 가면 지구가 달과 그 그림자를 가리고, 앞으로 오면 달이
   * 지구를 가린다. 가려진 자리(식)는 천체 위에 덮여야 한다. 층 순서로는 둘 다 고를 수 없다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 12 삭망월. 삭 · 보름 단계는 반달 하나를 천천히 지나고(가운데가 삭 · 보름), 사이 단계는
   * 몇 달을 빠르게 건넌다. 달의 자리 · 교점 각을 단계 진행도의 합에서 읽으므로(physics `halfMonths`)
   * 캡션이 달의 자리와 어긋날 수 없다.
   */
  timeline: {
    phases: [
      { id: 'solarA', duration: SYZYGY_PHASE, ease: 'linear', caption: key('caption.solarA') },
      { id: 'lunarA', duration: SYZYGY_PHASE, ease: 'linear', caption: key('caption.lunarA') },
      { id: 'driftA', duration: DRIFT_SHORT, ease: 'linear', caption: key('caption.driftA') },
      { id: 'solarMiss', duration: SYZYGY_PHASE, ease: 'linear', caption: key('caption.solarMiss') },
      { id: 'lunarMiss', duration: SYZYGY_PHASE, ease: 'linear', caption: key('caption.lunarMiss') },
      { id: 'driftB', duration: DRIFT_SHORT, ease: 'linear', caption: key('caption.driftB') },
      { id: 'solarB', duration: SYZYGY_PHASE, ease: 'linear', caption: key('caption.solarB') },
      { id: 'lunarB', duration: SYZYGY_PHASE, ease: 'linear', caption: key('caption.lunarB') },
      { id: 'driftC', duration: DRIFT_LONG, ease: 'linear', caption: key('caption.driftC') },
    ],
  },

  /** 도착한 순간 이미 돌고 있다 — 달이 삭 자리로 다가가는 중. */
  startAt: START_AT,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 식의 정의는 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-left', offset: [16, -8] },
    align: 'left',
    fontSize: 14,
    fade: 0.3,
    style: { colorRole: 'ink', emphasis: 'medium' },
    wrapWidth: 800,
  },

  // 그리드 · 카메라 단추 없음 — 잴 것이 거리가 아니라 「한 줄에 섰나」 다.

  messages: eclipseMessages,
};
