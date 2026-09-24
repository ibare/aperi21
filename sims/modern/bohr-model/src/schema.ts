// ========================================================================
// bohr-model — 선언
// ========================================================================
// 질문: 원자 속 전자는 아무 데서나 돌 수 있는가, 빛은 언제 나오는가.
//
// 전자는 반지름이 n²a₀ 인 궤도(1a₀ · 4a₀ · 9a₀)에만 있을 수 있다. 그 사이 어디에도 머물지
// 않고 한 궤도에서 다른 궤도로 **건너뛴다.** 바깥에서 안쪽으로 건너뛸 때 두 준위의 차만큼의
// 에너지를 가진 빛 하나가 나온다 — n=3→2 는 1.89 eV 의 빨간 656 nm, n=2→1 은 10.2 eV 의
// 자외선 122 nm.
//
// 이웃과 겹치지 않는 자리 — `hydrogen-spectrum` 은 많은 전자의 낙차가 띠의 몇 자리에 쌓이는
// 것(선 목록)이고, `atomic-orbital` 은 잴 때마다 찍히는 자리의 구름이다. 이 조각은 **전자 하나의
// 궤도 기하**와 한 번의 도약이 내는 빛 하나다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:bohr-model` 와 문자 그대로 일치한다 (C4). */
export const BOHR_MODEL_ID = 'bohr-model';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 화면에 뜨는 수는 계산값이 아니라 여기 선언한 정박값이다 (S-piece 유효숫자).
// ------------------------------------------------------------------------

/** 보어 반지름 a₀ 을 월드 몇 단위로 그리는가. 궤도 반지름 = n² × 이 값. */
export const BOHR_RADIUS = 1.15;

/** 세 준위의 번호 — 바깥 · 가운데 · 안쪽. */
export const N_OUTER = 3;
export const N_MIDDLE = 2;
export const N_INNER = 1;

/** 세 준위 에너지의 크기(eV). 화면에는 `−{e} eV` 로 뜬다. Eₙ = −13.6 eV / n². */
export const E_OUTER = 1.51;
export const E_MIDDLE = 3.4;
export const E_INNER = 13.6;

/** 바깥 → 가운데 도약이 내는 빛 — 에너지(eV) · 파장(nm). */
export const PHOTON_OUTER_EV = 1.89;
export const PHOTON_OUTER_NM = 656;
/** 가운데 → 안쪽 도약이 내는 빛 — 에너지(eV) · 파장(nm). 가시광 밖(자외선)이다. */
export const PHOTON_INNER_EV = 10.2;
export const PHOTON_INNER_NM = 122;

/**
 * n=1 궤도의 각속도(rad/s, 화면 시간). ωₙ = ω₁ / n³ 라 바깥 궤도일수록 느리다.
 * 실제 값(10¹⁶ rad/s)은 볼 수 없어 이만큼 늦췄다 — 비 1 : 1/8 : 1/27 만 물리다.
 * 이 값이면 n=2 에서 한 바퀴를 조금 못 돌고 다음 도약을 맞아 두 도약이 모두 원자 오른쪽에서 일어난다.
 */
export const OMEGA_1 = 16.6;

/** 바깥 궤도에서 건너뛰는 자리의 각(rad, +x 에서 반시계). 빛이 오른쪽으로 곧장 나가게 오른쪽 위. */
export const JUMP_ANGLE = 0.5;

/**
 * 파장을 물결 간격으로 그리는 배율(월드 단위 / nm). 656 nm 가 약 3 단위, 122 nm 가 약 0.55 단위.
 * 실제 파장은 원자보다 만 배쯤 길어 궤도와 같은 축척으로 그릴 수 없다 — 이 배율은 두 빛의
 * **간격 비**를 보이려는 것이다 (NOTES (b)).
 */
export const WAVE_SCALE = 0.0045;
/** 빛이 날아가는 속력(월드 단위 / s, 화면 시간). */
export const PHOTON_SPEED = 14;
/** 빛 물결 묶음의 길이 · 진폭(월드 단위). 두 빛이 같다 — 다른 것은 간격뿐이다. */
export const PACKET_LENGTH = 7;
export const PACKET_AMPLITUDE = 0.8;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 원자의 핵이 원점.
// ------------------------------------------------------------------------

/** 에너지 사다리 — 선의 가로 범위와, 0 eV · n=1 이 놓이는 높이. */
export const LADDER = { x0: -27, x1: -21.5, yZero: 10.3, yInner: -9 } as const;

