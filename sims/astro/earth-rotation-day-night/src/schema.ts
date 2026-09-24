// ========================================================================
// earth-rotation-day-night — 선언
// ========================================================================
// 질문: 낮과 밤은 왜 번갈아 오는가.
//
// 햇빛 받는 반쪽은 태양 쪽에 제자리로 있다. 움직이는 것은 지구다 — 지구가 돌며
// 그 위의 한 점(관측자)을 밝은 반쪽과 그늘 반쪽으로 번갈아 싣고 간다. 한 바퀴를
// 다 돌면 관측자는 다시 해 뜨는 자리에 오고, 그것이 하루다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// 월드 단위는 캔버스 px 에 가깝게 잡은 임의 단위, y 는 위.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:earth-rotation-day-night` 와 문자 그대로 일치한다 (C4). */
export const EARTH_ROTATION_DAY_NIGHT_ID = 'earth-rotation-day-night';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/**
 * 자전 방향. +1 은 북극 위에서 내려다볼 때 반시계 — 실제 지구다. −1 로 바꾸면
 * 해 뜨는 자리가 반대쪽 경계로 옮겨 간다(관측자가 늘 그늘에서 햇빛으로 들어서는 경계).
 */
export const SPIN = 1;

// ------------------------------------------------------------------------
// 배치 — 월드 단위(가로 840 · 세로 340 판), y 위
// ------------------------------------------------------------------------

export const CANVAS_W = 840;
export const CANVAS_H = 340;

/** 태양이 있는 쪽(라디안, 월드 +x 에서 반시계). 왼쪽 — 햇빛이 왼쪽에서 들어온다. */
export const SUN_ANGLE = Math.PI;

/** 북극 위에서 내려다본 지구 — 가운데가 북극. */
export const EARTH = { cx: 290, cy: 185, R: 110 } as const;
/** 도는 지구를 드러내는 경선 살의 수(가운데를 지나는 지름 수). */
export const MERIDIAN_COUNT = 6;

/** 관측자 — 가장자리에 선 사람. 몸(선)이 지표에서 바깥으로, 머리(원)가 그 끝. */
export const OBSERVER = { footGap: 2, bodyTo: 17, headAt: 23, headR: 5.5 } as const;

/** 자전 방향 화살(굽은 화살) — 지구 오른쪽 위 바깥. 각은 라디안. */
export const SPIN_ARROW = { radius: EARTH.R + 46, from: 0.3, to: 1.0, headLen: 28, labelRadius: EARTH.R + 66 } as const;

/** 햇빛 줄무늬 — 왼쪽에서 오른쪽으로 흐르는 짧은 가로 획. 지구에 닿으면 멈춘다. */
export const RAYS = {
  yFrom: 40,
  yTo: 322,
  rowStep: 18,
  dash: 22,
  pitch: 46,
  stagger: 23,
  speed: 70,
  xMin: 12,
  /** 지구 표면에서 떨어져 멈추는 거리. */
  surfaceGap: 5,
} as const;

/** 관측자가 겪는 낮 · 밤 띠 — 한 바퀴를 가로 길이 전체로 편다. */
export const STRIP = { x0: 530, x1: 810, cy: 196, h: 34, cells: 360 } as const;
/** 띠 아래 눈금선의 길이와 이름표 높이, 띠 위 「낮 · 밤」 이름표 높이, 띠 제목 높이. */
export const STRIP_TICK = { len: 8, labelY: 153 } as const;
export const STRIP_HALF_LABEL_Y = 228;
export const STRIP_TITLE_Y = 262;
/** 「한 바퀴 = 하루」 치수선 높이. */
export const STRIP_DIMENSION_Y = 116;
/** 관측자의 지금을 띠 위에 짚는 선이 띠 위 · 아래로 넘치는 길이. */
export const STRIP_CURSOR_OVERHANG = 7;

