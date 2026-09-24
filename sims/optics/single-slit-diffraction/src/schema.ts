// ========================================================================
// single-slit-diffraction — 선언
// ========================================================================
// 질문: 틈 하나를 지난 빛은 왜 스크린에 밝은 띠와 어두운 자리를 남기고, 틈을 좁히면
// 왜 가운데 밝은 띠가 넓어지는가.
//
// 틈을 점광원 여럿으로 나누고, 스크린의 첫 어두운 점 P 까지 줄기를 긋는다. P 를 중심으로
// 위 끝과 같은 거리의 호를 그으면 아래로 갈수록 줄기가 길어지는 계단이 드러나고, 아래 끝은
// 꼭 λ 더 길다. 틈의 위 절반과 아래 절반에서 같은 번호끼리 짝지으면 짝마다 아래 줄기가
// λ/2 더 길다. 틈을 좁히면 같은 작도가 스크린 가운데에서 더 먼 점에서야 서고, 그만큼
// 가운데 밝은 띠가 넓다.
//
// 그림의 길이 단위는 파장 λ 하나다(월드 1 = λ). 엔진 위에서 바로 만든 조각이다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:single-slit-diffraction` 와 문자 그대로 일치한다 (C4). */
export const SINGLE_SLIT_DIFFRACTION_ID = 'single-slit-diffraction';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 넓은 틈의 폭(λ). */
export const SLIT_WIDE = 6;
/** 좁힌 틈의 폭(λ). 넓은 틈의 절반. */
export const SLIT_NARROW = 3;
/**
 * 틈에서 스크린까지(λ). 실제 스크린은 파장의 수십만 배 멀리 있다 — 그대로 그리면 줄기가
 * 한 줄로 겹쳐 경로 차를 볼 수 없어 14λ 로 당겼다. 곡선도 이 거리에서 계산한다 (NOTES (b)).
 */
export const SCREEN_DISTANCE = 14;
/** 틈을 나누는 점광원 수. 짝수 — 위 절반과 아래 절반이 같은 수라야 짝이 맞는다. */
export const SOURCES = 4;
/** 빛의 파장(nm). 색만 정한다 — 그림의 길이 단위는 λ 자체다. */
export const WAVELENGTH_NM = 633;
/** 들어오는 파면이 움직이는 빠르기(λ/초). 보이기 위한 값이다. */
export const WAVE_SPEED = 1.2;

// ------------------------------------------------------------------------
// 배치 — 월드 λ. 틈 가운데가 원점, 빛은 왼쪽에서 오른쪽으로 간다.
// ------------------------------------------------------------------------

/** 가림벽 두께. */
export const BARRIER_T = 0.3;
/** 가림벽 · 스크린의 위아래 끝(± 이 값). 좁은 틈의 첫 어두운 점(약 5λ) 너머 옆 띠까지 담는다. */
export const SCREEN_HALF = 6.5;
/** 스크린 띠의 두께. */
export const SCREEN_W = 0.8;
/** 스크린 띠와 세기 곡선 0 기준선 사이. */
export const CURVE_GAP = 0.6;
/** 세기 곡선의 최대 폭(세기 1). */
export const CURVE_W = 4.5;
/** 곡선 기준선에서 가운데 띠 폭 괄호까지. */
export const BRACKET_GAP = 0.9;
/** 들어오는 파면이 차지하는 가로 범위(가림벽 왼쪽 면에서 이만큼 떨어진 곳까지)와 세로 반폭. */
export const WAVE_REACH = 3.6;
export const WAVE_HALF = 5.2;
/** 파면이 가림벽 바로 앞에서 끊기는 거리 — 짝 번호 이름표 자리를 비운다. */
export const WAVE_STOP = 0.9;

/** 캡션 줄이 놓일 아래 띠(λ). 캡션 자리가 프레이밍 여백으로 잡히지 않는다 (장부 G24). */
export const CAPTION_BAND = 2.4;

