// ========================================================================
// energy-in-inductor — 선언
// ========================================================================
// 질문: 코일에 전류를 흘려 놓으면 에너지는 어디에, 얼마나 쌓이는가.
//
// 전류를 0 에서 I 까지 키우는 동안 코일은 역기전력(ε)으로 버틴다. 그것을 거슬러 한
// 일이 자기장에 쌓인다 — 전류가 커질수록 자기력선이 늘고, LI–I 직선 아래 삼각형이
// 차오른다. 전류가 일정하면 역기전력은 없고 에너지는 삼각형 넓이 그대로 남는다.
// 전류를 줄이면 자기장이 사그라들며 코일이 전류를 앞으로 밀어 에너지가 돌아 나온다.
//
// 이웃과 겹치지 않는 자리 — `self-inductance` 는 끊는 순간 치솟는 전압(불꽃),
// `rl-circuit` 은 전류가 차오르는 시간 곡선, `energy-in-capacitor` 는 몫마다의 일 띠와
// 직사각형과의 비교다. 이 조각은 **전류와 함께 쌓였다가 돌아 나오는 자기장의 에너지**만
// 말한다. 스위치 · 전지 · 시간축 · 불꽃을 두지 않는다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:energy-in-inductor` 와 문자 그대로 일치한다 (C4). */
export const ENERGY_IN_INDUCTOR_ID = 'energy-in-inductor';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 화면에 뜨는 수는 계산값이 아니라 여기 선언한 정박값이다 (S-piece 유효숫자).
// ------------------------------------------------------------------------

/** 인덕턴스(H). 코일 아래에 `{l} H` 로 뜬다. */
export const INDUCTANCE = 0.5;
/** 키워 올린 끝 전류(A). 그래프 가로축 끝에 `{i} A` 로 뜬다. */
export const FINAL_CURRENT = 2;
/** 끝 전류에서 코일 축 위 · 아래로 각각 보이는 자기력선 수. 선 수는 전류에 비례한다. */
export const FIELD_LINES = 4;
/** 표시 배율 — 전류 화살표 길이(월드 단위) ÷ 전류(A). */
export const CURRENT_ARROW_PER_AMP = 0.5;
/** 표시 배율 — 역기전력 화살표 길이(월드 단위) ÷ 역기전력(V). */
export const EMF_ARROW_PER_VOLT = 5;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이(초)
// ------------------------------------------------------------------------

