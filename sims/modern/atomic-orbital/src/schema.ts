// ========================================================================
// atomic-orbital — 선언
// ========================================================================
// 질문: 교과서의 궤도 그림(아령 모양 구름)은 전자가 도는 길인가, 무엇을 그린 것인가.
//
// 답의 동사: 쌓인다. 잴 때마다 전자는 한 자리에서만 발견되고, 그 자리들이 쌓인
// 분포가 구름이다.
//
// 원본: tasks/piece-lab/atomic-orbital (손으로 짠 캔버스 한 장).
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:atomic-orbital` 와 문자 그대로 일치한다 (C4). */
export const ATOMIC_ORBITAL_ID = 'atomic-orbital';

// ------------------------------------------------------------------------
// 1. 궤도
// ------------------------------------------------------------------------

/** 고를 수 있는 궤도. 조작기가 state 의 `orbital` 에 적는 값이다. */
export const ORBITAL_KEYS = ['1s', '2p', '3d'] as const;
export type OrbitalKey = (typeof ORBITAL_KEYS)[number];

/** 기본 궤도. 누르지 않아도 이것으로 주장이 끝난다. */
export const DEFAULT_ORBITAL: OrbitalKey = '2p';

/**
 * 궤도마다 95% 반경(보어 반지름 단위). 이 반경이 화면 세로의 `FRAME.fill` 에 오도록
 * 궤도마다 따로 확대한다 — 크기 비교는 이 조각의 주장이 아니다 (NOTES 「두지 않은 것」).
 */
export const ORBITAL_REACH: Record<OrbitalKey, number> = { '1s': 3.2, '2p': 9.2, '3d': 17.7 };

// ------------------------------------------------------------------------
// 2. 측정 — 발견 자리가 쌓이는 빠르기 (스테이지 상수, 저작자가 바꾼다)
// ------------------------------------------------------------------------

/**
 * 측정률 곡선 · 상한 · 캡션 구간.
 *
 * 처음 `slowFor` 초는 초당 `slowRate` 번만 재서 한 점씩 찍히는 것을 보이고, 그 뒤
 * `growth` 로 지수적으로 올려 `maxRate` 에서 멈춘다. 발견 수는 이 곡선의 **적분**이라
 * 시간표 단계가 아니라 `step` 이 쌓는다 (NOTES 「어휘 부족」).
 */
export const MEASURE = {
  /** 쌓을 수 있는 발견 자리 상한. */
  cap: 9000,
  /** 처음 한 점씩 찍히는 동안의 측정률(초당). */
  slowRate: 3,
  /** 그 구간의 길이(초). */
  slowFor: 3.5,
  /** 지수 증가율(1/초). */
  growth: 1.13,
  /** 측정률 상한(초당). */
  maxRate: 1500,
  /** 캡션 첫 문장이 이 수 미만에서. */
  fewBelow: 30,
  /** 캡션 둘째 문장이 이 수 미만에서. */
  formingBelow: 2000,
} as const;

/**
 * 도착한 순간 이미 몇 번 측정된 상태(초). 궤도를 바꿔 다시 쌓을 때도 같은 만큼 앞서
 * 시작한다 — 원본 `TAU0`.
 */
export const HEAD_START = 1.0;

/** 발견 자리를 뽑는 시드. 같은 시각은 언제나 같은 화면이다 (원본 하네스 기본 시드). */
export const SAMPLE_SEED = 1;

/** 방금 발견된 자리로 보이는 시간. 수명 = min(`maxLife`, `perRate` / 측정률). */
export const FLASH = {
  /** 한 점씩 찍힐 때의 수명(초). */
  maxLife: 0.5,
  /** 빨라져도 동시에 강조되는 개수가 이만큼이 되게 줄인다. */
  perRate: 12,
  /** 측정률이 이보다 낮을 때만 퍼지는 고리를 함께 그린다(초당). */
  ringBelowRate: 20,
  /** 점 반지름(화면 px) — 고리가 있을 때 · 없을 때. */
  dotWithRing: 3.2,
  dotAlone: 2,
  /** 수명 끝에서 점이 옅어지는 몫(알파 1 → 1 − fade). */
  fade: 0.6,
  /** 고리 반지름(화면 px) — 시작과 끝. */
  ringFrom: 4,
  ringTo: 20,
  /** 고리 굵기(화면 px). */
  ringWidth: 1.5,
} as const;

// ------------------------------------------------------------------------
// 3. 화면 — 원본 캔버스 px 를 월드 단위로 그대로 쓴다 (y 만 위로)
// ------------------------------------------------------------------------

export const FRAME = {
  /** 원본 캔버스 세로(px). 확대율 = refHeight · fill / reach. */
  refHeight: 380,
  fill: 0.46,
  /** 내려다보는 각(라디안). */
  pitch: 0.38,
  /** 좌우 흔들기 폭(라디안)과 각속도(1/초). 옆모습 주변에서만 흔든다. */
  swayAmp: 0.3,
  swayRate: 0.35,
  /** 깊이 단계 수. 앞일수록 크고 진하다. */
  bands: 5,
  /** 단계 b 의 사각 점 한 변(화면 px) = sizeBase + sizeStep · b. */
  sizeBase: 1.6,
  sizeStep: 0.3,
  /** 단계 b 의 불투명도 = alphaBase + alphaStep · b. */
  alphaBase: 0.3,
  alphaStep: 0.1,
  /** 핵 반지름(월드 = 원본 px). */
  nucleus: 2.5,
} as const;

/**
 * 프레이밍 틀. 러너는 네 변에 36 px(여백 24 + 패딩 12)를 비우고 틀을 맞추므로,
 * 캔버스 450 · 원점 35 px 위(`screenYBias`)에서 위쪽 가용 190 − 36 = 154 가 세로 반폭과
 * 같아 배율이 1 이 된다 — 원본 캔버스 380 의 가운데(190)에 핵이 온다.
 */
export const BOUNDS = { halfWidth: 180, halfHeight: 154 } as const;

// ------------------------------------------------------------------------
// 4. 화면 문안 — 저작자가 정한 1층 (C1)
// ------------------------------------------------------------------------

export const atomicOrbitalMessages = Object.freeze({
  'label.title': { ko: '원자 궤도', en: 'Atomic orbital', ja: '原子軌道', zh: '原子轨道', ar: 'الفلك الذري', es: 'Orbital atómico', fr: 'Orbitale atomique', hi: 'परमाणु कक्षक', id: 'Orbital atom', pt: 'Orbital atômico' },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '확률 분포로서의 전자',
    en: 'The electron as a probability distribution',
    ja: '確率分布としての電子',
    zh: '作为概率分布的电子',
    ar: 'الإلكترون بوصفه توزيعًا احتماليًا',
    es: 'El electrón como distribución de probabilidad',
    fr: 'L’électron comme distribution de probabilité',
    hi: 'प्रायिकता बंटन के रूप में इलेक्ट्रॉन',
    id: 'Elektron sebagai distribusi probabilitas',
    pt: 'O elétron como distribuição de probabilidade',
  },
  'label.stage': { ko: '수소 원자', en: 'Hydrogen atom', ja: '水素原子', zh: '氢原子', ar: 'ذرة الهيدروجين', es: 'Átomo de hidrógeno', fr: 'Atome d’hydrogène', hi: 'हाइड्रोजन परमाणु', id: 'Atom hidrogen', pt: 'Átomo de hidrogênio' },
  'label.view': { ko: '발견 자리', en: 'Detections', ja: '検出された位置', zh: '探测位置', ar: 'مواضع الرصد', es: 'Detecciones', fr: 'Détections', hi: 'संसूचन', id: 'Deteksi', pt: 'Detecções' },
  /** 궤도 기호 — 분야에서 원어로 통용되는 표식이라 두 언어가 같다. */
  'option.1s': { ko: '1s', en: '1s', ja: '1s', zh: '1s', ar: '1s', es: '1s', fr: '1s', hi: '1s', id: '1s', pt: '1s' },
  'option.2p': { ko: '2p', en: '2p', ja: '2p', zh: '2p', ar: '2p', es: '2p', fr: '2p', hi: '2p', id: '2p', pt: '2p' },
  'option.3d': { ko: '3d', en: '3d', ja: '3d', zh: '3d', ar: '3d', es: '3d', fr: '3d', hi: '3d', id: '3d', pt: '3d' },
  'caption.single': {
    ko: '잴 때마다 전자는 한 자리에서만 발견되고, 그 자리는 매번 다르다.',
    en: 'Each time we measure, the electron turns up in just one spot — and the spot is different every time.',
    ja: '測るたびに電子はただ一か所で見つかり、その場所は毎回違う。',
    zh: '每次测量，电子都只在一个位置被发现 — 而且每次的位置都不同。',
    ar: 'في كل مرة نقيس فيها، يظهر الإلكترون في موضع واحد فقط — والموضع يختلف في كل مرة.',
    es: 'Cada vez que medimos, el electrón aparece en un solo punto — y el punto es distinto cada vez.',
    fr: 'À chaque mesure, l’électron apparaît en un seul endroit — et cet endroit change à chaque fois.',
    hi: 'हर बार मापने पर इलेक्ट्रॉन केवल एक जगह मिलता है — और वह जगह हर बार अलग होती है।',
    id: 'Setiap kali kita mengukur, elektron muncul di satu titik saja — dan titiknya selalu berbeda.',
    pt: 'Cada vez que medimos, o elétron aparece em um só ponto — e o ponto é diferente a cada vez.',
  },
  'caption.forming': {
    ko: '발견된 자리가 쌓이면서, 자주 찍히는 곳과 거의 찍히지 않는 곳이 갈라진다.',
    en: 'As the detections pile up, places that are hit often separate from places that are hardly hit at all.',
    ja: '検出位置が積み重なるにつれて、よく当たる場所とほとんど当たらない場所が分かれていく。',
    zh: '随着探测位置不断累积，经常被击中的地方和几乎不被击中的地方分开了。',
    ar: 'مع تراكم مواضع الرصد، تنفصل الأماكن التي تُصاب كثيرًا عن الأماكن التي لا تكاد تُصاب.',
    es: 'A medida que se acumulan las detecciones, los lugares donde cae a menudo se separan de los lugares donde casi nunca cae.',
    fr: 'À mesure que les détections s’accumulent, les endroits souvent touchés se distinguent de ceux qui ne le sont presque jamais.',
    hi: 'जैसे-जैसे संसूचन जमा होते हैं, अक्सर मिलने वाली जगहें उन जगहों से अलग हो जाती हैं जहाँ वह शायद ही कभी मिलता है।',
    id: 'Seiring deteksi menumpuk, tempat yang sering terkena terpisah dari tempat yang hampir tidak pernah terkena.',
    pt: 'À medida que as detecções se acumulam, os lugares atingidos com frequência se separam dos que quase nunca são atingidos.',
  },
  'caption.formed': {
    ko: '쌓인 자리의 모양이 궤도다 — 전자가 도는 길이 아니라, 발견되는 분포.',
    en: 'The shape of the piled-up spots is the orbital — not a path the electron travels, but where it is found.',
    ja: '積み重なった位置の形が軌道だ — 電子がたどる道ではなく、見つかる場所の分布だ。',
    zh: '累积起来的位置所呈现的形状就是轨道 — 不是电子运行的路径，而是它被发现的地方。',
    ar: 'شكل المواضع المتراكمة هو الفلك — ليس مسارًا يسلكه الإلكترون، بل حيث يوجد.',
    es: 'La forma de los puntos acumulados es el orbital — no un camino que recorre el electrón, sino dónde se lo encuentra.',
    fr: 'La forme des points accumulés, c’est l’orbitale — non pas un chemin que parcourt l’électron, mais l’endroit où on le trouve.',
    hi: 'जमा हुई जगहों का आकार ही कक्षक है — इलेक्ट्रॉन के चलने का पथ नहीं, बल्कि वह जहाँ पाया जाता है।',
    id: 'Bentuk titik-titik yang menumpuk itulah orbital — bukan lintasan yang dilalui elektron, melainkan tempat ia ditemukan.',
    pt: 'A forma dos pontos acumulados é o orbital — não um caminho que o elétron percorre, mas onde ele é encontrado.',
  },
} satisfies Record<string, LocalizedText>);

export type AtomicOrbitalMessageKey = keyof typeof atomicOrbitalMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: AtomicOrbitalMessageKey): LocalizedText => atomicOrbitalMessages[key];

/** 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: AtomicOrbitalMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// 5. BundleSchema
// ------------------------------------------------------------------------

export const atomicOrbitalSchema: BundleSchema = {
  id: ATOMIC_ORBITAL_ID,
  label: text('label.title'),
  category: 'modern',
  description: text('label.description'),
  timeModel: 'statistical',
  parameters: [],
  stages: [{ id: 'hydrogen', label: text('label.stage'), constants: { ...MEASURE } }],
  environments: [],
  views: [{ id: 'detections', label: text('label.view'), default: true }],

  /** 원본 캔버스 380 px 아래로 캡션 · 궤도 고르기 한 줄. */
  canvas: { height: 450, minHeight: 380 },
  /** 원본 캔버스의 가운데(위에서 190 px)에 핵이 오게 원점을 35 px 올린다. */
  camera: { screenYBias: -35 },

  /**
   * 겹침 순서 — 쌓인 점, 그 위에 핵, 맨 위에 방금 발견된 자리. 원본이 그린 순서다.
   * 강조색 점이 핵에 가려지면 가운데 근처의 발견이 사라진다.
   */
  drawOrder: 'scene',

  /**
   * 도착한 순간 이미 서너 번 측정된 상태. 발견 자리는 누적이라 시계만 앞당기면 비어
   * 있으므로 `step` 을 실제로 굴린다 (`HEAD_START` 와 같은 값).
   */
  preroll: HEAD_START,

  /**
   * 캡션 슬롯 하나. 문장은 시각이 아니라 **쌓인 발견 수**로 갈린다 — 궤도를 바꾸면
   * 수가 비워져 첫 문장으로 돌아간다. 상한에서 발견이 멈춘 뒤에도 마지막 문장은
   * 새 발견을 주장하지 않는다.
   */
  caption: {
    anchor: { screen: 'bottom-left', offset: [16, -8] },
    align: 'left',
    fontSize: 15,
    style: { colorRole: 'ink', emphasis: 'strong' },
    cases: [
      { when: 'few', text: key('caption.single') },
      { when: 'forming', text: key('caption.forming') },
    ],
    text: key('caption.formed'),
  },

  messages: atomicOrbitalMessages,
};
