// ========================================================================
// scattering — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// 위아래 두 레인. 레인마다 빛 없음 판(region `light: 0`) 위에 —
// 흰빛 줄기(물결 trajectory, 물결 간격 = 표시 파장) · 입자(body) · 입자에서 바깥으로
// 날아가는 흩어진 빛의 획(lineSet, 빛 채널 색) · 물결 간격 자(λ) · 무리에서 떨어진
// 입자 하나와 그 둘레에 그은 흩는 방향 분포의 윤곽(점선 닫힌 trajectory).
// 왼쪽 바깥(테마 바탕)에 레인 이름표.
//
// 빛의 색은 테마 역할이 아니라 물리량이라 모두 `light` 채널이다 (C2). 흰빛이 라이트
// 바탕에서 사라지지 않도록 레인을 빛 없음 판 위에 둔다 (G92).
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
  hash01,
  largeAngle,
  largeDensity,
  placeParticles,
  readConstants,
  scatteredHue,
  smallAngle,
  smallDensity,
  type Particle,
  type ScatteringConstants,
} from './physics';
import { text, type ScatteringMessageKey } from './schema';
import type { ScatteringState } from './state';

// ---- 배치(월드) ----

/** 레인 판의 가로 범위. 줄기는 왼쪽 끝에서 들어와 오른쪽 끝으로 나간다. */
const PANEL_X0 = -5.2;
const PANEL_X1 = 8.4;
/** 위 · 아래 레인의 가운데 높이와 판의 반높이. */
const LANE_Y_SMALL = 1.02;
const LANE_Y_LARGE = -1.02;
const LANE_HALF = 0.9;
/** 입자가 떠 있는 구역 — 가로 범위와 줄기 위아래 반높이. */
const ZONE_X0 = -2.0;
const ZONE_X1 = 2.4;
const ZONE_HALF = 0.42;
/** 입자 가로 흔들림 — 칸 폭에 대한 몫. */
const ZONE_JITTER = 0.3;
/** 두 레인이 같은 난수 수열을 쓰지 않게 입자 번호에 더하는 값. */
const LARGE_SALT = 500;
/**
 * 외딴 입자 — 무리에서 떨어진 입자 하나의 x. 그 둘레에 흩는 방향 분포의 윤곽을 긋는다.
 * 번호는 레인 안 입자 번호와 겹치지 않게 띄운다.
 */
const SOLO_X = 6.1;
/**
 * 외딴 입자를 줄기 아래로 내리는 거리(월드). 물방울의 분포 윤곽은 앞쪽으로 가는 바늘꼴이라
 * 줄기 위에 놓으면 흰 줄기에 묻힌다. 줄기는 폭이 있는 빛이라 줄기 선에서 조금 떨어진 입자도
 * 빛을 받는다 — 무리의 입자들도 줄기 위아래 `ZONE_HALF` 안에 흩어져 있다.
 */
const SOLO_DROP = 0.38;
const SOLO_INDEX = 400;
/** 레인 이름표의 왼쪽 끝 x 와 가운데에서 위(제목) · 아래(설명)로 띄우는 거리. */
const LABEL_X = -8.35;
const LABEL_TITLE_LIFT = 0.2;
const LABEL_NOTE_DROP = 0.22;
/** 물결 간격 자 — 왼쪽 끝 x, 줄기 위로 띄우는 높이, 양끝 눈금 길이, 글자 띄움. */
const RULER_X = -3.6;
const RULER_LIFT = 0.26;
const RULER_TICK = 0.06;
const RULER_LABEL_GAP = 0.2;

/** 고정 경계. 레인 이름표부터 판 오른쪽 끝까지, 아래는 캡션 줄까지. */
const SCENE_BOUNDS: Bounds = { minX: -8.5, maxX: 8.55, minY: -2.55, maxY: 2.05 };

// ---- 모양 ----

/** 줄기 물결의 진폭(월드)과 표본 간격(물결 간격에 대한 몫). */
const WAVE_AMP = 0.07;
const WAVE_SAMPLE = 1 / 12;
/** 줄기 물결이 흘러가는 속력(월드/초) — 표현이다. */
const WAVE_DRIFT = 0.9;
/** 흩어진 빛 획의 길이(월드). */
const STROKE_LEN = 0.22;
/** 흩어진 빛 획이 한 번 날아가는 동안의 방향을 새로 뽑는 난수 번호 간격. */
const EMISSION_STRIDE = 7919;
/** 획 난수 번호의 시작 — 입자 자리 난수와 겹치지 않게. */
const STROKE_BASE = 100000;