/** 전류를 0 에서 끝 전류까지 고르게 키우는 동안. 역기전력은 L × (끝 전류 ÷ 이 길이). */
export const RISE = 5;
/** 끝 전류 그대로 쌓인 에너지를 읽는 동안. */
export const HOLD = 3;
/** 전류를 끝 전류에서 0 까지 고르게 줄이는 동안. */
export const RELEASE = 4;
/** 빈 코일을 읽는 동안. */
export const EMPTY = 1.5;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const energyInInductorMessages = Object.freeze({
  'label.title': {
    ko: '인덕터의 에너지',
    en: 'Energy in an inductor',
    ja: 'コイルのエネルギー',
    zh: '电感器的能量',
    ar: 'طاقة المحث',
    es: 'Energía en un inductor',
    fr: 'Énergie d’une bobine',
    hi: 'प्रेरक में ऊर्जा',
    id: 'Energi pada induktor',
    pt: 'Energia em um indutor',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '자기장에 저장된 에너지',
    en: 'Energy stored in the magnetic field',
    ja: '磁場に蓄えられたエネルギー',
    zh: '储存在磁场中的能量',
    ar: 'الطاقة المخزنة في المجال المغناطيسي',
    es: 'Energía almacenada en el campo magnético',
    fr: 'Énergie stockée dans le champ magnétique',
    hi: 'चुंबकीय क्षेत्र में संचित ऊर्जा',
    id: 'Energi yang tersimpan dalam medan magnet',
    pt: 'Energia armazenada no campo magnético',
  },
  'label.stage': {
    ko: '전류를 키웠다 줄이기',
    en: 'Raising and lowering the current',
    ja: '電流を増やしてから減らす',
    zh: '先增大再减小电流',
    ar: 'رفع التيار ثم خفضه',
    es: 'Subir y bajar la corriente',
    fr: 'Augmenter puis diminuer le courant',
    hi: 'धारा बढ़ाना और घटाना',
    id: 'Menaikkan dan menurunkan arus',
    pt: 'Aumentando e diminuindo a corrente',
  },
  'label.view': {
    ko: '코일과 LI–I 그래프',
    en: 'Coil and LI–I graph',
    ja: 'コイルと LI–I グラフ',
    zh: '线圈与 LI–I 图',
    ar: 'الملف ومنحنى LI–I',
    es: 'Bobina y gráfica LI–I',
    fr: 'Bobine et graphe LI–I',
    hi: 'कुंडली और LI–I ग्राफ़',
    id: 'Kumparan dan grafik LI–I',
    pt: 'Bobina e gráfico LI–I',
  },
  /** 값이 끼는 조립이라 문안이다 (C1). 값은 스테이지 상수 그대로. */
  'label.inductance': {
    ko: '{l} H',
    en: '{l} H',
    ja: '{l} H',
    zh: '{l} H',
    ar: '{l} H',
    es: '{l} H',
    fr: '{l} H',
    hi: '{l} H',
    id: '{l} H',
    pt: '{l} H',
  },
  'label.current': {
    ko: '{i} A',
    en: '{i} A',
    ja: '{i} A',
    zh: '{i} A',
    ar: '{i} A',
    es: '{i} A',
    fr: '{i} A',
    hi: '{i} A',
    id: '{i} A',
    pt: '{i} A',
  },
  /** 축 이름 · 기호. 수식 표기라 표식이다 (C1 판정 3). */
  'label.axisI': {
    ko: 'I',
    en: 'I',
    ja: 'I',
    zh: 'I',
    ar: 'I',
    es: 'I',
    fr: 'I',
    hi: 'I',
    id: 'I',
    pt: 'I',
  },
  'label.axisLI': {
    ko: 'LI',
    en: 'LI',
    ja: 'LI',
    zh: 'LI',
    ar: 'LI',
    es: 'LI',
    fr: 'LI',
    hi: 'LI',
    id: 'LI',
    pt: 'LI',
  },
  'label.currentArrow': {
    ko: 'I',
    en: 'I',
    ja: 'I',
    zh: 'I',
    ar: 'I',
    es: 'I',
    fr: 'I',
    hi: 'I',
    id: 'I',
    pt: 'I',
  },
  'label.emf': {
    ko: 'ε',
    en: 'ε',
    ja: 'ε',
    zh: 'ε',
    ar: 'ε',
    es: 'ε',
    fr: 'ε',
    hi: 'ε',
    id: 'ε',
    pt: 'ε',
  },
  'label.energy': {
    ko: '½LI²',
    en: '½LI²',
    ja: '½LI²',
    zh: '½LI²',
    ar: '½LI²',
    es: '½LI²',
    fr: '½LI²',
    hi: '½LI²',
    id: '½LI²',
    pt: '½LI²',
  },
  'caption.rise': {
    ko: '전류를 키우는 동안 코일은 역기전력(ε)으로 버틴다 — 그것을 거슬러 한 일만큼 자기력선이 늘고 직선 아래 넓이가 차오른다',
    en: 'While the current is raised the coil pushes back (ε) — the work done against it adds field lines and fills the area under the line',
    ja: '電流を増やす間、コイルは逆らう(ε) — それに逆らってした仕事の分だけ磁力線が増え、直線の下の面積が満ちていく',
    zh: '电流增大时，线圈会反抗(ε) — 克服它所做的功使磁感线增多，并填满直线下方的面积',
    ar: 'أثناء رفع التيار يقاوم الملف (ε) — والشغل المبذول ضده يزيد خطوط المجال ويملأ المساحة تحت الخط',
    es: 'Mientras la corriente sube, la bobina se opone (ε) — el trabajo hecho contra ella añade líneas de campo y llena el área bajo la recta',
    fr: 'Tant que le courant augmente, la bobine s’y oppose (ε) — le travail fourni contre elle ajoute des lignes de champ et remplit l’aire sous la droite',
    hi: 'धारा बढ़ाते समय कुंडली विरोध करती है (ε) — इसके विरुद्ध किया गया कार्य क्षेत्र रेखाएँ बढ़ाता है और रेखा के नीचे का क्षेत्रफल भरता है',
    id: 'Selama arus dinaikkan, kumparan melawan (ε) — usaha untuk melawannya menambah garis medan dan mengisi luas di bawah garis',
    pt: 'Enquanto a corrente sobe, a bobina se opõe (ε) — o trabalho feito contra ela acrescenta linhas de campo e preenche a área sob a reta',
  },
  'caption.hold': {
    ko: '전류가 일정해져 ε 화살표가 사라졌다 — 자기력선과 다 찬 삼각형이 그대로 남아 있다',
    en: 'The current holds and the ε arrow is gone — the field lines and the full triangle stay',
    ja: '電流が一定になり、ε の矢印は消えた — 磁力線と満ちた三角形はそのまま残る',
    zh: '电流保持不变，ε 箭头消失了 — 磁感线和填满的三角形依然留着',
    ar: 'يثبت التيار ويختفي سهم ε — وتبقى خطوط المجال والمثلث الممتلئ',
    es: 'La corriente se mantiene y la flecha ε desaparece — las líneas de campo y el triángulo lleno permanecen',
    fr: 'Le courant se maintient et la flèche ε disparaît — les lignes de champ et le triangle plein restent',
    hi: 'धारा स्थिर है और ε तीर गायब हो गया — क्षेत्र रेखाएँ और भरा हुआ त्रिभुज बने रहते हैं',
    id: 'Arus tetap dan panah ε hilang — garis medan dan segitiga yang penuh tetap ada',
    pt: 'A corrente se mantém e a seta ε some — as linhas de campo e o triângulo cheio permanecem',
  },
  'caption.release': {
    ko: '전류를 줄이면 자기장이 사그라들며 코일이 전류를 앞으로 민다 — 쌓였던 에너지가 회로로 돌아 나온다',
    en: 'As the current is lowered the field collapses and the coil pushes the current onward — the stored energy flows back out',
    ja: '電流を減らすと磁場がしぼみ、コイルが電流を前へ押す — 蓄えられたエネルギーが回路へ戻っていく',
    zh: '电流减小时磁场随之消退，线圈把电流向前推 — 储存的能量流回电路',
    ar: 'عند خفض التيار ينهار المجال ويدفع الملف التيار إلى الأمام — فتتدفق الطاقة المخزنة عائدةً إلى الخارج',
    es: 'Al bajar la corriente, el campo se desvanece y la bobina empuja la corriente hacia adelante — la energía almacenada vuelve a salir',
    fr: 'Quand le courant diminue, le champ s’effondre et la bobine pousse le courant vers l’avant — l’énergie stockée ressort',
    hi: 'धारा घटाने पर क्षेत्र सिमटता है और कुंडली धारा को आगे धकेलती है — संचित ऊर्जा वापस बाहर बह निकलती है',
    id: 'Saat arus diturunkan, medan meluruh dan kumparan mendorong arus terus maju — energi yang tersimpan mengalir keluar kembali',
    pt: 'Quando a corrente diminui, o campo se desfaz e a bobina empurra a corrente adiante — a energia armazenada volta a sair',
  },
  'caption.empty': {
    ko: '전류가 0 이 되자 자기력선도, 쌓인 에너지도 남지 않는다',
    en: 'At zero current neither field lines nor stored energy remain',
    ja: '電流が 0 になると、磁力線も蓄えられたエネルギーも残らない',
    zh: '电流为 0 时，磁感线和储存的能量都不复存在',
    ar: 'عند انعدام التيار لا تبقى خطوط مجال ولا طاقة مخزنة',
    es: 'Con corriente cero no quedan líneas de campo ni energía almacenada',
    fr: 'À courant nul, il ne reste ni lignes de champ ni énergie stockée',
    hi: 'शून्य धारा पर न क्षेत्र रेखाएँ बचती हैं, न संचित ऊर्जा',
    id: 'Pada arus nol, tidak ada lagi garis medan maupun energi yang tersimpan',
    pt: 'Com corrente zero, não restam linhas de campo nem energia armazenada',
  },
} satisfies Record<string, LocalizedText>);

