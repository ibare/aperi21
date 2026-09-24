// ========================================================================
// cyclic-process — 선언
// ========================================================================
// 질문: 기체가 한 바퀴 돌아 처음 상태로 오면 아무 일도 없었던 것과 같은가.
//
// P-V 그림에서 네 꼭짓점 직사각형 순환(등압 · 등적 두 쌍)을 시계 방향으로 돈다.
// 팽창 구간 아래가 칠해지고(한 일), 압축 구간 아래가 빗금으로 바뀌고(받은 일),
// 빗금 친 몫이 지워져 고리 안만 남는다. 옆 온도계는 처음 눈금으로 돌아온다.
// 동사: (고리 안 넓이가) 남는다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:cyclic-process` 와 문자 그대로 일치한다 (C4). */
export const CYCLIC_PROCESS_ID = 'cyclic-process';

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const cyclicProcessMessages = Object.freeze({
  'label.title': {
    ko: '순환 과정',
    en: 'Cyclic process',
    ja: '循環過程',
    zh: '循环过程',
    ar: 'العملية الدورية',
    es: 'Proceso cíclico',
    fr: 'Transformation cyclique',
    hi: 'चक्रीय प्रक्रम',
    id: 'Proses siklus',
    pt: 'Processo cíclico',
  },
  'label.operation': {
    ko: '제자리로 돌아오는 변화',
    en: 'A change that comes back to where it began',
    ja: '始まった状態に戻ってくる変化',
    zh: '回到起始状态的变化',
    ar: 'تغيّر يعود إلى حيث بدأ',
    es: 'Un cambio que vuelve a donde empezó',
    fr: 'Une transformation qui revient à son point de départ',
    hi: 'ऐसा परिवर्तन जो वहीं लौट आता है जहाँ से शुरू हुआ था',
    id: 'Perubahan yang kembali ke tempat ia bermula',
    pt: 'Uma mudança que volta ao ponto onde começou',
  },
  'label.stage': {
    ko: '직사각형 순환',
    en: 'Rectangular cycle',
    ja: '長方形のサイクル',
    zh: '矩形循环',
    ar: 'دورة مستطيلة',
    es: 'Ciclo rectangular',
    fr: 'Cycle rectangulaire',
    hi: 'आयताकार चक्र',
    id: 'Siklus persegi panjang',
    pt: 'Ciclo retangular',
  },
  'label.view': {
    ko: 'P–V 그림과 온도계',
    en: 'P–V diagram and thermometer',
    ja: 'P–V 図と温度計',
    zh: 'P–V 图与温度计',
    ar: 'مخطط P–V ومقياس الحرارة',
    es: 'Diagrama P–V y termómetro',
    fr: 'Diagramme P–V et thermomètre',
    hi: 'P–V आरेख और तापमापी',
    id: 'Diagram P–V dan termometer',
    pt: 'Diagrama P–V e termômetro',
  },

  'label.workOut': {
    ko: '한 일',
    en: 'Work done',
    ja: 'した仕事',
    zh: '对外做的功',
    ar: 'الشغل المبذول',
    es: 'Trabajo realizado',
    fr: 'Travail fourni',
    hi: 'किया गया कार्य',
    id: 'Usaha yang dilakukan',
    pt: 'Trabalho realizado',
  },
  'label.workIn': {
    ko: '받은 일',
    en: 'Work received',
    ja: 'された仕事',
    zh: '外界做的功',
    ar: 'الشغل المستقبَل',
    es: 'Trabajo recibido',
    fr: 'Travail reçu',
    hi: 'प्राप्त कार्य',
    id: 'Usaha yang diterima',
    pt: 'Trabalho recebido',
  },
  'label.net': {
    ko: '남은 일',
    en: 'Work left',
    ja: '残った仕事',
    zh: '剩下的功',
    ar: 'الشغل المتبقي',
    es: 'Trabajo restante',
    fr: 'Travail restant',
    hi: 'बचा हुआ कार्य',
    id: 'Usaha yang tersisa',
    pt: 'Trabalho restante',
  },
  'label.start': {
    ko: '처음',
    en: 'Start',
    ja: '最初',
    zh: '起点',
    ar: 'البداية',
    es: 'Inicio',
    fr: 'Départ',
    hi: 'आरंभ',
    id: 'Awal',
    pt: 'Início',
  },

  'caption.start': {
    ko: '상태 A 에서 출발한다 — 온도계의 지금 높이가 「처음」 눈금',
    en: 'Starting from state A — the thermometer sits at the "Start" mark',
    ja: '状態 A から出発する — 温度計のいまの高さが「最初」の目盛り',
    zh: '从状态 A 出发 — 温度计停在“起点”刻度',
    ar: 'الانطلاق من الحالة A — مقياس الحرارة عند علامة «البداية»',
    es: 'Partiendo del estado A — el termómetro está en la marca «Inicio»',
    fr: 'Départ de l’état A — le thermomètre est sur le repère « Départ »',
    hi: 'अवस्था A से शुरुआत — तापमापी "आरंभ" निशान पर है',
    id: 'Berangkat dari keadaan A — termometer berada di tanda "Awal"',
    pt: 'Partindo do estado A — o termômetro está na marca "Início"',
  },
  'caption.expand': {
    ko: '압력을 그대로 두고 부피가 늘어난다 — 지나온 길 아래가 칠해지고 온도계가 오른다',
    en: 'Volume grows at constant pressure — the area under the path fills and the thermometer rises',
    ja: '圧力を一定にしたまま体積が増える — 通った道の下の面積が塗られ、温度計が上がる',
    zh: '压强不变，体积增大 — 路径下方的面积被涂满，温度计上升',
    ar: 'يزداد الحجم عند ضغط ثابت — تمتلئ المساحة تحت المسار ويرتفع مقياس الحرارة',
    es: 'El volumen crece a presión constante — el área bajo el camino se rellena y el termómetro sube',
    fr: 'Le volume augmente à pression constante — l’aire sous le chemin se remplit et le thermomètre monte',
    hi: 'स्थिर दाब पर आयतन बढ़ता है — पथ के नीचे का क्षेत्रफल भरता है और तापमापी चढ़ता है',
    id: 'Volume bertambah pada tekanan tetap — luas di bawah lintasan terisi dan termometer naik',
    pt: 'O volume cresce a pressão constante — a área sob o caminho se preenche e o termômetro sobe',
  },
  'caption.cool': {
    ko: '부피를 그대로 두고 식힌다 — 압력이 내려가고, 칠해지는 넓이는 없다',
    en: 'Cooling at fixed volume — the pressure drops and no area fills',
    ja: '体積を一定にしたまま冷やす — 圧力が下がり、塗られる面積はない',
    zh: '体积不变，冷却 — 压强下降，没有面积被涂上',
    ar: 'التبريد عند حجم ثابت — ينخفض الضغط ولا تمتلئ أي مساحة',
    es: 'Enfriando a volumen fijo — la presión baja y no se rellena ningún área',
    fr: 'Refroidissement à volume fixe — la pression baisse et aucune aire ne se remplit',
    hi: 'स्थिर आयतन पर ठंडा करना — दाब घटता है और कोई क्षेत्रफल नहीं भरता',
    id: 'Didinginkan pada volume tetap — tekanan turun dan tidak ada luas yang terisi',
    pt: 'Resfriando a volume fixo — a pressão cai e nenhuma área se preenche',
  },
  'caption.compress': {
    ko: '압력을 그대로 두고 부피가 줄어든다 — 지나온 길 아래가 빗금으로 바뀐다',
    en: 'Volume shrinks at constant pressure — the area under the path turns hatched',
    ja: '圧力を一定にしたまま体積が減る — 通った道の下の面積が斜線に変わる',
    zh: '压强不变，体积减小 — 路径下方的面积变成斜线',
    ar: 'يتناقص الحجم عند ضغط ثابت — تتحول المساحة تحت المسار إلى مظلَّلة بخطوط',
    es: 'El volumen se reduce a presión constante — el área bajo el camino pasa a rayada',
    fr: 'Le volume diminue à pression constante — l’aire sous le chemin devient hachurée',
    hi: 'स्थिर दाब पर आयतन घटता है — पथ के नीचे का क्षेत्रफल धारीदार हो जाता है',
    id: 'Volume berkurang pada tekanan tetap — luas di bawah lintasan berubah menjadi arsiran',
    pt: 'O volume diminui a pressão constante — a área sob o caminho fica hachurada',
  },
  'caption.heat': {
    ko: '부피를 그대로 두고 데운다 — 압력이 오르고 온도계가 올라간다',
    en: 'Heating at fixed volume — the pressure rises and so does the thermometer',
    ja: '体積を一定にしたまま温める — 圧力が上がり、温度計も上がる',
    zh: '体积不变，加热 — 压强升高，温度计也上升',
    ar: 'التسخين عند حجم ثابت — يرتفع الضغط ويرتفع معه مقياس الحرارة',
    es: 'Calentando a volumen fijo — la presión sube y el termómetro también',
    fr: 'Chauffage à volume fixe — la pression monte, et le thermomètre aussi',
    hi: 'स्थिर आयतन पर गर्म करना — दाब बढ़ता है और तापमापी भी चढ़ता है',
    id: 'Dipanaskan pada volume tetap — tekanan naik, begitu pula termometer',
    pt: 'Aquecendo a volume fixo — a pressão sobe, e o termômetro também',
  },
  'caption.cancel': {
    ko: '다시 A — 빗금 친 넓이가 칠해진 넓이에서 지워진다',
    en: 'Back at A — the hatched area is taken away from the shaded area',
    ja: 'ふたたび A — 斜線の面積が塗られた面積から差し引かれる',
    zh: '回到 A — 斜线面积从涂色面积中减去',
    ar: 'العودة إلى A — تُطرَح المساحة المظلَّلة بخطوط من المساحة الملوّنة',
    es: 'De vuelta en A — el área rayada se resta del área sombreada',
    fr: 'Retour en A — l’aire hachurée est retirée de l’aire colorée',
    hi: 'फिर से A — धारीदार क्षेत्रफल रंगे हुए क्षेत्रफल में से घटा दिया जाता है',
    id: 'Kembali di A — luas arsiran dikurangkan dari luas yang diwarnai',
    pt: 'De volta em A — a área hachurada é subtraída da área sombreada',
  },
  'caption.result': {
    ko: '온도계는 「처음」 눈금 그대로인데, 고리 안 넓이는 남았다',
    en: 'The thermometer is back at "Start", yet the area inside the loop is left',
    ja: '温度計は「最初」の目盛りに戻ったのに、ループの内側の面積は残った',
    zh: '温度计回到了“起点”，但环内的面积留了下来',
    ar: 'عاد مقياس الحرارة إلى «البداية»، ومع ذلك بقيت المساحة داخل الحلقة',
    es: 'El termómetro vuelve a «Inicio», pero el área dentro del ciclo se queda',
    fr: 'Le thermomètre est revenu sur « Départ », mais l’aire à l’intérieur de la boucle reste',
    hi: 'तापमापी वापस "आरंभ" पर है, फिर भी लूप के भीतर का क्षेत्रफल बचा रहता है',
    id: 'Termometer kembali ke "Awal", tetapi luas di dalam kurva tertutup tetap tersisa',
    pt: 'O termômetro voltou a "Início", mas a área dentro do ciclo permanece',
  },
} satisfies Record<string, LocalizedText>);