/** 분포 윤곽 — 가장 센 방향의 길이(월드, 입자 둘레에서 잰다)와 표본 수. */
const LOBE_LEN = 0.9;
const LOBE_SAMPLES = 180;

/** 선 굵기(화면 px). */
const LOBE_PX = 1.5;
const BEAM_PX = 2.5;
const STROKE_PX = 2;
const RULER_PX = 1;
/** 글자 크기(화면 px). */
const TITLE_PX = 13;
const NOTE_PX = 12;
const LAMBDA_PX = 12;
/** 입자 빛 — 작은 입자는 점, 물방울은 옅은 원판. */
const SMALL_LIGHT = 0.8;
const LARGE_LIGHT = 0.3;
/** 물결 간격 자의 빛. */
const RULER_LIGHT = 0.6;

interface Lane {
  id: 'small' | 'large';
  y: number;
  /** 줄기가 들어오는 단계 id. */
  enter: string;
  radius: number;
  count: number;
  exponent: number;
  angle: (xi: number) => number;
  density: (theta: number) => number;
  title: ScatteringMessageKey;
  note: ScatteringMessageKey;
  salt: number;
}

function lanes(c: ScatteringConstants): Lane[] {
  return [
    {
      id: 'small',
      y: LANE_Y_SMALL,
      enter: 'smallIn',
      radius: c.smallRadius,
      count: c.smallCount,
      exponent: c.smallExponent,
      angle: smallAngle,
      density: smallDensity,
      title: 'label.small',
      note: 'label.smallNote',
      salt: 0,
    },
    {
      id: 'large',
      y: LANE_Y_LARGE,
      enter: 'largeIn',
      radius: c.largeRadius,
      count: c.largeCount,
      exponent: c.largeExponent,
      angle: (xi) => largeAngle(xi, c.largeAsymmetry),
      density: (th) => largeDensity(th, c.largeAsymmetry),
      title: 'label.large',
      note: 'label.largeNote',
      salt: LARGE_SALT,
    },
  ];
}

