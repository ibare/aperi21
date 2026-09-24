// ========================================================================
// transverse-wave — 선언
// ========================================================================
// 질문: 줄을 흔들면 물결이 옆으로 나아가는데, 줄 자체도 옆으로 가는가.
//
// 줄 위의 구슬은 제자리에서 위아래로만 오르내린다 — 구슬 셋에 지나온 자리를 남기면
// 세로선만 긋는다. 그동안 마루 하나를 따라가면 그 자리는 가로선을 긋는다. 흔들림(세로)과
// 나아감(가로)은 직각이다.
//
// 이웃과 가르는 것 — 종파(`longitudinal-wave`)는 입자가 진행 방향을 따라 흔들리고 빽빽한
// 자리가 나아가는 그림이다. 이 조각은 그 화면(흩뿌린 입자 · 밀도 띠)을 되풀이하지 않고 한 줄
// 구슬로 간다. 파장 · 주기 · 속력의 관계(v = fλ)는 `wave-basics` 몫이라 λ · T 표지를 두지 않는다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:transverse-wave` 와 문자 그대로 일치한다 (C4). */
export const TRANSVERSE_WAVE_ID = 'transverse-wave';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 파장 λ(m). 줄 10 m 에 물결 세 벌 남짓이 보인다. */
export const WAVELENGTH = 3;
/** 진폭 A(m). */
export const AMPLITUDE = 0.6;
/** 진동수 f(Hz). 구슬이 2 초에 한 번 오르내린다. */
export const FREQUENCY = 0.5;

// ------------------------------------------------------------------------
// 배치 — 월드 미터. 줄은 x 축을 따라 놓이고 평형 자리가 y = 0 이다.
// ------------------------------------------------------------------------

/** 줄의 왼쪽 · 오른쪽 끝. */
export const ROPE_START = 0;
export const ROPE_END = 10;
/** 줄에 꿴 구슬의 간격. 41 개 — 한 파장에 열두 개라 줄의 모양을 따라 읽힌다. */
export const BEAD_GAP = 0.25;
/**
 * 자취를 남기는 구슬 셋의 자리. 서로 다른 높이(위상)에서 오르내리도록 한 파장 안에
 * 몰지 않고 줄에 고루 둔다.
 */
export const TAGGED_X: readonly number[] = [2.5, 5, 7.5];
/** 한 주기가 시작할 때 따라갈 마루가 있는 자리 — 줄 왼쪽 끝 가까이. */
export const CREST_START_X = 0.75;

