// ========================================================================
// resonance — 선언
// ========================================================================
// 질문: 같은 흔들림을 똑같이 받는데, 왜 고유 진동수가 맞는 것만 크게 흔들리나?
//
// 동사: **쌓인다.** 고유 진동수가 조금씩 다른 진동자 61 개를 구동대 하나에 세운다.
// 구동과 맞는 열만 흔들림 폭 띠가 길어지고, 아래 진폭 이력 무늬에 아래가 옅고 위가 진한
// 쐐기가 선다. 어긋난 열에는 맥놀이 줄무늬만 남는다.
//
// 숫자(진동수 · 진폭) · 공명 곡선 이론선 · 위상차는 두지 않는다 (원본 NOTES (c)).
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:resonance` 와 문자 그대로 일치한다 (C4). */
export const RESONANCE_ID = 'resonance';

// ------------------------------------------------------------------------
// 물리 상수 — 원본 index.html 의 값을 그대로 둔다
// ------------------------------------------------------------------------

/**
 * 진동자 i 의 고유 진동수 f_i = F0 + i·DF Hz (i = 0..60). 가운데(30)가 1 Hz.
 * 구동대가 B cos φ 로 흔들리고, 진동자는 구동대에 대한 상대 변위 z 로 운동한다.
 *   z'' + 2γ z' + ω_i² z = Ω² B cos φ
 */
export const OSC = {
  count: 61,
  f0: 0.4,
  df: 0.02,
  /** 감쇠율 [1/s]. 원본 NOTES — 0.22 로는 봉우리가 넓어 「맞는 것만」 이 흐려졌다. */
  gamma: 0.12,
  /** 구동대 흔들림 진폭 [원본 px = 월드 단위]. */
  drive: 2,
  /** 한 걸음 안의 적분 잘게 나누기. */
  substeps: 8,
} as const;

/** 구동 진동수 조작 범위 — 진동자 6~54 번의 고유 진동수, 기본 30 번(1 Hz). */
export const DRIVE = { minIdx: 6, maxIdx: 54, defaultIdx: 30 } as const;

/** 진동자 번호 → 고유 진동수(Hz). */
export function naturalHz(i: number): number {
  return OSC.f0 + i * OSC.df;
}

/** 공명 정상 진폭 ≈ Ω B / (2γ) — 폭포 무늬 진하기의 기준 (Ω = 1 Hz). */
export const A_REF = (2 * Math.PI * 1.0 * OSC.drive) / (2 * OSC.gamma);

/** 진폭 이력 — 110 줄, 10 걸음(1/6 초)마다 한 줄 → 약 18 초. */
export const HISTORY = { rows: 110, rowEvery: 10 } as const;

/** 고정 걸음 · 미리 진행. 원본 `PieceKit.DT` = 1/60, 도착 전 1 초. */
export const DT = 1 / 60;
export const WARM_SECONDS = 1;
/** 실시간 한 프레임에 밀린 걸음의 상한. 원본 하니스는 한 프레임 누적을 0.1 초로 자른다. */
export const MAX_SUBSTEPS = 6;

// ------------------------------------------------------------------------
// 배치 — 원본 캔버스 px 를 월드 단위로 그대로 쓴다 (y 는 위로, 캔버스 위 끝이 0)
// ------------------------------------------------------------------------

/**
 * 원본 캔버스 900 × 296 px (대조 촬영 폭 900). 열 i 의 가로 위치는
 * `side + (i + 0.5) · (width − 2·side) / N`.
 */
export const LAYOUT = {
  width: 900,
  height: 296,
  side: 24,
  /** 구동대 정지 높이(원본 py). */
  baseY: 140,
  /** 진동자 정지 높이 — 구동대 위. */
  rest: 70,
  /** 폭포 무늬 위 끝(원본 py) · 높이. */
  waterfallTop: 166,
  waterfallHeight: HISTORY.rows,
  /** 구동 진동수 표시 삼각형 — 꼭짓점 · 밑변 높이(구동대 정지 위치 아래 px), 반폭. */
  markTip: 8,
  markBase: 16,
  markHalf: 5,
  /** 표시 글자 — 삼각형 오른쪽 틈 · 높이. */
  markLabelGap: 9,
  markLabelY: 13,
  /** 무늬 읽는 법 글자 — 무늬 아래 틈. */
  legendGap: 4,
} as const;

/** 열 간격(월드). */
export const PITCH = (LAYOUT.width - 2 * LAYOUT.side) / OSC.count;

/** 열 i 의 가로 위치(월드). 위의 추 · 띠와 아래 무늬가 같은 열을 쓴다. */
export function colX(i: number): number {
  return LAYOUT.side + (i + 0.5) * PITCH;
}

/** 원본 py(아래로) → 월드 y(위로). */
export function worldY(py: number): number {
  return -py;
}

/**
 * 선 · 점 · 글자 치수(화면 px)와 짙기. 원본 값 그대로 — 테마 토큰을 옮긴 것이 아니라 원본의 그림 결정이다.
 * 흔들림 폭 띠 폭은 원본 `max(2, pitch·0.55)`, 추 반지름은 `max(2, min(3.2, pitch·0.32))`.
 */
export const STROKE = {
  bandWidth: Math.max(2, PITCH * 0.55),
  bandOpacity: 0.1,
  rodWidth: 1,
  rodOpacity: 0.28,
  bobRadius: Math.max(2, Math.min(3.2, PITCH * 0.32)),
  barWidth: 3,
  frameWidth: 1,
  frameOpacity: 0.12,
  markLabelPx: 12,
  legendPx: 11,
  captionPx: 15,
} as const;

/** 원본 캔버스 아래 캡션 · 조작기 줄(px). 원본은 캔버스 밖 한 줄이다. */
export const FOOT_ROW = 34;

/** 원본 그림이 닿는 위 끝(py). 공명 정상 진폭에서 추 · 띠 위 끝이 약 16 px 이다. */
export const CONTENT_TOP = 8;

/**
 * 프레이밍 — 원본 그림이 쓰는 가로(양옆 여백 24 px 안쪽)와 세로(위 끝 ~ 캔버스 아래 + 캡션 줄).
 * 러너가 네 변에 여백(36 px)을 따로 두므로 원본 캔버스 여백까지 담으면 그림이 두 번 작아진다.
 * 매 프레임 같은 값이라 카메라가 흔들리지 않는다.
 */
export const SCENE_BOUNDS = {
  minX: LAYOUT.side,
  maxX: LAYOUT.width - LAYOUT.side,
  minY: worldY(LAYOUT.height + FOOT_ROW),
  maxY: worldY(CONTENT_TOP),
} as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const resonanceMessages = Object.freeze({
  'label.title': { ko: '공명', en: 'Resonance' },
  'label.operation': {
    ko: '구동 진동수가 고유 진동수에 맞을 때',
    en: 'When the driving frequency matches the natural frequency',
  },
  'label.stage': { ko: '진동자 묶음', en: 'Oscillator row' },
  'label.view': { ko: '흔들림과 이력', en: 'Swing and history' },
  /** 구동 진동수 표시 · 슬라이더 이름표. */
  'label.drive': { ko: '구동 진동수', en: 'driving frequency' },
  'label.lowFreq': { ko: '← 고유 진동수 낮음', en: '← lower natural frequency' },
  'label.highFreq': { ko: '고유 진동수 높음 →', en: 'higher natural frequency →' },
  'label.timeAxis': {
    ko: '위: 지금 · 아래로 갈수록 지난 흔들림 크기',
    en: 'top: now · lower rows: earlier swing size',
  },
  'caption.main': {
    ko: '모두 같은 흔들림을 받지만, 고유 진동수가 구동과 맞는 진동자에만 주기마다 흔들림이 쌓인다.',
    en: 'Every oscillator gets the same shaking, but only the one whose natural frequency matches the drive builds up its swing, cycle after cycle.',
  },
} satisfies Record<string, LocalizedText>);

export type ResonanceMessageKey = keyof typeof resonanceMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 통로. */
export const text = (key: ResonanceMessageKey): LocalizedText => resonanceMessages[key];

/** 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 타입이 막는다. */
function key(k: ResonanceMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const resonanceSchema: BundleSchema = {
  id: RESONANCE_ID,
  label: text('label.title'),
  category: 'oscillation',
  operation: text('label.operation'),
  timeModel: 'continuous',
  parameters: [],
  stages: [{ id: 'default', label: text('label.stage'), constants: {} }],
  environments: [],
  views: [{ id: 'default', label: text('label.view'), default: true }],

  /** 원본 그림 세로(8~296 px) + 캡션 줄 34 px 에 프레이밍 여백(위아래 36 px)을 더했다. 폭 850 px 에서 배율 약 0.9. */
  canvas: { height: 368, minHeight: 330 },

  /** 원본 겹침 순서 — 흔들림 폭 · 막대 · 추 · 구동대 · 구동 표시 · 무늬 · 읽는 법. */
  drawOrder: 'scene',

  /**
   * 도착 순간 이미 흔들린다 — 원본은 1 초를 고정 걸음으로 미리 돌렸다. 누적 적분이라 `startAt` 이
   * 아니라 `preroll` 이다. 원본에 연출 시간표가 없어 `timeline` 은 선언하지 않는다.
   */
  preroll: WARM_SECONDS,

  /** 캡션은 고정 한 문장. 자동 진행 중에도, 조작한 뒤에도 참이다 (원본 NOTES (c)). */
  caption: {
    anchor: { screen: 'bottom-left' },
    align: 'left',
    fontSize: STROKE.captionPx,
    style: { colorRole: 'ink', emphasis: 'strong' },
    text: key('caption.main'),
  },

  // 그리드도 카메라 버튼도 없다 (기본값). 원본에 없다.

  messages: resonanceMessages,
};
