// ========================================================================
// wavefront-and-ray — 선언
// ========================================================================
// 질문: 파면과 광선은 어떤 사이인가. 점파원 곁의 동그란 파면에서도, 멀리 가서 평평해진
// 파면에서도 같은 관계인가?
//
// 동사: **직각을 지킨다.** 한 판의 수조를 점파원 바로 곁에서 아주 먼 자리까지 옮겨 가며
// 본다. 곁에서는 파면이 동그랗고 광선이 파원에서 부채꼴로 벌어진다. 멀어질수록 파면이
// 펴지고 광선이 나란해진다. 그동안 파면은 쉬지 않고 바깥으로 나아가고, 굵게 따라가는 파면
// 하나와 광선이 만나는 자리마다 직각 표지가 그 면을 타고 함께 움직인다.
//
// 두지 않은 것: 굴절(refraction-of-waves 몫) · 회절(diffraction 몫) · 하위헌스 작은 파원
// 작도(huygens-principle 몫) · 거리에 따른 세기 감쇠 · 수치.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:wavefront-and-ray` 와 문자 그대로 일치한다 (C4). */
export const WAVEFRONT_AND_RAY_ID = 'wavefront-and-ray';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 파장(월드). */
export const WAVELENGTH = 60;
/** 파의 속력(월드/초). 파장과 같아 주기가 1 초다. */
export const WAVE_SPEED = 60;
/** 가장 가까울 때 파원에서 기준점까지 거리(월드). 파원이 판 안에 보인다. */
export const NEAR_DISTANCE = 200;
/**
 * 가장 멀 때 파원에서 기준점까지 거리(월드). 판 높이만큼의 파면이 거의 곧은 선이 되는 거리 —
 * 판 위아래 끝에서 파면이 곧은 선과 벌어지는 틈은 1 월드도 안 된다.
 */
export const FAR_DISTANCE = 40000;

// ------------------------------------------------------------------------
// 배치 — 월드 단위(y 는 위). 위에서 내려다본 수조 한 판.
// ------------------------------------------------------------------------

/** 판 가로 · 세로(월드). */
export const FIELD_W = 840;
export const FIELD_H = 340;
/**
 * 기준점 — 파원에서 이 점까지가 「파원 거리」 이고, 광선은 모두 이 세로줄의 정해진 높이를
 * 지난다. 판이 파원에서 멀어져도 같은 광선 다발을 따라 보게 된다.
 */
export const REF_X = 300;
export const REF_Y = FIELD_H / 2;
/** 광선이 기준 세로줄을 지나는 높이 — 기준점에서 위아래로 얼마나 떨어졌나(월드). */
export const RAY_OFFSETS = [-150, -100, -50, 0, 50, 100, 150] as const;

/** 물결 장을 계산하는 격자 한 칸(월드). 상태로 계산하지 않는 표본 간격이다. */
export const CELL = 6;
/** 파면(원호) 하나를 표본하는 점 수. */
export const ARC_SAMPLES = 144;

/** 프레이밍 — 판 아래에 캡션 한 줄 자리를 둔다 (G24). 매 프레임 같은 값이다 (원칙 6). */
export const SCENE_BOUNDS = { minX: 0, maxX: FIELD_W, minY: -44, maxY: FIELD_H } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이(초)
// ------------------------------------------------------------------------

