// ========================================================================
// radiative-equilibrium — 선언
// ========================================================================
// 질문: 햇빛을 받는 행성의 온도는 어디서 멈추는가.
//
// 같은 행성 둘을 나란히 둔다. 하나는 200 K, 하나는 320 K 에서 출발한다. 행성마다 두 막대 —
// 들어오는 몫(흡수한 햇빛, S(1−a)/4 ≈ 238 W/m², 온도와 무관하게 일정)과 나가는 몫(σT⁴,
// 온도가 오르면 는다)을 세운다. 두 막대의 차이만큼 온도가 움직이고, 나가는 막대가
// 들어오는 막대와 같은 높이가 되는 255 K 에서 멈춘다. 오른쪽 판에서 두 출발점의 온도 곡선이
// 한 값에 모인다 — 차갑게 시작해도 뜨겁게 시작해도 같은 온도에 선다.
//
// 온실층은 두지 않는다(`greenhouse-effect` 의 몫). 반사율이 무엇을 되돌리는지는 `albedo`,
// T⁴ 자체는 `stefan-boltzmann-law`, 빈 곳을 건너는 복사는 `thermal-radiation` 의 몫이다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:radiative-equilibrium` 와 문자 그대로 일치한다 (C4). */
export const RADIATIVE_EQUILIBRIUM_ID = 'radiative-equilibrium';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 태양 상수 S (W/m²). 행성 궤도에서 햇빛에 수직인 1 m² 가 받는 양. */
export const SOLAR_CONSTANT = 1361;
/** 반사율 a. 들어온 햇빛 가운데 되돌아가는 몫. */
export const ALBEDO = 0.3;
/** 슈테판-볼츠만 상수 σ (W/m²K⁴). */
export const SIGMA = 5.67e-8;
/** 면적당 열용량 (J/m²K). 50 m 깊이의 바다 겉층쯤이다. 곡선이 얼마나 느리게 다가가는지를 정한다. */
export const HEAT_CAPACITY = 2.1e8;
/**
 * 시간 배율 — 화면 1 초가 행성의 몇 초인가. 약 2 년이다. 실제로는 해를 넘겨 다가가는 일을
 * 몇 초 안에 보이려는 표시 배율이고 화면에 알리지 않는다 (NOTES (b)).
 */
export const TIME_SCALE = 6.3e7;
/** 두 행성의 출발 온도(K). */
export const T_COLD = 200;
export const T_HOT = 320;
/**
 * 만나는 온도 글자의 **정박값**(K). 곡선 · 점선 자리는 physics 가 (S(1−a)/4σ)^¼ ≈ 254.6 K 로
 * 계산하지만 화면 글자는 이 선언값을 그대로 쓴다 (S-piece 유효숫자). 저작자가 S · a 를 바꾸면
 * 이것도 함께 바꿔야 한다 — 그 관계를 선언할 자리가 없다(G143).
 */
export const T_EQ = 255;
/** 온도 판 세로축의 아래 · 위 끝(K). */
export const AXIS_MIN = 180;
export const AXIS_MAX = 340;
/**
 * 표시 배율 — 1 W/m² 가 막대 몇 월드 높이인가. 들어옴 · 나감 막대가 **같은 배율**을 쓴다.
 * 가장 긴 막대(320 K 행성의 처음 나감, ≈ 595 W/m²)가 판 위에 들어가는 만큼으로 잡는다.
 */
export const BAR_SCALE = 0.0038;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 행성 둘과 온도 판을 가로로 나란히 둔다 (세로가 비싸다).
// ------------------------------------------------------------------------

/** 두 행성 기둥의 가운데 x. 찬 출발 · 뜨거운 출발 순서. */
export const PLANET_XS: readonly number[] = [-4.2, -1.75];
/** 행성 원의 반지름과 가운데 높이. 막대 바닥 아래, 막대 이름표 밑에 매단다. */
export const PLANET_R = 0.42;
export const PLANET_Y = -0.85;
/** 출발 온도 글자의 높이 — 행성 아래. */
export const START_Y = -1.58;
/** 막대 바닥. */
export const BASE_Y = 0;
/** 막대의 폭과, 기둥 가운데에서 막대 가운데까지의 가로 거리. 들어옴은 왼쪽, 나감은 오른쪽. */
export const BAR_W = 0.5;
export const BAR_OFFSET = 0.33;
/** 온도 판 — 가로 끝과 세로 끝(월드). 세로축은 `AXIS_MIN` ~ `AXIS_MAX` 를 이 높이에 편다. */
export const GRAPH_X0 = 0.8;
export const GRAPH_X1 = 5.2;
export const GRAPH_Y0 = 0;
export const GRAPH_Y1 = 2.3;

