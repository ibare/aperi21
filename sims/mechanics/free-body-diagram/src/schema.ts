// ========================================================================
// free-body-diagram — 선언
// ========================================================================
// 질문: 책이 받는 힘은 무엇인가 — 컵의 무게가 책에 걸리는가?
// 답의 동사: 한 물체를 떼어 내면 그 물체가 받는 힘만 **따라 나온다.**
//
// 원본: tasks/piece-lab/free-body-diagram
// ========================================================================

import type { BundleSchema, LocalizedText, Vec2 } from '@aperi21/schema';

/** 등록 키 `aperi21:free-body-diagram` 와 문자 그대로 일치한다 (C4). */
export const FREE_BODY_DIAGRAM_ID = 'free-body-diagram';

// ------------------------------------------------------------------------
// 좌표 — 원본 논리 좌표(860 × 260 px, y 아래)를 월드로 옮긴다.
// 월드 1 단위 = 원본 100 px, 바닥선(원본 y 240)이 y = 0, y 는 위.
// ------------------------------------------------------------------------

/** 원본 바닥선 y(px). */
const FLOOR_PX = 240;

/** 원본 픽셀 좌표 → 월드. */
export function px(x: number, y: number): Vec2 {
  return [x / 100, (FLOOR_PX - y) / 100];
}

/** 떼어 낸 물체가 옮겨 가는 가로 거리. 원본 SHIFT 430 px. */
export const SHIFT = 4.3;
/** 옮기는 동안 들어 올리는 높이의 꼭대기. 원본 18 px. */
export const LIFT = 0.18;

/** 떼어 낼 물체. 원본 순서 — 가장 헷갈리는 책부터. */
export type ObjectId = 'book' | 'cup' | 'table';
export const ORDER: readonly ObjectId[] = ['book', 'cup', 'table'];

// 질량(kg)과 중력가속도. 힘의 크기는 화살표 길이로만 나온다 — 숫자는 두지 않는다.
const G = 9.8;
const M_CUP = 0.3;
const M_BOOK = 1.2;
const M_TABLE = 4.0;
const F_TABLE_LEG = ((M_TABLE + M_BOOK + M_CUP) * G) / 2;

/**
 * 화살표 길이 배율 — 월드 단위 / N. 원본 좌표로 6 px/N 이다.
 *
 * **크기에 비례한다 (사용자 승인 수정).** 원본은 14 + 13·√F px 로 크기 순서만 지켰다.
 * 책상 무게(39.2 N)는 바닥선 아래로 1.2 넘어가고 컵의 힘(2.94 N)은 0.18 이다. 컵의
 * 화살표가 컵 몸통 안에서도 머리가 읽히는 가장 작은 값이고, 그 대가로 캔버스가 세로로
 * 길어졌다 (NOTES (a)).
 */
export const FORCE_SCALE = 0.06;

/**
 * 힘 아홉. `on` 은 힘을 **받는** 물체 — 그 물체를 떼어 내면 이 화살표가 따라간다.
 * `at` 은 작용점(월드), `dir` 은 +1 아래 / −1 위, `label` 은 떼어 냈을 때 붙는 이름표의
 * 자리(`labelAt`)와 정렬. 좌표는 원본 FORCES 그대로다.
 */
export interface ForceDef {
  id: string;
  on: ObjectId;
  at: Vec2;
  dir: 1 | -1;
  newtons: number;
  label: ForceLabelKey;
  labelAt: Vec2;
  labelAlign: 'left' | 'right';
}

