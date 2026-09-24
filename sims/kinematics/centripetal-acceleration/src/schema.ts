// ========================================================================
// centripetal-acceleration — 선언
// ========================================================================
// 질문: 빠르기가 한 번도 변하지 않는데 왜 "가속도가 있다" 고 하고, 그 가속도는
// 어디를 향하는가.
//
// 같은 빠르기로 원을 돌아도 속도는 매 순간 방향이 바뀌고, 그 바뀐 만큼(Δv)은
// 어디서 재도 중심을 향한다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:centripetal-acceleration` 와 문자 그대로 일치한다 (C4). */
export const CENTRIPETAL_ACCELERATION_ID = 'centripetal-acceleration';

const DEG = Math.PI / 180;

// ------------------------------------------------------------------------
// 기하 — 월드 1 단위 = 원본 논리 좌표 100 px. 원의 중심이 원점, y 는 위.
// ------------------------------------------------------------------------

/** 궤도 반지름. 원본 R = 100 px. */
export const RADIUS = 1;
/** 속도 화살표 길이. 속력이 일정하므로 언제나 이 길이다. 원본 LV = 80 px. */
export const SPEED_LENGTH = 0.8;
/** 공의 반지름. 원본 7 px. */
export const BALL_RADIUS = 0.07;
/** 화살촉 크기. 원본 11 px. */
export const HEAD_SIZE = 0.11;

// ------------------------------------------------------------------------
// 운동 — 원본 index.html 의 상수를 그대로 옮긴다. 단계의 길이는 아래 `timeline`.
// ------------------------------------------------------------------------

/** 각속도 50°/s — 한 바퀴 7.2 초. */
export const OMEGA = 50 * DEG;
/** 0번 주기의 첫 순간 공의 각 100°. */
export const THETA0 = 100 * DEG;
/** 지난 Δv 가 흐려지는 시간 척도 11 s. */
export const FADE = 11;
/** 이보다 옅어진 지난 Δv 는 그리지 않는다. */
export const MIN_ALPHA = 0.12;
/** 거슬러 올라가 볼 지난 주기 수. */
export const PAST_CYCLES = 8;
/** 남겨 둔 속도 사본의 불투명도. */
export const KEPT_ALPHA = 0.42;

/**
 * 프레이밍 — 원본 840×280 캔버스의 세로 전체(±1.4)와, 가로는 궤도 왼쪽 끝의 속도
 * 화살표(−1.28)에서 캡션 끝(≈5.1)까지.
 */
