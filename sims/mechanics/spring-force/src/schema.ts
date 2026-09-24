// ========================================================================
// spring-force — 선언
// ========================================================================
// 질문: 용수철을 두 배 늘이면 되돌리는 힘도 정말 두 배가 되는가.
//
// 손이 물체를 같은 간격(한 칸)씩 끌고 칸마다 멈춘다. 멈출 때마다 그 순간의 힘
// 화살표를 아래 줄에 자국으로 남겨, 네 줄이 길이 1·2·3·4 의 계단을 이룬다.
//
// 값은 모두 원본(tasks/piece-lab/spring-force/index.html)에서 그대로 옮겼다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:spring-force` 와 문자 그대로 일치한다 (C4). */
export const SPRING_FORCE_ID = 'spring-force';

// ------------------------------------------------------------------------
// 시간표 — 원본 상수
// ------------------------------------------------------------------------

/** 네 칸까지 늘인다. */
export const STEPS = 4;
/** 한 칸 당기는 시간(s). */
export const MOVE = 0.9;
/** 칸마다 멈추는 시간(s). */
export const HOLD = 0.9;
/** 네 칸에서 마지막으로 멈춘 모습(s). */
export const FINAL_HOLD = 1.3;
/** 원래 길이로 돌아가는 시간(s). */
export const RETURN = 1.5;
/** 원래 길이에서 쉬는 시간(s). */
export const REST = 0.5;
/** 도착한 순간 이미 첫 칸을 당기는 중. */
export const OFFSET = 0.45;

