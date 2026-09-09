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
}

export function Embed({ bundle, stageId, initialView, initialEnvironments }: EmbedProps) {
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
  if (!cameraRef.current) cameraRef.current = new Camera();
  const camera = cameraRef.current;
  const timeEngine = useMemo(
    () => createTimeEngine(bundle.schema.timeModel ?? 'linear'),
    [bundle.schema.timeModel],
  );

  // stage 변경 시 카메라·타임엔진도 함께 리셋 (userAdjusted=false 로)
  useEffect(() => {
    camera.reset();
    timeEngine.reset();
    timeEngine.start();
  }, [camera, timeEngine, runtime.resetSignal, runtime.stageId]);

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
        <CameraControls
          theme={theme}
          i18n={i18n}
          onReset={() => resetCameraRef.current()}
          onResetBundle={runtime.reset}
        />
      </div>
    </div>
  );
}
