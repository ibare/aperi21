import type { PrimitiveRenderer, RenderContext, Vec2, Vector } from '@aperi21/schema';
import { applyBaseMeta, finalizeBaseMeta, primitiveColor } from '../common';
import { drawChip } from '../kit/draw';

/** 화살촉 기본 크기(화면 px). */
const DEFAULT_HEAD = 8;
/**
 * 화살촉이 차지할 수 있는 최대 비율(화면 길이 대비).
 * 짧은 화살표에 고정 크기 머리를 붙이면 머리만 남아 방향이 읽히지 않는다.
 */
const HEAD_MAX_RATIO = 0.35;
/** 이 길이(화면 px) 아래는 그리지 않는다. */
const MIN_LENGTH = 2;
/**
 * 대시·점선 무늬(화면 px, 굵기 2 기준). 굵기에 비례해 늘인다.
 *
 * `trajectory` 와 같은 무늬를 쓰지만 값을 그쪽에서 가져오지 않는다 — 렌더러는 다른
 * 렌더러를 import 하지 않는다 (S-render). 공용으로 올릴 자리는 `kit/` 이고, 무늬를
 * 쓰는 어휘가 셋째로 늘면 그때 옮긴다.
 */
const DASH_PATTERN = [6, 5] as const;
const DOT_PATTERN = [0.5, 4] as const;
/** 이름을 놓는 자리 — 시작점에서 이만큼 간 곳. */
const LABEL_AT = 0.4;
/** 이름과 선 사이의 틈(화면 px). 글자 반 줄 만큼 더 띄워 획에 닿지 않게 한다. */
const LABEL_GAP = 6;
/** 이름의 굵기. 700 은 작은 글자에서 뭉친다. */
const LABEL_WEIGHT = 600;
/** 수직에 가까운지 가르는 문턱. 이 아래에서는 좌우로 갈라야 이름이 선에 겹치지 않는다. */
const VERTICAL_EPS = 1e-3;

/**
 * 이름을 놓을 쪽의 단위 법선(화면 좌표).
 *
 * 화면은 y 가 아래로 자라므로 보이는 대로의 반시계(`ccw`)는 `(uy, -ux)` 다.
 * `cw` · `ccw` 는 **화살표에 붙은 쪽**이라 화살표가 뒤집히면 이름도 따라 뒤집힌다.
 *
 * `auto` 는 그 반대다 — 매 프레임 둘 중 하나를 골라 이름이 **화면에서 늘 같은 쪽**
 * (선의 위쪽, 수직이면 오른쪽)에 남게 한다. 끌 수 있는 화살표는 방향이 뒤집히는데,
 * 쪽을 화살표에 붙여 고정하면 뒤집히는 순간 이름이 반대편으로 건너가 이웃 화살표
 * 위에 얹힌다.
 */
function labelNormal(side: NonNullable<Vector['labelSide']>, ux: number, uy: number): Vec2 {
  const ccw: Vec2 = [uy, -ux];
  const cw: Vec2 = [-uy, ux];
  if (side === 'cw') return cw;
  if (side === 'ccw') return ccw;
  // 위쪽(화면 y 가 작은 쪽)을 고른다. ccw 법선의 y 는 `-ux` 라 오른쪽으로 가는
  // 화살표면 ccw 가 위다. 수직이면 y 가 둘 다 0 이라 가름이 안 되므로 오른쪽을 고른다.
  if (Math.abs(ux) > VERTICAL_EPS) return ux > 0 ? ccw : cw;
  return uy > 0 ? ccw : cw;
}

/** 선언의 선 모양을 대시 무늬로. 굵기에 비례해 늘인다. */
function dashOf(style: Vector['style'], scale: number): number[] {
  const lineStyle = style?.lineStyle ?? 'solid';
  if (lineStyle === 'dashed') return DASH_PATTERN.map((d) => d * scale);
  if (lineStyle === 'dotted') return DOT_PATTERN.map((d) => d * scale);
  return [];
}

/** 이름·크기를 같은 글꼴로 — 둘은 같은 화살표를 읽는 두 벌의 글자다. */
function labelFont(rc: RenderContext, size: number): string {
  return `${LABEL_WEIGHT} ${size}px ${rc.theme.fontFamilyMono}`;
}