/** 고정 프레이밍 — 들어오는 파면부터 괄호까지, 스크린 위아래 끝과 캡션 띠. */
export const SCENE_BOUNDS = {
  minX: -BARRIER_T / 2 - WAVE_REACH - 0.3,
  maxX: SCREEN_DISTANCE + SCREEN_W + CURVE_GAP + CURVE_W + BRACKET_GAP + 0.8,
  minY: -SCREEN_HALF - CAPTION_BAND,
  maxY: SCREEN_HALF + 0.3,
} as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const singleSlitDiffractionMessages = Object.freeze({
  'label.title': {
    ko: '단일 슬릿 회절',
    en: 'Single-slit diffraction',
    ja: '単スリット回折',
    zh: '单缝衍射',
    ar: 'حيود الشق المفرد',
    es: 'Difracción por una rendija',
    fr: 'Diffraction par une fente',
    hi: 'एकल झिरी विवर्तन',
    id: 'Difraksi celah tunggal',
    pt: 'Difração em fenda única',
  },
  'label.operation': {
    ko: '폭이 만드는 무늬',
    en: 'The pattern a width makes',
    ja: '幅がつくる模様',
    zh: '缝宽形成的图样',
    ar: 'النمط الذي يصنعه العرض',
    es: 'El patrón que crea un ancho',
    fr: 'Le motif que crée une largeur',
    hi: 'चौड़ाई से बनने वाला प्रतिरूप',
    id: 'Pola yang dibentuk oleh lebar',
    pt: 'O padrão que uma largura forma',
  },
  'label.stage': {
    ko: '기본',
    en: 'Default',
    ja: '標準',
    zh: '默认',
    ar: 'افتراضي',
    es: 'Predeterminada',
    fr: 'Par défaut',
    hi: 'डिफ़ॉल्ट',
    id: 'Bawaan',
    pt: 'Padrão',
  },
  'label.view': {
    ko: '기본',
    en: 'Default',
    ja: '標準',
    zh: '默认',
    ar: 'افتراضي',
    es: 'Predeterminada',
    fr: 'Par défaut',
    hi: 'डिफ़ॉल्ट',
    id: 'Bawaan',
    pt: 'Padrão',
  },
  /** 도식 표식 — 파장 기호와 짝 번호. 번역하지 않는다 (C1 판정 3). */
  'mark.lambda': {
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
  'mark.halfLambda': {
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
  'mark.pair': {
    ko: '{k}',
    en: '{k}',
    ja: '{k}',
    zh: '{k}',
    ar: '{k}',
    es: '{k}',
    fr: '{k}',
    hi: '{k}',
    id: '{k}',
    pt: '{k}',
  },
  'caption.wide': {
    ko: '틈 폭 {wide}λ — 스크린 가운데에 밝은 띠가 서고 양옆은 어둡다',
    en: 'Slit width {wide}λ — a bright band stands in the middle of the screen, dark on either side',
    ja: 'スリット幅{wide}λ — スクリーンの中央に明るい帯が立ち、両側は暗い',
    zh: '缝宽 {wide}λ——光屏中央出现一条亮带，两侧是暗的',
    ar: 'عرض الشق {wide}λ — يظهر شريط مضيء في وسط الشاشة، وعلى جانبيه ظلام',
    es: 'Ancho de rendija {wide}λ — una banda brillante aparece en el centro de la pantalla, oscura a ambos lados',
    fr: 'Largeur de fente {wide}λ — une bande brillante se dresse au milieu de l’écran, sombre de part et d’autre',
    hi: 'झिरी की चौड़ाई {wide}λ — पर्दे के बीच एक चमकीली पट्टी बनती है, दोनों ओर अँधेरा है',
    id: 'Lebar celah {wide}λ — pita terang muncul di tengah layar, gelap di kedua sisinya',
    pt: 'Largura da fenda {wide}λ — uma faixa clara aparece no meio da tela, escura dos dois lados',
  },
  'caption.rays': {
    ko: '틈을 점광원 {n}개로 나누고, 가운데 띠 옆 첫 어두운 점까지 줄기를 긋는다',
    en: 'Split the slit into {n} point sources and draw rays to the first dark point beside the central band',
    ja: 'スリットを{n}個の点光源に分け、中央の帯の隣の最初の暗点まで光線を引く',
    zh: '把狭缝分成 {n} 个点光源，向中央亮带旁的第一个暗点画出光线',
    ar: 'يُقسَّم الشق إلى {n} مصادر نقطية، وتُرسم أشعة إلى أول نقطة مظلمة بجوار الشريط المركزي',
    es: 'Se divide la rendija en {n} fuentes puntuales y se trazan rayos hasta el primer punto oscuro junto a la banda central',
    fr: 'On découpe la fente en {n} sources ponctuelles et on trace des rayons jusqu’au premier point sombre à côté de la bande centrale',
    hi: 'झिरी को {n} बिंदु स्रोतों में बाँटकर केंद्रीय पट्टी के पास के पहले अँधेरे बिंदु तक किरणें खींची जाती हैं',
    id: 'Celah dibagi menjadi {n} sumber titik, lalu sinar ditarik ke titik gelap pertama di samping pita tengah',
    pt: 'A fenda é dividida em {n} fontes pontuais e traçam-se raios até o primeiro ponto escuro ao lado da faixa central',
  },
  'caption.arc': {
    ko: '위 끝 줄기와 같은 길이에 호를 긋자, 아래로 갈수록 줄기가 길어져 아래 끝은 λ 더 길다',
    en: 'An arc at the length of the top ray shows the rays getting longer downward — the bottom edge is λ longer',
    ja: '上端の光線と同じ長さで弧を描くと、下へ行くほど光線が長くなり、下端の光線はλ長い',
    zh: '以顶端光线的长度画弧，可见光线越往下越长——下端光线长出 λ',
    ar: 'قوس بطول الشعاع العلوي يُظهر أن الأشعة تطول نحو الأسفل — وشعاع الطرف السفلي أطول بمقدار λ',
    es: 'Un arco con la longitud del rayo superior muestra que los rayos se alargan hacia abajo — el rayo del borde inferior es λ más largo',
    fr: 'Un arc à la longueur du rayon du haut montre les rayons qui s’allongent vers le bas — le rayon du bord inférieur est plus long de λ',
    hi: 'ऊपरी किरण की लंबाई पर खींचा गया चाप दिखाता है कि नीचे की ओर किरणें लंबी होती जाती हैं — निचले सिरे की किरण λ अधिक लंबी है',
    id: 'Busur sepanjang sinar teratas menunjukkan sinar makin panjang ke bawah — sinar tepi bawah lebih panjang λ',
    pt: 'Um arco com o comprimento do raio de cima mostra os raios ficando mais longos para baixo — o raio da borda inferior é λ mais longo',
  },
  'caption.pair': {
    ko: '위 절반과 아래 절반의 같은 번호끼리 짝지으면, 짝마다 아래 줄기가 λ/2 더 길다 — 줄기가 모인 점은 어둡다',
    en: 'Pair the same numbers in the upper and lower halves: in every pair the lower ray is λ/2 longer — where they meet is dark',
    ja: '上半分と下半分の同じ番号どうしを組にすると、どの組でも下の光線がλ/2長い — 光線が集まる点は暗い',
    zh: '把上半部分和下半部分中相同编号的光线配对：每一对中下方光线都长 λ/2——光线相会处是暗的',
    ar: 'عند مزاوجة الأرقام نفسها في النصفين العلوي والسفلي، يكون الشعاع السفلي في كل زوج أطول بمقدار λ/2 — وحيث تلتقي الأشعة يكون المكان مظلمًا',
    es: 'Al emparejar los mismos números de las mitades superior e inferior, en cada par el rayo inferior es λ/2 más largo — donde se juntan está oscuro',
    fr: 'En associant les mêmes numéros des moitiés haute et basse, dans chaque paire le rayon du bas est plus long de λ/2 — là où ils se rejoignent, c’est sombre',
    hi: 'ऊपरी और निचले आधे के समान क्रमांकों का जोड़ा बनाने पर हर जोड़े में निचली किरण λ/2 अधिक लंबी है — जहाँ किरणें मिलती हैं वहाँ अँधेरा है',
    id: 'Pasangkan nomor yang sama di separuh atas dan bawah: di setiap pasangan sinar bawah lebih panjang λ/2 — tempat sinar-sinar bertemu gelap',
    pt: 'Pareando os mesmos números das metades de cima e de baixo, em cada par o raio de baixo é λ/2 mais longo — onde eles se encontram fica escuro',
  },
  'caption.narrow': {
    ko: '틈을 {wide}λ 에서 {narrow}λ 로 좁히자 가운데 밝은 띠가 넓어진다',
    en: 'Narrowing the slit from {wide}λ to {narrow}λ widens the central bright band',
    ja: 'スリットを{wide}λから{narrow}λに狭めると、中央の明るい帯が広がる',
    zh: '把狭缝从 {wide}λ 缩窄到 {narrow}λ，中央亮带变宽',
    ar: 'تضييق الشق من {wide}λ إلى {narrow}λ يوسّع الشريط المضيء المركزي',
    es: 'Al estrechar la rendija de {wide}λ a {narrow}λ, la banda brillante central se ensancha',
    fr: 'Rétrécir la fente de {wide}λ à {narrow}λ élargit la bande brillante centrale',
    hi: 'झिरी को {wide}λ से {narrow}λ तक संकरा करने पर केंद्रीय चमकीली पट्टी चौड़ी हो जाती है',
    id: 'Menyempitkan celah dari {wide}λ ke {narrow}λ melebarkan pita terang tengah',
    pt: 'Estreitar a fenda de {wide}λ para {narrow}λ alarga a faixa clara central',
  },
  'caption.raysNarrow': {
    ko: '좁은 틈의 점광원 {n}개에서 새 첫 어두운 점까지 줄기를 긋는다',
    en: 'Draw rays from the {n} point sources of the narrow slit to the new first dark point',
    ja: '狭いスリットの{n}個の点光源から、新しい最初の暗点まで光線を引く',
    zh: '从窄缝的 {n} 个点光源向新的第一个暗点画出光线',
    ar: 'تُرسم أشعة من المصادر النقطية الـ{n} في الشق الضيق إلى أول نقطة مظلمة جديدة',
    es: 'Se trazan rayos desde las {n} fuentes puntuales de la rendija estrecha hasta el nuevo primer punto oscuro',
    fr: 'On trace des rayons depuis les {n} sources ponctuelles de la fente étroite jusqu’au nouveau premier point sombre',
    hi: 'संकरी झिरी के {n} बिंदु स्रोतों से नए पहले अँधेरे बिंदु तक किरणें खींची जाती हैं',
    id: 'Sinar ditarik dari {n} sumber titik celah sempit ke titik gelap pertama yang baru',
    pt: 'Traçam-se raios das {n} fontes pontuais da fenda estreita até o novo primeiro ponto escuro',
  },
  'caption.arcNarrow': {
    ko: '아래 끝 줄기가 λ 더 긴 점은 이제 스크린 가운데에서 더 멀다 — 줄기가 더 기울었다',
    en: 'The point where the bottom-edge ray is λ longer now lies farther from the middle — the rays tilt more',
    ja: '下端の光線がλ長くなる点は、いまはスクリーン中央からより遠い — 光線がより傾いた',
    zh: '下端光线长出 λ 的点现在离屏幕中央更远——光线更倾斜了',
    ar: 'النقطة التي يكون فيها شعاع الطرف السفلي أطول بمقدار λ صارت أبعد عن الوسط — الأشعة أكثر ميلًا',
    es: 'El punto donde el rayo del borde inferior es λ más largo queda ahora más lejos del centro — los rayos se inclinan más',
    fr: 'Le point où le rayon du bord inférieur est plus long de λ est maintenant plus loin du milieu — les rayons penchent davantage',
    hi: 'वह बिंदु जहाँ निचले सिरे की किरण λ अधिक लंबी है, अब बीच से और दूर है — किरणें और झुक गई हैं',
    id: 'Titik tempat sinar tepi bawah lebih panjang λ kini lebih jauh dari tengah — sinar-sinar lebih miring',
    pt: 'O ponto onde o raio da borda inferior é λ mais longo agora fica mais longe do meio — os raios se inclinam mais',
  },
  'caption.pairNarrow': {
    ko: '짝마다 아래 줄기가 λ/2 더 길다 — 첫 어두운 점이 바깥으로 물러나 가운데 띠가 점선보다 넓다',
    en: 'In every pair the lower ray is λ/2 longer — the first dark point moved outward and the central band is wider than the dashed one',
    ja: 'どの組でも下の光線がλ/2長い — 最初の暗点が外側へ移り、中央の帯は点線の帯より広い',
    zh: '每一对中下方光线都长 λ/2——第一个暗点向外移，中央亮带比虚线标出的更宽',
    ar: 'في كل زوج يكون الشعاع السفلي أطول بمقدار λ/2 — ابتعدت أول نقطة مظلمة إلى الخارج، وصار الشريط المركزي أعرض من الشريط المتقطع',
    es: 'En cada par el rayo inferior es λ/2 más largo — el primer punto oscuro se movió hacia afuera y la banda central es más ancha que la punteada',
    fr: 'Dans chaque paire, le rayon du bas est plus long de λ/2 — le premier point sombre s’est déplacé vers l’extérieur et la bande centrale est plus large que celle en pointillés',
    hi: 'हर जोड़े में निचली किरण λ/2 अधिक लंबी है — पहला अँधेरा बिंदु बाहर की ओर खिसक गया और केंद्रीय पट्टी बिंदुदार पट्टी से चौड़ी है',
    id: 'Di setiap pasangan sinar bawah lebih panjang λ/2 — titik gelap pertama bergeser ke luar dan pita tengah lebih lebar daripada yang bergaris putus-putus',
    pt: 'Em cada par o raio de baixo é λ/2 mais longo — o primeiro ponto escuro se deslocou para fora e a faixa central é mais larga que a tracejada',
  },
  'caption.widen': {
    ko: '틈을 다시 {wide}λ 로 넓힌다',
    en: 'Widen the slit back to {wide}λ',
    ja: 'スリットを再び{wide}λに広げる',
    zh: '把狭缝重新加宽到 {wide}λ',
    ar: 'يُعاد توسيع الشق إلى {wide}λ',
    es: 'La rendija se ensancha de nuevo a {wide}λ',
    fr: 'La fente est de nouveau élargie à {wide}λ',
    hi: 'झिरी को फिर {wide}λ तक चौड़ा किया जाता है',
    id: 'Celah dilebarkan kembali ke {wide}λ',
    pt: 'A fenda volta a se alargar para {wide}λ',
  },
} satisfies Record<string, LocalizedText>);

export type SingleSlitDiffractionMessageKey = keyof typeof singleSlitDiffractionMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: SingleSlitDiffractionMessageKey): LocalizedText => singleSlitDiffractionMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: SingleSlitDiffractionMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const singleSlitDiffractionSchema: BundleSchema = {
  id: SINGLE_SLIT_DIFFRACTION_ID,
  label: text('label.title'),
  category: 'optics',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 넓은 틈의 작도 → 좁히기 → 좁은 틈의 작도가 저절로 돈다.
  parameters: [],

  stages: [
    {
      id: 'default',
      label: text('label.stage'),
      constants: {
        slitWide: SLIT_WIDE,
        slitNarrow: SLIT_NARROW,
        screenDistance: SCREEN_DISTANCE,
        sources: SOURCES,
        wavelengthNm: WAVELENGTH_NM,
        waveSpeed: WAVE_SPEED,
      },
    },
  ],

  environments: [],

  views: [{ id: 'main', label: text('label.view'), default: true }],

  /** 가로로 긴 그림(약 26λ × 15λ). 세로를 더 주면 가로가 먼저 차서 그림만 작아진다. */
  canvas: { height: 440, minHeight: 380 },

  /** 스크린 띠 위에 줄기가 모이고, 가림벽이 파면 위에 온다 — 쓴 순서대로 겹친다. */
  drawOrder: 'scene',

  /**
   * 한 주기 = 넓은 틈 작도(줄기 → 호 · 계단 → 짝) → 좁히기 → 좁은 틈 작도 → 다시 넓히기.
   * 호와 계단이 자라는 짧은 단계 뒤에 같은 캡션으로 읽는 단계를 이어 둔다(다시 페이드하지 않는다).
   */
  timeline: {
    phases: [
      { id: 'wide', duration: 2.5, caption: key('caption.wide') },
      { id: 'wide-rays', duration: 1.8, ease: 'smooth', caption: key('caption.rays') },
      { id: 'wide-arc', duration: 1.2, ease: 'smooth', caption: key('caption.arc') },
      { id: 'wide-arc-hold', duration: 2.8, caption: key('caption.arc') },
      { id: 'wide-pair', duration: 4.2, caption: key('caption.pair') },
      { id: 'narrow', duration: 2.6, ease: 'smooth', caption: key('caption.narrow') },
      { id: 'narrow-rays', duration: 1.8, ease: 'smooth', caption: key('caption.raysNarrow') },
      { id: 'narrow-arc', duration: 1.2, ease: 'smooth', caption: key('caption.arcNarrow') },
      { id: 'narrow-arc-hold', duration: 2.6, caption: key('caption.arcNarrow') },
      { id: 'narrow-pair', duration: 4.4, caption: key('caption.pairNarrow') },
      { id: 'widen', duration: 2.0, ease: 'smooth', caption: key('caption.widen') },
    ],
  },

  /** 도착한 순간 이미 빛이 틈으로 들어오고 스크린에 띠가 서 있다. */
  startAt: 0.8,

  // 슬롯 하나. 지금 화면에서 보이는 것만 말한다 — 조건식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-left', offset: [10, -6] },
    align: 'left',
    fontSize: 13,
    wrapWidth: 640,
    fade: 0.25,
    style: { colorRole: 'muted', emphasis: 'strong' },
    vars: { wide: 'wide', narrow: 'narrow', n: 'sources' },
  },

  messages: singleSlitDiffractionMessages,
};