export function scene(params: {
  state: ScatteringState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('scattering: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const alpha = 1 - tl.at('fade');
  const out: Primitive[] = [];

  for (const lane of lanes(c)) {
    const y0 = lane.y - LANE_HALF;
    const y1 = lane.y + LANE_HALF;
    const clip = { min: [PANEL_X0, y0] as Vec2, max: [PANEL_X1, y1] as Vec2 };

    // 레인 이름표 — 판 바깥 테마 바탕 위.
    out.push({
      type: 'readout',
      id: `title-${lane.id}`,
      anchor: { world: [LABEL_X, lane.y + LABEL_TITLE_LIFT] },
      text: text(lane.title),
      chip: false,
      font: 'text',
      align: 'left',
      weight: 'bold',
      fontSize: TITLE_PX,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
    out.push({
      type: 'readout',
      id: `note-${lane.id}`,
      anchor: { world: [LABEL_X, lane.y - LABEL_NOTE_DROP] },
      text: text(lane.note),
      chip: false,
      font: 'text',
      align: 'left',
      fontSize: NOTE_PX,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });

    // 빛 없음 판.
    out.push({
      type: 'region',
      id: `panel-${lane.id}`,
      points: [
        [PANEL_X0, y0],
        [PANEL_X1, y0],
        [PANEL_X1, y1],
        [PANEL_X0, y1],
      ],
      fillOpacity: 1,
      light: 0,
    });

    // 줄기 — 왼쪽 끝에서 들어와 앞머리가 오른쪽으로 간다. 들어오는 단계는 선형이라
    // 앞머리 x 와 입자마다 닿는 시각이 한 셈에서 나온다.
    const enterStart = tl.start(lane.enter);
    const enterDur = tl.duration(lane.enter);
    const front = PANEL_X0 + tl.at(lane.enter) * (PANEL_X1 - PANEL_X0);
    if (front > PANEL_X0) {
      const pts: Vec2[] = [];
      const dx = c.waveWorld * WAVE_SAMPLE;
      const k = (2 * Math.PI) / c.waveWorld;
      for (let x = PANEL_X0; x < front; x += dx) {
        pts.push([x, lane.y + WAVE_AMP * Math.sin(k * (x - WAVE_DRIFT * tl.t))]);
      }
      pts.push([front, lane.y + WAVE_AMP * Math.sin(k * (front - WAVE_DRIFT * tl.t))]);
      out.push({
        type: 'trajectory',
        id: `beam-${lane.id}`,
        points: pts,
        width: BEAM_PX,
        light: 1,
        opacity: alpha,
      });
    }

    // 물결 간격 자 — 물결 한 칸 위에 걸친 괄호와 `λ`.
    const rx1 = RULER_X + c.waveWorld;
    const ry = lane.y + RULER_LIFT;
    out.push({
      type: 'lineSet',
      id: `ruler-${lane.id}`,
      lines: [
        [
          [RULER_X, ry - RULER_TICK],
          [RULER_X, ry],
          [rx1, ry],
          [rx1, ry - RULER_TICK],
        ],
      ],
      width: RULER_PX,
      light: RULER_LIGHT,
    });
    out.push({
      type: 'readout',
      id: `lambda-${lane.id}`,
      anchor: { world: [(RULER_X + rx1) / 2, ry + RULER_LABEL_GAP] },
      text: text('label.lambda'),
      chip: true,
      font: 'text',
      italic: true,
      align: 'center',
      fontSize: LAMBDA_PX,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });

    // 입자.
    const soloY = lane.y - SOLO_DROP;
    const solo: Particle = { pos: [SOLO_X, soloY], index: lane.salt + SOLO_INDEX };
    const particles = [
      ...placeParticles(
        lane.count,
        { x0: ZONE_X0, x1: ZONE_X1, y: lane.y, half: ZONE_HALF },
        ZONE_JITTER,
        c.seed,
        lane.salt,
      ),
      solo,
    ];
    const hue = scatteredHue(lane.exponent);
    const arrival = (x: number): number => enterStart + enterDur * ((x - PANEL_X0) / (PANEL_X1 - PANEL_X0));

    // 외딴 입자 둘레의 방향 분포 윤곽 — 그 입자에 줄기가 닿은 뒤. 가장 센 방향을 `LOBE_LEN` 으로 맞춘다.
    if (tl.u >= arrival(SOLO_X)) {
      let peak = 0;
      for (let i = 0; i < LOBE_SAMPLES; i++) peak = Math.max(peak, lane.density((2 * Math.PI * i) / LOBE_SAMPLES));
      const lobe: Vec2[] = [];
      for (let i = 0; i < LOBE_SAMPLES; i++) {
        const th = (2 * Math.PI * i) / LOBE_SAMPLES;
        const r = lane.radius + (LOBE_LEN * lane.density(th)) / peak;
        lobe.push([SOLO_X + r * Math.cos(th), soloY + r * Math.sin(th)]);
      }
      out.push({
        type: 'trajectory',
        id: `lobe-${lane.id}`,
        points: lobe,
        closed: true,
        width: LOBE_PX,
        style: { lineStyle: 'dashed' },
        light: { rgb: hue },
        opacity: alpha,
      });
    }
    for (const p of particles) {
      out.push({
        type: 'body',
        id: `particle-${lane.id}-${p.index}`,
        pos: p.pos,
        shape: 'circle',
        size: lane.radius,
        light: lane.id === 'small' ? SMALL_LIGHT : LARGE_LIGHT,
        glow: false,
        outline: 'none',
        opacity: alpha,
      });
    }

    // 흩어진 빛 획 — 줄기 앞머리가 입자에 닿은 뒤부터 입자 둘레에서 바깥으로 날아간다.
    // 한 번 다 날아가면(획 거리 `strokeReach`) 같은 번호의 획이 새 방향으로 다시 나간다.
    const lines: Vec2[][] = [];
    const opacities: number[] = [];
    const cycleLen = c.strokeReach;
    for (const p of particles) {
      const age = tl.u - arrival(p.pos[0]);
      if (age < 0) continue;
      for (let j = 0; j < c.strokesPerParticle; j++) {
        const m = p.index * c.strokesPerParticle + j;
        const travelled = age * c.strokeSpeed - hash01(c.seed, STROKE_BASE + m) * cycleLen;
        if (travelled < 0) continue;
        const emission = Math.floor(travelled / cycleLen);
        const s = travelled - emission * cycleLen;
        const th = lane.angle(hash01(c.seed, STROKE_BASE + m + EMISSION_STRIDE * (emission + 1)));
        const dir: Vec2 = [Math.cos(th), Math.sin(th)];
        const a = lane.radius + s;
        const b = a + STROKE_LEN;
        lines.push([
          [p.pos[0] + dir[0] * a, p.pos[1] + dir[1] * a],
          [p.pos[0] + dir[0] * b, p.pos[1] + dir[1] * b],
        ]);
        opacities.push(1 - s / cycleLen);
      }
    }
    if (lines.length > 0) {
      out.push({
        type: 'lineSet',
        id: `scatter-${lane.id}`,
        lines,
        opacities,
        width: STROKE_PX,
        light: { rgb: hue },
        opacity: alpha,
        clip,
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
