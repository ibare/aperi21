// ========================================================================
// color-addition — 선언
// ========================================================================
// 빛은 겹치는 자리에서 더해진다 — 빨강과 초록이 겹치면 노랑, 세 빛이 모두
// 겹치면 흰색이 된다.
//
// 원본: tasks/piece-lab/color-addition. 치수·시간 상수는 원본 index.html 에서
// 그대로 가져왔다. 월드 좌표는 원본 캔버스의 논리 픽셀이고 y 만 위로 뒤집었다.
// ========================================================================

import type { BundleSchema, LocalizedText, TimelinePhase, Vec2 } from '@aperi21/schema';

/** 등록 키 `aperi21:color-addition` 와 문자 그대로 일치한다 (C4). */
export const COLOR_ADDITION_ID = 'color-addition';

// ------------------------------------------------------------------------
// 치수 (원본 논리 픽셀)
// ------------------------------------------------------------------------

/** 그림 전체 폭 · 높이. */
export const W = 880;
export const H = 310;
/** 검은 막(빛이 비치는 곳) 폭. */
export const STAGE_W = 590;
/** 고리의 기본 자리 — 막 가운데. 월드(y 위). */
export const CENTER: Vec2 = [STAGE_W / 2, H / 2];
/** 빛 원판 반지름. */
export const R = 64;
/** 자리에 들어와 있을 때 원판 중심까지 거리. */
export const IN_D = 28;
/** 자리에서 비켜 있을 때 원판 중심까지 거리. */
export const OUT_D = 88;
/** 고리 반지름. */
export const PROBE_R = 9;

/**
 * 세 빛. 원본은 화면 y 아래 기준 각이다 — 월드(y 위)로 옮기며 부호를 뒤집는다.
 *
 * `rgb` 는 빛의 색(선형광 세 성분)이다 — 원본의 순수한 빨강 · 초록 · 파랑 `[1,0,0]` 등을 그대로 옮겼다.
 * 원색이 1 끼리라 더한 값이 노랑 · 청록 · 자홍 · 흰색으로 정확히 나온다.
 */
export const LIGHTS: readonly { key: 'r' | 'g' | 'b'; ang: number; rgb: readonly [number, number, number] }[] = [
  { key: 'r', ang: Math.PI / 2, rgb: [1, 0, 0] },
  { key: 'g', ang: -Math.PI / 6, rgb: [0, 1, 0] },
  { key: 'b', ang: (-Math.PI * 5) / 6, rgb: [0, 0, 1] },
];

/** 오른쪽 몫 네모 치수. */
export const TILE = { s: 44, big: 64, gap: 22, labelGap: 8, labelFont: 13, signFont: 20 } as const;

// ------------------------------------------------------------------------
// 시간 (원본 SEG · MOVE · OFFSET · STATES)
// ------------------------------------------------------------------------

/** 한 구간 길이(초). 구간의 첫 MOVE 초 동안 빛 하나가 움직이고 나머지는 멈춰 있다. */
export const SEG = 2.5;
export const MOVE = 0.9;
/** 원본은 시계를 이만큼 앞당겨 열었다 — 도착한 순간 초록이 들어오는 중이다. */
export const OFFSET = 0.25;

/** 각 구간 끝의 상태 (빨강, 초록, 파랑 이 자리에 들어와 있는지). 한 번에 하나만 바뀐다. */
export const STATES: readonly (readonly [number, number, number])[] = [
  [1, 0, 0],
  [1, 1, 0],
  [1, 1, 1],
  [0, 1, 1],
  [0, 0, 1],
  [0, 0, 0],
  [1, 0, 0],
];

/** 원본의 `smooth` — 엔진 이징 `smooth` 와 같은 곡선이다. */
export function smooth(u: number): number {
  const x = Math.min(1, Math.max(0, u));
  return x * x * (3 - 2 * x);
}

/**
 * 이동 구간 안에서 원판 경계가 고리를 지나는 진행도(0~1).
 *
 * 원판 경계가 날카로워 고리 자리의 색은 이 순간 한 번에 바뀐다. 캡션도 이 순간에
 * 바뀌어야 화면과 어긋나지 않으므로 이동 단계를 여기서 둘로 나눈다. 들어올 때와
 * 나갈 때 값이 다르다(이징이 대칭이라 서로 1 − u).
 */
