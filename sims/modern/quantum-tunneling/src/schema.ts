// ========================================================================
// quantum-tunneling — 선언
// ========================================================================
// 질문: 에너지가 모자라 넘을 수 없는 벽을 입자가 지나갈 수 있는가.
//
// 답: 장벽 높이보다 에너지가 낮은 파동 묶음이 장벽을 치면 대부분 되튀지만, 파동은
// 장벽 안에서 끊기지 않고 지수적으로 줄어들 뿐이라 장벽 끝에 남은 만큼 일부가 너머로
// 나타난다. 줄어듦이 지수라서 장벽을 두 배로 두껍게 하면 지나가는 몫은 반이 아니라
// 몇 분의 일로 준다.
//
// 이웃 `particle-in-a-box`(끝없이 높은 벽 안의 준위)와 겹치지 않는다 — 거기서는 벽에서
// ψ 가 0 이고, 여기서는 **유한한** 벽 안으로 ψ 가 스며들어 건너편까지 닿는다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:quantum-tunneling` 와 문자 그대로 일치한다 (C4). */
export const QUANTUM_TUNNELING_ID = 'quantum-tunneling';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 단위는 ħ²/2m = 1 인 무차원 단위 — 파수 k = √E, 장벽 안 감쇠 κ = √(V₀ − E).
// 월드 가로 = 위치(같은 단위), 월드 세로 = 에너지 × `energyScale` 과 |ψ|² × `psiHeight`.
// ------------------------------------------------------------------------

/** 장벽 높이 V₀. */
export const BARRIER_HEIGHT = 1;
/** 파동 묶음의 에너지 E. 장벽 높이보다 낮다 — 고전적으로는 넘을 수 없다. */
export const ENERGY = 0.7;
/** 얇은 장벽의 두께 d. 이 값에서 투과가 약 0.40 이다. */
export const BARRIER_WIDTH = 1.77;
/** 두꺼운 장벽의 두께 배수 — 아래 레인의 장벽은 d 의 이 배다. 이 값에서 투과는 약 0.068. */
export const WIDTH_RATIO = 2;
/** 파동 묶음 |ψ|² 의 표준편차(위치 폭). */
export const PACKET_SIGMA = 1.8;
/** 파동 묶음 중심이 한 주기 동안 가는 처음 · 끝 자리. 장벽 왼쪽 면이 x = 0 이다. */
export const PACKET_START = -12;
export const PACKET_END = 13;
/** |ψ|² 한 단위(들어오는 묶음의 봉우리)의 월드 높이 — 에너지 축과 단위가 다른 그림 배율이다. */
export const PSI_HEIGHT = 2;
/** 에너지 한 단위의 월드 높이. 장벽 꼭대기가 V₀ × 이 값에 놓인다. */
export const ENERGY_SCALE = 2;

// ------------------------------------------------------------------------
// 배치 — 월드 단위
// ------------------------------------------------------------------------

/** 두 레인 기준선 사이 거리(월드). 위가 얇은 장벽, 아래가 두꺼운 장벽. */
export const LANE_STRIDE = 11.2;
/** 레인 가로 끝(월드). 퍼텐셜 선 · E 선이 여기까지 간다. */
export const LANE_LEFT = -18.5;
export const LANE_RIGHT = 20;
/** 두께 치수선이 레인 기준선 아래로 내려간 거리(월드). */
export const WIDTH_DIM_DROP = 0.9;

/**
 * 프레이밍 — 왼쪽은 `V₀`, 오른쪽은 `E` 이름표, 아래는 두께 이름표와 캡션 자리, 위는 겹침 무늬의 가장 높은
 * 봉우리(두꺼운 장벽 쪽 (1 + |r|)² ≈ 3.9 배). 매 프레임 같은 값이다 (S-piece · 원칙 6).
 */
