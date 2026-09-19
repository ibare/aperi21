// ========================================================================
// single-slit-diffraction — 선언
// ========================================================================
// 질문: 틈 하나를 지난 빛은 왜 스크린에 밝은 띠와 어두운 자리를 남기고, 틈을 좁히면
// 왜 가운데 밝은 띠가 넓어지는가.
//
// 틈을 점광원 여럿으로 나누고, 스크린의 첫 어두운 점 P 까지 줄기를 긋는다. P 를 중심으로
// 위 끝과 같은 거리의 호를 그으면 아래로 갈수록 줄기가 길어지는 계단이 드러나고, 아래 끝은
// 꼭 λ 더 길다. 틈의 위 절반과 아래 절반에서 같은 번호끼리 짝지으면 짝마다 아래 줄기가
// λ/2 더 길다. 틈을 좁히면 같은 작도가 스크린 가운데에서 더 먼 점에서야 서고, 그만큼
// 가운데 밝은 띠가 넓다.
//
// 그림의 길이 단위는 파장 λ 하나다(월드 1 = λ). 엔진 위에서 바로 만든 조각이다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:single-slit-diffraction` 와 문자 그대로 일치한다 (C4). */
export const SINGLE_SLIT_DIFFRACTION_ID = 'single-slit-diffraction';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 넓은 틈의 폭(λ). */
export const SLIT_WIDE = 6;
/** 좁힌 틈의 폭(λ). 넓은 틈의 절반. */
export const SLIT_NARROW = 3;
/**
 * 틈에서 스크린까지(λ). 실제 스크린은 파장의 수십만 배 멀리 있다 — 그대로 그리면 줄기가
 * 한 줄로 겹쳐 경로 차를 볼 수 없어 14λ 로 당겼다. 곡선도 이 거리에서 계산한다 (NOTES (b)).
 */
export const SCREEN_DISTANCE = 14;
/** 틈을 나누는 점광원 수. 짝수 — 위 절반과 아래 절반이 같은 수라야 짝이 맞는다. */
export const SOURCES = 4;
/** 빛의 파장(nm). 색만 정한다 — 그림의 길이 단위는 λ 자체다. */
export const WAVELENGTH_NM = 633;
/** 들어오는 파면이 움직이는 빠르기(λ/초). 보이기 위한 값이다. */
export const WAVE_SPEED = 1.2;

// ------------------------------------------------------------------------
// 배치 — 월드 λ. 틈 가운데가 원점, 빛은 왼쪽에서 오른쪽으로 간다.
// ------------------------------------------------------------------------

/** 가림벽 두께. */
export const BARRIER_T = 0.3;
/** 가림벽 · 스크린의 위아래 끝(± 이 값). 좁은 틈의 첫 어두운 점(약 5λ) 너머 옆 띠까지 담는다. */
export const SCREEN_HALF = 6.5;
/** 스크린 띠의 두께. */
export const SCREEN_W = 0.8;
/** 스크린 띠와 세기 곡선 0 기준선 사이. */
export const CURVE_GAP = 0.6;
/** 세기 곡선의 최대 폭(세기 1). */
export const CURVE_W = 4.5;
/** 곡선 기준선에서 가운데 띠 폭 괄호까지. */
export const BRACKET_GAP = 0.9;
/** 들어오는 파면이 차지하는 가로 범위(가림벽 왼쪽 면에서 이만큼 떨어진 곳까지)와 세로 반폭. */
export const WAVE_REACH = 3.6;
export const WAVE_HALF = 5.2;
/** 파면이 가림벽 바로 앞에서 끊기는 거리 — 짝 번호 이름표 자리를 비운다. */
export const WAVE_STOP = 0.9;

/** 캡션 줄이 놓일 아래 띠(λ). 캡션 자리가 프레이밍 여백으로 잡히지 않는다 (장부 G24). */
export const CAPTION_BAND = 2.4;

