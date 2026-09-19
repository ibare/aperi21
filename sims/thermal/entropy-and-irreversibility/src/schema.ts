// ========================================================================
// entropy-and-irreversibility — 선언
// ========================================================================
// 질문: 튀다 멈춘 공을 거꾸로 돌리면 왜 어색한가.
//
// 공이 알갱이로 된 바닥 위에서 튈 때마다 덜 높이 오르고, 부딪힌 자리 알갱이들의 떨림이
// 커져 바닥 전체로 번진다. 공이 멈추면 같은 장면을 거꾸로 돌린다 — 바닥 곳곳에 흩어져
// 있던 떨림이 공 밑 한 점으로 모여 공을 차 올리고, 공은 튈 때마다 더 높이 오른다.
// 동사: 흩어진 떨림이 한 점으로 모여 공을 띄운다(거꾸로).
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:entropy-and-irreversibility` 와 문자 그대로 일치한다 (C4). */
export const ENTROPY_AND_IRREVERSIBILITY_ID = 'entropy-and-irreversibility';

// ------------------------------------------------------------------------
// 배치 — 월드 단위(m). 바닥 윗면 가운데(공이 부딪히는 자리)가 원점, y 는 위가 양수.
// 물리량(중력 · 처음 높이 · 반발 계수 · 알갱이 격자 · 시드 · 떨림 배율 · 번짐)은
// 스테이지 상수다 (아래 `stages`).
// ------------------------------------------------------------------------

/**
 * 프레이밍. 기본 알갱이 격자(25 × 4, 간격 0.13 → 가로 ±1.56) · 공의 처음 높이(1 m + 반지름)와
 * 왼쪽 위 재생 표식, 아래 캡션 줄의 자리까지. 매 프레임 같은 값이다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: -1.75, maxX: 1.75, minY: -0.78, maxY: 1.26 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const entropyAndIrreversibilityMessages = Object.freeze({
  'label.title': { ko: '엔트로피와 비가역성', en: 'Entropy and irreversibility' },
  'label.operation': { ko: '되돌릴 수 없는 이유', en: 'Why it cannot be undone' },
  'label.stage': { ko: '알갱이 바닥 위의 공', en: 'Ball on a grainy floor' },
  'label.view': { ko: '정방향 · 거꾸로', en: 'Forward · reversed' },
  /** 재생 방향 표식 — 기호라 번역하지 않는다 (C1 판정 1). 글자 모양 선택자(U+FE0E)로 그림 글자가 되지 않게 한다. */
  'label.forward': { ko: '▶︎', en: '▶︎' },
  'label.reverse': { ko: '◀︎', en: '◀︎' },
  /** 처음 높이 점선의 표식 — 기호 (C1 판정 3). */
  'label.startHeight': { ko: 'h₀', en: 'h₀' },
  'caption.ready': {
    ko: '공을 놓기 직전. 바닥 알갱이들이 잔잔하게 떨고 있다.',
    en: 'Just before the ball is let go. The floor grains jiggle quietly.',
  },
  'caption.play': {
    ko: '공이 튈 때마다 덜 높이 오른다. 부딪힌 자리의 알갱이들이 세게 떨고, 그 떨림이 바닥 전체로 번진다.',
    en: 'Each bounce is lower than the last. Grains where it lands shake hard, and the shaking spreads through the floor.',
  },
  'caption.settle': {
    ko: '공이 멈췄다. 바닥 알갱이들이 처음보다 세게, 고르게 떤다.',
    en: 'The ball has stopped. The floor grains jiggle harder than before, all over.',
  },
  'caption.turn': {
    ko: '같은 장면을 거꾸로 돌린다.',
    en: 'Now the same scene runs backwards.',
  },
  'caption.rewindSettle': {
    ko: '멈춘 공 아래에서 바닥 곳곳의 알갱이들이 떨고 있다.',
    en: 'Under the resting ball, grains all over the floor are jiggling.',
  },
  'caption.rewindPlay': {
    ko: '흩어져 있던 떨림이 공 밑 한 점으로 모여 공을 차 올린다. 공은 튈 때마다 더 높이 오른다.',
    en: 'Shaking from all over the floor gathers under the ball and kicks it up. Each bounce is higher than the last.',
  },
  'caption.rewindReady': {
    ko: '공이 처음 높이에 멈춰 섰다. 바닥의 떨림은 처음처럼 잔잔하다.',
    en: 'The ball hangs still at its starting height. The floor jiggles quietly again.',
  },
  'caption.rewound': {
    ko: '처음 장면으로 돌아왔다. 재생 표식이 다시 정방향으로 바뀐다.',
    en: 'Back to the first frame. The marker turns back to forward.',
  },
} satisfies Record<string, LocalizedText>);

export type EntropyAndIrreversibilityMessageKey = keyof typeof entropyAndIrreversibilityMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: EntropyAndIrreversibilityMessageKey): LocalizedText =>
  entropyAndIrreversibilityMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: EntropyAndIrreversibilityMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const entropyAndIrreversibilitySchema: BundleSchema = {
  id: ENTROPY_AND_IRREVERSIBILITY_ID,
  label: text('label.title'),
  category: 'thermal',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 공이 떨어져 튀다 멈추고, 같은 장면이 거꾸로 돈다.
  parameters: [],

  /**
   * 공과 알갱이 바닥.
   *
   * - `gravity` 중력 가속도(m/s²) · `dropHeight` 공 아랫면의 처음 높이(m) · `restitution` 반발 계수 ·
   *   `ballRadius` 공 반지름(m).
   * - `grainCols` × `grainRows` 알갱이 격자, `grainSpacing` 알갱이 간격(m). 격자 윗줄이 바닥 윗면이다.
   * - `seed` 알갱이마다의 떨림 진동수 · 위상을 뽑는 난수 시드 (같은 시각 = 같은 화면).
   * - `jitterFreq` · `jitterFreqSpread` 떨림 각진동수의 가운데 값 · 퍼짐(rad/s).
   * - `baseJitter` 처음 바닥의 잔떨림 진폭(m), `heatJitter` 공의 처음 역학적 에너지를 알갱이 **하나가**
   *   다 받았을 때의 진폭(m). 둘 다 눈에 보이게 키운 **표시 배율**이다 — 실제 열운동은 보이지 않는다.
   * - `impactWidth` 부딪힌 순간 떨림이 모인 폭(m), `diffusivity` 그 떨림이 번지는 빠르기(m²/s).
   * - `heatShadeFull` 바닥 열 명암이 가득 차는 알갱이 하나의 몫(공의 처음 에너지에 대한 비) — 표시 배율.
   *   기본 0.04 에서 다 번진 뒤(몫 1/100)의 바닥은 4분의 1 짙기다.
   */
  stages: [
    {
      id: 'grainy-floor',
      label: text('label.stage'),
      constants: {
        gravity: 9.8,
        dropHeight: 1,
        restitution: 0.7,
        ballRadius: 0.1,
        grainCols: 25,
        grainRows: 4,
        grainSpacing: 0.13,
        seed: 7,
        jitterFreq: 22,
        jitterFreqSpread: 8,
        baseJitter: 0.004,
        heatJitter: 0.22,
        impactWidth: 0.07,
        diffusivity: 0.2,
        heatShadeFull: 0.04,
      },
    },
  ],

  environments: [],

  views: [{ id: 'forward-and-reversed', label: text('label.view'), default: true }],

  /** 가로로 넓은 바닥 위의 공 하나와 캡션 한두 줄. 세로가 비싸다 (S-piece). */
  canvas: { height: 360, minHeight: 320 },

  /** 바닥 열 명암이 알갱이 밑에, 공이 알갱이 위에 놓여야 한다. */
  drawOrder: 'scene',

  /**
   * 한 주기 — 정방향 세 단계(`ready` · `play` · `settle`), 뒤집기(`turn`), 그것을 거꾸로 되짚는
   * 세 단계(`rewind-settle` · `rewind-play` · `rewind-ready`), 되감김(`rewound`).
   *
   * 장면의 시각(필름 시각)은 정방향 단계의 진행도 × 길이를 더하고 거꾸로 단계의 진행도 × **짝 정방향
   * 단계의 길이**를 뺀 값이다 — 거꾸로 단계의 길이는 되감는 빠르기만 바꾼다. `turn` · `rewound` 에는
   * 필름이 멈추고 재생 표식만 바뀐다. `rewound` 가 끝나면 필름이 처음 장면에 있어 다음 주기의
   * `ready` 와 이어진다 — 주기 끝에 사라졌다 나타나는 단계가 없다.
   *
   * `play` · `rewind-play` 는 반으로 느리게 흐른다 — 튀는 동안 알갱이 떨림이 번지고 모이는 것을
   * 눈으로 따라가게. 공은 `play` 길이(물리 시간) 안에 멈춰야 한다 — 기본 상수에서 약 2.6 초다.
   */
  timeline: {
    phases: [
      { id: 'ready', duration: 1.2, caption: key('caption.ready') },
      { id: 'play', duration: 3, timeScale: 0.5, caption: key('caption.play') },
      { id: 'settle', duration: 2.2, caption: key('caption.settle') },
      { id: 'turn', duration: 1.2, ease: 'smooth', caption: key('caption.turn') },
      { id: 'rewind-settle', duration: 2.2, caption: key('caption.rewindSettle') },
      { id: 'rewind-play', duration: 3, timeScale: 0.5, caption: key('caption.rewindPlay') },
      { id: 'rewind-ready', duration: 1.2, caption: key('caption.rewindReady') },
      { id: 'rewound', duration: 1.2, ease: 'smooth', caption: key('caption.rewound') },
    ],
  },

  /** 도착한 순간 이미 바닥이 떨고 있고 공은 곧 떨어진다 — `ready` 한가운데서 연다. */
  startAt: 0.6,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 왜 어색한지는 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -6] },
    fontSize: 13,
    wrapWidth: 640,
    fade: 0.25,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  messages: entropyAndIrreversibilityMessages,
};
