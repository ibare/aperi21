// ========================================================================
// newtons-second-law — 선언
// ========================================================================
// 질문: 힘을 두 배로 하면 속도가 두 배가 되는가.
//
// 아니다. 두 배가 되는 것은 **1초마다 붙는 속도**다. 같은 수레 셋을 1·2·3배 힘으로
// 동시에 밀면, 속도 막대에 1초마다 쌓이는 칸의 수는 같고 칸의 크기가 1:2:3 이다.
//
// 값은 모두 원본(tasks/piece-lab/newtons-second-law/index.html)에서 그대로 옮겼다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:newtons-second-law` 와 문자 그대로 일치한다 (C4). */
export const NEWTONS_SECOND_LAW_ID = 'newtons-second-law';

// ------------------------------------------------------------------------
// 운동 — 원본 상수
// ------------------------------------------------------------------------

/** 줄마다 가하는 힘(질량 1 이라 곧 가속도). */
export const FORCES: readonly number[] = [1, 2, 3];
/** 미는 시간(s). 시간표 `push` 단계 길이와 같다. */
export const RUN = 4;
/** 끝난 모습을 보여 주는 시간(s). 시간표 `hold` 단계 길이와 같다. */
export const HOLD = 1.4;
/** 도착한 순간 이미 1초째 진행 중. */
export const OFFSET = 1;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const newtonsSecondLawMessages = Object.freeze({
  'label.title': {
    ko: '가속도 법칙',
    en: "Newton's second law",
    ja: 'ニュートンの運動の第2法則',
    zh: '牛顿第二定律',
    ar: 'قانون نيوتن الثاني',
    es: 'Segunda ley de Newton',
    fr: 'Deuxième loi de Newton',
    hi: 'न्यूटन का गति का दूसरा नियम',
    id: 'Hukum II Newton',
    pt: 'Segunda lei de Newton',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '알짜힘·질량·가속도의 관계',
    en: 'Net force, mass and acceleration',
    ja: '合力・質量・加速度',
    zh: '合力、质量与加速度',
    ar: 'محصلة القوى والكتلة والتسارع',
    es: 'Fuerza neta, masa y aceleración',
    fr: 'Force résultante, masse et accélération',
    hi: 'परिणामी बल, द्रव्यमान और त्वरण',
    id: 'Gaya total, massa, dan percepatan',
    pt: 'Força resultante, massa e aceleração',
  },
  'label.stage': {
    ko: '수레 셋',
    en: 'Three carts',
    ja: '3台の台車',
    zh: '三辆小车',
    ar: 'ثلاث عربات',
    es: 'Tres carritos',
    fr: 'Trois chariots',
    hi: 'तीन ट्रॉलियाँ',
    id: 'Tiga troli',
    pt: 'Três carrinhos',
  },
  'label.view': {
    ko: '기본',
    en: 'Default',
    ja: '標準',
    zh: '默认',
    ar: 'افتراضي',
    es: 'Predeterminada',
    fr: 'Par défaut',
    hi: 'डिफ़ॉल्ट',
    id: 'Bawaan',
    pt: 'Padrão',
  },
  /** 줄 이름 — 무엇을 바꿨는지. */
  'label.force': {
    ko: '힘 {f}배',
    en: 'force ×{f}',
    ja: '力 ×{f}',
    zh: '力 ×{f}',
    ar: 'القوة ×{f}',
    es: 'fuerza ×{f}',
    fr: 'force ×{f}',
    hi: 'बल ×{f}',
    id: 'gaya ×{f}',
    pt: 'força ×{f}',
  },
  /** 줄 이름 — 아래 막대가 무엇인지. */
  'label.velocity': {
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
  'caption.push': {
    ko: '같은 수레를 2배, 3배 힘으로 밀면 1초마다 붙는 속도(막대 한 칸)도 2배, 3배다.',
    en: 'Push the same cart 2 or 3 times harder and the speed gained each second (one block) is 2 or 3 times larger.',
    ja: '同じ台車を2倍、3倍の力で押すと、1秒ごとに増える速さ(棒の1マス)も2倍、3倍になる。',
    zh: '用2倍、3倍的力推同一辆小车，每秒增加的速率（一格）也变为2倍、3倍。',
    ar: 'ادفع العربة نفسها بقوة أكبر 2 أو 3 مرات، فتصبح السرعة المكتسبة كل ثانية (خانة واحدة) أكبر 2 أو 3 مرات.',
    es: 'Empuja el mismo carrito con 2 o 3 veces más fuerza y la rapidez ganada cada segundo (un bloque) es 2 o 3 veces mayor.',
    fr: 'Poussez le même chariot 2 ou 3 fois plus fort, et la vitesse gagnée chaque seconde (un bloc) est 2 ou 3 fois plus grande.',
    hi: 'उसी ट्रॉली को 2 या 3 गुना ज़ोर से धकेलें, तो हर सेकंड बढ़ने वाली चाल (एक खाना) भी 2 या 3 गुनी होती है।',
    id: 'Dorong troli yang sama 2 atau 3 kali lebih kuat, maka kelajuan yang bertambah tiap detik (satu blok) juga 2 atau 3 kali lebih besar.',
    pt: 'Empurre o mesmo carrinho com força 2 ou 3 vezes maior, e a velocidade ganha a cada segundo (um bloco) fica 2 ou 3 vezes maior.',
  },
  'caption.hold': {
    ko: '4초 동안 쌓인 칸은 셋 모두 넷 — 다른 것은 칸 하나의 크기뿐이다.',
    en: 'After 4 s every bar has four blocks — only the size of a block differs.',
    ja: '4 s たつと、どの棒も4マス — 違うのは1マスの大きさだけだ。',
    zh: '4 s 后，每根柱都有四格 — 不同的只是一格的大小。',
    ar: 'بعد 4 s يكون في كل عمود أربع خانات — لا يختلف سوى حجم الخانة الواحدة.',
    es: 'Tras 4 s, cada barra tiene cuatro bloques — solo cambia el tamaño de un bloque.',
    fr: 'Après 4 s, chaque barre compte quatre blocs — seule la taille d’un bloc diffère.',
    hi: '4 s बाद हर पट्टी में चार खाने हैं — अलग है तो बस एक खाने का आकार।',
    id: 'Setelah 4 s setiap batang berisi empat blok — yang berbeda hanya ukuran satu blok.',
    pt: 'Após 4 s, toda barra tem quatro blocos — só o tamanho de um bloco muda.',
  },
} satisfies Record<string, LocalizedText>);

export type NewtonsSecondLawMessageKey = keyof typeof newtonsSecondLawMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: NewtonsSecondLawMessageKey): LocalizedText => newtonsSecondLawMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: NewtonsSecondLawMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const newtonsSecondLawSchema: BundleSchema = {
  id: NEWTONS_SECOND_LAW_ID,
  label: text('label.title'),
  category: 'mechanics',
  description: text('label.description'),
  timeModel: 'periodic',

  // 조작기가 없다. 자동 진행만으로 1:2:3 이 드러난다.
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
   * 원본은 `(t + 1) mod 5.4` 로 시계를 1초 앞당겨 열었다 — 첫 칸이 막 찬 모습부터
   * 보인다. 모든 것이 시각의 함수라 시계를 옮기는 것으로 충분하다.
   */
  startAt: OFFSET,

  /** 한 주기 5.4 s — 밀기 4 → 멈춘 모습 1.4. 끝나면 처음(밀기 0초)으로 돌아간다. */
  timeline: {
    phases: [
      { id: 'push', duration: RUN, caption: key('caption.push') },
      { id: 'hold', duration: HOLD, caption: key('caption.hold') },
    ],
  },

  // 원본이 그린 순서대로 겹친다 — 선로 · 매초 자리 · 수레 · 힘 · 막대.
  drawOrder: 'scene',

  // 슬롯 하나. 원본의 캔버스 아래 캡션 자리 — 왼쪽 한 줄, 15px, 짙은 회색.
  caption: {
    anchor: { screen: 'bottom-left' },
    align: 'left',
    fontSize: 15,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  /**
   * 그리드도 카메라 버튼도 없다 (기본값). 비교는 세 줄이 같은 출발선·같은 축척을
   * 공유하는 것으로 충분하다 — 눈금을 깔면 동사가 칸이 쌓이는 일에서 숫자 읽기로
   * 옮겨 간다.
   */

  messages: newtonsSecondLawMessages,
};
