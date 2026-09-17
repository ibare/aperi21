// ========================================================================
// hydrogen-spectrum — 선언
// ========================================================================
// 질문: 뜨거운 수소가 내는 빛은 왜 무지개처럼 이어지지 않고 몇 줄뿐인가.
//
// 전자는 정해진 계단 사이만 오르내리므로, 내려올 때 나오는 빛은 낙차에 맞는 몇 가지뿐이고
// 눈에 보이는 빛은 같은 몇 자리(발머 계열 네 선)에만 쌓인다.
//
// 원본: tasks/piece-lab/hydrogen-spectrum. 상수 · 배치는 원본 index.html 에서 그대로 옮겼다.
// 월드 좌표는 원본 캔버스 픽셀(820 × 270)이고 y 만 위로 뒤집는다 — `worldY`.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:hydrogen-spectrum` 와 문자 그대로 일치한다 (C4). */
export const HYDROGEN_SPECTRUM_ID = 'hydrogen-spectrum';

// ------------------------------------------------------------------------
// 원본 상수
// ------------------------------------------------------------------------

/** 원본 캔버스(논리 픽셀). */
export const CANVAS = { width: 820, height: 270 } as const;

/** 원본 고정 걸음(초) — 하네스 `PieceKit.DT`. 사건의 순서가 걸음에 묶여 있어 같은 걸음으로 굴린다. */
export const DT = 1 / 60;
/** 원본 하네스 기본 시드(`?seed=1`). 같은 시각은 언제나 같은 화면이다. */
export const SEED = 1;

/** 준위 수 — n=7 이상은 두지 않는다(NOTES 「화면에 없는 것」). */
export const N_MAX = 6;
export const ELECTRON_COUNT = 6;

/** 에너지 계단. n=1 과 n=2 사이는 축을 끊는다. */
export const LADDER = { x0: 44, x1: 292, yN1: 250, yN2: 205, yZero: 18, breakY: 228 } as const;

/** 스펙트럼 띠(원본 픽셀, y 아래로). */
export const STRIP = { x0: 372, x1: 770, y0: 92, y1: 176 } as const;
export const STRIP_W = STRIP.x1 - STRIP.x0;
/** 띠가 덮는 파장(nm). */
export const LAMBDA = { min: 380, max: 720 } as const;
/** 가시광 밖 광자가 나가는 자리. */
export const UV_X = STRIP.x0 - 34;
export const IR_X = CANVAS.width - 14;
/** 적외선 광자의 휘는 제어점 — 띠 위로 돌아 나간다. */
export const IR_CONTROL = { x: 700, y: -40 } as const;
/** 광자 속력(픽셀/초). */
export const PHOTON_SPEED = 520;

/** 자국 · 섬광의 수명(초). */
export const MARK_LIFE = 0.9;
/** 쌓인 빛의 감쇠 시간상수(초) — 오래 두어도 포화되어 정지 화면이 되지 않게. */
export const DECAY_TAU = 40;
/** 도착 한 번이 띠에 더하는 가우스 폭(픽셀 열). */
export const HIT_SIGMA = 0.8;
/** 누적량 → 빛의 포화 곡선 1 − exp(−I / 이 값). */
export const SATURATION = 1.2;

/** 전자 운동 단계 길이(초). */
export const TIMING = {
  rise: 0.2,
  fall: 0.22,
  holdMin: 0.2,
  holdSpan: 0.45,
  restMin: 0.3,
  restSpan: 0.9,
  firstRestMin: 0.1,
  firstRestSpan: 1.0,
} as const;

/** 미리 돌리는 시간(초) — 원본 600 걸음. */
export const PREROLL_SECONDS = 10;

/**
 * 캡션 자리(월드 단위, 원본 픽셀 척도). 원본에서 캔버스 아래 문단이던 것.
 * 캡션 슬롯은 프레이밍 여백으로 잡히지 않아(장부 G24) 경계에 직접 더한다.
 */
export const CAPTION_BAND = 40;

