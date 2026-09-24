// ========================================================================
// length-contraction — 선언
// ========================================================================
// 질문: 빠르게 지나가는 물체는 정말 짧아지는가 — 어느 쪽으로?
//
// 정지한 틀 하나에서 본다. 위에는 멈춰 있는 상자가 있고, 아래 레일로 그 상자와
// 똑같이 만든 상자가 0.8c 로 지나간다. 멈춘 상자의 두 끝에서 내린 점선이 아래
// 레일에 「제 길이 자리」 를 그어 둔다. 지나가는 상자는 그 자리의 윗변 · 아랫변에
// 꼭 맞은 채 옆으로만 모자라게 지나간다 — 진행 방향으로만 짧다 (L = L₀/γ).
// 옆면에 그린 원은 가로로만 눌린 타원이 된다.
//
// 가운데에 맞는 순간 정지 틀이 두 끝의 자리를 **같은 순간에** 찍어 남긴다
// (강조색 점선 윤곽). 상자가 떠난 뒤 그 기록에 치수선 L₀ · 3/5 L₀ 이 붙는다.
//
// 시간 지연(time-dilation) · 동시성(relativity-of-simultaneity) · 시공간 도표는
// 이 조각의 몫이 아니다. 여기서 일어나는 것은 「진행 방향으로만 짧아진다」 하나다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:length-contraction` 와 문자 그대로 일치한다 (C4). */
export const LENGTH_CONTRACTION_ID = 'length-contraction';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 지나가는 상자의 속력 v/c. 1/γ = √(1−β²) = 3/5 이 되는 값이다. */
export const BETA = 0.8;
/** β = 0.8 에 맞춘 줄어든 비(분자 · 분모). 계산해 줄이지 않고 선언한다 — β 와 짝으로 바꾼다(G143). */
export const RATIO_NUM = 3;
export const RATIO_DEN = 5;
/** 상자의 제 길이 L₀ (월드). 두 상자가 같다 — 똑같이 만든 상자다. */
export const PROPER_LENGTH = 3;
/** 상자의 높이(월드). 진행 방향에 수직이라 줄지 않는다. */
export const BOX_HEIGHT = 1;
/** 옆면에 그린 원의 반지름(월드, 멈춰 있을 때). 지나갈 때는 가로 반지름만 줄어 타원이 된다. */
export const MARK_RADIUS = 0.32;
/**
 * 화면에서 상자가 움직이는 빠르기(월드/초). c 를 화면에 두지 않으므로 이것은 눈이 따라갈 수
 * 있게 고른 연출 배율이다 — 0.8c 는 문안과 길이가 말하고, 빠르기의 절대값은 주장에 쓰이지 않는다.
 */
export const SCREEN_SPEED = 2.4;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이(초).
// 지나가는 상자는 `snap` 이 시작하는 순간 가운데(x = 0)에 온다. 그 전 `appear` + `approach`
// 동안 SCREEN_SPEED × (APPEAR + APPROACH) 만큼 왼쪽에서 온다(G129).
// ------------------------------------------------------------------------

/** 지나가는 상자가 왼쪽에서 나타나는 동안. */
export const APPEAR = 0.4;
/** 제 길이 자리 안으로 다가오는 동안. */
export const APPROACH = 1.2;
/** 가운데에 맞는 순간 — 두 끝의 자리를 찍고, 찍은 자리에 섬광이 퍼진다. */
export const SNAP = 0.5;
/** 찍힌 기록을 남기고 오른쪽으로 빠져나가며 흐려지는 동안. */
export const LEAVE = 1.1;
/** 치수선이 붙는 동안. */
export const COMPARE = 0.8;
/** 두 길이를 읽는 동안. */
export const HOLD = 2.6;
/** 기록이 흐려지며 다음 주기로 넘어가는 동안. */
export const FADE = 0.6;

// ------------------------------------------------------------------------
// 배치 — 월드. 위 레일(멈춘 상자) · 아래 레일(지나가는 상자) · 치수선.
// ------------------------------------------------------------------------

/** 멈춘 상자의 중심 높이. 아래 변이 위 레일에 얹힌다. */
export const REST_Y = 1.9;
/** 지나가는 상자의 중심 높이. 아래 변이 아래 레일에 얹힌다. */
export const MOVING_Y = 0;
/** 멈춘 상자 위 L₀ 치수선 높이. */
export const REST_DIM_Y = 2.7;
/** 찍힌 기록 아래 치수선 높이. */
export const SNAP_DIM_Y = -0.9;
/** 지나가는 상자 이름표 높이(상자 위). */
export const MOVING_LABEL_Y = 0.78;
/** 멈춘 상자 이름표의 오른쪽 끝(월드 x) — 상자 왼쪽 끝에서 띄운 자리. */
export const REST_LABEL_X = -1.8;

