// ========================================================================
// charging-methods — 선언
// ========================================================================
// 질문: 물체를 대전시키는 세 방법(마찰 · 접촉 · 유도)은 무엇이 다른가?
//
// 답: 셋 다 **전자만 옮겨 다닌다** — 원자핵의 + 는 제자리다. 다른 것은 전자가
// 어디서 어디로 가느냐이고, 그래서 남는 부호가 갈린다.
//
//   마찰 — 문지르는 동안 전자가 한쪽(털가죽)에서 다른 쪽(막대)으로 옮겨 가 두
//          물체가 **반대 부호**가 된다.
//   접촉 — − 로 대전된 도체가 중성 도체에 닿으면 남는 전자를 나눠 가져 둘 다
//          **같은 부호**가 된다.
//   유도 — − 막대를 가까이 대면 도체 속 전자가 먼 쪽으로 밀리고, 그쪽을 땅에
//          이었다 끊고 막대를 치우면 전자가 모자란 채 **반대 부호**가 남는다.
//
// 이 조각은 부호에만 머문다. 대전된 두 물체가 서로 미는지 당기는지(electric-charge),
// 힘의 크기(coulombs-law), 도체 겉면의 전하 분포(charge-on-conductor-surface)는 하지 않는다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:charging-methods` 와 문자 그대로 일치한다 (C4). */
export const CHARGING_METHODS_ID = 'charging-methods';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 물체 하나에 든 원자핵 + 의 수. 중성이면 전자도 이만큼이다. */
export const NUCLEI_PER_OBJECT = 4;
/** 마찰 — 문지르는 동안 털가죽에서 막대로 옮겨 가는 전자 수. */
export const RUB_TRANSFER = 2;
/** 접촉 — 처음 대전된 도체가 가진 남는 전자 수. 같은 도체 둘이 닿으면 반씩 나눈다. */
export const CONTACT_EXCESS = 2;
/** 유도 — 가까이 대는 막대가 가진 남는 전자 수. 막대의 전자는 옮겨 가지 않는다. */
export const INDUCER_EXCESS = 2;
/** 유도 — 접지한 동안 도체에서 땅으로 빠져나가는 전자 수. */
export const GROUND_OUT = 2;
/** 마찰 — 문지르는 단계 동안 막대가 오가는 횟수. */
export const RUB_STROKES = 3;
/** 마찰 — 막대가 오가는 폭(월드 단위, 한쪽). */
export const RUB_AMPLITUDE = 0.3;
/**
 * 유도 — 밀려난 전자가 몰리는 폭(도체 안쪽 폭에 대한 비). 표시 배율이다 — 실제로는
 * 겉면에 얇게 몰리지만 알갱이가 겹치지 않고 읽히는 만큼만 좁힌다.
 */
export const CROWD_FRACTION = 0.55;
/**
 * 유도 — 접지선으로 빠지는 전자끼리의 시차(단계 길이에 대한 비). 한꺼번에 떠나면 선 위에서
 * 겹쳐 하나로 보인다. 알갱이마다 다른 시각이라 단계로 풀지 못해 상수로 둔다 (NOTES (c)).
 */
export const ELECTRON_STAGGER = 0.3;

// ------------------------------------------------------------------------
// 배치 — 월드 1 단위는 임의 길이. 세 판이 가로로 나란하다.
// ------------------------------------------------------------------------

/** 세 판의 가운데 x. 왼쪽부터 마찰 · 접촉 · 유도. */
export const PANEL_X = [-4.0, 0, 4.3] as const;
/** 판 이름의 높이. */
export const PANEL_TITLE_Y = 1.65;
/** 물체 높이 — 모든 물체가 같다. 위 줄에 +, 아래 두 줄에 전자. */
export const OBJECT_H = 0.9;
/** 결과 표식(중성 · − 대전 · + 대전)을 물체 아래로 내리는 거리(월드). */
export const TAG_DROP = 0.28;

