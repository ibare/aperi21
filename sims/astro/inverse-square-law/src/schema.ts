// ========================================================================
// inverse-square-law — 선언
// ========================================================================
// 질문: 빛 · 중력 · 소리가 모두 「거리의 제곱」 으로 옅어지는 것은 왜인가.
//
// 한 점에서 알갱이가 한꺼번에 모든 방향으로 고르게 나가 부푸는 구껍질이 된다.
// 알갱이 수는 줄지 않는데 구면의 넓이가 반지름의 제곱으로 커지므로, 크기가 고정된
// 창 하나에 드는 몫은 거리 2배 · 3배에서 1/2² · 1/3² 이 된다. 이 조각은 빛도 중력도
// 아닌 **퍼짐 자체** 에 머문다.
//
// 정면에서 본 구껍질이다 — 원 단면(2차원)에서 선을 세면 둘레가 r 로만 커져 1/r 이
// 되므로 거짓 그림이 된다. 구면 위 고른 분포를 정사영해 창 안 알갱이를 센다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:inverse-square-law` 와 문자 그대로 일치한다 (C4). */
export const INVERSE_SQUARE_LAW_ID = 'inverse-square-law';

// ------------------------------------------------------------------------
// 물리 · 배치 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 기준 거리 r 의 월드 길이. 구껍질이 처음 멈추는 반지름이다. */
export const RADIUS = 1;
/** 둘째 · 셋째로 멈추는 거리 — r 의 몇 배인가. 화면의 `2r` · `1/2²` 이 이 값 그대로다. */
export const MULTIPLE_2 = 2;
export const MULTIPLE_3 = 3;
/**
 * 알갱이 격자 간격. 단위 구를 램버트 등면적 평면에 편 좌표에서의 간격이라, 알갱이
 * 하나가 맡는 구면 넓이가 모든 자리에서 (간격 × 반지름)² 로 같다 — 「고르게 나간다」 가
 * 분포로 참이다. 2/15 이면 앞 반구에 349 개가 놓인다.
 */
export const LATTICE_STEP = 0.1333;
/**
 * 고정 창의 한 변 — 기준 거리 r 에 대한 비. 반지름 r 에서 창 안에 6 × 6 알갱이가 들도록
 * 격자 간격의 5.8 배로 잡았다(격자를 ¼ 칸 엇놓아 r · 2r · 3r 어느 거리에서도 창 경계에
 * 걸치는 알갱이가 없다 — 최소 여유 0.19 칸, 수치로 확인).
 */
export const WINDOW_SIDE = 0.773;

