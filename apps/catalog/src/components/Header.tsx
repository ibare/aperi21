import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme/ThemeProvider';
import styles from './Header.module.css';

export function Header() {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  const handleLangToggle = () => {
    // 이번 단계에서 실제 언어 전환은 하지 않는다. 인프라만 준비.
    // eslint-disable-next-line no-console
    console.info('[aperi21] language toggle — 향후 시각화 컴포넌트와 함께 활성화');
  };

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link to="/" className={styles.brand} aria-label="aperi21 home">
          <span className={styles.mark} aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <circle cx="11" cy="11" r="9.5" stroke="currentColor" strokeWidth="1.25" />
              <circle cx="11" cy="11" r="2.2" fill="currentColor" />
              <path
                d="M2 11 Q 11 2, 20 11"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                fill="none"
                opacity="0.6"
              />
            </svg>
          </span>
          <span className={styles.wordmark}>
            <strong>aperi</strong>
            <em>21</em>
          </span>
        </Link>

        <nav className={styles.actions} aria-label="사이트 도구">
          <button
            type="button"
            className={styles.iconButton}
            onClick={toggleTheme}
            aria-label={
              theme === 'dark'
                ? t('header.toggle_theme_light')
                : t('header.toggle_theme_dark')
            }
            title={
              theme === 'dark'
                ? t('header.toggle_theme_light')
                : t('header.toggle_theme_dark')
            }
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
          <button
            type="button"
            className={styles.langButton}
            onClick={handleLangToggle}
            aria-label={t('header.toggle_language')}
            title={t('header.toggle_language')}
          >
            KO
          </button>
        </nav>
      </div>
    </header>
  );
}

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
      <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M12 3v2" />
        <path d="M12 19v2" />
        <path d="M3 12h2" />
        <path d="M19 12h2" />
        <path d="M5.6 5.6l1.4 1.4" />
        <path d="M17 17l1.4 1.4" />
        <path d="M5.6 18.4l1.4-1.4" />
        <path d="M17 7l1.4-1.4" />
      </g>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
