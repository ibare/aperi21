// ========================================================================
// triple-point — 선언
// ========================================================================
// 질문: 얼음 · 물 · 김이 한 그릇에 함께 머무는 것은 언제인가.
//
// 삼중점(0.01 ℃ · 611.657 Pa)에서만 셋이 함께 머물고, 그 점에서 조금만 벗어나도
// 하나만 남는다. 왼쪽 그릇에 세 몫을, 오른쪽에 삼중점 둘레만 확대한 상평형 그림을
// 두고, 한 번에 하나(온도 또는 압력)만 조금 옮긴다 — 그림 위의 점이 어느 영역으로
// 넘어가는지와 그릇 속 몫이 함께 바뀐다.
//
// 이웃 `phase-diagram` 은 그림 전체와 가열 경로(승화)를 다룬다. 여기는 삼중점 둘레만 본다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText, TimelinePhase } from '@aperi21/schema';

/** 등록 키 `aperi21:triple-point` 와 문자 그대로 일치한다 (C4). */
export const TRIPLE_POINT_ID = 'triple-point';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 물의 삼중점 온도(℃) · 압력(Pa). 화면 글자는 이 값의 문자열이다. */
export const T_TP = 0.01;
export const P_TP = 611.657;
/** 벗어나는 폭 — 온도(℃ = K) · 압력(Pa). 「조금」 의 크기. */
export const D_T = 1;
export const D_P = 40;
/**
 * 삼중점에서 세 경계의 기울기 dp/dT (Pa/K). 클라우지우스-클라페이롱 값이다.
 * 승화 50.3 · 증발 44.4 는 확대창 안에서 거의 곧다. 융해는 음수이고 거의 수직이다.
 */
export const SUB_SLOPE = 50.3;
export const VAP_SLOPE = 44.4;
export const MELT_SLOPE = -1.35e7;
/**
 * 융해선 기울어짐 과장 배율. 실제 융해선은 확대창(±100 Pa) 안에서 0.00001 K 도 기울지
 * 않아 수직선이고, 압력을 올린 점이 그 선 **위에** 얹혀 어느 쪽인지 보이지 않는다.
 * dT/dp 를 이만큼 키워 그린다 — 기울어진 방향(누르면 물 쪽)은 그대로다 (NOTES b).
 */
export const MELT_TILT_GAIN = 1e5;
/** 확대창의 반폭 — 삼중점에서 온도 ±(K) · 압력 ±(Pa). */
export const WIN_T = 1.8;
export const WIN_P = 100;
/** 삼중점에서 세 몫의 비(얼음 : 물 : 김). 합으로 나눠 쓴다. */
export const SHARE_ICE = 1;
export const SHARE_WATER = 1;
export const SHARE_VAPOR = 1;
/** 얼음 조각 수 · 김 알갱이 최대 수(김만 있을 때) · 알갱이 자리 시드 · 알갱이가 한 번 떠도는 시간(초). */
export const ICE_CUBES = 2;
export const VAPOR_DOTS = 44;
export const SEED = 7;
export const VAPOR_DRIFT_S = 3.2;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 왼쪽 그릇, 오른쪽 확대 그림.
// ------------------------------------------------------------------------

/** 그릇 안쪽 사각형. */
export const VESSEL = { x0: 0, x1: 3, y0: 0, y1: 3.2 } as const;
/** 물만 있을 때의 물 높이(그릇 안쪽 높이에 대한 몫). */
export const WATER_FULL = 0.62;
/** 얼음 조각 한 변의 최대(얼음만 있을 때, 월드). */
export const ICE_SIDE = 1.15;
/** 떠 있는 얼음이 물 위로 나오는 몫. */
export const ICE_ABOVE = 0.1;
/** 상 이름이 그릇 오른쪽 벽에서 떨어지는 거리(월드). */
export const VESSEL_LABEL_GAP = 0.18;
/** 확대 그림 사각형. */
export const DIAGRAM = { x0: 5.0, x1: 9.4, y0: 0, y1: 3.2 } as const;

