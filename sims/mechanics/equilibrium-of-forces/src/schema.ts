// ========================================================================
// equilibrium-of-forces — 선언
// ========================================================================
// 질문: 줄 세 가닥이 서로 다른 세기로 당기는데, 매듭은 왜 하필 그 자리에 멈춰 있나.
//
// 세 힘의 화살표를 끝과 끝으로 이었을 때 닫히는 자리가 멈추는 자리다. 닫히지
// 않으면 그 틈 쪽으로 끌려가고, 닫히는 순간 멈춘다. 동사는 「닫힌다」.
//
// 원본: tasks/piece-lab/equilibrium-of-forces/ (자유 구현)
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:equilibrium-of-forces` 와 문자 그대로 일치한다 (C4). */
export const EQUILIBRIUM_OF_FORCES_ID = 'equilibrium-of-forces';

// ------------------------------------------------------------------------
// 기하 — 월드 1 단위 = 원본 논리 좌표 100 px. y 는 위.
// 원본 캔버스는 860 × 340 이고, 월드 원점은 그 가운데 (430, 170) 이다.
// ------------------------------------------------------------------------

/** 원본 px 을 월드로. */
const PX = 0.01;
const CX = 430;
const CY = 170;
/** 원본 논리 좌표(y 아래) → 월드(y 위). */
const at = (x: number, y: number): readonly [number, number] => [(x - CX) * PX, (CY - y) * PX];

/** 천장 막대 양 끝 · 높이. 원본 (30, 16) ~ (450, 16). */
export const CEILING_LEFT = at(30, 16);
export const CEILING_RIGHT = at(450, 16);
/** 천장 굵기 · 기둥 굵기(화면 px). 원본 2 · 1.5. */
export const CEILING_WIDTH_PX = 2;
export const POST_WIDTH_PX = 1.5;

/** 왼쪽 · 오른쪽 도르래 가운데. 원본 A (70, 46) · B (410, 46). */
export const PULLEY_LEFT = at(70, 46);
export const PULLEY_RIGHT = at(410, 46);
/** 도르래 반지름. 원본 R 13 px. */
export const PULLEY_R = 13 * PX;
/** 도르래 가운데 점 반지름. 원본 2 px. */
export const PULLEY_HUB = 2 * PX;

/** 매듭 → 도르래 → 바깥 추 까지 줄 길이. 원본 ROPE_LEN 300 px. */
export const ROPE_LEN = 300 * PX;
/** 매듭 아래 가운데 추까지 줄 길이. 원본 HANG 26 px. */
export const HANG = 26 * PX;
/** 바깥 추 윗면이 도르래 가운데에서 내려갈 수 있는 최소 · 최대. 원본 A.y + 18 · H − 60 (= 280). */
export const DROP_MIN = 18 * PX;
export const DROP_MAX = (280 - 46) * PX;
/** 줄 굵기(화면 px). 원본 1.8. */
export const ROPE_WIDTH_PX = 1.8;

/** 추 한 칸 — 너비 · 높이 · 칸 사이. 원본 BW 26 · BH 11 · BGAP 1 px. */
export const BLOCK_W = 26 * PX;
export const BLOCK_H = 11 * PX;
export const BLOCK_GAP = 1 * PX;
/** 추 테두리 굵기(화면 px). 원본 1.2. */
export const BLOCK_EDGE_PX = 1.2;

/** 매듭 반지름. 원본 5 px. */
export const KNOT_R = 5 * PX;
/** 매듭을 끌 수 있는 범위. 원본 clampKnot x 110~380, y 100~290. */
export const KNOT_MIN = at(110, 290);
export const KNOT_MAX = at(380, 100);
/** 매듭을 잡는 반경(화면 px). 원본 28. */
export const GRAB_RADIUS_PX = 28;
/** 시작 자리 — 왼쪽 추가 4칸일 때의 평형 자리. 원본 knot (240.0, 182.1). */
export const KNOT_START = at(240.0, 182.1);

/** 도형 — 추 한 칸 = 34 px 짜리 화살표. 원본 U 34. */
export const UNIT = 34 * PX;
/** 도형의 시작점. 원본 O (680, 62). */
export const POLYGON_ORIGIN = at(680, 62);
/** 시작점 점 반지름. 원본 3 px. */
export const ORIGIN_DOT = 3 * PX;
/** 화살표 굵기(화면 px) · 머리 크기. 원본 lineWidth 2.2 · head 9 px. */
export const ARROW_WIDTH_PX = 2.2;
export const ARROW_HEAD = 9 * PX;
/** 칸 눈금 — 화살표를 가로지르는 길이 · 굵기. 원본 ±4 px · 1.4. */
export const TICK_LEN = 8 * PX;
export const TICK_WIDTH_PX = 1.4;

/** 캡션 줄 — 원본은 캔버스 아래 DOM 문단(여백 6 px, 줄 높이 24 px)이었다. */
export const Y_CAPTION = -(CY + 6 + 12) * PX;

/**
 * 프레이밍 — 원본 860 × 340 캔버스에 그 아래 캡션 줄 30 px 을 더한 경계다.
 * 매 프레임 같은 값이라 카메라가 흔들리지 않는다 (S-piece).
 */
export const SCENE_BOUNDS = { minX: -4.3, maxX: 4.3, minY: -2.0, maxY: 1.7 } as const;

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/**
 * 한 칸 무게가 주는 가속 크기(월드/s² × 전체 칸 수) · 감쇠. 원본 G 6000 px/s² · DAMP 7.
 * 2초 남짓에 닫히는 과감쇠라 틈이 다시 열렸다 닫히며 캡션이 깜박이지 않는다 (원본 NOTES).
 */
export const GRAVITY = 6000 * PX;
export const DAMP = 7;
/** 틈이 이보다 작으면 닫혔다고 본다(추 한 칸 기준). 그리기와 캡션이 같은 문턱을 쓴다. */
export const CLOSED_GAP = 0.03;
/** 추 칸 수 — 왼쪽(빠진 때 · 더해진 때) · 오른쪽 · 가운데. 원본 3·4 · 4 · 5. */
export const LEFT_FEW = 3;
export const LEFT_MANY = 4;
export const RIGHT_COUNT = 4;
export const MIDDLE_COUNT = 5;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const equilibriumOfForcesMessages = Object.freeze({
  'label.title': { ko: '힘의 평형', en: 'Equilibrium of forces', ja: '力のつり合い', zh: '力的平衡', ar: 'اتزان القوى', es: 'Equilibrio de fuerzas', fr: 'Équilibre des forces', hi: 'बलों का संतुलन', id: 'Kesetimbangan gaya', pt: 'Equilíbrio de forças' },
  'label.operation': { ko: '알짜힘이 0인 상태', en: 'Zero net force', ja: '合力が0の状態', zh: '合力为零', ar: 'محصلة القوى صفر', es: 'Fuerza neta nula', fr: 'Force résultante nulle', hi: 'शून्य परिणामी बल', id: 'Gaya total nol', pt: 'Força resultante nula' },
  'label.stage': { ko: '기본', en: 'Default', ja: '標準', zh: '默认', ar: 'افتراضي', es: 'Predeterminada', fr: 'Par défaut', hi: 'डिफ़ॉल्ट', id: 'Bawaan', pt: 'Padrão' },
  'label.view': { ko: '기본', en: 'Default', ja: '標準', zh: '默认', ar: 'افتراضي', es: 'Predeterminada', fr: 'Par défaut', hi: 'डिफ़ॉल्ट', id: 'Bawaan', pt: 'Padrão' },
  'caption.closed': {
    ko: '세 힘의 화살표가 닫혔다 — 매듭은 그 자리에 멈춰 있다',
    en: 'The three force arrows close up — the knot stays put',
    ja: '3つの力の矢印が閉じた — 結び目はその場に止まっている',
    zh: '三个力的箭头首尾闭合 — 绳结停在原处',
    ar: 'أسهم القوى الثلاث تنغلق — تبقى العقدة في مكانها',
    es: 'Las tres flechas de fuerza se cierran — el nudo se queda quieto',
    fr: 'Les trois flèches de force se referment — le nœud reste en place',
    hi: 'तीनों बलों के तीर बंद हो जाते हैं — गाँठ अपनी जगह टिकी रहती है',
    id: 'Ketiga panah gaya menutup — simpul tetap di tempatnya',
    pt: 'As três setas de força se fecham — o nó fica parado',
  },
  'caption.dragging': {
    ko: '매듭을 끌어낸 만큼 화살표가 벌어졌다 — 놓으면 틈 쪽으로 끌려간다',
    en: 'Pulling the knot away opens the arrows — let go and it is drawn toward the gap',
    ja: '結び目を引き出すと矢印が開く — 放すとすき間の方へ引かれる',
    zh: '把绳结拉开，箭头就张开 — 松手后它被拉向缺口',
    ar: 'سحب العقدة بعيدًا يفتح الأسهم — اتركها فتنجذب نحو الفجوة',
    es: 'Al apartar el nudo, las flechas se abren — suéltalo y es arrastrado hacia el hueco',
    fr: 'Écarter le nœud ouvre les flèches — lâchez-le et il est attiré vers l’écart',
    hi: 'गाँठ को खींचकर हटाने से तीर खुल जाते हैं — छोड़ें तो वह खाली जगह की ओर खिंच जाती है',
    id: 'Menarik simpul menjauh membuka panah — lepaskan dan simpul tertarik ke arah celah',
    pt: 'Afastar o nó abre as setas — solte e ele é puxado em direção à abertura',
  },
  'caption.open': {
    ko: '화살표가 닫히지 않았다 — 매듭이 틈 쪽으로 끌려간다',
    en: 'The arrows do not close — the knot is drawn toward the gap',
    ja: '矢印が閉じない — 結び目はすき間の方へ引かれる',
    zh: '箭头没有闭合 — 绳结被拉向缺口',
    ar: 'الأسهم لا تنغلق — تنجذب العقدة نحو الفجوة',
    es: 'Las flechas no se cierran — el nudo es arrastrado hacia el hueco',
    fr: 'Les flèches ne se referment pas — le nœud est attiré vers l’écart',
    hi: 'तीर बंद नहीं होते — गाँठ खाली जगह की ओर खिंचती है',
    id: 'Panah tidak menutup — simpul tertarik ke arah celah',
    pt: 'As setas não se fecham — o nó é puxado em direção à abertura',
  },
} satisfies Record<string, LocalizedText>);

export type EquilibriumOfForcesMessageKey = keyof typeof equilibriumOfForcesMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: EquilibriumOfForcesMessageKey): LocalizedText => equilibriumOfForcesMessages[key];

/** 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: EquilibriumOfForcesMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const equilibriumOfForcesSchema: BundleSchema = {
  id: EQUILIBRIUM_OF_FORCES_ID,
  label: text('label.title'),
  category: 'mechanics',
  operation: text('label.operation'),
  timeModel: 'periodic',
  parameters: [],

  stages: [
    {
      id: 'default',
      label: text('label.stage'),
      constants: {
        g: GRAVITY,
        damp: DAMP,
        closedGap: CLOSED_GAP,
        leftFew: LEFT_FEW,
        leftMany: LEFT_MANY,
        right: RIGHT_COUNT,
        middle: MIDDLE_COUNT,
      },
    },
  ],

  environments: [],
  views: [{ id: 'default', label: text('label.view'), default: true }],

  /** 원본 캔버스 340 px + 아래 캡션 줄 30 px. */
  canvas: { height: 370, minHeight: 370 },

  /**
   * 원본이 그린 순서 그대로 겹친다 — 천장 · 도르래 · 줄 · 추 · 매듭 · 알짜힘 ·
   * 도형 · 틈. 층 순서로는 줄(trajectory)과 추 테두리가 추 채움과 섞인다.
   */
  drawOrder: 'scene',

  /**
   * 왼쪽 추의 칸 수 대본 — 한 칸 빠진 6초(3칸) → 한 칸 더해진 6초(4칸). 12초 주기.
   * 단계마다의 칸 수는 `physics.PHASE_LEFT` 가 스테이지 상수 이름으로 가리킨다.
   *
   * **매듭 자리는 대본이 아니다.** 매듭은 `step` 이 알짜힘으로 적분하고, 대본이
   * 바꾸는 것은 칸 수 하나뿐이다. `step` 은 시간표 프레임을 받지 못하므로 상태의
   * 시계로 이 선언을 직접 읽는다 (NOTES 「어휘 부족」).
   *
   * `startAt` · `preroll` 은 두지 않는다. 원본은 시계를 0 에서 열고, "도착한 순간 이미
   * 틈이 열려 있다" 는 매듭을 4칸일 때의 평형 자리에 두고 3칸으로 시작해 만들었다.
   */
  timeline: {
    phases: [
      { id: 'removed', duration: 6 },
      { id: 'added', duration: 6 },
    ],
  },

  /**
   * 슬롯 하나. 문장은 시각이 아니라 **틈이 문턱 아래인지**와 **끄는 중인지**로 갈린다.
   * 위에서부터 훑어 참인 첫 항목이 이긴다 — 원본 `if` 순서 그대로다. 둘 다 아니면
   * `text`(닫히지 않았다). `closed` 는 scene 이 알짜힘 · 틈 화살표를 그리는 조건과 같다.
   */
  caption: {
    anchor: { world: [0, Y_CAPTION] },
    align: 'center',
    fontSize: 15,
    style: { colorRole: 'ink', emphasis: 'strong' },
    text: key('caption.open'),
    cases: [
      { when: 'closed', text: key('caption.closed') },
      { when: 'held', text: key('caption.dragging') },
    ],
  },

  /** 그리드도 카메라 버튼도 없다 (기본값). 크기는 추 칸과 화살표 눈금이 센다. */

  messages: equilibriumOfForcesMessages,
};
