// ========================================================================
// apparent-weight — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 —
// 승강로·줄·연결선(trajectory) · 칸·저울·사람(body + trajectory) ·
// 속도(vector + readout) · 눈금판·바늘·눈금 숫자·평소 자리·벗어난 만큼(scale dial) 이 모두
// 표준 어휘로 있다. 캡션은 선언의 캡션 슬롯이 그린다.
//
// 원본 좌표(아래로 +)를 월드(위로 +)로 옮길 때 y 만 뒤집는다. 그리는 순서가 곧 겹침
// 순서다 (`schema.drawOrder: 'scene'`) — 원본의 mark 순서 그대로 둔다.
// ========================================================================

import type {
  Body,
  Bounds,
  EnvironmentDef,
  Primitive,
  Readout,
  Scale,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Trajectory,
  Vec2,
  Vector,
  ViewDef,
} from '@aperi21/schema';

import { motionAt, readConstants, riseHeight } from './physics';
import { ARROW_PX_PER_MS, CAR, DIAL, H, SHAFT, TRAVEL_PX, W, text } from './schema';
import type { ApparentWeightState } from './state';

// ------------------------------------------------------------------------
// 원본 그리기 치수 (px)
// ------------------------------------------------------------------------

/** 승강로 벽·바닥 굵기, 바닥이 벽 밖으로 나오는 길이. */
const SHAFT_WIDTH = 2;
const FLOOR_OVERHANG = 14;
/** 벽의 층 표시 — 간격, 길이, 굵기. */
const FLOOR_MARK_GAP = 20;
const FLOOR_MARK_LEN = 10;
const FLOOR_MARK_WIDTH = 1.5;
/** 매단 줄 — 승강로 위로 올라가는 길이, 굵기. */
const ROPE_ABOVE = 12;
const ROPE_WIDTH = 1.5;
/** 칸이 승강로 바닥에서 떠 있는 틈. */
const CAR_FLOOR_GAP = 6;
/** 칸 윤곽 굵기. */
const CAR_STROKE = 2;
/**
 * 칸 채움의 빛의 양. 원본은 바탕보다 살짝 짙은 무채색 판(--panel)이었다.
 * 색 리터럴 대신 무채색 역할을 바탕 쪽으로 옅게 섞는다 (C2).
 */
const CAR_FILL_LUMINANCE = 0.1;
/** 칸 바닥 저울 — 폭·높이, 바닥에서 뜬 틈, 윤곽 굵기. */
const SCALE_W = 44;
const SCALE_H = 9;
const SCALE_LIFT = 2;
const SCALE_STROKE = 1.5;
/** 사람 — 발 간격, 다리 윗끝, 다리 굵기, 몸통(폭·높이·모서리·윗끝), 머리(중심·반지름). */
const FOOT_X = 6;
const HIP_X = 5;
const LEG_TOP = 30;
const LEG_WIDTH = 5;
const TORSO_W = 22;
const TORSO_H = 36;
const TORSO_R = 7;
const TORSO_TOP = 62;
const HEAD_Y = 72;
const HEAD_R = 9;
/** 속도 화살표 — 승강로 오른쪽에서 뗀 거리, 굵기, 머리 크기, 글자 틈·크기. */
const ARROW_OFFSET = 36;
const ARROW_WIDTH = 2.5;
const ARROW_HEAD = 9;
const VELOCITY_LABEL_GAP = 12;
const VELOCITY_LABEL_FONT = 13;
/** 연결선 — 눈금판 가장자리에서 뗀 거리, 굵기. */
const LINK_GAP = 18;
const LINK_WIDTH = 1;
/** 눈금 — 선을 긋는 간격(kg). 엔진 눈금판은 둘째 눈금마다 굵게 긋는다 (NOTES (a)). */
const TICK_STEP = 5;
/** 숫자를 붙이는 간격(kg). 눈금판이 `labelAt` 값마다 눈금 안쪽에 그린다. */
const LABEL_STEP = 10;
/**
 * 평소 글자 자리·크기. 평소 눈금(60 kg)은 눈금판 맨 위에 오므로 원본처럼 눈금판 위쪽
 * 가운데 오른편에 둔다. 평소 자리 점선은 `scale.origin` 이 그린다.
 */
const USUAL_LABEL_DX = 8;
const USUAL_LABEL_Y = 12;
const USUAL_LABEL_FONT = 12;

/** 원본 좌표 → 월드. y 를 뒤집는다. */
function at(x: number, y: number): Vec2 {
  return [x, -y];
}

