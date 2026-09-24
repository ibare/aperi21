// ========================================================================
// particle-in-a-box — 선언
// ========================================================================
// 질문: 벽 사이에 갇힌 입자의 에너지는 왜 띄엄띄엄이고, 위로 갈수록 왜 더 벌어지는가.
//
// 답: 무한 우물 안 파동 함수는 양 벽에서 0 이어야 해서 반파장이 정수 개 맞는 모양만
// 남는다. 반파장을 하나 더 넣을 때마다 에너지는 n² 로 오른다(1 · 4 · 9 · 16 E₁) —
// 다음 준위까지 오르는 거리가 3 · 5 · 7 칸으로 매번 두 칸씩 길어진다.
//
// 「끝이 모양을 거른다」 는 이웃 `harmonics`(줄의 배음)의 몫이다. 여기서는 모양을
// 거르는 장면을 되풀이하지 않고, **허용된 모양마다 에너지 준위가 벌어지는 것** 을
// 준위 사다리 위에서 보인다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:particle-in-a-box` 와 문자 그대로 일치한다 (C4). */
export const PARTICLE_IN_A_BOX_ID = 'particle-in-a-box';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 월드 가로 = 우물 안 위치, 월드 세로 = 에너지(E₁ 단위 × `energyUnit`).
// ------------------------------------------------------------------------

/** 우물 폭(월드). 왼쪽 벽이 x = 0, 오른쪽 벽이 x = L. */
export const BOX_WIDTH = 22;
/** 에너지 E₁ 한 칸의 월드 높이. 준위 n 은 n² 칸 높이에 놓인다. */
export const ENERGY_UNIT = 1;
/**
 * 보일 준위 수. 시간표의 `climb-n` · `grow-n` · `hold-n` 단계(n = 2 … N)와 짝이다 —
 * 이 값을 바꾸면 단계도 함께 선언해야 한다 (NOTES 「어휘 부족」 G13).
 */
export const LEVEL_COUNT = 4;
/**
 * 준위 위에 얹는 ψ 의 높이(월드). 파동 함수의 크기는 에너지 축과 단위가 다른 그림
 * 배율이다 — 가장 좁은 간격(1 → 4, 3 칸)의 절반보다 작아야 이웃 ψ 와 겹치지 않는다.
 */
export const PSI_HEIGHT = 1.2;

// ------------------------------------------------------------------------
// 배치 — 월드 단위
// ------------------------------------------------------------------------

/** 에너지 눈금자가 오른쪽 벽에서 떨어진 거리(월드). */
export const RULER_GAP = 1.6;
/** 간격 치수선이 눈금자에서 떨어진 거리(월드). 사이에 준위 이름표가 들어간다. */
export const GAP_DIM_OFFSET = 3.6;
/** 벽이 가장 높은 ψ 위로 더 뻗는 길이(월드) — 벽이 끝없이 높다는 표시다. */
export const WALL_OVERHANG = 1.3;

/**
 * 프레이밍 — 왼쪽은 `n = 1` 이름표, 오른쪽은 눈금자 · 준위 이름표 · 간격 치수선과 그
 * 글자, 아래는 캡션 자리. 기본 준위 수(4, 맨 위 16 칸)가 들어가도록 처음부터 잡는다.
 * 매 프레임 같은 값이다 (S-piece — 프레이밍은 주장의 일부다).
 */
