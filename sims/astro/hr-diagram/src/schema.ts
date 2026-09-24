// ========================================================================
// hr-diagram — 선언
// ========================================================================
// 질문: 성단의 HR 도에서 왜 주계열 띠가 위에서부터 끊겨 있는가.
//
// 같은 때 태어난 별 무리가 나이 들면 무거운 별부터 띠를 떠나, 띠의 윗부분이
// 위에서부터 비어 간다. 원본: tasks/piece-lab/hr-diagram.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:hr-diagram` 와 문자 그대로 일치한다 (C4). */
export const HR_DIAGRAM_ID = 'hr-diagram';

// ------------------------------------------------------------------------
// 배치 — 원본 캔버스(860 × 440) 좌표를 그대로 쓴다. 월드 = [x, −y].
// ------------------------------------------------------------------------

export const CANVAS_W = 860;
export const CANVAS_H = 440;
/** 캡션 줄이 차지하는 자리(원본 px). 원본은 캔버스 아래 DOM 한 줄이었다. */
export const CAPTION_ROOM = 34;

/** 그림 영역 여백 (원본 PL · PR · PT · PB). */
export const PLOT = { left: 92, right: 18, top: 14, bottom: 46 } as const;
/** 가로축 = log10 표면 온도(K), 왼쪽이 뜨겁다. */
export const T_AXIS = { left: 4.8, right: 3.4 } as const;
/** 세로축 = log10 광도(태양 = 0). */
export const L_AXIS = { top: 6.4, bottom: -4.2 } as const;

/** 온도 눈금(K). 글자는 `messages` 의 `tick.t*`. */
export const TEMP_TICKS = [30000, 10000, 6000, 3000] as const;
/** 밝기 눈금(log10 L). 글자는 `messages` 의 `tick.l*`. */
export const LUM_TICKS = [4, 0, -3] as const;

/** 프레이밍 — 원본 캔버스 + 캡션 줄. 매 프레임 같은 값 (S-piece). */
export const SCENE_BOUNDS = {
  minX: 0,
  maxX: CANVAS_W,
  minY: -(CANVAS_H + CAPTION_ROOM),
  maxY: 0,
} as const;

// ------------------------------------------------------------------------
// 성단 — 조각의 물리 모델 값 (원본 상수 그대로)
// ------------------------------------------------------------------------

