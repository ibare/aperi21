// ========================================================================
// binding-energy-curve — 선언
// ========================================================================
// 질문: 핵에너지는 왜 가벼운 핵은 합쳐야, 무거운 핵은 쪼개야 나오는가.
//
// 답: 핵자당 결합 에너지 곡선은 수소에서 가파르게 올라 철-56 부근(약 8.8 MeV)에서
// 가장 높고, 무거운 쪽으로 천천히 내려간다. 핵이 곡선을 **오르면** 핵자 하나하나가
// 더 단단히 묶이고, 오른 높이만큼 에너지가 나온다. 그래서 철보다 가벼운 핵은
// **합쳐서(융합)**, 무거운 핵은 **쪼개서(분열)** 곡선을 오른다 — 두 길 모두 철을 향한다.
//
// 이웃 `stellar-nucleosynthesis` 는 같은 곡선을 ln(질량수) 축에 두고 별 안에서 융합이
// 한 칸씩 오르다 철에서 멈추는 것을 보인다. 이 조각은 **질량수 그대로의 축**에서
// 양쪽 두 길이 한 꼭짓점으로 모이는 것을 보인다. 분열 사건 자체는 `nuclear-fission` 몫.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:binding-energy-curve` 와 문자 그대로 일치한다 (C4). */
export const BINDING_ENERGY_CURVE_ID = 'binding-energy-curve';

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const bindingEnergyCurveMessages = Object.freeze({
  'label.title': { ko: '결합 에너지 곡선', en: 'Binding energy curve', ja: '結合エネルギー曲線', zh: '结合能曲线', ar: 'منحنى طاقة الربط', es: 'Curva de energía de enlace', fr: 'Courbe de l’énergie de liaison', hi: 'बंधन ऊर्जा वक्र', id: 'Kurva energi ikat', pt: 'Curva da energia de ligação' },
  'label.operation': { ko: '철에서 최대가 되는 이유', en: 'Why it peaks at iron', ja: '鉄で最大になる理由', zh: '为什么在铁处达到最高', ar: 'لماذا تبلغ ذروتها عند الحديد', es: 'Por qué alcanza su máximo en el hierro', fr: 'Pourquoi elle culmine au fer', hi: 'यह लोहे पर शिखर पर क्यों पहुँचता है', id: 'Mengapa puncaknya di besi', pt: 'Por que o pico está no ferro' },
  'label.stage': { ko: '안정한 핵종', en: 'Stable nuclides', ja: '安定な核種', zh: '稳定核素', ar: 'النويدات المستقرة', es: 'Núclidos estables', fr: 'Nucléides stables', hi: 'स्थायी न्यूक्लाइड', id: 'Nuklida stabil', pt: 'Nuclídeos estáveis' },
  'label.view': { ko: '융합과 분열', en: 'Fusion and fission', ja: '核融合と核分裂', zh: '聚变与裂变', ar: 'الاندماج والانشطار', es: 'Fusión y fisión', fr: 'Fusion et fission', hi: 'संलयन और विखंडन', id: 'Fusi dan fisi', pt: 'Fusão e fissão' },

  /** 곡선 축 이름. 조사가 붙거나 어순이 갈리는 말이라 문안이다 (C1 판정 4). */
  'label.axisBinding': { ko: '핵자당 결합 에너지', en: 'Binding energy per nucleon', ja: '核子あたりの結合エネルギー', zh: '比结合能', ar: 'طاقة الربط لكل نيوكليون', es: 'Energía de enlace por nucleón', fr: 'Énergie de liaison par nucléon', hi: 'प्रति न्यूक्लिऑन बंधन ऊर्जा', id: 'Energi ikat per nukleon', pt: 'Energia de ligação por núcleon' },
  'label.axisMass': { ko: '질량수 A →', en: 'Mass number A →', ja: '質量数 A →', zh: '质量数 A →', ar: 'العدد الكتلي A →', es: 'Número másico A →', fr: 'Nombre de masse A →', hi: 'द्रव्यमान संख्या A →', id: 'Nomor massa A →', pt: 'Número de massa A →' },
  /** 오른 높이 화살표에 붙는 말 — 나오는 에너지. */
  'label.energy': { ko: '에너지', en: 'energy', ja: 'エネルギー', zh: '能量', ar: 'الطاقة', es: 'energía', fr: 'énergie', hi: 'ऊर्जा', id: 'energi', pt: 'energia' },
  /** 두 길의 이름. */
  'label.fusion': { ko: '융합', en: 'fusion', ja: '核融合', zh: '聚变', ar: 'اندماج', es: 'fusión', fr: 'fusion', hi: 'संलयन', id: 'fusi', pt: 'fusão' },
  'label.fission': { ko: '분열', en: 'fission', ja: '核分裂', zh: '裂变', ar: 'انشطار', es: 'fisión', fr: 'fission', hi: 'विखंडन', id: 'fisi', pt: 'fissão' },
  /** 꼭짓점 높이 — 선언된 정박값을 그대로 끼운다 (S-piece 유효숫자). */
  'label.peak': { ko: '약 {e} MeV', en: '≈ {e} MeV', ja: '≈ {e} MeV', zh: '≈ {e} MeV', ar: '≈ {e} MeV', es: '≈ {e} MeV', fr: '≈ {e} MeV', hi: '≈ {e} MeV', id: '≈ {e} MeV', pt: '≈ {e} MeV' },
  /** 핵종 표기의 질량수 자리. 수 하나를 그대로 띄운다 — 표식이다 (C1 판정 3). */
  'label.value': { ko: '{v}', en: '{v}', ja: '{v}', zh: '{v}', ar: '{v}', es: '{v}', fr: '{v}', hi: '{v}', id: '{v}', pt: '{v}' },

  /** 원소 기호. 원어로 통용되는 표식이지만 저작자가 바꿀 수 있게 키로 둔다. */
  'symbol.H': { ko: 'H', en: 'H', ja: 'H', zh: 'H', ar: 'H', es: 'H', fr: 'H', hi: 'H', id: 'H', pt: 'H' },
  'symbol.He': { ko: 'He', en: 'He', ja: 'He', zh: 'He', ar: 'He', es: 'He', fr: 'He', hi: 'He', id: 'He', pt: 'He' },
  'symbol.Fe': { ko: 'Fe', en: 'Fe', ja: 'Fe', zh: 'Fe', ar: 'Fe', es: 'Fe', fr: 'Fe', hi: 'Fe', id: 'Fe', pt: 'Fe' },
  'symbol.Kr': { ko: 'Kr', en: 'Kr', ja: 'Kr', zh: 'Kr', ar: 'Kr', es: 'Kr', fr: 'Kr', hi: 'Kr', id: 'Kr', pt: 'Kr' },
  'symbol.Ba': { ko: 'Ba', en: 'Ba', ja: 'Ba', zh: 'Ba', ar: 'Ba', es: 'Ba', fr: 'Ba', hi: 'Ba', id: 'Ba', pt: 'Ba' },
  'symbol.U': { ko: 'U', en: 'U', ja: 'U', zh: 'U', ar: 'U', es: 'U', fr: 'U', hi: 'U', id: 'U', pt: 'U' },

  'caption.fuse': {
    ko: '가벼운 핵은 합쳐서 오른다 — 수소 넷이 헬륨 하나가 되며 곡선을 크게 오르고, 오른 만큼 에너지가 나온다.',
    en: 'Light nuclei climb by joining — four hydrogens become one helium, a big step up the curve, and the height gained comes out as energy.',
    ja: '軽い原子核は合わさって上る — 水素四つがヘリウム一つになって曲線を大きく上り、上った分がエネルギーとして出てくる。',
    zh: '轻核靠结合向上攀升 — 四个氢核变成一个氦核，沿曲线大幅上升，升高的部分以能量的形式释放出来。',
    ar: 'تصعد النوى الخفيفة بالاتحاد — تصير أربع نوى هيدروجين نواة هيليوم واحدة، فتصعد خطوة كبيرة على المنحنى، ويخرج الارتفاع المكتسب طاقةً.',
    es: 'Los núcleos ligeros suben uniéndose — cuatro hidrógenos se vuelven un helio, un gran escalón en la curva, y la altura ganada sale como energía.',
    fr: 'Les noyaux légers montent en s’unissant — quatre hydrogènes deviennent un hélium, une grande marche sur la courbe, et la hauteur gagnée sort sous forme d’énergie.',
    hi: 'हल्के नाभिक जुड़कर ऊपर चढ़ते हैं — चार हाइड्रोजन एक हीलियम बन जाते हैं, वक्र पर एक बड़ी छलांग, और जितनी ऊँचाई बढ़ी उतनी ऊर्जा निकलती है।',
    id: 'Inti ringan naik dengan bergabung — empat hidrogen menjadi satu helium, langkah besar menaiki kurva, dan ketinggian yang diperoleh keluar sebagai energi.',
    pt: 'Núcleos leves sobem se unindo — quatro hidrogênios viram um hélio, um grande degrau na curva, e a altura ganha sai como energia.',
  },
  'caption.fission': {
    ko: '무거운 핵은 쪼개서 오른다 — 우라늄-235 가 바륨과 크립톤으로 갈라지며 곡선을 조금 오른다.',
    en: 'Heavy nuclei climb by splitting — uranium-235 breaks into barium and krypton, a small step up the curve.',
    ja: '重い原子核は分かれて上る — ウラン235 がバリウムとクリプトンに分かれ、曲線を少し上る。',
    zh: '重核靠分裂向上攀升 — 铀-235 分裂成钡和氪，沿曲线小幅上升。',
    ar: 'تصعد النوى الثقيلة بالانقسام — ينشطر اليورانيوم-235 إلى باريوم وكريبتون، فيصعد خطوة صغيرة على المنحنى.',
    es: 'Los núcleos pesados suben dividiéndose — el uranio-235 se parte en bario y kriptón, un pequeño escalón en la curva.',
    fr: 'Les noyaux lourds montent en se scindant — l’uranium 235 se brise en baryum et krypton, une petite marche sur la courbe.',
    hi: 'भारी नाभिक टूटकर ऊपर चढ़ते हैं — यूरेनियम-235 बेरियम और क्रिप्टॉन में टूटता है, वक्र पर एक छोटी छलांग।',
    id: 'Inti berat naik dengan membelah — uranium-235 terbelah menjadi barium dan kripton, langkah kecil menaiki kurva.',
    pt: 'Núcleos pesados sobem se dividindo — o urânio-235 se parte em bário e criptônio, um pequeno degrau na curva.',
  },
  'caption.meet': {
    ko: '두 길 모두 꼭대기 철-56 을 향한다 — 철은 합쳐도 쪼개도 더 오를 곳이 없다.',
    en: 'Both roads lead to the summit, iron-56 — from iron, neither joining nor splitting climbs any higher.',
    ja: 'どちらの道も頂上の鉄56 に向かう — 鉄からは、合わさっても分かれてもそれ以上は上れない。',
    zh: '两条路都通向顶峰铁-56 — 从铁出发，无论结合还是分裂都无法再升高。',
    ar: 'يقود الطريقان كلاهما إلى القمة، الحديد-56 — فمن الحديد لا يرفع الاتحاد ولا الانقسام أعلى من ذلك.',
    es: 'Ambos caminos llevan a la cima, el hierro-56 — desde el hierro, ni unirse ni dividirse sube más.',
    fr: 'Les deux chemins mènent au sommet, le fer 56 — à partir du fer, ni s’unir ni se scinder ne fait monter plus haut.',
    hi: 'दोनों रास्ते शिखर लोहा-56 की ओर जाते हैं — लोहे से न जुड़कर, न टूटकर और ऊपर चढ़ा जा सकता है।',
    id: 'Kedua jalan menuju puncak, besi-56 — dari besi, baik bergabung maupun membelah tidak bisa naik lebih tinggi lagi.',
    pt: 'Os dois caminhos levam ao cume, o ferro-56 — a partir do ferro, nem unir nem dividir sobe mais.',
  },
} satisfies Record<string, LocalizedText>);

