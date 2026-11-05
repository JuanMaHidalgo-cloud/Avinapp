import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext.jsx';
import { Button } from '@/components/ui/button';

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'es' ? 'en' : 'es');
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="lang-switcher-btn font-medium tracking-wide w-12"
      aria-label="Toggle language"
    >
      <span className={`transition-opacity duration-200 ${language === 'es' ? 'opacity-100 font-bold' : 'opacity-50'}`}>ES</span>
      <span className="mx-1 opacity-20">|</span>
      <span className={`transition-opacity duration-200 ${language === 'en' ? 'opacity-100 font-bold' : 'opacity-50'}`}>EN</span>
    </Button>
  );
};

export default LanguageSwitcher;