export const CLUSTER = {
  /** 별 수. */
  count: 1000,
  /** 질량 범위(태양 질량). */
  mMin: 0.2,
  mMax: 40,
  /** 질량 분포 멱지수. 실제(약 2.35)보다 완만하게 해 띠 윗부분에 별이 보이게 했다 (NOTES). */
  alpha: 1.7,
  /** 난수 시드. 원본 하니스의 기본 시드(`?seed=1`)와 같다 — 같은 별 무리가 나온다. */
  seed: 1,
  /** 성단 나이 흐름: log10(년) 시작 · 끝. 시간표 `run` 단계 동안 선형으로 흐른다. */
  logAge0: 6.3,
  logAge1: 10.1,
  /** 꼬리 = 이만큼(초) 전 화면 시각의 위치 → 지금 위치. */
  trailSeconds: 0.3,
  /**
   * 흑체색 단계를 여는 표시값 차이(0~1, 성분마다). 약 12/255 — 단계 안 오차가 성분마다 8/255 미만이라
   * 한 단계 안의 색 차이가 눈에 띄지 않는다. 가로축 범위에서 23 단계가 된다 (NOTES).
   */
  colorStep: 0.047,
} as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const hrDiagramMessages = Object.freeze({
  'label.title': {
    ko: 'HR 도',
    en: 'HR diagram',
    ja: 'HR図',
    zh: '赫罗图',
    ar: 'مخطط HR',
    es: 'Diagrama HR',
    fr: 'Diagramme HR',
    hi: 'HR आरेख',
    id: 'Diagram HR',
    pt: 'Diagrama HR',
  },
  'label.operation': {
    ko: '무거운 별부터 주계열 띠를 떠난다',
    en: 'The heaviest stars leave the main sequence first',
    ja: '最も重い星から主系列を離れる',
    zh: '最重的恒星最先离开主序',
    ar: 'النجوم الأثقل تغادر النسق الأساسي أولًا',
    es: 'Las estrellas más pesadas dejan primero la secuencia principal',
    fr: 'Les étoiles les plus lourdes quittent la séquence principale en premier',
    hi: 'सबसे भारी तारे सबसे पहले मुख्य अनुक्रम छोड़ते हैं',
    id: 'Bintang terberat meninggalkan deret utama lebih dulu',
    pt: 'As estrelas mais pesadas deixam a sequência principal primeiro',
  },
  'label.stage': {
    ko: '성단',
    en: 'Cluster',
    ja: '星団',
    zh: '星团',
    ar: 'عنقود نجمي',
    es: 'Cúmulo',
    fr: 'Amas',
    hi: 'तारागुच्छ',
    id: 'Gugus bintang',
    pt: 'Aglomerado',
  },
  'label.view': {
    ko: 'HR 도',
    en: 'HR diagram',
    ja: 'HR図',
    zh: '赫罗图',
    ar: 'مخطط HR',
    es: 'Diagrama HR',
    fr: 'Diagramme HR',
    hi: 'HR आरेख',
    id: 'Diagram HR',
    pt: 'Diagrama HR',
  },

  /** 온도 눈금. 수와 단위는 표식이라 두 언어가 같다 (C1 판정 3). */
  'tick.t30000': {
    ko: '30000K',
    en: '30000K',
    ja: '30000K',
    zh: '30000K',
    ar: '30000K',
    es: '30000K',
    fr: '30000K',
    hi: '30000K',
    id: '30000K',
    pt: '30000K',
  },
  'tick.t10000': {
    ko: '10000K',
    en: '10000K',
    ja: '10000K',
    zh: '10000K',
    ar: '10000K',
    es: '10000K',
    fr: '10000K',
    hi: '10000K',
    id: '10000K',
    pt: '10000K',
  },
  'tick.t6000': {
    ko: '6000K',
    en: '6000K',
    ja: '6000K',
    zh: '6000K',
    ar: '6000K',
    es: '6000K',
    fr: '6000K',
    hi: '6000K',
    id: '6000K',
    pt: '6000K',
  },
  'tick.t3000': {
    ko: '3000K',
    en: '3000K',
    ja: '3000K',
    zh: '3000K',
    ar: '3000K',
    es: '3000K',
    fr: '3000K',
    hi: '3000K',
    id: '3000K',
    pt: '3000K',
  },
  'tick.l4': {
    ko: '태양의 1만 배',
    en: '10,000 × Sun',
    ja: '10,000 × 太陽',
    zh: '10,000 × 太阳',
    ar: '10,000 × الشمس',
    es: '10 000 × Sol',
    fr: '10 000 × Soleil',
    hi: '10,000 × सूर्य',
    id: '10 000 × Matahari',
    pt: '10 000 × Sol',
  },
  'tick.l0': {
    ko: '태양만큼',
    en: 'Like the Sun',
    ja: '太陽と同じ',
    zh: '与太阳相当',
    ar: 'مثل الشمس',
    es: 'Como el Sol',
    fr: 'Comme le Soleil',
    hi: 'सूर्य जितनी',
    id: 'Seperti Matahari',
    pt: 'Como o Sol',
  },
  'tick.l-3': {
    ko: '1000분의 1',
    en: '1/1000 of Sun',
    ja: '太陽の1/1000',
    zh: '太阳的 1/1000',
    ar: '1/1000 من الشمس',
    es: '1/1000 del Sol',
    fr: '1/1000 du Soleil',
    hi: 'सूर्य का 1/1000',
    id: '1/1000 Matahari',
    pt: '1/1000 do Sol',
  },
  'axis.temperature': {
    ko: '표면 온도 — 왼쪽이 뜨겁다',
    en: 'Surface temperature — hotter to the left',
    ja: '表面温度 — 左ほど高温',
    zh: '表面温度 — 越往左越热',
    ar: 'درجة حرارة السطح — الأسخن إلى اليسار',
    es: 'Temperatura superficial — más caliente a la izquierda',
    fr: 'Température de surface — plus chaude à gauche',
    hi: 'सतह का तापमान — बाईं ओर अधिक गर्म',
    id: 'Suhu permukaan — makin panas ke kiri',
    pt: 'Temperatura da superfície — mais quente à esquerda',
  },
  'axis.luminosity': {
    ko: '밝기',
    en: 'Luminosity',
    ja: '光度',
    zh: '光度',
    ar: 'الضياء',
    es: 'Luminosidad',
    fr: 'Luminosité',
    hi: 'दीप्ति',
    id: 'Luminositas',
    pt: 'Luminosidade',
  },
  'label.mainSequence': {
    ko: '주계열',
    en: 'Main sequence',
    ja: '主系列',
    zh: '主序',
    ar: 'النسق الأساسي',
    es: 'Secuencia principal',
    fr: 'Séquence principale',
    hi: 'मुख्य अनुक्रम',
    id: 'Deret utama',
    pt: 'Sequência principal',
  },

  /**
   * 캡션. 나이 단위가 한국어는 만·억, 영어는 백만으로 갈려 한 틀에 담기지 않는다 —
   * 나이가 1억 년을 넘는지(`ageInEok`)로 두 틀 중 하나를 고른다 (NOTES 「어휘 부족」).
   */
  'caption.young': {
    ko: '성단 나이 {ageMan}만 년 — 무거운 별부터 띠를 떠난다. 지금은 태양 질량의 {mass}배보다 무거운 별이 떠났다.',
    en: 'Cluster age {ageMyr} million years — the heaviest stars leave the band first. Stars above {mass} solar masses have left.',
    ja: '星団の年齢 {ageMyr}百万年 — 最も重い星から帯を離れる。今は太陽質量の{mass}倍より重い星が離れた。',
    zh: '星团年龄 {ageMyr} 百万年 — 最重的恒星最先离开主序带。现在质量超过太阳 {mass} 倍的恒星已经离开。',
    ar: 'عمر العنقود {ageMyr} مليون سنة — النجوم الأثقل تغادر الشريط أولًا. غادرت النجوم التي تزيد كتلتها على {mass} كتلة شمسية.',
    es: 'Edad del cúmulo: {ageMyr} millones de años — las estrellas más pesadas dejan la banda primero. Ya se fueron las de más de {mass} masas solares.',
    fr: 'Âge de l’amas : {ageMyr} millions d’années — les étoiles les plus lourdes quittent la bande en premier. Celles de plus de {mass} masses solaires sont parties.',
    hi: 'तारागुच्छ की आयु {ageMyr} मिलियन वर्ष — सबसे भारी तारे पहले पट्टी छोड़ते हैं। {mass} सौर द्रव्यमान से भारी तारे जा चुके हैं।',
    id: 'Usia gugus {ageMyr} juta tahun — bintang terberat meninggalkan pita lebih dulu. Bintang di atas {mass} massa Matahari sudah pergi.',
    pt: 'Idade do aglomerado: {ageMyr} milhões de anos — as estrelas mais pesadas deixam a faixa primeiro. As de mais de {mass} massas solares já saíram.',
  },
  'caption.old': {
    ko: '성단 나이 {ageEok}억 년 — 무거운 별부터 띠를 떠난다. 지금은 태양 질량의 {mass}배보다 무거운 별이 떠났다.',
    en: 'Cluster age {ageMyr} million years — the heaviest stars leave the band first. Stars above {mass} solar masses have left.',
    ja: '星団の年齢 {ageMyr}百万年 — 最も重い星から帯を離れる。今は太陽質量の{mass}倍より重い星が離れた。',
    zh: '星团年龄 {ageMyr} 百万年 — 最重的恒星最先离开主序带。现在质量超过太阳 {mass} 倍的恒星已经离开。',
    ar: 'عمر العنقود {ageMyr} مليون سنة — النجوم الأثقل تغادر الشريط أولًا. غادرت النجوم التي تزيد كتلتها على {mass} كتلة شمسية.',
    es: 'Edad del cúmulo: {ageMyr} millones de años — las estrellas más pesadas dejan la banda primero. Ya se fueron las de más de {mass} masas solares.',
    fr: 'Âge de l’amas : {ageMyr} millions d’années — les étoiles les plus lourdes quittent la bande en premier. Celles de plus de {mass} masses solaires sont parties.',
    hi: 'तारागुच्छ की आयु {ageMyr} मिलियन वर्ष — सबसे भारी तारे पहले पट्टी छोड़ते हैं। {mass} सौर द्रव्यमान से भारी तारे जा चुके हैं।',
    id: 'Usia gugus {ageMyr} juta tahun — bintang terberat meninggalkan pita lebih dulu. Bintang di atas {mass} massa Matahari sudah pergi.',
    pt: 'Idade do aglomerado: {ageMyr} milhões de anos — as estrelas mais pesadas deixam a faixa primeiro. As de mais de {mass} massas solares já saíram.',
  },
} satisfies Record<string, LocalizedText>);

