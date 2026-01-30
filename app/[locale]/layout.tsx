import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";

import { defaultLocale, isLocale, locales } from "@/lib/i18n";

const getBaseUrl = () =>
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

type LocaleLayoutProps = Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LocaleLayoutProps): Promise<Metadata> {
  const resolvedParams = await params;
  const locale = isLocale(resolvedParams.locale) ? resolvedParams.locale : defaultLocale;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const baseUrl = getBaseUrl();

  return {
    metadataBase: new URL(baseUrl),
    title: t("title"),
    description: t("description"),
    keywords: t("keywords").split(",").map((keyword) => keyword.trim()),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        en: "/en",
        es: "/es",
      },
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: `/${locale}`,
      siteName: "Labely",
      locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
    },
  };
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const resolvedParams = await params;
  console.log("🟢 LocaleLayout - params received:", resolvedParams);

  if (!isLocale(resolvedParams.locale)) {
    console.log("  ❌ Invalid locale, calling notFound()");
    notFound();
  }

  const locale = resolvedParams.locale;
  console.log("  ✅ Valid locale:", locale);
  
  const messages = await getMessages({ locale });
  console.log("  📦 Messages loaded, keys:", Object.keys(messages).slice(0, 5), "...");

  return (
    <NextIntlClientProvider key={locale} locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
