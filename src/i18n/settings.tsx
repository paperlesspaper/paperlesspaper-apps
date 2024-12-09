import { backendOptions } from "./backendOptions";

export const fallbackLng = "en";
export const languages = [fallbackLng, "de", "fr", "nl", "et", "se"];
export const defaultNS = "paperlesspaper-apps";

export function getOptions(lng = fallbackLng, ns = defaultNS) {
  return {
    //debug: true,
    // resources,
    supportedLngs: languages,
    fallbackLng,
    lng,
    fallbackNS: defaultNS,
    defaultNS,
    ns,
    backend: backendOptions,
    saveMissing: process.env.NODE_ENV === "production" ? false : true,
  };
}
