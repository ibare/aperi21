// ========================================================================
// stefan-boltzmann-law — 선언
// ========================================================================
// 질문: 온도를 조금 올렸을 뿐인데 내보내는 복사는 얼마나 느는가.
//
// 넓이가 같은 판 셋을 300 K · 450 K · 600 K 로 둔다. 판마다 두 막대를 세운다 —
// 온도 막대는 첫 판의 1 · 1.5 · 2 배로 곧게 서고, 같은 판이 내보내는 복사 막대는
// 1 · 5.06 · 16 배로 가파르게 선다. 두 막대 줄의 대비가 이 조각의 주장이다:
// 절대 온도를 두 배로 하면 내보내는 복사는 열여섯 배가 된다.
//
// 600 K 는 아직 눈에 보이게 빛나지 않는다 — 판을 빛 · 색으로 칠하지 않는다.
// 광도 L ∝ R²T⁴ (`stellar-luminosity`) · 스펙트럼 모양(`blackbody-radiation` ·
// `wien-displacement-law`) · 빈 곳을 건너는 복사(`thermal-radiation`)는 이웃의 몫이다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:stefan-boltzmann-law` 와 문자 그대로 일치한다 (C4). */
export const STEFAN_BOLTZMANN_LAW_ID = 'stefan-boltzmann-law';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 슈테판-볼츠만 상수 σ (W/m²K⁴). 세 판에 같다 — 막대는 첫 판으로 나눈 비라 크기는 지워진다. */
export const SIGMA = 5.67e-8;
/** 판 한 장의 넓이(m²). 세 판이 같다 — 다른 것은 온도뿐이다. */
export const AREA = 1;
/** 세 판의 절대 온도(K). 첫 판의 1 · 1.5 · 2 배다. */
export const TEMP_1 = 300;
export const TEMP_2 = 450;
export const TEMP_3 = 600;

/**
 * 막대 위 배수 글자의 **정박값**. 화면에 뜨는 수는 계산하지 않고 이 선언값을 그대로 쓴다
 * (S-piece 유효숫자). 온도 배수는 T/T₁, 복사 배수는 (T/T₁)⁴ 을 표에서 옮긴 값이다 —
 * 1.5⁴ = 5.0625 를 두 자리로 적은 것이 5.06 이다. 막대 **높이**는 물리가 계산한다.
 */
export const TEMP_MARK_1 = 1;
export const TEMP_MARK_2 = 1.5;
export const TEMP_MARK_3 = 2;
export const EMIT_MARK_1 = 1;
export const EMIT_MARK_2 = 5.06;
export const EMIT_MARK_3 = 16;

/**
 * 표시 배율 — 배수 1 이 월드 몇 단위 높이인가. 두 막대 줄이 **같은 배율**을 쓴다:
 * 300 K 판의 두 막대가 같은 높이에서 출발해야 「온도는 ×2, 복사는 ×16」 을 눈으로 견줄 수 있다.
 * 가장 긴 막대(×16)가 판 위에 들어가는 만큼으로 잡는다.
 */
export const BAR_UNIT = 0.2;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 판 셋을 가로로 나란히 둔다 (세로가 비싸다).
// ------------------------------------------------------------------------

/** 세 판 기둥의 가운데 x. 온도 순서대로 왼쪽에서 오른쪽. */
export const COLUMN_XS: readonly number[] = [-3.3, 0, 3.3];
/** 판의 가로 · 두께(월드). 세 판이 같다. */
export const PLATE_W = 2.0;
export const PLATE_H = 0.18;
/** 막대의 폭과, 판 가운데에서 막대 가운데까지의 가로 거리. 온도 막대는 왼쪽, 복사 막대는 오른쪽. */
export const BAR_W = 0.72;
export const BAR_OFFSET = 0.5;
/** 막대 바닥 = 판 윗면. */
export const BASE_Y = 0;
/** 막대 이름표(온도 · 복사)와 판 온도 글자의 높이 — 판 아래. */
export const TAG_Y = -0.42;
export const KELVIN_Y = -0.82;

