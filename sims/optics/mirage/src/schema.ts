// ========================================================================
// mirage — 선언
// ========================================================================
// 질문: 뜨거운 길 위에 물웅덩이처럼 하늘이 비쳐 보이는 것은 어디서 온 빛인가?
//
// 답: 길 바로 위 공기는 아래로 갈수록 뜨겁고 묽어 굴절률이 조금씩 작다. 하늘의 한 점에서
// 비스듬히 내려오던 빛이 층을 지날 때마다 조금씩 눕다가 길에 닿기 전에 휘어 올라 눈에 든다.
// 눈이 들어온 방향을 곧게 거슬러 그으면 그 선은 길바닥 아래를 가리키고, 거기에 하늘 조각이 보인다.
//
// 이웃과 겹치지 않게 — `snells-law` 는 경계면 **하나**에서 매질에 따라 꺾이는 정도를,
// 여기서는 **층이 여럿 쌓인 기울기** 가 줄기를 휘게 하는 것과 그 결과 보이는 자리를 보인다.
// `apparent-depth` 는 물속 물체가 떠 보이는 것(허상이 위로), 여기서는 하늘이 아래로 보인다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:mirage` 와 문자 그대로 일치한다 (C4). */
export const MIRAGE_ID = 'mirage';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 뜨거운 층 위 찬 공기의 굴절률. */
export const N_COOL = 1.00026;
/**
 * 길 바로 위(가장 뜨거운 층)와 찬 공기의 **실제** 굴절률 차. 30 ℃ 공기와 60 ℃ 공기 사이쯤이다.
 * 이대로 그리면 줄기가 0.4° 안쪽으로만 누워 눈에 보이지 않는다.
 */
export const DELTA_N = 0.00003;
/**
 * 굴절률 차를 키우는 과장 배율. 그림 속 굴절률 차 = `DELTA_N × EXAGGERATION`.
 * 화면에 알리지 않는다 — 이유는 NOTES (b).
 */
export const EXAGGERATION = 2000;
/** 뜨거운 공기를 가르는 층 수. 층마다 굴절률이 같은 몫씩 작아진다. */
export const LAYERS = 6;
/** 뜨거운 공기층 전체의 두께(월드). */
export const HOT_DEPTH = 0.9;
/** 하늘빛이 찬 공기 속을 내려오는 각(수평에서 잰 도, 과장된 그림 속 값). */
export const DESCENT_DEG = 15.5;

// ------------------------------------------------------------------------
// 배치 — 월드 단위는 임의(길바닥이 y = 0, 위가 하늘).
// ------------------------------------------------------------------------

/** 눈의 자리. 줄기는 눈에서 거꾸로 추적한다 — 하늘 조각의 자리는 그 끝이다. */
export const EYE_X = -5.2;
export const EYE_Y = 1.3;
/** 하늘 조각의 높이(가운데). */
export const SKY_Y = 1.9;
/** 하늘 조각의 반폭 · 반높이. 땅 아래 보이는 하늘도 같은 크기다. */
export const PATCH_HALF_W = 0.5;
export const PATCH_HALF_H = 0.24;
/** 눈의 반지름. */
export const EYE_R = 0.1;
/** 층 · 길이 좌우로 뻗는 반폭 — 캔버스 끝까지. */
export const ROAD_HALF = 14;
/** 길(아스팔트) 면의 깊이. */
export const ROAD_DEPTH = 6;
/** 층 이름을 두는 오른쪽 끝 x. */
export const LAYER_LABEL_X = 6.2;

