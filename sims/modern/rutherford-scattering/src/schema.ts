// ========================================================================
// rutherford-scattering — 선언
// ========================================================================
// 질문: 금박에 알파 입자를 쏘면 어떻게 되는가 — 원자의 양전하는 어디에 있는가.
//
// 알파 입자 대부분은 금 원자핵 곁을 거의 꺾이지 않고 지나간다. 핵에 아주 가까이 다가간
// 드문 입자만 크게 꺾여, 90° 를 넘겨 왔던 쪽으로 되튄다. 그렇게 세게 밀어낼 양전하가
// 아주 작은 자리(핵)에 모여 있다는 뜻이다.
//
// 입자 하나의 길은 쿨롱 척력의 쌍곡선이다. 충돌 변수 b(비껴 지나는 거리)가 작을수록 크게
// 꺾인다 — b = (d₀/2)·cot(θ/2), d₀ 는 정면으로 왔을 때 가장 가까이 가는 거리.
//
// 이웃과 겹치지 않는 자리 — `bohr-model` 은 핵을 돈다는 전자의 궤도와 도약이다. 이 조각은
// 원자 **바깥에서 쏘아 넣은** 입자가 핵 곁을 지나며 꺾이는 길과, 나간 방향의 분포다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:rutherford-scattering` 와 문자 그대로 일치한다 (C4). */
export const RUTHERFORD_SCATTERING_ID = 'rutherford-scattering';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 충돌 변수 · 쏘는 순서를 뽑는 시드. 주기마다 (시드, 주기 번호)로 새로 뽑는다. */
export const SEED = 7;

/**
 * 한 주기에 쏘는 알파 입자 수. **홀수**여야 한다 — 충돌 변수를 빔 폭에 고르게 나눈 칸마다
 * 하나씩 뽑는데(층화 표본), 홀수이면 가운데 칸이 b = 0 을 덮어 한 주기에 하나는 핵에 아주
 * 가깝게 다가간다 (NOTES (b)).
 */
export const PARTICLE_COUNT = 31;

/**
 * 빔 반폭(월드 단위) — 충돌 변수 b 가 뽑히는 범위 [−이 값, 이 값]. 금 원자 하나의 반지름을
 * 이 길이로 그린다고 본다.
 */
export const BEAM_HALF_WIDTH = 1.2;

/**
 * 정면으로 온 5 MeV 알파 입자가 금 원자핵(+79e)에 가장 가까이 가는 거리(fm).
 * d₀ = 2·79·1.44 MeV·fm / 5 MeV ≈ 45.5 fm.
 */
export const CLOSEST_APPROACH_FM = 45.5;

/** 금 원자 반지름(fm) — 144 pm. 빔 반폭이 이 길이를 나타낸다. */
export const ATOM_RADIUS_FM = 144000;

/**
 * 표적 배율 — 핵이 밀어내는 거리 d₀ 를 원자 크기에 견줘 몇 배 키워 그리는가.
 * 실제 비(45.5 fm / 144 pm ≈ 1/3200)대로면 월드 d₀ 가 0.0004 라 한 주기 31 개 중 크게 꺾이는
 * 것이 거의 나오지 않는다. 드묾을 한 주기 안에 보이려고 키웠다 — 화면에 알리지 않은 이유는 NOTES (b).
 * 월드 d₀ = 빔 반폭 × (d₀ fm / 원자 반지름 fm) × 이 값.
 */
export const TARGET_MAGNIFICATION = 220;

/** 알파 입자가 멀리서 날아오는 속력(월드 단위 / s, 화면 시간). 핵 곁에서는 척력에 밀려 느려진다. */
export const ALPHA_SPEED = 14;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 금 원자핵이 원점, 알파 입자는 왼쪽에서 +x 로 온다.
// ------------------------------------------------------------------------

/**
 * 나간 방향을 받는 고리의 반지름. 입자가 고리를 지나는 순간 그 **속도 방향**의 칸에 점 하나가 쌓인다.
 * 고리에 닿은 **자리**로 쌓지 않는 것은 빔 폭 때문이다 — 비껴 들어온 거리만큼 곧은 입자도 고리의
 * 옆자리를 지나 꺾인 것처럼 읽힌다. 빔 반폭의 약 7 배라 가로지른 자리와 쌓인 칸은 8.6° 안에서 어긋난다.
 */
export const RING_RADIUS = 8;

/**
 * 입자가 출발하는 거리(핵에서). 넓은 임베드에서도 화면 밖이도록 프레이밍 왼쪽 끝보다 멀리 둔다 —
 * 입자는 화면 가장자리에서 날아 들어온다.
 */
export const START_RADIUS = 30;

/** 프레이밍 — 들어오는 빔 · 고리 · 오른쪽에 쌓이는 점, 그리고 캡션 띠(장부 G24). */
export const SCENE_BOUNDS = { minX: -13, maxX: 12.5, minY: -10, maxY: 8.9 } as const;

/** 고리 위에 눈금과 글자로 표시하는 방향(도). 이것을 넘겨 나간 입자는 왔던 쪽으로 되튄 것이다. */
export const ANGLE_MARK_DEG = 90;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이(초)
// ------------------------------------------------------------------------

