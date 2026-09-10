export function getCurrentLanguage(slug: string) {
  if (!slug) {
    return "en";
  }
  const language = slug.toLowerCase().split(/[-_]/)[0];

  return language.length === 2 ? language : "en";
}

