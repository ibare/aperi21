// ========================================================================
// double-slit-with-electrons — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더를 쓰지 않는다.
//
// - 전자 파동 |ψ|² — `scalarField` 하나 (원본 5 px 격자 88 × 54)
// - 쌓인 점 — `particleSystem` 하나 (네모 점, 수천 개)
// - 방금 도착한 전자 — `body` 원 하나, 강조색은 이 뜻에만
// - 도착 위치별 개수 막대 — `lineSet` 하나 (구간마다 가로 선)
// - 검출 화면 · 전자원 · 슬릿 벽 — `region` · `body` rect
// - 이름표 셋 · 도착 개수 — `readout`
// 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
// ========================================================================

import type {
  Body,
  EnvironmentDef,
  LineSet,
  ParticleSystem,
  Primitive,
  Readout,
  ScalarField,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import {
  BAR_MAX,
  BIN_H,
  CY,
  LABEL_Y,
  NBINS,
  PLATE_BOT,
  PLATE_TOP,
  PLATE_W,
  SEED,
  SLIT_HALF_SEP,
  SLIT_WIDTH,
  WAVE_COLS,
  WAVE_MAX,
  WAVE_MIN,
  WAVE_ROWS,
  X_BARS,
  X_PLATE,
  X_SRC,
  X_WALL,
  arrivedBy,
  buildElectrons,
  flight,
  waveField,
} from './model';
import { SCENE_BOUNDS, text } from './schema';
import type { DoubleSlitWithElectronsState } from './state';

/**
 * 한 주기에 도착하는 전자 목록. 선언 상수(시드)에서 나온 고정 목록이라 모듈 상수로 둔다 —
 * 인스턴스 상태가 아니다 (원칙 6). 매 주기 같은 점이 같은 자리에 떨어진다.
 */
const ELECTRONS = buildElectrons(SEED);

/** 쌓인 점 반변(화면 px). 원본 1.6 px 네모. */
const DOT_HALF_PX = 0.8;
/** 방금 도착한 전자 반지름(월드). 원본 3.5 px. */
const LATEST_RADIUS = 3.5;
/** 막대 굵기(화면 px). 원본 구간 4 px 에서 1 px 틈을 뺀 3 px. */
const BAR_WIDTH_PX = BIN_H - 1;
/** 쌓인 점 · 막대의 짙기. 원본 알파 0.55 · 0.4. */
const DOT_OPACITY = 0.55;
const BAR_OPACITY = 0.4;
/** 이름표 글자 크기(화면 px). 원본 13 px. */
const LABEL_FONT_PX = 13;

/** 세 자리마다 쉼표. 원본 `toLocaleString('ko-KR')` 와 같은 모양이다 (en 도 같다). */
function grouped(n: number): string {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function label(id: string, key: Parameters<typeof text>[0], pos: Vec2, align: Readout['align'], vars?: Readout['vars']): Readout {
  return {
    type: 'readout',
    id,
    anchor: { world: pos },
    text: text(key),
    ...(vars ? { vars } : {}),
    chip: false,
    align,
    font: 'text',
    fontSize: LABEL_FONT_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  };
}

function wallPiece(id: string, top: number, bottom: number): Body {
  return {
    type: 'body',
    id,
    pos: [X_WALL, (top + bottom) / 2],
    shape: 'rect',
    size: [6, top - bottom],
    outline: 'none',
    style: { colorRole: 'ink', emphasis: 'strong' },
  };
}

export function scene(params: {
  state: DoubleSlitWithElectronsState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { timeline } = params;
  if (!timeline) throw new Error('double-slit-with-electrons: schema.timeline 이 선언되어야 한다');
  const out: Primitive[] = [];

  const u = timeline.u;
  const n = arrivedBy(ELECTRONS, u);
  // 되감기 직전 점이 사라지는 1.5 초.
  const fk = 1 - timeline.at('fade');

  // ---- 검출 화면 ----
  // 옅은 판 + 가는 테두리. 판은 옅은 면 톤 역할이 없어 `muted` 를 옅게 깐다 (장부 G08).
  out.push({
    type: 'region',
    id: 'plate',
    points: [
      [X_PLATE, PLATE_TOP],
      [X_PLATE + PLATE_W, PLATE_TOP],
      [X_PLATE + PLATE_W, PLATE_BOT],
      [X_PLATE, PLATE_BOT],
    ],
    opaque: true,
    fillOpacity: 0.08,
    style: { colorRole: 'muted', emphasis: 'medium' },
  });
  out.push({
    type: 'body',
    id: 'plate-edge',
    pos: [X_PLATE + PLATE_W / 2, (PLATE_TOP + PLATE_BOT) / 2],
    shape: 'rect',
    size: [PLATE_W - 1, PLATE_TOP - PLATE_BOT - 1],
    fill: 'none',
    outline: 'line',
  });

  // ---- 전자 파동 ----
  // 날아가는 전자 하나의 |ψ|². 벽 앞은 원형 묶음, 벽 뒤는 두 슬릿 성분의 간섭 합.
  // 한 가지 푸른색(`secondary`)의 명암 — 값이 크기를 보이는 것이지 대상을 가르지 않는다.
  const fl = flight(ELECTRONS, u);
  if (fl) {
    const wave: ScalarField = {
      type: 'scalarField',
      id: 'wave',
      min: WAVE_MIN,
      max: WAVE_MAX,
      cols: WAVE_COLS,
      rows: WAVE_ROWS,
      values: waveField(fl.s, fl.vis),
      range: [0, 1],
      colors: { high: 'secondary' },
    };
    out.push(wave);
  }

  // ---- 전자원 ----
  out.push({
    type: 'body',
    id: 'source',
    pos: [X_SRC - 8, CY],
    shape: 'rect',
    size: [16, 22],
    outline: 'none',
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push(label('label-source', 'label.source', [X_SRC - 6, LABEL_Y], 'left'));

  // ---- 이중 슬릿 벽 ----
  const gapTop1 = CY + SLIT_HALF_SEP + SLIT_WIDTH / 2;
  const gapBot1 = CY + SLIT_HALF_SEP - SLIT_WIDTH / 2;
  const gapTop2 = CY - SLIT_HALF_SEP + SLIT_WIDTH / 2;
  const gapBot2 = CY - SLIT_HALF_SEP - SLIT_WIDTH / 2;
  out.push(wallPiece('wall-top', PLATE_TOP, gapTop1));
  out.push(wallPiece('wall-mid', gapBot1, gapTop2));
  out.push(wallPiece('wall-bottom', gapBot2, PLATE_BOT));
  out.push(label('label-slits', 'label.slits', [X_WALL, LABEL_Y], 'center'));

  // ---- 쌓인 점 ----
  // 방금 도착한 하나는 빼고 강조색 원으로 따로 둔다.
  if (n > 1 && fk > 0) {
    const positions: Vec2[] = new Array(n - 1);
    for (let i = 0; i < n - 1; i++) positions[i] = [ELECTRONS.xs[i]!, ELECTRONS.ys[i]!];
    const dots: ParticleSystem = {
      type: 'particleSystem',
      id: 'dots',
      positions,
      sizes: DOT_HALF_PX,
      shape: 'square',
      opacity: DOT_OPACITY * fk,
      style: { colorRole: 'ink', emphasis: 'strong' },
    };
    out.push(dots);
  }

  // ---- 방금 도착한 전자 ----
  // 강조색은 이 한 뜻에만 쓴다.
  if (n > 0 && fk > 0) {
    out.push({
      type: 'body',
      id: 'latest',
      pos: [ELECTRONS.xs[n - 1]!, ELECTRONS.ys[n - 1]!],
      shape: 'circle',
      size: LATEST_RADIUS,
      outline: 'none',
      glow: false,
      opacity: fk,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }

  // ---- 도착 위치별 개수 막대 ----
  // 같은 점을 세로 4 px 구간마다 센 것. 가장 많은 구간을 기준으로 길이를 정한다.
  if (n > 0 && fk > 0) {
    const bins = new Array<number>(NBINS).fill(0);
    let binMax = 0;
    for (let i = 0; i < n; i++) {
      const b = ELECTRONS.bins[i]!;
      bins[b]! += 1;
      if (bins[b]! > binMax) binMax = bins[b]!;
    }
    const lines: Vec2[][] = [];
    for (let b = 0; b < NBINS; b++) {
      const len = (BAR_MAX * bins[b]!) / binMax;
      if (len <= 0) continue;
      const y = PLATE_TOP - (b * BIN_H + 0.5 + BAR_WIDTH_PX / 2);
      lines.push([
        [X_BARS, y],
        [X_BARS + len, y],
      ]);
    }
    const bars: LineSet = {
      type: 'lineSet',
      id: 'bars',
      lines,
      width: BAR_WIDTH_PX,
      opacity: BAR_OPACITY * fk,
      style: { colorRole: 'ink', emphasis: 'strong' },
    };
    out.push(bars);
  }

  // ---- 도착 개수 ----
  // 「하나씩」 과 「수천 개」 의 대비가 주장의 일부라 둔다.
  out.push(label('label-count', 'label.count', [X_PLATE + PLATE_W / 2, LABEL_Y], 'center', { n: grouped(n) }));

  return out;
}

/** 고정 경계. 상태를 보지 않으므로 매 프레임 같다 — 카메라가 흔들리지 않는다. */
export function boundsHint(): { minX: number; maxX: number; minY: number; maxY: number } {
  return { ...SCENE_BOUNDS };
}
