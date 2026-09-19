// ========================================================================
// electric-field — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 원천 · 시험 전하(body +
// 부호 readout) · 장 화살표 · 받는 힘(vector) · 지나온 길(trajectory)이 모두 표준 어휘다.
//
// 색은 뜻마다 하나다 — 전하는 옅은 원 + 먹색 부호(원천 · 시험 전하가 같은 대상 종류라
// 같은 모양이고 크기로 갈린다), 적힌 장 화살표는 secondary, **강조색은 「시험 전하가
// 지금 받는 힘」 한 가지 뜻에만** 쓴다. 장 화살표와 받는 힘은 같은 배율을 쓴다
// (`fieldArrow` · `forceArrow`).
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
import {
  fieldArrow,
  forceArrow,
  gridSpots,
  isGrown,
  probeCharge,
  probeOpacity,
  pushElapsed,
  pushedAt,
  readConstants,
  GROWING_PROBE,
} from './physics';
import { SCENE_BOUNDS, text } from './schema';
import type { ElectricFieldState } from './state';

/** 적힌 장 화살표의 굵기(화면 px). 받는 힘(테마의 굵은 선)보다 가늘어 위계가 갈린다. */
const FIELD_ARROW_WIDTH = 1.5;
/**
 * 받는 힘 화살표의 굵기(화면 px). 그 위에 얹는 가는 자리 화살표 양옆으로 강조색이 드러나야
 * 「꼭 겹친다」 가 두 색의 한 줄로 읽힌다.
 */
const FORCE_WIDTH = 5;
/**
 * 받는 힘 화살표의 머리 크기(월드). 그 위에 얹는 자리 화살표(기본 머리 8 px)보다 커야
 * 길이가 같을 때 강조색 머리가 가려지지 않는다.
 */
const FORCE_HEAD = 0.17;
/** 지나온 길 점선의 굵기(화면 px). 안내선이라 가늘다. */
const TRAIL_WIDTH = 1;
/** 전하 부호 글자 크기(화면 px) — 원천 · 시험 전하 이름표. */
const SOURCE_SIGN_PX = 18;
const PROBE_LABEL_PX = 13;
/** 시험 전하 이름표를 전하 아래로 띄우는 거리(화면 px). */
const PROBE_LABEL_GAP = 16;

export function scene(params: {
  state: ElectricFieldState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const tl = params.timeline;
  if (!tl) return [];
  const c = readConstants(params.stage);
  const { state } = params;
  const out: Primitive[] = [];

  const ink = { colorRole: 'ink', emphasis: 'strong' } as const;
  const shown = probeOpacity(tl);
  const s = pushElapsed(tl);
  const held = s <= 0;
  const probes = c.probes.map((start, i) => {
    const q = probeCharge(i, tl, c);
    return { start, q, pos: held ? start : pushedAt(start, q, s, c) };
  });

  // 1. 지나온 길 — 놓인 자리에서 지금 자리까지. 적힌 화살표 아래에 깔린다.
  if (!held && shown > 0) {
    probes.forEach((p, i) => {
      out.push({
        type: 'trajectory',
        id: `trail-${i}`,
        points: [p.start, p.pos],
        width: TRAIL_WIDTH,
        opacity: shown,
        style: { colorRole: 'muted', emphasis: 'medium', lineStyle: 'dotted' },
      });
    });
  }

  // 2. 적힌 장 — 모든 자리의 화살표. 전하가 오든 떠나든, 커지든 그대로다.
  gridSpots(c).forEach((spot, i) => {
    out.push({
      type: 'vector',
      id: `field-${i}`,
      from: spot,
      delta: fieldArrow(spot, c),
      width: FIELD_ARROW_WIDTH,
      style: { colorRole: 'secondary', emphasis: 'medium' },
    });
  });

  // 3. 원천 전하 — 옅은 원에 먹색 +.
  out.push({
    type: 'body',
    id: 'source',
    pos: [0, 0],
    shape: 'circle',
    size: c.sourceRadius,
    glow: false,
    outline: 'line',
    style: { colorRole: 'muted', emphasis: 'subtle' },
  });
  out.push({
    type: 'readout',
    id: 'source-sign',
    anchor: { world: [0, 0] },
    text: text('mark.plus'),
    chip: false,
    font: 'text',
    weight: 'bold',
    fontSize: SOURCE_SIGN_PX,
    align: 'center',
    style: ink,
  });

  if (shown <= 0) return out;

  probes.forEach((p, i) => {
    // 4. 시험 전하 — 작은 옅은 원. 화살표가 그 위에서 나가도록 먼저 깐다(작은 원에
    //    화살표가 가려지면 먼 자리의 짧은 힘이 보이지 않는다).
    out.push({
      type: 'body',
      id: `probe-${i}`,
      pos: p.pos,
      shape: 'circle',
      size: c.probeRadius,
      glow: false,
      outline: 'line',
      opacity: shown,
      style: { colorRole: 'muted', emphasis: 'subtle' },
    });

    // 5. 받는 힘 — 지금 자리의 장 × 전하량. 단위 전하면 그 자리 화살표와 꼭 겹친다.
    out.push({
      type: 'vector',
      id: `force-${i}`,
      from: p.pos,
      delta: forceArrow(p.pos, p.q, c),
      headSize: FORCE_HEAD,
      width: FORCE_WIDTH,
      outline: 'background',
      opacity: shown,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });

    // 6. 붙잡혀 있는 동안 그 자리 장 화살표를 받는 힘 **위에** 한 번 더 얹는다 — 힘이
    //    k 배로 자라도 이 가는 화살표는 제 길이에 머문다. 놓아준 뒤에는 전하가 자리를
    //    떠나므로 얹지 않는다.
    if (held) {
      out.push({
        type: 'vector',
        id: `spot-${i}`,
        from: p.start,
        delta: fieldArrow(p.start, c),
        width: FIELD_ARROW_WIDTH,
        opacity: shown,
        style: { colorRole: 'secondary', emphasis: 'strong' },
      });
    }

    // 7. 이름표 — `+q`, 커진 전하는 `+{k}q`(배수는 스테이지 상수의 글자).
    const grown = i === GROWING_PROBE && isGrown(tl);
    const anchor: { world: Vec2; offset: Vec2 } = { world: p.pos, offset: [0, PROBE_LABEL_GAP] };
    out.push({
      type: 'readout',
      id: `probe-label-${i}`,
      anchor,
      text: grown ? text('mark.kq') : text('mark.q'),
      vars: grown ? { k: state.factor } : undefined,
      chip: false,
      font: 'text',
      italic: true,
      fontSize: PROBE_LABEL_PX,
      align: 'center',
      opacity: shown,
      style: ink,
    });
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
