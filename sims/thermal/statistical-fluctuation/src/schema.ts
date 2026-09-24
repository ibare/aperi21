// ========================================================================
// statistical-fluctuation — 선언
// ========================================================================
// 질문: 고르게 섞인 기체도 흔들리는가, 얼마나 흔들리는가.
//
// 입자 수만 다른 상자 셋(적은 · 중간 · 많은)이 나란히 있다. 입자는 이미 고르게 퍼져
// 움직이고, 오른쪽 한 축 그래프가 상자마다 가운데 점선 왼쪽에 든 몫을 시간에 따라
// 긋는다. 입자가 적은 상자의 곡선은 50% 선 위아래로 크게 널뛰고, 많은 상자의 곡선은
// 50% 선에 거의 붙어 있다. 동사: 널뛴다 / 붙어 있다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:statistical-fluctuation` 와 문자 그대로 일치한다 (C4). */
export const STATISTICAL_FLUCTUATION_ID = 'statistical-fluctuation';

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 맨 아래 상자의 왼쪽 아래 모서리가 원점, y 는 위가 양수.
// 물리량(입자 수 셋 · 시드 · 상자 크기 · 속력 척도)은 스테이지 상수다 (아래 `stages`).
// ------------------------------------------------------------------------

/** 세로로 쌓은 상자 사이 틈(월드). 틈에 이름표가 끼지 않게 상자 왼쪽에 붙인다. */
export const BOX_GAP = 0.3;

/**
 * 오른쪽 그래프 — 상자마다 왼쪽 칸에 든 몫의 시간 이력. 가로는 `draw` 단계 시작부터
 * `compare` 단계 끝까지(시간표에서 읽는다), 세로는 0% 에서 100% 까지.
 */
export const GRAPH = {
  /** 축 원점(월드). 상자 오른쪽에 둔다. */
  origin: [1.8, 0] as readonly [number, number],
  /** 가로 길이(월드). */
  width: 4.0,
  /**
   * 100% 의 높이(월드). 쌓은 상자 셋의 높이(3 × 0.62 + 2 × 0.3)와 같다 — 기본 상자
   * 크기에 맞춘 고정값이다 (원칙 6, NOTES (b)).
   */
  height: 2.46,
  /** 곡선 표본 간격(초). */
  sampleSeconds: 0.1,
} as const;

/**
 * 프레이밍. 왼쪽 상자 이름표(−0.8) · 상자(0~1.2) · 그래프(1.8~5.8) · 곡선 머리 이름표 자리,
 * 위로는 세로축 이름 줄, 아래로는 시간 축 이름과 캡션 줄의 자리까지. 매 프레임 같은 값이다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: -0.8, maxX: 6.85, minY: -0.62, maxY: 2.78 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const statisticalFluctuationMessages = Object.freeze({
  'label.title': { ko: '요동', en: 'Statistical fluctuation' },
  'label.stage': { ko: '입자 수가 다른 상자 셋', en: 'Three boxes, three particle counts' },
  'label.view': { ko: '상자와 왼쪽 칸의 몫', en: 'Boxes and left-half share' },
  /** 상자 · 곡선의 입자 수 표식. 기호 + 값이라 두 언어가 같다. */
  'label.n': { ko: 'N = {n}', en: 'N = {n}' },
  /** 그래프 세로축 이름. */
  'label.axisShare': { ko: '왼쪽 칸에 든 몫', en: 'Share in the left half' },
  /** 그래프 가로축 이름. */
  'label.axisTime': { ko: '시간', en: 'time' },
  /** 세로 눈금 표식 — % 는 축 눈금에만 쓴다 (지금 값 글자는 띄우지 않는다). */
  'label.tick0': { ko: '0%', en: '0%' },
  'label.tick50': { ko: '50%', en: '50%' },
  'label.tick100': { ko: '100%', en: '100%' },
  'caption.draw': {
    ko: '세 상자에서 입자 {a}개 · {b}개 · {c}개가 고르게 퍼져 움직인다. 그래프는 상자마다 가운데 점선 왼쪽에 든 몫을 긋는다.',
    en: 'In three boxes, {a}, {b} and {c} particles move about, evenly spread. The graph traces, for each box, the share left of the dashed midline.',
  },
  'caption.compare': {
    ko: 'N = {a} 곡선은 50% 선 위아래로 크게 널뛰고, N = {c} 곡선은 50% 선에 거의 붙어 있다.',
    en: 'The N = {a} curve leaps far above and below the 50% line; the N = {c} curve stays almost on it.',
  },
} satisfies Record<string, LocalizedText>);