export type BindingEnergyCurveMessageKey = keyof typeof bindingEnergyCurveMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: BindingEnergyCurveMessageKey): LocalizedText => bindingEnergyCurveMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: BindingEnergyCurveMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// 물리 — 핵종별 핵자당 결합 에너지(MeV). 스테이지 상수의 기본값이다 (원칙 2).
// ------------------------------------------------------------------------

export interface NuclideDef {
  /** 핵종 id — 스테이지 상수 키(`binding.<id>`)의 꼬리. */
  id: string;
  /** 질량수 A. 핵종의 정의라 조정할 값이 아니다. */
  massNumber: number;
  /** 핵자당 결합 에너지 기본값(MeV). 스테이지 상수가 이긴다. */
  binding: number;
  /** 곡선을 이루는 안정한 핵종이면 true. 분열 조각(중성자가 많아 불안정)은 곡선에 넣지 않는다. */
  onCurve: boolean;
}

/**
 * 핵종 표. 값은 원자 질량 평가(AME)의 핵자당 결합 에너지를 소수 셋째 자리까지 옮겼다.
 *
 * 가벼운 쪽은 곡선이 톱니처럼 튀는 자리(He-4 · C-12 · O-16)를 그대로 담고, 무거운 쪽은
 * 안정한 핵종을 띄엄띄엄 고른 표본이다. 꼭대기는 사실 Ni-62(8.795)이고 Fe-56(8.790)과의
 * 차이는 화면에서 1 px 도 안 된다.
 *
 * 분열 조각 Ba-141 · Kr-92 는 중성자가 많아 곡선(안정한 핵종)보다 조금 아래에 있다 —
 * 곡선에는 넣지 않고 점만 찍는다.
 *
 * 줄 수 · 질량수는 코드에 남는다 — 목록을 선언할 자리가 없다 (장부 G105).
 */
