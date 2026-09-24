// ========================================================================
// axial-tilt-seasons — 선언
// ========================================================================
// 질문: 지구가 태양에서 멀어지지도 가까워지지도 않는데 왜 계절이 오는가.
//
// 자전축은 기울어진 채 공전하는 내내 우주의 **같은 방향**을 가리킨다. 그래서 궤도의
// 한쪽에서는 북반구가 태양 쪽으로, 반대쪽에서는 태양 반대로 기운다 — 북반구가 받는
// 햇빛의 몫이 절반보다 많아졌다(여름) 적어졌다(겨울) 한다. 기울기를 0 으로 세우면
// 궤도 어디서나 두 반구가 햇빛을 반씩 받아 계절이 사라진다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// 월드 단위는 캔버스 px 에 가까운 임의 단위, y 는 위.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:axial-tilt-seasons` 와 문자 그대로 일치한다 (C4). */
export const AXIAL_TILT_SEASONS_ID = 'axial-tilt-seasons';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 자전축 기울기(도) — 공전 궤도면의 수직에서 잰 각. 지구의 값. */
export const TILT_DEG = 23.5;
/** 견주는 기울기(도). 0 이면 축이 궤도면에 수직으로 선다 — 계절이 사라지는 쪽. */
export const FLAT_TILT_DEG = 0;

// ------------------------------------------------------------------------
// 배치 — 월드 단위(가로 840 · 세로 340 판), y 위
// ------------------------------------------------------------------------

export const CANVAS_W = 840;
export const CANVAS_H = 340;

/**
 * 궤도를 보는 눈의 높이(라디안) — 궤도면 위로 이만큼 올라가 비스듬히 내려다본다.
 * 0 이면 궤도가 선 하나로 눕고, 90° 면 위에서 내려다봐 축의 기울기가 보이지 않는다.
 */
export const VIEW_ELEVATION = (22 * Math.PI) / 180;

/** 궤도 — 가운데 태양, 반지름(월드). 비스듬히 보여 납작한 타원이 된다. */
export const ORBIT = { cx: 262, cy: 178, R: 205 } as const;
/** 태양 원판 반지름. */
export const SUN_R = 20;
/** 지구 원판 반지름 — 명암 경계와 기운 축이 보일 만큼 크게(실제 비율이 아니다). */
export const EARTH_R = 32;
/** 지구 명암을 칠하는 칸 수(가로 = 세로). */
export const EARTH_CELLS = 64;
/** 축 막대가 지구 밖으로 나가는 길이(지구 반지름의 배). 북쪽 끝 이름표 자리. */
export const AXIS_REACH = 1.5;
export const NORTH_LABEL_REACH = 1.9;
/** 그늘 면의 빛 세기 — 0 이면 다크 바탕과 같아진다(이웃 조각과 같은 값). 햇빛 면은 1. */
export const NIGHT_LIGHT = 0.04;
/** 명암 경계의 부드러운 폭(법선 · 태양 방향 내적). */
export const TERMINATOR_SOFT = 0.05;

/** 북반구가 받는 햇빛 몫의 한 해 곡선 — 판의 가로 · 세로. */
export const PLOT = { x0: 566, x1: 806, midY: 176, gain: 330 } as const;
/** 곡선 판의 세로 축이 덮는 몫 범위(아래 · 위). */
export const PLOT_SHARE_RANGE = [0.26, 0.74] as const;
/** 판 글자 자리. */
export const PLOT_TITLE_Y = 290;
export const PLOT_TILT_Y = 314;
export const PLOT_YEAR_Y = 70;
/** 기운 해의 곡선을 기울기 0 인 해 동안 옅게 남기는 불투명도. */
export const GHOST_OPACITY = 0.35;

/**
 * 고정 경계. 판 전체 + 아래 캡션 두 줄 자리. 캡션 슬롯이 그림을 덮지 않게 세로를
 * 아래로 늘렸다 (이웃 조각과 같은 까닭, 장부 G24).
 */
