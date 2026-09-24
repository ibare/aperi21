// ========================================================================
// converging-diverging-lens — 선언
// ========================================================================
// 질문: 나란히 들어온 빛을 볼록 렌즈와 오목 렌즈는 각각 어디로 보내는가.
//
// 답: 같은 평행 줄기 다섯이 두 렌즈를 지난다. 위의 볼록 렌즈를 지난 줄기는 축 쪽으로
// 꺾여 렌즈 뒤 한 점에서 실제로 만난다(실초점). 아래의 오목 렌즈를 지난 줄기는 벌어지고,
// 벌어진 줄기를 거꾸로 이은 점선이 렌즈 앞 한 점에서 만난다(허초점).
//
// 물체 · 상은 두지 않는다 — 세 광선 결상은 `ray-tracing`, 배율은 `magnification`,
// 실상 · 허상은 `real-vs-virtual-image` 의 몫이다. 이 조각은 평행광과 초점만 말한다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:converging-diverging-lens` 와 문자 그대로 일치한다 (C4). */
export const CONVERGING_DIVERGING_LENS_ID = 'converging-diverging-lens';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 두 렌즈의 초점 거리 크기(월드). 볼록은 +, 오목은 − 로 같은 크기를 쓴다. */
export const FOCAL_LENGTH = 2.6;
/** 평행 줄기 수. 가운데 줄기가 축 위를 지나도록 홀수로 둔다. */
export const RAY_COUNT = 5;
/** 이웃 줄기 사이 간격(월드). */
export const RAY_SPACING = 0.5;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 두 렌즈 모두 x = 0 에 선다. 위 줄이 볼록, 아래 줄이 오목이다.
// ------------------------------------------------------------------------

/** 볼록 렌즈 줄의 광축 높이(월드). */
export const CONVEX_AXIS_Y = 2.1;
/** 오목 렌즈 줄의 광축 높이(월드). */
export const CONCAVE_AXIS_Y = -2.1;
/** 렌즈 반높이(월드). 가장 바깥 줄기(간격 × 2)보다 조금 크다. */
export const LENS_HALF = 1.3;
/** 볼록 렌즈 가운데 반두께(월드). */
export const CONVEX_CENTER_HALF = 0.2;
/** 볼록 렌즈 가장자리 반두께(월드). 날이 서지 않게 조금 남긴다. */
export const CONVEX_EDGE_HALF = 0.03;
/** 오목 렌즈 가운데 반두께(월드). */
export const CONCAVE_CENTER_HALF = 0.05;
/** 오목 렌즈 가장자리 반두께(월드). */
export const CONCAVE_EDGE_HALF = 0.22;

/** 줄기가 출발하는 x(월드). 오목 렌즈의 앞쪽 초점보다 충분히 왼쪽. */
export const RAY_START_X = -4.8;
/**
 * 볼록 렌즈 줄기가 끝나는 x(월드). 초점을 지나 더 가서 엇갈려 나가는 것이 보인다 —
 * 초점 바로 뒤에서 끊으면 다섯 화살촉이 한데 뭉친다.
 */
export const CONVEX_END_X = 4.8;
/** 오목 렌즈 줄기가 끝나는 x(월드). 벌어진 바깥 줄기가 이웃 줄에 닿기 전에 끊는다. */
export const CONCAVE_END_X = 2.1;
/** 광축 보조선의 왼쪽 · 오른쪽 끝(월드). */
export const AXIS_FROM_X = -5.0;
export const AXIS_TO_X = 5.1;

/** 렌즈 이름표가 렌즈 위 끝에서 더 올라간 거리(월드). */
export const LENS_LABEL_GAP = 0.32;
/** 초점 표식 `F` 가 축 아래로 내려간 거리(월드). 이웃 줄기 사이에 들어간다. */
export const FOCUS_LABEL_DROP = 0.26;
/** 초점 점의 반지름(월드). */
export const FOCUS_DOT_RADIUS = 0.08;

/**
 * 프레이밍 — 가로는 줄기 출발점부터 볼록 줄기 끝까지, 세로는 볼록 렌즈 이름표부터
 * 벌어진 오목 줄기 아래 끝과 캡션 한 줄까지. 매 프레임 같은 값이다 (S-piece · 원칙 6).
 */
