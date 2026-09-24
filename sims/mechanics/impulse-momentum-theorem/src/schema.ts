// ========================================================================
// impulse-momentum-theorem — 선언
// ========================================================================
// 질문: 공이 벽에 부딪혀 튕겨 나올 때, 공의 운동량은 얼마나 바뀌었고 그것을
// 정한 것은 무엇인가.
//
// 답: 벽이 미는 힘을 시간에 대해 쌓은 넓이(충격량 J)만큼 바뀐다. 넓이가 쌓이는
// 동안 운동량 화살표는 **쌓인 만큼** 옮겨 가고, 넓이가 처음 운동량만큼 쌓인
// 순간 공이 멈추며, 그 뒤로 쌓이는 넓이는 운동량을 반대쪽으로 키운다. 그래서
// 튕겨 나온 공의 운동량 변화는 처음 운동량보다 **크다**.
//
// 이웃 `impulse-force-relation` 은 「같은 충격량을 길게 받으면 힘이 작다」 이다.
// 여기는 힘의 모양을 견주지 않는다 — 한 물체가 받은 넓이와 그 물체의 운동량
// 변화가 같다는 것 하나에 머문다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:impulse-momentum-theorem` 와 문자 그대로 일치한다 (C4). */
export const IMPULSE_MOMENTUM_THEOREM_ID = 'impulse-momentum-theorem';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 운동량은 처음 운동량의 크기를 1 로 잡은 단위다. 화면에 수를 두지 않는다.
// ------------------------------------------------------------------------

/** 처음 운동량. 음수가 왼쪽(벽 쪽)이다. */
export const P_INITIAL = -1;
/** 반발 계수. 튕겨 나온 운동량 = −e · 처음 운동량. */
export const RESTITUTION = 0.6;
/** 벽에 닿아 있는 시간(조각 시계 초). 화면에서는 `CONTACT_TIME_SCALE` 만큼 느리게 흐른다. */
export const CONTACT_TIME = 0.2;
/** 운동량 1 당 공의 속력(월드/초). 화면에서 공이 움직이는 빠르기일 뿐이다. */
export const SPEED_PER_P = 0.7;

/**
 * 힘 F(τ) = Fmax · sin(πτ/T) 의 넓이가 J(τ) = J·(1 − cos(πτ/T))/2 이다.
 * 이 넓이가 |p₀| 가 되는 순간(공이 멈추는 순간)의 비율 — `stop` 단계 길이의 기본값이다.
 */
const J_TOTAL = (1 + RESTITUTION) * Math.abs(P_INITIAL);
const STOP_FRACTION = Math.acos(1 - (2 * Math.abs(P_INITIAL)) / J_TOTAL) / Math.PI;

// ------------------------------------------------------------------------
// 시간표 기본값(조각 시계 초)
// ------------------------------------------------------------------------

/** 벽까지 굴러가는 시간. */
export const APPROACH = 1.2;
/** 닿은 순간부터 멈출 때까지 · 멈춘 뒤 떨어질 때까지. 둘의 합이 `CONTACT_TIME`. */
export const STOP = CONTACT_TIME * STOP_FRACTION;
export const REBOUND = CONTACT_TIME - STOP;
/** 접촉 동안의 재생 속도. 0.2 초를 화면에서 2.4 초로 늘인다. */
export const CONTACT_TIME_SCALE = 1 / 12;
/** 튕겨 나가 달리는 시간 · 옅어지는 시간. */
export const LEAVE = 2.6;
export const FADE = 0.5;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 벽 면이 x = 0.
// ------------------------------------------------------------------------

/** 공 반지름. */
export const BALL_R = 0.15;
/** 공이 가장 세게 눌렸을 때 가로로 줄어드는 양(반지름 비). 눌림은 힘에 비례한다. */
export const SQUASH_MAX = 0.22;
/** 바닥 높이. */
export const FLOOR_Y = 1.12;
/** 바닥선 오른쪽 끝. */
export const FLOOR_END_X = 2.0;
/** 벽 두께 · 높이. */
export const WALL_THICK = 0.1;
export const WALL_H = 0.5;

