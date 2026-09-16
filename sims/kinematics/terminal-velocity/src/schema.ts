// ========================================================================
// terminal-velocity — 선언
// ========================================================================
// 질문: 중력은 계속 아래로 당기는데, 떨어지는 물체의 속도는 왜 어느 순간부터
// 더 늘지 않을까.
//
// 답하는 동사는 **"따라잡는다"** 다. 멈추는 것은 저항이 있어서가 아니라 저항이
// 중력만큼 커졌을 때다. 그래서 두 힘을 **같은 자로 잰 길이**로 바꿔 화살표 둘이
// 대칭이 되는 순간이 곧 균형이 되게 했다.
//
// 원본(tasks/piece-lab/terminal-velocity/index.html)은 화면 좌표계에서 직접
// 물리를 세웠다(1 픽셀 = 길이 단위 하나). 여기서도 그 자를 그대로 쓴다 —
// **월드 한 단위 = 원본 한 픽셀**이고, y 축만 위로 뒤집었다.
//
//     월드 x = 원본 화면 x − 250 (낙하축 cx)
//     월드 y = 150 − 원본 화면 y (캔버스 세로 중앙이 원점)
//
// 그래서 원본의 상수가 부호와 원점만 옮겨 그대로 남는다 — Y0 30 → 120,
// YF 242 → −92, 캔버스 300×820 → y ±150 · x −250..570.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:terminal-velocity` 와 문자 그대로 일치한다 (C4). */
export const TERMINAL_VELOCITY_ID = 'terminal-velocity';

// ------------------------------------------------------------------------
// 확정값 — 원본의 숫자를 그대로 옮겼다
// ------------------------------------------------------------------------

/** 중력 가속도. 원본은 시간 축을 압축하며 71 에서 이 값으로 올렸다. */
export const G = 215;
/** 출발 높이 (원본 Y0 = 30). */
export const Y_START = 120;
/** 화면 아래 끝 (원본 YF = 242). 중력 화살표까지 담기는 한계다. */
export const Y_FLOOR = -92;
/** 자국을 남기는 주기(초). 원본은 0.4 에서 이 값으로 줄였다. */
export const STROBE = 0.2;
/**
 * 다 떨어진 장면을 붙잡아 두는 시간(초). 그 장면이 이 조각의 결론이다.
 *
 * 이 하나는 **길이가 고정된 단계**라 시간표에 적힐 것이었다. 주기 전체를
 * `TimelineDef.phases` 로 덮을 수 없어(낙하가 독자의 값에 따라 변한다) 시간표를
 * 못 쓰지만, 그렇다고 저작자가 못 만지는 코드 상수로 둘 이유는 없다 — 아래
 * `stages[].constants.hold` 로 올려 선언에서 바꿀 수 있게 했다. 여기 남는 것은
 * 선언이 비었을 때의 기본값이다 (원칙 2).
 */
export const HOLD = 1.1;
/** 중력 화살표 길이 (= mg, 고정). 저항 화살표가 같은 자로 재어 여기까지 자란다. */
export const GRAVITY_LEN = 42;
/** 물체 반지름. */
export const BODY_R = 9;
/** 물체와 화살표 뿌리 사이의 틈. */
export const ARROW_GAP = 2;
/** 화살촉 크기. */
export const HEAD = 8;

/**
 * 자국 사다리 — 가로대는 축 좌우로만 뻗고 가운데는 열어 둔다. 화살표가 그
 * 통로로 지나가므로 자국과 화살표가 겹치지 않는다.
 *
 * 원본은 `cx−150 … cx−14` 와 `cx+14 … cx+150` 두 선분이었다. `trace` 의 `tick` 은
 * 자국을 **중심에 두고** 좌우로 뻗으므로, 같은 그림을 좌우 두 인스턴스의 중심과
 * 길이로 옮긴다.
 */
