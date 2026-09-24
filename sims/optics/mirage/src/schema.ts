// ========================================================================
// mirage — 선언
// ========================================================================
// 질문: 뜨거운 길 위에 물웅덩이처럼 하늘이 비쳐 보이는 것은 어디서 온 빛인가?
//
// 답: 길 바로 위 공기는 아래로 갈수록 뜨겁고 묽어 굴절률이 조금씩 작다. 하늘의 한 점에서
// 비스듬히 내려오던 빛이 층을 지날 때마다 조금씩 눕다가 길에 닿기 전에 휘어 올라 눈에 든다.
// 눈이 들어온 방향을 곧게 거슬러 그으면 그 선은 길바닥 아래를 가리키고, 거기에 하늘 조각이 보인다.
//
// 이웃과 겹치지 않게 — `snells-law` 는 경계면 **하나**에서 매질에 따라 꺾이는 정도를,
// 여기서는 **층이 여럿 쌓인 기울기** 가 줄기를 휘게 하는 것과 그 결과 보이는 자리를 보인다.
// `apparent-depth` 는 물속 물체가 떠 보이는 것(허상이 위로), 여기서는 하늘이 아래로 보인다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:mirage` 와 문자 그대로 일치한다 (C4). */
export const MIRAGE_ID = 'mirage';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 뜨거운 층 위 찬 공기의 굴절률. */
export const N_COOL = 1.00026;
/**
 * 길 바로 위(가장 뜨거운 층)와 찬 공기의 **실제** 굴절률 차. 30 ℃ 공기와 60 ℃ 공기 사이쯤이다.
 * 이대로 그리면 줄기가 0.4° 안쪽으로만 누워 눈에 보이지 않는다.
 */
export const DELTA_N = 0.00003;
/**
 * 굴절률 차를 키우는 과장 배율. 그림 속 굴절률 차 = `DELTA_N × EXAGGERATION`.
 * 화면에 알리지 않는다 — 이유는 NOTES (b).
 */
export const EXAGGERATION = 2000;
/** 뜨거운 공기를 가르는 층 수. 층마다 굴절률이 같은 몫씩 작아진다. */
export const LAYERS = 6;
/** 뜨거운 공기층 전체의 두께(월드). */
export const HOT_DEPTH = 0.9;
/** 하늘빛이 찬 공기 속을 내려오는 각(수평에서 잰 도, 과장된 그림 속 값). */
export const DESCENT_DEG = 15.5;

// ------------------------------------------------------------------------
// 배치 — 월드 단위는 임의(길바닥이 y = 0, 위가 하늘).
// ------------------------------------------------------------------------

/** 눈의 자리. 줄기는 눈에서 거꾸로 추적한다 — 하늘 조각의 자리는 그 끝이다. */
export const EYE_X = -5.2;
export const EYE_Y = 1.3;
/** 하늘 조각의 높이(가운데). */
export const SKY_Y = 1.9;
/** 하늘 조각의 반폭 · 반높이. 땅 아래 보이는 하늘도 같은 크기다. */
export const PATCH_HALF_W = 0.5;
export const PATCH_HALF_H = 0.24;
/** 눈의 반지름. */
export const EYE_R = 0.1;
/** 층 · 길이 좌우로 뻗는 반폭 — 캔버스 끝까지. */
export const ROAD_HALF = 14;
/** 길(아스팔트) 면의 깊이. */
export const ROAD_DEPTH = 6;
/** 층 이름을 두는 오른쪽 끝 x. */
export const LAYER_LABEL_X = 6.2;

