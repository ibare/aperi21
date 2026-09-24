// ========================================================================
// orbital-decay — 선언
// ========================================================================
// 질문: 옅은 대기가 위성을 끌면 위성은 어떻게 되는가 — 느려지는가.
//
// 대기는 진행 반대쪽으로 끌어 위성의 에너지를 빼앗는다. 그런데 위성은 느려지지 않는다 —
// 나선을 그리며 조금씩 내려앉고, **내려앉을수록 오히려 빨라진다**(낮은 궤도가 더 빠르다).
// 떨어지며 내놓는 위치 에너지가 공기가 가져가는 몫의 두 배라, 남는 절반이 속도가 된다.
// 공기는 아래로 갈수록 짙어서 한 바퀴마다 내려앉는 폭이 커지고, 끝내 떨어진다.
//
// 「진행 방향으로 밀었는데 높은 궤도에서 느려진다」 는 `orbital-transfer` 의 몫이다. 이 조각은 그
// 거울상 — 뒤로 끌리는데 빨라진다 — 에 머물고, 두 번 밀기 · 쌍둥이 비교를 되풀이하지 않는다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:orbital-decay` 와 문자 그대로 일치한다 (C4). */
export const ORBITAL_DECAY_ID = 'orbital-decay';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 길이는 월드 단위, 행성 중심이 원점이다.
// ------------------------------------------------------------------------

/** 중력 상수 × 행성 질량(월드 단위계). 속도 · 주기가 이 값에서 나온다. */
export const GM = 1;
/** 행성 반지름(월드). 대기의 바닥이고, 위성이 여기에 닿으면 떨어진 것이다. */
export const PLANET_RADIUS = 1;
/** 처음 원 궤도 반지름(월드). 옅은 대기의 윗자락이다. */
export const START_RADIUS = 2.4;
/** 대기 밀도 척도 높이(월드). 이만큼 내려갈 때마다 공기가 e 배 짙어진다. */
export const SCALE_HEIGHT = 0.4;
/**
 * 항력 계수(월드 단위계) — 지면 밀도 × 항력 계수 × 단면적 / 질량을 한 수로 묶었다.
 * 항력 가속도 = dragCoefficient · ρ(r)/ρ(지면) · |v| · v, 진행 반대쪽.
 */
export const DRAG_COEFFICIENT = 0.03;

// ------------------------------------------------------------------------
// 표현 — 스테이지 상수의 기본값이다.
// ------------------------------------------------------------------------

/**
 * 처음 궤도 한 바퀴의 화면 시간(초). 모든 비행이 **이 한 배율**로 흐른다 — 빨라진 위성은 화면에서도
 * 빨리 돈다. 이 배율로 잰 추락 시각(약 10.4 초)에 맞춰 시간표 `plunge` 의 끝을 잡는다(장부 G13).
 */
export const LAP_SECONDS = 1.6;
/** 속도 화살표 길이(월드 per 속도). 길이가 곧 빠르기다. */
export const ARROW_PER_SPEED = 1.6;
/**
 * 항력 화살표 길이(월드). **방향만** 보인다 — 항력의 크기는 척도 높이마다 e 배씩 커져 한 배율로는
 * 처음에 보이지 않거나 끝에 화면을 넘는다. 짙어지는 공기는 대기 원판과 벌어지는 나선이 보인다.
 */
export const DRAG_ARROW_LENGTH = 0.75;
/** 에너지 기둥 길이(월드 per 에너지). 추락 직전 내놓은 위치 에너지가 약 0.58 이라 3.5 월드쯤 된다. */
export const BAR_PER_ENERGY = 6;

// ------------------------------------------------------------------------
// 배치 — 월드 단위.
// ------------------------------------------------------------------------

/** 캡션이 서는 자리(월드). 궤도 왼쪽 빈자리다. */
export const CAPTION_AT: readonly [number, number] = [-6.1, 0.6];
/** 에너지 기둥 둘이 매달리는 기준선의 왼쪽 끝(월드). 궤도 오른쪽이다. */
export const BARS_AT: readonly [number, number] = [3.0, 2.0];

/**
 * 프레이밍은 주장의 일부다. 가로는 왼쪽 캡션부터 오른쪽 에너지 기둥 이름표까지, 세로는 처음 궤도와
 * 그 위 화살표 · 기둥 머리 이름표까지. 처음 궤도가 가장 큰 장면이라 처음부터 들어간다.
 */
