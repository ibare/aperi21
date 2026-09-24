// ========================================================================
// stability-of-floating-body — 선언
// ========================================================================
// 질문: 무게중심이 부심보다 위에 있는데, 배는 왜 뒤집히지 않는가.
//
// 기울면 잠긴 단면의 모양이 바뀌어 부심이 낮은 쪽으로 옮겨 간다. 무게선 너머까지 가면
// 되세워지고, 못 미치면 넘어간다. 옮겨 가는 거리를 정하는 것은 배의 폭이다.
//
// 원본: tasks/piece-lab/stability-of-floating-body (손으로 짠 406줄).
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:stability-of-floating-body` 와 문자 그대로 일치한다 (C4). */
export const STABILITY_OF_FLOATING_BODY_ID = 'stability-of-floating-body';

// ------------------------------------------------------------------------
// 물리 상수 — 원본 index.html 그대로
// ------------------------------------------------------------------------

export const PHYS = {
  /** 중력 가속도(m/s²). */
  g: 9.8,
  /** 물의 저항을 흉내 낸 각속도 감쇠(1/s, 물리 시간). */
  damp: 0.35,
  /** 화면 1 초 = 물리 0.45 초 — 넘어가는 과정을 눈으로 따라가게. */
  timeScale: 0.45,
  /** 오른쪽이 낮아지는 쪽으로 8° 기운 채 놓인다(라디안, 반시계가 양). */
  heel0: (-8 * Math.PI) / 180,
  /** 똑바로 섰을 때 잠기는 깊이(m). 두 배 모두 같다. */
  draft: 0.5,
  /** 한 걸음(초). 원본 하네스의 고정 dt. */
  dt: 1 / 60,
  /** 한 걸음을 잘게 나누는 수. */
  substeps: 4,
  /** 실시간 dt 가 크게 튈 때 한 번에 따라잡는 걸음 상한. */
  maxSteps: 10,
  /** 부심 자취 — 몇 걸음마다 한 점, 최대 점 수. */
  trailEvery: 3,
  trailMax: 400,
  /** 반복 주기(화면 초). 이 주기마다 두 배를 같은 기울기에서 다시 놓는다. */
  cycle: 14,
} as const;

/** 두 배. 가르는 것은 폭 하나뿐이다. */
export const HULLS = [
  { id: 'wide', w: 3.0, h: 1.2 },
  { id: 'narrow', w: 1.5, h: 1.2 },
] as const;

/** 무게중심 높이(배 밑바닥에서, m) — 조작기 범위와 기본값. */
export const ZG = { min: 0.35, max: 1.1, step: 0.05, default: 0.7 } as const;

// ------------------------------------------------------------------------
// 배치 — 원본 캔버스(840 × 290 px, 1 m = 100 px, 수면이 위에서 132 px)를 월드로
// ------------------------------------------------------------------------

/**
 * 원본 1 px 이 월드로 몇 m 인가. 원본은 폭 840 px 에서 `S = min(W / 8.4, 100)` 이었다.
 * 화살촉 · 눈금 · 호 반지름처럼 원본이 화면 px 로 둔 크기를 이것으로 옮긴다 —
 * 화면 px 고정 크기가 없어 임베드 폭을 따라 함께 줄어든다 (NOTES 「어휘 부족」 G25).
 */
export const PX = 0.01;

/** 월드 가로 = 원본 캔버스 폭 8.4 m. 수면은 y = 0. */
export const WORLD = {
  width: 8.4,
  /** 캔버스 위 끝(수면 위 132 px). */
  top: 1.32,
  /** 물 아래 끝(원본 캔버스 아래 끝, 수면 아래 158 px). */
  waterBottom: -1.58,
} as const;

/** 두 배의 중심 x — 원본 `W * 0.30`, `W * 0.74`. */
export const CENTERS = [0.3 * WORLD.width, 0.74 * WORLD.width] as const;

/**
 * 고정 경계. 원본은 캔버스 아래에 캡션 두 줄과 조작기 한 줄을 따로 두었다. 여기서는
 * 캡션 · 조작기가 캔버스 안에 들어오므로 물 아래로 그만큼 바탕을 더 잡는다 (G24).
 */
export const SCENE_BOUNDS = {
  minX: 0,
  maxX: WORLD.width,
  minY: WORLD.waterBottom - 0.98,
  maxY: WORLD.top,
} as const;

/** 선 굵기 · 크기 — 원본 px 그대로. */
export const DRAW = {
  hullStrokePx: 1.6,
  deckPx: 5,
  hatchPx: 1,
  hatchSpacingPx: 7,
  hatchOpacity: 0.4,
  /** 수압 화살 — 깊이 1 m 당 화살 길이(m), 면 표본 간격(m), 이보다 짧으면 화살을 긋지 않음(px). */
  pressureK: 0.4,
  pressureSample: 0.15,
  pressureMinPx: 5,
  pressureHeadBackPx: 4,
  pressureHeadHalfPx: 2.5,
  pressureFillOpacity: 0.2,
  pressureLineOpacity: 0.85,
  trailPx: 1.5,
  trailOpacity: 0.55,
  /** 중력 작용선이 내려가는 곳(수면 아래 m), 부력 작용선이 무게중심 위로 올라가는 곳(m). */
  gravityLineTo: -1.35,
  buoyLineAboveG: 0.75,
  actionLinePx: 1,
  /** 짝힘 — 팔 막대 높이(무게중심 위 m), 굵기, 끝 눈금 반길이, 호 반지름, 그리지 않는 간격. */
  coupleBarAboveG: 0.55,
  couplePx: 2.2,
  coupleTickPx: 4,
  coupleArcPx: 20,
  coupleMinPx: 1.5,
  coupleHeadTipPx: 6,
  coupleHeadBackPx: 2,
  coupleHeadHalfPx: 4,
  buoyRadiusPx: 4.5,
  gRadiusPx: 5,
  gDotPx: 1.8,
  labelFontPx: 12,
  buoyLabelDyPx: 15,
  gLabelDxPx: -30,
  surfacePx: 1.2,
  /** 배 이름 — 캔버스 위에서 12 px 에 윗선을 맞춘 13 px 글자의 가운데. */
  nameFontPx: 13,
  nameY: WORLD.top - 0.185,
  captionPx: 15,
  /** 물 — 수면(y = 0)에서 원본 위 끝 색, 바닥에서 아래 끝 색이 되도록 깊이를 값 범위에 놓는다. */
  waterRows: 32,
  waterRange: [-0.35, 2.6] as const,
  /** 흐려지는 시간(초). */
  fade: 0.3,
} as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const stabilityOfFloatingBodyMessages = Object.freeze({
  'label.title': {
    ko: '부유체의 안정',
    en: 'Stability of a floating body',
    ja: '浮体の安定',
    zh: '浮体的稳定性',
    ar: 'استقرار الجسم الطافي',
    es: 'Estabilidad de un cuerpo flotante',
    fr: 'Stabilité d’un corps flottant',
    hi: 'प्लवमान पिंड का स्थायित्व',
    id: 'Kestabilan benda terapung',
    pt: 'Estabilidade de um corpo flutuante',
  },
  'label.operation': {
    ko: '기울면 부심이 옮겨 가 배를 되세운다',
    en: 'When a boat heels, its centre of buoyancy shifts and rights it',
    ja: '船が傾くと浮心が移り、船を起き直らせる',
    zh: '船倾斜时，浮心移动，把船扶正',
    ar: 'عندما يميل القارب ينتقل مركز طفوه فيعيده إلى الاعتدال',
    es: 'Cuando un barco escora, su centro de empuje se desplaza y lo endereza',
    fr: 'Quand un bateau gîte, son centre de poussée se déplace et le redresse',
    hi: 'जब नाव झुकती है, उसका उत्प्लावन केंद्र खिसककर उसे सीधा कर देता है',
    id: 'Saat perahu miring, pusat apungnya bergeser dan menegakkannya kembali',
    pt: 'Quando um barco aderna, seu centro de empuxo se desloca e o endireita',
  },
  'label.stage': {
    ko: '물',
    en: 'Water',
    ja: '水',
    zh: '水',
    ar: 'الماء',
    es: 'Agua',
    fr: 'Eau',
    hi: 'जल',
    id: 'Air',
    pt: 'Água',
  },
  'label.view': {
    ko: '두 배',
    en: 'Two boats',
    ja: '2隻の船',
    zh: '两条船',
    ar: 'قاربان',
    es: 'Dos barcos',
    fr: 'Deux bateaux',
    hi: 'दो नावें',
    id: 'Dua perahu',
    pt: 'Dois barcos',
  },
  /** 배 이름. 폭은 대조의 유일한 변수라 둔다. 수와 단위는 표식이다 (C1 판정 3). */
  'label.wide': {
    ko: '넓은 배 · 폭 {w} m',
    en: 'Wide boat · beam {w} m',
    ja: '広い船 · 幅 {w} m',
    zh: '宽船 · 船宽 {w} m',
    ar: 'القارب العريض · العرض {w} m',
    es: 'Barco ancho · manga {w} m',
    fr: 'Bateau large · largeur {w} m',
    hi: 'चौड़ी नाव · चौड़ाई {w} m',
    id: 'Perahu lebar · lebar {w} m',
    pt: 'Barco largo · largura {w} m',
  },
  'label.narrow': {
    ko: '좁은 배 · 폭 {w} m',
    en: 'Narrow boat · beam {w} m',
    ja: '狭い船 · 幅 {w} m',
    zh: '窄船 · 船宽 {w} m',
    ar: 'القارب الضيق · العرض {w} m',
    es: 'Barco estrecho · manga {w} m',
    fr: 'Bateau étroit · largeur {w} m',
    hi: 'संकरी नाव · चौड़ाई {w} m',
    id: 'Perahu sempit · lebar {w} m',
    pt: 'Barco estreito · largura {w} m',
  },
  'label.buoyancy': {
    ko: '부심',
    en: 'B',
    ja: 'B',
    zh: 'B',
    ar: 'B',
    es: 'B',
    fr: 'B',
    hi: 'B',
    id: 'B',
    pt: 'B',
  },
  'label.gravity': {
    ko: '무게중심',
    en: 'G',
    ja: 'G',
    zh: 'G',
    ar: 'G',
    es: 'G',
    fr: 'G',
    hi: 'G',
    id: 'G',
    pt: 'G',
  },
  'label.zg': {
    ko: '무게중심 높이(배 밑바닥에서)',
    en: 'Height of G (above the keel)',
    ja: 'G の高さ(船底から)',
    zh: 'G 的高度（从船底算起）',
    ar: 'ارتفاع G (فوق قاع القارب)',
    es: 'Altura de G (sobre la quilla)',
    fr: 'Hauteur de G (au-dessus de la quille)',
    hi: 'G की ऊँचाई (पेंदे से ऊपर)',
    id: 'Tinggi G (di atas lunas)',
    pt: 'Altura de G (acima da quilha)',
  },

  // 캡션 — 넓은 배 상태 2 × 좁은 배 상태 6. 한 문장 안의 두 절이지만 값 틀에 문안 키를
  // 끼울 수 없어(G14) 조합마다 문장 하나를 둔다.
  'caption.wRestoringNShort': {
    ko: '넓은 배는 기울 때마다 부심이 낮은 쪽으로 무게중심 너머까지 옮겨 가 되세워진다. 좁은 배는 부심이 옮겨 가도 무게중심 아래까지 못 미쳐 점점 더 넘어간다.',
    en: "The wide boat is righted each time it heels: its centre of buoyancy moves to the low side, past the centre of gravity. The narrow boat's centre of buoyancy moves too, but falls short of the centre of gravity, so it heels further and further.",
    ja: '広い船は傾くたびに、浮心が低い側へ重心の向こうまで移り、起き直る。狭い船の浮心も移るが、重心まで届かず、どんどん傾いていく。',
    zh: '宽船每次倾斜时，浮心都移向低的一侧、越过重心，船便被扶正。窄船的浮心也会移动，但够不到重心，于是越倾越厉害。',
    ar: 'يعتدل القارب العريض كلما مال: ينتقل مركز طفوه إلى الجانب المنخفض متجاوزًا مركز الثقل. ينتقل مركز طفو القارب الضيق أيضًا، لكنه لا يبلغ مركز الثقل، فيميل أكثر فأكثر.',
    es: 'El barco ancho se endereza cada vez que escora: su centro de empuje se desplaza hacia el lado bajo, más allá del centro de gravedad. El centro de empuje del barco estrecho también se desplaza, pero no llega al centro de gravedad, así que escora cada vez más.',
    fr: 'Le bateau large se redresse chaque fois qu’il gîte : son centre de poussée se déplace vers le côté bas, au-delà du centre de gravité. Le centre de poussée du bateau étroit se déplace aussi, mais n’atteint pas le centre de gravité : il gîte de plus en plus.',
    hi: 'चौड़ी नाव हर बार झुकने पर सीधी हो जाती है: उसका उत्प्लावन केंद्र नीचे वाली ओर गुरुत्व केंद्र से आगे तक खिसक जाता है। संकरी नाव का उत्प्लावन केंद्र भी खिसकता है, पर गुरुत्व केंद्र तक नहीं पहुँचता, इसलिए वह और-और झुकती जाती है।',
    id: 'Perahu lebar tegak kembali setiap kali miring: pusat apungnya bergeser ke sisi yang rendah, melewati titik berat. Pusat apung perahu sempit juga bergeser, tetapi tidak sampai ke titik berat, sehingga perahu makin lama makin miring.',
    pt: 'O barco largo se endireita toda vez que aderna: seu centro de empuxo se desloca para o lado baixo, além do centro de gravidade. O centro de empuxo do barco estreito também se desloca, mas não chega ao centro de gravidade, e ele aderna cada vez mais.',
  },
  'caption.wRestoringNOvershoot': {
    ko: '넓은 배는 기울 때마다 부심이 낮은 쪽으로 무게중심 너머까지 옮겨 가 되세워진다. 좁은 배는 부심이 무게중심 너머로 왔지만 넘어가던 기세로 더 기운다.',
    en: "The wide boat is righted each time it heels: its centre of buoyancy moves to the low side, past the centre of gravity. The narrow boat's centre of buoyancy is now past the centre of gravity, but its momentum carries it further over.",
    ja: '広い船は傾くたびに、浮心が低い側へ重心の向こうまで移り、起き直る。狭い船の浮心はもう重心の向こうにあるが、傾いてきた勢いでさらに傾く。',
    zh: '宽船每次倾斜时，浮心都移向低的一侧、越过重心，船便被扶正。窄船的浮心已越过重心，但倾倒的势头使它倾得更厉害。',
    ar: 'يعتدل القارب العريض كلما مال: ينتقل مركز طفوه إلى الجانب المنخفض متجاوزًا مركز الثقل. صار مركز طفو القارب الضيق متجاوزًا مركز الثقل، لكن اندفاعه يحمله إلى ميل أكبر.',
    es: 'El barco ancho se endereza cada vez que escora: su centro de empuje se desplaza hacia el lado bajo, más allá del centro de gravedad. El centro de empuje del barco estrecho ya está más allá del centro de gravedad, pero su impulso lo hace escorar aún más.',
    fr: 'Le bateau large se redresse chaque fois qu’il gîte : son centre de poussée se déplace vers le côté bas, au-delà du centre de gravité. Le centre de poussée du bateau étroit a maintenant dépassé le centre de gravité, mais son élan l’entraîne encore plus loin.',
    hi: 'चौड़ी नाव हर बार झुकने पर सीधी हो जाती है: उसका उत्प्लावन केंद्र नीचे वाली ओर गुरुत्व केंद्र से आगे तक खिसक जाता है। संकरी नाव का उत्प्लावन केंद्र अब गुरुत्व केंद्र से आगे है, पर उसका संवेग उसे और झुका ले जाता है।',
    id: 'Perahu lebar tegak kembali setiap kali miring: pusat apungnya bergeser ke sisi yang rendah, melewati titik berat. Pusat apung perahu sempit kini sudah melewati titik berat, tetapi momentumnya membuatnya miring lebih jauh.',
    pt: 'O barco largo se endireita toda vez que aderna: seu centro de empuxo se desloca para o lado baixo, além do centro de gravidade. O centro de empuxo do barco estreito já passou do centro de gravidade, mas o embalo o faz adernar ainda mais.',
  },
  'caption.wRestoringNSway': {
    ko: '넓은 배는 기울 때마다 부심이 낮은 쪽으로 무게중심 너머까지 옮겨 가 되세워진다. 좁은 배는 처음보다 크게 기운 자리를 중심으로 흔들린다.',
    en: 'The wide boat is righted each time it heels: its centre of buoyancy moves to the low side, past the centre of gravity. The narrow boat rocks about a heel larger than the one it started with.',
    ja: '広い船は傾くたびに、浮心が低い側へ重心の向こうまで移り、起き直る。狭い船は、最初より大きく傾いた位置を中心に揺れる。',
    zh: '宽船每次倾斜时，浮心都移向低的一侧、越过重心，船便被扶正。窄船围绕一个比起初更大的倾角摇晃。',
    ar: 'يعتدل القارب العريض كلما مال: ينتقل مركز طفوه إلى الجانب المنخفض متجاوزًا مركز الثقل. يتأرجح القارب الضيق حول ميل أكبر من الميل الذي بدأ به.',
    es: 'El barco ancho se endereza cada vez que escora: su centro de empuje se desplaza hacia el lado bajo, más allá del centro de gravedad. El barco estrecho se balancea en torno a una escora mayor que la inicial.',
    fr: 'Le bateau large se redresse chaque fois qu’il gîte : son centre de poussée se déplace vers le côté bas, au-delà du centre de gravité. Le bateau étroit oscille autour d’une gîte plus grande que celle de départ.',
    hi: 'चौड़ी नाव हर बार झुकने पर सीधी हो जाती है: उसका उत्प्लावन केंद्र नीचे वाली ओर गुरुत्व केंद्र से आगे तक खिसक जाता है। संकरी नाव शुरुआत से बड़े झुकाव के आसपास डोलती है।',
    id: 'Perahu lebar tegak kembali setiap kali miring: pusat apungnya bergeser ke sisi yang rendah, melewati titik berat. Perahu sempit berayun di sekitar kemiringan yang lebih besar daripada kemiringan awalnya.',
    pt: 'O barco largo se endireita toda vez que aderna: seu centro de empuxo se desloca para o lado baixo, além do centro de gravidade. O barco estreito balança em torno de uma inclinação maior que a inicial.',
  },
  /** 원본에 없던 문구 — 조작값 0.80 m 이상에서 좁은 배가 뒤집힌다 (NOTES 「원본과 달라진 점」). */
  'caption.wRestoringNCapsize': {
    ko: '넓은 배는 기울 때마다 부심이 낮은 쪽으로 무게중심 너머까지 옮겨 가 되세워진다. 좁은 배는 부심이 끝내 무게중심 너머까지 가지 못해 뒤집혔다.',
    en: "The wide boat is righted each time it heels: its centre of buoyancy moves to the low side, past the centre of gravity. The narrow boat's centre of buoyancy never got past the centre of gravity, so it capsized.",
    ja: '広い船は傾くたびに、浮心が低い側へ重心の向こうまで移り、起き直る。狭い船の浮心はついに重心の向こうまで行けず、転覆した。',
    zh: '宽船每次倾斜时，浮心都移向低的一侧、越过重心，船便被扶正。窄船的浮心始终没能越过重心，于是翻覆了。',
    ar: 'يعتدل القارب العريض كلما مال: ينتقل مركز طفوه إلى الجانب المنخفض متجاوزًا مركز الثقل. لم يتجاوز مركز طفو القارب الضيق مركز الثقل قط، فانقلب.',
    es: 'El barco ancho se endereza cada vez que escora: su centro de empuje se desplaza hacia el lado bajo, más allá del centro de gravedad. El centro de empuje del barco estrecho nunca pasó más allá del centro de gravedad, así que zozobró.',
    fr: 'Le bateau large se redresse chaque fois qu’il gîte : son centre de poussée se déplace vers le côté bas, au-delà du centre de gravité. Le centre de poussée du bateau étroit n’a jamais dépassé le centre de gravité : il a chaviré.',
    hi: 'चौड़ी नाव हर बार झुकने पर सीधी हो जाती है: उसका उत्प्लावन केंद्र नीचे वाली ओर गुरुत्व केंद्र से आगे तक खिसक जाता है। संकरी नाव का उत्प्लावन केंद्र कभी गुरुत्व केंद्र से आगे नहीं जा पाया, इसलिए वह पलट गई।',
    id: 'Perahu lebar tegak kembali setiap kali miring: pusat apungnya bergeser ke sisi yang rendah, melewati titik berat. Pusat apung perahu sempit tidak pernah melewati titik berat, sehingga perahu terbalik.',
    pt: 'O barco largo se endireita toda vez que aderna: seu centro de empuxo se desloca para o lado baixo, além do centro de gravidade. O centro de empuxo do barco estreito nunca passou do centro de gravidade, e ele emborcou.',
  },
  'caption.wRestoringNRestoring': {
    ko: '넓은 배는 기울 때마다 부심이 낮은 쪽으로 무게중심 너머까지 옮겨 가 되세워진다. 좁은 배는 기울 때마다 부심이 낮은 쪽으로 무게중심 너머까지 옮겨 가 되세워진다.',
    en: 'The wide boat is righted each time it heels: its centre of buoyancy moves to the low side, past the centre of gravity. The narrow boat is righted the same way each time it heels.',
    ja: '広い船は傾くたびに、浮心が低い側へ重心の向こうまで移り、起き直る。狭い船も傾くたびに同じように起き直る。',
    zh: '宽船每次倾斜时，浮心都移向低的一侧、越过重心，船便被扶正。窄船每次倾斜时也同样被扶正。',
    ar: 'يعتدل القارب العريض كلما مال: ينتقل مركز طفوه إلى الجانب المنخفض متجاوزًا مركز الثقل. ويعتدل القارب الضيق بالطريقة نفسها كلما مال.',
    es: 'El barco ancho se endereza cada vez que escora: su centro de empuje se desplaza hacia el lado bajo, más allá del centro de gravedad. El barco estrecho se endereza del mismo modo cada vez que escora.',
    fr: 'Le bateau large se redresse chaque fois qu’il gîte : son centre de poussée se déplace vers le côté bas, au-delà du centre de gravité. Le bateau étroit se redresse de la même façon chaque fois qu’il gîte.',
    hi: 'चौड़ी नाव हर बार झुकने पर सीधी हो जाती है: उसका उत्प्लावन केंद्र नीचे वाली ओर गुरुत्व केंद्र से आगे तक खिसक जाता है। संकरी नाव भी हर बार झुकने पर इसी तरह सीधी हो जाती है।',
    id: 'Perahu lebar tegak kembali setiap kali miring: pusat apungnya bergeser ke sisi yang rendah, melewati titik berat. Perahu sempit tegak kembali dengan cara yang sama setiap kali miring.',
    pt: 'O barco largo se endireita toda vez que aderna: seu centro de empuxo se desloca para o lado baixo, além do centro de gravidade. O barco estreito se endireita do mesmo jeito toda vez que aderna.',
  },
  'caption.wRestoringNUpright': {
    ko: '넓은 배는 기울 때마다 부심이 낮은 쪽으로 무게중심 너머까지 옮겨 가 되세워진다. 좁은 배는 똑바로 섰다.',
    en: 'The wide boat is righted each time it heels: its centre of buoyancy moves to the low side, past the centre of gravity. The narrow boat is upright.',
    ja: '広い船は傾くたびに、浮心が低い側へ重心の向こうまで移り、起き直る。狭い船はまっすぐ立っている。',
    zh: '宽船每次倾斜时，浮心都移向低的一侧、越过重心，船便被扶正。窄船保持直立。',
    ar: 'يعتدل القارب العريض كلما مال: ينتقل مركز طفوه إلى الجانب المنخفض متجاوزًا مركز الثقل. القارب الضيق معتدل.',
    es: 'El barco ancho se endereza cada vez que escora: su centro de empuje se desplaza hacia el lado bajo, más allá del centro de gravedad. El barco estrecho está derecho.',
    fr: 'Le bateau large se redresse chaque fois qu’il gîte : son centre de poussée se déplace vers le côté bas, au-delà du centre de gravité. Le bateau étroit est droit.',
    hi: 'चौड़ी नाव हर बार झुकने पर सीधी हो जाती है: उसका उत्प्लावन केंद्र नीचे वाली ओर गुरुत्व केंद्र से आगे तक खिसक जाता है। संकरी नाव सीधी खड़ी है।',
    id: 'Perahu lebar tegak kembali setiap kali miring: pusat apungnya bergeser ke sisi yang rendah, melewati titik berat. Perahu sempit tegak.',
    pt: 'O barco largo se endireita toda vez que aderna: seu centro de empuxo se desloca para o lado baixo, além do centro de gravidade. O barco estreito está aprumado.',
  },
  'caption.wUprightNShort': {
    ko: '넓은 배는 똑바로 섰다. 좁은 배는 부심이 옮겨 가도 무게중심 아래까지 못 미쳐 점점 더 넘어간다.',
    en: "The wide boat is upright. The narrow boat's centre of buoyancy moves, but falls short of the centre of gravity, so it heels further and further.",
    ja: '広い船はまっすぐ立っている。狭い船の浮心は移るが、重心まで届かず、どんどん傾いていく。',
    zh: '宽船保持直立。窄船的浮心会移动，但够不到重心，于是越倾越厉害。',
    ar: 'القارب العريض معتدل. ينتقل مركز طفو القارب الضيق، لكنه لا يبلغ مركز الثقل، فيميل أكثر فأكثر.',
    es: 'El barco ancho está derecho. El centro de empuje del barco estrecho se desplaza, pero no llega al centro de gravedad, así que escora cada vez más.',
    fr: 'Le bateau large est droit. Le centre de poussée du bateau étroit se déplace, mais n’atteint pas le centre de gravité : il gîte de plus en plus.',
    hi: 'चौड़ी नाव सीधी खड़ी है। संकरी नाव का उत्प्लावन केंद्र खिसकता है, पर गुरुत्व केंद्र तक नहीं पहुँचता, इसलिए वह और-और झुकती जाती है।',
    id: 'Perahu lebar tegak. Pusat apung perahu sempit bergeser, tetapi tidak sampai ke titik berat, sehingga perahu makin lama makin miring.',
    pt: 'O barco largo está aprumado. O centro de empuxo do barco estreito se desloca, mas não chega ao centro de gravidade, e ele aderna cada vez mais.',
  },
  'caption.wUprightNOvershoot': {
    ko: '넓은 배는 똑바로 섰다. 좁은 배는 부심이 무게중심 너머로 왔지만 넘어가던 기세로 더 기운다.',
    en: "The wide boat is upright. The narrow boat's centre of buoyancy is now past the centre of gravity, but its momentum carries it further over.",
    ja: '広い船はまっすぐ立っている。狭い船の浮心はもう重心の向こうにあるが、傾いてきた勢いでさらに傾く。',
    zh: '宽船保持直立。窄船的浮心已越过重心，但倾倒的势头使它倾得更厉害。',
    ar: 'القارب العريض معتدل. صار مركز طفو القارب الضيق متجاوزًا مركز الثقل، لكن اندفاعه يحمله إلى ميل أكبر.',
    es: 'El barco ancho está derecho. El centro de empuje del barco estrecho ya está más allá del centro de gravedad, pero su impulso lo hace escorar aún más.',
    fr: 'Le bateau large est droit. Le centre de poussée du bateau étroit a maintenant dépassé le centre de gravité, mais son élan l’entraîne encore plus loin.',
    hi: 'चौड़ी नाव सीधी खड़ी है। संकरी नाव का उत्प्लावन केंद्र अब गुरुत्व केंद्र से आगे है, पर उसका संवेग उसे और झुका ले जाता है।',
    id: 'Perahu lebar tegak. Pusat apung perahu sempit kini sudah melewati titik berat, tetapi momentumnya membuatnya miring lebih jauh.',
    pt: 'O barco largo está aprumado. O centro de empuxo do barco estreito já passou do centro de gravidade, mas o embalo o faz adernar ainda mais.',
  },
  'caption.wUprightNSway': {
    ko: '넓은 배는 똑바로 섰다. 좁은 배는 처음보다 크게 기운 자리를 중심으로 흔들린다.',
    en: 'The wide boat is upright. The narrow boat rocks about a heel larger than the one it started with.',
    ja: '広い船はまっすぐ立っている。狭い船は、最初より大きく傾いた位置を中心に揺れる。',
    zh: '宽船保持直立。窄船围绕一个比起初更大的倾角摇晃。',
    ar: 'القارب العريض معتدل. يتأرجح القارب الضيق حول ميل أكبر من الميل الذي بدأ به.',
    es: 'El barco ancho está derecho. El barco estrecho se balancea en torno a una escora mayor que la inicial.',
    fr: 'Le bateau large est droit. Le bateau étroit oscille autour d’une gîte plus grande que celle de départ.',
    hi: 'चौड़ी नाव सीधी खड़ी है। संकरी नाव शुरुआत से बड़े झुकाव के आसपास डोलती है।',
    id: 'Perahu lebar tegak. Perahu sempit berayun di sekitar kemiringan yang lebih besar daripada kemiringan awalnya.',
    pt: 'O barco largo está aprumado. O barco estreito balança em torno de uma inclinação maior que a inicial.',
  },
  'caption.wUprightNCapsize': {
    ko: '넓은 배는 똑바로 섰다. 좁은 배는 부심이 끝내 무게중심 너머까지 가지 못해 뒤집혔다.',
    en: "The wide boat is upright. The narrow boat's centre of buoyancy never got past the centre of gravity, so it capsized.",
    ja: '広い船はまっすぐ立っている。狭い船の浮心はついに重心の向こうまで行けず、転覆した。',
    zh: '宽船保持直立。窄船的浮心始终没能越过重心，于是翻覆了。',
    ar: 'القارب العريض معتدل. لم يتجاوز مركز طفو القارب الضيق مركز الثقل قط، فانقلب.',
    es: 'El barco ancho está derecho. El centro de empuje del barco estrecho nunca pasó más allá del centro de gravedad, así que zozobró.',
    fr: 'Le bateau large est droit. Le centre de poussée du bateau étroit n’a jamais dépassé le centre de gravité : il a chaviré.',
    hi: 'चौड़ी नाव सीधी खड़ी है। संकरी नाव का उत्प्लावन केंद्र कभी गुरुत्व केंद्र से आगे नहीं जा पाया, इसलिए वह पलट गई।',
    id: 'Perahu lebar tegak. Pusat apung perahu sempit tidak pernah melewati titik berat, sehingga perahu terbalik.',
    pt: 'O barco largo está aprumado. O centro de empuxo do barco estreito nunca passou do centro de gravidade, e ele emborcou.',
  },
  'caption.wUprightNRestoring': {
    ko: '넓은 배는 똑바로 섰다. 좁은 배는 기울 때마다 부심이 낮은 쪽으로 무게중심 너머까지 옮겨 가 되세워진다.',
    en: 'The wide boat is upright. The narrow boat is righted each time it heels: its centre of buoyancy moves to the low side, past the centre of gravity.',
    ja: '広い船はまっすぐ立っている。狭い船は傾くたびに、浮心が低い側へ重心の向こうまで移り、起き直る。',
    zh: '宽船保持直立。窄船每次倾斜时，浮心都移向低的一侧、越过重心，船便被扶正。',
    ar: 'القارب العريض معتدل. يعتدل القارب الضيق كلما مال: ينتقل مركز طفوه إلى الجانب المنخفض متجاوزًا مركز الثقل.',
    es: 'El barco ancho está derecho. El barco estrecho se endereza cada vez que escora: su centro de empuje se desplaza hacia el lado bajo, más allá del centro de gravedad.',
    fr: 'Le bateau large est droit. Le bateau étroit se redresse chaque fois qu’il gîte : son centre de poussée se déplace vers le côté bas, au-delà du centre de gravité.',
    hi: 'चौड़ी नाव सीधी खड़ी है। संकरी नाव हर बार झुकने पर सीधी हो जाती है: उसका उत्प्लावन केंद्र नीचे वाली ओर गुरुत्व केंद्र से आगे तक खिसक जाता है।',
    id: 'Perahu lebar tegak. Perahu sempit tegak kembali setiap kali miring: pusat apungnya bergeser ke sisi yang rendah, melewati titik berat.',
    pt: 'O barco largo está aprumado. O barco estreito se endireita toda vez que aderna: seu centro de empuxo se desloca para o lado baixo, além do centro de gravidade.',
  },
  'caption.wUprightNUpright': {
    ko: '넓은 배는 똑바로 섰다. 좁은 배는 똑바로 섰다.',
    en: 'The wide boat is upright. The narrow boat is upright.',
    ja: '広い船はまっすぐ立っている。狭い船はまっすぐ立っている。',
    zh: '宽船保持直立。窄船保持直立。',
    ar: 'القارب العريض معتدل. القارب الضيق معتدل.',
    es: 'El barco ancho está derecho. El barco estrecho está derecho.',
    fr: 'Le bateau large est droit. Le bateau étroit est droit.',
    hi: 'चौड़ी नाव सीधी खड़ी है। संकरी नाव सीधी खड़ी है।',
    id: 'Perahu lebar tegak. Perahu sempit tegak.',
    pt: 'O barco largo está aprumado. O barco estreito está aprumado.',
  },
} satisfies Record<string, LocalizedText>);

export type StabilityOfFloatingBodyMessageKey = keyof typeof stabilityOfFloatingBodyMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: StabilityOfFloatingBodyMessageKey): LocalizedText =>
  stabilityOfFloatingBodyMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: StabilityOfFloatingBodyMessageKey): string {
  return k;
}

/** 넓은 배가 말하는 상태 · 좁은 배가 말하는 상태. 캡션 조합의 이름이 된다. */
export const WIDE_PHRASES = ['Restoring', 'Upright'] as const;
export const NARROW_PHRASES = ['Short', 'Overshoot', 'Sway', 'Capsize', 'Restoring', 'Upright'] as const;
export type WidePhrase = (typeof WIDE_PHRASES)[number];
export type NarrowPhrase = (typeof NARROW_PHRASES)[number];
export type CaptionCase = `w${WidePhrase}N${NarrowPhrase}`;

/** 조합 이름 → 캡션 문안 키. */
function captionKey(c: CaptionCase): string {
  return key(`caption.${c}` as StabilityOfFloatingBodyMessageKey);
}

/** 기본 문안(도착 순간)이 아닌 조합. `cases.when` 은 상태의 `cap.<조합>` 을 가리킨다. */
const OTHER_CASES: readonly CaptionCase[] = WIDE_PHRASES.flatMap((w) =>
  NARROW_PHRASES.map((n) => `w${w}N${n}` as CaptionCase),
).filter((c) => c !== 'wRestoringNShort');

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const stabilityOfFloatingBodySchema: BundleSchema = {
  id: STABILITY_OF_FLOATING_BODY_ID,
  label: text('label.title'),
  category: 'fluids',
  operation: text('label.operation'),
  timeModel: 'periodic',
  parameters: [],
  stages: [{ id: 'water', label: text('label.stage'), constants: { g: PHYS.g } }],
  environments: [],
  views: [{ id: 'boats', label: text('label.view'), default: true }],

  /** 원본 캔버스 290 px + 그 아래 캡션 두 줄 · 조작기 한 줄. */
  canvas: { height: 440, minHeight: 360 },

  /** 겹침이 그림이다 — 물 → (배마다) 선체 → 빗금 → 윤곽 → 갑판 → 수압 → 자취 → 작용선 → 짝힘 → 부심 → 무게중심 → 수면 → 이름. */
  drawOrder: 'scene',

  /**
   * 한 주기 14 초. 끝 0.3 초 동안 흐려지고 다음 주기 첫 0.3 초에 돌아온다 (첫 주기는 흐려진
   * 채 열리지 않는다 — scene 이 `cycle` 로 가른다). 기울기 운동은 적분이라 `step` 이 같은
   * 주기 경계에서 두 배를 다시 놓는다.
   */
  timeline: {
    phases: [
      { id: 'appear', duration: DRAW.fade },
      { id: 'rock', duration: PHYS.cycle - 2 * DRAW.fade },
      { id: 'vanish', duration: DRAW.fade },
    ],
  },

  /**
   * 캡션 하나. 배마다 상태에서 문구가 정해진다 — 좁은 배는 사건(균형각 통과 · 처음
   * 되돌아섬)으로만 단계가 바뀐다. 조건 계산은 `step` 이 하고 선언은 결과가 놓인 자리만 가리킨다.
   */
  caption: {
    anchor: { screen: 'bottom-left', offset: [-8, -52] },
    align: 'left',
    fontSize: DRAW.captionPx,
    style: { colorRole: 'ink', emphasis: 'strong' },
    wrapWidth: 820,
    text: key('caption.wRestoringNShort'),
    cases: OTHER_CASES.map((c) => ({ when: `cap.${c}`, text: captionKey(c) })),
  },

  // 그리드도 카메라 버튼도 없다 (기본값). 원본에 없다.

  messages: stabilityOfFloatingBodyMessages,
};
