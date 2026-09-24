// ========================================================================
// finite-well — 선언
// ========================================================================
// 질문: 우물 벽이 끝없이 높지 않으면 갇힌 입자의 파동 함수는 어떻게 달라지는가.
//
// 답: 벽 높이가 유한하면 ψ 는 벽에서 0 이 되지 못하고 벽 속으로 지수적으로 줄어드는
// 꼬리를 내린다. 꼬리만큼 ψ 가 넓게 퍼진 셈이라 파장이 길어지고, 준위는 같은 폭의
// 무한 우물보다 낮다 — 벽 꼭대기에 가까운 위 준위일수록 더 새고 더 내려앉는다.
//
// 「허용된 모양마다 준위가 벌어진다」 는 이웃 `particle-in-a-box`(무한 우물)의 몫이다.
// 여기서는 준위 사다리를 되풀이하지 않고, **한 우물의 벽이 끝없이 높은 데서 V₀ 로
// 내려오는 동안 ψ 가 벽 밖으로 새어 나가는 것** 을 보인다. 무한 우물의 준위는 점선으로
// 남겨 가라앉은 거리를 잰다.
//
// 「벽 너머에 일부가 나타난다」 는 이웃 `quantum-tunneling`(움직이는 묶음)의 몫이다 —
// 여기의 ψ 는 정상 상태라 벽 속에서 줄어들 뿐 벽 너머로 떠나지 않는다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:finite-well` 와 문자 그대로 일치한다 (C4). */
export const FINITE_WELL_ID = 'finite-well';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 월드 가로 = 위치(우물 가운데가 x = 0), 월드 세로 = 에너지(무한 우물 바닥 준위
// E₁ 단위 × `energyUnit`). 에너지는 모두 같은 폭 무한 우물의 E₁ 을 한 칸으로 센다.
// ------------------------------------------------------------------------

/** 우물 폭 L(월드). 벽은 x = ±L/2 에 선다. */
export const WELL_WIDTH = 10;
/** 벽 높이 V₀ — 무한 우물 E₁ 의 몇 배인가. 6 이면 묶인 상태가 셋이다. */
export const WALL_HEIGHT = 6;
/** 무한 우물 E₁ 한 칸의 월드 높이. */
export const ENERGY_UNIT = 1.6;
/** 보일 상태 수 — 아래에서부터 n = 1 … N. V₀ 에 묶이지 못하는 n 은 그리지 않는다. */
export const STATE_COUNT = 2;
/**
 * 준위 위에 얹는 ψ 의 높이(월드). 파동 함수의 크기는 에너지 축과 단위가 다른 그림
 * 배율이다 — 유한 우물의 두 준위 간격보다 작아야 이웃 ψ 와 겹치지 않는다.
 */
export const PSI_HEIGHT = 1.1;

// ------------------------------------------------------------------------
// 배치 — 월드 단위
// ------------------------------------------------------------------------

/**
 * 벽 몸이 우물 밖으로 뻗는 길이(월드). 꼬리가 거의 0 이 되는 자리까지 담는다 —
 * 기본값에서 ψ₂ 꼬리가 벽 끝에서 벽 면의 약 5 % 로 줄어, 그어진 꼬리가 벽 몸 안에서 끝난다.
 */
export const WALL_THICKNESS = 5;
/** 가라앉은 거리 치수선이 벽 몸 오른쪽 끝에서 떨어진 거리(월드). */
export const DROP_DIM_GAP = 1.2;
/**
 * 벽 꼭대기의 상한(월드). 벽이 끝없이 높을 때(V = ∞) 벽 몸을 여기까지 긋는다 — 고정
 * 경계 위라 화면에서는 벽이 위로 끝없이 뻗어 보인다.
 */
export const WALL_CAP = 40;

/**
 * 프레이밍 — 왼쪽은 `n = k` · `V₀` 이름표, 오른쪽은 치수선과 점선 이름표, 아래는 캡션
 * 자리, 위는 벽 꼭대기(V₀ = 6 → 9.6)와 `V₀` 글자. 매 프레임 같은 값이다 (S-piece).
 */
export const SCENE_BOUNDS = { minX: -13, maxX: 16.5, minY: -2.6, maxY: 11 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const finiteWellMessages = Object.freeze({
  'label.title': { ko: '유한 우물', en: 'Finite square well' },
  'label.stage': { ko: '벽이 낮아지는 우물', en: 'A well whose walls come down' },
  'label.view': { ko: '준위와 파동 함수', en: 'Levels and wave functions' },

  /** 준위 번호 — 기호라 두 언어가 같다(C1 표식). */
  'label.n': { ko: 'n = {n}', en: 'n = {n}' },
  /** 벽 높이 — 기호(C1 표식). */
  'label.wall': { ko: 'V₀', en: 'V₀' },
  /** 점선 — 같은 폭 무한 우물의 준위. */
  'label.infiniteLevel': { ko: '무한 우물의 준위', en: 'infinite-well level' },

  'caption.infinite': {
    ko: '벽이 끝없이 높으면 ψ 는 두 벽에서 꼭 0 이다 — 벽 속으로는 조금도 들어가지 못한다.',
    en: 'With endlessly high walls, ψ is exactly zero at both walls — it cannot enter them at all.',
  },
  'caption.lower': {
    ko: '벽이 낮아지는 중 — ψ 가 벽에서 0 이 되지 못하고 벽 속으로 꼬리를 내리며, 준위가 점선 아래로 가라앉는다.',
    en: 'The walls are coming down — ψ no longer reaches zero at the walls but trails into them, and the levels sink below the dotted lines.',
  },
  'caption.hold': {
    ko: '벽 속으로 샌 만큼 ψ 가 넓게 퍼져, 같은 폭의 무한 우물보다 준위가 낮다 — 위 준위일수록 더 새고 더 내려앉았다.',
    en: 'Leaking into the walls spreads ψ wider, so the levels sit below those of an infinite well of the same width — the higher level leaks more and sank further.',
  },
  'caption.raise': {
    ko: '벽이 다시 끝없이 높아지는 중 — 꼬리가 벽에서 거둬지고 준위가 점선으로 돌아간다.',
    en: 'The walls are rising back to endless height — the tails pull out of the walls and the levels return to the dotted lines.',
  },
} satisfies Record<string, LocalizedText>);

export type FiniteWellMessageKey = keyof typeof finiteWellMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로 (C1). */
export const text = (key: FiniteWellMessageKey): LocalizedText => finiteWellMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: FiniteWellMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const finiteWellSchema: BundleSchema = {
  id: FINITE_WELL_ID,
  title: text('label.title'),
  category: 'modern',
  timeModel: 'periodic',

  // 조작기가 없다. 독자가 해 볼 만한 것(벽 높이)은 자동 진행이 끝없는 높이에서 V₀ 까지
  // 이미 훑는다 — 슬라이더로 밀면 같은 장면을 손으로 되풀이할 뿐이다.
  parameters: [],

  stages: [
    {
      id: 'lowering-walls',
      label: text('label.stage'),
      constants: {
        wellWidth: WELL_WIDTH,
        wallHeight: WALL_HEIGHT,
        energyUnit: ENERGY_UNIT,
        stateCount: STATE_COUNT,
        psiHeight: PSI_HEIGHT,
      },
    },
  ],

  environments: [],

  views: [{ id: 'well', label: text('label.view'), default: true }],

  /** 우물 하나와 아래 캡션 한 줄 반. */
  canvas: { height: 420, minHeight: 360 },

  /** 벽 몸 · 퍼텐셜 선을 먼저, 점선 · 준위 선 · ψ 를 그 위에, 치수선 · 글자를 맨 위에. */
  drawOrder: 'scene',

  /**
   * 한 주기 13.5 초.
   *
   * - `infinite` — 벽이 끝없이 높다. ψ 는 두 벽에서 0 이고 준위는 점선(무한 우물) 위에 있다.
   * - `lower` — 벽이 V₀ 까지 내려온다(smooth). 벽 높이의 **역수** 가 진행도에 비례한다 —
   *   꼬리가 처음부터 자라기 시작하고, 벽 꼭대기는 끝 무렵에 화면 위에서 내려와 V₀ 에 앉는다.
   * - `hold` — 유한 우물. 꼬리와 가라앉은 거리(강조색 치수선)가 남는다.
   * - `raise` — 벽이 다시 끝없이 높아져(smooth) 주기 처음과 이어진다.
   */
  timeline: {
    phases: [
      { id: 'infinite', duration: 3.0, caption: key('caption.infinite') },
      { id: 'lower', duration: 4.0, ease: 'smooth', caption: key('caption.lower') },
      { id: 'hold', duration: 5.0, caption: key('caption.hold') },
      { id: 'raise', duration: 1.5, ease: 'smooth', caption: key('caption.raise') },
    ],
  },

  /** 도착한 순간 무한 우물의 ψ 둘이 이미 얹혀 있고, 1.5 초 뒤 벽이 내려오기 시작한다. */
  startAt: 1.5,

  /** 슬롯 하나. 우물 바닥 아래 왼쪽. */
  caption: {
    anchor: { screen: 'bottom-left', offset: [16, -6] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 820,
    style: { colorRole: 'ink', emphasis: 'strong' },
    fade: 0.25,
  },

  // 그리드 · 카메라 단추 · 범례 · 제목 없음(기본). 잴 것은 월드 거리가 아니라 점선에서
  // 가라앉은 거리이고, 그것은 치수선이 잰다.

  messages: finiteWellMessages,
};
