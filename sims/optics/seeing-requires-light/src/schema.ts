// ========================================================================
// seeing-requires-light — 선언
// ========================================================================
// 질문: 사과가 보인다는 것은 무엇이 눈에 들어온다는 뜻인가.
//
// 어두운 방에 등 · 사과 · 눈이 있다. 등의 빛이 사과에 닿고, 사과는 그 빛을 사방으로
// 튀겨 그 가운데 일부가 눈에 들어온다. 등을 끄면 등에서 사과로 가는 줄기가 끊기고,
// 사과에서 튀어 나오는 줄기도 · 눈 옆 칸의 빛도 · 사과의 밝기도 함께 꺼진다.
// 사과는 그 자리에 있는데 보이지 않는다.
//
// 빛은 언제나 등 → 사과 → 눈으로 흐른다. 눈에서 나가는 화살표는 두지 않는다 —
// 「눈에서 빛이 나가 물체를 본다」 는 오개념을 그림이 거들지 않게 한다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText, Vec2 } from '@aperi21/schema';

/** 등록 키 `aperi21:seeing-requires-light` 와 문자 그대로 일치한다 (C4). */
export const SEEING_REQUIRES_LIGHT_ID = 'seeing-requires-light';

// ------------------------------------------------------------------------
// 물리 · 표시 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 켜진 등의 세기(0~1). 줄기 · 사과 · 눈 옆 칸의 밝기가 모두 이것에 비례한다. */
export const LAMP_INTENSITY = 1;
/** 등(전구 중심)의 자리 — 월드. */
export const LAMP_X = -3.7;
export const LAMP_Y = 1.0;
/** 등 빛의 색(선형광 세 성분). 백열등 쪽으로 조금 따뜻한 흰빛. */
export const LAMP_RGB: readonly [number, number, number] = [1, 0.94, 0.82];
/** 사과 겉면이 성분마다 되튀기는 몫(반사율). 빨강을 많이 튀긴다. */
export const APPLE_ALBEDO: readonly [number, number, number] = [0.8, 0.1, 0.07];
/** 사과에서 튄 줄기 하나가 사과 겉면 밝기에 대해 지니는 몫 — 사방으로 나뉘어 한 줄기는 더 어둡다. */
export const SCATTER_SHARE = 0.7;
/** 줄기 위 꺾쇠가 흐르는 표시 속력(월드/초)과 꺾쇠 간격(월드). 실제 빛의 속력이 아니라 방향 표지다. */
export const FLOW_SPEED = 0.8;
export const FLOW_SPACING = 0.75;

// ------------------------------------------------------------------------
// 배치 — 월드. y 위.
// ------------------------------------------------------------------------

/** 어두운 방 — 빛 없음으로 칠한다. 눈 옆 칸과 캡션은 방 밖(테마 바탕)에 둔다. */
export const ROOM = { minX: -4.9, maxX: 4.05, minY: -1.75, maxY: 2.0 } as const;

/** 전구 반지름 · 꼭지쇠 크기 [가로, 세로]. */
export const BULB_R = 0.3;
export const BULB_BASE: Vec2 = [0.26, 0.22];

/** 사과 중심 · 줄기가 닿고 떠나는 겉면 반지름(윤곽을 원으로 본 값). */
export const APPLE_CENTER: Vec2 = [0, -0.88];
export const APPLE_HIT_R = 0.48;

/**
 * 사과 윤곽 — 3차 베지어 조각들. 좌표는 사과 중심 기준 월드. 위쪽 오목한 자리에서 시작해
 * 오른쪽으로 돈다. `body` custom 경로와 어둠 속 점선 윤곽이 같은 조각에서 나온다.
 */
