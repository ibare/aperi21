// ========================================================================
// charles-law — 선언
// ========================================================================
// 질문: 압력을 그대로 두고 기체를 데우면 부피는 어떻게 되나.
//
// 같은 무게추를 얹은 자유 피스톤 실린더 셋(압력이 같다)에 양이 다른 기체를 담고
// 함께 데운다. 정해 둔 온도마다 부피를 V–t(℃) 그림에 점으로 찍으면 기체마다 점이
// 곧은 선 하나 위에 놓인다. 세 선은 기울기가 다른데, 온도가 낮은 쪽으로 이어 보면
// 모두 같은 한 점 — −273.15 ℃, 부피 0 — 에 닿는다. 이것이 이 조각의 주장이다.
//
// 이웃 `ideal-gas-law` 는 세 양의 배수 막대를, `boyles-law` 는 온도가 같을 때의
// P–V 곡선과 넓이를 말한다. 이 조각은 그것을 되풀이하지 않는다 — 분자를 두지 않고,
// 주장은 V–t 그림의 곧은 선과 그 연장이 모이는 한 점에 있다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:charles-law` 와 문자 그대로 일치한다 (C4). */
export const CHARLES_LAW_ID = 'charles-law';

// ------------------------------------------------------------------------
// 물리 · 표시 배율 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 세 실린더에 담긴 기체의 양(mol). 순서대로 기체 A · B · C. */
export const N_A = 1;
export const N_B = 0.7;
export const N_C = 0.4;
/** 무게추가 정하는 압력(Pa). 세 실린더에 같은 추가 얹혀 있어 셋 다 이 압력이다. */
export const PRESSURE = 100000;
/** 기체 상수(J/(mol·K)). */
export const GAS_R = 8.314;
/**
 * 섭씨 → 절대온도 사이의 간격(정박값). 기체의 부피는 절대온도를 따른다 — physics 가
 * 이 값으로 부피를 계산하고, 만나는 점의 눈금 글자도 이 값을 그대로 쓴다.
 */
export const KELVIN_OFFSET = 273.15;
/** 데우기 시작 온도 · 끝 온도 · 점을 찍는 간격(℃). */
export const T_START = 0;
export const T_END = 100;
export const T_STEP = 25;

/** 표시 배율 — 부피 1 L 의 높이(월드). 실린더 속 기체 기둥과 그림의 V 축이 같은 배율을 쓴다. */
export const WORLD_PER_LITER = 0.068;
/** 표시 배율 — 1 ℃ 의 가로 길이(월드). 그림의 t 축. */
export const WORLD_PER_DEGREE = 0.013;
/** 그림의 t 축이 보이는 범위(℃). 왼쪽 끝이 만나는 점보다 조금 더 차갑다. */
export const GRAPH_T_MIN = -300;
export const GRAPH_T_MAX = 130;
/** 그림의 V 축 높이(L). */
export const GRAPH_V_MAX = 34;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 실린더 셋이 왼쪽에 서고, V–t 그림이 오른쪽에 놓인다.
// 실린더 바닥과 그림의 V = 0 이 같은 높이(y = 0)다.
// ------------------------------------------------------------------------

/** 실린더 안쪽 폭 · 사이 간격 · 벽 높이 · 첫 실린더 왼쪽 벽(월드). */
export const CYLINDER = { width: 0.5, gap: 0.24, top: 2.4, left: 0 } as const;
/** 피스톤 두께 · 무게추 크기(월드). */
export const PISTON_THICKNESS = 0.1;
export const WEIGHT_SIZE = [0.3, 0.2] as const;
/** 데우는 판 — 실린더 바닥 아래 띠(월드 y). */
export const HEATER = { top: -0.08, bottom: -0.22, overhang: 0.08 } as const;
/** 기체를 알리는 표식이 실린더 바닥에서 떠 있는 높이(월드). */
export const TAG_HEIGHT = 0.22;

/** 그림에서 t 축의 왼쪽 끝(−300 ℃)이 놓이는 x(월드). 0 ℃(V 축)는 여기서 300 ℃ 만큼 오른쪽이다. */
export const GRAPH_LEFT = 2.55;