/**
 * 프레이밍은 주장의 일부다. 가로는 상자가 나타나는 자리부터 빠져나가는 자리까지,
 * 세로는 L₀ 치수선 글자 위부터 기록 치수선 아래 캡션 줄까지. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -5.2, maxX: 5.2, minY: -1.6, maxY: 3.05 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const lengthContractionMessages = Object.freeze({
  'label.title': {
    ko: '길이 수축',
    en: 'Length contraction',
    ja: '長さの収縮',
    zh: '长度收缩',
    ar: 'انكماش الطول',
    es: 'Contracción de la longitud',
    fr: 'Contraction des longueurs',
    hi: 'लंबाई संकुचन',
    id: 'Kontraksi panjang',
    pt: 'Contração do comprimento',
  },
  'label.operation': {
    ko: '운동 방향으로의 수축',
    en: 'Contraction along the direction of motion',
    ja: '運動方向に沿った収縮',
    zh: '沿运动方向的收缩',
    ar: 'انكماش على امتداد اتجاه الحركة',
    es: 'Contracción en la dirección del movimiento',
    fr: 'Contraction dans la direction du mouvement',
    hi: 'गति की दिशा में संकुचन',
    id: 'Kontraksi searah gerak',
    pt: 'Contração na direção do movimento',
  },
  'label.stage': {
    ko: '0.8c 로 지나가는 상자',
    en: 'A box passing at 0.8c',
    ja: '0.8c で通り過ぎる箱',
    zh: '以 0.8c 驶过的箱子',
    ar: 'صندوق يمر بسرعة 0.8c',
    es: 'Una caja que pasa a 0.8c',
    fr: 'Une boîte qui passe à 0.8c',
    hi: '0.8c से गुज़रता एक बक्सा',
    id: 'Kotak yang melintas pada 0.8c',
    pt: 'Uma caixa passando a 0.8c',
  },
  'label.view': {
    ko: '정지한 틀',
    en: 'Rest frame',
    ja: '静止系',
    zh: '静止参考系',
    ar: 'إطار السكون',
    es: 'Sistema en reposo',
    fr: 'Référentiel au repos',
    hi: 'विराम निर्देश तंत्र',
    id: 'Kerangka diam',
    pt: 'Referencial de repouso',
  },
  'label.rest': {
    ko: '멈춰 있는 상자',
    en: 'Box at rest',
    ja: '静止している箱',
    zh: '静止的箱子',
    ar: 'صندوق ساكن',
    es: 'Caja en reposo',
    fr: 'Boîte au repos',
    hi: 'विराम में बक्सा',
    id: 'Kotak diam',
    pt: 'Caixa em repouso',
  },
  'label.moving': {
    ko: '똑같은 상자 {beta}c →',
    en: 'Identical box {beta}c →',
    ja: '同じ箱 {beta}c →',
    zh: '相同的箱子 {beta}c →',
    ar: 'صندوق مطابق {beta}c →',
    es: 'Caja idéntica {beta}c →',
    fr: 'Boîte identique {beta}c →',
    hi: 'समरूप बक्सा {beta}c →',
    id: 'Kotak identik {beta}c →',
    pt: 'Caixa idêntica {beta}c →',
  },
  /** 제 길이. 기호라 두 언어가 같다. */
  'label.properLength': {
    ko: 'L₀',
    en: 'L₀',
    ja: 'L₀',
    zh: 'L₀',
    ar: 'L₀',
    es: 'L₀',
    fr: 'L₀',
    hi: 'L₀',
    id: 'L₀',
    pt: 'L₀',
  },
  /** 정해 둔 β 에 맞춘 줄어든 길이. 계산해 줄이지 않고 선언값을 쓴다 (S-piece 유효숫자). */
  'label.contracted': {
    ko: '{n}/{d} L₀',
    en: '{n}/{d} L₀',
    ja: '{n}/{d} L₀',
    zh: '{n}/{d} L₀',
    ar: '{n}/{d} L₀',
    es: '{n}/{d} L₀',
    fr: '{n}/{d} L₀',
    hi: '{n}/{d} L₀',
    id: '{n}/{d} L₀',
    pt: '{n}/{d} L₀',
  },
  'caption.approach': {
    ko: '멈춰 있는 상자와 똑같이 만든 상자가 빠르게 지나간다',
    en: 'A box built identical to the one at rest races past',
    ja: '静止した箱とまったく同じに作った箱が、高速で通り過ぎる',
    zh: '一个与静止箱子造得一模一样的箱子飞驰而过',
    ar: 'صندوق صُنع مطابقًا للصندوق الساكن يندفع مارًّا',
    es: 'Una caja construida idéntica a la que está en reposo pasa a toda velocidad',
    fr: 'Une boîte construite identique à celle au repos passe à toute vitesse',
    hi: 'विराम वाले बक्से जैसा ही बना एक बक्सा तेज़ी से गुज़रता है',
    id: 'Kotak yang dibuat identik dengan kotak diam melesat lewat',
    pt: 'Uma caixa construída idêntica à que está em repouso passa em alta velocidade',
  },
  'caption.snap': {
    ko: '같은 순간에 두 끝의 자리를 찍으면 — 위아래는 꼭 맞고 앞뒤만 모자란다',
    en: 'Marking both ends at the same instant — top and bottom fit, only the length falls short',
    ja: '同じ瞬間に両端の位置を記すと — 上下はぴったり合い、前後だけが足りない',
    zh: '在同一瞬间标出两端的位置 — 上下正好对齐，只有长度不够',
    ar: 'عند تعليم الطرفين في اللحظة نفسها — يتطابق الأعلى والأسفل، والطول وحده يقصر',
    es: 'Al marcar ambos extremos en el mismo instante — arriba y abajo encajan, solo la longitud se queda corta',
    fr: 'En marquant les deux bouts au même instant — le haut et le bas coïncident, seule la longueur est trop courte',
    hi: 'एक ही क्षण में दोनों सिरों को चिह्नित करने पर — ऊपर और नीचे ठीक बैठते हैं, केवल लंबाई कम पड़ती है',
    id: 'Menandai kedua ujung pada saat yang sama — atas dan bawah pas, hanya panjangnya yang kurang',
    pt: 'Marcando as duas pontas no mesmo instante — em cima e embaixo coincidem, só o comprimento fica curto',
  },
  'caption.result': {
    ko: '진행 방향 길이만 줄었다 — 높이는 그대로이고 옆면의 원은 가로로만 눌렸다',
    en: 'Only the length along the motion shrank — the height is unchanged, the circle squeezed only sideways',
    ja: '運動方向の長さだけが縮んだ — 高さはそのままで、側面の円は横にだけ押しつぶされた',
    zh: '只有沿运动方向的长度缩短了 — 高度不变，圆只在水平方向被压扁',
    ar: 'تقلّص الطول على امتداد الحركة وحده — الارتفاع لم يتغير، والدائرة انضغطت أفقيًا فقط',
    es: 'Solo se acortó la longitud en la dirección del movimiento — la altura no cambia, el círculo solo se aplastó de lado',
    fr: 'Seule la longueur dans le sens du mouvement a rétréci — la hauteur est inchangée, le cercle n’est écrasé que latéralement',
    hi: 'केवल गति की दिशा वाली लंबाई घटी — ऊँचाई वही है, वृत्त केवल क्षैतिज दिशा में दबा',
    id: 'Hanya panjang searah gerak yang menyusut — tingginya tetap, lingkaran hanya tertekan ke samping',
    pt: 'Só o comprimento ao longo do movimento encolheu — a altura não mudou, o círculo foi achatado só de lado',
  },
} satisfies Record<string, LocalizedText>);

