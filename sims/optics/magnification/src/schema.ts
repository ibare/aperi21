// ========================================================================
// magnification — 선언
// ========================================================================
// 질문: 볼록 렌즈 앞의 물체를 옮기면 상의 크기는 어떻게 바뀌는가.
//
// 답: 물체를 렌즈에서 먼 자리(3f)에서 초점 쪽(2f → 1.5f)으로 다가가게 하면, 상은 렌즈에서
// 멀어지며(1.5f → 2f → 3f) 커진다. 물체 거리 괄호와 상 거리 괄호가 서로 길이를 바꾸는 동안
// 상 크기 괄호가 물체 크기 괄호의 절반 → 같음 → 두 배로 자란다.
//
// 세 광선 풀이 과정은 `ray-tracing` 의 몫이라 줄기는 두 개만 긋는다. 평행광 · 초점은
// `converging-diverging-lens` 의 몫이다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:magnification` 와 문자 그대로 일치한다 (C4). */
export const MAGNIFICATION_ID = 'magnification';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 볼록 렌즈의 초점 거리(월드). */
export const FOCAL_LENGTH = 1.1;
/** 물체(화살표)의 높이(월드). */
export const OBJECT_HEIGHT = 0.7;
/** 세 멈춤 자리의 물체 거리 — 초점 거리의 몇 배인가. 먼 자리 · 가운데 · 가까운 자리. */
export const FAR_FACTOR = 3;
export const MID_FACTOR = 2;
export const NEAR_FACTOR = 1.5;
/**
 * 세 멈춤 자리의 배율 정박값 — 화면 글자 `×{m}` 과 캡션이 이 값을 그대로 쓴다.
 * 그림의 상 크기는 `findImage` 가 계산하고, 이 값과 같아야 한다는 관계는 NOTES (c) G143.
 */
export const FAR_MAG = 0.5;
export const MID_MAG = 1;
export const NEAR_MAG = 2;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 렌즈는 x = 0, 광축은 y = 0 이다.
// ------------------------------------------------------------------------

/** 렌즈 높이(월드). 물체 끝에서 나란히 가는 줄기(높이 = 물체 높이)보다 넉넉하다. */
export const LENS_SIZE = 2.0;
/** 광축 보조선의 왼쪽 · 오른쪽 끝(월드). */
export const AXIS_FROM_X = -3.8;
export const AXIS_TO_X = 4.0;
/** 거리 괄호 두 개가 놓이는 높이(월드). 물체 끝보다 위. */
export const DISTANCE_BRACKET_Y = 1.2;
/** 크기 괄호가 물체 · 상 화살표 옆으로 떨어진 거리(월드). 물체는 왼쪽, 상은 오른쪽. */
export const SIZE_BRACKET_GAP = 0.2;
/** 줄기가 상 끝을 지나 더 뻗는 길이(월드). 상 끝에서 줄기가 만나는 것이 보이게 한다. */
export const RAY_TAIL = 0.55;
/** 초점 점의 반지름(월드). */
export const FOCUS_DOT_RADIUS = 0.05;

/**
 * 프레이밍 — 가로는 가장 먼 물체의 크기 괄호부터 가장 먼 상의 줄기 끝까지, 세로는 거리 괄호
 * 글자부터 가장 큰 상 아래 배율 글자와 캡션 한 줄까지. 매 프레임 같은 값이다 (S-piece · 원칙 6).
 */
