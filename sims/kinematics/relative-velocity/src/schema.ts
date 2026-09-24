// ========================================================================
// relative-velocity — 선언
// ========================================================================
// 질문: 사공은 뱃머리를 맞은편으로 곧게 겨눈 채 한 번도 돌리지 않았는데,
// 왜 강둑에서 보면 배가 비스듬히 떠내려가는가.
//
// 답의 동사는 **기운다**. 배가 무엇을 다르게 한 것이 아니라, 보는 사람이
// 달라지면 배가 지나온 길이 기운다.
//
// 값은 전부 원본(tasks/piece-lab/relative-velocity/index.html)에서 그대로
// 가져왔다. 물 1.2 · 배 1.6 · 강폭 8.0 은 딱 떨어지게 고른 값이다 — 건너는
// 시간이 정확히 5.0 초, 강둑에서 본 속력이 정확히 2.0 m/s, 떠내려간 거리가
// 정확히 6.0 m 가 되어 읽는 사람이 자국을 눈으로 셀 수 있다.
// ========================================================================

import type { BundleSchema, LocalizedText, TimelineEase, TimelinePhase } from '@aperi21/schema';

/** 등록 키 `aperi21:relative-velocity` 와 문자 그대로 일치한다 (C4). */
export const RELATIVE_VELOCITY_ID = 'relative-velocity';

// ------------------------------------------------------------------------
// 물리 상수 (SI)
// ------------------------------------------------------------------------

/** 강물의 속도(m/s). 하류가 +x. */
export const V_WATER = 1.2;
/** 물에 대한 배의 속도(m/s). 뱃머리는 처음부터 끝까지 맞은편(+y)을 향한다. */
export const V_BOAT = 1.6;
/** 강폭(m). */
export const RIVER_W = 8.0;
/** 한 번 건너는 데 걸리는 시간(초) = 5.0. 어느 기준틀에서 보든 같다. */
export const CROSS_T = RIVER_W / V_BOAT;
/** 선착장 간격(m). */
export const PIER_L = 12.0;
/** 배경이 되풀이되는 세계 좌표 주기(m). 화면 폭(약 41 m)보다 넓어 이음매가 눈에 걸리지 않는다. */
export const SPAN = 60.0;

// ------------------------------------------------------------------------
// 화면 배치
// ------------------------------------------------------------------------
//
// 원본은 CSS 픽셀로 짰다(1 m = 21 px, 캔버스 860 × 272). 엔진은 월드 단위로
// 선언하고 배율은 카메라가 정하므로, 원본의 픽셀 값을 21 로 나눠 옮긴다.
// 나눗셈을 여기 한 번만 두는 것은 원본과 대조할 때 어느 숫자가 어디서 왔는지
// 한 줄로 보이게 하기 위해서다.

/** 원본의 1 m = 21 px. **배율이 아니라 환산표다** — 그리는 배율은 카메라가 정한다. */
export const PX = 21;

/** 원본에서 이쪽 물가가 있던 화면 높이(px). 여기를 월드 y = 0 으로 둔다. */
export const Y_NEAR_PX = 198;

/** 원본의 화면 높이(px)를 월드 y(m)로. 원본의 배치 숫자를 그대로 옮겨 적기 위한 것이다. */
export function worldYFromPx(screenY: number): number {
  return (Y_NEAR_PX - screenY) / PX;
}

/** 원본 캔버스 폭(860 px)이 담던 월드 폭(m) = 40.95. */
export const VIEW_W = 860 / PX;
/** 물가(원본 y=198 px)를 월드 y=0 으로 둔다. 맞은편 물가가 y = RIVER_W. */
export const NEAR_LAND_BOTTOM = -34 / PX;
/** 캔버스 위끝(원본 y=0 px). 맞은편 둑이 여기까지 차 있다. */
export const VIEW_TOP = 198 / PX;
/** 캔버스 아래끝(원본 y=272 px). 이 아래가 캡션 자리다. */
export const VIEW_BOTTOM = -74 / PX;

