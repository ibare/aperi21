// ========================================================================
// isothermal-process — 선언
// ========================================================================
// 질문: 온도를 붙든 채 기체를 부풀리면, 들어온 열은 어디로 가나.
//
// 큰 열원(항온조) 위에 세운 실린더의 피스톤이 천천히 올라간다. 그동안 온도계는
// 그대로이고, 항온조에서 열 알갱이가 하나씩 들어와 기체를 지나 피스톤 쪽으로 나간다.
// 들어온 알갱이(Q 더미)와 나간 알갱이(W 더미)는 길 위의 한 알갱이만큼만 차이 나고,
// 다 부풀면 같은 수로 쌓인다 — 기체에는 하나도 남지 않는다. 옆 P–V 그림에서 점은
// 같은 온도의 곡선을 따라 내려가고, 지나온 아래 넓이가 칠해진다 — 이것이 이 조각의
// 주장이 서는 그림이다.
//
// 이웃 `boyles-law` 는 P×V 직사각형으로 「곱이 같다」 를, `pv-diagram` 은 길마다 다른
// 넓이를, `first-law-of-thermodynamics` 는 열이 ΔU · W 로 갈리는 것을 말한다. 이 조각은
// 직사각형을 두지 않고 ΔU 더미도 두지 않는다 — 갈리지 않고 모두 W 로 간다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:isothermal-process` 와 문자 그대로 일치한다 (C4). */
export const ISOTHERMAL_PROCESS_ID = 'isothermal-process';

// ------------------------------------------------------------------------
// 물리 · 표시 배율 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 항온조와 기체의 온도(K). 주기 내내 이 값이다 — 화면에도 그대로 뜬다. */
export const TEMPERATURE = 300;
/** 끝 부피 ÷ 처음 부피. 피스톤이 이만큼 부피를 늘린다. */
export const EXPANSION = 3;
/** 한 번 부푸는 동안 들어오는(그리고 나가는) 열 알갱이 수. 알갱이 하나 = 같은 양의 열. */
export const GRAIN_COUNT = 6;

/** 분자 배치를 뽑는 시드와 분자 수. 분자는 작은 배경이다. */
export const MOLECULE_SEED = 7;
export const MOLECULE_COUNT = 20;
/** 처음 부피에서 분자가 상자를 한 번 오가는 빈도의 범위(회/초). */
export const MOLECULE_RATE_MIN = 0.18;
export const MOLECULE_RATE_MAX = 0.4;

/** 표시 배율 — 처음 부피(비 1)에서 기체 기둥의 높이(월드). */
export const WORLD_PER_VOLUME = 0.72;
/** 표시 배율 — P–V 그림의 V 축(부피 비 1 의 길이) · P 축(처음 압력 비 1 의 높이), 월드. */
export const GRAPH_WORLD_PER_VOLUME = 1.1;
export const GRAPH_WORLD_PER_PRESSURE = 2.1;
/** P–V 그림이 보이는 범위 — 처음 값을 1 로 한 비. */
export const GRAPH_V_MAX = 3.35;
export const GRAPH_P_MAX = 1.18;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 실린더는 세워져 있고 피스톤이 위로 올라간다.
// ------------------------------------------------------------------------

/** 실린더 안쪽. 바닥(y = bottom)이 항온조 윗면에 닿는다. 위 벽 끝은 배율 · 부피 비에서 정한다. */
export const CYLINDER = { left: 0, right: 1.5, bottom: 0 } as const;
/** 항온조 — 실린더 아래에 넓게 깔린 열원. */
export const BATH = { left: -1.25, right: 2.75, bottom: -0.55, top: 0 } as const;
/** 피스톤 두께(월드). */
export const PISTON_THICKNESS = 0.16;
/** 위 벽이 가장 높이 오른 피스톤 위로 남는 여유(월드). */
export const WALL_HEADROOM = 0.1;

/** 두 더미 — 들어온 열(Q)은 실린더 왼쪽, 나간 일(W)은 오른쪽. 아래 알갱이 자리의 x · y(월드). */
export const Q_STACK = { x: -0.6, y: 0.2 } as const;
export const W_STACK = { x: 2.15, y: 0.2 } as const;
/** 알갱이가 떠나는 항온조 속 자리(y, 월드). x 는 실린더 가운데다. */
export const GRAIN_SOURCE_Y = -0.32;

/** 온도 글자 자리(월드). 실린더 왼쪽 위. */
export const TEMPERATURE_AT = [-0.6, 2.55] as const;

/** P–V 그림의 원점(월드). V 는 오른쪽, P 는 위. */
export const GRAPH_ORIGIN = [3.15, 0] as const;

