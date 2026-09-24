// ========================================================================
// electron-configuration — 선언
// ========================================================================
// 질문: 주기율표는 왜 그런 모양인가 — 왜 줄 길이가 2 · 8 · 8 · 18 이고, 가운데가 비어 있다가
// 넷째 줄에서야 채워지는가.
//
// 원자 번호를 하나 올릴 때마다 전자가 하나 는다. 전자는 쌓음 원리의 순서
// (1s → 2s → 2p → 3s → 3p → 4s → 3d → 4p)로 부껍질을 채우고, 원소를 그 순서대로 늘어놓되
// **바깥 껍질이 닫힐 때마다 줄을 바꾸면** 주기율표가 나온다. 같은 부껍질에 전자가 든 원소가
// 세로로 모여 s · d · p 블록이 되고, 3d 가 4s 뒤에 차서 d 블록이 넷째 줄에 끼어든다.
//
// 이웃과 겹치지 않는 자리 — `pauli-exclusion` 은 준위마다 ↑ · ↓ 두 자리에 전자가 앉는 것,
// `atomic-orbital` 은 궤도 하나의 모양이다. 이 조각은 준위 · 상자 그림을 되풀이하지 않고
// **원소 칸이 차례로 켜지는 표** 하나로 말한다 (NOTES (b)).
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText, TimelinePhase } from '@aperi21/schema';

/** 등록 키 `aperi21:electron-configuration` 와 문자 그대로 일치한다 (C4). */
export const ELECTRON_CONFIGURATION_ID = 'electron-configuration';

// ------------------------------------------------------------------------
// 스테이지 상수의 기본값 — 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/**
 * 보일 원소 수(원자 번호 1 부터). 1 ~ 36 — 기호 표가 크립톤(36)까지다 (physics `SYMBOLS`).
 * 줄이면 그 번호 뒤 칸은 켜지지 않는다. 시간표 단계는 따라 줄지 않는다 (NOTES (c) G13).
 */
export const ELEMENT_COUNT = 36;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 1 족 · 1 주기 칸의 가운데가 원점, 족마다 1, 주기마다 `ROW_PITCH` 아래.
// ------------------------------------------------------------------------

/** 줄 사이 간격(월드). 칸 아래에 부껍질 괄호 · 이름표 자리가 있다. */
export const ROW_PITCH = 1.65;
/** 원소 칸의 한 변(월드). 족 간격 1 보다 조금 작아 칸 사이가 떨어져 보인다. */
export const TILE = 0.9;
/** 칸 아래 부껍질 괄호가 칸 밑변에서 떨어진 거리 · 끝 꺾쇠 높이(월드). */
export const BRACKET = { gap: 0.22, tick: 0.14 } as const;
/** 주기 번호 열의 가로 자리(월드). */
export const PERIOD_X = -1.25;
/** 블록 이름 괄호가 첫 줄 칸 윗변에서 뜨는 높이(월드). */
export const BLOCK_RISE = 0.35;

/** 프레이밍 — 주기 번호 열부터 18 족까지, 위 블록 이름 · 아래 캡션 띠(장부 G24)를 더했다. */
export const SCENE_BOUNDS = { minX: -2.1, maxX: 18.1, minY: -6.7, maxY: 1.75 } as const;

// ------------------------------------------------------------------------
// 시간표 — 전자 하나가 드는 데 걸리는 시간(초). 자리 하나가 단계 하나다.
// ------------------------------------------------------------------------