export const FORCES: readonly ForceDef[] = [
  { id: 'earth-cup', on: 'cup', at: px(215, 69), dir: 1, newtons: M_CUP * G, label: 'label.earthPulls', labelAt: px(224, 114), labelAlign: 'left' },
  { id: 'book-cup', on: 'cup', at: px(201, 94), dir: -1, newtons: M_CUP * G, label: 'label.bookSupports', labelAt: px(188, 60), labelAlign: 'right' },
  { id: 'cup-book', on: 'book', at: px(229, 94), dir: 1, newtons: M_CUP * G, label: 'label.cupPresses', labelAt: px(222, 82), labelAlign: 'right' }, // 원본 88 — 배율이 줄어 책 윗변에 걸려 올렸다
  { id: 'earth-book', on: 'book', at: px(172, 107), dir: 1, newtons: M_BOOK * G, label: 'label.earthPulls', labelAt: px(164, 164), labelAlign: 'right' },
  { id: 'table-book', on: 'book', at: px(266, 120), dir: -1, newtons: (M_BOOK + M_CUP) * G, label: 'label.tableSupports', labelAt: px(274, 60), labelAlign: 'left' },
  { id: 'book-table', on: 'table', at: px(282, 120), dir: 1, newtons: (M_BOOK + M_CUP) * G, label: 'label.bookPresses', labelAt: px(275, 152), labelAlign: 'right' },
  { id: 'earth-table', on: 'table', at: px(215, 126), dir: 1, newtons: M_TABLE * G, label: 'label.earthPulls', labelAt: px(222, 222), labelAlign: 'left' },
  { id: 'floor-leg-left', on: 'table', at: px(88, FLOOR_PX), dir: -1, newtons: F_TABLE_LEG, label: 'label.floorSupports', labelAt: px(80, 164), labelAlign: 'right' },
  { id: 'floor-leg-right', on: 'table', at: px(342, FLOOR_PX), dir: -1, newtons: F_TABLE_LEG, label: 'label.floorSupports', labelAt: px(350, 164), labelAlign: 'left' },
];

// ------------------------------------------------------------------------
// 모양 — 원본 그리기 함수의 꼭짓점 그대로
// ------------------------------------------------------------------------

/** 컵 몸통(사다리꼴). */
export const CUP_BODY: readonly Vec2[] = [px(193, 44), px(237, 44), px(233, 94), px(197, 94)];

/** 컵 손잡이 — 원본 베지어 (236,54) → (252,54) (252,80) → (234,80) 을 점으로 푼다. */
export const CUP_HANDLE: readonly Vec2[] = (() => {
  const p0 = [236, 54], p1 = [252, 54], p2 = [252, 80], p3 = [234, 80];
  const out: Vec2[] = [];
  const N = 16;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const a = (1 - t) ** 3, b = 3 * (1 - t) ** 2 * t, c = 3 * (1 - t) * t * t, d = t ** 3;
    out.push(px(a * p0[0]! + b * p1[0]! + c * p2[0]! + d * p3[0]!, a * p0[1]! + b * p1[1]! + c * p2[1]! + d * p3[1]!));
  }
  return out;
})();

/** 원본 좌표 사각형 → 네 꼭짓점. */
function rectPx(x: number, y: number, w: number, h: number): readonly Vec2[] {
  return [px(x, y), px(x + w, y), px(x + w, y + h), px(x, y + h)];
}

/** 책. */
export const BOOK_BODY = rectPx(150, 94, 130, 26);
/** 책의 쪽 선 두 줄. 윤곽(빈 자리)에는 없다. */
export const BOOK_PAGES: readonly (readonly Vec2[])[] = [
  [px(156, 101), px(274, 101)],
  [px(156, 113), px(274, 113)],
];

/** 책상 — 상판과 다리 둘. */
export const TABLE_PARTS: readonly (readonly Vec2[])[] = [
  rectPx(95, 120, 240, 12),
  rectPx(99, 132, 8, FLOOR_PX - 132),
  rectPx(323, 132, 8, FLOOR_PX - 132),
];

/** 바닥선과 빗금. 원본은 x 36 부터 12 px 간격으로 (x, 242) → (x − 8, 250). */
export const FLOOR_LINE: readonly Vec2[] = [px(30, FLOOR_PX), px(400, FLOOR_PX)];
export const FLOOR_HATCH: readonly Vec2[] = (() => {
  const out: Vec2[] = [];
  for (let x = 36; x < 400; x += 12) out.push(px(x - 4, 246));
  return out;
})();
/** 빗금 한 획의 월드 길이(원본 8√2 px)와 방향. */
export const HATCH_LENGTH = Math.hypot(8, 8) / 100;
export const HATCH_DIRECTION: Vec2 = [-1, -1];

