// ========================================================================
// earth-revolution-constellations — 선언
// ========================================================================
// 질문: 계절마다 한밤에 보이는 별자리는 왜 달라지는가.
//
// 한밤의 관측자는 태양 반대쪽을 본다 — 지구의 밤 쪽이 향하는 곳이 곧 궤도 바깥쪽
// 방향이다. 그쪽 별자리가 한밤의 하늘에 뜨고, 태양 쪽 별자리는 태양과 함께 낮 하늘에
// 떠서 햇빛에 묻힌다. 지구가 공전하면 그 바깥 방향이 한 해 동안 황도 12 별자리를
// 한 바퀴 돌아, 계절마다 한밤의 별자리가 바뀐다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// 월드 단위는 캔버스 px 에 가까운 임의 단위, y 는 위. 각은 월드 +x 에서 반시계(북극 위에서 본
// 황경 방향)다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:earth-revolution-constellations` 와 문자 그대로 일치한다 (C4). */
export const EARTH_REVOLUTION_CONSTELLATIONS_ID = 'earth-revolution-constellations';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/**
 * 봄(3월 1일)이 시작할 때 태양에서 본 지구의 황경(도). 춘분(3월 21일 무렵)에 지구는 황경 180° 에
 * 있고 하루에 약 1° 씩 나아가므로 3월 1일은 160° 부근이다. 계절 하나 = 90°.
 */
export const SPRING_START_DEG = 160;
/** 태양에서 이 각(도) 안쪽의 별자리는 낮 하늘에만 떠 있어 햇빛에 묻힌다. */
export const GLARE_DEG = 30;
/** 태양에서 이 각(도) 넘게 떨어진 별자리는 밤 하늘에 온전히 뜬다. 그 사이는 초저녁 · 새벽에만 잠깐. */
export const NIGHT_SIDE_DEG = 90;
/** 오른쪽 「한밤의 남쪽 하늘」 창이 정남에서 동 · 서로 보이는 각(도). */
export const WINDOW_HALF_DEG = 60;

// ------------------------------------------------------------------------
// 황도 12 별자리 — 황경 가운데 자리(도). 실제 별자리 경계는 폭이 제각각이지만 가운데 자리는
// 30° 간격에서 10° 안쪽으로 맞는다. 스테이지 상수는 수 하나씩이라 목록을 둘 수 없다 (장부 G105).
// ------------------------------------------------------------------------

export type ConstellationKey =
  | 'star.pisces'
  | 'star.aries'
  | 'star.taurus'
  | 'star.gemini'
  | 'star.cancer'
  | 'star.leo'
  | 'star.virgo'
  | 'star.libra'
  | 'star.scorpius'
  | 'star.sagittarius'
  | 'star.capricornus'
  | 'star.aquarius';

export interface Constellation {
  readonly key: ConstellationKey;
  /** 황경 가운데 자리(도). */
  readonly lon: number;
}

export const ZODIAC: readonly Constellation[] = [
  { key: 'star.pisces', lon: 15 },
  { key: 'star.aries', lon: 45 },
  { key: 'star.taurus', lon: 75 },
  { key: 'star.gemini', lon: 105 },
  { key: 'star.cancer', lon: 135 },
  { key: 'star.leo', lon: 165 },
  { key: 'star.virgo', lon: 195 },
  { key: 'star.libra', lon: 225 },
  { key: 'star.scorpius', lon: 255 },
  { key: 'star.sagittarius', lon: 285 },
  { key: 'star.capricornus', lon: 315 },
  { key: 'star.aquarius', lon: 345 },
];

/**
 * 별자리마다 흩뿌리는 별의 시드 · 개수 · 퍼짐. 별 모양은 실제 별자리 모양이 아니다 — 주장은
 * 「어느 별자리가 한밤에 뜨나」 이지 별자리의 생김새가 아니다. 같은 시드는 언제나 같은 별이다.
 */
export const STAR_SEED = 21;
export const STARS_PER_CONSTELLATION = 5;
/** 가운데 자리에서 황경으로 퍼지는 폭(도, ±). */
export const STAR_SPREAD_DEG = 11;

// ------------------------------------------------------------------------
// 배치 — 월드 단위(가로 840 · 세로 360 판), y 위
// ------------------------------------------------------------------------

