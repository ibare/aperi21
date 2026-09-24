// ========================================================================
// quantum-harmonic-oscillator — 선언
// ========================================================================
// 질문: 포물선 우물(용수철에 매인 입자) 속 에너지 준위는 어떻게 놓이고, 가장 낮은
// 준위는 우물 바닥에 닿는가.
//
// 답: 준위는 (n + ½)ħω 라 **같은 크기 ħω 가 벽돌처럼 쌓인다** — 이웃 `particle-in-a-box`
// 의 n² 사다리(위로 갈수록 벌어짐)와 반대다. 맨 아래 준위도 바닥(V = 0)에 닿지 않고
// 반 벽돌(½ħω) 떠 있다 — 영점 에너지. 한 층 오를 때마다 ψ 의 마디가 하나씩 는다.
//
// 동사: 같은 ħω 벽돌을 맨 위 준위에 내려놓을 때마다 그 윗면이 곧 다음 준위가 된다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:quantum-harmonic-oscillator` 와 문자 그대로 일치한다 (C4). */
export const QUANTUM_HARMONIC_OSCILLATOR_ID = 'quantum-harmonic-oscillator';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 월드 가로 = 위치(무차원 ξ × `xScale`), 월드 세로 = 에너지(ħω 단위 × `quantum`).
// ------------------------------------------------------------------------

/** ħω 한 칸의 월드 높이. 준위 n 은 (n + ½) 칸 높이에 놓인다. 벽돌 하나의 높이다. */
export const QUANTUM = 3;
/** 무차원 위치 ξ = x / x₀ 한 칸의 월드 폭. 우물 V = ½ ξ² ħω 의 가로 배율이다. */
export const X_SCALE = 2.8;
/**
 * 보일 준위 수(n = 0 … N − 1). 시간표의 `drop-n` · `grow-n` · `hold-n` 단계(n = 1 … N − 1)와
 * 짝이다 — 이 값을 바꾸면 단계도 함께 선언해야 한다 (NOTES 「어휘 부족」 G13).
 */
export const LEVEL_COUNT = 5;
/**
 * 준위 위에 얹는 ψ 의 높이(월드). 파동 함수의 크기는 에너지 축과 단위가 다른 그림 배율이다 —
 * 간격(`quantum`)의 절반보다 작아야 이웃 ψ 와 겹치지 않는다.
 */
export const PSI_HEIGHT = 1.2;
/**
 * ψ 를 긋는 ξ 범위(±). 가장 높은 준위(n = 4)의 고전 되돌이점 ξ = 3 너머로 스며든 꼬리까지
 * 담는다.
 */
export const PSI_RANGE = 4.5;

// ------------------------------------------------------------------------
// 배치 — 월드 단위
// ------------------------------------------------------------------------

/** 벽돌 기둥의 왼쪽 가장자리 x(월드). ψ 범위 오른쪽 끝 너머에 선다. */
export const BRICK_X = 14.4;
/** 벽돌 폭(월드). */
export const BRICK_WIDTH = 1.6;
/** 내려오는 벽돌이 출발하는 아래 가장자리 높이(월드). 가장 높은 준위보다 위다. */
export const BRICK_SPAWN_Y = 15;
/** 포물선이 가장 높은 ψ 위로 더 뻗는 길이(월드). */
export const WELL_OVERHANG = 0.8;

/**
 * 프레이밍 — 왼쪽은 `n = k` 이름표, 오른쪽은 벽돌 기둥과 `ħω` 이름표, 위는 내려오는 벽돌의
 * 출발 자리, 아래는 캡션 자리. 기본 준위 수(5, 맨 위 4½ ħω)가 들어가도록 처음부터 잡는다.
 * 매 프레임 같은 값이다 (S-piece — 프레이밍은 주장의 일부다).
 */
