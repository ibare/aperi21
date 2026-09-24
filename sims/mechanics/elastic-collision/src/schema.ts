// ========================================================================
// elastic-collision — 선언
// ========================================================================
// 질문: 같은 질량끼리 탄성 충돌하면 부딪친 뒤의 속도는 어떻게 되는가?
//
// 답: 두 공이 속도를 **통째로 주고받는다.** 달려온 공은 그 자리에 멈추고 맞은 공이
// 같은 빠르기로 떠난다. 둘 다 움직이고 있었다면 서로의 속도를 바꿔 가진다.
//
// 화면에서는 공 위의 속도 화살표가 **옮겨 간다.** 닿아 있는 짧은 동안(느리게 흘린다)
// 한쪽 화살표가 줄어드는 만큼 다른 쪽이 자라고, 끝나면 `v` · `½v` 이름표가 주인을
// 바꿔 달고 있다.
//
// 자유 구현 원본 없이 엔진 어휘 위에서 바로 지었다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:elastic-collision` 와 문자 그대로 일치한다 (C4). */
export const ELASTIC_COLLISION_ID = 'elastic-collision';

// ------------------------------------------------------------------------
// 치수 — 월드 단위. 물리량이 아니라 그림의 배치다.
// ------------------------------------------------------------------------

/** 레일 높이. 공이 이 위를 구른다. */
export const RAIL_Y = 0;
/** 공의 반지름. 두 공은 같은 질량이라 같은 크기다. */
export const BALL_R = 0.3;
/** 속도 화살표가 놓이는 높이 — 공 꼭대기 조금 위. */
export const ARROW_Y = RAIL_Y + 2 * BALL_R + 0.26;
/** 속력 1 이 만드는 화살표 길이. 길이가 곧 빠르기다. */
export const ARROW_PER_SPEED = 0.7;

// ------------------------------------------------------------------------
// 운동 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 두 공의 질량. 같아야 이 조각의 주장(통째로 주고받는다)이 선다. */
export const MASS_A = 1;
export const MASS_B = 1;
/** 기준 빠르기 v (월드/초). */
export const SPEED = 1.3;

// ------------------------------------------------------------------------
// 프레이밍 — 매 프레임 같은 값이다 (S-piece, 프레이밍은 주장의 일부다).
//
// 가로는 첫 공이 나타나는 자리부터 떠난 공의 화살표 끝까지만 담는다. 여유를 주면
// 공과 화살표가 작아져 길이 비교가 흐려진다. 아래쪽 0.72 는 질량 표식과 캔버스 안
// 캡션 줄의 몫 (장부 G24).
// ------------------------------------------------------------------------

