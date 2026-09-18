// ========================================================================
// relativistic-momentum — 장면 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 없음.
//
// 곡선 판 — 축은 `trajectory` 한 줄(ㄴ자) + 축 이름 `readout` 둘(장부 G47 · G16).
// 실제 곡선 p = γmv 와 고전 직선 p = mv 는 `trajectory`, c 는 세로 점선 `trajectory`.
// 미는 물체는 곡선 위의 먹색 점(`body`), 같은 운동량의 「고전이라면」 점은 직선 위의 속 빈 점.
//
// 색 — 곡선 · 점 · c 는 먹(`ink`), 축 · 고전 직선 · 고전 점 · 안내선은 회색(`muted`).
// 강조색(`accent`)은 「같은 시간마다 찍은 자국」 한 뜻에만 쓴다 — 곡선 위의 점과 두 축 위의 짧은 눈금.
// 세로축 자국은 고르게, 가로축 자국은 c 앞에서 촘촘하게 쌓인다. 그 대비가 주장이다.
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
  Trajectory,
  Vec2,
  Vector,
  ViewDef,
} from '@aperi21/schema';
import {
  classicalLine,
  classicalSpeed,
  momentumAfter,
  plotPoint,
  pushElapsed,
  readConstants,
  relativisticCurve,
  relativisticSpeed,
  stampMomenta,
} from './physics';
import { CURVE_LABEL_P, PLOT, SCENE_BOUNDS, text, type RelativisticMomentumMessageKey } from './schema';
import type { RelativisticMomentumState } from './state';

// ------------------------------------------------------------------------
// 위계 — 화면 px 이거나 월드 길이
// ------------------------------------------------------------------------

/** 곡선 표본 수. 운동량을 고르게 나눠 짚으므로 c 앞의 치솟는 구간도 매끄럽다. */
const CURVE_SAMPLES = 160;
/** 선 굵기(화면 px). */
const AXIS_PX = 1;
const CURVE_PX = 2.5;
const CLASSICAL_PX = 2;
const LIGHT_PX = 1.5;
const GUIDE_PX = 1;
const TICK_PX = 1;
const STAMP_TICK_PX = 2;
/** 점 반지름(월드). */
const DOT_R = 0.1;
const GHOST_R = 0.09;
const STAMP_R = 0.045;
/** 자국 눈금 · 속도 눈금 길이(월드). 자국은 축 안쪽으로, 속도 눈금은 축 바깥으로 긋는다. */
const STAMP_TICK_LEN = 0.16;
const SPEED_TICK_LEN = 0.08;
/** 글자 크기(화면 px). */
const AXIS_LABEL_PX = 12;
const TICK_LABEL_PX = 12;
const LIGHT_LABEL_PX = 14;
const CURVE_LABEL_PX = 13;
/** 글자 띄움(화면 px). */
const AXIS_LABEL_GAP = 12;
const TICK_LABEL_GAP = 14;
const CURVE_LABEL_GAP = 12;
const CLASSICAL_LABEL_GAP = 14;
/** 안내선(떨어뜨린 선 · 두 점을 잇는 선) 짙기. */
const GUIDE_OPACITY = 0.75;
/** 두 점이 이만큼(월드)도 벌어지지 않았으면 잇는 선을 긋지 않는다 — 겹친 점 사이의 선은 점 속에 묻힌다. */
const LINK_MIN = 0.25;
/** 판 밖으로 나간 고전 점을 가리키는 화살촉 크기(월드). */
const LINK_HEAD = 0.14;

const INK = { colorRole: 'ink', emphasis: 'strong' } as const;
const MUTED = { colorRole: 'muted', emphasis: 'strong' } as const;
const ACCENT = { colorRole: 'accent', emphasis: 'strong' } as const;

function label(
  id: string,
  key: RelativisticMomentumMessageKey,
  anchor: Readout['anchor'],
  fontSize: number,
  align: 'left' | 'center' | 'right',
  style: Readout['style'],
  vars?: Record<string, string | number>,
): Readout {
  return {
    type: 'readout',
    id,
    anchor,
    text: text(key),
    ...(vars ? { vars } : {}),
    chip: false,
    font: 'text',
    align,
    fontSize,
    style,
  };
}