/** 프레이밍 — 사다리 이름표부터 빛이 나가는 오른쪽까지, 원자 위아래와 캡션 띠(장부 G24). */
export const SCENE_BOUNDS = { minX: -31, maxX: 33, minY: -14.2, maxY: 11.6 } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이(초)
// ------------------------------------------------------------------------

/** 전자가 바깥 궤도에 나타나는 동안 · 그 궤도를 도는 동안. */
export const ENTER = 0.5;
export const ORBIT = 2.2;
/** 건너뛰는 동안 — 짧다. 사이를 지나가는 것이 아니라 한쪽에서 사라지고 다른 쪽에 나타난다. */
export const JUMP = 0.35;
/** 빛이 날아가는 동안(전자는 새 궤도를 돈다). */
export const FLY_OUTER = 2.6;
export const FLY_INNER = 2.4;
/** 안쪽 궤도에 머무는 동안 · 흐려지는 동안. */
export const HOLD = 1.6;
export const FADE = 0.6;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const bohrModelMessages = Object.freeze({
  'label.title': {
    ko: '보어 모형',
    en: 'Bohr model',
    ja: 'ボーア模型',
    zh: '玻尔模型',
    ar: 'نموذج بور',
    es: 'Modelo de Bohr',
    fr: 'Modèle de Bohr',
    hi: 'बोर मॉडल',
    id: 'Model atom Bohr',
    pt: 'Modelo de Bohr',
  },
  'label.operation': {
    ko: '궤도의 양자화',
    en: 'Quantized orbits',
    ja: '量子化された軌道',
    zh: '量子化的轨道',
    ar: 'مدارات مُكمّاة',
    es: 'Órbitas cuantizadas',
    fr: 'Orbites quantifiées',
    hi: 'क्वांटीकृत कक्षाएँ',
    id: 'Orbit terkuantisasi',
    pt: 'Órbitas quantizadas',
  },
  'label.stage': {
    ko: '수소 원자',
    en: 'Hydrogen atom',
    ja: '水素原子',
    zh: '氢原子',
    ar: 'ذرة الهيدروجين',
    es: 'Átomo de hidrógeno',
    fr: 'Atome d’hydrogène',
    hi: 'हाइड्रोजन परमाणु',
    id: 'Atom hidrogen',
    pt: 'Átomo de hidrogênio',
  },
  'label.view': {
    ko: '궤도와 준위',
    en: 'Orbits and levels',
    ja: '軌道と準位',
    zh: '轨道与能级',
    ar: 'المدارات والمستويات',
    es: 'Órbitas y niveles',
    fr: 'Orbites et niveaux',
    hi: 'कक्षाएँ और ऊर्जा स्तर',
    id: 'Orbit dan tingkat energi',
    pt: 'Órbitas e níveis',
  },
  /** 준위 번호 · 궤도 반지름 · 에너지 — 기호와 단위라 표식이다 (C1 판정 3). 값은 vars 로 끼운다. */
  'label.level': {
    ko: 'n={n}',
    en: 'n={n}',
    ja: 'n={n}',
    zh: 'n={n}',
    ar: 'n={n}',
    es: 'n={n}',
    fr: 'n={n}',
    hi: 'n={n}',
    id: 'n={n}',
    pt: 'n={n}',
  },
  'label.radius': {
    ko: '{k}a₀',
    en: '{k}a₀',
    ja: '{k}a₀',
    zh: '{k}a₀',
    ar: '{k}a₀',
    es: '{k}a₀',
    fr: '{k}a₀',
    hi: '{k}a₀',
    id: '{k}a₀',
    pt: '{k}a₀',
  },
  'label.energy': {
    ko: '−{e} eV',
    en: '−{e} eV',
    ja: '−{e} eV',
    zh: '−{e} eV',
    ar: '−{e} eV',
    es: '−{e} eV',
    fr: '−{e} eV',
    hi: '−{e} eV',
    id: '−{e} eV',
    pt: '−{e} eV',
  },
  /** 빛 하나의 에너지와 파장. */
  'label.photon': {
    ko: '{e} eV · {nm} nm',
    en: '{e} eV · {nm} nm',
    ja: '{e} eV · {nm} nm',
    zh: '{e} eV · {nm} nm',
    ar: '{e} eV · {nm} nm',
    es: '{e} eV · {nm} nm',
    fr: '{e} eV · {nm} nm',
    hi: '{e} eV · {nm} nm',
    id: '{e} eV · {nm} nm',
    pt: '{e} eV · {nm} nm',
  },
  /** 가시광 밖의 빛 — 색이 없으니 이름을 붙인다. 낱말이 끼어 문안이다. */
  'label.photonUv': {
    ko: '{e} eV · {nm} nm 자외선',
    en: '{e} eV · {nm} nm ultraviolet',
    ja: '{e} eV · {nm} nm 紫外線',
    zh: '{e} eV · {nm} nm 紫外线',
    ar: '{e} eV · {nm} nm فوق البنفسجية',
    es: '{e} eV · {nm} nm ultravioleta',
    fr: '{e} eV · {nm} nm ultraviolet',
    hi: '{e} eV · {nm} nm पराबैंगनी',
    id: '{e} eV · {nm} nm ultraungu',
    pt: '{e} eV · {nm} nm ultravioleta',
  },
  'caption.orbit': {
    ko: '전자는 허용된 궤도 위에서만 돈다 — 궤도 사이 어디에도 머물지 않는다',
    en: 'The electron circles only on the allowed orbits — it never stays anywhere in between',
    ja: '電子は許された軌道の上だけを回る — その間のどこにもとどまらない',
    zh: '电子只在允许的轨道上绕行 — 从不停留在轨道之间的任何地方',
    ar: 'لا يدور الإلكترون إلا على المدارات المسموح بها — ولا يبقى أبدًا في أي موضع بينها',
    es: 'El electrón gira solo en las órbitas permitidas — nunca se queda en ningún punto intermedio',
    fr: 'L’électron ne tourne que sur les orbites permises — il ne séjourne jamais entre elles',
    hi: 'इलेक्ट्रॉन केवल अनुमत कक्षाओं पर घूमता है — बीच में कहीं नहीं ठहरता',
    id: 'Elektron hanya beredar di orbit yang diizinkan — tidak pernah berada di antaranya',
    pt: 'O elétron gira só nas órbitas permitidas — nunca fica em nenhum ponto entre elas',
  },
  'caption.jumpOuter': {
    ko: '바깥 궤도에서 안쪽 궤도로 건너뛰는 순간, 두 준위의 차만큼의 에너지를 가진 빛 하나가 나온다',
    en: 'The instant it jumps from an outer orbit to an inner one, one photon carrying exactly the gap between the two levels comes out',
    ja: '外側の軌道から内側の軌道へ跳び移る瞬間、二つの準位の差にちょうど等しいエネルギーをもつ光子が一つ出てくる',
    zh: '从外层轨道跳到内层轨道的瞬间，发出一个光子，其能量恰好等于两个能级之差',
    ar: 'في لحظة قفزه من مدار خارجي إلى مدار داخلي، يخرج فوتون واحد يحمل تمامًا الفرق بين المستويين',
    es: 'En el instante en que salta de una órbita exterior a una interior, sale un fotón que lleva exactamente la diferencia entre los dos niveles',
    fr: 'À l’instant où il saute d’une orbite extérieure à une orbite intérieure, il émet un photon qui emporte exactement l’écart entre les deux niveaux',
    hi: 'जिस क्षण वह बाहरी कक्षा से भीतरी कक्षा में कूदता है, दोनों स्तरों के ठीक अंतर जितनी ऊर्जा वाला एक फोटॉन निकलता है',
    id: 'Saat ia melompat dari orbit luar ke orbit dalam, keluar satu foton yang membawa tepat selisih kedua tingkat energi',
    pt: 'No instante em que salta de uma órbita externa para uma interna, sai um fóton que leva exatamente a diferença entre os dois níveis',
  },
  'caption.jumpInner': {
    ko: '더 깊이 건너뛰면 차가 커서, 물결이 촘촘한 빛 — 눈에 안 보이는 자외선이 나온다',
    en: 'A deeper jump means a bigger gap, so a tightly waved photon comes out — invisible ultraviolet',
    ja: 'より深く跳ぶと差が大きく、波の詰まった光子が出てくる — 目に見えない紫外線だ',
    zh: '跳得更深，差值更大，于是发出波纹密集的光子 — 看不见的紫外线',
    ar: 'القفزة الأعمق تعني فرقًا أكبر، فيخرج فوتون متقارب الموجات — أشعة فوق بنفسجية غير مرئية',
    es: 'Un salto más profundo significa una diferencia mayor, así que sale un fotón de ondas apretadas — ultravioleta invisible',
    fr: 'Un saut plus profond, c’est un écart plus grand : il sort un photon aux ondes serrées — de l’ultraviolet invisible',
    hi: 'गहरी छलाँग का अर्थ है बड़ा अंतर, इसलिए घनी तरंगों वाला फोटॉन निकलता है — अदृश्य पराबैंगनी',
    id: 'Lompatan yang lebih dalam berarti selisih lebih besar, sehingga keluar foton bergelombang rapat — ultraungu yang tak terlihat',
    pt: 'Um salto mais fundo significa uma diferença maior, então sai um fóton de ondas apertadas — ultravioleta invisível',
  },
  'caption.ground': {
    ko: '가장 안쪽 궤도에서는 더 내려갈 곳이 없어 빛도 더 나오지 않는다',
    en: 'On the innermost orbit there is nowhere lower to go, so no more light comes out',
    ja: 'いちばん内側の軌道ではもう下がる先がなく、光もそれ以上出てこない',
    zh: '在最内层轨道上已无处可降，所以不再发出光',
    ar: 'على المدار الأعمق لا يوجد مستوى أدنى ينتقل إليه، فلا يخرج مزيد من الضوء',
    es: 'En la órbita más interna no hay adónde bajar, así que ya no sale más luz',
    fr: 'Sur l’orbite la plus intérieure, il n’y a plus nulle part où descendre : plus aucune lumière ne sort',
    hi: 'सबसे भीतरी कक्षा में नीचे जाने की कोई जगह नहीं, इसलिए अब और प्रकाश नहीं निकलता',
    id: 'Di orbit terdalam tidak ada tempat lebih rendah untuk dituju, jadi tidak ada lagi cahaya yang keluar',
    pt: 'Na órbita mais interna não há para onde descer, então não sai mais luz',
  },
} satisfies Record<string, LocalizedText>);

