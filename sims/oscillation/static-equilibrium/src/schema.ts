// ========================================================================
// static-equilibrium — 선언
// ========================================================================
// 질문: 힘의 합이 0 이면 물체는 멈춰 있는가.
//
// 답: 아니다. 힘의 합이 0 이면 물체가 **밀려 가지는** 않지만(중심이 제자리), 두 힘이
// 한 선 위에 있지 않으면 돌림힘이 남아 **돈다.** 멈춰 있으려면 힘의 합과 돌림힘의
// 합이 **둘 다** 0 이어야 한다.
//
// 화면: 위에서 내려다본 같은 막대 둘(마찰 없는 판 위). 둘 다 같은 크기 반대 방향의
// 힘 F 두 개를 받는다. 처음에는 둘 다 한 선 위 — 두 막대 모두 가만히 있다. 이어서
// 오른쪽 막대의 한 힘만 막대 끝으로 옮긴다. 크기도 방향도 그대로라 힘의 합은 여전히
// 0 이고 중심은 제자리인데, 작용선이 어긋난 오른쪽 막대는 그 자리에서 돌기 시작한다.
//
// 이웃 조각과 겹치지 않는다 — `balance-scale` 은 돌림힘이 맞서서 0 이 되는 저울,
// `equilibrium-of-forces` 는 힘의 합성만, `torque` 는 팔이 길면 더 크게 돈다는 것이다.
// 이 조각은 「힘의 합이 0 이어도 돌림힘이 0 이 아니면 돈다 — 둘 다 0 이어야 멈춘다」 에
// 머문다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:static-equilibrium` 와 문자 그대로 일치한다 (C4). */
export const STATIC_EQUILIBRIUM_ID = 'static-equilibrium';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 한 힘의 크기(N). 네 힘 모두 같다. */
export const FORCE = 1;
/** 막대 질량(kg). 두 막대가 같다. */
export const BAR_MASS = 14;
/** 막대 길이(m). 관성 모멘트 M·L²/12 의 L 이다. */
export const BAR_LENGTH = 1.6;
/** 오른쪽 막대에서 옮긴 힘이 가 닿는 자리 — 중심에서의 거리(m). 기본은 막대 끝. */
export const OFFSET = 0.8;

// ------------------------------------------------------------------------
// 배치 — 월드 1 단위 = 1 m, 위에서 내려다본 평면도.
// ------------------------------------------------------------------------

/** 두 막대의 중심 x. */
export const LEFT_CENTER_X = -1.12;
export const RIGHT_CENTER_X = 1.12;
/** 막대 두께(m). */
export const BAR_THICK = 0.07;
/** 힘 화살표 길이(m). 네 화살표가 같다 — 힘이 같다는 것은 이 길이로 말한다. */
export const ARROW_LEN = 0.42;
/** 작용선을 화살표 꼬리 너머로 더 긋는 길이(m). */
export const LINE_OVERHANG = 0.12;
/** 중심 표지(열십자) 한 팔의 길이(m). 막대가 돌아도 이것은 움직이지 않는다. */
export const CROSS_ARM = 0.13;

/**
 * 프레이밍 — 두 막대가 한 바퀴 돌아도 닿는 원(반지름 약 1.05)과 아래 캡션 줄.
 * 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -2.2, maxX: 2.2, minY: -1.36, maxY: 1.08 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const staticEquilibriumMessages = Object.freeze({
  'label.title': { ko: '정적 평형', en: 'Static equilibrium' },
  'label.stage': { ko: '막대 둘', en: 'Two bars' },
  'label.view': { ko: '평면도', en: 'Top view' },

  /** 힘 기호. 표식이라 번역 대상이 아니다 (C1 판정 3). */
  'label.force': { ko: 'F', en: 'F' },

  'caption.ready': {
    ko: '같은 막대 둘을 같은 크기의 힘 F 두 개로 반대쪽에서 민다 — 두 힘이 한 선 위에 있다.',
    en: 'Two identical bars, each pushed from opposite sides by two equal forces F — both on one line.',
  },
  'caption.still': {
    ko: '힘의 합이 0, 두 힘이 한 선 위 — 두 막대 모두 가만히 있다.',
    en: 'Net force zero, both forces on one line — neither bar moves.',
  },
  'caption.shift': {
    ko: '오른쪽 막대에서 한 힘만 막대 끝으로 옮긴다. 크기도 방향도 그대로라 힘의 합은 여전히 0 이다.',
    en: 'On the right bar, one force slides to the end. Same size, same direction — the net force is still zero.',
  },
  'caption.turn': {
    ko: '힘의 합이 0 이라 중심은 제자리인데, 두 힘이 어긋난 오른쪽 막대는 그 자리에서 돈다.',
    en: 'The net force is zero, so the center stays put — yet the right bar, its forces off line, spins in place.',
  },
} satisfies Record<string, LocalizedText>);

