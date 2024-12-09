import { i18n, createInstance, TFunction } from "i18next";
import { initReactI18next } from "react-i18next/initReactI18next";
import { getOptions } from "./settings";

const initI18next = async (lng: string, ns: string): Promise<i18n> => {
  const i18nInstance = createInstance();
  await i18nInstance.use(initReactI18next).init(getOptions(lng, ns));
  return i18nInstance;
};

interface UseTranslationResult {
  t: TFunction;
  i18n: i18n;
}

export async function useTranslation(
  lng: string,
  ns: string,
  options: { keyPrefix?: string } = {}
): Promise<UseTranslationResult> {
  const i18nextInstance = await initI18next(lng, ns);
  return {
    t: i18nextInstance.getFixedT(
      lng,
      Array.isArray(ns) ? ns[0] : ns,
      options.keyPrefix
    ),
    i18n: i18nextInstance,
  };
}
