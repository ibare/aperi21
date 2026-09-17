import type { LineSet, PrimitiveRenderer } from '@aperi21/schema';
import { applyBaseMeta, finalizeBaseMeta, opacityBuckets, primitiveColor, setAlpha } from '../common';

/**
 * LineSet 렌더러 — 선 목록을 **불투명도 단계마다 경로 하나**로 긋는다.
 *
 * `trajectory` 를 선마다 하나씩 두면 선언과 그리기가 선 수에 비례한다(전기력선 꼬리 950).
 * 여기서는 그리기 호출이 단계 수(`OPACITY_LEVELS`)를 넘지 않는다.
 */
export const renderLineSet: PrimitiveRenderer = (rc, p0) => {
  const p = p0 as LineSet;
  if (p.lines.length === 0) return;
  applyBaseMeta(rc, p);
  const c = rc.ctx;
  c.strokeStyle = primitiveColor(rc, p, { role: 'secondary', emphasis: 'medium' });
  c.lineWidth = p.width ?? rc.theme.strokeWidth.regular;
  c.lineCap = 'round';
  c.lineJoin = 'round';

  for (const { alpha, indices } of opacityBuckets(p.lines.length, p.opacities)) {
    setAlpha(c, alpha);
    c.beginPath();
    for (const i of indices) {
      const line = p.lines[i]!;
      if (line.length < 2) continue;
      const [x0, y0] = rc.toScreen(line[0]!);
      c.moveTo(x0, y0);
      for (let k = 1; k < line.length; k++) {
        const [x, y] = rc.toScreen(line[k]!);
        c.lineTo(x, y);
      }
    }
    c.stroke();
  }

  finalizeBaseMeta(rc, p);
};
