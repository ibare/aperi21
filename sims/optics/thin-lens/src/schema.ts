// ========================================================================
// thin-lens — 선언
// ========================================================================
// 질문: 볼록 렌즈가 만드는 상이 어디에 맺히는지를 어떻게 알아내는가.
//
// 답은 작도다. 물체 끝에서 나가는 수많은 빛 가운데 **가는 길이 미리 정해진 것
// 셋**이 있다 — 축에 평행하게 가는 것(렌즈를 지나 건너편 초점 F′ 로), 렌즈
// 한가운데로 가는 것(꺾이지 않는다), 앞쪽 초점 F 를 지나 가는 것(렌즈를 나오며
// 축에 평행해진다). 셋을 그으면 렌즈 뒤 한 점에서 만나고, **그 점이 상 끝**이다.
//
// 초점 거리를 바꾸면 상이 어디로 가는지는 형제 조각 `focal-length` 의 몫이라
// 여기서는 초점 거리도 물체 거리도 고정한다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:thin-lens` 와 문자 그대로 같아야 한다 (C4). 바꾸지 않는다. */
export const THIN_LENS_ID = 'thin-lens';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 초점 거리 f(m). 이 조각에서는 고정이다 — 바꾸는 것은 `focal-length` 의 몫. */
export const FOCAL_LENGTH = 1.2;
/**
 * 물체 거리 u(m). 초점 거리의 세 배 자리다 — 초점 바깥이라 상이 렌즈 뒤에
 * 실제로 맺히고(실상), 두 초점과 물체 · 상이 한 화면에 겹치지 않고 놓인다.
 */
export const OBJECT_DISTANCE = 3.6;
/** 물체 화살표의 높이(m). 광축 위로 선다. */
export const OBJECT_HEIGHT = 0.75;

// ------------------------------------------------------------------------
// 배치 — 월드 미터. 광축은 y = 0, 렌즈는 x = 0.
// ------------------------------------------------------------------------

/** 렌즈가 선 자리(월드 x). 광축 위 원점이다. */
export const LENS_X = 0;
/** 광축의 높이(월드 y). */
export const AXIS_Y = 0;
/**
 * 렌즈의 세로 길이(m). 축에 평행한 광선이 물체 높이(0.75)에서, 초점을 겨눈
 * 광선이 상 높이(−0.375)에서 렌즈에 닿는다 — 둘 다 렌즈 안으로 들어와야 작도가
 * 렌즈 밖에서 꺾이는 것으로 보이지 않는다. 더 키우면 렌즈가 세로를 다 먹어
 * 작도선의 기울기 차이가 눌린다.
 */
export const LENS_SIZE = 2.0;

/** 광축이 그려지는 구간(월드 x). 물체 왼쪽에서 광선 끝 오른쪽까지. */
export const AXIS_FROM_X = -4.0;
export const AXIS_TO_X = 2.9;

/**
 * 광선이 상을 지나 더 뻗는 자리(월드 x). 상에서 멈추면 「여기까지만 온다」 로
 * 읽혀 만남이 우연처럼 보인다. 더 가면 셋이 다시 벌어지므로 **만난 뒤 벌어지는
 * 것**까지 보인다. 여기를 더 늘리면 아래로 벌어진 광선이 렌즈 아래를 넘어간다.
 */
export const RAY_END_X = 2.6;

/** 초점 점 · 상 점의 반지름(m). 상 점이 초점 점보다 크다 — 이 그림의 결론이다. */
export const FOCUS_DOT_RADIUS = 0.045;
export const IMAGE_DOT_RADIUS = 0.07;