function crossing(entering: boolean): number {
  // 중심 거리 d = OUT_D + (IN_D − OUT_D)·inside 가 R 이 되는 inside.
  const target = (OUT_D - R) / (OUT_D - IN_D);
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    const v = entering ? smooth(mid) : 1 - smooth(mid);
    if (entering ? v < target : v > target) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/** 조합 문자열 `'110'`. 캡션 키와 조각 계산이 같은 모양을 쓴다. */
export function comboKey(on: readonly number[]): string {
  return on.map((v) => (v ? '1' : '0')).join('');
}

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const colorAdditionMessages = Object.freeze({
  'label.title': { ko: '빛의 합성', en: 'Adding light' },
  'label.operation': { ko: '세 색의 빛이 겹쳐 만드는 색', en: 'The colour three lights make where they overlap' },
  'label.stage': { ko: '스크린', en: 'Screen' },
  'label.view': { ko: '겹친 빛', en: 'Overlapping light' },
  'label.red': { ko: '빨강', en: 'red' },
  'label.green': { ko: '초록', en: 'green' },
  'label.blue': { ko: '파랑', en: 'blue' },
  'label.probe': { ko: '고리 자리', en: 'at the ring' },
  /** 더하기 기호. 수식 기호라 표식이다 (C1 판정 3). */
  'label.plus': { ko: '+', en: '+' },
  'label.equals': { ko: '=', en: '=' },
  'caption.c000': { ko: '고리 자리에는 빛이 하나도 닿지 않아 검다', en: 'No light reaches the ring, so it is black' },
  'caption.c100': { ko: '고리 자리에는 빨간 빛만 닿아 빨갛다', en: 'Only red light reaches the ring, so it is red' },
  'caption.c010': { ko: '고리 자리에는 초록 빛만 닿아 초록이다', en: 'Only green light reaches the ring, so it is green' },
  'caption.c001': { ko: '고리 자리에는 파란 빛만 닿아 파랗다', en: 'Only blue light reaches the ring, so it is blue' },
  'caption.c110': { ko: '빨강과 초록이 고리 자리에서 더해져 노랑이 된다', en: 'Red and green add up at the ring to make yellow' },
  'caption.c011': { ko: '초록과 파랑이 고리 자리에서 더해져 청록이 된다', en: 'Green and blue add up at the ring to make cyan' },
  'caption.c101': { ko: '빨강과 파랑이 고리 자리에서 더해져 자홍이 된다', en: 'Red and blue add up at the ring to make magenta' },
  'caption.c111': { ko: '세 빛이 고리 자리에서 모두 더해져 흰색이 된다', en: 'All three lights add up at the ring to make white' },
} satisfies Record<string, LocalizedText>);

export type ColorAdditionMessageKey = keyof typeof colorAdditionMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: ColorAdditionMessageKey): LocalizedText => colorAdditionMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function captionKey(combo: readonly number[]): string {
  const k = `caption.c${comboKey(combo)}`;
  if (!(k in colorAdditionMessages)) throw new Error(`color-addition: 없는 캡션 키 ${k}`);
  return k;
}

/** 이동 단계 앞쪽(경계를 지나기 전) · 뒤쪽 · 정지 단계의 id. scene 과 physics 가 부른다. */
export const phaseIds = (k: number) => ({ before: `move-${k}-a`, after: `move-${k}-b`, rest: `rest-${k}` });

/**
 * 한 주기 15 초 = 구간 6개. 구간마다 빛 하나가 MOVE 초 동안 들어오거나 나가고
 * 나머지 시간은 멈춰 있다. 이동은 경계를 지나는 순간에서 둘로 나눠 캡션을 거기서
 * 바꾼다. 위치의 이징은 두 단계를 **걸친** `smooth` 라 scene 이 `span` 으로 읽는다.
 */
function buildPhases(): TimelinePhase[] {
  const phases: TimelinePhase[] = [];
  for (let k = 0; k < STATES.length - 1; k++) {
    const a = STATES[k]!;
    const b = STATES[k + 1]!;
    const entering = b.some((v, i) => v > a[i]!);
    const cross = crossing(entering) * MOVE;
    const ids = phaseIds(k);
    phases.push({ id: ids.before, duration: cross, caption: captionKey(a) });
    phases.push({ id: ids.after, duration: MOVE - cross, caption: captionKey(b) });
    phases.push({ id: ids.rest, duration: SEG - MOVE, caption: captionKey(b) });
  }
  return phases;
}

/** 손으로 옮긴 뒤의 캡션 — 고리 자리의 실제 포함 여부에서 고른다. state 경로는 physics 가 채운다. */
const MANUAL_CASES = ['000', '100', '010', '001', '110', '011', '101', '111'].map((c) => ({
  when: `manualCaption.c${c}`,
  text: captionKey(c.split('').map(Number)),
}));

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const colorAdditionSchema: BundleSchema = {
  id: COLOR_ADDITION_ID,
  label: text('label.title'),
  category: 'optics',
  operation: text('label.operation'),
  timeModel: 'periodic',
  parameters: [],
  stages: [{ id: 'screen', label: text('label.stage'), constants: {} }],
  environments: [],
  views: [{ id: 'overlap', label: text('label.view'), default: true }],

  /** 원본 캔버스 310 + 캡션 한 줄. */
  canvas: { height: 360, minHeight: 320 },

  /** 검은 막을 먼저 깔고 그 위에 빛을 더한다 — 먼저 쓴 것이 아래. */
  drawOrder: 'scene',

  startAt: OFFSET,

  timeline: { phases: buildPhases() },

  caption: {
    anchor: { screen: 'bottom-left', offset: [12, -6] },
    align: 'left',
    fontSize: 16,
    style: { colorRole: 'ink', emphasis: 'strong' },
    cases: MANUAL_CASES,
  },

  messages: colorAdditionMessages,
};
