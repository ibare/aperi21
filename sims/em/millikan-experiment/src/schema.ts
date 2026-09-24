// ========================================================================
// millikan-experiment — 선언
// ========================================================================
// 질문: 전하는 아무 값이나 가질 수 있는가, 아니면 알갱이로 오는가.
//
// 왼쪽 — 평행판(위 판 가운데에 구멍) 사이로 기름방울 하나가 무게로 천천히 떨어진다.
// 판 전압을 올리면 위로 끄는 전기력 화살표(강조색)가 자라고 방울이 느려진다. 두
// 화살표가 같은 길이가 되는 순간 방울이 멈춰 떠 있다. 그 방울의 전하가 오른쪽 q 축
// 위에 점으로 날아가 앉는다.
//
// 오른쪽 — 이어서 크기가 제각각인 방울들이 하나씩 떠서 점을 찍는다. 점은 0 · e · 2e ·
// 3e … 눈금 자리에만 기둥으로 쌓이고 **그 사이는 비어 있다.** 전하가 띄엄띄엄하다는
// 것이 점의 자리로 드러난다.
//
// 이웃과 겹치지 않는 자리 — `uniform-field` 는 판 사이 자리를 옮겨도 힘이 같다는 것,
// `charge-in-uniform-field` 는 장 속 전하의 포물선 운동이다. 이 조각은 판 사이 장을
// 배경으로만 쓰고, **떠 있는 방울에서 잰 전하가 정수배로만 나온다** 는 것만 한다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText, TimelinePhase } from '@aperi21/schema';

/** 등록 키 `aperi21:millikan-experiment` 와 문자 그대로 일치한다 (C4). */
export const MILLIKAN_EXPERIMENT_ID = 'millikan-experiment';

// ------------------------------------------------------------------------
// 측정 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 전하는 기본 전하 e 를 단위로 센다. 월드 단위는 임의 길이다.
// ------------------------------------------------------------------------

/** 측정 결과를 뽑는 시드. 주기마다 (시드, 주기 번호)에서 새로 뽑는다. */
export const SEED = 1909;
/**
 * 한 주기에 재는 방울 수. 첫 방울은 떨어짐 → 균형을 천천히 보이고, 나머지는
 * 시간표 단계 `drop1` … 마다 하나씩 뜬다 — **단계 수가 이 값 − 1 과 같아야 한다.**
 */
export const DROP_COUNT = 14;
/** 전하 축에 눈금을 새기는 가장 큰 배수. 방울의 전하 배수도 이 안에서 뽑는다. */
export const MAX_MULTIPLE = 5;
/**
 * 주기마다 반드시 한 번 이상 나오는 배수(1 … 이 값). 캡션이 「e · 2e · 3e … 자리」 를
 * 말하므로 어느 주기에서도 그 세 자리가 비지 않게 한다.
 */
export const GUARANTEED_MULTIPLES = 3;
/**
 * 배수마다 뽑힐 비중(1e … 5e). 작은 배수가 흔하다. 목록이 스테이지 상수로 흩어져
 * 있다 (장부 G105).
 */
export const MULTIPLE_WEIGHTS: readonly number[] = [3, 4, 3, 2, 1];
/** 잰 전하의 흩어짐 폭(표준편차, e 단위). 측정 오차 — 정수배 사이 빈 곳을 메우지 못할 만큼 작다. */
export const SPREAD = 0.05;
/** 기본 전하 e 의 가수. 화면 글자 `e = 1.6×10⁻¹⁹ C` 에 그대로 끼운다(지수 · 단위는 문안). */
export const E_MANTISSA = 1.6;

// ------------------------------------------------------------------------
// 장치 — 평행판과 방울
// ------------------------------------------------------------------------

