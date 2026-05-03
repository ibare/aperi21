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

/**
 * fitToBounds 호출 옵션.
 * - padding: 모든 변에 공통으로 더하는 픽셀 여백.
 * - screenMargins: 뷰포트 변마다 추가로 예약할 픽셀(컨트롤러 overlay 영역용).
 *   월드 바운드 계산 시 해당 영역이 컨텐츠로 가려지지 않도록 축소된 가용
 *   공간 안에서만 스케일·중심을 계산한다.
 *
 * 카메라는 항상 즉시 스냅한다. trajectory 기반 bounds 가 매 프레임 자라므로
 * 보간을 얹으면 lag 이 생겨 공이 화면 밖으로 새어 나가는 인상을 준다.
 */
export interface FitOptions {
  padding?: number;
  screenMargins?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
}

export class Camera {
  x: number;
  y: number;
  scale: number;
  userAdjusted: boolean;

  /**
   * 격자 스냅 모드. 활성화되면 snapWorld 가 월드 좌표를 gridSize 배수로 반올림한다.
   * DC Circuit 에서 소자 배치 시 격자 정렬을 위해 사용한다.
   */
  gridSnap: boolean;
  gridSize: number;

  private defaultX: number;
  private defaultY: number;
  private defaultScale: number;

  constructor(init: { x?: number; y?: number; scale?: number; gridSize?: number } = {}) {
    this.x = init.x ?? 0;
    this.y = init.y ?? 0;
    this.scale = init.scale ?? 20;
    this.userAdjusted = false;
    this.defaultX = this.x;
    this.defaultY = this.y;
    this.defaultScale = this.scale;
    this.gridSnap = false;
    this.gridSize = init.gridSize ?? 1;
  }

  setGridSnap(enabled: boolean, size?: number): void {
    this.gridSnap = enabled;
    if (typeof size === 'number' && size > 0) this.gridSize = size;
  }

  /** 월드 좌표에 격자 스냅을 적용한 결과를 반환. 비활성화되면 원본 그대로. */
  snapWorld(p: Vec2): Vec2 {
    if (!this.gridSnap) return p;
    const g = this.gridSize;
    return [Math.round(p[0] / g) * g, Math.round(p[1] / g) * g];
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
    const next = Math.max(0.25, Math.min(400, this.scale * factor));
    if (center) {
      const [cx, cy] = center;
      this.x = cx - (cx - this.x) * (this.scale / next);
      this.y = cy - (cy - this.y) * (this.scale / next);
    }
    this.scale = next;
    this.userAdjusted = true;
  }

  /**
   * 뷰포트 안에 bounds 전체가 들어오도록 카메라 중심·스케일을 즉시 스냅한다.
   *
   * SCREEN_Y_BIAS 때문에 월드 원점이 뷰포트 중앙보다 60px 아래로 찍힌다. 따라서
   * 가용 세로 공간은 상하가 비대칭이다. 본 메서드는 이를 반영해 네 방향(상/하/
   * 좌/우) 각각의 가용 픽셀을 분리 계산하고, 그 중 가장 타이트한 제약으로
   * 스케일을 정한다.
   *
   * userAdjusted 는 변경하지 않는다 — 자동 프레이밍용.
   */
  fitToBounds(bounds: Bounds, viewport: Viewport, opts: FitOptions = {}): void {
    const padding = opts.padding ?? 24;
    const sm = opts.screenMargins ?? {};
    const mT = padding + (sm.top ?? 0);
    const mB = padding + (sm.bottom ?? 0);
    const mL = padding + (sm.left ?? 0);
    const mR = padding + (sm.right ?? 0);

    const viewCx = viewport.width / 2;
    const viewCy = viewport.height / 2 + SCREEN_Y_BIAS;
    const availL = Math.max(1, viewCx - mL);
    const availR = Math.max(1, viewport.width - viewCx - mR);
    const availU = Math.max(1, viewCy - mT);
    const availD = Math.max(1, viewport.height - viewCy - mB);

    const midX = (bounds.minX + bounds.maxX) / 2;
    const midY = (bounds.minY + bounds.maxY) / 2;

    const leftSpan = Math.max(0, midX - bounds.minX);
    const rightSpan = Math.max(0, bounds.maxX - midX);
    const upSpan = Math.max(0, bounds.maxY - midY);
    const downSpan = Math.max(0, midY - bounds.minY);

    const sxL = leftSpan > 0 ? availL / leftSpan : Infinity;
    const sxR = rightSpan > 0 ? availR / rightSpan : Infinity;
    const syU = upSpan > 0 ? availU / upSpan : Infinity;
    const syD = downSpan > 0 ? availD / downSpan : Infinity;

    let scale = Math.min(sxL, sxR, syU, syD);
    if (!isFinite(scale) || scale <= 0) scale = this.defaultScale;
    // 하한은 의미 있는 최소 가독 스케일(0.25 px/m). 상한은 과한 확대 방지.
    scale = Math.max(0.25, Math.min(400, scale));

    this.x = midX;
    this.y = midY;
    this.scale = scale;
  }

  reset(): void {
    this.x = this.defaultX;
    this.y = this.defaultY;
    this.scale = this.defaultScale;
    this.userAdjusted = false;
    // gridSnap 은 Bundle 특성이므로 reset 에서 해제하지 않는다.
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
