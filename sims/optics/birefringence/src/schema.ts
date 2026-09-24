// ========================================================================
// birefringence — 선언
// ========================================================================
// 질문: 방해석 밑의 글자는 왜 두 겹으로 보이는가.
//
// 글자에서 올라온 빛 한 줄기가 결정 안에서 두 줄기로 갈라진다 — 정상광 o 는 곧게, 이상광 e 는
// 비스듬히. 둘은 떨림 방향이 서로 직각이다(⊙ · 가로 눈금). 위에서 보면 두 줄기가 만든 상 둘이
// 겹쳐 보이고, 결정을 돌리면 e 상이 o 상 둘레를 돈다. 편광판을 얹어 돌리면 두 상이 번갈아 사라진다 —
// 두 줄기의 떨림이 서로 직각이라는 것이 화면에서 확인된다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// 이웃 `polarization` 은 판 세 장으로 빛이 되살아나는 것을, `malus-law` 는 판 하나의 각과 세기를 본다.
// 여기서는 편광판 없이 결정 하나가 빛을 둘로 나누는 것이 본체이고, 편광판은 두 상의 떨림을 가르는 확인 단계다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:birefringence` 와 문자 그대로 일치한다 (C4). */
export const BIREFRINGENCE_ID = 'birefringence';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 방해석 정상광 굴절률 · 이상광 주 굴절률(나트륨 D선). 화면 글자는 이 선언값 그대로 쓴다. */
export const N_O = 1.658;
export const N_E = 1.486;
/**
 * 수직으로 들어온 빛에 대해 이상광이 꺾여 나가는 갈라짐 각(°). 방해석 쪼개짐 면에서 약 6.2° 다.
 * 두 굴절률과 광축 각(약 45°)에서 나오는 값이지만 관계를 선언할 자리가 없어 따로 둔다 (장부 G143).
 */
export const WALK_OFF_DEG = 6.2;
/** 갈라짐 각을 눈에 보이게 키우는 과장 배율. 6.2° 그대로면 두 상이 거의 한 자리다. */
export const EXAGGERATION = 3.5;
/** 결정 두께(월드 단위). 두 줄기가 벌어진 거리 = 두께 × tan(과장한 갈라짐 각). */
export const THICKNESS = 1.7;
/** 결정을 돌리는 각(°) — 한 바퀴. */
export const TURN_DEG = 360;
/** 편광판 결(투과축)과 두 상을 잇는 방향 사이의 각(°) — 얹을 때 · 돌린 뒤. */
export const POL_DEG_A = 0;
export const POL_DEG_B = 90;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 왼쪽 옆 단면 · 오른쪽 위에서 본 모습.
// ------------------------------------------------------------------------

/** 옆 단면 — 글자가 놓인 종이 선의 높이 · 반폭, 결정 밑면까지의 틈, 결정 밑면 반폭, 나간 줄기 길이. */
export const PAPER_Y = 0;
export const PAPER_HALF_W = 1.7;
export const GAP = 0.6;
export const CRYSTAL_HALF_W = 1.25;
/** 결정 옆면이 기운 몫(윗면이 밑면보다 오른쪽으로 밀린 거리) — 쪼개짐 결정의 비스듬한 옆면. */
export const CRYSTAL_SLANT = 0.45;
export const EXIT_LEN = 0.75;

/** 위에서 본 모습 — 가운데(글자 자리) · 결정 윗면 한 변 · 편광판 반지름 · 편광판이 비워 두는 안쪽 반지름. */
export const TOP_CENTER: readonly [number, number] = [5.0, 1.35];
export const FACE_EDGE = 2.0;
/** 결정 윗면(마름모)의 좁은 각(°) — 방해석 쪼개짐 면의 모양. 그림의 모양일 뿐 주장이 기대지 않는다. */
export const FACE_ANGLE_DEG = 78;
export const POLARIZER_R = 1.7;
export const POLARIZER_INNER_R = 1.02;
/** 편광판 결 간격. */
export const POL_HATCH_GAP = 0.2;

