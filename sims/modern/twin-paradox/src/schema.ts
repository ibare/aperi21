// ========================================================================
// twin-paradox — 선언
// ========================================================================
// 질문: 서로 상대가 느리게 늙는다면서, 다시 만나면 왜 한쪽만 덜 늙어 있는가?
//
// 시공간 도표(시간 ↑ · 공간 →)에 두 세계선을 둔다. 지구에 남은 쌍둥이는 곧은 세계선,
// 0.6c 로 6 광년을 갔다 돌아온 쌍둥이는 꺾인 세계선이다. 두 선 위에 한 해마다 점이
// 찍힌다 — 다시 만난 자리에서 곧은 선은 20 개, 꺾인 선은 16 개다. 꺾인 선이 도표에서
// 더 길어 보여도 제 시간(고유 시간)은 더 짧다.
//
// 비대칭은 **돌아서는 쪽만 틀을 바꾸는 데서** 온다. 여행자의 「지금」 선(동시선)이
// 가는 길에는 한쪽으로, 오는 길에는 다른 쪽으로 기운다 — 돌아서는 순간 그 선이 휙
// 돌아 지구 세계선의 한 토막을 건너뛴다. 지구 쌍둥이의 「지금」 은 늘 가로라 건너뛰는
// 토막이 없다.
//
// 이웃과 겹치지 않게 — 동시선이 세계선을 따라 기운다는 것은 `spacetime-diagram`,
// 지나가는 시계가 느리다(5 대 3)는 것은 `time-dilation`, 느려지는 까닭(빛의 비스듬한
// 길)은 `light-clock` 의 몫이다. 여기서 일어나는 것은 「두 세계선의 눈금 수가 갈린다」
// 와 「돌아설 때 지금 선이 건너뛴다」 둘이 한 문장을 이루는 것이다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:twin-paradox` 와 문자 그대로 일치한다 (C4). */
export const TWIN_PARADOX_ID = 'twin-paradox';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 월드 단위: 가로 광년, 세로 년(ct). 빛의 세계선이 45° 다.
// ------------------------------------------------------------------------

/** 여행자의 속력 v/c. γ = 1/√(1−β²) = 1.25 가 되는 값이다. */
export const BETA = 0.6;
/** 돌아서는 곳까지의 거리(광년, 지구 틀). 지구 틀에서 가는 데 거리/β = 10 년, 왕복 20 년이다. */
export const DISTANCE = 6;
/** 세계선 위 점 하나가 뜻하는 제 시간(년). 한 해마다 한 점. */
export const TICK_YEARS = 1;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이(초). 화면 속 시간(년)과 초의 대응은 physics 가 단계 진행도로 잇는다.
// ------------------------------------------------------------------------

/** 여행자가 떠나 돌아서는 곳에 닿기까지. 지구 틀 0 → 10 년. */
export const OUT = 4.2;
/** 여행자가 돌아서며 틀을 바꾸는 동안. 화면 속 시간은 멈추고 「지금」 선만 돈다. */
export const TURN = 1.8;
/** 돌아오는 길. 지구 틀 10 → 20 년. 가는 길과 같은 빠르기로 흐르도록 `OUT` 과 같게 둔다(G129). */
export const BACK = OUT;
/** 다시 만나 두 햇수가 굵어지는 동안. */
export const MEET = 0.6;
/** 두 세계선과 햇수를 읽는 동안. */
export const HOLD = 2.8;
/** 기록이 흐려지며 다음 주기로 넘어가는 동안. */
export const FADE = 0.7;

// ------------------------------------------------------------------------
// 배치 — 월드.
// ------------------------------------------------------------------------