const faint: Trajectory['style'] = { colorRole: 'muted', emphasis: 'subtle' };
const ink = { colorRole: 'ink', emphasis: 'strong' } as const;

function line(
  id: string,
  points: readonly Vec2[],
  width: number,
  style: Trajectory['style'],
  extra: Partial<Trajectory> = {},
): Trajectory {
  return { type: 'trajectory', id, points, width, style, ...extra };
}

/** 모서리가 둥근 사각형의 외형. `customPath` 는 pos 기준 월드 단위, y 위. */
function roundedRectPath(w: number, h: number, r: number): string {
  const x = w / 2;
  const y = h / 2;
  return [
    `M ${-x + r} ${y}`,
    `L ${x - r} ${y}`,
    `Q ${x} ${y} ${x} ${y - r}`,
    `L ${x} ${-y + r}`,
    `Q ${x} ${-y} ${x - r} ${-y}`,
    `L ${-x + r} ${-y}`,
    `Q ${-x} ${-y} ${-x} ${-y + r}`,
    `L ${-x} ${y - r}`,
    `Q ${-x} ${y} ${-x + r} ${y}`,
    'Z',
  ].join(' ');
}

export function scene(params: {
  state: ApparentWeightState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state, stage, timeline } = params;
  if (!timeline) throw new Error('apparent-weight: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const m = motionAt(timeline, c);
  const pxPerM = TRAVEL_PX / riseHeight(c);
  const out: Primitive[] = [];

  const carBottom = SHAFT.bottom - CAR_FLOOR_GAP - m.y * pxPerM;
  const carTop = carBottom - CAR.h;
  const carX = SHAFT.x + (SHAFT.w - CAR.w) / 2;
  const carCx = carX + CAR.w / 2;

  // ---- 승강로 ----
  const right = SHAFT.x + SHAFT.w;
  out.push(line('shaft-left', [at(SHAFT.x, SHAFT.top), at(SHAFT.x, SHAFT.bottom)], SHAFT_WIDTH, faint));
  out.push(line('shaft-right', [at(right, SHAFT.top), at(right, SHAFT.bottom)], SHAFT_WIDTH, faint));
  out.push(
    line(
      'shaft-floor',
      [at(SHAFT.x - FLOOR_OVERHANG, SHAFT.bottom), at(right + FLOOR_OVERHANG, SHAFT.bottom)],
      SHAFT_WIDTH,
      faint,
    ),
  );
  // 벽의 층 표시 — 칸이 벽을 지나가는 것으로 등속 구간에도 움직임이 보인다.
  let k = 0;
  for (let yy = SHAFT.bottom - FLOOR_MARK_GAP; yy > SHAFT.top; yy -= FLOOR_MARK_GAP) {
    out.push(line(`floor-mark-l${k}`, [at(SHAFT.x - FLOOR_MARK_LEN, yy), at(SHAFT.x, yy)], FLOOR_MARK_WIDTH, faint));
    out.push(line(`floor-mark-r${k}`, [at(right, yy), at(right + FLOOR_MARK_LEN, yy)], FLOOR_MARK_WIDTH, faint));
    k++;
  }

  // ---- 엘리베이터 ----
  out.push(line('rope', [at(carCx, SHAFT.top - ROPE_ABOVE), at(carCx, carTop)], ROPE_WIDTH, faint));
  const carFill: Body = {
    type: 'body',
    id: 'car-fill',
    shape: 'rect',
    pos: at(carCx, carTop + CAR.h / 2),
    size: [CAR.w, CAR.h],
    fill: 'solid',
    outline: 'none',
    luminance: CAR_FILL_LUMINANCE,
    style: ink,
  };
  out.push(carFill);
  out.push(
    line(
      'car-outline',
      [at(carX, carTop), at(carX + CAR.w, carTop), at(carX + CAR.w, carBottom), at(carX, carBottom)],
      CAR_STROKE,
      ink,
      { closed: true },
    ),
  );

  // ---- 저울 ----
  const scaleX = carCx - SCALE_W / 2;
  const scaleY = carBottom - SCALE_LIFT - SCALE_H;
  const scaleBody: Body = {
    type: 'body',
    id: 'scale-fill',
    shape: 'rect',
    pos: at(carCx, scaleY + SCALE_H / 2),
    size: [SCALE_W, SCALE_H],
    fill: 'solid',
    outline: 'none',
    // 원본은 바탕색으로 채웠다 — 빛의 양 0 은 바탕 그대로다.
    luminance: 0,
    style: ink,
  };
  out.push(scaleBody);
  out.push(
    line(
      'scale-outline',
      [at(scaleX, scaleY), at(scaleX + SCALE_W, scaleY), at(scaleX + SCALE_W, scaleY + SCALE_H), at(scaleX, scaleY + SCALE_H)],
      SCALE_STROKE,
      ink,
      { closed: true },
    ),
  );

  // ---- 사람 ----
  const feet = scaleY;
  out.push(line('leg-left', [at(carCx - FOOT_X, feet - 1), at(carCx - HIP_X, feet - LEG_TOP)], LEG_WIDTH, ink));
  out.push(line('leg-right', [at(carCx + FOOT_X, feet - 1), at(carCx + HIP_X, feet - LEG_TOP)], LEG_WIDTH, ink));
  const torso: Body = {
    type: 'body',
    id: 'torso',
    shape: 'custom',
    pos: at(carCx, feet - TORSO_TOP + TORSO_H / 2),
    customPath: roundedRectPath(TORSO_W, TORSO_H, TORSO_R),
    style: ink,
  };
  out.push(torso);
  const head: Body = {
    type: 'body',
    id: 'head',
    shape: 'circle',
    pos: at(carCx, feet - HEAD_Y),
    size: HEAD_R,
    fill: 'solid',
    outline: 'none',
    glow: false,
    style: ink,
  };
  out.push(head);

  // ---- 속도 화살표 ----
  // 가속도 화살표는 두지 않는다 — 그것이 답이라 독자가 속도와 눈금을 견주는 일을 빼앗는다.
  const ax = right + ARROW_OFFSET;
  const ay = carTop + CAR.h / 2;
  const velocity: Vector = {
    type: 'vector',
    id: 'velocity',
    from: at(ax, ay),
    delta: [0, m.v * ARROW_PX_PER_MS],
    width: ARROW_WIDTH,
    headSize: ARROW_HEAD,
    style: ink,
  };
  out.push(velocity);
  const velocityLabel: Readout = {
    type: 'readout',
    id: 'velocity-label',
    anchor: { world: at(ax + VELOCITY_LABEL_GAP, ay) },
    text: text('label.velocity'),
    chip: false,
    align: 'left',
    font: 'text',
    fontSize: VELOCITY_LABEL_FONT,
    style: ink,
  };
  out.push(velocityLabel);

  // ---- 연결선 ----
  out.push(
    line(
      'link',
      [at(scaleX + SCALE_W, scaleY + SCALE_H / 2), at(DIAL.cx - DIAL.r - LINK_GAP, DIAL.cy)],
      LINK_WIDTH,
      faint,
      { style: { ...faint, lineStyle: 'dashed' } },
    ),
  );

  // ---- 눈금판 · 바늘 · 눈금 숫자 · 벗어난 만큼 ----
  // 평소 눈금(origin)에서 바늘까지 강조색 부채꼴. 차이를 **수로 늘리지 않으려** 글자는 끈다.
  const ticks: number[] = [];
  for (let v = DIAL.min; v <= DIAL.max; v += TICK_STEP) ticks.push(v);
  const labels: number[] = [];
  for (let v = DIAL.min; v <= DIAL.max; v += LABEL_STEP) labels.push(v);
  const dial: Scale = {
    type: 'scale',
    id: 'dial',
    shape: 'dial',
    pos: at(DIAL.cx, DIAL.cy),
    size: DIAL.size,
    range: [DIAL.min, DIAL.max],
    value: state.needle,
    // 평소 눈금. 부채꼴의 출발점이자, 그 자리 점선이 원본의 평소 표시를 대신한다.
    origin: c.mass,
    showDelta: false,
    tickAt: ticks,
    labelAt: labels,
    unit: text('label.unit'),
    // 체중계처럼 정수 kg.
    digits: 0,
    style: { colorRole: 'accent', emphasis: 'strong' },
  };
  out.push(dial);

  // ---- 평소 글자 ----
  const usualLabel: Readout = {
    type: 'readout',
    id: 'usual-label',
    anchor: { world: at(DIAL.cx + USUAL_LABEL_DX, USUAL_LABEL_Y) },
    text: text('label.usual'),
    chip: false,
    align: 'left',
    font: 'text',
    fontSize: USUAL_LABEL_FONT,
    style: ink,
  };
  out.push(usualLabel);

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계 — 원본 캔버스 전체. 매 프레임 같은 값이라 카메라가 흔들리지 않는다. */
export function boundsHint(): Bounds {
  return { minX: 0, maxX: W, minY: -H, maxY: 0 };
}
