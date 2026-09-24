// ========================================================================
// apparent-depth — 선언
// ========================================================================
// 질문: 물 밖에서 내려다본 물속 동전은 왜 실제보다 얕은 곳에 있는 것처럼 보이는가?
//
// 답: 바닥 동전에서 나온 두 줄기가 수면에서 법선 밖으로 꺾여 눈에 들어온다. 눈에 들어온
// 줄기를 물속으로 곧게 거꾸로 이으면 두 점선이 동전보다 위 한 점에서 만나고, 동전은 거기
// 떠 보인다. 물을 유리로 바꾸면 만나는 점이 더 올라간다.
//
// 이웃과 겹치지 않게 — `snells-law` 는 들어오는 빛 하나가 매질마다 얼마나 꺾이는지를 각으로,
// 여기서는 꺾인 결과 **물체가 보이는 자리**가 어디로 옮겨 가는지를 깊이로 보인다. 각 글자 ·
// 호 · 법선 거리 막대를 두지 않는다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:apparent-depth` 와 문자 그대로 일치한다 (C4). */
export const APPARENT_DEPTH_ID = 'apparent-depth';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 월드 단위는 cm 다 (수면 y = 0, 위가 공기, 동전이 x = 0).
// ------------------------------------------------------------------------

/** 위 매질(공기)의 굴절률. */
export const N_AIR = 1;
/** 아래 매질 둘의 굴절률 — 물 · 유리. */
export const N_WATER = 1.33;
export const N_GLASS = 1.5;
/** 동전의 실제 깊이(수면에서 동전 윗면까지, cm). */
export const DEPTH_CM = 12;
/**
 * 겉보기 깊이의 정박값(cm). 화면 글자는 이 값을 쓴다 — 점선 교점의 자리는 굴절률과 줄기 각에서
 * 계산하고(물 8.91 · 유리 7.84), 글자와의 차는 0.2 cm 미만이다. 계산값을 반올림해 띄우지 않는다
 * (S-piece 유효숫자). 두 값의 관계(깊이 ÷ 굴절률)는 NOTES (c) G143.
 */
export const WATER_APPARENT_CM = 9;
export const GLASS_APPARENT_CM = 8;
/**
 * 동전에서 나온 두 줄기가 법선과 이루는 각(도, 아래 매질 쪽). 두 줄기는 법선 양쪽으로 대칭이다 —
 * 거의 수직으로 내려다보는 눈에 들어오는 좁은 부채다. 더 좁히면 수면에서 꺾이는 것이 눈에 안 띄고,
 * 더 벌리면 교점이 깊이 ÷ 굴절률에서 멀어진다 — NOTES (b).
 */
export const RAY_DEG = 10;
/** 눈(한가운데)이 수면 위로 떠 있는 높이(cm). 동전 바로 위에 있다. */
export const EYE_HEIGHT_CM = 5.5;

// ------------------------------------------------------------------------
// 배치 — 그림의 치수(월드 cm). 물리량이 아니라 그림의 자리다.
// ------------------------------------------------------------------------

/** 동전의 폭 · 두께. */
export const COIN_W = 2.4;
export const COIN_H = 0.5;
/** 눈(아몬드꼴)의 반폭 · 반높이, 눈동자 테 · 눈동자 반지름. */
export const EYE_HALF_W = 4.4;
export const EYE_HALF_H = 1.5;
export const IRIS_R = 1.1;
export const PUPIL_R = 0.5;
/** 수면 · 바닥 · 물 면이 뻗는 반폭. 가로로 넓은 임베드에서도 캔버스 끝까지 닿게 넉넉히. */
export const WATER_HALF = 40;
/** 굴절점의 법선 점선이 수면 위 · 아래로 뻗는 길이. */
export const NORMAL_UP = 2.4;
export const NORMAL_DOWN = 2.4;
/** 실제 깊이 치수선(왼쪽) · 겉보기 깊이 치수선(오른쪽)의 x. */
export const REAL_DIM_X = -5.2;
export const APPARENT_DIM_X = 5.2;
/** 줄기 위 방향 화살표의 길이와 자리(그 토막 길이에 대한 몫). */
export const ARROW_LEN = 1.3;
export const ARROW_AT = 0.5;
/** 매질 이름 줄의 왼쪽 끝 x 와 첫 줄 y — 물 면 왼쪽 위. 오른쪽 겉보기 깊이 글자와 한 목록처럼 붙지 않게. */
export const MEDIUM_ROW_X = -15;
export const MEDIUM_ROW_Y = -1.3;

