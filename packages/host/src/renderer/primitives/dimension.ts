import type { Dimension, PrimitiveRenderer } from '@aperi21/schema';
import { applyBaseMeta, finalizeBaseMeta, primitiveColor } from '../common';
import { resolveText } from '../kit/text';

/** 끝점 표시와 글자 자리(화면 px). */
const CAP = 3;
const TEXT_GAP = 4;

/**
 * 두 점 사이를 재는 표시.
 *
 * `elbow` 면 ㄴ자로 꺾는다 — 수면에서 구멍까지의 깊이처럼 가로세로가 섞인 거리를
 * 직선으로 그으면 대각선이 되어, 재는 값과 그리는 선이 어긋난다.
 */
export const renderDimension: PrimitiveRenderer = (rc, p0) => {
  const p = p0 as Dimension;
  applyBaseMeta(rc, p);

  const c = rc.ctx;
  const color = primitiveColor(rc, p, { role: 'muted', emphasis: 'strong' });
  const [x0, y0] = rc.toScreen(p.from);
  const [x1, y1] = rc.toScreen(p.to);

  c.strokeStyle = color;
  c.lineWidth = rc.theme.strokeWidth.thin;
  c.setLineDash([4, 3]);
  c.beginPath();
  c.moveTo(x0, y0);
  if (p.elbow) c.lineTo(x0, y1);
  c.lineTo(x1, y1);
  c.stroke();
  c.setLineDash([]);

  // 끝점 — 어디서 어디까지인지 못박는다.
  for (const [x, y] of [
    [x0, y0],
    [x1, y1],
  ] as const) {
    c.beginPath();
    c.arc(x, y, CAP, 0, Math.PI * 2);
    c.fillStyle = color;
    c.fill();
  }

  const text = resolveText(rc, p.text, p.vars);
  if (text) {
    // ㄴ자면 **가로 구간 위**에 중앙으로. 세로 구간 옆에 두면 재는 대상 쪽으로
    // 뻗어 나가 그림을 침범한다 — 치수선은 재는 것을 가리면 안 된다.
    const tx = p.elbow ? (x0 + x1) / 2 : (x0 + x1) / 2;
    const ty = p.elbow ? y1 - TEXT_GAP : Math.min(y0, y1) - TEXT_GAP;
    c.font = `${rc.theme.fontSize.regular}px ${rc.theme.fontFamilyMono}`;
    c.fillStyle = color;
    c.textAlign = 'center';
    c.textBaseline = 'bottom';
    c.fillText(text, tx, ty);
  }

  finalizeBaseMeta(rc, p);
};
