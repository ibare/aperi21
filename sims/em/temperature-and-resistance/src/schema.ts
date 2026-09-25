// ========================================================================
// temperature-and-resistance — 선언
// ========================================================================
// 질문: 도선을 데우면 저항은 커지는가, 작아지는가.
//
// 답은 재료에 따라 반대다. 한 전지의 두 레일에 금속 막대와 반도체 막대를 나란히 걸고
// 둘을 같은 온도로 함께 데운다.
//
// - 금속 — 격자 원자가 더 크게 떨려 전자가 더 자주 부딪힌다. 나르는 전자의 수는 그대로이고
//   흐름만 느려진다 → 저항이 오른다.
// - 반도체 — 격자도 똑같이 떨리지만, 열이 원자에 묶인 전자를 풀어 새 나르개(e⁻ · h⁺ 쌍)가
//   생긴다. 나르개 수가 는다 → 저항이 내린다.
//
// 오른쪽 흐름 막대가 두 막대의 전류를 차가울 때(점선)에 견주어 보인다 — 금속은 줄고
// 반도체는 는다.
//
// 길이 · 단면적에 따른 저항은 resistance-and-geometry 의 몫, 전압에 따른 전류는 ohms-law 의
// 몫이라 여기서는 형태 · 전압을 고정하고 온도만 바꾼다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:temperature-and-resistance` 와 문자 그대로 일치한다 (C4). */
export const TEMPERATURE_AND_RESISTANCE_ID = 'temperature-and-resistance';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 두 막대에 함께 걸린 전압(V). 전지 이름표 · 캡션에 그대로 쓴다. */
export const VOLTAGE = 3;
/** 차가울 때 · 데운 뒤 온도(°C). 온도계 눈금 이름표 · 캡션에 그대로 쓴다. */
export const TEMP_COLD = 20;
export const TEMP_HOT = 220;
/**
 * 금속의 저항 온도 계수(1/°C). 구리 값. R(T) = R₀(1 + α(T − T₀)) 로 금속 전류의 줄어듦을 얻는다.
 * 화면에 띄우지 않는다 — 흐름 막대의 길이로만 드러난다.
 */
export const METAL_TEMP_COEFF = 0.0039;
/**
 * 반도체의 나르개 쌍(e⁻ · h⁺) 수 — 차가울 때 · 데운 뒤. 사이의 온도에서는 두 값을 온도에 대해
 * 기하 보간한다(나르개 수는 온도에 지수로 는다). 실제 농도비는 이보다 훨씬 크다 — NOTES (b).
 */
export const PAIRS_COLD = 3;
export const PAIRS_HOT = 12;

// ------------------------------------------------------------------------
// 표시 배율 · 흩뿌림 — 이것도 선언이다 (원칙 2). 스테이지 상수로 둔다.
// ------------------------------------------------------------------------

/** 차가울 때 금속 전자의 흐름 빠르기(월드/초). 데우면 1/(1 + αΔT) 배가 된다. */
export const METAL_SPEED = 0.9;
/** 반도체 나르개의 흐름 빠르기(월드/초). 온도에 따라 바꾸지 않는다 — NOTES (b). */
export const SEMI_SPEED = 0.9;
/** 금속 전자 간격(월드) — 레인 안 앞뒤 간격. 막대 길이가 이것으로 나눠 떨어지게 잡는다. */
export const CARRIER_SPACING = 0.3;
/** 격자 원자 가로 간격(월드). */
export const ATOM_PITCH = 0.375;
/**
 * 격자 원자의 떨림 폭(월드) — 차가울 때 · 데운 뒤. 실제 떨림은 원자 간격의 몇 % 라 보이지
 * 않는다 — 과장한 표시값이다. 사이 온도에서는 선형 보간.
 */
export const VIB_AMP_COLD = 0.012;
export const VIB_AMP_HOT = 0.055;
/** 떨림 진동수 범위(Hz). 원자마다 시드로 이 안에서 고른다. */
export const VIB_FREQ_MIN = 2.2;
export const VIB_FREQ_MAX = 4.2;
/** 금속 전자가 떨리는 격자에 부딪혀 위아래로 흔들리는 폭 = 격자 떨림 폭 × 이 배율. */
export const WOBBLE_RATIO = 0.9;
/** 흐름 막대의 길이(월드) — 각 막대의 **차가울 때** 전류가 이 길이다. 두 막대의 전류를 서로 견주지 않는다. */
export const METER_UNIT = 0.65;
/** 나르개 꼬리 = 빠르기 × 이 시간(초). */
export const TRAIL_SECONDS = 0.2;
/** 떨림 위상 · 쌍이 생기는 자리를 고르는 시드. */
export const SEED = 7;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 위에 전지, 왼쪽 · 오른쪽 레일, 그 사이에 막대 둘, 왼쪽 밖에 온도계,
// 오른쪽 레일 너머에 흐름 막대.
// ------------------------------------------------------------------------

