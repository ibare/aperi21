// ========================================================================
// snells-law — 선언
// ========================================================================
// 질문: 같은 각으로 들어온 빛인데, 들어가는 매질이 달라지면 꺾이는 정도도 달라지는가?
//
// 답: 들어오는 줄기는 그대로 두고 아래 매질만 물 → 유리 → 다이아몬드로 바꾸면, 꺾인 줄기가
// 매질을 바꿀 때마다 법선 쪽으로 더 돌아간다. 지난 줄기가 옅게 남아 마지막에는 세 줄기가
// 부채처럼 펼쳐진다.
//
// 이웃과 겹치지 않게 — `refraction-of-waves` 는 마루가 뒤처져 꺾이는 **까닭**을, 여기서는
// 꺾이는 **정도가 매질을 따라 달라지는 것**을 줄기 하나로 보인다. `total-internal-reflection` 은
// 빽빽한 쪽에서 나가는 빛이고, 여기서는 공기에서 들어가는 빛이다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:snells-law` 와 문자 그대로 일치한다 (C4). */
export const SNELLS_LAW_ID = 'snells-law';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 위 매질(공기)의 굴절률. */
export const N_AIR = 1.0;
/** 아래 매질 셋의 굴절률 — 물 · 유리 · 다이아몬드. */
export const N_WATER = 1.33;
export const N_GLASS = 1.5;
export const N_DIAMOND = 2.42;
/** 들어오는 각(법선에서 잰 도). 세 매질 모두 같은 각이다. */
export const INCIDENT_DEG = 45;
/**
 * 꺾인 각의 정박값(도). 화면 글자는 이 값을 쓴다 — 줄기 그림은 굴절률에서 계산한 각이고
 * 둘은 0.05° 안에서 같다(32.12 · 28.13 · 16.99). 계산값을 반올림해 띄우지 않는다 (S-piece 유효숫자).
 */
export const WATER_DEG = 32.1;
export const GLASS_DEG = 28.1;
export const DIAMOND_DEG = 17.0;
/** 각 · 굴절률 글자의 소수 자릿수. `17.0` · `1.50` 의 끝자리 0 을 지키려고 선언한다. */
export const ANGLE_DIGITS = 1;
export const INDEX_DIGITS = 2;

// ------------------------------------------------------------------------
// 배치 — 월드 단위는 임의(입사점이 원점, 경계면이 y = 0, 위가 공기).
// ------------------------------------------------------------------------

/** 원 틀의 반지름. 법선 거리 막대는 이 원과 줄기가 만나는 자리에서 잰다. */
export const CIRCLE_R = 1.9;
/** 줄기 길이(입사점에서). 원 밖으로 조금 나간다. */
export const RAY_LEN = 2.35;
/** 법선 · 경계면이 뻗는 길이. */
export const NORMAL_UP = 2.2;
export const NORMAL_DOWN = 2.45;
/**
 * 경계면 · 아래 매질 면이 뻗는 반폭과 면의 깊이. 가로로 넓은 임베드에서도 캔버스 끝까지 닿도록
 * 넉넉히 잡는다 — 면 끝이 캡션 줄을 가로지르지 않게.
 */
export const BOUNDARY_HALF = 12;
export const MEDIUM_DEPTH = 8;
/** 각 호의 반지름. 들어오는 쪽 · 꺾인 쪽이 같다. */
export const ARC_R = 0.62;
/** 들어오는 각 글자를 호 바깥으로 띄우는 거리(월드). */
export const ARC_LABEL_GAP = 0.3;
/**
 * 꺾인 각 글자의 자리 — 법선 **왼쪽**, 호 높이쯤. 꺾인 각이 작아 호 안쪽 이등분선에 두면
 * 법선 점선과 겹친다. 빈 왼쪽 아래에 두고 강조색으로 호와 잇는다.
 */
export const REFRACTED_LABEL_AT = [-0.14, -0.5] as const;
/** 줄기 위 방향 화살표의 길이와 자리(줄기 길이에 대한 몫). */
export const ARROW_LEN = 0.34;
export const ARROW_AT = 0.55;
/** 매질 이름 칸의 왼쪽 끝 x, 공기 이름 y, 아래 매질 첫 줄 y. */
export const COLUMN_X = 2.25;
export const AIR_LABEL_Y = 0.55;
export const MEDIUM_ROW_Y = -0.55;

