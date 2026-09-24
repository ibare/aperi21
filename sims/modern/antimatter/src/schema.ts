// ========================================================================
// antimatter — 선언
// ========================================================================
// 질문: 물질과 반물질이 만나면 무엇이 남나.
//
// 양전자(e⁺)는 전자(e⁻)와 질량이 같고 전하만 반대인 짝이다. 둘이 만나면 둘 다 사라지고,
// 두 입자의 정지 에너지가 감마선 광자 둘이 되어 **정반대로** 나간다 — 거의 멈춘 채 만났으니
// 처음 운동량이 0 이고, 나간 두 광자의 운동량도 합해 0 이어야 한다. 광자 하나의 에너지는
// 입자 하나의 정지 에너지 mₑc² = 511 keV 와 같다.
//
// 정반대라는 것은 쓸모가 있다. 둘레에 검출기 고리를 두르면 두 광자가 닿은 자리를 이은 선이
// 소멸이 일어난 곳을 지난다. 소멸이 거듭되면 방향은 제각각이어도 선들이 한 점에서 만난다 —
// 양전자를 내는 추적자가 모인 곳이고, PET 가 몸속을 찍는 방법이다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// 광자가 원자핵 곁에서 전자-양전자 쌍이 되는 것은 이웃 `pair-production` 의 몫이라 두지 않는다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:antimatter` 와 문자 그대로 일치한다 (C4). */
export const ANTIMATTER_ID = 'antimatter';

// ------------------------------------------------------------------------
// 물리 · 배치 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 월드 단위는 cm 다. 검출기 고리 반지름은 실제 PET 고리 크기쯤이다.
// ------------------------------------------------------------------------

/**
 * 전자(와 양전자)의 정지 에너지 mₑc²(keV). 화면에 그대로 띄우는 정박값이다. 멈춘 채 만나면
 * 광자 하나의 에너지도 이 값이라, 입자 이름표와 광자 이름표가 같은 상수를 쓴다.
 */
export const REST_ENERGY_KEV = 511;
/** 소멸 방향을 뽑는 시드. 방향은 (시드, 주기 번호, 사건 번호)의 함수다 (S-sim). */
export const SEED = 7;
/** 첫 소멸에서 광자 한쪽이 나가는 방향(도, +x 에서 반시계). 다른 쪽은 정반대. */
export const FIRST_ANGLE_DEG = 28;
/** 추적자가 모인 자리 — 소멸이 일어나는 곳. 고리 가운데에서 비켜 둔다. */
export const SOURCE_X = -12;
export const SOURCE_Y = 8;
/** 검출기 고리 반지름. */
export const RING_RADIUS = 40;
/** 고리를 이루는 검출기 칸 수. */
export const RING_CELLS = 48;
/** 양전자가 다가오기 시작하는 거리(전자에서). */
export const APPROACH_DISTANCE = 20;
/** 다가오기가 끝날 때 둘 사이 거리 — 만나기 직전. */
export const CONTACT_DISTANCE = 1;
/** 광자 물결 뭉치의 길이. */
export const PACKET_LENGTH = 7;
/**
 * 광자 물결 간격. 511 keV 감마선의 실제 파장은 2.43 pm 라 보이지 않는다 — 광자라는 것만 알리는
 * 표시 간격이고 배율을 화면에 알리지 않는다 (NOTES (b)).
 */
export const SHOWN_WAVELENGTH = 1.8;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이(초)
// ------------------------------------------------------------------------

/** 양전자가 전자에 다가오기까지. */
export const PHASE_APPROACH = 2.6;
/** 만나서 사라지기까지. */
export const PHASE_MEET = 0.6;
/** 첫 광자 둘이 고리까지 날아가기까지 — 먼 쪽 광자가 닿는 때가 단계 끝이다. */
export const PHASE_FLY = 1.6;
/** 두 검출 자리를 이은 선이 그어지고 머무는 틈. */
export const PHASE_HIT = 1.6;
/** 이어지는 소멸 하나 — 광자 둘이 고리에 닿기까지. */
export const PHASE_BURST = 0.6;
/** 선들이 한 점에서 만나는 것을 보는 틈. */
export const PHASE_HOLD = 2.4;
export const PHASE_FADE = 0.8;

/** 캡션 자리(월드). 캡션 슬롯은 프레이밍 여백으로 잡히지 않아(장부 G24) 경계에 직접 더한다. */
export const CAPTION_BAND = 7;

