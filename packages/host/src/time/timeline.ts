/**
 * 시간표 — `BundleSchema.timeline` 을 시각에서 푼다.
 *
 * 조각이 손으로 짜던 연출 계산(주기 안 단계 경계 · 구간 진행도 · 이징 · 단계로 캡션
 * 고르기)을 선언으로 올린 것이다. 선언에는 숫자와 이름만 있고, 곡선과 경계 처리는
 * 여기 한 곳에 있다 — 조각마다 짜면 경계를 다루는 방식이 조각마다 흔들린다.
 *
 * 전부 순수 함수다. 이전 프레임을 기억하지 않는다 — 같은 시각은 언제나 같은 값이고,
 * 모듈 스코프에 인스턴스 상태를 두지 않는다 (C5).
 */

import type {
  BundleSchema,
  BundleState,
  Readout,
  SceneGraph,
  TimelineDef,
  TimelineEase,
  TimelineFrame,
} from '@aperi21/schema';
import { readPath } from '../controller/path';

const EASES: Record<TimelineEase, (x: number) => number> = {
  linear: (x) => x,
  smooth: (x) => x * x * (3 - 2 * x),
  inOutCubic: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
};

function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

/**
 * 선언과 흐른 시간(초)에서 이번 프레임의 시간표 값을 만든다.
 *
 * `elapsed` 는 임베드의 시간 엔진이 준다. 리셋 · 스테이지 전환 · 검사 시각 이동이
 * 모두 시간 엔진을 거치므로 시간표도 따라서 맞는다.
 */
export function evaluateTimeline(def: TimelineDef, elapsed: number): TimelineFrame {
  const phases = def.phases;
  if (phases.length === 0) throw new Error('timeline: 단계가 없다');

  const starts: number[] = [];
  const index = new Map<string, number>();
  let period = 0;
  phases.forEach((p, i) => {
    if (!(p.duration > 0)) throw new Error(`timeline: 단계 '${p.id}' 의 길이가 0 보다 커야 한다`);
    // 0 이면 시계가 영원히 멈추고 화면만 굳는다 — 예외도 없이.
    if (p.timeScale !== undefined && !(p.timeScale > 0)) {
      throw new Error(`timeline: 단계 '${p.id}' 의 재생 속도가 0 보다 커야 한다`);
    }
    if (index.has(p.id)) throw new Error(`timeline: 단계 id '${p.id}' 가 겹친다`);
    index.set(p.id, i);
    starts.push(period);
    period += p.duration;
  });

  // 시계를 앞당기는 것은 `BundleSchema.startAt` 이고 러너가 시간 엔진에 적용한다.
  // 여기 오는 `elapsed` 는 이미 앞당겨진 값이다 — 시간표 없는 조각도 앞당길 수
  // 있어야 해서 선언을 한 층 위로 올렸다.
  const t = elapsed;
  const cycle = Math.floor(t / period);
  const u = t - cycle * period;

  let now = phases.length - 1;
  for (let i = 0; i < phases.length; i++) {
    if (u < starts[i]! + phases[i]!.duration) {
      now = i;
      break;
    }
  }

  const find = (id: string): number => {
    const i = index.get(id);
    if (i === undefined) throw new Error(`timeline: 없는 단계 '${id}'`);
    return i;
  };
  const eased = (i: number): number => {
    const p = phases[i]!;
    return EASES[p.ease ?? 'linear'](clamp01((u - starts[i]!) / p.duration));
  };

  // 같은 문장이 이어지는 이웃 단계는 한 캡션이다 — 그 첫 단계부터 잰다.
  const caption = phases[now]!.caption;
  let from = now;
  while (from > 0 && phases[from - 1]!.caption === caption) from--;

  return {
    t,
    period,
    cycle,
    u,
    phase: phases[now]!.id,
    progress: eased(now),
    timeScale: phases[now]!.timeScale ?? 1,
    caption,
    captionAge: u - starts[from]!,
    at: (id) => eased(find(id)),
    start: (id) => starts[find(id)]!,
    end: (id) => {
      const i = find(id);
      return starts[i]! + phases[i]!.duration;
    },
    duration: (id) => phases[find(id)]!.duration,
    span: (a, b, ease = 'linear') => EASES[ease](clamp01((u - a) / (b - a))),
  };
}

