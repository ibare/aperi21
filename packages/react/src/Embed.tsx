import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import type { Bundle, BundleState } from '@aperi21/schema';
import { Camera, createTimeEngine } from '@aperi21/host';
import { useHost } from './hooks/useHost';
import { useI18n } from './hooks/useI18n';
import { useTheme } from './hooks/useTheme';
import { BundleCanvas } from './embed/Canvas';
import { TopBar } from './embed/TopBar';
import { ViewTabs } from './embed/ViewTabs';
import { InfoPanel } from './embed/InfoPanel';
import { CameraControls } from './embed/CameraControls';
import { EnergyHUD } from './embed/EnergyHUD';
import { ParamPanel } from './embed/ParamPanel';
import { StageOverlay } from './embed/StageOverlay';
import { useBundleRuntime } from './embed/useBundleRuntime';

export interface EmbedProps {
  bundle: Bundle;
  stageId?: string;
  initialValues?: Record<string, number>;
  initialView?: string;
  initialEnvironments?: string[];
  /**
   * **검사 전용.** 이 시각(초)까지 고정 dt 로 미리 돌린 뒤 시간을 멈춘다.
   *
   * 자유 구현본과 같은 시각에 스크린샷을 찍어 나란히 비교하기 위한 것이다
   * (`scripts/piece-report.mts --sims`). **S-piece 의 프리롤이 아니다** — "도착한 순간
   * 이미 진행 중" 은 저작 결정이라 선언에 둬야 하고(원칙 2), 호스트 옵션으로 흉내 내면
   * 저작자가 손댈 수 없는 시작 시점이 된다.
   *
   * 한계: 렌더러 안에서 적분하는 어휘(`filament` · `vortexField`)는 이것으로 전진하지
   * 않는다. 그 상태는 `bundle.step` 이 아니라 `rc.store` 에 있다.
   */
  inspectAt?: number;
}

/** 검사 시각 이동의 고정 dt. `tasks/piece-lab/_harness/piece-kit.js` 의 DT 와 같아야 비교가 성립한다. */
const INSPECT_DT = 1 / 60;
/** 동기 루프가 메인 스레드를 막으므로 상한을 둔다(초). */
const INSPECT_MAX_T = 60;

