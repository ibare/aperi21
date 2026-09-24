// ========================================================================
// coupled-oscillators — 선언
// ========================================================================
// 질문: 같은 진자 둘을 약한 용수철로 이어 놓고 한쪽만 흔들면 어떻게 되는가.
//
// 답: 흔들림이 용수철을 타고 옆 진자로 조금씩 넘어가 **통째로** 옮겨 간다.
// 흔들던 쪽은 멎는다. 그리고 같은 길로 되돌아온다. 그동안 두 진자가 가진
// 에너지의 합은 그대로다 — 오가는 것은 몫뿐이다.
//
// 이웃 조각과 겹치지 않게 머무는 자리:
// - `normal-modes` — 계 전체가 한 진동수로 함께 흔들리는 **모양**. 여기서는 모드로
//   나누지 않는다. 보이는 것은 한 진자에서 다른 진자로 옮겨 가는 흔들림이다.
// - `beats-in-oscillation` — 가까운 두 진동수의 **합** 파형. 여기서는 파형을 그리지
//   않는다. 흔들림의 폭은 추 아래 호로, 몫은 막대로 본다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:coupled-oscillators` 와 문자 그대로 일치한다 (C4). */
export const COUPLED_OSCILLATORS_ID = 'coupled-oscillators';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 중력 가속도(m/s²). */
export const G = 9.8;
/** 진자 길이(m). 두 진자가 같다 — 같아야 통째로 옮겨 간다. 한 번 흔들림 약 1.2 초. */
export const PENDULUM_LENGTH = 0.36;
/**
 * 결합의 세기 k/m (s⁻²). 진자 제 복원(g/L ≈ 27)의 약 1/10 — **약한** 결합이라
 * 한 번 옮겨 가는 데 다섯 번쯤 흔들린다. 세게 이으면 넘어가는 것이 한두 번
 * 흔들림 안에 끝나 「옮겨 간다」 가 아니라 「같이 흔들린다」 로 보인다.
 */
export const COUPLING = 2.87;
/** 처음 흔들어 놓은 폭(rad). 작은 각이라 선형 근사가 선다. */
export const AMPLITUDE = 0.36;

/**
 * 흔들림이 한쪽에서 다른 쪽으로 통째로 넘어가는 데 걸리는 시간(초) — 맥놀이 주기의 반.
 * 위 상수의 기본값에서 계산한다. 시간표 두 단계의 길이가 이것이다.
 */
export function halfTransfer(g: number, length: number, coupling: number): number {
  const w1 = Math.sqrt(g / length);
  const w2 = Math.sqrt(w1 * w1 + 2 * coupling);
  return Math.PI / (w2 - w1);
}
const HALF_TRANSFER = halfTransfer(G, PENDULUM_LENGTH, COUPLING);

// ------------------------------------------------------------------------
// 배치 — 월드 1 단위 = 1 m. 원점은 두 매단 점 사이 가운데(천장 높이).
// ------------------------------------------------------------------------

/** 두 매단 점의 좌우 자리(반 간격). */
export const PIVOT_HALF_GAP = 0.34;
/** 천장 보의 좌우 끝. */
export const BEAM_HALF_W = 0.54;
/** 추 반지름(m). */
export const BOB_RADIUS = 0.026;
/** 흔들림 폭 호를 추의 길에서 바깥으로 띄우는 거리(m). 추가 호를 덮지 않게. */
export const ARC_GAP = 0.055;
/** 에너지 막대 — 바닥 y · 두께 · 반너비(m). */
export const BAR_Y = -0.52;
export const BAR_H = 0.045;
export const BAR_HALF_W = 0.54;

/**
 * 프레이밍 — 가운데 두 진자와 그 아래 막대, 맨 아래 캡션 자리.
 * 매 프레임 같은 값이다 (S-piece — 프레이밍은 주장의 일부다).
 */
