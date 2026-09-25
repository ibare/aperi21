// ========================================================================
// photoelectric-effect — 선언
// ========================================================================
// 질문: 빛을 세게 비추면 금속에서 전자가 나올까.
//
// 빨간빛은 아무리 세게 비춰도 전자가 하나도 나오지 않는다 — 광자가 더 쏟아질 뿐, 광자
// 하나가 전자 하나에게 주는 몫은 그대로라 모자란 채다. 진동수가 높은 보랏빛은 약하게
// 비춰도 닿자마자 전자가 튀어나온다. 세기는 튀어나오는 전자 **수**를, 진동수는 전자
// **하나의 에너지**를 정한다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// 문턱을 넘는 순간과 저지 전압 그래프는 `work-function-and-threshold` 의 몫이라 두지 않는다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:photoelectric-effect` 와 문자 그대로 일치한다 (C4). */
export const PHOTOELECTRIC_EFFECT_ID = 'photoelectric-effect';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 금속의 일함수(eV) — 전자 하나가 표면을 빠져나오는 데 드는 에너지. 나트륨 무렵. */
export const WORK_FUNCTION_EV = 2.3;
/** 빨간빛 · 보랏빛의 파장(nm). 광자 색과 물결 간격이 여기서 나온다. */
export const LAMBDA_RED_NM = 650;
export const LAMBDA_VIOLET_NM = 405;
/**
 * 광자 하나의 에너지(eV) — 화면에 띄우는 정박값이다. 1240 / λ 를 유효숫자 둘로 둔 값이라
 * 파장을 바꾸면 이것도 함께 바꾼다 (NOTES (c) — 상수 사이의 관계를 선언할 자리가 없다).
 */
export const PHOTON_EV_RED = 1.9;
export const PHOTON_EV_VIOLET = 3.1;
/** 램프가 내보내는 광자 수(개/초) — 약하게 · 세게. 세기는 이 수 하나다. */
export const RATE_DIM = 2.5;
export const RATE_BRIGHT = 10;
/** 광자가 나는 빠르기(월드/초). 빛의 속력이 아니라 눈으로 따라갈 수 있는 빠르기다. */
export const PHOTON_SPEED = 5;
/**
 * 물결 간격 배율(월드/nm). 파장을 화면에 보이는 크기로 키운다 — 650 nm 가 0.21 월드.
 * 화면에 알리지 않는다: 두 빛의 간격 **비**가 주장이고 절대 길이는 뜻이 없다 (NOTES (b)).
 */
export const WAVE_SCALE = 0.00032;
/**
 * 전자를 표면 쪽으로 되끌어 당기는 가상의 끌림(월드/초²). 일함수를 「표면까지의 높이」 로
 * 보이는 척도다 — 이 끌림 아래서 광자 에너지 E 를 받은 전자는 깊이 × E / W 만큼 오른다.
 */
export const BARRIER_PULL = 11;
/** 튀어나간 전자가 빈자리를 남기는 시간(초). 금속이 전자를 다시 채운다. */
export const REFILL_SECONDS = 0.5;
/** 광자 일정 · 겨냥 자리를 뽑는 시드. 같은 시드 · 같은 주기는 언제나 같은 화면이다. */
export const SEED = 7;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 금속 윗면이 y = 0.
// ------------------------------------------------------------------------

/** 금속판. 윗면이 표면이다. */
export const METAL = { x0: -4.3, x1: 4.3, top: 0, bottom: -0.85 } as const;
/** 전자가 쉬는 깊이(표면 아래) · 자리 간격 · 자리 수. */
export const ELECTRON_DEPTH = 0.42;
export const SITE_GAP = 0.4;
export const SITE_COUNT = 21;
/** 빛이 닿는 자리 번호 범위(포함). 램프 아래 오른쪽으로 비스듬히 떨어진다. */
export const BEAM_SITES = { first: 6, last: 17 } as const;
/** 램프(빛이 나오는 구멍의 가운데). */
export const LAMP = { x: -3.3, y: 2.35 } as const;
/** 튀어나간 전자가 기우는 각(연직에서, 라디안) 범위 — 빛줄기와 반대인 오른쪽 위로. */
export const EJECT_TILT = { min: 0.3, max: 0.7 } as const;

