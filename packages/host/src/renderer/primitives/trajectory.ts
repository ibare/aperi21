import type { PrimitiveRenderer, Trajectory } from '@aperi21/schema';
import { applyBaseMeta, finalizeBaseMeta, primitiveColor, setAlpha } from '../common';

/** 선 굵기 기본값(화면 px). 곡선·궤적의 굵기. 안내선은 선언이 `width` 로 가늘게 준다. */
const DEFAULT_WIDTH = 2;
/** 대시·점선 무늬(화면 px, 굵기 2 기준). 굵기에 비례해 늘인다. */
const DASH_PATTERN = [6, 5] as const;
const DOT_PATTERN = [0.5, 4] as const;
/** 꼬리 페이드의 가장 옅은 알파. */
const FADE_MIN_ALPHA = 0.08;

/**
 * Trajectory 렌더러 — 폴리라인.
 *
 * `style.lineStyle`(dashed/dotted) 과 `closed` 는 오래 선언만 있고 구현이 없었다.
 * 그 사이 점선으로 선언한 선들(torricelli 동시 출발 표지 · container-shape 목표 수면)이
 * 실선으로 그려지고 있었다.
 *
 * `fade: 'tail'` 이면 선분마다 알파를 늘려 가며 긋는다. `closed` 와 함께 쓰면 닫는 선분은
 * 머리 쪽 알파로 긋는다. 대시 무늬는 선분마다 새로 시작한다.
 */
export const renderTrajectory: PrimitiveRenderer = (rc, p0) => {
  const p = p0 as Trajectory;
  if (p.points.length < 2) return;
  applyBaseMeta(rc, p);
  const c = rc.ctx;
  const color = primitiveColor(rc, p, { role: 'secondary', emphasis: 'medium' });
  const pts = p.points.map((w) => rc.toScreen(w));
  const width = p.width ?? DEFAULT_WIDTH;
  const scale = Math.max(1, width / DEFAULT_WIDTH);

  c.lineWidth = width;
  c.lineCap = 'round';
  c.lineJoin = 'round';
  c.strokeStyle = color;
  const style = p.style?.lineStyle ?? 'solid';
  c.setLineDash(
    style === 'dashed'
      ? DASH_PATTERN.map((d) => d * scale)
      : style === 'dotted'
        ? DOT_PATTERN.map((d) => d * scale)
        : [],
  );

  if (p.style?.fade === 'tail') {
    const N = pts.length - 1;
    for (let i = 0; i < N; i++) {
      setAlpha(c, Math.max(FADE_MIN_ALPHA, (i + 1) / N));
      c.beginPath();
      c.moveTo(pts[i]![0], pts[i]![1]);
      c.lineTo(pts[i + 1]![0], pts[i + 1]![1]);
      c.stroke();
    }
    if (p.closed) {
      setAlpha(c, 1);
      c.beginPath();
      c.moveTo(pts[N]![0], pts[N]![1]);
      c.lineTo(pts[0]![0], pts[0]![1]);
      c.stroke();
    }
  } else {
    setAlpha(c, 1);
    c.beginPath();
    c.moveTo(pts[0]![0], pts[0]![1]);
    for (let i = 1; i < pts.length; i++) c.lineTo(pts[i]![0], pts[i]![1]);
    if (p.closed) c.closePath();
    c.stroke();
  }

  c.setLineDash([]);
  finalizeBaseMeta(rc, p);
};
