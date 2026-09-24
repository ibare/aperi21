// ========================================================================
// orbital-velocity — 선언
// ========================================================================
// 질문: 원 궤도는 아무 속도로나 나오는가.
//
// 뉴턴의 대포. 산꼭대기에서 같은 높이 · 같은 방향(옆, 수평)으로 쏘되 속도만 바꾼다.
// 원 궤도 속도보다 모자라면 휘어 내려가 땅에 떨어지고, 딱 그 속도면 원을 그리며 제자리로
// 돌아온다. 조금 넘치면 쏜 자리가 가장 가까운 점인 타원으로 부풀고, √2 배를 넘으면 궤도가
// 닫히지 않아 벗어난다 — 원은 한 속도에서만 나온다.
//
// 「왜 떨어지지 않는가」(유령 직선)는 `circular-orbit`, 곧장 위로 쏘는 문턱은 `escape-velocity`
// 의 몫이다. 이 조각은 옆으로 쏘는 속도만 바꾸는 비교에 머문다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:orbital-velocity` 와 문자 그대로 일치한다 (C4). */
export const ORBITAL_VELOCITY_ID = 'orbital-velocity';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 길이는 월드 단위, 속도는 「쏘는 높이의 원 궤도 속도」 의 배수다.
// ------------------------------------------------------------------------

/** 쏘는 자리(산꼭대기)의 행성 중심으로부터 거리(월드). */
export const LAUNCH_RADIUS = 1;
/** 행성 반지름(월드). 산의 높이는 `LAUNCH_RADIUS − PLANET_RADIUS` 다 — 뉴턴의 그림처럼 크게 과장한다. */
export const PLANET_RADIUS = 0.8;
/**
 * 다섯 번 쏘는 속도(원 궤도 속도의 배수). 앞의 둘은 모자라 떨어지고, 셋째가 원, 넷째는 조금 넘쳐
 * 타원, 다섯째는 √2 배를 넘어 벗어난다. 화면의 배수 글자는 이 값을 그대로 쓴다 (S-piece 유효숫자).
 * 목록을 선언할 자리가 없어 이름 다섯으로 흩는다 (장부 G105).
 */
export const SPEED_1 = 0.7;
export const SPEED_2 = 0.9;
export const SPEED_3 = 1;
export const SPEED_4 = 1.1;
export const SPEED_5 = 1.5;

// ------------------------------------------------------------------------
// 표현 — 스테이지 상수의 기본값이다.
// ------------------------------------------------------------------------

/**
 * 원 궤도 한 바퀴의 화면 시간(초). 다섯 샷 모두 **같은 배율**로 흐른다 — 빨리 쏜 포탄이 화면에서도
 * 빨리 떠난다. 샷 단계 길이는 이 배율로 잰 비행(한 바퀴 · 떨어질 때까지)보다 길게 잡는다.
 */
export const CIRCLE_LAP_SECONDS = 4.2;
/** 쏜 속도 화살표 길이(월드 per 원 궤도 속도). 1.5 배가 약 0.8 월드. */
export const ARROW_PER_SPEED = 0.55;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 행성 중심이 원점, 산꼭대기가 (0, LAUNCH_RADIUS) 다.
// ------------------------------------------------------------------------

/** 캡션이 서는 자리(월드). 궤도들 왼쪽 빈자리다. */
export const CAPTION_AT: readonly [number, number] = [-3.55, 0.55];

/**
 * 프레이밍은 주장의 일부다. 세로는 산꼭대기 위 배수 글자부터 1.1 배 타원의 가장 먼 점 아래 글자까지,
 * 가로는 왼쪽 캡션부터 행성 오른쪽까지. 매 프레임 같은 값이다 — 1.5 배 포탄은 오른쪽 끝을 벗어난다.
 */
