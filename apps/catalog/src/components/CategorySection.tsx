import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Bundle, CategoryId } from '../types/catalog';
import { catalog, isBundleImplemented } from '../data/catalog';
import { BundleSection } from './BundleSection';
import styles from './CategorySection.module.css';

interface CategorySectionProps {
  id: CategoryId;
  label: string;
  bundles: Bundle[];
  defaultOpen?: boolean;
}

const ACCENT_INDEX: Record<CategoryId, number> = {
  mechanics: 0,
  waves: 1,
  optics: 2,
  thermodynamics: 3,
  electromagnetism: 4,
  fluids: 5,
  modern: 6,
};

export function CategorySection({
  id,
  label,
  bundles,
  defaultOpen = true,
}: CategorySectionProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(defaultOpen);

  const totalPhenomena = bundles.reduce((n, b) => n + b.phenomena.length, 0);
  // 비율은 번들 단위로 계산 — 현상 수가 아닌 카테고리 내 구현 번들 / 전체 번들.
  const totalBundles = bundles.length;
  const readyBundles = bundles.reduce(
    (n, b) => (isBundleImplemented(b.id) ? n + 1 : n),
    0,
  );

  return (
    <section
      className={styles.category}
      data-state={open ? 'open' : 'closed'}
      data-accent-index={ACCENT_INDEX[id]}
    >
      <button
        type="button"
        className={styles.header}
        onClick={() => setOpen((p) => !p)}
        aria-expanded={open}
      >
        <span className={styles.index} aria-hidden="true">
          {String(ACCENT_INDEX[id] + 1).padStart(2, '0')}
        </span>
        <span className={styles.titleBlock}>
          <h2 className={styles.title}>{label}</h2>
          <span className={styles.subtitle}>
            {t('badges.count_bundles', { count: bundles.length })}
            <span className={styles.sep}>·</span>
            {t('badges.count_phenomena', { count: totalPhenomena })}
          </span>
        </span>
        <span className={styles.ratio}>
          <span className={styles.ratioDone}>{readyBundles}</span>
          <span className={styles.ratioSep}>/</span>
          <span className={styles.ratioTotal}>{totalBundles}</span>
        </span>
        <Caret open={open} />
      </button>

      <div className={styles.body} hidden={!open}>
        <div className={styles.bundles}>
          {bundles.map((bundle) => (
            <BundleSection
              key={bundle.id}
              bundle={bundle}
              timeModelLabel={catalog.timeModels[bundle.timeModel]}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function Caret({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
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
