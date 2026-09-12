// ========================================================================
// apparent-brightness — 선언
// ========================================================================
// 질문: 똑같은 별인데 왜 멀리 있는 쪽이 옅게 보이나. 독자가 멈추는 자리는
// "두 배 멀면 **네 배** 옅다" 의 네 배다.
//
// 빛이 약해지는 것이 아니라 같은 양이 더 많은 칸에 갈라져 앉는다.
//
// 원본: tasks/piece-lab/apparent-brightness/ (자유 구현)
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:apparent-brightness` 와 문자 그대로 일치한다 (C4). */
export const APPARENT_BRIGHTNESS_ID = 'apparent-brightness';

// ------------------------------------------------------------------------
// 자리와 크기 — 월드 1 단위 = 원본 100 px
// ------------------------------------------------------------------------
//
// 별을 월드 원점에 둔다. 빛이 나아가는 방향이 가로(x), 단면이 (u, v) 다.
// u 는 화면 안쪽으로 비스듬히 뉘어 그린다(오블리크 투영) — 카메라는 없다.
//
// 1/d² 은 **면적**의 법칙이라, 단면을 선분으로 납작하게 그리면 넓이가 두 배로만
// 늘어 (1/d 처럼) 거짓말이 된다. 가로세로 두 방향이 함께 늘어나는 것이 보여야
// 제곱이 보인다 (원본 NOTES).

/** 거리 1 당 가로 길이. 세 번째 칸을 지난 빛이 머물 자리를 남긴다. */
export const SPAN = 2.1;
/** 칸 한 변의 세로 길이. 세 배 거리에서 칸마다 4개가 세어지려면 이만큼 필요하다. */
export const CELL = 0.48;
/** 칸 한 변이 안쪽으로 뉘는 양 — 오블리크 투영의 축척 두 개. */
export const SKEW_X = 0.21;
export const SKEW_Y = 0.18;

/**
 * 빛다발의 갈래 수. 6×6 = 36.
 *
 * **이 값은 조각이 정한다.** 2와 3으로 동시에 나누어떨어져야 2×2 로 나눌 때
 * 칸마다 정확히 3×3=9, 3×3 으로 나눌 때 2×2=4 가 된다. 어느 알갱이도 칸 경계에
 * 걸치지 않는다 — 이름표의 숫자와 화면에서 세어지는 개수가 어긋날 수 없게
 * 격자를 그렇게 고른 것이다 (원본 NOTES).
 */
export const RAYS = 6;

/** 묶음이 떠나는 간격(초). */
export const PERIOD = 3.2;
/** 세 번째 칸을 지난 빛이 화면을 벗어나기 전에 다 스러지는 거리. */
export const DMAX = 3.5;
/** 이 거리부터 스러지기 시작한다. */
export const FADE_FROM = 3.05;
/** 태어난 직후 짙어지는 거리. */
export const FADE_IN = 0.1;
/** 칸에 빛이 닿은 뒤 테두리 섬광이 잦아드는 시간 상수(초). */
export const ARRIVAL_TAU = 0.28;
/** 묶음이 떠난 뒤 별의 번짐이 잦아드는 시간 상수(초). */
export const DEPART_TAU = 0.22;

/**
 * 캡션 전환을 이만큼 앞당긴다(초).
 *
 * 이 조각의 결정타 시각(빛이 칸에 닿는 순간)이 **정확히 시간표 단계의 경계**다.
 * 시계는 1/60 씩 더해 오므로 주기 안 시각이 3 이 아니라 2.9999999999999996 으로
 * 도착하고, 엔진의 단계 판정은 정확히 비교하므로 **빛이 칸에 닿은 바로 그 화면에서
 * 캡션만 한 박자 뒤처진다.** 칸의 테두리 섬광은 `physics` 가 자기 여유를 갖고
 * 계산하므로 제때 켜진다 — 둘이 어긋나는 것이 눈에 띈다.
 *
 * 원본도 같은 것을 겪고 1e-6 의 여유로 고쳤다(원본 NOTES 「고른 값들」). 여기서는
 * 단계 경계를 그만큼 당겨 같은 일을 한다. 한 프레임(0.0167 s)의 6만분의 1 이라
 * 화면에서는 보이지 않는다. 엔진이 경계에 여유를 갖게 되면 지울 값이다
 * (NOTES 「어휘 부족」).
 */
export const CAPTION_LEAD = 1e-6;

/**
 * 자리 세 개 — 1 · 2 · 3배 거리에 **같은 물리 크기의 칸**이 놓여 있다.
 *
 * 거리 d 에 칸이 d×d 개가 되는 것은 어휘가 아니라 이 표의 `n` 이다. 퍼진 단면이
 * 덮는 칸이 1 · 4 · 9 개가 되고, 알갱이는 칸마다 36 → 9 → 4 로 갈라져 앉는다.
 * 한 칸이 받는 빛의 양은 1/d² 이라 `luminance` 로 1 · 1/4 · 1/9 을 준다.
 */
export interface FrameDef {
  readonly id: string;
  /** 별에서의 거리(배수). */
  readonly d: number;
  /** 한 변의 칸 수. 거리 d 에 d×d 칸이다. */
  readonly n: number;
  /** 한 칸에 앉는 알갱이 수. 36 / d². */
  readonly per: number;
  readonly nameKey: ApparentBrightnessMessageKey;
}

export const FRAMES: readonly FrameDef[] = [
  { id: 'near', d: 1, n: 1, per: 36, nameKey: 'label.near' },
  { id: 'mid', d: 2, n: 2, per: 9, nameKey: 'label.mid' },
  { id: 'far', d: 3, n: 3, per: 4, nameKey: 'label.far' },
];

/**
 * 프레이밍은 주장의 일부다. 원본 캔버스(860 × 304 px)를 그대로 옮긴 고정 경계 —
 * 별이 원점(원본 62, 124 px)이다. 매 프레임 같은 값이라 카메라가 흔들리지 않는다.
 */
export const SCENE_BOUNDS = { minX: -0.62, maxX: 7.98, minY: -1.8, maxY: 1.24 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const apparentBrightnessMessages = Object.freeze({
  'label.title': { ko: '겉보기 밝기', en: 'Apparent brightness' },
  'label.operation': {
    ko: '같은 빛이 넓은 면에 나뉜다',
    en: 'The same light divides over a wider area',
  },
  'label.stage': { ko: '밤하늘', en: 'Night sky' },
  'label.view': { ko: '빛 묶음', en: 'A bundle of light' },
  /** 자리 이름 — 거리는 절대값이 아니라 배수로만 말한다. */
  'label.near': { ko: '기준 거리', en: 'Reference distance' },
  'label.mid': { ko: '두 배 멀리', en: 'Twice as far' },
  'label.far': { ko: '세 배 멀리', en: 'Three times as far' },
  /** 그 칸이 받은 알갱이 수. 세면 맞는 숫자다. */
  'label.per': { ko: '한 칸에 {n}개', en: '{n} per cell' },
  'caption.near': {
    ko: '기준 거리 — 36개가 모두 한 칸으로 들어왔다',
    en: 'Reference distance — all 36 land in a single cell',
  },
  'caption.mid': {
    ko: '두 배 멀리 — 같은 36개가 네 칸에 나뉜다. 한 칸에 9개, 네 배 옅다',
    en: 'Twice as far — the same 36 divide over four cells. Nine each, four times fainter',
  },
  'caption.far': {
    ko: '세 배 멀리 — 아홉 칸에 나뉜다. 한 칸에 4개, 아홉 배 옅다',
    en: 'Three times as far — divided over nine cells. Four each, nine times fainter',
  },
} satisfies Record<string, LocalizedText>);

export type ApparentBrightnessMessageKey = keyof typeof apparentBrightnessMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export function text(key: ApparentBrightnessMessageKey): LocalizedText {
  return apparentBrightnessMessages[key];
}

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ApparentBrightnessMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const apparentBrightnessSchema: BundleSchema = {
  id: APPARENT_BRIGHTNESS_ID,
  label: text('label.title'),
  category: 'astro',
  operation: text('label.operation'),
  timeModel: 'linear',

  /**
   * 조작기가 없다. 넣을 수 있었던 것은 "관측자를 끌어 거리를 바꾸기" 인데, 거리를
   * 연속으로 만들면 거리 2.5 에서 알갱이는 4개가 잡히는데 1/d² 은 5.76개를 요구한다.
   * **셀 수 있다는 것이 이 조각의 유일한 증거**라 그것을 깨면서 얻는 조작은 손해다.
   * 정확히 맞아떨어지는 자리(1·2·3배)는 이미 세 개 다 화면에 동시에 있다.
   */
  parameters: [],

  stages: [{ id: 'sky', label: text('label.stage'), constants: {} }],
  environments: [],
  views: [{ id: 'bundle', label: text('label.view'), default: true }],
  autoViews: { energy: false },

  /**
   * 원본은 860 × 304 px. 러너가 사방에 여백을 두므로 그만큼 더 잡는다 — 칸 한 변이
   * 화면에서 40 px 아래로 내려가면 세 배 거리의 칸에서 알갱이 4개가 세어지지 않고,
   * 세어지지 않으면 이 조각의 주장이 사라진다 (원본 NOTES 「고른 값들」).
   */
  canvas: { height: 360, minHeight: 320 },

  /**
   * 조각 시계의 0 은 **묶음이 별을 떠나는 순간**이다. 묶음은 거리 1당 1초로 나아가므로
   * 시각이 곧 거리이고, 통과는 주기 안 고정 시각에 일어난다 — 거리 1 은 1 초, 2 는
   * 2 초, 3 은 3 초.
   *
   * 1.4 초 앞당겨 연다. 독자가 도착한 순간 묶음은 이미 기준 거리를 지나 1.4 에 있고,
   * 세 칸은 모두 각자의 밝기로 켜져 있다 — 기다릴 빈 화면이 없다 (S-piece).
   */
  startAt: 1.4,

  /**
   * 한 주기 3.2 s. 캡션은 **빛이 가장 최근에 통과한 자리**를 말하고 다음 자리를
   * 통과할 때까지 그대로 있다.
   *
   * 앞선 묶음의 현재 위치를 따라가게 하면, 빛이 아홉 칸을 막 지난 뒤 결론이 0.3 초
   * 만에 "다시 퍼진다" 로 밀려난다. 통과한 칸은 계속 켜져 있으므로 캡션이 가리키는
   * 증거는 사라지지 않는다 — 이 규칙으로 결론이 1.2 초 남는다 (원본 NOTES).
   *
   * 그래서 주기의 첫 1 초는 **앞 주기에서 세 배 거리를 지난 것**을 아직 말한다.
   * 같은 문안이라 `far` 와 한 문장이다.
   */
  timeline: {
    phases: [
      { id: 'far-tail', duration: 1.0 - CAPTION_LEAD, caption: key('caption.far') },
      { id: 'near', duration: 1.0, caption: key('caption.near') },
      { id: 'mid', duration: 1.0, caption: key('caption.mid') },
      { id: 'far', duration: PERIOD - 3.0 + CAPTION_LEAD, caption: key('caption.far') },
    ],
  },

  /**
   * 원본이 그린 순서 그대로 겹친다 — 빛 알갱이는 칸 **위에** 앉는다. 어휘별 층으로
   * 그리면 매질(`region`, 45)이 물체(`particleSystem`, 40) 위로 덮여 36개가 칸에
   * 묻힌다. 칸마다 몇 개인지 세어지는 것이 이 조각의 증거다.
   */
  drawOrder: 'scene',

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다. 원본은 캔버스 왼쪽 아래 15 px.
  caption: {
    anchor: { screen: 'bottom-left' },
    fontSize: 15,
  },

  /**
   * 그리드도 카메라 버튼도 없다 (기본값). 거리는 "기준 / 두 배 / 세 배" 라는
   * 배수로만 말하고, 이 주장에 절대 거리는 필요 없다 — 눈금을 주면 잴 것이
   * 거리인 것처럼 읽힌다 (원본 inventory 「hidden」).
   */

  messages: apparentBrightnessMessages,
};
