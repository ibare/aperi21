// ========================================================================
// projectile-motion — 선언
// ========================================================================
// 질문: 앞으로 더 빠르게 던진 공은, 더 오래 하늘에 떠 있을까.
//
// 수평 속도만 0 : v : 2v 로 다른 공 셋을 같은 높이에서 같은 순간에 놓는다.
// 나머지는 전부 같다. 세 공을 꿰는 선분이 내려오는 내내 수평이면 두 성분은
// 서로를 건드리지 않는 것이다 — 주장이 화면 위의 기하학적 성질 하나로
// 번역되어 있다.
//
// 치수는 원본(tasks/piece-lab/projectile-motion/index.html)의 화면 픽셀을
// **100 으로 나눈 월드**다. 원본은 화면 픽셀에서 g 를 역산해 썼는데, 여기서는
// 그 배치를 그대로 한 번 옮겨 두고 화면으로 옮기는 일은 카메라에 맡긴다.
//
//   월드 x = (원본 화면 x − 58) / 100      (발사점이 원점)
//   월드 y = (268 − 원본 화면 y) / 100     (지면이 y = 0, 위가 +)
// ========================================================================

import type { BundleSchema, LocalizedText, Vec2 } from '@aperi21/schema';

/** 등록 키 `aperi21:projectile-motion` 와 문자 그대로 일치한다 (C4). */
export const PROJECTILE_MOTION_ID = 'projectile-motion';

// ------------------------------------------------------------------------
// 무대의 치수 (월드)
// ------------------------------------------------------------------------

/** 세 공이 함께 놓이는 지점. 원본 (58, 42). */
export const LAUNCH: Vec2 = [0, 2.26];
/** 낙하가 끝나는 높이. 원본 GROUND = 268. */
export const GROUND_Y = 0;
/** 공 반지름. 원본 R = 7 px. */
export const BALL_R = 0.07;

/** 바닥에 닿기까지(초). 원본 T_FALL. */
export const FALL = 2.0;
/** 닿은 뒤 머무는 시간(초). 원본 REST. */
export const REST = 1.3;
/** 잔상을 남기는 간격(초). 원본 STROBE. */
export const STROBE = 0.2;

/**
 * 아래로 당기는 가속도. 원본은 `2 * (GROUND − R − Y0) / T_FALL²` 로 화면
 * 픽셀에서 역산해 109.5 px/s² 를 얻었다. 같은 식을 월드로 옮긴 값이다 —
 * `2 * (2.26 − 0.07) / 2.0² = 1.095`. 셋이 정확히 `FALL` 초에 공이 지면에
 * 닿아야 파문과 캡션의 시각이 시간표 경계와 어긋나지 않는다.
 *
 * 실제 g = 9.8 은 쓰지 않는다. 그러려면 슬로모션 배율을 함께 설명해야 하고,
 * 그 순간 캡션이 둘이 된다 — 이 조각은 "얼마나" 가 아니라 "같다" 를 말한다.
 */
export const G = 1.095;

/** 세 공은 수평 속도의 배수만 다르다. 원본 MULT. */
export const MULTIPLIERS: readonly number[] = [0, 1, 2];

/**
 * 앞으로 던지는 빠르기의 범위.
 *
 * 원본은 0~100 의 손잡이 값을 화면 폭에서 정한 상한에 곱해 썼다 —
 * `vmax = (W − X0 − 42) / (2 · T_FALL)`. 가장 빠른 공(배수 2)이 오른쪽 끝에서
 * 42 px 남기고 닿는 값이다. 폭 828(원본 최대폭 860 − 좌우 여백 16)에서
 * `(828 − 58 − 42) / 4 = 182 px/s` → 월드 1.82.
 *
 * 화면 폭에 맞춰 상한을 정하는 일은 엔진이 할 몫이지만 지금 어휘에 없다
 * (NOTES 「어휘 부족」). 고정 프레이밍을 쓰므로 고정값으로 둔다.
 */
export const SPEED_RANGE: [number, number] = [0, 1.82];
/** 기본값 — 원본 손잡이 62 %. `1.82 × 0.62`. */
export const SPEED_DEFAULT = 1.1284;

