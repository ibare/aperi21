// ========================================================================
// average-acceleration — 선언
// ========================================================================
// 질문: 도중에 속도가 줄었다 늘었다 해도, 처음과 끝 속도만 같으면 평균 가속도가
// 정말 같은가.
//
// 두 차가 같은 10 m/s 로 출발해 5 초 뒤 같은 20 m/s 가 된다. 가는 고르게, 나는
// 늦췄다가 몰아서 올린다. 속도-시간 그래프에서 처음과 지금을 잇는 두 기울기선이
// 끝 시각에 하나로 겹친다.
//
// 값은 모두 원본(tasks/piece-lab/average-acceleration/index.html)에서 그대로 옮겼다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:average-acceleration` 와 문자 그대로 일치한다 (C4). */
export const AVERAGE_ACCELERATION_ID = 'average-acceleration';

// ------------------------------------------------------------------------
// 운동 — 원본 상수
// ------------------------------------------------------------------------

/** 달리는 시간(s). 시간표의 `run` 단계 길이와 같다. */
export const RUN = 5;
/** 처음 속도(m/s). 두 차 공통. */
export const V0 = 10;
/** 끝 속도(m/s). 두 차 공통. */
export const V1 = 20;
/** 차 나가 처음에 속도를 늦추는 정도(m/s). 끝에서는 0 이 되어 가와 다시 만난다. */
export const DIP = -8;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const averageAccelerationMessages = Object.freeze({
  'label.title': {
    ko: '평균 가속도',
    en: 'Average acceleration',
    ja: '平均加速度',
    zh: '平均加速度',
    ar: 'التسارع المتوسط',
    es: 'Aceleración media',
    fr: 'Accélération moyenne',
    hi: 'औसत त्वरण',
    id: 'Percepatan rata-rata',
    pt: 'Aceleração média',
  },
  'label.operation': {
    ko: '속도 변화의 비율',
    en: 'Rate of change of velocity',
    ja: '速度の変化の割合',
    zh: '速度的变化率',
    ar: 'معدل تغير السرعة',
    es: 'Tasa de cambio de la velocidad',
    fr: 'Taux de variation de la vitesse',
    hi: 'वेग परिवर्तन की दर',
    id: 'Laju perubahan kecepatan',
    pt: 'Taxa de variação da velocidade',
  },
  'label.stage': {
    ko: '두 차로',
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
  'label.view': {
    ko: '도로와 그래프',
    en: 'Road and graph',
    ja: '道路とグラフ',
    zh: '道路与图像',
    ar: 'الطريق والرسم البياني',
    es: 'Carretera y gráfica',
    fr: 'Route et graphique',
    hi: 'सड़क और ग्राफ़',
    id: 'Jalan dan grafik',
    pt: 'Estrada e gráfico',
  },
  /** 차 이름표. 색으로만 가르지 않기 위해 둔다. */
  'label.carA': {
    ko: '가',
    en: 'A',
    ja: 'A',
    zh: 'A',
    ar: 'A',
    es: 'A',
    fr: 'A',
    hi: 'A',
    id: 'A',
    pt: 'A',
  },
  'label.carB': {
    ko: '나',
    en: 'B',
    ja: 'B',
    zh: 'B',
    ar: 'B',
    es: 'B',
    fr: 'B',
    hi: 'B',
    id: 'B',
    pt: 'B',
  },
  /** 화살표 옆 속력. 수와 단위는 표식이다 (C1 판정 3). */
  'label.speed': {
    ko: '{v} m/s',
    en: '{v} m/s',
    ja: '{v} m/s',
    zh: '{v} m/s',
    ar: '{v} m/s',
    es: '{v} m/s',
    fr: '{v} m/s',
    hi: '{v} m/s',
    id: '{v} m/s',
    pt: '{v} m/s',
  },
  /** 그래프 축 이름. */
  'label.axisV': {
    ko: '속도',
    en: 'velocity',
    ja: '速度',
    zh: '速度',
    ar: 'السرعة',
    es: 'velocidad',
    fr: 'vitesse',
    hi: 'वेग',
    id: 'kecepatan',
    pt: 'velocidade',
  },
  'label.axisT': {
    ko: '시간',
    en: 'time',
    ja: '時間',
    zh: '时间',
    ar: 'الزمن',
    es: 'tiempo',
    fr: 'temps',
    hi: 'समय',
    id: 'waktu',
    pt: 'tempo',
  },
  /** 축 눈금 — 주장에 쓰이는 값만. */
  'label.tickV': {
    ko: '{v}',
    en: '{v}',
    ja: '{v}',
    zh: '{v}',
    ar: '{v}',
    es: '{v}',
    fr: '{v}',
    hi: '{v}',
    id: '{v}',
    pt: '{v}',
  },
  'label.tickT0': {
    ko: '0',
    en: '0',
    ja: '0',
    zh: '0',
    ar: '0',
    es: '0',
    fr: '0',
    hi: '0',
    id: '0',
    pt: '0',
  },
  'label.tickT': {
    ko: '{t} s',
    en: '{t} s',
    ja: '{t} s',
    zh: '{t} s',
    ar: '{t} s',
    es: '{t} s',
    fr: '{t} s',
    hi: '{t} s',
    id: '{t} s',
    pt: '{t} s',
  },
  /** 겹친 기울기선의 값. */
  'label.slope': {
    ko: '기울기 {a} m/s²',
    en: 'slope {a} m/s²',
    ja: '傾き {a} m/s²',
    zh: '斜率 {a} m/s²',
    ar: 'الميل {a} m/s²',
    es: 'pendiente {a} m/s²',
    fr: 'pente {a} m/s²',
    hi: 'ढाल {a} m/s²',
    id: 'kemiringan {a} m/s²',
    pt: 'inclinação {a} m/s²',
  },
  /** 걸린 시간과 속도 변화. */
  'label.dt': {
    ko: '{t} s 동안',
    en: 'over {t} s',
    ja: '{t} s の間',
    zh: '{t} s 内',
    ar: 'خلال {t} s',
    es: 'en {t} s',
    fr: 'en {t} s',
    hi: '{t} s में',
    id: 'selama {t} s',
    pt: 'em {t} s',
  },
  'label.dv': {
    ko: '+{v} m/s',
    en: '+{v} m/s',
    ja: '+{v} m/s',
    zh: '+{v} m/s',
    ar: '+{v} m/s',
    es: '+{v} m/s',
    fr: '+{v} m/s',
    hi: '+{v} m/s',
    id: '+{v} m/s',
    pt: '+{v} m/s',
  },
  'caption.run': {
    ko: '둘 다 10 m/s 로 출발한다. 가는 고르게, 나는 늦췄다가 몰아서 속도를 올린다.',
    en: 'Both start at 10 m/s. A speeds up steadily; B slows down first, then catches up.',
    ja: 'どちらも 10 m/s で出発する。A は一様に速くなり、B はいったん遅くなってから追いつく。',
    zh: '两车都以 10 m/s 出发。A 均匀加速；B 先减速，再追上来。',
    ar: 'تنطلق السيارتان بسرعة 10 m/s. تتسارع A بانتظام، وتتباطأ B أولًا ثم تلحق بها.',
    es: 'Ambos salen a 10 m/s. A acelera de forma constante; B primero frena y luego lo alcanza.',
    fr: 'Les deux partent à 10 m/s. A accélère régulièrement ; B ralentit d’abord, puis rattrape.',
    hi: 'दोनों 10 m/s से चलना शुरू करती हैं। A एकसमान रूप से तेज़ होती है; B पहले धीमी होती है, फिर बराबरी कर लेती है।',
    id: 'Keduanya berangkat pada 10 m/s. A bertambah cepat secara merata; B melambat dulu, lalu menyusul.',
    pt: 'Os dois partem a 10 m/s. A acelera de modo constante; B primeiro desacelera e depois alcança.',
  },
  'caption.done': {
    ko: '5초 뒤 둘 다 20 m/s — 가는 동안은 달랐어도, 처음과 끝을 잇는 기울기는 하나로 겹친다.',
    en: 'After 5 s both are at 20 m/s — however they got there, the slopes joining start and end become one.',
    ja: '5 s 後、どちらも 20 m/s — 途中は違っても、始めと終わりを結ぶ傾きは一つに重なる。',
    zh: '5 s 后两车都是 20 m/s——无论途中如何，连接起点与终点的斜率合而为一。',
    ar: 'بعد 5 s تبلغ السيارتان 20 m/s — مهما اختلف الطريق، يصير الميلان الواصلان بين البداية والنهاية ميلًا واحدًا.',
    es: 'Tras 5 s ambos van a 20 m/s — sin importar cómo llegaron, las pendientes que unen inicio y final se vuelven una.',
    fr: 'Après 5 s, les deux sont à 20 m/s — quel que soit le chemin, les pentes reliant début et fin ne font plus qu’une.',
    hi: '5 s बाद दोनों 20 m/s पर हैं — बीच में चाहे जैसे चलीं, शुरुआत और अंत को जोड़ने वाली ढालें एक हो जाती हैं।',
    id: 'Setelah 5 s keduanya 20 m/s — bagaimanapun caranya, kemiringan yang menghubungkan awal dan akhir menjadi satu.',
    pt: 'Após 5 s os dois estão a 20 m/s — não importa como chegaram, as inclinações que ligam início e fim viram uma só.',
  },
} satisfies Record<string, LocalizedText>);

export type AverageAccelerationMessageKey = keyof typeof averageAccelerationMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: AverageAccelerationMessageKey): LocalizedText =>
  averageAccelerationMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: AverageAccelerationMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const averageAccelerationSchema: BundleSchema = {
  id: AVERAGE_ACCELERATION_ID,
  label: text('label.title'),
  category: 'kinematics',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다. 자동 진행으로 두 선이 겹치면 할 말이 끝난다.
  parameters: [],

  stages: [{ id: 'default', label: text('label.stage'), constants: {} }],
  environments: [],
  views: [{ id: 'default', label: text('label.view'), default: true }],

  /**
   * 원본은 그림 880 × 270 + 캔버스 밖 캡션 한 줄이었다. 캡션이 캔버스 안(화면 고정
   * 줄)으로 들어오고 러너가 사방에 여백을 두므로 그만큼 더 잡는다.
   */
  canvas: { height: 340, minHeight: 300 },

  /**
   * 한 주기 8.5 s — 달림 5 → 기울기선이 하나로 합쳐짐 0.3 → 걸린 시간·속도 변화가
   * 나타남 0.4 → 머묾 2.8. 끝나면 되감기 전환 없이 처음으로 돌아간다(원본과 같다).
   *
   * 원본은 차가 출발선에서 이미 10 m/s 로 움직이는 순간부터 연다 — 시계를 앞당기지
   * 않는다(`startAt` 0).
   */
  timeline: {
    phases: [
      { id: 'run', duration: RUN, caption: key('caption.run') },
      { id: 'join', duration: 0.3, caption: key('caption.done') },
      { id: 'measure', duration: 0.4, caption: key('caption.done') },
      { id: 'hold', duration: 2.8, caption: key('caption.done') },
    ],
  },

  // 원본이 그린 순서대로 겹친다 — 단, 처음-지금 기울기선은 곡선 **아래**에 깐다
  // (NOTES.md 「원본과 달라진 점」). 겹침이 판정 장치라 층에 맡기지 않는다.
  drawOrder: 'scene',

  // 슬롯 하나. 원본의 figcaption 자리 — 그림 아래 왼쪽 한 줄.
  caption: {
    anchor: { screen: 'bottom-left' },
    align: 'left',
    fontSize: 15,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  /**
   * 그리드도 카메라 버튼도 없다 (기본값). 눈금은 주장에 쓰이는 값(10 · 20 m/s,
   * 0 · 5 s)만 둔다 — 격자를 깔면 "숫자로 확인하라" 는 신호가 되어 동사가 선이
   * 겹치는 일에서 숫자가 같아지는 일로 옮겨 간다.
   */

  messages: averageAccelerationMessages,
};
