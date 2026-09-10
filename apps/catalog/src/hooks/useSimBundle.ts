import { useEffect, useState } from 'react';
import type { Bundle } from '@aperi21/schema';
import { loadBundle } from '@aperi21/host';

/**
 * `aperi21:<id>` 로 조각을 불러온다.
 *
 * 예전에는 카탈로그가 sim 패키지를 **정적으로** import 해 표를 만들어 두고
 * (`mocks/phase1-bundles.ts`) 그것을 `Embed` 에 넘겼다. 그러면 두 가지가 어긋난다.
 *
 *  - 조각 여섯이 전부 첫 화면에 실린다. lazy 가 죽는다 (R10)
 *  - 조각이 들고 오는 능력(`registerBundle` 의 세 번째 인자)을 못 받는다.
 *    레지스트리를 거치지 않으니 배선이 없다
 *
 * 그래서 실제 소비자와 **같은 경로**를 쓴다 — 레지스트리 조회. 카탈로그가
 * 특별 경로를 쓰면 "실제 호스트에서 되는지" 를 여기서 검증하지 못한다.
 */
export function useSimBundle(simId: string | undefined): Bundle | null {
  const [bundle, setBundle] = useState<Bundle | null>(null);

  useEffect(() => {
    if (!simId) {
      setBundle(null);
      return;
    }
    let alive = true;
    setBundle(null);
    void loadBundle(simId).then((b) => {
      if (alive) setBundle(b);
    });
    return () => {
      alive = false;
    };
  }, [simId]);

  return bundle;
}
