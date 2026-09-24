// ========================================================================
// buoyant-force-as-force — 선언
// ========================================================================
// 질문: 물에 담근 물체는 가벼워지는가 — 무게가 줄어드는 것인가.
//
// 무게는 그대로다. 잠긴 만큼 물이 위로 떠받쳐 용수철이 들어야 할 몫이 줄어든다.
// 다 잠긴 뒤로는 더 깊이 가도 그 힘이 커지지 않는다.
//
// 값은 모두 원본(tasks/piece-lab/buoyant-force-as-force/index.html)에서 그대로 옮겼다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:buoyant-force-as-force` 와 문자 그대로 일치한다 (C4). */
export const BUOYANT_FORCE_AS_FORCE_ID = 'buoyant-force-as-force';

// ------------------------------------------------------------------------
// 평형 — 원본 상수 (원본 캔버스 px)
// ------------------------------------------------------------------------

export const PHYSICS = {
  /** 수면 높이(원본 y, 아래로 자란다). */
  waterY: 210,
  /** 물체 세로 — 잠길 수 있는 깊이 전체. */
  blockH: 50,
  /** 힘을 받지 않을 때 용수철 길이. */
  restLength: 30,
  /** 무게 전체를 당길 때 늘어나는 길이. */
  extPerWeight: 50,
  /** 다 잠겼을 때 물이 미는 힘 / 무게. */
  beta: 0.6,
  /** 손잡이(용수철 윗끝) 가장 높은 자리 · 가장 낮은 자리. */
  supportTop: 64,
  supportBottom: 180,
  /** 평형 반복 횟수. */
  iterations: 80,
  /** 캡션이 「물 밖」 「다 잠김」 으로 읽는 잠긴 깊이 여유(px). */
  captionSlack: 0.5,
} as const;

// ------------------------------------------------------------------------
// 시간표 — 원본 상수
// ------------------------------------------------------------------------

/** 한 번 내려갔다 올라오는 데 걸리는 초. */
export const PERIOD = 16;
/** 내려가는 단계 · 올라오는 단계. 가장 높은 자리에서 시작한다. */
export const LOWER = PERIOD / 2;
export const RAISE = PERIOD / 2;
/**
 * 원본은 `cos(2πt/16 + 1.75)` 로 열었다 — 가장 높은 자리를 지난 지 1.75 rad 만큼 된
 * 시각이다. 초로 바꾸면 4.456 s. 도착한 순간 물체는 절반 넘게 잠긴 채 내려가는 중이다.
 */
