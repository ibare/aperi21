// ========================================================================
// maxwells-demon — 선언
// ========================================================================
// 질문: 같은 온도의 두 칸을 저절로 뜨거운 칸과 찬 칸으로 가를 수 있나.
//
// 칸막이 문 위의 도깨비가 문으로 다가오는 알갱이의 속력을 재고, 빠른 것은 왼쪽 → 오른쪽,
// 느린 것은 오른쪽 → 왼쪽으로만 문을 열어 준다. 두 칸의 온도 막대가 벌어진다. 그런데
// 도깨비는 다가오는 알갱이를 **하나도 빼놓지 않고** 재야 하고, 잴 때마다 공책에 한 줄을
// 적는다 — 문을 연 횟수보다 공책의 줄이 훨씬 빨리 는다. 동사: 갈라지고, 적힌다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:maxwells-demon` 와 문자 그대로 일치한다 (C4). */
export const MAXWELLS_DEMON_ID = 'maxwells-demon';

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 상자 왼쪽 아래 모서리가 원점, y 는 위가 양수.
// 물리량(분자 수 · 시드 · 상자 · 속력 · 문턱 · 문 · 막대 배율)은 스테이지 상수다 (아래 `stages`).
// 아래 자리는 기본 상자(2.4 × 1.2)에 맞춘 고정값이다 (원칙 6).
// ------------------------------------------------------------------------

/** 온도 막대 두 개 — 상자 오른쪽. 바닥은 상자 바닥과 같은 높이다. */
export const BARS = {
  /** 왼쪽 칸 막대 · 오른쪽 칸 막대의 가운데 x(월드). */
  centers: [2.95, 3.45] as readonly [number, number],
  /** 막대 폭(월드). */
  width: 0.3,
  /** 「처음 높이」 점선이 막대 바깥으로 삐져나오는 길이(월드). */
  guideOvershoot: 0.08,
} as const;

/** 도깨비의 공책 — 막대 오른쪽. 판정 한 번에 한 줄, 칸이 차면 옆 칸으로 넘어간다. */
export const NOTEBOOK = {
  /** 공책 왼쪽 아래 · 오른쪽 위 모서리(월드). */
  min: [3.95, 0] as readonly [number, number],
  max: [5.3, 1.2] as readonly [number, number],
  /** 공책 안 여백(월드). */
  pad: 0.07,
  /** 줄 칸 — 세로 줄 수 · 가로 칸 수. 판정이 이보다 많으면 넘치는 줄은 적지 않는다 (NOTES (b)). */
  rows: 22,
  cols: 3,
  /** 칸 사이 가로 틈(월드). */
  gutter: 0.06,
  /** 줄 길이의 짧은 끝 — 칸 폭에 대한 비. 손으로 적은 줄처럼 길이가 조금씩 다르다. */
  minLength: 0.55,
} as const;

/** 도깨비 머리 자리(월드) — 칸막이 위, 상자 윗벽 바로 위. */
export const DEMON_POS = [1.2, 1.33] as readonly [number, number];

/**
 * 도깨비 외형 — 둥근 머리에 뿔 둘. SVG 경로, 좌표는 `DEMON_POS` 기준 월드 단위, y 위.
 * 모양은 저작 결정이라 선언에 둔다.
 */
export const DEMON_PATH =
  'M -0.075 0 A 0.075 0.075 0 1 0 0.075 0 A 0.075 0.075 0 1 0 -0.075 0 Z ' +
  'M -0.058 0.045 L -0.085 0.135 L -0.022 0.07 Z ' +
  'M 0.058 0.045 L 0.085 0.135 L 0.022 0.07 Z';

/**
 * 프레이밍. 상자(0~2.4) · 막대(2.8~3.6) · 공책(3.95~5.3) 가로, 위로는 도깨비와 제목 줄,
 * 아래로는 막대 이름과 캡션 줄의 자리까지. 매 프레임 같은 값이다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: -0.1, maxX: 5.4, minY: -0.62, maxY: 1.56 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const maxwellsDemonMessages = Object.freeze({
  'label.title': { ko: '맥스웰의 도깨비', en: "Maxwell's demon" },
  'label.operation': { ko: '정보와 엔트로피의 관계', en: 'Information and entropy' },
  'label.stage': { ko: '문 달린 상자', en: 'Box with a trapdoor' },
  'label.view': { ko: '상자 · 온도 막대 · 공책', en: 'Box, temperature bars, notebook' },
  /** 도깨비 이름표. */
  'label.demon': { ko: '도깨비', en: 'demon' },
  /** 막대 묶음 제목. */
  'label.temperature': { ko: '온도', en: 'temperature' },
  /** 막대 이름. */
  'label.left': { ko: '왼쪽', en: 'left' },
  'label.right': { ko: '오른쪽', en: 'right' },
  /** 처음 높이 점선의 이름. */
  'label.start': { ko: '처음', en: 'start' },
  /** 공책 제목. */
  'label.notebook': { ko: '도깨비의 공책', en: "demon's notebook" },
  'caption.mixed': {
    ko: '문이 닫혀 있다. 두 칸 모두 큰(빠른) 알갱이와 작은(느린) 알갱이가 {n}개씩 섞여 있고, 두 온도 막대의 높이가 같다.',
    en: 'The door is shut. Each side holds {n} molecules, big (fast) and small (slow) mixed, and the two temperature bars stand level.',
  },
  'caption.sort': {
    ko: '도깨비가 문으로 다가오는 알갱이마다 속력을 재어 본다. 빠른 것은 오른쪽으로, 느린 것은 왼쪽으로만 문을 열어 주고, 하나를 볼 때마다 공책에 한 줄을 적는다.',
    en: 'The demon times every molecule that comes to the door. It opens only for fast ones going right and slow ones going left, and writes one line for every molecule it looks at.',
  },
  'caption.sorted': {
    ko: '오른쪽에 큰 알갱이가, 왼쪽에 작은 알갱이가 모인다 — 오른쪽 막대가 오르고 왼쪽 막대가 내려간다. 닫힌 문에 튕겨 나간 알갱이도 공책에 한 줄씩 적힌다.',
    en: 'Big molecules gather on the right, small ones on the left — the right bar rises and the left bar sinks. Molecules turned back at the shut door get a line in the notebook too.',
  },
  'caption.hold': {
    ko: '문이 멈췄다. 오른쪽은 뜨거운 칸, 왼쪽은 찬 칸이 되었고, 공책에는 재어 본 횟수만큼 줄이 남았다.',
    en: 'The door stops. The right side is now hot and the left cold, and the notebook keeps one line for every molecule timed.',
  },
} satisfies Record<string, LocalizedText>);

