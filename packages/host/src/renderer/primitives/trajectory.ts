import type { PrimitiveRenderer, Trajectory } from '@aperi21/schema';
import { applyBaseMeta, finalizeBaseMeta, primitiveColor, setAlpha } from '../common';

/** 선 굵기 기본값(화면 px). 곡선·궤적의 굵기. 안내선은 선언이 `width` 로 가늘게 준다. */
/** 대시·점선 무늬(화면 px, 굵기 2 기준). 굵기에 비례해 늘인다. */
const DASH_PATTERN = [6, 5] as const;
const DOT_PATTERN = [0.5, 4] as const;
/** 꼬리 페이드의 가장 옅은 알파. */
const FADE_MIN_ALPHA = 0.08;
/** `focus` 를 선언하지 않았을 때의 자리 — 가운데를 경로의 1/4 폭만큼 남긴다. */
const FOCUS_DEFAULT = { at: 0.5, width: 0.25 } as const;

/**
 * `fade: 'focus'` 의 알파 — 경로 위 한 점(`at`)을 중심으로 양쪽으로 옅어진다.
 *
 * 진한 구간의 **반폭** 안은 1 이고, 거기서부터 `width` 만큼 더 가면 바닥에 닿는다.
 * 번짐 폭을 따로 선언하게 두지 않은 것은 조각마다 맞춰야 할 숫자가 둘이 되기
 * 때문이다 — 진한 구간이 좁으면 번짐도 좁은 것이 이 그림이 말하려는 바다.
 */
function focusAlpha(t: number, focus: { at: number; width: number }): number {
  const half = Math.max(0, focus.width) / 2;
  const d = Math.abs(t - focus.at);
  if (d <= half) return 1;
  const falloff = Math.max(focus.width, Number.EPSILON);
  const k = Math.max(0, 1 - (d - half) / falloff);
  return FADE_MIN_ALPHA + (1 - FADE_MIN_ALPHA) * k;
}

/**
 * Trajectory 렌더러 — 폴리라인.
 *
 * `style.lineStyle`(dashed/dotted) 과 `closed` 는 오래 선언만 있고 구현이 없었다.
 * 그 사이 점선으로 선언한 선들(torricelli 동시 출발 표지 · container-shape 목표 수면)이
 * 실선으로 그려지고 있었다.
 *
 * `fade` 가 `'tail'` · `'focus'` 면 선분마다 알파를 바꿔 가며 긋는다. 알파만 다르고
 * 긋는 방식은 하나다. `closed` 와 함께 쓰면 닫는 선분은 경로의 끝(t=1) 알파로 긋는다.
 * 대시 무늬는 선분마다 새로 시작한다.
 */
export const renderTrajectory: PrimitiveRenderer = (rc, p0) => {
  const p = p0 as Trajectory;
  if (p.points.length < 2) return;
  applyBaseMeta(rc, p);
  const c = rc.ctx;
  const color = primitiveColor(rc, p, { role: 'secondary', emphasis: 'medium' });
  const pts = p.points.map((w) => rc.toScreen(w));
  const base = rc.theme.strokeWidth.thick;
  const width = p.width ?? base;
  const scale = Math.max(1, width / base);

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

  const fade = p.style?.fade ?? 'none';
  if (fade === 'tail' || fade === 'focus') {
    const focus = p.focus ?? FOCUS_DEFAULT;
    // 꼬리는 선분의 **끝**이 얼마나 진행했는지로 옅어지고(머리가 1), 초점은 선분의
    // **가운데**로 잰다 — 중심이 선분 안에 들어와도 좌우 대칭이 깨지지 않게.
    const alphaOf =
      fade === 'focus'
        ? (i: number, n: number): number => focusAlpha((i + 0.5) / n, focus)
        : (i: number, n: number): number => Math.max(FADE_MIN_ALPHA, (i + 1) / n);
    const N = pts.length - 1;
    for (let i = 0; i < N; i++) {
      setAlpha(c, alphaOf(i, N));
      c.beginPath();
      c.moveTo(pts[i]![0], pts[i]![1]);
      c.lineTo(pts[i + 1]![0], pts[i + 1]![1]);
      c.stroke();
    }
    if (p.closed) {
      setAlpha(c, fade === 'focus' ? focusAlpha(1, focus) : 1);
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
