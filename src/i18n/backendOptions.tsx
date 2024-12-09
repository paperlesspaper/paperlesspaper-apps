/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  createMissingTranslation,
  getTranslationsByNamespace,
} from "../lib/api";

export const loadResources = async (language: any, namespace: any) => {
  const response = await getTranslationsByNamespace(namespace, language);

  const results: any = {};
  if (response.docs) {
    response.docs.forEach((element: any) => {
      results[element.key] = element.translation[0].content;
    });
  }

  return results;
};

export const updateResources = async (
  language: any,
  namespace: any,
  url: any,
  options: any,
  payload: any
) => {
  console.log("create missing translation", payload, namespace, language, url);

  await createMissingTranslation({
    key: Object.entries(payload)[0][0],
    content: Object.entries(payload)[0][1],
    namespace: namespace,
    language: "en",
  });
};

export const backendOptions = {
  addPath: "{{lng}}|{{ns}}|add",
  loadPath: "{{lng}}|{{ns}}",
  request: (options: any, url: any, payload: any, callback: any) => {
    try {
      const [lng, ns, add] = url.split("|");

      if (add === "add") {
        updateResources(lng, ns, url, options, payload).then((response) => {
          callback(null, {
            data: JSON.stringify(response),
            status: 200,
          });
        });
      } else {
        loadResources(lng, ns).then((response) => {
          callback(null, {
            data: JSON.stringify(response),
            status: 200,
          });
        });
      }
    } catch (e) {
      console.log("error getting translations");
      callback(null, {
        status: 500,
      });
    }
  },
};
