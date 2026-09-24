// ========================================================================
// stopping-distance — 선언
// ========================================================================
// 질문: **속력이 3배면 멈추는 데 필요한 거리도 3배인가?**
//
// 아니다. 정지 거리는 반응 거리 + 제동 거리이고 둘은 속력을 전혀 다르게 먹는다 —
// 앞은 비례로(1 : 2 : 3), 뒤는 제곱으로(1 : 4 : 9). 30 / 60 / 90 km/h 세 대가
// 같은 지점에서 동시에 위험을 보면 붉은 구간의 끝이 뒤에서 벌어진다.
//
// 조작기를 두지 않는다. 속력 슬라이더를 달면 한 번에 한 속력만 보게 되어 비교가
// 기억에 맡겨진다 — 세 결과가 동시에 화면에 있어야 이 대비가 성립한다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

import { totalDistanceOf, type CarDef, type StoppingConstants } from './physics';

/** 등록 키 `aperi21:stopping-distance` 와 문자 그대로 일치한다 (C4). */
export const STOPPING_DISTANCE_ID = 'stopping-distance';

// ------------------------------------------------------------------------
// 물리 확정값
// ------------------------------------------------------------------------

/**
 * 세 대가 **같은 조건**이라는 것이 전제다. 다른 것은 속력뿐이다.
 *
 * 값 자체(6 m/s² · 1.0 s)는 화면에 두지 않는다 — 문단의 몫이다.
 */
export const STOPPING: StoppingConstants = { decel: 6.0, reactTime: 1.0 };

/** 세 레인. `lanePx` 는 원본 캔버스의 차 중심 y(px) 다 — 아래 `worldY` 가 미터로 옮긴다. */
export const CARS: readonly CarDef[] = [
  { id: 'kmh30', kmh: 30, lanePx: 46 },
  { id: 'kmh60', kmh: 60, lanePx: 124 },
  { id: 'kmh90', kmh: 90, lanePx: 202 },
];

/** 반복 눈금의 한 칸 — 가장 느린 차(30 km/h)의 구간 길이. */
export const UNIT_CAR = CARS[0]!;
/** 도로 띠의 끝. 가장 빠른 차(90 km/h)가 정확히 여기에 선다 — 77.083 m. */
export const TOTAL_MAX = totalDistanceOf(CARS[CARS.length - 1]!.kmh, STOPPING);

// ------------------------------------------------------------------------
// 시간표 — 원본의 프레임 눈금(60 fps)을 초로 옮긴 것
// ------------------------------------------------------------------------

/** 한 프레임(초). 원본이 위상을 가르던 눈금이라 그대로 남긴다. */
const FRAME = 1 / 60;

/** 접근 72 · 반응 60 · 제동 250 · 유지 194 = 576 프레임 = 9.6 초. */
export const PHASE = {
  approach: 72 * FRAME,
  react: 60 * FRAME,
  brake: 250 * FRAME,
  hold: 194 * FRAME,
} as const;

/** 거리 값이 나타나는 시간(초). 원본 18 프레임. */
export const LABEL_FADE = 18 * FRAME;
/** 반복 눈금이 나타나는 시간(초). 원본 36 프레임. */
export const TICK_FADE = 36 * FRAME;
/** 눈금의 불투명도 상한. 원본의 `alpha * 0.9`. */
export const TICK_ALPHA = 0.9;

// ------------------------------------------------------------------------
// 배치 — 원본의 픽셀 상수를 미터로 되돌린다
// ------------------------------------------------------------------------

/**
 * 원본은 미터를 픽셀로 직접 사상해 그렸다(가로는 미터, 세로는 픽셀). 엔진의 좌표는
 * 등방이라 세로도 미터여야 하므로, **원본이 그리던 폭 720 px 를 기준으로** 배율을
 * 한 번 정하고 픽셀 상수를 전부 그 배율로 나눈다. 숫자는 원본 그대로 남는다.
 */