export type BohrModelMessageKey = keyof typeof bohrModelMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: BohrModelMessageKey): LocalizedText => bohrModelMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: BohrModelMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const bohrModelSchema: BundleSchema = {
  id: BOHR_MODEL_ID,
  label: text('label.title'),
  category: 'modern',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 한 주기 안에 두 번 건너뛰고 빛 둘을 내며 할 말을 마친다.
  parameters: [],

  stages: [
    {
      id: 'hydrogen',
      label: text('label.stage'),
      constants: {
        bohrRadius: BOHR_RADIUS,
        nOuter: N_OUTER,
        nMiddle: N_MIDDLE,
        nInner: N_INNER,
        eOuter: E_OUTER,
        eMiddle: E_MIDDLE,
        eInner: E_INNER,
        photonOuterEv: PHOTON_OUTER_EV,
        photonOuterNm: PHOTON_OUTER_NM,
        photonInnerEv: PHOTON_INNER_EV,
        photonInnerNm: PHOTON_INNER_NM,
        omega1: OMEGA_1,
        jumpAngle: JUMP_ANGLE,
        waveScale: WAVE_SCALE,
        photonSpeed: PHOTON_SPEED,
        packetLength: PACKET_LENGTH,
        packetAmplitude: PACKET_AMPLITUDE,
      },
    },
  ],

  environments: [],

  views: [{ id: 'atom', label: text('label.view'), default: true }],

  /** 가로로 넓다 — 사다리 · 원자 · 빛이 나가는 길이 옆으로 놓인다. 세로는 원자 하나와 캡션 줄. */
  canvas: { height: 380, minHeight: 340 },

  /** 겹침은 scene 에 쓴 순서 — 궤도선 위에 도약 점선, 그 위에 전자, 맨 위에 이름표. */
  drawOrder: 'scene',

  /**
   * 한 주기 = 나타남 → 바깥 궤도를 돎 → 3→2 도약 → 빛이 날아감 → 2→1 도약 → 빛이 날아감 →
   * 안쪽 궤도에 머묾 → 흐려짐. 흐려진 뒤 다시 바깥 궤도에서 시작한다.
   */
  timeline: {
    phases: [
      { id: 'enter', duration: ENTER, caption: key('caption.orbit') },
      { id: 'orbit', duration: ORBIT, caption: key('caption.orbit') },
      { id: 'jumpOuter', duration: JUMP, caption: key('caption.jumpOuter') },
      { id: 'flyOuter', duration: FLY_OUTER, caption: key('caption.jumpOuter') },
      { id: 'jumpInner', duration: JUMP, caption: key('caption.jumpInner') },
      { id: 'flyInner', duration: FLY_INNER, caption: key('caption.jumpInner') },
      { id: 'hold', duration: HOLD, caption: key('caption.ground') },
      { id: 'fade', duration: FADE, caption: key('caption.ground') },
    ],
  },

  /** 도착한 순간 전자가 이미 바깥 궤도를 돌고 있고, 곧 건너뛴다. */
  startAt: 1.2,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 식과 정의는 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  messages: bohrModelMessages,
};
