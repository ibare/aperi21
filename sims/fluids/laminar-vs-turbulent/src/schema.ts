// ========================================================================
// laminar-vs-turbulent — 선언
// ========================================================================
// 질문: 흐름은 왜 서서히가 아니라 어느 순간 갑자기 흐트러지는가.
//
// "흐트러진다" 를 상태 전환이 아니라 **증폭**으로 옮긴다. 주사기 바늘이 늘
// 똑같은 크기의 미세한 흔들림을 넣고, 그 흔들림이 하류로 가면서 지수적으로
// 커지거나 사라진다. 성장률 σ 의 부호를 정하는 것은 오직 Re 다.
//
//   σ(Re) = k · (Re / 2300 − 1)
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:laminar-vs-turbulent` 와 문자 그대로 일치한다 (C4). */
export const LAMINAR_VS_TURBULENT_ID = 'laminar-vs-turbulent';

/** 물의 동점성 (m²/s). */
export const NU = 1.004e-6;
/** 임계 레이놀즈 수. 이 조각의 핵심 숫자는 하나뿐이다. */
export const RE_CRITICAL = 2300;
/** 관 지름 (m). Re = vD/ν. */
export const PIPE_DIAMETER = 0.02;
/** 성장률 계수. */
export const GROWTH_K = 30.8;

/**
 * 시퀀스가 훑는 유속 (m/s).
 *
 * 여섯 값을 훑고 나서 다시 첫 값으로 **내려온다** — 흐트러짐이 시간이나 이력의
 * 문제가 아니라 그 수의 문제임을 보이려고.
 */
export const SPEED_STOPS: readonly number[] = [0.05, 0.1, 0.1155, 0.15, 0.2, 0.25];
/**
 * 한 값에 머무는 시간과 다음 값으로 건너가는 시간(초). 선언은 스테이지 상수
 * `stopHold` · `stopRamp` 이고 이것은 비었을 때의 기본값이다.
 */
export const STOP_HOLD = 3.4;
export const STOP_RAMP = 1.1;
/** 눈금에서 손을 뗀 뒤 자동 진행으로 돌아가기까지(초). 선언은 스테이지 상수 `resumeAfter`. */
export const RESUME_AFTER = 5;

/**
 * 화면 좌표계. **관 길이를 몇 미터라고 주장하지 않는다** — 표에 없는 값이다.
 * 지킨 것은 화면 속도가 실제 v 에 비례한다는 것까지다.
 */
export const PIPE = { x0: 0, length: 1, halfWidth: 0.055, centerY: 0.22 } as const;
/** 유속(m/s) → 화면 속도(월드/초). */
export const SPEED_SCALE = 3.18;
/** 주입부가 관 앞머리에서 들어간 거리(월드). */
export const INJECT_X = 0.08;

/** Re 눈금 — 좌표계가 아니라 이 질문의 논거다. */
/**
 * 관에서 관 높이의 1.5 배쯤 떨어뜨린다. 더 멀면 세로를 잡아먹어 관이 작아지고,
 * 관이 작아지면 실이 접히는 것이 안 보인다.
 */
export const RE_TRACK = { y: 0.05, x0: 0.04, length: 0.92 } as const;
export const RE_RANGE: readonly [number, number] = [700, 5200];
/**
 * 눈금 양 끝의 유속(m/s) — `Re · ν / D` 를 미리 푼 값이다.
 *
 * 조작기 선언이 이 자리를 그대로 읽는다. 선언이 물리 함수를 불러 범위를 만들면
 * 저작자가 눈금을 편집할 자리가 코드로 내려간다 (원칙 2 · 7 ④).
 */
export const SPEED_RANGE: readonly [number, number] = [
  (RE_RANGE[0] * NU) / PIPE_DIAMETER,
  (RE_RANGE[1] * NU) / PIPE_DIAMETER,
];
/** 눈금에 숫자를 붙이는 값. 끌면서 커지는지 작아지는지 읽히게. */
export const RE_LABELS: readonly number[] = [1000, 2000, RE_CRITICAL, 3000, 4000, 5000];

/** 아래로 눈금 숫자와 "임계 레이놀즈 수" 이름표 자리를 더 잡는다. */
export const SCENE_BOUNDS = { minX: -0.02, maxX: 1.02, minY: -0.04, maxY: 0.31 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const laminarVsTurbulentMessages = Object.freeze({
  'label.title': {
    ko: '층류와 난류',
    en: 'Laminar and turbulent flow',
    ja: '層流と乱流',
    zh: '层流与湍流',
    ar: 'الجريان الطبقي والجريان المضطرب',
    es: 'Flujo laminar y turbulento',
    fr: 'Écoulement laminaire et turbulent',
    hi: 'स्तरीय और विक्षुब्ध प्रवाह',
    id: 'Aliran laminar dan turbulen',
    pt: 'Escoamento laminar e turbulento',
  },
  'label.operation': {
    ko: '흐름이 갑자기 흐트러지는 지점',
    en: 'Where flow suddenly breaks up',
    ja: '流れが急に乱れる地点',
    zh: '流动突然变乱的地方',
    ar: 'حيث يضطرب الجريان فجأة',
    es: 'Dónde el flujo se desordena de repente',
    fr: 'Là où l’écoulement se désorganise soudain',
    hi: 'जहाँ प्रवाह अचानक बिखर जाता है',
    id: 'Tempat aliran tiba-tiba menjadi kacau',
    pt: 'Onde o escoamento se desfaz de repente',
  },
  'label.stage': {
    ko: '관',
    en: 'Pipe',
    ja: '管',
    zh: '管道',
    ar: 'أنبوب',
    es: 'Tubería',
    fr: 'Conduite',
    hi: 'नली',
    id: 'Pipa',
    pt: 'Tubo',
  },
  'label.view': {
    ko: '염료',
    en: 'Dye',
    ja: '染料',
    zh: '染料',
    ar: 'الصبغة',
    es: 'Tinte',
    fr: 'Colorant',
    hi: 'रंजक',
    id: 'Zat warna',
    pt: 'Corante',
  },
  'caption.damping': {
    ko: '넣어준 흔들림이 아래로 가면서 잦아든다',
    en: 'The disturbance fades as it travels downstream',
    ja: '加えた揺らぎは下流へ進むにつれて弱まる',
    zh: '施加的扰动向下游传播时逐渐减弱',
    ar: 'يخمد الاضطراب وهو ينتقل مع التيار',
    es: 'La perturbación se atenúa a medida que avanza aguas abajo',
    fr: 'La perturbation s’atténue en descendant le courant',
    hi: 'विक्षोभ धारा के साथ आगे बढ़ते हुए मंद पड़ जाता है',
    id: 'Gangguan meredup saat bergerak ke hilir',
    pt: 'A perturbação se atenua à medida que segue a jusante',
  },
  'caption.neutral': {
    ko: '줄지도, 커지지도 않는다',
    en: 'It neither shrinks nor grows',
    ja: '小さくも大きくもならない',
    zh: '既不减弱，也不增强',
    ar: 'لا يصغر ولا يكبر',
    es: 'Ni se reduce ni crece',
    fr: 'Elle ne diminue ni ne grandit',
    hi: 'न घटता है, न बढ़ता है',
    id: 'Tidak mengecil, tidak pula membesar',
    pt: 'Não diminui nem cresce',
  },
  'caption.growing': {
    ko: '이번엔 스스로 커진다',
    en: 'This time it grows on its own',
    ja: '今度はひとりでに大きくなる',
    zh: '这一次它自行增强',
    ar: 'هذه المرة يكبر من تلقاء نفسه',
    es: 'Esta vez crece por sí sola',
    fr: 'Cette fois, elle grandit toute seule',
    hi: 'इस बार यह अपने आप बढ़ता है',
    id: 'Kali ini gangguan membesar dengan sendirinya',
    pt: 'Desta vez ela cresce sozinha',
  },
  'caption.upstream': {
    ko: '흐트러지는 자리가 입구 쪽으로 밀려 올라온다',
    en: 'The break-up point creeps toward the inlet',
    ja: '乱れ始める位置が入口のほうへ押し上がってくる',
    zh: '开始紊乱的位置向入口一侧推进',
    ar: 'تزحف نقطة الاضطراب نحو المدخل',
    es: 'El punto donde se desordena avanza hacia la entrada',
    fr: 'Le point de rupture remonte vers l’entrée',
    hi: 'बिखरने का स्थान धीरे-धीरे प्रवेश-द्वार की ओर खिसकता है',
    id: 'Titik mulai kacau merayap ke arah lubang masuk',
    pt: 'O ponto onde o escoamento se desfaz avança rumo à entrada',
  },
  /** 눈금의 이름. 무엇의 눈금인지 모르면 2300 이 무엇인지도 모른다. */
  'label.axis': {
    ko: '레이놀즈 수 — 빠를수록, 관이 굵을수록 커진다',
    en: 'Reynolds number — larger when faster or in a wider pipe',
    ja: 'レイノルズ数 — 速いほど、管が太いほど大きい',
    zh: '雷诺数 — 流速越快、管道越粗就越大',
    ar: 'عدد رينولدز — يكبر كلما زادت السرعة أو اتسع الأنبوب',
    es: 'Número de Reynolds — mayor cuanto más rápido o más ancha la tubería',
    fr: 'Nombre de Reynolds — plus grand si l’écoulement est plus rapide ou la conduite plus large',
    hi: 'रेनॉल्ड्स संख्या — जितनी तेज़ चाल या जितनी चौड़ी नली, उतनी बड़ी',
    id: 'Bilangan Reynolds — makin besar bila makin cepat atau pipanya makin lebar',
    pt: 'Número de Reynolds — maior quanto mais rápido ou mais largo o tubo',
  },
  /** 2300 눈금 아래 이름표. */
  'label.critical': {
    ko: '임계 레이놀즈 수',
    en: 'Critical Reynolds number',
    ja: '臨界レイノルズ数',
    zh: '临界雷诺数',
    ar: 'عدد رينولدز الحرج',
    es: 'Número de Reynolds crítico',
    fr: 'Nombre de Reynolds critique',
    hi: 'क्रांतिक रेनॉल्ड्स संख्या',
    id: 'Bilangan Reynolds kritis',
    pt: 'Número de Reynolds crítico',
  },
  /** 붉은 실의 정체. */
  'label.dye': {
    ko: '염료 — 흐름을 보이게 관 가운데로 넣은 색소',
    en: 'Dye — injected at the center to make the flow visible',
    ja: '染料 — 流れを見えるようにするため管の中心に入れた色素',
    zh: '染料 — 为使流动可见而注入管道中央的色素',
    ar: 'الصبغة — تُحقن في المنتصف لتجعل الجريان مرئيًا',
    es: 'Tinte — inyectado en el centro para hacer visible el flujo',
    fr: 'Colorant — injecté au centre pour rendre l’écoulement visible',
    hi: 'रंजक — प्रवाह को दिखाने के लिए बीच में डाला गया',
    id: 'Zat warna — disuntikkan di tengah agar aliran terlihat',
    pt: 'Corante — injetado no centro para tornar o escoamento visível',
  },
  /** 손잡이 옆 지금 값. 기호와 수라 번역하지 않는다 (C1 판정 3). */
  'label.re': {
    ko: 'Re {re}',
    en: 'Re {re}',
    ja: 'Re {re}',
    zh: 'Re {re}',
    ar: 'Re {re}',
    es: 'Re {re}',
    fr: 'Re {re}',
    hi: 'Re {re}',
    id: 'Re {re}',
    pt: 'Re {re}',
  },
} satisfies Record<string, LocalizedText>);

export type LaminarMessageKey = keyof typeof laminarVsTurbulentMessages;

export function text(key: LaminarMessageKey): LocalizedText {
  return laminarVsTurbulentMessages[key];
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const laminarVsTurbulentSchema: BundleSchema = {
  id: LAMINAR_VS_TURBULENT_ID,
  label: text('label.title'),
  category: 'fluids',
  operation: text('label.operation'),
  timeModel: 'linear',

  // 아무것도 누르지 않아도 여섯 값을 훑으며 할 말을 마친다. 그와 별개로 눈금을 직접
  // 끌어 값을 잡을 수 있다 (controllers.ts).
  parameters: [],

  stages: [
    {
      id: 'pipe',
      label: text('label.stage'),
      constants: {
        nu: NU,
        reCritical: RE_CRITICAL,
        diameter: PIPE_DIAMETER,
        stopHold: STOP_HOLD,
        stopRamp: STOP_RAMP,
        resumeAfter: RESUME_AFTER,
      },
    },
  ],

  environments: [],
  views: [{ id: 'dye', label: text('label.view'), default: true }],

  /**
   * 가로로 긴 관이 필수다. 성장이 **하류로 진행되는 것**을 보여야 하기 때문에
   * 정사각형 무대에서는 이 그림이 성립하지 않는다.
   */
  canvas: { height: 300, minHeight: 260 },

  messages: laminarVsTurbulentMessages,
};
