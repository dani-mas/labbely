import Link from "next/link";
import { getTranslations } from "next-intl/server";

import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function Home({ params }: HomePageProps) {
  const t = await getTranslations("Home");
  const resolvedParams = await params;
  const locale = resolvedParams.locale;

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12 text-slate-900">
      <div className="absolute right-6 top-6">
        <LanguageSwitcher />
      </div>
      <Card className="w-full max-w-3xl">
        <CardHeader className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            {t("brand")}
          </p>
          <CardTitle className="text-3xl">{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button asChild>
              <Link href={`/${locale}/login`}>{t("ctaLogin")}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/${locale}/app`}>{t("ctaApp")}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