/**
 * 프레이밍은 주장의 일부다. 세로는 출발 이름표 아래(캡션 줄 포함)부터 재회 이름표 위까지,
 * 가로는 지구 쪽 햇수 글자부터 돌아서는 곳 오른쪽 햇수 글자까지. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -6, maxX: 12, minY: -2.4, maxY: 21.2 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const twinParadoxMessages = Object.freeze({
  'label.title': { ko: '쌍둥이 역설', en: 'Twin paradox' },
  'label.operation': { ko: '비대칭을 만드는 가속', en: 'The acceleration that breaks the symmetry' },
  'label.stage': { ko: '0.6c 로 6 광년 왕복', en: 'A round trip of 6 light-years at 0.6c' },
  'label.view': { ko: '지구 틀의 시공간 도표', en: 'Spacetime diagram in Earth’s frame' },
  /** 머리 옆에서 센 햇수 — 지나온 해마다의 점을 센 정수다. */
  'label.earthAge': { ko: '지구 {n}년', en: 'Earth {n} yr' },
  'label.travelerAge': { ko: '여행자 {n}년', en: 'Traveler {n} yr' },
  /** 여행자의 속력과 방향. */
  'label.speedOut': { ko: '{beta}c →', en: '{beta}c →' },
  'label.speedBack': { ko: '← {beta}c', en: '← {beta}c' },
  /** 세 사건. */
  'label.depart': { ko: '출발', en: 'depart' },
  'label.turn': { ko: '돌아섬', en: 'turnaround' },
  'label.meet': { ko: '재회', en: 'reunion' },
  'caption.out': {
    ko: '여행자가 멀어진다 — 기운 점선이 여행자의 ‘지금’, 여행자의 한 해마다 지구의 한 해보다 짧은 토막을 가리킨다',
    en: 'The traveler moves away — the tilted dashed line is the traveler’s ‘now’; each traveler year points to less than a year on Earth',
  },
  'caption.turn': {
    ko: '돌아서는 쪽은 여행자뿐 — 틀을 바꾸는 순간 ‘지금’ 선이 돌아 지구 세계선의 한 토막을 건너뛴다',
    en: 'Only the traveler turns — as it switches frames, its ‘now’ swings and skips a whole stretch of Earth’s worldline',
  },
  'caption.back': {
    ko: '돌아오는 길에도 여행자에게 지구의 해는 짧게 지나간다 — 건너뛴 토막만큼 지구가 앞서 있다',
    en: 'On the way back Earth’s years still pass slowly for the traveler — Earth is ahead by the skipped stretch',
  },
  'caption.meet': {
    ko: '다시 만나 세어 보면 곧은 세계선의 점이 더 많다 — 꺾인 세계선을 산 쌍둥이가 덜 늙었다',
    en: 'Count the dots at the reunion: the straight worldline has more — the twin on the bent worldline aged less',
  },
} satisfies Record<string, LocalizedText>);

export type TwinParadoxMessageKey = keyof typeof twinParadoxMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: TwinParadoxMessageKey): LocalizedText => twinParadoxMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: TwinParadoxMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const twinParadoxSchema: BundleSchema = {
  id: TWIN_PARADOX_ID,
  label: text('label.title'),
  category: 'modern',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 여행자가 가고, 돌아서고, 돌아와 두 햇수가 갈린다.
  parameters: [],

  stages: [
    {
      id: 'round-trip',
      label: text('label.stage'),
      constants: {
        beta: BETA,
        distance: DISTANCE,
        tickYears: TICK_YEARS,
      },
    },
  ],

  environments: [],

  views: [{ id: 'earth-frame', label: text('label.view'), default: true }],

  /** 세로 20 년을 담아야 해서 기본보다 조금 높다. 가로는 햇수 글자가 쓴다. */
  canvas: { height: 460, minHeight: 400 },

  /** 부채(지난 「지금」 선)가 세계선 아래로, 머리 · 글자가 맨 위로 오도록 scene 순서로 그린다. */
  drawOrder: 'scene',

  /**
   * 한 주기 = 가는 길 → 돌아섬(지금 선이 돈다) → 오는 길 → 재회 → 읽기 → 흐려짐.
   * 지구 틀 시각 T 는 `out` · `back` 의 진행도로만 흐르고, `turn` 동안은 멈춘다.
   */
  timeline: {
    phases: [
      { id: 'out', duration: OUT, caption: key('caption.out') },
      { id: 'turn', duration: TURN, ease: 'smooth', caption: key('caption.turn') },
      { id: 'back', duration: BACK, caption: key('caption.back') },
      { id: 'meet', duration: MEET, caption: key('caption.meet') },
      { id: 'hold', duration: HOLD, caption: key('caption.meet') },
      { id: 'fade', duration: FADE, caption: key('caption.meet') },
    ],
  },

  /** 도착한 순간 이미 여행 중이다 — 가는 길의 절반쯤, 부채가 몇 가닥 깔려 있다. */
  startAt: 2.2,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 공식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 720,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 견줄 것은 거리가 아니라 **점의 개수**다 — 그리드를
   * 켜면 꺾인 세계선이 도표에서 더 길다는 것(유클리드 길이)을 재라는 지시가 되어 거꾸로 읽힌다.
   */

  messages: twinParadoxMessages,
};
