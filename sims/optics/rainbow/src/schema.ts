// ========================================================================
// rainbow — 선언
// ========================================================================
// 질문: 무지개는 왜 해를 등진 쪽 하늘에, 언제나 비슷한 높이의 둥근 띠로, 바깥이 빨강이게 서는가?
//
// 답: 물방울에 들어간 햇빛은 들어갈 때 꺾이고, 안쪽 벽에서 한 번 되비치고, 나올 때 다시 꺾인다.
// 나가는 줄기의 각은 들어온 자리마다 다르지만 해 쪽으로 되돌아가는 방향에서 약 42°(빨강) ·
// 40°(보라) 둘레에 몰린다. 그래서 하늘의 많은 물방울 가운데 눈에서 42° 높이의 방울은 빨강을,
// 40° 높이의 방울은 보라를 눈에 보내 띠가 서고, 바깥(위)이 빨강 · 안쪽(아래)이 보라다.
//
// 이웃과 겹치지 않게 — `dispersion` 은 유리 면 하나에서 색마다 꺾임이 다른 것을, `prism` 은 두 면에서
// 두 번 꺾여 크게 벌어지는 것을 보인다. 여기서는 굴절 · 반사 · 굴절을 거친 줄기가 **한 각에 몰리는 것**과
// 그 각이 색마다 조금 다른 것이 하늘에서 띠가 되는 데까지 간다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:rainbow` 와 문자 그대로 일치한다 (C4). */
export const RAINBOW_ID = 'rainbow';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 빨강 · 보라의 파장(nm)과 그 파장에서 물의 굴절률. 사이 파장은 1/λ² 에 대해 곧게 잇는다. */
export const NM_RED = 656;
export const N_RED = 1.331;
export const NM_VIOLET = 405;
export const N_VIOLET = 1.343;
/**
 * 화면 글자로 쓰는 각의 정박값(°). 몰리는 각의 계산값(빨강 42.4° · 보라 40.7°)과 따로 선언한다 —
 * 교과서가 말하는 두 수이고, 계산값을 반올림해 띄우지 않기 위해서다 (NOTES (c) G143).
 */
export const RED_DEG = 42;
export const VIOLET_DEG = 40;
/**
 * 색 사이 벌어짐의 과장 배율. 실제 차(빨강 42.4° · 보라 40.7°, 1.7°)는 물방울 판에서 두 다발이 한 줄로
 * 겹치고 하늘 판에서 띠가 몇 px 로 얇다 — 빨강 굴절률에서 벗어난 몫만 이만큼 키운다. 빨강은 참값 그대로다.
 * 두 판에 같이 걸고, 화면에 적는다.
 */
export const SPREAD_GAIN = 3;
/** 왼쪽 판 물방울의 반지름(월드). */
export const DROP_RADIUS = 1;
/** 물방울 위쪽 절반에 고르게 들어가는 나란한 햇빛 줄기 수. */
export const RAY_COUNT = 20;
/** 하늘 물방울 수와 그 흩뿌림의 시드 (결정적 난수 — 같은 시각은 같은 화면). */
export const SKY_DROP_COUNT = 380;
export const SEED = 7;
/** 눈에서 짚어 보이는 두 물방울(빨강 · 보라)까지의 거리(월드). */
export const SKY_DISTANCE = 5.6;

// ------------------------------------------------------------------------
// 배치 — 월드 단위는 임의. 왼쪽 판은 물방울 중심이 원점.
// ------------------------------------------------------------------------

/** 빛 없음 판 둘 — 흰빛 · 빛 색 줄기가 라이트 바탕에 묻히지 않게 깐다 (G92). */
export const PANEL_DROP = { minX: -4.4, maxX: 2.0, minY: -3.75, maxY: 1.3 } as const;
export const PANEL_SKY = { minX: 2.4, maxX: 8.9, minY: -3.75, maxY: 1.3 } as const;
/** 들어오는 햇빛 줄기가 시작하는 x. */
export const IN_START_X = -4.3;
/**
 * 각 호의 반지름(월드). 호는 빨강 데카르트 줄기가 나오는 점을 중심으로 해 쪽 기준선에서 아래로 돈다.
 * 나가는 줄기는 이 호까지 그어져, 줄기 끝이 호의 몰리는 각 자리에 쌓인다.
 */
