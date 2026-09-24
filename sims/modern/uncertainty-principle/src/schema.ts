// ========================================================================
// uncertainty-principle — 선언
// ========================================================================
// 질문: 입자의 위치와 운동량을 둘 다 좁게 정해 둘 수 있는가.
//
// 한 입자의 두 분포를 한 화면에 짝지어 둔다 — 위 판은 위치 분포 |ψ(x)|², 아래
// 판은 운동량 분포 |φ(p)|². 위치를 좁히면(가운데로 모으면) 같은 순간 운동량이
// 넓게 퍼진다. 오른쪽 (Δx, Δp) 평면에는 곱 ΔxΔp = ħ/2 의 곡선과 그 아래(곱이
// ħ/2 보다 작은 곳)를 빗금으로 칠한 구역이 있고, 지금 상태의 점이 곡선을 타고
// 미끄러질 뿐 빗금 안으로 들어가지 못한다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:uncertainty-principle` 와 문자 그대로 일치한다 (C4). */
export const UNCERTAINTY_PRINCIPLE_ID = 'uncertainty-principle';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/**
 * ħ 를 그림 단위로 둔 값. 위치 · 운동량 축의 단위를 정한다 — 실제 크기(10⁻³⁴ J·s)는
 * 이 조각의 주장(한쪽을 좁히면 다른 쪽이 넓어진다)과 무관해 화면에 알리지 않는다.
 */
export const HBAR = 1;
/** 위치 분포가 가장 넓을 때의 표준편차 Δx(그림 단위). */
export const SIGMA_X_WIDE = 2;
/** 위치 분포가 가장 좁을 때의 표준편차 Δx(그림 단위). 넓을 때의 1/4 이다. */
export const SIGMA_X_NARROW = 0.5;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 왼쪽에 분포 판 둘(위 · 아래), 오른쪽에 (Δx, Δp) 평면.
// ------------------------------------------------------------------------

/** 분포 판의 가로 — 두 판이 같다. 가로 0 에서 이 값까지, 가운데가 0 이다. */
export const PANEL_WIDTH = 10;
/** 위치 판 · 운동량 판의 축 높이. */
export const PANEL_X_BASE = 3.9;
export const PANEL_P_BASE = 0;
/**
 * 분포 봉우리가 가장 높을 때의 높이. 두 판의 세로 배율은 이 높이에 가장 뾰족한
 * 봉우리가 닿도록 잡는다 — 그러면 두 판의 넓이(확률 1)가 화면에서도 같다.
 */
export const PEAK_HEIGHT = 2.8;
/** 판의 가로 범위 = 가장 넓은 분포의 ±(이 배수)σ. 꼬리가 축 끝에서 바닥에 닿는다. */
export const PANEL_SPAN_SIGMAS = 3.2;

/** (Δx, Δp) 평면의 원점 · 한 변 길이(정사각형). */
export const PLANE_ORIGIN = [12.6, 0] as const;
export const PLANE_SIZE = 6.2;
/** 평면 축의 끝 = 가장 큰 Δx · Δp 의 몇 배. 점이 축 끝에 붙지 않게 여유를 둔다. */
export const PLANE_HEADROOM = 1.3;

/** 판 이름(위치 · 운동량)이 축 왼쪽 끝 위로 뜨는 높이. */
export const PANEL_NAME_DY = 0.45;
/** 빗금 구역 이름표 자리 — 평면 안, 원점 쪽(평면 좌표 비율). */
export const FORBIDDEN_LABEL_AT = [0.3, 0.2] as const;

