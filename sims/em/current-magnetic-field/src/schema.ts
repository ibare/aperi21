// ========================================================================
// current-magnetic-field — 선언
// ========================================================================
// 질문: 전선에 전류를 흘리면 옆에 놓인 나침반 바늘은 어디를 가리키게 될까.
//
// 전선을 감아 도는 고리 쪽으로 돌아선다. 그리고 **멀수록 덜 돌아선다** —
// 전선장이 1/r 로 약해져 지구장에 덜 이기기 때문이다.
//
// 원본: tasks/piece-lab/current-magnetic-field/ (자유 구현)
// ========================================================================

import type { BundleSchema, LocalizedText, TimelinePhase, Vec2 } from '@aperi21/schema';

/** 등록 키 `aperi21:current-magnetic-field` 와 문자 그대로 일치한다 (C4). */
export const CURRENT_MAGNETIC_FIELD_ID = 'current-magnetic-field';

// ------------------------------------------------------------------------
// 자리와 크기
// ------------------------------------------------------------------------
//
// **월드 한 단위는 원본 화면의 1 px 이고 원점은 전선이다.** 원본이 픽셀로 고른
// 링 반지름·바늘 길이·여백을 숫자 그대로 옮기기 위한 선택이다. 그리드도 치수선도
// 없으므로 이 단위가 화면에 미터로 읽힐 자리는 없다.

/** 전선이 화면을 뚫고 나오는 자리. 원점이다. */
export const WIRE: Vec2 = [0, 0];

/**
 * 전선장과 지구장의 크기가 같아지는 반지름(중립 반경).
 *
 * 링 넷이 이 값을 사이에 두도록 골랐다 — 안쪽 둘은 고리를 이루고 바깥 둘은
 * 북쪽으로 펴진다. 화면에 그리지 않는다: 원을 그으면 축·그리드가 된다.
 */
export const NEUTRAL_RADIUS = 130;

/** 지구 자기장. 화면 위쪽이 북이고 크기는 어디서나 1 이다. */
export const EARTH_FIELD: Vec2 = [0, 1];

/**
 * 바늘이 알짜 자기장을 따라가는 속도 계수.
 *
 * 회전이 `|B|` 에 비례하므로 먼 바늘일수록 느리게 돈다 — 감쇠를 따로 넣지
 * 않아도 거리가 속도를 정한다.
 */
export const FOLLOW_RATE = 1.0;

/**
 * 나침반을 놓는 동심 링. 격자가 아니다 — 링은 **같은 거리를 이미 묶어 준다.**
 * 한 링이 통째로 같은 양만큼 기울고, 링마다 그 양이 다르다.
 */
export const RINGS: readonly { r: number; count: number; offset: number }[] = [
  { r: 40, count: 5, offset: 0.31 },
  { r: 86, count: 10, offset: 0.17 },
  { r: 160, count: 18, offset: 0.42 },
  { r: 270, count: 30, offset: 0.09 },
];

/**
 * 바늘을 놓을 수 있는 자리. 이 밖으로 나가는 표본은 **놓지 않는다** —
 * 잘린 바늘은 방향을 거짓말한다. 가장 바깥 링이 좌우 호에만 남는 것은
 * 그래서다.
 */
export const SAMPLE_BOUNDS = { minX: -410, maxX: 410, minY: -187, maxY: 173 } as const;

/**
 * 프레이밍. 원본 캔버스(860 × 420, 전선은 왼쪽에서 430 · 위에서 193)를 그대로
 * 옮긴 고정 경계다. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (S-piece).
 */
export const SCENE_BOUNDS = { minX: -430, maxX: 430, minY: -227, maxY: 193 } as const;

/** 바늘 반길이 · 허리 반폭 · 축 점 반지름. 월드 단위. */
export const NEEDLE_LENGTH = 13;
export const NEEDLE_HALF_WIDTH = 3.2;
export const PIVOT_RADIUS = 1.5;

/** 바늘이 북을 가리키는 각(라디안). 바늘은 전부 여기서 출발한다. */
export const NORTH = Math.PI / 2;

/** 전선 기호 — 원 반지름 · ⊙ 점 반지름 · ⊗ 가위표 반길이. 월드 단위. */
export const WIRE_RADIUS = 12;
export const WIRE_DOT_RADIUS = 3.6;
export const WIRE_CROSS_ARM = 6.4;

/** 전선 기호가 ⊙ / ⊗ 로 갈리는 문턱. 이보다 약하면 빈 원이다. */
export const SYMBOL_THRESHOLD = 0.02;
/** 캡션이 세 문장으로 갈리는 문턱. 전환(0.25 s)의 한가운데가 여기다. */
export const CAPTION_THRESHOLD = 0.5;

// ------------------------------------------------------------------------
// 시간
// ------------------------------------------------------------------------

/**
 * 시계를 이만큼 앞당겨 연다(초). 독자가 도착한 순간은 **켠 지 0.55 초**다.
 */
export const START_AT = 0.55;

/**
 * 마운트 전에 `step` 을 이만큼 미리 굴린다(초).
 *
 * 바늘 각도는 누적 적분이라 시계만 앞당기면 전부 북쪽에 서 있다. 전류를 켠
 * 뒤 안쪽이 먼저 돌고 바깥이 뒤따르는 그 장면이 첫 프레임이어야 한다 —
 * 원본이 손으로 60 걸음을 미리 돌리던 자리다 (S-piece: 도착한 순간 이미 진행 중).
 */
export const PREROLL = 1.0;

