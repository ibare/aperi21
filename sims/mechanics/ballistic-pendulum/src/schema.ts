// ========================================================================
// ballistic-pendulum — 선언
// ========================================================================
// 질문: 탄알이 나무토막에 박힌 다음 토막이 올라간 높이만 재면 탄알의 속도를
// 알 수 있다는데, 왜 「½mv² = (m+M)gh」 로 풀면 안 되는가?
//
// 답: 이어지는 양이 단계마다 다르다. **박히는 동안 이어지는 것은 운동량**이고
// (에너지는 대부분 열·변형으로 사라진다), **올라가는 동안 이어지는 것은
// 에너지**다 (운동량은 줄어든다).
//
// 화면에서는 두 막대가 그 일을 한다 — 박히는 동안 에너지 막대만 무너지고,
// 오르는 동안 운동량 막대만 줄어든다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:ballistic-pendulum` 와 문자 그대로 일치한다 (C4). */
export const BALLISTIC_PENDULUM_ID = 'ballistic-pendulum';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 중력 가속도(m/s²). */
export const G = 9.8;
/** 탄알 질량(kg). 칩이 바꾸는 것은 나무토막 쪽이다. */
export const BULLET_MASS = 0.2;
/** 나무토막 질량의 기본값(kg). */
export const BLOCK_MASS = 0.8;
/**
 * 고를 수 있는 나무토막 질량(kg). 남는 에너지 몫 m/(m+M) 이 0.200 · 0.125 · 0.077 로 갈린다.
 *
 * 더 무거운 토막(3.8 kg)도 해 봤지만 올라가는 높이가 화면에서 3 px 이라 「덜 올라간다」
 * 가 「움직이지 않는다」 로 읽혔다. 사라지는 몫은 막대가 말하고, 토막은 그래도 눈에
 * 보이게 올라가야 한다.
 */
export const BLOCK_MASS_OPTIONS = [0.8, 1.4, 2.4] as const;
/** 탄알 속도(m/s). 세 질량 모두 같은 탄알이 같은 속도로 온다. */
export const BULLET_SPEED = 12;
/** 매단 줄의 길이(m). 토막은 줄 두 가닥에 매달려 기울지 않고 평행하게 올라간다. */
export const STRING_LENGTH = 1;

// ------------------------------------------------------------------------
// 배치 — 월드 1 단위 = 1 m. 원점은 나무토막이 쉬는 자리(중심).
// ------------------------------------------------------------------------

/** 나무토막 반너비 · 반높이(m). */
export const BLOCK_HALF_W = 0.15;
export const BLOCK_HALF_H = 0.1;
/** 탄알 반길이 · 반높이(m). */
export const BULLET_HALF_L = 0.05;
export const BULLET_HALF_H = 0.02;
/** 탄알이 화면에 들어오는 자리(월드 x). */
export const BULLET_START_X = -1.62;
/** 탄알이 토막 안으로 파고드는 깊이(m). */
export const BULLET_DEPTH = 0.09;
/** 줄이 걸리는 천장 높이. 줄 길이 + 토막 반높이. */
export const PIVOT_Y = STRING_LENGTH + BLOCK_HALF_H;
/** 줄 두 가닥의 좌우 간격(반). */
export const HANG_HALF_W = 0.1;
/** 천장 보의 좌우 끝. */
export const BEAM_HALF_W = 0.34;

// ------------------------------------------------------------------------
// 막대 도표 — 두 양을 같은 자리에서 견준다.
// ------------------------------------------------------------------------

/** 막대 바닥(월드 y). 나무토막 아랫면과 같은 높이에 맞춘다. */
export const BAR_BASE_Y = -BLOCK_HALF_H;
/** 막대가 가득 찼을 때의 높이(m). 운동량 막대는 `p₀`, 에너지 막대는 `E₀` 가 이 높이다. */
export const BAR_FULL = 1.14;
/** 막대 반너비(m). */
export const BAR_HALF_W = 0.17;
/** 운동량 막대 · 에너지 막대의 중심 x. */
export const BAR_P_X = 1.62;
export const BAR_E_X = 2.42;
/** 막대 칸 이름표를 붙이는 최소 칸 높이(m). 이보다 얇으면 글자가 칸보다 두꺼워진다. */
export const SEGMENT_LABEL_MIN = 0.085;

/**
 * 프레이밍 — 왼쪽은 탄알이 들어오는 자리, 오른쪽은 막대와 그 이름표.
 * 매 프레임 같은 값이다 (S-piece — 프레이밍은 주장의 일부다).
 */
