// ========================================================================
// work-by-variable-force — 선언
// ========================================================================
// 질문: 힘이 자리마다 다르면 「힘 × 거리」 의 힘은 어느 값인가.
//
// 하나를 고르지 않는다. 상자가 조금 갈 때마다 **그 자리의 힘 × 그 조금** 을 띠
// 하나로 쌓는다. 힘-변위 그래프를 상자 바로 아래에 같은 x 축으로 놓으면, 띠는
// 상자가 지나간 자리에 쌓이고 쌓인 것 전체가 곡선 아래 넓이가 된다. 같은 빠르기로
// 가도 힘이 센 곳에서 넓이가 빨리 쌓인다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:work-by-variable-force` 와 문자 그대로 일치한다 (C4). */
export const WORK_BY_VARIABLE_FORCE_ID = 'work-by-variable-force';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 상자가 밀려 가는 거리(월드 m). 그래프의 x 축 길이이기도 하다 — 둘은 같은 축이다. */
export const PUSH_LENGTH = 6;
/**
 * 미는 힘의 모양 — F(x) = 바닥 + 봉우리 × sin(πx/L). 처음엔 약하게, 가운데서 가장 세게,
 * 끝에서 다시 약하게 민다. 곧은 선이 아니어야 「힘 × 거리」 한 번으로 답할 수 없다.
 * 값은 그래프 높이(월드 m)로 바로 쓴다 — 힘 화살표 길이와 기둥 높이가 같은 수다.
 */
export const FORCE_BASE = 0.3;
export const FORCE_PEAK = 1.5;
/** 띠 폭 Δx(월드 m). 12 칸 — 칸마다 높이 차이가 눈에 보일 만큼 좁고, 셀 수 있을 만큼 넓다. */
export const STRIP_WIDTH = 0.5;

// ------------------------------------------------------------------------
// 배치 — 월드 미터. 위에 트랙, 아래에 같은 x 축의 그래프.
// ------------------------------------------------------------------------

/** 상자가 미끄러지는 바닥 높이. 그래프 꼭대기(1.8)와 축 이름 위로 띄운다. */
export const TRACK_Y = 2.6;
/** 상자 크기 [가로, 세로](m). */
export const BOX_SIZE: readonly [number, number] = [0.5, 0.4];
/** 힘 화살표의 머리 크기(월드 m). 가장 약한 힘(0.3)에서도 머리가 몸통을 다 먹지 않는다. */
export const ARROW_HEAD = 0.16;
/** 세로축 끝 높이 · 가로축 끝 자리(월드 m). 곡선 꼭대기와 트랙 끝을 조금 넘는다. */
export const F_AXIS_TOP = 2.15;
export const X_AXIS_END = PUSH_LENGTH + 0.45;

/**
 * 프레이밍은 주장의 일부다. 가로는 출발 자리의 힘 화살표 꼬리(−0.55)와 세로축 이름부터
 * 트랙 끝 너머 가로축 이름까지, 세로는 캡션 줄부터 상자 위 힘 이름표까지. 매 프레임 같다.
 */
export const SCENE_BOUNDS = { minX: -1.0, maxX: 7.0, minY: -0.75, maxY: 3.35 } as const;

// ------------------------------------------------------------------------
// 시간표
// ------------------------------------------------------------------------

/**
 * 반 구간씩 미는 동안(초). 두 단계가 같은 길이·`linear` 라 상자는 한 빠르기로 간다 —
 * 빠르기가 같아야 「넓이가 빨리 쌓인다」 가 힘 탓으로만 읽힌다.
 */