export const SCENE_BOUNDS = { minX: -3.5, maxX: 3.15, minY: -0.72, maxY: 1.25 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const elasticCollisionMessages = Object.freeze({
  'label.title': {
    ko: '탄성 충돌',
    en: 'Elastic collision',
    ja: '弾性衝突',
    zh: '弹性碰撞',
    ar: 'التصادم المرن',
    es: 'Choque elástico',
    fr: 'Collision élastique',
    hi: 'प्रत्यास्थ टक्कर',
    id: 'Tumbukan lenting sempurna',
    pt: 'Colisão elástica',
  },
  'label.operation': {
    ko: '운동 에너지까지 보존되는 충돌',
    en: 'A collision that keeps even the kinetic energy',
    ja: '運動エネルギーまで保存される衝突',
    zh: '连动能也守恒的碰撞',
    ar: 'تصادم يحفظ حتى الطاقة الحركية',
    es: 'Un choque que conserva incluso la energía cinética',
    fr: 'Une collision qui conserve même l’énergie cinétique',
    hi: 'ऐसी टक्कर जिसमें गतिज ऊर्जा भी संरक्षित रहती है',
    id: 'Tumbukan yang bahkan energi kinetiknya tetap kekal',
    pt: 'Uma colisão que conserva até a energia cinética',
  },
  'label.stage': {
    ko: '레일 위 같은 공 둘',
    en: 'Two equal balls on a rail',
    ja: 'レール上の同じ球二つ',
    zh: '导轨上两个相同的球',
    ar: 'كرتان متماثلتان على سكة',
    es: 'Dos bolas iguales sobre un riel',
    fr: 'Deux boules identiques sur un rail',
    hi: 'पटरी पर दो समान गेंदें',
    id: 'Dua bola sama di atas rel',
    pt: 'Duas bolas iguais sobre um trilho',
  },
  'label.view': {
    ko: '속도 화살표',
    en: 'Velocity arrows',
    ja: '速度の矢印',
    zh: '速度箭头',
    ar: 'أسهم السرعة',
    es: 'Flechas de velocidad',
    fr: 'Flèches de vitesse',
    hi: 'वेग-तीर',
    id: 'Panah kecepatan',
    pt: 'Setas de velocidade',
  },

  // 표식 — 공 아래 질량, 화살표 위 빠르기 기호. 번역하면 화면과 어긋난다 (C1 판정표 3).
  'label.mass': {
    ko: 'm',
    en: 'm',
    ja: 'm',
    zh: 'm',
    ar: 'm',
    es: 'm',
    fr: 'm',
    hi: 'm',
    id: 'm',
    pt: 'm',
  },
  'label.v': {
    ko: 'v',
    en: 'v',
    ja: 'v',
    zh: 'v',
    ar: 'v',
    es: 'v',
    fr: 'v',
    hi: 'v',
    id: 'v',
    pt: 'v',
  },
  'label.halfV': {
    ko: '½v',
    en: '½v',
    ja: '½v',
    zh: '½v',
    ar: '½v',
    es: '½v',
    fr: '½v',
    hi: '½v',
    id: '½v',
    pt: '½v',
  },

  'caption.approachRest': {
    ko: '왼쪽 공이 v 로 달려와, 멈춰 있는 같은 질량의 공에 부딪친다.',
    en: 'The left ball runs in at v and strikes an equal ball at rest.',
    ja: '左の球が v で走ってきて、止まっている同じ質量の球にぶつかる。',
    zh: '左边的球以 v 驶来，撞上一个静止的相同的球。',
    ar: 'تندفع الكرة اليسرى بالسرعة v وتصطدم بكرة مماثلة ساكنة.',
    es: 'La bola izquierda llega con velocidad v y choca con una bola igual en reposo.',
    fr: 'La boule de gauche arrive à la vitesse v et heurte une boule identique au repos.',
    hi: 'बाईं गेंद v से आती है और विराम में पड़ी एक समान गेंद से टकराती है।',
    id: 'Bola kiri melaju dengan v dan menabrak bola yang sama yang sedang diam.',
    pt: 'A bola da esquerda chega com v e atinge uma bola igual em repouso.',
  },
  'caption.contact': {
    ko: '닿아 있는 짧은 순간 — 한쪽 화살표가 줄어드는 만큼 다른 쪽 화살표가 자란다.',
    en: 'For the brief moment they touch, one arrow shrinks exactly as the other grows.',
    ja: '触れ合っている短い間、一方の矢印が縮んだ分だけもう一方の矢印が伸びる。',
    zh: '在两球接触的短暂瞬间，一个箭头缩短多少，另一个就伸长多少。',
    ar: 'في اللحظة القصيرة التي تتلامسان فيها، يقصر أحد السهمين بقدر ما يطول الآخر تمامًا.',
    es: 'Durante el breve instante en que se tocan, una flecha se acorta exactamente lo que la otra crece.',
    fr: 'Pendant le bref instant où elles se touchent, une flèche raccourcit exactement autant que l’autre s’allonge.',
    hi: 'छूने के उस छोटे-से क्षण में एक तीर ठीक उतना छोटा होता है जितना दूसरा बड़ा होता है।',
    id: 'Selama sesaat keduanya bersentuhan, satu panah memendek tepat sebanyak panah lain memanjang.',
    pt: 'No breve instante em que se tocam, uma seta encolhe exatamente o quanto a outra cresce.',
  },
  'caption.afterRest': {
    ko: '부딪친 공은 그 자리에 멈추고, 맞은 공이 v 를 줄지 않은 채 그대로 받아 떠난다.',
    en: 'The striking ball stops dead, and the struck ball leaves with the whole v, undiminished.',
    ja: 'ぶつかった球はその場で止まり、ぶつけられた球が v をそっくりそのまま受け取って去っていく。',
    zh: '撞击的球当场停住，被撞的球带着完整的 v 离开，丝毫未减。',
    ar: 'تتوقف الكرة الضاربة في مكانها تمامًا، وتنطلق الكرة المضروبة بكامل v دون نقصان.',
    es: 'La bola que golpea se detiene en seco, y la golpeada sale con toda la v, sin mengua.',
    fr: 'La boule qui frappe s’arrête net, et la boule frappée repart avec tout le v, sans perte.',
    hi: 'टकराने वाली गेंद वहीं रुक जाती है, और जिस गेंद से वह टकराई वह पूरे v के साथ, बिना घटे, चल देती है।',
    id: 'Bola penabrak berhenti seketika, dan bola yang ditabrak pergi membawa seluruh v tanpa berkurang.',
    pt: 'A bola que atinge para na hora, e a bola atingida parte com todo o v, sem perda.',
  },
  'caption.approachBoth': {
    ko: '이번에는 둘 다 움직인다 — 왼쪽 공은 v, 오른쪽 공은 ½v 로 마주 온다.',
    en: 'Now both are moving — the left ball at v, the right ball at ½v, head-on.',
    ja: '今度は両方が動いている — 左の球は v、右の球は ½v で向かい合って進む。',
    zh: '这次两球都在运动——左球以 v、右球以 ½v 迎面相向。',
    ar: 'الآن تتحرك الكرتان كلتاهما — اليسرى بالسرعة v واليمنى بالسرعة ½v، وجهًا لوجه.',
    es: 'Ahora ambas se mueven — la bola izquierda a v y la derecha a ½v, de frente.',
    fr: 'Cette fois, les deux bougent — la boule de gauche à v, celle de droite à ½v, l’une vers l’autre.',
    hi: 'अब दोनों चल रही हैं — बाईं गेंद v से, दाईं गेंद ½v से, आमने-सामने।',
    id: 'Kini keduanya bergerak — bola kiri dengan v, bola kanan dengan ½v, saling berhadapan.',
    pt: 'Agora as duas se movem — a bola da esquerda a v, a da direita a ½v, de frente.',
  },
  'caption.afterBoth': {
    ko: '두 공이 속도를 통째로 바꿔 가졌다 — 왼쪽 공은 ½v 로 되돌아가고, 오른쪽 공이 v 로 떠난다.',
    en: 'The two balls have traded velocities outright — the left one heads back at ½v, the right one leaves at v.',
    ja: '二つの球は速度をそっくり交換した — 左の球は ½v で戻り、右の球が v で去っていく。',
    zh: '两球完全交换了速度——左球以 ½v 返回，右球以 v 离开。',
    ar: 'تبادلت الكرتان سرعتيهما بالكامل — تعود اليسرى بالسرعة ½v، وتنطلق اليمنى بالسرعة v.',
    es: 'Las dos bolas intercambiaron sus velocidades por completo — la izquierda regresa a ½v y la derecha se va a v.',
    fr: 'Les deux boules ont échangé leurs vitesses d’un bloc — celle de gauche repart à ½v, celle de droite s’en va à v.',
    hi: 'दोनों गेंदों ने अपने वेग पूरे-के-पूरे आपस में बदल लिए — बाईं ½v से लौटती है, दाईं v से चल देती है।',
    id: 'Kedua bola bertukar kecepatan sepenuhnya — bola kiri kembali dengan ½v, bola kanan pergi dengan v.',
    pt: 'As duas bolas trocaram de velocidade por inteiro — a da esquerda volta a ½v, a da direita parte a v.',
  },
} satisfies Record<string, LocalizedText>);

export type ElasticCollisionMessageKey = keyof typeof elasticCollisionMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: ElasticCollisionMessageKey): LocalizedText => elasticCollisionMessages[key];

