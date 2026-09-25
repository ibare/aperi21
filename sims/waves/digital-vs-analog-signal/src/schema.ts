// ========================================================================
// digital-vs-analog-signal — 선언
// ========================================================================
// 질문: 먼 길을 가는 신호는 중간중간 잡음이 섞이는데, 왜 디지털 신호는 멀리 보내도
// 보낸 그대로 도착하고 아날로그 신호는 뭉개지는가?
//
// 답: 중계기가 하는 일이 다르다. 아날로그 중계기는 약해진 신호를 **키울 뿐**이라
// 섞인 잡음까지 함께 키워 다음 구간으로 넘기고, 잡음은 구간마다 쌓인다. 디지털
// 중계기는 도착한 신호를 **문턱으로 0 · 1 로 다시 판정**해 깨끗한 두 준위를 새로
// 내보낸다 — 잡음은 그 자리에서 버려진다.
//
// 화면에서는 두 줄이 같은 구간 · 같은 잡음을 지난다. 위 줄의 곡선은 칸을 지날수록
// 거칠어지고, 아래 줄의 계단은 칸마다 원래 모양으로 되살아난다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:digital-vs-analog-signal` 와 문자 그대로 일치한다 (C4). */
export const DIGITAL_VS_ANALOG_SIGNAL_ID = 'digital-vs-analog-signal';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 신호의 세기는 「1 준위」 를 1 로 둔 상대값이다.
// ------------------------------------------------------------------------

/** 잡음 난수의 시드. 같은 시드는 언제나 같은 잡음이다. */
export const SEED = 7;
/**
 * 한 구간에서 섞이는 잡음의 최대 크기(도착한 신호 기준, 1 준위 = 1).
 *
 * 문턱 여유(`ATTENUATION × THRESHOLD` = 0.25)보다 한참 작게 둔다 — 그래서 이 스테이지에서는
 * 디지털 판정이 틀리지 않는다. 판정이 틀리는 한계는 이 조각의 주장이 아니다 (NOTES (b)).
 */
export const NOISE = 0.04;
/** 한 구간을 지나며 남는 신호의 몫. 중계기는 이것의 역수만큼 키운다. */
export const ATTENUATION = 0.5;
/** 디지털 문턱 — 도착한 「1 준위」 의 몇 배 높이에서 0 · 1 을 가르는가. */
export const THRESHOLD = 0.5;
/** 출발과 도착 사이의 중계기 수. 구간 수는 이것보다 하나 많다. */
export const RELAYS = 3;

// ------------------------------------------------------------------------
// 메시지 — 보내는 내용. 스테이지 상수의 기본값이다 (원칙 2).
// ------------------------------------------------------------------------

/**
 * 디지털 줄이 보내는 비트 수. 스테이지 상수는 수 하나씩뿐이라 목록의 길이를 선언할 수
 * 없어 코드에 둔다 (장부 G105). 비트 값은 `bit0` … `bit7` 스테이지 상수다.
 */
export const BIT_COUNT = 8;
/** 디지털 줄이 보내는 비트 값의 기본값. `bit{i}` 스테이지 상수로 흩어 선언한다. */
export const BITS = [0, 1, 1, 0, 1, 0, 0, 1] as const;

/**
 * 아날로그 줄이 보내는 전압 모양 — 가운데 값과 사인 둘의 합. 칸 폭(0~1) 안에서 `cycles`
 * 번 돈다. 0 · 1 준위 사이(0.12 ~ 0.88)에 머물도록 골랐다. 스테이지 상수
 * `analogMean` · `tone{1,2}Amp` · `tone{1,2}Cycles` · `tone{1,2}Phase` 의 기본값이다.
 */
export const ANALOG_MEAN = 0.5;
export const TONE1 = { amp: 0.26, cycles: 1.3, phase: 0.4 } as const;
export const TONE2 = { amp: 0.12, cycles: 3.1, phase: 1.7 } as const;

// ------------------------------------------------------------------------
// 배치 — 월드 좌표. 두 줄은 같은 가로 자리에 칸을 둔다.
// ------------------------------------------------------------------------

/**
 * 칸 전체가 차지하는 가로(월드). 칸 수는 중계기 수를 따라가지만 이 폭 안에 담는다 —
 * 경계가 상수에 따라 움직이지 않도록 (원칙 6).
 */
export const LANE_WIDTH = 9.4;
/** 칸 사이 틈(월드). 이 틈에 선로가 지나간다. */
export const PANEL_GAP = 0.42;
/** 칸 높이(월드). */
export const PANEL_H = 1.3;
/** 칸 안 위아래 여백(월드). 신호 0 · 1 준위가 이 안쪽에 온다. */
export const PANEL_PAD = 0.14;
/** 위 줄(아날로그) · 아래 줄(디지털) 칸의 아랫변 y. */
export const ANALOG_BASE_Y = 0.85;
export const DIGITAL_BASE_Y = -0.9;

