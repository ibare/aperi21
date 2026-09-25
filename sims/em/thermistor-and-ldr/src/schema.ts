// ========================================================================
// thermistor-and-ldr — 선언
// ========================================================================
// 질문: 온도나 밝기를 어떻게 전압으로 읽는가.
//
// 두 판이 나란히 놓인다. 왼쪽은 써미스터, 오른쪽은 광저항(LDR)이다. 판마다 6 V · 0 V 두 레일
// 사이에 소자(위)와 고정 저항(아래)을 이어 분압기를 만들고, 고정 저항 양단에 걸린 출력 전압을
// 눈금판 바늘이 읽는다. 소자 옆 막대의 길이가 그 소자의 저항이다.
//
// 먼저 써미스터를 데운다 — 온도계 수은이 오르는 동안 써미스터의 저항 막대가 줄고 바늘이 오른다.
// 식힌 뒤 광저항에 빛을 쬔다 — 닿는 광선이 늘어나는 동안 광저항의 저항 막대가 줄고 바늘이 오른다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:thermistor-and-ldr` 와 문자 그대로 일치한다 (C4). */
export const THERMISTOR_AND_LDR_ID = 'thermistor-and-ldr';

// ------------------------------------------------------------------------
// 물리량 · 표시 배율 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 두 레일 사이 전압(V). 두 판이 같은 전원을 쓴다. */
export const VOLTS = 6;
/** 고정 저항(kΩ). 두 판이 같은 값을 쓴다. */
export const R_FIXED = 10;

/** 써미스터(NTC) 표본 — 차가울 때 · 데운 뒤 온도(°C)와 그때의 저항(kΩ). */
export const TEMP_COLD = 20;
export const TEMP_HOT = 60;
export const THERM_R_COLD = 10;
export const THERM_R_HOT = 2.5;

/** 광저항(LDR) 표본 — 어두울 때 · 밝을 때 닿는 광선 수와 그때의 저항(kΩ). */
export const RAYS_DARK = 1;
export const RAYS_BRIGHT = 5;
export const LDR_R_DARK = 20;
export const LDR_R_BRIGHT = 2;

/**
 * 바늘이 멈추는 자리 — **그 표본에서 출력 전압계가 읽는 값(V)**. 멈춘 바늘 글자가 계산값을 줄인 것이
 * 아니라 이 값 그대로이게 하려는 것이다(S-piece 유효숫자). 표본 저항 · 고정 저항 · 레일 전압이 정하는
 * 분압과 같아야 한다 — 기본값에서 6·10/(10+10) = 3, 6·10/(10+2.5) = 4.8, 6·10/(10+20) = 2,
 * 6·10/(10+2) = 5 (G143).
 */
export const OUT_COLD = 3;
export const OUT_HOT = 4.8;
export const OUT_DARK = 2;
export const OUT_BRIGHT = 5;

/** 표시 배율 — 저항 1 kΩ 가 막대에서 차지하는 길이(월드). 두 판의 막대가 같은 잣대를 쓴다. */
export const BAR_PER_KOHM = 0.12;
/** 출력 전압계 — 눈금 간격(V)과 지금 값 글자의 소수 자릿수. 정박값 4.8 이 한 자리라 1. */
export const METER_TICK = 1;
export const METER_DIGITS = 1;
/** 광선 위 알갱이 — 한 광선에 동시에 떠 있는 수 · 초당 광선 길이의 몇 몫을 가는지. */
export const PHOTONS_PER_RAY = 2;
export const PHOTON_SPEED = 0.8;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 조각의 배치 계산이다.
// ------------------------------------------------------------------------

/** 두 판의 소자 기둥 x. */
export const THERM_PANEL_X = -4.4;
export const LDR_PANEL_X = 3.5;

/** 레일 높이 · 가운데 접점 높이 · 소자(위) · 고정 저항(아래)의 가운데 높이와 반 길이. */
export const RAIL_TOP_Y = 1.9;
export const RAIL_BOTTOM_Y = -2.2;
export const NODE_Y = 0;
export const SENSOR_Y = 0.95;
export const FIXED_Y = -1.05;
export const RESISTOR_HALF = 0.5;

