import { useSearchParams } from "next/navigation";

export default function useCurrentLanguage() {
  const searchParams = useSearchParams();

  const language = searchParams.get("language") || "en";

  return { language };
}

export { getCurrentLanguage } from "./language";

export function getSlugWithoutLanguage(slug: string[]): string[] {
  return slug[0].length === 2 ? slug.slice(1) : slug;
}
