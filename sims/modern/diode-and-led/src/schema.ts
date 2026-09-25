// ========================================================================
// diode-and-led — 선언
// ========================================================================
// 질문: 다이오드는 왜 한 방향으로만 전류를 흘리고, LED 는 왜 흐를 때 빛나며 그 색은
// 무엇이 정하는가?
//
// 답: 역방향으로 전압을 걸면 전류가 거의 흐르지 않는다. 순방향으로 걸어도 문턱 전압까지는
// 거의 흐르지 않다가, 문턱을 넘으면 전류가 치솟는다. 흐르는 동안 전자는 전도띠에서
// 원자가띠의 양공으로 떨어진다. 실리콘에서는 그 에너지가 열로 흩어지지만, LED 재료에서는
// 떨어진 만큼(띠 간격)의 빛 알갱이 하나가 나온다. 띠 간격이 큰 재료일수록 문턱이 높고
// 빛은 짧은 파장 — 푸른 쪽이다.
//
// 화면에서는 왼쪽 전류-전압 그래프 위를 점 하나가 역방향 → 순방향으로 지나며 곡선을 긋고
// (실리콘 · 빨강 LED · 파랑 LED 차례로), 오른쪽 띠 간격 판에서 흐르는 동안 전자가 떨어지고
// LED 에서는 그 자리에서 빛 물결이 나간다.
//
// 공핍층이 생기고 얇아지는 그림은 `pn-junction`, 빛이 쌍을 만드는 반대 방향은
// `photovoltaic-effect` 의 몫이라 두지 않는다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:diode-and-led` 와 문자 그대로 일치한다 (C4). */
export const DIODE_AND_LED_ID = 'diode-and-led';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 역방향으로 거는 전압의 크기(V). 화면 가로축에 `−2 V` 로 뜬다. */
export const REVERSE_VOLTAGE = 2;

/** 실리콘 다이오드 — 문턱 전압(V, 화면에 `0.7 V`) · 띠 간격(eV, 화면에 `1.1 eV`). */
export const SI_THRESHOLD = 0.7;
export const SI_GAP_EV = 1.1;
/**
 * 빨강 LED — 문턱 전압(V) · 띠 간격(eV) · 빛의 파장(nm). LED 의 문턱은 띠 간격을 전자 하나의 전하로
 * 나눈 값 무렵이고, 파장은 1240 / 띠 간격 무렵이다. 셋을 함께 바꾼다 (NOTES (c) G143).
 */
export const RED_THRESHOLD = 1.9;
export const RED_GAP_EV = 1.9;
export const RED_NM = 650;
/** 파랑 LED — 문턱 전압(V) · 띠 간격(eV) · 빛의 파장(nm). */
export const BLUE_THRESHOLD = 2.6;
export const BLUE_GAP_EV = 2.6;
export const BLUE_NM = 470;

/**
 * 전류-전압 곡선의 모양 — 문턱에서의 전류(그래프 높이에 대한 비)와 무릎 폭(V). 전류는
 * `문턱 전류 × (e^((V − 문턱)/무릎 폭) − e^(−문턱/무릎 폭))` 을 따른다. 전류 축에는 수가 없어서
 * 이 둘은 곡선이 「문턱 위에서 치솟는다」 로 읽히게 고른 **표현값**이다 (NOTES b).
 */
export const THRESHOLD_CURRENT = 0.06;
export const KNEE_WIDTH = 0.06;

/**
 * 가득 흐를 때(그래프 꼭대기) 1 초에 떨어지는 전자 수. 흐르는 전류에 비례해 줄어든다.
 * 실제 수가 아니라 눈으로 셀 수 있게 고른 표현값이다.
 */