/**
 * Vector 렌더러. 본체 라인 + 화살촉 삼각형.
 * label 있으면 시작점에서 40% 지점에 배치. showMagnitude 는 중점에 |delta| 표시.
 *
 * `lineStyle` 은 **축에만** 건다 — 머리까지 점선으로 끊으면 삼각형의 윤곽이 무너져
 * 방향이 읽히지 않는다. 지난 잔상을 점선으로 남기는 화살표도 머리는 온전해야 한다.
 */
export const renderVector: PrimitiveRenderer = (rc, p0) => {
  const p = p0 as Vector;
  applyBaseMeta(rc, p);
  const c = rc.ctx;
  const to: Vec2 = [p.from[0] + p.delta[0], p.from[1] + p.delta[1]];
  const [sx0, sy0] = rc.toScreen(p.from);
  const [sx1, sy1] = rc.toScreen(to);
  const dx = sx1 - sx0;
  const dy = sy1 - sy0;
  const len = Math.hypot(dx, dy);
  if (len < MIN_LENGTH) {
    finalizeBaseMeta(rc, p);
    return;
  }
  const color = primitiveColor(rc, p, { role: 'accent', emphasis: 'medium' });
  const ux = dx / len;
  const uy = dy / len;

  const wanted = typeof p.headSize === 'number' ? p.headSize * rc.scale : DEFAULT_HEAD;
  const head = Math.min(wanted, len * HEAD_MAX_RATIO);

  c.strokeStyle = color;
  c.fillStyle = color;
  // 벡터는 굵다 — 화살표가 가늘면 방향보다 길이만 읽힌다. 선언이 `width` 로 덮는다.
  const base = rc.theme.strokeWidth.thick;
  c.lineWidth = p.width ?? base;
  c.lineCap = 'round';
  c.setLineDash(dashOf(p.style, Math.max(1, c.lineWidth / base)));
  c.beginPath();
  c.moveTo(sx0, sy0);
  // 화살촉 공간 남기기
  c.lineTo(sx1 - ux * head * 0.4, sy1 - uy * head * 0.4);
  c.stroke();
  // 머리와 칩 테두리까지 점선이 되지 않게 축을 그은 직후 되돌린다.
  c.setLineDash([]);

  // 화살촉
  c.beginPath();
  c.moveTo(sx1, sy1);
  c.lineTo(sx1 - ux * head - uy * head * 0.5, sy1 - uy * head + ux * head * 0.5);
  c.lineTo(sx1 - ux * head + uy * head * 0.5, sy1 - uy * head - ux * head * 0.5);
  c.closePath();
  c.fill();

  if (p.label) {
    const size = rc.theme.fontSize.regular;
    const [nx, ny] = labelNormal(p.labelSide ?? 'auto', ux, uy);
    const gap = LABEL_GAP + size / 2;
    const lx = sx0 + ux * len * LABEL_AT + nx * gap;
    const ly = sy0 + uy * len * LABEL_AT + ny * gap;
    const text = rc.i18n.resolve(p.label);
    if (p.labelChip) {
      // 값 칩과 **같은 헬퍼**로 그린다 — 같은 것이 어휘마다 다른 모양으로 나오면
      // 읽는 쪽이 둘을 다른 것으로 본다 (readout 의 `chip` 과 한 모양).
      drawChip(rc, lx, ly, text, size, color, labelFont(rc, size));
    } else {
      c.font = labelFont(rc, size);
      c.fillStyle = color;
      // 법선 방향으로 띄운 자리가 글의 **가운데**다. 왼쪽 정렬이면 화살표가 왼쪽을
      // 향할 때 이름이 선 위로 되돌아온다.
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText(text, lx, ly);
    }
  }

  if (p.showMagnitude) {
    c.font = `${rc.theme.fontSize.small}px ${rc.theme.fontFamilyMono}`;
    c.fillStyle = rc.theme.muted;
    // 이름이나 칩이 바꿔 놓았을 수 있어 되돌린다 — 캔버스 상태는 이어 흐른다.
    c.textAlign = 'left';
    c.textBaseline = 'alphabetic';
    const mag = Math.hypot(p.delta[0], p.delta[1]);
    c.fillText(mag.toFixed(1), (sx0 + sx1) / 2 + 6, (sy0 + sy1) / 2 + 4);
  }

  finalizeBaseMeta(rc, p);
};