/**
 * 프레이밍 — 왼쪽 종이 선 · 글자 이름표부터 오른쪽 편광판 끝까지, 위는 판 이름표, 아래는 캡션 줄.
 * 매 프레임 같은 값이다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: -2.0, maxX: 6.9, minY: -1.1, maxY: 3.45 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const birefringenceMessages = Object.freeze({
  'label.title': {
    ko: '복굴절',
    en: 'Birefringence',
    ja: '複屈折',
    zh: '双折射',
    ar: 'الانكسار المزدوج',
    es: 'Birrefringencia',
    fr: 'Biréfringence',
    hi: 'द्विअपवर्तन',
    id: 'Birefringensi',
    pt: 'Birrefringência',
  },
  'label.operation': {
    ko: '방향에 따라 다른 굴절률',
    en: 'Refractive index that depends on direction',
    ja: '方向によって異なる屈折率',
    zh: '随方向而变的折射率',
    ar: 'معامل انكسار يتوقف على الاتجاه',
    es: 'Índice de refracción que depende de la dirección',
    fr: 'Indice de réfraction qui dépend de la direction',
    hi: 'दिशा पर निर्भर अपवर्तनांक',
    id: 'Indeks bias yang bergantung pada arah',
    pt: 'Índice de refração que depende da direção',
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
  'label.side': {
    ko: '옆에서 본 단면',
    en: 'side section',
    ja: '横から見た断面',
    zh: '侧视截面',
    ar: 'مقطع جانبي',
    es: 'corte lateral',
    fr: 'coupe latérale',
    hi: 'पार्श्व काट',
    id: 'penampang samping',
    pt: 'corte lateral',
  },
  'label.top': {
    ko: '위에서 본 모습',
    en: 'seen from above',
    ja: '上から見た様子',
    zh: '俯视',
    ar: 'منظر من الأعلى',
    es: 'visto desde arriba',
    fr: 'vu de dessus',
    hi: 'ऊपर से दृश्य',
    id: 'dilihat dari atas',
    pt: 'visto de cima',
  },
  'label.letter': {
    ko: '글자',
    en: 'letter',
    ja: '文字',
    zh: '文字',
    ar: 'حرف',
    es: 'letra',
    fr: 'lettre',
    hi: 'अक्षर',
    id: 'huruf',
    pt: 'letra',
  },
  'label.crystal': {
    ko: '방해석',
    en: 'calcite',
    ja: '方解石',
    zh: '方解石',
    ar: 'الكالسيت',
    es: 'calcita',
    fr: 'calcite',
    hi: 'कैल्साइट',
    id: 'kalsit',
    pt: 'calcita',
  },
  'label.polarizer': {
    ko: '편광판',
    en: 'polarizer',
    ja: '偏光板',
    zh: '偏振片',
    ar: 'المستقطِب',
    es: 'polarizador',
    fr: 'polariseur',
    hi: 'ध्रुवक',
    id: 'polarisator',
    pt: 'polarizador',
  },
  'label.oRay': {
    ko: '정상광 o',
    en: 'ordinary o',
    ja: '常光線 o',
    zh: '寻常光 o',
    ar: 'الشعاع العادي o',
    es: 'rayo ordinario o',
    fr: 'rayon ordinaire o',
    hi: 'साधारण किरण o',
    id: 'sinar biasa o',
    pt: 'raio ordinário o',
  },
  'label.eRay': {
    ko: '이상광 e',
    en: 'extraordinary e',
    ja: '異常光線 e',
    zh: '非常光 e',
    ar: 'الشعاع غير العادي e',
    es: 'rayo extraordinario e',
    fr: 'rayon extraordinaire e',
    hi: 'असाधारण किरण e',
    id: 'sinar luar biasa e',
    pt: 'raio extraordinário e',
  },
  /** 굴절률 표식. 기호 · 수라 두 언어가 같다 (C1 판정 3). */
  'label.nO': {
    ko: 'nₒ = {n}',
    en: 'nₒ = {n}',
    ja: 'nₒ = {n}',
    zh: 'nₒ = {n}',
    ar: 'nₒ = {n}',
    es: 'nₒ = {n}',
    fr: 'nₒ = {n}',
    hi: 'nₒ = {n}',
    id: 'nₒ = {n}',
    pt: 'nₒ = {n}',
  },
  'label.nE': {
    ko: 'nₑ = {n}',
    en: 'nₑ = {n}',
    ja: 'nₑ = {n}',
    zh: 'nₑ = {n}',
    ar: 'nₑ = {n}',
    es: 'nₑ = {n}',
    fr: 'nₑ = {n}',
    hi: 'nₑ = {n}',
    id: 'nₑ = {n}',
    pt: 'nₑ = {n}',
  },
  /** 상 이름 표식. */
  'label.o': {
    ko: 'o',
    en: 'o',
    ja: 'o',
    zh: 'o',
    ar: 'o',
    es: 'o',
    fr: 'o',
    hi: 'o',
    id: 'o',
    pt: 'o',
  },
  'label.e': {
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
  /** 결정 밑에 놓인 글자. 언어마다 그 언어의 글자를 쓴다. */
  'glyph.letter': {
    ko: '가',
    en: 'A',
    ja: 'あ',
    zh: '字',
    ar: 'أ',
    es: 'A',
    fr: 'A',
    hi: 'अ',
    id: 'A',
    pt: 'A',
  },
  'caption.split': {
    ko: '한 줄기가 결정 안에서 두 줄기로 갈라진다. o 는 곧게, e 는 비스듬히 간다. 위에서 보면 글자가 두 겹이다.',
    en: 'Inside the crystal one beam splits in two: o goes straight, e runs aslant. Seen from above, the letter is doubled.',
    ja: '結晶の中で1本の光束が2本に分かれる。oはまっすぐ、eは斜めに進む。上から見ると文字が二重になる。',
    zh: '在晶体内一束光分成两束：o 沿直线前进，e 斜着走。从上方看，字成了双影。',
    ar: 'داخل البلورة تنقسم الحزمة الواحدة إلى اثنتين: o تسير مستقيمة، وe تميل جانبًا. ومن الأعلى يبدو الحرف مزدوجًا.',
    es: 'Dentro del cristal un haz se divide en dos: o sigue recto, e avanza en diagonal. Visto desde arriba, la letra se ve doble.',
    fr: 'Dans le cristal, un faisceau se sépare en deux : o va tout droit, e part en biais. Vue de dessus, la lettre est dédoublée.',
    hi: 'क्रिस्टल के भीतर एक किरण-पुंज दो में बँट जाता है: o सीधा जाता है, e तिरछा। ऊपर से देखने पर अक्षर दोहरा दिखता है।',
    id: 'Di dalam kristal satu berkas terbelah dua: o lurus, e miring. Dilihat dari atas, hurufnya tampak ganda.',
    pt: 'Dentro do cristal um feixe se divide em dois: o segue reto, e vai inclinado. Visto de cima, a letra aparece dupla.',
  },
  'caption.rotate': {
    ko: '결정을 돌린다. e 상이 o 상 둘레를 돈다.',
    en: 'The crystal turns. The e image circles around the o image.',
    ja: '結晶が回る。eの像がoの像のまわりを回る。',
    zh: '晶体转动。e 像绕着 o 像转。',
    ar: 'تدور البلورة. تدور صورة e حول صورة o.',
    es: 'El cristal gira. La imagen e da vueltas alrededor de la imagen o.',
    fr: 'Le cristal tourne. L’image e tourne autour de l’image o.',
    hi: 'क्रिस्टल घूमता है। e प्रतिबिंब o प्रतिबिंब के चारों ओर घूमता है।',
    id: 'Kristal berputar. Bayangan e mengitari bayangan o.',
    pt: 'O cristal gira. A imagem e gira em torno da imagem o.',
  },
  'caption.polIn': {
    ko: '편광판을 얹는다.',
    en: 'A polarizer is laid on top.',
    ja: '偏光板を上にのせる。',
    zh: '在上面放上偏振片。',
    ar: 'يوضع مستقطِب فوقها.',
    es: 'Se coloca un polarizador encima.',
    fr: 'On pose un polariseur dessus.',
    hi: 'ऊपर एक ध्रुवक रखा जाता है।',
    id: 'Sebuah polarisator diletakkan di atasnya.',
    pt: 'Um polarizador é colocado por cima.',
  },
  'caption.polA': {
    ko: '편광판 결이 두 상을 잇는 선에서 {a}° — o 상이 사라지고 e 상만 남았다.',
    en: 'Polarizer lines at {a}° to the line joining the images — the o image is gone; only e remains.',
    ja: '偏光板の筋が2つの像を結ぶ線と{a}° — oの像が消え、eの像だけが残る。',
    zh: '偏振片的纹路与两像连线成 {a}°——o 像消失，只剩 e 像。',
    ar: 'خطوط المستقطِب بزاوية {a}° مع الخط الواصل بين الصورتين — اختفت صورة o ولم يبقَ إلا e.',
    es: 'Las líneas del polarizador a {a}° de la línea que une las imágenes — la imagen o desaparece; solo queda e.',
    fr: 'Lignes du polariseur à {a}° de la droite qui relie les images — l’image o a disparu ; seule e reste.',
    hi: 'ध्रुवक की रेखाएँ दोनों प्रतिबिंबों को जोड़ने वाली रेखा से {a}° पर — o प्रतिबिंब गायब हो गया; केवल e बचा है।',
    id: 'Garis polarisator membentuk {a}° terhadap garis yang menghubungkan kedua bayangan — bayangan o hilang; hanya e yang tersisa.',
    pt: 'Linhas do polarizador a {a}° da reta que une as imagens — a imagem o sumiu; só resta e.',
  },
  'caption.polTurn': {
    ko: '편광판을 돌린다.',
    en: 'The polarizer turns.',
    ja: '偏光板が回る。',
    zh: '偏振片转动。',
    ar: 'يدور المستقطِب.',
    es: 'El polarizador gira.',
    fr: 'Le polariseur tourne.',
    hi: 'ध्रुवक घूमता है।',
    id: 'Polarisator berputar.',
    pt: 'O polarizador gira.',
  },
  'caption.polB': {
    ko: '편광판 결이 두 상을 잇는 선에서 {b}° — e 상이 사라지고 o 상만 남았다.',
    en: 'Polarizer lines at {b}° to the line joining the images — the e image is gone; only o remains.',
    ja: '偏光板の筋が2つの像を結ぶ線と{b}° — eの像が消え、oの像だけが残る。',
    zh: '偏振片的纹路与两像连线成 {b}°——e 像消失，只剩 o 像。',
    ar: 'خطوط المستقطِب بزاوية {b}° مع الخط الواصل بين الصورتين — اختفت صورة e ولم يبقَ إلا o.',
    es: 'Las líneas del polarizador a {b}° de la línea que une las imágenes — la imagen e desaparece; solo queda o.',
    fr: 'Lignes du polariseur à {b}° de la droite qui relie les images — l’image e a disparu ; seule o reste.',
    hi: 'ध्रुवक की रेखाएँ दोनों प्रतिबिंबों को जोड़ने वाली रेखा से {b}° पर — e प्रतिबिंब गायब हो गया; केवल o बचा है।',
    id: 'Garis polarisator membentuk {b}° terhadap garis yang menghubungkan kedua bayangan — bayangan e hilang; hanya o yang tersisa.',
    pt: 'Linhas do polarizador a {b}° da reta que une as imagens — a imagem e sumiu; só resta o.',
  },
  'caption.polOut': {
    ko: '편광판을 걷는다.',
    en: 'The polarizer is lifted off.',
    ja: '偏光板を取り去る。',
    zh: '取下偏振片。',
    ar: 'يُرفع المستقطِب.',
    es: 'Se retira el polarizador.',
    fr: 'On retire le polariseur.',
    hi: 'ध्रुवक हटा लिया जाता है।',
    id: 'Polarisator diangkat.',
    pt: 'O polarizador é retirado.',
  },
} satisfies Record<string, LocalizedText>);

