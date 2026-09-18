// ========================================================================
// gravitational-potential-energy-general — 선언
// ========================================================================
// 질문: 무한히 먼 곳을 0 으로 두면 중력 퍼텐셜 에너지는 왜 음수이고, 그 음수가 무슨 일을 하는가.
//
// 왼쪽은 U(r) = −GM/r 우물이다. 가로 한가운데가 행성 중심, 양쪽으로 거리 r. 맨 위 가로선이 0
// (무한히 먼 곳)이고 곡선은 어디서나 그 아래에 있으며 중심으로 갈수록 깊어진다. 역학적 에너지
// E 는 가로선 하나다. 물체(공)는 지금 거리 r 의 곡선 위에 얹혀 오른쪽 벽을 오르내린다.
//
// 오른쪽은 같은 축척의 궤도 그림이다. E 선이 우물 벽과 만나는 반지름을 점선 원으로 두른다 —
// 왼쪽 두 벽 사이의 폭과 원의 지름이 같다.
//
// 샷 셋. 근점(r = 1)에서 옆으로 쏜다.
//   E₁ < 0  선이 벽에 닿는다 — 공은 벽 안쪽 한 구간만 오가고, 궤도는 점선 원 안의 타원이다
//   E₂ < 0  근점에서 더 밀어 선을 올린다 — 벽이 밖으로 물러나지만 여전히 닿아 돌아온다
//   E₃ > 0  선을 0 위로 올린다 — 벽 어디에도 닿지 않아 공은 곡선을 타고 끝까지 올라가 빠져나간다
//
// 지표 근처 mgh(`gravitational-potential-energy`) · 곧장 위로 쏘는 문턱(`escape-velocity`) ·
// 속도별 궤적 비교(`orbital-velocity`)는 이 조각의 몫이 아니다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:gravitational-potential-energy-general` 와 문자 그대로 일치한다 (C4). */
export const GRAVITATIONAL_POTENTIAL_ENERGY_GENERAL_ID = 'gravitational-potential-energy-general';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 무차원 단위: 길이는 쏘는 자리(근점)의 반지름, 에너지는 단위 질량당.
// ------------------------------------------------------------------------

/** 행성의 GM. 무차원 1 — 근점의 퍼텐셜이 U = −1 이다. */
export const GM = 1;
/** 쏘는 자리(근점)의 행성 중심으로부터 거리. */
export const LAUNCH_RADIUS = 1;
/** 행성 반지름. 근점보다 작다. */
export const PLANET_RADIUS = 0.4;
/**
 * 세 샷의 역학적 에너지(단위 질량당). 앞의 둘은 음수(묶임), 셋째는 양수(빠져나감).
 * 목록을 선언할 자리가 없어 이름 셋으로 흩는다 (장부 G105).
 */
export const ENERGY_1 = -0.4;
export const ENERGY_2 = -0.3;
export const ENERGY_3 = 0.1;

// ------------------------------------------------------------------------
// 표현 — 스테이지 상수의 기본값이다.
// ------------------------------------------------------------------------

/** 월드 길이 per 무차원 길이. 우물의 가로축과 궤도 그림이 같은 배율을 쓴다. */
export const WORLD_PER_LENGTH = 1;
/** 월드 높이 per 무차원 에너지. 우물의 세로축. */
export const WORLD_PER_ENERGY = 5.5;
/** 빠져나가는 샷에서 물체가 이 거리에 닿는 순간 = 단계 진행도 `exitAt`. 둘 다 그림 밖이다. */
export const EXIT_RADIUS = 4.6;
export const EXIT_AT = 0.75;

// ------------------------------------------------------------------------
// 배치 — 월드 단위.
// ------------------------------------------------------------------------

/** 우물의 가운데(행성 중심, r = 0)의 월드 x. */
export const WELL_X = -4.2;
/** 우물의 0 선(무한히 먼 곳)의 월드 y. */
export const ZERO_Y = 2.0;
/** 우물 판의 반폭(월드). 이 밖은 자른다. */
export const WELL_HALF = 4;
/** 우물이 잘리는 바닥(월드 y) — 곡선은 이 아래로 끝없이 깊어진다. */
export const FLOOR_Y = -3.8;

/** 궤도 그림의 행성 중심(월드). */
export const ORBIT_CENTER: readonly [number, number] = [4.6, -0.35];
/** 궤도 판의 반폭(월드). 이 밖은 자른다. */
export const ORBIT_HALF = 3.6;

/** 캡션이 서는 자리(월드). 두 판 위쪽 빈자리다. */
export const CAPTION_AT: readonly [number, number] = [-8.2, 3.9];

/**
 * 프레이밍은 주장의 일부다. 가로는 우물 판 왼쪽 끝부터 궤도 판 오른쪽 끝까지, 세로는
 * 우물 바닥부터 캡션까지. 매 프레임 같은 값이다 — 빠져나가는 물체는 판 밖에서 잘린다.
 */