/** 운동량 수직선 — 높이 · 0 의 자리 · 운동량 1 의 길이 · 좌우 끝. */
export const P_AXIS_Y = 0.66;
export const P_ORIGIN_X = 1.15;
export const P_UNIT = 1.0;
export const P_AXIS_FROM = 0.0;
export const P_AXIS_TO = 2.0;
/** 충격량 화살표가 놓이는 줄 — 운동량 수직선 바로 아래. */
export const J_LANE_Y = 0.4;

/** 힘-시간 그래프 — 원점 · 가로 길이 · 최대 힘의 높이 · 세로축 길이. */
export const GRAPH_X = 2.62;
export const GRAPH_Y = 0.3;
export const GRAPH_W = 1.9;
export const GRAPH_H = 1.0;
export const GRAPH_AXIS_H = 1.28;
/** 그래프 가로축이 담는 접촉 앞뒤 여유(접촉 시간 비). */
export const GRAPH_MARGIN = 0.18;
/** 힘 곡선을 자르는 마디 수. */
export const GRAPH_SAMPLES = 64;

/** 힘 화살표 — 최대 힘일 때 길이(월드). 그래프와 같은 모양으로 자라고 준다. */
export const FORCE_ARROW_LEN = 0.55;

/** 고정 경계. 매 프레임 같은 값이다 (S-piece — 프레이밍은 주장의 일부다). */
export const SCENE_BOUNDS = { minX: -0.42, maxX: 4.86, minY: -0.12, maxY: 1.72 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const impulseMomentumTheoremMessages = Object.freeze({
  'label.title': { ko: '충격량-운동량 정리', en: 'Impulse–momentum theorem' },
  'label.stage': { ko: '벽에 튕기는 공', en: 'Ball bouncing off a wall' },
  'label.view': { ko: '운동량과 넓이', en: 'Momentum and area' },

  /** 수직선 이름. 조사가 붙지 않는 한 낱말이지만 언어마다 다른 말이라 문안이다 (C1 판정 4). */
  'label.momentum': { ko: '운동량', en: 'momentum' },
  /** 그래프 세로축 이름. 누가 누구를 미는지가 들어가 문안이다. */
  'label.force': { ko: '벽이 공을 미는 힘', en: 'push of the wall on the ball' },
  /** 넓이가 처음 운동량만큼 쌓인 자리 — 공이 멈춘 순간. */
  'label.stop': { ko: '멈춤', en: 'stops' },

  /** 기호는 표식이라 번역 대상이 아니다 (C1 판정 3). */
  'label.p': { ko: 'p', en: 'p' },
  'label.p0': { ko: 'p₀', en: 'p₀' },
  'label.J': { ko: 'J', en: 'J' },
  'label.F': { ko: 'F', en: 'F' },
  'label.t': { ko: 't', en: 't' },
  'label.zero': { ko: '0', en: '0' },

  'caption.approach': {
    ko: '공이 벽을 향해 간다. 운동량 p 는 왼쪽을 향한다.',
    en: 'The ball heads for the wall. Its momentum p points left.',
  },
  'caption.stop': {
    ko: '벽이 미는 동안 힘-시간 넓이 J 가 쌓이고, 운동량 화살표는 쌓인 넓이만큼 오른쪽으로 옮겨 간다.',
    en: 'While the wall pushes, the force–time area J builds up, and the momentum arrow shifts right by exactly that much.',
  },
  'caption.rebound': {
    ko: '넓이가 처음 운동량만큼 쌓인 순간 공이 멈췄다. 그 뒤로 쌓이는 넓이만큼 운동량이 반대쪽으로 자란다.',
    en: 'The ball stopped the moment the area matched its first momentum. Every bit of area after that grows the momentum the other way.',
  },
  'caption.leave': {
    ko: '튕겨 나간 공의 운동량 변화는 받은 넓이 J 와 같다 — 멈추는 몫과 되돌리는 몫을 합해 처음 운동량보다 길다.',
    en: 'The rebounding ball’s change in momentum equals the area J it received — stopping plus sending back, longer than the first momentum.',
  },
} satisfies Record<string, LocalizedText>);

export type ImpulseMomentumTheoremMessageKey = keyof typeof impulseMomentumTheoremMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: ImpulseMomentumTheoremMessageKey): LocalizedText =>
  impulseMomentumTheoremMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ImpulseMomentumTheoremMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const impulseMomentumTheoremSchema: BundleSchema = {
  id: IMPULSE_MOMENTUM_THEOREM_ID,
  title: text('label.title'),
  category: 'mechanics',
  timeModel: 'periodic',
  parameters: [],
  stages: [
    {
      id: 'wall-bounce',
      label: text('label.stage'),
      constants: {
        pInitial: P_INITIAL,
        restitution: RESTITUTION,
        contactTime: CONTACT_TIME,
        speedPerP: SPEED_PER_P,
      },
    },
  ],
  environments: [],
  views: [{ id: 'main', label: text('label.view'), default: true }],

  /**
   * 가로로 넓다 — 왼쪽 벽 · 공 · 운동량 수직선, 오른쪽 힘-시간 그래프. 두 판이
   * 같은 높이를 나눠 쓰므로 세로를 더 주면 그림만 작아진다.
   */
  canvas: { height: 380, minHeight: 340 },

  /**
   * 쓴 순서대로 겹친다 — 넓이 칸이 힘 곡선 **아래**, 공이 벽 **앞**에 와야 한다.
   * 층 순서로는 `region` 이 곡선 위로 올라온다.
   */
  drawOrder: 'scene',

  /** 도착한 순간 공이 이미 벽을 향해 굴러가는 중이다 (S-piece). */
  startAt: 0.5,

  /**
   * 한 주기 — 다가감 → 멈출 때까지 밀림 → 되밀림 → 튕겨 나감 → 흐려짐.
   *
   * 접촉은 실제로 순식간이라 `stop` · `rebound` 를 느리게 흘린다(`timeScale`). 두 단계의
   * 경계 기본값은 물리에서 끌어온다 — 넓이가 |p₀| 가 되는 순간이 곧 `stop` 의 끝이라
   * 「공이 멈췄다」 는 캡션이 화면과 어긋날 수 없다. 물리는 이 경계를 쓰지 않는다 —
   * 닿는 **시작** 시각(`start('stop')`)만 묻고 그 뒤는 접촉 시간으로 센다.
   */
  timeline: {
    phases: [
      { id: 'approach', duration: APPROACH, caption: key('caption.approach') },
      {
        id: 'stop',
        duration: STOP,
        timeScale: CONTACT_TIME_SCALE,
        caption: key('caption.stop'),
      },
      {
        id: 'rebound',
        duration: REBOUND,
        timeScale: CONTACT_TIME_SCALE,
        caption: key('caption.rebound'),
      },
      { id: 'leave', duration: LEAVE, caption: key('caption.leave') },
      { id: 'fade', duration: FADE, caption: key('caption.leave') },
    ],
  },

  /** 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 정리와 공식은 문단의 몫이다. */
  caption: {
    anchor: { screen: 'bottom-left', offset: [18, -4] },
    align: 'left',
    fontSize: 13,
    wrapWidth: 780,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  // 그리드 · 카메라 단추 · 제목 · 범례 없음(기본). 이 그림에서 재는 것은 화살표의
  // 길이와 넓이의 **같음**이고, 거리 눈금은 「몇 미터인가」 라는 다른 질문을 부른다.

  messages: impulseMomentumTheoremMessages,
};