/** 프레이밍 — 고정값. 위에 눈, 아래에 캡션 줄 (원칙 6). */
export const SCENE_BOUNDS = { minX: -17, maxX: 17, minY: -16.4, maxY: 7.8 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const apparentDepthMessages = Object.freeze({
  'label.title': {
    ko: '겉보기 깊이',
    en: 'Apparent depth',
    ja: '見かけの深さ',
    zh: '视深',
    ar: 'العمق الظاهري',
    es: 'Profundidad aparente',
    fr: 'Profondeur apparente',
    hi: 'आभासी गहराई',
    id: 'Kedalaman semu',
    pt: 'Profundidade aparente',
  },
  'label.operation': {
    ko: '물속 물체가 떠 보이는 이유',
    en: 'Why things under water look raised',
    ja: '水中の物体が浮き上がって見えるわけ',
    zh: '水下物体为何看起来变浅',
    ar: 'لماذا تبدو الأشياء تحت الماء مرتفعة',
    es: 'Por qué los objetos bajo el agua parecen elevados',
    fr: 'Pourquoi les objets sous l’eau semblent surélevés',
    hi: 'पानी के नीचे की वस्तुएँ ऊपर उठी हुई क्यों दिखती हैं',
    id: 'Mengapa benda di bawah air tampak terangkat',
    pt: "Por que objetos debaixo d'água parecem elevados",
  },
  'label.stage': {
    ko: '동전을 바로 위에서',
    en: 'A coin seen from straight above',
    ja: '真上から見た硬貨',
    zh: '从正上方看硬币',
    ar: 'عملة معدنية من فوقها مباشرة',
    es: 'Una moneda vista desde justo arriba',
    fr: 'Une pièce vue d’en haut, à la verticale',
    hi: 'ठीक ऊपर से देखा गया सिक्का',
    id: 'Koin dilihat tepat dari atas',
    pt: 'Uma moeda vista de cima, na vertical',
  },
  'label.view': {
    ko: '물통 단면',
    en: 'Tank cross-section',
    ja: '水槽の断面',
    zh: '水槽截面',
    ar: 'مقطع عرضي للحوض',
    es: 'Sección transversal del tanque',
    fr: 'Coupe de la cuve',
    hi: 'टंकी का अनुप्रस्थ काट',
    id: 'Penampang tangki',
    pt: 'Corte transversal do tanque',
  },

  /** 매질 이름 줄. 굴절률은 스테이지 상수를 끼운다 (C1). `n` 은 기호라 번역하지 않는다. */
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
  /** 치수선 옆 이름표. */
  'label.realDepth': {
    ko: '실제 {d} cm',
    en: 'Actual {d} cm',
    ja: '実際 {d} cm',
    zh: '实际 {d} cm',
    ar: 'الفعلي {d} cm',
    es: 'Real {d} cm',
    fr: 'Réelle {d} cm',
    hi: 'वास्तविक {d} cm',
    id: 'Sebenarnya {d} cm',
    pt: 'Real {d} cm',
  },
  'label.apparentDepth': {
    ko: '보이는 자리 {d} cm',
    en: 'Seen at {d} cm',
    ja: '見える位置 {d} cm',
    zh: '看起来在 {d} cm',
    ar: 'يُرى عند {d} cm',
    es: 'Se ve a {d} cm',
    fr: 'Vue à {d} cm',
    hi: 'दिखता है {d} cm पर',
    id: 'Terlihat di {d} cm',
    pt: 'Visto a {d} cm',
  },

  'caption.rays': {
    ko: '{d} cm 깊이 바닥의 동전에서 나온 두 줄기가 수면에서 법선 밖으로 꺾여 눈에 들어온다.',
    en: 'Two rays from the coin {d} cm down bend away from the normal at the surface and enter the eye.',
    ja: '深さ{d} cmの底にある硬貨から出た2本の光線が、水面で法線から遠ざかる向きに屈折して目に入る。',
    zh: '从 {d} cm 深处的硬币发出的两条光线在水面处偏离法线折射，进入眼睛。',
    ar: 'شعاعان من العملة على عمق {d} cm ينكسران مبتعدين عن العمود عند السطح ويدخلان العين.',
    es: 'Dos rayos que salen de la moneda, a {d} cm de profundidad, se alejan de la normal en la superficie y entran en el ojo.',
    fr: 'Deux rayons partis de la pièce, à {d} cm de profondeur, s’écartent de la normale à la surface et entrent dans l’œil.',
    hi: '{d} cm गहराई पर रखे सिक्के से निकली दो किरणें सतह पर अभिलंब से दूर मुड़कर आँख में प्रवेश करती हैं।',
    id: 'Dua sinar dari koin di kedalaman {d} cm membelok menjauhi garis normal di permukaan lalu masuk ke mata.',
    pt: 'Dois raios que saem da moeda, a {d} cm de profundidade, se afastam da normal na superfície e entram no olho.',
  },
  'caption.extend': {
    ko: '눈에 들어온 두 줄기를 물속으로 곧게 거꾸로 이어 본다.',
    en: 'Trace the two rays that reached the eye straight back down into the water.',
    ja: '目に入った2本の光線を、水中へまっすぐ逆にたどる。',
    zh: '把进入眼睛的两条光线沿直线反向延长到水中。',
    ar: 'نمدّ الشعاعين اللذين وصلا إلى العين إلى الخلف في خط مستقيم داخل الماء.',
    es: 'Se prolongan hacia atrás, en línea recta dentro del agua, los dos rayos que llegaron al ojo.',
    fr: 'On prolonge en ligne droite, vers le bas dans l’eau, les deux rayons arrivés à l’œil.',
    hi: 'आँख तक पहुँची दोनों किरणों को सीधे पीछे की ओर पानी के भीतर बढ़ाया जाता है।',
    id: 'Dua sinar yang sampai ke mata diperpanjang lurus ke belakang ke dalam air.',
    pt: 'Os dois raios que chegaram ao olho são prolongados em linha reta de volta para dentro da água.',
  },
  'caption.water': {
    ko: '두 점선은 동전보다 위, {a} cm 깊이에서 만난다 — 눈에는 동전이 그 자리에 떠 보인다.',
    en: 'The dashed lines meet above the coin, {a} cm down — to the eye, the coin sits up there.',
    ja: '2本の点線は硬貨より上、深さ{a} cmで交わる — 目には硬貨がそこにあるように見える。',
    zh: '两条虚线在硬币上方、{a} cm 深处相交——在眼睛看来，硬币就在那里。',
    ar: 'يلتقي الخطان المتقطعان فوق العملة، على عمق {a} cm — وفي نظر العين، تقع العملة هناك.',
    es: 'Las líneas discontinuas se cruzan por encima de la moneda, a {a} cm de profundidad — para el ojo, la moneda está ahí arriba.',
    fr: 'Les pointillés se croisent au-dessus de la pièce, à {a} cm de profondeur — pour l’œil, la pièce se trouve là-haut.',
    hi: 'दोनों बिंदुकित रेखाएँ सिक्के से ऊपर, {a} cm गहराई पर मिलती हैं — आँख को सिक्का वहीं दिखता है।',
    id: 'Kedua garis putus-putus bertemu di atas koin, pada kedalaman {a} cm — bagi mata, koin berada di sana.',
    pt: 'As linhas tracejadas se encontram acima da moeda, a {a} cm de profundidade — para o olho, a moeda está ali em cima.',
  },
  'caption.toGlass': {
    ko: '동전은 그대로 두고, 물을 유리로 바꾼다.',
    en: 'The coin stays put; the water is replaced with glass.',
    ja: '硬貨はそのままで、水をガラスに替える。',
    zh: '硬币不动，把水换成玻璃。',
    ar: 'تبقى العملة في مكانها، ويُستبدل الماء بالزجاج.',
    es: 'La moneda se queda donde está; el agua se sustituye por vidrio.',
    fr: 'La pièce ne bouge pas ; l’eau est remplacée par du verre.',
    hi: 'सिक्का अपनी जगह रहता है; पानी की जगह काँच आ जाता है।',
    id: 'Koin tetap di tempatnya; air diganti dengan kaca.',
    pt: 'A moeda fica onde está; a água é trocada por vidro.',
  },
  'caption.glass': {
    ko: '유리에서는 점선이 {g} cm 에서 만난다 — 옅게 남은 물의 자리 {a} cm 보다 더 떴다.',
    en: 'In glass the dashed lines meet at {g} cm — higher than the faint {a} cm spot left from water.',
    ja: 'ガラスでは点線が{g} cmで交わる — 薄く残った水のときの位置{a} cmより高い。',
    zh: '在玻璃中，虚线在 {g} cm 处相交——比水留下的淡淡的 {a} cm 位置更高。',
    ar: 'في الزجاج يلتقي الخطان المتقطعان عند {g} cm — أعلى من الموضع الباهت {a} cm الباقي من الماء.',
    es: 'En el vidrio las líneas discontinuas se cruzan a {g} cm — más arriba que la marca tenue de {a} cm que dejó el agua.',
    fr: 'Dans le verre, les pointillés se croisent à {g} cm — plus haut que la trace pâle à {a} cm laissée par l’eau.',
    hi: 'काँच में बिंदुकित रेखाएँ {g} cm पर मिलती हैं — पानी से बचे हल्के {a} cm वाले स्थान से ऊपर।',
    id: 'Di kaca, garis putus-putus bertemu di {g} cm — lebih tinggi daripada titik samar {a} cm yang tersisa dari air.',
    pt: 'No vidro, as linhas tracejadas se encontram a {g} cm — mais alto que a marca tênue de {a} cm deixada pela água.',
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

export type ApparentDepthMessageKey = keyof typeof apparentDepthMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: ApparentDepthMessageKey): LocalizedText => apparentDepthMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ApparentDepthMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const apparentDepthSchema: BundleSchema = {
  id: APPARENT_DEPTH_ID,
  label: text('label.title'),
  category: 'optics',
  operation: text('label.operation'),
  timeModel: 'periodic',
  parameters: [],
  stages: [
    {
      id: 'coin-from-above',
      label: text('label.stage'),
      constants: {
        nAir: N_AIR,
        nWater: N_WATER,
        nGlass: N_GLASS,
        depthCm: DEPTH_CM,
        waterApparentCm: WATER_APPARENT_CM,
        glassApparentCm: GLASS_APPARENT_CM,
        rayDeg: RAY_DEG,
        eyeHeightCm: EYE_HEIGHT_CM,
      },
    },
  ],
  environments: [],
  views: [{ id: 'section', label: text('label.view'), default: true }],

  /** 위에 눈, 가운데 물과 동전, 아래 캡션 줄. */
  canvas: { height: 440, minHeight: 360 },

  /**
   * 겹침이 판정 장치다 — 줄기 끝을 눈이 덮어 「눈에 들어간다」 로 읽히고, 동전이 줄기 시작을
   * 덮는다. 먼저 쓴 것이 아래다 (S-render).
   */
  drawOrder: 'scene',

  /** 도착한 순간 이미 동전에서 나온 줄기가 눈에 들어가 있다 (S-piece). */
  startAt: 0.8,

  /**
   * 한 주기 14.6 초.
   *
   * - `water` — 동전에서 나온 두 줄기가 수면에서 꺾여 눈에 들어간다.
   * - `extend` — 눈에 들어온 줄기를 물속으로 곧게 거꾸로 잇는 점선이 자란다.
   * - `appear` — 점선이 만난 자리에 속 빈 동전(보이는 자리)과 겉보기 깊이 치수가 나타난다.
   * - `waterHold` — 머문다.
   * - `toGlass` — 물이 유리로 바뀌며 공기 쪽 줄기가 더 벌어지고, 교점 · 보이는 동전이 올라간다.
   *   물에서 보이던 자리는 옅게 남는다.
   * - `glassHold` — 머문다.
   * - `reset` — 다시 물로. 점선 · 보이는 동전이 옅어진다.
   */
  timeline: {
    phases: [
      { id: 'water', duration: 2.4, caption: key('caption.rays') },
      { id: 'extend', duration: 2.0, ease: 'smooth', caption: key('caption.extend') },
      { id: 'appear', duration: 0.6, ease: 'smooth', caption: key('caption.water') },
      { id: 'waterHold', duration: 3.4, caption: key('caption.water') },
      { id: 'toGlass', duration: 1.4, ease: 'smooth', caption: key('caption.toGlass') },
      { id: 'glassHold', duration: 3.6, caption: key('caption.glass') },
      { id: 'reset', duration: 1.2, ease: 'smooth', caption: key('caption.reset') },
    ],
  },

  /** 슬롯 하나. 캡션 속 깊이는 스테이지 상수에서 `initialState` 가 만든 문자열이다 (G133). */
  caption: {
    anchor: { screen: 'bottom-left', offset: [18, -6] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 560,
    style: { colorRole: 'ink', emphasis: 'strong' },
    vars: {
      d: 'depthText',
      a: 'waterApparentText',
      g: 'glassApparentText',
    },
  },

  // 그리드 · 카메라 단추 · 제목 · 범례 없음(기본). 깊이는 치수선 둘이 잰다.

  messages: apparentDepthMessages,
};