/** 마찰 — 막대와 털가죽의 폭 · 가운데 높이. 문지를 때 막대가 털가죽 위에 얹힌다. */
export const FRICTION = {
  width: 2.0,
  furY: -0.5,
  rodRubY: 0.4,
  rodApartY: 0.95,
} as const;

/** 접촉 — 두 도체의 폭 · 자리. A 가 오른쪽으로 가 B 에 닿았다 돌아온다. */
export const CONTACT = {
  width: 1.4,
  y: -0.5,
  aX: -0.85,
  aTouchX: -0.55,
  bX: 0.85,
} as const;

/** 유도 — 막대 · 도체 · 땅의 자리. 접지선은 도체 오른쪽 끝에서 땅으로 내려간다. */
export const INDUCTION = {
  rodW: 1.4,
  rodY: -0.5,
  rodFarX: -1.5,
  rodNearX: -1.0,
  condW: 1.6,
  condX: 0.8,
  condY: -0.5,
  /** 접지선이 꺾이는 x 와 땅 기호 윗선의 높이. */
  wireX: 1.85,
  earthY: -1.2,
} as const;

/**
 * 프레이밍 — 세 판과 판 이름 · 결과 표식 · 땅 아래 전자까지. 캡션 줄은 아래 여백이 받는다.
 * 매 프레임 같은 값이다 (S-piece — 프레이밍은 주장의 일부다).
 */
