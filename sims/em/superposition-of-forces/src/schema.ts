// ========================================================================
// superposition-of-forces — 선언
// ========================================================================
// 질문: 전하 여럿이 한 전하를 동시에 밀고 당기면, 그 전하가 받는 힘은 무엇인가.
//
// 답: 각 전하가 주는 힘 화살표를 따로 그린 뒤 **머리에 꼬리를 이어 붙이면**, 처음
// 꼬리에서 마지막 머리까지가 그 전하가 받는 힘 하나다. 원천 전하 셋(+ · + · −)이
// 가운데 +전하에 주는 화살표 F₁ · F₂ · F₃ 을 먼저 따로 보이고, F₂ · F₃ 을 방향 · 길이
// 그대로 옮겨 이어 붙인 뒤 합력 F 를 긋는다. 이어서 q₂ 하나를 옮기면 F₂ 만 바뀌고
// F₃ 은 모양 그대로 따라 옮겨 가며 합력의 머리가 함께 움직인다.
//
// 이 조각은 합에만 머문다. 거리에 따른 크기(coulombs-law) · 전기장(electric-field) ·
// 전기력선(field-lines)은 하지 않는다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:superposition-of-forces` 와 문자 그대로 일치한다 (C4). */
export const SUPERPOSITION_OF_FORCES_ID = 'superposition-of-forces';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 월드 1 단위 = 1 m. 가운데 시험 전하는 원점에 고정.
// ------------------------------------------------------------------------

/** 쿨롱 상수(N·m²/C²). */
export const COULOMB_K = 8.99e9;
/** 가운데 시험 전하(μC). */
export const Q_TEST_MICRO_C = 1;
/** 원천 전하 셋(μC). 부호가 곧 밀기(+) · 당기기(−)다. */
export const Q1_MICRO_C = 1;
export const Q2_MICRO_C = 1;
export const Q3_MICRO_C = -1;
/** 원천 전하의 자리(m). */
export const Q1_POS = [-0.42, 0.18] as const;
export const Q2_POS = [-0.38, -0.24] as const;
export const Q3_POS = [-0.1, 0.42] as const;
/** `move` 단계에서 q₂ 가 옮겨 가는 자리(m). */
export const Q2_MOVED_POS = [0.02, -0.45] as const;
/**
 * 표시 배율 — 힘 1 N 을 화살표 몇 m 로 그리는가(m/N). 약 0.04 N 인 힘이 0.26 m 쯤으로
 * 그려진다. 모든 화살표가 같은 배율이라 이어 붙인 길이가 곧 힘의 합이다. 원천이
 * 시험 전하에 가까워지는 일이 없어 길이 상한을 두지 않는다.
 */
export const ARROW_SCALE = 6;

// ------------------------------------------------------------------------
// 배치
// ------------------------------------------------------------------------

/** 전하 공의 반지름(m). 그림의 크기이지 물리량이 아니다 — 점전하로 푼다. */
export const CHARGE_RADIUS = 0.035;

/**
 * 프레이밍 — 왼쪽 q₁ 이름표부터 이어 붙인 화살표의 가장 먼 머리(F₂ 머리, x ≈ 0.46)까지,
 * 위 q₃ 이름표부터 옮겨 간 q₂ 의 이름표 · 캡션 띠까지. 매 프레임 같은 값이다 (S-piece).
 */
