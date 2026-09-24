// ========================================================================
// boundary-layer — 선언
// ========================================================================
// 질문: 빠른 흐름이 판 위를 지날 때, 판에 닿은 흐름이 멈춰 있다는 것은 흐름의 어디까지가
// 느려진다는 뜻인가.
//
// 판 위에서 속도가 0 에서 바깥 빠르기로 오르는 일은 **벽에 붙은 얇은 층 안에서만** 일어난다.
// 그 위는 어디나 바깥 빠르기 그대로다. 그리고 그 층은 앞전에서 흐름을 따라 내려갈수록
// 두꺼워진다 (δ ∝ √x — 네 배 내려가면 두 배, 아홉 배 내려가면 세 배).
//
// 화면에서는 판 위를 흐르는 점들(벽 가까이일수록 꼬리가 짧다)과, 판을 따라 세 자리에 세운
// 속도 화살표 묶음을 보인다. 화살표는 층 위에서 모두 같은 길이이고 층 안에서만 급히 짧아진다.
// 층은 옅은 강조색 띠로, 앞전에서 뒤로 갈수록 두꺼워진다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:boundary-layer` 와 문자 그대로 일치한다 (C4). */
export const BOUNDARY_LAYER_ID = 'boundary-layer';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 바깥 흐름의 빠르기 U(월드/초). 흐름 점이 층 밖에서 이 빠르기로 간다. */
export const FREE_SPEED = 1.6;
/**
 * 층 두께 계수 — δ(x) = 이 값 × √x (월드). 앞전이 x = 0.
 * 판 끝 가까이(x = 9)에서 δ = 1.5 로, δ/x ≈ 0.17 이다. 블라시우스 δ ≈ 5x/√Re_x 로 보면
 * Re_x ≈ 900 — 느린 층류 경계층의 참 비율이라 세로를 과장하지 않았다 (NOTES (b)).
 */
export const LAYER_COEFF = 0.5;
/** 속도 화살표 묶음을 세우는 세 자리(앞전에서의 거리, 월드). 1 : 4 : 9 라 두께가 1 : 2 : 3 이다. */
export const STATION_1 = 1;
export const STATION_2 = 4;
export const STATION_3 = 9;
/** 바깥 빠르기 U 에 해당하는 화살표 길이(월드). 층 안 화살표는 u/U 만큼 짧다. */
export const ARROW_LENGTH = 1.3;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 원점은 판의 앞전(판 윗면).
// ------------------------------------------------------------------------

/** 판 끝(앞전에서의 거리). */
export const PLATE_END = 10.5;
/** 판 두께. */
export const PLATE_THICK = 0.14;
/** 흐름이 보이는 영역 — 앞전 앞쪽부터 판 끝 뒤까지, 판 윗면부터 위로. */
export const FLOW_BOX = { minX: -1.0, maxX: 11.3, maxY: 2.7 } as const;

/**
 * 프레이밍 — 아래는 판과 캡션 줄. 매 프레임 같은 값이다 (S-piece — 프레이밍은 주장의 일부다).
 */