export const APPLE_OUTLINE: readonly (readonly [Vec2, Vec2, Vec2, Vec2])[] = [
  [[0, 0.36], [0.16, 0.52], [0.54, 0.5], [0.52, 0.06]],
  [[0.52, 0.06], [0.5, -0.34], [0.24, -0.52], [0, -0.44]],
  [[0, -0.44], [-0.24, -0.52], [-0.5, -0.34], [-0.52, 0.06]],
  [[-0.52, 0.06], [-0.54, 0.5], [-0.16, 0.52], [0, 0.36]],
];
/** 꼭지 — 사과 중심 기준 사각형 네 꼭짓점. */
export const APPLE_STEM: readonly Vec2[] = [
  [-0.03, 0.34],
  [0.05, 0.34],
  [0.11, 0.58],
  [0.05, 0.58],
];

/** 사과가 놓인 탁자 선의 높이와 가로 범위. */
export const TABLE_Y = -1.37;
export const TABLE_HALF = 1.3;

/** 눈 — 중심, 눈꺼풀 반폭 · 반높이, 홍채 반지름과 중심을 사과 쪽으로 옮긴 거리, 동공 반지름. */
export const EYE_CENTER: Vec2 = [3.3, 0.45];
export const EYE_HALF_W = 0.42;
export const EYE_HALF_H = 0.22;
export const IRIS_R = 0.17;
export const IRIS_SHIFT = 0.12;
export const PUPIL_R = 0.07;

/** 눈 옆 밝기 칸 — 방 밖에 둔다. 한 변 길이와 방 경계에서 띄운 거리. */
export const TILE_SIZE = 0.7;
export const TILE_GAP = 0.35;

/** 등에서 사과로 가는 줄기가 닿는 사과 겉면 자리 — 사과→등 방향에서 벌린 각(라디안). */
export const INCIDENT_SPREAD = [-0.45, 0, 0.45] as const;
/** 등에서 다른 쪽으로 나가는 짧은 줄기의 방향(라디안)과 길이. 등은 사방으로 빛을 낸다. 끝이 방 안에 머물러야 한다 — 방 밖 테마 바탕에서는 흰빛이 묻히고 꺼진 줄기가 검은 선으로 남는다. */
export const LAMP_SPRAY_ANGLES = [0, 0.8, 1.57, 2.36, 3.14, 3.93] as const;
export const LAMP_SPRAY_LEN = 0.6;
/** 사과에서 튀어 나가는 짧은 줄기의 방향(라디안)과 길이. 눈으로 가는 줄기는 따로 긋는다. 들어오는 줄기(사과 왼쪽 위)와 엇갈리지 않는 방향만 둔다 — 아래쪽은 탁자다. */
export const SCATTER_ANGLES = [-0.2, 0.65, 1.2, 1.75, 3.45] as const;
export const SCATTER_LEN = 1.0;

