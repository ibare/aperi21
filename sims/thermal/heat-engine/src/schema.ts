// ========================================================================
// heat-engine — 선언
// ========================================================================
// 질문: 열기관은 받은 열을 전부 일로 바꾸는가.
//
// 왼쪽 뜨거운 열원에서 나온 열 줄기(굵기 = 받은 열)가 가운데 기관을 지나며 두 갈래로
// 갈린다 — 위로 꺾여 나가는 가는 갈래가 일, 오른쪽으로 계속 가는 굵은 갈래가 찬 열원에
// 버려지는 열이다. 열은 알갱이로 흐르고, 기관 바퀴가 한 바퀴 돌 때마다 일 더미와 찬 쪽
// 더미에 한 줄씩 쌓인다. 그다음 찬 열원을 떼어 내면 기관은 더 돌지 않는다.
// 동사: (열 줄기가) 갈라진다 — 일부만 일이 되고 나머지는 버려진다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:heat-engine` 와 문자 그대로 일치한다 (C4). */
export const HEAT_ENGINE_ID = 'heat-engine';

// ------------------------------------------------------------------------
// 물리 · 표시 배율 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 한 바퀴에 뜨거운 열원에서 받는 열(임의 단위). */
export const Q_HOT = 100;
/** 한 바퀴에 기관이 내놓는 일. */
export const WORK = 30;
/** 한 바퀴에 찬 열원으로 버리는 열. `Q_HOT − WORK` 와 같게 선언한다. */
export const Q_COLD = 70;
/** 알갱이 하나가 나르는 열. 한 바퀴 알갱이 수 = 받은 열 / 이 값. */
export const GRAIN = 10;
/** 띠 굵기 배율 — 열 한 단위가 띠 굵기 몇 월드 단위인가. */
export const BAND_SCALE = 0.01;
/** 알갱이가 차례로 떠나는 간격(초). 알갱이마다 다른 출발 시각이라 단계로 풀 수 없다. */
export const GRAIN_LEAD = 0.18;
/** 알갱이 하나가 열원을 떠나 더미에 닿기까지 걸리는 시간(초). */
export const GRAIN_TRAVEL = 2;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 가로로 뜨거운 열원 → 기관 → 찬 열원, 일 더미는 기관 위.
// ------------------------------------------------------------------------

export const LAYOUT = {
  /** 뜨거운 열원 상자. */
  hot: { minX: -5.5, maxX: -4.0, minY: -1.1, maxY: 1.1 },
  /** 찬 열원 상자. */
  cold: { minX: 4.0, maxX: 5.5, minY: -1.1, maxY: 1.1 },
  /** 기관 상자의 반변. 중심은 원점이다. */
  engineHalf: 0.75,
  /** 기관 속 바퀴의 반지름. */
  rotorRadius: 0.42,
  /** 일 더미 상자. 기관 위에 놓인다. */
  workBin: { minX: -0.75, maxX: 0.75, minY: 1.3, maxY: 2.05 },
  /** 더미 칸 간격 — 한 줄에서 옆 칸 · 위 줄까지의 거리. */
  pileStep: 0.19,
  /** 더미 첫 줄이 상자 바닥에서 떨어진 거리. */
  pileInset: 0.14,
  /** 찬 열원을 떼어 낼 때 오른쪽으로 밀려나는 거리. */
  detachShift: 0.9,
  /** 이름표가 상자 위 · 띠 위아래에서 떨어진 거리. */
  labelGap: 0.24,
} as const;

/** 한 바퀴를 이루는 시간표 단계 — 바퀴마다 한 단계다. scene 이 이 id 로 단계 시각을 묻는다. */
export const TURN_PHASES = ['turn-1', 'turn-2', 'turn-3'] as const;