/** 프레이밍은 고정 — 검출기 고리와 그 오른쪽 위 이름표, 아래 캡션 띠가 들어간다. */
export const SCENE_BOUNDS = {
  minX: -46,
  maxX: 46,
  minY: -44 - CAPTION_BAND,
  maxY: 44,
} as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const antimatterMessages = Object.freeze({
  'label.title': { ko: '반물질', en: 'Antimatter', ja: '反物質', zh: '反物质', ar: 'المادة المضادة', es: 'Antimateria', fr: 'Antimatière', hi: 'प्रतिद्रव्य', id: 'Antimateri', pt: 'Antimatéria' },
  'label.operation': { ko: '부호가 반대인 짝', en: 'A partner with the opposite charge', ja: '電荷が逆の相棒', zh: '电荷相反的伙伴', ar: 'شريك بشحنة معاكسة', es: 'Una pareja con la carga opuesta', fr: 'Un partenaire de charge opposée', hi: 'विपरीत आवेश वाला साथी', id: 'Pasangan dengan muatan berlawanan', pt: 'Um par com a carga oposta' },
  'label.stage': { ko: '양전자 소멸과 PET', en: 'Positron annihilation and PET', ja: '陽電子の消滅と PET', zh: '正电子湮灭与 PET', ar: 'فناء البوزيترون و PET', es: 'Aniquilación de positrones y PET', fr: 'Annihilation du positon et PET', hi: 'पॉज़िट्रॉन विलोपन और PET', id: 'Anihilasi positron dan PET', pt: 'Aniquilação de pósitrons e PET' },
  'label.view': { ko: '기본', en: 'Default', ja: '標準', zh: '默认', ar: 'افتراضي', es: 'Predeterminada', fr: 'Par défaut', hi: 'डिफ़ॉल्ट', id: 'Bawaan', pt: 'Padrão' },
  /** 입자의 정지 에너지. 값은 선언한 정박값을 끼운다 (C1 · S-piece 유효숫자). */
  'label.restEnergy': { ko: '{e} keV', en: '{e} keV', ja: '{e} keV', zh: '{e} keV', ar: '{e} keV', es: '{e} keV', fr: '{e} keV', hi: '{e} keV', id: '{e} keV', pt: '{e} keV' },
  /** 날아가는 광자. 값은 같은 정지 에너지 상수다. */
  'label.photon': { ko: 'γ {e} keV', en: 'γ {e} keV', ja: 'γ {e} keV', zh: 'γ {e} keV', ar: 'γ {e} keV', es: 'γ {e} keV', fr: 'γ {e} keV', hi: 'γ {e} keV', id: 'γ {e} keV', pt: 'γ {e} keV' },
  'label.detector': { ko: '검출기 고리', en: 'detector ring', ja: '検出器リング', zh: '探测器环', ar: 'حلقة الكواشف', es: 'anillo de detectores', fr: 'anneau de détecteurs', hi: 'संसूचक वलय', id: 'cincin detektor', pt: 'anel de detectores' },
  'mark.electron': { ko: 'e⁻', en: 'e⁻', ja: 'e⁻', zh: 'e⁻', ar: 'e⁻', es: 'e⁻', fr: 'e⁻', hi: 'e⁻', id: 'e⁻', pt: 'e⁻' },
  'mark.positron': { ko: 'e⁺', en: 'e⁺', ja: 'e⁺', zh: 'e⁺', ar: 'e⁺', es: 'e⁺', fr: 'e⁺', hi: 'e⁺', id: 'e⁺', pt: 'e⁺' },
  'caption.approach': {
    ko: '양전자가 전자에 다가간다 — 질량은 같고 전하만 반대인 짝이다',
    en: 'A positron drifts toward an electron — same mass, opposite charge',
    ja: '陽電子が電子に近づいていく — 質量は同じで、電荷だけが逆',
    zh: '正电子慢慢靠近电子 — 质量相同，电荷相反',
    ar: 'يقترب بوزيترون ببطء من إلكترون — الكتلة نفسها والشحنة معاكسة',
    es: 'Un positrón se acerca lentamente a un electrón — misma masa, carga opuesta',
    fr: 'Un positon s’approche d’un électron — même masse, charge opposée',
    hi: 'एक पॉज़िट्रॉन धीरे-धीरे इलेक्ट्रॉन की ओर बढ़ता है — द्रव्यमान समान, आवेश विपरीत',
    id: 'Sebuah positron bergerak perlahan menuju elektron — massanya sama, muatannya berlawanan',
    pt: 'Um pósitron se aproxima de um elétron — mesma massa, carga oposta',
  },
  'caption.meet': {
    ko: '만나는 순간 둘 다 사라진다',
    en: 'The moment they meet, both vanish',
    ja: '出会った瞬間、両方とも消える',
    zh: '相遇的一瞬间，两者都消失了',
    ar: 'في لحظة لقائهما يختفي كلاهما',
    es: 'En el instante en que se encuentran, ambos desaparecen',
    fr: 'Au moment où ils se rencontrent, tous deux disparaissent',
    hi: 'मिलते ही दोनों गायब हो जाते हैं',
    id: 'Begitu bertemu, keduanya lenyap',
    pt: 'No instante em que se encontram, ambos desaparecem',
  },
  'caption.fly': {
    ko: '그 자리에서 감마선 광자 둘이 정반대로 나간다 — 두 입자의 질량이 빛이 되었다',
    en: 'Two gamma photons leave in exactly opposite directions — the mass of both particles has become light',
    ja: '二つのガンマ線光子がちょうど正反対の向きに飛び出す — 二つの粒子の質量が光になった',
    zh: '两个伽马光子沿完全相反的方向飞出 — 两个粒子的质量变成了光',
    ar: 'ينطلق فوتونا غاما في اتجاهين متعاكسين تمامًا — صارت كتلة الجسيمين ضوءًا',
    es: 'Dos fotones gamma salen en direcciones exactamente opuestas — la masa de ambas partículas se ha convertido en luz',
    fr: 'Deux photons gamma partent dans des directions exactement opposées — la masse des deux particules est devenue lumière',
    hi: 'दो गामा फोटॉन ठीक विपरीत दिशाओं में निकलते हैं — दोनों कणों का द्रव्यमान प्रकाश बन गया है',
    id: 'Dua foton gamma melesat ke arah yang tepat berlawanan — massa kedua partikel telah menjadi cahaya',
    pt: 'Dois fótons gama saem em sentidos exatamente opostos — a massa das duas partículas virou luz',
  },
  'caption.hit': {
    ko: '고리의 두 검출기가 광자를 받는다 — 둘을 이은 선이 소멸이 일어난 곳을 지난다',
    en: 'Two detectors on the ring catch them — the line joining them passes through where it happened',
    ja: 'リングの二つの検出器が光子を受け取る — 二つを結ぶ線は、消滅が起きた場所を通る',
    zh: '环上的两个探测器接收到光子 — 连接两者的直线经过湮灭发生的地方',
    ar: 'يلتقطهما كاشفان على الحلقة — والخط الواصل بينهما يمر بالموضع الذي حدث فيه الفناء',
    es: 'Dos detectores del anillo los captan — la línea que los une pasa por donde ocurrió',
    fr: 'Deux détecteurs de l’anneau les captent — la ligne qui les relie passe par l’endroit où cela s’est produit',
    hi: 'वलय के दो संसूचक उन्हें पकड़ते हैं — उन्हें जोड़ने वाली रेखा उसी जगह से गुज़रती है जहाँ यह हुआ',
    id: 'Dua detektor pada cincin menangkapnya — garis yang menghubungkan keduanya melewati tempat kejadiannya',
    pt: 'Dois detectores do anel os captam — a linha que os une passa por onde isso aconteceu',
  },
  'caption.repeat': {
    ko: '소멸이 거듭된다 — 방향은 매번 다르지만 선은 늘 같은 곳을 지난다',
    en: 'More annihilations follow — each goes a different way, yet every line passes the same spot',
    ja: '消滅が繰り返される — 向きは毎回違うが、線はいつも同じ場所を通る',
    zh: '湮灭接连发生 — 每次方向都不同，但每条线都经过同一处',
    ar: 'تتوالى عمليات الفناء — يختلف الاتجاه في كل مرة، لكن كل خط يمر بالموضع نفسه',
    es: 'Siguen más aniquilaciones — cada una va en una dirección distinta, pero todas las líneas pasan por el mismo punto',
    fr: 'D’autres annihilations suivent — chacune part dans une direction différente, mais chaque ligne passe au même endroit',
    hi: 'और विलोपन होते जाते हैं — हर बार दिशा अलग होती है, फिर भी हर रेखा उसी स्थान से गुज़रती है',
    id: 'Anihilasi terus berulang — arahnya selalu berbeda, tetapi setiap garis melewati titik yang sama',
    pt: 'Seguem-se mais aniquilações — cada uma vai numa direção diferente, mas toda linha passa pelo mesmo ponto',
  },
  'caption.hold': {
    ko: '선들이 만나는 점이 양전자를 내는 추적자가 모인 곳이다 — PET 는 이렇게 몸속을 찍는다',
    en: 'The lines cross where the positron-emitting tracer gathered — this is how PET sees inside the body',
    ja: '線が交わる点は、陽電子を出すトレーサーが集まった場所だ — PET はこうして体の中を写す',
    zh: '这些线相交的点，就是发射正电子的示踪剂聚集的地方 — PET 就是这样看到体内的',
    ar: 'تتقاطع الخطوط حيث تجمّع المقتفي المُطلِق للبوزيترونات — هكذا يرى PET داخل الجسم',
    es: 'Las líneas se cruzan donde se acumuló el trazador emisor de positrones — así es como la PET ve dentro del cuerpo',
    fr: 'Les lignes se croisent là où s’est accumulé le traceur émetteur de positons — c’est ainsi que la PET voit l’intérieur du corps',
    hi: 'रेखाएँ वहाँ काटती हैं जहाँ पॉज़िट्रॉन उत्सर्जित करने वाला ट्रेसर इकट्ठा हुआ — PET इसी तरह शरीर के भीतर देखता है',
    id: 'Garis-garis berpotongan di tempat perunut pemancar positron berkumpul — begitulah PET melihat bagian dalam tubuh',
    pt: 'As linhas se cruzam onde o traçador emissor de pósitrons se acumulou — é assim que a PET enxerga dentro do corpo',
  },
} satisfies Record<string, LocalizedText>);

