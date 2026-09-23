import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Domain, Topic } from '../types/catalog';
import { implementedCount, isViewable } from '../data/catalog';
import styles from './DomainSection.module.css';

interface DomainSectionProps {
  domain: Domain;
  /** 1부터 시작하는 분과 번호. 화면 왼쪽의 색인. */
  index: number;
  /** 펼친 채로 연다. 훑는 화면이라 접힘은 독자가 고르는 것이지 기본이 아니다. */
  defaultOpen?: boolean;
  /** 구현물이 있는 주제를 눌렀을 때. 목록에서 바로 띄워 하나씩 확인한다. */
  onOpenSim(topic: Topic): void;
}

/**
 * 한 분과의 주제 목록.
 *
 * 분과는 **열거의 비계**지 사용법이 아니다 — 글은 도메인을 보지 않고 주제 목록
 * 전체에서 집어간다. 여기서 분과로 묶는 것은 사람이 훑기 위해서다.
 */
export function DomainSection({
  domain,
  index,
  defaultOpen = true,
  onOpenSim,
}: DomainSectionProps) {
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
            {domain.topics.map((topic) => {
              const inner = (
                <>
                  <span className={styles.topicName}>
                    {topic.name}
                    {isViewable(topic) && (
                      <span
                        className={styles.topicDot}
                        data-lab={topic.labUrl && !topic.simId ? 'true' : undefined}
                        aria-label={t('badges.implemented')}
                      />
                    )}
                  </span>
                  <span className={styles.topicDesc}>{topic.desc}</span>
                  <code className={styles.topicId}>{topic.id}</code>
                </>
              );

              return (
                <li key={topic.id}>
                  {isViewable(topic) ? (
                    // 구현물은 목록 자리에서 바로 띄운다 — 이동하면 하나씩 확인하는
                    // 흐름이 뒤로 가기로 끊긴다.
                    <button
                      type="button"
                      className={styles.topicLink}
                      data-implemented="true"
                      onClick={() => onOpenSim(topic)}
                    >
                      {inner}
                    </button>
                  ) : (
                    <Link to={`/topic/${topic.id}`} className={styles.topicLink}>
                      {inner}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