/** 파원 곁 — 동그란 파면과 부채꼴 광선을 읽는 동안. */
export const NEAR = 4;
/** 판이 파원에서 멀어지는 동안. */
export const RECEDE = 6;
/** 아주 먼 곳 — 곧은 파면과 나란한 광선을 읽는 동안. */
export const FAR = 4;
/** 다시 파원 곁으로 돌아오는 동안. */
export const RETURN = 3;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const wavefrontAndRayMessages = Object.freeze({
  'label.title': {
    ko: '파면과 광선',
    en: 'Wavefronts and rays',
    ja: '波面と射線',
    zh: '波前与波线',
    ar: 'جبهات الموجة والأشعة',
    es: 'Frentes de onda y rayos',
    fr: 'Fronts d’onde et rayons',
    hi: 'तरंगाग्र और किरणें',
    id: 'Muka gelombang dan sinar',
    pt: 'Frentes de onda e raios',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '같은 위상의 면과 그 수직선',
    en: 'Surfaces of equal phase and the lines normal to them',
    ja: '位相の等しい面とそれに垂直な線',
    zh: '同相位的面及其法线',
    ar: 'أسطح الطور المتساوي والخطوط العمودية عليها',
    es: 'Superficies de igual fase y las líneas normales a ellas',
    fr: 'Surfaces d’égale phase et les lignes qui leur sont normales',
    hi: 'समान कला वाले पृष्ठ और उन पर अभिलंब रेखाएँ',
    id: 'Permukaan sefase dan garis-garis yang tegak lurus padanya',
    pt: 'Superfícies de mesma fase e as linhas normais a elas',
  },
  'label.stage': {
    ko: '점파원',
    en: 'Point source',
    ja: '点波源',
    zh: '点波源',
    ar: 'مصدر نقطي',
    es: 'Fuente puntual',
    fr: 'Source ponctuelle',
    hi: 'बिंदु स्रोत',
    id: 'Sumber titik',
    pt: 'Fonte pontual',
  },
  'label.view': {
    ko: '위에서 본 수조',
    en: 'Ripple tank from above',
    ja: '上から見たリップルタンク',
    zh: '俯视水波槽',
    ar: 'حوض الموجات من الأعلى',
    es: 'Cubeta de ondas vista desde arriba',
    fr: 'Cuve à ondes vue de dessus',
    hi: 'ऊपर से देखा गया रिपल टैंक',
    id: 'Tangki riak dilihat dari atas',
    pt: 'Cuba de ondas vista de cima',
  },
  'caption.near': {
    ko: '파원 곁 — 동그란 파면, 부채꼴로 뻗는 광선. 만나는 곳마다 직각이다',
    en: 'Near the source — round fronts, rays fanning out, crossing each front at a right angle',
    ja: '波源の近く — 丸い波面、扇形に広がる射線。どの波面とも直角に交わる',
    zh: '波源附近 — 圆形的波前，扇形散开的波线，与每个波前都垂直相交',
    ar: 'قرب المصدر — جبهات مستديرة، وأشعة تنتشر كالمروحة، تقطع كل جبهة بزاوية قائمة',
    es: 'Cerca de la fuente — frentes redondos, rayos abiertos en abanico que cruzan cada frente en ángulo recto',
    fr: 'Près de la source — fronts ronds, rayons en éventail, qui coupent chaque front à angle droit',
    hi: 'स्रोत के पास — गोल तरंगाग्र, पंखे की तरह फैलती किरणें, जो हर तरंगाग्र को समकोण पर काटती हैं',
    id: 'Dekat sumber — muka gelombang bundar, sinar menyebar seperti kipas, memotong tiap muka gelombang tegak lurus',
    pt: 'Perto da fonte — frentes redondas, raios abertos em leque, cruzando cada frente em ângulo reto',
  },
  'caption.recede': {
    ko: '파원에서 멀어질수록 파면이 펴지고, 광선은 직각을 지키며 나란해진다',
    en: 'Farther from the source the fronts flatten, and the rays turn parallel, still at right angles',
    ja: '波源から離れるほど波面は平らになり、射線は直角を保ったまま平行になる',
    zh: '离波源越远，波前越平，波线保持垂直并逐渐变得平行',
    ar: 'كلما ابتعدنا عن المصدر استوت الجبهات، وصارت الأشعة متوازية، ولا تزال بزوايا قائمة',
    es: 'Más lejos de la fuente los frentes se aplanan y los rayos se vuelven paralelos, aún en ángulo recto',
    fr: 'Plus loin de la source, les fronts s’aplatissent et les rayons deviennent parallèles, toujours à angle droit',
    hi: 'स्रोत से दूर जाने पर तरंगाग्र चपटे होते जाते हैं, और किरणें समकोण बनाए रखते हुए समांतर हो जाती हैं',
    id: 'Makin jauh dari sumber, muka gelombang makin datar, dan sinar menjadi sejajar, tetap tegak lurus',
    pt: 'Mais longe da fonte, as frentes se achatam e os raios ficam paralelos, ainda em ângulo reto',
  },
  'caption.far': {
    ko: '아주 먼 곳 — 곧은 파면, 나란한 광선. 여전히 서로 직각이다',
    en: 'Very far away — straight fronts, parallel rays, still at right angles',
    ja: 'はるか遠く — まっすぐな波面、平行な射線。やはり互いに直角だ',
    zh: '很远的地方 — 平直的波前，平行的波线，仍然相互垂直',
    ar: 'بعيدًا جدًا — جبهات مستقيمة، وأشعة متوازية، ولا تزال بزوايا قائمة',
    es: 'Muy lejos — frentes rectos, rayos paralelos, todavía en ángulo recto',
    fr: 'Très loin — fronts rectilignes, rayons parallèles, toujours à angle droit',
    hi: 'बहुत दूर — सीधे तरंगाग्र, समांतर किरणें, अब भी समकोण पर',
    id: 'Sangat jauh — muka gelombang lurus, sinar sejajar, tetap tegak lurus',
    pt: 'Muito longe — frentes retas, raios paralelos, ainda em ângulo reto',
  },
  'caption.return': {
    ko: '다시 파원 곁으로 — 파면이 둥글어지고 광선이 벌어진다',
    en: 'Back near the source — the fronts curve again and the rays spread apart',
    ja: '再び波源の近くへ — 波面は丸みを取り戻し、射線は広がる',
    zh: '回到波源附近 — 波前重新弯曲，波线散开',
    ar: 'العودة إلى قرب المصدر — تنحني الجبهات من جديد وتتباعد الأشعة',
    es: 'De vuelta cerca de la fuente — los frentes se curvan otra vez y los rayos se separan',
    fr: 'Retour près de la source — les fronts se courbent à nouveau et les rayons s’écartent',
    hi: 'फिर स्रोत के पास — तरंगाग्र फिर मुड़ जाते हैं और किरणें फैल जाती हैं',
    id: 'Kembali dekat sumber — muka gelombang melengkung lagi dan sinar saling menjauh',
    pt: 'De volta perto da fonte — as frentes se curvam de novo e os raios se afastam',
  },
} satisfies Record<string, LocalizedText>);