/** s 부껍질 — 두 자리뿐이라 한 칸씩 천천히. */
export const SEAT_S = 0.8;
/** p 부껍질 여섯 자리. */
export const SEAT_P = 0.55;
/** d 부껍질 열 자리. */
export const SEAT_D = 0.5;
/** 껍질이 닫힌 뒤 줄이 끝난 것을 읽을 틈. */
export const CLOSE = 1.8;
/** 블록 이름이 떠오르는 동안 · 다 켜진 표에 머무는 동안 · 비우는 동안. */
export const BLOCKS = 1.2;
export const HOLD = 3.8;
export const FADE = 1;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const electronConfigurationMessages = Object.freeze({
  'label.title': {
    ko: '전자 배치',
    en: 'Electron configuration',
    ja: '電子配置',
    zh: '电子排布',
    ar: 'التوزيع الإلكتروني',
    es: 'Configuración electrónica',
    fr: 'Configuration électronique',
    hi: 'इलेक्ट्रॉनिक विन्यास',
    id: 'Konfigurasi elektron',
    pt: 'Configuração eletrônica',
  },
  'label.operation': {
    ko: '주기율표가 나오는 방식',
    en: 'How the periodic table arises',
    ja: '周期表ができるしくみ',
    zh: '元素周期表是怎样形成的',
    ar: 'كيف ينشأ الجدول الدوري',
    es: 'Cómo surge la tabla periódica',
    fr: 'Comment naît le tableau périodique',
    hi: 'आवर्त सारणी कैसे बनती है',
    id: 'Bagaimana tabel periodik terbentuk',
    pt: 'Como surge a tabela periódica',
  },
  'label.stage': {
    ko: '수소에서 크립톤까지',
    en: 'Hydrogen to krypton',
    ja: '水素からクリプトンまで',
    zh: '从氢到氪',
    ar: 'من الهيدروجين إلى الكريبتون',
    es: 'Del hidrógeno al criptón',
    fr: 'De l’hydrogène au krypton',
    hi: 'हाइड्रोजन से क्रिप्टॉन तक',
    id: 'Hidrogen hingga kripton',
    pt: 'Do hidrogênio ao criptônio',
  },
  'label.view': {
    ko: '채우는 순서대로 놓은 원소',
    en: 'Elements in filling order',
    ja: '電子が入る順に並べた元素',
    zh: '按填充顺序排列的元素',
    ar: 'العناصر بترتيب الملء',
    es: 'Elementos en orden de llenado',
    fr: 'Éléments dans l’ordre de remplissage',
    hi: 'भरने के क्रम में तत्व',
    id: 'Unsur menurut urutan pengisian',
    pt: 'Elementos na ordem de preenchimento',
  },
  /** 줄 번호 열의 머리. */
  'label.period': {
    ko: '주기',
    en: 'Period',
    ja: '周期',
    zh: '周期',
    ar: 'الدورة',
    es: 'Periodo',
    fr: 'Période',
    hi: 'आवर्त',
    id: 'Periode',
    pt: 'Período',
  },
  /** 표 위 블록 이름. `s` · `d` · `p` 는 표식이지만 「블록」 이 붙어 문안이다 (C1). */
  'label.blockS': {
    ko: 's 블록',
    en: 's-block',
    ja: 'sブロック',
    zh: 's区',
    ar: 'الفئة s',
    es: 'bloque s',
    fr: 'bloc s',
    hi: 's-ब्लॉक',
    id: 'blok s',
    pt: 'bloco s',
  },
  'label.blockD': {
    ko: 'd 블록',
    en: 'd-block',
    ja: 'dブロック',
    zh: 'd区',
    ar: 'الفئة d',
    es: 'bloque d',
    fr: 'bloc d',
    hi: 'd-ब्लॉक',
    id: 'blok d',
    pt: 'bloco d',
  },
  'label.blockP': {
    ko: 'p 블록',
    en: 'p-block',
    ja: 'pブロック',
    zh: 'p区',
    ar: 'الفئة p',
    es: 'bloque p',
    fr: 'bloc p',
    hi: 'p-ब्लॉक',
    id: 'blok p',
    pt: 'bloco p',
  },

  'caption.fill1s': {
    ko: '원자 번호가 하나 오를 때마다 전자가 하나 는다 — 첫 두 전자는 1s 에 든다',
    en: 'Each step up in atomic number adds one electron — the first two go into 1s',
    ja: '原子番号が一つ上がるごとに電子が一つ増える — 最初の二つは1sに入る',
    zh: '原子序数每增加一，电子就多一个 — 前两个电子进入1s',
    ar: 'كل زيادة في العدد الذري بواحد تضيف إلكترونًا واحدًا — أول إلكترونين يدخلان 1s',
    es: 'Cada paso en el número atómico añade un electrón — los dos primeros van a 1s',
    fr: 'Chaque pas du numéro atomique ajoute un électron — les deux premiers vont dans 1s',
    hi: 'परमाणु क्रमांक में हर एक की बढ़त एक इलेक्ट्रॉन जोड़ती है — पहले दो 1s में जाते हैं',
    id: 'Setiap kenaikan nomor atom menambah satu elektron — dua yang pertama masuk ke 1s',
    pt: 'Cada passo no número atômico acrescenta um elétron — os dois primeiros vão para 1s',
  },
  'caption.close1': {
    ko: '1s 가 두 자리로 찼다 — 첫 껍질이 닫혀 첫 주기가 여기서 끝난다',
    en: '1s is full with two — the first shell is closed and the first period ends here',
    ja: '1sは二つで満たされた — 最初の殻が閉じ、第1周期はここで終わる',
    zh: '1s填满两个 — 第一电子层闭合，第一周期到此结束',
    ar: 'امتلأ 1s بإلكترونين — انغلق الغلاف الأول وتنتهي الدورة الأولى هنا',
    es: '1s se llena con dos — la primera capa se cierra y el primer periodo termina aquí',
    fr: '1s est plein avec deux — la première couche est fermée et la première période s’arrête ici',
    hi: '1s दो से भर गया — पहला कोश बंद हो गया और पहला आवर्त यहीं समाप्त होता है',
    id: '1s penuh dengan dua — kulit pertama tertutup dan periode pertama berakhir di sini',
    pt: '1s está cheio com dois — a primeira camada se fecha e o primeiro período termina aqui',
  },
  'caption.fill2s': {
    ko: '다음 전자는 새 껍질의 2s 에 든다 — 새 줄의 맨 앞 칸이다',
    en: 'The next electron goes into 2s of a new shell — the first cell of a new row',
    ja: '次の電子は新しい殻の2sに入る — 新しい行の先頭のマスだ',
    zh: '下一个电子进入新电子层的2s — 新一行的第一格',
    ar: 'يدخل الإلكترون التالي 2s في غلاف جديد — أول خانة في صف جديد',
    es: 'El siguiente electrón va a 2s de una capa nueva — la primera casilla de una fila nueva',
    fr: 'L’électron suivant va dans 2s d’une nouvelle couche — la première case d’une nouvelle ligne',
    hi: 'अगला इलेक्ट्रॉन नए कोश के 2s में जाता है — नई पंक्ति का पहला खाना',
    id: 'Elektron berikutnya masuk ke 2s pada kulit baru — sel pertama di baris baru',
    pt: 'O próximo elétron vai para 2s de uma nova camada — a primeira casa de uma nova linha',
  },
  'caption.fill2p': {
    ko: '2p 는 여섯 자리 — 줄의 오른쪽 여섯 칸이 차례로 켜진다',
    en: '2p has six places — the six cells at the right of the row light up in turn',
    ja: '2pには六つの席 — 行の右側の六マスが順に点く',
    zh: '2p有六个位置 — 这一行右侧的六格依次亮起',
    ar: 'في 2p ستة أماكن — تضيء الخانات الست في يمين الصف واحدة تلو الأخرى',
    es: '2p tiene seis lugares — las seis casillas de la derecha de la fila se encienden una a una',
    fr: '2p a six places — les six cases à droite de la ligne s’allument tour à tour',
    hi: '2p में छह स्थान हैं — पंक्ति के दाईं ओर के छह खाने बारी-बारी से जलते हैं',
    id: '2p punya enam tempat — enam sel di kanan baris menyala bergantian',
    pt: '2p tem seis lugares — as seis casas à direita da linha acendem uma a uma',
  },
  'caption.close2': {
    ko: '2s · 2p 여덟 자리가 찼다 — 둘째 껍질이 닫혀 둘째 주기가 끝난다',
    en: 'All eight places of 2s and 2p are full — the second shell closes and the second period ends',
    ja: '2sと2pの八つの席がすべて埋まった — 2番目の殻が閉じ、第2周期が終わる',
    zh: '2s和2p的八个位置全部填满 — 第二电子层闭合，第二周期结束',
    ar: 'امتلأت الأماكن الثمانية في 2s و2p كلها — ينغلق الغلاف الثاني وتنتهي الدورة الثانية',
    es: 'Los ocho lugares de 2s y 2p están llenos — la segunda capa se cierra y el segundo periodo termina',
    fr: 'Les huit places de 2s et 2p sont remplies — la deuxième couche se ferme et la deuxième période s’achève',
    hi: '2s और 2p के आठों स्थान भर गए — दूसरा कोश बंद होता है और दूसरा आवर्त समाप्त होता है',
    id: 'Kedelapan tempat 2s dan 2p sudah penuh — kulit kedua tertutup dan periode kedua berakhir',
    pt: 'Os oito lugares de 2s e 2p estão cheios — a segunda camada se fecha e o segundo período termina',
  },
  'caption.fill3': {
    ko: '셋째 줄도 같은 모양 — 3s 두 칸, 그리고 3p 여섯 칸',
    en: 'The third row has the same shape — two cells of 3s, then six of 3p',
    ja: '3行目も同じ形 — 3sの二マス、続いて3pの六マス',
    zh: '第三行也是同样的形状 — 3s两格，然后3p六格',
    ar: 'للصف الثالث الشكل نفسه — خانتان لـ 3s، ثم ست لـ 3p',
    es: 'La tercera fila tiene la misma forma — dos casillas de 3s y luego seis de 3p',
    fr: 'La troisième ligne a la même forme — deux cases de 3s, puis six de 3p',
    hi: 'तीसरी पंक्ति का आकार भी वही है — 3s के दो खाने, फिर 3p के छह',
    id: 'Baris ketiga berbentuk sama — dua sel 3s, lalu enam sel 3p',
    pt: 'A terceira linha tem a mesma forma — duas casas de 3s, depois seis de 3p',
  },
  'caption.close3': {
    ko: '3p 까지 찼다 — 셋째 주기가 끝난다. 가운데는 아직 비어 있다',
    en: 'Filled through 3p — the third period ends. The middle is still empty',
    ja: '3pまで埋まった — 第3周期が終わる。真ん中はまだ空いている',
    zh: '填到3p — 第三周期结束。中间还空着',
    ar: 'امتلأ حتى 3p — تنتهي الدورة الثالثة. الوسط ما زال فارغًا',
    es: 'Lleno hasta 3p — termina el tercer periodo. El centro sigue vacío',
    fr: 'Rempli jusqu’à 3p — la troisième période s’achève. Le milieu est encore vide',
    hi: '3p तक भर गया — तीसरा आवर्त समाप्त होता है। बीच का भाग अभी भी खाली है',
    id: 'Terisi sampai 3p — periode ketiga berakhir. Bagian tengah masih kosong',
    pt: 'Preenchido até 3p — o terceiro período termina. O meio ainda está vazio',
  },
  'caption.fill4s': {
    ko: '3d 보다 4s 가 먼저 찬다 — 넷째 줄 맨 앞 칸이 켜진다',
    en: '4s fills before 3d — the first cells of the fourth row light up',
    ja: '3dより先に4sが埋まる — 4行目の先頭のマスが点く',
    zh: '4s先于3d填充 — 第四行最前面的格子亮起',
    ar: 'يمتلئ 4s قبل 3d — تضيء أولى خانات الصف الرابع',
    es: '4s se llena antes que 3d — se encienden las primeras casillas de la cuarta fila',
    fr: '4s se remplit avant 3d — les premières cases de la quatrième ligne s’allument',
    hi: '4s, 3d से पहले भरता है — चौथी पंक्ति के पहले खाने जलते हैं',
    id: '4s terisi sebelum 3d — sel-sel pertama baris keempat menyala',
    pt: '4s se preenche antes de 3d — as primeiras casas da quarta linha acendem',
  },
  'caption.fill3d': {
    ko: '4s 다음에야 3d 열 자리가 찬다 — 넷째 줄 가운데에 열 칸이 끼어든다',
    en: 'Only after 4s do the ten places of 3d fill — ten cells wedge into the middle of the fourth row',
    ja: '4sの後でようやく3dの十の席が埋まる — 4行目の真ん中に十マスが割り込む',
    zh: '直到4s之后，3d的十个位置才填充 — 十个格子插入第四行中间',
    ar: 'لا تمتلئ أماكن 3d العشرة إلا بعد 4s — تنحشر عشر خانات في وسط الصف الرابع',
    es: 'Solo después de 4s se llenan los diez lugares de 3d — diez casillas se intercalan en el centro de la cuarta fila',
    fr: 'C’est seulement après 4s que les dix places de 3d se remplissent — dix cases s’insèrent au milieu de la quatrième ligne',
    hi: '4s के बाद ही 3d के दस स्थान भरते हैं — चौथी पंक्ति के बीच में दस खाने घुस आते हैं',
    id: 'Baru setelah 4s, sepuluh tempat 3d terisi — sepuluh sel menyisip di tengah baris keempat',
    pt: 'Só depois de 4s os dez lugares de 3d se preenchem — dez casas se encaixam no meio da quarta linha',
  },
  'caption.fill4p': {
    ko: '이어서 4p 여섯 자리가 줄의 끝을 채운다',
    en: 'Then the six places of 4p fill the end of the row',
    ja: '続いて4pの六つの席が行の端を埋める',
    zh: '接着4p的六个位置填满这一行的末尾',
    ar: 'ثم تملأ أماكن 4p الستة نهاية الصف',
    es: 'Luego los seis lugares de 4p llenan el final de la fila',
    fr: 'Puis les six places de 4p remplissent la fin de la ligne',
    hi: 'फिर 4p के छह स्थान पंक्ति का अंत भरते हैं',
    id: 'Lalu enam tempat 4p mengisi ujung baris',
    pt: 'Depois os seis lugares de 4p preenchem o fim da linha',
  },
  'caption.close4': {
    ko: '4p 까지 찼다 — 넷째 주기가 끝난다',
    en: 'Filled through 4p — the fourth period ends',
    ja: '4pまで埋まった — 第4周期が終わる',
    zh: '填到4p — 第四周期结束',
    ar: 'امتلأ حتى 4p — تنتهي الدورة الرابعة',
    es: 'Lleno hasta 4p — termina el cuarto periodo',
    fr: 'Rempli jusqu’à 4p — la quatrième période s’achève',
    hi: '4p तक भर गया — चौथा आवर्त समाप्त होता है',
    id: 'Terisi sampai 4p — periode keempat berakhir',
    pt: 'Preenchido até 4p — o quarto período termina',
  },
  'caption.blocks': {
    ko: '채우는 순서대로 늘어놓고 껍질이 닫힐 때마다 줄을 바꾸면 주기율표 — 같은 부껍질이 세로로 모여 블록이 된다',
    en: 'Lay the elements out in filling order and start a new row whenever a shell closes: the periodic table — the same subshell stacks into a block',
    ja: '電子が入る順に元素を並べ、殻が閉じるたびに行を変えると周期表になる — 同じ副殻が縦に集まってブロックになる',
    zh: '按填充顺序排列元素，每当电子层闭合就换行：这就是元素周期表 — 同一亚层纵向聚成一个区',
    ar: 'رتّب العناصر بترتيب الملء وابدأ صفًا جديدًا كلما انغلق غلاف: هذا هو الجدول الدوري — والغلاف الفرعي نفسه يتراكم في فئة واحدة',
    es: 'Ordena los elementos según el llenado y empieza una fila nueva cada vez que se cierra una capa: la tabla periódica — la misma subcapa se apila en un bloque',
    fr: 'Rangez les éléments dans l’ordre de remplissage et changez de ligne chaque fois qu’une couche se ferme : le tableau périodique — la même sous-couche s’empile en un bloc',
    hi: 'तत्वों को भरने के क्रम में रखें और हर बार कोश बंद होने पर नई पंक्ति शुरू करें: आवर्त सारणी — एक ही उपकोश खड़ा होकर एक ब्लॉक बनता है',
    id: 'Susun unsur menurut urutan pengisian dan mulai baris baru setiap kali kulit tertutup: tabel periodik — subkulit yang sama bertumpuk menjadi satu blok',
    pt: 'Disponha os elementos na ordem de preenchimento e comece uma nova linha sempre que uma camada se fecha: a tabela periódica — a mesma subcamada se empilha num bloco',
  },
} satisfies Record<string, LocalizedText>);

