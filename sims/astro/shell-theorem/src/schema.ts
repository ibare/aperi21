// ========================================================================
// shell-theorem — 선언
// ========================================================================
// 질문: 속 빈 껍질 안에 들어가면 왜 껍질이 당기지 않는가.
//
// 껍질 밖에서 다가오는 작은 질량은 가까워질수록 중심 쪽으로 세게 끌린다. 껍질을
// 넘어 안으로 들어서는 순간 그 당김이 사라진다. 안에서는 그 질량을 꼭짓점으로 한
// 쌍둥이 원뿔이 돌며 껍질을 두 조각으로 오려 낸다 — 가까운 쪽은 좁고, 먼 쪽은 넓다.
// 두 조각이 당기는 화살표는 **어느 방향이든 같은 길이로 맞선다.** 자리를 옮겨도 그렇다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:shell-theorem` 와 문자 그대로 일치한다 (C4). */
export const SHELL_THEOREM_ID = 'shell-theorem';

// ------------------------------------------------------------------------
// 물리 · 배치 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 월드 단위는 껍질 반지름이 1 인 길이다.
// ------------------------------------------------------------------------

/** 껍질 반지름(월드). */
export const SHELL_RADIUS = 1;
/**
 * 껍질 밖 당김 화살표의 배율. 길이 = 배율 / r² (껍질 전체 질량이 중심에 모인 것과 같다).
 * 껍질 바로 곁에서 약 0.96, 출발점(r ≈ 2.2)에서 약 0.22 다.
 */
export const OUTSIDE_ARROW_SCALE = 1.1;
/**
 * 껍질 안 조각 하나의 당김 화살표 배율. 길이 = 배율 / cosθ — θ 는 원뿔 축이 껍질을
 * 뚫는 자리에서 껍질 법선과 이루는 각이다. 조각의 넓이가 거리² / cosθ 에 비례하고
 * 당김은 1 / 거리² 이라 거리가 지워진다. 양 끝의 θ 가 같아 두 화살표는 늘 같은 길이다.
 */
export const PIECE_ARROW_SCALE = 0.34;
/** 원뿔 반각(도). 넓으면 조각이 껍질의 곡률을 따라 휘어 「조각」 보다 「호」 로 읽힌다. */
export const CONE_HALF_ANGLE_DEG = 11;
/** 원뿔 축의 처음 방향(도, 월드 +x 에서 반시계). */
export const CONE_START_DEG = 20;
/** 원뿔이 도는 빠르기(도/초). 안에 머무는 동안 반 바퀴쯤 — 모든 방향을 한 번씩 훑는다. */
export const CONE_TURN_RATE = 19;

/** 출발점 x(월드) — 껍질 오른쪽 밖. 들어오는 길의 높이는 `pathY`. */
export const START_X = 2.2;
/** 들어오는 길의 높이(월드). 중심을 지나지 않게 조금 비켜 간다. */
export const PATH_Y = 0.22;
/** 껍질 바로 밖에서 멈추는 틈(월드). 여기서 당김이 가장 세다. */
export const RIM_GAP = 0.07;
/** 안에서 처음 머무는 자리(월드). 중심에서 비켜 있어야 가까운 쪽 · 먼 쪽이 갈린다. */
export const P1_X = 0.5;
export const P1_Y = 0.22;
/**
 * 안에서 옮겨 가는 자리(월드). 왼쪽 위 — 「안 어디든」. 옮기는 길이 중심을 지나지 않게 둔다 —
 * 중심 곁에서는 두 조각이 거의 같아 「좁은 쪽 · 넓은 쪽」 이 사라진다.
 */
export const P2_X = -0.25;
export const P2_Y = 0.6;
/** 나가는 끝 x(월드) — 껍질 왼쪽 밖. 높이는 `p2Y` 그대로. */
export const EXIT_X = -2.2;
/** 시험 질량 반지름(월드). */
export const MASS_RADIUS = 0.07;

/** 껍질 원을 표본하는 점 수 · 조각 호 하나를 표본하는 점 수. 그림의 매끄러움이다. */
export const SHELL_SAMPLES = 96;
export const PIECE_SAMPLES = 12;

// ------------------------------------------------------------------------
// 배치
// ------------------------------------------------------------------------