/**
 * 프레이밍은 주장의 일부다. 가로는 세 판, 세로는 판 온도 글자 · 캡션 줄부터 가장 긴 막대(×16)
 * 위 배수 글자까지. 매 프레임 같은 값이다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: -4.6, maxX: 4.6, minY: -1.45, maxY: 3.7 } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이(초)
// ------------------------------------------------------------------------

/** 판 셋만 놓인 그림을 읽는 동안. */
export const PLATES = 2.2;
/** 온도 막대가 서는 동안 · 배수 글자가 떠오르는 동안 · 온도 막대만 선 그림을 읽는 동안. */
export const TEMP_GROW = 1.8;
export const TEMP_MARK = 0.6;
export const TEMP_HOLD = 1.2;
/** 복사 막대가 서는 동안 · 배수 글자가 떠오르는 동안 · 다 선 그림을 읽는 동안 · 흐려지는 동안. */
export const EMIT_GROW = 3;
export const EMIT_MARK = 0.6;
export const HOLD = 4;
export const FADE = 0.8;
/** 도착한 순간 온도 막대가 서는 중이다 — 판만 놓인 단계를 지나 온도 막대가 자라는 자리에서 연다. */
export const START_AT = 2.8;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const stefanBoltzmannLawMessages = Object.freeze({
  'label.title': {
    ko: '슈테판-볼츠만 법칙',
    en: 'Stefan–Boltzmann law',
    ja: 'シュテファン＝ボルツマンの法則',
    zh: '斯特藩–玻尔兹曼定律',
    ar: 'قانون ستيفان–بولتزمان',
    es: 'Ley de Stefan–Boltzmann',
    fr: 'Loi de Stefan–Boltzmann',
    hi: 'स्टीफ़न–बोल्ट्ज़मान नियम',
    id: 'Hukum Stefan–Boltzmann',
    pt: 'Lei de Stefan–Boltzmann',
  },
  'label.operation': {
    ko: '온도 4제곱에 비례하는 복사',
    en: 'Radiation that grows as the fourth power of temperature',
    ja: '温度の4乗に比例して増える放射',
    zh: '随温度四次方增长的辐射',
    ar: 'إشعاع يزداد مع القوة الرابعة لدرجة الحرارة',
    es: 'Radiación que crece con la cuarta potencia de la temperatura',
    fr: 'Un rayonnement qui croît comme la puissance quatrième de la température',
    hi: 'ताप की चौथी घात के अनुपात में बढ़ने वाला विकिरण',
    id: 'Radiasi yang bertambah sebanding pangkat empat suhu',
    pt: 'Radiação que cresce com a quarta potência da temperatura',
  },
  'label.stage': {
    ko: '같은 넓이의 판 셋',
    en: 'Three plates of equal area',
    ja: '同じ面積の三枚の板',
    zh: '三块面积相同的板',
    ar: 'ثلاثة ألواح متساوية المساحة',
    es: 'Tres placas de igual área',
    fr: 'Trois plaques de même aire',
    hi: 'समान क्षेत्रफल की तीन प्लेटें',
    id: 'Tiga pelat berluas sama',
    pt: 'Três placas de mesma área',
  },
  'label.view': {
    ko: '온도와 복사 막대',
    en: 'Temperature and radiation bars',
    ja: '温度と放射の棒',
    zh: '温度柱与辐射柱',
    ar: 'أعمدة درجة الحرارة والإشعاع',
    es: 'Barras de temperatura y radiación',
    fr: 'Barres de température et de rayonnement',
    hi: 'ताप और विकिरण की पट्टियाँ',
    id: 'Batang suhu dan radiasi',
    pt: 'Barras de temperatura e radiação',
  },
  /** 판 온도 — 값과 단위. 값이 끼는 조립문이라 문안이다 (C1 판정 4). */
  'label.kelvin': {
    ko: '{t} K',
    en: '{t} K',
    ja: '{t} K',
    zh: '{t} K',
    ar: '{t} K',
    es: '{t} K',
    fr: '{t} K',
    hi: '{t} K',
    id: '{t} K',
    pt: '{t} K',
  },
  /** 막대 위 배수 — 값이 끼는 조립문. */
  'label.mult': {
    ko: '×{k}',
    en: '×{k}',
    ja: '×{k}',
    zh: '×{k}',
    ar: '×{k}',
    es: '×{k}',
    fr: '×{k}',
    hi: '×{k}',
    id: '×{k}',
    pt: '×{k}',
  },
  /** 막대 이름표. 판 아래, 제 막대 밑에 붙는다. */
  'label.tagTemp': {
    ko: '온도',
    en: 'temp.',
    ja: '温度',
    zh: '温度',
    ar: 'درجة الحرارة',
    es: 'temp.',
    fr: 'temp.',
    hi: 'ताप',
    id: 'suhu',
    pt: 'temp.',
  },
  'label.tagEmit': {
    ko: '복사',
    en: 'radiated',
    ja: '放射',
    zh: '辐射',
    ar: 'الإشعاع',
    es: 'radiación',
    fr: 'rayonnement',
    hi: 'विकिरण',
    id: 'radiasi',
    pt: 'radiação',
  },
  'caption.plates': {
    ko: '넓이가 같은 판 셋 — {t1} K · {t2} K · {t3} K',
    en: 'Three plates of equal area — {t1} K, {t2} K and {t3} K',
    ja: '同じ面積の三枚の板 — {t1} K・{t2} K・{t3} K',
    zh: '三块面积相同的板 — {t1} K、{t2} K 和 {t3} K',
    ar: 'ثلاثة ألواح متساوية المساحة — {t1} K و{t2} K و{t3} K',
    es: 'Tres placas de igual área — {t1} K, {t2} K y {t3} K',
    fr: 'Trois plaques de même aire — {t1} K, {t2} K et {t3} K',
    hi: 'समान क्षेत्रफल की तीन प्लेटें — {t1} K, {t2} K और {t3} K',
    id: 'Tiga pelat berluas sama — {t1} K, {t2} K, dan {t3} K',
    pt: 'Três placas de mesma área — {t1} K, {t2} K e {t3} K',
  },
  'caption.temp': {
    ko: '판마다 온도 막대가 선다',
    en: 'A temperature bar rises on each plate',
    ja: '板ごとに温度の棒が伸びる',
    zh: '每块板上升起一根温度柱',
    ar: 'يرتفع عمود درجة الحرارة على كل لوح',
    es: 'Sobre cada placa sube una barra de temperatura',
    fr: 'Une barre de température monte sur chaque plaque',
    hi: 'हर प्लेट पर ताप की पट्टी उठती है',
    id: 'Batang suhu naik di tiap pelat',
    pt: 'Uma barra de temperatura sobe em cada placa',
  },
  'caption.tempDone': {
    ko: '온도 막대가 섰다 — 가장 뜨거운 판은 첫 판의 ×{tempTop}',
    en: 'The temperature bars stand — the hottest plate is at ×{tempTop} of the first',
    ja: '温度の棒が立った — いちばん熱い板は最初の板の ×{tempTop}',
    zh: '温度柱立好了 — 最热的板是第一块的 ×{tempTop}',
    ar: 'قامت أعمدة درجة الحرارة — أسخن لوح عند ×{tempTop} من الأول',
    es: 'Las barras de temperatura ya están en pie — la placa más caliente está a ×{tempTop} de la primera',
    fr: 'Les barres de température sont dressées — la plaque la plus chaude est à ×{tempTop} de la première',
    hi: 'ताप की पट्टियाँ खड़ी हो गईं — सबसे गर्म प्लेट पहली की ×{tempTop} पर है',
    id: 'Batang suhu sudah berdiri — pelat terpanas berada di ×{tempTop} pelat pertama',
    pt: 'As barras de temperatura estão de pé — a placa mais quente está em ×{tempTop} da primeira',
  },
  'caption.emit': {
    ko: '이제 같은 판들이 내보내는 복사 막대가 선다',
    en: 'Now the bars for the radiation each plate gives off rise beside them',
    ja: '今度は、それぞれの板が出す放射の棒がその横に伸びる',
    zh: '现在，各块板发出的辐射柱在旁边升起',
    ar: 'والآن ترتفع بجانبها أعمدة الإشعاع الذي يصدره كل لوح',
    es: 'Ahora, a su lado, suben las barras de la radiación que emite cada placa',
    fr: 'Maintenant, à côté, montent les barres du rayonnement émis par chaque plaque',
    hi: 'अब उनके बगल में हर प्लेट से निकलने वाले विकिरण की पट्टियाँ उठती हैं',
    id: 'Kini di sampingnya naik batang radiasi yang dipancarkan tiap pelat',
    pt: 'Agora, ao lado, sobem as barras da radiação que cada placa emite',
  },
  'caption.result': {
    ko: '온도 막대는 ×{tempTop} 에서, 복사 막대는 ×{emitTop} 에서 멈췄다',
    en: 'The temperature bar stopped at ×{tempTop}; the radiation bar at ×{emitTop}',
    ja: '温度の棒は ×{tempTop} で、放射の棒は ×{emitTop} で止まった',
    zh: '温度柱停在 ×{tempTop}，辐射柱停在 ×{emitTop}',
    ar: 'توقف عمود درجة الحرارة عند ×{tempTop}، وعمود الإشعاع عند ×{emitTop}',
    es: 'La barra de temperatura se detuvo en ×{tempTop}; la de radiación, en ×{emitTop}',
    fr: 'La barre de température s’est arrêtée à ×{tempTop} ; celle du rayonnement, à ×{emitTop}',
    hi: 'ताप की पट्टी ×{tempTop} पर रुकी, विकिरण की पट्टी ×{emitTop} पर',
    id: 'Batang suhu berhenti di ×{tempTop}; batang radiasi di ×{emitTop}',
    pt: 'A barra de temperatura parou em ×{tempTop}; a de radiação, em ×{emitTop}',
  },
} satisfies Record<string, LocalizedText>);

