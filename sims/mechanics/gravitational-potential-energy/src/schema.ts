// ========================================================================
// gravitational-potential-energy — 선언
// ========================================================================
// 질문: 높이에 저장된 에너지는 정말 「들어 올린 만큼」 인가 — 그리고 그것을 어떻게
//       돌려받는가.
//
// 말뚝 박기다. 같은 추 둘을 같은 말뚝 위에서 들어 올린다. 왼쪽은 h, 오른쪽은 2h.
// 멈춰 매달린 동안 둘 다 움직이지 않지만, 동시에 놓으면 떨어져 말뚝을 때리고 —
// 같은 땅이 같은 힘으로 버티는데 — 오른쪽 말뚝이 두 배 깊이 들어간다. 땅이 버틴
// 힘 × 박힌 깊이가 추가 돌려준 일이므로, 깊이가 두 배라는 것이 곧 높이에 두 배를
// 저장했었다는 뜻이다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:gravitational-potential-energy` 와 문자 그대로 일치한다 (C4). */
export const GRAVITATIONAL_POTENTIAL_ENERGY_ID = 'gravitational-potential-energy';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 중력 가속도(m/s²). */
export const GRAVITY = 9.8;
/** 왼쪽 추를 들어 올리는 높이(m) — 추 밑면에서 말뚝 머리까지. */
export const H_LOW = 0.7;
/** 오른쪽 추를 들어 올리는 높이(m). 정확히 두 배다 — 이 조각이 바꾸는 유일한 수. */
export const H_HIGH = 1.4;
/**
 * 땅이 말뚝을 붙잡는 힘을 추의 무게로 나눈 비. 두 말뚝이 같다 — 같은 말뚝, 같은 땅.
 *
 * 말뚝이 박히는 동안 추도 함께 내려가며 무게가 일을 보태므로
 *   mg(h + d) = R·d   →   d = h / (R/mg − 1)
 * 이다. 깊이는 높이에 **비례**한다. 3 이면 d = h/2 — 깊이가 눈으로 견줄 만큼 길다.
 */
export const RESIST_RATIO = 3;

// ------------------------------------------------------------------------
// 배치 — 월드 미터. 두 말뚝을 좌우로 둔다.
// ------------------------------------------------------------------------

/** 왼쪽(h) · 오른쪽(2h) 말뚝의 가로 자리. */
export const LANE_LOW_X = -1.35;
export const LANE_HIGH_X = 1.35;

/** 처음 말뚝 머리의 높이(m). 땅(0) 위로 이만큼 나와 있다 — 2d 를 박혀도 머리가 남는다. */
export const STAKE_TOP_0 = 0.8;
/** 말뚝 [굵기, 길이](m). */
export const STAKE_SIZE: readonly [number, number] = [0.16, 1.4];
/** 추 [가로, 세로](m). 둘이 같다 — 같은 무게라는 것이 주장의 전제다. */
export const WEIGHT_SIZE: readonly [number, number] = [0.5, 0.3];

/**
 * 저장 막대의 가로 자리(말뚝 기준 m)와 굵기. 추 오른쪽 옆에 세운다 — 말뚝 머리의
 * 처음 높이에서 추 밑면까지를 잇는다. 들어 올리면 위로 자라고, 떨어지면 줄고, 박히면
 * 그 기준 **아래**로 자란다.
 */
export const BAR_DX = 0.42;
export const BAR_WIDTH = 0.09;
/** 기준 눈금(처음 말뚝 머리 높이 · 들어 올린 높이)의 반폭(m). */
export const TICK_HALF = 0.1;
/** 떨어지는 동안의 속도 화살표 — 추 왼쪽 옆에 놓는다. 속력 → 길이 배율(m per m/s). */
export const SPEED_DX = -0.42;
export const SPEED_ARROW_SCALE = 0.12;

/** 추를 매단 들보의 높이. 2h 까지 올린 추 위로 줄 몫을 남긴다. */
export const BEAM_Y = STAKE_TOP_0 + H_HIGH + WEIGHT_SIZE[1] + 0.32;
/** 들보의 가로 반폭. */
export const BEAM_HALF = 2.2;
/** 땅 단면의 바닥(월드 y)과 가로 반폭. 2d 박힌 말뚝 끝보다 조금 더 깊다. */
export const GROUND_BOTTOM = -1.38;
export const GROUND_HALF = 3.3;

