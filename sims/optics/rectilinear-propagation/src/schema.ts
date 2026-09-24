// ========================================================================
// rectilinear-propagation — 선언
// ========================================================================
// 질문: 그림자의 끝은 어디서 정해지는가.
//
// 어두운 방에 점광원 · 가림판 · 스크린이 한 줄로 놓여 있다. 광원에서 나간 빛은
// 곧게 가서, 가림판에 걸린 줄기는 거기서 끝나고 비껴간 줄기는 스크린에 닿는다.
// 가림판 위 · 아래 가장자리를 스치는 두 곧은 선이 스크린에 닿는 자리가 그림자의
// 끝이다. 가림판이 광원 쪽으로 옮겨 가면 두 선이 더 크게 벌어져 그림자가 커진다.
//
// 광원은 점이다 — 광원 크기가 만드는 반그림자는 이웃 `shadow-umbra-penumbra` 의 몫이다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:rectilinear-propagation` 와 문자 그대로 일치한다 (C4). */
export const RECTILINEAR_PROPAGATION_ID = 'rectilinear-propagation';

// ------------------------------------------------------------------------
// 물리 · 표시 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 점광원 자리(월드). */
export const SOURCE_X = -4;
export const SOURCE_Y = 0;
/** 스크린 앞면의 x(월드)와 스크린 반높이. 광원 → 스크린 거리 = 8. */
export const SCREEN_X = 4;
export const SCREEN_HALF = 2.1;
/** 가림판 높이(월드)와 가운데 높이. */
export const PLATE_HEIGHT = 0.8;
export const PLATE_Y = 0;
/** 가림판의 두 자리 — 스크린 쪽(광원에서 4)과 광원 쪽(광원에서 2). */
export const PLATE_FAR_X = 0;
export const PLATE_NEAR_X = -2;
/**
 * 두 자리에서 그림자 높이 ÷ 가림판 높이 — 화면에 띄우는 정박값.
 * (광원 → 스크린 거리) ÷ (광원 → 가림판 거리) 와 같아야 한다 (NOTES (c) G143).
 */
export const RATIO_FAR = 2;
export const RATIO_NEAR = 4;
/** 광원에서 스크린 쪽으로 고르게 내보내는 줄기 수(가장자리를 스치는 두 선은 따로). */
export const RAY_COUNT = 13;

// ------------------------------------------------------------------------
// 배치 — 월드. y 위.
// ------------------------------------------------------------------------

/** 어두운 방의 왼쪽 · 위 · 아래 경계. 오른쪽 경계는 스크린 뒷면이다. */
export const ROOM = { minX: -4.7, minY: -2.35, maxY: 2.35 } as const;
/** 가림판 · 스크린 두께, 광원 반지름. */
export const PLATE_THICK = 0.1;
export const SCREEN_THICK = 0.14;
export const SOURCE_R = 0.1;
/** 방 아래 이름표 줄의 높이. */
export const NAME_Y = -2.65;
/** 스크린 뒤(방 밖) 그림자 치수선을 스크린에서 띄운 거리와, 비 글자를 치수선에서 띄운 거리. */
export const DIM_GAP = 0.25;
export const RATIO_GAP = 0.35;

