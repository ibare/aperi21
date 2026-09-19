# @aperi21/host-tiptap-bundle

외부 호스트 앱(예: 노트 에디터)이 **단일 의존**으로 소비하는 self-contained ESM 번들이다.
[Tiptap](https://tiptap.dev) 확장 하나로, LLM이 생성한 설명문 안에 `{aperi21:<id>}` 토큰으로
끼어드는 인터랙티브 시각화(물리·전자·광학 sim)를 에디터에 렌더링한다.

`@aperi21/host-tiptap` + `@aperi21/bootstrap` + 모든 `sim-*` / `plugin-*`을 하나의 번들로
묶었으며, sim과 plugin은 동적 import 청크로 분리되어 **사용하는 시각화만 lazy 로드**된다.

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
| `theme`   | `'light' \| 'dark'`   | 시각화 테마.                             |

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
  renderBundleMarkdown,
} from '@aperi21/host-tiptap-bundle';
```

## 라이선스

[MIT](./LICENSE) © Mintae Kim
