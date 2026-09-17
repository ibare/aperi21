import type { PrimitiveRenderer, ScalarField } from '@aperi21/schema';
import { applyBaseMeta, finalizeBaseMeta, linearRgbOf, linearToByte, setAlpha } from '../common';

/** 칠할 캔버스. 브라우저의 `OffscreenCanvas` 나 DOM 캔버스 — 둘 다 없으면(노드) 그리지 않는다. */
type Surface = { canvas: OffscreenCanvas | HTMLCanvasElement; ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D };

function makeSurface(cols: number, rows: number): Surface | null {
  if (typeof OffscreenCanvas !== 'undefined') {
    const canvas = new OffscreenCanvas(cols, rows);
    const ctx = canvas.getContext('2d');
    return ctx ? { canvas, ctx } : null;
  }
  if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas');
    canvas.width = cols;
    canvas.height = rows;
    const ctx = canvas.getContext('2d');
    return ctx ? { canvas, ctx } : null;
  }
  return null;
}

/**
 * ScalarField 렌더러 — 격자 값 배열을 **이미지 한 장**으로 칠해 월드 사각형에 늘려 그린다.
 *
 * 칸 하나 = 픽셀 하나. 값→색은 선형광에서 테마 바탕과 역할 색을 섞는다(`luminance` 와 같은 셈).
 * `colors: 'light'` 이면 바탕 대신 테마의 빛 없음 → 가득 찬 빛을 섞는다. `NaN` 칸은 투명으로 둔다.
 * 늘릴 때 부드럽게 보간해 칸 경계가 계단으로 보이지 않는다.
 *
 * 캔버스는 임베드마다(`rc.store`) 인스턴스 id 로 둔다. 크기가 바뀌면 새로 만든다. id 가 없는 장끼리는
 * 같은 크기면 캔버스를 나눠 쓰는데, 매 프레임 픽셀을 모두 다시 쓰고 곧바로 그리므로 섞이지 않는다.
 */
export const renderScalarField: PrimitiveRenderer = (rc, p0) => {
  const p = p0 as ScalarField;
  const cols = Math.floor(p.cols);
  const rows = Math.floor(p.rows);
  if (cols <= 0 || rows <= 0 || p.values.length < cols * rows) return;

  const key = `scalarField:${p.id ?? ''}:${cols}x${rows}`;
  // 임베드 저장소가 없으면(러너 밖) 매번 새로 만든다 — 모듈에 두면 임베드끼리 섞인다 (C5).
  const surface = rc.store ? rc.store<Surface | null>(key, () => makeSurface(cols, rows)) : makeSurface(cols, rows);
  if (!surface) return;

  // 빛의 세기(`'light'`)는 테마와 무관한 두 끝 사이, 그 밖은 바탕 → 역할 색 (장부 G34).
  const isLight = p.colors === 'light';
  const bg = linearRgbOf(isLight ? rc.theme.light.none : rc.theme.background);
  const hi = linearRgbOf(
    p.colors === 'light' ? rc.theme.light.full : rc.theme.resolveColor(p.colors.high, 'strong'),
  );
  const lowRole = p.colors === 'light' ? undefined : p.colors.low;
  const lo = lowRole ? linearRgbOf(rc.theme.resolveColor(lowRole, 'strong')) : null;
  if (!bg || !hi || (lowRole && !lo)) return;

  const [r0, r1] = p.range;
  const span = r1 - r0 || 1;
  const image = surface.ctx.createImageData(cols, rows);
  const px = image.data;
  for (let i = 0; i < cols * rows; i++) {
    const v = p.values[i]!;
    // NaN 칸은 칠하지 않는다 — 사각형이 아닌 영역 밖 (알파 0 으로 둔다).
    if (Number.isNaN(v)) continue;
    // 0~1 로 자른 자리.
    const u = Math.max(0, Math.min(1, (v - r0) / span));
    let target = hi;
    let t = u;
    if (lo) {
      // 발산형 — 가운데가 바탕, 양쪽 끝이 두 역할.
      const d = u * 2 - 1;
      target = d < 0 ? lo : hi;
      t = Math.abs(d);
    }
    const o = i * 4;
    px[o] = linearToByte(bg[0] + (target[0] - bg[0]) * t);
    px[o + 1] = linearToByte(bg[1] + (target[1] - bg[1]) * t);
    px[o + 2] = linearToByte(bg[2] + (target[2] - bg[2]) * t);
    px[o + 3] = 255;
  }
  surface.ctx.putImageData(image, 0, 0);

  applyBaseMeta(rc, p);
  const c = rc.ctx;
  const [ax, ay] = rc.toScreen([p.min[0], p.max[1]]);
  const [bx, by] = rc.toScreen([p.max[0], p.min[1]]);
  setAlpha(c, 1);
  c.imageSmoothingEnabled = true;
  c.drawImage(surface.canvas as CanvasImageSource, Math.min(ax, bx), Math.min(ay, by), Math.abs(bx - ax), Math.abs(by - ay));
  finalizeBaseMeta(rc, p);
};
