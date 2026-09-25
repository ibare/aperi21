// ========================================================================
// centripetal-force — 선언
// ========================================================================
// 질문: 돌리던 줄을 놓으면 공은 어디로 가는가 — 원 밖으로 튀어 나가는가?
// 답의 동사: 접선으로 곧게 날아간다.
//
// 공은 줄에 묶여 3 초 돌고, 줄이 사라지면 1.2 초 동안 놓인 순간의 속도 그대로
// 곧게 간다. 놓인 자리에서 바깥 방향 흐린 점선이 함께 떠 비교 기준이 된다.
// 원본: tasks/piece-lab/centripetal-force
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:centripetal-force` 와 문자 그대로 일치한다 (C4). */
export const CENTRIPETAL_FORCE_ID = 'centripetal-force';

// ------------------------------------------------------------------------
// 기하 — 월드 1 단위 = 원본 화면 100 px. 회전 중심이 원점, y 는 위.
// ------------------------------------------------------------------------

/** 줄 길이 = 원 궤도 반지름. 원본 R = 62 px. */
export const RADIUS = 0.62;
/** 공 반지름. 원본 BALL_R = 9 px. */
export const BALL_RADIUS = 0.09;
/** 회전 중심 점 반지름. 원본 4 px. */
export const PIVOT_RADIUS = 0.04;
/** 힘 화살표가 공 중심에서 떨어져 시작하는 거리. 원본 BALL_R + 2 = 11 px. */
export const FORCE_START = 0.11;
/** 힘 화살표 끝이 공 중심에서 떨어진 거리. 원본 40 px — 길이는 일정(크기가 아니라 방향이 주장). */
export const FORCE_END = 0.4;
/** 힘 화살촉 크기. 원본 11 px. */
export const FORCE_HEAD = 0.11;

/**
 * 날아간 길과 바깥 방향 점선의 길이 — **둘이 같다** (사용자 승인 수정, NOTES (a)).
 *
 * 원본은 점선을 비행 전체 거리(약 243 px)로 긋고 자취도 공을 끝까지 따라가, 꼭대기
 * 근처에서 놓으면 점선이 캔버스 위로 잘렸다. 길이를 같게 잘라야 방향 차이만 견준다.
 * 반지름 + 이 길이가 경계(`SCENE_BOUNDS`) 안에 들어야 어느 각에서 놓아도 둘 다 보인다.
 */
export const PATH_LENGTH = 0.44;

// ------------------------------------------------------------------------
// 운동 — 단계 길이는 원본 주기(4.5 초)를 지키고, 공을 느리게 한다
// ------------------------------------------------------------------------

/** 줄에 묶여 도는 시간(초). 원본 HOLD. */
export const HOLD = 3.0;
/**
 * 놓인 뒤 곧게 날아가는 시간(초). 원본 FLY 1.5 에서 흐려짐 몫을 뺐다 — 비행이 끝난 뒤
 * 흐려지므로, 둘을 더한 놓임 단계가 원본과 같은 1.5 초이고 주기도 원본 4.5 초다.
 */
export const FLY = 1.2;
/** 비행이 끝난 뒤 공·자취·점선이 함께 흐려지는 시간(초). 원본 0.3. */
export const FADE_OUT = 0.3;
/** 놓임 단계 전체 = 비행 + 흐려짐. 이것이 끝나면 다시 묶인다. */
export const RELEASED = FLY + FADE_OUT;
/** 다시 묶일 때 줄·힘·공이 나타나는 시간(초). 원본 0.25. */
export const FADE_IN = 0.25;

/**
 * 공의 속력(월드/초) = 자취 길이 / 비행 시간. 공이 비행이 끝나는 순간 정확히 자취 끝에
 * 닿는다 — 자취를 넘어 화면 밖·캡션 위로 가지 않는다 (NOTES (a)).
 *
 * 원본 속력(ω·R ≈ 1.62)이면 자취 끝까지 0.27 초라 「곧게 날아간다」 가 보이지 않는다.
 */
export const SPEED = PATH_LENGTH / FLY;
/** 묶여 도는 각속도(rad/s) = 속력 / 반지름. 놓는 순간 속도가 이어져야 물리가 성립한다. 반시계. */
export const OMEGA = SPEED / RADIUS;

/**
 * 놓는 각 — 원본이 자동으로 놓던 각 그대로. 원본은 π/4 에서 출발해 2.4 초에 한 바퀴를
 * 돌았으므로 첫 놓임(t = 3.0)이 135°, 그 뒤 주기(4.5 초 = 1.875 바퀴)마다 −45° 씩 옮겨 갔다
 * (둘째 t = 7.5 꼭대기 90°).
 *
 * 각속도가 낮아져 원본의 흐름으로는 이 각에 닿지 못하므로, 묶일 때마다 **출발각을 역산**한다
 * — 출발각 = 놓는 각 − ω · HOLD.
 */
export const FIRST_RELEASE_ANGLE = (3 * Math.PI) / 4;
export const RELEASE_ANGLE_STEP = -Math.PI / 4;

/**
 * 프레이밍 — 고정 경계. 세로가 제약이라 반지름 0.62 가 약 80 px 로 그려진다(캔버스 360).
 * 원본(세로 300 · 반지름 62 px)보다 키웠다 — NOTES (a).
 */
export const SCENE_BOUNDS = { minX: -1.08, maxX: 1.08, minY: -1.08, maxY: 1.08 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const centripetalForceMessages = Object.freeze({
  'label.title': {
    ko: '구심력',
    en: 'Centripetal force',
    ja: '向心力',
    zh: '向心力',
    ar: 'القوة المركزية',
    es: 'Fuerza centrípeta',
    fr: 'Force centripète',
    hi: 'अभिकेंद्र बल',
    id: 'Gaya sentripetal',
    pt: 'Força centrípeta',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '원운동을 붙드는 안쪽 힘과 그것이 사라졌을 때의 진로',
    en: 'The inward force that holds circular motion, and the path taken when it disappears',
    ja: '円運動をつなぎ止める内向きの力と、それが消えたときの進路',
    zh: '维持圆周运动的向内的力，以及它消失时的去向',
    ar: 'القوة المتجهة إلى الداخل التي تُبقي الحركة دائرية، والمسار حين تزول',
    es: 'La fuerza hacia dentro que sostiene el movimiento circular, y el camino que se toma cuando desaparece',
    fr: 'La force dirigée vers l’intérieur qui maintient le mouvement circulaire, et la trajectoire quand elle disparaît',
    hi: 'वृत्तीय गति को थामे रखने वाला भीतर की ओर बल, और उसके हटने पर बनने वाला मार्ग',
    id: 'Gaya ke arah dalam yang menahan gerak melingkar, dan lintasan saat gaya itu hilang',
    pt: 'A força para dentro que sustenta o movimento circular, e o caminho tomado quando ela desaparece',
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
  'label.release': {
    ko: '지금 놓기',
    en: 'Release now',
    ja: '今はなす',
    zh: '现在松手',
    ar: 'أفلِت الآن',
    es: 'Soltar ahora',
    fr: 'Lâcher maintenant',
    hi: 'अभी छोड़ें',
    id: 'Lepaskan sekarang',
    pt: 'Soltar agora',
  },
  'caption.attached': {
    ko: '줄이 공을 매 순간 중심 쪽으로 당겨, 곧게 가려는 공의 방향을 꺾는다',
    en: 'The string pulls the ball toward the centre at every instant, bending a path that wants to go straight',
    ja: 'ひもは各瞬間に球を中心へ引き、まっすぐ進もうとする道すじを曲げる',
    zh: '绳子每一刻都把球拉向圆心，使它想要直行的路径弯曲',
    ar: 'يشدّ الخيط الكرة نحو المركز في كل لحظة، فيَحني مسارًا يميل إلى الاستقامة',
    es: 'La cuerda tira de la pelota hacia el centro en cada instante y curva una trayectoria que tiende a ir recta',
    fr: 'La ficelle tire la balle vers le centre à chaque instant et courbe une trajectoire qui voudrait aller tout droit',
    hi: 'डोरी हर क्षण गेंद को केंद्र की ओर खींचती है और सीधे जाना चाहने वाले पथ को मोड़ देती है',
    id: 'Tali menarik bola ke arah pusat setiap saat, membelokkan lintasan yang ingin lurus',
    pt: 'O fio puxa a bola para o centro a cada instante, curvando um caminho que tende a seguir reto',
  },
  'caption.released': {
    ko: '줄을 놓자 공은 바깥(점선)이 아니라 놓인 순간의 접선을 따라 곧게 날아간다',
    en: 'Once released, the ball flies straight along the tangent, not outward (dashed)',
    ja: 'はなすと、球は外向き（点線）ではなく接線に沿ってまっすぐ飛んでいく',
    zh: '一松手，球沿切线直线飞出，而不是向外（虚线）',
    ar: 'ما إن تُفلَت الكرة حتى تنطلق مستقيمةً على امتداد المماس، لا إلى الخارج (الخط المتقطع)',
    es: 'Al soltarla, la pelota sale recta a lo largo de la tangente, no hacia afuera (línea discontinua)',
    fr: 'Une fois lâchée, la balle file tout droit le long de la tangente, pas vers l’extérieur (pointillés)',
    hi: 'छोड़ते ही गेंद बाहर की ओर (धराशायी रेखा) नहीं, बल्कि स्पर्शरेखा के अनुदिश सीधी उड़ जाती है',
    id: 'Begitu dilepas, bola melesat lurus sepanjang garis singgung, bukan ke luar (garis putus-putus)',
    pt: 'Ao ser solta, a bola voa em linha reta ao longo da tangente, não para fora (tracejado)',
  },
} satisfies Record<string, LocalizedText>);

export type CentripetalForceMessageKey = keyof typeof centripetalForceMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 통로. */
export const text = (key: CentripetalForceMessageKey): LocalizedText => centripetalForceMessages[key];

/** 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: CentripetalForceMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const centripetalForceSchema: BundleSchema = {
  id: CENTRIPETAL_FORCE_ID,
  label: text('label.title'),
  category: 'mechanics',
  description: text('label.description'),
  timeModel: 'periodic',

  // 각속도·반지름 조절은 주장을 바꾸지 않아 두지 않는다 (원본 inventory 「hidden」).
  parameters: [],

  stages: [{ id: 'default', label: text('label.stage'), constants: {} }],
  environments: [],
  views: [{ id: 'default', label: text('label.view'), default: true }],

  /** 원본 300 px 에서 키웠다 — 꼭대기에서 놓아도 점선이 잘리지 않게 (NOTES (a)). */
  canvas: { height: 360, minHeight: 320 },

  /**
   * 시간표를 두지 않는다. 원본은 단계 경계가 아니라 **누적 상태**(단계 시작 뒤 경과 ·
   * 흐르는 각)로 움직이고, 「지금 놓기」가 단계를 아무 때나 끊는다. 시각의 함수가
   * 아니므로 `step` 이 상태를 쌓는다. 원본은 t = 0 에 막 묶인 채로 열려 앞당김도 없다.
   */

  // 원본이 그린 순서 그대로 겹친다 — 공이 제 힘 화살표의 꼬리와 줄 끝을 덮는다.
  drawOrder: 'scene',

  // 원본은 캔버스 아래 왼쪽 한 줄, 15 px 본문 먹색. 문장이 갈리는 시점은 상태(놓였는지)다.
  caption: {
    anchor: { screen: 'bottom-left', offset: [4, -8] },
    align: 'left',
    fontSize: 15,
    style: { colorRole: 'ink', emphasis: 'strong' },
    text: key('caption.attached'),
    cases: [{ when: 'released', text: key('caption.released') }],
  },

  // 그리드도 카메라 버튼도 없다 (기본값). 수치·공식·속도 화살표는 원본 inventory 「hidden」.

  messages: centripetalForceMessages,
};