export type StatisticalFluctuationMessageKey = keyof typeof statisticalFluctuationMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: StatisticalFluctuationMessageKey): LocalizedText => statisticalFluctuationMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: StatisticalFluctuationMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const statisticalFluctuationSchema: BundleSchema = {
  id: STATISTICAL_FLUCTUATION_ID,
  title: text('label.title'),
  category: 'thermal',
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 세 상자가 움직이고 곡선 셋이 자란다.
  parameters: [],

  /**
   * 기체 셋과 상자. `count1` · `count2` · `count3` 은 위 · 가운데 · 아래 상자의 입자 수 N,
   * `seed` 는 처음 자리 · 속도를 뽑는 난수 시드(상자마다 `seed + 순번`, 같은 시각 = 같은 화면),
   * `boxWidth` · `boxHeight` 는 상자 하나의 크기(월드), `speedScale` 은 속도 성분의
   * 표준편차(월드/초)다. 시드 2 · 척도 0.5 에서 `compare` 단계 동안 N = 10 곡선은 10% 와
   * 80% 를 모두 찍고, N = 1000 곡선은 47~52% 안에 머문다 (NOTES (b) 캡션 참 보장).
   * 시드를 바꾸면 캡션이 여전히 참인지 촬영으로 다시 본다.
   */
  stages: [
    {
      id: 'three-boxes',
      label: text('label.stage'),
      constants: {
        count1: 10,
        count2: 100,
        count3: 1000,
        seed: 2,
        boxWidth: 1.2,
        boxHeight: 0.62,
        speedScale: 0.5,
      },
    },
  ],

  environments: [],

  views: [{ id: 'boxes-and-share', label: text('label.view'), default: true }],

  /** 가로로 넓은 그림(상자 기둥 + 그래프)에 캡션 한두 줄. 세로가 비싸다 (S-piece). */
  canvas: { height: 380, minHeight: 340 },

  /** 지금 점은 곡선 위에, 곡선은 50% 선 위에 얹혀야 한다. */
  drawOrder: 'scene',

  /**
   * 한 주기 — 나타남 · 긋기 · 견주기 · 흐려짐.
   *
   * 입자는 처음부터 고르게 퍼져 있다 — 퍼지는 과정은 이웃 `second-law-of-thermodynamics` 의
   * 몫이다. `draw` 동안 곡선 셋이 자라기 시작하고, `compare` 동안 흔들림의 크기 차이가 쌓인다.
   * `compare` 가 가장 길다: 「널뛴다 / 붙어 있다」 는 쌓인 곡선의 폭으로 보인다.
   */
  timeline: {
    phases: [
      { id: 'appear', duration: 0.4, caption: key('caption.draw') },
      { id: 'draw', duration: 4, caption: key('caption.draw') },
      { id: 'compare', duration: 9, caption: key('caption.compare') },
      { id: 'fade', duration: 0.8, caption: key('caption.compare') },
    ],
  },

  /** 도착한 순간 이미 입자가 움직이고 곡선 셋이 2 초쯤 자라 있다. */
  startAt: 2.4,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 1/√N 과 확률은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -6] },
    fontSize: 13,
    wrapWidth: 720,
    style: { colorRole: 'muted', emphasis: 'strong' },
    vars: { a: 'countText1', b: 'countText2', c: 'countText3' },
  },

  messages: statisticalFluctuationMessages,
};