export const LAYOUT = {
  /** 원본 NOTES 의 기준 컨테이너 폭. */
  refWidthPx: 720,
  /** X0 — 위험 발견 지점(0 m)의 화면 x. */
  originXPx: 84,
  /** PAD — 도로 띠 오른쪽 여백. */
  rightPadPx: 18,
  /** 세로 20~240 의 한가운데. 월드 y 의 원점으로 삼는다. */
  midYPx: 130,
  /** BAR_DY — 차 중심에서 띠 윗변까지. */
  barDyPx: 12,
  /** BAR_H — 띠 높이. */
  barHPx: 15,
  /** 세로 점선의 위·아래 끝. */
  guideTopPx: 20,
  guideBottomPx: 240,
  /** 세로 예산 — 레인 3줄 × 78 px + 캡션 한 줄. */
  heightPx: 272,
} as const;

/** 미터당 픽셀. 도로 띠(77.083 m)가 X0 과 PAD 사이에 꼭 맞는 배율이다. */
export const PX_PER_M = (LAYOUT.refWidthPx - LAYOUT.originXPx - LAYOUT.rightPadPx) / TOTAL_MAX;

/** 원본의 픽셀 치수를 미터로. */
export function toM(px: number): number {
  return px / PX_PER_M;
}

/** 원본의 캔버스 y(아래로 증가)를 월드 y(위로 증가)로. */
export function worldY(canvasY: number): number {
  return (LAYOUT.midYPx - canvasY) / PX_PER_M;
}