/**
 * 프레이밍 — 가로는 줄 양 끝과 구슬 반지름, 세로는 진폭 ± 0.6 과 위의 캡션 줄 자리.
 * 매 프레임 같은 값이다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: -0.4, maxX: 10.4, minY: -0.8, maxY: 1.45 } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이 (조각 시계 초)
// ------------------------------------------------------------------------

/** 한 주기 = 구슬 한 번 오르내림(1/f). 단계 길이는 이 배수로 둔다 — 물결이 이음매 없이 돈다. */
const PERIOD = 1 / FREQUENCY;
/** 마루가 줄을 가로지르는 동안 — 세 주기. 마루는 x = 0.75 에서 9.75 까지 간다. */
export const TRAVEL = 3 * PERIOD;
/** 마루가 줄 끝을 떠난 뒤 두 자취를 나란히 두고 읽는 동안 — 한 주기. 구슬은 계속 제 세로선 위에서 오르내린다. */
export const HOLD = PERIOD;
/** 자취가 흐려지는 동안 — 한 주기. 합이 다섯 주기라 다음 주기로 넘어가도 줄이 튀지 않는다. */
export const FADE = PERIOD;
/** 도착한 순간 이미 진행 중이다 — 한 주기 뒤에서 연다. 구슬 자취가 다 찼고 마루는 한 파장을 왔다. */
export const START_AT = PERIOD;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const transverseWaveMessages = Object.freeze({
  'label.title': {
    ko: '횡파',
    en: 'Transverse wave',
    ja: '横波',
    zh: '横波',
    ar: 'الموجة المستعرضة',
    es: 'Onda transversal',
    fr: 'Onde transversale',
    hi: 'अनुप्रस्थ तरंग',
    id: 'Gelombang transversal',
    pt: 'Onda transversal',
  },
  'label.operation': {
    ko: '진동 방향이 진행 방향과 수직',
    en: 'The medium shakes at right angles to the direction the wave travels',
    ja: '媒質は波の進む向きと直角に揺れる',
    zh: '介质的振动方向与波的传播方向垂直',
    ar: 'يهتز الوسط عموديًا على اتجاه انتقال الموجة',
    es: 'El medio vibra en ángulo recto con la dirección en que viaja la onda',
    fr: 'Le milieu vibre perpendiculairement à la direction de propagation de l’onde',
    hi: 'माध्यम तरंग के चलने की दिशा के लंबवत कंपन करता है',
    id: 'Medium bergetar tegak lurus terhadap arah rambat gelombang',
    pt: 'O meio vibra em ângulo reto com a direção em que a onda se propaga',
  },
  'label.stage': {
    ko: '구슬 꿴 줄',
    en: 'Beaded rope',
    ja: '玉を通したロープ',
    zh: '串着珠子的绳',
    ar: 'حبل منظوم بالخرز',
    es: 'Cuerda con cuentas',
    fr: 'Corde à perles',
    hi: 'मनकों वाली रस्सी',
    id: 'Tali bermanik',
    pt: 'Corda com contas',
  },
  'label.view': {
    ko: '구슬과 마루의 자취',
    en: 'Traces of the beads and the crest',
    ja: '玉と山の軌跡',
    zh: '珠子与波峰的轨迹',
    ar: 'آثار الخرزات والقمة',
    es: 'Trazos de las cuentas y de la cresta',
    fr: 'Traces des perles et de la crête',
    hi: 'मनकों और शिखर के पथ-चिह्न',
    id: 'Jejak manik-manik dan puncak',
    pt: 'Rastros das contas e da crista',
  },
  'caption.travel': {
    ko: '구슬은 제자리에서 위아래로만 오르내리는데, 마루는 오른쪽으로 나아간다',
    en: 'The beads only move up and down in place, yet the crest moves on to the right',
    ja: '玉はその場で上下するだけなのに、山は右へ進んでいく',
    zh: '珠子只在原地上下运动，波峰却向右前进',
    ar: 'الخرزات تتحرك صعودًا وهبوطًا في مكانها فقط، ومع ذلك تتقدم القمة نحو اليمين',
    es: 'Las cuentas solo suben y bajan en su sitio, y aun así la cresta avanza hacia la derecha',
    fr: 'Les perles ne font que monter et descendre sur place, et pourtant la crête avance vers la droite',
    hi: 'मनके अपनी जगह पर केवल ऊपर-नीचे होते हैं, फिर भी शिखर दाईं ओर आगे बढ़ता है',
    id: 'Manik-manik hanya naik turun di tempatnya, tetapi puncak terus bergerak ke kanan',
    pt: 'As contas só sobem e descem no lugar, mas a crista avança para a direita',
  },
  'caption.result': {
    ko: '구슬이 남긴 자취는 세로선, 마루가 남긴 자취는 가로선 — 서로 직각이다',
    en: 'The beads left vertical lines, the crest left a horizontal one — at right angles to each other',
    ja: '玉が残したのは縦の線、山が残したのは横の線 — 互いに直角だ',
    zh: '珠子留下的是竖线，波峰留下的是一条横线 — 二者互相垂直',
    ar: 'تركت الخرزات خطوطًا رأسية، وتركت القمة خطًّا أفقيًا — متعامدة بعضها على بعض',
    es: 'Las cuentas dejaron líneas verticales; la cresta, una horizontal — perpendiculares entre sí',
    fr: 'Les perles ont laissé des lignes verticales, la crête une ligne horizontale — perpendiculaires entre elles',
    hi: 'मनकों ने ऊर्ध्वाधर रेखाएँ छोड़ीं, शिखर ने एक क्षैतिज रेखा — दोनों एक-दूसरे के लंबवत हैं',
    id: 'Manik-manik meninggalkan garis tegak, puncak meninggalkan satu garis mendatar — saling tegak lurus',
    pt: 'As contas deixaram linhas verticais, a crista deixou uma horizontal — perpendiculares entre si',
  },
} satisfies Record<string, LocalizedText>);

export type TransverseWaveMessageKey = keyof typeof transverseWaveMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: TransverseWaveMessageKey): LocalizedText => transverseWaveMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: TransverseWaveMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const transverseWaveSchema: BundleSchema = {
  id: TRANSVERSE_WAVE_ID,
  label: text('label.title'),
  category: 'waves',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 손잡이를 두지 않는다 — 파장 · 진폭 · 진동수를 바꿔도 「세로로 흔들리고 가로로 나아간다」 에
  // 더해지는 답이 없다.
  parameters: [],

  stages: [
    {
      id: 'rope',
      label: text('label.stage'),
      constants: { wavelength: WAVELENGTH, amplitude: AMPLITUDE, frequency: FREQUENCY },
    },
  ],

  environments: [],

  views: [{ id: 'rope', label: text('label.view'), default: true }],

  /** 가로로 긴 그림이다 — 줄 10 m 와 진폭 ± 0.6, 위의 캡션 한 줄뿐 (S-piece — 세로가 비싸다). */
  canvas: { height: 280, minHeight: 250 },

  /**
   * 겹침 순서가 판정 장치다 — 자취 → 줄 → 구슬 → 강조 구슬 → 마루 표지. 층 순서로는 자취
   * (trajectory)가 구슬(body) 위로 올라와 구슬을 가른다.
   */
  drawOrder: 'scene',

  /**
   * 마루가 줄을 가로지르는 세 주기 → 두 자취를 읽는 한 주기 → 자취가 흐려지는 한 주기. 물결 자체는 멈추지 않는다 —
   * 세 단계 합이 주기의 정수배라 다음 주기로 넘어가도 줄 모양이 이어진다.
   */
  timeline: {
    phases: [
      { id: 'travel', duration: TRAVEL, caption: key('caption.travel') },
      { id: 'hold', duration: HOLD, caption: key('caption.result') },
      { id: 'fade', duration: FADE, caption: key('caption.result') },
    ],
  },

  startAt: START_AT,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 횡파의 정의는 문단의 몫이다.
  caption: {
    anchor: { screen: 'top-left', offset: [4, 4] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 720,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  /** 그리드 · 카메라 단추 없음(기본값). 잴 것이 거리가 아니라 방향이다. */

  messages: transverseWaveMessages,
};
