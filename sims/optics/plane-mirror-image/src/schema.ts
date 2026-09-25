// ========================================================================
// plane-mirror-image — 선언
// ========================================================================
// 질문: 평면거울 속의 상은 어디에 서는가, 그리고 거기서 정말 빛이 오는가.
//
// 답: 물체 한 점에서 나온 줄기들이 거울에서 꺾여 눈으로 들어간다. 그 꺾인 줄기를 거울
// 뒤로 거꾸로 이으면 한 점에서 만나고, 그 점은 거울 뒤 물체와 같은 거리에 있다. 물체를
// 거울에서 떼어 내면 만나는 점도 같은 거리만큼 거울 뒤로 물러난다. 거울 뒤로 건너간
// 빛은 없다 — 점선은 빛이 아니라 거꾸로 이은 선이다.
//
// 이웃 `law-of-reflection` 은 법선에서 잰 각이 주장이다. 여기서는 각을 재지 않고 **거리와
// 허상**만 말한다 — 법선 · 각의 호를 두지 않는다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText, Vec2 } from '@aperi21/schema';

/** 등록 키 `aperi21:plane-mirror-image` 와 문자 그대로 일치한다 (C4). */
export const PLANE_MIRROR_IMAGE_ID = 'plane-mirror-image';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 치수선 글자는 이 값 그대로다(계산해 줄이지 않는다).
// ------------------------------------------------------------------------

/** 가까운 멈춤에서 물체와 거울 사이 거리(cm). */
export const NEAR_CM = 30;
/** 먼 멈춤에서 물체와 거울 사이 거리(cm). */
export const FAR_CM = 60;
/** 표시 배율 — cm 하나가 월드 몇 단위인가. */
export const WORLD_PER_CM = 0.05;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 거울면이 x = 0 이고 물체는 왼쪽(x < 0), 바닥선이 y = 0 이다.
// ------------------------------------------------------------------------

/** 거울 아래 끝 · 위 끝(월드 y). */
export const MIRROR_BOTTOM = -0.55;
export const MIRROR_TOP = 3.3;

/**
 * 글자 F 모양 물체. 비대칭이라 상에서 획이 뻗는 쪽이 뒤집힌 것이 보인다.
 * 기둥 바깥 모서리(물체 쪽 x = −d)가 거리를 재는 자리이고, 윗모서리가 줄기가 나오는 점이다.
 */
export const F_HEIGHT = 1.3;
/** 윗 가로획 길이(월드). 기둥에서 거울 쪽으로 뻗는다. */
export const F_WIDTH = 0.75;
/** 가운데 가로획 길이(월드). */
export const F_MID_WIDTH = 0.55;
/** 획 굵기(월드). */
export const F_STROKE = 0.16;
/** 가운데 가로획의 아래 변 높이(월드). */
export const F_MID_Y = 0.6;

/** 눈 가운데(월드). 물체 쪽, 왼쪽 위 — 줄기가 F 위로 지나가게 높이 둔다. */
export const EYE_POS: Vec2 = [-1.25, 2.85];
/** 눈 아몬드꼴의 반폭 · 반높이(월드). 세 줄기를 다 받도록 도식에서 크게 그린다(과장). */
export const EYE_HALF_W = 0.5;
export const EYE_HALF_H = 0.32;
/** 눈동자 테 · 눈동자 반지름(월드). */
export const IRIS_R = 0.2;
export const PUPIL_R = 0.08;
/**
 * 줄기가 눈에 드는 자리 — 눈 가운데에서 세로로 띄운 거리(월드). 줄기 셋.
 * 한 점에서 나온 줄기는 벌어지기만 하므로 한 점 눈으로는 셋을 받을 수 없다(도식의 과장).
 */
export const EYE_TARGET_OFFSETS: readonly number[] = [-0.25, 0, 0.25];

/** 치수선 높이(월드). F 바닥 아래. */
export const DIM_Y = -0.38;
/** 「물체」 · 「상」 이름표가 F 기둥 바깥으로 떨어진 거리(월드). */
export const NAME_GAP = 0.42;
/** 「거울」 이름표가 거울 아래 끝에서 내려간 거리(월드). */
export const MIRROR_LABEL_GAP = 0.22;

/**
 * 프레이밍 — 가로는 먼 멈춤의 물체 · 상과 이름표까지, 세로는 치수선 · 「거울」 이름표 · 캡션 두 줄(en 이 길다)부터
 * 눈 위까지. 매 프레임 같은 값이다 (S-piece — 프레이밍은 주장의 일부다).
 */
