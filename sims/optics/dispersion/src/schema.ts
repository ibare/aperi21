// ========================================================================
// dispersion — 선언
// ========================================================================
// 질문: 흰빛 한 줄기가 유리 면 하나를 지나면 왜 색이 갈라지는가?
//
// 답: 같은 각으로 들어왔어도 유리의 굴절률이 색(파장)마다 조금씩 달라 — 보라 쪽이 높다 —
// 보라는 더 꺾이고 빨강은 덜 꺾인다. 흰 줄기가 경계에서 색 줄기 부채로 벌어진다.
// 옆의 굴절률-파장 곡선 위 점이 빨강에서 보라로 가는 동안 짚은 줄기가 법선 쪽으로 돈다.
//
// 이웃과 겹치지 않게 — `snells-law` 는 **매질**을 바꿔 꺾임이 달라지는 것을, 여기서는 매질은
// 그대로(유리 하나) 두고 **색**마다 꺾임이 다른 것을 보인다. 두 면에서 두 번 꺾는 것은 `prism`,
// 색을 섞는 것은 `color-addition` 의 몫이다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:dispersion` 와 문자 그대로 일치한다 (C4). */
export const DISPERSION_ID = 'dispersion';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 위 매질(공기)의 굴절률. */
export const N_AIR = 1.0;
/** 들어오는 각(법선에서 잰 도). 모든 색이 같은 각으로 들어온다 — 흰빛 한 줄기다. */
export const INCIDENT_DEG = 60;
/**
 * 굴절률-파장 곡선의 세 정박점 — BK7 유리의 빨강(C 선) · 파랑(F 선) · 보라(h 선).
 * 곡선은 이 세 점을 1/λ² 에 대한 이차식으로 잇는다(조각의 물리 계산). 화면 글자는 이 값을 그대로 쓴다.
 */
export const NM_RED = 656;
export const N_RED = 1.514;
export const NM_BLUE = 486;
export const N_BLUE = 1.522;
export const NM_VIOLET = 404;
export const N_VIOLET = 1.53;
/** 유리 속 색 줄기 수. 보라 정박점에서 빨강 정박점까지 파장을 고르게 나눈다. */
export const RAY_COUNT = 7;
/**
 * 색 사이 벌어짐의 과장 배율. 실제 벌어짐(60° 입사에서 빨강 34.89° · 보라 34.47°, 0.42°)은 화면에서
 * 한 줄로 겹친다 — 빨강 줄기의 각을 기준으로 다른 색이 벗어난 몫을 이만큼 키운다. 화면 위에 적는다.
 */
export const SPREAD_GAIN = 25;
/** 굴절률 글자의 소수 자릿수. `1.530` 의 끝자리 0 을 지키려고 선언한다. */
export const INDEX_DIGITS = 3;

// ------------------------------------------------------------------------
// 배치 — 월드 단위는 임의. 입사점이 원점, 경계면이 y = 0, 위가 공기.
// ------------------------------------------------------------------------

/** 빛 없음 판(왼쪽)의 사각형. 흰 줄기가 라이트 바탕에 묻히지 않게 깐다 (G92). */
export const PANEL = { minX: -2.2, maxX: 2.1, minY: -2.8, maxY: 1.6 } as const;
/** 들어오는 흰 줄기 · 유리 속 색 줄기의 길이(입사점에서). */
export const BEAM_IN_LEN = 1.8;
export const RAY_OUT_LEN = 2.95;
/** 판 밖 왼쪽 매질 이름의 x(오른쪽 맞춤) · 경계에서 위아래로 띄운 y. */
export const MEDIUM_LABEL_X = -2.35;
export const MEDIUM_LABEL_DY = 0.45;
/** 판 위 줄 — 법선 이름의 y. 과장 배율 글자는 판 아래에 둔다. */
export const PANEL_TOP_LABEL_Y = 1.82;

