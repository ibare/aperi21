// ========================================================================
// conservation-of-angular-momentum — 선언
// ========================================================================
// 질문: 제자리에서 도는 사람이 팔을 오므리면 왜 빨라지는가? 아무도 더
// 돌려 주지 않았는데.
//
// 답: 돌림을 주는 것이 없으면 I·ω 가 그대로다. 질량을 축 가까이 모으면 I 가
// 줄어들고, 그 몫만큼 ω 가 커진다.
//
// 화면에서는 둘이 그 일을 한다 — 왼쪽 회전체가 **같은 시간 동안 쓸고 가는
// 부채꼴**이 넓어지고, 오른쪽 직사각형(가로 I · 세로 ω)은 가늘고 길어지면서
// 모서리가 「Iω 그대로」 곡선을 벗어나지 않는다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:conservation-of-angular-momentum` 와 문자 그대로 일치한다 (C4). */
export const CONSERVATION_OF_ANGULAR_MOMENTUM_ID = 'conservation-of-angular-momentum';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 몸통(축 둘레에 늘 있는 몫)의 관성 모멘트(kg·m²). */
export const CORE_INERTIA = 0.25;
/** 양손에 하나씩 든 질량(kg). */
export const HAND_MASS = 1;
/** 팔을 벌렸을 때 · 오므렸을 때 손이 축에서 떨어진 거리(m). */
export const REACH_OUT = 1;
export const REACH_IN = 0.35;
/** 팔을 벌리고 돌 때의 각속도(rad/s). 여기서 L = I·ω 가 정해진다. */
export const OMEGA_OUT = 0.9;
/** 부채꼴이 보여 주는 「방금 돈 각」 의 시간 폭(s). */
export const SWEEP_WINDOW = 0.4;

// ------------------------------------------------------------------------
// 배치 — 월드 1 단위 = 1 m. 원점은 회전축.
// ------------------------------------------------------------------------

/** 몸통 원판 반지름 · 손에 든 질량의 반지름(m). */
export const CORE_RADIUS = 0.13;
export const HAND_RADIUS = 0.09;
/** 방금 돈 각 부채꼴의 반지름. 고정이라 넓이가 곧 각이다. */
export const SWEEP_RADIUS = 1.22;
/** 처음 팔이 향한 각(rad). 가로로 누우면 부채꼴이 이름표 줄과 겹친다. */
export const START_ANGLE = 0.55;

/** I–ω 판의 원점(월드)과 축 배율(월드/kg·m², 월드/(rad/s)). */
export const PANEL_ORIGIN = [2.05, -1.1] as const;
export const PANEL_I_SCALE = 0.78;
export const PANEL_W_SCALE = 0.5;
/** 판의 축 길이(월드). */
export const PANEL_I_AXIS = 2.05;
export const PANEL_W_AXIS = 2.3;

/**
 * 프레이밍 — 왼쪽 회전체, 오른쪽 I–ω 판. 아래는 캡션 줄 자리.
 * 매 프레임 같은 값이다 (S-piece — 프레이밍은 주장의 일부다).
 */
