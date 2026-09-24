// ========================================================================
// charged-particle-in-magnetic-field — 선언
// ========================================================================
// 질문: 빠른 전하는 더 큰 원을 도니까, 한 바퀴 도는 데 더 오래 걸리지 않나?
//
// 자기장 속에서 빠른 전하는 큰 원을 돌지만 한 바퀴 시간은 같아서, 속력이 다른
// 전하들이 늘 한 줄로 선 채 돌다가 같은 순간 출발점으로 돌아온다.
//
// 원본: tasks/piece-lab/charged-particle-in-magnetic-field (캔버스 840 × 300).
// 월드 단위는 원본 논리 px 이고 y 가 위다. 월드 x = 원본 x − 420, 월드 y = 300 − 원본 y.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:charged-particle-in-magnetic-field` 와 문자 그대로 일치한다 (C4). */
export const CHARGED_PARTICLE_IN_MAGNETIC_FIELD_ID = 'charged-particle-in-magnetic-field';

/** 원본 캔버스(논리 px). */
export const STAGE = { width: 840, height: 300 } as const;

/** 모두가 같은 방향(+x)으로 출발하는 점. 원본 (W/2, H − 22). */
export const START = [0, 22] as const;

/**
 * 원궤도 반지름. 원본 `SPEEDS = [50…250] × ω / 2` → r = v/ω = 25 ~ 125.
 * 질량 · 전하가 같고 처음 속력만 달라서 반지름이 속력에 비례한다.
 */
export const RADII: readonly number[] = [25, 50, 75, 100, 125];

/** 자취가 남는 프레임 수(원본 0.6 초 × 60). 모든 전하에 같은 시간이라 길이가 곧 속력이다. */
export const TRAIL_FRAMES = 36;
/** 원본 고정 걸음(초). 자취의 위치 표본 간격. */
export const FRAME_DT = 1 / 60;

/** 자기장 ⊗ 무늬 — 간격 · 원 반지름 · 가위표 팔 비율 (원본 `drawField`). */
export const FIELD = { step: 36, radius: 5, armRatio: 0.62 } as const;

/** 강조선을 숨기는 길이(월드). 전하들이 출발점에 겹친 순간 줄이 사라진다 (원본 2px). */
export const SAME_LINE_MIN = 2;

/** 전하 반지름(월드) · 전하에 새긴 + 의 팔 길이(월드). */
export const CHARGE = { radius: 7, plusArm: 3.5 } as const;

/** 선 굵기(화면 px). 굵기는 물리량이 아니라 위계다. */
export const WIDTHS = { field: 1.2, orbit: 1, trail: 2.5, sameLine: 2 } as const;

/** 자취가 가장 짙은 머리의 불투명도(원본 0.55). */
export const TRAIL_OPACITY = 0.55;