/** 칸 번호(1~4)의 단계 id. scene 이 같은 함수로 부른다. */
export const moveId = (i: number): string => `move${i}`;
export const holdId = (i: number): string => `hold${i}`;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const springForceMessages = Object.freeze({
  'label.title': {
    ko: '탄성력',
    en: 'Spring force',
    ja: '弾性力',
    zh: '弹力',
    ar: 'قوة النابض',
    es: 'Fuerza elástica',
    fr: 'Force élastique',
    hi: 'स्प्रिंग बल',
    id: 'Gaya pegas',
    pt: 'Força elástica',
  },
  'label.operation': {
    ko: '변형에 비례하는 복원력',
    en: 'Restoring force proportional to stretch',
    ja: '伸びに比例する復元力',
    zh: '与伸长量成正比的恢复力',
    ar: 'قوة إرجاع تتناسب مع الاستطالة',
    es: 'Fuerza restauradora proporcional al estiramiento',
    fr: 'Force de rappel proportionnelle à l’allongement',
    hi: 'खिंचाव के समानुपाती प्रत्यानयन बल',
    id: 'Gaya pemulih yang sebanding dengan pertambahan panjang',
    pt: 'Força restauradora proporcional ao alongamento',
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
  /** 늘이지 않았을 때 물체 왼쪽 면 자리. */
  'label.natural': {
    ko: '원래 길이',
    en: 'natural length',
    ja: '自然長',
    zh: '原长',
    ar: 'الطول الطبيعي',
    es: 'longitud natural',
    fr: 'longueur à vide',
    hi: 'मूल लंबाई',
    id: 'panjang awal',
    pt: 'comprimento natural',
  },
  /** 늘임 눈금. */
  'label.unit': {
    ko: '{n}칸',
    en: '{n} step',
    ja: '{n}マス',
    zh: '{n}格',
    ar: '{n} خطوة',
    es: '{n} paso',
    fr: '{n} cran',
    hi: '{n} खाना',
    id: '{n} langkah',
    pt: '{n} passo',
  },
  /** 손잡이 — 늘이는 바깥 원인. */
  'label.pull': {
    ko: '당김',
    en: 'pull',
    ja: '引っぱり',
    zh: '拉',
    ar: 'سحب',
    es: 'tirón',
    fr: 'traction',
    hi: 'खिंचाव',
    id: 'tarikan',
    pt: 'puxão',
  },
  /** 지금 힘 화살표의 이름. */
  'label.force': {
    ko: '되돌리는 힘',
    en: 'restoring force',
    ja: '復元力',
    zh: '恢复力',
    ar: 'قوة الإرجاع',
    es: 'fuerza restauradora',
    fr: 'force de rappel',
    hi: 'प्रत्यानयन बल',
    id: 'gaya pemulih',
    pt: 'força restauradora',
  },
  'caption.move1': {
    ko: '한 칸 늘인다',
    en: 'Stretch it one step',
    ja: '1マス伸ばす',
    zh: '拉长一格',
    ar: 'نمدّه خطوة واحدة',
    es: 'Se estira un paso',
    fr: 'On l’étire d’un cran',
    hi: 'एक खाना खींचते हैं',
    id: 'Diregangkan satu langkah',
    pt: 'Esticamos um passo',
  },
  'caption.moveMore': {
    ko: '한 칸 더 늘인다',
    en: 'Stretch it one more step',
    ja: 'もう1マス伸ばす',
    zh: '再拉长一格',
    ar: 'نمدّه خطوة أخرى',
    es: 'Se estira un paso más',
    fr: 'On l’étire d’un cran de plus',
    hi: 'एक खाना और खींचते हैं',
    id: 'Diregangkan satu langkah lagi',
    pt: 'Esticamos mais um passo',
  },
  'caption.hold1': {
    ko: '1칸 늘이면 되돌리는 힘은 1만큼',
    en: 'Stretched 1 step, the restoring force is 1',
    ja: '1マス伸ばすと、復元力は1',
    zh: '拉长1格，恢复力为1',
    ar: 'عند المدّ 1 خطوة، تكون قوة الإرجاع 1',
    es: 'Estirado 1 paso, la fuerza restauradora es 1',
    fr: 'Étiré de 1 cran, la force de rappel vaut 1',
    hi: '1 खाना खींचने पर प्रत्यानयन बल 1 है',
    id: 'Diregangkan 1 langkah, gaya pemulihnya 1',
    pt: 'Esticado 1 passo, a força restauradora é 1',
  },
  'caption.hold2': {
    ko: '2칸 늘이면 되돌리는 힘도 2배',
    en: 'Stretched 2 steps, the restoring force is 2 times',
    ja: '2マス伸ばすと、復元力も2倍',
    zh: '拉长2格，恢复力也变为2倍',
    ar: 'عند المدّ 2 خطوة، تصبح قوة الإرجاع أيضًا 2 ضعف',
    es: 'Estirado 2 pasos, la fuerza restauradora es 2 veces mayor',
    fr: 'Étiré de 2 crans, la force de rappel est 2 fois plus grande',
    hi: '2 खाने खींचने पर प्रत्यानयन बल भी 2 गुना',
    id: 'Diregangkan 2 langkah, gaya pemulihnya juga 2 kali',
    pt: 'Esticado 2 passos, a força restauradora é 2 vezes maior',
  },
  'caption.hold3': {
    ko: '3칸 늘이면 되돌리는 힘도 3배',
    en: 'Stretched 3 steps, the restoring force is 3 times',
    ja: '3マス伸ばすと、復元力も3倍',
    zh: '拉长3格，恢复力也变为3倍',
    ar: 'عند المدّ 3 خطوات، تصبح قوة الإرجاع أيضًا 3 أضعاف',
    es: 'Estirado 3 pasos, la fuerza restauradora es 3 veces mayor',
    fr: 'Étiré de 3 crans, la force de rappel est 3 fois plus grande',
    hi: '3 खाने खींचने पर प्रत्यानयन बल भी 3 गुना',
    id: 'Diregangkan 3 langkah, gaya pemulihnya juga 3 kali',
    pt: 'Esticado 3 passos, a força restauradora é 3 vezes maior',
  },
  'caption.hold4': {
    ko: '4칸 늘이면 되돌리는 힘도 4배',
    en: 'Stretched 4 steps, the restoring force is 4 times',
    ja: '4マス伸ばすと、復元力も4倍',
    zh: '拉长4格，恢复力也变为4倍',
    ar: 'عند المدّ 4 خطوات، تصبح قوة الإرجاع أيضًا 4 أضعاف',
    es: 'Estirado 4 pasos, la fuerza restauradora es 4 veces mayor',
    fr: 'Étiré de 4 crans, la force de rappel est 4 fois plus grande',
    hi: '4 खाने खींचने पर प्रत्यानयन बल भी 4 गुना',
    id: 'Diregangkan 4 langkah, gaya pemulihnya juga 4 kali',
    pt: 'Esticado 4 passos, a força restauradora é 4 vezes maior',
  },
  'caption.final': {
    ko: '늘인 길이와 되돌리는 힘이 같은 비율로 커졌다',
    en: 'The stretch and the restoring force grew in the same proportion',
    ja: '伸びと復元力が同じ割合で大きくなった',
    zh: '伸长量和恢复力按相同比例增大',
    ar: 'ازدادت الاستطالة وقوة الإرجاع بالنسبة نفسها',
    es: 'El estiramiento y la fuerza restauradora crecieron en la misma proporción',
    fr: 'L’allongement et la force de rappel ont augmenté dans la même proportion',
    hi: 'खिंचाव और प्रत्यानयन बल एक ही अनुपात में बढ़े',
    id: 'Pertambahan panjang dan gaya pemulih bertambah dengan perbandingan yang sama',
    pt: 'O alongamento e a força restauradora cresceram na mesma proporção',
  },
  'caption.return': {
    ko: '줄여 주면 되돌리는 힘도 함께 줄어든다',
    en: 'Let it shorten and the restoring force shrinks with it',
    ja: '縮めると、復元力も一緒に小さくなる',
    zh: '让它缩短，恢复力也随之减小',
    ar: 'عندما يقصر النابض، تتناقص قوة الإرجاع معه',
    es: 'Al dejar que se acorte, la fuerza restauradora disminuye con él',
    fr: 'Quand il raccourcit, la force de rappel diminue avec lui',
    hi: 'इसे छोटा होने दें तो प्रत्यानयन बल भी साथ घटता है',
    id: 'Saat dibiarkan memendek, gaya pemulih ikut mengecil',
    pt: 'Ao deixá-la encurtar, a força restauradora diminui junto',
  },
  'caption.rest': {
    ko: '원래 길이에서는 되돌리는 힘이 없다',
    en: 'At its natural length there is no restoring force',
    ja: '自然長では復元力はない',
    zh: '在原长处没有恢复力',
    ar: 'عند الطول الطبيعي لا توجد قوة إرجاع',
    es: 'En su longitud natural no hay fuerza restauradora',
    fr: 'À sa longueur à vide, il n’y a pas de force de rappel',
    hi: 'मूल लंबाई पर कोई प्रत्यानयन बल नहीं होता',
    id: 'Pada panjang awalnya tidak ada gaya pemulih',
    pt: 'No comprimento natural não há força restauradora',
  },
} satisfies Record<string, LocalizedText>);

export type SpringForceMessageKey = keyof typeof springForceMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: SpringForceMessageKey): LocalizedText => springForceMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: SpringForceMessageKey): string {
  return k;
}

