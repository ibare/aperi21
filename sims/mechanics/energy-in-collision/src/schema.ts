// ========================================================================
// energy-in-collision — 선언
// ========================================================================
// 질문: 충돌에서 「보존된다」 는 말은 무엇에 붙는가? 운동량인가, 에너지인가?
//
// 답: 운동량은 **어떤 충돌에서도** 그대로다. 운동 에너지는 충돌의 종류에 따라
// 갈린다 — 탄성 충돌에서만 다 남고, 나머지는 열 · 소리 · 찌그러짐으로 나간다.
//
// 화면: 같은 수레가 같은 빠르기로 서 있는 같은 수레에 부딪히는 일을 세 줄
// (탄성 · 비탄성 · 완전 비탄성)로 동시에 보인다. 줄마다 오른쪽 장부에 운동 에너지를
// **한 변이 속력인 네모**(넓이 = 에너지)로, 운동량을 그 네모 **밑변을 따라 이은
// 화살표**(길이 = 운동량)로 둔다. 두 밑변의 합은 언제나 처음 네모의 폭이고,
// 넓이는 탄성 충돌에서만 다시 가득 찬다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:energy-in-collision` 와 문자 그대로 일치한다 (C4). */
export const ENERGY_IN_COLLISION_ID = 'energy-in-collision';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/**
 * 세 줄의 반발 계수 기본값. 위에서부터 탄성 · 비탄성 · 완전 비탄성.
 *
 * 두 수레는 질량이 같고 뒤 수레는 서 있다. 그러면 부딪힌 뒤 속력(처음 속력에 대한 몫)이
 * 앞 수레 (1−e)/2 · 뒤 수레 (1+e)/2 이고 둘의 합은 e 와 무관하게 1 이다 — 운동량이
 * 그대로라는 것이 **두 밑변의 합이 늘 같은 폭**이라는 모양으로 나온다. 남는 운동
 * 에너지 몫은 (1+e²)/2 → 1 · 0.625 · 0.5.
 */
export const RESTITUTION = [1, 0.5, 0] as const;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 원점은 맨 아래 줄 레일의 왼쪽 끝.
// ------------------------------------------------------------------------

/** 수레 너비 · 높이. */
export const CART_W = 0.5;
export const CART_H = 0.26;
/** 수레 밑면을 레일에서 띄우는 틈. */
export const CART_LIFT = 0.02;
/** 세 줄 레일의 높이(위에서부터). */
export const LANE_Y = [2.2, 1.1, 0] as const;
/** 레일의 두 끝(x). */
export const RAIL_X0 = 0;
export const RAIL_X1 = 4.7;
/** 달려오는 수레가 출발하는 자리(중심 x). */
export const A_START_X = 0.35;
/** 서 있는 수레의 자리(중심 x). */
export const B_REST_X = 2;
/** 줄 이름을 레일 위로 올리는 높이. */
export const LANE_LABEL_RISE = 0.62;

/** 장부의 왼쪽 끝(x)과 처음 운동 에너지 네모의 한 변. */
export const LEDGER_X = 5.2;
export const LEDGER_SIDE = 0.8;
/** 네모 바닥 · 운동량 화살표 줄을 레일 위로 올리는 높이. */
export const LEDGER_BASE_RISE = 0.16;
export const ARROW_RISE = 0.05;
/** 운동량 끝 표지(강조 눈금)의 반높이. */
export const KEPT_TICK_HALF = 0.075;
/**
 * 빈자리 이름표를 붙이는 최소 띠 높이(월드)와, 거기서부터 이름표가 또렷해지기까지의 폭.
 * 비탄성 줄의 빈자리 띠(0.2)는 이보다 얇다 — 거기 글자를 넣으면 점선 테두리에 걸린다.
 * 그 줄의 빈자리 이름은 바로 아래 완전 비탄성 줄이 대신 말한다.
 */
export const BAND_LABEL_MIN = 0.24;
export const BAND_LABEL_RAMP = 0.06;