export type AntimatterMessageKey = keyof typeof antimatterMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: AntimatterMessageKey): LocalizedText => antimatterMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: AntimatterMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const antimatterSchema: BundleSchema = {
  id: ANTIMATTER_ID,
  label: text('label.title'),
  category: 'modern',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 한 주기 안에 소멸 하나를 천천히, 이어 여러 번을 빠르게 보여 할 말을 마친다.
  parameters: [],

  stages: [
    {
      id: 'pet-ring',
      label: text('label.stage'),
      constants: {
        restEnergyKeV: REST_ENERGY_KEV,
        seed: SEED,
        firstAngleDeg: FIRST_ANGLE_DEG,
        sourceX: SOURCE_X,
        sourceY: SOURCE_Y,
        ringRadius: RING_RADIUS,
        ringCells: RING_CELLS,
        approachDistance: APPROACH_DISTANCE,
        contactDistance: CONTACT_DISTANCE,
        packetLength: PACKET_LENGTH,
        shownWavelength: SHOWN_WAVELENGTH,
      },
    },
  ],

  environments: [],

  views: [{ id: 'main', label: text('label.view'), default: true }],

  /** 고리 하나 · 캡션 한 줄. 마운트 뒤 바뀌지 않는다. */
  canvas: { height: 460, minHeight: 320 },

  /**
   * 한 주기 = 천천히 보는 소멸 하나 + 빠르게 거듭되는 소멸 일곱.
   *
   * 첫 소멸은 다가옴(approach) → 만남(meet) → 광자 둘이 날아감(fly) → 두 검출 자리를 잇는 선(hit).
   * 이어 `burst-*` 한 단계마다 소멸 하나 — 광자 둘이 고리에 닿으면 그 선이 남는다. 끝에 선들이
   * 만나는 점을 보고(hold) 흐려진다.
   *
   * 단계 id 에서 몇 번째 소멸인지로 가는 짝은 physics 의 `EVENTS` 가 안다 — 단계에 값을 실을
   * 자리가 없다 (장부 G13).
   */
  timeline: {
    phases: [
      { id: 'approach', duration: PHASE_APPROACH, ease: 'smooth', caption: key('caption.approach') },
      { id: 'meet', duration: PHASE_MEET, caption: key('caption.meet') },
      { id: 'fly', duration: PHASE_FLY, caption: key('caption.fly') },
      { id: 'hit', duration: PHASE_HIT, caption: key('caption.hit') },
      { id: 'burst-1', duration: PHASE_BURST, caption: key('caption.repeat') },
      { id: 'burst-2', duration: PHASE_BURST, caption: key('caption.repeat') },
      { id: 'burst-3', duration: PHASE_BURST, caption: key('caption.repeat') },
      { id: 'burst-4', duration: PHASE_BURST, caption: key('caption.repeat') },
      { id: 'burst-5', duration: PHASE_BURST, caption: key('caption.repeat') },
      { id: 'burst-6', duration: PHASE_BURST, caption: key('caption.repeat') },
      { id: 'burst-7', duration: PHASE_BURST, caption: key('caption.repeat') },
      { id: 'hold', duration: PHASE_HOLD, caption: key('caption.hold') },
      { id: 'fade', duration: PHASE_FADE, caption: key('caption.hold') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — 양전자가 다가오는 중에 연다. */
  startAt: 0.4,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — E = mc² 와 운동량 보존 식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -6] },
    fontSize: 13,
    wrapWidth: 760,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  messages: antimatterMessages,
};
