import type { PrimitiveRenderer, Trajectory } from '@aperi21/schema';
import { applyBaseMeta, finalizeBaseMeta, primitiveColor } from '../common';

/**
 * Trajectory 렌더러. style.fade === 'tail' 이면 세그먼트별 알파를 늘려가며
 * 여러 번 스트로크 (뒤로 갈수록 진함). 아니면 단일 폴리라인.
 */
export const renderTrajectory: PrimitiveRenderer = (rc, p0) => {
  const p = p0 as Trajectory;
  if (p.points.length < 2) return;
  applyBaseMeta(rc, p);
  const c = rc.ctx;
  const color = primitiveColor(rc, p, { role: 'secondary', emphasis: 'medium' });
  const pts = p.points.map((w) => rc.toScreen(w));
  c.lineWidth = 2;
  c.lineCap = 'round';
  c.lineJoin = 'round';

  if (p.style?.fade === 'tail') {
    const N = pts.length - 1;
    for (let i = 0; i < N; i++) {
      const alpha = Math.max(0.08, (i + 1) / N);
      c.globalAlpha = alpha;
      c.strokeStyle = color;
      c.beginPath();
      c.moveTo(pts[i]![0], pts[i]![1]);
      c.lineTo(pts[i + 1]![0], pts[i + 1]![1]);
      c.stroke();
    }
  } else {
    c.globalAlpha = 1;
    c.strokeStyle = color;
    c.beginPath();
    c.moveTo(pts[0]![0], pts[0]![1]);
    for (let i = 1; i < pts.length; i++) c.lineTo(pts[i]![0], pts[i]![1]);
    c.stroke();
  }

  finalizeBaseMeta(rc, p);
};
