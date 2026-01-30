import { defaultLocale, type Locale } from "./i18n";

const normalizeBaseUrl = (value: string) => value.replace(/\/+$/, "");

export const getBaseUrl = () =>
  normalizeBaseUrl(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000");

const normalizePath = (path: string) => {
  if (!path) {
    return "";
  }
  return `/${path.replace(/^\/+/, "")}`;
};

export const getCanonicalUrl = (locale: Locale, path = "") =>
  `${getBaseUrl()}/${locale}${normalizePath(path)}`;

export const getAlternateLanguages = (path = "") => {
  const normalizedPath = normalizePath(path);
  const baseUrl = getBaseUrl();

  return {
    en: `${baseUrl}/en${normalizedPath}`,
    es: `${baseUrl}/es${normalizedPath}`,
    "x-default": `${baseUrl}/${defaultLocale}${normalizedPath}`,
  } as const;
};

export const getOpenGraphLocale = (locale: Locale) =>
  locale === "es" ? "es_ES" : "en_US";
