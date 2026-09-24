// ========================================================================
// iv-characteristic — 선언
// ========================================================================
// 질문: 전압을 올리면 전류가 늘 비례해 따라오는가.
//
// I–V 평면 하나에 세 소자의 곡선을 차례로 그린다. 전압을 역방향 끝에서 순방향 끝까지
// 쓸어 올리는 동안 강조색 점이 곡선을 따라 움직이며 먹색 곡선을 남긴다.
//   저항 — 원점을 지나는 직선.
//   전구 — 차가울 때 저항이 저항 소자와 같아 처음엔 그 직선을 따르다가, 뜨거워지며 눕는다.
//   다이오드 — 역방향과 문턱 아래에서는 가로축에 붙어 있다가 문턱을 넘자 치솟는다.
//
// 같은 저항에서 전압 단계로 직선을 얻는 것은 ohms-law 의 몫, 온도가 저항을 바꾸는 속사정
// (격자 떨림 · 나르개 수)은 temperature-and-resistance 의 몫이다. 여기서는 곡선의 모양만 견준다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:iv-characteristic` 와 문자 그대로 일치한다 (C4). */
export const IV_CHARACTERISTIC_ID = 'iv-characteristic';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 저항 소자(Ω). 곡선이 원점을 지나는 직선이 된다. */
export const RESISTANCE = 10;
/**
 * 전구의 차가울 때 저항(Ω). 저항 소자와 같게 두어, 원점 근처에서 두 곡선이 겹쳤다가
 * 전구 쪽만 눕는 것이 보이게 한다.
 */
export const BULB_COLD_RESISTANCE = 10;
/**
 * 전구 저항이 전압 1 V 마다 느는 몫(Ω/V). 필라멘트가 뜨거워질수록 저항이 커진다는 것을
 * R = R₀ + k|V| 로 근사한 모형 계수다 — 실제 전구의 I ∝ V^0.6 근처 모양을 낸다.
 */
export const BULB_RESISTANCE_PER_VOLT = 2;
/** 다이오드 문턱 전압(V). 가로축 눈금과 캡션에 그대로 쓴다. */
export const DIODE_THRESHOLD = 0.7;
/** 문턱에서 흐르는 다이오드 전류(A). 평면 배율로 몇 px 이라 「거의 0」 으로 보인다. */
export const DIODE_CURRENT_AT_THRESHOLD = 0.02;
/**
 * 다이오드 무릎의 날카로움(V) — 전류가 e 배 느는 전압 폭. 작을수록 문턱에서 곧게 선다.
 * I = I_th (exp((V − V_th)/w) − exp(−V_th/w)) 로 원점에서 0 이 되게 둔다.
 */
export const DIODE_KNEE_WIDTH = 0.04;

/** 쓸어 올리는 전압 구간(V) — 역방향 끝 · 순방향 끝. */
export const SWEEP_VOLTAGE_MIN = -1.5;
export const SWEEP_VOLTAGE_MAX = 6;

// ------------------------------------------------------------------------
// 표시 배율 — 이것도 선언이다 (원칙 2).
// ------------------------------------------------------------------------

/** 평면이 담는 전류 구간(A). 곡선은 이 위 · 아래 끝에서 멈춘다 — 다이오드는 위 끝에서 멎는다. */
export const PLOT_CURRENT_MIN = -0.2;
export const PLOT_CURRENT_MAX = 0.65;
/** 평면 배율 — 1 V 가 가로 몇 월드, 1 A 가 세로 몇 월드인가. */
export const PLOT_WORLD_PER_VOLT = 1.2;
export const PLOT_WORLD_PER_AMP = 3.6;

