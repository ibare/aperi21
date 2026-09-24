// ========================================================================
// thermal-equilibrium — 선언
// ========================================================================
// 질문: 뜨거운 덩이와 찬 덩이를 맞붙이면 어디서 멈추는가.
//
// 같은 물질 · 같은 크기의 두 덩이를 맞붙인다. 맞닿은 면을 건너 열이 뜨거운 쪽에서
// 찬 쪽으로 가고, 두 온도는 처음에는 빠르게, 가까워질수록 느리게 다가가 한 값에서
// 겹친다. 겹친 뒤로는 건너가는 열이 없고 온도도 변하지 않는다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:thermal-equilibrium` 와 문자 그대로 일치한다 (C4). */
export const THERMAL_EQUILIBRIUM_ID = 'thermal-equilibrium';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 뜨거운 덩이의 처음 온도(℃). */
export const T_HOT = 80;
/** 찬 덩이의 처음 온도(℃). */
export const T_COLD = 20;
/**
 * 두 덩이가 만나는 온도(℃) — 화면 글자에 띄우는 정박값. 같은 물질 · 같은 질량이라 두 처음 온도의
 * 가운데여야 하고, 곡선 · 점선 자리는 physics 가 그 가운데로 계산한다(둘의 관계는 G143).
 */
export const T_MEET = 50;
/**
 * 온도 차가 줄어드는 빠르기(1/초, 화면 시간). 전달 계수 ÷ 열용량을 두 덩이 몫으로 합친
 * 값이다 — 차는 e^(−rate·s) 로 준다. 흐름이 온도 차에 비례하기 때문이다.
 */
export const RATE = 0.8;
/** 맞닿은 면을 건너는 열 알갱이 수. 알갱이 하나 = 건너갈 열 전체의 1/packets. */
export const PACKETS = 24;
/** 알갱이 하나가 뜨거운 덩이 안에서 찬 덩이 안까지 가는 시간(초). */
export const PACKET_TRAVEL = 0.9;
/** 알갱이 자리를 흩는 시드. 같은 시각은 같은 화면이다 (S-sim). */
export const SEED = 7;
/** 온도 눈금의 아래 · 위 끝(℃). 막대와 곡선이 같은 눈금을 쓴다. */
export const AXIS_MIN = 0;
export const AXIS_MAX = 100;
/** 처음 온도 차에서의 열 화살표 길이(월드)와 굵기(화면 px). 차에 비례해 줄어든다. */
export const ARROW_LEN = 1.4;
export const ARROW_WIDTH = 8;
/** 화살표를 거두는 문턱 — 처음 차에 대한 지금 차의 몫. 이보다 작으면 흐름이 끝난 것이다. */
export const ARROW_MIN_RATIO = 0.02;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 왼쪽에 두 덩이, 오른쪽에 온도-시간 곡선. y 는 위.
// ------------------------------------------------------------------------

/** 덩이 한 개의 크기 [가로, 세로]. 둘이 같다 — 같은 물질 · 같은 크기가 주장의 전제다. */
export const BLOCK_SIZE: readonly [number, number] = [1.6, 2.3];
/** 맞닿은 면의 x. 뜨거운 덩이는 왼쪽, 찬 덩이는 오른쪽. */
export const INTERFACE_X = -1.9;
/** 떨어져 있을 때 두 덩이 사이 틈(월드). */
export const GAP = 0.7;
/** 덩이 바닥의 y. */
export const BLOCK_BOTTOM = 0;

/** 온도 막대(관)의 폭과, 덩이 바깥 모서리에서 관 중심까지의 거리. */
export const TUBE_WIDTH = 0.3;
export const TUBE_INSET = 0.38;
/** 눈금 AXIS_MIN · AXIS_MAX 가 놓이는 y. 막대와 곡선이 이 높이를 함께 쓴다. */
export const SCALE_BOTTOM = 0.1;
export const SCALE_TOP = 2.2;

/** 알갱이가 흩어지는 세로 범위(y)와, 관 · 맞닿은 면에서 떨어지는 여백(x). */
export const PACKET_Y_MIN = 0.35;
export const PACKET_Y_MAX = 1.95;
export const PACKET_MARGIN = 0.12;
/** 알갱이 반지름(월드). */
export const PACKET_R = 0.055;

/** 열 화살표가 놓이는 높이 — 덩이 위. */
export const ARROW_Y = 2.6;
/** 덩이 온도 글자가 놓이는 높이. */
export const TEMP_LABEL_Y = 2.62;