/**
 * 프레이밍은 주장의 일부다. 가로는 첫 실린더부터 t 축 이름까지, 세로는 가장 높이 오른
 * 무게추 위부터 눈금 숫자 · 캡션 줄까지. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -0.3, maxX: 8.75, minY: -0.95, maxY: 2.75 } as const;

// ------------------------------------------------------------------------
// 문안 (C1)
// ------------------------------------------------------------------------

export const charlesLawMessages = Object.freeze({
  'label.title': { ko: '샤를 법칙', en: "Charles's law" },
  'label.operation': { ko: '압력이 일정할 때의 부피-온도', en: 'Volume and temperature at constant pressure' },
  'label.stage': { ko: '무게추 실린더 셋', en: 'Three weighted cylinders' },
  'label.view': { ko: '실린더와 V–t 그림', en: 'Cylinders and V–t graph' },

  /** 축 이름. 물리 기호 · 단위라 번역하지 않는다 (C1 판정 3). */
  'label.volume': { ko: 'V', en: 'V' },
  'label.temperature': { ko: 't (℃)', en: 't (℃)' },
  /** 눈금 숫자 — 스테이지 상수를 그대로 끼운다. */
  'label.celsius': { ko: '{t}', en: '{t}' },
  'label.celsiusBelow': { ko: '−{t}', en: '−{t}' },

  'caption.start': {
    ko: '같은 추를 얹은 세 실린더, 기체의 양만 다르다 — {t0} ℃ 에서 첫 점을 찍었다',
    en: 'Three cylinders under equal weights, holding different amounts of gas — the first dots are marked at {t0} ℃',
  },
  'caption.heat': {
    ko: '아래에서 데우며 {step} ℃ 마다 부피를 점으로 찍는다',
    en: 'Heating from below, the volume is marked every {step} ℃',
  },
  'caption.lines': {
    ko: '기체마다 점들을 곧은 선 하나로 잇는다 — 세 선의 기울기가 다르다',
    en: 'Each gas’s dots are joined by one straight line — the three slopes differ',
  },
  'caption.extend': {
    ko: '세 선을 온도가 낮은 쪽으로 이어 본다',
    en: 'The three lines are carried on toward colder temperatures',
  },
  'caption.meet': {
    ko: '세 점선이 모두 −{k} ℃, 부피 0 인 한 점에서 만난다',
    en: 'All three dashed lines meet at one point: −{k} ℃, zero volume',
  },
  'caption.cool': {
    ko: '식혀 처음 온도로 돌아간다',
    en: 'The gas cools back to the starting temperature',
  },
} satisfies Record<string, LocalizedText>);

export type CharlesLawMessageKey = keyof typeof charlesLawMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: CharlesLawMessageKey): LocalizedText => charlesLawMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: CharlesLawMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const charlesLawSchema: BundleSchema = {
  id: CHARLES_LAW_ID,
  label: text('label.title'),
  category: 'thermal',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 데워지고, 점이 찍히고, 선이 이어져 한 점에 모인다.
  parameters: [],

  stages: [
    {
      id: 'cylinders',
      label: text('label.stage'),
      constants: {
        nA: N_A,
        nB: N_B,
        nC: N_C,
        pressure: PRESSURE,
        R: GAS_R,
        kelvinOffset: KELVIN_OFFSET,
        tStart: T_START,
        tEnd: T_END,
        tStep: T_STEP,
        worldPerLiter: WORLD_PER_LITER,
        worldPerDegree: WORLD_PER_DEGREE,
        graphTMin: GRAPH_T_MIN,
        graphTMax: GRAPH_T_MAX,
        graphVMax: GRAPH_V_MAX,
      },
    },
  ],

  environments: [],

  views: [{ id: 'main', label: text('label.view'), default: true }],

  // 가로로 긴 장치 + 그림. 세로를 더 주면 가로가 먼저 차서 그림만 작아진다.
  canvas: { height: 360, minHeight: 320 },

  /**
   * 겹침 순서를 scene 이 정한다. 옅은 기체 기둥은 피스톤 · 표식 **아래**로, 연장 점선은
   * 점 아래로 깔려야 하는데, 층 순서로는 `region`(매질)이 물체 위로 올라온다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 처음 점 → 데우며 점 찍기 → 선으로 잇기 → 거꾸로 잇기 → 만남(고리가 나타남)
   * → 머묾 → 식히기. 만남 · 머묾은 같은 캡션 키라 캡션이 다시 페이드하지 않는다.
   *
   * 온도가 바뀌는 두 단계(`heat` · `cool`)는 `linear` 다 — 피스톤과 그림의 커서가 고른
   * 빠르기로 움직여야 「같은 온도 간격마다 같은 높이」 가 눈으로 읽힌다.
   */
  timeline: {
    phases: [
      { id: 'start', duration: 1.6, caption: key('caption.start') },
      { id: 'heat', duration: 6.0, ease: 'linear', caption: key('caption.heat') },
      { id: 'lines', duration: 2.2, ease: 'smooth', caption: key('caption.lines') },
      { id: 'extend', duration: 3.4, ease: 'smooth', caption: key('caption.extend') },
      { id: 'meet', duration: 0.8, ease: 'smooth', caption: key('caption.meet') },
      { id: 'hold', duration: 3.4, caption: key('caption.meet') },
      { id: 'cool', duration: 2.2, ease: 'linear', caption: key('caption.cool') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — 데우며 점을 찍는 도중에 연다. */
  startAt: 3.4,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 식과 법칙의 진술은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 14,
    wrapWidth: 760,
    style: { colorRole: 'muted', emphasis: 'strong' },
    // 온도 값은 스테이지 상수에서 온다 — state 가 글자로 옮겨 둔다(장부 G133 우회).
    vars: { t0: 'tStart', step: 'tStep', k: 'kelvinOffset' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것은 거리가 아니라 **선이 닿는 자리** 라,
   * 축 둘과 점을 찍은 온도의 눈금만 둔다.
   */

  messages: charlesLawMessages,
};
