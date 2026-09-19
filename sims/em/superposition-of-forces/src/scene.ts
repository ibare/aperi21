// ========================================================================
// superposition-of-forces — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더를 쓰지 않는다 — 전하(`body` + 부호 `readout`) ·
// 힘 화살표(`vector`) · 원천과 시험 전하를 잇는 작용선(`trajectory` 점선) · 이름표
// (`readout`)가 모두 표준 어휘로 있다.
//
// 색은 뜻마다 하나다. 전하 넷은 모두 같은 색(부호는 표식 `+` · `−`), 원천 하나하나의
// 힘 F₁ · F₂ · F₃ 은 모두 먹색 — 셋은 같은 종류이고 가르는 것은 표식이다.
// **강조색은 「합력」 한 가지 뜻에만** 쓴다 — 지금 합력과 옮기기 전 합력(점선).
// ========================================================================

import type {
  Bounds,
  EnvironmentDef,
  Primitive,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import { MOVING_INDEX, readConstants, readScene, sceneOpacity } from './physics';
import { CHARGE_RADIUS, SCENE_BOUNDS, text, type SuperpositionOfForcesMessageKey } from './schema';
import type { SuperpositionOfForcesState } from './state';

/** 부호 표식 글자 크기(화면 px). 공 안에 들어가는 크기다. */
const SIGN_PX = 14;
/** 원천 · 힘 표식 글자 크기(화면 px). */
const LABEL_PX = 13;
/** 원천 이름표를 공 가운데에서 바깥쪽으로 띄우는 거리(화면 px). 공 반지름을 넘는다. */
const SOURCE_LABEL_GAP_PX = 24;
/** 힘 이름표를 화살표 가운데에서 옆으로 띄우는 거리(화면 px). */
const FORCE_LABEL_GAP_PX = 13;
/** 원천 하나하나의 힘 화살표 굵기(화면 px). 합력보다 한 단 가늘다. */
const FORCE_WIDTH_PX = 2.5;
/** 합력 화살표 굵기(화면 px). */
const NET_WIDTH_PX = 3.5;
/** 옮기기 전 합력(점선 잔상)의 굵기(화면 px)와 짙기. */
const BEFORE_WIDTH_PX = 2;
const BEFORE_OPACITY = 0.7;
/** 작용선(원천 → 시험 전하 점선)의 굵기(화면 px)와 짙기. 배경 정보라 가늘고 옅다. */
const LINE_WIDTH_PX = 1;
const LINE_OPACITY = 0.7;
/** q₂ 가 떠난 자리 표시(빈 원)의 짙기. */
const LEFT_BEHIND_OPACITY = 0.6;

/** 원천 · 힘 표식 키 — 원천 번호 순. */
const SOURCE_MARKS: readonly SuperpositionOfForcesMessageKey[] = ['mark.q1', 'mark.q2', 'mark.q3'];
const FORCE_MARKS: readonly SuperpositionOfForcesMessageKey[] = ['mark.f1', 'mark.f2', 'mark.f3'];

/** 월드 방향 벡터를 화면 픽셀 띄움으로. 화면은 y 가 아래로 자란다. */
function screenOffset(dir: Vec2, gap: number): Vec2 {
  const d = Math.hypot(dir[0], dir[1]);
  if (d === 0) return [0, -gap];
  return [(dir[0] / d) * gap, (-dir[1] / d) * gap];
}

/**
 * 화살표 가운데에서 옆으로 띄우는 방향 — 두 법선 중 기준점 `away` 에서 먼 쪽.
 * 기준점은 지금 그려진 화살표들의 가운데들의 무게중심이라, 이름표가 화살표 묶음의
 * 바깥으로 나간다.
 */
function sideAway(from: Vec2, delta: Vec2, away: Vec2): Vec2 {
  const mid: Vec2 = [from[0] + delta[0] / 2, from[1] + delta[1] / 2];
  const n: Vec2 = [-delta[1], delta[0]];
  const toAway = (mid[0] - away[0]) * n[0] + (mid[1] - away[1]) * n[1];
  return toAway >= 0 ? n : [-n[0], -n[1]];
}

export function scene(params: {
  state: SuperpositionOfForcesState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('superposition-of-forces: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const r = readScene(timeline, c);
  const op = sceneOpacity(timeline);
  const sumAt = timeline.at('sum');
  const moveAt = timeline.at('move');

  const ink = { colorRole: 'ink', emphasis: 'strong' } as const;
  const muted = { colorRole: 'muted', emphasis: 'strong' } as const;
  const ball = { colorRole: 'muted', emphasis: 'subtle' } as const;
  const accent = { colorRole: 'accent', emphasis: 'strong' } as const;
  const out: Primitive[] = [];
  const origin: Vec2 = [0, 0];

  // ---- 작용선 ----
  // 원천에서 시험 전하까지의 점선. 화살표가 옮겨 간 뒤에도 「F₂ 는 q₂ 쪽 선을 따른다」 가
  // 읽히게 남긴다. q₂ 를 옮기면 선도 따라 돈다.
  r.sources.forEach((pos, i) => {
    out.push({
      type: 'trajectory',
      id: `line-${i}`,
      points: [pos, origin],
      width: LINE_WIDTH_PX,
      opacity: op * LINE_OPACITY,
      style: { ...muted, lineStyle: 'dotted' },
    });
  });

  // ---- q₂ 가 떠난 자리 ----
  const q2Start = c.sources[MOVING_INDEX]?.pos;
  if (q2Start && moveAt > 0) {
    out.push({
      type: 'body',
      id: 'left-behind',
      pos: q2Start,
      shape: 'circle',
      size: CHARGE_RADIUS,
      fill: 'none',
      outline: 'role',
      glow: false,
      opacity: op * LEFT_BEHIND_OPACITY,
      style: muted,
    });
  }

  // ---- 전하 ----
  const charge = (id: string, pos: Vec2, q: number): void => {
    out.push({
      type: 'body',
      id: `charge-${id}`,
      pos,
      shape: 'circle',
      size: CHARGE_RADIUS,
      glow: false,
      outline: 'line',
      opacity: op,
      style: ball,
    });
    out.push({
      type: 'readout',
      id: `sign-${id}`,
      anchor: { world: pos },
      text: text(q < 0 ? 'mark.minus' : 'mark.plus'),
      chip: false,
      font: 'text',
      weight: 'bold',
      fontSize: SIGN_PX,
      align: 'center',
      opacity: op,
      style: ink,
    });
  };
  r.sources.forEach((pos, i) => {
    const q = c.sources[i]?.q ?? 0;
    charge(`q${i + 1}`, pos, q);
    // 원천 이름표 — 시험 전하 반대쪽(바깥)으로 띄운다.
    out.push({
      type: 'readout',
      id: `source-label-${i}`,
      anchor: { world: pos, offset: screenOffset(pos, SOURCE_LABEL_GAP_PX) },
      text: text(SOURCE_MARKS[i] ?? 'mark.q1'),
      chip: false,
      font: 'mono',
      italic: true,
      weight: 'bold',
      fontSize: LABEL_PX,
      align: 'center',
      opacity: op,
      style: muted,
    });
  });
  charge('test', origin, c.qTestMicroC);

  // ---- 이름표 기준점 ----
  // 지금 그려진 화살표 가운데들의 무게중심. 이름표는 이 점에서 먼 쪽 옆에 붙는다.
  const drawn = [...r.arrows, ...(sumAt > 0 ? [{ from: origin, delta: r.net }] : [])];
  const away: Vec2 = drawn.reduce<Vec2>(
    (acc, a) => [acc[0] + (a.from[0] + a.delta[0] / 2) / drawn.length, acc[1] + (a.from[1] + a.delta[1] / 2) / drawn.length],
    [0, 0],
  );

  // ---- 옮기기 전 합력(점선 잔상) ----
  if (moveAt > 0) {
    out.push({
      type: 'vector',
      id: 'net-before',
      from: origin,
      delta: r.netBefore,
      width: BEFORE_WIDTH_PX,
      opacity: op * BEFORE_OPACITY,
      style: { ...accent, lineStyle: 'dashed' },
    });
  }

  // ---- 원천 하나하나의 힘 ----
  // 꼬리가 원점에서 앞 화살표의 머리로 미끄러진다(평행 이동). 이름표가 함께 간다.
  r.arrows.forEach((a, i) => {
    out.push({
      type: 'vector',
      id: `force-${i}`,
      from: a.from,
      delta: a.delta,
      width: FORCE_WIDTH_PX,
      opacity: op,
      style: ink,
    });
    const mid: Vec2 = [a.from[0] + a.delta[0] / 2, a.from[1] + a.delta[1] / 2];
    out.push({
      type: 'readout',
      id: `force-label-${i}`,
      anchor: { world: mid, offset: screenOffset(sideAway(a.from, a.delta, away), FORCE_LABEL_GAP_PX) },
      text: text(FORCE_MARKS[i] ?? 'mark.f1'),
      chip: false,
      font: 'mono',
      italic: true,
      weight: 'bold',
      fontSize: LABEL_PX,
      align: 'center',
      opacity: op,
      style: ink,
    });
  });

  // ---- 합력 ----
  // 처음 꼬리(원점)에서 마지막 머리까지 자란다. 이름표는 다 자란 뒤에만 — 자라는
  // 도중에 `F` 가 붙어 있으면 아직 합이 아닌 것에 이름이 붙는다.
  if (sumAt > 0) {
    out.push({
      type: 'vector',
      id: 'net',
      from: origin,
      delta: r.net,
      width: NET_WIDTH_PX,
      opacity: op,
      style: accent,
    });
    if (sumAt >= 1) {
      out.push({
        type: 'readout',
        id: 'net-label',
        anchor: {
          world: [r.net[0] / 2, r.net[1] / 2],
          offset: screenOffset(sideAway(origin, r.net, away), FORCE_LABEL_GAP_PX),
        },
        text: text('mark.net'),
        chip: false,
        font: 'mono',
        italic: true,
        weight: 'bold',
        fontSize: LABEL_PX,
        align: 'center',
        opacity: op,
        style: accent,
      });
    }
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