export const SCENE_BOUNDS = { minX: -1.4, maxX: 5.2, minY: -1.4, maxY: 1.4 } as const;
/** 캡션의 왼쪽 끝. 원본 x = 470 px. 원 옆에 둬 세로를 아낀다. */
export const CAPTION_X = 2.2;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const centripetalAccelerationMessages = Object.freeze({
  'label.title': {
    ko: '구심 가속도',
    en: 'Centripetal acceleration',
    ja: '向心加速度',
    zh: '向心加速度',
    ar: 'التسارع المركزي',
    es: 'Aceleración centrípeta',
    fr: 'Accélération centripète',
    hi: 'अभिकेंद्र त्वरण',
    id: 'Percepatan sentripetal',
    pt: 'Aceleração centrípeta',
  },
  'label.operation': {
    ko: '속도의 변화는 늘 중심 쪽으로 꺾인다',
    en: 'The change in velocity always turns toward the center',
    ja: '速度の変化はいつも中心の方を向く',
    zh: '速度的变化总是指向圆心',
    ar: 'تغيُّر السرعة يتجه دائمًا نحو المركز',
    es: 'El cambio de velocidad siempre apunta hacia el centro',
    fr: 'La variation de vitesse est toujours tournée vers le centre',
    hi: 'वेग में परिवर्तन सदा केंद्र की ओर मुड़ता है',
    id: 'Perubahan kecepatan selalu mengarah ke pusat',
    pt: 'A variação da velocidade sempre aponta para o centro',
  },
  'label.stage': {
    ko: '등속 원운동',
    en: 'Uniform circular motion',
    ja: '等速円運動',
    zh: '匀速圆周运动',
    ar: 'الحركة الدائرية المنتظمة',
    es: 'Movimiento circular uniforme',
    fr: 'Mouvement circulaire uniforme',
    hi: 'एकसमान वृत्तीय गति',
    id: 'Gerak melingkar beraturan',
    pt: 'Movimento circular uniforme',
  },
  'label.view': {
    ko: '속도의 변화',
    en: 'Change in velocity',
    ja: '速度の変化',
    zh: '速度的变化',
    ar: 'تغيُّر السرعة',
    es: 'Cambio de velocidad',
    fr: 'Variation de vitesse',
    hi: 'वेग में परिवर्तन',
    id: 'Perubahan kecepatan',
    pt: 'Variação da velocidade',
  },
  /** 속도 변화 화살표의 이름표. 기호라 번역하지 않는다 (C1 판정 3). */
  'label.dv': {
    ko: 'Δv',
    en: 'Δv',
    ja: 'Δv',
    zh: 'Δv',
    ar: 'Δv',
    es: 'Δv',
    fr: 'Δv',
    hi: 'Δv',
    id: 'Δv',
    pt: 'Δv',
  },
  'caption.keep': {
    ko: '공의 속도를 한 순간 남겨 둔다',
    en: "Keep the ball's velocity at one instant",
    ja: 'ある瞬間のボールの速度を残しておく',
    zh: '把小球某一瞬间的速度留下来',
    ar: 'نُبقي سرعة الكرة عند لحظة واحدة',
    es: 'Se guarda la velocidad de la bola en un instante',
    fr: 'On garde la vitesse de la balle à un instant',
    hi: 'एक क्षण पर गेंद का वेग रख लेते हैं',
    id: 'Kecepatan bola pada satu saat disimpan',
    pt: 'Guarda-se a velocidade da bola em um instante',
  },
  'caption.align': {
    ko: '조금 뒤의 속도와 꼬리를 맞댄다',
    en: 'Put it tail to tail with the velocity a moment later',
    ja: '少し後の速度と始点をそろえる',
    zh: '把它与稍后的速度起点对齐',
    ar: 'نضع ذيله عند ذيل السرعة بعد لحظة',
    es: 'Se junta su origen con el de la velocidad un instante después',
    fr: 'On fait coïncider son origine avec celle de la vitesse un instant plus tard',
    hi: 'थोड़ी देर बाद के वेग से उसकी पूँछ मिलाते हैं',
    id: 'Pangkalnya disatukan dengan pangkal kecepatan sesaat kemudian',
    pt: 'Junta-se sua origem à da velocidade um instante depois',
  },
  'caption.differ': {
    ko: '길이는 그대로, 방향만 달라졌다\n그 차이가 Δv',
    en: 'Same length, only the direction changed\nThat difference is Δv',
    ja: '長さは同じで、向きだけが変わった\nその差が Δv',
    zh: '长度不变，只有方向变了\n这个差就是 Δv',
    ar: 'الطول نفسه، والاتجاه وحده تغيّر\nهذا الفرق هو Δv',
    es: 'Misma longitud, solo cambió la dirección\nEsa diferencia es Δv',
    fr: 'Même longueur, seule la direction a changé\nCette différence, c’est Δv',
    hi: 'लंबाई वही, केवल दिशा बदली\nवही अंतर Δv है',
    id: 'Panjangnya sama, hanya arahnya yang berubah\nSelisih itulah Δv',
    pt: 'Mesmo comprimento, só a direção mudou\nEssa diferença é Δv',
  },
  'caption.center': {
    ko: 'Δv 를 호의 가운데로 옮기면\n중심을 향한다',
    en: 'Move Δv to the middle of the arc\nand it points to the center',
    ja: 'Δv を弧の真ん中に移すと\n中心を向く',
    zh: '把 Δv 移到弧的中点\n它就指向圆心',
    ar: 'انقل Δv إلى منتصف القوس\nفيتجه نحو المركز',
    es: 'Lleva Δv al punto medio del arco\ny apunta hacia el centro',
    fr: 'Place Δv au milieu de l’arc\net il pointe vers le centre',
    hi: 'Δv को चाप के बीच में ले जाएँ\nतो वह केंद्र की ओर इंगित करता है',
    id: 'Pindahkan Δv ke tengah busur\nmaka ia mengarah ke pusat',
    pt: 'Leve Δv ao meio do arco\ne ele aponta para o centro',
  },
} satisfies Record<string, LocalizedText>);