export const SCENE_BOUNDS = { minX: -5.2, maxX: 6.55, minY: -1.9, maxY: 1.85 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const chargingMethodsMessages = Object.freeze({
  'label.title': {
    ko: '대전 방법',
    en: 'Charging methods',
    ja: '帯電の方法',
    zh: '起电方式',
    ar: 'طرق الشحن',
    es: 'Métodos de electrización',
    fr: 'Modes d’électrisation',
    hi: 'आवेशित करने की विधियाँ',
    id: 'Cara memberi muatan listrik',
    pt: 'Processos de eletrização',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '마찰·접촉·유도',
    en: 'Friction, contact and induction',
    ja: '摩擦・接触・誘導',
    zh: '摩擦、接触与感应',
    ar: 'الاحتكاك والتلامس والحث',
    es: 'Frotamiento, contacto e inducción',
    fr: 'Frottement, contact et influence',
    hi: 'घर्षण, संपर्क और प्रेरण',
    id: 'Gesekan, sentuhan, dan induksi',
    pt: 'Atrito, contato e indução',
  },
  'label.stage': {
    ko: '세 가지 대전',
    en: 'Three ways to charge',
    ja: '三つの帯電のしかた',
    zh: '三种起电方式',
    ar: 'ثلاث طرق للشحن',
    es: 'Tres formas de electrizar',
    fr: 'Trois façons d’électriser',
    hi: 'आवेशित करने के तीन तरीके',
    id: 'Tiga cara memberi muatan',
    pt: 'Três formas de eletrizar',
  },
  'label.view': {
    ko: '세 판',
    en: 'Three panels',
    ja: '三つのパネル',
    zh: '三个面板',
    ar: 'ثلاث لوحات',
    es: 'Tres paneles',
    fr: 'Trois panneaux',
    hi: 'तीन पैनल',
    id: 'Tiga panel',
    pt: 'Três painéis',
  },

  /** 판 이름. */
  'panel.friction': {
    ko: '마찰',
    en: 'Friction',
    ja: '摩擦',
    zh: '摩擦',
    ar: 'الاحتكاك',
    es: 'Frotamiento',
    fr: 'Frottement',
    hi: 'घर्षण',
    id: 'Gesekan',
    pt: 'Atrito',
  },
  'panel.contact': {
    ko: '접촉',
    en: 'Contact',
    ja: '接触',
    zh: '接触',
    ar: 'التلامس',
    es: 'Contacto',
    fr: 'Contact',
    hi: 'संपर्क',
    id: 'Sentuhan',
    pt: 'Contato',
  },
  'panel.induction': {
    ko: '유도',
    en: 'Induction',
    ja: '誘導',
    zh: '感应',
    ar: 'الحث',
    es: 'Inducción',
    fr: 'Influence',
    hi: 'प्रेरण',
    id: 'Induksi',
    pt: 'Indução',
  },

  /** 원자핵 · 전자 표식. 기호라 번역 대상이 아니다 (C1 판정 3). */
  'mark.plus': {
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
  'mark.electron': {
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

  /** 물체 아래 결과 표식. 전자 수와 + 수를 세지 않고도 부호를 읽게 한다. */
  'tag.neutral': {
    ko: '중성',
    en: 'neutral',
    ja: '中性',
    zh: '中性',
    ar: 'متعادل',
    es: 'neutro',
    fr: 'neutre',
    hi: 'उदासीन',
    id: 'netral',
    pt: 'neutro',
  },
  'tag.negative': {
    ko: '− 대전',
    en: 'charged −',
    ja: '− に帯電',
    zh: '带 − 电',
    ar: 'مشحون −',
    es: 'cargado −',
    fr: 'chargé −',
    hi: '− आवेशित',
    id: 'bermuatan −',
    pt: 'carregado −',
  },
  'tag.positive': {
    ko: '+ 대전',
    en: 'charged +',
    ja: '+ に帯電',
    zh: '带 + 电',
    ar: 'مشحون +',
    es: 'cargado +',
    fr: 'chargé +',
    hi: '+ आवेशित',
    id: 'bermuatan +',
    pt: 'carregado +',
  },

  'caption.appear': {
    ko: '+ 는 원자핵, e⁻ 는 전자다.',
    en: 'The + marks are nuclei; e⁻ are electrons.',
    ja: '+ は原子核、e⁻ は電子。',
    zh: '+ 是原子核，e⁻ 是电子。',
    ar: 'علامات + هي النوى، وe⁻ هي الإلكترونات.',
    es: 'Los + son núcleos; los e⁻, electrones.',
    fr: 'Les + sont des noyaux ; les e⁻, des électrons.',
    hi: '+ नाभिक हैं; e⁻ इलेक्ट्रॉन हैं।',
    id: 'Tanda + adalah inti atom; e⁻ adalah elektron.',
    pt: 'Os + são núcleos; os e⁻, elétrons.',
  },
  'caption.rub': {
    ko: '마찰 — 막대로 털가죽을 문지르는 동안 전자만 털가죽에서 막대로 옮겨 간다. 원자핵 + 는 제자리다.',
    en: 'Friction — while the rod rubs the fur, only electrons move from the fur to the rod. The + nuclei stay put.',
    ja: '摩擦 — 棒で毛皮をこする間、電子だけが毛皮から棒へ移る。原子核の + はその場にとどまる。',
    zh: '摩擦——棒与毛皮摩擦时，只有电子从毛皮转移到棒上。原子核 + 留在原处。',
    ar: 'الاحتكاك — بينما يُدلَك القضيب بالفرو، تنتقل الإلكترونات وحدها من الفرو إلى القضيب. وتبقى النوى + في أماكنها.',
    es: 'Frotamiento — mientras la barra frota la piel, solo los electrones pasan de la piel a la barra. Los núcleos + no se mueven.',
    fr: 'Frottement — pendant que la tige frotte la fourrure, seuls les électrons passent de la fourrure à la tige. Les noyaux + restent en place.',
    hi: 'घर्षण — जब छड़ फर से रगड़ी जाती है, तो केवल इलेक्ट्रॉन फर से छड़ पर जाते हैं। + नाभिक अपनी जगह रहते हैं।',
    id: 'Gesekan — selama batang menggosok bulu, hanya elektron yang berpindah dari bulu ke batang. Inti + tetap di tempatnya.',
    pt: 'Atrito — enquanto o bastão atrita a pele, só os elétrons passam da pele para o bastão. Os núcleos + ficam no lugar.',
  },
  'caption.rubApart': {
    ko: '떼어 놓으면 막대는 전자가 남아 −, 털가죽은 모자라 + — 두 물체가 반대 부호다.',
    en: 'Pulled apart, the rod has extra electrons (−) and the fur is short of them (+): opposite signs.',
    ja: '離すと、棒は電子が余り (−)、毛皮は足りない (+) — 反対の符号だ。',
    zh: '分开后，棒上电子多余（−），毛皮上电子不足（+）：符号相反。',
    ar: 'بعد الفصل، يحمل القضيب إلكترونات زائدة (−) ويفتقر الفرو إليها (+): إشارتان متعاكستان.',
    es: 'Al separarlos, la barra tiene electrones de más (−) y a la piel le faltan (+): signos opuestos.',
    fr: 'Une fois séparées, la tige a des électrons en trop (−) et la fourrure en manque (+) : signes opposés.',
    hi: 'अलग करने पर छड़ में इलेक्ट्रॉन अधिक (−) और फर में कम (+) होते हैं: विपरीत चिह्न।',
    id: 'Setelah dipisah, batang kelebihan elektron (−) dan bulu kekurangan elektron (+): tanda berlawanan.',
    pt: 'Separados, o bastão fica com elétrons a mais (−) e a pele com elétrons a menos (+): sinais opostos.',
  },
  'caption.touch': {
    ko: '접촉 — − 로 대전된 도체가 다가가 중성 도체에 닿는다.',
    en: 'Contact — a conductor charged − moves over and touches a neutral one.',
    ja: '接触 — − に帯電した導体が近づき、中性の導体に触れる。',
    zh: '接触——带 − 电的导体移过去，碰到中性导体。',
    ar: 'التلامس — موصل مشحون بـ − يقترب ويلمس موصلًا متعادلًا.',
    es: 'Contacto — un conductor cargado − se acerca y toca a uno neutro.',
    fr: 'Contact — un conducteur chargé − s’approche et touche un conducteur neutre.',
    hi: 'संपर्क — − आवेशित चालक आगे बढ़कर एक उदासीन चालक को छूता है।',
    id: 'Sentuhan — konduktor bermuatan − bergerak mendekat dan menyentuh konduktor netral.',
    pt: 'Contato — um condutor carregado − se aproxima e toca um neutro.',
  },
  'caption.share': {
    ko: '닿은 자리로 남는 전자가 건너가 두 도체가 나눠 가진다.',
    en: 'The extra electrons cross where they touch, and the two conductors share them.',
    ja: '触れた所から余った電子が渡り、二つの導体で分け合う。',
    zh: '多余的电子经接触处过去，由两个导体分享。',
    ar: 'تعبر الإلكترونات الزائدة عند نقطة التلامس، فيتقاسمها الموصلان.',
    es: 'Los electrones de más cruzan por el punto de contacto y los dos conductores se los reparten.',
    fr: 'Les électrons en trop passent au point de contact, et les deux conducteurs se les partagent.',
    hi: 'अतिरिक्त इलेक्ट्रॉन छूने की जगह से पार जाते हैं, और दोनों चालक उन्हें बाँट लेते हैं।',
    id: 'Elektron berlebih menyeberang di titik sentuh, dan kedua konduktor berbagi elektron itu.',
    pt: 'Os elétrons a mais atravessam pelo ponto de contato e os dois condutores os dividem.',
  },
  'caption.contactApart': {
    ko: '떼어 놓으면 둘 다 − — 접촉은 같은 부호를 나눠 준다.',
    en: 'Pulled apart, both are − : contact passes on the same sign.',
    ja: '離すと両方とも − — 接触は同じ符号を分け与える。',
    zh: '分开后两者都带 −：接触传递的是相同的符号。',
    ar: 'بعد الفصل، كلاهما − : التلامس ينقل الإشارة نفسها.',
    es: 'Al separarlos, ambos son − : el contacto transmite el mismo signo.',
    fr: 'Une fois séparés, les deux sont − : le contact transmet le même signe.',
    hi: 'अलग करने पर दोनों − हैं: संपर्क वही चिह्न आगे देता है।',
    id: 'Setelah dipisah, keduanya − : sentuhan menularkan tanda yang sama.',
    pt: 'Separados, ambos ficam − : o contato passa adiante o mesmo sinal.',
  },
  'caption.near': {
    ko: '유도 — 막대(− 대전)를 닿지 않게 가까이 대면 도체 속 전자가 먼 쪽으로 밀려난다. 도체는 아직 중성이다.',
    en: 'Induction — with a rod (charged −) held close but not touching, the electrons in the conductor are pushed to the far side. It is still neutral.',
    ja: '誘導 — 棒 (− に帯電) を触れないように近づけると、導体の中の電子が遠い側へ押しやられる。導体はまだ中性だ。',
    zh: '感应——将棒（带 − 电）靠近但不接触，导体中的电子被推向远端。导体仍是中性的。',
    ar: 'الحث — عند تقريب قضيب (مشحون بـ −) دون لمس، تُدفَع الإلكترونات في الموصل إلى الجهة البعيدة. لا يزال الموصل متعادلًا.',
    es: 'Inducción — con una barra (cargada −) cerca pero sin tocar, los electrones del conductor son empujados al lado lejano. Sigue siendo neutro.',
    fr: 'Influence — une tige (chargée −) tenue près sans toucher repousse les électrons du conducteur vers le côté éloigné. Il reste neutre.',
    hi: 'प्रेरण — जब छड़ (− आवेशित) को बिना छुए पास लाया जाता है, तो चालक के इलेक्ट्रॉन दूर वाले सिरे की ओर धकेल दिए जाते हैं। चालक अभी भी उदासीन है।',
    id: 'Induksi — batang (bermuatan −) didekatkan tanpa menyentuh, elektron dalam konduktor terdorong ke sisi jauh. Konduktor masih netral.',
    pt: 'Indução — com um bastão (carregado −) perto, mas sem tocar, os elétrons do condutor são empurrados para o lado mais distante. Ele ainda é neutro.',
  },
  'caption.connect': {
    ko: '막대를 댄 채 도체의 먼 쪽을 땅에 잇는다.',
    en: 'With the rod still close, the far side is connected to the ground.',
    ja: '棒を近づけたまま、導体の遠い側を接地する。',
    zh: '棒仍靠近时，把导体远端接地。',
    ar: 'مع بقاء القضيب قريبًا، تُوصَل الجهة البعيدة بالأرض.',
    es: 'Con la barra aún cerca, el lado lejano se conecta a tierra.',
    fr: 'La tige toujours proche, le côté éloigné est relié à la terre.',
    hi: 'छड़ को पास रखे हुए ही, दूर वाले सिरे को भूमि से जोड़ा जाता है।',
    id: 'Dengan batang tetap dekat, sisi jauh dihubungkan ke bumi.',
    pt: 'Com o bastão ainda perto, o lado distante é ligado à terra.',
  },
  'caption.ground': {
    ko: '밀려난 전자가 접지선을 따라 땅으로 빠져나간다.',
    en: 'The pushed electrons escape down the wire into the ground.',
    ja: '押しやられた電子が接地線を通って地面へ逃げる。',
    zh: '被推开的电子沿接地线流入大地。',
    ar: 'تفرّ الإلكترونات المدفوعة عبر السلك إلى الأرض.',
    es: 'Los electrones empujados escapan por el cable hacia la tierra.',
    fr: 'Les électrons repoussés s’échappent par le fil vers la terre.',
    hi: 'धकेले गए इलेक्ट्रॉन तार से होकर भूमि में निकल जाते हैं।',
    id: 'Elektron yang terdorong keluar lewat kawat menuju bumi.',
    pt: 'Os elétrons empurrados escapam pelo fio para a terra.',
  },
  'caption.unground': {
    ko: '막대를 댄 채 땅과의 연결을 끊는다. 빠져나간 전자는 돌아오지 못한다.',
    en: 'With the rod still close, the ground wire is cut. The electrons that left cannot come back.',
    ja: '棒を近づけたまま、接地線を切る。出ていった電子は戻れない。',
    zh: '棒仍靠近时，断开接地线。离开的电子无法回来。',
    ar: 'مع بقاء القضيب قريبًا، يُقطَع سلك التأريض. الإلكترونات التي خرجت لا تستطيع العودة.',
    es: 'Con la barra aún cerca, se corta el cable a tierra. Los electrones que salieron no pueden volver.',
    fr: 'La tige toujours proche, le fil de terre est coupé. Les électrons partis ne peuvent pas revenir.',
    hi: 'छड़ को पास रखे हुए ही, भूमि का तार काट दिया जाता है। जो इलेक्ट्रॉन निकल गए, वे लौट नहीं सकते।',
    id: 'Dengan batang tetap dekat, kawat pembumian diputus. Elektron yang sudah keluar tidak bisa kembali.',
    pt: 'Com o bastão ainda perto, o fio terra é cortado. Os elétrons que saíram não podem voltar.',
  },
  'caption.withdraw': {
    ko: '막대를 치우면 남은 전자가 고르게 퍼지고, 도체는 막대와 반대인 + 로 남는다.',
    en: 'With the rod taken away, the remaining electrons spread out and the conductor is left +, opposite to the rod.',
    ja: '棒を遠ざけると残った電子が一様に広がり、導体は棒と反対の + に帯電したまま残る。',
    zh: '移走棒后，剩下的电子均匀散开，导体带上与棒相反的 +。',
    ar: 'عند إبعاد القضيب، تنتشر الإلكترونات المتبقية ويبقى الموصل +، عكس القضيب.',
    es: 'Al retirar la barra, los electrones restantes se reparten y el conductor queda +, opuesto a la barra.',
    fr: 'Une fois la tige retirée, les électrons restants se répartissent et le conducteur reste +, à l’opposé de la tige.',
    hi: 'छड़ हटाने पर बचे हुए इलेक्ट्रॉन फैल जाते हैं और चालक छड़ के विपरीत, + रह जाता है।',
    id: 'Setelah batang dijauhkan, elektron yang tersisa menyebar dan konduktor tertinggal +, berlawanan dengan batang.',
    pt: 'Retirado o bastão, os elétrons restantes se espalham e o condutor fica +, oposto ao bastão.',
  },
  'caption.hold': {
    ko: '문지르면 반대 부호, 닿으면 같은 부호, 가까이 대고 접지했다 떼면 반대 부호가 남는다.',
    en: 'Rubbing leaves opposite signs, touching leaves the same sign, and inducing with a ground leaves the opposite sign.',
    ja: 'こすれば反対の符号、触れれば同じ符号、接地して誘導すれば反対の符号が残る。',
    zh: '摩擦留下相反的符号，接触留下相同的符号，接地感应留下相反的符号。',
    ar: 'الدلك يترك إشارتين متعاكستين، واللمس يترك الإشارة نفسها، والحث مع التأريض يترك الإشارة المعاكسة.',
    es: 'Frotar deja signos opuestos, tocar deja el mismo signo e inducir con conexión a tierra deja el signo opuesto.',
    fr: 'Frotter laisse des signes opposés, toucher laisse le même signe, et l’influence avec mise à la terre laisse le signe opposé.',
    hi: 'रगड़ने से विपरीत चिह्न, छूने से वही चिह्न, और भूमि से जोड़कर प्रेरण करने से विपरीत चिह्न बचता है।',
    id: 'Menggosok meninggalkan tanda berlawanan, menyentuh meninggalkan tanda yang sama, dan induksi dengan pembumian meninggalkan tanda berlawanan.',
    pt: 'Atritar deixa sinais opostos, tocar deixa o mesmo sinal e induzir com aterramento deixa o sinal oposto.',
  },
} satisfies Record<string, LocalizedText>);

export type ChargingMethodsMessageKey = keyof typeof chargingMethodsMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: ChargingMethodsMessageKey): LocalizedText => chargingMethodsMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ChargingMethodsMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const chargingMethodsSchema: BundleSchema = {
  id: CHARGING_METHODS_ID,
  label: text('label.title'),
  category: 'em',
  description: text('label.description'),
  timeModel: 'periodic',
  parameters: [],
  stages: [
    {
      id: 'three-ways',
      label: text('label.stage'),
      constants: {
        nucleiPerObject: NUCLEI_PER_OBJECT,
        rubTransfer: RUB_TRANSFER,
        contactExcess: CONTACT_EXCESS,
        inducerExcess: INDUCER_EXCESS,
        groundOut: GROUND_OUT,
        rubStrokes: RUB_STROKES,
        rubAmplitude: RUB_AMPLITUDE,
        crowdFraction: CROWD_FRACTION,
        electronStagger: ELECTRON_STAGGER,
      },
    },
  ],
  environments: [],
  views: [{ id: 'panels', label: text('label.view'), default: true }],

  /** 가로로 넓다 — 세 판이 나란하다. 세로는 판 하나의 높이와 캡션만큼이면 된다. */
  canvas: { height: 340, minHeight: 290 },

  /** 도착한 순간 이미 막대가 털가죽을 문지르고 있다 (S-piece). */
  startAt: 1.4,

  /**
   * 한 주기. 세 판이 차례로 움직이고, 앞 판은 결과를 그대로 들고 있다.
   *
   * - `appear` — 모든 물체가 나타난다. 마찰 · 유도의 도체는 중성, 접촉의 왼쪽 도체와
   *   유도의 막대는 처음부터 − 다.
   * - `rub` · `rubApart` — 마찰. 문지르는 동안 전자가 옮겨 가고, 떼어 놓는다.
   * - `touch` · `share` · `contactApart` — 접촉. 다가가 닿고, 전자를 나누고, 떨어진다.
   * - `near` · `connect` · `ground` · `unground` · `withdraw` — 유도. 막대를 대고,
   *   접지선을 잇고, 전자가 빠지고, 선을 끊고, 막대를 치운다.
   * - `hold` — 세 결과를 나란히 둔다.
   * - `fade` — 옅어지며 물러난다. 끝난 화면이 남지 않도록 다음 주기로 잇는다.
   */
  timeline: {
    phases: [
      { id: 'appear', duration: 0.6, caption: key('caption.appear') },
      { id: 'rub', duration: 2.4, ease: 'smooth', caption: key('caption.rub') },
      { id: 'rubApart', duration: 1.0, ease: 'smooth', caption: key('caption.rubApart') },
      { id: 'touch', duration: 0.9, ease: 'smooth', caption: key('caption.touch') },
      { id: 'share', duration: 1.2, ease: 'smooth', caption: key('caption.share') },
      { id: 'contactApart', duration: 1.0, ease: 'smooth', caption: key('caption.contactApart') },
      { id: 'near', duration: 1.4, ease: 'smooth', caption: key('caption.near') },
      { id: 'connect', duration: 0.8, caption: key('caption.connect') },
      { id: 'ground', duration: 1.4, ease: 'smooth', caption: key('caption.ground') },
      { id: 'unground', duration: 0.9, caption: key('caption.unground') },
      { id: 'withdraw', duration: 1.4, ease: 'smooth', caption: key('caption.withdraw') },
      { id: 'hold', duration: 3.6, caption: key('caption.hold') },
      { id: 'fade', duration: 0.6, caption: key('caption.hold') },
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

  // 그리드 · 카메라 단추 · 제목 · 범례 없음(기본). 이 그림이 묻는 것은 거리가 아니라
  // 전자가 어디로 갔는가다 — 거리 눈금은 오독의 경로가 된다 (S-piece).

  messages: chargingMethodsMessages,
};