/** 프레이밍. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (S-piece). */
export const SCENE_BOUNDS = {
  minX: 0,
  maxX: VIEW_W,
  minY: VIEW_BOTTOM,
  maxY: VIEW_TOP,
} as const;

/**
 * 띠와 되풀이를 화면 밖으로 얼마나 더 내보낼지(m).
 *
 * 카메라가 여백을 두고 맞추므로 보이는 범위가 `SCENE_BOUNDS` 보다 넓을 수 있다.
 * **어느 기준틀에서 보든 화면이 비면 안 되는** 조각이라 넉넉히 넘겨 둔다.
 */
export const BLEED = 30;

/** 선착장 말뚝 크기(m) — 원본 6 × 15 px. */
export const PIER_SIZE: readonly [number, number] = [6 / PX, 15 / PX];
/** 이쪽 둑 말뚝의 중심 높이(m) — 원본 y 185~200 px. */
export const PIER_NEAR_Y = (198 - 192.5) / PX;
/** 맞은편 둑 말뚝의 중심 높이(m) — 원본 y 28~43 px. */
export const PIER_FAR_Y = (198 - 35.5) / PX;

/**
 * 뱃머리. `pos` 기준 월드 단위, y 가 위. 원본의 캔버스 경로를 21 로 나누고
 * y 부호를 뒤집은 것이다.
 *
 * **이 모양은 기준틀 변환을 받지 않는다.** 뱃머리 각도가 그대로여야 "배가 뭘
 * 다르게 한 게 아니다" 가 화면에서 확인된다 (NOTES (b)).
 */
export const BOAT_PATH =
  'M 0 0.809524 Q 0.333333 0.285714 0.333333 -0.619048 L -0.333333 -0.619048 Q -0.333333 0.285714 0 0.809524 Z';
/** 배 위의 종이색 칸 — 원본 fillRect(-2.5, -3, 5, 8). */
export const BOAT_SEAT = {
  size: [5 / PX, 8 / PX] as const,
  y: (3 - 5) / 2 / PX,
};

// ------------------------------------------------------------------------
// 흩뿌린 것들
// ------------------------------------------------------------------------

/** 물거품 개수. */
export const FOAM_COUNT = 150;
/** 자갈 개수. */
export const PEBBLE_COUNT = 90;
/**
 * 흩뿌리는 난수의 시드. 원본 하네스(`piece-kit.js`)의 기본 시드와 같은 값이고
 * 같은 생성기(mulberry32)를 같은 순서로 뽑으므로 **자리가 한 알도 다르지 않다.**
 */
export const SCATTER_SEED = 1;

/** 물거품 획의 길이(화면 px). `strength` 가 곱해져 알갱이마다 달라진다. */
export const FOAM_TICK_PX = 17;
/** 물거품 획의 굵기(화면 px) — 원본 1.6. */
export const FOAM_WIDTH_PX = 1.6;
/**
 * 물거품의 **빛의 양**. 0 이면 바탕색, 1 이면 제 색이다. 원본의 흰 거품에
 * 닿으려고 바탕 쪽으로 끌어 둔다 (NOTES 「어휘 부족」).
 */
export const FOAM_LUMINANCE = 0.12;

// ------------------------------------------------------------------------
// 자국과 자취
// ------------------------------------------------------------------------

/** 시간 자국을 찍는 간격(초). 자국 사이 거리가 곧 이 기준틀에서 본 배의 빠르기다. */
export const DOT_DT = 0.4;
/** 시간 자국의 반지름(화면 px). */
export const DOT_PX = 2.6;
/** 지나온 길의 굵기(화면 px). */
export const TRAIL_WIDTH_PX = 2;
/** 지나온 길의 진하기. */
export const TRAIL_ALPHA = 0.9;
/** 막 끝난 항해의 자취가 사라지기까지(초). */
export const GHOST_LIFE = 0.45;
/** 사라지는 자취의 첫 진하기. */
export const GHOST_ALPHA = 0.45;

/** 새 배가 떠나는 자리 — 화면 왼쪽 이 비율에 가장 가까운 선착장. */
export const TRIP_START_FRAC = 0.32;

