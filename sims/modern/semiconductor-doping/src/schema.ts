// ========================================================================
// semiconductor-doping — 선언
// ========================================================================
// 질문: 순수한 실리콘은 전기가 거의 통하지 않는데, 불순물을 아주 조금 넣으면 왜
// 잘 통하게 되는가? 그리고 n형 · p형은 무엇이 다른가?
//
// 답: **불순물이 운반자를 만든다.** 실리콘은 원자가 전자가 넷이라 이웃 넷과의 결합에
// 모두 묶여 있다. 원자가 전자 다섯인 인(P)을 넣으면 넷은 결합에 쓰이고 하나가 남아
// 아주 작은 에너지로 풀려나 돌아다닌다(n형). 셋인 붕소(B)를 넣으면 결합 하나가 전자
// 하나 모자라고, 이웃 결합의 전자가 그 빈자리로 건너오며 빈자리(양공)가 옮겨 다닌다(p형).
//
// 화면에서는 두 격자가 나란히 같은 전기장을 받는다. 처음엔 둘 다 순수 실리콘이라 아무것도
// 움직이지 않다가, 가운데 줄의 원자 하나가 인 · 붕소로 바뀐 뒤 n형에서는 전자가 전기장 반대로,
// p형에서는 양공이 전기장 쪽으로 옮겨 간다. 격자 옆의 작은 띠 그림이 같은 일을 에너지로
// 보인다 — 도너 준위는 위 띠 바로 밑, 억셉터 준위는 아래 띠 바로 위에 있다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:semiconductor-doping` 와 문자 그대로 일치한다 (C4). */
export const SEMICONDUCTOR_DOPING_ID = 'semiconductor-doping';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 실리콘의 띠틈(eV). */
export const GAP_EV = 1.1;
/** 인(P) 도너 준위가 위 띠 바닥에서 내려앉은 깊이(eV). 실리콘 속 인 0.045 eV. */
export const DONOR_EV = 0.045;
/** 붕소(B) 억셉터 준위가 아래 띠 꼭대기에서 올라선 높이(eV). 실리콘 속 붕소 0.045 eV. */
export const ACCEPTOR_EV = 0.045;
/**
 * 도너 · 억셉터 준위의 깊이를 띠 그림에서 키우는 배율. 제 축척(띠틈의 4 %)이면 준위 선이 띠
 * 가장자리에 붙어 따로 보이지 않는다. 화면의 값 글자(`0.045 eV`)는 참값이다 (NOTES b).
 */
export const LEVEL_DEPTH_SCALE = 4;
/** 원자가 전자 수 — 실리콘 · 인 · 붕소. 남는 전자 수 · 모자란 전자 수가 여기서 나온다. */
export const HOST_VALENCE = 4;
export const DONOR_VALENCE = 5;
export const ACCEPTOR_VALENCE = 3;
/**
 * 풀려난 전자의 화면 속력(월드/초). 실제 표류 속도를 보이게 키운 **표현값**이다 —
 * 「움직인다 · 안 움직인다」 와 방향만 가른다. 화면에 알리지 않는다 (NOTES b).
 */
export const DRIFT_SPEED = 0.6;
/**
 * 양공이 풀려난 뒤 한 칸씩 더 옮겨 가는 횟수. 시간표에 `hopRest-k` · `hop-k` 단계가 이 수만큼
 * 있어야 한다. 격자 오른쪽 끝을 넘지 않아야 한다 — `acceptorCol + 1 + hopCount ≤ COLS − 1`
 * (마지막 자리는 맨 오른쪽 원자가 그림 밖으로 내민 결합이다).
 */
export const HOP_COUNT = 2;
/** 불순물이 들어가는 칸(가운데 줄의 열 번호, 0 부터). 전자는 왼쪽으로, 양공은 오른쪽으로 가므로 길이 남게 둔다. */
export const DONOR_COL = 3;
export const ACCEPTOR_COL = 1;

// ------------------------------------------------------------------------
// 배치 — 월드 1 단위 = 격자 간격 하나. 두 판(n형 · p형)이 나란히 선다.
// ------------------------------------------------------------------------

/** 격자 열 · 행 수. 불순물은 가운데 행에 들어간다. */
export const COLS = 5;
export const ROWS = 3;
/** 판마다 격자 가운데의 x. 띠 그림은 그 오른쪽에 붙는다. */
export const PANEL_X = { n: -4.85, p: 3.1 } as const;
/** 격자 가운데에서 띠 그림 가운데까지(월드). */
export const BAND_DX = 3.82;
/** 띠 그림의 반너비 · 반높이(월드). 높이는 격자와 같게, 너비는 틈 안에 값 글자가 들어가게. */
export const BAND_HALF_W = 0.65;
export const BAND_HALF_H = 1.5;
/** 띠 하나의 두께(월드). 띠 폭(eV)은 이 조각의 주장이 아니라 그림 두께다. */
export const BAND_THICK = 0.6;
/** 띠 그림 안 칸 수 — 격자 열과 한 칸씩 맞선다(가로는 결정 속 자리). */
export const BAND_SLOTS = COLS;

