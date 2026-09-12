// ========================================================================
// ramp-energy — 선언
// ========================================================================
// 질문: 가파른 길로 내려온 공이 더 빠르게 도착하는가.
//
// 먼저 도착하는 것과 빠르게 도착하는 것은 다르다. 어떤 길로 내려오든 바닥에
// 내려서는 속력은 같고, 그래서 먼저 간 공이 앞설 뿐 간격은 더 벌어지지 않는다.
//
// 원본: tasks/piece-lab/ramp-energy/ (자유 구현)
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:ramp-energy` 와 문자 그대로 일치한다 (C4). */
export const RAMP_ENERGY_ID = 'ramp-energy';

// ------------------------------------------------------------------------
// 무대 — 원본의 기하를 단위만 바꿔 옮긴다
// ------------------------------------------------------------------------

/**
 * 원본 캔버스(px). 가로 880 · 세로 316 — 레인 셋과 캡션 한 줄이 들어가는 최소
 * 세로다 (원본 NOTES 「세로는 316px 로 눌렀다」).
 */
export const STAGE_PX = { width: 880, height: 316 } as const;

/**
 * px → m. 원본은 중력을 320 px/s² 로 두고 기하를 px 로 짰다. 여기서는 그 기하를
 * 그대로 두고 **단위만** 옮긴다.
 *
 * 자유 낙하 시간은 √(L/g) 이므로 `L_m = L_px · g_m / g_px` 이면 시간이 보존된다.
 * 그래서 스테이지 중력을 9.8 m/s² 로 두고도 **원본과 같은 초에 같은 장면**이 나온다 —
 * t=1.7 · 3.5 의 꺾인 선을 원본 스크린샷 위에 겹쳐 볼 수 있는 근거가 이것이다.
 */
export const M_PER_PX = 9.8 / 320;

/** 원본 캔버스의 가로 px → 월드 m. */
export function mx(px: number): number {
  return px * M_PER_PX;
}

/** 원본 캔버스의 세로 px(위에서부터) → 월드 m (위가 +). */
export function my(pxFromTop: number): number {
  return (STAGE_PX.height - pxFromTop) * M_PER_PX;
}

/**
 * 세 길이 공유하는 구간. **출발 x · 도착 x · 낙차가 모두 같고 중간 모양만 다르다** —
 * 같지 않으면 활주로의 간격 차이가 도착 시각 때문인지 길이 끝난 자리 때문인지
 * 갈리지 않는다 (원본 NOTES).
 */
export const RAMP = {
  /** 출발대 왼쪽 끝. */
  shelf: mx(18),
  /** 경사 시작. */
  x0: mx(56),
  /** 경사 끝 = 활주로 시작. */
  x1: mx(226),
  /** 경사 구간의 가로 길이. 활주로 매개변수의 배율이기도 하다. */
  dx: mx(226 - 56),
} as const;

/**
 * 레인 셋 — 위에서부터. **세로로 쌓은 것은 이 주장이 x 를 세로로 비교해야 하기
 * 때문이다.** 부채꼴로 퍼뜨리면 바닥에서 셋이 같은 높이를 달려 공과 점이 겹친다.
 *
 * 다른 것은 바닥 높이뿐이고, 길의 모양은 `physics.ts` 의 `shapeOf` 가 정한다.
 */
export const LANES = [
  /** 먼저 뚝 떨어지는 사이클로이드 — 가장 먼저 내려선다. */
  { id: 'steep-first', baseY: my(76) },
  /** 곧은 비탈. */
  { id: 'straight', baseY: my(166) },
  /** 처음엔 완만하고 끝에서 떨어진다 — 가장 늦게 내려선다. */
  { id: 'steep-last', baseY: my(256) },
] as const;

/** 낙차 점선과 손잡이가 서 있는 x. */
export const DROP_X = mx(30);
/** 낙차(m) 기본값. 세 레인이 함께 쓴다. */
export const DROP_DEFAULT = mx(56);
/** 손잡이가 잡을 수 있는 낙차의 범위. */
export const DROP_MIN = mx(30);
export const DROP_MAX = mx(62);

/** 공 반지름(m). */
export const BALL_RADIUS = mx(6.5);

/**
 * 자국을 남기는 시간 간격(초). **점 사이 간격이 곧 그 구간의 속력이다** —
 * 경사에서는 뭉쳤다 벌어지고, 활주로에서는 세 줄 모두 같은 간격으로 놓인다.
 */
export const STROBE = 0.15;

/**
 * 정지 평형에서 공을 떼어 내는 최소 진행. 0 이면 내려온 높이도 0 이라 속력이
 * 0 이고, 공은 영원히 출발선에 서 있는다.
 */
export const U0 = 1e-5;

/** 셋 다 이 x 를 넘으면 한 사이클이 끝난다. */
export const CYCLE_END_X = mx(STAGE_PX.width + 14);
/** 이보다 오른쪽의 자국은 그리지 않는다. */
export const MARK_CLIP_X = mx(STAGE_PX.width + 4);
/** 경사 구간을 몇 등분해 그리는가. */
export const RAMP_SAMPLES = 72;

/**
 * 고정 경계 — 원본 캔버스 그대로다. 프레이밍은 주장의 일부이고, 매 프레임 같은
 * 값이라야 카메라가 흔들리지 않는다 (S-piece).
 *
 * 공은 이 경계를 넘어 오른쪽으로 빠져나간다. 원본도 그렇다 — 화면을 벗어나는
 * 것이 사이클의 끝이다.
 */
export const SCENE_BOUNDS = {
  minX: 0,
  maxX: mx(STAGE_PX.width),
  minY: 0,
  maxY: mx(STAGE_PX.height),
} as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const rampEnergyMessages = Object.freeze({
  'label.title': { ko: '경사면과 에너지', en: 'Ramps and energy' },
  'label.operation': {
    ko: '길이 달라도 바닥에서의 속력은 같다',
    en: 'Different paths, same speed at the bottom',
  },
  'label.stage': { ko: '경사면', en: 'Ramps' },
  'label.view': { ko: '세 길', en: 'Three paths' },
  /** 경사 구간 — 간격이 아직 벌어지는 중이다. */
  'caption.descending': {
    ko: '같은 높이에서 출발한 공 셋이 서로 다른 길로 내려간다',
    en: 'Three balls leave the same height by three different paths',
  },
  /** 셋 다 내려선 뒤 — 이 조각의 동사가 일어나는 자리다. */
  'caption.settled': {
    ko: '셋 다 바닥에 내려섰다 — 벌어진 간격이 더는 변하지 않는다',
    en: 'All three are on the flat — the gaps between them stop changing',
  },
  /** 손잡이를 끄는 중. */
  'caption.adjusting': {
    ko: '출발 높이를 다시 정하는 중 — 놓으면 셋이 같은 높이에서 함께 출발한다',
    en: 'Setting a new starting height — release and all three leave it together',
  },
} satisfies Record<string, LocalizedText>);

export type RampEnergyMessageKey = keyof typeof rampEnergyMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export function text(key: RampEnergyMessageKey): LocalizedText {
  return rampEnergyMessages[key];
}

/** 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: RampEnergyMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const rampEnergySchema: BundleSchema = {
  id: RAMP_ENERGY_ID,
  label: text('label.title'),
  category: 'mechanics',
  operation: text('label.operation'),
  timeModel: 'linear',

  // 자동 진행만으로 주장이 끝난다. 손잡이는 그것을 '어떤 높이에서든' 으로
  // 넓히려고 둔 것이다 (controllers.ts).
  parameters: [],

  stages: [{ id: 'ramps', label: text('label.stage'), constants: { g: 9.8 } }],
  environments: [],
  views: [{ id: 'paths', label: text('label.view'), default: true }],

  autoViews: { energy: false },

  /** 원본의 세로. 레인 셋에 캡션 한 줄이 들어가야 해서 더 줄이기 어려웠다. */
  canvas: { height: STAGE_PX.height, minHeight: STAGE_PX.height },

  /**
   * 겹침 순서가 원본의 결정이다 — 길 위에 자국이 찍히고, 자국 위로 꺾인 선이
   * 지나고, 공이 맨 위에 온다. 층 기본값이면 자국(19)이 길(20) 아래로 깔려
   * 길에 가려진다.
   */
  drawOrder: 'scene',

  /**
   * **도착한 순간 이미 진행 중**이다 (S-piece). 원본이 `for` 루프로 66 걸음
   * (1.1 초분) 굴려 두고 첫 프레임을 그린 것을 선언으로 옮겼다 — 러너의 프리롤도
   * 1/60 고정 걸음이라 걸음 수가 원본과 같다.
   *
   * `startAt` 은 쓰지 않는다. 이 조각은 시각의 함수가 하나도 없어서 시계를
   * 앞당겨도 화면이 비어 있다 — 공이 아직 출발선에 있다.
   */
  preroll: 1.1,

  /**
   * 슬롯 하나. **국면이 시각이 아니라 상태로 갈린다** — 셋 다 내려섰는지,
   * 손잡이를 끄는 중인지. 그래서 단계가 아니라 `cases` 가 문안을 고른다.
   * 위에서부터 훑어 참인 첫 항목이 이긴다.
   */
  caption: {
    anchor: { screen: 'bottom-left', offset: [6, 9] },
    align: 'left',
    fontSize: 14,
    style: { colorRole: 'muted', emphasis: 'strong' },
    text: key('caption.descending'),
    cases: [
      { when: 'held', text: key('caption.adjusting') },
      { when: 'allOnFloor', text: key('caption.settled') },
    ],
  },

  /**
   * 시간표를 선언하지 않는다. 이 조각의 국면 전환은 **상태**가 정한다 — 셋 다
   * 활주로에 내려선 순간과 셋 다 화면을 벗어난 순간이고, 둘 다 낙차에 따라
   * 시각이 달라진다. 고정 길이 단계로 나누면 손잡이를 끄는 순간 거짓이 된다.
   *
   * 그리드도 카메라 버튼도 없다 (기본값). 원본이 두지 않기로 한 것들이다.
   */

  messages: rampEnergyMessages,
};
