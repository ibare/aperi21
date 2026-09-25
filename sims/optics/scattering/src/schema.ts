// ========================================================================
// scattering — 선언
// ========================================================================
// 질문: 같은 햇빛인데 맑은 하늘은 파랗고 구름은 왜 흰가.
//
// 위아래 두 레인에 흰빛 줄기가 들어온다. 위 레인에는 빛의 파장보다 훨씬 작은
// 입자(공기 분자), 아래 레인에는 파장보다 큰 물방울(구름)이 떠 있다. 줄기가
// 입자에 닿으면 입자마다 흩어진 빛의 획이 바깥으로 날아간다.
//
// - 작은 입자 — 획이 앞뒤 사방으로 고르게 퍼지고, 흩어진 빛은 파랗다.
// - 큰 물방울 — 획이 거의 앞쪽(줄기가 가던 쪽)으로 몰리고, 흩어진 빛은 희다.
//
// 파장마다 흩는 몫의 정량(1/λ⁴)은 이웃 `rayleigh-scattering` 의 몫이다. 이 조각은
// 입자 크기에 따라 흩어지는 **방향**과 **색**이 함께 갈린다는 것을 대비한다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:scattering` 와 문자 그대로 일치한다 (C4). */
export const SCATTERING_ID = 'scattering';

// ------------------------------------------------------------------------
// 물리 · 표시 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/**
 * 흩는 몫이 파장에 따르는 지수 — 흩는 몫 ∝ (1/λ)ⁿ. 작은 입자는 4(레일리),
 * 큰 물방울은 0(파장과 거의 무관). 흩어진 빛의 색이 이 지수로 합성된다.
 */
export const SMALL_EXPONENT = 4;
export const LARGE_EXPONENT = 0;
/**
 * 큰 물방울이 앞쪽으로 흩는 정도(비대칭 인자 g, 0 이면 고르게 · 1 에 가까울수록 앞쪽).
 * 구름 물방울의 가시광 값이 약 0.85 다.
 */
export const LARGE_ASYMMETRY = 0.85;
/**
 * 줄기의 물결 간격(월드) — **표시 파장**이다. 입자 크기와 견주는 자로 쓴다.
 */
export const WAVE_WORLD = 0.42;
/**
 * 입자 반지름(월드) — **과장한 값이다.** 실제 공기 분자는 파장의 약 1/1000, 구름 물방울은
 * 파장의 약 20배라 한 화면에 둘 수 없다. 작은 입자는 물결 간격보다 훨씬 작게, 물방울은 지름이
 * 물결 간격보다 크게만 지킨다 (NOTES (b)).
 */
export const SMALL_RADIUS = 0.035;
export const LARGE_RADIUS = 0.3;
/** 레인마다 입자 수. */
export const SMALL_COUNT = 18;
export const LARGE_COUNT = 6;
/** 입자 하나가 한 번에 내보내는 흩어진 빛의 획 수. */
export const STROKES_PER_PARTICLE = 10;
/** 흩어진 빛 획이 날아가는 속력(월드/초)과 사라지기까지 가는 거리(월드) — 표시 배율. */
export const STROKE_SPEED = 1.1;
export const STROKE_REACH = 1.5;
/** 입자 자리 · 획 방향을 뽑는 난수 시드 (같은 시각은 같은 화면). */
export const SEED = 11;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이(초)
// ------------------------------------------------------------------------

