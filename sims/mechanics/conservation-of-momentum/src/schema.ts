// ========================================================================
// conservation-of-momentum — 선언
// ========================================================================
// 질문: 부딪히는 동안 두 수레의 운동량은 크게 바뀌는데, 무엇이 그대로인가?
// 그리고 그것은 언제 바뀌는가?
//
// 답: 두 수레의 운동량 화살표를 이어 붙인 **끝**이 그대로다. 두 수레가 서로를
// 미는 힘은 계 안의 힘이라 한쪽이 얻는 만큼 다른 쪽이 잃는다. 계 밖의 벽이
// 밀 때에만 그 끝이 옮겨 간다.
//
// 에너지 이야기는 하지 않는다 — 이웃 조각(elastic-collision · energy-in-collision)의 몫이다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:conservation-of-momentum` 와 문자 그대로 일치한다 (C4). */
export const CONSERVATION_OF_MOMENTUM_ID = 'conservation-of-momentum';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 수레 A · B 의 질량(kg). B 가 두 배라 같은 힘을 받아도 속도가 반만 바뀐다. */
export const MASS_A = 1;
export const MASS_B = 2;
/**
 * 처음 속도(m/s). A 는 오른쪽으로, B 는 왼쪽으로 온다.
 * 운동량 0.8 과 −0.4 — 합 0.4 가 두 화살표보다 짧아 「이어 붙인 끝」 이 읽힌다.
 */
export const VEL_A = 0.8;
export const VEL_B = -0.2;

// ------------------------------------------------------------------------
// 배치 — 월드 1 단위 = 1 m. 레일 윗면이 y = 0.
// ------------------------------------------------------------------------

/** 수레 크기(m). 넓이가 질량을 따라 대략 두 배다. */
export const CART_A_W = 0.4;
export const CART_A_H = 0.26;
export const CART_B_W = 0.56;
export const CART_B_H = 0.37;
/** 용수철 높이(레일 위, m). 두 수레의 낮은 쪽 가운데쯤. */
export const SPRING_Y = 0.13;
/** B 의 왼쪽 범퍼 용수철 자연 길이(m). */
export const BUMPER_B = 0.6;
/** 벽의 범퍼 용수철 자연 길이(m). */
export const BUMPER_WALL = 0.35;
/** 두 수레가 닿기 시작하는 순간 A 의 중심 x. 다른 자리는 모두 이것과 시간표에서 나온다. */
export const CONTACT_A_X = -0.5;
/** 벽 높이와 벽 뒤 빗금 두께(m). */
export const WALL_H = 0.62;
export const WALL_T = 0.12;
/** 레일 오른쪽 끝(m). */
export const TRACK_END_X = 3.5;

/** 힘 화살표 배율(월드 m / N). */
export const FORCE_SCALE = 0.2;

// ------------------------------------------------------------------------
// 운동량 줄 — 두 화살표를 이어 붙이고 그 아래에 합을 둔다.
// ------------------------------------------------------------------------

/** 운동량 0 의 자리(월드 x). */
export const CHAIN_ORIGIN_X = -0.15;
/** 운동량 배율(월드 m / kg·m/s). */
export const CHAIN_SCALE = 1.5;
/** 줄 높이 — 위에서부터 A · B · 합. */
export const ROW_A_Y = 1.62;
export const ROW_B_Y = 1.34;
export const ROW_TOTAL_Y = 0.98;
/** 줄 이름을 놓는 자리(월드 x). 가장 왼쪽으로 가는 화살표보다 더 왼쪽. */
export const ROW_LABEL_X = -1.3;

