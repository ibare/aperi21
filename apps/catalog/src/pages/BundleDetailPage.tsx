import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { catalog, findBundle } from '../data/catalog';
import { Badge } from '../components/Badge';
import styles from './BundleDetailPage.module.css';

export function BundleDetailPage() {
  const { t } = useTranslation();
  const { bundleId = '' } = useParams<{ bundleId: string }>();
  const bundle = findBundle(bundleId);

  if (!bundle) {
    return (
      <main className={`container ${styles.missing}`}>
        <Link to="/" className={styles.back}>
          {t('bundle_detail.back')}
        </Link>
        <p>{t('bundle_detail.not_found')}</p>
      </main>
    );
  }

  const categoryLabel = catalog.categories[bundle.category];
  const timeModelLabel = catalog.timeModels[bundle.timeModel];

  return (
    <main className={`container ${styles.page}`}>
      <Link to="/" className={styles.back}>
        {t('bundle_detail.back')}
      </Link>

      <header className={styles.header}>
        <div className={styles.crumbs}>
          <span>{categoryLabel}</span>
          <span className={styles.sep}>/</span>
          <code>{bundle.id}</code>
        </div>
        <h1 className={styles.title}>{bundle.label}</h1>
        <p className={styles.operation}>{bundle.operation}</p>

        <div className={styles.metaRow}>
          <Badge tone="accent">
            {t('sections.time_model')}: {timeModelLabel}
          </Badge>
          <Badge tone="mono">
            {t('badges.count_phenomena', { count: bundle.phenomena.length })}
          </Badge>
          <Badge tone="mono">
            ~{bundle.embedEstimate.min}–{bundle.embedEstimate.max} embeds
          </Badge>
        </div>
      </header>

      <section className={styles.placeholder} aria-live="polite">
        <div className={styles.placeholderInner}>
          <span className={styles.soonLabel}>SOON</span>
          <h2 className={styles.placeholderTitle}>
            {t('bundle_detail.placeholder_title')}
          </h2>
          <p className={styles.placeholderBody}>
            {t('bundle_detail.placeholder_body', { id: bundle.id })}
          </p>
        </div>
      </section>

      <div className={styles.grid}>
        <InfoBlock title={t('sections.phenomena')}>
          <ul className={styles.list}>
            {bundle.phenomena.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        </InfoBlock>

        {bundle.parameters.length > 0 && (
          <InfoBlock title={t('sections.parameters')}>
            <ul className={styles.defList}>
              {bundle.parameters.map((p) => (
                <li key={p.id}>
                  <code>{p.id}</code>
                  <span>{p.label}</span>
                  <em>{p.unit}</em>
                </li>
              ))}
            </ul>
          </InfoBlock>
        )}

        {bundle.stages.length > 0 && (
          <InfoBlock title={t('sections.stages')}>
            <ul className={styles.list}>
              {bundle.stages.map((s) => (
                <li key={s.id}>
                  <strong>{s.label}</strong>
                  {s.desc && <span className={styles.muted}> — {s.desc}</span>}
                </li>
              ))}
            </ul>
          </InfoBlock>
        )}

        {bundle.environments.length > 0 && (
          <InfoBlock title={t('sections.environments')}>
            <ul className={styles.list}>
              {bundle.environments.map((e) => (
                <li key={e.id}>
                  <strong>{e.label}</strong>
                  {e.desc && <span className={styles.muted}> — {e.desc}</span>}
                </li>
              ))}
            </ul>
          </InfoBlock>
        )}

        {bundle.notes && (
          <InfoBlock title="Notes">
            <p className={styles.notes}>{bundle.notes}</p>
          </InfoBlock>
        )}
      </div>
    </main>
  );
}

function InfoBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className={styles.block}>
      <h3 className={styles.blockTitle}>{title}</h3>
      {children}
    </section>
  );
}