export type LengthContractionMessageKey = keyof typeof lengthContractionMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: LengthContractionMessageKey): LocalizedText => lengthContractionMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: LengthContractionMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const lengthContractionSchema: BundleSchema = {
  id: LENGTH_CONTRACTION_ID,
  label: text('label.title'),
  category: 'modern',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 상자가 지나가고, 기록이 남고, 다시 온다.
  parameters: [],

  stages: [
    {
      id: 'passing',
      label: text('label.stage'),
      constants: {
        beta: BETA,
        ratioNum: RATIO_NUM,
        ratioDen: RATIO_DEN,
        properLength: PROPER_LENGTH,
        boxHeight: BOX_HEIGHT,
        markRadius: MARK_RADIUS,
        screenSpeed: SCREEN_SPEED,
      },
    },
  ],

  environments: [],

  views: [{ id: 'rest-frame', label: text('label.view'), default: true }],

  /** 가로 10.4 칸 · 세로 4.65 칸. 세로가 비싸다 — 레일 둘과 치수선 둘만 담는다. */
  canvas: { height: 360, minHeight: 320 },

  /** 제 길이 자리 점선 · 찍힌 기록이 지나가는 상자 아래로 깔려야 한다. */
  drawOrder: 'scene',

  /**
   * 한 주기 = 나타남 → 다가옴 → 가운데에서 찍음 → 빠져나감 → 치수선 → 읽음 → 흐려짐.
   * 지나가는 상자의 자리는 `snap` 시작에서 잰 시각의 함수다 — 그 순간 가운데에 선다.
   */
  timeline: {
    phases: [
      { id: 'appear', duration: APPEAR, caption: key('caption.approach') },
      { id: 'approach', duration: APPROACH, caption: key('caption.approach') },
      { id: 'snap', duration: SNAP, caption: key('caption.snap') },
      { id: 'leave', duration: LEAVE, caption: key('caption.snap') },
      { id: 'compare', duration: COMPARE, ease: 'smooth', caption: key('caption.result') },
      { id: 'hold', duration: HOLD, caption: key('caption.result') },
      { id: 'fade', duration: FADE, caption: key('caption.result') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — 상자가 제 길이 자리로 다가오는 중이다. */
  startAt: 0.4,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 공식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 720,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 견주는 것은 눈금 수가 아니라 **제 길이 자리에
   * 들어맞는가** 다 — 멈춘 상자에서 내린 점선이 그 자다.
   */

  messages: lengthContractionMessages,
};
