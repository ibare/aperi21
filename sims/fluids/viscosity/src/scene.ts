// ========================================================================
// viscosity — 장면 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 자유 렌더를 쓰지 않는다. 유체(`region`) · 층 경계와 판 눈금(`lineSet`) · 흐름 점
// (`particleSystem`) · 염료 토막(`lineSet`) · 판(`region`) · 끄는 힘(`vector`) ·
// 이름(`readout`) 이 모두 표준 어휘로 있다.
//
// 색: 두 유체는 같은 색이다 — 다른 것은 점성 하나이고, 그것을 색으로 칠하면 색이
// 설명을 가로챈다 (S-piece). 판은 먹색, 염료는 보조색 짙게. 강조색은 **끄는 힘**
// 한 가지 뜻에만 쓴다.
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
import { derive, forceLength, layerSpeed, ratioText, readConstants } from './physics';
import {
  BASE_THICK,
  DOT_SPACING,
  DYE_X,
  GAP,
  LANE_SPACING,
  LANE_WIDTH,
  PLATE_OVERHANG,
  PLATE_THICK,
  PLATE_TICK,
  SCENE_BOUNDS,
  text,
} from './schema';
import type { ViscosityState } from './state';

/** 레인 이름을 유체 왼쪽 끝에서 띄우는 거리(화면 px). */
const LANE_LABEL_OFFSET: Vec2 = [-14, -9];
/** 점성 기호를 레인 이름 아래로 내리는 거리(화면 px). */
const ETA_LABEL_OFFSET: Vec2 = [-14, 11];
/** 힘 기호를 화살표 머리에서 띄우는 거리(화면 px). */
const FORCE_LABEL_OFFSET: Vec2 = [8, 0];
/** 힘 화살표 위 F 칸 눈금의 반높이(월드). */
const FORCE_TICK_HALF = 0.07;

const rect = (x0: number, x1: number, y0: number, y1: number): Vec2[] => [
  [x0, y0],
  [x1, y0],
  [x1, y1],
  [x0, y1],
];

/** 0 이상 m 미만으로 감는다. */
const wrap = (x: number, m: number): number => ((x % m) + m) % m;

/** 레인 하나 — 아래 레인(끈적한 유체)은 y = 0 에서, 위 레인(묽은 유체)은 그 위에서 시작한다. */
interface Lane {
  id: 'thin' | 'thick';
  /** 유체 아랫면(월드 y). */
  y0: number;
  viscosity: number;
}

