// ========================================================================
// kinetic-energy — 선언
// ========================================================================
// 질문: 속력이 두 배면 왜 에너지도 두 배가 아니라 네 배인가.
//
// 같은 상자 둘이 같은 거친 바닥에 들어간다. 아래 상자만 두 배 빠르다. 붙잡는
// 마찰력은 둘에게 똑같은데(같은 상자 · 같은 바닥), 멈출 때까지 미끄러진 거리는
// 한 칸과 네 칸이다. 마찰이 빼앗은 에너지 = 힘 × 거리이므로, 거리가 네 배라는
// 것이 곧 담고 있던 에너지가 네 배라는 뜻이다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:kinetic-energy` 와 문자 그대로 일치한다 (C4). */
export const KINETIC_ENERGY_ID = 'kinetic-energy';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 위 상자의 진입 속력(m/s). */
export const V_SLOW = 2;
/** 아래 상자의 진입 속력(m/s). 정확히 두 배다 — 이 조각이 바꾸는 유일한 수. */
export const V_FAST = 4;
/** 거친 바닥이 주는 감속(m/s²). 두 상자가 같다 — 같은 상자, 같은 바닥. */
export const DECEL = 2;

/** 멈추기까지의 시간(초) · 거리(m). v²/2a 라서 거리는 속력의 제곱을 따라간다. */
export const STOP_TIME_SLOW = V_SLOW / DECEL;
export const STOP_TIME_FAST = V_FAST / DECEL;
export const STOP_DIST_SLOW = (V_SLOW * V_SLOW) / (2 * DECEL);
export const STOP_DIST_FAST = (V_FAST * V_FAST) / (2 * DECEL);

/** 눈금 한 칸 = 느린 상자가 미끄러진 거리 d. 네 칸이 곧 네 배다. */
export const CELL = STOP_DIST_SLOW;
/** 눈금 칸 수. 빠른 상자가 멈추는 자리(4d)까지 센다. */
export const CELL_COUNT = Math.round(STOP_DIST_FAST / CELL);

// ------------------------------------------------------------------------
// 배치 — 월드 미터. 두 레인을 위아래로 둔다.
// ------------------------------------------------------------------------

/** 거친 바닥이 시작하는 자리. 두 레인 모두 여기서 붙잡히기 시작한다. */
export const ROUGH_START = 0;
/** 거친 바닥의 끝. 빠른 상자가 멈추는 4d 보다 조금 더 간다. */
export const ROUGH_END = STOP_DIST_FAST + 0.85;

/** 위 레인(느린 상자) · 아래 레인(빠른 상자)의 바닥 높이. */
export const LANE_SLOW_Y = 1.25;
export const LANE_FAST_Y = 0;

/** 상자 크기 [가로, 세로](m). 둘이 같다 — 질량이 같다는 것이 주장의 전제다. */
export const BOX_SIZE: readonly [number, number] = [0.44, 0.3];
/** 거친 바닥 띠의 두께(m). 바닥선 아래로 깔린다. */
export const ROUGH_DEPTH = 0.14;
/** 미끄러진 자국 띠의 두께(m). 바닥선 위에 깔려 상자가 지나온 길이 남는다. */
export const SKID_THICKNESS = 0.06;

/** 속도 화살표가 놓이는 높이(바닥선 기준 m)와 속력 → 길이 배율(m per m/s). */
export const SPEED_ARROW_Y = 0.46;
export const SPEED_ARROW_SCALE = 0.22;
/** 마찰 화살표의 길이(m)와 높이. 둘에게 같은 길이다 — 같은 힘이기 때문이다. */
export const FRICTION_ARROW_LEN = 0.32;
export const FRICTION_ARROW_Y = 0.15;
/**
 * 멈춘 뒤 미끄러진 거리를 재는 치수선의 높이(바닥선 기준 m). 상자 위(0.3)에 바짝
 * 붙인다 — 레인 사이 한가운데에 띄우면 어느 레인의 거리인지가 흐려진다.
 */
export const MEASURE_Y = 0.44;

/** 눈금선의 위 · 아래 끝(월드 y). 두 레인을 세로로 꿰어 칸을 셀 수 있게 한다. */
export const TICK_TOP_Y = LANE_SLOW_Y;
export const TICK_BOTTOM_Y = -0.18;
/** 눈금 이름표가 놓이는 높이. */
export const TICK_LABEL_Y = -0.3;