export const SCENE_BOUNDS = { minX: -1.86, maxX: 3.34, minY: -0.52, maxY: 1.26 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const ballisticPendulumMessages = Object.freeze({
  'label.title': { ko: '탄동 진자', en: 'Ballistic pendulum' },
  'label.operation': {
    ko: '충돌과 에너지 보존을 잇는 측정',
    en: 'The measurement that links a collision to energy conservation',
  },
  'label.stage': { ko: '매단 나무토막', en: 'Hanging block' },
  'label.view': { ko: '두 막대', en: 'Two bars' },

  /** 막대 이름. 같은 자리에 선 두 양을 가르는 것은 색이 아니라 이 이름이다. */
  'label.momentum': { ko: '운동량', en: 'Momentum' },
  'label.energy': { ko: '에너지', en: 'Energy' },
  /** 에너지 막대 안의 두 몫. 같은 색, 채움과 빗금으로 가른다. */
  'label.kinetic': { ko: '운동', en: 'Kinetic' },
  'label.potential': { ko: '위치', en: 'Potential' },
  /** 박히면서 열 · 소리 · 찌그러짐으로 나간 몫. */
  'label.lost': { ko: '사라진 몫', en: 'Lost' },
  /** 지금 단계에서 그대로인 양의 높이. 강조색은 이 한 가지 뜻에만 쓴다. */
  'label.kept': { ko: '그대로', en: 'Unchanged' },
  /** 올라간 높이. 기호라 번역 대상이 아니다 (C1 판정 3). */
  'label.height': { ko: 'h', en: 'h' },

  'control.blockMass': { ko: '나무토막', en: 'Block' },
  /** 칩 글자. 수와 단위는 표식이라 번역 대상이 아니다 (C1 판정 3). */
  'option.mass08': { ko: '0.8 kg', en: '0.8 kg' },
  'option.mass14': { ko: '1.4 kg', en: '1.4 kg' },
  'option.mass24': { ko: '2.4 kg', en: '2.4 kg' },

  'caption.fly': {
    ko: '날아오는 탄알 하나가 운동량과 에너지를 모두 가지고 있다.',
    en: 'The incoming bullet carries all of the momentum and all of the energy.',
  },
  'caption.impact': {
    ko: '박히는 동안 운동량 막대는 그대로 서 있고, 에너지 막대만 무너진다 — 사라진 몫은 열과 찌그러짐으로 나갔다.',
    en: 'While the bullet embeds, the momentum bar stays where it was and only the energy bar collapses — the lost part went into heat and deformation.',
  },
  'caption.rise': {
    ko: '올라가는 동안에는 에너지 막대의 높이가 그대로다 — 운동이 위치로 옮겨 갈 뿐이고, 줄어드는 것은 운동량 막대다.',
    en: 'While it swings up, the energy bar keeps its height — kinetic turns into potential — and now it is the momentum bar that shrinks.',
  },
  'caption.top': {
    ko: '멈춘 높이 h 는 박힌 뒤 남은 에너지만큼이다. 사라진 몫은 토막을 들어 올리지 않는다.',
    en: 'The height h where it stops matches only the energy left after the impact. The lost part never lifts the block.',
  },
} satisfies Record<string, LocalizedText>);

export type BallisticPendulumMessageKey = keyof typeof ballisticPendulumMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 통로 (C1). */
export const text = (key: BallisticPendulumMessageKey): LocalizedText =>
  ballisticPendulumMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: BallisticPendulumMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const ballisticPendulumSchema: BundleSchema = {
  id: BALLISTIC_PENDULUM_ID,
  label: text('label.title'),
  category: 'mechanics',
  operation: text('label.operation'),
  timeModel: 'periodic',
  parameters: [],
  stages: [
    {
      id: 'hanging-block',
      label: text('label.stage'),
      constants: {
        g: G,
        bulletMass: BULLET_MASS,
        bulletSpeed: BULLET_SPEED,
        stringLength: STRING_LENGTH,
      },
    },
  ],
  environments: [],
  views: [{ id: 'bars', label: text('label.view'), default: true }],

  /**
   * 가로로 넓다 — 왼쪽 진자, 오른쪽 막대 둘. 세로는 줄 길이(1 m)와 막대 높이가
   * 같은 자리를 쓰므로 더 필요하지 않다. 넘치는 세로는 그림을 작게만 만든다.
   */
  canvas: { height: 392, minHeight: 348 },

  /**
   * 쓴 순서대로 겹친다 — 탄알을 먼저, 나무토막을 나중에 그려 **박힌 부분이 토막
   * 뒤로 들어간다.** 층 순서로는 둘 다 `body` 라 순서를 고를 수 없다.
   */
  drawOrder: 'scene',

  /** 도착한 순간 이미 탄알이 날아오는 중이다 (S-piece). */
  startAt: 0.6,

  /**
   * 한 주기 9 초.
   *
   * - `fly` — 탄알이 날아온다. 두 막대가 가득 차 있다.
   * - `impact` — 박히는 동안. 실제로는 순식간이지만 이 단계가 주장의 절반이라
   *   화면에서 2 초에 걸쳐 보여 준다. 진행도가 곧 파고든 깊이다.
   * - `rise` — 매달린 채로 비스듬히 올라간다. 진행도의 사인이 각이다.
   * - `top` — 가장 높은 자리에 멈춰 선다. 이때만 높이 h 를 잰다.
   * - `fade` — 옅어지며 물러난다. 끝난 화면이 남지 않도록 다음 주기로 잇는다.
   */
  timeline: {
    phases: [
      { id: 'fly', duration: 1.4, caption: key('caption.fly') },
      { id: 'impact', duration: 2, caption: key('caption.impact') },
      { id: 'rise', duration: 2.4, ease: 'linear', caption: key('caption.rise') },
      { id: 'top', duration: 2.6, caption: key('caption.top') },
      { id: 'fade', duration: 0.6, caption: key('caption.top') },
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

  // 그리드 · 카메라 단추 · 제목 · 범례 없음(기본). 이 그림에서 재는 것은 막대
  // 둘의 높이와 그 변화이고, 거리 눈금은 오독의 경로가 된다 (S-piece).

  messages: ballisticPendulumMessages,
};
