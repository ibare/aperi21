// ========================================================================
// conical-pendulum — 선언
// ========================================================================
// 질문: 줄 길이가 다른 세 추를 같은 빠르기로 돌리면 어느 높이에서 도는가.
//
// 원뿔 진자의 정상 상태는 ω² = g / h 다 (h 는 매단 점에서 추까지의 깊이).
// 줄 길이가 빠져 있으므로 같은 빠르기면 세 추가 **한 높이**에서 돈다. 빨리 돌수록
// 그 높이가 함께 올라가고, 긴 줄은 같은 높이에 닿으려고 더 많이 눕는다.
//
// 원본: tasks/piece-lab/conical-pendulum (엔진 없이 손으로 짠 것).
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:conical-pendulum` 와 문자 그대로 일치한다 (C4). */
export const CONICAL_PENDULUM_ID = 'conical-pendulum';

// ------------------------------------------------------------------------
// 확정값 — 원본 상수 그대로
// ------------------------------------------------------------------------

export const G = 9.8;
/** 세 줄의 길이(m). 세 줄이 겹치지 않고 눕는 차이가 보이게 원본이 고른 값. */
export const LENGTHS: readonly number[] = [0.5, 0.8, 1.2];
/** 가장 느릴 때의 깊이(m) — 가장 짧은 줄(0.5)보다 얕다. 아니면 짧은 줄이 곧게 매달려 "한 높이" 가 깨진다. */
export const H_SLOW = 0.45;
/** 가장 빠를 때의 깊이(m). */
export const H_FAST = 0.17;
/** 자동 진행 한 바퀴 — 느림 → 빠름 → 느림 (s). */
export const CYCLE = 12;
/** 내려다보는 각(도). 정면이면 원운동이 좌우 왕복으로만, 위에서면 높이가 안 보인다. */
export const ELEVATION_DEG = 14;
/** 세 궤도를 모두 품는 평면의 반지름(m). 가장 긴 줄보다 조금 크다. */
export const PLANE_RADIUS = 1.28;

/** 약 4.67 rad/s. */
export const W_MIN = Math.sqrt(G / H_SLOW);
/** 약 7.59 rad/s. */
export const W_MAX = Math.sqrt(G / H_FAST);

/**
 * 원본이 화면 px 로 그린 치수를 월드로 옮길 때의 배율(px/m).
 *
 * 원본 `view()` 가 868 × 340 캔버스에서 고르는 배율이 288 이다. 축 윗끝 · 손잡이 ·
 * 추 반지름처럼 원본이 px 로 박은 것을 이 값으로 나눠 월드에 둔다 — 아래 경계가 같은
 * 배율을 내도록 잡혀 있어 화면에서 원본과 같은 크기가 된다.
 */
export const PPM = 288;

/**
 * 고정 경계(월드 m). 세로 위가 양수, 매단 점이 원점이다.
 *
 * - 가로 ±1.35 — 원본 `W / 2.7`.
 * - 위 0.385 — 원본 축 윗끝(캔버스 4 px).
 * - 아래 −1.0 — 가장 깊은 평면의 앞 가장자리(−0.746) 아래에 캡션 한 줄과 조절기 자리를 둔다.
 *   원본은 둘이 캔버스 밖 DOM 이었다.
 */
export const SCENE_BOUNDS = { minX: -1.35, maxX: 1.35, minY: -1.0, maxY: 0.385 } as const;

/** 캡션 자리(월드). 원본 캔버스 왼쪽 끝 아래 첫 줄. */
export const CAPTION_AT = [-1.35, -0.84] as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const conicalPendulumMessages = Object.freeze({
  'label.title': {
    ko: '원뿔 진자',
    en: 'Conical pendulum',
    ja: '円錐振り子',
    zh: '圆锥摆',
    ar: 'البندول المخروطي',
    es: 'Péndulo cónico',
    fr: 'Pendule conique',
    hi: 'शंक्वाकार लोलक',
    id: 'Bandul kerucut',
    pt: 'Pêndulo cônico',
  },
  'label.operation': {
    ko: '장력과 중력이 만드는 원운동',
    en: 'Circular motion from tension and gravity',
    ja: '張力と重力がつくる円運動',
    zh: '由张力和重力产生的圆周运动',
    ar: 'حركة دائرية من قوة الشد والجاذبية',
    es: 'Movimiento circular por la tensión y la gravedad',
    fr: 'Mouvement circulaire dû à la tension et à la pesanteur',
    hi: 'तनाव और गुरुत्व से वृत्तीय गति',
    id: 'Gerak melingkar dari tegangan tali dan gravitasi',
    pt: 'Movimento circular pela tração e pela gravidade',
  },
  'label.stage': {
    ko: '기본',
    en: 'Default',
    ja: '標準',
    zh: '默认',
    ar: 'افتراضي',
    es: 'Predeterminada',
    fr: 'Par défaut',
    hi: 'डिफ़ॉल्ट',
    id: 'Bawaan',
    pt: 'Padrão',
  },
  'label.view': {
    ko: '기본',
    en: 'Default',
    ja: '標準',
    zh: '默认',
    ar: 'افتراضي',
    es: 'Predeterminada',
    fr: 'Par défaut',
    hi: 'डिफ़ॉल्ट',
    id: 'Bawaan',
    pt: 'Padrão',
  },
  'label.speed': {
    ko: '돌리는 빠르기',
    en: 'Spin speed',
    ja: '回す速さ',
    zh: '转速',
    ar: 'سرعة الدوران',
    es: 'Rapidez de giro',
    fr: 'Vitesse de rotation',
    hi: 'घुमाने की चाल',
    id: 'Kelajuan putaran',
    pt: 'Velocidade de giro',
  },
  /** 고정 한 문장 — 상태로 바꾸지 않아 어느 순간에도 화면과 어긋나지 않는다 (원본 결정). */
  'caption.main': {
    ko: '줄 길이가 달라도 같은 빠르기로 돌면 세 추는 한 높이에서 돈다 — 빨리 돌수록 그 높이가 함께 올라간다',
    en: 'Whatever the string length, bobs spun at the same rate circle at one height — spin faster and that height rises for all three',
    ja: '糸の長さが違っても、同じ速さで回るおもりは同じ高さで回る — 速く回すほど、その高さが三つそろって上がる',
    zh: '无论绳长多少，以相同快慢旋转的摆球都在同一高度上转圈 — 转得越快，三个摆球的这一高度一起升高',
    ar: 'مهما كان طول الخيط، تدور الثقالات المُدارة بالمعدّل نفسه على ارتفاع واحد — أدِرها أسرع فيرتفع ذلك الارتفاع للثلاثة معًا',
    es: 'Sea cual sea la longitud del hilo, las masas que giran al mismo ritmo describen círculos a una misma altura — gíralas más rápido y esa altura sube para las tres',
    fr: 'Quelle que soit la longueur du fil, les masses tournant au même rythme décrivent leur cercle à une même hauteur — tournez plus vite et cette hauteur monte pour les trois',
    hi: 'डोरी की लंबाई कुछ भी हो, एक ही दर से घुमाए गए गोलक एक ही ऊँचाई पर चक्कर लगाते हैं — तेज़ घुमाएँ तो वह ऊँचाई तीनों के लिए बढ़ जाती है',
    id: 'Berapa pun panjang talinya, beban yang diputar dengan laju sama beredar pada satu ketinggian — putar lebih cepat dan ketinggian itu naik untuk ketiganya',
    pt: 'Seja qual for o comprimento do fio, os pesos girados no mesmo ritmo circulam a uma mesma altura — gire mais rápido e essa altura sobe para os três',
  },
} satisfies Record<string, LocalizedText>);

export type ConicalPendulumMessageKey = keyof typeof conicalPendulumMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 통로. */
export const text = (key: ConicalPendulumMessageKey): LocalizedText => conicalPendulumMessages[key];

/** 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ConicalPendulumMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const conicalPendulumSchema: BundleSchema = {
  id: CONICAL_PENDULUM_ID,
  label: text('label.title'),
  category: 'mechanics',
  operation: text('label.operation'),
  timeModel: 'periodic',
  parameters: [],
  stages: [
    {
      id: 'default',
      label: text('label.stage'),
      constants: {
        g: G,
        hSlow: H_SLOW,
        hFast: H_FAST,
        cycle: CYCLE,
        elevationDeg: ELEVATION_DEG,
        planeRadius: PLANE_RADIUS,
      },
    },
  ],
  environments: [],
  views: [{ id: 'default', label: text('label.view'), default: true }],

  /**
   * 원본 캔버스 340 px 아래에 캡션과 조절기가 DOM 으로 붙어 있었다. 엔진은 둘이 캔버스
   * 안에 놓이므로 그만큼 세로를 더 잡는다 — 경계와 함께 원본 배율 288 px/m 를 낸다.
   */
  canvas: { height: 470, minHeight: 420 },

  /**
   * 겹침이 원본 순서여야 한다 — 궤도 타원 · 축 · 평면 · 줄(뒤에서 앞으로) · 추(뒤에서 앞으로).
   * 비스듬히 내려다보는 그림이라 앞의 추가 뒤의 줄을 덮는 것이 깊이를 말한다.
   */
  drawOrder: 'scene',

  /**
   * 시간표가 없다. 원본의 자동 진행은 단계 경계가 아니라 12 초 코사인 한 곡선이고,
   * 회전각은 그 빠르기를 누적한 것이다 — `step` 이 상태에 쌓는다 (physics.ts).
   * 원본은 앞당기지 않고 0 초에서 가장 느리게 돌며 연다(돌고 있으므로 이미 진행 중).
   */

  caption: {
    anchor: { world: CAPTION_AT },
    align: 'left',
    fontSize: 15,
    style: { colorRole: 'ink', emphasis: 'strong' },
    text: key('caption.main'),
  },

  // 그리드 · 카메라 버튼 없음 (기본). 주장은 모양이지 거리가 아니다.

  messages: conicalPendulumMessages,
};
