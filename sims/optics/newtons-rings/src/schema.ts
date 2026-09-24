// ========================================================================
// newtons-rings — 선언
// ========================================================================
// 질문: 볼록 렌즈를 평판에 얹고 위에서 보면 왜 동심원 고리가 보이고, 왜 바깥 고리일수록
// 서로 바짝 붙는가.
//
// 렌즈 곡면과 평판 사이의 공기층은 가운데(닿은 자리)에서 0 이고 멀어질수록 가파르게
// 두꺼워진다. 두께가 반 파장씩 늘 때마다 어두운 고리가 하나씩 선다 — 같은 반 파장 계단이
// 바깥에서는 좁은 가로 폭에 몰리므로 고리가 촘촘해진다.
//
// 위에 옆에서 본 단면(두께는 세로로 과장), 아래에 위에서 본 무늬(반원)를 **같은 가로 축**으로
// 쌓는다. 두께 눈금에서 곡면을 거쳐 고리로 내리는 안내선이 둘을 잇는다.
//
// 이웃 thin-film-interference(두께가 만드는 색)는 되풀이하지 않는다 — 여기서는 한 파장
// 단색이고, 색이 아니라 고리의 **간격**이 주장이다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:newtons-rings` 와 문자 그대로 일치한다 (C4). */
export const NEWTONS_RINGS_ID = 'newtons-rings';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 렌즈 곡면의 곡률 반지름(m). */
export const LENS_RADIUS_M = 1;
/** 비추는 단색광의 파장(nm). 나트륨 D 선. */
export const WAVELENGTH_NM = 589;
/** 그림에 담는 반지름(mm) — 가운데에서 가장자리까지. */
export const VIEW_RADIUS_MM = 2;
/** 두께 눈금 · 안내선을 긋는 어두운 고리 수. 시간표의 `ring-1` … `ring-N` 단계 수와 같아야 한다 (NOTES G129). */
export const MARKED_RINGS = 6;
/**
 * 단면의 두께를 세로로 키운 배율. 가장자리 두께가 2 μm 로 가로(4 mm)의 2000 분의 1 이라 그대로는
 * 선 하나로 붙는다. 화면에 「두께 ×{k}」 로 알린다.
 */
export const THICKNESS_EXAGGERATION = 650;

// ------------------------------------------------------------------------
// 배치 — 월드 단위(화면 px 에 가깝게). 가로 x 는 가운데에서 잰 반지름이고 단면과 무늬가 같이 쓴다.
// ------------------------------------------------------------------------

/** 보이는 반지름(`viewRadius`)이 차지하는 월드 길이. 무늬 반원의 반지름이다. */
export const DISC_R = 200;
/** 평판 윗면 높이 · 평판 두께. */
export const PLATE_TOP = 0;
export const PLATE_THICK = 14;
/** 평판이 렌즈 가장자리보다 양옆으로 더 나가는 길이. */
export const PLATE_OVERHANG = 44;
/** 렌즈 가장자리의 곡면 위 유리 두께(평볼록 렌즈의 평평한 윗면까지). */
export const LENS_RIM = 22;
/** 두께 눈금자의 가로 자리. 렌즈 가장자리 바로 바깥. */
export const RULER_X = DISC_R + 24;
/** 평판 아래에서 무늬 반원의 지름(위 변)까지 띄운 거리. */
export const DISC_GAP = 14;
/** 무늬 반원 지름의 높이. 가운데가 (0, DISC_TOP) 이다. */
export const DISC_TOP = PLATE_TOP - PLATE_THICK - DISC_GAP;
/** 판 이름표의 오른쪽 끝(월드 x). 그림 왼쪽 빈 자리에 둔다. */
export const TITLE_X = -DISC_R - 16;

/**
 * 프레이밍은 주장의 일부다. 가로는 판 이름표부터 눈금 이름표까지, 세로는 기본 상수에서 렌즈 윗면
 * (두께 130 + 테 22) 위부터 무늬 반원 아래 캡션 줄까지. 매 프레임 같은 값이다 (원칙 6).
 * 과장 배율을 키우면 렌즈가 위로 넘친다 — 경계는 상태 · 상수로 계산하지 않는다 (S-piece).
 */
export const SCENE_BOUNDS = { minX: -DISC_R - 118, maxX: DISC_R + 118, minY: DISC_TOP - DISC_R - 40, maxY: 170 } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이(초)
// ------------------------------------------------------------------------