/** 프레이밍은 주장의 일부다 — 매 프레임 같은 값 (원칙 6). */
export const SCENE_BOUNDS = { minX: -0.3, maxX: 9.8, minY: -1.0, maxY: 3.75 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const triplePointMessages = Object.freeze({
  'label.title': {
    ko: '삼중점',
    en: 'Triple point',
    ja: '三重点',
    zh: '三相点',
    ar: 'النقطة الثلاثية',
    es: 'Punto triple',
    fr: 'Point triple',
    hi: 'त्रिक बिंदु',
    id: 'Titik tripel',
    pt: 'Ponto triplo',
  },
  'label.operation': {
    ko: '세 상이 공존하는 조건',
    en: 'The condition where three phases coexist',
    ja: '三つの相が共存する条件',
    zh: '三相共存的条件',
    ar: 'الشرط الذي تتعايش عنده ثلاثة أطوار',
    es: 'La condición en que coexisten tres fases',
    fr: 'La condition où trois phases coexistent',
    hi: 'वह स्थिति जहाँ तीन प्रावस्थाएँ साथ रहती हैं',
    id: 'Kondisi saat tiga fase berada bersama',
    pt: 'A condição em que três fases coexistem',
  },
  'label.stage': {
    ko: '물',
    en: 'Water',
    ja: '水',
    zh: '水',
    ar: 'الماء',
    es: 'Agua',
    fr: 'Eau',
    hi: 'जल',
    id: 'Air',
    pt: 'Água',
  },
  'label.view': {
    ko: '그릇과 상평형 그림',
    en: 'Vessel and phase diagram',
    ja: '容器と状態図',
    zh: '容器与相图',
    ar: 'الوعاء ومخطط الأطوار',
    es: 'Recipiente y diagrama de fases',
    fr: 'Récipient et diagramme de phases',
    hi: 'पात्र और प्रावस्था आरेख',
    id: 'Wadah dan diagram fase',
    pt: 'Recipiente e diagrama de fases',
  },

  'label.ice': {
    ko: '얼음',
    en: 'ice',
    ja: '氷',
    zh: '冰',
    ar: 'جليد',
    es: 'hielo',
    fr: 'glace',
    hi: 'बर्फ़',
    id: 'es',
    pt: 'gelo',
  },
  'label.water': {
    ko: '물',
    en: 'water',
    ja: '水',
    zh: '水',
    ar: 'الماء',
    es: 'agua',
    fr: 'eau',
    hi: 'जल',
    id: 'air',
    pt: 'água',
  },
  'label.vapor': {
    ko: '김',
    en: 'vapor',
    ja: '水蒸気',
    zh: '水蒸气',
    ar: 'بخار',
    es: 'vapor',
    fr: 'vapeur',
    hi: 'वाष्प',
    id: 'uap',
    pt: 'vapor',
  },
  'label.triplePoint': {
    ko: '삼중점',
    en: 'triple point',
    ja: '三重点',
    zh: '三相点',
    ar: 'النقطة الثلاثية',
    es: 'punto triple',
    fr: 'point triple',
    hi: 'त्रिक बिंदु',
    id: 'titik tripel',
    pt: 'ponto triplo',
  },
  'label.tempAxis': {
    ko: '온도 →',
    en: 'temperature →',
    ja: '温度 →',
    zh: '温度 →',
    ar: 'درجة الحرارة →',
    es: 'temperatura →',
    fr: 'température →',
    hi: 'ताप →',
    id: 'suhu →',
    pt: 'temperatura →',
  },
  'label.pressAxis': {
    ko: '압력 ↑',
    en: 'pressure ↑',
    ja: '圧力 ↑',
    zh: '压强 ↑',
    ar: 'الضغط ↑',
    es: 'presión ↑',
    fr: 'pression ↑',
    hi: 'दाब ↑',
    id: 'tekanan ↑',
    pt: 'pressão ↑',
  },
  /** 눈금 · 벗어난 폭 글자. 값은 선언값 그대로 끼운다 (S-piece 유효숫자). */
  'label.tempTick': {
    ko: '{t} ℃',
    en: '{t} °C',
    ja: '{t} °C',
    zh: '{t} °C',
    ar: '{t} °C',
    es: '{t} °C',
    fr: '{t} °C',
    hi: '{t} °C',
    id: '{t} °C',
    pt: '{t} °C',
  },
  'label.pressTick': {
    ko: '{p} Pa',
    en: '{p} Pa',
    ja: '{p} Pa',
    zh: '{p} Pa',
    ar: '{p} Pa',
    es: '{p} Pa',
    fr: '{p} Pa',
    hi: '{p} Pa',
    id: '{p} Pa',
    pt: '{p} Pa',
  },
  'label.tempUp': {
    ko: '+{d} ℃',
    en: '+{d} °C',
    ja: '+{d} °C',
    zh: '+{d} °C',
    ar: '+{d} °C',
    es: '+{d} °C',
    fr: '+{d} °C',
    hi: '+{d} °C',
    id: '+{d} °C',
    pt: '+{d} °C',
  },
  'label.tempDown': {
    ko: '−{d} ℃',
    en: '−{d} °C',
    ja: '−{d} °C',
    zh: '−{d} °C',
    ar: '−{d} °C',
    es: '−{d} °C',
    fr: '−{d} °C',
    hi: '−{d} °C',
    id: '−{d} °C',
    pt: '−{d} °C',
  },
  'label.pressUp': {
    ko: '+{d} Pa',
    en: '+{d} Pa',
    ja: '+{d} Pa',
    zh: '+{d} Pa',
    ar: '+{d} Pa',
    es: '+{d} Pa',
    fr: '+{d} Pa',
    hi: '+{d} Pa',
    id: '+{d} Pa',
    pt: '+{d} Pa',
  },
  'label.pressDown': {
    ko: '−{d} Pa',
    en: '−{d} Pa',
    ja: '−{d} Pa',
    zh: '−{d} Pa',
    ar: '−{d} Pa',
    es: '−{d} Pa',
    fr: '−{d} Pa',
    hi: '−{d} Pa',
    id: '−{d} Pa',
    pt: '−{d} Pa',
  },

  'caption.together': {
    ko: '{t} ℃ · {p} Pa — 얼음 · 물 · 김이 한 그릇에 함께 머문다',
    en: '{t} °C · {p} Pa — ice, water and vapor stay together in one vessel',
    ja: '{t} °C · {p} Pa — 氷・水・水蒸気が一つの容器にともに存在する',
    zh: '{t} °C · {p} Pa——冰、水和水蒸气同处一个容器中',
    ar: '{t} °C · {p} Pa — الجليد والماء والبخار معًا في وعاء واحد',
    es: '{t} °C · {p} Pa — hielo, agua y vapor permanecen juntos en un mismo recipiente',
    fr: '{t} °C · {p} Pa — glace, eau et vapeur restent ensemble dans un même récipient',
    hi: '{t} °C · {p} Pa — बर्फ, जल और वाष्प एक ही पात्र में साथ रहते हैं',
    id: '{t} °C · {p} Pa — es, air, dan uap berada bersama dalam satu wadah',
    pt: '{t} °C · {p} Pa — gelo, água e vapor ficam juntos em um só recipiente',
  },
  'caption.warm': {
    ko: '압력은 그대로 두고 온도를 {dt} ℃ 올린다',
    en: 'Pressure held, the temperature goes up by {dt} °C',
    ja: '圧力はそのままで、温度を{dt} °C上げる',
    zh: '压强保持不变，温度升高 {dt} °C',
    ar: 'مع تثبيت الضغط، ترتفع درجة الحرارة بمقدار {dt} °C',
    es: 'Con la presión fija, la temperatura sube {dt} °C',
    fr: 'À pression constante, la température monte de {dt} °C',
    hi: 'दाब स्थिर रखकर ताप {dt} °C बढ़ता है',
    id: 'Tekanan tetap, suhu naik {dt} °C',
    pt: 'Com a pressão mantida, a temperatura sobe {dt} °C',
  },
  'caption.cool': {
    ko: '압력은 그대로 두고 온도를 {dt} ℃ 내린다',
    en: 'Pressure held, the temperature goes down by {dt} °C',
    ja: '圧力はそのままで、温度を{dt} °C下げる',
    zh: '压强保持不变，温度降低 {dt} °C',
    ar: 'مع تثبيت الضغط، تنخفض درجة الحرارة بمقدار {dt} °C',
    es: 'Con la presión fija, la temperatura baja {dt} °C',
    fr: 'À pression constante, la température baisse de {dt} °C',
    hi: 'दाब स्थिर रखकर ताप {dt} °C घटता है',
    id: 'Tekanan tetap, suhu turun {dt} °C',
    pt: 'Com a pressão mantida, a temperatura desce {dt} °C',
  },
  'caption.thin': {
    ko: '온도는 그대로 두고 압력을 {dp} Pa 낮춘다',
    en: 'Temperature held, the pressure goes down by {dp} Pa',
    ja: '温度はそのままで、圧力を{dp} Pa下げる',
    zh: '温度保持不变，压强降低 {dp} Pa',
    ar: 'مع تثبيت درجة الحرارة، ينخفض الضغط بمقدار {dp} Pa',
    es: 'Con la temperatura fija, la presión baja {dp} Pa',
    fr: 'À température constante, la pression baisse de {dp} Pa',
    hi: 'ताप स्थिर रखकर दाब {dp} Pa घटता है',
    id: 'Suhu tetap, tekanan turun {dp} Pa',
    pt: 'Com a temperatura mantida, a pressão desce {dp} Pa',
  },
  'caption.squeeze': {
    ko: '온도는 그대로 두고 압력을 {dp} Pa 높인다',
    en: 'Temperature held, the pressure goes up by {dp} Pa',
    ja: '温度はそのままで、圧力を{dp} Pa上げる',
    zh: '温度保持不变，压强升高 {dp} Pa',
    ar: 'مع تثبيت درجة الحرارة، يرتفع الضغط بمقدار {dp} Pa',
    es: 'Con la temperatura fija, la presión sube {dp} Pa',
    fr: 'À température constante, la pression monte de {dp} Pa',
    hi: 'ताप स्थिर रखकर दाब {dp} Pa बढ़ता है',
    id: 'Suhu tetap, tekanan naik {dp} Pa',
    pt: 'Com a temperatura mantida, a pressão sobe {dp} Pa',
  },
  'caption.toVapor': {
    ko: '얼음과 물이 김으로 바뀐다',
    en: 'The ice and the water turn into vapor',
    ja: '氷と水が水蒸気に変わる',
    zh: '冰和水变成水蒸气',
    ar: 'يتحول الجليد والماء إلى بخار',
    es: 'El hielo y el agua se convierten en vapor',
    fr: 'La glace et l’eau se changent en vapeur',
    hi: 'बर्फ और जल वाष्प में बदल जाते हैं',
    id: 'Es dan air berubah menjadi uap',
    pt: 'O gelo e a água viram vapor',
  },
  'caption.toIce': {
    ko: '물과 김이 얼음으로 바뀐다',
    en: 'The water and the vapor turn into ice',
    ja: '水と水蒸気が氷に変わる',
    zh: '水和水蒸气变成冰',
    ar: 'يتحول الماء والبخار إلى جليد',
    es: 'El agua y el vapor se convierten en hielo',
    fr: 'L’eau et la vapeur se changent en glace',
    hi: 'जल और वाष्प बर्फ में बदल जाते हैं',
    id: 'Air dan uap berubah menjadi es',
    pt: 'A água e o vapor viram gelo',
  },
  'caption.toWater': {
    ko: '얼음과 김이 물로 바뀐다',
    en: 'The ice and the vapor turn into water',
    ja: '氷と水蒸気が水に変わる',
    zh: '冰和水蒸气变成水',
    ar: 'يتحول الجليد والبخار إلى ماء',
    es: 'El hielo y el vapor se convierten en agua',
    fr: 'La glace et la vapeur se changent en eau',
    hi: 'बर्फ और वाष्प जल में बदल जाते हैं',
    id: 'Es dan uap berubah menjadi air',
    pt: 'O gelo e o vapor viram água',
  },
  'caption.onlyVapor': {
    ko: '점은 김 영역에 있다 — 그릇에는 김만 남았다',
    en: 'The dot is in the vapor region — only vapor is left in the vessel',
    ja: '点は水蒸気の領域にある — 容器には水蒸気だけが残った',
    zh: '点位于水蒸气区域——容器里只剩下水蒸气',
    ar: 'النقطة في منطقة البخار — لم يبقَ في الوعاء إلا البخار',
    es: 'El punto está en la región del vapor — en el recipiente solo queda vapor',
    fr: 'Le point est dans la région de la vapeur — il ne reste que de la vapeur dans le récipient',
    hi: 'बिंदु वाष्प क्षेत्र में है — पात्र में केवल वाष्प बची है',
    id: 'Titik berada di daerah uap — di wadah hanya tersisa uap',
    pt: 'O ponto está na região do vapor — só resta vapor no recipiente',
  },
  'caption.onlyIce': {
    ko: '점은 얼음 영역에 있다 — 그릇에는 얼음만 남았다',
    en: 'The dot is in the ice region — only ice is left in the vessel',
    ja: '点は氷の領域にある — 容器には氷だけが残った',
    zh: '点位于冰区域——容器里只剩下冰',
    ar: 'النقطة في منطقة الجليد — لم يبقَ في الوعاء إلا الجليد',
    es: 'El punto está en la región del hielo — en el recipiente solo queda hielo',
    fr: 'Le point est dans la région de la glace — il ne reste que de la glace dans le récipient',
    hi: 'बिंदु बर्फ क्षेत्र में है — पात्र में केवल बर्फ बची है',
    id: 'Titik berada di daerah es — di wadah hanya tersisa es',
    pt: 'O ponto está na região do gelo — só resta gelo no recipiente',
  },
  'caption.onlyWater': {
    ko: '점은 물 영역에 있다 — 그릇에는 물만 남았다',
    en: 'The dot is in the water region — only water is left in the vessel',
    ja: '点は水の領域にある — 容器には水だけが残った',
    zh: '点位于水区域——容器里只剩下水',
    ar: 'النقطة في منطقة الماء — لم يبقَ في الوعاء إلا الماء',
    es: 'El punto está en la región del agua — en el recipiente solo queda agua',
    fr: 'Le point est dans la région de l’eau — il ne reste que de l’eau dans le récipient',
    hi: 'बिंदु जल क्षेत्र में है — पात्र में केवल जल बचा है',
    id: 'Titik berada di daerah air — di wadah hanya tersisa air',
    pt: 'O ponto está na região da água — só resta água no recipiente',
  },
  'caption.back': {
    ko: '점을 삼중점으로 되돌리고 세 몫을 처음처럼 놓는다',
    en: 'The dot goes back to the triple point, and the three shares are set as before',
    ja: '点を三重点に戻し、三つの割合を最初のように置く',
    zh: '点回到三相点，三部分的份额恢复如初',
    ar: 'تعود النقطة إلى النقطة الثلاثية، وتُعاد الحصص الثلاث كما كانت',
    es: 'El punto vuelve al punto triple y las tres partes quedan como al principio',
    fr: 'Le point revient au point triple et les trois parts reprennent leur place initiale',
    hi: 'बिंदु त्रिक बिंदु पर लौटता है, और तीनों हिस्से पहले जैसे रखे जाते हैं',
    id: 'Titik kembali ke titik tripel, dan ketiga bagian diatur seperti semula',
    pt: 'O ponto volta ao ponto triplo e as três partes ficam como no início',
  },
} satisfies Record<string, LocalizedText>);

export type TriplePointMessageKey = keyof typeof triplePointMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: TriplePointMessageKey): LocalizedText => triplePointMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: TriplePointMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// 벗어남 네 번 — 무엇을 붙들고 무엇을 어느 쪽으로 옮기는가
// ------------------------------------------------------------------------