// ------------------------------------------------------------------------
// 기준틀의 순회
// ------------------------------------------------------------------------

/**
 * 자동 순회 한 바퀴. **한 표가 시간표이자 λ 표다.**
 *
 * `duration` · `ease` 는 그대로 `schema.timeline` 이 되고, `from` · `to` 는
 * 그 단계에서 기준틀이 강둑(0)과 강물(1) 사이 어디를 지나는지다. 둘을 한 표에
 * 둔 것은 physics 가 같은 선언을 읽기 때문이다 — 단계 경계를 코드에 상수로
 * 옮겨 적으면 저작자가 "이 단계를 0.3 초 더 길게" 를 할 수 없다 (원칙 2).
 *
 * 왜 physics 가 읽는가: 관측자 위치는 **적분**이라(`Xobs += u·dt`) `step` 이
 * 매 프레임 u 를 알아야 하는데, 엔진은 `TimelineFrame` 을 `scene` 에만 준다
 * (NOTES 「어휘 부족」).
 */
export const FRAME_TOUR: readonly {
  id: string;
  duration: number;
  ease?: TimelineEase;
  /** 단계가 시작할 때의 λ (0 = 강둑, 1 = 강물). */
  from: number;
  /** 단계가 끝날 때의 λ. */
  to: number;
}[] = [
  { id: 'bank', duration: 4.5, from: 0, to: 0 },
  { id: 'drift', duration: 3.0, ease: 'smooth', from: 0, to: 1 },
  { id: 'river', duration: 3.5, from: 1, to: 1 },
  { id: 'back', duration: 3.0, ease: 'smooth', from: 1, to: 0 },
];

/** 한 바퀴의 길이(초) = 14.0. */
export const CYCLE = FRAME_TOUR.reduce((sum, p) => sum + p.duration, 0);

/**
 * 시계를 열 때의 순회 위상(초).
 *
 * 원본은 `phaseOff = 3.0` 으로 두고 시계를 2.7 초 앞당겨 열었다. 앞당기는 것을
 * 엔진 프리롤이 맡으므로(`preroll`), 프리롤이 시작하는 자리인 3.0 − 2.7 을 둔다.
 * 그러면 독자가 도착한 순간 위상이 정확히 3.0 이고, 1.5 초 뒤 `drift` 가 시작된다.
 */
export const PHASE_AT_OPEN = 0.3;

/**
 * 시계를 이만큼 미리 굴린다(초).
 *
 * 도착한 순간 배가 강을 54 % 건너 있고 대각선 궤적이 이미 그어져 있어야 한다
 * (S-piece). 이 조각은 자취를 **쌓으므로** 시계만 앞당겨서는 뒤가 비어 있다 —
 * 실제로 걸어야 한다. 이 구간의 기준틀은 강둑(u = 0)이라 `Xobs` 가 0 그대로여서
 * 미리 돌린 것과 실제로 흐른 것이 어긋나지 않는다.
 */
export const PREROLL = 2.7;

/** 손을 뗀 뒤 자동 순회로 돌아가기까지(초). */
export const HANDOFF_DELAY = 4.0;
/** 돌아갈 때 값을 섞는 시간(초). 튀지 않게 한다. */
export const HANDOFF_BLEND = 1.2;

