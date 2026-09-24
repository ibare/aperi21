// ========================================================================
// magnetic-field-lines — 선언
// ========================================================================
// 질문: 전기력선은 + 전하에서 나와 − 전하에서 끝난다. 자기력선도 N극에서 나와 S극에서
// 끝나는가.
//
// 끝나지 않는다. 선 하나를 따라가는 점이 바깥에서는 N극에서 나와 S극으로 휘어 들고,
// S극에서 멈추지 않고 **자석 속을 지나** N극으로 나와 제자리로 돌아온다. 시작도 끝도 없는
// 닫힌 고리다. 자석을 잘라 떼어 놓아도 잘린 면이 새 N극 · S극이 될 뿐, 반쪽 둘레의 선도
// 똑같이 자석 속을 지나 닫힌다 — 선이 끝날 자리(홀로 있는 극)는 생기지 않는다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:magnetic-field-lines` 와 문자 그대로 일치한다 (C4). */
export const MAGNETIC_FIELD_LINES_ID = 'magnetic-field-lines';

// ------------------------------------------------------------------------
// 물리 · 배치 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 막대자석의 길이 · 폭(월드 단위). 세워 둔다 — N극이 위다. */
export const MAGNET_LENGTH = 2.2;
export const MAGNET_WIDTH = 0.46;
/** 잘라 떼어 놓았을 때 두 반쪽 사이의 틈(월드). */
export const CUT_GAP = 1;
/** 자석 위 · 아래 각각에 두는 선 수. 선 사이마다 지나는 자속이 같다. */
export const LINES_PER_SIDE = 6;
/**
 * 가장 바깥 선이 자석 가운데 높이에서 자석으로부터 떨어진 거리(월드). 이보다 바깥 선은 그림
 * 밖으로 돌아 나가 닫히는 것을 보일 수 없어 두지 않는다.
 */
export const OUTER_REACH = 3.0;
/** 온 자석에서 점이 따라가는 선 — 자석에 붙은 선부터 바깥으로 센 번호(0 부터). */
export const TRACED_LINE = 4;
/** 잘린 뒤 왼쪽 반쪽에서 점이 따라가는 선의 번호. 그 반쪽만 도는 선을 고른다. */
export const TRACED_LINE_CUT = 3;

/**
 * 프레이밍은 주장의 일부다 — 자석 둘레의 닫힌 선들과 그 아래 캡션 줄. 매 프레임 같은
 * 값이다 (원칙 6 · S-piece).
 */
export const SCENE_BOUNDS = { minX: -4.35, maxX: 4.35, minY: -2.4, maxY: 2.0 } as const;
/**
 * 선이 들어가야 하는 자리 — 자석 가운데에서 자석을 따라(`along`, 화면 세로) · 가로질러
 * (`across`, 화면 가로) 잰 반폭. 이 밖으로 나가는 선은 닫히는 것을 화면에서 보일 수 없어
 * 그리지 않는다. `SCENE_BOUNDS` 안에 든다.
 */
export const LINE_BOUNDS = { along: 1.95, across: 4.3 } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이(초)
// ------------------------------------------------------------------------

/** 점이 N극에서 나와 바깥을 돌아 S극으로 드는 동안. */
export const OUTSIDE = 3.2;
/** 점이 자석 속을 S극에서 N극으로 지나 제자리로 돌아오는 동안. */
export const INSIDE = 1.6;
/** 닫힌 고리를 읽는 동안. */
export const CLOSED = 1.8;
/** 자름선이 그어지는 동안. */
export const CUT = 1;
/** 두 반쪽이 떨어지는 동안 — 잘린 면에 새 극 표식이 떠오른다. */
export const SPLIT = 1.6;
/** 왼쪽 반쪽 둘레에서 점이 바깥을 도는 동안. */
export const OUTSIDE_CUT = 2.4;
/** 점이 반쪽 자석 속을 지나 돌아오는 동안. */
export const INSIDE_CUT = 1.2;
/** 반쪽의 닫힌 고리를 읽는 동안. */
export const CLOSED_CUT = 1.8;
/** 두 반쪽이 다시 맞붙는 동안. */
export const REJOIN = 1.4;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const magneticFieldLinesMessages = Object.freeze({
  'label.title': { ko: '자기력선', en: 'Magnetic field lines' },
  'label.stage': { ko: '막대자석', en: 'Bar magnet' },
  'label.view': { ko: '자석 둘레', en: 'Around the magnet' },
  /** 자극 표식. 자석에 새겨진 글자라 번역하지 않는다 (C1 판정 1). */
  'label.north': { ko: 'N', en: 'N' },
  'label.south': { ko: 'S', en: 'S' },
  'caption.outside': {
    ko: '선을 따라가면 — 바깥에서는 N극에서 나와 S극으로 들어간다',
    en: 'Follow one line — outside, it leaves the N pole and curves into the S pole',
  },
  'caption.inside': {
    ko: 'S극에서 끝나지 않고 자석 속을 지나 N극으로 간다',
    en: 'It does not end at S — it runs on through the magnet to N',
  },
  'caption.closed': {
    ko: '제자리로 돌아와 닫혔다 — 시작도 끝도 없는 고리',
    en: 'Back where it started — a closed loop with no beginning and no end',
  },
  'caption.cut': {
    ko: '자석을 가운데에서 자른다',
    en: 'Cut the magnet through the middle',
  },
  'caption.split': {
    ko: '떼어 놓으면 잘린 면이 새 N극 · S극이 된다',
    en: 'Pulled apart, each cut face becomes a new N or S pole',
  },
  'caption.outsideCut': {
    ko: '반쪽에서도 선은 새 N극에서 나와 S극으로 들어가고',
    en: 'On one piece, a line leaves its new N pole and curves into its S pole',
  },
  'caption.insideCut': {
    ko: '자석 속을 지나 다시 N극으로 간다',
    en: 'then runs on through the piece back to N',
  },
  'caption.closedCut': {
    ko: '잘라도 선은 끊기지 않는다 — 반쪽 둘레에서도 닫힌다',
    en: 'Cutting does not break the lines — they close around each piece too',
  },
  'caption.rejoin': {
    ko: '다시 맞붙이면 한 자석의 선으로 돌아간다',
    en: 'Put back together, the lines are those of one magnet again',
  },
} satisfies Record<string, LocalizedText>);

