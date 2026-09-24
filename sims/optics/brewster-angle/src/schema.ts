// ========================================================================
// brewster-angle — 선언
// ========================================================================
// 질문: 유리 면에서 반사된 빛은 왜 한 방향으로만 떨리게 되는가 — 어느 각에서 그런가.
//
// 공기에서 유리(n 1.5)로 들어오는 빛은 두 떨림을 함께 가진다 — 입사면에 수직인 떨림(⊙)과
// 입사면 안의 떨림(↕). 입사각을 키우면 반사 줄기에 남는 두 몫이 서로 다르게 변하고,
// 56.3° 에서 ↕ 몫이 0 이 되어 반사 줄기에는 ⊙ 만 남는다. 그 각에서 반사 줄기와 굴절 줄기는 직각이다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// 이웃 `polarization` 은 편광판으로 빛을 거르고, `malus-law` 는 판 각과 세기를, `total-internal-reflection` 은
// 유리 안에서 나가는 빛의 몫(편광 구분 없음)을 보인다. 여기서는 **반사가 편광을 가른다** 만 본다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:brewster-angle` 와 문자 그대로 일치한다 (C4). */
export const BREWSTER_ANGLE_ID = 'brewster-angle';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 빛이 오는 쪽(공기)의 굴절률. */
export const N_AIR = 1;
/** 유리의 굴절률. */
export const N_GLASS = 1.5;
/**
 * 입사각이 멈춰 서는 자리(°) 셋 — 브루스터 각 앞 · 브루스터 각 · 뒤.
 * 가운데 값은 이 유리의 브루스터 각을 적은 정박값이다(글자로 띄운다, 장부 G143).
 * 목록을 스테이지 상수로 둘 수 없어 이름 셋으로 흩는다 (장부 G105).
 */
export const DEG = [30, 56.3, 70] as const;
/** 브루스터 각에서 반사 줄기와 굴절 줄기 사이 각(°)을 적은 정박값. */
export const RIGHT_DEG = 90;
/**
 * 반사 줄기 표식을 키우는 배율. 반사되는 진폭은 들어온 빛의 0.2 ~ 0.55 배라 그대로 두면 표식이
 * 점만 하다. 70° 에서 ⊙ 가 들어온 표식과 거의 같아지는 값이다 — 이보다 크면 반사가 들어온 빛보다
 * 세게 보인다 (NOTES (b)).
 */
export const REFLECT_GAIN = 1.8;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 왼쪽 경계면 그림 · 오른쪽 반사율-각 판.
// ------------------------------------------------------------------------

/** 들어온 · 반사 줄기 길이와 굴절 줄기 길이. 굴절 줄기는 캡션 줄에 닿지 않게 짧다. */
export const BEAM_LEN = 2.3;
export const REFRACT_LEN = 1.75;
/** 경계면 반폭 · 유리 깊이. */
export const IFACE_HALF = 2.75;
export const GLASS_DEPTH = 1.9;
/** 법선 점선의 위 · 아래 끝. */
export const NORMAL_UP = 2.15;
export const NORMAL_DOWN = 1.75;
/** 표식이 놓이는 자리 — 경계면 입사점에서 줄기 길이의 몫. 짝수 번째가 ⊙, 홀수 번째가 ↕. */
export const MARK_SPOTS = [0.42, 0.6, 0.78, 0.96] as const;
/** 들어온 빛 표식 한 벌의 크기 — ⊙ 반지름 · ↕ 반길이. 반사 · 굴절 표식은 이것에 몫을 곱한다. */
export const DOT_MARK_R = 0.19;
export const BAR_MARK_HALF = 0.4;
/** 이보다 작은 몫의 표식은 그리지 않는다 — 점만 남으면 「있다」 로 읽힌다. */
export const MARK_MIN = 0.06;
/** 들어온 줄기 방향 화살 — 줄기 끝(광원 쪽)에서 안쪽으로 나오는 길이. */
export const INCIDENT_ARROW_LEN = 0.3;
/** 입사각 부채꼴 · 각 글자 반지름, 직각 부채꼴 · 글자 반지름. */
export const INC_ARC_R = 0.42;
export const INC_LABEL_R = 0.64;
export const RIGHT_ARC_R = 0.42;
export const RIGHT_LABEL_R = 0.7;

/** 반사율-각 판 가로축이 담는 각(°) — 스치는 입사까지. */
export const PLOT_DEG_SPAN = 90;
/** 반사율-각 판 — 원점(0°, 반사 0) · 가로 90° 길이 · 세로 반사 1 높이 · 양 끝 여유. */
export const PLOT_X0 = 3.6;
export const PLOT_Y0 = -1.55;
export const PLOT_W = 4.4;
export const PLOT_H = 3.35;
export const PLOT_PAD = 0.25;
/** 세로축이 반사 1 위로 더 올라가는 몫. */
export const PLOT_TOP_OVER = 0.15;
/** 눈금선 길이(축 아래로). */
export const TICK_LEN = 0.1;
/** 곡선 표본 수. 상태로 계산하지 않는다. */
export const CURVE_SAMPLES = 90;
/** 곡선 표식(⊙ · ↕)을 다는 각(°) — 두 곡선이 벌어져 있고 지금 점이 오지 않는 자리. */
export const CURVE_LABEL_DEG = 80;

