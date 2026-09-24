// ========================================================================
// parallel-plate-capacitor — 선언
// ========================================================================
// 질문: 같은 전지에 이은 평행판이 더 많은 전하를 담게 하려면 무엇을 바꾸는가.
//
// 전지에 이은 두 판의 간격을 d 에서 d/2 로 좁히면, 전압은 그대로인데 판 위 전하
// 표식(+ · −)이 네 개에서 여덟 개로 는다. 간격을 되돌리면 더한 만큼이 전지로
// 돌아가고, 이번에는 간격 그대로 판 넓이를 두 배로 늘리면 같은 쪽으로 — 전하가
// 두 배로 — 간다(짧게 한 번).
//
// 이웃과 겹치지 않는 자리 — `rc-circuit` 은 충전이 시간에 따라 잦아드는 곡선이고,
// `uniform-field` 는 판 사이의 장이다. 이 조각은 **판의 기하가 담는 양을 정한다**
// 는 것만 한다. 충전 시간 곡선 · 장선을 두지 않는다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:parallel-plate-capacitor` 와 문자 그대로 일치한다 (C4). */
export const PARALLEL_PLATE_CAPACITOR_ID = 'parallel-plate-capacitor';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 화면에 뜨는 수는 계산값이 아니라 여기 선언한 정박값이다 (S-piece 유효숫자).
// ------------------------------------------------------------------------

/** 전지 전압(V). 화면에 `{v} V` 로 뜬다. 한 주기 내내 바뀌지 않는다 — 그것이 전제다. */
export const VOLTAGE = 6;
/** 처음 판 간격 d 를 월드 몇 단위로 그리는가. */
export const BASE_GAP = 2.4;
/** 간격을 몇으로 나누는가 — d → d/2. 판 위 전하는 이 배수만큼 는다(Q = CV, C ∝ 1/d). */
export const GAP_DIVISOR = 2;
/** 처음 판 길이(옆에서 본 넓이 A, 월드 단위). 깊이는 같으므로 길이가 곧 넓이다. */
export const PLATE_LENGTH = 4;
/** 판 넓이를 몇 배로 늘리는가 — A → 2A. 판 위 전하도 이 배수만큼 는다(C ∝ A). */
export const AREA_MULTIPLE = 2;
/** 처음 판(d · A) 한 장에 담긴 전하 표식 수. 좁히거나 넓히면 그 배수만큼 는다. */
export const BASE_MARKS = 4;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 판 사이 한가운데가 y = 0.
// ------------------------------------------------------------------------

/** 전지 기호의 가로 자리. 기호는 가로로 누운 두 판이다 — 위의 긴 판이 + 다. */
export const BATTERY_X = -4.2;
/** 전지 기호의 긴 판(+) · 짧은 판(−) 반 길이와 두 판 사이 간격(월드 단위). */
export const BATTERY_LONG_HALF = 0.42;
export const BATTERY_SHORT_HALF = 0.22;
export const BATTERY_PLATE_GAP = 0.26;
/** 판의 왼쪽 끝. 넓힐 때는 오른쪽으로만 자란다 — 전지 쪽은 그대로다. */
export const PLATE_X0 = -0.4;
/** 판 두께(월드 단위). */
export const PLATE_THICKNESS = 0.14;
/** 도선이 판에 닿는 가로 자리 — 처음 판의 가운데. 넓힌 판에서도 판 위에 있다. */
export const WIRE_ATTACH_X = PLATE_X0 + PLATE_LENGTH / 2;
/** 위 · 아래 도선이 가로로 지나는 높이. */
export const WIRE_Y = 2.5;
/** 전하 표식이 판 안쪽 면에서 떨어진 거리 — 전하는 마주 보는 면에 모인다. */
export const MARK_INSET = 0.26;
/** 간격을 재는 치수선의 가로 자리(판 왼쪽 바깥). */
export const GAP_MEASURE_X = PLATE_X0 - 0.55;

