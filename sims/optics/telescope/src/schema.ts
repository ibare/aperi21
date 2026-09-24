// ========================================================================
// telescope — 선언
// ========================================================================
// 질문: 망원경은 먼 별을 어떻게 더 벌어져 보이게 하는가.
//
// 답: 초점 거리가 긴 대물렌즈와 짧은 접안렌즈를 두 초점이 겹치게 놓는다(케플러식).
// 먼 별에서 오는 빛은 평행하다 — 축과 작은 각 θ 로 비스듬히 들어온 평행 줄기가 공통
// 초점면의 한 점에 모인 뒤, 접안렌즈를 나와 다시 평행 줄기가 되는데 그 기울기가
// 대물 · 접안 초점 거리의 비만큼 크다. 들어오는 각 호와 나가는 각 호를 같은 반지름으로
// 나란히 두고, 나가는 호를 θ 칸 눈금으로 나눠 몇 번 들어가는지 보인다. 접안렌즈를
// 짧은 것으로 바꾸면 두 초점을 겹치려고 간격이 줄고 나가는 호가 넓어진다.
//
// 가까운 물체를 두 번 키우는 현미경은 `microscope` 의 몫이다 — 이 조각은 들어오는 빛이
// 평행하다. 붙인 두 렌즈는 `lens-combination` 의 몫이다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:telescope` 와 문자 그대로 일치한다 (C4). */
export const TELESCOPE_ID = 'telescope';

// ------------------------------------------------------------------------
// 물리 · 표시 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 대물렌즈 초점 거리(cm). */
export const FOCAL_OBJECTIVE_CM = 100;
/** 처음 접안렌즈 초점 거리(cm). */
export const FOCAL_EYE_LONG_CM = 20;
/** 바꿔 끼우는 접안렌즈 초점 거리(cm). */
export const FOCAL_EYE_SHORT_CM = 10;
/** 평행 줄기가 광축과 이루는 각(도). 먼 별의 겉보기 방향이다. */
export const IN_ANGLE_DEG = 2;

/**
 * 화면에 띄우는 초점 거리 · 간격 · 배율 글자 — **정박값**이다. 위 초점 거리에서 계산하지
 * 않는다(S-piece 유효숫자). 초점 거리를 바꾸면 이것도 함께 바꾼다 (NOTES (c) G143).
 */
export const SHOWN_FOCAL_OBJECTIVE_CM = 100;
export const SHOWN_FOCAL_EYE_LONG_CM = 20;
export const SHOWN_FOCAL_EYE_SHORT_CM = 10;
export const SHOWN_GAP_LONG_CM = 120;
export const SHOWN_GAP_SHORT_CM = 110;
export const SHOWN_MAG_LONG = 5;
export const SHOWN_MAG_SHORT = 10;

/** 월드 1 단위가 나타내는 cm. 표시 배율이다. */
export const CM_PER_UNIT = 25;

/** 평행 줄기 수. 가운데 줄기가 대물렌즈 한가운데를 지나도록 홀수로 둔다. */
export const RAY_COUNT = 5;
/** 대물렌즈에서 이웃 줄기 사이 간격(월드). */
export const RAY_SPACING = 0.4;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 광축은 y = 0, 대물렌즈 가운데가 x = 0 이다.
// ------------------------------------------------------------------------

/** 대물렌즈 반높이(월드). 가장 바깥 줄기(간격 × 2)보다 조금 크다. */
export const OBJECTIVE_HALF = 1.1;
/** 대물렌즈 가운데 · 가장자리 반두께(월드). 초점 거리가 길어 얇다. */
export const OBJECTIVE_CENTER_HALF = 0.08;
export const OBJECTIVE_EDGE_HALF = 0.025;
/** 접안렌즈 반높이(월드). 좁아진 줄기 다발이 지나가는 만큼. */
export const EYE_HALF = 0.5;
/** 접안렌즈 가장자리 반두께(월드). */
export const EYE_EDGE_HALF = 0.025;
/** 긴 · 짧은 접안렌즈의 가운데 반두께(월드). 짧은 쪽이 더 부푼다. */
export const EYE_CENTER_HALF_LONG = 0.09;
export const EYE_CENTER_HALF_SHORT = 0.15;

/** 줄기가 출발하는 x(월드). 들어오는 호 반지름보다 조금 더 왼쪽. */
export const RAY_START_X = -3.6;
/** 나간 줄기가 나가는 호 테두리를 지나 더 가는 가로 거리(월드). */
export const RAY_PAST_ARC = 0.4;
/** 광축 보조선의 왼쪽 · 오른쪽 끝(월드). */
export const AXIS_FROM_X = -3.8;
export const AXIS_TO_X = 9.3;