export type ElectronConfigurationMessageKey = keyof typeof electronConfigurationMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: ElectronConfigurationMessageKey): LocalizedText => electronConfigurationMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ElectronConfigurationMessageKey): string {
  return k;
}

/**
 * 부껍질 하나를 채우는 단계들 — 자리마다 단계 하나, id 는 `fill-<부껍질>-<k>`(k 는 0 부터).
 * physics 가 이 이름으로 부른다. 캡션은 부껍질마다 하나라 이웃 단계끼리 같은 키 — 다시 페이드하지 않는다.
 */
function fill(subshell: string, seats: number, seat: number, caption: ElectronConfigurationMessageKey): TimelinePhase[] {
  return Array.from({ length: seats }, (_, k) => ({
    id: `fill-${subshell}-${k}`,
    duration: seat,
    caption: key(caption),
  }));
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const electronConfigurationSchema: BundleSchema = {
  id: ELECTRON_CONFIGURATION_ID,
  label: text('label.title'),
  category: 'modern',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 한 주기 안에 표가 다 나온다.
  parameters: [],

  stages: [
    {
      id: 'default',
      label: text('label.stage'),
      constants: { elementCount: ELEMENT_COUNT },
    },
  ],

  environments: [],

  views: [{ id: 'main', label: text('label.view'), default: true }],

  /** 가로로 넓다 — 18 족이 옆으로 놓인다. 세로는 넷째 줄과 캡션 줄. */
  canvas: { height: 380, minHeight: 340 },

  /** 겹침은 scene 에 쓴 순서 — 칸 위에 기호, 맨 위에 커서. */
  drawOrder: 'scene',

  /**
   * 한 주기 = 부껍질을 쌓음 원리 순서로 한 자리씩 채움(`fill-<부껍질>-<k>`, 전자 하나가 단계 하나)
   * · 껍질이 닫힐 때마다 읽을 틈(`close-*`) → 블록 이름 → 다 켜진 표에 머묾 → 비움.
   * 단계 수가 `elementCount` 를 따라가지 않는다 (NOTES (c) G13).
   */
  timeline: {
    phases: [
      ...fill('1s', 2, SEAT_S, 'caption.fill1s'),
      { id: 'close-1', duration: CLOSE, caption: key('caption.close1') },
      ...fill('2s', 2, SEAT_S, 'caption.fill2s'),
      ...fill('2p', 6, SEAT_P, 'caption.fill2p'),
      { id: 'close-2', duration: CLOSE, caption: key('caption.close2') },
      ...fill('3s', 2, SEAT_S, 'caption.fill3'),
      ...fill('3p', 6, SEAT_P, 'caption.fill3'),
      { id: 'close-3', duration: CLOSE, caption: key('caption.close3') },
      ...fill('4s', 2, SEAT_S, 'caption.fill4s'),
      ...fill('3d', 10, SEAT_D, 'caption.fill3d'),
      ...fill('4p', 6, SEAT_P, 'caption.fill4p'),
      { id: 'close-4', duration: CLOSE, caption: key('caption.close4') },
      { id: 'blocks', duration: BLOCKS, ease: 'smooth', caption: key('caption.blocks') },
      { id: 'hold', duration: HOLD, caption: key('caption.blocks') },
      { id: 'fade', duration: FADE, caption: key('caption.blocks') },
    ],
  },

  /** 도착한 순간 첫 줄은 닫혀 있고, 둘째 줄의 2p 가 차오르는 중이다. */
  startAt: 5.6,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 쌓음 원리의 정의는 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 720,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  messages: electronConfigurationMessages,
};