/** 프레이밍 — 매 프레임 같은 값이다 (S-piece). 아래 여백은 캡션 줄 몫. */
export const SCENE_BOUNDS = { minX: -2.15, maxX: 3.5, minY: -0.62, maxY: 1.8 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const conservationOfMomentumMessages = Object.freeze({
  'label.title': {
    ko: '운동량 보존',
    en: 'Conservation of momentum',
    ja: '運動量保存',
    zh: '动量守恒',
    ar: 'حفظ الزخم',
    es: 'Conservación del momento lineal',
    fr: 'Conservation de la quantité de mouvement',
    hi: 'संवेग संरक्षण',
    id: 'Kekekalan momentum',
    pt: 'Conservação da quantidade de movimento',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '외력이 없을 때의 총 운동량',
    en: 'Total momentum when no external force acts',
    ja: '外力がはたらかないときの全運動量',
    zh: '没有外力作用时的总动量',
    ar: 'الزخم الكلي عندما لا تؤثر أي قوة خارجية',
    es: 'Momento lineal total cuando no actúa ninguna fuerza externa',
    fr: 'Quantité de mouvement totale en l’absence de force extérieure',
    hi: 'कोई बाह्य बल न लगने पर कुल संवेग',
    id: 'Momentum total ketika tidak ada gaya luar yang bekerja',
    pt: 'Quantidade de movimento total quando nenhuma força externa atua',
  },
  'label.stage': {
    ko: '두 수레와 벽',
    en: 'Two carts and a wall',
    ja: '2台の台車と壁',
    zh: '两辆小车和一面墙',
    ar: 'عربتان وجدار',
    es: 'Dos carritos y una pared',
    fr: 'Deux chariots et un mur',
    hi: 'दो ट्रॉलियाँ और एक दीवार',
    id: 'Dua troli dan sebuah dinding',
    pt: 'Dois carrinhos e uma parede',
  },
  'label.view': {
    ko: '이어 붙인 화살표',
    en: 'Arrows laid tip to tail',
    ja: '先端と始点をつないだ矢印',
    zh: '首尾相接的箭头',
    ar: 'أسهم موصولة رأسًا بذيل',
    es: 'Flechas unidas punta con cola',
    fr: 'Flèches mises bout à bout',
    hi: 'सिरे से पूँछ तक जोड़े गए तीर',
    id: 'Panah disambung ujung ke pangkal',
    pt: 'Setas ligadas ponta com cauda',
  },

  /** 수레 이름. 도식 기호라 번역 대상이 아니다 (C1 판정 3). */
  'label.cartA': {
    ko: 'A',
    en: 'A',
    ja: 'A',
    zh: 'A',
    ar: 'A',
    es: 'A',
    fr: 'A',
    hi: 'A',
    id: 'A',
    pt: 'A',
  },
  'label.cartB': {
    ko: 'B',
    en: 'B',
    ja: 'B',
    zh: 'B',
    ar: 'B',
    es: 'B',
    fr: 'B',
    hi: 'B',
    id: 'B',
    pt: 'B',
  },
  /** 운동량 0 의 자리. 기호다. */
  'label.zero': {
    ko: '0',
    en: '0',
    ja: '0',
    zh: '0',
    ar: '0',
    es: '0',
    fr: '0',
    hi: '0',
    id: '0',
    pt: '0',
  },
  /** 두 화살표를 이어 붙인 끝 — 계의 총 운동량. 강조색은 이 한 가지 뜻에만 쓴다. */
  'label.total': {
    ko: '합',
    en: 'Total',
    ja: '合計',
    zh: '总和',
    ar: 'المجموع',
    es: 'Total',
    fr: 'Total',
    hi: 'कुल',
    id: 'Total',
    pt: 'Total',
  },
  /** 처음 합의 끝 자리. 주기 내내 서 있다 — 합의 끝이 여기서 떠나는지를 잰다. */
  'label.start': {
    ko: '처음 합',
    en: 'Starting total',
    ja: '最初の合計',
    zh: '初始总和',
    ar: 'المجموع الابتدائي',
    es: 'Total inicial',
    fr: 'Total initial',
    hi: 'प्रारंभिक कुल',
    id: 'Total awal',
    pt: 'Total inicial',
  },

  'caption.approach': {
    ko: 'A 는 오른쪽, B 는 왼쪽으로 온다. 두 운동량 화살표를 이어 붙인 끝이 둘의 합이다.',
    en: 'A comes from the left, B from the right. Laying their momentum arrows tip to tail, the far end is the total.',
    ja: 'A は左から、B は右から来る。二つの運動量の矢印をつなぐと、その先端が合計だ。',
    zh: 'A 从左边来，B 从右边来。把两者的动量箭头首尾相接，最远的末端就是总和。',
    ar: 'تأتي A من اليسار و B من اليمين. عند وصل سهمي زخمهما رأسًا بذيل، يكون الطرف البعيد هو المجموع.',
    es: 'A viene desde la izquierda y B desde la derecha. Al unir sus flechas de momento lineal punta con cola, el extremo final es el total.',
    fr: 'A arrive par la gauche, B par la droite. En mettant bout à bout leurs flèches de quantité de mouvement, l’extrémité la plus éloignée donne le total.',
    hi: 'A बाईं ओर से आती है, B दाईं ओर से। उनके संवेग तीरों को सिरे से पूँछ तक जोड़ने पर दूर वाला सिरा कुल है।',
    id: 'A datang dari kiri, B dari kanan. Jika panah momentum keduanya disambung ujung ke pangkal, ujung terjauhnya adalah totalnya.',
    pt: 'A vem da esquerda, B da direita. Ligando suas setas de quantidade de movimento ponta com cauda, a extremidade final é o total.',

  },
  'caption.contact': {
    ko: '서로 미는 동안 A 의 화살표는 줄어 뒤집히고 B 의 것은 자란다 — 그래도 합의 끝은 움직이지 않는다.',
    en: 'While they push on each other, A’s arrow shrinks and flips and B’s grows — yet the end of the total does not move.',
    ja: '押し合う間、A の矢印は縮んで向きが反転し、B の矢印は伸びる — それでも合計の先端は動かない。',
    zh: '相互推挤时，A 的箭头缩短并反向，B 的箭头变长 — 但总和的末端一动不动。',
    ar: 'بينما تدفع كل منهما الأخرى، يقصر سهم A وينقلب ويطول سهم B — ومع ذلك لا يتحرك طرف المجموع.',
    es: 'Mientras se empujan, la flecha de A se acorta y se invierte y la de B crece — y aun así el extremo del total no se mueve.',
    fr: 'Pendant qu’ils se poussent, la flèche de A rétrécit et s’inverse et celle de B s’allonge — pourtant l’extrémité du total ne bouge pas.',
    hi: 'जब वे एक-दूसरे को धकेलती हैं, A का तीर छोटा होकर पलट जाता है और B का बढ़ता है — फिर भी कुल का सिरा नहीं हिलता।',
    id: 'Selama keduanya saling mendorong, panah A memendek lalu berbalik dan panah B memanjang — namun ujung totalnya tidak bergerak.',
    pt: 'Enquanto se empurram, a seta de A encolhe e se inverte e a de B cresce — mesmo assim a ponta do total não se move.',
  },
  'caption.apart': {
    ko: '떨어진 뒤에도 합은 처음 그대로다. 두 수레가 주고받은 힘은 계 안에서 서로 지웠다.',
    en: 'After they separate, the total is exactly what it was. The pushes they traded cancelled inside the system.',
    ja: '離れたあとも、合計は最初とまったく同じだ。二つが及ぼし合った力は系の内部で打ち消し合った。',
    zh: '分开之后，总和与原来完全相同。它们相互施加的推力在系统内部相互抵消了。',
    ar: 'بعد انفصالهما، يبقى المجموع كما كان تمامًا. فالدفعات التي تبادلتاها ألغت بعضها داخل النظام.',
    es: 'Después de separarse, el total es exactamente el de antes. Los empujes que intercambiaron se anularon dentro del sistema.',
    fr: 'Une fois séparés, le total est exactement le même qu’au départ. Les poussées qu’ils ont échangées se sont annulées à l’intérieur du système.',
    hi: 'अलग होने के बाद भी कुल ठीक पहले जितना है। उन्होंने आपस में जो धक्के दिए, वे निकाय के भीतर एक-दूसरे को निरस्त कर गए।',
    id: 'Setelah berpisah, totalnya tepat sama seperti semula. Dorongan yang mereka pertukarkan saling meniadakan di dalam sistem.',
    pt: 'Depois que se separam, o total é exatamente o que era. Os empurrões que trocaram se anularam dentro do sistema.',
  },
  'caption.wall': {
    ko: '벽은 계 밖에 있다. 벽이 A 를 미는 동안에는 합의 끝이 오른쪽으로 옮겨 간다.',
    en: 'The wall is outside the system. While it pushes A, the end of the total moves to the right.',
    ja: '壁は系の外にある。壁が A を押す間、合計の先端は右へ移る。',
    zh: '墙在系统之外。墙推 A 的时候，总和的末端向右移动。',
    ar: 'الجدار خارج النظام. وبينما يدفع A، ينتقل طرف المجموع إلى اليمين.',
    es: 'La pared está fuera del sistema. Mientras empuja a A, el extremo del total se desplaza hacia la derecha.',
    fr: 'Le mur est hors du système. Pendant qu’il pousse A, l’extrémité du total se déplace vers la droite.',
    hi: 'दीवार निकाय के बाहर है। जब वह A को धकेलती है, कुल का सिरा दाईं ओर खिसकता है।',
    id: 'Dinding berada di luar sistem. Selama dinding mendorong A, ujung total bergeser ke kanan.',
    pt: 'A parede está fora do sistema. Enquanto ela empurra A, a ponta do total se desloca para a direita.',
  },
  'caption.after': {
    ko: '바깥에서 민 만큼 총 운동량이 늘었다. 합을 바꾼 것은 벽 하나뿐이다.',
    en: 'The total grew by exactly the outside push. Only the wall changed it.',
    ja: '合計は外から押された分だけ増えた。合計を変えたのは壁だけだ。',
    zh: '总和恰好增加了外部推动的那么多。改变它的只有墙。',
    ar: 'ازداد المجموع بمقدار الدفعة الخارجية تمامًا. الجدار وحده هو الذي غيّره.',
    es: 'El total creció exactamente en el empuje exterior. Solo la pared lo cambió.',
    fr: 'Le total a augmenté exactement de la poussée extérieure. Seul le mur l’a modifié.',
    hi: 'कुल ठीक उतना ही बढ़ा जितना बाहर से धक्का मिला। उसे केवल दीवार ने बदला।',
    id: 'Total bertambah tepat sebesar dorongan dari luar. Hanya dinding yang mengubahnya.',
    pt: 'O total cresceu exatamente o empurrão de fora. Só a parede o mudou.',
  },
} satisfies Record<string, LocalizedText>);

export type ConservationOfMomentumMessageKey = keyof typeof conservationOfMomentumMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: ConservationOfMomentumMessageKey): LocalizedText =>
  conservationOfMomentumMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ConservationOfMomentumMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const conservationOfMomentumSchema: BundleSchema = {
  id: CONSERVATION_OF_MOMENTUM_ID,
  label: text('label.title'),
  category: 'mechanics',
  description: text('label.description'),
  timeModel: 'periodic',
  parameters: [],
  stages: [
    {
      id: 'carts-and-wall',
      label: text('label.stage'),
      constants: { massA: MASS_A, massB: MASS_B, velA: VEL_A, velB: VEL_B },
    },
  ],
  environments: [],
  views: [{ id: 'tip-to-tail', label: text('label.view'), default: true }],

  /** 가로로 넓다 — 레일 위를 수레가 오가고, 그 위에 운동량 줄 세 개. */
  canvas: { height: 380, minHeight: 340 },

  /** 도착한 순간 이미 두 수레가 다가오는 중이다 (S-piece). */
  startAt: 0.4,

  /**
   * 한 주기 7.3 초. 모든 단계가 실제 시간으로 흐른다(`timeScale` 없음) — 수레 자리는
   * 조각 시계의 함수이고, 단계 길이가 곧 물리다.
   *
   * - `enter` — 나타난다. 수레는 이미 달리고 있다.
   * - `approach` — 서로를 향해 온다.
   * - `contact` — 범퍼 용수철이 눌렸다 펴지는 동안. **이 길이가 곧 충돌 시간**이라
   *   늘이면 용수철이 무르게 된다(주고받는 운동량은 같다).
   * - `apart` — 떨어져 달린다. A 는 벽 쪽으로. 벽의 자리는 이 길이에서 나온다.
   * - `wall` — 벽 범퍼가 A 를 되민다. 계 밖의 힘.
   * - `after` · `fade` — 늘어난 합을 보이고 물러난다.
   */
  timeline: {
    phases: [
      { id: 'enter', duration: 0.3, caption: key('caption.approach') },
      { id: 'approach', duration: 0.7, caption: key('caption.approach') },
      { id: 'contact', duration: 1.2, caption: key('caption.contact') },
      { id: 'apart', duration: 2, caption: key('caption.apart') },
      { id: 'wall', duration: 1, caption: key('caption.wall') },
      { id: 'after', duration: 1.6, caption: key('caption.after') },
      { id: 'fade', duration: 0.5, caption: key('caption.after') },
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

  // 그리드 · 카메라 단추 · 제목 · 범례 없음(기본). 재는 것은 화살표 끝의 자리이고
  // 레일 위 거리가 아니다 (S-piece).

  messages: conservationOfMomentumMessages,
};
