// ========================================================================
// mass-spectrometer — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// 겹침은 scene 에 쓴 순서다(`drawOrder: 'scene'`):
//
//   ⊙ 무늬 · B 표식 → 판 · 이온원 → 두 궤적 → 떨어진 자리 → 이온 → 이름표
//
// 두 이온은 같은 대상(이온)이라 같은 먹색이다 — 둘을 가르는 것은 핵종 기호 표식과 반원의
// 크기다 (S-piece — 역할색을 범례로 쓰지 않는다). 강조색(accent)은 한 뜻에만 쓴다 —
// 이온이 판에 떨어진 자리.
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
import { IONS, ionAt, ionPath, radiusOf, readConstants, type MassSpectrometerConstants } from './physics';
import { SCENE_BOUNDS, text } from './schema';
import type { MassSpectrometerState } from './state';

/** ⊙ 무늬 간격 · 고리 반지름 · 가운데 점 반지름(월드). */
const FIELD_MARK_STEP = 0.55;
const FIELD_MARK_RADIUS = 0.07;
const FIELD_DOT_RADIUS = 0.014;
/** ⊙ 고리 · 가운데 점 표본 수 (G28). */
const FIELD_MARK_SAMPLES = 16;
const FIELD_DOT_SAMPLES = 6;
/** ⊙ 무늬 선 굵기(화면 px). */
const FIELD_MARK_WIDTH_PX = 1;
/** B 표식 — 무늬 영역 왼쪽 위 모서리에서 띄움(화면 px). */
const B_LABEL_OFFSET_PX: Vec2 = [-16, 0];

/** 판 두께(월드). 판 윗면이 y = 0 이다. */
const PLATE_THICKNESS = 0.08;
/** 이온원 크기(월드). 빔 시작점 바로 밑에 붙는다. */
const SOURCE_SIZE: Vec2 = [0.36, 0.28];

/** 궤적 굵기(화면 px). */
const PATH_WIDTH_PX = 2.5;

/** 떨어진 자리 표시 — 판 윗면에서 아래로 박힌 짧은 막대(월드). 위는 이온이 덮으므로 판 밑으로 낸다. */
const SPOT_SIZE: Vec2 = [0.07, 0.26];

/** 이온 원판 반지름 · 부호 획 반 길이(월드). */
const ION_RADIUS = 0.085;
const SIGN_ARM = 0.05;

/** 핵종 기호 글자 크기 · 이온에서 띄우는 거리(화면 px). */
const LABEL_PX = 14;
const LABEL_GAP_PX = 16;
/** 떨어진 이온의 기호 — 자리 막대 끝에서 옆 · 아래로 띄우는 거리(화면 px). */
const LANDED_LABEL_GAP_PX: Vec2 = [7, 4];
/** 이름표 정렬을 옆으로 돌리는 기준 — 반지름 방향 가로 성분이 이보다 크면 옆에 붙인다. */
const SIDE_ALIGN_THRESHOLD = 0.35;
/** 장 기호 글자 크기(화면 px). */
const SYMBOL_PX = 15;

const ink = { colorRole: 'ink', emphasis: 'strong' } as const;
const accent = { colorRole: 'accent', emphasis: 'strong' } as const;
const muted = { colorRole: 'muted', emphasis: 'strong' } as const;
const mutedSubtle = { colorRole: 'muted', emphasis: 'subtle' } as const;

function ring(c: Vec2, r: number, n: number): Vec2[] {
  const pts: Vec2[] = [];
  for (let k = 0; k <= n; k++) {
    const a = (2 * Math.PI * k) / n;
    pts.push([c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]);
  }
  return pts;
}

/** 종이 밖으로 나오는 균일한 자기장 — 판 위를 같은 간격의 ⊙ 로 채운다. */
function fieldMarks(c: MassSpectrometerConstants): Vec2[][] {
  const out: Vec2[][] = [];
  const cols = Math.floor((c.fieldMaxX - c.fieldMinX) / FIELD_MARK_STEP) + 1;
  const rows = Math.floor((c.fieldMaxY - c.fieldMinY) / FIELD_MARK_STEP) + 1;
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const p: Vec2 = [c.fieldMinX + i * FIELD_MARK_STEP, c.fieldMinY + j * FIELD_MARK_STEP];
      out.push(ring(p, FIELD_MARK_RADIUS, FIELD_MARK_SAMPLES));
      out.push(ring(p, FIELD_DOT_RADIUS, FIELD_DOT_SAMPLES));
    }
  }
  return out;
}

/** 이온에 새긴 + — 바탕색 두 획(G07 근사). 좌표는 `pos` 기준 월드, y 위. */
function plusPath(): string {
  const a = SIGN_ARM;
  return `M ${-a} 0 L ${a} 0 M 0 ${-a} L 0 ${a}`;
}