export const ARC_R = 2.85;
/** 오른쪽 판 — 눈의 자리와 하늘 물방울 구름의 사각형. */
export const EYE = [3.0, -3.35] as const;
export const SKY_CLOUD = { minX: 4.7, maxX: 8.75, minY: -1.9, maxY: 1.15 } as const;
/** 판 밖 이름표 줄의 y — 판 위 · 판 아래. */
export const LABEL_TOP_Y = 1.3;
export const LABEL_BOTTOM_Y = -3.75;

/** 프레이밍 — 고정값. 왼쪽 물방울 판, 오른쪽 하늘 판, 아래 캡션 줄 (원칙 6). */
export const SCENE_BOUNDS = { minX: -4.6, maxX: 9.1, minY: -5.15, maxY: 1.85 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const rainbowMessages = Object.freeze({
  'label.title': {
    ko: '무지개',
    en: 'Rainbow',
    ja: '虹',
    zh: '彩虹',
    ar: 'قوس قزح',
    es: 'Arcoíris',
    fr: 'Arc-en-ciel',
    hi: 'इंद्रधनुष',
    id: 'Pelangi',
    pt: 'Arco-íris',
  },
  'label.operation': {
    ko: '물방울 속 굴절과 반사',
    en: 'Refraction and reflection inside raindrops',
    ja: '雨粒の中の屈折と反射',
    zh: '雨滴内的折射与反射',
    ar: 'الانكسار والانعكاس داخل قطرات المطر',
    es: 'Refracción y reflexión dentro de las gotas de lluvia',
    fr: 'Réfraction et réflexion dans les gouttes de pluie',
    hi: 'वर्षा की बूँदों के भीतर अपवर्तन और परावर्तन',
    id: 'Pembiasan dan pemantulan di dalam tetes hujan',
    pt: 'Refração e reflexão dentro das gotas de chuva',
  },
  'label.stage': {
    ko: '햇빛과 빗방울',
    en: 'Sunlight and raindrops',
    ja: '日光と雨粒',
    zh: '阳光与雨滴',
    ar: 'ضوء الشمس وقطرات المطر',
    es: 'Luz solar y gotas de lluvia',
    fr: 'Lumière du Soleil et gouttes de pluie',
    hi: 'सूर्य का प्रकाश और वर्षा की बूँदें',
    id: 'Sinar Matahari dan tetes hujan',
    pt: 'Luz solar e gotas de chuva',
  },
  'label.view': {
    ko: '물방울 하나와 하늘',
    en: 'One drop and the sky',
    ja: '1つの雨粒と空',
    zh: '一颗雨滴与天空',
    ar: 'قطرة واحدة والسماء',
    es: 'Una gota y el cielo',
    fr: 'Une goutte et le ciel',
    hi: 'एक बूँद और आकाश',
    id: 'Satu tetes dan langit',
    pt: 'Uma gota e o céu',
  },

  /** 판 밖 이름표. */
  'label.sunlight': {
    ko: '햇빛 →',
    en: 'Sunlight →',
    ja: '日光 →',
    zh: '阳光 →',
    ar: 'ضوء الشمس →',
    es: 'Luz solar →',
    fr: 'Lumière du Soleil →',
    hi: 'सूर्य का प्रकाश →',
    id: 'Sinar Matahari →',
    pt: 'Luz solar →',
  },
  'label.drop': {
    ko: '물방울 하나',
    en: 'One raindrop',
    ja: '雨粒 1つ',
    zh: '一颗雨滴',
    ar: 'قطرة مطر واحدة',
    es: 'Una gota de lluvia',
    fr: 'Une goutte de pluie',
    hi: 'वर्षा की एक बूँद',
    id: 'Satu tetes hujan',
    pt: 'Uma gota de chuva',
  },
  'label.sky': {
    ko: '해를 등진 하늘',
    en: 'Sky opposite the sun',
    ja: '太陽と反対側の空',
    zh: '背对太阳的天空',
    ar: 'السماء المقابلة للشمس',
    es: 'Cielo opuesto al Sol',
    fr: 'Ciel à l’opposé du Soleil',
    hi: 'सूर्य के विपरीत आकाश',
    id: 'Langit yang membelakangi Matahari',
    pt: 'Céu oposto ao Sol',
  },
  'label.eye': {
    ko: '눈',
    en: 'Eye',
    ja: '目',
    zh: '眼睛',
    ar: 'العين',
    es: 'Ojo',
    fr: 'Œil',
    hi: 'आँख',
    id: 'Mata',
    pt: 'Olho',
  },
  /** 각 글자 — 수는 정박값 상수. 기호 조립이라 두 언어가 같다. */
  'label.deg': {
    ko: '{d}°',
    en: '{d}°',
    ja: '{d}°',
    zh: '{d}°',
    ar: '{d}°',
    es: '{d}°',
    fr: '{d}°',
    hi: '{d}°',
    id: '{d}°',
    pt: '{d}°',
  },
  /** 과장 배율. 스테이지 상수를 끼운다. */
  'label.gain': {
    ko: '색 사이 벌어짐 {k}배 과장',
    en: 'Spread between colours exaggerated ×{k}',
    ja: '色の間の広がりを ×{k} に誇張',
    zh: '色光之间的展开夸大 ×{k}',
    ar: 'التباعد بين الألوان مضخَّم ×{k}',
    es: 'Separación entre colores exagerada ×{k}',
    fr: 'Écart entre les couleurs exagéré ×{k}',
    hi: 'रंगों के बीच फैलाव ×{k} बढ़ा-चढ़ाकर',
    id: 'Sebaran antarwarna dilebih-lebihkan ×{k}',
    pt: 'Separação entre as cores exagerada ×{k}',
  },

  'caption.enter': {

    ko: '나란한 햇빛 줄기 여럿이 큰 물방울 하나로 들어간다.',

    en: 'Parallel rays of sunlight head into one large raindrop.',

    ja: '平行な日光の光線が何本も、大きな雨粒1つに向かう。',

    zh: '几条平行的阳光光线射向一颗大雨滴。',

    ar: 'أشعة متوازية من ضوء الشمس تتجه نحو قطرة مطر كبيرة واحدة.',

    es: 'Varios rayos paralelos de luz solar se dirigen a una gota de lluvia grande.',

    fr: 'Des rayons parallèles de lumière du Soleil se dirigent vers une grosse goutte de pluie.',

    hi: 'सूर्य के प्रकाश की कई समांतर किरणें वर्षा की एक बड़ी बूँद की ओर जाती हैं।',

    id: 'Beberapa sinar Matahari yang sejajar menuju satu tetes hujan besar.',

    pt: 'Raios paralelos de luz solar seguem em direção a uma grande gota de chuva.',

  },
  'caption.redPath': {
    ko: '빨강 빛만 따라간다 — 들어가며 꺾이고, 안쪽 벽에서 한 번 되비치고, 나오며 다시 꺾인다.',
    en: 'Follow only the red light — bent on the way in, reflected once off the far wall, bent again on the way out.',
    ja: '赤い光だけを追う — 入るときに曲がり、奥の壁で一度反射し、出るときにまた曲がる。',
    zh: '只跟随红光——进入时偏折，在对面内壁反射一次，射出时再次偏折。',
    ar: 'تتبّع الضوء الأحمر وحده — ينكسر عند الدخول، وينعكس مرة واحدة عن الجدار البعيد، ثم ينكسر ثانيةً عند الخروج.',
    es: 'Sigue solo la luz roja — se desvía al entrar, se refleja una vez en la pared del fondo y se desvía de nuevo al salir.',
    fr: 'Suivons seulement la lumière rouge — déviée à l’entrée, réfléchie une fois sur la paroi du fond, déviée de nouveau à la sortie.',
    hi: 'केवल लाल प्रकाश का पीछा करें — भीतर जाते समय मुड़ता है, दूर की दीवार से एक बार परावर्तित होता है, बाहर निकलते समय फिर मुड़ता है।',
    id: 'Ikuti cahaya merah saja — dibelokkan saat masuk, dipantulkan sekali oleh dinding seberang, lalu dibelokkan lagi saat keluar.',
    pt: 'Siga só a luz vermelha — desviada ao entrar, refletida uma vez na parede do fundo, desviada de novo ao sair.',
  },
  'caption.redHold': {
    ko: '나가는 빨강 줄기는 흩어지지만, 해 쪽으로 되돌아가는 방향과 {r}° 를 이루는 자리에 몰려 짙다.',
    en: 'The red rays leave spread out, yet they crowd together at {r}° from the direction back toward the sun.',
    ja: '出ていく赤い光線は広がるが、太陽へ戻る向きから {r}° の方向に集まって濃くなる。',
    zh: '射出的红光光线虽然散开，却在与指回太阳的方向成 {r}° 的地方聚集。',
    ar: 'تخرج الأشعة الحمراء متفرقة، لكنها تتزاحم عند {r}° من الاتجاه العائد نحو الشمس.',
    es: 'Los rayos rojos salen dispersos, pero se agolpan a {r}° de la dirección de vuelta hacia el Sol.',
    fr: 'Les rayons rouges ressortent dispersés, mais se concentrent à {r}° de la direction qui revient vers le Soleil.',
    hi: 'बाहर निकलती लाल किरणें फैल जाती हैं, फिर भी सूर्य की ओर लौटती दिशा से {r}° पर सघन रूप से जमा होती हैं।',
    id: 'Sinar merah keluar menyebar, tetapi berkumpul rapat pada {r}° dari arah kembali ke Matahari.',
    pt: 'Os raios vermelhos saem espalhados, mas se concentram a {r}° da direção de volta para o Sol.',
  },
  'caption.violetPath': {
    ko: '보라 빛도 같은 길을 따라간다.',
    en: 'The violet light follows the same route.',
    ja: '紫の光も同じ道筋をたどる。',
    zh: '紫光也沿同样的路径前进。',
    ar: 'يسلك الضوء البنفسجي المسار نفسه.',
    es: 'La luz violeta sigue el mismo recorrido.',
    fr: 'La lumière violette suit le même trajet.',
    hi: 'बैंगनी प्रकाश भी उसी रास्ते पर चलता है।',
    id: 'Cahaya ungu menempuh jalur yang sama.',
    pt: 'A luz violeta segue o mesmo caminho.',
  },
  'caption.violetHold': {
    ko: '보라 줄기는 그보다 조금 작은 {v}° 둘레에 몰린다.',
    en: 'The violet rays crowd at a slightly smaller angle, around {v}°.',
    ja: '紫の光線は少し小さい角度、{v}° のあたりに集まる。',
    zh: '紫光光线聚集在稍小的角度，约 {v}° 处。',
    ar: 'تتزاحم الأشعة البنفسجية عند زاوية أصغر قليلًا، نحو {v}°.',
    es: 'Los rayos violetas se agolpan en un ángulo algo menor, cerca de {v}°.',
    fr: 'Les rayons violets se concentrent sous un angle un peu plus petit, vers {v}°.',
    hi: 'बैंगनी किरणें थोड़े छोटे कोण, लगभग {v}° पर जमा होती हैं।',
    id: 'Sinar ungu berkumpul pada sudut yang sedikit lebih kecil, sekitar {v}°.',
    pt: 'Os raios violeta se concentram num ângulo um pouco menor, por volta de {v}°.',
  },
  'caption.sky': {
    ko: '햇빛이 비치는 하늘 가득한 물방울을, 해를 등진 눈이 올려다본다.',
    en: 'An eye with the sun behind it looks up at a sky full of sunlit raindrops.',
    ja: '太陽を背にした目が、日に照らされた雨粒でいっぱいの空を見上げる。',
    zh: '背对太阳的眼睛仰望满是被阳光照亮的雨滴的天空。',
    ar: 'عين تستدبر الشمس تنظر إلى سماء مليئة بقطرات مطر مضاءة بالشمس.',
    es: 'Un ojo con el Sol a la espalda mira un cielo lleno de gotas iluminadas por el Sol.',
    fr: 'Un œil, le Soleil dans le dos, lève le regard vers un ciel rempli de gouttes éclairées par le Soleil.',
    hi: 'सूर्य की ओर पीठ किए एक आँख धूप से चमकती बूँदों से भरे आकाश को ऊपर देखती है।',
    id: 'Mata yang membelakangi Matahari menatap langit penuh tetes hujan yang tersinari Matahari.',
    pt: 'Um olho com o Sol às costas olha para um céu cheio de gotas iluminadas pelo Sol.',
  },
  'caption.skyRays': {
    ko: '{r}° 높이의 물방울에서는 빨강이, {v}° 높이의 물방울에서는 보라가 눈에 닿는다.',
    en: 'From a drop {r}° up, red reaches the eye; from a drop {v}° up, violet does.',
    ja: '{r}° の高さの雨粒からは赤が、{v}° の高さの雨粒からは紫が目に届く。',
    zh: '从 {r}° 高处的雨滴，红光到达眼睛；从 {v}° 高处的雨滴，到达的是紫光。',
    ar: 'من قطرة على ارتفاع {r}° يصل الأحمر إلى العين، ومن قطرة على ارتفاع {v}° يصل البنفسجي.',
    es: 'Desde una gota a {r}° de altura llega el rojo al ojo; desde una a {v}°, el violeta.',
    fr: 'D’une goutte à {r}° de hauteur, le rouge atteint l’œil ; d’une goutte à {v}°, c’est le violet.',
    hi: '{r}° ऊँचाई की बूँद से लाल आँख तक पहुँचता है; {v}° ऊँचाई की बूँद से बैंगनी।',
    id: 'Dari tetes setinggi {r}°, merah sampai ke mata; dari tetes setinggi {v}°, ungu yang sampai.',
    pt: 'De uma gota a {r}° de altura, o vermelho chega ao olho; de uma a {v}°, o violeta.',
  },
  'caption.band': {
    ko: '그 사이 높이의 물방울들이 저마다 한 색을 눈에 보내 띠가 된다 — 위(바깥)가 빨강, 아래(안쪽)가 보라.',
    en: 'Drops at heights in between each send one colour to the eye, forming a band — red on top (outside), violet below (inside).',
    ja: 'その間の高さの雨粒がそれぞれ1色ずつ目に送り、帯になる — 上（外側）が赤、下（内側）が紫。',
    zh: '介于其间高度的雨滴各自把一种颜色送入眼睛，形成一条光带——上方（外侧）是红，下方（内侧）是紫。',
    ar: 'ترسل القطرات على الارتفاعات الواقعة بينهما كلٌّ منها لونًا واحدًا إلى العين فتتكوّن حزمة — الأحمر في الأعلى (الخارج) والبنفسجي في الأسفل (الداخل).',
    es: 'Las gotas a alturas intermedias envían cada una un color al ojo y forman una banda — rojo arriba (fuera), violeta abajo (dentro).',
    fr: 'Les gouttes situées entre ces hauteurs envoient chacune une couleur à l’œil et forment une bande — rouge en haut (à l’extérieur), violet en bas (à l’intérieur).',
    hi: 'बीच की ऊँचाइयों वाली बूँदें एक-एक रंग आँख तक भेजती हैं और एक पट्टी बनती है — ऊपर (बाहर) लाल, नीचे (भीतर) बैंगनी।',
    id: 'Tetes-tetes pada ketinggian di antaranya masing-masing mengirim satu warna ke mata, membentuk pita — merah di atas (luar), ungu di bawah (dalam).',
    pt: 'As gotas em alturas intermediárias enviam cada uma uma cor ao olho, formando uma faixa — vermelho em cima (por fora), violeta embaixo (por dentro).',
  },
} satisfies Record<string, LocalizedText>);

export type RainbowMessageKey = keyof typeof rainbowMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: RainbowMessageKey): LocalizedText => rainbowMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: RainbowMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const rainbowSchema: BundleSchema = {
  id: RAINBOW_ID,
  label: text('label.title'),
  category: 'optics',
  operation: text('label.operation'),
  timeModel: 'periodic',
  parameters: [],
  stages: [
    {
      id: 'sunlit-drops',
      label: text('label.stage'),
      constants: {
        nmRed: NM_RED,
        nRed: N_RED,
        nmViolet: NM_VIOLET,
        nViolet: N_VIOLET,
        redDeg: RED_DEG,
        violetDeg: VIOLET_DEG,
        spreadGain: SPREAD_GAIN,
        dropRadius: DROP_RADIUS,
        rayCount: RAY_COUNT,
        skyDropCount: SKY_DROP_COUNT,
        seed: SEED,
        skyDistance: SKY_DISTANCE,
      },
    },
  ],
  environments: [],
  views: [{ id: 'drop-and-sky', label: text('label.view'), default: true }],

  /** 가로로 넓다 — 왼쪽 물방울 판, 오른쪽 하늘 판, 아래 캡션 줄. */
  canvas: { height: 440, minHeight: 360 },

  /**
   * scene 에 쓴 순서대로 그린다. 빛 없음 판(`region`, 기본 층 45)이 줄기(`trajectory`, 20) 위로
   * 올라와 덮으면 안 된다 — 판이 맨 아래, 줄기가 그 위, 글자가 가장 나중이다.
   */
  drawOrder: 'scene',

  /** 도착한 순간 이미 빨강 줄기가 물방울을 지나 42° 둘레에 몰려 있다 (S-piece). */
  startAt: 5.0,

  /**
   * 한 주기 19.8 초.
   *
   * - `enter` — 나란한 햇빛 줄기가 물방울 표면까지 자란다.
   * - `redPath` — 빨강 경로가 굴절 · 반사 · 굴절을 따라 자라 밖으로 나간다.
   * - `redMark` — 해 쪽 기준선에서 빨강이 몰린 방향까지 호가 쓸고 나가고 42° 눈금이 선다.
   * - `redHold` — 빨강 줄기 다발과 호가 머문다.
   * - `violetPath` — 보라 경로가 같은 길로 자란다.
   * - `violetMark` — 호 위에 40° 눈금이 선다.
   * - `violetHold` — 두 다발이 함께 머문다.
   * - `sky` — 오른쪽 하늘 판에 물방울 구름 · 눈 · 햇빛이 나타난다.
   * - `skyRays` — 42° 방울의 빨강, 40° 방울의 보라가 눈까지 자란다.
   * - `band` — 그 사이 높이의 방울들이 제 색으로 빛나고 색 선이 눈으로 모인다.
   * - `fade` — 모두 옅어진다. 다음 주기에 햇빛이 다시 들어온다.
   */
  timeline: {
    phases: [
      { id: 'enter', duration: 1.3, caption: key('caption.enter') },
      { id: 'redPath', duration: 2.2, ease: 'smooth', caption: key('caption.redPath') },
      { id: 'redMark', duration: 0.8, ease: 'smooth', caption: key('caption.redHold') },
      { id: 'redHold', duration: 2.4, caption: key('caption.redHold') },
      { id: 'violetPath', duration: 1.8, ease: 'smooth', caption: key('caption.violetPath') },
      { id: 'violetMark', duration: 0.8, ease: 'smooth', caption: key('caption.violetHold') },
      { id: 'violetHold', duration: 2.4, caption: key('caption.violetHold') },
      { id: 'sky', duration: 1.6, ease: 'smooth', caption: key('caption.sky') },
      { id: 'skyRays', duration: 2.4, ease: 'smooth', caption: key('caption.skyRays') },
      { id: 'band', duration: 3.0, ease: 'smooth', caption: key('caption.band') },
      { id: 'fade', duration: 1.1, ease: 'smooth', caption: key('caption.band') },
    ],
  },

  /** 슬롯 하나. 캡션 속 수는 스테이지 상수에서 `initialState` 가 만든 문자열이다 (G133 우회). */
  caption: {
    anchor: { screen: 'bottom-left', offset: [18, -6] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 640,
    style: { colorRole: 'ink', emphasis: 'strong' },
    vars: { r: 'redDegText', v: 'violetDegText' },
  },

  // 그리드 · 카메라 단추 · 제목 · 범례 · 조작기 없음(기본).

  messages: rainbowMessages,
};