export const DROP_RATE = 4;
/** 전자가 전도띠에 나타나 머무는 시간(초) · 원자가띠로 떨어지는 데 걸리는 시간(초). 알갱이마다 다른 시각이다 (NOTES c). */
export const DWELL_S = 0.35;
export const FALL_S = 0.3;
/** 빛 알갱이가 나는 빠르기(월드/초) · 사라지기까지(초). 눈으로 따라갈 수 있는 표현값이다. */
export const PHOTON_SPEED = 1.6;
export const PHOTON_LIFE = 1;
/**
 * 물결 간격 배율(월드/nm). 파장을 화면에 보이는 크기로 키운다 — 650 nm 가 0.36 월드.
 * 화면에 알리지 않는다: 두 빛의 간격 **비**가 주장이고 절대 길이는 뜻이 없다 (NOTES b).
 */
export const WAVE_SCALE = 0.00055;
/** 떨어지는 자리 · 받아들일지를 뽑는 시드. 같은 시드 · 같은 주기는 언제나 같은 화면이다. */
export const SEED = 7;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 그래프 원점(0 V, 0 A)이 월드 원점이다.
// ------------------------------------------------------------------------

/** 가로축 1 V 의 길이(월드) · 그래프 꼭대기(전류 비 1)의 높이(월드). */
export const VOLT_X = 1.1;
export const GRAPH_H = 3;
/** 가로축이 덮는 전압 범위(V). 역방향 끝 · 순방향 끝. */
export const AXIS_V_MIN = -2.5;
export const AXIS_V_MAX = 3.35;
/** 세로축이 원점 아래로 · 꼭대기 위로 내미는 길이(월드). */
export const AXIS_Y_BELOW = 0.25;
export const AXIS_Y_ABOVE = 0.35;

/** 띠 간격 판 — 띠 선의 왼쪽 · 오른쪽 끝(월드 x), 원자가띠 높이(월드 y), 1 eV 의 높이(월드). */
export const BAND_X0 = 4.95;
export const BAND_X1 = 6.95;
export const BAND_Y0 = 0.15;
export const EV_Y = 1.05;
/** 전자가 떨어지는 자리를 띠 선 끝에서 들여 뽑는 여백(월드). */
export const DROP_MARGIN = 0.25;
/** 띠 간격 치수선을 띠 선 왼쪽 끝에서 띄우는 거리(월드). */
export const GAP_DIM_GAP = 0.3;
/** 빛 알갱이 한 덩이의 길이 · 물결 진폭(월드). */
export const PACKET_LEN = 0.85;
export const PACKET_AMP = 0.11;

/**
 * 프레이밍 — 왼쪽 그래프(역방향 끝 ~ 순방향 끝), 오른쪽 띠 간격 판과 그 오른쪽으로 빠져나가는 빛,
 * 아래에 축 눈금 이름표와 캡션 띠. 매 프레임 같은 값이다 (S-piece). 파랑 LED 의 가장 큰 띠 간격과
 * 가장 멀리 난 빛 알갱이가 모두 들어가게 잡았다.
 */
