// ========================================================================
// laminar-vs-turbulent — 선언
// ========================================================================
// 질문: 흐름은 왜 서서히가 아니라 어느 순간 갑자기 흐트러지는가.
//
// "흐트러진다" 를 상태 전환이 아니라 **증폭**으로 옮긴다. 주사기 바늘이 늘
// 똑같은 크기의 미세한 흔들림을 넣고, 그 흔들림이 하류로 가면서 지수적으로
// 커지거나 사라진다. 성장률 σ 의 부호를 정하는 것은 오직 Re 다.
//
//   σ(Re) = k · (Re / 2300 − 1)
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:laminar-vs-turbulent` 와 문자 그대로 일치한다 (C4). */
export const LAMINAR_VS_TURBULENT_ID = 'laminar-vs-turbulent';

/** 물의 동점성 (m²/s). */
export const NU = 1.004e-6;
/** 임계 레이놀즈 수. 이 조각의 핵심 숫자는 하나뿐이다. */
export const RE_CRITICAL = 2300;
/** 관 지름 (m). Re = vD/ν. */
export const PIPE_DIAMETER = 0.02;
/** 성장률 계수. */
export const GROWTH_K = 30.8;

/**
 * 시퀀스가 훑는 유속 (m/s).
 *
 * 여섯 값을 훑고 나서 다시 첫 값으로 **내려온다** — 흐트러짐이 시간이나 이력의
 * 문제가 아니라 그 수의 문제임을 보이려고.
 */
export const SPEED_STOPS: readonly number[] = [0.05, 0.1, 0.1155, 0.15, 0.2, 0.25];
/** 한 값에 머무는 시간과 다음 값으로 건너가는 시간(초). */
export const STOP_HOLD = 3.4;
export const STOP_RAMP = 1.1;

/**
 * 화면 좌표계. **관 길이를 몇 미터라고 주장하지 않는다** — 표에 없는 값이다.
 * 지킨 것은 화면 속도가 실제 v 에 비례한다는 것까지다.
 */
export const PIPE = { x0: 0, length: 1, halfWidth: 0.055, centerY: 0.22 } as const;
/** 유속(m/s) → 화면 속도(월드/초). */
export const SPEED_SCALE = 3.18;
/** 주입부가 관 앞머리에서 들어간 거리(월드). */
export const INJECT_X = 0.08;

/** Re 눈금 — 좌표계가 아니라 이 질문의 논거다. */
/**
 * 관에서 관 높이의 1.5 배쯤 떨어뜨린다. 더 멀면 세로를 잡아먹어 관이 작아지고,
 * 관이 작아지면 실이 접히는 것이 안 보인다.
 */
export const RE_TRACK = { y: 0.05, x0: 0.04, length: 0.92 } as const;
export const RE_RANGE: readonly [number, number] = [700, 5200];

export const SCENE_BOUNDS = { minX: -0.02, maxX: 1.02, minY: 0.0, maxY: 0.31 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const laminarVsTurbulentMessages = Object.freeze({
  'label.title': { ko: '층류와 난류', en: 'Laminar and turbulent flow' },
  'label.operation': {
    ko: '흐름이 갑자기 흐트러지는 지점',
    en: 'Where flow suddenly breaks up',
  },
  'label.stage': { ko: '관', en: 'Pipe' },
  'label.view': { ko: '염료', en: 'Dye' },
  'caption.damping': {
    ko: '넣어준 흔들림이 아래로 가면서 잦아든다',
    en: 'The disturbance fades as it travels downstream',
  },
  'caption.neutral': {
    ko: '줄지도, 커지지도 않는다',
    en: 'It neither shrinks nor grows',
  },
  'caption.growing': {
    ko: '이번엔 스스로 커진다',
    en: 'This time it grows on its own',
  },
  'caption.upstream': {
    ko: '흐트러지는 자리가 입구 쪽으로 밀려 올라온다',
    en: 'The break-up point creeps toward the inlet',
  },
} satisfies Record<string, LocalizedText>);

export type LaminarMessageKey = keyof typeof laminarVsTurbulentMessages;

export function text(key: LaminarMessageKey): LocalizedText {
  return laminarVsTurbulentMessages[key];
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const laminarVsTurbulentSchema: BundleSchema = {
  id: LAMINAR_VS_TURBULENT_ID,
  label: text('label.title'),
  category: 'fluids',
  operation: text('label.operation'),
  timeModel: 'linear',

  // 자동 진행이 본체다. 아무것도 누르지 않아도 화면이 할 말을 마친다.
  parameters: [],

  stages: [
    {
      id: 'pipe',
      label: text('label.stage'),
      constants: { nu: NU, reCritical: RE_CRITICAL, diameter: PIPE_DIAMETER },
    },
  ],

  environments: [],
  views: [{ id: 'dye', label: text('label.view'), default: true }],

  autoViews: { energy: false },
  /**
   * 가로로 긴 관이 필수다. 성장이 **하류로 진행되는 것**을 보여야 하기 때문에
   * 정사각형 무대에서는 이 그림이 성립하지 않는다.
   */
  canvas: { height: 300, minHeight: 260 },

  messages: laminarVsTurbulentMessages,
};
