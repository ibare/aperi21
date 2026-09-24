// ========================================================================
// doppler-source-vs-observer — 선언
// ========================================================================
// 질문: 음원이 관찰자에게 다가가는 것과 관찰자가 음원에게 다가가는 것은, 서로에
// 대해 같은 빠르기로 가까워지니 같은 소리를 듣게 되는가?
//
// 아니다. 음원이 움직이면 **파장 자체가 짧아진다** — 음원이 자기가 방금 낸
// 파면을 뒤쫓아 가서 다음 파면을 내기 때문이다. 관찰자가 움직이면 **파장은
// 그대로**이고, 관찰자가 파면 쪽으로 달려들어 만나는 빈도만 늘어난다.
// 같은 빠르기 u = v/2 에서 앞쪽은 두 배(v/(v−u)), 뒤쪽은 1.5 배((v+u)/v)다.
//
// 화면: 두 칸을 위아래로 두고 같은 순간 같은 빠르기로 다가가게 한다. 같은
// 시간창 동안 관찰자가 만난 파면을 칸 아래 눈금줄에 새긴다 — 위 8개, 아래 6개.
// 멈춰 세운 뒤 위에는 λ′(짧아진 간격), 아래에는 λ(그대로인 간격)를 잰다.
//
// 이웃 `doppler-effect` 는 한 음원 둘레의 앞뒤 비대칭(앞 촘촘 · 뒤 성김)을
// 보인다. 이 조각은 그 그림을 되풀이하지 않고 **누가 움직이느냐**를 가른다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:doppler-source-vs-observer` 와 문자 그대로 일치한다 (C4). */
export const DOPPLER_SOURCE_VS_OBSERVER_ID = 'doppler-source-vs-observer';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 소리의 빠르기(m/s). 화면에서는 u/v 비만 그림을 정한다. */
export const SOUND_SPEED = 340;
/** 움직이는 쪽의 빠르기(m/s). 두 칸이 같은 값을 쓴다 — 비교의 조건이다. */
export const MOVER_SPEED = 170;
/** 음원 진동수(Hz). 칩 글자로 보인다. */
export const SOURCE_FREQ = 400;

/**
 * 화면 위 파면의 빠르기(월드/초). 실제 340 m/s 를 그대로 옮기면 눈이 따라가지
 * 못하므로 느리게 돌린다 — 움직이는 쪽의 화면 빠르기는 여기에 u/v 를 곱한 값이다.
 */
export const SCREEN_WAVE_SPEED = 5;
/** 화면 위 파면 방출 주기(초). 실제 1/400 초를 느리게 돌린 값이다. */
export const SCREEN_PERIOD = 0.5;

/** 음원이 멈춰 있던 자리(월드 x). 두 칸 모두 여기서 시작한다. */
export const SOURCE_START_X = -10;
/** 관찰자가 멈춰 있던 자리(월드 x). 두 칸 모두 여기서 시작한다. */
export const OBSERVER_START_X = 10;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. y 는 위.
// ------------------------------------------------------------------------

/** 두 칸의 좌우 끝(월드 x). 파면은 이 사각형 안에만 그린다 (`clip`). */
export const LANE_X0 = -12.5;
export const LANE_X1 = 12.5;
/** 칸의 반높이(월드). */
export const LANE_HALF_H = 2;
/** 위 칸(음원이 움직인다) · 아래 칸(관찰자가 움직인다)의 축 높이. */
export const TOP_AXIS_Y = 4.2;
export const BOTTOM_AXIS_Y = -2.6;
/** 칸 제목이 칸 위 끝에서 떨어진 거리(월드). */
export const TITLE_RISE = 0.5;
/** 눈금줄이 칸 아래 끝에서 떨어진 거리(월드). */
export const STRIP_DROP = 0.95;
/** 눈금줄의 왼쪽 · 오른쪽 끝(월드 x). 시간창 전체가 이 폭에 놓인다. */
export const STRIP_X0 = -8.6;
export const STRIP_X1 = 12;
/** 눈금줄 이름표의 왼쪽 끝(월드 x). */
export const STRIP_LABEL_X = -12.4;
/** 눈금 하나의 길이(월드). `trace` tick 은 월드 단위다. */
export const TICK_LEN = 0.7;
/** 시간창 양 끝 표지의 길이(월드). 눈금보다 짧게 두어 만난 파면과 헷갈리지 않는다. */
export const WINDOW_CAP_LEN = 0.4;

/** 파면이 이 반지름(월드)에 이르면 사라진다. 칸 전체를 덮는 크기다. */
export const FRONT_REACH = 24;
/** 사라지기 전 옅어지는 구간(월드). */
export const FRONT_FADE_TAIL = 4;
/** 원 하나를 긋는 표본 수. */
export const CIRCLE_SEGMENTS = 120;