export type WavefrontAndRayMessageKey = keyof typeof wavefrontAndRayMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: WavefrontAndRayMessageKey): LocalizedText => wavefrontAndRayMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: WavefrontAndRayMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const wavefrontAndRaySchema: BundleSchema = {
  id: WAVEFRONT_AND_RAY_ID,
  label: text('label.title'),
  category: 'waves',
  description: text('label.description'),
  timeModel: 'periodic',

  // 조작기가 없다 — 자동 진행으로 파원 곁에서 먼 곳까지 옮겨 가며 주장이 끝난다.
  parameters: [],

  stages: [
    {
      id: 'point-source',
      label: text('label.stage'),
      constants: {
        wavelength: WAVELENGTH,
        waveSpeed: WAVE_SPEED,
        nearDistance: NEAR_DISTANCE,
        farDistance: FAR_DISTANCE,
      },
    },
  ],

  environments: [],

  views: [{ id: 'tank', label: text('label.view'), default: true }],

  /** 가로로 넓은 수조 한 판 + 아래 캡션 한 줄. */
  canvas: { height: 400, minHeight: 340 },

  /** 물결 장 위에 파면, 그 위에 광선 · 직각 표지 · 파원이 와야 한다. 쓴 순서대로 그린다. */
  drawOrder: 'scene',

  /**
   * 한 주기 17 초. 파원 거리는 `recede` 동안 가까운 거리 → 먼 거리로, `return` 동안 되돌아온다.
   * scene 은 `at('recede')` · `at('return')` 으로 읽는다. 파면은 단계와 무관하게 늘 나아간다.
   */
  timeline: {
    phases: [
      { id: 'near', duration: NEAR, caption: key('caption.near') },
      { id: 'recede', duration: RECEDE, ease: 'smooth', caption: key('caption.recede') },
      { id: 'far', duration: FAR, caption: key('caption.far') },
      { id: 'return', duration: RETURN, ease: 'smooth', caption: key('caption.return') },
    ],
  },

  /**
   * 도착한 순간 이미 진행 중이다 — 물결은 시계 0 부터 판을 채우고 나아간다(모든 것이 시각의
   * 함수라 채워지기를 기다릴 것이 없다). 파원 곁 단계를 조금 지난 자리에서 연다.
   */
  startAt: 1,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 정의와 공식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-left', offset: [2, 0] },
    align: 'left',
    fontSize: 15,
    style: { colorRole: 'ink', emphasis: 'medium' },
    fade: 0,
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것이 거리가 아니라 「광선이 파면과 직각인가」 다.
   * 파장 · 거리 · 각도 숫자도 두지 않는다 — 직각은 표지가 말한다.
   */

  messages: wavefrontAndRayMessages,
};
