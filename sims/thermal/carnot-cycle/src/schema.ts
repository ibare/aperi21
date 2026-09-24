// ========================================================================
// carnot-cycle — 선언
// ========================================================================
// 질문: 마찰도 새는 것도 없는 이상 기관인데, 왜 받은 열을 전부 일로 바꾸지 못하는가.
//
// 온도-엔트로피 도표에서 열은 면적이다. 받은 열은 0 K 바닥부터 쌓여 있고, 차가운 쪽
// 온도 아래 깔린 몫은 순환을 닫으려면 반드시 빠져나간다. 동사: 빠져나간다.
//
// 원본: tasks/piece-lab/carnot-cycle (자유 구현).
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:carnot-cycle` 와 문자 그대로 일치한다 (C4). */
export const CARNOT_CYCLE_ID = 'carnot-cycle';

// ------------------------------------------------------------------------
// 배치 — 월드 한 단위 = 원본 캔버스(868 × 300 px) 의 한 픽셀, y 는 위가 양수
// ------------------------------------------------------------------------
//
// 원본 상수를 그대로 옮겼다. 원본 화면 y 를 `CANVAS_H − y` 로 뒤집었다.
//   padL 130 · padR 24 · top 16 · floorY = H − 30
//   plotW = W − padL − padR = 714, x1 = padL + 0.10·plotW, x2 = padL + 0.80·plotW

const CANVAS_W = 868;
const CANVAS_H = 300;
const PAD_L = 130;
const PAD_R = 24;
const PLOT_W = CANVAS_W - PAD_L - PAD_R;

export const PLOT = {
  /** 온도 축의 x (원본 padL). */
  axisX: PAD_L,
  /** 바닥 · 온도선의 오른쪽 끝 (원본 W − padR). */
  right: CANVAS_W - PAD_R,
  /** 0 K 바닥의 높이 (원본 floorY = H − 30). */
  floor: 30,
  /** 도표 위쪽 끝 (원본 top = 16). */
  top: CANVAS_H - 16,
  /** 순환의 작은 엔트로피 쪽 (원본 x1). */
  x1: PAD_L + PLOT_W * 0.1,
  /** 순환의 큰 엔트로피 쪽 (원본 x2). */
  x2: PAD_L + PLOT_W * 0.8,
  /** 빠져나가는 기둥 간격 (원본 step 3 px). */
  columnStep: 3,
  /** 기둥이 가라앉아 바닥을 완전히 지나는 여유 (원본 colH + 4). */
  sinkOvershoot: 4,
} as const;

/** 차가운 쪽 온도 조작 범위(K). 5 K 단위라 백분율이 언제나 정수다 (뜨거운 쪽 500 K). */
export const TC_RANGE: [number, number] = [50, 450];
export const TC_STEP = 5;

/**
 * 프레이밍. 원본 캔버스(왼쪽 빈 여백 24 px 은 뺀다)에 아래로 조작기 줄 몫을 조금 더 잡는다.
 * 러너가 조작기 여백을 뷰포트 가운데 기준으로 위아래 모두에서 빼므로, 줄 높이 전부를 더하면
 * 그림이 원본의 0.84 배로 준다. 캡션이 「엔트로피 →」 에 닿지 않는 만큼만 더했다.
 */
export const SCENE_BOUNDS = { minX: 24, maxX: CANVAS_W, minY: -30, maxY: CANVAS_H } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const carnotCycleMessages = Object.freeze({
  'label.title': { ko: '카르노 순환', en: 'Carnot cycle' },
  'label.operation': { ko: '이론적 최대 효율', en: 'The theoretical maximum efficiency' },
  'label.stage': { ko: '이상 기관', en: 'Ideal engine' },
  'label.view': { ko: '온도-엔트로피 도표', en: 'Temperature–entropy diagram' },
  'label.floor': { ko: '0 K 절대 영도', en: '0 K absolute zero' },
  'label.temperature': { ko: '온도', en: 'Temperature' },
  'label.entropy': { ko: '엔트로피 →', en: 'Entropy →' },
  'label.hot': { ko: '뜨거운 쪽 {t} K', en: 'Hot side {t} K' },
  'label.cold': { ko: '차가운 쪽 {t} K', en: 'Cold side {t} K' },
  'label.work': { ko: '일 {n}%', en: 'Work {n}%' },
  'label.discard': { ko: '빠져나간 열 {n}%', en: 'Heat out {n}%' },
  'label.coldControl': { ko: '차가운 쪽 온도', en: 'Cold side temperature' },
  'caption.hot': {
    ko: '{th} K 에서 열을 받는다 — 받은 열은 0 K 바닥부터 {th} K 까지 채워진다',
    en: 'Taking in heat at {th} K — it fills from the 0 K floor up to {th} K',
  },
  'caption.expand': {
    ko: '열 출입 없이 팽창하며 {th} K 에서 {tc} K 로 식는다',
    en: 'Expanding with no heat in or out, cooling from {th} K to {tc} K',
  },
  'caption.cold': {
    ko: '{tc} K 에서 열을 내놓는다 — {tc} K 아래 깔린 몫이 바닥으로 빠져나간다',
    en: 'Giving off heat at {tc} K — the share below {tc} K drains through the floor',
  },
  'caption.compress': {
    ko: '열 출입 없이 압축되며 {tc} K 에서 {th} K 로 돌아간다',
    en: 'Compressed with no heat in or out, returning from {tc} K to {th} K',
  },
  'caption.result': {
    ko: '받은 열 중 {tc} K 아래 {discard}% 는 빠져나가고, 그 위 {work}% 만 일로 남는다',
    en: 'The {discard}% of the heat below {tc} K drains out; only {work}% is left as work',
  },
} satisfies Record<string, LocalizedText>);

export type CarnotCycleMessageKey = keyof typeof carnotCycleMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 통로. */
export const text = (key: CarnotCycleMessageKey): LocalizedText => carnotCycleMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: CarnotCycleMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const carnotCycleSchema: BundleSchema = {
  id: CARNOT_CYCLE_ID,
  label: text('label.title'),
  category: 'thermal',
  operation: text('label.operation'),
  timeModel: 'periodic',
  parameters: [],

  /**
   * `th` 뜨거운 쪽 온도(고정 — 조작하면 주장이 「두 온도의 비」로 흩어진다) · `tTop` 도표 위
   * 끝 온도 · `tcDefault` 차가운 쪽 기본값 · `sinkSeconds` 한 줄기 열이 바닥 아래로 빠져나가는 데
   * 걸리는 시간. 마지막 것은 단계를 가로질러 흐르는 시차 출발이라 단계 길이가 아니다.
   */
  stages: [
    {
      id: 'engine',
      label: text('label.stage'),
      constants: { th: 500, tTop: 560, tcDefault: 300, sinkSeconds: 0.9 },
    },
  ],
  environments: [],
  views: [{ id: 'ts', label: text('label.view'), default: true }],

  /** 원본 캔버스 300 px + 조작기 줄. 세로가 비싸 슬라이더와 캡션을 한 줄에 나란히 둔다. */
  canvas: { height: 370, minHeight: 340 },

  /** 겹침 순서가 원본과 같아야 한다 — 받은 열 · 빠져나간 자리 · 가라앉는 기둥 · 경로 · 상태점. */
  drawOrder: 'scene',

  /**
   * 한 바퀴 9 s. 원본 구간 경계 2.4 · 3.4 · 5.8 · 6.8 · 8.6 · 9 를 단계 길이로 옮겼다.
   * 모두 선형 진행이다(원본 clamp01).
   */
  timeline: {
    phases: [
      { id: 'hot', duration: 2.4, caption: key('caption.hot') },
      { id: 'expand', duration: 1, caption: key('caption.expand') },
      { id: 'cold', duration: 2.4, caption: key('caption.cold') },
      { id: 'compress', duration: 1, caption: key('caption.compress') },
      { id: 'hold', duration: 1.8, caption: key('caption.result') },
      { id: 'fade', duration: 0.4, caption: key('caption.result') },
    ],
  },

  /** 도착한 순간 이미 열을 받는 중이다 — 원본 OFFSET 1.2 s. */
  startAt: 1.2,

  /** 슬롯 하나. 숫자는 조작값에서 만든 상태 문자열이라 이름표 · 면적 글자와 같은 값이다. */
  caption: {
    anchor: { screen: 'bottom-left', offset: [248, -14] },
    align: 'left',
    fontSize: 15,
    wrapWidth: 580,
    style: { colorRole: 'ink', emphasis: 'strong' },
    vars: { th: 'thText', tc: 'tcText', discard: 'discardText', work: 'workText' },
  },

  messages: carnotCycleMessages,
};
