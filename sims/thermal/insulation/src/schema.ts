// ========================================================================
// insulation — 선언
// ========================================================================
// 질문: 같은 뜨거운 물을 다른 것으로 감싸 두면, 같은 시간이 지난 뒤 왜 식은 정도가 다른가.
//
// 같은 온도의 물을 담은 컵 셋 — 맨 컵 · 천으로 감싼 컵 · 스티로폼 컵 — 을 나란히 둔다.
// 셋 다 같은 바깥에 놓였고, 다른 것은 감쌈이 열을 얼마나 잘 통과시키는가 하나뿐이다.
// 시간이 흐르면 컵 안 온도 막대가 서로 다른 빠르기로 내려가고, 곡선 셋이 한 판에서 벌어진다.
// 빠져나가는 열은 벽을 건너는 알갱이의 수로 보인다.
//
// 벽 안의 온도 분포(열이 재료를 타고 번지는 모습)는 thermal-conduction 의 몫이라 두지 않는다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:insulation` 와 문자 그대로 일치한다 (C4). */
export const INSULATION_ID = 'insulation';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 세 컵에 담은 물의 처음 온도(℃). 셋이 같다. */
export const T_START = 80;
/** 바깥 공기 온도(℃). 셋이 같은 바깥에 놓였다. */
export const T_OUTSIDE = 20;
/**
 * 감쌈마다 열 통과율 — 바깥과의 온도 차가 줄어드는 빠르기(1/초, 화면 시간).
 * 통과율 ÷ 물의 열용량을 한 수로 합친 값이다. 물이 같으니 다른 것은 감쌈뿐이다.
 */
export const K_BARE = 0.12;
export const K_CLOTH = 0.05;
export const K_FOAM = 0.015;
/**
 * 컵 하나가 바깥 온도까지 다 식을 때 벽을 건너는 열 알갱이 수. 알갱이 하나 = 처음 온도 차만큼의
 * 열의 1/packets. 세 컵이 같은 수를 쓰므로 **같은 시간에 떠난 알갱이 수가 곧 빠져나간 열**이다.
 */
export const PACKETS = 60;
/** 알갱이 하나가 물 안에서 벽 바깥 공기까지 가는 시간(초). */
export const GRAIN_TRAVEL = 1.6;
/** 알갱이가 이동 거리의 마지막 몫 동안 옅어진다 — 이 몫(0~1). 벽을 건너는 동안은 짙다. */
export const GRAIN_FADE_SHARE = 0.35;
/** 알갱이 자리를 흩는 시드. 같은 시각은 같은 화면이다 (S-sim). */
export const SEED = 11;
/** 온도 눈금의 아래 · 위 끝(℃). 컵 안 막대와 곡선 판이 같은 눈금을 쓴다. */
export const AXIS_MIN = 10;
export const AXIS_MAX = 90;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 왼쪽에 컵 셋, 오른쪽에 온도-시간 곡선 판. y 는 위.
// ------------------------------------------------------------------------

/** 컵 셋의 가운데 x. 왼쪽부터 맨 컵 · 천 감쌈 · 스티로폼. */
export const CUP_X: readonly [number, number, number] = [-6.2, -3.9, -1.6];
/** 컵 안쪽 반폭 · 벽 두께 · 높이(컵 바닥은 y = 0). 셋이 같다 — 같은 컵이다. */
export const CUP_INNER_HALF = 0.42;
export const CUP_WALL = 0.05;
export const CUP_HEIGHT = 2.2;
/** 물이 차 있는 높이. 셋이 같다 — 같은 양의 물이다. */
export const WATER_TOP = 1.9;
/** 감쌈 두께(월드). 맨 컵은 0. 두께는 그림일 뿐이고 식는 빠르기는 통과율 상수가 정한다. */
export const WRAP_CLOTH = 0.12;
export const WRAP_FOAM = 0.26;

/** 온도 막대(관)의 폭. 컵 가운데에 꽂힌다. */
export const TUBE_WIDTH = 0.16;
/** 눈금 AXIS_MIN · AXIS_MAX 가 놓이는 y. 막대와 곡선이 이 높이를 함께 쓴다. */
export const SCALE_BOTTOM = 0.15;
export const SCALE_TOP = 2.05;

/** 알갱이가 떠나는 물 안 세로 범위와, 벽 바깥에서 더 나아가는 거리 · 떠오르는 높이. */
export const GRAIN_Y_MIN = 0.25;
export const GRAIN_Y_MAX = 1.7;
export const GRAIN_EXIT = 0.42;
export const GRAIN_RISE = 0.3;
/** 알갱이 반지름(월드). */
export const GRAIN_R = 0.07;

/** 처음 온도 글자가 놓이는 높이 — 컵 위. */
export const TEMP_LABEL_Y = 2.5;
/** 컵 이름이 놓이는 높이 — 컵 아래. */
export const NAME_Y = -0.5;

/** 곡선 판의 가로 범위. 세로는 막대와 같은 눈금이다. */
export const GRAPH_X0 = 0.3;
export const GRAPH_X1 = 3.9;