export const SCENE_BOUNDS = { minX: -20.5, maxX: 21.8, minY: -3.8, maxY: 19.4 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const quantumTunnelingMessages = Object.freeze({
  'label.title': {
    ko: '터널 효과',
    en: 'Quantum tunneling',
    ja: 'トンネル効果',
    zh: '量子隧穿',
    ar: 'النفق الكمومي',
    es: 'Efecto túnel cuántico',
    fr: 'Effet tunnel quantique',
    hi: 'क्वांटम सुरंगन',
    id: 'Penerowongan kuantum',
    pt: 'Tunelamento quântico',
  },
  'label.operation': {
    ko: '장벽을 통과하는 확률',
    en: 'The chance of passing through a barrier',
    ja: '障壁を通り抜ける確率',
    zh: '穿过势垒的概率',
    ar: 'احتمال عبور الحاجز',
    es: 'La probabilidad de atravesar una barrera',
    fr: 'La probabilité de traverser une barrière',
    hi: 'अवरोध के पार जाने की प्रायिकता',
    id: 'Probabilitas menembus penghalang',
    pt: 'A probabilidade de atravessar uma barreira',
  },
  'label.stage': {
    ko: '두께가 다른 두 장벽',
    en: 'Two barriers of different thickness',
    ja: '厚さの違う二つの障壁',
    zh: '厚度不同的两个势垒',
    ar: 'حاجزان مختلفا السُّمك',
    es: 'Dos barreras de distinto grosor',
    fr: 'Deux barrières d’épaisseurs différentes',
    hi: 'अलग-अलग मोटाई के दो अवरोध',
    id: 'Dua penghalang dengan ketebalan berbeda',
    pt: 'Duas barreiras de espessuras diferentes',
  },
  'label.view': {
    ko: '장벽과 확률 밀도',
    en: 'Barrier and probability density',
    ja: '障壁と確率密度',
    zh: '势垒与概率密度',
    ar: 'الحاجز وكثافة الاحتمال',
    es: 'Barrera y densidad de probabilidad',
    fr: 'Barrière et densité de probabilité',
    hi: 'अवरोध और प्रायिकता घनत्व',
    id: 'Penghalang dan rapat probabilitas',
    pt: 'Barreira e densidade de probabilidade',
  },

  /** 에너지 · 장벽 높이 기호 — 표식이라 두 언어가 같다 (C1). */
  'label.energy': {
    ko: 'E',
    en: 'E',
    ja: 'E',
    zh: 'E',
    ar: 'E',
    es: 'E',
    fr: 'E',
    hi: 'E',
    id: 'E',
    pt: 'E',
  },
  'label.barrier': {
    ko: 'V₀',
    en: 'V₀',
    ja: 'V₀',
    zh: 'V₀',
    ar: 'V₀',
    es: 'V₀',
    fr: 'V₀',
    hi: 'V₀',
    id: 'V₀',
    pt: 'V₀',
  },
  /** 장벽 두께 — 얇은 쪽은 계수 없이 d. */
  'label.widthOne': {
    ko: 'd',
    en: 'd',
    ja: 'd',
    zh: 'd',
    ar: 'd',
    es: 'd',
    fr: 'd',
    hi: 'd',
    id: 'd',
    pt: 'd',
  },
  'label.width': {
    ko: '{k}d',
    en: '{k}d',
    ja: '{k}d',
    zh: '{k}d',
    ar: '{k}d',
    es: '{k}d',
    fr: '{k}d',
    hi: '{k}d',
    id: '{k}d',
    pt: '{k}d',
  },

  'caption.approach': {

    ko: '장벽보다 에너지가 낮은 파동 묶음이, 두께만 다른 두 장벽으로 다가간다.',

    en: 'A wave packet with less energy than the barrier heads for two barriers that differ only in thickness.',

    ja: '障壁よりエネルギーの低い波束が、厚さだけが違う二つの障壁に向かっていく。',

    zh: '能量低于势垒的波包，正奔向只有厚度不同的两个势垒。',

    ar: 'حزمة موجية طاقتها أقل من الحاجز تتجه نحو حاجزين لا يختلفان إلا في السُّمك.',

    es: 'Un paquete de ondas con menos energía que la barrera se dirige hacia dos barreras que solo difieren en el grosor.',

    fr: 'Un paquet d’ondes d’énergie inférieure à la barrière se dirige vers deux barrières qui ne diffèrent que par l’épaisseur.',

    hi: 'अवरोध से कम ऊर्जा वाला एक तरंग पैकेट ऐसे दो अवरोधों की ओर बढ़ता है जो केवल मोटाई में भिन्न हैं।',

    id: 'Paket gelombang dengan energi lebih kecil daripada penghalang menuju dua penghalang yang hanya berbeda ketebalannya.',

    pt: 'Um pacote de ondas com menos energia que a barreira segue rumo a duas barreiras que diferem apenas na espessura.',

  },
  'caption.hit': {
    ko: '파동은 장벽 안에서 끊기지 않고 지수적으로 줄어든다 — 두꺼운 장벽은 끝에 닿기 전에 거의 다 줄인다.',
    en: 'Inside the barrier the wave does not stop — it shrinks exponentially. The thick barrier shrinks it almost to nothing before the far side.',
    ja: '障壁の中で波は途切れない — 指数関数的に小さくなる。厚い障壁は向こう側に届く前にほとんど消してしまう。',
    zh: '在势垒内部波并不中断——它按指数衰减。厚势垒在波到达另一侧之前就几乎把它衰减殆尽。',
    ar: 'داخل الحاجز لا تتوقف الموجة — بل تتضاءل أُسّيًا. والحاجز السميك يُضائلها حتى تكاد تنعدم قبل الجانب البعيد.',
    es: 'Dentro de la barrera la onda no se detiene — se reduce exponencialmente. La barrera gruesa la reduce casi a nada antes del lado opuesto.',
    fr: 'Dans la barrière, l’onde ne s’arrête pas — elle décroît exponentiellement. La barrière épaisse la réduit presque à rien avant l’autre côté.',
    hi: 'अवरोध के भीतर तरंग रुकती नहीं — वह चरघातांकी रूप से घटती है। मोटा अवरोध दूसरी ओर पहुँचने से पहले उसे लगभग शून्य कर देता है।',
    id: 'Di dalam penghalang gelombang tidak berhenti — ia menyusut secara eksponensial. Penghalang tebal menyusutkannya hampir habis sebelum sisi seberang.',
    pt: 'Dentro da barreira a onda não para — ela diminui exponencialmente. A barreira grossa a reduz quase a nada antes do outro lado.',
  },
  'caption.split': {
    ko: '대부분은 되튀지만, 장벽 끝에 남아 있던 만큼 일부가 벽 너머에 나타난다.',
    en: 'Most of it bounces back, but whatever was left at the far edge appears beyond the wall.',
    ja: '大部分は跳ね返るが、障壁の端に残っていた分だけ、一部が壁の向こうに現れる。',
    zh: '大部分被弹回，但在势垒远端残留下来的那部分会出现在壁的另一侧。',
    ar: 'يرتدّ معظمها، لكن ما تبقّى منها عند الحافة البعيدة يظهر خلف الجدار.',
    es: 'La mayor parte rebota, pero lo que quedaba en el borde opuesto aparece más allá de la pared.',
    fr: 'L’essentiel rebondit, mais ce qui restait au bord opposé apparaît au-delà de la paroi.',
    hi: 'अधिकांश भाग वापस उछल जाता है, पर दूर वाले किनारे पर जितना बचा था वह दीवार के पार प्रकट होता है।',
    id: 'Sebagian besar terpantul kembali, tetapi apa yang tersisa di tepi seberang muncul di balik dinding.',
    pt: 'A maior parte ricocheteia, mas o que restava na borda oposta aparece além da parede.',
  },
  'caption.compare': {
    ko: '두께를 {ratio}배로 했을 뿐인데, 너머로 간 몫은 그만큼이 아니라 몇 분의 일로 줄었다.',
    en: 'Only the thickness went ×{ratio}, yet the share that got through fell far more than that — to a small fraction.',
    ja: '厚さを ×{ratio} にしただけなのに、向こうへ抜けた分はそれよりはるかに大きく減った — ほんのわずかに。',
    zh: '只是把厚度变为 ×{ratio}，穿过去的份额却远不止减少这么多——只剩一小部分。',
    ar: 'لم يتغيّر إلا السُّمك فصار ×{ratio}، ومع ذلك انخفضت الحصة التي عبرت أكثر من ذلك بكثير — إلى جزء صغير.',
    es: 'Solo el grosor pasó a ×{ratio}, pero la parte que atravesó cayó mucho más que eso — a una pequeña fracción.',
    fr: 'Seule l’épaisseur est passée à ×{ratio}, pourtant la part qui a traversé a chuté bien plus — jusqu’à une petite fraction.',
    hi: 'केवल मोटाई ×{ratio} हुई, फिर भी पार जाने वाला हिस्सा उससे कहीं अधिक घटा — एक छोटे अंश तक।',
    id: 'Hanya ketebalannya yang menjadi ×{ratio}, tetapi bagian yang lolos turun jauh lebih banyak — tinggal sebagian kecil.',
    pt: 'Só a espessura passou a ×{ratio}, mas a parte que atravessou caiu muito mais do que isso — para uma pequena fração.',
  },
} satisfies Record<string, LocalizedText>);

export type QuantumTunnelingMessageKey = keyof typeof quantumTunnelingMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로 (C1). */
export const text = (key: QuantumTunnelingMessageKey): LocalizedText => quantumTunnelingMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: QuantumTunnelingMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const quantumTunnelingSchema: BundleSchema = {
  id: QUANTUM_TUNNELING_ID,
  label: text('label.title'),
  category: 'modern',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다. 두께를 바꿔 보는 일은 두 레인이 나란히 이미 하고 있다 — 슬라이더로
  // 한 레인의 두께를 밀면 「두 배에 몇 분의 일」 을 기억으로 견주어야 한다.
  parameters: [],

  stages: [
    {
      id: 'two-barriers',
      label: text('label.stage'),
      constants: {
        barrierHeight: BARRIER_HEIGHT,
        energy: ENERGY,
        barrierWidth: BARRIER_WIDTH,
        widthRatio: WIDTH_RATIO,
        packetSigma: PACKET_SIGMA,
        packetStart: PACKET_START,
        packetEnd: PACKET_END,
        psiHeight: PSI_HEIGHT,
        energyScale: ENERGY_SCALE,
      },
    },
  ],

  environments: [],

  views: [{ id: 'barriers', label: text('label.view'), default: true }],

  /** 레인 둘이 위아래로 선다. 아래 캡션 한 줄 반. */
  canvas: { height: 440, minHeight: 380 },

  /** 장벽 · 퍼텐셜 선을 먼저, 그 위에 E 선 · |ψ|², 맨 위에 두께 치수와 기호. */
  drawOrder: 'scene',

  /**
   * 한 주기 12.8 초.
   *
   * 파동 묶음 중심은 `enter` 시작에서 `fade` 끝까지 **같은 빠르기로** `packetStart` 에서
   * `packetEnd` 로 간다. 단계는 그 길 위에서 캡션이 말을 바꾸는 자리일 뿐이다 —
   * `approach`(다가감) · `hit`(장벽에 걸침, 장벽 안 감쇠가 보임) · `split`(되튄 묶음과
   * 너머의 묶음이 갈라져 멀어짐) · `compare`(두 레인의 너머 몫을 견줌).
   * `hit` 이 묶음이 장벽에 걸친 구간과 맞으려면 단계 길이와 처음 · 끝 자리가 짝이어야
   * 하는데 그 관계를 선언할 자리가 없다 (장부 G129 · G143).
   * `enter` · `fade` 는 주기 이음매에서 묶음이 불쑥 나타나거나 사라지지 않게 한다.
   */
  timeline: {
    phases: [
      { id: 'enter', duration: 0.6, ease: 'smooth', caption: key('caption.approach') },
      { id: 'approach', duration: 3.6, caption: key('caption.approach') },
      { id: 'hit', duration: 3.4, caption: key('caption.hit') },
      { id: 'split', duration: 2.8, caption: key('caption.split') },
      { id: 'compare', duration: 1.6, caption: key('caption.compare') },
      { id: 'fade', duration: 0.8, ease: 'smooth', caption: key('caption.compare') },
    ],
  },

  /** 도착한 순간 묶음이 이미 장벽 쪽으로 달리고 있다. */
  startAt: 1.2,

  /** 슬롯 하나. 아래 레인 밑 왼쪽. */
  caption: {
    anchor: { screen: 'bottom-left', offset: [16, -6] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 820,
    style: { colorRole: 'ink', emphasis: 'strong' },
    fade: 0.25,
    // 문안의 배수는 스테이지 상수에서 온다 — initialState 가 글자로 옮겨 둔 state 경로 (G133).
    vars: { ratio: 'ratio' },
  },

  // 그리드 · 카메라 단추 · 범례 · 제목 없음(기본). 잴 것은 월드 거리가 아니라 봉우리의 크기다.

  messages: quantumTunnelingMessages,
};
