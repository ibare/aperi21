// ========================================================================
// harmonics — 선언
// ========================================================================
// 질문: 양끝이 묶인 줄은 왜 아무 진동수로나 크게 흔들리지 않고, 기본 진동수의
// 1배 · 2배 · 3배 … 에서만 크게 흔들리는가.
//
// 답: 끝이 모양을 거른다. 한쪽 끝의 진동자가 진동수를 천천히 올려 가며 줄을 흔든다.
// 그 진동수가 요구하는 모양(점선 틀 — 진동자에서 출발한 사인꼴)의 오른쪽 끝이 묶인
// 매듭에 **딱 닿을 때**, 곧 반파장 n 개가 줄 길이에 맞을 때만 줄이 크게 흔들린다.
// 끝에서 어긋나는 모양은 쌓이지 못해 줄이 거의 움직이지 않는다. 그렇게 남는 진동수는
// 아래 응답 곡선에 기본 진동수의 정수배 봉우리로 남는다.
//
// 줄 길이를 바꿔 음높이가 오르는 것은 `string-vibration`, 관의 열림 · 닫힘은
// `air-column-resonance` 의 몫이다. 한 봉우리의 공명 자체는 `resonance` 의 몫이다 —
// 여기서 보는 것은 봉우리가 **어디에 몇 개** 서는가다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:harmonics` 와 문자 그대로 일치한다 (C4). */
export const HARMONICS_ID = 'harmonics';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 월드 1 단위 = 줄 위 거리 한 단위. 진동자가 x = 0, 묶인 끝이 x = L.
// ------------------------------------------------------------------------

/** 줄 길이(월드). */
export const STRING_LENGTH = 6;
/** 파속(월드/초). 기본 진동수 f₁ = v / 2L = 0.6 Hz — 3배음도 눈으로 셀 수 있는 빠르기다. */
export const WAVE_SPEED = 7.2;
/**
 * 보일 배음 수. 시간표의 `hold-1` … `hold-N` · `sweep-2` … `sweep-N` 단계와 짝이다 —
 * 이 값을 바꾸면 단계도 함께 선언해야 한다 (NOTES 「어휘 부족」 G13).
 */
export const HARMONIC_COUNT = 3;
/** 반파장이 맞았을 때 배(가장 크게 흔들리는 자리)의 높이(월드). 점선 틀의 높이이기도 하다. */
export const PEAK_AMPLITUDE = 0.62;
/**
 * 감쇠(무차원). 반파장이 맞지 않을 때 줄의 흔들림은 맞았을 때의 약 이 배다.
 * 봉우리의 너비도 이것이 정한다.
 */
export const DAMPING = 0.1;
/** 훑기 시작 · 끝 진동수(f₁ 단위). 둘 다 반파장이 가장 크게 어긋나는 자리(반정수)다. */
export const SWEEP_FROM = 0.5;
export const SWEEP_TO = 3.5;

// ------------------------------------------------------------------------
// 배치 — 월드 단위
// ------------------------------------------------------------------------

/** 줄의 평형 높이(월드 y). */
export const STRING_Y = 1.25;
/** 묶인 끝의 벽이 줄 높이에서 위 · 아래로 뻗는 길이(월드). */
export const WALL_HALF = 0.5;
/** 진동자가 오르내리는 막대 반길이(월드). */
export const DRIVER_RAIL_HALF = 0.22;
/** 응답 곡선 — 가로축 높이 · 세로 높이(월드). 가로는 줄과 같은 폭을 쓴다. */
export const GRAPH_BASE_Y = -1.35;
export const GRAPH_HEIGHT = 1.15;

/**
 * 프레이밍 — 왼쪽은 진동자 이름표, 오른쪽은 벽과 가로축 이름, 아래는 눈금 글자와 캡션.
 * 매 프레임 같은 값이다 (S-piece — 프레이밍은 주장의 일부다).
 */