/** 프레이밍 — 고정값. 왼쪽 위는 캡션 자리 (원칙 6). */
export const SCENE_BOUNDS = { minX: -6.4, maxX: 6.6, minY: -2.25, maxY: 3.2 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const mirageMessages = Object.freeze({
  'label.title': { ko: '신기루', en: 'Mirage' },
  'label.stage': { ko: '뜨거운 길 위', en: 'Above a hot road' },
  'label.view': { ko: '옆에서 본 길', en: 'Road from the side' },

  'label.eye': { ko: '눈', en: 'Eye' },
  'label.sky': { ko: '하늘', en: 'Sky' },
  'label.seen': { ko: '하늘이 보이는 자리', en: 'Where the sky appears' },
  'label.road': { ko: '뜨거운 길', en: 'Hot road' },
  'label.cool': { ko: '찬 공기', en: 'Cool air' },
  'label.hot': { ko: '뜨겁고 묽은 공기', en: 'Hot, thin air' },

  'caption.approach': {
    ko: '하늘의 한 점에서 빛이 곧게 내려온다.',
    en: 'Light comes straight down from a point in the sky.',
  },
  'caption.layers': {
    ko: '뜨거운 길 바로 위의 공기는 길에 가까울수록 더 뜨겁고 묽다.',
    en: 'Right above the hot road, the air gets hotter and thinner the closer it is to the road.',
  },
  'caption.descend': {
    ko: '하늘의 한 점에서 비스듬히 내려오던 빛이 층을 지날 때마다 조금씩 눕는다.',
    en: 'Light slanting down from one point of the sky tilts a little flatter at every layer it crosses.',
  },
  'caption.rise': {
    ko: '빛은 길에 닿기 전에 휘어 올라 눈에 들어온다.',
    en: 'Before reaching the road the light curves back up and enters the eye.',
  },
  'caption.extend': {
    ko: '눈에 들어온 방향을 곧게 거슬러 그으면 길바닥 아래를 가리킨다.',
    en: 'Traced straight back along the direction it entered the eye, the line points below the road.',
  },
  'caption.image': {
    ko: '그 자리, 길바닥 아래에 하늘 조각이 보인다 — 길에 하늘이 비친 것처럼.',
    en: 'There, below the road surface, a patch of sky appears — as if the sky were reflected on the road.',
  },
  'caption.reset': { ko: '다시 처음으로.', en: 'Back to the start.' },
} satisfies Record<string, LocalizedText>);

export type MirageMessageKey = keyof typeof mirageMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: MirageMessageKey): LocalizedText => mirageMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: MirageMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const mirageSchema: BundleSchema = {
  id: MIRAGE_ID,
  title: text('label.title'),
  category: 'optics',
  timeModel: 'periodic',
  parameters: [],
  stages: [
    {
      id: 'hot-road',
      label: text('label.stage'),
      constants: {
        nCool: N_COOL,
        deltaN: DELTA_N,
        exaggeration: EXAGGERATION,
        layers: LAYERS,
        hotDepth: HOT_DEPTH,
        descentDeg: DESCENT_DEG,
      },
    },
  ],
  environments: [],
  views: [{ id: 'side', label: text('label.view'), default: true }],

  /** 가로로 넓다 — 왼쪽 눈, 오른쪽 하늘 조각, 그 사이 길 위로 휘는 줄기. */
  canvas: { height: 380, minHeight: 320 },

  /** 층 칠을 먼저 깔고 줄기 · 점선 · 눈을 그 위에 — scene 에 쓴 순서대로 그린다. */
  drawOrder: 'scene',

  /** 도착한 순간 층이 깔려 있고 곧 빛이 내려오기 시작한다 (S-piece). */
  startAt: 2.0,

  /**
   * 한 주기 17.4 초.
   *
   * - `layers` — 층만 깔려 있다.
   * - `approach` — 빛이 하늘에서 찬 공기 속을 곧게 내려와 층 윗면에 닿는다.
   * - `descend` — 층을 지나며 눕는다(휘어 오르는 자리까지). 이 조각의 동사라 길게 둔다.
   * - `rise` — 휘어 올라 눈에 닿는다.
   * - `arrive` — 지나온 줄기가 남아 있다.
   * - `extend` — 눈에서 들어온 방향을 곧게 거슬러 점선이 자란다.
   * - `appear` · `image` — 점선 끝, 길 아래에 하늘 조각이 떠올라(`appear`) 머문다(`image`).
   * - `reset` — 줄기 · 점선 · 보이는 하늘이 옅어진다.
   */
  timeline: {
    phases: [
      { id: 'layers', duration: 2.4, caption: key('caption.layers') },
      { id: 'approach', duration: 1.2, caption: key('caption.approach') },
      { id: 'descend', duration: 2.4, caption: key('caption.descend') },
      { id: 'rise', duration: 1.8, caption: key('caption.rise') },
      { id: 'arrive', duration: 1.4, caption: key('caption.rise') },
      { id: 'extend', duration: 2.4, ease: 'smooth', caption: key('caption.extend') },
      { id: 'appear', duration: 0.8, ease: 'smooth', caption: key('caption.image') },
      { id: 'image', duration: 3.8, caption: key('caption.image') },
      { id: 'reset', duration: 1.2, ease: 'smooth', caption: key('caption.reset') },
    ],
  },

  caption: {
    anchor: { screen: 'top-left', offset: [18, 12] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 460,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  // 그리드 · 카메라 단추 · 제목 · 범례 · 조작기 없음(기본). 재는 것은 거리가 아니라 방향이다.

  messages: mirageMessages,
};