/** 움직이는 쪽 머리 위 속도 화살표의 높이 · 길이(월드). */
export const ARROW_RISE = 1.05;
export const ARROW_LEN = 2.2;
/** 음원 아래 진동수 칩의 깊이(월드). */
export const FREQ_DROP = 1.05;
/** 치수선이 축에서 떠 있는 높이(월드). */
export const DIM_RISE = 1.35;

/**
 * 프레이밍 — 위 칸 제목부터 아래 눈금줄과 캡션 자리까지.
 * 매 프레임 같은 값이다 (S-piece — 프레이밍은 주장의 일부다).
 */
export const SCENE_BOUNDS = { minX: -13, maxX: 13, minY: -7.7, maxY: 7.3 } as const;

// ------------------------------------------------------------------------
// 그리는 값 — 화면 px · 불투명도
// ------------------------------------------------------------------------

/** 파면 선 굵기(화면 px). 좁아진 간격에서도 두 선으로 읽힐 만큼 얇다. */
export const FRONT_WIDTH_PX = 1.3;
/** 파면의 잉크 농도. */
export const FRONT_OPACITY = 0.7;
/** 칸 바탕 칠의 농도. 파면이 어디까지 그려지는지 가를 만큼만. */
export const LANE_FILL_OPACITY = 0.07;
/** 눈금줄 바탕선 굵기(화면 px). */
export const STRIP_WIDTH_PX = 1;
/** 눈금 굵기(화면 px). */
export const TICK_WIDTH_PX = 2;
/** 지금 시각 표지의 농도. 만난 파면 눈금보다 옅다. */
export const CURSOR_OPACITY = 0.55;
/** 관찰자가 파면을 만날 때 번지는 고리 — 시작 · 끝 반지름(화면 px) · 굵기 · 수명(초). */
export const MEET_RING_PX = 6;
export const MEET_SPREAD_PX = 20;
export const MEET_WIDTH_PX = 1.6;
export const MEET_LIFE = 0.35;
/** 칸 제목 · 이름표 글자 크기(화면 px). */
export const TITLE_PX = 13;
export const LABEL_PX = 11;
/** 캡션 글자 크기(화면 px) · 줄바꿈 폭(화면 px). */
export const CAPTION_PX = 14;
export const CAPTION_WRAP_PX = 820;
/** 화살표 칩을 화살표에서 띄우는 거리(화면 px). 위로. */
export const LABEL_GAP_PX = 12;

/**
 * 음원 외형 — 스피커. `pos` 기준 월드 단위, y 는 위. 오른쪽(관찰자 쪽)을 본다.
 */
export const SOURCE_PATH =
  'M -0.5 -0.22 L -0.16 -0.22 L 0.26 -0.55 L 0.26 0.55 L -0.16 0.22 L -0.5 0.22 Z';

/**
 * 관찰자 외형 — 머리와 몸. `pos` 기준 월드 단위, y 는 위. 머리는 원호 둘로 닫는다.
 */
export const OBSERVER_PATH =
  'M 0.19 0.42 A 0.19 0.19 0 1 0 -0.19 0.42 A 0.19 0.19 0 1 0 0.19 0.42 Z ' +
  'M -0.3 -0.6 L 0.3 -0.6 L 0.3 0.02 Q 0.3 0.16 0.16 0.16 L -0.16 0.16 Q -0.3 0.16 -0.3 0.02 Z';

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const dopplerSourceVsObserverMessages = Object.freeze({
  'label.title': { ko: '음원과 관찰자', en: 'Moving source vs. moving observer' },
  'label.operation': {
    ko: '누가 움직이냐에 따른 비대칭',
    en: 'The asymmetry of who is moving',
  },
  'label.stage': { ko: '공기', en: 'Air' },
  'label.view': { ko: '두 칸', en: 'Two lanes' },

  /** 칸 제목. 두 칸을 가르는 것은 색이 아니라 이 이름이다. */
  'label.sourceMoves': { ko: '음원이 움직인다', en: 'The source moves' },
  'label.observerMoves': { ko: '관찰자가 움직인다', en: 'The observer moves' },
  /** 눈금줄 이름. 눈금 하나가 관찰자가 파면 하나를 만난 순간이다. */
  'label.met': { ko: '만난 파면', en: 'Fronts met' },
  /** 값이 끼어드는 칩 — 수식 표기지만 값 자리가 있어 문안 키로 둔다 (C1). */
  'label.speed': { ko: 'u = {u} m/s', en: 'u = {u} m/s' },
  'label.freq': { ko: 'f = {f} Hz', en: 'f = {f} Hz' },
  /** 파장 기호. 표식이라 번역하지 않는다 (C1 판정 3). */
  'label.lambda': { ko: 'λ', en: 'λ' },
  'label.lambdaShort': { ko: 'λ′', en: 'λ′' },

  'caption.rest': {
    ko: '둘 다 멈춰 있다 — 파면이 같은 간격으로 퍼지고, 두 관찰자는 같은 빠르기로 파면을 만난다.',
    en: 'Both stand still — the fronts spread evenly, and both observers meet them at the same rate.',
  },
  'caption.approach': {
    ko: '같은 빠르기로 다가간다 — 위에서는 음원이 파면을 밀어 간격이 좁아지고, 아래에서는 간격이 그대로인 채 관찰자가 파면으로 달려든다.',
    en: 'Both close in at the same speed — above, the source crowds its fronts together; below, the spacing stays and the observer runs into the fronts.',
  },
  'caption.count': {
    ko: '같은 시간 동안 만난 파면을 새긴다 — 위의 관찰자가 더 자주 만난다.',
    en: 'Marking every front met in the same stretch of time — the observer above meets them more often.',
  },
  'caption.hold': {
    ko: '위는 파장 자체가 짧아졌고(λ′), 아래는 파장이 그대로(λ)인데 만나는 빈도만 늘었다 — 같은 빠르기라도 결과가 다르다.',
    en: 'Above, the wavelength itself got shorter (λ′); below, it stayed the same (λ) and only the rate of meeting rose — same speed, different result.',
  },
} satisfies Record<string, LocalizedText>);