/** 글자 크기(화면 px). 원본 값 그대로. */
export const FONT = { speed: 11, dist: 10, caption: 13 } as const;
/** 엔진 readout 의 화면 고정 여백(px). 캡션을 X0 에 맞추려고 그만큼 뺀다. */
const SCREEN_MARGIN_PX = 24;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const stoppingDistanceMessages = Object.freeze({
  'label.title': {
    ko: '정지 거리',
    en: 'Stopping distance',
    ja: '停止距離',
    zh: '停车距离',
    ar: 'مسافة التوقف',
    es: 'Distancia de detención',
    fr: 'Distance d’arrêt',
    hi: 'रुकने की दूरी',
    id: 'Jarak henti',
    pt: 'Distância de parada',
  },
  'label.operation': {
    ko: '반응 거리는 비례로, 제동 거리는 제곱으로 늘어난다',
    en: 'Reaction grows linearly, braking as the square',
    ja: '空走距離は比例で、制動距離は2乗で伸びる',
    zh: '反应距离按正比增长，制动距离按平方增长',
    ar: 'تزداد مسافة رد الفعل خطيًّا، ومسافة الكبح مع المربع',
    es: 'La reacción crece linealmente; el frenado, con el cuadrado',
    fr: 'La réaction croît linéairement, le freinage comme le carré',
    hi: 'प्रतिक्रिया दूरी रैखिक रूप से बढ़ती है, ब्रेकिंग दूरी वर्ग के अनुसार',
    id: 'Jarak reaksi bertambah linear, jarak pengereman sebanding kuadrat',
    pt: 'A reação cresce linearmente; a frenagem, com o quadrado',
  },
  'label.stage': {
    ko: '도로',
    en: 'Road',
    ja: '道路',
    zh: '道路',
    ar: 'الطريق',
    es: 'Carretera',
    fr: 'Route',
    hi: 'सड़क',
    id: 'Jalan',
    pt: 'Estrada',
  },
  'label.view': {
    ko: '정지 거리',
    en: 'Stopping distance',
    ja: '停止距離',
    zh: '停车距离',
    ar: 'مسافة التوقف',
    es: 'Distancia de detención',
    fr: 'Distance d’arrêt',
    hi: 'रुकने की दूरी',
    id: 'Jarak henti',
    pt: 'Distância de parada',
  },
  /** 차 위 속력. 수와 단위는 표식이라 번역 대상이 아니다 (C1 판정 3). */
  'label.speed': {
    ko: '{kmh} km/h',
    en: '{kmh} km/h',
    ja: '{kmh} km/h',
    zh: '{kmh} km/h',
    ar: '{kmh} km/h',
    es: '{kmh} km/h',
    fr: '{kmh} km/h',
    hi: '{kmh} km/h',
    id: '{kmh} km/h',
    pt: '{kmh} km/h',
  },
  /** 맨 위 줄에만 말이 붙는다 — 세 줄 모두에 붙이면 같은 말이 세 번 나온다. */
  'label.reactNamed': {
    ko: '반응 {d} m',
    en: 'Reaction {d} m',
    ja: '空走 {d} m',
    zh: '反应 {d} m',
    ar: 'رد الفعل {d} m',
    es: 'Reacción {d} m',
    fr: 'Réaction {d} m',
    hi: 'प्रतिक्रिया {d} m',
    id: 'Reaksi {d} m',
    pt: 'Reação {d} m',
  },
  'label.brakeNamed': {
    ko: '제동 {d} m',
    en: 'Braking {d} m',
    ja: '制動 {d} m',
    zh: '制动 {d} m',
    ar: 'الكبح {d} m',
    es: 'Frenado {d} m',
    fr: 'Freinage {d} m',
    hi: 'ब्रेकिंग {d} m',
    id: 'Pengereman {d} m',
    pt: 'Frenagem {d} m',
  },
  'label.dist': {
    ko: '{d} m',
    en: '{d} m',
    ja: '{d} m',
    zh: '{d} m',
    ar: '{d} m',
    es: '{d} m',
    fr: '{d} m',
    hi: '{d} m',
    id: '{d} m',
    pt: '{d} m',
  },
  'caption.approach': {
    ko: '세 대가 같은 곳에서 위험을 본다',
    en: 'Three cars spot the same hazard at the same place',
    ja: '3台の車が同じ場所で同じ危険に気づく',
    zh: '三辆车在同一处发现同一个危险',
    ar: 'ثلاث سيارات ترصد الخطر نفسه في المكان نفسه',
    es: 'Tres coches ven el mismo peligro en el mismo lugar',
    fr: 'Trois voitures repèrent le même danger au même endroit',
    hi: 'तीन कारें एक ही जगह पर एक ही ख़तरा देखती हैं',
    id: 'Tiga mobil melihat bahaya yang sama di tempat yang sama',
    pt: 'Três carros veem o mesmo perigo no mesmo lugar',
  },
  'caption.react': {
    ko: '아직 브레이크는 걸리지 않았다 — 반응하는 1초 동안 속력 그대로 간다',
    en: 'The brakes are not on yet — for one second of reaction they keep their speed',
    ja: 'まだブレーキはかかっていない — 反応する1秒のあいだ、速さそのままで進む',
    zh: '还没踩下刹车 — 反应的1秒内保持原来的速率',
    ar: 'لم تُضغط المكابح بعد — خلال ثانية رد الفعل تحافظ السيارات على سرعتها',
    es: 'Aún no frenan — durante un segundo de reacción mantienen su rapidez',
    fr: 'Les freins ne sont pas encore serrés — pendant une seconde de réaction, elles gardent leur vitesse',
    hi: 'अभी ब्रेक नहीं लगे — प्रतिक्रिया के एक सेकंड तक वे अपनी चाल बनाए रखती हैं',
    id: 'Rem belum diinjak — selama satu detik reaksi, mobil tetap pada kelajuannya',
    pt: 'Os freios ainda não foram acionados — durante um segundo de reação, eles mantêm a velocidade',
  },
  'caption.brake': {
    ko: '브레이크가 걸렸다 — 붉은 구간이 뒤에서 벌어진다',
    en: 'The brakes are on — the red stretch opens up at the back',
    ja: 'ブレーキがかかった — 赤い区間が後ろで開いていく',
    zh: '刹车踩下了 — 红色区段在后面拉开',
    ar: 'ضُغطت المكابح — ينفتح الجزء الأحمر من الخلف',
    es: 'Ya frenan — el tramo rojo se abre por detrás',
    fr: 'Les freins sont serrés — le tronçon rouge s’ouvre à l’arrière',
    hi: 'ब्रेक लग गए — लाल हिस्सा पीछे से खुलता जाता है',
    id: 'Rem sudah diinjak — bagian merah melebar di belakang',
    pt: 'Os freios estão acionados — o trecho vermelho se abre atrás',
  },
  'caption.hold': {
    ko: '속력 3배 — 반응 거리는 3배, 제동 거리는 9배',
    en: 'Three times the speed — reaction distance ×3, braking distance ×9',
    ja: '速さ3倍 — 空走距離は ×3、制動距離は ×9',
    zh: '速率3倍 — 反应距离 ×3，制动距离 ×9',
    ar: 'ثلاثة أضعاف السرعة — مسافة رد الفعل ×3، ومسافة الكبح ×9',
    es: 'El triple de rapidez — distancia de reacción ×3, distancia de frenado ×9',
    fr: 'Trois fois la vitesse — distance de réaction ×3, distance de freinage ×9',
    hi: 'तीन गुनी चाल — प्रतिक्रिया दूरी ×3, ब्रेकिंग दूरी ×9',
    id: 'Kelajuan tiga kali — jarak reaksi ×3, jarak pengereman ×9',
    pt: 'Três vezes a velocidade — distância de reação ×3, distância de frenagem ×9',
  },
} satisfies Record<string, LocalizedText>);

