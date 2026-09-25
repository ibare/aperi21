// ========================================================================
// greenhouse-effect — 선언
// ========================================================================
// 질문: 햇빛은 그대로인데 왜 적외선을 먹는 층이 있으면 지표가 더 따뜻한가.
//
// 왼쪽은 지표와 하늘의 단면이다. 햇빛(짧은 물결)이 내려와 지표에 닿고, 지표는 적외선(긴 물결)을
// 위로 낸다. 층이 없으면 적외선은 그대로 빠져나가고 지표는 255 K 에 서 있다. 적외선을 먹는
// 층(ε = 0.78)을 넣으면 짧은 물결은 층을 그대로 지나지만 긴 물결은 층에 먹히고, 층이 위아래로
// 다시 낸다. 아래로 돌아온 몫이 지표의 들어옴에 얹혀 지표가 데워지고, 나감이 다시 들어옴과 같아지는
// 288 K 에서 새로 선다.
//
// 가운데 막대 짝과 맞춤선은 `radiative-equilibrium` 의 평형 막대 표현을 이어받는다. 들어옴 막대는
// 햇빛 몫(민 면)과 층에서 돌아온 몫(빗금)을 쌓는다. 오른쪽 판은 지표 온도의 시간 곡선이다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:greenhouse-effect` 와 문자 그대로 일치한다 (C4). */
export const GREENHOUSE_EFFECT_ID = 'greenhouse-effect';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 태양 상수 S (W/m²). */
export const SOLAR_CONSTANT = 1361;
/** 반사율 a. 들어옴 막대는 이미 반사를 뺀 흡수량이다. */
export const ALBEDO = 0.3;
/** σ (W/m²K⁴). */
export const SIGMA = 5.67e-8;
/** 층의 적외선 흡수율 ε. 먹은 만큼 위아래로 반씩 다시 낸다. 햇빛(가시광)은 먹지 않는다. */
export const EMISSIVITY = 0.78;
/** 지표 1 m² 의 열용량 (J/m²K). 50 m 바다 겉층쯤이다. */
export const HEAT_CAPACITY = 2.1e8;
/**
 * 시간 배율 — 화면 1 초가 지표의 몇 초인가. 약 1 년 3 개월이다. 해를 넘겨 다가가는 일을 몇 초에
 * 보이려는 표시 배율이고 화면에 알리지 않는다 (NOTES (b)).
 */
export const TIME_SCALE = 4e7;
/**
 * 층이 없을 때의 지표 온도 글자 **정박값**(K). 곡선 · 눈금 자리는 physics 가 (S(1−a)/4σ)^¼ ≈ 254.6 K 로
 * 계산하고 글자는 이 선언값을 쓴다 (S-piece 유효숫자, G143).
 */
export const T_START = 255;
/** 층을 넣은 뒤 새로 서는 지표 온도 글자의 정박값(K). 계산 자리는 T_START 자리 × (2/(2−ε))^¼ ≈ 288.1 K. */
export const T_EQ = 288;
/** 온도 판 세로축 끝(K). */
export const AXIS_MIN = 245;
export const AXIS_MAX = 295;
/**
 * 표시 배율 — 1 W/m² 가 막대 몇 월드 높이인가. 들어옴 · 나감이 같은 배율을 쓴다. 가장 긴 막대(새 평형의
 * 들어옴 ≈ 390 W/m²)가 하늘 꼭대기 아래에 들어가게 잡는다.
 */
export const BAR_SCALE = 0.0082;
/**
 * 물결 — 표시 배율이다. 실제 파장(햇빛 ≈ 0.5 μm, 적외선 ≈ 10 μm)은 이 그림에서 보일 수 없다.
 * 짧은 · 긴 간격의 **차이**만 옮긴다. 간격 · 흔들림 폭(월드), 흐르는 빠르기(월드/초).
 */
export const SUN_WAVE_LENGTH = 0.16;
export const IR_WAVE_LENGTH = 0.55;
export const WAVE_AMP = 0.09;
export const RIPPLE_SPEED = 0.7;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 단면 · 막대 · 온도 판을 가로로 나란히 둔다 (세로가 비싸다).
// ------------------------------------------------------------------------