/** 곡선 판의 가로 범위. 세로는 막대와 같은 눈금이다. */
export const GRAPH_X0 = 0.75;
export const GRAPH_X1 = 4.7;

/**
 * 프레이밍은 주장의 일부다. 가로는 떨어져 있는 뜨거운 덩이 왼쪽 끝부터 곡선 판 오른쪽
 * 이름표까지, 세로는 시간축 이름표 아래부터 덩이 위 화살표 · 글자까지. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -4.15, maxX: 5.35, minY: -0.35, maxY: 2.95 } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이(초)
// ------------------------------------------------------------------------

/** 떨어져 있는 두 덩이를 보이는 동안. */
export const APART = 0.8;
/** 두 덩이가 다가가 맞붙는 동안. */
export const TOUCH = 1.0;
/** 맞붙은 직후 — 열이 굵게 건너가는 동안. */
export const FLOW = 2.0;
/** 온도 차가 줄어 흐름이 가늘어지는 동안. */
export const SLOW = 4.5;
/** 한 온도에서 멈춘 그림을 읽는 동안 · 다음 주기로 흐려지는 동안. */
export const HOLD = 3.2;
export const FADE = 0.6;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const thermalEquilibriumMessages = Object.freeze({
  'label.title': {
    ko: '열평형',
    en: 'Thermal equilibrium',
    ja: '熱平衡',
    zh: '热平衡',
    ar: 'الاتزان الحراري',
    es: 'Equilibrio térmico',
    fr: 'Équilibre thermique',
    hi: 'ऊष्मीय संतुलन',
    id: 'Kesetimbangan termal',
    pt: 'Equilíbrio térmico',
  },
  'label.operation': {
    ko: '접촉한 두 계가 도달하는 상태',
    en: 'The state two systems in contact reach',
    ja: '接触した二つの系が行き着く状態',
    zh: '相互接触的两个系统所达到的状态',
    ar: 'الحالة التي يبلغها نظامان متلامسان',
    es: 'El estado que alcanzan dos sistemas en contacto',
    fr: 'L’état qu’atteignent deux systèmes en contact',
    hi: 'संपर्क में रखे दो निकायों द्वारा प्राप्त अवस्था',
    id: 'Keadaan yang dicapai dua sistem yang bersentuhan',
    pt: 'O estado que dois sistemas em contato atingem',
  },
  'label.stage': {
    ko: '맞붙인 두 덩이',
    en: 'Two blocks in contact',
    ja: '接触させた二つのブロック',
    zh: '相互接触的两个物块',
    ar: 'كتلتان متلامستان',
    es: 'Dos bloques en contacto',
    fr: 'Deux blocs en contact',
    hi: 'संपर्क में दो गुटके',
    id: 'Dua balok bersentuhan',
    pt: 'Dois blocos em contato',
  },
  'label.view': {
    ko: '덩이와 곡선',
    en: 'Blocks and curves',
    ja: 'ブロックと曲線',
    zh: '物块与曲线',
    ar: 'الكتل والمنحنيات',
    es: 'Bloques y curvas',
    fr: 'Blocs et courbes',
    hi: 'गुटके और वक्र',
    id: 'Balok dan kurva',
    pt: 'Blocos e curvas',
  },
  /** 온도 글자. 값은 선언한 처음 온도 · 만나는 온도를 끼운다 (C1). */
  'label.temp': {
    ko: '{t} ℃',
    en: '{t} ℃',
    ja: '{t} ℃',
    zh: '{t} ℃',
    ar: '{t} ℃',
    es: '{t} ℃',
    fr: '{t} ℃',
    hi: '{t} ℃',
    id: '{t} ℃',
    pt: '{t} ℃',
  },
  /** 열 화살표 이름. */
  'label.heat': {
    ko: '열',
    en: 'heat',
    ja: '熱',
    zh: '热',
    ar: 'حرارة',
    es: 'calor',
    fr: 'chaleur',
    hi: 'ऊष्मा',
    id: 'kalor',
    pt: 'calor',
  },
  /** 곡선 판의 축 기호. 표식이다 (C1 판정). */
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
  'caption.apart': {
    ko: '같은 물질 · 같은 크기의 두 덩이 — 하나는 {hot} ℃, 하나는 {cold} ℃ 다',
    en: 'Two blocks of the same material and size — one at {hot} ℃, one at {cold} ℃',
    ja: '同じ物質・同じ大きさの二つのブロック — 一つは {hot} ℃、もう一つは {cold} ℃',
    zh: '相同材料、相同大小的两个物块 — 一个 {hot} ℃，一个 {cold} ℃',
    ar: 'كتلتان من المادة نفسها وبالحجم نفسه — إحداهما عند {hot} ℃ والأخرى عند {cold} ℃',
    es: 'Dos bloques del mismo material y tamaño — uno a {hot} ℃ y otro a {cold} ℃',
    fr: 'Deux blocs de même matière et de même taille — l’un à {hot} ℃, l’autre à {cold} ℃',
    hi: 'एक ही पदार्थ और एक ही आकार के दो गुटके — एक {hot} ℃ पर, दूसरा {cold} ℃ पर',
    id: 'Dua balok dari bahan dan ukuran yang sama — satu bersuhu {hot} ℃, satu lagi {cold} ℃',
    pt: 'Dois blocos do mesmo material e tamanho — um a {hot} ℃, outro a {cold} ℃',
  },
  'caption.touch': {
    ko: '두 덩이를 맞붙인다',
    en: 'The two blocks are pressed together',
    ja: '二つのブロックをくっつける',
    zh: '把两个物块贴在一起',
    ar: 'تُضَمّ الكتلتان إحداهما إلى الأخرى',
    es: 'Los dos bloques se juntan',
    fr: 'Les deux blocs sont mis en contact',
    hi: 'दोनों गुटकों को आपस में सटाया जाता है',
    id: 'Kedua balok ditempelkan',
    pt: 'Os dois blocos são encostados um no outro',
  },
  'caption.flow': {
    ko: '맞닿은 면을 건너 열이 뜨거운 덩이에서 찬 덩이로 간다 — 한쪽 막대는 내려가고 한쪽은 올라간다',
    en: 'Heat crosses the contact from the hot block to the cold one — one bar falls as the other rises',
    ja: '接触面を越えて熱が熱いブロックから冷たいブロックへ移る — 一方の棒は下がり、もう一方は上がる',
    zh: '热越过接触面，从热物块传到冷物块 — 一根柱下降，另一根上升',
    ar: 'تعبر الحرارة سطح التلامس من الكتلة الساخنة إلى الباردة — ينخفض أحد العمودين بينما يرتفع الآخر',
    es: 'El calor cruza el contacto del bloque caliente al frío — una barra baja mientras la otra sube',
    fr: 'La chaleur traverse le contact du bloc chaud vers le bloc froid — une barre descend pendant que l’autre monte',
    hi: 'ऊष्मा संपर्क तल को पार कर गर्म गुटके से ठंडे गुटके में जाती है — एक पट्टी गिरती है और दूसरी उठती है',
    id: 'Kalor melintasi bidang kontak dari balok panas ke balok dingin — satu batang turun sementara yang lain naik',
    pt: 'O calor atravessa o contato do bloco quente para o frio — uma barra desce enquanto a outra sobe',
  },
  'caption.slow': {
    ko: '두 막대가 가까워질수록 건너가는 알갱이가 드물어지고, 두 곡선도 점점 느리게 다가간다',
    en: 'As the bars close in, fewer grains cross, and the two curves approach more and more slowly',
    ja: '棒どうしが近づくほど渡る粒はまばらになり、二本の曲線もますますゆっくり近づく',
    zh: '两根柱越接近，穿过的颗粒越稀少，两条曲线也越来越慢地靠近',
    ar: 'كلما تقارب العمودان قلّت الحُبيبات العابرة، واقترب المنحنيان أبطأ فأبطأ',
    es: 'A medida que las barras se acercan, cruzan menos granos y las dos curvas se aproximan cada vez más despacio',
    fr: 'À mesure que les barres se rapprochent, moins de grains traversent, et les deux courbes s’approchent de plus en plus lentement',
    hi: 'जैसे-जैसे पट्टियाँ पास आती हैं, कम कण पार जाते हैं, और दोनों वक्र और भी धीरे-धीरे पास आते हैं',
    id: 'Makin dekat kedua batang, makin sedikit butir yang menyeberang, dan kedua kurva mendekat makin lambat',
    pt: 'À medida que as barras se aproximam, menos grãos atravessam, e as duas curvas se aproximam cada vez mais devagar',
  },
  'caption.meet': {
    ko: '두 덩이가 {meet} ℃ 에서 만났다 — 건너가는 알갱이가 없고 막대도 곡선도 더 움직이지 않는다',
    en: 'Both blocks met at {meet} ℃ — no grains cross, and neither the bars nor the curves move',
    ja: '二つのブロックは {meet} ℃ で出会った — 渡る粒はなく、棒も曲線ももう動かない',
    zh: '两个物块在 {meet} ℃ 相遇 — 没有颗粒再穿过，柱和曲线都不再移动',
    ar: 'التقت الكتلتان عند {meet} ℃ — لا حُبيبات تعبر، ولا يتحرك العمودان ولا المنحنيان',
    es: 'Ambos bloques se encontraron en {meet} ℃ — no cruza ningún grano y ni las barras ni las curvas se mueven',
    fr: 'Les deux blocs se sont rejoints à {meet} ℃ — aucun grain ne traverse, et ni les barres ni les courbes ne bougent',
    hi: 'दोनों गुटके {meet} ℃ पर मिल गए — कोई कण पार नहीं जाता, और न पट्टियाँ हिलती हैं न वक्र',
    id: 'Kedua balok bertemu di {meet} ℃ — tak ada butir yang menyeberang, dan batang maupun kurva tak lagi bergerak',
    pt: 'Os dois blocos se encontraram em {meet} ℃ — nenhum grão atravessa, e nem as barras nem as curvas se movem',
  },
} satisfies Record<string, LocalizedText>);

