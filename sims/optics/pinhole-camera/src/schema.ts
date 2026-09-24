// ========================================================================
// pinhole-camera — 선언
// ========================================================================
// 질문: 바늘구멍을 키우면 상은 어떻게 되는가.
//
// 어두운 방에 촛불이 있고, 앞벽에 구멍 하나 뚫린 상자가 그 빛을 받는다. 촛불 위 점
// (불꽃)과 아래 점(밑동)에서 나간 곧은 줄기는 구멍에서 엇갈려 뒷벽에 거꾸로 선 상을
// 만든다. 구멍을 넓히면 한 점의 빛이 뒷벽에서 점이 아니라 조각으로 번지고(흐려짐),
// 구멍을 지나는 줄기가 늘어 상이 밝아진다. 밝아지는 대신 흐려진다.
//
// 회절 한계는 다루지 않는다 — 곧은 줄기의 기하만 있다.
// 이웃 `rectilinear-propagation` 은 가림판 · 그림자다. 여기는 구멍 · 상이다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:pinhole-camera` 와 문자 그대로 일치한다 (C4). */
export const PINHOLE_CAMERA_ID = 'pinhole-camera';

// ------------------------------------------------------------------------
// 물리 · 표시 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 촛불의 x(월드). 구멍에서 촛불까지 = 물체 거리. */
export const OBJECT_X = -4.4;
/** 촛불의 위 점(불꽃 중심)과 아래 점(밑동) 높이. */
export const FLAME_Y = 0.95;
export const BASE_Y = -1.3;
/** 초 몸통의 반폭 · 윗면 높이, 불꽃 반지름. */
export const CANDLE_HALF_WIDTH = 0.45;
export const CANDLE_TOP_Y = 0.6;
export const FLAME_R = 0.26;
/** 앞벽(구멍)의 x 와 구멍 가운데 높이. */
export const PINHOLE_X = 0;
export const PINHOLE_Y = 0;
/** 뒷벽 앞면의 x. 구멍에서 뒷벽까지 = 상거리. */
export const WALL_X = 3;
/** 상자의 반높이 — 앞벽 · 뒷벽이 이만큼 위아래로 선다. */
export const BOX_HALF = 1.8;
/** 구멍 폭 목록 — 작은 · 중간 · 큰 구멍. */
export const HOLE_SMALL = 0.05;
export const HOLE_MID = 0.22;
export const HOLE_LARGE = 0.5;
/** 한 점에서 앞벽 쪽으로 고르게 내보내는 줄기 수와, 줄기가 겨누는 앞벽 위 · 아래 범위(구멍 가운데에서). */
export const RAY_COUNT = 13;
export const AIM_HALF = 0.6;
/**
 * 뒷벽에서 본 상의 밝기 — 큰 구멍일 때 불꽃 상의 빛 세기와, 구멍 폭에 대한 지수.
 * 지수 1 은 옆모습 줄기 수(구멍 폭에 비례)와 맞춘 값이다. 둥근 구멍의 실제 빛은 넓이(지수 2)를 따른다 (NOTES (b)).
 */
export const IMAGE_LIGHT = 1;
export const LIGHT_POWER = 1;
/** 초 몸통의 빛 세기 — 불꽃(1)에 비친 몸통. 상의 몸통도 이 몫으로 밝다. */
export const CANDLE_LIGHT = 0.55;

// ------------------------------------------------------------------------
// 배치 — 월드. y 위.
// ------------------------------------------------------------------------

/** 어두운 방의 왼쪽 · 위 · 아래 경계. 오른쪽 경계는 뒷벽 뒷면이다. */
export const ROOM = { minX: -5.2, minY: -2.1, maxY: 2.1 } as const;
/** 앞벽 · 뒷벽 두께. */
export const FRONT_THICK = 0.1;
export const WALL_THICK = 0.14;
/** 뒷벽을 정면에서 본 판의 가운데 x 와 반폭. 높이는 상자와 같다. */
export const FACE_X = 5.3;
export const FACE_HALF = 1.2;
/** 들어오는 빛 막대의 가운데 x 와 반폭. 높이는 상자와 같다. */
export const BAR_X = 7.05;
export const BAR_HALF = 0.16;
/** 방 아래 이름표 줄의 높이. */
export const NAME_Y = -2.4;
/** 뒷벽 뒤(방 밖) 흐림 폭 괄호를 뒷벽에서 띄운 거리. */
export const DIM_GAP = 0.22;