/**
 * 프레이밍은 주장의 일부다. 가로는 상자가 들어오는 자리(−2.25)부터 4d 너머까지,
 * 세로는 눈금 이름표 아래와 위 레인 화살표 위까지. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -2.25, maxX: 5.05, minY: -0.62, maxY: 2.05 } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이는 물리가 정한다 (경계 상수를 따로 두지 않는다)
// ------------------------------------------------------------------------

/**
 * 들어오는 동안(초) — `enter` 단계의 길이다. 물리는 이 상수를 보지 않고 시간표에게
 * 묻는다(`duration('enter')` · `end('enter')`). 여기를 늘이면 두 상자가 더 먼 곳에서
 * 출발해 같은 순간 거친 바닥에 닿는 것만 그대로 남는다.
 */
export const APPROACH = 1.2;
/** 둘 다 미끄러지는 동안 — 느린 상자가 멈추는 순간 끝난다. */
export const BRAKE_BOTH = STOP_TIME_SLOW;
/** 빠른 상자만 미끄러지는 동안. */
export const BRAKE_FAST_ONLY = STOP_TIME_FAST - STOP_TIME_SLOW;
/** 멈춘 그림을 읽는 동안 · 다음 주기로 넘어가며 흐려지는 동안. */
export const HOLD = 3;
export const FADE = 0.6;
/** 들어오기 · 미끄러짐을 절반 속도로 흘린다 — 실시간 2 초는 눈으로 세기 짧다. */
export const SLOW_MOTION = 0.5;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const kineticEnergyMessages = Object.freeze({
  'label.title': {
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
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '속력이 담고 있는 에너지',
    en: 'The energy that speed carries',
    ja: '速さがもつエネルギー',
    zh: '速率所蕴含的能量',
    ar: 'الطاقة التي تحملها السرعة',
    es: 'La energía que lleva la rapidez',
    fr: 'L’énergie que porte la vitesse',
    hi: 'चाल में निहित ऊर्जा',
    id: 'Energi yang dibawa oleh kelajuan',
    pt: 'A energia que a velocidade carrega',
  },
  'label.stage': {
    ko: '거친 바닥',
    en: 'Rough floor',
    ja: '粗い床',
    zh: '粗糙地面',
    ar: 'أرضية خشنة',
    es: 'Suelo rugoso',
    fr: 'Sol rugueux',
    hi: 'खुरदरा फ़र्श',
    id: 'Lantai kasar',
    pt: 'Piso áspero',
  },
  'label.view': {
    ko: '두 레인',
    en: 'Two lanes',
    ja: '二つのレーン',
    zh: '两条通道',
    ar: 'مساران',
    es: 'Dos carriles',
    fr: 'Deux couloirs',
    hi: 'दो लेन',
    id: 'Dua lajur',
    pt: 'Duas faixas',
  },
  /** 화살표에 붙는 기호. 수식 표기라 번역 대상이 아니다 (C1 판정 3). */
  'label.speedSlow': {
    ko: 'v',
    en: 'v',
    ja: 'v',
    zh: 'v',
    ar: 'v',
    es: 'v',
    fr: 'v',
    hi: 'v',
    id: 'v',
    pt: 'v',
  },
  'label.speedFast': {
    ko: '2v',
    en: '2v',
    ja: '2v',
    zh: '2v',
    ar: '2v',
    es: '2v',
    fr: '2v',
    hi: '2v',
    id: '2v',
    pt: '2v',
  },
  'label.friction': {
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
  /** 눈금 이름표. d 는 느린 상자가 미끄러진 거리다. 표식이다. */
  'label.cell1': {
    ko: 'd',
    en: 'd',
    ja: 'd',
    zh: 'd',
    ar: 'd',
    es: 'd',
    fr: 'd',
    hi: 'd',
    id: 'd',
    pt: 'd',
  },
  'label.cell2': {
    ko: '2d',
    en: '2d',
    ja: '2d',
    zh: '2d',
    ar: '2d',
    es: '2d',
    fr: '2d',
    hi: '2d',
    id: '2d',
    pt: '2d',
  },
  'label.cell3': {
    ko: '3d',
    en: '3d',
    ja: '3d',
    zh: '3d',
    ar: '3d',
    es: '3d',
    fr: '3d',
    hi: '3d',
    id: '3d',
    pt: '3d',
  },
  'label.cell4': {
    ko: '4d',
    en: '4d',
    ja: '4d',
    zh: '4d',
    ar: '4d',
    es: '4d',
    fr: '4d',
    hi: '4d',
    id: '4d',
    pt: '4d',
  },
  'caption.enter': {
    ko: '같은 상자 둘 — 아래 상자만 두 배 빠르게 거친 바닥으로 들어간다',
    en: 'Two identical blocks — only the lower one enters the rough floor twice as fast',
    ja: '同じ箱が二つ — 下の箱だけが2倍の速さで粗い床に入る',
    zh: '两个相同的木块 — 只有下面那个以两倍的速度进入粗糙地面',
    ar: 'كتلتان متطابقتان — السفلى وحدها تدخل الأرضية الخشنة بضعف السرعة',
    es: 'Dos bloques idénticos — solo el de abajo entra en el suelo rugoso con el doble de rapidez',
    fr: 'Deux blocs identiques — seul celui du bas entre sur le sol rugueux deux fois plus vite',
    hi: 'दो एक जैसे गुटके — केवल नीचे वाला दुगुनी चाल से खुरदरे फ़र्श पर आता है',
    id: 'Dua balok identik — hanya yang bawah memasuki lantai kasar dua kali lebih cepat',
    pt: 'Dois blocos idênticos — só o de baixo entra no piso áspero com o dobro da velocidade',
  },
  'caption.grip': {
    ko: '거친 바닥이 둘을 같은 힘으로 붙잡는다',
    en: 'The rough floor holds both back with the same force',
    ja: '粗い床が二つを同じ力で引き止める',
    zh: '粗糙地面以相同的力阻碍两者',
    ar: 'تعيق الأرضية الخشنة الاثنين بالقوة نفسها',
    es: 'El suelo rugoso frena a ambos con la misma fuerza',
    fr: 'Le sol rugueux retient les deux avec la même force',
    hi: 'खुरदरा फ़र्श दोनों को एक ही बल से रोकता है',
    id: 'Lantai kasar menahan keduanya dengan gaya yang sama',
    pt: 'O piso áspero segura os dois com a mesma força',
  },
  'caption.split': {
    ko: '위 상자는 d 에서 멈췄다 — 같은 시간에 아래 상자는 3d 를 지났고 아직 미끄러진다',
    en: 'The upper block stopped at d — in the same time the lower one passed 3d and is still sliding',
    ja: '上の箱は d で止まった — 同じ時間に下の箱は 3d を過ぎ、まだ滑っている',
    zh: '上面的木块停在 d 处 — 同一时间里，下面的木块已越过 3d，仍在滑动',
    ar: 'توقفت الكتلة العليا عند d — وفي الزمن نفسه تجاوزت السفلى 3d ولا تزال تنزلق',
    es: 'El bloque de arriba se detuvo en d — en el mismo tiempo el de abajo pasó 3d y sigue deslizándose',
    fr: 'Le bloc du haut s’est arrêté à d — dans le même temps, celui du bas a dépassé 3d et glisse encore',
    hi: 'ऊपर वाला गुटका d पर रुक गया — उतने ही समय में नीचे वाला 3d पार कर चुका है और अब भी फिसल रहा है',
    id: 'Balok atas berhenti di d — dalam waktu yang sama balok bawah melewati 3d dan masih meluncur',
    pt: 'O bloco de cima parou em d — no mesmo tempo o de baixo passou de 3d e ainda desliza',
  },
  'caption.result': {
    ko: '속력이 두 배인 상자는 같은 힘에 맞서 네 배 멀리 미끄러졌다',
    en: 'The block moving twice as fast slid four times as far against the same force',
    ja: '2倍の速さの箱は、同じ力に逆らって4倍遠くまで滑った',
    zh: '速度为两倍的木块，在相同的力作用下滑行了四倍远',
    ar: 'الكتلة الأسرع بمرتين انزلقت أبعد بأربع مرات في مواجهة القوة نفسها',
    es: 'El bloque que iba el doble de rápido se deslizó cuatro veces más lejos contra la misma fuerza',
    fr: 'Le bloc deux fois plus rapide a glissé quatre fois plus loin contre la même force',
    hi: 'दुगुनी चाल वाला गुटका उसी बल के विरुद्ध चार गुना दूर फिसला',
    id: 'Balok yang dua kali lebih cepat meluncur empat kali lebih jauh melawan gaya yang sama',
    pt: 'O bloco duas vezes mais rápido deslizou quatro vezes mais longe contra a mesma força',
  },
} satisfies Record<string, LocalizedText>);

export type KineticEnergyMessageKey = keyof typeof kineticEnergyMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: KineticEnergyMessageKey): LocalizedText => kineticEnergyMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: KineticEnergyMessageKey): string {
  return k;
}