/**
 * 프레이밍. 원본 캔버스(폭 828 × 높이 282)를 그대로 월드로 옮긴 직사각형이다.
 * 가로세로비가 원본 캔버스와 같아서, 이 비를 가진 임베드에서는 원본과 같은
 * 배율(1 월드 = 100 px)로 놓인다.
 */
export const SCENE_BOUNDS = { minX: -0.58, maxX: 7.7, minY: -0.14, maxY: 2.68 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const projectileMotionMessages = Object.freeze({
  'label.title': {
    ko: '포물선 운동',
    en: 'Projectile motion',
    ja: '放物運動',
    zh: '抛体运动',
    ar: 'حركة المقذوفات',
    es: 'Movimiento de proyectiles',
    fr: 'Mouvement des projectiles',
    hi: 'प्रक्षेप्य गति',
    id: 'Gerak parabola',
    pt: 'Movimento de projéteis',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '수평·연직 성분의 독립',
    en: 'The independence of the horizontal and vertical components',
    ja: '水平成分と鉛直成分の独立',
    zh: '水平分量与竖直分量的独立',
    ar: 'استقلال المركبتين الأفقية والرأسية',
    es: 'La independencia de las componentes horizontal y vertical',
    fr: 'L’indépendance des composantes horizontale et verticale',
    hi: 'क्षैतिज और ऊर्ध्वाधर घटकों की स्वतंत्रता',
    id: 'Kebebasan komponen horizontal dan vertikal',
    pt: 'A independência das componentes horizontal e vertical',
  },
  'label.stage': {
    ko: '포물선 운동',
    en: 'Projectile motion',
    ja: '放物運動',
    zh: '抛体运动',
    ar: 'حركة المقذوفات',
    es: 'Movimiento de proyectiles',
    fr: 'Mouvement des projectiles',
    hi: 'प्रक्षेप्य गति',
    id: 'Gerak parabola',
    pt: 'Movimento de projéteis',
  },
  'label.view': {
    ko: '포물선 운동',
    en: 'Projectile motion',
    ja: '放物運動',
    zh: '抛体运动',
    ar: 'حركة المقذوفات',
    es: 'Movimiento de proyectiles',
    fr: 'Mouvement des projectiles',
    hi: 'प्रक्षेप्य गति',
    id: 'Gerak parabola',
    pt: 'Movimento de projéteis',
  },
  /** 조작기 이름. 독자가 품은 반론을 스스로 시험하는 자리다. */
  'control.speed': {
    ko: '앞으로 던지는 빠르기',
    en: 'Forward throwing speed',
    ja: '前へ投げる速さ',
    zh: '向前抛出的速率',
    ar: 'سرعة الرمي إلى الأمام',
    es: 'Rapidez de lanzamiento hacia adelante',
    fr: 'Vitesse du lancer vers l’avant',
    hi: 'आगे फेंकने की चाल',
    id: 'Kelajuan lemparan ke depan',
    pt: 'Velocidade do lançamento para a frente',
  },
  'caption.falling': {
    ko: '세 공을 잇는 선이 수평인 채로 내려온다',
    en: 'The line through the three balls stays level as they fall',
    ja: '3つの球を結ぶ線が水平のまま落ちていく',
    zh: '连接三个球的线保持水平，一起落下',
    ar: 'يبقى الخط المار بالكرات الثلاث أفقيًا أثناء سقوطها',
    es: 'La línea que une las tres bolas sigue horizontal mientras caen',
    fr: 'La ligne qui relie les trois balles reste horizontale pendant leur chute',
    hi: 'गिरते समय तीनों गेंदों को जोड़ने वाली रेखा क्षैतिज बनी रहती है',
    id: 'Garis yang melalui ketiga bola tetap mendatar selama jatuh',
    pt: 'A linha que passa pelas três bolas continua horizontal enquanto caem',
  },
  'caption.landed': {
    ko: '셋이 한꺼번에 닿았다 — 달라진 것은 앞으로 간 거리뿐이다',
    en: 'All three landed together — only the distance forward differs',
    ja: '3つは同時に着地した — 違うのは前に進んだ距離だけだ',
    zh: '三个球同时落地——不同的只是向前的距离',
    ar: 'هبطت الكرات الثلاث معًا — لا يختلف إلا المسافة إلى الأمام',
    es: 'Las tres cayeron a la vez — solo cambia la distancia hacia adelante',
    fr: 'Les trois ont touché le sol ensemble — seule la distance parcourue diffère',
    hi: 'तीनों एक साथ ज़मीन पर पहुँचीं — अंतर केवल आगे की दूरी में है',
    id: 'Ketiganya mendarat bersamaan — yang berbeda hanya jarak ke depan',
    pt: 'As três tocaram o chão juntas — só a distância para a frente muda',
  },
}) satisfies Record<string, LocalizedText>;

export type ProjectileMotionMessageKey = keyof typeof projectileMotionMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export function text(key: ProjectileMotionMessageKey): LocalizedText {
  return projectileMotionMessages[key];
}

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ProjectileMotionMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

/** 캡션 글자 크기(화면 px). 원본 `.caption { font-size: 14.5px }`. */
const CAPTION_FONT_PX = 14.5;

export const projectileMotionSchema: BundleSchema = {
  id: PROJECTILE_MOTION_ID,
  label: text('label.title'),
  category: 'kinematics',
  description: text('label.description'),
  timeModel: 'periodic',

  // 빠르기는 파라미터가 아니라 **조작기가 미는 상태**다. 슬라이더가 state 의
  // `v` 를 단일 소스로 삼는다 (controllers.ts).
  parameters: [],

  stages: [
    {
      id: 'main',
      label: text('label.stage'),
      constants: { g: G, fall: FALL, launchY: LAUNCH[1] },
    },
  ],

  environments: [],

  views: [{ id: 'main', label: text('label.view'), default: true }],

  /**
   * 원본 캔버스 282 px + 캡션·슬라이더 한 줄. 원본은 캡션과 손잡이를 캔버스
   * 아래 한 줄에 놓아 세로를 아꼈는데, 엔진은 둘을 캔버스 안에 그리므로 그
   * 한 줄만큼을 높이에 더해 둔다 (원본 282 + 54).
   */
  canvas: { height: 336, minHeight: 300 },

  /**
   * 겹침 순서가 저작 결정이다. 원본이 그리는 차례 —
   * 지면 → 지나간 높이선 → 잔상 → 착지 파문 → 지금 높이선 → 공.
   *
   * 층 기본값으로 두면 자국(19)이 궤적(20) 아래로 내려가 **잔상이 지나간
   * 높이선 밑에 깔린다.** 사다리는 가로대(선) 위에 점이 얹힌 그림이라
   * 뒤집히면 점이 흐려진다. 파문도 공에 가리지 않으려면 공보다 먼저 그려야
   * 하는데, 그 순서 역시 여기서 정한다.
   */
  drawOrder: 'scene',

  /**
   * 시간표 — 한 주기 3.3 초. 원본의 `CYCLE = T_FALL + REST`.
   *
   * 낙하 시간은 수평 속도와 무관해서 **착지가 곧 단계 경계**다. 슬라이더로
   * 빠르기를 바꿔도 캡션이 바뀌는 지점이 어긋나지 않는다 — 원본이 `landed`
   * 를 값으로 판정하며 지키려던 것이 여기서는 선언으로 지켜진다.
   */
  timeline: {
    phases: [
      { id: 'fall', duration: FALL, caption: key('caption.falling') },
      { id: 'rest', duration: REST, caption: key('caption.landed') },
    ],
  },

  /**
   * 도착한 순간 이미 던져진 뒤다. 원본 `var phase = 0.70`. 사다리 네 칸
   * (τ = 0 · 0.2 · 0.4 · 0.6)이 이미 쌓인 자리다.
   */
  startAt: 0.7,

  /**
   * 슬롯 하나. 원본도 자리는 하나이고 착지 전후로 문구만 바뀐다.
   * 원본의 캡션은 캔버스 아래 줄 **왼쪽**에 있고 그 오른쪽이 손잡이다.
   */
  caption: {
    anchor: { screen: 'bottom-left' },
    align: 'left',
    fontSize: CAPTION_FONT_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /**
   * 그리드를 켜지 않는다(기본값). 이 조각에서 읽어야 할 것은 "선이 수평이다"
   * 하나뿐인데, 격자는 그 수평선을 격자선 중 하나로 만들어 버린다.
   */

  messages: projectileMotionMessages,
};