/** 캡션 슬롯이 쓰는 id. scene 이 같은 id 를 쓰면 캡션이 둘이 된다. */
export const CAPTION_ID = 'caption';

/** 선언이 색을 말하지 않을 때의 캡션 — 본문 먹색. */
const CAPTION_STYLE: NonNullable<Readout['style']> = { colorRole: 'ink', emphasis: 'strong' };

/**
 * 캡션 슬롯의 readout 선언. 슬롯이 없거나 말할 문안이 없으면 `null`.
 *
 * 문안은 **LocalizedText 까지만** 싣는다 — 언어를 고르는 것은 렌더러가 러너의
 * 조회기로 한다. 여기서 조회기를 만들면 문안 출처가 둘로 갈린다 (C1).
 */
export function captionPrimitive(
  schema: BundleSchema,
  frame?: TimelineFrame,
  state?: BundleState,
): Readout | null {
  const slot = schema.caption;
  if (!slot) return null;

  // 상태로 고르는 문안이 먼저다. 시간표 단계로 나눌 수 없는 캡션을 위한 것이라
  // (진자가 근사의 경계를 넘었을 때, 세 공이 모두 바닥에 내려섰을 때) 단계보다
  // 지금 상태가 우선한다. 위에서부터 훑어 **참인 첫 항목**을 쓴다.
  //
  // `when` 은 상태 경로 **이름**이다. 선언은 어디를 보라고만 말하고 조건을 세는
  // 것은 조각의 physics 다 (원칙 2 · `visibleWhen` 과 같은 규약).
  let matched: string | undefined;
  if (slot.cases && state) {
    for (const c of slot.cases) {
      if (readPath<boolean>(state, c.when)) {
        matched = c.text;
        break;
      }
    }
  }

  const key = matched ?? frame?.caption ?? slot.text;
  if (!key) return null;
  const text = schema.messages?.[key];
  if (!text) throw new Error(`caption: messages 에 없는 키 '${key}'`);

  // 상태로 고른 문안은 페이드하지 않는다 — 조건이 참이 된 순간이 곧 그 문장의
  // 시작이고, 시간표의 단계 나이로는 그 순간을 알 수 없다.
  const fade = slot.fade ?? 0;
  const opacity =
    !matched && frame?.caption && fade > 0 ? EASES.smooth(clamp01(frame.captionAge / fade)) : 1;

  return {
    type: 'readout',
    id: CAPTION_ID,
    anchor: slot.anchor,
    text,
    chip: false,
    // 캡션은 문장이다 — 월드 앵커에 붙어도 값 칩의 모노 글꼴을 쓰지 않는다.
    font: 'text',
    align: slot.align,
    fontSize: slot.fontSize,
    // 슬롯이 정한 줄바꿈 폭을 그대로 내려보낸다 — 어디서 끊을지는 readout 이 판단한다.
    wrapWidth: slot.wrapWidth,
    style: slot.style ?? CAPTION_STYLE,
    opacity,
  };
}

/**
 * scene 의 결과에 캡션을 덧붙인다. 러너 두 곳(`runBundle` · react `Canvas`)이 이것
 * 하나를 부른다 — z 정렬 **전에** 불러야 readout 층 순서가 지켜진다.
 */
export function withCaption(
  scene: SceneGraph,
  schema: BundleSchema,
  frame?: TimelineFrame,
  state?: BundleState,
): SceneGraph {
  const caption = captionPrimitive(schema, frame, state);
  if (!caption) return scene;
  if (scene.some((p) => p.id === CAPTION_ID)) {
    throw new Error(`caption: 캡션 슬롯을 선언한 조각은 scene 에 id '${CAPTION_ID}' 를 두지 않는다`);
  }
  return [...scene, caption];
}