export const SCENE_BOUNDS = { minX: 0, maxX: CANVAS_W, minY: -56, maxY: CANVAS_H } as const;

// ------------------------------------------------------------------------
// 시간표
// ------------------------------------------------------------------------

/** 기운 해의 네 토막 각각(초) — 토막마다 4 분의 1 바퀴. */
export const QUARTER = 3.2;
/** 기울기 0 인 해의 두 토막 각각(초) — 토막마다 반 바퀴. 같은 빠르기로 돈다. */
export const HALF = 2 * QUARTER;
/** 축을 세우고 다시 기울이는 데 드는 시간(초). 그동안 지구는 궤도의 제자리에 선다. */
export const TURN_AXIS = 2.2;
/** 도착한 순간 — 여름 자리로 다가가며 이미 돌고 있다. */
export const START_AT = 0.8;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const axialTiltSeasonsMessages = Object.freeze({
  'label.title': {
    ko: '자전축 기울기와 계절',
    en: 'Axial tilt and the seasons',
    ja: '自転軸の傾きと季節',
    zh: '自转轴倾斜与季节',
    ar: 'ميل محور الدوران والفصول',
    es: 'La inclinación del eje y las estaciones',
    fr: 'L’inclinaison de l’axe et les saisons',
    hi: 'अक्षीय झुकाव और ऋतुएँ',
    id: 'Kemiringan sumbu rotasi dan musim',
    pt: 'A inclinação do eixo e as estações',
  },
  'label.operation': {
    ko: '기울어진 채 도는 것이 만드는 계절',
    en: 'The seasons made by an Earth that orbits tilted',
    ja: '傾いたまま公転する地球がつくる季節',
    zh: '倾斜着公转的地球造成的季节',
    ar: 'الفصول التي تصنعها أرضٌ تدور مائلة',
    es: 'Las estaciones que produce una Tierra que orbita inclinada',
    fr: 'Les saisons d’une Terre qui orbite inclinée',
    hi: 'झुकी हुई अवस्था में परिक्रमा करती पृथ्वी से बनी ऋतुएँ',
    id: 'Musim yang dibuat oleh Bumi yang mengorbit dalam keadaan miring',
    pt: 'As estações criadas por uma Terra que orbita inclinada',
  },
  'label.stage': {
    ko: '태양과 지구',
    en: 'Sun and Earth',
    ja: '太陽と地球',
    zh: '太阳与地球',
    ar: 'الشمس والأرض',
    es: 'El Sol y la Tierra',
    fr: 'Le Soleil et la Terre',
    hi: 'सूर्य और पृथ्वी',
    id: 'Matahari dan Bumi',
    pt: 'O Sol e a Terra',
  },
  'label.view': {
    ko: '궤도를 비스듬히 위에서',
    en: 'The orbit seen from slightly above',
    ja: '少し上から見た公転軌道',
    zh: '从斜上方看的轨道',
    ar: 'المدار مرئيًا من أعلى قليلًا',
    es: 'La órbita vista desde un poco más arriba',
    fr: 'L’orbite vue d’un peu au-dessus',
    hi: 'थोड़ा ऊपर से दिखती कक्षा',
    id: 'Orbit dilihat dari sedikit di atas',
    pt: 'A órbita vista de um pouco acima',
  },
  'label.sun': {
    ko: '태양',
    en: 'Sun',
    ja: '太陽',
    zh: '太阳',
    ar: 'الشمس',
    es: 'Sol',
    fr: 'Soleil',
    hi: 'सूर्य',
    id: 'Matahari',
    pt: 'Sol',
  },
  'label.north': {
    ko: 'N',
    en: 'N',
    ja: 'N',
    zh: 'N',
    ar: 'N',
    es: 'N',
    fr: 'N',
    hi: 'N',
    id: 'N',
    pt: 'N',
  },
  'label.orbitView': {
    ko: '궤도를 비스듬히 위에서 본 지구',
    en: 'Earth’s orbit seen from slightly above',
    ja: '少し上から見た地球の公転軌道',
    zh: '从斜上方看的地球轨道',
    ar: 'مدار الأرض مرئيًا من أعلى قليلًا',
    es: 'La órbita de la Tierra vista desde un poco más arriba',
    fr: 'L’orbite de la Terre vue d’un peu au-dessus',
    hi: 'थोड़ा ऊपर से दिखती पृथ्वी की कक्षा',
    id: 'Orbit Bumi dilihat dari sedikit di atas',
    pt: 'A órbita da Terra vista de um pouco acima',
  },
  'label.shareTitle': {
    ko: '북반구가 받는 햇빛',
    en: 'Sunlight caught by the Northern Hemisphere',
    ja: '北半球が受ける日光',
    zh: '北半球接收的阳光',
    ar: 'ضوء الشمس الذي يتلقاه نصف الكرة الشمالي',
    es: 'Luz solar que recibe el hemisferio norte',
    fr: 'Lumière du Soleil reçue par l’hémisphère Nord',
    hi: 'उत्तरी गोलार्ध को मिलने वाला सूर्य का प्रकाश',
    id: 'Sinar Matahari yang diterima belahan bumi utara',
    pt: 'Luz solar recebida pelo Hemisfério Norte',
  },
  'label.tilt': {
    ko: '자전축 기울기 {tilt}°',
    en: 'axial tilt {tilt}°',
    ja: '自転軸の傾き {tilt}°',
    zh: '自转轴倾角 {tilt}°',
    ar: 'ميل محور الدوران {tilt}°',
    es: 'inclinación del eje {tilt}°',
    fr: 'inclinaison de l’axe {tilt}°',
    hi: 'अक्षीय झुकाव {tilt}°',
    id: 'kemiringan sumbu {tilt}°',
    pt: 'inclinação do eixo {tilt}°',
  },
  'label.half': {
    ko: '절반',
    en: 'half',
    ja: '半分',
    zh: '一半',
    ar: 'النصف',
    es: 'mitad',
    fr: 'moitié',
    hi: 'आधा',
    id: 'setengah',
    pt: 'metade',
  },
  'label.more': {
    ko: '많다',
    en: 'more',
    ja: '多い',
    zh: '多',
    ar: 'أكثر',
    es: 'más',
    fr: 'plus',
    hi: 'अधिक',
    id: 'lebih banyak',
    pt: 'mais',
  },
  'label.less': {
    ko: '적다',
    en: 'less',
    ja: '少ない',
    zh: '少',
    ar: 'أقل',
    es: 'menos',
    fr: 'moins',
    hi: 'कम',
    id: 'lebih sedikit',
    pt: 'menos',
  },
  'label.summer': {
    ko: '여름',
    en: 'summer',
    ja: '夏',
    zh: '夏季',
    ar: 'الصيف',
    es: 'verano',
    fr: 'été',
    hi: 'ग्रीष्म',
    id: 'musim panas',
    pt: 'verão',
  },
  'label.winter': {
    ko: '겨울',
    en: 'winter',
    ja: '冬',
    zh: '冬季',
    ar: 'الشتاء',
    es: 'invierno',
    fr: 'hiver',
    hi: 'शीत',
    id: 'musim dingin',
    pt: 'inverno',
  },
  'label.year': {
    ko: '공전 한 바퀴 = 1년',
    en: 'one orbit = one year',
    ja: '公転1周 = 1年',
    zh: '公转一周 = 一年',
    ar: 'دورة مدارية واحدة = سنة واحدة',
    es: 'una órbita = un año',
    fr: 'une orbite = une année',
    hi: 'एक परिक्रमा = एक वर्ष',
    id: 'satu kali mengorbit = satu tahun',
    pt: 'uma órbita = um ano',
  },
  'caption.toward': {
    ko: '궤도의 이쪽에서는 자전축의 북쪽 끝이 태양 쪽으로 기운다 — 북반구가 햇빛을 절반보다 많이 받는다. 북반구의 여름이다.',
    en: 'On this side of the orbit the north end of the axis leans toward the Sun — the Northern Hemisphere catches more than half the sunlight. It is northern summer.',
    ja: '軌道のこちら側では、自転軸の北端が太陽の方へ傾く — 北半球は日光を半分より多く受ける。北半球の夏だ。',
    zh: '在轨道的这一侧，自转轴的北端倾向太阳——北半球接收的阳光多于一半。这是北半球的夏季。',
    ar: 'في هذا الجانب من المدار يميل الطرف الشمالي للمحور نحو الشمس — فيتلقى نصف الكرة الشمالي أكثر من نصف ضوء الشمس. إنه صيف نصف الكرة الشمالي.',
    es: 'En este lado de la órbita, el extremo norte del eje se inclina hacia el Sol — el hemisferio norte recibe más de la mitad de la luz solar. Es verano en el norte.',
    fr: 'De ce côté de l’orbite, l’extrémité nord de l’axe penche vers le Soleil — l’hémisphère Nord reçoit plus de la moitié de la lumière du Soleil. C’est l’été boréal.',
    hi: 'कक्षा के इस ओर अक्ष का उत्तरी सिरा सूर्य की ओर झुकता है — उत्तरी गोलार्ध को आधे से अधिक सूर्य का प्रकाश मिलता है। यह उत्तरी गोलार्ध की ग्रीष्म ऋतु है।',
    id: 'Di sisi orbit ini ujung utara sumbu condong ke arah Matahari — belahan bumi utara menerima lebih dari separuh sinar Matahari. Ini musim panas di belahan utara.',
    pt: 'Deste lado da órbita, a ponta norte do eixo se inclina para o Sol — o Hemisfério Norte recebe mais da metade da luz solar. É verão no norte.',
  },
  'caption.sideA': {
    ko: '지구가 돌아도 자전축은 우주의 같은 방향을 그대로 가리킨다. 이 자리에서는 태양 쪽으로도 반대로도 기울지 않아 두 반구가 햇빛을 반씩 받는다.',
    en: 'As Earth moves on, the axis keeps pointing the same way in space. Here it leans neither toward nor away from the Sun, so the two hemispheres share the sunlight equally.',
    ja: '地球が進んでも、自転軸は宇宙の同じ方向を指し続ける。ここでは太陽の方にも反対にも傾かず、二つの半球が日光を半分ずつ受ける。',
    zh: '地球继续运行，自转轴始终指向太空中的同一方向。在这里它既不倾向太阳也不背离太阳，两个半球各接收一半阳光。',
    ar: 'مع تقدّم الأرض يظل المحور يشير إلى الاتجاه نفسه في الفضاء. هنا لا يميل نحو الشمس ولا بعيدًا عنها، فيتقاسم نصفا الكرة ضوء الشمس بالتساوي.',
    es: 'Mientras la Tierra avanza, el eje sigue apuntando en la misma dirección del espacio. Aquí no se inclina ni hacia el Sol ni en contra, así que los dos hemisferios se reparten la luz solar por igual.',
    fr: 'Tandis que la Terre avance, l’axe garde la même direction dans l’espace. Ici il ne penche ni vers le Soleil ni à l’opposé : les deux hémisphères se partagent la lumière à parts égales.',
    hi: 'पृथ्वी आगे बढ़ती है, पर अक्ष अंतरिक्ष में उसी दिशा की ओर संकेत करता रहता है। यहाँ वह न सूर्य की ओर झुकता है न उससे दूर, इसलिए दोनों गोलार्धों को बराबर सूर्य का प्रकाश मिलता है।',
    id: 'Saat Bumi terus bergerak, sumbunya tetap menunjuk ke arah yang sama di ruang angkasa. Di sini sumbu tidak condong ke arah Matahari maupun menjauhinya, sehingga kedua belahan bumi menerima sinar Matahari sama rata.',
    pt: 'Enquanto a Terra avança, o eixo continua apontando para a mesma direção no espaço. Aqui ele não se inclina nem para o Sol nem para longe dele, e os dois hemisférios dividem a luz solar igualmente.',
  },
  'caption.away': {
    ko: '반대쪽에 오면 같은 방향을 가리키는 축이 이번에는 태양 반대로 기운다 — 북반구가 햇빛을 절반보다 적게 받는다. 북반구의 겨울이다.',
    en: 'On the far side the same, unchanged axis now leans away from the Sun — the Northern Hemisphere catches less than half the sunlight. It is northern winter.',
    ja: '反対側に来ると、同じ向きのままの軸が今度は太陽と反対へ傾く — 北半球は日光を半分より少なく受ける。北半球の冬だ。',
    zh: '到了轨道另一侧，方向未变的同一根轴这次背离太阳倾斜——北半球接收的阳光少于一半。这是北半球的冬季。',
    ar: 'في الجانب البعيد يميل المحور نفسه، دون أن يتغير، بعيدًا عن الشمس هذه المرة — فيتلقى نصف الكرة الشمالي أقل من نصف ضوء الشمس. إنه شتاء نصف الكرة الشمالي.',
    es: 'En el lado opuesto, el mismo eje, sin cambiar, ahora se inclina en contra del Sol — el hemisferio norte recibe menos de la mitad de la luz solar. Es invierno en el norte.',
    fr: 'De l’autre côté, le même axe, inchangé, penche maintenant à l’opposé du Soleil — l’hémisphère Nord reçoit moins de la moitié de la lumière du Soleil. C’est l’hiver boréal.',
    hi: 'दूसरी ओर वही, बिना बदला अक्ष अब सूर्य से दूर झुकता है — उत्तरी गोलार्ध को आधे से कम सूर्य का प्रकाश मिलता है। यह उत्तरी गोलार्ध की शीत ऋतु है।',
    id: 'Di sisi seberang, sumbu yang sama dan tak berubah kini condong menjauhi Matahari — belahan bumi utara menerima kurang dari separuh sinar Matahari. Ini musim dingin di belahan utara.',
    pt: 'Do outro lado, o mesmo eixo, sem mudar, agora se inclina para longe do Sol — o Hemisfério Norte recebe menos da metade da luz solar. É inverno no norte.',
  },
  'caption.sideB': {
    ko: '다시 옆으로 기운 자리에서 두 반구가 반씩 받고, 북반구는 다시 태양 쪽으로 기우는 자리로 간다.',
    en: 'Sideways again, the hemispheres share equally, and the north heads back toward the side where it leans sunward.',
    ja: '再び横向きの位置では二つの半球が半分ずつ受け、北半球はまた太陽の方へ傾く側へ向かう。',
    zh: '再次来到侧向的位置，两个半球各接收一半，北半球又朝着倾向太阳的那一侧前进。',
    ar: 'في الموضع الجانبي مرة أخرى يتقاسم نصفا الكرة الضوء بالتساوي، ويعود الشمال نحو الجانب الذي يميل فيه إلى الشمس.',
    es: 'De nuevo de lado, los hemisferios se reparten por igual, y el norte vuelve hacia el lado donde se inclina hacia el Sol.',
    fr: 'De nouveau de côté, les hémisphères se partagent à parts égales, et le nord repart vers le côté où il penche vers le Soleil.',
    hi: 'फिर से बगल वाली स्थिति में दोनों गोलार्धों को बराबर मिलता है, और उत्तर फिर उस ओर बढ़ता है जहाँ वह सूर्य की ओर झुकता है।',
    id: 'Kembali di posisi samping, kedua belahan menerima sama rata, dan belahan utara kembali menuju sisi tempat ia condong ke arah Matahari.',
    pt: 'De lado outra vez, os hemisférios dividem igualmente, e o norte volta para o lado em que se inclina para o Sol.',
  },
  'caption.straighten': {
    ko: '이제 자전축을 궤도면에 똑바로 세운다.',
    en: 'Now stand the axis upright, square to the orbit.',
    ja: '今度は自転軸を軌道面に垂直に立てる。',
    zh: '现在把自转轴竖直，与轨道面垂直。',
    ar: 'الآن أقِم المحور عموديًا على مستوى المدار.',
    es: 'Ahora pon el eje derecho, perpendicular a la órbita.',
    fr: 'Redressons maintenant l’axe, perpendiculaire à l’orbite.',
    hi: 'अब अक्ष को सीधा खड़ा करें, कक्षा के तल के लंबवत।',
    id: 'Sekarang tegakkan sumbu, tegak lurus terhadap bidang orbit.',
    pt: 'Agora endireite o eixo, perpendicular à órbita.',
  },
  'caption.flatA': {
    ko: '기울기가 0 이면 궤도 어디서나 두 반구가 햇빛을 반씩 받는다 — 곡선이 절반 선에 붙어 평평하다.',
    en: 'With zero tilt the two hemispheres share the sunlight equally all around the orbit — the curve lies flat on the half line.',
    ja: '傾きが0なら、軌道のどこでも二つの半球が日光を半分ずつ受ける — 曲線は半分の線に沿って平らだ。',
    zh: '倾角为零时，在轨道上任何位置两个半球都各接收一半阳光——曲线平贴在一半线上。',
    ar: 'حين يكون الميل صفرًا يتقاسم نصفا الكرة ضوء الشمس بالتساوي في كل أنحاء المدار — فيستقر المنحنى مستويًا على خط النصف.',
    es: 'Con inclinación cero, los dos hemisferios se reparten la luz solar por igual en toda la órbita — la curva queda plana sobre la línea de la mitad.',
    fr: 'Avec une inclinaison nulle, les deux hémisphères se partagent la lumière à parts égales tout le long de l’orbite — la courbe reste à plat sur la ligne de la moitié.',
    hi: 'झुकाव शून्य हो तो पूरी कक्षा में दोनों गोलार्धों को बराबर सूर्य का प्रकाश मिलता है — वक्र आधे वाली रेखा पर सपाट रहता है।',
    id: 'Dengan kemiringan nol, kedua belahan bumi menerima sinar Matahari sama rata di sepanjang orbit — kurvanya datar di garis setengah.',
    pt: 'Com inclinação zero, os dois hemisférios dividem a luz solar igualmente em toda a órbita — a curva fica plana sobre a linha da metade.',
  },
  'caption.flatB': {
    ko: '태양 반대편에 와도 달라지는 것이 없다. 기울어진 채 돌지 않으면 계절도 없다.',
    en: 'Even on the far side nothing changes. Without the tilt, there are no seasons.',
    ja: '反対側に来ても何も変わらない。傾きがなければ、季節もない。',
    zh: '即使到了另一侧也没有任何变化。没有倾斜，就没有季节。',
    ar: 'حتى في الجانب البعيد لا يتغير شيء. من دون الميل لا توجد فصول.',
    es: 'Ni siquiera en el lado opuesto cambia nada. Sin inclinación, no hay estaciones.',
    fr: 'Même de l’autre côté, rien ne change. Sans inclinaison, pas de saisons.',
    hi: 'दूसरी ओर भी कुछ नहीं बदलता। झुकाव के बिना ऋतुएँ नहीं होतीं।',
    id: 'Bahkan di sisi seberang tidak ada yang berubah. Tanpa kemiringan, tidak ada musim.',
    pt: 'Nem do outro lado algo muda. Sem a inclinação, não há estações.',
  },
  'caption.retilt': {
    ko: '자전축을 다시 기울인다.',
    en: 'Tilt the axis again.',
    ja: '自転軸を再び傾ける。',
    zh: '再次把自转轴倾斜。',
    ar: 'أمِل المحور مرة أخرى.',
    es: 'Inclina el eje otra vez.',
    fr: 'Inclinons de nouveau l’axe.',
    hi: 'अक्ष को फिर से झुकाएँ।',
    id: 'Miringkan sumbu lagi.',
    pt: 'Incline o eixo de novo.',
  },
} satisfies Record<string, LocalizedText>);