export const SCENE_BOUNDS = { minX: -0.8, maxX: 0.8, minY: -0.68, maxY: 0.03 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const coupledOscillatorsMessages = Object.freeze({
  'label.title': { ko: '결합 진동자', en: 'Coupled oscillators' },
  'label.stage': { ko: '약한 용수철로 이은 두 진자', en: 'Two pendulums joined by a weak spring' },
  'label.view': { ko: '흔들림의 폭', en: 'Swing width' },

  /** 막대 이름. 막대 하나가 두 진자의 몫으로 나뉜다. */
  'label.energy': { ko: '에너지', en: 'Energy' },

  'caption.give': {
    ko: '왼쪽 진자만 흔들어 놓았다. 그 흔들림이 용수철을 타고 오른쪽 진자로 조금씩 넘어가, 마침내 통째로 옮겨 간다.',
    en: 'Only the left pendulum was set swinging. Its swing leaks across the spring into the right one, until all of it has moved over.',
  },
  'caption.return': {
    ko: '오른쪽으로 다 넘어간 흔들림이 같은 길로 다시 왼쪽으로 되돌아온다. 오가는 것은 몫뿐이고, 아래 막대의 길이는 내내 그대로다.',
    en: 'The swing that moved over to the right flows back to the left the same way. Only the shares move; the bar below never changes length.',
  },
} satisfies Record<string, LocalizedText>);

export type CoupledOscillatorsMessageKey = keyof typeof coupledOscillatorsMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: CoupledOscillatorsMessageKey): LocalizedText => coupledOscillatorsMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: CoupledOscillatorsMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const coupledOscillatorsSchema: BundleSchema = {
  id: COUPLED_OSCILLATORS_ID,
  title: text('label.title'),
  category: 'oscillation',
  timeModel: 'periodic',
  parameters: [],
  stages: [
    {
      id: 'two-pendulums',
      label: text('label.stage'),
      constants: {
        g: G,
        length: PENDULUM_LENGTH,
        coupling: COUPLING,
        amplitude: AMPLITUDE,
      },
    },
  ],
  environments: [],
  views: [{ id: 'swing', label: text('label.view'), default: true }],

  /** 가로로 넓다 — 두 진자는 가운데, 세로는 줄 길이 + 막대 + 캡션 두 줄. */
  canvas: { height: 360, minHeight: 320 },

  /**
   * 쓴 순서대로 겹친다 — 폭 호 · 줄 · 용수철을 먼저, 추를 나중에. 용수철 끝이 추
   * 뒤로 들어가야 「추에 매였다」 로 읽힌다. 층 순서로는 `constraint` 가 `body` 와
   * 어떻게 겹칠지 고를 수 없다.
   */
  drawOrder: 'scene',

  /** 도착한 순간 왼쪽 진자는 이미 흔들리는 중이다 (S-piece). */
  startAt: 0.3,

  /**
   * 한 주기 = 맥놀이 한 번(약 12 초). 두 단계가 반씩이다.
   *
   * - `give` — 왼쪽의 흔들림이 오른쪽으로 넘어간다. 끝에서 왼쪽이 멎는다.
   * - `return` — 같은 길로 되돌아온다. 끝에서 오른쪽이 멎고 처음 화면이 된다.
   *
   * 길이는 스테이지 상수의 기본값에서 계산한 반 맥놀이 주기다. 상수를 바꾸면 이
   * 길이도 함께 바꿔야 캡션이 운동과 맞는다 (NOTES 「어휘 부족」).
   */
  timeline: {
    phases: [
      { id: 'give', duration: HALF_TRANSFER, caption: key('caption.give') },
      { id: 'return', duration: HALF_TRANSFER, caption: key('caption.return') },
    ],
  },

  /** 슬롯 하나. 단계마다 지금 화면에서 벌어지는 일만 말한다. */
  caption: {
    anchor: { screen: 'bottom-left', offset: [18, -4] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 820,
    fade: 0.4,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  // 그리드 · 카메라 단추 · 제목 · 범례 없음(기본). 이 그림에서 보는 것은 흔들림의
  // 폭과 몫이고, 거리 눈금은 오독의 경로가 된다 (S-piece).

  messages: coupledOscillatorsMessages,
};