/**
 * 프레이밍은 주장의 일부다. 가로는 항온조 왼쪽 끝부터 V 축 끝 이름표까지, 세로는
 * 알갱이가 벽을 넘는 높이부터 항온조 아래 · 캡션 줄까지. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -1.4, maxX: 7.35, minY: -0.95, maxY: 2.75 } as const;

// ------------------------------------------------------------------------
// 문안 (C1)
// ------------------------------------------------------------------------

export const isothermalProcessMessages = Object.freeze({
  'label.title': { ko: '등온 과정', en: 'Isothermal process' },
  'label.operation': { ko: '온도를 유지하는 변화', en: 'A change that keeps the temperature fixed' },
  'label.stage': { ko: '항온조 위 실린더', en: 'Cylinder on a heat bath' },
  'label.view': { ko: '실린더와 P–V 그림', en: 'Cylinder and P–V diagram' },

  /** 축 이름 · 더미 · 넓이 표식. 물리 기호라 번역하지 않는다 (C1 판정 3). */
  'label.pressure': { ko: 'P', en: 'P' },
  'label.volume': { ko: 'V', en: 'V' },
  'label.volumeStart': { ko: 'V₁', en: 'V₁' },
  'label.volumeEnd': { ko: 'V₂', en: 'V₂' },
  'label.heat': { ko: 'Q', en: 'Q' },
  'label.work': { ko: 'W', en: 'W' },
  /** 온도 — 값은 스테이지 상수를 그대로 끼운다. */
  'label.temperature': { ko: 'T = {t} K', en: 'T = {t} K' },
  'label.bath': { ko: '항온조 {t} K', en: 'Heat bath {t} K' },

  'caption.start': {
    ko: '{t} K 항온조에 담근 실린더 — 기체도 {t} K 이다',
    en: 'A cylinder standing in a {t} K heat bath — the gas is at {t} K too',
  },
  'caption.expand': {
    ko: '피스톤이 천천히 올라가는 동안 항온조에서 열 알갱이가 들어와 기체를 지나 피스톤 쪽으로 나간다 — 온도계는 {t} K 그대로',
    en: 'As the piston rises slowly, grains of heat come in from the bath, pass through the gas and leave through the piston — the thermometer stays at {t} K',
  },
  'caption.hold': {
    ko: '들어온 알갱이 {n}개, 나간 알갱이 {n}개 — 기체에 남은 것은 없고 온도는 {t} K 그대로다',
    en: '{n} grains came in and {n} grains went out — none stayed in the gas, and it is still at {t} K',
  },
  'caption.reset': {
    ko: '처음 자리로 되돌린다',
    en: 'Back to the start',
  },
} satisfies Record<string, LocalizedText>);

export type IsothermalProcessMessageKey = keyof typeof isothermalProcessMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: IsothermalProcessMessageKey): LocalizedText => isothermalProcessMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: IsothermalProcessMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const isothermalProcessSchema: BundleSchema = {
  id: ISOTHERMAL_PROCESS_ID,
  label: text('label.title'),
  category: 'thermal',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 피스톤이 오르고, 알갱이가 지나가고, 넓이가 칠해진다.
  parameters: [],

  stages: [
    {
      id: 'bath',
      label: text('label.stage'),
      constants: {
        t: TEMPERATURE,
        k: EXPANSION,
        grains: GRAIN_COUNT,
        seed: MOLECULE_SEED,
        molecules: MOLECULE_COUNT,
        rateMin: MOLECULE_RATE_MIN,
        rateMax: MOLECULE_RATE_MAX,
        worldPerVolume: WORLD_PER_VOLUME,
        graphWorldPerVolume: GRAPH_WORLD_PER_VOLUME,
        graphWorldPerPressure: GRAPH_WORLD_PER_PRESSURE,
        graphVMax: GRAPH_V_MAX,
        graphPMax: GRAPH_P_MAX,
      },
    },
  ],

  environments: [],

  views: [{ id: 'bath', label: text('label.view'), default: true }],

  // 가로로 긴 장치 + P–V 그림. 세로를 더 주면 가로가 먼저 차서 그림만 작아진다.
  canvas: { height: 360, minHeight: 320 },

  /**
   * 겹침 순서를 scene 이 정한다. 옅은 기체 · 항온조 · 넓이 칠은 분자 · 곡선 · 알갱이
   * **아래**로 깔려야 하는데, 층 순서로는 `region`(매질)이 물체 위로 올라온다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 처음 자리 → 천천히 부풂(V₁ → k·V₁) → 멈춤 → 처음 자리로.
   *
   * 부피가 바뀌는 두 단계는 `linear` 다 — 분자 위상을 단계마다 더하는 physics 가
   * 진행도를 시간에 비례한다고 보고 적분한다(NOTES 「어휘 부족」 G59). 등온은 천천히
   * 부풀리는 것이라 고른 속도가 그림에도 맞는다.
   */
  timeline: {
    phases: [
      { id: 'rest0', duration: 1.8, caption: key('caption.start') },
      { id: 'expand', duration: 9.0, ease: 'linear', caption: key('caption.expand') },
      { id: 'hold', duration: 3.6, caption: key('caption.hold') },
      { id: 'reset', duration: 1.4, ease: 'linear', caption: key('caption.reset') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — 피스톤이 오르며 알갱이가 지나가는 중에 연다. */
  startAt: 4.2,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 식과 법칙의 진술은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 14,
    wrapWidth: 760,
    style: { colorRole: 'muted', emphasis: 'strong' },
    // 온도 · 알갱이 수는 스테이지 상수에서 온다 — state 가 글자로 옮겨 둔다(장부 G133 우회).
    vars: { t: 't', n: 'n' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). P–V 그림은 축 둘과 두 부피 눈금만 둔다 —
   * 격자를 깔면 넓이를 칸 수로 세라는 지시가 된다.
   */

  messages: isothermalProcessMessages,
};
