// ========================================================================
// multiple-mirror-images — 선언
// ========================================================================
// 질문: 꼭짓점을 맞댄 두 거울 사이에 물체 하나를 두면 상은 몇 개 서는가.
//
// 답: 두 거울 사이 각을 좁히면 상이 늘어난다 — 90° 에서 3 개, 60° 에서 5 개, 45° 에서 7 개.
// 상들은 모두 꼭짓점 둘레 같은 원 위에 선다. 거울 밖의 상 가운데는 한 번 꺾인 빛이 만든 것도
// 있고, 두 거울에서 차례로 꺾인 빛이 만든 것도 있다 — 90° 에서 그 하나를 골라 빛의 길을 보인다.
//
// 이웃 `plane-mirror-image` 는 거울 하나에서 상까지의 **거리**가 주장이다. 여기서는 거리를
// 재지 않고 **개수**만 말한다 — 치수선을 두지 않는다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText, Vec2 } from '@aperi21/schema';

/** 등록 키 `aperi21:multiple-mirror-images` 와 문자 그대로 일치한다 (C4). */
export const MULTIPLE_MIRROR_IMAGES_ID = 'multiple-mirror-images';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 화면의 각도 · 개수 글자는 이 값 그대로다(계산해 띄우지 않는다).
// ------------------------------------------------------------------------

/** 세 멈춤의 두 거울 사이 각(°). 첫 멈춤 A 에서 좁혀 B, C 로 간 뒤 A 로 되돌아간다. */
export const ANGLE_A_DEG = 90;
export const ANGLE_B_DEG = 60;
export const ANGLE_C_DEG = 45;
/** 세 멈춤에서 서는 상의 개수 — 정박값이다. 그려지는 상의 수는 거울 배치가 정한다. */
export const COUNT_A = 3;
export const COUNT_B = 5;
export const COUNT_C = 7;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 두 거울의 꼭짓점이 원점, 두 거울 사이를 가르는 선이 +y 축이다.
// ------------------------------------------------------------------------

/** 꼭짓점에서 물체까지 거리 — 상들이 놓이는 원의 반지름(월드). */
export const RING_R = 1.55;
/** 거울 길이(월드). 꼭짓점에서 바깥으로 뻗는다. */
export const MIRROR_LEN = 2.35;

/**
 * 깃발 모양 물체 — 깃대는 꼭짓점에서 바깥쪽(지름 방향)으로 서고, 깃폭은 한쪽 옆으로 뻗는다.
 * 비대칭이라 한 번 꺾인 상에서는 깃폭이 반대쪽으로 뻗는 것이 보인다.
 */
export const FLAG_H = 0.46;
/** 깃대 굵기(월드). */
export const FLAG_POLE_W = 0.07;
/** 깃폭이 깃대에서 뻗는 길이 · 깃폭 높이(월드). */
export const FLAG_REACH = 0.28;
export const FLAG_CLOTH_H = 0.22;

/** 두 거울 사이 각을 보이는 부채꼴 반지름(월드). */
export const ARC_R = 0.42;
/** 각도 글자가 꼭짓점에서 이등분선 위로 떨어진 거리(월드). */
export const ANGLE_LABEL_R = 0.62;
/** 「물체」 이름표가 물체 위로 떨어진 거리(월드). */
export const OBJECT_LABEL_GAP = 0.2;

/** 상 개수 표식의 자리(월드) — 원 왼쪽 위. */
export const COUNT_POS: Vec2 = [-2.9, 1.55];

/** 눈 가운데(월드). 90° 거울 사이, 물체 왼쪽 위 — 두 번 꺾인 빛이 여기로 든다. */
export const EYE_POS: Vec2 = [-0.95, 1.95];
/** 눈 아몬드꼴의 반폭 · 반높이, 눈동자 테 · 눈동자 반지름(월드). */
export const EYE_HALF_W = 0.3;
export const EYE_HALF_H = 0.19;
export const IRIS_R = 0.12;
export const PUPIL_R = 0.05;