export const SCENE_BOUNDS = { minX: -1.1, maxX: 11.4, minY: -0.75, maxY: 2.8 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const boundaryLayerMessages = Object.freeze({
  'label.title': {
    ko: '경계층',
    en: 'Boundary layer',
    ja: '境界層',
    zh: '边界层',
    ar: 'الطبقة الحدية',
    es: 'Capa límite',
    fr: 'Couche limite',
    hi: 'परिसीमा परत',
    id: 'Lapisan batas',
    pt: 'Camada limite',
  },
  'label.operation': {
    ko: '벽 근처에서 속도가 0이 되는 층',
    en: 'The layer near a wall where the flow slows to zero',
    ja: '壁の近くで流れがゼロまで遅くなる層',
    zh: '壁面附近流速减慢到零的那一层',
    ar: 'الطبقة القريبة من الجدار حيث يتباطأ التدفق حتى الصفر',
    es: 'La capa junto a una pared donde el flujo se frena hasta cero',
    fr: 'La couche près d’une paroi où l’écoulement ralentit jusqu’à zéro',
    hi: 'दीवार के पास की वह परत जहाँ प्रवाह धीमा होकर शून्य हो जाता है',
    id: 'Lapisan di dekat dinding tempat aliran melambat hingga nol',
    pt: 'A camada junto a uma parede onde o escoamento desacelera até zero',
  },
  'label.stage': {
    ko: '판 위의 흐름',
    en: 'Flow over a plate',
    ja: '板の上の流れ',
    zh: '平板上方的流动',
    ar: 'تدفق فوق لوح',
    es: 'Flujo sobre una placa',
    fr: 'Écoulement sur une plaque',
    hi: 'प्लेट के ऊपर प्रवाह',
    id: 'Aliran di atas pelat',
    pt: 'Escoamento sobre uma placa',
  },
  'label.view': {
    ko: '옆모습',
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

  'caption.flow': {
    ko: '빠른 흐름이 얇은 판 위를 지난다. 판에 닿은 흐름은 멈춰 있고, 조금만 떨어져도 거의 바깥 빠르기다.',
    en: 'A fast stream sweeps over a thin plate. The fluid touching the plate is at rest; a little way up it is already moving almost at full speed.',
    ja: '速い流れが薄い板の上を通り過ぎる。板に触れている流体は止まっていて、少し上ではもうほぼ全速で動いている。',
    zh: '一股快速的流体掠过一块薄板。与板接触的流体是静止的；稍往上一点，它就几乎以全速运动了。',
    ar: 'يمر تيار سريع فوق لوح رقيق. المائع الملامس للوح ساكن؛ وعلى مسافة قليلة فوقه يتحرك بالفعل بالسرعة الكاملة تقريبًا.',
    es: 'Una corriente rápida pasa sobre una placa delgada. El fluido que toca la placa está en reposo; un poco más arriba ya se mueve casi a toda velocidad.',
    fr: 'Un courant rapide balaie une plaque mince. Le fluide au contact de la plaque est immobile ; un peu plus haut, il va déjà presque à pleine vitesse.',
    hi: 'एक तेज़ धारा पतली प्लेट के ऊपर से गुज़रती है। प्लेट को छूता तरल स्थिर है; थोड़ा ऊपर वह लगभग पूरी चाल से चल रहा है।',
    id: 'Aliran cepat menyapu di atas pelat tipis. Fluida yang menyentuh pelat diam; sedikit di atasnya fluida sudah bergerak hampir dengan kelajuan penuh.',
    pt: 'Uma corrente rápida passa sobre uma placa fina. O fluido que toca a placa está em repouso; um pouco acima, já se move quase à velocidade total.',
  },
  'caption.profile': {
    ko: '속도가 0 에서 바깥 빠르기로 오르는 일은 벽에 붙은 얇은 층 안에서만 일어난다. 그 위의 화살표는 모두 같다.',
    en: 'The speed climbs from zero to the outer speed only inside a thin layer hugging the wall. Above it, every arrow is the same.',
    ja: '速さがゼロから外側の速さまで上がるのは、壁に張りついた薄い層の中だけだ。その上の矢印はどれも同じだ。',
    zh: '速率从零升到外部速率，只发生在紧贴壁面的薄层里。薄层之上，每个箭头都一样。',
    ar: 'ترتفع السرعة من الصفر إلى السرعة الخارجية داخل طبقة رقيقة ملاصقة للجدار فقط. وفوقها كل الأسهم متساوية.',
    es: 'La rapidez sube de cero a la rapidez exterior solo dentro de una capa delgada pegada a la pared. Por encima, todas las flechas son iguales.',
    fr: 'La vitesse passe de zéro à la vitesse extérieure seulement dans une couche mince collée à la paroi. Au-dessus, toutes les flèches sont identiques.',
    hi: 'चाल शून्य से बाहरी चाल तक केवल दीवार से सटी एक पतली परत के भीतर बढ़ती है। उसके ऊपर हर तीर एक जैसा है।',
    id: 'Kelajuan naik dari nol ke kelajuan luar hanya di dalam lapisan tipis yang menempel pada dinding. Di atasnya, semua panah sama.',
    pt: 'A velocidade sobe de zero até a velocidade externa só dentro de uma camada fina colada à parede. Acima dela, todas as setas são iguais.',
  },
  'caption.thicken': {
    ko: '이 층은 흐름을 따라 내려갈수록 두꺼워진다 — 앞전에서 멀수록 속도가 바뀌는 구간이 위로 넓어진다.',
    en: 'This layer grows thicker as the flow moves downstream — the farther from the leading edge, the taller the stretch where the speed changes.',
    ja: 'この層は流れの下流へ行くほど厚くなる — 前縁から遠いほど、速さが変わる区間が上へ広がる。',
    zh: '这一层顺着流动方向越往下游越厚 — 离前缘越远，速率变化的区段就越高。',
    ar: 'تزداد هذه الطبقة سماكةً كلما اتجه التدفق مع التيار — كلما ابتعدنا عن الحافة الأمامية، ارتفع الجزء الذي تتغير فيه السرعة.',
    es: 'Esta capa se vuelve más gruesa corriente abajo — cuanto más lejos del borde de ataque, más alto es el tramo donde cambia la rapidez.',
    fr: 'Cette couche s’épaissit vers l’aval — plus on s’éloigne du bord d’attaque, plus la zone où la vitesse change est haute.',
    hi: 'प्रवाह के साथ आगे बढ़ते हुए यह परत मोटी होती जाती है — अग्र किनारे से जितना दूर, चाल बदलने वाला हिस्सा उतना ऊँचा।',
    id: 'Lapisan ini makin tebal ke arah hilir — makin jauh dari tepi depan, makin tinggi bagian tempat kelajuan berubah.',
    pt: 'Esta camada fica mais espessa a jusante — quanto mais longe do bordo de ataque, mais alto é o trecho onde a velocidade muda.',
  },
} satisfies Record<string, LocalizedText>);

export type BoundaryLayerMessageKey = keyof typeof boundaryLayerMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: BoundaryLayerMessageKey): LocalizedText => boundaryLayerMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: BoundaryLayerMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const boundaryLayerSchema: BundleSchema = {
  id: BOUNDARY_LAYER_ID,
  label: text('label.title'),
  category: 'fluids',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다. 자동 진행 한 번으로 「얇은 층 안에서만 · 내려갈수록 두꺼워진다」 가 끝난다.
  parameters: [],
  stages: [
    {
      id: 'plate',
      label: text('label.stage'),
      constants: {
        freeSpeed: FREE_SPEED,
        layerCoeff: LAYER_COEFF,
        station1: STATION_1,
        station2: STATION_2,
        station3: STATION_3,
        arrowLength: ARROW_LENGTH,
      },
    },
  ],
  environments: [],
  views: [{ id: 'side', label: text('label.view'), default: true }],

  /** 가로로 넓다 — 판 하나와 그 위 흐름, 캡션 한 줄. */
  canvas: { height: 340, minHeight: 300 },

  /**
   * 쓴 순서대로 겹친다 — 층 띠 → 흐름 점 → 자리 기둥 → 화살표 → 끝 곡선 → 층 가장자리 → 판.
   * 층 순서로는 띠(`region`)가 흐름 점 위에 덮인다.
   */
  drawOrder: 'scene',

  /** 도착한 순간 이미 흐름이 차 있고 화살표가 자라는 중이다 (S-piece). */
  startAt: 4.2,

  /**
   * 한 주기 13.4 초.
   *
   * - `flow` — 흐름 점만. 벽 가까이의 점이 느리게 기어간다.
   * - `profile` — 세 자리에 속도 화살표 묶음이 자란다. 층 위 화살표는 모두 같고 벽 가까이서만 짧다.
   * - `read` — 다 자란 화살표를 읽을 틈.
   * - `thicken` — 앞전에서 층 띠와 그 가장자리가 흐름을 따라 뻗어 나가며 두꺼워진다.
   * - `hold` — 붙잡는다.
   * - `fade` — 화살표 · 층이 옅어지며 물러난다. 흐름 점은 계속 흐른다.
   */
  timeline: {
    phases: [
      { id: 'flow', duration: 2.8, caption: key('caption.flow') },
      { id: 'profile', duration: 2.8, ease: 'smooth', caption: key('caption.profile') },
      { id: 'read', duration: 1.8, caption: key('caption.profile') },
      { id: 'thicken', duration: 2.6, ease: 'smooth', caption: key('caption.thicken') },
      { id: 'hold', duration: 2.6, caption: key('caption.thicken') },
      { id: 'fade', duration: 0.8, caption: key('caption.thicken') },
    ],
  },

  /** 슬롯 하나. 단계마다 지금 화면에서 벌어지는 일만 말한다. */
  caption: {
    anchor: { screen: 'bottom-left', offset: [18, -6] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 820,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  // 그리드 · 카메라 단추 · 제목 · 범례 · 값 표시 없음(기본). 이 그림이 보이는 것은 화살표가
  // 짧아지는 높이이지 거리 값이 아니다 (S-piece).

  messages: boundaryLayerMessages,
};
