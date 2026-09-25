// ========================================================================
// center-of-mass-motion — 선언
// ========================================================================
// 질문: 던진 물체가 날아가는 동안 속에서 돌고, 흔들리고, 끝내 두 조각으로 갈라져도
// 「그 물체가 어디로 가는가」 는 바뀌는가?
//
// 답: 바뀌지 않는다. 조각끼리 주고받는 힘(내부 힘)은 언제나 크기가 같고 방향이
// 반대인 쌍이라 합이 0 이다. 그래서 **질량 중심은 던진 순간 정해진 포물선을 그대로
// 간다** — 두 덩어리가 제각기 어떤 길을 그리든.
//
// 화면에서는 강조색 점 하나(질량 중심)가 미리 그어 둔 점선 포물선 위를 벗어나지 않고
// 달린다. 그 둘레에서 두 덩어리는 고리를 그리며 돌다가 떼어 밀려 흩어진다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:center-of-mass-motion` 와 문자 그대로 일치한다 (C4). */
export const CENTER_OF_MASS_MOTION_ID = 'center-of-mass-motion';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 월드 1 단위 = 1 m. 원점은 던지는 자리.
// ------------------------------------------------------------------------

/**
 * 중력 가속도(m/s²). 지구 값(9.8)이 아니다 — 한 번 나는 데 4 초쯤 걸리도록 낮췄다.
 * 9.8 로 4 초를 날리면 포물선이 20 m 높이가 되어 두 덩어리가 점이 된다. 화면에 수가
 * 없으므로 이 값은 주장에 들어가지 않는다.
 */
export const G = 1.0;
/** 무거운 덩어리 · 가벼운 덩어리 질량(kg). 2 : 1 이라 질량 중심은 가운데가 아니다. */
export const HEAVY_MASS = 2;
export const LIGHT_MASS = 1;
/** 둘을 잇는 용수철의 자연 길이(m)와 용수철 상수(N/m). */
export const SPRING_LENGTH = 0.5;
export const SPRING_K = 24;
/** 던지는 속도(m/s). 질량 중심의 처음 속도다. */
export const LAUNCH_VX = 1.45;
export const LAUNCH_VY = 1.9;
/** 던질 때 두 덩어리 사이 거리(m) · 방향(rad) · 도는 빠르기(rad/s). 늘어난 채로 돌며 출발한다. */
export const START_SPAN = 0.6;
export const START_ANGLE = 2.3;
export const START_SPIN = 3.4;

/**
 * 떼어 미는 세기 — 갈라지는 순간 두 덩어리의 **상대 속도**에 더해지는 값(m/s).
 * 칩이 고른다. 0 은 미는 힘 없이 풀려나기만 한다.
 */
export const PUSH_OPTIONS = [0, 0.4, 0.8] as const;
export const PUSH_DEFAULT = PUSH_OPTIONS[2];

// ------------------------------------------------------------------------
// 배치
// ------------------------------------------------------------------------

/** 덩어리 반지름(m). 원판 넓이가 질량에 비례하도록 √2 : 1. */
export const HEAVY_RADIUS = 0.15;
export const LIGHT_RADIUS = 0.106;
/** 질량 중심 점 반지름(m). */
export const CM_RADIUS = 0.055;

/**
 * 프레이밍 — 왼쪽 아래가 던지는 자리. 아래 여백은 캡션 줄, 왼쪽 위는 칩 줄이 쓴다.
 * 매 프레임 같은 값이다 (S-piece — 프레이밍은 주장의 일부다).
 */