/**
 * 프레이밍 — 왼쪽 n형(격자 + 띠 그림), 오른쪽 p형. 위는 전기장 화살표, 아래는 판 이름과 캡션.
 * 매 프레임 같은 값이다 (S-piece — 프레이밍은 주장의 일부다).
 */
export const SCENE_BOUNDS = { minX: -7.75, maxX: 7.75, minY: -2.8, maxY: 2.5 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const semiconductorDopingMessages = Object.freeze({
  'label.title': {
    ko: '도핑',
    en: 'Doping',
    ja: 'ドーピング',
    zh: '掺杂',
    ar: 'التطعيم',
    es: 'Dopaje',
    fr: 'Dopage',
    hi: 'अपमिश्रण',
    id: 'Doping',
    pt: 'Dopagem',
  },
  'label.operation': {
    ko: '불순물이 만드는 n형과 p형',
    en: 'How impurities make n-type and p-type',
    ja: '不純物がつくるn型とp型',
    zh: '杂质如何形成n型和p型',
    ar: 'كيف تصنع الشوائب النوع n والنوع p',
    es: 'Cómo las impurezas crean el tipo n y el tipo p',
    fr: 'Comment les impuretés créent le type n et le type p',
    hi: 'अशुद्धियाँ n-प्रकार और p-प्रकार कैसे बनाती हैं',
    id: 'Bagaimana pengotor membentuk tipe-n dan tipe-p',
    pt: 'Como as impurezas criam o tipo n e o tipo p',
  },
  'label.stage': {
    ko: '실리콘 두 조각',
    en: 'Two silicon crystals',
    ja: '二つのシリコン結晶',
    zh: '两块硅晶体',
    ar: 'بلّورتا سيليكون',
    es: 'Dos cristales de silicio',
    fr: 'Deux cristaux de silicium',
    hi: 'सिलिकॉन के दो क्रिस्टल',
    id: 'Dua kristal silikon',
    pt: 'Dois cristais de silício',
  },
  'label.view': {
    ko: '격자와 띠 그림',
    en: 'Lattice and band diagram',
    ja: '格子とバンド図',
    zh: '晶格与能带图',
    ar: 'الشبكة البلورية ومخطط النطاقات',
    es: 'Red cristalina y diagrama de bandas',
    fr: 'Réseau et diagramme de bandes',
    hi: 'जालक और बैंड आरेख',
    id: 'Kisi dan diagram pita',
    pt: 'Rede cristalina e diagrama de bandas',
  },

  /** 판 이름. 도핑 전에는 둘 다 순수한 실리콘이다. */
  'label.pure': {
    ko: '순수한 실리콘',
    en: 'Pure silicon',
    ja: '純粋なシリコン',
    zh: '纯硅',
    ar: 'سيليكون نقي',
    es: 'Silicio puro',
    fr: 'Silicium pur',
    hi: 'शुद्ध सिलिकॉन',
    id: 'Silikon murni',
    pt: 'Silício puro',
  },
  'label.nType': {
    ko: 'n형 — 인(P)을 넣음',
    en: 'n-type — phosphorus (P) added',
    ja: 'n型 — リン（P）を添加',
    zh: 'n型 — 掺入磷（P）',
    ar: 'النوع n — أُضيف الفوسفور (P)',
    es: 'tipo n — con fósforo (P) añadido',
    fr: 'type n — phosphore (P) ajouté',
    hi: 'n-प्रकार — फ़ॉस्फ़ोरस (P) मिलाया गया',
    id: 'tipe-n — fosfor (P) ditambahkan',
    pt: 'tipo n — fósforo (P) adicionado',
  },
  'label.pType': {
    ko: 'p형 — 붕소(B)를 넣음',
    en: 'p-type — boron (B) added',
    ja: 'p型 — ホウ素（B）を添加',
    zh: 'p型 — 掺入硼（B）',
    ar: 'النوع p — أُضيف البورون (B)',
    es: 'tipo p — con boro (B) añadido',
    fr: 'type p — bore (B) ajouté',
    hi: 'p-प्रकार — बोरॉन (B) मिलाया गया',
    id: 'tipe-p — boron (B) ditambahkan',
    pt: 'tipo p — boro (B) adicionado',
  },
  /** 띠틈 · 준위 깊이. 값은 스테이지 상수, 단위는 표식이다 (C1 판정 3). */
  'label.energy': {
    ko: '{e} eV',
    en: '{e} eV',
    ja: '{e} eV',
    zh: '{e} eV',
    ar: '{e} eV',
    es: '{e} eV',
    fr: '{e} eV',
    hi: '{e} eV',
    id: '{e} eV',
    pt: '{e} eV',
  },
  /** 원소 기호 · 전기장 · 전자 · 양공 기호. 표식이라 번역 대상이 아니다 (C1 판정 3). */
  'label.si': {
    ko: 'Si',
    en: 'Si',
    ja: 'Si',
    zh: 'Si',
    ar: 'Si',
    es: 'Si',
    fr: 'Si',
    hi: 'Si',
    id: 'Si',
    pt: 'Si',
  },
  'label.p': {
    ko: 'P',
    en: 'P',
    ja: 'P',
    zh: 'P',
    ar: 'P',
    es: 'P',
    fr: 'P',
    hi: 'P',
    id: 'P',
    pt: 'P',
  },
  'label.b': {
    ko: 'B',
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
  'label.field': {
    ko: 'E',
    en: 'E',
    ja: 'E',
    zh: 'E',
    ar: 'E',
    es: 'E',
    fr: 'E',
    hi: 'E',
    id: 'E',
    pt: 'E',
  },
  'label.electron': {
    ko: 'e⁻',
    en: 'e⁻',
    ja: 'e⁻',
    zh: 'e⁻',
    ar: 'e⁻',
    es: 'e⁻',
    fr: 'e⁻',
    hi: 'e⁻',
    id: 'e⁻',
    pt: 'e⁻',
  },
  'label.hole': {
    ko: 'h⁺',
    en: 'h⁺',
    ja: 'h⁺',
    zh: 'h⁺',
    ar: 'h⁺',
    es: 'h⁺',
    fr: 'h⁺',
    hi: 'h⁺',
    id: 'h⁺',
    pt: 'h⁺',
  },

  'caption.pure': {
    ko: '순수한 실리콘에서는 원자마다 전자 넷이 이웃과의 결합에 모두 묶여 있다. 전기장을 걸어도 움직일 것이 없다.',
    en: 'In pure silicon every atom’s four electrons are held in bonds with its neighbours. Under a field, nothing moves.',
    ja: '純粋なシリコンでは、どの原子も4個の電子がすべて隣との結合に束縛されている。電場をかけても動くものはない。',
    zh: '在纯硅中，每个原子的四个电子都被束缚在与相邻原子的键中。加上电场，也没有东西移动。',
    ar: 'في السيليكون النقي تُحتجز الإلكترونات الأربعة لكل ذرة في روابط مع جاراتها. وتحت المجال لا يتحرك شيء.',
    es: 'En el silicio puro, los cuatro electrones de cada átomo están sujetos en enlaces con sus vecinos. Bajo un campo, nada se mueve.',
    fr: 'Dans le silicium pur, les quatre électrons de chaque atome sont retenus dans des liaisons avec ses voisins. Sous un champ, rien ne bouge.',
    hi: 'शुद्ध सिलिकॉन में हर परमाणु के चारों इलेक्ट्रॉन पड़ोसियों के साथ बंधों में बँधे रहते हैं। क्षेत्र लगाने पर भी कुछ नहीं हिलता।',
    id: 'Pada silikon murni, keempat elektron setiap atom terikat dalam ikatan dengan tetangganya. Di bawah medan, tak ada yang bergerak.',
    pt: 'No silício puro, os quatro elétrons de cada átomo ficam presos em ligações com os vizinhos. Sob um campo, nada se move.',
  },
  'caption.dope': {
    ko: '실리콘 하나를 인(전자 다섯)으로 바꾸면 전자 하나가 남고, 붕소(전자 셋)로 바꾸면 결합 하나에 빈자리가 생긴다.',
    en: 'Swap one silicon for phosphorus (five electrons) and one electron is left over; swap it for boron (three) and one bond is left with a gap.',
    ja: 'シリコン一つをリン（電子5個）に替えると電子が一つ余り、ホウ素（3個）に替えると結合の一つに空きができる。',
    zh: '把一个硅换成磷（五个电子），就多出一个电子；换成硼（三个），就有一个键留下空位。',
    ar: 'استبدل بذرة سيليكون واحدة ذرةَ فوسفور (خمسة إلكترونات) فيبقى إلكترون زائد؛ واستبدل بها بورونًا (ثلاثة) فتبقى في إحدى الروابط فجوة.',
    es: 'Cambia un silicio por fósforo (cinco electrones) y sobra un electrón; cámbialo por boro (tres) y un enlace queda con un hueco.',
    fr: 'Remplacez un silicium par du phosphore (cinq électrons) et un électron est en trop ; par du bore (trois), et une liaison reste avec un vide.',
    hi: 'एक सिलिकॉन की जगह फ़ॉस्फ़ोरस (पाँच इलेक्ट्रॉन) रखें तो एक इलेक्ट्रॉन बच जाता है; बोरॉन (तीन) रखें तो एक बंध में रिक्त स्थान रह जाता है।',
    id: 'Ganti satu silikon dengan fosfor (lima elektron) dan satu elektron tersisa; ganti dengan boron (tiga) dan satu ikatan tertinggal dengan celah.',
    pt: 'Troque um silício por fósforo (cinco elétrons) e sobra um elétron; troque por boro (três) e uma ligação fica com uma vaga.',
  },
  'caption.free': {
    ko: '남은 전자는 아주 작은 에너지로 풀려나고, 붕소 곁의 빈자리에는 이웃 결합의 전자가 건너와 빈자리가 옮겨 간다.',
    en: 'The spare electron breaks free with very little energy; next to the boron, a neighbouring bond’s electron hops into the gap and the gap moves on.',
    ja: '余った電子はごく小さなエネルギーで自由になり、ホウ素のそばの空きには隣の結合の電子が移り込んで、空きが移っていく。',
    zh: '多余的电子只需很少的能量就能挣脱；在硼旁边，相邻键的电子跳进空位，空位随之移走。',
    ar: 'ينفلت الإلكترون الزائد بطاقة ضئيلة جدًا؛ وبجوار البورون يقفز إلكترون من رابطة مجاورة إلى الفجوة فتنتقل الفجوة.',
    es: 'El electrón sobrante se libera con muy poca energía; junto al boro, un electrón de un enlace vecino salta al hueco y el hueco se desplaza.',
    fr: 'L’électron en trop se libère avec très peu d’énergie ; près du bore, un électron d’une liaison voisine saute dans le vide et le vide se déplace.',
    hi: 'बचा हुआ इलेक्ट्रॉन बहुत कम ऊर्जा से मुक्त हो जाता है; बोरॉन के पास, पड़ोसी बंध का इलेक्ट्रॉन रिक्त स्थान में कूद आता है और रिक्त स्थान आगे खिसक जाता है।',
    id: 'Elektron sisa terlepas dengan energi yang sangat kecil; di dekat boron, elektron dari ikatan tetangga melompat ke celah itu dan celahnya berpindah.',
    pt: 'O elétron que sobra se liberta com muito pouca energia; ao lado do boro, um elétron de uma ligação vizinha salta para a vaga e a vaga se desloca.',
  },
  'caption.flow': {
    ko: 'n형에서는 전자(−)가 전기장 반대로, p형에서는 양공(+)이 전기장 쪽으로 옮겨 간다 — 불순물 하나가 운반자 하나를 만들었다.',
    en: 'In n-type the electron (−) drifts against the field; in p-type the hole (+) moves with it — one impurity made one carrier.',
    ja: 'n型では電子（−）が電場と逆向きに、p型では正孔（+）が電場の向きに移動する — 不純物一つがキャリア一つをつくった。',
    zh: '在n型中，电子（−）逆着电场漂移；在p型中，空穴（+）顺着电场移动——一个杂质造就了一个载流子。',
    ar: 'في النوع n ينجرف الإلكترون (−) عكس المجال؛ وفي النوع p يتحرك الثقب (+) معه — شائبة واحدة صنعت حاملًا واحدًا للشحنة.',
    es: 'En el tipo n el electrón (−) deriva contra el campo; en el tipo p el hueco (+) se mueve a su favor — una impureza creó un portador.',
    fr: 'Dans le type n, l’électron (−) dérive contre le champ ; dans le type p, le trou (+) se déplace avec lui — une impureté a créé un porteur.',
    hi: 'n-प्रकार में इलेक्ट्रॉन (−) क्षेत्र के विपरीत अपवाहित होता है; p-प्रकार में कोटर (+) क्षेत्र की दिशा में चलता है — एक अशुद्धि ने एक वाहक बनाया।',
    id: 'Pada tipe-n elektron (−) hanyut melawan medan; pada tipe-p lubang (+) bergerak searah medan — satu pengotor menghasilkan satu pembawa muatan.',
    pt: 'No tipo n o elétron (−) deriva contra o campo; no tipo p a lacuna (+) se move a favor dele — uma impureza criou um portador.',
  },
} satisfies Record<string, LocalizedText>);

export type SemiconductorDopingMessageKey = keyof typeof semiconductorDopingMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: SemiconductorDopingMessageKey): LocalizedText => semiconductorDopingMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: SemiconductorDopingMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const semiconductorDopingSchema: BundleSchema = {
  id: SEMICONDUCTOR_DOPING_ID,
  label: text('label.title'),
  category: 'modern',
  operation: text('label.operation'),
  timeModel: 'periodic',
  parameters: [],
  stages: [
    {
      id: 'two-crystals',
      label: text('label.stage'),
      constants: {
        gapEv: GAP_EV,
        donorEv: DONOR_EV,
        acceptorEv: ACCEPTOR_EV,
        levelDepthScale: LEVEL_DEPTH_SCALE,
        hostValence: HOST_VALENCE,
        donorValence: DONOR_VALENCE,
        acceptorValence: ACCEPTOR_VALENCE,
        driftSpeed: DRIFT_SPEED,
        hopCount: HOP_COUNT,
        donorCol: DONOR_COL,
        acceptorCol: ACCEPTOR_COL,
      },
    },
  ],
  environments: [],
  views: [{ id: 'lattice', label: text('label.view'), default: true }],

  /** 가로로 넓다 — 두 판이 나란히. 세로는 격자 세 줄과 캡션이 정한다. */
  canvas: { height: 340, minHeight: 300 },

  /**
   * 쓴 순서대로 겹친다 — 띠 · 결합선 · 원자 · 전자 · 양공 · 화살표 · 이름표.
   * 건너가는 전자가 원자 고리 위를, 양공 고리가 결합선 위를 지나야 한다.
   */
  drawOrder: 'scene',

  /** 도착한 순간 이미 전기장이 걸린 순수 실리콘이 멈춰 있다 (S-piece). */
  startAt: 1.0,

  /**
   * 한 주기 9.8 초. 단계의 길이 · 이징이 곧 연출이라 모두 여기 둔다 (S-piece · 원칙 2).
   *
   * - `pure` — 두 격자 모두 순수 실리콘. 전기장이 걸려 있어도 아무것도 움직이지 않는다.
   * - `dope` · `doped` — 가운데 줄의 원자 하나가 인 · 붕소로 바뀐다. 인 곁에 남는 전자, 붕소 결합에 빈자리.
   *   띠 그림에 도너 · 억셉터 준위가 나타난다.
   * - `free` · `freeHold` — 남는 전자가 인을 떠나고, 이웃 전자가 붕소 결합의 빈자리로 건너온다.
   *   띠 그림에서는 도너 전자가 위 띠로, 아래 띠 전자가 억셉터 준위로 오른다.
   * - `hopRest-k` · `hop-k` — 양공이 한 칸 건너기 전에 멈췄다가(`hopRest`) 건너간다(`hop`).
   *   건너기 횟수(`hopCount`)만큼 짝이 있어야 한다. 풀려난 전자는 그동안 줄곧 흐른다.
   * - `flowHold` — 두 운반자가 옮겨 간 자리를 견준다.
   * - `fade` — 옅어지며 다음 주기로 잇는다.
   */
  timeline: {
    phases: [
      { id: 'pure', duration: 2.4, caption: key('caption.pure') },
      { id: 'dope', duration: 0.9, ease: 'smooth', caption: key('caption.dope') },
      { id: 'doped', duration: 1.4, caption: key('caption.dope') },
      { id: 'free', duration: 0.9, ease: 'smooth', caption: key('caption.free') },
      { id: 'freeHold', duration: 0.5, caption: key('caption.free') },
      { id: 'hopRest-0', duration: 0.3, caption: key('caption.flow') },
      { id: 'hop-0', duration: 0.9, ease: 'smooth', caption: key('caption.flow') },
      { id: 'hopRest-1', duration: 0.4, caption: key('caption.flow') },
      { id: 'hop-1', duration: 0.9, ease: 'smooth', caption: key('caption.flow') },
      { id: 'flowHold', duration: 0.6, caption: key('caption.flow') },
      { id: 'fade', duration: 0.6, caption: key('caption.flow') },
    ],
  },

  /** 슬롯 하나. 단계마다 지금 화면에서 벌어지는 일만 말한다. */
  caption: {
    anchor: { screen: 'bottom-left', offset: [18, -4] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 820,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  // 그리드 · 카메라 단추 · 제목 · 범례 없음(기본). 잴 거리가 없다 (S-piece).

  messages: semiconductorDopingMessages,
};
