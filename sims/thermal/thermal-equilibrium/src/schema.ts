// ========================================================================
// thermal-equilibrium — 선언
// ========================================================================
// 질문: 뜨거운 덩이와 찬 덩이를 맞붙이면 어디서 멈추는가.
//
// 같은 물질 · 같은 크기의 두 덩이를 맞붙인다. 맞닿은 면을 건너 열이 뜨거운 쪽에서
// 찬 쪽으로 가고, 두 온도는 처음에는 빠르게, 가까워질수록 느리게 다가가 한 값에서
// 겹친다. 겹친 뒤로는 건너가는 열이 없고 온도도 변하지 않는다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:thermal-equilibrium` 와 문자 그대로 일치한다 (C4). */
export const THERMAL_EQUILIBRIUM_ID = 'thermal-equilibrium';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 뜨거운 덩이의 처음 온도(℃). */
export const T_HOT = 80;
/** 찬 덩이의 처음 온도(℃). */
export const T_COLD = 20;
/**
 * 두 덩이가 만나는 온도(℃) — 화면 글자에 띄우는 정박값. 같은 물질 · 같은 질량이라 두 처음 온도의
 * 가운데여야 하고, 곡선 · 점선 자리는 physics 가 그 가운데로 계산한다(둘의 관계는 G143).
 */
export const T_MEET = 50;
/**
 * 온도 차가 줄어드는 빠르기(1/초, 화면 시간). 전달 계수 ÷ 열용량을 두 덩이 몫으로 합친
 * 값이다 — 차는 e^(−rate·s) 로 준다. 흐름이 온도 차에 비례하기 때문이다.
 */
export const RATE = 0.8;
/** 맞닿은 면을 건너는 열 알갱이 수. 알갱이 하나 = 건너갈 열 전체의 1/packets. */
export const PACKETS = 24;
/** 알갱이 하나가 뜨거운 덩이 안에서 찬 덩이 안까지 가는 시간(초). */
export const PACKET_TRAVEL = 0.9;
/** 알갱이 자리를 흩는 시드. 같은 시각은 같은 화면이다 (S-sim). */
export const SEED = 7;
/** 온도 눈금의 아래 · 위 끝(℃). 막대와 곡선이 같은 눈금을 쓴다. */
export const AXIS_MIN = 0;
export const AXIS_MAX = 100;
/** 처음 온도 차에서의 열 화살표 길이(월드)와 굵기(화면 px). 차에 비례해 줄어든다. */
export const ARROW_LEN = 1.4;
export const ARROW_WIDTH = 8;
/** 화살표를 거두는 문턱 — 처음 차에 대한 지금 차의 몫. 이보다 작으면 흐름이 끝난 것이다. */
export const ARROW_MIN_RATIO = 0.02;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 왼쪽에 두 덩이, 오른쪽에 온도-시간 곡선. y 는 위.
// ------------------------------------------------------------------------

/** 덩이 한 개의 크기 [가로, 세로]. 둘이 같다 — 같은 물질 · 같은 크기가 주장의 전제다. */
export const BLOCK_SIZE: readonly [number, number] = [1.6, 2.3];
/** 맞닿은 면의 x. 뜨거운 덩이는 왼쪽, 찬 덩이는 오른쪽. */
export const INTERFACE_X = -1.9;
/** 떨어져 있을 때 두 덩이 사이 틈(월드). */
export const GAP = 0.7;
/** 덩이 바닥의 y. */
export const BLOCK_BOTTOM = 0;

/** 온도 막대(관)의 폭과, 덩이 바깥 모서리에서 관 중심까지의 거리. */
export const TUBE_WIDTH = 0.3;
export const TUBE_INSET = 0.38;
/** 눈금 AXIS_MIN · AXIS_MAX 가 놓이는 y. 막대와 곡선이 이 높이를 함께 쓴다. */
export const SCALE_BOTTOM = 0.1;
export const SCALE_TOP = 2.2;

/** 알갱이가 흩어지는 세로 범위(y)와, 관 · 맞닿은 면에서 떨어지는 여백(x). */
export const PACKET_Y_MIN = 0.35;
export const PACKET_Y_MAX = 1.95;
export const PACKET_MARGIN = 0.12;
/** 알갱이 반지름(월드). */
export const PACKET_R = 0.055;

/** 열 화살표가 놓이는 높이 — 덩이 위. */
export const ARROW_Y = 2.6;
/** 덩이 온도 글자가 놓이는 높이. */
export const TEMP_LABEL_Y = 2.62;

/** 곡선 판의 가로 범위. 세로는 막대와 같은 눈금이다. */
export const GRAPH_X0 = 0.75;
export const GRAPH_X1 = 4.7;