/**
 * 프레이밍은 주장의 일부다. 방 전체 + 오른쪽 치수선 · 비 글자 + 아래 이름표 · 캡션 줄.
 * 매 프레임 같은 값이다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: -4.8, maxX: 5.4, minY: -3.4, maxY: 2.45 } as const;

// ------------------------------------------------------------------------
// 시간표
// ------------------------------------------------------------------------

/** 스크린 쪽에 멈춘 동안 · 옮기는 동안 · 광원 쪽에 멈춘 동안(초). */
export const HOLD = 3.4;
export const MOVE = 1.8;
/** 도착한 순간 이미 빛이 스크린에 닿아 있다 — 첫 멈춤 단계 안에서 연다. */
export const START_AT = 1;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const rectilinearPropagationMessages = Object.freeze({
  'label.title': {
    ko: '빛의 직진',
    en: 'Light travels in straight lines',
    ja: '光の直進',
    zh: '光沿直线传播',
    ar: 'ينتشر الضوء في خطوط مستقيمة',
    es: 'La luz viaja en línea recta',
    fr: 'La lumière se propage en ligne droite',
    hi: 'प्रकाश सीधी रेखा में चलता है',
    id: 'Cahaya merambat lurus',
    pt: 'A luz se propaga em linha reta',
  },
  'label.operation': {
    ko: '그림자와 광선 모형',
    en: 'Shadows and the ray model',
    ja: '影と光線モデル',
    zh: '影子与光线模型',
    ar: 'الظلال ونموذج الشعاع',
    es: 'Las sombras y el modelo de rayos',
    fr: 'Les ombres et le modèle du rayon lumineux',
    hi: 'छाया और किरण मॉडल',
    id: 'Bayang-bayang dan model sinar',
    pt: 'As sombras e o modelo de raios',
  },
  'label.stage': {
    ko: '점광원 · 가림판 · 스크린',
    en: 'Point source, plate, screen',
    ja: '点光源・遮蔽板・スクリーン',
    zh: '点光源、挡板、光屏',
    ar: 'مصدر نقطي، حاجز، شاشة',
    es: 'Fuente puntual, placa, pantalla',
    fr: 'Source ponctuelle, plaque, écran',
    hi: 'बिंदु स्रोत, अवरोधक, पर्दा',
    id: 'Sumber titik, pelat, layar',
    pt: 'Fonte pontual, placa, tela',
  },
  'label.view': {
    ko: '옆에서 본 모습',
    en: 'Side view',
    ja: '側面図',
    zh: '侧视图',
    ar: 'منظر جانبي',
    es: 'Vista lateral',
    fr: 'Vue de côté',
    hi: 'पार्श्व दृश्य',
    id: 'Tampak samping',
    pt: 'Vista lateral',
  },
  'label.source': {
    ko: '광원',
    en: 'source',
    ja: '光源',
    zh: '光源',
    ar: 'المصدر',
    es: 'fuente',
    fr: 'source',
    hi: 'स्रोत',
    id: 'sumber',
    pt: 'fonte',
  },
  'label.plate': {
    ko: '가림판',
    en: 'plate',
    ja: '板',
    zh: '挡板',
    ar: 'اللوح',
    es: 'placa',
    fr: 'plaque',
    hi: 'प्लेट',
    id: 'pelat',
    pt: 'placa',
  },
  'label.screen': {
    ko: '스크린',
    en: 'screen',
    ja: 'スクリーン',
    zh: '光屏',
    ar: 'الشاشة',
    es: 'pantalla',
    fr: 'écran',
    hi: 'पर्दा',
    id: 'layar',
    pt: 'tela',
  },
  'label.ratio': {
    ko: '가림판의 {k}배',
    en: '{k} × plate',
    ja: '{k} × 遮蔽板',
    zh: '{k} × 挡板',
    ar: '{k} × الحاجز',
    es: '{k} × placa',
    fr: '{k} × plaque',
    hi: '{k} × अवरोधक',
    id: '{k} × pelat',
    pt: '{k} × placa',
  },
  'caption.far': {
    ko: '가장자리를 스친 두 곧은 선이 스크린에 닿는 자리에서 그림자가 끝난다 — 그림자 높이는 가림판의 {kFar}배',
    en: 'The shadow ends where the two straight lines grazing the plate’s edges reach the screen — it is {kFar} times the plate’s height',
    ja: '板のへりをかすめる2本のまっすぐな線がスクリーンに届く所で影が終わる — 影の高さは遮蔽板の{kFar}倍',
    zh: '掠过挡板边缘的两条直线到达光屏之处，就是影子的尽头 — 影子高度是挡板的{kFar}倍',
    ar: 'ينتهي الظل حيث يبلغ الخطّان المستقيمان اللذان يمسّان حافتَي الحاجز الشاشةَ — ارتفاعه {kFar} أضعاف ارتفاع الحاجز',
    es: 'La sombra termina donde las dos líneas rectas que rozan los bordes de la placa llegan a la pantalla — mide {kFar} veces la altura de la placa',
    fr: 'L’ombre s’arrête là où les deux droites qui frôlent les bords de la plaque atteignent l’écran — elle fait {kFar} fois la hauteur de la plaque',
    hi: 'अवरोधक के किनारों को छूती दो सीधी रेखाएँ जहाँ पर्दे पर पहुँचती हैं, वहीं छाया खत्म होती है — छाया की ऊँचाई अवरोधक की {kFar} गुनी है',
    id: 'Bayang-bayang berakhir di tempat dua garis lurus yang menyerempet tepi pelat mencapai layar — tingginya {kFar} kali tinggi pelat',
    pt: 'A sombra termina onde as duas retas que tocam de raspão as bordas da placa chegam à tela — ela tem {kFar} vezes a altura da placa',
  },
  'caption.moveIn': {
    ko: '가림판을 광원 쪽으로 옮긴다',
    en: 'The plate moves toward the source',
    ja: '遮蔽板が光源の方へ動く',
    zh: '挡板向光源移动',
    ar: 'يتحرك الحاجز نحو المصدر',
    es: 'La placa se acerca a la fuente',
    fr: 'La plaque se rapproche de la source',
    hi: 'अवरोधक स्रोत की ओर खिसकता है',
    id: 'Pelat bergerak mendekati sumber',
    pt: 'A placa se aproxima da fonte',
  },
  'caption.near': {
    ko: '두 선이 더 크게 벌어진 채 스크린에 닿는다 — 그림자 높이는 가림판의 {kNear}배',
    en: 'The two lines now spread wider before they reach the screen — the shadow is {kNear} times the plate’s height',
    ja: '2本の線はより大きく開いてスクリーンに届く — 影の高さは遮蔽板の{kNear}倍',
    zh: '两条直线张得更开，再到达光屏 — 影子高度是挡板的{kNear}倍',
    ar: 'يتباعد الخطّان الآن أكثر قبل أن يبلغا الشاشة — ارتفاع الظل {kNear} أضعاف ارتفاع الحاجز',
    es: 'Ahora las dos líneas se abren más antes de llegar a la pantalla — la sombra mide {kNear} veces la altura de la placa',
    fr: 'Les deux droites s’écartent davantage avant d’atteindre l’écran — l’ombre fait {kNear} fois la hauteur de la plaque',
    hi: 'अब दोनों रेखाएँ पर्दे तक पहुँचने से पहले और अधिक फैलती हैं — छाया की ऊँचाई अवरोधक की {kNear} गुनी है',
    id: 'Kini kedua garis merentang lebih lebar sebelum mencapai layar — tinggi bayang-bayang {kNear} kali tinggi pelat',
    pt: 'Agora as duas retas se abrem mais antes de chegar à tela — a sombra tem {kNear} vezes a altura da placa',
  },
  'caption.moveOut': {
    ko: '가림판을 스크린 쪽으로 옮긴다',
    en: 'The plate moves back toward the screen',
    ja: '遮蔽板がスクリーンの方へ戻る',
    zh: '挡板移回光屏一侧',
    ar: 'يعود الحاجز نحو الشاشة',
    es: 'La placa vuelve hacia la pantalla',
    fr: 'La plaque revient vers l’écran',
    hi: 'अवरोधक वापस पर्दे की ओर खिसकता है',
    id: 'Pelat kembali bergerak ke arah layar',
    pt: 'A placa volta em direção à tela',
  },
} satisfies Record<string, LocalizedText>);

