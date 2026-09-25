// ========================================================================
// torque — 선언
// ========================================================================
// 질문: 문을 열 때 왜 손잡이는 경첩에서 먼 쪽에 달려 있는가.
//
// 답: 회전을 일으키는 것은 힘만이 아니라 **힘 × 팔 길이**(돌림힘)다. 같은 힘이라도
// 경첩에서 두 배 먼 자리를 밀면 돌림힘이 두 배이고, 같은 문이 두 배 빨리 돌기
// 시작한다 — 같은 시간에 연 각이 매 순간 두 배다.
//
// 화면: 위에서 내려다본 문 둘. 같은 문, 같은 힘 F. 왼쪽은 경첩에서 r, 오른쪽은
// 2r 떨어진 자리를 민다. 두 문이 쓸고 간 부채꼴이 θ 와 2θ 로 벌어진다.
//
// 이웃 조각과 겹치지 않는다 — `balance-scale` 은 돌림힘이 **맞서서 0 이 되는** 평형,
// `mechanical-advantage` 는 힘과 거리를 **맞바꾸는** 도구, `angular-acceleration` 은
// 각속도가 **자라는** 모양이다. 이 조각은 「같은 힘, 긴 팔 → 더 크게 돈다」 에 머문다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:torque` 와 문자 그대로 일치한다 (C4). */
export const TORQUE_ID = 'torque';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 문을 미는 힘(N). 두 문에 같은 크기로, 늘 문 면에 수직으로 건다. */
export const FORCE = 4;
/** 문 질량(kg). 두 문이 같다. */
export const DOOR_MASS = 34;
/** 문 폭(m) — 경첩에서 문 끝까지. 관성 모멘트 ⅓·M·L² 의 L 이다. */
export const DOOR_WIDTH = 0.9;
/** 왼쪽 문을 미는 자리 — 경첩에서의 거리(m). */
export const ARM_SHORT = 0.4;
/** 오른쪽 문을 미는 자리 — 경첩에서의 거리(m). 기본은 왼쪽의 두 배. */
export const ARM_LONG = 0.8;

// ------------------------------------------------------------------------
// 배치 — 월드 1 단위 = 1 m, 위에서 내려다본 평면도. 벽은 y = 0 에 눕는다.
// 문은 경첩에서 +x 로 닫혀 있다가 반시계로(위로) 열린다.
// ------------------------------------------------------------------------

/** 두 문의 경첩 x. */
export const HINGE_LEFT_X = -2.0;
export const HINGE_RIGHT_X = 0.6;
/** 경첩 바깥쪽 벽 길이 · 문틀 반대편 벽 길이(m). */
export const WALL_BEHIND = 0.5;
export const WALL_BEYOND = 0.35;
/** 문 두께(m). */
export const DOOR_THICK = 0.05;
/** 경첩 원 반지름(m). */
export const HINGE_R = 0.035;
/** 힘 화살표 길이(m). 두 문에서 같다 — 힘이 같다는 것은 이 길이로 말한다. */
export const ARROW_LEN = 0.34;
/** 팔 길이 치수선을 문 면에서 띄우는 거리(m). 화살표 반대쪽(연 쪽)에 둔다. */
export const ARM_DIM_GAP = 0.09;
/** 각 이름표를 부채꼴 테 밖으로 띄우는 거리(m). */
export const ANGLE_LABEL_GAP = 0.14;
/** 각 이름표를 붙이는 최소 각(rad). 이보다 좁으면 이름표가 문 위에 얹힌다. */
export const ANGLE_LABEL_MIN = 0.16;