export const NUCLIDES: readonly NuclideDef[] = [
  { id: 'H1', massNumber: 1, binding: 0, onCurve: true },
  { id: 'H2', massNumber: 2, binding: 1.112, onCurve: true },
  { id: 'He3', massNumber: 3, binding: 2.573, onCurve: true },
  { id: 'He4', massNumber: 4, binding: 7.074, onCurve: true },
  { id: 'Li6', massNumber: 6, binding: 5.332, onCurve: true },
  { id: 'Li7', massNumber: 7, binding: 5.606, onCurve: true },
  { id: 'Be9', massNumber: 9, binding: 6.463, onCurve: true },
  { id: 'B11', massNumber: 11, binding: 6.928, onCurve: true },
  { id: 'C12', massNumber: 12, binding: 7.68, onCurve: true },
  { id: 'N14', massNumber: 14, binding: 7.476, onCurve: true },
  { id: 'O16', massNumber: 16, binding: 7.976, onCurve: true },
  { id: 'Ne20', massNumber: 20, binding: 8.032, onCurve: true },
  { id: 'Mg24', massNumber: 24, binding: 8.261, onCurve: true },
  { id: 'Si28', massNumber: 28, binding: 8.448, onCurve: true },
  { id: 'S32', massNumber: 32, binding: 8.493, onCurve: true },
  { id: 'Ca40', massNumber: 40, binding: 8.551, onCurve: true },
  { id: 'Ti48', massNumber: 48, binding: 8.723, onCurve: true },
  { id: 'Fe56', massNumber: 56, binding: 8.79, onCurve: true },
  { id: 'Ni62', massNumber: 62, binding: 8.795, onCurve: true },
  { id: 'Zn64', massNumber: 64, binding: 8.736, onCurve: true },
  { id: 'Kr84', massNumber: 84, binding: 8.717, onCurve: true },
  { id: 'Zr90', massNumber: 90, binding: 8.71, onCurve: true },
  { id: 'Mo98', massNumber: 98, binding: 8.635, onCurve: true },
  { id: 'Sn120', massNumber: 120, binding: 8.505, onCurve: true },
  { id: 'Xe132', massNumber: 132, binding: 8.428, onCurve: true },
  { id: 'Ba138', massNumber: 138, binding: 8.393, onCurve: true },
  { id: 'Gd158', massNumber: 158, binding: 8.202, onCurve: true },
  { id: 'Er166', massNumber: 166, binding: 8.142, onCurve: true },
  { id: 'W184', massNumber: 184, binding: 8.005, onCurve: true },
  { id: 'Pt194', massNumber: 194, binding: 7.936, onCurve: true },
  { id: 'Pb208', massNumber: 208, binding: 7.868, onCurve: true },
  { id: 'Th232', massNumber: 232, binding: 7.615, onCurve: true },
  { id: 'U235', massNumber: 235, binding: 7.591, onCurve: true },
  { id: 'U238', massNumber: 238, binding: 7.57, onCurve: true },
  { id: 'Kr92', massNumber: 92, binding: 8.513, onCurve: false },
  { id: 'Ba141', massNumber: 141, binding: 8.326, onCurve: false },
];