/**
 * 프레이밍은 주장의 일부다. 가장 큰 구껍질(3r)이 통째로 들어가고, 아래에 캡션 두 줄이
 * 앉을 자리를 남긴다. 매 프레임 같은 값이다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: -3.5, maxX: 3.5, minY: -3.6, maxY: 3.1 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const inverseSquareLawMessages = Object.freeze({
  'label.title': {
    ko: '역제곱 법칙',
    en: 'Inverse-square law',
    ja: '逆二乗の法則',
    zh: '平方反比定律',
    ar: 'قانون التربيع العكسي',
    es: 'Ley del inverso del cuadrado',
    fr: 'Loi de l’inverse du carré',
    hi: 'व्युत्क्रम वर्ग नियम',
    id: 'Hukum kuadrat terbalik',
    pt: 'Lei do inverso do quadrado',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '퍼지는 만큼 옅어지는 것',
    en: 'Thinning out as it spreads',
    ja: '広がるほど薄まる',
    zh: '越扩散越稀薄',
    ar: 'يخفّ كلما انتشر',
    es: 'Se diluye a medida que se extiende',
    fr: 'Se diluer en s’étalant',
    hi: 'फैलने के साथ विरल होता',
    id: 'Makin menyebar, makin tipis',
    pt: 'Fica mais rarefeito à medida que se espalha',
  },
  'label.stage': {
    ko: '부푸는 구껍질',
    en: 'Expanding shell',
    ja: '膨らむ球殻',
    zh: '膨胀的球壳',
    ar: 'قشرة كروية تتمدد',
    es: 'Cáscara esférica en expansión',
    fr: 'Coquille sphérique en expansion',
    hi: 'फैलता गोलीय कोश',
    id: 'Kulit bola yang mengembang',
    pt: 'Casca esférica em expansão',
  },
  'label.view': {
    ko: '정면',
    en: 'Front view',
    ja: '正面図',
    zh: '正视图',
    ar: 'منظر أمامي',
    es: 'Vista frontal',
    fr: 'Vue de face',
    hi: 'सामने का दृश्य',
    id: 'Tampak depan',
    pt: 'Vista frontal',
  },
  /** 구껍질 반지름 이름표. 수식 표기라 번역 대상이 아니다 (C1 판정 3). */
  'label.radiusBase': {
    ko: 'r',
    en: 'r',
    ja: 'r',
    zh: 'r',
    ar: 'r',
    es: 'r',
    fr: 'r',
    hi: 'r',
    id: 'r',
    pt: 'r',
  },
  'label.radiusScaled': {
    ko: '{n}r',
    en: '{n}r',
    ja: '{n}r',
    zh: '{n}r',
    ar: '{n}r',
    es: '{n}r',
    fr: '{n}r',
    hi: '{n}r',
    id: '{n}r',
    pt: '{n}r',
  },
  /** 창에 드는 몫. 기준 거리의 몫을 1 로 둔 비 — 수식 표기다. */
  'label.shareBase': {
    ko: '1',
    en: '1',
    ja: '1',
    zh: '1',
    ar: '1',
    es: '1',
    fr: '1',
    hi: '1',
    id: '1',
    pt: '1',
  },
  'label.shareScaled': {
    ko: '1/{n}²',
    en: '1/{n}²',
    ja: '1/{n}²',
    zh: '1/{n}²',
    ar: '1/{n}²',
    es: '1/{n}²',
    fr: '1/{n}²',
    hi: '1/{n}²',
    id: '1/{n}²',
    pt: '1/{n}²',
  },
  'caption.burst': {
    ko: '한 점에서 알갱이가 한꺼번에 모든 방향으로 고르게 퍼져 나간다',
    en: 'From a single point, grains fly out evenly in every direction at once',
    ja: '一点から粒が一斉にあらゆる方向へ均等に飛び出す',
    zh: '颗粒从一点同时向各个方向均匀飞出',
    ar: 'من نقطة واحدة تنطلق الحبيبات دفعة واحدة بالتساوي في كل الاتجاهات',
    es: 'Desde un solo punto, los granos salen a la vez y por igual en todas las direcciones',
    fr: 'D’un seul point, des grains jaillissent tous à la fois, également dans toutes les directions',
    hi: 'एक ही बिंदु से कण एक साथ हर दिशा में समान रूप से बाहर निकलते हैं',
    id: 'Dari satu titik, butir-butir melesat serentak merata ke segala arah',
    pt: 'De um único ponto, grãos saem de uma vez, por igual, em todas as direções',
  },
  'caption.base': {
    ko: '거리 r — 네모 창에 든 알갱이(강조색)가 기준이다',
    en: 'At distance r — the grains inside the square window (highlighted) are the baseline',
    ja: '距離 r — 四角い窓に入った粒(強調色)が基準だ',
    zh: '距离 r — 方形窗口内的颗粒（高亮）是基准',
    ar: 'عند المسافة r — الحبيبات داخل النافذة المربعة (المميّزة) هي المرجع',
    es: 'A la distancia r — los granos dentro de la ventana cuadrada (resaltados) son la referencia',
    fr: 'À la distance r — les grains dans la fenêtre carrée (en surbrillance) servent de référence',
    hi: 'दूरी r पर — वर्गाकार खिड़की के भीतर के कण (उभारे गए) आधार हैं',
    id: 'Pada jarak r — butir di dalam jendela persegi (disorot) menjadi acuan',
    pt: 'Na distância r — os grãos dentro da janela quadrada (destacados) são a referência',
  },
  'caption.spread': {
    ko: '같은 알갱이들이 더 큰 구면으로 펼쳐진다 — 하나도 늘거나 줄지 않는다',
    en: 'The same grains spread over a larger sphere — not one is added or lost',
    ja: '同じ粒がより大きな球面に広がる — 1個も増えも減りもしない',
    zh: '同样的颗粒铺展到更大的球面上 — 一个也没有增加或减少',
    ar: 'تنتشر الحبيبات نفسها على كرة أكبر — لا تزيد واحدة ولا تنقص',
    es: 'Los mismos granos se reparten sobre una esfera mayor — no se añade ni se pierde ninguno',
    fr: 'Les mêmes grains s’étalent sur une sphère plus grande — aucun n’est ajouté ni perdu',
    hi: 'वही कण एक बड़े गोले पर फैल जाते हैं — एक भी न बढ़ता है, न घटता है',
    id: 'Butir yang sama menyebar ke bola yang lebih besar — tak satu pun bertambah atau hilang',
    pt: 'Os mesmos grãos se espalham por uma esfera maior — nenhum é acrescentado ou perdido',
  },
  'caption.far2': {
    ko: '거리 {m2}배 — 창 하나에 들던 알갱이가 {m2}²배 넓이로 퍼져, 같은 창에는 1/{m2}² 만 남는다',
    en: 'At {m2}× the distance — the grains of one window now cover {m2}² times the area; the same window keeps only 1/{m2}²',
    ja: '距離 {m2}× — 窓1つ分の粒が{m2}²倍の面積に広がり、同じ窓には 1/{m2}² だけが残る',
    zh: '距离 {m2}× — 原来一个窗口的颗粒铺满 {m2}² 倍的面积，同一个窗口里只剩 1/{m2}²',
    ar: 'عند {m2}× المسافة — حبيبات نافذة واحدة تغطي الآن مساحة أكبر {m2}² مرة، ولا يبقى في النافذة نفسها إلا 1/{m2}²',
    es: 'A {m2}× la distancia — los granos de una ventana cubren ahora {m2}² veces el área; en la misma ventana queda solo 1/{m2}²',
    fr: 'À {m2}× la distance — les grains d’une fenêtre couvrent maintenant {m2}² fois l’aire ; la même fenêtre n’en garde que 1/{m2}²',
    hi: '{m2}× दूरी पर — एक खिड़की के कण अब {m2}² गुना क्षेत्रफल पर फैले हैं; उसी खिड़की में केवल 1/{m2}² बचता है',
    id: 'Pada {m2}× jarak — butir satu jendela kini menutupi {m2}² kali luasnya; jendela yang sama hanya menyisakan 1/{m2}²',
    pt: 'A {m2}× a distância — os grãos de uma janela agora cobrem {m2}² vezes a área; a mesma janela fica só com 1/{m2}²',
  },
  'caption.far3': {
    ko: '거리 {m3}배 — 알갱이 수는 그대로인데 구면이 넓어져, 같은 창에는 1/{m3}² 만 남는다',
    en: 'At {m3}× the distance — the number of grains is unchanged, but the sphere is wider; the same window keeps only 1/{m3}²',
    ja: '距離 {m3}× — 粒の数は変わらないが球面が広がり、同じ窓には 1/{m3}² だけが残る',
    zh: '距离 {m3}× — 颗粒数不变，但球面更大了，同一个窗口里只剩 1/{m3}²',
    ar: 'عند {m3}× المسافة — عدد الحبيبات لم يتغير لكن الكرة أوسع، ولا يبقى في النافذة نفسها إلا 1/{m3}²',
    es: 'A {m3}× la distancia — el número de granos no cambia, pero la esfera es más amplia; en la misma ventana queda solo 1/{m3}²',
    fr: 'À {m3}× la distance — le nombre de grains est inchangé, mais la sphère est plus large ; la même fenêtre n’en garde que 1/{m3}²',
    hi: '{m3}× दूरी पर — कणों की संख्या वही है, पर गोला बड़ा हो गया है; उसी खिड़की में केवल 1/{m3}² बचता है',
    id: 'Pada {m3}× jarak — jumlah butir tetap, tetapi bolanya lebih luas; jendela yang sama hanya menyisakan 1/{m3}²',
    pt: 'A {m3}× a distância — o número de grãos não muda, mas a esfera é mais ampla; a mesma janela fica só com 1/{m3}²',
  },
} satisfies Record<string, LocalizedText>);