/**
 * 프레이밍은 주장의 일부다. 세로는 땅 단면 아래(캡션 줄)부터 들보 위까지, 가로는 두
 * 말뚝과 막대 · 이름표까지. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -3.2, maxX: 3.2, minY: -1.72, maxY: BEAM_Y + 0.12 } as const;

// ------------------------------------------------------------------------
// 시간표 — 떨어지는 단계의 길이는 물리가 정한다 (경계 상수를 따로 두지 않는다)
// ------------------------------------------------------------------------

/** 처음 그림이 나타나는 동안(초). */
export const APPEAR = 0.5;
/** 두 추를 함께 h 까지 올리는 동안 · 오른쪽만 2h 까지 더 올리는 동안. 같은 속력이다. */
export const LIFT_BOTH = 1.2;
export const LIFT_MORE = LIFT_BOTH * ((H_HIGH - H_LOW) / H_LOW);
/** 매달린 채 멈춰 있는 동안. */
export const HOLD = 1.6;
/**
 * 떨어져 말뚝을 박고 멈추기까지 — 오른쪽 추가 멈추는 순간 끝난다. 떨어지는 시간
 * √(2h/g) 에, 때린 속력 √(2gh) 를 감속 (R/mg − 1)·g 로 잃는 시간을 더한다.
 */
export const DROP =
  Math.sqrt((2 * H_HIGH) / GRAVITY) + Math.sqrt(2 * GRAVITY * H_HIGH) / ((RESIST_RATIO - 1) * GRAVITY);