export const SCENE_BOUNDS = { minX: -3.05, maxX: 8.45, minY: -1.3, maxY: 3.45 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const diodeAndLedMessages = Object.freeze({
  'label.title': {
    ko: '다이오드와 LED',
    en: 'Diodes and LEDs',
    ja: 'ダイオードとLED',
    zh: '二极管与LED',
    ar: 'الصمامات الثنائية ومصابيح LED',
    es: 'Diodos y LED',
    fr: 'Diodes et LED',
    hi: 'डायोड और LED',
    id: 'Dioda dan LED',
    pt: 'Diodos e LEDs',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '한 방향 전류와 빛의 방출',
    en: 'One-way current and the emission of light',
    ja: '一方向の電流と光の放出',
    zh: '单向电流与光的发射',
    ar: 'تيار في اتجاه واحد وانبعاث الضوء',
    es: 'Corriente en un solo sentido y emisión de luz',
    fr: 'Courant à sens unique et émission de lumière',
    hi: 'एकदिशीय धारा और प्रकाश का उत्सर्जन',
    id: 'Arus satu arah dan pancaran cahaya',
    pt: 'Corrente em um só sentido e emissão de luz',
  },
  'label.stage': {
    ko: '실리콘 · 빨강 · 파랑',
    en: 'Silicon, red, blue',
    ja: 'シリコン・赤・青',
    zh: '硅、红、蓝',
    ar: 'السيليكون، الأحمر، الأزرق',
    es: 'Silicio, rojo, azul',
    fr: 'Silicium, rouge, bleu',
    hi: 'सिलिकॉन, लाल, नीला',
    id: 'Silikon, merah, biru',
    pt: 'Silício, vermelho, azul',
  },
  'label.view': {
    ko: '전류-전압 곡선과 띠 간격',
    en: 'Current–voltage curve and band gap',
    ja: '電流–電圧曲線とバンドギャップ',
    zh: '电流–电压曲线与带隙',
    ar: 'منحنى التيار–الجهد وفجوة النطاق',
    es: 'Curva corriente–voltaje y banda prohibida',
    fr: 'Courbe courant–tension et bande interdite',
    hi: 'धारा–वोल्टता वक्र और बैंड अंतराल',
    id: 'Kurva arus–tegangan dan celah pita',
    pt: 'Curva corrente–tensão e banda proibida',
  },

  /** 축 이름. 표식이라 번역 대상이 아니다 (C1 판정 3). */
  'label.axisV': {
    ko: 'V',
    en: 'V',
    ja: 'V',
    zh: 'V',
    ar: 'V',
    es: 'V',
    fr: 'V',
    hi: 'V',
    id: 'V',
    pt: 'V',
  },
  'label.axisI': {
    ko: 'I',
    en: 'I',
    ja: 'I',
    zh: 'I',
    ar: 'I',
    es: 'I',
    fr: 'I',
    hi: 'I',
    id: 'I',
    pt: 'I',
  },
  /** 가로축 두 끝의 방향. */
  'label.reverse': {
    ko: '역방향',
    en: 'reverse',
    ja: '逆方向',
    zh: '反向',
    ar: 'عكسي',
    es: 'inversa',
    fr: 'inverse',
    hi: 'पश्च दिशा',
    id: 'mundur',
    pt: 'reversa',
  },
  'label.forward': {
    ko: '순방향',
    en: 'forward',
    ja: '順方向',
    zh: '正向',
    ar: 'أمامي',
    es: 'directa',
    fr: 'directe',
    hi: 'अग्र दिशा',
    id: 'maju',
    pt: 'direta',
  },
  /** 눈금 값. 값은 스테이지 상수, 단위는 표식이다. */
  'label.volts': {
    ko: '{v} V',
    en: '{v} V',
    ja: '{v} V',
    zh: '{v} V',
    ar: '{v} V',
    es: '{v} V',
    fr: '{v} V',
    hi: '{v} V',
    id: '{v} V',
    pt: '{v} V',
  },
  'label.minusVolts': {
    ko: '−{v} V',
    en: '−{v} V',
    ja: '−{v} V',
    zh: '−{v} V',
    ar: '−{v} V',
    es: '−{v} V',
    fr: '−{v} V',
    hi: '−{v} V',
    id: '−{v} V',
    pt: '−{v} V',
  },
  'label.ev': {
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
  /** 곡선 · 소자 이름. 곡선 꼭대기가 가까워 짧게 둔다 — 「LED」 는 캡션이 말한다. */
  'label.si': {
    ko: '실리콘',
    en: 'silicon',
    ja: 'シリコン',
    zh: '硅',
    ar: 'سيليكون',
    es: 'silicio',
    fr: 'silicium',
    hi: 'सिलिकॉन',
    id: 'silikon',
    pt: 'silício',
  },
  'label.red': {
    ko: '빨강',
    en: 'red',
    ja: '赤',
    zh: '红',
    ar: 'أحمر',
    es: 'rojo',
    fr: 'rouge',
    hi: 'लाल',
    id: 'merah',
    pt: 'vermelho',
  },
  'label.blue': {
    ko: '파랑',
    en: 'blue',
    ja: '青',
    zh: '蓝',
    ar: 'أزرق',
    es: 'azul',
    fr: 'bleu',
    hi: 'नीला',
    id: 'biru',
    pt: 'azul',
  },
  /** 띠 이름. */
  'label.conduction': {
    ko: '전도띠',
    en: 'conduction band',
    ja: '伝導帯',
    zh: '导带',
    ar: 'نطاق التوصيل',
    es: 'banda de conducción',
    fr: 'bande de conduction',
    hi: 'चालन बैंड',
    id: 'pita konduksi',
    pt: 'banda de condução',
  },
  'label.valence': {
    ko: '원자가띠',
    en: 'valence band',
    ja: '価電子帯',
    zh: '价带',
    ar: 'نطاق التكافؤ',
    es: 'banda de valencia',
    fr: 'bande de valence',
    hi: 'संयोजकता बैंड',
    id: 'pita valensi',
    pt: 'banda de valência',
  },

  'caption.siReverse': {
    ko: '실리콘 다이오드에 역방향으로 전압을 건다 — 전류가 거의 흐르지 않는다.',
    en: 'A silicon diode with the voltage in reverse — almost no current flows.',
    ja: 'シリコンダイオードに逆方向の電圧をかける — 電流はほとんど流れない。',
    zh: '给硅二极管加反向电压 — 几乎没有电流。',
    ar: 'صمام ثنائي من السيليكون بجهد عكسي — لا يكاد يمر تيار.',
    es: 'Un diodo de silicio con el voltaje en inversa — casi no circula corriente.',
    fr: 'Une diode au silicium polarisée en inverse — presque aucun courant ne passe.',
    hi: 'सिलिकॉन डायोड पर पश्च दिशा में वोल्टता — लगभग कोई धारा नहीं बहती।',
    id: 'Dioda silikon dengan tegangan arah mundur — hampir tidak ada arus yang mengalir.',
    pt: 'Um diodo de silício com a tensão reversa — quase nenhuma corrente passa.',
  },
  'caption.siForward': {
    ko: '방향을 돌려 순방향으로 올린다 — 문턱 전압까지는 여전히 거의 흐르지 않는다.',
    en: 'Turn it around to forward and raise it — up to the threshold, still almost nothing flows.',
    ja: '向きを変えて順方向に上げていく — しきい電圧までは、まだほとんど流れない。',
    zh: '调转为正向并升高电压 — 到达阈值之前，仍几乎没有电流。',
    ar: 'نعكسه إلى الاتجاه الأمامي ونرفعه — حتى جهد العتبة لا يكاد يمر شيء.',
    es: 'Se invierte a directa y se sube — hasta el umbral, casi no circula nada.',
    fr: 'On passe en direct et on augmente — jusqu’au seuil, presque rien ne passe encore.',
    hi: 'दिशा पलटकर अग्र दिशा में बढ़ाते हैं — देहली वोल्टता तक अब भी लगभग कुछ नहीं बहता।',
    id: 'Dibalik ke arah maju lalu dinaikkan — sampai ambang, hampir belum ada yang mengalir.',
    pt: 'Inverte-se para direta e aumenta-se — até o limiar, quase nada passa ainda.',
  },
  'caption.siRise': {
    ko: '문턱을 넘자 전류가 치솟고, 전자(●)가 띠 간격을 건너 양공(○)으로 떨어지기 시작한다.',
    en: 'Past the threshold the current shoots up, and electrons (●) begin to drop across the band gap into holes (○).',
    ja: 'しきい電圧を越えると電流が急増し、電子（●）がバンドギャップを越えて正孔（○）へ落ち始める。',
    zh: '越过阈值后电流陡增，电子（●）开始越过带隙落入空穴（○）。',
    ar: 'بعد العتبة يقفز التيار، وتبدأ الإلكترونات (●) بالسقوط عبر فجوة النطاق إلى الثقوب (○).',
    es: 'Pasado el umbral la corriente se dispara, y los electrones (●) empiezan a caer a través de la banda prohibida hacia los huecos (○).',
    fr: 'Passé le seuil, le courant s’envole, et les électrons (●) commencent à tomber à travers la bande interdite dans les trous (○).',
    hi: 'देहली पार होते ही धारा तेज़ी से बढ़ती है, और इलेक्ट्रॉन (●) बैंड अंतराल पार कर कोटरों (○) में गिरने लगते हैं।',
    id: 'Lewat ambang, arus melonjak, dan elektron (●) mulai jatuh melintasi celah pita ke lubang (○).',
    pt: 'Passado o limiar a corrente dispara, e os elétrons (●) começam a cair através da banda proibida para as lacunas (○).',
  },
  'caption.siHold': {
    ko: '실리콘에서는 떨어진 에너지가 빛이 되지 않고 열로 흩어진다.',
    en: 'In silicon the energy of the drop does not become light; it is lost as heat.',
    ja: 'シリコンでは、落ちたエネルギーは光にならず熱として失われる。',
    zh: '在硅中，下落的能量不会变成光，而是以热的形式散失。',
    ar: 'في السيليكون لا تتحول طاقة السقوط إلى ضوء، بل تضيع حرارةً.',
    es: 'En el silicio la energía de la caída no se convierte en luz; se pierde como calor.',
    fr: 'Dans le silicium, l’énergie de la chute ne devient pas lumière ; elle se perd en chaleur.',
    hi: 'सिलिकॉन में गिरने की ऊर्जा प्रकाश नहीं बनती; वह ऊष्मा के रूप में खो जाती है।',
    id: 'Pada silikon, energi jatuhnya tidak menjadi cahaya; energi itu hilang sebagai kalor.',
    pt: 'No silício a energia da queda não vira luz; ela se perde como calor.',
  },
  'caption.redReverse': {
    ko: '띠 간격이 더 큰 빨강 LED — 역방향으로는 흐르지 않고 빛도 없다.',
    en: 'A red LED, with a wider band gap — in reverse, no current and no light.',
    ja: 'バンドギャップがより大きい赤色LED — 逆方向では電流も光もない。',
    zh: '带隙更宽的红色LED — 反向时既没有电流也没有光。',
    ar: 'ثنائي LED أحمر بفجوة نطاق أوسع — في الاتجاه العكسي لا تيار ولا ضوء.',
    es: 'Un LED rojo, con una banda prohibida más ancha — en inversa, ni corriente ni luz.',
    fr: 'Une LED rouge, à bande interdite plus large — en inverse, ni courant ni lumière.',
    hi: 'अधिक चौड़े बैंड अंतराल वाला लाल LED — पश्च दिशा में न धारा, न प्रकाश।',
    id: 'LED merah, dengan celah pita lebih lebar — pada arah mundur, tak ada arus dan tak ada cahaya.',
    pt: 'Um LED vermelho, com banda proibida mais larga — na reversa, nem corrente nem luz.',
  },
  'caption.redForward': {
    ko: '순방향으로 올린다 — 문턱이 실리콘보다 높아 한참을 거의 흐르지 않는다.',
    en: 'Forward and rising — its threshold is higher than silicon’s, so for a long way almost nothing flows.',
    ja: '順方向に上げていく — しきい電圧がシリコンより高く、長いあいだほとんど流れない。',
    zh: '正向升高 — 它的阈值比硅高，所以很长一段几乎没有电流。',
    ar: 'أماميًا ومتصاعدًا — عتبته أعلى من عتبة السيليكون، فلا يكاد يمر شيء لمدة طويلة.',
    es: 'En directa y subiendo — su umbral es más alto que el del silicio, así que durante un buen tramo casi no circula nada.',
    fr: 'En direct et en montée — son seuil est plus haut que celui du silicium, donc longtemps presque rien ne passe.',
    hi: 'अग्र दिशा में बढ़ते हुए — इसकी देहली सिलिकॉन से ऊँची है, इसलिए काफ़ी दूर तक लगभग कुछ नहीं बहता।',
    id: 'Arah maju dan naik — ambangnya lebih tinggi daripada silikon, jadi cukup lama hampir tak ada yang mengalir.',
    pt: 'Em direta e subindo — seu limiar é mais alto que o do silício, então por um bom trecho quase nada passa.',
  },
  'caption.redRise': {
    ko: '문턱을 넘자 전류가 치솟는다 — 전자가 띠 간격만큼 떨어질 때마다 빨간 빛이 하나씩 나온다.',
    en: 'Past the threshold the current shoots up — each electron that drops across the gap sends out red light.',
    ja: 'しきい電圧を越えると電流が急増する — ギャップを落ちる電子ごとに赤い光が出る。',
    zh: '越过阈值后电流陡增 — 每个跨过带隙落下的电子都发出红光。',
    ar: 'بعد العتبة يقفز التيار — كل إلكترون يسقط عبر الفجوة يُطلق ضوءًا أحمر.',
    es: 'Pasado el umbral la corriente se dispara — cada electrón que cae a través de la banda prohibida emite luz roja.',
    fr: 'Passé le seuil, le courant s’envole — chaque électron qui franchit la bande interdite en tombant émet de la lumière rouge.',
    hi: 'देहली पार होते ही धारा तेज़ी से बढ़ती है — अंतराल पार कर गिरने वाला हर इलेक्ट्रॉन लाल प्रकाश छोड़ता है।',
    id: 'Lewat ambang, arus melonjak — setiap elektron yang jatuh melintasi celah memancarkan cahaya merah.',
    pt: 'Passado o limiar a corrente dispara — cada elétron que cai através da banda proibida emite luz vermelha.',
  },
  'caption.redHold': {
    ko: '흐르는 동안 떨어지는 전자마다 빨간 빛이 나간다.',
    en: 'While the current flows, every electron that drops sends out red light.',
    ja: '電流が流れるあいだ、落ちる電子ごとに赤い光が出ていく。',
    zh: '有电流流过时，每个落下的电子都发出红光。',
    ar: 'ما دام التيار يمر، يُطلق كل إلكترون يسقط ضوءًا أحمر.',
    es: 'Mientras circula la corriente, cada electrón que cae emite luz roja.',
    fr: 'Tant que le courant passe, chaque électron qui tombe émet de la lumière rouge.',
    hi: 'जब तक धारा बहती है, गिरने वाला हर इलेक्ट्रॉन लाल प्रकाश छोड़ता है।',
    id: 'Selama arus mengalir, setiap elektron yang jatuh memancarkan cahaya merah.',
    pt: 'Enquanto a corrente passa, cada elétron que cai emite luz vermelha.',
  },
  'caption.blueReverse': {
    ko: '띠 간격이 가장 큰 파랑 LED — 역방향으로는 역시 흐르지 않는다.',
    en: 'A blue LED, with the widest band gap — in reverse, again nothing flows.',
    ja: 'バンドギャップが最も大きい青色LED — 逆方向ではやはり流れない。',
    zh: '带隙最宽的蓝色LED — 反向时同样没有电流。',
    ar: 'ثنائي LED أزرق بأوسع فجوة نطاق — في الاتجاه العكسي لا يمر شيء هنا أيضًا.',
    es: 'Un LED azul, con la banda prohibida más ancha — en inversa, de nuevo no circula nada.',
    fr: 'Une LED bleue, à la bande interdite la plus large — en inverse, rien ne passe là non plus.',
    hi: 'सबसे चौड़े बैंड अंतराल वाला नीला LED — पश्च दिशा में फिर कुछ नहीं बहता।',
    id: 'LED biru, dengan celah pita terlebar — pada arah mundur, lagi-lagi tak ada yang mengalir.',
    pt: 'Um LED azul, com a banda proibida mais larga — na reversa, de novo nada passa.',
  },
  'caption.blueForward': {
    ko: '순방향으로 올린다 — 문턱이 더 높아 빨강 LED 보다 오래 거의 흐르지 않는다.',
    en: 'Forward and rising — the threshold is higher still, so almost nothing flows for longer than in the red LED.',
    ja: '順方向に上げていく — しきい電圧はさらに高く、赤色LEDより長くほとんど流れない。',
    zh: '正向升高 — 阈值更高，几乎没有电流的阶段比红色LED更长。',
    ar: 'أماميًا ومتصاعدًا — العتبة أعلى أيضًا، فلا يكاد يمر شيء مدة أطول مما في LED الأحمر.',
    es: 'En directa y subiendo — el umbral es aún más alto, así que casi no circula nada durante más tiempo que en el LED rojo.',
    fr: 'En direct et en montée — le seuil est encore plus haut, donc presque rien ne passe plus longtemps qu’avec la LED rouge.',
    hi: 'अग्र दिशा में बढ़ते हुए — देहली और भी ऊँची है, इसलिए लाल LED से भी ज़्यादा देर तक लगभग कुछ नहीं बहता।',
    id: 'Arah maju dan naik — ambangnya lebih tinggi lagi, jadi hampir tak ada yang mengalir lebih lama daripada pada LED merah.',
    pt: 'Em direta e subindo — o limiar é ainda mais alto, então quase nada passa por mais tempo do que no LED vermelho.',
  },
  'caption.blueRise': {
    ko: '문턱을 넘자 전류가 치솟고, 전자가 더 큰 띠 간격을 떨어지기 시작한다.',
    en: 'Past the threshold the current shoots up, and electrons begin to drop across the wider gap.',
    ja: 'しきい電圧を越えると電流が急増し、電子がより大きなギャップを落ち始める。',
    zh: '越过阈值后电流陡增，电子开始跨过更宽的带隙落下。',
    ar: 'بعد العتبة يقفز التيار، وتبدأ الإلكترونات بالسقوط عبر الفجوة الأوسع.',
    es: 'Pasado el umbral la corriente se dispara, y los electrones empiezan a caer a través de la banda prohibida más ancha.',
    fr: 'Passé le seuil, le courant s’envole, et les électrons commencent à tomber à travers la bande interdite plus large.',
    hi: 'देहली पार होते ही धारा तेज़ी से बढ़ती है, और इलेक्ट्रॉन अधिक चौड़े अंतराल को पार कर गिरने लगते हैं।',
    id: 'Lewat ambang, arus melonjak, dan elektron mulai jatuh melintasi celah yang lebih lebar.',
    pt: 'Passado o limiar a corrente dispara, e os elétrons começam a cair através da banda proibida mais larga.',
  },
  'caption.blueHold': {
    ko: '더 크게 떨어진 만큼 빛의 물결이 촘촘하고 푸르다.',
    en: 'The bigger drop gives light with tighter waves — bluer light.',
    ja: '落差が大きいぶん、光の波は細かく — より青い光になる。',
    zh: '落差更大，光波更密 — 光更蓝。',
    ar: 'السقوط الأكبر يعطي ضوءًا بموجات أكثر تقاربًا — ضوءًا أكثر زرقة.',
    es: 'La caída mayor da luz con ondas más apretadas — luz más azul.',
    fr: 'La chute plus grande donne une lumière aux ondes plus serrées — une lumière plus bleue.',
    hi: 'बड़ी गिरावट से प्रकाश की तरंगें अधिक सघन होती हैं — प्रकाश अधिक नीला।',
    id: 'Jatuh yang lebih besar menghasilkan cahaya dengan gelombang lebih rapat — cahaya lebih biru.',
    pt: 'A queda maior dá luz com ondas mais apertadas — luz mais azul.',
  },
} satisfies Record<string, LocalizedText>);

export type DiodeAndLedMessageKey = keyof typeof diodeAndLedMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: DiodeAndLedMessageKey): LocalizedText => diodeAndLedMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: DiodeAndLedMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const diodeAndLedSchema: BundleSchema = {
  id: DIODE_AND_LED_ID,
  label: text('label.title'),
  category: 'modern',
  description: text('label.description'),
  timeModel: 'periodic',
  parameters: [],
  stages: [
    {
      id: 'default',
      label: text('label.stage'),
      constants: {
        reverseVoltage: REVERSE_VOLTAGE,
        siThreshold: SI_THRESHOLD,
        siGap: SI_GAP_EV,
        redThreshold: RED_THRESHOLD,
        redGap: RED_GAP_EV,
        redNm: RED_NM,
        blueThreshold: BLUE_THRESHOLD,
        blueGap: BLUE_GAP_EV,
        blueNm: BLUE_NM,
        thresholdCurrent: THRESHOLD_CURRENT,
        kneeWidth: KNEE_WIDTH,
        dropRate: DROP_RATE,
        dwell: DWELL_S,
        fall: FALL_S,
        photonSpeed: PHOTON_SPEED,
        photonLife: PHOTON_LIFE,
        waveScale: WAVE_SCALE,
        seed: SEED,
      },
    },
  ],
  environments: [],
  views: [{ id: 'main', label: text('label.view'), default: true }],

  /** 가로로 넓다 — 그래프와 띠 간격 판을 나란히. */
  canvas: { height: 380, minHeight: 330 },

  /** 쓴 순서대로 겹친다 — 축 · 지난 곡선 · 지금 곡선 · 점 · 띠 · 전자 · 빛 · 이름표. */
  drawOrder: 'scene',

  /** 도착한 순간 이미 전압이 역방향으로 걸려 가는 중이다 (S-piece). */
  startAt: 0.9,

  /**
   * 한 주기 24 초. 소자 셋이 같은 네 마디를 차례로 지난다 — 역방향으로 걸고(`*Rev`), 0 으로 되돌리고
   * (`*Back`), 순방향으로 문턱까지 올리고(`*Fwd`), 문턱을 넘어 곡선을 타고 꼭대기까지 오르고(`*Rise`),
   * 가득 흐르는 채로 둔다(`*Hold`). `toRed` · `toBlue` 에서 지난 곡선이 물러나고 띠 간격이 자란다.
   *
   * `*Rise` 는 **이징 없이** 둔다 — 떨어지는 전자의 수가 지난 시각의 전류에서 나와서, physics 가 지난
   * 시각의 진행도를 시작 · 길이로 다시 센다 (NOTES c G13).
   */
  timeline: {
    phases: [
      { id: 'appear', duration: 0.5, ease: 'smooth', caption: key('caption.siReverse') },
      { id: 'siRev', duration: 1.4, ease: 'smooth', caption: key('caption.siReverse') },
      { id: 'siBack', duration: 0.9, ease: 'smooth', caption: key('caption.siReverse') },
      { id: 'siFwd', duration: 1.4, ease: 'smooth', caption: key('caption.siForward') },
      { id: 'siRise', duration: 1.2, caption: key('caption.siRise') },
      { id: 'siHold', duration: 1.8, caption: key('caption.siHold') },
      { id: 'toRed', duration: 0.8, ease: 'smooth', caption: key('caption.redReverse') },
      { id: 'redRev', duration: 1.1, ease: 'smooth', caption: key('caption.redReverse') },
      { id: 'redBack', duration: 0.7, ease: 'smooth', caption: key('caption.redReverse') },
      { id: 'redFwd', duration: 1.8, ease: 'smooth', caption: key('caption.redForward') },
      { id: 'redRise', duration: 1.2, caption: key('caption.redRise') },
      { id: 'redHold', duration: 2.2, caption: key('caption.redHold') },
      { id: 'toBlue', duration: 0.8, ease: 'smooth', caption: key('caption.blueReverse') },
      { id: 'blueRev', duration: 1.1, ease: 'smooth', caption: key('caption.blueReverse') },
      { id: 'blueBack', duration: 0.7, ease: 'smooth', caption: key('caption.blueReverse') },
      { id: 'blueFwd', duration: 2.0, ease: 'smooth', caption: key('caption.blueForward') },
      { id: 'blueRise', duration: 1.2, caption: key('caption.blueRise') },
      { id: 'blueHold', duration: 2.4, caption: key('caption.blueHold') },
      { id: 'fade', duration: 0.8, caption: key('caption.blueHold') },
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

  // 그리드 · 카메라 단추 · 제목 · 범례 없음(기본). 전류 축에는 잴 수가 없다 (S-piece).

  messages: diodeAndLedMessages,
};
