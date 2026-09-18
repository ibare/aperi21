// ========================================================================
// non-conservative-force — 선언
// ========================================================================
// 질문: 같은 A 에서 같은 B 로 옮겼는데, 마찰이 빼앗은 에너지는 왜 다른가.
//
// 같은 상자 둘을 같은 거친 바닥 위에서 같은 빠르기로 민다. 위 상자는 A 에서 B 로
// 곧장 가고, 아래 상자는 B 를 지나쳐 C 까지 갔다가 B 로 돌아온다. 처음 자리와
// 끝 자리는 둘이 같다. 그런데 마찰이 빼앗은 에너지(= 마찰력 × 지나온 길)는
// 아래 상자가 두 배다 — 돌아오는 동안에도 마찰은 방향을 바꿔 다시 붙잡으므로,
// 잃은 에너지는 되돌아오지 않고 길이만큼 쌓인다.
//
// 이웃 조각 `conservative-force` 는 두 길로 옮겨도 중력이 한 일이 같다는 것을
// 보인다. 이 조각은 그 짝이다 — 바닥이 수평이라 중력은 일을 하지 않고, 남는 것은
// 경로 길이를 따라가는 마찰의 일뿐이다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:non-conservative-force` 와 문자 그대로 일치한다 (C4). */
export const NON_CONSERVATIVE_FORCE_ID = 'non-conservative-force';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** A 에서 B 까지의 거리 L(m). 두 상자가 같다 — 처음 자리와 끝 자리가 같다. */
export const SPAN_AB = 4;
/**
 * 아래 상자가 B 를 지나쳐 더 가는 거리 D(m). 갔다가 같은 만큼 돌아오므로 아래 상자의
 * 경로는 L + 2D 다. D = L/2 라서 정확히 두 배(2L)가 된다.
 */
export const OVERSHOOT = SPAN_AB / 2;
/** 미는 빠르기(m/s). 두 상자가 같다 — 운동 마찰은 빠르기와 상관없지만 견주기 쉽게 맞춘다. */
export const PUSH_SPEED = 2;

// ------------------------------------------------------------------------
// 배치 — 월드 미터. 두 레인을 위아래로 둔다.
// ------------------------------------------------------------------------

/** 출발점 A 의 x. B 는 A + L. */
export const POINT_A = 0;

/** 위 레인(곧장 가는 상자) · 아래 레인(지나쳤다 돌아오는 상자)의 바닥 높이. */
export const LANE_DIRECT_Y = 1.45;
export const LANE_DETOUR_Y = 0;

/** 상자 크기 [가로, 세로](m). 둘이 같다 — 같은 상자라는 것이 주장의 전제다. */
export const BOX_SIZE: readonly [number, number] = [0.44, 0.3];
/** 거친 바닥이 끝나는 x. 아래 상자가 가장 멀리 가는 C 보다 조금 더 간다. */
export const ROUGH_END = SPAN_AB + OVERSHOOT + 0.7;
/** 거친 바닥이 시작하는 x. 상자가 A 에서 이미 거친 바닥 위에 있다. */
export const ROUGH_START = -0.7;

/** 잃은 에너지 막대 — 바닥선 아래 위 · 아래 끝(바닥선 기준 m). 거친 바닥의 결 아래에 붙는다. */
export const BAR_TOP = -0.24;
export const BAR_BOTTOM = -0.4;
/** 막대 1 m = 월드 1 m. 지나온 길을 그대로 펴 놓은 길이라 배율이 따로 없다. */
export const BAR_SCALE = 1;

/** 마찰 화살표의 길이(m)와 높이(바닥선 기준). 둘에게 같은 길이다 — 같은 힘이기 때문이다. */
export const FRICTION_ARROW_LEN = 0.4;
export const FRICTION_ARROW_Y = 0.15;

/** A · B 기준선의 위 · 아래 끝(월드 y). 두 레인과 두 막대를 세로로 꿴다. */
export const GUIDE_TOP_Y = LANE_DIRECT_Y + 0.62;
export const GUIDE_BOTTOM_Y = LANE_DETOUR_Y + BAR_BOTTOM - 0.1;
/** A · B 이름표 높이와, A→B 를 재는 치수선 높이. */
export const GUIDE_LABEL_Y = GUIDE_TOP_Y + 0.14;
export const SPAN_MEASURE_Y = LANE_DIRECT_Y + 0.46;