export const PUSH_HALF = 3.2;
/** 다 쌓인 넓이를 읽는 동안 · 다음 주기로 넘어가며 흐려지는 동안. */
export const HOLD = 3.2;
export const FADE = 0.6;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const workByVariableForceMessages = Object.freeze({
  'label.title': { ko: '변하는 힘이 한 일', en: 'Work done by a varying force' },
  'label.operation': { ko: '힘-변위 그래프의 넓이', en: 'The area under the force–displacement graph' },
  'label.stage': { ko: '올랐다 내리는 힘', en: 'A force that rises and falls' },
  'label.view': { ko: '트랙과 그래프', en: 'Track and graph' },
  /** 힘 · 축 · 일 기호. 수식 표기라 번역 대상이 아니다 (C1 판정 3). */
  'label.force': { ko: 'F', en: 'F' },
  'label.axisX': { ko: 'x', en: 'x' },
  'label.axisF': { ko: 'F', en: 'F' },
  'label.work': { ko: 'W', en: 'W' },
  'caption.rise': {
    ko: '조금 갈 때마다 그 자리의 힘 × 그 거리만큼 띠가 하나씩 쌓인다',
    en: 'Each small step adds a strip: the force at that spot × the step',
  },
  'caption.fall': {
    ko: '같은 빠르기로 가도 힘이 약한 곳에서는 넓이가 느리게 쌓인다',
    en: 'At the same pace, the area grows slowly where the force is weak',
  },
  'caption.total': {
    ko: '띠가 모두 모여 곡선 아래를 채웠다 — 이 넓이 W 가 미는 힘이 한 일 전부다',
    en: 'The strips now fill the whole area under the curve — this area W is all the work the push did',
  },
} satisfies Record<string, LocalizedText>);

export type WorkByVariableForceMessageKey = keyof typeof workByVariableForceMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: WorkByVariableForceMessageKey): LocalizedText => workByVariableForceMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: WorkByVariableForceMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const workByVariableForceSchema: BundleSchema = {
  id: WORK_BY_VARIABLE_FORCE_ID,
  label: text('label.title'),
  category: 'mechanics',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 상자가 밀려 가고 그 아래 넓이가 쌓인다.
  parameters: [],

  stages: [
    {
      id: 'rise-and-fall',
      label: text('label.stage'),
      constants: {
        length: PUSH_LENGTH,
        forceBase: FORCE_BASE,
        forcePeak: FORCE_PEAK,
        strip: STRIP_WIDTH,
      },
    },
  ],

  environments: [],

  views: [{ id: 'track-graph', label: text('label.view'), default: true }],

  /**
   * 가로 8 m 에 세로 4.1 m. 트랙과 그래프를 위아래로 쌓으니 세로가 조금 더 든다 —
   * 그래도 캡션 한 줄까지 담는 데 400 이면 된다 (S-piece — 세로가 비싸다).
   */
  canvas: { height: 400, minHeight: 352 },

  /**
   * 겹침이 판정 장치다. 쌓인 넓이는 곡선 **아래** 로 깔려야 곡선이 넓이의 윗변으로
   * 읽히고, 띠 경계선은 넓이 위에 그어져야 칸이 보인다. 층 순서로는 `region` 이
   * 선 위로 올라와 곡선을 덮는다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 앞 절반 밀기(힘이 세진다) → 뒤 절반 밀기(힘이 약해진다) → 다 쌓인 넓이 →
   * 흐려짐. 캡션은 단계마다 하나다. 상자 자리는 두 밀기 단계의 진행도 합으로 읽는다 —
   * 경계 시각을 코드에 두지 않는다 (원칙 2).
   */
  timeline: {
    phases: [
      { id: 'push-rise', duration: PUSH_HALF, caption: key('caption.rise') },
      { id: 'push-fall', duration: PUSH_HALF, caption: key('caption.fall') },
      { id: 'hold', duration: HOLD, caption: key('caption.total') },
      { id: 'fade', duration: FADE, caption: key('caption.total') },
    ],
  },

  /**
   * 도착한 순간 이미 진행 중이다 — 상자가 두 칸쯤 밀려 가 그 아래 띠 몇 개가 이미 쌓인
   * 자리에서 연다. 0 이면 빈 그래프가 먼저 보인다.
   */
  startAt: 1.2,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 정의와 공식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것은 임의의 거리가 아니라 **띠** 다 — 띠 경계가
   * 곧 이 그림의 눈금이다. 거리 격자를 깔면 「몇 줄 넓이인가」 라는 다른 질문이 끼어든다.
   */

  messages: workByVariableForceMessages,
};
