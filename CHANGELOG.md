# Changelog

발행 대상 세 패키지(`@aperi21/host` · `@aperi21/host-tiptap-bundle` · `@aperi21/authoring`)는
lockstep 으로 같은 버전을 쓴다. 0.x 동안은 minor 를 breaking 허용 구간으로 본다.

## 0.2.0 — 미발행

### Breaking

- **`@aperi21/host` 가 따로 발행되고, 번들의 peer 가 되었다.** 0.1.0 은 런타임을 번들
  안에 품었다. 이제 호스트가 함께 설치해 단일 인스턴스로 공유한다 — 번들이 런타임을
  품으면 레지스트리 사본이 둘이 되어, 부팅이 등록한 시각화를 재생이 찾지 못한다.

  ```sh
  npm install @aperi21/host-tiptap-bundle @aperi21/host @tiptap/core@^3 @tiptap/pm@^3
  ```

- **0.1.0 의 조각 id 세 개가 없어졌다.** 세 기구가 한 화면에 담던 주장을 한 주장짜리
  조각 여섯으로 나눴다. 옛 id 는 별칭 없이 사라졌으므로(등록 키는 한 대상에 한 이름),
  문서에 남은 옛 토큰은 오류 표시로 렌더된다. 저장된 글에서 바꿔 써야 한다.

  | 0.1.0 | 0.2.0 에서 가까운 조각 |
  | --- | --- |
  | `{aperi21:projectile}` | `projectile-range` (발사각과 사거리) · `range-and-surface-gravity` (중력 크기) · `projectile-in-wind` (바람) |
  | `{aperi21:ray-tracing}` | `thin-lens` (세 광선 작도) · `focal-length` (초점 거리) |
  | `{aperi21:dc-circuit}` | `series-parallel-resistors` (직렬과 병렬) |

  하나가 여럿으로 나뉜 자리는 글의 맥락에 맞는 것을 고른다. 기계적으로 바꾸면 안 된다.

- **`getAperi21Catalog` 가 비동기이고 한 언어를 돌려준다.**

  ```ts
  // 0.1.0
  const entries = getAperi21Catalog();          // readonly Aperi21CatalogEntry[]
  entries[0].title.ko;                          // LocalizedText

  // 0.2.0
  const catalog = await getAperi21Catalog('ko'); // Aperi21Catalog
  catalog.locale;                                // 실제로 담긴 언어 — 없는 언어면 'en'
  catalog.domains;                               // [{ id, name }]
  catalog.entries[0].title;                      // string (이미 그 언어)
  ```

  언어마다 따로 된 chunk 라 요청한 언어 하나만 내려받는다.

- **카탈로그 항목의 `domain` 값이 11분과 id 로 바뀌었다.** 0.1.0 의 `optics` ·
  `electromagnetism` 은 그대로 남고 `mechanics` 는 없어졌다 — 역학은 여러 분과로 나뉜다.
  11분과는 `kinematics` · `newtonian-mechanics` · `energy-momentum` ·
  `rotation-oscillation` · `gravitation` · `fluids` · `thermodynamics` · `waves-acoustics` ·
  `optics` · `electromagnetism` · `modern-physics`. 이름표는 `catalog.domains` 에 있다.

- **`renderBundleMarkdown` 을 뺐다.** 마크다운 → HTML 변환 편의 함수였는데, 실제
  호스트는 제 마크다운 파이프라인에서 토큰을 바꾸므로 쓰지 않았고, 번들 첫 로딩에
  marked(gzip 약 18KB)를 싣고 있었다. 마크다운 변환은 호스트의 몫이다 — 토큰
  `{aperi21:<id>}` 을 아래 자리표시로 바꿔 에디터에 넘기면 된다.

  ```html
  <span data-aperi21="true" data-aperi21-id="aperi21:free-fall"></span>
  ```

  `data-aperi21` 표지와 비어 있지 않은 `data-aperi21-id` 가 둘 다 있어야 노드로 읽힌다.
  인라인 코드와 코드 펜스 안의 토큰은 바꾸지 않는 것이 맞다.
- **`BundleSchema.operation` 을 `description` 으로 바꿨다.** 호스트 카탈로그의 한 줄 설명
  (`entries[].description`)이 이 필드에서 나온다. `BundleSchema` 는 `@aperi21/host` 의 `.d.ts`
  에 실리므로 조각을 직접 선언하는 소비자에게는 필드 이름이 바뀐다. 카탈로그 항목의 모양은
  그대로다. 한 줄 설명의 원본은 주제 목록(`docs/topics/topics.yaml` 의 `desc`)이고 조각은 그
  파생값을 가진다 — 카탈로그 설명 444개의 문구가 주제 설명으로 맞춰졌다.

### 추가

- 조각 3개 → 444개. 주제 하나에 조각 하나이고, 조각 id 가 주제 id 다.
- 열 언어 — `en` · `ko` · `ja` · `zh` · `es` · `fr` · `pt` · `id` · `hi` · `ar`. 카탈로그 ·
  조각 화면 문자열 · 조작기 공통 문구가 모두 열 언어를 채운다.
- `loadFrameworkMessages(locale)` — 조작기·배지 공통 문구를 그 언어로 등록한다.
  `createAperi21Extension` 이 알아서 부르지만 기다리지 않으므로, 첫 화면부터 그 언어로
  띄우려면 먼저 `await` 한다.
- `createAperi21Extension({ theme })` 이 모드 이름 외에 완성된 테마 한 벌(`HostTheme`)도
  받는다.
- **`@aperi21/authoring`** 첫 발행 — 호스트 LLM 파이프라인용 개념 메타 444개
  (`surface` 는 임베딩 재료, `briefing` 은 선택 이후 writer 에게 넘길 재료). 의존 0.

### 고침

- 개념 메타의 `briefing.screen.labels` 에서 조각 제목과 한 줄 설명을 뺐다. 이 목록은 「화면에
  그려지는 글자」인데 둘은 카탈로그에만 쓰이고 임베드에는 그려지지 않는다.

- 0.1.0 의 `.d.ts` 가 발행되지 않은 private 패키지를 import 해 소비자 쪽 타입이 전부
  끊겨 있었다. 타입을 발행본 안에 인라인한다.
- 발행본에서 소스맵을 뺐다. 맵이 가리킬 소스가 발행본에 없고, 번들 크기의 대부분이었다.

## 0.1.0 — 2026-06-16

- `@aperi21/host-tiptap-bundle` 첫 공개 발행. 조각 셋(`projectile` · `ray-tracing` ·
  `dc-circuit`).
- 알려진 결함: 발행본 `.d.ts` 가 미발행 패키지를 참조해 타입이 끊긴다 (0.2.0 에서 고침).