/**
 * 프레이밍은 주장의 일부다. 가로는 떨어져 있는 뜨거운 덩이 왼쪽 끝부터 곡선 판 오른쪽
 * 이름표까지, 세로는 시간축 이름표 아래부터 덩이 위 화살표 · 글자까지. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -4.15, maxX: 5.35, minY: -0.35, maxY: 2.95 } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이(초)
// ------------------------------------------------------------------------

/** 떨어져 있는 두 덩이를 보이는 동안. */
export const APART = 0.8;
/** 두 덩이가 다가가 맞붙는 동안. */
export const TOUCH = 1.0;
/** 맞붙은 직후 — 열이 굵게 건너가는 동안. */
export const FLOW = 2.0;
/** 온도 차가 줄어 흐름이 가늘어지는 동안. */
export const SLOW = 4.5;
/** 한 온도에서 멈춘 그림을 읽는 동안 · 다음 주기로 흐려지는 동안. */
export const HOLD = 3.2;
export const FADE = 0.6;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const thermalEquilibriumMessages = Object.freeze({
  'label.title': { ko: '열평형', en: 'Thermal equilibrium' },
  'label.stage': { ko: '맞붙인 두 덩이', en: 'Two blocks in contact' },
  'label.view': { ko: '덩이와 곡선', en: 'Blocks and curves' },
  /** 온도 글자. 값은 선언한 처음 온도 · 만나는 온도를 끼운다 (C1). */
  'label.temp': { ko: '{t} ℃', en: '{t} ℃' },
  /** 열 화살표 이름. */
  'label.heat': { ko: '열', en: 'heat' },
  /** 곡선 판의 축 기호. 표식이다 (C1 판정). */
  'label.axisTemp': { ko: 'T', en: 'T' },
  'label.axisTime': { ko: 't', en: 't' },
  'caption.apart': {
    ko: '같은 물질 · 같은 크기의 두 덩이 — 하나는 {hot} ℃, 하나는 {cold} ℃ 다',
    en: 'Two blocks of the same material and size — one at {hot} ℃, one at {cold} ℃',
  },
  'caption.touch': {
    ko: '두 덩이를 맞붙인다',
    en: 'The two blocks are pressed together',
  },
  'caption.flow': {
    ko: '맞닿은 면을 건너 열이 뜨거운 덩이에서 찬 덩이로 간다 — 한쪽 막대는 내려가고 한쪽은 올라간다',
    en: 'Heat crosses the contact from the hot block to the cold one — one bar falls as the other rises',
  },
  'caption.slow': {
    ko: '두 막대가 가까워질수록 건너가는 알갱이가 드물어지고, 두 곡선도 점점 느리게 다가간다',
    en: 'As the bars close in, fewer grains cross, and the two curves approach more and more slowly',
  },
  'caption.meet': {
    ko: '두 덩이가 {meet} ℃ 에서 만났다 — 건너가는 알갱이가 없고 막대도 곡선도 더 움직이지 않는다',
    en: 'Both blocks met at {meet} ℃ — no grains cross, and neither the bars nor the curves move',
  },
} satisfies Record<string, LocalizedText>);

export type ThermalEquilibriumMessageKey = keyof typeof thermalEquilibriumMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: ThermalEquilibriumMessageKey): LocalizedText =>
  thermalEquilibriumMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ThermalEquilibriumMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const thermalEquilibriumSchema: BundleSchema = {
  id: THERMAL_EQUILIBRIUM_ID,
  title: text('label.title'),
  category: 'thermal',
  timeModel: 'periodic',

  // 조작기가 없다 — 두 처음 온도와 빠르기는 스테이지 상수다. 독자가 바꿔 볼 것이
  // 「어디서 만나는가」 라면 그것은 calorimetry 의 몫이다.
  parameters: [],

  stages: [
    {
      id: 'blocks',
      label: text('label.stage'),
      constants: {
        tHot: T_HOT,
        tCold: T_COLD,
        tMeet: T_MEET,
        rate: RATE,
        packets: PACKETS,
        packetTravel: PACKET_TRAVEL,
        seed: SEED,
        axisMin: AXIS_MIN,
        axisMax: AXIS_MAX,
        arrowLen: ARROW_LEN,
        arrowWidth: ARROW_WIDTH,
        arrowMinRatio: ARROW_MIN_RATIO,
      },
    },
  ],

  environments: [],

  views: [{ id: 'blocks-and-curves', label: text('label.view'), default: true }],

  /** 세로가 비싸다. 덩이 높이 + 위 화살표 · 글자 + 캡션 한 줄. */
  canvas: { height: 360, minHeight: 320 },

  /**
   * 겹침이 판정 장치다. 온도 막대는 덩이 **위**에, 관 둘레는 막대 위에, 알갱이는 덩이 위에
   * 그려야 한다. 층 순서로는 `region`(막대)이 알갱이(`body`)를 덮는다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 떨어짐 → 맞붙음 → 굵은 흐름 → 가늘어짐 → 한 온도에서 멈춤 → 흐려짐.
   * 물리 시계는 `flow` 가 시작한 순간(맞붙은 순간)부터 센다.
   */
  timeline: {
    phases: [
      { id: 'apart', duration: APART, caption: key('caption.apart') },
      { id: 'touch', duration: TOUCH, ease: 'smooth', caption: key('caption.touch') },
      { id: 'flow', duration: FLOW, caption: key('caption.flow') },
      { id: 'slow', duration: SLOW, caption: key('caption.slow') },
      { id: 'hold', duration: HOLD, caption: key('caption.meet') },
      { id: 'fade', duration: FADE, caption: key('caption.meet') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — 두 덩이가 서로를 향해 다가가는 자리에서 연다. */
  startAt: 1.0,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 법칙과 식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 720,
    style: { colorRole: 'muted', emphasis: 'strong' },
    // 문안의 수는 스테이지 상수에서 온다 — initialState 가 글자로 옮겨 둔 state 경로 (G133).
    vars: { hot: 'hotText', cold: 'coldText', meet: 'meetText' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것은 거리가 아니라 **두 온도가 겹쳤는가** 다.
   * 막대와 곡선이 같은 눈금을 써서 그 자리를 눈으로 잇는다.
   */

  messages: thermalEquilibriumMessages,
};