/**
 * 프레이밍 — 왼쪽은 줄 이름, 오른쪽은 문턱 이름, 위는 칸 이름, 아래는 캡션 자리.
 * 매 프레임 같은 값이다 (S-piece — 프레이밍은 주장의 일부다).
 */
export const SCENE_BOUNDS = { minX: -1.25, maxX: 10.5, minY: -1.62, maxY: 2.45 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const digitalVsAnalogSignalMessages = Object.freeze({
  'label.title': {
    ko: '디지털 신호와 아날로그',
    en: 'Digital and analog signals',
    ja: 'デジタル信号とアナログ信号',
    zh: '数字信号与模拟信号',
    ar: 'الإشارات الرقمية والتناظرية',
    es: 'Señales digitales y analógicas',
    fr: 'Signaux numériques et analogiques',
    hi: 'डिजिटल और एनालॉग संकेत',
    id: 'Sinyal digital dan analog',
    pt: 'Sinais digitais e analógicos',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '잡음을 견디는 방식의 차이',
    en: 'Two ways of standing up to noise',
    ja: '雑音への二通りの耐え方',
    zh: '抵御噪声的两种方式',
    ar: 'طريقتان لمقاومة الضجيج',
    es: 'Dos maneras de resistir el ruido',
    fr: 'Deux façons de résister au bruit',
    hi: 'शोर का सामना करने के दो तरीके',
    id: 'Dua cara bertahan terhadap derau',
    pt: 'Duas formas de resistir ao ruído',
  },
  'label.stage': {
    ko: '중계기 세 개',
    en: 'Three repeaters',
    ja: '三つの中継器',
    zh: '三个中继器',
    ar: 'ثلاثة مكررات',
    es: 'Tres repetidores',
    fr: 'Trois répéteurs',
    hi: 'तीन रिपीटर',
    id: 'Tiga repeater',
    pt: 'Três repetidores',
  },
  'label.view': {
    ko: '두 줄',
    en: 'Two lanes',
    ja: '二つのレーン',
    zh: '两条通道',
    ar: 'مساران',
    es: 'Dos carriles',
    fr: 'Deux couloirs',
    hi: 'दो लेन',
    id: 'Dua lajur',
    pt: 'Duas faixas',
  },

  /** 줄 이름. 두 줄을 가르는 것은 색이 아니라 이 이름과 모양이다. */
  'label.analog': {
    ko: '아날로그',
    en: 'Analog',
    ja: 'アナログ',
    zh: '模拟',
    ar: 'تناظرية',
    es: 'Analógica',
    fr: 'Analogique',
    hi: 'एनालॉग',
    id: 'Analog',
    pt: 'Analógico',
  },
  'label.digital': {
    ko: '디지털',
    en: 'Digital',
    ja: 'デジタル',
    zh: '数字',
    ar: 'رقمية',
    es: 'Digital',
    fr: 'Numérique',
    hi: 'डिजिटल',
    id: 'Digital',
    pt: 'Digital',
  },
  /** 칸 이름. */
  'label.source': {
    ko: '출발',
    en: 'Sent',
    ja: '送信',
    zh: '发送',
    ar: 'المُرسَل',
    es: 'Enviada',
    fr: 'Envoyé',
    hi: 'भेजा गया',
    id: 'Dikirim',
    pt: 'Enviado',
  },
  'label.relay': {
    ko: '중계 {n}',
    en: 'Repeater {n}',
    ja: '中継器 {n}',
    zh: '中继器 {n}',
    ar: 'المكرر {n}',
    es: 'Repetidor {n}',
    fr: 'Répéteur {n}',
    hi: 'रिपीटर {n}',
    id: 'Repeater {n}',
    pt: 'Repetidor {n}',
  },
  'label.receiver': {
    ko: '도착',
    en: 'Received',
    ja: '受信',
    zh: '接收',
    ar: 'المُستقبَل',
    es: 'Recibida',
    fr: 'Reçu',
    hi: 'प्राप्त',
    id: 'Diterima',
    pt: 'Recebido',
  },
  /** 디지털 칸의 가르는 높이. */
  'label.threshold': {
    ko: '문턱',
    en: 'Threshold',
    ja: 'しきい値',
    zh: '阈值',
    ar: 'العتبة',
    es: 'Umbral',
    fr: 'Seuil',
    hi: 'देहली',
    id: 'Ambang',
    pt: 'Limiar',
  },

  'caption.send': {
    ko: '같은 선로로 두 신호를 보낸다 — 위는 이어진 전압, 아래는 두 준위(0 · 1)만 쓰는 신호다.',
    en: 'Two signals go down the same line — the top one is a continuous voltage, the bottom one uses only two levels (0 and 1).',
    ja: '同じ線路で二つの信号を送る — 上は連続的に変わる電圧、下は二つのレベル(0 と 1)だけを使う信号だ。',
    zh: '两个信号沿同一条线路传送 — 上面是连续变化的电压，下面是只用两个电平（0 和 1）的信号。',
    ar: 'تسير إشارتان على الخط نفسه — العليا جهد يتغير باستمرار، والسفلى لا تستخدم إلا مستويين (0 و1).',
    es: 'Dos señales recorren la misma línea — la de arriba es un voltaje que varía de forma continua; la de abajo usa solo dos niveles (0 y 1).',
    fr: 'Deux signaux parcourent la même ligne — celui du haut est une tension qui varie continûment, celui du bas n’utilise que deux niveaux (0 et 1).',
    hi: 'दो संकेत एक ही लाइन पर भेजे जाते हैं — ऊपर वाला लगातार बदलती वोल्टता है, नीचे वाला केवल दो स्तर (0 और 1) इस्तेमाल करता है।',
    id: 'Dua sinyal dikirim lewat saluran yang sama — yang atas berupa tegangan yang berubah kontinu, yang bawah hanya memakai dua tingkat (0 dan 1).',
    pt: 'Dois sinais seguem pela mesma linha — o de cima é uma tensão que varia continuamente; o de baixo usa só dois níveis (0 e 1).',
  },
  'caption.travel': {
    ko: '구간마다 신호가 약해지고 잡음이 섞인다(옅은 선). 위의 중계기는 그 잡음까지 함께 키우고, 아래의 중계기는 문턱으로 0 · 1 을 다시 판정해 새로 내보낸다.',
    en: 'Along each stretch the signal weakens and picks up noise (faint line). The top repeater amplifies the noise along with it; the bottom one re-decides 0 or 1 at the threshold and sends a fresh copy.',
    ja: '区間ごとに信号は弱まり、雑音が混じる(薄い線)。上の中継器はその雑音まで一緒に増幅し、下の中継器はしきい値で 0 か 1 かを判定し直して新しく送り出す。',
    zh: '每一段中信号都会减弱并混入噪声（浅色线）。上面的中继器连同噪声一起放大；下面的中继器按阈值重新判定 0 或 1，再发出一份全新的信号。',
    ar: 'في كل مقطع تضعف الإشارة ويختلط بها ضجيج (الخط الباهت). المكرر العلوي يضخّم الضجيج معها، أما السفلي فيعيد تحديد 0 أو 1 عند العتبة ويرسل نسخة جديدة.',
    es: 'En cada tramo la señal se debilita y recoge ruido (línea tenue). El repetidor de arriba amplifica también el ruido; el de abajo vuelve a decidir 0 o 1 en el umbral y envía una copia nueva.',
    fr: 'Sur chaque tronçon, le signal s’affaiblit et se charge de bruit (trait pâle). Le répéteur du haut amplifie le bruit avec lui ; celui du bas redécide 0 ou 1 au seuil et renvoie une copie neuve.',
    hi: 'हर खंड में संकेत कमज़ोर होता है और उसमें शोर मिल जाता है (हल्की रेखा)। ऊपर वाला रिपीटर शोर को भी साथ में बढ़ा देता है; नीचे वाला देहली पर फिर से 0 या 1 तय करता है और नई प्रति भेजता है।',
    id: 'Di setiap ruas sinyal melemah dan tercampur derau (garis samar). Repeater atas ikut menguatkan deraunya; repeater bawah menentukan ulang 0 atau 1 di ambang lalu mengirim salinan baru.',
    pt: 'A cada trecho o sinal enfraquece e recolhe ruído (linha clara). O repetidor de cima amplifica o ruído junto; o de baixo decide de novo 0 ou 1 no limiar e envia uma cópia nova.',
  },
  'caption.compare': {
    ko: '도착한 곳에서 위의 곡선은 보낸 모양(점선)에서 벗어나 뭉개졌고, 아래의 계단은 보낸 모양과 그대로 겹친다.',
    en: 'At the far end the top curve has drifted from what was sent (dashed) and blurred; the bottom steps still sit exactly on what was sent.',
    ja: '到着地点で、上の曲線は送った形(点線)からずれてぼやけ、下の階段は送った形にぴったり重なっている。',
    zh: '到达终点时，上面的曲线已偏离发送时的形状（虚线）并变得模糊；下面的阶梯仍与发送时的形状完全重合。',
    ar: 'عند الطرف البعيد انحرف المنحنى العلوي عمّا أُرسل (المتقطع) وتشوّش، بينما لا تزال الدرجات السفلية منطبقة تمامًا على ما أُرسل.',
    es: 'Al final, la curva de arriba se ha apartado de lo enviado (discontinua) y se ha emborronado; los escalones de abajo siguen exactamente sobre lo enviado.',
    fr: 'À l’arrivée, la courbe du haut s’est écartée de ce qui a été envoyé (pointillés) et s’est brouillée ; les marches du bas restent exactement sur ce qui a été envoyé.',
    hi: 'दूसरे छोर पर ऊपर का वक्र भेजे गए आकार (बिंदुकित) से हट गया है और धुँधला हो गया है; नीचे की सीढ़ियाँ अब भी ठीक भेजे गए आकार पर बैठी हैं।',
    id: 'Di ujung penerima, kurva atas telah menyimpang dari yang dikirim (putus-putus) dan kabur; tangga bawah masih tepat berimpit dengan yang dikirim.',
    pt: 'No destino, a curva de cima se afastou do que foi enviado (tracejado) e ficou borrada; os degraus de baixo continuam exatamente sobre o que foi enviado.',
  },
} satisfies Record<string, LocalizedText>);

export type DigitalVsAnalogSignalMessageKey = keyof typeof digitalVsAnalogSignalMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: DigitalVsAnalogSignalMessageKey): LocalizedText => digitalVsAnalogSignalMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: DigitalVsAnalogSignalMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const digitalVsAnalogSignalSchema: BundleSchema = {
  id: DIGITAL_VS_ANALOG_SIGNAL_ID,
  label: text('label.title'),
  category: 'waves',
  description: text('label.description'),
  timeModel: 'periodic',
  parameters: [],
  stages: [
    {
      id: 'three-repeaters',
      label: text('label.stage'),
      constants: {
        seed: SEED,
        noise: NOISE,
        attenuation: ATTENUATION,
        threshold: THRESHOLD,
        relays: RELAYS,
        analogMean: ANALOG_MEAN,
        tone1Amp: TONE1.amp,
        tone1Cycles: TONE1.cycles,
        tone1Phase: TONE1.phase,
        tone2Amp: TONE2.amp,
        tone2Cycles: TONE2.cycles,
        tone2Phase: TONE2.phase,
        bit0: BITS[0],
        bit1: BITS[1],
        bit2: BITS[2],
        bit3: BITS[3],
        bit4: BITS[4],
        bit5: BITS[5],
        bit6: BITS[6],
        bit7: BITS[7],
      },
    },
  ],
  environments: [],
  views: [{ id: 'lanes', label: text('label.view'), default: true }],

  /** 가로로 넓다 — 칸 다섯이 한 줄로 선다. 세로는 두 줄과 캡션이면 된다. */
  canvas: { height: 380, minHeight: 330 },

  /**
   * 쓴 순서대로 겹친다 — 칸 테두리 · 문턱 · 도착한 신호 · 내보낸 신호 · 보낸 모양 점선.
   * 층 순서로는 셋이 다 `trajectory` 라 겹침을 고를 수 없다.
   */
  drawOrder: 'scene',

  /** 도착한 순간 이미 첫 구간을 지나는 중이다 (S-piece). */
  startAt: 2.4,

  /**
   * 한 주기 12 초.
   *
   * - `send` — 출발 칸에 두 신호가 그려진다.
   * - `travel` — 구간을 차례로 지난다. 구간 수가 중계기 수를 따라가므로 단계를 구간마다
   *   나누지 않고 이 단계의 진행도를 구간 수로 가른다 (`span` 과 같은 시차 출발).
   * - `compare` — 도착 칸에 보낸 모양을 점선으로 겹친다.
   * - `fade` — 옅어지며 물러난다.
   */
  timeline: {
    phases: [
      { id: 'send', duration: 1.2, caption: key('caption.send') },
      { id: 'travel', duration: 7.2, ease: 'linear', caption: key('caption.travel') },
      { id: 'compare', duration: 3.0, caption: key('caption.compare') },
      { id: 'fade', duration: 0.6, caption: key('caption.compare') },
    ],
  },

  /** 슬롯 하나. 단계마다 지금 화면에서 벌어지는 일만 말한다. */
  caption: {
    anchor: { screen: 'bottom-left', offset: [18, -4] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 820,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  // 그리드 · 카메라 단추 · 제목 · 범례 없음(기본). 이 그림이 견주는 것은 모양이고,
  // 전압 눈금은 「얼마나 큰가」 를 읽게 만든다 (S-piece).

  messages: digitalVsAnalogSignalMessages,
};
