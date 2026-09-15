import type { PrimitiveRenderer, Scale } from '@aperi21/schema';
import { applyBaseMeta, finalizeBaseMeta, primitiveColor, setAlpha } from '../common';
import { resolveText } from '../kit/text';

/** 눈금판 0 의 각도(캔버스 좌표계, 왼쪽 아래)와 시계 방향 총 각도. */
const DIAL_START = Math.PI * 0.75;
const DIAL_SWEEP = Math.PI * 1.5;
/** 눈금 개수를 주지 않았을 때의 칸 수. */
const DEFAULT_TICKS = 8;
/** 눈금판 안에서의 비율 — 지침·부채꼴·눈금선·글자 자리. */
const DIAL = {
  needle: 0.8,
  needleTail: 0.13,
  hub: 0.08,
  sector: 0.72,
  tickMajor: 0.8,
  tickMinor: 0.87,
  tickOuter: 0.94,
  valueY: 0.4,
  deltaY: 0.76,
  labelY: 1.18,
  fontValue: 0.3,
  fontDelta: 0.26,
  fontLabel: 0.26,
} as const;
/** 눈금자(직선)의 화면 치수. */
const LINEAR = {
  tickMajor: 9,
  tickMinor: 5,
  labelGap: 14,
  markerSize: 5,
} as const;

/**
 * 눈금 — 장치에 붙는 눈금판(`dial`)과 축처럼 놓이는 눈금자(`linear`).
 *
 * `origin` 을 주면 거기서 `value` 까지 부채꼴(또는 띠)이 자란다. 두 눈금이 같은
 * 범위를 쓰면 그 크기가 매 순간 견줄 수 있고, 그것이 이 그림이 하는 말이 된다.
 */
