// ========================================================================
// total-internal-reflection — 선언
// ========================================================================
// 질문: 임계각 바로 아래까지 멀쩡히 나가던 빛이 한순간에 꺼지는가, 그 사이에 무슨 일이 있나.
//
// 동사: 나가는 빛이 경계면에 누우며 흐려지다 사라지고, 되돌아오는 빛이 그만큼 밝아진다.
// 원본: tasks/piece-lab/total-internal-reflection.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:total-internal-reflection` 와 문자 그대로 일치한다 (C4). */
export const TOTAL_INTERNAL_REFLECTION_ID = 'total-internal-reflection';

// ------------------------------------------------------------------------
// 물리 · 배치 상수 — 원본 index.html 의 값 그대로
// ------------------------------------------------------------------------

/** 바깥 매질(공기)의 굴절률. */
export const N_AIR = 1.0;
/** 매질 버튼의 굴절률 — 물 · 유리 · 다이아몬드. 도착 순간은 물. */
export const MEDIA = { water: 1.33, glass: 1.5, diamond: 2.42 } as const;

/**
 * 자동 진행 — 임계각을 가운데에 두고 아래로 30°, 위로 20° 왕복하되 지수 1.8 로 휘어 임계각 근처에
 * 오래 머문다. 각은 2°~85° 로 자른다. 원본 `autoAngle` 의 식 그대로다.
 */
export const AUTO = { below: 30, above: 20, exponent: 1.8, minDeg: 2, maxDeg: 85 } as const;

/** 조작 — 손을 뗀 뒤 5 초가 지나면 자동 진행으로 돌아가고, 섞임은 초당 4 배 빠르기로 따라간다. */
export const MANUAL = { idleSeconds: 5, blendRate: 4, maxDeg: 85 } as const;

/** 밝기 바닥 — 몫이 있으면 아주 흐리게라도 보이도록 0.08 + 0.92·몫 (원본 `visible`). */
export const VISIBLE_FLOOR = 0.08;

/** 캡션이 「임계각에 가깝다」 로 넘어가는 거리(도). */
export const NEAR_DEG = 10;

/**
 * 원본 캔버스 — 촬영 창 폭 900 × 높이 340 px. 원본은 폭에서 장면 · 그래프 자리를 정하므로 그 폭
 * 하나로 고정해 옮긴다. **월드 단위 = 원본 px**, y 는 위(원본 y 의 부호를 뒤집는다).
 */
export const CANVAS = { width: 900, height: 340 } as const;

/** 원본 `layout()` — 장면 폭 · 경계 높이 · 입사점 · 그래프 틀. */
export const LAYOUT = {
  sceneW: Math.round(CANVAS.width * 0.56),
  by: 150,
  px: Math.round(Math.round(CANVAS.width * 0.56) * 0.5),
  gx0: Math.round(CANVAS.width * 0.56) + 56,
  gx1: CANVAS.width - 20,
  gy0: 40,
  gy1: 286,
} as const;

/** 빛 띠 — 길이 420, 폭 12. 세 겹(폭 배수 · 알파)은 가산 합성 순서 그대로. */
export const BAND = {
  length: 420,
  width: 12,
  minWidth: 0.6,
  layers: [
    { k: 3.0, alpha: 0.08 },
    { k: 1.8, alpha: 0.16 },
    { k: 1, alpha: 0.8 },
  ],
} as const;

/** 장면 부속 치수(원본 px) — 법선 위 120 · 아래 170, 임계각 점선 190, 입사각 호 44, 광원 거리 172. */
export const GUIDE = { normalUp: 120, normalDown: 170, criticalLen: 190, arcRadius: 44, sourceDist: 172 } as const;

/** 광원 — 몸통 20×22(입사점 반대쪽으로 11 밀린 중심), 발광면 14×4. */
export const LAMP = { body: [20, 22], bodyShift: 11, face: [14, 4] } as const;

/** 곡선 표본 — 0.25° 간격, 끝은 89.99°. */
export const CURVE = { stepDeg: 0.25, lastDeg: 89.99 } as const;

/** 원본 글자 자리(원본 px, 글자 윗변 기준). */
export const TEXT_AT = {
  mediumX: 14,
  airY: 12,
  waterDy: 10,
  incidentY: 40,
  criticalY: 62,
} as const;

/** 캡션 · 매질 버튼 줄(화면 px). 원본에서 캔버스 아래 한 줄이던 것. */
export const BOTTOM_BAND_PX = 64;