/** 스테이지 상수 키. 핵종마다 하나 — 목록 상수가 없어 이름으로 흩는다 (장부 G105). */
export function bindingKey(id: string): string {
  return `binding.${id}`;
}

/** 이름표를 붙이는 핵종 — 표의 id · 기호 문안 키 · 이름표 자리(화면 px 띄움). */
export interface NotationDef {
  nuclide: string;
  symbol: BindingEnergyCurveMessageKey;
  offset: readonly [number, number];
}

/** 두 길이 지나는 핵종. 반응의 정의라 스테이지 상수로 올리지 않는다(표의 id 를 가리킨다). */
export const FUSION_FROM = 'H1';
export const FUSION_TO = 'He4';
export const FISSION_FROM = 'U235';
export const FISSION_TO = ['Ba141', 'Kr92'] as const;
/** 꼭짓점 — 철-56. */
export const PEAK = 'Fe56';

/**
 * 이름표. 자리는 점에서 띄운 화면 px — 곡선 · 화살표 · 다른 이름표를 피해 고른 배치다.
 * 분열 조각은 곡선 바로 아래 · 오른 높이 화살표 위에 있어 이름표를 점 왼쪽에 둔다.
 */
export const NOTATIONS: readonly NotationDef[] = [
  { nuclide: 'H1', symbol: 'symbol.H', offset: [14, -4] },
  { nuclide: 'He4', symbol: 'symbol.He', offset: [-28, -2] },
  { nuclide: 'Fe56', symbol: 'symbol.Fe', offset: [-6, -16] },
  { nuclide: 'Kr92', symbol: 'symbol.Kr', offset: [-30, 2] },
  { nuclide: 'Ba141', symbol: 'symbol.Ba', offset: [-32, 2] },
  { nuclide: 'U235', symbol: 'symbol.U', offset: [-6, 22] },
];