/**
 * 프레이밍. 가로는 두 열원 상자 바깥까지(찬 열원이 밀려나는 몫은 옅어지며 잘려도 된다),
 * 세로는 일 더미 위 이름표부터 기관 이름표 · 캡션 줄까지. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -5.75, maxX: 5.75, minY: -1.95, maxY: 2.3 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const heatEngineMessages = Object.freeze({
  'label.title': {
    ko: '열기관',
    en: 'Heat engine',
    ja: '熱機関',
    zh: '热机',
    ar: 'المحرك الحراري',
    es: 'Máquina térmica',
    fr: 'Moteur thermique',
    hi: 'ऊष्मा इंजन',
    id: 'Mesin kalor',
    pt: 'Máquina térmica',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '열을 일로 바꾸는 순환',
    en: 'A cycle that turns heat into work',
    ja: '熱を仕事に変えるサイクル',
    zh: '把热转化为功的循环',
    ar: 'دورة تحوّل الحرارة إلى شغل',
    es: 'Un ciclo que convierte calor en trabajo',
    fr: 'Un cycle qui transforme la chaleur en travail',
    hi: 'ऊष्मा को कार्य में बदलने वाला चक्र',
    id: 'Siklus yang mengubah kalor menjadi usaha',
    pt: 'Um ciclo que transforma calor em trabalho',
  },
  'label.stage': {
    ko: '두 열원 사이의 기관',
    en: 'Engine between two reservoirs',
    ja: '二つの熱源のあいだの熱機関',
    zh: '两个热源之间的热机',
    ar: 'محرك بين مستودعين حراريين',
    es: 'Máquina entre dos focos térmicos',
    fr: 'Moteur entre deux sources de chaleur',
    hi: 'दो ऊष्मा भंडारों के बीच इंजन',
    id: 'Mesin di antara dua reservoir',
    pt: 'Máquina entre dois reservatórios térmicos',
  },
  'label.view': {
    ko: '열의 흐름',
    en: 'Heat flow',
    ja: '熱の流れ',
    zh: '热流',
    ar: 'تدفق الحرارة',
    es: 'Flujo de calor',
    fr: 'Flux de chaleur',
    hi: 'ऊष्मा प्रवाह',
    id: 'Aliran kalor',
    pt: 'Fluxo de calor',
  },

  'label.hot': {
    ko: '뜨거운 열원',
    en: 'Hot reservoir',
    ja: '高温熱源',
    zh: '高温热源',
    ar: 'المستودع الساخن',
    es: 'Foco caliente',
    fr: 'Source chaude',
    hi: 'गर्म भंडार',
    id: 'Reservoir panas',
    pt: 'Reservatório quente',
  },
  'label.cold': {
    ko: '찬 열원',
    en: 'Cold reservoir',
    ja: '低温熱源',
    zh: '低温热源',
    ar: 'المستودع البارد',
    es: 'Foco frío',
    fr: 'Source froide',
    hi: 'ठंडा भंडार',
    id: 'Reservoir dingin',
    pt: 'Reservatório frio',
  },
  'label.engine': {
    ko: '기관',
    en: 'Engine',
    ja: '機関',
    zh: '热机',
    ar: 'المحرك',
    es: 'Máquina',
    fr: 'Moteur',
    hi: 'इंजन',
    id: 'Mesin',
    pt: 'Máquina',
  },
  'label.work': {
    ko: '일',
    en: 'Work',
    ja: '仕事',
    zh: '功',
    ar: 'الشغل',
    es: 'Trabajo',
    fr: 'Travail',
    hi: 'कार्य',
    id: 'Usaha',
    pt: 'Trabalho',
  },
  /** 띠 옆 표식과 선언값. 기호는 표식, 값이 끼므로 문안 키로 둔다 (C1). */
  'label.qHot': {
    ko: 'Q₁ {q}',
    en: 'Q₁ {q}',
    ja: 'Q₁ {q}',
    zh: 'Q₁ {q}',
    ar: 'Q₁ {q}',
    es: 'Q₁ {q}',
    fr: 'Q₁ {q}',
    hi: 'Q₁ {q}',
    id: 'Q₁ {q}',
    pt: 'Q₁ {q}',
  },
  'label.workAmount': {
    ko: 'W {q}',
    en: 'W {q}',
    ja: 'W {q}',
    zh: 'W {q}',
    ar: 'W {q}',
    es: 'W {q}',
    fr: 'W {q}',
    hi: 'W {q}',
    id: 'W {q}',
    pt: 'W {q}',
  },
  'label.qCold': {
    ko: 'Q₂ {q}',
    en: 'Q₂ {q}',
    ja: 'Q₂ {q}',
    zh: 'Q₂ {q}',
    ar: 'Q₂ {q}',
    es: 'Q₂ {q}',
    fr: 'Q₂ {q}',
    hi: 'Q₂ {q}',
    id: 'Q₂ {q}',
    pt: 'Q₂ {q}',
  },

  'caption.turn1': {
    ko: '뜨거운 열원에서 나온 열 {qh} 이 기관을 지나며 두 갈래로 갈린다',
    en: 'Heat {qh} leaves the hot reservoir and splits in two as it passes through the engine',
    ja: '高温熱源から出た熱 {qh} が、機関を通りながら二つに分かれる',
    zh: '热量 {qh} 离开高温热源，经过热机时分成两路',
    ar: 'تخرج الحرارة {qh} من المستودع الساخن وتنقسم إلى قسمين وهي تمر عبر المحرك',
    es: 'El calor {qh} sale del foco caliente y se divide en dos al pasar por la máquina',
    fr: 'La chaleur {qh} quitte la source chaude et se sépare en deux en traversant le moteur',
    hi: 'ऊष्मा {qh} गर्म भंडार से निकलती है और इंजन से गुज़रते हुए दो भागों में बँट जाती है',
    id: 'Kalor {qh} keluar dari reservoir panas dan terbelah dua saat melewati mesin',
    pt: 'O calor {qh} sai do reservatório quente e se divide em dois ao passar pela máquina',
  },
  'caption.turn2': {
    ko: '위로 꺾여 일이 되는 것은 {w} — 나머지 {qc} 는 찬 열원으로 흘러간다',
    en: 'Only {w} turns upward as work — the other {qc} flows on to the cold reservoir',
    ja: '上へ曲がって仕事になるのは {w} だけ — 残りの {qc} は低温熱源へ流れていく',
    zh: '只有 {w} 向上转弯成为功 — 其余的 {qc} 流向低温热源',
    ar: 'لا ينعطف إلى أعلى شغلًا إلا {w} — ويواصل الباقي {qc} طريقه إلى المستودع البارد',
    es: 'Solo {w} gira hacia arriba como trabajo — el resto, {qc}, sigue hasta el foco frío',
    fr: 'Seul {w} bifurque vers le haut en travail — le reste, {qc}, continue vers la source froide',
    hi: 'केवल {w} ऊपर मुड़कर कार्य बनता है — बाकी {qc} ठंडे भंडार की ओर बह जाता है',
    id: 'Hanya {w} berbelok ke atas menjadi usaha — sisanya, {qc}, terus mengalir ke reservoir dingin',
    pt: 'Só {w} vira para cima como trabalho — o restante, {qc}, segue para o reservatório frio',
  },
  'caption.turn3': {
    ko: '바퀴가 한 번 돌 때마다 일 더미와 찬 쪽 더미에 한 줄씩 쌓인다',
    en: 'Every turn of the wheel adds one row to the work pile and one to the cold side',
    ja: '車輪が一回転するたびに、仕事の山と低温側の山に一列ずつ積もる',
    zh: '轮子每转一圈，功的堆和低温一侧的堆各添一行',
    ar: 'كل دورة للعجلة تضيف صفًّا إلى كومة الشغل وصفًّا إلى الجهة الباردة',
    es: 'Cada vuelta de la rueda añade una fila a la pila de trabajo y otra al lado frío',
    fr: 'Chaque tour de roue ajoute une rangée à la pile du travail et une du côté froid',
    hi: 'पहिए के हर चक्कर में कार्य के ढेर में एक पंक्ति और ठंडी ओर एक पंक्ति जुड़ती है',
    id: 'Setiap putaran roda menambah satu baris pada tumpukan usaha dan satu pada sisi dingin',
    pt: 'Cada volta da roda acrescenta uma fileira à pilha de trabalho e outra ao lado frio',
  },
  'caption.hold': {
    ko: '일 더미에는 줄마다 {w}, 찬 쪽 더미에는 줄마다 {qc} 가 쌓였다 — 들어온 줄기는 줄마다 {qh}',
    en: 'Each row of the work pile holds {w} and each row on the cold side holds {qc} — each row came from {qh} taken in',
    ja: '仕事の山は一列ごとに {w}、低温側の山は一列ごとに {qc} — どの列も取り込んだ {qh} から来た',
    zh: '功的堆每行是 {w}，低温一侧每行是 {qc} — 每一行都来自吸收的 {qh}',
    ar: 'كل صف في كومة الشغل يحمل {w} وكل صف في الجهة الباردة يحمل {qc} — وكل صف جاء من {qh} مأخوذة',
    es: 'Cada fila de la pila de trabajo contiene {w} y cada fila del lado frío contiene {qc} — cada fila salió de {qh} absorbido',
    fr: 'Chaque rangée de la pile du travail contient {w} et chaque rangée du côté froid {qc} — chaque rangée vient de {qh} reçu',
    hi: 'कार्य के ढेर की हर पंक्ति में {w} और ठंडी ओर की हर पंक्ति में {qc} है — हर पंक्ति ली गई {qh} से आई',
    id: 'Setiap baris tumpukan usaha berisi {w} dan setiap baris di sisi dingin berisi {qc} — setiap baris berasal dari {qh} yang diambil',
    pt: 'Cada fileira da pilha de trabalho tem {w} e cada fileira do lado frio tem {qc} — cada fileira veio de {qh} absorvido',
  },
  'caption.detach': {
    ko: '이번에는 찬 열원을 떼어 낸다',
    en: 'Now take the cold reservoir away',
    ja: '今度は低温熱源を取り外す',
    zh: '这次把低温热源拿走',
    ar: 'الآن أزِل المستودع البارد',
    es: 'Ahora quita el foco frío',
    fr: 'Retirez maintenant la source froide',
    hi: 'अब ठंडे भंडार को हटा दो',
    id: 'Sekarang lepaskan reservoir dingin',
    pt: 'Agora retire o reservatório frio',
  },
  'caption.stall': {
    ko: '찬 열원이 빠진 자리가 비었다 — 바퀴는 서 있고 뜨거운 열원에서 나오는 알갱이가 없다',
    en: 'The cold reservoir’s place is empty — the wheel stands still and no grains leave the hot reservoir',
    ja: '低温熱源のあった場所が空になった — 車輪は止まり、高温熱源から出ていく粒はない',
    zh: '低温热源的位置空了 — 轮子停住，高温热源不再有颗粒流出',
    ar: 'مكان المستودع البارد فارغ — العجلة متوقفة ولا تخرج حبيبات من المستودع الساخن',
    es: 'El lugar del foco frío está vacío — la rueda se detiene y no salen granos del foco caliente',
    fr: 'La place de la source froide est vide — la roue est immobile et aucun grain ne quitte la source chaude',
    hi: 'ठंडे भंडार की जगह ख़ाली है — पहिया रुका है और गर्म भंडार से कोई कण नहीं निकलता',
    id: 'Tempat reservoir dingin kosong — roda diam dan tak ada butir yang keluar dari reservoir panas',
    pt: 'O lugar do reservatório frio está vazio — a roda fica parada e nenhum grão sai do reservatório quente',
  },
  'caption.reset': {
    ko: '찬 열원을 다시 붙인다',
    en: 'The cold reservoir goes back',
    ja: '低温熱源が元に戻る',
    zh: '低温热源放回原处',
    ar: 'يعود المستودع البارد إلى مكانه',
    es: 'El foco frío vuelve a su sitio',
    fr: 'La source froide revient',
    hi: 'ठंडा भंडार वापस लगता है',
    id: 'Reservoir dingin dipasang kembali',
    pt: 'O reservatório frio volta ao lugar',
  },
} satisfies Record<string, LocalizedText>);