export const renderScale: PrimitiveRenderer = (rc, p0) => {
  const p = p0 as Scale;
  applyBaseMeta(rc, p);
  const c = rc.ctx;
  const accent = primitiveColor(rc, p, { role: 'accent', emphasis: 'strong' });
  const lo = p.range[0];
  const hi = p.range[1];
  const span = hi - lo || 1;
  const digits = p.digits ?? 2;
  const unit = p.unit ? resolveText(rc, p.unit) : '';
  const at = (v: number): number => Math.min(1, Math.max(0, (v - lo) / span));
  const ticks = p.tickAt ?? Array.from({ length: DEFAULT_TICKS + 1 }, (_, i) => lo + (span * i) / DEFAULT_TICKS);

  if (p.shape === 'dial') {
    const [cx, cy] = rc.toScreen(p.pos);
    const R = Math.max(16, p.size * rc.scale);
    const angle = (v: number): number => DIAL_START + at(v) * DIAL_SWEEP;

    c.beginPath();
    c.arc(cx, cy, R, 0, Math.PI * 2);
    c.fillStyle = rc.theme.background;
    c.fill();
    c.strokeStyle = rc.theme.line;
    c.lineWidth = rc.theme.strokeWidth.thick;
    c.stroke();

    // 변화 부채꼴 — 처음 자리에서 지금 자리까지.
    if (p.origin !== undefined) {
      const a0 = angle(p.origin);
      const a1 = angle(p.value);
      if (Math.abs(a1 - a0) > 0.004) {
        c.beginPath();
        c.moveTo(cx, cy);
        c.arc(cx, cy, R * DIAL.sector, a0, a1, a1 < a0);
        c.closePath();
        setAlpha(c, 0.3);
        c.fillStyle = accent;
        c.fill();
        setAlpha(c, 1);
        c.beginPath();
        c.arc(cx, cy, R * DIAL.sector, a0, a1, a1 < a0);
        c.strokeStyle = accent;
        c.lineWidth = rc.theme.strokeWidth.thick;
        c.stroke();
      }
      // 지침이 출발했던 자리
      c.strokeStyle = rc.theme.muted;
      c.lineWidth = rc.theme.strokeWidth.thin;
      c.setLineDash([3, 3]);
      c.beginPath();
      c.moveTo(cx, cy);
      c.lineTo(cx + Math.cos(a0) * R * 0.78, cy + Math.sin(a0) * R * 0.78);
      c.stroke();
      c.setLineDash([]);
    }

    c.strokeStyle = rc.theme.muted;
    ticks.forEach((v, i) => {
      const a = angle(v);
      const major = i % 2 === 0;
      const inner = R * (major ? DIAL.tickMajor : DIAL.tickMinor);
      c.lineWidth = major ? rc.theme.strokeWidth.thin : rc.theme.strokeWidth.hair;
      c.beginPath();
      c.moveTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner);
      c.lineTo(cx + Math.cos(a) * R * DIAL.tickOuter, cy + Math.sin(a) * R * DIAL.tickOuter);
      c.stroke();
    });

    const a1 = angle(p.value);
    c.strokeStyle = rc.theme.foreground;
    c.lineWidth = rc.theme.strokeWidth.thick;
    c.lineCap = 'round';
    c.beginPath();
    c.moveTo(cx - Math.cos(a1) * R * DIAL.needleTail, cy - Math.sin(a1) * R * DIAL.needleTail);
    c.lineTo(cx + Math.cos(a1) * R * DIAL.needle, cy + Math.sin(a1) * R * DIAL.needle);
    c.stroke();
    c.beginPath();
    c.arc(cx, cy, Math.max(2, R * DIAL.hub), 0, Math.PI * 2);
    c.fillStyle = rc.theme.foreground;
    c.fill();

    // 지금 눈금 — 수와 단위는 표식이라 번역 대상이 아니다 (C1 판정 3).
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.font = `600 ${Math.round(R * DIAL.fontValue)}px ${rc.theme.fontFamilyMono}`;
    c.fillStyle = rc.theme.foreground;
    c.fillText(`${p.value.toFixed(digits)} ${unit}`.trim(), cx, cy + R * DIAL.valueY);

    if (p.origin !== undefined) {
      const delta = p.value - p.origin;
      if (Math.abs(delta) > Math.pow(10, -digits) / 2) {
        c.font = `600 ${Math.round(R * DIAL.fontDelta)}px ${rc.theme.fontFamilyMono}`;
        c.fillStyle = accent;
        c.fillText(
          `${delta > 0 ? '+' : '−'}${Math.abs(delta).toFixed(digits)} ${unit}`.trim(),
          cx,
          cy + R * DIAL.deltaY,
        );
      }
    }

    const label = resolveText(rc, p.label);
    if (label) {
      c.font = `${Math.round(R * DIAL.fontLabel)}px ${rc.theme.fontFamily}`;
      c.fillStyle = rc.theme.muted;
      c.textBaseline = 'alphabetic';
      c.fillText(label, cx, cy - R * DIAL.labelY);
    }

    finalizeBaseMeta(rc, p);
    return;
  }

  // linear — 축이 아니라 논거로 놓이는 눈금자.
  const dir = p.direction ?? [1, 0];
  const len = Math.hypot(dir[0], dir[1]) || 1;
  const ux = dir[0] / len;
  const uy = dir[1] / len;
  const end: [number, number] = [p.pos[0] + ux * p.size, p.pos[1] + uy * p.size];
  const [x0, y0] = rc.toScreen(p.pos);
  const [x1, y1] = rc.toScreen(end);
  const px = (v: number): [number, number] => [x0 + (x1 - x0) * at(v), y0 + (y1 - y0) * at(v)];
  // 눈금선은 축에 수직으로. 화면 기준이라 배율과 무관하다.
  const nx = -(y1 - y0) / (Math.hypot(x1 - x0, y1 - y0) || 1);
  const ny = (x1 - x0) / (Math.hypot(x1 - x0, y1 - y0) || 1);

  c.strokeStyle = rc.theme.line;
  c.lineWidth = rc.theme.strokeWidth.thin;
  c.beginPath();
  c.moveTo(x0, y0);
  c.lineTo(x1, y1);
  c.stroke();

  // 라벨은 **가까운 눈금**에 붙인다. 눈금값이 계산에서 나오면
  // (Re = 0.1155 × 0.020 / 1.004e-6 = 2300.8) 정확히 일치하지 않는다.
  const labelTolerance = Math.abs(span) * 0.01;
  const labelFor = (v: number): number | undefined =>
    (p.labelAt ?? []).find((a) => Math.abs(a - v) <= labelTolerance);

  for (const v of ticks) {
    const [tx, ty] = px(v);
    const anchor = labelFor(v);
    const major = anchor !== undefined;
    const size = major ? LINEAR.tickMajor : LINEAR.tickMinor;
    c.strokeStyle = major ? accent : rc.theme.muted;
    c.lineWidth = major ? rc.theme.strokeWidth.thick : rc.theme.strokeWidth.hair;
    c.beginPath();
    c.moveTo(tx, ty);
    c.lineTo(tx + nx * size, ty + ny * size);
    c.stroke();

    if (major) {
      c.font = `600 ${rc.theme.fontSize.small}px ${rc.theme.fontFamilyMono}`;
      c.fillStyle = accent;
      c.textAlign = 'center';
      c.textBaseline = 'top';
      // 정박값이 있으면 그 값을 쓴다 — 계산값을 반올림하면 표에 없는 수를
      // 화면이 말하게 된다 (2300.8 → 2301).
      c.fillText(
        (anchor ?? v).toFixed(digits),
        tx + nx * LINEAR.labelGap,
        ty + ny * LINEAR.labelGap,
      );
    }
  }

  // 지금 값 표식
  const [vx, vy] = px(p.value);
  c.fillStyle = rc.theme.foreground;
  c.beginPath();
  c.moveTo(vx, vy);
  c.lineTo(vx - nx * LINEAR.markerSize - ny * LINEAR.markerSize, vy - ny * LINEAR.markerSize + nx * LINEAR.markerSize);
  c.lineTo(vx - nx * LINEAR.markerSize + ny * LINEAR.markerSize, vy - ny * LINEAR.markerSize - nx * LINEAR.markerSize);
  c.closePath();
  c.fill();

  finalizeBaseMeta(rc, p);
};
