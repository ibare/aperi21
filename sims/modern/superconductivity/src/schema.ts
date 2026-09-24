// ========================================================================
// superconductivity — 선언
// ========================================================================
// 질문: 금속을 식히면 저항이 줄어든다. 끝까지 식히면 저항은 0 이 되는가?
//
// 보통 금속(구리)은 아니다 — 매끄럽게 줄다가 바닥(잔류 저항)에 남는다. 초전도체
// (수은)는 임계 온도 Tc 에서 저항이 **수직으로** 떨어져 0 이 된다. 두 금속을 한
// 판 위에서 함께 식혀, 한쪽 곡선만 뚝 끊겨 바닥으로 떨어지는 것을 보인다.
//
// 자기장을 밀어내는 것(마이스너 효과)은 이웃 조각 `meissner-effect` 의 몫이다.
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:superconductivity` 와 문자 그대로 일치한다 (C4). */
export const SUPERCONDUCTIVITY_ID = 'superconductivity';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 식히기 시작하는 온도(K). 판의 오른쪽 끝이다. */
export const T_MAX = 8;
/** 수은의 임계 온도(K). 카메를링 오너스가 1911 년에 본 값이다. */
export const T_C = 4.2;
/** 식히기를 멈추는 온도(K). 구리의 곡선이 바닥에 닿아 평평해진 것이 보일 만큼 내려간다. */
export const T_END = 0.5;
/**
 * 온도에 따라 줄어드는 몫의 거듭제곱 — R(T) = 잔류 + (처음 − 잔류)·(T/T_max)^n.
 * 낮은 온도에서 격자 진동이 얼어붙으며 저항이 T 의 거듭제곱으로 줄어드는 꼴을 근사한다.
 */
export const EXPONENT = 3;
/** 구리의 처음(T_max) 저항 · 잔류 저항. 판 높이에 대한 비율(상대 단위). */
export const COPPER_TOP = 1;
export const COPPER_RESIDUAL = 0.45;
/**
 * 수은의 처음 저항 · 정상 상태였다면 남았을 잔류 저항(상대 단위). 구리보다 낮게 두어
 * 두 곡선이 겹치지 않는다 — 시료마다 굵기 · 길이가 달라 절대 크기는 비교 대상이 아니다.
 */
export const MERCURY_TOP = 0.8;
export const MERCURY_RESIDUAL = 0.3;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 가로 = 온도, 세로 = 저항.
// ------------------------------------------------------------------------

/** 온도 1 K 의 가로 길이(월드). */
export const X_PER_K = 1.25;
/** 저항 1(상대 단위)의 세로 길이(월드). */
export const Y_PER_R = 4;
/** 가로축이 T_max 너머로 더 나가는 길이(월드). 축 이름이 곡선 끝과 붙지 않게. */
export const AXIS_OVERHANG = 0.5;
/** 세로축의 높이(월드). 가장 높은 저항(1) 위로 조금 더. */
export const AXIS_TOP = 4.3;

/**
 * 프레이밍은 주장의 일부다. 가로는 세로축 이름표(왼쪽)부터 곡선 이름표(오른쪽)까지,
 * 세로는 눈금 이름표와 캡션 한 줄(아래)부터 세로축 이름(위)까지. 캡션 슬롯은
 * 프레이밍 여백으로 잡히지 않아 아래 자리를 미리 잡는다 (장부 G24). 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -1.3, maxX: 12.6, minY: -1.15, maxY: 4.6 } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이. 경계는 선언이 정하고 physics 는 `at()` 으로 묻는다.
// ------------------------------------------------------------------------

/** T_max → T_c 로 식히는 동안(초). */
export const COOL_NORMAL = 3.2;
/** 온도가 T_c 에 머문 채 수은의 저항이 떨어지는 동안(초). 한순간을 눈으로 보게 늘인다. */
export const DROP = 1.0;
/** T_c → T_end 로 더 식히는 동안(초). */
export const COOL_BELOW = 2.8;
/** 다 식힌 그림을 읽는 동안 · 다음 주기로 넘어가며 흐려지는 동안(초). */
export const HOLD = 3.2;
export const FADE = 0.6;
/** 도착한 순간 두 곡선이 이미 자라고 있도록 시계를 앞당기는 양(초). */
export const START_AT = 1.0;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const superconductivityMessages = Object.freeze({
  'label.title': {
    ko: '초전도',
    en: 'Superconductivity',
    ja: '超伝導',
    zh: '超导',
    ar: 'الموصلية الفائقة',
    es: 'Superconductividad',
    fr: 'Supraconductivité',
    hi: 'अतिचालकता',
    id: 'Superkonduktivitas',
    pt: 'Supercondutividade',
  },
  'label.operation': {
    ko: '저항이 사라지는 상태',
    en: 'The state in which resistance vanishes',
    ja: '抵抗が消える状態',
    zh: '电阻消失的状态',
    ar: 'الحالة التي تختفي فيها المقاومة',
    es: 'El estado en que la resistencia desaparece',
    fr: 'L’état dans lequel la résistance s’annule',
    hi: 'वह अवस्था जिसमें प्रतिरोध लुप्त हो जाता है',
    id: 'Keadaan saat hambatan lenyap',
    pt: 'O estado em que a resistência desaparece',
  },
  'label.stage': {
    ko: '구리와 수은',
    en: 'Copper and mercury',
    ja: '銅と水銀',
    zh: '铜与汞',
    ar: 'النحاس والزئبق',
    es: 'Cobre y mercurio',
    fr: 'Cuivre et mercure',
    hi: 'ताँबा और पारा',
    id: 'Tembaga dan raksa',
    pt: 'Cobre e mercúrio',
  },
  'label.view': {
    ko: '저항-온도 판',
    en: 'Resistance vs temperature',
    ja: '抵抗–温度グラフ',
    zh: '电阻–温度图',
    ar: 'المقاومة مقابل درجة الحرارة',
    es: 'Resistencia frente a temperatura',
    fr: 'Résistance en fonction de la température',
    hi: 'प्रतिरोध बनाम ताप',
    id: 'Hambatan terhadap suhu',
    pt: 'Resistência versus temperatura',
  },
  /** 곡선 이름 — 원소 이름은 문안이다 (C1). */
  'label.copper': {
    ko: '구리',
    en: 'Copper',
    ja: '銅',
    zh: '铜',
    ar: 'النحاس',
    es: 'Cobre',
    fr: 'Cuivre',
    hi: 'ताँबा',
    id: 'Tembaga',
    pt: 'Cobre',
  },
  'label.mercury': {
    ko: '수은',
    en: 'Mercury',
    ja: '水銀',
    zh: '水银',
    ar: 'الزئبق',
    es: 'Mercurio',
    fr: 'Mercure',
    hi: 'पारा',
    id: 'Raksa',
    pt: 'Mercúrio',
  },
  /** 축 이름. 기호 R · T 는 표식이지만 낱말이 붙어 문안이다. */
  'label.axisR': {
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
  'label.axisT': {
    ko: '온도 T',
    en: 'Temperature T',
    ja: '温度 T',
    zh: '温度 T',
    ar: 'درجة الحرارة T',
    es: 'Temperatura T',
    fr: 'Température T',
    hi: 'ताप T',
    id: 'Suhu T',
    pt: 'Temperatura T',
  },
  /** 온도 눈금. 값은 스테이지 상수를 그대로 끼운다 (S-piece 유효숫자). */
  'label.tick': {
    ko: '{v} K',
    en: '{v} K',
    ja: '{v} K',
    zh: '{v} K',
    ar: '{v} K',
    es: '{v} K',
    fr: '{v} K',
    hi: '{v} K',
    id: '{v} K',
    pt: '{v} K',
  },
  /** 임계 온도 표지. `Tc` 는 기호라 표식이지만 값이 끼는 조립문이라 문안 키로 둔다. */
  'label.tc': {
    ko: 'Tc = {v} K',
    en: 'Tc = {v} K',
    ja: 'Tc = {v} K',
    zh: 'Tc = {v} K',
    ar: 'Tc = {v} K',
    es: 'Tc = {v} K',
    fr: 'Tc = {v} K',
    hi: 'Tc = {v} K',
    id: 'Tc = {v} K',
    pt: 'Tc = {v} K',
  },
  /** 저항축의 0. 수는 표식이다 (C1 판정 3). */
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
  /** 다 식힌 뒤 두 곡선의 바닥에 붙는 이름. */
  'label.residual': {
    ko: '잔류 저항',
    en: 'residual resistance',
    ja: '残留抵抗',
    zh: '剩余电阻',
    ar: 'مقاومة متبقية',
    es: 'resistencia residual',
    fr: 'résistance résiduelle',
    hi: 'अवशिष्ट प्रतिरोध',
    id: 'hambatan sisa',
    pt: 'resistência residual',
  },
  'label.vanished': {
    ko: '저항 0',
    en: 'zero resistance',
    ja: '抵抗ゼロ',
    zh: '零电阻',
    ar: 'مقاومة صفرية',
    es: 'resistencia nula',
    fr: 'résistance nulle',
    hi: 'शून्य प्रतिरोध',
    id: 'hambatan nol',
    pt: 'resistência nula',
  },
  'caption.coolNormal': {
    ko: '두 금속을 함께 식힌다 — 둘 다 저항이 매끄럽게 줄어든다',
    en: 'Both metals are cooled together — both resistances fall smoothly',
    ja: '二つの金属を一緒に冷やす — どちらも抵抗がなめらかに下がる',
    zh: '两种金属一起冷却 — 两者的电阻都平滑地下降',
    ar: 'يُبرَّد الفلزّان معًا — تنخفض مقاومة كلٍّ منهما بسلاسة',
    es: 'Ambos metales se enfrían juntos — las dos resistencias bajan suavemente',
    fr: 'Les deux métaux sont refroidis ensemble — les deux résistances baissent en douceur',
    hi: 'दोनों धातुओं को साथ ठंडा किया जाता है — दोनों के प्रतिरोध धीरे-धीरे घटते हैं',
    id: 'Kedua logam didinginkan bersama — hambatan keduanya turun dengan mulus',
    pt: 'Os dois metais são resfriados juntos — as duas resistências caem suavemente',
  },
  'caption.drop': {
    ko: '임계 온도에 닿는 순간, 수은의 저항만 수직으로 떨어진다',
    en: 'At the critical temperature, only mercury’s resistance drops straight down',
    ja: '臨界温度に達した瞬間、水銀の抵抗だけが垂直に落ちる',
    zh: '到达临界温度的瞬间，只有汞的电阻竖直下落',
    ar: 'عند درجة الحرارة الحرجة، تهبط مقاومة الزئبق وحدها رأسيًا',
    es: 'A la temperatura crítica, solo la resistencia del mercurio cae en vertical',
    fr: 'À la température critique, seule la résistance du mercure chute à la verticale',
    hi: 'क्रांतिक ताप पर केवल पारे का प्रतिरोध सीधा नीचे गिरता है',
    id: 'Pada suhu kritis, hanya hambatan raksa yang jatuh tegak lurus',
    pt: 'Na temperatura crítica, só a resistência do mercúrio cai na vertical',
  },
  'caption.coolBelow': {
    ko: '더 식혀도 구리의 저항은 바닥에서 멈추고, 수은은 0 에 머문다',
    en: 'Cooling further, copper levels off at a floor while mercury stays at zero',
    ja: 'さらに冷やすと、銅は下限で横ばいになり、水銀はゼロのままだ',
    zh: '继续冷却，铜停在一个下限不再下降，而汞保持为零',
    ar: 'مع مزيد من التبريد، تستقر مقاومة النحاس عند حدٍّ أدنى بينما يبقى الزئبق عند الصفر',
    es: 'Al seguir enfriando, el cobre se estanca en un mínimo mientras el mercurio sigue en cero',
    fr: 'En refroidissant encore, le cuivre se stabilise à un plancher tandis que le mercure reste à zéro',
    hi: 'और ठंडा करने पर ताँबा एक निचली सीमा पर ठहर जाता है, जबकि पारा शून्य पर बना रहता है',
    id: 'Didinginkan lebih lanjut, tembaga mendatar di suatu batas bawah sementara raksa tetap nol',
    pt: 'Resfriando mais, o cobre se estabiliza num piso enquanto o mercúrio fica em zero',
  },
  'caption.hold': {
    ko: '구리에는 잔류 저항이 남았고, 수은의 저항은 임계 온도 아래에서 사라졌다',
    en: 'Copper keeps a residual resistance; below the critical temperature mercury’s is gone',
    ja: '銅には残留抵抗が残り、臨界温度より下で水銀の抵抗は消えた',
    zh: '铜保留了剩余电阻；在临界温度以下，汞的电阻消失了',
    ar: 'يحتفظ النحاس بمقاومة متبقية، أما مقاومة الزئبق فقد زالت تحت درجة الحرارة الحرجة',
    es: 'El cobre conserva una resistencia residual; por debajo de la temperatura crítica, la del mercurio desaparece',
    fr: 'Le cuivre garde une résistance résiduelle ; sous la température critique, celle du mercure a disparu',
    hi: 'ताँबे में अवशिष्ट प्रतिरोध बचा रहता है; क्रांतिक ताप से नीचे पारे का प्रतिरोध गायब हो गया',
    id: 'Tembaga menyisakan hambatan sisa; di bawah suhu kritis, hambatan raksa hilang',
    pt: 'O cobre mantém uma resistência residual; abaixo da temperatura crítica, a do mercúrio desapareceu',
  },
} satisfies Record<string, LocalizedText>);

export type SuperconductivityMessageKey = keyof typeof superconductivityMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: SuperconductivityMessageKey): LocalizedText => superconductivityMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: SuperconductivityMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const superconductivitySchema: BundleSchema = {
  id: SUPERCONDUCTIVITY_ID,
  label: text('label.title'),
  category: 'modern',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 식고 있고, 수은이 떨어지고, 다시 데워져 처음부터 식는다.
  parameters: [],

  stages: [
    {
      id: 'copper-mercury',
      label: text('label.stage'),
      constants: {
        tMax: T_MAX,
        tc: T_C,
        tEnd: T_END,
        exponent: EXPONENT,
        copperTop: COPPER_TOP,
        copperResidual: COPPER_RESIDUAL,
        mercuryTop: MERCURY_TOP,
        mercuryResidual: MERCURY_RESIDUAL,
      },
    },
  ],

  environments: [],

  views: [{ id: 'rt-plot', label: text('label.view'), default: true }],

  /** 가로로 넓은 판 하나와 캡션 한 줄. 세로를 더 주면 가로가 먼저 차서 그림만 작아진다. */
  canvas: { height: 360, minHeight: 320 },

  /**
   * 겹침이 판정 장치다. 수은의 0 선은 **가로축 위에** 덮여야 「축에 붙어 달린다」 로
   * 읽힌다. 축 → 안내선 → 곡선 → 점 → 글자 순서로 쓴다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 식힘(T_max → T_c) → 떨어짐(T_c 에 머묾) → 더 식힘(T_c → T_end) → 읽기 → 흐려짐.
   * 떨어지는 동안 온도는 움직이지 않는다 — 그래서 수은의 선분이 **수직**이다.
   */
  timeline: {
    phases: [
      { id: 'cool-normal', duration: COOL_NORMAL, caption: key('caption.coolNormal') },
      { id: 'drop', duration: DROP, ease: 'smooth', caption: key('caption.drop') },
      { id: 'cool-below', duration: COOL_BELOW, caption: key('caption.coolBelow') },
      { id: 'hold', duration: HOLD, caption: key('caption.hold') },
      { id: 'fade', duration: FADE, caption: key('caption.hold') },
    ],
  },

  /** 도착한 순간 두 곡선이 이미 판의 오른쪽에서 자라고 있다. */
  startAt: START_AT,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 정의와 공식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    fade: 0.25,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것은 임의의 저항값이 아니라 「바닥에 남는가,
   * 0 에 닿는가」 이고, 그 판정선은 가로축 자체다.
   */

  messages: superconductivityMessages,
};