/** 알파 입자들을 차례로 쏘는 동안. */
export const PASS = 6.0;
/** 쏘기를 멈추고 마지막 입자들이 지나가는 동안 — 그사이 가장 가까이 겨눈 입자 하나가 날아온다. */
export const DRIFT = 2.6;
/** 그 입자가 핵에 다가가 멈칫하는 동안 · 되튀어 나가는 동안. 근점이 둘의 경계다. */
export const NEAR = 0.5;
export const REBOUND = 1.1;
/** `near` · `rebound` 의 재생 속도 — 핵 곁의 되튐을 눈으로 따라가게 늦춘다. */
export const CLOSE_TIME_SCALE = 0.4;
/** 나간 방향이 쌓인 채로 머무는 동안 · 흐려지는 동안. */
export const TALLY = 2.6;
export const FADE = 0.8;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const rutherfordScatteringMessages = Object.freeze({
  'label.title': { ko: '러더퍼드 산란', en: 'Rutherford scattering' },
  'label.operation': {
    ko: '대부분 지나가고 일부가 튕겨 나온 실험',
    en: 'The experiment where most passed through and a few bounced back',
  },
  'label.stage': { ko: '금박과 알파 입자', en: 'Gold foil and alpha particles' },
  'label.view': { ko: '원자핵 하나 곁', en: 'Beside one nucleus' },
  'label.nucleus': { ko: '금 원자핵', en: 'gold nucleus' },
  'label.alpha': { ko: 'α 입자', en: 'α particles' },
  /** 꺾인 각 표시 — 기호와 단위라 표식이다 (C1 판정 3). 값은 vars 로 끼운다. */
  'label.angle': { ko: '{deg}°', en: '{deg}°' },
  'caption.pass': {
    ko: '알파 입자 대부분은 금 원자핵 곁을 거의 꺾이지 않고 지나간다',
    en: 'Most alpha particles pass the gold nucleus almost without bending',
  },
  'caption.close': {
    ko: '핵에 아주 가까이 다가간 드문 입자만 세게 밀려, 왔던 쪽으로 되튄다',
    en: 'Only the rare one that comes very close to the nucleus is pushed hard and bounces back the way it came',
  },
  'caption.tally': {
    ko: '나간 방향을 모으면 거의 다 앞쪽이다 — 뒤로 튕긴 것은 드물다',
    en: 'Gather where they went: almost all forward — bouncing back is rare',
  },
} satisfies Record<string, LocalizedText>);

export type RutherfordScatteringMessageKey = keyof typeof rutherfordScatteringMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: RutherfordScatteringMessageKey): LocalizedText => rutherfordScatteringMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: RutherfordScatteringMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const rutherfordScatteringSchema: BundleSchema = {
  id: RUTHERFORD_SCATTERING_ID,
  label: text('label.title'),
  category: 'modern',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 한 주기 안에 여러 입자가 지나가고 하나가 되튀며 할 말을 마친다.
  parameters: [],

  stages: [
    {
      id: 'gold-foil',
      label: text('label.stage'),
      constants: {
        seed: SEED,
        particleCount: PARTICLE_COUNT,
        beamHalfWidth: BEAM_HALF_WIDTH,
        closestApproachFm: CLOSEST_APPROACH_FM,
        atomRadiusFm: ATOM_RADIUS_FM,
        targetMagnification: TARGET_MAGNIFICATION,
        alphaSpeed: ALPHA_SPEED,
        angleMarkDeg: ANGLE_MARK_DEG,
      },
    },
  ],

  environments: [],

  views: [{ id: 'nucleus', label: text('label.view'), default: true }],

  /** 고리 하나와 캡션 줄. 가로는 들어오는 빔이 쓴다. */
  canvas: { height: 380, minHeight: 340 },

  /** 겹침은 scene 에 쓴 순서 — 고리 위에 지나간 길, 그 위에 핵 · 입자 · 쌓인 점, 맨 위에 이름표. */
  drawOrder: 'scene',

  /**
   * 한 주기 = 입자들을 차례로 쏨 → 마지막 입자들이 지나감 → 가장 가까이 겨눈 하나가 핵에 다가가 (느리게)
   * 되튐 → 나간 방향이 쌓인 채 머묾 → 흐려짐. 흐려진 뒤 새 시드 주기로 다시 쏜다.
   * 가장 가까운 입자는 `near` 가 끝나는 순간 근점에 닿도록 쏜다 (physics `drawCycle`).
   */
  timeline: {
    phases: [
      { id: 'pass', duration: PASS, caption: key('caption.pass') },
      { id: 'drift', duration: DRIFT, caption: key('caption.pass') },
      { id: 'near', duration: NEAR, timeScale: CLOSE_TIME_SCALE, caption: key('caption.close') },
      { id: 'rebound', duration: REBOUND, timeScale: CLOSE_TIME_SCALE, caption: key('caption.close') },
      { id: 'tally', duration: TALLY, caption: key('caption.tally') },
      { id: 'fade', duration: FADE, caption: key('caption.tally') },
    ],
  },

  /** 도착한 순간 입자들이 이미 날아오고 있고, 몇은 고리에 닿아 쌓여 있다. */
  startAt: 3.2,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 식과 정의는 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  messages: rutherfordScatteringMessages,
};
