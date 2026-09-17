// ========================================================================
// electromagnetic-wave — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// - 자기장 ⊙ / ⊗ → 고리 · X 획은 `lineSet` 하나, ⊙ 가운데 점은 `particleSystem` 하나.
// - 전기력선 → `lineSet` 하나. 흐름 함수 등고선 선분은 physics 가 뽑는다 (G66).
// - 안테나 → `lineSet` 하나(세로 선).
// - 흔들리는 전하 → `particleSystem` 하나(두 점, 강조색).
//
// 강조색은 흔들리는 전하 하나에만 쓴다. 장은 먹(전기) · 회색(자기)으로 원천과 가른다.
// ========================================================================

import type { Bounds, LineSet, ParticleSystem, SceneGraph, TimelineFrame, Vec2 } from '@aperi21/schema';
import { dipoleMoment, fieldLineSegments, magneticSymbols, toWorld, type Drive } from './physics';
import { ANTENNA, B_SYMBOLS, CAPTION_BAND, CHARGE, DIPOLE, STAGE, WIDTHS } from './schema';
import type { ElectromagneticWaveState } from './state';

/** 작은 원 고리를 다각형으로 표본하는 개수 (G28). */
const RING_SAMPLES = 20;

function ring(c: Vec2, r: number): Vec2[] {
  const pts: Vec2[] = [];
  for (let k = 0; k <= RING_SAMPLES; k++) {
    const a = (2 * Math.PI * k) / RING_SAMPLES;
    pts.push([c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]);
  }
  return pts;
}

/** 시간표 단계 경계에서 흔들기 경계를 읽는다. 단계 이름은 schema.timeline 과 같다. */
function driveOf(tl: TimelineFrame): Drive {
  return {
    period: tl.period,
    upStart: tl.start('rampUp'),
    upEnd: tl.end('rampUp'),
    downStart: tl.start('rampDown'),
    downEnd: tl.end('rampDown'),
  };
}

export function scene(params: { state: ElectromagneticWaveState; timeline?: TimelineFrame }): SceneGraph {
  const { timeline } = params;
  if (!timeline) throw new Error('electromagnetic-wave: schema.timeline 이 선언되어야 한다');
  const drive = driveOf(timeline);
  // 원천 시각 — 주기 안 시각. 지연 시각은 physics 가 주기로 접는다.
  const tSrc = timeline.u;

  // ---- 자기장 기호 ----
  const symbols = magneticSymbols(drive, tSrc);
  const strokes: Vec2[][] = [];
  const dots: Vec2[] = [];
  const dotSizes: number[] = [];
  for (const s of symbols) {
    const [x, y] = s.pos;
    if (s.out) {
      strokes.push(ring(s.pos, s.radius));
      dots.push(s.pos);
      dotSizes.push(Math.max(B_SYMBOLS.dotMin, s.radius * B_SYMBOLS.dotRatio));
    } else {
      const q = s.radius * B_SYMBOLS.crossRatio;
      strokes.push([[x - q, y - q], [x + q, y + q]]);
      strokes.push([[x + q, y - q], [x - q, y + q]]);
    }
  }
  const bStrokes: LineSet = {
    type: 'lineSet',
    id: 'b-symbols',
    lines: strokes,
    width: WIDTHS.bSymbol,
    style: { colorRole: 'muted', emphasis: 'strong' },
  };
  const bDots: ParticleSystem = {
    type: 'particleSystem',
    id: 'b-dots',
    positions: dots,
    sizes: dotSizes,
    style: { colorRole: 'muted', emphasis: 'strong' },
  };

  // ---- 전기력선 ----
  const eLines: LineSet = {
    type: 'lineSet',
    id: 'e-lines',
    lines: fieldLineSegments(drive, tSrc),
    width: WIDTHS.fieldLine,
    style: { colorRole: 'ink', emphasis: 'strong' },
  };

  // ---- 안테나 ----
  const antenna: LineSet = {
    type: 'lineSet',
    id: 'antenna',
    lines: [[toWorld(DIPOLE.x, DIPOLE.y - ANTENNA.halfLength), toWorld(DIPOLE.x, DIPOLE.y + ANTENNA.halfLength)]],
    width: WIDTHS.antenna,
    style: { colorRole: 'muted', emphasis: 'strong' },
  };

  // ---- 흔들리는 전하 ----
  const d = CHARGE.swing * dipoleMoment(drive, tSrc);
  const charges: ParticleSystem = {
    type: 'particleSystem',
    id: 'charges',
    positions: [toWorld(DIPOLE.x, DIPOLE.y - d), toWorld(DIPOLE.x, DIPOLE.y + d)],
    sizes: CHARGE.radius,
    style: { colorRole: 'accent', emphasis: 'strong' },
  };

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`). id 'caption' 을 두지 않는다.
  return [bStrokes, bDots, eLines, antenna, charges];
}

/** 고정 경계 — 원본 캔버스 그대로에 아래 캡션 띠를 더한다. 매 프레임 같은 값 (S-piece). */
export function boundsHint(): Bounds {
  return { minX: 0, maxX: STAGE.width, minY: -CAPTION_BAND, maxY: STAGE.height };
}
