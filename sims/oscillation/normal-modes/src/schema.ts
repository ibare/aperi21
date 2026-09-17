// ========================================================================
// normal-modes — 선언
// ========================================================================
// 질문: 당겼다 놓은 사슬은 뒤섞여 흔들리는데, 그 어디에 「고유 진동 형태」 가 있는가.
//
// 흔들림을 몇 가지 모양으로 나누면 각 모양은 제 모양 그대로 저마다 다른 박자로
// 부풀고 줄어든다. 뒤섞임은 그 합이다.
//
// 원본: tasks/piece-lab/normal-modes. 상수와 배치는 원본 index.html 에서 그대로 옮겼다.
// ========================================================================

import type { BundleSchema, LocalizedText, Vec2 } from '@aperi21/schema';

/** 등록 키 `aperi21:normal-modes` 와 문자 그대로 일치한다 (C4). */
export const NORMAL_MODES_ID = 'normal-modes';

// ------------------------------------------------------------------------
// 계 — 양 끝이 고정된 줄에 구슬 다섯 알
// ------------------------------------------------------------------------

/** 구슬 수. 모드 줄 다섯이 세로 230px 안에 들어가는 한계 (원본 NOTES). */
export const N = 5;
/** 이웃 구슬 사이 결합의 세기(각진동수 단위). */
export const W0 = 4.05;
/** 고정 걸음(초). 모드 크기 기록 한 칸이 한 걸음이다. */
export const TICK = 1 / 60;
/** 모드 크기 기록 길이(칸) — 4 초. */
export const HIST = 240;
/** 자동 진행에서 당겨 놓는 구슬과 그 변위. */
export const PLUCK_BEAD = 0;
export const PLUCK_Y = 1.0;
/** 붙잡은 구슬 변위의 한계. */
export const HOLD_LIMIT = 1.1;
/** 이보다 진폭이 작은 모드는 「들어 있지 않다」 로 센다. */
export const ACTIVE_EPS = 1e-3;
/** 끄는 제약(세로 칸)의 표본 간격(변위 단위). */
export const SNAP_STEP = 0.01;

// ------------------------------------------------------------------------
// 배치 — 원본 캔버스(가로 900 · 세로 372 px)를 월드로 그대로 쓴다. y 는 위가 +.
// ------------------------------------------------------------------------

/** 원본 캔버스 가로(px). 원본 `.piece` 최대 폭. */
const W = 900;
/** 원본 캔버스 세로(px). */
export const CANVAS_H = 372;
const MAIN_H = 120;
const GAP = 14;
const ROW_H = 46;

/** 변위 1 = 48 — 사슬과 모드 줄이 같은 눈금이라 더하기가 성립한다. */
export const DISP_PX = 48;
/** 기록 그래프의 세로 눈금. 다른 양(q_n)이라 따로다. */
export const Q_PX = 34;

export const LAYOUT = (() => {
  const x0 = 44;
  const x1 = Math.round(W * 0.62);
  const bx: number[] = [];
  for (let j = 1; j <= N; j++) bx.push(x0 + ((x1 - x0) * j) / (N + 1));
  const rowY: number[] = [];
  for (let n = 0; n < N; n++) rowY.push(-(MAIN_H + GAP + ROW_H * n + ROW_H / 2));
  return {
    x0,
    x1,
    bx,
    mainY: -MAIN_H / 2,
    rowY,
    tx0: x1 + 28,
    tx1: W - 14,
    /** 안내선의 위 · 아래 끝. */
    guideTop: -8,
    guideBottom: -(CANVAS_H - 6),
    /** 더하기 기호의 가로 자리. */
    signX: 16,
    /** 벽 눈금 반길이 — 사슬 · 모드 줄. */
    mainTick: 22,
    rowTick: 8,
  } as const;
})();

/**
 * 고정 프레이밍. 원본 캔버스 전체와 그 아래 캡션 자리까지 담는다 — 엔진 캡션은
 * 캔버스 안에 그려지고 프레이밍 여백으로 잡히지 않는다 (NOTES 「어휘 부족」 G24).
 */
export const SCENE_BOUNDS = { minX: 4, maxX: 890, minY: -432, maxY: 0 } as const;