/**
 * 프레이밍은 주장의 일부다. 가로는 역방향 축 끝부터 저항 이름표까지, 세로는 캡션 줄부터
 * 세로축 이름 위까지. 매 프레임 같은 값이다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: -2.3, maxX: 8.0, minY: -1.5, maxY: 2.85 } as const;

// ------------------------------------------------------------------------
// 시간표 — 조각 시계(초)
// ------------------------------------------------------------------------

/** 저항 곡선을 쓸어 긋는 동안. */
export const RESISTOR_SWEEP = 2.6;
/** 전구 곡선을 쓸어 긋는 동안. 직선에서 벗어나는 것을 볼 만큼 저항보다 조금 길게. */
export const BULB_SWEEP = 3.2;
/** 다이오드 — 역방향 끝에서 문턱까지 가로축을 기는 동안 · 문턱에서 위 끝까지 치솟는 동안. */
export const DIODE_FLAT_SWEEP = 2.4;
export const DIODE_RISE_SWEEP = 1.4;
/** 세 곡선을 견주는 동안 · 다음 주기로 넘어가며 흐려지는 동안. */
export const COMPARE_HOLD = 3.4;
export const FADE = 0.6;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const ivCharacteristicMessages = Object.freeze({
  'label.title': {
    ko: 'I-V 특성 곡선',
    en: 'I–V characteristic curves',
    ja: 'I–V特性曲線',
    zh: 'I–V 特性曲线',
    ar: 'منحنيات الخواص I–V',
    es: 'Curvas características I–V',
    fr: 'Courbes caractéristiques I–V',
    hi: 'I–V अभिलाक्षणिक वक्र',
    id: 'Kurva karakteristik I–V',
    pt: 'Curvas características I–V',
  },
  'label.operation': {
    ko: '전압과 전류의 관계가 직선이 아닌 소자',
    en: 'Devices whose current does not follow voltage in a straight line',
    ja: '電流が電圧に対して直線的に変わらない素子',
    zh: '电流不随电压成直线变化的元件',
    ar: 'عناصر لا يتبع تيارها الجهدَ في خط مستقيم',
    es: 'Componentes cuya corriente no sigue a la tensión en línea recta',
    fr: 'Des composants dont le courant ne suit pas la tension en ligne droite',
    hi: 'ऐसे अवयव जिनकी धारा वोल्टता के साथ सरल रेखा में नहीं बदलती',
    id: 'Komponen yang arusnya tidak mengikuti tegangan secara garis lurus',
    pt: 'Componentes cuja corrente não acompanha a tensão em linha reta',
  },
  'label.stage': {
    ko: '저항 · 전구 · 다이오드',
    en: 'Resistor, bulb and diode',
    ja: '抵抗、電球、ダイオード',
    zh: '电阻、灯泡、二极管',
    ar: 'مقاومة ومصباح وصمام ثنائي',
    es: 'Resistencia, bombilla y diodo',
    fr: 'Résistance, ampoule et diode',
    hi: 'प्रतिरोध, बल्ब और डायोड',
    id: 'Hambatan, lampu, dan dioda',
    pt: 'Resistor, lâmpada e diodo',
  },
  'label.view': {
    ko: 'I–V 평면',
    en: 'The I–V plane',
    ja: 'I–V平面',
    zh: 'I–V 平面',
    ar: 'المستوى I–V',
    es: 'El plano I–V',
    fr: 'Le plan I–V',
    hi: 'I–V तल',
    id: 'Bidang I–V',
    pt: 'O plano I–V',
  },
  /** 소자 이름표. 조사가 붙지 않아도 언어마다 낱말이 달라 문안이다 (C1 판정 4). */
  'label.resistor': {
    ko: '저항',
    en: 'resistor',
    ja: '抵抗',
    zh: '电阻',
    ar: 'مقاومة',
    es: 'resistencia',
    fr: 'résistance',
    hi: 'प्रतिरोध',
    id: 'hambatan',
    pt: 'resistor',
  },
  'label.bulb': {
    ko: '전구',
    en: 'bulb',
    ja: '電球',
    zh: '灯泡',
    ar: 'مصباح',
    es: 'bombilla',
    fr: 'ampoule',
    hi: 'बल्ब',
    id: 'lampu',
    pt: 'lâmpada',
  },
  'label.diode': {
    ko: '다이오드',
    en: 'diode',
    ja: 'ダイオード',
    zh: '二极管',
    ar: 'صمام ثنائي',
    es: 'diodo',
    fr: 'diode',
    hi: 'डायोड',
    id: 'dioda',
    pt: 'diodo',
  },
  'label.reverse': {
    ko: '역방향',
    en: 'reverse',
    ja: '逆方向',
    zh: '反向',
    ar: 'عكسي',
    es: 'inversa',
    fr: 'inverse',
    hi: 'पश्च दिशा',
    id: 'mundur',
    pt: 'reversa',
  },
  /** 값이 끼는 눈금 이름표 — 단위 기호는 표식이지만 값이 끼므로 문안 키로 둔다 (C1). */
  'label.voltage': { ko: '{v} V', en: '{v} V', ja: '{v} V', zh: '{v} V', ar: '{v} V', es: '{v} V', fr: '{v} V', hi: '{v} V', id: '{v} V', pt: '{v} V' },
  /** 축 기호. 수식 표기라 번역 대상이 아니다 (C1 판정 3). */
  'label.axisV': { ko: 'V', en: 'V', ja: 'V', zh: 'V', ar: 'V', es: 'V', fr: 'V', hi: 'V', id: 'V', pt: 'V' },
  'label.axisI': { ko: 'I', en: 'I', ja: 'I', zh: 'I', ar: 'I', es: 'I', fr: 'I', hi: 'I', id: 'I', pt: 'I' },
  'label.origin': { ko: '0', en: '0', ja: '0', zh: '0', ar: '0', es: '0', fr: '0', hi: '0', id: '0', pt: '0' },
  'caption.resistor': {
    ko: '저항 — 전압을 쓸어 올리는 동안 점이 한 직선을 긋는다',
    en: 'Resistor — as the voltage sweeps up, the point traces one straight line',
    ja: '抵抗 — 電圧を上げていくと、点は一本の直線を描く',
    zh: '电阻 — 电压逐渐升高时，点画出一条直线',
    ar: 'المقاومة — مع رفع الجهد ترسم النقطة خطًا مستقيمًا واحدًا',
    es: 'Resistencia — al subir la tensión, el punto traza una sola línea recta',
    fr: 'Résistance — quand la tension monte, le point trace une seule droite',
    hi: 'प्रतिरोध — वोल्टता बढ़ाते जाने पर बिंदु एक सरल रेखा खींचता है',
    id: 'Hambatan — saat tegangan dinaikkan, titik menggambar satu garis lurus',
    pt: 'Resistor — enquanto a tensão sobe, o ponto traça uma única reta',
  },
  'caption.bulb': {
    ko: '전구 — 처음엔 저항의 직선을 따르다가 그 아래로 눕는다',
    en: "Bulb — it first follows the resistor's line, then lies down below it",
    ja: '電球 — はじめは抵抗の直線に沿い、やがてその下へ寝ていく',
    zh: '灯泡 — 起初沿着电阻的直线，随后向下弯到它的下方',
    ar: 'المصباح — يتبع أولًا خط المقاومة، ثم ينحني ليستلقي تحته',
    es: 'Bombilla — primero sigue la línea de la resistencia y luego se tumba por debajo de ella',
    fr: 'Ampoule — elle suit d’abord la droite de la résistance, puis se couche en dessous',
    hi: 'बल्ब — पहले प्रतिरोध की रेखा के साथ चलता है, फिर उसके नीचे झुक जाता है',
    id: 'Lampu — mula-mula mengikuti garis hambatan, lalu melandai di bawahnya',
    pt: 'Lâmpada — primeiro segue a reta do resistor, depois se deita abaixo dela',
  },
  'caption.diodeFlat': {
    ko: '다이오드 — 역방향에서도, {vth} V 에 이르기까지도 전류가 0 에 붙어 있다',
    en: 'Diode — in reverse and all the way up to {vth} V, the current stays pinned at 0',
    ja: 'ダイオード — 逆方向でも、{vth} V に達するまでも、電流は 0 に張りついたままだ',
    zh: '二极管 — 在反向时，以及一直到 {vth} V 之前，电流都贴在 0 上',
    ar: 'الصمام الثنائي — في الاتجاه العكسي وحتى {vth} V يبقى التيار ملتصقًا عند 0',
    es: 'Diodo — en inversa y hasta llegar a {vth} V, la corriente se queda pegada en 0',
    fr: 'Diode — en inverse et jusqu’à {vth} V, le courant reste collé à 0',
    hi: 'डायोड — पश्च दिशा में और {vth} V तक पहुँचने तक भी धारा 0 पर ही टिकी रहती है',
    id: 'Dioda — pada arah mundur dan terus hingga {vth} V, arus tetap menempel di 0',
    pt: 'Diodo — na reversa e até chegar a {vth} V, a corrente fica colada em 0',
  },
  'caption.diodeRise': {
    ko: '{vth} V 를 넘자 전류가 치솟는다',
    en: 'Past {vth} V, the current shoots up',
    ja: '{vth} V を超えると電流が急上昇する',
    zh: '超过 {vth} V，电流急剧上升',
    ar: 'بعد تجاوز {vth} V يقفز التيار صعودًا',
    es: 'Pasados los {vth} V, la corriente se dispara',
    fr: 'Au-delà de {vth} V, le courant s’envole',
    hi: '{vth} V पार होते ही धारा तेज़ी से बढ़ जाती है',
    id: 'Melewati {vth} V, arus melonjak naik',
    pt: 'Passados {vth} V, a corrente dispara',
  },
  'caption.compare': {
    ko: '세 곡선 가운데 곧은 것은 저항 하나다',
    en: "Of the three curves, only the resistor's is straight",
    ja: '三つの曲線のうち、まっすぐなのは抵抗だけだ',
    zh: '三条曲线中，只有电阻的是直的',
    ar: 'من بين المنحنيات الثلاثة، منحنى المقاومة وحده مستقيم',
    es: 'De las tres curvas, solo la de la resistencia es recta',
    fr: 'Des trois courbes, seule celle de la résistance est droite',
    hi: 'तीनों वक्रों में से केवल प्रतिरोध का वक्र सीधा है',
    id: 'Dari ketiga kurva, hanya kurva hambatan yang lurus',
    pt: 'Das três curvas, só a do resistor é reta',
  },
} satisfies Record<string, LocalizedText>);