/**
 * 프레이밍 — 왼쪽은 레일, 오른쪽은 장부와 그 이름표, 아래는 캡션 줄.
 * 매 프레임 같은 값이다 (S-piece — 프레이밍은 주장의 일부다).
 */
export const SCENE_BOUNDS = { minX: -0.2, maxX: 6.75, minY: -0.72, maxY: 3.42 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const energyInCollisionMessages = Object.freeze({
  'label.title': { ko: '충돌에서의 에너지', en: 'Energy in collisions', ja: '衝突とエネルギー', zh: '碰撞中的能量', ar: 'الطاقة في التصادمات', es: 'La energía en los choques', fr: 'L’énergie dans les collisions', hi: 'टक्कर में ऊर्जा', id: 'Energi dalam tumbukan', pt: 'Energia nas colisões' },
  'label.operation': {
    ko: '보존되는 것과 안 되는 것의 구분',
    en: 'Telling what is conserved from what is not',
    ja: '保存されるものとされないものを見分ける',
    zh: '区分守恒的量与不守恒的量',
    ar: 'التمييز بين ما يُحفَظ وما لا يُحفَظ',
    es: 'Distinguir lo que se conserva de lo que no',
    fr: 'Distinguer ce qui se conserve de ce qui ne se conserve pas',
    hi: 'क्या संरक्षित रहता है और क्या नहीं, इसमें भेद',
    id: 'Membedakan yang kekal dari yang tidak',
    pt: 'Distinguir o que se conserva do que não se conserva',
  },
  'label.stage': { ko: '같은 수레 둘', en: 'Two identical carts', ja: '同じ台車2台', zh: '两辆相同的小车', ar: 'عربتان متماثلتان', es: 'Dos carritos idénticos', fr: 'Deux chariots identiques', hi: 'दो एक जैसी ट्रॉलियाँ', id: 'Dua troli identik', pt: 'Dois carrinhos idênticos' },
  'label.view': { ko: '세 줄', en: 'Three lanes', ja: '三つのレーン', zh: '三条通道', ar: 'ثلاثة مسارات', es: 'Tres carriles', fr: 'Trois couloirs', hi: 'तीन लेन', id: 'Tiga lajur', pt: 'Três faixas' },

  /** 줄 이름. 세 줄을 가르는 것은 색이 아니라 이 이름이다. */
  'label.elastic': { ko: '탄성 충돌', en: 'Elastic', ja: '弾性衝突', zh: '弹性碰撞', ar: 'تصادم مرن', es: 'Elástico', fr: 'Élastique', hi: 'प्रत्यास्थ टक्कर', id: 'Lenting sempurna', pt: 'Elástica' },
  'label.inelastic': { ko: '비탄성 충돌', en: 'Inelastic', ja: '非弾性衝突', zh: '非弹性碰撞', ar: 'تصادم غير مرن', es: 'Inelástico', fr: 'Inélastique', hi: 'अप्रत्यास्थ टक्कर', id: 'Lenting sebagian', pt: 'Inelástica' },
  'label.perfectlyInelastic': { ko: '완전 비탄성 충돌', en: 'Perfectly inelastic', ja: '完全非弾性衝突', zh: '完全非弹性碰撞', ar: 'تصادم غير مرن تمامًا', es: 'Perfectamente inelástico', fr: 'Parfaitement inélastique', hi: 'पूर्णतः अप्रत्यास्थ टक्कर', id: 'Tidak lenting sama sekali', pt: 'Perfeitamente inelástica' },

  /** 장부 이름. 맨 위 줄에만 붙인다 — 세 줄의 장부는 같은 모양이다. */
  'label.energy': { ko: '운동 에너지 = 넓이', en: 'Kinetic energy = area', ja: '運動エネルギー = 面積', zh: '动能 = 面积', ar: 'الطاقة الحركية = المساحة', es: 'Energía cinética = área', fr: 'Énergie cinétique = aire', hi: 'गतिज ऊर्जा = क्षेत्रफल', id: 'Energi kinetik = luas', pt: 'Energia cinética = área' },
  'label.momentum': { ko: '운동량 = 길이', en: 'Momentum = length', ja: '運動量 = 長さ', zh: '动量 = 长度', ar: 'الزخم = الطول', es: 'Momento lineal = longitud', fr: 'Quantité de mouvement = longueur', hi: 'संवेग = लंबाई', id: 'Momentum = panjang', pt: 'Quantidade de movimento = comprimento' },
  /** 부딪히는 동안 찌그러짐에 들어간 몫(빗금). */
  'label.stored': { ko: '찌그러짐', en: 'Deformation', ja: '変形', zh: '形变', ar: 'التشوّه', es: 'Deformación', fr: 'Déformation', hi: 'विरूपण', id: 'Deformasi', pt: 'Deformação' },
  /** 돌려받지 못하고 열 · 소리로 나간 몫(빈자리). */
  'label.lost': { ko: '사라진 몫', en: 'Lost', ja: '失われた分', zh: '损失', ar: 'المفقود', es: 'Pérdida', fr: 'Perte', hi: 'खोया अंश', id: 'Hilang', pt: 'Perda' },

  'caption.approach': {
    ko: '세 줄 모두 같은 수레가 같은 빠르기로 달려와, 서 있는 같은 수레에 부딪힌다.',
    en: 'In all three lanes the same cart rolls in at the same speed toward an identical cart at rest.',
    ja: '3つのレーンすべてで、同じ台車が同じ速さで走ってきて、止まっている同じ台車に向かう。',
    zh: '三条通道上，同样的小车都以同样的速率驶来，驶向一辆静止的相同小车。',
    ar: 'في المسارات الثلاثة كلها تتدحرج العربة نفسها بالسرعة نفسها نحو عربة مماثلة ساكنة.',
    es: 'En los tres carriles, el mismo carrito llega con la misma rapidez hacia un carrito idéntico en reposo.',
    fr: 'Dans les trois couloirs, le même chariot arrive à la même vitesse vers un chariot identique au repos.',
    hi: 'तीनों लेन में वही ट्रॉली समान चाल से विरामावस्था में खड़ी एक जैसी ट्रॉली की ओर लुढ़कती आती है।',
    id: 'Di ketiga lajur, troli yang sama meluncur dengan kelajuan yang sama menuju troli identik yang diam.',
    pt: 'Nas três faixas, o mesmo carrinho chega com a mesma velocidade até um carrinho idêntico em repouso.',
  },
  'caption.compress': {
    ko: '눌리는 동안은 세 줄이 똑같다 — 네모의 넓이가 찌그러짐(빗금)으로 들어가지만, 화살표 둘을 이은 길이는 끝 눈금에서 움직이지 않는다.',
    en: 'While they squeeze, all three lanes do the same thing — area drains into deformation (hatched), yet the two arrows together still end at the same tick.',
    ja: '押し縮まる間は3つのレーンとも同じだ — 面積が変形(斜線)へ流れ込むが、2本の矢印をつないだ長さは同じ目盛りで終わったままだ。',
    zh: '挤压期间三条通道完全一样 — 面积流入形变（斜线部分），但两支箭头连起来仍止于同一刻度。',
    ar: 'أثناء الانضغاط تتصرف المسارات الثلاثة بالطريقة نفسها — تتسرّب المساحة إلى التشوّه (المظلَّل بخطوط)، ومع ذلك يظل السهمان معًا ينتهيان عند العلامة نفسها.',
    es: 'Mientras se comprimen, los tres carriles hacen lo mismo — el área se vacía hacia la deformación (rayada), pero las dos flechas juntas siguen terminando en la misma marca.',
    fr: 'Pendant la compression, les trois couloirs se comportent pareil — l’aire s’écoule dans la déformation (hachurée), mais les deux flèches mises bout à bout finissent toujours à la même graduation.',
    hi: 'दबने के दौरान तीनों लेन में एक जैसा होता है — क्षेत्रफल विरूपण (धारीदार) में चला जाता है, फिर भी दोनों तीर मिलकर उसी निशान पर समाप्त होते हैं।',
    id: 'Selama tertekan, ketiga lajur sama saja — luas mengalir ke deformasi (arsir), tetapi kedua panah bersama-sama tetap berakhir di tanda yang sama.',
    pt: 'Enquanto se comprimem, as três faixas fazem o mesmo — a área escoa para a deformação (hachurada), mas as duas setas juntas ainda terminam na mesma marca.',
  },
  'caption.restore': {
    ko: '되밀리는 동안 갈린다 — 탄성 충돌은 빗금을 모두 돌려받고, 비탄성은 일부만, 완전 비탄성은 하나도 돌려받지 못한다.',
    en: 'While they push apart, the lanes split — the elastic one takes all of the hatched part back, the inelastic one only some, the perfectly inelastic one none.',
    ja: '押し戻される間にレーンは分かれる — 弾性衝突は斜線部をすべて取り戻し、非弾性は一部だけ、完全非弾性はまったく取り戻さない。',
    zh: '弹开期间三条通道分道扬镳 — 弹性碰撞收回全部斜线部分，非弹性只收回一部分，完全非弹性一点也收不回。',
    ar: 'أثناء التباعد تفترق المسارات — المرن يستعيد الجزء المظلَّل كله، وغير المرن بعضه فقط، وغير المرن تمامًا لا يستعيد شيئًا.',
    es: 'Mientras se separan, los carriles se diferencian — el elástico recupera toda la parte rayada, el inelástico solo una parte y el perfectamente inelástico nada.',
    fr: 'Pendant qu’ils se repoussent, les couloirs divergent — l’élastique récupère toute la partie hachurée, l’inélastique seulement une partie, le parfaitement inélastique rien du tout.',
    hi: 'अलग होते समय लेन बँट जाती हैं — प्रत्यास्थ वाला पूरा धारीदार भाग वापस ले लेता है, अप्रत्यास्थ वाला केवल कुछ, और पूर्णतः अप्रत्यास्थ वाला कुछ भी नहीं।',
    id: 'Saat saling mendorong menjauh, lajur-lajur berpisah — yang lenting sempurna mengambil kembali seluruh bagian arsir, yang lenting sebagian hanya sebagian, yang tidak lenting sama sekali tidak sedikit pun.',
    pt: 'Enquanto se afastam, as faixas se separam — a elástica recupera toda a parte hachurada, a inelástica só uma parte e a perfeitamente inelástica nada.',
  },
  'caption.after': {
    ko: '화살표 길이는 세 줄 모두 처음 그대로인데, 넓이가 다 남은 것은 탄성 충돌뿐이다. 빈자리는 열과 소리로 나갔다.',
    en: 'The arrows still reach the same length in every lane, but only the elastic lane kept all of its area. The empty part left as heat and sound.',
    ja: '矢印の長さはどのレーンでも最初のままだが、面積がすべて残ったのは弾性衝突のレーンだけだ。空いた分は熱と音になって出ていった。',
    zh: '每条通道上箭头仍然达到同样的长度，但面积全部保留下来的只有弹性碰撞那一条。空缺的部分以热和声音的形式散失了。',
    ar: 'ما زالت الأسهم تبلغ الطول نفسه في كل مسار، لكن المسار المرن وحده احتفظ بمساحته كلها. أما الجزء الفارغ فقد خرج حرارةً وصوتًا.',
    es: 'Las flechas siguen alcanzando la misma longitud en cada carril, pero solo el carril elástico conservó toda su área. La parte vacía se fue como calor y sonido.',
    fr: 'Les flèches atteignent toujours la même longueur dans chaque couloir, mais seul le couloir élastique a gardé toute son aire. La partie vide est partie en chaleur et en son.',
    hi: 'हर लेन में तीर अब भी उतनी ही लंबाई तक पहुँचते हैं, पर केवल प्रत्यास्थ लेन ने अपना पूरा क्षेत्रफल बचाए रखा। खाली भाग ऊष्मा और ध्वनि बनकर निकल गया।',
    id: 'Panah tetap mencapai panjang yang sama di setiap lajur, tetapi hanya lajur lenting sempurna yang mempertahankan seluruh luasnya. Bagian yang kosong keluar sebagai kalor dan bunyi.',
    pt: 'As setas ainda chegam ao mesmo comprimento em todas as faixas, mas só a faixa elástica manteve toda a sua área. A parte vazia saiu como calor e som.',
  },
} satisfies Record<string, LocalizedText>);

export type EnergyInCollisionMessageKey = keyof typeof energyInCollisionMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: EnergyInCollisionMessageKey): LocalizedText => energyInCollisionMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: EnergyInCollisionMessageKey): string {
  return k;
}

