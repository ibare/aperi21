// ========================================================================
// scale-of-universe — 선언
// ========================================================================
// 질문: 원자에서 우주까지는 얼마나 먼가. 「10배씩」 이 쌓이면 무슨 일이 벌어지나.
//
// 한 칸 = 10배. 화면 틀 한 변이 10^z m 인 채로 z 를 한 칸씩 올리면, 틀 안의 모든 것이
// 한 칸마다 10분의 1로 줄어든다. 방금 틀을 채우던 원자는 두세 칸 만에 점이 되어 사라지고,
// 다음 대상(세포)은 틀 밖에서 줄어들며 들어와 틀을 채운다. 원자(10⁻¹⁰ m) → 세포 → 사람 →
// 지구 → 태양계 → 우리 은하 → 관측 가능한 우주(10²⁶ m)를 그렇게 잇는다 (Powers of Ten).
//
// 배율 전환은 카메라가 아니다 — 한 장면 안에서 대상마다 선언한 지수(스테이지 상수)로
// 크기를 정하고, boundsHint 는 고정이다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:scale-of-universe` 와 문자 그대로 일치한다 (C4). */
export const SCALE_OF_UNIVERSE_ID = 'scale-of-universe';

// ------------------------------------------------------------------------
// 물리 · 배치 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/**
 * 대상마다의 크기 — 지름(m)의 10 지수. 틀 한 변이 10^z m 일 때 대상의 지름은 틀 × 10^(지수 − z) 다.
 * 이름표 `size.*` 문안이 이 값을 그대로 쓰고 있으므로 바꾸면 문안도 함께 바꾼다(NOTES (c)).
 */
export const EXP_ATOM = -10;
export const EXP_CELL = -5;
export const EXP_PERSON = 0;
export const EXP_EARTH = 7;
export const EXP_SOLAR = 13;
export const EXP_GALAXY = 21;
export const EXP_UNIVERSE = 26;

/**
 * 태양계 그림의 행성 궤도 반지름(AU). 바깥 궤도(해왕성)가 태양계 지름 10¹³ m 의 가장자리다.
 * 지구 궤도가 해왕성 궤도의 30분의 1이라 틀을 채운 태양계에서 지구 궤도가 겨우 보인다.
 */
export const ORBIT_EARTH_AU = 1;
export const ORBIT_JUPITER_AU = 5.2;
export const ORBIT_SATURN_AU = 9.6;
export const ORBIT_URANUS_AU = 19.2;
export const ORBIT_NEPTUNE_AU = 30.1;

/**
 * 보이지 않을 만큼 작은 것을 키운 배율 — 대상 반지름에 대한 비. 실제 원자핵은 원자의 10만분의 1,
 * 태양은 태양계의 수천분의 1이라 틀을 채운 그림에서 보이지 않는다. 화면에 알리지 않는다(NOTES (b)).
 */
export const NUCLEUS_SHARE = 0.06;
export const SUN_SHARE = 0.012;

/** 흩뿌림 난수의 씨앗. 같은 씨앗은 언제나 같은 전자 구름 · 은하 · 우주다. */
export const SEED = 21;
/** 원자 전자 구름의 점 수 · 우리 은하의 별 점 수 · 우주의 은하 점 수. */
export const ATOM_CLOUD_COUNT = 70;
export const GALAXY_STAR_COUNT = 420;
export const UNIVERSE_GALAXY_COUNT = 360;

