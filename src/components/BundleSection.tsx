import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Bundle } from '../types/catalog';
import { PhenomenonCard } from './PhenomenonCard';
import { isBundleImplemented } from '../data/catalog';
import styles from './BundleSection.module.css';

interface BundleSectionProps {
  bundle: Bundle;
  timeModelLabel: string;
  defaultOpen?: boolean;
}

export function BundleSection({
  bundle,
  timeModelLabel,
  defaultOpen = true,
}: BundleSectionProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(defaultOpen);
  const ready = isBundleImplemented(bundle.id);

  return (
    <article
      className={styles.bundle}
      data-state={open ? 'open' : 'closed'}
      data-ready={ready ? 'yes' : 'no'}
    >
      <button
        type="button"
        className={styles.header}
        onClick={() => setOpen((p) => !p)}
        aria-expanded={open}
      >
        <span className={styles.dot} aria-hidden="true" />
        <span className={styles.headline}>
          <span className={styles.label}>{bundle.label}</span>
          <span className={styles.count}>
            {t('badges.count_phenomena', { count: bundle.phenomena.length })}
          </span>
        </span>
        <span className={styles.meta}>
          <span className={styles.operation}>{bundle.operation}</span>
          <span className={styles.sep}>·</span>
          <span className={styles.timeModel}>{timeModelLabel}</span>
        </span>
        <Caret open={open} />
      </button>

      <div className={styles.body} hidden={!open}>
        <div className={styles.grid}>
          {bundle.phenomena.map((phenomenon) => (
            <PhenomenonCard
              key={phenomenon}
              name={phenomenon}
              bundleId={bundle.id}
              bundleLabel={bundle.label}
              implemented={ready}
            />
          ))}
        </div>
      </div>
    </article>
  );
}

function Caret({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={styles.caret}
      style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