export type ThermalEquilibriumMessageKey = keyof typeof thermalEquilibriumMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: ThermalEquilibriumMessageKey): LocalizedText =>
  thermalEquilibriumMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ThermalEquilibriumMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const thermalEquilibriumSchema: BundleSchema = {
  id: THERMAL_EQUILIBRIUM_ID,
  label: text('label.title'),
  category: 'thermal',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 두 처음 온도와 빠르기는 스테이지 상수다. 독자가 바꿔 볼 것이
  // 「어디서 만나는가」 라면 그것은 calorimetry 의 몫이다.
  parameters: [],

  stages: [
    {
      id: 'blocks',
      label: text('label.stage'),
      constants: {
        tHot: T_HOT,
        tCold: T_COLD,
        tMeet: T_MEET,
        rate: RATE,
        packets: PACKETS,
        packetTravel: PACKET_TRAVEL,
        seed: SEED,
        axisMin: AXIS_MIN,
        axisMax: AXIS_MAX,
        arrowLen: ARROW_LEN,
        arrowWidth: ARROW_WIDTH,
        arrowMinRatio: ARROW_MIN_RATIO,
      },
    },
  ],

  environments: [],

  views: [{ id: 'blocks-and-curves', label: text('label.view'), default: true }],

  /** 세로가 비싸다. 덩이 높이 + 위 화살표 · 글자 + 캡션 한 줄. */
  canvas: { height: 360, minHeight: 320 },

  /**
   * 겹침이 판정 장치다. 온도 막대는 덩이 **위**에, 관 둘레는 막대 위에, 알갱이는 덩이 위에
   * 그려야 한다. 층 순서로는 `region`(막대)이 알갱이(`body`)를 덮는다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 떨어짐 → 맞붙음 → 굵은 흐름 → 가늘어짐 → 한 온도에서 멈춤 → 흐려짐.
   * 물리 시계는 `flow` 가 시작한 순간(맞붙은 순간)부터 센다.
   */
  timeline: {
    phases: [
      { id: 'apart', duration: APART, caption: key('caption.apart') },
      { id: 'touch', duration: TOUCH, ease: 'smooth', caption: key('caption.touch') },
      { id: 'flow', duration: FLOW, caption: key('caption.flow') },
      { id: 'slow', duration: SLOW, caption: key('caption.slow') },
      { id: 'hold', duration: HOLD, caption: key('caption.meet') },
      { id: 'fade', duration: FADE, caption: key('caption.meet') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — 두 덩이가 서로를 향해 다가가는 자리에서 연다. */
  startAt: 1.0,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 법칙과 식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 720,
    style: { colorRole: 'muted', emphasis: 'strong' },
    // 문안의 수는 스테이지 상수에서 온다 — initialState 가 글자로 옮겨 둔 state 경로 (G133).
    vars: { hot: 'hotText', cold: 'coldText', meet: 'meetText' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것은 거리가 아니라 **두 온도가 겹쳤는가** 다.
   * 막대와 곡선이 같은 눈금을 써서 그 자리를 눈으로 잇는다.
   */

  messages: thermalEquilibriumMessages,
};