export type StefanBoltzmannLawMessageKey = keyof typeof stefanBoltzmannLawMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: StefanBoltzmannLawMessageKey): LocalizedText => stefanBoltzmannLawMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: StefanBoltzmannLawMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const stefanBoltzmannLawSchema: BundleSchema = {
  id: STEFAN_BOLTZMANN_LAW_ID,
  label: text('label.title'),
  category: 'thermal',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 온도 막대가 서고, 복사 막대가 가파르게 서고, 다시 처음으로.
  parameters: [],

  stages: [
    {
      id: 'three-plates',
      label: text('label.stage'),
      constants: {
        sigma: SIGMA,
        area: AREA,
        temp1: TEMP_1,
        temp2: TEMP_2,
        temp3: TEMP_3,
        tempMark1: TEMP_MARK_1,
        tempMark2: TEMP_MARK_2,
        tempMark3: TEMP_MARK_3,
        emitMark1: EMIT_MARK_1,
        emitMark2: EMIT_MARK_2,
        emitMark3: EMIT_MARK_3,
        barUnit: BAR_UNIT,
      },
    },
  ],

  environments: [],

  views: [{ id: 'bars', label: text('label.view'), default: true }],

  /**
   * 가장 긴 막대(×16)가 판 위로 길게 서야 해서 세로를 조금 더 준다. 가로는 판 셋이면 찬다.
   */
  canvas: { height: 420, minHeight: 360 },

  /**
   * 한 주기 = 판 셋 → 온도 막대 → 그 배수 → 온도만 선 그림 → 복사 막대 → 그 배수 → 다 선 그림 → 흐려짐.
   * 온도 막대를 먼저 끝까지 세워 두어야, 복사 막대가 그 옆에서 같은 바닥으로부터 치솟는 대비가 선다.
   */
  timeline: {
    phases: [
      { id: 'plates', duration: PLATES, caption: key('caption.plates') },
      { id: 'temp', duration: TEMP_GROW, ease: 'smooth', caption: key('caption.temp') },
      { id: 'temp-mark', duration: TEMP_MARK, caption: key('caption.tempDone') },
      { id: 'temp-hold', duration: TEMP_HOLD, caption: key('caption.tempDone') },
      { id: 'emit', duration: EMIT_GROW, ease: 'smooth', caption: key('caption.emit') },
      { id: 'emit-mark', duration: EMIT_MARK, caption: key('caption.result') },
      { id: 'hold', duration: HOLD, caption: key('caption.result') },
      { id: 'fade', duration: FADE, caption: key('caption.result') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — 온도 막대가 서는 중에 연다. */
  startAt: START_AT,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — σT⁴ · 「네제곱」 은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    fade: 0.3,
    style: { colorRole: 'muted', emphasis: 'strong' },
    vars: {
      t1: 'temp1',
      t2: 'temp2',
      t3: 'temp3',
      tempTop: 'tempTop',
      emitTop: 'emitTop',
    },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것은 거리가 아니라 **배수**이고, 배수는 막대 위 글자와
   * 같은 바닥에서 선 막대 높이가 말한다.
   */

  messages: stefanBoltzmannLawMessages,
};