/**
 * 프레이밍은 주장의 일부다. 방 전체 + 오른쪽 눈 옆 칸과 그 이름표 + 아래 캡션 줄.
 * 매 프레임 같은 값이다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: -5.0, maxX: 5.5, minY: -2.45, maxY: 2.1 } as const;

// ------------------------------------------------------------------------
// 시간표
// ------------------------------------------------------------------------

/** 켜진 채 줄기가 흐르는 동안 · 끄는 동안 · 꺼진 채 · 켜는 동안(초). */
export const LIT = 5;
export const SWITCH = 0.7;
export const DARK = 4.2;
/** 도착한 순간 이미 줄기가 흐르고 있다 — 켜진 단계 안에서 연다. */
export const START_AT = 1;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const seeingRequiresLightMessages = Object.freeze({
  'label.title': {
    ko: '보려면 빛이 있어야',
    en: 'Seeing needs light',
    ja: '見るには光が必要',
    zh: '看见需要光',
    ar: 'الرؤية تحتاج إلى الضوء',
    es: 'Para ver hace falta luz',
    fr: 'Voir exige de la lumière',
    hi: 'देखने के लिए प्रकाश चाहिए',
    id: 'Melihat butuh cahaya',
    pt: 'Para ver é preciso luz',
  },
  'label.operation': {
    ko: '빛이 없으면 물체가 보이지 않는다',
    en: 'Without light, an object cannot be seen',
    ja: '光がなければ物体は見えない',
    zh: '没有光，物体就看不见',
    ar: 'من دون ضوء لا يمكن رؤية الجسم',
    es: 'Sin luz, un objeto no se puede ver',
    fr: 'Sans lumière, on ne peut pas voir un objet',
    hi: 'प्रकाश के बिना कोई वस्तु नहीं दिखती',
    id: 'Tanpa cahaya, benda tidak dapat dilihat',
    pt: 'Sem luz, um objeto não pode ser visto',
  },
  'label.stage': {
    ko: '어두운 방',
    en: 'Dark room',
    ja: '暗い部屋',
    zh: '暗室',
    ar: 'غرفة مظلمة',
    es: 'Habitación oscura',
    fr: 'Pièce sombre',
    hi: 'अँधेरा कमरा',
    id: 'Ruang gelap',
    pt: 'Quarto escuro',
  },
  'label.view': {
    ko: '등 · 사과 · 눈',
    en: 'Lamp, apple, eye',
    ja: 'ランプ・リンゴ・目',
    zh: '灯、苹果、眼睛',
    ar: 'مصباح، تفاحة، عين',
    es: 'Lámpara, manzana, ojo',
    fr: 'Lampe, pomme, œil',
    hi: 'लैंप, सेब, आँख',
    id: 'Lampu, apel, mata',
    pt: 'Lâmpada, maçã, olho',
  },
  'label.tile': {
    ko: '눈에 닿은 빛',
    en: 'light at the eye',
    ja: '目に届く光',
    zh: '到达眼睛的光',
    ar: 'الضوء عند العين',
    es: 'luz que llega al ojo',
    fr: 'lumière qui atteint l’œil',
    hi: 'आँख तक पहुँचा प्रकाश',
    id: 'cahaya yang sampai di mata',
    pt: 'luz que chega ao olho',
  },
  'caption.lit': {
    ko: '등의 빛이 사과에 닿고, 사과에서 사방으로 튄 빛 가운데 일부가 눈에 들어온다',
    en: 'Light from the lamp reaches the apple; the apple sends it every way, and some of it enters the eye',
    ja: 'ランプの光がリンゴに届き、リンゴはそれをあらゆる方向へ送り出し、その一部が目に入る',
    zh: '灯的光照到苹果上；苹果把光送向四面八方，其中一部分进入眼睛',
    ar: 'يصل ضوء المصباح إلى التفاحة؛ فترسله التفاحة في كل اتجاه، ويدخل بعضه العين',
    es: 'La luz de la lámpara llega a la manzana; la manzana la envía en todas direcciones y parte de ella entra en el ojo',
    fr: 'La lumière de la lampe atteint la pomme ; la pomme la renvoie dans tous les sens, et une partie entre dans l’œil',
    hi: 'लैंप का प्रकाश सेब तक पहुँचता है; सेब उसे हर दिशा में भेजता है, और उसका कुछ भाग आँख में प्रवेश करता है',
    id: 'Cahaya dari lampu sampai ke apel; apel memancarkannya ke segala arah, dan sebagian masuk ke mata',
    pt: 'A luz da lâmpada chega à maçã; a maçã a envia em todas as direções, e parte dela entra no olho',
  },
  'caption.switchOff': {
    ko: '등을 끈다',
    en: 'The lamp is switched off',
    ja: 'ランプを消す',
    zh: '关掉灯',
    ar: 'يُطفأ المصباح',
    es: 'Se apaga la lámpara',
    fr: 'On éteint la lampe',
    hi: 'लैंप बुझाया जाता है',
    id: 'Lampu dimatikan',
    pt: 'A lâmpada é desligada',
  },
  'caption.dark': {
    ko: '사과에서 눈으로 오는 빛이 없다 — 사과는 그 자리에 있지만 보이지 않는다',
    en: 'No light comes from the apple to the eye — the apple is still there, but it cannot be seen',
    ja: 'リンゴから目に来る光がない — リンゴはそこにあるのに見えない',
    zh: '没有光从苹果来到眼睛 — 苹果还在那里，却看不见',
    ar: 'لا يصل أي ضوء من التفاحة إلى العين — التفاحة ما زالت هناك، لكن لا يمكن رؤيتها',
    es: 'No llega luz de la manzana al ojo — la manzana sigue ahí, pero no se puede ver',
    fr: 'Aucune lumière ne va de la pomme à l’œil — la pomme est toujours là, mais on ne peut pas la voir',
    hi: 'सेब से आँख तक कोई प्रकाश नहीं आता — सेब अब भी वहीं है, पर दिखाई नहीं देता',
    id: 'Tidak ada cahaya dari apel ke mata — apel masih di sana, tetapi tidak dapat dilihat',
    pt: 'Nenhuma luz vai da maçã ao olho — a maçã continua lá, mas não pode ser vista',
  },
  'caption.switchOn': {
    ko: '등을 켠다',
    en: 'The lamp is switched on',
    ja: 'ランプをつける',
    zh: '打开灯',
    ar: 'يُضاء المصباح',
    es: 'Se enciende la lámpara',
    fr: 'On allume la lampe',
    hi: 'लैंप जलाया जाता है',
    id: 'Lampu dinyalakan',
    pt: 'A lâmpada é ligada',
  },
} satisfies Record<string, LocalizedText>);