export type StoppingDistanceMessageKey = keyof typeof stoppingDistanceMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export function text(key: StoppingDistanceMessageKey): LocalizedText {
  return stoppingDistanceMessages[key];
}

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: StoppingDistanceMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const stoppingDistanceSchema: BundleSchema = {
  id: STOPPING_DISTANCE_ID,
  label: text('label.title'),
  category: 'kinematics',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 세 결과가 동시에 화면에 있어야 주장이 성립한다.
  parameters: [],

  stages: [
    {
      id: 'road',
      label: text('label.stage'),
      constants: { a: STOPPING.decel, tReact: STOPPING.reactTime },
    },
  ],

  environments: [],

  views: [{ id: 'lanes', label: text('label.view'), default: true }],

  /** 세로 예산 272 px — 레인 3줄 × 78 px + 캡션 한 줄. */
  canvas: { height: LAYOUT.heightPx, minHeight: LAYOUT.heightPx },

  /**
   * 겹침이 판정 장치다 — 자취는 도로 위, 차는 자취 위, 거리 값은 띠 위에 얹힌다.
   * 층에 맡기면 값(readout)이 차(body) 위로 올라와 순서가 뒤집힌다.
   */
  drawOrder: 'scene',

  /** 도착한 순간 이미 접근 중이도록 시계를 1.0 초 앞당겨 연다 (원본 START_AT = 60 프레임). */
  startAt: 60 * FRAME,

  /**
   * 한 주기 9.6 초. 접근 → 반응 → 제동 → 유지.
   *
   * - `approach` 끝에서 세 대가 **동시에** 발견 지점(0 m)에 선다. 이 순간이 있어야
   *   뒤에 남는 띠들이 같은 원점에서 잰 길이가 된다.
   * - `react` 동안 브레이크는 걸리지 않는다. 회색 띠가 속력에 비례해 자란다.
   * - `brake` 끝에서 가장 빠른 차가 도로 끝에 선다.
   * - `hold` 동안 반복 눈금이 나타나 배수를 **세게** 한다.
   */
  timeline: {
    phases: [
      { id: 'approach', duration: PHASE.approach, caption: key('caption.approach') },
      { id: 'react', duration: PHASE.react, caption: key('caption.react') },
      { id: 'brake', duration: PHASE.brake, caption: key('caption.brake') },
      { id: 'hold', duration: PHASE.hold, caption: key('caption.hold') },
    ],
  },

  /** 슬롯 하나. 원본처럼 도로 띠의 시작(X0)에 왼쪽 맞춤으로 선다. */
  caption: {
    anchor: { screen: 'bottom-left', offset: [LAYOUT.originXPx - SCREEN_MARGIN_PX, 0] },
    align: 'left',
    fontSize: FONT.caption,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  /**
   * 그리드를 켜지 않는다. 재야 할 것은 **띠끼리의 길이 비**이지 절대 거리가 아니고,
   * 축 눈금이 붙는 순간 독자는 숫자를 읽지 세지 않는다.
   */

  messages: stoppingDistanceMessages,
};
