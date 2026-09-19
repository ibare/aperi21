// ========================================================================
// eddy-current — 선언
// ========================================================================
// 질문: 구리는 자석에 붙지 않는다. 그런데 구리 관 속으로 자석을 떨어뜨리면 왜
// 천천히 떨어지는가.
//
// 같은 자석 둘을 같은 높이에서 동시에 놓는다. 왼쪽 플라스틱 관 속 자석은 점점
// 빨라지며 순식간에 바닥에 닿고, 오른쪽 구리 관 속 자석은 곧 고른 빠르기가 되어
// 천천히 내려간다. 관 옆에 같은 시간 간격으로 찍은 눈금이 남는다 — 플라스틱 쪽은
// 간격이 벌어지고(빨라짐), 구리 쪽은 간격이 고르다(종단 속도). 구리 관 벽에는
// 자석 위와 아래에 서로 반대로 도는 맴돌이 전류 고리가 자석을 따라 내려가고, 그
// 전류가 만드는 막는 힘 F 가 무게 mg 와 맞선다.
//
// 유도 전류의 방향 규칙 자체는 이웃 `lenz-law`, 전압의 크기는 `faradays-law` 의
// 몫이다. 이 조각은 **덩어리 도체 속에서 저절로 도는 전류가 움직임을 막는다** 만 말한다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:eddy-current` 와 문자 그대로 일치한다 (C4). */
export const EDDY_CURRENT_ID = 'eddy-current';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 중력 가속도(월드 단위/초²). 월드 1 을 1 m 로 본다. */
export const GRAVITY = 9.8;
/**
 * 구리 관 속 자석의 종단 속력(월드/초). 막는 힘이 속력에 비례(F = k·v)하므로
 * 무게와 같아지는 속력이 하나 있고, 자석은 곧 그 빠르기로 내려간다.
 */
export const TERMINAL_SPEED = 0.8;
/** 스트로보 눈금 간격(초). 두 관이 같은 간격이라 눈금 사이 거리가 곧 빠르기다. */
export const STROBE_DT = 0.2;

// ------------------------------------------------------------------------
// 표시 배율 — 이것도 선언이다 (원칙 2).
// ------------------------------------------------------------------------

/**
 * 힘 → 화살표 길이(월드). 무게 mg 가 이 길이다. 막는 힘은 mg · (v / 종단 속력) 이라
 * 종단 속력에서 정확히 같은 길이가 된다 — 상한에 걸리지 않는다.
 */
export const FORCE_SCALE = 0.55;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 관 둘이 나란히 바닥에 서 있다.
// ------------------------------------------------------------------------

/** 관 한가운데 x — 왼쪽 플라스틱, 오른쪽 구리. */
export const PLASTIC_X = -1.9;
export const COPPER_X = 1.9;
/** 관 위 끝 · 아래 끝(바닥). */
export const TUBE_TOP = 2;
export const TUBE_BOTTOM = -2;
/** 관 안쪽 반폭 · 벽 두께. */
export const TUBE_INNER = 0.3;
export const TUBE_WALL = 0.09;
/** 자석 폭 · 높이. 위 반쪽 S, 아래 반쪽 N — N 이 아래를 보고 떨어진다. */
export const MAGNET_W = 0.44;
export const MAGNET_H = 0.48;
/** 놓기 전 자석 중심 — 관 위 끝 바로 안쪽. */
export const START_Y = TUBE_TOP - MAGNET_H / 2 - 0.04;
/** 바닥에 닿은 자석 중심. */
export const FLOOR_Y = TUBE_BOTTOM + MAGNET_H / 2;
/** 떨어지는 거리. */
export const DROP = START_Y - FLOOR_Y;

