import type { Bounds, Vec2 } from '@aperi21/schema';

export interface Viewport {
  width: number;
  height: number;
}

/**
 * docs/06 §6 의 좌표 변환 규약:
 *   toScreen([wx, wy]) = [cx + (wx - cam.x) * scale, cy + 60 - (wy - cam.y) * scale]
 *   (+60 은 지면을 화면 중앙 약간 아래로 배치하는 편향)
 */
export const SCREEN_Y_BIAS = 60;

export class Camera {
  x: number;
  y: number;
  scale: number;
  userAdjusted: boolean;

  private defaultX: number;
  private defaultY: number;
  private defaultScale: number;

  constructor(init: { x?: number; y?: number; scale?: number } = {}) {
    this.x = init.x ?? 0;
    this.y = init.y ?? 0;
    this.scale = init.scale ?? 20;
    this.userAdjusted = false;
    this.defaultX = this.x;
    this.defaultY = this.y;
    this.defaultScale = this.scale;
  }

  pan(dxWorld: number, dyWorld: number): void {
    this.x -= dxWorld;
    this.y -= dyWorld;
    this.userAdjusted = true;
  }

  /**
   * factor > 1 이면 확대, < 1 이면 축소. center (월드 좌표) 를 지정하면 그 지점이
   * 고정된 채 줌. 지정하지 않으면 현재 카메라 원점 기준.
   */
  zoom(factor: number, center?: Vec2): void {
    const next = Math.max(1, Math.min(400, this.scale * factor));
    if (center) {
      const [cx, cy] = center;
      this.x = cx - (cx - this.x) * (this.scale / next);
      this.y = cy - (cy - this.y) * (this.scale / next);
    }
    this.scale = next;
    this.userAdjusted = true;
  }

  /**
   * 뷰포트 안에 bounds 전체가 들어오도록 scale 과 중심을 맞춘다.
   * userAdjusted 는 변경하지 않는다 — 자동 프레이밍용.
   */
  fitToBounds(bounds: Bounds, viewport: Viewport, padding = 48): void {
    const width = Math.max(1, bounds.maxX - bounds.minX);
    const height = Math.max(1, bounds.maxY - bounds.minY);
    const availW = Math.max(1, viewport.width - padding * 2);
    const availH = Math.max(1, viewport.height - padding * 2);
    const sx = availW / width;
    const sy = availH / height;
    this.scale = Math.max(2, Math.min(sx, sy));
    this.x = (bounds.minX + bounds.maxX) / 2;
    this.y = (bounds.minY + bounds.maxY) / 2;
  }

  reset(): void {
    this.x = this.defaultX;
    this.y = this.defaultY;
    this.scale = this.defaultScale;
    this.userAdjusted = false;
  }

  toScreen(world: Vec2, viewport: Viewport): Vec2 {
    const cx = viewport.width / 2;
    const cy = viewport.height / 2 + SCREEN_Y_BIAS;
    return [cx + (world[0] - this.x) * this.scale, cy - (world[1] - this.y) * this.scale];
  }

  toWorld(screen: Vec2, viewport: Viewport): Vec2 {
    const cx = viewport.width / 2;
    const cy = viewport.height / 2 + SCREEN_Y_BIAS;
    return [(screen[0] - cx) / this.scale + this.x, -((screen[1] - cy) / this.scale) + this.y];
  }
}
