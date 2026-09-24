// ========================================================================
// focal-length — 선언
// ========================================================================
// 질문: 물체도 렌즈도 그대로인데 상이 맺히는 자리를 정하는 것은 무엇인가.
//
// 답: 렌즈의 초점 거리다. 물체를 같은 자리에 못박아 둔 채 초점 거리만 줄이면
// 초점 표식 F 가 렌즈 쪽으로 다가오고 상도 함께 다가오며, 다시 늘리면 F 와 상이
// 함께 물러난다. 물체 거리 괄호는 한 번도 길이가 바뀌지 않는다.
//
// 이웃과 겹치지 않게 —
//   `magnification`             물체를 옮기는 것은 그쪽 몫이다. 여기서 물체는 고정이다.
//   `thin-lens`                 세 표준 광선으로 상 자리를 작도하는 것은 그쪽 몫이다.
//                               여기 줄기는 둘뿐이고 주장은 작도가 아니라 F 와 상의 함께 움직임이다.
//   `converging-diverging-lens` 평행광과 두 렌즈의 대비는 그쪽 몫이다. 여기는 볼록 렌즈 하나다.
//   `lens-combination`          렌즈를 붙여 초점 거리를 바꾸는 것은 그쪽 몫이고 물체 · 상이 없다.
//   `human-eye-accommodation`   수정체를 두껍게 해 초점 거리를 줄이는 것은 그쪽 몫이다.
//                               여기 렌즈 그림은 변하지 않고 F 표식만 움직인다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:focal-length` 와 문자 그대로 같아야 한다 (C4). 바꾸지 않는다. */
export const FOCAL_LENGTH_ID = 'focal-length';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 월드 한 칸 = 1 cm.
// ------------------------------------------------------------------------

/** 긴 초점 거리(cm) — 한 주기의 처음과 끝. 화면 글자 `{f} cm` 가 이 값을 그대로 쓴다. */
export const FOCAL_LONG = 12;
/** 짧은 초점 거리(cm) — 가운데 멈춤. 화면 글자가 이 값을 그대로 쓴다. */
export const FOCAL_SHORT = 6;
/** 물체가 렌즈에서 떨어진 거리(cm). **한 주기 내내 바뀌지 않는다** — 주장의 전제다. */
export const OBJECT_DISTANCE = 24;
/** 물체(화살표)의 높이(cm). */
export const OBJECT_HEIGHT = 7;

// ------------------------------------------------------------------------
// 배치 — 월드 cm. 렌즈는 x = 0, 광축은 y = 0 이다.
// ------------------------------------------------------------------------

/** 렌즈 높이(cm). 물체 끝에서 나란히 오는 줄기(높이 = 물체 높이)보다 넉넉하다. */
export const LENS_SIZE = 18;
/** 광축 보조선의 왼쪽 · 오른쪽 끝(cm). */
export const AXIS_FROM_X = -28;
export const AXIS_TO_X = 29;
/** 물체 거리 · 상 거리 괄호가 놓이는 높이(cm). 렌즈 꼭대기보다 위. */
export const DISTANCE_BRACKET_Y = 12.5;
/** 초점 거리 괄호가 놓이는 높이(cm). 축 아래 — 위쪽 두 괄호와 갈라 놓는다. */
export const FOCUS_BRACKET_Y = -12.5;
/** 초점 점의 반지름(cm). */
export const FOCUS_DOT_RADIUS = 0.45;
/** 줄기가 상 끝을 지나 더 뻗는 길이(cm). 두 줄기가 상 끝에서 만나는 것이 보이게 한다. */
export const RAY_TAIL = 4;

/**
 * 프레이밍 — 가로는 광축 왼쪽 끝부터 가장 먼 상 너머 줄기 끝까지, 세로는 위쪽 괄호 글자부터
 * 아래쪽 초점 거리 글자와 캡션 한 줄까지. 매 프레임 같은 값이다 (S-piece · 원칙 6).
 */