/** 프레이밍 — 고정값. 왼쪽 위는 캡션 자리 (원칙 6). */
export const SCENE_BOUNDS = { minX: -6.4, maxX: 6.6, minY: -2.25, maxY: 3.2 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const mirageMessages = Object.freeze({
  'label.title': {
    ko: '신기루',
    en: 'Mirage',
    ja: '蜃気楼',
    zh: '海市蜃楼',
    ar: 'السراب',
    es: 'Espejismo',
    fr: 'Mirage',
    hi: 'मृगमरीचिका',
    id: 'Fatamorgana',
    pt: 'Miragem',
  },
  'label.operation': {
    ko: '밀도 기울기가 휘게 하는 빛',
    en: 'Light bent by a density gradient',
    ja: '密度の勾配に曲げられる光',
    zh: '被密度梯度弯折的光',
    ar: 'ضوء ينحني بفعل تدرّج الكثافة',
    es: 'Luz curvada por un gradiente de densidad',
    fr: 'La lumière courbée par un gradient de densité',
    hi: 'घनत्व प्रवणता से मुड़ता प्रकाश',
    id: 'Cahaya yang dibelokkan oleh gradien kerapatan',
    pt: 'Luz curvada por um gradiente de densidade',
  },
  'label.stage': {
    ko: '뜨거운 길 위',
    en: 'Above a hot road',
    ja: '熱い道路の上',
    zh: '炽热路面上方',
    ar: 'فوق طريق ساخن',
    es: 'Sobre una carretera caliente',
    fr: 'Au-dessus d’une route chaude',
    hi: 'गर्म सड़क के ऊपर',
    id: 'Di atas jalan panas',
    pt: 'Sobre uma estrada quente',
  },
  'label.view': {
    ko: '옆에서 본 길',
    en: 'Road from the side',
    ja: '横から見た道路',
    zh: '从侧面看路面',
    ar: 'الطريق من الجانب',
    es: 'La carretera vista de lado',
    fr: 'La route vue de côté',
    hi: 'बगल से देखी सड़क',
    id: 'Jalan dilihat dari samping',
    pt: 'A estrada vista de lado',
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
  'label.sky': {
    ko: '하늘',
    en: 'Sky',
    ja: '空',
    zh: '天空',
    ar: 'السماء',
    es: 'Cielo',
    fr: 'Ciel',
    hi: 'आकाश',
    id: 'Langit',
    pt: 'Céu',
  },
  'label.seen': {
    ko: '하늘이 보이는 자리',
    en: 'Where the sky appears',
    ja: '空が見える場所',
    zh: '看到天空的位置',
    ar: 'حيث تظهر السماء',
    es: 'Donde aparece el cielo',
    fr: 'Où le ciel apparaît',
    hi: 'जहाँ आकाश दिखता है',
    id: 'Tempat langit tampak',
    pt: 'Onde o céu aparece',
  },
  'label.road': {
    ko: '뜨거운 길',
    en: 'Hot road',
    ja: '熱い道路',
    zh: '炽热的路面',
    ar: 'الطريق الساخن',
    es: 'Carretera caliente',
    fr: 'Route chaude',
    hi: 'गर्म सड़क',
    id: 'Jalan panas',
    pt: 'Estrada quente',
  },
  'label.cool': {
    ko: '찬 공기',
    en: 'Cool air',
    ja: '冷たい空気',
    zh: '冷空气',
    ar: 'هواء بارد',
    es: 'Aire frío',
    fr: 'Air frais',
    hi: 'ठंडी हवा',
    id: 'Udara sejuk',
    pt: 'Ar frio',
  },
  'label.hot': {
    ko: '뜨겁고 묽은 공기',
    en: 'Hot, thin air',
    ja: '熱く薄い空気',
    zh: '热而稀薄的空气',
    ar: 'هواء ساخن ومخلخل',
    es: 'Aire caliente y enrarecido',
    fr: 'Air chaud et raréfié',
    hi: 'गर्म, विरल हवा',
    id: 'Udara panas dan renggang',
    pt: 'Ar quente e rarefeito',
  },

  'caption.approach': {
    ko: '하늘의 한 점에서 빛이 곧게 내려온다.',
    en: 'Light comes straight down from a point in the sky.',
    ja: '空の一点から光がまっすぐ下りてくる。',
    zh: '光从天空的一点笔直地射下来。',
    ar: 'ينزل الضوء مستقيمًا من نقطة في السماء.',
    es: 'La luz baja en línea recta desde un punto del cielo.',
    fr: 'La lumière descend en ligne droite d’un point du ciel.',
    hi: 'आकाश के एक बिंदु से प्रकाश सीधा नीचे आता है।',
    id: 'Cahaya turun lurus dari satu titik di langit.',
    pt: 'A luz desce em linha reta de um ponto do céu.',
  },
  'caption.layers': {
    ko: '뜨거운 길 바로 위의 공기는 길에 가까울수록 더 뜨겁고 묽다.',
    en: 'Right above the hot road, the air gets hotter and thinner the closer it is to the road.',
    ja: '熱い道路のすぐ上の空気は、道路に近いほど熱く薄い。',
    zh: '炽热路面正上方的空气，越靠近路面就越热、越稀薄。',
    ar: 'فوق الطريق الساخن مباشرةً، يزداد الهواء سخونةً وتخلخلًا كلما اقترب من الطريق.',
    es: 'Justo encima de la carretera caliente, el aire es más caliente y enrarecido cuanto más cerca está de ella.',
    fr: 'Juste au-dessus de la route chaude, l’air est d’autant plus chaud et raréfié qu’il est proche de la route.',
    hi: 'गर्म सड़क के ठीक ऊपर, हवा सड़क के जितनी पास हो उतनी ही अधिक गर्म और विरल होती है।',
    id: 'Tepat di atas jalan panas, udara makin panas dan renggang makin dekat ke jalan.',
    pt: 'Logo acima da estrada quente, o ar fica mais quente e rarefeito quanto mais perto da estrada.',
  },
  'caption.descend': {
    ko: '하늘의 한 점에서 비스듬히 내려오던 빛이 층을 지날 때마다 조금씩 눕는다.',
    en: 'Light slanting down from one point of the sky tilts a little flatter at every layer it crosses.',
    ja: '空の一点から斜めに下りてきた光は、層を通るたびに少しずつ寝ていく。',
    zh: '从天空一点斜射下来的光，每穿过一层就变得更平一些。',
    ar: 'الضوء النازل مائلًا من نقطة في السماء يصير أكثر استواءً قليلًا عند كل طبقة يعبرها.',
    es: 'La luz que baja inclinada desde un punto del cielo se tumba un poco más en cada capa que atraviesa.',
    fr: 'La lumière qui descend en oblique d’un point du ciel se couche un peu plus à chaque couche traversée.',
    hi: 'आकाश के एक बिंदु से तिरछा नीचे आता प्रकाश हर परत पार करते हुए थोड़ा और सपाट होता जाता है।',
    id: 'Cahaya yang turun miring dari satu titik di langit sedikit demi sedikit makin mendatar di setiap lapisan yang dilaluinya.',
    pt: 'A luz que desce inclinada de um ponto do céu se deita um pouco mais a cada camada que atravessa.',
  },
  'caption.rise': {
    ko: '빛은 길에 닿기 전에 휘어 올라 눈에 들어온다.',
    en: 'Before reaching the road the light curves back up and enters the eye.',
    ja: '光は道路に届く前に曲がって上がり、目に入る。',
    zh: '光在到达路面之前向上弯回，进入眼睛。',
    ar: 'قبل أن يبلغ الضوء الطريق ينحني صاعدًا ويدخل العين.',
    es: 'Antes de llegar a la carretera, la luz se curva hacia arriba y entra en el ojo.',
    fr: 'Avant d’atteindre la route, la lumière se recourbe vers le haut et entre dans l’œil.',
    hi: 'सड़क तक पहुँचने से पहले प्रकाश मुड़कर ऊपर उठता है और आँख में प्रवेश करता है।',
    id: 'Sebelum mencapai jalan, cahaya melengkung naik dan masuk ke mata.',
    pt: 'Antes de chegar à estrada, a luz se curva para cima e entra no olho.',
  },
  'caption.extend': {
    ko: '눈에 들어온 방향을 곧게 거슬러 그으면 길바닥 아래를 가리킨다.',
    en: 'Traced straight back along the direction it entered the eye, the line points below the road.',
    ja: '目に入った方向をまっすぐ逆にたどると、その線は道路の下を指す。',
    zh: '沿进入眼睛的方向笔直反向延长，这条线指向路面下方。',
    ar: 'إذا مُدّ الخط مستقيمًا إلى الوراء في الاتجاه الذي دخل منه العين، أشار إلى ما تحت الطريق.',
    es: 'Prolongada en línea recta hacia atrás en la dirección con que entró en el ojo, la línea apunta por debajo de la carretera.',
    fr: 'Prolongée tout droit vers l’arrière selon la direction d’entrée dans l’œil, la ligne pointe sous la route.',
    hi: 'आँख में प्रवेश की दिशा में सीधे पीछे बढ़ाने पर रेखा सड़क के नीचे की ओर इशारा करती है।',
    id: 'Jika ditarik lurus ke belakang searah masuknya ke mata, garis itu menunjuk ke bawah jalan.',
    pt: 'Prolongada em linha reta para trás na direção em que entrou no olho, a linha aponta para baixo da estrada.',
  },
  'caption.image': {
    ko: '그 자리, 길바닥 아래에 하늘 조각이 보인다 — 길에 하늘이 비친 것처럼.',
    en: 'There, below the road surface, a patch of sky appears — as if the sky were reflected on the road.',
    ja: 'そこ、道路の下に空のかけらが見える — まるで道路に空が映ったように。',
    zh: '在那里，路面下方出现一片天空——就像天空映在路面上一样。',
    ar: 'هناك، تحت سطح الطريق، تظهر رقعة من السماء — كأن السماء منعكسة على الطريق.',
    es: 'Allí, bajo la superficie de la carretera, aparece un trozo de cielo — como si el cielo se reflejara en la carretera.',
    fr: 'Là, sous la surface de la route, un morceau de ciel apparaît — comme si le ciel se reflétait sur la route.',
    hi: 'वहाँ, सड़क की सतह के नीचे, आकाश का एक टुकड़ा दिखता है — मानो सड़क पर आकाश का प्रतिबिंब पड़ा हो।',
    id: 'Di sana, di bawah permukaan jalan, sepotong langit tampak — seolah langit terpantul di jalan.',
    pt: 'Ali, abaixo da superfície da estrada, aparece um pedaço de céu — como se o céu se refletisse na estrada.',
  },
  'caption.reset': {
    ko: '다시 처음으로.',
    en: 'Back to the start.',
    ja: '最初に戻る。',
    zh: '回到开头。',
    ar: 'العودة إلى البداية.',
    es: 'De vuelta al inicio.',
    fr: 'Retour au début.',
    hi: 'फिर से शुरुआत पर।',
    id: 'Kembali ke awal.',
    pt: 'De volta ao início.',
  },
} satisfies Record<string, LocalizedText>);

export type MirageMessageKey = keyof typeof mirageMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: MirageMessageKey): LocalizedText => mirageMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: MirageMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const mirageSchema: BundleSchema = {
  id: MIRAGE_ID,
  label: text('label.title'),
  category: 'optics',
  operation: text('label.operation'),
  timeModel: 'periodic',
  parameters: [],
  stages: [
    {
      id: 'hot-road',
      label: text('label.stage'),
      constants: {
        nCool: N_COOL,
        deltaN: DELTA_N,
        exaggeration: EXAGGERATION,
        layers: LAYERS,
        hotDepth: HOT_DEPTH,
        descentDeg: DESCENT_DEG,
      },
    },
  ],
  environments: [],
  views: [{ id: 'side', label: text('label.view'), default: true }],

  /** 가로로 넓다 — 왼쪽 눈, 오른쪽 하늘 조각, 그 사이 길 위로 휘는 줄기. */
  canvas: { height: 380, minHeight: 320 },

  /** 층 칠을 먼저 깔고 줄기 · 점선 · 눈을 그 위에 — scene 에 쓴 순서대로 그린다. */
  drawOrder: 'scene',

  /** 도착한 순간 층이 깔려 있고 곧 빛이 내려오기 시작한다 (S-piece). */
  startAt: 2.0,

  /**
   * 한 주기 17.4 초.
   *
   * - `layers` — 층만 깔려 있다.
   * - `approach` — 빛이 하늘에서 찬 공기 속을 곧게 내려와 층 윗면에 닿는다.
   * - `descend` — 층을 지나며 눕는다(휘어 오르는 자리까지). 이 조각의 동사라 길게 둔다.
   * - `rise` — 휘어 올라 눈에 닿는다.
   * - `arrive` — 지나온 줄기가 남아 있다.
   * - `extend` — 눈에서 들어온 방향을 곧게 거슬러 점선이 자란다.
   * - `appear` · `image` — 점선 끝, 길 아래에 하늘 조각이 떠올라(`appear`) 머문다(`image`).
   * - `reset` — 줄기 · 점선 · 보이는 하늘이 옅어진다.
   */
  timeline: {
    phases: [
      { id: 'layers', duration: 2.4, caption: key('caption.layers') },
      { id: 'approach', duration: 1.2, caption: key('caption.approach') },
      { id: 'descend', duration: 2.4, caption: key('caption.descend') },
      { id: 'rise', duration: 1.8, caption: key('caption.rise') },
      { id: 'arrive', duration: 1.4, caption: key('caption.rise') },
      { id: 'extend', duration: 2.4, ease: 'smooth', caption: key('caption.extend') },
      { id: 'appear', duration: 0.8, ease: 'smooth', caption: key('caption.image') },
      { id: 'image', duration: 3.8, caption: key('caption.image') },
      { id: 'reset', duration: 1.2, ease: 'smooth', caption: key('caption.reset') },
    ],
  },

  caption: {
    anchor: { screen: 'top-left', offset: [18, 12] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 460,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  // 그리드 · 카메라 단추 · 제목 · 범례 · 조작기 없음(기본). 재는 것은 거리가 아니라 방향이다.

  messages: mirageMessages,
};
