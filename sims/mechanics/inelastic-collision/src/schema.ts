// ========================================================================
// inelastic-collision — 선언
// ========================================================================
// 질문: 바닥에 떨어뜨린 공은 왜 놓은 높이까지 다시 올라오지 못하는가? 한 번
// 부딪힐 때 무엇이 얼마나 없어지는가?
//
// 답: 부딪힐 때마다 공은 **들어온 빠르기의 e 배로만** 튀어 나온다(e: 반발 계수).
// 올라가는 높이는 빠르기의 제곱을 따르므로 튀어 오르는 높이는 매번 e² 배로 준다.
// 모자란 높이만큼의 에너지가 그 한 번의 충돌 안에서 찌그러짐과 열로 빠져나갔다.
//
// 화면에서는 공 하나가 바닥을 여러 번 튄다. 꼭짓점마다 h · e²h · e⁴h … 가 붙고,
// 바로 앞 꼭짓점 높이의 점선에서 모자란 만큼이 강조색 치수선으로 남는다.
//
// 이웃과의 경계 — 두 물체의 운동량은 그대로이고 에너지만 충돌 종류에 따라 갈린다는
// 구분은 `energy-in-collision`, 붙어서 함께 가는 끝점은 `perfectly-inelastic-collision`,
// 아무것도 사라지지 않는 끝점은 `elastic-collision` 의 몫이다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:inelastic-collision` 와 문자 그대로 일치한다 (C4). */
export const INELASTIC_COLLISION_ID = 'inelastic-collision';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 공을 놓는 높이(m) — 공 밑면에서 바닥까지. */
export const DROP_HEIGHT = 1.5;
/**
 * 공과 바닥 사이의 반발 계수. 튀어 오르는 높이가 매번 e² = 0.64 배가 된다.
 *
 * 0.8 은 꼭짓점 다섯 개(h ~ e⁸h)가 한 화면에서 모두 읽히는 값이다. 더 작으면 세 번째
 * 꼭짓점부터 바닥에 붙어 「매번 같은 비율」 이 두 점으로만 서고, 더 크면 한 번에 줄어드는
 * 몫이 좁아 「모자란 높이」 가 선처럼 가늘어진다.
 */
export const RESTITUTION = 0.8;
/** 중력 가속도(m/s²). */
export const GRAVITY = 9.8;
/**
 * 공이 옆으로 가는 빠르기(m/s). 바닥이 매끄러워 부딪혀도 바뀌지 않는다.
 * 꼭짓점을 옆으로 펼쳐 한 화면에 늘어놓는 일을 한다 — 제자리에서 튀면 궤적이 한 줄에 겹친다.
 * 1.25 는 가로로 넓은 임베드(세로가 먼저 차는 프레이밍)의 가로를 궤적이 거의 다 쓰는 값이다.
 */
export const DRIFT_SPEED = 1.25;

// ------------------------------------------------------------------------
// 배치 — 월드 1 단위 = 1 m. 원점은 공을 놓는 자리 바로 아래 바닥.
// ------------------------------------------------------------------------

/** 공 반지름(m). 궤적 · 높이 점선은 공 중심을 지난다. */
export const BALL_R = 0.08;
/** 첫 충돌 자리에 남기는 v · ev 화살표의 배율(월드 m 당 m/s). */
export const ARROW_SCALE = 0.1;
/** 그 두 화살표를 착지점에서 좌우로 띄우는 거리(m). 궤적의 V 바깥에 선다. */
export const ARROW_SPREAD = 0.15;
/** 착지 파문이 옅어지기까지(물리 시간, 초). */
export const RING_LIFE = 0.6;
/**
 * 프레이밍 여백(m). 왼쪽은 `h` 이름표, 오른쪽은 공이 멈춘 뒤의 자리, 위는 꼭짓점 이름표,
 * 아래는 `e` 표식과 캡션 줄 몫이다 (G24). 가로 끝은 선언된 상수에서 한 번 정해진다.
 */
