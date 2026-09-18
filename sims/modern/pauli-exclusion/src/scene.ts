// ========================================================================
// pauli-exclusion — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 에너지 축(vector) · 준위선(lineSet) ·
// 자리 상자(body rect, 속 빈) · 전자(vector — 스핀 방향 화살표) · 이름표(readout) 가 모두 표준 어휘다.
//
// 전자는 화살표 하나다. 위를 가리키면 ↑, 아래를 가리키면 ↓ — 스핀은 모양(방향)으로 가르고 색으로
// 가르지 않는다 (S-piece). ↑ 자리는 왼쪽 줄, ↓ 자리는 오른쪽 줄이라 같은 스핀의 전자는 한 줄에 위아래로
// 쌓인다. 「같은 줄의 같은 층에 둘이 없다」 가 곧 「같은 상태에 둘이 없다」 이다.
//
// 색 — 축 · 준위선 · 상자 · 글자는 무채색 역할(muted), 전자는 먹(ink). 강조색은 쓰지 않는다.
// ========================================================================

import type {
  Body,
  Bounds,
  EnvironmentDef,
  LineSet,
  Primitive,
  Readout,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Vector,
  ViewDef,
} from '@aperi21/schema';
import { levelY, queuePos, readConstants, readElectrons, seatPos, type Spin } from './physics';
import { ENERGY_AXIS, LEVEL_LINE_HALF, SCENE_BOUNDS, SEAT, text, type PauliExclusionMessageKey } from './schema';
import type { PauliExclusionState } from './state';

/** 전자 화살표의 길이 · 머리 크기(월드) · 굵기(화면 px). 상자 세로보다 짧게 — 상자 안에 들어앉는다. */
const ARROW_LENGTH = 1.05;
const ARROW_HEAD = 0.36;
const ARROW_WIDTH = 2.6;
/** 준위선 굵기(화면 px). */
const LEVEL_WIDTH = 1.6;
/** 자리 상자 테 짙기. 빈자리가 읽히되 전자보다 물러나게. */
const SEAT_OPACITY = 0.8;
/** 에너지 축 굵기(화면 px) · 머리 크기(월드). */
const AXIS_WIDTH = 1.4;
const AXIS_HEAD = 0.4;
/** 글자 크기(화면 px). */
const LABEL_PX = 12;
/** 이름표를 앵커 위로 띄우는 거리(화면 px). */
const LABEL_GAP = 12;
/** 대기열 이름표를 대기열 위로 띄우는 높이(월드) — 화살표 머리 위. */
const QUEUE_LABEL_RISE = 1;

function label(id: string, key: PauliExclusionMessageKey, at: readonly [number, number]): Readout {
  return {
    type: 'readout',
    id,
    anchor: { world: at, offset: [0, -LABEL_GAP] },
    text: text(key),
    chip: false,
    font: 'text',
    fontSize: LABEL_PX,
    align: 'center',
    style: { colorRole: 'muted', emphasis: 'strong' },
  };
}

/** 전자 화살표 — 가운데가 `pos`, 스핀 방향을 가리킨다. */
function electron(id: string, pos: readonly [number, number], spin: Spin, alpha: number): Vector {
  const dir = spin === 'up' ? 1 : -1;
  return {
    type: 'vector',
    id,
    from: [pos[0], pos[1] - (dir * ARROW_LENGTH) / 2],
    delta: [0, dir * ARROW_LENGTH],
    headSize: ARROW_HEAD,
    width: ARROW_WIDTH,
    ...(alpha < 1 ? { opacity: alpha } : {}),
    style: { colorRole: 'ink', emphasis: 'strong' },
  };
}

export function scene(params: {
  state: PauliExclusionState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('pauli-exclusion: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const out: Primitive[] = [];

  // ── 에너지 축 — 위로 갈수록 높다 ─────────────────────
  out.push({
    type: 'vector',
    id: 'energy-axis',
    from: [ENERGY_AXIS.x, ENERGY_AXIS.y0],
    delta: [0, ENERGY_AXIS.length],
    headSize: AXIS_HEAD,
    width: AXIS_WIDTH,
    style: { colorRole: 'muted', emphasis: 'strong' },
  } satisfies Vector);
  out.push(label('energy-label', 'label.energy', [ENERGY_AXIS.x, ENERGY_AXIS.y0 + ENERGY_AXIS.length]));

  // ── 준위선 — 두 자리 상자 바깥으로 뻗는다 ──────────────
  const inner = SEAT.x + SEAT.w / 2;
  const lines: [number, number][][] = [];
  for (let n = 1; n <= c.levelCount; n++) {
    const y = levelY(n, c);
    lines.push([[-LEVEL_LINE_HALF, y], [-inner, y]]);
    lines.push([[inner, y], [LEVEL_LINE_HALF, y]]);
  }
  out.push({
    type: 'lineSet',
    id: 'levels',
    lines,
    width: LEVEL_WIDTH,
    style: { colorRole: 'muted', emphasis: 'strong' },
  } satisfies LineSet);

  // ── 자리 상자 — 준위마다 ↑ · ↓ 둘. 빈자리는 속 빈 상자로 남는다 ──
  for (let n = 1; n <= c.levelCount; n++) {
    for (const spin of ['up', 'down'] as const) {
      out.push({
        type: 'body',
        id: `seat-${n}-${spin}`,
        pos: seatPos({ n, spin }, c),
        shape: 'rect',
        size: [SEAT.w, SEAT.h],
        fill: 'none',
        outline: 'role',
        glow: false,
        opacity: SEAT_OPACITY,
        style: { colorRole: 'muted', emphasis: 'strong' },
      } satisfies Body);
    }
  }

  // ── 넣을 전자 대기열 이름 — 대기열에 전자가 남아 있는 만큼 짙다 ──────
  const views = readElectrons(tl, c);
  const queueAlpha = views.reduce((m, e) => (e.where === 'queue' ? Math.max(m, e.alpha) : m), 0);
  if (queueAlpha > 0) {
    const first = queuePos(0, c);
    const last = queuePos(c.electronCount - 1, c);
    out.push({
      ...label('queue-label', 'label.queue', [(first[0] + last[0]) / 2, first[1] + QUEUE_LABEL_RISE]),
      ...(queueAlpha < 1 ? { opacity: queueAlpha } : {}),
    });
  }

  // ── 전자 — 제자리 · 옮겨 가는 중 · 대기열 ────────────────
  // 옮겨 가는 전자는 맨 위에 둔다 — 상자와 다른 전자 위를 지나간다.
  for (const e of views) {
    if (e.where === 'moving' || e.alpha <= 0) continue;
    out.push(electron(`e-${e.i}-${e.where}`, e.pos, e.spin, e.alpha));
  }
  for (const e of views) {
    if (e.where === 'moving') out.push(electron(`e-${e.i}-moving`, e.pos, e.spin, e.alpha));
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
