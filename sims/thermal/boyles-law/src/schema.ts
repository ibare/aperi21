// ========================================================================
// boyles-law — 선언
// ========================================================================
// 질문: 온도를 그대로 두고 기체를 누르면 압력은 어떻게 되나.
//
// 온도가 같으면 누른 만큼 부피가 줄고 압력이 오른다. 부피를 1 → 1/k₂ → 1/k₃ 로
// 줄이면 압력계가 1 → k₂ → k₃ 로 오르고, 옆 P–V 그림에서 점이 한 곡선을 따라간다.
// 멈춘 자리마다 원점과 점을 모서리로 하는 직사각형(P×V)이 남고, 그 넓이가 모두 같다.
// 이것이 이 조각의 주장이 서는 그림이다.
//
// 이웃 `ideal-gas-law` 는 세 양의 배수 막대를, `gas-pressure` 는 「압력 = 두드림」 을
// 말한다. 이 조각은 그것을 되풀이하지 않는다 — 분자는 작은 배경이고, 주장은 P–V
// 그림의 곡선과 넓이에 있다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:boyles-law` 와 문자 그대로 일치한다 (C4). */
export const BOYLES_LAW_ID = 'boyles-law';

// ------------------------------------------------------------------------
// 물리 · 표시 배율 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 기체의 양(mol) · 기체 상수(J/(mol·K)). 처음 압력을 정하는 데만 쓴다. */
export const N_MOL = 1;
export const GAS_R = 8.314;
/** 온도(K). 주기 내내 이 값이다 — 화면에도 그대로 뜬다. */
export const TEMPERATURE = 300;
/** 처음 부피(L). */
export const V_START = 24.94;
/** 두 번째 · 세 번째 멈춤에서 부피를 나누는 수. 처음 멈춤은 나누지 않는다(1). */
export const DIVISOR_SECOND = 2;
export const DIVISOR_THIRD = 3;

/** 분자 배치를 뽑는 시드와 분자 수. 두드림은 작게만 — 이웃 `gas-pressure` 의 몫이다. */
export const MOLECULE_SEED = 11;
export const MOLECULE_COUNT = 22;
/** 처음 부피에서 분자가 상자를 한 번 오가는 빈도의 범위(회/초). */
export const MOLECULE_RATE_MIN = 0.16;
export const MOLECULE_RATE_MAX = 0.36;

/**
 * 표시 배율 — 처음 부피(비 1)의 길이(월드). 실린더 속 기체 기둥과 P–V 그림의
 * V 축이 **같은 배율**을 쓴다. 그래서 기둥이 줄어든 만큼 점이 왼쪽으로 간다.
 */
export const WORLD_PER_VOLUME = 3.0;
/** 표시 배율 — 처음 압력(비 1)의 높이(월드). P–V 그림의 P 축. */
export const WORLD_PER_PRESSURE = 0.72;
/** P–V 그림이 보이는 범위 — 처음 값을 1 로 한 비. */
export const GRAPH_V_MAX = 1.2;
export const GRAPH_P_MAX = 3.7;
/** 압력계 눈금판의 범위(처음 압력을 1 로 한 비)와 눈금 간격. */
export const GAUGE_MAX = 4;
export const GAUGE_TICK = 1;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 실린더는 가로로 눕고 피스톤이 오른쪽에서 드나든다.
// ------------------------------------------------------------------------

/** 실린더 안쪽. `left` 가 막힌 벽, 오른쪽은 열려 피스톤이 드나든다. */
export const CYLINDER = { left: 0, bottom: 0, top: 1.4, end: 3.45 } as const;
/** 피스톤 두께 · 막대 길이 · 막대 굵기(월드). */
export const PISTON_THICKNESS = 0.2;
export const ROD_LENGTH = 0.5;
export const ROD_THICKNESS = 0.1;
/** 분자가 벽에서 떨어져 있는 여유(월드). */
export const MOLECULE_MARGIN = 0.05;

/** 압력계 — 실린더 막힌 쪽 위에 관으로 붙는다. 가운데 · 반지름(월드). */
export const GAUGE = { x: 0.85, y: 2.4, radius: 0.66 } as const;