/**
 * 프레이밍은 주장의 일부다. 가로는 행성 둘과 온도 판 · 오른쪽 끝 255 K 글자, 세로는 출발 글자 ·
 * 캡션 줄부터 가장 긴 막대(320 K 출발의 처음 나감)와 온도 판 T 기호까지. 매 프레임 같은 값이다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: -5.0, maxX: 6.2, minY: -2.2, maxY: 2.6 } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이(초)
// ------------------------------------------------------------------------

/** 행성 둘에 막대가 서는 동안. */
export const APPEAR = 1.6;
/** 온도가 움직이는 동안. 곡선이 그려진다. */
export const SETTLE = 6;
/** 만난 온도 점선 · 글자가 떠오르는 동안 · 다 모인 그림을 읽는 동안 · 흐려지는 동안. */
export const MEET = 0.6;
export const HOLD = 3.4;
export const FADE = 0.8;
/** 도착한 순간 온도가 움직이는 중이다 — 막대가 선 뒤 0.5 초, 곡선이 아직 가파른 자리에서 연다. */
export const START_AT = 2.1;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const radiativeEquilibriumMessages = Object.freeze({
  'label.title': {
    ko: '복사 평형',
    en: 'Radiative equilibrium',
    ja: '放射平衡',
    zh: '辐射平衡',
    ar: 'الاتزان الإشعاعي',
    es: 'Equilibrio radiativo',
    fr: 'Équilibre radiatif',
    hi: 'विकिरण संतुलन',
    id: 'Kesetimbangan radiasi',
    pt: 'Equilíbrio radiativo',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '들어온 만큼 내보낼 때 정해지는 온도',
    en: 'The temperature set when what goes out matches what comes in',
    ja: '出ていく量が入ってくる量とつり合うときに決まる温度',
    zh: '出去的与进来的相等时确定的温度',
    ar: 'درجة الحرارة التي تتحدد حين يساوي الخارجُ الداخلَ',
    es: 'La temperatura que se fija cuando lo que sale iguala a lo que entra',
    fr: 'La température fixée quand ce qui sort égale ce qui entre',
    hi: 'वह ताप जो तब तय होता है जब बाहर जाने वाला अंदर आने वाले के बराबर हो',
    id: 'Suhu yang tercapai ketika yang keluar sama dengan yang masuk',
    pt: 'A temperatura que se fixa quando o que sai iguala o que entra',
  },
  'label.stage': {
    ko: '같은 행성 둘',
    en: 'Two identical planets',
    ja: '同じ惑星二つ',
    zh: '两颗相同的行星',
    ar: 'كوكبان متماثلان',
    es: 'Dos planetas idénticos',
    fr: 'Deux planètes identiques',
    hi: 'दो एक जैसे ग्रह',
    id: 'Dua planet identik',
    pt: 'Dois planetas idênticos',
  },
  'label.view': {
    ko: '들어옴 · 나감 막대와 온도 곡선',
    en: 'In and out bars with temperature curves',
    ja: '入る・出る棒と温度曲線',
    zh: '流入·流出柱与温度曲线',
    ar: 'عمودا الداخل والخارج مع منحنيات درجة الحرارة',
    es: 'Barras de entrada y salida con curvas de temperatura',
    fr: 'Barres entrante et sortante avec courbes de température',
    hi: 'अंदर और बाहर की पट्टियाँ तथा ताप वक्र',
    id: 'Batang masuk dan keluar dengan kurva suhu',
    pt: 'Barras de entrada e saída com curvas de temperatura',
  },
  /** 온도 — 값과 단위. 값이 끼는 조립문이라 문안이다 (C1 판정 4). */
  'label.kelvin': {
    ko: '{t} K',
    en: '{t} K',
    ja: '{t} K',
    zh: '{t} K',
    ar: '{t} K',
    es: '{t} K',
    fr: '{t} K',
    hi: '{t} K',
    id: '{t} K',
    pt: '{t} K',
  },
  /** 행성 아래 출발 온도. */
  'label.start': {
    ko: '{t} K 에서 출발',
    en: 'starts at {t} K',
    ja: '{t} K から出発',
    zh: '从 {t} K 出发',
    ar: 'يبدأ عند {t} K',
    es: 'parte de {t} K',
    fr: 'part de {t} K',
    hi: '{t} K से शुरू',
    id: 'mulai dari {t} K',
    pt: 'começa em {t} K',
  },
  /** 막대 이름표. 제 막대 밑, 바닥선 아래에 붙는다. */
  'label.tagIn': {
    ko: '들어옴',
    en: 'in',
    ja: '入る',
    zh: '流入',
    ar: 'الداخل',
    es: 'entrada',
    fr: 'entrant',
    hi: 'अंदर',
    id: 'masuk',
    pt: 'entrada',
  },
  'label.tagOut': {
    ko: '나감',
    en: 'out',
    ja: '出る',
    zh: '流出',
    ar: 'الخارج',
    es: 'salida',
    fr: 'sortant',
    hi: 'बाहर',
    id: 'keluar',
    pt: 'saída',
  },
  /** 온도 판 축 기호. */
  'label.axisTemp': {
    ko: 'T',
    en: 'T',
    ja: 'T',
    zh: 'T',
    ar: 'T',
    es: 'T',
    fr: 'T',
    hi: 'T',
    id: 'T',
    pt: 'T',
  },
  'label.axisTime': {
    ko: 't',
    en: 't',
    ja: 't',
    zh: 't',
    ar: 't',
    es: 't',
    fr: 't',
    hi: 't',
    id: 't',
    pt: 't',
  },
  'caption.start': {
    ko: '같은 행성 둘에 같은 햇빛이 들어온다 — 하나는 {tCold} K, 하나는 {tHot} K 에서 출발',
    en: 'Two identical planets take in the same sunlight — one starts at {tCold} K, the other at {tHot} K',
    ja: '同じ惑星二つに同じ日光が入る — 一つは {tCold} K、もう一つは {tHot} K から出発',
    zh: '两颗相同的行星接收同样的阳光 — 一颗从 {tCold} K 出发，另一颗从 {tHot} K 出发',
    ar: 'كوكبان متماثلان يتلقيان ضوء الشمس نفسه — يبدأ أحدهما عند {tCold} K والآخر عند {tHot} K',
    es: 'Dos planetas idénticos reciben la misma luz solar — uno parte de {tCold} K y el otro de {tHot} K',
    fr: 'Deux planètes identiques reçoivent la même lumière du Soleil — l’une part de {tCold} K, l’autre de {tHot} K',
    hi: 'दो एक जैसे ग्रह एक ही सूर्य का प्रकाश पाते हैं — एक {tCold} K से शुरू होता है, दूसरा {tHot} K से',
    id: 'Dua planet identik menerima sinar Matahari yang sama — satu mulai dari {tCold} K, yang lain dari {tHot} K',
    pt: 'Dois planetas idênticos recebem a mesma luz solar — um começa em {tCold} K, o outro em {tHot} K',
  },
  'caption.settle': {
    ko: '찬 행성은 들어오는 것보다 적게 내보내며 데워지고, 뜨거운 행성은 더 많이 내보내며 식는다',
    en: 'The cold planet sends out less than comes in and warms; the hot one sends out more and cools',
    ja: '冷たい惑星は入ってくるより少なく出して温まり、熱い惑星はより多く出して冷える',
    zh: '冷的行星放出的比进来的少而变暖，热的行星放出的更多而变冷',
    ar: 'الكوكب البارد يُخرج أقل مما يدخله فيسخن، والحار يُخرج أكثر فيبرد',
    es: 'El planeta frío emite menos de lo que entra y se calienta; el caliente emite más y se enfría',
    fr: 'La planète froide émet moins qu’elle ne reçoit et se réchauffe ; la chaude émet plus et se refroidit',
    hi: 'ठंडा ग्रह जितना आता है उससे कम बाहर भेजता है और गर्म होता है; गर्म ग्रह अधिक बाहर भेजता है और ठंडा होता है',
    id: 'Planet dingin memancarkan lebih sedikit daripada yang masuk dan menghangat; planet panas memancarkan lebih banyak dan mendingin',
    pt: 'O planeta frio emite menos do que entra e se aquece; o quente emite mais e esfria',
  },
  'caption.meet': {
    ko: '두 곡선이 {tEq} K 에서 만났다 — 두 행성 모두 나감 막대가 들어옴 막대와 같은 높이에 섰다',
    en: 'The two curves met at {tEq} K — on both planets the out bar now stands level with the in bar',
    ja: '二つの曲線が {tEq} K で出会った — どちらの惑星でも出る棒が入る棒と同じ高さに並んだ',
    zh: '两条曲线在 {tEq} K 相遇 — 两颗行星的流出柱都与流入柱一样高了',
    ar: 'التقى المنحنيان عند {tEq} K — وفي الكوكبين صار عمود الخارج بمستوى عمود الداخل',
    es: 'Las dos curvas se encontraron en {tEq} K — en ambos planetas la barra de salida ya está a la altura de la de entrada',
    fr: 'Les deux courbes se sont rejointes à {tEq} K — sur les deux planètes, la barre sortante est désormais au niveau de la barre entrante',
    hi: 'दोनों वक्र {tEq} K पर मिले — दोनों ग्रहों पर बाहर की पट्टी अब अंदर की पट्टी के बराबर ऊँची है',
    id: 'Kedua kurva bertemu di {tEq} K — pada kedua planet, batang keluar kini sama tinggi dengan batang masuk',
    pt: 'As duas curvas se encontraram em {tEq} K — nos dois planetas a barra de saída agora está no nível da barra de entrada',
  },
} satisfies Record<string, LocalizedText>);

