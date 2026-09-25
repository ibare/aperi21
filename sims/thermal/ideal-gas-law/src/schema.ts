// ========================================================================
// ideal-gas-law — 선언
// ========================================================================
// 질문: 압력 · 부피 · 온도는 서로 어떻게 묶여 있나.
//
// 피스톤 실린더 하나에 같은 기체를 두고 세 번 해 본다. 셋 중 하나에 자물쇠를
// 걸고(붙들고) 하나를 바꾸면, 남은 하나가 정해진 배수로 따라간다.
//   1) 온도를 붙들고 부피를 1/k₁ 로 → 압력 k₁ 배
//   2) 압력을 붙들고 절대온도를 k₂ 배로 → 부피 k₂ 배
//   3) 부피를 붙들고 절대온도를 k₃ 배로 → 압력 k₃ 배
// 붙든 양은 자물쇠 표식, 세 양은 처음 값을 1 로 한 막대 셋으로 보인다.
//
// 이웃 `gas-pressure` 가 「압력 = 분자 두드림의 합」 을 보인다. 이 조각은 그것을
// 되풀이하지 않는다 — 분자는 배경이고 주장은 세 막대의 비에 있다.
// 보일 · 샤를 각론의 그래프(`boyles-law` · `charles-law` 몫)는 두지 않는다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:ideal-gas-law` 와 문자 그대로 일치한다 (C4). */
export const IDEAL_GAS_LAW_ID = 'ideal-gas-law';

// ------------------------------------------------------------------------
// 물리 · 표시 배율 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 기체의 양(mol). */
export const N_MOL = 1;
/** 기체 상수(J/(mol·K)). */
export const GAS_R = 8.314;
/** 처음 절대온도(K). */
export const T_START = 300;
/** 처음 부피(L). n · R · T 와 함께 처음 압력(약 100 kPa)을 정한다. */
export const V_START = 24.94;
/** 1 단계 — 온도를 붙들고 부피를 이 수로 나눈다. */
export const VOLUME_DIVISOR = 2;
/** 2 단계 — 압력을 붙들고 절대온도를 이 배수로 올린다. */
export const ISOBARIC_HEAT = 2;
/** 3 단계 — 부피를 붙들고 절대온도를 이 배수로 올린다. */
export const ISOCHORIC_HEAT = 2;

/** 분자 배치를 뽑는 시드와 분자 수. */
export const MOLECULE_SEED = 7;
export const MOLECULE_COUNT = 46;
/** 처음 상태에서 분자가 상자를 한 번 오가는 빈도의 범위(회/초). */
export const MOLECULE_RATE_MIN = 0.14;
export const MOLECULE_RATE_MAX = 0.34;

/** 표시 배율 — 부피 1 L 가 실린더 안에서 차지하는 길이(월드). */
export const WORLD_PER_LITER = 0.104;
/** 표시 배율 — 막대에서 처음 값(비 1)의 높이(월드). */
export const BAR_UNIT = 0.95;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 실린더는 가로로 눕고 피스톤이 오른쪽에서 드나든다.
// ------------------------------------------------------------------------

/** 실린더 안쪽. `left` 가 막힌 벽, 오른쪽은 열려 피스톤이 드나든다. */
export const CYLINDER = { left: 0, bottom: 0, top: 1.9, end: 5.85 } as const;
/** 피스톤 두께 · 피스톤 막대 길이 · 막대 굵기(월드). */
export const PISTON_THICKNESS = 0.22;
export const ROD_LENGTH = 0.62;
export const ROD_THICKNESS = 0.12;
/** 분자가 벽에서 떨어져 있는 여유(월드). 점 반지름만큼 안으로 들인다. */
export const MOLECULE_MARGIN = 0.05;

/** 데우는 판 — 실린더 바닥 아래 띠(월드 y). */
export const HEATER = { top: -0.1, bottom: -0.26, inset: 0.25 } as const;

/** 막대 셋의 가운데 x 와 폭. P · V · T 순서다. */
export const BAR_CENTERS = { p: 6.85, v: 7.65, t: 8.45 } as const;
export const BAR_WIDTH = 0.46;
/** 처음 값(비 1) 기준선이 막대 밖으로 나오는 여유(월드). */
export const REFERENCE_OVERHANG = 0.16;
/** 자물쇠가 막대 윗면 위로 떠 있는 거리(월드). */
export const LOCK_GAP = 0.28;