/** 수소 몇 개가 합쳐 헬륨 하나가 되는가. 4 × 1 = 4 로 질량수가 맞아야 한다. */
export const FUSE_COUNT = 4;
/** 꼭짓점 높이 — 화면에 그대로 띄우는 정박값(MeV). 표의 Fe-56 값을 반올림해 계산하지 않는다. */
export const PEAK_MEV = 8.8;

// ------------------------------------------------------------------------
// 배치 — 월드 단위는 임의. 원점은 질량수 0 · 결합 에너지 0.
// ------------------------------------------------------------------------

export const PLOT = {
  /** 질량수 하나의 가로 길이(월드). 질량수 그대로의 축 — 가파른 오르막과 긴 내리막이 참 모양이다. */
  perA: 0.046,
  /** 1 MeV 의 세로 길이(월드). */
  perMeV: 0.5,
  /** 세로축의 가로 자리(월드) — 수소 알갱이가 모이는 자리와 떼어 둔다. */
  axisX: -0.55,
  /** 축 끝 — 세로축 높이(MeV) · 가로축 끝(질량수). */
  axisTopMeV: 9.6,
  axisEndA: 250,
} as const;

/** 수소 알갱이가 모여들기 전에 흩어져 있는 반지름(월드). */
export const GATHER_RADIUS = 0.42;
/**
 * 두 길 화살표가 곡선 아래로 떨어진 거리(월드)와, 그 화살표의 양 끝 질량수. 곡선 바로 아래는
 * 분열 조각 · 이름표가 몰려 있어 비어 있는 곡선 밑 넓은 자리로 내렸다.
 */
export const WAY_DROP = 1.1;
export const FUSION_WAY_A = [12, 46] as const;
export const FISSION_WAY_A = [222, 74] as const;