/**
 * 두 각 호의 반지름(월드). 같은 반지름이라 호 길이가 곧 각의 견줌이다. 들어오는 호는 가운데
 * 줄기가 광축을 지나는 대물렌즈 가운데에, 나가는 호는 그 줄기가 광축을 다시 지나는 자리
 * (출구 동공 — 눈을 대는 자리)에 꼭짓점을 둔다.
 */
export const ARC_RADIUS = 3.0;
/** 나가는 호의 θ 칸 눈금 길이(월드) — 호 테두리를 가운데 두고 안팎으로. */
export const TICK_LENGTH = 0.26;
/** 호 이름표(`θ` · `5θ`)가 호 바깥으로 떨어진 거리(월드). */
export const ARC_LABEL_GAP = 0.34;

/** 공통 초점면 점선의 위 · 아래 끝(월드). 아래 끝은 접안렌즈 아래 이름표보다 높다. */
export const FOCAL_PLANE_TOP = 0.95;
export const FOCAL_PLANE_BOTTOM = -0.45;

/** 초점 거리 치수선 높이(월드). 대물렌즈 아래 끝보다 낮다. */
export const FOCAL_DIM_Y = -1.45;
/** 간격 치수선 높이(월드). 초점 거리 치수선 아래. */
export const GAP_DIM_Y = -1.95;
/**
 * 렌즈 이름표가 렌즈 끝에서 떨어진 거리(월드). 대물렌즈는 위에, 접안렌즈는 아래에 단다 —
 * 접안렌즈 위에는 공통 초점 점선과 이름표가 있다.
 */
export const LENS_LABEL_GAP = 0.28;
/** 초점 점의 반지름(월드). */
export const FOCUS_DOT_RADIUS = 0.06;

/**
 * 프레이밍 — 가로는 줄기 출발점부터 나가는 호 이름표까지, 세로는 렌즈 이름표부터
 * 간격 치수선 아래 캡션 두 줄까지. 매 프레임 같은 값이다 (S-piece · 원칙 6).
 */
