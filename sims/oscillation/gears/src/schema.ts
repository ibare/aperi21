// ========================================================================
// gears — 선언
// ========================================================================
// 질문: 자전거 뒤 톱니를 큰 것으로 바꾸면 왜 페달이 가벼워지는 대신 덜 나아가는가 —
// 맞물린 기어에서 톱니 수는 무엇을 바꾸는가.
//
// 답: 맞물린 자리에서 두 기어의 톱니는 **하나씩 함께** 지나간다. 그래서 작은 기어가
// 톱니 8개만큼(한 바퀴) 돌면 톱니 16개인 큰 기어도 톱니 8개만큼 — 반 바퀴만 돈다.
// 그 자리에서 두 톱니가 서로 미는 힘은 같으니, 반지름이 두 배인 큰 기어는 같은 힘을
// 두 배 긴 팔로 받아 돌림힘이 두 배다. 느려진 만큼 세진다.
//
// 화면: 맞물린 두 기어가 쉬지 않고 돈다. 앞 절반에는 맞물린 자리를 지난 톱니가
// 강조색으로 차오르고(작은 기어는 한 바퀴를 다 채우는데 큰 기어는 같은 개수만),
// 뒤 절반에는 접점의 같은 힘 F 와 팔 r · kr, 돌림힘 τ · kτ 가 나온다.
//
// 이웃 조각과 겹치지 않는다 — `mechanical-advantage` · `pulley-system` 은 힘과 **거리**를
// 맞바꾸고, `torque` 는 같은 힘을 긴 팔에 걸면 **더 크게 돈다** 는 것이다. 이 조각은
// 「톱니가 같은 수만큼 지나가므로 많은 쪽이 느리게 돌고 대신 돌림힘이 크다」 에 머문다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:gears` 와 문자 그대로 일치한다 (C4). */
export const GEARS_ID = 'gears';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 작은(구동) 기어의 톱니 수. */
export const SMALL_TEETH = 8;
/**
 * 모듈(m) — 톱니 하나의 크기. 피치 원 반지름 = m·N/2 (월드 단위).
 * 맞물리는 두 기어는 모듈이 같아야 한다 — 그래서 톱니 수가 곧 반지름이다.
 */
export const MODULE = 0.1;
/** 큰(피동) 기어 톱니 수의 기본값. 칩이 바꾼다. */
export const BIG_TEETH = 16;
/**
 * 고를 수 있는 큰 기어 톱니 수. 기어비 1.5 · 2 · 2.5.
 *
 * 24(기어비 3)도 해 봤지만 큰 기어가 세로를 다 먹어 기본 화면의 두 기어가 작아졌다.
 * 프레이밍은 가장 큰 칩에 맞춰 고정되므로(원칙 6), 가장 큰 칩이 기본 화면의 크기를 정한다.
 */
export const BIG_TEETH_OPTIONS = [12, 16, 20] as const;

// ------------------------------------------------------------------------
// 배치 — 월드 1 단위 = 모듈 10 개. 두 기어 묶음의 가운데가 x = PAIR_MID_X 에 온다.
// ------------------------------------------------------------------------

/** 두 기어 묶음(왼쪽 톱니 끝 ~ 오른쪽 톱니 끝)의 가운데 x. 칩을 바꿔도 묶음이 가운데 선다. */
export const PAIR_MID_X = 0;
/** 두 기어 중심의 높이. */
export const AXLE_Y = 0;

/** 이끝 높이 · 이뿌리 깊이(모듈 배수). 표준 비율 1 · 1.25. */
export const ADDENDUM = 1;
export const DEDENDUM = 1.25;
/**
 * 톱니 반폭(모듈 배수) — 이뿌리 · 이끝. 둘 사이는 반지름에 따라 곧게 줄어든다(사다리꼴).
 * 피치 원에서 반폭이 약 0.72m 라 반 피치(π/4·m ≈ 0.785m)보다 조금 얇다 — 맞물린 톱니
 * 사이 틈(백래시)이다.
 */
export const TOOTH_HALF_ROOT = 1.12;
export const TOOTH_HALF_TIP = 0.4;
/** 축 구멍 반지름 · 축 반지름(월드). */
export const HUB_HOLE = 0.075;
export const AXLE_R = 0.045;
/**
 * 덜어 낸 구멍(바퀴살 사이) 개수 — 도는 것이 톱니 말고도 보이도록.
 *
 * 주기 끝에서 기어가 처음 자리로 이음매 없이 돌아오려면, 작은 기어 두 바퀴(톱니 2·N₁개)
 * 동안 큰 기어가 돈 각이 구멍 간격의 배수여야 한다 — 2·N₁·h / N₂ 가 정수. 큰 기어는
 * 후보에서 그것을 만족하는 첫 수를 쓴다 (12 · 16 → 6, 20 → 5).
 */