export const START_AT = (1.75 / (2 * Math.PI)) * PERIOD;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const buoyantForceAsForceMessages = Object.freeze({
  'label.title': {
    ko: '부력(힘으로서)',
    en: 'Buoyant force as a force',
    ja: '力としての浮力',
    zh: '作为力的浮力',
    ar: 'قوة الطفو بوصفها قوة',
    es: 'El empuje como fuerza',
    fr: 'La poussée d’Archimède en tant que force',
    hi: 'बल के रूप में उत्प्लावन बल',
    id: 'Gaya apung sebagai gaya',
    pt: 'O empuxo como força',
  },
  'label.operation': {
    ko: '유체가 위로 미는 힘',
    en: 'The upward push of a fluid',
    ja: '流体が上へ押す力',
    zh: '流体向上的推力',
    ar: 'دفع المائع إلى الأعلى',
    es: 'El empuje hacia arriba de un fluido',
    fr: 'La poussée vers le haut d’un fluide',
    hi: 'तरल का ऊपर की ओर धक्का',
    id: 'Dorongan fluida ke atas',
    pt: 'O empurrão para cima de um fluido',
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
  /** 화살표 이름 셋. 색이 아니라 이름으로 가른다. */
  'label.weight': {
    ko: '무게',
    en: 'weight',
    ja: '重さ',
    zh: '重力',
    ar: 'الوزن',
    es: 'peso',
    fr: 'poids',
    hi: 'भार',
    id: 'berat',
    pt: 'peso',
  },
  'label.buoyancy': {
    ko: '물이 미는 힘',
    en: 'push of the water',
    ja: '水が押す力',
    zh: '水的推力',
    ar: 'دفع الماء',
    es: 'empuje del agua',
    fr: 'poussée de l’eau',
    hi: 'पानी का धक्का',
    id: 'dorongan air',
    pt: 'empurrão da água',
  },
  'label.tension': {
    ko: '용수철이 당기는 힘',
    en: 'pull of the spring',
    ja: 'ばねが引く力',
    zh: '弹簧的拉力',
    ar: 'شدّ النابض',
    es: 'tirón del resorte',
    fr: 'traction du ressort',
    hi: 'स्प्रिंग का खिंचाव',
    id: 'tarikan pegas',
    pt: 'puxão da mola',
  },
  'caption.out': {
    ko: '물 밖에서는 용수철이 무게를 혼자 떠받친다',
    en: 'Out of the water, the spring holds up the whole weight alone',
    ja: '水の外では、ばねが重さをひとりで支える',
    zh: '在水外，弹簧独自托住全部重力',
    ar: 'خارج الماء، يحمل النابض الوزن كله وحده',
    es: 'Fuera del agua, el resorte sostiene todo el peso él solo',
    fr: 'Hors de l’eau, le ressort soutient seul tout le poids',
    hi: 'पानी के बाहर स्प्रिंग अकेले पूरा भार थामती है',
    id: 'Di luar air, pegas menahan seluruh berat sendirian',
    pt: 'Fora da água, a mola sustenta sozinha todo o peso',
  },
  'caption.partial': {
    ko: '잠긴 만큼 물이 떠받쳐, 용수철이 그만큼 덜 늘어난다',
    en: 'The water holds up as much as is submerged, so the spring stretches that much less',
    ja: '沈んだ分だけ水が支え、ばねはそのぶん伸びが小さくなる',
    zh: '浸入多少，水就托住多少，弹簧也就少伸长多少',
    ar: 'يحمل الماء بقدر ما انغمر، فيستطيل النابض أقل بذلك القدر',
    es: 'El agua sostiene tanto como está sumergido, así que el resorte se estira eso de menos',
    fr: 'L’eau soutient autant que la partie immergée, donc le ressort s’allonge d’autant moins',
    hi: 'जितना डूबा है उतना पानी थामता है, इसलिए स्प्रिंग उतनी ही कम खिंचती है',
    id: 'Air menahan sebanyak bagian yang tercelup, sehingga pegas meregang lebih sedikit sebanyak itu',
    pt: 'A água sustenta tanto quanto está submerso, então a mola estica isso a menos',
  },
  'caption.full': {
    ko: '다 잠기면 더 깊이 내려가도 물이 미는 힘은 그대로다',
    en: 'Once fully submerged, going deeper does not change the push of the water',
    ja: '全部沈むと、さらに深く下がっても水が押す力は変わらない',
    zh: '一旦完全浸没，再往深处下沉，水的推力也不变',
    ar: 'بعد الانغمار الكامل، لا يغيّر النزول أعمق دفعَ الماء',
    es: 'Una vez sumergido del todo, bajar más no cambia el empuje del agua',
    fr: 'Une fois entièrement immergé, descendre plus bas ne change pas la poussée de l’eau',
    hi: 'पूरी तरह डूब जाने के बाद और गहराई में जाने से पानी का धक्का नहीं बदलता',
    id: 'Setelah tercelup seluruhnya, turun lebih dalam tidak mengubah dorongan air',
    pt: 'Uma vez totalmente submerso, descer mais não muda o empurrão da água',
  },
} satisfies Record<string, LocalizedText>);

export type BuoyantForceAsForceMessageKey = keyof typeof buoyantForceAsForceMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: BuoyantForceAsForceMessageKey): LocalizedText => buoyantForceAsForceMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: BuoyantForceAsForceMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const buoyantForceAsForceSchema: BundleSchema = {
  id: BUOYANT_FORCE_AS_FORCE_ID,
  label: text('label.title'),
  category: 'mechanics',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다. 한 주기가 물 밖 · 일부 잠김 · 다 잠김 세 상태를 모두 지나며 주장을 마친다.
  parameters: [],

  stages: [{ id: 'default', label: text('label.stage'), constants: {} }],
  environments: [],
  views: [{ id: 'default', label: text('label.view'), default: true }],

  /** 원본은 그림 860 × 360 + 캔버스 밖 캡션 한 줄이었다. 캡션이 캔버스 안으로 들어온 만큼 더 잡는다. */
  canvas: { height: 430, minHeight: 380 },

  startAt: START_AT,

  /**
   * 한 주기 16 s — 손잡이가 가장 높은 자리에서 내려가고(lower 8) 다시 올라온다(raise 8).
   * 원본의 코사인 흐름을 두 단계의 `smooth` 로 옮겼다(NOTES (a)).
   *
   * 단계는 캡션을 말하지 않는다. 문장이 갈리는 것은 시각이 아니라 **잠긴 깊이**(상태)다
   * — 아래 `caption.cases`.
   */
  timeline: {
    phases: [
      { id: 'lower', duration: LOWER, ease: 'smooth' },
      { id: 'raise', duration: RAISE, ease: 'smooth' },
    ],
  },

  // 원본이 그린 순서대로 겹친다 — 물통 · 손잡이 · 용수철 · 물체 · 물(물체 위 덧칠) · 힘 화살표.
  drawOrder: 'scene',

  /**
   * 슬롯 하나. 원본의 캔버스 아래 가운데 16 px 한 줄. 바로 바뀐다.
   *
   * 원본은 매 프레임 잠긴 깊이로 세 문장 중 하나를 골랐다(0 / 사이 / 최대). 방향(내려감 ·
   * 올라옴)에 기대지 않는 문장이라 어느 순간에도 화면과 어긋나지 않는다. physics 가 같은
   * 판정을 state 에 두고, 아무것도 참이 아니면 「일부 잠김」 문장이다.
   */
  caption: {
    anchor: { screen: 'bottom-center' },
    align: 'center',
    fontSize: 16,
    style: { colorRole: 'ink', emphasis: 'strong' },
    text: key('caption.partial'),
    cases: [
      { when: 'out', text: key('caption.out') },
      { when: 'full', text: key('caption.full') },
    ],
  },

  // 그리드 · 카메라 버튼은 원본에 없다 — 켜지 않는다.

  messages: buoyantForceAsForceMessages,
};
