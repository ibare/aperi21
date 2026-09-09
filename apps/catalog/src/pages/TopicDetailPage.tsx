import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Embed } from '@aperi21/react';
import { domainOf, findTopic } from '../data/catalog';
import { MOCK_BUNDLES } from '../mocks/phase1-bundles';
import styles from './TopicDetailPage.module.css';

/**
 * 주제 상세.
 *
 * 주제는 **만들 시각화가 아니라 질문을 캘 맥락**이다. 구현된 것이 있으면 그것을
 * 마운트하고, 없으면 없다고 적는다 — "곧 공개" 같은 약속을 하지 않는다. 그 약속이
 * 목록을 위시리스트로 만든다.
 */
export function TopicDetailPage() {
  const { topicId } = useParams<{ topicId: string }>();
  const { t } = useTranslation();

  const topic = topicId ? findTopic(topicId) : undefined;
  if (!topic) {
    return (
      <main className={`container ${styles.page}`}>
        <p className={styles.notFound}>{t('topic_detail.not_found')}</p>
        <Link to="/" className={styles.back}>
          {t('topic_detail.back')}
        </Link>
      </main>
    );
  }

  const domain = domainOf(topic.id);
  const bundle = topic.simId ? MOCK_BUNDLES[topic.simId] : undefined;

  return (
    <main className={`container ${styles.page}`}>
      <Link to="/" className={styles.back}>
        {t('topic_detail.back')}
      </Link>

      <header className={styles.header}>
        <div className={styles.meta}>
          {domain && <span className={styles.domain}>{domain.name}</span>}
          <code>{topic.id}</code>
        </div>
        <h1 className={styles.title}>{topic.name}</h1>
        <p className={styles.operation}>{topic.desc}</p>
      </header>

      {bundle ? (
        <section className={styles.embedSection}>
          <Embed bundle={bundle} />
          <p className={styles.embedNote}>
            <code>{topic.simId}</code>
          </p>
        </section>
      ) : (
        <section className={styles.placeholder}>
          <h2 className={styles.placeholderTitle}>{t('topic_detail.no_sim_title')}</h2>
          <p className={styles.placeholderBody}>{t('topic_detail.no_sim_body')}</p>
        </section>
      )}
    </main>
  );
}