export const SMALL_HOLES = 5;
export const BIG_HOLE_CHOICES = [6, 5, 4] as const;

/** 접점의 힘 화살표 길이(월드). 크기가 같다는 것이 주장이라 두 화살표가 같은 길이다. */
export const FORCE_LEN = 0.45;
/** 두 화살표를 접점 좌우로 벌리는 거리(월드). 한 줄에 겹치면 하나로 읽힌다. */
export const FORCE_GAP = 0.05;
/** 돌림힘 굽은 화살표를 이끝 원 바깥으로 띄우는 거리(월드). 기어 몸 위에 얹으면 구멍 · 톱니와 섞인다. */
export const TORQUE_GAP = 0.15;
/** 돌림힘 τ 하나가 쓰는 각(라디안). 큰 기어는 k 배 쓴다 (k = 기어비). */
export const TORQUE_SWEEP_PER_UNIT = (60 * Math.PI) / 180;

/**
 * 프레이밍 — 가장 큰 칩(20)의 큰 기어와 그 돌림힘 원호가 들어가고, 아래는 캡션 두 줄,
 * 왼쪽 위는 칩 줄. 매 프레임 같은 값이다 (S-piece — 프레이밍은 주장의 일부다).
 */
export const SCENE_BOUNDS = { minX: -1.95, maxX: 1.95, minY: -1.98, maxY: 1.42 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const gearsMessages = Object.freeze({
  'label.title': {
    ko: '기어',
    en: 'Gears',
    ja: '歯車',
    zh: '齿轮',
    ar: 'التروس',
    es: 'Engranajes',
    fr: 'Engrenages',
    hi: 'गियर',
    id: 'Roda gigi',
    pt: 'Engrenagens',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '톱니 수가 맞바꾸는 회전 빠르기와 돌림힘',
    en: 'How tooth counts trade turning speed for torque',
    ja: '歯数が回転の速さとトルクを引き換える仕組み',
    zh: '齿数如何以转动速率换取力矩',
    ar: 'كيف يقايض عدد الأسنان سرعة الدوران بعزم الدوران',
    es: 'Cómo el número de dientes cambia rapidez de giro por torque',
    fr: 'Comment le nombre de dents échange la vitesse de rotation contre le couple',
    hi: 'दाँतों की संख्या कैसे घूमने की चाल के बदले बल-आघूर्ण देती है',
    id: 'Bagaimana jumlah gigi menukar kelajuan putar dengan torsi',
    pt: 'Como o número de dentes troca velocidade de giro por torque',
  },
  'label.stage': {
    ko: '맞물린 두 기어',
    en: 'Two meshed gears',
    ja: 'かみ合った二つの歯車',
    zh: '两个啮合的齿轮',
    ar: 'ترسان متعشّقان',
    es: 'Dos engranajes acoplados',
    fr: 'Deux engrenages en prise',
    hi: 'आपस में फँसे दो गियर',
    id: 'Dua roda gigi yang saling berkait',
    pt: 'Duas engrenagens acopladas',
  },
  'label.view': {
    ko: '옆에서 본 기어',
    en: 'Gear pair',
    ja: '歯車の組',
    zh: '齿轮副',
    ar: 'زوج التروس',
    es: 'Par de engranajes',
    fr: 'Paire d’engrenages',
    hi: 'गियर जोड़ी',
    id: 'Pasangan roda gigi',
    pt: 'Par de engrenagens',
  },

  /** 기어 아래 이름표. 톱니 수가 원인이라 늘 보인다. */
  'label.teeth': {
    ko: '톱니 {n}개',
    en: '{n} teeth',
    ja: '歯 {n} 枚',
    zh: '{n} 个齿',
    ar: 'الأسنان: {n}',
    es: '{n} dientes',
    fr: '{n} dents',
    hi: '{n} दाँत',
    id: '{n} gigi',
    pt: '{n} dentes',
  },
  /** 그 아래 줄 — 이번 주기에 맞물린 자리를 지난 톱니 수. 강조색(지난 톱니)으로 쓴다. */
  'label.passed': {
    ko: '지나간 톱니 {p}개',
    en: '{p} teeth passed',
    ja: '通過した歯 {p} 枚',
    zh: '已通过 {p} 个齿',
    ar: 'الأسنان التي مرّت: {p}',
    es: '{p} dientes pasados',
    fr: '{p} dents passées',
    hi: '{p} दाँत गुज़रे',
    id: '{p} gigi terlewati',
    pt: '{p} dentes passados',
  },
  /** 접점에서 두 톱니가 서로 미는 힘. 기호라 번역 대상이 아니다 (C1 판정 3). */
  'label.force': {
    ko: 'F',
    en: 'F',
    ja: 'F',
    zh: 'F',
    ar: 'F',
    es: 'F',
    fr: 'F',
    hi: 'F',
    id: 'F',
    pt: 'F',
  },
  /** 팔 길이 · 돌림힘 기호. 큰 쪽은 기어비 k 를 앞에 붙인다. */
  'label.armSmall': {
    ko: 'r',
    en: 'r',
    ja: 'r',
    zh: 'r',
    ar: 'r',
    es: 'r',
    fr: 'r',
    hi: 'r',
    id: 'r',
    pt: 'r',
  },
  'label.armBig': {
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
  'label.torqueSmall': {
    ko: 'τ',
    en: 'τ',
    ja: 'τ',
    zh: 'τ',
    ar: 'τ',
    es: 'τ',
    fr: 'τ',
    hi: 'τ',
    id: 'τ',
    pt: 'τ',
  },
  'label.torqueBig': {
    ko: '{k}τ',
    en: '{k}τ',
    ja: '{k}τ',
    zh: '{k}τ',
    ar: '{k}τ',
    es: '{k}τ',
    fr: '{k}τ',
    hi: '{k}τ',
    id: '{k}τ',
    pt: '{k}τ',
  },

  'control.bigTeeth': {
    ko: '큰 기어 톱니',
    en: 'Big gear teeth',
    ja: '大きい歯車の歯数',
    zh: '大齿轮齿数',
    ar: 'أسنان الترس الكبير',
    es: 'Dientes del engranaje grande',
    fr: 'Dents de la grande roue',
    hi: 'बड़े गियर के दाँत',
    id: 'Gigi roda gigi besar',
    pt: 'Dentes da engrenagem grande',
  },
  /** 칩 글자. 수는 표식이라 번역 대상이 아니다 (C1 판정 3). */
  'option.teeth12': {
    ko: '12',
    en: '12',
    ja: '12',
    zh: '12',
    ar: '12',
    es: '12',
    fr: '12',
    hi: '12',
    id: '12',
    pt: '12',
  },
  'option.teeth16': {
    ko: '16',
    en: '16',
    ja: '16',
    zh: '16',
    ar: '16',
    es: '16',
    fr: '16',
    hi: '16',
    id: '16',
    pt: '16',
  },
  'option.teeth20': {
    ko: '20',
    en: '20',
    ja: '20',
    zh: '20',
    ar: '20',
    es: '20',
    fr: '20',
    hi: '20',
    id: '20',
    pt: '20',
  },

  'caption.turn': {
    ko: '맞물린 자리로 두 기어의 톱니가 하나씩 함께 지나간다 — 작은 기어가 한 바퀴 도는 동안 큰 기어는 같은 개수의 톱니만큼만 돈다.',
    en: 'At the mesh the teeth of both gears go by one for one — while the small gear makes a full turn, the big gear turns only by the same number of teeth.',
    ja: 'かみ合う所では両方の歯車の歯が一枚ずつ一緒に通り過ぎる — 小さい歯車が一回転するあいだ、大きい歯車は同じ枚数の歯の分しか回らない。',
    zh: '在啮合处，两个齿轮的齿一个对一个地同时通过 — 小齿轮转一整圈时，大齿轮只转过同样数目的齿。',
    ar: 'عند موضع التعشيق تمرّ أسنان الترسين سنًّا مقابل سن — فبينما يدور الترس الصغير دورة كاملة، لا يدور الترس الكبير إلا بالعدد نفسه من الأسنان.',
    es: 'En el engrane, los dientes de ambos engranajes pasan uno a uno — mientras el engranaje pequeño da una vuelta completa, el grande gira solo el mismo número de dientes.',
    fr: 'À l’engrènement, les dents des deux roues passent une pour une — pendant que la petite roue fait un tour complet, la grande ne tourne que du même nombre de dents.',
    hi: 'जहाँ गियर फँसते हैं, वहाँ दोनों गियरों के दाँत एक-एक करके साथ गुज़रते हैं — छोटा गियर जब पूरा एक चक्कर लगाता है, तब बड़ा गियर उतने ही दाँत भर घूमता है।',
    id: 'Di titik kait, gigi kedua roda lewat satu per satu bersamaan — saat roda kecil berputar satu putaran penuh, roda besar hanya berputar sebanyak jumlah gigi yang sama.',
    pt: 'No engrenamento, os dentes das duas engrenagens passam um a um — enquanto a pequena dá uma volta completa, a grande gira só o mesmo número de dentes.',
  },
  'caption.force': {
    ko: '맞물린 자리에서 두 톱니가 서로 미는 힘 F 는 같다. 큰 기어는 그 힘을 더 긴 팔로 받아, 느리게 도는 만큼 돌림힘이 크다.',
    en: 'Where the teeth meet they push on each other with the same force F. The big gear takes it on a longer arm — as many times slower, as many times more torque.',
    ja: '歯が触れ合う所で、二つの歯は同じ力 F で押し合う。大きい歯車はその力をより長い腕で受け、遅くなった倍数だけトルクが大きい。',
    zh: '在齿与齿接触处，它们以同样的力 F 相互推动。大齿轮用更长的力臂承受这个力 — 慢了几倍，力矩就大几倍。',
    ar: 'حيث تلتقي الأسنان يدفع كلٌّ منها الآخر بالقوة نفسها F. ويتلقاها الترس الكبير على ذراع أطول — فبقدر ما يبطؤ يزداد عزم دورانه.',
    es: 'Donde los dientes se tocan, se empujan con la misma fuerza F. El engranaje grande la recibe con un brazo más largo — cuantas veces más lento, tantas veces más torque.',
    fr: 'Là où les dents se touchent, elles se poussent avec la même force F. La grande roue la reçoit sur un bras plus long — autant de fois plus lente, autant de fois plus de couple.',
    hi: 'जहाँ दाँत मिलते हैं, वहाँ वे एक-दूसरे को समान बल F से धकेलते हैं। बड़ा गियर यह बल लंबी भुजा पर लेता है — जितने गुना धीमा, उतने गुना अधिक बल-आघूर्ण।',
    id: 'Di tempat gigi bertemu, keduanya saling mendorong dengan gaya F yang sama. Roda besar menerimanya pada lengan yang lebih panjang — berapa kali lebih lambat, sekian kali lebih besar torsinya.',
    pt: 'Onde os dentes se encontram, eles se empurram com a mesma força F. A engrenagem grande a recebe num braço mais longo — quantas vezes mais lenta, tantas vezes mais torque.',
  },
} satisfies Record<string, LocalizedText>);

export type GearsMessageKey = keyof typeof gearsMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: GearsMessageKey): LocalizedText => gearsMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: GearsMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const gearsSchema: BundleSchema = {
  id: GEARS_ID,
  label: text('label.title'),
  category: 'oscillation',
  description: text('label.description'),
  timeModel: 'periodic',
  parameters: [],
  stages: [
    {
      id: 'meshed-pair',
      label: text('label.stage'),
      constants: {
        smallTeeth: SMALL_TEETH,
        module: MODULE,
      },
    },
  ],
  environments: [],
  views: [{ id: 'pair', label: text('label.view'), default: true }],

  /** 가로로 넓다 — 두 기어가 옆으로 선다. 세로는 큰 기어 하나와 캡션 두 줄이면 된다. */
  canvas: { height: 400, minHeight: 352 },

  /**
   * 쓴 순서대로 겹친다 — 기어 옅은 면 → 지난 톱니(강조색) → 기어 윤곽 → 표지.
   * 셋 다 `body` 라 층 순서로는 강조한 톱니를 윤곽 아래에 둘 수 없다.
   */
  drawOrder: 'scene',

  /** 도착한 순간 이미 기어가 돌며 톱니 몇 개가 지나가 있다 (S-piece). */
  startAt: 1.2,

  /**
   * 한 주기 10 초 = 작은 기어 두 바퀴. 기어는 주기 내내 같은 빠르기로 돈다.
   *
   * - `turn` — 작은 기어가 꼭 한 바퀴 돈다. 이 단계 길이가 곧 한 바퀴 시간이다.
   *   맞물린 자리를 지난 톱니가 두 기어에서 하나씩 강조색으로 찬다.
   * - `appear` — 계속 돈다. 지난 톱니가 옅어지며 접점의 힘 F · 팔 · 돌림힘이 나타난다.
   * - `force` — 계속 돈다. 힘 · 팔 · 돌림힘을 견주는 시간.
   * - `fade` — 표지가 물러나고 다음 주기에 톱니 세기를 처음부터 한다.
   *
   * 주기가 한 바퀴 시간의 정확히 두 배라야 주기 끝에 기어가 처음 자리로 돌아온다
   * (`turn` 을 늘리면 나머지 셋의 합도 함께 늘린다).
   */
  timeline: {
    phases: [
      { id: 'turn', duration: 5, ease: 'linear', caption: key('caption.turn') },
      { id: 'appear', duration: 0.5, ease: 'smooth', caption: key('caption.force') },
      { id: 'force', duration: 3.9, ease: 'linear', caption: key('caption.force') },
      { id: 'fade', duration: 0.6, ease: 'linear', caption: key('caption.force') },
    ],
  },

  /** 슬롯 하나. 단계마다 지금 화면에서 벌어지는 일만 말한다. */
  caption: {
    anchor: { screen: 'bottom-left', offset: [18, -4] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 820,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  // 그리드 · 카메라 단추 · 제목 · 범례 없음(기본). 재는 것은 톱니 개수와 팔의 비이고,
  // 거리 눈금은 오독의 경로가 된다 (S-piece).

  messages: gearsMessages,
};
