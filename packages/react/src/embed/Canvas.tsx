import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
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
import {
  BackgroundParticleSystem,
  preprocessScene,
  type Host,
  type Viewport,
  type PointerInput,
} from '@aperi21/host';
import { resolveBackgroundKind } from './backgroundKind';

export interface BundleCanvasProps<T extends BundleState = BundleState> {
  host: Host;
  bundle: Bundle<T>;
  stage: StageDef;
  view: ViewDef;
  environments: EnvironmentDef[];
  stateRef: React.MutableRefObject<T>;
  onStateChange(next: T): void;
  onDerived(values: Record<string, number> | null): void;
  registerResetCamera?(fn: () => void): void;
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

export function BundleCanvas<T extends BundleState>(props: BundleCanvasProps<T>) {
  const {
    host,
    bundle,
    stage,
    view,
    environments,
    stateRef,
    onStateChange,
    onDerived,
    registerResetCamera,
  } = props;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 최신 props 를 RAF 루프에서 읽기 위한 refs
  const bundleRef = useRef(bundle);
  const stageRef = useRef(stage);
  const viewRef = useRef(view);
  const envRef = useRef(environments);
  const onStateChangeRef = useRef(onStateChange);
  const onDerivedRef = useRef(onDerived);
  bundleRef.current = bundle;
  stageRef.current = stage;
  viewRef.current = view;
  envRef.current = environments;
  onStateChangeRef.current = onStateChange;
  onDerivedRef.current = onDerived;

  // 카메라 리셋을 상위로 노출
  useEffect(() => {
    registerResetCamera?.(() => host.camera.reset());
  }, [host, registerResetCamera]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const particles = new BackgroundParticleSystem();
    host.timeEngine.reset();
    host.timeEngine.start();

    let disposed = false;
    let rafId = 0;
    let lastT = performance.now();
    let activeController: {
      spec: ControllerSpec;
      impl: ReturnType<typeof host.controllerRegistry.get>;
    } | null = null;

    function sizeCanvas(): Viewport {
      const rect = canvas!.getBoundingClientRect();
      const w = Math.max(1, Math.floor(rect.width));
      const h = Math.max(1, Math.floor(rect.height));
      if (canvas!.width !== w * dpr || canvas!.height !== h * dpr) {
        canvas!.width = w * dpr;
        canvas!.height = h * dpr;
      }
      return { width: w, height: h };
    }

    function toPointerInput(e: PointerEvent): PointerInput {
      const rect = canvas!.getBoundingClientRect();
      return {
        px: e.clientX - rect.left,
        py: e.clientY - rect.top,
        button: e.button,
        buttons: e.buttons,
      };
    }

    function findControllerAt(input: PointerInput, viewport: Viewport) {
      const specs = bundleRef.current.controllers({ state: stateRef.current }) as ControllerSpec[];
      for (const spec of specs) {
        const impl = host.controllerRegistry.get(spec.type);
        if (!impl) continue;
        if (impl.hitTest(input, viewport, spec, stateRef.current as BundleState)) {
          return { spec, impl };
        }
      }
      return null;
    }

    function applyPartial(patch: unknown) {
      if (patch === null || patch === undefined) return;
      // 현재 구현은 writePath 로 전체 state 를 반환 — 그대로 교체.
      const next = patch as T;
      stateRef.current = next;
      onStateChangeRef.current(next);
    }

    function onPointerDown(e: PointerEvent) {
      const vp = sizeCanvas();
      const input = toPointerInput(e);
      const hit = findControllerAt(input, vp);
      if (!hit?.impl) return;
      canvas!.setPointerCapture(e.pointerId);
      activeController = hit;
      const patch = hit.impl.onPointerDown(input, vp, hit.spec, stateRef.current as BundleState);
      applyPartial(patch);
    }
    function onPointerMove(e: PointerEvent) {
      if (!activeController?.impl) return;
      const vp = sizeCanvas();
      const input = toPointerInput(e);
      const patch = activeController.impl.onPointerMove(
        input,
        vp,
        activeController.spec,
        stateRef.current as BundleState,
      );
      applyPartial(patch);
    }
    function onPointerUp(e: PointerEvent) {
      if (!activeController?.impl) return;
      const vp = sizeCanvas();
      const input = toPointerInput(e);
      const patch = activeController.impl.onPointerUp(
        input,
        vp,
        activeController.spec,
        stateRef.current as BundleState,
      );
      applyPartial(patch);
      try {
        canvas!.releasePointerCapture(e.pointerId);
      } catch {
        /* noop */
      }
      activeController = null;
    }

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);

    const frame = (now: number) => {
      if (disposed) return;
      const realDt = Math.min(0.05, (now - lastT) / 1000);
      lastT = now;

      const vp = sizeCanvas();
      const theme = host.theme;
      const i18n = host.i18n;
      const bundle = bundleRef.current;
      const stage = stageRef.current;
      const view = viewRef.current;
      const envs = envRef.current;

      // 물리 스텝 — 종료되지 않았고 timeEngine 이 running 일 때만
      const simDt = host.timeEngine.tick(realDt);
      if (simDt > 0) {
        const nextState = bundle.step({ state: stateRef.current, dt: simDt, stage, environments: envs });
        if (nextState !== stateRef.current) {
          stateRef.current = nextState;
          onStateChangeRef.current(nextState);
        }
        if (bundle.isTerminated?.(nextState)) {
          host.timeEngine.markTerminated();
        }
      }

      // 카메라 자동 프레이밍
      if (!host.camera.userAdjusted && bundle.boundsHint) {
        const bounds = bundle.boundsHint(stateRef.current, stage);
        host.camera.fitToBounds(bounds, vp, 48);
      }

      // 배경 입자
      particles.setKind(resolveBackgroundKind(stage, envs), vp);
      particles.update(realDt, vp);

      // 캔버스 클리어 + 배경
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, vp.width, vp.height);
      ctx.fillStyle = theme.background;
      ctx.fillRect(0, 0, vp.width, vp.height);

      // 배경 입자
      particles.render(ctx, theme);

      // Scene Graph 렌더
      const sceneGraph = bundle.scene({ state: stateRef.current, view });
      const { refs, orderedScene } = preprocessScene(sceneGraph);
      const sortedScene = [...orderedScene].sort(
        (a, b) => host.rendererRegistry.getZ(a.type) - host.rendererRegistry.getZ(b.type),
      );

      const rc: RenderContext = {
        ctx,
        toScreen: (world: Vec2) => host.camera.toScreen(world, vp),
        toWorld: (screen: Vec2) => host.camera.toWorld(screen, vp),
        scale: host.camera.scale,
        viewport: vp,
        theme,
        i18n,
        time: host.timeEngine.currentTime,
        deltaTime: simDt,
        scene: refs,
        measure: createMeasure(ctx, theme.fontFamily),
      };

      for (const p of sortedScene as Primitive[]) {
        const renderer = host.rendererRegistry.get(p.type);
        if (!renderer) continue;
        renderer(rc, p, refs);
      }

      // Controller 렌더 (스크린 오버레이)
      const controllerSpecs = bundle.controllers({ state: stateRef.current }) as ControllerSpec[];
      for (const spec of controllerSpecs) {
        const impl = host.controllerRegistry.get(spec.type);
        if (!impl) continue;
        impl.render({ ...rc, viewport: vp }, spec, stateRef.current as BundleState);
      }

      ctx.restore();

      // 파생값 발행
      const dv = bundle.derivedValues?.(stateRef.current, stage) ?? null;
      onDerivedRef.current(dv);

      rafId = requestAnimationFrame(frame);
    };

    rafId = requestAnimationFrame(frame);

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
    };
  }, [host]);

  const style: CSSProperties = {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    display: 'block',
    touchAction: 'none',
  };
  return <canvas ref={canvasRef} style={style} />;
}