/** 맴돌이 고리가 자석 중심에서 위 · 아래로 떨어진 거리. */
export const LOOP_OFFSET = 0.42;
/** 비스듬히 본 고리의 세로 반지름 — 관을 휘감는 고리로 읽힐 만큼만 연다. */
export const LOOP_RY = 0.085;
/** 고리가 관 바깥 면보다 조금 넓다 — 벽을 휘감는다. */
export const LOOP_RX = TUBE_INNER + TUBE_WALL + 0.035;

/** 스트로보 눈금이 관 바깥 면에서 떨어진 거리 · 눈금 길이. 관 왼쪽에 선다. */
export const STROBE_GAP = 0.2;
export const STROBE_LEN = 0.22;
/** 힘 화살표가 관 바깥 면에서 떨어진 거리. 관 오른쪽에 선다. */
export const FORCE_GAP = 0.24;
/** 관 이름표 높이(바닥 아래). */
export const TUBE_LABEL_Y = TUBE_BOTTOM - 0.3;

/**
 * 프레이밍 — 왼쪽 관의 스트로보 눈금부터 오른쪽 관의 힘 이름표까지, 세로는 캡션 자리부터
 * 관 위 끝 너머까지. 매 프레임 같은 값이다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: -3.6, maxX: 3.6, minY: -2.8, maxY: 2.35 } as const;

// ------------------------------------------------------------------------
// 시간표 — 떨어지는 단계의 길이는 물리가 정한다
// ------------------------------------------------------------------------

/** 자석이 관 위에 나타나는 동안. */
export const APPEAR = 0.4;
/** 놓기 전에 들고 있는 동안. */
export const HOLD = 0.9;
/** 플라스틱 관 — 자유 낙하가 바닥에 닿는 시간 √(2h/g). 이 단계가 끝나는 순간 닿는다. */
export const FALL = Math.sqrt((2 * DROP) / GRAVITY);
/**
 * 구리 관 — 바닥에 닿는 시간. v(t) = v_t(1 − e^(−t/τ)), τ = v_t/g 를 적분하면
 * h = v_t · (T − τ(1 − e^(−T/τ))) 이고, T ≫ τ 라 T = h/v_t + τ 로 충분하다.
 */
export const COPPER_TIME = DROP / TERMINAL_SPEED + TERMINAL_SPEED / GRAVITY;
/** 구리 관 쪽이 혼자 내려가는 동안을 둘로 나눈다 — 앞은 빠르기, 뒤는 까닭을 말한다. */
export const CRAWL = 1.8;
export const BRAKE = COPPER_TIME - FALL - CRAWL;
/** 둘 다 바닥에 닿은 채 견주는 동안. */
export const LAND = 1.8;
/** 모두 흐려지고 처음으로 돌아가는 동안. */
export const RESET = 0.6;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const eddyCurrentMessages = Object.freeze({
  'label.title': { ko: '맴돌이 전류', en: 'Eddy currents' },
  'label.operation': { ko: '덩어리 도체 속의 유도 전류', en: 'Induced currents inside a solid conductor' },
  'label.stage': { ko: '두 관', en: 'Two tubes' },
  'label.view': { ko: '옆에서', en: 'From the side' },
  /** 관 이름표. */
  'label.plastic': { ko: '플라스틱 관', en: 'Plastic tube' },
  'label.copper': { ko: '구리 관', en: 'Copper tube' },
  /** 자석에 새겨진 극 표식 (C1 판정 1). */
  'label.poleN': { ko: 'N', en: 'N' },
  'label.poleS': { ko: 'S', en: 'S' },
  /** 힘 기호 (C1 판정 3). */
  'label.weight': { ko: 'mg', en: 'mg' },
  'label.brake': { ko: 'F', en: 'F' },
  'caption.hold': {
    ko: '같은 자석 둘을 같은 높이에 들었다 — 왼쪽은 플라스틱 관, 오른쪽은 구리 관',
    en: 'Two identical magnets at the same height — a plastic tube on the left, a copper tube on the right',
  },
  'caption.fall': {
    ko: '동시에 놓았다 — 플라스틱 관 속 자석은 점점 빨라지며 떨어진다',
    en: 'Released together — the magnet in the plastic tube falls faster and faster',
  },
  'caption.crawl': {
    ko: '플라스틱 쪽은 벌써 바닥 — 구리 관 속 자석은 고른 빠르기로 천천히 내려간다',
    en: 'The plastic one has already landed — the magnet in the copper tube creeps down at a steady speed',
  },
  'caption.brake': {
    ko: '자석 위아래 관 벽에 맴돌이 전류가 서로 반대로 돌며 떨어짐을 막는다',
    en: 'Eddy currents circle the tube wall above and below the magnet, in opposite senses, and hold back its fall',
  },
  'caption.land': {
    ko: '구리 관 쪽도 바닥에 닿았다 — 자석이 멈추자 맴돌이 전류도 사라졌다',
    en: 'The copper one lands too — once the magnet stops, the eddy currents are gone',
  },
} satisfies Record<string, LocalizedText>);

