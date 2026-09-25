// ========================================================================
// simple-pendulum — 선언
// ========================================================================
// 질문: 진자 한 번 왕복하는 시간은 무엇이 정하는가? 무거운 추는 더 빨리 흔들리는가?
//
// 답: 작은 진폭에서 주기는 줄 길이만 따른다 — T = 2π√(L/g). 줄을 네 배로 하면
// 주기가 두 배가 되고, 추의 질량은 식에 없다.
//
// 화면에서는 같은 보에 매단 세 진자가 그 일을 한다 — 줄이 같고 질량이 네 배 다른
// 두 추는 나란히 같은 박자로 흔들리고, 줄이 네 배 긴 추는 그 둘이 두 번 다녀올 때
// 한 번 다녀온다. 왕복을 마칠 때마다 아래 줄에 점이 하나씩 쌓여 4 · 4 · 2 가 된다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:simple-pendulum` 와 문자 그대로 일치한다 (C4). */
export const SIMPLE_PENDULUM_ID = 'simple-pendulum';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 중력 가속도(m/s²). */
export const G = 9.8;
/** 짧은 줄의 길이(m). 주기가 약 1.00 초가 되는 길이다. */
export const SHORT_LENGTH = 0.25;
/** 긴 줄이 짧은 줄의 몇 배인가. 주기는 그 제곱근 배 — 네 배면 두 배다. */
export const LENGTH_RATIO = 4;
/**
 * 놓는 각(rad). 약 12.6° — 작은 진폭이다. 이 각에서 실제 주기는 소진폭 식보다
 * 0.3 % 길 뿐이라, 조각은 소진폭 해 θ = θ₀·cos(2πt/T) 를 그대로 쓴다. 진폭이 커지면
 * 주기가 길어지는 쪽은 이웃 조각 `pendulum-amplitude-dependence` 의 일이다.
 */
export const AMPLITUDE = 0.22;
/** 무거운 추가 가벼운 추의 몇 배인가. **물리는 이 값을 읽지 않는다** — 이름표만 읽는다. */
export const MASS_RATIO = 4;

/** 긴 줄의 한 주기(초). 시간표의 흔드는 단계가 이 길이다. */
const LONG_PERIOD = 2 * Math.PI * Math.sqrt((LENGTH_RATIO * SHORT_LENGTH) / G);

// ------------------------------------------------------------------------
// 배치 — 월드 1 단위 = 1 m. 원점은 보(천장)의 높이. 진자는 아래로 매달린다.
// ------------------------------------------------------------------------

/** 세 진자의 매단 자리 x. 짧은 m · 짧은 4m · 긴 m 순서다. */
export const PIVOT_X = { light: -0.55, heavy: -0.15, long: 0.5 } as const;
/** 추 반지름(m). 세 추가 같은 크기다 — 크기가 다르면 「공기를 더 받아서」 가 끼어든다. */
export const BOB_RADIUS = 0.034;
/** 보의 좌우 끝. */
export const BEAM_FROM = -0.8;
export const BEAM_TO = 0.8;
/** 쉬는 자리 점선이 추 아래로 더 내려가는 길이(m). */
export const REST_OVERHANG = 0.06;
/** 질량 이름표를 추 중심 아래로 내리는 거리(m). */
export const MASS_LABEL_DROP = 0.11;
/** 길이 치수선 자리 x — 짧은 줄은 왼쪽, 긴 줄은 오른쪽 바깥. */
export const SHORT_DIM_X = -0.72;
export const LONG_DIM_X = 0.84;
/** 왕복 횟수 점이 놓이는 줄(월드 y)과 점 사이 간격(m). */
export const COUNT_Y = -1.27;
export const COUNT_GAP = 0.075;

/**
 * 프레이밍 — 왼쪽은 세 진자와 횟수 줄, 오른쪽은 캡션 자리.
 * 매 프레임 같은 값이다 (S-piece — 프레이밍은 주장의 일부다).
 */
export const SCENE_BOUNDS = { minX: -1.12, maxX: 2.42, minY: -1.4, maxY: 0.12 } as const;

