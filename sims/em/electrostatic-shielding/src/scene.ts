// ========================================================================
// electrostatic-shielding — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// 장선(lineSet) · 장선 방향 촉(vector) · 도체 고리 단면(region 열쇠구멍) · 유도 전하 `−` · `+`
// (readout) · 시험 전하(body)와 이름표(readout) · 받는 힘(vector).
//
// 색은 뜻마다 하나다 — 장선은 secondary, 도체는 muted, 전하 부호와 이름표는 먹.
// **강조색은 「시험 전하가 받는 힘」 한 가지 뜻에만** 쓴다. − 와 + 는 색이 아니라 글자로 가른다.
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
  chargeMarkAngles,
  chevronSpots,
  conductorOpacity,
  inducedShare,
  innerLines,
  outerLines,
  probeForce,
  readConstants,
  ringPolygon,
} from './physics';
import { SCENE_BOUNDS, text } from './schema';
import type { ElectrostaticShieldingState } from './state';

/** 장선 굵기(화면 px). 힘 화살표(굵은 강조)보다 가늘어 배경으로 물러난다. */
const FIELD_LINE_WIDTH = 1.5;
/** 장선 방향 촉의 굵기(화면 px) · 머리 크기(월드). */
const CHEVRON_WIDTH = 1.5;
const CHEVRON_HEAD = 0.14;
/** 도체 단면의 채움 불투명도 · 둘레 굵기는 region 기본값을 쓴다. */
const RING_FILL_OPACITY = 0.35;
/** 유도 전하 부호 글자 크기(화면 px). */
const CHARGE_SIGN_PX = 14;
/** 받는 힘 화살표 굵기(화면 px) · 머리 크기(월드). */
const FORCE_WIDTH = 4;
const FORCE_HEAD = 0.13;
/** 이보다 짧은 힘 화살표는 긋지 않는다(월드) — 길이 0 인 화살표의 머리만 남지 않게. */
const FORCE_MIN_LENGTH = 0.01;
/** 시험 전하 이름표 글자 크기 · 전하 위로 띄우는 거리(화면 px). */
const PROBE_LABEL_PX = 12;
const PROBE_LABEL_GAP = -15;

export function scene(params: {
  state: ElectrostaticShieldingState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const tl = params.timeline;
  if (!tl) return [];
  const c = readConstants(params.stage);
  const out: Primitive[] = [];

  const s = inducedShare(tl);
  const shown = conductorOpacity(tl);
  const ink = { colorRole: 'ink', emphasis: 'strong' } as const;

  // 1. 장선 — 바깥 선은 휘어 겉면에서 끝나고, 안의 선은 벌어져 겉면 밖으로 밀려난다.
  out.push({
    type: 'lineSet',
    id: 'field-lines',
    lines: [...outerLines(s, c), ...innerLines(s, c)],
    width: FIELD_LINE_WIDTH,
    style: { colorRole: 'secondary', emphasis: 'medium' },
  });
  // 장선 방향 촉 — 양 끝 가까이, 선마다 하나씩.
  chevronSpots(s, c).forEach((spot, i) => {
    out.push({
      type: 'vector',
      id: `chevron-${i}`,
      from: spot,
      delta: [c.chevronLength, 0],
      headSize: CHEVRON_HEAD,
      width: CHEVRON_WIDTH,
      style: { colorRole: 'secondary', emphasis: 'medium' },
    });
  });

  // 2. 속 빈 도체 — 단면은 두꺼운 고리. 놓이며 나타나고 치우며 사라진다.
  if (shown > 0) {
    const ring = ringPolygon(c);
    out.push({
      type: 'region',
      id: 'conductor',
      points: ring.points,
      fillOpacity: RING_FILL_OPACITY,
      outline: [...ring.outerEdges, ...ring.innerEdges],
      opacity: shown,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  }

  // 3. 유도 전하 — 벽 두께 가운데에 놓는다(선 끝이 닿는 겉면 바로 안). 모인 몫만큼 짙어진다.
  if (s > 0) {
    const rm = (c.outerRadius + c.innerRadius) / 2;
    chargeMarkAngles(c).forEach((th, k) => {
      const marks: [string, number, 'mark.plus' | 'mark.minus'][] = [
        [`plus-${k}`, th, 'mark.plus'],
        [`minus-${k}`, Math.PI - th, 'mark.minus'],
      ];
      for (const [id, a, sign] of marks) {
        out.push({
          type: 'readout',
          id,
          anchor: { world: [rm * Math.cos(a), rm * Math.sin(a)] },
          text: text(sign),
          chip: false,
          font: 'text',
          weight: 'bold',
          fontSize: CHARGE_SIGN_PX,
          align: 'center',
          opacity: s,
          style: ink,
        });
      }
    });
  }

  // 4. 시험 전하와 받는 힘 — 늘 한가운데. 안의 장이 줄어드는 만큼 화살표가 줄어 사라진다.
  const pos: Vec2 = [0, 0];
  out.push({
    type: 'body',
    id: 'probe',
    pos,
    shape: 'circle',
    size: c.probeRadius,
    glow: false,
    outline: 'line',
    style: { colorRole: 'muted', emphasis: 'subtle' },
  });
  const force = probeForce(s, c);
  if (Math.hypot(force[0], force[1]) > FORCE_MIN_LENGTH) {
    out.push({
      type: 'vector',
      id: 'probe-force',
      from: pos,
      delta: force,
      headSize: FORCE_HEAD,
      width: FORCE_WIDTH,
      outline: 'background',
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }
  out.push({
    type: 'readout',
    id: 'probe-label',
    anchor: { world: pos, offset: [0, PROBE_LABEL_GAP] },
    text: text('mark.q'),
    chip: false,
    font: 'text',
    italic: true,
    fontSize: PROBE_LABEL_PX,
    align: 'center',
    style: ink,
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
