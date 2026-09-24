// ========================================================================
// refraction-of-waves — 선언
// ========================================================================
// 질문: 속력만 바뀌었는데 왜 **방향**이 바뀌나?
//
// 동사: **꺾인다.** 비스듬히 오는 마루는 먼저 느린 쪽에 들어간 끝부터 뒤처지고,
// 그 뒤처짐이 곧 방향이 꺾이는 것이다. 물결 장 전체가 위상 무늬로 흐르고, 마루 하나를
// 굵게 겹쳐 8 초 동안 따라간다. 느린 쪽에는 「느려지지 않았다면 있었을 마루」 를 점선으로 둔다.
//
// 굴절각 숫자 · 스넬 법칙 · 진행 방향 화살표 · 하위헌스 소파는 두지 않는다 (원본 NOTES (c)).
//
// 원본: tasks/piece-lab/refraction-of-waves/ (자유 구현)
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:refraction-of-waves` 와 문자 그대로 일치한다 (C4). */
export const REFRACTION_OF_WAVES_ID = 'refraction-of-waves';

// ------------------------------------------------------------------------
// 물리 · 배치 상수 — 원본 index.html 의 값을 그대로 둔다
// ------------------------------------------------------------------------
// 월드 단위는 원본 캔버스 px 이다. 월드 y 는 위로(`FIELD_H − 원본 py`).

/** 장 가로 · 세로(월드). 원본 캔버스 860 × 340. */
export const FIELD_W = 860;
export const FIELD_H = 340;
/** 경계의 x — 왼쪽이 빠른(깊은) 쪽, 오른쪽이 느린(얕은) 쪽. */
export const BOUNDARY_X = 400;
/** 빠른 쪽 파장(월드). */
export const LAMBDA_FAST = 60;
/** 진동 주기(초). 두 쪽이 같다. */
export const WAVE_PERIOD = 1;
/** 입사각(경계의 법선 기준, 라디안). */
export const THETA_FAST = (50 * Math.PI) / 180;
/** 경계를 따라 잰 마루 간격 — 두 쪽이 같다. */
export const CREST_SPACING = LAMBDA_FAST / Math.sin(THETA_FAST);
/** 장을 계산하는 격자 한 칸(월드). 원본의 절반 해상도 그대로. */
export const CELL = 2;

/** 느린 쪽 속력(빠른 쪽에 대한 비) 조작 범위 · 간격 · 기본값. */
export const RATIO = { min: 0.35, max: 1, step: 0.05, default: 0.55 } as const;
/** 이 비 이상이면 「꺾이지 않는다」 로 본다 — 점선 · 매질 이름 · 캡션이 함께 바뀐다. */
export const STRAIGHT_FROM = 0.98;

/**
 * 따라가는 마루 한 순환의 시간 구성(초).
 *
 * - 순환 길이 8 초 · 순환 시작의 만남점이 화면 위 2 마루 간격 — 둘 다 **주기의 정수배**라야
 *   순환이 바뀌어도 굵은 선이 무늬의 마루에서 벗어나지 않는다 (원본 NOTES (d)).
 * - 만남점이 화면 위 끝에서 아래 끝까지 가는 시간 = `FIELD_H / CREST_SPACING` 주기.
 * - 양 끝에서 0.6 초 동안 부드럽게 나타나고 사라진다.
 */
export const CYCLE_SECONDS = 8;
export const LEAD_SECONDS = 2 * WAVE_PERIOD;
export const CROSS_SECONDS = (FIELD_H / CREST_SPACING) * WAVE_PERIOD;
export const EDGE_SECONDS = 0.6;

/** 선 굵기(화면 px) · 짙기 · 글자 크기. 원본 그림 결정 그대로다. */
export const STROKE = {
  boundaryWidth: 1.5,
  boundaryOpacity: 0.55,
  ghostWidth: 2,
  ghostOpacity: 0.8,
  crestWidth: 3.5,
  labelPx: 13,
  labelOpacity: 0.72,
  /** 매질 이름의 자리 — 캔버스 가장자리에서 12 px, 위에서 글줄 가운데까지. */
  labelInsetX: 12,
  labelCenterY: 17,
  captionPx: 15,
} as const;

/**
 * 얕은 쪽 바닥빛. 원본은 물결 색은 그대로 두고 바닥빛만 조금 바꿨다 — 같은 대상은 같은 색.
 * 맞는 색 역할이 없어 옅은 면을 덮어 근사한다 (NOTES 「어휘 부족」 G08).
 */
export const SHALLOW_TINT_OPACITY = 0.2;

/** 캔버스 아래 캡션 · 조작기 줄(월드). 원본은 캔버스 밖 DOM 이었다 (G24). */
export const FOOT_ROW = 64;

/** 프레이밍 — 매 프레임 같은 값이라 카메라가 흔들리지 않는다 (원칙 6). */
export const SCENE_BOUNDS = { minX: 0, maxX: FIELD_W, minY: -FOOT_ROW, maxY: FIELD_H } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const refractionOfWavesMessages = Object.freeze({
  'label.title': { ko: '파동의 굴절', en: 'Refraction of waves' },
  'label.stage': { ko: '깊은 물과 얕은 물', en: 'Deep and shallow water' },
  'label.view': { ko: '위에서 본 물결', en: 'Waves from above' },
  'label.ratio': { ko: '느린 쪽 속력 (빠른 쪽 = 1)', en: 'slow-side speed (fast side = 1)' },
  'label.deep': { ko: '깊은 물 — 빠르다', en: 'deep water — fast' },
  'label.shallow': { ko: '얕은 물 — 느리다', en: 'shallow water — slow' },
  'label.shallowSame': { ko: '얕은 물 — 속력이 같다', en: 'shallow water — same speed' },
  'caption.approach': {
    ko: '굵게 그린 마루가 빠른 쪽에서 경계로 다가온다.',
    en: 'The thick crest approaches the boundary from the fast side.',
  },
  'caption.bend': {
    ko: '경계를 먼저 넘은 쪽 끝부터 느려져 점선보다 뒤처진다 — 마루가 경계에서 꺾인다.',
    en: 'The end that crosses first slows first and falls behind the dashed line — the crest bends at the boundary.',
  },
  'caption.passed': {
    ko: '경계를 다 넘은 마루는 꺾인 방향 그대로 느리게 나아간다.',
    en: 'Once across, the crest keeps its bent direction and moves on slowly.',
  },
  'caption.straight': {
    ko: '두 쪽 속력이 같으면 마루는 경계를 곧게 지나간다.',
    en: 'When both sides have the same speed, the crest passes the boundary straight.',
  },
} satisfies Record<string, LocalizedText>);

export type RefractionOfWavesMessageKey = keyof typeof refractionOfWavesMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로 (C1). */
export const text = (key: RefractionOfWavesMessageKey): LocalizedText => refractionOfWavesMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: RefractionOfWavesMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const refractionOfWavesSchema: BundleSchema = {
  id: REFRACTION_OF_WAVES_ID,
  title: text('label.title'),
  category: 'waves',
  timeModel: 'periodic',

  // 조작값은 슬라이더가 state 에 직접 쓴다 (controllers.ts).
  parameters: [],
  stages: [{ id: 'water', label: text('label.stage'), constants: {} }],
  environments: [],
  views: [{ id: 'surface', label: text('label.view'), default: true }],

  /** 원본은 860 × 340 캔버스 + 아래 캡션 한 줄 + 조작기 한 줄이었다. */
  canvas: { height: 400, minHeight: 340 },

  /** 장 위에 바닥빛 · 경계 · 글자 · 점선 · 굵은 마루 순으로 겹친다. 쓴 순서대로 그린다. */
  drawOrder: 'scene',

  /**
   * 원본은 시계 0 에서 열린다 — 그 순간 이미 무늬가 흐르고 굵은 마루가 막 나타난다.
   * 앞당길 것이 없어 `startAt` 은 기본값 0 이다.
   */

  /**
   * 따라가는 마루 한 순환 8 초. 단계 경계는 굵은 마루가 나타나기 끝남 · 만남점이 화면 위 끝에
   * 닿음 · 아래 끝을 빠져나감 · 사라지기 시작함이다. 원본 캡션도 만남점이 화면 위 · 안 · 아래
   * 중 어디인지로 갈렸다 — 그 경계가 곧 `bend` 단계의 두 끝이다.
   *
   * scene 은 만남점 자리를 `start('bend')` 에서, 나타남 · 사라짐을 `at('appear')` · `at('vanish')` 에서 읽는다.
   */
  timeline: {
    phases: [
      { id: 'appear', duration: EDGE_SECONDS, ease: 'smooth', caption: key('caption.approach') },
      { id: 'approach', duration: LEAD_SECONDS - EDGE_SECONDS, caption: key('caption.approach') },
      { id: 'bend', duration: CROSS_SECONDS, caption: key('caption.bend') },
      {
        id: 'pass',
        duration: CYCLE_SECONDS - LEAD_SECONDS - CROSS_SECONDS - EDGE_SECONDS,
        caption: key('caption.passed'),
      },
      { id: 'vanish', duration: EDGE_SECONDS, ease: 'smooth', caption: key('caption.passed') },
    ],
  },

  /**
   * 원본 캡션은 캔버스 아래 왼쪽 한 줄, 바로 바뀐다(페이드 없음).
   * 속력 비가 1 이면 시각과 무관하게 「곧게 지나간다」 — 조작값이라 단계로 나눌 수 없어 `cases` 로 고른다.
   */
  caption: {
    anchor: { screen: 'bottom-left', offset: [0, -30] },
    align: 'left',
    fontSize: STROKE.captionPx,
    style: { colorRole: 'ink', emphasis: 'strong' },
    fade: 0,
    cases: [{ when: 'straight', text: key('caption.straight') }],
  },

  // 그리드도 카메라 버튼도 없다 (기본값). 축 · 범례 · 각도 숫자 · 진행 방향 화살표도 두지 않는다.

  messages: refractionOfWavesMessages,
};
