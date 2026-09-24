// ========================================================================
// diffusion — 선언
// ========================================================================
// 질문: 물에 떨어뜨린 잉크는 아무도 휘젓지 않는데 왜 저절로 퍼져 고르게 되나.
//
// 알갱이 하나하나는 방향 없이 제멋대로 걷는다. 그런데 가운데에 알갱이가 많으므로
// 가운데에서 바깥으로 나가는 알갱이가 바깥에서 들어오는 알갱이보다 많다. 그래서
// 무리 전체로는 진한 쪽에서 옅은 쪽으로 번지고, 어디나 같은 수가 되면 나가고
// 들어오는 수가 맞아 더 변하지 않는다.
//
// 한 알갱이를 떼어 보는 것(brownian-motion) · 걸음 거리의 제곱근 법칙(random-walk)은
// 이 조각의 몫이 아니다. 여기서 일어나는 것은 「제멋대로 걷는 것들이 모여 고르게 된다」 하나다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:diffusion` 와 문자 그대로 일치한다 (C4). */
export const DIFFUSION_ID = 'diffusion';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 길이 단위는 월드다. 물통 가로가 `TANK.maxX − TANK.minX` 이다.
// ------------------------------------------------------------------------

/** 걸음을 뽑는 시드. 같은 시드 · 같은 시각은 언제나 같은 화면이다. */
export const SEED = 11;
/** 잉크 알갱이 수. */
export const PARTICLES = 600;
/** 한 걸음의 길이(월드). 방향은 걸음마다 제멋대로다. */
export const STEP_LENGTH = 0.5;
/** 떨어뜨린 무리의 퍼짐(월드, 가우스 표준편차). 작을수록 처음 봉우리가 뾰족하다. */
export const BLOB_RADIUS = 0.9;
/** 농도 곡선의 구간 수. 물통 가로를 이만큼 똑같이 나눠 센다. */
export const BINS = 11;
/**
 * `leave` 단계 동안 걷는 걸음 수. 봉우리는 처음 스무 걸음 남짓에 무너지므로 그 몫을 느린 단계로 떼어
 * 천천히 보인다 (NOTES (b)).
 */
export const LEAVE_STEPS = 25;
/** `spread` 단계 동안 걷는 걸음 수. */
export const SPREAD_STEPS = 145;
/** `even` 단계 동안 더 걷는 걸음 수. 고르게 된 뒤에도 걸음은 멈추지 않는다. */
export const SETTLE_STEPS = 60;
/** 막대 높이 배율(월드 / 알갱이 하나). 구간에 든 알갱이 수 × 이 값이 막대 높이다. */
export const BAR_SCALE = 0.0085;
/**
 * 따라가는 한 알갱이의 길을 최근 몇 걸음까지 남기나. 다 남기면 물통이 낙서로 덮여 「되돌아간다」 가
 * 오히려 안 읽힌다 (NOTES (b)).
 */
export const TRAIL_STEPS = 45;

// ------------------------------------------------------------------------
// 배치 — 월드. 위가 물통, 아래가 같은 가로축을 쓰는 농도 막대다.
// ------------------------------------------------------------------------

/** 물통 안쪽(물). 알갱이는 이 벽에서 되튄다. */
export const TANK = { minX: 0, maxX: 12, minY: 2.9, maxY: 5.3 } as const;
/** 농도 막대의 바닥선 높이(월드). 막대는 여기서 위로 선다. */
export const BAR_BASE_Y = 0.2;
/** 막대 이름표의 자리(월드). 왼쪽 끝 막대 위 — 고르게 된 막대 높이(약 0.5)보다 높다. */
export const BAR_LABEL_AT = [0, 1.15] as const;

/**
 * 프레이밍은 주장의 일부다. 물통 · 막대 · 아래 캡션 줄까지. 매 프레임 같은 값이다.
 * 가장 높은 막대(처음 봉우리)가 물통 바닥 아래에 들도록 막대 배율과 함께 잡았다 (NOTES (b)).
 */