/** 눈금 칸마다의 이름표 키. 칸 수가 바뀌면 여기서 타입이 막는다. */
export const CELL_LABELS: readonly KineticEnergyMessageKey[] = [
  'label.cell1',
  'label.cell2',
  'label.cell3',
  'label.cell4',
];

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const kineticEnergySchema: BundleSchema = {
  id: KINETIC_ENERGY_ID,
  label: text('label.title'),
  category: 'mechanics',
  description: text('label.description'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 바로 미끄러지고, 멈추고, 다시 들어온다.
  parameters: [],

  stages: [
    {
      id: 'rough-floor',
      label: text('label.stage'),
      constants: { decel: DECEL, vSlow: V_SLOW, vFast: V_FAST },
    },
  ],

  environments: [],

  views: [{ id: 'lanes', label: text('label.view'), default: true }],

  /**
   * 가로 7.3 m 를 담아야 하고 세로는 두 레인(1.25 m 간격)과 눈금 이름표 · 캡션
   * 줄뿐이다. 세로를 더 주면 가로가 먼저 차서 그림만 작아진다 (S-piece — 세로가 비싸다).
   */
  canvas: { height: 384, minHeight: 344 },

  /**
   * 겹침이 판정 장치다. 미끄러진 자국 띠는 **상자 아래** 로 깔려야 상자가 그 위를
   * 지나온 것으로 읽히고, 눈금선은 상자 뒤로 지나가야 한다. 층 순서로는 `region`
   * 이 물체 위로 올라온다 (매질이 잠긴 것을 덮는 관계).
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 들어옴 → 둘 다 미끄러짐 → 빠른 상자만 미끄러짐 → 멈춘 그림 → 흐려짐.
   *
   * 단계 길이를 물리에서 끌어온다. 느린 상자가 멈추는 순간(v/a)이 곧 `brake-both`
   * 의 끝이라서, 「위 상자가 멈춘 그 순간」 이라는 캡션이 화면과 어긋날 수 없다.
   * 들어옴 · 미끄러짐은 절반 속도로 흘린다 — 실시간 2 초 동안 네 칸을 세기는 짧다.
   */
  timeline: {
    phases: [
      {
        id: 'enter',
        duration: APPROACH,
        timeScale: SLOW_MOTION,
        caption: key('caption.enter'),
      },
      {
        id: 'brake-both',
        duration: BRAKE_BOTH,
        timeScale: SLOW_MOTION,
        caption: key('caption.grip'),
      },
      {
        id: 'brake-fast',
        duration: BRAKE_FAST_ONLY,
        timeScale: SLOW_MOTION,
        caption: key('caption.split'),
      },
      { id: 'hold', duration: HOLD, caption: key('caption.result') },
      { id: 'fade', duration: FADE, caption: key('caption.result') },
    ],
  },

  /**
   * 도착한 순간 이미 진행 중이다 — 두 상자가 화면 안에서 거친 바닥을 향해 달리는
   * 자리에서 연다. 0 이면 둘 다 화면 왼쪽 밖에 있어 빈 바닥이 먼저 보인다.
   */
  startAt: 0.8,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 정의와 공식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것은 임의의 거리가 아니라 **칸 수**라,
   * 거리 격자를 깔면 「몇 미터인가」 라는 다른 질문이 끼어든다. 칸은 눈금선으로
   * 직접 긋는다 — d 한 칸이 기준이라는 것이 이 그림의 자 노릇이다.
   */

  messages: kineticEnergyMessages,
};