/** 단면의 가로 끝. */
export const SECTION_X0 = -6.3;
export const SECTION_X1 = -0.9;
/** 지표 띠의 윗면 · 아랫면. 윗면이 막대 바닥 · 온도 판 바닥과 같은 높이다. */
export const GROUND_TOP = -1.2;
export const GROUND_BOTTOM = -1.62;
/** 층 띠의 아래 · 위 높이. */
export const LAYER_Y0 = 0.72;
export const LAYER_Y1 = 1.12;
/** 물결이 들어오고 나가는 하늘 끝. */
export const SKY_TOP = 2.3;
/**
 * 물결 줄기 두 묶음의 x. 묶음마다 햇빛(내려옴) · 적외선(지표에서 올라감) · 층이 다시 낸 것(위아래) 순서.
 * 두 묶음 사이를 비워 층 이름표 · 지표 이름표를 둔다.
 */
export const SUN_XS: readonly number[] = [-6.0, -2.7];
export const UP_XS: readonly number[] = [-5.5, -2.2];
export const RE_XS: readonly number[] = [-5.0, -1.7];
/** 막대 짝 — 들어옴 · 나감의 가운데 x 와 폭. 바닥은 지표 윗면. */
export const IN_X = 0.3;
export const OUT_X = 1.0;
export const BAR_W = 0.5;
/** 온도 판의 가로 · 세로 끝. 바닥은 지표 윗면과 같다. */
export const GRAPH_X0 = 2.7;
export const GRAPH_X1 = 6.2;
export const GRAPH_Y0 = GROUND_TOP;
export const GRAPH_Y1 = 2.1;