/** 캡션 자리 — 긴 진자의 치수선 오른쪽, 그림의 세로 가운데. */
const CAPTION = { x: 1.12, y: -0.58, wrapWidth: 300, fontSize: 14 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const simplePendulumMessages = Object.freeze({
  'label.title': {
    ko: '단진자',
    en: 'Simple pendulum',
    ja: '単振り子',
    zh: '单摆',
    ar: 'البندول البسيط',
    es: 'Péndulo simple',
    fr: 'Pendule simple',
    hi: 'सरल लोलक',
    id: 'Bandul sederhana',
    pt: 'Pêndulo simples',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '작은 진폭에서의 주기',
    en: 'The period at small amplitude',
    ja: '小さい振幅での周期',
    zh: '小振幅下的周期',
    ar: 'الدور عند سعة صغيرة',
    es: 'El periodo con amplitud pequeña',
    fr: 'La période aux petites amplitudes',
    hi: 'छोटे आयाम पर आवर्तकाल',
    id: 'Periode pada amplitudo kecil',
    pt: 'O período em pequena amplitude',
  },
  'label.stage': {
    ko: '같은 보에 매단 세 진자',
    en: 'Three pendulums on one beam',
    ja: '同じ梁に吊るした三つの振り子',
    zh: '挂在同一根横梁上的三个摆',
    ar: 'ثلاثة بندولات على عارضة واحدة',
    es: 'Tres péndulos en una misma viga',
    fr: 'Trois pendules sur une même poutre',
    hi: 'एक ही धरन पर तीन लोलक',
    id: 'Tiga bandul pada satu balok',
    pt: 'Três pêndulos numa mesma viga',
  },
  'label.view': {
    ko: '박자 견주기',
    en: 'Comparing beats',
    ja: '拍子を比べる',
    zh: '比较节拍',
    ar: 'مقارنة الإيقاع',
    es: 'Comparar el compás',
    fr: 'Comparer les cadences',
    hi: 'ताल की तुलना',
    id: 'Membandingkan irama',
    pt: 'Comparando o compasso',
  },

  /** 질량 · 길이 이름표. 기호라 번역 대상이 아니다 (C1 판정 3). 배수는 스테이지 상수에서 온다. */
  'label.mass': {
    ko: 'm',
    en: 'm',
    ja: 'm',
    zh: 'm',
    ar: 'm',
    es: 'm',
    fr: 'm',
    hi: 'm',
    id: 'm',
    pt: 'm',
  },
  'label.massTimes': {
    ko: '{k}m',
    en: '{k}m',
    ja: '{k}m',
    zh: '{k}m',
    ar: '{k}m',
    es: '{k}m',
    fr: '{k}m',
    hi: '{k}m',
    id: '{k}m',
    pt: '{k}m',
  },
  'label.length': {
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
  'label.lengthTimes': {
    ko: '{k}L',
    en: '{k}L',
    ja: '{k}L',
    zh: '{k}L',
    ar: '{k}L',
    es: '{k}L',
    fr: '{k}L',
    hi: '{k}L',
    id: '{k}L',
    pt: '{k}L',
  },
  /** 왕복 횟수 점 줄의 이름. */
  'label.returns': {
    ko: '왕복',
    en: 'Round trips',
    ja: '往復',
    zh: '往返次数',
    ar: 'مرات الذهاب والإياب',
    es: 'Idas y vueltas',
    fr: 'Allers-retours',
    hi: 'आने-जाने की संख्या',
    id: 'Bolak-balik',
    pt: 'Idas e voltas',
  },

  'caption.together': {
    ko: '세 추를 같은 각도에서 함께 놓았다. 왼쪽 두 추는 줄이 같고 질량만 네 배 다른데, 나란히 같은 박자로 흔들린다.',
    en: 'All three were released together from the same angle. The two on the left share a string length and differ only in mass — four times — yet they swing side by side, in step.',
    ja: '三つとも同じ角度から一緒に放した。左の二つは糸の長さが同じで、質量だけが4倍違う — それでも並んで同じ拍子で揺れる。',
    zh: '三个摆从同一角度同时释放。左边两个摆线长度相同，只是质量相差四倍 — 却并排以同样的节拍摆动。',
    ar: 'أُطلقت الثلاثة معًا من الزاوية نفسها. للاثنين على اليسار طول الخيط نفسه ولا يختلفان إلا في الكتلة — أربعة أضعاف — ومع ذلك يتأرجحان جنبًا إلى جنب بالإيقاع نفسه.',
    es: 'Los tres se soltaron juntos desde el mismo ángulo. Los dos de la izquierda tienen la misma longitud de hilo y solo difieren en la masa — cuatro veces — y aun así oscilan lado a lado, al mismo compás.',
    fr: 'Les trois ont été lâchés ensemble depuis le même angle. Les deux de gauche ont la même longueur de fil et ne diffèrent que par la masse — quatre fois — pourtant ils oscillent côte à côte, en cadence.',
    hi: 'तीनों को एक ही कोण से एक साथ छोड़ा गया। बाईं ओर के दोनों की डोरी की लंबाई एक-सी है और उनमें केवल द्रव्यमान का अंतर है — चार गुना — फिर भी वे अगल-बगल एक ही ताल में झूलते हैं।',
    id: 'Ketiganya dilepas bersama dari sudut yang sama. Dua bandul di kiri punya panjang tali yang sama dan hanya berbeda massa — empat kali — namun keduanya berayun berdampingan, seirama.',
    pt: 'Os três foram soltos juntos do mesmo ângulo. Os dois da esquerda têm o mesmo comprimento de fio e diferem só na massa — quatro vezes — e mesmo assim oscilam lado a lado, no mesmo compasso.',
  },
  'caption.slower': {
    ko: '줄이 네 배 긴 추는 한 번 다녀오는 데 두 배 걸린다 — 짧은 추가 두 번 왕복하는 동안 한 번.',
    en: 'The pendulum with four times the string takes twice as long for each round trip — one for every two of the short ones.',
    ja: '糸が4倍長い振り子は、一往復に2倍の時間がかかる — 短い振り子が2回往復する間に1回。',
    zh: '摆线长四倍的摆，每次往返要花两倍的时间 — 短摆往返两次，它才往返一次。',
    ar: 'البندول ذو الخيط الأطول بأربعة أضعاف يستغرق ضعف الوقت في كل ذهاب وإياب — مرة واحدة مقابل كل مرتين للبندولين القصيرين.',
    es: 'El péndulo con cuatro veces más hilo tarda el doble en cada ida y vuelta — una por cada dos de los cortos.',
    fr: 'Le pendule au fil quatre fois plus long met deux fois plus de temps pour chaque aller-retour — un pour deux des courts.',
    hi: 'चार गुना लंबी डोरी वाला लोलक हर आने-जाने में दोगुना समय लेता है — छोटे लोलकों के हर दो बार पर एक बार।',
    id: 'Bandul dengan tali empat kali lebih panjang butuh waktu dua kali lebih lama untuk setiap bolak-balik — satu kali untuk setiap dua kali bandul pendek.',
    pt: 'O pêndulo com quatro vezes mais fio leva o dobro do tempo em cada ida e volta — uma para cada duas dos curtos.',
  },
  'caption.meet': {
    ko: '셋이 처음 자리에서 다시 만났다. 짧은 두 추는 네 번, 긴 추는 두 번 — 질량은 박자를 바꾸지 않았다.',
    en: 'All three meet again where they started. The short two made four round trips, the long one two — the mass never changed the beat.',
    ja: '三つが最初の位置で再び出会う。短い二つは4往復、長い一つは2往復 — 質量は拍子を変えなかった。',
    zh: '三个摆在起点再次相遇。短的两个往返了四次，长的往返了两次 — 质量从未改变节拍。',
    ar: 'تلتقي الثلاثة مجددًا حيث بدأت. أتمّ القصيران أربع رحلات ذهاب وإياب، والطويل رحلتين — الكتلة لم تغيّر الإيقاع قط.',
    es: 'Los tres vuelven a encontrarse donde empezaron. Los dos cortos hicieron cuatro idas y vueltas; el largo, dos — la masa nunca cambió el compás.',
    fr: 'Les trois se retrouvent à leur point de départ. Les deux courts ont fait quatre allers-retours, le long deux — la masse n’a jamais changé la cadence.',
    hi: 'तीनों फिर वहीं मिलते हैं जहाँ से चले थे। छोटे दोनों ने चार बार आना-जाना किया, लंबे ने दो बार — द्रव्यमान ने ताल कभी नहीं बदली।',
    id: 'Ketiganya bertemu lagi di tempat mereka mulai. Dua yang pendek bolak-balik empat kali, yang panjang dua kali — massa tidak pernah mengubah irama.',
    pt: 'Os três se reencontram onde começaram. Os dois curtos fizeram quatro idas e voltas, o longo duas — a massa nunca mudou o compasso.',
  },
} satisfies Record<string, LocalizedText>);

export type SimplePendulumMessageKey = keyof typeof simplePendulumMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로 (C1). */
export const text = (key: SimplePendulumMessageKey): LocalizedText => simplePendulumMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: SimplePendulumMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const simplePendulumSchema: BundleSchema = {
  id: SIMPLE_PENDULUM_ID,
  label: text('label.title'),
  category: 'oscillation',
  description: text('label.description'),
  timeModel: 'periodic',
  parameters: [],
  stages: [
    {
      id: 'three-pendulums',
      label: text('label.stage'),
      constants: {
        g: G,
        shortLength: SHORT_LENGTH,
        lengthRatio: LENGTH_RATIO,
        amplitude: AMPLITUDE,
        massRatio: MASS_RATIO,
      },
    },
  ],
  environments: [],
  views: [{ id: 'beats', label: text('label.view'), default: true }],

  /**
   * 가로로 넓다 — 왼쪽 세 진자, 오른쪽 캡션. 세로는 긴 줄(1 m)과 횟수 줄이 쓴다.
   */
  canvas: { height: 380, minHeight: 340 },

  /** 도착한 순간 이미 흔들리는 중이다 (S-piece). */
  startAt: 0.4,

  /**
   * 한 주기 ≈ 5.6 초.
   *
   * - `swing1` · `swing2` — 흔드는 동안. 각각 **긴 진자의 한 주기**다. 둘로 나눈 것은
   *   캡션 때문이다 — 앞에서는 같은 줄의 두 추가 발을 맞추는 것을, 뒤에서는 긴 추가
   *   두 배 느린 것을 말한다. 흔드는 시계는 두 단계를 이어 센다.
   * - `meet` — 셋이 처음 자리에 모여 멈춰 있다. 횟수 점 4 · 4 · 2 가 남는다. 끝나면
   *   그 자리에서 다시 놓는다 — 흔드는 끝이 곧 놓는 자리라 이음매가 없다.
   *
   * 흔드는 단계의 길이는 스테이지 기본값에서 계산한 긴 주기다. 저작자가 스테이지에서
   * 줄 길이를 바꾸면 이 길이는 따라오지 않는다 (장부 G13).
   */
  timeline: {
    phases: [
      { id: 'swing1', duration: LONG_PERIOD, caption: key('caption.together') },
      { id: 'swing2', duration: LONG_PERIOD, caption: key('caption.slower') },
      { id: 'meet', duration: 1.6, caption: key('caption.meet') },
    ],
  },

  /** 슬롯 하나. 그림 오른쪽 빈 자리에 문장을 세운다. */
  caption: {
    anchor: { world: [CAPTION.x, CAPTION.y] },
    align: 'left',
    fontSize: CAPTION.fontSize,
    wrapWidth: CAPTION.wrapWidth,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  // 그리드 · 카메라 단추 · 제목 · 범례 없음(기본). 이 그림이 재는 것은 박자이지
  // 거리가 아니다 — 거리 눈금은 「진폭을 재라」 로 읽힌다 (S-piece).

  messages: simplePendulumMessages,
};
