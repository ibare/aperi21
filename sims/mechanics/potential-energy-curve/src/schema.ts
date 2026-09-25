// ========================================================================
// potential-energy-curve — 선언
// ========================================================================
// 질문: 곡선이 솟은 것만 보이는데, 물체는 정확히 어디서 멈추고 되돌아오나?
//
// 전체 에너지 선을 함께 그으면 답이 나온다 — 선이 곡선과 만나는 점에서 운동
// 에너지가 바닥나 물체가 되돌아온다. 선의 높이가 곡선의 어느 골짜기 · 언덕까지
// 닿는지가 물체가 오갈 수 있는 범위를 정한다.
//
// 원본: tasks/piece-lab/potential-energy-curve/ (자유 구현)
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:potential-energy-curve` 와 문자 그대로 일치한다 (C4). */
export const POTENTIAL_ENERGY_CURVE_ID = 'potential-energy-curve';

// ------------------------------------------------------------------------
// 퍼텐셜 — 비대칭 이중 우물 U(u) = u⁴ − u² + TILT·u. 원본 그대로.
// ------------------------------------------------------------------------

/** 위치 축의 양 끝(벽). */
export const U_MIN = -1.25;
export const U_MAX = 1.25;
/** 두 골짜기의 깊이를 다르게 하는 기울기. */
export const TILT = 0.15;

// ------------------------------------------------------------------------
// 도표 틀 — 원본 860 × 300 캔버스의 px 배치를 그대로 옮긴다.
// 월드 1 단위 = 원본 100 px, 캔버스 가운데(430, 150)가 원점, y 는 위.
// ------------------------------------------------------------------------

export const CANVAS_W_PX = 860;
export const CANVAS_H_PX = 300;
export const PAD_L_PX = 24;
export const PAD_R_PX = 24;
export const PAD_T_PX = 18;
export const PAD_B_PX = 18;
/** 도표가 담는 에너지 범위. */
export const Y_TOP = 0.62;
export const Y_BOT = -0.42;
/** 원본 px → 월드. */
export const PX = 0.01;

/**
 * 프레이밍 — 원본 캔버스(±4.3 × ±1.5)에 그 아래 DOM 캡션 줄(원본 약 56 px)을 붙인 경계다.
 * 매 프레임 같은 값이다 (S-piece — 프레이밍은 주장의 일부다).
 */
export const SCENE_BOUNDS = { minX: -4.3, maxX: 4.3, minY: -2.06, maxY: 1.5 } as const;

/** 원본 캔버스 사각형. 곡선이 이 밖으로 솟은 부분은 원본에서 잘려 보이지 않았다. */
export const CANVAS_CLIP = { min: [-4.3, -1.5], max: [4.3, 1.5] } as const;

// ------------------------------------------------------------------------
// 운동 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 낮은 선 · 높은 선의 에너지. 높은 선은 가운데 언덕보다 높다. */
export const E_LOW = -0.06;
export const E_HIGH = 0.22;
/** 도착한 순간 물체의 자리 — 왼쪽 골짜기에서 오른쪽으로 달리는 중. */
export const U_START = -0.7327;
/** 원본 시간 배율 — 화면 1 초에 운동은 1.6 만큼 흐른다. */
export const TIME_SCALE = 1.6;
/** 선을 내릴 때의 마찰 γ(dE/dt = −γ·2K). 자동 진행과 끌기가 다르다. */
export const FRICTION_AUTO = 0.5;
export const FRICTION_MANUAL = 2.0;

// ------------------------------------------------------------------------
// 적분 · 자국 — 원본 하네스의 고정 걸음(1/60 초)을 그대로 쓴다.
// ------------------------------------------------------------------------

export const FRAME_DT = 1 / 60;
/** 한 걸음을 나누는 하위 단계 수. */
export const SUBSTEPS = 16;
/** 자국은 5 걸음마다 하나, 최근 26 개. 같은 시간 간격이라 간격이 곧 속력이다. */
export const TRAIL_EVERY = 5;
export const TRAIL_MAX = 26;

// ------------------------------------------------------------------------
// 화면 치수 — 원본 px. 물리량이 아니라 표현이다.
// ------------------------------------------------------------------------

/** 물체 반지름(원본 7 px). */
export const BODY_R = 7 * PX;
/** 자국 점 반지름(화면 px). */
export const TRAIL_DOT_PX = 2.6;
/** 운동 에너지 막대 반폭(원본 5 px). */
export const GAP_HALF_W = 5 * PX;
/** 막대가 이보다 길 때만 이름표를 단다(원본 26 px). */
export const GAP_LABEL_MIN = 26 * PX;
/** 전환점 고리 반지름 · 가운데 점 반지름(화면 px). */
export const RING_PX = 10;
export const RING_DOT_PX = 3;
/** 전환점 세로선이 닿는 바닥(원본 y = H − 4). */
export const DROP_BOTTOM_Y = (CANVAS_H_PX / 2 - (CANVAS_H_PX - 4)) * PX;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const potentialEnergyCurveMessages = Object.freeze({
  'label.title': {
    ko: '퍼텐셜 곡선',
    en: 'Potential energy curve',
    ja: '位置エネルギーの曲線',
    zh: '势能曲线',
    ar: 'منحنى طاقة الوضع',
    es: 'Curva de energía potencial',
    fr: 'Courbe d’énergie potentielle',
    hi: 'स्थितिज ऊर्जा वक्र',
    id: 'Kurva energi potensial',
    pt: 'Curva de energia potencial',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '곡선의 모양이 운동을 정하는 방식',
    en: 'How the shape of the curve decides the motion',
    ja: '曲線の形が運動を決めるしくみ',
    zh: '曲线的形状如何决定运动',
    ar: 'كيف يحدد شكل المنحنى الحركة',
    es: 'Cómo la forma de la curva decide el movimiento',
    fr: 'Comment la forme de la courbe décide du mouvement',
    hi: 'वक्र का आकार गति को कैसे तय करता है',
    id: 'Bagaimana bentuk kurva menentukan gerak',
    pt: 'Como a forma da curva decide o movimento',
  },
  'label.stage': {
    ko: '이중 우물',
    en: 'Double well',
    ja: '二重井戸',
    zh: '双势阱',
    ar: 'بئر مزدوجة',
    es: 'Doble pozo',
    fr: 'Double puits',
    hi: 'द्वि-कूप',
    id: 'Sumur ganda',
    pt: 'Poço duplo',
  },
  'label.view': {
    ko: '에너지 도표',
    en: 'Energy diagram',
    ja: 'エネルギー図',
    zh: '能量图',
    ar: 'مخطط الطاقة',
    es: 'Diagrama de energía',
    fr: 'Diagramme d’énergie',
    hi: 'ऊर्जा आरेख',
    id: 'Diagram energi',
    pt: 'Diagrama de energia',
  },
  /**
   * 이름표 셋. 곡선 · 선 · 막대가 모두 에너지라 이름 없이는 구별되지 않는다 —
   * 범례 대신 대상 옆에 직접 붙인다 (원본 NOTES).
   */
  'label.potential': {
    ko: '퍼텐셜 에너지',
    en: 'Potential energy',
    ja: '位置エネルギー',
    zh: '势能',
    ar: 'طاقة الوضع',
    es: 'Energía potencial',
    fr: 'Énergie potentielle',
    hi: 'स्थितिज ऊर्जा',
    id: 'Energi potensial',
    pt: 'Energia potencial',
  },
  'label.total': {
    ko: '전체 에너지 ↕',
    en: 'Total energy ↕',
    ja: '全エネルギー ↕',
    zh: '总能量 ↕',
    ar: 'الطاقة الكلية ↕',
    es: 'Energía total ↕',
    fr: 'Énergie totale ↕',
    hi: 'कुल ऊर्जा ↕',
    id: 'Energi total ↕',
    pt: 'Energia total ↕',
  },
  'label.kinetic': {
    ko: '운동 에너지',
    en: 'Kinetic energy',
    ja: '運動エネルギー',
    zh: '动能',
    ar: 'الطاقة الحركية',
    es: 'Energía cinética',
    fr: 'Énergie cinétique',
    hi: 'गतिज ऊर्जा',
    id: 'Energi kinetik',
    pt: 'Energia cinética',
  },
  'caption.both': {
    ko: '선이 가운데 언덕보다 높아 언덕에는 닿지 않는다. 닿는 고리는 바깥 두 벽에만 남아, 물체는 언덕을 넘어 두 골짜기를 오가고 그 두 고리에서 되돌아온다.',
    en: 'The line is higher than the middle hill, so it never touches the hill. Rings remain only at the two outer walls: the object crosses the hill, moves between both valleys, and turns back at those two rings.',
    ja: '線が真ん中の山より高いので、山には触れない。触れる輪は外側の二つの壁にだけ残り、物体は山を越えて二つの谷を行き来し、その二つの輪で折り返す。',
    zh: '这条线高于中间的山丘，所以碰不到山丘。圆环只剩在外侧两堵墙上：物体越过山丘，在两个山谷之间往返，并在这两个圆环处折返。',
    ar: 'الخط أعلى من التل الأوسط، فلا يلمس التل أبدًا. تبقى الحلقات عند الجدارين الخارجيين فقط: يعبر الجسم التل، ويتنقل بين الواديين، ويرتد عند هاتين الحلقتين.',
    es: 'La línea está más alta que la colina central, así que nunca toca la colina. Los anillos quedan solo en las dos paredes exteriores: el objeto cruza la colina, va y viene entre ambos valles y da la vuelta en esos dos anillos.',
    fr: 'La ligne est plus haute que la colline du milieu, elle ne touche donc jamais la colline. Les anneaux ne restent qu’aux deux parois extérieures : l’objet franchit la colline, passe d’une vallée à l’autre et fait demi-tour à ces deux anneaux.',
    hi: 'रेखा बीच की पहाड़ी से ऊँची है, इसलिए वह पहाड़ी को कभी नहीं छूती। वलय केवल बाहर की दो दीवारों पर बचते हैं: वस्तु पहाड़ी पार करती है, दोनों घाटियों के बीच आती-जाती है, और उन्हीं दो वलयों पर लौट आती है।',
    id: 'Garis lebih tinggi daripada bukit tengah, jadi tidak pernah menyentuh bukit. Cincin hanya tersisa di dua dinding luar: benda melewati bukit, bolak-balik di antara kedua lembah, dan berbalik di kedua cincin itu.',
    pt: 'A linha está acima da colina do meio, então nunca toca a colina. Os anéis ficam só nas duas paredes externas: o objeto cruza a colina, vai e vem entre os dois vales e volta nesses dois anéis.',
  },
  'caption.left': {
    ko: '선이 곡선에 닿는 두 고리에서 운동 에너지가 바닥나 물체가 되돌아온다. 가운데 언덕이 선보다 높아 왼쪽 골짜기에 갇힌다.',
    en: 'At the two rings where the line meets the curve, the kinetic energy runs out and the object turns back. The middle hill is higher than the line, so it is trapped in the left valley.',
    ja: '線が曲線と交わる二つの輪で運動エネルギーが尽き、物体は折り返す。真ん中の山が線より高いので、左の谷に閉じ込められる。',
    zh: '在线与曲线相交的两个圆环处，动能耗尽，物体折返。中间的山丘比线高，所以物体被困在左边的山谷里。',
    ar: 'عند الحلقتين اللتين يلتقي فيهما الخط بالمنحنى، تنفد الطاقة الحركية فيرتد الجسم. التل الأوسط أعلى من الخط، لذا يبقى الجسم محبوسًا في الوادي الأيسر.',
    es: 'En los dos anillos donde la línea toca la curva, la energía cinética se agota y el objeto da la vuelta. La colina central está más alta que la línea, así que queda atrapado en el valle izquierdo.',
    fr: 'Aux deux anneaux où la ligne rencontre la courbe, l’énergie cinétique s’épuise et l’objet fait demi-tour. La colline du milieu est plus haute que la ligne, il reste donc piégé dans la vallée de gauche.',
    hi: 'जिन दो वलयों पर रेखा वक्र से मिलती है, वहाँ गतिज ऊर्जा खत्म हो जाती है और वस्तु लौट आती है। बीच की पहाड़ी रेखा से ऊँची है, इसलिए वस्तु बाईं घाटी में फँसी रहती है।',
    id: 'Di dua cincin tempat garis bertemu kurva, energi kinetik habis dan benda berbalik. Bukit tengah lebih tinggi daripada garis, jadi benda terperangkap di lembah kiri.',
    pt: 'Nos dois anéis onde a linha encontra a curva, a energia cinética se esgota e o objeto volta. A colina do meio está acima da linha, então ele fica preso no vale da esquerda.',
  },
  'caption.right': {
    ko: '선이 곡선에 닿는 두 고리에서 운동 에너지가 바닥나 물체가 되돌아온다. 가운데 언덕이 선보다 높아 오른쪽 골짜기에 갇힌다.',
    en: 'At the two rings where the line meets the curve, the kinetic energy runs out and the object turns back. The middle hill is higher than the line, so it is trapped in the right valley.',
    ja: '線が曲線と交わる二つの輪で運動エネルギーが尽き、物体は折り返す。真ん中の山が線より高いので、右の谷に閉じ込められる。',
    zh: '在线与曲线相交的两个圆环处，动能耗尽，物体折返。中间的山丘比线高，所以物体被困在右边的山谷里。',
    ar: 'عند الحلقتين اللتين يلتقي فيهما الخط بالمنحنى، تنفد الطاقة الحركية فيرتد الجسم. التل الأوسط أعلى من الخط، لذا يبقى الجسم محبوسًا في الوادي الأيمن.',
    es: 'En los dos anillos donde la línea toca la curva, la energía cinética se agota y el objeto da la vuelta. La colina central está más alta que la línea, así que queda atrapado en el valle derecho.',
    fr: 'Aux deux anneaux où la ligne rencontre la courbe, l’énergie cinétique s’épuise et l’objet fait demi-tour. La colline du milieu est plus haute que la ligne, il reste donc piégé dans la vallée de droite.',
    hi: 'जिन दो वलयों पर रेखा वक्र से मिलती है, वहाँ गतिज ऊर्जा खत्म हो जाती है और वस्तु लौट आती है। बीच की पहाड़ी रेखा से ऊँची है, इसलिए वस्तु दाईं घाटी में फँसी रहती है।',
    id: 'Di dua cincin tempat garis bertemu kurva, energi kinetik habis dan benda berbalik. Bukit tengah lebih tinggi daripada garis, jadi benda terperangkap di lembah kanan.',
    pt: 'Nos dois anéis onde a linha encontra a curva, a energia cinética se esgota e o objeto volta. A colina do meio está acima da linha, então ele fica preso no vale da direita.',
  },
} satisfies Record<string, LocalizedText>);

export type PotentialEnergyCurveMessageKey = keyof typeof potentialEnergyCurveMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 통로. */
export const text = (key: PotentialEnergyCurveMessageKey): LocalizedText =>
  potentialEnergyCurveMessages[key];

/** 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: PotentialEnergyCurveMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const potentialEnergyCurveSchema: BundleSchema = {
  id: POTENTIAL_ENERGY_CURVE_ID,
  label: text('label.title'),
  category: 'mechanics',
  description: text('label.description'),
  timeModel: 'periodic',
  parameters: [],
  stages: [
    {
      id: 'double-well',
      label: text('label.stage'),
      constants: {
        eLow: E_LOW,
        eHigh: E_HIGH,
        frictionAuto: FRICTION_AUTO,
        frictionManual: FRICTION_MANUAL,
      },
    },
  ],
  environments: [],
  views: [{ id: 'energy', label: text('label.view'), default: true }],

  /**
   * 원본 캔버스 300 px + 그 아래 캡션 줄. 러너 여백(한 변 24 + 12 px)을 빼고도 860 px 폭
   * 임베드에서 가로가 먼저 차도록 세로를 잡았다 — 세로가 먼저 차면 도표가 작아진다.
   */
  canvas: { height: 396, minHeight: 356 },

  /**
   * 원본이 그린 순서 그대로 겹친다 — 전환점 고리가 **물체 위에** 얹혀, 물체가 고리
   * 안으로 들어갔다 나오는 것이 보인다. 층 순서로는 `trace` 가 `body` 아래로 깔린다.
   */
  drawOrder: 'scene',

  /**
   * 20 초 주기의 에너지 일정. 원본 `autoTarget` 의 구간이다.
   *
   * - `low` — 낮은 선. 물체가 한 골짜기에 갇혀 있다.
   * - `rise` — 2 초 동안 선을 올린다(밀어 에너지를 더한다). 고리가 곡선을 따라 미끄러지다
   *   언덕을 넘는 순간 바깥 벽으로 옮겨 간다.
   * - `high` — 높은 선. 두 골짜기를 오간다.
   * - `fall` — 목표는 낮은 선이지만 **마찰로만** 내려간다. 그래서 그때 있던 골짜기에 갇힌다.
   *
   * 누적 적분 조각이라 `step` 이 이 단계를 읽는다 (NOTES 「어휘 부족」 G01).
   * 캡션은 시각이 아니라 닿는 구간으로 갈리므로 단계가 캡션을 말하지 않는다.
   */
  timeline: {
    phases: [
      { id: 'low', duration: 7 },
      { id: 'rise', duration: 2, ease: 'smooth' },
      { id: 'high', duration: 7 },
      { id: 'fall', duration: 4 },
    ],
  },

  /**
   * 슬롯 하나. 닿는 구간이 언덕 꼭대기를 품는지로 두 문장 중 하나를 고르고, 갇힌
   * 골짜기의 좌우는 물체의 실제 자리로 정한다 — 조건을 세는 것은 physics 다.
   */
  caption: {
    anchor: { screen: 'bottom-left', offset: [20, -6] },
    align: 'left',
    fontSize: 15,
    wrapWidth: 780,
    style: { colorRole: 'ink', emphasis: 'strong' },
    cases: [
      { when: 'spansBoth', text: key('caption.both') },
      { when: 'trappedLeft', text: key('caption.left') },
    ],
    text: key('caption.right'),
  },

  // 그리드 · 카메라 단추 없음(기본). 축 · 눈금 · 수치를 두지 않는 것이 결정이다 —
  // 주장은 「선과 곡선이 만나는 곳」 이라는 기하 관계라 값이 필요 없다.

  messages: potentialEnergyCurveMessages,
};