/** 프레이밍 — 고정값. 오른쪽에 매질 이름 칸, 아래에 캡션 줄 (원칙 6). */
export const SCENE_BOUNDS = { minX: -3.0, maxX: 4.6, minY: -3.15, maxY: 2.45 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const snellsLawMessages = Object.freeze({
  'label.title': {
    ko: '굴절 법칙',
    en: "Snell's law",
    ja: 'スネルの法則',
    zh: '斯涅尔定律',
    ar: 'قانون سنل',
    es: 'Ley de Snell',
    fr: 'Loi de Snell-Descartes',
    hi: 'स्नेल का नियम',
    id: 'Hukum Snellius',
    pt: 'Lei de Snell',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '매질에 따른 경로 꺾임',
    en: 'How the path bends with the medium',
    ja: '媒質による光路の曲がり方',
    zh: '路径随介质的偏折',
    ar: 'كيف ينحني المسار باختلاف الوسط',
    es: 'Cómo se desvía la trayectoria según el medio',
    fr: 'Comment le trajet dévie selon le milieu',
    hi: 'माध्यम के साथ पथ कैसे मुड़ता है',
    id: 'Bagaimana lintasan membelok menurut medium',
    pt: 'Como o caminho se desvia conforme o meio',
  },
  'label.stage': {
    ko: '공기에서 세 매질로',
    en: 'From air into three media',
    ja: '空気から三つの媒質へ',
    zh: '从空气进入三种介质',
    ar: 'من الهواء إلى ثلاثة أوساط',
    es: 'Del aire a tres medios',
    fr: 'De l’air vers trois milieux',
    hi: 'वायु से तीन माध्यमों में',
    id: 'Dari udara ke tiga medium',
    pt: 'Do ar para três meios',
  },
  'label.view': {
    ko: '입사점',
    en: 'Point of incidence',
    ja: '入射点',
    zh: '入射点',
    ar: 'نقطة السقوط',
    es: 'Punto de incidencia',
    fr: 'Point d’incidence',
    hi: 'आपतन बिंदु',
    id: 'Titik datang',
    pt: 'Ponto de incidência',
  },

  /** 매질 이름 줄. 굴절률은 스테이지 상수를 끼운다 (C1). `n` 은 기호라 번역하지 않는다. */
  'label.air': {
    ko: '공기 · n {n}',
    en: 'Air · n {n}',
    ja: '空気 · n {n}',
    zh: '空气 · n {n}',
    ar: 'الهواء · n {n}',
    es: 'Aire · n {n}',
    fr: 'Air · n {n}',
    hi: 'वायु · n {n}',
    id: 'Udara · n {n}',
    pt: 'Ar · n {n}',
  },
  'label.water': {
    ko: '물 · n {n}',
    en: 'Water · n {n}',
    ja: '水 · n {n}',
    zh: '水 · n {n}',
    ar: 'الماء · n {n}',
    es: 'Agua · n {n}',
    fr: 'Eau · n {n}',
    hi: 'जल · n {n}',
    id: 'Air · n {n}',
    pt: 'Água · n {n}',
  },
  'label.glass': {
    ko: '유리 · n {n}',
    en: 'Glass · n {n}',
    ja: 'ガラス · n {n}',
    zh: '玻璃 · n {n}',
    ar: 'الزجاج · n {n}',
    es: 'Vidrio · n {n}',
    fr: 'Verre · n {n}',
    hi: 'काँच · n {n}',
    id: 'Kaca · n {n}',
    pt: 'Vidro · n {n}',
  },
  'label.diamond': {
    ko: '다이아몬드 · n {n}',
    en: 'Diamond · n {n}',
    ja: 'ダイヤモンド · n {n}',
    zh: '金刚石 · n {n}',
    ar: 'الألماس · n {n}',
    es: 'Diamante · n {n}',
    fr: 'Diamant · n {n}',
    hi: 'हीरा · n {n}',
    id: 'Intan · n {n}',
    pt: 'Diamante · n {n}',
  },
  /** 각 글자. 기호 조립이라 두 언어가 같다. */
  'label.deg': {
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

  'caption.water': {
    ko: '공기에서 {i}° 로 들어온 빛이 물로 들어가며 법선 쪽으로 꺾인다 — 물 속에서는 {w}°.',
    en: 'Light coming in from air at {i}° bends toward the normal as it enters water — {w}° inside the water.',
    ja: '空気から{i}°で入射した光は、水に入るとき法線の側へ屈折する — 水中では{w}°。',
    zh: '从空气以 {i}° 入射的光进入水中时向法线偏折——在水中为 {w}°。',
    ar: 'الضوء القادم من الهواء بزاوية {i}° ينكسر مقتربًا من العمود عند دخوله الماء — {w}° داخل الماء.',
    es: 'La luz que llega desde el aire a {i}° se desvía hacia la normal al entrar en el agua — {w}° dentro del agua.',
    fr: 'La lumière qui arrive de l’air à {i}° se rapproche de la normale en entrant dans l’eau — {w}° dans l’eau.',
    hi: 'वायु से {i}° पर आता प्रकाश जल में प्रवेश करते हुए अभिलंब की ओर मुड़ता है — जल के भीतर {w}°।',
    id: 'Cahaya yang datang dari udara pada {i}° membelok mendekati garis normal saat masuk ke air — {w}° di dalam air.',
    pt: 'A luz que vem do ar a {i}° se desvia em direção à normal ao entrar na água — {w}° dentro da água.',
  },
  'caption.toGlass': {
    ko: '들어오는 빛은 그대로 두고, 아래 매질만 유리로 바꾼다.',
    en: 'The incoming light stays as it is; only the lower medium changes to glass.',
    ja: '入射光はそのままで、下の媒質だけをガラスに替える。',
    zh: '入射光保持不变，只把下方介质换成玻璃。',
    ar: 'يبقى الضوء الداخل كما هو؛ ويتغير الوسط السفلي وحده إلى زجاج.',
    es: 'La luz incidente queda igual; solo el medio inferior cambia a vidrio.',
    fr: 'La lumière incidente reste la même ; seul le milieu du bas devient du verre.',
    hi: 'आपतित प्रकाश जैसा है वैसा ही रहता है; केवल नीचे का माध्यम काँच में बदलता है।',
    id: 'Cahaya datang tetap seperti semula; hanya medium bawah yang berganti menjadi kaca.',
    pt: 'A luz incidente continua igual; só o meio de baixo passa a ser vidro.',
  },
  'caption.glass': {
    ko: '같은 {i}° 로 들어왔는데 유리 속에서는 {g}° — 물에서보다 법선에 더 붙었다.',
    en: 'The same {i}° coming in, but {g}° inside glass — closer to the normal than in water.',
    ja: '同じ{i}°で入射しても、ガラスの中では{g}° — 水のときより法線に近い。',
    zh: '同样以 {i}° 入射，在玻璃中却是 {g}°——比在水中更靠近法线。',
    ar: 'الزاوية الداخلة نفسها {i}°، لكنها {g}° داخل الزجاج — أقرب إلى العمود مما في الماء.',
    es: 'Entra con los mismos {i}°, pero dentro del vidrio son {g}° — más cerca de la normal que en el agua.',
    fr: 'Même angle d’entrée de {i}°, mais {g}° dans le verre — plus près de la normale que dans l’eau.',
    hi: 'वही {i}° आपतन, पर काँच के भीतर {g}° — जल की तुलना में अभिलंब के और पास।',
    id: 'Masuk dengan {i}° yang sama, tetapi {g}° di dalam kaca — lebih dekat ke garis normal daripada di air.',
    pt: 'Os mesmos {i}° na entrada, mas {g}° dentro do vidro — mais perto da normal do que na água.',
  },
  'caption.toDiamond': {
    ko: '아래 매질을 다이아몬드로 바꾼다.',
    en: 'The lower medium changes to diamond.',
    ja: '下の媒質をダイヤモンドに替える。',
    zh: '把下方介质换成金刚石。',
    ar: 'يتغير الوسط السفلي إلى ألماس.',
    es: 'El medio inferior cambia a diamante.',
    fr: 'Le milieu du bas devient du diamant.',
    hi: 'नीचे का माध्यम हीरे में बदलता है।',
    id: 'Medium bawah berganti menjadi intan.',
    pt: 'O meio de baixo passa a ser diamante.',
  },
  'caption.diamond': {
    ko: '다이아몬드 속에서는 {d}°. 들어온 빛은 한 번도 움직이지 않았고, 꺾인 빛만 {w}° → {g}° → {d}° 로 법선에 다가갔다.',
    en: 'Inside diamond it is {d}°. The incoming light never moved; only the bent light closed in on the normal: {w}° → {g}° → {d}°.',
    ja: 'ダイヤモンドの中では{d}°。入射光は一度も動かず、屈折光だけが{w}° → {g}° → {d}°と法線に近づいた。',
    zh: '在金刚石中为 {d}°。入射光始终没有动，只有折射光向法线靠近：{w}° → {g}° → {d}°。',
    ar: 'داخل الألماس تصبح {d}°. لم يتحرك الضوء الداخل قط؛ وحده الضوء المنكسر اقترب من العمود: {w}° → {g}° → {d}°.',
    es: 'Dentro del diamante son {d}°. La luz incidente no se movió nunca; solo la luz refractada se acercó a la normal: {w}° → {g}° → {d}°.',
    fr: 'Dans le diamant, {d}°. La lumière incidente n’a jamais bougé ; seule la lumière réfractée s’est rapprochée de la normale : {w}° → {g}° → {d}°.',
    hi: 'हीरे के भीतर यह {d}° है। आपतित प्रकाश एक बार भी नहीं हिला; केवल अपवर्तित प्रकाश अभिलंब के पास आया: {w}° → {g}° → {d}°।',
    id: 'Di dalam intan sudutnya {d}°. Cahaya datang tidak pernah bergerak; hanya cahaya bias yang mendekati garis normal: {w}° → {g}° → {d}°.',
    pt: 'Dentro do diamante são {d}°. A luz incidente nunca se moveu; só a luz refratada se aproximou da normal: {w}° → {g}° → {d}°.',
  },
  'caption.reset': {
    ko: '다시 물로 돌아간다.',
    en: 'Back to water.',
    ja: '再び水に戻る。',
    zh: '回到水。',
    ar: 'العودة إلى الماء.',
    es: 'De vuelta al agua.',
    fr: 'Retour à l’eau.',
    hi: 'फिर से जल पर।',
    id: 'Kembali ke air.',
    pt: 'De volta à água.',
  },
} satisfies Record<string, LocalizedText>);

export type SnellsLawMessageKey = keyof typeof snellsLawMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: SnellsLawMessageKey): LocalizedText => snellsLawMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: SnellsLawMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const snellsLawSchema: BundleSchema = {
  id: SNELLS_LAW_ID,
  label: text('label.title'),
  category: 'optics',
  description: text('label.description'),
  timeModel: 'periodic',
  parameters: [],
  stages: [
    {
      id: 'air-into-media',
      label: text('label.stage'),
      constants: {
        nAir: N_AIR,
        nWater: N_WATER,
        nGlass: N_GLASS,
        nDiamond: N_DIAMOND,
        incidentDeg: INCIDENT_DEG,
        waterDeg: WATER_DEG,
        glassDeg: GLASS_DEG,
        diamondDeg: DIAMOND_DEG,
        angleDigits: ANGLE_DIGITS,
        indexDigits: INDEX_DIGITS,
      },
    },
  ],
  environments: [],
  views: [{ id: 'incidence', label: text('label.view'), default: true }],

  /** 가로로 넓다 — 왼쪽 원 틀, 오른쪽 매질 이름 칸, 아래 캡션 줄. */
  canvas: { height: 400, minHeight: 340 },

  /** 도착한 순간 이미 물 속으로 꺾인 줄기가 서 있다 (S-piece). */
  startAt: 0.6,

  /**
   * 한 주기 14.4 초.
   *
   * - `water` · `glass` · `diamond` — 그 매질에 머문다. 꺾인 각 글자가 뜬다.
   * - `toGlass` · `toDiamond` — 아래 매질이 바뀌는 동안 꺾인 줄기가 새 각으로 돈다.
   *   떠난 매질의 줄기는 옅은 점선으로 남는다.
   * - `reset` — 다시 물로. 남은 줄기가 옅어진다.
   */
  timeline: {
    phases: [
      { id: 'water', duration: 3.2, caption: key('caption.water') },
      { id: 'toGlass', duration: 1.4, ease: 'smooth', caption: key('caption.toGlass') },
      { id: 'glass', duration: 3.2, caption: key('caption.glass') },
      { id: 'toDiamond', duration: 1.4, ease: 'smooth', caption: key('caption.toDiamond') },
      { id: 'diamond', duration: 4.0, caption: key('caption.diamond') },
      { id: 'reset', duration: 1.2, ease: 'smooth', caption: key('caption.reset') },
    ],
  },

  /** 슬롯 하나. 캡션 속 각은 스테이지 상수에서 `initialState` 가 만든 문자열이다. */
  caption: {
    anchor: { screen: 'bottom-left', offset: [18, -6] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 520,
    style: { colorRole: 'ink', emphasis: 'strong' },
    vars: {
      i: 'incidentText',
      w: 'waterText',
      g: 'glassText',
      d: 'diamondText',
    },
  },

  // 그리드 · 카메라 단추 · 제목 · 범례 없음(기본). 재는 것은 거리가 아니라 법선에서 벌어진 각이다.

  messages: snellsLawMessages,
};
