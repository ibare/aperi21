// ========================================================================
// rolling-race — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 비탈(surface wall) ·
// 출발선 · 결승선(trajectory 점선) · 물체(body · trajectory closed) · 굴림 표지(lineSet) ·
// 이름표 · 순위(readout) · 도착 파문(trace)이 모두 표준 어휘로 있다.
//
// 색은 뜻마다 하나다 — 물체 넷은 먹색(같은 종류의 대상이라 같은 색이고, 가르는 것은
// **칠의 짙기가 놓인 자리** = 질량 분포다), 굴림 표지는 secondary, **강조색은 「닿았다」
// 한 가지 뜻에만**(순위 · 도착 파문). 선 · 이름표는 배경 정보라 muted.
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
import { racers, rankOf, readConstants, readRacer, sceneOpacity, type Racer } from './physics';
import {
  LANE_GAP,
  NAME_DX,
  RANK_DX,
  RANK_LABELS,
  SCENE_BOUNDS,
  SPOKE_INNER,
  STOPPER_HEIGHT,
  text,
} from './schema';
import type { RollingRaceState } from './state';

/** 출발선 · 결승선 굵기(화면 px). 재는 선이라 가늘게. */
const MARK_LINE_WIDTH = 1;
/** 고리 테 굵기(화면 px). 질량이 모두 여기 있다는 것이 보일 만큼 굵게. */
const HOOP_RIM_WIDTH = 5;
/** 원판의 고른 칠 짙기. 가운데와 테가 같은 짙기다 — 질량이 고르게 퍼져 있다. */
const DISC_FILL = 0.5;
/**
 * 공의 칠 — 반지름 비와 그 겹의 짙기. 겹칠수록 가운데가 짙어진다(구를 옆에서 보면
 * 가운데가 두껍다 — 질량이 가운데에 모여 있다).
 */
const SPHERE_LAYERS: readonly (readonly [number, number])[] = [
  [1, 0.32],
  [0.72, 0.4],
  [0.42, 0.55],
];
/** 굴림 표지 굵기(화면 px). */
const SPOKE_WIDTH = 2.5;
/** 이름표 · 순위 글자 크기(화면 px). */
const NAME_PX = 12;
const RANK_PX = 14;
/** 도착 파문 — 크기(화면 px)와 사라지기까지(초). */
const ARRIVAL_RING = { size: 4, spreadTo: 22, life: 0.9 } as const;
/** 비탈이 출발선 뒤로 조금 더 올라가는 길이(m). 출발선이 비탈 끝에 붙어 보이지 않게. */
const TRACK_BEHIND = 0.3;

/** 비탈 한 레인의 좌표계. 접점 s(비탈을 따라 잰 거리) → 월드. */
interface Lane {
  /** s = 0 인 접점(출발선 위). */
  origin: Vec2;
  /** 비탈 아래 방향 단위 벡터. */
  down: Vec2;
  /** 비탈에서 위로 선 법선 단위 벡터. */
  up: Vec2;
}

const at = (lane: Lane, s: number, h = 0): Vec2 => [
  lane.origin[0] + lane.down[0] * s + lane.up[0] * h,
  lane.origin[1] + lane.down[1] * s + lane.up[1] * h,
];

const circle = (center: Vec2, r: number, n = 48): Vec2[] => {
  const pts: Vec2[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    pts.push([center[0] + r * Math.cos(a), center[1] + r * Math.sin(a)]);
  }
  return pts;
};

/** 물체 하나 — 질량이 놓인 자리를 칠의 짙기로 보인다. 모양만 다르고 색은 같다. */
function bodyOf(racer: Racer, center: Vec2, alpha: number): Primitive[] {
  const base = { style: { colorRole: 'ink', emphasis: 'strong' } } as const;
  if (racer.shape === 'hoop') {
    // 속이 비었다. 테만 있다 — 질량이 모두 축에서 R 만큼 떨어져 있다.
    return [
      {
        type: 'trajectory',
        id: `${racer.id}-rim`,
        points: circle(center, racer.r),
        closed: true,
        width: HOOP_RIM_WIDTH,
        opacity: alpha,
        ...base,
      },
    ];
  }
  if (racer.shape === 'disc') {
    return [
      {
        type: 'body',
        id: `${racer.id}-body`,
        pos: center,
        shape: 'circle',
        size: racer.r,
        glow: false,
        outline: 'role',
        opacity: alpha * DISC_FILL,
        ...base,
      },
    ];
  }
  return SPHERE_LAYERS.map(([ratio, a], i) => ({
    type: 'body' as const,
    id: `${racer.id}-layer-${i}`,
    pos: center,
    shape: 'circle' as const,
    size: racer.r * ratio,
    glow: false,
    outline: i === 0 ? ('role' as const) : ('none' as const),
    opacity: alpha * a,
    ...base,
  }));
}