/** 캡션 슬롯 · 시간표가 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ElasticCollisionMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// 두 번의 충돌 — 시간표 단계 묶음과 처음 속도
// ------------------------------------------------------------------------

/**
 * 한 주기에 충돌이 두 번이다. 멈춘 공에 한 번, 마주 오는 공에 한 번.
 *
 * 첫 번째만으로는 「달려온 공이 제 속도를 건넸다」 로도 읽힌다. 두 번째에서 맞은 공이
 * 제 속도(½v)를 **되돌려 주는** 것까지 보여야 「주고받는다」 가 선다. 조작기 없이
 * 시간표가 둘을 차례로 보인다 (S-piece — 아무것도 누르지 않아도 할 말을 마친다).
 *
 * 단계 이름을 여기에 모아 두므로 scene 은 단계 경계 상수를 갖지 않는다.
 */
/**
 * 두 충돌의 처음 속도 — 기준 빠르기 v 의 배수, 오른쪽이 +. 스테이지 상수의 기본값이다.
 * 저작자가 스테이지에서 바꾼다 (원칙 2) — 두 번째 충돌의 ½v 도 선언이다.
 */
export const EPISODE_UNITS = {
  restUnitsA: 1,
  restUnitsB: 0,
  bothUnitsA: 1,
  bothUnitsB: -0.5,
} as const;

export type EpisodeUnitsKey = keyof typeof EPISODE_UNITS;

