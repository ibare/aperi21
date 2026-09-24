// ========================================================================
// string-vibration — 선언
// ========================================================================
// 질문: 기타 줄을 손가락으로 누르면 왜 음이 높아지는가.
//
// 답: 누른 자리부터 줄받침까지만 흔들린다. 그 부분이 기본 모양 — 반파장 하나 — 으로
// 흔들리므로 흔들리는 길이가 짧아지면 반파장이 짧아지고, 같은 파속에서 더 빨리
// 흔들린다(f₁ = v / 2L). 길이가 2/3 이면 3/2 배, 절반이면 두 배 — 한 옥타브 위다.
// 손가락이 줄을 따라 미끄러지는 동안 줄이 점점 빨리 흔들리고, 아래 파형창에는 같은
// 시간 동안 흔들린 횟수가 누르지 않은 줄(점선)보다 많이 담긴다.
//
// 배음(한 줄이 여러 모양으로 흔들리는 것)은 `harmonics` 의 몫이다 — 여기서는 언제나
// 기본 모양 하나만 흔들리고, 바뀌는 것은 흔들리는 길이 하나다. 장력 · 굵기는 두지 않았다
// (NOTES).
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:string-vibration` 와 문자 그대로 일치한다 (C4). */
export const STRING_VIBRATION_ID = 'string-vibration';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 월드 1 단위 = 줄 위 거리 한 단위. 너트가 x = 0, 줄받침이 x = L.
// ------------------------------------------------------------------------

/** 줄 전체 길이(너트 ~ 줄받침, 월드). */
export const STRING_LENGTH = 6;
/** 파속(월드/초). 누르지 않은 줄의 f₁ = v / 2L = 0.6 Hz — 흔들림을 눈으로 셀 수 있는 빠르기다. */
export const WAVE_SPEED = 7.2;
/** 배(가장 크게 흔들리는 자리)의 높이(월드). 흔들리는 길이와 무관하게 같게 둔다. */
export const AMPLITUDE = 0.45;
/**
 * 첫 번째로 누르는 자리 — 흔들리는 길이가 전체의 `num / den`. 기본 2/3(완전 5도 위).
 * 진동수 배수는 그 역수 `den / num` 이다. 화면 글자도 이 두 수를 그대로 쓴다 (S-piece 유효숫자).
 */
export const STOP1_NUM = 2;
export const STOP1_DEN = 3;
/** 두 번째로 누르는 자리 — 기본 1/2(한 옥타브 위). */
export const STOP2_NUM = 1;
export const STOP2_DEN = 2;
/** 파형창에 담기는 시간 — 누르지 않은 줄이 이만큼 흔들리는 시간이다. */
export const SCOPE_CYCLES = 2;

// ------------------------------------------------------------------------
// 배치 — 월드 단위
// ------------------------------------------------------------------------

/** 줄의 평형 높이(월드 y). */
export const STRING_Y = 1.05;
/** 흔들리는 길이를 재는 치수선 높이(월드 y). 줄이 가장 낮게 내려와도 닿지 않는다. */
export const DIMENSION_Y = 0.2;
/** 파형창 — 가로 기준선 높이 · 흔들림 높이(월드). 가로는 줄과 같은 폭을 쓴다. */
export const SCOPE_BASE_Y = -1.05;
export const SCOPE_AMPLITUDE = 0.42;
/** 너트 · 줄받침 받침대 크기(월드, [가로, 세로]). */
export const END_BLOCK: readonly [number, number] = [0.14, 0.34];
/** 손가락 끝(누르는 자리) 반지름(월드). */
export const FINGER_RADIUS = 0.13;
/** 프렛(누를 자리 표시) 반길이(월드). */
export const FRET_HALF = 0.16;

/**
 * 프레이밍 — 왼쪽은 파형창 이름표, 오른쪽은 진동수 글자, 아래는 캡션.
 * 매 프레임 같은 값이다 (S-piece — 프레이밍은 주장의 일부다).
 */
export const SCENE_BOUNDS = { minX: -1.5, maxX: 7.1, minY: -2.05, maxY: 1.85 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const stringVibrationMessages = Object.freeze({
  'label.title': {
    ko: '줄의 진동',
    en: 'Vibrating string',
    ja: '弦の振動',
    zh: '弦的振动',
    ar: 'الوتر المهتز',
    es: 'Cuerda que vibra',
    fr: 'Corde vibrante',
    hi: 'कंपन करती डोरी',
    id: 'Tali yang bergetar',
    pt: 'Corda vibrante',
  },
  'label.operation': {
    ko: '양끝이 고정된 줄의 모드',
    en: 'Modes of a string fixed at both ends',
    ja: '両端を固定した弦のモード',
    zh: '两端固定的弦的模式',
    ar: 'أنماط وتر مثبَّت من طرفيه',
    es: 'Modos de una cuerda fija en ambos extremos',
    fr: 'Modes d’une corde fixée aux deux extrémités',
    hi: 'दोनों सिरों पर बँधी डोरी की विधाएँ',
    id: 'Mode tali yang terikat di kedua ujung',
    pt: 'Modos de uma corda fixa nas duas pontas',
  },
  'label.stage': {
    ko: '손가락으로 누르는 줄',
    en: 'String stopped by a finger',
    ja: '指で押さえる弦',
    zh: '用手指按住的弦',
    ar: 'وتر يضغطه إصبع',
    es: 'Cuerda pisada con un dedo',
    fr: 'Corde pincée par un doigt',
    hi: 'उँगली से दबाई गई डोरी',
    id: 'Tali yang ditekan jari',
    pt: 'Corda pressionada por um dedo',
  },
  'label.view': {
    ko: '줄과 파형',
    en: 'String and waveform',
    ja: '弦と波形',
    zh: '弦与波形',
    ar: 'الوتر والشكل الموجي',
    es: 'Cuerda y forma de onda',
    fr: 'Corde et forme d’onde',
    hi: 'डोरी और तरंगरूप',
    id: 'Tali dan bentuk gelombang',
    pt: 'Corda e forma de onda',
  },

  /** 누르는 손가락. */
  'label.finger': {
    ko: '손가락',
    en: 'finger',
    ja: '指',
    zh: '手指',
    ar: 'إصبع',
    es: 'dedo',
    fr: 'doigt',
    hi: 'उँगली',
    id: 'jari',
    pt: 'dedo',
  },
  /** 흔들리는 길이 — 치수선 글자. 분수는 스테이지 상수 그대로다. */
  'label.len.open': {
    ko: 'L',
    en: 'L',
    ja: 'L',
    zh: 'L',
    ar: 'L',
    es: 'L',
    fr: 'L',
    hi: 'L',
    id: 'L',
    pt: 'L',
  },
  'label.len.frac': {
    ko: '{a}/{b} L',
    en: '{a}/{b} L',
    ja: '{a}/{b} L',
    zh: '{a}/{b} L',
    ar: '{a}/{b} L',
    es: '{a}/{b} L',
    fr: '{a}/{b} L',
    hi: '{a}/{b} L',
    id: '{a}/{b} L',
    pt: '{a}/{b} L',
  },
  /** 진동수 — 파형 끝 글자. 기호라 두 언어가 같다(C1 표식). */
  'label.freq.open': {
    ko: 'f₁',
    en: 'f₁',
    ja: 'f₁',
    zh: 'f₁',
    ar: 'f₁',
    es: 'f₁',
    fr: 'f₁',
    hi: 'f₁',
    id: 'f₁',
    pt: 'f₁',
  },
  'label.freq.whole': {
    ko: '{n} f₁',
    en: '{n} f₁',
    ja: '{n} f₁',
    zh: '{n} f₁',
    ar: '{n} f₁',
    es: '{n} f₁',
    fr: '{n} f₁',
    hi: '{n} f₁',
    id: '{n} f₁',
    pt: '{n} f₁',
  },
  'label.freq.frac': {
    ko: '{a}/{b} f₁',
    en: '{a}/{b} f₁',
    ja: '{a}/{b} f₁',
    zh: '{a}/{b} f₁',
    ar: '{a}/{b} f₁',
    es: '{a}/{b} f₁',
    fr: '{a}/{b} f₁',
    hi: '{a}/{b} f₁',
    id: '{a}/{b} f₁',
    pt: '{a}/{b} f₁',
  },
  /** 파형창 이름과 점선 이름. */
  'label.scope': {
    ko: '가운데 점의 흔들림 — 같은 시간 동안',
    en: 'Swing of the middle point — same time span',
    ja: '中央の点のゆれ — 同じ時間のあいだ',
    zh: '中点的摆动 — 同样的时间内',
    ar: 'تأرجح النقطة الوسطى — خلال المدة نفسها',
    es: 'Oscilación del punto medio — mismo intervalo de tiempo',
    fr: 'Oscillation du point central — même durée',
    hi: 'बीच के बिंदु का झूलना — समान समय में',
    id: 'Ayunan titik tengah — rentang waktu yang sama',
    pt: 'Oscilação do ponto do meio — mesmo intervalo de tempo',
  },
  'label.reference': {
    ko: '누르지 않은 줄',
    en: 'open string',
    ja: '押さえない弦',
    zh: '空弦',
    ar: 'وتر مطلق',
    es: 'cuerda al aire',
    fr: 'corde à vide',
    hi: 'खुली डोरी',
    id: 'tali lepas',
    pt: 'corda solta',
  },

  'caption.open': {
    ko: '누르지 않은 줄 — 너트에서 줄받침까지 줄 전체가 반파장 하나로 흔들린다.',
    en: 'Open string — the whole string, nut to bridge, swings as one half-wavelength.',
    ja: '押さえない弦 — ナットから駒まで弦全体が半波長ひとつでゆれる。',
    zh: '空弦 — 从琴枕到琴码，整根弦以一个半波长摆动。',
    ar: 'وتر مطلق — الوتر كله، من العُتبة إلى الفرس، يتأرجح كنصف طول موجي واحد.',
    es: 'Cuerda al aire — toda la cuerda, de la cejuela al puente, oscila como una media longitud de onda.',
    fr: 'Corde à vide — toute la corde, du sillet au chevalet, oscille comme une demi-longueur d’onde.',
    hi: 'खुली डोरी — नट से ब्रिज तक पूरी डोरी एक अर्ध-तरंगदैर्घ्य के रूप में झूलती है।',
    id: 'Tali lepas — seluruh tali, dari nut ke bridge, berayun sebagai setengah panjang gelombang.',
    pt: 'Corda solta — a corda inteira, da pestana ao cavalete, oscila como meio comprimento de onda.',
  },
  'caption.slide': {
    ko: '손가락이 줄을 누르며 미끄러진다 — 흔들리는 부분이 짧아질수록 더 빨리 흔들린다.',
    en: 'The finger slides along the string — the shorter the swinging part, the faster it swings.',
    ja: '指が弦を押さえながらすべる — ゆれる部分が短いほど速くゆれる。',
    zh: '手指按着弦滑动 — 摆动部分越短，摆得越快。',
    ar: 'ينزلق الإصبع على الوتر — كلما قصر الجزء المتأرجح، تأرجح أسرع.',
    es: 'El dedo se desliza por la cuerda — cuanto más corta la parte que oscila, más rápido oscila.',
    fr: 'Le doigt glisse le long de la corde — plus la partie qui oscille est courte, plus elle oscille vite.',
    hi: 'उँगली डोरी पर फिसलती है — झूलने वाला भाग जितना छोटा, वह उतनी तेज़ी से झूलता है।',
    id: 'Jari meluncur di sepanjang tali — makin pendek bagian yang berayun, makin cepat ayunannya.',
    pt: 'O dedo desliza pela corda — quanto menor a parte que oscila, mais rápido ela oscila.',
  },
  'caption.short': {
    ko: '누른 자리부터 줄받침까지만 흔들린다 — 같은 시간에 더 여러 번, 음이 높아진다.',
    en: 'Only the part from finger to bridge swings — more swings in the same time, a higher note.',
    ja: '指から駒までの部分だけがゆれる — 同じ時間により多くゆれ、音が高くなる。',
    zh: '只有从手指到琴码的部分摆动 — 同样时间内摆动更多次，音调变高。',
    ar: 'لا يتأرجح إلا الجزء من الإصبع إلى الفرس — تأرجحات أكثر في المدة نفسها، ونغمة أعلى.',
    es: 'Solo oscila la parte del dedo al puente — más oscilaciones en el mismo tiempo, una nota más aguda.',
    fr: 'Seule la partie entre le doigt et le chevalet oscille — plus d’oscillations dans le même temps, une note plus aiguë.',
    hi: 'केवल उँगली से ब्रिज तक का भाग झूलता है — उसी समय में अधिक झूले, ऊँचा स्वर।',
    id: 'Hanya bagian dari jari ke bridge yang berayun — lebih banyak ayunan dalam waktu yang sama, nada lebih tinggi.',
    pt: 'Só a parte do dedo ao cavalete oscila — mais oscilações no mesmo tempo, uma nota mais aguda.',
  },
  'caption.octave': {
    ko: '흔들리는 길이가 절반 — 두 배 빠르게 흔들린다. 한 옥타브 위 음이다.',
    en: 'Half the swinging length — twice as fast. The note is an octave higher.',
    ja: 'ゆれる長さが半分 — 2倍速くゆれる。1オクターブ上の音だ。',
    zh: '摆动长度减半 — 摆动快一倍。音高了一个八度。',
    ar: 'نصف الطول المتأرجح — ضعف السرعة. النغمة أعلى بأوكتاف.',
    es: 'La mitad de la longitud que oscila — el doble de rápido. La nota es una octava más aguda.',
    fr: 'La moitié de la longueur qui oscille — deux fois plus vite. La note est une octave plus haut.',
    hi: 'झूलने वाली लंबाई आधी — दोगुनी तेज़ी। स्वर एक सप्तक ऊँचा है।',
    id: 'Panjang yang berayun separuhnya — dua kali lebih cepat. Nadanya satu oktaf lebih tinggi.',
    pt: 'Metade do comprimento que oscila — o dobro da rapidez. A nota fica uma oitava acima.',
  },
  'caption.release': {
    ko: '손가락을 떼며 돌아간다 — 길어지는 만큼 느려진다.',
    en: 'The finger slides back and lifts — longer again, slower again.',
    ja: '指がすべって戻り、離れる — 長くなるほど遅くなる。',
    zh: '手指滑回并抬起 — 变长了，也变慢了。',
    ar: 'ينزلق الإصبع عائدًا ويرتفع — أطول من جديد، وأبطأ من جديد.',
    es: 'El dedo se desliza de vuelta y se levanta — otra vez más larga, otra vez más lenta.',
    fr: 'Le doigt revient en glissant et se lève — de nouveau plus longue, de nouveau plus lente.',
    hi: 'उँगली फिसलकर लौटती है और उठ जाती है — फिर लंबी, फिर धीमी।',
    id: 'Jari meluncur kembali dan terangkat — lebih panjang lagi, lebih lambat lagi.',
    pt: 'O dedo desliza de volta e se levanta — mais longa de novo, mais lenta de novo.',
  },
} satisfies Record<string, LocalizedText>);

export type StringVibrationMessageKey = keyof typeof stringVibrationMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로 (C1). */
export const text = (key: StringVibrationMessageKey): LocalizedText => stringVibrationMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: StringVibrationMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const stringVibrationSchema: BundleSchema = {
  id: STRING_VIBRATION_ID,
  label: text('label.title'),
  category: 'waves',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다. 손가락이 정해진 자리(개방 → 2/3 → 1/2)를 차례로 누르며 주장을 마친다 —
  // 독자가 손가락을 옮기게 해도 새로 보이는 것이 없고, 비교할 정박값이 흐트러진다.
  parameters: [],

  stages: [
    {
      id: 'stopped-string',
      label: text('label.stage'),
      constants: {
        stringLength: STRING_LENGTH,
        waveSpeed: WAVE_SPEED,
        amplitude: AMPLITUDE,
        stop1Num: STOP1_NUM,
        stop1Den: STOP1_DEN,
        stop2Num: STOP2_NUM,
        stop2Den: STOP2_DEN,
        scopeCycles: SCOPE_CYCLES,
      },
    },
  ],

  environments: [],

  views: [{ id: 'string', label: text('label.view'), default: true }],

  /** 줄 한 줄 + 치수선 + 파형창 + 캡션 한 줄. */
  canvas: { height: 400, minHeight: 360 },

  /** 프렛 · 점선 틀을 먼저, 줄을 그 위에, 손가락 · 받침을 맨 위에. */
  drawOrder: 'scene',

  /**
   * 한 주기 13.9 초. 흔들리는 길이(전체 대비)가 단계마다 이렇게 간다 —
   *
   * - `open` 1 · `slide-1` 1 → stop1 · `stop-1` stop1 · `slide-2` stop1 → stop2 · `stop-2` stop2 ·
   *   `release` stop2 → 1 · `mute` 1 에서 흔들림이 잦아든다(손가락을 떼며 줄을 멈춘다).
   * - 주기가 돌아오면 줄을 다시 튕긴다 — 가장 높은 자리에서 놓아 준다.
   * - 미끄러지는 단계는 진행도를 길이에 **선형으로** 잇는다 — 진동 위상은 진동수를 시간으로
   *   적분한 값이라(`physics.ts vibrationPhase`) 이징을 주면 그 적분이 어긋난다.
   */
  timeline: {
    phases: [
      { id: 'open', duration: 3.0, caption: key('caption.open') },
      { id: 'slide-1', duration: 1.4, caption: key('caption.slide') },
      { id: 'stop-1', duration: 3.0, caption: key('caption.short') },
      { id: 'slide-2', duration: 1.2, caption: key('caption.slide') },
      { id: 'stop-2', duration: 3.4, caption: key('caption.octave') },
      { id: 'release', duration: 1.4, caption: key('caption.release') },
      { id: 'mute', duration: 0.5, caption: key('caption.release') },
    ],
  },

  /** 도착한 순간 누르지 않은 줄이 이미 흔들리고 파형창이 차 있다. */
  startAt: 1.2,

  /** 슬롯 하나. 파형창 아래 왼쪽. */
  caption: {
    anchor: { screen: 'bottom-left', offset: [16, -6] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 820,
    style: { colorRole: 'ink', emphasis: 'strong' },
    fade: 0.25,
  },

  // 그리드 · 카메라 단추 · 범례 · 제목 없음(기본).

  messages: stringVibrationMessages,
};
