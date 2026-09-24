// ========================================================================
// newtons-law-of-gravitation — 선언
// ========================================================================
// 질문: 두 물체 사이의 거리를 벌리면 서로 당기는 힘이 얼마나 줄어드는가.
//
// 큰 M 과 작은 m 이 한 줄 위에 있다. 두 물체에 걸린 힘 화살표는 질량이 달라도
// 늘 같은 길이다 — 한 쌍의 힘이다. m 을 r 에서 2r · 3r 로 떼어 놓으면 두 화살표가
// **함께** 1/2² · 1/3² 로 줄고, 처음 길이는 점선으로 남아 얼마나 줄었는지 견줄 수 있다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:newtons-law-of-gravitation` 와 문자 그대로 일치한다 (C4). */
export const NEWTONS_LAW_OF_GRAVITATION_ID = 'newtons-law-of-gravitation';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 처음 거리 r(월드 단위). 두 중심 사이. 두 화살표가 가운데에서 거의 맞닿는 거리다. */
export const NEAR_DISTANCE = 2;
/** 첫째로 벌리는 거리 배수. 화면에 `2r` · `F/2²` 로 그대로 뜬다. */
export const FAR_MULTIPLE_1 = 2;
/** 둘째로 벌리는 거리 배수. 화면에 `3r` · `F/3²` 로 그대로 뜬다. */
export const FAR_MULTIPLE_2 = 3;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 물리량이 아니라 그림의 치수다.
// ------------------------------------------------------------------------

/** 큰 물체 M · 작은 물체 m 의 반지름. 크기가 다른 것이 「질량이 달라도 힘은 같다」 의 전제다. */
export const RADIUS_BIG = 0.27;
export const RADIUS_SMALL = 0.11;
/** 처음 거리에서 두 화살표 머리 사이에 남기는 틈. 맞닿으면 한 줄로 읽힌다. */
export const TIP_GAP = 0.1;
/** 거리 눈금자의 높이(월드 y). 두 물체 이름표 아래로 내린다. */
export const RULER_Y = -0.72;
/** 눈금 하나의 높이(월드). */
export const RULER_TICK = 0.1;