/** 캔버스 안 캡션 자리(월드). 원본은 캔버스 밖 문단이었다. */
export const CAPTION_BAND = 36;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const chargedParticleInMagneticFieldMessages = Object.freeze({
  'label.title': {
    ko: '자기장 속 전하의 원운동',
    en: 'Charges circling in a magnetic field',
    ja: '磁場中を円運動する電荷',
    zh: '在磁场中做圆周运动的电荷',
    ar: 'شحنات تدور في مجال مغناطيسي',
    es: 'Cargas girando en un campo magnético',
    fr: 'Des charges qui tournent dans un champ magnétique',
    hi: 'चुंबकीय क्षेत्र में वृत्ताकार घूमते आवेश',
    id: 'Muatan yang berputar dalam medan magnet',
    pt: 'Cargas girando em um campo magnético',
  },
  'label.operation': {
    ko: '빠른 전하도 한 바퀴 시간은 같다',
    en: 'A faster charge takes the same time per turn',
    ja: '速い電荷も一周の時間は同じ',
    zh: '更快的电荷转一圈的时间也相同',
    ar: 'الشحنة الأسرع تستغرق الزمن نفسه في كل دورة',
    es: 'Una carga más rápida tarda lo mismo por vuelta',
    fr: 'Une charge plus rapide met le même temps par tour',
    hi: 'तेज़ आवेश भी एक चक्कर में उतना ही समय लेता है',
    id: 'Muatan yang lebih cepat pun butuh waktu sama per putaran',
    pt: 'Uma carga mais rápida leva o mesmo tempo por volta',
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
  'caption.main': {
    ko: '빠른 전하는 큰 원을 돌지만, 모두 한 줄로 선 채 함께 돈다',
    en: 'Faster charges circle wider, yet they all stay in one line as they go round',
    ja: '速い電荷ほど大きな円を回るが、みな一列に並んだまま一緒に回る',
    zh: '越快的电荷绕的圆越大，但它们始终排成一条线一起转',
    ar: 'الشحنات الأسرع تدور في دوائر أوسع، لكنها كلها تبقى على خط واحد وهي تدور',
    es: 'Las cargas más rápidas giran en círculos más amplios, pero todas siguen en una sola línea mientras giran',
    fr: 'Les charges plus rapides décrivent des cercles plus larges, mais restent toutes alignées en tournant',
    hi: 'तेज़ आवेश बड़े वृत्त में घूमते हैं, फिर भी सब एक पंक्ति में रहते हुए साथ घूमते हैं',
    id: 'Muatan yang lebih cepat berputar lebih lebar, tetapi semuanya tetap berbaris satu garis saat berputar',
    pt: 'As cargas mais rápidas giram em círculos maiores, mas todas continuam em uma só linha enquanto giram',
  },
  'caption.return': {
    ko: '속력이 달라도 모두 같은 순간 출발점으로 돌아온다',
    en: 'Different speeds, yet all return to the start at the same instant',
    ja: '速さは違っても、みな同じ瞬間に出発点へ戻る',
    zh: '速率不同，却都在同一时刻回到出发点',
    ar: 'سرعات مختلفة، ومع ذلك تعود كلها إلى نقطة البداية في اللحظة نفسها',
    es: 'Distintas rapideces, pero todas vuelven al inicio en el mismo instante',
    fr: 'Des vitesses différentes, et pourtant toutes reviennent au départ au même instant',
    hi: 'चाल अलग-अलग, फिर भी सब एक ही क्षण प्रारंभ बिंदु पर लौटते हैं',
    id: 'Kelajuan berbeda, tetapi semuanya kembali ke titik awal pada saat yang sama',
    pt: 'Velocidades diferentes, mas todas voltam ao ponto de partida no mesmo instante',
  },
  'caption.depart': {
    ko: '같은 순간 출발점에 모였다가 다시 함께 떠난다',
    en: 'They meet at the start at the same instant and set off together again',
    ja: '同じ瞬間に出発点で集まり、また一緒に出発する',
    zh: '它们在同一时刻汇聚于出发点，又一起出发',
    ar: 'تلتقي عند نقطة البداية في اللحظة نفسها ثم تنطلق معًا من جديد',
    es: 'Se reúnen en el inicio en el mismo instante y vuelven a salir juntas',
    fr: 'Elles se retrouvent au départ au même instant et repartent ensemble',
    hi: 'वे एक ही क्षण प्रारंभ बिंदु पर मिलते हैं और फिर साथ चल पड़ते हैं',
    id: 'Mereka bertemu di titik awal pada saat yang sama lalu berangkat bersama lagi',
    pt: 'Elas se encontram no ponto de partida no mesmo instante e partem juntas de novo',
  },
} satisfies Record<string, LocalizedText>);

export type ChargedParticleInMagneticFieldMessageKey = keyof typeof chargedParticleInMagneticFieldMessages;

export const text = (key: ChargedParticleInMagneticFieldMessageKey): LocalizedText =>
  chargedParticleInMagneticFieldMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ChargedParticleInMagneticFieldMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const chargedParticleInMagneticFieldSchema: BundleSchema = {
  id: CHARGED_PARTICLE_IN_MAGNETIC_FIELD_ID,
  label: text('label.title'),
  category: 'em',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기 없음. 자기장 세기를 바꾸면 주기가 바뀌어 두 번째 주장이 된다 (원본 NOTES (c)).
  parameters: [],
  stages: [{ id: 'default', label: text('label.stage'), constants: {} }],
  environments: [],
  views: [{ id: 'default', label: text('label.view'), default: true }],

  /** 원본 840 × 300 에 캡션 띠를 더한 비율. 마운트 후 바뀌지 않는다 (원칙 6). */
  canvas: { height: 380, minHeight: 320 },

  /**
   * 한 주기 = 한 바퀴 4 초. **전하 다섯의 주기가 곧 시간표의 주기다** — scene 은 각을
   * `2π · t / period` 로 읽으므로, 단계 길이를 바꾸면 도는 빠르기도 함께 바뀌고 캡션은
   * 늘 같은 위상에서 갈린다.
   *
   * - depart — 위상 0 ~ 0.06. 막 겹쳤다가 함께 떠나는 중.
   * - orbit  — 위상 0.06 ~ 0.9. 한 줄로 선 채 도는 중.
   * - return — 위상 0.9 ~ 1. 줄이 짧아지며 출발점으로 모여드는 중.
   */
  timeline: {
    phases: [
      { id: 'depart', duration: 0.24, caption: key('caption.depart') },
      { id: 'orbit', duration: 3.36, caption: key('caption.main') },
      { id: 'return', duration: 0.4, caption: key('caption.return') },
    ],
  },

  /** 도착한 순간 이미 1/4 바퀴 돈 상태 (원본 WARMUP 1.0 초). */
  startAt: 1,

  /** 겹침이 원본 순서 그대로다 — 자기장 → 궤도 → 자취 → 강조선 → 출발점 → 전하. */
  drawOrder: 'scene',

  // 슬롯 하나. 원본은 캔버스 아래 가운데 정렬 문단이었다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -8] },
    align: 'center',
    fontSize: 15,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  // 그리드 · 카메라 단추 없음(기본값). 주장은 비교(같다/크다)이지 잴 거리가 아니다.

  messages: chargedParticleInMagneticFieldMessages,
};
