import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { BundleExtension } from '@aperi21/host-tiptap';
import { useHost } from '@aperi21/react';
import { renderBundleMarkdown } from './editor-demo-markdown';

/**
 * Phase 5 검증 페이지 — Tiptap 에디터 본문에 {aperi21:<id>} 토큰을 박아
 * 실제 시뮬레이션이 인라인 마운트되는 것을 확인한다.
 *
 * 검증 시나리오:
 *  - 페이지 로드 시 마크다운을 HTML 로 변환 후 Tiptap content 로 주입.
 *  - BundleExtension 의 NodeView 가 placeholder span 을 검출해 runBundle 호출.
 *  - 11분과에서 하나씩 고른 조각 11종이 한 문서에 동시에 떠야 함.
 *
 * 핵심: EngineProvider 가 optics/circuit plugin 을 설치한 host 를 useHost 로 꺼내
 * BundleExtension 에 주입한다. 이 host 가 NodeView→runBundle 까지 닿아야
 * plugin 의존 번들(thin-lens/series-parallel-resistors)의 renderer 가 채워진다.
 * 주입하지 않으면 runBundle 이 plugin 없는 host 를 새로 만들어 두 번들이 빈 화면으로 뜬다.
 * (외부 호스트는 동일 효과를 host-tiptap-bundle 의 createAperi21Extension 으로 얻는다.)
 */
const DEFAULT_MARKDOWN = `# 시뮬레이션 인라인 데모

## 운동학 — 사거리와 발사각

던지는 각도가 날아가는 거리를 바꾸는 방식.

{aperi21:projectile-range}

## 뉴턴 역학 — 빗면

중력을 면에 나란한 성분과 수직 성분으로 나눈다.

{aperi21:inclined-plane}

## 일·에너지·운동량 — 탄성 충돌

운동 에너지까지 보존되는 충돌.

{aperi21:elastic-collision}

## 회전과 진동 — 단진자

작은 진폭에서의 주기.

{aperi21:simple-pendulum}

## 중력과 천체 — 케플러 제2법칙

같은 시간에 같은 넓이를 쓸고 지나간다.

{aperi21:keplers-second-law}

## 유체 — 베르누이 원리

빨라진 만큼 압력이 내려간다.

{aperi21:bernoullis-principle}

## 열과 통계 — 이상 기체 법칙

압력·부피·온도의 관계.

{aperi21:ideal-gas-law}

## 파동과 음향 — 도플러 효과

원천이 방출점을 밀고 가 앞쪽 간격이 좁아진다.

{aperi21:doppler-effect}

## 광학 — 얇은 렌즈

세 광선으로 상을 찾는다.

{aperi21:thin-lens}

## 전자기 — 저항의 직렬과 병렬

연결을 바꾸면 같은 전지가 내주는 전류가 달라진다.

{aperi21:series-parallel-resistors}

## 현대물리 — 광전 효과

빛의 입자성 증거.

{aperi21:photoelectric-effect}
`;

export function EditorDemoPage() {
  const [markdown, setMarkdown] = useState(DEFAULT_MARKDOWN);
  // EngineProvider 가 plugin(optics/circuit) 을 설치해 둔 host. 이걸 그대로 주입해
  // runBundle 이 같은 host 의 renderer 레지스트리를 쓰게 한다. theme 은 host 가 들고
  // 있으므로 catalog 의 light/dark 토글이 시뮬에도 자동 반영된다.
  const host = useHost();

  const html = useMemo(() => renderBundleMarkdown(markdown), [markdown]);

  const editor = useEditor(
    {
      editable: false,
      extensions: [
        StarterKit,
        BundleExtension.configure({ host, locale: 'ko' }),
      ],
      content: html,
    },
    [html, host],
  );

  useEffect(() => () => editor?.destroy(), [editor]);

  return (
    <main className="container" style={{ padding: '32px 24px', maxWidth: 880 }}>
      <Link to="/" style={{ textDecoration: 'none', fontSize: 14, color: '#888' }}>
        ← 홈으로
      </Link>
      <h1 style={{ marginTop: 16 }}>Tiptap 인라인 시뮬레이션 데모</h1>
      <p style={{ color: '#666', lineHeight: 1.6 }}>
        아래는 마크다운 본문에 <code>{'{aperi21:<id>}'}</code> 토큰을 박은 결과.
        호스트 에디터(Tiptap) 가 토큰 위치에 시뮬레이션 캔버스를 인라인 마운트한다.
      </p>

      <details style={{ margin: '16px 0', fontSize: 13 }}>
        <summary style={{ cursor: 'pointer', color: '#444' }}>마크다운 원문 편집</summary>
        <textarea
          value={markdown}
          onChange={(e) => setMarkdown(e.target.value)}
          style={{
            width: '100%',
            minHeight: 200,
            marginTop: 8,
            padding: 8,
            fontFamily: 'monospace',
            fontSize: 13,
            border: '1px solid #ddd',
            borderRadius: 6,
          }}
        />
      </details>

      <article
        className="aperi21-editor-demo"
        style={{
          marginTop: 24,
          lineHeight: 1.7,
        }}
      >
        <EditorContent editor={editor} />
      </article>
    </main>
  );
}
