// ========================================================================
// youngs-modulus — 선언
// ========================================================================
// 질문: 같은 추를 걸었는데 2 m 강철선이 1 m 강철선보다 두 배 늘어났다.
// 그러면 긴 선이 더 무른 재료인가?
//
// 아니다. 눈금 하나하나는 같은 재료면 같은 높이까지 내려오고, 재료가 바뀌어야
// 더 내려온다. 늘어나는 정도는 선의 길이가 아니라 재료가 정한다.
//
// 값은 모두 원본(tasks/piece-lab/youngs-modulus/index.html)에서 그대로 옮겼다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:youngs-modulus` 와 문자 그대로 일치한다 (C4). */
export const YOUNGS_MODULUS_ID = 'youngs-modulus';

// ------------------------------------------------------------------------
// 물리 값 — 화면의 숫자는 모두 여기서 나온다
// ------------------------------------------------------------------------

/** 중력 가속도(m/s²). */
export const G = 9.8;
/** 추 질량(kg). 세 선에 같다. */
export const MASS = 5;
/** 선 지름(mm). 세 선에 같다 — 굵기가 다르면 응력 개념이 더 필요해 주장이 둘이 된다. */
export const DIAMETER_MM = 1.0;
/** 눈금 간격(m). */
export const MARK_M = 0.25;

export type Material = 'steel' | 'aluminium';

/** 세 선 — 왼쪽부터. 가운데 긴 강철선이 점선의 기준이다. */
export const WIRES: readonly { id: string; material: Material; lengthM: number; E: number }[] = [
  { id: 'steel-1', material: 'steel', lengthM: 1, E: 200e9 },
  { id: 'steel-2', material: 'steel', lengthM: 2, E: 200e9 },
  { id: 'aluminium-1', material: 'aluminium', lengthM: 1, E: 70e9 },
];
/** 점선을 끌어 오는 기준 선(`WIRES` 의 번호). 기준 선택이 곧 주장이다. */
export const REFERENCE_WIRE = 1;

// ------------------------------------------------------------------------
// 받침대 — 선이 받는 힘의 몫
// ------------------------------------------------------------------------

/**
 * 받침대가 내려간 정도 u 는 이 사이를 오간다. 선이 받는 힘의 몫은 min(u, 1).
 * u > 1 이면 받침대가 추에서 떨어진다. 가장 올라가도 무게의 20% 를 받으므로
 * 캡션이 어느 시각에도 화면과 어긋나지 않는다.
 */
export const U_LOW = 0.2;
export const U_HIGH = 1.3;