/**
 * 프레이밍 — 왼쪽 문의 경첩 뒤 벽부터 오른쪽 문틀 너머 벽까지. 위로는 열린 문 끝과
 * 각 이름표, 아래로는 닫힌 문을 미는 화살표와 캡션 줄. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -2.66, maxX: 2.0, minY: -0.66, maxY: 1.12 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const torqueMessages = Object.freeze({
  'label.title': {
    ko: '돌림힘',
    en: 'Torque',
    ja: 'トルク',
    zh: '力矩',
    ar: 'عزم الدوران',
    es: 'Torque',
    fr: 'Couple',
    hi: 'बल-आघूर्ण',
    id: 'Torsi',
    pt: 'Torque',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '회전을 일으키는 양과 팔 길이',
    en: 'What makes things turn, and the length of the lever arm',
    ja: '物を回すものと、腕の長さ',
    zh: '使物体转动的量与力臂的长度',
    ar: 'ما يجعل الأشياء تدور، وطول ذراع القوة',
    es: 'Lo que hace girar las cosas, y la longitud del brazo de palanca',
    fr: 'Ce qui fait tourner les objets, et la longueur du bras de levier',
    hi: 'वस्तुओं को घुमाने वाली राशि, और बल-भुजा की लंबाई',
    id: 'Yang membuat benda berputar, dan panjang lengan gaya',
    pt: 'O que faz as coisas girarem, e o comprimento do braço de alavanca',
  },
  'label.stage': {
    ko: '문 둘',
    en: 'Two doors',
    ja: '二枚の扉',
    zh: '两扇门',
    ar: 'بابان',
    es: 'Dos puertas',
    fr: 'Deux portes',
    hi: 'दो दरवाज़े',
    id: 'Dua pintu',
    pt: 'Duas portas',
  },
  'label.view': {
    ko: '평면도',
    en: 'Top view',
    ja: '上から',
    zh: '俯视图',
    ar: 'منظر علوي',
    es: 'Vista superior',
    fr: 'Vue de dessus',
    hi: 'ऊपर से दृश्य',
    id: 'Tampak atas',
    pt: 'Vista de cima',
  },

  /** 힘 기호. 표식이라 번역 대상이 아니다 (C1 판정 3). */
  'label.force': { ko: 'F', en: 'F', ja: 'F', zh: 'F', ar: 'F', es: 'F', fr: 'F', hi: 'F', id: 'F', pt: 'F' },
  /** 팔 길이 기호. `{k}` 는 두 팔 길이의 비(스테이지 상수에서 계산). */
  'label.armShort': { ko: 'r', en: 'r', ja: 'r', zh: 'r', ar: 'r', es: 'r', fr: 'r', hi: 'r', id: 'r', pt: 'r' },
  'label.armLong': {
    ko: '{k}r',
    en: '{k}r',
    ja: '{k}r',
    zh: '{k}r',
    ar: '{k}r',
    es: '{k}r',
    fr: '{k}r',
    hi: '{k}r',
    id: '{k}r',
    pt: '{k}r',
  },
  /** 쓸고 간 각 기호. 오른쪽은 같은 비를 곱한 각이다. */
  'label.angleShort': { ko: 'θ', en: 'θ', ja: 'θ', zh: 'θ', ar: 'θ', es: 'θ', fr: 'θ', hi: 'θ', id: 'θ', pt: 'θ' },
  'label.angleLong': {
    ko: '{k}θ',
    en: '{k}θ',
    ja: '{k}θ',
    zh: '{k}θ',
    ar: '{k}θ',
    es: '{k}θ',
    fr: '{k}θ',
    hi: '{k}θ',
    id: '{k}θ',
    pt: '{k}θ',
  },

  'caption.ready': {
    ko: '같은 문 둘을 같은 힘 F 로 민다 — 왼쪽은 경첩에서 r, 오른쪽은 {k}r 떨어진 자리를.',
    en: 'Two identical doors get the same push F — the left one at r from the hinge, the right one at {k}r.',
    ja: '同じ二枚の扉を同じ力 F で押す — 左は蝶番から r、右は {k}r 離れた所を。',
    zh: '用同样的力 F 推两扇相同的门 — 左边推在离铰链 r 处，右边推在 {k}r 处。',
    ar: 'بابان متماثلان يُدفعان بالقوة نفسها F — الأيسر على بُعد r من المفصلة، والأيمن على بُعد {k}r.',
    es: 'Dos puertas idénticas reciben el mismo empuje F — la izquierda a r de la bisagra, la derecha a {k}r.',
    fr: 'Deux portes identiques reçoivent la même poussée F — celle de gauche à r de la charnière, celle de droite à {k}r.',
    hi: 'दो एक जैसे दरवाज़ों पर एक ही धक्का F — बाएँ पर कब्ज़े से r दूरी पर, दाएँ पर {k}r दूरी पर।',
    id: 'Dua pintu yang sama didorong dengan gaya F yang sama — yang kiri pada jarak r dari engsel, yang kanan pada {k}r.',
    pt: 'Duas portas idênticas recebem o mesmo empurrão F — a da esquerda a r da dobradiça, a da direita a {k}r.',
  },
  'caption.push': {
    ko: '힘은 같은데, 경첩에서 {k}배 먼 자리를 민 오른쪽 문이 매 순간 {k}배 큰 각으로 열려 있다.',
    en: 'Same force, yet the right door — pushed {k}× farther from the hinge — is always open {k}× as wide.',
    ja: '力は同じなのに、蝶番から {k}× 遠い所を押された右の扉は、いつも {k}× 大きな角で開いている。',
    zh: '力相同，但推在离铰链 {k}× 远处的右门，每一刻张开的角度都是左门的 {k}×。',
    ar: 'القوة نفسها، لكن الباب الأيمن — المدفوع أبعد عن المفصلة بمقدار {k}× — مفتوح دائمًا بزاوية {k}× أكبر.',
    es: 'La misma fuerza, pero la puerta derecha — empujada {k}× más lejos de la bisagra — está siempre {k}× más abierta.',
    fr: 'Même force, et pourtant la porte de droite — poussée {k}× plus loin de la charnière — est toujours {k}× plus ouverte.',
    hi: 'बल वही है, फिर भी दायाँ दरवाज़ा — जिसे कब्ज़े से {k}× दूर धकेला गया — हर पल {k}× अधिक खुला रहता है।',
    id: 'Gayanya sama, tetapi pintu kanan — didorong {k}× lebih jauh dari engsel — selalu terbuka {k}× lebih lebar.',
    pt: 'A mesma força, mas a porta da direita — empurrada {k}× mais longe da dobradiça — está sempre {k}× mais aberta.',
  },
} satisfies Record<string, LocalizedText>);