/**
 * 고정 경계. 곡선 전체와 축 이름 · 이름표가 들어가게 처음부터 잡는다 (원칙 6). 아래로 캡션
 * 두 줄 자리를 더 잡는다 — 캡션 슬롯은 프레이밍 여백으로 잡히지 않는다 (장부 G24).
 */
export const SCENE_BOUNDS = { minX: -1.1, maxX: 12.2, minY: -1.3, maxY: 5.2 } as const;

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const bindingEnergyCurveSchema: BundleSchema = {
  id: BINDING_ENERGY_CURVE_ID,
  label: text('label.title'),
  category: 'modern',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다. 곡선은 자연이 정한 것이라 끌어 바꾸면 거짓 곡선이 된다.
  parameters: [],
  stages: [
    {
      id: 'stable-nuclides',
      label: text('label.stage'),
      constants: {
        ...Object.fromEntries(NUCLIDES.map((n) => [bindingKey(n.id), n.binding])),
        fuseCount: FUSE_COUNT,
        peakMeV: PEAK_MEV,
      },
    },
  ],
  environments: [],
  views: [{ id: 'fusion-and-fission', label: text('label.view'), default: true }],

  /**
   * 가로로 넓다 — 질량수 축이 길다. 세로를 기본보다 조금 더 쓴다: 곡선 윗부분(7.5 ~ 8.8 MeV)에
   * 꼭짓점 · 분열 조각 · 오른 높이 화살표가 몰려 360 에서는 분열의 오름이 20 px 에 그쳤다.
   */
  canvas: { height: 420, minHeight: 360 },

  /** 쓴 순서대로 겹친다 — 축 · 곡선 위에 화살표, 그 위에 핵 점과 글자. */
  drawOrder: 'scene',

  /** 도착한 순간 수소 알갱이가 이미 모여드는 중이다 (S-piece). */
  startAt: 0.15,

  /**
   * 한 주기 — 10.8 초.
   *
   * - `gather` — 흩어진 수소 넷이 ¹H 자리로 모여 하나가 된다.
   * - `fuse` — 합쳐진 핵이 ⁴He 자리로 곡선을 오르고, 옆에서 강조색 화살표가 오른 높이만큼 자란다.
   * - `fuse-way` — 곡선 아래에 철 쪽을 가리키는 「융합」 화살표가 자란다.
   * - `split` — ²³⁵U 점이 두 점으로 갈라진다.
   * - `fission` — 두 점이 ¹⁴¹Ba · ⁹²Kr 자리로 곡선을 오르고, 강조색 화살표가 오른 높이만큼 자란다.
   * - `fission-way` — 곡선 아래에 철 쪽을 가리키는 「분열」 화살표가 자란다.
   * - `meet` — 철의 자리에 세로 점선이 서고 꼭짓점 높이가 뜬다. 두 길이 거기서 만난다.
   * - `clear` — 점 · 화살표가 물러난다.
   * - `renew` — 다음 주기의 수소 넷과 우라늄이 제자리에 선다.
   */
  timeline: {
    phases: [
      { id: 'gather', duration: 1.1, ease: 'smooth', caption: key('caption.fuse') },
      { id: 'fuse', duration: 1.8, ease: 'smooth', caption: key('caption.fuse') },
      { id: 'fuse-way', duration: 0.9, ease: 'smooth', caption: key('caption.fuse') },
      { id: 'split', duration: 0.7, ease: 'smooth', caption: key('caption.fission') },
      { id: 'fission', duration: 1.8, ease: 'smooth', caption: key('caption.fission') },
      { id: 'fission-way', duration: 0.9, ease: 'smooth', caption: key('caption.fission') },
      { id: 'meet', duration: 2.4, ease: 'smooth', caption: key('caption.meet') },
      { id: 'clear', duration: 0.6, caption: key('caption.meet') },
      { id: 'renew', duration: 0.6, caption: key('caption.fuse') },
    ],
  },

  /** 슬롯 하나. 값이 끼지 않는 문장뿐이다. */
  caption: {
    anchor: { screen: 'bottom-left', offset: [4, -4] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 820,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  // 그리드 · 카메라 단추 · 제목 · 범례 없음(기본). 읽을 것은 값이 아니라 오르막과 꼭대기다 (S-piece).

  messages: bindingEnergyCurveMessages,
};