/** 출력 전압계 — 눈금판 가운데(소자 기둥에서 잰 x · 높이) · 반지름(월드). */
export const METER_DX = 3.25;
export const METER_Y = -1.0;
export const METER_R = 1.1;

/** 저항 막대 — 소자 기둥에서 막대 시작까지 띄운 거리(월드). */
export const BAR_DX = 0.85;

/** 온도계 — 소자 기둥에서 잰 x · 관 아래 · 위, 차가울 때 · 뜨거울 때 눈금 높이 · 관 반 폭 · 구 반지름. */
export const THERMO_DX = -1.25;
export const THERMO_BOTTOM_Y = 0.05;
export const THERMO_TOP_Y = 1.55;
export const THERMO_COLD_Y = 0.4;
export const THERMO_HOT_Y = 1.3;
export const THERMO_HALF = 0.09;
export const THERMO_BULB_R = 0.2;

/** 등 — 소자 기둥에서 잰 자리 · 반지름. 광선은 등 둘레에서 광저항 동그라미 둘레까지. */
export const LAMP_DX = -2.5;
export const LAMP_Y = 1.0;
export const LAMP_R = 0.26;
/** 광저항 동그라미 반지름 · 광선이 닿는 호의 위 · 아래 각(라디안, 왼쪽 = π). */
export const LDR_RING_R = 0.62;
export const RAY_ARC_FROM = Math.PI * 0.61;
export const RAY_ARC_TO = Math.PI * 1.28;

/**
 * 프레이밍은 주장의 일부다. 가로는 온도계 눈금 글자부터 오른쪽 판 전압계까지, 세로는 판 이름 위부터
 * 0 V 레일 · 캡션 줄 아래까지.
 */
export const SCENE_BOUNDS = { minX: -7.2, maxX: 8.1, minY: -3.4, maxY: 2.95 } as const;

// ------------------------------------------------------------------------
// 시간표 — 조각 시계(초)
// ------------------------------------------------------------------------