/**
 * 프레이밍은 주장의 일부다. 가로는 막힌 벽부터 T 막대까지, 세로는 막대 두 배
 * 높이 위의 배수 글자와 아래 캡션 줄까지. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -0.35, maxX: 9.0, minY: -1.0, maxY: 2.75 } as const;

// ------------------------------------------------------------------------
// 문안 (C1)
// ------------------------------------------------------------------------

export const idealGasLawMessages = Object.freeze({
  'label.title': {
    ko: '이상 기체 법칙',
    en: 'Ideal gas law',
    ja: '理想気体の状態方程式',
    zh: '理想气体状态方程',
    ar: 'قانون الغاز المثالي',
    es: 'Ley de los gases ideales',
    fr: 'Loi des gaz parfaits',
    hi: 'आदर्श गैस नियम',
    id: 'Hukum gas ideal',
    pt: 'Lei dos gases ideais',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '압력·부피·온도의 관계',
    en: 'How pressure, volume and temperature relate',
    ja: '圧力・体積・温度の関係',
    zh: '压强、体积与温度的关系',
    ar: 'العلاقة بين الضغط والحجم ودرجة الحرارة',
    es: 'Cómo se relacionan presión, volumen y temperatura',
    fr: 'Comment pression, volume et température sont liés',
    hi: 'दाब, आयतन और ताप का संबंध',
    id: 'Hubungan tekanan, volume, dan suhu',
    pt: 'Como pressão, volume e temperatura se relacionam',
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
    ko: '실린더와 막대',
    en: 'Cylinder and bars',
    ja: 'シリンダーと棒',
    zh: '气缸与柱条',
    ar: 'الأسطوانة والأعمدة',
    es: 'Cilindro y barras',
    fr: 'Cylindre et barres',
    hi: 'सिलिंडर और दंड',
    id: 'Silinder dan batang',
    pt: 'Cilindro e barras',
  },

  /** 막대 이름. 물리 기호라 번역하지 않는다 (C1 판정 3). */
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
  'label.temperature': {
    ko: 'T',
    en: 'T',
    ja: 'T',
    zh: 'T',
    ar: 'T',
    es: 'T',
    fr: 'T',
    hi: 'T',
    id: 'T',
    pt: 'T',
  },
  /** 막대 위 배수. 값은 스테이지 상수를 그대로 끼운다. */
  'label.times': {
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
  'label.timesInverse': {
    ko: '×1/{k}',
    en: '×1/{k}',
    ja: '×1/{k}',
    zh: '×1/{k}',
    ar: '×1/{k}',
    es: '×1/{k}',
    fr: '×1/{k}',
    hi: '×1/{k}',
    id: '×1/{k}',
    pt: '×1/{k}',
  },

  'caption.lockTemperature': {
    ko: '온도에 자물쇠를 건다',
    en: 'The temperature is locked',
    ja: '温度を固定する',
    zh: '锁定温度',
    ar: 'تُثبَّت درجة الحرارة',
    es: 'Se fija la temperatura',
    fr: 'La température est bloquée',
    hi: 'ताप स्थिर किया जाता है',
    id: 'Suhu dikunci',
    pt: 'A temperatura é travada',
  },
  'caption.compress': {
    ko: '피스톤을 밀어 부피를 {k1}분의 1로 줄인다',
    en: 'The piston is pushed in to cut the volume to 1/{k1}',
    ja: 'ピストンを押し込み、体積を1/{k1}にする',
    zh: '推入活塞，把体积减小到 1/{k1}',
    ar: 'يُدفع المكبس إلى الداخل ليقل الحجم إلى 1/{k1}',
    es: 'Se empuja el pistón para reducir el volumen a 1/{k1}',
    fr: 'On enfonce le piston pour réduire le volume à 1/{k1}',
    hi: 'पिस्टन को अंदर धकेलकर आयतन 1/{k1} किया जाता है',
    id: 'Piston didorong masuk sehingga volume menjadi 1/{k1}',
    pt: 'O pistão é empurrado para reduzir o volume a 1/{k1}',
  },
  'caption.holdTemperature': {
    ko: '온도는 그대로 — 부피가 {k1}분의 1이 되자 압력 막대가 {k1}배로 섰다',
    en: 'Same temperature — with the volume at 1/{k1}, the pressure bar stands ×{k1}',
    ja: '温度は同じ — 体積が1/{k1}になると、圧力の棒は×{k1}に伸びた',
    zh: '温度不变——体积变为 1/{k1}，压强柱升到 ×{k1}',
    ar: 'درجة الحرارة نفسها — مع الحجم عند 1/{k1}، يرتفع عمود الضغط إلى ×{k1}',
    es: 'Misma temperatura — con el volumen a 1/{k1}, la barra de presión llega a ×{k1}',
    fr: 'Même température — avec le volume à 1/{k1}, la barre de pression monte à ×{k1}',
    hi: 'ताप वही — आयतन 1/{k1} होने पर दाब का दंड ×{k1} हो गया',
    id: 'Suhu sama — dengan volume 1/{k1}, batang tekanan naik menjadi ×{k1}',
    pt: 'Mesma temperatura — com o volume em 1/{k1}, a barra de pressão chega a ×{k1}',
  },
  'caption.lockPressure': {
    ko: '압력에 자물쇠를 건다 — 피스톤이 풀려 있다',
    en: 'The pressure is locked — the piston is free to move',
    ja: '圧力を固定する — ピストンは自由に動ける',
    zh: '锁定压强——活塞可以自由移动',
    ar: 'يُثبَّت الضغط — والمكبس حر الحركة',
    es: 'Se fija la presión — el pistón se mueve libremente',
    fr: 'La pression est bloquée — le piston peut bouger librement',
    hi: 'दाब स्थिर किया जाता है — पिस्टन चलने को स्वतंत्र है',
    id: 'Tekanan dikunci — piston bebas bergerak',
    pt: 'A pressão é travada — o pistão fica livre para se mover',
  },
  'caption.heatAtPressure': {
    ko: '아래에서 데워 절대온도를 {k2}배로 올린다',
    en: 'Heating from below raises the absolute temperature ×{k2}',
    ja: '下から加熱して絶対温度を×{k2}にする',
    zh: '从下方加热，使热力学温度变为 ×{k2}',
    ar: 'التسخين من الأسفل يرفع درجة الحرارة المطلقة ×{k2}',
    es: 'Calentar desde abajo eleva la temperatura absoluta ×{k2}',
    fr: 'Le chauffage par le bas porte la température absolue à ×{k2}',
    hi: 'नीचे से गर्म करने पर परम ताप ×{k2} हो जाता है',
    id: 'Pemanasan dari bawah menaikkan suhu mutlak ×{k2}',
    pt: 'Aquecer por baixo eleva a temperatura absoluta ×{k2}',
  },
  'caption.holdPressure': {
    ko: '압력은 그대로 — 온도가 {k2}배가 되자 피스톤이 밀려나 부피도 {k2}배가 됐다',
    en: 'Same pressure — with the temperature ×{k2}, the piston moved out and the volume is ×{k2} too',
    ja: '圧力は同じ — 温度が×{k2}になると、ピストンが押し出されて体積も×{k2}になった',
    zh: '压强不变——温度变为 ×{k2}，活塞被推出，体积也变为 ×{k2}',
    ar: 'الضغط نفسه — مع درجة الحرارة ×{k2}، اندفع المكبس إلى الخارج وصار الحجم ×{k2} أيضًا',
    es: 'Misma presión — con la temperatura ×{k2}, el pistón salió y el volumen también es ×{k2}',
    fr: 'Même pression — avec la température ×{k2}, le piston est sorti et le volume est aussi ×{k2}',
    hi: 'दाब वही — ताप ×{k2} होने पर पिस्टन बाहर खिसका और आयतन भी ×{k2} हो गया',
    id: 'Tekanan sama — dengan suhu ×{k2}, piston terdorong keluar dan volume juga ×{k2}',
    pt: 'Mesma pressão — com a temperatura ×{k2}, o pistão saiu e o volume também ficou ×{k2}',
  },
  'caption.lockVolume': {
    ko: '부피에 자물쇠를 건다 — 피스톤이 고정됐다',
    en: 'The volume is locked — the piston is held in place',
    ja: '体積を固定する — ピストンは固定された',
    zh: '锁定体积——活塞被固定',
    ar: 'يُثبَّت الحجم — والمكبس مثبت في مكانه',
    es: 'Se fija el volumen — el pistón queda inmóvil',
    fr: 'Le volume est bloqué — le piston est maintenu en place',
    hi: 'आयतन स्थिर किया जाता है — पिस्टन अपनी जगह रुका है',
    id: 'Volume dikunci — piston ditahan di tempatnya',
    pt: 'O volume é travado — o pistão fica preso no lugar',
  },
  'caption.heatAtVolume': {
    ko: '피스톤을 둔 채 절대온도를 {k3}배로 올린다',
    en: 'With the piston held, the absolute temperature is raised ×{k3}',
    ja: 'ピストンを固定したまま、絶対温度を×{k3}にする',
    zh: '活塞保持不动，热力学温度升到 ×{k3}',
    ar: 'مع تثبيت المكبس، تُرفع درجة الحرارة المطلقة ×{k3}',
    es: 'Con el pistón fijo, la temperatura absoluta sube ×{k3}',
    fr: 'Piston maintenu, la température absolue passe à ×{k3}',
    hi: 'पिस्टन को रोके रखकर परम ताप ×{k3} किया जाता है',
    id: 'Dengan piston ditahan, suhu mutlak dinaikkan ×{k3}',
    pt: 'Com o pistão preso, a temperatura absoluta sobe ×{k3}',
  },
  'caption.holdVolume': {
    ko: '부피는 그대로 — 온도가 {k3}배가 되자 압력 막대도 {k3}배로 섰다',
    en: 'Same volume — with the temperature ×{k3}, the pressure bar stands ×{k3} too',
    ja: '体積は同じ — 温度が×{k3}になると、圧力の棒も×{k3}に伸びた',
    zh: '体积不变——温度变为 ×{k3}，压强柱也升到 ×{k3}',
    ar: 'الحجم نفسه — مع درجة الحرارة ×{k3}، يرتفع عمود الضغط إلى ×{k3} أيضًا',
    es: 'Mismo volumen — con la temperatura ×{k3}, la barra de presión también llega a ×{k3}',
    fr: 'Même volume — avec la température ×{k3}, la barre de pression monte aussi à ×{k3}',
    hi: 'आयतन वही — ताप ×{k3} होने पर दाब का दंड भी ×{k3} हो गया',
    id: 'Volume sama — dengan suhu ×{k3}, batang tekanan juga naik menjadi ×{k3}',
    pt: 'Mesmo volume — com a temperatura ×{k3}, a barra de pressão também chega a ×{k3}',
  },
  'caption.release': {
    ko: '자물쇠를 풀고 처음 상태로 돌아간다',
    en: 'The lock comes off and the gas returns to where it started',
    ja: '固定を外し、気体は最初の状態に戻る',
    zh: '解除锁定，气体回到初始状态',
    ar: 'يُرفع التثبيت ويعود الغاز إلى حالته الأولى',
    es: 'Se quita el bloqueo y el gas vuelve al estado inicial',
    fr: 'Le blocage est levé et le gaz revient à son état de départ',
    hi: 'लॉक हटता है और गैस अपनी शुरुआती अवस्था में लौट आती है',
    id: 'Kunci dilepas dan gas kembali ke keadaan awal',
    pt: 'A trava é solta e o gás volta ao estado inicial',
  },
} satisfies Record<string, LocalizedText>);