/** 받침대가 내려가는 시간(s). */
export const LOWER = 3;
/** 가장 내려간 채 머무는 시간(s). */
export const HOLD_LOW = 2;
/** 받침대가 올라오는 시간(s). */
export const RAISE = 2;
/** 가장 올라간 채 머무는 시간(s). */
export const HOLD_HIGH = 1;
/** 도착한 순간 이미 받침대가 내려가는 중 — 원본 `T_OFFSET`. */
export const OFFSET = 1.5;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const youngsModulusMessages = Object.freeze({
  'label.title': {
    ko: '영률',
    en: "Young's modulus",
    ja: 'ヤング率',
    zh: '杨氏模量',
    ar: 'معامل يونغ',
    es: 'Módulo de Young',
    fr: 'Module de Young',
    hi: 'यंग प्रत्यास्थता गुणांक',
    id: 'Modulus Young',
    pt: 'Módulo de Young',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '한 가닥이 아니라 재료에 속하는 뻣뻣함',
    en: 'A stiffness that belongs to the material, not to one strand',
    ja: '一本の線ではなく材料に属する硬さ',
    zh: '属于材料而非某一根线的刚度',
    ar: 'صلابة تخص المادة لا خيطًا بعينه',
    es: 'Una rigidez que pertenece al material, no a un solo hilo',
    fr: 'Une raideur propre au matériau, et non à un seul fil',
    hi: 'ऐसी कठोरता जो किसी एक तार की नहीं, पदार्थ की होती है',
    id: 'Kekakuan yang dimiliki bahan, bukan oleh satu helai kawat',
    pt: 'Uma rigidez que pertence ao material, não a um só fio',
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
  /** 선 이름 — 재료와 늘어나기 전 길이. */
  'label.wire.steel': {
    ko: '강철 {l} m',
    en: 'steel {l} m',
    ja: '鋼 {l} m',
    zh: '钢 {l} m',
    ar: 'فولاذ {l} m',
    es: 'acero {l} m',
    fr: 'acier {l} m',
    hi: 'स्टील {l} m',
    id: 'baja {l} m',
    pt: 'aço {l} m',
  },
  'label.wire.aluminium': {
    ko: '알루미늄 {l} m',
    en: 'aluminium {l} m',
    ja: 'アルミニウム {l} m',
    zh: '铝 {l} m',
    ar: 'ألومنيوم {l} m',
    es: 'aluminio {l} m',
    fr: 'aluminium {l} m',
    hi: 'ऐलुमिनियम {l} m',
    id: 'aluminium {l} m',
    pt: 'alumínio {l} m',
  },
  /** 추에 새긴 질량. 수와 단위는 표식이다 (C1 판정 3). */
  'label.mass': {
    ko: '{m} kg',
    en: '{m} kg',
    ja: '{m} kg',
    zh: '{m} kg',
    ar: '{m} kg',
    es: '{m} kg',
    fr: '{m} kg',
    hi: '{m} kg',
    id: '{m} kg',
    pt: '{m} kg',
  },
  /** 선 전체가 늘어난 실제 길이. */
  'label.stretch': {
    ko: '늘어남 {x} mm',
    en: 'stretch {x} mm',
    ja: '伸び {x} mm',
    zh: '伸长 {x} mm',
    ar: 'الاستطالة {x} mm',
    es: 'alargamiento {x} mm',
    fr: 'allongement {x} mm',
    hi: 'खिंचाव {x} mm',
    id: 'pertambahan panjang {x} mm',
    pt: 'alongamento {x} mm',
  },
  /** 배율 안내. 부풀린 그림을 숨기면 그림이 거짓이 된다. */
  'label.scaleNote': {
    ko: '늘어난 길이는 약 {k}배로 키워 그림 · 선 지름 {d} mm · 눈금 {c} cm 마다',
    en: 'Stretch drawn about {k}× larger · wire diameter {d} mm · a mark every {c} cm',
    ja: '伸びは約 {k}× に拡大して描画 · 線の直径 {d} mm · 目盛りは {c} cm ごと',
    zh: '伸长量放大约 {k}× 绘制 · 金属丝直径 {d} mm · 每 {c} cm 一个刻度',
    ar: 'الاستطالة مرسومة أكبر بنحو {k}× · قطر السلك {d} mm · علامة كل {c} cm',
    es: 'Alargamiento dibujado unas {k}× más grande · diámetro del alambre {d} mm · una marca cada {c} cm',
    fr: 'Allongement dessiné environ {k}× plus grand · diamètre du fil {d} mm · un repère tous les {c} cm',
    hi: 'खिंचाव लगभग {k}× बड़ा करके दिखाया गया · तार का व्यास {d} mm · हर {c} cm पर एक निशान',
    id: 'Pertambahan panjang digambar sekitar {k}× lebih besar · diameter kawat {d} mm · satu tanda tiap {c} cm',
    pt: 'Alongamento desenhado cerca de {k}× maior · diâmetro do fio {d} mm · uma marca a cada {c} cm',
  },
  'caption.main': {
    ko: '같은 추를 걸면 강철선의 눈금은 선의 길이와 상관없이 같은 높이까지 내려오고, 알루미늄선의 눈금은 그보다 더 내려온다.',
    en: 'With the same weight, the marks on the steel wires drop to the same heights whatever the length, and the marks on the aluminium wire drop further.',
    ja: '同じおもりを掛けると、鋼線の目盛りは線の長さに関係なく同じ高さまで下がり、アルミニウム線の目盛りはそれよりさらに下がる。',
    zh: '挂上相同的重物，钢丝上的刻度无论长短都降到相同的高度，而铝丝上的刻度降得更低。',
    ar: 'عند تعليق الثقل نفسه، تنخفض العلامات على أسلاك الفولاذ إلى الارتفاعات نفسها أيًّا كان الطول، وتنخفض العلامات على سلك الألومنيوم أكثر.',
    es: 'Con el mismo peso, las marcas de los alambres de acero bajan a las mismas alturas sea cual sea la longitud, y las del alambre de aluminio bajan más.',
    fr: 'Avec le même poids, les repères des fils d’acier descendent aux mêmes hauteurs quelle que soit la longueur, et ceux du fil d’aluminium descendent davantage.',
    hi: 'समान भार लटकाने पर स्टील के तारों के निशान लंबाई चाहे जो हो, समान ऊँचाइयों तक उतरते हैं, और ऐलुमिनियम के तार के निशान उससे भी नीचे उतरते हैं।',
    id: 'Dengan beban yang sama, tanda pada kawat-kawat baja turun ke ketinggian yang sama berapa pun panjangnya, dan tanda pada kawat aluminium turun lebih jauh.',
    pt: 'Com o mesmo peso, as marcas dos fios de aço descem às mesmas alturas qualquer que seja o comprimento, e as do fio de alumínio descem mais.',
  },
} satisfies Record<string, LocalizedText>);

export type YoungsModulusMessageKey = keyof typeof youngsModulusMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: YoungsModulusMessageKey): LocalizedText => youngsModulusMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: YoungsModulusMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const youngsModulusSchema: BundleSchema = {
  id: YOUNGS_MODULUS_ID,
  label: text('label.title'),
  category: 'mechanics',
  description: text('label.description'),
  timeModel: 'periodic',

  // 조작기가 없다. 받침대가 알아서 오르내리며 주장이 끝난다.
  parameters: [],

  stages: [{ id: 'default', label: text('label.stage'), constants: {} }],
  environments: [],
  views: [{ id: 'default', label: text('label.view'), default: true }],

  /**
   * 원본은 그림 860 × 430 + 캔버스 밖 캡션 한 줄이었다. 캡션이 캔버스 안(화면 고정
   * 줄)으로 들어오고 러너가 사방에 여백을 두므로 그만큼 더 잡는다.
   */
  canvas: { height: 520, minHeight: 460 },

  /** 원본은 `(t + 1.5) mod 8` 로 열었다 — 받침대가 내려가는 중에 도착한다. */
  startAt: OFFSET,

  /**
   * 한 주기 8 s — 내려감 3 → 머묾 2 → 올라옴 2 → 머묾 1. 움직이는 두 단계에만 이징.
   * 캡션은 한 문장으로 고정이라 단계가 말하지 않는다 (슬롯의 `text`).
   */
  timeline: {
    phases: [
      { id: 'lower', duration: LOWER, ease: 'smooth' },
      { id: 'holdLow', duration: HOLD_LOW },
      { id: 'raise', duration: RAISE, ease: 'smooth' },
      { id: 'holdHigh', duration: HOLD_HIGH },
    ],
  },

  // 원본이 그린 순서대로 겹친다 — 천장 · 이름 · 점선 · 옛 눈금 · 선 · 눈금 · 추 · 받침대 · 수치 · 안내.
  drawOrder: 'scene',

  // 슬롯 하나, 고정. 원본의 캔버스 아래 캡션 자리 — 왼쪽, 15px, 먹색.
  caption: {
    anchor: { screen: 'bottom-left' },
    align: 'left',
    fontSize: 15,
    style: { colorRole: 'ink', emphasis: 'strong' },
    text: key('caption.main'),
  },

  // 그리드도 카메라 버튼도 없다 (기본값). 비교는 거리가 아니라 높이가 맞는가로 일어난다.

  messages: youngsModulusMessages,
};
