// ========================================================================
// fictitious-force — 선언
// ========================================================================
// 질문: 관성력이 가짜 힘이라는데, 무거운 것에는 더 세게 걸리나?
// 답의 동사: (무거운 추와 가벼운 추가) 나란히 기운다.
//
// 그네와 함께 도는 틀에서 옆으로 본 회전 그네. 회전 빠르기 ω 가 14 초 주기로 오가고,
// 두 추는 각자 자기 질량으로 힘을 계산해 따로 적분된다. 질량은 힘에 곱해지고 가속도에서
// 나뉘므로 두 줄은 언제나 같은 각도다.
// 원본: tasks/piece-lab/fictitious-force
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:fictitious-force` 와 문자 그대로 일치한다 (C4). */
export const FICTITIOUS_FORCE_ID = 'fictitious-force';

// ------------------------------------------------------------------------
// 물리 — 원본 상수 그대로 (SI)
// ------------------------------------------------------------------------

/** 중력 가속도 (m/s²). */
export const G = 9.8;
/** 기둥에서 팔 끝까지 (m). */
export const R = 1.5;
/** 줄 길이 (m). */
export const L = 2.0;
/** 줄 흔들림 감쇠 (1/s). */
export const DAMP = 1.5;
/** 왼쪽 추 질량 (kg). */
export const LIGHT_M = 1;
/** 오른쪽 추 기본 질량 (kg). */
export const DEFAULT_HEAVY_M = 3;
/** 회전 빠르기의 최소 · 최대 (rad/s) 와 한 주기 (s). */
export const OMEGA = { min: 1.4, max: 2.2, period: 14 } as const;
/**
 * 적분 걸음(초). 원본은 이 고정 걸음으로만 적분했다(piece-kit). 러너의 걸음은 기기마다
 * 다르므로 `step` 이 이 걸음으로 쪼개 쌓는다.
 */
export const FIXED_DT = 1 / 60;

// ------------------------------------------------------------------------
// 배치 — 원본 캔버스 860×360 px 의 좌표를 그대로 적는다.
// 월드 1 단위 = 원본 100 px, y 는 위 (scene 이 월드로 옮긴다).
// ------------------------------------------------------------------------

/** 원본 캔버스 크기(px). */
export const ORIGIN_CANVAS = { width: 860, height: 360 } as const;
/** 기둥 가로 자리 · 팔 높이 · 땅 높이 (px). */
export const FRAME = { cx: 430, armY: 70, groundY: 340 } as const;
/** 1 m 당 px. */
export const PPM = 75;
/** 힘 1 N 당 px. 두 추의 화살표 길이 비가 질량비와 같아야 하므로 자동 정규화하지 않는다. */
export const PPN = 3.5;
/** 기둥이 팔 위로 솟는 길이 · 꼭대기 고리(중심 높이 오프셋 · 가로 반지름 · 세로 반지름) (px). */
export const HUB = { poleAbove: 14, ringDy: -20, ringRx: 22, ringRy: 5 } as const;
/** 바깥 풍경: 나무 간격 · 흐르는 배율(틀 회전각 1 rad 당 px) · 반폭 · 높이 기본값 · 높이 계단 (px). */
export const SCENERY = { spacing: 96, pxPerRad: 140, halfWidth: 12, baseHeight: 26, heightStep: 9 } as const;
/** 추 반지름 = 이 값 × 질량의 세제곱근 (px). */
export const BOB_RADIUS = 9;
/** 원본 화살촉 최대 크기(px). */
export const ARROW_HEAD = 10;
/** 질량 글자: 추 가장자리에서 띄우는 틈 (px). */
export const MASS_LABEL_GAP = 2;
/** 힘 이름표 자리: 관성력은 추 위로, 중력은 추 왼쪽으로 · 중력 화살표 길이 대비 높이 (px). */
export const FORCE_LABEL = { inertialDy: -6, gravityDx: -34, gravityAt: 0.8 } as const;
/** 글자 크기(px) — 원본 13px. */
export const LABEL_FONT = 13;

/**
 * 프레이밍 — 원본 캔버스 전체와, 그 아래 캡션·조작기 줄. 원본은 조작기와 캡션을 캔버스
 * **아래** DOM 에 두었다. 임베드에서는 그림 위에 얹히므로 그 몫만큼 경계를 아래로 넓혀
 * 자리를 비운다. 고정값이라 카메라가 흔들리지 않는다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: 0, maxX: 8.6, minY: -0.62, maxY: 3.6 } as const;

// ------------------------------------------------------------------------
// 조작기
// ------------------------------------------------------------------------

export const MASS_RANGE: [number, number] = [1, 3];
export const MASS_STEP = 1;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const fictitiousForceMessages = Object.freeze({
  'label.title': {
    ko: '관성력',
    en: 'Fictitious force',
    ja: '慣性力',
    zh: '惯性力',
    ar: 'القوة الوهمية',
    es: 'Fuerza ficticia',
    fr: 'Force fictive',
    hi: 'छद्म बल',
    id: 'Gaya fiktif',
    pt: 'Força fictícia',
  },
  'label.operation': {
    ko: '비관성계에서 도입하는 겉보기 힘',
    en: 'The apparent force of a non-inertial frame',
    ja: '非慣性系で現れる見かけの力',
    zh: '非惯性参考系中的表观力',
    ar: 'القوة الظاهرية في إطار مرجعي غير قصوري',
    es: 'La fuerza aparente de un sistema de referencia no inercial',
    fr: 'La force apparente d’un référentiel non inertiel',
    hi: 'अजड़त्वीय निर्देश तंत्र का आभासी बल',
    id: 'Gaya semu dalam kerangka acuan non-inersial',
    pt: 'A força aparente de um referencial não inercial',
  },
  'label.stage': {
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
  'label.mass': {
    ko: '오른쪽 추의 질량',
    en: 'Mass of the right bob',
    ja: '右のおもりの質量',
    zh: '右侧摆球的质量',
    ar: 'كتلة الثقالة اليمنى',
    es: 'Masa de la pesa derecha',
    fr: 'Masse de la boule de droite',
    hi: 'दाएँ गोलक का द्रव्यमान',
    id: 'Massa bandul kanan',
    pt: 'Massa da bola da direita',
  },
  'label.massValue': {
    ko: '{m} kg',
    en: '{m} kg',
    ja: '{m} kg',
    zh: '{m} kg',
    ar: '{m} kg',
    es: '{m} kg',
    fr: '{m} kg',
    hi: '{m} kg',
    id: '{m} kg',
    pt: '{m} kg',
  },
  'label.inertial': {
    ko: '관성력',
    en: 'inertial force',
    ja: '慣性力',
    zh: '惯性力',
    ar: 'قوة القصور',
    es: 'fuerza de inercia',
    fr: 'force d’inertie',
    hi: 'जड़त्वीय बल',
    id: 'gaya inersia',
    pt: 'força de inércia',
  },
  'label.gravity': {
    ko: '중력',
    en: 'gravity',
    ja: '重力',
    zh: '重力',
    ar: 'الجاذبية',
    es: 'gravedad',
    fr: 'pesanteur',
    hi: 'गुरुत्व',
    id: 'gravitasi',
    pt: 'gravidade',
  },
  'caption.main': {
    ko: '관성력도 중력처럼 질량에 비례한다 — 그래서 무거운 추와 가벼운 추가 언제나 같은 각도로 기운다',
    en: 'The inertial force, like gravity, is proportional to mass — so the heavy bob and the light bob always lean at the same angle',
    ja: '慣性力も重力と同じく質量に比例する — だから重いおもりと軽いおもりはいつも同じ角度で傾く',
    zh: '惯性力和重力一样与质量成正比 — 所以重摆球和轻摆球总是倾斜同样的角度',
    ar: 'قوة القصور، مثل الجاذبية، تتناسب مع الكتلة — لذلك تميل الثقالة الثقيلة والثقالة الخفيفة دائمًا بالزاوية نفسها',
    es: 'La fuerza de inercia, como la gravedad, es proporcional a la masa — por eso la pesa pesada y la pesa ligera siempre se inclinan con el mismo ángulo',
    fr: 'La force d’inertie, comme la pesanteur, est proportionnelle à la masse — c’est pourquoi la boule lourde et la boule légère penchent toujours du même angle',
    hi: 'जड़त्वीय बल भी गुरुत्व की तरह द्रव्यमान के समानुपाती है — इसलिए भारी गोलक और हल्का गोलक हमेशा एक ही कोण पर झुकते हैं',
    id: 'Gaya inersia, seperti gravitasi, sebanding dengan massa — karena itu bandul berat dan bandul ringan selalu miring dengan sudut yang sama',
    pt: 'A força de inércia, como a gravidade, é proporcional à massa — por isso a bola pesada e a bola leve sempre se inclinam no mesmo ângulo',
  },
  'caption.equal': {
    ko: '관성력도 중력처럼 질량에 비례한다 — 그래서 두 추는 질량이 얼마든 언제나 같은 각도로 기운다',
    en: 'The inertial force, like gravity, is proportional to mass — so the two bobs lean at the same angle whatever their masses',
    ja: '慣性力も重力と同じく質量に比例する — だから二つのおもりは質量がいくらでも、いつも同じ角度で傾く',
    zh: '惯性力和重力一样与质量成正比 — 所以无论质量多少，两个摆球总是倾斜同样的角度',
    ar: 'قوة القصور، مثل الجاذبية، تتناسب مع الكتلة — لذلك تميل الثقالتان بالزاوية نفسها أيًّا كانت كتلتاهما',
    es: 'La fuerza de inercia, como la gravedad, es proporcional a la masa — por eso las dos pesas se inclinan con el mismo ángulo, sean cuales sean sus masas',
    fr: 'La force d’inertie, comme la pesanteur, est proportionnelle à la masse — c’est pourquoi les deux boules penchent du même angle, quelles que soient leurs masses',
    hi: 'जड़त्वीय बल भी गुरुत्व की तरह द्रव्यमान के समानुपाती है — इसलिए दोनों गोलक, उनका द्रव्यमान चाहे जो हो, एक ही कोण पर झुकते हैं',
    id: 'Gaya inersia, seperti gravitasi, sebanding dengan massa — karena itu kedua bandul miring dengan sudut yang sama, berapa pun massanya',
    pt: 'A força de inércia, como a gravidade, é proporcional à massa — por isso as duas bolas se inclinam no mesmo ângulo, quaisquer que sejam suas massas',
  },
} satisfies Record<string, LocalizedText>);

export type FictitiousForceMessageKey = keyof typeof fictitiousForceMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 통로. */
export const text = (key: FictitiousForceMessageKey): LocalizedText => fictitiousForceMessages[key];

/** 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: FictitiousForceMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const fictitiousForceSchema: BundleSchema = {
  id: FICTITIOUS_FORCE_ID,
  label: text('label.title'),
  category: 'mechanics',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 각도 · ω · 장력은 두지 않는다 (원본 inventory 「hidden」). 오른쪽 추 질량만 조작기로 둔다.
  parameters: [],

  stages: [{ id: 'default', label: text('label.stage'), constants: {} }],
  environments: [],
  views: [{ id: 'default', label: text('label.view'), default: true }],

  /** 원본 캔버스 360 px + 조작기 줄 + 캡션 줄. */
  canvas: { height: 430, minHeight: 400 },

  /**
   * 시간표를 두지 않는다. 원본은 단계 경계가 아니라 **누적 상태**로 움직인다 — ω 는 시각의
   * 함수(코사인)지만 두 줄의 각도와 풍경이 흐른 양은 그 ω 로 적분된 값이다. 그래서 `step`
   * 이 상태를 쌓는다. 원본은 t = 0 에 두 추가 이미 평형각으로 기울어 있는 채로 열리므로
   * (초기 상태가 곧 그것) `startAt` · `preroll` 도 없다.
   */

  // 원본이 그린 순서 그대로 겹친다 — 풍경 · 기둥 · (추마다) 줄 · 점선 · 중력 · 관성력 · 추.
  drawOrder: 'scene',

  // 원본은 캔버스 아래 한 줄, 16 px 본문 먹색. 상태와 무관한 고정 문장이다.
  // 두 추의 질량이 같아지면(조작기 1 kg) 「무거운 추와 가벼운 추」가 사실이 아니게 되므로
  // 그때만 같은 뜻의 다른 문장으로 바꾼다.
  caption: {
    anchor: { screen: 'bottom-left', offset: [-12, -40] },
    align: 'left',
    fontSize: 16,
    style: { colorRole: 'ink', emphasis: 'strong' },
    text: key('caption.main'),
    cases: [{ when: 'equalMass', text: key('caption.equal') }],
  },

  // 그리드도 카메라 버튼도 없다 (기본값).

  messages: fictitiousForceMessages,
};
