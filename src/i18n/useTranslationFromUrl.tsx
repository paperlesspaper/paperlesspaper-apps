/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams, useSearchParams } from "next/navigation";
import { useTranslation } from "./useClient";
import { getCurrentLanguage } from "./useCurrentLanguage";

interface TranslationResult {
  t: (key: string) => string;
  language: string;
  slug: string[];
}

export default function useTranslationFromUrl(
  topic: string = "paperlesspaper-apps"
): TranslationResult {
  const { slug }: any = useParams();

  const searchParams = useSearchParams();

  const language = (searchParams.get("language") as string) || "en-US";

  const languageCur = getCurrentLanguage(language);
  const { t } = useTranslation(languageCur, topic);

  return { t, language, slug };
}