/**
 * 누르는 자리 — 원본 HIT 사각형. 물체가 **쉬는 자리**다(조작기 선언은 움직이는 물체를
 * 따라가지 않는다). 겹치면 먼저 선언한 것이 잡힌다 — 원본도 컵 · 책 · 책상 순서로 훑었다.
 */
export const HIT: Readonly<Record<ObjectId, { min: Vec2; max: Vec2 }>> = {
  cup: { min: px(190, 94), max: px(250, 40) },
  book: { min: px(150, 120), max: px(280, 94) },
  table: { min: px(90, FLOOR_PX), max: px(340, 120) },
};

// ------------------------------------------------------------------------
// 한 물체의 주기 — 원본 상수 그대로 (초)
// ------------------------------------------------------------------------
//
// 시간표(`BundleSchema.timeline`)로 두지 않는다. 원본은 `{ k, pt }` 누적 상태로
// 움직이고 물체를 누르면 그 물체의 주기 한가운데로 뛴다 — 조각 시계의 함수가 아니다.
// 누적 상태를 쌓는 것은 `step` 이다 (NOTES (b)).

export const CYCLE = {
  /** 한 물체의 주기. */
  period: 9,
  /** 떼어 내기 시작 · 도착. */
  sepStart: 1.0,
  sepEnd: 3.0,
  /** 이름표가 나타나는 구간. */
  labelIn: 3.0,
  labelInEnd: 3.5,
  /** 돌려놓기 시작 · 끝. */
  returnStart: 7.5,
  returnEnd: 9.0,
  /** 돌려놓기 시작부터 이름표가 사라지는 시간. */
  labelOut: 0.4,
  /** 누르면 그 물체의 이 시각으로 뛴다 — 떼어 내기 0.2 초 전. */
  pressTo: 0.8,
} as const;

/** 원본은 도착한 순간 이미 움직이도록 주기 안 0.6 초에서 열었다. */
export const PREROLL = 0.6;

/**
 * 떼어 내지 않은 물체의 화살표 불투명도 — 떼어 내기 전(`rest`)과 오른쪽에 도착했을 때
 * (`away`). **사용자 승인 수정** — 원본은 먹색 1 → 0.5 라 왼쪽 장면의 아홉 화살표가 겹쳐
 * 읽히지 않았다 (NOTES (a)).
 */
export const OTHER_OPACITY = { rest: 0.45, away: 0.35 } as const;

/**
 * 프레이밍 — 고정. 가로는 원본 캔버스 폭(860 px) 그대로, 세로는 책상 무게 화살표 끝과
 * 캡션 자리를 담게 원본보다 내렸다.
 */