export type EnergyInInductorMessageKey = keyof typeof energyInInductorMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: EnergyInInductorMessageKey): LocalizedText => energyInInductorMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: EnergyInInductorMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const energyInInductorSchema: BundleSchema = {
  id: ENERGY_IN_INDUCTOR_ID,
  label: text('label.title'),
  category: 'em',
  description: text('label.description'),
  timeModel: 'periodic',

  // 조작기가 없다 — 키우고, 머물고, 줄이는 한 주기로 할 말을 마친다.
  parameters: [],

  stages: [
    {
      id: 'raise-and-lower',
      label: text('label.stage'),
      constants: {
        inductance: INDUCTANCE,
        finalCurrent: FINAL_CURRENT,
        fieldLines: FIELD_LINES,
        currentArrowPerAmp: CURRENT_ARROW_PER_AMP,
        emfArrowPerVolt: EMF_ARROW_PER_VOLT,
      },
    },
  ],

  environments: [],

  views: [{ id: 'coil-graph', label: text('label.view'), default: true }],

  /** 가로로 넓다 — 코일과 그래프가 옆으로 놓인다. */
  canvas: { height: 360, minHeight: 320 },

  /**
   * 겹침은 scene 에 쓴 순서다 — 고리 뒤 반쪽 → 코일 속 에너지 칠 → 자기력선 → 고리 앞 반쪽
   * 차례라야 선이 코일 속을 꿴다. 그래프에서는 삼각형(region)이 LI–I 직선 **아래** 로 깔린다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 전류를 고르게 키움 → 끝 전류로 머묾 → 고르게 줄임 → 빈 코일.
   * 키우고 줄이는 단계는 `linear` 이라 전류의 변화율, 곧 역기전력이 단계 안에서 일정하다.
   */
  timeline: {
    phases: [
      { id: 'rise', duration: RISE, caption: key('caption.rise') },
      { id: 'hold', duration: HOLD, caption: key('caption.hold') },
      { id: 'release', duration: RELEASE, caption: key('caption.release') },
      { id: 'empty', duration: EMPTY, caption: key('caption.empty') },
    ],
  },

  /** 도착한 순간 전류가 절반쯤 올라와 있다 — 자기력선 몇 가닥과 작은 삼각형이 이미 있다. */
  startAt: 2.2,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 식과 정의는 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  messages: energyInInductorMessages,
};
