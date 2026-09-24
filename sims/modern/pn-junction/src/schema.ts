// ========================================================================
// pn-junction — 선언
// ========================================================================
// 질문: p형과 n형 반도체를 붙이면 경계에서 무슨 일이 일어나고, 왜 전류가 한쪽으로만
// 흐르는가?
//
// 답: 붙이는 순간 경계 가까이의 전자(n쪽)와 양공(p쪽)이 건너가 만나 함께 사라진다.
// 그 자리에는 움직이지 못하는 이온(p쪽 −, n쪽 +)만 남아 **운반자 없는 공핍층**이 되고,
// 드러난 이온 전하가 n쪽에서 p쪽으로 향하는 전기장을 만들어 더 건너오지 못하게 막는다.
// p쪽에 +를 걸면(순방향) 운반자가 경계 쪽으로 밀려 공핍층이 얇아지고 전자와 양공이 경계를
// 건너 계속 흐른다. 반대로 걸면(역방향) 운반자가 양 끝으로 끌려가 공핍층이 넓어지고
// 아무것도 건너지 못한다.
//
// 화면에서는 가로 막대 하나(왼쪽 p형 · 오른쪽 n형)가 두 조각에서 붙고, 공핍층이 생기고,
// 순방향에서 얇아져 흐르고, 역방향에서 넓어져 멈춘다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:pn-junction` 와 문자 그대로 일치한다 (C4). */
export const PN_JUNCTION_ID = 'pn-junction';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 실리콘 pn 접합의 내부 전위차(V). 공핍층 폭이 `√(내부 전위차 − 건 전압)` 을 따른다. */
export const BUILT_IN_VOLTAGE = 0.7;
/** 순방향으로 건 전압(V). 화면에 `0.5 V` 로 뜬다. 내부 전위차보다 작아야 한다. */
export const FORWARD_VOLTAGE = 0.5;
/** 역방향으로 건 전압의 크기(V). 화면에 `2 V` 로 뜬다. */
export const REVERSE_VOLTAGE = 2;
/**
 * 전압을 걸지 않았을 때 공핍층의 반폭 — 이온 열 수로 센다. 붙인 뒤 경계에서 만나 사라지는
 * 전자 · 양공이 이 열 수만큼이다. 건 전압에 따른 폭은 여기서 `√` 비로 나온다 (NOTES b).
 */
export const ZERO_BIAS_COLS = 2;
/**
 * 순방향에서 운반자가 흐르는 화면 속력(월드/초). 실제 표류 속도를 보이게 한 **표현값**이다 —
 * 「흐른다 · 안 흐른다」 와 방향만 가른다. 화면에 알리지 않는다 (NOTES b).
 */
export const FLOW_SPEED = 0.8;
/** 운반자의 열 흔들림 — 진폭(월드) · 진동수(Hz). 운반자가 자유롭게 움직이는 알갱이로 읽히게 한다. */
export const JITTER = 0.06;
export const JITTER_HZ = 0.9;
/** 흔들림 위상을 뽑는 시드. 같은 시각은 언제나 같은 화면이다 (S-sim). */
export const SEED = 21;

// ------------------------------------------------------------------------
// 배치 — 월드 1 단위. 막대 가운데(x = 0)가 접합면이다.
// ------------------------------------------------------------------------

/** 한쪽 조각의 이온 열 수 · 열 간격(월드). 막대 반길이 = 열 수 × 간격. */
export const COLS_PER_SIDE = 10;
export const SPACING = 0.5;
/** 이온 · 운반자의 줄 수와 줄 간격(월드). 가운데 줄이 y = 0. */
export const ROWS = 3;
export const ROW_GAP = 0.55;
/** 막대 반높이(월드). */
export const BAR_HALF_H = 0.95;
/** 붙이기 전 두 조각 사이 틈(월드). */
export const APART_GAP = 1.2;
/** 전극 판의 너비(월드). 막대 양 끝에 붙는다. */
export const PLATE_W = 0.22;

/**
 * 프레이밍 — 가운데 막대, 위에 전기장 · 전압 이름, 아래에 공핍층 치수선과 캡션.
 * 매 프레임 같은 값이다 (S-piece — 프레이밍은 주장의 일부다). 역방향의 가장 넓은 공핍층과
 * 붙이기 전 벌어진 두 조각이 모두 들어가게 잡았다.
 */