/**
 * 프레이밍은 주장의 일부다. 왼쪽에 틀, 오른쪽에 10의 거듭제곱 사다리, 아래에 틀의 치수선과
 * 캡션 자리. 대상이 커지고 줄어도 경계는 고정이다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: -3.2, maxX: 3.6, minY: -2.05, maxY: 1.9 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const scaleOfUniverseMessages = Object.freeze({
  'label.title': {
    ko: '우주의 규모',
    en: 'The scale of the universe',
    ja: '宇宙のスケール',
    zh: '宇宙的尺度',
    ar: 'مقياس الكون',
    es: 'La escala del universo',
    fr: 'L’échelle de l’univers',
    hi: 'ब्रह्मांड का पैमाना',
    id: 'Skala alam semesta',
    pt: 'A escala do universo',
  },
  'label.operation': {
    ko: '원자에서 우주까지 10의 거듭제곱으로 잇는 크기',
    en: 'Sizes from the atom to the universe, joined by powers of ten',
    ja: '原子から宇宙まで、10のべき乗でつなぐ大きさ',
    zh: '从原子到宇宙，以10的幂相连的尺寸',
    ar: 'أحجام من الذرة إلى الكون، تربطها قوى العشرة',
    es: 'Tamaños del átomo al universo, unidos por potencias de diez',
    fr: 'Des tailles de l’atome à l’univers, reliées par des puissances de dix',
    hi: 'परमाणु से ब्रह्मांड तक के आकार, दस की घातों से जुड़े',
    id: 'Ukuran dari atom hingga alam semesta, dihubungkan oleh pangkat sepuluh',
    pt: 'Tamanhos do átomo ao universo, ligados por potências de dez',
  },
  'label.stage': {
    ko: '10의 거듭제곱 사다리',
    en: 'Powers-of-ten ladder',
    ja: '10のべき乗のはしご',
    zh: '10的幂阶梯',
    ar: 'سلّم قوى العشرة',
    es: 'Escalera de potencias de diez',
    fr: 'Échelle des puissances de dix',
    hi: 'दस की घातों की सीढ़ी',
    id: 'Tangga pangkat sepuluh',
    pt: 'Escada de potências de dez',
  },
  'label.view': {
    ko: '한 칸씩 물러나기',
    en: 'Stepping back one power at a time',
    ja: '一桁ずつ引いていく',
    zh: '一次后退一个数量级',
    ar: 'التراجع بمقدار قوة واحدة من قوى العشرة في كل مرة',
    es: 'Retroceder una potencia cada vez',
    fr: 'Reculer d’une puissance à la fois',
    hi: 'एक-एक घात करके पीछे हटना',
    id: 'Mundur satu pangkat demi satu',
    pt: 'Recuando uma potência de cada vez',
  },

  /** 대상 이름 — 사다리 왼쪽과, 줄어드는 대상 옆에 붙는다. */
  'name.atom': {
    ko: '원자',
    en: 'Atom',
    ja: '原子',
    zh: '原子',
    ar: 'ذرة',
    es: 'Átomo',
    fr: 'Atome',
    hi: 'परमाणु',
    id: 'Atom',
    pt: 'Átomo',
  },
  'name.cell': {
    ko: '세포',
    en: 'Cell',
    ja: '細胞',
    zh: '细胞',
    ar: 'خلية',
    es: 'Célula',
    fr: 'Cellule',
    hi: 'कोशिका',
    id: 'Sel',
    pt: 'Célula',
  },
  'name.person': {
    ko: '사람',
    en: 'Person',
    ja: '人',
    zh: '人',
    ar: 'إنسان',
    es: 'Persona',
    fr: 'Personne',
    hi: 'मनुष्य',
    id: 'Manusia',
    pt: 'Pessoa',
  },
  'name.earth': {
    ko: '지구',
    en: 'Earth',
    ja: '地球',
    zh: '地球',
    ar: 'الأرض',
    es: 'Tierra',
    fr: 'Terre',
    hi: 'पृथ्वी',
    id: 'Bumi',
    pt: 'Terra',
  },
  'name.solar': {
    ko: '태양계',
    en: 'Solar system',
    ja: '太陽系',
    zh: '太阳系',
    ar: 'المجموعة الشمسية',
    es: 'Sistema solar',
    fr: 'Système solaire',
    hi: 'सौर मंडल',
    id: 'Tata surya',
    pt: 'Sistema solar',
  },
  'name.galaxy': {
    ko: '우리 은하',
    en: 'Milky Way',
    ja: '天の川銀河',
    zh: '银河系',
    ar: 'درب التبانة',
    es: 'Vía Láctea',
    fr: 'Voie lactée',
    hi: 'आकाशगंगा',
    id: 'Bima Sakti',
    pt: 'Via Láctea',
  },
  'name.universe': {
    ko: '관측 가능한 우주',
    en: 'Observable universe',
    ja: '観測可能な宇宙',
    zh: '可观测宇宙',
    ar: 'الكون المرئي',
    es: 'Universo observable',
    fr: 'Univers observable',
    hi: 'प्रेक्षणीय ब्रह्मांड',
    id: 'Alam semesta teramati',
    pt: 'Universo observável',
  },

  /**
   * 크기 — 거듭제곱 표기라 번역 대상이 아니다 (C1 판정 3). 지수를 코드에서 조립하지 않는다 —
   * 보일 문자열 그대로 문안에 둔다 (지시서 · S-piece 유효숫자).
   */
  'size.atom': {
    ko: '10⁻¹⁰ m',
    en: '10⁻¹⁰ m',
    ja: '10⁻¹⁰ m',
    zh: '10⁻¹⁰ m',
    ar: '10⁻¹⁰ m',
    es: '10⁻¹⁰ m',
    fr: '10⁻¹⁰ m',
    hi: '10⁻¹⁰ m',
    id: '10⁻¹⁰ m',
    pt: '10⁻¹⁰ m',
  },
  'size.cell': {
    ko: '10⁻⁵ m',
    en: '10⁻⁵ m',
    ja: '10⁻⁵ m',
    zh: '10⁻⁵ m',
    ar: '10⁻⁵ m',
    es: '10⁻⁵ m',
    fr: '10⁻⁵ m',
    hi: '10⁻⁵ m',
    id: '10⁻⁵ m',
    pt: '10⁻⁵ m',
  },
  'size.person': {
    ko: '10⁰ m',
    en: '10⁰ m',
    ja: '10⁰ m',
    zh: '10⁰ m',
    ar: '10⁰ m',
    es: '10⁰ m',
    fr: '10⁰ m',
    hi: '10⁰ m',
    id: '10⁰ m',
    pt: '10⁰ m',
  },
  'size.earth': {
    ko: '10⁷ m',
    en: '10⁷ m',
    ja: '10⁷ m',
    zh: '10⁷ m',
    ar: '10⁷ m',
    es: '10⁷ m',
    fr: '10⁷ m',
    hi: '10⁷ m',
    id: '10⁷ m',
    pt: '10⁷ m',
  },
  'size.solar': {
    ko: '10¹³ m',
    en: '10¹³ m',
    ja: '10¹³ m',
    zh: '10¹³ m',
    ar: '10¹³ m',
    es: '10¹³ m',
    fr: '10¹³ m',
    hi: '10¹³ m',
    id: '10¹³ m',
    pt: '10¹³ m',
  },
  'size.galaxy': {
    ko: '10²¹ m',
    en: '10²¹ m',
    ja: '10²¹ m',
    zh: '10²¹ m',
    ar: '10²¹ m',
    es: '10²¹ m',
    fr: '10²¹ m',
    hi: '10²¹ m',
    id: '10²¹ m',
    pt: '10²¹ m',
  },
  'size.universe': {
    ko: '10²⁶ m',
    en: '10²⁶ m',
    ja: '10²⁶ m',
    zh: '10²⁶ m',
    ar: '10²⁶ m',
    es: '10²⁶ m',
    fr: '10²⁶ m',
    hi: '10²⁶ m',
    id: '10²⁶ m',
    pt: '10²⁶ m',
  },

  /** 사다리 한 칸의 뜻 — 사다리 맨 위에 붙는 표식. */
  'label.step': {
    ko: '한 칸 = ×10',
    en: 'one step = ×10',
    ja: '1段 = ×10',
    zh: '一格 = ×10',
    ar: 'خطوة واحدة = ×10',
    es: 'un paso = ×10',
    fr: 'un cran = ×10',
    hi: 'एक कदम = ×10',
    id: 'satu langkah = ×10',
    pt: 'um passo = ×10',
  },

  'caption.atom': {
    ko: '원자 하나가 틀을 채운다',
    en: 'A single atom fills the frame',
    ja: '原子一つが枠を満たす',
    zh: '一个原子填满画框',
    ar: 'ذرة واحدة تملأ الإطار',
    es: 'Un solo átomo llena el marco',
    fr: 'Un seul atome remplit le cadre',
    hi: 'एक अकेला परमाणु फ्रेम भर देता है',
    id: 'Satu atom memenuhi bingkai',
    pt: 'Um único átomo preenche o quadro',
  },
  'caption.zoom': {
    ko: '한 칸 물러날 때마다 틀 속 모든 것이 10분의 1로 줄어든다',
    en: 'Each step back shrinks everything in the frame to a tenth',
    ja: '一段引くごとに、枠の中のすべてが10分の1に縮む',
    zh: '每后退一格，画框里的一切都缩小到十分之一',
    ar: 'كل خطوة إلى الوراء تُصغّر كل ما في الإطار إلى العُشر',
    es: 'Cada paso atrás reduce todo lo que hay en el marco a una décima parte',
    fr: 'Chaque cran en arrière réduit tout ce qui est dans le cadre à un dixième',
    hi: 'हर कदम पीछे हटने पर फ्रेम की हर चीज़ दसवाँ हिस्सा रह जाती है',
    id: 'Setiap langkah mundur mengecilkan semua isi bingkai menjadi sepersepuluhnya',
    pt: 'Cada passo para trás encolhe tudo no quadro a um décimo',
  },
  'caption.cell': {
    ko: '세포 — 방금 틀을 채우던 원자는 점이 되어 사라졌다',
    en: 'A cell — the atom that filled the frame shrank to a dot and vanished',
    ja: '細胞 — 枠を満たしていた原子は点になって消えた',
    zh: '细胞 — 刚才填满画框的原子缩成一点消失了',
    ar: 'خلية — الذرة التي ملأت الإطار صغرت إلى نقطة واختفت',
    es: 'Una célula — el átomo que llenaba el marco se encogió hasta un punto y desapareció',
    fr: 'Une cellule — l’atome qui remplissait le cadre s’est réduit à un point et a disparu',
    hi: 'एक कोशिका — फ्रेम भरने वाला परमाणु सिकुड़कर बिंदु बना और गायब हो गया',
    id: 'Sel — atom yang tadi memenuhi bingkai menyusut menjadi titik dan lenyap',
    pt: 'Uma célula — o átomo que preenchia o quadro encolheu até um ponto e sumiu',
  },
  'caption.person': {
    ko: '사람 — 세포도 몇 칸 만에 점이 되어 사라졌다',
    en: 'A person — the cell too became a dot within a few steps',
    ja: '人 — 細胞も数段のうちに点になった',
    zh: '人 — 细胞也在几格之内变成了一个点',
    ar: 'إنسان — الخلية أيضًا صارت نقطة في خطوات قليلة',
    es: 'Una persona — también la célula se volvió un punto en unos pocos pasos',
    fr: 'Une personne — la cellule aussi est devenue un point en quelques crans',
    hi: 'एक मनुष्य — कोशिका भी कुछ ही कदमों में बिंदु बन गई',
    id: 'Manusia — sel pun menjadi titik dalam beberapa langkah',
    pt: 'Uma pessoa — a célula também virou um ponto em poucos passos',
  },
  'caption.earth': {
    ko: '지구 — 사람은 벌써 보이지 않는다',
    en: 'Earth — the person is long out of sight',
    ja: '地球 — 人はとうに見えない',
    zh: '地球 — 人早已看不见了',
    ar: 'الأرض — غاب الإنسان عن النظر منذ زمن',
    es: 'La Tierra — hace rato que la persona no se ve',
    fr: 'La Terre — la personne a disparu depuis longtemps',
    hi: 'पृथ्वी — मनुष्य कब का आँखों से ओझल हो चुका है',
    id: 'Bumi — manusia sudah lama tak terlihat',
    pt: 'A Terra — a pessoa já sumiu de vista há tempos',
  },
  'caption.solar': {
    ko: '태양계 — 지구는 점 하나로도 남지 않는다',
    en: 'The solar system — Earth is too small to leave even a dot',
    ja: '太陽系 — 地球は小さすぎて点すら残らない',
    zh: '太阳系 — 地球太小，连一个点都留不下',
    ar: 'المجموعة الشمسية — الأرض أصغر من أن تترك حتى نقطة',
    es: 'El sistema solar — la Tierra es demasiado pequeña para dejar siquiera un punto',
    fr: 'Le système solaire — la Terre est trop petite pour laisser même un point',
    hi: 'सौर मंडल — पृथ्वी इतनी छोटी है कि एक बिंदु तक नहीं बचता',
    id: 'Tata surya — Bumi terlalu kecil untuk tersisa bahkan sebagai titik',
    pt: 'O sistema solar — a Terra é pequena demais para deixar sequer um ponto',
  },
  'caption.galaxy': {
    ko: '우리 은하 — 태양계가 사라진 뒤로도 빈 칸을 한참 지나 왔다',
    en: 'The Milky Way — many empty steps passed after the solar system vanished',
    ja: '天の川銀河 — 太陽系が消えてから、空の段をいくつも過ぎてきた',
    zh: '银河系 — 太阳系消失后，又经过了许多空格',
    ar: 'درب التبانة — مرت خطوات فارغة كثيرة بعد أن اختفت المجموعة الشمسية',
    es: 'La Vía Láctea — pasaron muchos pasos vacíos desde que desapareció el sistema solar',
    fr: 'La Voie lactée — bien des crans vides ont défilé depuis la disparition du système solaire',
    hi: 'आकाशगंगा — सौर मंडल के गायब होने के बाद कई खाली कदम बीत गए',
    id: 'Bima Sakti — banyak langkah kosong terlewati setelah tata surya lenyap',
    pt: 'A Via Láctea — muitos passos vazios se passaram depois que o sistema solar sumiu',
  },
  'caption.universe': {
    ko: '관측 가능한 우주 — 원자에서 여기까지 한 칸씩 물러나 왔다',
    en: 'The observable universe — reached from the atom one step at a time',
    ja: '観測可能な宇宙 — 原子から一段ずつ引いてここまで来た',
    zh: '可观测宇宙 — 从原子出发，一格一格退到这里',
    ar: 'الكون المرئي — بلغناه من الذرة خطوةً خطوة',
    es: 'El universo observable — alcanzado desde el átomo paso a paso',
    fr: 'L’univers observable — atteint depuis l’atome, un cran à la fois',
    hi: 'प्रेक्षणीय ब्रह्मांड — परमाणु से एक-एक कदम चलकर यहाँ तक पहुँचे',
    id: 'Alam semesta teramati — dicapai dari atom selangkah demi selangkah',
    pt: 'O universo observável — alcançado a partir do átomo, um passo de cada vez',
  },
} satisfies Record<string, LocalizedText>);