export type StaticEquilibriumMessageKey = keyof typeof staticEquilibriumMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: StaticEquilibriumMessageKey): LocalizedText => staticEquilibriumMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: StaticEquilibriumMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const staticEquilibriumSchema: BundleSchema = {
  id: STATIC_EQUILIBRIUM_ID,
  title: text('label.title'),
  category: 'oscillation',
  timeModel: 'periodic',
  parameters: [],
  stages: [
    {
      id: 'two-bars',
      label: text('label.stage'),
      constants: {
        force: FORCE,
        barMass: BAR_MASS,
        barLength: BAR_LENGTH,
        offset: OFFSET,
      },
    },
  ],
  environments: [],
  views: [{ id: 'top', label: text('label.view'), default: true }],

  /** 가로로 넓다 — 막대 둘을 나란히. 세로는 도는 막대가 쓸고 가는 원 하나와 캡션 줄. */
  canvas: { height: 360, minHeight: 320 },

  /**
   * 쓴 순서대로 겹친다 — 처음 자리 · 돈 각 · 작용선 · 막대 · 중심 표지 · 화살표.
   * 부채꼴이 막대 아래에 깔려야 「막대가 쓸고 간 자리」 로 읽히고, 중심 표지가 막대
   * 위에 와야 막대가 그 점을 두고 도는 것이 보인다.
   */
  drawOrder: 'scene',

  /** 도착한 순간 이미 오른쪽 막대가 돌고 있다 (S-piece). */
  startAt: 3.9,

  /**
   * 한 주기 6.5 초.
   *
   * - `ready` — 두 막대에 힘 화살표가 나타난다. 모두 한 선 위.
   * - `still` — 아무것도 움직이지 않는다. 힘의 합 0 · 한 선 위.
   * - `shift` — 오른쪽 막대의 한 힘이 막대 끝으로 미끄러진다. 어긋나는 만큼 돌기 시작한다.
   *   진행도가 곧 옮긴 거리의 비율이라 `linear` 다.
   * - `turn` — 두 힘이 어긋난 채 오른쪽 막대가 점점 빨리 돈다. 진행도가 곧 시간이다.
   * - `fade` — 여전히 돌며 옅어진다. 끝난 화면이 남지 않게 다음 주기로 잇는다.
   */
  timeline: {
    phases: [
      { id: 'ready', duration: 0.6, ease: 'smooth', caption: key('caption.ready') },
      { id: 'still', duration: 1.4, ease: 'linear', caption: key('caption.still') },
      { id: 'shift', duration: 0.8, ease: 'linear', caption: key('caption.shift') },
      { id: 'turn', duration: 3.2, ease: 'linear', caption: key('caption.turn') },
      { id: 'fade', duration: 0.5, ease: 'linear', caption: key('caption.turn') },
    ],
  },

  /** 슬롯 하나. 단계마다 지금 화면에서 벌어지는 일만 말한다. */
  caption: {
    anchor: { screen: 'bottom-left', offset: [18, -4] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 820,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  // 그리드 · 카메라 단추 · 제목 · 범례 없음(기본). 견주는 것은 두 막대가 도느냐 마느냐와
  // 두 작용선이 겹치느냐 어긋나느냐다. 거리 눈금은 잴 것이 없다 (S-piece).

  messages: staticEquilibriumMessages,
};