/** 온도 표시 자리(월드). 실린더 위, 압력계 오른쪽. */
export const TEMPERATURE_AT = [2.55, 2.2] as const;

/** P–V 그림의 원점(월드). V 는 오른쪽, P 는 위. */
export const GRAPH_ORIGIN = [5.15, 0] as const;

/**
 * 프레이밍은 주장의 일부다. 가로는 실린더 막힌 벽부터 V 축 끝 이름표까지, 세로는
 * 압력계 위 끝부터 눈금 숫자 · 캡션 줄까지. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -0.35, maxX: 9.2, minY: -0.95, maxY: 3.4 } as const;

// ------------------------------------------------------------------------
// 문안 (C1)
// ------------------------------------------------------------------------

export const boylesLawMessages = Object.freeze({
  'label.title': {
    ko: '보일 법칙',
    en: "Boyle's law",
    ja: 'ボイルの法則',
    zh: '玻意耳定律',
    ar: 'قانون بويل',
    es: 'Ley de Boyle',
    fr: 'Loi de Boyle',
    hi: 'बॉयल का नियम',
    id: 'Hukum Boyle',
    pt: 'Lei de Boyle',
  },
  'label.operation': {
    ko: '온도가 일정할 때의 압력-부피',
    en: 'Pressure and volume at constant temperature',
    ja: '温度一定での圧力と体積',
    zh: '温度不变时的压强与体积',
    ar: 'الضغط والحجم عند ثبات درجة الحرارة',
    es: 'Presión y volumen a temperatura constante',
    fr: 'Pression et volume à température constante',
    hi: 'स्थिर ताप पर दाब और आयतन',
    id: 'Tekanan dan volume pada suhu tetap',
    pt: 'Pressão e volume a temperatura constante',
  },
  'label.stage': {
    ko: '피스톤 실린더',
    en: 'Piston cylinder',
    ja: 'ピストン付きシリンダー',
    zh: '活塞气缸',
    ar: 'أسطوانة ذات مكبس',
    es: 'Cilindro con pistón',
    fr: 'Cylindre à piston',
    hi: 'पिस्टन सिलिंडर',
    id: 'Silinder berpiston',
    pt: 'Cilindro com pistão',
  },
  'label.view': {
    ko: '실린더와 P–V 그림',
    en: 'Cylinder and P–V diagram',
    ja: 'シリンダーと P–V 図',
    zh: '气缸与 P–V 图',
    ar: 'الأسطوانة ومخطط P–V',
    es: 'Cilindro y diagrama P–V',
    fr: 'Cylindre et diagramme P–V',
    hi: 'सिलिंडर और P–V आरेख',
    id: 'Silinder dan diagram P–V',
    pt: 'Cilindro e diagrama P–V',
  },

  /** 축 이름 · 직사각형 표식. 물리 기호라 번역하지 않는다 (C1 판정 3). */
  'label.pressure': {
    ko: 'P',
    en: 'P',
    ja: 'P',
    zh: 'P',
    ar: 'P',
    es: 'P',
    fr: 'P',
    hi: 'P',
    id: 'P',
    pt: 'P',
  },
  'label.volume': {
    ko: 'V',
    en: 'V',
    ja: 'V',
    zh: 'V',
    ar: 'V',
    es: 'V',
    fr: 'V',
    hi: 'V',
    id: 'V',
    pt: 'V',
  },
  'label.area': {
    ko: 'P×V',
    en: 'P×V',
    ja: 'P×V',
    zh: 'P×V',
    ar: 'P×V',
    es: 'P×V',
    fr: 'P×V',
    hi: 'P×V',
    id: 'P×V',
    pt: 'P×V',
  },
  /** 눈금 숫자 — 처음 값(비 1)과, 스테이지 상수를 끼운 배수 · 분수. */
  'label.one': {
    ko: '1',
    en: '1',
    ja: '1',
    zh: '1',
    ar: '1',
    es: '1',
    fr: '1',
    hi: '1',
    id: '1',
    pt: '1',
  },
  'label.ratio': {
    ko: '{k}',
    en: '{k}',
    ja: '{k}',
    zh: '{k}',
    ar: '{k}',
    es: '{k}',
    fr: '{k}',
    hi: '{k}',
    id: '{k}',
    pt: '{k}',
  },
  'label.inverse': {
    ko: '1/{k}',
    en: '1/{k}',
    ja: '1/{k}',
    zh: '1/{k}',
    ar: '1/{k}',
    es: '1/{k}',
    fr: '1/{k}',
    hi: '1/{k}',
    id: '1/{k}',
    pt: '1/{k}',
  },
  /** 온도 — 값은 스테이지 상수를 그대로 끼운다. */
  'label.temperature': {
    ko: 'T = {t} K',
    en: 'T = {t} K',
    ja: 'T = {t} K',
    zh: 'T = {t} K',
    ar: 'T = {t} K',
    es: 'T = {t} K',
    fr: 'T = {t} K',
    hi: 'T = {t} K',
    id: 'T = {t} K',
    pt: 'T = {t} K',
  },

  'caption.start': {
    ko: '온도를 {t} K 로 묶어 둔 기체 — 점은 처음 부피, 처음 압력에 있다',
    en: 'A gas held at {t} K — the dot sits at the starting volume and pressure',
    ja: '{t} K に保たれた気体 — 点は最初の体積と圧力の位置にある',
    zh: '保持在 {t} K 的气体 — 点位于起始的体积与压强处',
    ar: 'غاز محفوظ عند {t} K — النقطة عند الحجم والضغط الابتدائيين',
    es: 'Un gas mantenido a {t} K — el punto está en el volumen y la presión iniciales',
    fr: 'Un gaz maintenu à {t} K — le point est au volume et à la pression de départ',
    hi: '{t} K पर रखी गई गैस — बिंदु आरंभिक आयतन और दाब पर है',
    id: 'Gas yang dijaga pada {t} K — titik berada pada volume dan tekanan awal',
    pt: 'Um gás mantido a {t} K — o ponto está no volume e na pressão iniciais',
  },
  'caption.pressSecond': {
    ko: '피스톤을 천천히 눌러 부피를 {k2}분의 1로 줄인다',
    en: 'The piston is pushed in slowly to cut the volume to 1/{k2}',
    ja: 'ピストンをゆっくり押し込み、体積を 1/{k2} に減らす',
    zh: '缓慢推入活塞，把体积减小到 1/{k2}',
    ar: 'يُدفع المكبس ببطء إلى الداخل لخفض الحجم إلى 1/{k2}',
    es: 'El pistón se empuja despacio para reducir el volumen a 1/{k2}',
    fr: 'On enfonce lentement le piston pour réduire le volume à 1/{k2}',
    hi: 'पिस्टन को धीरे-धीरे अंदर दबाकर आयतन 1/{k2} कर दिया जाता है',
    id: 'Piston didorong masuk perlahan hingga volumenya tinggal 1/{k2}',
    pt: 'O pistão é empurrado devagar para reduzir o volume a 1/{k2}',
  },
  'caption.restSecond': {
    ko: '부피 {k2}분의 1 — 압력계가 {k2}를 가리키고, 새 직사각형의 넓이는 처음 것과 같다',
    en: 'Volume 1/{k2} — the gauge reads {k2}, and the new rectangle has the same area as the first',
    ja: '体積 1/{k2} — 圧力計は {k2} を指し、新しい長方形の面積は最初のものと同じだ',
    zh: '体积 1/{k2} — 压力表指向 {k2}，新矩形的面积与第一个相同',
    ar: 'الحجم 1/{k2} — يشير المقياس إلى {k2}، ومساحة المستطيل الجديد تساوي مساحة الأول',
    es: 'Volumen 1/{k2} — el manómetro marca {k2}, y el nuevo rectángulo tiene la misma área que el primero',
    fr: 'Volume 1/{k2} — le manomètre indique {k2}, et le nouveau rectangle a la même aire que le premier',
    hi: 'आयतन 1/{k2} — दाबमापी {k2} दिखाता है, और नए आयत का क्षेत्रफल पहले वाले जितना ही है',
    id: 'Volume 1/{k2} — manometer menunjukkan {k2}, dan luas persegi panjang yang baru sama dengan yang pertama',
    pt: 'Volume 1/{k2} — o manômetro marca {k2}, e o novo retângulo tem a mesma área que o primeiro',
  },
  'caption.pressThird': {
    ko: '더 눌러 부피를 {k3}분의 1로 줄인다',
    en: 'Pushing further cuts the volume to 1/{k3}',
    ja: 'さらに押して体積を 1/{k3} に減らす',
    zh: '再往里推，把体积减小到 1/{k3}',
    ar: 'يؤدي الدفع أكثر إلى خفض الحجم إلى 1/{k3}',
    es: 'Al empujar más, el volumen baja a 1/{k3}',
    fr: 'En poussant davantage, le volume tombe à 1/{k3}',
    hi: 'और दबाने पर आयतन 1/{k3} हो जाता है',
    id: 'Didorong lebih jauh, volumenya tinggal 1/{k3}',
    pt: 'Empurrando mais, o volume cai para 1/{k3}',
  },
  'caption.restThird': {
    ko: '부피 {k3}분의 1, 압력 {k3} — 세 직사각형의 넓이가 모두 같고, 세 점이 한 곡선 위에 있다',
    en: 'Volume 1/{k3}, pressure {k3} — all three rectangles have the same area, and the three dots lie on one curve',
    ja: '体積 1/{k3}、圧力 {k3} — 三つの長方形の面積はすべて同じで、三つの点は一本の曲線上にある',
    zh: '体积 1/{k3}，压强 {k3} — 三个矩形的面积都相同，三个点位于同一条曲线上',
    ar: 'الحجم 1/{k3}، والضغط {k3} — للمستطيلات الثلاثة المساحة نفسها، والنقاط الثلاث تقع على منحنى واحد',
    es: 'Volumen 1/{k3}, presión {k3} — los tres rectángulos tienen la misma área, y los tres puntos están sobre una misma curva',
    fr: 'Volume 1/{k3}, pression {k3} — les trois rectangles ont la même aire, et les trois points sont sur une même courbe',
    hi: 'आयतन 1/{k3}, दाब {k3} — तीनों आयतों का क्षेत्रफल बराबर है, और तीनों बिंदु एक ही वक्र पर हैं',
    id: 'Volume 1/{k3}, tekanan {k3} — ketiga persegi panjang sama luasnya, dan ketiga titik terletak pada satu kurva',
    pt: 'Volume 1/{k3}, pressão {k3} — os três retângulos têm a mesma área, e os três pontos estão sobre uma mesma curva',
  },
  'caption.release': {
    ko: '피스톤을 천천히 놓는다 — 점이 같은 곡선을 거슬러 처음 자리로 간다',
    en: 'The piston is let out slowly — the dot runs back along the same curve to where it started',
    ja: 'ピストンをゆっくり戻す — 点は同じ曲線をたどって最初の位置へ戻る',
    zh: '缓慢放开活塞 — 点沿同一条曲线退回起点',
    ar: 'يُترك المكبس يخرج ببطء — فتعود النقطة على المنحنى نفسه إلى حيث بدأت',
    es: 'El pistón se suelta despacio — el punto regresa por la misma curva hasta donde empezó',
    fr: 'On relâche lentement le piston — le point revient le long de la même courbe jusqu’à son départ',
    hi: 'पिस्टन को धीरे-धीरे बाहर आने दिया जाता है — बिंदु उसी वक्र पर लौटकर शुरुआती जगह पहुँचता है',
    id: 'Piston dilepas perlahan — titik kembali menyusuri kurva yang sama ke tempat awalnya',
    pt: 'O pistão é solto devagar — o ponto volta pela mesma curva até onde começou',
  },
} satisfies Record<string, LocalizedText>);

