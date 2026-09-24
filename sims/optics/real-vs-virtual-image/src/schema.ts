// ========================================================================
// real-vs-virtual-image — 선언
// ========================================================================
// 질문: 실상과 허상은 무엇이 다른가 — 상 자리에 스크린을 대면 무엇이 맺히는가.
//
// 답: 볼록 렌즈 앞 초점 밖(2f)의 물체 끝에서 나온 줄기는 렌즈를 지나 스크린 위 한 점에
// 실제로 모이고, 스크린에 거꾸로 선 밝은 상이 맺힌다(실상). 물체를 초점 안으로 옮기면
// 줄기는 렌즈를 지나도 벌어져 스크린에는 흐린 빛만 번진다. 벌어진 줄기를 거꾸로 이은
// 점선만 렌즈 앞 한 점에서 만나고, 거기 선 상(허상)으로는 실제 줄기가 가지 않는다.
//
// 평행광 · 초점은 `converging-diverging-lens`, 물체 자리에 따른 상 크기는 `magnification`
// 의 몫이다. 이 조각은 **실제 줄기(실선)가 모이느냐, 연장선(점선)만 만나느냐** 만 말한다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:real-vs-virtual-image` 와 문자 그대로 일치한다 (C4). */
export const REAL_VS_VIRTUAL_IMAGE_ID = 'real-vs-virtual-image';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 볼록 렌즈의 초점 거리(월드). */
export const FOCAL_LENGTH = 1.2;
/** 물체(화살표)의 높이(월드). */
export const OBJECT_HEIGHT = 0.5;
/** 실상 장면의 물체 거리(월드) — 초점 밖(2f). */
export const REAL_OBJECT_DISTANCE = 2.4;
/** 허상 장면의 물체 거리(월드) — 초점 안. */
export const VIRTUAL_OBJECT_DISTANCE = 0.7;
/**
 * 스크린의 x(월드). 실상 장면의 상 거리에 세운다 — 그 자리여야 실상이 스크린에 맺힌다.
 * 두 상수(물체 거리 · 초점 거리)와 이 값이 맞아야 한다는 관계는 NOTES (c) G143.
 */
export const SCREEN_X = 2.4;
/** 물체 끝에서 나오는 줄기 수. */
export const RAY_COUNT = 5;
/** 줄기가 렌즈에 닿는 높이의 간격(월드). 줄기 묶음은 물체 끝 높이를 가운데로 한다. */
export const RAY_SPACING = 0.25;
/** 스크린에 맺힌 실상의 빛 세기(0~1, 빛 채널). */
export const IMAGE_LIGHT = 1;
/** 허상 장면에서 스크린에 번진 빛의 세기(0~1, 빛 채널). 한 점에 모이지 않아 옅다. */
export const SMEAR_LIGHT = 0.3;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 렌즈는 x = 0, 광축은 y = 0 이다.
// ------------------------------------------------------------------------

/** 렌즈 높이(월드). 가장 높은 줄기(물체 끝 + 간격 × 2)보다 넉넉하다. */
export const LENS_SIZE = 2.5;
/** 광축 보조선의 왼쪽 · 오른쪽 끝(월드). */
export const AXIS_FROM_X = -2.75;
export const AXIS_TO_X = 2.75;
/** 스크린 판의 반너비(월드). */
export const SCREEN_HALF_WIDTH = 0.07;
/** 스크린 판의 위 · 아래 끝(월드). 실상(축 아래)과 허상 장면에서 번진 빛이 모두 판 위에 떨어진다. */
export const SCREEN_TOP = 1.1;
export const SCREEN_BOTTOM = -2.0;
/** 스크린 위 실상 화살촉의 길이(월드). */
export const IMAGE_HEAD = 0.13;
/** 스크린 위 실상 화살촉의 반너비(월드). 판 너비 안에 든다. */
export const IMAGE_HEAD_HALF_WIDTH = 0.065;
/** 초점 점의 반지름(월드). */
export const FOCUS_DOT_RADIUS = 0.045;

/**
 * 프레이밍 — 가로는 먼 물체부터 스크린 이름표까지, 세로는 렌즈 위 끝 · 스크린 이름표부터
 * 스크린 아래 끝과 캡션 한 줄까지. 매 프레임 같은 값이다 (S-piece · 원칙 6).
 */