/** 판의 왼쪽 · 오른쪽 끝(월드). */
export const PLATE_LEFT = -5.2;
export const PLATE_RIGHT = -2.2;
/** 판 간격(월드). 판은 y = ±간격/2 에 놓인다. */
export const PLATE_GAP = 2.8;
/** 판 두께(월드) — 그림의 두께다. */
export const PLATE_THICKNESS = 0.12;
/** 위 판 가운데 구멍의 폭(월드). 방울이 이 구멍으로 들어온다. */
export const HOLE_WIDTH = 0.34;
/** 판 사이 장선 가닥 수 — 전압이 오르는 만큼 짙어진다. 짝수라야 가운데(방울 길)에 선이 서지 않는다. */
export const FIELD_LINES = 6;
/** 방울이 떨어지는 가로 자리 · 멈춰 뜨는 높이(월드). */
export const DROP_X = -3.7;
export const HOVER_Y = 0;
/** 전압이 없을 때 방울이 떨어지는 속력(월드/초). 공기 저항으로 곧 일정해진 종단 속력이다. */
export const FALL_SPEED = 0.42;
/** 방울 반지름 범위(월드). 방울마다 이 안에서 뽑는다 — 무게는 반지름의 세제곱을 따른다. */
export const DROP_RADIUS_MIN = 0.1;
export const DROP_RADIUS_MAX = 0.15;
/**
 * 무게 화살표 길이의 기준 — 반지름이 `WEIGHT_REF_RADIUS` 인 방울의 무게 화살표가
 * `WEIGHT_REF_LENGTH`(월드)다. 다른 방울은 (r / 기준)³ 배. 표시 배율이다 (원칙 2).
 */
export const WEIGHT_REF_RADIUS = 0.125;
export const WEIGHT_REF_LENGTH = 0.6;

// ------------------------------------------------------------------------
// 전하 축 — 잰 전하를 점으로 쌓는다
// ------------------------------------------------------------------------

/** 전하 0 이 놓이는 가로 자리 · 축의 높이(월드). */
export const AXIS_ORIGIN_X = -0.5;
export const AXIS_Y = -1.45;
/** e 하나가 차지하는 축 길이(월드). */
export const AXIS_UNIT = 1.05;
/** 쌓이는 점의 반지름 · 한 칸 높이(월드). */
export const DOT_RADIUS = 0.085;
export const DOT_SPACING = 0.27;
/** 축의 오른쪽 끝을 마지막 눈금에서 더 늘이는 길이(월드). `q` 표식이 여기 붙는다. */
export const AXIS_OVERHANG = 0.45;

// ------------------------------------------------------------------------
// 배치
// ------------------------------------------------------------------------

/**
 * 프레이밍은 주장의 일부다. 왼쪽 장치와 오른쪽 축, 가장 높은 점 기둥과 e 값 표식을
 * 담고, 아래에 캡션 띠를 남긴다(캡션 자리가 프레이밍 여백으로 잡히지 않는다 — 장부 G24).
 * 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -5.5, maxX: 5.65, minY: -2.4, maxY: 2 } as const;
/** e 값 표식의 자리(월드) — 축 위 오른쪽 위. */
export const E_LABEL_AT: readonly [number, number] = [2.6, 1.6];

// ------------------------------------------------------------------------
// 시간표 — 단계 길이 (저작자가 바꿀 수 있는 기본값)
// ------------------------------------------------------------------------