export const LADDER = { center: 82, length: 136 } as const;
/** 자국 사다리의 진하기. 원본은 물체와 같은 잉크를 28% 로 깔았다 — 같은 대상, 옅게. */
export const LADDER_OPACITY = 0.28;

/** 자국 주기 표시가 놓이는 자리 (원본 `cx−150`, 화면 y 17). */
export const STROBE_NOTE = { x: -150, y: 133 } as const;

/**
 * 캡션 자리. 원본은 `capX = cx + 150 + 32`, 폭 `min(370, …)`, 세로 중앙이었다.
 *
 * 세로 낙하는 화면의 왼쪽만 쓴다. 남는 오른쪽을 캡션에 내주어 **세로를 더 쓰지
 * 않고도** 캡션이 읽히게 한 배치다 — `CaptionSlotDef.wrapWidth` 가 그 요구로 생겼다.
 */
export const CAPTION = { x: 182, wrapWidth: 370, fontSize: 16 } as const;

/**
 * 프레이밍은 주장의 일부다. 원본 캔버스(820×300)를 그대로 잘라 고정한다 —
 * 세로 낙하를 **한 화면에 다 담아야** "벌어지다 평평해진다" 가 정지 프레임 한
 * 장으로 읽힌다. 세계를 스크롤시키면 초반의 촘촘한 자국이 위로 흘러 사라진다.
 */
export const SCENE_BOUNDS = { minX: -250, maxX: 570, minY: -150, maxY: 150 } as const;

/**
 * 저항 세기 — 9 단. 원본 `vt = 120 − value·8` 이라 종단 속도는 120 … 56 이다.
 *
 * 값 자체는 화면에 뜨지 않아야 할 것이지만(원본은 `약`·`강` 두 글자뿐이었다)
 * 지금 슬라이더 어휘는 값을 늘 숫자로 띄운다. NOTES 「어휘 부족」에 적었다.
 */
export const LEVEL_RANGE: [number, number] = [0, 8];
export const LEVEL_DEFAULT = 4;
export const VT_AT_ZERO = 120;
export const VT_PER_LEVEL = 8;

/** 캡션이 갈리는 자리. 원본의 `ratio >= 0.96` · `ratio < 0.15`. */
export const RATIO_CAUGHT = 0.96;
export const RATIO_START = 0.15;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const terminalVelocityMessages = Object.freeze({
  'label.title': { ko: '종단 속도', en: 'Terminal velocity' },
  'label.operation': {
    ko: '공기 저항이 중력을 따라잡는 순간부터 더 빨라지지 않는다',
    en: 'It stops speeding up the moment drag catches gravity',
  },
  'label.stage': { ko: '낙하', en: 'Fall' },
  'label.view': { ko: '자국 사다리', en: 'Strobe ladder' },
  /**
   * 사다리 왼쪽 위의 한 줄. 간격을 속도로 읽으려면 시간 간격이 일정하다는 것을
   * 알아야 한다 — 이 한 줄이 없으면 사다리는 그냥 무늬다. 규범상 라벨을 기본으로
   * 두지 않지만 이건 **주장이 성립하는 조건**이라 넣었다 (원본 NOTES).
   */
  'label.strobe': { ko: '{dt}초마다 남긴 자국', en: 'a mark every {dt} s' },
  'label.gravity': { ko: '중력', en: 'Gravity' },
  /** 화살표 딱지이자 슬라이더 이름. 같은 대상이라 같은 문안을 쓴다. */
  'label.drag': { ko: '공기 저항', en: 'Air drag' },
  'caption.start': {
    ko: '막 떨어지기 시작했다. 공기 저항은 아직 거의 없다.',
    en: 'It has just begun to fall. There is almost no drag yet.',
  },
  'caption.growing': {
    ko: '빨라질수록 공기 저항이 자란다. 자국 간격이 아직 벌어진다.',
    en: 'The faster it goes, the more drag grows. The gaps are still widening.',
  },
  'caption.caught': {
    ko: '공기 저항이 중력을 따라잡았다. 자국 간격이 더 벌어지지 않는다.',
    en: 'Drag has caught gravity. The gaps widen no further.',
  },
} satisfies Record<string, LocalizedText>);