export type RadiativeEquilibriumMessageKey = keyof typeof radiativeEquilibriumMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: RadiativeEquilibriumMessageKey): LocalizedText => radiativeEquilibriumMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: RadiativeEquilibriumMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const radiativeEquilibriumSchema: BundleSchema = {
  id: RADIATIVE_EQUILIBRIUM_ID,
  label: text('label.title'),
  category: 'thermal',
  description: text('label.description'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 두 행성의 온도가 움직여 한 값에 모이고, 다시 처음으로.
  parameters: [],

  stages: [
    {
      id: 'two-planets',
      label: text('label.stage'),
      constants: {
        solarConstant: SOLAR_CONSTANT,
        albedo: ALBEDO,
        sigma: SIGMA,
        heatCapacity: HEAT_CAPACITY,
        timeScale: TIME_SCALE,
        tCold: T_COLD,
        tHot: T_HOT,
        tEq: T_EQ,
        axisMin: AXIS_MIN,
        axisMax: AXIS_MAX,
        barScale: BAR_SCALE,
      },
    },
  ],

  environments: [],

  views: [{ id: 'bars-and-curves', label: text('label.view'), default: true }],

  canvas: { height: 380, minHeight: 340 },

  /**
   * 한 주기 = 막대가 선다 → 온도가 움직인다(곡선이 그려진다) → 만난 온도가 떠오른다 → 다 모인
   * 그림을 읽는다 → 흐려진다. 온도가 움직이는 단계는 이징 없이 흐른다 — 다가가는 빠르기가 주는 것은
   * 물리가 곡선으로 보이고, 이징을 씌우면 그 모양이 흐려진다.
   */
  timeline: {
    phases: [
      { id: 'appear', duration: APPEAR, ease: 'smooth', caption: key('caption.start') },
      { id: 'settle', duration: SETTLE, caption: key('caption.settle') },
      { id: 'meet', duration: MEET, caption: key('caption.meet') },
      { id: 'hold', duration: HOLD, caption: key('caption.meet') },
      { id: 'fade', duration: FADE, caption: key('caption.meet') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — 온도가 움직이는 중에 연다. */
  startAt: START_AT,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — σT⁴ · S(1−a)/4 는 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    fade: 0.3,
    style: { colorRole: 'muted', emphasis: 'strong' },
    vars: {
      tCold: 'tColdText',
      tHot: 'tHotText',
      tEq: 'tEqText',
    },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것은 거리가 아니라 두 막대 높이의 맞음과 두 곡선이
   * 모이는 자리다.
   */

  messages: radiativeEquilibriumMessages,
};