/** 레일 x. 오른쪽 레일이 전지 + 극에 닿는다. */
export const RAIL_LEFT_X = -4.5;
export const RAIL_RIGHT_X = 1.2;
/** 막대 왼쪽 끝 x · 길이 · 반두께. 두 막대가 같은 모양이다 — 다른 것은 재료뿐. */
export const BAR_X0 = -3.9;
export const BAR_LENGTH = 4.5;
export const BAR_HALF = 0.4;
/** 막대 안 줄 — 격자 원자 줄 간격 · 나르개 레인이 가운데에서 떨어진 거리. 레인은 원자 줄 사이를 지난다. */
export const ATOM_ROW_GAP = 0.26;
export const LANE_OFFSET = 0.13;
/** 막대 가운데 높이 — 금속 · 반도체. */
export const ROW_METAL_Y = 1.0;
export const ROW_SEMI_Y = -0.75;
/** 전지가 놓인 위 도선 높이 · 전지 가운데 x. */
export const TOP_WIRE_Y = 2.1;
export const BATTERY_X = -1.6;
/** 전지 판 — 두 판 사이, 긴 판(+) · 짧은 판(−)의 반높이(월드). */
export const CELL_GAP = 0.16;
export const CELL_LONG_HALF = 0.24;
export const CELL_SHORT_HALF = 0.13;
/** 온도계 — x · 관 반폭 · 관 아래 · 위 끝 · 구 반지름 · 차가울 때 · 데운 뒤 눈금 높이. */
export const THERMO_X = -5.25;
export const THERMO_HALF = 0.07;
export const THERMO_BOTTOM_Y = -0.95;
export const THERMO_TOP_Y = 1.6;
export const THERMO_BULB_R = 0.15;
export const THERMO_COLD_Y = -0.55;
export const THERMO_HOT_Y = 1.3;
/** 흐름 막대 — 왼쪽 끝 x · 반높이. */
export const METER_X = 1.75;
export const METER_HALF = 0.16;
/** 방향 표식 — 막대 위 높이(막대 윗면에서), 꼬리 x, 길이. */
export const DIRECTION_RISE = 0.2;
export const DIRECTION_E_X = -1.6;
export const DIRECTION_H_X = 0.5;
export const DIRECTION_LEN = 0.7;

