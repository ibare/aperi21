import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Embed } from '@aperi21/react';
import { domainOf, findTopic } from '../data/catalog';
import { useSimBundle } from '../hooks/useSimBundle';
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
  // 훅은 early return 앞에 둔다. 조각은 레지스트리에서 온다 — 실제 소비자와 같은 경로.
  const bundle = useSimBundle(topic?.simId);
  // 검사 전용 — `#/topic/<id>?t=3` 으로 열면 그 시각에서 멈춘다 (scripts/piece-report.mts --sims).
  const [search] = useSearchParams();
  const tParam = search.get('t');
  const inspectAt = tParam !== null && Number.isFinite(Number(tParam)) ? Number(tParam) : undefined;

  if (!topic) {
    return (
      <main className={`container ${styles.page}`}>
        <p className={styles.missing}>{t('topic_detail.not_found')}</p>
        <Link to="/" className={styles.back}>
          {t('topic_detail.back')}
        </Link>
      </main>
    );
  }

  const domain = domainOf(topic.id);

  return (
    <main className={`container ${styles.page}`}>
      <Link to="/" className={styles.back}>
        {t('topic_detail.back')}
      </Link>

      <header className={styles.header}>
        <div className={styles.crumbs}>
          {domain && (
            <>
              <span>{domain.name}</span>
              <span className={styles.sep}>/</span>
            </>
          )}
          <code>{topic.id}</code>
        </div>
        <h1 className={styles.title}>{topic.name}</h1>
        <p className={styles.operation}>{topic.desc}</p>
      </header>

      {bundle ? (
        <section className={styles.embed}>
          <Embed bundle={bundle} inspectAt={inspectAt} />
          <p className={styles.embedNote}>
            <code>{topic.simId}</code>
          </p>
        </section>
      ) : (
        <section className={styles.placeholder}>
          <div className={styles.placeholderInner}>
            <h2 className={styles.placeholderTitle}>{t('topic_detail.no_sim_title')}</h2>
            <p className={styles.placeholderBody}>{t('topic_detail.no_sim_body')}</p>
          </div>
        </section>
      )}
    </main>
  );
}
