// ========================================================================
// inelastic-collision — 장면 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 자유 렌더를 쓰지 않는다. 바닥(`surface`) · 공(`body`) · 지나온 궤적과 앞 꼭짓점 높이의
// 점선(`trajectory`) · 모자란 높이(`dimension`) · 첫 충돌의 v · ev(`vector`) · 착지 파문
// (`trace` 반원 고리) · 기호 이름표(`readout`) 가 모두 표준 어휘로 있다.
//
// 색: 공은 먹색, 궤적 · 점선 · 기호는 무채색, 첫 충돌의 두 화살표는 주 색(속도).
// 강조색은 **사라진 에너지** 한 가지 뜻에만 쓴다 — 모자란 높이의 치수선과 착지 파문.
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
import { derive, readConstants, schedule, type Reading } from './physics';
import { APEX_KEYS, ARROW_SCALE, ARROW_SPREAD, BALL_R, FRAME_PAD, RING_LIFE, text } from './schema';
import type { InelasticCollisionState } from './state';

/**
 * 꼭짓점 이름표를 꼭짓점 **아래**, 그 튐의 아치 안으로 내리는 거리(화면 px). 위에 두면
 * 위에서 내려오는 모자란 높이 치수선과 겹친다(첫 촬영에서 확인). 아치 안은 비어 있다.
 */
const APEX_LABEL_OFFSET: Vec2 = [0, 15];
/** 놓은 높이 `h` 는 공 왼쪽에 둔다 — 위에 두면 점선 머리와 겹친다(화면 px). */
const DROP_LABEL_OFFSET: Vec2 = [-14, 0];
/** 「사라진 에너지」 를 첫 치수선 오른쪽으로 띄우는 거리(화면 px). */
const LOST_LABEL_OFFSET: Vec2 = [9, 0];
/** `e` 표식을 바닥 아래로 내리는 거리(화면 px). */
const E_LABEL_OFFSET: Vec2 = [0, 16];
/** 착지 파문 — 처음 · 끝 반지름(화면 px). */
const RING_FROM = 6;
const RING_TO = 40;