export const SCENE_BOUNDS = { minX: 0, maxX: 8.6, minY: -1.45, maxY: 2.3 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const freeBodyDiagramMessages = Object.freeze({
  'label.title': { ko: '자유물체도', en: 'Free-body diagram' },
  'label.operation': { ko: '한 물체에 작용하는 힘만 분리하기', en: 'Isolating the forces on a single body' },
  'label.stage': { ko: '기본', en: 'Default' },
  'label.view': { ko: '기본', en: 'Default' },

  // 떼어 낸 물체의 화살표에 붙는 이름표 — "누가 어떻게".
  'label.earthPulls': { ko: '지구가 당김', en: 'Earth pulls' },
  'label.bookSupports': { ko: '책이 받침', en: 'book supports' },
  'label.cupPresses': { ko: '컵이 누름', en: 'cup presses' },
  'label.tableSupports': { ko: '책상이 받침', en: 'table supports' },
  'label.bookPresses': { ko: '책이 누름', en: 'book presses' },
  'label.floorSupports': { ko: '바닥이 받침', en: 'floor supports' },

  'caption.book.lift': {
    ko: '책만 떼어 낸다. 책이 받는 힘만 따라 나온다.',
    en: 'Lift out only the book. Only the forces on the book come with it.',
  },
  'caption.book.free': {
    ko: '책이 받는 힘은 셋 — 지구·책상·컵이 준다. 책이 컵을 받치는 힘은 컵 쪽에 남는다.',
    en: 'The book feels three forces — from Earth, the table and the cup. The book pushing up on the cup stays with the cup.',
  },
  'caption.book.back': { ko: '책을 제자리에 돌려놓는다.', en: 'Put the book back.' },
  'caption.cup.lift': {
    ko: '컵만 떼어 낸다. 컵이 받는 힘만 따라 나온다.',
    en: 'Lift out only the cup. Only the forces on the cup come with it.',
  },
  'caption.cup.free': {
    ko: '컵이 받는 힘은 둘 — 지구와 책이 준다. 컵이 책을 누르는 힘은 책 쪽에 남는다.',
    en: 'The cup feels two forces — from Earth and the book. The cup pressing on the book stays with the book.',
  },
  'caption.cup.back': { ko: '컵을 제자리에 돌려놓는다.', en: 'Put the cup back.' },
  'caption.table.lift': {
    ko: '책상만 떼어 낸다. 책상이 받는 힘만 따라 나온다.',
    en: 'Lift out only the table. Only the forces on the table come with it.',
  },
  'caption.table.free': {
    ko: '책상이 받는 힘은 넷 — 지구·책·바닥 두 곳. 컵은 책상에 닿지 않아 목록에 없다.',
    en: 'The table feels four forces — from Earth, the book and the floor at two legs. The cup does not touch the table, so it is not on the list.',
  },
  'caption.table.back': { ko: '책상을 제자리에 돌려놓는다.', en: 'Put the table back.' },
} satisfies Record<string, LocalizedText>);

export type FreeBodyDiagramMessageKey = keyof typeof freeBodyDiagramMessages;
export type ForceLabelKey = Extract<FreeBodyDiagramMessageKey, `label.${string}`>;

export const text = (key: FreeBodyDiagramMessageKey): LocalizedText => freeBodyDiagramMessages[key];

/** 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: FreeBodyDiagramMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const freeBodyDiagramSchema: BundleSchema = {
  id: FREE_BODY_DIAGRAM_ID,
  label: text('label.title'),
  category: 'mechanics',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 숫자·질량 조절은 두지 않는다 — 주장은 크기가 아니라 소속이다 (원본 inventory 「hidden」).
  parameters: [],
  stages: [{ id: 'default', label: text('label.stage'), constants: {} }],
  environments: [],
  views: [{ id: 'default', label: text('label.view'), default: true }],

  canvas: { height: 440, minHeight: 380 },

  // 누적 상태라 시계를 앞당기지 않고 걸음을 미리 굴린다 (원본 pt 0.6 에서 시작).
  preroll: PREROLL,

  // 원본이 그린 순서 그대로 겹친다 — 바닥 · 빈 자리 · 책상 · 책 · 컵 · 화살표 · 이름표.
  drawOrder: 'scene',

  /**
   * 원본은 캔버스 아래 DOM 한 줄(15 px 먹색). 문장이 갈리는 것은 **지금 떼어 내는 물체와
   * 그 주기 안 시각** — 둘 다 누적 상태라 `cases` 로 고른다. 플래그는 `step` 이 계산한다.
   */
  caption: {
    anchor: { screen: 'bottom-left', offset: [8, -8] },
    align: 'left',
    fontSize: 15,
    style: { colorRole: 'ink', emphasis: 'strong' },
    text: key('caption.book.lift'),
    cases: [
      { when: 'caption.bookLift', text: key('caption.book.lift') },
      { when: 'caption.bookFree', text: key('caption.book.free') },
      { when: 'caption.bookBack', text: key('caption.book.back') },
      { when: 'caption.cupLift', text: key('caption.cup.lift') },
      { when: 'caption.cupFree', text: key('caption.cup.free') },
      { when: 'caption.cupBack', text: key('caption.cup.back') },
      { when: 'caption.tableLift', text: key('caption.table.lift') },
      { when: 'caption.tableFree', text: key('caption.table.free') },
      { when: 'caption.tableBack', text: key('caption.table.back') },
    ],
  },

  // 그리드도 카메라 버튼도 없다 (기본값). 숫자·축·범례·재생 단추 없음 (원본 NOTES (c)).

  messages: freeBodyDiagramMessages,
};