/**
 * 프레이밍 — 전지 이름표부터 넓힌 판의 전하 이름표까지, 위아래 도선과 캡션 띠(장부 G24).
 * 가장 큰 장면(넓힌 판 2A)이 들어가도록 처음부터 잡는다 (S-piece · 원칙 6).
 */
export const SCENE_BOUNDS = { minX: -6.3, maxX: 9.5, minY: -3.65, maxY: 3.05 } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이(초)
// ------------------------------------------------------------------------

/** 처음 판(d · A)을 읽는 동안. */
export const BASE_HOLD = 2.2;
/** 간격을 좁히는 동안 · 좁힌 판을 읽는 동안 · 되돌리는 동안. */
export const CLOSE = 1.6;
export const NEAR_HOLD = 2.6;
export const OPEN = 1.0;
/** 판을 넓히는 동안 · 넓힌 판을 읽는 동안 · 되돌리는 동안. 넓이는 짧게 한 번이다. */
export const WIDEN = 1.4;
export const WIDE_HOLD = 2.4;
export const NARROW = 1.0;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const parallelPlateCapacitorMessages = Object.freeze({
  'label.title': { ko: '평행판 축전기', en: 'Parallel-plate capacitor', ja: '平行板コンデンサー', zh: '平行板电容器', ar: 'مكثف ذو لوحين متوازيين', es: 'Condensador de placas paralelas', fr: 'Condensateur plan', hi: 'समांतर प्लेट संधारित्र', id: 'Kapasitor keping sejajar', pt: 'Capacitor de placas paralelas' },
  'label.operation': {
    ko: '넓이·간격이 정하는 용량',
    en: 'Capacitance set by area and gap',
    ja: '面積と間隔で決まる電気容量',
    zh: '由面积和间距决定的电容',
    ar: 'سعة تحددها المساحة والمسافة بين اللوحين',
    es: 'Capacidad fijada por el área y la separación',
    fr: 'Capacité fixée par la surface et l’écartement',
    hi: 'क्षेत्रफल और अंतराल से तय होने वाली धारिता',
    id: 'Kapasitas yang ditentukan oleh luas dan jarak keping',
    pt: 'Capacitância definida pela área e pela distância',
  },
  'label.stage': { ko: '전지에 이은 두 판', en: 'Two plates on a battery', ja: '電池につないだ二枚の板', zh: '接在电池上的两块极板', ar: 'لوحان موصولان ببطارية', es: 'Dos placas conectadas a una batería', fr: 'Deux plaques reliées à une pile', hi: 'बैटरी से जुड़ी दो प्लेटें', id: 'Dua keping pada baterai', pt: 'Duas placas ligadas a uma bateria' },
  'label.view': { ko: '옆에서 본 판', en: 'Side view', ja: '側面図', zh: '侧视图', ar: 'منظر جانبي', es: 'Vista lateral', fr: 'Vue de côté', hi: 'पार्श्व दृश्य', id: 'Tampak samping', pt: 'Vista lateral' },
  /** 전지 전압 — 값이 끼는 조립이라 문안이다 (C1). */
  'label.voltage': { ko: '{v} V', en: '{v} V', ja: '{v} V', zh: '{v} V', ar: '{v} V', es: '{v} V', fr: '{v} V', hi: '{v} V', id: '{v} V', pt: '{v} V' },
  /** 간격 · 넓이 · 전하 기호. 수식 표기라 표식이고, 배수는 스테이지 상수를 vars 로 끼운다. */
  'label.gap': { ko: 'd', en: 'd', ja: 'd', zh: 'd', ar: 'd', es: 'd', fr: 'd', hi: 'd', id: 'd', pt: 'd' },
  'label.gapDivided': { ko: 'd/{n}', en: 'd/{n}', ja: 'd/{n}', zh: 'd/{n}', ar: 'd/{n}', es: 'd/{n}', fr: 'd/{n}', hi: 'd/{n}', id: 'd/{n}', pt: 'd/{n}' },
  'label.area': { ko: 'A', en: 'A', ja: 'A', zh: 'A', ar: 'A', es: 'A', fr: 'A', hi: 'A', id: 'A', pt: 'A' },
  'label.areaMultiplied': { ko: '{n}A', en: '{n}A', ja: '{n}A', zh: '{n}A', ar: '{n}A', es: '{n}A', fr: '{n}A', hi: '{n}A', id: '{n}A', pt: '{n}A' },
  'label.chargePlus': { ko: '+Q', en: '+Q', ja: '+Q', zh: '+Q', ar: '+Q', es: '+Q', fr: '+Q', hi: '+Q', id: '+Q', pt: '+Q' },
  'label.chargeMinus': { ko: '−Q', en: '−Q', ja: '−Q', zh: '−Q', ar: '−Q', es: '−Q', fr: '−Q', hi: '−Q', id: '−Q', pt: '−Q' },
  'label.chargePlusMultiplied': { ko: '+{n}Q', en: '+{n}Q', ja: '+{n}Q', zh: '+{n}Q', ar: '+{n}Q', es: '+{n}Q', fr: '+{n}Q', hi: '+{n}Q', id: '+{n}Q', pt: '+{n}Q' },
  'label.chargeMinusMultiplied': { ko: '−{n}Q', en: '−{n}Q', ja: '−{n}Q', zh: '−{n}Q', ar: '−{n}Q', es: '−{n}Q', fr: '−{n}Q', hi: '−{n}Q', id: '−{n}Q', pt: '−{n}Q' },
  /** 관례 전류의 기호. */
  'label.current': { ko: 'I', en: 'I', ja: 'I', zh: 'I', ar: 'I', es: 'I', fr: 'I', hi: 'I', id: 'I', pt: 'I' },
  'caption.base': {
    ko: '전지에 이은 두 판 — 위 판에 +, 아래 판에 − 가 같은 수만큼 담겨 있다',
    en: 'Two plates tied to a battery — as many + on the top plate as − on the bottom',
    ja: '電池につないだ二枚の板 — 上の板の + と下の板の − は同じ数だけある',
    zh: '接在电池上的两块极板 — 上板的 + 与下板的 − 一样多',
    ar: 'لوحان موصولان ببطارية — على اللوح العلوي من + بقدر ما على السفلي من −',
    es: 'Dos placas conectadas a una batería — hay tantos + en la placa de arriba como − en la de abajo',
    fr: 'Deux plaques reliées à une pile — autant de + sur la plaque du haut que de − sur celle du bas',
    hi: 'बैटरी से जुड़ी दो प्लेटें — ऊपर की प्लेट पर जितने + हैं, नीचे की प्लेट पर उतने ही − हैं',
    id: 'Dua keping terhubung ke baterai — jumlah + di keping atas sama dengan jumlah − di keping bawah',
    pt: 'Duas placas ligadas a uma bateria — há tantos + na placa de cima quanto − na de baixo',
  },
  'caption.close': {
    ko: '전압은 그대로 두고 간격을 좁히는 동안, 전지가 전하를 더 밀어 넣는다',
    en: 'The voltage stays the same; as the gap narrows, the battery pushes in more charge',
    ja: '電圧はそのまま。間隔が狭まるあいだ、電池がさらに電荷を押し込む',
    zh: '电压保持不变；间距缩小时，电池推入更多电荷',
    ar: 'يبقى الجهد كما هو؛ وبينما تضيق المسافة، تدفع البطارية مزيدًا من الشحنة',
    es: 'La tensión no cambia; al estrecharse la separación, la batería empuja más carga',
    fr: 'La tension reste la même ; à mesure que l’écartement diminue, la pile pousse davantage de charge',
    hi: 'वोल्टता वही रहती है; अंतराल घटने के साथ बैटरी और आवेश धकेलती है',
    id: 'Tegangannya tetap; saat jarak menyempit, baterai mendorong lebih banyak muatan',
    pt: 'A tensão continua a mesma; conforme a distância diminui, a bateria empurra mais carga',
  },
  'caption.near': {
    ko: '간격이 d/{gap} — 같은 전압에서 판마다 전하가 {gap}배 담겼다',
    en: 'The gap is d/{gap} — at the same voltage, each plate now holds {gap}× the charge',
    ja: '間隔は d/{gap} — 同じ電圧で、どの板にも電荷が {gap}× たまった',
    zh: '间距为 d/{gap} — 在相同电压下，每块极板上的电荷变为 {gap}×',
    ar: 'المسافة d/{gap} — عند الجهد نفسه، يحمل كل لوح الآن {gap}× الشحنة',
    es: 'La separación es d/{gap} — con la misma tensión, cada placa guarda ahora {gap}× la carga',
    fr: 'L’écartement vaut d/{gap} — à tension égale, chaque plaque porte maintenant {gap}× la charge',
    hi: 'अंतराल d/{gap} है — समान वोल्टता पर हर प्लेट पर अब {gap}× आवेश है',
    id: 'Jaraknya d/{gap} — pada tegangan yang sama, tiap keping kini menyimpan {gap}× muatan',
    pt: 'A distância é d/{gap} — com a mesma tensão, cada placa agora guarda {gap}× a carga',
  },
  'caption.open': {
    ko: '간격을 되돌리자 더 담겼던 전하가 전지로 돌아간다',
    en: 'Opening the gap back up sends the extra charge back to the battery',
    ja: '間隔を元に戻すと、余分な電荷は電池へ戻っていく',
    zh: '把间距拉回原样，多出的电荷流回电池',
    ar: 'إعادة توسيع المسافة تُرجع الشحنة الزائدة إلى البطارية',
    es: 'Al volver a abrir la separación, la carga extra regresa a la batería',
    fr: 'Rouvrir l’écartement renvoie la charge en trop vers la pile',
    hi: 'अंतराल फिर बढ़ाने पर अतिरिक्त आवेश बैटरी में लौट जाता है',
    id: 'Melebarkan jarak kembali membuat muatan tambahan kembali ke baterai',
    pt: 'Abrir de novo a distância devolve a carga extra à bateria',
  },
  'caption.widen': {
    ko: '이번엔 간격은 그대로, 판을 넓히는 동안 전하가 다시 들어온다',
    en: 'Now the gap stays put; as the plates grow, charge flows in again',
    ja: '今度は間隔はそのまま。板が広がるあいだ、電荷が再び流れ込む',
    zh: '这次间距不变；极板变大时，电荷再次流入',
    ar: 'الآن تبقى المسافة ثابتة؛ وبينما يكبر اللوحان، تتدفق الشحنة من جديد',
    es: 'Ahora la separación no cambia; al crecer las placas, la carga vuelve a entrar',
    fr: 'Cette fois l’écartement ne bouge pas ; à mesure que les plaques s’agrandissent, la charge afflue de nouveau',
    hi: 'अब अंतराल वही रहता है; प्लेटें बड़ी होने के साथ आवेश फिर भीतर आता है',
    id: 'Kini jaraknya tetap; saat keping membesar, muatan mengalir masuk lagi',
    pt: 'Agora a distância fica igual; conforme as placas crescem, a carga volta a entrar',
  },
  'caption.wide': {
    ko: '판 넓이가 {area}배여도 판마다 전하가 {area}배 담긴다',
    en: 'With {area}× the plate area, each plate also holds {area}× the charge',
    ja: '板の面積が {area}× なら、どの板にも電荷が {area}× たまる',
    zh: '极板面积为 {area}× 时，每块极板上的电荷也是 {area}×',
    ar: 'مع {area}× مساحة اللوح، يحمل كل لوح أيضًا {area}× الشحنة',
    es: 'Con {area}× el área de placa, cada placa también guarda {area}× la carga',
    fr: 'Avec {area}× la surface des plaques, chaque plaque porte aussi {area}× la charge',
    hi: 'प्लेट का क्षेत्रफल {area}× होने पर हर प्लेट पर आवेश भी {area}× होता है',
    id: 'Dengan luas keping {area}×, tiap keping juga menyimpan {area}× muatan',
    pt: 'Com {area}× a área das placas, cada placa também guarda {area}× a carga',
  },
  'caption.narrow': {
    ko: '판을 줄이면 처음 양으로 돌아간다',
    en: 'Shrinking the plates brings it back to the starting amount',
    ja: '板を小さくすると最初の量に戻る',
    zh: '缩小极板，电荷回到最初的量',
    ar: 'تصغير اللوحين يعيدها إلى الكمية الأولى',
    es: 'Al encoger las placas vuelve a la cantidad inicial',
    fr: 'Réduire les plaques ramène à la quantité de départ',
    hi: 'प्लेटें छोटी करने पर यह शुरुआती मात्रा पर लौट आता है',
    id: 'Memperkecil keping mengembalikannya ke jumlah semula',
    pt: 'Encolher as placas a traz de volta à quantidade inicial',
  },
} satisfies Record<string, LocalizedText>);