/**
 * 프레이밍은 주장의 일부다. 가로는 단면 왼끝부터 온도 판 오른끝 288 K 글자까지, 세로는 캡션 줄부터
 * 하늘 위 이름표까지. 매 프레임 같은 값이다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: -6.5, maxX: 7.2, minY: -2.25, maxY: 2.65 } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이(초)
// ------------------------------------------------------------------------

/** 막대가 서는 동안 · 층 없이 서 있는 그림을 읽는 동안. */
export const APPEAR = 1.2;
export const BARE = 1.6;
/** 층이 들어오는 동안. 되돌아오는 물결과 들어옴 막대의 빗금 몫이 함께 자란다. */
export const LAYER = 1.4;
/** 지표가 데워지는 동안. 곡선이 오른다. */
export const WARM = 6;
/** 새 온도 점선 · 글자가 떠오르는 동안 · 다 선 그림을 읽는 동안 · 흐려지는 동안. */
export const MEET = 0.6;
export const HOLD = 3.2;
export const FADE = 0.8;
/** 도착한 순간 물결이 흐르고 막대가 서 있다 — 층이 들어오기 0.8 초 전에서 연다. */
export const START_AT = 2.0;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const greenhouseEffectMessages = Object.freeze({
  'label.title': {
    ko: '온실 효과',
    en: 'Greenhouse effect',
    ja: '温室効果',
    zh: '温室效应',
    ar: 'أثر الدفيئة',
    es: 'Efecto invernadero',
    fr: 'Effet de serre',
    hi: 'ग्रीनहाउस प्रभाव',
    id: 'Efek rumah kaca',
    pt: 'Efeito estufa',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '적외선을 되돌리는 층이 지표를 덥히는 것',
    en: 'A layer that sends infrared back down warms the ground',
    ja: '赤外線を下へ送り返す層が地表を温める',
    zh: '把红外线送回下方的层使地面变暖',
    ar: 'طبقة تعيد الأشعة تحت الحمراء إلى الأسفل فتدفّئ سطح الأرض',
    es: 'Una capa que devuelve el infrarrojo hacia abajo calienta el suelo',
    fr: 'Une couche qui renvoie l’infrarouge vers le bas réchauffe le sol',
    hi: 'अवरक्त को नीचे लौटाने वाली परत ज़मीन को गर्म करती है',
    id: 'Lapisan yang mengirim inframerah kembali ke bawah menghangatkan tanah',
    pt: 'Uma camada que devolve o infravermelho para baixo aquece o solo',
  },
  'label.stage': {
    ko: '한 층 대기',
    en: 'One-layer atmosphere',
    ja: '一層の大気',
    zh: '单层大气',
    ar: 'غلاف جوي من طبقة واحدة',
    es: 'Atmósfera de una capa',
    fr: 'Atmosphère à une couche',
    hi: 'एक-परत वायुमंडल',
    id: 'Atmosfer satu lapisan',
    pt: 'Atmosfera de uma camada',
  },
  'label.view': {
    ko: '단면 · 막대 · 온도 곡선',
    en: 'Cross-section, bars and temperature curve',
    ja: '断面・棒・温度曲線',
    zh: '截面、柱条与温度曲线',
    ar: 'مقطع عرضي وأعمدة ومنحنى درجة الحرارة',
    es: 'Sección, barras y curva de temperatura',
    fr: 'Coupe, barres et courbe de température',
    hi: 'अनुप्रस्थ काट, पट्टियाँ और ताप वक्र',
    id: 'Penampang, batang, dan kurva suhu',
    pt: 'Corte transversal, barras e curva de temperatura',
  },
  /** 온도 — 값과 단위. 값이 끼는 조립문이라 문안이다 (C1 판정 4). */
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
  /** 단면 이름표. */
  'label.sun': {
    ko: '햇빛',
    en: 'sunlight',
    ja: '日光',
    zh: '阳光',
    ar: 'ضوء الشمس',
    es: 'luz solar',
    fr: 'lumière du Soleil',
    hi: 'सूर्य का प्रकाश',
    id: 'sinar Matahari',
    pt: 'luz solar',
  },
  'label.infrared': {
    ko: '적외선',
    en: 'infrared',
    ja: '赤外線',
    zh: '红外线',
    ar: 'الأشعة تحت الحمراء',
    es: 'infrarrojo',
    fr: 'infrarouge',
    hi: 'अवरक्त',
    id: 'inframerah',
    pt: 'infravermelho',
  },
  'label.layer': {
    ko: '적외선을 먹는 층',
    en: 'infrared-absorbing layer',
    ja: '赤外線を吸収する層',
    zh: '吸收红外线的层',
    ar: 'طبقة ماصّة للأشعة تحت الحمراء',
    es: 'capa que absorbe infrarrojo',
    fr: 'couche absorbant l’infrarouge',
    hi: 'अवरक्त-अवशोषी परत',
    id: 'lapisan penyerap inframerah',
    pt: 'camada que absorve infravermelho',
  },
  'label.ground': {
    ko: '지표',
    en: 'ground',
    ja: '地表',
    zh: '地面',
    ar: 'سطح الأرض',
    es: 'suelo',
    fr: 'sol',
    hi: 'ज़मीन',
    id: 'tanah',
    pt: 'solo',
  },
  /** 막대 이름표. 제 막대 밑, 바닥선 아래에 붙는다. */
  'label.tagIn': {
    ko: '들어옴',
    en: 'in',
    ja: '入る',
    zh: '流入',
    ar: 'الداخل',
    es: 'entrada',
    fr: 'entrant',
    hi: 'अंदर',
    id: 'masuk',
    pt: 'entrada',
  },
  'label.tagOut': {
    ko: '나감',
    en: 'out',
    ja: '出る',
    zh: '流出',
    ar: 'الخارج',
    es: 'salida',
    fr: 'sortant',
    hi: 'बाहर',
    id: 'keluar',
    pt: 'saída',
  },
  /** 온도 판 시간축에서 층이 들어온 자리. */
  'label.layerMark': {
    ko: '층 넣음',
    en: 'layer in',
    ja: '層を入れる',
    zh: '加入层',
    ar: 'إدخال الطبقة',
    es: 'capa puesta',
    fr: 'couche ajoutée',
    hi: 'परत डाली',
    id: 'lapisan masuk',
    pt: 'camada inserida',
  },
  /** 온도 판 축 기호. */
  'label.axisTemp': {
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
  'label.axisTime': {
    ko: 't',
    en: 't',
    ja: 't',
    zh: 't',
    ar: 't',
    es: 't',
    fr: 't',
    hi: 't',
    id: 't',
    pt: 't',
  },
  'caption.bare': {
    ko: '층이 없다 — 지표의 나감 막대가 들어옴 막대와 같은 높이에 서 있고, 지표는 {tStart} K 에 머문다',
    en: 'No layer — the ground’s out bar stands level with its in bar, and the ground stays at {tStart} K',
    ja: '層がない — 地表の出る棒は入る棒と同じ高さに立ち、地表は {tStart} K にとどまる',
    zh: '没有层 — 地面的流出柱与流入柱一样高，地面停在 {tStart} K',
    ar: 'لا توجد طبقة — عمود الخارج من سطح الأرض بارتفاع عمود الداخل نفسه، ويبقى سطح الأرض عند {tStart} K',
    es: 'Sin capa — la barra de salida del suelo está a la altura de su barra de entrada, y el suelo se queda en {tStart} K',
    fr: 'Pas de couche — la barre sortante du sol est au niveau de sa barre entrante, et le sol reste à {tStart} K',
    hi: 'कोई परत नहीं — ज़मीन की बाहर की पट्टी अंदर की पट्टी जितनी ऊँची है, और ज़मीन {tStart} K पर टिकी रहती है',
    id: 'Tanpa lapisan — batang keluar dari tanah sama tinggi dengan batang masuknya, dan tanah tetap pada {tStart} K',
    pt: 'Sem camada — a barra de saída do solo está na mesma altura da barra de entrada, e o solo fica em {tStart} K',
  },
  'caption.layer': {
    ko: '적외선을 먹는 층을 넣는다 — 짧은 물결은 층을 그대로 지나고, 긴 물결은 층에 먹혀 위아래로 다시 나온다',
    en: 'Add a layer that absorbs infrared — the short waves pass straight through; the long waves are taken in and sent out again, up and down',
    ja: '赤外線を吸収する層を入れる — 短い波は層をそのまま通り抜け、長い波は層に吸収されて上下に再び放たれる',
    zh: '加入吸收红外线的层 — 短波直接穿过层；长波被层吸收，再向上下重新发出',
    ar: 'أضف طبقة تمتص الأشعة تحت الحمراء — تعبرها الموجات القصيرة مباشرةً، أما الموجات الطويلة فتُمتص ثم تُبعث من جديد إلى أعلى وإلى أسفل',
    es: 'Añade una capa que absorbe infrarrojo — las ondas cortas la atraviesan sin más; las largas son absorbidas y reemitidas, hacia arriba y hacia abajo',
    fr: 'Ajoutez une couche qui absorbe l’infrarouge — les ondes courtes la traversent directement ; les ondes longues sont absorbées puis réémises, vers le haut et vers le bas',
    hi: 'अवरक्त को अवशोषित करने वाली परत जोड़ो — छोटी तरंगें परत से सीधे निकल जाती हैं; लंबी तरंगें सोख ली जाती हैं और फिर ऊपर-नीचे दोबारा निकलती हैं',
    id: 'Tambahkan lapisan yang menyerap inframerah — gelombang pendek menembus langsung; gelombang panjang diserap lalu dipancarkan lagi, ke atas dan ke bawah',
    pt: 'Adicione uma camada que absorve infravermelho — as ondas curtas passam direto; as longas são absorvidas e emitidas de novo, para cima e para baixo',
  },
  'caption.warm': {
    ko: '아래로 돌아온 적외선이 들어옴 막대 위에 얹혔다 — 지표가 데워지며 나감 막대가 따라 오른다',
    en: 'The infrared sent back down now sits on top of the in bar — the ground warms and its out bar climbs after it',
    ja: '下へ送り返された赤外線が、入る棒の上に積まれた — 地表が温まり、出る棒があとを追って伸びる',
    zh: '送回下方的红外线叠在了流入柱上 — 地面变暖，流出柱随之升高',
    ar: 'الأشعة تحت الحمراء المُعادة إلى الأسفل تستقر الآن فوق عمود الداخل — يدفأ سطح الأرض ويرتفع عمود الخارج في إثره',
    es: 'El infrarrojo devuelto hacia abajo ahora se apila sobre la barra de entrada — el suelo se calienta y su barra de salida sube tras ella',
    fr: 'L’infrarouge renvoyé vers le bas s’empile désormais sur la barre entrante — le sol se réchauffe et sa barre sortante monte à sa suite',
    hi: 'नीचे लौटा अवरक्त अब अंदर की पट्टी के ऊपर चढ़ गया है — ज़मीन गर्म होती है और उसकी बाहर की पट्टी पीछे-पीछे ऊपर उठती है',
    id: 'Inframerah yang dikirim kembali ke bawah kini bertumpuk di atas batang masuk — tanah menghangat dan batang keluarnya ikut naik',
    pt: 'O infravermelho devolvido para baixo agora se empilha sobre a barra de entrada — o solo esquenta e sua barra de saída sobe atrás',
  },
  'caption.meet': {
    ko: '같은 햇빛인데 지표가 {tEq} K 에서 다시 섰다 — 나감 막대가 높아진 들어옴 막대와 같은 높이다',
    en: 'Same sunlight, yet the ground has settled again at {tEq} K — its out bar is level with the taller in bar',
    ja: '同じ日光なのに、地表は {tEq} K で再び落ち着いた — 出る棒が、高くなった入る棒と同じ高さだ',
    zh: '阳光相同，地面却在 {tEq} K 重新稳定下来 — 流出柱与变高的流入柱一样高',
    ar: 'ضوء الشمس نفسه، ومع ذلك استقر سطح الأرض من جديد عند {tEq} K — عمود الخارج بارتفاع عمود الداخل الأطول',
    es: 'La misma luz solar, y aun así el suelo se ha asentado de nuevo en {tEq} K — su barra de salida está a la altura de la barra de entrada, ahora más alta',
    fr: 'Même lumière du Soleil, et pourtant le sol s’est de nouveau stabilisé à {tEq} K — sa barre sortante est au niveau de la barre entrante, plus haute',
    hi: 'वही सूर्य का प्रकाश, फिर भी ज़मीन {tEq} K पर फिर से स्थिर हो गई — उसकी बाहर की पट्टी ऊँची हुई अंदर की पट्टी के बराबर है',
    id: 'Sinar Matahari yang sama, tetapi tanah kembali mantap pada {tEq} K — batang keluarnya sama tinggi dengan batang masuk yang kini lebih tinggi',
    pt: 'A mesma luz solar, e ainda assim o solo se estabilizou de novo em {tEq} K — sua barra de saída está na altura da barra de entrada, agora mais alta',
  },
} satisfies Record<string, LocalizedText>);

export type GreenhouseEffectMessageKey = keyof typeof greenhouseEffectMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: GreenhouseEffectMessageKey): LocalizedText => greenhouseEffectMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: GreenhouseEffectMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const greenhouseEffectSchema: BundleSchema = {
  id: GREENHOUSE_EFFECT_ID,
  label: text('label.title'),
  category: 'thermal',
  description: text('label.description'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 층이 들어오고 지표가 데워져 새 온도에 서고, 다시 처음으로.
  parameters: [],

  stages: [
    {
      id: 'one-layer',
      label: text('label.stage'),
      constants: {
        solarConstant: SOLAR_CONSTANT,
        albedo: ALBEDO,
        sigma: SIGMA,
        emissivity: EMISSIVITY,
        heatCapacity: HEAT_CAPACITY,
        timeScale: TIME_SCALE,
        tStart: T_START,
        tEq: T_EQ,
        axisMin: AXIS_MIN,
        axisMax: AXIS_MAX,
        barScale: BAR_SCALE,
        sunWaveLength: SUN_WAVE_LENGTH,
        irWaveLength: IR_WAVE_LENGTH,
        waveAmp: WAVE_AMP,
        rippleSpeed: RIPPLE_SPEED,
      },
    },
  ],

  environments: [],

  views: [{ id: 'section-bars-curve', label: text('label.view'), default: true }],

  canvas: { height: 380, minHeight: 340 },

  /**
   * 한 주기 = 막대가 선다 → 층 없이 서 있다 → 층이 들어온다 → 지표가 데워진다(곡선이 오른다) →
   * 새 온도가 떠오른다 → 다 선 그림을 읽는다 → 흐려진다. 데워지는 단계는 이징 없이 흐른다 — 다가가는
   * 빠르기는 물리가 곡선으로 보인다.
   */
  timeline: {
    phases: [
      { id: 'appear', duration: APPEAR, ease: 'smooth', caption: key('caption.bare') },
      { id: 'bare', duration: BARE, caption: key('caption.bare') },
      { id: 'layer', duration: LAYER, ease: 'smooth', caption: key('caption.layer') },
      { id: 'warm', duration: WARM, caption: key('caption.warm') },
      { id: 'meet', duration: MEET, caption: key('caption.meet') },
      { id: 'hold', duration: HOLD, caption: key('caption.meet') },
      { id: 'fade', duration: FADE, caption: key('caption.meet') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — 물결이 흐르고 막대가 선 뒤, 층이 들어오기 조금 전에 연다. */
  startAt: START_AT,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 식 · 법칙 진술은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 780,
    fade: 0.3,
    style: { colorRole: 'muted', emphasis: 'strong' },
    vars: {
      tStart: 'tStartText',
      tEq: 'tEqText',
    },
  },

  /** 그리드 · 카메라 단추 없음(기본값). 잴 것은 거리가 아니라 막대 높이의 맞음과 곡선이 서는 자리다. */

  messages: greenhouseEffectMessages,
};