/**
 * 프레이밍은 주장의 일부다. 가로는 온도계 이름표부터 가장 긴 흐름 막대(반도체, 데운 뒤
 * `PAIRS_HOT / PAIRS_COLD` 배)의 끝까지, 세로는 캡션 줄부터 전지 이름표 위까지. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -6.1, maxX: 4.75, minY: -2.1, maxY: 2.6 } as const;

// ------------------------------------------------------------------------
// 시간표 — 조각 시계(초)
// ------------------------------------------------------------------------

/** 차가운 채 흐름을 견주는 동안. */
export const COLD_HOLD = 2.4;
/** 온도를 올리는 동안. 선형이다 — 금속 전자의 흐른 거리를 닫힌 식으로 적분하려면 온도가 시각에 선형이어야 한다. */
export const HEAT_SPAN = 3.2;
/** 데운 채 견주는 동안. */
export const HOT_HOLD = 3.6;
/** 다시 식히는 동안. */
export const COOL_SPAN = 1.6;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const temperatureAndResistanceMessages = Object.freeze({
  'label.title': {
    ko: '온도와 저항',
    en: 'Temperature and resistance',
    ja: '温度と抵抗',
    zh: '温度与电阻',
    ar: 'درجة الحرارة والمقاومة',
    es: 'Temperatura y resistencia',
    fr: 'Température et résistance',
    hi: 'ताप और प्रतिरोध',
    id: 'Suhu dan hambatan',
    pt: 'Temperatura e resistência',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '금속과 반도체의 반대 경향',
    en: 'Metals and semiconductors go opposite ways',
    ja: '金属と半導体は逆向きに変わる',
    zh: '金属与半导体的变化方向相反',
    ar: 'المعادن وأشباه الموصلات تسلك اتجاهين متعاكسين',
    es: 'Metales y semiconductores van en sentidos opuestos',
    fr: 'Métaux et semi-conducteurs évoluent en sens inverse',
    hi: 'धातुएँ और अर्धचालक विपरीत दिशाओं में जाते हैं',
    id: 'Logam dan semikonduktor berubah ke arah berlawanan',
    pt: 'Metais e semicondutores seguem sentidos opostos',
  },
  'label.stage': {
    ko: '금속과 반도체',
    en: 'A metal and a semiconductor',
    ja: '金属と半導体',
    zh: '金属与半导体',
    ar: 'معدن وشبه موصل',
    es: 'Un metal y un semiconductor',
    fr: 'Un métal et un semi-conducteur',
    hi: 'एक धातु और एक अर्धचालक',
    id: 'Sebuah logam dan sebuah semikonduktor',
    pt: 'Um metal e um semicondutor',
  },
  'label.view': {
    ko: '나란히 건 두 막대',
    en: 'Two bars side by side',
    ja: '二本の棒を並べて',
    zh: '并排的两根棒',
    ar: 'قضيبان جنبًا إلى جنب',
    es: 'Dos barras lado a lado',
    fr: 'Deux barreaux côte à côte',
    hi: 'साथ-साथ रखी दो छड़ें',
    id: 'Dua batang berdampingan',
    pt: 'Duas barras lado a lado',
  },
  /** 값이 끼는 이름표 — 단위 기호는 표식이지만 값이 끼므로 문안 키로 둔다 (C1). */
  'label.voltage': {
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
  'label.metal': {
    ko: '금속',
    en: 'Metal',
    ja: '金属',
    zh: '金属',
    ar: 'معدن',
    es: 'Metal',
    fr: 'Métal',
    hi: 'धातु',
    id: 'Logam',
    pt: 'Metal',
  },
  'label.semi': {
    ko: '반도체',
    en: 'Semiconductor',
    ja: '半導体',
    zh: '半导体',
    ar: 'شبه موصل',
    es: 'Semiconductor',
    fr: 'Semi-conducteur',
    hi: 'अर्धचालक',
    id: 'Semikonduktor',
    pt: 'Semicondutor',
  },
  'label.electron': {
    ko: 'e⁻',
    en: 'e⁻',
    ja: 'e⁻',
    zh: 'e⁻',
    ar: 'e⁻',
    es: 'e⁻',
    fr: 'e⁻',
    hi: 'e⁻',
    id: 'e⁻',
    pt: 'e⁻',
  },
  'label.hole': {
    ko: 'h⁺',
    en: 'h⁺',
    ja: 'h⁺',
    zh: 'h⁺',
    ar: 'h⁺',
    es: 'h⁺',
    fr: 'h⁺',
    hi: 'h⁺',
    id: 'h⁺',
    pt: 'h⁺',
  },
  'label.current': {
    ko: 'I',
    en: 'I',
    ja: 'I',
    zh: 'I',
    ar: 'I',
    es: 'I',
    fr: 'I',
    hi: 'I',
    id: 'I',
    pt: 'I',
  },
  'caption.cold': {
    ko: '두 막대에 같은 {v} V, {tc} °C — 금속에는 전자가 가득 흐르고, 반도체에는 나르개가 몇 개뿐이다',
    en: 'The same {v} V across both bars at {tc} °C — electrons crowd the metal, while only a few carriers move in the semiconductor',
    ja: '二本の棒に同じ {v} V、{tc} °C — 金属には電子がぎっしり流れ、半導体ではキャリアが数個動くだけだ',
    zh: '两根棒上加相同的 {v} V，{tc} °C — 金属中挤满了流动的电子，而半导体中只有几个载流子在移动',
    ar: 'الجهد نفسه {v} V على القضيبين عند {tc} °C — الإلكترونات تزدحم في المعدن، بينما لا يتحرك في شبه الموصل إلا عدد قليل من حاملات الشحنة',
    es: 'Los mismos {v} V en ambas barras a {tc} °C — los electrones abarrotan el metal, mientras que en el semiconductor solo se mueven unos pocos portadores',
    fr: 'La même tension de {v} V aux bornes des deux barreaux à {tc} °C — les électrons se pressent dans le métal, tandis que seuls quelques porteurs se déplacent dans le semi-conducteur',
    hi: '{tc} °C पर दोनों छड़ों पर वही {v} V — धातु में इलेक्ट्रॉन ठसाठस बहते हैं, जबकि अर्धचालक में केवल कुछ आवेश वाहक चलते हैं',
    id: '{v} V yang sama pada kedua batang pada {tc} °C — elektron memadati logam, sedangkan di semikonduktor hanya sedikit pembawa muatan yang bergerak',
    pt: 'Os mesmos {v} V nas duas barras a {tc} °C — os elétrons lotam o metal, enquanto só alguns portadores se movem no semicondutor',
  },
  'caption.heat': {
    ko: '두 막대를 {tc} °C 에서 {th} °C 로 함께 데운다',
    en: 'Both bars are heated together from {tc} °C to {th} °C',
    ja: '二本の棒を {tc} °C から {th} °C までいっしょに温める',
    zh: '两根棒一起从 {tc} °C 加热到 {th} °C',
    ar: 'يُسخَّن القضيبان معًا من {tc} °C إلى {th} °C',
    es: 'Las dos barras se calientan juntas de {tc} °C a {th} °C',
    fr: 'Les deux barreaux sont chauffés ensemble de {tc} °C à {th} °C',
    hi: 'दोनों छड़ों को साथ-साथ {tc} °C से {th} °C तक गर्म किया जाता है',
    id: 'Kedua batang dipanaskan bersama dari {tc} °C ke {th} °C',
    pt: 'As duas barras são aquecidas juntas de {tc} °C a {th} °C',
  },
  'caption.hot': {
    ko: '금속 — 전자 수는 그대로인데 크게 떨리는 원자에 부딪혀 흐름이 줄었다(저항 증가). 반도체 — 열이 풀어 준 전자 · 양공으로 흐름이 늘었다(저항 감소). 점선은 {tc} °C 의 흐름',
    en: 'Metal — the same electrons bump into harder-shaking atoms, so less flows (resistance up). Semiconductor — heat freed new electrons and holes, so more flows (resistance down). Dashed: the flow at {tc} °C',
    ja: '金属 — 電子の数は同じだが、激しく振動する原子にぶつかって流れが減った(抵抗が増える)。半導体 — 熱が新しい電子と正孔を解き放ち、流れが増えた(抵抗が減る)。点線は {tc} °C での流れ',
    zh: '金属 — 电子数不变，却撞上振动更剧烈的原子，流动变少(电阻增大)。半导体 — 热释放出新的电子和空穴，流动变多(电阻减小)。虚线为 {tc} °C 时的流动',
    ar: 'المعدن — الإلكترونات نفسها تصطدم بذرات تهتز بشدة أكبر، فيقل السريان (تزداد المقاومة). شبه الموصل — حرّرت الحرارة إلكترونات وثقوبًا جديدة، فيزداد السريان (تقل المقاومة). الخط المتقطع: السريان عند {tc} °C',
    es: 'Metal — los mismos electrones chocan con átomos que vibran más fuerte, así que fluye menos (la resistencia sube). Semiconductor — el calor liberó nuevos electrones y huecos, así que fluye más (la resistencia baja). Línea discontinua: el flujo a {tc} °C',
    fr: 'Métal — les mêmes électrons heurtent des atomes qui vibrent plus fort, donc il passe moins de courant (résistance en hausse). Semi-conducteur — la chaleur a libéré de nouveaux électrons et trous, donc il en passe plus (résistance en baisse). En pointillés : le courant à {tc} °C',
    hi: 'धातु — वही इलेक्ट्रॉन अधिक ज़ोर से कंपन करते परमाणुओं से टकराते हैं, इसलिए प्रवाह घटता है (प्रतिरोध बढ़ता है)। अर्धचालक — ऊष्मा ने नए इलेक्ट्रॉन और कोटर मुक्त किए, इसलिए प्रवाह बढ़ता है (प्रतिरोध घटता है)। बिंदुदार रेखा: {tc} °C पर प्रवाह',
    id: 'Logam — elektron yang sama menabrak atom yang bergetar lebih kuat, sehingga aliran berkurang (hambatan naik). Semikonduktor — kalor membebaskan elektron dan lubang baru, sehingga aliran bertambah (hambatan turun). Garis putus-putus: aliran pada {tc} °C',
    pt: 'Metal — os mesmos elétrons esbarram em átomos que vibram mais forte, então flui menos (a resistência sobe). Semicondutor — o calor liberou novos elétrons e lacunas, então flui mais (a resistência desce). Tracejado: o fluxo a {tc} °C',
  },
  'caption.cool': {
    ko: '두 막대를 다시 {tc} °C 로 식힌다',
    en: 'Both bars are cooled back to {tc} °C',
    ja: '二本の棒をふたたび {tc} °C まで冷やす',
    zh: '两根棒重新冷却到 {tc} °C',
    ar: 'يُبرَّد القضيبان من جديد إلى {tc} °C',
    es: 'Las dos barras se enfrían de nuevo a {tc} °C',
    fr: 'Les deux barreaux sont refroidis de nouveau à {tc} °C',
    hi: 'दोनों छड़ों को फिर से {tc} °C तक ठंडा किया जाता है',
    id: 'Kedua batang didinginkan kembali ke {tc} °C',
    pt: 'As duas barras são resfriadas de volta a {tc} °C',
  },
} satisfies Record<string, LocalizedText>);

export type TemperatureAndResistanceMessageKey = keyof typeof temperatureAndResistanceMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: TemperatureAndResistanceMessageKey): LocalizedText =>
  temperatureAndResistanceMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: TemperatureAndResistanceMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const temperatureAndResistanceSchema: BundleSchema = {
  id: TEMPERATURE_AND_RESISTANCE_ID,
  label: text('label.title'),
  category: 'em',
  description: text('label.description'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 흐르고, 데워지고, 흐름 막대가 줄고 는다.
  parameters: [],

  stages: [
    {
      id: 'metal-and-semiconductor',
      label: text('label.stage'),
      constants: {
        voltage: VOLTAGE,
        tempCold: TEMP_COLD,
        tempHot: TEMP_HOT,
        metalTempCoeff: METAL_TEMP_COEFF,
        pairsCold: PAIRS_COLD,
        pairsHot: PAIRS_HOT,
        metalSpeed: METAL_SPEED,
        semiSpeed: SEMI_SPEED,
        carrierSpacing: CARRIER_SPACING,
        atomPitch: ATOM_PITCH,
        vibAmpCold: VIB_AMP_COLD,
        vibAmpHot: VIB_AMP_HOT,
        vibFreqMin: VIB_FREQ_MIN,
        vibFreqMax: VIB_FREQ_MAX,
        wobbleRatio: WOBBLE_RATIO,
        meterUnit: METER_UNIT,
        trailSeconds: TRAIL_SECONDS,
        seed: SEED,
      },
    },
  ],

  environments: [],

  views: [{ id: 'main', label: text('label.view'), default: true }],

  /** 막대 둘과 흐름 막대, 캡션 두 줄. 세로를 더 주면 가로가 먼저 차서 그림만 작아진다 (S-piece). */
  canvas: { height: 360, minHeight: 320 },

  /** 겹침이 판정 장치다 — 나르개는 막대 · 격자 원자 **위**를 흘러야 한다. */
  drawOrder: 'scene',

  /**
   * 한 주기 = 차가움 → 데움 → 뜨거움 → 식힘.
   *
   * 온도는 `heat` 진행도 − `cool` 진행도로 읽는다. 두 단계는 선형이어야 한다 — 금속 전자가
   * 흐른 거리를 닫힌 식(로그)으로 적분한다(physics `metalTravel`).
   */
  timeline: {
    phases: [
      { id: 'cold', duration: COLD_HOLD, caption: key('caption.cold') },
      { id: 'heat', duration: HEAT_SPAN, ease: 'linear', caption: key('caption.heat') },
      { id: 'hot', duration: HOT_HOLD, caption: key('caption.hot') },
      { id: 'cool', duration: COOL_SPAN, ease: 'linear', caption: key('caption.cool') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — 나르개는 모든 시각에 막대를 채우고 흐른다. */
  startAt: 0.4,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 정의와 공식은 문단의 몫이다.
  // 끼우는 값은 스테이지 상수를 state 가 글자로 옮긴 것이다(장부 G133).
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 720,
    style: { colorRole: 'muted', emphasis: 'strong' },
    vars: { v: 'voltage', tc: 'tempCold', th: 'tempHot' },
  },

  /** 그리드 · 카메라 단추 없음(기본값). 잴 것은 거리가 아니라 흐름 막대의 길이 변화다. */

  messages: temperatureAndResistanceMessages,
};