/**
 * 프레이밍은 주장의 일부다. 가로는 물체 왼쪽부터 광선이 벌어져 나가는 끝까지,
 * 세로는 렌즈 위아래 끝에 조금 여유를 준 만큼. 매 프레임 같은 값이다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: -4.2, maxX: 3.0, minY: -1.5, maxY: 1.35 } as const;

// ------------------------------------------------------------------------
// 시간표 — 한 주기에 작도가 한 번 선다
// ------------------------------------------------------------------------

/** 무대만 있는 동안(초) — 광축 · 렌즈 · 두 초점 · 물체. */
export const SETUP = 1.6;
/** 광선 하나가 자라는 동안(초). 가운데 광선은 꺾이지 않아 짧게 끝난다. */
export const DRAW_PARALLEL = 1.3;
export const DRAW_CENTER = 1.1;
export const DRAW_FOCAL = 1.3;
/** 만난 점이 찍히는 동안 · 상이 서는 동안 · 다 선 그림을 읽는 동안. */
export const MEET = 0.7;
export const RISE = 0.9;
export const HOLD = 2.8;
/** 광선이 물체 쪽으로 거둬지고 그림이 옅어지는 동안. */
export const FADE = 0.7;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const thinLensMessages = Object.freeze({
  'label.title': {
    ko: '얇은 렌즈',
    en: 'Thin lens',
    ja: '薄いレンズ',
    zh: '薄透镜',
    ar: 'العدسة الرقيقة',
    es: 'Lente delgada',
    fr: 'Lentille mince',
    hi: 'पतला लेंस',
    id: 'Lensa tipis',
    pt: 'Lente delgada',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '초점과 결상',
    en: 'Focal points and image formation',
    ja: '焦点と結像',
    zh: '焦点与成像',
    ar: 'البؤر وتكوّن الصورة',
    es: 'Focos y formación de imágenes',
    fr: 'Foyers et formation des images',
    hi: 'फोकस और प्रतिबिंब का बनना',
    id: 'Titik fokus dan pembentukan bayangan',
    pt: 'Focos e formação de imagens',
  },
  'label.stage': {
    ko: '볼록 렌즈',
    en: 'Converging lens',
    ja: '収束レンズ',
    zh: '会聚透镜',
    ar: 'عدسة مجمعة',
    es: 'Lente convergente',
    fr: 'Lentille convergente',
    hi: 'अभिसारी लेंस',
    id: 'Lensa konvergen',
    pt: 'Lente convergente',
  },
  'label.view': {
    ko: '광축',
    en: 'Optical axis',
    ja: '光軸',
    zh: '主光轴',
    ar: 'المحور البصري',
    es: 'Eje óptico',
    fr: 'Axe optique',
    hi: 'प्रकाशिक अक्ष',
    id: 'Sumbu optik',
    pt: 'Eixo óptico',
  },

  /** 초점 표식. 수식 기호라 번역 대상이 아니다 (C1 판정 3). */
  'label.focusNear': {
    ko: 'F',
    en: 'F',
    ja: 'F',
    zh: 'F',
    ar: 'F',
    es: 'F',
    fr: 'F',
    hi: 'F',
    id: 'F',
    pt: 'F',
  },
  'label.focusFar': {
    ko: 'F′',
    en: 'F′',
    ja: 'F′',
    zh: 'F′',
    ar: 'F′',
    es: 'F′',
    fr: 'F′',
    hi: 'F′',
    id: 'F′',
    pt: 'F′',
  },
  /** 도식 이름표. 어순 · 조사가 언어마다 달라지는 낱말이라 문안이다. */
  'label.object': {
    ko: '물체',
    en: 'Object',
    ja: '物体',
    zh: '物体',
    ar: 'الجسم',
    es: 'Objeto',
    fr: 'Objet',
    hi: 'वस्तु',
    id: 'Benda',
    pt: 'Objeto',
  },
  'label.image': {
    ko: '상',
    en: 'Image',
    ja: '像',
    zh: '像',
    ar: 'الصورة',
    es: 'Imagen',
    fr: 'Image',
    hi: 'प्रतिबिंब',
    id: 'Bayangan',
    pt: 'Imagem',
  },

  'caption.setup': {
    ko: '볼록 렌즈가 광축 위에 서고, 렌즈에서 같은 거리인 양쪽에 초점이 찍혀 있다',
    en: 'A converging lens stands on the optical axis, with a focus marked the same distance out on each side',
    ja: '収束レンズが光軸上に立ち、レンズから同じ距離の両側に焦点が記されている',
    zh: '会聚透镜立在主光轴上，透镜两侧等距处各标有一个焦点',
    ar: 'تقف عدسة مجمعة على المحور البصري، وعلى كل جانب منها بؤرة معلَّمة على البعد نفسه',
    es: 'Una lente convergente se alza sobre el eje óptico, con un foco marcado a la misma distancia a cada lado',
    fr: 'Une lentille convergente se dresse sur l’axe optique, avec un foyer marqué à la même distance de chaque côté',
    hi: 'एक अभिसारी लेंस प्रकाशिक अक्ष पर खड़ा है, और उसके दोनों ओर बराबर दूरी पर एक-एक फोकस अंकित है',
    id: 'Sebuah lensa konvergen berdiri di sumbu optik, dengan titik fokus ditandai pada jarak yang sama di tiap sisi',
    pt: 'Uma lente convergente fica sobre o eixo óptico, com um foco marcado à mesma distância de cada lado',
  },
  'caption.parallel': {
    ko: '물체 끝에서 축에 평행하게 간 광선이 렌즈에서 꺾여 건너편 초점 F′ 를 지난다',
    en: 'From the tip of the object, the ray that runs parallel to the axis bends at the lens and passes through the far focus F′',
    ja: '物体の先端から軸に平行に進んだ光線は、レンズで曲がって向こう側の焦点 F′ を通る',
    zh: '从物体顶端平行于主光轴射出的光线，在透镜处偏折，穿过另一侧的焦点 F′',
    ar: 'من طرف الجسم، ينكسر الشعاع الموازي للمحور عند العدسة ويمر بالبؤرة البعيدة F′',
    es: 'Desde la punta del objeto, el rayo que va paralelo al eje se desvía en la lente y pasa por el foco lejano F′',
    fr: 'Depuis le sommet de l’objet, le rayon parallèle à l’axe est dévié par la lentille et passe par le foyer éloigné F′',
    hi: 'वस्तु के सिरे से अक्ष के समांतर चली किरण लेंस पर मुड़कर दूसरी ओर के फोकस F′ से गुज़रती है',
    id: 'Dari ujung benda, sinar yang sejajar sumbu dibelokkan lensa dan melewati fokus seberang F′',
    pt: 'Da ponta do objeto, o raio que segue paralelo ao eixo se desvia na lente e passa pelo foco distante F′',
  },
  'caption.center': {
    ko: '렌즈 한가운데로 들어간 광선은 꺾이지 않고 곧게 지나간다',
    en: 'The ray that enters the middle of the lens goes straight on without bending',
    ja: 'レンズの真ん中に入った光線は、曲がらずにまっすぐ進む',
    zh: '射向透镜正中的光线不偏折，径直穿过',
    ar: 'الشعاع الذي يدخل منتصف العدسة يمضي مستقيمًا دون أن ينكسر',
    es: 'El rayo que entra por el centro de la lente sigue recto sin desviarse',
    fr: 'Le rayon qui entre au centre de la lentille continue tout droit sans être dévié',
    hi: 'लेंस के ठीक बीच से घुसी किरण बिना मुड़े सीधी निकल जाती है',
    id: 'Sinar yang masuk ke tengah lensa terus lurus tanpa dibelokkan',
    pt: 'O raio que entra pelo centro da lente segue reto sem se desviar',
  },
  'caption.focal': {
    ko: '앞쪽 초점 F 를 지나 온 광선은 렌즈를 나오며 축에 평행해진다',
    en: 'The ray that comes in through the near focus F leaves the lens running parallel to the axis',
    ja: '手前の焦点 F を通ってきた光線は、レンズを出ると軸に平行になる',
    zh: '经过近侧焦点 F 射来的光线，射出透镜后平行于主光轴',
    ar: 'الشعاع الآتي عبر البؤرة القريبة F يخرج من العدسة موازيًا للمحور',
    es: 'El rayo que llega pasando por el foco cercano F sale de la lente paralelo al eje',
    fr: 'Le rayon qui arrive en passant par le foyer proche F ressort de la lentille parallèle à l’axe',
    hi: 'पास वाले फोकस F से होकर आई किरण लेंस से निकलकर अक्ष के समांतर चलती है',
    id: 'Sinar yang datang melalui fokus dekat F keluar dari lensa sejajar sumbu',
    pt: 'O raio que chega passando pelo foco próximo F sai da lente paralelo ao eixo',
  },
  'caption.meet': {
    ko: '셋이 렌즈 뒤 한 점에서 만났다',
    en: 'The three rays have met at a single point behind the lens',
    ja: '三本の光線がレンズの後ろの一点で出会った',
    zh: '三条光线在透镜后方交于一点',
    ar: 'التقت الأشعة الثلاثة في نقطة واحدة خلف العدسة',
    es: 'Los tres rayos se han encontrado en un solo punto detrás de la lente',
    fr: 'Les trois rayons se sont rejoints en un seul point derrière la lentille',
    hi: 'तीनों किरणें लेंस के पीछे एक ही बिंदु पर मिल गईं',
    id: 'Ketiga sinar bertemu di satu titik di belakang lensa',
    pt: 'Os três raios se encontraram num único ponto atrás da lente',
  },
  'caption.rise': {
    ko: '만난 그 점까지 상이 거꾸로 선다',
    en: 'The image stands upside down, reaching exactly that meeting point',
    ja: '倒立した像が立ち上がり、ちょうどその出会った点まで届く',
    zh: '像倒立起来，恰好到达那个交点',
    ar: 'تقف الصورة مقلوبة، وتصل تمامًا إلى نقطة الالتقاء تلك',
    es: 'La imagen se forma invertida y llega justo hasta ese punto de encuentro',
    fr: 'L’image se dresse renversée et atteint exactement ce point de rencontre',
    hi: 'प्रतिबिंब उल्टा खड़ा होता है और ठीक उस मिलन बिंदु तक पहुँचता है',
    id: 'Bayangan berdiri terbalik, tepat mencapai titik pertemuan itu',
    pt: 'A imagem se forma invertida e chega exatamente a esse ponto de encontro',
  },
  'caption.hold': {
    ko: '세 광선이 모두 상 끝을 지난다',
    en: 'All three rays pass through the tip of the image',
    ja: '三本の光線がすべて像の先端を通る',
    zh: '三条光线都经过像的顶端',
    ar: 'تمر الأشعة الثلاثة كلها بطرف الصورة',
    es: 'Los tres rayos pasan por la punta de la imagen',
    fr: 'Les trois rayons passent tous par le sommet de l’image',
    hi: 'तीनों किरणें प्रतिबिंब के सिरे से गुज़रती हैं',
    id: 'Ketiga sinar melewati ujung bayangan',
    pt: 'Os três raios passam pela ponta da imagem',
  },
} satisfies Record<string, LocalizedText>);

