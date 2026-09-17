// ========================================================================
// phase-diagram — 선언
// ========================================================================
// 질문: 드라이아이스는 왜 녹지 않고 바로 기체가 되는가.
//
// 삼중점보다 낮은 압력에서 고체를 데우면 액체 구간을 건너뛰고 곧바로 기체가 된다.
// 같은 방식(일정한 가열)을 두 압력에서 차례로 보이고, 같은 온도축에 맞춘 상 띠 두 줄로
// 「위 줄의 액체 자리 아래가 기체로 채워진다」 를 화면에서 일어나게 한다.
//
// 원본: tasks/piece-lab/phase-diagram (손으로 짠 422줄).
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:phase-diagram` 와 문자 그대로 일치한다 (C4). */
export const PHASE_DIAGRAM_ID = 'phase-diagram';

// ------------------------------------------------------------------------
// 배치 — 원본의 논리 좌표(860×316, y 아래)를 그대로 쓴다. 월드는 y 만 뒤집는다.
// ------------------------------------------------------------------------

/** 상평형 그림 사각형. */
export const DIAGRAM = { x: 80, y: 12, w: 500, h: 220 } as const;
/** 상 띠 두 줄의 위쪽 y 와 높이. */
export const STRIP = { y: [244, 266] as const, h: 16 } as const;
/** 시료 입자 상자. */
export const SAMPLE_BOX = { x: 626, y: 12, size: 220 } as const;
/** 캡션 한 줄의 가운데 y. 원본은 캔버스 아래 DOM 이었다. */
export const CAPTION_Y = 337;
/** 조작기 한 줄의 가운데 y. 원본은 캡션 아래 DOM 이었다. */
export const CONTROL_Y = 380;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const phaseDiagramMessages = Object.freeze({
  'label.title': { ko: '상평형 그림', en: 'Phase diagram' },
  'label.operation': {
    ko: '삼중점보다 낮은 압력에서는 액체 구간을 건너뛴다',
    en: 'Below the triple point, the liquid range is skipped',
  },
  'label.stage': { ko: '기본', en: 'Default' },
  'label.view': { ko: '기본', en: 'Default' },

  'label.solid': { ko: '고체', en: 'solid' },
  'label.liquid': { ko: '액체', en: 'liquid' },
  'label.gas': { ko: '기체', en: 'gas' },
  'label.triplePoint': { ko: '삼중점', en: 'triple point' },
  'label.pressureAxis': { ko: '압력 ↑', en: 'pressure ↑' },
  'label.temperatureAxis': { ko: '온도 →', en: 'temperature →' },
  'label.pathHigh': { ko: '높은 압력', en: 'high pressure' },
  'label.pathLow': { ko: '낮은 압력', en: 'low pressure' },
  'label.pathChosen': { ko: '고른 압력', en: 'chosen pressure' },
  'label.sample': { ko: '시료 속 입자', en: 'particles in the sample' },
  'label.pressureControl': { ko: '압력 고르기', en: 'choose pressure' },

  'caption.heatSolidHigh': {
    ko: '삼중점보다 높은 압력에서 고체를 데운다',
    en: 'Heating a solid above the triple-point pressure',
  },
  'caption.heatSolidLow': {
    ko: '삼중점보다 낮은 압력에서 고체를 데운다',
    en: 'Heating a solid below the triple-point pressure',
  },
  'caption.melt': {
    ko: '경계선에 닿자 온도가 멈추고, 고체가 녹아 액체가 된다',
    en: 'At the boundary the temperature stops, and the solid melts into a liquid',
  },
  'caption.heatLiquid': {
    ko: '다시 온도가 오른다 — 지금은 액체다',
    en: 'The temperature rises again — it is a liquid now',
  },
  'caption.boil': {
    ko: '두 번째 경계선에서 다시 멈추고, 액체가 끓어 기체가 된다',
    en: 'It stops again at the second boundary, and the liquid boils into a gas',
  },
  'caption.sublimate': {
    ko: '경계선이 하나뿐이다 — 고체가 액체를 거치지 않고 곧바로 기체가 된다',
    en: 'There is only one boundary — the solid turns straight into a gas, never a liquid',
  },
  'caption.twoCrossings': {
    ko: '고체 → 액체 → 기체: 경계선을 두 번 건넜다',
    en: 'solid → liquid → gas: it crossed two boundaries',
  },
  'caption.skipped': {
    ko: '고체 → 기체: 액체 구간을 건너뛰고 경계선을 한 번만 건넜다',
    en: 'solid → gas: it skipped the liquid range and crossed only one boundary',
  },
} satisfies Record<string, LocalizedText>);

export type PhaseDiagramMessageKey = keyof typeof phaseDiagramMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: PhaseDiagramMessageKey): LocalizedText => phaseDiagramMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: PhaseDiagramMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// 자동 진행의 두 가열
// ------------------------------------------------------------------------

/**
 * 가열 하나를 이루는 시간표 단계 이름. `heats[j]` 동안 온도가 j 번째 구간을 오르고,
 * `crosses[j]` 동안 j 번째 경계선에서 멈춘다. 경계선 수는 압력이 정하므로
 * 물리(`crossings`)와 개수가 맞아야 한다 — 어긋나면 scene 이 던진다.
 */
export interface RunDef {
  id: 'high' | 'low';
  /** 로그 압력 0~1. `stage.constants` 의 이름. */
  pressureKey: 'vHigh' | 'vLow';
  /** 시작 온도 0~1. `stage.constants` 의 이름. */
  startKey: 'u0High' | 'u0Low';
  label: PhaseDiagramMessageKey;
  heats: readonly string[];
  crosses: readonly string[];
  hold: string;
}

export const RUNS: readonly RunDef[] = [
  {
    id: 'high',
    pressureKey: 'vHigh',
    startKey: 'u0High',
    label: 'label.pathHigh',
    heats: ['high-heat-solid', 'high-heat-liquid', 'high-heat-gas'],
    crosses: ['high-melt', 'high-boil'],
    hold: 'high-hold',
  },
  {
    id: 'low',
    pressureKey: 'vLow',
    startKey: 'u0Low',
    label: 'label.pathLow',
    heats: ['low-heat-solid', 'low-heat-gas'],
    crosses: ['low-sublimate'],
    hold: 'low-hold',
  },
];

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const phaseDiagramSchema: BundleSchema = {
  id: PHASE_DIAGRAM_ID,
  label: text('label.title'),
  category: 'thermal',
  operation: text('label.operation'),
  timeModel: 'periodic',

  parameters: [],

  stages: [
    {
      id: 'default',
      label: text('label.stage'),
      /**
       * 무차원 도식. u 는 온도 0~1(왼쪽→오른쪽), v 는 로그 압력 0~1(아래→위).
       * 승화 · 증발 곡선은 클라우지우스-클라페이롱 꼴, 융해 곡선은 거의 수직인 직선.
       *
       * `rate` · `pause` · `hold` 는 **독자가 압력을 고른 뒤의 가열**에만 쓴다. 자동 진행의
       * 길이는 아래 `timeline` 이 정한다 — 둘을 하나로 묶을 자리가 없다 (NOTES 「어휘 부족」 G13).
       */
      constants: {
        uT: 0.38,
        vT: 0.35,
        uC: 0.85,
        bVap: 1.188,
        bSub: 2.14,
        kMelt: 0.08,
        uEnd: 0.8,
        vHigh: 0.6,
        vLow: 0.18,
        u0High: 0.22,
        u0Low: 0.14,
        u0Chosen: 0.14,
        rate: 0.15,
        pause: 1.2,
        hold: 0.9,
      },
    },
  ],

  environments: [],

  views: [{ id: 'default', label: text('label.view'), default: true }],

  /** 그림 316 + 캡션 한 줄 + 조작기 한 줄. 세로를 아끼려 입자 상자를 그림 옆에 둔다. */
  canvas: { height: 440, minHeight: 380 },

  /** 면 → 경계선 → 경로 → 점 순서가 곧 겹침이다. */
  drawOrder: 'scene',

  /**
   * 한 주기 13.67 초 — 높은 압력 가열 7.17 초, 낮은 압력 가열 6.50 초.
   *
   * 가열 단계의 길이는 원본의 일정한 가열(초당 온도 0.15)로 그 구간을 오르는 시간이고,
   * 경계선에서 멈추는 시간(숨은열)은 1.2 초, 끝에서 머무는 시간은 0.9 초다.
   *   높은 압력: 고체 0.22→0.40 · 액체 0.40→0.58 · 기체 0.58→0.80
   *   낮은 압력: 고체 0.14→0.3225 · 기체 0.3225→0.80
   * 가열 단계를 늘이면 그 구간을 더 천천히 오를 뿐 경계의 자리는 바뀌지 않는다.
   *
   * 원본은 도착한 순간 이미 높은 압력의 고체를 데우는 중이고 시계를 앞당기지 않았다.
   */
  timeline: {
    phases: [
      { id: 'high-heat-solid', duration: 1.2, caption: key('caption.heatSolidHigh') },
      { id: 'high-melt', duration: 1.2, caption: key('caption.melt') },
      { id: 'high-heat-liquid', duration: 1.2, caption: key('caption.heatLiquid') },
      { id: 'high-boil', duration: 1.2, caption: key('caption.boil') },
      { id: 'high-heat-gas', duration: 1.4667, caption: key('caption.twoCrossings') },
      { id: 'high-hold', duration: 0.9, caption: key('caption.twoCrossings') },
      { id: 'low-heat-solid', duration: 1.2167, caption: key('caption.heatSolidLow') },
      { id: 'low-sublimate', duration: 1.2, caption: key('caption.sublimate') },
      { id: 'low-heat-gas', duration: 3.1833, caption: key('caption.skipped') },
      { id: 'low-hold', duration: 0.9, caption: key('caption.skipped') },
    ],
  },
  startAt: 0,

  /**
   * 캡션은 원본처럼 그림 아래 왼쪽에 한 줄.
   *
   * 독자가 압력을 고르면 시간표가 아니라 **상태**로 문안을 고른다(`cases`). 조각의 `step` 이
   * 고른 압력의 가열을 돌리며 지금 문안 하나만 참으로 둔다. 자동 진행 중에는 모두 거짓이라
   * 단계의 캡션이 말한다.
   */
  caption: {
    anchor: { world: [12, -CAPTION_Y] },
    align: 'left',
    fontSize: 15,
    style: { colorRole: 'ink', emphasis: 'strong' },
    cases: [
      { when: 'cap.heatSolidHigh', text: key('caption.heatSolidHigh') },
      { when: 'cap.heatSolidLow', text: key('caption.heatSolidLow') },
      { when: 'cap.melt', text: key('caption.melt') },
      { when: 'cap.heatLiquid', text: key('caption.heatLiquid') },
      { when: 'cap.boil', text: key('caption.boil') },
      { when: 'cap.sublimate', text: key('caption.sublimate') },
      { when: 'cap.twoCrossings', text: key('caption.twoCrossings') },
      { when: 'cap.skipped', text: key('caption.skipped') },
    ],
  },

  // 그리드 · 카메라 버튼 없음 (원본에 없다).

  messages: phaseDiagramMessages,
};