export type TorqueMessageKey = keyof typeof torqueMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: TorqueMessageKey): LocalizedText => torqueMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: TorqueMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const torqueSchema: BundleSchema = {
  id: TORQUE_ID,
  label: text('label.title'),
  category: 'oscillation',
  description: text('label.description'),
  timeModel: 'periodic',
  parameters: [],
  stages: [
    {
      id: 'two-doors',
      label: text('label.stage'),
      constants: {
        force: FORCE,
        doorMass: DOOR_MASS,
        doorWidth: DOOR_WIDTH,
        armShort: ARM_SHORT,
        armLong: ARM_LONG,
      },
    },
  ],
  environments: [],
  views: [{ id: 'top', label: text('label.view'), default: true }],

  /** 가로로 넓다 — 문 둘을 나란히. 세로는 문 폭 하나(열린 문)와 캡션 줄이면 된다. */
  canvas: { height: 360, minHeight: 320 },

  /**
   * 쓴 순서대로 겹친다 — 벽 · 닫힌 자리 · 부채꼴 · 치수선 · 문 · 경첩 · 화살표 · 이름표.
   * 부채꼴이 문 아래에 깔려야 「문이 쓸고 간 자리」 로 읽힌다.
   */
  drawOrder: 'scene',

  /** 도착한 순간 이미 두 문이 열리는 중이다 (S-piece). */
  startAt: 2.4,

  /**
   * 한 주기 4.3 초.
   *
   * - `ready` — 닫힌 두 문과 같은 길이의 힘 화살표가 나타난다.
   * - `push` — 힘이 걸린 채 두 문이 멈춘 상태에서 열리기 시작한다. 진행도가 곧 시간이다.
   * - `fade` — 여전히 밀리는 채로 옅어지며 물러난다. 끝난 화면이 남지 않게 다음 주기로 잇는다.
   */
  timeline: {
    phases: [
      { id: 'ready', duration: 0.8, ease: 'smooth', caption: key('caption.ready') },
      { id: 'push', duration: 3.0, ease: 'linear', caption: key('caption.push') },
      { id: 'fade', duration: 0.5, ease: 'linear', caption: key('caption.push') },
    ],
  },

  /** 슬롯 하나. 단계마다 지금 화면에서 벌어지는 일만 말한다. */
  caption: {
    anchor: { screen: 'bottom-left', offset: [18, -4] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 820,
    style: { colorRole: 'ink', emphasis: 'strong' },
    /** 팔 길이 비는 스테이지 상수에서 오므로 문안에 끼운다 — 「두 배」 를 문안에 박지 않는다. */
    vars: { k: 'ratio' },
  },

  // 그리드 · 카메라 단추 · 제목 · 범례 없음(기본). 이 그림에서 견주는 것은 두 팔의 길이와
  // 두 부채꼴의 벌어짐이고, 기호(r · {k}r · θ · {k}θ)가 그 비를 말한다. 거리 눈금은
  // 오독의 경로가 된다 (S-piece).

  messages: torqueMessages,
};