export type BirefringenceMessageKey = keyof typeof birefringenceMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: BirefringenceMessageKey): LocalizedText => birefringenceMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: BirefringenceMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const birefringenceSchema: BundleSchema = {
  id: BIREFRINGENCE_ID,
  label: text('label.title'),
  category: 'optics',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 결정이 스스로 한 바퀴 돌고, 편광판이 스스로 얹혀 돈다.
  parameters: [],

  stages: [
    {
      id: 'default',
      label: text('label.stage'),
      constants: {
        nO: N_O,
        nE: N_E,
        walkOffDeg: WALK_OFF_DEG,
        exaggeration: EXAGGERATION,
        thickness: THICKNESS,
        turnDeg: TURN_DEG,
        polDegA: POL_DEG_A,
        polDegB: POL_DEG_B,
      },
    },
  ],

  environments: [],

  views: [{ id: 'main', label: text('label.view'), default: true }],

  /** 가로로 넓고 세로로 좁은 두 칸. */
  canvas: { height: 360, minHeight: 330 },

  /** 겹침이 판정 장치다 — 결정 위에 줄기, 결정 윗면 위에 글자, 편광판 고리는 글자를 덮지 않는다. */
  drawOrder: 'scene',

  /**
   * 한 주기 = 갈라짐을 보임 → 결정 한 바퀴 → 편광판 얹음 → 결 나란함 → 돌림 → 결 직각 → 걷음.
   * 결정 각은 `rotate` 진행도로, 편광판 결 각은 `polTurn` 진행도로, 편광판의 있고 없음은
   * `polIn` · `polOut` 진행도로만 움직인다.
   */
  timeline: {
    phases: [
      { id: 'split', duration: 3.6, caption: key('caption.split') },
      { id: 'rotate', duration: 5.2, ease: 'smooth', caption: key('caption.rotate') },
      { id: 'polIn', duration: 1.3, ease: 'smooth', caption: key('caption.polIn') },
      { id: 'polA', duration: 2.8, caption: key('caption.polA') },
      { id: 'polTurn', duration: 1.8, ease: 'smooth', caption: key('caption.polTurn') },
      { id: 'polB', duration: 2.8, caption: key('caption.polB') },
      { id: 'polOut', duration: 1.2, ease: 'smooth', caption: key('caption.polOut') },
    ],
  },

  /** 도착한 순간 이미 두 줄기가 갈라져 있고, 곧 결정이 돌기 시작한다. */
  startAt: 1.4,

  // 슬롯 하나. 지금 화면에서 보이는 사실만 말한다 — 식과 법칙 문장은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-left', offset: [0, -6] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 820,
    fade: 0.25,
    style: { colorRole: 'ink', emphasis: 'strong' },
    vars: { a: 'polDegA', b: 'polDegB' },
  },

  // 그리드 · 카메라 단추 없음(기본). 잴 것이 거리가 아니다 — 두 상이 겹쳐 있다는 것과 도는 것이다.

  messages: birefringenceMessages,
};