/** 프레이밍 — 원본 캔버스 사각형에 캡션 띠를 더한 것(y 위). */
export const SCENE_BOUNDS = {
  minX: 0,
  maxX: CANVAS.width,
  minY: -CAPTION_BAND,
  maxY: CANVAS.height,
} as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const hydrogenSpectrumMessages = Object.freeze({
  'label.title': { ko: '수소 스펙트럼', en: 'Hydrogen spectrum' },
  'label.operation': { ko: '불연속한 선 스펙트럼', en: 'A discrete line spectrum' },
  'label.stage': { ko: '기본', en: 'Default' },
  'label.view': { ko: '기본', en: 'Default' },
  /** 준위 번호 — 주양자수 기호라 표식이다 (C1 판정 3). */
  'label.n1': { ko: 'n=1', en: 'n=1' },
  'label.n2': { ko: 'n=2', en: 'n=2' },
  'label.n3': { ko: 'n=3', en: 'n=3' },
  'label.n4': { ko: 'n=4', en: 'n=4' },
  /** n=5 · 6 은 붙어서 말줄임표로 대신한다. */
  'label.more': { ko: '…', en: '…' },
  'label.uv': { ko: '자외선', en: 'ultraviolet' },
  'label.visible': { ko: '눈에 보이는 빛', en: 'visible light' },
  'label.ir': { ko: '적외선', en: 'infrared' },
  /**
   * 고정 한 문장 — 상태와 무관하게 참이라 어느 시각에도 화면과 어긋나지 않는다.
   * 원본의 「낙차에 맞는 색 하나」 는 화면에 파장색이 없어(장부 G60 · G61) 「낙차가 정한 자리」 로 옮겼다.
   */
  'caption.main': {
    ko: '전자가 한 계단 내려올 때마다 그 낙차가 정한 자리로 빛이 날아가고, 눈에 보이는 빛은 언제나 같은 몇 자리에만 쌓인다.',
    en: 'Each time an electron drops a step, light flies to a spot set by that drop, and visible light always piles up in the same few spots.',
  },
} satisfies Record<string, LocalizedText>);

export type HydrogenSpectrumMessageKey = keyof typeof hydrogenSpectrumMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: HydrogenSpectrumMessageKey): LocalizedText => hydrogenSpectrumMessages[key];

/** 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: HydrogenSpectrumMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const hydrogenSpectrumSchema: BundleSchema = {
  id: HYDROGEN_SPECTRUM_ID,
  label: text('label.title'),
  category: 'modern',
  operation: text('label.operation'),
  timeModel: 'continuous',

  // 조작기가 없다 — 자동 진행만으로 「같은 자리에만 쌓인다」 가 완결된다.
  parameters: [],
  stages: [{ id: 'default', label: text('label.stage'), constants: {} }],
  environments: [],
  views: [{ id: 'default', label: text('label.view'), default: true }],

  /** 원본 캔버스(868 px 폭에서 약 286 px)에 캡션 한 줄을 더한 높이. 마운트 뒤 바뀌지 않는다. */
  canvas: { height: 350, minHeight: 320 },

  /** 겹침은 원본 그리기 순서 그대로 — 준위 · 자국 · 전자 · 띠 · 섬광 · 광자 · 영역 이름. */
  drawOrder: 'scene',

  /**
   * 도착한 순간 이미 선이 있고 광자가 날고 있다. 사건 목록 · 띠 누적은 상태를 쌓는 것이라
   * 시계가 아니라 `step` 을 미리 굴린다 — 원본의 600 걸음.
   */
  preroll: PREROLL_SECONDS,

  // 시간표 없음 — 주기가 아니라 난수로 이어지는 사건의 흐름이다. 캡션은 고정 한 문장.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -6] },
    fontSize: 14,
    style: { colorRole: 'muted', emphasis: 'strong' },
    text: key('caption.main'),
    wrapWidth: 820,
  },

  messages: hydrogenSpectrumMessages,
};
