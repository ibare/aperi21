// ========================================================================
// stokes-drag — 선언
// ========================================================================
// 질문: 끈적한 액체 속에서 천천히 가라앉는 작은 구 — 크기가 두 배면 얼마나 빨리
// 가라앉나.
//
// 느린 흐름의 저항은 속력에 정비례하고(6πηrv) 반지름에도 정비례한다. 무게(에서
// 부력을 뺀 몫)는 반지름의 세제곱이다. 반지름이 두 배면 가라앉히는 힘은 여덟 배,
// 같은 속력에서 받는 저항은 두 배뿐이라, 둘이 맞먹는 속력(종단 속도)이 네 배가 된다.
// 이것이 느린 흐름 고유의 모습이다 — 속력 제곱의 저항이라면 √2 배에 그친다.
//
// 동사는 **"네 배 빠르게 가라앉는다"** 다. 같은 액체의 관 둘에 반지름 r · 2r 인 구를
// 같은 순간 놓는다. 일정한 간격마다 자국을 남기므로 간격 = 속력이다. 둘 다 곧 간격이
// 고르게 되고(종단 속도), 큰 구의 간격이 작은 구의 네 배다. 큰 구가 바닥에 닿는 순간
// 작은 구는 4분의 1 만 내려와 있다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// 월드 한 단위 ≈ 화면 1 px 로 잡았다(높이 310 을 360 px 캔버스에 담는다).
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:stokes-drag` 와 문자 그대로 일치한다 (C4). */
export const STOKES_DRAG_ID = 'stokes-drag';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/**
 * 두 구의 반지름(월드). 정확히 두 배다 — 이 조각이 바꾸는 유일한 수.
 * 그림의 크기이자 물리의 반지름이다. 종단 속도의 비는 이 둘의 비의 제곱으로 나온다.
 */
export const RADIUS_SMALL = 7;
export const RADIUS_BIG = 14;

/**
 * 작은 구가 종단 속도에 다가가는 시간 상수(초). 큰 구는 반지름 제곱만큼 길다
 * (τ = 2ρr²/9η). 실제 유리구슬 · 글리세린이면 1 ms 남짓이라 눈에 보이지 않는다 —
 * 「곧 일정해진다」 를 보이려고 늘렸다 (NOTES (b)).
 */
export const RELAX_SMALL = 0.05;

/** 자국을 남기는 간격(초). 간격이 곧 속력이 된다. */
export const STROBE = 0.5;

// ------------------------------------------------------------------------
// 배치 — 월드. 관 둘을 나란히, 남는 오른쪽을 캡션에 내준다.
// ------------------------------------------------------------------------

/** 관 가운데 x — 작은 구 · 큰 구. */
export const TUBE_SMALL_X = 0;
export const TUBE_BIG_X = 130;
/** 관 안쪽 폭. 큰 구(지름 28)가 넉넉히 지나간다. */
export const TUBE_W = 64;
/** 관 바닥 · 액면 · 관 입구 높이. */
export const TUBE_BOTTOM = 0;
export const LIQUID_TOP = 250;
export const TUBE_TOP = 264;
/**
 * 두 구가 놓이는 중심 높이. 둘이 **같은 높이**에서 떠난다 — 다르면 「같은 시간에
 * 얼마나 내려왔나」 를 견줄 수 없다. 큰 구 윗면이 액면 아래 8 에 온다.
 */
export const RELEASE_Y = LIQUID_TOP - 8 - RADIUS_BIG;

/** 자국 획의 길이(월드). 관 안쪽 폭보다 조금 짧아 벽에 붙지 않는다. */
export const TICK_LEN = TUBE_W - 14;

/** 잰 거리 치수선이 관 벽에서 떨어진 거리(월드). 작은 관은 왼쪽, 큰 관은 오른쪽. */
export const MEASURE_GAP = 12;

/** 캡션 자리 — 관 오른쪽 여백. 세로 낙하는 왼쪽만 쓰므로 가로를 문장에 내준다. */
export const CAPTION_AT = { x: 222, y: 150, wrapWidth: 330, fontSize: 15 } as const;

/**
 * 프레이밍. 왼쪽은 작은 관의 치수선 · 기호, 오른쪽은 캡션 끝까지, 아래는 관 바닥,
 * 위는 관 입구 위 반지름 기호까지. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -78, maxX: 565, minY: -14, maxY: 292 } as const;

// ------------------------------------------------------------------------
// 시간표 — 한 주기 = 놓음 → 가라앉음 → 큰 구 도착 → 흐려짐
// ------------------------------------------------------------------------

/** 놓은 뒤 속력이 자리 잡는 동안. */
export const DROP = 0.8;
/** 고르게 가라앉는 동안. 이 단계가 끝나는 순간 큰 구가 바닥에 닿는다 (physics 가 속력을 거기서 되짚는다). */
export const SINK = 3.6;
/** 큰 구가 바닥에 닿은 그림을 읽는 동안 · 다음 주기로 넘어가며 흐려지는 동안. */
export const ARRIVE = 2.4;
export const FADE = 0.6;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const stokesDragMessages = Object.freeze({
  'label.title': { ko: '스토크스 항력', en: 'Stokes drag' },
  'label.operation': { ko: '느린 흐름에서의 저항', en: 'Drag in slow, viscous flow' },
  'label.stage': { ko: '끈적한 액체', en: 'Viscous liquid' },
  'label.view': { ko: '두 관', en: 'Two tubes' },
  /** 반지름 기호 · 잰 거리 기호. 수식 표기라 번역 대상이 아니다 (C1 판정 3). */
  'label.radiusSmall': { ko: 'r', en: 'r' },
  'label.radiusBig': { ko: '2r', en: '2r' },
  'label.depthSmall': { ko: 'd', en: 'd' },
  'label.depthBig': { ko: '4d', en: '4d' },
  'caption.drop': {
    ko: '같은 액체에 놓은 두 구가 곧 일정한 빠르기로 가라앉는다',
    en: 'Released in the same liquid, both spheres soon sink at a steady speed',
  },
  'caption.sink': {
    ko: '반지름이 두 배인 구는 자국 간격이 네 배 — 네 배 빠르게 가라앉는다',
    en: 'The sphere with twice the radius leaves marks four times as far apart — it sinks four times as fast',
  },
  'caption.arrive': {
    ko: '큰 구가 바닥에 닿았을 때 작은 구는 4분의 1 만큼만 내려왔다',
    en: 'When the big sphere reaches the bottom, the small one has come down only a quarter as far',
  },
} satisfies Record<string, LocalizedText>);

export type StokesDragMessageKey = keyof typeof stokesDragMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: StokesDragMessageKey): LocalizedText => stokesDragMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: StokesDragMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const stokesDragSchema: BundleSchema = {
  id: STOKES_DRAG_ID,
  label: text('label.title'),
  category: 'fluids',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 이미 가라앉고 있고, 큰 구가 닿으면 다시 놓는다 (controllers.ts).
  parameters: [],

  stages: [
    {
      id: 'default',
      label: text('label.stage'),
      constants: {
        radiusSmall: RADIUS_SMALL,
        radiusBig: RADIUS_BIG,
        relaxSmall: RELAX_SMALL,
        strobe: STROBE,
      },
    },
  ],
  environments: [],
  views: [{ id: 'main', label: text('label.view'), default: true }],

  /** 관 높이 264 + 기호 한 줄. 세로를 더 주면 가로가 먼저 차서 그림만 작아진다. */
  canvas: { height: 360, minHeight: 320 },

  /**
   * 한 주기. 놓는 순간과 큰 구가 닿는 순간이 단계 경계다 — physics 는 큰 구의 종단
   * 속도를 `sink` 가 끝나는 시각에서 되짚으므로, 단계를 늘여도 「닿는 순간」 과
   * 「4분의 1」 캡션이 화면과 어긋나지 않는다.
   */
  timeline: {
    phases: [
      { id: 'drop', duration: DROP, caption: key('caption.drop') },
      { id: 'sink', duration: SINK, caption: key('caption.sink') },
      { id: 'arrive', duration: ARRIVE, caption: key('caption.arrive') },
      { id: 'fade', duration: FADE, caption: key('caption.arrive') },
    ],
  },

  /** 도착한 순간 이미 가라앉는 중이다 — 자국이 몇 칸 쌓인 자리에서 연다. */
  startAt: 1.6,

  // 슬롯 하나. 관 오른쪽 여백에 문장을 세운다 (`terminal-velocity` 와 같은 배치).
  caption: {
    anchor: { world: [CAPTION_AT.x, CAPTION_AT.y] },
    align: 'left',
    fontSize: CAPTION_AT.fontSize,
    wrapWidth: CAPTION_AT.wrapWidth,
    style: { colorRole: 'ink', emphasis: 'strong' },
    fade: 0.3,
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것은 임의의 거리가 아니라 **자국 간격의 비**와
   * 「d 대 4d」 라, 거리 격자를 깔면 「몇 cm 인가」 라는 다른 질문이 끼어든다.
   */

  messages: stokesDragMessages,
};