export type CentripetalAccelerationMessageKey = keyof typeof centripetalAccelerationMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export function text(key: CentripetalAccelerationMessageKey): LocalizedText {
  return centripetalAccelerationMessages[key];
}

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: CentripetalAccelerationMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const centripetalAccelerationSchema: BundleSchema = {
  id: CENTRIPETAL_ACCELERATION_ID,
  label: text('label.title'),
  category: 'kinematics',
  operation: text('label.operation'),
  timeModel: 'linear',

  // 조작기가 없다. 비교 간격이 결과를 바꾸지 않는다는 것은 이어지는 여러 Δv 가
  // 이미 보여 준다.
  parameters: [],

  stages: [{ id: 'main', label: text('label.stage'), constants: {} }],
  environments: [],
  views: [{ id: 'main', label: text('label.view'), default: true }],

  /**
   * 원본은 840×280. 원을 왼쪽에, 캡션을 오른쪽에 둬 세로를 막았다. 여백(72 px)을
   * 더해 원본과 같은 배율(100 px/단위)이 되는 높이다.
   */
  canvas: { height: 352, minHeight: 320 },

  /**
   * 한 주기 — 한 순간의 속도를 남기고(keep), 조금 뒤의 속도와 꼬리를 맞대고(align),
   * 그 차이 Δv 가 자라고(grow · hold), Δv 를 호의 가운데로 옮긴 뒤 쉰다(move · rest).
   *
   * - 비교하는 두 순간의 각 간격은 `keep` 의 길이에서 나온다 — 그동안 공이 도는 각이다
   *   (1.0 s × 50°/s = 50°, 삼각형이 눈에 보일 만큼 크게).
   * - 주기 4.45 s 동안 공은 222.5° 전진한다 (한 바퀴에서 황금각만큼 모자란 각). 비교하는
   *   자리가 주기마다 겹치지 않는다.
   * - 도착했을 때 이미 0.6 초 진행된 상태로 보인다.
   */
  startAt: 0.6,
  timeline: {
    phases: [
      { id: 'keep', duration: 1.0, caption: key('caption.keep') },
      { id: 'align', duration: 0.7, ease: 'smooth', caption: key('caption.align') },
      { id: 'grow', duration: 0.5, ease: 'smooth', caption: key('caption.differ') },
      { id: 'hold', duration: 0.5, caption: key('caption.differ') },
      { id: 'move', duration: 0.8, ease: 'smooth', caption: key('caption.center') },
      { id: 'rest', duration: 0.95, caption: key('caption.center') },
    ],
  },

  // 원본이 그린 순서 그대로 겹친다 — 공이 제 속도 화살표의 꼬리를 덮는다.
  drawOrder: 'scene',

  // 원 옆에 둬 세로를 아낀다. 원본의 캡션 글자 18 px, 단계가 바뀔 때 0.3 초 페이드 인.
  caption: {
    anchor: { world: [CAPTION_X, 0] },
    align: 'left',
    fontSize: 18,
    fade: 0.3,
  },

  // 그리드도 카메라 버튼도 없다 (기본값). 각도 표시·축·격자는 특정 각이 중요한
  // 것처럼 읽히게 한다 (원본 inventory 「hidden」).

  messages: centripetalAccelerationMessages,
};
