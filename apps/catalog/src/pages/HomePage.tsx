import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { catalog, domains } from '../data/catalog';
import type { Topic } from '../types/catalog';
import { DomainSection } from '../components/DomainSection';
import { SimModal } from '../components/SimModal';
import { useSimBundle } from '../hooks/useSimBundle';
import styles from './HomePage.module.css';

export function HomePage() {
  const { t } = useTranslation();
  const { topics, implemented } = catalog.summary;
  // 모달은 한 개만 둔다. 분과마다 갖고 있으면 열린 것이 둘이 될 수 있다.
  const [openTopic, setOpenTopic] = useState<Topic | null>(null);
  const openBundle = useSimBundle(openTopic?.simId) ?? undefined;

  return (
    <main className={styles.page}>
      <section className={`container ${styles.hero}`}>
        <p className={styles.eyebrow}>{t('site.tagline')}</p>
        <h1 className={styles.title}>
          {t('hero.title_line1')}
          <br />
          <span className={styles.accent}>{t('hero.title_line2')}</span>
        </h1>
        <p className={styles.description}>{t('hero.description')}</p>

        <div className={styles.stats}>
          <span className={`${styles.stat} ${styles.statAccent}`}>
            <strong>{implemented}</strong>
            <span>{t('hero.stat_implemented')}</span>
          </span>
          <span className={styles.stat}>
            <strong>{topics}</strong>
            <span>{t('hero.stat_topics')}</span>
          </span>
          <span className={styles.statMono}>
            <span>{t('hero.stat_domains', { count: domains.length })}</span>
          </span>
        </div>
      </section>

      <section className={`container ${styles.catalog}`} aria-labelledby="catalog-heading">
        <div className={styles.catalogHeading}>
          <h2 id="catalog-heading" className={styles.catalogTitle}>
            {t('sections.catalog_heading')}
          </h2>
          <p className={styles.catalogSub}>{t('sections.catalog_description')}</p>
        </div>

        <div className={styles.categoryList}>
          {domains.map((domain, i) => (
            <DomainSection
              key={domain.id}
              domain={domain}
              index={i + 1}
              defaultOpen={i === 0}
              onOpenSim={setOpenTopic}
            />
          ))}
        </div>
      </section>

      {openTopic && (openBundle || openTopic.labUrl) && (
        <SimModal
          topic={openTopic}
          bundle={openBundle}
          onClose={() => setOpenTopic(null)}
        />
      )}
    </main>
  );
}
