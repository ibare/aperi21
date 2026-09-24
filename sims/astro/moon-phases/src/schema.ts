// ========================================================================
// moon-phases — 선언
// ========================================================================
// 질문: 햇빛은 언제나 달의 절반을 비추는데, 왜 모양이 바뀌어 보이는가.
//
// 햇빛 받는 반쪽은 늘 태양 쪽 그대로이고, 달이 돌면서 지구를 향한 반쪽이 돌아가
// 두 반쪽이 겹친 만큼만 밝게 보인다.
//
// 원본: tasks/piece-lab/moon-phases. 상수와 배치는 원본 index.html 에서 그대로 옮겼다.
// 월드 좌표 = 원본 캔버스 px, 다만 y 를 위로 뒤집었다 (월드 y = 340 − 원본 y).
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:moon-phases` 와 문자 그대로 일치한다 (C4). */
export const MOON_PHASES_ID = 'moon-phases';

// ------------------------------------------------------------------------
// 배치 — 원본 캔버스 840 × 340 (월드 단위 = 원본 px, y 위)
// ------------------------------------------------------------------------

export const CANVAS_W = 840;
export const CANVAS_H = 340;

/** 원본 화면 y(아래로) → 월드 y(위로). */
export const flipY = (y: number): number => CANVAS_H - y;

/** 왼쪽 칸 — 궤도 중심이 지구. 원본 (235, 172), 반지름 104. */
export const ORBIT = { cx: 235, cy: flipY(172), R: 104 } as const;
export const MOON_R = 24;
export const EARTH_R = 13;
/** 궤도 위 여덟 자리의 달 반지름과 불투명도(원본 globalAlpha). */
export const GHOST_R = 8;
export const GHOST_OPACITY = 0.45;

/** 오른쪽 칸 — 지구에서 본 달 원판. 원본 (640, 168), 반지름 112. */
export const VIEW = { cx: 640, cy: flipY(168), R: 112 } as const;
/** 원판 격자 한 변의 칸 수. 원본은 200 화소 오프스크린. */
export const DISC_CELLS = 200;

/** 강조색 호 · 고리가 달 테두리에서 떨어진 거리(월드). */
export const ARC_GAP = 3;
export const RING_GAP = 4;
/** 시선 점선이 지구 · 달 테두리에서 떨어진 거리. */
export const SIGHT_GAP = { earth: 3, moon: 6 } as const;

/** 햇빛 줄무늬 — 18 간격 줄, 46 간격 22 길이 획, 줄마다 23 엇갈림, 초당 70 흐름. */
export const RAYS = {
  yFrom: 30,
  yTo: 312,
  rowStep: 18,
  dash: 22,
  pitch: 46,
  stagger: 23,
  speed: 70,
  xStart: 470 + 46,
  xMin: 8,
  xMax: 460,
} as const;

/** 한 바퀴(초). */
export const PERIOD = 16;
/** 원본의 시작 각(라디안) — 초승달 무렵, 이미 진행 중. `startAt` 으로 옮긴다. */
export const THETA0 = 0.6;
/** 캡션을 가르는 밝은 면적 비율 경계 (원본 0.03 / 0.97). */
export const OVERLAP_EDGE = { none: 0.03, full: 0.97 } as const;

/**
 * 고정 경계. 원본 캔버스 + 아래 캡션 두 줄 자리. 원본 캡션은 캔버스 밖 DOM 이라
 * 엔진 캡션 슬롯이 그림을 덮지 않게 세로를 아래로 늘렸다.
 */
export const SCENE_BOUNDS = { minX: 0, maxX: CANVAS_W, minY: -62, maxY: CANVAS_H } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const moonPhasesMessages = Object.freeze({
  'label.title': { ko: '달의 위상', en: 'Phases of the Moon' },
  'label.operation': {
    ko: '햇빛을 받는 달의 어느 쪽을 보는가',
    en: 'Which part of the sunlit Moon faces us',
  },
  'label.stage': { ko: '지구와 달', en: 'Earth and Moon' },
  'label.view': { ko: '두 시점', en: 'Two views' },
  'label.sunlight': { ko: '← 태양에서 오는 햇빛', en: '← Sunlight from the Sun' },
  'label.topView': { ko: '북쪽 위에서 내려다본 지구와 달', en: 'Earth and Moon seen from above the north' },
  'label.earthView': { ko: '지구에서 올려다본 달', en: 'The Moon seen from Earth' },
  'caption.none': {
    ko: '햇빛 받는 반쪽은 늘 태양 쪽을 향한 채 그대로이고, 달이 돌면서 지구를 향한 반쪽이 돌아간다. 지금은 두 반쪽이 거의 겹치지 않아, 지구에서는 그늘 쪽만 보인다.',
    en: 'The sunlit half always faces the Sun and stays put, while the half facing Earth turns as the Moon orbits. Right now the two halves barely overlap, so from Earth we see only the shaded side.',
  },
  'caption.full': {
    ko: '햇빛 받는 반쪽은 늘 태양 쪽을 향한 채 그대로이고, 달이 돌면서 지구를 향한 반쪽이 돌아간다. 지금은 두 반쪽이 거의 포개져, 지구에서는 햇빛 받는 쪽만 보인다.',
    en: 'The sunlit half always faces the Sun and stays put, while the half facing Earth turns as the Moon orbits. Right now the two halves almost coincide, so from Earth we see only the sunlit side.',
  },
  'caption.partial': {
    ko: '햇빛 받는 반쪽은 늘 태양 쪽을 향한 채 그대로이고, 달이 돌면서 지구를 향한 반쪽이 돌아간다. 지금은 두 반쪽이 일부만 겹쳐, 겹친 만큼만 밝게 보인다.',
    en: 'The sunlit half always faces the Sun and stays put, while the half facing Earth turns as the Moon orbits. Right now the two halves partly overlap, and only the overlap looks bright.',
  },
} satisfies Record<string, LocalizedText>);

export type MoonPhasesMessageKey = keyof typeof moonPhasesMessages;

export const text = (key: MoonPhasesMessageKey): LocalizedText => moonPhasesMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: MoonPhasesMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const moonPhasesSchema: BundleSchema = {
  id: MOON_PHASES_ID,
  label: text('label.title'),
  category: 'astro',
  operation: text('label.operation'),
  timeModel: 'periodic',
  parameters: [],
  stages: [{ id: 'earth-moon', label: text('label.stage'), constants: {} }],
  environments: [],
  views: [{ id: 'two-views', label: text('label.view'), default: true }],

  /** 원본 캔버스 840 × 340 + 캡션 두 줄. */
  canvas: { height: 420, minHeight: 380 },

  /** 겹침 순서가 원본 그대로여야 한다 — 햇빛 · 궤도 · 여덟 달 · 지구 · 시선 · 달 · 강조 호 · 원판 · 고리 · 이름. */
  drawOrder: 'scene',

  /**
   * 한 바퀴 16 초, 고르게 돈다. 단계는 하나다 — 원본에 단계 경계가 없다.
   * 캡션은 시각이 아니라 겹침 정도로 갈리므로 단계에 두지 않고 `caption.cases` 로 고른다.
   */
  timeline: {
    phases: [{ id: 'orbit', duration: PERIOD, ease: 'linear' }],
  },

  /** 원본은 θ₀ = 0.6 rad 에서 연다 — 초승달 무렵, 이미 진행 중. 같은 만큼 시계를 앞당긴다. */
  startAt: THETA0 / ((2 * Math.PI) / PERIOD),

  caption: {
    anchor: { screen: 'bottom-left', offset: [16, -8] },
    align: 'left',
    fontSize: 15,
    style: { colorRole: 'ink', emphasis: 'medium' },
    wrapWidth: CANVAS_W - 32,
    cases: [
      { when: 'noOverlap', text: key('caption.none') },
      { when: 'fullOverlap', text: key('caption.full') },
    ],
    text: key('caption.partial'),
  },

  // 그리드 · 카메라 버튼 없음 (원본에 없다).

  messages: moonPhasesMessages,
};