export type InverseSquareLawMessageKey = keyof typeof inverseSquareLawMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: InverseSquareLawMessageKey): LocalizedText => inverseSquareLawMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: InverseSquareLawMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const inverseSquareLawSchema: BundleSchema = {
  id: INVERSE_SQUARE_LAW_ID,
  label: text('label.title'),
  category: 'astro',
  description: text('label.description'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 이미 퍼지는 중이고, r · 2r · 3r 에서 차례로 멈춘다.
  parameters: [],

  stages: [
    {
      id: 'expanding-shell',
      label: text('label.stage'),
      constants: {
        radius: RADIUS,
        multiple2: MULTIPLE_2,
        multiple3: MULTIPLE_3,
        latticeStep: LATTICE_STEP,
        windowSide: WINDOW_SIDE,
      },
    },
  ],

  environments: [],

  views: [{ id: 'front', label: text('label.view'), default: true }],

  /**
   * 그림이 원판 하나(3r)라 가로보다 세로가 정한다. 3r 에서 알갱이 간격이 창 안 넷을
   * 세기에 넉넉하고, r 에서 36 개가 뭉개지지 않을 만큼 — 한 r 이 화면 50 px 남짓.
   * 420 에서는 r 원판이 지름 100 px 라 창 안 알갱이 간격이 6 px 로 붙었다(첫 촬영).
   */
  canvas: { height: 440, minHeight: 360 },

  /**
   * 겹침이 판정 장치다. 창 테두리는 알갱이 **위** 로 지나가야 어느 알갱이가 안이고 밖인지
   * 읽히고, 지나온 둘레는 알갱이 아래로 깔려야 한다. 층 순서로는 `trajectory`(20)가
   * 입자보다 먼저라 창이 알갱이에 덮인다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 퍼짐 → r 에서 멈춤 → 퍼짐 → 2r → 퍼짐 → 3r → 흐려짐.
   *
   * 퍼지는 단계는 `linear` 이다 — 알갱이는 한결같은 빠르기로 나간다. 멈춤은 셈을 위한
   * 연출이고, 멈추는 동안 알갱이 수 · 자리는 그대로다.
   */
  timeline: {
    phases: [
      { id: 'grow1', duration: 1.4, caption: key('caption.burst') },
      { id: 'hold1', duration: 2.6, caption: key('caption.base') },
      { id: 'grow2', duration: 1.4, caption: key('caption.spread') },
      { id: 'hold2', duration: 3.4, caption: key('caption.far2') },
      { id: 'grow3', duration: 1.4, caption: key('caption.spread') },
      { id: 'hold3', duration: 3.6, caption: key('caption.far3') },
      { id: 'fade', duration: 0.7, caption: key('caption.far3') },
    ],
  },

  /**
   * 도착한 순간 이미 진행 중이다 — 알갱이가 점에서 막 퍼져 나가 원판이 자라는 자리에서
   * 연다. 0 이면 점 하나만 있는 빈 화면이 먼저 보인다.
   */
  startAt: 0.6,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 법칙의 식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 620,
    fade: 0.25,
    style: { colorRole: 'muted', emphasis: 'strong' },
    // 캡션에 끼우는 배수는 스테이지 상수 그대로다 — state 에 글자로 옮겨 둔다 (장부 G133).
    vars: { m2: 'multiple2', m3: 'multiple3' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것은 미터가 아니라 **r 의 몇 배인가** 와 **창 안
   * 알갱이 수** 라서, 거리 격자 대신 지나온 구껍질 둘레와 r · 2r · 3r 이름표만 둔다.
   */

  messages: inverseSquareLawMessages,
};