export type HeatEngineMessageKey = keyof typeof heatEngineMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: HeatEngineMessageKey): LocalizedText => heatEngineMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: HeatEngineMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const heatEngineSchema: BundleSchema = {
  id: HEAT_ENGINE_ID,
  label: text('label.title'),
  category: 'thermal',
  description: text('label.description'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 바로 열이 흐르고 갈라지고 쌓이고, 찬 열원을 떼면 선다.
  parameters: [],

  stages: [
    {
      id: 'two-reservoirs',
      label: text('label.stage'),
      constants: {
        qHot: Q_HOT,
        work: WORK,
        qCold: Q_COLD,
        grain: GRAIN,
        bandScale: BAND_SCALE,
        grainLead: GRAIN_LEAD,
        grainTravel: GRAIN_TRAVEL,
      },
    },
  ],
  environments: [],
  views: [{ id: 'flow', label: text('label.view'), default: true }],

  /** 가로로 긴 흐름 그림이다. 세로는 일 더미 · 기관 · 캡션 줄만큼. */
  canvas: { height: 360, minHeight: 320 },

  /** 쓴 순서대로 — 띠가 맨 아래, 상자 · 바퀴 위에 알갱이, 이름표가 맨 위. */
  drawOrder: 'scene',

  /**
   * 한 주기 = 세 바퀴(turn-1~3) → 쌓인 더미를 읽는 동안(hold) → 찬 열원을 떼어 냄(detach) →
   * 기관이 선 채로(stall) → 찬 열원을 되돌리며 더미를 지움(reset).
   *
   * 바퀴 단계 하나에 알갱이가 `grainLead` 간격으로 한 바퀴 몫이 떠난다. 단계 길이는
   * 「알갱이 수 × grainLead」 보다 짧지 않게 둔다 (단계 사이 관계는 선언할 자리가 없다, G129).
   */
  timeline: {
    phases: [
      { id: TURN_PHASES[0], duration: 1.8, caption: key('caption.turn1') },
      { id: TURN_PHASES[1], duration: 1.8, caption: key('caption.turn2') },
      { id: TURN_PHASES[2], duration: 1.8, caption: key('caption.turn3') },
      { id: 'hold', duration: 3.0, caption: key('caption.hold') },
      { id: 'detach', duration: 1.4, ease: 'smooth', caption: key('caption.detach') },
      { id: 'stall', duration: 3.2, caption: key('caption.stall') },
      { id: 'reset', duration: 0.8, ease: 'smooth', caption: key('caption.reset') },
    ],
  },

  /** 도착한 순간 이미 첫 바퀴의 알갱이가 띠 위를 흐르고 있다. */
  startAt: 0.9,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 효율의 정의 · 식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-left', offset: [16, -10] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 640,
    style: { colorRole: 'ink', emphasis: 'strong' },
    /** 문안 속 값은 state 에 옮겨 둔 선언값의 글자다 (G133 우회, `state.ts`). */
    vars: { qh: 'qHot', w: 'work', qc: 'qCold' },
  },

  messages: heatEngineMessages,
};