/**
 * 벗어남 하나. `axis` 가 옮기는 양(다른 하나는 붙든다), `sign` 이 방향이다.
 * **어느 상이 남는지는 여기 적지 않는다** — 옮긴 점이 확대 그림의 어느 영역에
 * 드는지를 물리(`phaseAt`)가 판정한다.
 *
 * 단계 이름은 `${id}-tp` · `-move` · `-change` · `-dwell` · `-back` 이다.
 */
export interface Excursion {
  id: 'warm' | 'cool' | 'thin' | 'squeeze';
  axis: 'T' | 'p';
  sign: 1 | -1;
  /** 벗어난 폭 글자(화살표 옆). */
  tag: TriplePointMessageKey;
}

export const EXCURSIONS: readonly Excursion[] = [
  { id: 'warm', axis: 'T', sign: 1, tag: 'label.tempUp' },
  { id: 'cool', axis: 'T', sign: -1, tag: 'label.tempDown' },
  { id: 'thin', axis: 'p', sign: -1, tag: 'label.pressDown' },
  { id: 'squeeze', axis: 'p', sign: 1, tag: 'label.pressUp' },
];

/** 단계 이름. */
export const phaseId = (ex: Excursion, part: 'tp' | 'move' | 'change' | 'dwell' | 'back'): string =>
  `${ex.id}-${part}`;

