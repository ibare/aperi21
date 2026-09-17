import type { OpticalElement, PrimitiveRenderer, Ray, Vec2 } from '@aperi21/schema';
import { linearToSrgb, wavelengthToLinearRgb } from './color';

/** 파장(nm)→화면 색. 색상 계산은 조각과 같은 `wavelengthToLinearRgb` 한 곳이다. */
function wavelengthToColor(nm: number): string {
  const [r, g, b] = wavelengthToLinearRgb(nm);
  const byte = (v: number): number => Math.round(linearToSrgb(v) * 255);
  return `rgb(${byte(r)}, ${byte(g)}, ${byte(b)})`;
}

/** 체인 세그먼트 경로 + 옵션 화살촉 + 파장 색상. */
export const renderRay: PrimitiveRenderer = (rc, p0) => {
  const ray = p0 as Ray;
  if (!ray.segments || ray.segments.length < 2) return;
  const c = rc.ctx;
  const color = ray.wavelength ? wavelengthToColor(ray.wavelength) : rc.theme.resolveColor('accent', 'strong');
  const intensity = typeof ray.intensity === 'number' ? Math.max(0.2, Math.min(1, ray.intensity)) : 1;

  c.save();
  c.globalAlpha = intensity;
  c.strokeStyle = color;
  c.lineWidth = rc.theme.strokeWidth.regular;
  c.lineCap = 'round';
  c.beginPath();
  let prev = rc.toScreen(ray.segments[0]!);
  c.moveTo(prev[0], prev[1]);
  for (let i = 1; i < ray.segments.length; i++) {
    const s = rc.toScreen(ray.segments[i]!);
    c.lineTo(s[0], s[1]);
    prev = s;
  }
  c.stroke();

  if (ray.showArrow && ray.segments.length >= 2) {
    const last = rc.toScreen(ray.segments[ray.segments.length - 1]!);
    const before = rc.toScreen(ray.segments[ray.segments.length - 2]!);
    const dx = last[0] - before[0];
    const dy = last[1] - before[1];
    const L = Math.hypot(dx, dy);
    if (L > 0.5) {
      const ux = dx / L;
      const uy = dy / L;
      const head = 8;
      c.fillStyle = color;
      c.beginPath();
      c.moveTo(last[0], last[1]);
      c.lineTo(last[0] - ux * head - uy * head * 0.5, last[1] - uy * head + ux * head * 0.5);
      c.lineTo(last[0] - ux * head + uy * head * 0.5, last[1] - uy * head - ux * head * 0.5);
      c.closePath();
      c.fill();
    }
  }
  c.restore();
};

/** OpticalElement 렌더 — subtype 별 간단 아이콘 + 광축/법선 보조선. */
export const renderOpticalElement: PrimitiveRenderer = (rc, p0) => {
  const el = p0 as OpticalElement;
  const half = (typeof el.size === 'number' ? el.size : 4) / 2;
  const c = rc.ctx;
  const n: Vec2 = [Math.cos(el.orientation), Math.sin(el.orientation)];
  const t: Vec2 = [-n[1], n[0]];
  const aW: Vec2 = [el.pos[0] + t[0] * half, el.pos[1] + t[1] * half];
  const bW: Vec2 = [el.pos[0] - t[0] * half, el.pos[1] - t[1] * half];
  const [ax, ay] = rc.toScreen(aW);
  const [bx, by] = rc.toScreen(bW);
  const [cx, cy] = rc.toScreen(el.pos);

  c.save();
  c.strokeStyle = rc.theme.foreground;
  c.fillStyle = rc.theme.resolveColor('muted', 'subtle');
  c.lineWidth = rc.theme.strokeWidth.thick;

  switch (el.subtype) {
    case 'mirror-flat': {
      c.beginPath();
      c.moveTo(ax, ay);
      c.lineTo(bx, by);
      c.stroke();
      // 배면 해칭
      const hatchCount = 6;
      c.strokeStyle = rc.theme.muted;
      c.lineWidth = rc.theme.strokeWidth.thin;
      for (let i = 0; i < hatchCount; i++) {
        const u = i / (hatchCount - 1);
        const px = ax + (bx - ax) * u;
        const py = ay + (by - ay) * u;
        const hatchLen = 6;
        c.beginPath();
        c.moveTo(px, py);
        c.lineTo(px - n[0] * hatchLen, py + n[1] * hatchLen);
        c.stroke();
      }
      break;
    }

    case 'mirror-concave':
    case 'mirror-convex': {
      const bulge = el.subtype === 'mirror-concave' ? -12 : 12;
      c.beginPath();
      c.moveTo(ax, ay);
      c.quadraticCurveTo(cx + n[0] * bulge, cy - n[1] * bulge, bx, by);
      c.stroke();
      break;
    }

    case 'lens-thin': {
      c.beginPath();
      c.moveTo(ax, ay);
      c.lineTo(bx, by);
      c.stroke();
      // 양쪽 화살표로 수렴/발산 표시
      const arrowLen = 6;
      c.beginPath();
      c.moveTo(ax - 4, ay - 4);
      c.lineTo(ax, ay);
      c.lineTo(ax + 4, ay - 4);
      c.moveTo(bx - 4, by + 4);
      c.lineTo(bx, by);
      c.lineTo(bx + 4, by + 4);
      c.stroke();
      void arrowLen;
      break;
    }

    case 'lens-convex': {
      c.beginPath();
      c.moveTo(ax, ay);
      c.quadraticCurveTo(cx + n[0] * 10, cy - n[1] * 10, bx, by);
      c.quadraticCurveTo(cx - n[0] * 10, cy + n[1] * 10, ax, ay);
      c.closePath();
      c.fill();
      c.stroke();
      break;
    }

    case 'lens-concave': {
      // 양 오목
      c.beginPath();
      c.moveTo(ax, ay);
      c.quadraticCurveTo(cx + n[0] * -6, cy - n[1] * -6, bx, by);
      c.quadraticCurveTo(cx - n[0] * -6, cy + n[1] * -6, ax, ay);
      c.closePath();
      c.fill();
      c.stroke();
      break;
    }

    case 'prism': {
      const apex: Vec2 = [el.pos[0] + n[0] * half, el.pos[1] + n[1] * half];
      const [apexX, apexY] = rc.toScreen(apex);
      c.beginPath();
      c.moveTo(ax, ay);
      c.lineTo(bx, by);
      c.lineTo(apexX, apexY);
      c.closePath();
      c.fill();
      c.stroke();
      break;
    }

    case 'screen': {
      c.fillStyle = rc.theme.muted;
      c.beginPath();
      c.moveTo(ax, ay);
      c.lineTo(bx, by);
      c.lineTo(bx + n[0] * 4, by - n[1] * 4);
      c.lineTo(ax + n[0] * 4, ay - n[1] * 4);
      c.closePath();
      c.fill();
      break;
    }

    case 'slit':
    case 'polarizer':
    case 'wave-plate':
    default: {
      c.beginPath();
      c.moveTo(ax, ay);
      c.lineTo(bx, by);
      c.stroke();
    }
  }

  c.restore();
};