export const SCENE_BOUNDS = { minX: -3.2, maxX: 30.8, minY: -3.4, maxY: 19.4 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const particleInABoxMessages = Object.freeze({
  'label.title': { ko: '무한 우물', en: 'Infinite square well', ja: '無限井戸型ポテンシャル', zh: '无限深方势阱', ar: 'البئر المربع اللانهائي', es: 'Pozo cuadrado infinito', fr: 'Puits carré infini', hi: 'अनंत वर्ग कूप', id: 'Sumur persegi tak berhingga', pt: 'Poço quadrado infinito' },
  'label.operation': { ko: '경계가 만드는 에너지 양자화', en: 'Energy quantization made by the walls', ja: '壁がつくるエネルギーの量子化', zh: '势壁造成的能量量子化', ar: 'تكميم الطاقة الذي تفرضه الجدران', es: 'Cuantización de la energía producida por las paredes', fr: 'Quantification de l’énergie imposée par les parois', hi: 'दीवारों से बना ऊर्जा का क्वांटीकरण', id: 'Kuantisasi energi yang dibuat oleh dinding', pt: 'Quantização da energia criada pelas paredes' },
  'label.stage': { ko: '무한 우물', en: 'Infinite well', ja: '無限井戸', zh: '无限深势阱', ar: 'البئر اللانهائي', es: 'Pozo infinito', fr: 'Puits infini', hi: 'अनंत कूप', id: 'Sumur tak berhingga', pt: 'Poço infinito' },
  'label.view': { ko: '준위와 파동 함수', en: 'Levels and wave functions', ja: '準位と波動関数', zh: '能级与波函数', ar: 'المستويات ودوال الموجة', es: 'Niveles y funciones de onda', fr: 'Niveaux et fonctions d’onde', hi: 'स्तर और तरंग फलन', id: 'Tingkat energi dan fungsi gelombang', pt: 'Níveis e funções de onda' },

  /** 준위 번호 — 기호라 두 언어가 같다(C1 표식). */
  'label.n': { ko: 'n = {n}', en: 'n = {n}', ja: 'n = {n}', zh: 'n = {n}', ar: 'n = {n}', es: 'n = {n}', fr: 'n = {n}', hi: 'n = {n}', id: 'n = {n}', pt: 'n = {n}' },
  /** 준위 에너지 — 바닥 준위는 계수 없이 E₁. */
  'label.levelOne': { ko: 'E₁', en: 'E₁', ja: 'E₁', zh: 'E₁', ar: 'E₁', es: 'E₁', fr: 'E₁', hi: 'E₁', id: 'E₁', pt: 'E₁' },
  'label.level': { ko: '{k}E₁', en: '{k}E₁', ja: '{k}E₁', zh: '{k}E₁', ar: '{k}E₁', es: '{k}E₁', fr: '{k}E₁', hi: '{k}E₁', id: '{k}E₁', pt: '{k}E₁' },
  /** 이웃 준위 사이 간격. */
  'label.gap': { ko: '+{g}E₁', en: '+{g}E₁', ja: '+{g}E₁', zh: '+{g}E₁', ar: '+{g}E₁', es: '+{g}E₁', fr: '+{g}E₁', hi: '+{g}E₁', id: '+{g}E₁', pt: '+{g}E₁' },
  /** 눈금자 이름. */
  'label.energy': { ko: '에너지', en: 'energy', ja: 'エネルギー', zh: '能量', ar: 'الطاقة', es: 'energía', fr: 'énergie', hi: 'ऊर्जा', id: 'energi', pt: 'energia' },

  'caption.ground': {
    ko: '양 벽에서 0 이 되는 가장 단순한 모양 — 반파장 하나가 우물을 채운다. 가장 낮은 준위다.',
    en: 'The simplest shape that is zero at both walls — one half-wave fills the well. This is the lowest level.',
    ja: '両方の壁で 0 になる最も単純な形 — 半波長一つが井戸を満たす。これが最も低い準位だ。',
    zh: '在两壁处都为 0 的最简单形状 — 一个半波填满势阱。这是最低的能级。',
    ar: 'أبسط شكل يساوي صفرًا عند الجدارين — نصف موجة واحد يملأ البئر. هذا أدنى مستوى.',
    es: 'La forma más sencilla que vale cero en ambas paredes — media onda llena el pozo. Es el nivel más bajo.',
    fr: 'La forme la plus simple qui s’annule aux deux parois — une demi-onde remplit le puits. C’est le niveau le plus bas.',
    hi: 'दोनों दीवारों पर शून्य होने वाला सबसे सरल आकार — एक अर्ध-तरंग कूप को भर देती है। यही सबसे निचला स्तर है।',
    id: 'Bentuk paling sederhana yang bernilai nol di kedua dinding — setengah gelombang mengisi sumur. Inilah tingkat terendah.',
    pt: 'A forma mais simples que é zero nas duas paredes — meia onda preenche o poço. Este é o nível mais baixo.',
  },
  'caption.climb': {
    ko: '반파장을 하나 더 넣으려면 에너지가 더 든다 — 다음 준위까지 같은 빠르기로 오르는 중.',
    en: 'Fitting one more half-wave takes more energy — climbing to the next level at a steady pace.',
    ja: '半波長をもう一つ入れるにはもっとエネルギーがいる — 次の準位まで一定の速さで上っているところ。',
    zh: '再多容纳一个半波需要更多能量 — 正以恒定的速度升向下一个能级。',
    ar: 'إدخال نصف موجة آخر يتطلب طاقة أكبر — صعود نحو المستوى التالي بوتيرة ثابتة.',
    es: 'Meter una media onda más cuesta más energía — subiendo al siguiente nivel a ritmo constante.',
    fr: 'Loger une demi-onde de plus demande plus d’énergie — on monte au niveau suivant à vitesse constante.',
    hi: 'एक और अर्ध-तरंग समाने के लिए अधिक ऊर्जा लगती है — स्थिर गति से अगले स्तर तक चढ़ाई जारी है।',
    id: 'Memuat setengah gelombang lagi butuh energi lebih — sedang naik ke tingkat berikutnya dengan laju tetap.',
    pt: 'Encaixar mais meia onda exige mais energia — subindo ao próximo nível num ritmo constante.',
  },
  'caption.land': {
    ko: '반파장이 하나 더 들어간 모양이 새 준위에 얹힌다 — 양 벽에서는 여전히 0 이다.',
    en: 'The shape with one more half-wave sits on the new level — still zero at both walls.',
    ja: '半波長が一つ増えた形が新しい準位に載る — 両方の壁ではやはり 0 だ。',
    zh: '多了一个半波的形状落在新的能级上 — 在两壁处仍为 0。',
    ar: 'الشكل الذي زاد نصف موجة يستقر على المستوى الجديد — وما زال صفرًا عند الجدارين.',
    es: 'La forma con una media onda más se asienta en el nuevo nivel — sigue valiendo cero en ambas paredes.',
    fr: 'La forme à une demi-onde de plus se pose sur le nouveau niveau — toujours nulle aux deux parois.',
    hi: 'एक अर्ध-तरंग अधिक वाला आकार नए स्तर पर टिकता है — दोनों दीवारों पर अब भी शून्य।',
    id: 'Bentuk dengan tambahan setengah gelombang duduk di tingkat baru — tetap nol di kedua dinding.',
    pt: 'A forma com mais meia onda se assenta no novo nível — ainda zero nas duas paredes.',
  },
  'caption.rest': {
    ko: '위로 갈수록 준위 사이가 벌어진다 — 다음 준위까지 오르는 칸 수가 매번 두 칸씩 늘었다.',
    en: 'The higher up, the wider the gaps — each climb to the next level took two more steps than the last.',
    ja: '上へ行くほど準位の間隔が広がる — 次の準位まで上るマス目が毎回二つずつ増えた。',
    zh: '越往上，能级间隔越宽 — 每次升到下一个能级都比上一次多走两格。',
    ar: 'كلما صعدنا اتسعت الفجوات — كل صعود إلى المستوى التالي استغرق خطوتين أكثر من سابقه.',
    es: 'Cuanto más arriba, más anchos los huecos — cada subida al siguiente nivel llevó dos pasos más que la anterior.',
    fr: 'Plus on monte, plus les écarts s’élargissent — chaque montée au niveau suivant a pris deux pas de plus que la précédente.',
    hi: 'जितना ऊपर, अंतराल उतने चौड़े — अगले स्तर तक हर चढ़ाई में पिछली से दो खाने अधिक लगे।',
    id: 'Makin ke atas, makin lebar celahnya — setiap naik ke tingkat berikutnya butuh dua langkah lebih banyak dari sebelumnya.',
    pt: 'Quanto mais alto, maiores os intervalos — cada subida ao próximo nível levou dois degraus a mais que a anterior.',
  },
} satisfies Record<string, LocalizedText>);

export type ParticleInABoxMessageKey = keyof typeof particleInABoxMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로 (C1). */
export const text = (key: ParticleInABoxMessageKey): LocalizedText => particleInABoxMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ParticleInABoxMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const particleInABoxSchema: BundleSchema = {
  id: PARTICLE_IN_A_BOX_ID,
  label: text('label.title'),
  category: 'modern',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다. 준위를 하나씩 올라가는 자동 진행이 간격 셋을 모두 지나간다 —
  // 독자가 손으로 고를 것(우물 폭 · 입자 질량)은 E₁ 의 크기만 바꾸고 1 · 4 · 9 · 16 의
  // 비는 바꾸지 않아, 이 주장에는 해 볼 것이 없다.
  parameters: [],

  stages: [
    {
      id: 'infinite-well',
      label: text('label.stage'),
      constants: {
        boxWidth: BOX_WIDTH,
        energyUnit: ENERGY_UNIT,
        levelCount: LEVEL_COUNT,
        psiHeight: PSI_HEIGHT,
      },
    },
  ],

  environments: [],

  views: [{ id: 'ladder', label: text('label.view'), default: true }],

  /** 준위 사다리가 세로로 16 칸이라 세로를 조금 더 받는다. 아래 캡션 한 줄. */
  canvas: { height: 440, minHeight: 380 },

  /** 벽 · 눈금자를 먼저, 준위 선 · ψ 를 그 위에, 간격 치수선 · 글자를 맨 위에. */
  drawOrder: 'scene',

  /**
   * 한 주기 22.1 초.
   *
   * - `ground` — 바닥 준위(ψ₁)만 있다.
   * - 준위 n = 2 … N 마다 `climb-n`(다음 준위로 오름) → `grow-n`(그 준위에 ψₙ 이 자라남,
   *   smooth) → `hold-n`(머묾). 마지막 `hold-4` 는 다 쌓인 사다리를 보여 주려 길다.
   * - **`climb-n` 의 길이는 오르는 칸 수(2n − 1)에 비례한다** — E₁ 한 칸에 0.5 초라
   *   3 · 5 · 7 칸이 1.5 · 2.5 · 3.5 초다. 가로대가 같은 빠르기로 올라, 오를 때마다
   *   오래 걸리는 것이 「간격이 벌어진다」 의 움직임이다. 이 비례는 선언할 자리가 없어
   *   저작자가 깨도 경고가 없다 (장부 G129). `linear` 라야 빠르기가 일정하다.
   * - `fade` — 위 준위들이 흐려지고 다시 바닥 준위 하나로 돌아간다.
   * - 준위 수(`levelCount`)와 `climb-n` · `grow-n` · `hold-n` 은 짝이다 (장부 G13).
   */
  timeline: {
    phases: [
      { id: 'ground', duration: 3.0, caption: key('caption.ground') },
      { id: 'climb-2', duration: 1.5, caption: key('caption.climb') },
      { id: 'grow-2', duration: 0.8, ease: 'smooth', caption: key('caption.land') },
      { id: 'hold-2', duration: 2.2, caption: key('caption.land') },
      { id: 'climb-3', duration: 2.5, caption: key('caption.climb') },
      { id: 'grow-3', duration: 0.8, ease: 'smooth', caption: key('caption.land') },
      { id: 'hold-3', duration: 2.2, caption: key('caption.land') },
      { id: 'climb-4', duration: 3.5, caption: key('caption.climb') },
      { id: 'grow-4', duration: 0.8, ease: 'smooth', caption: key('caption.land') },
      { id: 'hold-4', duration: 4.0, caption: key('caption.rest') },
      { id: 'fade', duration: 0.8, ease: 'smooth', caption: key('caption.rest') },
    ],
  },

  /** 도착한 순간 바닥 준위의 ψ₁ 이 이미 얹혀 있고, 1 초 뒤 첫 오름이 시작된다. */
  startAt: 2.0,

  /** 슬롯 하나. 우물 바닥 아래 왼쪽. */
  caption: {
    anchor: { screen: 'bottom-left', offset: [16, -6] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 820,
    style: { colorRole: 'ink', emphasis: 'strong' },
    fade: 0.25,
  },

  // 그리드 · 카메라 단추 · 범례 · 제목 없음(기본). 에너지를 재는 자는 E₁ 눈금자 하나다.

  messages: particleInABoxMessages,
};