/** 보는 사람의 속도 범위(m/s). 1.2 **너머**까지 밀 수 있어야 길이 반대로 기우는 것을 본다. */
export const U_RANGE: readonly [number, number] = [-0.5, 2.0];
/** 「강둑에 섰다」 · 「강물과 같이 떠간다」로 볼 속도 오차(m/s). */
export const U_EPS = 0.03;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const relativeVelocityMessages = Object.freeze({
  'label.title': { ko: '상대 속도', en: 'Relative velocity' },
  'label.stage': { ko: '강', en: 'River' },
  'label.view': { ko: '강을 건너는 배', en: 'A boat crossing' },
  /** 조작기 이름표. 강물의 속도를 곁들여 둔다 — 길이 똑바로 서는 자리를 찾는 실마리다. */
  'label.observer': { ko: '보는 사람의 속도 · 강물 1.2', en: 'Observer speed · river 1.2' },

  // 캡션 — 지금 누구의 눈으로 보는 중인지와, 지금 길이 어느 쪽으로 기우는지.
  'caption.bank': {
    ko: '강둑에 서서 본다 — 배가 지나온 길이 오른쪽으로 기운다',
    en: 'Watching from the bank — the path the boat left tilts to the right',
  },
  'caption.river': {
    ko: '강물에 떠서 같이 흐르며 본다 — 배가 지나온 길이 똑바로 선다',
    en: 'Drifting with the water — the path the boat left stands straight',
  },
  'caption.upstream': {
    ko: '강물을 거슬러 올라가며 본다 — 배가 지나온 길이 오른쪽으로 기운다',
    en: 'Moving upstream — the path the boat left tilts to the right',
  },
  'caption.slower': {
    ko: '강물보다 느리게 떠내려가며 본다 — 배가 지나온 길이 오른쪽으로 기운다',
    en: 'Drifting slower than the water — the path the boat left tilts to the right',
  },
  'caption.faster': {
    ko: '강물보다 빠르게 떠내려가며 본다 — 배가 지나온 길이 왼쪽으로 기운다',
    en: 'Drifting faster than the water — the path the boat left tilts to the left',
  },
} satisfies Record<string, LocalizedText>);

export type RelativeVelocityMessageKey = keyof typeof relativeVelocityMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export function text(key: RelativeVelocityMessageKey): LocalizedText {
  return relativeVelocityMessages[key];
}

/** 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: RelativeVelocityMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

const phases: TimelinePhase[] = FRAME_TOUR.map((p) => ({
  id: p.id,
  duration: p.duration,
  ...(p.ease ? { ease: p.ease } : {}),
}));

export const relativeVelocitySchema: BundleSchema = {
  id: RELATIVE_VELOCITY_ID,
  title: text('label.title'),
  category: 'kinematics',
  timeModel: 'periodic',

  parameters: [],

  stages: [
    {
      id: 'river',
      label: text('label.stage'),
      constants: { vWater: V_WATER, vBoat: V_BOAT, riverWidth: RIVER_W },
    },
  ],

  environments: [],

  views: [{ id: 'crossing', label: text('label.view'), default: true }],

  /** 원본 캔버스 높이. 가로로 길게 눕는 그림이라 세로를 더 쓰지 않는다. */
  canvas: { height: 272, minHeight: 272 },

  /**
   * 겹침이 판정 장치다. 말뚝은 둑 띠 **위**, 자갈은 둑 띠 위, 배는 제가 지나온
   * 길 위에 놓여야 한다 — 어휘별 층으로는 물거품이 둑보다 위로 가서 자리가 뒤집힌다.
   */
  drawOrder: 'scene',

  preroll: PREROLL,

  timeline: { phases },

  /**
   * 캡션은 **값으로 갈린다.** 지금 기준틀 속도가 어디 있느냐가 문장을 정하고,
   * 그 값은 독자가 손으로도 민다. 그래서 단계가 아니라 상태로 고른다
   * (`cases` — 위에서부터 참인 첫 항목).
   *
   * 순서는 원본 `caption()` 의 if 사슬 그대로다.
   */
  caption: {
    anchor: { screen: 'bottom-left' },
    fontSize: 15,
    style: { colorRole: 'ink', emphasis: 'strong' },
    cases: [
      { when: 'atBank', text: key('caption.bank') },
      { when: 'atRiver', text: key('caption.river') },
      { when: 'upstream', text: key('caption.upstream') },
      { when: 'slower', text: key('caption.slower') },
      { when: 'faster', text: key('caption.faster') },
    ],
    text: key('caption.bank'),
  },

  /**
   * 크롬은 켜지 않는다. **"어느 격자가 진짜인가" 가 이 조각이 던지는 물음**이라
   * 좌표 눈금을 깔면 그 격자가 특권을 갖고 물음이 사라진다. 대신 선착장과
   * 물거품이 서로 다른 두 격자 노릇을 한다 (NOTES (c)).
   */

  messages: relativeVelocityMessages,
};