export const SCENE_BOUNDS = { minX: -4.0, maxX: 9.6, minY: -2.95, maxY: 1.6 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const telescopeMessages = Object.freeze({
  'label.title': {
    ko: '망원경',
    en: 'Telescope',
    ja: '望遠鏡',
    zh: '望远镜',
    ar: 'التلسكوب',
    es: 'Telescopio',
    fr: 'Lunette astronomique',
    hi: 'दूरदर्शी',
    id: 'Teleskop',
    pt: 'Telescópio',
  },
  'label.operation': {
    ko: '초점 거리 비가 정하는 배율',
    en: 'Magnification set by the ratio of focal lengths',
    ja: '焦点距離の比で決まる倍率',
    zh: '由焦距之比决定的放大率',
    ar: 'تكبير تحدده النسبة بين البعدين البؤريين',
    es: 'Aumento fijado por la razón entre las distancias focales',
    fr: 'Grossissement fixé par le rapport des distances focales',
    hi: 'फोकस दूरियों के अनुपात से तय होने वाला आवर्धन',
    id: 'Perbesaran yang ditentukan oleh perbandingan jarak fokus',
    pt: 'Ampliação definida pela razão entre as distâncias focais',
  },
  'label.stage': {
    ko: '케플러식 망원경',
    en: 'Keplerian telescope',
    ja: 'ケプラー式望遠鏡',
    zh: '开普勒望远镜',
    ar: 'تلسكوب كبلر',
    es: 'Telescopio kepleriano',
    fr: 'Lunette de Kepler',
    hi: 'केप्लर दूरदर्शी',
    id: 'Teleskop Kepler',
    pt: 'Telescópio kepleriano',
  },
  'label.view': {
    ko: '광축과 두 각',
    en: 'Optical axis and two angles',
    ja: '光軸と二つの角',
    zh: '光轴与两个角',
    ar: 'المحور البصري والزاويتان',
    es: 'Eje óptico y dos ángulos',
    fr: 'Axe optique et deux angles',
    hi: 'प्रकाशिक अक्ष और दो कोण',
    id: 'Sumbu optik dan dua sudut',
    pt: 'Eixo óptico e dois ângulos',
  },

  /** 렌즈 이름표. */
  'label.objective': {
    ko: '대물렌즈',
    en: 'objective',
    ja: '対物レンズ',
    zh: '物镜',
    ar: 'العدسة الشيئية',
    es: 'objetivo',
    fr: 'objectif',
    hi: 'अभिदृश्यक',
    id: 'lensa objektif',
    pt: 'objetiva',
  },
  'label.eyepiece': {
    ko: '접안렌즈',
    en: 'eyepiece',
    ja: '接眼レンズ',
    zh: '目镜',
    ar: 'العدسة العينية',
    es: 'ocular',
    fr: 'oculaire',
    hi: 'नेत्रिका',
    id: 'lensa okuler',
    pt: 'ocular',
  },
  /** 공통 초점면 이름표. */
  'label.focus': {
    ko: '공통 초점',
    en: 'shared focus',
    ja: '共通の焦点',
    zh: '公共焦点',
    ar: 'البؤرة المشتركة',
    es: 'foco común',
    fr: 'foyer commun',
    hi: 'उभयनिष्ठ फोकस',
    id: 'fokus bersama',
    pt: 'foco comum',
  },
  /** 들어오는 호 이름표 — 기호라 두 언어가 같다. */
  'label.theta': {
    ko: 'θ',
    en: 'θ',
    ja: 'θ',
    zh: 'θ',
    ar: 'θ',
    es: 'θ',
    fr: 'θ',
    hi: 'θ',
    id: 'θ',
    pt: 'θ',
  },
  /** 나가는 호 이름표. */
  'label.multiple': {
    ko: '{m}θ',
    en: '{m}θ',
    ja: '{m}θ',
    zh: '{m}θ',
    ar: '{m}θ',
    es: '{m}θ',
    fr: '{m}θ',
    hi: '{m}θ',
    id: '{m}θ',
    pt: '{m}θ',
  },
  /** 치수선 값 글자. */
  'label.cm': {
    ko: '{v} cm',
    en: '{v} cm',
    ja: '{v} cm',
    zh: '{v} cm',
    ar: '{v} cm',
    es: '{v} cm',
    fr: '{v} cm',
    hi: '{v} cm',
    id: '{v} cm',
    pt: '{v} cm',
  },

  'caption.long': {
    ko: '대물 {foL} cm · 접안 {feL} cm. θ 만큼 기울어 들어온 평행 줄기가 공통 초점의 한 점에 모였다가, 접안렌즈를 나와 θ 가 {mL} 번 들어가는 각으로 기울어 나간다.',
    en: 'Objective {foL} cm, eyepiece {feL} cm. Parallel rays tilted by θ meet at one point on the shared focus, then leave the eyepiece tilted by an angle that holds θ {mL} times.',
    ja: '対物 {foL} cm・接眼 {feL} cm。θ だけ傾いて入った平行光線は共通の焦点の一点に集まり、接眼レンズを出ると θ が {mL} 個入る角だけ傾いて進む。',
    zh: '物镜 {foL} cm，目镜 {feL} cm。倾斜 θ 射入的平行光线会聚于公共焦点上的一点，再从目镜射出，倾斜的角度可容纳 {mL} 个 θ。',
    ar: 'العدسة الشيئية {foL} cm، والعدسة العينية {feL} cm. تلتقي الأشعة المتوازية المائلة بزاوية θ في نقطة واحدة على البؤرة المشتركة، ثم تخرج من العدسة العينية مائلةً بزاوية تتسع لـ θ {mL} مرات.',
    es: 'Objetivo {foL} cm, ocular {feL} cm. Los rayos paralelos inclinados θ se juntan en un punto del foco común y luego salen del ocular inclinados un ángulo que contiene θ {mL} veces.',
    fr: 'Objectif {foL} cm, oculaire {feL} cm. Les rayons parallèles inclinés de θ se rejoignent en un point du foyer commun, puis sortent de l’oculaire inclinés d’un angle qui contient θ {mL} fois.',
    hi: 'अभिदृश्यक {foL} cm, नेत्रिका {feL} cm। θ झुककर आई समांतर किरणें उभयनिष्ठ फोकस के एक बिंदु पर मिलती हैं, फिर नेत्रिका से ऐसे कोण पर झुककर निकलती हैं जिसमें θ {mL} बार समाता है।',
    id: 'Objektif {foL} cm, okuler {feL} cm. Sinar sejajar yang miring θ bertemu di satu titik pada fokus bersama, lalu keluar dari okuler dengan kemiringan sudut yang memuat θ sebanyak {mL} kali.',
    pt: 'Objetiva {foL} cm, ocular {feL} cm. Raios paralelos inclinados de θ se encontram num ponto do foco comum e depois saem da ocular inclinados num ângulo que contém θ {mL} vezes.',
  },
  'caption.toShort': {
    ko: '접안렌즈를 {feS} cm 짜리로 바꿔 간다 — 두 초점이 겹친 채 접안렌즈가 대물렌즈 쪽으로 다가오고, 나가는 줄기가 더 기운다.',
    en: 'The eyepiece is swapped toward a {feS} cm one — it moves in with the two foci kept together, and the outgoing rays tilt further.',
    ja: '接眼レンズを {feS} cm のものに替えていく — 二つの焦点を重ねたまま接眼レンズが対物レンズ側へ近づき、出ていく光線はさらに傾く。',
    zh: '目镜逐渐换成 {feS} cm 的——两个焦点保持重合，目镜向物镜靠近，射出的光线倾斜得更厉害。',
    ar: 'تُستبدل العدسة العينية تدريجيًا بأخرى بعدها {feS} cm — تقترب مع بقاء البؤرتين متطابقتين، وتميل الأشعة الخارجة أكثر.',
    es: 'El ocular se va cambiando por uno de {feS} cm — se acerca manteniendo juntos los dos focos, y los rayos que salen se inclinan más.',
    fr: 'L’oculaire est remplacé peu à peu par un de {feS} cm — il se rapproche en gardant les deux foyers confondus, et les rayons sortants s’inclinent davantage.',
    hi: 'नेत्रिका को धीरे-धीरे {feS} cm वाली से बदला जाता है — दोनों फोकस मिले रहते हुए वह अभिदृश्यक की ओर खिसकती है, और निकलती किरणें और झुकती हैं।',
    id: 'Okuler diganti perlahan dengan yang {feS} cm — okuler mendekat dengan kedua fokus tetap berimpit, dan sinar yang keluar makin miring.',
    pt: 'A ocular vai sendo trocada por uma de {feS} cm — ela se aproxima mantendo os dois focos juntos, e os raios que saem se inclinam mais.',
  },
  'caption.short': {
    ko: '간격 {gapS} cm. 들어오는 기울기는 그대로 θ 인데, 나가는 각에는 θ 가 {mS} 번 들어간다.',
    en: 'Spacing {gapS} cm. The incoming tilt is still θ, but the outgoing angle now holds θ {mS} times.',
    ja: '間隔 {gapS} cm。入ってくる傾きは θ のままだが、出ていく角には θ が {mS} 個入る。',
    zh: '间距 {gapS} cm。射入的倾角仍是 θ，但射出的角现在可容纳 {mS} 个 θ。',
    ar: 'المسافة الفاصلة {gapS} cm. ما زال الميل الداخل θ، لكن الزاوية الخارجة تتسع الآن لـ θ {mS} مرات.',
    es: 'Separación {gapS} cm. La inclinación de entrada sigue siendo θ, pero el ángulo de salida ahora contiene θ {mS} veces.',
    fr: 'Écart {gapS} cm. L’inclinaison d’entrée vaut toujours θ, mais l’angle de sortie contient maintenant θ {mS} fois.',
    hi: 'दूरी {gapS} cm। आने वाला झुकाव अब भी θ है, पर निकलने वाले कोण में अब θ {mS} बार समाता है।',
    id: 'Jarak {gapS} cm. Kemiringan yang masuk tetap θ, tetapi sudut yang keluar kini memuat θ sebanyak {mS} kali.',
    pt: 'Afastamento {gapS} cm. A inclinação de entrada continua θ, mas o ângulo de saída agora contém θ {mS} vezes.',
  },
  'caption.toLong': {
    ko: '접안렌즈를 다시 {feL} cm 짜리로 바꿔 간다 — 간격이 벌어지고 나가는 줄기가 덜 기운다.',
    en: 'The eyepiece is swapped back toward the {feL} cm one — the spacing opens up and the outgoing rays tilt less.',
    ja: '接眼レンズを再び {feL} cm のものに替えていく — 間隔が広がり、出ていく光線の傾きは小さくなる。',
    zh: '目镜逐渐换回 {feL} cm 的——间距拉大，射出的光线倾斜得少了。',
    ar: 'تُستبدل العدسة العينية تدريجيًا بالعودة إلى ذات {feL} cm — تتسع المسافة الفاصلة وتميل الأشعة الخارجة أقل.',
    es: 'El ocular se va cambiando de nuevo por el de {feL} cm — la separación se abre y los rayos que salen se inclinan menos.',
    fr: 'L’oculaire est remplacé peu à peu par celui de {feL} cm — l’écart se creuse et les rayons sortants s’inclinent moins.',
    hi: 'नेत्रिका को फिर धीरे-धीरे {feL} cm वाली से बदला जाता है — दूरी बढ़ती है और निकलती किरणें कम झुकती हैं।',
    id: 'Okuler diganti perlahan kembali ke yang {feL} cm — jaraknya melebar dan sinar yang keluar kurang miring.',
    pt: 'A ocular vai sendo trocada de volta pela de {feL} cm — o afastamento aumenta e os raios que saem se inclinam menos.',
  },
} satisfies Record<string, LocalizedText>);

export type TelescopeMessageKey = keyof typeof telescopeMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: TelescopeMessageKey): LocalizedText => telescopeMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: TelescopeMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const telescopeSchema: BundleSchema = {
  id: TELESCOPE_ID,
  label: text('label.title'),
  category: 'optics',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다. 접안렌즈를 자동 진행으로 바꿔 끼워 나가는 호가 넓어지는 것을 보인다 —
  // 독자가 직접 해 봐야 하는 것이 없다.
  parameters: [],

  stages: [
    {
      id: 'kepler',
      label: text('label.stage'),
      constants: {
        focalObjectiveCm: FOCAL_OBJECTIVE_CM,
        focalEyeLongCm: FOCAL_EYE_LONG_CM,
        focalEyeShortCm: FOCAL_EYE_SHORT_CM,
        inAngleDeg: IN_ANGLE_DEG,
        shownFocalObjectiveCm: SHOWN_FOCAL_OBJECTIVE_CM,
        shownFocalEyeLongCm: SHOWN_FOCAL_EYE_LONG_CM,
        shownFocalEyeShortCm: SHOWN_FOCAL_EYE_SHORT_CM,
        shownGapLongCm: SHOWN_GAP_LONG_CM,
        shownGapShortCm: SHOWN_GAP_SHORT_CM,
        shownMagLong: SHOWN_MAG_LONG,
        shownMagShort: SHOWN_MAG_SHORT,
        cmPerUnit: CM_PER_UNIT,
        rayCount: RAY_COUNT,
        raySpacing: RAY_SPACING,
      },
    },
  ],

  environments: [],

  views: [{ id: 'axis', label: text('label.view'), default: true }],

  /** 광축 한 줄. 가로로 넓고 세로로 좁다. */
  canvas: { height: 330, minHeight: 290 },

  /** 축 → 호 → 렌즈 → 줄기 → 초점 → 글자 순. 줄기가 렌즈 유리 위로 지나가야 한다. */
  drawOrder: 'scene',

  /**
   * 한 주기 = 긴 접안 이름표가 뜸 → 멈춤 → 짧은 접안으로 바꿔 감 → 이름표가 뜸 → 멈춤 →
   * 긴 접안으로 돌아감.
   *
   * 접안렌즈의 초점 거리 · 자리 · 부푼 정도는 `to-short` · `to-long` 진행도로 읽는다
   * (`physics.ts` `swapShare`). 그 사이의 초점 거리도 두 초점을 겹친 채 계산하므로 줄기와
   * 나가는 호는 바꿔 가는 내내 물리대로 기운다. 호 이름표 · 치수선 값 글자는 `mark-*` 에서
   * 짙어지고 `to-*` 에서 옅어진다.
   */
  timeline: {
    phases: [
      { id: 'mark-long', duration: 0.6, caption: key('caption.long') },
      { id: 'hold-long', duration: 4.4, caption: key('caption.long') },
      { id: 'to-short', duration: 2.6, ease: 'smooth', caption: key('caption.toShort') },
      { id: 'mark-short', duration: 0.6, caption: key('caption.short') },
      { id: 'hold-short', duration: 4.4, caption: key('caption.short') },
      { id: 'to-long', duration: 2.6, ease: 'smooth', caption: key('caption.toLong') },
    ],
  },

  /** 도착한 순간 긴 접안의 줄기 · 호 · 이름표가 다 떠 있다 — `hold-long` 안에서 연다 (S-piece). */
  startAt: 1.0,

  /** 슬롯 하나. 그림 아래 가운데. */
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -6] },
    align: 'center',
    fontSize: 14,
    wrapWidth: 820,
    style: { colorRole: 'ink', emphasis: 'strong' },
    fade: 0.25,
    vars: {
      foL: 'focalObjectiveCm',
      feL: 'focalEyeLongCm',
      feS: 'focalEyeShortCm',
      gapS: 'gapShortCm',
      mL: 'magLong',
      mS: 'magShort',
    },
  },

  // 그리드 · 카메라 단추 · 범례 · 제목 없음(기본). 거리는 치수선이 잰다.

  messages: telescopeMessages,
};