export const SCENE_BOUNDS = { minX: -0.4, maxX: 12.4, minY: -0.9, maxY: 5.5 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const diffusionMessages = Object.freeze({
  'label.title': { ko: '확산', en: 'Diffusion' },
  'label.stage': { ko: '물에 떨어뜨린 잉크', en: 'Ink dropped into water' },
  'label.view': { ko: '물통과 농도', en: 'Tank and concentration' },
  'label.bars': { ko: '구간마다 든 알갱이 수', en: 'grains in each strip' },
  'caption.drop': {
    ko: '물 한가운데에 잉크 알갱이를 한데 모아 떨어뜨린다',
    en: 'A clump of ink grains is dropped into the middle of the water',
  },
  'caption.spread': {
    ko: '한 알갱이는 이리저리 되돌아가며 걷는데, 무리는 진한 가운데에서 옅은 양옆으로 번진다',
    en: 'One grain wanders back and forth, yet the crowd spreads from the dense middle toward the thin sides',
  },
  'caption.even': {
    ko: '이제 어느 구간이나 알갱이 수가 비슷하다 — 알갱이들은 여전히 걷는다',
    en: 'Now every strip holds about the same number of grains — and the grains are still walking',
  },
} satisfies Record<string, LocalizedText>);

export type DiffusionMessageKey = keyof typeof diffusionMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: DiffusionMessageKey): LocalizedText => diffusionMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: DiffusionMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const diffusionSchema: BundleSchema = {
  id: DIFFUSION_ID,
  title: text('label.title'),
  category: 'thermal',
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 무리가 퍼지고, 고르게 되고, 다시 떨어뜨린다.
  parameters: [],

  stages: [
    {
      id: 'ink-in-water',
      label: text('label.stage'),
      constants: {
        seed: SEED,
        particles: PARTICLES,
        stepLength: STEP_LENGTH,
        blobRadius: BLOB_RADIUS,
        bins: BINS,
        leaveSteps: LEAVE_STEPS,
        spreadSteps: SPREAD_STEPS,
        settleSteps: SETTLE_STEPS,
        barScale: BAR_SCALE,
        trailSteps: TRAIL_STEPS,
      },
    },
  ],

  environments: [],

  views: [{ id: 'tank-and-bars', label: text('label.view'), default: true }],

  /** 가로 12.8 · 세로 6.3 월드. 물통과 막대를 위아래로 둔다 — 같은 가로축을 나눠 써야 해서다. */
  canvas: { height: 380, minHeight: 320 },

  /**
   * 쓴 순서대로 그린다. 층 순서로는 물(`region`)이 알갱이 위에 덮여 잉크가 흐려진다 —
   * 이 그림에서 물은 비쳐 보이는 매질이 아니라 알갱이의 바탕이다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 떨어뜨림 → 봉우리가 무너짐(느리게) → 퍼짐 → 고른 채 걸음 → 사라짐. 걸음 번호는
   * `leave` · `spread` · `even` 의 진행도에
   * 각 단계의 걸음 수(스테이지 상수)를 곱해 얻는다 — 단계 길이는 빠르기, 걸음 수는 얼마나 걷나다.
   */
  timeline: {
    phases: [
      { id: 'drop', duration: 0.8, ease: 'smooth', caption: key('caption.drop') },
      { id: 'leave', duration: 2.5, caption: key('caption.spread') },
      { id: 'spread', duration: 8, caption: key('caption.spread') },
      { id: 'even', duration: 3.5, caption: key('caption.even') },
      { id: 'clear', duration: 0.7, ease: 'smooth', caption: key('caption.even') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — 뭉친 무리가 막 번지기 시작했다. */
  startAt: 1.3,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 법칙은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 720,
    fade: 0.25,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /** 그리드 · 카메라 단추 없음(기본값). 잴 것은 거리가 아니라 **막대의 모양**이다. */

  messages: diffusionMessages,
};