export type TerminalVelocityMessageKey = keyof typeof terminalVelocityMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export function text(key: TerminalVelocityMessageKey): LocalizedText {
  return terminalVelocityMessages[key];
}

/** 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: TerminalVelocityMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const terminalVelocitySchema: BundleSchema = {
  id: TERMINAL_VELOCITY_ID,
  label: text('label.title'),
  category: 'kinematics',
  operation: text('label.operation'),

  /** 떨어지고 · 붙잡히고 · 되감긴다. 끝난 화면이 남지 않는다. */
  timeModel: 'periodic',

  /** 슬라이더가 state 를 직접 민다 — 호스트 paramValues 를 거치지 않는다. */
  parameters: [],

  stages: [
    {
      id: 'fall',
      label: text('label.stage'),
      // 화면 좌표에서 직접 세운 중력이다. 미터가 아니라 원본의 자다.
      // `hold` 는 완성된 사다리를 붙잡아 두는 시간 — 길이가 고정된 유일한
      // 단계라 저작자가 여기서 늘이고 줄인다.
      constants: { g: G, hold: HOLD },
    },
  ],

  environments: [],

  views: [{ id: 'ladder', label: text('label.view'), default: true }],

  /**
   * 원본 캔버스는 300 이고 슬라이더는 그 아래 따로 있었다. 여기서는 슬라이더가
   * 그림 위에 얹히므로 그만큼만 더 준다. 세로는 비싸다 — 더 뽑으면 그림이 작아진다.
   */
  canvas: { height: 340, minHeight: 300 },

  /**
   * **시간표를 선언하지 않는다.**
   *
   * 이 조각의 주기는 시계가 아니라 사건이 가른다 — 물체가 바닥에 닿으면 붙잡고,
   * 1.1 초 뒤 되감는다. 낙하에 걸리는 시간은 독자가 슬라이더로 정하는 값에 따라
   * 2.15 초에서 3.97 초까지 움직이므로 `TimelineDef.phases` 의 고정 `duration`
   * 으로는 적을 수 없다. 고정값을 적으면 저항을 강하게 준 독자에게는 물체가
   * 아직 공중에 있는데 주기가 되감긴다. NOTES 「어휘 부족」에 적었다.
   */

  /**
   * 캡션 슬롯 하나. 문장이 갈리는 시점이 시각이 아니라 **상태**에 달려 있어
   * `cases` 로 고른다 — 위에서부터 훑어 참인 첫 항목이고, 아무것도 참이 아니면
   * `text`. 조건을 세는 것은 physics 이고 선언은 그 결과가 놓인 자리만 가리킨다.
   *
   * 자리는 월드다. 세로 낙하가 왼쪽만 쓰므로 오른쪽 남는 가로에 문장을 세우고,
   * `wrapWidth` 안에서 줄을 나눈 덩이가 월드 y = 0(캔버스 세로 중앙)에 가운데로
   * 놓인다 — 원본의 `top = H/2 − (lines−1)·lh/2` 가 이것이다.
   */
  caption: {
    anchor: { world: [CAPTION.x, 0] },
    align: 'left',
    fontSize: CAPTION.fontSize,
    wrapWidth: CAPTION.wrapWidth,
    style: { colorRole: 'ink', emphasis: 'strong' },
    text: key('caption.growing'),
    cases: [
      { when: 'caught', text: key('caption.caught') },
      { when: 'justStarted', text: key('caption.start') },
    ],
  },

  /**
   * 그리드도 카메라 버튼도 없다 (기본값). 자국 자체가 등시 눈금이라 축을 더하면
   * 같은 말이 둘이 되고, 카메라를 주면 독자가 프레임을 넓혀 낙하가 화면 밖으로
   * 흘러 "한 장으로 본다" 가 무너진다.
   */

  messages: terminalVelocityMessages,
};