/**
 * 캡션 자리(월드). 캡션 슬롯은 프레이밍 여백으로 잡히지 않아(장부 G24) 경계에 직접 더한다.
 */
export const CAPTION_BAND = 0.5;

/** 프레이밍은 고정 — 금속판 아래 캡션 띠부터 램프 위 · 튀어나간 전자가 빠져나가는 위까지. */
export const SCENE_BOUNDS = {
  minX: -4.6,
  maxX: 4.6,
  minY: METAL.bottom - 0.15 - CAPTION_BAND,
  maxY: 3.05,
} as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이(초)
// ------------------------------------------------------------------------

export const PHASE_RED_DIM = 3.5;
export const PHASE_RED_BRIGHT = 4.5;
export const PHASE_VIOLET_DIM = 5;
export const PHASE_VIOLET_BRIGHT = 4.5;
export const PHASE_FADE = 0.8;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const photoelectricEffectMessages = Object.freeze({
  'label.title': {
    ko: '광전 효과',
    en: 'Photoelectric effect',
    ja: '光電効果',
    zh: '光电效应',
    ar: 'التأثير الكهروضوئي',
    es: 'Efecto fotoeléctrico',
    fr: 'Effet photoélectrique',
    hi: 'प्रकाश-विद्युत प्रभाव',
    id: 'Efek fotolistrik',
    pt: 'Efeito fotoelétrico',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '빛의 입자성 증거',
    en: 'Evidence that light comes in particles',
    ja: '光が粒子としてやってくる証拠',
    zh: '光以粒子形式到来的证据',
    ar: 'دليل على أن الضوء يأتي على هيئة جسيمات',
    es: 'Prueba de que la luz llega en partículas',
    fr: 'Preuve que la lumière arrive par particules',
    hi: 'इस बात का प्रमाण कि प्रकाश कणों के रूप में आता है',
    id: 'Bukti bahwa cahaya datang sebagai partikel',
    pt: 'Evidência de que a luz vem em partículas',
  },
  'label.stage': {
    ko: '나트륨 금속',
    en: 'Sodium metal',
    ja: 'ナトリウム金属',
    zh: '金属钠',
    ar: 'فلز الصوديوم',
    es: 'Sodio metálico',
    fr: 'Sodium métallique',
    hi: 'सोडियम धातु',
    id: 'Logam natrium',
    pt: 'Sódio metálico',
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
  /** 광자 하나가 나르는 에너지. 값은 선언한 정박값을 끼운다 (C1 · S-piece 유효숫자). */
  'label.photonEnergy': {
    ko: '광자 하나 {e} eV',
    en: 'one photon {e} eV',
    ja: '光子一つ {e} eV',
    zh: '一个光子 {e} eV',
    ar: 'فوتون واحد {e} eV',
    es: 'un fotón {e} eV',
    fr: 'un photon {e} eV',
    hi: 'एक फोटॉन {e} eV',
    id: 'satu foton {e} eV',
    pt: 'um fóton {e} eV',
  },
  /** 금속의 일함수. */
  'label.workFunction': {
    ko: '빠져나오는 데 {w} eV',
    en: '{w} eV to escape',
    ja: '抜け出すのに {w} eV',
    zh: '逸出需要 {w} eV',
    ar: '{w} eV للإفلات',
    es: '{w} eV para escapar',
    fr: '{w} eV pour s’échapper',
    hi: 'बाहर निकलने के लिए {w} eV',
    id: '{w} eV untuk lepas',
    pt: '{w} eV para escapar',
  },
  'label.metal': {
    ko: '금속',
    en: 'metal',
    ja: '金属',
    zh: '金属',
    ar: 'فلز',
    es: 'metal',
    fr: 'métal',
    hi: 'धातु',
    id: 'logam',
    pt: 'metal',
  },
  'caption.redDim': {
    ko: '빨간빛의 광자를 받은 전자가 튀어 오르지만 표면에 못 미치고 되돌아간다',
    en: 'An electron hit by a red photon jumps up but falls short of the surface and sinks back',
    ja: '赤い光の光子を受けた電子は跳び上がるが、表面に届かず沈み戻る',
    zh: '被红光光子击中的电子向上跃起，却够不到表面，又沉了回去',
    ar: 'إلكترون يصيبه فوتون أحمر يقفز إلى أعلى لكنه لا يبلغ السطح فيهبط عائدًا',
    es: 'Un electrón alcanzado por un fotón rojo salta, pero no llega a la superficie y vuelve a hundirse',
    fr: 'Un électron frappé par un photon rouge bondit, mais n’atteint pas la surface et retombe',
    hi: 'लाल फोटॉन से टकराया इलेक्ट्रॉन ऊपर उछलता है पर सतह तक नहीं पहुँचता और वापस डूब जाता है',
    id: 'Elektron yang terkena foton merah melompat naik tetapi tak sampai ke permukaan dan tenggelam kembali',
    pt: 'Um elétron atingido por um fóton vermelho salta, mas não alcança a superfície e afunda de volta',
  },
  'caption.redBright': {
    ko: '빨간빛을 세게 해 광자가 쏟아져도 전자는 하나도 나오지 않는다',
    en: 'Brighter red light pours in more photons, yet not a single electron gets out',
    ja: '赤い光を強くして光子が降り注いでも、電子は一つも出てこない',
    zh: '红光调亮后光子倾泻而下，却没有一个电子出来',
    ar: 'ضوء أحمر أشد يصب فوتونات أكثر، ومع ذلك لا يخرج إلكترون واحد',
    es: 'Una luz roja más intensa vierte más fotones, pero no sale ni un solo electrón',
    fr: 'Une lumière rouge plus intense déverse plus de photons, mais pas un seul électron ne sort',
    hi: 'तेज़ लाल प्रकाश और अधिक फोटॉन बरसाता है, फिर भी एक भी इलेक्ट्रॉन बाहर नहीं निकलता',
    id: 'Cahaya merah yang lebih terang mencurahkan lebih banyak foton, namun tak satu pun elektron keluar',
    pt: 'Uma luz vermelha mais intensa despeja mais fótons, mas nem um único elétron sai',
  },
  'caption.violetDim': {
    ko: '진동수가 높은 보랏빛은 약하게 비춰도 닿자마자 전자가 튀어나온다',
    en: 'Higher-frequency violet light knocks electrons out the moment it lands, even when dim',
    ja: '振動数の高い紫の光は、弱くても当たった瞬間に電子をたたき出す',
    zh: '频率更高的紫光即使很弱，一照到就把电子打出来',
    ar: 'الضوء البنفسجي الأعلى ترددًا يقتلع الإلكترونات لحظة سقوطه، حتى وهو خافت',
    es: 'La luz violeta, de mayor frecuencia, arranca electrones en cuanto llega, aunque sea tenue',
    fr: 'La lumière violette, de fréquence plus élevée, arrache des électrons dès qu’elle arrive, même faible',
    hi: 'अधिक आवृत्ति वाला बैंगनी प्रकाश मंद होने पर भी पड़ते ही इलेक्ट्रॉन बाहर निकाल देता है',
    id: 'Cahaya ungu berfrekuensi lebih tinggi langsung melepaskan elektron begitu tiba, meski redup',
    pt: 'A luz violeta, de frequência mais alta, arranca elétrons no instante em que chega, mesmo fraca',
  },
  'caption.violetBright': {
    ko: '보랏빛을 세게 하면 나오는 전자가 많아질 뿐, 하나하나의 빠르기는 그대로다',
    en: 'Brighter violet light frees more electrons, but each one leaves just as fast',
    ja: '紫の光を強くすると出てくる電子が増えるだけで、一つ一つの速さは変わらない',
    zh: '紫光调亮后逸出的电子变多，但每个电子离开的速度不变',
    ar: 'الضوء البنفسجي الأشد يحرر إلكترونات أكثر، لكن كل واحد منها يغادر بالسرعة نفسها',
    es: 'Una luz violeta más intensa libera más electrones, pero cada uno sale igual de rápido',
    fr: 'Une lumière violette plus intense libère plus d’électrons, mais chacun part tout aussi vite',
    hi: 'तेज़ बैंगनी प्रकाश अधिक इलेक्ट्रॉन मुक्त करता है, पर हर एक उतनी ही चाल से निकलता है',
    id: 'Cahaya ungu yang lebih terang membebaskan lebih banyak elektron, tetapi masing-masing pergi sama cepatnya',
    pt: 'Uma luz violeta mais intensa libera mais elétrons, mas cada um sai com a mesma rapidez',
  },
} satisfies Record<string, LocalizedText>);

export type PhotoelectricEffectMessageKey = keyof typeof photoelectricEffectMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: PhotoelectricEffectMessageKey): LocalizedText => photoelectricEffectMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: PhotoelectricEffectMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const photoelectricEffectSchema: BundleSchema = {
  id: PHOTOELECTRIC_EFFECT_ID,
  label: text('label.title'),
  category: 'modern',
  description: text('label.description'),
  timeModel: 'periodic',

  // 조작기가 없다 — 한 주기 안에 「세게 해도 안 나온다」 와 「약해도 나온다」 가 모두 일어난다.
  parameters: [],

  stages: [
    {
      id: 'sodium',
      label: text('label.stage'),
      constants: {
        workFunction: WORK_FUNCTION_EV,
        lambdaRed: LAMBDA_RED_NM,
        lambdaViolet: LAMBDA_VIOLET_NM,
        photonEvRed: PHOTON_EV_RED,
        photonEvViolet: PHOTON_EV_VIOLET,
        rateDim: RATE_DIM,
        rateBright: RATE_BRIGHT,
        photonSpeed: PHOTON_SPEED,
        waveScale: WAVE_SCALE,
        barrierPull: BARRIER_PULL,
        refillSeconds: REFILL_SECONDS,
        seed: SEED,
      },
    },
  ],

  environments: [],

  views: [{ id: 'main', label: text('label.view'), default: true }],

  /** 가로로 넓은 금속판 한 장 · 램프 · 캡션 한 줄. 세로가 비싸다 (S-piece). 마운트 뒤 바뀌지 않는다. */
  canvas: { height: 400, minHeight: 340 },

  /**
   * 겹침이 판정 장치다 — 전자는 금속판 **위**에 비쳐 보여야 「안에 있다」 로 읽히고, 빛줄기는
   * 광자 뒤에 깔려야 한다. 층 순서로는 `region` 이 물체 위로 올라온다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 빨강 약하게 → 빨강 세게 → 보라 약하게 → 보라 세게 → 흐려짐.
   *
   * 단계마다 램프의 색 · 세기가 다르다. 단계 id 에서 색 · 세기로 가는 짝은 physics 의
   * `EMISSION` 이 안다 — 단계에 값을 실을 자리가 없다 (장부 G13).
   */
  timeline: {
    phases: [
      { id: 'red-dim', duration: PHASE_RED_DIM, caption: key('caption.redDim') },
      { id: 'red-bright', duration: PHASE_RED_BRIGHT, caption: key('caption.redBright') },
      { id: 'violet-dim', duration: PHASE_VIOLET_DIM, caption: key('caption.violetDim') },
      { id: 'violet-bright', duration: PHASE_VIOLET_BRIGHT, caption: key('caption.violetBright') },
      { id: 'fade', duration: PHASE_FADE, caption: key('caption.violetBright') },
    ],
  },

  /**
   * 도착한 순간 이미 진행 중이다 — 첫 빨간 광자가 금속에 닿아 전자가 튀어 오르는 자리에서 연다.
   * 0 이면 광자가 아직 램프에서 날아가는 중이라 빈 금속이 먼저 보인다.
   */
  startAt: 1.6,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 에너지 식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -6] },
    fontSize: 13,
    wrapWidth: 760,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  messages: photoelectricEffectMessages,
};
