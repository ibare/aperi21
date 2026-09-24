// ========================================================================
// rc-circuit — 선언
// ========================================================================
// 질문: 축전기는 왜 처음엔 빨리 차다가 점점 느리게 차는가 — 그리고 τ 라는 한 시간이
// 왜 그 전체를 대표하는가.
//
// 극판에 쌓인 전하가 흐름을 막아, 가려는 전압까지 남은 차이가 τ 마다 같은 비율로 줄어든다.
// 원본: tasks/piece-lab/rc-circuit (상수 · 배치는 원본 index.html 에서 그대로 옮겼다).
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:rc-circuit` 와 문자 그대로 일치한다 (C4). */
export const RC_CIRCUIT_ID = 'rc-circuit';

// ------------------------------------------------------------------------
// 물리 확정값 (전지 전압을 1 로 둔 무차원)
// ------------------------------------------------------------------------

/** 저항 작게 · 기본 · 크게 에 따른 τ(초). 원본 `TAUS`. */
export const TAUS: readonly number[] = [0.6, 1.2, 2.4];
/** 기본 저항 단의 번호. */
export const DEFAULT_R = 1;
/** 흐름 세기의 기준 τ. 원본 `TAU_DEFAULT`. */
export const TAU_DEFAULT = 1.2;
/** 5τ 충전 → 5τ 방전 → 되풀이. */
export const CHARGE_SPAN = 5;
export const CYCLE = 10;
/** 도착한 순간 이미 충전이 0.4τ 진행돼 있다. */
export const LEAD_TAUS = 0.4;

/** 도선 위 전하 점의 간격(px)과 흐름 계수 — 흐르는 거리 = 150 × 전류 × dt. */
export const DOT_GAP = 22;
export const FLOW_GAIN = 150;

// ------------------------------------------------------------------------
// 배치 (원본 캔버스 880 × 300 px 를 월드 단위 그대로 쓴다. y 는 scene 이 뒤집는다)
// ------------------------------------------------------------------------

export const CANVAS_W = 880;
export const CANVAS_H = 300;

/** 스위치 세 접점 — A(충전 쪽) · P(날의 축) · B(우회 도선 쪽). */
export const SW_A = [96, 50] as const;
export const SW_P = [146, 50] as const;
export const SW_B = [104, 94] as const;
export const PLATE = { top: 132, bottom: 168, left: 285, right: 375 } as const;
export const BAT = { pos: 150, neg: 162 } as const;
export const RES = { left: 175, right: 250 } as const;
/** 전지 이름표가 들어갈 왼쪽 여백. 회로 전체를 이만큼 민다. */
export const CIRCUIT_SHIFT = 30;
/** 그래프 틀. */
export const GRAPH = { x0: 480, x1: 860, top: 60, bottom: 240 } as const;

/**
 * 고정 프레이밍. 원본 캔버스 전체에 아래로 캡션 · 조작기 줄 자리를 더 잡는다 —
 * 원본은 그림 아래 DOM 줄에 캡션과 슬라이더를 두었다.
 */
export const SCENE_BOUNDS = { minX: 10, maxX: 870, minY: -34, maxY: 296 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const rcCircuitMessages = Object.freeze({
  'label.title': {
    ko: 'RC 회로',
    en: 'RC circuit',
    ja: 'RC回路',
    zh: 'RC电路',
    ar: 'دائرة RC',
    es: 'Circuito RC',
    fr: 'Circuit RC',
    hi: 'RC परिपथ',
    id: 'Rangkaian RC',
    pt: 'Circuito RC',
  },
  'label.operation': {
    ko: '남은 차이가 τ 마다 같은 비율로 줄어든다',
    en: 'The remaining gap shrinks by the same ratio every τ',
    ja: '残りの差がτごとに同じ割合で縮む',
    zh: '剩余的差距每经过 τ 按相同比例缩小',
    ar: 'يتقلص الفرق المتبقي بالنسبة نفسها كل τ',
    es: 'La diferencia restante se reduce en la misma proporción cada τ',
    fr: 'L’écart restant diminue du même facteur à chaque τ',
    hi: 'बचा हुआ अंतर हर τ में समान अनुपात से घटता है',
    id: 'Selisih yang tersisa menyusut dengan rasio yang sama setiap τ',
    pt: 'A diferença restante diminui na mesma proporção a cada τ',
  },
  'label.stage': {
    ko: '회로',
    en: 'Circuit',
    ja: '回路',
    zh: '电路',
    ar: 'الدائرة',
    es: 'Circuito',
    fr: 'Circuit',
    hi: 'परिपथ',
    id: 'Rangkaian',
    pt: 'Circuito',
  },
  'label.view': {
    ko: '회로와 그래프',
    en: 'Circuit and graph',
    ja: '回路とグラフ',
    zh: '电路与图',
    ar: 'الدائرة والمنحنى',
    es: 'Circuito y gráfica',
    fr: 'Circuit et graphe',
    hi: 'परिपथ और ग्राफ़',
    id: 'Rangkaian dan grafik',
    pt: 'Circuito e gráfico',
  },

  'label.battery': {

    ko: '전지',

    en: 'battery',

    ja: '電池',

    zh: '电池',

    ar: 'بطارية',

    es: 'batería',

    fr: 'pile',

    hi: 'बैटरी',

    id: 'baterai',

    pt: 'bateria',

  },
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
  'label.capacitor': {
    ko: '축전기',
    en: 'capacitor',
    ja: 'コンデンサー',
    zh: '电容器',
    ar: 'مكثف',
    es: 'condensador',
    fr: 'condensateur',
    hi: 'संधारित्र',
    id: 'kapasitor',
    pt: 'capacitor',
  },
  'label.charging': {
    ko: '충전',
    en: 'charging',
    ja: '充電',
    zh: '充电',
    ar: 'شحن',
    es: 'carga',
    fr: 'charge',
    hi: 'आवेशन',
    id: 'pengisian',
    pt: 'carga',
  },
  'label.discharging': {
    ko: '방전',
    en: 'discharging',
    ja: '放電',
    zh: '放电',
    ar: 'تفريغ',
    es: 'descarga',
    fr: 'décharge',
    hi: 'निरावेशन',
    id: 'pengosongan',
    pt: 'descarga',
  },
  /** τ 초 값. 자릿수는 조각이 문자열로 정한다. */
  'label.tau': {
    ko: 'τ = {tau}초',
    en: 'τ = {tau} s',
    ja: 'τ = {tau} s',
    zh: 'τ = {tau} s',
    ar: 'τ = {tau} s',
    es: 'τ = {tau} s',
    fr: 'τ = {tau} s',
    hi: 'τ = {tau} s',
    id: 'τ = {tau} s',
    pt: 'τ = {tau} s',
  },
  'label.batteryVoltage': {
    ko: '전지 전압',
    en: 'battery voltage',
    ja: '電池の電圧',
    zh: '电池电压',
    ar: 'جهد البطارية',
    es: 'voltaje de la batería',
    fr: 'tension de la pile',
    hi: 'बैटरी की वोल्टता',
    id: 'tegangan baterai',
    pt: 'tensão da bateria',
  },
  'label.capVoltage': {
    ko: '축전기 전압',
    en: 'capacitor voltage',
    ja: 'コンデンサーの電圧',
    zh: '电容器电压',
    ar: 'جهد المكثف',
    es: 'voltaje del condensador',
    fr: 'tension du condensateur',
    hi: 'संधारित्र की वोल्टता',
    id: 'tegangan kapasitor',
    pt: 'tensão do capacitor',
  },
  /** 축의 영점과 τ 눈금 — 수식 표식이라 번역하지 않는다 (C1 판정 3). */
  'label.zero': {
    ko: '0',
    en: '0',
    ja: '0',
    zh: '0',
    ar: '0',
    es: '0',
    fr: '0',
    hi: '0',
    id: '0',
    pt: '0',
  },
  'label.tick': {
    ko: '{k}τ',
    en: '{k}τ',
    ja: '{k}τ',
    zh: '{k}τ',
    ar: '{k}τ',
    es: '{k}τ',
    fr: '{k}τ',
    hi: '{k}τ',
    id: '{k}τ',
    pt: '{k}τ',
  },
  /** 이웃한 두 τ 의 남은 차이 비 — 표식 (C1 판정 3). */
  'label.ratio': {
    ko: '×0.368',
    en: '×0.368',
    ja: '×0.368',
    zh: '×0.368',
    ar: '×0.368',
    es: '×0.368',
    fr: '×0.368',
    hi: '×0.368',
    id: '×0.368',
    pt: '×0.368',
  },

  'control.resistance': {

    ko: '저항 R',

    en: 'Resistance R',

    ja: '抵抗 R',

    zh: '电阻 R',

    ar: 'المقاومة R',

    es: 'Resistencia R',

    fr: 'Résistance R',

    hi: 'प्रतिरोध R',

    id: 'Hambatan R',

    pt: 'Resistência R',

  },
  'option.small': {
    ko: '작게',
    en: 'low',
    ja: '小さい',
    zh: '小',
    ar: 'منخفضة',
    es: 'baja',
    fr: 'faible',
    hi: 'कम',
    id: 'rendah',
    pt: 'baixa',
  },
  'option.default': {
    ko: '기본',
    en: 'default',
    ja: '標準',
    zh: '默认',
    ar: 'افتراضية',
    es: 'predeterminada',
    fr: 'par défaut',
    hi: 'डिफ़ॉल्ट',
    id: 'bawaan',
    pt: 'padrão',
  },
  'option.large': {
    ko: '크게',
    en: 'high',
    ja: '大きい',
    zh: '大',
    ar: 'مرتفعة',
    es: 'alta',
    fr: 'élevée',
    hi: 'अधिक',
    id: 'tinggi',
    pt: 'alta',
  },

  'caption.charging': {

    ko: '충전 중 — 극판에 쌓인 전하가 거슬러 밀수록 흐름이 잦아들고, 남은 차이는 τ마다 같은 비율로 줄어든다',

    en: 'Charging — the more charge piles on the plates and pushes back, the more the flow dies down; the remaining gap shrinks by the same ratio every τ',

    ja: '充電中 — 極板にたまった電荷が押し返すほど流れは弱まり、残りの差はτごとに同じ割合で縮む',

    zh: '充电中 — 极板上积累的电荷越多、反推越强，电流就越弱；剩余的差距每经过 τ 按相同比例缩小',

    ar: 'الشحن — كلما تراكمت الشحنة على اللوحين ودفعت إلى الوراء خفت التدفق؛ ويتقلص الفرق المتبقي بالنسبة نفسها كل τ',

    es: 'Cargando — cuanta más carga se acumula en las placas y empuja en contra, más se apaga el flujo; la diferencia restante se reduce en la misma proporción cada τ',

    fr: 'Charge — plus la charge s’accumule sur les armatures et repousse, plus le courant s’éteint ; l’écart restant diminue du même facteur à chaque τ',

    hi: 'आवेशन — प्लेटों पर जितना अधिक आवेश जमा होकर पीछे धकेलता है, प्रवाह उतना ही धीमा पड़ता है; बचा हुआ अंतर हर τ में समान अनुपात से घटता है',

    id: 'Mengisi — makin banyak muatan menumpuk di keping dan mendorong balik, makin surut alirannya; selisih yang tersisa menyusut dengan rasio yang sama setiap τ',

    pt: 'Carregando — quanto mais carga se acumula nas placas e empurra de volta, mais o fluxo diminui; a diferença restante diminui na mesma proporção a cada τ',

  },
  'caption.discharging': {
    ko: '방전 중 — 전하가 빠질수록 밀어내는 힘도 약해져 흐름이 잦아들고, 남은 차이는 τ마다 같은 비율로 줄어든다',
    en: 'Discharging — as charge drains away the push weakens and the flow dies down; the remaining gap shrinks by the same ratio every τ',
    ja: '放電中 — 電荷が抜けるほど押す力も弱まって流れは弱まり、残りの差はτごとに同じ割合で縮む',
    zh: '放电中 — 电荷流失，推力随之减弱，电流渐渐变小；剩余的差距每经过 τ 按相同比例缩小',
    ar: 'التفريغ — مع تسرّب الشحنة يضعف الدفع ويخفت التدفق؛ ويتقلص الفرق المتبقي بالنسبة نفسها كل τ',
    es: 'Descargando — a medida que la carga se va, el empuje se debilita y el flujo se apaga; la diferencia restante se reduce en la misma proporción cada τ',
    fr: 'Décharge — à mesure que la charge s’écoule, la poussée faiblit et le courant s’éteint ; l’écart restant diminue du même facteur à chaque τ',
    hi: 'निरावेशन — आवेश निकलने के साथ धक्का कमज़ोर पड़ता है और प्रवाह धीमा हो जाता है; बचा हुआ अंतर हर τ में समान अनुपात से घटता है',
    id: 'Mengosongkan — seiring muatan terkuras, dorongannya melemah dan aliran surut; selisih yang tersisa menyusut dengan rasio yang sama setiap τ',
    pt: 'Descarregando — conforme a carga se esvai, o empurrão enfraquece e o fluxo diminui; a diferença restante diminui na mesma proporção a cada τ',
  },
} satisfies Record<string, LocalizedText>);

export type RcCircuitMessageKey = keyof typeof rcCircuitMessages;

export const text = (key: RcCircuitMessageKey): LocalizedText => rcCircuitMessages[key];

/** 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: RcCircuitMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const rcCircuitSchema: BundleSchema = {
  id: RC_CIRCUIT_ID,
  label: text('label.title'),
  category: 'em',
  operation: text('label.operation'),
  timeModel: 'periodic',
  parameters: [],
  stages: [{ id: 'default', label: text('label.stage'), constants: {} }],
  environments: [],
  views: [{ id: 'default', label: text('label.view'), default: true }],

  /** 원본 캔버스 300 px + 캡션 · 조작기 줄. */
  canvas: { height: 420, minHeight: 360 },

  /**
   * 원본은 그리는 순서가 곧 겹침이다 — 도선 위 전하 점, 눈금 위 곡선, 곡선 위 주황 막대.
   * 층 대신 scene 에 쓴 순서를 따른다.
   */
  drawOrder: 'scene',

  /**
   * 시간표를 쓰지 않는다. 주기(5τ 충전 + 5τ 방전)의 초 길이가 **저항 선택을 따라**
   * 6 · 12 · 24 초로 바뀌어 단계 길이를 선언할 수 없다 (NOTES 「어휘 부족」 G13).
   * 그래서 `step` 이 τ 단위 주기 위치를 쌓고, 도착 때의 0.4τ 진행은 `preroll` 이 만든다.
   */
  preroll: LEAD_TAUS * TAU_DEFAULT,

  /** 슬롯 하나. 충전 / 방전 구간은 스위치 날과 같은 조건(physics `derive`)에서 갈린다. */
  caption: {
    anchor: { screen: 'bottom-left', offset: [-8, -2] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 540,
    style: { colorRole: 'ink', emphasis: 'strong' },
    text: key('caption.charging'),
    cases: [
      { when: 'charging', text: key('caption.charging') },
      { when: 'discharging', text: key('caption.discharging') },
    ],
  },

  messages: rcCircuitMessages,
};