export function scene(params: {
  state: ViscosityState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { timeline } = params;
  if (!timeline) throw new Error('viscosity: schema.timeline 이 선언되어야 한다');
  const c = readConstants(params.stage);
  const r = derive(timeline);
  const op = r.opacity;
  const ratio = ratioText(c);

  const ink = { colorRole: 'ink', emphasis: 'strong' } as const;
  const muted = { colorRole: 'muted', emphasis: 'strong' } as const;
  const accent = { colorRole: 'accent', emphasis: 'strong' } as const;
  const g: Primitive[] = [];

  const laneStep = GAP + PLATE_THICK + LANE_SPACING + BASE_THICK;
  const lanes: readonly Lane[] = [
    { id: 'thin', y0: laneStep, viscosity: c.viscosityThin },
    { id: 'thick', y0: 0, viscosity: c.viscosityThick },
  ];
  const layerH = GAP / c.layerCount;
  const plateShift = c.plateSpeed * r.dragTime;
  const thinForce = forceLength(c.viscosityThin, c);

  for (const lane of lanes) {
    const y0 = lane.y0;
    const y1 = y0 + GAP;
    const plateX0 = -PLATE_OVERHANG;
    const plateX1 = LANE_WIDTH + PLATE_OVERHANG;

    // ---- 유체 ----
    g.push({
      type: 'region',
      id: `${lane.id}-fluid`,
      points: rect(0, LANE_WIDTH, y0, y1),
      opaque: true,
      opacity: op,
      style: { colorRole: 'secondary', emphasis: 'medium' },
    });

    // ---- 층 경계 — 층이 서로 미끄러지는 면 ----
    const seams: Vec2[][] = [];
    for (let i = 1; i < c.layerCount; i++) {
      const y = y0 + i * layerH;
      seams.push([
        [0, y],
        [LANE_WIDTH, y],
      ]);
    }
    g.push({
      type: 'lineSet',
      id: `${lane.id}-seams`,
      lines: seams,
      width: 1,
      opacity: op * 0.45,
      style: muted,
    });

    // ---- 흐름 점 — 층마다 한 줄. 제 층의 빠르기로 흘러간다 ----
    const dots: Vec2[] = [];
    const perRow = Math.floor(LANE_WIDTH / DOT_SPACING);
    for (let i = 0; i < c.layerCount; i++) {
      const y = y0 + (i + 0.5) * layerH;
      const shift = layerSpeed(i, c) * r.dragTime;
      // 염료와 겹치지 않게 반 칸 어긋나게 둔다.
      for (let k = 0; k < perRow; k++) {
        dots.push([wrap(DYE_X + (k + 0.5) * DOT_SPACING + shift, LANE_WIDTH), y]);
      }
    }
    g.push({
      type: 'particleSystem',
      id: `${lane.id}-dots`,
      positions: dots,
      sizes: 1.6,
      opacity: op * 0.55,
      style: { colorRole: 'ink', emphasis: 'subtle' },
    });

    // ---- 염료 토막 — 처음 곧은 한 줄이 층마다 제 빠르기로 흘러가 계단이 된다 ----
    const dye: Vec2[][] = [];
    for (let i = 0; i < c.layerCount; i++) {
      const x = DYE_X + layerSpeed(i, c) * r.dragTime;
      dye.push([
        [x, y0 + i * layerH],
        [x, y0 + (i + 1) * layerH],
      ]);
    }
    g.push({
      type: 'lineSet',
      id: `${lane.id}-dye`,
      lines: dye,
      width: 3,
      opacity: op,
      style: { colorRole: 'secondary', emphasis: 'strong' },
    });

    // ---- 붙박인 아랫판 — 빗금으로 「고정」 을 보인다 ----
    g.push({
      type: 'region',
      id: `${lane.id}-base`,
      points: rect(plateX0, plateX1, y0 - BASE_THICK, y0),
      fill: 'hatch',
      fillOpacity: 0.85,
      opaque: true,
      opacity: op,
      style: ink,
    });

    // ---- 끌리는 윗판 — 판은 제자리에 보이고, 위의 눈금이 흘러가 움직임을 보인다 ----
    g.push({
      type: 'region',
      id: `${lane.id}-plate`,
      points: rect(plateX0, plateX1, y1, y1 + PLATE_THICK),
      fillOpacity: 1,
      opaque: true,
      opacity: op,
      style: ink,
    });
    const ticks: Vec2[][] = [];
    const tickTop = y1 + PLATE_THICK + PLATE_TICK.height;
    const tickCount = Math.ceil((plateX1 - plateX0) / PLATE_TICK.spacing);
    for (let k = 0; k < tickCount; k++) {
      const x = plateX0 + wrap(k * PLATE_TICK.spacing + plateShift, tickCount * PLATE_TICK.spacing);
      if (x > plateX1) continue;
      ticks.push([
        [x, y1 + PLATE_THICK],
        [x, tickTop],
      ]);
    }
    g.push({
      type: 'lineSet',
      id: `${lane.id}-plate-ticks`,
      lines: ticks,
      width: 1.5,
      opacity: op,
      style: ink,
    });

    // ---- 레인 이름과 점성 기호 ----
    g.push({
      type: 'readout',
      id: `${lane.id}-name`,
      anchor: { world: [0, (y0 + y1) / 2], offset: LANE_LABEL_OFFSET },
      text: text(lane.id === 'thin' ? 'label.thin' : 'label.thick'),
      chip: false,
      font: 'text',
      fontSize: 13,
      align: 'right',
      opacity: op,
      style: ink,
    });
    g.push({
      type: 'readout',
      id: `${lane.id}-eta`,
      anchor: { world: [0, (y0 + y1) / 2], offset: ETA_LABEL_OFFSET },
      text: text(lane.id === 'thin' ? 'label.viscosity' : 'label.viscosityTimes'),
      vars: { n: ratio },
      chip: false,
      font: 'mono',
      italic: true,
      fontSize: 13,
      align: 'right',
      opacity: op,
      style: muted,
    });

    // ---- 끄는 힘 — 판이 끌리는 동안만 ----
    if (r.pulling) {
      const plateY = y1 + PLATE_THICK / 2;
      const len = forceLength(lane.viscosity, c);
      g.push({
        type: 'vector',
        id: `${lane.id}-pull`,
        from: [plateX1, plateY],
        delta: [len, 0],
        opacity: op,
        style: accent,
      });
      g.push({
        type: 'readout',
        id: `${lane.id}-pull-name`,
        anchor: { world: [plateX1 + len, plateY], offset: FORCE_LABEL_OFFSET },
        text: text(lane.id === 'thin' ? 'label.force' : 'label.forceTimes'),
        vars: { n: ratio },
        chip: false,
        font: 'mono',
        italic: true,
        weight: 'bold',
        fontSize: 14,
        align: 'left',
        opacity: op,
        style: accent,
      });

      // 끈적한 쪽 화살표에 F 한 칸마다 금을 긋는다 — 「F 가 몇 개」 로 읽힌다.
      if (r.comparing && lane.id === 'thick') {
        const marks: Vec2[][] = [];
        for (let k = 1; k * thinForce < len - thinForce * 0.5; k++) {
          const x = plateX1 + k * thinForce;
          marks.push([
            [x, plateY - FORCE_TICK_HALF],
            [x, plateY + FORCE_TICK_HALF],
          ]);
        }
        g.push({
          type: 'lineSet',
          id: 'thick-pull-units',
          lines: marks,
          width: 1.5,
          opacity: op,
          style: accent,
        });
      }
    }
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return g;
}

/** 고정 경계. 매 프레임 같은 값이라 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