/** 그늘 반쪽의 빛 세기 — 0 이면 바탕 없이 새까맣다. 햇빛 반쪽은 1. */
export const NIGHT_LIGHT = 0.04;

/**
 * 고정 경계. 판 전체 + 아래 캡션 두 줄 자리. 캡션 슬롯이 그림을 덮지 않게 세로를
 * 아래로 늘렸다 (moon-phases 와 같은 까닭, 장부 G24).
 */
export const SCENE_BOUNDS = { minX: 0, maxX: CANVAS_W, minY: -56, maxY: CANVAS_H } as const;

// ------------------------------------------------------------------------
// 시간표 — 한 바퀴를 네 토막(해 뜸 → 정오 → 해 짐 → 자정 → 해 뜸)으로
// ------------------------------------------------------------------------

/** 네 토막 각각의 길이(초). 한 바퀴 = 넷의 합. */
export const QUARTER = 3.5;
/** 도착한 순간 — 해가 막 뜬 뒤, 관측자가 햇빛 반쪽에 들어선 자리. */
export const START_AT = 1.0;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const earthRotationDayNightMessages = Object.freeze({
  'label.title': {
    ko: '자전과 낮과 밤',
    en: 'Earth’s rotation, day and night',
    ja: '地球の自転と昼夜',
    zh: '地球自转与昼夜',
    ar: 'دوران الأرض والليل والنهار',
    es: 'La rotación de la Tierra, el día y la noche',
    fr: 'La rotation de la Terre, le jour et la nuit',
    hi: 'पृथ्वी का घूर्णन, दिन और रात',
    id: 'Rotasi Bumi, siang dan malam',
    pt: 'A rotação da Terra, o dia e a noite',
  },
  'label.operation': {
    ko: '도는 지구 위에서 낮과 밤이 갈리는 이유',
    en: 'Why day and night alternate on a turning Earth',
    ja: '回る地球の上で昼と夜が入れ替わる理由',
    zh: '为什么在转动的地球上昼夜交替',
    ar: 'لماذا يتعاقب الليل والنهار على أرض تدور',
    es: 'Por qué el día y la noche se alternan en una Tierra que gira',
    fr: 'Pourquoi le jour et la nuit alternent sur une Terre qui tourne',
    hi: 'घूमती पृथ्वी पर दिन और रात बारी-बारी से क्यों आते हैं',
    id: 'Mengapa siang dan malam silih berganti di Bumi yang berputar',
    pt: 'Por que o dia e a noite se alternam numa Terra que gira',
  },
  'label.stage': {
    ko: '태양과 지구',
    en: 'Sun and Earth',
    ja: '太陽と地球',
    zh: '太阳与地球',
    ar: 'الشمس والأرض',
    es: 'El Sol y la Tierra',
    fr: 'Le Soleil et la Terre',
    hi: 'सूर्य और पृथ्वी',
    id: 'Matahari dan Bumi',
    pt: 'O Sol e a Terra',
  },
  'label.view': {
    ko: '북극 위에서',
    en: 'From above the North Pole',
    ja: '北極の上から',
    zh: '从北极上方看',
    ar: 'من فوق القطب الشمالي',
    es: 'Desde encima del Polo Norte',
    fr: 'Vu au-dessus du pôle Nord',
    hi: 'उत्तरी ध्रुव के ऊपर से',
    id: 'Dari atas Kutub Utara',
    pt: 'Visto de cima do Polo Norte',
  },
  'label.sunlight': {
    ko: '태양에서 오는 햇빛 →',
    en: 'Sunlight from the Sun →',
    ja: '太陽から来る日光 →',
    zh: '来自太阳的阳光 →',
    ar: 'ضوء قادم من الشمس →',
    es: 'Luz que llega del Sol →',
    fr: 'Lumière venue du Soleil →',
    hi: 'सूर्य से आता प्रकाश →',
    id: 'Cahaya dari Matahari →',
    pt: 'Luz vinda do Sol →',
  },
  'label.topView': {
    ko: '북극 위에서 내려다본 지구',
    en: 'Earth seen from above the North Pole',
    ja: '北極の上から見下ろした地球',
    zh: '从北极上方俯视的地球',
    ar: 'الأرض كما تُرى من فوق القطب الشمالي',
    es: 'La Tierra vista desde encima del Polo Norte',
    fr: 'La Terre vue au-dessus du pôle Nord',
    hi: 'उत्तरी ध्रुव के ऊपर से देखी गई पृथ्वी',
    id: 'Bumi dilihat dari atas Kutub Utara',
    pt: 'A Terra vista de cima do Polo Norte',
  },
  'label.spin': {
    ko: '자전',
    en: 'rotation',
    ja: '自転',
    zh: '自转',
    ar: 'دوران',
    es: 'rotación',
    fr: 'rotation',
    hi: 'घूर्णन',
    id: 'rotasi',
    pt: 'rotação',
  },
  'label.stripTitle': {
    ko: '관측자가 겪는 낮과 밤',
    en: 'Day and night for the observer',
    ja: '観測者が経験する昼と夜',
    zh: '观测者经历的昼与夜',
    ar: 'الليل والنهار كما يعيشهما الراصد',
    es: 'El día y la noche para el observador',
    fr: 'Le jour et la nuit pour l’observateur',
    hi: 'प्रेक्षक के लिए दिन और रात',
    id: 'Siang dan malam bagi pengamat',
    pt: 'O dia e a noite para o observador',
  },
  'label.day': {
    ko: '낮',
    en: 'day',
    ja: '昼',
    zh: '白天',
    ar: 'نهار',
    es: 'día',
    fr: 'jour',
    hi: 'दिन',
    id: 'siang',
    pt: 'dia',
  },
  'label.night': {
    ko: '밤',
    en: 'night',
    ja: '夜',
    zh: '黑夜',
    ar: 'ليل',
    es: 'noche',
    fr: 'nuit',
    hi: 'रात',
    id: 'malam',
    pt: 'noite',
  },
  'label.sunrise': {
    ko: '해 뜸',
    en: 'sunrise',
    ja: '日の出',
    zh: '日出',
    ar: 'شروق',
    es: 'salida del sol',
    fr: 'lever du soleil',
    hi: 'सूर्योदय',
    id: 'matahari terbit',
    pt: 'nascer do sol',
  },
  'label.sunset': {
    ko: '해 짐',
    en: 'sunset',
    ja: '日の入り',
    zh: '日落',
    ar: 'غروب',
    es: 'puesta del sol',
    fr: 'coucher du soleil',
    hi: 'सूर्यास्त',
    id: 'matahari terbenam',
    pt: 'pôr do sol',
  },
  'label.oneTurn': {
    ko: '지구 한 바퀴 = 하루',
    en: 'one turn of Earth = one day',
    ja: '地球1回転 = 1日',
    zh: '地球转一圈 = 一天',
    ar: 'دورة واحدة للأرض = يوم واحد',
    es: 'una vuelta de la Tierra = un día',
    fr: 'un tour de la Terre = un jour',
    hi: 'पृथ्वी का एक चक्कर = एक दिन',
    id: 'satu putaran Bumi = satu hari',
    pt: 'uma volta da Terra = um dia',
  },
  'caption.morning': {
    ko: '지구가 돌아 관측자가 그늘 반쪽에서 햇빛 받는 반쪽으로 들어섰다 — 해가 뜨고 낮이 시작된다.',
    en: 'Earth’s turn has carried the observer out of the shaded half into the sunlit half — the Sun rises and day begins.',
    ja: '地球が回って観測者を影の半分から日の当たる半分へ運んだ — 日が昇り、昼が始まる。',
    zh: '地球的转动把观测者从背光的半球带入向光的半球 — 太阳升起，白天开始。',
    ar: 'حمل دوران الأرض الراصد من النصف المظلل إلى النصف المضاء — تشرق الشمس ويبدأ النهار.',
    es: 'El giro de la Tierra ha llevado al observador de la mitad en sombra a la mitad iluminada — sale el Sol y empieza el día.',
    fr: 'La rotation de la Terre a fait passer l’observateur de la moitié à l’ombre à la moitié éclairée — le Soleil se lève et le jour commence.',
    hi: 'पृथ्वी के घूमने से प्रेक्षक छायादार आधे भाग से निकलकर प्रकाशित आधे भाग में आ गया है — सूर्य उगता है और दिन शुरू होता है।',
    id: 'Putaran Bumi telah membawa pengamat keluar dari belahan yang gelap ke belahan yang terang — Matahari terbit dan siang dimulai.',
    pt: 'O giro da Terra levou o observador da metade na sombra para a metade iluminada — o Sol nasce e o dia começa.',
  },
  'caption.afternoon': {
    ko: '햇빛 받는 반쪽은 제자리에 있다. 그 안을 지나가는 것은 지구와 함께 도는 관측자다.',
    en: 'The sunlit half stays where it is. What passes through it is the observer, turning with Earth.',
    ja: '日の当たる半分はその場にとどまっている。その中を通り過ぎるのは、地球とともに回る観測者だ。',
    zh: '向光的半球始终留在原处。从中经过的，是随地球一起转动的观测者。',
    ar: 'يبقى النصف المضاء في مكانه. ما يمرّ عبره هو الراصد الذي يدور مع الأرض.',
    es: 'La mitad iluminada se queda donde está. Lo que la atraviesa es el observador, que gira con la Tierra.',
    fr: 'La moitié éclairée reste en place. Ce qui la traverse, c’est l’observateur, qui tourne avec la Terre.',
    hi: 'प्रकाशित आधा भाग अपनी जगह बना रहता है। उसमें से गुज़रता है प्रेक्षक, जो पृथ्वी के साथ घूम रहा है।',
    id: 'Belahan yang terang tetap di tempatnya. Yang melintasinya adalah pengamat, yang berputar bersama Bumi.',
    pt: 'A metade iluminada fica onde está. O que passa por ela é o observador, girando com a Terra.',
  },
  'caption.evening': {
    ko: '관측자가 햇빛 받는 반쪽을 벗어나 그늘 반쪽으로 넘어갔다 — 해가 지고 밤이 된다.',
    en: 'The observer has passed out of the sunlit half into the shaded half — the Sun sets and night falls.',
    ja: '観測者は日の当たる半分を出て影の半分へ移った — 日が沈み、夜になる。',
    zh: '观测者离开向光的半球，进入背光的半球 — 太阳落下，夜晚来临。',
    ar: 'خرج الراصد من النصف المضاء إلى النصف المظلل — تغرب الشمس ويحلّ الليل.',
    es: 'El observador ha pasado de la mitad iluminada a la mitad en sombra — se pone el Sol y cae la noche.',
    fr: 'L’observateur est passé de la moitié éclairée à la moitié à l’ombre — le Soleil se couche et la nuit tombe.',
    hi: 'प्रेक्षक प्रकाशित आधे भाग से निकलकर छायादार आधे भाग में चला गया है — सूर्य अस्त होता है और रात हो जाती है।',
    id: 'Pengamat telah keluar dari belahan yang terang ke belahan yang gelap — Matahari terbenam dan malam tiba.',
    pt: 'O observador passou da metade iluminada para a metade na sombra — o Sol se põe e a noite cai.',
  },
  'caption.night': {
    ko: '지구가 계속 돌아 관측자를 다시 햇빛 쪽으로 싣고 간다. 한 바퀴를 채우면 다시 해가 뜬다.',
    en: 'Earth keeps turning, carrying the observer back toward the sunlight. One full turn, and the Sun rises again.',
    ja: '地球は回り続け、観測者を再び日の光のほうへ運んでいく。1回転しきると、また日が昇る。',
    zh: '地球继续转动，把观测者带回阳光一侧。转满一圈，太阳又会升起。',
    ar: 'تواصل الأرض الدوران، فتعيد الراصد نحو ضوء الشمس. بعد دورة كاملة تشرق الشمس من جديد.',
    es: 'La Tierra sigue girando y devuelve al observador hacia la luz del Sol. Una vuelta completa, y el Sol vuelve a salir.',
    fr: 'La Terre continue de tourner et ramène l’observateur vers la lumière du Soleil. Un tour complet, et le Soleil se lève de nouveau.',
    hi: 'पृथ्वी घूमती रहती है और प्रेक्षक को फिर से सूर्य के प्रकाश की ओर ले जाती है। एक पूरा चक्कर होते ही सूर्य फिर उगता है।',
    id: 'Bumi terus berputar, membawa pengamat kembali ke arah cahaya Matahari. Satu putaran penuh, dan Matahari terbit lagi.',
    pt: 'A Terra continua girando, levando o observador de volta à luz do Sol. Uma volta completa, e o Sol nasce de novo.',
  },
} satisfies Record<string, LocalizedText>);

