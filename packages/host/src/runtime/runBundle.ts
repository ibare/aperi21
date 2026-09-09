/**
 * runBundle — Bundle JSON 을 DOM 영역에 마운트하는 비-React 진입점.
 *
 * Tiptap NodeView 같이 React 라이프사이클 밖에서 시뮬레이션을 띄울 때 사용.
 * react/embed/Canvas.tsx 의 RAF 루프와 동일한 골격을 재사용한다.
 *
 * 첫 구현은 단일 캔버스 + RAF + 카메라 자동 프레이밍 + 컨트롤러 입력만 포함.
 * ParamPanel/HUD/ViewTabs 같은 React UI 는 이 진입점 범위 외 (Phase 5+ 에서
 * 별도 mount 옵션으로 제공 가능).
 */

import type {
  Bundle,
  BundleState,
  ControllerSpec,
  EnvironmentDef,
  MeasureService,
  Primitive,
  RenderContext,
  StageDef,
  Vec2,
  ViewDef,
} from '@aperi21/schema';

import { BackgroundParticleSystem } from '../particles';
import { preprocessScene } from '../scene';
import { Camera, type Viewport } from '../camera';
import { Host, createHost } from '../host';
import { createTimeEngine } from '../time';
import type { ThemeMode } from '../theme';
import type { ControllerEventContext, PointerInput } from '../controller/types';

/**
 * 임베드 캔버스 치수의 기본값. 선언(`BundleSchema.canvas`)이 비었을 때만 쓰인다.
 * C2 가 요구하는 "코드에 남는 기본값은 named 상수로 한 곳에" 를 따른다.
 */
const CANVAS_DEFAULT = { height: 360, minHeight: 320 } as const;

const HUD_MARGINS = { top: 24, bottom: 24, left: 24, right: 24 };

export interface RunBundleOptions {
  locale?: string;
  theme?: ThemeMode;
  /** 호스트가 이미 만들어둔 Host 가 있으면 재사용. 없으면 새로 만든다. */
  host?: Host;
  /** Stage id (없으면 첫 stage). */
  stageId?: string;
  /** View id (없으면 default 또는 첫 view). */
  viewId?: string;
  /** 활성화할 Environment id 들. */
  environmentIds?: string[];
  /** 파라미터 초기값 (없으면 schema default). */
  values?: Record<string, number>;
  /**
   * Host 가 자동 생성될 때 호출되는 플러그인 설치 훅. bootstrap 패키지의
   * installAperi21Plugins 같은 함수를 외부에서 주입할 수 있다. host 옵션이
   * 명시되어 있으면 호출되지 않는다 (이미 호출자가 host 를 준비했다고 가정).
   */
  installPlugins?: (host: Host) => void | Promise<void>;
}

export interface BundleRunHandle {
  destroy(): void;
}

interface RunContextRefs<T extends BundleState> {
  bundle: Bundle<T>;
  stage: StageDef;
  view: ViewDef;
  envs: EnvironmentDef[];
  state: T;
}

