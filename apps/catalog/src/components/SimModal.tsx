import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Embed } from '@aperi21/react';
import type { Bundle } from '@aperi21/schema';
import type { Topic } from '../types/catalog';
import styles from './SimModal.module.css';

interface SimModalProps {
  topic: Topic;
  /** 엔진 번들. 자립 HTML 조각이면 없다. */
  bundle?: Bundle;
  onClose(): void;
}

/**
 * 구현물을 큰 화면으로 띄우는 모달.
 *
 * 목록에서 하나씩 눌러 확인하는 용도라 **닫고 바로 다음 것을 열 수 있어야 한다** —
 * 상세 페이지로 이동하면 뒤로 가기가 끼어 흐름이 끊긴다.
 *
 * 마운트/언마운트가 곧 Embed 의 생성/파기다. Embed 는 자기 RAF 루프와 리스너를
 * 정리하므로(C5) 닫을 때 남는 것이 없다.
 */
export function SimModal({ topic, bundle, onClose }: SimModalProps) {
  const { t } = useTranslation();
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreRef = useRef<Element | null>(null);

  useEffect(() => {
    restoreRef.current = document.activeElement;
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);

    // 뒤 목록이 같이 스크롤되면 어디를 보고 있었는지 잃는다.
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      (restoreRef.current as HTMLElement | null)?.focus?.();
    };
  }, [onClose]);

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sim-modal-title"
      >
        <header className={styles.header}>
          <div className={styles.titleBlock}>
            <h2 id="sim-modal-title" className={styles.title}>
              {topic.name}
            </h2>
            <code className={styles.id}>{topic.simId ?? topic.labUrl}</code>
          </div>
          <button
            ref={closeRef}
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label={t('modal.close')}
          >
            ✕
          </button>
        </header>

        <div className={styles.body}>
          {bundle ? (
            <Embed bundle={bundle} />
          ) : (
            // 엔진 밖에서 만든 자립 조각. 격리해 띄운다 — 이 조각들은 호스트의
            // theme·i18n·시계를 쓰지 않고 자기 것만 쓴다.
            <iframe
              className={styles.frame}
              src={`${import.meta.env.BASE_URL}${topic.labUrl}`}
              title={topic.name}
            />
          )}
        </div>
      </div>
    </div>
  );
}