/** 고정 경계. 가장 먼 거리(3r)의 m 과 눈금 이름표 · 캡션 줄까지 담는다 (원칙 6). */
export const SCENE_BOUNDS = { minX: -0.55, maxX: 6.45, minY: -1.36, maxY: 0.42 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const newtonsLawOfGravitationMessages = Object.freeze({
  'label.title': {
    ko: '만유인력 법칙',
    en: "Newton's law of gravitation",
    ja: 'ニュートンの万有引力の法則',
    zh: '牛顿万有引力定律',
    ar: 'قانون نيوتن للجذب العام',
    es: 'Ley de la gravitación universal de Newton',
    fr: 'Loi de la gravitation universelle de Newton',
    hi: 'न्यूटन का गुरुत्वाकर्षण नियम',
    id: 'Hukum gravitasi Newton',
    pt: 'Lei da gravitação universal de Newton',
  },
  'label.operation': {
    ko: '거리 제곱에 반비례하는 힘',
    en: 'A force that falls with the square of distance',
    ja: '距離の2乗に反比例して弱まる力',
    zh: '随距离的平方减弱的力',
    ar: 'قوة تضعف مع مربع المسافة',
    es: 'Una fuerza que disminuye con el cuadrado de la distancia',
    fr: 'Une force qui décroît avec le carré de la distance',
    hi: 'दूरी के वर्ग के साथ घटने वाला बल',
    id: 'Gaya yang melemah sebanding kuadrat jarak',
    pt: 'Uma força que diminui com o quadrado da distância',
  },
  'label.stage': {
    ko: '두 물체',
    en: 'Two bodies',
    ja: '二つの物体',
    zh: '两个物体',
    ar: 'جسمان',
    es: 'Dos cuerpos',
    fr: 'Deux corps',
    hi: 'दो पिंड',
    id: 'Dua benda',
    pt: 'Dois corpos',
  },
  'label.view': {
    ko: '한 줄',
    en: 'In a line',
    ja: '一直線上',
    zh: '在一条直线上',
    ar: 'على خط واحد',
    es: 'En línea',
    fr: 'En ligne',
    hi: 'एक सीध में',
    id: 'Dalam satu garis',
    pt: 'Em linha',
  },
  /** 물체 이름. 수식 기호라 번역 대상이 아니다 (C1 판정 3). */
  'label.bigMass': {
    ko: 'M',
    en: 'M',
    ja: 'M',
    zh: 'M',
    ar: 'M',
    es: 'M',
    fr: 'M',
    hi: 'M',
    id: 'M',
    pt: 'M',
  },
  'label.smallMass': {
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
  /** 화살표 이름. 수식 표기다. `{n}` 은 스테이지 상수의 거리 배수가 그대로 들어간다. */
  'label.force': {
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
  'label.forceScaled': {
    ko: 'F/{n}²',
    en: 'F/{n}²',
    ja: 'F/{n}²',
    zh: 'F/{n}²',
    ar: 'F/{n}²',
    es: 'F/{n}²',
    fr: 'F/{n}²',
    hi: 'F/{n}²',
    id: 'F/{n}²',
    pt: 'F/{n}²',
  },
  /** 거리 눈금 이름표. 표식이다. */
  'label.distanceNear': {
    ko: 'r',
    en: 'r',
    ja: 'r',
    zh: 'r',
    ar: 'r',
    es: 'r',
    fr: 'r',
    hi: 'r',
    id: 'r',
    pt: 'r',
  },
  'label.distanceScaled': {
    ko: '{n}r',
    en: '{n}r',
    ja: '{n}r',
    zh: '{n}r',
    ar: '{n}r',
    es: '{n}r',
    fr: '{n}r',
    hi: '{n}r',
    id: '{n}r',
    pt: '{n}r',
  },
  'caption.pair': {
    ko: '크기가 다른 M 과 m 이 서로를 같은 크기의 힘으로 당긴다',
    en: 'M and m differ in size, yet they pull on each other with equal force',
    ja: 'M と m は大きさが違うのに、同じ大きさの力で互いを引き合う',
    zh: 'M 和 m 大小不同，却以同样大小的力相互吸引',
    ar: 'يختلف M و m في الحجم، ومع ذلك يجذب كلٌّ منهما الآخر بقوة متساوية',
    es: 'M y m son de distinto tamaño, pero se atraen mutuamente con la misma fuerza',
    fr: 'M et m n’ont pas la même taille, et pourtant ils s’attirent avec la même force',
    hi: 'M और m का आकार अलग है, फिर भी वे एक-दूसरे को बराबर बल से खींचते हैं',
    id: 'M dan m berbeda ukuran, tetapi saling menarik dengan gaya yang sama besar',
    pt: 'M e m têm tamanhos diferentes, mas se atraem mutuamente com a mesma força',
  },
  'caption.stretch1': {
    ko: '거리를 {n1}배로 벌리는 동안 두 화살표가 함께 줄어든다',
    en: 'As the distance stretches to {n1}×, both arrows shrink together',
    ja: '距離が {n1}× に広がるあいだ、二つの矢印がそろって縮む',
    zh: '距离拉大到 {n1}× 的过程中，两个箭头一起缩短',
    ar: 'بينما تتسع المسافة إلى {n1}×، يقصر السهمان معًا',
    es: 'Mientras la distancia se estira a {n1}×, las dos flechas se acortan a la vez',
    fr: 'Pendant que la distance passe à {n1}×, les deux flèches raccourcissent ensemble',
    hi: 'जैसे-जैसे दूरी {n1}× तक बढ़ती है, दोनों तीर साथ-साथ छोटे होते जाते हैं',
    id: 'Saat jarak direnggangkan menjadi {n1}×, kedua panah menyusut bersama',
    pt: 'Enquanto a distância se estende até {n1}×, as duas setas encolhem juntas',
  },
  'caption.hold1': {
    ko: '거리는 {n1}배인데 두 힘은 똑같이 점선의 1/{n1}² 이다',
    en: 'The distance is {n1}×, yet both forces are just 1/{n1}² of the dashed arrow',
    ja: '距離は {n1}× なのに、二つの力はどちらも点線の矢印のわずか 1/{n1}² だ',
    zh: '距离是 {n1}×，而两个力都只有虚线箭头的 1/{n1}²',
    ar: 'المسافة {n1}×، لكن كلتا القوتين لا تزيد على 1/{n1}² من السهم المتقطع',
    es: 'La distancia es {n1}×, pero las dos fuerzas son solo 1/{n1}² de la flecha discontinua',
    fr: 'La distance est {n1}×, mais les deux forces ne valent que 1/{n1}² de la flèche en pointillé',
    hi: 'दूरी {n1}× है, फिर भी दोनों बल बिंदीदार तीर के केवल 1/{n1}² हैं',
    id: 'Jaraknya {n1}×, tetapi kedua gaya hanya 1/{n1}² dari panah putus-putus',
    pt: 'A distância é {n1}×, mas as duas forças são só 1/{n1}² da seta tracejada',
  },
  'caption.stretch2': {
    ko: '{n2}배까지 더 벌린다',
    en: 'Stretching further, to {n2}×',
    ja: 'さらに {n2}× まで広げる',
    zh: '再拉大到 {n2}×',
    ar: 'ثم نزيدها أكثر، إلى {n2}×',
    es: 'Se estira aún más, hasta {n2}×',
    fr: 'On écarte encore, jusqu’à {n2}×',
    hi: 'और आगे, {n2}× तक फैलाते हैं',
    id: 'Direnggangkan lagi, sampai {n2}×',
    pt: 'Afastando ainda mais, até {n2}×',
  },
  'caption.hold2': {
    ko: '거리는 {n2}배, 두 힘은 1/{n2}² — 그래도 둘은 여전히 같은 크기다',
    en: 'At {n2}× the distance both forces are 1/{n2}² — and still equal to each other',
    ja: '距離 {n2}× で二つの力は 1/{n2}² — それでも両者は同じ大きさのままだ',
    zh: '距离为 {n2}× 时，两个力都是 1/{n2}² — 而且仍然彼此相等',
    ar: 'عند {n2}× من المسافة تصبح كلتا القوتين 1/{n2}² — وتبقيان متساويتين',
    es: 'A {n2}× la distancia, las dos fuerzas son 1/{n2}² — y siguen siendo iguales entre sí',
    fr: 'À {n2}× la distance, les deux forces valent 1/{n2}² — et restent égales entre elles',
    hi: '{n2}× दूरी पर दोनों बल 1/{n2}² हैं — और अब भी आपस में बराबर हैं',
    id: 'Pada jarak {n2}×, kedua gaya menjadi 1/{n2}² — dan tetap sama besar',
    pt: 'A {n2}× a distância, as duas forças são 1/{n2}² — e continuam iguais entre si',
  },
  'caption.return': {
    ko: '다시 가까이 가면 두 힘이 함께 빠르게 커진다',
    en: 'Brought back close, both forces grow back quickly together',
    ja: 'ふたたび近づけると、二つの力がそろって急速に大きくなる',
    zh: '再次靠近时，两个力一起迅速变大',
    ar: 'عند إعادتهما متقاربين، تكبر القوتان معًا بسرعة',
    es: 'Al acercarlos de nuevo, las dos fuerzas vuelven a crecer rápido a la vez',
    fr: 'En les rapprochant, les deux forces regrandissent vite ensemble',
    hi: 'फिर पास लाने पर दोनों बल साथ-साथ तेज़ी से बढ़ते हैं',
    id: 'Saat didekatkan kembali, kedua gaya membesar lagi dengan cepat bersama-sama',
    pt: 'Ao aproximá-los de novo, as duas forças voltam a crescer rápido juntas',
  },
} satisfies Record<string, LocalizedText>);

export type NewtonsLawOfGravitationMessageKey = keyof typeof newtonsLawOfGravitationMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: NewtonsLawOfGravitationMessageKey): LocalizedText =>
  newtonsLawOfGravitationMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: NewtonsLawOfGravitationMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const newtonsLawOfGravitationSchema: BundleSchema = {
  id: NEWTONS_LAW_OF_GRAVITATION_ID,
  label: text('label.title'),
  category: 'astro',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 벌어지고, 줄고, 다시 가까워진다 (controllers.ts).
  parameters: [],

  stages: [
    {
      id: 'two-bodies',
      label: text('label.stage'),
      constants: {
        nearDistance: NEAR_DISTANCE,
        farMultiple1: FAR_MULTIPLE_1,
        farMultiple2: FAR_MULTIPLE_2,
      },
    },
  ],

  environments: [],

  views: [{ id: 'line', label: text('label.view'), default: true }],

  /**
   * 그림은 가로 한 줄이다 — 가로 7 단위, 세로는 물체 · 눈금 · 캡션 줄뿐이다. 세로를 더 주면
   * 가로가 먼저 차서 그림만 작아진다 (S-piece — 세로가 비싸다).
   */
  canvas: { height: 272, minHeight: 240 },

  /**
   * 한 주기 = 붙어 있음 → 2배로 벌림 → 멈춰 읽기 → 3배로 벌림 → 멈춰 읽기 → 되돌아옴.
   *
   * 벌리는 단계의 진행도(`at`)가 곧 m 의 자리다. 경계 상수를 따로 두지 않는다 — 단계 길이를
   * 바꾸면 움직임이 그대로 따라온다.
   */
  timeline: {
    phases: [
      { id: 'near', duration: 2.6, caption: key('caption.pair') },
      { id: 'stretch1', duration: 1.8, ease: 'smooth', caption: key('caption.stretch1') },
      { id: 'hold1', duration: 3, caption: key('caption.hold1') },
      { id: 'stretch2', duration: 1.5, ease: 'smooth', caption: key('caption.stretch2') },
      { id: 'hold2', duration: 3.2, caption: key('caption.hold2') },
      { id: 'return', duration: 1.8, ease: 'smooth', caption: key('caption.return') },
    ],
  },

  /**
   * 도착한 순간 이미 진행 중이다 — 붙어 있는 한 쌍을 잠깐 보인 뒤 곧 벌어지기 시작하는
   * 자리에서 연다.
   */
  startAt: 1.2,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 법칙의 식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    fade: 0.25,
    style: { colorRole: 'muted', emphasis: 'strong' },
    // 캡션에 끼우는 배수는 스테이지 상수 그대로다 — state 에 문자열로 옮겨 둔다 (G133).
    vars: { n1: 'multiple1', n2: 'multiple2' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것은 임의의 거리가 아니라 **r 의 몇 배인가** 라서,
   * 거리 격자 대신 r · 2r · 3r 세 눈금만 긋는다.
   */

  messages: newtonsLawOfGravitationMessages,
};