export type MagneticFieldLinesMessageKey = keyof typeof magneticFieldLinesMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: MagneticFieldLinesMessageKey): LocalizedText => magneticFieldLinesMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: MagneticFieldLinesMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const magneticFieldLinesSchema: BundleSchema = {
  id: MAGNETIC_FIELD_LINES_ID,
  title: text('label.title'),
  category: 'em',
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 점이 선을 따라 돌고, 자석이 잘리고, 다시 붙는다.
  parameters: [],

  stages: [
    {
      id: 'bar-magnet',
      label: text('label.stage'),
      constants: {
        magnetLength: MAGNET_LENGTH,
        magnetWidth: MAGNET_WIDTH,
        cutGap: CUT_GAP,
        linesPerSide: LINES_PER_SIDE,
        outerReach: OUTER_REACH,
        tracedLine: TRACED_LINE,
        tracedLineCut: TRACED_LINE_CUT,
      },
    },
  ],

  environments: [],

  views: [{ id: 'around', label: text('label.view'), default: true }],

  /**
   * 가로로 누운 막대 둘레의 고리는 양옆으로 퍼진다. 세로를 더 주면 가로가 먼저 차서 그림만
   * 작아진다 (S-piece — 세로가 비싸다).
   */
  canvas: { height: 384, minHeight: 340 },

  /**
   * 한 주기 = 온 자석에서 한 바퀴 → 자르고 떼기 → 반쪽에서 한 바퀴 → 다시 붙기.
   *
   * 점의 자리는 `outside` · `inside` 진행도가 정한다 — 바깥 몫과 자석 속 몫을 코드로 나누지
   * 않는다. 틈은 `split` 진행도로 벌어지고 `rejoin` 진행도로 닫힌다.
   */
  timeline: {
    phases: [
      { id: 'outside', duration: OUTSIDE, caption: key('caption.outside') },
      { id: 'inside', duration: INSIDE, caption: key('caption.inside') },
      { id: 'closed', duration: CLOSED, caption: key('caption.closed') },
      { id: 'cut', duration: CUT, ease: 'smooth', caption: key('caption.cut') },
      { id: 'split', duration: SPLIT, ease: 'smooth', caption: key('caption.split') },
      { id: 'outsideCut', duration: OUTSIDE_CUT, caption: key('caption.outsideCut') },
      { id: 'insideCut', duration: INSIDE_CUT, caption: key('caption.insideCut') },
      { id: 'closedCut', duration: CLOSED_CUT, caption: key('caption.closedCut') },
      { id: 'rejoin', duration: REJOIN, ease: 'smooth', caption: key('caption.rejoin') },
    ],
  },

  /**
   * 도착한 순간 이미 진행 중이다 — 점이 N극을 막 떠나 바깥을 돌고 있는 자리에서 연다.
   */
  startAt: 0.6,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 정의와 공식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    fade: 0.25,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /**
   * 그리는 순서가 판정 장치다 — 자석 면 → 선 → 자석 윤곽 · 표식 → 따라가는 선 · 점.
   * 자석 속을 지나는 선이 자석 면에 가려지면 「자석 속을 지난다」 가 안 보인다.
   */
  drawOrder: 'scene',

  // 그리드 · 카메라 단추 없음(기본값). 잴 것이 거리가 아니라 선의 이어짐이다.

  messages: magneticFieldLinesMessages,
};