export const CANVAS_W = 840;
export const CANVAS_H = 360;

/** 왼쪽 판 — 북극 위에서 내려다본 태양 · 공전 궤도 · 별자리 고리. */
export const TOP = { cx: 230, cy: 186 } as const;
export const SUN_R = 17;
export const ORBIT_R = 80;
export const EARTH_R = 11;
/** 별자리 이름이 놓이는 고리의 반지름. */
export const RING_R = 146;
/** 한밤 방향 화살 — 지구 표면에서 띄운 거리, 고리 이름 앞에서 멈추는 거리. */
export const SIGHT = { gap: 4, stopBeforeRing: 24 } as const;
/** 「햇빛에 묻힘」 이름표가 고리 바깥으로 나간 거리 — 고리 안에 두면 별자리 이름과 겹친다. */
export const GLARE_LABEL_OUTSET = 44;

/** 오른쪽 판 — 한밤에 남쪽을 본 하늘 창. 아래 변이 지평선. */
export const SKY = { x0: 480, x1: 820, y0: 96, y1: 296 } as const;
/** 창 안 별 무리의 가운데 높이 · 세로 퍼짐(±), 이름표 높이. */
export const SKY_STAR_Y = 206;
export const SKY_STAR_SPREAD_Y = 40;
export const SKY_NAME_Y = 140;
/** 지평선 아래 방위 이름표 높이, 창 위 제목 높이. */
export const SKY_COMPASS_Y = 80;
export const SKY_TITLE_Y = 318;
/** 창 가장자리에서 별 · 이름을 옅게 지우는 폭(도). */
export const SKY_EDGE_FADE_DEG = 14;

/**
 * 고정 경계. 판 전체 + 위쪽 「햇빛에 묻힘」 이름표 자리 + 아래 캡션 두 줄 자리. 캡션 슬롯이 그림을 덮지 않게 세로를
 * 아래로 늘렸다 (이웃 조각과 같은 까닭, 장부 G24).
 */
export const SCENE_BOUNDS = { minX: 0, maxX: CANVAS_W, minY: -60, maxY: CANVAS_H + 28 } as const;

// ------------------------------------------------------------------------
// 시간표 — 한 해를 네 계절(봄 → 여름 → 가을 → 겨울)로
// ------------------------------------------------------------------------