export const SCENE_BOUNDS = { minX: -29, maxX: 30, minY: -17.5, maxY: 14.5 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

/** 화면에 뜨는 모든 문자는 여기를 지난다 (C1). en 은 원본이지 번역이 아니다. */
export const focalLengthMessages = Object.freeze({
  'label.title': {
    ko: '초점 거리',
    en: 'Focal length',
    ja: '焦点距離',
    zh: '焦距',
    ar: 'البعد البؤري',
    es: 'Distancia focal',
    fr: 'Distance focale',
    hi: 'फोकस दूरी',
    id: 'Jarak fokus',
    pt: 'Distância focal',
  },
  'label.operation': {
    ko: '상이 맺히는 자리를 정하는 것',
    en: 'What decides where the image forms',
    ja: '像ができる位置を決めるもの',
    zh: '决定成像位置的因素',
    ar: 'ما يحدد موضع تكوّن الصورة',
    es: 'Lo que decide dónde se forma la imagen',
    fr: 'Ce qui décide où se forme l’image',
    hi: 'जो तय करता है कि प्रतिबिंब कहाँ बनता है',
    id: 'Yang menentukan letak terbentuknya bayangan',
    pt: 'O que decide onde a imagem se forma',
  },
  'label.stage': {
    ko: '초점 거리가 오가는 볼록 렌즈',
    en: 'A converging lens whose focal length changes',
    ja: '焦点距離が変わる凸レンズ',
    zh: '焦距变化的会聚透镜',
    ar: 'عدسة لامّة يتغير بعدها البؤري',
    es: 'Una lente convergente cuya distancia focal cambia',
    fr: 'Une lentille convergente dont la distance focale varie',
    hi: 'बदलती फोकस दूरी वाला अभिसारी लेंस',
    id: 'Lensa cembung yang jarak fokusnya berubah',
    pt: 'Uma lente convergente cuja distância focal muda',
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

  /** 괄호 이름. 값이 아니라 무엇을 재는지를 말한다. */
  'label.objectDistance': {
    ko: '물체 거리',
    en: 'object distance',
    ja: '物体距離',
    zh: '物距',
    ar: 'بعد الجسم',
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
    ar: 'بعد الصورة',
    es: 'distancia de la imagen',
    fr: 'distance de l’image',
    hi: 'प्रतिबिंब दूरी',
    id: 'jarak bayangan',
    pt: 'distância da imagem',
  },
  'label.focalDistance': {
    ko: '초점 거리',
    en: 'focal length',
    ja: '焦点距離',
    zh: '焦距',
    ar: 'البعد البؤري',
    es: 'distancia focal',
    fr: 'distance focale',
    hi: 'फोकस दूरी',
    id: 'jarak fokus',
    pt: 'distância focal',
  },
  /** 초점 표식 — 기호라 두 언어가 같다 (C1 판정 3). */
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
  /** 초점 거리 글자. 값은 선언한 정박값이고 단위는 문안 틀이 갖는다 (C1). */
  'label.focalValue': {
    ko: '{f} cm',
    en: '{f} cm',
    ja: '{f} cm',
    zh: '{f} cm',
    ar: '{f} cm',
    es: '{f} cm',
    fr: '{f} cm',
    hi: '{f} cm',
    id: '{f} cm',
    pt: '{f} cm',
  },

  'caption.long': {
    ko: '초점 거리가 {fLong} cm 다 — 초점 표식 F 가 렌즈에서 멀고, 상도 렌즈에서 멀리 서 있다.',
    en: 'The focal length is {fLong} cm — the marks F sit far from the lens, and so does the image.',
    ja: '焦点距離は{fLong} cm — 焦点の印Fはレンズから遠く、像もレンズから遠くにある。',
    zh: '焦距为 {fLong} cm——焦点标记 F 离透镜很远，像也离透镜很远。',
    ar: 'البعد البؤري {fLong} cm — علامتا F بعيدتان عن العدسة، وكذلك الصورة.',
    es: 'La distancia focal es {fLong} cm — las marcas F quedan lejos de la lente, y la imagen también.',
    fr: 'La distance focale vaut {fLong} cm — les repères F sont loin de la lentille, et l’image aussi.',
    hi: 'फोकस दूरी {fLong} cm है — F के चिह्न लेंस से दूर हैं, और प्रतिबिंब भी।',
    id: 'Jarak fokusnya {fLong} cm — tanda F jauh dari lensa, begitu pula bayangannya.',
    pt: 'A distância focal é {fLong} cm — as marcas F ficam longe da lente, e a imagem também.',
  },
  'caption.shorten': {
    ko: '물체는 그 자리에 둔 채 초점 거리만 줄인다 — F 가 렌즈 쪽으로 다가오고 상도 함께 다가온다.',
    en: 'The object stays where it is while the focal length shrinks — F moves toward the lens and the image comes in with it.',
    ja: '物体はその場に置いたまま焦点距離だけが縮む — Fがレンズに近づき、像も一緒に近づく。',
    zh: '物体留在原处，只有焦距变短——F 向透镜靠近，像也随之靠近。',
    ar: 'يبقى الجسم في مكانه بينما يقصر البعد البؤري — تقترب F من العدسة وتقترب الصورة معها.',
    es: 'El objeto se queda donde está mientras la distancia focal se acorta — F se acerca a la lente y la imagen se acerca con ella.',
    fr: 'L’objet reste en place tandis que la distance focale diminue — F se rapproche de la lentille et l’image avec elle.',
    hi: 'वस्तु अपनी जगह रहती है और फोकस दूरी घटती है — F लेंस की ओर आता है और प्रतिबिंब भी साथ में पास आता है।',
    id: 'Benda tetap di tempatnya sementara jarak fokus mengecil — F mendekati lensa dan bayangan ikut mendekat.',
    pt: 'O objeto fica onde está enquanto a distância focal diminui — F se aproxima da lente e a imagem vem junto.',
  },
  'caption.short': {
    ko: '초점 거리가 {fShort} cm 다 — 물체 거리 괄호는 그대로인데 상 거리 괄호가 훨씬 짧다.',
    en: 'The focal length is {fShort} cm — the object-distance bracket is unchanged while the image-distance bracket is much shorter.',
    ja: '焦点距離は{fShort} cm — 物体距離の括弧はそのままなのに、像距離の括弧はずっと短い。',
    zh: '焦距为 {fShort} cm——物距括线不变，像距括线却短了很多。',
    ar: 'البعد البؤري {fShort} cm — قوس بعد الجسم لم يتغير، أما قوس بعد الصورة فأقصر بكثير.',
    es: 'La distancia focal es {fShort} cm — el corchete de la distancia del objeto no cambia, pero el de la distancia de la imagen es mucho más corto.',
    fr: 'La distance focale vaut {fShort} cm — l’accolade de la distance de l’objet n’a pas changé, mais celle de la distance de l’image est bien plus courte.',
    hi: 'फोकस दूरी {fShort} cm है — वस्तु दूरी का कोष्ठक वैसा ही है, पर प्रतिबिंब दूरी का कोष्ठक बहुत छोटा है।',
    id: 'Jarak fokusnya {fShort} cm — kurung jarak benda tidak berubah, sedangkan kurung jarak bayangan jauh lebih pendek.',
    pt: 'A distância focal é {fShort} cm — o colchete da distância do objeto não muda, mas o da distância da imagem fica bem mais curto.',
  },
  'caption.lengthen': {
    ko: '초점 거리를 다시 늘린다 — F 가 물러나고 상도 함께 렌즈에서 멀어진다.',
    en: 'The focal length grows again — F retreats and the image moves away from the lens with it.',
    ja: '焦点距離が再び伸びる — Fが遠ざかり、像も一緒にレンズから離れる。',
    zh: '焦距再次变长——F 退远，像也随之远离透镜。',
    ar: 'يطول البعد البؤري من جديد — تتراجع F وتبتعد الصورة معها عن العدسة.',
    es: 'La distancia focal vuelve a crecer — F se aleja y la imagen se aparta de la lente con ella.',
    fr: 'La distance focale augmente de nouveau — F recule et l’image s’éloigne de la lentille avec elle.',
    hi: 'फोकस दूरी फिर बढ़ती है — F पीछे हटता है और प्रतिबिंब भी साथ में लेंस से दूर जाता है।',
    id: 'Jarak fokus membesar lagi — F menjauh dan bayangan ikut menjauhi lensa.',
    pt: 'A distância focal volta a crescer — F se afasta e a imagem se distancia da lente junto.',
  },
} satisfies Record<string, LocalizedText>);

export type FocalLengthMessageKey = keyof typeof focalLengthMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: FocalLengthMessageKey): LocalizedText => focalLengthMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: FocalLengthMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const focalLengthSchema: BundleSchema = {
  id: FOCAL_LENGTH_ID,
  label: text('label.title'),
  category: 'optics',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다. 시간표가 초점 거리를 두 정박값 사이로 오가게 한다 (controllers.ts).
  parameters: [],

  stages: [
    {
      id: 'changing-focal-length',
      label: text('label.stage'),
      constants: {
        focalLong: FOCAL_LONG,
        focalShort: FOCAL_SHORT,
        objectDistance: OBJECT_DISTANCE,
        objectHeight: OBJECT_HEIGHT,
      },
    },
  ],

  environments: [],

  views: [{ id: 'object-and-image', label: text('label.view'), default: true }],

  /** 가로로 넓은 한 줄 그림 — 물체 · 렌즈 · 상이 광축 하나에 늘어선다. */
  canvas: { height: 400, minHeight: 350 },

  /**
   * 축 → 렌즈 → 괄호 → 초점 → 줄기 → 화살표 → 글자 순. plugin 어휘(`ray` · `opticalElement`)가
   * 층에서 어디 끼는지에 기대지 않게 scene 순서로 고정한다 — 줄기가 렌즈 위로, 화살표가 줄기 위로.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = [긴 초점 거리에 멈춤] → 줄임 → [짧은 초점 거리에 멈춤] → 늘림.
   *
   * 지금 초점 거리는 `shorten` · `lengthen` 진행도의 합으로 읽는다(`physics.ts`). 멈춤마다
   * 초점 거리 글자가 `show-*` 에서 나타나 `hide-*` 에서 사라진다 — 값이 움직이는 동안에는
   * 뜨지 않는다. 전환 단계는 직전 멈춤의 캡션을 이어 쓴다 (S-piece).
   */
  timeline: {
    phases: [
      { id: 'show-long', duration: 0.35, ease: 'smooth', caption: key('caption.long') },
      { id: 'hold-long', duration: 2.8, caption: key('caption.long') },
      { id: 'hide-long', duration: 0.3, ease: 'smooth', caption: key('caption.long') },
      { id: 'shorten', duration: 2.2, ease: 'smooth', caption: key('caption.shorten') },
      { id: 'show-short', duration: 0.35, ease: 'smooth', caption: key('caption.short') },
      { id: 'hold-short', duration: 2.8, caption: key('caption.short') },
      { id: 'hide-short', duration: 0.3, ease: 'smooth', caption: key('caption.short') },
      { id: 'lengthen', duration: 2.2, ease: 'smooth', caption: key('caption.lengthen') },
    ],
  },

  /** 도착한 순간 물체 · 렌즈 · 초점 · 상 · 괄호가 서 있고 초점 거리 글자가 떠 있다 — 긴 초점 거리 멈춤 안에서 연다 (S-piece). */
  startAt: 1.5,

  /**
   * 슬롯 하나. 그림 아래 가운데. 멈춤 캡션이 그 자리의 초점 거리 정박값을 말한다 — `{fLong}` ·
   * `{fShort}` 는 state 의 글자를 가리킨다(G133 우회, `state.ts`). 값을 문안에 박지 않는다.
   */
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -6] },
    align: 'center',
    fontSize: 14,
    wrapWidth: 780,
    style: { colorRole: 'ink', emphasis: 'strong' },
    fade: 0.25,
    vars: { fLong: 'fLong', fShort: 'fShort' },
  },

  // 그리드 · 카메라 단추 · 범례 · 제목 없음(기본). 잴 것은 괄호 길이의 견줌이지 눈금이 아니다.

  messages: focalLengthMessages,
};