export type DopplerSourceVsObserverMessageKey = keyof typeof dopplerSourceVsObserverMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로 (C1). */
export const text = (key: DopplerSourceVsObserverMessageKey): LocalizedText =>
  dopplerSourceVsObserverMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: DopplerSourceVsObserverMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const dopplerSourceVsObserverSchema: BundleSchema = {
  id: DOPPLER_SOURCE_VS_OBSERVER_ID,
  label: text('label.title'),
  category: 'waves',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 파라미터 · 조작기를 두지 않는다. 이 조각의 비교는 「같은 빠르기」 라는 조건
  // 하나에 기대고, 자동 진행이 그 조건을 이미 세운다.
  parameters: [],

  stages: [
    {
      id: 'air',
      label: text('label.stage'),
      constants: {
        soundSpeed: SOUND_SPEED,
        moverSpeed: MOVER_SPEED,
        sourceFreq: SOURCE_FREQ,
        screenWaveSpeed: SCREEN_WAVE_SPEED,
        screenPeriod: SCREEN_PERIOD,
        sourceStartX: SOURCE_START_X,
        observerStartX: OBSERVER_START_X,
      },
    },
  ],
  environments: [],
  views: [{ id: 'lanes', label: text('label.view'), default: true }],

  /** 가로로 넓다 — 두 칸을 위아래로 쌓고 각 칸 아래에 눈금줄 하나. */
  canvas: { height: 470, minHeight: 420 },

  /** 도착한 순간 이미 파면이 칸을 채운 채 멈춰 있는 장면이다 (S-piece). */
  startAt: 0.9,

  /**
   * 한 주기 10.4 초.
   *
   * - `appear` — 앞 주기의 끝 장면에서 옅게 다시 나타난다.
   * - `rest` — 둘 다 멈춰 있다. 두 칸이 똑같다 — 비교의 기준선.
   * - `approach` — 같은 순간 같은 빠르기로 움직이기 시작한다. 길이의 기본값은
   *   음원과 관찰자 사이 거리 ÷ 화면 파속(20 ÷ 5 = 4 초) — 음원이 움직인 뒤 낸
   *   첫 파면이 위 칸 관찰자에게 닿는 때다. 그 전까지 위 관찰자는 멈춰 있을 때
   *   나간 파면을 만나고 있어서, 세기 시작하면 공정하지 않다.
   * - `count` — 같은 시간창. 관찰자가 만난 파면이 눈금줄에 새겨진다.
   * - `hold` — 멈춰 세운 장면에서 λ′ 와 λ 를 잰다.
   * - `fade` — 물러난다.
   */
  timeline: {
    phases: [
      { id: 'appear', duration: 0.4, caption: key('caption.rest') },
      { id: 'rest', duration: 1.4, caption: key('caption.rest') },
      { id: 'approach', duration: 4, caption: key('caption.approach') },
      { id: 'count', duration: 2, caption: key('caption.count') },
      { id: 'hold', duration: 2, caption: key('caption.hold') },
      { id: 'fade', duration: 0.6, caption: key('caption.hold') },
    ],
  },

  /** 슬롯 하나. 단계마다 지금 화면에서 벌어지는 일만 말한다. */
  caption: {
    anchor: { screen: 'bottom-left' },
    align: 'left',
    fontSize: CAPTION_PX,
    wrapWidth: CAPTION_WRAP_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  // 그리드 · 카메라 단추 · 제목 · 범례 없음(기본). 이 그림에서 견주는 것은
  // 파면 사이 간격과 눈금 개수이고, 바깥 거리 눈금은 오독의 경로가 된다.

  messages: dopplerSourceVsObserverMessages,
};