/** 떨어짐을 네 배 느리게 흘린다 — 실시간 0.8 초는 눈으로 좇기 짧다. */
export const SLOW_MOTION = 0.25;
/** 박힌 그림을 읽는 동안 · 다음 주기로 넘어가며 흐려지는 동안. */
export const RESULT = 3.2;
export const FADE = 0.6;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const gravitationalPotentialEnergyMessages = Object.freeze({
  'label.title': {
    ko: '중력 퍼텐셜 에너지',
    en: 'Gravitational potential energy',
    ja: '重力による位置エネルギー',
    zh: '重力势能',
    ar: 'طاقة الوضع الجاذبية',
    es: 'Energía potencial gravitatoria',
    fr: 'Énergie potentielle de pesanteur',
    hi: 'गुरुत्वीय स्थितिज ऊर्जा',
    id: 'Energi potensial gravitasi',
    pt: 'Energia potencial gravitacional',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '높이에 저장된 에너지',
    en: 'Energy stored in height',
    ja: '高さに蓄えられたエネルギー',
    zh: '储存在高度中的能量',
    ar: 'طاقة مخزّنة في الارتفاع',
    es: 'Energía almacenada en la altura',
    fr: 'Énergie stockée dans la hauteur',
    hi: 'ऊँचाई में संचित ऊर्जा',
    id: 'Energi yang tersimpan dalam ketinggian',
    pt: 'Energia armazenada na altura',
  },
  'label.stage': {
    ko: '말뚝 박기',
    en: 'Pile driving',
    ja: '杭打ち',
    zh: '打桩',
    ar: 'دقّ الأوتاد',
    es: 'Hincado de pilotes',
    fr: 'Battage de pieux',
    hi: 'खूँटा गाड़ना',
    id: 'Pemancangan tiang',
    pt: 'Cravação de estacas',
  },
  'label.view': {
    ko: '두 말뚝',
    en: 'Two stakes',
    ja: '二本の杭',
    zh: '两根桩',
    ar: 'وتدان',
    es: 'Dos estacas',
    fr: 'Deux pieux',
    hi: 'दो खूँटे',
    id: 'Dua tiang pancang',
    pt: 'Duas estacas',
  },
  /** 높이 · 깊이 이름표. 수식 기호라 번역 대상이 아니다 (C1 판정 3). */
  'label.heightLow': {
    ko: 'h',
    en: 'h',
    ja: 'h',
    zh: 'h',
    ar: 'h',
    es: 'h',
    fr: 'h',
    hi: 'h',
    id: 'h',
    pt: 'h',
  },
  'label.heightHigh': {
    ko: '2h',
    en: '2h',
    ja: '2h',
    zh: '2h',
    ar: '2h',
    es: '2h',
    fr: '2h',
    hi: '2h',
    id: '2h',
    pt: '2h',
  },
  'label.depthLow': {
    ko: 'd',
    en: 'd',
    ja: 'd',
    zh: 'd',
    ar: 'd',
    es: 'd',
    fr: 'd',
    hi: 'd',
    id: 'd',
    pt: 'd',
  },
  'label.depthHigh': {
    ko: '2d',
    en: '2d',
    ja: '2d',
    zh: '2d',
    ar: '2d',
    es: '2d',
    fr: '2d',
    hi: '2d',
    id: '2d',
    pt: '2d',
  },
  'caption.lift': {
    ko: '같은 추 둘을 같은 말뚝 위에서 들어 올린다 — 올린 높이만큼 막대가 자란다',
    en: 'Two identical weights are lifted above identical stakes — the bar grows with the height',
    ja: '同じおもり二つを同じ杭の上に持ち上げる — 上げた高さの分だけ棒が伸びる',
    zh: '两个相同的重锤被提到两根相同的桩上方 — 柱条随高度增长',
    ar: 'يُرفع ثقلان متماثلان فوق وتدين متماثلين — ويطول العمود مع الارتفاع',
    es: 'Se elevan dos pesas idénticas sobre estacas idénticas — la barra crece con la altura',
    fr: 'Deux masses identiques sont soulevées au-dessus de pieux identiques — la barre grandit avec la hauteur',
    hi: 'दो एक जैसे भार एक जैसे खूँटों के ऊपर उठाए जाते हैं — ऊँचाई के साथ पट्टी बढ़ती है',
    id: 'Dua beban yang sama diangkat di atas tiang pancang yang sama — batang bertambah panjang seiring ketinggian',
    pt: 'Dois pesos idênticos são erguidos acima de estacas idênticas — a barra cresce com a altura',
  },
  'caption.liftMore': {
    ko: '오른쪽 추만 두 배 높이까지 더 올린다',
    en: 'Only the right weight keeps rising, to twice the height',
    ja: '右のおもりだけが、さらに二倍の高さまで上がる',
    zh: '只有右边的重锤继续上升，升到两倍高度',
    ar: 'الثقل الأيمن وحده يواصل الارتفاع، حتى ضعف الارتفاع',
    es: 'Solo la pesa derecha sigue subiendo, hasta el doble de altura',
    fr: 'Seule la masse de droite continue de monter, jusqu’à deux fois la hauteur',
    hi: 'केवल दायाँ भार ऊपर उठता रहता है, दोगुनी ऊँचाई तक',
    id: 'Hanya beban kanan yang terus naik, sampai dua kali ketinggian',
    pt: 'Só o peso da direita continua subindo, até o dobro da altura',
  },
  'caption.hold': {
    ko: '둘 다 멈춰 매달려 있다 — 움직이지 않아도 들어 올린 만큼이 높이에 남아 있다',
    en: 'Both hang still — nothing moves, yet what was put in stays in the height',
    ja: 'どちらも止まってぶら下がっている — 何も動かないが、入れたものは高さに残っている',
    zh: '两者都静止悬挂着 — 什么都没动，但投入的东西仍留在高度之中',
    ar: 'كلاهما معلّق بلا حراك — لا شيء يتحرك، ومع ذلك يبقى ما وُضع فيهما في الارتفاع',
    es: 'Ambas cuelgan quietas — nada se mueve, pero lo que se puso sigue guardado en la altura',
    fr: 'Les deux pendent immobiles — rien ne bouge, et pourtant ce qui a été fourni reste dans la hauteur',
    hi: 'दोनों स्थिर लटके हैं — कुछ नहीं हिलता, फिर भी जो डाला गया था वह ऊँचाई में बना रहता है',
    id: 'Keduanya tergantung diam — tak ada yang bergerak, tetapi yang dimasukkan tetap tersimpan dalam ketinggian',
    pt: 'Os dois pendem parados — nada se move, mas o que foi colocado continua na altura',
  },
  'caption.drop': {
    ko: '동시에 놓는다 — 내려오며 높이에 담긴 것을 말뚝에 돌려준다',
    en: 'Both are released at once — coming down, they hand the stored energy to the stakes',
    ja: '同時に放す — 落ちながら、蓄えたエネルギーを杭に渡す',
    zh: '两者同时被释放 — 落下时，把储存的能量交给桩',
    ar: 'يُفلَت الاثنان معًا — وفي نزولهما يسلّمان الطاقة المخزّنة إلى الوتدين',
    es: 'Se sueltan las dos a la vez — al bajar, entregan la energía almacenada a las estacas',
    fr: 'Les deux sont lâchées en même temps — en descendant, elles cèdent l’énergie stockée aux pieux',
    hi: 'दोनों एक साथ छोड़े जाते हैं — नीचे आते हुए वे संचित ऊर्जा खूँटों को सौंप देते हैं',
    id: 'Keduanya dilepas bersamaan — sambil turun, keduanya menyerahkan energi yang tersimpan kepada tiang pancang',
    pt: 'Os dois são soltos ao mesmo tempo — ao descer, entregam a energia armazenada às estacas',
  },
  'caption.result': {
    ko: '두 배 높이에서 내려온 추가 같은 땅에 말뚝을 두 배 깊이 박았다',
    en: 'The weight dropped from twice the height drove its stake twice as deep into the same ground',
    ja: '二倍の高さから落ちたおもりは、同じ地面に杭を二倍の深さまで打ち込んだ',
    zh: '从两倍高度落下的重锤，把桩打进同样的地面，深度是两倍',
    ar: 'الثقل الذي سقط من ضعف الارتفاع دقّ وتده في الأرض نفسها إلى ضعف العمق',
    es: 'La pesa que cayó desde el doble de altura hincó su estaca el doble de profundo en el mismo suelo',
    fr: 'La masse lâchée de deux fois plus haut a enfoncé son pieu deux fois plus profondément dans le même sol',
    hi: 'दोगुनी ऊँचाई से गिरे भार ने उसी ज़मीन में अपना खूँटा दोगुना गहरा गाड़ दिया',
    id: 'Beban yang jatuh dari dua kali ketinggian menancapkan tiangnya dua kali lebih dalam ke tanah yang sama',
    pt: 'O peso solto do dobro da altura cravou sua estaca duas vezes mais fundo no mesmo chão',
  },
} satisfies Record<string, LocalizedText>);