export const FRAME_PAD = { left: 0.55, right: 0.45, top: 0.32, bottom: 0.72 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const inelasticCollisionMessages = Object.freeze({
  'label.title': { ko: '비탄성 충돌', en: 'Inelastic collision' },
  'label.operation': { ko: '에너지가 사라지는 충돌', en: 'A collision that loses energy' },
  'label.stage': { ko: '바닥에 떨어뜨린 공', en: 'A ball dropped on the floor' },
  'label.view': { ko: '튀는 공', en: 'Bouncing ball' },

  /** 반발 계수. 기호와 수라 번역 대상이 아니다 (C1 판정 3). */
  'label.restitution': { ko: 'e = {e}', en: 'e = {e}' },
  /** 꼭짓점 높이 — 기호라 번역 대상이 아니다 (C1 판정 3). 이름표가 있는 꼭짓점까지만 잰다. */
  'label.apex0': { ko: 'h', en: 'h' },
  'label.apex1': { ko: 'e²h', en: 'e²h' },
  'label.apex2': { ko: 'e⁴h', en: 'e⁴h' },
  'label.apex3': { ko: 'e⁶h', en: 'e⁶h' },
  'label.apex4': { ko: 'e⁸h', en: 'e⁸h' },
  /** 첫 충돌에 들어온 빠르기와 튀어 나간 빠르기. 기호다. */
  'label.vIn': { ko: 'v', en: 'v' },
  'label.vOut': { ko: 'ev', en: 'ev' },
  /** 앞 꼭짓점 높이에서 모자란 만큼 — 강조색 치수선 곁. */
  'label.lost': { ko: '사라진 에너지', en: 'Energy lost' },

  'caption.fall': {
    ko: '높이 h 에서 놓은 공이 바닥으로 떨어진다.',
    en: 'A ball let go from height h falls to the floor.',
  },
  'caption.bounce': {
    ko: '부딪힐 때마다 공은 들어온 빠르기의 e 배로만 튀어 나온다 — 그래서 매번 앞 꼭짓점보다 낮게 오른다.',
    en: 'Each time it hits, the ball leaves at only e times the speed it arrived with — so every peak falls short of the one before.',
  },
  'caption.hold': {
    ko: '꼭짓점이 매번 e² 배로 낮아졌다. 모자란 높이만큼의 에너지가 부딪힐 때마다 찌그러짐과 열로 빠져나갔다.',
    en: 'Each peak is e² times the last. At every impact, the energy for the missing height went into squashing and heat.',
  },
} satisfies Record<string, LocalizedText>);

export type InelasticCollisionMessageKey = keyof typeof inelasticCollisionMessages;

/**
 * 꼭짓점 이름표 키 — 놓은 높이부터. 이름표가 있는 꼭짓점까지만 높이 점선 · 모자란 높이를
 * 잰다. 그 뒤의 작은 튐은 궤적만 남는다(재면 치수선 끝 표시끼리 겹친다, G103).
 */
export const APEX_KEYS = [
  'label.apex0',
  'label.apex1',
  'label.apex2',
  'label.apex3',
  'label.apex4',
] as const satisfies readonly InelasticCollisionMessageKey[];

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: InelasticCollisionMessageKey): LocalizedText => inelasticCollisionMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: InelasticCollisionMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const inelasticCollisionSchema: BundleSchema = {
  id: INELASTIC_COLLISION_ID,
  label: text('label.title'),
  category: 'mechanics',
  operation: text('label.operation'),
  timeModel: 'periodic',
  parameters: [],
  stages: [
    {
      id: 'dropped-ball',
      label: text('label.stage'),
      constants: {
        height: DROP_HEIGHT,
        restitution: RESTITUTION,
        gravity: GRAVITY,
        drift: DRIFT_SPEED,
      },
    },
  ],
  environments: [],
  views: [{ id: 'bouncing-ball', label: text('label.view'), default: true }],

  /** 가로로 넓다 — 꼭짓점이 옆으로 늘어선다. 세로는 놓은 높이 하나면 된다. */
  canvas: { height: 360, minHeight: 320 },

  /** 도착한 순간 이미 공이 떨어지는 중이다 (S-piece). `appear` 0.4 + 낙하 0.2 초. */
  startAt: 0.6,

  /**
   * 한 주기. `fall` · `bounce` 의 길이는 **물리 시간**이다 — 두 단계를 이어 붙인 것이
   * 공의 시계이고, 기본 상수(h = 1.5 m, e = 0.8)에서 `fall` 은 바닥에 닿기까지 0.55 초,
   * `bounce` 는 그 뒤 공이 튐을 멈추기까지 4.43 초다. 저작자가 상수를 바꾸면 이 둘도
   * 함께 고쳐야 한다(선언이 따라가지 못한다, G13 · G80). 짧으면 공이 튀던 자리에서 멈춰
   * 서고, 길면 바닥에 멈춘 채 기다린다 — 어느 쪽도 그림이 틀리지는 않는다.
   *
   * - `appear` — 놓는 자리에서 공이 나타난다.
   * - `fall` — 떨어진다. 0.6 배로 느리게 흘려 본다.
   * - `bounce` — 튄다. 꼭짓점마다 이름표 · 앞 높이 점선 · 모자란 높이가 선다.
   * - `hold` — 멈춘 공과 궤적 전체. 꼭짓점을 한꺼번에 견준다.
   * - `fade` — 옅어지며 물러난다.
   */
  timeline: {
    phases: [
      { id: 'appear', duration: 0.4, caption: key('caption.fall') },
      { id: 'fall', duration: 0.553, timeScale: 0.6, caption: key('caption.fall') },
      { id: 'bounce', duration: 4.426, timeScale: 0.6, caption: key('caption.bounce') },
      { id: 'hold', duration: 4.0, caption: key('caption.hold') },
      { id: 'fade', duration: 0.6, caption: key('caption.hold') },
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

  // 그리드 · 카메라 단추 · 제목 · 범례 없음(기본). 견주는 것은 꼭짓점 높이의 비이고,
  // 이름표(h · e²h …)가 그 비를 말한다. 눈금으로 절대 높이를 재게 하지 않는다 (S-piece).

  messages: inelasticCollisionMessages,
};