export const SCENE_BOUNDS = { minX: -8.5, maxX: 8.4, minY: -4.0, maxY: 4.25 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const gravitationalPotentialEnergyGeneralMessages = Object.freeze({
  'label.title': { ko: '중력 퍼텐셜 에너지(일반)', en: 'Gravitational potential energy (general)' },
  'label.operation': { ko: '무한대를 기준으로 한 음의 에너지', en: 'A negative energy measured from infinity' },
  'label.stage': { ko: '기본', en: 'Default' },
  'label.view': { ko: '우물과 궤도', en: 'Well and orbit' },
  /** 0 선의 이름. 조사가 붙는 말이라 문안이다 (C1). */
  'label.zero': { ko: '0 · 무한히 먼 곳', en: '0 · infinitely far' },
  /** 곡선 이름 — 수식 표식이라 두 언어가 같다. */
  'label.curve': { ko: '−GM/r', en: '−GM/r' },
  /** 에너지 선 이름 — 부호 표식. 선이 0 아래인지 위인지에 따라 둘 중 하나. */
  'label.energyNegative': { ko: 'E < 0', en: 'E < 0' },
  'label.energyPositive': { ko: 'E > 0', en: 'E > 0' },
  'caption.bound': {
    ko: '에너지 선이 0 아래라 우물 벽에 닿는다 — 물체는 벽 안쪽(점선 원 안)만 오간다',
    en: 'The energy line sits below 0, so it meets the walls — the body only moves inside them (within the dashed circle)',
  },
  'caption.raise': {
    ko: '근점에서 더 세게 밀면 선이 올라가고 벽이 밖으로 물러난다',
    en: 'A harder push at the closest point lifts the line, and the walls step outward',
  },
  'caption.again': {
    ko: '더 멀리 가지만 선은 여전히 0 아래 — 벽에 막혀 다시 돌아온다',
    en: 'It goes farther, but the line is still below 0 — the walls turn it back',
  },
  'caption.cross': {
    ko: '선을 0 위로 올리면 우물 벽 어디에도 닿지 않는다',
    en: 'Lift the line above 0, and it meets the walls nowhere',
  },
  'caption.escape': {
    ko: '막아 줄 벽이 없다 — 물체는 우물을 빠져나가 돌아오지 않는다',
    en: 'No wall to stop it — the body climbs out of the well and never returns',
  },
} satisfies Record<string, LocalizedText>);

export type GravitationalPotentialEnergyGeneralMessageKey = keyof typeof gravitationalPotentialEnergyGeneralMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: GravitationalPotentialEnergyGeneralMessageKey): LocalizedText =>
  gravitationalPotentialEnergyGeneralMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: GravitationalPotentialEnergyGeneralMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const gravitationalPotentialEnergyGeneralSchema: BundleSchema = {
  id: GRAVITATIONAL_POTENTIAL_ENERGY_GENERAL_ID,
  label: text('label.title'),
  category: 'astro',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다. 선을 올려 보는 일은 세 샷의 자동 진행이 한다 — NOTES (b).
  parameters: [],

  stages: [
    {
      id: 'default',
      label: text('label.stage'),
      constants: {
        gm: GM,
        launchRadius: LAUNCH_RADIUS,
        planetRadius: PLANET_RADIUS,
        energy1: ENERGY_1,
        energy2: ENERGY_2,
        energy3: ENERGY_3,
        worldPerLength: WORLD_PER_LENGTH,
        worldPerEnergy: WORLD_PER_ENERGY,
        exitRadius: EXIT_RADIUS,
        exitAt: EXIT_AT,
      },
    },
  ],

  environments: [],

  views: [{ id: 'well', label: text('label.view'), default: true }],

  /** 두 판을 가로로 나란히 — 세로가 비싸다 (S-piece). */
  canvas: { height: 360, minHeight: 320 },

  /** 0 선 · 에너지 선 · 곡선 · 지나간 구간 · 공의 겹침 순서가 뜻을 갖는다. */
  drawOrder: 'scene',

  /**
   * 샷 셋과 그 사이의 올리기 둘.
   *
   * - `shot1` · `shot2` — 묶인 궤도 한 바퀴. 근점에서 떠나 원점을 돌아 근점으로 온다. 한 바퀴의
   *   물리 시간을 단계 길이에 맞춘다(샷마다 배율이 다르다 — NOTES (b)).
   * - `raise1` · `raise2` — 근점에 선 채 에너지 선이 다음 샷의 값으로 올라간다.
   * - `shot3` — 빠져나가는 샷. 단계 진행도 `exitAt` 에서 거리 `exitRadius`(그림 밖)에 닿는다.
   * - `hold` — 물체는 떠났고 선은 0 위에 있다.
   * - `fade` — 흐려지고 다음 주기로 넘어간다.
   */
  timeline: {
    phases: [
      { id: 'shot1', duration: 6.5, caption: key('caption.bound') },
      { id: 'raise1', duration: 1.8, ease: 'smooth', caption: key('caption.raise') },
      { id: 'shot2', duration: 7.5, caption: key('caption.again') },
      { id: 'raise2', duration: 2.2, ease: 'smooth', caption: key('caption.cross') },
      { id: 'shot3', duration: 4.5, caption: key('caption.escape') },
      { id: 'hold', duration: 1.8, caption: key('caption.escape') },
      { id: 'fade', duration: 0.6, caption: key('caption.escape') },
    ],
  },

  /** 도착한 순간 첫 샷의 물체가 이미 근점을 떠나 벽을 오르고 있다. */
  startAt: 1.2,

  // 슬롯 하나. 두 판 위 빈자리에 세운다 — 그림에 딸린 자리라 월드 앵커다.
  caption: {
    anchor: { world: CAPTION_AT },
    align: 'left',
    fontSize: 14,
    wrapWidth: 640,
    fade: 0.3,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 읽을 것은 눈금의 값이 아니라 선이 벽에 닿는지다 —
   * 격자를 깔면 「몇 칸」 을 세는 다른 읽기가 끼어든다.
   */

  messages: gravitationalPotentialEnergyGeneralMessages,
};