export const SCENE_BOUNDS = { minX: -0.5, maxX: 7.3, minY: -1.0, maxY: 2.75 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const centerOfMassMotionMessages = Object.freeze({
  'label.title': {
    ko: '질량 중심의 운동',
    en: 'Motion of the centre of mass',
    ja: '重心の運動',
    zh: '质心的运动',
    ar: 'حركة مركز الكتلة',
    es: 'Movimiento del centro de masa',
    fr: 'Mouvement du centre de masse',
    hi: 'द्रव्यमान केंद्र की गति',
    id: 'Gerak pusat massa',
    pt: 'Movimento do centro de massa',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '내부 힘에 영향받지 않는 운동',
    en: 'The motion that internal forces cannot change',
    ja: '内力が変えられない運動',
    zh: '内力无法改变的运动',
    ar: 'الحركة التي لا تستطيع القوى الداخلية تغييرها',
    es: 'El movimiento que las fuerzas internas no pueden cambiar',
    fr: 'Le mouvement que les forces internes ne peuvent pas changer',
    hi: 'वह गति जिसे आंतरिक बल बदल नहीं सकते',
    id: 'Gerak yang tidak dapat diubah oleh gaya dalam',
    pt: 'O movimento que as forças internas não conseguem mudar',
  },
  'label.stage': {
    ko: '용수철로 이은 두 덩어리',
    en: 'Two lumps joined by a spring',
    ja: 'ばねでつないだ二つの塊',
    zh: '用弹簧连接的两个物块',
    ar: 'جسمان يصل بينهما نابض',
    es: 'Dos masas unidas por un resorte',
    fr: 'Deux masses reliées par un ressort',
    hi: 'स्प्रिंग से जुड़े दो पिंड',
    id: 'Dua benda yang dihubungkan pegas',
    pt: 'Duas massas ligadas por uma mola',
  },
  'label.view': {
    ko: '던진 뒤',
    en: 'In flight',
    ja: '投げた後',
    zh: '抛出之后',
    ar: 'أثناء الطيران',
    es: 'En vuelo',
    fr: 'En vol',
    hi: 'उड़ान में',
    id: 'Saat melayang',
    pt: 'Em voo',
  },

  /** 강조색 점의 이름. 강조색은 이 대상 하나에만 쓴다. */
  'label.cm': {
    ko: '질량 중심',
    en: 'Centre of mass',
    ja: '重心',
    zh: '质心',
    ar: 'مركز الكتلة',
    es: 'Centro de masa',
    fr: 'Centre de masse',
    hi: 'द्रव्यमान केंद्र',
    id: 'Pusat massa',
    pt: 'Centro de massa',
  },
  /** 서로 미는 힘 쌍. 기호라 번역 대상이 아니다 (C1 판정 3). */
  'label.forceOnLight': {
    ko: 'F',
    en: 'F',
    ja: 'F',
    zh: 'F',
    ar: 'F',
    es: 'F',
    fr: 'F',
    hi: 'F',
    id: 'F',
    pt: 'F',
  },
  'label.forceOnHeavy': {
    ko: '−F',
    en: '−F',
    ja: '−F',
    zh: '−F',
    ar: '−F',
    es: '−F',
    fr: '−F',
    hi: '−F',
    id: '−F',
    pt: '−F',
  },

  'control.push': {
    ko: '떼어 미는 힘',
    en: 'Push apart',
    ja: '引き離す力',
    zh: '推开的力',
    ar: 'دفع التفريق',
    es: 'Empuje de separación',
    fr: 'Poussée d’écartement',
    hi: 'अलग करने वाला धक्का',
    id: 'Dorongan pemisah',
    pt: 'Empurrão de separação',
  },
  'option.push0': {
    ko: '없음',
    en: 'None',
    ja: 'なし',
    zh: '无',
    ar: 'لا شيء',
    es: 'Ninguno',
    fr: 'Aucune',
    hi: 'कोई नहीं',
    id: 'Tidak ada',
    pt: 'Nenhum',
  },
  'option.push1': {
    ko: '약하게',
    en: 'Gentle',
    ja: '弱く',
    zh: '轻',
    ar: 'خفيف',
    es: 'Suave',
    fr: 'Douce',
    hi: 'हल्का',
    id: 'Pelan',
    pt: 'Suave',
  },
  'option.push2': {
    ko: '세게',
    en: 'Hard',
    ja: '強く',
    zh: '重',
    ar: 'قوي',
    es: 'Fuerte',
    fr: 'Forte',
    hi: 'ज़ोरदार',
    id: 'Kuat',
    pt: 'Forte',
  },

  'caption.fly': {
    ko: '용수철로 이은 두 덩어리가 돌고 출렁이며 날아간다. 그래도 질량 중심은 던질 때 정해진 점선 포물선을 한 치도 벗어나지 않는다.',
    en: 'Two lumps joined by a spring spin and wobble through the air. Their centre of mass still never leaves the dashed parabola fixed at the throw.',
    ja: 'ばねでつないだ二つの塊が、回り揺れながら飛んでいく。それでも重心は、投げたときに決まった点線の放物線から少しも外れない。',
    zh: '用弹簧连接的两个物块一边旋转、一边晃动着飞过空中。它们的质心却始终不离开抛出时确定的虚线抛物线。',
    ar: 'يدور جسمان يصل بينهما نابض ويتأرجحان وهما يطيران في الهواء. ومع ذلك لا يغادر مركز كتلتهما أبدًا القطعَ المكافئ المتقطع الذي تحدّد لحظة الرمي.',
    es: 'Dos masas unidas por un resorte giran y se bambolean por el aire. Aun así, su centro de masa nunca abandona la parábola punteada fijada en el lanzamiento.',
    fr: 'Deux masses reliées par un ressort tournent et oscillent en vol. Leur centre de masse ne quitte pourtant jamais la parabole en pointillé fixée au lancer.',
    hi: 'स्प्रिंग से जुड़े दो पिंड घूमते और डगमगाते हुए हवा में उड़ते हैं। फिर भी उनका द्रव्यमान केंद्र फेंकते समय तय हुए बिंदुदार परवलय से कभी नहीं हटता।',
    id: 'Dua benda yang dihubungkan pegas berputar dan bergoyang di udara. Namun pusat massanya tidak pernah meninggalkan parabola putus-putus yang ditetapkan saat lemparan.',
    pt: 'Duas massas ligadas por uma mola giram e balançam pelo ar. Mesmo assim, seu centro de massa nunca sai da parábola tracejada fixada no lançamento.',
  },
  'caption.split': {
    ko: '용수철이 풀려 두 덩어리가 떨어져 나간다. 둘이 서로 주고받는 힘은 언제나 같은 크기, 반대 방향의 한 쌍이다.',
    en: 'The spring lets go and the lumps fly apart. The forces they exert on each other always come as a pair, equal in size and opposite in direction.',
    ja: 'ばねが外れ、二つの塊が離れていく。互いに及ぼし合う力は、いつも大きさが等しく向きが反対の一対だ。',
    zh: '弹簧松开，两个物块分开飞出。它们相互施加的力总是成对出现，大小相等、方向相反。',
    ar: 'يفلت النابض فيتباعد الجسمان. القوتان اللتان يؤثر بهما كلٌّ منهما في الآخر تأتيان دائمًا زوجًا، متساويتين في المقدار ومتعاكستين في الاتجاه.',
    es: 'El resorte se suelta y las masas salen despedidas. Las fuerzas que se ejercen entre sí siempre forman un par, de igual magnitud y sentido opuesto.',
    fr: 'Le ressort se libère et les masses s’écartent. Les forces qu’elles exercent l’une sur l’autre vont toujours par paire, de même intensité et de sens opposés.',
    hi: 'स्प्रिंग छूटती है और दोनों पिंड अलग उड़ जाते हैं। वे एक-दूसरे पर जो बल लगाते हैं, वे सदा एक जोड़ी होते हैं, परिमाण में बराबर और दिशा में विपरीत।',
    id: 'Pegas terlepas dan kedua benda terpental menjauh. Gaya yang mereka berikan satu sama lain selalu datang berpasangan, sama besar dan berlawanan arah.',
    pt: 'A mola se solta e as massas se afastam voando. As forças que exercem uma sobre a outra sempre vêm em par, de mesma intensidade e sentidos opostos.',
  },
  'caption.apart': {
    ko: '두 덩어리는 제각기 다른 길로 흩어지지만, 둘 사이의 그 점은 처음 정해진 포물선을 그대로 간다.',
    en: 'The lumps scatter along paths of their own, yet the point between them keeps to the parabola fixed at the throw.',
    ja: '二つの塊はそれぞれ別の道へ散っていくが、その間の点は投げたときに決まった放物線をそのまま進む。',
    zh: '两个物块沿各自的路径散开，但它们之间的那个点仍沿着抛出时确定的抛物线前进。',
    ar: 'يتفرق الجسمان على مسارين خاصين بهما، لكن النقطة الواقعة بينهما تبقى على القطع المكافئ الذي تحدّد لحظة الرمي.',
    es: 'Las masas se dispersan por caminos propios, pero el punto entre ellas sigue la parábola fijada en el lanzamiento.',
    fr: 'Les masses se dispersent chacune sur sa trajectoire, mais le point entre elles suit la parabole fixée au lancer.',
    hi: 'दोनों पिंड अपने-अपने पथ पर बिखर जाते हैं, फिर भी उनके बीच का वह बिंदु फेंकते समय तय हुए परवलय पर ही चलता है।',
    id: 'Kedua benda berpencar di lintasannya masing-masing, tetapi titik di antara keduanya tetap mengikuti parabola yang ditetapkan saat lemparan.',
    pt: 'As massas se espalham por caminhos próprios, mas o ponto entre elas segue a parábola fixada no lançamento.',
  },
} satisfies Record<string, LocalizedText>);

export type CenterOfMassMotionMessageKey = keyof typeof centerOfMassMotionMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로 (C1). */
export const text = (key: CenterOfMassMotionMessageKey): LocalizedText =>
  centerOfMassMotionMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: CenterOfMassMotionMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const centerOfMassMotionSchema: BundleSchema = {
  id: CENTER_OF_MASS_MOTION_ID,
  label: text('label.title'),
  category: 'mechanics',
  description: text('label.description'),
  timeModel: 'periodic',
  parameters: [],
  stages: [
    {
      id: 'spring-pair',
      label: text('label.stage'),
      constants: {
        g: G,
        heavyMass: HEAVY_MASS,
        lightMass: LIGHT_MASS,
        springLength: SPRING_LENGTH,
        springK: SPRING_K,
        launchVx: LAUNCH_VX,
        launchVy: LAUNCH_VY,
        startSpan: START_SPAN,
        startAngle: START_ANGLE,
        startSpin: START_SPIN,
      },
    },
  ],
  environments: [],
  views: [{ id: 'flight', label: text('label.view'), default: true }],

  /** 가로로 넓다 — 포물선 하나가 왼쪽 아래에서 떠올라 오른쪽으로 내려온다. */
  canvas: { height: 392, minHeight: 348 },

  /**
   * 쓴 순서대로 겹친다 — 질량 중심 점을 용수철 · 덩어리 **뒤에** 선언해 그 위에 올린다.
   * 층 순서로는 셋이 모두 `body` · `constraint` 라 점이 덩어리 밑으로 숨을 수 있다.
   */
  drawOrder: 'scene',

  /** 도착한 순간 이미 날아가는 중이다 (S-piece). */
  startAt: 0.6,

  /**
   * 한 주기 4.2 초. **`fly` 가 시작한 뒤 흐른 시각이 곧 던진 뒤 흐른 물리 시간이다** —
   * 단계 길이를 바꾸면 갈라지는 순간과 나는 시간이 함께 바뀐다.
   *
   * - `appear` — 던지기 전. 두 덩어리가 던지는 자리에서 떠오른다. 한 주기가 끝나고
   *   다시 던질 때 화면이 튀지 않게 한다.
   * - `fly` — 던졌다. 이어진 채로 돌고 출렁이며 난다.
   * - `split` — 이 단계가 시작하는 순간 용수철이 풀리며 둘을 떼어 민다. 미는 힘 쌍을
   *   이 단계 동안만 화살표로 남긴다.
   * - `apart` — 제각기 흩어진다. 질량 중심은 그대로 포물선 위.
   * - `fade` — 옅어지며 물러난다. 끝난 화면이 남지 않도록 다음 주기로 잇는다.
   */
  timeline: {
    phases: [
      { id: 'appear', duration: 0.3, caption: key('caption.fly') },
      { id: 'fly', duration: 1.9, caption: key('caption.fly') },
      { id: 'split', duration: 0.5, caption: key('caption.split') },
      { id: 'apart', duration: 1.1, caption: key('caption.apart') },
      { id: 'fade', duration: 0.4, caption: key('caption.apart') },
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

  // 그리드 · 카메라 단추 · 제목 · 범례 없음(기본). 이 그림이 재는 것은 거리가 아니라
  // 「점이 선 위에 있는가」 이고, 눈금은 오독의 경로가 된다 (S-piece).

  messages: centerOfMassMotionMessages,
};