/** 프레이밍 — 원본 캔버스 사각형에 아래 줄을 더한 것(월드 = 원본 px, y 위). */
export const SCENE_BOUNDS = {
  minX: 0,
  maxX: CANVAS.width,
  minY: -(CANVAS.height + BOTTOM_BAND_PX),
  maxY: 0,
} as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const totalInternalReflectionMessages = Object.freeze({
  'label.title': { ko: '전반사', en: 'Total internal reflection' },
  'label.operation': { ko: '임계각과 그 조건', en: 'The critical angle and its condition' },
  'label.stage': { ko: '기본', en: 'Default' },
  'label.view': { ko: '기본', en: 'Default' },
  /** 매질 이름과 굴절률. 이름이 조사 없이 붙지만 어순이 언어마다 같지 않을 수 있어 문안으로 둔다. */
  'label.air': { ko: '공기  n = {n}', en: 'Air  n = {n}' },
  'label.water': { ko: '물  n = {n}', en: 'Water  n = {n}' },
  'label.glass': { ko: '유리  n = {n}', en: 'Glass  n = {n}' },
  'label.diamond': { ko: '다이아몬드  n = {n}', en: 'Diamond  n = {n}' },
  'label.incident': { ko: '입사각 {deg}°', en: 'Incidence {deg}°' },
  'label.critical': { ko: '임계각 {deg}°', en: 'Critical angle {deg}°' },
  /** 그래프 눈금 — 수와 단위라 두 언어가 같다 (C1 판정 3). */
  'label.deg': { ko: '{deg}°', en: '{deg}°' },
  'label.pct': { ko: '{pct}%', en: '{pct}%' },
  'label.axisX': { ko: '입사각', en: 'Angle of incidence' },
  'label.axisY': { ko: '되돌아오는 빛의 몫', en: 'Share of light returned' },
  'control.water': { ko: '물', en: 'Water' },
  'control.glass': { ko: '유리', en: 'Glass' },
  'control.diamond': { ko: '다이아몬드', en: 'Diamond' },
  'caption.far': {
    ko: '경계면에서 빛이 나뉜다 — 대부분은 공기로 나가고, 일부만 되돌아온다.',
    en: 'The light splits at the surface — most of it leaves into the air, and only a little comes back.',
  },
  'caption.near': {
    ko: '임계각에 가까울수록 나가는 빛은 경계면에 눕고 흐려지며, 그만큼 되돌아오는 빛이 밝아진다.',
    en: 'Closer to the critical angle, the outgoing light lies down along the surface and fades, and the returning light brightens by as much.',
  },
  'caption.total': {
    ko: '임계각을 넘었다 — 공기로 나가는 빛이 없고, 빛이 전부 되돌아온다.',
    en: 'Past the critical angle — no light leaves into the air, and all of it comes back.',
  },
} satisfies Record<string, LocalizedText>);

export type TotalInternalReflectionMessageKey = keyof typeof totalInternalReflectionMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 통로. */
export const text = (key: TotalInternalReflectionMessageKey): LocalizedText =>
  totalInternalReflectionMessages[key];

/** 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: TotalInternalReflectionMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const totalInternalReflectionSchema: BundleSchema = {
  id: TOTAL_INTERNAL_REFLECTION_ID,
  label: text('label.title'),
  category: 'optics',
  operation: text('label.operation'),
  timeModel: 'periodic',
  parameters: [],
  stages: [{ id: 'default', label: text('label.stage'), constants: {} }],
  environments: [],
  views: [{ id: 'default', label: text('label.view'), default: true }],

  /** 원본 캔버스 340 px 에 캡션 · 버튼 줄을 더한 높이. 마운트 뒤 바뀌지 않는다. */
  canvas: { height: CANVAS.height + BOTTOM_BAND_PX, minHeight: 360 },

  /** 겹침은 원본 그리기 순서 — 매질 · 빛 · 경계면 · 법선 · 임계각 · 입사각 · 광원 · 그래프. */
  drawOrder: 'scene',

  /**
   * 12 초 왕복. 원본 `autoAngle` 의 코사인 한 주기를 **임계각을 지나는 시각**에서 나눈 세 단계다 —
   * 아래에서 임계각으로 올라오는(approach) 3 초, 임계각 너머(beyond) 6 초, 다시 아래로 내려가는(retreat) 3 초.
   * 단계 안의 휜 모양(지수 1.8)은 이징 이름에 없어 scene 이 진행도에서 계산한다(NOTES 「어휘 부족」).
   *
   * 원본은 시계에 1.77 초를 더해 연다 — 도착 순간 입사각 36.8° 에서 커지는 중이다.
   */
  timeline: {
    phases: [
      { id: 'approach', duration: 3 },
      { id: 'beyond', duration: 6 },
      { id: 'retreat', duration: 3 },
    ],
  },
  startAt: 1.77,

  /**
   * 캡션은 **값**(지금 입사각이 임계각에서 먼가 · 10° 안인가 · 넘었나)으로 갈린다. 매질 버튼과 끌기가
   * 임계각 · 입사각을 바꾸므로 시간표 단계로 나눌 수 없다 — 판정은 `step` 이 하고 슬롯은 그 자리를 본다.
   */
  caption: {
    anchor: { screen: 'bottom-left', offset: [-8, -8] },
    align: 'left',
    fontSize: 15,
    wrapWidth: 600,
    style: { colorRole: 'ink', emphasis: 'strong' },
    cases: [
      { when: 'capTotal', text: key('caption.total') },
      { when: 'capNear', text: key('caption.near') },
      { when: 'capFar', text: key('caption.far') },
    ],
  },

  // 그리드 · 카메라 버튼 없음 (기본). 원본에 없다.

  messages: totalInternalReflectionMessages,
};