export type HrDiagramMessageKey = keyof typeof hrDiagramMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: HrDiagramMessageKey): LocalizedText => hrDiagramMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: HrDiagramMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const hrDiagramSchema: BundleSchema = {
  id: HR_DIAGRAM_ID,
  label: text('label.title'),
  category: 'astro',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다. 나이는 저절로 흐르고 주장은 누르지 않아도 끝난다.
  parameters: [],

  stages: [{ id: 'cluster', label: text('label.stage'), constants: {} }],
  environments: [],
  views: [{ id: 'hr', label: text('label.view'), default: true }],

  /** 원본 캔버스 860 × 440 + 캡션 줄. */
  canvas: { height: 480, minHeight: 420 },

  /** 겹침 순서가 원본 그대로여야 한다 — 축 · 띠 · 꼬리 · 별 · 전향점 막대. */
  drawOrder: 'scene',

  /**
   * 한 주기 26 초 — 22 초 동안 성단 나이가 200만 년 → 약 130억 년으로 **로그로** 흐르고(run),
   * 4 초 머문다(hold). 되감지 않고 끊어 처음으로 돌아간다 (원본 NOTES (c)).
   * 원본은 시계를 앞당기지 않았다 — t = 0 에 이미 가장 무거운 별이 건너가는 중이다.
   */
  timeline: {
    phases: [
      { id: 'run', duration: 22, caption: key('caption.young') },
      { id: 'hold', duration: 4, caption: key('caption.old') },
    ],
  },

  caption: {
    anchor: { screen: 'bottom-left', offset: [16, -6] },
    align: 'left',
    fontSize: 15,
    style: { colorRole: 'ink', emphasis: 'medium' },
    cases: [{ when: 'ageInEok', text: key('caption.old') }],
    vars: { ageMan: 'ageMan', ageEok: 'ageEok', ageMyr: 'ageMyr', mass: 'massText' },
  },

  // 그리드 · 카메라 버튼 없음 (원본에 없다). 축과 눈금은 scene 이 선언한다.

  messages: hrDiagramMessages,
};