export const SCENE_BOUNDS = { minX: -1.0, maxX: 7.2, minY: -2.2, maxY: 2.1 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const harmonicsMessages = Object.freeze({
  'label.title': {
    ko: '배음',
    en: 'Harmonics',
    ja: '倍音',
    zh: '谐波',
    ar: 'التوافقيات',
    es: 'Armónicos',
    fr: 'Harmoniques',
    hi: 'संनादी',
    id: 'Harmonik',
    pt: 'Harmônicos',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '경계 조건이 정하는 진동수',
    en: 'Frequencies set by the boundary',
    ja: '境界が決める振動数',
    zh: '由边界决定的频率',
    ar: 'ترددات تحددها الحدود',
    es: 'Frecuencias fijadas por la frontera',
    fr: 'Fréquences fixées par les conditions aux limites',
    hi: 'सीमा द्वारा निर्धारित आवृत्तियाँ',
    id: 'Frekuensi yang ditentukan oleh batas',
    pt: 'Frequências definidas pela fronteira',
  },
  'label.stage': {
    ko: '양끝이 묶인 줄',
    en: 'String tied at both ends',
    ja: '両端を固定した弦',
    zh: '两端固定的弦',
    ar: 'وتر مثبت من الطرفين',
    es: 'Cuerda atada por ambos extremos',
    fr: 'Corde attachée aux deux bouts',
    hi: 'दोनों सिरों पर बँधी डोरी',
    id: 'Tali yang terikat di kedua ujung',
    pt: 'Corda presa nas duas pontas',
  },
  'label.view': {
    ko: '줄과 응답 곡선',
    en: 'String and response',
    ja: '弦と応答',
    zh: '弦与响应',
    ar: 'الوتر والاستجابة',
    es: 'Cuerda y respuesta',
    fr: 'Corde et réponse',
    hi: 'डोरी और अनुक्रिया',
    id: 'Tali dan respons',
    pt: 'Corda e resposta',
  },

  /** 진동자 이름. 줄을 흔드는 끝이다. */
  'label.driver': {
    ko: '진동자',
    en: 'driver',
    ja: '振動子',
    zh: '振子',
    ar: 'المحرِّك',
    es: 'excitador',
    fr: 'excitateur',
    hi: 'चालक',
    id: 'penggetar',
    pt: 'excitador',
  },
  /** 응답 곡선의 축 이름. */
  'label.response': {
    ko: '줄의 흔들림',
    en: 'string swing',
    ja: '弦の揺れ',
    zh: '弦的摆动',
    ar: 'اهتزاز الوتر',
    es: 'oscilación de la cuerda',
    fr: 'oscillation de la corde',
    hi: 'डोरी का दोलन',
    id: 'ayunan tali',
    pt: 'oscilação da corda',
  },
  'label.frequency': {
    ko: '진동수',
    en: 'frequency',
    ja: '振動数',
    zh: '频率',
    ar: 'التردد',
    es: 'frecuencia',
    fr: 'fréquence',
    hi: 'आवृत्ति',
    id: 'frekuensi',
    pt: 'frequência',
  },
  /** 가로축 눈금 — 기본 진동수와 그 정수배. 기호라 두 언어가 같다(C1 표식). */
  'label.f1': {
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
  'label.fn': {
    ko: '{n}f₁',
    en: '{n}f₁',
    ja: '{n}f₁',
    zh: '{n}f₁',
    ar: '{n}f₁',
    es: '{n}f₁',
    fr: '{n}f₁',
    hi: '{n}f₁',
    id: '{n}f₁',
    pt: '{n}f₁',
  },

  'caption.sweep': {

    ko: '진동수를 올리는 중 — 점선 모양이 오른쪽 매듭에서 어긋나는 동안 줄은 거의 흔들리지 않는다.',

    en: 'Raising the frequency — while the dashed shape misses the knot on the right, the string barely moves.',

    ja: '振動数を上げている途中 — 点線の形が右の結び目から外れているあいだ、弦はほとんど揺れない。',

    zh: '正在提高频率 — 虚线形状对不上右边的结点时，弦几乎不动。',

    ar: 'رفع التردد — ما دام الشكل المتقطع لا يصيب العقدة على اليمين، يكاد الوتر لا يتحرك.',

    es: 'Subiendo la frecuencia — mientras la forma punteada no llega al nudo de la derecha, la cuerda apenas se mueve.',

    fr: 'On augmente la fréquence — tant que la forme en pointillés manque le nœud de droite, la corde bouge à peine.',

    hi: 'आवृत्ति बढ़ाई जा रही है — जब तक बिंदुदार आकार दाईं ओर की गाँठ से चूकता है, डोरी मुश्किल से हिलती है।',

    id: 'Menaikkan frekuensi — selama bentuk putus-putus meleset dari simpul ikat di kanan, tali hampir tidak bergerak.',

    pt: 'Aumentando a frequência — enquanto a forma tracejada erra o nó da direita, a corda quase não se move.',

  },
  'caption.fit': {
    ko: '반파장이 줄 길이에 딱 맞았다 — 점선 모양이 매듭에 닿고, 줄이 그 모양으로 크게 흔들린다.',
    en: 'Half-wavelengths fit the string exactly — the dashed shape lands on the knot and the string swings in that shape.',
    ja: '半波長がちょうど弦の長さに合った — 点線の形が結び目に届き、弦がその形で大きく揺れる。',
    zh: '半波长正好与弦长相合 — 虚线形状落在结点上，弦按这个形状大幅摆动。',
    ar: 'أنصاف الأطوال الموجية تناسب الوتر تمامًا — يصل الشكل المتقطع إلى العقدة ويتأرجح الوتر بذلك الشكل.',
    es: 'Las medias longitudes de onda encajan justo en la cuerda — la forma punteada cae en el nudo y la cuerda oscila con esa forma.',
    fr: 'Les demi-longueurs d’onde tiennent exactement dans la corde — la forme en pointillés tombe sur le nœud et la corde oscille selon cette forme.',
    hi: 'अर्ध-तरंगदैर्घ्य डोरी में ठीक-ठीक समा जाते हैं — बिंदुदार आकार गाँठ पर जा टिकता है और डोरी उसी आकार में झूलती है।',
    id: 'Setengah panjang gelombang pas persis dengan tali — bentuk putus-putus jatuh tepat di simpul ikat dan tali berayun dengan bentuk itu.',
    pt: 'Os meios comprimentos de onda cabem exatamente na corda — a forma tracejada cai sobre o nó e a corda oscila nessa forma.',
  },
  'caption.rest': {
    ko: '줄이 크게 흔들린 진동수는 기본 진동수의 정수배뿐 — 끝에 맞는 모양만 남았다.',
    en: 'The string swung hard only at whole multiples of the lowest frequency — only shapes that fit the ends survived.',
    ja: '弦が大きく揺れたのは最も低い振動数の整数倍のときだけ — 両端に合う形だけが残った。',
    zh: '弦只在最低频率的整数倍处大幅摆动 — 只有与两端相合的形状留了下来。',
    ar: 'لم يتأرجح الوتر بقوة إلا عند المضاعفات الصحيحة لأدنى تردد — لم يبقَ إلا الأشكال التي تناسب الطرفين.',
    es: 'La cuerda osciló fuerte solo en múltiplos enteros de la frecuencia más baja — solo sobrevivieron las formas que encajan en los extremos.',
    fr: 'La corde n’a fortement oscillé qu’aux multiples entiers de la fréquence la plus basse — seules les formes adaptées aux extrémités ont survécu.',
    hi: 'डोरी केवल सबसे निम्न आवृत्ति के पूर्ण गुणजों पर ज़ोर से झूली — सिरों से मेल खाने वाले आकार ही बचे।',
    id: 'Tali berayun kuat hanya pada kelipatan bulat frekuensi terendah — hanya bentuk yang pas dengan ujung-ujungnya yang bertahan.',
    pt: 'A corda oscilou forte só nos múltiplos inteiros da frequência mais baixa — só sobreviveram as formas que cabem nas pontas.',
  },
} satisfies Record<string, LocalizedText>);

export type HarmonicsMessageKey = keyof typeof harmonicsMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로 (C1). */
export const text = (key: HarmonicsMessageKey): LocalizedText => harmonicsMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: HarmonicsMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const harmonicsSchema: BundleSchema = {
  id: HARMONICS_ID,
  label: text('label.title'),
  category: 'waves',
  description: text('label.description'),
  timeModel: 'periodic',

  // 조작기가 없다. 진동수 훑기가 자동으로 모든 후보를 지나가며 거르는 것을 보여 준다 —
  // 독자가 손잡이로 진동수를 맞추게 하면 봉우리가 좁아 대부분 「안 흔들림」 만 보게 된다.
  parameters: [],

  stages: [
    {
      id: 'tied-string',
      label: text('label.stage'),
      constants: {
        stringLength: STRING_LENGTH,
        waveSpeed: WAVE_SPEED,
        harmonicCount: HARMONIC_COUNT,
        peakAmplitude: PEAK_AMPLITUDE,
        damping: DAMPING,
        sweepFrom: SWEEP_FROM,
        sweepTo: SWEEP_TO,
      },
    },
  ],

  environments: [],

  views: [{ id: 'string', label: text('label.view'), default: true }],

  /** 줄 한 줄 + 응답 곡선 + 캡션 한 줄. */
  canvas: { height: 400, minHeight: 360 },

  /** 점선 틀을 먼저, 줄을 그 위에, 매듭 · 진동자 · 마디를 맨 위에. */
  drawOrder: 'scene',

  /**
   * 한 주기 18.6 초. 구동 진동수(f₁ 단위)가 단계마다 이렇게 간다 —
   *
   * - `rise` 0.5 → 1 · `hold-1` 1 에 머묾 · `sweep-2` 1 → 2 · `hold-2` 2 · `sweep-3` 2 → 3 ·
   *   `hold-3` 3 · `tail` 3 → 3.5 · `rest` 3.5 에 머물며 다 그린 응답 곡선을 보여 준다.
   * - 머무는 단계는 반파장이 맞는 자리라 줄이 n 개의 고리로 크게 흔들린다. 훑는 단계는
   *   진행도를 진동수에 **선형으로** 잇는다 — 진동 위상은 진동수를 시간으로 적분한 값이라
   *   (`physics.ts drivePhase`) 훑는 단계에 이징을 주면 그 적분이 어긋난다.
   * - 배음 수(`harmonicCount`)와 `hold-n` · `sweep-n` 단계는 짝이다. 상수만 바꾸면 없는 단계를
   *   부르게 된다 (장부 G13).
   */
  timeline: {
    phases: [
      { id: 'rise', duration: 2.0, caption: key('caption.sweep') },
      { id: 'hold-1', duration: 3.0, caption: key('caption.fit') },
      { id: 'sweep-2', duration: 2.2, caption: key('caption.sweep') },
      { id: 'hold-2', duration: 2.6, caption: key('caption.fit') },
      { id: 'sweep-3', duration: 2.2, caption: key('caption.sweep') },
      { id: 'hold-3', duration: 2.6, caption: key('caption.fit') },
      { id: 'tail', duration: 1.4, caption: key('caption.sweep') },
      { id: 'rest', duration: 2.6, caption: key('caption.rest') },
    ],
  },

  /** 도착한 순간 줄은 이미 기본 모양(고리 하나)으로 흔들리고, 응답 곡선에 첫 봉우리가 서 있다. */
  startAt: 2.6,

  /** 슬롯 하나. 가로축 눈금 아래 왼쪽. */
  caption: {
    anchor: { screen: 'bottom-left', offset: [16, -6] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 820,
    style: { colorRole: 'ink', emphasis: 'strong' },
    fade: 0.25,
  },

  // 그리드 · 카메라 단추 · 범례 · 제목 없음(기본). 응답 곡선의 축은 선 둘과 눈금 셋이면 된다.

  messages: harmonicsMessages,
};