export type SeeingRequiresLightMessageKey = keyof typeof seeingRequiresLightMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: SeeingRequiresLightMessageKey): LocalizedText => seeingRequiresLightMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: SeeingRequiresLightMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const seeingRequiresLightSchema: BundleSchema = {
  id: SEEING_REQUIRES_LIGHT_ID,
  label: text('label.title'),
  category: 'optics',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 줄기가 흐르고, 등이 꺼지고, 다시 켜진다.
  parameters: [],

  stages: [
    {
      id: 'dark-room',
      label: text('label.stage'),
      constants: {
        lampIntensity: LAMP_INTENSITY,
        lampX: LAMP_X,
        lampY: LAMP_Y,
        lampR: LAMP_RGB[0],
        lampG: LAMP_RGB[1],
        lampB: LAMP_RGB[2],
        albedoR: APPLE_ALBEDO[0],
        albedoG: APPLE_ALBEDO[1],
        albedoB: APPLE_ALBEDO[2],
        scatterShare: SCATTER_SHARE,
        flowSpeed: FLOW_SPEED,
        flowSpacing: FLOW_SPACING,
      },
    },
  ],

  environments: [],

  views: [{ id: 'room', label: text('label.view'), default: true }],

  /** 가로로 넓고 세로로 좁다 — 등 · 사과 · 눈을 한 줄로 늘어놓는다 (S-piece — 세로가 비싸다). */
  canvas: { height: 360, minHeight: 320 },

  /**
   * 겹침이 판정 장치다. 빛 없음 방을 먼저 깔고, 줄기 → 사과 → 등 · 눈 순서로 얹는다.
   * 층 순서로는 `region`(방)이 물체 위로 올라와 사과를 덮는다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 켜짐 → 끄기 → 꺼짐 → 켜기. 끄고 켜는 동안 등 세기가 `smooth` 로
   * 오르내리고, 줄기 · 사과 · 눈 옆 칸이 그 세기를 함께 따른다.
   */
  timeline: {
    phases: [
      { id: 'lit', duration: LIT, caption: key('caption.lit') },
      { id: 'switch-off', duration: SWITCH, ease: 'smooth', caption: key('caption.switchOff') },
      { id: 'dark', duration: DARK, caption: key('caption.dark') },
      { id: 'switch-on', duration: SWITCH, ease: 'smooth', caption: key('caption.switchOn') },
    ],
  },

  startAt: START_AT,

  // 슬롯 하나. 방 아래 테마 바탕 위에 둔다 — 빛 없음 방 위에서는 라이트 테마의 먹색 글자가 묻힌다.
  caption: {
    anchor: { screen: 'bottom-left', offset: [12, -8] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 660,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  // 그리드 · 카메라 단추 없음(기본값). 잴 거리가 없다.

  messages: seeingRequiresLightMessages,
};
