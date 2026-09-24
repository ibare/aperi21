// ========================================================================
// generator — 선언
// ========================================================================
// 질문: 손잡이를 돌려 전기를 만들면, 그 전기는 어디서 오는가.
//
// 자기장 속에서 코일을 손잡이로 돌린다. 빠르기는 처음부터 끝까지 같다. 회로가 열려
// 있는 동안에는 전구가 꺼져 있고 손잡이를 미는 힘(화살표 F)이 짧다 — 굴대 마찰만
// 이기면 된다. 스위치를 닫으면 코일에 전류가 흘러 전구가 켜지고, **같은 빠르기로
// 돌리는 데 드는 힘이 커진다.** 전구가 쓰는 에너지만큼 손이 더 일한다.
//
// 기전력이 사인파로 오르내리는 모양은 이웃 조각 `ac-generation` 의 몫이다. 여기서
// 전류는 코일 도선의 ⊙ · ⊗ 표식과 전구의 빛으로만 보인다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:generator` 와 문자 그대로 일치한다 (C4). */
export const GENERATOR_ID = 'generator';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 손잡이가 1 초에 도는 바퀴 수. 열림 · 닫힘 내내 같다 — 「같은 돌림」 이 전제다. */
export const TURNS_PER_SECOND = 0.5;
/** 극 사이 자기장 세기(T). */
export const FIELD_B = 0.5;
/** 코일의 감은 수. */
export const TURNS = 200;
/** 코일 한 바퀴의 넓이(m²). */
export const COIL_AREA = 0.01;
/** 부하(전구)의 저항(Ω). */
export const LOAD_RESISTANCE = 10;
/** 코일 자신의 저항(Ω). */
export const COIL_RESISTANCE = 2;
/** 굴대 마찰 돌림힘(N·m). 회로가 열려 있어도 손이 이겨야 하는 몫이다. */
export const FRICTION_TORQUE = 0.05;
/** 손잡이 팔 길이(m). 돌림힘 → 손잡이를 미는 힘. */
export const CRANK_ARM = 0.1;
/**
 * 필라멘트가 데워지고 식는 시간(초). 전력은 한 바퀴에 두 번 0 이 되지만 필라멘트는
 * 곧바로 식지 않는다 — 전구 빛은 전력을 이 시간으로 늦춰 따라간다.
 */
export const FILAMENT_LAG = 0.4;

// ------------------------------------------------------------------------
// 표시 배율 — 이것도 선언이다 (원칙 2).
// ------------------------------------------------------------------------

/** 손잡이를 미는 힘(N) → 화살표 길이(월드). */
export const FORCE_TO_WORLD = 0.5;
/**
 * 필라멘트 온기(한 바퀴 평균이 0.5 인 전력 비) → 빛의 세기. 1 을 넘으면 가득 찬 빛에서
 * 자른다 — 빛 채널이 1 까지뿐이다.
 */
export const LIGHT_GAIN = 1.4;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 왼쪽에 굴대 방향에서 본 발전기, 오른쪽에 전구 · 스위치 회로.
// ------------------------------------------------------------------------

/** 굴대(회전 중심). */
export const AXLE: readonly [number, number] = [-2.4, 0.2];
/** 극 조각 — 가로 · 세로 크기와, 굴대에서 극면까지의 거리. */
export const POLE_W = 0.9;
export const POLE_H = 2.3;
export const POLE_GAP_HALF = 1.3;
/** 코일 두 도선이 굴대에서 떨어진 거리(옆에서 본 코일 반폭). */
export const COIL_RADIUS = 0.75;
/** 도선 단면 원의 반지름. */
export const WIRE_RADIUS = 0.14;
/** 손잡이(손으로 잡는 끝)가 굴대에서 떨어진 거리 — 극면 안쪽에서 돈다. */
export const KNOB_RADIUS = 1.05;
/** 극 사이 자기력선 — 굴대 높이를 가운데로 위아래 몇 가닥, 가닥 사이 간격. */
export const FIELD_LINE_COUNT = 5;
export const FIELD_LINE_STEP = 0.45;

/** 발전기에서 나오는 두 도선의 가로 자리(굴대 양옆). */
export const LEAD_OFFSET = 0.07;
/** 회로 — 왼쪽 · 오른쪽 세로 도선, 위 도선, 아래 두 도선의 높이. */
export const LOOP_LEFT = 0.6;
export const LOOP_RIGHT = 4.0;
export const LOOP_TOP = 0.95;
export const LOOP_BOTTOM_INNER = -1.3;
export const LOOP_BOTTOM_OUTER = -1.65;
/** 전구 · 스위치 자리. 회로 기호는 가운데에서 양쪽으로 1 씩 뻗는다(plugin-circuit). */
export const LAMP_X = 2.3;
export const SWITCH_Y = -0.35;
export const ELEMENT_HALF = 1;
/** 전구 기호 동그라미의 반지름(plugin-circuit lamp, 리드선을 뺀 가운데 절반). */
export const LAMP_RADIUS = 0.5;