export type RectilinearPropagationMessageKey = keyof typeof rectilinearPropagationMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: RectilinearPropagationMessageKey): LocalizedText => rectilinearPropagationMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: RectilinearPropagationMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const rectilinearPropagationSchema: BundleSchema = {
  id: RECTILINEAR_PROPAGATION_ID,
  label: text('label.title'),
  category: 'optics',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 가림판이 광원 쪽으로 갔다가 돌아온다.
  parameters: [],

  stages: [
    {
      id: 'point-source',
      label: text('label.stage'),
      constants: {
        sourceX: SOURCE_X,
        sourceY: SOURCE_Y,
        screenX: SCREEN_X,
        screenHalf: SCREEN_HALF,
        plateHeight: PLATE_HEIGHT,
        plateY: PLATE_Y,
        plateFarX: PLATE_FAR_X,
        plateNearX: PLATE_NEAR_X,
        ratioFar: RATIO_FAR,
        ratioNear: RATIO_NEAR,
        rayCount: RAY_COUNT,
      },
    },
  ],

  environments: [],

  views: [{ id: 'side', label: text('label.view'), default: true }],

  /** 가로로 넓고 세로로 좁다 — 광원 · 가림판 · 스크린을 한 줄로 늘어놓는다 (S-piece — 세로가 비싸다). */
  canvas: { height: 360, minHeight: 320 },

  /**
   * 겹침이 판정 장치다. 빛 없음 방 → 빛 부채 → 그림자 쐐기 → 줄기 → 가림판 · 스크린 순서로 얹는다.
   * 층 순서로는 `region`(방 · 쐐기)이 줄기 위로 올라와 가린다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 스크린 쪽 → 광원 쪽으로 옮기기 → 광원 쪽 → 되돌리기. 옮기는 동안
   * 가림판 자리가 `smooth` 로 움직이고 두 선 · 그림자가 그 자리를 따른다.
   */
  timeline: {
    phases: [
      { id: 'far', duration: HOLD, caption: key('caption.far') },
      { id: 'move-in', duration: MOVE, ease: 'smooth', caption: key('caption.moveIn') },
      { id: 'near', duration: HOLD, caption: key('caption.near') },
      { id: 'move-out', duration: MOVE, ease: 'smooth', caption: key('caption.moveOut') },
    ],
  },

  startAt: START_AT,

  // 슬롯 하나. 방 아래 테마 바탕 위에 둔다 — 빛 없음 방 위에서는 라이트 테마의 먹색 글자가 묻힌다.
  caption: {
    anchor: { screen: 'bottom-left', offset: [12, -8] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 660,
    style: { colorRole: 'ink', emphasis: 'strong' },
    vars: { kFar: 'kFar', kNear: 'kNear' },
  },

  // 그리드 · 카메라 단추 없음(기본값). 비는 치수선과 글자가 말한다.

  messages: rectilinearPropagationMessages,
};
