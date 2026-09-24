// ========================================================================
// wave-function — 선언
// ========================================================================
// 질문: 파동 함수 ψ 는 입자가 어디 있는지를 어떻게 말하는가.
//
// 답: ψ 는 부호가 있는 진폭이다 — 축 위로 솟은 곳도, 아래로 처진 곳도 있다. 그
// 부호는 있을 곳을 말하지 않는다. 제곱한 |ψ|² 가 있을 곳의 분포이고, 측정을 거듭해
// 찍힌 점들의 모임이 그 모양을 따른다. ψ 가 음수인 봉우리에도 점이 모이고, ψ 가
// 축을 가로지르는 마디에는 점이 찍히지 않는다.
//
// 이웃과 나눈 몫 — 준위마다 ψ 의 모양은 `particle-in-a-box`, 분포의 폭이 짝을 이루는
// 것은 `uncertainty-principle`, 두 슬릿을 지난 무늬가 쌓이는 것은
// `double-slit-with-electrons` 다. 측정 한 번에 ψ 가 무너지는 순간은
// `measurement-collapse` 의 몫이라 여기서는 하지 않는다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:wave-function` 와 문자 그대로 일치한다 (C4). */
export const WAVE_FUNCTION_ID = 'wave-function';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
//
// ψ(x) = c₀ φ₀(x) + c₁ φ₁(x) — 조화 우물의 바닥 상태와 첫 들뜬 상태를 겹친 모양이다.
// x 는 우물의 길이 단위(√(ħ/mω))다. 계수는 코드가 정규화하므로 비만 뜻이 있다.
// ------------------------------------------------------------------------

/** 바닥 상태 φ₀(마디 없는 종 모양)의 계수. */
export const COEFF_GROUND = 0.3;
/** 첫 들뜬 상태 φ₁(가운데 마디 하나)의 계수. 이 쪽이 크면 봉우리 둘이 위 · 아래로 갈린다. */
export const COEFF_EXCITED = 0.95;
/**
 * 측정 결과를 뽑는 시드. 주기 번호와 함께 점 자리를 정한다. 느린 단계에 음수 쪽 점이 드는 것은
 * `drawCycle` 이 순서를 바꿔 보장한다 — 11 은 첫 주기에 바꾸지 않고도 그렇게 되는 시드다.
 */
export const SEED = 11;
/** 한 주기에 찍는 점(측정) 수. */
export const DOT_COUNT = 1200;
/** 처음 천천히 하나씩 찍는 점 수 — 점마다 세 판을 잇는 안내선이 선다. */
export const SLOW_COUNT = 8;
/** 점 더미(도수)를 세는 칸 수 — 보이는 x 범위를 이만큼 나눈다. */
export const BIN_COUNT = 40;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 세 판이 x 를 함께 쓴다: 위 ψ, 가운데 |ψ|², 아래 측정 띠.
// ------------------------------------------------------------------------

/** 보이는 x 범위의 반(길이 단위). 꼬리가 이 안에서 바닥에 닿는다. */
export const X_HALF = 4;
/** x 한 단위의 월드 가로. */
export const X_SCALE = 2.5;
/** ψ 판의 축 높이와, 가장 큰 |ψ| 가 닿는 높이(축에서). */
export const PSI_BASE = 7.0;
export const PSI_HALF = 1.6;
/** |ψ|² 판의 축 높이와, 가장 큰 |ψ|² 가 닿는 높이. */
export const PROB_BASE = 1.6;
export const PROB_HEIGHT = 3.0;
/** 측정 띠의 아래 · 위 끝. 점은 이 띠 안에 흩어진다(세로 자리는 뜻이 없다). */
export const STRIP_MIN = -1.0;
export const STRIP_MAX = 0.2;
/** 판 이름표가 축 왼쪽 끝에서 떨어진 거리(월드). */
export const PANEL_LABEL_GAP = 0.5;

