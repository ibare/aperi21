import { useTranslation } from 'react-i18next';
import {
  catalog,
  bundlesByCategory,
  IMPLEMENTED_BUNDLE_IDS,
} from '../data/catalog';
import { CATEGORY_ORDER } from '../types/catalog';
import { CategorySection } from '../components/CategorySection';
import styles from './HomePage.module.css';

export function HomePage() {
  const { t } = useTranslation();

  const implementedCount = IMPLEMENTED_BUNDLE_IDS.size;
  const plannedCount = catalog.summary.totalBundles - implementedCount;
  const { min, max } = catalog.summary.totalEmbedEstimate;

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
            <strong>{implementedCount}</strong>
            <span>{t('hero.stat_implemented')}</span>
          </span>
          <span className={styles.stat}>
            <strong>{plannedCount}</strong>
            <span>{t('hero.stat_planned')}</span>
          </span>
          <span className={styles.statMono}>
            <span>{t('hero.stat_embeds', { min, max })}</span>
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
          {CATEGORY_ORDER.map((id) => (
            <CategorySection
              key={id}
              id={id}
              label={catalog.categories[id]}
              bundles={bundlesByCategory(id)}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