export function Embed({ bundle, stageId, initialView, initialEnvironments, inspectAt }: EmbedProps) {
  const host = useHost();
  const theme = useTheme();
  // 러너가 조회기를 하나만 만들어 오버레이 UI 전체에 같은 것을 넘긴다 (C1).
  // 각자 만들면 저작자 오버라이드 적용 여부가 갈려 문안 출처가 섞인다.
  const hostI18n = useI18n();
  const i18n = useMemo(
    () => hostI18n.withMessages(bundle.schema.messages),
    [hostI18n, bundle.schema.messages],
  );

  const runtime = useBundleRuntime<BundleState>(
    bundle,
    stageId,
    initialView,
    initialEnvironments,
  );

  const [derived, setDerived] = useState<Record<string, number> | null>(null);
  const resetCameraRef = useRef<() => void>(() => {});
  const registerResetCamera = useCallback((fn: () => void) => {
    resetCameraRef.current = fn;
  }, []);

  // 카메라·시간 엔진은 이 Embed 인스턴스 전용이다. host(공유 레지스트리)에 두지 않아야
  // 같은 host 를 공유하는 다른 임베드와 패닝·줌·재생이 묶이지 않는다. timeEngine 은
  // 번들 timeModel 을 따른다(setTimeMode 경로 없이도 정확).
  const cameraRef = useRef<Camera | null>(null);
  if (!cameraRef.current) {
    cameraRef.current = new Camera({ screenYBias: bundle.schema.camera?.screenYBias });
  }
  const camera = cameraRef.current;
  const timeEngine = useMemo(
    () => createTimeEngine(bundle.schema.timeModel ?? 'linear'),
    [bundle.schema.timeModel],
  );

  // stage 변경 시 카메라·타임엔진도 함께 리셋 (userAdjusted=false 로)
  useEffect(() => {
    // 세로 편향은 선언이 정한다. 번들이 바뀌면 따라간다.
    camera.screenYBias = bundle.schema.camera?.screenYBias ?? 0;
    camera.reset();
    timeEngine.reset();
    timeEngine.start();

    // 검사 시각 이동. 여기(Embed)에 두는 이유 — React 는 자식 effect 를 먼저 돌려서,
    // Canvas 에서 하면 뒤이어 도는 이 effect 의 reset() 이 시각을 0 으로 되돌린다.
    // t=0 도 검사 시각이다 — 첫 프레임에 멈춰야 도착 순간을 원본과 비교할 수 있다.
    if (inspectAt !== undefined && bundle.schema.timeModel !== 'static') {
      const target = Math.min(inspectAt, INSPECT_MAX_T);
      const steps = Math.round(target / INSPECT_DT);
      let state = runtime.stateRef.current;
      for (let i = 0; i < steps; i++) {
        if (bundle.isTerminated?.(state)) {
          timeEngine.markTerminated();
          break;
        }
        state = bundle.step({
          state,
          dt: INSPECT_DT,
          stage: runtime.stage,
          environments: runtime.environments,
        });
      }
      runtime.replaceState(state);
      timeEngine.seek(target);
      timeEngine.pause();
    }
    // runtime 의 stage·environments·stateRef 는 stageId·resetSignal 과 함께 바뀐다.
    // eslint 는 쓰지 않지만 의도를 남긴다 — 이 effect 는 리셋 시점에만 돈다.
  }, [camera, timeEngine, runtime.resetSignal, runtime.stageId, bundle, inspectAt]);

  const wrapper: CSSProperties = {
    background: theme.background,
    color: theme.foreground,
    borderRadius: theme.radiusMedium * 2,
    fontFamily: theme.fontFamily,
    border: `1px solid ${theme.line}`,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 480,
  };
  const stageArea: CSSProperties = {
    position: 'relative',
    flex: 1,
    minHeight: 400,
    background: theme.background,
  };
  /**
   * 오른쪽 오버레이 열. InfoPanel 과 StageOverlay 가 여기 쌓인다.
   *
   * 예전에는 각자 `position: absolute` 로 자리를 잡았고 StageOverlay 가
   * `top: 140` 이라는 매직 넘버로 InfoPanel 아래를 가정했다. 패널 높이는 파생값
   * 개수에 따라 달라져서, 큰 화면에서 둘이 겹쳤다.
   */
  const rightColumn: CSSProperties = {
    position: 'absolute',
    top: 12,
    right: 12,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 8,
    pointerEvents: 'none',
  };

  const showEnergy =
    runtime.viewId === 'energy' && bundle.schema.autoViews?.energy !== false;

  return (
    <div className="aperi21-embed" data-theme={theme.mode} style={wrapper}>
      <TopBar
        schema={bundle.schema}
        theme={theme}
        i18n={i18n}
        stageId={runtime.stageId}
        envIds={runtime.envIds}
        onSelectStage={runtime.setStageId}
        onToggleEnv={runtime.toggleEnv}
      />
      <div style={stageArea}>
        <BundleCanvas
          host={host}
          camera={camera}
          timeEngine={timeEngine}
          bundle={bundle}
          stage={runtime.stage}
          view={runtime.view}
          environments={runtime.environments}
          stateRef={runtime.stateRef}
          onStateChange={runtime.replaceState}
          onDerived={setDerived}
          registerResetCamera={registerResetCamera}
        />
        <ViewTabs
          schema={bundle.schema}
          theme={theme}
          i18n={i18n}
          viewId={runtime.viewId}
          onSelectView={runtime.setViewId}
        />
        <div style={rightColumn}>
          <InfoPanel theme={theme} i18n={i18n} derived={derived} />
          <StageOverlay
            theme={theme}
            i18n={i18n}
            stage={runtime.stage}
            environments={runtime.environments}
          />
        </div>
        {showEnergy && <EnergyHUD theme={theme} i18n={i18n} derived={derived} />}
        <ParamPanel
          theme={theme}
          i18n={i18n}
          schema={bundle.schema}
          values={runtime.paramValues}
          state={runtime.state}
          onChange={runtime.setParam}
          onReset={runtime.reset}
        />
        {/*
          카메라 버튼은 선언이 켜야 나온다. 프레이밍이 곧 주장인 그림에서는
          독자가 프레임을 넓히는 것 자체가 오독의 경로다 (원칙 4, R9).
        */}
        {bundle.schema.chrome?.cameraControls && (
          <CameraControls
            theme={theme}
            i18n={i18n}
            onReset={() => resetCameraRef.current()}
            onResetBundle={runtime.reset}
          />
        )}
      </div>
    </div>
  );
}
