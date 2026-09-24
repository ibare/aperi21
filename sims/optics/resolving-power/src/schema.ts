// ========================================================================
// resolving-power — 선언
// ========================================================================
// 질문: 두 점이 가까워지면 왜 어느 순간 하나로 뭉쳐 보이는가. 구멍을 키우면 왜 다시 갈리는가.
//
// 원형 구멍을 지난 점 하나의 빛은 스크린에 점이 아니라 가운데 밝은 원반과 첫 어두운 고리를 가진
// 무늬를 남긴다. 두 점의 무늬를 겹쳐 두고(세기의 합) 두 점을 다가가게 하면, 한쪽 봉우리가 다른
// 쪽의 첫 어두운 자리에 닿을 때 합 곡선의 가운데 골이 얕아지고, 그보다 안으로 들어오면 골이
// 사라져 하나로 뭉친다. 같은 간격에서 구멍 지름을 키우면 무늬가 좁아져 다시 둘로 갈린다.
//
// 각도 단위는 μrad 다 — 파장(nm) / 지름(mm) 이 곧 μrad 이다. 엔진 위에서 바로 만든 조각이다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:resolving-power` 와 문자 그대로 일치한다 (C4). */
export const RESOLVING_POWER_ID = 'resolving-power';

// ------------------------------------------------------------------------
// 물리 · 표시 배율 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 빛의 파장(nm). */
export const WAVELENGTH_NM = 550;
/** 처음 구멍 지름(mm). */
export const APERTURE_SMALL = 2;
/** 마지막 단계에서 키운 구멍 지름(mm). */
export const APERTURE_LARGE = 5;
/**
 * 두 점의 각 간격 목록 — **처음 구멍의 레일리 각(첫 어두운 자리까지의 각) 배수**로 둔다.
 * 레일리 단계가 파장 · 지름을 바꿔도 늘 첫 어두운 자리에 서게 하려는 단위다.
 */
export const SEP_FAR = 1.8;
export const SEP_RAYLEIGH = 1;
export const SEP_NEAR = 0.5;
/** 표시 배율 — 스크린 위 1 μrad 가 차지하는 월드 길이. */
export const IMAGE_SCALE = 0.012;
/** 표시 배율 — 구멍 그림에서 지름 1 mm 가 차지하는 월드 길이. */
export const APERTURE_SCALE = 0.6;
/** 표시 배율 — 세기 1 이 곡선에서 차지하는 높이(월드). */
export const CURVE_HEIGHT = 2.2;
/** 스크린 상의 노출 — 세기 합에 곱하는 빛의 양. 가장 뭉친 가운데가 가득 찬 빛을 넘지 않게 잡는다. */
export const EXPOSURE = 0.6;

// ------------------------------------------------------------------------
// 배치 — 월드. 스크린 상과 곡선이 같은 가로축(각)을 나눠 쓴다.
// ------------------------------------------------------------------------

/** 스크린 상 사각형의 가로 반폭과 위 · 아래 끝. */
export const IMG_HALF_W = 8;
export const IMG_BOTTOM = 0.6;
export const IMG_TOP = 6.6;
/** 곡선의 0 기준선 높이. */
export const PROFILE_BASE = -3.8;
/** 구멍 그림의 가운데. */
export const APERTURE_X = -11.5;
export const APERTURE_Y = (IMG_BOTTOM + IMG_TOP) / 2;

/** 캡션 줄이 놓일 아래 띠(월드). 캡션 자리가 프레이밍 여백으로 잡히지 않는다 (장부 G24). */
export const CAPTION_BAND = 2.0;

