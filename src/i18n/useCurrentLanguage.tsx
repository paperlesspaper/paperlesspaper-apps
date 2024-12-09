import { useSearchParams } from "next/navigation";

export default function useCurrentLanguage() {
  const searchParams = useSearchParams();

  const language = searchParams.get("language") || "en";

  return { language };
}

export function getCurrentLanguage(slug: string) {
  if (!slug) {
    return "en";
  }
  const language = slug.length === 2 ? slug : "en";

  return language;
}

export function getSlugWithoutLanguage(slug: string[]): string[] {
  return slug[0].length === 2 ? slug.slice(1) : slug;
}