export type BoylesLawMessageKey = keyof typeof boylesLawMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: BoylesLawMessageKey): LocalizedText => boylesLawMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: BoylesLawMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// 시간표
// ------------------------------------------------------------------------

/**
 * 시간표의 단계 id. scene · physics 가 `at(id)` 로 부른다.
 *
 * 분자의 가로 위상은 한 주기 동안 「부피가 정한 빠르기」 를 단계마다 더한 것이라,
 * physics 가 단계를 차례로 훑는다. `TimelineFrame` 에는 단계 목록이 없어(장부 G193)
 * id 만 여기 한 벌 둔다 — 길이 · 순서 · 이징은 아래 선언이 정하고 physics 는 프레임에게 묻는다.
 */
export const PHASE_IDS = ['rest1', 'press2', 'rest2', 'press3', 'rest3', 'release'] as const;
export type PhaseId = (typeof PHASE_IDS)[number];

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const boylesLawSchema: BundleSchema = {
  id: BOYLES_LAW_ID,
  label: text('label.title'),
  category: 'thermal',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 피스톤이 눌리고, 점이 곡선을 따라가고, 넓이가 같은 직사각형이 쌓인다.
  parameters: [],

  stages: [
    {
      id: 'cylinder',
      label: text('label.stage'),
      constants: {
        n: N_MOL,
        R: GAS_R,
        t: TEMPERATURE,
        v0: V_START,
        k2: DIVISOR_SECOND,
        k3: DIVISOR_THIRD,
        seed: MOLECULE_SEED,
        molecules: MOLECULE_COUNT,
        rateMin: MOLECULE_RATE_MIN,
        rateMax: MOLECULE_RATE_MAX,
        worldPerVolume: WORLD_PER_VOLUME,
        worldPerPressure: WORLD_PER_PRESSURE,
        graphVMax: GRAPH_V_MAX,
        graphPMax: GRAPH_P_MAX,
        gaugeMax: GAUGE_MAX,
        gaugeTick: GAUGE_TICK,
      },
    },
  ],

  environments: [],

  views: [{ id: 'cylinder', label: text('label.view'), default: true }],

  // 가로로 긴 장치 + P–V 그림. 세로를 더 주면 가로가 먼저 차서 그림만 작아진다.
  canvas: { height: 360, minHeight: 320 },

  /**
   * 겹침 순서를 scene 이 정한다. 옅은 기체 기둥 · 직사각형 칠은 분자 · 곡선 **아래**로
   * 깔려야 하는데, 층 순서로는 `region`(매질)이 물체 위로 올라온다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 처음 자리 → 눌러 1/k₂ → 멈춤 → 더 눌러 1/k₃ → 멈춤 → 천천히 놓기.
   *
   * 부피가 바뀌는 단계는 `linear` 다 — 분자 위상을 단계마다 더하는 physics 가 진행도를
   * 시간에 비례한다고 보고 적분한다(NOTES 「어휘 부족」 G59). 등온은 천천히 누르는
   * 것이라 고른 속도가 그림에도 맞는다.
   */
  timeline: {
    phases: [
      { id: 'rest1', duration: 2.2, caption: key('caption.start') },
      { id: 'press2', duration: 2.8, ease: 'linear', caption: key('caption.pressSecond') },
      { id: 'rest2', duration: 2.8, caption: key('caption.restSecond') },
      { id: 'press3', duration: 2.4, ease: 'linear', caption: key('caption.pressThird') },
      { id: 'rest3', duration: 3.6, caption: key('caption.restThird') },
      { id: 'release', duration: 3.0, ease: 'linear', caption: key('caption.release') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — 피스톤이 눌려 들어가는 중에 연다. */
  startAt: 3.0,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 식과 법칙의 진술은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 14,
    wrapWidth: 760,
    style: { colorRole: 'muted', emphasis: 'strong' },
    // 온도 · 나누는 수는 스테이지 상수에서 온다 — state 가 글자로 옮겨 둔다(장부 G133 우회).
    vars: { t: 't', k2: 'k2', k3: 'k3' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). P–V 그림은 축 둘과 멈춘 자리의 눈금만 둔다 —
   * 격자를 깔면 직사각형 넓이를 칸 수로 세라는 지시가 되어 곡선이 묻힌다.
   */

  messages: boylesLawMessages,
};