export type AxialTiltSeasonsMessageKey = keyof typeof axialTiltSeasonsMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: AxialTiltSeasonsMessageKey): LocalizedText => axialTiltSeasonsMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: AxialTiltSeasonsMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const axialTiltSeasonsSchema: BundleSchema = {
  id: AXIAL_TILT_SEASONS_ID,
  label: text('label.title'),
  category: 'astro',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 기운 해와 기울기 0 인 해를 자동으로 차례로 보여 견주기까지 마친다.
  parameters: [],

  stages: [
    {
      id: 'sun-earth',
      label: text('label.stage'),
      constants: { tilt: TILT_DEG, flatTilt: FLAT_TILT_DEG },
    },
  ],
  environments: [],
  views: [{ id: 'oblique', label: text('label.view'), default: true }],

  /** 판 840 × 340 + 캡션 두 줄. */
  canvas: { height: 420, minHeight: 380 },

  /**
   * 겹침이 판정 장치다 — 궤도 선 위에 지구가, 지구 명암 위에 축과 적도가, 옅은 기운 곡선
   * 위에 기울기 0 인 곡선이 와야 한다. 층 순서로는 `scalarField`(명암)가 축 위로 올 수 있다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 기운 해(네 토막, 토막마다 4 분의 1 바퀴 — 여름 · 옆 · 겨울 · 옆) → 축 세우기 →
   * 기울기 0 인 해(두 토막, 토막마다 반 바퀴) → 다시 기울이기.
   * 지구의 자리를 이 토막들의 진행도 합에서 읽으므로(physics `orbitFraction`) 캡션이 지구의
   * 자리와 어긋날 수 없다. 토막 가운데가 여름 · 옆 · 겨울 · 옆 자리다.
   */
  timeline: {
    phases: [
      { id: 'toward', duration: QUARTER, ease: 'linear', caption: key('caption.toward') },
      { id: 'sideA', duration: QUARTER, ease: 'linear', caption: key('caption.sideA') },
      { id: 'away', duration: QUARTER, ease: 'linear', caption: key('caption.away') },
      { id: 'sideB', duration: QUARTER, ease: 'linear', caption: key('caption.sideB') },
      { id: 'straighten', duration: TURN_AXIS, ease: 'smooth', caption: key('caption.straighten') },
      { id: 'flatA', duration: HALF, ease: 'linear', caption: key('caption.flatA') },
      { id: 'flatB', duration: HALF, ease: 'linear', caption: key('caption.flatB') },
      { id: 'retilt', duration: TURN_AXIS, ease: 'smooth', caption: key('caption.retilt') },
    ],
  },

  /** 도착한 순간 이미 돌고 있다 — 여름 자리로 다가가는 중. */
  startAt: START_AT,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 계절의 정의는 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-left', offset: [16, -8] },
    align: 'left',
    fontSize: 14,
    fade: 0.3,
    style: { colorRole: 'ink', emphasis: 'medium' },
    wrapWidth: CANVAS_W - 32,
  },

  // 그리드 · 카메라 단추 없음 — 잴 것이 거리가 아니라 「어느 쪽으로 기울었나」 다.

  messages: axialTiltSeasonsMessages,
};