export function scene(params: {
  state: RelativisticMomentumState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { timeline: tl } = params;
  if (!tl) throw new Error('relativistic-momentum: schema.timeline 이 선언되어야 한다');
  const k = readConstants(params.stage);
  const live = 1 - tl.at('fade');
  const out: Primitive[] = [];

  const xEnd = PLOT.vEnd * PLOT.perC;
  const yTop = PLOT.pTop * PLOT.perP;
  const xLight = PLOT.perC;

  // ================= 판 =================
  const axes: Trajectory = {
    type: 'trajectory',
    id: 'axes',
    points: [[0, yTop], [0, 0], [xEnd, 0]],
    width: AXIS_PX,
    style: MUTED,
  };
  out.push(axes);
  out.push(label('axis-momentum', 'label.axisMomentum', { world: [0, yTop], offset: [0, -AXIS_LABEL_GAP] }, AXIS_LABEL_PX, 'left', MUTED));
  out.push(label('axis-speed', 'label.axisSpeed', { world: [xEnd, 0], offset: [0, TICK_LABEL_GAP] }, AXIS_LABEL_PX, 'right', MUTED));

  // 속도 눈금 — 선언값 그대로(`{v}c`). 축 바깥으로 짧게 긋는다.
  const tickLines: Vec2[][] = k.speedTicks.map((v) => [
    [v * PLOT.perC, 0],
    [v * PLOT.perC, -SPEED_TICK_LEN],
  ]);
  const speedTicks: LineSet = { type: 'lineSet', id: 'speed-ticks', lines: tickLines, width: TICK_PX, style: MUTED };
  out.push(speedTicks);
  k.speedTicks.forEach((v, i) => {
    out.push(
      label(`speed-tick-${i}`, 'label.speedTick', { world: [v * PLOT.perC, 0], offset: [0, TICK_LABEL_GAP] }, TICK_LABEL_PX, 'center', MUTED, {
        v: String(v),
      }),
    );
  });

  // 광속 — 넘을 수 없는 벽. 세로 점선과 그 아래 기호 c.
  const light: Trajectory = {
    type: 'trajectory',
    id: 'light-speed',
    points: [[xLight, 0], [xLight, yTop]],
    width: LIGHT_PX,
    style: { ...INK, lineStyle: 'dashed' },
  };
  out.push(light);
  out.push(label('light-speed-label', 'label.light', { world: [xLight, 0], offset: [0, TICK_LABEL_GAP] }, LIGHT_LABEL_PX, 'center', INK));

  // ================= 두 선 =================
  const classical: Trajectory = {
    type: 'trajectory',
    id: 'classical-line',
    points: classicalLine(k),
    width: CLASSICAL_PX,
    style: { ...MUTED, lineStyle: 'dashed' },
  };
  out.push(classical);
  const classicalEnd = classical.points[classical.points.length - 1]!;
  out.push(
    label('classical-label', 'label.classical', { world: classicalEnd, offset: [0, -CLASSICAL_LABEL_GAP] }, CURVE_LABEL_PX, 'right', MUTED),
  );

  const curve: Trajectory = {
    type: 'trajectory',
    id: 'relativistic-curve',
    points: relativisticCurve(k, CURVE_SAMPLES),
    width: CURVE_PX,
    style: INK,
  };
  out.push(curve);
  out.push(
    label(
      'relativistic-label',
      'label.relativistic',
      { world: plotPoint(relativisticSpeed(CURVE_LABEL_P, k), CURVE_LABEL_P), offset: [-CURVE_LABEL_GAP, 0] },
      CURVE_LABEL_PX,
      'right',
      INK,
    ),
  );

  // ================= 같은 시간마다 찍은 자국 =================
  const elapsed = pushElapsed(tl);
  const stamps = stampMomenta(elapsed, k);
  if (live > 0 && stamps.length > 0) {
    const onAxes: Vec2[][] = [];
    stamps.forEach((p, i) => {
      const at = plotPoint(relativisticSpeed(p, k), p);
      // 세로축 — 운동량. 같은 힘이라 고르게 쌓인다.
      onAxes.push([
        [0, at[1]],
        [STAMP_TICK_LEN, at[1]],
      ]);
      // 가로축 — 속도. c 앞에서 촘촘해진다.
      onAxes.push([
        [at[0], 0],
        [at[0], STAMP_TICK_LEN],
      ]);
      const mark: Body = {
        type: 'body',
        id: `stamp-${i}`,
        shape: 'circle',
        pos: at,
        size: STAMP_R,
        outline: 'background',
        glow: false,
        opacity: live,
        style: ACCENT,
      };
      out.push(mark);
    });
    const ticks: LineSet = { type: 'lineSet', id: 'stamp-ticks', lines: onAxes, width: STAMP_TICK_PX, opacity: live, style: ACCENT };
    out.push(ticks);
  }

  // ================= 미는 물체 =================
  if (live > 0) {
    const p = momentumAfter(elapsed, k);
    const here = plotPoint(relativisticSpeed(p, k), p);
    const ghostX = classicalSpeed(p, k) * PLOT.perC;

    // 지금 속도를 가로축으로 떨어뜨린다.
    if (here[1] > DOT_R) {
      const drop: Trajectory = {
        type: 'trajectory',
        id: 'speed-drop',
        points: [here, [here[0], 0]],
        width: GUIDE_PX,
        opacity: GUIDE_OPACITY * live,
        style: { ...MUTED, lineStyle: 'dotted' },
      };
      out.push(drop);
    }

    // 같은 운동량의 「고전이라면」 점 — 같은 높이의 직선 위. 판 밖으로 나가면 화살표가 그쪽을 가리킨다.
    if (ghostX - here[0] > LINK_MIN) {
      if (ghostX <= xEnd) {
        const link: Trajectory = {
          type: 'trajectory',
          id: 'classical-link',
          points: [here, [ghostX, here[1]]],
          width: GUIDE_PX,
          opacity: GUIDE_OPACITY * live,
          style: { ...MUTED, lineStyle: 'dotted' },
        };
        out.push(link);
      } else {
        const beyond: Vector = {
          type: 'vector',
          id: 'classical-beyond',
          from: here,
          delta: [xEnd - here[0], 0],
          headSize: LINK_HEAD,
          width: GUIDE_PX,
          opacity: GUIDE_OPACITY * live,
          style: { ...MUTED, lineStyle: 'dotted' },
        };
        out.push(beyond);
      }
    }
    if (ghostX <= xEnd) {
      const ghost: Body = {
        type: 'body',
        id: 'classical-body',
        shape: 'circle',
        pos: [ghostX, here[1]],
        size: GHOST_R,
        fill: 'none',
        outline: 'role',
        glow: false,
        opacity: live,
        style: MUTED,
      };
      out.push(ghost);
    }

    const body: Body = {
      type: 'body',
      id: 'pushed-body',
      shape: 'circle',
      pos: here,
      size: DOT_R,
      outline: 'background',
      glow: false,
      opacity: live,
      style: INK,
    };
    out.push(body);
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
