// ========================================================================
// continuity-equation — 선언
// ========================================================================
// 질문: 관이 좁아지면 왜 물이 빨라지는가.
//
// 동사: **같은 양이 지나간다 — 가는 쪽에서는 두 배 길게 뻗으며.** 굵은 곳과 절반 굵기
// 곳에 문을 하나씩 두고, 같은 시간 동안 각 문을 지나간 물을 칠한다. 굵은 문의 칠은
// 짧고 굵게, 가는 문의 칠은 두 배 빨리 뻗어 가늘고 길게 자란다. 멈추고 보면 둘 다
// 같은 정사각 두 칸이다 — 쌓였느냐 나란하냐만 다르다.
//
// 압력은 이야기하지 않는다 — 그것은 이웃 `bernoullis-principle` 의 몫이다.
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:continuity-equation` 와 문자 그대로 일치한다 (C4). */
export const CONTINUITY_EQUATION_ID = 'continuity-equation';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 굵은 곳의 유속(m/s). */
export const SPEED_WIDE = 0.35;
/** 굵은 곳의 관 굵기(m). 옆에서 본 그림이라 굵기가 곧 단면적을 대신한다. */
export const WIDE_HEIGHT = 1.4;
/** 가는 곳 단면 ÷ 굵은 곳 단면. 절반 — 이 조각이 말하는 「두 배」 가 여기서 나온다. */
export const AREA_RATIO = 0.5;

// ------------------------------------------------------------------------
// 배치 — 월드 미터. 관 중심선이 y = 0 이다.
// ------------------------------------------------------------------------

/** 관 입구 · 가늘어지기 시작 · 가늘어짐 끝 · 관 출구. */
export const PIPE = { xIn: -5.0, taperStart: -1.0, taperEnd: -0.2, xOut: 5.5 } as const;
/** 두 문의 자리 — 굵은 곳 · 가는 곳. 칠한 물이 흘러가도 가늘어지는 목에 닿지 않게 둔다. */
export const GATE_WIDE_X = -3.9;
export const GATE_NARROW_X = 0.5;

/** 흐름 점 — 한 단면에 놓는 줄 수, 굵은 곳에서의 가로 간격(m), 벽에서 띄우는 비율. */
export const DOTS = { rows: 6, spacingWide: 0.2, wallMargin: 0.88 } as const;
/** 점 꼬리 = 속도 × 이 시간(초). 가는 곳 꼬리가 두 배 길어 빠르기가 길이로 읽힌다. */
export const DOT_TRAIL_SECONDS = 0.3;
/** 흐름 점의 모양(화면 px) — 점 반지름 · 꼬리 굵기 · 꼬리 짙기. 칠 위에서도 읽히는 정도. */
export const DOT_STYLE = { size: 1.8, trailWidth: 1.4, trailOpacity: 0.55 } as const;
/** 문 단면 기호(A · A/2)의 글자 크기(화면 px). */
export const GATE_LABEL_FONT_PX = 13;

/** 치수선이 관 윗벽 위로 뜨는 거리(m). 문 이름표가 관 아랫벽 아래로 내려가는 거리(m). */
export const DIM_LIFT = 0.18;
export const GATE_LABEL_DROP = 0.22;
/** 문 점선이 벽 밖으로 삐져나오는 길이(m). 문이 벽에 걸친 표지로 읽히게. */
export const GATE_OVERHANG = 0.08;

/** 선 굵기(화면 px). 벽 · 문 · 칸 나눔선. 굵기는 물리량이 아니라 위계다. */
export const LINE_PX = { wall: 2, gate: 1.2, divider: 1.5 } as const;
/** 칠한 물의 채움 짙기. 관 속 물(기본 0.42) 위에 얹혀 갈리도록 짙게. */
export const PAINT_FILL = 0.62;

/**
 * 프레이밍은 주장의 일부다. 가로는 관 입구부터 출구까지, 세로는 치수 글자(위)와
 * 문 이름표 · 캡션 줄(아래). 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -5.2, maxX: 5.7, minY: -1.55, maxY: 1.2 } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이 기본값
// ------------------------------------------------------------------------

/** 칠하기 전 그냥 흐르는 동안. 도착한 독자가 빠르기 차이부터 본다. */
export const FLOW = 2.0;
/**
 * 두 문이 물을 칠하는 동안(초). 굵은 곳 칠의 길이는 `SPEED_WIDE × COUNT` = 0.7 m 로
 * 굵은 관 굵기의 절반 — 그래서 칠한 물이 **정사각 두 칸**이 된다.
 */
export const COUNT = 2.0;
/** 칸 나눔선 · 치수가 떠오르는 동안. */
export const REVEAL = 0.5;
/** 두 칠을 견주는 동안. 칠한 물은 계속 흘러간다. */
export const COMPARE = 2.4;
/** 칠이 옅어져 다음 주기로 넘어가는 동안. */
export const FADE = 0.8;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const continuityEquationMessages = Object.freeze({
  'label.title': { ko: '연속 방정식', en: 'Continuity equation' },
  'label.operation': { ko: '단면적과 유속의 반비례', en: 'Cross-section and flow speed trade off' },
  'label.stage': { ko: '가늘어지는 관', en: 'Narrowing pipe' },
  'label.view': { ko: '옆에서 본 관', en: 'Side view' },
  /** 문의 단면적 기호. 수식 표기라 번역하지 않는다 (C1 판정 3). */
  'label.gateWide': { ko: 'A', en: 'A' },
  'label.gateNarrow': { ko: 'A/2', en: 'A/2' },
  /** 칠한 물의 길이 기호. 표식이다. */
  'label.length': { ko: 'ℓ', en: 'ℓ' },
  'label.length2': { ko: '2ℓ', en: '2ℓ' },
  'caption.flow': {
    ko: '한 물줄기가 굵은 곳에서는 느리게, 가는 곳에서는 빠르게 흐른다',
    en: 'One stream runs slowly where the pipe is wide and fast where it is narrow',
  },
  'caption.count': {
    ko: '두 문을 같은 시간 동안 지나가는 물을 칠한다 — 가는 쪽 칠이 두 배 빨리 뻗는다',
    en: 'Paint the water passing each gate for the same time — the narrow one stretches out twice as fast',
  },
  'caption.compare': {
    ko: '칠한 물은 둘 다 두 칸 — 같은 양이 절반 굵기에서는 두 배 길게, 두 배 빠르게 지나갔다',
    en: 'Both painted slugs are two squares — the same amount went through half the width twice as long, twice as fast',
  },
} satisfies Record<string, LocalizedText>);

export type ContinuityEquationMessageKey = keyof typeof continuityEquationMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: ContinuityEquationMessageKey): LocalizedText => continuityEquationMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ContinuityEquationMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const continuityEquationSchema: BundleSchema = {
  id: CONTINUITY_EQUATION_ID,
  label: text('label.title'),
  category: 'fluids',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 흐르고, 칠하고, 견주고, 다시 흐른다.
  parameters: [],

  stages: [
    {
      id: 'narrowing-pipe',
      label: text('label.stage'),
      constants: { speed: SPEED_WIDE, wideHeight: WIDE_HEIGHT, areaRatio: AREA_RATIO },
    },
  ],

  environments: [],

  views: [{ id: 'side', label: text('label.view'), default: true }],

  /** 가로 11 m 짜리 관 하나와 캡션 한 줄. 세로를 더 주면 가로가 먼저 차서 그림만 작아진다. */
  canvas: { height: 280, minHeight: 250 },

  /**
   * 겹침이 판정 장치다 — 칠한 물은 관 속 물 **위**, 흐름 점은 칠 위, 벽 · 문은 그 위.
   * 층 순서로는 `region` 이 입자 위로 올라와 칠 속 점이 가려진다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 흐름 → 칠하기 → 칸 드러내기 → 견주기 → 옅어짐.
   *
   * 칠한 물의 길이는 `duration('count')` 에서 나온다 — 여기를 늘이면 두 칠이 함께 길어지고
   * 「같은 양」 은 그대로 남는다(칸이 정사각이 아니게 될 뿐이다).
   */
  timeline: {
    phases: [
      { id: 'flow', duration: FLOW, caption: key('caption.flow') },
      { id: 'count', duration: COUNT, caption: key('caption.count') },
      { id: 'reveal', duration: REVEAL, ease: 'smooth', caption: key('caption.compare') },
      { id: 'compare', duration: COMPARE, caption: key('caption.compare') },
      { id: 'fade', duration: FADE, ease: 'smooth', caption: key('caption.compare') },
    ],
  },

  /** 도착한 순간 이미 흐르고 있다 — 흐름 점은 시계의 함수라 첫 프레임부터 관을 채운다. */
  startAt: 1.0,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — Av 공식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 720,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것은 미터가 아니라 **칸 수**다 — 칠한 물을
   * 굵은 관 반 굵기의 정사각으로 나눠 두 칸 = 두 칸 을 직접 세게 한다.
   */

  messages: continuityEquationMessages,
};