export const SCENE_BOUNDS = { minX: -3.75, maxX: 3.75, minY: -1.55, maxY: 3.45 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const planeMirrorImageMessages = Object.freeze({
  'label.title': {
    ko: '평면거울의 상',
    en: 'Image in a plane mirror',
    ja: '平面鏡の像',
    zh: '平面镜成像',
    ar: 'الصورة في مرآة مستوية',
    es: 'Imagen en un espejo plano',
    fr: 'Image dans un miroir plan',
    hi: 'समतल दर्पण में प्रतिबिंब',
    id: 'Bayangan pada cermin datar',
    pt: 'Imagem em um espelho plano',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '되짚은 빛이 만나는 거울 뒤의 허상',
    en: 'The virtual image behind the mirror where traced-back light meets',
    ja: 'たどり返した光が交わる、鏡の奥の虚像',
    zh: '反向延长的光线交会在镜后的虚像',
    ar: 'الصورة التقديرية خلف المرآة حيث يلتقي الضوء المتتبَّع إلى الخلف',
    es: 'La imagen virtual detrás del espejo, donde se cruza la luz prolongada hacia atrás',
    fr: 'L’image virtuelle derrière le miroir, là où se croise la lumière prolongée vers l’arrière',
    hi: 'दर्पण के पीछे का आभासी प्रतिबिंब, जहाँ पीछे की ओर बढ़ाई गई किरणें मिलती हैं',
    id: 'Bayangan maya di balik cermin, tempat cahaya yang ditelusuri balik bertemu',
    pt: 'A imagem virtual atrás do espelho, onde se cruza a luz prolongada para trás',
  },
  'label.stage': {
    ko: '평면거울',
    en: 'Plane mirror',
    ja: '平面鏡',
    zh: '平面镜',
    ar: 'مرآة مستوية',
    es: 'Espejo plano',
    fr: 'Miroir plan',
    hi: 'समतल दर्पण',
    id: 'Cermin datar',
    pt: 'Espelho plano',
  },
  'label.view': {
    ko: '옆에서',
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

  /** 도식 이름표. */
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
  'label.image': {
    ko: '상',
    en: 'image',
    ja: '像',
    zh: '像',
    ar: 'الصورة',
    es: 'imagen',
    fr: 'image',
    hi: 'प्रतिबिंब',
    id: 'bayangan',
    pt: 'imagem',
  },
  'label.mirror': {
    ko: '거울',
    en: 'mirror',
    ja: '鏡',
    zh: '镜面',
    ar: 'المرآة',
    es: 'espejo',
    fr: 'miroir',
    hi: 'दर्पण',
    id: 'cermin',
    pt: 'espelho',
  },
  /** 치수선 글자. 값은 스테이지 상수 그대로 끼운다 (C1 · S-piece 유효숫자). */
  'label.distance': {
    ko: '{d} cm',
    en: '{d} cm',
    ja: '{d} cm',
    zh: '{d} cm',
    ar: '{d} cm',
    es: '{d} cm',
    fr: '{d} cm',
    hi: '{d} cm',
    id: '{d} cm',
    pt: '{d} cm',
  },

  'caption.near': {
    ko: '물체는 거울 앞 {near} cm — 눈에 든 빛을 거울 뒤로 거꾸로 이은 점선은 거울 뒤 {near} cm 에서 만난다.',
    en: 'The object is {near} cm in front of the mirror — the dashed lines traced back from the light in the eye meet {near} cm behind it.',
    ja: '物体は鏡の前 {near} cm — 目に入った光を鏡の後ろへ逆にたどった破線は、鏡の後ろ {near} cm で交わる。',
    zh: '物体在镜前 {near} cm——把进入眼睛的光反向延长到镜后的虚线，在镜后 {near} cm 处相交。',
    ar: 'الجسم على بعد {near} cm أمام المرآة — والخطوط المتقطعة الممتدة إلى الخلف من الضوء الداخل إلى العين تلتقي على بعد {near} cm خلفها.',
    es: 'El objeto está a {near} cm delante del espejo — las líneas discontinuas trazadas hacia atrás desde la luz que llega al ojo se cortan a {near} cm detrás de él.',
    fr: 'L’objet est à {near} cm devant le miroir — les pointillés prolongés en arrière depuis la lumière qui entre dans l’œil se rejoignent à {near} cm derrière lui.',
    hi: 'वस्तु दर्पण के सामने {near} cm पर है — आँख में आए प्रकाश को पीछे की ओर बढ़ाने वाली टूटी रेखाएँ दर्पण के पीछे {near} cm पर मिलती हैं।',
    id: 'Benda berada {near} cm di depan cermin — garis putus-putus yang ditarik mundur dari cahaya yang masuk ke mata bertemu {near} cm di belakangnya.',
    pt: 'O objeto está a {near} cm na frente do espelho — as linhas tracejadas prolongadas para trás a partir da luz que entra no olho se encontram {near} cm atrás dele.',
  },
  'caption.away': {
    ko: '물체를 거울에서 떼어 낸다 — 점선이 만나는 점도 거울 뒤로 함께 물러난다.',
    en: 'The object moves away from the mirror — the point where the dashed lines meet moves back behind it too.',
    ja: '物体を鏡から離す — 破線が交わる点も鏡の後ろへ一緒に下がる。',
    zh: '物体离开镜面——虚线的交点也随之向镜后退去。',
    ar: 'يبتعد الجسم عن المرآة — ونقطة التقاء الخطوط المتقطعة تتراجع خلفها أيضًا.',
    es: 'El objeto se aleja del espejo — el punto donde se cortan las líneas discontinuas también retrocede detrás de él.',
    fr: 'L’objet s’éloigne du miroir — le point où se rejoignent les pointillés recule lui aussi derrière.',
    hi: 'वस्तु दर्पण से दूर जाती है — टूटी रेखाओं के मिलने का बिंदु भी दर्पण के पीछे की ओर हटता है।',
    id: 'Benda menjauh dari cermin — titik pertemuan garis putus-putus juga mundur di belakangnya.',
    pt: 'O objeto se afasta do espelho — o ponto onde as linhas tracejadas se encontram também recua atrás dele.',
  },
  'caption.far': {
    ko: '물체는 거울 앞 {far} cm — 점선이 만나는 점은 거울 뒤 {far} cm 에 있다.',
    en: 'The object is {far} cm in front of the mirror — the dashed lines now meet {far} cm behind it.',
    ja: '物体は鏡の前 {far} cm — 破線は今度は鏡の後ろ {far} cm で交わる。',
    zh: '物体在镜前 {far} cm——虚线现在在镜后 {far} cm 处相交。',
    ar: 'الجسم على بعد {far} cm أمام المرآة — والخطوط المتقطعة تلتقي الآن على بعد {far} cm خلفها.',
    es: 'El objeto está a {far} cm delante del espejo — ahora las líneas discontinuas se cortan a {far} cm detrás de él.',
    fr: 'L’objet est à {far} cm devant le miroir — les pointillés se rejoignent maintenant à {far} cm derrière lui.',
    hi: 'वस्तु दर्पण के सामने {far} cm पर है — टूटी रेखाएँ अब दर्पण के पीछे {far} cm पर मिलती हैं।',
    id: 'Benda berada {far} cm di depan cermin — garis putus-putus kini bertemu {far} cm di belakangnya.',
    pt: 'O objeto está a {far} cm na frente do espelho — agora as linhas tracejadas se encontram {far} cm atrás dele.',
  },
  'caption.behind': {
    ko: '거울 뒤로 건너간 빛은 없다 — 뒤의 F 는 점선이 만나는 자리에 가로획을 거울 쪽으로 뻗고 선다.',
    en: 'No light crosses behind the mirror — the F there stands where the dashed lines meet, its bars pointing toward the mirror.',
    ja: '鏡の後ろへ渡る光はない — そこの F は破線が交わる所に、横棒を鏡のほうへ伸ばして立っている。',
    zh: '没有光穿到镜子后面——那里的 F 立在虚线相交处，横笔指向镜面。',
    ar: 'لا يعبر أي ضوء إلى ما خلف المرآة — والحرف F هناك يقف حيث تلتقي الخطوط المتقطعة، وقضبانه متجهة نحو المرآة.',
    es: 'Ninguna luz pasa detrás del espejo — la F de allí está donde se cortan las líneas discontinuas, con sus trazos apuntando hacia el espejo.',
    fr: 'Aucune lumière ne passe derrière le miroir — le F de ce côté se tient là où les pointillés se rejoignent, ses barres tournées vers le miroir.',
    hi: 'दर्पण के पीछे कोई प्रकाश नहीं जाता — वहाँ का F टूटी रेखाओं के मिलने की जगह खड़ा है, उसकी आड़ी रेखाएँ दर्पण की ओर हैं।',
    id: 'Tidak ada cahaya yang menyeberang ke belakang cermin — F di sana berdiri di tempat garis putus-putus bertemu, dengan batangnya mengarah ke cermin.',
    pt: 'Nenhuma luz passa para trás do espelho — o F ali fica onde as linhas tracejadas se encontram, com os traços apontando para o espelho.',
  },
  'caption.toward': {
    ko: '물체를 거울 쪽으로 되돌린다 — 점선이 만나는 점도 거울 쪽으로 다가온다.',
    en: 'The object moves back toward the mirror — the meeting point of the dashed lines comes forward with it.',
    ja: '物体を鏡のほうへ戻す — 破線の交点も一緒に前へ出てくる。',
    zh: '物体移回镜面——虚线的交点也随之向前靠近。',
    ar: 'يعود الجسم نحو المرآة — وتتقدّم نقطة التقاء الخطوط المتقطعة معه.',
    es: 'El objeto vuelve hacia el espejo — el punto de corte de las líneas discontinuas avanza con él.',
    fr: 'L’objet revient vers le miroir — le point de rencontre des pointillés avance avec lui.',
    hi: 'वस्तु वापस दर्पण की ओर आती है — टूटी रेखाओं का मिलन-बिंदु भी उसके साथ आगे आता है।',
    id: 'Benda kembali mendekati cermin — titik pertemuan garis putus-putus ikut maju bersamanya.',
    pt: 'O objeto volta em direção ao espelho — o ponto de encontro das linhas tracejadas avança junto com ele.',
  },
} satisfies Record<string, LocalizedText>);

export type PlaneMirrorImageMessageKey = keyof typeof planeMirrorImageMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: PlaneMirrorImageMessageKey): LocalizedText => planeMirrorImageMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: PlaneMirrorImageMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const planeMirrorImageSchema: BundleSchema = {
  id: PLANE_MIRROR_IMAGE_ID,
  label: text('label.title'),
  category: 'optics',
  description: text('label.description'),
  timeModel: 'periodic',

  // 조작기가 없다. 물체를 끌게 하면 멈춘 거리가 선언값이 아니게 되어 치수선 글자를 띄울 수
  // 없다(계산값 반올림 금지). 두 거리를 차례로 멈춰 보이는 것으로 비교가 끝난다.
  parameters: [],

  stages: [
    {
      id: 'plane-mirror',
      label: text('label.stage'),
      constants: { nearCm: NEAR_CM, farCm: FAR_CM, worldPerCm: WORLD_PER_CM },
    },
  ],

  environments: [],

  views: [{ id: 'side', label: text('label.view'), default: true }],

  /** 가로로 넓다 — 물체와 상이 거울 양쪽으로 벌어진다. */
  canvas: { height: 400, minHeight: 340 },

  /**
   * 점선 → 거울 → 줄기 → 눈 → F → 점 → 글자 순. 눈은 바탕색으로 줄기 끝을 덮어 「눈 안으로
   * 들어간다」 로 읽혀야 하고, plugin 어휘(`ray` · `opticalElement`)는 층에서 앞설 수 있어
   * scene 순서로 고정한다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 가까이 멈춤 → 떼어 냄 → 멀리 멈춤 → (멀리 그대로) 거울 뒤 빛 없음 → 되돌림.
   *
   * 물체 거리는 `away` · `toward` 단계 진행도로 두 선언값 사이를 잇는다(`physics.ts objectCm`).
   * 치수선 글자는 멈춤 단계(`near` · `far` · `behind`)에서만 뜬다 — 움직이는 동안의 거리는 계산값이다.
   */
  timeline: {
    phases: [
      { id: 'near', duration: 3.2, caption: key('caption.near') },
      { id: 'away', duration: 1.8, ease: 'smooth', caption: key('caption.away') },
      { id: 'far', duration: 3.0, caption: key('caption.far') },
      { id: 'behind', duration: 3.4, caption: key('caption.behind') },
      { id: 'toward', duration: 1.8, ease: 'smooth', caption: key('caption.toward') },
    ],
  },

  /** 도착한 순간 줄기 · 점선 · 상이 이미 서 있다 — 첫 멈춤 가운데서 연다 (S-piece). */
  startAt: 0.8,

  /** 슬롯 하나. 그림 아래 가운데. 거리는 state 가 스테이지 상수에서 옮긴 글자다(G133). */
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -6] },
    align: 'center',
    fontSize: 14,
    wrapWidth: 760,
    style: { colorRole: 'ink', emphasis: 'strong' },
    fade: 0.25,
    vars: { near: 'nearCm', far: 'farCm' },
  },

  // 그리드 · 카메라 단추 · 범례 · 제목 없음(기본). 거리는 치수선 둘이 직접 잰다 —
  // 그리드를 켜면 재는 대상이 치수선에서 흩어진다.

  messages: planeMirrorImageMessages,
};
