# @aperi21/host-tiptap-bundle

외부 호스트 앱(예: 노트 에디터)이 소비하는 ESM 번들이다.
[Tiptap](https://tiptap.dev) 확장 하나로, LLM이 생성한 설명문 안에 `{aperi21:<id>}` 토큰으로
끼어드는 인터랙티브 물리 시각화를 에디터에 렌더링한다.

`@aperi21/host-tiptap` + `@aperi21/bootstrap` + 모든 `sim-*` / `plugin-*`을 하나의 번들로
묶었으며, sim과 plugin은 동적 import 청크로 분리되어 **사용하는 시각화만 lazy 로드**된다.
런타임 `@aperi21/host` 는 묶지 않는다 — 호스트가 peer 로 함께 설치한다 (아래).

담긴 것 — 조각 445개(11분과), 열 언어(`ko` · `en` · `ja` · `zh` · `ar` · `es` · `fr` · `hi` · `id` · `pt`)의 카탈로그와 화면 문구.

0.1.0 에서 올린다면 먼저 [0.1.0 에서 옮겨 오기](#010-에서-옮겨-오기)를 본다.

## 설치

```bash
npm install @aperi21/host-tiptap-bundle
# 또는
pnpm add @aperi21/host-tiptap-bundle
```

### peerDependencies

아래는 호스트가 직접 설치해 단일 인스턴스로 공유한다.

```bash
npm install @aperi21/host @tiptap/core@^3 @tiptap/pm@^3
```

- `@aperi21/host` — 번들 레지스트리와 문구 저장소를 담는다. 번들이 이것을 inline 하면
  사본이 둘이 되어 부팅이 등록한 시각화를 재생이 찾지 못한다.
- `@tiptap/core`, `@tiptap/pm` — 호스트의 Tiptap 단일 인스턴스를 공유한다.

## 사용법

권장 진입점은 `createAperi21Extension` 한 줄이다. 호출마다 host가 격리되므로 한 콘텐츠에
에디터/번들이 여럿 떠도 서로 간섭하지 않는다.

```ts
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { createAperi21Extension } from '@aperi21/host-tiptap-bundle';

new Editor({
  extensions: [
    StarterKit,
    createAperi21Extension({ locale: 'ko', theme: 'light' }),
  ],
  // {aperi21:<id>} 토큰을 호스트 마크다운이 span 으로 변환한 HTML
  content: html,
});
```

### 옵션

| 옵션      | 타입                  | 설명                                     |
| --------- | --------------------- | ---------------------------------------- |
| `locale`  | `string`              | `runBundle` 및 host의 언어 (예: `'ko'`). 조작기 문구 번들도 이 언어로 불러온다. |
| `theme`   | `'light' \| 'dark' \| HostTheme` | 시각화 테마. 모드 이름이거나, 호스트의 색·치수로 갈아 끼울 완성된 한 벌(`HostTheme`, `@aperi21/host`). |

## 조작기 문구

조작기·배지가 그리는 공통 문구는 언어별 번들로 따로 실린다. `createAperi21Extension`
이 그 언어의 번들을 알아서 불러오지만 기다리지는 않는다. 첫 화면부터 그 언어로
띄우려면 먼저 기다린다.

```ts
import { loadFrameworkMessages, createAperi21Extension } from '@aperi21/host-tiptap-bundle';

await loadFrameworkMessages('ko');
const extension = createAperi21Extension({ locale: 'ko' });
```

번들이 없는 언어는 영어로 뜬다.

## 카탈로그

시각화 모듈을 로드하지 않고 "추가 가능한 시각화 목록"을 한 언어로 불러온다.

```ts
import { getAperi21Catalog } from '@aperi21/host-tiptap-bundle';

const catalog = await getAperi21Catalog('ko');
// catalog.locale  — 실제로 담긴 언어. 없는 언어를 요청하면 'en'
// catalog.domains — 분야 이름표 [{ id, name }]
// catalog.entries — [{ id, title, description?, domain }]
```

언어마다 따로 된 chunk 라 요청한 언어 하나만 내려받는다. `domains` 와 `entries` 는
분야 → 주제 순서이므로 그대로 순회해 그리면 된다.

## 고급 API

자기 `Host` 인스턴스를 만들어 plugin/번들 설치를 직접 통제하려는 호스트를 위해 코어
진입점도 재노출한다.

```ts
import {
  createHost,
  runBundle,
  bootstrapAperi21,
  BundleExtension,
  parseBundleRaw,
} from '@aperi21/host-tiptap-bundle';
```

## 0.1.0 에서 옮겨 오기

0.2.0 은 breaking 이다. 다섯을 고친다. 전체 변경은
[CHANGELOG](https://github.com/ibare/aperi21/blob/main/CHANGELOG.md) 에 있다.

1. **`@aperi21/host` 를 함께 설치한다.** 0.1.0 은 런타임을 번들 안에 품었고, 이제는
   peer 다 (위 「peerDependencies」).
2. **옛 조각 id 셋을 바꿔 쓴다.** 별칭이 없어 저장된 글의 옛 토큰은 오류 표시로 뜬다.

   | 0.1.0 | 0.2.0 에서 가까운 조각 |
   | --- | --- |
   | `{aperi21:projectile}` | `projectile-range` · `range-and-surface-gravity` · `projectile-in-wind` |
   | `{aperi21:ray-tracing}` | `thin-lens` · `focal-length` |
   | `{aperi21:dc-circuit}` | `series-parallel-resistors` |

3. **`getAperi21Catalog()` 를 `await getAperi21Catalog(locale)` 로.** 배열 대신
   `{ locale, domains, entries }` 가 오고, `title` · `description` 은 `{ ko, en }` 이 아니라
   그 언어의 문자열이다.
4. **`domain` 값을 11분과 id 로.** 옛 `mechanics` 같은 값은 없다. 이름표는
   `catalog.domains` 에서 찾는다.
5. **`renderBundleMarkdown` 이 없어졌다.** 마크다운 변환은 호스트의 몫이다. 호스트의
   마크다운 파이프라인에서 `{aperi21:<id>}` 토큰을
   `<span data-aperi21="true" data-aperi21-id="aperi21:<id>"></span>` 로 바꿔 에디터에
   넘기면 확장이 그 자리를 시각화로 읽는다. 코드 안의 토큰은 바꾸지 않는다.

## 라이선스

[MIT](./LICENSE) © Mintae Kim
