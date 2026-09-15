import { useEffect, useRef } from 'react';
import type { Bundle } from '@aperi21/schema';
import { runBundle } from '@aperi21/host';
import { useHost } from './hooks/useHost';
import { useTheme } from './hooks/useTheme';

/**
 * 조각을 React 트리에 붙인다.
 *
 * **여기에 시각화 코드는 없다.** 그리기·조작기·카메라·시간은 전부 `runBundle` 이
 * 한다. 이 컴포넌트가 하는 일은 붙일 자리를 만들고 라이프사이클을 잇는 것뿐이다.
 *
 * 예전에는 이 파일 아래 `embed/Canvas.tsx` 가 `runBundle` 과 **같은 RAF 루프를
 * 복제**하고 있었고, 그 위에 React 오버레이 7종이 얹혀 있었다. 복제는 곧 갈라졌다 —
 * 배경 입자가 카탈로그에만 있었고, 프레이밍 여백이 한쪽만 조작기를 셌다. 같은
 * 조각이 카탈로그와 외부 호스트에서 다른 화면으로 열렸다는 뜻이다.
 *
 * 오버레이는 조작기 어휘로 옮겼다. 화면에 뜨는 것은 이제 조각의 선언이 정한다
 * (원칙 2 · 7).
 */
export interface EmbedProps {
  bundle: Bundle;
  stageId?: string;
  initialValues?: Record<string, number>;
  initialView?: string;
  initialEnvironments?: string[];
  /**
   * **검사 전용.** 이 시각(초)까지 고정 걸음으로 미리 굴린 뒤 시간을 멈춘다.
   * `runBundle` 의 같은 이름 옵션으로 그대로 넘어간다.
   */
  inspectAt?: number;
}

export function Embed({
  bundle,
  stageId,
  initialValues,
  initialView,
  initialEnvironments,
  inspectAt,
}: EmbedProps) {
  const host = useHost();
  const theme = useTheme();
  const mountRef = useRef<HTMLDivElement>(null);

  // 배열·객체 프롭은 매 렌더 새 참조로 올 수 있다. 그대로 의존에 넣으면 조각이
  // 프레임마다 다시 마운트된다 — 값으로 바꿔 센다.
  const envKey = initialEnvironments?.join(',') ?? '';
  const valueKey = initialValues ? JSON.stringify(initialValues) : '';

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const handle = runBundle(bundle, mount, {
      host,
      stageId,
      viewId: initialView,
      environmentIds: envKey ? envKey.split(',') : undefined,
      values: valueKey ? (JSON.parse(valueKey) as Record<string, number>) : undefined,
      inspectAt,
    });
    // RAF 루프 · 리스너 · 포인터 캡처를 전부 거둔다 (C5).
    return () => handle.destroy();
  }, [bundle, host, stageId, initialView, envKey, valueKey, inspectAt]);

  return <div className="aperi21-embed" data-theme={theme.mode} ref={mountRef} />;
}