export const SCENE_BOUNDS = { minX: -0.62, maxX: 0.66, minY: -0.74, maxY: 0.56 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const superpositionOfForcesMessages = Object.freeze({
  'label.title': { ko: '전기력의 중첩', en: 'Superposition of electric forces' },
  'label.operation': { ko: '여러 전하가 주는 힘의 합', en: 'Adding the forces from several charges' },
  'label.stage': { ko: '원천 셋', en: 'Three source charges' },
  'label.view': { ko: '이어 붙이기', en: 'Head to tail' },

  /** 전하 부호 표식. 기호라 번역 대상이 아니다 (C1 판정 3). */
  'mark.plus': { ko: '+', en: '+' },
  'mark.minus': { ko: '−', en: '−' },
  /** 원천 · 힘 표식. 수식 기호라 번역 대상이 아니다. 아래 첨자는 캡션의 `q₂` · `F₂` 와 같은 글자다. */
  'mark.q1': { ko: 'q₁', en: 'q₁' },
  'mark.q2': { ko: 'q₂', en: 'q₂' },
  'mark.q3': { ko: 'q₃', en: 'q₃' },
  'mark.f1': { ko: 'F₁', en: 'F₁' },
  'mark.f2': { ko: 'F₂', en: 'F₂' },
  'mark.f3': { ko: 'F₃', en: 'F₃' },
  'mark.net': { ko: 'F', en: 'F' },

  'caption.separate': {
    ko: '세 전하가 가운데 전하를 저마다 밀고 당긴다 — 힘 화살표가 셋이다',
    en: 'Each of the three charges pushes or pulls the middle charge — three force arrows',
  },
  'caption.chain': {
    ko: '화살표를 방향 · 길이 그대로 옮겨, 앞 화살표의 머리에 꼬리를 잇는다',
    en: 'Each arrow is moved without turning or stretching, its tail set on the previous head',
  },
  'caption.sum': {
    ko: '처음 꼬리에서 마지막 머리까지 — 가운데 전하가 받는 힘은 이 화살표 하나다',
    en: 'From the first tail to the last head — this one arrow is the force on the middle charge',
  },
  'caption.move': {
    ko: 'q₂ 를 옮긴다 — F₂ 만 바뀌고, 이어 붙인 F₃ 과 합력의 머리가 따라간다',
    en: 'q₂ moves — only F₂ changes, and F₃ and the head of the total ride along',
  },
  'caption.moved': {
    ko: 'F₁ · F₃ 은 그대로다 — 합력은 바뀐 F₂ 만큼 옮겨 갔다 (점선이 옮기기 전)',
    en: 'F₁ and F₃ are unchanged — the total shifted by exactly the change in F₂ (dashed: before)',
  },
} satisfies Record<string, LocalizedText>);

export type SuperpositionOfForcesMessageKey = keyof typeof superpositionOfForcesMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: SuperpositionOfForcesMessageKey): LocalizedText => superpositionOfForcesMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: SuperpositionOfForcesMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const superpositionOfForcesSchema: BundleSchema = {
  id: SUPERPOSITION_OF_FORCES_ID,
  label: text('label.title'),
  category: 'em',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 화살표가 이어 붙고, 원천 하나가 옮겨 가는 것까지 한 주기에 끝난다.
  parameters: [],

  stages: [
    {
      id: 'three-sources',
      label: text('label.stage'),
      constants: {
        k: COULOMB_K,
        qTestMicroC: Q_TEST_MICRO_C,
        q1MicroC: Q1_MICRO_C,
        q2MicroC: Q2_MICRO_C,
        q3MicroC: Q3_MICRO_C,
        q1X: Q1_POS[0],
        q1Y: Q1_POS[1],
        q2X: Q2_POS[0],
        q2Y: Q2_POS[1],
        q3X: Q3_POS[0],
        q3Y: Q3_POS[1],
        q2MovedX: Q2_MOVED_POS[0],
        q2MovedY: Q2_MOVED_POS[1],
        arrowScale: ARROW_SCALE,
      },
    },
  ],

  environments: [],

  views: [{ id: 'head-to-tail', label: text('label.view'), default: true }],

  canvas: { height: 380, minHeight: 320 },

  /**
   * 한 주기.
   *
   * - `appear` — 전하와 화살표 셋이 떠오른다. 앞 주기의 흐려짐에서 잇는다.
   * - `separate` — 세 화살표의 꼬리가 모두 가운데 전하에 있다.
   * - `slide-2` — F₂ 가 방향 · 길이 그대로 F₁ 의 머리로 옮겨 간다.
   * - `slide-3` — F₃ 이 F₂ 의 머리로 옮겨 간다.
   * - `sum` — 처음 꼬리에서 마지막 머리까지 합력 F 가 자란다.
   * - `hold-sum` — 이어 붙인 세 화살표와 합력을 읽는다.
   * - `move` — q₂ 가 옮겨 간다. F₂ 가 바뀌고 F₃ · 합력의 머리가 따라온다.
   * - `hold-moved` · `fade` — 옮기기 전 합력(점선)과 견준다.
   */
  timeline: {
    phases: [
      { id: 'appear', duration: 0.5, caption: key('caption.separate') },
      { id: 'separate', duration: 2.4, caption: key('caption.separate') },
      { id: 'slide-2', duration: 1.6, ease: 'inOutCubic', caption: key('caption.chain') },
      { id: 'slide-3', duration: 1.6, ease: 'inOutCubic', caption: key('caption.chain') },
      { id: 'sum', duration: 1.2, ease: 'inOutCubic', caption: key('caption.sum') },
      { id: 'hold-sum', duration: 2.2, caption: key('caption.sum') },
      { id: 'move', duration: 2.6, ease: 'inOutCubic', caption: key('caption.move') },
      { id: 'hold-moved', duration: 3.2, caption: key('caption.moved') },
      { id: 'fade', duration: 0.6, caption: key('caption.moved') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — 화살표 셋이 다 떠 있고 곧 이어 붙기 시작하는 자리에서 연다. */
  startAt: 1.6,

  /** 슬롯 하나. 단계마다 지금 화면에서 벌어지는 일만 말한다 — 식은 문단의 몫이다. */
  caption: {
    anchor: { screen: 'bottom-left', offset: [18, -4] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 820,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  // 그리드 · 카메라 단추 · 제목 · 범례 없음(기본). 잴 것은 미터가 아니라 화살표를
  // 이어 붙인 모양이라, 거리 격자는 다른 질문을 끼워 넣는다 (S-piece).

  messages: superpositionOfForcesMessages,
};