/**
 * 프레이밍은 주장의 일부다. 방 + 괄호 + 정면 판 + 막대 + 아래 이름표 · 캡션 줄.
 * 매 프레임 같은 값이다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: -5.3, maxX: 7.6, minY: -3.2, maxY: 2.2 } as const;

// ------------------------------------------------------------------------
// 시간표
// ------------------------------------------------------------------------

/** 구멍 폭 하나에 머무는 동안 · 넓히는 동안 · 다시 좁히는 동안(초). */
export const HOLD = 3.2;
export const WIDEN = 1.4;
export const SHRINK = 1.6;
/** 도착한 순간 이미 상이 맺혀 있다 — 첫 머무름 단계 안에서 연다. */
export const START_AT = 1.2;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const pinholeCameraMessages = Object.freeze({
  'label.title': {
    ko: '바늘구멍 사진기',
    en: 'Pinhole camera',
    ja: 'ピンホールカメラ',
    zh: '针孔相机',
    ar: 'الكاميرا ذات الثقب',
    es: 'Cámara estenopeica',
    fr: 'Sténopé',
    hi: 'सूचिछिद्र कैमरा',
    id: 'Kamera lubang jarum',
    pt: 'Câmara escura de orifício',
  },
  'label.operation': {
    ko: '구멍 하나가 만드는 상',
    en: 'The image made by a single hole',
    ja: '一つの穴がつくる像',
    zh: '一个小孔形成的像',
    ar: 'الصورة التي يكوّنها ثقب واحد',
    es: 'La imagen que forma un solo orificio',
    fr: 'L’image formée par un seul trou',
    hi: 'एक ही छिद्र से बना प्रतिबिंब',
    id: 'Bayangan yang dibentuk oleh satu lubang',
    pt: 'A imagem formada por um único orifício',
  },
  'label.stage': {
    ko: '촛불 · 바늘구멍 · 뒷벽',
    en: 'Candle, pinhole, back wall',
    ja: 'ろうそく、ピンホール、奥の壁',
    zh: '蜡烛、小孔、后壁',
    ar: 'شمعة، ثقب، جدار خلفي',
    es: 'Vela, orificio, pared del fondo',
    fr: 'Bougie, sténopé, paroi du fond',
    hi: 'मोमबत्ती, सूचिछिद्र, पिछली दीवार',
    id: 'Lilin, lubang jarum, dinding belakang',
    pt: 'Vela, orifício, parede do fundo',
  },
  'label.view': {
    ko: '옆에서 본 모습',
    en: 'Side view',
    ja: '側面図',
    zh: '侧视图',
    ar: 'منظر جانبي',
    es: 'Vista lateral',
    fr: 'Vue de côté',
    hi: 'पार्श्व दृश्य',
    id: 'Tampak samping',
    pt: 'Vista lateral',
  },
  'label.candle': {
    ko: '촛불',
    en: 'candle',
    ja: 'ろうそく',
    zh: '蜡烛',
    ar: 'الشمعة',
    es: 'vela',
    fr: 'bougie',
    hi: 'मोमबत्ती',
    id: 'lilin',
    pt: 'vela',
  },
  'label.pinhole': {
    ko: '바늘구멍',
    en: 'pinhole',
    ja: 'ピンホール',
    zh: '小孔',
    ar: 'الثقب',
    es: 'orificio',
    fr: 'sténopé',
    hi: 'सूचिछिद्र',
    id: 'lubang jarum',
    pt: 'orifício',
  },
  'label.wall': {
    ko: '뒷벽',
    en: 'back wall',
    ja: '奥の壁',
    zh: '后壁',
    ar: 'الجدار الخلفي',
    es: 'pared del fondo',
    fr: 'paroi du fond',
    hi: 'पिछली दीवार',
    id: 'dinding belakang',
    pt: 'parede do fundo',
  },
  'label.face': {
    ko: '뒷벽에 맺힌 상',
    en: 'image on the wall',
    ja: '壁に映った像',
    zh: '壁上的像',
    ar: 'الصورة على الجدار',
    es: 'imagen en la pared',
    fr: 'image sur la paroi',
    hi: 'दीवार पर प्रतिबिंब',
    id: 'bayangan di dinding',
    pt: 'imagem na parede',
  },
  'label.bar': {
    ko: '들어오는 빛',
    en: 'light in',
    ja: '入る光',
    zh: '进入的光',
    ar: 'الضوء الداخل',
    es: 'luz que entra',
    fr: 'lumière entrante',
    hi: 'आने वाला प्रकाश',
    id: 'cahaya masuk',
    pt: 'luz que entra',
  },
  'caption.small': {
    ko: '작은 구멍 — 촛불의 한 점이 뒷벽의 한 점에 맺혀, 상은 거꾸로 서서 또렷하지만 어둡다',
    en: 'A tiny hole — each point of the candle lands on one spot of the wall; the image is upside down, sharp, but dim',
    ja: 'ごく小さな穴 — ろうそくの各点は壁の一点に届き、像は倒立し、くっきりしているが暗い',
    zh: '很小的孔——蜡烛上的每个点都落在壁上的一个点，像是倒立的、清晰的，但很暗',
    ar: 'ثقب صغير جدًا — كل نقطة من الشمعة تقع على بقعة واحدة من الجدار؛ الصورة مقلوبة وحادة لكنها باهتة',
    es: 'Un orificio diminuto — cada punto de la vela cae en un solo lugar de la pared; la imagen está invertida, nítida, pero tenue',
    fr: 'Un trou minuscule — chaque point de la bougie arrive en un seul endroit de la paroi ; l’image est renversée, nette, mais sombre',
    hi: 'बहुत छोटा छिद्र — मोमबत्ती का हर बिंदु दीवार के एक ही स्थान पर पड़ता है; प्रतिबिंब उल्टा और स्पष्ट है, पर मंद',
    id: 'Lubang yang sangat kecil — setiap titik lilin jatuh di satu tempat pada dinding; bayangannya terbalik, tajam, tetapi redup',
    pt: 'Um orifício minúsculo — cada ponto da vela cai em um só lugar da parede; a imagem fica invertida, nítida, mas fraca',
  },
  'caption.widen': {
    ko: '구멍을 넓힌다',
    en: 'The hole widens',
    ja: '穴が広がる',
    zh: '孔变大',
    ar: 'يتّسع الثقب',
    es: 'El orificio se agranda',
    fr: 'Le trou s’élargit',
    hi: 'छिद्र चौड़ा होता है',
    id: 'Lubang melebar',
    pt: 'O orifício se alarga',
  },
  'caption.mid': {
    ko: '줄기가 더 들어와 상이 밝아졌고, 한 점의 빛이 뒷벽에서 조각으로 번졌다',
    en: 'More rays get in and the image is brighter — but each point now spreads into a patch on the wall',
    ja: '入る光線が増えて像は明るくなった — だが各点は壁の上で斑点に広がる',
    zh: '进来的光线更多，像更亮了——但每个点现在在壁上散成一小片',
    ar: 'تدخل أشعة أكثر فتصبح الصورة أسطع — لكن كل نقطة تنتشر الآن في بقعة على الجدار',
    es: 'Entran más rayos y la imagen es más brillante — pero cada punto se extiende ahora en una mancha sobre la pared',
    fr: 'Plus de rayons entrent et l’image est plus lumineuse — mais chaque point s’étale maintenant en une tache sur la paroi',
    hi: 'अधिक किरणें भीतर आती हैं और प्रतिबिंब अधिक चमकीला है — पर हर बिंदु अब दीवार पर एक धब्बे में फैल जाता है',
    id: 'Lebih banyak sinar masuk dan bayangan lebih terang — tetapi setiap titik kini menyebar menjadi bercak di dinding',
    pt: 'Entram mais raios e a imagem fica mais clara — mas cada ponto agora se espalha numa mancha na parede',
  },
  'caption.widenMore': {
    ko: '구멍을 더 넓힌다',
    en: 'The hole widens further',
    ja: '穴がさらに広がる',
    zh: '孔再变大',
    ar: 'يتّسع الثقب أكثر',
    es: 'El orificio se agranda aún más',
    fr: 'Le trou s’élargit encore',
    hi: 'छिद्र और चौड़ा होता है',
    id: 'Lubang makin melebar',
    pt: 'O orifício se alarga ainda mais',
  },
  'caption.large': {
    ko: '상은 가장 밝지만 번진 조각이 넓어져 촛불의 윤곽이 흐려졌다',
    en: 'The image is brightest now, but the patches are so wide that the candle’s outline blurs',
    ja: '像はいちばん明るいが、斑点が広がりすぎてろうそくの輪郭がぼやける',
    zh: '像此时最亮，但光斑太大，蜡烛的轮廓模糊了',
    ar: 'الصورة الآن في أسطع حالاتها، لكن البقع اتسعت حتى صار محيط الشمعة ضبابيًا',
    es: 'La imagen es ahora la más brillante, pero las manchas son tan anchas que el contorno de la vela se difumina',
    fr: 'L’image est maintenant la plus lumineuse, mais les taches sont si larges que le contour de la bougie devient flou',
    hi: 'प्रतिबिंब अब सबसे चमकीला है, पर धब्बे इतने चौड़े हैं कि मोमबत्ती की रूपरेखा धुंधली हो जाती है',
    id: 'Bayangan kini paling terang, tetapi bercaknya begitu lebar sehingga garis bentuk lilin menjadi kabur',
    pt: 'A imagem está no máximo de brilho, mas as manchas são tão largas que o contorno da vela fica borrado',
  },
  'caption.shrink': {
    ko: '구멍을 다시 좁힌다',
    en: 'The hole narrows again',
    ja: '穴が再び狭まる',
    zh: '孔又变小',
    ar: 'يضيق الثقب من جديد',
    es: 'El orificio se estrecha de nuevo',
    fr: 'Le trou se resserre',
    hi: 'छिद्र फिर संकरा होता है',
    id: 'Lubang menyempit lagi',
    pt: 'O orifício se estreita de novo',
  },
} satisfies Record<string, LocalizedText>);