/** 단계 길이(초) — 삼중점 머묾 · 옮김 · 바뀜 · 결과 머묾 · 되돌림. */
const TP_S = 1.8;
const MOVE_S = 1.1;
const CHANGE_S = 1.7;
const DWELL_S = 1.6;
const BACK_S = 0.9;

/** 벗어남 하나의 다섯 단계. 캡션은 그 단계에서 일어나는 일만 말한다. */
function excursionPhases(
  ex: Excursion,
  move: TriplePointMessageKey,
  change: TriplePointMessageKey,
  dwell: TriplePointMessageKey,
): TimelinePhase[] {
  return [
    { id: phaseId(ex, 'tp'), duration: TP_S, caption: key('caption.together') },
    { id: phaseId(ex, 'move'), duration: MOVE_S, ease: 'smooth', caption: key(move) },
    { id: phaseId(ex, 'change'), duration: CHANGE_S, ease: 'smooth', caption: key(change) },
    { id: phaseId(ex, 'dwell'), duration: DWELL_S, caption: key(dwell) },
    { id: phaseId(ex, 'back'), duration: BACK_S, ease: 'smooth', caption: key('caption.back') },
  ];
}

const [WARM, COOL, THIN, SQUEEZE] = EXCURSIONS as [Excursion, Excursion, Excursion, Excursion];

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const triplePointSchema: BundleSchema = {
  id: TRIPLE_POINT_ID,
  label: text('label.title'),
  category: 'thermal',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 네 번의 벗어남이 아무것도 누르지 않아도 한 주기 안에 끝난다.
  parameters: [],

  stages: [
    {
      id: 'water',
      label: text('label.stage'),
      constants: {
        tTp: T_TP,
        pTp: P_TP,
        dT: D_T,
        dP: D_P,
        subSlope: SUB_SLOPE,
        vapSlope: VAP_SLOPE,
        meltSlope: MELT_SLOPE,
        meltTiltGain: MELT_TILT_GAIN,
        winT: WIN_T,
        winP: WIN_P,
        shareIce: SHARE_ICE,
        shareWater: SHARE_WATER,
        shareVapor: SHARE_VAPOR,
        iceCubes: ICE_CUBES,
        vaporDots: VAPOR_DOTS,
        seed: SEED,
        vaporDriftS: VAPOR_DRIFT_S,
      },
    },
  ],

  environments: [],

  views: [{ id: 'main', label: text('label.view'), default: true }],

  /** 그릇과 그림을 가로로 나란히 — 세로는 그릇 높이와 눈금 · 캡션 줄뿐이다. */
  canvas: { height: 360, minHeight: 320 },

  /** 그림 면 → 경계선 → 점, 그릇 속 물 → 얼음 → 김 → 벽 순서가 곧 겹침이다. */
  drawOrder: 'scene',

  /**
   * 한 주기 = 벗어남 넷(압력 붙들고 온도 ↑ · ↓, 온도 붙들고 압력 ↓ · ↑).
   * 하나마다 삼중점 머묾 → 옮김 → 바뀜 → 결과 머묾 → 되돌림.
   */
  timeline: {
    phases: [
      ...excursionPhases(WARM, 'caption.warm', 'caption.toVapor', 'caption.onlyVapor'),
      ...excursionPhases(COOL, 'caption.cool', 'caption.toIce', 'caption.onlyIce'),
      ...excursionPhases(THIN, 'caption.thin', 'caption.toVapor', 'caption.onlyVapor'),
      ...excursionPhases(SQUEEZE, 'caption.squeeze', 'caption.toWater', 'caption.onlyWater'),
    ],
  },

  /** 도착한 순간 이미 삼중점에서 셋이 함께 있고 김 알갱이가 떠돈다. */
  startAt: 0.5,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 720,
    style: { colorRole: 'muted', emphasis: 'strong' },
    // 문안의 수는 스테이지 상수에서 온다 — initialState 가 글자로 옮겨 둔 state 경로 (G133).
    vars: { t: 'tTp', p: 'pTp', dt: 'dT', dp: 'dP' },
  },

  // 그리드 · 카메라 단추 없음 — 잴 것은 거리가 아니라 점이 든 영역이다.

  messages: triplePointMessages,
};
