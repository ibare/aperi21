// ========================================================================
// beats-in-oscillation — 선언
// ========================================================================
// 질문: 진동수가 조금 다른 두 진동을 더하면 무엇이 되는가 — 그리고 두 진동수가
// 가까울수록 무엇이 달라지는가.
//
// 두 용수철 추를 가벼운 막대로 잇는다. 막대 가운데 점은 두 추 변위의 평균(합의
// 절반)을 그대로 따라간다. 두 추가 발맞추면 가운데 점이 크게 흔들리고, 정반대로
// 엇갈리면 두 끝이 시소처럼 움직이는 동안 가운데 점은 멈춘다. 그 흔들림을 기록지가
// 받아 적으면 진폭이 부풀었다 잦아드는 모양이 남는다.
//
// 같은 장치 두 벌을 위아래로 둔다. 아래 쌍은 두 진동수 차이가 위의 절반이고, 같은
// 시간 동안 위가 두 번 부풀 때 아래는 한 번 부푼다.
//
// 이웃 조각 `waves/beats` 는 소리 — 두 음의 파형과 슬라이더다. 이 조각은 역학
// 장치 위에서 「합이 부풀었다 잦아든다」 와 「차이가 작을수록 느리다」 를 한 화면에
// 나란히 둔다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:beats-in-oscillation` 와 문자 그대로 일치한다 (C4). */
export const BEATS_IN_OSCILLATION_ID = 'beats-in-oscillation';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 왼쪽 추의 진동수(Hz). 두 줄이 같다. 눈으로 흔들림을 셀 수 있게 느리게 둔다. */
export const F1 = 1.5;
/** 위 줄 두 추의 진동수 차이(Hz). 오른쪽 추는 F1 + DF_TOP 로 흔들린다. */
export const DF_TOP = 0.25;
/** 아래 줄 두 추의 진동수 차이(Hz). 정확히 위의 절반이다 — 이 조각이 바꾸는 유일한 수. */
export const DF_BOTTOM = DF_TOP / 2;
/** 추 하나의 진폭(월드 m). 네 추가 같다 — 다른 것은 진동수뿐이다. */
export const AMPLITUDE = 0.5;
/** 기록지가 담는 시간(초). 위 줄 부풂 두 번 반 · 아래 줄 한 번 남짓이 한 화면에 든다. */
export const WINDOW = 10;

/**
 * 한 주기(초) = 아래 줄이 한 번 부푸는 시간 1/DF_BOTTOM = 8 초.
 *
 * **8 초인 것은 우연이 아니다.** F1 · F1+DF_TOP · F1+DF_BOTTOM 이 8 초 동안 각각 12 · 14 · 13
 * 번을 정확히 떨어서, 주기 끝의 화면이 주기 첫머리와 같다. 시간표가 처음으로 돌아가도
 * 추가 튀지 않는다.
 */
export const PERIOD = 1 / DF_BOTTOM;
/**
 * 캡션 단계 하나의 길이 = 위 줄이 발맞춘 자리에서 엇갈린 자리까지 1/(2·DF_TOP) = 2 초.
 * 한 주기에 네 단계다. 단계 경계가 위 · 아래 줄의 마디(엇갈린 순간)와 봉우리에 맞는다.
 */
export const QUARTER = 1 / (2 * DF_TOP);

// ------------------------------------------------------------------------
// 배치 — 월드 미터. 장치가 오른쪽, 기록지가 왼쪽으로 흐른다.
// ------------------------------------------------------------------------

/** 위 줄 · 아래 줄 추의 평형 높이. */
export const ROW_TOP_Y = 2.25;
export const ROW_BOTTOM_Y = 0;
/** 두 추의 가로 자리(가운데 점에서 ±). 가운데 점이 x = 0, 곧 기록지의 「지금」 이다. */
export const MASS_X = 0.5;
/** 추 크기 [가로, 세로](m). 네 추가 같다. */
export const MASS_SIZE: readonly [number, number] = [0.42, 0.3];
/** 천장 높이(평형 높이 기준 m). 가장 눌린 순간에도 용수철이 0.4 m 남는다. */
export const CEILING_Y = 1.2;
/** 천장이 추 너머로 나가는 여유(m). */
export const CEILING_OVERHANG = 0.32;
/** 가운데 점의 반지름(m). */
export const PEN_RADIUS = 0.07;
/** 용수철 감은 수. */
export const SPRING_COILS = 7;

/** 기록지 가로 길이(월드). 가운데 점(x=0)에서 왼쪽으로 흘러 여기서 사라진다. */
export const TRACE_SPAN = 9.6;
/** 기록 한 초에 뜨는 점 수. 1.75 Hz 한 번 흔들림에 점 17개 남짓이라 곡선이 매끈하다. */
export const SAMPLES_PER_SECOND = 30;
/** 줄 이름표 높이(평형 높이 기준 m). 천장 위. */
export const ROW_LABEL_Y = 1.45;