/** 곡선 그림의 칸 — 왼쪽 아래가 축의 원점. */
export const GRAPH = { minX: 3.25, maxX: 7.3, minY: -1.75, maxY: 1.25 } as const;
/** 곡선 가로축의 파장 범위(nm). 가시광 안쪽이다. */
export const GRAPH_NM_MIN = 380;
export const GRAPH_NM_MAX = 700;
/** 세로축 범위를 정박점 굴절률 폭에 대해 아래 · 위로 더 벌리는 몫. */
export const GRAPH_PAD_LOW = 0.3;
export const GRAPH_PAD_HIGH = 0.4;

/** 프레이밍 — 고정값. 왼쪽 판, 오른쪽 곡선, 아래 캡션 줄 (원칙 6). */
export const SCENE_BOUNDS = { minX: -3.05, maxX: 7.75, minY: -4.0, maxY: 2.05 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const dispersionMessages = Object.freeze({
  'label.title': {
    ko: '분산',
    en: 'Dispersion',
    ja: '分散',
    zh: '色散',
    ar: 'تفريق الضوء',
    es: 'Dispersión',
    fr: 'Dispersion',
    hi: 'वर्ण-विक्षेपण',
    id: 'Dispersi',
    pt: 'Dispersão',
  },
  'label.operation': {
    ko: '파장에 따른 굴절률 차이',
    en: 'Refractive index that depends on wavelength',
    ja: '波長によって異なる屈折率',
    zh: '随波长变化的折射率',
    ar: 'معامل انكسار يتوقف على الطول الموجي',
    es: 'Índice de refracción que depende de la longitud de onda',
    fr: 'Indice de réfraction qui dépend de la longueur d’onde',
    hi: 'तरंगदैर्घ्य पर निर्भर अपवर्तनांक',
    id: 'Indeks bias yang bergantung pada panjang gelombang',
    pt: 'Índice de refração que depende do comprimento de onda',
  },
  'label.stage': {
    ko: '공기에서 유리로',
    en: 'From air into glass',
    ja: '空気からガラスへ',
    zh: '从空气进入玻璃',
    ar: 'من الهواء إلى الزجاج',
    es: 'Del aire al vidrio',
    fr: 'De l’air vers le verre',
    hi: 'वायु से काँच में',
    id: 'Dari udara ke kaca',
    pt: 'Do ar para o vidro',
  },
  'label.view': {
    ko: '입사점과 곡선',
    en: 'Point of incidence and curve',
    ja: '入射点と曲線',
    zh: '入射点与曲线',
    ar: 'نقطة السقوط والمنحنى',
    es: 'Punto de incidencia y curva',
    fr: 'Point d’incidence et courbe',
    hi: 'आपतन बिंदु और वक्र',
    id: 'Titik datang dan kurva',
    pt: 'Ponto de incidência e curva',
  },

  /** 매질 이름 · 법선. */
  'label.air': {
    ko: '공기',
    en: 'Air',
    ja: '空気',
    zh: '空气',
    ar: 'الهواء',
    es: 'Aire',
    fr: 'Air',
    hi: 'वायु',
    id: 'Udara',
    pt: 'Ar',
  },
  'label.glass': {
    ko: '유리',
    en: 'Glass',
    ja: 'ガラス',
    zh: '玻璃',
    ar: 'الزجاج',
    es: 'Vidrio',
    fr: 'Verre',
    hi: 'काँच',
    id: 'Kaca',
    pt: 'Vidro',
  },
  'label.normal': {
    ko: '법선',
    en: 'Normal',
    ja: '法線',
    zh: '法线',
    ar: 'العمود',
    es: 'Normal',
    fr: 'Normale',
    hi: 'अभिलंब',
    id: 'Garis normal',
    pt: 'Normal',
  },
  /** 과장 배율. 스테이지 상수를 끼운다. */
  'label.gain': {
    ko: '색 사이 벌어짐 {k}배 과장',
    en: 'Spread between colours exaggerated ×{k}',
    ja: '色の間の広がりを ×{k} に誇張',
    zh: '色光之间的展开夸大 ×{k}',
    ar: 'التباعد بين الألوان مضخَّم ×{k}',
    es: 'Separación entre colores exagerada ×{k}',
    fr: 'Écart entre les couleurs exagéré ×{k}',
    hi: 'रंगों के बीच फैलाव ×{k} बढ़ा-चढ़ाकर',
    id: 'Sebaran antarwarna dilebih-lebihkan ×{k}',
    pt: 'Separação entre as cores exagerada ×{k}',
  },

  /** 곡선 축 이름. `n` · `nm` 은 기호라 두 언어가 같다. */
  'label.axisNm': {
    ko: '파장 (nm)',
    en: 'Wavelength (nm)',
    ja: '波長 (nm)',
    zh: '波长 (nm)',
    ar: 'الطول الموجي (nm)',
    es: 'Longitud de onda (nm)',
    fr: 'Longueur d’onde (nm)',
    hi: 'तरंगदैर्घ्य (nm)',
    id: 'Panjang gelombang (nm)',
    pt: 'Comprimento de onda (nm)',
  },
  'label.axisN': {
    ko: '굴절률 n',
    en: 'Refractive index n',
    ja: '屈折率 n',
    zh: '折射率 n',
    ar: 'معامل الانكسار n',
    es: 'Índice de refracción n',
    fr: 'Indice de réfraction n',
    hi: 'अपवर्तनांक n',
    id: 'Indeks bias n',
    pt: 'Índice de refração n',
  },
  /** 정박점 글자 — 수는 스테이지 상수. 기호 조립이라 두 언어가 같다. */
  'label.value': {
    ko: '{v}',
    en: '{v}',
    ja: '{v}',
    zh: '{v}',
    ar: '{v}',
    es: '{v}',
    fr: '{v}',
    hi: '{v}',
    id: '{v}',
    pt: '{v}',
  },

  'caption.enter': {
    ko: '흰빛 한 줄기가 공기에서 유리 면으로 {i}° 비스듬히 들어간다.',
    en: 'A single beam of white light meets the glass surface at {i}° from the air.',
    ja: '白色光の一本の光束が、空気からガラス面に{i}°で斜めに入る。',
    zh: '一束白光从空气以 {i}° 斜射到玻璃表面。',
    ar: 'حزمة واحدة من الضوء الأبيض تصل من الهواء إلى سطح الزجاج بزاوية {i}°.',
    es: 'Un único haz de luz blanca llega desde el aire a la superficie del vidrio con {i}°.',
    fr: 'Un seul faisceau de lumière blanche arrive de l’air sur la surface du verre sous {i}°.',
    hi: 'श्वेत प्रकाश का एक किरण-पुंज वायु से काँच की सतह पर {i}° पर पड़ता है।',
    id: 'Seberkas cahaya putih dari udara mengenai permukaan kaca pada {i}°.',
    pt: 'Um único feixe de luz branca atinge a superfície do vidro a {i}°, vindo do ar.',
  },
  'caption.split': {
    ko: '유리 면을 지나며 흰빛이 여러 색 줄기로 갈라진다.',
    en: 'Passing the glass surface, the white light splits into beams of different colours.',
    ja: 'ガラス面を通ると、白色光がいくつもの色の光束に分かれる。',
    zh: '穿过玻璃表面时，白光分成不同颜色的光束。',
    ar: 'عند عبور سطح الزجاج ينقسم الضوء الأبيض إلى حزم بألوان مختلفة.',
    es: 'Al atravesar la superficie del vidrio, la luz blanca se separa en haces de distintos colores.',
    fr: 'En traversant la surface du verre, la lumière blanche se sépare en faisceaux de couleurs différentes.',
    hi: 'काँच की सतह पार करते हुए श्वेत प्रकाश अलग-अलग रंगों के किरण-पुंजों में बँट जाता है।',
    id: 'Saat melewati permukaan kaca, cahaya putih terurai menjadi berkas-berkas berwarna berbeda.',
    pt: 'Ao atravessar a superfície do vidro, a luz branca se separa em feixes de cores diferentes.',
  },
  'caption.spread': {
    ko: '모두 같은 {i}° 로 들어왔는데 보라 줄기는 법선 쪽으로 가장 많이, 빨강 줄기는 가장 적게 꺾였다.',
    en: 'All came in at the same {i}°, yet the violet beam bent furthest toward the normal and the red beam the least.',
    ja: 'どれも同じ{i}°で入ってきたのに、紫の光束は法線の側へ最も大きく、赤の光束は最も小さく曲がった。',
    zh: '都以同样的 {i}° 入射，紫色光束却向法线偏折得最多，红色光束最少。',
    ar: 'دخلت كلها بالزاوية نفسها {i}°، ومع ذلك انحنت الحزمة البنفسجية نحو العمود أكثر من غيرها والحمراء أقل من غيرها.',
    es: 'Todos entraron con los mismos {i}°, pero el haz violeta se desvió más hacia la normal y el rojo, menos.',
    fr: 'Tous sont entrés sous le même angle de {i}°, pourtant le faisceau violet s’est le plus rapproché de la normale et le rouge le moins.',
    hi: 'सभी एक ही {i}° पर आए, फिर भी बैंगनी किरण-पुंज अभिलंब की ओर सबसे अधिक मुड़ा और लाल किरण-पुंज सबसे कम।',
    id: 'Semua masuk pada {i}° yang sama, tetapi berkas ungu membelok paling jauh mendekati garis normal dan berkas merah paling sedikit.',
    pt: 'Todos entraram com os mesmos {i}°, mas o feixe violeta se desviou mais em direção à normal e o vermelho, menos.',
  },
  'caption.focus': {
    ko: '빨강 줄기 하나만 짙게 남긴다.',
    en: 'Only the red beam stays bold.',
    ja: '赤の光束だけを濃く残す。',
    zh: '只让红色光束保持醒目。',
    ar: 'تبقى الحزمة الحمراء وحدها بارزة.',
    es: 'Solo el haz rojo queda resaltado.',
    fr: 'Seul le faisceau rouge reste marqué.',
    hi: 'केवल लाल किरण-पुंज गाढ़ा बना रहता है।',
    id: 'Hanya berkas merah yang tetap tebal.',
    pt: 'Só o feixe vermelho fica destacado.',
  },
  'caption.scan': {
    ko: '곡선 위 점이 빨강 {lr} nm 에서 보라 {lv} nm 로 가며 굴절률이 {nr} 에서 {nv} 로 오르고, 짚은 줄기는 법선 쪽으로 돈다.',
    en: 'As the point on the curve moves from red {lr} nm to violet {lv} nm, the index rises from {nr} to {nv} and the picked beam swings toward the normal.',
    ja: '曲線上の点が赤の{lr} nmから紫の{lv} nmへ動くと、屈折率は{nr}から{nv}へ上がり、選んだ光束は法線の側へ回る。',
    zh: '曲线上的点从红光 {lr} nm 移到紫光 {lv} nm 时，折射率从 {nr} 升到 {nv}，选中的光束向法线转去。',
    ar: 'مع انتقال النقطة على المنحنى من الأحمر {lr} nm إلى البنفسجي {lv} nm يرتفع معامل الانكسار من {nr} إلى {nv} وتدور الحزمة المختارة نحو العمود.',
    es: 'Al moverse el punto de la curva del rojo {lr} nm al violeta {lv} nm, el índice sube de {nr} a {nv} y el haz elegido gira hacia la normal.',
    fr: 'Quand le point de la courbe passe du rouge {lr} nm au violet {lv} nm, l’indice monte de {nr} à {nv} et le faisceau choisi pivote vers la normale.',
    hi: 'जब वक्र पर बिंदु लाल {lr} nm से बैंगनी {lv} nm की ओर जाता है, अपवर्तनांक {nr} से {nv} तक बढ़ता है और चुना गया किरण-पुंज अभिलंब की ओर घूमता है।',
    id: 'Saat titik pada kurva bergerak dari merah {lr} nm ke ungu {lv} nm, indeks bias naik dari {nr} ke {nv} dan berkas yang dipilih berayun mendekati garis normal.',
    pt: 'Conforme o ponto na curva vai do vermelho {lr} nm ao violeta {lv} nm, o índice sobe de {nr} para {nv} e o feixe escolhido gira em direção à normal.',
  },
  'caption.fade': {
    ko: '줄기들이 옅어진다.',
    en: 'The beams fade out.',
    ja: '光束が薄れていく。',
    zh: '光束渐渐变淡。',
    ar: 'تخفت الحزم.',
    es: 'Los haces se desvanecen.',
    fr: 'Les faisceaux s’estompent.',
    hi: 'किरण-पुंज धुँधले पड़ जाते हैं।',
    id: 'Berkas-berkas memudar.',
    pt: 'Os feixes se apagam.',
  },
} satisfies Record<string, LocalizedText>);

export type DispersionMessageKey = keyof typeof dispersionMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: DispersionMessageKey): LocalizedText => dispersionMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: DispersionMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const dispersionSchema: BundleSchema = {
  id: DISPERSION_ID,
  label: text('label.title'),
  category: 'optics',
  operation: text('label.operation'),
  timeModel: 'periodic',
  parameters: [],
  stages: [
    {
      id: 'air-into-glass',
      label: text('label.stage'),
      constants: {
        nAir: N_AIR,
        incidentDeg: INCIDENT_DEG,
        nmRed: NM_RED,
        nRed: N_RED,
        nmBlue: NM_BLUE,
        nBlue: N_BLUE,
        nmViolet: NM_VIOLET,
        nViolet: N_VIOLET,
        rayCount: RAY_COUNT,
        spreadGain: SPREAD_GAIN,
        indexDigits: INDEX_DIGITS,
      },
    },
  ],
  environments: [],
  views: [{ id: 'incidence', label: text('label.view'), default: true }],

  /** 가로로 넓다 — 왼쪽 빛 없음 판, 오른쪽 곡선, 아래 캡션 줄. */
  canvas: { height: 420, minHeight: 340 },

  /**
   * scene 에 쓴 순서대로 그린다. 빛 없음 판(`region`, 기본 층 45)이 줄기(`trajectory`, 20) 위로
   * 올라와 덮으면 안 된다 — 판이 맨 아래, 줄기가 그 위, 글자가 가장 나중이다.
   */
  drawOrder: 'scene',

  /** 도착한 순간 이미 색 줄기 부채가 펼쳐져 있다 (S-piece). */
  startAt: 3.4,

  /**
   * 한 주기 13.8 초.
   *
   * - `enter` — 흰 줄기가 유리 면까지 자란다.
   * - `split` — 입사점에서 색 줄기들이 유리 속으로 자란다. 곡선 위 색 점이 나타난다.
   * - `spread` — 부채가 다 펼쳐진 채 머문다.
   * - `focus` — 빨강 줄기 하나만 짙게 남기고 나머지를 옅게 한다.
   * - `scan` — 짚은 파장이 빨강에서 보라로 간다. 곡선 위 점과 유리 속 줄기가 함께 움직인다.
   * - `unfocus` — 짚기를 거두고 부채 전체로 돌아간다.
   * - `fade` — 줄기들이 옅어진다. 다음 주기에 흰 줄기가 다시 들어온다.
   */
  timeline: {
    phases: [
      { id: 'enter', duration: 1.3, caption: key('caption.enter') },
      { id: 'split', duration: 1.6, ease: 'smooth', caption: key('caption.split') },
      { id: 'spread', duration: 3.4, caption: key('caption.spread') },
      { id: 'focus', duration: 0.9, ease: 'smooth', caption: key('caption.focus') },
      { id: 'scan', duration: 4.4, ease: 'smooth', caption: key('caption.scan') },
      { id: 'unfocus', duration: 1.0, ease: 'smooth', caption: key('caption.scan') },
      { id: 'fade', duration: 1.2, ease: 'smooth', caption: key('caption.fade') },
    ],
  },

  /** 슬롯 하나. 캡션 속 수는 스테이지 상수에서 `initialState` 가 만든 문자열이다 (G133 우회). */
  caption: {
    anchor: { screen: 'bottom-left', offset: [18, -6] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 620,
    style: { colorRole: 'ink', emphasis: 'strong' },
    vars: {
      i: 'incidentText',
      lr: 'nmRedText',
      lv: 'nmVioletText',
      nr: 'nRedText',
      nv: 'nVioletText',
    },
  },

  // 그리드 · 카메라 단추 · 제목 · 범례 · 조작기 없음(기본).

  messages: dispersionMessages,
};