export type ScaleOfUniverseMessageKey = keyof typeof scaleOfUniverseMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: ScaleOfUniverseMessageKey): LocalizedText => scaleOfUniverseMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ScaleOfUniverseMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const scaleOfUniverseSchema: BundleSchema = {
  id: SCALE_OF_UNIVERSE_ID,
  label: text('label.title'),
  category: 'modern',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 이미 물러나는 중이고, 원자에서 우주까지 스스로 간다.
  parameters: [],

  stages: [
    {
      id: 'powers-of-ten',
      label: text('label.stage'),
      constants: {
        expAtom: EXP_ATOM,
        expCell: EXP_CELL,
        expPerson: EXP_PERSON,
        expEarth: EXP_EARTH,
        expSolar: EXP_SOLAR,
        expGalaxy: EXP_GALAXY,
        expUniverse: EXP_UNIVERSE,
        orbitEarthAu: ORBIT_EARTH_AU,
        orbitJupiterAu: ORBIT_JUPITER_AU,
        orbitSaturnAu: ORBIT_SATURN_AU,
        orbitUranusAu: ORBIT_URANUS_AU,
        orbitNeptuneAu: ORBIT_NEPTUNE_AU,
        nucleusShare: NUCLEUS_SHARE,
        sunShare: SUN_SHARE,
        seed: SEED,
        atomCloudCount: ATOM_CLOUD_COUNT,
        galaxyStarCount: GALAXY_STAR_COUNT,
        universeGalaxyCount: UNIVERSE_GALAXY_COUNT,
      },
    },
  ],

  environments: [],

  views: [{ id: 'step-back', label: text('label.view'), default: true }],

  /** 가로로 틀과 사다리가 나란하다. 세로는 틀 하나 높이면 된다. */
  canvas: { height: 400, minHeight: 340 },

  /**
   * 겹침 순서를 조각이 정한다 — 대상이 맨 아래, 그 위에 10배 겹 정사각 · 틀 테두리 · 사다리 ·
   * 이름표. 겹 정사각이 대상의 채움(세포핵 · 지구)에 가려 잘리면 잔상처럼 읽힌다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 나타남 → 원자 → (물러남 → 대상)×6 → 흐려짐.
   *
   * 물러나는 단계는 `linear` 다 — 한 칸마다 같은 박자라야 「한 칸씩」 이 보인다. 그래서 단계
   * 길이는 **칸 수 × 0.4 초** 로 적었다(세포 5칸 2.0 · 사람 5칸 2.0 · 지구 7칸 2.8 · 태양계 6칸 2.4 ·
   * 은하 8칸 3.2 · 우주 5칸 2.0). 지수 상수를 바꾸면 이 길이도 손으로 맞춘다 (장부 G13 · G129).
   * 우주에서 원자로 되감지 않고 흐려졌다가 원자에서 다시 시작한다 — 되감기는 다른 주장(확대)이다.
   */
  timeline: {
    phases: [
      { id: 'appear', duration: 0.4, caption: key('caption.atom') },
      { id: 'atom', duration: 1.8, caption: key('caption.atom') },
      { id: 'toCell', duration: 2.0, caption: key('caption.zoom') },
      { id: 'cell', duration: 1.8, caption: key('caption.cell') },
      { id: 'toPerson', duration: 2.0, caption: key('caption.zoom') },
      { id: 'person', duration: 1.8, caption: key('caption.person') },
      { id: 'toEarth', duration: 2.8, caption: key('caption.zoom') },
      { id: 'earth', duration: 1.8, caption: key('caption.earth') },
      { id: 'toSolar', duration: 2.4, caption: key('caption.zoom') },
      { id: 'solar', duration: 1.8, caption: key('caption.solar') },
      { id: 'toGalaxy', duration: 3.2, caption: key('caption.zoom') },
      { id: 'galaxy', duration: 1.8, caption: key('caption.galaxy') },
      { id: 'toUniverse', duration: 2.0, caption: key('caption.zoom') },
      { id: 'universe', duration: 2.6, caption: key('caption.universe') },
      { id: 'fade', duration: 0.6, caption: key('caption.universe') },
    ],
  },

  /**
   * 도착한 순간 이미 물러나는 중이다 — 원자가 틀을 채운 뒤 막 줄어들기 시작한 자리에서 연다.
   * 0 이면 흐려진 빈 틀이 먼저 보인다.
   */
  startAt: 2.6,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 거듭제곱의 정의는 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 640,
    fade: 0.25,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /**
   * 크롬 그리드 · 카메라 단추 없음(기본값). 미터 격자는 배율이 바뀌면 뜻을 잃는다 — 대신 틀 안에
   * 10배 간격 정사각 겹을 그려 한 칸 = 10배를 보인다.
   */

  messages: scaleOfUniverseMessages,
};
