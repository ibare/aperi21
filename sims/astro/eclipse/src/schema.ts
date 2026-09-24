// ========================================================================
// eclipse — 선언
// ========================================================================
// 질문: 삭과 보름은 매달 오는데 왜 일식 · 월식은 매달 일어나지 않는가.
//
// 지구와 달은 늘 햇빛 반대쪽으로 그림자 원뿔을 드리운다. 그 원뿔이 다른 천체에 닿는 것은
// 해 · 지구 · 달이 한 줄에 설 때뿐이다 — 달이 지구 그림자에 들면 월식(보름), 달 그림자 끝이
// 지구에 닿으면 일식(삭). 달 궤도가 약 5° 기울어 있어 매달 삭 · 보름이 와도 대부분은 그림자가
// 위아래로 비껴간다.
//
// 해를 왼쪽에 둔 채 옆에서 본 단면이다. 지구가 해를 도는 동안 해를 늘 왼쪽에 두므로, 우주에
// 고정된 달 궤도의 교점선이 이 그림 안에서는 한 해에 한 바퀴 돈다 — 궤도가 납작한 타원(교점이
// 해 쪽 · 반대쪽 = 식 계절)으로 보였다가 기운 선분(교점이 옆 = 비껴가는 달)으로 보인다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// 월드 단위는 캔버스 px 에 가까운 임의 단위, y 는 위(황도면의 수직).
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:eclipse` 와 문자 그대로 일치한다 (C4). */
export const ECLIPSE_ID = 'eclipse';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 크기 · 거리는 보이게 과장했다. 실제 비율(지구 반지름의 60 배 거리)로는 달이 점이 된다.
// ------------------------------------------------------------------------

/** 달 궤도가 황도면에 기운 각(도) — 실제 값. 화면 문구에 그대로 뜬다. */
export const INCLINATION_DEG = 5.14;
/**
 * 기울기 과장 배율 — 그림 속 궤도는 실제 기울기의 이 배만큼 기운다. 거리를 줄인 만큼 기울기를
 * 키우지 않으면 비껴가는 거리가 지구 크기보다 작아져 「비껴간다」 가 서지 않는다.
 */
export const INCLINATION_SCALE = 3.4;
/** 지구 반지름(월드). */
export const EARTH_RADIUS = 36;
/** 달 반지름(월드) — 실제 비(1 : 3.67)보다 조금 크게. */
export const MOON_RADIUS = 13;
/** 지구 · 달 거리(월드) — 실제는 지구 반지름의 약 60 배. */
export const MOON_DISTANCE = 195;
/**
 * 해의 겉보기 반지름(도) — 그림자 원뿔이 좁아지는 반각이다. 실제 0.27°. 달 본그림자 끝이
 * 지구에 겨우 닿는 실제 관계(본그림자 길이 ≈ 지구 · 달 거리)를 과장한 거리에서 지키도록 골랐다.
 */
export const SUN_ANGULAR_RADIUS_DEG = 4.03;
// 사이 단계마다 지나는 반달(삭 → 보름, 보름 → 삭) 수. 삭 · 보름 단계는 반달 하나씩이다. 합이 한 해
// 반달 수와 같아야 주기 끝에서 달의 자리와 교점 각이 처음과 같아진다.
/** `driftA` 단계의 반달 수 — 두 달. */
export const DRIFT_A_HALF_MONTHS = 4;
/** `driftB` 단계의 반달 수 — 두 달. */
export const DRIFT_B_HALF_MONTHS = 4;
/** `driftC` 단계의 반달 수 — 나머지 다섯 달. */
export const DRIFT_C_HALF_MONTHS = 10;
/** 한 해의 반달 수 = 12 삭망월 — 교점선이 해 쪽에서 한 바퀴 도는 주기. */
export const HALF_MONTHS_PER_YEAR = 24;

// ------------------------------------------------------------------------
// 배치 — 월드 단위(가로 740 판), y 위
// ------------------------------------------------------------------------

/**
 * 해 — 왼쪽 끝에 일부만 보인다. 크기는 배치값이다(원뿔의 반각은 위 상수가 정한다). 해를 다 그리면
 * 가로가 모자라 지구 · 달이 작아진다.
 */
export const SUN = { x: -24, r: 64 } as const;
/** 지구 가운데 가로 자리. 황도면은 y = 0. */
export const EARTH_X = 500;
/** 햇빛 획의 가로 구간 · 세로 자리. 가운데는 공전면 이름표 자리로 비운다. */
export const RAYS = { x0: 118, x1: 272, ys: [-44, -26, 26, 44] } as const;
/** 공전면 이름표 자리 — 해 옆, 선 바로 아래. */
export const ECLIPTIC_LABEL = { x: 118, y: -11 } as const;
/** 삭 · 보름 이름표의 세로 자리. */
export const SYZYGY_LABEL_Y = -90;
/** 과장 안내 문구 자리(오른쪽 위). */
export const NOTE_ANCHOR = { x: 736, y: 112 } as const;

/**
 * 고정 경계. 판 전체 + 아래 캡션 두 줄 자리. 지구 그림자는 보름 자리 너머 오른쪽 끝 밖으로 이어진다. 캡션 슬롯이 그림을 덮지 않게 세로를 아래로
 * 늘렸다 (이웃 조각과 같은 까닭, 장부 G24).
 */
export const SCENE_BOUNDS = { minX: 0, maxX: 740, minY: -156, maxY: 120 } as const;

// ------------------------------------------------------------------------
// 시간표 — 한 주기 = 12 삭망월(한 해). 단계마다 반달(half-month)을 몇 개 지나는지는 physics 가 안다.
// ------------------------------------------------------------------------

/** 삭 · 보름 하나를 천천히 보이는 단계(초) — 반달 하나. */
export const SYZYGY_PHASE = 4;
/** 몇 달을 건너뛰는 단계(초). */
export const DRIFT_SHORT = 3.5;
export const DRIFT_LONG = 6;
/** 도착한 순간 — 달이 삭 자리로 다가가는 중. */
export const START_AT = 1;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const eclipseMessages = Object.freeze({
  'label.title': {
    ko: '일식과 월식',
    en: 'Solar and lunar eclipses',
    ja: '日食と月食',
    zh: '日食和月食',
    ar: 'الكسوف والخسوف',
    es: 'Eclipses solares y lunares',
    fr: 'Éclipses de Soleil et de Lune',
    hi: 'सूर्य ग्रहण और चंद्र ग्रहण',
    id: 'Gerhana Matahari dan gerhana Bulan',
    pt: 'Eclipses solares e lunares',
  },
  'label.operation': {
    ko: '해와 지구와 달이 한 줄에 설 때',
    en: 'When the Sun, Earth and Moon line up',
    ja: '太陽と地球と月が一直線に並ぶとき',
    zh: '当太阳、地球和月球排成一条直线时',
    ar: 'عندما تصطف الشمس والأرض والقمر',
    es: 'Cuando el Sol, la Tierra y la Luna se alinean',
    fr: 'Quand le Soleil, la Terre et la Lune s’alignent',
    hi: 'जब सूर्य, पृथ्वी और चंद्रमा एक सीध में आते हैं',
    id: 'Ketika Matahari, Bumi, dan Bulan segaris',
    pt: 'Quando o Sol, a Terra e a Lua se alinham',
  },
  'label.stage': {
    ko: '해 · 지구 · 달',
    en: 'Sun, Earth and Moon',
    ja: '太陽・地球・月',
    zh: '太阳、地球与月球',
    ar: 'الشمس والأرض والقمر',
    es: 'El Sol, la Tierra y la Luna',
    fr: 'Le Soleil, la Terre et la Lune',
    hi: 'सूर्य, पृथ्वी और चंद्रमा',
    id: 'Matahari, Bumi, dan Bulan',
    pt: 'O Sol, a Terra e a Lua',
  },
  'label.view': {
    ko: '옆에서 본 단면',
    en: 'Side-on section',
    ja: '横から見た断面',
    zh: '侧视截面',
    ar: 'مقطع جانبي',
    es: 'Corte visto de lado',
    fr: 'Coupe vue de côté',
    hi: 'बगल से देखा गया काट',
    id: 'Penampang dilihat dari samping',
    pt: 'Corte visto de lado',
  },
  'label.sun': {
    ko: '해',
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
  'label.earth': {
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
  'label.moon': {
    ko: '달',
    en: 'Moon',
    ja: '月',
    zh: '月球',
    ar: 'القمر',
    es: 'Luna',
    fr: 'Lune',
    hi: 'चंद्रमा',
    id: 'Bulan',
    pt: 'Lua',
  },
  'label.sunlight': {
    ko: '햇빛',
    en: 'sunlight',
    ja: '日光',
    zh: '阳光',
    ar: 'ضوء الشمس',
    es: 'luz solar',
    fr: 'lumière du Soleil',
    hi: 'सूर्य का प्रकाश',
    id: 'cahaya Matahari',
    pt: 'luz solar',
  },
  'label.ecliptic': {
    ko: '지구 공전면',
    en: 'Earth’s orbital plane',
    ja: '地球の公転面',
    zh: '地球公转轨道面',
    ar: 'مستوى مدار الأرض',
    es: 'plano orbital de la Tierra',
    fr: 'plan orbital de la Terre',
    hi: 'पृथ्वी का कक्षीय तल',
    id: 'bidang orbit Bumi',
    pt: 'plano orbital da Terra',
  },
  'label.newMoon': {
    ko: '삭',
    en: 'new moon',
    ja: '新月',
    zh: '新月',
    ar: 'القمر الجديد',
    es: 'luna nueva',
    fr: 'nouvelle lune',
    hi: 'अमावस्या',
    id: 'bulan baru',
    pt: 'lua nova',
  },
  'label.fullMoon': {
    ko: '보름',
    en: 'full moon',
    ja: '満月',
    zh: '满月',
    ar: 'البدر',
    es: 'luna llena',
    fr: 'pleine lune',
    hi: 'पूर्णिमा',
    id: 'bulan purnama',
    pt: 'lua cheia',
  },
  'label.solarEclipse': {
    ko: '일식',
    en: 'solar eclipse',
    ja: '日食',
    zh: '日食',
    ar: 'كسوف الشمس',
    es: 'eclipse solar',
    fr: 'éclipse de Soleil',
    hi: 'सूर्य ग्रहण',
    id: 'gerhana Matahari',
    pt: 'eclipse solar',
  },
  'label.lunarEclipse': {
    ko: '월식',
    en: 'lunar eclipse',
    ja: '月食',
    zh: '月食',
    ar: 'خسوف القمر',
    es: 'eclipse lunar',
    fr: 'éclipse de Lune',
    hi: 'चंद्र ग्रहण',
    id: 'gerhana Bulan',
    pt: 'eclipse lunar',
  },
  'label.note': {
    ko: '크기 · 거리를 과장했다. 달 궤도의 실제 기울기 {tilt}° 를 {scale}배로 그렸다',
    en: 'Sizes and distances exaggerated. The Moon’s real orbital tilt of {tilt}° is drawn {scale}× larger',
    ja: '大きさと距離は誇張している。月の軌道の実際の傾き {tilt}° を {scale}× に拡大して描いた',
    zh: '大小和距离经过夸大。月球轨道的实际倾角 {tilt}° 放大 {scale}× 绘制',
    ar: 'الأحجام والمسافات مبالغ فيها. الميل الحقيقي لمدار القمر {tilt}° مرسوم مكبّرًا {scale}×',
    es: 'Tamaños y distancias exagerados. La inclinación real de la órbita lunar, {tilt}°, está dibujada {scale}× mayor',
    fr: 'Tailles et distances exagérées. L’inclinaison réelle de l’orbite lunaire, {tilt}°, est dessinée {scale}× plus grande',
    hi: 'आकार और दूरियाँ बढ़ा-चढ़ाकर दिखाई गई हैं। चंद्रमा की कक्षा का वास्तविक झुकाव {tilt}° यहाँ {scale}× बड़ा बनाया गया है',
    id: 'Ukuran dan jarak dilebih-lebihkan. Kemiringan orbit Bulan yang sebenarnya, {tilt}°, digambar {scale}× lebih besar',
    pt: 'Tamanhos e distâncias exagerados. A inclinação real da órbita lunar, {tilt}°, está desenhada {scale}× maior',
  },
  'caption.solarA': {
    ko: '삭 — 해 · 달 · 지구가 한 줄에 섰다. 달이 드리운 그림자 끝이 지구에 닿는다. 그 자리에서는 해가 가려진다 — 일식.',
    en: 'New moon — Sun, Moon and Earth stand in one line. The tip of the Moon’s shadow reaches Earth, and there the Sun is hidden: a solar eclipse.',
    ja: '新月 — 太陽・月・地球が一直線に並んだ。月の影の先端が地球に届き、そこでは太陽が隠される。日食だ。',
    zh: '新月 — 太阳、月球和地球排成一条直线。月球影子的尖端落到地球上，那里的太阳被遮住：日食。',
    ar: 'القمر الجديد — تصطف الشمس والقمر والأرض على خط واحد. يبلغ طرف ظل القمر الأرض، وهناك تُحجب الشمس: كسوف الشمس.',
    es: 'Luna nueva — el Sol, la Luna y la Tierra quedan en línea. La punta de la sombra de la Luna llega a la Tierra, y allí el Sol queda oculto: un eclipse solar.',
    fr: 'Nouvelle lune — le Soleil, la Lune et la Terre sont alignés. La pointe de l’ombre de la Lune atteint la Terre, et là le Soleil est caché : une éclipse de Soleil.',
    hi: 'अमावस्या — सूर्य, चंद्रमा और पृथ्वी एक सीध में हैं। चंद्रमा की छाया का सिरा पृथ्वी तक पहुँचता है, और वहाँ सूर्य छिप जाता है: सूर्य ग्रहण।',
    id: 'Bulan baru — Matahari, Bulan, dan Bumi berada dalam satu garis. Ujung bayangan Bulan mencapai Bumi, dan di sana Matahari tertutup: gerhana Matahari.',
    pt: 'Lua nova — Sol, Lua e Terra ficam em linha. A ponta da sombra da Lua atinge a Terra, e ali o Sol fica encoberto: um eclipse solar.',
  },
  'caption.lunarA': {
    ko: '보름 — 이번엔 지구가 가운데다. 달이 지구가 드리운 그림자 속으로 들어가 어두워진다 — 월식.',
    en: 'Full moon — now Earth is in the middle. The Moon passes into the shadow Earth casts and goes dark: a lunar eclipse.',
    ja: '満月 — 今度は地球が真ん中だ。月が地球の落とす影の中に入り、暗くなる。月食だ。',
    zh: '满月 — 这次地球在中间。月球进入地球投下的影子而变暗：月食。',
    ar: 'البدر — الأرض الآن في الوسط. يدخل القمر في الظل الذي تلقيه الأرض فيُظلم: خسوف القمر.',
    es: 'Luna llena — ahora la Tierra está en medio. La Luna entra en la sombra que proyecta la Tierra y se oscurece: un eclipse lunar.',
    fr: 'Pleine lune — cette fois la Terre est au milieu. La Lune entre dans l’ombre projetée par la Terre et s’assombrit : une éclipse de Lune.',
    hi: 'पूर्णिमा — अब पृथ्वी बीच में है। चंद्रमा पृथ्वी की डाली छाया में प्रवेश करता है और अँधेरा हो जाता है: चंद्र ग्रहण।',
    id: 'Bulan purnama — kini Bumi berada di tengah. Bulan masuk ke bayangan yang dijatuhkan Bumi dan menjadi gelap: gerhana Bulan.',
    pt: 'Lua cheia — agora a Terra está no meio. A Lua entra na sombra projetada pela Terra e escurece: um eclipse lunar.',
  },
  'caption.driftA': {
    ko: '몇 달이 지난다. 그 사이 지구가 해를 돌아, 기울어진 달 궤도를 햇빛이 비추는 방향이 바뀐다.',
    en: 'Months pass. Earth moves around the Sun, so sunlight now meets the tilted lunar orbit from a different side.',
    ja: '数か月が過ぎる。地球が太陽のまわりを進み、傾いた月の軌道に日光が当たる向きが変わる。',
    zh: '几个月过去了。地球绕太阳运行，阳光照射倾斜月球轨道的方向随之改变。',
    ar: 'تمرّ الشهور. تتحرك الأرض حول الشمس، فيلاقي ضوء الشمس الآن مدار القمر المائل من جهة مختلفة.',
    es: 'Pasan los meses. La Tierra avanza alrededor del Sol, así que la luz solar llega ahora a la órbita lunar inclinada desde otro lado.',
    fr: 'Les mois passent. La Terre avance autour du Soleil, si bien que la lumière du Soleil frappe désormais l’orbite lunaire inclinée par un autre côté.',
    hi: 'महीने बीतते हैं। पृथ्वी सूर्य के चारों ओर आगे बढ़ती है, इसलिए अब सूर्य का प्रकाश झुकी हुई चंद्र कक्षा पर दूसरी ओर से पड़ता है।',
    id: 'Bulan demi bulan berlalu. Bumi bergerak mengelilingi Matahari, sehingga cahaya Matahari kini mengenai orbit Bulan yang miring dari sisi lain.',
    pt: 'Os meses passam. A Terra avança ao redor do Sol, e a luz solar agora atinge a órbita lunar inclinada por outro lado.',
  },
  'caption.solarMiss': {
    ko: '삭은 또 온다. 그러나 달이 한 줄보다 아래로 지나가, 달 그림자가 지구 아래로 비껴간다 — 일식이 없다.',
    en: 'New moon comes again, but the Moon passes below the line, and its shadow slips past beneath Earth — no eclipse.',
    ja: '新月はまた来る。しかし月は一直線より下を通り、月の影は地球の下へそれていく — 日食は起きない。',
    zh: '新月再次到来，但月球从直线下方经过，它的影子从地球下方擦过 — 没有日食。',
    ar: 'يأتي القمر الجديد مرة أخرى، لكن القمر يمر تحت الخط، فينزلق ظله أسفل الأرض — لا كسوف.',
    es: 'Llega otra luna nueva, pero la Luna pasa por debajo de la línea y su sombra se desliza bajo la Tierra — no hay eclipse.',
    fr: 'La nouvelle lune revient, mais la Lune passe sous la ligne et son ombre glisse sous la Terre — pas d’éclipse.',
    hi: 'अमावस्या फिर आती है, पर चंद्रमा सीध से नीचे होकर गुज़रता है और उसकी छाया पृथ्वी के नीचे से निकल जाती है — कोई ग्रहण नहीं।',
    id: 'Bulan baru datang lagi, tetapi Bulan lewat di bawah garis, dan bayangannya meleset di bawah Bumi — tidak ada gerhana.',
    pt: 'A lua nova volta, mas a Lua passa abaixo da linha, e sua sombra escapa por baixo da Terra — nenhum eclipse.',
  },
  'caption.lunarMiss': {
    ko: '보름에도 달이 지구 그림자 위로 지나간다. 그림자는 늘 드리워져 있지만, 닿으려면 셋이 한 줄에 서야 한다.',
    en: 'At full moon the Moon rides above Earth’s shadow. The shadows are always there, but they only land when all three line up.',
    ja: '満月でも月は地球の影の上を通る。影はいつも落ちているが、それが届くのは三つが一直線に並ぶときだけだ。',
    zh: '满月时月球从地球影子的上方经过。影子一直都在，但只有三者排成一线时才会落到对方身上。',
    ar: 'في البدر يمر القمر فوق ظل الأرض. الظلال موجودة دائمًا، لكنها لا تقع على الجرم الآخر إلا حين تصطف الثلاثة.',
    es: 'En luna llena la Luna pasa por encima de la sombra de la Tierra. Las sombras siempre están ahí, pero solo alcanzan su blanco cuando los tres se alinean.',
    fr: 'À la pleine lune, la Lune passe au-dessus de l’ombre de la Terre. Les ombres sont toujours là, mais elles ne tombent sur l’autre astre que lorsque les trois s’alignent.',
    hi: 'पूर्णिमा पर चंद्रमा पृथ्वी की छाया के ऊपर से गुज़रता है। छायाएँ हमेशा रहती हैं, पर वे तभी पड़ती हैं जब तीनों एक सीध में हों।',
    id: 'Saat purnama, Bulan lewat di atas bayangan Bumi. Bayangan selalu ada, tetapi baru jatuh mengenai sasaran ketika ketiganya segaris.',
    pt: 'Na lua cheia, a Lua passa acima da sombra da Terra. As sombras estão sempre lá, mas só atingem o alvo quando os três se alinham.',
  },
  'caption.driftB': {
    ko: '다시 몇 달 — 달 궤도가 햇빛 쪽에서 보아 다시 납작해진다.',
    en: 'A few more months — seen along the sunlight, the lunar orbit flattens out again.',
    ja: 'さらに数か月 — 日光の向きから見ると、月の軌道は再び平たくなる。',
    zh: '又过了几个月 — 沿阳光方向看，月球轨道再次变得扁平。',
    ar: 'بضعة أشهر أخرى — إذا نُظر على امتداد ضوء الشمس، يعود مدار القمر مسطحًا من جديد.',
    es: 'Unos meses más — vista a lo largo de la luz solar, la órbita lunar vuelve a aplanarse.',
    fr: 'Quelques mois de plus — vue dans l’axe de la lumière du Soleil, l’orbite lunaire s’aplatit à nouveau.',
    hi: 'कुछ और महीने — सूर्य के प्रकाश की दिशा से देखने पर चंद्र कक्षा फिर चपटी दिखती है।',
    id: 'Beberapa bulan lagi — dilihat searah cahaya Matahari, orbit Bulan kembali tampak pipih.',
    pt: 'Mais alguns meses — vista ao longo da luz solar, a órbita lunar volta a se achatar.',
  },
  'caption.solarB': {
    ko: '반년 만에 다시 한 줄. 삭에 달 그림자가 지구에 닿는다 — 일식.',
    en: 'Half a year on, the line forms again. At new moon the Moon’s shadow lands on Earth: a solar eclipse.',
    ja: '半年後、再び一直線に並ぶ。新月に月の影が地球に届く。日食だ。',
    zh: '半年之后，三者再次排成一线。新月时月球的影子落到地球上：日食。',
    ar: 'بعد نصف عام يتشكل الخط من جديد. في القمر الجديد يقع ظل القمر على الأرض: كسوف الشمس.',
    es: 'Medio año después, la línea vuelve a formarse. En luna nueva la sombra de la Luna cae sobre la Tierra: un eclipse solar.',
    fr: 'Six mois plus tard, l’alignement se reforme. À la nouvelle lune, l’ombre de la Lune tombe sur la Terre : une éclipse de Soleil.',
    hi: 'आधे वर्ष बाद फिर से सीध बनती है। अमावस्या पर चंद्रमा की छाया पृथ्वी पर पड़ती है: सूर्य ग्रहण।',
    id: 'Setengah tahun kemudian, garis itu terbentuk lagi. Saat bulan baru, bayangan Bulan jatuh di Bumi: gerhana Matahari.',
    pt: 'Meio ano depois, a linha se forma de novo. Na lua nova, a sombra da Lua cai sobre a Terra: um eclipse solar.',
  },
  'caption.lunarB': {
    ko: '이어진 보름에 달이 지구 그림자에 든다 — 월식. 식은 한 해에 두 번, 한 줄에 서는 철에 몰려 온다.',
    en: 'At the next full moon the Moon enters Earth’s shadow: a lunar eclipse. Eclipses come in two seasons a year, when the line can form.',
    ja: '続く満月に月が地球の影に入る。月食だ。食は1年に2回、一直線に並べる時期にまとまって起こる。',
    zh: '接下来的满月，月球进入地球的影子：月食。食每年集中在两个时段，也就是三者能排成一线的时候。',
    ar: 'في البدر التالي يدخل القمر ظل الأرض: خسوف القمر. تأتي الكسوفات والخسوفات في موسمين كل عام، حين يمكن أن يتشكل الخط.',
    es: 'En la siguiente luna llena la Luna entra en la sombra de la Tierra: un eclipse lunar. Los eclipses llegan en dos temporadas al año, cuando la línea puede formarse.',
    fr: 'À la pleine lune suivante, la Lune entre dans l’ombre de la Terre : une éclipse de Lune. Les éclipses viennent en deux saisons par an, quand l’alignement peut se former.',
    hi: 'अगली पूर्णिमा पर चंद्रमा पृथ्वी की छाया में प्रवेश करता है: चंद्र ग्रहण। ग्रहण साल में दो मौसमों में आते हैं, जब सीध बन सकती है।',
    id: 'Pada purnama berikutnya Bulan masuk ke bayangan Bumi: gerhana Bulan. Gerhana datang dalam dua musim setiap tahun, saat garis itu bisa terbentuk.',
    pt: 'Na lua cheia seguinte, a Lua entra na sombra da Terra: um eclipse lunar. Os eclipses vêm em duas temporadas por ano, quando a linha pode se formar.',
  },
  'caption.driftC': {
    ko: '나머지 달들에는 삭 · 보름마다 그림자가 위아래로 비껴간다.',
    en: 'Through the other months, the shadows slip above or below at every new and full moon.',
    ja: '残りの月々は、新月・満月のたびに影が上か下へそれていく。',
    zh: '在其余的月份里，每逢新月和满月，影子都会从上方或下方擦过。',
    ar: 'في بقية الشهور تنزلق الظلال فوقًا أو تحتًا عند كل قمر جديد وبدر.',
    es: 'Durante los demás meses, las sombras pasan por encima o por debajo en cada luna nueva y cada luna llena.',
    fr: 'Les autres mois, les ombres passent au-dessus ou au-dessous à chaque nouvelle et pleine lune.',
    hi: 'बाकी महीनों में हर अमावस्या और पूर्णिमा पर छायाएँ ऊपर या नीचे से निकल जाती हैं।',
    id: 'Pada bulan-bulan lainnya, bayangan meleset ke atas atau ke bawah setiap bulan baru dan purnama.',
    pt: 'Nos demais meses, as sombras passam por cima ou por baixo a cada lua nova e lua cheia.',
  },
} satisfies Record<string, LocalizedText>);

export type EclipseMessageKey = keyof typeof eclipseMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: EclipseMessageKey): LocalizedText => eclipseMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: EclipseMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const eclipseSchema: BundleSchema = {
  id: ECLIPSE_ID,
  label: text('label.title'),
  category: 'astro',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 식 계절 · 비껴가는 달 · 다음 식 계절을 자동으로 차례로 보여 견주기까지 마친다.
  parameters: [],

  stages: [
    {
      id: 'sun-earth-moon',
      label: text('label.stage'),
      constants: {
        inclination: INCLINATION_DEG,
        inclinationScale: INCLINATION_SCALE,
        earthRadius: EARTH_RADIUS,
        moonRadius: MOON_RADIUS,
        moonDistance: MOON_DISTANCE,
        sunAngularRadius: SUN_ANGULAR_RADIUS_DEG,
        driftAHalfMonths: DRIFT_A_HALF_MONTHS,
        driftBHalfMonths: DRIFT_B_HALF_MONTHS,
        driftCHalfMonths: DRIFT_C_HALF_MONTHS,
        halfMonthsPerYear: HALF_MONTHS_PER_YEAR,
      },
    },
  ],
  environments: [],
  views: [{ id: 'side', label: text('label.view'), default: true }],

  /** 판 740 × 200 + 캡션 두 줄. */
  canvas: { height: 360, minHeight: 320 },

  /**
   * 겹침이 판정 장치다 — 달이 지구 뒤로 가면 지구가 달과 그 그림자를 가리고, 앞으로 오면 달이
   * 지구를 가린다. 가려진 자리(식)는 천체 위에 덮여야 한다. 층 순서로는 둘 다 고를 수 없다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 12 삭망월. 삭 · 보름 단계는 반달 하나를 천천히 지나고(가운데가 삭 · 보름), 사이 단계는
   * 몇 달을 빠르게 건넌다. 달의 자리 · 교점 각을 단계 진행도의 합에서 읽으므로(physics `halfMonths`)
   * 캡션이 달의 자리와 어긋날 수 없다.
   */
  timeline: {
    phases: [
      { id: 'solarA', duration: SYZYGY_PHASE, ease: 'linear', caption: key('caption.solarA') },
      { id: 'lunarA', duration: SYZYGY_PHASE, ease: 'linear', caption: key('caption.lunarA') },
      { id: 'driftA', duration: DRIFT_SHORT, ease: 'linear', caption: key('caption.driftA') },
      { id: 'solarMiss', duration: SYZYGY_PHASE, ease: 'linear', caption: key('caption.solarMiss') },
      { id: 'lunarMiss', duration: SYZYGY_PHASE, ease: 'linear', caption: key('caption.lunarMiss') },
      { id: 'driftB', duration: DRIFT_SHORT, ease: 'linear', caption: key('caption.driftB') },
      { id: 'solarB', duration: SYZYGY_PHASE, ease: 'linear', caption: key('caption.solarB') },
      { id: 'lunarB', duration: SYZYGY_PHASE, ease: 'linear', caption: key('caption.lunarB') },
      { id: 'driftC', duration: DRIFT_LONG, ease: 'linear', caption: key('caption.driftC') },
    ],
  },

  /** 도착한 순간 이미 돌고 있다 — 달이 삭 자리로 다가가는 중. */
  startAt: START_AT,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 식의 정의는 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-left', offset: [16, -8] },
    align: 'left',
    fontSize: 14,
    fade: 0.3,
    style: { colorRole: 'ink', emphasis: 'medium' },
    wrapWidth: 800,
  },

  // 그리드 · 카메라 단추 없음 — 잴 것이 거리가 아니라 「한 줄에 섰나」 다.

  messages: eclipseMessages,
};