/** 고정 프레이밍 — 구멍 그림부터 스크린 상 오른쪽 끝까지, 점 표식 위부터 눈금 아래 캡션 띠까지. */
export const SCENE_BOUNDS = {
  minX: APERTURE_X - 2,
  maxX: IMG_HALF_W + 0.5,
  minY: PROFILE_BASE - 0.5 - CAPTION_BAND,
  maxY: IMG_TOP + 0.8,
} as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const resolvingPowerMessages = Object.freeze({
  'label.title': { ko: '분해능', en: 'Resolving power' },
  'label.stage': { ko: '기본', en: 'Default' },
  'label.view': { ko: '기본', en: 'Default' },
  /** 도식 표식 — 구멍 지름 기호. 번역하지 않는다 (C1 판정 3). */
  'mark.diameter': { ko: 'D', en: 'D' },
  'caption.far': {
    ko: '두 점의 무늬 사이에 어두운 골이 깊다 — 두 점으로 보인다',
    en: 'A deep dark dip lies between the two patterns — two points are seen',
  },
  'caption.approach': {
    ko: '두 점이 가까워진다',
    en: 'The two points move closer',
  },
  'caption.rayleigh': {
    ko: '한쪽 봉우리가 다른 쪽의 첫 어두운 자리에 닿았다 — 골이 얕아졌지만 아직 둘이다',
    en: "Each peak now sits on the other's first dark spot — the dip is shallow, but there are still two",
  },
  'caption.approachMore': {
    ko: '두 점이 더 가까워진다',
    en: 'The two points move closer still',
  },
  'caption.merged': {
    ko: '봉우리가 첫 어두운 자리보다 안으로 들어오자 골이 사라졌다 — 하나로 뭉쳐 보인다',
    en: "With each peak inside the other's first dark spot, the dip is gone — they blur into one",
  },
  'caption.widen': {
    ko: '간격은 그대로 두고 구멍 지름을 {dSmall} mm 에서 {dLarge} mm 로 키운다',
    en: 'Keep the spacing and widen the aperture from {dSmall} mm to {dLarge} mm',
  },
  'caption.split': {
    ko: '무늬가 좁아져 봉우리가 다시 첫 어두운 자리 바깥에 섰다 — 골이 생겨 둘로 갈린다',
    en: "The patterns narrow and each peak stands outside the other's first dark spot again — a dip opens and they split in two",
  },
  'caption.reset': {
    ko: '구멍을 {dSmall} mm 로 되돌리고 두 점을 다시 벌린다',
    en: 'Return the aperture to {dSmall} mm and move the points apart again',
  },
} satisfies Record<string, LocalizedText>);

export type ResolvingPowerMessageKey = keyof typeof resolvingPowerMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: ResolvingPowerMessageKey): LocalizedText => resolvingPowerMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ResolvingPowerMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const resolvingPowerSchema: BundleSchema = {
  id: RESOLVING_POWER_ID,
  title: text('label.title'),
  category: 'optics',
  timeModel: 'periodic',

  // 조작기가 없다 — 다가가기 → 레일리 기준 → 뭉침 → 구멍 키우기가 저절로 돈다.
  parameters: [],

  stages: [
    {
      id: 'default',
      label: text('label.stage'),
      constants: {
        wavelengthNm: WAVELENGTH_NM,
        apertureSmall: APERTURE_SMALL,
        apertureLarge: APERTURE_LARGE,
        sepFar: SEP_FAR,
        sepRayleigh: SEP_RAYLEIGH,
        sepNear: SEP_NEAR,
        imageScale: IMAGE_SCALE,
        apertureScale: APERTURE_SCALE,
        curveHeight: CURVE_HEIGHT,
        exposure: EXPOSURE,
      },
    },
  ],

  environments: [],

  views: [{ id: 'main', label: text('label.view'), default: true }],

  /** 가로로 긴 그림(약 22 × 13.6). */
  canvas: { height: 440, minHeight: 380 },

  /** 곡선 위에 골 막대 · 눈금이, 구멍 빛 위에 둘레가 온다 — 쓴 순서대로 겹친다. */
  drawOrder: 'scene',

  /**
   * 한 주기 = 멀리 → 다가감 → 레일리 기준 → 더 다가감 → 뭉침 → 구멍 키우기 → 갈림 → 되돌리기.
   * 움직이는 단계는 짧게, 그 결과를 읽는 단계는 길게 둔다.
   */
  timeline: {
    phases: [
      { id: 'far', duration: 3.0, caption: key('caption.far') },
      { id: 'approach', duration: 2.4, ease: 'smooth', caption: key('caption.approach') },
      { id: 'rayleigh', duration: 3.8, caption: key('caption.rayleigh') },
      { id: 'approach-more', duration: 2.2, ease: 'smooth', caption: key('caption.approachMore') },
      { id: 'merged', duration: 3.6, caption: key('caption.merged') },
      { id: 'widen', duration: 2.6, ease: 'smooth', caption: key('caption.widen') },
      { id: 'split', duration: 3.8, caption: key('caption.split') },
      { id: 'reset', duration: 2.2, ease: 'smooth', caption: key('caption.reset') },
    ],
  },

  /** 도착한 순간 이미 두 점의 무늬가 스크린에 서 있다. */
  startAt: 1.0,

  // 슬롯 하나. 지금 화면에서 보이는 것만 말한다 — 기준의 식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-left', offset: [10, -6] },
    align: 'left',
    fontSize: 13,
    wrapWidth: 640,
    fade: 0.25,
    style: { colorRole: 'muted', emphasis: 'strong' },
    vars: { dSmall: 'dSmall', dLarge: 'dLarge' },
  },

  messages: resolvingPowerMessages,
};
