import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'kn' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white font-medium"
      title={i18n.language === 'en' ? 'Switch to Kannada' : 'Switch to English'}
    >
      <Globe className="w-5 h-5" />
      <span>{i18n.language === 'en' ? 'KN' : 'EN'}</span>
    </button>
  );
}

export default LanguageSwitcher;