/**
 * 프레이밍 — N 극 왼끝(−4.6) 조금 밖부터 오른쪽 도선 너머, 세로는 캡션 자리를 둔 아래
 * 도선 밑부터 전구 빛살 위까지. 매 프레임 같은 값이다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: -5.1, maxX: 4.5, minY: -2.25, maxY: 1.95 } as const;

// ------------------------------------------------------------------------
// 시간표
// ------------------------------------------------------------------------

/** 스위치를 막 연 뒤 — 전류가 끊기고 전구가 식는 동안(초). */
export const OPENED_SPAN = 1.6;
/** 회로가 열린 채 도는 동안(초). */
export const OPEN_SPAN = 3;
/** 스위치를 닫아 전구가 켜져 있는 동안(초). */
export const CLOSED_SPAN = 6;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const generatorMessages = Object.freeze({
  'label.title': { ko: '발전기', en: 'Generator' },
  'label.stage': { ko: '손잡이 발전기', en: 'Hand-crank generator' },
  'label.view': { ko: '굴대 쪽에서', en: 'Along the axle' },
  /** 극에 새겨진 표식 (C1 판정 1). */
  'label.poleN': { ko: 'N', en: 'N' },
  'label.poleS': { ko: 'S', en: 'S' },
  /** 손잡이를 미는 힘의 기호 (C1 판정 3). */
  'label.force': { ko: 'F', en: 'F' },
  'caption.opened': {
    ko: '스위치를 열었다 — 전류가 끊겨 전구가 식고, 손잡이가 다시 가벼워진다',
    en: 'The switch is open again — the current stops, the bulb cools and the handle is light again',
  },
  'caption.open': {
    ko: '스위치가 열려 있다 — 돌려도 전구는 꺼져 있고, 손잡이는 가볍게 돈다',
    en: 'The switch is open — the bulb stays dark and the handle turns easily',
  },
  'caption.closed': {
    ko: '스위치를 닫았다 — 코일에 전류가 흘러 전구가 켜지고, 같은 빠르기로 돌리는 데 힘이 더 든다',
    en: 'The switch is closed — current flows, the bulb lights, and the same turning now takes more force',
  },
} satisfies Record<string, LocalizedText>);

export type GeneratorMessageKey = keyof typeof generatorMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: GeneratorMessageKey): LocalizedText => generatorMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: GeneratorMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const generatorSchema: BundleSchema = {
  id: GENERATOR_ID,
  title: text('label.title'),
  category: 'em',
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 이미 돌고 있고, 스위치가 저절로 닫혔다 열린다.
  parameters: [],

  stages: [
    {
      id: 'hand-crank',
      label: text('label.stage'),
      constants: {
        turnsPerSecond: TURNS_PER_SECOND,
        fieldB: FIELD_B,
        turns: TURNS,
        coilArea: COIL_AREA,
        loadResistance: LOAD_RESISTANCE,
        coilResistance: COIL_RESISTANCE,
        frictionTorque: FRICTION_TORQUE,
        crankArm: CRANK_ARM,
        filamentLag: FILAMENT_LAG,
        forceToWorld: FORCE_TO_WORLD,
        lightGain: LIGHT_GAIN,
      },
    },
  ],

  environments: [],
  views: [{ id: 'axle', label: text('label.view'), default: true }],

  /** 가로로 넓고 세로로 좁다 — 발전기 하나와 회로 한 바퀴가 전부다. */
  canvas: { height: 360, minHeight: 320 },

  /**
   * 겹침이 판정 장치다. 발전기에서 나오는 두 도선은 도는 코일 **뒤**로, 전구의 빛은
   * 전구 기호 **아래**로, 손잡이 힘 화살표는 모든 것 **위**로 가야 한다. 층 순서로는
   * 빛 원(body)이 기호(circuitElement)를 덮는다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 막 엶 → 열림 → 닫힘. 손잡이는 세 단계 내내 같은 빠르기로 돈다(시계의 함수).
   * 스위치가 닫히는 순간 전류가 흐르기 시작하고, 열리는 순간 멎는다. 전구 빛만
   * 필라멘트 지연(`filamentLag`)으로 뒤따른다 — 물리가 정하는 것이지 단계가 아니다.
   */
  timeline: {
    phases: [
      { id: 'opened', duration: OPENED_SPAN, caption: key('caption.opened') },
      { id: 'open', duration: OPEN_SPAN, caption: key('caption.open') },
      { id: 'closed', duration: CLOSED_SPAN, caption: key('caption.closed') },
    ],
  },

  /**
   * 도착한 순간 이미 돌고 있다 — 전구가 다 식은 열림 단계 한가운데(주기 안 2 초)에서 연다.
   * 손잡이는 시계의 함수라 이미 한 바퀴를 돈 자리다.
   */
  startAt: 2,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 법칙과 식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 720,
    fade: 0.25,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 힘에 눈금 수를 달지 않는다 — 잴 것은 몇 뉴턴인가가
   * 아니라 **화살표가 길어졌는가** 다.
   */

  messages: generatorMessages,
};