/** 두 그림을 먼저 보는 동안. */
export const LOOK = 2.2;
/** 고리 하나의 안내선이 두께 눈금에서 곡면을 거쳐 고리까지 그어지는 동안. */
export const RING_STEP = 0.9;
/** 다 그은 계단을 읽는 동안 · 다음 주기로 넘어가며 안내선이 흐려지는 동안. */
export const HOLD = 3.4;
export const FADE = 0.6;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const newtonsRingsMessages = Object.freeze({
  'label.title': {
    ko: '뉴턴 링',
    en: "Newton's rings",
    ja: 'ニュートンリング',
    zh: '牛顿环',
    ar: 'حلقات نيوتن',
    es: 'Anillos de Newton',
    fr: 'Anneaux de Newton',
    hi: 'न्यूटन वलय',
    id: 'Cincin Newton',
    pt: 'Anéis de Newton',
  },
  'label.operation': {
    ko: '곡면과 평면 사이의 간섭',
    en: 'Interference between a curved and a flat surface',
    ja: '曲面と平面のあいだの干渉',
    zh: '曲面与平面之间的干涉',
    ar: 'التداخل بين سطح منحنٍ وسطح مستوٍ',
    es: 'Interferencia entre una superficie curva y una plana',
    fr: 'Interférences entre une surface courbe et une surface plane',
    hi: 'वक्र और समतल पृष्ठ के बीच व्यतिकरण',
    id: 'Interferensi antara permukaan lengkung dan permukaan datar',
    pt: 'Interferência entre uma superfície curva e uma plana',
  },
  'label.stage': {
    ko: '평판에 얹은 볼록 렌즈',
    en: 'Convex lens resting on a flat plate',
    ja: '平板にのせた凸レンズ',
    zh: '放在平板上的凸透镜',
    ar: 'عدسة محدبة موضوعة على لوح مستوٍ',
    es: 'Lente convexa apoyada sobre una placa plana',
    fr: 'Lentille convexe posée sur une lame plane',
    hi: 'समतल प्लेट पर रखा उत्तल लेंस',
    id: 'Lensa cembung di atas pelat datar',
    pt: 'Lente convexa apoiada sobre uma placa plana',
  },
  'label.view': {
    ko: '단면과 위에서 본 무늬',
    en: 'Cross-section and top view',
    ja: '断面と上から見た模様',
    zh: '截面与俯视图样',
    ar: 'المقطع العرضي والمنظر العلوي',
    es: 'Sección transversal y vista superior',
    fr: 'Coupe et vue de dessus',
    hi: 'अनुप्रस्थ काट और ऊपर से दृश्य',
    id: 'Penampang dan tampak atas',
    pt: 'Corte transversal e vista de cima',
  },
  'label.side': {
    ko: '옆에서 본 단면',
    en: 'Side section',
    ja: '横から見た断面',
    zh: '侧面截面',
    ar: 'مقطع جانبي',
    es: 'Sección lateral',
    fr: 'Coupe latérale',
    hi: 'पार्श्व काट',
    id: 'Penampang samping',
    pt: 'Corte lateral',
  },
  'label.top': {
    ko: '위에서 본 무늬',
    en: 'Seen from above',
    ja: '上から見たところ',
    zh: '俯视',
    ar: 'منظر من الأعلى',
    es: 'Visto desde arriba',
    fr: 'Vu de dessus',
    hi: 'ऊपर से देखने पर',
    id: 'Dilihat dari atas',
    pt: 'Visto de cima',
  },
  'label.air': {
    ko: '공기층',
    en: 'air gap',
    ja: '空気層',
    zh: '空气层',
    ar: 'طبقة الهواء',
    es: 'capa de aire',
    fr: 'lame d’air',
    hi: 'वायु परत',
    id: 'lapisan udara',
    pt: 'camada de ar',
  },
  'label.exaggeration': {
    ko: '두께 ×{k}',
    en: 'thickness ×{k}',
    ja: '厚さ ×{k}',
    zh: '厚度 ×{k}',
    ar: 'السُّمك ×{k}',
    es: 'grosor ×{k}',
    fr: 'épaisseur ×{k}',
    hi: 'मोटाई ×{k}',
    id: 'ketebalan ×{k}',
    pt: 'espessura ×{k}',
  },
  /** 두께 눈금 이름표 — 반 파장의 배수. 수식 표기라 표식이다 (C1 판정 3). */
  'label.hw1': {
    ko: 'λ/2',
    en: 'λ/2',
    ja: 'λ/2',
    zh: 'λ/2',
    ar: 'λ/2',
    es: 'λ/2',
    fr: 'λ/2',
    hi: 'λ/2',
    id: 'λ/2',
    pt: 'λ/2',
  },
  'label.hw2': {
    ko: 'λ',
    en: 'λ',
    ja: 'λ',
    zh: 'λ',
    ar: 'λ',
    es: 'λ',
    fr: 'λ',
    hi: 'λ',
    id: 'λ',
    pt: 'λ',
  },
  'label.hw3': {
    ko: '3λ/2',
    en: '3λ/2',
    ja: '3λ/2',
    zh: '3λ/2',
    ar: '3λ/2',
    es: '3λ/2',
    fr: '3λ/2',
    hi: '3λ/2',
    id: '3λ/2',
    pt: '3λ/2',
  },
  'label.hw4': {
    ko: '2λ',
    en: '2λ',
    ja: '2λ',
    zh: '2λ',
    ar: '2λ',
    es: '2λ',
    fr: '2λ',
    hi: '2λ',
    id: '2λ',
    pt: '2λ',
  },
  'label.hw5': {
    ko: '5λ/2',
    en: '5λ/2',
    ja: '5λ/2',
    zh: '5λ/2',
    ar: '5λ/2',
    es: '5λ/2',
    fr: '5λ/2',
    hi: '5λ/2',
    id: '5λ/2',
    pt: '5λ/2',
  },
  'label.hw6': {
    ko: '3λ',
    en: '3λ',
    ja: '3λ',
    zh: '3λ',
    ar: '3λ',
    es: '3λ',
    fr: '3λ',
    hi: '3λ',
    id: '3λ',
    pt: '3λ',
  },
  'caption.look': {
    ko: '렌즈가 평판에 닿은 가운데는 어둡고, 그 둘레로 어두운 고리가 겹겹이 선다',
    en: 'Where the lens touches the plate the centre is dark, and dark rings stand around it',
    ja: 'レンズが平板に触れる中心は暗く、そのまわりに暗い環が幾重にも並ぶ',
    zh: '透镜与平板接触的中心是暗的，周围一圈圈暗环层层排开',
    ar: 'حيث تلمس العدسة اللوح يكون المركز مظلمًا، وتقف حوله حلقات مظلمة',
    es: 'Donde la lente toca la placa el centro es oscuro, y a su alrededor se forman anillos oscuros',
    fr: 'Là où la lentille touche la lame, le centre est sombre, et des anneaux sombres l’entourent',
    hi: 'जहाँ लेंस प्लेट को छूता है वहाँ केंद्र अँधेरा है, और उसके चारों ओर अँधेरे वलय बनते हैं',
    id: 'Di tempat lensa menyentuh pelat, bagian tengah gelap, dan cincin-cincin gelap berdiri di sekelilingnya',
    pt: 'Onde a lente toca a placa o centro é escuro, e anéis escuros se formam ao redor',
  },
  'caption.steps': {
    ko: '두께 눈금에서 곡면을 거쳐 내린 선이 어두운 고리에 하나씩 닿는다',
    en: 'Each line dropped from a thickness tick through the curved surface lands on a dark ring',
    ja: '厚さの目盛りから曲面を通って下ろした線が、暗い環に一本ずつ届く',
    zh: '从厚度刻度经曲面引下的每条线都落在一个暗环上',
    ar: 'كل خط يُسقَط من علامة سُمك عبر السطح المنحني يقع على حلقة مظلمة',
    es: 'Cada línea bajada desde una marca de grosor a través de la superficie curva cae sobre un anillo oscuro',
    fr: 'Chaque ligne abaissée depuis une graduation d’épaisseur à travers la surface courbe tombe sur un anneau sombre',
    hi: 'मोटाई के हर निशान से वक्र पृष्ठ होकर उतारी गई हर रेखा एक अँधेरे वलय पर पड़ती है',
    id: 'Setiap garis yang ditarik turun dari tanda ketebalan melalui permukaan lengkung jatuh pada sebuah cincin gelap',
    pt: 'Cada linha baixada de uma marca de espessura através da superfície curva cai sobre um anel escuro',
  },
  'caption.result': {
    ko: '두께 계단은 똑같이 반 파장인데 바깥으로 갈수록 가로 폭이 좁아져, 고리 사이가 촘촘해졌다',
    en: 'Every thickness step is the same half wavelength, yet the steps narrow outward — the rings crowd together',
    ja: '厚さの段はどれも同じ半波長なのに、外へ行くほど段の幅が狭まる — 環が詰まっていく',
    zh: '每一级厚度台阶都是同样的半个波长，但台阶越往外越窄——环挤得越来越密',
    ar: 'كل درجة من درجات السُّمك تساوي نصف الطول الموجي نفسه، لكن الدرجات تضيق نحو الخارج — فتتزاحم الحلقات',
    es: 'Cada escalón de grosor es la misma media longitud de onda, pero los escalones se estrechan hacia fuera — los anillos se apiñan',
    fr: 'Chaque marche d’épaisseur vaut la même demi-longueur d’onde, mais les marches rétrécissent vers l’extérieur — les anneaux se resserrent',
    hi: 'मोटाई की हर सीढ़ी वही आधी तरंगदैर्घ्य है, फिर भी बाहर की ओर सीढ़ियाँ सँकरी होती जाती हैं — वलय पास-पास सिमट आते हैं',
    id: 'Setiap anak tangga ketebalan sama-sama setengah panjang gelombang, tetapi anak tangganya menyempit ke arah luar — cincin-cincin makin rapat',
    pt: 'Cada degrau de espessura é o mesmo meio comprimento de onda, mas os degraus se estreitam para fora — os anéis se apertam',
  },
} satisfies Record<string, LocalizedText>);