/**
 * 전류의 구간 시간표. 켜짐 3.0 s → 끊김 2.2 s → 거꾸로 3.0 s → 끊김 2.2 s,
 * 전환은 0.25 s. 한 주기 11.4 s.
 *
 * 끊김 구간을 둔 이유는 기준선이다. 모든 바늘이 북을 가리키는 화면을 한 번
 * 보여줘야 "돌아섰다" 가 무엇으로부터 돌아선 것인지 말이 된다.
 *
 * **이 표 하나가 시간표의 단 하나뿐인 출처다.** `BundleSchema.timeline` 의
 * 단계는 여기서 만들고 `physics.currentAt` 도 이것을 훑는다 — 경계를 코드에
 * 상수로 따로 두면 선언과 물리가 갈린다 (원칙 2).
 */
export const CURRENT_PHASES: readonly {
  id: string;
  duration: number;
  from: number;
  to: number;
}[] = [
  { id: 'rise', duration: 0.25, from: 0, to: 1 },
  { id: 'on', duration: 3.0, from: 1, to: 1 },
  { id: 'fall', duration: 0.25, from: 1, to: 0 },
  { id: 'restA', duration: 2.2, from: 0, to: 0 },
  { id: 'reverse', duration: 0.25, from: 0, to: -1 },
  { id: 'back', duration: 3.0, from: -1, to: -1 },
  { id: 'riseBack', duration: 0.25, from: -1, to: 0 },
  { id: 'restB', duration: 2.2, from: 0, to: 0 },
];

/** 시간표 단계. 값이 바뀌는 구간만 이징이 붙는다 — 전류가 매끄럽게 건너간다. */
const currentTimeline: TimelinePhase[] = CURRENT_PHASES.map((p) => ({
  id: p.id,
  duration: p.duration,
  ease: p.from === p.to ? 'linear' : 'smooth',
}));

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const currentMagneticFieldMessages = Object.freeze({
  'label.title': { ko: '전류가 만드는 자기장', en: 'The field a current makes' },
  'label.operation': {
    ko: '전선을 감아 도는 쪽으로 돌아서고, 멀수록 덜 돌아선다',
    en: 'Needles turn along the loop, and less so farther out',
  },
  'label.stage': { ko: '전선 둘레', en: 'Around the wire' },
  'label.view': { ko: '나침반', en: 'Compasses' },
  /** 전류가 흐르는 동안. 공식도 오른손 법칙도 쓰지 않는다 — 문단의 몫이다. */
  'caption.on': {
    ko: '전류가 흐르는 동안 — 바늘은 전선을 감아 도는 고리 쪽으로 돌아선다, 멀수록 덜',
    en: 'While the current flows — the needles turn along the loop around the wire, less so farther out',
  },
  'caption.reverse': {
    ko: '전류를 거꾸로 흘리면 — 바늘도 거꾸로 돌아선다, 고리가 뒤집힌다',
    en: 'Reverse the current — the needles turn the other way, and the loop flips',
  },
  'caption.off': {
    ko: '전류를 끊으면 — 바늘은 모두 북쪽으로 되돌아간다',
    en: 'Cut the current — every needle swings back to north',
  },
} satisfies Record<string, LocalizedText>);

export type CurrentMagneticFieldMessageKey = keyof typeof currentMagneticFieldMessages;

export function text(key: CurrentMagneticFieldMessageKey): LocalizedText {
  return currentMagneticFieldMessages[key];
}

/** 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: CurrentMagneticFieldMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const currentMagneticFieldSchema: BundleSchema = {
  id: CURRENT_MAGNETIC_FIELD_ID,
  label: text('label.title'),
  category: 'em',
  operation: text('label.operation'),
  timeModel: 'linear',

  // 조작기도 파라미터도 없다. 독자가 손으로 확인하고 싶은 셋(끄면? 거꾸로 흘리면?
  // 세기를 바꾸면?)을 자동 진행이 한 주기 안에 모두 훑는다.
  parameters: [],

  stages: [{ id: 'around', label: text('label.stage'), constants: {} }],
  environments: [],
  views: [{ id: 'compasses', label: text('label.view'), default: true }],


  /** 원본의 화면 비(860 × 420). 가로로 넓고 세로로 얕은 그림이다. */
  canvas: { height: 420, minHeight: 360 },

  startAt: START_AT,
  preroll: PREROLL,

  timeline: { phases: currentTimeline },

  /**
   * 슬롯 하나. 문장이 갈리는 시점이 **시각이 아니라 전류의 부호**라서 단계가
   * 아니라 상태로 고른다 — 전환 0.25 s 의 한가운데에서 문장이 바뀌므로 단계
   * 경계와 맞지 않는다. `when` 은 상태 경로 이름이고, 부호를 세는 것은 physics 다.
   *
   * 자리는 원본 그대로 왼쪽 아래(왼쪽에서 24 px, 글자 밑선이 바닥에서 13 px).
   */
  caption: {
    anchor: { screen: 'bottom-left', offset: [0, 11] },
    align: 'left',
    fontSize: 15,
    style: { colorRole: 'muted', emphasis: 'strong' },
    cases: [
      { when: 'forward', text: key('caption.on') },
      { when: 'reversed', text: key('caption.reverse') },
    ],
    text: key('caption.off'),
  },

  /**
   * 크롬은 하나도 켜지 않는다 (기본값). 그리드는 "여기서 거리를 재라" 는
   * 지시인데 이 그림에서 재는 것은 거리가 아니라 **얼마나 돌아섰는가**다.
   */

  messages: currentMagneticFieldMessages,
};
