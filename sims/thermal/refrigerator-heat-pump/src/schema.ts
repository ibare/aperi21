// ========================================================================
// refrigerator-heat-pump — 선언
// ========================================================================
// 질문: 냉장고는 찬 안쪽에서 열을 빼 더운 부엌으로 내보낸다 — 열은 저절로는 더운
// 쪽에서 찬 쪽으로만 가는데, 어떻게 거꾸로 옮기나.
//
// 왼쪽 냉장고 안(찬) · 가운데 기계 · 오른쪽 부엌(더운). 굵기가 양에 비례하는 띠 셋이
// 흐른다 — 냉장고 안에서 열 줄기가 빠져 기계로 들어가고, 위에서 전기 일 줄기가 들어와
// 둘이 합쳐진 더 굵은 열 줄기가 부엌으로 나간다. 전기를 끊으면 흐름이 멈추고, 열은
// 저절로 더운 부엌에서 찬 냉장고 안으로 새어 들어 냉장고 안 온도계가 오른다.
// 동사: 일을 넣어 찬 곳에서 더운 곳으로 열을 **옮긴다.**
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:refrigerator-heat-pump` 와 문자 그대로 일치한다 (C4). */
export const REFRIGERATOR_HEAT_PUMP_ID = 'refrigerator-heat-pump';

// ------------------------------------------------------------------------
// 물리 · 표시 배율 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 냉장고 안에서 빼는 열(J). */
export const Q_COLD = 300;
/** 기계에 넣는 전기 일(J). 나가는 띠 굵기는 Q_COLD + WORK 로 계산하고, 글자는 Q_HOT 정박값이다 (NOTES (b)). */
export const WORK = 100;
/**
 * 부엌으로 나가는 열(J) — 화면 글자로 띄우는 정박값. 뺀 열 + 넣은 일과 같아야 한다(300 + 100). 띠 굵기는
 * physics 가 합으로 계산하므로, 둘의 관계를 선언할 자리가 없다(G143).
 */
export const Q_HOT = 400;
/** 냉장고 안 · 부엌의 온도(℃). */
export const T_COLD = 4;
export const T_HOT = 25;
/** 온도계 눈금 꼭대기(℃). 기둥 높이 = 온도 / 이 값 × 관 길이. */
export const THERMO_MAX = 30;
/** 전기를 끊은 뒤 새어 든 열로 냉장고 안 온도가 오르는 폭(℃). 화면에 수로 띄우지 않는다. */
export const LEAK_RISE = 9;
/** 띠 굵기 배율(월드 / J). 굵기가 양에 비례한다 — 300 → 0.75, 100 → 0.25, 400 → 1. */
export const BAND_SCALE = 0.0025;
/** 새어 드는 열 띠의 굵기(월드). 새는 양은 이 조각이 재지 않는다 — 가늘다는 것만 보인다. */
export const LEAK_BAND = 0.16;
/** 알갱이가 띠를 따라 흐르는 속력(월드/초). 모든 띠가 같다 — 그래서 흐르는 양이 굵기로 읽힌다. */
export const FLOW_SPEED = 0.55;
/** 띠 넓이 1 당 알갱이 수. 모든 띠가 같다. */
export const DOT_DENSITY = 22;
/** 알갱이 자리를 뽑는 난수 시드 (같은 시각 = 같은 화면). */
export const SEED = 7;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 기계 중심이 원점, y 는 위가 양수.
// ------------------------------------------------------------------------

/** 냉장고 안(왼쪽 상자)과 부엌(오른쪽 칸)의 사각형. 둘은 같은 크기다. */
export const FRIDGE = { minX: -4.3, maxX: -1.9, minY: -1.2, maxY: 1.2 } as const;
export const KITCHEN = { minX: 1.9, maxX: 4.3, minY: -1.2, maxY: 1.2 } as const;

/** 기계 몸통 [가로, 세로]. 가장 굵은 띠(부엌으로 나가는 열)보다 조금 높다. */
export const MACHINE_SIZE: readonly [number, number] = [0.9, 1.2];

/** 전기 일 띠가 시작하는 콘센트 자리와 크기. */
export const SOCKET_POS: readonly [number, number] = [0, 2.2];
export const SOCKET_SIZE: readonly [number, number] = [0.5, 0.18];

/** 냉장고 안 열 띠가 시작하는 자리(x). 온도계보다 오른쪽. */
export const COLD_BAND_START_X = -2.75;
/** 부엌으로 나가는 띠의 화살 끝(x). 온도계보다 왼쪽. */
export const HOT_BAND_TIP_X = 3.2;
/** 띠 화살 끝 · 꼬리 홈의 길이(월드). */
export const BAND_TIP = 0.28;

/** 새어 드는 열이 지나는 높이(월드 y) — 기계 아래, 두 칸 바닥 위. */
export const LEAK_Y = -0.98;
/** 새는 띠 화살촉의 반폭(월드). 띠가 가늘어 띠 폭 그대로면 촉이 드러나지 않는다. */
export const LEAK_HEAD = 0.17;
/** 전기를 끊을 때 일 띠 윗끝이 콘센트에서 떨어지는 거리(월드). */
export const PLUG_GAP = 0.45;
/** 새어 드는 띠의 양 끝 x — 부엌 안에서 출발해 냉장고 안으로 들어간다. */
export const LEAK_FROM_X = 2.7;
export const LEAK_TO_X = -2.7;

/** 온도계 — 칸 안쪽 가장자리의 x, 관 아래 · 위 끝 y, 관 폭, 아래 공 반지름. */
export const THERMO_FRIDGE_X = -3.85;
export const THERMO_KITCHEN_X = 3.85;
export const THERMO_BOTTOM = -0.85;
export const THERMO_TOP = 0.85;
export const THERMO_WIDTH = 0.14;
export const THERMO_BULB = 0.13;

/**
 * 프레이밍. 가로는 두 칸, 세로는 콘센트 이름표 위부터 캡션 줄 아래까지.
 * 매 프레임 같은 값이다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: -4.5, maxX: 4.5, minY: -1.95, maxY: 2.55 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const refrigeratorHeatPumpMessages = Object.freeze({
  'label.title': { ko: '냉장고와 열펌프', en: 'Refrigerators and heat pumps' },
  'label.operation': { ko: '일을 넣어 열을 옮기는 것', en: 'Moving heat by putting in work' },
  'label.stage': { ko: '부엌의 냉장고', en: 'Fridge in a kitchen' },
  'label.view': { ko: '열의 흐름', en: 'Heat flow' },
  /** 칸 이름. */
  'label.fridge': { ko: '냉장고 안', en: 'Inside the fridge' },
  'label.kitchen': { ko: '부엌', en: 'Kitchen' },
  'label.machine': { ko: '기계', en: 'Machine' },
  'label.socket': { ko: '전기', en: 'Electricity' },
  /** 띠에 붙는 양. 값은 스테이지 상수를 글자로 옮긴 것이다 (C1 — 값이 끼는 조립문은 문안). */
  'label.heat': { ko: '열 {q} J', en: 'heat {q} J' },
  'label.work': { ko: '일 {q} J', en: 'work {q} J' },
  /** 온도계 옆 온도. 기호와 단위만 있지만 값이 끼므로 키로 둔다. */
  'label.temp': { ko: '{t} ℃', en: '{t} ℃' },
  'caption.pull': {
    ko: '기계가 전기 일({w} J)을 받아, 차가운 냉장고 안({tc} ℃)에서 열({qc} J)을 뽑아낸다.',
    en: 'The machine takes in electrical work ({w} J) and pulls heat ({qc} J) out of the cold inside of the fridge ({tc} ℃).',
  },
  'caption.deliver': {
    ko: '두 줄기가 기계에서 합쳐져, 더 굵은 열 줄기({qh} J)가 더 따뜻한 부엌({th} ℃)으로 나간다.',
    en: 'The two streams join in the machine, and a wider stream of heat ({qh} J) flows out into the warmer kitchen ({th} ℃).',
  },
  'caption.cut': {
    ko: '전기를 끊는다.',
    en: 'The electricity is cut off.',
  },
  'caption.seep': {
    ko: '흐름이 멈췄다. 부엌에서 냉장고 안으로 가는 가는 띠가 나타난다.',
    en: 'The flow has stopped. A thin band appears, running from the kitchen into the fridge.',
  },
  'caption.leak': {
    ko: '흐름이 멈췄다. 이제 열은 더운 부엌에서 찬 냉장고 안으로 저절로 새어 들고, 냉장고 안 온도계가 오른다.',
    en: 'The flow has stopped. Now heat seeps on its own from the warm kitchen into the cold fridge, and the fridge thermometer rises.',
  },
} satisfies Record<string, LocalizedText>);

export type RefrigeratorHeatPumpMessageKey = keyof typeof refrigeratorHeatPumpMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: RefrigeratorHeatPumpMessageKey): LocalizedText => refrigeratorHeatPumpMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: RefrigeratorHeatPumpMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const refrigeratorHeatPumpSchema: BundleSchema = {
  id: REFRIGERATOR_HEAT_PUMP_ID,
  label: text('label.title'),
  category: 'thermal',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 흐르고, 합쳐지고, 끊기고, 새어 든다.
  parameters: [],

  /**
   * `qCold` · `work` 는 냉장고 안에서 빼는 열 · 넣는 일(J), `tCold` · `tHot` 은 두 칸의
   * 온도(℃), `thermoMax` 는 온도계 꼭대기(℃), `leakRise` 는 전기를 끊은 뒤 냉장고 안
   * 온도가 오르는 폭(℃), `bandScale` 은 J → 띠 굵기 배율, `leakBand` 는 새는 띠 굵기,
   * `flowSpeed` · `dotDensity` · `seed` 는 알갱이 흐름이다.
   */
  stages: [
    {
      id: 'kitchen-fridge',
      label: text('label.stage'),
      constants: {
        qCold: Q_COLD,
        work: WORK,
        qHot: Q_HOT,
        tCold: T_COLD,
        tHot: T_HOT,
        thermoMax: THERMO_MAX,
        leakRise: LEAK_RISE,
        bandScale: BAND_SCALE,
        leakBand: LEAK_BAND,
        flowSpeed: FLOW_SPEED,
        dotDensity: DOT_DENSITY,
        seed: SEED,
      },
    },
  ],

  environments: [],

  views: [{ id: 'heat-flow', label: text('label.view'), default: true }],

  /** 가로로 넓은 흐름도에 캡션 한두 줄. 세로가 비싸다 (S-piece). */
  canvas: { height: 380, minHeight: 340 },

  /** 기계 몸통이 띠 끝을 덮어야 두 줄기가 「기계 안에서」 합쳐진다. 알갱이는 띠 위에 얹힌다. */
  drawOrder: 'scene',

  /**
   * 한 주기 — 나타남 · 뽑아냄 · 내보냄 · 끊음 · 새기 시작 · 새어 듦 · 흐려짐.
   *
   * `pull` · `deliver` 는 같은 흐름을 보면서 캡션만 앞쪽(들어오는 두 줄기) → 뒤쪽(나가는 한
   * 줄기)으로 옮긴다. 알갱이는 `cut` 이 시작하는 순간 멈추고(`start('cut')`), `cut` 동안 흐려진다.
   * 새는 띠는 `seep` 동안 나타나고, 냉장고 안 온도계는 `leak` 의 진행도(`at('leak')`)를 따라 오른다.
   */
  timeline: {
    phases: [
      { id: 'appear', duration: 0.5, caption: key('caption.pull') },
      { id: 'pull', duration: 4.5, caption: key('caption.pull') },
      { id: 'deliver', duration: 5, caption: key('caption.deliver') },
      { id: 'cut', duration: 1.2, caption: key('caption.cut') },
      { id: 'seep', duration: 0.8, caption: key('caption.seep') },
      { id: 'leak', duration: 5, ease: 'smooth', caption: key('caption.leak') },
      { id: 'fade', duration: 0.8, caption: key('caption.leak') },
    ],
  },

  /** 도착한 순간 이미 흐르고 있다 — 나타남 단계를 건너뛴다. 알갱이는 첫 프레임부터 띠에 차 있다. */
  startAt: 0.5,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 법칙과 성능 계수는 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -6] },
    fontSize: 13,
    wrapWidth: 720,
    style: { colorRole: 'muted', emphasis: 'strong' },
    vars: { w: 'workText', qc: 'qColdText', qh: 'qHotText', tc: 'tColdText', th: 'tHotText' },
  },

  messages: refrigeratorHeatPumpMessages,
};