export type MaxwellsDemonMessageKey = keyof typeof maxwellsDemonMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: MaxwellsDemonMessageKey): LocalizedText => maxwellsDemonMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: MaxwellsDemonMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const maxwellsDemonSchema: BundleSchema = {
  id: MAXWELLS_DEMON_ID,
  label: text('label.title'),
  category: 'thermal',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 섞여 있고, 도깨비가 가르고, 멈춘다.
  parameters: [],

  /**
   * 기체와 문.
   * - `perSide` 한 칸의 분자 수, `seed` 처음 자리 · 속도 시드(같은 시각 = 같은 화면).
   *   두 칸은 **같은 속력 목록**을 나눠 가진다 — 처음 온도가 정확히 같다.
   * - `boxWidth` · `boxHeight` 상자(월드), `speedScale` 속도 성분 정규분포의 표준편차(월드/초).
   * - `speedThreshold` 도깨비의 문턱 속력(월드/초). 이보다 빠르면 「빠름」.
   * - `doorLow` · `doorHigh` 칸막이에 난 문의 아래 · 위 높이(월드).
   * - `doorOpenSeconds` 문이 활짝 열려 있는 시간, `doorSwingSeconds` 여닫는 데 드는 시간(초).
   *   알갱이마다 지나는 시각이 달라 시간표 단계로 풀 수 없어 상수로 둔다 (NOTES (c)).
   * - `ringSeconds` 도깨비가 잰 자리에 번지는 고리 · 공책의 새 줄 강조가 남는 시간(초).
   * - `barScale` 온도 막대 배율 — 처음 온도가 이 높이(월드)다.
   *
   * 시드 6 에서 도깨비가 일하는 12 초 동안 판정 58회 · 문 열림 12회, 끝에 두 칸 18 : 18,
   * 온도는 처음의 0.38 배 : 1.62 배다 (NOTES (d)). 시드를 바꾸면 캡션이 참인지 다시 찍어 본다.
   */
  stages: [
    {
      id: 'trapdoor-box',
      label: text('label.stage'),
      constants: {
        perSide: 18,
        seed: 6,
        boxWidth: 2.4,
        boxHeight: 1.2,
        speedScale: 0.6,
        speedThreshold: 0.7,
        doorLow: 0.3,
        doorHigh: 0.9,
        doorOpenSeconds: 0.3,
        doorSwingSeconds: 0.15,
        ringSeconds: 0.6,
        barScale: 0.5,
      },
    },
  ],

  environments: [],

  views: [{ id: 'box-bars-notebook', label: text('label.view'), default: true }],

  /** 가로로 넓은 그림(상자 + 막대 + 공책)에 캡션 두 줄. 세로가 비싸다 (S-piece). */
  canvas: { height: 350, minHeight: 320 },

  /** 문은 칸막이 위에, 알갱이는 문 위에, 지금 판정 고리는 맨 위에 얹혀야 한다. */
  drawOrder: 'scene',

  /**
   * 한 주기 — 나타남 · 섞임 · 가름(앞 · 뒤) · 멈춤 · 흐려짐.
   *
   * 도깨비는 `sort` 시작부터 `sorted` 끝까지 일한다. 앞 · 뒤로 나눈 것은 캡션 때문이다 —
   * 막대가 벌어진다는 문장은 벌어진 뒤에야 참이다. 주기가 끝날 때 알갱이를 되섞어 보이지
   * 않고 흐려졌다가 새로 나타난다.
   */
  timeline: {
    phases: [
      { id: 'appear', duration: 0.4, caption: key('caption.mixed') },
      { id: 'mixed', duration: 2.6, caption: key('caption.mixed') },
      { id: 'sort', duration: 5, caption: key('caption.sort') },
      { id: 'sorted', duration: 7, caption: key('caption.sorted') },
      { id: 'hold', duration: 3.5, caption: key('caption.hold') },
      { id: 'fade', duration: 0.8, caption: key('caption.hold') },
    ],
  },

  /** 도착한 순간 이미 알갱이들이 두 칸에서 튀고 있다 — 나타남 단계를 건너뛴다. */
  startAt: 0.6,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 정보 · 엔트로피의 셈은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -6] },
    fontSize: 13,
    wrapWidth: 760,
    style: { colorRole: 'muted', emphasis: 'strong' },
    vars: { n: 'perSideText' },
  },

  messages: maxwellsDemonMessages,
};