export function scene(params: {
  state: MassSpectrometerState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { timeline: tl, state } = params;
  if (!tl) throw new Error('mass-spectrometer: schema.timeline 이 선언되어야 한다');
  const c = readConstants(params.stage);
  const out: Primitive[] = [];

  // ---- 장 — ⊙ 무늬(B, 종이 밖) ----
  out.push({
    type: 'lineSet',
    id: 'field-b',
    lines: fieldMarks(c),
    width: FIELD_MARK_WIDTH_PX,
    style: mutedSubtle,
  });
  out.push({
    type: 'readout',
    id: 'field-b-label',
    anchor: { world: [c.fieldMinX, c.fieldMaxY], offset: B_LABEL_OFFSET_PX },
    text: text('label.fieldB'),
    chip: false,
    font: 'text',
    fontSize: SYMBOL_PX,
    italic: true,
    weight: 'bold',
    style: muted,
  });

  // ---- 판(입구 슬릿 양쪽) · 이온원 ----
  const plateY = -PLATE_THICKNESS / 2;
  const leftW = -c.slitHalf - c.plateLeft;
  const rightW = c.plateRight - c.slitHalf;
  out.push(
    {
      type: 'body',
      id: 'plate-left',
      pos: [c.plateLeft + leftW / 2, plateY],
      shape: 'rect',
      size: [leftW, PLATE_THICKNESS],
      outline: 'none',
      style: muted,
    },
    {
      type: 'body',
      id: 'plate-right',
      pos: [c.slitHalf + rightW / 2, plateY],
      shape: 'rect',
      size: [rightW, PLATE_THICKNESS],
      outline: 'none',
      style: muted,
    },
    {
      type: 'body',
      id: 'source',
      pos: [0, -c.beamLength - SOURCE_SIZE[1] / 2],
      shape: 'rect',
      size: SOURCE_SIZE,
      outline: 'none',
      style: muted,
    },
  );

  // ---- 두 이온 — 함께 떠나 같은 호 길이를 간다 ----
  const launched = tl.phase === 'enter' || tl.at('enter') > 0;
  if (!launched) return out;

  const tau = tl.at('enter') * tl.duration('enter') + tl.at('split') * tl.duration('split');
  const op = 1 - tl.at('fade');
  const radii = IONS.map((ion) => radiusOf(c, ion.mass(c)));
  const smallest = Math.min(...radii);
  const ions = IONS.map((ion, i) => {
    const mass = ion.mass(c);
    return {
      ...ion,
      r: radii[i]!,
      now: ionAt(c, mass, tau),
      path: ionPath(c, mass, tau),
      // 작은 원의 이름표는 원 안쪽, 큰 원의 것은 바깥쪽 — 서로의 궤적에 올라타지 않는다.
      side: radii[i] === smallest ? -1 : 1,
    };
  });

  for (const ion of ions) {
    out.push({
      type: 'trajectory',
      id: `path-${ion.id}`,
      points: ion.path,
      width: PATH_WIDTH_PX,
      opacity: op,
      style: ink,
    });
  }

  for (const ion of ions) {
    if (ion.now.phase !== 'landed') continue;
    out.push({
      type: 'body',
      id: `spot-${ion.id}`,
      pos: [2 * ion.r, -SPOT_SIZE[1] / 2],
      shape: 'rect',
      size: SPOT_SIZE,
      outline: 'none',
      opacity: op,
      style: accent,
    });
  }

  for (const ion of ions) {
    out.push(
      {
        type: 'body',
        id: `ion-${ion.id}`,
        pos: ion.now.pos,
        shape: 'circle',
        size: ION_RADIUS,
        glow: false,
        outline: 'none',
        opacity: op,
        style: ink,
      },
      {
        type: 'body',
        id: `ion-sign-${ion.id}`,
        pos: ion.now.pos,
        shape: 'custom',
        customPath: plusPath(),
        fill: 'none',
        outline: 'background',
        opacity: op,
      },
    );
  }

  // ---- 핵종 기호 — 날 때는 반지름 방향(작은 원은 안, 큰 원은 밖), 떨어지면 판 밑 ----
  for (const ion of ions) {
    if (ion.now.phase === 'landed') {
      out.push({
        type: 'readout',
        id: `label-${ion.id}`,
        // 두 자리가 가까워 기호를 가운데 두면 붙는다 — 작은 원은 막대 왼쪽, 큰 원은 오른쪽.
        anchor: {
          world: [2 * ion.r, -SPOT_SIZE[1]],
          offset: [ion.side * LANDED_LABEL_GAP_PX[0], LANDED_LABEL_GAP_PX[1]],
        },
        align: ion.side < 0 ? 'right' : 'left',
        text: text('label.ion'),
        vars: { a: ion.massText(state) },
        chip: false,
        font: 'text',
        fontSize: LABEL_PX,
        weight: 'bold',
        opacity: op,
        style: ink,
      });
      continue;
    }
    const dx = ion.side * ion.now.radial[0];
    const dy = ion.side * ion.now.radial[1];
    out.push({
      type: 'readout',
      id: `label-${ion.id}`,
      // 화면 px 는 y 가 아래다.
      anchor: { world: ion.now.pos, offset: [dx * LABEL_GAP_PX, -dy * LABEL_GAP_PX] },
      text: text('label.ion'),
        vars: { a: ion.massText(state) },
      chip: false,
      font: 'text',
      fontSize: LABEL_PX,
      weight: 'bold',
      align: dx > SIDE_ALIGN_THRESHOLD ? 'left' : dx < -SIDE_ALIGN_THRESHOLD ? 'right' : 'center',
      opacity: op,
      style: ink,
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`). id 'caption' 을 두지 않는다.
  return out;
}

/** 고정 경계 — 이온원부터 판 끝까지, 아래는 캡션 자리. */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
