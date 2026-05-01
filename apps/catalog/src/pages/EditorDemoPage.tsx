import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  BundleExtension,
  renderBundleMarkdown,
} from '@aperi21/host-tiptap';

/**
 * Phase 5 검증 페이지 — Tiptap 에디터 본문에 {aperi21:<id>} 토큰을 박아
 * 실제 시뮬레이션이 인라인 마운트되는 것을 확인한다.
 *
 * 검증 시나리오:
 *  - 페이지 로드 시 마크다운을 HTML 로 변환 후 Tiptap content 로 주입.
 *  - BundleExtension 의 NodeView 가 placeholder span 을 검출해 runBundle 호출.
 *  - aperi21:projectile / aperi21:ray-tracing / aperi21:dc-circuit 3종이 동시에 떠야 함.
 */
const DEFAULT_MARKDOWN = `# 시뮬레이션 인라인 데모

## 포물선 운동 (Projectile)

각도와 초속을 조절하면서 공의 궤적을 보자.

{aperi21:projectile}

## 광선 추적 (Ray Tracing)

거울/렌즈에 광선이 부딪히는 경로를 따라가 보자.

{aperi21:ray-tracing}

## DC 회로 (DC Circuit)

저항을 이리저리 바꾸며 분압비가 어떻게 변하는지 관찰.

{aperi21:dc-circuit}
`;

export function EditorDemoPage() {
  const [markdown, setMarkdown] = useState(DEFAULT_MARKDOWN);

  const html = useMemo(() => renderBundleMarkdown(markdown), [markdown]);

  const editor = useEditor(
    {
      editable: false,
      extensions: [
        StarterKit,
        BundleExtension.configure({ locale: 'ko', theme: 'light' }),
      ],
      content: html,
    },
    [html],
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
