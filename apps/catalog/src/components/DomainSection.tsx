import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Domain } from '../types/catalog';
import { implementedCount } from '../data/catalog';
import styles from './DomainSection.module.css';

interface DomainSectionProps {
  domain: Domain;
  accentIndex: number;
  defaultOpen?: boolean;
}

/**
 * 한 분과의 주제 목록.
 *
 * 분과는 **열거의 비계**지 사용법이 아니다 — 글은 도메인을 보지 않고 주제 목록
 * 전체에서 집어간다. 여기서 분과로 묶는 것은 사람이 훑기 위해서다.
 */
export function DomainSection({
  domain,
  accentIndex,
  defaultOpen = false,
}: DomainSectionProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(defaultOpen);

  const total = domain.topics.length;
  const done = implementedCount(domain);

  return (
    <section
      className={styles.category}
      data-state={open ? 'open' : 'closed'}
      data-accent={accentIndex}
    >
      <button
        type="button"
        className={styles.head}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className={styles.marker} aria-hidden="true" />
        <span className={styles.label}>{domain.name}</span>
        <span className={styles.count}>{t('badges.count_topics', { count: total })}</span>
        <span className={styles.ratio}>{t('badges.ratio', { done, total })}</span>
        <span className={styles.chevron} aria-hidden="true">
          {open ? '−' : '+'}
        </span>
      </button>

      {open && (
        <ul className={styles.topicList}>
          {domain.topics.map((topic) => (
            <li key={topic.id} className={styles.topicItem}>
              <Link to={`/topic/${topic.id}`} className={styles.topicLink}>
                <span className={styles.topicName}>{topic.name}</span>
                <span className={styles.topicDesc}>{topic.desc}</span>
                {topic.simId && (
                  <span className={styles.topicBadge}>{t('badges.implemented')}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