/** 고정 프레이밍 — 들어오는 파면부터 괄호까지, 스크린 위아래 끝과 캡션 띠. */
export const SCENE_BOUNDS = {
  minX: -BARRIER_T / 2 - WAVE_REACH - 0.3,
  maxX: SCREEN_DISTANCE + SCREEN_W + CURVE_GAP + CURVE_W + BRACKET_GAP + 0.8,
  minY: -SCREEN_HALF - CAPTION_BAND,
  maxY: SCREEN_HALF + 0.3,
} as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const singleSlitDiffractionMessages = Object.freeze({
  'label.title': { ko: '단일 슬릿 회절', en: 'Single-slit diffraction' },
  'label.operation': { ko: '폭이 만드는 무늬', en: 'The pattern a width makes' },
  'label.stage': { ko: '기본', en: 'Default' },
  'label.view': { ko: '기본', en: 'Default' },
  /** 도식 표식 — 파장 기호와 짝 번호. 번역하지 않는다 (C1 판정 3). */
  'mark.lambda': { ko: 'λ', en: 'λ' },
  'mark.halfLambda': { ko: 'λ/2', en: 'λ/2' },
  'mark.pair': { ko: '{k}', en: '{k}' },
  'caption.wide': {
    ko: '틈 폭 {wide}λ — 스크린 가운데에 밝은 띠가 서고 양옆은 어둡다',
    en: 'Slit width {wide}λ — a bright band stands in the middle of the screen, dark on either side',
  },
  'caption.rays': {
    ko: '틈을 점광원 {n}개로 나누고, 가운데 띠 옆 첫 어두운 점까지 줄기를 긋는다',
    en: 'Split the slit into {n} point sources and draw rays to the first dark point beside the central band',
  },
  'caption.arc': {
    ko: '위 끝 줄기와 같은 길이에 호를 긋자, 아래로 갈수록 줄기가 길어져 아래 끝은 λ 더 길다',
    en: 'An arc at the length of the top ray shows the rays getting longer downward — the bottom edge is λ longer',
  },
  'caption.pair': {
    ko: '위 절반과 아래 절반의 같은 번호끼리 짝지으면, 짝마다 아래 줄기가 λ/2 더 길다 — 줄기가 모인 점은 어둡다',
    en: 'Pair the same numbers in the upper and lower halves: in every pair the lower ray is λ/2 longer — where they meet is dark',
  },
  'caption.narrow': {
    ko: '틈을 {wide}λ 에서 {narrow}λ 로 좁히자 가운데 밝은 띠가 넓어진다',
    en: 'Narrowing the slit from {wide}λ to {narrow}λ widens the central bright band',
  },
  'caption.raysNarrow': {
    ko: '좁은 틈의 점광원 {n}개에서 새 첫 어두운 점까지 줄기를 긋는다',
    en: 'Draw rays from the {n} point sources of the narrow slit to the new first dark point',
  },
  'caption.arcNarrow': {
    ko: '아래 끝 줄기가 λ 더 긴 점은 이제 스크린 가운데에서 더 멀다 — 줄기가 더 기울었다',
    en: 'The point where the bottom-edge ray is λ longer now lies farther from the middle — the rays tilt more',
  },
  'caption.pairNarrow': {
    ko: '짝마다 아래 줄기가 λ/2 더 길다 — 첫 어두운 점이 바깥으로 물러나 가운데 띠가 점선보다 넓다',
    en: 'In every pair the lower ray is λ/2 longer — the first dark point moved outward and the central band is wider than the dashed one',
  },
  'caption.widen': {
    ko: '틈을 다시 {wide}λ 로 넓힌다',
    en: 'Widen the slit back to {wide}λ',
  },
} satisfies Record<string, LocalizedText>);

export type SingleSlitDiffractionMessageKey = keyof typeof singleSlitDiffractionMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: SingleSlitDiffractionMessageKey): LocalizedText => singleSlitDiffractionMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: SingleSlitDiffractionMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const singleSlitDiffractionSchema: BundleSchema = {
  id: SINGLE_SLIT_DIFFRACTION_ID,
  label: text('label.title'),
  category: 'optics',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 넓은 틈의 작도 → 좁히기 → 좁은 틈의 작도가 저절로 돈다.
  parameters: [],

  stages: [
    {
      id: 'default',
      label: text('label.stage'),
      constants: {
        slitWide: SLIT_WIDE,
        slitNarrow: SLIT_NARROW,
        screenDistance: SCREEN_DISTANCE,
        sources: SOURCES,
        wavelengthNm: WAVELENGTH_NM,
        waveSpeed: WAVE_SPEED,
      },
    },
  ],

  environments: [],

  views: [{ id: 'main', label: text('label.view'), default: true }],

  /** 가로로 긴 그림(약 26λ × 15λ). 세로를 더 주면 가로가 먼저 차서 그림만 작아진다. */
  canvas: { height: 440, minHeight: 380 },

  /** 스크린 띠 위에 줄기가 모이고, 가림벽이 파면 위에 온다 — 쓴 순서대로 겹친다. */
  drawOrder: 'scene',

  /**
   * 한 주기 = 넓은 틈 작도(줄기 → 호 · 계단 → 짝) → 좁히기 → 좁은 틈 작도 → 다시 넓히기.
   * 호와 계단이 자라는 짧은 단계 뒤에 같은 캡션으로 읽는 단계를 이어 둔다(다시 페이드하지 않는다).
   */
  timeline: {
    phases: [
      { id: 'wide', duration: 2.5, caption: key('caption.wide') },
      { id: 'wide-rays', duration: 1.8, ease: 'smooth', caption: key('caption.rays') },
      { id: 'wide-arc', duration: 1.2, ease: 'smooth', caption: key('caption.arc') },
      { id: 'wide-arc-hold', duration: 2.8, caption: key('caption.arc') },
      { id: 'wide-pair', duration: 4.2, caption: key('caption.pair') },
      { id: 'narrow', duration: 2.6, ease: 'smooth', caption: key('caption.narrow') },
      { id: 'narrow-rays', duration: 1.8, ease: 'smooth', caption: key('caption.raysNarrow') },
      { id: 'narrow-arc', duration: 1.2, ease: 'smooth', caption: key('caption.arcNarrow') },
      { id: 'narrow-arc-hold', duration: 2.6, caption: key('caption.arcNarrow') },
      { id: 'narrow-pair', duration: 4.4, caption: key('caption.pairNarrow') },
      { id: 'widen', duration: 2.0, ease: 'smooth', caption: key('caption.widen') },
    ],
  },

  /** 도착한 순간 이미 빛이 틈으로 들어오고 스크린에 띠가 서 있다. */
  startAt: 0.8,

  // 슬롯 하나. 지금 화면에서 보이는 것만 말한다 — 조건식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-left', offset: [10, -6] },
    align: 'left',
    fontSize: 13,
    wrapWidth: 640,
    fade: 0.25,
    style: { colorRole: 'muted', emphasis: 'strong' },
    vars: { wide: 'wide', narrow: 'narrow', n: 'sources' },
  },

  messages: singleSlitDiffractionMessages,
};