export const SCENE_BOUNDS = { minX: -3.7, maxX: 2.55, minY: -1.78, maxY: 1.3 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const orbitalVelocityMessages = Object.freeze({
  'label.title': { ko: '궤도 속도', en: 'Orbital velocity' },
  'label.stage': { ko: '뉴턴의 대포', en: "Newton's cannon" },
  'label.view': { ko: '옆으로 쏘기', en: 'Fired sideways' },
  /** 쏜 속도 — 원 궤도 속도의 몇 배. 값은 스테이지 상수 그대로 끼운다. */
  'label.speed': { ko: '{k}배', en: '{k}×' },
  'caption.first': {
    ko: '산꼭대기에서 옆으로 쏜 포탄은 휘어 내려가 땅에 떨어진다',
    en: 'Fired sideways from the mountaintop, the ball curves down and hits the ground',
  },
  'caption.farther': {
    ko: '더 빠르게 쏘면 더 멀리 가서 떨어진다',
    en: 'Fire it faster and it lands farther around',
  },
  'caption.circle': {
    ko: '이 속도에서는 떨어지는 만큼 땅이 휘어 나간다 — 원을 그리며 제자리로 돌아온다',
    en: 'At this speed the ground curves away as fast as the ball falls — it traces a circle back to where it started',
  },
  'caption.ellipse': {
    ko: '조금만 넘쳐도 원이 아니다 — 쏜 자리가 가장 가까운 점인 타원으로 부풀어 돌아온다',
    en: 'A little faster and it is no longer a circle — it swells into an ellipse whose nearest point is the launch spot',
  },
  'caption.escape': {
    ko: '√2 배를 넘으면 궤도가 닫히지 않는다 — 다시 돌아오지 않는다',
    en: 'Beyond √2 times, the path never closes — it does not come back',
  },
  'caption.only': {
    ko: '모자라면 떨어지고, 넘치면 부풀거나 벗어난다 — 원은 딱 한 속도에서만 나온다',
    en: 'Too slow and it falls, too fast and it swells or escapes — a circle comes from just one speed',
  },
} satisfies Record<string, LocalizedText>);

export type OrbitalVelocityMessageKey = keyof typeof orbitalVelocityMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: OrbitalVelocityMessageKey): LocalizedText => orbitalVelocityMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: OrbitalVelocityMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const orbitalVelocitySchema: BundleSchema = {
  id: ORBITAL_VELOCITY_ID,
  title: text('label.title'),
  category: 'astro',
  timeModel: 'periodic',

  // 조작기가 없다. 속도를 바꿔 보는 일은 다섯 샷의 자동 진행이 한다 — 슬라이더를 두면 독자가
  // 정확히 1 배를 짚기 어렵고, 「딱 한 속도」 가 손끝의 우연처럼 보인다.
  parameters: [],

  stages: [
    {
      id: 'cannon',
      label: text('label.stage'),
      constants: {
        launchRadius: LAUNCH_RADIUS,
        planetRadius: PLANET_RADIUS,
        speed1: SPEED_1,
        speed2: SPEED_2,
        speed3: SPEED_3,
        speed4: SPEED_4,
        speed5: SPEED_5,
        circleLapSeconds: CIRCLE_LAP_SECONDS,
        arrowPerSpeed: ARROW_PER_SPEED,
      },
    },
  ],

  environments: [],

  views: [{ id: 'sideways', label: text('label.view'), default: true }],

  /** 궤도는 가운데, 캡션은 왼쪽 빈자리 — 세로가 비싸다 (S-piece). */
  canvas: { height: 380, minHeight: 340 },

  /** 행성 · 자취 · 포탄 · 화살표의 겹침 순서가 뜻을 갖는다 — 자취는 포탄 아래, 화살표는 맨 위. */
  drawOrder: 'scene',

  /**
   * 샷 다섯. 샷 i 는 스테이지 상수 `speed{i}` 로 쏜다. 모든 샷이 같은 화면 시간 배율
   * (`circleLapSeconds`)로 흐르고, 단계 길이는 그 배율로 잰 비행보다 조금 길다 —
   * 떨어진 포탄은 남은 동안 땅에 앉아 있고, 닫힌 궤도의 포탄은 계속 돈다.
   *
   * - `shot1` · `shot2` — 모자라 떨어진다(비행 약 0.6 · 1.0 초).
   * - `shot3` — 원 한 바퀴(4.2 초).
   * - `shot4` — 타원 한 바퀴(약 6.0 초).
   * - `shot5` — 열린 궤도. 약 1.9 초 만에 화면 오른쪽을 벗어난다.
   * - `hold` — 다섯 자취가 한 그림에 남는다. `fade` — 자취가 흐려지고 다음 주기로.
   *
   * 단계 길이를 비행보다 짧게 줄이면 그 샷의 자취는 단계가 끝난 자리에서 멈춘다(장부 G13).
   */
  timeline: {
    phases: [
      { id: 'shot1', duration: 1.8, caption: key('caption.first') },
      { id: 'shot2', duration: 2.2, caption: key('caption.farther') },
      { id: 'shot3', duration: 4.8, caption: key('caption.circle') },
      { id: 'shot4', duration: 6.6, caption: key('caption.ellipse') },
      { id: 'shot5', duration: 3.0, caption: key('caption.escape') },
      { id: 'hold', duration: 4.0, caption: key('caption.only') },
      { id: 'fade', duration: 0.6, caption: key('caption.only') },
    ],
  },

  /** 도착한 순간 첫 포탄이 이미 산을 떠나 있다. */
  startAt: 0.25,

  // 슬롯 하나. 궤도들 왼쪽 빈자리에 세운다 — 그림에 딸린 자리라 월드 앵커다.
  caption: {
    anchor: { world: CAPTION_AT },
    align: 'left',
    fontSize: 15,
    wrapWidth: 250,
    fade: 0.3,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 읽을 것은 거리가 아니라 궤도의 **모양**이다.
   */

  messages: orbitalVelocityMessages,
};
