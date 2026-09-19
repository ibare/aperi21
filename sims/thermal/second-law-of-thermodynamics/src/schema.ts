// ========================================================================
// second-law-of-thermodynamics — 선언
// ========================================================================
// 질문: 섞인 것은 왜 저절로 다시 갈라지지 않나.
//
// 칸막이 왼쪽에만 있던 분자들이 칸막이를 걷자 양쪽으로 퍼진다. 오른쪽 그래프는 왼쪽
// 칸의 분자 수를 시간에 따라 긋는다 — N 에서 내려와 N/2 둘레에서 작게 흔들릴 뿐,
// 아무리 기다려도 다시 N 줄로 오르지 않는다. 동사: 퍼지고, 되돌아오지 않는다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:second-law-of-thermodynamics` 와 문자 그대로 일치한다 (C4). */
export const SECOND_LAW_OF_THERMODYNAMICS_ID = 'second-law-of-thermodynamics';

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 상자 왼쪽 아래 모서리가 원점, y 는 위가 양수.
// 물리량(분자 수 · 시드 · 상자 크기 · 속력 척도)은 스테이지 상수다 (아래 `stages`).
// ------------------------------------------------------------------------

/**
 * 오른쪽 그래프 — 왼쪽 칸 분자 수의 시간 이력. 가로는 주기 첫머리부터 `wait` 단계
 * 끝까지(시간표에서 읽는다), 세로는 0 에서 N 까지.
 */
export const GRAPH = {
  /** 축 원점(월드). 상자 오른쪽에 둔다. */
  origin: [2.75, 0] as readonly [number, number],
  /** 가로 길이(월드). */
  width: 3.25,
  /** N 줄의 높이(월드). 상자 윗벽과 같은 높이라 「가득 찼던 왼쪽」 과 눈높이가 맞는다. */
  height: 1.2,
  /** 곡선 표본 간격(초). */
  sampleSeconds: 0.1,
} as const;

/** 칸막이를 걷을 때 들어 올리는 거리(월드). 걷는 동안 이만큼 오르며 옅어진다. */
export const PARTITION_LIFT = 0.3;

/**
 * 프레이밍. 상자(0~2) · 그래프(2.75~6) 가로, 위로는 축 이름 줄, 아래로는 시간 축 이름과
 * 캡션 줄의 자리까지. 매 프레임 같은 값이다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: -0.12, maxX: 6.2, minY: -0.5, maxY: 1.52 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const secondLawOfThermodynamicsMessages = Object.freeze({
  'label.title': { ko: '열역학 제2법칙', en: 'Second law of thermodynamics' },
  'label.operation': { ko: '방향이 있는 변화', en: 'Change that runs one way' },
  'label.stage': { ko: '칸막이 상자', en: 'Divided box' },
  'label.view': { ko: '상자와 왼쪽 칸 분자 수', en: 'Box and left-half count' },
  /** 그래프 세로축 이름. */
  'label.axisCount': { ko: '왼쪽 칸의 분자 수', en: 'Molecules in the left half' },
  /** 그래프 가로축 이름. */
  'label.axisTime': { ko: '시간', en: 'time' },
  /** 세로 눈금 표식 — 기호라 번역하지 않는다 (C1 판정 3). */
  'label.full': { ko: 'N', en: 'N' },
  'label.half': { ko: 'N/2', en: 'N/2' },
  'caption.closed': {
    ko: '칸막이 왼쪽에만 분자 {n}개(N)가 있다. 그래프는 맨 위 N 줄에 붙어 있다.',
    en: 'All {n} molecules (N) are on the left of the partition. The graph sits on the top line, N.',
  },
  'caption.open': {
    ko: '칸막이를 걷는다.',
    en: 'The partition is lifted.',
  },
  'caption.spread': {
    ko: '분자들이 오른쪽 칸으로 퍼져 나간다 — 왼쪽 칸의 수가 N 에서 내려온다.',
    en: 'Molecules spread into the right half — the count on the left comes down from N.',
  },
  'caption.wait': {
    ko: '양쪽에 고르게 퍼졌다. 왼쪽 수는 N/2 점선 둘레에서 조금씩 오르내리고, 곡선은 N 줄 가까이 다시 오르지 않는다.',
    en: 'Spread evenly over both halves. The left count wobbles a little around the N/2 line; the curve does not climb back toward N.',
  },
} satisfies Record<string, LocalizedText>);

