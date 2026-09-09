import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Domain } from '../types/catalog';
import { implementedCount } from '../data/catalog';
import styles from './DomainSection.module.css';

interface DomainSectionProps {
  domain: Domain;
  /** 1부터 시작하는 분과 번호. 화면 왼쪽의 색인. */
  index: number;
  defaultOpen?: boolean;
}

/**
 * 한 분과의 주제 목록.
 *
 * 분과는 **열거의 비계**지 사용법이 아니다 — 글은 도메인을 보지 않고 주제 목록
 * 전체에서 집어간다. 여기서 분과로 묶는 것은 사람이 훑기 위해서다.
 */
export function DomainSection({ domain, index, defaultOpen = false }: DomainSectionProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(defaultOpen);

  const total = domain.topics.length;
  const done = implementedCount(domain);

  return (
    <section className={styles.category} data-state={open ? 'open' : 'closed'}>
      <button
        type="button"
        className={styles.header}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className={styles.index}>{String(index).padStart(2, '0')}</span>

        <span className={styles.titleBlock}>
          <span className={styles.title}>{domain.name}</span>
          <span className={styles.subtitle}>{t('badges.count_topics', { count: total })}</span>
        </span>

        <span className={styles.ratio}>
          <span className={styles.ratioDone}>{done}</span>
          <span className={styles.ratioSep}>/</span>
          <span className={styles.ratioTotal}>{total}</span>
        </span>

        <span className={styles.caret} aria-hidden="true">
          {open ? '−' : '+'}
        </span>
      </button>

      {open && (
        <div className={styles.body}>
          <ul className={styles.topicList}>
            {domain.topics.map((topic) => (
              <li key={topic.id}>
                <Link
                  to={`/topic/${topic.id}`}
                  className={styles.topicLink}
                  data-implemented={topic.simId ? 'true' : undefined}
                >
                  <span className={styles.topicName}>
                    {topic.name}
                    {topic.simId && (
                      <span className={styles.topicDot} aria-label={t('badges.implemented')} />
                    )}
                  </span>
                  <span className={styles.topicDesc}>{topic.desc}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