export function runBundle<T extends BundleState = BundleState>(
  bundle: Bundle<T>,
  mount: HTMLElement,
  options: RunBundleOptions = {},
): BundleRunHandle {
  const host = options.host ?? createHost({ theme: options.theme, lang: options.locale });
  if (!options.host && options.installPlugins) {
    // host 를 우리가 만든 경우에만 plugin 설치를 시도. 결과 promise 는
    // 무시하고 바로 마운트를 시작한다 — 동기 등록인 경우는 즉시 효과가 있고,
    // async 인 경우엔 첫 프레임 이후 점진 반영된다.
    void Promise.resolve(options.installPlugins(host));
  }

  // 카메라·시간 엔진은 이 마운트 전용 인스턴스다. host 는 renderer/compute/controller
  // 레지스트리·theme·i18n 같은 불변 공유분만 제공하고, 패닝/줌/시간처럼 view 마다
  // 달라야 하는 상태는 host 에 두지 않는다 — 같은 host 를 공유하는 다른 임베드와
  // 카메라·시간이 묶이지 않도록 (한 콘텐츠에 임베드가 N 개여도 각자 독립적으로
  // 패닝·줌·재생된다). timeModel 도 번들별로 정확히 적용된다.
  const camera = new Camera({ screenYBias: bundle.schema.camera?.screenYBias });
  const timeEngine = createTimeEngine(bundle.schema.timeModel ?? 'linear');

  // Stage / View / Environment 결정
  const stage =
    bundle.schema.stages.find((s) => s.id === options.stageId) ?? bundle.schema.stages[0]!;
  const view =
    bundle.schema.views.find((v) => v.id === options.viewId) ??
    bundle.schema.views.find((v) => v.default) ??
    bundle.schema.views[0]!;
  const envs = (options.environmentIds ?? [])
    .map((id) => bundle.schema.environments.find((e) => e.id === id))
    .filter((e): e is EnvironmentDef => !!e);

  // 파라미터 기본값 + 사용자 override
  const values: Record<string, number> = {};
  for (const p of bundle.schema.parameters) values[p.id] = p.default;
  if (options.values) Object.assign(values, options.values);

  // 초기 상태
  let state: T = bundle.initialState({ values, stage, environments: envs });

  // 캔버스 컨테이너 + 캔버스.
  // 치수는 선언에서 온다 (원칙 2). 코드에는 선언이 비었을 때의 기본값만 둔다.
  // 마운트 후 이 값들은 바뀌지 않는다 — 글 안에 박힌 그림의 높이가 변하면 위아래
  // 문단이 밀린다 (원칙 6). packages/host/src/__tests__/embed-runtime.test.ts 가 잰다.
  // 저작자 문안(1층)을 얹은 조회기. 러너가 하나만 만들어 렌더러와 컨트롤러 양쪽에
  // 같은 것을 넘긴다 — 각자 만들면 한 화면에서 문안 출처가 갈린다 (C1).
  const scopedI18n = host.i18n.withMessages(bundle.schema.messages);

  const canvasSpec = bundle.schema.canvas ?? {};
  const height = canvasSpec.height ?? CANVAS_DEFAULT.height;
  const minHeight = canvasSpec.minHeight ?? CANVAS_DEFAULT.minHeight;

  const wrapper = document.createElement('div');
  wrapper.className = 'aperi21-runbundle';
  wrapper.style.position = 'relative';
  wrapper.style.width = '100%';
  wrapper.style.minHeight = `${minHeight}px`;
  wrapper.style.height = `${height}px`;
  wrapper.style.background = host.theme.background;
  wrapper.style.borderRadius = `${host.theme.radiusMedium * 2}px`;
  wrapper.style.overflow = 'hidden';
  wrapper.style.border = `1px solid ${host.theme.line}`;

  const canvas = document.createElement('canvas');
  canvas.style.position = 'absolute';
  canvas.style.inset = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.display = 'block';
  canvas.style.touchAction = 'none';
  wrapper.appendChild(canvas);
  mount.appendChild(wrapper);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return {
      destroy() {
        wrapper.remove();
      },
    };
  }

  const dpr = Math.min(2, (typeof window !== 'undefined' && window.devicePixelRatio) || 1);
  const particles = new BackgroundParticleSystem();
  timeEngine.reset();
  timeEngine.start();

  let disposed = false;
  let rafId = 0;
  let lastT =
    typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();
  let activeController:
    | {
        spec: ControllerSpec;
        impl: ReturnType<typeof host.controllerRegistry.get>;
      }
    | null = null;
  let panning: {
    startPx: number;
    startPy: number;
    lastPx: number;
    lastPy: number;
    active: boolean;
  } | null = null;
  let wasTerminated = bundle.isTerminated?.(state) ?? false;

  const refs: RunContextRefs<T> = { bundle, stage, view, envs, state };

  function sizeCanvas(): Viewport {
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.floor(rect.width));
    const h = Math.max(1, Math.floor(rect.height));
    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
    }
    return { width: w, height: h };
  }

  function toPointerInput(e: PointerEvent): PointerInput {
    const rect = canvas.getBoundingClientRect();
    return {
      px: e.clientX - rect.left,
      py: e.clientY - rect.top,
      button: e.button,
      buttons: e.buttons,
    };
  }

  function makeEventCtx(vp: Viewport): ControllerEventContext {
    return {
      viewport: vp,
      toWorld: (s: Vec2) => camera.toWorld(s, vp),
      toScreen: (w: Vec2) => camera.toScreen(w, vp),
      snapWorld: (w: Vec2) => camera.snapWorld(w),
      scale: camera.scale,
    };
  }

  function findControllerAt(input: PointerInput, viewport: Viewport) {
    const ec = makeEventCtx(viewport);
    const specs = refs.bundle.controllers({ state: refs.state }) as ControllerSpec[];
    for (const spec of specs) {
      const impl = host.controllerRegistry.get(spec.type);
      if (!impl) continue;
      if (impl.hitTest(input, ec, spec, refs.state as BundleState)) {
        return { spec, impl };
      }
    }
    return null;
  }

  function applyPartial(patch: unknown) {
    if (patch === null || patch === undefined) return;
    refs.state = patch as T;
  }

  function onPointerDown(e: PointerEvent) {
    const vp = sizeCanvas();
    const input = toPointerInput(e);
    const hit = findControllerAt(input, vp);
    if (hit?.impl) {
      try { canvas.setPointerCapture(e.pointerId); } catch { /* noop */ }
      activeController = hit;
      const patch = hit.impl.onPointerDown(input, makeEventCtx(vp), hit.spec, refs.state as BundleState);
      applyPartial(patch);
      return;
    }
    if (e.button === 0 || e.button === 1) {
      try { canvas.setPointerCapture(e.pointerId); } catch { /* noop */ }
      panning = {
        startPx: input.px,
        startPy: input.py,
        lastPx: input.px,
        lastPy: input.py,
        active: false,
      };
    }
  }
  function onPointerMove(e: PointerEvent) {
    const vp = sizeCanvas();
    const input = toPointerInput(e);
    if (activeController?.impl) {
      const patch = activeController.impl.onPointerMove(
        input,
        makeEventCtx(vp),
        activeController.spec,
        refs.state as BundleState,
      );
      applyPartial(patch);
      return;
    }
    if (panning) {
      if (!panning.active) {
        const ddx = input.px - panning.startPx;
        const ddy = input.py - panning.startPy;
        if (ddx * ddx + ddy * ddy < 25) return;
        panning.active = true;
        panning.lastPx = input.px;
        panning.lastPy = input.py;
        return;
      }
      const dxScreen = input.px - panning.lastPx;
      const dyScreen = input.py - panning.lastPy;
      if (dxScreen === 0 && dyScreen === 0) return;
      panning.lastPx = input.px;
      panning.lastPy = input.py;
      const dxWorld = dxScreen / camera.scale;
      const dyWorld = -dyScreen / camera.scale;
      camera.pan(dxWorld, dyWorld);
    }
  }
  function onPointerUp(e: PointerEvent) {
    const vp = sizeCanvas();
    const input = toPointerInput(e);
    if (activeController?.impl) {
      const patch = activeController.impl.onPointerUp(
        input,
        makeEventCtx(vp),
        activeController.spec,
        refs.state as BundleState,
      );
      applyPartial(patch);
      try { canvas.releasePointerCapture(e.pointerId); } catch { /* noop */ }
      activeController = null;
      return;
    }
    if (panning) {
      panning = null;
      try { canvas.releasePointerCapture(e.pointerId); } catch { /* noop */ }
    }
  }
  function onWheel(e: WheelEvent) {
    e.preventDefault();
    const vp = sizeCanvas();
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const worldCenter = camera.toWorld([sx, sy], vp);
    const factor = Math.exp(-e.deltaY * 0.0015);
    camera.zoom(factor, worldCenter);
  }

  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointercancel', onPointerUp);
  canvas.addEventListener('wheel', onWheel, { passive: false });

  function frame(now: number) {
    if (disposed) return;
    const realDt = Math.min(0.05, (now - lastT) / 1000);
    lastT = now;

    const vp = sizeCanvas();
    const theme = host.theme;
    const i18n = scopedI18n;
    const b = refs.bundle;

    const simDt = timeEngine.tick(realDt);
    if (simDt > 0) {
      const next = b.step({ state: refs.state, dt: simDt, stage: refs.stage, environments: refs.envs });
      if (next !== refs.state) refs.state = next;
      if (b.isTerminated?.(next)) timeEngine.markTerminated();
    }

    const isTerm = b.isTerminated?.(refs.state) ?? false;
    if (wasTerminated && !isTerm) camera.userAdjusted = false;
    wasTerminated = isTerm;

    if (!camera.userAdjusted && b.boundsHint) {
      const bounds = b.boundsHint(refs.state, refs.stage);
      camera.fitToBounds(bounds, vp, {
        padding: 12,
        screenMargins: HUD_MARGINS,
      });
    }

    particles.setKind('none', vp);
    particles.update(realDt, vp);

    ctx!.save();
    ctx!.scale(dpr, dpr);
    ctx!.clearRect(0, 0, vp.width, vp.height);
    ctx!.fillStyle = theme.background;
    ctx!.fillRect(0, 0, vp.width, vp.height);
    particles.render(ctx!, theme);
    // 그리드는 선언이 켜야 나온다 (원칙 4, R9). react/embed/Canvas.tsx 와 같은 규약.
    if (b.schema.chrome?.grid) drawAxisGrid(ctx!, vp, camera, theme);

    const sceneGraph = b.scene({
      state: refs.state,
      view: refs.view,
      stage: refs.stage,
      environments: refs.envs,
    });
    const { refs: sceneRefs, orderedScene } = preprocessScene(sceneGraph);
    const sortedScene = [...orderedScene].sort(
      (a, b) => host.rendererRegistry.getZ(a.type) - host.rendererRegistry.getZ(b.type),
    );

    const rc: RenderContext = {
      ctx: ctx!,
      toScreen: (world: Vec2) => camera.toScreen(world, vp),
      toWorld: (screen: Vec2) => camera.toWorld(screen, vp),
      scale: camera.scale,
      viewport: vp,
      theme,
      i18n,
      time: timeEngine.currentTime,
      deltaTime: simDt,
      scene: sceneRefs,
      measure: createMeasure(ctx!, theme.fontFamily),
    };

    host.pluginManager.runFrameHooks(rc);

    for (const p of sortedScene as Primitive[]) {
      const renderer = host.rendererRegistry.get(p.type);
      if (!renderer) continue;
      renderer(rc, p, sceneRefs);
    }

    const controllerSpecs = b.controllers({ state: refs.state }) as ControllerSpec[];
    for (const spec of controllerSpecs) {
      const impl = host.controllerRegistry.get(spec.type);
      if (!impl) continue;
      impl.render({ ...rc, viewport: vp }, spec, refs.state as BundleState);
    }

    ctx!.restore();

    rafId = requestAnimationFrame(frame);
  }

  rafId = requestAnimationFrame(frame);

  return {
    destroy() {
      if (disposed) return;
      disposed = true;
      cancelAnimationFrame(rafId);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
      canvas.removeEventListener('wheel', onWheel);
      try { wrapper.remove(); } catch { /* noop */ }
    },
  };
}