export type SecondLawOfThermodynamicsMessageKey = keyof typeof secondLawOfThermodynamicsMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: SecondLawOfThermodynamicsMessageKey): LocalizedText => secondLawOfThermodynamicsMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: SecondLawOfThermodynamicsMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const secondLawOfThermodynamicsSchema: BundleSchema = {
  id: SECOND_LAW_OF_THERMODYNAMICS_ID,
  label: text('label.title'),
  category: 'thermal',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 칸막이가 걷히고, 퍼지고, 기다린다.
  parameters: [],

  /**
   * 기체와 상자. `count` 는 분자 수 N, `seed` 는 처음 자리 · 속도를 뽑는 난수 시드
   * (같은 시각 = 같은 화면), `boxWidth` · `boxHeight` 는 상자 크기(월드), `speedScale` 은
   * 속도 성분의 표준편차(월드/초)다. 시드 8 · 척도 0.5 에서 대기 단계 내내 왼쪽 수는
   * 22~29 에 머문다 (NOTES (d)). 시드를 바꾸면 캡션이 여전히 참인지 촬영으로 다시 본다.
   */
  stages: [
    {
      id: 'divided-box',
      label: text('label.stage'),
      constants: { count: 50, seed: 8, boxWidth: 2, boxHeight: 1.2, speedScale: 0.5 },
    },
  ],

  environments: [],

  views: [{ id: 'box-and-count', label: text('label.view'), default: true }],

  /** 가로로 넓은 그림(상자 + 그래프)에 캡션 한두 줄. 세로가 비싸다 (S-piece). */
  canvas: { height: 340, minHeight: 310 },

  /** 칸막이는 가운데 점선 위에, 지금 점은 곡선 위에 얹혀야 한다. */
  drawOrder: 'scene',

  /**
   * 한 주기 — 나타남 · 닫힘 · 걷음 · 퍼짐 · 기다림 · 흐려짐.
   *
   * 분자가 칸막이를 지날 수 있게 되는 순간은 `open` 의 끝이다 — 걷는 동안에는 아직
   * 가운데 벽에서 튄다. `wait` 이 가장 길다: 「기다려도 되돌아오지 않는다」 는 기다리는
   * 시간이 화면에 있어야 성립한다. 주기가 끝날 때 분자를 왼쪽으로 **모아 되돌리지 않고**
   * 흐려졌다가 새로 나타난다 — 되돌아가는 모습을 보이면 주장과 반대 그림이 된다.
   */
  timeline: {
    phases: [
      { id: 'appear', duration: 0.4, caption: key('caption.closed') },
      { id: 'closed', duration: 2, caption: key('caption.closed') },
      { id: 'open', duration: 0.6, ease: 'smooth', caption: key('caption.open') },
      { id: 'spread', duration: 3.5, caption: key('caption.spread') },
      { id: 'wait', duration: 10, caption: key('caption.wait') },
      { id: 'fade', duration: 0.8, caption: key('caption.wait') },
    ],
  },

  /** 도착한 순간 이미 분자들이 왼쪽 칸에서 튀고 있다 — 나타남 단계를 건너뛴다. */
  startAt: 0.6,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 법칙과 확률은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -6] },
    fontSize: 13,
    wrapWidth: 720,
    style: { colorRole: 'muted', emphasis: 'strong' },
    vars: { n: 'countText' },
  },

  messages: secondLawOfThermodynamicsMessages,
};
