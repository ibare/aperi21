// ========================================================================
// phase-in-ac-circuit — 선언
// ========================================================================
// 질문: 교류에서 전압과 전류는 같은 때에 가장 커지는가.
//
// 같은 교류 전압을 저항 · 축전기 · 코일에 따로 건 세 줄이 위아래로 있다. 줄마다 기록지에
// 전압(실선)과 전류(파선)를 같은 시간축에 겹쳐 그린다. 기록지 가운데에 전압의 마루가 하나
// 있고, 전류의 마루는 저항에서는 그 자리, 축전기에서는 1/4 주기 왼쪽(먼저), 코일에서는
// 1/4 주기 오른쪽(늦게)에 온다. 강조색 간격 막대가 그 어긋남을 잰다. 세로 커서가 기록지를
// 쓸고 지나가며 두 점이 마루에 닿는 순서를 보이고, 오른쪽 회전 화살표(페이저)가 같은
// 시각으로 돈다.
//
// 막는 정도(리액턴스)가 진동수에 따라 바뀌는 것은 `reactance` 의 몫이라 두지 않는다.
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:phase-in-ac-circuit` 와 문자 그대로 일치한다 (C4). */
export const PHASE_IN_AC_CIRCUIT_ID = 'phase-in-ac-circuit';

// ------------------------------------------------------------------------
// 물리 · 표시 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 전원의 진동수(Hz). */
export const FREQUENCY_HZ = 50;
/**
 * 기록지 한 폭이 담는 시간(ms). 기본값 25 ms 는 50 Hz 의 1.25 주기다 — 가운데에 전압 마루가
 * 하나만 들고, 1/4 주기 앞뒤의 전류 마루도 폭 안에 든다.
 */
export const SCOPE_WINDOW_MS = 25;
/** 전압 · 전류의 표시 진폭(월드 단위). 두 파형이 겹쳐도 갈리도록 높이를 다르게 둔다. */
export const VOLTAGE_AMPLITUDE = 0.85;
export const CURRENT_AMPLITUDE = 0.5;

// ------------------------------------------------------------------------
// 배치 — 월드 단위
// ------------------------------------------------------------------------

/** 세 줄(위: 저항 · 가운데: 축전기 · 아래: 코일)의 가운데 y. */
export const ROW_RESISTOR_Y = 2.75;
export const ROW_CAPACITOR_Y = 0;
export const ROW_INDUCTOR_Y = -2.75;

/** 소자 기호의 가운데 x · 도선까지 친 반 길이. */
export const SYMBOL_X = -7.5;
export const SYMBOL_HALF_LEN = 0.65;

/** 기록지 — 왼쪽 x · 오른쪽 x. 세로 가운데(시간축)는 그 줄의 y. */
export const SCOPE_LEFT = -5.9;
export const SCOPE_RIGHT = 5.4;
/** 기록지 세로축 · 커서 · 마루 기준선의 반 높이. */
export const SCOPE_HALF_H = 0.95;
/** 간격 막대의 높이(줄 가운데에서). 전압 마루보다 조금 위. */
export const GAP_BAR_Y = 1.1;

/** 회전 화살표(페이저)의 중심 x. 중심 y 는 그 줄의 y. */
export const PHASOR_X = 7.4;

/**
 * 프레이밍은 주장의 일부다. 가로는 소자 이름표부터 회전 화살표 오른쪽 끝까지, 세로는 맨 위 줄
 * 이름표부터 캡션 줄 아래까지. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -8.6, maxX: 8.6, minY: -4.4, maxY: 4.25 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const phaseInAcCircuitMessages = Object.freeze({
  'label.title': { ko: '교류의 위상차', en: 'Phase difference in AC circuits', ja: '交流回路の位相差', zh: '交流电路中的相位差', ar: 'فرق الطور في دوائر التيار المتردد', es: 'Diferencia de fase en circuitos de CA', fr: 'Déphasage dans les circuits en courant alternatif', hi: 'प्रत्यावर्ती धारा परिपथों में कलांतर', id: 'Beda fase pada rangkaian AC', pt: 'Diferença de fase em circuitos CA' },
  'label.operation': { ko: '전압과 전류가 어긋나는 것', en: 'Voltage and current falling out of step', ja: '電圧と電流のずれ', zh: '电压与电流步调错开', ar: 'خروج الجهد والتيار عن التوافق', es: 'Voltaje y corriente que se desfasan', fr: 'Tension et courant qui se décalent', hi: 'वोल्टता और धारा का एक-दूसरे से आगे-पीछे होना', id: 'Tegangan dan arus yang tidak lagi seirama', pt: 'Tensão e corrente saindo de fase' },
  'label.stage': { ko: '저항 · 축전기 · 코일', en: 'Resistor, capacitor, coil', ja: '抵抗、コンデンサー、コイル', zh: '电阻、电容器、线圈', ar: 'مقاومة ومكثف وملف', es: 'Resistencia, condensador, bobina', fr: 'Résistance, condensateur, bobine', hi: 'प्रतिरोध, संधारित्र, कुंडली', id: 'Hambatan, kapasitor, kumparan', pt: 'Resistor, capacitor, bobina' },
  'label.view': { ko: '세 기록지와 회전 화살표', en: 'Three traces and phasors', ja: '三つの波形とフェーザー', zh: '三条波形与相量', ar: 'ثلاثة منحنيات ومتجهات طورية', es: 'Tres trazas y fasores', fr: 'Trois tracés et vecteurs de Fresnel', hi: 'तीन अनुरेख और फेज़र', id: 'Tiga jejak dan fasor', pt: 'Três traços e fasores' },
  /** 도식 표식 — 소자 · 물리량 기호라 번역하지 않는다 (C1 판정 3). */
  'label.resistor': { ko: 'R', en: 'R', ja: 'R', zh: 'R', ar: 'R', es: 'R', fr: 'R', hi: 'R', id: 'R', pt: 'R' },
  'label.capacitor': { ko: 'C', en: 'C', ja: 'C', zh: 'C', ar: 'C', es: 'C', fr: 'C', hi: 'C', id: 'C', pt: 'C' },
  'label.inductor': { ko: 'L', en: 'L', ja: 'L', zh: 'L', ar: 'L', es: 'L', fr: 'L', hi: 'L', id: 'L', pt: 'L' },
  'label.voltage': { ko: 'V', en: 'V', ja: 'V', zh: 'V', ar: 'V', es: 'V', fr: 'V', hi: 'V', id: 'V', pt: 'V' },
  'label.current': { ko: 'I', en: 'I', ja: 'I', zh: 'I', ar: 'I', es: 'I', fr: 'I', hi: 'I', id: 'I', pt: 'I' },
  'label.time': { ko: 't', en: 't', ja: 't', zh: 't', ar: 't', es: 't', fr: 't', hi: 't', id: 't', pt: 't' },
  'label.quarterPeriod': { ko: 'T/4', en: 'T/4', ja: 'T/4', zh: 'T/4', ar: 'T/4', es: 'T/4', fr: 'T/4', hi: 'T/4', id: 'T/4', pt: 'T/4' },
  /** 소자 이름 — 낱말이라 문안이다. */
  'label.resistorName': { ko: '저항', en: 'resistor', ja: '抵抗', zh: '电阻', ar: 'مقاومة', es: 'resistencia', fr: 'résistance', hi: 'प्रतिरोध', id: 'hambatan', pt: 'resistor' },
  'label.capacitorName': { ko: '축전기', en: 'capacitor', ja: 'コンデンサー', zh: '电容器', ar: 'مكثف', es: 'condensador', fr: 'condensateur', hi: 'संधारित्र', id: 'kapasitor', pt: 'capacitor' },
  'label.inductorName': { ko: '코일', en: 'coil', ja: 'コイル', zh: '线圈', ar: 'ملف', es: 'bobina', fr: 'bobine', hi: 'कुंडली', id: 'kumparan', pt: 'bobina' },
  'caption.resistor': {
    ko: '저항 — 전류(파선)의 마루가 전압(실선)의 마루와 같은 때에 온다',
    en: 'Resistor — the current (dashed) peaks at the same moment as the voltage (solid)',
    ja: '抵抗 — 電流(破線)の山が電圧(実線)の山と同じ時刻に来る',
    zh: '电阻 — 电流（虚线）与电压（实线）同时达到峰值',
    ar: 'المقاومة — يبلغ التيار (المتقطع) ذروته في اللحظة نفسها التي يبلغها الجهد (المتصل)',
    es: 'Resistencia — la corriente (discontinua) llega a su máximo en el mismo instante que el voltaje (continuo)',
    fr: 'Résistance — le courant (pointillés) atteint son maximum au même instant que la tension (trait plein)',
    hi: 'प्रतिरोध — धारा (टूटी रेखा) उसी क्षण शिखर पर पहुँचती है जब वोल्टता (सतत रेखा)',
    id: 'Hambatan — arus (putus-putus) mencapai puncak pada saat yang sama dengan tegangan (garis penuh)',
    pt: 'Resistor — a corrente (tracejada) atinge o pico no mesmo instante que a tensão (contínua)',
  },
  'caption.capacitor': {
    ko: '축전기 — 전류의 마루가 전압의 마루보다 1/4 주기 먼저 온다',
    en: 'Capacitor — the current peaks a quarter period before the voltage',
    ja: 'コンデンサー — 電流の山が電圧の山より1/4周期早く来る',
    zh: '电容器 — 电流比电压早四分之一周期达到峰值',
    ar: 'المكثف — يبلغ التيار ذروته قبل الجهد بربع دور',
    es: 'Condensador — la corriente llega a su máximo un cuarto de periodo antes que el voltaje',
    fr: 'Condensateur — le courant atteint son maximum un quart de période avant la tension',
    hi: 'संधारित्र — धारा वोल्टता से एक चौथाई आवर्तकाल पहले शिखर पर पहुँचती है',
    id: 'Kapasitor — arus mencapai puncak seperempat periode sebelum tegangan',
    pt: 'Capacitor — a corrente atinge o pico um quarto de período antes da tensão',
  },
  'caption.inductor': {
    ko: '코일 — 전류의 마루가 전압의 마루보다 1/4 주기 늦게 온다',
    en: 'Coil — the current peaks a quarter period after the voltage',
    ja: 'コイル — 電流の山が電圧の山より1/4周期遅く来る',
    zh: '线圈 — 电流比电压晚四分之一周期达到峰值',
    ar: 'الملف — يبلغ التيار ذروته بعد الجهد بربع دور',
    es: 'Bobina — la corriente llega a su máximo un cuarto de periodo después que el voltaje',
    fr: 'Bobine — le courant atteint son maximum un quart de période après la tension',
    hi: 'कुंडली — धारा वोल्टता से एक चौथाई आवर्तकाल बाद शिखर पर पहुँचती है',
    id: 'Kumparan — arus mencapai puncak seperempat periode sesudah tegangan',
    pt: 'Bobina — a corrente atinge o pico um quarto de período depois da tensão',
  },
  'caption.together': {
    ko: '돌아가는 화살표로도 같다 — 축전기의 전류는 전압보다 1/4 바퀴 앞서 돌고, 코일의 전류는 1/4 바퀴 뒤따른다',
    en: 'The rotating arrows say the same — the capacitor’s current turns a quarter turn ahead of the voltage, the coil’s a quarter turn behind',
    ja: '回転する矢印でも同じ — コンデンサーの電流は電圧より1/4回転先を回り、コイルの電流は1/4回転遅れて回る',
    zh: '旋转的箭头也一样 — 电容器的电流比电压超前四分之一圈，线圈的电流落后四分之一圈',
    ar: 'الأسهم الدوارة تقول الشيء نفسه — تيار المكثف يسبق الجهد بربع دورة، وتيار الملف يتأخر عنه بربع دورة',
    es: 'Las flechas giratorias dicen lo mismo — la corriente del condensador gira un cuarto de vuelta por delante del voltaje, y la de la bobina, un cuarto de vuelta por detrás',
    fr: 'Les flèches tournantes disent la même chose — le courant du condensateur tourne un quart de tour en avance sur la tension, celui de la bobine un quart de tour en retard',
    hi: 'घूमते तीर भी यही बताते हैं — संधारित्र की धारा वोल्टता से एक चौथाई चक्कर आगे घूमती है, कुंडली की धारा एक चौथाई चक्कर पीछे',
    id: 'Panah yang berputar menunjukkan hal yang sama — arus kapasitor berputar seperempat putaran di depan tegangan, arus kumparan seperempat putaran di belakangnya',
    pt: 'As setas girantes dizem o mesmo — a corrente do capacitor gira um quarto de volta à frente da tensão, a da bobina um quarto de volta atrás',
  },
} satisfies Record<string, LocalizedText>);

export type PhaseInAcCircuitMessageKey = keyof typeof phaseInAcCircuitMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: PhaseInAcCircuitMessageKey): LocalizedText => phaseInAcCircuitMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: PhaseInAcCircuitMessageKey): string {
  return k;
}

/** 줄을 차례로 부각하는 단계 id 와 마지막 「나란히」 단계 id. 단계의 길이는 선언(`timeline`)이 정한다. */
export const PHASE_RESISTOR = 'resistor';
export const PHASE_CAPACITOR = 'capacitor';
export const PHASE_INDUCTOR = 'inductor';
export const PHASE_TOGETHER = 'together';

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const phaseInAcCircuitSchema: BundleSchema = {
  id: PHASE_IN_AC_CIRCUIT_ID,
  label: text('label.title'),
  category: 'em',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 커서가 세 기록지를 차례로 쓸고, 마루가 오는 순서가 보인다.
  parameters: [],

  stages: [
    {
      id: 'three-elements',
      label: text('label.stage'),
      constants: {
        frequency: FREQUENCY_HZ,
        scopeWindow: SCOPE_WINDOW_MS,
        voltageAmplitude: VOLTAGE_AMPLITUDE,
        currentAmplitude: CURRENT_AMPLITUDE,
      },
    },
  ],

  environments: [],

  views: [{ id: 'traces-and-phasors', label: text('label.view'), default: true }],

  /** 세 줄이 위아래로 쌓여 세로가 먼저 찬다. 캡션 한두 줄을 더한다. */
  canvas: { height: 420, minHeight: 360 },

  /**
   * 한 주기 = 저항 줄 → 축전기 줄 → 코일 줄을 차례로 부각 → 셋을 나란히.
   * 단계마다 커서가 기록지 한 폭을 한 번 쓸고 지나간다(진행도 = 커서 자리, 선형).
   */
  timeline: {
    phases: [
      { id: PHASE_RESISTOR, duration: 5, caption: key('caption.resistor') },
      { id: PHASE_CAPACITOR, duration: 5, caption: key('caption.capacitor') },
      { id: PHASE_INDUCTOR, duration: 5, caption: key('caption.inductor') },
      { id: PHASE_TOGETHER, duration: 5, caption: key('caption.together') },
    ],
  },

  /**
   * 도착한 순간 이미 진행 중이다 — 커서가 저항 줄을 쓸고 있는 자리에서 연다.
   * 쌓는 상태가 없어 `preroll` 은 쓰지 않는다.
   */
  startAt: 1.5,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 위상차의 식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 720,
    fade: 0.25,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /** 커서 점이 파형 위에, 간격 막대가 기준선 위에 놓여야 한다 — scene 에 쓴 순서대로 그린다. */
  drawOrder: 'scene',

  messages: phaseInAcCircuitMessages,
};
