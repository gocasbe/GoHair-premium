import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';
import 'dayjs/locale/en';
import 'dayjs/locale/fr';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type Lang = 'fr' | 'en';
export type Dict = Record<Lang, Record<string, string>>;

const KEY = 'lang';
const DEFAULT_LANG: Lang = 'fr';

type I18nValue = {
  lang: Lang;
  setLang: (l: Lang) => void;
  /** t('clé', { nom: 'valeur' }) remplace {nom} dans la traduction */
  t: (key: string, vars?: Record<string, string | number>) => string;
  /** prix : « 40 € » en français, « €40 » en anglais */
  money: (n: number) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ dict, children }: { dict: Dict; children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((v) => (v === 'fr' || v === 'en') && setLangState(v))
      .catch(() => {});
  }, []);

  // dayjs est global : on aligne sa locale avant chaque rendu
  dayjs.locale(lang);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    AsyncStorage.setItem(KEY, l).catch(() => {});
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      let out = dict[lang][key] ?? dict.en[key] ?? key;
      if (vars) for (const [k, v] of Object.entries(vars)) out = out.split(`{${k}}`).join(String(v));
      return out;
    },
    [dict, lang],
  );

  const money = useCallback((n: number) => (lang === 'fr' ? `${n} €` : `€${n}`), [lang]);

  const value = useMemo(() => ({ lang, setLang, t, money }), [lang, setLang, t, money]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n doit être utilisé dans <I18nProvider>');
  return ctx;
}