/**
 * 프레이밍 — 들어온 줄기 이름표(왼쪽)부터 판 오른쪽 θ 글자까지, 위는 30° 들어온 줄기 끝,
 * 아래는 눈금 글자 줄과 캡션 줄. 매 프레임 같은 값이다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: -3.0, maxX: 8.75, minY: -2.75, maxY: 2.55 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const brewsterAngleMessages = Object.freeze({
  'label.title': { ko: '브루스터 각', en: "Brewster's angle" },
  'label.stage': { ko: '기본', en: 'Default' },
  'label.view': { ko: '기본', en: 'Default' },
  'label.air': { ko: '공기', en: 'air' },
  'label.glass': { ko: '유리  n = {n}', en: 'glass  n = {n}' },
  'label.perp': { ko: '입사면에 수직', en: 'across the plane' },
  'label.inPlane': { ko: '입사면 안', en: 'in the plane' },
  'label.reflected': { ko: '반사', en: 'reflected' },
  'label.refracted': { ko: '굴절', en: 'refracted' },
  'label.plotTitle': { ko: '반사되는 몫', en: 'reflected share' },
  /** 표식 · 기호. 두 언어가 같다 (C1 판정 3). */
  'label.dotMark': { ko: '⊙', en: '⊙' },
  'label.barMark': { ko: '↕', en: '↕' },
  'label.deg': { ko: '{deg}°', en: '{deg}°' },
  'label.theta': { ko: 'θ', en: 'θ' },
  'caption.hold0': {
    ko: '{d0}° 로 들어온 빛 — 반사 줄기에 ⊙ 떨림과 ↕ 떨림이 둘 다 남아 있다.',
    en: 'Light arriving at {d0}° — the reflected beam still carries both the ⊙ and the ↕ vibration.',
  },
  'caption.turnUp': {
    ko: '입사각을 키운다.',
    en: 'The angle of incidence grows.',
  },
  'caption.hold1': {
    ko: '{d1}° — 반사 줄기에 ↕ 가 없고 ⊙ 만 떨린다. 반사 줄기와 굴절 줄기가 {r}° 를 이룬다.',
    en: '{d1}° — the reflected beam has no ↕ left; only ⊙ vibrates. The reflected and refracted beams stand {r}° apart.',
  },
  'caption.hold2': {
    ko: '{d2}° — 반사 줄기에 ↕ 가 다시 있고, 점선 곡선도 바닥에서 올라와 있다.',
    en: '{d2}° — ↕ is back in the reflected beam, and the dashed curve has risen off zero.',
  },
  'caption.reset': {
    ko: '입사각을 처음으로 되돌린다.',
    en: 'The angle of incidence goes back to where it started.',
  },
} satisfies Record<string, LocalizedText>);

export type BrewsterAngleMessageKey = keyof typeof brewsterAngleMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: BrewsterAngleMessageKey): LocalizedText => brewsterAngleMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: BrewsterAngleMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const brewsterAngleSchema: BundleSchema = {
  id: BREWSTER_ANGLE_ID,
  title: text('label.title'),
  category: 'optics',
  timeModel: 'periodic',

  // 조작기가 없다 — 입사각이 스스로 세 자리를 돌며 두 몫을 보인다.
  parameters: [],

  stages: [
    {
      id: 'default',
      label: text('label.stage'),
      constants: {
        nAir: N_AIR,
        nGlass: N_GLASS,
        deg0: DEG[0],
        deg1: DEG[1],
        deg2: DEG[2],
        rightDeg: RIGHT_DEG,
        reflectGain: REFLECT_GAIN,
      },
    },
  ],

  environments: [],

  views: [{ id: 'main', label: text('label.view'), default: true }],

  /** 가로로 넓고 세로로 좁은 두 칸. */
  canvas: { height: 360, minHeight: 330 },

  /** 겹침이 판정 장치다 — 매질 위에 줄기, 줄기 위에 표식, 곡선 위에 지금 점. */
  drawOrder: 'scene',

  /**
   * 한 주기 = 30° 에 머묾 → 키움 → 56.3° 에 머묾 → 키움 → 70° 에 머묾 → 되돌림.
   * 입사각은 `turn*` · `reset` 단계의 진행도로만 움직인다.
   */
  timeline: {
    phases: [
      { id: 'hold0', duration: 3.2, caption: key('caption.hold0') },
      { id: 'turn1', duration: 2.6, ease: 'smooth', caption: key('caption.turnUp') },
      { id: 'hold1', duration: 4.6, caption: key('caption.hold1') },
      { id: 'turn2', duration: 1.4, ease: 'smooth', caption: key('caption.turnUp') },
      { id: 'hold2', duration: 3.0, caption: key('caption.hold2') },
      { id: 'reset', duration: 2.0, ease: 'smooth', caption: key('caption.reset') },
    ],
  },

  /** 도착한 순간 이미 30° 로 빛이 들어와 있고 곧 입사각이 커지기 시작한다. */
  startAt: 1.2,

  // 슬롯 하나. 지금 화면에서 보이는 사실만 말한다 — 식과 법칙 문장은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-left', offset: [0, -6] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 820,
    fade: 0.25,
    style: { colorRole: 'ink', emphasis: 'strong' },
    vars: {
      d0: 'deg0',
      d1: 'deg1',
      d2: 'deg2',
      r: 'rightDeg',
    },
  },

  // 그리드 · 카메라 단추 없음(기본). 잴 것은 거리가 아니라 표식의 크기와 곡선의 높이다.

  messages: brewsterAngleMessages,
};
