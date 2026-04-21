import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './NotFoundPage.module.css';

export function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <main className={`container ${styles.page}`}>
      <div className={styles.inner}>
        <span className={styles.code}>404</span>
        <h1 className={styles.title}>{t('notfound.title')}</h1>
        <p className={styles.description}>{t('notfound.description')}</p>
        <Link to="/" className={styles.link}>
          {t('notfound.home_link')} →
        </Link>
      </div>
    </main>
  );
}