export const SCENE_BOUNDS = { minX: -2.85, maxX: 3.25, minY: -2.5, maxY: 1.6 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const realVsVirtualImageMessages = Object.freeze({
  'label.title': { ko: '실상과 허상', en: 'Real and virtual images' },
  'label.stage': { ko: '볼록 렌즈와 스크린', en: 'A converging lens and a screen' },
  'label.view': { ko: '물체 · 렌즈 · 스크린', en: 'Object, lens, screen' },

  /** 도식 이름표. */
  'label.screen': { ko: '스크린', en: 'screen' },
  'label.real': { ko: '실상', en: 'real image' },
  'label.virtual': { ko: '허상', en: 'virtual image' },
  /** 초점 표식 — 기호라 두 언어가 같다. */
  'label.focus': { ko: 'F', en: 'F' },

  'caption.realEmit': {
    ko: '물체 끝에서 나온 빛이 볼록 렌즈를 지나 스크린으로 간다.',
    en: 'Light from the tip of the object passes through the lens toward the screen.',
  },
  'caption.real': {
    ko: '줄기가 스크린 위 한 점에 실제로 모인다 — 스크린에 거꾸로 선 밝은 상이 맺힌다.',
    en: 'The beams really meet at one point on the screen — a bright, upside-down image forms there.',
  },
  'caption.move': {
    ko: '물체를 초점 F 안쪽으로 옮긴다.',
    en: 'The object moves inside the focal point F.',
  },
  'caption.virtualEmit': {
    ko: '이번에는 렌즈를 지난 줄기가 모이지 않고 벌어진다.',
    en: 'This time the beams leaving the lens spread apart instead of meeting.',
  },
  'caption.smear': {
    ko: '스크린에는 흐린 빛만 번진다 — 맺힌 상이 없다.',
    en: 'Only a faint smear of light reaches the screen — no image forms on it.',
  },
  'caption.traceBack': {
    ko: '벌어진 줄기를 렌즈 앞쪽으로 거꾸로 이어 본다.',
    en: 'Extend the spreading beams backward, in front of the lens.',
  },
  'caption.virtual': {
    ko: '점선만 렌즈 앞 한 점에서 만나 바로 선 상이 선다 — 그 자리로 간 실제 줄기는 없다.',
    en: 'Only the dashed lines meet, in front of the lens, where an upright image stands — no actual beam goes there.',
  },
  'caption.return': {
    ko: '물체가 처음 자리로 돌아간다.',
    en: 'The object goes back to where it started.',
  },
} satisfies Record<string, LocalizedText>);

export type RealVsVirtualImageMessageKey = keyof typeof realVsVirtualImageMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: RealVsVirtualImageMessageKey): LocalizedText => realVsVirtualImageMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: RealVsVirtualImageMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const realVsVirtualImageSchema: BundleSchema = {
  id: REAL_VS_VIRTUAL_IMAGE_ID,
  title: text('label.title'),
  category: 'optics',
  timeModel: 'periodic',

  // 조작기가 없다. 물체를 초점 밖 → 안으로 옮기는 것을 자동 진행으로 보인다 (controllers.ts).
  parameters: [],

  stages: [
    {
      id: 'lens-and-screen',
      label: text('label.stage'),
      constants: {
        focalLength: FOCAL_LENGTH,
        objectHeight: OBJECT_HEIGHT,
        realObjectDistance: REAL_OBJECT_DISTANCE,
        virtualObjectDistance: VIRTUAL_OBJECT_DISTANCE,
        screenX: SCREEN_X,
        rayCount: RAY_COUNT,
        raySpacing: RAY_SPACING,
        imageLight: IMAGE_LIGHT,
        smearLight: SMEAR_LIGHT,
      },
    },
  ],

  environments: [],

  views: [{ id: 'object-lens-screen', label: text('label.view'), default: true }],

  /** 가로로 넓은 한 줄 그림 — 물체 · 렌즈 · 스크린이 광축 하나에 늘어선다. */
  canvas: { height: 420, minHeight: 360 },

  /**
   * 축 → 스크린 판 → 스크린 위 빛 → 렌즈 → 줄기 → 점선 → 화살표 → 글자 순. plugin 어휘(`ray` ·
   * `opticalElement`)가 층에서 어디 끼는지에 기대지 않게 scene 순서로 고정한다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = [실상] 줄기가 스크린으로 → 맺힘 → 멈춤 → 빠져나감, 물체를 초점 안으로,
   * [허상] 줄기가 벌어져 스크린으로 → 번짐 → 멈춤 → 거꾸로 잇기 → 허상 → 멈춤 → 빠져나감, 되돌아감.
   *
   * 줄기 앞머리 · 꼬리의 x 는 `*-emit` · `*-drain` 진행도로, 물체 자리는 `move` · `return`
   * 진행도로, 스크린 위 빛 · 점선 · 허상의 짙기는 `real-form` · `smear` · `trace-back` ·
   * `virtual-mark` 와 `*-drain` 진행도로 읽는다(`physics.ts`).
   */
  timeline: {
    phases: [
      { id: 'real-emit', duration: 1.6, caption: key('caption.realEmit') },
      { id: 'real-form', duration: 0.5, ease: 'smooth', caption: key('caption.real') },
      { id: 'real-hold', duration: 2.8, caption: key('caption.real') },
      { id: 'real-drain', duration: 1.0, caption: key('caption.real') },
      { id: 'move', duration: 1.6, ease: 'smooth', caption: key('caption.move') },
      { id: 'virtual-emit', duration: 1.6, caption: key('caption.virtualEmit') },
      { id: 'smear', duration: 0.5, ease: 'smooth', caption: key('caption.smear') },
      { id: 'smear-hold', duration: 2.4, caption: key('caption.smear') },
      { id: 'trace-back', duration: 1.6, ease: 'smooth', caption: key('caption.traceBack') },
      { id: 'virtual-mark', duration: 0.5, ease: 'smooth', caption: key('caption.virtual') },
      { id: 'virtual-hold', duration: 3.0, caption: key('caption.virtual') },
      { id: 'virtual-drain', duration: 1.0, caption: key('caption.virtual') },
      { id: 'return', duration: 1.4, ease: 'smooth', caption: key('caption.return') },
    ],
  },

  /** 도착한 순간 줄기가 스크린에 모여 있고 밝은 실상이 맺혀 있다 — 실상 멈춤 안에서 연다 (S-piece). */
  startAt: 2.9,

  /** 슬롯 하나. 그림 아래 가운데 한 줄. */
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -6] },
    align: 'center',
    fontSize: 14,
    wrapWidth: 820,
    style: { colorRole: 'ink', emphasis: 'strong' },
    fade: 0.25,
  },

  // 그리드 · 카메라 단추 · 범례 · 제목 없음(기본). 잴 것이 없다 — 줄기가 스크린에서 모이느냐,
  // 점선만 렌즈 앞에서 만나느냐가 주장이다.

  messages: realVsVirtualImageMessages,
};