export type EddyCurrentMessageKey = keyof typeof eddyCurrentMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: EddyCurrentMessageKey): LocalizedText => eddyCurrentMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: EddyCurrentMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const eddyCurrentSchema: BundleSchema = {
  id: EDDY_CURRENT_ID,
  label: text('label.title'),
  category: 'em',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 두 자석이 이미 떨어지고 있다.
  parameters: [],

  stages: [
    {
      id: 'tubes',
      label: text('label.stage'),
      constants: {
        gravity: GRAVITY,
        terminalSpeed: TERMINAL_SPEED,
        strobeDt: STROBE_DT,
        forceScale: FORCE_SCALE,
      },
    },
  ],

  environments: [],
  views: [{ id: 'side', label: text('label.view'), default: true }],

  /** 관이 세로로 서 있어 세로를 조금 더 쓴다. 가로는 관 둘과 눈금 · 화살표면 된다. */
  canvas: { height: 340, minHeight: 300 },

  /**
   * 겹침이 판정 장치다. 맴돌이 고리가 관을 **휘감아야** 한다 — 고리의 뒤 반쪽은 자석 ·
   * 관 벽 아래, 앞 반쪽은 그 위를 지나야 「관 벽을 도는 전류」 로 읽힌다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 나타남 → 들고 있음 → 놓음(플라스틱 쪽이 닿을 때까지) → 구리 쪽만 내려감
   * (둘로 나눔) → 둘 다 닿음 → 흐려짐.
   *
   * `fall` 은 플라스틱 쪽 자유 낙하 시간, `fall` + `crawl` + `brake` 는 구리 쪽이 닿는
   * 시간이라 캡션이 화면과 어긋나지 않는다. 멈춤 자체는 물리가 정한다(physics `dropAfter`
   * 가 바닥에서 자른다) — 저작자가 단계를 늘이면 자석이 먼저 닿고 기다린다.
   */
  timeline: {
    phases: [
      { id: 'appear', duration: APPEAR, ease: 'smooth', caption: key('caption.hold') },
      { id: 'hold', duration: HOLD, caption: key('caption.hold') },
      { id: 'fall', duration: FALL, caption: key('caption.fall') },
      { id: 'crawl', duration: CRAWL, caption: key('caption.crawl') },
      { id: 'brake', duration: BRAKE, caption: key('caption.brake') },
      { id: 'land', duration: LAND, caption: key('caption.land') },
      { id: 'reset', duration: RESET, ease: 'smooth', caption: key('caption.land') },
    ],
  },

  /**
   * 도착한 순간 이미 진행 중이다 — 두 자석을 막 놓아 플라스틱 쪽이 떨어지는 중인
   * 자리에서 연다.
   */
  startAt: APPEAR + HOLD + 0.3,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 법칙과 식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 640,
    fade: 0.25,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 눈금에 수를 달지 않는다 — 잴 것은 몇 m/s 인가가
   * 아니라 **간격이 벌어지는가, 고른가** 다.
   */

  messages: eddyCurrentMessages,
};