/** 구슬 j 를 끄는 세로 칸 — 끌린 자리가 이 점들 중 가장 가까운 곳에 붙는다. */
export function snapColumn(j: number): Vec2[] {
  const out: Vec2[] = [];
  const k = Math.round(HOLD_LIMIT / SNAP_STEP);
  for (let i = -k; i <= k; i++) out.push([LAYOUT.bx[j]!, LAYOUT.mainY + i * SNAP_STEP * DISP_PX]);
  return out;
}

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const normalModesMessages = Object.freeze({
  'label.title': { ko: '정규 모드', en: 'Normal modes' },
  'label.operation': { ko: '계가 가진 고유 진동 형태', en: 'The natural shapes a system vibrates in' },
  'label.stage': { ko: '구슬 사슬', en: 'Bead chain' },
  'label.view': { ko: '모드 분해', en: 'Mode decomposition' },
  /** 합의 관계 기호. 수식 기호라 표식이다 (C1 판정 3). */
  'label.equals': { ko: '=', en: '=' },
  'label.plus': { ko: '+', en: '+' },
  'caption.all': {
    ko: '한 알을 당겼다 놓은 사슬의 뒤섞인 흔들림은, 아래 다섯 모양이 제 모양 그대로 저마다 다른 박자로 부풀고 줄어드는 것을 더한 것이다.',
    en: 'The tangled shaking of a chain released from one pulled bead is the sum of the five shapes below, each swelling and shrinking in its own shape at its own beat.',
  },
  'caption.modes4': {
    ko: '한 알을 당겼다 놓은 사슬의 뒤섞인 흔들림은, 아래 네 모양이 제 모양 그대로 저마다 다른 박자로 부풀고 줄어드는 것을 더한 것이다. 납작한 줄의 모양은 처음부터 들어 있지 않았다.',
    en: 'The tangled shaking of a chain released from one pulled bead is the sum of four shapes below, each swelling and shrinking in its own shape at its own beat. The flat rows were never in it.',
  },
  'caption.modes3': {
    ko: '한 알을 당겼다 놓은 사슬의 뒤섞인 흔들림은, 아래 세 모양이 제 모양 그대로 저마다 다른 박자로 부풀고 줄어드는 것을 더한 것이다. 납작한 줄의 모양은 처음부터 들어 있지 않았다.',
    en: 'The tangled shaking of a chain released from one pulled bead is the sum of three shapes below, each swelling and shrinking in its own shape at its own beat. The flat rows were never in it.',
  },
  'caption.modes2': {
    ko: '한 알을 당겼다 놓은 사슬의 뒤섞인 흔들림은, 아래 두 모양이 제 모양 그대로 저마다 다른 박자로 부풀고 줄어드는 것을 더한 것이다. 납작한 줄의 모양은 처음부터 들어 있지 않았다.',
    en: 'The tangled shaking of a chain released from one pulled bead is the sum of two shapes below, each swelling and shrinking in its own shape at its own beat. The flat rows were never in it.',
  },
  'caption.modes1': {
    ko: '한 알을 당겼다 놓은 사슬의 뒤섞인 흔들림은, 아래 한 모양이 제 모양 그대로 저마다 다른 박자로 부풀고 줄어드는 것을 더한 것이다. 납작한 줄의 모양은 처음부터 들어 있지 않았다.',
    en: 'The shaking of a chain released from one pulled bead is one shape below, swelling and shrinking in its own shape at its own beat. The flat rows were never in it.',
  },
  'caption.held': {
    ko: '붙잡아 둔 모양도 아래 모양들을 더한 것이다 — 놓으면 저마다 제 박자로 흔들리기 시작한다.',
    en: 'The shape you are holding is also a sum of the shapes below — let go and each starts swinging at its own beat.',
  },
  'caption.still': {
    ko: '사슬이 멈춰 있어 아래 모양도 모두 납작하다 — 구슬 하나를 끌어 당겼다 놓아 보라.',
    en: 'The chain is at rest, so every shape below is flat — drag one bead and let it go.',
  },
} satisfies Record<string, LocalizedText>);

export type NormalModesMessageKey = keyof typeof normalModesMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: NormalModesMessageKey): LocalizedText => normalModesMessages[key];

/** 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: NormalModesMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const normalModesSchema: BundleSchema = {
  id: NORMAL_MODES_ID,
  label: text('label.title'),
  category: 'oscillation',
  operation: text('label.operation'),
  timeModel: 'continuous',
  parameters: [],
  stages: [{ id: 'chain', label: text('label.stage'), constants: {} }],
  environments: [],
  views: [{ id: 'modes', label: text('label.view'), default: true }],

  /** 원본 캔버스 372 px 에 그 아래 캡션 두 줄 자리를 더했다. */
  canvas: { height: 456, minHeight: 420 },

  /**
   * 겹침 순서가 원본과 같아야 한다 — 안내선 위에 사슬, 점선 폭 위에 강조색 모양,
   * 기록 선 위에 지금 점.
   */
  drawOrder: 'scene',

  /**
   * 도착한 순간 첫 구슬을 놓은 지 1.7 초 지났다. 사슬은 상태를 쌓으므로 시계가 아니라
   * 걸음을 미리 굴린다. 기록 선 오른쪽 끝에 놓기 전의 평평한 구간이 남는다.
   */
  preroll: 1.7,

  // 시간표가 없다 — 원본에 연출 단계가 없고, 흔들림은 적분이 만든다.

  /**
   * 캡션은 **상태**로 고른다. 들어 있는 모양 수(진폭 > 0.001)는 끌어 놓은 구슬에 따라
   * 달라지고, 붙잡은 동안과 멈춘 상태는 따로 말한다. 모두 참이 아니면 다섯 모양 문장.
   */
  caption: {
    anchor: { screen: 'bottom-left', offset: [-12, 0] },
    align: 'left',
    fontSize: 15,
    wrapWidth: 860,
    style: { colorRole: 'ink', emphasis: 'strong' },
    text: key('caption.all'),
    cases: [
      { when: 'caption.held', text: key('caption.held') },
      { when: 'caption.still', text: key('caption.still') },
      { when: 'caption.modes1', text: key('caption.modes1') },
      { when: 'caption.modes2', text: key('caption.modes2') },
      { when: 'caption.modes3', text: key('caption.modes3') },
      { when: 'caption.modes4', text: key('caption.modes4') },
    ],
  },

  // 그리드도 카메라 버튼도 없다 — 원본에 없다. 축 눈금 · 숫자도 두지 않았다.

  messages: normalModesMessages,
};
