/* eslint-disable @typescript-eslint/no-explicit-any */
import QueryString from "qs";

export async function fetchAPI(query: any, options: { variables?: any } = {}) {
  const { variables } = options;

  try {
    const res = await fetch(`https://web-backend.wirewire.de/api/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables,
      }),
      // next: { revalidate: 1 },
    });

    const json = await res.json();

    /*if (json.errors) {
    throw new Error("Failed to fetch API Error:", json);
  }*/
    return json.data;
  } catch (error) {
    console.log(error);
  }
}

export async function fetchAPIRest(path: any) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API}/${path}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // next: { revalidate: 3600 },
    });

    const json = await res.json();
    if (json.errors) {
      console.error(`${process.env.NEXT_PUBLIC_API}/${path}`);
      throw new Error(
        "Failed to fetch API Error:"
        // `${process.env.NEXT_PUBLIC_API}/${path}`
      );
    }

    return json;
  } catch (error) {
    console.log(error);
  }
}

export async function getArticles(lng?: string) {
  const data = await fetchAPIRest(`pages?limit=1000&locale=${lng}`);
  return data;
}

export async function getTags(lng?: string) {
  const data = await fetchAPIRest(`tags?limit=1000&locale=${lng}`);
  return data;
}

export async function getTranslationsByNamespace(
  namespace: string,
  lng: string
) {
  const data = await fetchAPIRest(
    `translations?limit=1000&where%5Bnamespace%5D%5Bequals%5D=${namespace}&locale=${lng}`
  );
  return data;
}

export async function createMissingTranslation({
  content,
  namespace,
  language,
  key,
}: any) {
  const data = await fetch(
    `${process.env.NEXT_PUBLIC_API}/translations/create-missing`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        key,
        content: content ? content : key,
        namespace,
        language,
      }),
    }
  );
  return data;
}

export async function getArticle(
  slug: string,
  draft: boolean = false,
  lng: string = "de"
) {
  const query = {
    slug: {
      equals: slug,
    },
  };

  const stringifiedQuery = QueryString.stringify(
    {
      depth: 5,
      locale: lng,
      draft: draft ? true : false,
      showHiddenFields: true,
      where: query, // ensure that `qs` adds the `where` property, too!
    },
    { addQueryPrefix: true }
  );

  const pages = await fetchAPIRest(`pages${stringifiedQuery}`);

  const page = pages.docs.find((doc: any) =>
    doc.slug === slug &&
    doc.hero.tags &&
    doc.hero.tags.find((t: any) => t.tag?.title === "paperlesspaper")
      ? true
      : false
  );
  return page;
}

export async function getArticleRaw(
  id: string,
  draft: boolean = false,
  lng: string = "de"
) {
  const query = {
    id: {
      equals: id,
    },
  };

  const stringifiedQuery = QueryString.stringify(
    {
      depth: 5,
      locale: lng,
      draft: draft ? true : false,
      showHiddenFields: true,
      where: query, // ensure that `qs` adds the `where` property, too!
    },
    { addQueryPrefix: true }
  );

  const pages = await fetchAPIRest(`pages${stringifiedQuery}`);

  const page = pages.docs.find((doc: any) => doc.id === id);
  return page;
}

export async function getAllSlugsInLanguages() {
  const page = await fetchAPIRest(`pages?locale=all&depth=0`);

  return page.docs.map((doc: any) => doc.slug);
}

export async function getPageSlugInLanguages(id: string) {
  const page = await fetchAPIRest(`pages/${id}?locale=all&depth=0`);

  return page.slug;
}

export async function getOptions({ slug }: any) {
  const data = await fetchAPIRest(`globals/${slug}`);

  return data;
}