/**
 * 프레이밍은 주장의 일부다. 출발점 · 나가는 끝(±2.2)과 껍질(±1)을 담고, 아래에 캡션 띠를
 * 남긴다(캡션 자리가 프레이밍 여백으로 잡히지 않는다 — 장부 G24). 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -2.35, maxX: 2.35, minY: -1.36, maxY: 1.08 } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이 (저작자가 바꿀 수 있는 기본값)
// ------------------------------------------------------------------------

/** 시험 질량이 출발점에 나타나는 동안. */
export const APPEAR = 0.5;
/** 껍질 바로 밖까지 다가오는 동안 — 당김이 자라는 것을 보는 시간. */
export const APPROACH = 3;
/** 껍질을 넘어 첫 자리로 들어가는 동안. */
export const ENTER = 1.4;
/** 원뿔이 펼쳐지는 동안. */
export const OPEN = 0.6;
/** 한 자리에서 원뿔이 돌며 두 당김이 맞서는 것을 보는 동안. */
export const CONES = 4.6;
/** 안의 다른 자리로 옮겨 가는 동안 — 원뿔은 계속 돈다. */
export const WANDER = 3;
/** 옮긴 자리에서 조금 더 머무는 동안. */
export const LINGER = 1.4;
/** 원뿔이 걷히는 동안. */
export const CLOSE = 0.5;
/** 껍질 밖으로 나가는 동안 — 넘는 순간 당김이 돌아온다. */
export const EXIT = 2.6;
/** 다음 주기로 넘어가며 시험 질량이 사라지는 동안. */
export const FADE = 0.6;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const shellTheoremMessages = Object.freeze({
  'label.title': { ko: '껍질 정리', en: 'Shell theorem' },
  'label.operation': {
    ko: '구 껍질 안팎에서의 중력',
    en: 'Gravity inside and outside a spherical shell',
  },
  'label.stage': { ko: '속 빈 껍질', en: 'Hollow shell' },
  'label.view': { ko: '단면', en: 'Cross-section' },
  'label.net': { ko: '합 = 0', en: 'net = 0' },
  'caption.approach': {
    ko: '껍질 밖에서는 가까워질수록 중심 쪽으로 세게 끌린다',
    en: 'Outside the shell, the pull toward the center grows as the mass closes in',
  },
  'caption.enter': {
    ko: '껍질을 넘어 안으로 들어서자 당김이 사라진다',
    en: 'Once it crosses into the shell, the pull is gone',
  },
  'caption.cones': {
    ko: '가까운 쪽 좁은 조각과 먼 쪽 넓은 조각이 같은 크기로 맞서 당긴다 — 어느 방향이든',
    en: 'The near, narrow piece and the far, wide piece pull equally in opposite ways — in every direction',
  },
  'caption.wander': {
    ko: '안 어디로 옮겨도 두 당김은 늘 맞서고, 합은 0 이다',
    en: 'Move anywhere inside and the two pulls still cancel — the net is zero',
  },
  'caption.exit': {
    ko: '껍질 밖으로 나서자 다시 중심 쪽으로 끌린다',
    en: 'Step back outside and the pull toward the center returns',
  },
} satisfies Record<string, LocalizedText>);

export type ShellTheoremMessageKey = keyof typeof shellTheoremMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: ShellTheoremMessageKey): LocalizedText => shellTheoremMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ShellTheoremMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const shellTheoremSchema: BundleSchema = {
  id: SHELL_THEOREM_ID,
  label: text('label.title'),
  category: 'astro',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 질량이 다가오고, 들어가고, 원뿔이 돈다.
  parameters: [],

  stages: [
    {
      id: 'hollow-shell',
      label: text('label.stage'),
      constants: {
        shellRadius: SHELL_RADIUS,
        outsideArrowScale: OUTSIDE_ARROW_SCALE,
        pieceArrowScale: PIECE_ARROW_SCALE,
        coneHalfAngleDeg: CONE_HALF_ANGLE_DEG,
        coneStartDeg: CONE_START_DEG,
        coneTurnRate: CONE_TURN_RATE,
        startX: START_X,
        pathY: PATH_Y,
        rimGap: RIM_GAP,
        p1X: P1_X,
        p1Y: P1_Y,
        p2X: P2_X,
        p2Y: P2_Y,
        exitX: EXIT_X,
        massRadius: MASS_RADIUS,
      },
    },
  ],

  environments: [],

  views: [{ id: 'section', label: text('label.view'), default: true }],

  /** 가로로 긴 길(±2.2)과 껍질 하나, 캡션 한 줄. 세로를 더 주면 그림만 작아진다. */
  canvas: { height: 380, minHeight: 340 },

  /**
   * 겹침이 판정 장치다. 원뿔 쐐기는 껍질 **아래**에 옅게 깔리고, 강조한 두 조각은 껍질
   * **위**, 두 당김 화살표와 시험 질량은 맨 위에 놓여야 「이 조각이 이쪽으로 당긴다」 가 읽힌다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 나타남 → 다가옴 → 들어감 → 원뿔 펼침 → 맞섬 → 옮김 → 머묾 → 원뿔 걷힘 →
   * 나감 → 흐려짐. 껍질을 넘는 순간은 단계 경계가 아니라 자리(r 와 껍질 반지름)가 정한다.
   */
  timeline: {
    phases: [
      { id: 'appear', duration: APPEAR, caption: key('caption.approach') },
      { id: 'approach', duration: APPROACH, ease: 'smooth', caption: key('caption.approach') },
      { id: 'enter', duration: ENTER, ease: 'smooth', caption: key('caption.enter') },
      { id: 'open', duration: OPEN, ease: 'smooth', caption: key('caption.cones') },
      { id: 'cones', duration: CONES, caption: key('caption.cones') },
      { id: 'wander', duration: WANDER, ease: 'smooth', caption: key('caption.wander') },
      { id: 'linger', duration: LINGER, caption: key('caption.wander') },
      { id: 'close', duration: CLOSE, ease: 'smooth', caption: key('caption.exit') },
      { id: 'exit', duration: EXIT, ease: 'smooth', caption: key('caption.exit') },
      { id: 'fade', duration: FADE, caption: key('caption.exit') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — 질량이 껍질 쪽으로 다가오는 도중에 연다. */
  startAt: 1.2,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 정의와 공식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 720,
    fade: 0.3,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것은 거리가 아니라 **두 화살표 길이의 견줌**이라
   * 거리 격자를 깔면 「몇 미터인가」 라는 다른 질문이 끼어든다.
   */

  messages: shellTheoremMessages,
};