export const SMALL_IN = 1.4;
export const SMALL = 3.6;
export const LARGE_IN = 1.4;
export const LARGE = 3.6;
export const BOTH = 3.4;
export const FADE = 0.8;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const scatteringMessages = Object.freeze({
  'label.title': {
    ko: '산란',
    en: 'Scattering',
    ja: '散乱',
    zh: '散射',
    ar: 'التشتت',
    es: 'Dispersión',
    fr: 'Diffusion',
    hi: 'प्रकीर्णन',
    id: 'Hamburan',
    pt: 'Espalhamento',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '파란 하늘과 흰 구름을 가르는 입자 크기',
    en: 'The particle size that separates a blue sky from white clouds',
    ja: '青い空と白い雲を分ける粒の大きさ',
    zh: '区分蓝天与白云的粒子大小',
    ar: 'حجم الجسيمات الذي يفرّق بين السماء الزرقاء والغيوم البيضاء',
    es: 'El tamaño de partícula que separa el cielo azul de las nubes blancas',
    fr: 'La taille des particules qui sépare le ciel bleu des nuages blancs',
    hi: 'वह कण-आकार जो नीले आकाश और सफ़ेद बादलों को अलग करता है',
    id: 'Ukuran partikel yang membedakan langit biru dari awan putih',
    pt: 'O tamanho das partículas que separa o céu azul das nuvens brancas',
  },
  'label.stage': {
    ko: '공기 분자와 구름 물방울',
    en: 'Air molecules and cloud droplets',
    ja: '空気の分子と雲の水滴',
    zh: '空气分子与云滴',
    ar: 'جزيئات الهواء وقُطيرات السحاب',
    es: 'Moléculas de aire y gotitas de nube',
    fr: 'Molécules d’air et gouttelettes de nuage',
    hi: 'वायु के अणु और बादल की बूँदें',
    id: 'Molekul udara dan titik air awan',
    pt: 'Moléculas de ar e gotículas de nuvem',
  },
  'label.view': {
    ko: '두 레인',
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
  'label.small': {
    ko: '공기 분자',
    en: 'Air molecules',
    ja: '空気の分子',
    zh: '空气分子',
    ar: 'جزيئات الهواء',
    es: 'Moléculas de aire',
    fr: 'Molécules d’air',
    hi: 'वायु के अणु',
    id: 'Molekul udara',
    pt: 'Moléculas de ar',
  },
  'label.smallNote': {
    ko: '파장보다 훨씬 작다',
    en: 'far smaller than the wavelength',
    ja: '波長よりはるかに小さい',
    zh: '远小于波长',
    ar: 'أصغر بكثير من الطول الموجي',
    es: 'mucho más pequeñas que la longitud de onda',
    fr: 'bien plus petites que la longueur d’onde',
    hi: 'तरंगदैर्घ्य से बहुत छोटे',
    id: 'jauh lebih kecil daripada panjang gelombang',
    pt: 'muito menores que o comprimento de onda',
  },
  'label.large': {
    ko: '구름 물방울',
    en: 'Cloud droplets',
    ja: '雲の水滴',
    zh: '云滴',
    ar: 'قُطيرات السحاب',
    es: 'Gotitas de nube',
    fr: 'Gouttelettes de nuage',
    hi: 'बादल की बूँदें',
    id: 'Titik air awan',
    pt: 'Gotículas de nuvem',
  },
  'label.largeNote': {
    ko: '파장보다 크다',
    en: 'larger than the wavelength',
    ja: '波長より大きい',
    zh: '大于波长',
    ar: 'أكبر من الطول الموجي',
    es: 'más grandes que la longitud de onda',
    fr: 'plus grosses que la longueur d’onde',
    hi: 'तरंगदैर्घ्य से बड़ी',
    id: 'lebih besar daripada panjang gelombang',
    pt: 'maiores que o comprimento de onda',
  },
  /** 줄기 물결 간격의 표식 — 기호라 번역하지 않는다 (C1 판정 3). */
  'label.lambda': {
    ko: 'λ',
    en: 'λ',
    ja: 'λ',
    zh: 'λ',
    ar: 'λ',
    es: 'λ',
    fr: 'λ',
    hi: 'λ',
    id: 'λ',
    pt: 'λ',
  },
  'caption.smallIn': {
    ko: '흰빛 줄기가 작은 입자들 사이로 들어간다',
    en: 'A beam of white light enters among the tiny particles',
    ja: '白色光の光束が小さな粒子の間に入っていく',
    zh: '一束白光射入微小粒子之间',
    ar: 'تدخل حزمة من الضوء الأبيض بين الجسيمات الدقيقة',
    es: 'Un haz de luz blanca entra entre las partículas diminutas',
    fr: 'Un faisceau de lumière blanche pénètre parmi les minuscules particules',
    hi: 'श्वेत प्रकाश का एक किरण-पुंज नन्हे कणों के बीच प्रवेश करता है',
    id: 'Seberkas cahaya putih masuk di antara partikel-partikel kecil',
    pt: 'Um feixe de luz branca entra entre as partículas minúsculas',
  },
  'caption.small': {
    ko: '빛이 앞뒤 사방으로 흩어지고, 흩어진 빛은 파랗다',
    en: 'The light scatters every way, forward and back, and the scattered light is blue',
    ja: '光は前にも後ろにもあらゆる方向へ散乱し、散乱した光は青い',
    zh: '光向前后四面八方散射，散射光是蓝色的',
    ar: 'يتشتت الضوء في كل اتجاه، إلى الأمام والخلف، والضوء المشتت أزرق',
    es: 'La luz se dispersa en todas direcciones, hacia delante y hacia atrás, y la luz dispersada es azul',
    fr: 'La lumière est diffusée dans tous les sens, vers l’avant comme vers l’arrière, et la lumière diffusée est bleue',
    hi: 'प्रकाश आगे-पीछे हर दिशा में प्रकीर्णित होता है, और प्रकीर्णित प्रकाश नीला है',
    id: 'Cahaya terhambur ke segala arah, ke depan dan ke belakang, dan cahaya yang terhambur berwarna biru',
    pt: 'A luz se espalha em todas as direções, para a frente e para trás, e a luz espalhada é azul',
  },
  'caption.largeIn': {
    ko: '흰빛 줄기가 큰 물방울들 사이로 들어간다',
    en: 'A beam of white light enters among the large droplets',
    ja: '白色光の光束が大きな水滴の間に入っていく',
    zh: '一束白光射入大水滴之间',
    ar: 'تدخل حزمة من الضوء الأبيض بين القُطيرات الكبيرة',
    es: 'Un haz de luz blanca entra entre las gotas grandes',
    fr: 'Un faisceau de lumière blanche pénètre parmi les grosses gouttelettes',
    hi: 'श्वेत प्रकाश का एक किरण-पुंज बड़ी बूँदों के बीच प्रवेश करता है',
    id: 'Seberkas cahaya putih masuk di antara titik-titik air besar',
    pt: 'Um feixe de luz branca entra entre as gotas grandes',
  },
  'caption.large': {
    ko: '빛이 거의 앞쪽으로 몰려 흩어지고, 흩어진 빛은 희다',
    en: 'The light scatters mostly forward, and the scattered light is white',
    ja: '光はほとんど前方へ散乱し、散乱した光は白い',
    zh: '光大多向前散射，散射光是白色的',
    ar: 'يتشتت الضوء في الغالب إلى الأمام، والضوء المشتت أبيض',
    es: 'La luz se dispersa sobre todo hacia delante, y la luz dispersada es blanca',
    fr: 'La lumière est diffusée surtout vers l’avant, et la lumière diffusée est blanche',
    hi: 'प्रकाश अधिकतर आगे की ओर प्रकीर्णित होता है, और प्रकीर्णित प्रकाश सफ़ेद है',
    id: 'Cahaya terhambur sebagian besar ke depan, dan cahaya yang terhambur berwarna putih',
    pt: 'A luz se espalha sobretudo para a frente, e a luz espalhada é branca',
  },
  'caption.both': {
    ko: '위에서는 파란 빛이 사방으로, 아래에서는 흰 빛이 앞쪽으로 흩어진다',
    en: 'Above, blue light scatters every way; below, white light scatters forward',
    ja: '上では青い光があらゆる方向へ、下では白い光が前方へ散乱する',
    zh: '上方蓝光向四面八方散射；下方白光向前散射',
    ar: 'في الأعلى يتشتت الضوء الأزرق في كل اتجاه؛ وفي الأسفل يتشتت الضوء الأبيض إلى الأمام',
    es: 'Arriba, la luz azul se dispersa en todas direcciones; abajo, la luz blanca se dispersa hacia delante',
    fr: 'En haut, la lumière bleue est diffusée dans tous les sens ; en bas, la lumière blanche est diffusée vers l’avant',
    hi: 'ऊपर नीला प्रकाश हर दिशा में, नीचे श्वेत प्रकाश आगे की ओर प्रकीर्णित होता है',
    id: 'Di atas, cahaya biru terhambur ke segala arah; di bawah, cahaya putih terhambur ke depan',
    pt: 'Em cima, a luz azul se espalha em todas as direções; embaixo, a luz branca se espalha para a frente',
  },
} satisfies Record<string, LocalizedText>);

export type ScatteringMessageKey = keyof typeof scatteringMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: ScatteringMessageKey): LocalizedText => scatteringMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ScatteringMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const scatteringSchema: BundleSchema = {
  id: SCATTERING_ID,
  label: text('label.title'),
  category: 'optics',
  description: text('label.description'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 위 레인이 이미 흩고 있고, 아래 레인이 뒤따른다 (controllers.ts).
  parameters: [],

  stages: [
    {
      id: 'default',
      label: text('label.stage'),
      constants: {
        smallExponent: SMALL_EXPONENT,
        largeExponent: LARGE_EXPONENT,
        largeAsymmetry: LARGE_ASYMMETRY,
        waveWorld: WAVE_WORLD,
        smallRadius: SMALL_RADIUS,
        largeRadius: LARGE_RADIUS,
        smallCount: SMALL_COUNT,
        largeCount: LARGE_COUNT,
        strokesPerParticle: STROKES_PER_PARTICLE,
        strokeSpeed: STROKE_SPEED,
        strokeReach: STROKE_REACH,
        seed: SEED,
      },
    },
  ],

  environments: [],

  views: [{ id: 'main', label: text('label.view'), default: true }],

  /** 가로가 길고 세로가 짧다 — 두 레인을 위아래로 얇게 쌓는다. */
  canvas: { height: 300, minHeight: 260 },

  /**
   * 겹침이 판정 장치다. 빛 없음 판 → 줄기 → 입자 → 흩어진 빛 획 순으로 깔려야
   * 획이 입자 위에서 읽힌다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 위 레인에 줄기가 들어옴 → 위 레인이 흩음 → 아래 레인에 줄기가 들어옴
   * → 아래 레인이 흩음 → 둘을 견줌 → 흐려짐. 입자마다 흩기 시작하는 시각은 줄기
   * 앞머리가 그 입자에 닿는 때다 (NOTES (c)).
   */
  timeline: {
    phases: [
      { id: 'smallIn', duration: SMALL_IN, caption: key('caption.smallIn') },
      { id: 'small', duration: SMALL, caption: key('caption.small') },
      { id: 'largeIn', duration: LARGE_IN, caption: key('caption.largeIn') },
      { id: 'large', duration: LARGE, caption: key('caption.large') },
      { id: 'both', duration: BOTH, caption: key('caption.both') },
      { id: 'fade', duration: FADE, caption: key('caption.both') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — 위 레인이 흩고 있는 중에 연다. */
  startAt: 2.6,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 크기와 파장의 관계는 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 읽을 것은 획이 퍼지는 방향과 색이다 — 거리 격자는
   * 다른 질문을 끼운다.
   */

  messages: scatteringMessages,
};
