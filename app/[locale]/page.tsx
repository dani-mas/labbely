import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { defaultLocale, isLocale } from "@/lib/i18n";
import { getAlternateLanguages, getBaseUrl, getCanonicalUrl } from "@/lib/seo";
import {
  LandingNav,
  LandingHero,
  LandingFeatures,
  LandingHowItWorks,
  LandingOdoo,
  LandingUseCases,
  LandingOpenSource,
  LandingFooter,
} from "@/components/landing";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const locale = isLocale(resolvedParams.locale) ? resolvedParams.locale : defaultLocale;
  const canonicalUrl = getCanonicalUrl(locale);

  return {
    alternates: {
      canonical: canonicalUrl,
      languages: getAlternateLanguages(),
    },
    openGraph: {
      url: canonicalUrl,
    },
  };
}

export default async function Home({ params }: HomePageProps) {
  const resolvedParams = await params;
  const locale = isLocale(resolvedParams.locale) ? resolvedParams.locale : defaultLocale;
  const t = await getTranslations({ locale, namespace: "Home" });
  const tCommon = await getTranslations({ locale, namespace: "Common" });
  const tMetadata = await getTranslations({ locale, namespace: "Metadata" });
  const logoSrc =
    process.env.NODE_ENV === "development"
      ? `/brand/labbely-logo.png?ts=${Date.now()}`
      : "/brand/labbely-logo.png";
  const baseUrl = getBaseUrl();
  const canonicalUrl = getCanonicalUrl(locale);
  const organizationId = `${baseUrl}/#organization`;
  const websiteId = `${baseUrl}/#website`;
  const webPageId = `${canonicalUrl}#webpage`;
  const softwareId = `${baseUrl}/#software`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": organizationId,
        name: "Labbely",
        url: baseUrl,
        logo: `${baseUrl}/brand/labbely-icon.png`,
        sameAs: ["https://github.com/dani-mas/labbely"],
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        name: "Labbely",
        url: baseUrl,
        inLanguage: locale,
        publisher: { "@id": organizationId },
      },
      {
        "@type": "WebPage",
        "@id": webPageId,
        url: canonicalUrl,
        name: tMetadata("title"),
        description: tMetadata("description"),
        inLanguage: locale,
        isPartOf: { "@id": websiteId },
        about: { "@id": organizationId },
      },
      {
        "@type": "SoftwareApplication",
        "@id": softwareId,
        name: "Labbely",
        operatingSystem: "Web",
        applicationCategory: "BusinessApplication",
        url: canonicalUrl,
        description: tMetadata("description"),
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
        },
      },
    ],
  };

  const appHref = `/${locale}/app`;
  const loginHref = `/${locale}/login`;
  const githubHref = "https://github.com/dani-mas/labbely";
  const issuesHref = "https://github.com/dani-mas/labbely/issues";

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingNav
        logoSrc={logoSrc}
        locale={locale}
        navOpenLabel={t("navOpen")}
        homeAriaLabel={t("homeAriaLabel")}
        githubLabel={tCommon("github")}
        githubHref={githubHref}
        appHref={appHref}
      />

      <LandingHero
        locale={locale}
        heroTitle={t("heroTitle")}
        heroDescription={t("heroDescription")}
        heroCta={t("heroCta")}
        ctaLogin={t("ctaLogin")}
        heroNote={t("heroNote")}
        previewLabel={t("previewLabel")}
        floatingA4Title={t("floatingA4Title")}
        floatingA4Subtitle={t("floatingA4Subtitle")}
        floatingSyncTitle={t("floatingSyncTitle")}
        floatingSyncSubtitle={t("floatingSyncSubtitle")}
        floatingShortcutTitle={t("floatingShortcutTitle")}
        appHref={appHref}
        loginHref={loginHref}
      />

      <LandingFeatures
        title={t("featuresTitle")}
        subtitle={t("featuresSubtitle")}
        features={[
          {
            title: t("feature1Title"),
            description: t("feature1Description"),
            imageSrc:
              "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=400&h=300&fit=crop",
            imageAlt: t("feature1ImageAlt"),
            iconClassName: "bg-slate-100 text-slate-900 border-slate-200",
            iconKey: "printer",
          },
          {
            title: t("feature2Title"),
            description: t("feature2Description"),
            imageSrc:
              "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&h=300&fit=crop",
            imageAlt: t("feature2ImageAlt"),
            iconClassName: "bg-slate-100 text-slate-900 border-slate-200",
            iconKey: "search",
          },
          {
            title: t("feature3Title"),
            description: t("feature3Description"),
            imageSrc:
              "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop",
            imageAlt: t("feature3ImageAlt"),
            iconClassName: "bg-slate-100 text-slate-900 border-slate-200",
            iconKey: "zap",
          },
        ]}
      />

      <LandingHowItWorks
        processLabel={t("processLabel")}
        title={t("howItWorksTitle")}
        subtitle={t("howItWorksSubtitle")}
        steps={[
          {
            number: 1,
            title: t("step1Title"),
            description: t("step1Description"),
            stepNumberClassName: "bg-slate-900",
          },
          {
            number: 2,
            title: t("step2Title"),
            description: t("step2Description"),
            stepNumberClassName: "bg-slate-900",
          },
          {
            number: 3,
            title: t("step3Title"),
            description: t("step3Description"),
            stepNumberClassName: "bg-slate-900",
          },
        ]}
      />

      <LandingOdoo
        locale={locale}
        odooLabel={t("odooBadge")}
        title={t("odooTitle")}
        description={t("odooDescription")}
        features={[
          t("odooFeature1"),
          t("odooFeature2"),
          t("odooFeature3"),
        ]}
        docsLabel={t("odooDocsLabel")}
        badgeJsonRpc={t("odooBadgeJsonRpc")}
        badgeRest={t("odooBadgeRest")}
        requestLabel={t("odooRequestLabel")}
        responseLabel={t("odooResponseLabel")}
        methodLabel={t("odooMethodPost")}
        ctaLabel={t("odooLoginCta")}
        loginHref={loginHref}
      />

      <LandingUseCases
        title={t("useCasesTitle")}
        subtitle={t("useCasesSubtitle")}
        cases={[
          {
            title: t("useCase1Title"),
            description: t("useCase1Description"),
            imageSrc:
              "https://images.unsplash.com/photo-1553413077-190dd305871c?w=600&h=400&fit=crop",
            imageAlt: t("useCase1ImageAlt"),
            iconBgClass: "bg-slate-100 text-slate-900 border border-slate-200",
            iconKey: "package",
          },
          {
            title: t("useCase2Title"),
            description: t("useCase2Description"),
            imageSrc:
              "https://images.unsplash.com/photo-1556740758-90de374c12ad?w=600&h=400&fit=crop",
            imageAlt: t("useCase2ImageAlt"),
            iconBgClass: "bg-slate-100 text-slate-900 border border-slate-200",
            iconKey: "barChart3",
          },
        ]}
      />

      <LandingOpenSource
        locale={locale}
        badgeLabel={t("openSourceBadge")}
        title={t("openSourceTitle")}
        description={t("openSourceDescription")}
        primaryCta={t("openSourceCta")}
        secondaryCta={t("openSourceSecondaryCta")}
        credits={t("openSourceCredits")}
        githubHref={githubHref}
        appHref={appHref}
      />

      <LandingFooter
        logoSrc={logoSrc}
        locale={locale}
        homeAriaLabel={t("homeAriaLabel")}
        tagline={t("footerTagline")}
        productLabel={t("footerProduct")}
        editorLabel={t("footerEditor")}
        loginLabel={t("footerLogin")}
        developersLabel={t("footerDevelopers")}
        githubLabel={tCommon("github")}
        issuesLabel={t("footerIssues")}
        languageLabel={t("footerLanguage")}
        copyright={t("footerCopyright")}
        appHref={appHref}
        loginHref={loginHref}
        githubHref={githubHref}
        issuesHref={issuesHref}
      />
    </div>
  );
}