export type GravitationalPotentialEnergyMessageKey = keyof typeof gravitationalPotentialEnergyMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: GravitationalPotentialEnergyMessageKey): LocalizedText =>
  gravitationalPotentialEnergyMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: GravitationalPotentialEnergyMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const gravitationalPotentialEnergySchema: BundleSchema = {
  id: GRAVITATIONAL_POTENTIAL_ENERGY_ID,
  label: text('label.title'),
  category: 'mechanics',
  description: text('label.description'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 이미 들어 올리는 중이고, 놓고, 박히고, 다시 올린다.
  parameters: [],

  stages: [
    {
      id: 'pile-driving',
      label: text('label.stage'),
      constants: { gravity: GRAVITY, hLow: H_LOW, hHigh: H_HIGH, resistRatio: RESIST_RATIO },
    },
  ],

  environments: [],

  views: [{ id: 'stakes', label: text('label.view'), default: true }],

  /**
   * 세로로 4.7 m 를 담아야 한다(땅 단면 · 2h · 들보). 가로는 말뚝 둘이면 되어 남는다 —
   * 캡션이 그 폭을 쓴다. 세로를 더 주면 그림만 커질 뿐 읽을 것이 늘지 않는다.
   */
  canvas: { height: 440, minHeight: 380 },

  /**
   * 겹침이 판정 장치다. 말뚝은 땅 단면 **위**에 그려져야 땅속에 박힌 길이가 보이고,
   * 저장 막대는 땅 단면 위로 지나가야 기준선 아래로 자란 몫이 읽힌다. 층 순서로는
   * `region` 이 물체 위로 올라와 말뚝을 덮는다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 나타남 → 함께 올림 → 오른쪽만 더 올림 → 매달린 채 멈춤 → 떨어져 박힘 →
   * 박힌 그림 → 흐려짐.
   *
   * 올리는 두 단계의 길이 비가 높이 비다(같은 속력). 떨어지는 단계의 길이는 물리에서
   * 끌어온다 — 오른쪽 추가 멈추는 순간 끝나므로 「박았다」 는 캡션이 화면보다 먼저 올 수
   * 없다.
   */
  timeline: {
    phases: [
      { id: 'appear', duration: APPEAR, caption: key('caption.lift') },
      { id: 'lift-both', duration: LIFT_BOTH, caption: key('caption.lift') },
      { id: 'lift-more', duration: LIFT_MORE, caption: key('caption.liftMore') },
      { id: 'hold', duration: HOLD, caption: key('caption.hold') },
      { id: 'drop', duration: DROP, timeScale: SLOW_MOTION, caption: key('caption.drop') },
      { id: 'result', duration: RESULT, caption: key('caption.result') },
      { id: 'fade', duration: FADE, caption: key('caption.result') },
    ],
  },

  /**
   * 도착한 순간 이미 진행 중이다 — 두 추가 함께 올라가는 한가운데에서 연다. 0 이면
   * 빈 무대가 먼저 떠오른다.
   */
  startAt: APPEAR + LIFT_BOTH * 0.5,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — mgh 라는 식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 720,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것은 몇 미터가 아니라 **비**(h 대 2h, d 대 2d)
   * 라서, 거리 격자를 깔면 「몇 미터인가」 라는 다른 질문이 끼어든다.
   */

  messages: gravitationalPotentialEnergyMessages,
};
