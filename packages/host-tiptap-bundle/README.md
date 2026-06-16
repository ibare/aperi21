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

호스트의 Tiptap 인스턴스를 단일하게 유지하기 위해 아래는 호스트가 직접 설치한다.

```bash
npm install @tiptap/core@^3 @tiptap/pm@^3
```

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
| `locale`  | `string`              | `runBundle` 및 host의 언어 (예: `'ko'`). |
| `theme`   | `'light' \| 'dark'`   | 시각화 테마.                             |

## 카탈로그

시각화 모듈을 로드하지 않고 "추가 가능한 시각화 목록"을 검색·삽입 UI로 그릴 수 있는
경량 메타데이터를 제공한다.

```ts
import { getAperi21Catalog } from '@aperi21/host-tiptap-bundle';

const entries = getAperi21Catalog(); // [{ id, title, description?, domain }, ...]
```

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
