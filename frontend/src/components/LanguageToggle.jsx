import { useTranslation } from 'react-i18next';

export default function LanguageToggle() {
  const { i18n } = useTranslation();
  const isZh = i18n.language === 'zh';

  return (
    <div className="lang-toggle">
      <button
        className={!isZh ? 'active' : ''}
        onClick={() => i18n.changeLanguage('en')}
      >EN</button>
      <button
        className={isZh ? 'active' : ''}
        onClick={() => i18n.changeLanguage('zh')}
      >中文</button>
    </div>
  );
}