/** 한 표본에 멈춰 읽는 동안 · 데우거나 빛을 늘리는 동안 · 식히거나 빛을 줄이는 동안. */
export const HOLD = 2.2;
export const RISE = 2.6;
export const FALL = 1.8;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const thermistorAndLdrMessages = Object.freeze({
  'label.title': {
    ko: '써미스터와 광저항',
    en: 'Thermistor and LDR',
    ja: 'サーミスタと LDR',
    zh: '热敏电阻与光敏电阻',
    ar: 'الثرمستور والمقاومة الضوئية',
    es: 'Termistor y LDR',
    fr: 'Thermistance et LDR',
    hi: 'थर्मिस्टर और LDR',
    id: 'Termistor dan LDR',
    pt: 'Termistor e LDR',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '온도와 빛에 따라 변하는 저항',
    en: 'Resistance that changes with temperature and light',
    ja: '温度と光で変わる抵抗',
    zh: '随温度和光照变化的电阻',
    ar: 'مقاومة تتغير مع درجة الحرارة والضوء',
    es: 'Una resistencia que cambia con la temperatura y la luz',
    fr: 'Une résistance qui varie avec la température et la lumière',
    hi: 'ताप और प्रकाश के साथ बदलता प्रतिरोध',
    id: 'Hambatan yang berubah menurut suhu dan cahaya',
    pt: 'Resistência que muda com a temperatura e a luz',
  },
  'label.stage': {
    ko: '분압기 두 벌',
    en: 'Two potential dividers',
    ja: '二つの分圧回路',
    zh: '两组分压电路',
    ar: 'مقسِّما جهد',
    es: 'Dos divisores de voltaje',
    fr: 'Deux diviseurs de tension',
    hi: 'दो विभव विभाजक',
    id: 'Dua pembagi tegangan',
    pt: 'Dois divisores de tensão',
  },
  'label.view': {
    ko: '감지 회로',
    en: 'Sensing circuits',
    ja: 'センサー回路',
    zh: '传感电路',
    ar: 'دوائر الاستشعار',
    es: 'Circuitos sensores',
    fr: 'Circuits de détection',
    hi: 'संवेदन परिपथ',
    id: 'Rangkaian sensor',
    pt: 'Circuitos sensores',
  },
  'label.thermistor': {
    ko: '써미스터',
    en: 'Thermistor',
    ja: 'サーミスタ',
    zh: '热敏电阻',
    ar: 'الثرمستور',
    es: 'Termistor',
    fr: 'Thermistance',
    hi: 'थर्मिस्टर',
    id: 'Termistor',
    pt: 'Termistor',
  },
  'label.ldr': {
    ko: '광저항 (LDR)',
    en: 'Light-dependent resistor (LDR)',
    ja: '光依存性抵抗 (LDR)',
    zh: '光敏电阻 (LDR)',
    ar: 'المقاومة المعتمدة على الضوء (LDR)',
    es: 'Resistencia dependiente de la luz (LDR)',
    fr: 'Photorésistance (LDR)',
    hi: 'प्रकाश-आश्रित प्रतिरोध (LDR)',
    id: 'Hambatan peka cahaya (LDR)',
    pt: 'Resistor dependente de luz (LDR)',
  },
  'label.resistance': {
    ko: '저항',
    en: 'resistance',
    ja: '抵抗',
    zh: '电阻',
    ar: 'المقاومة',
    es: 'resistencia',
    fr: 'résistance',
    hi: 'प्रतिरोध',
    id: 'hambatan',
    pt: 'resistência',
  },
  'label.output': {
    ko: '출력 전압',
    en: 'output',
    ja: '出力',
    zh: '输出',
    ar: 'الخرج',
    es: 'salida',
    fr: 'sortie',
    hi: 'निर्गत',
    id: 'keluaran',
    pt: 'saída',
  },
  'label.volt': {
    ko: '{v} V',
    en: '{v} V',
    ja: '{v} V',
    zh: '{v} V',
    ar: '{v} V',
    es: '{v} V',
    fr: '{v} V',
    hi: '{v} V',
    id: '{v} V',
    pt: '{v} V',
  },
  'label.kohm': {
    ko: '{r} kΩ',
    en: '{r} kΩ',
    ja: '{r} kΩ',
    zh: '{r} kΩ',
    ar: '{r} kΩ',
    es: '{r} kΩ',
    fr: '{r} kΩ',
    hi: '{r} kΩ',
    id: '{r} kΩ',
    pt: '{r} kΩ',
  },
  'label.temp': {
    ko: '{t} °C',
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
  /** 단위 표식. 번역하지 않는다 (C1 판정 3). */
  'label.unit': {
    ko: 'V',
    en: 'V',
    ja: 'V',
    zh: 'V',
    ar: 'V',
    es: 'V',
    fr: 'V',
    hi: 'V',
    id: 'V',
    pt: 'V',
  },
  'caption.thermCold': {
    ko: '차가운 써미스터 — 저항 막대가 길고, 출력 전압 바늘은 낮은 자리에 있다',
    en: 'A cold thermistor — its resistance bar is long and the output needle sits low',
    ja: '冷たいサーミスタ — 抵抗の棒は長く、出力の針は低い位置にある',
    zh: '冷的热敏电阻 — 电阻条很长，输出指针停在低处',
    ar: 'ثرمستور بارد — شريط مقاومته طويل، وإبرة الخرج في موضع منخفض',
    es: 'Un termistor frío — su barra de resistencia es larga y la aguja de salida está abajo',
    fr: 'Une thermistance froide — sa barre de résistance est longue et l’aiguille de sortie reste basse',
    hi: 'ठंडा थर्मिस्टर — इसकी प्रतिरोध पट्टी लंबी है और निर्गत की सुई नीचे है',
    id: 'Termistor dingin — batang hambatannya panjang dan jarum keluaran berada di bawah',
    pt: 'Um termistor frio — sua barra de resistência é longa e o ponteiro de saída fica baixo',
  },
  'caption.heat': {
    ko: '써미스터를 데운다 — 수은이 오르는 동안 저항 막대가 줄고 바늘이 오른다',
    en: 'Heating the thermistor — as the mercury rises its resistance bar shrinks and the needle climbs',
    ja: 'サーミスタを温める — 水銀が上がる間、抵抗の棒が縮み、針が上がる',
    zh: '加热热敏电阻 — 水银上升时，电阻条缩短，指针上升',
    ar: 'تسخين الثرمستور — بينما يرتفع الزئبق يقصر شريط مقاومته وتصعد الإبرة',
    es: 'Calentando el termistor — mientras sube el mercurio, su barra de resistencia se acorta y la aguja sube',
    fr: 'On chauffe la thermistance — pendant que le mercure monte, sa barre de résistance raccourcit et l’aiguille grimpe',
    hi: 'थर्मिस्टर को गर्म करना — पारा चढ़ते समय इसकी प्रतिरोध पट्टी छोटी होती है और सुई ऊपर चढ़ती है',
    id: 'Memanaskan termistor — saat raksa naik, batang hambatannya memendek dan jarum naik',
    pt: 'Aquecendo o termistor — enquanto o mercúrio sobe, sua barra de resistência encolhe e o ponteiro sobe',
  },
  'caption.thermHot': {
    ko: '뜨거운 써미스터 — 저항 막대가 짧아졌고, 바늘은 높은 자리에 섰다',
    en: 'A hot thermistor — its resistance bar is short and the needle stands high',
    ja: '熱いサーミスタ — 抵抗の棒は短くなり、針は高い位置に止まった',
    zh: '热的热敏电阻 — 电阻条变短，指针停在高处',
    ar: 'ثرمستور ساخن — شريط مقاومته قصير، والإبرة في موضع مرتفع',
    es: 'Un termistor caliente — su barra de resistencia es corta y la aguja está arriba',
    fr: 'Une thermistance chaude — sa barre de résistance est courte et l’aiguille se tient haut',
    hi: 'गर्म थर्मिस्टर — इसकी प्रतिरोध पट्टी छोटी है और सुई ऊपर टिकी है',
    id: 'Termistor panas — batang hambatannya pendek dan jarum berada di atas',
    pt: 'Um termistor quente — sua barra de resistência é curta e o ponteiro fica alto',
  },
  'caption.cool': {
    ko: '써미스터를 식힌다 — 저항 막대가 다시 길어지고 바늘이 내려간다',
    en: 'Cooling the thermistor — its resistance bar grows back and the needle drops',
    ja: 'サーミスタを冷やす — 抵抗の棒がふたたび伸び、針が下がる',
    zh: '冷却热敏电阻 — 电阻条重新变长，指针下降',
    ar: 'تبريد الثرمستور — يطول شريط مقاومته من جديد وتهبط الإبرة',
    es: 'Enfriando el termistor — su barra de resistencia vuelve a crecer y la aguja baja',
    fr: 'On refroidit la thermistance — sa barre de résistance s’allonge de nouveau et l’aiguille redescend',
    hi: 'थर्मिस्टर को ठंडा करना — इसकी प्रतिरोध पट्टी फिर लंबी होती है और सुई नीचे आती है',
    id: 'Mendinginkan termistor — batang hambatannya memanjang kembali dan jarum turun',
    pt: 'Resfriando o termistor — sua barra de resistência volta a crescer e o ponteiro desce',
  },
  'caption.ldrDark': {
    ko: '광저항에 닿는 광선이 적다 — 저항 막대가 길고, 바늘은 낮은 자리에 있다',
    en: 'Little light reaches the LDR — its resistance bar is long and the needle sits low',
    ja: 'LDR に届く光が少ない — 抵抗の棒は長く、針は低い位置にある',
    zh: '到达光敏电阻的光很少 — 电阻条很长，指针停在低处',
    ar: 'قليل من الضوء يصل إلى المقاومة الضوئية — شريط مقاومتها طويل، والإبرة في موضع منخفض',
    es: 'Llega poca luz a la LDR — su barra de resistencia es larga y la aguja está abajo',
    fr: 'Peu de lumière atteint la LDR — sa barre de résistance est longue et l’aiguille reste basse',
    hi: 'LDR तक कम प्रकाश पहुँचता है — इसकी प्रतिरोध पट्टी लंबी है और सुई नीचे है',
    id: 'Sedikit cahaya mencapai LDR — batang hambatannya panjang dan jarum berada di bawah',
    pt: 'Pouca luz chega ao LDR — sua barra de resistência é longa e o ponteiro fica baixo',
  },
  'caption.brighten': {
    ko: '빛을 늘린다 — 닿는 광선이 많아지는 동안 광저항의 저항 막대가 줄고 바늘이 오른다',
    en: 'Turning up the light — as more rays reach the LDR its resistance bar shrinks and the needle climbs',
    ja: '光を強める — LDR に届く光線が増える間、抵抗の棒が縮み、針が上がる',
    zh: '增强光照 — 到达光敏电阻的光线增多时，电阻条缩短，指针上升',
    ar: 'زيادة الضوء — بينما تصل أشعة أكثر إلى المقاومة الضوئية يقصر شريط مقاومتها وتصعد الإبرة',
    es: 'Subiendo la luz — mientras llegan más rayos a la LDR, su barra de resistencia se acorta y la aguja sube',
    fr: 'On augmente la lumière — à mesure que plus de rayons atteignent la LDR, sa barre de résistance raccourcit et l’aiguille grimpe',
    hi: 'प्रकाश बढ़ाना — जैसे-जैसे LDR तक अधिक किरणें पहुँचती हैं, इसकी प्रतिरोध पट्टी छोटी होती है और सुई ऊपर चढ़ती है',
    id: 'Menambah cahaya — saat makin banyak sinar mencapai LDR, batang hambatannya memendek dan jarum naik',
    pt: 'Aumentando a luz — enquanto mais raios chegam ao LDR, sua barra de resistência encolhe e o ponteiro sobe',
  },
  'caption.ldrBright': {
    ko: '광선이 많이 닿는 광저항 — 저항 막대가 짧아졌고, 바늘은 높은 자리에 섰다',
    en: 'Plenty of light on the LDR — its resistance bar is short and the needle stands high',
    ja: 'LDR に光がたっぷり当たる — 抵抗の棒は短くなり、針は高い位置に止まった',
    zh: '光敏电阻受到充足的光照 — 电阻条变短，指针停在高处',
    ar: 'ضوء وفير على المقاومة الضوئية — شريط مقاومتها قصير، والإبرة في موضع مرتفع',
    es: 'Mucha luz sobre la LDR — su barra de resistencia es corta y la aguja está arriba',
    fr: 'Beaucoup de lumière sur la LDR — sa barre de résistance est courte et l’aiguille se tient haut',
    hi: 'LDR पर भरपूर प्रकाश — इसकी प्रतिरोध पट्टी छोटी है और सुई ऊपर टिकी है',
    id: 'Banyak cahaya pada LDR — batang hambatannya pendek dan jarum berada di atas',
    pt: 'Bastante luz no LDR — sua barra de resistência é curta e o ponteiro fica alto',
  },
  'caption.dim': {
    ko: '빛을 줄인다 — 저항 막대가 다시 길어지고 바늘이 내려간다',
    en: 'Dimming the light — the resistance bar grows back and the needle drops',
    ja: '光を弱める — 抵抗の棒がふたたび伸び、針が下がる',
    zh: '减弱光照 — 电阻条重新变长，指针下降',
    ar: 'خفض الضوء — يطول شريط المقاومة من جديد وتهبط الإبرة',
    es: 'Bajando la luz — la barra de resistencia vuelve a crecer y la aguja baja',
    fr: 'On baisse la lumière — la barre de résistance s’allonge de nouveau et l’aiguille redescend',
    hi: 'प्रकाश घटाना — प्रतिरोध पट्टी फिर लंबी होती है और सुई नीचे आती है',
    id: 'Meredupkan cahaya — batang hambatan memanjang kembali dan jarum turun',
    pt: 'Diminuindo a luz — a barra de resistência volta a crescer e o ponteiro desce',
  },
} satisfies Record<string, LocalizedText>);

export type ThermistorAndLdrMessageKey = keyof typeof thermistorAndLdrMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: ThermistorAndLdrMessageKey): LocalizedText => thermistorAndLdrMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ThermistorAndLdrMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const thermistorAndLdrSchema: BundleSchema = {
  id: THERMISTOR_AND_LDR_ID,
  label: text('label.title'),
  category: 'em',
  description: text('label.description'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 써미스터를 데웠다 식히고, 이어 광저항에 빛을 쬐었다 거둔다.
  parameters: [],

  stages: [
    {
      id: 'two-dividers',
      label: text('label.stage'),
      constants: {
        volts: VOLTS,
        rFixed: R_FIXED,
        tempCold: TEMP_COLD,
        tempHot: TEMP_HOT,
        thermRCold: THERM_R_COLD,
        thermRHot: THERM_R_HOT,
        raysDark: RAYS_DARK,
        raysBright: RAYS_BRIGHT,
        ldrRDark: LDR_R_DARK,
        ldrRBright: LDR_R_BRIGHT,
        outCold: OUT_COLD,
        outHot: OUT_HOT,
        outDark: OUT_DARK,
        outBright: OUT_BRIGHT,
        barPerKohm: BAR_PER_KOHM,
        meterTick: METER_TICK,
        meterDigits: METER_DIGITS,
        photonsPerRay: PHOTONS_PER_RAY,
        photonSpeed: PHOTON_SPEED,
      },
    },
  ],

  environments: [],

  views: [{ id: 'circuits', label: text('label.view'), default: true }],

  /** 판 둘과 캡션 한 줄. 세로를 더 주면 가로가 먼저 차서 그림만 작아진다 (S-piece). */
  canvas: { height: 360, minHeight: 320 },

  /** 막대 · 도선 위에 이름표, 광선 위에 알갱이. 겹침을 scene 순서로 정한다. */
  drawOrder: 'scene',

  /**
   * 한 주기 = 써미스터: 차가움 → 데움 → 뜨거움 → 식힘, 광저항: 어두움 → 빛 늘림 → 밝음 → 빛 줄임.
   * 온도 · 밝기의 몫은 physics 가 오름 · 내림 단계의 진행도(`at`)를 빼서 얻는다 — 단계 경계를 코드로 가르지 않는다.
   */
  timeline: {
    phases: [
      { id: 'therm-cold', duration: HOLD, caption: key('caption.thermCold') },
      { id: 'heat', duration: RISE, ease: 'smooth', caption: key('caption.heat') },
      { id: 'therm-hot', duration: HOLD, caption: key('caption.thermHot') },
      { id: 'cool', duration: FALL, ease: 'smooth', caption: key('caption.cool') },
      { id: 'ldr-dark', duration: HOLD, caption: key('caption.ldrDark') },
      { id: 'brighten', duration: RISE, ease: 'smooth', caption: key('caption.brighten') },
      { id: 'ldr-bright', duration: HOLD, caption: key('caption.ldrBright') },
      { id: 'dim', duration: FALL, ease: 'smooth', caption: key('caption.dim') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — 써미스터를 데우는 중이다. */
  startAt: 3.2,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 식 · 정의는 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /** 그리드 · 카메라 단추 없음(기본값). 잴 것은 거리가 아니라 막대 길이와 바늘 자리다. */

  messages: thermistorAndLdrMessages,
};