export type EarthRotationDayNightMessageKey = keyof typeof earthRotationDayNightMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: EarthRotationDayNightMessageKey): LocalizedText => earthRotationDayNightMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: EarthRotationDayNightMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const earthRotationDayNightSchema: BundleSchema = {
  id: EARTH_ROTATION_DAY_NIGHT_ID,
  label: text('label.title'),
  category: 'astro',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 지구가 돌고 있고, 한 바퀴마다 낮과 밤이 한 번씩 지나간다.
  parameters: [],

  stages: [{ id: 'sun-earth', label: text('label.stage'), constants: { spin: SPIN } }],
  environments: [],
  views: [{ id: 'north-pole', label: text('label.view'), default: true }],

  /** 판 840 × 340 + 캡션 두 줄. 세로는 지구 지름과 관측자 키 · 화살이 정한다. */
  canvas: { height: 420, minHeight: 380 },

  /**
   * 겹침이 판정 장치다 — 경선 살은 낮 · 밤 반쪽 **위**에, 관측자는 살 위에, 띠를 짚는 선은
   * 띠 위에 와야 한다. 층 순서로는 `sector`(반쪽)가 살 위로 올라올 수 있다.
   */
  drawOrder: 'scene',

  /**
   * 한 바퀴 = 해 뜸 → 정오 → 해 짐 → 자정 → 해 뜸. 네 토막이 각각 4 분의 1 바퀴다.
   * 관측자의 회전각을 이 네 토막의 진행도에서 읽으므로(physics `turnFraction` · `angleAt`),
   * 「해가 진다」 캡션이 관측자가 경계를 넘는 순간과 어긋날 수 없다. 고르게 돈다(linear).
   */
  timeline: {
    phases: [
      { id: 'morning', duration: QUARTER, ease: 'linear', caption: key('caption.morning') },
      { id: 'afternoon', duration: QUARTER, ease: 'linear', caption: key('caption.afternoon') },
      { id: 'evening', duration: QUARTER, ease: 'linear', caption: key('caption.evening') },
      { id: 'night', duration: QUARTER, ease: 'linear', caption: key('caption.night') },
    ],
  },

  /** 도착한 순간 이미 돌고 있다 — 해가 막 뜬 뒤. 0 이면 관측자가 경계 위에 서서 멎은 듯 보인다. */
  startAt: START_AT,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 자전의 정의는 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-left', offset: [16, -8] },
    align: 'left',
    fontSize: 14,
    fade: 0.3,
    style: { colorRole: 'ink', emphasis: 'medium' },
    wrapWidth: CANVAS_W - 32,
  },

  // 그리드 · 카메라 단추 없음 — 잴 것이 거리가 아니라 「어느 반쪽에 있나」 다.

  messages: earthRotationDayNightMessages,
};
