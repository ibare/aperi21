// ========================================================================
// equivalence-principle — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 상자(region 칠 + trajectory 테두리) ·
// 공(body) · 선반(trajectory) · 자국(trace) · 별(particleSystem) · 불꽃(stream) · 땅(surface) ·
// 가속도 · 중력(vector) · 이름표(readout) 가 모두 표준 어휘로 있다. 캡션은 선언의 캡션 슬롯이 그린다.
//
// 왼쪽은 우주에서 가속하는 상자, 오른쪽은 지구 위에 서 있는 상자다. 월드 1 = 1 m, 두 상자가
// 나란히 서는 바닥 높이가 y = 0 이다.
//
// 색은 뜻마다 하나 — **강조색은 「g」 한 뜻에만**(왼쪽 상자의 가속도, 오른쪽 상자의 중력). 둘이
// 같은 색 · 같은 길이라 「같은 g」 로 읽힌다. 상자 · 공은 먹색, 자국은 secondary, 별 · 땅 · 상자 속 ·
// 선반 · 엔진은 배경 정보라 muted. 공과 자국은 두 상자에서 같은 모양 · 같은 색이다 — 같은 대상이다.
// ========================================================================

import type {
  Bounds,
  EnvironmentDef,
  Primitive,
  SceneGraph,
  StageDef,
  Trajectory,
  TimelineFrame,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import {
  ballRise,
  outsideVisibility,
  readConstants,
  spaceFloor,
  starField,
  strobeHeights,
  strobeRun,
} from './physics';
import { text } from './schema';
import type { EquivalencePrincipleState } from './state';

// ------------------------------------------------------------------------
// 배치 — 월드 단위(m)
// ------------------------------------------------------------------------

/** 상자 — 폭 · 높이. 두 상자가 같은 크기다. */
const BOX_W = 2.0;
const BOX_H = 2.2;
/** 상자 가운데 x — 왼쪽(우주) · 오른쪽(지구). */
const SPACE_CX = -1.75;
const EARTH_CX = 1.75;
/** 공 반지름과, 상자 가운데에서 왼쪽으로 뗀 공의 가로 자리. */
const BALL_R = 0.14;
const BALL_DX = -0.3;
/** 엔진(분사구) — 윗변 · 아랫변 폭, 높이. */
const NOZZLE_TOP_W = 0.5;
const NOZZLE_BOTTOM_W = 0.3;
const NOZZLE_H = 0.18;
/** 불꽃 — 뿜는 속도(월드/초, 아래로), 초당 개수, 수명(초). */
const FLAME_SPEED = 3;
const FLAME_RATE = 45;
const FLAME_LIFE = 0.22;
/** g 1 m/s² 당 화살표 길이(월드). 두 화살표가 같은 g 라 같은 길이다. */
const ARROW_PER_G = 0.08;
/** 화살표를 상자 벽에서 바깥으로 뗀 거리(월드). */
const ARROW_GAP = 0.28;
/**
 * 우주 쪽 별을 흩뿌리는 사각형과 개수. 상자 속 칠이 상자 뒤의 별을 가린다. 왼쪽 끝은 가속도
 * 화살표 바로 오른쪽이다 — 그 왼쪽은 이름표 기둥이라 비운다(칩을 깔면 칩이 화살표를 덮는다, G122).
 */
const STAR_MIN: Vec2 = [-2.95, -1.95];
const STAR_MAX: Vec2 = [-0.2, 2.6];
const STAR_COUNT = 40;
/** 땅을 오른쪽 판에만 긋는 자르기 사각형. 땅 선이 반쯤 잘리지 않게 위 끝을 조금 올린다. */
const GROUND_CLIP = { min: [0.1, -10] as Vec2, max: [10, 0.06] as Vec2 };
/** 같은 시간 간격 자국의 칸 수 — 낙하 한 번을 이만큼 나눠 찍는다. */
const STROBE_STEPS = 6;

// ------------------------------------------------------------------------
// 그리기 치수 — 화면 px 와 짙기 (C2)
// ------------------------------------------------------------------------

const BOX_WIDTH_PX = 2.5;
const SHELF_WIDTH_PX = 4;
const ARROW_WIDTH_PX = 3;
const STAR_PX = 1.2;
const FLAME_WIDTH_PX = 3;
/** 불꽃 흩날림(화면 px). */
const FLAME_JITTER_PX = 8;
const MARK_PX = 4;
const MARK_WIDTH_PX = 1.5;
const LABEL_PX = 12;
const TITLE_PX = 13;
const UNKNOWN_PX = 22;
/** 상자 속 칠의 짙기 — 뒤의 별을 가리되 상자 안이 비어 보이게 옅다. */
const BOX_FILL_OPACITY = 0.1;
/** 별의 짙기 — 배경. */
const STAR_OPACITY = 0.7;
/** 상자 이름 · `?` 를 상자 윗변 위로 띄우는 거리(화면 px, 음수가 위). */
const TITLE_LIFT = -14;
/** 화살표 이름표를 화살표 옆으로 띄우는 거리(화면 px). */
const ARROW_LABEL_GAP = 8;

const ink = { colorRole: 'ink', emphasis: 'strong' } as const;
const faint = { colorRole: 'muted', emphasis: 'strong' } as const;
const gAccent = { colorRole: 'accent', emphasis: 'strong' } as const;
const marks = { colorRole: 'secondary', emphasis: 'strong' } as const;

function line(
  id: string,
  points: readonly Vec2[],
  width: number,
  style: Trajectory['style'],
  extra: Partial<Trajectory> = {},
): Trajectory {
  return { type: 'trajectory', id, points, width, style, ...extra };
}

function rectPoints(minX: number, minY: number, maxX: number, maxY: number): Vec2[] {
  return [
    [minX, minY],
    [maxX, minY],
    [maxX, maxY],
    [minX, maxY],
  ];
}

/**
 * 상자 하나 — 속 칠 · 선반 · 자국 · 공 · 테두리. 두 상자가 이 한 벌을 쓴다 — 안에서 보이는
 * 것이 같다는 주장을 선언의 모양으로도 지킨다. 다른 것은 바닥 높이 `floor` 하나다.
 */
function box(
  out: Primitive[],
  side: string,
  cx: number,
  floor: number,
  h: number,
  rise: number,
  run: { heights: readonly number[]; opacity: number },
): void {
  const left = cx - BOX_W / 2;
  const right = cx + BOX_W / 2;
  const ballX = cx + BALL_DX;

  out.push({
    type: 'region',
    id: `${side}-inside`,
    points: rectPoints(left, floor, right, floor + BOX_H),
    fillOpacity: BOX_FILL_OPACITY,
    opaque: true,
    style: faint,
  });

  // 선반 — 공을 놓는 높이. 상자에 붙어 함께 움직인다.
  const shelfY = floor + h + BALL_R;
  out.push(line(`${side}-shelf`, [[left, shelfY], [ballX - BALL_R, shelfY]], SHELF_WIDTH_PX, faint));

  // 자국 — 같은 시간 간격으로 찍은 공의 자리. 상자 바닥에서 잰 높이라 상자와 함께 움직인다.
  if (run.heights.length > 0 && run.opacity > 0) {
    out.push({
      type: 'trace',
      id: `${side}-marks`,
      marks: run.heights.map((r) => ({ pos: [ballX, floor + r * h + BALL_R] as Vec2 })),
      shape: 'ring',
      size: MARK_PX,
      width: MARK_WIDTH_PX,
      opacity: run.opacity,
      style: marks,
    });
  }

  out.push({
    type: 'body',
    id: `${side}-ball`,
    pos: [ballX, floor + rise * h + BALL_R],
    shape: 'circle',
    size: BALL_R,
    outline: 'none',
    glow: false,
    style: ink,
  });

  out.push(line(`${side}-box`, rectPoints(left, floor, right, floor + BOX_H), BOX_WIDTH_PX, ink, { closed: true }));
}

export function scene(params: {
  state: EquivalencePrincipleState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('equivalence-principle: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const h = c.dropHeightM;
  const out: Primitive[] = [];

  const vis = outsideVisibility(tl);
  const rise = ballRise(tl);
  const strobe = strobeRun(tl);
  const run = { heights: strobeHeights(strobe.progress, STROBE_STEPS), opacity: strobe.opacity };
  const arrowLen = ARROW_PER_G * c.gMs2;

  const spaceFloorY = spaceFloor(tl, h);
  const earthFloorY = 0;

  // ====================================================================
  // 바깥 — 별 · 땅 (상자 뒤)
  // ====================================================================
  if (vis > 0) {
    out.push({
      type: 'particleSystem',
      id: 'stars',
      positions: starField(c.seed, STAR_COUNT, STAR_MIN, STAR_MAX),
      sizes: STAR_PX,
      opacity: STAR_OPACITY * vis,
      style: faint,
    });
    out.push({
      type: 'surface',
      id: 'ground',
      geometry: { kind: 'ground', y: earthFloorY },
      clip: GROUND_CLIP,
      opacity: vis,
      style: faint,
    });
  }

  // ====================================================================
  // 우주 상자 — 엔진 · 불꽃 · 상자
  // ====================================================================
  if (vis > 0) {
    out.push({
      type: 'stream',
      id: 'flame',
      from: [SPACE_CX, spaceFloorY - NOZZLE_H],
      velocity: [0, -FLAME_SPEED],
      rate: FLAME_RATE,
      life: FLAME_LIFE,
      width: FLAME_WIDTH_PX,
      jitter: FLAME_JITTER_PX,
      opacity: vis,
      style: marks,
    });
    out.push({
      type: 'region',
      id: 'nozzle',
      points: [
        [SPACE_CX - NOZZLE_TOP_W / 2, spaceFloorY],
        [SPACE_CX + NOZZLE_TOP_W / 2, spaceFloorY],
        [SPACE_CX + NOZZLE_BOTTOM_W / 2, spaceFloorY - NOZZLE_H],
        [SPACE_CX - NOZZLE_BOTTOM_W / 2, spaceFloorY - NOZZLE_H],
      ],
      fillOpacity: 1,
      opaque: true,
      opacity: vis,
      style: faint,
    });
  }
  box(out, 'space', SPACE_CX, spaceFloorY, h, rise, run);

  // ====================================================================
  // 지구 상자
  // ====================================================================
  box(out, 'earth', EARTH_CX, earthFloorY, h, rise, run);

  // ====================================================================
  // g — 왼쪽 상자의 가속도(위), 오른쪽 공에 걸린 중력(아래). 같은 길이.
  // ====================================================================
  if (vis > 0) {
    const ax = SPACE_CX - BOX_W / 2 - ARROW_GAP;
    const ay = spaceFloorY + BOX_H / 2 - arrowLen / 2;
    out.push({
      type: 'vector',
      id: 'accel',
      from: [ax, ay],
      delta: [0, arrowLen],
      width: ARROW_WIDTH_PX,
      opacity: vis,
      style: gAccent,
    });
    out.push({
      type: 'readout',
      id: 'accel-label',
      anchor: { world: [ax, ay + arrowLen / 2], offset: [-ARROW_LABEL_GAP, 0] },
      text: text('label.accel'),
      vars: { g: String(c.gMs2) },
      chip: false,
      font: 'text',
      fontSize: LABEL_PX,
      align: 'right',
      opacity: vis,
      style: gAccent,
    });

    const gx = EARTH_CX + BOX_W / 2 + ARROW_GAP;
    const gy = earthFloorY + BOX_H / 2 + arrowLen / 2;
    out.push({
      type: 'vector',
      id: 'gravity',
      from: [gx, gy],
      delta: [0, -arrowLen],
      width: ARROW_WIDTH_PX,
      opacity: vis,
      style: gAccent,
    });
    out.push({
      type: 'readout',
      id: 'gravity-label',
      anchor: { world: [gx, gy - arrowLen / 2], offset: [ARROW_LABEL_GAP, 0] },
      text: text('label.gravity'),
      vars: { g: String(c.gMs2) },
      chip: false,
      font: 'text',
      fontSize: LABEL_PX,
      align: 'left',
      opacity: vis,
      style: gAccent,
    });
  }

  // ====================================================================
  // 상자 이름 — 창을 가리면 `?` 로 바뀐다
  // ====================================================================
  const titles: readonly { id: string; cx: number; top: number; label: 'label.space' | 'label.earth' }[] = [
    { id: 'space', cx: SPACE_CX, top: spaceFloorY + BOX_H, label: 'label.space' },
    { id: 'earth', cx: EARTH_CX, top: earthFloorY + BOX_H, label: 'label.earth' },
  ];
  for (const t of titles) {
    if (vis > 0) {
      out.push({
        type: 'readout',
        id: `${t.id}-title`,
        anchor: { world: [t.cx, t.top], offset: [0, TITLE_LIFT] },
        text: text(t.label),
        // 별이 이름 뒤를 지나가도 읽히도록 바탕 칩을 깐다.
        chip: true,
        font: 'text',
        fontSize: TITLE_PX,
        align: 'center',
        opacity: vis,
        style: faint,
      });
    }
    if (vis < 1) {
      out.push({
        type: 'readout',
        id: `${t.id}-unknown`,
        anchor: { world: [t.cx, t.top], offset: [0, TITLE_LIFT] },
        text: text('label.unknown'),
        chip: false,
        font: 'text',
        fontSize: UNKNOWN_PX,
        weight: 'bold',
        align: 'center',
        opacity: 1 - vis,
        style: ink,
      });
    }
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/**
 * 고정 경계. 왼쪽 상자가 가장 낮을 때(바닥 −h, 엔진 · 불꽃 포함)부터 두 상자가 나란히 선 윗변의
 * 이름표까지, 가로는 양쪽 화살표 이름표까지. 아래 캡션 줄 몫을 조금 더 둔다.
 * 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6).
 */
export function boundsHint(): Bounds {
  return { minX: -4.3, maxX: 4.3, minY: -2.4, maxY: 2.6 };
}