export const SCENE_BOUNDS = { minX: -3.95, maxX: 4.15, minY: -2.55, maxY: 1.6 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const magnificationMessages = Object.freeze({
  'label.title': {
    ko: '배율',
    en: 'Magnification',
    ja: '倍率',
    zh: '放大率',
    ar: 'التكبير',
    es: 'Aumento',
    fr: 'Grandissement',
    hi: 'आवर्धन',
    id: 'Perbesaran',
    pt: 'Ampliação',
  },
  'label.operation': {
    ko: '상의 크기와 물체의 크기',
    en: 'The size of the image and the size of the object',
    ja: '像の大きさと物体の大きさ',
    zh: '像的大小与物体的大小',
    ar: 'حجم الصورة وحجم الجسم',
    es: 'El tamaño de la imagen y el tamaño del objeto',
    fr: 'La taille de l’image et la taille de l’objet',
    hi: 'प्रतिबिंब का आकार और वस्तु का आकार',
    id: 'Ukuran bayangan dan ukuran benda',
    pt: 'O tamanho da imagem e o tamanho do objeto',
  },
  'label.stage': {
    ko: '볼록 렌즈 앞 세 자리',
    en: 'Three spots before a converging lens',
    ja: '収束レンズの前の三つの位置',
    zh: '会聚透镜前的三个位置',
    ar: 'ثلاثة مواضع أمام عدسة مجمِّعة',
    es: 'Tres posiciones ante una lente convergente',
    fr: 'Trois positions devant une lentille convergente',
    hi: 'अभिसारी लेंस के सामने तीन स्थान',
    id: 'Tiga posisi di depan lensa konvergen',
    pt: 'Três posições diante de uma lente convergente',
  },
  'label.view': {
    ko: '물체와 상',
    en: 'Object and image',
    ja: '物体と像',
    zh: '物体与像',
    ar: 'الجسم والصورة',
    es: 'Objeto e imagen',
    fr: 'Objet et image',
    hi: 'वस्तु और प्रतिबिंब',
    id: 'Benda dan bayangan',
    pt: 'Objeto e imagem',
  },

  /** 도식 이름표. */
  'label.objectDistance': {
    ko: '물체 거리',
    en: 'object distance',
    ja: '物体距離',
    zh: '物距',
    ar: 'بُعد الجسم',
    es: 'distancia del objeto',
    fr: 'distance de l’objet',
    hi: 'वस्तु दूरी',
    id: 'jarak benda',
    pt: 'distância do objeto',
  },
  'label.imageDistance': {
    ko: '상 거리',
    en: 'image distance',
    ja: '像距離',
    zh: '像距',
    ar: 'بُعد الصورة',
    es: 'distancia de la imagen',
    fr: 'distance de l’image',
    hi: 'प्रतिबिंब दूरी',
    id: 'jarak bayangan',
    pt: 'distância da imagem',
  },
  /** 초점 표식 — 기호라 두 언어가 같다. */
  'label.focus': {
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
  /** 배율 글자. 값은 선언한 정박값이다. */
  'label.magnification': {
    ko: '×{m}',
    en: '×{m}',
    ja: '×{m}',
    zh: '×{m}',
    ar: '×{m}',
    es: '×{m}',
    fr: '×{m}',
    hi: '×{m}',
    id: '×{m}',
    pt: '×{m}',
  },

  'caption.far': {

    ko: '물체가 렌즈에서 멀다 — 상 거리 괄호가 더 짧고, 상의 크기는 물체의 {m1}배다.',

    en: 'The object is far from the lens — the image-distance bracket is shorter, and the image is {m1}× the size of the object.',

    ja: '物体はレンズから遠い — 像距離の括弧のほうが短く、像の大きさは物体の {m1}×。',

    zh: '物体离透镜远——像距括号更短，像的大小是物体的 {m1}×。',

    ar: 'الجسم بعيد عن العدسة — قوس بُعد الصورة أقصر، والصورة {m1}× حجم الجسم.',

    es: 'El objeto está lejos de la lente — el corchete de la distancia de la imagen es más corto, y la imagen mide {m1}× el tamaño del objeto.',

    fr: 'L’objet est loin de la lentille — le crochet de la distance de l’image est plus court, et l’image fait {m1}× la taille de l’objet.',

    hi: 'वस्तु लेंस से दूर है — प्रतिबिंब दूरी का कोष्ठक छोटा है, और प्रतिबिंब वस्तु के आकार का {m1}× है।',

    id: 'Benda jauh dari lensa — kurung jarak bayangan lebih pendek, dan ukuran bayangan {m1}× ukuran benda.',

    pt: 'O objeto está longe da lente — o colchete da distância da imagem é mais curto, e a imagem tem {m1}× o tamanho do objeto.',

  },
  'caption.approach': {
    ko: '물체가 렌즈 쪽으로 다가간다 — 상은 렌즈에서 멀어지며 커진다.',
    en: 'The object moves toward the lens — the image moves away from it and grows.',
    ja: '物体がレンズに近づく — 像はレンズから遠ざかりながら大きくなる。',
    zh: '物体向透镜靠近——像远离透镜并变大。',
    ar: 'يقترب الجسم من العدسة — فتبتعد الصورة عنها وتكبر.',
    es: 'El objeto se acerca a la lente — la imagen se aleja de ella y crece.',
    fr: 'L’objet s’approche de la lentille — l’image s’en éloigne et grandit.',
    hi: 'वस्तु लेंस की ओर बढ़ती है — प्रतिबिंब लेंस से दूर जाता है और बड़ा होता है।',
    id: 'Benda bergerak mendekati lensa — bayangan menjauhi lensa dan membesar.',
    pt: 'O objeto se aproxima da lente — a imagem se afasta dela e cresce.',
  },
  'caption.equal': {
    ko: '두 거리 괄호의 길이가 같다 — 상의 크기는 물체의 {m2}배다.',
    en: 'The two distance brackets are the same length — the image is {m2}× the size of the object.',
    ja: '二つの距離の括弧が同じ長さ — 像の大きさは物体の {m2}×。',
    zh: '两段距离括号一样长——像的大小是物体的 {m2}×。',
    ar: 'قوسا المسافتين بالطول نفسه — والصورة {m2}× حجم الجسم.',
    es: 'Los dos corchetes de distancia tienen la misma longitud — la imagen mide {m2}× el tamaño del objeto.',
    fr: 'Les deux crochets de distance ont la même longueur — l’image fait {m2}× la taille de l’objet.',
    hi: 'दोनों दूरी-कोष्ठक बराबर लंबे हैं — प्रतिबिंब वस्तु के आकार का {m2}× है।',
    id: 'Kedua kurung jarak sama panjang — ukuran bayangan {m2}× ukuran benda.',
    pt: 'Os dois colchetes de distância têm o mesmo comprimento — a imagem tem {m2}× o tamanho do objeto.',
  },
  'caption.near': {
    ko: '물체가 초점 가까이 왔다 — 상 거리 괄호가 더 길고, 상의 크기는 물체의 {m3}배다.',
    en: 'The object is close to the focal point — the image-distance bracket is longer, and the image is {m3}× the size of the object.',
    ja: '物体が焦点の近くに来た — 像距離の括弧のほうが長く、像の大きさは物体の {m3}×。',
    zh: '物体靠近焦点——像距括号更长，像的大小是物体的 {m3}×。',
    ar: 'الجسم قريب من البؤرة — قوس بُعد الصورة أطول، والصورة {m3}× حجم الجسم.',
    es: 'El objeto está cerca del foco — el corchete de la distancia de la imagen es más largo, y la imagen mide {m3}× el tamaño del objeto.',
    fr: 'L’objet est près du foyer — le crochet de la distance de l’image est plus long, et l’image fait {m3}× la taille de l’objet.',
    hi: 'वस्तु फोकस के पास है — प्रतिबिंब दूरी का कोष्ठक लंबा है, और प्रतिबिंब वस्तु के आकार का {m3}× है।',
    id: 'Benda dekat titik fokus — kurung jarak bayangan lebih panjang, dan ukuran bayangan {m3}× ukuran benda.',
    pt: 'O objeto está perto do foco — o colchete da distância da imagem é mais longo, e a imagem tem {m3}× o tamanho do objeto.',
  },
  'caption.return': {
    ko: '물체가 처음 자리로 돌아간다.',
    en: 'The object goes back to where it started.',
    ja: '物体が最初の位置に戻る。',
    zh: '物体回到起始位置。',
    ar: 'يعود الجسم إلى موضعه الأول.',
    es: 'El objeto vuelve a su posición inicial.',
    fr: 'L’objet revient à sa position de départ.',
    hi: 'वस्तु अपनी शुरुआती जगह पर लौट आती है।',
    id: 'Benda kembali ke posisi awalnya.',
    pt: 'O objeto volta à posição inicial.',
  },
} satisfies Record<string, LocalizedText>);

export type MagnificationMessageKey = keyof typeof magnificationMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: MagnificationMessageKey): LocalizedText => magnificationMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: MagnificationMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const magnificationSchema: BundleSchema = {
  id: MAGNIFICATION_ID,
  label: text('label.title'),
  category: 'optics',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다. 물체를 세 자리로 옮기는 것을 자동 진행으로 보인다 (controllers.ts).
  parameters: [],

  stages: [
    {
      id: 'three-spots',
      label: text('label.stage'),
      constants: {
        focalLength: FOCAL_LENGTH,
        objectHeight: OBJECT_HEIGHT,
        farFactor: FAR_FACTOR,
        midFactor: MID_FACTOR,
        nearFactor: NEAR_FACTOR,
        farMag: FAR_MAG,
        midMag: MID_MAG,
        nearMag: NEAR_MAG,
      },
    },
  ],

  environments: [],

  views: [{ id: 'object-and-image', label: text('label.view'), default: true }],

  /** 가로로 넓은 한 줄 그림 — 물체 · 렌즈 · 상이 광축 하나에 늘어선다. */
  canvas: { height: 420, minHeight: 360 },

  /**
   * 축 → 렌즈 → 괄호 → 줄기 → 화살표 → 글자 순. plugin 어휘(`ray` · `opticalElement`)가 층에서
   * 어디 끼는지에 기대지 않게 scene 순서로 고정한다 — 줄기가 렌즈 위로, 화살표가 줄기 위로 온다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = [먼 자리 → 가운데 → 가까운 자리] 멈춤과 옮김, 그리고 처음 자리로 돌아감.
   *
   * 물체의 x 는 `move-12` · `move-23` · `return` 진행도의 합으로 읽는다(`physics.ts`). 멈춤마다
   * 배율 글자는 `show-*` 에서 나타나 `hide-*` 에서 사라진다 — 물체가 움직이는 동안에는 뜨지 않는다.
   */
  timeline: {
    phases: [
      { id: 'show-1', duration: 0.4, ease: 'smooth', caption: key('caption.far') },
      { id: 'hold-1', duration: 2.8, caption: key('caption.far') },
      { id: 'hide-1', duration: 0.3, ease: 'smooth', caption: key('caption.far') },
      { id: 'move-12', duration: 1.8, ease: 'smooth', caption: key('caption.approach') },
      { id: 'show-2', duration: 0.4, ease: 'smooth', caption: key('caption.equal') },
      { id: 'hold-2', duration: 2.8, caption: key('caption.equal') },
      { id: 'hide-2', duration: 0.3, ease: 'smooth', caption: key('caption.equal') },
      { id: 'move-23', duration: 1.8, ease: 'smooth', caption: key('caption.approach') },
      { id: 'show-3', duration: 0.4, ease: 'smooth', caption: key('caption.near') },
      { id: 'hold-3', duration: 3.0, caption: key('caption.near') },
      { id: 'hide-3', duration: 0.3, ease: 'smooth', caption: key('caption.near') },
      { id: 'return', duration: 1.6, ease: 'smooth', caption: key('caption.return') },
    ],
  },

  /** 도착한 순간 물체 · 상 · 줄기 · 괄호가 서 있고 배율 글자가 떠 있다 — 먼 자리 멈춤 안에서 연다 (S-piece). */
  startAt: 1.2,

  /**
   * 슬롯 하나. 그림 아래 가운데. 멈춤마다 캡션이 그 자리의 배율 정박값을 말한다 — `{m1}` ·
   * `{m2}` · `{m3}` 는 state 의 글자를 가리킨다(G133 우회, `state.ts`). `vars` 는 state 경로만
   * 가리키고 `step` 은 시간표를 받지 않으므로, 멈춤마다 이름을 따로 두어 캡션 틀이 고른다.
   */
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -6] },
    align: 'center',
    fontSize: 14,
    wrapWidth: 760,
    style: { colorRole: 'ink', emphasis: 'strong' },
    fade: 0.25,
    vars: { m1: 'farMag', m2: 'midMag', m3: 'nearMag' },
  },

  // 그리드 · 카메라 단추 · 범례 · 제목 없음(기본). 잴 것은 괄호 길이의 견줌이지 눈금이 아니다.

  messages: magnificationMessages,
};