/**
 * 프레이밍은 주장의 일부다. 가로는 막대 이름표(A 왼쪽)부터 아래 막대가 닿는 2L 너머의
 * 끝 이름표까지, 세로는 아래 막대 밑 캡션 자리부터 A · B 이름표 위까지. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -1.6, maxX: 9.0, minY: -1.0, maxY: 2.35 } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이의 기본값을 물리에서 끌어온다 (경계 상수를 따로 두지 않는다)
// ------------------------------------------------------------------------

/** 둘 다 A 에 서 있는 동안(초). */
export const REST = 0.8;
/** 둘 다 A → B 로 가는 동안 = L / v. */
export const GO = SPAN_AB / PUSH_SPEED;
/** 아래 상자만 B → C 로 가는 동안 = D / v. */
export const OVERSHOOT_TIME = OVERSHOOT / PUSH_SPEED;
/** 아래 상자만 C → B 로 돌아오는 동안 = D / v. */
export const RETURN_TIME = OVERSHOOT / PUSH_SPEED;
/** 멈춘 그림을 읽는 동안 · 다음 주기로 넘어가며 흐려지는 동안. */
export const HOLD = 3.2;
export const FADE = 0.6;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const nonConservativeForceMessages = Object.freeze({
  'label.title': { ko: '비보존력', en: 'Non-conservative force' },
  'label.operation': { ko: '경로에 따라 달라지는 일', en: 'Work that depends on the path' },
  'label.stage': { ko: '거친 바닥', en: 'Rough floor' },
  'label.view': { ko: '두 레인', en: 'Two lanes' },
  /** 기준점 이름 · 거리 · 힘 기호. 도식 표식이라 번역 대상이 아니다 (C1 판정 3). */
  'label.pointA': { ko: 'A', en: 'A' },
  'label.pointB': { ko: 'B', en: 'B' },
  'label.span': { ko: 'L', en: 'L' },
  'label.friction': { ko: 'f', en: 'f' },
  /** 막대 끝 표식 — 마찰력 × 지나온 길. 수식 표기다. */
  'label.lossDirect': { ko: 'fL', en: 'fL' },
  'label.lossDetour': { ko: '2fL', en: '2fL' },
  /** 막대 이름표. 조사가 붙는 낱말이라 문안이다. */
  'label.lost': { ko: '잃은 에너지', en: 'energy lost' },
  'caption.rest': {
    ko: '같은 상자 둘을 거친 바닥 위 A 에서 B 로, 같은 빠르기로 밀어 옮긴다',
    en: 'Two identical blocks are pushed at the same speed from A to B across a rough floor',
  },
  'caption.go': {
    ko: '움직이는 내내 마찰이 붙잡고, 잃은 에너지가 지나온 길이만큼 쌓인다',
    en: 'Friction holds them back the whole way — the energy lost grows with the distance covered',
  },
  'caption.overshoot': {
    ko: '위 상자는 B 에 섰다 — 아래 상자는 B 를 지나쳐 더 간다',
    en: 'The upper block stops at B — the lower one overshoots',
  },
  'caption.return': {
    ko: '돌아오는 길에도 마찰은 방향을 바꿔 다시 붙잡는다 — 잃은 에너지는 줄지 않는다',
    en: 'On the way back friction turns around and holds it back again — the loss never shrinks',
  },
  'caption.result': {
    ko: '같은 A 에서 같은 B 로 왔는데, 두 배 먼 길을 간 상자가 두 배를 잃었다',
    en: 'Same A, same B — the block that took a path twice as long lost twice as much',
  },
} satisfies Record<string, LocalizedText>);

export type NonConservativeForceMessageKey = keyof typeof nonConservativeForceMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: NonConservativeForceMessageKey): LocalizedText => nonConservativeForceMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: NonConservativeForceMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const nonConservativeForceSchema: BundleSchema = {
  id: NON_CONSERVATIVE_FORCE_ID,
  label: text('label.title'),
  category: 'mechanics',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 바로 밀려 가고, 지나치고, 돌아오고, 막대가 한 칸과 두 칸으로 남는다.
  parameters: [],

  stages: [
    {
      id: 'rough-floor',
      label: text('label.stage'),
      constants: { span: SPAN_AB, overshoot: OVERSHOOT },
    },
  ],

  environments: [],

  views: [{ id: 'lanes', label: text('label.view'), default: true }],

  /**
   * 가로 10.6 m 를 담아야 하고 세로는 두 레인(1.45 m 간격)과 막대 · 캡션 줄뿐이다.
   * 세로를 더 주면 가로가 먼저 차서 그림만 작아진다 (S-piece — 세로가 비싸다).
   */
  canvas: { height: 320, minHeight: 290 },

  /**
   * 겹침이 판정 장치다. 기준선(A · B)은 상자 · 막대 **뒤**로 지나가야 한다. 층 순서로는
   * `region`(막대)이 물체 위로 올라온다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = A 에 섬 → 둘 다 A→B → 아래만 B→C → 아래만 C→B → 멈춘 그림 → 흐려짐.
   *
   * 상자의 자리는 물리가 아니라 **이 시간표가** 정한다 — scene 이 `at('go')` 등으로
   * 읽는다. 그래서 단계를 늘이면 그 구간을 더 천천히 갈 뿐 도착점(B)과 경로 길이(L · 2L)는
   * 그대로다. 기본 길이는 거리 / 빠르기라 두 상자가 A→B 를 같은 빠르기로 간다.
   */
  timeline: {
    phases: [
      { id: 'rest', duration: REST, caption: key('caption.rest') },
      { id: 'go', duration: GO, caption: key('caption.go') },
      { id: 'overshoot', duration: OVERSHOOT_TIME, caption: key('caption.overshoot') },
      { id: 'return', duration: RETURN_TIME, caption: key('caption.return') },
      { id: 'hold', duration: HOLD, caption: key('caption.result') },
      { id: 'fade', duration: FADE, caption: key('caption.result') },
    ],
  },

  /**
   * 도착한 순간 이미 진행 중이다 — 두 상자가 A 를 떠나 막대가 자라기 시작한 자리에서
   * 연다. 0 이면 둘 다 A 에 서 있는 멈춘 그림이 먼저 보인다.
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
   * 그리드 · 카메라 단추 없음(기본값). 잴 것은 임의의 거리가 아니라 **막대가 L 의 몇
   * 배인가** 라, 거리 격자를 깔면 「몇 미터인가」 라는 다른 질문이 끼어든다. 기준은
   * A · B 기준선과 L 치수선이 직접 준다.
   */

  messages: nonConservativeForceMessages,
};