export const SCENE_BOUNDS = { minX: -5.2, maxX: 5.3, minY: -4.55, maxY: 4.05 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const convergingDivergingLensMessages = Object.freeze({
  'label.title': {
    ko: '볼록 렌즈와 오목 렌즈',
    en: 'Converging and diverging lenses',
    ja: '収束レンズと発散レンズ',
    zh: '会聚透镜与发散透镜',
    ar: 'العدسة المجمعة والعدسة المفرقة',
    es: 'Lentes convergentes y divergentes',
    fr: 'Lentilles convergentes et divergentes',
    hi: 'अभिसारी और अपसारी लेंस',
    id: 'Lensa konvergen dan lensa divergen',
    pt: 'Lentes convergentes e divergentes',
  },
  'label.operation': {
    ko: '모으는 렌즈와 퍼뜨리는 렌즈',
    en: 'A lens that gathers light and a lens that spreads it',
    ja: '光を集めるレンズと広げるレンズ',
    zh: '会聚光的透镜与发散光的透镜',
    ar: 'عدسة تجمع الضوء وعدسة تفرّقه',
    es: 'Una lente que concentra la luz y otra que la esparce',
    fr: 'Une lentille qui rassemble la lumière et une lentille qui l’étale',
    hi: 'प्रकाश को इकट्ठा करने वाला लेंस और उसे फैलाने वाला लेंस',
    id: 'Lensa yang mengumpulkan cahaya dan lensa yang menyebarkannya',
    pt: 'Uma lente que concentra a luz e uma lente que a espalha',
  },
  'label.stage': {
    ko: '평행광',
    en: 'Parallel light',
    ja: '平行光',
    zh: '平行光',
    ar: 'ضوء متوازٍ',
    es: 'Luz paralela',
    fr: 'Lumière parallèle',
    hi: 'समांतर प्रकाश',
    id: 'Cahaya sejajar',
    pt: 'Luz paralela',
  },
  'label.view': {
    ko: '두 렌즈',
    en: 'Two lenses',
    ja: '二つのレンズ',
    zh: '两个透镜',
    ar: 'عدستان',
    es: 'Dos lentes',
    fr: 'Deux lentilles',
    hi: 'दो लेंस',
    id: 'Dua lensa',
    pt: 'Duas lentes',
  },

  /** 도식 이름표. */
  'label.convex': {
    ko: '볼록 렌즈',
    en: 'converging lens',
    ja: '収束レンズ',
    zh: '会聚透镜',
    ar: 'عدسة مجمعة',
    es: 'lente convergente',
    fr: 'lentille convergente',
    hi: 'अभिसारी लेंस',
    id: 'lensa konvergen',
    pt: 'lente convergente',
  },
  'label.concave': {
    ko: '오목 렌즈',
    en: 'diverging lens',
    ja: '発散レンズ',
    zh: '发散透镜',
    ar: 'عدسة مفرقة',
    es: 'lente divergente',
    fr: 'lentille divergente',
    hi: 'अपसारी लेंस',
    id: 'lensa divergen',
    pt: 'lente divergente',
  },
  /** 초점 표식 — 기호라 두 언어가 같다. */
  'label.focus': {
    ko: 'F',
    en: 'F',
    ja: 'F',
    zh: 'F',
    ar: 'F',
    es: 'F',
    fr: 'F',
    hi: 'F',
    id: 'F',
    pt: 'F',
  },

  'caption.enter': {
    ko: '나란한 빛 줄기가 두 렌즈로 들어간다.',
    en: 'Parallel beams of light head into both lenses.',
    ja: '平行な光束が二つのレンズに入っていく。',
    zh: '平行光束射向两个透镜。',
    ar: 'تتجه حزم ضوء متوازية نحو العدستين.',
    es: 'Haces de luz paralelos se dirigen a ambas lentes.',
    fr: 'Des faisceaux lumineux parallèles se dirigent vers les deux lentilles.',
    hi: 'प्रकाश के समांतर किरण-पुंज दोनों लेंसों की ओर बढ़ते हैं।',
    id: 'Berkas cahaya sejajar menuju kedua lensa.',
    pt: 'Feixes de luz paralelos seguem em direção às duas lentes.',
  },
  'caption.bend': {
    ko: '볼록 렌즈를 지난 줄기는 축 쪽으로, 오목 렌즈를 지난 줄기는 축 바깥쪽으로 꺾인다.',
    en: 'Past the converging lens the beams bend toward the axis; past the diverging lens they bend away from it.',
    ja: '収束レンズを通った光束は軸の側へ、発散レンズを通った光束は軸から離れる向きに曲がる。',
    zh: '经过会聚透镜的光束向主光轴偏折；经过发散透镜的光束偏离主光轴。',
    ar: 'بعد العدسة المجمعة تنحرف الحزم نحو المحور، وبعد العدسة المفرقة تنحرف مبتعدةً عنه.',
    es: 'Tras la lente convergente los haces se desvían hacia el eje; tras la divergente se alejan de él.',
    fr: 'Après la lentille convergente, les faisceaux se rapprochent de l’axe ; après la divergente, ils s’en écartent.',
    hi: 'अभिसारी लेंस से निकलकर किरण-पुंज अक्ष की ओर मुड़ते हैं; अपसारी लेंस से निकलकर वे अक्ष से दूर मुड़ते हैं।',
    id: 'Setelah lensa konvergen, berkas membelok menuju sumbu; setelah lensa divergen, berkas membelok menjauhi sumbu.',
    pt: 'Depois da lente convergente os feixes se desviam em direção ao eixo; depois da divergente, se afastam dele.',
  },
  'caption.real': {
    ko: '볼록 렌즈 뒤 — 꺾인 줄기가 모두 한 점 F 를 지나간다.',
    en: 'Behind the converging lens, every bent beam passes through one point, F.',
    ja: '収束レンズの後ろでは、曲がった光束がすべて一点 F を通る。',
    zh: '在会聚透镜后方，每一束偏折的光都经过同一点 F。',
    ar: 'خلف العدسة المجمعة، تمر كل حزمة منحرفة بنقطة واحدة هي F.',
    es: 'Detrás de la lente convergente, todos los haces desviados pasan por un mismo punto, F.',
    fr: 'Derrière la lentille convergente, tous les faisceaux déviés passent par un même point, F.',
    hi: 'अभिसारी लेंस के पीछे, हर मुड़ा हुआ किरण-पुंज एक ही बिंदु F से होकर गुज़रता है।',
    id: 'Di belakang lensa konvergen, setiap berkas yang dibelokkan melewati satu titik, F.',
    pt: 'Atrás da lente convergente, todos os feixes desviados passam por um mesmo ponto, F.',
  },
  'caption.traceBack': {
    ko: '오목 렌즈 쪽 — 벌어진 줄기를 렌즈 앞쪽으로 거꾸로 이어 본다.',
    en: 'At the diverging lens, extend the spreading beams backward, in front of the lens.',
    ja: '発散レンズでは、広がる光束をレンズの手前側へ逆向きに延ばしてみる。',
    zh: '在发散透镜处，把发散的光束反向延长到透镜前方。',
    ar: 'عند العدسة المفرقة، مُدّ الحزم المتباعدة إلى الخلف أمام العدسة.',
    es: 'En la lente divergente, prolonga hacia atrás los haces que se abren, por delante de la lente.',
    fr: 'Pour la lentille divergente, prolongez vers l’arrière les faisceaux qui s’écartent, en avant de la lentille.',
    hi: 'अपसारी लेंस पर, फैलते किरण-पुंजों को पीछे की ओर, लेंस के सामने तक बढ़ाएँ।',
    id: 'Pada lensa divergen, perpanjang berkas yang menyebar ke belakang, di depan lensa.',
    pt: 'Na lente divergente, prolongue para trás os feixes que se abrem, à frente da lente.',
  },
  'caption.virtual': {
    ko: '거꾸로 이은 점선이 렌즈 앞 한 점 F 에서 만난다 — 실제 줄기는 그 점을 지나지 않는다.',
    en: 'The dashed extensions meet at one point F in front of the lens — no actual beam passes through it.',
    ja: '逆向きに延ばした点線はレンズの手前の一点 F で交わる — 実際の光束はその点を通らない。',
    zh: '反向延长的虚线在透镜前方的一点 F 相交 — 并没有实际的光束经过该点。',
    ar: 'تلتقي الامتدادات المتقطعة في نقطة واحدة F أمام العدسة — لا تمر بها أي حزمة فعلية.',
    es: 'Las prolongaciones discontinuas se cruzan en un punto F delante de la lente — ningún haz real pasa por él.',
    fr: 'Les prolongements en pointillés se croisent en un point F devant la lentille — aucun faisceau réel n’y passe.',
    hi: 'बिंदुकित विस्तार लेंस के सामने एक बिंदु F पर मिलते हैं — कोई वास्तविक किरण-पुंज उससे होकर नहीं गुज़रता।',
    id: 'Perpanjangan garis putus-putus bertemu di satu titik F di depan lensa — tidak ada berkas nyata yang melewatinya.',
    pt: 'Os prolongamentos tracejados se encontram em um ponto F à frente da lente — nenhum feixe real passa por ele.',
  },
} satisfies Record<string, LocalizedText>);

export type ConvergingDivergingLensMessageKey = keyof typeof convergingDivergingLensMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: ConvergingDivergingLensMessageKey): LocalizedText => convergingDivergingLensMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ConvergingDivergingLensMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const convergingDivergingLensSchema: BundleSchema = {
  id: CONVERGING_DIVERGING_LENS_ID,
  label: text('label.title'),
  category: 'optics',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다. 두 렌즈를 한 화면에 나란히 두어 같은 평행광이 한쪽은 모이고 한쪽은
  // 퍼지는 것을 자동 진행으로 보인다 — 독자가 직접 해 봐야 하는 것이 없다.
  parameters: [],

  stages: [
    {
      id: 'parallel-light',
      label: text('label.stage'),
      constants: { focalLength: FOCAL_LENGTH, rayCount: RAY_COUNT, raySpacing: RAY_SPACING },
    },
  ],

  environments: [],

  views: [{ id: 'lenses', label: text('label.view'), default: true }],

  /** 두 렌즈를 위아래로 쌓는다. 같은 x 에 서서 두 초점이 렌즈 뒤 · 앞으로 갈리는 것이 곧바로 견줘진다. */
  canvas: { height: 460, minHeight: 400 },

  /**
   * 축 → 렌즈 → 줄기 → 점선 → 초점 → 글자 순. plugin 어휘(`ray`)가 층에서 region 보다
   * 앞설 수 있어 scene 순서로 고정한다 — 줄기가 렌즈 유리 위로 지나가야 한다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 들어옴 → 꺾임 → 실초점 표시 → 멈춤 → 거꾸로 잇기 → 허초점 표시 → 멈춤 → 빠져나감.
   *
   * 줄기 앞머리 · 꼬리의 x 는 `enter` · `bend` · `drain` 진행도로, 점선 길이는 `trace-back`
   * 진행도로, 두 초점의 짙기는 `mark-*` · `drain` 진행도로 읽는다(`physics.ts`).
   */
  timeline: {
    phases: [
      { id: 'enter', duration: 1.4, caption: key('caption.enter') },
      { id: 'bend', duration: 1.6, caption: key('caption.bend') },
      { id: 'mark-real', duration: 0.5, ease: 'smooth', caption: key('caption.real') },
      { id: 'hold-real', duration: 2.6, caption: key('caption.real') },
      { id: 'trace-back', duration: 1.8, ease: 'smooth', caption: key('caption.traceBack') },
      { id: 'mark-virtual', duration: 0.5, ease: 'smooth', caption: key('caption.virtual') },
      { id: 'hold-virtual', duration: 3.2, caption: key('caption.virtual') },
      { id: 'drain', duration: 1.3, caption: key('caption.virtual') },
    ],
  },

  /** 도착한 순간 두 렌즈의 줄기가 다 지나가 있고 볼록 쪽 초점이 서 있다 — 실초점 멈춤 안에서 연다 (S-piece). */
  startAt: 4.0,

  /** 슬롯 하나. 그림 아래 가운데 한 줄. */
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -6] },
    align: 'center',
    fontSize: 14,
    wrapWidth: 820,
    style: { colorRole: 'ink', emphasis: 'strong' },
    fade: 0.25,
  },

  // 그리드 · 카메라 단추 · 범례 · 제목 없음(기본). 잴 것이 없다 — 줄기가 만나는 자리가
  // 렌즈 뒤인지 앞인지가 주장이고, 그것은 두 줄을 같은 x 에 세워 둔 것으로 보인다.

  messages: convergingDivergingLensMessages,
};