/** 계절 하나의 길이(초). 한 해 = 넷의 합. */
export const SEASON = 5;
/** 도착한 순간 — 봄의 초입, 지구가 이미 돌고 있는 자리. */
export const START_AT = 1.2;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const earthRevolutionConstellationsMessages = Object.freeze({
  'label.title': {
    ko: '공전과 별자리',
    en: 'Earth’s orbit and the constellations',
    ja: '地球の公転と星座',
    zh: '地球公转与星座',
    ar: 'مدار الأرض والكوكبات',
    es: 'La órbita de la Tierra y las constelaciones',
    fr: 'L’orbite de la Terre et les constellations',
    hi: 'पृथ्वी की कक्षा और तारामंडल',
    id: 'Orbit Bumi dan rasi bintang',
    pt: 'A órbita da Terra e as constelações',
  },
  'label.operation': {
    ko: '계절마다 보이는 별자리가 달라지는 이유',
    en: 'Why the constellations we see change with the seasons',
    ja: '季節によって見える星座が変わる理由',
    zh: '为什么我们看到的星座随季节变化',
    ar: 'لماذا تتغير الكوكبات التي نراها مع الفصول',
    es: 'Por qué las constelaciones que vemos cambian con las estaciones',
    fr: 'Pourquoi les constellations visibles changent avec les saisons',
    hi: 'हमें दिखने वाले तारामंडल ऋतुओं के साथ क्यों बदलते हैं',
    id: 'Mengapa rasi bintang yang kita lihat berubah mengikuti musim',
    pt: 'Por que as constelações que vemos mudam com as estações',
  },
  'label.stage': {
    ko: '태양 · 지구 · 황도 별자리',
    en: 'Sun, Earth and the zodiac',
    ja: '太陽・地球・黄道星座',
    zh: '太阳、地球与黄道星座',
    ar: 'الشمس والأرض ودائرة البروج',
    es: 'El Sol, la Tierra y el zodíaco',
    fr: 'Le Soleil, la Terre et le zodiaque',
    hi: 'सूर्य, पृथ्वी और राशिचक्र',
    id: 'Matahari, Bumi, dan zodiak',
    pt: 'O Sol, a Terra e o zodíaco',
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
  'label.sun': {
    ko: '태양',
    en: 'Sun',
    ja: '太陽',
    zh: '太阳',
    ar: 'الشمس',
    es: 'Sol',
    fr: 'Soleil',
    hi: 'सूर्य',
    id: 'Matahari',
    pt: 'Sol',
  },
  'label.glare': {
    ko: '햇빛에 묻힘',
    en: 'lost in sunlight',
    ja: '日の光に埋もれる',
    zh: '淹没在阳光中',
    ar: 'غارقة في ضوء الشمس',
    es: 'ocultas por la luz solar',
    fr: 'noyées dans la lumière du Soleil',
    hi: 'सूर्य के प्रकाश में छिपे',
    id: 'tenggelam dalam sinar Matahari',
    pt: 'ofuscadas pela luz solar',
  },
  'label.sky.spring': {
    ko: '봄 · 한밤의 남쪽 하늘',
    en: 'Spring · the southern sky at midnight',
    ja: '春・真夜中の南の空',
    zh: '春季 · 午夜的南方天空',
    ar: 'الربيع · السماء الجنوبية في منتصف الليل',
    es: 'Primavera · el cielo del sur a medianoche',
    fr: 'Printemps · le ciel du sud à minuit',
    hi: 'वसंत · मध्यरात्रि का दक्षिणी आकाश',
    id: 'Musim semi · langit selatan tengah malam',
    pt: 'Primavera · o céu do sul à meia-noite',
  },
  'label.sky.summer': {
    ko: '여름 · 한밤의 남쪽 하늘',
    en: 'Summer · the southern sky at midnight',
    ja: '夏・真夜中の南の空',
    zh: '夏季 · 午夜的南方天空',
    ar: 'الصيف · السماء الجنوبية في منتصف الليل',
    es: 'Verano · el cielo del sur a medianoche',
    fr: 'Été · le ciel du sud à minuit',
    hi: 'ग्रीष्म · मध्यरात्रि का दक्षिणी आकाश',
    id: 'Musim panas · langit selatan tengah malam',
    pt: 'Verão · o céu do sul à meia-noite',
  },
  'label.sky.autumn': {
    ko: '가을 · 한밤의 남쪽 하늘',
    en: 'Autumn · the southern sky at midnight',
    ja: '秋・真夜中の南の空',
    zh: '秋季 · 午夜的南方天空',
    ar: 'الخريف · السماء الجنوبية في منتصف الليل',
    es: 'Otoño · el cielo del sur a medianoche',
    fr: 'Automne · le ciel du sud à minuit',
    hi: 'शरद · मध्यरात्रि का दक्षिणी आकाश',
    id: 'Musim gugur · langit selatan tengah malam',
    pt: 'Outono · o céu do sul à meia-noite',
  },
  'label.sky.winter': {
    ko: '겨울 · 한밤의 남쪽 하늘',
    en: 'Winter · the southern sky at midnight',
    ja: '冬・真夜中の南の空',
    zh: '冬季 · 午夜的南方天空',
    ar: 'الشتاء · السماء الجنوبية في منتصف الليل',
    es: 'Invierno · el cielo del sur a medianoche',
    fr: 'Hiver · le ciel du sud à minuit',
    hi: 'शीत · मध्यरात्रि का दक्षिणी आकाश',
    id: 'Musim dingin · langit selatan tengah malam',
    pt: 'Inverno · o céu do sul à meia-noite',
  },
  'label.east': {
    ko: '동',
    en: 'E',
    ja: '東',
    zh: '东',
    ar: 'شرق',
    es: 'E',
    fr: 'E',
    hi: 'पूर्व',
    id: 'T',
    pt: 'L',
  },
  'label.south': {
    ko: '정남',
    en: 'due S',
    ja: '真南',
    zh: '正南',
    ar: 'جنوب تمامًا',
    es: 'sur exacto',
    fr: 'plein sud',
    hi: 'ठीक दक्षिण',
    id: 'tepat selatan',
    pt: 'sul exato',
  },
  'label.west': {
    ko: '서',
    en: 'W',
    ja: '西',
    zh: '西',
    ar: 'غرب',
    es: 'O',
    fr: 'O',
    hi: 'पश्चिम',
    id: 'B',
    pt: 'O',
  },
  'star.pisces': {
    ko: '물고기자리',
    en: 'Pisces',
    ja: 'うお座',
    zh: '双鱼座',
    ar: 'الحوت',
    es: 'Piscis',
    fr: 'Poissons',
    hi: 'मीन',
    id: 'Pisces',
    pt: 'Peixes',
  },
  'star.aries': {
    ko: '양자리',
    en: 'Aries',
    ja: 'おひつじ座',
    zh: '白羊座',
    ar: 'الحمل',
    es: 'Aries',
    fr: 'Bélier',
    hi: 'मेष',
    id: 'Aries',
    pt: 'Áries',
  },
  'star.taurus': {
    ko: '황소자리',
    en: 'Taurus',
    ja: 'おうし座',
    zh: '金牛座',
    ar: 'الثور',
    es: 'Tauro',
    fr: 'Taureau',
    hi: 'वृषभ',
    id: 'Taurus',
    pt: 'Touro',
  },
  'star.gemini': {
    ko: '쌍둥이자리',
    en: 'Gemini',
    ja: 'ふたご座',
    zh: '双子座',
    ar: 'الجوزاء',
    es: 'Géminis',
    fr: 'Gémeaux',
    hi: 'मिथुन',
    id: 'Gemini',
    pt: 'Gêmeos',
  },
  'star.cancer': {
    ko: '게자리',
    en: 'Cancer',
    ja: 'かに座',
    zh: '巨蟹座',
    ar: 'السرطان',
    es: 'Cáncer',
    fr: 'Cancer',
    hi: 'कर्क',
    id: 'Cancer',
    pt: 'Câncer',
  },
  'star.leo': {
    ko: '사자자리',
    en: 'Leo',
    ja: 'しし座',
    zh: '狮子座',
    ar: 'الأسد',
    es: 'Leo',
    fr: 'Lion',
    hi: 'सिंह',
    id: 'Leo',
    pt: 'Leão',
  },
  'star.virgo': {
    ko: '처녀자리',
    en: 'Virgo',
    ja: 'おとめ座',
    zh: '室女座',
    ar: 'العذراء',
    es: 'Virgo',
    fr: 'Vierge',
    hi: 'कन्या',
    id: 'Virgo',
    pt: 'Virgem',
  },
  'star.libra': {
    ko: '천칭자리',
    en: 'Libra',
    ja: 'てんびん座',
    zh: '天秤座',
    ar: 'الميزان',
    es: 'Libra',
    fr: 'Balance',
    hi: 'तुला',
    id: 'Libra',
    pt: 'Libra',
  },
  'star.scorpius': {
    ko: '전갈자리',
    en: 'Scorpius',
    ja: 'さそり座',
    zh: '天蝎座',
    ar: 'العقرب',
    es: 'Escorpio',
    fr: 'Scorpion',
    hi: 'वृश्चिक',
    id: 'Scorpius',
    pt: 'Escorpião',
  },
  'star.sagittarius': {
    ko: '궁수자리',
    en: 'Sagittarius',
    ja: 'いて座',
    zh: '人马座',
    ar: 'القوس',
    es: 'Sagitario',
    fr: 'Sagittaire',
    hi: 'धनु',
    id: 'Sagittarius',
    pt: 'Sagitário',
  },
  'star.capricornus': {
    ko: '염소자리',
    en: 'Capricornus',
    ja: 'やぎ座',
    zh: '摩羯座',
    ar: 'الجدي',
    es: 'Capricornio',
    fr: 'Capricorne',
    hi: 'मकर',
    id: 'Capricornus',
    pt: 'Capricórnio',
  },
  'star.aquarius': {
    ko: '물병자리',
    en: 'Aquarius',
    ja: 'みずがめ座',
    zh: '宝瓶座',
    ar: 'الدلو',
    es: 'Acuario',
    fr: 'Verseau',
    hi: 'कुंभ',
    id: 'Aquarius',
    pt: 'Aquário',
  },
  'caption.spring': {
    ko: '봄(3~5월) — 지구의 밤 쪽은 사자 · 처녀 · 천칭자리를 향해 이들이 한밤 하늘에 떠 있다. 태양 쪽의 물병 · 물고기 · 양자리는 낮 하늘에 묻힌다.',
    en: 'Spring (Mar–May) — Earth’s night side faces Leo, Virgo and Libra, so they stand in the midnight sky. Aquarius, Pisces and Aries lie toward the Sun, lost in the daytime sky.',
    ja: '春（3～5月）— 地球の夜の側はしし座・おとめ座・てんびん座を向き、これらが真夜中の空に見える。太陽の側にあるみずがめ座・うお座・おひつじ座は昼の空に埋もれる。',
    zh: '春季（3–5月）— 地球的夜半球朝向狮子座、室女座和天秤座，它们高悬在午夜的天空中。宝瓶座、双鱼座和白羊座位于太阳一侧，淹没在白天的天空里。',
    ar: 'الربيع (مارس–مايو) — يواجه الجانب الليلي من الأرض الأسد والعذراء والميزان، فتظهر في سماء منتصف الليل. أما الدلو والحوت والحمل فتقع باتجاه الشمس، وتضيع في سماء النهار.',
    es: 'Primavera (mar–may) — el lado nocturno de la Tierra mira hacia Leo, Virgo y Libra, que brillan en el cielo de medianoche. Acuario, Piscis y Aries quedan hacia el Sol, perdidas en el cielo diurno.',
    fr: 'Printemps (mars–mai) — la face nocturne de la Terre regarde le Lion, la Vierge et la Balance, qui se dressent dans le ciel de minuit. Le Verseau, les Poissons et le Bélier sont du côté du Soleil, noyés dans le ciel de jour.',
    hi: 'वसंत (मार्च–मई) — पृथ्वी का रात वाला भाग सिंह, कन्या और तुला की ओर है, इसलिए ये मध्यरात्रि के आकाश में दिखते हैं। कुंभ, मीन और मेष सूर्य की ओर हैं और दिन के आकाश में खो जाते हैं।',
    id: 'Musim semi (Mar–Mei) — sisi malam Bumi menghadap Leo, Virgo, dan Libra, sehingga ketiganya tampak di langit tengah malam. Aquarius, Pisces, dan Aries berada di arah Matahari, tenggelam di langit siang.',
    pt: 'Primavera (mar–mai) — o lado noturno da Terra está voltado para Leão, Virgem e Libra, que aparecem no céu da meia-noite. Aquário, Peixes e Áries ficam na direção do Sol, perdidos no céu diurno.',
  },
  'caption.summer': {
    ko: '여름(6~8월) — 지구가 궤도를 4 분의 1 돌아 밤 쪽이 전갈 · 궁수 · 염소자리로 옮겨 갔다. 봄밤의 별자리는 태양 쪽으로 다가가 초저녁에만 잠깐 보인다.',
    en: 'Summer (Jun–Aug) — a quarter of the way round the orbit, the night side now faces Scorpius, Sagittarius and Capricornus. The spring stars have drifted toward the Sun and show only briefly after dusk.',
    ja: '夏（6～8月）— 軌道を4分の1回り、夜の側はさそり座・いて座・やぎ座を向くようになった。春の星座は太陽の側へ近づき、日没後にわずかに見えるだけだ。',
    zh: '夏季（6–8月）— 地球沿轨道转过四分之一，夜半球现在朝向天蝎座、人马座和摩羯座。春季的星座移向太阳一侧，只在黄昏后短暂可见。',
    ar: 'الصيف (يونيو–أغسطس) — بعد ربع دورة في المدار، صار الجانب الليلي يواجه العقرب والقوس والجدي. أما نجوم الربيع فقد انجرفت نحو الشمس ولا تظهر إلا قليلًا بعد الغسق.',
    es: 'Verano (jun–ago) — tras un cuarto de órbita, el lado nocturno mira ahora hacia Escorpio, Sagitario y Capricornio. Las estrellas de primavera se han desplazado hacia el Sol y solo se ven un rato tras el anochecer.',
    fr: 'Été (juin–août) — après un quart d’orbite, la face nocturne regarde désormais le Scorpion, le Sagittaire et le Capricorne. Les étoiles du printemps ont glissé vers le Soleil et ne se montrent que brièvement après le crépuscule.',
    hi: 'ग्रीष्म (जून–अगस्त) — कक्षा का एक चौथाई चक्कर पूरा होने पर रात वाला भाग अब वृश्चिक, धनु और मकर की ओर है। वसंत के तारे सूर्य की ओर खिसक गए हैं और संध्या के बाद थोड़ी देर ही दिखते हैं।',
    id: 'Musim panas (Jun–Agu) — setelah seperempat putaran orbit, sisi malam kini menghadap Scorpius, Sagittarius, dan Capricornus. Bintang-bintang musim semi telah bergeser ke arah Matahari dan hanya tampak sebentar setelah senja.',
    pt: 'Verão (jun–ago) — após um quarto da órbita, o lado noturno agora está voltado para Escorpião, Sagitário e Capricórnio. As estrelas da primavera se deslocaram para o lado do Sol e só aparecem brevemente após o anoitecer.',
  },
  'caption.autumn': {
    ko: '가을(9~11월) — 밤 쪽이 물병 · 물고기 · 양자리를 향한다. 봄에 한밤을 차지하던 사자 · 처녀 · 천칭자리는 이제 태양 뒤에서 햇빛에 묻혔다.',
    en: 'Autumn (Sep–Nov) — the night side faces Aquarius, Pisces and Aries. Leo, Virgo and Libra, which ruled the spring midnight, are now behind the Sun and lost in its light.',
    ja: '秋（9～11月）— 夜の側はみずがめ座・うお座・おひつじ座を向く。春の真夜中を占めていたしし座・おとめ座・てんびん座は、いまは太陽の向こうで日の光に埋もれた。',
    zh: '秋季（9–11月）— 夜半球朝向宝瓶座、双鱼座和白羊座。曾占据春季午夜天空的狮子座、室女座和天秤座，如今位于太阳后方，淹没在阳光中。',
    ar: 'الخريف (سبتمبر–نوفمبر) — يواجه الجانب الليلي الدلو والحوت والحمل. أما الأسد والعذراء والميزان، التي سادت منتصف ليل الربيع، فهي الآن خلف الشمس وقد ضاعت في ضوئها.',
    es: 'Otoño (sep–nov) — el lado nocturno mira hacia Acuario, Piscis y Aries. Leo, Virgo y Libra, que dominaban la medianoche de primavera, están ahora detrás del Sol, perdidas en su luz.',
    fr: 'Automne (sept.–nov.) — la face nocturne regarde le Verseau, les Poissons et le Bélier. Le Lion, la Vierge et la Balance, qui régnaient sur les minuits de printemps, sont maintenant derrière le Soleil, noyés dans sa lumière.',
    hi: 'शरद (सितंबर–नवंबर) — रात वाला भाग कुंभ, मीन और मेष की ओर है। वसंत की मध्यरात्रि पर छाए रहने वाले सिंह, कन्या और तुला अब सूर्य के पीछे हैं और उसके प्रकाश में खो गए हैं।',
    id: 'Musim gugur (Sep–Nov) — sisi malam menghadap Aquarius, Pisces, dan Aries. Leo, Virgo, dan Libra, yang menguasai tengah malam musim semi, kini berada di balik Matahari dan tenggelam dalam cahayanya.',
    pt: 'Outono (set–nov) — o lado noturno está voltado para Aquário, Peixes e Áries. Leão, Virgem e Libra, que dominavam a meia-noite da primavera, estão agora atrás do Sol, perdidos em sua luz.',
  },
  'caption.winter': {
    ko: '겨울(12~2월) — 밤 쪽이 황소 · 쌍둥이 · 게자리를 향한다. 한 바퀴를 마치면 다시 봄밤의 별자리로 돌아온다 — 공전 한 바퀴가 한 해다.',
    en: 'Winter (Dec–Feb) — the night side faces Taurus, Gemini and Cancer. One more quarter and the spring stars return — one orbit is one year.',
    ja: '冬（12～2月）— 夜の側はおうし座・ふたご座・かに座を向く。もう4分の1回ると春の星座が戻ってくる — 公転1周が1年だ。',
    zh: '冬季（12–2月）— 夜半球朝向金牛座、双子座和巨蟹座。再转四分之一，春季的星座又回来了 — 公转一圈就是一年。',
    ar: 'الشتاء (ديسمبر–فبراير) — يواجه الجانب الليلي الثور والجوزاء والسرطان. ربع دورة أخرى وتعود نجوم الربيع — دورة واحدة في المدار هي سنة واحدة.',
    es: 'Invierno (dic–feb) — el lado nocturno mira hacia Tauro, Géminis y Cáncer. Un cuarto más y vuelven las estrellas de primavera — una órbita es un año.',
    fr: 'Hiver (déc.–févr.) — la face nocturne regarde le Taureau, les Gémeaux et le Cancer. Encore un quart et les étoiles du printemps reviennent — une orbite, c’est une année.',
    hi: 'शीत (दिसंबर–फ़रवरी) — रात वाला भाग वृषभ, मिथुन और कर्क की ओर है। एक चौथाई और, और वसंत के तारे लौट आते हैं — एक परिक्रमा एक वर्ष है।',
    id: 'Musim dingin (Des–Feb) — sisi malam menghadap Taurus, Gemini, dan Cancer. Seperempat putaran lagi dan bintang-bintang musim semi kembali — satu kali orbit sama dengan satu tahun.',
    pt: 'Inverno (dez–fev) — o lado noturno está voltado para Touro, Gêmeos e Câncer. Mais um quarto e as estrelas da primavera voltam — uma órbita é um ano.',
  },
} satisfies Record<string, LocalizedText>);

export type EarthRevolutionConstellationsMessageKey = keyof typeof earthRevolutionConstellationsMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: EarthRevolutionConstellationsMessageKey): LocalizedText =>
  earthRevolutionConstellationsMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: EarthRevolutionConstellationsMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const earthRevolutionConstellationsSchema: BundleSchema = {
  id: EARTH_REVOLUTION_CONSTELLATIONS_ID,
  label: text('label.title'),
  category: 'astro',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 지구가 돌고 있고, 한 해 동안 한밤의 별자리가 한 바퀴 바뀐다.
  parameters: [],

  stages: [
    {
      id: 'sun-earth-zodiac',
      label: text('label.stage'),
      constants: {
        springStartDeg: SPRING_START_DEG,
        glareDeg: GLARE_DEG,
        nightSideDeg: NIGHT_SIDE_DEG,
        windowHalfDeg: WINDOW_HALF_DEG,
      },
    },
  ],
  environments: [],
  views: [{ id: 'north-pole', label: text('label.view'), default: true }],

  /** 판 840 × 360 + 캡션 두 줄. 세로는 별자리 고리의 지름이 정한다. */
  canvas: { height: 440, minHeight: 400 },

  /**
   * 겹침이 판정 장치다 — 햇빛 쐐기는 이름 **아래**, 한밤 화살은 궤도 위, 정남 선은 별 위에
   * 와야 한다. 층 순서로는 `sector`(쐐기)가 글자 위로 올라올 수 있다.
   */
  drawOrder: 'scene',

  /**
   * 한 해 = 봄 → 여름 → 가을 → 겨울. 계절마다 궤도 4 분의 1(90°). 지구의 황경을 이 네 단계의
   * 진행도 합에서 읽으므로(physics `yearFraction` · `earthLongitude`), 캡션이 말하는 계절과 지구
   * 자리가 어긋날 수 없다. 고르게 돈다(linear).
   */
  timeline: {
    phases: [
      { id: 'spring', duration: SEASON, ease: 'linear', caption: key('caption.spring') },
      { id: 'summer', duration: SEASON, ease: 'linear', caption: key('caption.summer') },
      { id: 'autumn', duration: SEASON, ease: 'linear', caption: key('caption.autumn') },
      { id: 'winter', duration: SEASON, ease: 'linear', caption: key('caption.winter') },
    ],
  },

  /** 도착한 순간 이미 돌고 있다 — 봄의 초입. */
  startAt: START_AT,

  // 슬롯 하나. 지금 지구의 밤 쪽이 어느 별자리를 향하는지만 말한다 — 공전의 정의는 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-left', offset: [16, -8] },
    align: 'left',
    fontSize: 14,
    fade: 0.3,
    style: { colorRole: 'ink', emphasis: 'medium' },
    wrapWidth: CANVAS_W - 32,
  },

  // 그리드 · 카메라 단추 없음 — 잴 것이 거리가 아니라 「어느 쪽을 향하나」 다.

  messages: earthRevolutionConstellationsMessages,
};