/**
 * 프레이밍 — 왼쪽은 판 이름표, 오른쪽은 축 끝, 위는 ψ 봉우리, 아래는 측정 띠와 캡션
 * 한 줄(캡션 자리가 프레이밍에 잡히지 않아 경계로 비운다 — 장부 G24). 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -13.4, maxX: 10.6, minY: -2.3, maxY: 8.9 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const waveFunctionMessages = Object.freeze({
  'label.title': {
    ko: '파동 함수',
    en: 'Wave function',
    ja: '波動関数',
    zh: '波函数',
    ar: 'دالة الموجة',
    es: 'Función de onda',
    fr: 'Fonction d’onde',
    hi: 'तरंग फलन',
    id: 'Fungsi gelombang',
    pt: 'Função de onda',
  },
  'label.operation': {
    ko: '확률 진폭과 그 해석',
    en: 'Probability amplitude and what it means',
    ja: '確率振幅とその意味',
    zh: '概率幅及其含义',
    ar: 'سعة الاحتمال وما تعنيه',
    es: 'La amplitud de probabilidad y lo que significa',
    fr: 'L’amplitude de probabilité et ce qu’elle signifie',
    hi: 'प्रायिकता आयाम और उसका अर्थ',
    id: 'Amplitudo probabilitas dan maknanya',
    pt: 'A amplitude de probabilidade e o que ela significa',
  },
  'label.stage': {
    ko: '조화 우물의 겹친 상태',
    en: 'Superposed harmonic-well state',
    ja: '調和ポテンシャルの重ね合わせ状態',
    zh: '谐振子势阱中的叠加态',
    ar: 'حالة متراكبة في بئر توافقي',
    es: 'Estado superpuesto en un pozo armónico',
    fr: 'État superposé dans un puits harmonique',
    hi: 'हार्मोनिक कूप की अध्यारोपित अवस्था',
    id: 'Keadaan tersuperposisi dalam sumur harmonik',
    pt: 'Estado superposto num poço harmônico',
  },
  'label.view': {
    ko: '진폭 · 분포 · 측정',
    en: 'Amplitude · distribution · measurements',
    ja: '振幅 · 分布 · 測定',
    zh: '振幅 · 分布 · 测量',
    ar: 'السعة · التوزيع · القياسات',
    es: 'Amplitud · distribución · mediciones',
    fr: 'Amplitude · distribution · mesures',
    hi: 'आयाम · वितरण · मापन',
    id: 'Amplitudo · distribusi · pengukuran',
    pt: 'Amplitude · distribuição · medições',
  },

  /** 판 기호 — 수식 표식이라 두 언어가 같다 (C1 판정 3). */
  'label.psi': {
    ko: 'ψ',
    en: 'ψ',
    ja: 'ψ',
    zh: 'ψ',
    ar: 'ψ',
    es: 'ψ',
    fr: 'ψ',
    hi: 'ψ',
    id: 'ψ',
    pt: 'ψ',
  },
  'label.prob': {
    ko: '|ψ|²',
    en: '|ψ|²',
    ja: '|ψ|²',
    zh: '|ψ|²',
    ar: '|ψ|²',
    es: '|ψ|²',
    fr: '|ψ|²',
    hi: '|ψ|²',
    id: '|ψ|²',
    pt: '|ψ|²',
  },
  /** 측정 띠 이름. 조사가 붙을 수 있는 낱말이라 문안이다 (C1 판정 4). */
  'label.measure': {
    ko: '측정',
    en: 'measured',
    ja: '測定',
    zh: '测量',
    ar: 'القياس',
    es: 'medido',
    fr: 'mesuré',
    hi: 'मापित',
    id: 'terukur',
    pt: 'medido',
  },

  'caption.square': {
    ko: '위는 부호가 있는 진폭 ψ — 제곱하면 아래로 처진 봉우리도 위로 솟는다',
    en: 'Above, the signed amplitude ψ — squaring it flips the dipping lobe upward too',
    ja: '上は符号をもつ振幅 ψ — 2乗すると、下へ沈んだ山も上へ突き出る',
    zh: '上方是带符号的振幅 ψ — 平方后，向下凹的波瓣也翻到上方',
    ar: 'في الأعلى السعة ذات الإشارة ψ — وتربيعها يقلب الفص الهابط إلى الأعلى أيضًا',
    es: 'Arriba, la amplitud con signo ψ — al elevarla al cuadrado, el lóbulo que baja también se voltea hacia arriba',
    fr: 'En haut, l’amplitude signée ψ — l’élever au carré retourne aussi vers le haut le lobe qui plonge',
    hi: 'ऊपर चिह्नयुक्त आयाम ψ है — इसका वर्ग करने पर नीचे झुकी पालि भी ऊपर पलट जाती है',
    id: 'Di atas, amplitudo bertanda ψ — mengkuadratkannya membalik cuping yang menurun ke atas juga',
    pt: 'Em cima, a amplitude com sinal ψ — elevá-la ao quadrado vira para cima também o lóbulo que desce',
  },
  'caption.slow': {
    ko: '측정 한 번에 점 하나 — 어디 찍힐지는 매번 다르고, ψ 가 음수인 곳에도 찍힌다',
    en: 'One measurement, one dot — it lands somewhere new each time, even where ψ is negative',
    ja: '測定1回につき点が1つ — 毎回ちがう場所に落ち、ψ が負のところにも落ちる',
    zh: '测量一次，落下一个点 — 每次落在不同的地方，ψ 为负的地方也会落下',
    ar: 'قياس واحد، نقطة واحدة — تقع في موضع جديد كل مرة، حتى حيث تكون ψ سالبة',
    es: 'Una medición, un punto — cae en un sitio nuevo cada vez, incluso donde ψ es negativa',
    fr: 'Une mesure, un point — il tombe à un endroit nouveau à chaque fois, même là où ψ est négative',
    hi: 'एक मापन, एक बिंदु — हर बार वह नई जगह पड़ता है, वहाँ भी जहाँ ψ ऋणात्मक है',
    id: 'Satu pengukuran, satu titik — jatuh di tempat baru setiap kali, bahkan di tempat ψ negatif',
    pt: 'Uma medição, um ponto — ele cai num lugar novo a cada vez, mesmo onde ψ é negativa',
  },
  'caption.fast': {
    ko: '측정을 거듭할수록 점 더미가 제곱한 곡선까지 차오른다 — 마디 자리는 거의 비어 있다',
    en: 'As measurements pile up, the stack fills up to the squared curve — the node stays almost empty',
    ja: '測定が重なるにつれ、点の山が2乗した曲線まで満ちていく — 節のところはほとんど空のまま',
    zh: '随着测量不断累积，点堆一直填到平方后的曲线 — 波节处几乎空着',
    ar: 'مع تراكم القياسات تمتلئ الكومة حتى المنحنى المربَّع — وتبقى العقدة شبه فارغة',
    es: 'A medida que se acumulan las mediciones, la pila se llena hasta la curva al cuadrado — el nodo queda casi vacío',
    fr: 'À mesure que les mesures s’accumulent, la pile monte jusqu’à la courbe au carré — le nœud reste presque vide',
    hi: 'जैसे-जैसे मापन जमा होते हैं, ढेर वर्ग किए गए वक्र तक भर जाता है — निस्पंद लगभग खाली रहता है',
    id: 'Seiring pengukuran menumpuk, tumpukan terisi hingga kurva kuadrat — simpulnya tetap hampir kosong',
    pt: 'À medida que as medições se acumulam, a pilha se enche até a curva ao quadrado — o nó fica quase vazio',
  },
  'caption.hold': {
    ko: '점들의 모임이 제곱한 곡선의 모양을 따른다 — 부호는 사라지고 크기만 남았다',
    en: 'The gathered dots follow the squared curve — the sign is gone, only the size remains',
    ja: '集まった点は2乗した曲線の形に従う — 符号は消え、大きさだけが残った',
    zh: '聚集的点沿着平方后的曲线分布 — 符号消失了，只剩下大小',
    ar: 'النقاط المتجمعة تتبع المنحنى المربَّع — اختفت الإشارة ولم يبقَ إلا المقدار',
    es: 'Los puntos reunidos siguen la curva al cuadrado — el signo desapareció, solo queda el tamaño',
    fr: 'Les points rassemblés suivent la courbe au carré — le signe a disparu, seule la taille reste',
    hi: 'एकत्र बिंदु वर्ग किए गए वक्र का अनुसरण करते हैं — चिह्न मिट गया, केवल परिमाण बचा',
    id: 'Titik-titik yang terkumpul mengikuti kurva kuadrat — tandanya hilang, hanya besarnya yang tersisa',
    pt: 'Os pontos reunidos seguem a curva ao quadrado — o sinal sumiu, só resta o tamanho',
  },
} satisfies Record<string, LocalizedText>);