export function scene(params: {
  state: InelasticCollisionState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { timeline } = params;
  if (!timeline) throw new Error('inelastic-collision: schema.timeline 이 선언되어야 한다');
  const c = readConstants(params.stage);
  const r: Reading = derive(timeline, c);
  const op = r.opacity;
  const ink = { colorRole: 'ink', emphasis: 'strong' } as const;
  const muted = { colorRole: 'muted', emphasis: 'strong' } as const;
  const velocity = { colorRole: 'primary', emphasis: 'strong' } as const;
  const accent = { colorRole: 'accent', emphasis: 'strong' } as const;
  const g: Primitive[] = [];

  // ---- 바닥 ----
  // 물러나는 동안에도 남긴다 — 갈아 끼우는 순간 바닥까지 깜빡이면 그것이 충돌만큼 눈에 띈다.
  g.push({ type: 'surface', id: 'floor', geometry: { kind: 'ground', y: 0 }, style: ink });

  // ---- 지나온 궤적 ----
  if (r.trail.length > 1) {
    g.push({ type: 'trajectory', id: 'trail', points: r.trail, width: 1.5, opacity: op, style: muted });
  }

  // ---- 앞 꼭짓점 높이 ----
  // 가는 점선. 다음 꼭짓점이 이 선에 못 미치는 것이 보이도록 공을 따라 오른쪽으로 자란다.
  for (const lv of r.levels) {
    if (lv.toX - lv.from[0] < 1e-3) continue;
    g.push({
      type: 'trajectory',
      id: `level-${lv.k}`,
      points: [lv.from, [lv.toX, lv.from[1]]],
      width: 1,
      opacity: op,
      style: { ...muted, lineStyle: 'dashed' },
    });
  }

  // ---- 모자란 높이 — 이번 충돌에서 사라진 에너지 ----
  for (const sf of r.shortfalls) {
    g.push({
      type: 'dimension',
      id: `lost-${sf.k}`,
      from: [sf.x, sf.fromY],
      to: [sf.x, sf.toY],
      opacity: op,
      style: accent,
    });
    // 이름은 가장 긴 첫 치수선에만. 모든 치수선에 붙이면 뒤쪽 좁은 자리에서 궤적을 덮는다.
    if (sf.k === 1) {
      g.push({
        type: 'readout',
        id: 'lost-name',
        anchor: { world: [sf.x, (sf.fromY + sf.toY) / 2], offset: LOST_LABEL_OFFSET },
        text: text('label.lost'),
        chip: false,
        font: 'text',
        fontSize: 12,
        align: 'left',
        opacity: op,
        style: accent,
      });
    }
  }

  // ---- 꼭짓점 이름표 ----
  for (const a of r.apexes) {
    const key = APEX_KEYS[a.k];
    if (!key) continue;
    const first = a.k === 0;
    g.push({
      type: 'readout',
      id: `apex-${a.k}`,
      anchor: { world: a.pos, offset: first ? DROP_LABEL_OFFSET : APEX_LABEL_OFFSET },
      text: text(key),
      chip: false,
      // 문장 글꼴 — 고정폭 글꼴에서 위 첨자(²·⁴)가 다른 글꼴로 대체되어 어긋나 찍혔다.
      font: 'text',
      italic: true,
      fontSize: 13,
      align: first ? 'right' : 'center',
      opacity: op,
      style: ink,
    });
  }

  // ---- 첫 충돌의 v · ev ----
  // 들어온 빠르기(점선 — 지나간 것)와 튀어 나간 빠르기를 착지점 좌우에 세운다. 궤적의 V
  // 바깥에 서서 겹치지 않는다. 「덜 튀어 나온다」 가 길이로 남는 자리다.
  const fi = r.firstImpact;
  if (fi) {
    const inLen = fi.vIn * ARROW_SCALE;
    const outLen = fi.vOut * ARROW_SCALE;
    g.push({
      type: 'vector',
      id: 'v-in',
      from: [fi.x - ARROW_SPREAD, inLen],
      delta: [0, -inLen],
      label: text('label.vIn'),
      labelSide: 'cw',
      width: 1.5,
      opacity: op,
      style: { ...velocity, lineStyle: 'dashed' },
    });
    g.push({
      type: 'vector',
      id: 'v-out',
      from: [fi.x + ARROW_SPREAD, 0],
      delta: [0, outLen],
      label: text('label.vOut'),
      labelSide: 'cw',
      width: 2,
      opacity: op,
      style: velocity,
    });
    g.push({
      type: 'readout',
      id: 'restitution',
      anchor: { world: [fi.x, 0], offset: E_LABEL_OFFSET },
      text: text('label.restitution'),
      vars: { e: String(c.restitution) },
      chip: false,
      font: 'mono',
      fontSize: 13,
      align: 'center',
      opacity: op,
      style: muted,
    });
  }

  // ---- 착지 파문 ----
  // 부딪힌 순간 바닥 위로 번지는 반원. 크기가 그 충돌에서 사라진 에너지 몫을 따른다.
  if (r.rings.length > 0) {
    g.push({
      type: 'trace',
      id: 'impact',
      marks: r.rings.map((m) => ({ pos: m.pos, age: m.age, strength: m.strength })),
      life: RING_LIFE,
      shape: 'ring',
      size: RING_FROM,
      spreadTo: RING_TO,
      arc: [0, Math.PI],
      width: 1.5,
      opacity: op,
      style: accent,
    });
  }

  // ---- 공 ----
  g.push({
    type: 'body',
    id: 'ball',
    pos: r.ball,
    shape: 'circle',
    size: BALL_R,
    glow: false,
    opacity: op,
    style: ink,
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return g;
}

/**
 * 고정 경계. 스테이지 상수에서 한 번 정해지고 매 프레임 같은 값이라 카메라가 흔들리지
 * 않는다 (원칙 6). 가로 끝은 공이 튐을 멈추는 자리다.
 */
export function boundsHint(_state: InelasticCollisionState, stage: StageDef): Bounds {
  const c = readConstants(stage);
  const s = schedule(c);
  return {
    minX: -FRAME_PAD.left,
    maxX: c.drift * s.settle + FRAME_PAD.right,
    minY: -FRAME_PAD.bottom,
    maxY: c.height + 2 * BALL_R + FRAME_PAD.top,
  };
}
