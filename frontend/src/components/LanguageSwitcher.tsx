import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

const languages: Language[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸'
  },
  {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    flag: '🇮🇳'
  }
];

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = async (languageCode: string) => {
    await i18n.changeLanguage(languageCode);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border-agriculture-green/20 hover:bg-agriculture-green/5"
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline text-sm">{currentLanguage.nativeName}</span>
        <span className="text-lg">{currentLanguage.flag}</span>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/10 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full mt-2 right-0 bg-white/95 backdrop-blur-md rounded-lg shadow-lg border border-gray-200 z-50 min-w-[160px]"
            >
              <div className="p-2">
                {languages.map((language) => {
                  const isSelected = language.code === i18n.language;
                  
                  return (
                    <motion.button
                      key={language.code}
                      onClick={() => handleLanguageChange(language.code)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors text-left",
                        isSelected
                          ? "bg-agriculture-green/10 text-agriculture-green"
                          : "hover:bg-gray-100 text-gray-700"
                      )}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="text-lg">{language.flag}</span>
                      <div className="flex-1">
                        <div className="font-medium">{language.nativeName}</div>
                        <div className="text-xs text-gray-500">{language.name}</div>
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-agriculture-green" />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};