export type IvCharacteristicMessageKey = keyof typeof ivCharacteristicMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: IvCharacteristicMessageKey): LocalizedText => ivCharacteristicMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: IvCharacteristicMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const ivCharacteristicSchema: BundleSchema = {
  id: IV_CHARACTERISTIC_ID,
  label: text('label.title'),
  category: 'em',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 점이 곡선을 긋고, 세 곡선이 차례로 쌓인다.
  parameters: [],

  stages: [
    {
      id: 'three-devices',
      label: text('label.stage'),
      constants: {
        resistance: RESISTANCE,
        bulbColdResistance: BULB_COLD_RESISTANCE,
        bulbResistancePerVolt: BULB_RESISTANCE_PER_VOLT,
        diodeThreshold: DIODE_THRESHOLD,
        diodeCurrentAtThreshold: DIODE_CURRENT_AT_THRESHOLD,
        diodeKneeWidth: DIODE_KNEE_WIDTH,
        sweepVoltageMin: SWEEP_VOLTAGE_MIN,
        sweepVoltageMax: SWEEP_VOLTAGE_MAX,
        plotCurrentMin: PLOT_CURRENT_MIN,
        plotCurrentMax: PLOT_CURRENT_MAX,
        plotWorldPerVolt: PLOT_WORLD_PER_VOLT,
        plotWorldPerAmp: PLOT_WORLD_PER_AMP,
      },
    },
  ],

  environments: [],

  views: [{ id: 'main', label: text('label.view'), default: true }],

  /** 평면 하나와 캡션 한 줄. 세로를 더 주면 가로가 먼저 차서 그림만 작아진다 (S-piece). */
  canvas: { height: 360, minHeight: 320 },

  /** 겹침이 판정 장치다 — 곡선은 축 **위**에, 지금 점은 곡선 **위**에 놓여야 「축에 붙어 있다」 로 읽힌다. */
  drawOrder: 'scene',

  /**
   * 한 주기 = 저항 → 전구 → 다이오드(문턱 아래 · 위) → 견주기 → 흐려짐.
   *
   * 곡선마다 전압을 역방향 끝에서 순방향 끝까지 쓸어 올린다. 점은 곡선 위를 화면 길이에
   * 고르게 움직인다 — 다이오드가 가로축을 기는 동안과 치솟는 동안이 두 단계로 갈린다.
   */
  timeline: {
    phases: [
      { id: 'resistor', duration: RESISTOR_SWEEP, caption: key('caption.resistor') },
      { id: 'bulb', duration: BULB_SWEEP, caption: key('caption.bulb') },
      { id: 'diodeFlat', duration: DIODE_FLAT_SWEEP, caption: key('caption.diodeFlat') },
      { id: 'diodeRise', duration: DIODE_RISE_SWEEP, caption: key('caption.diodeRise') },
      { id: 'compare', duration: COMPARE_HOLD, caption: key('caption.compare') },
      { id: 'fade', duration: FADE, caption: key('caption.compare') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — 저항 직선이 벌써 원점을 넘어 뻗고 있다. */
  startAt: 1.2,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 정의와 공식은 문단의 몫이다.
  // 끼우는 값은 스테이지 상수를 state 가 글자로 옮긴 것이다(장부 G133).
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    style: { colorRole: 'muted', emphasis: 'strong' },
    vars: { vth: 'diodeThreshold' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 곡선의 모양이 요점이지 값을 읽는 것이 아니다 —
   * 격자를 깔면 「몇 A 인가」 를 읽으라는 지시가 된다.
   */

  messages: ivCharacteristicMessages,
};