export type NewtonsRingsMessageKey = keyof typeof newtonsRingsMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: NewtonsRingsMessageKey): LocalizedText => newtonsRingsMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: NewtonsRingsMessageKey): string {
  return k;
}

/** 두께 눈금 m 번째(반 파장 m 개)의 이름표 키. 이보다 많이 표시하면 넘는 눈금은 이름표 없이 선다 (NOTES G105). */
export const HALF_WAVE_LABELS: readonly NewtonsRingsMessageKey[] = [
  'label.hw1',
  'label.hw2',
  'label.hw3',
  'label.hw4',
  'label.hw5',
  'label.hw6',
];

/** 고리 m 의 안내선을 긋는 단계 id. 시간표 선언과 scene 이 같은 이름을 쓴다. */
export const ringPhaseId = (m: number): string => `ring-${m}`;

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const newtonsRingsSchema: BundleSchema = {
  id: NEWTONS_RINGS_ID,
  label: text('label.title'),
  category: 'optics',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 두 그림이 있고, 계단이 하나씩 그어지고, 다시 처음으로.
  parameters: [],

  stages: [
    {
      id: 'lens-on-plate',
      label: text('label.stage'),
      constants: {
        lensRadius: LENS_RADIUS_M,
        wavelength: WAVELENGTH_NM,
        viewRadius: VIEW_RADIUS_MM,
        markedRings: MARKED_RINGS,
        exaggeration: THICKNESS_EXAGGERATION,
      },
    },
  ],

  environments: [],

  views: [{ id: 'section-and-top', label: text('label.view'), default: true }],

  /** 단면(약 170) 위에 무늬 반원(200)을 쌓는다 — 가로 축을 나눠 쓰려면 위아래뿐이다. */
  canvas: { height: 440, minHeight: 400 },

  /** 무늬(`scalarField`) 위에 테두리 · 표지가, 유리 위에 안내선이 와야 한다. scene 에 쓴 순서대로 그린다. */
  drawOrder: 'scene',

  /**
   * 한 주기 = 두 그림을 봄 → 고리마다 안내선 한 줄씩(`ring-1` … `ring-6`) → 계단을 읽음 → 흐려짐.
   * 고리 수(`markedRings`)와 `ring-*` 단계 수는 짝이다.
   */
  timeline: {
    phases: [
      { id: 'look', duration: LOOK, caption: key('caption.look') },
      { id: ringPhaseId(1), duration: RING_STEP, ease: 'smooth', caption: key('caption.steps') },
      { id: ringPhaseId(2), duration: RING_STEP, ease: 'smooth', caption: key('caption.steps') },
      { id: ringPhaseId(3), duration: RING_STEP, ease: 'smooth', caption: key('caption.steps') },
      { id: ringPhaseId(4), duration: RING_STEP, ease: 'smooth', caption: key('caption.steps') },
      { id: ringPhaseId(5), duration: RING_STEP, ease: 'smooth', caption: key('caption.steps') },
      { id: ringPhaseId(6), duration: RING_STEP, ease: 'smooth', caption: key('caption.steps') },
      { id: 'hold', duration: HOLD, caption: key('caption.result') },
      { id: 'fade', duration: FADE, caption: key('caption.result') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — 두 그림을 보는 단계 끝 무렵, 첫 안내선 직전에서 연다. */
  startAt: 1.6,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 두께 식 · 반지름 식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 640,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /** 그리드 · 카메라 단추 없음(기본값). 잴 것은 거리가 아니라 반 파장 계단과 고리 간격이다. */

  messages: newtonsRingsMessages,
};