/**
 * 빛의 길을 보일 상 — 첫 멈춤(A)의 상 가운데 회전 몇 번째(꼭짓점 둘레로 2θ 씩)의 것인가.
 * 1 이면 90° 에서 물체 맞은편(꼭짓점 아래) 상이다. 그 상은 두 거울에서 한 번씩 꺾인 빛이 만든다.
 */
export const TRACED_TURN = 1;

/**
 * 프레이밍 — 세로는 원 아래 깃발 · 캡션 두 줄부터 눈 위까지, 가로는 개수 표식까지.
 * 매 프레임 같은 값이다 (S-piece — 프레이밍은 주장의 일부다).
 */
export const SCENE_BOUNDS = { minX: -3.6, maxX: 3.6, minY: -2.6, maxY: 2.3 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const multipleMirrorImagesMessages = Object.freeze({
  'label.title': {
    ko: '두 거울의 상',
    en: 'Images in two mirrors',
    ja: '二枚の鏡による像',
    zh: '两面镜子中的像',
    ar: 'الصور في مرآتين',
    es: 'Imágenes en dos espejos',
    fr: 'Images dans deux miroirs',
    hi: 'दो दर्पणों में प्रतिबिंब',
    id: 'Bayangan pada dua cermin',
    pt: 'Imagens em dois espelhos',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '각도가 정하는 상의 개수',
    en: 'How the angle between two mirrors sets the number of images',
    ja: '二枚の鏡のなす角が像の数を決めるしくみ',
    zh: '两面镜子的夹角如何决定像的个数',
    ar: 'كيف تحدد الزاوية بين مرآتين عدد الصور',
    es: 'Cómo el ángulo entre dos espejos determina el número de imágenes',
    fr: 'Comment l’angle entre deux miroirs fixe le nombre d’images',
    hi: 'दो दर्पणों के बीच का कोण प्रतिबिंबों की संख्या कैसे तय करता है',
    id: 'Bagaimana sudut antara dua cermin menentukan jumlah bayangan',
    pt: 'Como o ângulo entre dois espelhos define o número de imagens',
  },
  'label.stage': {
    ko: '꼭짓점을 맞댄 두 거울',
    en: 'Two hinged mirrors',
    ja: '頂点を合わせた二枚の鏡',
    zh: '顶点相接的两面镜子',
    ar: 'مرآتان متصلتان عند حافة',
    es: 'Dos espejos unidos por un borde',
    fr: 'Deux miroirs joints par une arête',
    hi: 'किनारे से जुड़े दो दर्पण',
    id: 'Dua cermin yang bertemu di satu sisi',
    pt: 'Dois espelhos unidos por uma aresta',
  },
  'label.view': {
    ko: '위에서',
    en: 'Top view',
    ja: '上から',
    zh: '俯视图',
    ar: 'منظر علوي',
    es: 'Vista superior',
    fr: 'Vue de dessus',
    hi: 'ऊपर से दृश्य',
    id: 'Tampak atas',
    pt: 'Vista de cima',
  },

  /** 도식 이름표 · 표식. 값은 스테이지 상수 그대로 끼운다 (C1 · S-piece 유효숫자). */
  'label.object': {
    ko: '물체',
    en: 'object',
    ja: '物体',
    zh: '物体',
    ar: 'الجسم',
    es: 'objeto',
    fr: 'objet',
    hi: 'वस्तु',
    id: 'benda',
    pt: 'objeto',
  },
  'label.angle': {
    ko: '{deg}°',
    en: '{deg}°',
    ja: '{deg}°',
    zh: '{deg}°',
    ar: '{deg}°',
    es: '{deg}°',
    fr: '{deg}°',
    hi: '{deg}°',
    id: '{deg}°',
    pt: '{deg}°',
  },
  'label.count': {
    ko: '상 {n} 개',
    en: '{n} images',
    ja: '像 {n} 個',
    zh: '{n} 个像',
    ar: '{n} صور',
    es: '{n} imágenes',
    fr: '{n} images',
    hi: '{n} प्रतिबिंब',
    id: '{n} bayangan',
    pt: '{n} imagens',
  },

  'caption.showA': {
    ko: '두 거울 사이 {degA}° — 꼭짓점 둘레 원 위에 상이 {countA} 개 선다.',
    en: 'The mirrors meet at {degA}° — {countA} images stand on the circle around the corner.',
    ja: '二枚の鏡のなす角は {degA}° — 頂点を囲む円の上に像が {countA} 個できる。',
    zh: '两面镜子的夹角为 {degA}°——绕顶点的圆上出现 {countA} 个像。',
    ar: 'تلتقي المرآتان بزاوية {degA}° — تقف {countA} صور على الدائرة حول الرأس.',
    es: 'Los espejos forman {degA}° — {countA} imágenes se sitúan en el círculo alrededor del vértice.',
    fr: 'Les miroirs forment un angle de {degA}° — {countA} images se placent sur le cercle autour du sommet.',
    hi: 'दर्पण {degA}° पर मिलते हैं — कोने के चारों ओर के वृत्त पर {countA} प्रतिबिंब बनते हैं।',
    id: 'Kedua cermin bertemu pada {degA}° — {countA} bayangan berdiri pada lingkaran di sekitar titik sudut.',
    pt: 'Os espelhos se encontram a {degA}° — {countA} imagens ficam no círculo em torno do vértice.',
  },
  'caption.trace': {
    ko: '물체에서 나온 빛이 한 거울에서 꺾이고, 다른 거울에서 또 꺾여 눈에 든다.',
    en: 'Light from the object bounces off one mirror, then off the other, and reaches the eye.',
    ja: '物体から出た光が一方の鏡で反射し、もう一方の鏡でまた反射して目に入る。',
    zh: '物体发出的光在一面镜子上反射，又在另一面镜子上反射，进入眼睛。',
    ar: 'ينعكس الضوء الصادر عن الجسم عن إحدى المرآتين، ثم عن الأخرى، ويصل إلى العين.',
    es: 'La luz del objeto se refleja en un espejo, luego en el otro, y llega al ojo.',
    fr: 'La lumière de l’objet se réfléchit sur un miroir, puis sur l’autre, et atteint l’œil.',
    hi: 'वस्तु से निकला प्रकाश एक दर्पण से परावर्तित होता है, फिर दूसरे से, और आँख तक पहुँचता है।',
    id: 'Cahaya dari benda memantul pada satu cermin, lalu pada cermin lainnya, dan sampai ke mata.',
    pt: 'A luz do objeto reflete em um espelho, depois no outro, e chega ao olho.',
  },
  'caption.path': {
    ko: '눈에 든 빛을 거꾸로 이은 점선은 꼭짓점 맞은편 상에 닿는다 — 두 번 꺾인 빛이 만든 상이다.',
    en: 'Traced back, the light in the eye leads to the image across the corner — the one made by two bounces.',
    ja: '目に入った光を逆にたどると、頂点の向かい側の像に行き着く — 二回反射した光がつくる像だ。',
    zh: '把进入眼睛的光反向延长，就到达顶点对面的像——这是经两次反射形成的像。',
    ar: 'إذا تتبّعنا الضوء الداخل إلى العين إلى الوراء، وصلنا إلى الصورة المقابلة للرأس — وهي الصورة الناتجة عن انعكاسين.',
    es: 'Prolongada hacia atrás, la luz que llega al ojo conduce a la imagen al otro lado del vértice — la formada por dos reflexiones.',
    fr: 'Prolongée vers l’arrière, la lumière qui entre dans l’œil mène à l’image située en face du sommet — celle formée par deux réflexions.',
    hi: 'आँख में पहुँचे प्रकाश को पीछे की ओर बढ़ाने पर वह कोने के सामने वाले प्रतिबिंब तक जाता है — यह दो परावर्तनों से बना प्रतिबिंब है।',
    id: 'Ditelusuri mundur, cahaya yang masuk ke mata mengarah ke bayangan di seberang titik sudut — bayangan yang dibentuk oleh dua pantulan.',
    pt: 'Prolongada para trás, a luz que chega ao olho leva à imagem do outro lado do vértice — a formada por duas reflexões.',
  },
  'caption.narrow': {
    ko: '두 거울 사이 각을 좁힌다.',
    en: 'The angle between the mirrors closes.',
    ja: '二枚の鏡のなす角が狭まる。',
    zh: '两面镜子的夹角变小。',
    ar: 'تضيق الزاوية بين المرآتين.',
    es: 'El ángulo entre los espejos se cierra.',
    fr: 'L’angle entre les miroirs se referme.',
    hi: 'दर्पणों के बीच का कोण घटता है।',
    id: 'Sudut antara kedua cermin menyempit.',
    pt: 'O ângulo entre os espelhos se fecha.',
  },
  'caption.showB': {
    ko: '두 거울 사이 {degB}° — 상이 {countB} 개로 늘었다.',
    en: 'At {degB}°, there are {countB} images.',
    ja: '{degB}° では、像は {countB} 個になる。',
    zh: '在 {degB}° 时，有 {countB} 个像。',
    ar: 'عند {degB}° توجد {countB} صور.',
    es: 'A {degB}°, hay {countB} imágenes.',
    fr: 'À {degB}°, il y a {countB} images.',
    hi: '{degB}° पर {countB} प्रतिबिंब होते हैं।',
    id: 'Pada {degB}°, ada {countB} bayangan.',
    pt: 'A {degB}°, há {countB} imagens.',
  },
  'caption.showC': {
    ko: '두 거울 사이 {degC}° — 상 {countC} 개가 원을 촘촘히 채운다.',
    en: 'At {degC}°, {countC} images crowd the circle.',
    ja: '{degC}° では、{countC} 個の像が円をぎっしり埋める。',
    zh: '在 {degC}° 时，{countC} 个像把圆排得密密麻麻。',
    ar: 'عند {degC}° تزدحم {countC} صور على الدائرة.',
    es: 'A {degC}°, {countC} imágenes llenan el círculo.',
    fr: 'À {degC}°, {countC} images se serrent sur le cercle.',
    hi: '{degC}° पर {countC} प्रतिबिंब वृत्त को घना भर देते हैं।',
    id: 'Pada {degC}°, {countC} bayangan memadati lingkaran.',
    pt: 'A {degC}°, {countC} imagens lotam o círculo.',
  },
  'caption.open': {
    ko: '거울을 {degA}° 로 되돌린다.',
    en: 'The mirrors open back to {degA}°.',
    ja: '鏡が {degA}° に開き戻る。',
    zh: '镜子重新张开到 {degA}°。',
    ar: 'تنفتح المرآتان مجددًا إلى {degA}°.',
    es: 'Los espejos se abren de nuevo hasta {degA}°.',
    fr: 'Les miroirs se rouvrent à {degA}°.',
    hi: 'दर्पण फिर से {degA}° तक खुलते हैं।',
    id: 'Kedua cermin membuka kembali ke {degA}°.',
    pt: 'Os espelhos se abrem de volta a {degA}°.',
  },
} satisfies Record<string, LocalizedText>);

export type MultipleMirrorImagesMessageKey = keyof typeof multipleMirrorImagesMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: MultipleMirrorImagesMessageKey): LocalizedText => multipleMirrorImagesMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: MultipleMirrorImagesMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const multipleMirrorImagesSchema: BundleSchema = {
  id: MULTIPLE_MIRROR_IMAGES_ID,
  label: text('label.title'),
  category: 'optics',
  description: text('label.description'),
  timeModel: 'periodic',

  // 조작기가 없다. 각을 끌게 하면 멈춘 각이 선언값이 아니게 되어 각도 · 개수 글자를 띄울 수
  // 없고(계산값 금지), 360 을 나누어떨어지지 않는 각에서는 상의 개수가 물체 자리에 따라 갈린다.
  // 세 각을 차례로 멈춰 보이는 것으로 비교가 끝난다.
  parameters: [],

  stages: [
    {
      id: 'hinged-mirrors',
      label: text('label.stage'),
      constants: {
        angleA: ANGLE_A_DEG,
        angleB: ANGLE_B_DEG,
        angleC: ANGLE_C_DEG,
        countA: COUNT_A,
        countB: COUNT_B,
        countC: COUNT_C,
      },
    },
  ],

  environments: [],

  views: [{ id: 'top', label: text('label.view'), default: true }],

  /** 원 하나가 세로를 정한다. */
  canvas: { height: 420, minHeight: 340 },

  /**
   * 원 → 거울 → 각 → 점선 → 줄기 → 눈 → 상 → 물체 → 글자 순. 눈은 바탕색으로 줄기 끝을 덮어
   * 「눈 안으로 든다」 로 읽혀야 하고, plugin 어휘(`ray` · `opticalElement`)는 층에서 앞설 수 있어
   * scene 순서로 고정한다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = A 에서 상을 보임 → 두 번 꺾인 빛의 길 → 좁혀 B → 좁혀 C → A 로 되돌림.
   *
   * 거울 각은 `narrowB` · `narrowC` · `openA` 진행도로 세 선언값 사이를 잇는다(`physics.ts mirrorDeg`).
   * 움직이는 동안에는 상을 두지 않는다 — 360 을 나누어떨어지지 않는 각의 상은 이 조각이 할 말이 아니다.
   * 상은 멈춘 각에서 `appear*` 로 나타나고 `hide*` 로 사라진다.
   */
  timeline: {
    phases: [
      { id: 'showA', duration: 3.0, caption: key('caption.showA') },
      { id: 'traceA', duration: 2.2, ease: 'smooth', caption: key('caption.trace') },
      { id: 'pathA', duration: 3.6, caption: key('caption.path') },
      { id: 'hideA', duration: 0.5, caption: key('caption.path') },
      { id: 'narrowB', duration: 1.4, ease: 'smooth', caption: key('caption.narrow') },
      { id: 'appearB', duration: 0.6, caption: key('caption.showB') },
      { id: 'showB', duration: 3.0, caption: key('caption.showB') },
      { id: 'hideB', duration: 0.5, caption: key('caption.showB') },
      { id: 'narrowC', duration: 1.4, ease: 'smooth', caption: key('caption.narrow') },
      { id: 'appearC', duration: 0.6, caption: key('caption.showC') },
      { id: 'showC', duration: 3.4, caption: key('caption.showC') },
      { id: 'hideC', duration: 0.5, caption: key('caption.showC') },
      { id: 'openA', duration: 1.4, ease: 'smooth', caption: key('caption.open') },
      { id: 'appearA', duration: 0.6, caption: key('caption.showA') },
    ],
  },

  /** 도착한 순간 거울 · 물체 · 상 셋이 이미 서 있다 — 첫 멈춤 가운데서 연다 (S-piece). */
  startAt: 1.0,

  /** 슬롯 하나. 그림 아래 가운데. 각도 · 개수는 state 가 스테이지 상수에서 옮긴 글자다(G133). */
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -6] },
    align: 'center',
    fontSize: 14,
    wrapWidth: 760,
    style: { colorRole: 'ink', emphasis: 'strong' },
    fade: 0.25,
    vars: {
      degA: 'degA',
      degB: 'degB',
      degC: 'degC',
      countA: 'countA',
      countB: 'countB',
      countC: 'countC',
    },
  },

  // 그리드 · 카메라 단추 · 범례 · 제목 없음(기본). 잴 것이 거리가 아니라 개수다.

  messages: multipleMirrorImagesMessages,
};