/** 전압 없이 방울이 떨어지는 동안. */
export const FALL = 1.8;
/** 전압을 0 에서 균형 전압까지 올리는 동안. 방울이 느려진다. */
export const RAISE = 2;
/** 균형 — 멈춘 방울을 보는 동안. */
export const HOVER = 1.2;
/** 첫 방울의 전하가 축으로 날아가 앉는 동안. */
export const RECORD = 1.2;
/** 나머지 방울 하나가 떠서 점을 찍는 동안. */
export const DROP_EACH = 0.55;
/** 다 쌓인 점을 읽는 동안. */
export const HOLD = 3.2;
/** 다음 주기로 넘어가며 점이 사라지는 동안. */
export const CLEAR = 0.7;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const millikanExperimentMessages = Object.freeze({
  'label.title': {
    ko: '밀리컨 실험',
    en: 'Millikan oil-drop experiment',
    ja: 'ミリカンの油滴実験',
    zh: '密立根油滴实验',
    ar: 'تجربة ميليكان لقطرة الزيت',
    es: 'Experimento de la gota de aceite de Millikan',
    fr: 'Expérience de la goutte d’huile de Millikan',
    hi: 'मिलिकन का तेल-बूँद प्रयोग',
    id: 'Percobaan tetes minyak Millikan',
    pt: 'Experimento da gota de óleo de Millikan',
  },
  'label.operation': {
    ko: '전하가 띄엄띄엄하다는 증거',
    en: 'Evidence that charge comes in lumps',
    ja: '電荷がとびとびの値をとる証拠',
    zh: '电荷一份一份出现的证据',
    ar: 'دليل على أن الشحنة تأتي في كمّيات منفصلة',
    es: 'Prueba de que la carga viene en porciones',
    fr: 'La preuve que la charge vient par paquets',
    hi: 'प्रमाण कि आवेश टुकड़ों में आता है',
    id: 'Bukti bahwa muatan datang dalam paket-paket',
    pt: 'Prova de que a carga vem em porções',
  },
  'label.stage': {
    ko: '평행판 사이의 기름방울',
    en: 'Oil drops between parallel plates',
    ja: '平行板の間の油滴',
    zh: '平行板之间的油滴',
    ar: 'قطرات زيت بين لوحين متوازيين',
    es: 'Gotas de aceite entre placas paralelas',
    fr: 'Gouttes d’huile entre des plaques parallèles',
    hi: 'समांतर प्लेटों के बीच तेल की बूँदें',
    id: 'Tetes minyak di antara keping sejajar',
    pt: 'Gotas de óleo entre placas paralelas',
  },
  'label.view': {
    ko: '옆에서 본 장치와 전하 축',
    en: 'Side view and charge axis',
    ja: '側面図と電荷の軸',
    zh: '侧视图与电荷轴',
    ar: 'منظر جانبي ومحور الشحنة',
    es: 'Vista lateral y eje de carga',
    fr: 'Vue de côté et axe des charges',
    hi: 'पार्श्व दृश्य और आवेश अक्ष',
    id: 'Tampak samping dan sumbu muatan',
    pt: 'Vista lateral e eixo de carga',
  },
  /** 판 부호 · 힘 · 축 기호. 표식이라 번역하지 않는다 (C1 판정 3). */
  'mark.plus': {
    ko: '+',
    en: '+',
    ja: '+',
    zh: '+',
    ar: '+',
    es: '+',
    fr: '+',
    hi: '+',
    id: '+',
    pt: '+',
  },
  'mark.minus': {
    ko: '−',
    en: '−',
    ja: '−',
    zh: '−',
    ar: '−',
    es: '−',
    fr: '−',
    hi: '−',
    id: '−',
    pt: '−',
  },
  'mark.weight': {
    ko: 'mg',
    en: 'mg',
    ja: 'mg',
    zh: 'mg',
    ar: 'mg',
    es: 'mg',
    fr: 'mg',
    hi: 'mg',
    id: 'mg',
    pt: 'mg',
  },
  'mark.electric': {
    ko: 'qE',
    en: 'qE',
    ja: 'qE',
    zh: 'qE',
    ar: 'qE',
    es: 'qE',
    fr: 'qE',
    hi: 'qE',
    id: 'qE',
    pt: 'qE',
  },
  'mark.q': {
    ko: 'q',
    en: 'q',
    ja: 'q',
    zh: 'q',
    ar: 'q',
    es: 'q',
    fr: 'q',
    hi: 'q',
    id: 'q',
    pt: 'q',
  },
  'mark.zero': {
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
  'mark.e': {
    ko: 'e',
    en: 'e',
    ja: 'e',
    zh: 'e',
    ar: 'e',
    es: 'e',
    fr: 'e',
    hi: 'e',
    id: 'e',
    pt: 'e',
  },
  'mark.multiple': {
    ko: '{n}e',
    en: '{n}e',
    ja: '{n}e',
    zh: '{n}e',
    ar: '{n}e',
    es: '{n}e',
    fr: '{n}e',
    hi: '{n}e',
    id: '{n}e',
    pt: '{n}e',
  },
  /** 기본 전하의 값. 가수는 스테이지 상수, 지수 · 단위는 문안 틀이다. */
  'label.eValue': {
    ko: 'e = {e}×10⁻¹⁹ C',
    en: 'e = {e}×10⁻¹⁹ C',
    ja: 'e = {e}×10⁻¹⁹ C',
    zh: 'e = {e}×10⁻¹⁹ C',
    ar: 'e = {e}×10⁻¹⁹ C',
    es: 'e = {e}×10⁻¹⁹ C',
    fr: 'e = {e}×10⁻¹⁹ C',
    hi: 'e = {e}×10⁻¹⁹ C',
    id: 'e = {e}×10⁻¹⁹ C',
    pt: 'e = {e}×10⁻¹⁹ C',
  },
  'caption.fall': {
    ko: '판에 전압이 없으면 기름방울은 무게로 천천히 떨어진다',
    en: 'With no voltage on the plates, the oil drop sinks slowly under its weight',
    ja: '極板に電圧がないと、油滴は重さでゆっくり落ちていく',
    zh: '极板上没有电压时，油滴因自身重量缓缓下落',
    ar: 'عندما لا يوجد جهد على اللوحين، تهبط قطرة الزيت ببطء بفعل وزنها',
    es: 'Sin voltaje en las placas, la gota de aceite desciende lentamente por su peso',
    fr: 'Sans tension entre les plaques, la goutte d’huile descend lentement sous son poids',
    hi: 'प्लेटों पर वोल्टता न होने पर तेल की बूँद अपने भार से धीरे-धीरे नीचे गिरती है',
    id: 'Tanpa tegangan pada pelat, tetes minyak turun perlahan karena beratnya',
    pt: 'Sem tensão nas placas, a gota de óleo desce devagar pelo próprio peso',
  },
  'caption.raise': {
    ko: '전압을 올리면 위로 끄는 전기력이 커지고 방울이 느려진다',
    en: 'Turning up the voltage grows the upward electric force, and the drop slows',
    ja: '電圧を上げると上向きの電気力が大きくなり、油滴は遅くなる',
    zh: '调高电压，向上的电场力增大，油滴变慢',
    ar: 'رفع الجهد يزيد القوة الكهربائية المتجهة إلى أعلى، فتتباطأ القطرة',
    es: 'Al subir el voltaje crece la fuerza eléctrica hacia arriba y la gota se frena',
    fr: 'En augmentant la tension, la force électrique vers le haut grandit et la goutte ralentit',
    hi: 'वोल्टता बढ़ाने पर ऊपर की ओर का विद्युत बल बढ़ता है और बूँद धीमी हो जाती है',
    id: 'Menaikkan tegangan memperbesar gaya listrik ke atas, dan tetes melambat',
    pt: 'Aumentar a tensão faz crescer a força elétrica para cima, e a gota desacelera',
  },
  'caption.hover': {
    ko: '전기력이 무게와 같아진 전압에서 방울이 멈춰 떠 있다',
    en: 'At the voltage where the electric force equals the weight, the drop stops and hangs',
    ja: '電気力が重さと等しくなる電圧で、油滴は止まって浮かぶ',
    zh: '在电场力等于重力的电压下，油滴停住并悬浮',
    ar: 'عند الجهد الذي تساوي فيه القوة الكهربائية الوزن، تتوقف القطرة وتبقى معلّقة',
    es: 'Con el voltaje en que la fuerza eléctrica iguala al peso, la gota se detiene y queda suspendida',
    fr: 'À la tension où la force électrique égale le poids, la goutte s’arrête et reste suspendue',
    hi: 'जिस वोल्टता पर विद्युत बल भार के बराबर होता है, वहाँ बूँद रुककर हवा में टिकी रहती है',
    id: 'Pada tegangan saat gaya listrik sama dengan berat, tetes berhenti dan melayang',
    pt: 'Na tensão em que a força elétrica iguala o peso, a gota para e fica suspensa',
  },
  'caption.record': {
    ko: '그 전압에서 구한 방울의 전하를 오른쪽 축에 점으로 찍는다',
    en: 'The charge found from that voltage goes onto the axis on the right as a dot',
    ja: 'その電圧から求めた電荷を、右の軸に点として打つ',
    zh: '由该电压求出的电荷，以点的形式标在右侧的轴上',
    ar: 'الشحنة المحسوبة من ذلك الجهد توضع نقطةً على المحور في اليمين',
    es: 'La carga obtenida de ese voltaje se marca como un punto en el eje de la derecha',
    fr: 'La charge tirée de cette tension se place en point sur l’axe de droite',
    hi: 'उस वोल्टता से ज्ञात आवेश दाईं ओर के अक्ष पर एक बिंदु के रूप में अंकित होता है',
    id: 'Muatan yang diperoleh dari tegangan itu ditandai sebagai titik pada sumbu di kanan',
    pt: 'A carga obtida dessa tensão vai para o eixo à direita como um ponto',
  },
  'caption.more': {
    ko: '크기가 제각각인 방울들을 하나씩 띄워 전하를 찍는다',
    en: 'Drops of different sizes are balanced one by one and their charges plotted',
    ja: '大きさの異なる油滴を一つずつ浮かせ、その電荷を打っていく',
    zh: '大小不一的油滴被逐个平衡，并标出各自的电荷',
    ar: 'تُوازَن قطرات مختلفة الأحجام واحدة تلو الأخرى وتُرسم شحناتها',
    es: 'Gotas de distintos tamaños se equilibran una a una y se marcan sus cargas',
    fr: 'Des gouttes de tailles différentes sont équilibrées une à une et leurs charges reportées',
    hi: 'अलग-अलग आकार की बूँदें एक-एक करके संतुलित की जाती हैं और उनके आवेश अंकित होते हैं',
    id: 'Tetes berbagai ukuran diseimbangkan satu per satu dan muatannya ditandai',
    pt: 'Gotas de tamanhos diferentes são equilibradas uma a uma e suas cargas marcadas',
  },
  'caption.hold': {
    ko: '점은 e · 2e · 3e … 자리에만 모이고, 그 사이는 비어 있다',
    en: 'The dots gather only at e, 2e, 3e … — the spaces between stay empty',
    ja: '点は e、2e、3e … の位置にだけ集まり、その間は空いたままだ',
    zh: '点只聚集在 e、2e、3e … 处 — 其间一直空着',
    ar: 'تتجمع النقاط عند e و2e و3e … فقط — وتبقى المسافات بينها فارغة',
    es: 'Los puntos se agrupan solo en e, 2e, 3e … — los espacios entre ellos quedan vacíos',
    fr: 'Les points ne s’amassent qu’en e, 2e, 3e … — les intervalles restent vides',
    hi: 'बिंदु केवल e, 2e, 3e … पर ही जमा होते हैं — बीच की जगहें खाली रहती हैं',
    id: 'Titik-titik hanya berkumpul di e, 2e, 3e … — ruang di antaranya tetap kosong',
    pt: 'Os pontos se juntam só em e, 2e, 3e … — os espaços entre eles ficam vazios',
  },
} satisfies Record<string, LocalizedText>);

export type MillikanExperimentMessageKey = keyof typeof millikanExperimentMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: MillikanExperimentMessageKey): LocalizedText => millikanExperimentMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: MillikanExperimentMessageKey): string {
  return k;
}