export const SCENE_BOUNDS = { minX: -1.45, maxX: 4.55, minY: -1.62, maxY: 1.4 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const conservationOfAngularMomentumMessages = Object.freeze({
  'label.title': { ko: '각운동량 보존', en: 'Conservation of angular momentum' },
  'label.operation': {
    ko: '팔을 오므리면 빨라지는 이유',
    en: 'Why pulling your arms in makes you spin faster',
  },
  'label.stage': { ko: '두 손에 든 추', en: 'Weights in both hands' },
  'label.view': { ko: '위에서 본 회전', en: 'Spin seen from above' },

  /** 판의 축 이름. 기호라 번역 대상이 아니다 (C1 판정 3). */
  'axis.inertia': { ko: 'I', en: 'I' },
  'axis.omega': { ko: 'ω', en: 'ω' },
  /** 쌍곡선 이름표 — 강조색은 이 한 가지 뜻(그대로인 양)에만 쓴다. */
  'label.kept': { ko: 'Iω 그대로', en: 'Iω unchanged' },
  /** 팔을 벌렸을 때 손이 돌던 자리. */
  'label.reach': { ko: '벌린 팔', en: 'Arms out' },

  'caption.wide': {
    ko: '팔을 벌린 채 천천히 돈다. 부채꼴은 방금 0.4초 동안 돈 각이다.',
    en: 'Arms out, it turns slowly. The wedge is the angle turned in the last 0.4 s.',
  },
  'caption.pull': {
    ko: '손을 축 쪽으로 모으는 동안 회전이 빨라진다 — 아무도 더 돌려 주지 않았다.',
    en: 'As the hands come in toward the axis, the spin speeds up — nothing pushed it.',
  },
  'caption.tight': {
    ko: '같은 0.4초에 도는 각이 몇 배 넓어졌다. 오른쪽 직사각형은 가로 I 가 준 만큼 세로 ω 가 늘어 넓이가 그대로다.',
    en: 'In the same 0.4 s it now sweeps several times the angle. On the right, width I shrank as much as height ω grew — the area is unchanged.',
  },
  'caption.spread': {
    ko: '다시 벌리면 그만큼 느려진다. 직사각형의 모서리는 여전히 같은 곡선 위에 있다.',
    en: 'Spread them again and it slows by the same measure. The corner stays on the same curve.',
  },
} satisfies Record<string, LocalizedText>);

export type ConservationOfAngularMomentumMessageKey =
  keyof typeof conservationOfAngularMomentumMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: ConservationOfAngularMomentumMessageKey): LocalizedText =>
  conservationOfAngularMomentumMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ConservationOfAngularMomentumMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const conservationOfAngularMomentumSchema: BundleSchema = {
  id: CONSERVATION_OF_ANGULAR_MOMENTUM_ID,
  label: text('label.title'),
  category: 'oscillation',
  operation: text('label.operation'),
  timeModel: 'periodic',
  parameters: [],
  stages: [
    {
      id: 'hand-weights',
      label: text('label.stage'),
      constants: {
        coreInertia: CORE_INERTIA,
        handMass: HAND_MASS,
        reachOut: REACH_OUT,
        reachIn: REACH_IN,
        omegaOut: OMEGA_OUT,
        sweepWindow: SWEEP_WINDOW,
      },
    },
  ],
  environments: [],
  views: [{ id: 'top', label: text('label.view'), default: true }],

  /** 가로로 넓다 — 왼쪽 회전체, 오른쪽 판. 세로는 판의 ω 축 하나면 된다. */
  canvas: { height: 380, minHeight: 340 },

  /** 쓴 순서대로 겹친다 — 부채꼴은 팔 아래, 직사각형은 곡선 아래. */
  drawOrder: 'scene',

  /** 도착한 순간 이미 돌고 있다 (S-piece). */
  startAt: 1.2,

  /**
   * 한 주기 8.6 초.
   *
   * - `wide` — 팔을 벌린 채 천천히 돈다.
   * - `pull` — 손을 축 쪽으로 모은다. 모으는 모양은 여기 선언한 `ease` 다. 각은 지나온 시각
   *   전부에 걸친 적분이라 physics 가 이 선언에서 이징 이름을 읽어 다른 시각에도 같은 식을
   *   건다 (G59).
   * - `tight` — 오므린 채 빠르게 돈다.
   * - `spread` — 다시 벌린다. 끝나면 처음과 같은 자리라 다음 주기로 이어진다.
   */
  timeline: {
    phases: [
      { id: 'wide', duration: 2.4, caption: key('caption.wide') },
      { id: 'pull', duration: 1.6, ease: 'smooth', caption: key('caption.pull') },
      { id: 'tight', duration: 2.8, caption: key('caption.tight') },
      { id: 'spread', duration: 1.8, ease: 'smooth', caption: key('caption.spread') },
    ],
  },

  /** 슬롯 하나. 단계마다 지금 화면에서 벌어지는 일만 말한다. */
  caption: {
    anchor: { screen: 'bottom-left', offset: [18, -4] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 820,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  // 그리드 · 카메라 단추 · 제목 · 범례 없음(기본). 판은 눈금 없는 두 축뿐이다 —
  // 이 그림이 재는 것은 값이 아니라 넓이가 그대로인지다 (S-piece).

  messages: conservationOfAngularMomentumMessages,
};