/**
 * 프레이밍은 주장의 일부다. 가로는 맨 컵 왼쪽으로 빠져나가는 알갱이부터 곡선 끝 이름표까지,
 * 세로는 컵 이름 아래(캡션 한 줄이 이름에 붙지 않을 여백까지)부터 처음 온도 글자 위까지.
 * 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -7.3, maxX: 5.55, minY: -1.05, maxY: 2.75 } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이(초)
// ------------------------------------------------------------------------

/** 같은 온도의 물을 담은 세 컵을 보이는 동안. */
export const POUR = 1.4;
/** 식기 시작 — 알갱이가 빠져나가는 빠르기가 다르다는 것을 보이는 동안. */
export const COOL_EARLY = 4;
/** 계속 식는 동안 — 막대 · 곡선이 벌어진다. */
export const COOL_LATE = 6;
/** 같은 시간 뒤의 그림을 읽는 동안 · 다음 주기로 흐려지는 동안. */
export const HOLD = 3.6;
export const FADE = 0.6;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const insulationMessages = Object.freeze({
  'label.title': { ko: '보온과 단열', en: 'Insulation' },
  'label.operation': { ko: '열의 이동을 늦추는 것', en: 'Slowing the flow of heat' },
  'label.stage': { ko: '컵 셋', en: 'Three cups' },
  'label.view': { ko: '컵과 곡선', en: 'Cups and curves' },
  /** 컵 이름 — 감쌈의 재료. 세 컵을 가르는 유일한 조건이라 이름이 없으면 조각이 말을 못 한다. */
  'label.bare': { ko: '맨 컵', en: 'Bare cup' },
  'label.cloth': { ko: '천 감쌈', en: 'Cloth wrap' },
  'label.foam': { ko: '스티로폼', en: 'Foam cup' },
  /** 온도 글자. 값은 선언한 처음 온도 · 바깥 온도를 끼운다 (C1). */
  'label.temp': { ko: '{t} ℃', en: '{t} ℃' },
  'label.outside': { ko: '바깥 {t} ℃', en: 'outside {t} ℃' },
  /** 곡선 판의 축 기호. 표식이다 (C1 판정). */
  'label.axisTemp': { ko: 'T', en: 'T' },
  'label.axisTime': { ko: 't', en: 't' },
  'caption.pour': {
    ko: '{t0} ℃ 물을 세 컵에 똑같이 담았다 — 맨 컵, 천으로 감싼 컵, 스티로폼 컵. 바깥은 {out} ℃ 다',
    en: 'The same {t0} ℃ water in three cups — bare, wrapped in cloth, and foam. Outside it is {out} ℃',
  },
  'caption.early': {
    ko: '셋이 함께 식기 시작한다 — 맨 컵 벽으로는 열 알갱이가 줄지어 빠져나가고, 스티로폼 벽으로는 드물게 빠져나간다',
    en: 'All three start to cool — heat grains stream out through the bare wall, and only now and then through the foam',
  },
  'caption.late': {
    ko: '온도 막대 셋이 서로 다른 빠르기로 내려가고, 곡선 셋이 벌어진다',
    en: 'The three temperature bars fall at different rates, and the three curves spread apart',
  },
  'caption.hold': {
    ko: '같은 시간이 지났다 — 맨 컵이 가장 많이 식었고, 스티로폼 컵이 가장 적게 식었다',
    en: 'The same time has passed — the bare cup cooled the most, the foam cup the least',
  },
} satisfies Record<string, LocalizedText>);

export type InsulationMessageKey = keyof typeof insulationMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: InsulationMessageKey): LocalizedText => insulationMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: InsulationMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const insulationSchema: BundleSchema = {
  id: INSULATION_ID,
  label: text('label.title'),
  category: 'thermal',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 세 감쌈이 이미 나란히 식고 있다. 견줄 것은 「같은 시간 뒤」 하나다.
  parameters: [],

  stages: [
    {
      id: 'cups',
      label: text('label.stage'),
      constants: {
        tStart: T_START,
        tOutside: T_OUTSIDE,
        kBare: K_BARE,
        kCloth: K_CLOTH,
        kFoam: K_FOAM,
        packets: PACKETS,
        grainTravel: GRAIN_TRAVEL,
        grainFadeShare: GRAIN_FADE_SHARE,
        seed: SEED,
        axisMin: AXIS_MIN,
        axisMax: AXIS_MAX,
      },
    },
  ],

  environments: [],

  views: [{ id: 'cups-and-curves', label: text('label.view'), default: true }],

  /** 세로가 비싸다. 컵 높이 + 위 온도 글자 · 아래 이름 + 캡션 한 줄. */
  canvas: { height: 310, minHeight: 280 },

  /**
   * 겹침이 판정 장치다. 온도 막대는 물 **위**에, 알갱이는 벽 · 감쌈 **위**로 지나가야
   * 「벽을 건넌다」 로 읽힌다. 층 순서로는 `region`(감쌈 · 막대)이 알갱이(`body`)를 덮는다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 담음 → 식기 시작 → 계속 식음 → 같은 시간 뒤 멈춘 그림 → 흐려짐.
   * 식는 시계는 `early` 가 시작한 순간부터 세고 `late` 가 끝나는 순간 멈춘다 — 그
   * 길이가 곧 「같은 시간」 이다.
   */
  timeline: {
    phases: [
      { id: 'pour', duration: POUR, caption: key('caption.pour') },
      { id: 'early', duration: COOL_EARLY, caption: key('caption.early') },
      { id: 'late', duration: COOL_LATE, caption: key('caption.late') },
      { id: 'hold', duration: HOLD, caption: key('caption.hold') },
      { id: 'fade', duration: FADE, caption: key('caption.hold') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — 맨 컵에서 알갱이가 막 빠져나가기 시작한 자리에서 연다. */
  startAt: 2.2,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 법칙과 식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    style: { colorRole: 'muted', emphasis: 'strong' },
    // 문안의 수는 스테이지 상수에서 온다 — initialState 가 글자로 옮겨 둔 state 경로 (G133).
    vars: { t0: 'startText', out: 'outsideText' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것은 거리가 아니라 **같은 시간 뒤 어느 곡선이
   * 얼마나 내려왔는가** 다. 막대와 곡선이 같은 눈금을 써서 그 높이를 눈으로 잇는다.
   */

  messages: insulationMessages,
};
