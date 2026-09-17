// ========================================================================
// double-slit-with-electrons — 선언
// ========================================================================
// 질문: 전자를 한 번에 하나씩 보내면 화면에는 점 하나씩만 찍히는데, 간섭 줄무늬는 어디서 생기는가.
// 답의 동사: 쌓인다 — 각자 제멋대로인 점들이 쌓여 줄무늬가 된다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';
import {
  COUNT_RANDOM,
  COUNT_STRIPES,
  CYCLE_END,
  EMIT_END,
  FADE_START,
  H,
  SEED,
  START_AT,
  W,
  buildElectrons,
  timeOfCount,
} from './model';

/** 등록 키 `aperi21:double-slit-with-electrons` 와 문자 그대로 일치한다 (C4). */
export const DOUBLE_SLIT_WITH_ELECTRONS_ID = 'double-slit-with-electrons';

/**
 * 고정 경계. 원본 캔버스 860 × 316 전체에, 아래로 캡션 한 줄 자리를 더했다
 * (캡션 슬롯이 프레이밍 여백으로 잡히지 않는다 — 장부 G24).
 */
export const SCENE_BOUNDS = { minX: 0, maxX: W, minY: -34, maxY: H } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const doubleSlitWithElectronsMessages = Object.freeze({
  'label.title': { ko: '전자의 이중 슬릿', en: 'Double slit with electrons' },
  'label.operation': { ko: '하나씩 보내도 생기는 무늬', en: 'A pattern that forms one electron at a time' },
  'label.stage': { ko: '기본', en: 'Default' },
  'label.view': { ko: '기본', en: 'Default' },
  'label.source': { ko: '전자원', en: 'Electron source' },
  'label.slits': { ko: '이중 슬릿', en: 'Double slit' },
  /** 검출 화면 이름표와 누적 개수. 값이 끼어드는 조립문이라 문안이다 (C1). */
  'label.count': {
    ko: '검출 화면(정면) · 도착한 전자 {n}개',
    en: 'Detector screen (front) · {n} electrons arrived',
  },
  'caption.single': {
    ko: '전자가 한 번에 하나씩 날아가고, 화면에는 점 하나로 떨어진다',
    en: 'Electrons fly one at a time, and each lands on the screen as a single dot',
  },
  'caption.random': {
    ko: '점 하나하나가 떨어지는 자리는 제멋대로다',
    en: 'Where each single dot lands looks random',
  },
  'caption.stripes': {
    ko: '하나씩 떨어진 점이 쌓여 줄무늬가 된다',
    en: 'Dots that arrived one by one build up into stripes',
  },
} satisfies Record<string, LocalizedText>);

export type DoubleSlitWithElectronsMessageKey = keyof typeof doubleSlitWithElectronsMessages;

export const text = (key: DoubleSlitWithElectronsMessageKey): LocalizedText => doubleSlitWithElectronsMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: DoubleSlitWithElectronsMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// 시간표 — 도착 일정에서 단계 길이를 계산해 선언에 넣는다
// ------------------------------------------------------------------------

/**
 * 원본 캡션은 **누적 개수**로 갈렸다 (30개 미만 / 250개 미만 / 그 이상). 도착 일정이 결정적이라
 * 개수가 그 경계를 넘는 시각도 정해져 있다 — 30번째 · 250번째 전자의 도착 시각을 단계 경계로 둔다.
 * 그래서 어느 시각으로 열어도 문장과 화면의 점 수가 맞는다. 일정을 바꾸면 이 값도 함께 바뀐다
 * (같은 함수에서 나온다). NOTES 「어휘 부족」.
 */
const ELECTRONS = buildElectrons(SEED);
const T_RANDOM = timeOfCount(ELECTRONS, COUNT_RANDOM);
const T_STRIPES = timeOfCount(ELECTRONS, COUNT_STRIPES);

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const doubleSlitWithElectronsSchema: BundleSchema = {
  id: DOUBLE_SLIT_WITH_ELECTRONS_ID,
  label: text('label.title'),
  category: 'modern',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다. 누르지 않아도 점이 쌓여 무늬가 된다.
  parameters: [],
  stages: [{ id: 'default', label: text('label.stage'), constants: {} }],
  environments: [],
  views: [{ id: 'default', label: text('label.view'), default: true }],

  /** 원본은 860 × 316 캔버스 + 아래 캡션 한 줄이었다. 가로로 넓고 세로로 좁다. */
  canvas: { height: 380, minHeight: 340 },

  /**
   * 원본 그리기 순서 그대로 — 검출 화면 → 파동 → 전자원 → 슬릿 벽 → 쌓인 점 → 방금 도착한 전자 →
   * 막대 → 이름표. 파동 장(`scalarField`)은 불투명 이미지라 벽보다 먼저 깔려야 한다.
   */
  drawOrder: 'scene',

  /** 도착한 순간 이미 점 3개가 떨어져 있고 네 번째 전자의 파동이 퍼지는 중이다. */
  startAt: START_AT,

  /**
   * 한 주기 31.5 초 — 전자를 보내는 26 초(개수 단계 셋), 완성된 무늬를 머무는 4 초, 점이 사라지는 1.5 초.
   * scene 은 `timeline.u` 로 도착 개수를 세고 `at('fade')` 로 점을 흐린다.
   */
  timeline: {
    phases: [
      { id: 'single', duration: T_RANDOM, caption: key('caption.single') },
      { id: 'random', duration: T_STRIPES - T_RANDOM, caption: key('caption.random') },
      { id: 'stripes', duration: EMIT_END - T_STRIPES, caption: key('caption.stripes') },
      { id: 'hold', duration: FADE_START - EMIT_END, caption: key('caption.stripes') },
      { id: 'fade', duration: CYCLE_END - FADE_START, caption: key('caption.stripes') },
    ],
  },

  /** 원본 캡션은 캔버스 아래 왼쪽 정렬 한 줄, 바로 바뀐다. */
  caption: {
    anchor: { screen: 'bottom-left', offset: [0, -2] },
    align: 'left',
    fontSize: 16,
    style: { colorRole: 'ink', emphasis: 'medium' },
    fade: 0,
  },

  /**
   * 그리드도 카메라 버튼도 없다 (기본값). 축 · 눈금(위치 값 자체는 주장과 무관), 이론 곡선(답을
   * 미리 보여 주면 쌓임이 가짜처럼 보인다), 전자가 어느 슬릿을 지났는지(모형에 없는 값)는 두지 않는다.
   */

  messages: doubleSlitWithElectronsMessages,
};
