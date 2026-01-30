import type { MetadataRoute } from "next";

import { locales } from "@/lib/i18n";
import { getBaseUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getBaseUrl();
  const routes = ["", "/login", "/app"];

  return locales.flatMap((locale) =>
    routes.map((route) => ({
      url: `${baseUrl}/${locale}${route}`,
      lastModified: new Date(),
      alternates: {
        languages: {
          en: `${baseUrl}/en${route}`,
          es: `${baseUrl}/es${route}`,
        },
      },
    })),
  );
}