export type CyclicProcessMessageKey = keyof typeof cyclicProcessMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: CyclicProcessMessageKey): LocalizedText => cyclicProcessMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: CyclicProcessMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const cyclicProcessSchema: BundleSchema = {
  id: CYCLIC_PROCESS_ID,
  label: text('label.title'),
  category: 'thermal',
  operation: text('label.operation'),
  timeModel: 'periodic',
  parameters: [],

  /**
   * 네 꼭짓점 — 모두 선언이다. P 는 임의 단위, V 는 L.
   *
   * - `pHigh` 팽창하는 쪽 압력 · `pLow` 압축하는 쪽 압력
   * - `v1` 작은 부피 · `v2` 큰 부피
   *
   * A = (v1, pHigh) → B = (v2, pHigh) → C = (v2, pLow) → D = (v1, pLow) → A.
   * 온도는 P·V 에 비례해 온도계 높이가 된다 (이상 기체, 물질량 고정).
   */
  stages: [
    {
      id: 'rectangle',
      label: text('label.stage'),
      constants: { pHigh: 3, pLow: 1, v1: 1, v2: 4 },
    },
  ],
  environments: [],
  views: [{ id: 'main', label: text('label.view'), default: true }],

  canvas: { height: 340, minHeight: 320 },

  /** 쓴 순서대로 — 넓이가 축 · 길 아래에, 상태점이 맨 위에 온다. */
  drawOrder: 'scene',

  /**
   * 한 바퀴. 네 다리(expand · cool · compress · heat)가 직사각형의 네 변이고,
   * cancel 에서 빗금 친 몫이 지워지고 hold 에서 고리 안만 남는다. out 에서 옅어져 다시 연다.
   */
  timeline: {
    phases: [
      { id: 'show', duration: 0.8, caption: key('caption.start') },
      { id: 'expand', duration: 2.6, ease: 'smooth', caption: key('caption.expand') },
      { id: 'cool', duration: 1.4, ease: 'smooth', caption: key('caption.cool') },
      { id: 'compress', duration: 2.6, ease: 'smooth', caption: key('caption.compress') },
      { id: 'heat', duration: 1.4, ease: 'smooth', caption: key('caption.heat') },
      { id: 'cancel', duration: 1.2, ease: 'smooth', caption: key('caption.cancel') },
      { id: 'hold', duration: 2.8, caption: key('caption.result') },
      { id: 'out', duration: 0.5, caption: key('caption.result') },
    ],
  },

  /** 도착한 순간 이미 부피가 늘며 길 아래가 칠해지는 중이다. */
  startAt: 1.6,

  caption: {
    anchor: { screen: 'bottom-left', offset: [16, -12] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 600,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  messages: cyclicProcessMessages,
};