export type WaveFunctionMessageKey = keyof typeof waveFunctionMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: WaveFunctionMessageKey): LocalizedText => waveFunctionMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: WaveFunctionMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const waveFunctionSchema: BundleSchema = {
  id: WAVE_FUNCTION_ID,
  label: text('label.title'),
  category: 'modern',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다. 자동 진행이 제곱 · 한 번씩 측정 · 거듭 측정을 모두 지나간다. 모양을
  // 바꾸는 계수 슬라이더를 두어도 「점이 |ψ|² 를 따른다」 에 새로 해 볼 것이 생기지 않는다.
  parameters: [],

  stages: [
    {
      id: 'superposed',
      label: text('label.stage'),
      constants: {
        coeffGround: COEFF_GROUND,
        coeffExcited: COEFF_EXCITED,
        seed: SEED,
        dotCount: DOT_COUNT,
        slowCount: SLOW_COUNT,
        binCount: BIN_COUNT,
      },
    },
  ],

  environments: [],

  views: [{ id: 'main', label: text('label.view'), default: true }],

  /** 판 셋이 세로로 쌓인다. 아래 캡션 한 줄. */
  canvas: { height: 420, minHeight: 360 },

  /** 축 · 더미를 먼저, 곡선을 그 위에, 안내선 · 새 점을 맨 위에. */
  drawOrder: 'scene',

  /**
   * 한 주기 20.1 초.
   *
   * - `square` — 가운데 판의 곡선이 ψ 의 사본에서 |ψ|² 로 바뀐다. 아래로 처진 봉우리가
   *   위로 뒤집혀 솟고, 마디는 0 에 남는다.
   * - `rest` — 두 곡선을 나란히 둔다.
   * - `slow` — 처음 `slowCount` 번의 측정을 하나씩 찍는다. 새 점마다 강조색 안내선이 세
   *   판을 잇는다 — 그 자리의 ψ 가 음수여도 점은 찍힌다.
   * - `fast` — 나머지 측정이 쏟아진다. 점 더미가 |ψ|² 곡선까지 차오른다.
   * - `hold` — 다 찼다. `clear` — 점과 더미가 걷히고 다음 주기는 새 측정이다.
   */
  timeline: {
    phases: [
      { id: 'square', duration: 2.6, ease: 'smooth', caption: key('caption.square') },
      { id: 'rest', duration: 1.0, caption: key('caption.square') },
      { id: 'slow', duration: 6.0, caption: key('caption.slow') },
      { id: 'fast', duration: 6.0, ease: 'smooth', caption: key('caption.fast') },
      { id: 'hold', duration: 3.5, caption: key('caption.hold') },
      { id: 'clear', duration: 1.0, ease: 'smooth', caption: key('caption.hold') },
    ],
  },

  /** 도착한 순간 측정이 두 번 끝나 있고, 다음 점이 곧 찍힌다. */
  startAt: 5.8,

  /** 슬롯 하나. 측정 띠 아래 왼쪽. */
  caption: {
    anchor: { screen: 'bottom-left', offset: [16, -6] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 820,
    style: { colorRole: 'ink', emphasis: 'strong' },
    fade: 0.25,
  },

  // 그리드 · 카메라 단추 · 범례 · 제목 없음(기본). 축 눈금도 없다 — 재는 것이 거리가 아니라 모양이다.

  messages: waveFunctionMessages,
};