export function scene(params: {
  state: RollingRaceState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('rolling-race: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const alpha = sceneOpacity(timeline);
  const all = racers(c);
  const out: Primitive[] = [];

  const down: Vec2 = [Math.cos(c.angle), -Math.sin(c.angle)];
  const up: Vec2 = [Math.sin(c.angle), Math.cos(c.angle)];
  const drop = c.length * Math.sin(c.angle);
  const run = c.length * Math.cos(c.angle);
  // 맨 아래 레인의 결승 접점이 월드 원점이다. 레인 i 는 그 위로 (N−1−i)·간격.
  const lanes: Lane[] = all.map((_, i) => ({
    origin: [0, drop + (all.length - 1 - i) * LANE_GAP],
    down,
    up,
  }));
  const topY = lanes[0]!.origin[1];
  const maxR = Math.max(...all.map((r) => r.r));

  // ---- 출발선 · 결승선 ----
  // 둘 다 네 레인을 세로로 꿴다. 출발선은 「같은 자리에서 놓았다」, 결승선은 「누가 먼저
  // 넘었나」 를 한 줄로 맞대 보게 한다. 재는 선이라 점선 · 가늘게 · 물체 뒤로.
  out.push(
    {
      type: 'trajectory',
      id: 'start-line',
      points: [
        [0, drop - 0.12],
        [0, topY + 2 * maxR + 0.12],
      ],
      width: MARK_LINE_WIDTH,
      style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
    },
    {
      type: 'trajectory',
      id: 'finish-line',
      points: [
        [run, -0.12],
        [run, topY - drop + 2 * maxR + 0.12],
      ],
      width: MARK_LINE_WIDTH,
      style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
    },
  );

  all.forEach((racer, i) => {
    const lane = lanes[i]!;
    const reading = readRacer(timeline, racer, c);

    // ---- 비탈 · 멈춤막 ----
    // 멈춤막은 결승선에서 반지름만큼 앞 — 닿은 물체의 앞면이 막에 붙는다.
    out.push(
      {
        type: 'surface',
        id: `track-${racer.id}`,
        geometry: { kind: 'wall', from: at(lane, -TRACK_BEHIND), to: at(lane, c.length + racer.r) },
        material: 'solid',
      },
      {
        type: 'surface',
        id: `stopper-${racer.id}`,
        geometry: {
          kind: 'wall',
          from: at(lane, c.length + racer.r),
          to: at(lane, c.length + racer.r, Math.max(STOPPER_HEIGHT, racer.r * 1.1)),
        },
        material: 'solid',
      },
    );

    // ---- 이름표 ----
    // 비탈을 뒤로 이은 자리, 선과 같은 높이에 오른쪽 끝을 맞춘다 — 선 위에 얹히면
    // 선이 글자를 가로지른다.
    out.push({
      type: 'readout',
      id: `name-${racer.id}`,
      anchor: { world: [NAME_DX, lane.origin[1] - NAME_DX * Math.tan(c.angle)] },
      text: text(racer.name),
      chip: false,
      fontSize: NAME_PX,
      align: 'right',
      font: 'text',
      style: { colorRole: 'muted', emphasis: 'strong' },
    });

    // ---- 물체 ----
    const center = at(lane, reading.s, racer.r);
    out.push(...bodyOf(racer, center, alpha));

    // ---- 굴림 표지 ----
    // 반지름 선 하나가 돈다. 같은 거리를 가도 작은 원판은 큰 원판의 두 배로 돈다 —
    // 반지름은 도는 빠르기만 바꾸고 내려가는 빠르기는 바꾸지 않는다.
    const phi = Math.PI / 2 - reading.turned;
    const dir: Vec2 = [Math.cos(phi), Math.sin(phi)];
    out.push({
      type: 'lineSet',
      id: `spoke-${racer.id}`,
      lines: [
        [
          [center[0] + dir[0] * racer.r * SPOKE_INNER, center[1] + dir[1] * racer.r * SPOKE_INNER],
          [center[0] + dir[0] * racer.r, center[1] + dir[1] * racer.r],
        ],
      ],
      width: SPOKE_WIDTH,
      opacity: alpha,
      style: { colorRole: 'secondary', emphasis: 'strong' },
    });

    // ---- 닿았다 ----
    // 닿은 순간 결승선 위에 파문이 한 번 퍼지고, 순위가 남는다. 순위는 k 만으로 정해진다 —
    // 크기가 다른 원판 둘이 같은 수를 받는다.
    if (reading.arrived) {
      out.push({
        type: 'trace',
        id: `arrival-${racer.id}`,
        marks: [{ pos: at(lane, c.length, racer.r), age: reading.sinceArrival }],
        life: ARRIVAL_RING.life,
        shape: 'ring',
        size: ARRIVAL_RING.size,
        spreadTo: ARRIVAL_RING.spreadTo,
        opacity: alpha,
        style: { colorRole: 'accent', emphasis: 'strong' },
      });
      out.push({
        type: 'readout',
        id: `rank-${racer.id}`,
        anchor: { world: [run + RANK_DX, lane.origin[1] - drop + racer.r] },
        text: text(RANK_LABELS[rankOf(racer, all) - 1]!),
        chip: false,
        fontSize: RANK_PX,
        weight: 'bold',
        opacity: alpha,
        style: { colorRole: 'accent', emphasis: 'strong' },
      });
    }
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