export type ThinLensMessageKey = keyof typeof thinLensMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: ThinLensMessageKey): LocalizedText => thinLensMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ThinLensMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const thinLensSchema: BundleSchema = {
  id: THIN_LENS_ID,
  label: text('label.title'),
  category: 'optics',
  description: text('label.description'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 바로 작도가 그어지고, 상이 서고, 다시 처음부터 선다.
  parameters: [],

  stages: [
    {
      id: 'converging-lens',
      label: text('label.stage'),
      constants: {
        focalLength: FOCAL_LENGTH,
        objectDistance: OBJECT_DISTANCE,
        objectHeight: OBJECT_HEIGHT,
      },
    },
  ],

  environments: [],

  views: [{ id: 'axis', label: text('label.view'), default: true }],

  /**
   * 가로 7.2 m 를 담아야 하고 세로는 렌즈 하나 높이뿐이다. 세로를 더 주면 가로가
   * 먼저 차서 작도선의 기울기 차이가 뭉개진다 (S-piece — 세로가 비싸다).
   */
  canvas: { height: 360, minHeight: 320 },

  /**
   * 겹침이 판정 장치다. 광선은 렌즈 **위**로 지나가야 렌즈를 통과하는 것으로
   * 읽히고, 상 점은 광선 위에 찍혀야 「셋이 여기서 만났다」 가 된다. 층 순서로는
   * `ray` 가 가장 위라 세 광선이 상 점 · 이름표를 덮는다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 무대 → 평행 광선 → 가운데 광선 → 초점 광선 → 만남 → 상 → 멈춤 → 거둠.
   *
   * 광선을 한 번에 셋 다 그으면 「선 셋이 우연히 겹쳤다」 로 보인다. 하나씩
   * 그어야 각 광선이 **어디를 지나기로 정해져 있는지**를 캡션이 짚을 수 있고,
   * 셋째가 앞 둘과 같은 점에 닿는 순간이 이 조각의 결론이 된다.
   */
  timeline: {
    phases: [
      { id: 'setup', duration: SETUP, caption: key('caption.setup') },
      {
        id: 'draw-parallel',
        duration: DRAW_PARALLEL,
        ease: 'smooth',
        caption: key('caption.parallel'),
      },
      {
        id: 'draw-center',
        duration: DRAW_CENTER,
        ease: 'smooth',
        caption: key('caption.center'),
      },
      {
        id: 'draw-focal',
        duration: DRAW_FOCAL,
        ease: 'smooth',
        caption: key('caption.focal'),
      },
      { id: 'meet', duration: MEET, caption: key('caption.meet') },
      { id: 'rise', duration: RISE, ease: 'smooth', caption: key('caption.rise') },
      { id: 'hold', duration: HOLD, caption: key('caption.hold') },
      // 거두는 동안은 직전 멈춤의 캡션을 이어 쓴다 — 짧은 전환 단계에 다음 주기의
      // 일을 미리 걸지 않는다 (S-piece).
      { id: 'fade', duration: FADE, caption: key('caption.hold') },
    ],
  },

  /**
   * 도착한 순간 작도가 이미 서 있다 — 세 광선과 상 화살표 · 상 점이 모두 그려진
   * 멈춤(`hold`) 안에서 연다. 0 이면 빈 광축이 먼저 보이고, 상이 뜨기까지 7 초를
   * 기다려야 한다. 쌓는 상태가 없어 `preroll` 은 쓰지 않는다.
   */
  startAt: 8.0,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 렌즈 공식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  // 그리드 · 카메라 단추 없음(기본값). 잴 것이 거리가 아니라 **만나는 자리**다.

  messages: thinLensMessages,
};
