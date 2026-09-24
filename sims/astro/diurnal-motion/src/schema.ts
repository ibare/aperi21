// ========================================================================
// diurnal-motion — 선언
// ========================================================================
// 질문: 하룻밤(하루) 동안 별은 하늘에서 어떻게 움직이는가.
//
// 땅 위 관측자가 북쪽 하늘을 본다. 하루를 빨리 감으면 별마다 북극성(천구의 북극)
// 한 점을 가운데 둔 원호를 긋는다. 안쪽 별은 작은 원, 바깥 별은 큰 원이지만 같은
// 시간에 도는 각은 모두 같다 — 별자리가 모양을 그대로 지닌 채 돈다. 하늘 전체가
// 한 덩어리로 도는 것이고, 그것은 지구가 반대쪽으로 도는 것의 거울이다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// 월드 단위는 **하늘의 각(도)** 이다. 천구의 북극이 원점, y 는 위(천정 쪽).
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:diurnal-motion` 와 문자 그대로 일치한다 (C4). */
export const DIURNAL_MOTION_ID = 'diurnal-motion';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 관측 위도(도, 북위). 북극성의 고도가 이 값이다. 기본은 서울 부근. */
export const LATITUDE_DEG = 37.5;
/** 하늘이 한 시간에 도는 각(도). 하루 = 한 바퀴. */
export const DEG_PER_HOUR = 15;
/** 빨리 감는 길이(시간). 하루. */
export const DAY_HOURS = 24;
/**
 * 빨리 감기를 시작할 때의 항성시(시). 봄 저녁 무렵 — 북두칠성이 북극성 오른쪽 위,
 * 카시오페이아가 왼쪽 아래에 있는 하늘이다.
 */
export const START_SIDEREAL_HOURS = 7.5;
/** 흩뿌린 배경 별의 시드 · 개수 · 북극에서 떨어진 최대 각(도). */
export const STAR_SEED = 7;
export const STAR_COUNT = 24;
export const STAR_MAX_POLAR_DEG = 66;

// ------------------------------------------------------------------------
// 별 목록 — 실제 적경(시) · 적위(도) · 겉보기 등급. 모양이 알아볼 수 있는 별자리라야
// 「모양 그대로 돈다」 가 보인다. 스테이지 상수는 수 하나씩이라 목록을 둘 수 없다 (장부 G105).
// ------------------------------------------------------------------------

export interface CatalogStar {
  readonly ra: number;
  readonly dec: number;
  readonly mag: number;
}

/** 북극성. */
export const POLARIS: CatalogStar = { ra: 2.530, dec: 89.26, mag: 2.0 };

/** 북두칠성 — 두베 · 메라크 · 페크다 · 메그레즈 · 알리오트 · 미자르 · 알카이드. */
export const BIG_DIPPER: readonly CatalogStar[] = [
  { ra: 11.062, dec: 61.75, mag: 1.8 },
  { ra: 11.031, dec: 56.38, mag: 2.4 },
  { ra: 11.897, dec: 53.69, mag: 2.4 },
  { ra: 12.257, dec: 57.03, mag: 3.3 },
  { ra: 12.900, dec: 55.96, mag: 1.8 },
  { ra: 13.399, dec: 54.93, mag: 2.2 },
  { ra: 13.792, dec: 49.31, mag: 1.9 },
];
/** 북두칠성 선 — 국자 네 별을 닫고 자루 셋을 잇는다. */
export const BIG_DIPPER_LINES: readonly (readonly number[])[] = [
  [0, 1, 2, 3, 0],
  [3, 4, 5, 6],
];

/** 카시오페이아 — W 자 다섯 별. */
export const CASSIOPEIA: readonly CatalogStar[] = [
  { ra: 0.153, dec: 59.15, mag: 2.3 },
  { ra: 0.675, dec: 56.54, mag: 2.2 },
  { ra: 0.945, dec: 60.72, mag: 2.2 },
  { ra: 1.430, dec: 60.24, mag: 2.7 },
  { ra: 1.907, dec: 63.67, mag: 3.4 },
];
export const CASSIOPEIA_LINES: readonly (readonly number[])[] = [[0, 1, 2, 3, 4]];

// ------------------------------------------------------------------------
// 배치 — 월드 단위는 하늘의 각(도). 천구의 북극이 원점
// ------------------------------------------------------------------------

/** 하늘 창 — 이 사각형 밖의 하늘은 그리지 않는다(창틀로 자른다). */
export const SKY = { minX: -50, maxX: 50, minY: -46, maxY: 40 } as const;
/** 창 위 제목 높이. */
export const SKY_TITLE_Y = 43.5;
/** 땅 위 방위 이름표 높이와 동 · 서 이름표의 가로 자리. */
export const GROUND_LABEL_Y = -42.3;
export const GROUND_SIDE_X = 38;
/** 궤적을 자르는 각 간격(도). */
export const TRAIL_STEP_DEG = 3;
/** 별자리 이름표를 별자리 가운데에서 북극 쪽으로 당기는 각(도). */
export const CONSTELLATION_LABEL_INSET = 13;

/** 흐른 시간 눈금판 — 하늘 창 오른쪽. 바늘이 하늘과 같은 각만큼 같은 쪽으로 돈다. */
export const DIAL = { cx: 78, cy: 2, R: 14, tick: 2.2, labelGap: 5.5, titleY: 31 } as const;

/**
 * 고정 경계. 창 + 눈금판 + 아래 캡션 두 줄 자리. 캡션 슬롯이 그림을 덮지 않게 세로를
 * 아래로 늘렸다 (earth-rotation-day-night 와 같은 까닭, 장부 G24).
 */
export const SCENE_BOUNDS = { minX: -54, maxX: 104, minY: -62, maxY: 47 } as const;

// ------------------------------------------------------------------------
// 시간표 — 저녁 → 자정 → 새벽 → (낮) → 저녁. 빨리 감는 세 토막 + 멈춤 + 비움
// ------------------------------------------------------------------------

/** 빨리 감는 토막 id — 이 토막들의 진행도로 흐른 시간을 읽는다(physics `elapsedHours`). */
export const SWEEP_PHASES = ['dusk', 'midnight', 'daytime'] as const;
/** 도착한 순간 — 저녁에서 한 시간 반쯤 감긴 자리. 궤적이 이미 조금 그어져 있다. */
export const START_AT = 1.0;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const diurnalMotionMessages = Object.freeze({
  'label.title': {
    ko: '일주 운동',
    en: 'Diurnal motion',
    ja: '日周運動',
    zh: '周日视运动',
    ar: 'الحركة اليومية الظاهرية',
    es: 'Movimiento diurno',
    fr: 'Mouvement diurne',
    hi: 'दैनिक गति',
    id: 'Gerak harian',
    pt: 'Movimento diurno',
  },
  'label.operation': {
    ko: '하루 동안 태양과 별이 하늘을 가로지르는 길',
    en: 'The paths the Sun and stars trace across the sky in a day',
    ja: '1日のあいだに太陽と星が空に描く道筋',
    zh: '一天中太阳和星星在天空中划过的路径',
    ar: 'المسارات التي ترسمها الشمس والنجوم عبر السماء في يوم واحد',
    es: 'Las trayectorias que el Sol y las estrellas trazan en el cielo en un día',
    fr: 'Les trajectoires que le Soleil et les étoiles tracent dans le ciel en une journée',
    hi: 'एक दिन में सूर्य और तारे आकाश में जो पथ बनाते हैं',
    id: 'Lintasan yang ditempuh Matahari dan bintang-bintang melintasi langit dalam sehari',
    pt: 'Os caminhos que o Sol e as estrelas traçam no céu em um dia',
  },
  'label.stage': {
    ko: '북쪽 하늘',
    en: 'Northern sky',
    ja: '北の空',
    zh: '北方天空',
    ar: 'السماء الشمالية',
    es: 'Cielo del norte',
    fr: 'Ciel du nord',
    hi: 'उत्तरी आकाश',
    id: 'Langit utara',
    pt: 'Céu do norte',
  },
  'label.view': {
    ko: '땅 위에서',
    en: 'From the ground',
    ja: '地上から',
    zh: '从地面看',
    ar: 'من سطح الأرض',
    es: 'Desde el suelo',
    fr: 'Depuis le sol',
    hi: 'धरती से',
    id: 'Dari permukaan tanah',
    pt: 'Do chão',
  },
  'label.skyTitle': {
    ko: '북쪽 하늘을 바라볼 때 — 북위 {lat}°',
    en: 'Looking at the northern sky — latitude {lat}° N',
    ja: '北の空を見るとき — 北緯 {lat}°',
    zh: '仰望北方天空 — 北纬 {lat}°',
    ar: 'عند النظر إلى السماء الشمالية — خط العرض {lat}° شمالًا',
    es: 'Mirando al cielo del norte — latitud {lat}° N',
    fr: 'En regardant le ciel du nord — latitude {lat}° N',
    hi: 'उत्तरी आकाश को देखते हुए — अक्षांश {lat}° उत्तर',
    id: 'Memandang langit utara — lintang {lat}° LU',
    pt: 'Olhando para o céu do norte — latitude {lat}° N',
  },
  'label.polaris': {
    ko: '북극성',
    en: 'Polaris',
    ja: '北極星',
    zh: '北极星',
    ar: 'النجم القطبي',
    es: 'Estrella Polar',
    fr: 'Étoile Polaire',
    hi: 'ध्रुव तारा',
    id: 'Polaris',
    pt: 'Estrela Polar',
  },
  'label.bigDipper': {
    ko: '북두칠성',
    en: 'Big Dipper',
    ja: '北斗七星',
    zh: '北斗七星',
    ar: 'المغرفة الكبيرة',
    es: 'Carro Mayor',
    fr: 'Grande Casserole',
    hi: 'सप्तर्षि',
    id: 'Biduk',
    pt: 'Grande Carro',
  },
  'label.cassiopeia': {
    ko: '카시오페이아',
    en: 'Cassiopeia',
    ja: 'カシオペヤ座',
    zh: '仙后座',
    ar: 'ذات الكرسي',
    es: 'Casiopea',
    fr: 'Cassiopée',
    hi: 'कैसिओपिया',
    id: 'Kasiopeia',
    pt: 'Cassiopeia',
  },
  'label.north': {
    ko: '북',
    en: 'N',
    ja: '北',
    zh: '北',
    ar: 'شمال',
    es: 'N',
    fr: 'N',
    hi: 'उत्तर',
    id: 'U',
    pt: 'N',
  },
  'label.west': {
    ko: '← 서',
    en: '← W',
    ja: '← 西',
    zh: '← 西',
    ar: '← غرب',
    es: '← O',
    fr: '← O',
    hi: '← पश्चिम',
    id: '← B',
    pt: '← O',
  },
  'label.east': {
    ko: '동 →',
    en: 'E →',
    ja: '東 →',
    zh: '东 →',
    ar: 'شرق →',
    es: 'E →',
    fr: 'E →',
    hi: 'पूर्व →',
    id: 'T →',
    pt: 'L →',
  },
  'label.elapsed': {
    ko: '흐른 시간',
    en: 'Time elapsed',
    ja: '経過時間',
    zh: '经过的时间',
    ar: 'الزمن المنقضي',
    es: 'Tiempo transcurrido',
    fr: 'Temps écoulé',
    hi: 'बीता समय',
    id: 'Waktu berlalu',
    pt: 'Tempo decorrido',
  },
  'label.dusk': {
    ko: '저녁',
    en: 'dusk',
    ja: '夕方',
    zh: '傍晚',
    ar: 'الغسق',
    es: 'anochecer',
    fr: 'crépuscule',
    hi: 'संध्या',
    id: 'senja',
    pt: 'anoitecer',
  },
  'label.midnight': {
    ko: '자정',
    en: 'midnight',
    ja: '真夜中',
    zh: '午夜',
    ar: 'منتصف الليل',
    es: 'medianoche',
    fr: 'minuit',
    hi: 'मध्यरात्रि',
    id: 'tengah malam',
    pt: 'meia-noite',
  },
  'label.dawn': {
    ko: '새벽',
    en: 'dawn',
    ja: '明け方',
    zh: '黎明',
    ar: 'الفجر',
    es: 'amanecer',
    fr: 'aube',
    hi: 'भोर',
    id: 'fajar',
    pt: 'amanhecer',
  },
  'label.noon': {
    ko: '정오',
    en: 'noon',
    ja: '正午',
    zh: '正午',
    ar: 'الظهر',
    es: 'mediodía',
    fr: 'midi',
    hi: 'दोपहर',
    id: 'tengah hari',
    pt: 'meio-dia',
  },
  'caption.dusk': {
    ko: '하루를 빨리 감는다. 별마다 북극성을 가운데 둔 원을 따라 시계 반대 방향으로 돈다.',
    en: 'Fast-forwarding a day. Every star circles counterclockwise around Polaris.',
    ja: '1日を早送りする。どの星も北極星を中心に反時計回りに円を描く。',
    zh: '快进一天。每颗星都绕北极星逆时针转圈。',
    ar: 'تسريع يوم كامل. كل نجم يدور حول النجم القطبي عكس اتجاه عقارب الساعة.',
    es: 'Avanzando rápido un día. Cada estrella gira en sentido antihorario alrededor de la Estrella Polar.',
    fr: 'Un jour en accéléré. Chaque étoile tourne dans le sens antihoraire autour de l’étoile Polaire.',
    hi: 'एक दिन को तेज़ी से आगे बढ़ाया जा रहा है। हर तारा ध्रुव तारे के चारों ओर वामावर्त घूमता है।',
    id: 'Satu hari dipercepat. Setiap bintang berputar berlawanan arah jarum jam mengelilingi Polaris.',
    pt: 'Avançando um dia rapidamente. Cada estrela gira no sentido anti-horário em torno da Estrela Polar.',
  },
  'caption.midnight': {
    ko: '안쪽 별은 작은 원, 바깥 별은 큰 원을 그리지만 같은 시간에 도는 각은 모두 같다 — 북두칠성은 모양 그대로 돈다.',
    en: 'Inner stars draw small circles and outer stars large ones, yet all turn through the same angle in the same time — the Big Dipper keeps its shape.',
    ja: '内側の星は小さな円、外側の星は大きな円を描くが、同じ時間に回る角度はみな同じ — 北斗七星は形を保ったまま回る。',
    zh: '内侧的星画小圆，外侧的星画大圆，但在相同时间内转过的角度都相同 — 北斗七星保持形状不变。',
    ar: 'ترسم النجوم الداخلية دوائر صغيرة والخارجية دوائر كبيرة، لكنها جميعًا تدور بالزاوية نفسها في الزمن نفسه — تحافظ المغرفة الكبيرة على شكلها.',
    es: 'Las estrellas interiores trazan círculos pequeños y las exteriores círculos grandes, pero todas giran el mismo ángulo en el mismo tiempo — el Carro Mayor conserva su forma.',
    fr: 'Les étoiles intérieures tracent de petits cercles et les extérieures de grands, mais toutes tournent du même angle dans le même temps — la Grande Casserole garde sa forme.',
    hi: 'भीतरी तारे छोटे वृत्त और बाहरी तारे बड़े वृत्त बनाते हैं, फिर भी समान समय में सभी समान कोण से घूमते हैं — सप्तर्षि का आकार नहीं बदलता।',
    id: 'Bintang di bagian dalam membentuk lingkaran kecil dan yang di luar lingkaran besar, tetapi semuanya berputar dengan sudut yang sama dalam waktu yang sama — Biduk tetap mempertahankan bentuknya.',
    pt: 'As estrelas internas descrevem círculos pequenos e as externas, grandes, mas todas giram o mesmo ângulo no mesmo tempo — o Grande Carro mantém sua forma.',
  },
  'caption.daytime': {
    ko: '낮에는 햇빛에 가려 보이지 않을 뿐, 별은 같은 빠르기로 계속 돈다. 지평선 아래로 졌다가 다시 뜨는 별도 있다.',
    en: 'By day sunlight hides them, but the stars keep turning at the same rate. Some dip below the horizon and rise again.',
    ja: '昼は日の光に隠れて見えないだけで、星は同じ速さで回り続ける。地平線の下に沈んで再び昇る星もある。',
    zh: '白天星星被阳光掩盖，但它们仍以同样的速度继续转动。有些星会沉到地平线以下，再重新升起。',
    ar: 'في النهار يحجبها ضوء الشمس، لكن النجوم تواصل الدوران بالمعدل نفسه. بعضها يغيب تحت الأفق ثم يشرق من جديد.',
    es: 'De día la luz del Sol las oculta, pero las estrellas siguen girando al mismo ritmo. Algunas se hunden bajo el horizonte y vuelven a salir.',
    fr: 'Le jour, la lumière du Soleil les cache, mais les étoiles continuent de tourner au même rythme. Certaines passent sous l’horizon puis se lèvent à nouveau.',
    hi: 'दिन में सूर्य का प्रकाश उन्हें छिपा लेता है, पर तारे उसी दर से घूमते रहते हैं। कुछ तारे क्षितिज के नीचे डूबकर फिर उदित होते हैं।',
    id: 'Pada siang hari cahaya Matahari menyembunyikannya, tetapi bintang-bintang terus berputar dengan laju yang sama. Sebagian terbenam di bawah cakrawala lalu terbit lagi.',
    pt: 'De dia a luz do Sol as esconde, mas as estrelas continuam girando no mesmo ritmo. Algumas descem abaixo do horizonte e voltam a nascer.',
  },
  'caption.full': {
    ko: '하루가 지나 모든 별이 한 바퀴를 돌아 제자리에 왔다 — 하늘 전체가 한 덩어리로 돈다. 지구가 반대쪽으로 한 바퀴 돈 만큼이다.',
    en: 'After a day every star has made one full turn back to its place — the whole sky turns as one piece, mirroring one turn of Earth the other way.',
    ja: '1日たって、どの星も1回転して元の位置に戻った — 空全体がひとかたまりで回っている。地球が反対向きに1回転したぶんだ。',
    zh: '一天过后，每颗星都转了一整圈回到原位 — 整个天空作为一个整体转动，对应地球朝相反方向转了一圈。',
    ar: 'بعد يوم أتمّ كل نجم دورة كاملة وعاد إلى مكانه — السماء كلها تدور كقطعة واحدة، انعكاسًا لدورة واحدة للأرض في الاتجاه المعاكس.',
    es: 'Tras un día, cada estrella ha dado una vuelta completa y ha vuelto a su lugar — todo el cielo gira como una sola pieza, reflejo de una vuelta de la Tierra en sentido contrario.',
    fr: 'Au bout d’un jour, chaque étoile a fait un tour complet et est revenue à sa place — le ciel entier tourne d’un seul bloc, reflet d’un tour de la Terre dans l’autre sens.',
    hi: 'एक दिन बाद हर तारा एक पूरा चक्कर लगाकर अपनी जगह लौट आया है — पूरा आकाश एक इकाई की तरह घूमता है, जो विपरीत दिशा में पृथ्वी के एक चक्कर का प्रतिबिंब है।',
    id: 'Setelah sehari setiap bintang telah berputar satu putaran penuh kembali ke tempatnya — seluruh langit berputar sebagai satu kesatuan, cerminan satu putaran Bumi ke arah sebaliknya.',
    pt: 'Depois de um dia, cada estrela deu uma volta completa e voltou ao seu lugar — o céu inteiro gira como uma só peça, reflexo de uma volta da Terra no sentido oposto.',
  },
} satisfies Record<string, LocalizedText>);

export type DiurnalMotionMessageKey = keyof typeof diurnalMotionMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: DiurnalMotionMessageKey): LocalizedText => diurnalMotionMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: DiurnalMotionMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const diurnalMotionSchema: BundleSchema = {
  id: DIURNAL_MOTION_ID,
  label: text('label.title'),
  category: 'astro',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 하늘이 돌고 있고, 하루를 다 감으면 할 말이 끝난다.
  parameters: [],

  stages: [
    {
      id: 'northern-sky',
      label: text('label.stage'),
      constants: {
        latitude: LATITUDE_DEG,
        degPerHour: DEG_PER_HOUR,
        dayHours: DAY_HOURS,
        startSiderealHours: START_SIDEREAL_HOURS,
        starSeed: STAR_SEED,
        starCount: STAR_COUNT,
        starMaxPolarDeg: STAR_MAX_POLAR_DEG,
      },
    },
  ],
  environments: [],
  views: [{ id: 'ground', label: text('label.view'), default: true }],

  /** 하늘 창(각 86°)과 캡션 두 줄. */
  canvas: { height: 440, minHeight: 400 },

  /**
   * 겹침이 판정 장치다 — 땅이 별과 궤적 **위**에 와서 지평선 아래로 진 부분을 가려야 한다.
   * 층 순서로는 `region`(땅)이 `particleSystem`(별) 아래로 갈 수 있다.
   */
  drawOrder: 'scene',

  /**
   * 빨리 감는 세 토막(저녁→자정 6 시간 · 자정→새벽 6 시간 · 새벽→낮→저녁 12 시간)은 시간 길이에
   * 비례하는 길이라 하늘이 고르게 돈다. 흐른 시간은 세 토막의 진행도에서 읽는다(physics `elapsedHours`).
   * 한 바퀴를 다 돌면 `full` 에서 멈춰 보이고 `reset` 에서 궤적을 지운다 — 별 자리는 하루 뒤 제자리라
   * 주기가 이어진다.
   */
  timeline: {
    phases: [
      { id: 'dusk', duration: 4, ease: 'linear', caption: key('caption.dusk') },
      { id: 'midnight', duration: 4, ease: 'linear', caption: key('caption.midnight') },
      { id: 'daytime', duration: 8, ease: 'linear', caption: key('caption.daytime') },
      { id: 'full', duration: 4, ease: 'linear', caption: key('caption.full') },
      { id: 'reset', duration: 1, ease: 'smooth', caption: key('caption.full') },
    ],
  },

  /** 도착한 순간 이미 감기고 있다 — 궤적이 짧게 그어진 자리. */
  startAt: START_AT,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 일주 운동의 정의는 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-left', offset: [16, -8] },
    align: 'left',
    fontSize: 14,
    fade: 0.3,
    style: { colorRole: 'ink', emphasis: 'medium' },
    wrapWidth: 780,
  },

  // 그리드 · 카메라 단추 없음 — 잴 것이 거리가 아니라 「같은 각만큼 도는가」 다.

  messages: diurnalMotionMessages,
};