/** 세 줄의 이름 키. 위에서부터 `RESTITUTION` 과 같은 순서다. */
export const LANE_LABELS = [
  'label.elastic',
  'label.inelastic',
  'label.perfectlyInelastic',
] as const satisfies readonly EnergyInCollisionMessageKey[];

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const energyInCollisionSchema: BundleSchema = {
  id: ENERGY_IN_COLLISION_ID,
  label: text('label.title'),
  category: 'mechanics',
  operation: text('label.operation'),
  timeModel: 'periodic',
  parameters: [],
  stages: [
    {
      id: 'twin-carts',
      label: text('label.stage'),
      constants: {
        restitutionTop: RESTITUTION[0],
        restitutionMiddle: RESTITUTION[1],
        restitutionBottom: RESTITUTION[2],
      },
    },
  ],
  environments: [],
  views: [{ id: 'lanes', label: text('label.view'), default: true }],

  /**
   * 세 줄이 세로를 쓴다. 줄마다 장부 네모 한 변(0.8)과 그 위아래 틈이 한 줄 높이다.
   * 더 낮추면 장부 네모가 작아져 「빈자리」 가 읽히지 않는다.
   */
  canvas: { height: 480, minHeight: 400 },

  /**
   * 쓴 순서대로 겹친다 — 장부의 점선 테두리를 먼저, 그 위에 네모와 빗금을 깐다.
   * 층 순서로는 `trajectory` 가 `region` 위로 올라와 네모 가장자리에 점선이 비친다.
   */
  drawOrder: 'scene',

  /** 도착한 순간 이미 수레가 달려오는 중이다 (S-piece). */
  startAt: 0.7,

  /**
   * 한 주기. 길이는 조각 시계(초)로 센다.
   *
   * - `appear` — 수레와 장부가 나타난다. 앞 주기가 옅어진 자리를 잇는다.
   * - `approach` — 달려온다. 장부에는 달려오는 수레의 네모 하나가 가득하다.
   * - `compress` — 눌리는 동안. 실제로는 순식간이라 `timeScale` 로 늘여 본다.
   *   세 줄이 똑같이 공통 속력까지 간다.
   * - `restore` — 되밀리는 동안. 반발 계수만큼 되돌려 받는다. 여기서 세 줄이 갈린다.
   * - `release` — 빗금이 걷힌다. 돌려받지 못한 몫이 빈자리로 남는다.
   * - `reveal` — 빈자리에 「사라진 몫」 이름이 든다.
   * - `coast` — 부딪힌 뒤의 속력으로 굴러간다.
   * - `fade` — 옅어지며 물러난다.
   */
  timeline: {
    phases: [
      { id: 'appear', duration: 0.3, caption: key('caption.approach') },
      { id: 'approach', duration: 1.2, caption: key('caption.approach') },
      { id: 'compress', duration: 0.1, timeScale: 0.07, caption: key('caption.compress') },
      { id: 'restore', duration: 0.1, timeScale: 0.07, caption: key('caption.restore') },
      { id: 'release', duration: 0.5, caption: key('caption.after') },
      { id: 'reveal', duration: 0.4, caption: key('caption.after') },
      { id: 'coast', duration: 2.4, caption: key('caption.after') },
      { id: 'fade', duration: 0.5, caption: key('caption.after') },
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

  // 그리드 · 카메라 단추 · 제목 · 범례 없음(기본). 잴 것이 레일 위 거리가 아니라
  // 장부의 넓이와 길이라, 거리 눈금은 오독의 경로가 된다 (S-piece).

  messages: energyInCollisionMessages,
};
