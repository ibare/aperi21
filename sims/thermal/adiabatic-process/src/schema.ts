// ========================================================================
// adiabatic-process — 선언
// ========================================================================
// 질문: 열이 드나들 길을 막고 기체를 부풀리면, 압력과 온도는 어떻게 되나.
//
// 단열재로 감싼 실린더의 피스톤이 올라가 부피가 두 배가 된다. 그동안 온도계가 내려가고
// 분자의 자취가 짧아진다(느려진다). 옆 P–V 그림에는 같은 처음 상태에서 출발하는 두 곡선이
// 있다 — 온도를 붙든 곡선(점선, 빈 점)과 단열 곡선(실선, 찬 점). 두 점이 같은 부피로 함께
// 가는데 찬 점이 더 가파르게 떨어져, 두 배 부피에서 빈 점은 0.5P₁, 찬 점은 0.315P₁ 에 닿는다.
//
// 이웃 `isothermal-process` 는 항온조에서 들어온 열이 모두 일로 나가는 것을 말한다. 이
// 조각은 열 알갱이 · 더미를 두지 않는다 — 들어오는 열이 없다는 것이 요점이라, 그 자리를
// 단열재와 내려가는 온도계가 맡는다. 두 곡선은 색이 아니라 선 모양으로 가른다 (S-piece).
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:adiabatic-process` 와 문자 그대로 일치한다 (C4). */
export const ADIABATIC_PROCESS_ID = 'adiabatic-process';

// ------------------------------------------------------------------------
// 물리 · 표시 배율 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 압력 · 부피는 처음 값을 1 로 한 비다(처음 P = 1, 처음 V = 1).
// ------------------------------------------------------------------------

/** 비열비 γ — 단원자 이상 기체. */
export const GAMMA = 5 / 3;
/** 처음 온도(K). 화면에 그대로 뜬다. */
export const T_START = 300;
/** 끝 부피 ÷ 처음 부피. 화면에 그대로 뜬다(`2V₁`). */
export const EXPANSION = 2;

/**
 * 화면에 띄우는 정박값 — 두 배 부피에서의 끝 온도(K) · 두 곡선이 닿는 압력 비.
 * 계산값(188.99… · 0.5 · 0.3149…)을 반올림해 띄우지 않고 선언한 글자를 쓴다 (S-piece 유효숫자).
 * γ · k · 처음 온도를 바꾸면 함께 고친다 (장부 G143).
 */
export const T_END_SHOWN = 189;
export const P_ISO_END_SHOWN = 0.5;
export const P_ADIA_END_SHOWN = 0.315;

/** 온도계 눈금의 아래 · 위 끝(K). 채움 높이는 이 사이의 몫이다. */
export const THERMO_T_MIN = 120;
export const THERMO_T_MAX = 330;

/** 분자 배치를 뽑는 시드와 분자 수. 분자는 작은 배경이다. */
export const MOLECULE_SEED = 11;
export const MOLECULE_COUNT = 22;
/** 처음 상태에서 분자가 상자를 한 번 오가는 빈도의 범위(회/초). */
export const MOLECULE_RATE_MIN = 0.22;
export const MOLECULE_RATE_MAX = 0.45;

/** 표시 배율 — 처음 부피(비 1)에서 기체 기둥의 높이(월드). */
export const WORLD_PER_VOLUME = 0.9;
/** 표시 배율 — P–V 그림의 V 축(부피 비 1 의 길이) · P 축(압력 비 1 의 높이), 월드. */
export const GRAPH_WORLD_PER_VOLUME = 1.4;
export const GRAPH_WORLD_PER_PRESSURE = 1.95;
/** P–V 그림이 보이는 범위 — 처음 값을 1 로 한 비. 두 곡선은 이 부피 범위에서 표본한다. */
export const GRAPH_V_MIN = 0.86;
export const GRAPH_V_MAX = 2.35;
export const GRAPH_P_MAX = 1.18;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 실린더는 세워져 있고 피스톤이 위로 올라간다.
// ------------------------------------------------------------------------

/** 실린더 안쪽. 위 벽 끝은 배율 · 부피 비에서 정한다. */
export const CYLINDER = { left: 0, right: 1.5, bottom: 0 } as const;
/** 단열재 두께(월드) — 두 옆 벽 바깥과 바닥 아래를 감싼다. */
export const INSULATION = 0.2;
/** 피스톤 두께(월드). */
export const PISTON_THICKNESS = 0.16;
/** 위 벽이 가장 높이 오른 피스톤 위로 남는 여유(월드). */
export const WALL_HEADROOM = 0.1;

/** 온도계 — 관 가운데 x, 관 아래 · 위 끝 y, 관 폭, 알뿌리 반지름(월드). 실린더 왼쪽에 선다. */
export const THERMO = { x: -0.62, bottom: 0.12, top: 1.95, width: 0.13, bulb: 0.12 } as const;

/** P–V 그림의 원점(월드). V 는 오른쪽, P 는 위. */
export const GRAPH_ORIGIN = [2.75, 0] as const;

/**
 * 프레이밍은 주장의 일부다. 가로는 온도계 눈금 글자부터 곡선 이름표까지, 세로는 위 벽 ·
 * P 축 끝부터 단열재 이름표 · 캡션 줄까지. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -1.55, maxX: 6.95, minY: -0.8, maxY: 2.55 } as const;

// ------------------------------------------------------------------------
// 문안 (C1)
// ------------------------------------------------------------------------

export const adiabaticProcessMessages = Object.freeze({
  'label.title': {
    ko: '단열 과정',
    en: 'Adiabatic process',
    ja: '断熱過程',
    zh: '绝热过程',
    ar: 'العملية الأديباتية',
    es: 'Proceso adiabático',
    fr: 'Transformation adiabatique',
    hi: 'रुद्धोष्म प्रक्रम',
    id: 'Proses adiabatik',
    pt: 'Processo adiabático',
  },
  'label.operation': {
    ko: '열 출입이 없는 변화',
    en: 'A change with no heat in or out',
    ja: '熱の出入りがない変化',
    zh: '没有热量进出的变化',
    ar: 'تغيّر لا تدخل فيه حرارة ولا تخرج',
    es: 'Un cambio sin entrada ni salida de calor',
    fr: 'Une transformation sans chaleur qui entre ni qui sort',
    hi: 'ऐसा परिवर्तन जिसमें ऊष्मा न अंदर आती है न बाहर जाती है',
    id: 'Perubahan tanpa kalor yang masuk atau keluar',
    pt: 'Uma mudança sem calor entrando nem saindo',
  },
  'label.stage': {
    ko: '단열재로 감싼 실린더',
    en: 'Insulated cylinder',
    ja: '断熱材で包んだシリンダー',
    zh: '包着绝热材料的气缸',
    ar: 'أسطوانة معزولة',
    es: 'Cilindro aislado',
    fr: 'Cylindre isolé',
    hi: 'ऊष्मारोधी सिलिंडर',
    id: 'Silinder berinsulasi',
    pt: 'Cilindro isolado',
  },
  'label.view': {
    ko: '실린더와 P–V 그림',
    en: 'Cylinder and P–V diagram',
    ja: 'シリンダーと P–V 図',
    zh: '气缸与 P–V 图',
    ar: 'الأسطوانة ومخطط P–V',
    es: 'Cilindro y diagrama P–V',
    fr: 'Cylindre et diagramme P–V',
    hi: 'सिलिंडर और P–V आरेख',
    id: 'Silinder dan diagram P–V',
    pt: 'Cilindro e diagrama P–V',
  },

  /** 축 이름 · 눈금 표식. 물리 기호라 번역하지 않는다 (C1 판정 3). */
  'label.pressure': { ko: 'P', en: 'P', ja: 'P', zh: 'P', ar: 'P', es: 'P', fr: 'P', hi: 'P', id: 'P', pt: 'P' },
  'label.volume': { ko: 'V', en: 'V', ja: 'V', zh: 'V', ar: 'V', es: 'V', fr: 'V', hi: 'V', id: 'V', pt: 'V' },
  'label.volumeStart': {
    ko: 'V₁',
    en: 'V₁',
    ja: 'V₁',
    zh: 'V₁',
    ar: 'V₁',
    es: 'V₁',
    fr: 'V₁',
    hi: 'V₁',
    id: 'V₁',
    pt: 'V₁',
  },
  'label.pressureStart': {
    ko: 'P₁',
    en: 'P₁',
    ja: 'P₁',
    zh: 'P₁',
    ar: 'P₁',
    es: 'P₁',
    fr: 'P₁',
    hi: 'P₁',
    id: 'P₁',
    pt: 'P₁',
  },
  /** 값이 끼는 눈금 — 배수 · 압력 비는 스테이지 상수를 그대로 끼운다. */
  'label.volumeEnd': {
    ko: '{k}V₁',
    en: '{k}V₁',
    ja: '{k}V₁',
    zh: '{k}V₁',
    ar: '{k}V₁',
    es: '{k}V₁',
    fr: '{k}V₁',
    hi: '{k}V₁',
    id: '{k}V₁',
    pt: '{k}V₁',
  },
  'label.pressureEnd': {
    ko: '{p}P₁',
    en: '{p}P₁',
    ja: '{p}P₁',
    zh: '{p}P₁',
    ar: '{p}P₁',
    es: '{p}P₁',
    fr: '{p}P₁',
    hi: '{p}P₁',
    id: '{p}P₁',
    pt: '{p}P₁',
  },
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
  /** 곡선 이름표 · 단열재 이름표. 낱말이라 문안이다. */
  'label.isotherm': {
    ko: '등온',
    en: 'isothermal',
    ja: '等温',
    zh: '等温',
    ar: 'متساوي الحرارة',
    es: 'isotérmico',
    fr: 'isotherme',
    hi: 'समतापी',
    id: 'isotermal',
    pt: 'isotérmico',
  },
  'label.adiabat': {
    ko: '단열',
    en: 'adiabatic',
    ja: '断熱',
    zh: '绝热',
    ar: 'أديباتي',
    es: 'adiabático',
    fr: 'adiabatique',
    hi: 'रुद्धोष्म',
    id: 'adiabatik',
    pt: 'adiabático',
  },
  'label.insulation': {
    ko: '단열재',
    en: 'insulation',
    ja: '断熱材',
    zh: '绝热材料',
    ar: 'عازل حراري',
    es: 'aislante',
    fr: 'isolant',
    hi: 'ऊष्मारोधी',
    id: 'isolator',
    pt: 'isolante',
  },

  'caption.start': {
    ko: '단열재로 감싼 실린더 속 기체 {t0} K — 열이 드나들 길이 막혀 있다',
    en: 'Gas at {t0} K in a cylinder wrapped in insulation — heat has no way in or out',
    ja: '断熱材で包んだシリンダーの中の {t0} K の気体 — 熱が出入りする道はふさがれている',
    zh: '包着绝热材料的气缸里有 {t0} K 的气体 — 热量没有进出的通路',
    ar: 'غاز عند {t0} K في أسطوانة ملفوفة بعازل حراري — لا سبيل للحرارة إلى الدخول أو الخروج',
    es: 'Gas a {t0} K en un cilindro envuelto en aislante — el calor no tiene por dónde entrar ni salir',
    fr: 'Un gaz à {t0} K dans un cylindre enveloppé d’isolant — la chaleur n’a aucun moyen d’entrer ni de sortir',
    hi: 'ऊष्मारोधी से लिपटे सिलिंडर में {t0} K पर गैस — ऊष्मा के अंदर आने या बाहर जाने का कोई रास्ता नहीं',
    id: 'Gas bersuhu {t0} K dalam silinder yang dibungkus isolator — kalor tidak punya jalan masuk atau keluar',
    pt: 'Gás a {t0} K num cilindro envolto em isolante — o calor não tem por onde entrar nem sair',
  },
  'caption.expand': {
    ko: '피스톤이 올라가는 동안 온도계가 내려가고 분자가 느려진다 — 찬 점이 등온 곡선의 빈 점보다 가파르게 떨어진다',
    en: 'As the piston rises the thermometer falls and the molecules slow down — the filled dot drops more steeply than the open dot on the isothermal curve',
    ja: 'ピストンが上がる間に温度計が下がり、分子が遅くなる — 塗りつぶした点が等温曲線上の白抜きの点より急に下がる',
    zh: '活塞上升时温度计下降，分子变慢 — 实心点比等温曲线上的空心点下降得更陡',
    ar: 'بينما يرتفع المكبس ينخفض مقياس الحرارة وتتباطأ الجزيئات — تهبط النقطة المصمتة بانحدار أشد من النقطة المفرغة على منحنى تساوي الحرارة',
    es: 'Mientras el pistón sube, el termómetro baja y las moléculas se frenan — el punto relleno cae con más pendiente que el punto hueco de la curva isotérmica',
    fr: 'Pendant que le piston monte, le thermomètre baisse et les molécules ralentissent — le point plein chute plus fortement que le point creux sur l’isotherme',
    hi: 'पिस्टन के ऊपर उठते समय तापमापी नीचे गिरता है और अणु धीमे पड़ते हैं — भरा बिंदु समतापी वक्र के खाली बिंदु से अधिक तेज़ी से नीचे गिरता है',
    id: 'Saat piston naik, termometer turun dan molekul melambat — titik penuh turun lebih curam daripada titik kosong pada kurva isotermal',
    pt: 'Enquanto o pistão sobe, o termômetro cai e as moléculas ficam mais lentas — o ponto cheio desce mais íngreme que o ponto vazado na curva isotérmica',
  },
  'caption.hold': {
    ko: '부피 {k}배 — 등온 곡선은 {pIso}P₁, 단열 곡선은 {pAdia}P₁ 에 닿았고 온도계는 {t1} K',
    en: 'Volume ×{k} — the isothermal curve reaches {pIso}P₁, the adiabatic curve {pAdia}P₁, and the thermometer reads {t1} K',
    ja: '体積 ×{k} — 等温曲線は {pIso}P₁、断熱曲線は {pAdia}P₁ に達し、温度計は {t1} K',
    zh: '体积 ×{k} — 等温曲线到达 {pIso}P₁，绝热曲线到达 {pAdia}P₁，温度计读数为 {t1} K',
    ar: 'الحجم ×{k} — يبلغ منحنى تساوي الحرارة {pIso}P₁، والمنحنى الأديباتي {pAdia}P₁، ويقرأ مقياس الحرارة {t1} K',
    es: 'Volumen ×{k} — la curva isotérmica llega a {pIso}P₁, la adiabática a {pAdia}P₁, y el termómetro marca {t1} K',
    fr: 'Volume ×{k} — l’isotherme atteint {pIso}P₁, l’adiabatique {pAdia}P₁, et le thermomètre indique {t1} K',
    hi: 'आयतन ×{k} — समतापी वक्र {pIso}P₁ तक, रुद्धोष्म वक्र {pAdia}P₁ तक पहुँचा, और तापमापी {t1} K दिखाता है',
    id: 'Volume ×{k} — kurva isotermal mencapai {pIso}P₁, kurva adiabatik {pAdia}P₁, dan termometer menunjukkan {t1} K',
    pt: 'Volume ×{k} — a curva isotérmica chega a {pIso}P₁, a adiabática a {pAdia}P₁, e o termômetro marca {t1} K',
  },
  'caption.reset': {
    ko: '처음 자리로 되돌린다',
    en: 'Back to the start',
    ja: '最初の位置に戻す',
    zh: '回到起点',
    ar: 'العودة إلى البداية',
    es: 'De vuelta al inicio',
    fr: 'Retour au départ',
    hi: 'वापस आरंभ पर',
    id: 'Kembali ke awal',
    pt: 'De volta ao início',
  },
} satisfies Record<string, LocalizedText>);

export type AdiabaticProcessMessageKey = keyof typeof adiabaticProcessMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: AdiabaticProcessMessageKey): LocalizedText => adiabaticProcessMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: AdiabaticProcessMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const adiabaticProcessSchema: BundleSchema = {
  id: ADIABATIC_PROCESS_ID,
  label: text('label.title'),
  category: 'thermal',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 피스톤이 오르고, 온도계가 내려가고, 두 점이 갈라진다.
  parameters: [],

  stages: [
    {
      id: 'insulated',
      label: text('label.stage'),
      constants: {
        gamma: GAMMA,
        t0: T_START,
        k: EXPANSION,
        tEndShown: T_END_SHOWN,
        pIsoEndShown: P_ISO_END_SHOWN,
        pAdiaEndShown: P_ADIA_END_SHOWN,
        thermoTMin: THERMO_T_MIN,
        thermoTMax: THERMO_T_MAX,
        seed: MOLECULE_SEED,
        molecules: MOLECULE_COUNT,
        rateMin: MOLECULE_RATE_MIN,
        rateMax: MOLECULE_RATE_MAX,
        worldPerVolume: WORLD_PER_VOLUME,
        graphWorldPerVolume: GRAPH_WORLD_PER_VOLUME,
        graphWorldPerPressure: GRAPH_WORLD_PER_PRESSURE,
        graphVMin: GRAPH_V_MIN,
        graphVMax: GRAPH_V_MAX,
        graphPMax: GRAPH_P_MAX,
      },
    },
  ],

  environments: [],

  views: [{ id: 'insulated', label: text('label.view'), default: true }],

  // 가로로 긴 장치 + P–V 그림. 세로를 더 주면 가로가 먼저 차서 그림만 작아진다.
  canvas: { height: 360, minHeight: 320 },

  /**
   * 겹침 순서를 scene 이 정한다. 옅은 기체 칠 · 단열재 빗금은 분자 · 곡선 · 점 **아래**로
   * 깔려야 하는데, 층 순서로는 `region`(매질)이 물체 위로 올라온다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 처음 자리 → 부풂(V₁ → k·V₁) → 끝 압력 안내선이 나타남 → 멈춤 → 처음 자리로.
   *
   * 부피가 바뀌는 두 단계는 `linear` 다 — 분자 위상을 단계마다 적분하는 physics 가
   * 진행도를 시간에 비례한다고 본다 (NOTES 「어휘 부족」 G59).
   * `mark` 는 끝 압력 안내선이 떠오르는 짧은 단계다 — 캡션은 멈춤과 같은 문장이라 다시
   * 페이드하지 않는다.
   */
  timeline: {
    phases: [
      { id: 'rest0', duration: 1.6, caption: key('caption.start') },
      { id: 'expand', duration: 6.0, ease: 'linear', caption: key('caption.expand') },
      { id: 'mark', duration: 0.8, ease: 'smooth', caption: key('caption.hold') },
      { id: 'hold', duration: 3.6, caption: key('caption.hold') },
      { id: 'reset', duration: 1.4, ease: 'linear', caption: key('caption.reset') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — 피스톤이 오르며 두 점이 갈라지는 중에 연다. */
  startAt: 4.1,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 식과 법칙의 진술은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 14,
    wrapWidth: 760,
    style: { colorRole: 'muted', emphasis: 'strong' },
    // 온도 · 배수 · 압력 비는 스테이지 상수에서 온다 — state 가 글자로 옮겨 둔다(장부 G133 우회).
    vars: { t0: 't0', t1: 't1', k: 'k', pIso: 'pIso', pAdia: 'pAdia' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). P–V 그림은 축 둘과 처음 · 끝 눈금만 둔다 —
   * 격자를 깔면 칸을 세라는 지시가 된다.
   */

  messages: adiabaticProcessMessages,
};