export const SCENE_BOUNDS = { minX: -6.25, maxX: 6.25, minY: -2.65, maxY: 2.15 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const pnJunctionMessages = Object.freeze({
  'label.title': {
    ko: 'pn 접합',
    en: 'p–n junction',
    ja: 'p–n 接合',
    zh: 'p–n 结',
    ar: 'الوصلة p–n',
    es: 'Unión p–n',
    fr: 'Jonction p–n',
    hi: 'p–n संधि',
    id: 'Sambungan p–n',
    pt: 'Junção p–n',
  },
  'label.operation': {
    ko: '공핍층과 정류',
    en: 'Depletion layer and rectification',
    ja: '空乏層と整流',
    zh: '耗尽层与整流',
    ar: 'طبقة الاستنزاف والتقويم',
    es: 'Capa de agotamiento y rectificación',
    fr: 'Zone de déplétion et redressement',
    hi: 'अवक्षय परत और दिष्टकरण',
    id: 'Lapisan deplesi dan penyearahan',
    pt: 'Camada de depleção e retificação',
  },
  'label.stage': {
    ko: '실리콘 pn 접합',
    en: 'Silicon p–n junction',
    ja: 'シリコンの p–n 接合',
    zh: '硅 p–n 结',
    ar: 'وصلة p–n من السيليكون',
    es: 'Unión p–n de silicio',
    fr: 'Jonction p–n au silicium',
    hi: 'सिलिकॉन p–n संधि',
    id: 'Sambungan p–n silikon',
    pt: 'Junção p–n de silício',
  },
  'label.view': {
    ko: '접합 단면',
    en: 'Junction cross-section',
    ja: '接合の断面',
    zh: '结的截面',
    ar: 'مقطع عرضي للوصلة',
    es: 'Sección transversal de la unión',
    fr: 'Coupe de la jonction',
    hi: 'संधि का अनुप्रस्थ काट',
    id: 'Penampang sambungan',
    pt: 'Corte transversal da junção',
  },

  /** 조각 이름. */
  'label.pType': {
    ko: 'p형',
    en: 'p-type',
    ja: 'p型',
    zh: 'p型',
    ar: 'نوع p',
    es: 'tipo p',
    fr: 'type p',
    hi: 'p-प्रकार',
    id: 'tipe-p',
    pt: 'tipo p',
  },
  'label.nType': {
    ko: 'n형',
    en: 'n-type',
    ja: 'n型',
    zh: 'n型',
    ar: 'نوع n',
    es: 'tipo n',
    fr: 'type n',
    hi: 'n-प्रकार',
    id: 'tipe-n',
    pt: 'tipo n',
  },
  'label.depletion': {
    ko: '공핍층',
    en: 'depletion layer',
    ja: '空乏層',
    zh: '耗尽层',
    ar: 'طبقة الاستنزاف',
    es: 'capa de agotamiento',
    fr: 'zone de déplétion',
    hi: 'अवक्षय परत',
    id: 'lapisan deplesi',
    pt: 'camada de depleção',
  },
  /** 건 전압. 값은 스테이지 상수, 단위는 표식이다 (C1 판정 3). */
  'label.forward': {
    ko: '순방향 {v} V',
    en: 'forward bias {v} V',
    ja: '順方向バイアス {v} V',
    zh: '正向偏置 {v} V',
    ar: 'انحياز أمامي {v} V',
    es: 'polarización directa {v} V',
    fr: 'polarisation directe {v} V',
    hi: 'अग्र अभिनति {v} V',
    id: 'bias maju {v} V',
    pt: 'polarização direta {v} V',
  },
  'label.reverse': {
    ko: '역방향 {v} V',
    en: 'reverse bias {v} V',
    ja: '逆方向バイアス {v} V',
    zh: '反向偏置 {v} V',
    ar: 'انحياز عكسي {v} V',
    es: 'polarización inversa {v} V',
    fr: 'polarisation inverse {v} V',
    hi: 'पश्च अभिनति {v} V',
    id: 'bias mundur {v} V',
    pt: 'polarização reversa {v} V',
  },
  /** 전기장 · 전극 극성 기호. 표식이라 번역 대상이 아니다 (C1 판정 3). */
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
  'label.plus': {
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
  'label.minus': {
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

  'caption.apart': {
    ko: 'p형에는 양공(○)이 고정된 음이온(−) 곁에, n형에는 전자(●)가 고정된 양이온(+) 곁에 퍼져 있다. 두 조각을 붙인다.',
    en: 'In p-type, holes (○) sit beside fixed negative ions (−); in n-type, electrons (●) sit beside fixed positive ions (+). The two pieces are joined.',
    ja: 'p型では正孔（○）が固定された負イオン（−）のそばに、n型では電子（●）が固定された正イオン（+）のそばにある。二つの片を接合する。',
    zh: '在p型中，空穴（○）位于固定的负离子（−）旁；在n型中，电子（●）位于固定的正离子（+）旁。把两块接在一起。',
    ar: 'في النوع p تقع الثقوب (○) بجوار أيونات سالبة ثابتة (−)؛ وفي النوع n تقع الإلكترونات (●) بجوار أيونات موجبة ثابتة (+). وتُضمّ القطعتان معًا.',
    es: 'En el tipo p, los huecos (○) están junto a iones negativos fijos (−); en el tipo n, los electrones (●) están junto a iones positivos fijos (+). Se unen las dos piezas.',
    fr: 'Dans le type p, des trous (○) côtoient des ions négatifs fixes (−) ; dans le type n, des électrons (●) côtoient des ions positifs fixes (+). On joint les deux morceaux.',
    hi: 'p-प्रकार में कोटर (○) स्थिर ऋण आयनों (−) के पास रहते हैं; n-प्रकार में इलेक्ट्रॉन (●) स्थिर धन आयनों (+) के पास रहते हैं। दोनों टुकड़ों को जोड़ा जाता है।',
    id: 'Pada tipe-p, lubang (○) berada di samping ion negatif tetap (−); pada tipe-n, elektron (●) berada di samping ion positif tetap (+). Kedua keping disambungkan.',
    pt: 'No tipo p, lacunas (○) ficam ao lado de íons negativos fixos (−); no tipo n, elétrons (●) ficam ao lado de íons positivos fixos (+). As duas peças são unidas.',
  },
  'caption.meet': {
    ko: '경계 가까이의 전자와 양공이 건너가 만나 함께 사라진다.',
    en: 'Near the boundary, electrons and holes cross over, meet and vanish together.',
    ja: '境界の近くで電子と正孔が向こう側へ渡り、出会って共に消える。',
    zh: '在边界附近，电子和空穴越过边界，相遇并一同消失。',
    ar: 'قرب الحد تعبر الإلكترونات والثقوب، فتلتقي وتختفي معًا.',
    es: 'Cerca de la frontera, electrones y huecos cruzan, se encuentran y desaparecen juntos.',
    fr: 'Près de la frontière, électrons et trous traversent, se rencontrent et disparaissent ensemble.',
    hi: 'सीमा के पास इलेक्ट्रॉन और कोटर पार जाते हैं, मिलते हैं और साथ-साथ लुप्त हो जाते हैं।',
    id: 'Di dekat batas, elektron dan lubang menyeberang, bertemu, dan lenyap bersama.',
    pt: 'Perto da fronteira, elétrons e lacunas atravessam, se encontram e desaparecem juntos.',
  },
  'caption.depleted': {
    ko: '운반자가 사라진 자리(공핍층)에는 이온만 남고, 드러난 이온이 n쪽에서 p쪽으로 전기장을 만들어 더 건너오지 못하게 막는다.',
    en: 'Where the carriers vanished (the depletion layer) only ions remain, and their exposed charge sets up a field from n to p that stops any more from crossing.',
    ja: 'キャリアが消えた所（空乏層）にはイオンだけが残り、むき出しになった電荷がnからpへの電場をつくって、それ以上渡れないようにする。',
    zh: '载流子消失的地方（耗尽层）只剩下离子，暴露出的电荷建立起从n指向p的电场，阻止更多载流子越过。',
    ar: 'حيث اختفت حوامل الشحنة (طبقة الاستنزاف) لا يبقى إلا الأيونات، وتُنشئ شحنتها المكشوفة مجالًا من n إلى p يمنع عبور المزيد.',
    es: 'Donde desaparecieron los portadores (la capa de agotamiento) solo quedan iones, y su carga al descubierto crea un campo de n a p que impide que crucen más.',
    fr: 'Là où les porteurs ont disparu (la zone de déplétion), il ne reste que des ions, et leur charge à nu crée un champ de n vers p qui empêche d’autres de traverser.',
    hi: 'जहाँ वाहक लुप्त हुए (अवक्षय परत) वहाँ केवल आयन बचते हैं, और उनका खुला आवेश n से p की ओर क्षेत्र बनाता है जो और किसी को पार करने से रोकता है।',
    id: 'Di tempat pembawa muatan lenyap (lapisan deplesi) hanya ion yang tersisa, dan muatannya yang tersingkap membentuk medan dari n ke p yang menghentikan penyeberangan berikutnya.',
    pt: 'Onde os portadores desapareceram (a camada de depleção) restam só íons, e sua carga exposta cria um campo de n para p que impede que outros atravessem.',
  },
  'caption.forward': {
    ko: '순방향 — p쪽에 +, n쪽에 −를 걸면 공핍층이 얇아지고 전자와 양공이 경계를 건너 계속 흐른다.',
    en: 'Forward bias — with + on the p side and − on the n side, the depletion layer thins and electrons and holes keep crossing the boundary.',
    ja: '順方向バイアス — p側に +、n側に − をかけると空乏層が薄くなり、電子と正孔が境界を渡り続ける。',
    zh: '正向偏置 — p侧接 +、n侧接 − 时，耗尽层变薄，电子和空穴不断越过边界。',
    ar: 'الانحياز الأمامي — مع + على جهة p و− على جهة n، ترقّ طبقة الاستنزاف وتواصل الإلكترونات والثقوب عبور الحد.',
    es: 'Polarización directa — con + en el lado p y − en el lado n, la capa de agotamiento se adelgaza y electrones y huecos siguen cruzando la frontera.',
    fr: 'Polarisation directe — avec + côté p et − côté n, la zone de déplétion s’amincit et électrons et trous continuent de traverser la frontière.',
    hi: 'अग्र अभिनति — p ओर + और n ओर − लगाने पर अवक्षय परत पतली होती है और इलेक्ट्रॉन व कोटर सीमा पार करते रहते हैं।',
    id: 'Bias maju — dengan + di sisi p dan − di sisi n, lapisan deplesi menipis dan elektron serta lubang terus menyeberangi batas.',
    pt: 'Polarização direta — com + no lado p e − no lado n, a camada de depleção afina e elétrons e lacunas continuam atravessando a fronteira.',
  },
  'caption.off': {
    ko: '전압을 끄면 공핍층이 처음 폭으로 돌아온다.',
    en: 'Switch the voltage off and the depletion layer returns to its original width.',
    ja: '電圧を切ると、空乏層は元の幅に戻る。',
    zh: '关掉电压，耗尽层恢复到原来的宽度。',
    ar: 'أطفئ الجهد فتعود طبقة الاستنزاف إلى عرضها الأصلي.',
    es: 'Al apagar el voltaje, la capa de agotamiento vuelve a su ancho original.',
    fr: 'Coupez la tension et la zone de déplétion retrouve sa largeur d’origine.',
    hi: 'वोल्टता बंद करें तो अवक्षय परत अपनी मूल चौड़ाई पर लौट आती है।',
    id: 'Matikan tegangan dan lapisan deplesi kembali ke lebar semula.',
    pt: 'Desligue a tensão e a camada de depleção volta à largura original.',
  },
  'caption.reverse': {
    ko: '역방향 — 반대로 걸면 전자와 양공이 양 끝으로 끌려가 공핍층이 넓어지고, 아무것도 경계를 건너지 못한다.',
    en: 'Reverse bias — flip the voltage and electrons and holes are pulled to the ends; the depletion layer widens and nothing crosses.',
    ja: '逆方向バイアス — 電圧を逆にすると電子と正孔は両端へ引き寄せられ、空乏層が広がって何も渡れない。',
    zh: '反向偏置 — 把电压反过来，电子和空穴被拉向两端；耗尽层变宽，什么也过不去。',
    ar: 'الانحياز العكسي — اعكس الجهد فتُسحب الإلكترونات والثقوب إلى الطرفين؛ تتسع طبقة الاستنزاف ولا يعبر شيء.',
    es: 'Polarización inversa — al invertir el voltaje, electrones y huecos son atraídos hacia los extremos; la capa de agotamiento se ensancha y nada cruza.',
    fr: 'Polarisation inverse — inversez la tension et électrons et trous sont tirés vers les bouts ; la zone de déplétion s’élargit et rien ne traverse.',
    hi: 'पश्च अभिनति — वोल्टता उलटें तो इलेक्ट्रॉन और कोटर सिरों की ओर खिंच जाते हैं; अवक्षय परत चौड़ी होती है और कुछ भी पार नहीं करता।',
    id: 'Bias mundur — balik tegangannya, elektron dan lubang tertarik ke ujung-ujung; lapisan deplesi melebar dan tak ada yang menyeberang.',
    pt: 'Polarização reversa — inverta a tensão e elétrons e lacunas são puxados para as pontas; a camada de depleção se alarga e nada atravessa.',
  },
} satisfies Record<string, LocalizedText>);

export type PnJunctionMessageKey = keyof typeof pnJunctionMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: PnJunctionMessageKey): LocalizedText => pnJunctionMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: PnJunctionMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const pnJunctionSchema: BundleSchema = {
  id: PN_JUNCTION_ID,
  label: text('label.title'),
  category: 'modern',
  operation: text('label.operation'),
  timeModel: 'periodic',
  parameters: [],
  stages: [
    {
      id: 'silicon',
      label: text('label.stage'),
      constants: {
        builtInVoltage: BUILT_IN_VOLTAGE,
        forwardVoltage: FORWARD_VOLTAGE,
        reverseVoltage: REVERSE_VOLTAGE,
        zeroBiasCols: ZERO_BIAS_COLS,
        flowSpeed: FLOW_SPEED,
        jitter: JITTER,
        jitterHz: JITTER_HZ,
        seed: SEED,
      },
    },
  ],
  environments: [],
  views: [{ id: 'cross-section', label: text('label.view'), default: true }],

  /** 가로로 넓다 — 막대 하나. 세로는 막대 · 위아래 이름표 · 캡션이 정한다. */
  canvas: { height: 320, minHeight: 300 },

  /**
   * 쓴 순서대로 겹친다 — 막대 · 공핍층 · 이온 · 운반자 · 만남 고리 · 화살표 · 이름표.
   * 공핍층 칠 위로 이온이, 이온 위로 운반자가 지나가야 한다.
   */
  drawOrder: 'scene',

  /** 도착한 순간 이미 두 조각의 운반자가 흔들리고 있다 (S-piece). */
  startAt: 0.8,

  /**
   * 한 주기 16.2 초. 단계의 길이 · 이징이 곧 연출이라 모두 여기 둔다 (S-piece · 원칙 2).
   *
   * - `appear` · `apart` — 떨어진 두 조각. p형에 양공, n형에 전자가 이온 곁에서 흔들린다.
   * - `join` — 두 조각이 붙는다.
   * - `diffuse` · `recombine` — 경계 가까이(`zeroBiasCols` 열)의 전자와 양공이 접합면으로 건너가 만나고,
   *   고리를 남기며 함께 사라진다. 그 자리의 이온이 드러난다.
   * - `fieldIn` · `depleted` — 공핍층 칠 · 치수선과 내부 전기장 `E` 가 나타난다. 아무것도 건너지 않는다.
   * - `fwdIn` · `fwd` · `fwdOut` — 순방향 전압이 걸려 운반자가 경계 쪽으로 밀리고 공핍층이 얇아진 뒤,
   *   전자와 양공이 경계를 건너 흐른다. 전압을 끄면 제 폭으로 돌아온다.
   * - `revIn` · `rev` — 역방향 전압이 걸려 운반자가 양 끝으로 끌려가고 공핍층이 넓어진다. 멈춰 있다.
   * - `fade` — 옅어지며 다음 주기로 잇는다.
   */
  timeline: {
    phases: [
      { id: 'appear', duration: 0.5, caption: key('caption.apart') },
      { id: 'apart', duration: 1.6, caption: key('caption.apart') },
      { id: 'join', duration: 0.9, ease: 'smooth', caption: key('caption.apart') },
      { id: 'diffuse', duration: 1.3, ease: 'smooth', caption: key('caption.meet') },
      { id: 'recombine', duration: 0.6, caption: key('caption.meet') },
      { id: 'fieldIn', duration: 0.7, ease: 'smooth', caption: key('caption.depleted') },
      { id: 'depleted', duration: 1.6, caption: key('caption.depleted') },
      { id: 'fwdIn', duration: 1.0, ease: 'smooth', caption: key('caption.forward') },
      { id: 'fwd', duration: 3.0, caption: key('caption.forward') },
      { id: 'fwdOut', duration: 1.0, ease: 'smooth', caption: key('caption.off') },
      { id: 'revIn', duration: 1.0, ease: 'smooth', caption: key('caption.reverse') },
      { id: 'rev', duration: 2.4, caption: key('caption.reverse') },
      { id: 'fade', duration: 0.6, caption: key('caption.reverse') },
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

  messages: pnJunctionMessages,
};