export type ParallelPlateCapacitorMessageKey = keyof typeof parallelPlateCapacitorMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: ParallelPlateCapacitorMessageKey): LocalizedText =>
  parallelPlateCapacitorMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ParallelPlateCapacitorMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const parallelPlateCapacitorSchema: BundleSchema = {
  id: PARALLEL_PLATE_CAPACITOR_ID,
  label: text('label.title'),
  category: 'em',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 좁히고, 되돌리고, 넓히는 한 주기로 할 말을 마친다.
  parameters: [],

  stages: [
    {
      id: 'battery-plates',
      label: text('label.stage'),
      constants: {
        voltage: VOLTAGE,
        baseGap: BASE_GAP,
        gapDivisor: GAP_DIVISOR,
        plateLength: PLATE_LENGTH,
        areaMultiple: AREA_MULTIPLE,
        baseMarks: BASE_MARKS,
      },
    },
  ],

  environments: [],

  views: [{ id: 'side', label: text('label.view'), default: true }],

  /** 가로로 넓다 — 전지 · 판 · 넓힌 판이 옆으로 놓인다. 세로는 판 한 쌍과 캡션 줄. */
  canvas: { height: 360, minHeight: 320 },

  /** 겹침은 scene 에 쓴 순서 — 도선 위에 판, 그 위에 전하 표식, 맨 위에 이름표. */
  drawOrder: 'scene',

  /**
   * 한 주기 = 처음 판 → 간격을 좁힘 → 좁힌 판 → 되돌림 → 판을 넓힘 → 넓힌 판 → 되돌림.
   * 끝이 처음과 같은 그림이라 흐려짐 없이 다음 주기로 잇는다. 판이 움직이는 단계는
   * `smooth` 로 선언한다 — 판이 멈춰 있다가 부드럽게 움직이고 부드럽게 선다.
   */
  timeline: {
    phases: [
      { id: 'base', duration: BASE_HOLD, caption: key('caption.base') },
      { id: 'close', duration: CLOSE, ease: 'smooth', caption: key('caption.close') },
      { id: 'near', duration: NEAR_HOLD, caption: key('caption.near') },
      { id: 'open', duration: OPEN, ease: 'smooth', caption: key('caption.open') },
      { id: 'widen', duration: WIDEN, ease: 'smooth', caption: key('caption.widen') },
      { id: 'wide', duration: WIDE_HOLD, caption: key('caption.wide') },
      { id: 'narrow', duration: NARROW, ease: 'smooth', caption: key('caption.narrow') },
    ],
  },

  /** 도착한 순간 처음 판이 놓여 있고, 곧(0.8 초 뒤) 간격이 좁아지기 시작한다. */
  startAt: 1.4,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 식과 정의는 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    style: { colorRole: 'muted', emphasis: 'strong' },
    // 캡션 속 배수는 스테이지 상수의 글자다 — state 가 선언값을 그대로 옮겨 둔다(장부 G133).
    vars: { gap: 'gapDivisor', area: 'areaMultiple' },
  },

  messages: parallelPlateCapacitorMessages,
};
