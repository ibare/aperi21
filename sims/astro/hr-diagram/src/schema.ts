// ========================================================================
// hr-diagram — 선언
// ========================================================================
// 질문: 성단의 HR 도에서 왜 주계열 띠가 위에서부터 끊겨 있는가.
//
// 같은 때 태어난 별 무리가 나이 들면 무거운 별부터 띠를 떠나, 띠의 윗부분이
// 위에서부터 비어 간다. 원본: tasks/piece-lab/hr-diagram.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:hr-diagram` 와 문자 그대로 일치한다 (C4). */
export const HR_DIAGRAM_ID = 'hr-diagram';

// ------------------------------------------------------------------------
// 배치 — 원본 캔버스(860 × 440) 좌표를 그대로 쓴다. 월드 = [x, −y].
// ------------------------------------------------------------------------

export const CANVAS_W = 860;
export const CANVAS_H = 440;
/** 캡션 줄이 차지하는 자리(원본 px). 원본은 캔버스 아래 DOM 한 줄이었다. */
export const CAPTION_ROOM = 34;

/** 그림 영역 여백 (원본 PL · PR · PT · PB). */
export const PLOT = { left: 92, right: 18, top: 14, bottom: 46 } as const;
/** 가로축 = log10 표면 온도(K), 왼쪽이 뜨겁다. */
export const T_AXIS = { left: 4.8, right: 3.4 } as const;
/** 세로축 = log10 광도(태양 = 0). */
export const L_AXIS = { top: 6.4, bottom: -4.2 } as const;

/** 온도 눈금(K). 글자는 `messages` 의 `tick.t*`. */
export const TEMP_TICKS = [30000, 10000, 6000, 3000] as const;
/** 밝기 눈금(log10 L). 글자는 `messages` 의 `tick.l*`. */
export const LUM_TICKS = [4, 0, -3] as const;

/** 프레이밍 — 원본 캔버스 + 캡션 줄. 매 프레임 같은 값 (S-piece). */
export const SCENE_BOUNDS = {
  minX: 0,
  maxX: CANVAS_W,
  minY: -(CANVAS_H + CAPTION_ROOM),
  maxY: 0,
} as const;

// ------------------------------------------------------------------------
// 성단 — 조각의 물리 모델 값 (원본 상수 그대로)
// ------------------------------------------------------------------------

export const CLUSTER = {
  /** 별 수. */
  count: 1000,
  /** 질량 범위(태양 질량). */
  mMin: 0.2,
  mMax: 40,
  /** 질량 분포 멱지수. 실제(약 2.35)보다 완만하게 해 띠 윗부분에 별이 보이게 했다 (NOTES). */
  alpha: 1.7,
  /** 난수 시드. 원본 하니스의 기본 시드(`?seed=1`)와 같다 — 같은 별 무리가 나온다. */
  seed: 1,
  /** 성단 나이 흐름: log10(년) 시작 · 끝. 시간표 `run` 단계 동안 선형으로 흐른다. */
  logAge0: 6.3,
  logAge1: 10.1,
  /** 꼬리 = 이만큼(초) 전 화면 시각의 위치 → 지금 위치. */
  trailSeconds: 0.3,
} as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const hrDiagramMessages = Object.freeze({
  'label.title': { ko: 'HR 도', en: 'HR diagram' },
  'label.operation': {
    ko: '무거운 별부터 주계열 띠를 떠난다',
    en: 'The heaviest stars leave the main sequence first',
  },
  'label.stage': { ko: '성단', en: 'Cluster' },
  'label.view': { ko: 'HR 도', en: 'HR diagram' },

  /** 온도 눈금. 수와 단위는 표식이라 두 언어가 같다 (C1 판정 3). */
  'tick.t30000': { ko: '30000K', en: '30000K' },
  'tick.t10000': { ko: '10000K', en: '10000K' },
  'tick.t6000': { ko: '6000K', en: '6000K' },
  'tick.t3000': { ko: '3000K', en: '3000K' },
  'tick.l4': { ko: '태양의 1만 배', en: '10,000 × Sun' },
  'tick.l0': { ko: '태양만큼', en: 'Like the Sun' },
  'tick.l-3': { ko: '1000분의 1', en: '1/1000 of Sun' },
  'axis.temperature': {
    ko: '표면 온도 — 왼쪽이 뜨겁다',
    en: 'Surface temperature — hotter to the left',
  },
  'axis.luminosity': { ko: '밝기', en: 'Luminosity' },
  'label.mainSequence': { ko: '주계열', en: 'Main sequence' },

  /**
   * 캡션. 나이 단위가 한국어는 만·억, 영어는 백만으로 갈려 한 틀에 담기지 않는다 —
   * 나이가 1억 년을 넘는지(`ageInEok`)로 두 틀 중 하나를 고른다 (NOTES 「어휘 부족」).
   */
  'caption.young': {
    ko: '성단 나이 {ageMan}만 년 — 무거운 별부터 띠를 떠난다. 지금은 태양 질량의 {mass}배보다 무거운 별이 떠났다.',
    en: 'Cluster age {ageMyr} million years — the heaviest stars leave the band first. Stars above {mass} solar masses have left.',
  },
  'caption.old': {
    ko: '성단 나이 {ageEok}억 년 — 무거운 별부터 띠를 떠난다. 지금은 태양 질량의 {mass}배보다 무거운 별이 떠났다.',
    en: 'Cluster age {ageMyr} million years — the heaviest stars leave the band first. Stars above {mass} solar masses have left.',
  },
} satisfies Record<string, LocalizedText>);

export type HrDiagramMessageKey = keyof typeof hrDiagramMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: HrDiagramMessageKey): LocalizedText => hrDiagramMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: HrDiagramMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const hrDiagramSchema: BundleSchema = {
  id: HR_DIAGRAM_ID,
  label: text('label.title'),
  category: 'astro',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다. 나이는 저절로 흐르고 주장은 누르지 않아도 끝난다.
  parameters: [],

  stages: [{ id: 'cluster', label: text('label.stage'), constants: {} }],
  environments: [],
  views: [{ id: 'hr', label: text('label.view'), default: true }],

  /** 원본 캔버스 860 × 440 + 캡션 줄. */
  canvas: { height: 480, minHeight: 420 },

  /** 겹침 순서가 원본 그대로여야 한다 — 축 · 띠 · 꼬리 · 별 · 전향점 막대. */
  drawOrder: 'scene',

  /**
   * 한 주기 26 초 — 22 초 동안 성단 나이가 200만 년 → 약 130억 년으로 **로그로** 흐르고(run),
   * 4 초 머문다(hold). 되감지 않고 끊어 처음으로 돌아간다 (원본 NOTES (c)).
   * 원본은 시계를 앞당기지 않았다 — t = 0 에 이미 가장 무거운 별이 건너가는 중이다.
   */
  timeline: {
    phases: [
      { id: 'run', duration: 22, caption: key('caption.young') },
      { id: 'hold', duration: 4, caption: key('caption.old') },
    ],
  },

  caption: {
    anchor: { screen: 'bottom-left', offset: [16, -6] },
    align: 'left',
    fontSize: 15,
    style: { colorRole: 'ink', emphasis: 'medium' },
    cases: [{ when: 'ageInEok', text: key('caption.old') }],
    vars: { ageMan: 'ageMan', ageEok: 'ageEok', ageMyr: 'ageMyr', mass: 'massText' },
  },

  // 그리드 · 카메라 버튼 없음 (원본에 없다). 축과 눈금은 scene 이 선언한다.

  messages: hrDiagramMessages,
};
