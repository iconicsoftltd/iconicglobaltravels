/* eslint-disable react-refresh/only-export-components */
"use client"
import {
  type FC,
  type ReactNode,
  createContext,
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { useTranslation } from "react-i18next";

type Locale = "en" | "bn";

const isLocale = (value: unknown): value is Locale => {
  return value === "en" || value === "bn";
};

export interface ILocaleContextProps {
  locale: Locale;
  setLocale: Dispatch<SetStateAction<Locale>>;
}

export const LocaleContext = createContext<ILocaleContextProps | undefined>(
  undefined
);

interface ILocaleWrapperProps {
  children: ReactNode;
}

export const LocaleProvider: FC<ILocaleWrapperProps> = ({ children }) => {
  const { i18n } = useTranslation();
  const [locale, setLocale] = useState<Locale>(() => {
    const initialLocale = i18n.language?.toString();
    return isLocale(initialLocale) ? initialLocale : "en";
  });

  useEffect(() => {
    setLocale(
      i18n.language?.toLowerCase() === "en" ||
        i18n.language?.toLowerCase() === "en-us"
        ? "en"
        : i18n.language?.toLowerCase() === "bn"
        ? "bn"
        : "en"
    );
  }, [i18n.language]);

  const state = {
    locale,
    setLocale,
  };

  return (
    <LocaleContext.Provider value={state}>{children}</LocaleContext.Provider>
  );
};