/** 나머지 방울마다의 단계 id. scene 이 같은 이름으로 부른다. */
export function dropPhaseId(i: number): string {
  return `drop${i}`;
}

/**
 * 나머지 방울의 단계 — `drop1` … `drop{DROP_COUNT − 1}`. 방울마다 한 단계라 저작자가
 * 방울 하나의 길이를 따로 바꿀 수 있다. 단계 **수**는 기본값 `DROP_COUNT` 에서 온다
 * (장부 G105 · G13).
 */
function dropPhases(): TimelinePhase[] {
  const out: TimelinePhase[] = [];
  for (let i = 1; i < DROP_COUNT; i++) {
    out.push({ id: dropPhaseId(i), duration: DROP_EACH, ease: 'smooth', caption: key('caption.more') });
  }
  return out;
}

/** 배수 비중 목록을 스테이지 상수 이름으로 흩는다 — `weight1` … (장부 G105). */
function weightConstants(): Record<string, number> {
  const out: Record<string, number> = {};
  MULTIPLE_WEIGHTS.forEach((w, i) => {
    out[`weight${i + 1}`] = w;
  });
  return out;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const millikanExperimentSchema: BundleSchema = {
  id: MILLIKAN_EXPERIMENT_ID,
  label: text('label.title'),
  category: 'em',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 방울이 떨어지고, 멈추고, 점이 쌓인다.
  parameters: [],

  stages: [
    {
      id: 'oil-drops',
      label: text('label.stage'),
      constants: {
        seed: SEED,
        dropCount: DROP_COUNT,
        maxMultiple: MAX_MULTIPLE,
        guaranteedMultiples: GUARANTEED_MULTIPLES,
        ...weightConstants(),
        spread: SPREAD,
        eMantissa: E_MANTISSA,
        plateLeft: PLATE_LEFT,
        plateRight: PLATE_RIGHT,
        plateGap: PLATE_GAP,
        plateThickness: PLATE_THICKNESS,
        holeWidth: HOLE_WIDTH,
        fieldLines: FIELD_LINES,
        dropX: DROP_X,
        hoverY: HOVER_Y,
        fallSpeed: FALL_SPEED,
        dropRadiusMin: DROP_RADIUS_MIN,
        dropRadiusMax: DROP_RADIUS_MAX,
        weightRefRadius: WEIGHT_REF_RADIUS,
        weightRefLength: WEIGHT_REF_LENGTH,
        axisOriginX: AXIS_ORIGIN_X,
        axisY: AXIS_Y,
        axisUnit: AXIS_UNIT,
        dotRadius: DOT_RADIUS,
        dotSpacing: DOT_SPACING,
        axisOverhang: AXIS_OVERHANG,
        eLabelX: E_LABEL_AT[0],
        eLabelY: E_LABEL_AT[1],
      },
    },
  ],

  environments: [],

  views: [{ id: 'side', label: text('label.view'), default: true }],

  /** 가로로 놓인 장치 · 축과 캡션 한 줄. 세로를 더 주면 그림만 작아진다. */
  canvas: { height: 360, minHeight: 320 },

  /**
   * 겹침이 판정 장치다. 장선 → 판 → 방울 → 힘 화살표 → 축 → 점 순으로 쌓아야
   * 날아가는 점이 축 · 판에 가려지지 않는다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 첫 방울이 떨어짐 → 전압을 올려 멈춤 → 전하를 축에 찍음 → 나머지 방울이
   * 하나씩 → 쌓인 점을 읽음 → 사라짐. `raise` 는 방울 속력이 전압에 곧게 따르도록
   * linear 로 둔다.
   */
  timeline: {
    phases: [
      { id: 'fall', duration: FALL, caption: key('caption.fall') },
      { id: 'raise', duration: RAISE, caption: key('caption.raise') },
      { id: 'hover', duration: HOVER, caption: key('caption.hover') },
      { id: 'record', duration: RECORD, ease: 'smooth', caption: key('caption.record') },
      ...dropPhases(),
      { id: 'hold', duration: HOLD, caption: key('caption.hold') },
      { id: 'clear', duration: CLEAR, ease: 'smooth', caption: key('caption.hold') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — 방울이 구멍을 지나 떨어지고 있다. */
  startAt: 0.8,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 정의와 공식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    fade: 0.3,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것은 거리가 아니라 **점이 눈금 자리에 모이는가**
   * 이고, 그 눈금은 축 자체가 준다.
   */

  messages: millikanExperimentMessages,
};
