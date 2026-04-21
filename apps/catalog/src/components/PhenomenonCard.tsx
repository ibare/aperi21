import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './PhenomenonCard.module.css';

interface PhenomenonCardProps {
  name: string;
  bundleId: string;
  bundleLabel: string;
  implemented?: boolean;
}

export function PhenomenonCard({
  name,
  bundleId,
  bundleLabel,
  implemented = false,
}: PhenomenonCardProps) {
  const { t } = useTranslation();

  return (
    <Link
      to={`/bundle/${encodeURIComponent(bundleId)}`}
      className={`${styles.card} ${implemented ? styles.ready : styles.soon}`}
      aria-label={`${bundleLabel} — ${name}`}
    >
      <span className={styles.indicator} aria-hidden="true">
        {implemented ? <SparkIcon /> : <LockIcon />}
      </span>
      <span className={styles.title}>{name}</span>
      <span className={styles.tag}>{implemented ? t('badges.implemented') : t('badges.soon')}</span>
    </Link>
  );
}

function LockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 11V8a4 4 0 1 1 8 0v3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z" />
    </svg>
  );
}
