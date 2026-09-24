// ========================================================================
// archimedes-principle — 선언
// ========================================================================
// 질문: 부력은 왜 하필 밀려난 물의 무게와 같은가.
//
// 이 파일이 담는 것 (원칙 2):
//  - 화면에 뜨는 모든 문자 (`archimedesPrincipleMessages`)
//  - 물리 상수·연출 시간 (`stages[0].constants`)
//  - 임베드 치수 (`canvas`)
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:archimedes-principle` 와 문자 그대로 일치한다 (C4). */
export const ARCHIMEDES_PRINCIPLE_ID = 'archimedes-principle';

// ------------------------------------------------------------------------
// 1. 화면 문안 — 저작자가 정한 1층 (C1)
// ------------------------------------------------------------------------

/**
 * 정의 시점에 `LocalizedText` 적합성을 강제하면서 키 집합은 그대로 보존한다.
 * 코드에는 키만 남고 문안은 이 선언이 유일한 출처다.
 */
function defineMessages<T extends Record<string, LocalizedText>>(m: T): T {
  return m;
}

export const archimedesPrincipleMessages = defineMessages({
  'label.title': {
    ko: '아르키메데스 원리 — 부력의 크기',
    en: 'Archimedes principle — the size of the buoyant force',
    ja: 'アルキメデスの原理 — 浮力の大きさ',
    zh: '阿基米德原理 — 浮力的大小',
    ar: 'مبدأ أرخميدس — مقدار قوة الطفو',
    es: 'Principio de Arquímedes — la magnitud del empuje',
    fr: 'Principe d’Archimède — l’intensité de la poussée d’Archimède',
    hi: 'आर्किमिडीज़ का सिद्धांत — उत्प्लावन बल का परिमाण',
    id: 'Prinsip Archimedes — besarnya gaya apung',
    pt: 'Princípio de Arquimedes — a intensidade do empuxo',
  },
  'label.operation': {
    ko: '2.0 kg · 1.0 L 물체를 주둥이까지 가득 찬 물에 천천히 담근다. 밀려난 물이 주둥이로 넘쳐 컵에 모이고, 물체 쪽 저울이 줄어드는 만큼 넘친 물 쪽 저울이 늘어난다.',
    en: 'A 2.0 kg, 1.0 L object is lowered into a can filled to its spout. The displaced water pours into the cup, and the scale holding the water gains exactly what the scale holding the object loses.',
    ja: '2.0 kg・1.0 L の物体を、注ぎ口まで水を満たした容器に下ろす。押しのけられた水は注ぎ口からカップに流れ込み、物体側のはかりが減った分だけ水側のはかりが増える。',
    zh: '把 2.0 kg、1.0 L 的物体放入盛满水直到溢水口的溢水杯中。被排开的水流进小杯，物体一侧的秤减少多少，水一侧的秤就增加多少。',
    ar: 'يُنزَل جسم كتلته 2.0 kg وحجمه 1.0 L في وعاء مملوء بالماء حتى فوهته. يتدفق الماء المُزاح إلى الكوب، ويزداد الميزان الحامل للماء بالمقدار نفسه الذي ينقصه الميزان الحامل للجسم.',
    es: 'Un objeto de 2.0 kg y 1.0 L se baja dentro de un recipiente lleno hasta el pico. El agua desalojada cae en el vaso, y la balanza del agua gana exactamente lo que pierde la balanza del objeto.',
    fr: 'Un objet de 2.0 kg et 1.0 L est descendu dans un vase rempli jusqu’au bec. L’eau déplacée s’écoule dans le gobelet, et la balance qui reçoit l’eau gagne exactement ce que perd la balance qui tient l’objet.',
    hi: '2.0 kg और 1.0 L की एक वस्तु को टोंटी तक भरे बर्तन में उतारा जाता है। विस्थापित पानी टोंटी से कप में गिरता है, और पानी वाले तराज़ू पर ठीक उतना बढ़ता है जितना वस्तु वाले तराज़ू पर घटता है।',
    id: 'Benda 2.0 kg dan 1.0 L diturunkan ke dalam bejana yang terisi penuh sampai corotnya. Air yang dipindahkan tumpah ke gelas, dan timbangan air bertambah tepat sebesar berkurangnya timbangan benda.',
    pt: 'Um objeto de 2.0 kg e 1.0 L é baixado dentro de um recipiente cheio até o bico. A água deslocada escorre para o copo, e a balança da água ganha exatamente o que a balança do objeto perde.',
  },
  'label.stage': {
    ko: '실험대',
    en: 'lab bench',
    ja: '実験台',
    zh: '实验台',
    ar: 'طاولة المختبر',
    es: 'mesa de laboratorio',
    fr: 'paillasse',
    hi: 'प्रयोगशाला की मेज़',
    id: 'meja laboratorium',
    pt: 'bancada de laboratório',
  },
  'label.stageNote': {
    ko: '물 밀도 1000 kg/m³, 중력 가속도 9.8 m/s²',
    en: 'water density 1000 kg/m³, gravity 9.8 m/s²',
    ja: '水の密度 1000 kg/m³、重力加速度 9.8 m/s²',
    zh: '水的密度 1000 kg/m³，重力加速度 9.8 m/s²',
    ar: 'كثافة الماء 1000 kg/m³، تسارع الجاذبية 9.8 m/s²',
    es: 'densidad del agua 1000 kg/m³, gravedad 9.8 m/s²',
    fr: 'masse volumique de l’eau 1000 kg/m³, pesanteur 9.8 m/s²',
    hi: 'पानी का घनत्व 1000 kg/m³, गुरुत्वीय त्वरण 9.8 m/s²',
    id: 'massa jenis air 1000 kg/m³, gravitasi 9.8 m/s²',
    pt: 'densidade da água 1000 kg/m³, gravidade 9.8 m/s²',
  },
  'label.view': {
    ko: '두 저울',
    en: 'the two scales',
    ja: '二つのはかり',
    zh: '两台秤',
    ar: 'الميزانان',
    es: 'las dos balanzas',
    fr: 'les deux balances',
    hi: 'दोनों तराज़ू',
    id: 'dua timbangan',
    pt: 'as duas balanças',
  },

  'label.objectScale': {
    ko: '물체 쪽 저울',
    en: 'scale holding the object',
    ja: '物体側のはかり',
    zh: '物体一侧的秤',
    ar: 'ميزان الجسم',
    es: 'balanza del objeto',
    fr: 'balance de l’objet',
    hi: 'वस्तु वाला तराज़ू',
    id: 'timbangan benda',
    pt: 'balança do objeto',
  },
  'label.waterScale': {
    ko: '넘친 물 쪽 저울',
    en: 'scale holding the spilled water',
    ja: 'あふれた水のはかり',
    zh: '溢出水一侧的秤',
    ar: 'ميزان الماء المنسكب',
    es: 'balanza del agua derramada',
    fr: 'balance de l’eau débordée',
    hi: 'छलके पानी वाला तराज़ू',
    id: 'timbangan air yang tumpah',
    pt: 'balança da água derramada',
  },
  'label.buoyancy': {
    ko: '부력',
    en: 'buoyant force',
    ja: '浮力',
    zh: '浮力',
    ar: 'قوة الطفو',
    es: 'empuje',
    fr: 'poussée d’Archimède',
    hi: 'उत्प्लावन बल',
    id: 'gaya apung',
    pt: 'empuxo',
  },
  'label.brimFull': {
    ko: '주둥이까지 가득',
    en: 'full to the spout',
    ja: '注ぎ口まで満水',
    zh: '水满至溢水口',
    ar: 'ممتلئ حتى الفوهة',
    es: 'lleno hasta el pico',
    fr: 'plein jusqu’au bec',
    hi: 'टोंटी तक भरा',
    id: 'penuh sampai corot',
    pt: 'cheio até o bico',
  },
  'label.claim': {
    ko: '줄어든 무게 = 넘친 물의 무게',
    en: 'weight lost = weight of the water that left',
    ja: '減った重さ = あふれた水の重さ',
    zh: '减少的重量 = 溢出的水的重量',
    ar: 'الوزن المفقود = وزن الماء الذي خرج',
    es: 'peso perdido = peso del agua que salió',
    fr: 'poids perdu = poids de l’eau sortie',
    hi: 'घटा हुआ भार = बाहर निकले पानी का भार',
    id: 'berat yang hilang = berat air yang keluar',
    pt: 'peso perdido = peso da água que saiu',
  },

  'control.submersion': {
    ko: '잠긴 정도',
    en: 'how deep',
    ja: '沈める深さ',
    zh: '浸入深度',
    ar: 'عمق الغمر',
    es: 'profundidad',
    fr: 'profondeur d’immersion',
    hi: 'डुबाने की गहराई',
    id: 'kedalaman celup',
    pt: 'profundidade',
  },
} satisfies Record<string, LocalizedText>);

export type ArchimedesMessageKey = keyof typeof archimedesPrincipleMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export function text(key: ArchimedesMessageKey): LocalizedText {
  return archimedesPrincipleMessages[key];
}

/**
 * 뉴턴 단위 표식. C1 판정표 3번(수식·기호·단위 표기)에 따라 번역 대상이 아니다 —
 * 키를 주면 어느 언어에서 `N` 이 다른 글자로 바뀔 여지가 생긴다.
 */
export const FORCE_UNIT: LocalizedText = 'N';

// ------------------------------------------------------------------------
// 2. BundleSchema
// ------------------------------------------------------------------------

export const archimedesPrincipleSchema: BundleSchema = {
  id: ARCHIMEDES_PRINCIPLE_ID,
  label: text('label.title'),
  category: 'fluids',
  operation: text('label.operation'),
  timeModel: 'linear',

  // 조각이다. 읽는 사람이 고를 것은 없다.
  parameters: [],

  stages: [
    {
      id: 'bench',
      label: text('label.stage'),
      description: text('label.stageNote'),
      constants: {
        // 물리 — 호스트가 확정한 값.
        g: 9.8,
        rhoWater: 1000,
        objectMass: 2.0,
        objectVolume: 0.001,
        // 연출 시간 — 시작 시점도 저작 결정이다 (원칙 2).
        approachSeconds: 1.2,
        submergeSeconds: 4.6,
      },
    },
  ],

  environments: [],

  views: [{ id: 'balance', label: text('label.view'), default: true }],


  // 마운트 후 바뀌지 않는다 (원칙 6).
  canvas: { height: 460, minHeight: 460 },

  messages: archimedesPrincipleMessages,
};