/**
 * 프레이밍은 주장의 일부다. 가로는 기록지 끝부터 오른쪽 추 너머까지, 세로는 아래 추가
 * 가장 낮게 내려간 자리 밑 캡션 줄부터 위 줄 이름표까지. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -9.85, maxX: 1.05, minY: -1.15, maxY: 3.95 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const beatsInOscillationMessages = Object.freeze({
  'label.title': { ko: '진동의 맥놀이', en: 'Beats in oscillation' },
  'label.stage': { ko: '두 쌍의 용수철 추', en: 'Two pairs of spring masses' },
  'label.view': { ko: '장치와 기록지', en: 'Rig and chart' },
  /** 줄 이름표. Δf 는 기호라 번역하지 않지만 앞 낱말은 문안이다 (C1 경계). */
  'label.rowTop': { ko: '진동수 차이 Δf', en: 'frequency gap Δf' },
  'label.rowBottom': { ko: '진동수 차이 Δf/2', en: 'frequency gap Δf/2' },
  'caption.topFades': {
    ko: '위 쌍이 먼저 엇갈린다 — 위 가운데 점의 흔들림이 잦아든다',
    en: 'The upper pair falls out of step first — its midpoint’s swing dies down',
  },
  'caption.topReturns': {
    ko: '위 가운데 점은 다시 부풀고, 아래 가운데 점은 이제야 잦아든다',
    en: 'The upper midpoint swells again while the lower one is only now dying down',
  },
  'caption.bottomStill': {
    ko: '아래 쌍은 시소처럼 엇갈려 가운데 점이 멈췄다가 다시 부푼다 — 위는 벌써 두 번째로 잦아든다',
    en: 'The lower pair see-saws, its midpoint stalls, then swells again — the upper one is already dying down a second time',
  },
  'caption.bothReturn': {
    ko: '두 쌍이 함께 다시 발맞춰 간다 — 위가 두 번 부풀 동안 아래는 한 번 부푼다',
    en: 'Both pairs drift back into step — the upper swells twice while the lower swells once',
  },
} satisfies Record<string, LocalizedText>);

export type BeatsInOscillationMessageKey = keyof typeof beatsInOscillationMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: BeatsInOscillationMessageKey): LocalizedText => beatsInOscillationMessages[key];

/** 시간표가 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: BeatsInOscillationMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const beatsInOscillationSchema: BundleSchema = {
  id: BEATS_IN_OSCILLATION_ID,
  title: text('label.title'),
  category: 'oscillation',
  timeModel: 'periodic',

  // 조작기가 없다 — 비교할 두 차이가 처음부터 위아래로 나란히 놓여 있다.
  parameters: [],

  stages: [
    {
      id: 'two-pairs',
      label: text('label.stage'),
      constants: {
        f1: F1,
        dfTop: DF_TOP,
        dfBottom: DF_BOTTOM,
        amplitude: AMPLITUDE,
        window: WINDOW,
      },
    },
  ],

  environments: [],

  views: [{ id: 'rig', label: text('label.view'), default: true }],

  /**
   * 가로 11 m 를 담아야 하고 세로는 두 줄뿐이다. 세로를 더 주면 가로가 먼저 차서
   * 그림만 작아진다 (S-piece — 세로가 비싸다).
   */
  canvas: { height: 400, minHeight: 350 },

  /**
   * 겹침이 판정 장치다. 기록지의 선은 장치 **밑**을 지나야 한다 — 가운데 점에서 나온
   * 잉크가 왼쪽 추 뒤로 흘러 나가는 것으로 읽혀야 하고, 막대는 추 위에 얹혀야 두 추를
   * 잇는 것으로 보인다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 8 초를 2 초씩 넷으로 나눈다. 경계가 곧 사건이다 —
   * 2 초: 위 쌍이 엇갈림(위 가운데 점 멈춤) · 4 초: 위 다시 발맞춤, 아래 엇갈림 ·
   * 6 초: 위 두 번째 엇갈림 · 8 초: 둘 다 발맞춤.
   *
   * 단계 길이를 물리에서 끌어온다(`QUARTER`). 물리는 시각을 조각 시계 `t` 에서 바로
   * 읽으므로 단계를 늘여도 추가 튀지 않는다 — 다만 캡션과 사건이 어긋난다.
   */
  timeline: {
    phases: [
      { id: 'top-fades', duration: QUARTER, caption: key('caption.topFades') },
      { id: 'top-returns', duration: QUARTER, caption: key('caption.topReturns') },
      { id: 'bottom-still', duration: QUARTER, caption: key('caption.bottomStill') },
      { id: 'both-return', duration: QUARTER, caption: key('caption.bothReturn') },
    ],
  },

  /**
   * `startAt` 을 두지 않는다. 기록지의 잉크는 조각 시계의 함수라(과거 자리도 같은 식으로
   * 계산된다) 첫 프레임부터 10 초어치가 차 있고, 추도 이미 흔들리는 중이다. 시계 0 은
   * 두 쌍이 모두 발맞춰 가장 크게 흔들리는 자리라 여기서 여는 것이 가장 낫다.
   */

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 정의와 공식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것은 거리가 아니라 **부풂의 간격**이고,
   * 그것은 두 기록을 위아래로 견주는 것으로 읽힌다.
   */

  messages: beatsInOscillationMessages,
};