export interface EpisodeDef {
  /** 처음 속도를 담은 스테이지 상수의 이름 (`EPISODE_UNITS`). */
  unitsA: EpisodeUnitsKey;
  unitsB: EpisodeUnitsKey;
  /** 두 공이 맞닿는 자리(월드 x). */
  contactX: number;
  /** 처음 속도에 붙는 이름표. 속도가 0 이면 없다. */
  labelA?: ElasticCollisionMessageKey;
  labelB?: ElasticCollisionMessageKey;
  phases: {
    /** 나타나는 동안. */
    appear: string;
    /** 마주 달려오는 동안. */
    approach: string;
    /** 맞닿아 속도가 옮겨 가는 동안. */
    contact: string;
    /** 떨어져 가는 동안. */
    apart: string;
    /** 사라지는 동안. */
    fade: string;
  };
}

export const EPISODES: readonly EpisodeDef[] = [
  {
    unitsA: 'restUnitsA',
    unitsB: 'restUnitsB',
    contactX: -0.7,
    labelA: 'label.v',
    phases: {
      appear: 'appear-rest',
      approach: 'approach-rest',
      contact: 'contact-rest',
      apart: 'apart-rest',
      fade: 'fade-rest',
    },
  },
  {
    unitsA: 'bothUnitsA',
    unitsB: 'bothUnitsB',
    contactX: -0.7,
    labelA: 'label.v',
    labelB: 'label.halfV',
    phases: {
      appear: 'appear-both',
      approach: 'approach-both',
      contact: 'contact-both',
      apart: 'apart-both',
      fade: 'fade-both',
    },
  },
];

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const elasticCollisionSchema: BundleSchema = {
  id: ELASTIC_COLLISION_ID,
  label: text('label.title'),
  category: 'mechanics',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다. 두 경우를 시간표가 차례로 보이므로 독자가 고를 것이 없다.
  parameters: [],

  stages: [
    {
      id: 'rail',
      label: text('label.stage'),
      constants: { massA: MASS_A, massB: MASS_B, speed: SPEED, ...EPISODE_UNITS },
    },
  ],

  environments: [],

  views: [{ id: 'arrows', label: text('label.view'), default: true }],

  /**
   * 가로 6.65 월드에 공(0.6) · 화살표 줄 · 캡션 줄이 얹힌 비율이다. 가로가 먼저 찬다 —
   * 세로를 더 잡으면 위아래 빈 띠만 는다.
   */
  canvas: { height: 320, minHeight: 300 },

  /** 도착한 순간 이미 공이 달려오는 중이다 (S-piece). */
  startAt: 0.8,

  /**
   * 한 주기 7.32 초(조각 시계). 충돌 두 번이 같은 순서로 일어난다 —
   * 나타나고 · 달려오고 · 맞닿아 속도가 옮겨 가고 · 떨어져 가고 · 사라진다.
   *
   * `contact` 만 0.12 배로 느리게 흐른다. 맞닿아 있는 것은 한순간(0.16 초)이라 실시간으로는
   * 화살표가 옮겨 가는 것을 눈으로 볼 수 없다. 화면에서는 1.33 초다. 이징은 선형으로 둔다 —
   * 옮겨 가는 모양(코사인)은 물리가 정하고, 여기에 이징을 더 걸면 두 번 휜다.
   */
  timeline: {
    phases: [
      { id: 'appear-rest', duration: 0.3, caption: key('caption.approachRest') },
      { id: 'approach-rest', duration: 1.3, caption: key('caption.approachRest') },
      {
        id: 'contact-rest',
        duration: 0.16,
        timeScale: 0.12,
        caption: key('caption.contact'),
      },
      { id: 'apart-rest', duration: 1.5, caption: key('caption.afterRest') },
      { id: 'fade-rest', duration: 0.4, caption: key('caption.afterRest') },
      { id: 'appear-both', duration: 0.3, caption: key('caption.approachBoth') },
      { id: 'approach-both', duration: 1.3, caption: key('caption.approachBoth') },
      {
        id: 'contact-both',
        duration: 0.16,
        timeScale: 0.12,
        caption: key('caption.contact'),
      },
      { id: 'apart-both', duration: 1.5, caption: key('caption.afterBoth') },
      { id: 'fade-both', duration: 0.4, caption: key('caption.afterBoth') },
    ],
  },

  /** 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 (S-piece). */
  caption: {
    anchor: { screen: 'bottom-left', offset: [18, -8] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 720,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  // 그리드 · 카메라 단추 · 제목 · 범례 없음(기본). 잴 것이 레일 위 거리가 아니라
  // 화살표의 길이와 그 주인이라, 그리드는 「여기서 거리를 재라」 는 잘못된 지시가 된다.

  messages: elasticCollisionMessages,
};