const HOLD_CAPTIONS: readonly SpringForceMessageKey[] = [
  'caption.hold1',
  'caption.hold2',
  'caption.hold3',
  'caption.hold4',
];

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const springForceSchema: BundleSchema = {
  id: SPRING_FORCE_ID,
  label: text('label.title'),
  category: 'mechanics',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다. 자동 진행만으로 늘임과 힘의 비례가 드러난다.
  parameters: [],

  stages: [{ id: 'default', label: text('label.stage'), constants: {} }],
  environments: [],
  views: [{ id: 'default', label: text('label.view'), default: true }],

  /**
   * 원본은 그림 860 × 270 + 캔버스 밖 캡션 한 줄이었다. 캡션이 캔버스 안(화면 고정
   * 줄)으로 들어오고 러너가 사방에 여백을 두므로 그만큼 더 잡는다.
   */
  canvas: { height: 340, minHeight: 300 },

  /** 원본은 `(t + 0.45) mod 10.5` 로 열었다 — 첫 칸을 당기는 중에 도착한다. */
  startAt: OFFSET,

  /**
   * 한 주기 10.5 s — (당김 0.9 → 멈춤 0.9) × 4 → 마지막 멈춤 1.3 → 되돌아감 1.5 → 쉼 0.5.
   * 당김과 되돌아감에만 이징을 건다. 멈춤의 캡션은 칸마다 다르다.
   */
  timeline: {
    phases: [
      ...Array.from({ length: STEPS }, (_, k) => [
        {
          id: moveId(k + 1),
          duration: MOVE,
          ease: 'smooth' as const,
          caption: key(k === 0 ? 'caption.move1' : 'caption.moveMore'),
        },
        { id: holdId(k + 1), duration: HOLD, caption: key(HOLD_CAPTIONS[k]!) },
      ]).flat(),
      { id: 'final', duration: FINAL_HOLD, caption: key('caption.final') },
      { id: 'return', duration: RETURN, ease: 'smooth', caption: key('caption.return') },
      { id: 'rest', duration: REST, caption: key('caption.rest') },
    ],
  },

  // 원본이 그린 순서대로 겹친다 — 벽 · 원래 길이 선 · 눈금 · 용수철 · 물체 · 손잡이 · 힘 · 자국.
  drawOrder: 'scene',

  // 슬롯 하나. 원본의 캔버스 아래 캡션 자리 — 왼쪽 한 줄, 16px, 먹색. 바로 바뀐다.
  caption: {
    anchor: { screen: 'bottom-left' },
    align: 'left',
    fontSize: 16,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  // 그리드도 카메라 버튼도 없다 (기본값). 잴 것은 늘임 눈금 한 줄이면 된다.

  messages: springForceMessages,
};