export type PinholeCameraMessageKey = keyof typeof pinholeCameraMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: PinholeCameraMessageKey): LocalizedText => pinholeCameraMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: PinholeCameraMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const pinholeCameraSchema: BundleSchema = {
  id: PINHOLE_CAMERA_ID,
  label: text('label.title'),
  category: 'optics',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 구멍이 작은 → 중간 → 큰 폭으로 넓어졌다가 돌아온다.
  parameters: [],

  stages: [
    {
      id: 'candle',
      label: text('label.stage'),
      constants: {
        objectX: OBJECT_X,
        flameY: FLAME_Y,
        baseY: BASE_Y,
        candleHalfWidth: CANDLE_HALF_WIDTH,
        candleTopY: CANDLE_TOP_Y,
        flameR: FLAME_R,
        pinholeX: PINHOLE_X,
        pinholeY: PINHOLE_Y,
        wallX: WALL_X,
        boxHalf: BOX_HALF,
        holeSmall: HOLE_SMALL,
        holeMid: HOLE_MID,
        holeLarge: HOLE_LARGE,
        rayCount: RAY_COUNT,
        aimHalf: AIM_HALF,
        imageLight: IMAGE_LIGHT,
        lightPower: LIGHT_POWER,
        candleLight: CANDLE_LIGHT,
      },
    },
  ],

  environments: [],

  views: [{ id: 'side', label: text('label.view'), default: true }],

  /** 가로로 넓고 세로로 좁다 — 촛불 · 상자 · 정면 판을 한 줄로 늘어놓는다 (S-piece — 세로가 비싸다). */
  canvas: { height: 360, minHeight: 320 },

  /**
   * 겹침이 판정 장치다. 빛 없음 방 → 줄기 → 벽 · 촛불 → 뒷벽 조각 → 정면 판의 상 순서로 얹는다.
   * 층 순서로는 `region`(방)이 줄기 위로 올라와 가린다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 작은 구멍 → 넓히기 → 중간 → 더 넓히기 → 큰 구멍 → 좁히기. 넓히는 동안 구멍 폭이
   * `smooth` 로 움직이고 줄기 · 뒷벽 조각 · 상 · 막대가 그 폭을 따른다.
   */
  timeline: {
    phases: [
      { id: 'small', duration: HOLD, caption: key('caption.small') },
      { id: 'widen', duration: WIDEN, ease: 'smooth', caption: key('caption.widen') },
      { id: 'mid', duration: HOLD, caption: key('caption.mid') },
      { id: 'widen-more', duration: WIDEN, ease: 'smooth', caption: key('caption.widenMore') },
      { id: 'large', duration: HOLD, caption: key('caption.large') },
      { id: 'shrink', duration: SHRINK, ease: 'smooth', caption: key('caption.shrink') },
    ],
  },

  startAt: START_AT,

  // 슬롯 하나. 방 아래 테마 바탕 위에 둔다 — 빛 없음 방 위에서는 라이트 테마의 먹색 글자가 묻힌다.
  caption: {
    anchor: { screen: 'bottom-left', offset: [12, -8] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 680,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  // 그리드 · 카메라 단추 없음(기본값). 흐림은 괄호와 정면 판이, 밝기는 막대와 상의 빛이 말한다.

  messages: pinholeCameraMessages,
};