/**
 * 프레이밍은 주장의 일부다. 가로는 판 이름표 왼쪽부터 평면 축 이름까지, 세로는
 * 위 판 봉우리 위 여유부터 아래 판 축 아래 캡션 줄까지(캡션 자리가 프레이밍에
 * 잡히지 않아 경계로 비운다 — 장부 G24). 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -0.6, maxX: 19.9, minY: -1.3, maxY: 7.1 } as const;

// ------------------------------------------------------------------------
// 시간표 길이 — 기본값. 물리는 이 상수를 보지 않고 시간표에게 묻는다.
// ------------------------------------------------------------------------

/** 위치가 넓게 퍼진 채 머무는 동안. */
export const WIDE = 2.4;
/** 위치를 좁히는 동안 · 좁힌 채 머무는 동안 · 다시 푸는 동안. */
export const SQUEEZE = 3.2;
export const NARROW = 3;
export const WIDEN = 3.2;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const uncertaintyPrincipleMessages = Object.freeze({
  'label.title': { ko: '불확정성 원리', en: 'Uncertainty principle' },
  'label.stage': { ko: '가우스 파동 묶음', en: 'Gaussian wave packet' },
  'label.view': { ko: '두 분포와 곱', en: 'Two distributions and their product' },

  /** 판 이름. 조사가 붙을 수 있는 낱말이라 문안이다 (C1 판정 4). */
  'label.position': { ko: '위치', en: 'position' },
  'label.momentum': { ko: '운동량', en: 'momentum' },
  /** 축 · 폭 기호. 표식이다 (C1 판정 3). */
  'label.x': { ko: 'x', en: 'x' },
  'label.p': { ko: 'p', en: 'p' },
  'label.dx': { ko: 'Δx', en: 'Δx' },
  'label.dp': { ko: 'Δp', en: 'Δp' },
  /** 빗금 구역 — 곱이 바닥보다 작은 곳. 수식 표식이다. */
  'label.forbidden': { ko: 'ΔxΔp < ħ/2', en: 'ΔxΔp < ħ/2' },
  'label.floor': { ko: 'ΔxΔp = ħ/2', en: 'ΔxΔp = ħ/2' },

  'caption.wide': {
    ko: '위치가 넓게 퍼진 입자 — 운동량은 좁은 범위에 모여 있다',
    en: 'A particle spread widely in position — its momentum sits in a narrow range',
  },
  'caption.squeeze': {
    ko: '위치를 좁히는 중 — 그만큼 운동량이 넓게 퍼진다',
    en: 'Squeezing the position — the momentum spreads out just as much',
  },
  'caption.narrow': {
    ko: '위치를 좁힌 만큼 운동량이 넓어졌다 — 점은 곡선을 타고 올라갔을 뿐 빗금 안으로 들어가지 못했다',
    en: 'Position narrowed, momentum widened — the dot slid along the curve but never entered the hatched zone',
  },
  'caption.widen': {
    ko: '위치를 다시 풀면 운동량이 다시 모인다 — 둘을 함께 좁히는 길은 없다',
    en: 'Let the position spread again and the momentum gathers back — there is no way to narrow both',
  },
} satisfies Record<string, LocalizedText>);

export type UncertaintyPrincipleMessageKey = keyof typeof uncertaintyPrincipleMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: UncertaintyPrincipleMessageKey): LocalizedText => uncertaintyPrincipleMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: UncertaintyPrincipleMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const uncertaintyPrincipleSchema: BundleSchema = {
  id: UNCERTAINTY_PRINCIPLE_ID,
  title: text('label.title'),
  category: 'modern',
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 위치를 좁혔다 풀기를 되풀이한다 (controllers.ts).
  parameters: [],

  stages: [
    {
      id: 'gaussian-packet',
      label: text('label.stage'),
      constants: {
        hbar: HBAR,
        sigmaXWide: SIGMA_X_WIDE,
        sigmaXNarrow: SIGMA_X_NARROW,
      },
    },
  ],

  environments: [],

  views: [{ id: 'pair', label: text('label.view'), default: true }],

  /** 판 둘을 위아래로 쌓고 오른쪽에 정사각 평면. 아래 캡션 한 줄. */
  canvas: { height: 360, minHeight: 330 },

  /** 빗금 구역 → 곡선 → 안내선 → 점 순서로 쌓는다. 점이 곡선 위에 얹혀야 한다. */
  drawOrder: 'scene',

  /**
   * 한 주기 = 넓게 머묾 → 좁힘 → 좁게 머묾 → 다시 풂. 좁힘 · 풂은 `smooth` —
   * 손으로 쥐었다 놓는 빠르기다. 두 단계의 진행도가 σx 를 정한다.
   */
  timeline: {
    phases: [
      { id: 'wide', duration: WIDE, caption: key('caption.wide') },
      { id: 'squeeze', duration: SQUEEZE, ease: 'smooth', caption: key('caption.squeeze') },
      { id: 'narrow', duration: NARROW, caption: key('caption.narrow') },
      { id: 'widen', duration: WIDEN, ease: 'smooth', caption: key('caption.widen') },
    ],
  },

  /** 도착한 순간 넓은 분포가 이미 놓여 있고, 곧 좁히기 시작한다. */
  startAt: 1.4,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — ΔxΔp ≥ ħ/2 는 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-left', offset: [16, -6] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 820,
    style: { colorRole: 'ink', emphasis: 'strong' },
    fade: 0.25,
  },

  // 그리드 · 카메라 단추 없음(기본값). 재는 것은 거리가 아니라 폭(Δx · Δp)이라
  // 치수선과 평면 위 점이 자 노릇을 한다.

  messages: uncertaintyPrincipleMessages,
};
