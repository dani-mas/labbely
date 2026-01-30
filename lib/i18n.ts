export const locales = ["en", "es"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "es";

export const isLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value);

export const localePrefix: "always" | "as-needed" = "always";