function createMeasure(ctx: CanvasRenderingContext2D, fontFamily: string): MeasureService {
  return {
    textWidth(text, fontSize) {
      ctx.save();
      ctx.font = `${fontSize}px ${fontFamily}`;
      const w = ctx.measureText(text).width;
      ctx.restore();
      return w;
    },
    textBounds(text, fontSize) {
      return { width: this.textWidth(text, fontSize), height: fontSize * 1.2 };
    },
  };
}

/**
 * 월드 좌표 m 단위 거리 축 그리드. react/embed/Canvas.tsx 의 drawAxisGrid 와
 * 동일 로직을 NodeView 마운트용으로 복제. 두 진입점이 같은 시각 언어를 공유한다.
 */
function drawAxisGrid(
  ctx: CanvasRenderingContext2D,
  viewport: Viewport,
  camera: Camera,
  theme: { foreground: string; muted: string; line: string; fontFamilyMono: string },
): void {
  const scale = camera.scale;
  if (!isFinite(scale) || scale <= 0) return;

  const targetPx = 70;
  const rawStep = targetPx / scale;
  const pow10 = Math.pow(10, Math.floor(Math.log10(Math.max(1e-6, rawStep))));
  const norm = rawStep / pow10;
  const nice = norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10;
  const step = nice * pow10;

  const topLeft = camera.toWorld([0, 0], viewport);
  const bottomRight = camera.toWorld([viewport.width, viewport.height], viewport);
  const xMin = topLeft[0];
  const xMax = bottomRight[0];
  const yMin = bottomRight[1];
  const yMax = topLeft[1];

  const gridColor = withAlpha(theme.line, 0.55);
  const axisColor = withAlpha(theme.muted, 0.75);
  const labelColor = theme.muted;

  ctx.save();

  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 1;
  ctx.beginPath();
  const xStart = Math.ceil(xMin / step) * step;
  for (let x = xStart; x <= xMax + 1e-9; x += step) {
    const sx = camera.toScreen([x, 0], viewport)[0];
    ctx.moveTo(sx, 0);
    ctx.lineTo(sx, viewport.height);
  }
  const yStart = Math.ceil(yMin / step) * step;
  for (let y = yStart; y <= yMax + 1e-9; y += step) {
    const sy = camera.toScreen([0, y], viewport)[1];
    ctx.moveTo(0, sy);
    ctx.lineTo(viewport.width, sy);
  }
  ctx.stroke();

  if (xMin <= 0 && xMax >= 0) {
    const [sx] = camera.toScreen([0, 0], viewport);
    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(sx, 0);
    ctx.lineTo(sx, viewport.height);
    ctx.stroke();
  }
  if (yMin <= 0 && yMax >= 0) {
    const [, sy] = camera.toScreen([0, 0], viewport);
    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, sy);
    ctx.lineTo(viewport.width, sy);
    ctx.stroke();
  }

  const decimals = step < 1 ? (step < 0.1 ? 2 : 1) : 0;
  const fmt = (v: number) => `${v.toFixed(decimals)}m`;

  ctx.fillStyle = labelColor;
  ctx.font = `11px ${theme.fontFamilyMono}`;

  const yAxisScreen =
    yMin <= 0 && yMax >= 0
      ? camera.toScreen([0, 0], viewport)[1]
      : viewport.height - 16;
  const xLabelY = Math.max(14, Math.min(viewport.height - 4, yAxisScreen + 14));
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  for (let x = xStart; x <= xMax + 1e-9; x += step) {
    if (Math.abs(x) < step / 2) continue;
    const sx = camera.toScreen([x, 0], viewport)[0];
    if (sx < 20 || sx > viewport.width - 40) continue;
    ctx.fillText(fmt(x), sx + 3, xLabelY);
  }

  const xAxisScreen =
    xMin <= 0 && xMax >= 0
      ? camera.toScreen([0, 0], viewport)[0]
      : 12;
  const yLabelX = Math.max(4, Math.min(viewport.width - 40, xAxisScreen + 4));
  ctx.textAlign = 'left';
  for (let y = yStart; y <= yMax + 1e-9; y += step) {
    if (Math.abs(y) < step / 2) continue;
    const sy = camera.toScreen([0, y], viewport)[1];
    if (sy < 12 || sy > viewport.height - 20) continue;
    ctx.fillText(fmt(y), yLabelX, sy - 3);
  }

  ctx.restore();
}

function withAlpha(color: string, alpha: number): string {
  const hex = color.replace('#', '');
  if (hex.length === 6) {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return color;
}