export type IdealGasLawMessageKey = keyof typeof idealGasLawMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: IdealGasLawMessageKey): LocalizedText => idealGasLawMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: IdealGasLawMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// 시간표
// ------------------------------------------------------------------------

/**
 * 시간표의 단계 id. scene · physics 가 `at(id)` 로 부른다.
 *
 * 분자의 움직임은 한 주기 동안 쌓인 「온도 · 부피가 정한 속도」 의 합이라, physics 가
 * 단계마다 `at(id)` · `duration(id)` 를 물어 더한다. 그때 훑을 목록이 필요한데
 * `TimelineFrame` 에는 단계 목록이 없다(장부 G193). 그래서 id 만 여기 한 벌 둔다 —
 * 길이 · 순서 · 이징은 여전히 아래 선언이 정하고 physics 는 프레임에게 묻는다.
 */
export const PHASE_IDS = [
  'lockT',
  'compress',
  'holdT',
  'releaseT',
  'lockP',
  'heatP',
  'holdP',
  'releaseP',
  'lockV',
  'heatV',
  'holdV',
  'releaseV',
] as const;
export type PhaseId = (typeof PHASE_IDS)[number];

/** 자물쇠가 나타나는 · 바꾸는 · 결과를 읽는 · 되돌아가는 동안(초). */
const LOCK_S = 1.2;
const CHANGE_S = 2.6;
const HOLD_S = 2.8;
const RELEASE_S = 1.1;

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const idealGasLawSchema: BundleSchema = {
  id: IDEAL_GAS_LAW_ID,
  label: text('label.title'),
  category: 'thermal',
  description: text('label.description'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 자물쇠가 걸리고, 하나가 바뀌고, 하나가 따라간다.
  parameters: [],

  stages: [
    {
      id: 'cylinder',
      label: text('label.stage'),
      constants: {
        n: N_MOL,
        R: GAS_R,
        t0: T_START,
        v0: V_START,
        volumeDivisor: VOLUME_DIVISOR,
        isobaricHeat: ISOBARIC_HEAT,
        isochoricHeat: ISOCHORIC_HEAT,
        seed: MOLECULE_SEED,
        molecules: MOLECULE_COUNT,
        rateMin: MOLECULE_RATE_MIN,
        rateMax: MOLECULE_RATE_MAX,
        worldPerLiter: WORLD_PER_LITER,
        barUnit: BAR_UNIT,
      },
    },
  ],

  environments: [],

  views: [{ id: 'cylinder', label: text('label.view'), default: true }],

  // 가로로 긴 장치 하나 + 막대 셋. 세로를 더 주면 가로가 먼저 차서 그림만 작아진다.
  canvas: { height: 360, minHeight: 320 },

  /**
   * 겹침 순서를 scene 이 정한다. 옅은 기체 기둥은 분자 **아래** 로 깔려야 분자가 또렷하고,
   * 층 순서로는 `region`(매질)이 물체 위로 올라온다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = (자물쇠 → 바꾸기 → 결과 → 되돌림) × 세 번.
   *
   * 바꾸는 단계는 `linear` 다 — 분자 속력을 단계마다 더하는 physics 가 진행도를 시간에
   * 비례한다고 보고 적분한다(NOTES 「어휘 부족」 G59). 다른 이징을 주어도 분자가
   * 튀지는 않고 속력이 조금 어긋날 뿐이다.
   */
  timeline: {
    phases: [
      { id: 'lockT', duration: LOCK_S, caption: key('caption.lockTemperature') },
      { id: 'compress', duration: CHANGE_S, caption: key('caption.compress') },
      { id: 'holdT', duration: HOLD_S, caption: key('caption.holdTemperature') },
      { id: 'releaseT', duration: RELEASE_S, caption: key('caption.release') },
      { id: 'lockP', duration: LOCK_S, caption: key('caption.lockPressure') },
      { id: 'heatP', duration: CHANGE_S, caption: key('caption.heatAtPressure') },
      { id: 'holdP', duration: HOLD_S, caption: key('caption.holdPressure') },
      { id: 'releaseP', duration: RELEASE_S, caption: key('caption.release') },
      { id: 'lockV', duration: LOCK_S, caption: key('caption.lockVolume') },
      { id: 'heatV', duration: CHANGE_S, caption: key('caption.heatAtVolume') },
      { id: 'holdV', duration: HOLD_S, caption: key('caption.holdVolume') },
      { id: 'releaseV', duration: RELEASE_S, caption: key('caption.release') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — 온도에 자물쇠가 걸리고 피스톤이 밀려 들어가는 중에 연다. */
  startAt: 1.9,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 식과 법칙의 진술은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 14,
    wrapWidth: 760,
    style: { colorRole: 'muted', emphasis: 'strong' },
    // 배수는 스테이지 상수에서 온다 — state 가 글자로 옮겨 둔다(장부 G133 우회).
    vars: { k1: 'k1', k2: 'k2', k3: 'k3' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것은 거리가 아니라 **처음 값에 대한 배수**라,
   * 막대에 처음 높이 기준선 하나만 긋는다.
   */

  messages: idealGasLawMessages,
};