export const SCENE_BOUNDS = { minX: -15.8, maxX: 19.0, minY: -3.2, maxY: 18.6 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const quantumHarmonicOscillatorMessages = Object.freeze({
  'label.title': {
    ko: '양자 조화 진동자',
    en: 'Quantum harmonic oscillator',
    ja: '量子調和振動子',
    zh: '量子谐振子',
    ar: 'المتذبذب التوافقي الكمومي',
    es: 'Oscilador armónico cuántico',
    fr: 'Oscillateur harmonique quantique',
    hi: 'क्वांटम सरल आवर्ती दोलित्र',
    id: 'Osilator harmonik kuantum',
    pt: 'Oscilador harmônico quântico',
  },
  'label.operation': {
    ko: '등간격 준위와 영점 에너지',
    en: 'Evenly spaced levels and zero-point energy',
    ja: '等間隔の準位と零点エネルギー',
    zh: '等间距能级与零点能',
    ar: 'مستويات متساوية التباعد وطاقة نقطة الصفر',
    es: 'Niveles equiespaciados y energía del punto cero',
    fr: 'Niveaux équidistants et énergie de point zéro',
    hi: 'समान अंतराल वाले स्तर और शून्य-बिंदु ऊर्जा',
    id: 'Tingkat energi berjarak sama dan energi titik nol',
    pt: 'Níveis igualmente espaçados e energia de ponto zero',
  },
  'label.stage': {
    ko: '포물선 우물',
    en: 'Parabolic well',
    ja: '放物線形の井戸',
    zh: '抛物线势阱',
    ar: 'بئر على شكل قطع مكافئ',
    es: 'Pozo parabólico',
    fr: 'Puits parabolique',
    hi: 'परवलयिक कूप',
    id: 'Sumur parabola',
    pt: 'Poço parabólico',
  },
  'label.view': {
    ko: '준위와 파동 함수',
    en: 'Levels and wave functions',
    ja: '準位と波動関数',
    zh: '能级与波函数',
    ar: 'المستويات ودوال الموجة',
    es: 'Niveles y funciones de onda',
    fr: 'Niveaux et fonctions d’onde',
    hi: 'स्तर और तरंग फलन',
    id: 'Tingkat energi dan fungsi gelombang',
    pt: 'Níveis e funções de onda',
  },

  /** 준위 번호 — 기호라 두 언어가 같다(C1 표식). */
  'label.n': {
    ko: 'n = {n}',
    en: 'n = {n}',
    ja: 'n = {n}',
    zh: 'n = {n}',
    ar: 'n = {n}',
    es: 'n = {n}',
    fr: 'n = {n}',
    hi: 'n = {n}',
    id: 'n = {n}',
    pt: 'n = {n}',
  },
  /** 벽돌 하나의 크기 — 기호(C1 표식). */
  'label.quantum': {
    ko: 'ħω',
    en: 'ħω',
    ja: 'ħω',
    zh: 'ħω',
    ar: 'ħω',
    es: 'ħω',
    fr: 'ħω',
    hi: 'ħω',
    id: 'ħω',
    pt: 'ħω',
  },
  /** 바닥의 반 벽돌 — 영점 에너지. */
  'label.half': {
    ko: '½ħω',
    en: '½ħω',
    ja: '½ħω',
    zh: '½ħω',
    ar: '½ħω',
    es: '½ħω',
    fr: '½ħω',
    hi: '½ħω',
    id: '½ħω',
    pt: '½ħω',
  },
  /** 우물 퍼텐셜 — 기호(C1 표식). */
  'label.potential': {
    ko: 'V(x)',
    en: 'V(x)',
    ja: 'V(x)',
    zh: 'V(x)',
    ar: 'V(x)',
    es: 'V(x)',
    fr: 'V(x)',
    hi: 'V(x)',
    id: 'V(x)',
    pt: 'V(x)',
  },

  'caption.ground': {

    ko: '가장 낮은 준위도 우물 바닥에 닿지 않는다 — 바닥에서 반 칸(½ħω) 떠 있다.',

    en: 'Even the lowest level does not touch the bottom of the well — it floats half a step (½ħω) above it.',

    ja: '最も低い準位でさえ井戸の底には触れない — 底から半段(½ħω)浮いている。',

    zh: '即使最低的能级也不接触势阱底部——它比底部高出半级(½ħω)。',

    ar: 'حتى أدنى مستوى لا يلمس قاع البئر — إنه يطفو فوقه بنصف درجة (½ħω).',

    es: 'Ni siquiera el nivel más bajo toca el fondo del pozo — flota medio escalón (½ħω) por encima de él.',

    fr: 'Même le niveau le plus bas ne touche pas le fond du puits — il flotte un demi-palier (½ħω) au-dessus.',

    hi: 'सबसे निचला स्तर भी कूप के तल को नहीं छूता — वह उससे आधा पायदान (½ħω) ऊपर तैरता है।',

    id: 'Bahkan tingkat terendah tidak menyentuh dasar sumur — ia melayang setengah langkah (½ħω) di atasnya.',

    pt: 'Nem o nível mais baixo toca o fundo do poço — ele flutua meio degrau (½ħω) acima dele.',

  },
  'caption.drop': {
    ko: '같은 크기의 ħω 벽돌 하나를 맨 위 준위에 내려놓는 중.',
    en: 'Setting one more ħω brick, the same size as the rest, on the top level.',
    ja: 'ほかと同じ大きさの ħω ブロックをもう一つ、いちばん上の準位に載せているところ。',
    zh: '正把又一块与其他一样大的 ħω 砖块放到最上面的能级上。',
    ar: 'نضع لبنة ħω أخرى، بالحجم نفسه كالبقية، على المستوى الأعلى.',
    es: 'Colocando un ladrillo ħω más, del mismo tamaño que los demás, sobre el nivel superior.',
    fr: 'On pose une brique ħω de plus, de même taille que les autres, sur le niveau du haut.',
    hi: 'बाकी जितनी ही बड़ी एक और ħω ईंट सबसे ऊपरी स्तर पर रखी जा रही है।',
    id: 'Meletakkan satu bata ħω lagi, seukuran yang lain, di atas tingkat teratas.',
    pt: 'Colocando mais um tijolo ħω, do mesmo tamanho dos outros, sobre o nível mais alto.',
  },
  'caption.land': {
    ko: '벽돌 윗면에 새 준위가 선다 — 그 위의 파동은 마디가 하나 더 많다.',
    en: 'A new level sits on top of the brick — its wave has one more node.',
    ja: 'ブロックの上面に新しい準位ができる — その波は節が一つ多い。',
    zh: '砖块顶面上立起新的能级——它的波多一个波节。',
    ar: 'يستقر مستوى جديد فوق اللبنة — وفي موجته عقدة إضافية واحدة.',
    es: 'Un nuevo nivel se asienta sobre el ladrillo — su onda tiene un nodo más.',
    fr: 'Un nouveau niveau se pose sur la brique — son onde a un nœud de plus.',
    hi: 'ईंट के ऊपर एक नया स्तर बनता है — उसकी तरंग में एक निस्पंद अधिक है।',
    id: 'Tingkat baru berdiri di atas bata — gelombangnya punya satu simpul lebih banyak.',
    pt: 'Um novo nível se assenta sobre o tijolo — sua onda tem um nó a mais.',
  },
  'caption.rest': {
    ko: '벽돌은 모두 같은 크기다 — 준위는 같은 간격으로 쌓이고, 맨 아래만 반 칸이다.',
    en: 'Every brick is the same size — the levels stack at equal spacing, with only a half step at the bottom.',
    ja: 'ブロックはすべて同じ大きさ — 準位は等間隔に積み重なり、いちばん下だけが半段だ。',
    zh: '每块砖都一样大——能级等间距地堆叠，只有最底下是半级。',
    ar: 'كل اللبنات بالحجم نفسه — تتراكم المستويات بتباعد متساوٍ، ولا يوجد نصف درجة إلا في الأسفل.',
    es: 'Todos los ladrillos son del mismo tamaño — los niveles se apilan con igual espaciado, y solo abajo hay medio escalón.',
    fr: 'Toutes les briques ont la même taille — les niveaux s’empilent à intervalles égaux, avec seulement un demi-palier en bas.',
    hi: 'हर ईंट एक ही आकार की है — स्तर समान अंतराल पर जमते हैं, केवल सबसे नीचे आधा पायदान है।',
    id: 'Semua bata berukuran sama — tingkat-tingkat bertumpuk dengan jarak sama, hanya di dasar ada setengah langkah.',
    pt: 'Todos os tijolos têm o mesmo tamanho — os níveis se empilham com espaçamento igual, e só embaixo há meio degrau.',
  },
} satisfies Record<string, LocalizedText>);

export type QuantumHarmonicOscillatorMessageKey = keyof typeof quantumHarmonicOscillatorMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: QuantumHarmonicOscillatorMessageKey): LocalizedText => quantumHarmonicOscillatorMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: QuantumHarmonicOscillatorMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const quantumHarmonicOscillatorSchema: BundleSchema = {
  id: QUANTUM_HARMONIC_OSCILLATOR_ID,
  label: text('label.title'),
  category: 'modern',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다. 독자가 고를 만한 것(용수철 세기 · 입자 질량)은 ħω 의 크기만 바꾸고
  // 「간격이 모두 같다」 · 「바닥은 반 칸」 은 바꾸지 않아, 이 주장에는 해 볼 것이 없다.
  parameters: [],

  stages: [
    {
      id: 'parabolic-well',
      label: text('label.stage'),
      constants: {
        quantum: QUANTUM,
        xScale: X_SCALE,
        levelCount: LEVEL_COUNT,
        psiHeight: PSI_HEIGHT,
        psiRange: PSI_RANGE,
      },
    },
  ],

  environments: [],

  views: [{ id: 'ladder', label: text('label.view'), default: true }],

  /** 준위 기둥이 세로로 길어 세로를 조금 더 받는다. 아래 캡션 한 줄. */
  canvas: { height: 440, minHeight: 380 },

  /** 우물 · 바닥선을 먼저, 준위 선 · ψ 를 그 위에, 벽돌 · 글자를 맨 위에. */
  drawOrder: 'scene',

  /**
   * 한 주기 20.0 초.
   *
   * - `ground` — 바닥 준위(ψ₀)와 그 아래 반 벽돌(½ħω)만 있다.
   * - 준위 n = 1 … N − 1 마다 `drop-n`(ħω 벽돌이 위에서 내려와 맨 위 준위에 얹힘, smooth) →
   *   `grow-n`(벽돌 윗면에 새 준위 선이 서고 ψₙ 이 자라남, smooth) → `hold-n`(머묾).
   *   **모든 `drop-n` 이 같은 길이** 다 — 매번 같은 벽돌을 같은 방식으로 얹는다.
   *   마지막 `hold-4` 는 다 쌓인 기둥을 보여 주려 길다.
   * - `fade` — 위 준위와 벽돌이 흐려지고 바닥 준위 하나로 돌아간다.
   * - 준위 수(`levelCount`)와 `drop-n` · `grow-n` · `hold-n` 은 짝이다 (장부 G13).
   */
  timeline: {
    phases: [
      { id: 'ground', duration: 3.0, caption: key('caption.ground') },
      { id: 'drop-1', duration: 1.2, ease: 'smooth', caption: key('caption.drop') },
      { id: 'grow-1', duration: 0.8, ease: 'smooth', caption: key('caption.land') },
      { id: 'hold-1', duration: 1.4, caption: key('caption.land') },
      { id: 'drop-2', duration: 1.2, ease: 'smooth', caption: key('caption.drop') },
      { id: 'grow-2', duration: 0.8, ease: 'smooth', caption: key('caption.land') },
      { id: 'hold-2', duration: 1.4, caption: key('caption.land') },
      { id: 'drop-3', duration: 1.2, ease: 'smooth', caption: key('caption.drop') },
      { id: 'grow-3', duration: 0.8, ease: 'smooth', caption: key('caption.land') },
      { id: 'hold-3', duration: 1.4, caption: key('caption.land') },
      { id: 'drop-4', duration: 1.2, ease: 'smooth', caption: key('caption.drop') },
      { id: 'grow-4', duration: 0.8, ease: 'smooth', caption: key('caption.land') },
      { id: 'hold-4', duration: 4.0, caption: key('caption.rest') },
      { id: 'fade', duration: 0.8, ease: 'smooth', caption: key('caption.rest') },
    ],
  },

  /** 도착한 순간 ψ₀ 와 반 벽돌이 이미 있고, 1 초 뒤 첫 벽돌이 내려온다. */
  startAt: 2.0,

  /** 슬롯 하나. 우물 아래 왼쪽. */
  caption: {
    anchor: { screen: 'bottom-left', offset: [16, -6] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 820,
    style: { colorRole: 'ink', emphasis: 'strong' },
    fade: 0.25,
  },

  // 그리드 · 카메라 단추 · 범례 · 제목 없음(기본). 간격을 재는 자는 벽돌 기둥 하나다.

  messages: quantumHarmonicOscillatorMessages,
};