export const SCENE_BOUNDS = { minX: -6.3, maxX: 6.2, minY: -2.75, maxY: 2.75 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const orbitalDecayMessages = Object.freeze({
  'label.title': { ko: '궤도 감쇠', en: 'Orbital decay' },
  'label.stage': { ko: '옅은 대기', en: 'Thin atmosphere' },
  'label.view': { ko: '나선으로 내려앉기', en: 'Spiralling down' },
  'label.velocity': { ko: '속도', en: 'velocity' },
  'label.drag': { ko: '항력', en: 'drag' },
  'label.released': { ko: '내놓은 위치 에너지', en: 'potential energy released' },
  'label.wentTo': { ko: '간 곳', en: 'where it went' },
  'label.toSpeed': { ko: '빨라진 몫', en: 'into speed' },
  'label.toAir': { ko: '공기가 가져간 몫', en: 'taken by the air' },
  'caption.sink': {
    ko: '옅은 공기가 진행 반대쪽으로 끈다 — 궤도가 조금씩 내려앉는데, 위성은 오히려 빨라진다',
    en: 'Thin air drags against the motion — the orbit sinks little by little, yet the satellite speeds up',
  },
  'caption.deepen': {
    ko: '아래로 갈수록 공기가 짙어, 한 바퀴마다 내려앉는 폭이 커진다',
    en: 'Lower down the air is thicker, so each lap sinks further than the last',
  },
  'caption.plunge': {
    ko: '끝내 짙은 공기 속으로 떨어진다',
    en: 'In the end it plunges into the thick air',
  },
  'caption.energy': {
    ko: '내려앉으며 내놓은 위치 에너지 — 절반은 공기가 가져갔고, 절반은 속도가 되었다',
    en: 'The potential energy released on the way down — half was taken by the air, half became speed',
  },
} satisfies Record<string, LocalizedText>);

export type OrbitalDecayMessageKey = keyof typeof orbitalDecayMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: OrbitalDecayMessageKey): LocalizedText => orbitalDecayMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: OrbitalDecayMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const orbitalDecaySchema: BundleSchema = {
  id: ORBITAL_DECAY_ID,
  title: text('label.title'),
  category: 'astro',
  timeModel: 'periodic',

  // 조작기가 없다. 항력 · 대기를 바꾸게 하면 추락 시각이 시간표를 벗어나고(장부 G13), 「얼마나
  // 빨리 떨어지나」 의 과녁 맞히기가 되어 「끌리는데 빨라진다」 가 흐려진다.
  parameters: [],

  stages: [
    {
      id: 'thin-air',
      label: text('label.stage'),
      constants: {
        gm: GM,
        planetRadius: PLANET_RADIUS,
        startRadius: START_RADIUS,
        scaleHeight: SCALE_HEIGHT,
        dragCoefficient: DRAG_COEFFICIENT,
        lapSeconds: LAP_SECONDS,
        arrowPerSpeed: ARROW_PER_SPEED,
        dragArrowLength: DRAG_ARROW_LENGTH,
        barPerEnergy: BAR_PER_ENERGY,
      },
    },
  ],

  environments: [],

  views: [{ id: 'spiral', label: text('label.view'), default: true }],

  /** 궤도는 가운데, 캡션은 왼쪽, 에너지 기둥은 오른쪽 — 세로가 비싸다 (S-piece). */
  canvas: { height: 400, minHeight: 320 },

  /** 대기 · 자취 · 화살표 · 위성의 겹침 순서가 뜻을 갖는다 — 위성이 맨 위. */
  drawOrder: 'scene',

  /**
   * 위성은 주기 시작부터 한 시계로 흐른다(`sink` · `deepen` · `plunge` 를 가로질러). 단계는 캡션을
   * 가를 뿐 움직임을 멈추지 않는다.
   *
   * - `sink` — 처음 네 바퀴쯤. 나선의 간격이 촘촘하다 — 조금씩 내려앉는다.
   * - `deepen` — 간격이 벌어진다. 공기가 짙은 아래로 갈수록 빨리 내려앉는다.
   * - `plunge` — 마지막 바퀴와 추락. 적분한 추락 시각(약 10.4 초)이 이 단계 안에 들도록 손으로 맞췄다
   *   — 저작자가 항력 · 척도 높이 · `lapSeconds` 를 바꾸면 이 길이도 함께 고쳐야 한다(장부 G13).
   * - `hold` — 떨어진 자리에 멈춰 에너지 기둥을 읽는다. `fade` — 흐려지고 다음 주기로.
   */
  timeline: {
    phases: [
      { id: 'sink', duration: 5.8, caption: key('caption.sink') },
      { id: 'deepen', duration: 3.9, caption: key('caption.deepen') },
      { id: 'plunge', duration: 1.3, caption: key('caption.plunge') },
      { id: 'hold', duration: 3.8, caption: key('caption.energy') },
      { id: 'fade', duration: 0.7, caption: key('caption.energy') },
    ],
  },

  /** 도착한 순간 위성이 이미 첫 바퀴를 돌고 있다. 쌓는 상태가 없어 `preroll` 은 쓰지 않는다. */
  startAt: 0.4,

  // 슬롯 하나. 궤도 왼쪽 빈자리에 세운다 — 그림에 딸린 자리라 월드 앵커다.
  caption: {
    anchor: { world: CAPTION_AT },
    align: 'left',
    fontSize: 15,
    wrapWidth: 210,
    fade: 0.3,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  /** 그리드 · 카메라 단추 없음(기본값). 읽을 것은 거리가 아니라 나선의 간격과 화살표 길이다. */

  messages: orbitalDecayMessages,
};
